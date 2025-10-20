import { useState, useEffect } from "react";

export default function useThemeMode() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Verifica se há uma preferência salva no localStorage
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme === "dark";

    // Caso contrário, usa o tema do sistema
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // 🔮 Atualiza o atributo `data-theme` sempre que mudar o modo
  useEffect(() => {
    const theme = isDarkMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
  }, [isDarkMode]);

  // Alternar manualmente o tema
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  // Escuta mudanças no tema do sistema, mas só se o usuário não tiver escolhido manualmente
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      if (!localStorage.getItem("theme")) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return [isDarkMode, setIsDarkMode, toggleTheme];
}
