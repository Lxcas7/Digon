import React, { useState, useEffect } from 'react';
import { Pedido, PedidoStatus } from '../types';
import { ChefHat, Flame, CheckCircle2, ChevronRight, MessageSquare, AlertCircle, Clock, Check } from 'lucide-react';

interface KitchenScreenProps {
  pedidos: Pedido[];
  onUpdateStatus: (id: string, status: PedidoStatus) => void;
}

export default function KitchenScreen({ pedidos, onUpdateStatus }: KitchenScreenProps) {
  // We care about orders in: Pendente, Preparo, Pronto
  const kitchenPedidos = pedidos.filter(p => ['Pendente', 'Preparo', 'Pronto'].includes(p.status));

  // State to simulate minute ticks for timer counters
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30000); // refresh every 30 seconds
    return () => clearInterval(timer);
  }, []);

  const getElapsedTime = (isoString: string) => {
    try {
      const created = new Date(isoString);
      const diffMs = now.getTime() - created.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      return diffMins > 0 ? `${diffMins} min` : 'Agora mesmo';
    } catch {
      return '-- min';
    }
  };

  const getTimerSeverityColor = (isoString: string) => {
    try {
      const created = new Date(isoString);
      const diffMins = Math.floor((now.getTime() - created.getTime()) / 60000);
      if (diffMins >= 20) return 'text-red-400 bg-red-500/10 border-red-500/20';
      if (diffMins >= 10) return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      return 'text-green-400 bg-green-500/10 border-green-500/20';
    } catch {
      return 'text-gray-400';
    }
  };

  // Group by status
  const comFilas = kitchenPedidos.filter(p => p.status === 'Pendente');
  const comNoFogo = kitchenPedidos.filter(p => p.status === 'Preparo');
  const comProntos = kitchenPedidos.filter(p => p.status === 'Pronto');

  return (
    <div className="space-y-6">
      
      {/* Top operational banner for kitchen */}
      <div className="bg-brand-charcoal border border-brand-light-charcoal p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-brand-yellow text-brand-black p-2 rounded-lg shrink-0">
            <ChefHat className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-sora font-extrabold text-white">
              Painel KDS da Cozinha (Mestre Chef)
            </h1>
            <p className="text-xs text-gray-400">
              Controle de comandas recebidas e tempos individuais de preparo das panelas.
            </p>
          </div>
        </div>

        <div className="flex gap-2.5 sm:gap-4 font-mono text-center justify-between sm:justify-start w-full sm:w-auto">
          <div className="bg-brand-black/50 border border-brand-light-charcoal/80 rounded px-3 py-1">
            <div className="text-[9px] text-gray-500">PENDENTES</div>
            <div className="text-sm font-bold text-red-400">{comFilas.length}</div>
          </div>
          <div className="bg-brand-black/50 border border-brand-light-charcoal/80 rounded px-3 py-1">
            <div className="text-[9px] text-gray-500">NO FOGO</div>
            <div className="text-sm font-bold text-orange-400">{comNoFogo.length}</div>
          </div>
          <div className="bg-brand-black/50 border border-brand-light-charcoal/80 rounded px-3 py-1">
            <div className="text-[9px] text-gray-500">PRONTOS</div>
            <div className="text-sm font-bold text-green-400">{comProntos.length}</div>
          </div>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1: Fila de Entrada / Pendentes */}
        <div className="bg-brand-charcoal/40 border border-brand-light-charcoal rounded-xl flex flex-col h-[650px] overflow-hidden">
          <div className="bg-brand-light-charcoal/40 p-4 border-b border-brand-light-charcoal flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">1. Recebidos (Fila de Entrada)</h2>
            </div>
            <span className="bg-brand-black/80 font-mono text-[10px] font-bold text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
              {comFilas.length}
            </span>
          </div>

          <div className="flex-1 p-4 space-y-3.5 overflow-y-auto bg-brand-black/25">
            {comFilas.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 text-xs py-20">
                <Check className="w-8 h-8 text-gray-600 mb-2" />
                Sem pedidos na fila.
              </div>
            ) : (
              comFilas.map(p => (
                <div key={p.id} id={`kds-card-${p.id}`} className="bg-brand-charcoal border-l-4 border-l-red-500 border border-brand-light-charcoal rounded-lg p-3.5 space-y-3 shadow-md hover:-translate-y-0.5 transition duration-150">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-extrabold text-brand-yellow font-mono">#{p.numero}</span>
                      <strong className="text-white text-xs ml-2 uppercase">Mesa {p.mesaNumero === 0 ? 'Delivery' : p.mesaNumero}</strong>
                    </div>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${getTimerSeverityColor(p.criadoEm)}`}>
                      <Clock className="w-2.5 h-2.5" /> {getElapsedTime(p.criadoEm)}
                    </span>
                  </div>

                  {/* Food Items checklist */}
                  <div className="space-y-1.5 pt-1.5 border-t border-brand-light-charcoal/50">
                    {p.itens.map((item, idx) => (
                      <div key={idx} className="text-xs text-gray-200">
                        <span className="bg-brand-light-charcoal px-1.5 py-0.2 rounded font-bold text-gray-300 font-mono mr-1.5">{item.quantidade}x</span>
                        <strong className="font-semibold text-gray-100">{item.nome}</strong>
                        {item.observacoes && (
                          <div className="text-[10px] text-brand-yellow flex items-start gap-1 mt-0.5 pl-7">
                            <span className="font-semibold">↳ OBS:</span> <span>"{item.observacoes}"</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Action button */}
                  <button
                    id={`kds-action-start-${p.id}`}
                    onClick={() => onUpdateStatus(p.id, 'Preparo')}
                    className="w-full mt-3 bg-brand-yellow hover:bg-brand-yellow-dark text-brand-black font-extrabold text-[10px] uppercase tracking-wider py-2 rounded flex items-center justify-center gap-1 transition"
                  >
                    Começar Preparação <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: fogo na panela / preparo */}
        <div className="bg-brand-charcoal/40 border border-brand-light-charcoal rounded-xl flex flex-col h-[650px] overflow-hidden">
          <div className="bg-brand-light-charcoal/40 p-4 border-b border-brand-light-charcoal flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">2. No Fogo (Preparando)</h2>
            </div>
            <span className="bg-brand-black/80 font-mono text-[10px] font-bold text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full">
              {comNoFogo.length}
            </span>
          </div>

          <div className="flex-1 p-4 space-y-3.5 overflow-y-auto bg-brand-black/25">
            {comNoFogo.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 text-xs py-20">
                <Flame className="w-8 h-8 text-gray-600 mb-2" />
                Nenhuma panela ativa no momento.
              </div>
            ) : (
              comNoFogo.map(p => (
                <div key={p.id} id={`kds-card-${p.id}`} className="bg-brand-charcoal border-l-4 border-l-orange-500 border border-brand-light-charcoal rounded-lg p-3.5 space-y-3 shadow-md hover:-translate-y-0.5 transition duration-150">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-extrabold text-brand-yellow font-mono">#{p.numero}</span>
                      <strong className="text-white text-xs ml-2 uppercase">Mesa {p.mesaNumero === 0 ? 'Delivery' : p.mesaNumero}</strong>
                    </div>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${getTimerSeverityColor(p.criadoEm)}`}>
                      <Clock className="w-2.5 h-2.5" /> {getElapsedTime(p.criadoEm)}
                    </span>
                  </div>

                  {/* Food Items checklist */}
                  <div className="space-y-1.5 pt-1.5 border-t border-brand-light-charcoal/50">
                    {p.itens.map((item, idx) => (
                      <div key={idx} className="text-xs text-gray-200">
                        <span className="bg-brand-light-charcoal px-1.5 py-0.2 rounded font-bold text-gray-300 font-mono mr-1.5">{item.quantidade}x</span>
                        <strong className="font-semibold text-gray-100">{item.nome}</strong>
                        {item.observacoes && (
                          <div className="text-[10px] text-brand-yellow flex items-start gap-1 mt-0.5 pl-7">
                            <span className="font-semibold">↳ OBS:</span> <span>"{item.observacoes}"</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Action button */}
                  <button
                    id={`kds-action-ready-${p.id}`}
                    onClick={() => onUpdateStatus(p.id, 'Pronto')}
                    className="w-full mt-3 bg-brand-yellow hover:bg-brand-yellow-dark text-brand-black font-extrabold text-[10px] uppercase tracking-wider py-2 rounded flex items-center justify-center gap-1 transition"
                  >
                    Concluir & Marcar Pronto <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Prontos / Expedição */}
        <div className="bg-brand-charcoal/40 border border-brand-light-charcoal rounded-xl flex flex-col h-[650px] overflow-hidden">
          <div className="bg-brand-light-charcoal/40 p-4 border-b border-brand-light-charcoal flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">3. Expedição (Sair Mão)</h2>
            </div>
            <span className="bg-brand-black/80 font-mono text-[10px] font-bold text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">
              {comProntos.length}
            </span>
          </div>

          <div className="flex-1 p-4 space-y-3.5 overflow-y-auto bg-brand-black/25">
            {comProntos.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 text-xs py-20">
                <CheckCircle2 className="w-8 h-8 text-gray-600 mb-2" />
                Sem pratos pendentes na expedição.
              </div>
            ) : (
              comProntos.map(p => (
                <div key={p.id} id={`kds-card-${p.id}`} className="bg-brand-charcoal border-l-4 border-l-green-500 border border-brand-light-charcoal rounded-lg p-3.5 space-y-3 shadow-md hover:-translate-y-0.5 transition duration-150">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-extrabold text-brand-yellow font-mono">#{p.numero}</span>
                      <strong className="text-white text-xs ml-2 uppercase">Mesa {p.mesaNumero === 0 ? 'Delivery' : p.mesaNumero}</strong>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded select-none">
                      PRONTO
                    </span>
                  </div>

                  {/* Food Items checklist */}
                  <div className="space-y-1.5 pt-1.5 border-t border-brand-light-charcoal/50">
                    {p.itens.map((item, idx) => (
                      <div key={idx} className="text-xs text-gray-200">
                        <span className="bg-brand-light-charcoal px-1.5 py-0.2 rounded font-bold text-gray-300 font-mono mr-1.5">{item.quantidade}x</span>
                        <strong className="font-semibold text-gray-100">{item.nome}</strong>
                        {item.observacoes && (
                          <div className="text-[10px] text-brand-yellow flex items-start gap-1 mt-0.5 pl-7">
                            <span className="font-semibold">↳ OBS:</span> <span>"{item.observacoes}"</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Action button */}
                  <button
                    id={`kds-action-deliver-${p.id}`}
                    onClick={() => onUpdateStatus(p.id, 'Entregue')}
                    className="w-full mt-3 bg-brand-light-charcoal hover:bg-brand-yellow text-white hover:text-brand-black border border-brand-light-charcoal font-extrabold text-[10px] uppercase tracking-wider py-2 rounded flex items-center justify-center gap-1 transition"
                  >
                    Dar Saída / Servido <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
