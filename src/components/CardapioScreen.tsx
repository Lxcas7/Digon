import React, { useState } from 'react';
import { MenuItem, Insumo, IngredienteReceita } from '../types';
import { Plus, Trash2, Calendar, Edit, ClipboardList, Check, Sparkles, SlidersHorizontal, ShoppingBag, Utensils, IndianRupee, HelpCircle } from 'lucide-react';

interface CardapioScreenProps {
  menuItems: MenuItem[];
  insumos: Insumo[];
  onAddMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  onUpdateMenuItem: (item: MenuItem) => void;
  onDeleteMenuItem: (id: string) => void;
  addLog: (acao: string, detalhes: string) => void;
}

const DIAS_SEMANA = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

export default function CardapioScreen({
  menuItems,
  insumos,
  onAddMenuItem,
  onUpdateMenuItem,
  onDeleteMenuItem,
  addLog
}: CardapioScreenProps) {
  const [activeTab, setActiveTab] = useState<'geral' | 'rotatividade' | 'flexivel'>('geral');
  const [selectedCategory, setSelectedCategory] = useState<'TODOS' | 'Entradas' | 'Prato Principal' | 'Bebidas' | 'Sobremesas'>('TODOS');
  
  // Create / Edit modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  
  // Form fields
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState(0);
  const [categoria, setCategory] = useState<'Entradas' | 'Prato Principal' | 'Bebidas' | 'Sobremesas'>('Prato Principal');
  const [unidade, setUnidade] = useState('porção');
  const [disponivelDiasSemana, setDisponivelDiasSemana] = useState<string[]>([]);
  const [receita, setReceita] = useState<IngredienteReceita[]>([]);
  
  // Sizing states
  const [tamanhos, setTamanhos] = useState<{ nome: string; preco: number }[]>([]);
  const [currentSizeName, setCurrentSizeName] = useState('');
  const [currentSizePrice, setCurrentSizePrice] = useState<number>(0);

  const handleAddSize = () => {
    if (!currentSizeName.trim() || currentSizePrice < 0) return;
    setTamanhos([...tamanhos, { nome: currentSizeName.trim(), preco: currentSizePrice }]);
    setCurrentSizeName('');
    setCurrentSizePrice(0);
  };

  // Recipe selection helper states
  const [currentInsumoId, setCurrentInsumoId] = useState('');
  const [currentQuantidade, setCurrentQuantidade] = useState<number>(0.1);

  // Quick flexible control helper
  const dateObj = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
  const currentWeekdayRaw = new Intl.DateTimeFormat('pt-BR', options).format(dateObj);
  // Normalize capital first letter e.g., 'segunda-feira' to 'Segunda'
  const currentWeekday = currentWeekdayRaw.charAt(0).toUpperCase() + currentWeekdayRaw.slice(1).split('-')[0];

  const filteredItems = menuItems.filter(
    item => selectedCategory === 'TODOS' || item.categoria === selectedCategory
  );

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setNome('');
    setPreco(17.00);
    setCategory('Prato Principal');
    setUnidade('porção');
    setDisponivelDiasSemana([]);
    setReceita([]);
    setTamanhos([]);
    setCurrentSizeName('');
    setCurrentSizePrice(0);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setNome(item.nome);
    setPreco(item.preco);
    setCategory(item.categoria);
    setUnidade(item.unidade);
    setDisponivelDiasSemana(item.disponivelDiasSemana || []);
    setReceita(item.ingredientes || []);
    setTamanhos(item.tamanhos || []);
    setCurrentSizeName('');
    setCurrentSizePrice(0);
    setIsModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    const basePrice = tamanhos.length > 0 ? tamanhos[0].preco : preco;
    
    const itemData = {
      nome,
      preco: basePrice,
      categoria,
      unidade,
      disponivelDiasSemana,
      ingredientes: receita.length > 0 ? receita : undefined,
      tamanhos: tamanhos.length > 0 ? tamanhos : undefined,
      ativoHoje: editingItem ? (editingItem.ativoHoje !== false) : true,
      estoqueAtual: editingItem ? editingItem.estoqueAtual : 100
    };

    if (editingItem) {
      onUpdateMenuItem({
        ...editingItem,
        ...itemData
      });
      addLog('Edição de Cardápio', `Edição do item [${nome}] efetuada.`);
    } else {
      onAddMenuItem(itemData);
      addLog('Inclusão de Cardápio', `Novo item [${nome}] inserido no cardápio.`);
    }
    
    setIsModalOpen(false);
  };

  const handleToggleDay = (day: string) => {
    if (disponivelDiasSemana.includes(day)) {
      setDisponivelDiasSemana(disponivelDiasSemana.filter(d => d !== day));
    } else {
      setDisponivelDiasSemana([...disponivelDiasSemana, day]);
    }
  };

  const handleAddRecipeIngredient = () => {
    if (!currentInsumoId || currentQuantidade <= 0) return;
    
    // Check if ingredient already in list
    const existingIndex = receita.findIndex(r => r.insumoId === currentInsumoId);
    if (existingIndex > -1) {
      const copy = [...receita];
      copy[existingIndex].quantidade = Number((copy[existingIndex].quantidade + currentQuantidade).toFixed(3));
      setReceita(copy);
    } else {
      setReceita([...receita, { insumoId: currentInsumoId, quantidade: currentQuantidade }]);
    }
    
    // reset selection
    setCurrentInsumoId('');
    setCurrentQuantidade(0.1);
  };

  const handleRemoveRecipeIngredient = (insumoId: string) => {
    setReceita(receita.filter(r => r.insumoId !== insumoId));
  };

  const handleToggleAtivoHoje = (itemId: string) => {
    const item = menuItems.find(it => it.id === itemId);
    if (item) {
      onUpdateMenuItem({
        ...item,
        ativoHoje: item.ativoHoje === false ? true : false
      });
      addLog('Ajuste de Cardápio Hoje', `Status de disponibilidade hoje de [${item.nome}] alterado.`);
    }
  };

  // Load weekly scheduled defaults for current weekday
  const handleLoadWeeklyDefaults = () => {
    menuItems.forEach(item => {
      const isScheduledForToday = item.disponivelDiasSemana?.includes(currentWeekday);
      onUpdateMenuItem({
        ...item,
        ativoHoje: !!isScheduledForToday
      });
    });
    addLog('Cardápio Flexível', `Carregamento em massa da escala semanal padrão para o dia: ${currentWeekday}.`);
  };

  const handleToggleAllToday = (active: boolean) => {
    menuItems.forEach(item => {
      onUpdateMenuItem({
        ...item,
        ativoHoje: active
      });
    });
    addLog('Cardápio Flexível', `Todos os pratos marcados como ${active ? 'ativos' : 'inativos'} para operação de hoje.`);
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div id="cardapio-screen-root" className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        <div>
          <h2 className="text-xl font-extrabold text-zinc-950 tracking-tight font-sora flex items-center gap-2">
            <Utensils className="w-5 h-5 text-amber-600" />
            Gerenciar Cardápio
          </h2>
          <p className="text-xs text-zinc-650 font-medium mt-1">
            Configure opções de marmitas, defina a rotatividade semanal e habilite opções flexíveis para hoje.
          </p>
        </div>
        
        <button
          id="btn-add-menu-item"
          onClick={handleOpenAddModal}
          className="bg-amber-400 hover:bg-amber-500 text-zinc-950 border border-amber-300 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4 text-zinc-950" />
          Novo Item
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b-2 border-zinc-200 flex gap-4 select-none">
        <button
          onClick={() => setActiveTab('geral')}
          className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition ${
            activeTab === 'geral'
              ? 'border-amber-500 text-zinc-950 font-extrabold'
              : 'border-transparent text-zinc-650 hover:text-zinc-950'
          }`}
        >
          Opções Gerais
        </button>
        <button
          onClick={() => setActiveTab('rotatividade')}
          className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition ${
            activeTab === 'rotatividade'
              ? 'border-amber-500 text-zinc-950 font-extrabold'
              : 'border-transparent text-zinc-650 hover:text-zinc-950'
          }`}
        >
          Rotatividade Semanal
        </button>
        <button
          onClick={() => setActiveTab('flexivel')}
          className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'flexivel'
              ? 'border-amber-500 text-zinc-950 font-extrabold'
              : 'border-transparent text-zinc-650 hover:text-zinc-950'
          }`}
        >
          Cardápio Flexível (Hoje)
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
        </button>
      </div>

      {/* TAB 1: OPÇÕES GERAIS */}
      {activeTab === 'geral' && (
        <div id="tab-geral-content" className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {(['TODOS', 'Entradas', 'Prato Principal', 'Bebidas', 'Sobremesas'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap transition-all border ${
                  selectedCategory === cat
                    ? 'bg-amber-100 border-amber-600 text-amber-950 shadow-sm font-black'
                    : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                {cat === 'TODOS' ? 'Todas as Seções' : cat}
              </button>
            ))}
          </div>

          {/* Grid system representing custom dishes cardápio */}
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center bg-white border border-zinc-200 rounded-xl">
              <ClipboardList className="w-12 h-12 text-zinc-350 mx-auto mb-2" />
              <p className="text-zinc-600 font-medium text-sm">Nenhum item encontrado nesta seção.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map(item => {
                // Determine layout styled for display pratos
                const hasRecipe = item.ingredientes && item.ingredientes.length > 0;
                
                return (
                  <div
                    key={item.id}
                    className="bg-white border-2 border-zinc-200 rounded-xl p-4 shadow-sm relative flex flex-col justify-between hover:shadow-md hover:border-zinc-300 transition group"
                  >
                    <div>
                      {/* Badge / Category */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-black uppercase bg-zinc-100 border border-zinc-300 px-2 py-0.5 rounded text-zinc-850">
                          {item.categoria}
                        </span>
                        
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1 text-zinc-600 hover:text-zinc-950 transition"
                            title="Editar Opção"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteMenuItem(item.id)}
                            className="p-1 text-zinc-650 hover:text-red-650 transition"
                            title="Excluir Opção"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Header info */}
                      <h4 className="text-sm font-black text-zinc-950 leading-tight">
                        {item.nome}
                      </h4>
                      <div className="mt-1">
                        {item.tamanhos && item.tamanhos.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {item.tamanhos.map(t => (
                              <span key={t.nome} className="text-xs bg-zinc-100 border border-zinc-200 text-zinc-900 px-2 py-0.5 rounded font-mono font-bold uppercase">
                                {t.nome}: {formatCurrency(t.preco)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-lg font-black text-zinc-950">
                            {formatCurrency(item.preco)}
                            <span className="text-xs font-bold text-zinc-600 font-mono"> / {item.unidade}</span>
                          </p>
                        )}
                      </div>

                      {/* Days assigned rotation */}
                      {item.disponivelDiasSemana && item.disponivelDiasSemana.length > 0 && (
                        <div className="mt-3">
                          <span className="text-[10px] font-black text-zinc-650 uppercase tracking-widest block">Escala Semanal:</span>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {item.disponivelDiasSemana.map(day => (
                              <span key={day} className="text-[10px] font-black bg-amber-50 text-amber-950 px-2 py-0.5 rounded border border-amber-300">
                                {day.substring(0, 3)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recipe/Ficha técnica details nested rendering */}
                      <div className="mt-3 pt-3 border-t-2 border-zinc-100">
                        <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest block flex items-center gap-1.5">
                          <ClipboardList className="w-3.5 h-3.5 text-zinc-600" />
                          Ingredientes (Consumo Estoque):
                        </span>
                        
                        {hasRecipe ? (
                          <ul className="mt-1.5 space-y-1">
                            {item.ingredientes?.map((ing, idx) => {
                              const matchingInsumo = insumos.find(i => i.id === ing.insumoId);
                              return (
                                <li key={idx} className="text-xs text-zinc-800 font-semibold flex justify-between py-1 border-b border-zinc-100">
                                  <span>{matchingInsumo ? matchingInsumo.nome : 'Insumo Desconhecido'}</span>
                                  <span className="font-mono font-black text-zinc-950">{ing.quantidade} {matchingInsumo?.unidade || 'un'}</span>
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <p className="text-xs text-zinc-600 font-medium italic mt-1 bg-zinc-50 p-2 rounded border border-dashed border-zinc-200">
                            Nenhum ingrediente associado (Venda direta).
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-200 flex items-center justify-between">
                      <span className="text-[10px] text-zinc-600 font-black font-mono">ID: {item.id}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${item.ativoHoje !== false ? 'bg-emerald-600' : 'bg-red-500'}`} />
                        <span className="text-xs font-black text-zinc-850">
                          {item.ativoHoje !== false ? 'Ativo Hoje' : 'Indisponível hoje'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ROTATIVIDADE SEMANAL */}
      {activeTab === 'rotatividade' && (
        <div id="tab-rotatividade-content" className="space-y-6">
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex gap-3 text-amber-950 select-none">
            <Calendar className="w-5 h-5 shrink-0 text-amber-700 mt-0.5" />
            <div className="text-xs font-semibold leading-relaxed">
              <span className="font-black text-zinc-950 block text-sm mb-1">Como funciona a Rotatividade Semanal?</span>
              Cada prato pode ser configurado para aparecer em dias específicos da semana. Na seção "Cardápio Flexível", você pode carregar automaticamente a escala programada correspondente ao dia de hoje com um único clique.
            </div>
          </div>

          <div className="bg-white border-2 border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-100 text-zinc-900 border-b border-zinc-300 uppercase font-mono">
                    <th className="p-3.5 font-black text-zinc-950">Prato/Opção</th>
                    <th className="p-3.5 font-black text-zinc-950">Seção</th>
                    <th className="p-3.5 font-black text-zinc-950 text-center">Seg</th>
                    <th className="p-3.5 font-black text-zinc-950 text-center">Ter</th>
                    <th className="p-3.5 font-black text-zinc-950 text-center">Qua</th>
                    <th className="p-3.5 font-black text-zinc-950 text-center">Qui</th>
                    <th className="p-3.5 font-black text-zinc-950 text-center">Sex</th>
                    <th className="p-3.5 font-black text-zinc-950 text-center">Sáb</th>
                    <th className="p-3.5 font-black text-zinc-950 text-center">Dom</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {menuItems.filter(i => i.categoria === 'Prato Principal').map(item => (
                    <tr key={item.id} className="hover:bg-zinc-50 transition border-b border-zinc-150">
                      <td className="p-3.5 font-black text-zinc-900">{item.nome}</td>
                      <td className="p-3.5 text-zinc-700 font-bold">{item.categoria}</td>
                      
                      {DIAS_SEMANA.map(day => {
                        const isSelected = item.disponivelDiasSemana?.includes(day);
                        return (
                          <td key={day} className="p-3 text-center">
                            <button
                              onClick={() => {
                                const currentDays = item.disponivelDiasSemana || [];
                                const nextDays = currentDays.includes(day)
                                  ? currentDays.filter(d => d !== day)
                                  : [...currentDays, day];
                                
                                onUpdateMenuItem({
                                  ...item,
                                  disponivelDiasSemana: nextDays
                                });
                                addLog('Alteração de Escala', `Escala semanal de [${item.nome}] alterada para ${day}.`);
                              }}
                              className={`w-8 h-8 rounded-lg font-black text-xs mx-auto flex items-center justify-center transition border ${
                                isSelected
                                  ? 'bg-amber-400 hover:bg-amber-500 text-zinc-950 border-amber-500 shadow-xs'
                                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-300'
                              }`}
                            >
                              {day.charAt(0)}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CARDÁPIO FLEXÍVEL (ATIVO HOJE) */}
      {activeTab === 'flexivel' && (
        <div id="tab-flexivel-content" className="space-y-6">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 text-zinc-900 rounded-2xl p-6 shadow-xs relative overflow-hidden select-none border-2 border-amber-200">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl -mr-32 -mt-32" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-amber-600 text-white text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded tracking-widest whitespace-nowrap">
                    Hoje: {currentWeekday}
                  </span>
                  <span className="text-zinc-700 text-xs font-bold">Visualização e ativação rápida de marmitas</span>
                </div>
                
                <h3 className="text-xl md:text-2xl font-black text-zinc-950 font-sora">
                  Opções Disponíveis para Venda Hoje
                </h3>
                <p className="text-xs text-zinc-700 max-w-xl mt-1.5 font-semibold leading-relaxed">
                  Somente as opções marcadas como <span className="text-emerald-700 font-extrabold">ativas</span> abaixo estarão visíveis para os garçons no painel "Novo Pedido" para agilizar os lançamentos diários de marmitas e pratos.
                </p>
              </div>

              {/* Action bundle */}
              <div className="flex flex-col sm:flex-row gap-2.5 shrink-0 select-none">
                <button
                  onClick={handleLoadWeeklyDefaults}
                  className="bg-amber-400 hover:bg-amber-500 text-zinc-950 border-2 border-amber-550 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-zinc-950" />
                  Carregar Escala de {currentWeekday}
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleAllToday(true)}
                    className="flex-grow bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-2 border-emerald-600 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition"
                  >
                    Ativar Todos
                  </button>
                  <button
                    onClick={() => handleToggleAllToday(false)}
                    className="flex-grow bg-red-50 hover:bg-red-100 text-red-950 border-2 border-red-600 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition"
                  >
                    Desativar Todos
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Flyer visual layout with great color contrast */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* Front flyer mimic on left side with highly visual amber styling */}
            <div className="xl:col-span-4 bg-amber-50/40 border-4 border-amber-200 rounded-3xl p-6 text-zinc-900 shadow-md relative select-none flex flex-col justify-between">
              <div className="text-center font-sora border-b-2 border-amber-200/50 pb-4 mb-4">
                <span className="text-xs font-mono text-amber-700 tracking-widest uppercase block mb-1 font-bold">Prato do Dia</span>
                <h4 className="text-3xl font-black text-zinc-950 tracking-tight uppercase">Digão</h4>
                <p className="text-[11px] text-zinc-650 font-mono italic font-bold">Cardápio Oficial de {currentWeekday}</p>
              </div>

              {/* Active items inside flyer */}
              <div className="space-y-6 my-4 flex-1 overflow-y-auto max-h-[500px] pr-1">
                {menuItems.filter(item => item.ativoHoje !== false).length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-zinc-650 text-xs italic font-semibold">Nenhum item ativo no cardápio flexível hoje.</p>
                  </div>
                ) : (
                  (['Entradas', 'Prato Principal', 'Bebidas', 'Sobremesas'] as const).map(cat => {
                    const items = menuItems.filter(item => item.ativoHoje !== false && item.categoria === cat);
                    if (items.length === 0) return null;
                    return (
                      <div key={cat} className="space-y-2">
                        <div className="flex items-center gap-1.5 border-b border-amber-200/60 pb-1 mb-1 mt-2">
                          <span className="text-[11px] font-black uppercase text-amber-900 tracking-wider">
                            {cat === 'Prato Principal' ? 'Pratos Principais' : cat}
                          </span>
                          <span className="text-[9px] bg-amber-100 border border-amber-300 text-amber-950 font-bold px-1.5 py-0.1 rounded-full">
                            {items.length}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {items.map((it, index) => (
                            <div key={it.id} className="border border-dashed border-zinc-350 p-3 rounded-xl bg-white relative shadow-xs">
                              <span className="absolute top-2 right-2 text-[9px] font-bold text-amber-950 bg-amber-100 border border-amber-350 px-1.5 py-0.5 rounded font-mono">
                                {cat === 'Prato Principal' ? `Opção ${index + 1}` : 'Item'}
                              </span>
                              <h5 className="font-extrabold text-xs tracking-wide text-zinc-950 uppercase pr-14">{it.nome.replace('Marmita ', '')}</h5>
                              
                              {/* Sub ingredients list */}
                              {it.ingredientes && it.ingredientes.length > 0 && (
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {it.ingredientes.map((ing, idx) => {
                                    const matching = insumos.find(i => i.id === ing.insumoId);
                                    return (
                                      <span key={idx} className="text-[9px] bg-zinc-100 border border-zinc-200 text-zinc-800 px-1.5 py-0.5 rounded font-bold font-sans">
                                        - {matching ? matching.nome.split(' ')[0] : 'Ingrediente'}
                                      </span>
                                    );
                                  })}
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100 text-[11px] font-black">
                                <span className="text-zinc-650 font-mono uppercase tracking-wider text-[9px]">Preço:</span>
                                <span className="text-amber-850 font-black">
                                  {it.tamanhos && it.tamanhos.length > 0
                                    ? it.tamanhos.map(t => `${t.nome[0]}:${formatCurrency(t.preco)}`).join(' | ')
                                    : formatCurrency(it.preco)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="mt-4 pt-4 border-t-2 border-amber-200/50 text-xs text-center text-zinc-700 font-mono font-bold">
                <p className="text-[11px] text-amber-800 font-black mb-1">Grande R$ 22,00 | Pequena R$ 17,00</p>
                <span>WhatsApp: (31) 98505-0646</span>
              </div>
            </div>

            {/* Quick action checklist on right config panel */}
            <div className="xl:col-span-8 space-y-4 select-none">
              <h4 className="text-sm font-black text-zinc-950 tracking-tight uppercase">Selecione para Ativação Flexível Hoje:</h4>
              
              <div className="bg-white border-2 border-zinc-200 rounded-2xl overflow-hidden shadow-xs divide-y divide-zinc-200">
                {menuItems.map(item => (
                  <div key={item.id} className="p-3.5 flex items-center justify-between hover:bg-zinc-50 transition">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-zinc-950">{item.nome}</span>
                        <span className="text-[10px] font-extrabold bg-zinc-100 border border-zinc-300 px-2 py-0.5 rounded text-zinc-700 uppercase">{item.categoria}</span>
                        {item.disponivelDiasSemana?.includes(currentWeekday) && (
                          <span className="text-[10px] font-black bg-amber-100 border border-amber-300 text-amber-950 px-2 py-0.5 rounded">
                            Escala de Hoje
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-650 mt-1 font-semibold">
                        {item.tamanhos && item.tamanhos.length > 0
                          ? item.tamanhos.map(t => `${t.nome}: ${formatCurrency(t.preco)}`).join(' • ')
                          : formatCurrency(item.preco)}{' '}
                        • Consome {item.ingredientes?.length || 0} ingrediente(s) do estoque
                      </p>
                    </div>

                    <button
                      onClick={() => handleToggleAtivoHoje(item.id)}
                      className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition shadow-xs ${
                        item.ativoHoje !== false
                          ? 'bg-emerald-100 border-2 border-emerald-600 text-emerald-950 hover:bg-emerald-200'
                          : 'bg-zinc-100 border border-zinc-300 text-zinc-650 hover:bg-zinc-200'
                      }`}
                    >
                      {item.ativoHoje !== false ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-800" />
                          Ativo
                        </>
                      ) : (
                        'Inativo'
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT DIALOG MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div id="modal-menu-item-editor" className="bg-white border border-zinc-300 rounded-3xl max-w-2xl w-full p-6 text-zinc-900 shadow-2xl animate-in fade-in zoom-in-95 duration-200 select-none">
            
            <div className="flex justify-between items-center mb-4 border-b pb-3 border-zinc-200">
              <h3 className="text-lg font-black tracking-tight font-sora text-zinc-950">
                {editingItem ? 'Editar Opção de Cardápio' : 'Inserir Nova Opção no Cardápio'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-750 hover:text-zinc-950 font-black font-mono text-xs px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 rounded-lg"
              >
                FECHAR
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Nome */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-750 uppercase tracking-wider block">Nome do Prato/Bebida:</label>
                  <input
                    id="menu-item-name"
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Marmita Costelinha de Porco (Grande)"
                    className="w-full bg-white border border-zinc-350 text-xs text-zinc-950 px-3 py-2 rounded-lg font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Preço */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-750 uppercase tracking-wider block">Preço de Venda (R$):</label>
                  <input
                    id="menu-item-price"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={preco}
                    onChange={(e) => setPreco(Number(e.target.value))}
                    placeholder="Preço R$"
                    className="w-full bg-white border border-zinc-350 text-xs text-zinc-950 px-3 py-2 rounded-lg font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Seção / Categoria */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-750 uppercase tracking-wider block">Seção do Cardápio:</label>
                  <select
                    id="menu-item-category"
                    value={categoria}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-white border border-zinc-350 text-xs text-zinc-950 p-2 rounded-lg font-medium focus:outline-none focus:border-amber-500"
                  >
                    <option value="Entradas">Entradas</option>
                    <option value="Prato Principal">Pratos Principais</option>
                    <option value="Bebidas">Bebidas</option>
                    <option value="Sobremesas">Sobremesas</option>
                  </select>
                </div>

                {/* Unidade */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-750 uppercase tracking-wider block">Unidade de Venda:</label>
                  <input
                    id="menu-item-unit"
                    type="text"
                    required
                    value={unidade}
                    onChange={(e) => setUnidade(e.target.value)}
                    placeholder="un, porção, copo, fatia..."
                    className="w-full bg-white border border-zinc-350 text-xs text-zinc-950 px-3 py-2 rounded-lg font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Weekly Availability Rotation Program */}
              <div className="space-y-1.5 px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-2xl">
                <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest block mb-1">Escala da Rotatividade Semanal:</span>
                <div className="flex flex-wrap gap-1.5">
                  {DIAS_SEMANA.map(day => {
                    const active = disponivelDiasSemana.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleToggleDay(day)}
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase transition border ${
                          active
                            ? 'bg-amber-100 border-2 border-amber-500 text-amber-950 font-black'
                            : 'bg-white border border-zinc-300 text-zinc-600 hover:bg-zinc-100'
                        }`}
                      >
                        {day.substring(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SIZE MANAGER */}
              <div className="space-y-2 border border-dashed border-zinc-300 rounded-2xl p-4">
                <h4 className="text-xs font-black text-zinc-950 uppercase flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-zinc-950" />
                  Opções de Tamanho do Prato (Opcional)
                </h4>
                <p className="text-xs text-zinc-650 leading-tight font-medium">
                  Se este prato tiver variação de tamanhos (ex: Pequena e Grande), adicione-os aqui. O cliente poderá escolher o tamanho na hora do pedido.
                </p>

                {/* Form to add size */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end pt-1">
                  <div className="sm:col-span-6 space-y-1">
                    <label className="text-[10px] font-black text-zinc-700 uppercase tracking-wider block">Nome do Tamanho:</label>
                    <input
                      id="input-size-name"
                      type="text"
                      value={currentSizeName}
                      onChange={(e) => setCurrentSizeName(e.target.value)}
                      placeholder="Ex: Pequena, Média, Grande, Mini"
                      className="w-full bg-white border border-zinc-300 text-xs text-zinc-900 p-2 rounded-lg focus:outline-none focus:border-amber-500 font-medium"
                    />
                  </div>
                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[10px] font-black text-zinc-700 uppercase tracking-wider block">Preço (R$):</label>
                    <input
                      id="input-size-price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={currentSizePrice || ''}
                      onChange={(e) => setCurrentSizePrice(Number(e.target.value))}
                      placeholder="Ex: 17.00"
                      className="w-full bg-white border border-zinc-300 text-xs text-zinc-900 p-2 rounded-lg font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <button
                      type="button"
                      onClick={handleAddSize}
                      className="w-full bg-amber-400 hover:bg-amber-500 text-zinc-950 border border-amber-500 rounded-lg py-2 text-xs font-black uppercase tracking-wider transition shadow-sm"
                    >
                      Incluir
                    </button>
                  </div>
                </div>

                {/* List of sizes */}
                {tamanhos.length > 0 && (
                  <div className="space-y-1 pt-2">
                    {tamanhos.map((t, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-zinc-50 border border-zinc-200 p-2 rounded-lg">
                        <span className="font-extrabold text-zinc-800 uppercase">{t.nome}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-black text-zinc-950">{formatCurrency(t.preco)}</span>
                          <button
                            type="button"
                            onClick={() => setTamanhos(tamanhos.filter((_, i) => i !== idx))}
                            className="text-red-500 hover:text-red-700 font-bold"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* RECIPE BUILDER / FICHA TÉCNICA */}
              <div className="space-y-2 border border-dashed border-zinc-300 rounded-2xl p-4">
                <h4 className="text-xs font-black text-zinc-950 uppercase flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-amber-650" />
                  Constituição do Prato (Ficha Técnica / Ligação com Estoque)
                </h4>
                <p className="text-xs text-zinc-650 leading-tight font-medium">
                  Selecione quais matérias-primas (insumos) são reduzidos do Estoque toda vez que este prato for vendido, com a quantidade consumida por venda.
                </p>

                {/* Form to add item into receipt */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end pt-2">
                  <div className="sm:col-span-6 space-y-1">
                    <label className="text-[10px] font-black text-zinc-700 uppercase tracking-wider block">Matéria-Prima:</label>
                    <select
                      id="select-recipe-insumo"
                      value={currentInsumoId}
                      onChange={(e) => setCurrentInsumoId(e.target.value)}
                      className="w-full bg-white border border-zinc-300 text-xs text-zinc-950 p-2 rounded-lg focus:outline-none focus:border-amber-500 font-medium"
                    >
                      <option value="">-- Selecione do Estoque --</option>
                      {insumos.map(ins => (
                        <option key={ins.id} value={ins.id}>
                          {ins.nome} ({ins.unidade})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[10px] font-black text-zinc-700 uppercase tracking-wider block">Quantidade:</label>
                    <input
                      id="input-recipe-amount"
                      type="number"
                      step="0.001"
                      min="0.001"
                      value={currentQuantidade}
                      onChange={(e) => setCurrentQuantidade(Number(e.target.value))}
                      placeholder="Qtd consumida"
                      className="w-full bg-white border border-zinc-300 text-xs text-zinc-950 p-2 rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <button
                      type="button"
                      onClick={handleAddRecipeIngredient}
                      className="w-full bg-amber-400 hover:bg-amber-500 text-zinc-950 border border-amber-500 rounded-lg py-2.5 text-xs font-black uppercase tracking-wider transition shadow-sm"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>

                {/* List of ingredients inside recipe */}
                {receita.length === 0 ? (
                  <p className="text-xs text-zinc-600 font-bold italic text-center py-2.5 bg-zinc-50 border border-dashed border-zinc-200 rounded-lg">
                    Nenhum ingrediente associado. Vender este item não consumirá insumos derivados.
                  </p>
                ) : (
                  <div className="max-h-32 overflow-y-auto space-y-1 pt-2">
                    {receita.map((recItem, idx) => {
                      const insumo = insumos.find(i => i.id === recItem.insumoId);
                      return (
                        <div key={idx} className="flex items-center justify-between text-xs bg-zinc-50 border border-zinc-200 p-2.5 rounded-lg select-none">
                          <span className="font-extrabold text-zinc-800">
                            {insumo ? insumo.nome : 'Desconhecido'} ({insumo?.categoria})
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-black text-zinc-950">{recItem.quantidade} {insumo?.unidade}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveRecipeIngredient(recItem.insumoId)}
                              className="text-red-500 hover:text-red-700 font-bold"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-zinc-205 flex justify-end gap-2 text-xs select-none">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-700 px-5 py-2.5 rounded-xl font-bold uppercase transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-zinc-950 px-6 py-2.5 rounded-xl font-black uppercase tracking-wider transition shadow-sm border border-amber-600"
                >
                  {editingItem ? 'Salvar Alterações' : 'Criar Opção'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
