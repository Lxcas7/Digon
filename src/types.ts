export type UserRole = 'Gerente' | 'Garçom' | 'Cozinheiro' | 'Supervisor' | 'Caixa';

export interface User {
  id: string;
  nome: string;
  role: UserRole;
  email: string;
  status: 'Ativo' | 'Inativo';
  username?: string;
  senha?: string;
}

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  cpf: string;
  visitas: number;
  gastoTotal: number;
}

export type MesaStatus = 'Livre' | 'Ocupada' | 'Conta Solicitada' | 'Reservada';

export interface Mesa {
  numero: number;
  status: MesaStatus;
  capacidade: number;
  garcom?: string;
  totalAtual: number;
  pedidosAtivosIds: string[];
}

export interface IngredienteReceita {
  insumoId: string;
  quantidade: number; // e.g. 0.25 (meaning 0.25 kg or 250g, 1 un, etc.)
}

export interface TamanhoItem {
  nome: string; // e.g. "Pequena", "Grande"
  preco: number;
  ingredientes?: IngredienteReceita[];
}

export interface MenuItem {
  id: string;
  nome: string;
  preco: number;
  categoria: 'Entradas' | 'Prato Principal' | 'Bebidas' | 'Sobremesas';
  estoqueAtual: number;
  unidade: string;
  ingredientes?: IngredienteReceita[];
  disponivelDiasSemana?: string[]; // e.g. ['Segunda', 'Quarta', 'Sexta']
  ativoHoje?: boolean; // dynamic flexible active state
  tamanhos?: TamanhoItem[];
}

export interface PedidoItem {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  observacoes?: string;
}

export type PedidoStatus = 'Pendente' | 'Preparo' | 'Pronto' | 'Entregue' | 'Pago' | 'Cancelado';

export interface Pedido {
  id: string;
  numero: number;
  mesaNumero: number;
  status: PedidoStatus;
  tipo: 'Mesa' | 'Delivery' | 'Retirada';
  itens: PedidoItem[];
  subtotal: number;
  taxaServico: number; // 10% or custom
  total: number;
  criadoEm: string; // ISO Timestamp
  finalizadoEm?: string;
  garcom: string;
  pagamentoMetodo?: 'Dinheiro' | 'Cartão Crédito' | 'Cartão Débito' | 'Pix';
  statusPagamento: 'Pendente' | 'Pago' | 'Cancelado';
  clienteCPF?: string;
}

export interface Insumo {
  id: string;
  nome: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  unidade: string; // 'kg', 'un', 'litros'
  categoria: 'Carnes' | 'Bebidas' | 'Hortifruti' | 'Secos' | 'Lácteos';
  custoPorUnidade: number;
  fornecedor: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  usuario: string;
  acao: string;
  categoria: 'Segurança' | 'Finanças' | 'Pedidos' | 'Estoque' | 'Mesas';
  detalhes: string;
}

export interface CaixaTransacao {
  id: string;
  timestamp: string;
  tipo: 'Entrada' | 'Saída';
  valor: number;
  descricao: string;
  usuario: string;
  metodo?: string;
}

export interface CaixaDiario {
  aberto: boolean;
  saldoInicial: number;
  saldoAtual: number;
  transacoes: CaixaTransacao[];
}
