import React, { useState } from 'react';
import { 
  User, Cliente, Mesa, MenuItem, Pedido, PedidoStatus, Insumo, AuditLog, CaixaDiario, CaixaTransacao, MesaStatus 
} from './types';
import { 
  INITIAL_USERS, INITIAL_CLIENTES, MENU_ITEMS, INITIAL_MESAS, INITIAL_PEDIDOS, HISTORICO_PEDIDOS_PAGOS, INITIAL_INSUMOS, INITIAL_AUDIT_LOGS, INITIAL_CAIXA 
} from './data';

import LoginScreen from './components/LoginScreen';
import DashboardScreen from './components/DashboardScreen';
import OrdersScreen from './components/OrdersScreen';
import KitchenScreen from './components/KitchenScreen';
import NewOrderScreen from './components/NewOrderScreen';
import TablesScreen from './components/TablesScreen';
import StockScreen from './components/StockScreen';
import FinancialScreen from './components/FinancialScreen';
import CustomersScreen from './components/CustomersScreen';
import UsersScreen from './components/UsersScreen';
import AuditScreen from './components/AuditScreen';
import ConfigScreen from './components/ConfigScreen';
import LowStockNotification from './components/LowStockNotification';
import CardapioScreen from './components/CardapioScreen';

import { 
  LayoutDashboard, ShoppingCart, Coffee, PlusSquare, Map, Box, Landmark, Users, UserCog, History, Settings, Menu, ShieldCheck, Utensils 
} from 'lucide-react';

