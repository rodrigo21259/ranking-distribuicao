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

    // 🔥 REDIRECT GARANTIDO
    router.push("/dashboard");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Login</h1>

      <input
        style={styles.input}
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        style={styles.input}
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        style={styles.button}
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>

      {message && <p style={styles.error}>{message}</p>}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#000",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "#9b6cff",
    marginBottom: 20,
  },
  input: {
    width: 300,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    width: 300,
    padding: 10,
    background: "#9b6cff",
    color: "#000",
    border: "none",
    cursor: "pointer",
  },
  error: {
    marginTop: 10,
    color: "red",
  },
};
