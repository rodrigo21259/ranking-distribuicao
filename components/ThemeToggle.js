// components/ThemeToggle.js
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { getProfile, upsertProfile } from "../lib/profile";

export default function ThemeToggle({ user }) {
  const [theme, setTheme] = useState("dark");
  const userId = user?.id;

  useEffect(() => {
    const local = localStorage.getItem("theme");
    if (!userId) {
      const current = local || "dark";
      setTheme(current);
      document.documentElement.classList.toggle("dark", current === "dark");
      return;
    }
    // se user logado, pegar do profile
    (async () => {
      try {
        const p = await getProfile(userId);
        const current = p?.theme || local || "dark";
        setTheme(current);
        document.documentElement.classList.toggle("dark", current === "dark");
        localStorage.setItem("theme", current);
      } catch (err) {
        console.error("getProfile error", err);
      }
    })();
  }, [userId]);

  const toggle = async () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);

    if (userId) {
      try {
        await upsertProfile({ id: userId, email: user.email, theme: next });
      } catch (err) {
        console.error("Erro ao salvar tema:", err);
      }
    }
  };

  return (
    <button
      onClick={toggle}
      style={{
        padding: "6px 10px",
        borderRadius: 6,
        border: "1px solid rgba(255,255,255,0.08)",
        background: theme === "dark" ? "#9966FF" : "#fff",
        color: theme === "dark" ? "#fff" : "#111",
        cursor: "pointer",
      }}
    >
      {theme === "dark" ? "Escuro" : "Claro"}
    </button>
  );
}
