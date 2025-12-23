import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Upload,
  Video,
  Image,
  Music,
  Type,
  Shapes,
  Wand2,
  Save,
  Download,
  ArrowLeft,
  Settings,
  Layers,
  Play,
  Pause,
} from "lucide-react";

// Twick/VFXB Editor imports
import { LivePlayerProvider } from "@twick/live-player";
import { TwickStudio } from "@twick/studio";
import { TimelineProvider, INITIAL_TIMELINE_DATA } from "@twick/timeline";
import "@twick/studio/dist/studio.css";

// Custom CSS to override Twick branding colors and make editor full-screen
const customStyles = `
  /* Hide the app's sidebar and header when on manual-editor */
  body:has(.manual-editor-fullscreen) aside[class*="w-64"],
  body:has(.manual-editor-fullscreen) > div > div > aside,
  body:has(.manual-editor-fullscreen) header[class*="fixed"] {
    display: none !important;
  }

  /* Make the main content take full width */
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

  /* Override Twick colors with VFXB gradient colors */
  .twick-studio {
    --twick-primary: #ec4899;
    --twick-secondary: #a855f7;
    --twick-bg: hsl(var(--background));
    --twick-surface: hsl(var(--card));
    --twick-border: hsl(var(--border));
  }

  /* Dark mode overrides */
  .dark .twick-studio,
  [data-theme="dark"] .twick-studio {
    --twick-bg: #111827;
    --twick-surface: #1f2937;
    --twick-border: #374151;
    --twick-text: #f9fafb;
    --twick-text-muted: #9ca3af;
  }

  /* Hide any Twick branding if present */
  .twick-logo,
  .twick-brand,
  [class*="twick-watermark"] {
    display: none !important;
  }

  /* Integrate with VFXB scrollbar styles */
  .twick-studio ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .twick-studio ::-webkit-scrollbar-track {
    background: transparent;
  }

  .twick-studio ::-webkit-scrollbar-thumb {
    background: rgba(236, 72, 153, 0.3);
    border-radius: 4px;
  }

  .twick-studio ::-webkit-scrollbar-thumb:hover {
    background: rgba(236, 72, 153, 0.5);
  }
`;

const ManualEditor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [videoSize, setVideoSize] = useState({ width: 1080, height: 1920 }); // 9:16 default
  const [aspectRatio, setAspectRatio] = useState("9:16");

  // Get uploaded video from navigation state if available
  const uploadedVideo = location.state?.uploadedVideo;
  const projectData = location.state?.projectData;

  // Handle aspect ratio change
  const handleAspectRatioChange = useCallback((ratio) => {
    setAspectRatio(ratio);
    switch (ratio) {
      case "16:9":
        setVideoSize({ width: 1920, height: 1080 });
        break;
      case "9:16":
        setVideoSize({ width: 1080, height: 1920 });
        break;
      case "1:1":
        setVideoSize({ width: 1080, height: 1080 });
        break;
      case "4:5":
        setVideoSize({ width: 1080, height: 1350 });
        break;
      default:
        setVideoSize({ width: 1080, height: 1920 });
    }
  }, []);

  // Studio configuration
  const studioConfig = {
    videoProps: {
      width: videoSize.width,
      height: videoSize.height,
    },
  };

  return (
    <>
      {/* Inject custom styles */}
      <style>{customStyles}</style>

      <div className="manual-editor-fullscreen min-h-screen bg-gray-900 flex flex-col fixed inset-0 z-[100]">
        {/* Header */}
        <header className="h-14 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 px-4 flex items-center justify-between z-50">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
                  VFXB Manual Editor
                </h1>
                <p className="text-xs text-gray-500">
                  Timeline-based video editing
                </p>
              </div>
            </div>
          </div>

          {/* Aspect Ratio Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Aspect:</span>
            <div className="flex bg-gray-700/50 rounded-lg p-1">
              {["9:16", "16:9", "1:1", "4:5"].map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => handleAspectRatioChange(ratio)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    aspectRatio === ratio
                      ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-600"
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Save</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </header>

        {/* Main Editor Area */}
        <main className="flex-1 overflow-hidden">
          <LivePlayerProvider>
            <TimelineProvider
              initialData={INITIAL_TIMELINE_DATA}
              contextId="vfxb-manual-editor"
            >
              <div className="h-full twick-studio">
                <TwickStudio studioConfig={studioConfig} />
              </div>
            </TimelineProvider>
          </LivePlayerProvider>
        </main>

        {/* Footer / Status Bar */}
        <footer className="h-8 bg-gray-800/80 border-t border-gray-700 px-4 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>VFXB Manual Editor v1.0</span>
            <span className="text-gray-600">|</span>
            <span>
              Canvas: {videoSize.width} x {videoSize.height}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Ready
            </span>
          </div>
        </footer>
      </div>
    </>
  );
};

export default ManualEditor;
