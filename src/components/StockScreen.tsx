import React, { useState, useEffect } from 'react';
import { Insumo } from '../types';
import { Plus, Minus, AlertTriangle, Search, Filter, Sparkles, PlusCircle, Check, ArrowDownCircle } from 'lucide-react';

interface StockScreenProps {
  insumos: Insumo[];
  onUpdateStock: (id: string, newAmount: number, changeType?: 'entrada' | 'saída', details?: string) => void;
  onAddInsumo: (insumo: Omit<Insumo, 'id'>) => void;
  onEditInsumo: (insumo: Insumo) => void;
}

export default function StockScreen({ insumos, onUpdateStock, onAddInsumo, onEditInsumo }: StockScreenProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [catFilter, setCatFilter] = useState<string>('TODOS');
  
  // Modifiers
  const [editingInsumoId, setEditingInsumoId] = useState<string | null>(null);
  const [stockChangeVal, setStockChangeVal] = useState<number>(1);
  const [stockChangeNote, setStockChangeNote] = useState<string>('');

  // Editing tabs & fields
  const [activeTab, setActiveTab] = useState<'ajuste' | 'editar'>('ajuste');
  const [editNome, setEditNome] = useState<string>('');
  const [editCategoria, setEditCategoria] = useState<'Carnes' | 'Bebidas' | 'Hortifruti' | 'Secos' | 'Lácteos'>('Carnes');
  const [editEstoqueAtual, setEditEstoqueAtual] = useState<number>(0);
  const [editEstoqueMinimo, setEditEstoqueMinimo] = useState<number>(0);
  const [editUnidade, setEditUnidade] = useState<string>('kg');
  const [editCusto, setEditCusto] = useState<number>(0);
  const [editFornecedor, setEditFornecedor] = useState<string>('');

  const selectedInsumo = insumos.find(x => x.id === editingInsumoId);

  useEffect(() => {
    if (selectedInsumo) {
      setEditNome(selectedInsumo.nome);
      setEditCategoria(selectedInsumo.categoria);
      setEditEstoqueAtual(selectedInsumo.estoqueAtual);
      setEditEstoqueMinimo(selectedInsumo.estoqueMinimo);
      setEditUnidade(selectedInsumo.unidade);
      setEditCusto(selectedInsumo.custoPorUnidade);
      setEditFornecedor(selectedInsumo.fornecedor);
    }
  }, [editingInsumoId]);

  // Creater form
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [newInsumoNome, setNewInsumoNome] = useState<string>('');
  const [newInsumoEstoque, setNewInsumoEstoque] = useState<number>(0);
  const [newInsumoMin, setNewInsumoMin] = useState<number>(0);
  const [newInsumoUnidade, setNewInsumoUnidade] = useState<string>('kg');
  const [newInsumoCat, setNewInsumoCat] = useState<'Carnes' | 'Bebidas' | 'Hortifruti' | 'Secos' | 'Lácteos'>('Carnes');
  const [newInsumoCusto, setNewInsumoCusto] = useState<number>(0);
  const [newInsumoFornecedor, setNewInsumoFornecedor] = useState<string>('');

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const filteredInsumos = insumos.filter(ins => {
    const matchesSearch = ins.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
      ins.fornecedor.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (catFilter === 'TODOS') return matchesSearch;
    return matchesSearch && ins.categoria === catFilter;
  });

  const handleApplyChange = (dir: 'entrada' | 'saída') => {
    if (editingInsumoId) {
      const target = insumos.find(x => x.id === editingInsumoId);
      if (!target) return;
      
      const change = dir === 'entrada' ? stockChangeVal : -stockChangeVal;
      const finalVal = Math.max(0, target.estoqueAtual + change);
      
      onUpdateStock(
        editingInsumoId, 
        finalVal, 
        dir, 
        `Estoque alterado em ${stockChangeVal} ${target.unidade}. Motivo: ${stockChangeNote || 'Ajuste manual de estoque'}`
      );

      // Reset
      setEditingInsumoId(null);
      setStockChangeVal(1);
      setStockChangeNote('');
    }
  };

  const handleCreateInsumoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInsumoNome || !newInsumoFornecedor || newInsumoEstoque < 0) return;

    onAddInsumo({
      nome: newInsumoNome,
      estoqueAtual: newInsumoEstoque,
      estoqueMinimo: newInsumoMin,
      unidade: newInsumoUnidade,
      categoria: newInsumoCat,
      custoPorUnidade: newInsumoCusto,
      fornecedor: newInsumoFornecedor
    });

    // Reset create
    setNewInsumoNome('');
    setNewInsumoEstoque(0);
    setNewInsumoMin(0);
    setNewInsumoUnidade('kg');
    setNewInsumoCat('Carnes');
    setNewInsumoCusto(0);
    setNewInsumoFornecedor('');
    setShowCreateForm(false);
  };

  return (
    <div className="space-y-6 select-none">
      
      {/* Overview Block */}
      <div className="bg-brand-charcoal border border-brand-light-charcoal p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <span className="text-brand-yellow font-mono text-[10px] font-bold tracking-widest uppercase">CONTROLE DE ESTOQUE</span>
          <h2 className="text-xl font-sora font-extrabold text-white mt-1">Estoque & Ingredientes</h2>
          <p className="text-xs text-gray-400 mt-0.5">Monitore os níveis de ingredientes, suprimentos e materiais necessários para a cozinha.</p>
        </div>

        <button
          id="btn-trigger-create-insumo"
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-brand-yellow text-brand-black hover:bg-brand-yellow-dark px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition"
        >
          <PlusCircle className="w-4 h-4" /> Cadastrar Novo Insumo
        </button>
      </div>

      {/* Conditional Create Form Drawer */}
      {showCreateForm && (
        <form onSubmit={handleCreateInsumoSubmit} className="bg-brand-charcoal border border-brand-light-charcoal rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in slide-in-from-top duration-200">
          <div className="col-span-1 md:col-span-2 space-y-1">
            <label className="text-[10px] text-gray-400 font-bold uppercase font-mono tracking-wider">Nome do Insumo</label>
            <input
              id="input-insumo-nome"
              type="text"
              required
              value={newInsumoNome}
              onChange={(e) => setNewInsumoNome(e.target.value)}
              placeholder="Ex: Queijo Minas Padrão"
              className="w-full bg-brand-black/40 border border-brand-light-charcoal text-xs text-white p-2.5 rounded-lg"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-gray-400 font-bold uppercase font-mono tracking-wider">Categoria</label>
            <select
              id="select-insumo-categoria"
              value={newInsumoCat}
              onChange={(e) => setNewInsumoCat(e.target.value as any)}
              className="w-full bg-brand-black/40 border border-brand-light-charcoal text-xs text-white p-2.5 rounded-lg"
            >
              <option value="Carnes">Carnes</option>
              <option value="Bebidas">Bebidas</option>
              <option value="Hortifruti">Hortifruti</option>
              <option value="Secos">Secos</option>
              <option value="Lácteos">Lácteos</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-gray-400 font-bold uppercase font-mono tracking-wider">Estoque Atual Inicial</label>
            <input
              id="input-insumo-estoque"
              type="number"
              step="any"
              required
              value={newInsumoEstoque || ''}
              onChange={(e) => setNewInsumoEstoque(Number(e.target.value))}
              placeholder="Ex: 50"
              className="w-full bg-brand-black/40 border border-brand-light-charcoal text-xs text-white p-2.5 rounded-lg"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-gray-400 font-bold uppercase font-mono tracking-wider">Estoque Mínimo Alerta</label>
            <input
              id="input-insumo-minimo"
              type="number"
              required
              value={newInsumoMin || ''}
              onChange={(e) => setNewInsumoMin(Number(e.target.value))}
              placeholder="Ex: 10"
              className="w-full bg-brand-black/40 border border-brand-light-charcoal text-xs text-white p-2.5 rounded-lg"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-gray-400 font-bold uppercase font-mono tracking-wider">Unidade de Medida</label>
            <input
              id="input-insumo-unidade"
              type="text"
              required
              value={newInsumoUnidade}
              onChange={(e) => setNewInsumoUnidade(e.target.value)}
              placeholder="Ex: kg, un, litros..."
              className="w-full bg-brand-black/40 border border-brand-light-charcoal text-xs text-white p-2.5 rounded-lg"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-gray-400 font-bold uppercase font-mono tracking-wider">Custo Unitário (R$)</label>
            <input
              id="input-insumo-custo"
              type="number"
              step="any"
              required
              value={newInsumoCusto || ''}
              onChange={(e) => setNewInsumoCusto(Number(e.target.value))}
              placeholder="Ex: 14.50"
              className="w-full bg-brand-black/40 border border-brand-light-charcoal text-xs text-white p-2.5 rounded-lg"
            />
          </div>

          <div className="space-y-1 col-span-1 md:col-span-2">
            <label className="text-[10px] text-gray-400 font-bold uppercase font-mono tracking-wider">Fornecedor Preferencial</label>
            <input
              id="input-insumo-fornecedor"
              type="text"
              required
              value={newInsumoFornecedor}
              onChange={(e) => setNewInsumoFornecedor(e.target.value)}
              placeholder="Ex: Ambev SP ou HortiFrut SA"
              className="w-full bg-brand-black/40 border border-brand-light-charcoal text-xs text-white p-2.5 rounded-lg"
            />
          </div>

          <div className="col-span-1 md:col-span-3 lg:col-span-4 flex justify-end gap-3 pt-2 border-t border-brand-light-charcoal/30">
            <button
              id="btn-cancel-create-insumo"
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="bg-transparent hover:bg-brand-light-charcoal text-gray-400 hover:text-white text-xs font-bold uppercase py-2 px-4 rounded"
            >
              Cancelar
            </button>
            <button
              id="btn-submit-create-insumo"
              type="submit"
              className="bg-brand-yellow hover:bg-brand-yellow-dark text-brand-black text-xs font-extrabold uppercase px-6 py-2 rounded-lg transition"
            >
              Cadastrar Insumo
            </button>
          </div>
        </form>
      )}

      {/* Grid of contents */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Main Stock Table: 8 cols */}
        <div className="xl:col-span-8 bg-brand-charcoal border border-brand-light-charcoal rounded-xl overflow-hidden flex flex-col">
          {/* Header searches */}
          <div className="p-4 bg-brand-light-charcoal/20 border-b border-brand-light-charcoal grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                id="input-stock-search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar insumo por nome ou fornecedor..."
                className="w-full bg-brand-black/40 border border-brand-light-charcoal text-xs text-white pl-9 pr-3 py-2 rounded-lg"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider font-sans whitespace-nowrap">Categoria:</span>
              <select
                id="select-stock-category-filter"
                value={catFilter}
                onChange={(e) => setCatFilter(e.target.value)}
                className="w-full bg-brand-black/40 border border-brand-light-charcoal text-xs text-white p-2 rounded"
              >
                <option value="TODOS">Todas as Categorias</option>
                <option value="Carnes">Carnes</option>
                <option value="Bebidas">Bebidas</option>
                <option value="Hortifruti">Hortifruti</option>
                <option value="Secos">Secos</option>
                <option value="Lácteos">Lácteos</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredInsumos.length === 0 ? (
              <div className="p-16 text-center text-gray-500 text-sm">
                Nenhum insumo encontrado.
              </div>
            ) : (
              <table className="min-w-[750px] w-full text-left font-sans text-xs">
                <thead>
                  <tr className="bg-brand-light-charcoal/30 border-b border-brand-light-charcoal text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <th className="p-4">Item (Insumo)</th>
                    <th className="p-4">Categoria</th>
                    <th className="p-4">Qtd. Estoque</th>
                    <th className="p-4">Mín. Alerta</th>
                    <th className="p-4">Custo Prod.</th>
                    <th className="p-4">Fornecedor</th>
                    <th className="p-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-light-charcoal/50">
                  {filteredInsumos.map(ins => {
                    const isAlert = ins.estoqueAtual <= ins.estoqueMinimo;
                    const isSelected = editingInsumoId === ins.id;

                    return (
                      <tr
                        key={ins.id}
                        id={`stock-insumo-row-${ins.id}`}
                        onClick={() => {
                          setEditingInsumoId(ins.id);
                          setStockChangeVal(1);
                          setActiveTab('ajuste');
                        }}
                        className={`cursor-pointer hover:bg-brand-light-charcoal/30 transition ${
                          isSelected ? 'bg-brand-yellow/5 border-l-4 border-l-brand-yellow' : ''
                        }`}
                      >
                        <td className="p-4 font-bold text-gray-200">
                          {ins.nome}
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full border border-brand-light-charcoal text-gray-400">
                            {ins.categoria.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`font-mono font-bold text-sm ${isAlert ? 'text-red-400' : 'text-emerald-400'}`}>
                            {ins.estoqueAtual} <span className="text-[10px] font-normal text-gray-400">{ins.unidade}</span>
                          </span>
                        </td>
                        <td className="p-4 font-mono text-gray-400">
                          {ins.estoqueMinimo} {ins.unidade}
                        </td>
                        <td className="p-4 font-mono text-gray-300">
                          {formatCurrency(ins.custoPorUnidade)}
                        </td>
                        <td className="p-4 text-gray-400 max-w-[130px] truncate">
                          {ins.fornecedor}
                        </td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-1.5">
                            {isAlert && (
                              <div className="p-1 px-2 border border-red-500/20 bg-red-500/10 text-red-400 font-mono text-[9px] font-bold rounded flex items-center gap-1 uppercase tracking-wider animate-pulse">
                                <AlertTriangle className="w-3 h-3" /> CRÍTICO
                              </div>
                            )}

                            <button
                              id={`btn-open-stock-quick-${ins.id}`}
                              onClick={() => {
                                setEditingInsumoId(ins.id);
                                setStockChangeVal(1);
                                setActiveTab('ajuste');
                              }}
                              className="bg-brand-light-charcoal hover:bg-brand-yellow hover:text-brand-black px-2 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition"
                            >
                              Manejar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right quick adjustment card: 4 cols */}
        <div className="xl:col-span-4 bg-brand-charcoal border border-brand-light-charcoal rounded-xl p-5 space-y-4">
          <div className="border-b border-brand-light-charcoal pb-3">
            <h3 className="font-sora font-extrabold text-sm uppercase tracking-wider text-white">
              {editingInsumoId === null ? 'Gestão de Insumo' : activeTab === 'ajuste' ? 'Ajuste de Estoque Rápido' : 'Editar Cadastro de Insumo'}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {editingInsumoId === null 
                ? 'Selecione um insumo para gerenciar seu saldo ou editar seus dados cadastrais.' 
                : activeTab === 'ajuste'
                  ? 'Insira cargas de abastecimento ou descarte de perdas de ingredientes.'
                  : 'Atualize os dados, estoque, alerta mínimo e fornecedor do insumo.'}
            </p>
          </div>

          {editingInsumoId === null ? (
            <div className="py-20 text-center text-gray-500 text-xs select-none">
              <ArrowDownCircle className="w-8 h-8 text-gray-700 mx-auto mb-2 animate-bounce" />
              Selecione uma matéria-prima da tabela para manejar cargas de estoque ou editar completamente suas informações.
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Tab Selector */}
              <div className="flex border-b border-brand-light-charcoal/40 pb-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('ajuste')}
                  className={`flex-1 pb-2 text-[11px] font-bold uppercase tracking-wider transition-all border-b-2 text-center ${
                    activeTab === 'ajuste'
                      ? 'border-brand-yellow text-brand-yellow font-black'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  Manejar Estoque
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('editar')}
                  className={`flex-1 pb-2 text-[11px] font-bold uppercase tracking-wider transition-all border-b-2 text-center ${
                    activeTab === 'editar'
                      ? 'border-brand-yellow text-brand-yellow font-black'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  Editar Dados
                </button>
              </div>

              {(() => {
                const item = insumos.find(x => x.id === editingInsumoId);
                if (!item) return null;

                if (activeTab === 'editar') {
                  const handleEditSubmit = (e: React.FormEvent) => {
                    e.preventDefault();
                    onEditInsumo({
                      id: item.id,
                      nome: editNome,
                      categoria: editCategoria,
                      estoqueAtual: editEstoqueAtual,
                      estoqueMinimo: editEstoqueMinimo,
                      unidade: editUnidade,
                      custoPorUnidade: editCusto,
                      fornecedor: editFornecedor
                    });
                    setActiveTab('ajuste');
                  };

                  return (
                    <form onSubmit={handleEditSubmit} className="space-y-3 pt-1">
                      <div className="space-y-1">
                        <label className="block text-[9px] text-gray-400 font-bold uppercase font-mono tracking-wider">Nome do Insumo</label>
                        <input
                          id="edit-insumo-nome"
                          type="text"
                          required
                          value={editNome}
                          onChange={(e) => setEditNome(e.target.value)}
                          className="w-full bg-brand-black/40 border border-brand-light-charcoal text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-brand-yellow"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="block text-[9px] text-gray-400 font-bold uppercase font-mono tracking-wider">Categoria</label>
                          <select
                            id="edit-insumo-categoria"
                            value={editCategoria}
                            onChange={(e) => setEditCategoria(e.target.value as any)}
                            className="w-full bg-brand-black/40 border border-brand-light-charcoal text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-brand-yellow"
                          >
                            <option value="Carnes">Carnes</option>
                            <option value="Bebidas">Bebidas</option>
                            <option value="Hortifruti">Hortifruti</option>
                            <option value="Secos">Secos</option>
                            <option value="Lácteos">Lácteos</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[9px] text-gray-400 font-bold uppercase font-mono tracking-wider">Unidade</label>
                          <input
                            id="edit-insumo-unidade"
                            type="text"
                            required
                            value={editUnidade}
                            onChange={(e) => setEditUnidade(e.target.value)}
                            className="w-full bg-brand-black/40 border border-brand-light-charcoal text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-brand-yellow"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="block text-[9px] text-gray-400 font-bold uppercase font-mono tracking-wider">Estoque Atual</label>
                          <input
                            id="edit-insumo-estoque"
                            type="number"
                            step="any"
                            required
                            value={editEstoqueAtual || ''}
                            onChange={(e) => setEditEstoqueAtual(Number(e.target.value))}
                            className="w-full bg-brand-black/40 border border-brand-light-charcoal text-sm font-mono font-bold text-white p-2 rounded-lg focus:outline-none focus:border-brand-yellow"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[9px] text-gray-400 font-bold uppercase font-mono tracking-wider">Mínimo Alerta</label>
                          <input
                            id="edit-insumo-minimo"
                            type="number"
                            required
                            value={editEstoqueMinimo || ''}
                            onChange={(e) => setEditEstoqueMinimo(Number(e.target.value))}
                            className="w-full bg-brand-black/40 border border-brand-light-charcoal text-sm font-mono font-bold text-white p-2 rounded-lg focus:outline-none focus:border-brand-yellow"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] text-gray-400 font-bold uppercase font-mono tracking-wider">Custo Unitário (R$)</label>
                        <input
                          id="edit-insumo-custo"
                          type="number"
                          step="any"
                          required
                          value={editCusto || ''}
                          onChange={(e) => setEditCusto(Number(e.target.value))}
                          className="w-full bg-brand-black/40 border border-brand-light-charcoal text-xs text-white p-2.5 rounded-lg focus:outline-none focus:border-brand-yellow"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] text-gray-400 font-bold uppercase font-mono tracking-wider">Fornecedor Preferencial</label>
                        <input
                          id="edit-insumo-fornecedor"
                          type="text"
                          required
                          value={editFornecedor}
                          onChange={(e) => setEditFornecedor(e.target.value)}
                          className="w-full bg-brand-black/40 border border-brand-light-charcoal text-xs text-white p-2 rounded-lg focus:outline-none focus:border-brand-yellow"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <button
                          id="btn-cancel-edit-insumo"
                          type="button"
                          onClick={() => {
                            setEditNome(item.nome);
                            setEditCategoria(item.categoria);
                            setEditEstoqueAtual(item.estoqueAtual);
                            setEditEstoqueMinimo(item.estoqueMinimo);
                            setEditUnidade(item.unidade);
                            setEditCusto(item.custoPorUnidade);
                            setEditFornecedor(item.fornecedor);
                            setActiveTab('ajuste');
                          }}
                          className="bg-transparent hover:bg-brand-light-charcoal text-gray-400 hover:text-white border border-brand-light-charcoal py-2 px-3 rounded text-xs font-bold uppercase transition text-center"
                        >
                          Cancelar
                        </button>
                        <button
                          id="btn-save-edit-insumo"
                          type="submit"
                          className="bg-brand-yellow hover:bg-brand-yellow-dark text-brand-black text-xs font-extrabold uppercase py-2 px-3 rounded-lg transition text-center"
                        >
                          Salvar
                        </button>
                      </div>
                    </form>
                  );
                }

                return (
                  <div className="space-y-4">
                    <div className="bg-brand-black/30 border border-brand-light-charcoal p-3.5 rounded-lg flex justify-between items-center text-xs">
                      <div>
                        <span className="text-[9px] font-mono text-gray-500 uppercase block">ITEM SELECIONADO</span>
                        <strong className="text-white text-sm font-bold uppercase">{item.nome}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-mono text-gray-500 block uppercase">SALDO ATUAL</span>
                        <strong className={`font-mono text-base font-extrabold ${item.estoqueAtual <= item.estoqueMinimo ? 'text-red-400' : 'text-emerald-400'}`}>
                          {item.estoqueAtual} {item.unidade}
                        </strong>
                      </div>
                    </div>

                    {/* Numeric Changer input */}
                    <div className="space-y-1">
                      <label className="block text-[10px] text-gray-400 font-bold uppercase font-mono tracking-wider">Quantidade do Lote</label>
                      <div className="flex items-center gap-2">
                        <button
                          id="btn-modal-qty-dec"
                          type="button"
                          onClick={() => setStockChangeVal(Math.max(1, stockChangeVal - 1))}
                          className="p-2.5 bg-brand-light-charcoal hover:bg-brand-yellow hover:text-brand-black rounded-lg text-white transition"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          id="input-modal-qty-num"
                          type="number"
                          value={stockChangeVal || ''}
                          onChange={(e) => setStockChangeVal(Number(e.target.value))}
                          className="flex-1 bg-brand-black/40 border border-brand-light-charcoal text-center text-sm font-mono font-extrabold text-white p-2 py-2 select-all rounded-lg"
                        />
                        <button
                          id="btn-modal-qty-inc"
                          type="button"
                          onClick={() => setStockChangeVal(stockChangeVal + 1)}
                          className="p-2.5 bg-brand-light-charcoal hover:bg-brand-yellow hover:text-brand-black rounded-lg text-white transition"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Reason input notes */}
                    <div className="space-y-1">
                      <label className="block text-[10px] text-gray-400 font-bold uppercase font-mono tracking-wider">Motivo / Justificativa</label>
                      <input
                        id="input-modal-note-reason"
                        type="text"
                        value={stockChangeNote}
                        onChange={(e) => setStockChangeNote(e.target.value)}
                        placeholder="Ex: Nota fiscal Compra 332 ou Quebra Cozinha"
                        className="w-full bg-brand-black/40 border border-brand-light-charcoal text-xs text-white p-2.5 rounded-lg"
                      />
                    </div>

                    {/* Action grid button */}
                    <div className="grid grid-cols-2 gap-2.5 pt-2">
                      <button
                        id="btn-apply-loss"
                        type="button"
                        onClick={() => handleApplyChange('saída')}
                        className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition"
                      >
                        <Minus className="w-3.5 h-3.5" /> Dar Baixa (Falta)
                      </button>

                      <button
                        id="btn-apply-supply"
                        type="button"
                        onClick={() => handleApplyChange('entrada')}
                        className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/20 py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition"
                      >
                        <Plus className="w-3.5 h-3.5" /> Adicionar (Carga)
                      </button>
                    </div>

                    <button
                      id="btn-close-modal-adjuster"
                      type="button"
                      onClick={() => setEditingInsumoId(null)}
                      className="w-full bg-transparent hover:bg-brand-light-charcoal text-gray-400 hover:text-white text-xs font-bold py-1.5 rounded transition"
                    >
                      Cancelar
                    </button>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
