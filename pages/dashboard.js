import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/login");
        return;
      }

      setUser(data.user);
    };

    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (!user) {
    return (
      <div style={{ background: "#000", color: "#fff", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Carregando...
      </div>
    );
  }

  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh", padding: "40px" }}>
      <h1 style={{ color: "#9966FF" }}>Dashboard</h1>

      <p style={{ marginTop: "20px" }}>
        Usuário logado:
      </p>

      <strong>{user.email}</strong>

      <div style={{ marginTop: "40px" }}>
        <button
          onClick={handleLogout}
          style={{
            background: "#EBEB70",
            color: "#000",
            padding: "10px 16px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Sair
        </button>
      </div>
    </div>
  );
}
