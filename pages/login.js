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

    // 🔴 REDIRECT AQUI
    setTimeout(() => {
      router.push("/"); // depois você pode trocar para /dashboard
    }, 500);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <h1 style={{ color: "#9966FF", marginBottom: 20 }}>Login</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: 300,
          padding: 12,
          marginBottom: 10,
        }}
      />

      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          width: 300,
          padding: 12,
          marginBottom: 20,
        }}
      />

      <button
        onClick={handleLogin}
        disabled={loading}
        style={{
          width: 300,
          padding: 12,
          backgroundColor: "#9966FF",
          color: "#000",
          fontWeight: "bold",
          cursor: "pointer",
          border: "none",
        }}
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>

      {message && (
        <p style={{ color: "#fff", marginTop: 15 }}>{message}</p>
      )}
    </div>
  );
}
