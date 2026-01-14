import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

/**
 * ThemeToggle:
 * - alterna entre "light" e "dark"
 * - aplica a classe "dark" no <html> (tailwind darkMode: 'class')
 * - salva em localStorage para rápido apply
 * - tenta salvar em user metadata no Supabase (se estiver logado)
 */

export default function ThemeToggle() {
  const [theme, setTheme] = useState("dark"); // padrão dark
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // 1) preferencia local
    const local = typeof window !== "undefined" && localStorage.getItem("theme");
    if (local) {
      setTheme(local);
      applyTheme(local);
      return;
    }

    // 2) se usuário logado, tenta pegar do Supabase user metadata
    (async () => {
      const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data?.user : null;
      // supabase v2: supabase.auth.getUser()
      if (user && user.user_metadata && user.user_metadata.theme) {
        const t = user.user_metadata.theme;
        setTheme(t);
        applyTheme(t);
        localStorage.setItem("theme", t);
      } else {
        // fallback padrão: dark (ou altera aqui)
        applyTheme("dark");
      }
    })();
  }, []);

  function applyTheme(t) {
    if (typeof document === "undefined") return;
    if (t === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  async function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch (e) {}

    // salva no metadata do usuário (silencioso)
    try {
      setSaving(true);
      // supabase v2: updateUser
      const res = await supabase.auth.updateUser({
        data: { theme: next },
      });
      // res.error ? console.log(res.error) : null;
    } catch (err) {
      // silent
      console.log("não foi possível salvar tema no supabase", err?.message || err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      style={{
        background: theme === "dark" ? "#F4F4F4" : "#121212",
        color: theme === "dark" ? "#121212" : "#FFFFFF",
        borderRadius: 6,
        padding: "6px 10px",
        fontWeight: 600,
      }}
    >
      {theme === "dark" ? "Claro" : "Escuro"} {saving ? "…" : ""}
    </button>
  );
}
