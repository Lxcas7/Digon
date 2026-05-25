import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, ChevronDown, ChevronUp, ArrowRight, Package, RefreshCw, Zap, TrendingDown, BarChart3, HelpCircle, X } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Insumo } from '../types';

// Helper to generate deterministic 7-day wastage history based on item ID and category
const generate7DayWastage = (item: Insumo) => {
  let hash = 0;
  for (let i = 0; i < item.id.length; i++) {
    hash = item.id.charCodeAt(i) + ((hash << 5) - hash);
  }

  const categoriesBaseWastage = {
    Carnes: 3.5,
    Hortifruti: 4.8,
    Lácteos: 2.2,
    Secos: 0.6,
    Bebidas: 1.2
  };

  const baseVal = categoriesBaseWastage[item.categoria as keyof typeof categoriesBaseWastage] || 2;
  const unit = item.unidade;
  const data = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
    const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

    // Deterministic fluctuations using the item hash and the loop index
    const seed = Math.abs(Math.sin(hash + i * 37));
    // Some mock zeros for realistic intervals
    const hasWastage = (seed * 100) % 5 > 0.8;
    let value = 0;
    if (hasWastage) {
      value = Number((baseVal * (0.3 + seed * 1.6)).toFixed(unit === 'un' ? 0 : 1));
    }

    data.push({
      dia: dayName.toUpperCase(),
      data: dateStr,
      quantidade: value,
      unit: unit
    });
  }
  return data;
};

// Deterministic category-based root cause insights
const getCategoryInsight = (categoria: string, itemNome: string): { causa: string; acao: string } => {
  switch (categoria) {
    case 'Carnes':
      return {
        causa: `Aparagem excessiva e quebra no porcionamento de ${itemNome.toLowerCase()}.`,
        acao: 'Treinar equipe de cozinha em técnicas de desossa e porcionamento padronizado.'
      };
    case 'Hortifruti':
      return {
        causa: 'Excesso de umidade na câmara fria e maturação acelerada devido ao estoque estático.',
        acao: 'Implementar a regra FIFO (PEPS) rígida e reduzir o lote de compra semanal.'
      };
    case 'Lácteos':
      return {
        causa: 'Abertura excessiva de embalagens sem identificação de data de validade aberta.',
        acao: 'Etiquetar data de abertura e priorizar o consumo em molhos ou bases de recheio.'
      };
    case 'Bebidas':
      return {
        causa: 'Diferença física no inventário por consumo não registrado ou avarias física.',
        acao: 'Auditar conferência de saída do bar e conferir tampas quebradas em estoque.'
      };
    default:
      return {
        causa: 'Ajuste manual de estoque por quebra de manipulação operacional regular.',
        acao: 'Revisar ficha técnica e treinar a equipe no manuseio seguro dos insumos.'
      };
  }
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-neutral-900 border border-neutral-800 text-[#ffffff] rounded-lg p-2.5 shadow-md font-mono text-[10px]">
        <p className="font-bold text-[#e4e4e7]">{data.data} ({data.dia})</p>
        <p className="text-red-400 mt-0.5 font-bold">
          Perda: <span className="font-black text-[#ffffff]">{payload[0].value} {data.unit}</span>
        </p>
      </div>
    );
  }
  return null;
};

interface LowStockNotificationProps {
  insumos: Insumo[];
  onUpdateStock: (id: string, newAmount: number, changeType?: 'entrada' | 'saída', details?: string) => void;
  onNavigate: (screenName: string) => void;
}

