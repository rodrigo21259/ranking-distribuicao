// pages/_app.js
import { useEffect, useState, createContext } from "react";
import "../styles/globals.css";
import { createClient } from "@supabase/supabase-js"; // se você usar supabase aqui

export const ThemeContext = createContext({
  theme: "dark",
  toggleTheme: () => {},
});

function MyApp({ Component, pageProps }) {
  const [theme, setTheme] = useState("dark");

  // Aplica a classe no html e lê localStorage ao iniciar
  useEffect(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem("theme");
    const prefer = saved || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light");
    setTheme(prefer);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Component {...pageProps} />
    </ThemeContext.Provider>
  );
}

export default MyApp;
