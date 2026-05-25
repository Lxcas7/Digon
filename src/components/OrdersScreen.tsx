import React, { useState } from 'react';
import { Pedido, PedidoStatus, User } from '../types';
import { Search, Filter, Plus, Printer, CheckCircle, Clock, Trash2, X, DollarSign, ChevronRight, User as UserIcon, ChefHat, Eye } from 'lucide-react';
import NFEmissaoModal, { NFEmissaoData } from './NFEmissaoModal';

interface OrdersScreenProps {
  pedidos: Pedido[];
  historicoPagos: Pedido[];
  currentUser: User;
  onUpdateStatus: (id: string, status: PedidoStatus) => void;
  onPayPedido: (id: string, metodo: 'Dinheiro' | 'Cartão Crédito' | 'Cartão Débito' | 'Pix') => void;
  onCancelPedido: (id: string) => void;
  onNavigate: (screen: string) => void;
}

export default function OrdersScreen({
  pedidos,
  historicoPagos,
  currentUser,
  onUpdateStatus,
  onPayPedido,
  onCancelPedido,
  onNavigate,
}: OrdersScreenProps) {
  const [selectedPedidoId, setSelectedPedidoId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'ativos' | 'historico'>('ativos');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [checkoutMetodo, setCheckoutMetodo] = useState<'Dinheiro' | 'Cartão Crédito' | 'Cartão Débito' | 'Pix'>('Pix');
  const [isNFModalOpen, setIsNFModalOpen] = useState(false);
  const [nfModalData, setNfModalData] = useState<NFEmissaoData | null>(null);

  const handleCheckoutPedido = () => {
    if (!selectedPedido) return;

    const itensDePedido = selectedPedido.itens.map(item => ({
      nome: item.nome,
      preco: item.preco,
      quantidade: item.quantidade
    }));

    const modalData: NFEmissaoData = {
      items: itensDePedido,
      subtotal: selectedPedido.subtotal,
      taxaServico: selectedPedido.taxaServico,
      total: selectedPedido.total,
      garcom: selectedPedido.garcom || 'Operador',
      mesaNumero: selectedPedido.mesaNumero || undefined,
      tipoAtendimento: selectedPedido.tipo,
      cpfCliente: selectedPedido.clienteCPF || '',
      pagoMetodo: checkoutMetodo
    };

    setNfModalData(modalData);
    setIsNFModalOpen(true);
  };

  const handleNFConfirmSuccess = () => {
    if (!selectedPedido || !nfModalData) return;
    onPayPedido(selectedPedido.id, nfModalData.pagoMetodo);
    setIsNFModalOpen(false);
    setNfModalData(null);
  };

  const todosPedidosExibidos = activeTab === 'ativos' ? pedidos : historicoPagos;

  const filteredPedidos = todosPedidosExibidos.filter((p) => {
    const matchesSearch =
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(p.mesaNumero).includes(searchTerm) ||
      p.garcom.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'TODOS') return matchesSearch;
    return matchesSearch && p.status === statusFilter;
  });

  const selectedPedido = [...pedidos, ...historicoPagos].find(
    (p) => p.id === selectedPedidoId
  );

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  // Status badges colors
  const getStatusBadge = (status: PedidoStatus) => {
    const cls = {
      Pendente: 'bg-red-500/15 text-red-400 border-red-500/30',
      Preparo: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
      Pronto: 'bg-green-500/15 text-green-400 border-green-500/30',
      Entregue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      Pago: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      Cancelado: 'bg-zinc-700 text-zinc-400 border-zinc-600',
    }[status] || 'bg-gray-500/20 text-gray-400';

    return (
      <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase font-mono tracking-wider border ${cls}`}>
        {status}
      </span>
    );
  };

  const runPrintAction = () => {
    if (!selectedPedido) return;
    alert(`[MOCK DE IMPRESSORA DE CUPOM]\nImprimindo Pré-conta ou Ticket Cozinha do Pedido #${selectedPedido.id}\nDestino: Impressora do Local de Expedição.`);
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 relative select-none">
      
      {/* Central Orders Matrix */}
      <div className="flex-1 bg-brand-charcoal border border-brand-light-charcoal rounded-xl overflow-hidden flex flex-col">
        
        {/* Top Header Selector */}
        <div className="bg-brand-light-charcoal/30 px-5 py-4 border-b border-brand-light-charcoal flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="font-sora font-extrabold text-base tracking-wider uppercase text-white">
              Pedidos & Comandas
            </h2>
            <div className="flex bg-brand-black p-1 rounded-lg border border-brand-light-charcoal">
              <button
                id="tab-btn-ativos"
                onClick={() => {
                  setActiveTab('ativos');
                  setStatusFilter('TODOS');
                }}
                className={`px-3 py-1 text-xs font-bold rounded uppercase tracking-wider transition ${
                  activeTab === 'ativos'
                    ? 'bg-brand-yellow text-brand-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Ativos
              </button>
              <button
                id="tab-btn-historico"
                onClick={() => {
                  setActiveTab('historico');
                  setStatusFilter('Pago');
                }}
                className={`px-3 py-1 text-xs font-bold rounded uppercase tracking-wider transition ${
                  activeTab === 'historico'
                    ? 'bg-brand-yellow text-brand-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Histórico (Pagos)
              </button>
            </div>
          </div>

          <button
            id="order-btn-create-new"
            onClick={() => onNavigate('Novo Pedido')}
            className="bg-brand-yellow text-brand-black hover:bg-brand-yellow-dark px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Novo Pedido (F4)
          </button>
        </div>

        {/* Filters and Inputs bar */}
        <div className="p-4 bg-brand-charcoal border-b border-brand-light-charcoal/60 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              id="input-orders-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por Comanda, Mesa, Garçom..."
              className="w-full bg-brand-light-charcoal/50 border border-brand-light-charcoal rounded-lg pl-9 pr-3 py-2 text-xs text-white"
            />
          </div>

          {/* Quick filter selection */}
          <div className="inline-flex items-center gap-2">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider whitespace-nowrap">Status:</span>
            <select
              id="select-orders-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-brand-light-charcoal/50 border border-brand-light-charcoal rounded-lg text-xs text-white p-2"
            >
              <option value="TODOS">Todos os Status</option>
              {activeTab === 'ativos' ? (
                <>
                  <option value="Pendente">Pendentes (Na Fila)</option>
                  <option value="Preparo">Em Preparo (Cozinha)</option>
                  <option value="Pronto">Prontos para Conversão</option>
                  <option value="Entregue">Entregues no Salão</option>
                </>
              ) : (
                <>
                  <option value="Pago">Pagos (Caixa Fechado)</option>
                  <option value="Cancelado">Cancelados</option>
                </>
              )}
            </select>
          </div>

          <div className="text-right text-[11px] text-gray-500 font-mono flex items-center justify-end">
            Exibindo <strong className="text-brand-yellow mx-1">{filteredPedidos.length}</strong> registros
          </div>
        </div>

        {/* Operational Grid of Orders */}
        <div className="flex-1 overflow-x-auto">
          {filteredPedidos.length === 0 ? (
            <div className="py-20 text-center text-gray-500 text-sm">
              Nenhum pedido encontrado correspondendo aos filtros ativos.
            </div>
          ) : (
            <table className="min-w-[750px] w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-light-charcoal/20 border-b border-brand-light-charcoal text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <th className="p-4">Comanda/Cód</th>
                  <th className="p-4">Origem</th>
                  <th className="p-4">Valor Total</th>
                  <th className="p-4">Hora Solicitação</th>
                  <th className="p-4">Atendente (Garçom)</th>
                  <th className="p-4">Status Atual</th>
                  <th className="p-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-light-charcoal/50">
                {filteredPedidos.map((p) => {
                  const isSelected = selectedPedidoId === p.id;
                  return (
                    <tr
                      key={p.id}
                      id={`order-row-${p.id}`}
                      onClick={() => setSelectedPedidoId(p.id)}
                      className={`cursor-pointer hover:bg-brand-light-charcoal/30 transition text-xs ${
                        isSelected ? 'bg-brand-yellow/5 border-l-4 border-l-brand-yellow' : ''
                      }`}
                    >
                      <td className="p-4 font-bold text-brand-yellow font-mono text-sm">
                        #{p.numero}
                      </td>
                      <td className="p-4 text-gray-200">
                        {p.tipo === 'Mesa' ? (
                          <span className="font-bold">MESA {p.mesaNumero}</span>
                        ) : (
                          <span className="font-bold font-mono text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded text-[10px]">
                            {p.tipo.toUpperCase()}
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-mono font-bold text-white text-sm">
                        {formatCurrency(p.total)}
                      </td>
                      <td className="p-4 font-mono text-gray-400">
                        {formatTime(p.criadoEm)}
                      </td>
                      <td className="p-4 text-gray-300">
                        {p.garcom}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(p.status)}
                      </td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          id={`btn-open-sidebar-${p.id}`}
                          onClick={() => setSelectedPedidoId(p.id)}
                          className="bg-brand-light-charcoal hover:bg-brand-yellow hover:text-brand-black p-2 rounded text-gray-300 transition"
                          title="Ver Detalhes do Pedido"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {/* A5: Right Lateral Action Drawer Panel */}
      {selectedPedido && (
        <div
          id="orders-detail-sidebar"
          className="w-full xl:w-96 bg-brand-charcoal border border-brand-light-charcoal rounded-xl overflow-hidden flex flex-col shrink-0 animate-in slide-in-from-right duration-200 sticky top-0"
        >
          {/* Header */}
          <div className="bg-brand-light-charcoal/40 p-4 border-b border-brand-light-charcoal flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-brand-yellow font-bold uppercase tracking-widest">DETALHE DA COMANDA</span>
              <h3 className="font-sora font-extrabold text-lg text-white">#{selectedPedido.numero}</h3>
            </div>
            <button
              id="sidebar-btn-close"
              onClick={() => setSelectedPedidoId(null)}
              className="p-1.5 hover:bg-brand-light-charcoal text-gray-400 hover:text-white rounded"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Details metadata */}
          <div className="p-4 space-y-4 border-b border-brand-light-charcoal/50 text-xs text-gray-300 bg-brand-black/20">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-gray-500 font-mono uppercase block text-[9px]">Lançado por</span>
                <span className="font-bold flex items-center gap-1 mt-0.5"><UserIcon className="w-3 h-3 text-brand-yellow" /> {selectedPedido.garcom}</span>
              </div>
              <div>
                <span className="text-gray-500 font-mono uppercase block text-[9px]">Registro</span>
                <span className="font-mono mt-0.5 block">{formatTime(selectedPedido.criadoEm)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-gray-500 font-mono uppercase block text-[9px]">Tipo do Serviço</span>
                <span className="font-bold mt-0.5 block text-white">{selectedPedido.tipo}</span>
              </div>
              <div>
                <span className="text-gray-500 font-mono uppercase block text-[9px]">Localização</span>
                <span className="font-bold block mt-0.5 text-brand-yellow">
                  {selectedPedido.mesaNumero === 0 ? 'Balcão/Delivery' : `Mesa ${selectedPedido.mesaNumero}`}
                </span>
              </div>
            </div>
          </div>

          {/* Items checklist */}
          <div className="flex-1 p-4 space-y-3 max-h-[16rem] overflow-y-auto">
            <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest font-bold block border-b border-brand-light-charcoal pb-1">ITENS DO PEDIDO</span>
            <div className="divide-y divide-brand-light-charcoal/40">
              {selectedPedido.itens.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-start justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="bg-brand-yellow/10 font-bold font-mono text-brand-yellow px-1.5 py-0.2 rounded text-[10px]">
                        {item.quantidade}x
                      </span>
                      <span className="font-bold text-gray-200">{item.nome}</span>
                    </div>
                    {item.observacoes && (
                      <p className="text-[10px] text-brand-yellow italic mt-0.5 ml-7">
                        Obs: "{item.observacoes}"
                      </p>
                    )}
                  </div>
                  <span className="font-mono font-bold text-gray-300">
                    {formatCurrency(item.preco * item.quantidade)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals panel */}
          <div className="p-4 bg-brand-black/40 border-t border-brand-light-charcoal space-y-2 text-xs font-mono">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal:</span>
              <span>{formatCurrency(selectedPedido.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Taxa de Serviço (10%):</span>
              <span>{formatCurrency(selectedPedido.taxaServico)}</span>
            </div>
            <div className="flex justify-between text-white font-extrabold text-sm border-t border-brand-light-charcoal pt-2.5 font-sans">
              <span>TOTAL DA COMANDA:</span>
              <span className="text-brand-yellow font-mono">{formatCurrency(selectedPedido.total)}</span>
            </div>
          </div>

          {/* Direct Controls & Actions matching role access */}
          <div className="p-4 bg-brand-light-charcoal/20 border-t border-brand-light-charcoal space-y-2">
            
            {/* Quick receipts print */}
            <button
              id="sidebar-btn-print"
              onClick={runPrintAction}
              className="w-full bg-brand-light-charcoal hover:bg-brand-light-charcoal/80 border border-brand-light-charcoal hover:text-white py-2 rounded font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1 px-3 text-gray-300 transition"
            >
              <Printer className="w-3.5 h-3.5" /> Imprimir Pré-Conta (Ticket)
            </button>

            {selectedPedido.status !== 'Pago' && selectedPedido.status !== 'Cancelado' && (
              <div className="space-y-2 pt-2 border-t border-brand-light-charcoal/50">
                <span className="text-[9px] font-mono text-gray-400 uppercase font-black block tracking-widest text-center">AÇÕES OPERACIONAIS (KDS / SALÃO)</span>
                
                {selectedPedido.status === 'Pendente' && (
                  <button
                    id="sidebar-action-start-prep"
                    onClick={() => onUpdateStatus(selectedPedido.id, 'Preparo')}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-3 rounded text-xs uppercase tracking-wider flex items-center justify-center gap-1 transition"
                  >
                    <ChefHat className="w-3.5 h-3.5" /> Enviar para Cozinha (Preparo)
                  </button>
                )}

                {selectedPedido.status === 'Preparo' && (
                  <button
                    id="sidebar-action-set-ready"
                    onClick={() => onUpdateStatus(selectedPedido.id, 'Pronto')}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 rounded text-xs uppercase tracking-wider flex items-center justify-center gap-1 transition"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Marcar como Pronto para Entrega
                  </button>
                )}

                {selectedPedido.status === 'Pronto' && (
                  <button
                    id="sidebar-action-set-delivered"
                    onClick={() => onUpdateStatus(selectedPedido.id, 'Entregue')}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 rounded text-xs uppercase tracking-wider flex items-center justify-center gap-1 transition"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Confirmar Entrega na Mesa
                  </button>
                )}

                {/* Final cashier settle form */}
                <div className="pt-2 border-t border-brand-light-charcoal/40 space-y-2">
                  <span className="text-[9px] font-mono text-gray-400 uppercase block tracking-widest text-center">FECHAMENTO FINANCEIRO</span>
                  
                  <div className="flex gap-1">
                    <select
                      id="sidebar-checkout-method-select"
                      value={checkoutMetodo}
                      onChange={(e) => setCheckoutMetodo(e.target.value as any)}
                      className="flex-1 bg-brand-charcoal border border-brand-light-charcoal rounded text-[11px] text-white p-1"
                    >
                      <option value="Pix">PIX</option>
                      <option value="Cartão Crédito">Crédito</option>
                      <option value="Cartão Débito">Débito</option>
                      <option value="Dinheiro">Dinheiro</option>
                    </select>

                    <button
                      id="sidebar-action-checkout"
                      onClick={handleCheckoutPedido}
                      className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest rounded flex items-center gap-1 transition shadow-lg shadow-emerald-500/10"
                    >
                      <DollarSign className="w-3 h-3" /> Fechar Comanda
                    </button>
                  </div>
                </div>

                <button
                  id="sidebar-action-cancel"
                  onClick={() => {
                    if (confirm('Deseja realmente cancelar este pedido de forma irreversível?')) {
                      onCancelPedido(selectedPedido.id);
                    }
                  }}
                  className="w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold py-2 px-3 rounded text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 transition mt-2 border border-red-500/20"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Cancelar Comanda
                </button>
              </div>
            )}

            {selectedPedido.status === 'Pago' && (
              <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold text-center uppercase tracking-widest font-mono">
                ✓ Comanda Paga em {selectedPedido.pagamentoMetodo || 'Pix'}
              </div>
            )}

            {selectedPedido.status === 'Cancelado' && (
              <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center uppercase tracking-widest font-mono">
                Comanda Cancelada do Sistema
              </div>
            )}

          </div>
        </div>
      )}

      <NFEmissaoModal
        isOpen={isNFModalOpen}
        data={nfModalData}
        onClose={() => setIsNFModalOpen(false)}
        onConfirmSuccess={handleNFConfirmSuccess}
      />

    </div>
  );
}
