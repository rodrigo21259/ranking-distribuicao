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

    router.replace("/dashboard");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ width: 320 }}>
        <h1
          style={{
            color: "rgb(153,102,255)",
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 10,
            borderRadius: 4,
            border: "none",
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
            marginBottom: 10,
            borderRadius: 4,
            border: "none",
          }}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: 10,
            backgroundColor: "rgb(153,102,255)",
            color: "#000",
            fontWeight: "bold",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        {message && (
          <p style={{ marginTop: 10, textAlign: "center" }}>{message}</p>
        )}
      </div>
    </div>
  );
}
