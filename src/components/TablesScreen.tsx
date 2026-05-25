import React, { useState } from 'react';
import { Mesa, MesaStatus, User, Pedido } from '../types';
import { Users, CreditCard, Clock, MessageCircle, HelpCircle, Utensils, CheckCircle, HelpCircle as Help, DollarSign } from 'lucide-react';
import NFEmissaoModal, { NFEmissaoData } from './NFEmissaoModal';

interface TablesScreenProps {
  mesas: Mesa[];
  users: User[];
  pedidos: Pedido[];
  onPayPedido: (id: string, metodo: 'Dinheiro' | 'Cartão Crédito' | 'Cartão Débito' | 'Pix') => void;
  onUpdateMesaStatus: (numero: number, status: MesaStatus, garcom?: string) => void;
  onNavigate: (screen: string) => void;
}

export default function TablesScreen({ 
  mesas, 
  users, 
  pedidos, 
  onPayPedido, 
  onUpdateMesaStatus, 
  onNavigate 
}: TablesScreenProps) {
  const [editingMesaNumero, setEditingMesaNumero] = useState<number | null>(null);
  const [selectedGarcom, setSelectedGarcom] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<MesaStatus>('Livre');
  const [checkoutMetodo, setCheckoutMetodo] = useState<'Dinheiro' | 'Cartão Crédito' | 'Cartão Débito' | 'Pix'>('Pix');
  const [isNFModalOpen, setIsNFModalOpen] = useState(false);
  const [nfModalData, setNfModalData] = useState<NFEmissaoData | null>(null);

  // Calculations for floor summaries
  const totalMesas = mesas.length;
  const livres = mesas.filter(m => m.status === 'Livre').length;
  const ocupadas = mesas.filter(m => m.status === 'Ocupada').length;
  const contaSolicitada = mesas.filter(m => m.status === 'Conta Solicitada').length;
  const reservadas = mesas.filter(m => m.status === 'Reservada').length;

  const activeWaiters = users.filter(u => u.role === 'Garçom' || u.role === 'Gerente');

  const handleMesaClick = (m: Mesa) => {
    setEditingMesaNumero(m.numero);
    setSelectedStatus(m.status);
    setSelectedGarcom(m.garcom || '');
  };

  const handleSaveMesaEdit = () => {
    if (editingMesaNumero !== null) {
      onUpdateMesaStatus(editingMesaNumero, selectedStatus, selectedGarcom || undefined);
      setEditingMesaNumero(null);
    }
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Get selected table and consumption info
  const mesaSelectedObj = mesas.find(x => x.numero === editingMesaNumero);
  
  const activeOrders = editingMesaNumero !== null
    ? pedidos.filter(p => p.mesaNumero === editingMesaNumero && p.statusPagamento === 'Pendente')
    : [];

  const hasConsumption = activeOrders.length > 0 || (mesaSelectedObj && mesaSelectedObj.totalAtual > 0);

  const aggregatedItems = activeOrders.flatMap(o => o.itens);
  const orderSubtotal = activeOrders.reduce((sum, o) => sum + o.subtotal, 0);
  const orderServiceFee = activeOrders.reduce((sum, o) => sum + o.taxaServico, 0);
  const orderTotal = activeOrders.reduce((sum, o) => sum + o.total, 0) || (mesaSelectedObj ? mesaSelectedObj.totalAtual : 0);

  const handleCheckoutTable = () => {
    if (editingMesaNumero === null) return;

    let finalItems = aggregatedItems.map(i => ({
      nome: i.nome,
      preco: i.preco,
      quantidade: i.quantidade
    }));

    if (finalItems.length === 0) {
      finalItems = [{
        nome: `Consumo Geral - Mesa ${editingMesaNumero}`,
        preco: orderTotal,
        quantidade: 1
      }];
    }

    const modalData: NFEmissaoData = {
      items: finalItems,
      subtotal: orderSubtotal || orderTotal,
      taxaServico: orderServiceFee,
      total: orderTotal,
      garcom: selectedGarcom || activeOrders[0]?.garcom || 'Atendente Desconhecido',
      mesaNumero: editingMesaNumero,
      tipoAtendimento: 'Mesa',
      cpfCliente: activeOrders[0]?.clienteCPF || '',
      pagoMetodo: checkoutMetodo
    };

    setNfModalData(modalData);
    setIsNFModalOpen(true);
  };

  const handleNFConfirmSuccess = () => {
    if (editingMesaNumero === null || !nfModalData) return;

    const finalMetodo = nfModalData.pagoMetodo;

    if (activeOrders.length > 0) {
      activeOrders.forEach(order => {
        onPayPedido(order.id, finalMetodo);
      });
    } else {
      // Fallback for tables that have total but no orders in list (set state back to livre)
      onUpdateMesaStatus(editingMesaNumero, 'Livre', undefined);
    }

    setIsNFModalOpen(false);
    setNfModalData(null);
    setEditingMesaNumero(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Floor Overview Header */}
      <div className="bg-brand-charcoal border border-brand-light-charcoal p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-5 select-none">
        <div>
          <span className="text-brand-yellow font-mono text-[10px] font-bold tracking-widest uppercase">MAPA DE OCUPABILIDADE</span>
          <h2 className="text-xl font-sora font-extrabold text-white mt-1">Status do Salão (Mesas)</h2>
          <p className="text-xs text-gray-400 mt-0.5">Clique nas mesas físicas abaixo para reservar, associar garçom ou lançar itens rapidamente.</p>
        </div>

        {/* Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded px-3 py-1.5 text-emerald-400">
            <span className="block text-[9px] text-gray-500">LIVRE</span>
            <strong className="text-sm font-bold">{livres}</strong>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded px-3 py-1.5 text-red-400">
            <span className="block text-[9px] text-gray-500">OCUPADA</span>
            <strong className="text-sm font-bold">{ocupadas}</strong>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/20 rounded px-3 py-1.5 text-orange-400 font-bold font-mono">
            <span className="block text-[9px] text-gray-500">PAGANDO</span>
            <strong className="text-sm font-bold">{contaSolicitada}</strong>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded px-3 py-1.5 text-blue-400">
            <span className="block text-[9px] text-gray-500">RESERVA</span>
            <strong className="text-sm font-bold">{reservadas}</strong>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Floor grid Map: 8 cols */}
        <div className="xl:col-span-8 bg-brand-charcoal border border-brand-light-charcoal rounded-xl p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {mesas.map(m => {
              // Status Styling
              const statusCfg = {
                Livre: {
                  bg: 'bg-brand-black/30 hover:border-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.1)]',
                  border: 'border-brand-light-charcoal',
                  titleColor: 'text-gray-300',
                  badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                  dot: 'bg-emerald-500',
                },
                Ocupada: {
                  bg: 'bg-brand-black/35 hover:border-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.1)]',
                  border: 'border-brand-light-charcoal',
                  titleColor: 'text-white',
                  badge: 'text-red-400 bg-red-500/10 border-red-500/20',
                  dot: 'bg-red-500 animate-pulse',
                },
                'Conta Solicitada': {
                  bg: 'bg-brand-black/35 hover:border-orange-500 hover:shadow-[0_0_15px_rgba(249,115,22,0.1)]',
                  border: 'border-orange-500/30',
                  titleColor: 'text-orange-400',
                  badge: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
                  dot: 'bg-orange-500 animate-pulse',
                },
                Reservada: {
                  bg: 'bg-brand-black/30 hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.1)]',
                  border: 'border-brand-light-charcoal',
                  titleColor: 'text-gray-300',
                  badge: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                  dot: 'bg-blue-500',
                },
              }[m.status];

              return (
                <div
                  key={m.numero}
                  id={`table-map-cell-${m.numero}`}
                  onClick={() => handleMesaClick(m)}
                  className={`cursor-pointer rounded-xl border p-3 xs:p-4 flex flex-col justify-between h-auto min-h-[140px] sm:h-40 transition group ${statusCfg.bg} ${statusCfg.border}`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <div className="text-[8px] sm:text-[10px] text-gray-500 font-mono">TABLE</div>
                      <h4 className={`text-sm xs:text-base sm:text-lg md:text-xl font-sora font-extrabold ${statusCfg.titleColor}`}>
                        Mesa {m.numero}
                      </h4>
                    </div>
                    <span className="text-[8px] sm:text-[10px] text-gray-500 font-mono font-bold flex items-center gap-0.5 sm:gap-1 bg-brand-light-charcoal px-1.5 sm:px-2 py-0.5 rounded shrink-0">
                      <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {m.capacidade} <span className="hidden xs:inline">pax</span>
                    </span>
                  </div>

                  {m.garcom && (
                    <div className="text-[9px] sm:text-[10px] text-gray-400 font-semibold truncate my-1">
                      Atend: <strong className="text-white">{m.garcom.split(' ')[0]}</strong>
                    </div>
                  )}

                  <div className="border-t border-brand-light-charcoal/40 pt-2 flex flex-col xs:flex-row xs:items-center xs:justify-between gap-1.5 xs:gap-0 mt-auto">
                    <span className={`text-[8px] sm:text-[9px] font-mono font-bold uppercase px-1 sm:px-1.5 py-0.5 rounded border inline-flex items-center gap-1 max-w-full ${statusCfg.badge}`}>
                      <span className={`w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full shrink-0 ${statusCfg.dot}`} />
                      <span className="truncate">
                        {m.status === 'Conta Solicitada' ? (
                          <>
                            Conta<span className="hidden sm:inline"> Solic.</span>
                          </>
                        ) : m.status}
                      </span>
                    </span>
                    
                    {m.totalAtual > 0 && (
                      <span className="text-[10px] xs:text-[11px] sm:text-xs font-mono font-bold text-white shrink-0 text-right mt-0.5 xs:mt-0">
                        {formatCurrency(m.totalAtual)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Editor Panel: 4 cols */}
        <div className="xl:col-span-4 bg-brand-charcoal border border-brand-light-charcoal rounded-xl p-5 space-y-4">
          <div className="border-b border-brand-light-charcoal pb-3">
            <h3 className="font-sora font-extrabold text-sm uppercase tracking-wider text-white">
              Painel de Mesa do Salão
            </h3>
            <p className="text-xs text-gray-400 mt-1">Controles diretos para alteração rápida de comandas no salão.</p>
          </div>

          {editingMesaNumero === null ? (
            <div className="py-16 text-center text-gray-500 text-xs select-none">
              <Utensils className="w-8 h-8 text-gray-700 mx-auto mb-2" />
              Selecione uma mesa física do mapa para editar o status, garçom associado ou auditar itens.
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-brand-black/30 border border-brand-light-charcoal rounded-lg p-3 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-gray-500 font-mono block">MESA SELECIONADA</span>
                  <strong className="text-lg font-sora font-extrabold text-brand-yellow">Mesa {editingMesaNumero}</strong>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 font-mono block">CAPACIDADE</span>
                  <strong className="text-white font-bold">{mesas.find(x => x.numero === editingMesaNumero)?.capacidade} Clientes</strong>
                </div>
              </div>

              {/* Status Select */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                  Status Operacional da Mesa
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Livre', 'Ocupada', 'Conta Solicitada', 'Reservada'] as MesaStatus[]).map(st => (
                    <button
                      key={st}
                      id={`btn-editor-status-${st}`}
                      type="button"
                      onClick={() => setSelectedStatus(st)}
                      className={`py-2 rounded text-[11px] font-bold uppercase transition ${
                        selectedStatus === st
                          ? 'bg-brand-yellow text-brand-black shadow-inner'
                          : 'bg-brand-light-charcoal/50 border border-brand-light-charcoal text-gray-300 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Garçom Select */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                  Vincular Garçom Responsável
                </label>
                <select
                  id="select-editor-garcom"
                  value={selectedGarcom}
                  onChange={(e) => setSelectedGarcom(e.target.value)}
                  className="w-full bg-brand-light-charcoal border border-brand-light-charcoal rounded-lg text-xs text-white p-2.5"
                >
                  <option value="">Nenhum garçom vinculado</option>
                  {activeWaiters.map(waiter => (
                    <option key={waiter.id} value={waiter.nome}>
                      {waiter.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Advanced closure form */}
              {selectedStatus === 'Conta Solicitada' && hasConsumption && (
                <div id="quick-billing-section" className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3.5 space-y-3 mt-4">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <DollarSign className="w-4 h-4 shrink-0 animate-pulse" />
                    <span className="font-sora font-semibold text-xs uppercase tracking-wider">Fechamento de Conta</span>
                  </div>

                  {aggregatedItems.length > 0 ? (
                    <div className="bg-brand-black/40 border border-brand-light-charcoal/80 rounded-lg p-2.5 space-y-2">
                      <div className="text-[10px] text-gray-500 font-mono font-bold flex justify-between uppercase border-b border-brand-light-charcoal/30 pb-1">
                        <span>RELAÇÃO DO CONSUMO</span>
                        <span>{aggregatedItems.length} ITENS</span>
                      </div>
                      <div className="max-h-24 overflow-y-auto space-y-1.5 pr-0.5 text-[11px] font-mono scrollbar-thin">
                        {aggregatedItems.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-gray-300 gap-2">
                            <span className="truncate max-w-[130px]">{item.quantidade}x {item.nome}</span>
                            <span className="text-gray-400 shrink-0">{formatCurrency(item.preco * item.quantidade)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-brand-light-charcoal/30 pt-1.5 space-y-1 text-[10px] font-mono text-gray-400">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(orderSubtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Serviço (10%):</span>
                          <span>{formatCurrency(orderServiceFee)}</span>
                        </div>
                        <div className="flex justify-between text-white font-bold text-xs pt-1 border-t border-brand-light-charcoal/30">
                          <span className="text-brand-yellow font-sora font-extrabold uppercase tracking-tight">Total Geral:</span>
                          <span className="text-brand-yellow">{formatCurrency(orderTotal)}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-brand-black/40 border border-brand-light-charcoal/50 rounded-lg p-2.5 flex justify-between text-xs font-mono">
                      <span className="text-gray-400 font-medium">Consumo acumulado:</span>
                      <strong className="text-brand-yellow">{formatCurrency(orderTotal)}</strong>
                    </div>
                  )}

                  {/* Payment Methods */}
                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Método de Recebimento</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['Pix', 'Cartão Crédito', 'Cartão Débito', 'Dinheiro'] as const).map(metodo => (
                        <button
                          key={metodo}
                          id={`quick-billing-method-${metodo.replace(' ', '')}`}
                          type="button"
                          onClick={() => setCheckoutMetodo(metodo)}
                          className={`py-1.5 px-2 rounded-md text-[10px] font-bold transition flex items-center justify-center gap-1 shrink-0 ${
                            checkoutMetodo === metodo
                              ? 'bg-emerald-500 text-white shadow-inner font-extrabold scale-[1.02]'
                              : 'bg-brand-light-charcoal/40 border border-brand-light-charcoal text-gray-400 hover:text-white'
                          }`}
                        >
                          {metodo}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    id="btn-confirm-quick-checkout"
                    onClick={handleCheckoutTable}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-[11px] font-extrabold uppercase tracking-wider py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-500/10"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Fechar Comanda ({formatCurrency(orderTotal)})
                  </button>
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-4 border-t border-brand-light-charcoal space-y-2.5">
                <button
                  id="btn-save-mesa-changes"
                  onClick={handleSaveMesaEdit}
                  className="w-full bg-brand-yellow hover:bg-brand-yellow-dark text-brand-black text-xs font-extrabold uppercase tracking-wider py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition"
                >
                  <CheckCircle className="w-4 h-4" /> Salvar Alterações de Mesa
                </button>

                {selectedStatus === 'Ocupada' && (
                  <button
                    id="btn-launch-order-from-map"
                    onClick={() => {
                      onNavigate('Novo Pedido');
                    }}
                    className="w-full bg-brand-light-charcoal text-white hover:text-brand-yellow border border-brand-light-charcoal hover:border-brand-yellow/40 text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition"
                  >
                    Lançar Novo Item para esta Mesa
                  </button>
                )}
                
                <button
                  id="btn-cancel-mesa-edit"
                  onClick={() => setEditingMesaNumero(null)}
                  className="w-full bg-transparent hover:bg-brand-light-charcoal text-gray-400 hover:text-white text-xs font-bold uppercase tracking-wider py-2 transition"
                >
                  Cancelar Edição
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      <NFEmissaoModal
        isOpen={isNFModalOpen}
        data={nfModalData}
        onClose={() => setIsNFModalOpen(false)}
        onConfirmSuccess={handleNFConfirmSuccess}
      />

    </div>
  );
}
