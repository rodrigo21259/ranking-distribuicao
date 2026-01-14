import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      setUser(session.user);
      setLoading(false);
    };

    checkUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        Carregando...
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2>Dashboard</h2>
        <button style={styles.logout} onClick={handleLogout}>
          Sair
        </button>
      </header>

      <main style={styles.main}>
        <p>Usuário logado:</p>
        <strong>{user.email}</strong>

        <div style={styles.card}>
          Área pronta para métricas, rankings, gráficos etc.
        </div>
      </main>
    </div>
  );
}

const styles = {
  loading: {
    minHeight: "100vh",
    background: "#000",
    color: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    minHeight: "100vh",
    background: "#000",
    color: "#fff",
  },
  header: {
    padding: 20,
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid #333",
  },
  logout: {
    background: "#9b6cff",
    border: "none",
    padding: "6px 12px",
    cursor: "pointer",
  },
  main: {
    padding: 20,
  },
  card: {
    marginTop: 20,
    padding: 20,
    background: "#111",
    border: "1px solid #333",
  },
};
