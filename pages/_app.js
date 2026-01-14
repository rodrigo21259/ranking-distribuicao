// pages/_app.js
import "../styles/globals.css";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import ThemeToggle from "../components/ThemeToggle";

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setUser(data?.session?.user || null);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  return (
    <div>
      <header style={{ padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <h2 style={{ margin: 0, color: "var(--roxo)" }}>Ranking Distribuição</h2>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <ThemeToggle user={user} />
          {user ? (
            <button onClick={() => supabase.auth.signOut()}>Sair</button>
          ) : null}
        </div>
      </header>

      <main style={{ padding: 20 }}>
        <Component {...pageProps} user={user} />
      </main>
    </div>
  );
}

export default MyApp;
