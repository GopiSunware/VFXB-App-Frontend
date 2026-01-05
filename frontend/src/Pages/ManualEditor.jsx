import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Download,
  Share2,
  ChevronDown,
  Settings,
  HelpCircle,
  Link2,
  Save,
  FolderOpen,
  Volume2,
  VolumeX,
  Pencil,
  Check,
  X,
  Copy,
  Wand2,
  Upload,
} from "lucide-react";

// Twick/VFXB Editor imports
import { LivePlayerProvider, useLivePlayerContext, PLAYER_STATE } from "@twick/live-player";
import { TwickStudio } from "@twick/studio";
import { TimelineProvider, useTimelineContext, INITIAL_TIMELINE_DATA, VideoElement } from "@twick/timeline";
import { saveAsFile, loadFile } from "@twick/media-utils";
import "@twick/studio/dist/studio.css";

// Global video store for sharing between editors
import useVideoStore from "../context/videoStore";

// Helper function to get canvas dimensions for aspect ratio
const getCanvasSizeForAspectRatio = (ratio) => {
  switch (ratio) {
    case "16:9":
      return { width: 1920, height: 1080 };
    case "9:16":
      return { width: 1080, height: 1920 };
    case "1:1":
      return { width: 1080, height: 1080 };
    case "4:5":
      return { width: 1080, height: 1350 };
    default:
      return { width: 1920, height: 1080 };
  }
};

