// pages/admin.js
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

/*
  Admin page:
  - Lista ordens (orders)
  - Edita/atualiza ordens
  - Deleta ordens
  - Gerencia custom_fields (create / toggle active / delete)
  - Gerencia ranking_rules (ajusta pesos)
  - Export CSV das ordens
  Assuntos avançados (audit log, permissões) podem ser adicionados depois.
*/

export default function Admin() {
  const [orders, setOrders] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editOrder, setEditOrder] = useState(null); // objeto da ordem em edição
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState("text");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    await Promise.all([fetchOrders(), fetchFields(), fetchRules()]);
    setLoading(false);
  }

  // ---------------- ORDERS ----------------
  async function fetchOrders() {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error) {
      console.error("Erro orders:", error);
      return;
    }
    setOrders(data || []);
  }

  async function handleDeleteOrder(id) {
    if (!confirm("Confirma excluir essa ordem?")) return;
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) {
      setMessage("Erro ao excluir: " + error.message);
      return;
    }
    setMessage("Ordem excluída");
    fetchOrders();
  }

  function openEdit(order) {
    setEditOrder({ ...order }); // clone
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveEdit() {
    if (!editOrder?.id) return;
    const payload = { ...editOrder };
    delete payload.id;
    const { error } = await supabase.from("orders").update(payload).eq("id", editOrder.id);
    if (error) {
      setMessage("Erro ao salvar: " + error.message);
      return;
    }
    setMessage("Ordem atualizada");
    setEditOrder(null);
    fetchOrders();
  }

  // ---------------- CUSTOM FIELDS ----------------
  async function fetchFields() {
    const { data, error } = await supabase.from("custom_fields").select("*").order("id");
    if (error) {
      console.error("Erro custom_fields:", error);
      return;
    }
    setCustomFields(data || []);
  }

  async function addCustomField() {
    if (!newFieldName.trim()) {
      setMessage("Nome do campo vazio");
      return;
    }
    const payload = {
      name: newFieldName.trim(),
      type: newFieldType,
      active: true,
      created_at: new Date().toISOString()
    };
    const { error } = await supabase.from("custom_fields").insert([payload]);
    if (error) {
      setMessage("Erro criar campo: " + error.message);
      return;
    }
    setNewFieldName("");
    setNewFieldType("text");
    setMessage("Campo criado");
    fetchFields();
  }

  async function toggleField(id, current) {
    const { error } = await supabase.from("custom_fields").update({ active: !current }).eq("id", id);
    if (error) {
      setMessage("Erro ao alternar: " + error.message);
      return;
    }
    fetchFields();
  }

  async function deleteField(id) {
    if (!confirm("Excluir campo dinâmico? Isso não apagará automaticamente valores históricos.")) return;
    const { error } = await supabase.from("custom_fields").delete().eq("id", id);
    if (error) {
      setMessage("Erro ao deletar campo: " + error.message);
      return;
    }
    fetchFields();
    setMessage("Campo deletado");
  }

  // ---------------- RANKING RULES ----------------
  async function fetchRules() {
    const { data, error } = await supabase.from("ranking_rules").select("*").order("id");
    if (error) {
      console.error("Erro ranking_rules:", error);
      return;
    }
    setRules(data || []);
  }

  async function updateRule(id, newWeight) {
    const weight = Number(newWeight);
    if (isNaN(weight)) {
      setMessage("Peso inválido");
      return;
    }
    const { error } = await supabase.from("ranking_rules").update({ weight }).eq("id", id);
    if (error) {
      setMessage("Erro ao atualizar regra: " + error.message);
      return;
    }
    setMessage("Peso atualizado");
    fetchRules();
  }

  // ---------------- EXPORT CSV ----------------
  function downloadCSV() {
    if (!orders.length) {
      setMessage("Nenhuma ordem para exportar");
      return;
    }

    // Headers: fixed + custom field names
    const headers = [
      "id",
      "created_at",
      "operator_email",
      "codigo_cliente",
      "produto",
      "volume",
      "receita"
    ];
    const customNames = (customFields || []).map((f) => f.name);
    const allHeaders = [...headers, ...customNames];

    // Map rows
    const csvRows = [allHeaders.join(",")];
    orders.forEach((o) => {
      const row = headers.map((h) => {
        const v = o[h] ?? "";
        // sanitize
        return `"${String(v).replace(/"/g, '""')}"`;
      });
      // custom fields: try to read o.custom_values if exists; fallback empty
      const customVals = customNames.map((name) => {
        if (o.custom_values && typeof o.custom_values === "object") {
          return `"${String(o.custom_values[name] ?? "").replace(/"/g, '""')}"`;
        }
        return '""';
      });
      csvRows.push([...row, ...customVals].join(","));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_export_${new Date().toISOString().slice(0,19)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Export iniciado");
  }

  // ---------------- RENDER ----------------
  return (
    <div className="min-h-screen p-6 bg-darkbg text-white">
      <h1 className="text-2xl font-bold text-roxo mb-4">Painel Admin</h1>

      {message && (
        <div className="mb-4 p-3 bg-darkpanel border-l-4 border-roxo">
          {message}
        </div>
      )}

      {/* Edit form (quando selecionado) */}
      {editOrder && (
        <div className="mb-6 p-4 bg-darkpanel">
          <h2 className="text-lg font-semibold">Editando ordem: {editOrder.id}</h2>
          <div className="grid grid-cols-1 gap-3 mt-3 max-w-2xl">
            <label>
              Email do operador
              <input
                className="w-full p-2 mt-1 bg-black/20 text-white"
                value={editOrder.operator_email || ""}
                onChange={(e) => setEditOrder({ ...editOrder, operator_email: e.target.value })}
              />
            </label>

            <label>
              Código do cliente
              <input
                className="w-full p-2 mt-1 bg-black/20 text-white"
                value={editOrder.codigo_cliente || ""}
                onChange={(e) => setEditOrder({ ...editOrder, codigo_cliente: e.target.value })}
              />
            </label>

            <label>
              Produto
              <input
                className="w-full p-2 mt-1 bg-black/20 text-white"
                value={editOrder.produto || ""}
                onChange={(e) => setEditOrder({ ...editOrder, produto: e.target.value })}
              />
            </label>

            <label>
              Volume
              <input
                type="number"
                className="w-full p-2 mt-1 bg-black/20 text-white"
                value={editOrder.volume ?? ""}
                onChange={(e) => setEditOrder({ ...editOrder, volume: e.target.value })}
              />
            </label>

            <label>
              Receita
              <input
                type="number"
                step="0.01"
                className="w-full p-2 mt-1 bg-black/20 text-white"
                value={editOrder.receita ?? ""}
                onChange={(e) => setEditOrder({ ...editOrder, receita: e.target.value })}
              />
            </label>

            <div className="flex gap-2 mt-2">
              <button onClick={saveEdit} className="px-4 py-2 bg-roxo text-black">Salvar</button>
              <button onClick={() => setEditOrder(null)} className="px-4 py-2 border">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* ORDERS LIST */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg">Ordens ({orders.length})</h2>
          <div className="flex gap-2">
            <button onClick={fetchOrders} className="px-4 py-2 border">Refresh</button>
            <button onClick={downloadCSV} className="px-4 py-2 bg-roxo text-black">Export CSV</button>
          </div>
        </div>

        {loading ? <p>Carregando...</p> : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-sm">
              <thead>
                <tr className="text-left border-b border-darkpanel">
                  <th className="py-2">ID</th>
                  <th className="py-2">Operador</th>
                  <th className="py-2">Cliente</th>
                  <th className="py-2">Produto</th>
                  <th className="py-2">Receita</th>
                  <th className="py-2">Criado</th>
                  <th className="py-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-black/20">
                    <td className="py-2">{o.id}</td>
                    <td className="py-2">{o.operator_email}</td>
                    <td className="py-2">{o.codigo_cliente}</td>
                    <td className="py-2">{o.produto}</td>
                    <td className="py-2">R$ {Number(o.receita || 0).toFixed(2)}</td>
                    <td className="py-2">{o.created_at ? new Date(o.created_at).toLocaleString() : ""}</td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(o)} className="px-2 py-1 border">Editar</button>
                        <button onClick={() => handleDeleteOrder(o.id)} className="px-2 py-1 border text-red-400">Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* CUSTOM FIELDS */}
      <section className="mb-8">
        <h2 className="text-lg mb-3">Campos Dinâmicos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-darkpanel">
            <label className="block mb-1">Nome</label>
            <input className="w-full p-2 mb-2 bg-black/20" value={newFieldName} onChange={(e) => setNewFieldName(e.target.value)} />
            <label className="block mb-1">Tipo</label>
            <select className="w-full p-2 mb-3 bg-black/20" value={newFieldType} onChange={e => setNewFieldType(e.target.value)}>
              <option value="text">Texto</option>
              <option value="number">Número</option>
              <option value="boolean">Boolean</option>
              <option value="select">Dropdown</option>
            </select>
            <button onClick={addCustomField} className="px-4 py-2 bg-roxo text-black">Criar campo</button>
          </div>

          <div className="md:col-span-2 p-3 bg-darkpanel">
            <h3 className="font-semibold mb-2">Lista de campos</h3>
            <div className="space-y-2">
              {customFields.map(f => (
                <div key={f.id} className="flex items-center justify-between p-2 bg-black/10">
                  <div>
                    <strong>{f.name}</strong> <span className="ml-2 text-xs text-gray-400">{f.type}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <label className="text-sm">
                      <input type="checkbox" checked={f.active} onChange={() => toggleField(f.id, f.active)} /> ativo
                    </label>
                    <button onClick={() => deleteField(f.id)} className="px-2 py-1 text-red-400">Deletar</button>
                  </div>
                </div>
              ))}
              {customFields.length === 0 && <p className="text-sm text-gray-400">Nenhum campo</p>}
            </div>
          </div>
        </div>
      </section>

      {/* RANKING RULES */}
      <section className="mb-12 p-4 bg-darkpanel max-w-2xl">
        <h2 className="text-lg mb-2">Regras do Ranking (pesos)</h2>
        <p className="text-sm text-gray-400 mb-3">Ajuste os pesos que o ranking vai usar (ex: receita 50, ordens 50).</p>
        <div className="space-y-3">
          {rules.map(r => (
            <div key={r.id} className="flex items-center gap-3">
              <div style={{minWidth: 180}}>{r.metric_name}</div>
              <input
                type="number"
                step="0.1"
                defaultValue={r.weight}
                onBlur={(e) => updateRule(r.id, e.target.value)}
                className="p-2 bg-black/20"
              />
              <div className="text-sm text-gray-400">atual: {r.weight}</div>
            </div>
          ))}
          {rules.length === 0 && <p className="text-sm text-gray-400">Nenhuma regra encontrada</p>}
        </div>
      </section>
    </div>
  );
}