export default function LowStockNotification({ insumos, onUpdateStock, onNavigate }: LowStockNotificationProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [restockValues, setRestockValues] = useState<Record<string, number>>({});

  // Filter items at or below minimum recommended level
  const criticalItems = insumos.filter(item => item.estoqueAtual <= item.estoqueMinimo);

  if (isDismissed || criticalItems.length === 0) {
    return null;
  }

  // Handle direct stock addition within the notification
  const handleQuickRestock = (id: string, currentAmount: number, unit: string, name: string) => {
    const valToAdd = restockValues[id] || (unit === 'un' ? 50 : 10);
    if (valToAdd <= 0) return;

    const newAmount = Number((currentAmount + valToAdd).toFixed(2));
    onUpdateStock(
      id,
      newAmount,
      'entrada',
      `Faturamento de reabastecimento express via Alerta Global (+${valToAdd} ${unit})`
    );

    // Reset local restock value
    setRestockValues(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const handleValueChange = (id: string, val: string) => {
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      setRestockValues(prev => ({ ...prev, [id]: parsed }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-6 select-none bg-red-50/90 border border-red-200 rounded-xl overflow-hidden shadow-md"
    >
      {/* Alert Header bar (Compact default) */}
      <div className="px-5 py-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center shrink-0 border border-red-200">
            <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black text-red-700 tracking-wider uppercase bg-red-100 px-2 py-0.5 rounded">
                CRÍTICO
              </span>
              <h4 className="text-xs font-semibold text-red-950 font-sans">
                Alerta de Estoque Crítico
              </h4>
            </div>
            <p className="text-xs text-red-800 font-medium mt-0.5">
              Há <span className="font-bold font-mono bg-red-200/50 px-1 rounded text-red-900">{criticalItems.length}</span> {criticalItems.length === 1 ? 'insumo' : 'insumos'} operando abaixo ou no limite mínimo do estoque de segurança.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 self-stretch md:self-auto leading-none">
          <button
            id="btn-stock-alert-toggle"
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-neutral-50 text-red-900 text-xs font-bold rounded-lg border border-red-200 transition"
          >
            {isExpanded ? (
              <>
                <span>Recolher</span>
                <ChevronUp className="w-4 h-4 text-red-600" />
              </>
            ) : (
              <>
                <span>Examinar Alertas ({criticalItems.length})</span>
                <ChevronDown className="w-4 h-4 text-red-600" />
              </>
            )}
          </button>

          <button
            id="btn-stock-alert-redirect"
            type="button"
            onClick={() => onNavigate('Estoque')}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-[#ffffff] text-xs font-black uppercase tracking-wider rounded-lg border border-red-700 transition cursor-pointer hover:shadow-xs"
          >
            <span className="text-[#ffffff]">Workspace Estoque</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#ffffff]" />
          </button>

          <button
            id="btn-stock-alert-close"
            type="button"
            onClick={() => setIsDismissed(true)}
            className="flex items-center justify-center p-2 text-red-700 hover:text-red-950 hover:bg-red-200/50 rounded-lg transition shrink-0 cursor-pointer"
            title="Fechar Alerta"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Accordion content of Critical Stocks (Motion integrated) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 180 }}
            className="border-t border-red-150 bg-white"
          >
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 font-mono">
                  <Package className="w-3.5 h-3.5 text-neutral-400" />
                  <span>DRENE OPERACIONAL & CONSUMO CRÍTICO</span>
                </div>
                <span className="text-[10px] text-neutral-400 font-medium">Lançamentos de reabastecimento express atualizam o saldo de imediato.</span>
              </div>

              {/* Grid Layout of Low Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                {criticalItems.map((item) => {
                  const percent = Math.min(100, Math.max(0, (item.estoqueAtual / item.estoqueMinimo) * 100));
                  const isExhausted = item.estoqueAtual === 0;
                  const defaultRefill = item.unidade === 'un' ? 50 : 10;
                  const customVal = restockValues[item.id] !== undefined ? restockValues[item.id] : defaultRefill;

                  return (
                    <motion.div
                      key={item.id}
                      layoutId={`alert-card-${item.id}`}
                      className="border border-neutral-100 rounded-xl p-4 bg-zinc-50 flex flex-col justify-between space-y-3 shadow-2xs hover:border-red-200 transition duration-150"
                    >
                      {/* Name & Category Info */}
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-xs font-bold text-neutral-900 leading-tight">
                            {item.nome}
                          </h5>
                          <span className={`text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wide shrink-0 ${
                            isExhausted 
                              ? 'bg-red-500 text-[#ffffff] animate-pulse' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {isExhausted ? 'ESGOTADO' : 'BAIXO'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px] text-zinc-500">
                          <span>{item.categoria}</span>
                          <span>•</span>
                          <span>Regulado por {item.fornecedor.split(' ')[0]}</span>
                        </div>
                      </div>

                      {/* Stock levels and visual bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-end text-[11px] font-mono font-medium">
                          <span className="text-zinc-600">Disponível:</span>
                          <span className="font-extrabold text-neutral-900">
                            {item.estoqueAtual} / {item.estoqueMinimo} {item.unidade}
                          </span>
                        </div>

                        {/* Custom progress bar */}
                        <div className="w-full bg-neutral-200 h-2.5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className={`h-full rounded-full ${
                              isExhausted 
                                ? 'bg-red-500' 
                                : percent < 30 
                                  ? 'bg-red-400' 
                                  : 'bg-amber-400'
                            }`}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono pt-0.5">
                          <span className="flex items-center gap-0.5">
                            <TrendingDown className="w-3 h-3 text-red-400" />
                            {percent.toFixed(0)}% do nível mínimo
                          </span>
                          <span>Limiar de segurança: {item.estoqueMinimo} {item.unidade}</span>
                        </div>
                      </div>

                      {/* Wastage history chart & analysis */}
                      <div className="bg-white border border-neutral-100 rounded-lg p-2.5 space-y-2 pb-1.5 shadow-2xs">
                        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 font-bold">
                          <span className="flex items-center gap-1">
                            <BarChart3 className="w-3.5 h-3.5 text-zinc-400" />
                            HISTÓRICO DE PERDAS (7D)
                          </span>
                          <span className="text-zinc-400">Total: {generate7DayWastage(item).reduce((acc, curr) => acc + curr.quantidade, 0).toFixed(item.unidade === 'un' ? 0 : 1)} {item.unidade}</span>
                        </div>

                        <div className="h-24 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={generate7DayWastage(item)}
                              margin={{ top: 2, right: 2, left: -28, bottom: 2 }}
                            >
                              <defs>
                                <linearGradient id={`colorWastage-${item.id}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                              <XAxis 
                                dataKey="dia" 
                                tickLine={false} 
                                axisLine={false}
                                tick={{ fontSize: 8, fill: '#888888', fontFamily: 'monospace' }} 
                              />
                              <YAxis 
                                tickLine={false} 
                                axisLine={false}
                                tick={{ fontSize: 8, fill: '#888888', fontFamily: 'monospace' }} 
                              />
                              <Tooltip content={<CustomTooltip />} />
                              <Area 
                                type="monotone" 
                                dataKey="quantidade" 
                                stroke="#ef4444" 
                                strokeWidth={1.5}
                                fillOpacity={1} 
                                fill={`url(#colorWastage-${item.id})`} 
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Root Cause Insight */}
                        <div className="border-t border-neutral-100/70 pt-2 flex gap-1.5 items-start text-[10px]">
                          <HelpCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                          <div className="leading-tight text-neutral-600">
                            <span className="font-bold text-neutral-850">Causa Provável: </span>
                            {getCategoryInsight(item.categoria, item.nome).causa}
                            <div className="mt-1 font-mono text-[9px] text-zinc-500">
                              <span className="font-extrabold text-red-600">Ação Sugerida: </span>
                              {getCategoryInsight(item.categoria, item.nome).acao}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick manual reorder / replenishment interface */}
                      <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2.5">
                        <div className="flex items-center bg-white border border-neutral-250 rounded-lg overflow-hidden h-8 w-24">
                          <input
                            type="number"
                            min="1"
                            step={item.unidade === 'un' ? '10' : '1'}
                            value={customVal}
                            onChange={(e) => handleValueChange(item.id, e.target.value)}
                            className="bg-transparent border-none text-center font-mono font-black text-xs text-neutral-900 w-full h-full p-0 focus:outline-none focus:ring-0"
                          />
                          <span className="text-[10px] font-mono text-neutral-500 font-black pr-2 select-none">
                            {item.unidade}
                          </span>
                        </div>

                        <button
                          id={`btn-alert-quick-restock-${item.id}`}
                          type="button"
                          onClick={() => handleQuickRestock(item.id, item.estoqueAtual, item.unidade, item.nome)}
                          className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-[#ffffff] text-[10px] font-extrabold uppercase py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition whitespace-nowrap cursor-pointer hover:shadow-xs border border-neutral-950"
                        >
                          <Zap className="w-3.5 h-3.5 text-[#facc15] animate-pulse" />
                          <span className="text-[#ffffff]">Repor +{customVal}</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
