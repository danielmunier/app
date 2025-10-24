import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import Background from "./components/Background/Background";
import { useTheme } from "./hooks/useTheme";
import { ThemeProvider } from "./context/ThemeContext";
import TitleBar from "./components/TitleBar";
import Navigator from "./components/Navigator/Navigator";

import Home from "./pages/home/Home";
import Test from "./pages/Test";
import Chat from "./pages/chat/Chat";
import Draw from "./pages/draw/draw";
import Gallery from "./pages/gallery/Gallery";
import Tasks from "./pages/tasks/Tasks";
import WeekKanban from "./pages/tasks/WeekKanban";

function AppContent() {
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
    <TitleBar />
      <Navigator orientation={orientation} position={position} />
      <Background />

      <main
        style={{
          position: "absolute",
          top: "30px",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10,
          overflow: "auto",
        }}
      >
         
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test" element={<Test />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/draw" element={<Draw />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/week/:weekId" element={<WeekKanban />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </ThemeProvider>
  );
}
