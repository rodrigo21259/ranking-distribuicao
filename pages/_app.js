import "../styles/globals.css"; // seu css/tailwind global
import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import ThemeToggle from "../components/ThemeToggle";

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // aplica theme inicial do localStorage no carregamento (previne flash)
    try {
      const t = localStorage.getItem("theme");
      if (t === "dark") document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    } catch (e) {
      // nada
    }
  }, []);

  return (
    <div className="min-h-screen bg-lightbg dark:bg-darkbg text-black dark:text-white">
      <header style={{ display: "flex", justifyContent: "space-between", padding: 16 }}>
        <div style={{ color: "#9966FF", fontWeight: 700 }}>Ranking Distribuição</div>
        <div style={{ display: "flex", gap: 8 }}>
          <ThemeToggle />
        </div>
      </header>

      <main style={{ padding: 20 }}>
        <Component {...pageProps} />
      </main>
    </div>
  );
}

export default MyApp;
