// pages/registro-ordem.js
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function RegistroOrdem() {
  const [userEmail, setUserEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [produto, setProduto] = useState("");
  const [volume, setVolume] = useState("");
  const [receita, setReceita] = useState("");
  const [customFields, setCustomFields] = useState([]);
  const [customValues, setCustomValues] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    getUser();
    fetchCustomFields();
  }, []);

  async function getUser() {
    const { data } = await supabase.auth.getUser();
    const user = data?.user ?? null;
    if (user) setUserEmail(user.email || "");
  }

  async function fetchCustomFields() {
    const { data, error } = await supabase.from("custom_fields").select("*").eq("active", true).order("id");
    if (error) {
      console.error(error);
      return;
    }
    setCustomFields(data || []);
    // init values
    const init = {};
    (data || []).forEach(f => init[f.name] = "");
    setCustomValues(init);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("Salvando...");
    const payload = {
      operator_email: userEmail,
      codigo_cliente: codigo,
      produto,
      volume: volume ? Number(volume) : 0,
      receita: receita ? Number(receita) : 0,
      custom_values: customValues,
      created_at: new Date().toISOString()
    };
    const { error } = await supabase.from("orders").insert([payload]);
    if (error) {
      setMessage("Erro ao salvar: " + error.message);
    } else {
      setMessage("Ordem registrada com sucesso");
      // limpa
      setCodigo(""); setProduto(""); setVolume(""); setReceita("");
      const cleared = {...customValues};
      Object.keys(cleared).forEach(k => cleared[k] = "");
      setCustomValues(cleared);
    }
  }

  function handleCustomChange(name, value) {
    setCustomValues(prev => ({ ...prev, [name]: value }));
  }

  return (
    <div className="min-h-screen p-6 bg-darkbg text-white">
      <h1 className="text-2xl font-bold text-roxo mb-4">Registro de Ordem</h1>
      <div className="mb-4">Usuário logado: <strong>{userEmail}</strong></div>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
        <label>
          Email do Operador
          <input className="w-full p-2 mt-1 bg-black/20" value={userEmail} readOnly />
        </label>

        <label>
          Código do Cliente
          <input value={codigo} onChange={e => setCodigo(e.target.value)} className="w-full p-2 mt-1 bg-black/20" />
        </label>

        <label>
          Produto
          <input value={produto} onChange={e => setProduto(e.target.value)} className="w-full p-2 mt-1 bg-black/20" />
        </label>

        <label>
          Volume
          <input type="number" value={volume} onChange={e => setVolume(e.target.value)} className="w-full p-2 mt-1 bg-black/20" />
        </label>

        <label>
          Receita
          <input type="number" step="0.01" value={receita} onChange={e => setReceita(e.target.value)} className="w-full p-2 mt-1 bg-black/20" />
        </label>

        {customFields.map(f => (
          <label key={f.id}>
            {f.name}
            {f.type === "boolean" ? (
              <select value={customValues[f.name] ?? ""} onChange={e => handleCustomChange(f.name, e.target.value)} className="w-full p-2 mt-1 bg-black/20">
                <option value="">--</option>
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            ) : (
              <input
                value={customValues[f.name] ?? ""}
                onChange={e => handleCustomChange(f.name, e.target.value)}
                className="w-full p-2 mt-1 bg-black/20"
                type={f.type === "number" ? "number" : "text"}
              />
            )}
          </label>
        ))}

        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 bg-roxo text-black">Registrar</button>
          <button type="button" onClick={() => { setCodigo(""); setProduto(""); setVolume(""); setReceita(""); }} className="px-4 py-2 border">Limpar</button>
        </div>

        {message && <div className="mt-2 p-2 bg-darkpanel">{message}</div>}
      </form>
    </div>
  );
}
