import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e?.preventDefault?.();
    setLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage("Erro ao fazer login: " + (error.message || error));
        setLoading(false);
        return;
      }

      // Se chegou aqui, login ok — redireciona para /dashboard
      // (coloca pequeno delay só pra garantir que sessão esteja pronta)
      setMessage("Login realizado com sucesso, redirecionando...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 300);

    } catch (err) {
      setMessage("Erro inesperado: " + String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", background: "#000" }}>
      <h1 style={{ color: "#9966FF", fontSize: 48, marginBottom: 24 }}>Login</h1>

      <form onSubmit={handleLogin} style={{ width: 520, maxWidth: "90%" }}>
        <input
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: "12px 14px", marginBottom: 14, boxSizing: "border-box" }}
          required
          autoComplete="username"
        />

        <input
          type="password"
          placeholder="senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: "12px 14px", marginBottom: 14, boxSizing: "border-box" }}
          required
          autoComplete="current-password"
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px 14px",
            background: "#9966FF",
            color: "#fff",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: 12
          }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      {message && <div style={{ color: "#fff", marginTop: 12 }}>{message}</div>}
    </div>
  );
}
