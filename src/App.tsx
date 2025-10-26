import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import MainMenu from "./pages/MainMenu";
import Roadmap from "./pages/Roadmap";
import LevelPage from "./pages/LevelPage";
import AudioManager from "./utils/AudioManager";

export default function App() {
  useEffect(() => {
    // Try to start background audio on app mount; if blocked the AudioManager will
    // register a user-gesture handler to start playback on first click/keydown.
    try {
      AudioManager.ensureBackgroundAutoStart();
    } catch {}
  }, []);

  return (
    <Routes>
      <Route path="/" element={<MainMenu />} />
      <Route path="/roadmap" element={<Roadmap />} />
      <Route path="/level/:id" element={<LevelPage />} />
      <Route path="/about" element={<MainMenu />} />
      <Route path="/settings" element={<MainMenu />} />
    </Routes>
  );
}