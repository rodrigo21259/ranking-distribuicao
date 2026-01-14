// components/ThemeToggle.js
import { useContext } from "react";
import { ThemeContext } from "../pages/_app";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: "6px 10px",
        borderRadius: 6,
        border: "1px solid rgba(255,255,255,0.06)",
        background: theme === "dark" ? "transparent" : "#fff",
        color: theme === "dark" ? "#e5e7eb" : "#111827",
        cursor: "pointer"
      }}
    >
      {theme === "dark" ? "Escuro" : "Claro"}
    </button>
  );
}
