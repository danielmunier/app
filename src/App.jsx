import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import GalaxyBackground from "./components/Background/GalaxyBackground";
import { useTheme } from "./hooks/useTheme";
import TitleBar from "./components/TitleBar";
import Navigator from "./components/Navigator/Navigator";
import Home from "./pages/home/Home";
import Test from "./pages/Test";
import Chat from "./pages/chat/Chat";
import Draw from "./pages/draw/draw";
import Gallery from "./pages/gallery/Gallery";
import Tasks from "./pages/tasks/Task";
import Settings from "./pages/settings/Settings";
import Providers from "./providers";
import { useWaterReminder } from "./components/WaterTracker/useWaterReminder";
import { useSettings } from "./context/SettingsContext";

function AppContent() {
  const { settings } = useSettings();
  useWaterReminder(settings.waterReminderInterval);

  const { isDarkMode } = useTheme();
  const location = useLocation();
  const isVertical = location.pathname === "/chat";
  const orientation = isVertical ? "vertical" : "horizontal";
  const position = isVertical ? "right" : "bottom";

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        color: isDarkMode ? "white" : "black",
        transition: "color 0.5s ease",
      }}
    >
      <GalaxyBackground />
      <TitleBar />
      <Navigator orientation={orientation} position={position} />

      <main
        style={{
          position: "absolute",
          top: "30px",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10,
          overflow: "auto",
          pointerEvents: "none",
        }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test" element={<Test />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/draw" element={<Draw />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Providers>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </Providers>
  );
}
