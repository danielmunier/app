import { NotificationProvider } from "./context/NotificationContext";
import { ThemeProvider } from "./context/ThemeContext";
import { WaterProvider } from "./context/WaterProvider";
import { SettingsProvider } from "./context/SettingsContext";

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <WaterProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </WaterProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
