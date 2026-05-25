import React, { useState } from 'react';
import { MenuItem, Pedido, PedidoItem, User } from '../types';
import { Plus, Minus, ShoppingCart, Users, Check, AlertCircle, Trash2, ArrowRight, ArrowLeft, DollarSign } from 'lucide-react';
import NFEmissaoModal, { NFEmissaoData } from './NFEmissaoModal';

interface NewOrderScreenProps {
  users: User[];
  menuItems: MenuItem[];
  onAddPedido: (pedido: any) => void;
  onNavigate: (screen: string) => void;
}

export default function NewOrderScreen({ users, menuItems, onAddPedido, onNavigate }: NewOrderScreenProps) {
  const [step, setStep] = useState<number>(1);
  
  // Step 1 states
  const [tipoAtendimento, setTipoAtendimento] = useState<'Mesa' | 'Delivery' | 'Retirada'>('Mesa');
  const [mesaNumero, setMesaNumero] = useState<number>(1);
  const [garcomResponsavel, setGarcomResponsavel] = useState<string>('');
  
  // Step 2 states
  const [activeCategory, setActiveCategory] = useState<'Entradas' | 'Prato Principal' | 'Bebidas' | 'Sobremesas'>('Entradas');
  
  interface CartEntry {
    cartId: string;
    item: MenuItem;
    selectedSize?: string;
    quantidade: number;
    observacoes: string;
    precoEfetivo: number;
    nomeEfetivo: string;
  }

  const [cartItems, setCartItems] = useState<CartEntry[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  
  // Step 3 states
  const [clienteCPF, setClienteCPF] = useState<string>('');
  const [taxaServicoAtiva, setTaxaServicoAtiva] = useState<boolean>(true);
  const [checkoutMetodo, setCheckoutMetodo] = useState<'Dinheiro' | 'Cartão Crédito' | 'Cartão Débito' | 'Pix'>('Pix');
  const [isNFModalOpen, setIsNFModalOpen] = useState(false);
  const [nfModalData, setNfModalData] = useState<NFEmissaoData | null>(null);

  // Filter items based on selected category and if they are active today
  const filteredMenuItems = menuItems.filter(it => it.categoria === activeCategory && it.ativoHoje !== false);

  // Waiters list
  const garçons = users.filter(u => u.role === 'Garçom' || u.role === 'Gerente');

  // Helpers
  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleAddToCart = (item: MenuItem, size?: string) => {
    const cartId = item.id + (size ? '-' + size : '');
    const price = size && item.tamanhos
      ? (item.tamanhos.find(t => t.nome === size)?.preco ?? item.preco)
      : item.preco;
    const name = size ? `${item.nome} (${size})` : item.nome;

    const existingIndex = cartItems.findIndex(ci => ci.cartId === cartId);
    if (existingIndex > -1) {
      const copy = [...cartItems];
      copy[existingIndex].quantidade += 1;
      setCartItems(copy);
    } else {
      setCartItems([...cartItems, {
        cartId,
        item,
        selectedSize: size,
        quantidade: 1,
        observacoes: '',
        precoEfetivo: price,
        nomeEfetivo: name
      }]);
    }
  };

  const handleDecrementCart = (item: MenuItem, size?: string) => {
    const cartId = item.id + (size ? '-' + size : '');
    const existingIndex = cartItems.findIndex(ci => ci.cartId === cartId);
    if (existingIndex > -1) {
      const copy = [...cartItems];
      if (copy[existingIndex].quantidade > 1) {
        copy[existingIndex].quantidade -= 1;
        setCartItems(copy);
      } else {
        setCartItems(cartItems.filter(ci => ci.cartId !== cartId));
      }
    }
  };

  const handleUpdateObs = (cartId: string, obs: string) => {
    setCartItems(cartItems.map(ci => {
      if (ci.cartId === cartId) {
        return { ...ci, observacoes: obs };
      }
      return ci;
    }));
  };

  const handleRemoveFromCart = (cartId: string) => {
    setCartItems(cartItems.filter(ci => ci.cartId !== cartId));
  };

  // Financial values
  const subtotal = cartItems.reduce((acc, curr) => acc + (curr.precoEfetivo * curr.quantidade), 0);
  const taxaServico = taxaServicoAtiva ? subtotal * 0.1 : 0;
  const total = subtotal + taxaServico;

  // Validation
  const validateStep1 = () => {
    if (tipoAtendimento === 'Mesa' && !mesaNumero) return false;
    if (!garcomResponsavel) return false;
    return true;
  };

  const validateStep2 = () => {
    return cartItems.length > 0;
  };

  const handleSavePedido = () => {
    if (cartItems.length === 0) return;

    // Convert cart items to Pedido items
    const itensDePedido: PedidoItem[] = cartItems.map(ci => ({
      id: ci.cartId,
      nome: ci.nomeEfetivo,
      preco: ci.precoEfetivo,
      quantidade: ci.quantidade,
      observacoes: ci.observacoes || undefined
    }));

    const novoPedido = {
      mesaNumero: tipoAtendimento === 'Mesa' ? Number(mesaNumero) : 0,
      tipo: tipoAtendimento,
      itens: itensDePedido,
      subtotal,
      taxaServico,
      total,
      garcom: garcomResponsavel,
      status: 'Pendente' as const,
      statusPagamento: 'Pendente' as const,
      clienteCPF: clienteCPF || undefined
    };

    onAddPedido(novoPedido);
    onNavigate('Pedidos');
  };

  const handleOpenNFModal = () => {
    if (cartItems.length === 0) return;

    const itensDePedido = cartItems.map(ci => ({
      nome: ci.nomeEfetivo,
      preco: ci.precoEfetivo,
      quantidade: ci.quantidade
    }));

    const modalData: NFEmissaoData = {
      items: itensDePedido,
      subtotal,
      taxaServico,
      total,
      garcom: garcomResponsavel || 'Operador',
      mesaNumero: tipoAtendimento === 'Mesa' ? Number(mesaNumero) : undefined,
      tipoAtendimento,
      cpfCliente: clienteCPF || undefined,
      pagoMetodo: checkoutMetodo
    };

    setNfModalData(modalData);
    setIsNFModalOpen(true);
  };

  const handleNFConfirmSuccess = () => {
    if (cartItems.length === 0 || !nfModalData) return;

    const itensDePedido: PedidoItem[] = cartItems.map(ci => ({
      id: ci.cartId,
      nome: ci.nomeEfetivo,
      preco: ci.precoEfetivo,
      quantidade: ci.quantidade,
      observacoes: ci.observacoes || undefined
    }));

    const novoPedido = {
      mesaNumero: tipoAtendimento === 'Mesa' ? Number(mesaNumero) : 0,
      tipo: tipoAtendimento,
      itens: itensDePedido,
      subtotal,
      taxaServico,
      total,
      garcom: garcomResponsavel,
      status: 'Pago' as const,
      statusPagamento: 'Pago' as const,
      pagamentoMetodo: nfModalData.pagoMetodo,
      clienteCPF: clienteCPF || undefined
    };

    onAddPedido(novoPedido);
    setIsNFModalOpen(false);
    onNavigate('Pedidos');
  };

  return (
    <div className="bg-brand-charcoal border border-brand-light-charcoal rounded-xl overflow-hidden select-none">
      
      {/* Title & Step Header indicator */}
      <div className="bg-brand-light-charcoal/30 px-6 py-5 border-b border-brand-light-charcoal flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-brand-yellow font-mono text-[10px] font-bold uppercase tracking-widest">MINISTÉRIO EXECUTIVO</span>
          <h2 className="font-sora font-extrabold text-base uppercase text-white">Lançar Nova Comanda</h2>
        </div>

        {/* Steps Breadcrumbs bar */}
        <div className="flex items-center gap-2 text-xs font-bold font-mono">
          <div className={`px-2.5 py-1 rounded transition ${step >= 1 ? 'bg-brand-yellow text-brand-black' : 'bg-brand-light-charcoal text-gray-500'}`}>
            1. MESA & GESTOR
          </div>
          <span className="text-gray-600">→</span>
          <div className={`px-2.5 py-1 rounded transition ${step >= 2 ? 'bg-brand-yellow text-brand-black' : 'bg-brand-light-charcoal text-gray-500'}`}>
            2. CARDÁPIO
          </div>
          <span className="text-gray-600">→</span>
          <div className={`px-2.5 py-1 rounded transition ${step >= 3 ? 'bg-brand-yellow text-brand-black' : 'bg-brand-light-charcoal text-gray-500'}`}>
            3. REVISÃO + CPF
          </div>
        </div>
      </div>

      <div className="p-6">
        
        {/* STEP 1: Mesa & Atendente Selector */}
        {step === 1 && (
          <div className="max-w-xl mx-auto space-y-6 py-4">
            <h3 className="font-sora font-extrabold text-sm uppercase tracking-wide text-gray-200">
              Passo 1: Tipo de Atendimento & Mesa do Salão
            </h3>

            {/* Service Type Selection Grid */}
            <div className="grid grid-cols-3 gap-3">
              {(['Mesa', 'Delivery', 'Retirada'] as const).map(type => (
                <button
                  key={type}
                  id={`btn-service-type-${type}`}
                  type="button"
                  onClick={() => {
                    setTipoAtendimento(type);
                    if (type !== 'Mesa') setMesaNumero(0);
                    else setMesaNumero(1);
                  }}
                  className={`py-3.5 rounded-lg border font-bold text-xs uppercase tracking-wider text-center transition ${
                    tipoAtendimento === type
                      ? 'bg-brand-yellow text-brand-black border-brand-yellow shadow-[0_0_15px_rgba(250,204,21,0.15)]'
                      : 'bg-brand-light-charcoal/40 border-brand-light-charcoal text-gray-400 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Condition 1: Mesa Numero */}
            {tipoAtendimento === 'Mesa' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                  Número da Mesa
                </label>
                <div className="grid grid-cols-3 xs:grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map(n => (
                    <button
                      key={n}
                      id={`btn-select-mesa-num-${n}`}
                      type="button"
                      onClick={() => setMesaNumero(n)}
                      className={`py-2 rounded font-mono font-bold text-xs transition ${
                        mesaNumero === n
                          ? 'bg-brand-yellow text-brand-black'
                          : 'bg-brand-light-charcoal/50 border border-brand-light-charcoal text-gray-300 hover:text-white'
                      }`}
                    >
                      Mesa {n}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Condition 2: Waiter Select */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                Atendente (Garçom Responsável)
              </label>
              <select
                id="select-waiter-responsavel"
                value={garcomResponsavel}
                onChange={(e) => setGarcomResponsavel(e.target.value)}
                className="w-full bg-brand-light-charcoal border border-brand-light-charcoal rounded-lg p-3 text-xs text-white"
              >
                <option value="">Selecione quem está atendendo a mesa...</option>
                {garçons.map(g => (
                  <option key={g.id} value={g.nome}>
                    {g.nome} ({g.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-6 border-t border-brand-light-charcoal/60 flex justify-between items-center">
              <button
                id="step-1-cancel"
                type="button"
                onClick={() => onNavigate('Pedidos')}
                className="bg-brand-light-charcoal text-gray-300 hover:text-white px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4" /> Cancelar / Voltar
              </button>
              <button
                id="step-1-next"
                disabled={!validateStep1()}
                onClick={() => setStep(2)}
                className="bg-brand-yellow disabled:bg-brand-light-charcoal disabled:text-gray-500 hover:bg-brand-yellow-dark text-brand-black px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition"
              >
                Escolher Itens <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Product Chooser */}
        {step === 2 && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-brand-light-charcoal pb-4 gap-2.5">
              <h3 className="font-sora font-extrabold text-sm uppercase tracking-wide text-gray-200 animate-pulse">
                Passo 2: Monte o Pedido do Cliente
              </h3>
              <div className="text-[11px] sm:text-xs text-brand-yellow font-mono font-bold bg-brand-light-charcoal/50 px-3 py-1.5 sm:py-1 rounded self-start sm:self-auto">
                Origem: <span className="text-white">{tipoAtendimento === 'Mesa' ? `Mesa ${mesaNumero}` : tipoAtendimento}</span> | Garçom: <span className="text-white">{garcomResponsavel}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left cardapio menu chooser: 7 cols */}
              <div className="lg:col-span-7 space-y-4">
                {/* Category tabs */}
                <div className="flex p-1 bg-brand-black rounded-lg border border-brand-light-charcoal overflow-x-auto">
                  {(['Entradas', 'Prato Principal', 'Bebidas', 'Sobremesas'] as const).map(cat => (
                    <button
                      key={cat}
                      id={`tab-menu-cat-${cat}`}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={`flex-1 text-center py-2 text-xs font-bold rounded uppercase tracking-wider transition whitespace-nowrap px-3 ${
                        activeCategory === cat
                          ? 'bg-brand-yellow text-brand-black'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Items selection Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
                  {filteredMenuItems.map(item => {
                    const activeSize = item.tamanhos && item.tamanhos.length > 0
                      ? (selectedSizes[item.id] || item.tamanhos[0].nome)
                      : undefined;
                    
                    const activePrice = activeSize && item.tamanhos
                      ? (item.tamanhos.find(t => t.nome === activeSize)?.preco ?? item.preco)
                      : item.preco;

                    const cartId = item.id + (activeSize ? '-' + activeSize : '');
                    const existingInCart = cartItems.find(ci => ci.cartId === cartId);
                    const isLowStock = item.estoqueAtual <= 10;
                    
                    return (
                      <div
                        key={item.id}
                        id={`menu-item-card-${item.id}`}
                        className="bg-brand-charcoal border border-brand-light-charcoal rounded-lg p-3.5 space-y-2 flex flex-col justify-between hover:border-brand-yellow transition"
                      >
                        <div className="space-y-1">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h4 className="text-xs font-extrabold text-gray-100 uppercase">{item.nome}</h4>
                              <span className="text-[10px] text-gray-400 font-mono">Disponível: {item.estoqueAtual} {item.unidade}</span>
                            </div>
                            <span className="font-mono text-xs font-extrabold text-brand-yellow">{formatCurrency(activePrice)}</span>
                          </div>

                          {/* Size Select Button Group on the Option */}
                          {item.tamanhos && item.tamanhos.length > 0 && (
                            <div className="flex gap-1 pt-1">
                              {item.tamanhos.map(t => {
                                const isSelected = activeSize === t.nome;
                                return (
                                  <button
                                    key={t.nome}
                                    type="button"
                                    onClick={() => setSelectedSizes(prev => ({ ...prev, [item.id]: t.nome }))}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition uppercase ${
                                      isSelected
                                        ? 'bg-brand-yellow text-brand-black font-extrabold shadow-sm'
                                        : 'bg-brand-light-charcoal/45 text-gray-400 hover:text-white border border-brand-light-charcoal/30'
                                    }`}
                                  >
                                    {t.nome}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {isLowStock && (
                          <div className="text-[9px] text-orange-400 font-mono mt-0.5 flex items-center gap-0.5">
                            <AlertCircle className="w-2.5 h-2.5" /> Estoque Baixo!
                          </div>
                        )}

                        <div className="pt-2 flex items-center justify-between border-t border-brand-light-charcoal/30">
                          {existingInCart ? (
                            <div className="flex items-center gap-2">
                              <button
                                id={`btn-dec-${item.id}`}
                                onClick={() => handleDecrementCart(item, activeSize)}
                                className="p-1 bg-brand-light-charcoal hover:bg-brand-yellow hover:text-brand-black rounded text-gray-300 transition"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-xs font-bold font-mono text-white min-w-[20px] text-center">
                                {existingInCart.quantidade}
                              </span>
                              <button
                                id={`btn-inc-${item.id}`}
                                onClick={() => handleAddToCart(item, activeSize)}
                                className="p-1 bg-brand-light-charcoal hover:bg-brand-yellow hover:text-brand-black rounded text-gray-300 transition"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              id={`btn-add-item-${item.id}`}
                              onClick={() => handleAddToCart(item, activeSize)}
                              className="w-full bg-brand-light-charcoal hover:bg-brand-yellow hover:text-brand-black font-extrabold text-[10px] uppercase tracking-wider py-1.5 rounded flex items-center justify-center gap-1 transition"
                            >
                              <Plus className="w-3" /> Adicionar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Order Cart: 5 cols */}
              <div className="lg:col-span-5 bg-brand-black/30 border border-brand-light-charcoal rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-brand-light-charcoal pb-2">
                  <div className="flex items-center gap-1.5">
                    <ShoppingCart className="w-4 h-4 text-brand-yellow" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">Comanda Provisória</h4>
                  </div>
                  <span className="bg-brand-light-charcoal px-2 py-0.5 rounded text-[10px] text-gray-300 font-mono">
                    {cartItems.length} Itens distintos
                  </span>
                </div>

                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                  {cartItems.length === 0 ? (
                    <div className="py-20 text-center text-gray-600 text-xs">
                      Clique nos itens ao lado para adicionar produtos a esta comanda.
                    </div>
                  ) : (
                    cartItems.map(ci => (
                      <div key={ci.cartId} className="p-2.5 rounded bg-brand-charcoal/50 border border-brand-light-charcoal/40 space-y-2">
                        <div className="flex justify-between items-start text-xs">
                          <div>
                            <span className="font-bold text-gray-200">{ci.nomeEfetivo}</span>
                            <div className="text-[10px] text-brand-yellow font-mono mt-0.5">
                              {ci.quantidade}x {formatCurrency(ci.precoEfetivo)} = {formatCurrency(ci.precoEfetivo * ci.quantidade)}
                            </div>
                          </div>
                          
                          <button
                            id={`btn-rm-${ci.cartId}`}
                            onClick={() => handleRemoveFromCart(ci.cartId)}
                            className="p-1 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Obs field in inline row */}
                        <div>
                          <input
                            id={`input-obs-${ci.cartId}`}
                            type="text"
                            value={ci.observacoes}
                            onChange={(e) => handleUpdateObs(ci.cartId, e.target.value)}
                            placeholder="Adicionar observação de cozinha..."
                            className="w-full bg-brand-black/60 border border-brand-light-charcoal text-[10px] text-gray-200 py-1 px-2 rounded focus:border-brand-yellow"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Subtotal preview */}
                {cartItems.length > 0 && (
                  <div className="border-t border-brand-light-charcoal pt-3 space-y-1">
                    <div className="flex justify-between text-xs font-mono text-gray-400">
                      <span>Subtotal Preliminar:</span>
                      <span className="font-bold text-white">{formatCurrency(subtotal)}</span>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Back & Next buttons */}
            <div className="pt-6 border-t border-brand-light-charcoal/60 flex flex-col sm:flex-row gap-3 justify-between items-center pb-2">
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  id="step-2-back"
                  onClick={() => setStep(1)}
                  className="w-full sm:w-auto bg-brand-light-charcoal text-gray-300 hover:text-white px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
                >
                  <ArrowLeft className="w-4 h-4" /> Voltar
                </button>
                <button
                  id="step-2-cancel"
                  type="button"
                  onClick={() => onNavigate('Pedidos')}
                  className="w-full sm:w-auto bg-transparent border border-red-500/20 hover:bg-red-500/10 text-red-400 px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center transition"
                >
                  Cancelar Pedido
                </button>
              </div>

              <button
                id="step-2-next"
                disabled={!validateStep2()}
                onClick={() => setStep(3)}
                className="w-full sm:w-auto bg-brand-yellow disabled:bg-brand-light-charcoal disabled:text-gray-500 hover:bg-brand-yellow-dark text-brand-black px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
              >
                Prosseguir para Resumo <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* STEP 3: Summary, Service toggles and CPF input */}
        {step === 3 && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <h3 className="font-sora font-extrabold text-sm uppercase tracking-wide text-gray-200">
              Passo 3: Fechamento & Lançamento Operacional
            </h3>

            {/* Operational Summary Card */}
            <div className="bg-brand-black/40 border border-brand-light-charcoal rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-brand-light-charcoal pb-3">
                <span className="text-xs font-bold text-gray-400 font-mono">RESUMO DA OPERAÇÃO</span>
                <span className="text-xs font-extrabold text-brand-yellow uppercase">
                  {tipoAtendimento === 'Mesa' ? `Mesa ${mesaNumero}` : tipoAtendimento}
                </span>
              </div>

              <div className="divide-y divide-brand-light-charcoal/30">
                {cartItems.map((ci, idx) => (
                  <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-gray-200">{ci.nomeEfetivo}</span>
                      <span className="text-gray-500 font-mono ml-2">({ci.quantidade}x)</span>
                      {ci.observacoes && (
                        <p className="text-[10px] text-brand-yellow italic mt-0.5">↳ Obs: "{ci.observacoes}"</p>
                      )}
                    </div>
                    <span className="font-mono text-gray-300">{formatCurrency(ci.precoEfetivo * ci.quantidade)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-brand-light-charcoal/50 space-y-2">
                <div className="flex justify-between text-xs font-mono text-gray-400">
                  <span>Subtotal dos Consumíveis:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <input
                      id="checkbox-service-fee"
                      type="checkbox"
                      checked={taxaServicoAtiva}
                      onChange={(e) => setTaxaServicoAtiva(e.target.checked)}
                      className="w-3.5 h-3.5 text-brand-yellow bg-brand-charcoal border-brand-light-charcoal rounded focus:ring-0 cursor-pointer"
                    />
                    <span>Cobrar taxa de serviço padrão (10%):</span>
                  </div>
                  <span>{formatCurrency(taxaServico)}</span>
                </div>

                <div className="flex justify-between text-white font-extrabold text-sm border-t border-brand-light-charcoal pt-3">
                  <span>TOTAL ESTIMADO:</span>
                  <span className="text-brand-yellow text-base">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            {/* CPF / CNPJ Identifier or loyalty card block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-brand-charcoal border border-brand-light-charcoal rounded-xl p-4 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                  CPF do Cliente (Opcional - Nota Fiscal Mineira)
                </label>
                <input
                  id="input-customer-cpf"
                  type="text"
                  value={clienteCPF}
                  onChange={(e) => setClienteCPF(e.target.value)}
                  placeholder="Ex Rascunho CPF: 000.000.000-00"
                  className="w-full bg-brand-black/40 border border-brand-light-charcoal text-xs text-white p-3 rounded-lg focus:border-brand-yellow"
                />
                <p className="text-[10px] text-gray-550 font-mono">
                  Se preenchido, o CPF será transmitido no cupom e guardado no arquivo fiscal SAF-T/SATE.
                </p>
              </div>

              {/* Payment Method Selector if checkout upfront is desired */}
              <div id="new-order-payment-method" className="bg-brand-charcoal border border-brand-light-charcoal rounded-xl p-4 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                  Forma de Lançamento / Método de Recebimento
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Pix', 'Cartão Crédito', 'Cartão Débito', 'Dinheiro'] as const).map(metodo => (
                    <button
                      key={metodo}
                      id={`new-order-billing-method-${metodo.replace(' ', '')}`}
                      type="button"
                      onClick={() => setCheckoutMetodo(metodo)}
                      className={`py-2 px-2.5 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 shrink-0 ${
                        checkoutMetodo === metodo
                          ? 'bg-emerald-500 text-white shadow-inner font-extrabold scale-[1.02]'
                          : 'bg-brand-light-charcoal/40 border border-brand-light-charcoal text-gray-400 hover:text-white'
                      }`}
                    >
                      {metodo}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-gray-550 font-mono">
                  Selecione o método e clique em <b>Fechar Comanda</b> para finalizar e emitir o cupom fiscal imediatamente.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-brand-light-charcoal/60 flex flex-col sm:flex-row gap-3 justify-between items-center">
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  id="step-3-back"
                  onClick={() => setStep(2)}
                  className="w-full sm:w-auto bg-brand-light-charcoal text-gray-300 hover:text-white px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
                >
                  <ArrowLeft className="w-4 h-4" /> Voltar
                </button>
                <button
                  id="step-3-cancel"
                  type="button"
                  onClick={() => onNavigate('Pedidos')}
                  className="w-full sm:w-auto bg-transparent border border-red-500/20 hover:bg-red-500/10 text-red-400 px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center transition"
                >
                  Cancelar
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto shrink-0">
                {tipoAtendimento === 'Mesa' && (
                  <button
                    id="step-3-save"
                    onClick={handleSavePedido}
                    className="bg-brand-light-charcoal hover:bg-brand-light-charcoal/80 border border-brand-light-charcoal text-white hover:text-brand-yellow px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition"
                  >
                    <Check className="w-4 h-4" /> Apenas Lançar Consumo
                  </button>
                )}

                <button
                  id="step-3-checkout-fiscal"
                  onClick={handleOpenNFModal}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/15 animate-pulse hover:animate-none transition"
                >
                  <DollarSign className="w-4 h-4" /> Fechar Comanda & Emitir Nota
                </button>
              </div>
            </div>

          </div>
        )}

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
