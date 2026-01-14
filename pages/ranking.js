// pages/ranking.js
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function RankingPage() {
  const [agg, setAgg] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    await fetchRules();
    await fetchAggregated();
    setLoading(false);
  }

  async function fetchRules() {
    const { data } = await supabase.from("ranking_rules").select("*");
    setRules(data || []);
  }

  // Agrega orders por operador
  async function fetchAggregated() {
    // buscamos todas as orders (pequeno dataset)
    const { data, error } = await supabase.from("orders").select("operator_email, receita, id");
    if (error) { console.error(error); return; }
    const map = {};
    data.forEach(o => {
      const key = o.operator_email || "unknown";
      if (!map[key]) map[key] = { operator: key, receita: 0, orders: 0 };
      map[key].receita += Number(o.receita || 0);
      map[key].orders += 1;
    });
    const arr = Object.values(map);
    // normaliza por max
    const maxReceita = Math.max(...arr.map(a=>a.receita), 1);
    const maxOrders = Math.max(...arr.map(a=>a.orders), 1);

    // pega pesos (default receita 50, orders 50)
    const wReceita = (rules.find(r=>r.metric_name==="receita")?.weight) ?? 50;
    const wOrders = (rules.find(r=>r.metric_name==="orders")?.weight) ?? 50;
    const totalW = (Number(wReceita) + Number(wOrders)) || 100;
    const wr = Number(wReceita)/totalW;
    const wo = Number(wOrders)/totalW;

    const scored = arr.map(a => {
      const rScaled = maxReceita ? (a.receita / maxReceita) : 0;
      const oScaled = maxOrders ? (a.orders / maxOrders) : 0;
      const score = rScaled * wr + oScaled * wo;
      return { ...a, score };
    });

    scored.sort((a,b) => b.score - a.score);
    setAgg(scored);
  }

  return (
    <div className="min-h-screen p-6 bg-darkbg text-white">
      <h1 className="text-2xl font-bold text-roxo mb-4">Ranking</h1>

      {loading ? <p>Carregando...</p> : (
        <div className="max-w-3xl">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-darkpanel">
                <th>#</th>
                <th>Operador</th>
                <th>Receita</th>
                <th>Nº Ordens</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {agg.map((r, i) => (
                <tr key={r.operator} className={`border-b ${i<3 ? "bg-black/30" : ""}`}>
                  <td className="py-2">{i+1}</td>
                  <td className="py-2">{r.operator}</td>
                  <td className="py-2">R$ {Number(r.receita || 0).toFixed(2)}</td>
                  <td className="py-2">{r.orders}</td>
                  <td className="py-2">{(r.score*100).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
