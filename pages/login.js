import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage("Erro ao fazer login");
      setLoading(false);
      return;
    }

    setMessage("Login realizado com sucesso");

    // 🔴 REDIRECT AQUI (ESSENCIAL)
    setTimeout(() => {
      router.push("/"); // ou /dashboard no futuro
    }, 800);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#000",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ width: 320, textAlign: "center" }}>
        <h1 style={{ color: "#9966FF", marginBottom: 20 }}>Login</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 10,
          }}
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 15,
          }}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            backgroundColor: "#9966FF",
            color: "#000",
            fontWeight: "bold",
            border: "none",
            cursor: "pointer",
          }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        {message && (
          <p style={{ color: "#fff", marginTop: 15 }}>{message}</p>
        )}
      </div>
    </div>
  );
}