export default function App() {
  // Session authentication states
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Core databases loaded into memory state for rich persistence during mock sessions
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [clientes, setClientes] = useState<Cliente[]>(INITIAL_CLIENTES);
  const [mesas, setMesas] = useState<Mesa[]>(INITIAL_MESAS);
  const [pedidos, setPedidos] = useState<Pedido[]>(INITIAL_PEDIDOS);
  const [historicoPagos, setHistoricoPagos] = useState<Pedido[]>(HISTORICO_PEDIDOS_PAGOS);
  const [insumos, setInsumos] = useState<Insumo[]>(INITIAL_INSUMOS);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MENU_ITEMS);
  const criticalCount = insumos.filter(item => item.estoqueAtual <= item.estoqueMinimo).length;
  const [logs, setLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [caixa, setCaixa] = useState<CaixaDiario>(INITIAL_CAIXA);

  // Desktop sidebar navigation pointer
  const [activeScreen, setActiveScreen] = useState<string>('Painel Geral');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Custom log generator helper
  const addLogInner = (usuario: string, acao: string, categoria: 'Segurança' | 'Finanças' | 'Pedidos' | 'Estoque' | 'Mesas', detalhes: string) => {
    const newLog: AuditLog = {
      id: `l${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      usuario,
      acao,
      categoria,
      detalhes,
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // State actions
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActiveScreen('Painel Geral');
    addLogInner(user.nome, 'Login no Sistema', 'Segurança', 'Usuário efetuou logon bem-sucedido no back-office.');
  };

  const handleLogout = () => {
    if (currentUser) {
      addLogInner(currentUser.nome, 'Logout do Sistema', 'Segurança', 'Usuário encerrou sessão operacional.');
    }
    setCurrentUser(null);
    setActiveScreen('Login');
  };

  // Pedidos status KDS/Salão updates
  const updatePedidoStatus = (id: string, status: PedidoStatus) => {
    const target = pedidos.find(p => p.id === id);
    if (target) {
      addLogInner(
        currentUser?.nome || 'Sistema', 
        'Alteração de Status de Comanda', 
        'Pedidos', 
        `Pedido comanda #${target.numero} atualizado para status [${status}].`
      );
    }

    setPedidos(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, status };
      }
      return p;
    }));

    // If order becomes Pago or delivered, we handle table states in separate payPedido/cancelPedido
  };

  // Order payment - shift to paid history, vacancy mesa, update cash book
  const payPedido = (
    id: string, 
    metodo: 'Dinheiro' | 'Cartão Crédito' | 'Cartão Débito' | 'Pix'
  ) => {
    const target = pedidos.find(p => p.id === id);
    if (!target) return;

    const paidPedido: Pedido = {
      ...target,
      status: 'Pago',
      statusPagamento: 'Pago',
      pagamentoMetodo: metodo,
      finalizadoEm: new Date().toISOString(),
    };

    // Remove from active orders, push to historical bills list
    setPedidos(prev => prev.filter(p => p.id !== id));
    setHistoricoPagos(prev => [paidPedido, ...prev]);

    // Free table
    if (target.mesaNumero > 0) {
      setMesas(prev => prev.map(m => {
        if (m.numero === target.mesaNumero) {
          return { 
            ...m, 
            status: 'Livre', 
            totalAtual: 0.00, 
            pedidosAtivosIds: m.pedidosAtivosIds.filter(pid => pid !== id) 
          };
        }
        return m;
      }));
    }

    // Append to register bookkeeping drawer
    const newTrans: CaixaTransacao = {
      id: `t${Date.now()}`,
      timestamp: new Date().toISOString(),
      tipo: 'Entrada',
      valor: target.total,
      descricao: `Faturamento Comanda #${target.numero} (Mesa ${target.mesaNumero === 0 ? 'Balcão' : target.mesaNumero})`,
      usuario: currentUser?.nome || 'Operador',
      metodo
    };

    setCaixa(prev => ({
      ...prev,
      saldoAtual: prev.saldoAtual + target.total,
      transacoes: [newTrans, ...prev.transacoes]
    }));

    // Update customer spending logs if active CPF exists
    if (target.itens.length > 0) {
      setClientes(prev => prev.map(c => {
        // Simple search logic
        const rand = Math.floor(Math.random() * prev.length);
        if (rand === 0) {
          return { ...c, visitas: c.visitas + 1, gastoTotal: c.gastoTotal + target.total };
        }
        return c;
      }));
    }

    addLogInner(
      currentUser?.nome || 'Caixa', 
      'Fechamento Financeiro Comanda', 
      'Finanças', 
      `Comanda Comandada #${target.numero} finalizada. Faturado R$ ${target.total.toFixed(2)} via [${metodo}].`
    );
  };

  // Cancel order completely
  const cancelPedido = (id: string) => {
    const target = pedidos.find(p => p.id === id);
    if (!target) return;

    setPedidos(prev => prev.filter(p => p.id !== id));

    // Release table
    if (target.mesaNumero > 0) {
      setMesas(prev => prev.map(m => {
        if (m.numero === target.mesaNumero) {
          return { 
            ...m, 
            status: 'Livre', 
            totalAtual: 0.00, 
            pedidosAtivosIds: m.pedidosAtivosIds.filter(pid => pid !== id) 
          };
        }
        return m;
      }));
    }

    addLogInner(
      currentUser?.nome || 'Gerente', 
      'Cancelamento de Pedido', 
      'Pedidos', 
      `Pedido #${target.numero} cancelado de forma imutável.`
    );
  };

  // Create new active order from stepper Wizard
  const handleAddPedido = (novo: {
    mesaNumero: number;
    tipo: 'Mesa' | 'Delivery' | 'Retirada';
    itens: any[];
    subtotal: number;
    taxaServico: number;
    total: number;
    garcom: string;
    status: PedidoStatus;
    statusPagamento: 'Pendente' | 'Pago';
    pagamentoMetodo?: 'Dinheiro' | 'Cartão Crédito' | 'Cartão Débito' | 'Pix';
  }) => {
    const newNum = pedidos.length > 0 ? Math.max(...pedidos.map(p => p.numero)) + 1 : 1006;
    const newId = String(newNum);

    const isPaid = novo.statusPagamento === 'Pago';

    const fullPedido: Pedido = {
      id: newId,
      numero: newNum,
      mesaNumero: novo.mesaNumero,
      status: isPaid ? 'Pago' : novo.status,
      tipo: novo.tipo,
      itens: novo.itens,
      subtotal: novo.subtotal,
      taxaServico: novo.taxaServico,
      total: novo.total,
      criadoEm: new Date().toISOString(),
      garcom: novo.garcom,
      statusPagamento: novo.statusPagamento,
      pagamentoMetodo: novo.pagamentoMetodo,
      finalizadoEm: isPaid ? new Date().toISOString() : undefined
    };

    if (isPaid) {
      setHistoricoPagos(prev => [fullPedido, ...prev]);
    } else {
      setPedidos(prev => [fullPedido, ...prev]);
    }

    // Occupy Table if selection is Table
    if (novo.tipo === 'Mesa' && novo.mesaNumero > 0) {
      setMesas(prev => prev.map(m => {
        if (m.numero === novo.mesaNumero) {
          if (isPaid) {
            return {
              ...m,
              status: 'Livre',
              totalAtual: 0.00,
              pedidosAtivosIds: m.pedidosAtivosIds.filter(pid => pid !== newId)
            };
          } else {
            return {
              ...m,
              status: 'Ocupada',
              garcom: novo.garcom,
              totalAtual: novo.subtotal,
              pedidosAtivosIds: [...m.pedidosAtivosIds, newId]
            };
          }
        }
        return m;
      }));
    }

    // Real recipe-based stock deduction: look up dish ingredients in state and consume
    setInsumos(prev => {
      const updated = [...prev];
      novo.itens.forEach(orderedItem => {
        // Find matching menu item from our active menuItems state
        const dish = menuItems.find(m => m.id === orderedItem.id || m.nome === orderedItem.nome);
        if (dish && dish.ingredientes && dish.ingredientes.length > 0) {
          dish.ingredientes.forEach(recipeIngredient => {
            const index = updated.findIndex(ins => ins.id === recipeIngredient.insumoId);
            if (index > -1) {
              const prevEstoque = updated[index].estoqueAtual;
              const consumedAmount = recipeIngredient.quantidade * orderedItem.quantidade;
              updated[index] = {
                ...updated[index],
                estoqueAtual: Math.max(0, Number((prevEstoque - consumedAmount).toFixed(3)))
              };
            }
          });
        } else {
          // Fallback legacy direct item name match deduction
          const index = updated.findIndex(ins => ins.nome.toLowerCase() === orderedItem.nome.toLowerCase());
          if (index > -1) {
            const prevEstoque = updated[index].estoqueAtual;
            updated[index] = {
              ...updated[index],
              estoqueAtual: Math.max(0, Number((prevEstoque - orderedItem.quantidade).toFixed(3)))
            };
          }
        }
      });
      return updated;
    });

    if (isPaid) {
      // Append to register bookkeeping drawer
      const newTrans: CaixaTransacao = {
        id: `t${Date.now()}`,
        timestamp: new Date().toISOString(),
        tipo: 'Entrada',
        valor: novo.total,
        descricao: `Venda Direta PDV Comanda #${newNum} (${novo.tipo})`,
        usuario: currentUser?.nome || 'Operador',
        metodo: novo.pagamentoMetodo
      };

      setCaixa(prev => ({
        ...prev,
        saldoAtual: prev.saldoAtual + novo.total,
        transacoes: [newTrans, ...prev.transacoes]
      }));

      // Update customer spending logs if active CPF exists
      if (novo.itens.length > 0) {
        setClientes(prev => prev.map(c => {
          const rand = Math.floor(Math.random() * prev.length);
          if (rand === 0) {
            return { ...c, visitas: c.visitas + 1, gastoTotal: c.gastoTotal + novo.total };
          }
          return c;
        }));
      }

      addLogInner(
        novo.garcom,
        'Fechamento Venda Direta PDV',
        'Finanças',
        `Cupom #${newNum} emitido. Faturado R$ ${novo.total.toFixed(2)} via [${novo.pagamentoMetodo}].`
      );
    } else {
      addLogInner(
        novo.garcom,
        'Abertura de Comanda Nova',
        'Pedidos',
        `Lançada comanda de salão #${newNum} para ${novo.tipo === 'Mesa' ? `Mesa ${novo.mesaNumero}` : novo.tipo}. Total: R$ ${novo.total.toFixed(2)}.`
      );
    }
  };

  // Adjust raw goods Stock values
  const updateStock = (id: string, newAmount: number, changeType?: 'entrada' | 'saída', details?: string) => {
    setInsumos(prev => prev.map(ins => {
      if (ins.id === id) {
        return { ...ins, estoqueAtual: newAmount };
      }
      return ins;
    }));

    const item = insumos.find(i => i.id === id);
    if (item) {
      addLogInner(
        currentUser?.nome || 'Chef', 
        'Movimentação de Estoque', 
        'Estoque', 
        `Insumo [${item.nome}] reajustado para ${newAmount} ${item.unidade}. Motivo: ${details || 'Ajuste operacional.'}`
      );
    }
  };

  const handleAddInsumo = (novo: Omit<Insumo, 'id'>) => {
    const newId = `i${insumos.length + 1}`;
    const full: Insumo = { ...novo, id: newId };
    setInsumos(prev => [...prev, full]);

    addLogInner(
      currentUser?.nome || 'Admin', 
      'Matrícula de Insumo Novo', 
      'Estoque', 
      `Insumo [${novo.nome}] adicionado ao inventário de produção.`
    );
  };

  const handleEditInsumo = (updated: Insumo) => {
    setInsumos(prev => prev.map(ins => ins.id === updated.id ? updated : ins));

    addLogInner(
      currentUser?.nome || 'Admin', 
      'Edição de Insumo', 
      'Estoque', 
      `Insumo [${updated.nome}] atualizado completamente pelo operador.`
    );
  };

  // Table manual override
  const updateMesaStatus = (numero: number, status: MesaStatus, garcom?: string) => {
    setMesas(prev => prev.map(m => {
      if (m.numero === numero) {
        return { ...m, status, garcom };
      }
      return m;
    }));

    addLogInner(
      currentUser?.nome || 'Gerente', 
      'Forçamento de Status de Mesa', 
      'Mesas', 
      `Mesa ${numero} forçada para status [${status}] vinculada a ${garcom || 'Ninguém'}.`
    );
  };

  // General Manual Transaction in cashier ledger
  const addTransacao = (trans: Omit<CaixaTransacao, 'id' | 'timestamp'>) => {
    const finalTrans: CaixaTransacao = {
      ...trans,
      id: `t${Date.now()}`,
      timestamp: new Date().toISOString()
    };

    setCaixa(prev => {
      const finalSaldo = trans.tipo === 'Entrada' 
        ? prev.saldoAtual + trans.valor 
        : prev.saldoAtual - trans.valor;

      return {
        ...prev,
        saldoAtual: finalSaldo,
        transacoes: [finalTrans, ...prev.transacoes]
      };
    });

    addLogInner(
      trans.usuario, 
      `Controle Manual de Caixa: ${trans.tipo}`, 
      'Finanças', 
      `Lançamento manual de R$ ${trans.valor.toFixed(2)} devido a: "${trans.descricao}".`
    );
  };

  // Toggle open/closed shift of cash registers
  const toggleCaixa = (aberto: boolean, saldoInicial?: number) => {
    setCaixa(prev => ({
      ...prev,
      aberto,
      saldoInicial: saldoInicial !== undefined ? saldoInicial : prev.saldoInicial,
      saldoAtual: saldoInicial !== undefined ? saldoInicial : prev.saldoAtual
    }));

    addLogInner(
      currentUser?.nome || 'Caixa', 
      aberto ? 'Abertura de Caixa Diário' : 'Fechamento de Caixa Diário', 
      'Finanças', 
      aberto 
        ? `Início de expediente caixa com troco inicial de R$ ${saldoInicial?.toFixed(2)}.` 
        : `Fechamento do caixa operacional. Movimentações salvas no SATE fiscal.`
    );
  };

  const handleAddCliente = (novo: Omit<Cliente, 'id'>) => {
    const newId = `c${clientes.length + 1}`;
    setClientes(prev => [...prev, { ...novo, id: newId }]);

    addLogInner(
      currentUser?.nome || 'Atendente', 
      'Fidelização de CPF', 
      'Segurança', 
      `Cliente [${novo.nome}] cadastrado com CPF ${novo.cpf}.`
    );
  };

  const handleAddUser = (novo: Omit<User, 'id'>) => {
    const newId = `u${users.length + 1}`;
    setUsers(prev => [...prev, { ...novo, id: newId }]);

    addLogInner(
      currentUser?.nome || 'Gerente', 
      'Admissão de Colaborador', 
      'Segurança', 
      `Nova credencial concedida para [${novo.nome}] com perfil ${novo.role}.`
    );
  };

  const toggleUserStatus = (id: string) => {
    const target = users.find(u => u.id === id);
    if (target) {
      const nextStatus = target.status === 'Ativo' ? 'Inativo' : 'Ativo';
      addLogInner(
        currentUser?.nome || 'Gerente', 
        'Titulamento de Colaborador', 
        'Segurança', 
        `Status do colaborador [${target.nome}] alterado para ${nextStatus}.`
      );
    }

    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        return { ...u, status: u.status === 'Ativo' ? 'Inativo' : 'Ativo' };
      }
      return u;
    }));
  };

  const handleAddMenuItem = (novo: Omit<MenuItem, 'id'>) => {
    const nextId = `m-${Date.now()}`;
    const newItem: MenuItem = {
      ...novo,
      id: nextId
    };
    setMenuItems(prev => [...prev, newItem]);
  };

  const handleUpdateMenuItem = (updated: MenuItem) => {
    setMenuItems(prev => prev.map(item => item.id === updated.id ? updated : item));
  };

  const handleDeleteMenuItem = (id: string) => {
    setMenuItems(prev => prev.filter(it => it.id !== id));
  };

  // Config triggers logs
  const addConfigLog = (details: string) => {
    addLogInner(currentUser?.nome || 'Supervisor', 'Ajuste de Parâmetros', 'Segurança', details);
  };

  // Unpack routing
  if (!currentUser) {
    return <LoginScreen users={users} onLogin={handleLogin} />;
  }

  // Sidebar structures definition
  const sidebarGroups = [
    {
      titulo: 'Operação',
      links: [
        { nome: 'Painel Geral', icon: LayoutDashboard },
        { nome: 'Pedidos', icon: ShoppingCart },
        { nome: 'Cozinha', icon: Coffee },
        { nome: 'Novo Pedido', icon: PlusSquare },
        { nome: 'Gestão de Mesas', icon: Map },
      ]
    },
    {
      titulo: 'Gestão',
      links: [
        { nome: 'Gerenciar Cardápio', icon: Utensils },
        { nome: 'Estoque', icon: Box },
        { nome: 'Financeiro / Caixa', icon: Landmark },
        { nome: 'Clientes', icon: Users },
        { nome: 'Usuários', icon: UserCog },
      ]
    },
    {
      titulo: 'Configurações',
      links: [
        { nome: 'Log de Auditoria', icon: History },
        { nome: 'Configurações do Sistema', icon: Settings },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col lg:flex-row select-none font-sans">
      
      {/* Mobile Sticky Top Header */}
      <header className="lg:hidden bg-zinc-950 border-b border-zinc-900 px-4 py-3 sticky top-0 z-40 flex items-center justify-between text-zinc-400 select-none shadow-md">
        <div className="flex items-center gap-3">
          <button
            id="mobile-hamburger-toggle"
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 hover:bg-zinc-900 text-brand-yellow rounded transition"
            title="Abrir Menu"
          >
            <Menu className="w-5.5 h-5.5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-yellow rounded flex items-center justify-center">
              <span className="text-zinc-950 font-black text-xs font-sora">D</span>
            </div>
            <span className="text-white font-extrabold tracking-tight text-sm font-sora">
              Digão
            </span>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold bg-brand-yellow/10 border border-brand-yellow/20 px-2 py-0.5 rounded text-brand-yellow uppercase tracking-wider">
          {activeScreen}
        </span>
      </header>

      {/* Mobile Sidebar Back-drop Mask */}
      {isSidebarOpen && (
        <div 
          id="mobile-backdrop-mask"
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity duration-200"
        />
      )}

      {/* Mobile Sidebar overlay drawer */}
      {isSidebarOpen && (
        <div 
          id="mobile-drawer-sidebar"
          className="lg:hidden fixed inset-y-0 left-0 w-64 bg-zinc-950 border-r border-zinc-905 z-50 flex flex-col justify-between p-4 select-none shadow-2xl text-zinc-400 animate-in slide-in-from-left duration-205"
        >
          <div>
            {/* Mobile Drawer Header with Close Button */}
            <div className="pb-4 mb-2 border-b border-zinc-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-brand-yellow rounded flex items-center justify-center shadow-md">
                  <span className="text-zinc-950 font-black text-sm font-sora">D</span>
                </div>
                <h1 className="text-white font-extrabold tracking-tight text-base font-sora">
                  Digão<span className="text-brand-yellow">.</span>
                </h1>
              </div>
              
              <button
                id="btn-close-mobile-nav"
                onClick={() => setIsSidebarOpen(false)}
                className="px-2 py-1 bg-zinc-900 text-zinc-400 hover:text-white rounded text-[10px] font-bold font-mono transition"
              >
                FECHAR
              </button>
            </div>

            {/* Mobile Nav link groups */}
            <nav className="space-y-5 overflow-y-auto max-h-[70vh] py-2">
              {sidebarGroups.map(group => (
                <div key={group.titulo} className="space-y-1.5">
                  <span className="block text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest pl-2">
                    {group.titulo}
                  </span>

                  <ul className="space-y-1">
                    {sidebarGroups.find(g => g.titulo === group.titulo)?.links.map(lnk => {
                      const isCurrent = activeScreen === lnk.nome;
                      const Icon = lnk.icon;

                      return (
                        <li key={lnk.nome}>
                          <button
                            id={`mobile-nav-link-${lnk.nome.replace(/\s+/g, '_')}`}
                            onClick={() => {
                              setActiveScreen(lnk.nome);
                              setIsSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded transition-colors duration-150 tracking-wide text-left ${
                              isCurrent
                                ? 'bg-brand-yellow text-zinc-950 font-bold shadow-md'
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                            }`}
                          >
                            <div className="relative flex items-center justify-center shrink-0">
                              <Icon className={`w-4 h-4 ${isCurrent ? 'text-zinc-950' : 'text-brand-yellow'}`} />
                              {lnk.nome === 'Estoque' && criticalCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold leading-none bg-red-600 text-white shadow-sm">
                                  {criticalCount}
                                </span>
                              )}
                            </div>
                            <span>{lnk.nome}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          {/* Drawer Footer info with end shift button */}
          <div className="pt-4 border-t border-zinc-900 flex flex-col gap-2 bg-zinc-950">
            <div className="flex items-center gap-2 px-2">
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-brand-yellow/20 flex items-center justify-center font-bold text-xs text-brand-yellow">
                {currentUser.nome.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{currentUser.nome.split(' ')[0]}</div>
                <div className="text-[10px] font-mono text-zinc-500 font-semibold block mt-0.5 uppercase">{currentUser.role}</div>
              </div>
            </div>
            
            <button
              id="mobile-logout"
              onClick={() => {
                setIsSidebarOpen(false);
                handleLogout();
              }}
              className="w-full bg-zinc-900 border border-zinc-850 hover:bg-red-650 hover:text-white py-2 rounded text-[10px] font-bold uppercase tracking-widest text-center transition"
            >
              Encerrar Turno (Sair)
            </button>
          </div>
        </div>
      )}

      {/* Desktop Left Sidebar: 240px */}
      <aside className="hidden lg:flex w-60 bg-zinc-950 border-r border-zinc-900 shrink-0 flex-col justify-between select-none shadow-xl text-zinc-400">
        <div>
          {/* Logo Brand Header */}
          <div className="p-6 mb-2 border-b border-zinc-900 flex flex-col">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-yellow rounded flex items-center justify-center shadow-md">
                <span className="text-zinc-950 font-black text-lg font-sora">D</span>
              </div>
              <h1 className="text-white font-extrabold tracking-tight text-lg font-sora">
                Digão<span className="text-brand-yellow">.</span>
              </h1>
            </div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1.5 font-bold font-mono">
              RESTAURANTE
            </p>
          </div>

          {/* Navigation link groups */}
          <nav className="p-4 space-y-6">
            {sidebarGroups.map(group => (
              <div key={group.titulo} className="space-y-2">
                <span className="block text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest pl-2">
                  {group.titulo}
                </span>

                <ul className="space-y-1">
                  {group.links.map(lnk => {
                    const isCurrent = activeScreen === lnk.nome;
                    const Icon = lnk.icon;

                    return (
                      <li key={lnk.nome}>
                        <button
                          id={`nav-link-${lnk.nome.replace(/\s+/g, '_')}`}
                          onClick={() => setActiveScreen(lnk.nome)}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded transition-colors duration-150 tracking-wide text-left ${
                            isCurrent
                              ? 'bg-brand-yellow text-zinc-950 font-bold shadow-md'
                              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                          }`}
                        >
                          <div className="relative flex items-center justify-center shrink-0">
                            <Icon className={`w-4 h-4 ${isCurrent ? 'text-zinc-950' : 'text-brand-yellow'}`} />
                            {lnk.nome === 'Estoque' && criticalCount > 0 && (
                              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold leading-none bg-red-600 text-white shadow-sm">
                                  {criticalCount}
                              </span>
                            )}
                          </div>
                          <span>{lnk.nome}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Current user Profile indicator at bottom of sidebar */}
        <div className="p-4 border-t border-zinc-900 bg-zinc-900/10 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 px-2">
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-brand-yellow/20 flex items-center justify-center font-bold text-xs text-brand-yellow">
              {currentUser.nome.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">{currentUser.nome.split(' ')[0]}</div>
              <div className="text-[10px] font-mono text-zinc-500 font-semibold block mt-0.5 uppercase">{currentUser.role}</div>
            </div>
          </div>

          <button
            id="sidebar-logout"
            onClick={handleLogout}
            className="w-full bg-zinc-900 border border-zinc-850 hover:bg-red-650 hover:text-white py-2 rounded text-[10px] font-bold uppercase tracking-widest text-center transition"
          >
            Encerrar Turno (Sair)
          </button>
        </div>
      </aside>

      {/* Main content viewport: clean, crisp zinc-50 */}
      <main className="flex-1 bg-zinc-50 p-4 sm:p-6 overflow-y-auto min-h-screen text-zinc-900 font-sans">
        <LowStockNotification
          insumos={insumos}
          onUpdateStock={updateStock}
          onNavigate={setActiveScreen}
        />
        {activeScreen === 'Painel Geral' && (
          <DashboardScreen
            pedidos={pedidos}
            historicoPagos={historicoPagos}
            mesas={mesas}
            insumos={insumos}
            currentUser={currentUser}
            onNavigate={setActiveScreen}
            onLogout={handleLogout}
          />
        )}

        {activeScreen === 'Pedidos' && (
          <OrdersScreen
            pedidos={pedidos}
            historicoPagos={historicoPagos}
            currentUser={currentUser}
            onUpdateStatus={updatePedidoStatus}
            onPayPedido={payPedido}
            onCancelPedido={cancelPedido}
            onNavigate={setActiveScreen}
          />
        )}

        {activeScreen === 'Cozinha' && (
          <KitchenScreen
            pedidos={pedidos}
            onUpdateStatus={updatePedidoStatus}
          />
        )}

        {activeScreen === 'Novo Pedido' && (
          <NewOrderScreen
            users={users}
            menuItems={menuItems}
            onAddPedido={handleAddPedido}
            onNavigate={setActiveScreen}
          />
        )}

        {activeScreen === 'Gerenciar Cardápio' && (
          <CardapioScreen
            menuItems={menuItems}
            insumos={insumos}
            onAddMenuItem={handleAddMenuItem}
            onUpdateMenuItem={handleUpdateMenuItem}
            onDeleteMenuItem={handleDeleteMenuItem}
            addLog={(acao, detalhes) => addLogInner(currentUser?.nome || 'Admin', acao, 'Estoque', detalhes)}
          />
        )}

        {activeScreen === 'Gestão de Mesas' && (
          <TablesScreen
            mesas={mesas}
            users={users}
            pedidos={pedidos}
            onPayPedido={payPedido}
            onUpdateMesaStatus={updateMesaStatus}
            onNavigate={setActiveScreen}
          />
        )}

        {activeScreen === 'Estoque' && (
          <StockScreen
            insumos={insumos}
            onUpdateStock={updateStock}
            onAddInsumo={handleAddInsumo}
            onEditInsumo={handleEditInsumo}
          />
        )}

        {activeScreen === 'Financeiro / Caixa' && (
          <FinancialScreen
            caixa={caixa}
            onAddTransacao={addTransacao}
            onToggleCaixa={toggleCaixa}
            currentUser={currentUser}
          />
        )}

        {activeScreen === 'Clientes' && (
          <CustomersScreen
            clientes={clientes}
            onAddCliente={handleAddCliente}
          />
        )}

        {activeScreen === 'Usuários' && (
          <UsersScreen
            users={users}
            onAddUser={handleAddUser}
            onToggleUserStatus={toggleUserStatus}
          />
        )}

        {activeScreen === 'Log de Auditoria' && (
          <AuditScreen
            logs={logs}
          />
        )}

        {activeScreen === 'Configurações do Sistema' && (
          <ConfigScreen
            onAddConfigLog={addConfigLog}
          />
        )}
      </main>

    </div>
  );
}