// Custom controls component that injects into Twick's timeline controls bar via Portal
const CustomTimelineControls = ({ editorState, onVolumeChange, onMuteToggle, onDuplicate, previousVolume }) => {
  const [portalTarget, setPortalTarget] = useState(null);
  // Use ref to track current target for comparison without stale closure issues
  const portalTargetRef = useRef(null);

  // Find and attach to Twick's edit-controls container
  useEffect(() => {
    const findTarget = () => {
      // Find the edit-controls container where Delete, Split, Undo, Redo are
      const editControls = document.querySelector('.edit-controls');
      if (editControls) {
        // Only update if element changed or previous target was detached
        const currentTarget = portalTargetRef.current;
        const isCurrentAttached = currentTarget && document.body.contains(currentTarget);
        if (editControls !== currentTarget || !isCurrentAttached) {
          portalTargetRef.current = editControls;
          setPortalTarget(editControls);
        }
      }
    };

    // Try immediately
    findTarget();

    // Observe DOM changes in case Twick renders later or container is replaced
    // Scope to editor root for better performance instead of entire document.body
    const editorRoot = document.querySelector('.twick-studio') || document.querySelector('.manual-editor-fullscreen');
    if (editorRoot) {
      const observer = new MutationObserver(findTarget);
      observer.observe(editorRoot, { childList: true, subtree: true });
      return () => observer.disconnect();
    }
  }, []); // Empty dependency - observer callback handles updates via ref

  const controlsContent = (
    <>
      {/* Divider before our controls */}
      <div className="custom-control-divider"></div>

      {/* Duplicate button - right after undo/redo */}
      <button
        onClick={onDuplicate}
        disabled={!editorState.selectedItem}
        className={`custom-control-btn ${!editorState.selectedItem ? 'disabled' : ''}`}
        title="Duplicate (Ctrl+D)"
      >
        <Copy className="w-4 h-4" />
      </button>

      {/* Divider */}
      <div className="custom-control-divider"></div>

      {/* Volume controls */}
      <div className="custom-volume-controls">
        <button
          onClick={onMuteToggle}
          className="custom-control-btn"
          title={editorState.playerVolume > 0 ? "Mute" : "Unmute"}
        >
          {editorState.playerVolume > 0 ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={editorState.playerVolume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="custom-volume-slider"
          title={`Volume: ${Math.round(editorState.playerVolume * 100)}%`}
        />
      </div>
    </>
  );

  // Render via portal into Twick's controls, or null if target not found yet
  if (portalTarget) {
    return createPortal(controlsContent, portalTarget);
  }

  return null;
};

// Inner component that uses timeline and player context for all editor operations
// Uses ref-based state sync to avoid infinite re-render loops
const EditorWithContext = ({ studioConfig, canvasSize, editorStateRef, onVolumeChange, onMuteToggle, onDuplicate, previousVolume, restorePlaybackRef }) => {
  const {
    setVideoResolution,
    editor,
    present,
    canUndo,
    canRedo,
    selectedItem
  } = useTimelineContext();

  const {
    playerVolume,
    setPlayerVolume,
    playerState,
    setPlayerState,
    currentTime
  } = useLivePlayerContext();

  // Update resolution when canvasSize changes (should be stable/fixed)
  React.useEffect(() => {
    setVideoResolution({ width: canvasSize.width, height: canvasSize.height });
  }, [canvasSize.width, canvasSize.height, setVideoResolution]);

  // Clear default "Twick SDK" element on first mount - timeline should start empty
  const hasCleared = React.useRef(false);
  React.useEffect(() => {
    if (editor && present && !hasCleared.current) {
      // Check if there are default tracks to clear (timeline or tracks array)
      const tracks = present?.timeline || present?.tracks || [];
      if (tracks.length > 0) {
        hasCleared.current = true;
        // Small delay to ensure editor is fully initialized
        const timer = setTimeout(() => {
          try {
            console.log("Clearing default tracks:", tracks);
            tracks.forEach(trackData => {
              if (trackData.id) {
                editor.removeTrackById(trackData.id);
              }
            });
            // Also try to reset the timeline data directly if available
            if (editor.setTimelineData) {
              editor.setTimelineData({ tracks: [], updatePlayerData: true });
            }
          } catch (error) {
            console.warn("Error clearing default timeline:", error);
          }
        }, 200);
        return () => clearTimeout(timer);
      }
    }
  }, [editor, present]);

  // Track previous canvas size to detect aspect ratio changes
  const prevCanvasSizeRef = React.useRef({ width: canvasSize.width, height: canvasSize.height });

  // Handle aspect ratio change: update video elements and restore playback
  React.useEffect(() => {
    const prevSize = prevCanvasSizeRef.current;
    const sizeChanged = prevSize.width !== canvasSize.width || prevSize.height !== canvasSize.height;

    if (sizeChanged && editor) {
      // Resolution changed - update video elements through the present timeline data
      const timer = setTimeout(() => {
        try {
          // Access tracks through present.timeline (the actual data structure)
          const tracks = present?.timeline || [];
          tracks.forEach(trackData => {
            if (trackData.id) {
              const track = editor.getTrackById(trackData.id);
              if (track) {
                const elements = track.getElements ? track.getElements() : [];
                elements.forEach(element => {
                  if (element.setParentSize && typeof element.setParentSize === 'function') {
                    element.setParentSize({ width: canvasSize.width, height: canvasSize.height });
                  }
                });
              }
            }
          });
        } catch (error) {
          console.warn("Error updating element sizes after resolution change:", error);
        }

        // Restore playback if it was playing before the change
        if (restorePlaybackRef?.current && setPlayerState) {
          setPlayerState(PLAYER_STATE.PLAYING);
          restorePlaybackRef.current = false;
        }
      }, 200);

      // Update prev size ref
      prevCanvasSizeRef.current = { width: canvasSize.width, height: canvasSize.height };

      return () => clearTimeout(timer);
    }
  }, [canvasSize.width, canvasSize.height, editor, present, setPlayerState, restorePlaybackRef]);

  // Sync all editor state to parent's ref (no re-renders, just ref updates)
  // This runs on every render but only updates refs, not state
  editorStateRef.current = {
    canUndo,
    canRedo,
    editor,
    present,
    playerVolume,
    setPlayerVolume,
    playerState,
    setPlayerState,
    selectedItem,
    currentTime
  };

  // Create editorState object for CustomTimelineControls (reactive from context)
  const editorStateForControls = {
    playerVolume,
    selectedItem
  };

  return (
    <>
      <TwickStudio studioConfig={studioConfig} />
      <CustomTimelineControls
        editorState={editorStateForControls}
        onVolumeChange={onVolumeChange}
        onMuteToggle={onMuteToggle}
        onDuplicate={onDuplicate}
        previousVolume={previousVolume}
      />
    </>
  );
};

/*
 * Design System: Clipchamp Video Editor Style
 * Based on extracted design system from reference image
 *
 * Color Palette:
 * - Primary Purple: #7C3AED
 * - Deep Purple (hover): #6D28D9
 * - Bright Purple: #8B5CF6
 * - Primary Background: #1A1B1E
 * - Secondary Background: #25262B
 * - Tertiary Background: #2C2D33
 * - Timeline Background: #1F2024
 * - Panel Background: #212226
 * - Deep Black (canvas): #0D0D0F
 * - Primary Text: #FFFFFF
 * - Secondary Text: #A0A1A7
 * - Tertiary Text: #6B6C72
 * - Border Subtle: #2E2F35
 * - Border Medium: #3A3B42
 */

const customStyles = `
  /* ===== CSS Variables from Design System ===== */
  :root {
    --color-primary: #7C3AED;
    --color-primary-hover: #6D28D9;
    --color-primary-light: #8B5CF6;
    --color-bg-primary: #1A1B1E;
    --color-bg-secondary: #25262B;
    --color-bg-tertiary: #2C2D33;
    --color-bg-timeline: #1F2024;
    --color-bg-panel: #212226;
    --color-bg-canvas: #0D0D0F;
    --color-text-primary: #FFFFFF;
    --color-text-secondary: #A0A1A7;
    --color-text-tertiary: #6B6C72;
    --color-text-muted: #4A4B50;
    --color-border-subtle: #2E2F35;
    --color-border-medium: #3A3B42;
    --color-border-strong: #4A4B52;
    --color-success: #10B981;
    --color-error: #EF4444;
    --color-warning: #F59E0B;
    --color-info: #0EA5E9;
    --radius-sm: 4px;
    --radius-md: 6px;
    --radius-lg: 8px;
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.3);
    --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.4);
    --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
    --duration-fast: 150ms;
    --duration-normal: 200ms;
  }

  /* ===== Hide app's sidebar and header for fullscreen editor ===== */
  body:has(.manual-editor-fullscreen) aside[class*="w-64"],
  body:has(.manual-editor-fullscreen) > div > div > aside,
  body:has(.manual-editor-fullscreen) header[class*="fixed"] {
    display: none !important;
  }

  body:has(.manual-editor-fullscreen) > div > div {
    margin-left: 0 !important;
    padding-left: 0 !important;
  }

  body:has(.manual-editor-fullscreen) main[class*="pt-14"],
  body:has(.manual-editor-fullscreen) main[class*="pt-16"] {
    padding-top: 0 !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  /* ===== Twick Studio Design System Override ===== */
  .twick-studio {
    --twick-primary: var(--color-primary);
    --twick-secondary: var(--color-primary-light);
    --twick-accent: var(--color-primary);
    --twick-bg: var(--color-bg-primary);
    --twick-surface: var(--color-bg-secondary);
    --twick-border: var(--color-border-subtle);
    --twick-text: var(--color-text-primary);
    --twick-text-muted: var(--color-text-secondary);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  }

  /* ===== Hide Twick branding and watermark ===== */
  .twick-logo, .twick-brand, [class*="twick-watermark"],
  [class*="watermark"], [class*="Watermark"],
  .twick-studio [class*="sdk"], .twick-studio [class*="SDK"] {
    display: none !important;
    opacity: 0 !important;
    visibility: hidden !important;
  }

  /* ===== Scrollbar Styling ===== */
  .twick-studio ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  .twick-studio ::-webkit-scrollbar-track {
    background: transparent;
  }

  .twick-studio ::-webkit-scrollbar-thumb {
    background: var(--color-border-medium);
    border-radius: 3px;
  }

  .twick-studio ::-webkit-scrollbar-thumb:hover {
    background: var(--color-border-strong);
  }

  /* ===== Hide Twick Studio's header ===== */
  .twick-studio .studio-container > header.header {
    display: none !important;
  }

  /* ===== Left Icon Sidebar (wider to fit text) ===== */
  .twick-studio .sidebar,
  .twick-studio [class*="sidebar"] {
    background: var(--color-bg-panel) !important;
    border-right: 1px solid var(--color-border-subtle) !important;
    width: 72px !important;
    min-width: 72px !important;
  }

  /* Sidebar nav items - ensure icons AND text are visible */
  .twick-studio .sidebar button,
  .twick-studio [class*="sidebar"] button {
    width: 64px !important;
    height: auto !important;
    min-height: 52px !important;
    border-radius: var(--radius-lg) !important;
    margin: 2px 4px !important;
    padding: 6px 2px !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 2px !important;
    transition: all var(--duration-fast) var(--ease-standard) !important;
  }

  /* Ensure icons in sidebar are visible */
  .twick-studio .sidebar svg,
  .twick-studio [class*="sidebar"] svg,
  .twick-studio .sidebar button svg,
  .twick-studio [class*="sidebar"] button svg {
    width: 22px !important;
    height: 22px !important;
    display: block !important;
    opacity: 1 !important;
    visibility: visible !important;
    color: var(--color-text-secondary) !important;
    flex-shrink: 0 !important;
  }

  /* Sidebar text labels - fully visible */
  .twick-studio .sidebar span,
  .twick-studio [class*="sidebar"] span,
  .twick-studio .sidebar button span,
  .twick-studio [class*="sidebar"] button span {
    font-size: 9px !important;
    line-height: 1.1 !important;
    color: var(--color-text-tertiary) !important;
    text-align: center !important;
    display: block !important;
    white-space: nowrap !important;
    overflow: visible !important;
    max-width: 64px !important;
  }

  .twick-studio .sidebar button:hover,
  .twick-studio [class*="sidebar"] button:hover {
    background: var(--color-bg-tertiary) !important;
  }

  .twick-studio .sidebar button:hover svg,
  .twick-studio [class*="sidebar"] button:hover svg {
    color: var(--color-text-primary) !important;
  }

  .twick-studio .sidebar button:hover span,
  .twick-studio [class*="sidebar"] button:hover span {
    color: var(--color-text-primary) !important;
  }

  .twick-studio .sidebar button.active,
  .twick-studio [class*="sidebar"] button.active,
  .twick-studio .sidebar button[data-active="true"],
  .twick-studio [class*="sidebar"] button[data-active="true"] {
    background: var(--color-primary) !important;
  }

  .twick-studio .sidebar button.active svg,
  .twick-studio [class*="sidebar"] button.active svg,
  .twick-studio .sidebar button[data-active="true"] svg {
    color: var(--color-text-primary) !important;
  }

  .twick-studio .sidebar button.active span,
  .twick-studio [class*="sidebar"] button.active span,
  .twick-studio .sidebar button[data-active="true"] span {
    color: var(--color-text-primary) !important;
  }

  /* ===== Side Panels (280px per design system) ===== */
  .twick-studio .panel-container {
    width: 280px !important;
    min-width: 280px !important;
    max-width: 280px !important;
    flex-shrink: 0 !important;
    background: var(--color-bg-secondary) !important;
    border-right: 1px solid var(--color-border-subtle) !important;
  }

  /* Panel headers */
  .twick-studio .panel-header,
  .twick-studio [class*="panel-header"] {
    background: var(--color-bg-secondary) !important;
    border-bottom: 1px solid var(--color-border-subtle) !important;
    color: var(--color-text-primary) !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    padding: 12px 16px !important;
  }

  /* ===== Primary Buttons ===== */
  .twick-studio button[class*="primary"],
  .twick-studio .btn-primary {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%) !important;
    color: var(--color-text-primary) !important;
    border: none !important;
    border-radius: var(--radius-md) !important;
    padding: 10px 20px !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    box-shadow: 0 2px 8px rgba(124, 58, 237, 0.25) !important;
    transition: all var(--duration-normal) var(--ease-standard) !important;
  }

  .twick-studio button[class*="primary"]:hover,
  .twick-studio .btn-primary:hover {
    background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary) 100%) !important;
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.35) !important;
    transform: translateY(-1px) !important;
  }

  /* ===== Canvas/Preview Area ===== */
  .twick-studio .main-container {
    flex: 1 !important;
    min-width: 0 !important;
    overflow: hidden !important;
    background: var(--color-bg-canvas) !important;
    display: flex !important;
    flex-direction: column !important;
  }

  .twick-studio .canvas-wrapper {
    display: flex !important;
    flex: 1 1 0 !important;
    min-height: 0 !important;
    overflow: hidden !important;
    background: var(--color-bg-canvas) !important;
  }

  .twick-studio .canvas-container {
    display: flex !important;
    flex: 1 1 0 !important;
    flex-direction: column !important;
    min-height: 0 !important;
    height: 100% !important;
    overflow: hidden !important;
  }

  /* ===== Toolbar ===== */
  .twick-studio .toolbar,
  .twick-studio [class*="toolbar"] {
    background: var(--color-bg-primary) !important;
    border-bottom: 1px solid var(--color-border-subtle) !important;
    padding: 8px 12px !important;
  }

  /* ===== Timeline Section Layout (Clipchamp-style proportions) ===== */
  /* Main container must constrain to available height */
  .twick-studio .twick-editor-main-container {
    display: flex !important;
    flex-direction: column !important;
    height: 100% !important;
    max-height: 100% !important;
    overflow: hidden !important;
  }

  /* Canvas/view area - shrink to fit, let timeline have fixed space */
  .twick-studio .twick-editor-view-section {
    flex: 1 1 0 !important;
    min-height: 200px !important;
    overflow: hidden !important;
  }

  /* Canvas container inside view section */
  .twick-studio .twick-editor-canvas-container {
    background: var(--color-bg-canvas) !important;
    height: 100% !important;
  }

  /* Timeline section - fixed 220px like Clipchamp */
  .twick-studio .twick-editor-timeline-section {
    background: var(--color-bg-timeline) !important;
    border-top: 1px solid var(--color-border-subtle) !important;
    flex: 0 0 220px !important;
    height: 220px !important;
    min-height: 220px !important;
    max-height: 220px !important;
  }

  /* Timeline controls bar */
  .twick-studio .twick-editor-timeline-controls {
    background: var(--color-bg-primary) !important;
    height: 40px !important;
    min-height: 40px !important;
    flex-shrink: 0 !important;
  }

  /* Timeline tracks container - scrollable area for tracks */
  .twick-studio .twick-editor-timeline-tracks,
  .twick-studio [class*="timeline-tracks"],
  .twick-studio [class*="tracks-container"] {
    flex: 1 !important;
    overflow-y: auto !important;
    min-height: 120px !important;
  }

  /* Individual tracks - proper height like Clipchamp (~50px each) */
  .twick-studio .twick-track {
    background: var(--color-bg-primary) !important;
    min-height: 50px !important;
    height: 50px !important;
  }

  /* Track header styling */
  .twick-studio .twick-track-header {
    background: var(--color-bg-panel) !important;
    min-width: 100px !important;
  }

  /* Fix: Match seek track empty-space width to track header for proper playhead alignment */
  .twick-studio .twick-seek-track-empty-space {
    min-width: 100px !important;
  }

  /* Track elements (clips on timeline) */
  .twick-studio .twick-track-element {
    background: var(--color-border-medium) !important;
    border: 1px solid var(--color-border-strong) !important;
    border-radius: var(--radius-sm) !important;
  }

  .twick-studio .twick-track-element:hover {
    border-color: var(--color-primary) !important;
  }

  /* Playhead */
  .twick-studio .twick-seek-track-playhead,
  .twick-studio .twick-seek-track-pin {
    background: var(--color-text-primary) !important;
  }

  /* Time ruler area */
  .twick-studio .twick-seek-track,
  .twick-studio [class*="time-ruler"],
  .twick-studio [class*="seek-track"] {
    height: 30px !important;
    min-height: 30px !important;
    background: var(--color-bg-timeline) !important;
  }

  /* ===== Selected State ===== */
  .twick-studio .selected,
  .twick-studio [class*="selected"] {
    border-color: var(--color-primary) !important;
    box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.3) !important;
  }

  /* ===== Container Sizing ===== */
  .twick-studio .studio-container {
    height: 100% !important;
    max-height: calc(100vh - 48px) !important;
    background: var(--color-bg-primary) !important;
  }

  .twick-studio .studio-content {
    height: 100% !important;
    background: var(--color-bg-primary) !important;
  }

  .twick-studio {
    height: 100% !important;
    background: var(--color-bg-primary) !important;
  }

  /* ===== Playback Controls ===== */
  .twick-studio [class*="playback"],
  .twick-studio [class*="player-controls"] {
    background: transparent !important;
  }

  .twick-studio [class*="play-button"] {
    background: var(--color-bg-tertiary) !important;
    border-radius: 50% !important;
    transition: all var(--duration-fast) var(--ease-standard) !important;
  }

  .twick-studio [class*="play-button"]:hover {
    background: var(--color-border-medium) !important;
  }

  /* ===== Dropdown Menus ===== */
  .twick-studio [class*="dropdown"],
  .twick-studio [class*="menu"] {
    background: var(--color-bg-tertiary) !important;
    border: 1px solid var(--color-border-medium) !important;
    border-radius: var(--radius-lg) !important;
    box-shadow: var(--shadow-lg) !important;
    padding: 4px !important;
  }

  .twick-studio [class*="dropdown-item"],
  .twick-studio [class*="menu-item"] {
    padding: 10px 12px !important;
    border-radius: var(--radius-md) !important;
    color: var(--color-text-primary) !important;
    transition: background var(--duration-fast) var(--ease-standard) !important;
  }

  .twick-studio [class*="dropdown-item"]:hover,
  .twick-studio [class*="menu-item"]:hover {
    background: var(--color-border-medium) !important;
  }

  /* ===== Tooltips ===== */
  .twick-studio [class*="tooltip"] {
    background: var(--color-bg-primary) !important;
    border: 1px solid var(--color-border-medium) !important;
    color: var(--color-text-primary) !important;
    border-radius: var(--radius-md) !important;
    padding: 6px 10px !important;
    font-size: 12px !important;
    box-shadow: var(--shadow-md) !important;
  }

  /* ===== Input Fields ===== */
  .twick-studio input,
  .twick-studio [class*="input"] {
    background: var(--color-bg-tertiary) !important;
    border: 1px solid var(--color-border-medium) !important;
    border-radius: var(--radius-md) !important;
    color: var(--color-text-primary) !important;
    padding: 10px 12px !important;
    transition: all var(--duration-normal) var(--ease-standard) !important;
  }

  .twick-studio input:focus,
  .twick-studio [class*="input"]:focus {
    border-color: var(--color-primary) !important;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1) !important;
    outline: none !important;
  }

  .twick-studio input::placeholder {
    color: var(--color-text-tertiary) !important;
  }

  /* ===== Media Cards ===== */
  .twick-studio [class*="media-card"],
  .twick-studio [class*="thumbnail"] {
    background: var(--color-bg-tertiary) !important;
    border-radius: var(--radius-lg) !important;
    border: 1px solid transparent !important;
    transition: all var(--duration-normal) var(--ease-standard) !important;
  }

  .twick-studio [class*="media-card"]:hover,
  .twick-studio [class*="thumbnail"]:hover {
    border-color: var(--color-border-strong) !important;
    transform: translateY(-2px) !important;
    box-shadow: var(--shadow-md) !important;
  }

  /* ===== Icon Buttons ===== */
  .twick-studio [class*="icon-button"] {
    background: transparent !important;
    color: var(--color-text-secondary) !important;
    width: 36px !important;
    height: 36px !important;
    border-radius: var(--radius-md) !important;
    transition: all var(--duration-fast) var(--ease-standard) !important;
  }

  .twick-studio [class*="icon-button"]:hover {
    background: var(--color-bg-tertiary) !important;
    color: var(--color-text-primary) !important;
  }

  /* ===== Accessibility: Focus States ===== */
  .twick-studio button:focus-visible,
  .twick-studio [role="button"]:focus-visible {
    outline: 2px solid var(--color-primary) !important;
    outline-offset: 2px !important;
  }

  /* ===== Loading Spinner ===== */
  .twick-studio [class*="spinner"],
  .twick-studio [class*="loading"] {
    border-color: var(--color-bg-tertiary) !important;
    border-top-color: var(--color-primary) !important;
  }

  /* ===== Canvas Interaction - Enable element selection and dragging ===== */
  .twick-studio .canvas-container canvas,
  .twick-studio canvas.lower-canvas,
  .twick-studio canvas.upper-canvas {
    cursor: default !important;
  }

  /* Fabric.js selection controls - make them visible and styled */
  .twick-studio .canvas-container .canvas-controls {
    pointer-events: auto !important;
  }

  /* Ensure canvas elements are interactive during editing */
  .twick-studio .canvas-wrapper,
  .twick-studio .twick-editor-canvas-container {
    pointer-events: auto !important;
  }

  /* Style for selected elements on canvas */
  .twick-studio canvas.upper-canvas {
    pointer-events: auto !important;
  }

  /* Canvas element selection border */
  .fabric-selected {
    border: 2px solid var(--color-primary) !important;
    box-shadow: 0 0 10px rgba(124, 58, 237, 0.5) !important;
  }

  /* ===== Custom Controls Injected via Portal into Twick's edit-controls ===== */

  /* Divider between Twick controls and our custom controls */
  .custom-control-divider {
    width: 1px;
    height: 20px;
    background: var(--color-border-medium);
    margin: 0 8px;
    flex-shrink: 0;
  }

  /* Volume controls container */
  .custom-volume-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  /* Custom control buttons matching Twick's style */
  .custom-control-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: var(--radius-md);
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-standard);
  }

  .custom-control-btn:hover {
    background: var(--color-bg-tertiary);
    color: var(--color-text-primary);
  }

  .custom-control-btn.disabled {
    color: var(--color-text-muted);
    cursor: not-allowed;
  }

  .custom-control-btn.disabled:hover {
    background: transparent;
    color: var(--color-text-muted);
  }

  /* Volume slider - wider for finer control */
  input.custom-volume-slider[type="range"] {
    width: 100px !important;
    height: 14px !important;
    background: linear-gradient(to right, #7C3AED 0%, #7C3AED 100%, #3A3B42 100%, #3A3B42 100%) !important;
    background-size: 100% 4px !important;
    background-position: center !important;
    background-repeat: no-repeat !important;
    cursor: pointer !important;
    -webkit-appearance: none !important;
    appearance: none !important;
    border: none !important;
    border-radius: 2px !important;
    padding: 0 !important;
    margin: 0 !important;
    vertical-align: middle !important;
  }

  input.custom-volume-slider[type="range"]::-webkit-slider-runnable-track {
    height: 4px !important;
    background: #3A3B42 !important;
    border-radius: 2px !important;
  }

  input.custom-volume-slider[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none !important;
    appearance: none !important;
    width: 14px !important;
    height: 14px !important;
    background: #FFFFFF !important;
    border-radius: 50% !important;
    cursor: pointer !important;
    border: 2px solid #7C3AED !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4) !important;
    margin-top: -5px !important;
  }

  input.custom-volume-slider[type="range"]::-webkit-slider-thumb:hover {
    background: #8B5CF6 !important;
  }

  input.custom-volume-slider[type="range"]::-moz-range-track {
    height: 4px !important;
    background: #3A3B42 !important;
    border-radius: 2px !important;
  }

  input.custom-volume-slider[type="range"]::-moz-range-thumb {
    width: 14px !important;
    height: 14px !important;
    background: #FFFFFF !important;
    border-radius: 50% !important;
    cursor: pointer !important;
    border: 2px solid #7C3AED !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4) !important;
  }

  input.custom-volume-slider[type="range"]::-moz-range-progress {
    height: 4px !important;
    background: #7C3AED !important;
    border-radius: 2px !important;
  }
`;

const ManualEditor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  // Aspect ratio controls actual canvas size for video playback
  const [aspectRatio, setAspectRatio] = useState("16:9");
  // Canvas size is derived from aspect ratio
  const canvasSize = useMemo(() => getCanvasSizeForAspectRatio(aspectRatio), [aspectRatio]);
  const [projectName, setProjectName] = useState("Video Project");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempProjectName, setTempProjectName] = useState("Video Project");
  const [videoLoadedToTimeline, setVideoLoadedToTimeline] = useState(false);
  const videoFileInputRef = useRef(null);
  // Ref to signal that playback should be restored after aspect ratio change
  const restorePlaybackRef = useRef(false);

  // Global video store - shared between AI Editor and Manual Editor
  const storeCurrentVideo = useVideoStore((state) => state.currentVideo);
  const setCurrentVideo = useVideoStore((state) => state.setCurrentVideo);

  // Editor state ref - populated by EditorWithContext via direct ref assignment
  // Using ref instead of state to avoid infinite re-render loops from context updates
  const editorStateRef = useRef({
    canUndo: false,
    canRedo: false,
    editor: null,
    present: null,
    playerVolume: 1,
    setPlayerVolume: null,
    playerState: 'paused',
    setPlayerState: null,
    selectedItem: null,
    currentTime: 0
  });

  // Get uploaded video from navigation state OR global store (unified system)
  const uploadedVideo = location.state?.uploadedVideo || storeCurrentVideo;
  const projectData = location.state?.projectData;

  // If video came from navigation state, also store it in global store for sync
  useEffect(() => {
    if (location.state?.uploadedVideo && !storeCurrentVideo) {
      setCurrentVideo(location.state.uploadedVideo);
    }
  }, [location.state?.uploadedVideo, storeCurrentVideo, setCurrentVideo]);

  // Handle aspect ratio change - updates actual canvas size
  // Video element updates are handled in EditorWithContext effect after resolution propagates
  const handleAspectRatioChange = useCallback((ratio) => {
    const state = editorStateRef.current;

    // Save current playback state - signal to restore after change completes
    const wasPlaying = state?.playerState === PLAYER_STATE.PLAYING;
    if (wasPlaying) {
      restorePlaybackRef.current = true;
    }

    setAspectRatio(ratio);
  }, []);


  // Undo action
  const handleUndo = useCallback(() => {
    const state = editorStateRef.current;
    if (state?.canUndo && state?.editor) {
      state.editor.undo();
    }
  }, []);

  // Redo action
  const handleRedo = useCallback(() => {
    const state = editorStateRef.current;
    if (state?.canRedo && state?.editor) {
      state.editor.redo();
    }
  }, []);

  // Volume control
  const handleVolumeChange = useCallback((newVolume) => {
    const state = editorStateRef.current;
    if (state?.setPlayerVolume) {
      state.setPlayerVolume(newVolume);
    }
  }, []);

  // Mute toggle
  const [previousVolume, setPreviousVolume] = useState(1);
  const handleMuteToggle = useCallback(() => {
    const state = editorStateRef.current;
    if (state?.setPlayerVolume) {
      if (state.playerVolume > 0) {
        setPreviousVolume(state.playerVolume);
        state.setPlayerVolume(0);
      } else {
        state.setPlayerVolume(previousVolume);
      }
    }
  }, [previousVolume]);

  // Play/Pause toggle
  const handlePlayPause = useCallback(() => {
    const state = editorStateRef.current;
    if (state?.setPlayerState) {
      const newState = state.playerState === PLAYER_STATE.PLAYING
        ? PLAYER_STATE.PAUSED
        : PLAYER_STATE.PLAYING;
      state.setPlayerState(newState);
    }
  }, []);

  // Split selected element at current playhead position
  const handleSplit = useCallback(async () => {
    const state = editorStateRef.current;
    if (!state?.editor || !state?.selectedItem) {
      return;
    }
    // Check if selected item is a TrackElement (not a Track)
    if (state.selectedItem.getStart && state.selectedItem.getEnd) {
      const element = state.selectedItem;
      const splitTime = state.currentTime;

      // Check if playhead is within the element's time range
      if (splitTime > element.getStart() && splitTime < element.getEnd()) {
        const result = await state.editor.splitElement(element, splitTime);
        if (!result.success) {
          console.warn("Failed to split element");
        }
      }
    }
  }, []);

  // Delete selected element
  const handleDelete = useCallback(() => {
    const state = editorStateRef.current;
    if (!state?.editor || !state?.selectedItem) {
      return;
    }
    if (state.selectedItem.getStart) {
      state.editor.removeElement(state.selectedItem);
    }
  }, []);

  // Duplicate selected element
  const handleDuplicate = useCallback(() => {
    const state = editorStateRef.current;
    if (!state?.editor || !state?.selectedItem) {
      return;
    }
    if (state.selectedItem.getStart) {
      const cloned = state.editor.cloneElement(state.selectedItem);
      if (cloned) {
        // Offset the cloned element's start time
        const originalEnd = state.selectedItem.getEnd();
        cloned.setStart(originalEnd);
        state.editor.addElement(cloned);
      }
    }
  }, []);

  // Load video from global store into Twick timeline
  const loadVideoToTimeline = useCallback(async (video) => {
    const editor = editorStateRef.current?.editor;
    if (!editor || !video?.url) {
      console.log("Cannot load video: editor not ready or no video URL");
      return false;
    }

    try {
      console.log("Loading video to timeline:", video.url);

      // Create a new video element
      const videoElement = new VideoElement(video.url, canvasSize);

      // Update video metadata (duration, dimensions)
      await videoElement.updateVideoMeta();

      // Set start time
      videoElement.setStart(0);

      // Set end time based on video duration
      const duration = videoElement.getMediaDuration();
      videoElement.setEnd(duration);

      // Create a video track
      const track = editor.addTrack("Video Track", "video");

      // Add video element to the track
      const success = await editor.addElementToTrack(track, videoElement);

      if (success) {
        console.log("Video loaded to timeline successfully");
        // Update project name from video
        if (video.name) {
          setProjectName(video.name.replace(/\.[^/.]+$/, "")); // Remove extension
        }
        setVideoLoadedToTimeline(true);
        return true;
      } else {
        console.error("Failed to add video element to track");
        return false;
      }
    } catch (error) {
      console.error("Error loading video to timeline:", error);
      return false;
    }
  }, [canvasSize]);

  // Auto-load video from store when editor is ready
  // Check periodically since ref changes don't trigger re-renders
  useEffect(() => {
    if (!storeCurrentVideo?.url || videoLoadedToTimeline) return;

    // Check if editor is available in the ref
    const checkAndLoad = () => {
      const editor = editorStateRef.current?.editor;
      if (editor) {
        loadVideoToTimeline(storeCurrentVideo);
        return true;
      }
      return false;
    };

    // Try immediately
    if (checkAndLoad()) return;

    // Retry periodically until editor is ready
    const interval = setInterval(() => {
      if (checkAndLoad()) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [storeCurrentVideo, videoLoadedToTimeline, loadVideoToTimeline]);

  // Switch to AI Editor (video persists via global store)
  const handleSwitchToAIEditor = useCallback(() => {
    navigate("/ai-editor");
  }, [navigate]);

  // Video file upload handler
  const handleVideoFileSelect = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate it's a video file
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
    if (!validVideoTypes.includes(file.type) && !file.type.startsWith('video/')) {
      alert('Please select a valid video file (MP4, WebM, OGG, MOV, AVI)');
      return;
    }

    // Create blob URL for local playback
    const videoUrl = URL.createObjectURL(file);

    // Create video object compatible with the store
    const videoData = {
      id: `local_${Date.now()}`,
      name: file.name,
      url: videoUrl,
      type: file.type,
      size: file.size,
      isLocal: true, // Flag to indicate this is a local file
    };

    // Store in global video store
    setCurrentVideo(videoData);

    // Update project name from video filename
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    setProjectName(nameWithoutExt);

    // Reset timeline state so it reloads with the new video
    setVideoLoadedToTimeline(false);

    // Clear the input so the same file can be selected again
    event.target.value = '';
  }, [setCurrentVideo, setProjectName, setVideoLoadedToTimeline]);

  // Trigger file input click
  const handleUploadVideoClick = useCallback(() => {
    videoFileInputRef.current?.click();
  }, []);

  // Project name editing
  const startEditingName = useCallback(() => {
    setTempProjectName(projectName);
    setIsEditingName(true);
  }, [projectName]);

  const confirmNameEdit = useCallback(() => {
    if (tempProjectName.trim()) {
      setProjectName(tempProjectName.trim());
    }
    setIsEditingName(false);
  }, [tempProjectName]);

  const cancelNameEdit = useCallback(() => {
    setTempProjectName(projectName);
    setIsEditingName(false);
  }, [projectName]);

  const handleNameKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      confirmNameEdit();
    } else if (e.key === 'Escape') {
      cancelNameEdit();
    }
  }, [confirmNameEdit, cancelNameEdit]);

  // Save project as JSON file
  const handleSaveProject = useCallback(async () => {
    const projectData = editorStateRef.current?.present;
    if (!projectData) {
      alert("No project data to save");
      return;
    }
    try {
      await saveAsFile(
        JSON.stringify(projectData, null, 2),
        "application/json",
        `${projectName}.json`
      );
    } catch (error) {
      console.error("Error saving project:", error);
      alert("Failed to save project");
    }
  }, [projectName]);

  // Load project from JSON file
  const handleLoadProject = useCallback(async () => {
    try {
      const result = await loadFile("application/json");
      const editor = editorStateRef.current?.editor;
      if (result && editor) {
        const projectData = JSON.parse(result);
        // Load the project data into the editor
        if (projectData.tracks) {
          editor.setTimelineData({
            tracks: projectData.tracks,
            updatePlayerData: true
          });
          // Extract project name from loaded data or keep current
          if (projectData.name) {
            setProjectName(projectData.name);
          }
        }
      }
    } catch (error) {
      console.error("Error loading project:", error);
      alert("Failed to load project. Make sure the file is a valid VFXB project.");
    }
  }, []);

  // Export video (placeholder - server-side rendering required)
  const handleExport = useCallback(() => {
    alert(
      "Export feature requires server-side rendering setup.\n\n" +
      "Current project can be saved as JSON and exported later when the render server is configured."
    );
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in input fields
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // Check for Ctrl/Cmd key combinations
      if (e.ctrlKey || e.metaKey) {
        // Undo: Ctrl+Z (without Shift)
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
        }
        // Redo: Ctrl+Y or Ctrl+Shift+Z
        if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          handleRedo();
        }
        // Duplicate: Ctrl+D
        if (e.key === 'd') {
          e.preventDefault();
          handleDuplicate();
        }
        // Save: Ctrl+S
        if (e.key === 's') {
          e.preventDefault();
          handleSaveProject();
        }
        // Open: Ctrl+O
        if (e.key === 'o') {
          e.preventDefault();
          handleLoadProject();
        }
      }

      // Space: Play/Pause toggle
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        handlePlayPause();
      }

      // S: Split element at playhead
      if (e.key === 's' && !e.ctrlKey && !e.metaKey) {
        handleSplit();
      }

      // Delete/Backspace: Delete selected element
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handlePlayPause, handleSplit, handleDelete, handleDuplicate, handleSaveProject, handleLoadProject]);

  // Capture initial canvas size for stable studioConfig
  // This ref stores the FIRST aspect ratio and never changes
  const initialCanvasSizeRef = useRef(canvasSize);

  // Studio configuration - Uses INITIAL canvas size, never changes after first render
  // This prevents TwickStudio from re-initializing when aspect ratio changes
  // Runtime resolution changes are handled via setVideoResolution in EditorWithContext
  const studioConfig = useMemo(() => ({
    videoProps: {
      width: initialCanvasSizeRef.current.width,
      height: initialCanvasSizeRef.current.height,
    },
    playerProps: {
      maxWidth: 1920,
      maxHeight: 1080,
    },
    // Enable canvas mode for interactive element manipulation (selection, dragging, layering)
    canvasMode: true,
  }), []); // Empty deps - uses ref value from first render

  return (
    <>
      {/* Inject custom styles */}
      <style>{customStyles}</style>

      <div className="manual-editor-fullscreen min-h-screen bg-[#1A1B1E] flex flex-col fixed inset-0 z-[100]">
        {/* Header - Clipchamp style (48px height per design system) */}
        <header className="h-12 bg-[#1A1B1E] border-b border-[#2E2F35] px-4 flex items-center justify-between z-50">
          {/* Left side - Logo and project name */}
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#7C3AED] rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="text-[#FFFFFF] font-semibold text-sm">VFXB</span>
            </div>

            {/* Project name - editable */}
            {isEditingName ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={tempProjectName}
                  onChange={(e) => setTempProjectName(e.target.value)}
                  onKeyDown={handleNameKeyDown}
                  autoFocus
                  className="px-2 py-1 text-[#FFFFFF] text-sm bg-[#2C2D33] border border-[#7C3AED] rounded-md outline-none w-40"
                  placeholder="Project name"
                />
                <button
                  onClick={confirmNameEdit}
                  className="w-6 h-6 flex items-center justify-center text-[#10B981] hover:bg-[#2C2D33] rounded transition-all"
                  title="Confirm"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={cancelNameEdit}
                  className="w-6 h-6 flex items-center justify-center text-[#EF4444] hover:bg-[#2C2D33] rounded transition-all"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={startEditingName}
                className="flex items-center gap-1 px-2 py-1 text-[#FFFFFF] text-sm hover:bg-[#2C2D33] rounded-md transition-all duration-150 group"
                title="Click to edit project name"
              >
                <span>{projectName}</span>
                <Pencil className="w-3 h-3 text-[#6B6C72] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}

            {/* Aspect Ratio Selector - as Size dropdown */}
            <div className="flex items-center border-l border-[#2E2F35] pl-4">
              <select
                value={aspectRatio}
                onChange={(e) => handleAspectRatioChange(e.target.value)}
                className="bg-transparent text-[#FFFFFF] text-sm px-2 py-1 hover:bg-[#2C2D33] rounded-md cursor-pointer transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:ring-opacity-30"
              >
                <option value="9:16" className="bg-[#1A1B1E]">9:16 (Vertical)</option>
                <option value="16:9" className="bg-[#1A1B1E]">16:9 (Landscape)</option>
                <option value="1:1" className="bg-[#1A1B1E]">1:1 (Square)</option>
                <option value="4:5" className="bg-[#1A1B1E]">4:5 (Portrait)</option>
              </select>
            </div>

            {/* Switch to AI Editor button */}
            <div className="flex items-center border-l border-[#2E2F35] pl-4">
              <button
                onClick={handleSwitchToAIEditor}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#FFFFFF] bg-[#2C2D33] hover:bg-[#3A3B42] rounded-md transition-all duration-150"
                title="Switch to AI Editor"
              >
                <Wand2 className="w-4 h-4 text-[#8B5CF6]" />
                <span>AI Editor</span>
              </button>
            </div>

          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-3">
            {/* Utility icons (36x36px per design system) */}
            <button className="w-9 h-9 flex items-center justify-center text-[#A0A1A7] hover:text-[#FFFFFF] hover:bg-[#2C2D33] rounded-md transition-all duration-150">
              <Link2 className="w-5 h-5" />
            </button>
            <button className="w-9 h-9 flex items-center justify-center text-[#A0A1A7] hover:text-[#FFFFFF] hover:bg-[#2C2D33] rounded-md transition-all duration-150">
              <Settings className="w-5 h-5" />
            </button>
            <button className="w-9 h-9 flex items-center justify-center text-[#A0A1A7] hover:text-[#FFFFFF] hover:bg-[#2C2D33] rounded-md transition-all duration-150">
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-[#2E2F35]"></div>

            {/* Hidden file input for video upload */}
            <input
              type="file"
              ref={videoFileInputRef}
              onChange={handleVideoFileSelect}
              accept="video/*,.mp4,.webm,.ogg,.mov,.avi"
              className="hidden"
            />

            {/* Upload Video button */}
            <button
              onClick={handleUploadVideoClick}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[#FFFFFF] bg-[#7C3AED] hover:bg-[#6D28D9] rounded-md transition-all duration-200"
              title="Upload Video File"
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </button>

            {/* Load Project button */}
            <button
              onClick={handleLoadProject}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[#FFFFFF] bg-transparent hover:bg-[#2C2D33] rounded-md transition-all duration-200"
              title="Load Project (JSON)"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Open</span>
            </button>

            {/* Save button */}
            <button
              onClick={handleSaveProject}
              className="flex items-center gap-2 px-3 py-2 text-sm text-[#FFFFFF] bg-transparent hover:bg-[#2C2D33] rounded-md transition-all duration-200"
              title="Save Project"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>

            {/* Share button - Secondary button style */}
            <button className="flex items-center gap-2 px-4 py-2 text-sm text-[#FFFFFF] bg-transparent border border-[#3A3B42] hover:bg-[#2C2D33] hover:border-[#4A4B52] rounded-md transition-all duration-200">
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>

            {/* Export button - Primary button with gradient */}
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-[#FFFFFF] rounded-md transition-all duration-200 shadow-[0_2px_8px_rgba(124,58,237,0.25)] hover:shadow-[0_4px_12px_rgba(124,58,237,0.35)] hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </header>

        {/* Main Editor Area */}
        <main className="flex-1 overflow-hidden">
          <LivePlayerProvider>
            <TimelineProvider
              initialData={INITIAL_TIMELINE_DATA}
              contextId="vfxb-manual-editor"
              resolution={{ width: initialCanvasSizeRef.current.width, height: initialCanvasSizeRef.current.height }}
            >
              <div className="h-full twick-studio relative">
                <EditorWithContext
                  studioConfig={studioConfig}
                  canvasSize={canvasSize}
                  editorStateRef={editorStateRef}
                  onVolumeChange={handleVolumeChange}
                  onMuteToggle={handleMuteToggle}
                  onDuplicate={handleDuplicate}
                  previousVolume={previousVolume}
                  restorePlaybackRef={restorePlaybackRef}
                />
              </div>
            </TimelineProvider>
          </LivePlayerProvider>
        </main>
      </div>
    </>
  );
};

export default ManualEditor;
