import React, { useState } from 'react';
import { Cliente } from '../types';
import { Search, UserPlus, FileHeart, Sparkles } from 'lucide-react';

interface CustomersScreenProps {
  clientes: Cliente[];
  onAddCliente: (cliente: Omit<Cliente, 'id'>) => void;
}

export default function CustomersScreen({ clientes, onAddCliente }: CustomersScreenProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Create state
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [newNome, setNewNome] = useState<string>('');
  const [newCpf, setNewCpf] = useState<string>('');
  const [newTel, setNewTel] = useState<string>('');

  const filtered = clientes.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cpf.includes(searchTerm) ||
    c.telefone.includes(searchTerm)
  );

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNome || !newCpf) return;

    onAddCliente({
      nome: newNome,
      cpf: newCpf,
      telefone: newTel,
      visitas: 1,
      gastoTotal: 0
    });

    setNewNome('');
    setNewCpf('');
    setNewTel('');
    setShowCreateForm(false);
  };

  return (
    <div className="space-y-6 select-none">
      
      <div className="bg-brand-charcoal border border-brand-light-charcoal p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <span className="text-brand-yellow font-mono text-[10px] font-bold tracking-widest uppercase">CADASTRO FIDELIDADE</span>
          <h2 className="text-xl font-sora font-extrabold text-white mt-1">Gestão de Clientes Retidos (Loyalty)</h2>
          <p className="text-xs text-gray-400 mt-0.5">Consulte métricas de retenção, gasto agregado de comandas por CPF cadastrado no salão.</p>
        </div>

        <button
          id="btn-trigger-customer-create"
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-brand-yellow text-brand-black hover:bg-brand-yellow-dark px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition"
        >
          <UserPlus className="w-4 h-4" /> Matricular Novo Cliente
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleSubmit} className="bg-brand-charcoal border border-brand-light-charcoal p-5 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top duration-200">
          <div className="space-y-1">
            <label className="text-[10px] text-gray-400 font-bold uppercase font-mono">Nome Completo</label>
            <input
              id="cust-new-nome"
              type="text"
              required
              value={newNome}
              onChange={(e) => setNewNome(e.target.value)}
              placeholder="Ex: Gabriel Silva"
              className="w-full bg-brand-black/40 border border-brand-light-charcoal text-xs text-white p-2.5 rounded-lg"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-gray-400 font-bold uppercase font-mono">CPF</label>
            <input
              id="cust-new-cpf"
              type="text"
              required
              value={newCpf}
              onChange={(e) => setNewCpf(e.target.value)}
              placeholder="Ex: 000.000.000-00"
              className="w-full bg-brand-black/40 border border-brand-light-charcoal text-xs text-white p-2.5 rounded-lg"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-gray-400 font-bold uppercase font-mono">Telefone WhatsApp</label>
            <input
              id="cust-new-tel"
              type="text"
              value={newTel}
              onChange={(e) => setNewTel(e.target.value)}
              placeholder="Ex: (11) 98765-4321"
              className="w-full bg-brand-black/40 border border-brand-light-charcoal text-xs text-white p-2.5 rounded-lg"
            />
          </div>

          <div className="col-span-1 md:col-span-3 flex justify-end gap-3 pt-2 border-t border-brand-light-charcoal/30">
            <button
              id="btn-cust-cancel"
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="bg-transparent hover:bg-brand-light-charcoal text-gray-400 hover:text-white text-xs font-bold uppercase py-2 px-4 rounded"
            >
              Cancelar
            </button>
            <button
              id="btn-cust-submit"
              type="submit"
              className="bg-brand-yellow hover:bg-brand-yellow-dark text-brand-black text-xs font-extrabold uppercase px-6 py-2 rounded-lg"
            >
              Confirmar Matrícula
            </button>
          </div>
        </form>
      )}

      <div className="bg-brand-charcoal border border-brand-light-charcoal rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 bg-brand-light-charcoal/20 border-b border-brand-light-charcoal">
          <div className="relative max-w-sm">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              id="input-customer-search-filter"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar por nome do cliente, CPF ou contato..."
              className="w-full bg-brand-black/40 border border-brand-light-charcoal text-xs text-white pl-9 pr-3 py-2 rounded-lg"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="p-16 text-center text-gray-500 text-sm">
              Nenhum cliente fidelidade localizado com a consulta dada.
            </div>
          ) : (
            <table className="min-w-[700px] w-full text-left font-sans text-xs">
              <thead>
                <tr className="bg-brand-light-charcoal/30 border-b border-brand-light-charcoal text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <th className="p-4">Titular do Cadastro (Cliente)</th>
                  <th className="p-4">Identificador Fiscal CPF</th>
                  <th className="p-4">Telefone de Contato</th>
                  <th className="p-4">Contagem de Visitas</th>
                  <th className="p-4 text-right">Gasto Acumulado (Total)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-light-charcoal/50 text-gray-200">
                {filtered.map(c => {
                  const isTopClient = c.visitas >= 20;

                  return (
                    <tr key={c.id} className="hover:bg-brand-light-charcoal/30 transition">
                      <td className="p-4 font-bold flex items-center gap-2">
                        {c.nome}
                        {isTopClient && (
                          <span className="bg-brand-yellow font-mono text-brand-black text-[9px] font-black px-1.5 py-0.2 rounded flex items-center gap-0.5" title="Cliente Platinum">
                            ★ VIP
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-mono text-gray-400">
                        {c.cpf}
                      </td>
                      <td className="p-4 font-mono text-gray-400">
                        {c.telefone || 'Sem contato'}
                      </td>
                      <td className="p-4 font-mono">
                        <strong className="text-white">{c.visitas}</strong> visitas no restaurante
                      </td>
                      <td className="p-4 font-mono text-right font-bold text-brand-yellow">
                        {formatCurrency(c.gastoTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
