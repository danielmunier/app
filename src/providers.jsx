import { NotificationProvider } from "./context/NotificationContext";
import { ThemeProvider } from "./context/ThemeContext";
import { WaterProvider } from "./context/WaterProvider";

export default function Providers({ children }) {
    return <div>
        <ThemeProvider>
            <WaterProvider>

            <NotificationProvider>
                    {children}
            </NotificationProvider>

            </WaterProvider>
        </ThemeProvider>

    </div>
}
