import React from 'react';
import { Pedido, Mesa, Insumo, User } from '../types';
import { TrendingUp, Users, ShoppingBag, AlertTriangle, ArrowRight, DollarSign, PlusCircle, CheckSquare, Coffee, LogOut } from 'lucide-react';

interface DashboardScreenProps {
  pedidos: Pedido[];
  historicoPagos: Pedido[];
  mesas: Mesa[];
  insumos: Insumo[];
  currentUser: User;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export default function DashboardScreen({
  pedidos,
  historicoPagos,
  mesas,
  insumos,
  currentUser,
  onNavigate,
  onLogout,
}: DashboardScreenProps) {
  const [hoveredPointIdx, setHoveredPointIdx] = React.useState<number | null>(null);

  // Calculations
  const todosPedidosHoje = [...pedidos, ...historicoPagos];
  const pedidosPagosHoje = historicoPagos.filter(p => p.status === 'Pago');
  
  const faturamentoHoje = pedidosPagosHoje.reduce((acc, curr) => acc + curr.total, 0);
  const totalPedidosHojeContagem = todosPedidosHoje.length;
  
  const ticketMedio = pedidosPagosHoje.length > 0 
    ? faturamentoHoje / pedidosPagosHoje.length 
    : 0;

  const pedidosAtivosCount = pedidos.filter(p => ['Pendente', 'Preparo', 'Pronto', 'Entregue'].includes(p.status)).length;
  
  const totalMesas = mesas.length;
  const mesasOcupadas = mesas.filter(m => m.status === 'Ocupada' || m.status === 'Conta Solicitada').length;
  const taxaOcupacao = Math.round((mesasOcupadas / totalMesas) * 100);

  // Critical Stock items (estoqueAtual <= estoqueMinimo)
  const insumosCriticos = insumos.filter(i => i.estoqueAtual <= i.estoqueMinimo);

  // Recent ongoing activities
  const ultimosAtivos = pedidos.slice(0, 4);

  // Formatter helper
  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Mock revenue for past week to build custom SVG Chart
  const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const faturamentoSemanal = [1420, 1850, 2100, 3200, 4850, 6900, faturamentoHoje + 1200];
  const maxFaturamento = Math.max(...faturamentoSemanal);

  // Category counts
  const countCategorias = {
    Entradas: 0,
    'Prato Principal': 0,
    Bebidas: 0,
    Sobremesas: 0,
  };

  todosPedidosHoje.forEach(p => {
    p.itens.forEach(item => {
      // Find category of item
      const categoryFromSample = item.nome.includes('Chopp') || item.nome.includes('Cerveja') || item.nome.includes('Caipirinha') || item.nome.includes('Água')
        ? 'Bebidas'
        : item.nome.includes('Pudim') || item.nome.includes('Churros')
        ? 'Sobremesas'
        : item.nome.includes('Baião') || item.nome.includes('Feijoada') || item.nome.includes('Picanha') || item.nome.includes('Escondidinho')
        ? 'Prato Principal'
        : 'Entradas';
      
      countCategorias[categoryFromSample] += item.quantidade;
    });
  });

  const totalItensVendidos = Object.values(countCategorias).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-6">
      
      {/* Header com Boas-vindas Dinâmicas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand-charcoal border border-brand-light-charcoal p-4 sm:p-5 rounded-xl">
        <div>
          <span className="text-brand-yellow font-mono text-[10px] sm:text-xs font-bold tracking-widest uppercase">
            OPERANDO EM TEMPO REAL
          </span>
          <h1 className="text-xl sm:text-2xl font-sora font-extrabold text-white mt-1">
            Olá, {currentUser.nome}!
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Você está operando com privilégios de <strong className="text-white font-semibold">{currentUser.role}</strong>. O salão está ativo.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="bg-brand-light-charcoal border border-brand-light-charcoal/80 px-4 py-2 rounded-lg text-right">
            <div className="text-[10px] text-gray-500 font-mono">STATUS DO SISTEMA</div>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold font-mono text-white">ONLINE</span>
            </div>
          </div>
          <button
            id="btn-logout"
            onClick={onLogout}
            title="Log out"
            className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Faturamento */}
        <div className="bg-brand-charcoal border border-brand-light-charcoal p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Receita Realizada (Hoje)</span>
            <div className="text-2xl font-mono font-bold text-brand-yellow">
              {formatCurrency(faturamentoHoje)}
            </div>
            <div className="text-[11px] text-gray-400 flex items-center gap-1">
              <span className="text-green-400 font-bold font-mono">+12.4%</span> desde ontem
            </div>
          </div>
          <div className="bg-brand-yellow/10 p-3 rounded-lg text-brand-yellow">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Ticket Médio */}
        <div className="bg-brand-charcoal border border-brand-light-charcoal p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Ticket Médio (Hoje)</span>
            <div className="text-2xl font-mono font-bold text-white">
              {formatCurrency(ticketMedio)}
            </div>
            <div className="text-[11px] text-gray-400">
              Calculado em <strong className="text-white">{pedidosPagosHoje.length}</strong> mesas pagas
            </div>
          </div>
          <div className="bg-brand-yellow/10 p-3 rounded-lg text-brand-yellow">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Pedidos Ativos */}
        <div className="bg-brand-charcoal border border-brand-light-charcoal p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Pedidos Ativos</span>
            <div className="text-2xl font-mono font-bold text-white">
              {pedidosAtivosCount}
            </div>
            <div className="text-[11px] text-gray-400">
              Na fila, em preparo ou prontos
            </div>
          </div>
          <div className="bg-brand-yellow/10 p-3 rounded-lg text-brand-yellow">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Ocupação do Salão */}
        <div className="bg-brand-charcoal border border-brand-light-charcoal p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Ocupação das Mesas</span>
            <div className="text-2xl font-mono font-bold text-white">
              {taxaOcupacao}%
            </div>
            <div className="text-[11px] text-gray-400">
              <strong className="text-white">{mesasOcupadas}</strong> de {totalMesas} mesas ocupadas
            </div>
          </div>
          <div className="bg-brand-yellow/10 p-3 rounded-lg text-brand-yellow">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Stats Block: Chart and Critical Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Chart: Faturamento Semanal */}
        <div className="lg:col-span-2 bg-brand-charcoal border border-brand-light-charcoal p-4 sm:p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-sora font-extrabold text-sm uppercase tracking-wider text-white">
              Faturamento Bruto por Dia (Semanal)
            </h2>
            <span className="text-xs font-mono text-gray-400">BRL (R$)</span>
          </div>

          {/* SVG Line Chart */}
          <div className="bg-brand-black/20 rounded-xl p-4 border border-brand-light-charcoal/40 relative">
            <svg 
              viewBox="0 0 700 220" 
              className="w-full h-auto overflow-visible select-none"
            >
              <defs>
                {/* Gradient for area under line */}
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#facc15" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#facc15" stopOpacity="0.00" />
                </linearGradient>
                {/* Glow filter for the active point */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = 25 + ratio * 140;
                return (
                  <g key={`grid-${i}`} className="opacity-10">
                    <line 
                      x1="40" 
                      y1={y} 
                      x2="660" 
                      y2={y} 
                      className="stroke-gray-300" 
                      strokeWidth="1" 
                    />
                    <text 
                      x="30" 
                      y={y + 4} 
                      className="fill-gray-400 font-mono text-[9px] text-right" 
                      textAnchor="end"
                    >
                      {maxFaturamento > 0 ? `R$ ${Math.round(maxFaturamento * (1 - ratio)).toLocaleString()}` : '0'}
                    </text>
                  </g>
                );
              })}

              {/* Area path */}
              <path 
                d={`M 40,165 
                    ${faturamentoSemanal.map((val, idx) => {
                      const x = 40 + idx * (620 / 6);
                      const y = maxFaturamento > 0 ? 165 - (val / maxFaturamento) * 140 : 165;
                      return `L ${x},${y}`;
                    }).join(' ')} 
                    L 660,165 Z`} 
                fill="url(#areaGradient)" 
              />

              {/* Connecting Line */}
              <path 
                d={faturamentoSemanal.map((val, idx) => {
                  const x = 40 + idx * (620 / 6);
                  const y = maxFaturamento > 0 ? 165 - (val / maxFaturamento) * 140 : 165;
                  return `${idx === 0 ? 'M' : 'L'} ${x},${y}`;
                }).join(' ')} 
                className="stroke-brand-yellow" 
                strokeWidth="3.5" 
                fill="none" 
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Dots and Labels */}
              {faturamentoSemanal.map((val, idx) => {
                const x = 40 + idx * (620 / 6);
                const y = maxFaturamento > 0 ? 165 - (val / maxFaturamento) * 140 : 165;
                const isHovered = hoveredPointIdx === idx;
                
                return (
                  <g key={`pt-${idx}`}>
                    {/* Hover hotspot */}
                    <circle 
                      cx={x} 
                      cy={y} 
                      r="18" 
                      className="fill-transparent cursor-pointer"
                      onMouseEnter={() => setHoveredPointIdx(idx)}
                      onMouseLeave={() => setHoveredPointIdx(null)}
                    />
                    
                    {/* Actual circle dot */}
                    <circle 
                      cx={x} 
                      cy={y} 
                      r={isHovered ? "7" : "4.5"} 
                      className={`${isHovered ? 'fill-brand-black stroke-brand-yellow stroke-2' : 'fill-brand-yellow'} transition-all duration-150 cursor-pointer`}
                      filter={isHovered ? "url(#glow)" : undefined}
                      onMouseEnter={() => setHoveredPointIdx(idx)}
                      onMouseLeave={() => setHoveredPointIdx(null)}
                    />

                    {/* Value text atop the hovered point */}
                    {isHovered && (
                      <g className="pointer-events-none transition-all duration-200">
                        <rect 
                          x={x - 60} 
                          y={y - 32} 
                          width="120" 
                          height="22" 
                          rx="4" 
                          className="fill-zinc-950 stroke-brand-light-charcoal stroke-1"
                        />
                        <text 
                          x={x} 
                          y={y - 18} 
                          className="fill-brand-yellow font-mono text-[10px] font-bold text-center" 
                          textAnchor="middle"
                        >
                          R$ {val.toLocaleString('pt-BR')}
                        </text>
                      </g>
                    )}

                    {/* Day labels at the bottom label axis */}
                    <text 
                      x={x} 
                      y="195" 
                      className={`font-mono text-[10px] font-bold tracking-wider text-center ${isHovered ? 'fill-brand-yellow' : 'fill-gray-400'}`}
                      textAnchor="middle"
                    >
                      {diasSemana[idx]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex items-center justify-around text-xs text-gray-400 font-mono pt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-brand-yellow rounded-sm" /> Faturamento Operacional
            </div>
            <div>
              Média Semanal: <strong>{formatCurrency(faturamentoSemanal.reduce((a,b)=>a+b, 0)/7)}</strong>
            </div>
          </div>
        </div>

        {/* Dynamic Low Stock Alerts */}
        <div className="bg-brand-charcoal border border-brand-light-charcoal p-4 sm:p-5 rounded-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-brand-light-charcoal pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4.5 h-4.5 text-brand-yellow" />
                <h2 className="font-sora font-extrabold text-sm uppercase tracking-wider text-white">
                  Estoque Crítico (Baixo)
                </h2>
              </div>
              <span className="bg-brand-yellow/10 border border-brand-yellow/20 text-brand-yellow font-mono text-[10px] px-2 py-0.5 rounded-full font-bold">
                {insumosCriticos.length} Alertas
              </span>
            </div>

            {insumosCriticos.length === 0 ? (
               <div className="py-8 text-center text-gray-500 text-sm">
                 Nenhum item abaixo do limite de segurança. Estoque saudável!
               </div>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {insumosCriticos.map(i => (
                  <div key={i.id} className="flex items-center justify-between p-3 rounded-lg bg-brand-light-charcoal/40 border border-brand-light-charcoal">
                    <div>
                      <div className="text-sm font-bold text-gray-200">{i.nome}</div>
                      <div className="text-xs text-gray-400 font-mono">Fornecedor: {i.fornecedor}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-red-400 font-mono font-bold">
                        {i.estoqueAtual} {i.unidade}
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono">
                        mín: {i.estoqueMinimo} {i.unidade}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            id="btn-goto-stock"
            onClick={() => onNavigate('Estoque')}
            className="w-full mt-4 bg-brand-light-charcoal/80 border border-brand-light-charcoal text-white hover:text-brand-yellow hover:border-brand-yellow/50 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
          >
            Gerenciar Estoque <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Categories block and Recent Ongoing Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Categories of sale */}
        <div className="bg-brand-charcoal border border-brand-light-charcoal p-4 sm:p-5 rounded-xl space-y-4">
          <h2 className="font-sora font-extrabold text-sm uppercase tracking-wider text-white">
            Mix de Vendas (Categoria)
          </h2>
          <p className="text-xs text-gray-400 mt-1">Participação de produtos comercializados hoje.</p>
          
          <div className="space-y-4 pt-1">
            {Object.entries(countCategorias).map(([cat, val]) => {
              const pct = totalItensVendidos > 0 ? Math.round((val / totalItensVendidos) * 100) : 0;
              const colorCls = {
                Entradas: 'bg-yellow-400',
                'Prato Principal': 'bg-amber-500',
                Bebidas: 'bg-emerald-400',
                Sobremesas: 'bg-sky-400',
              }[cat] || 'bg-gray-400';

              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-gray-300">
                    <span className="font-semibold">{cat}</span>
                    <span className="font-mono text-gray-400">{val} un ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-brand-light-charcoal rounded-full overflow-hidden">
                    <div style={{ width: `${pct}%` }} className={`h-full ${colorCls} rounded-full`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Operations panel */}
        <div className="lg:col-span-2 bg-brand-charcoal border border-brand-light-charcoal p-4 sm:p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-brand-light-charcoal pb-3">
            <h2 className="font-sora font-extrabold text-sm uppercase tracking-wider text-white">
              Sessões do Sistema (Atalhos Rápidos)
            </h2>
            <span className="text-[10px] text-gray-400 font-mono">CLI-AÇÕES</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2">
            <button
              id="dash-shortcut-new_order"
              onClick={() => onNavigate('Novo Pedido')}
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-brand-light-charcoal/50 border border-brand-light-charcoal hover:border-brand-yellow hover:bg-brand-light-charcoal hover:-translate-y-1 transition group text-center"
            >
              <div className="bg-brand-yellow text-brand-black p-2.5 rounded-lg mb-2.5 group-hover:scale-110 transition">
                <PlusCircle className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-200">Novo Pedido</span>
              <span className="text-[9px] text-gray-500 font-mono mt-0.5 uppercase">Lançamento</span>
            </button>

            <button
              id="dash-shortcut-kitchen"
              onClick={() => onNavigate('Cozinha')}
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-brand-light-charcoal/50 border border-brand-light-charcoal hover:border-brand-yellow hover:bg-brand-light-charcoal hover:-translate-y-1 transition group text-center"
            >
              <div className="bg-brand-yellow text-brand-black p-2.5 rounded-lg mb-2.5 group-hover:scale-110 transition">
                <Coffee className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-200">Painel KDS</span>
              <span className="text-[9px] text-gray-500 font-mono mt-0.5 uppercase">Cozinha</span>
            </button>

            <button
              id="dash-shortcut-tables"
              onClick={() => onNavigate('Gestão de Mesas')}
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-brand-light-charcoal/50 border border-brand-light-charcoal hover:border-brand-yellow hover:bg-brand-light-charcoal hover:-translate-y-1 transition group text-center"
            >
              <div className="bg-brand-yellow text-brand-black p-2.5 rounded-lg mb-2.5 group-hover:scale-110 transition">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-200">Salão / Mesas</span>
              <span className="text-[9px] text-gray-500 font-mono mt-0.5 uppercase">Ocupabilidade</span>
            </button>

            <button
              id="dash-shortcut-financial"
              onClick={() => onNavigate('Financeiro / Caixa')}
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-brand-light-charcoal/50 border border-brand-light-charcoal hover:border-brand-yellow hover:bg-brand-light-charcoal hover:-translate-y-1 transition group text-center"
            >
              <div className="bg-brand-yellow text-brand-black p-2.5 rounded-lg mb-2.5 group-hover:scale-110 transition">
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-200">Controle de Caixa</span>
              <span className="text-[9px] text-gray-500 font-mono mt-0.5 uppercase">Tesouraria</span>
            </button>
          </div>

          {/* Quick Active Orders overview */}
          <div className="pt-3">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">
              Pedidos Críticos Recentes
            </div>
            <div className="divide-y divide-brand-light-charcoal">
              {ultimosAtivos.map(p => {
                const statusColor = {
                  Pendente: 'text-red-400 bg-red-400/10 border-red-400/20',
                  Preparo: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
                  Pronto: 'text-green-400 bg-green-400/10 border-green-400/20',
                  Entregue: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
                }[p.status] || 'text-gray-400 bg-gray-400/10';

                return (
                  <div key={p.id} className="py-2.5 flex items-center justify-between text-xs first:pt-0 last:pb-0">
                    <div>
                      <span className="font-bold text-gray-200">#{p.id}</span>
                      <span className="text-gray-500 font-mono mx-2">|</span>
                      <span>Mesa {p.mesaNumero === 0 ? 'Delivery' : p.mesaNumero}</span>
                      <span className="text-gray-500 font-mono mx-2">|</span>
                      <span className="text-gray-400">{p.itens.length} itens</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-sans font-extrabold text-sm text-gray-200 font-mono">
                        {formatCurrency(p.total)}
                      </span>
                      <span className={`text-[9px] font-bold uppercase py-0.5 px-2 rounded border ${statusColor}`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
