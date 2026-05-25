import { User, Cliente, Mesa, MenuItem, Pedido, Insumo, AuditLog, CaixaDiario } from './types';

export const INITIAL_USERS: User[] = [
  { id: 'u1', nome: 'Douglas Macedo (Gestor)', role: 'Gerente', email: 'douglas@digaorestaurante.com.br', status: 'Ativo', username: 'douglas', senha: '123' },
  { id: 'u2', nome: 'Maurício Souza (Salão)', role: 'Garçom', email: 'mauricio@digaorestaurante.com.br', status: 'Ativo', username: 'mauricio', senha: '123' },
  { id: 'u3', nome: 'Julia Alencar (Salão)', role: 'Garçom', email: 'julia@digaorestaurante.com.br', status: 'Ativo', username: 'julia', senha: '123' },
  { id: 'u4', nome: 'Mestre Valdir (Chef)', role: 'Cozinheiro', email: 'valdir@digaorestaurante.com.br', status: 'Ativo', username: 'valdir', senha: '123' },
  { id: 'u5', nome: 'Antônia Lima (Caixa)', role: 'Caixa', email: 'antonia@digaorestaurante.com.br', status: 'Ativo', username: 'antonia', senha: '123' },
];

export const INITIAL_CLIENTES: Cliente[] = [
  { id: 'c1', nome: 'Gabriel Fabiano', telefone: '(11) 98765-4321', cpf: '123.456.789-00', visitas: 24, gastoTotal: 1840.50 },
  { id: 'c2', nome: 'Mariana Guimarães', telefone: '(21) 99123-5566', cpf: '456.789.012-34', visitas: 12, gastoTotal: 960.00 },
  { id: 'c3', nome: 'Ricardo Portella', telefone: '(31) 98877-3344', cpf: '789.012.345-67', visitas: 8, gastoTotal: 540.20 },
  { id: 'c4', nome: 'Ana Beatriz Reis', telefone: '(11) 97766-5544', cpf: '234.567.890-12', visitas: 35, gastoTotal: 3120.00 },
  { id: 'c5', nome: 'Marcelo Peixoto', telefone: '(11) 96543-2109', cpf: '345.678.901-23', visitas: 3, gastoTotal: 290.00 },
];

export const MENU_ITEMS: MenuItem[] = [
  // Entradas
  { 
    id: 'm1', 
    nome: 'Dadinhos de Tapioca (8 un)', 
    preco: 34.00, 
    categoria: 'Entradas', 
    estoqueAtual: 150, 
    unidade: 'un',
    ingredientes: [{ insumoId: 'i8', quantidade: 0.2 }, { insumoId: 'i4', quantidade: 0.15 }]
  },
  { 
    id: 'm2', 
    nome: 'Torresmo de Rolo Crocante', 
    preco: 45.00, 
    categoria: 'Entradas', 
    estoqueAtual: 42, 
    unidade: 'un',
    ingredientes: [{ insumoId: 'i3', quantidade: 0.4 }]
  },
  { 
    id: 'm3', 
    nome: 'Bolinho de Feijoada (6 un)', 
    preco: 38.00, 
    categoria: 'Entradas', 
    estoqueAtual: 85, 
    unidade: 'un',
    ingredientes: [{ insumoId: 'i11', quantidade: 0.15 }, { insumoId: 'i3', quantidade: 0.1 }]
  },
  { 
    id: 'm4', 
    nome: 'Pastel Misto do Digão (6 un)', 
    preco: 36.00, 
    categoria: 'Entradas', 
    estoqueAtual: 120, 
    unidade: 'un',
    ingredientes: [{ insumoId: 'i3', quantidade: 0.15 }, { insumoId: 'i4', quantidade: 0.1 }]
  },

  // Pratos Principais / Marmitas do Cardápio do Dia
  {
    id: 'm-tropeiro',
    nome: 'Marmita Feijão Tropeiro',
    preco: 22.00,
    categoria: 'Prato Principal',
    estoqueAtual: 30,
    unidade: 'porção',
    disponivelDiasSemana: ['Segunda', 'Sexta'],
    ativoHoje: true,
    ingredientes: [
      { insumoId: 'i10', quantidade: 0.15 }, // Arroz
      { insumoId: 'i11', quantidade: 0.12 }, // Feijão
      { insumoId: 'i12', quantidade: 0.05 }, // Couve
      { insumoId: 'i13', quantidade: 1.00 }, // Ovo
      { insumoId: 'i3', quantidade: 0.10 }   // Barriga/Suíno
    ],
    tamanhos: [
      {
        nome: 'Pequena',
        preco: 17.00,
        ingredientes: [
          { insumoId: 'i10', quantidade: 0.10 },
          { insumoId: 'i11', quantidade: 0.08 },
          { insumoId: 'i12', quantidade: 0.03 },
          { insumoId: 'i13', quantidade: 1.00 },
          { insumoId: 'i3', quantidade: 0.06 }
        ]
      },
      {
        nome: 'Grande',
        preco: 22.00,
        ingredientes: [
          { insumoId: 'i10', quantidade: 0.15 },
          { insumoId: 'i11', quantidade: 0.12 },
          { insumoId: 'i12', quantidade: 0.05 },
          { insumoId: 'i13', quantidade: 1.00 },
          { insumoId: 'i3', quantidade: 0.10 }
        ]
      }
    ]
  },
  {
    id: 'm-carne-cozida',
    nome: 'Marmita Carne Cozida',
    preco: 22.00,
    categoria: 'Prato Principal',
    estoqueAtual: 25,
    unidade: 'porção',
    disponivelDiasSemana: ['Segunda', 'Terça'],
    ativoHoje: true,
    ingredientes: [
      { insumoId: 'i15', quantidade: 0.20 }, // Bife/Carne
      { insumoId: 'i21', quantidade: 0.10 }, // Macarrão
      { insumoId: 'i10', quantidade: 0.15 }, // Arroz Comum
      { insumoId: 'i11', quantidade: 0.10 }  // Feijão Comum
    ],
    tamanhos: [
      {
        nome: 'Pequena',
        preco: 17.00,
        ingredientes: [
          { insumoId: 'i15', quantidade: 0.12 },
          { insumoId: 'i21', quantidade: 0.06 },
          { insumoId: 'i10', quantidade: 0.10 },
          { insumoId: 'i11', quantidade: 0.08 }
        ]
      },
      {
        nome: 'Grande',
        preco: 22.00,
        ingredientes: [
          { insumoId: 'i15', quantidade: 0.20 },
          { insumoId: 'i21', quantidade: 0.10 },
          { insumoId: 'i10', quantidade: 0.15 },
          { insumoId: 'i11', quantidade: 0.10 }
        ]
      }
    ]
  },
  {
    id: 'm-costelinha',
    nome: 'Marmita Costelinha de Porco',
    preco: 22.00,
    categoria: 'Prato Principal',
    estoqueAtual: 20,
    unidade: 'porção',
    disponivelDiasSemana: ['Terça', 'Quarta'],
    ativoHoje: false,
    ingredientes: [
      { insumoId: 'i17', quantidade: 0.22 }, // Costelinha
      { insumoId: 'i20', quantidade: 0.15 }, // Abóbora
      { insumoId: 'i10', quantidade: 0.15 }, // Arroz
      { insumoId: 'i11', quantidade: 0.10 }  // Feijão
    ],
    tamanhos: [
      {
        nome: 'Pequena',
        preco: 17.00,
        ingredientes: [
          { insumoId: 'i17', quantidade: 0.15 },
          { insumoId: 'i20', quantidade: 0.10 },
          { insumoId: 'i10', quantidade: 0.10 },
          { insumoId: 'i11', quantidade: 0.08 }
        ]
      },
      {
        nome: 'Grande',
        preco: 22.00,
        ingredientes: [
          { insumoId: 'i17', quantidade: 0.22 },
          { insumoId: 'i20', quantidade: 0.15 },
          { insumoId: 'i10', quantidade: 0.15 },
          { insumoId: 'i11', quantidade: 0.10 }
        ]
      }
    ]
  },
  {
    id: 'm-frango-empanado',
    nome: 'Marmita Frango Empanado',
    preco: 22.00,
    categoria: 'Prato Principal',
    estoqueAtual: 35,
    unidade: 'porção',
    disponivelDiasSemana: ['Quarta', 'Quinta'],
    ativoHoje: false,
    ingredientes: [
      { insumoId: 'i14', quantidade: 0.20 }, // Frango
      { insumoId: 'i21', quantidade: 0.12 }, // Macarrão (Macarronese)
      { insumoId: 'i10', quantidade: 0.15 }, // Arroz
      { insumoId: 'i11', quantidade: 0.10 }  // Feijão
    ],
    tamanhos: [
      {
        nome: 'Pequena',
        preco: 17.00,
        ingredientes: [
          { insumoId: 'i14', quantidade: 0.13 },
          { insumoId: 'i21', quantidade: 0.08 },
          { insumoId: 'i10', quantidade: 0.10 },
          { insumoId: 'i11', quantidade: 0.08 }
        ]
      },
      {
        nome: 'Grande',
        preco: 22.00,
        ingredientes: [
          { insumoId: 'i14', quantidade: 0.20 },
          { insumoId: 'i21', quantidade: 0.12 },
          { insumoId: 'i10', quantidade: 0.15 },
          { insumoId: 'i11', quantidade: 0.10 }
        ]
      }
    ]
  },
  {
    id: 'm-frango-cozido',
    nome: 'Marmita Frango Cozido',
    preco: 22.00,
    categoria: 'Prato Principal',
    estoqueAtual: 40,
    unidade: 'porção',
    disponivelDiasSemana: ['Quinta', 'Sexta'],
    ativoHoje: false,
    ingredientes: [
      { insumoId: 'i14', quantidade: 0.25 }, // Frango cozido
      { insumoId: 'i10', quantidade: 0.15 }, // Arroz
      { insumoId: 'i11', quantidade: 0.10 }  // Feijão
    ],
    tamanhos: [
      {
        nome: 'Pequena',
        preco: 17.00,
        ingredientes: [
          { insumoId: 'i14', quantidade: 0.16 },
          { insumoId: 'i10', quantidade: 0.10 },
          { insumoId: 'i11', quantidade: 0.08 }
        ]
      },
      {
        nome: 'Grande',
        preco: 22.00,
        ingredientes: [
          { insumoId: 'i14', quantidade: 0.25 },
          { insumoId: 'i10', quantidade: 0.15 },
          { insumoId: 'i11', quantidade: 0.10 }
        ]
      }
    ]
  },
  {
    id: 'm-bife-acebolado',
    nome: 'Marmita Bife de Boi Acebolado',
    preco: 22.00,
    categoria: 'Prato Principal',
    estoqueAtual: 28,
    unidade: 'porção',
    disponivelDiasSemana: ['Sexta', 'Sábado'],
    ativoHoje: false,
    ingredientes: [
      { insumoId: 'i15', quantidade: 0.20 }, // Bife de boi
      { insumoId: 'i18', quantidade: 0.15 }, // Batata doce
      { insumoId: 'i10', quantidade: 0.15 }, // Arroz
      { insumoId: 'i11', quantidade: 0.10 }  // Feijão
    ],
    tamanhos: [
      {
        nome: 'Pequena',
        preco: 17.00,
        ingredientes: [
          { insumoId: 'i15', quantidade: 0.13 },
          { insumoId: 'i18', quantidade: 0.10 },
          { insumoId: 'i10', quantidade: 0.10 },
          { insumoId: 'i11', quantidade: 0.08 }
        ]
      },
      {
        nome: 'Grande',
        preco: 22.00,
        ingredientes: [
          { insumoId: 'i15', quantidade: 0.20 },
          { insumoId: 'i18', quantidade: 0.15 },
          { insumoId: 'i10', quantidade: 0.15 },
          { insumoId: 'i11', quantidade: 0.10 }
        ]
      }
    ]
  },
  {
    id: 'm-lingua',
    nome: 'Marmita Língua de Boi ao Molho',
    preco: 22.00,
    categoria: 'Prato Principal',
    estoqueAtual: 18,
    unidade: 'porção',
    disponivelDiasSemana: ['Sábado', 'Segunda'],
    ativoHoje: false,
    ingredientes: [
      { insumoId: 'i16', quantidade: 0.22 }, // Língua de boi
      { insumoId: 'i18', quantidade: 0.15 }, // Batata doce
      { insumoId: 'i10', quantidade: 0.15 }, // Arroz
      { insumoId: 'i11', quantidade: 0.10 }  // Feijão
    ],
    tamanhos: [
      {
        nome: 'Pequena',
        preco: 17.00,
        ingredientes: [
          { insumoId: 'i16', quantidade: 0.14 },
          { insumoId: 'i18', quantidade: 0.10 },
          { insumoId: 'i10', quantidade: 0.10 },
          { insumoId: 'i11', quantidade: 0.08 }
        ]
      },
      {
        nome: 'Grande',
        preco: 22.00,
        ingredientes: [
          { insumoId: 'i16', quantidade: 0.22 },
          { insumoId: 'i18', quantidade: 0.15 },
          { insumoId: 'i10', quantidade: 0.15 },
          { insumoId: 'i11', quantidade: 0.10 }
        ]
      }
    ]
  },

  { 
    id: 'm5', 
    nome: 'Feijoada Completa (2 pessoas)', 
    preco: 110.00, 
    categoria: 'Prato Principal', 
    estoqueAtual: 30, 
    unidade: 'porções',
    ingredientes: [{ insumoId: 'i11', quantidade: 0.5 }, { insumoId: 'i3', quantidade: 0.4 }]
  },
  { 
    id: 'm6', 
    nome: 'Baião de Dois com Coalho', 
    preco: 68.00, 
    categoria: 'Prato Principal', 
    estoqueAtual: 40, 
    unidade: 'porções',
    ingredientes: [{ insumoId: 'i10', quantidade: 0.3 }, { insumoId: 'i4', quantidade: 0.2 }, { insumoId: 'i11', quantidade: 0.2 }]
  },
  { 
    id: 'm7', 
    nome: 'Picanha Grelhada na Brasa', 
    preco: 138.00, 
    categoria: 'Prato Principal', 
    estoqueAtual: 25, 
    unidade: 'kg',
    ingredientes: [{ insumoId: 'i1', quantidade: 0.4 }]
  },
  { 
    id: 'm8', 
    nome: 'Escondidinho de Carne Seca', 
    preco: 56.00, 
    categoria: 'Prato Principal', 
    estoqueAtual: 50, 
    unidade: 'porções',
    ingredientes: [{ insumoId: 'i2', quantidade: 0.5 }]
  },

  // Bebidas
  { id: 'm9', nome: 'Caipirinha Clássica de Limão', preco: 18.00, categoria: 'Bebidas', estoqueAtual: 300, unidade: 'un', ingredientes: [{ insumoId: 'i5', quantidade: 0.15 }, { insumoId: 'i6', quantidade: 0.08 }] },
  { id: 'm10', nome: 'Caipirinha Três Limões Leblon', preco: 26.00, categoria: 'Bebidas', estoqueAtual: 100, unidade: 'un', ingredientes: [{ insumoId: 'i5', quantidade: 0.25 }, { insumoId: 'i6', quantidade: 0.08 }] },
  { id: 'm11', nome: 'Chopp Brahma Gelado (300ml)', preco: 11.00, categoria: 'Bebidas', estoqueAtual: 500, unidade: 'copos' },
  { id: 'm12', nome: 'Cerveja Original Garrafa (600ml)', preco: 16.00, categoria: 'Bebidas', estoqueAtual: 180, unidade: 'un', ingredientes: [{ insumoId: 'i7', quantidade: 1.0 }] },
  { id: 'm13', nome: 'Água Mineral com Gás', preco: 6.00, categoria: 'Bebidas', estoqueAtual: 240, unidade: 'un' },
  // Sobremesas
  { id: 'm14', nome: 'Pudim de Leite Condensado Vovó', preco: 14.00, categoria: 'Sobremesas', estoqueAtual: 45, unidade: 'fatias' },
  { id: 'm15', nome: 'Churros de Tapioca com Doce de Leite', preco: 18.00, categoria: 'Sobremesas', estoqueAtual: 35, unidade: 'un', ingredientes: [{ insumoId: 'i8', quantidade: 0.08 }, { insumoId: 'i9', quantidade: 0.05 }] },
];

export const INITIAL_MESAS: Mesa[] = [
  { numero: 1, status: 'Ocupada', capacidade: 4, garcom: 'Maurício Souza (Salão)', totalAtual: 56.00, pedidosAtivosIds: ['1001'] },
  { numero: 2, status: 'Livre', capacidade: 2, totalAtual: 0.00, pedidosAtivosIds: [] },
  { numero: 3, status: 'Livre', capacidade: 4, totalAtual: 0.00, pedidosAtivosIds: [] },
  { numero: 4, status: 'Conta Solicitada', capacidade: 6, garcom: 'Maurício Souza (Salão)', totalAtual: 204.60, pedidosAtivosIds: ['1003'] },
  { numero: 5, status: 'Reservada', capacidade: 4, garcom: 'Julia Alencar (Salão)', totalAtual: 0.00, pedidosAtivosIds: [] },
  { numero: 6, status: 'Ocupada', capacidade: 2, garcom: 'Julia Alencar (Salão)', totalAtual: 124.00, pedidosAtivosIds: ['1002'] },
  { numero: 7, status: 'Livre', capacidade: 8, totalAtual: 0.00, pedidosAtivosIds: [] },
  { numero: 8, status: 'Livre', capacidade: 4, totalAtual: 0.00, pedidosAtivosIds: [] },
  { numero: 10, status: 'Ocupada', capacidade: 4, garcom: 'Julia Alencar (Salão)', totalAtual: 86.00, pedidosAtivosIds: ['1005'] },
  { numero: 12, status: 'Livre', capacidade: 6, totalAtual: 0.00, pedidosAtivosIds: [] },
];

export const INITIAL_PEDIDOS: Pedido[] = [
  {
    id: '1001',
    numero: 1001,
    mesaNumero: 1,
    status: 'Preparo',
    tipo: 'Mesa',
    itens: [
      { id: 'm2', nome: 'Torresmo de Rolo Crocante', preco: 45.00, quantidade: 1, observacoes: 'Borda bem crocante' },
      { id: 'm11', nome: 'Chopp Brahma Gelado (300ml)', preco: 11.00, quantidade: 1 }
    ],
    subtotal: 56.00,
    taxaServico: 5.60,
    total: 61.60,
    criadoEm: '2026-05-22T02:15:00Z',
    garcom: 'Maurício Souza (Salão)',
    statusPagamento: 'Pendente'
  },
  {
    id: '1002',
    numero: 1002,
    mesaNumero: 6,
    status: 'Preparo',
    tipo: 'Mesa',
    itens: [
      { id: 'm6', nome: 'Baião de Dois com Coalho', preco: 68.00, quantidade: 1, observacoes: 'Coentro extra caprichado' },
      { id: 'm4', nome: 'Pastel Misto do Digão (6 un)', preco: 36.00, quantidade: 1 },
      { id: 'm12', nome: 'Cerveja Original Garrafa (600ml)', preco: 16.00, quantidade: 1, observacoes: 'Traga balde com gelo' }
    ],
    subtotal: 120.00,
    taxaServico: 12.00,
    total: 132.00,
    criadoEm: '2026-05-22T02:00:00Z',
    garcom: 'Julia Alencar (Salão)',
    statusPagamento: 'Pendente'
  },
  {
    id: '1003',
    numero: 1003,
    mesaNumero: 4,
    status: 'Entregue',
    tipo: 'Mesa',
    itens: [
      { id: 'm5', nome: 'Feijoada Completa (2 pessoas)', preco: 110.00, quantidade: 1 },
      { id: 'm12', nome: 'Cerveja Original Garrafa (600ml)', preco: 16.00, quantidade: 4 },
      { id: 'm14', nome: 'Pudim de Leite Condensado Vovó', preco: 14.00, quantidade: 1 }
    ],
    subtotal: 188.00,
    taxaServico: 18.80,
    total: 206.80,
    criadoEm: '2026-05-22T01:10:00Z',
    garcom: 'Maurício Souza (Salão)',
    statusPagamento: 'Pendente'
  },
  {
    id: '1004',
    numero: 1004,
    mesaNumero: 0, // Delivery/Retirada use 0
    status: 'Pendente',
    tipo: 'Delivery',
    itens: [
      { id: 'm8', nome: 'Escondidinho de Carne Seca', preco: 56.00, quantidade: 2 },
      { id: 'm13', nome: 'Água Mineral com Gás', preco: 6.00, quantidade: 2 }
    ],
    subtotal: 124.00,
    taxaServico: 0,
    total: 124.00,
    criadoEm: '2026-05-22T02:40:00Z',
    garcom: 'Douglas Macedo (Gestor)',
    statusPagamento: 'Pendente'
  },
  {
    id: '1005',
    numero: 1005,
    mesaNumero: 10,
    status: 'Pendente',
    tipo: 'Mesa',
    itens: [
      { id: 'm1', nome: 'Dadinhos de Tapioca (8 un)', preco: 34.00, quantidade: 1 },
      { id: 'm10', nome: 'Caipirinha Três Limões Leblon', preco: 26.00, quantidade: 2 }
    ],
    subtotal: 86.00,
    taxaServico: 8.60,
    total: 94.60,
    criadoEm: '2026-05-22T02:55:00Z',
    garcom: 'Julia Alencar (Salão)',
    statusPagamento: 'Pendente'
  }
];

export const HISTORICO_PEDIDOS_PAGOS: Pedido[] = [
  {
    id: '995',
    numero: 995,
    mesaNumero: 3,
    status: 'Pago',
    tipo: 'Mesa',
    itens: [{ id: 'm3', nome: 'Bolinho de Feijoada (6 un)', preco: 38.00, quantidade: 1 }, { id: 'm11', nome: 'Chopp Brahma Gelado (300ml)', preco: 11.00, quantidade: 5 }],
    subtotal: 93.00,
    taxaServico: 9.30,
    total: 102.30,
    criadoEm: '2026-05-21T21:30:00Z',
    finalizadoEm: '2026-05-21T22:45:00Z',
    garcom: 'Maurício Souza (Salão)',
    pagamentoMetodo: 'Pix',
    statusPagamento: 'Pago'
  },
  {
    id: '996',
    numero: 996,
    mesaNumero: 12,
    status: 'Pago',
    tipo: 'Mesa',
    itens: [
      { id: 'm7', nome: 'Picanha Grelhada na Brasa', preco: 138.00, quantidade: 1 },
      { id: 'm12', nome: 'Cerveja Original Garrafa (600ml)', preco: 16.00, quantidade: 3 },
      { id: 'm15', nome: 'Churros de Tapioca com Doce de Leite', preco: 18.00, quantidade: 2 }
    ],
    subtotal: 222.00,
    taxaServico: 22.20,
    total: 244.20,
    criadoEm: '2026-05-21T20:15:00Z',
    finalizadoEm: '2026-05-21T22:30:00Z',
    garcom: 'Julia Alencar (Salão)',
    pagamentoMetodo: 'Cartão Crédito',
    statusPagamento: 'Pago'
  },
  {
    id: '997',
    numero: 997,
    mesaNumero: 2,
    status: 'Pago',
    tipo: 'Mesa',
    itens: [{ id: 'm1', nome: 'Dadinhos de Tapioca (8 un)', preco: 34.00, quantidade: 2 }, { id: 'm9', nome: 'Caipirinha Clássica de Limão', preco: 18.00, quantidade: 3 }],
    subtotal: 122.00,
    taxaServico: 12.20,
    total: 134.20,
    criadoEm: '2026-05-21T19:40:00Z',
    finalizadoEm: '2026-05-21T21:00:00Z',
    garcom: 'Maurício Souza (Salão)',
    pagamentoMetodo: 'Cartão Débito',
    statusPagamento: 'Pago'
  },
  {
    id: '998',
    numero: 998,
    mesaNumero: 0,
    status: 'Pago',
    tipo: 'Delivery',
    itens: [{ id: 'm5', nome: 'Feijoada Completa (2 pessoas)', preco: 110.00, quantidade: 1 }],
    subtotal: 110.00,
    taxaServico: 0,
    total: 110.00,
    criadoEm: '2026-05-21T19:10:00Z',
    finalizadoEm: '2026-05-21T20:05:00Z',
    garcom: 'Douglas Macedo (Gestor)',
    pagamentoMetodo: 'Pix',
    statusPagamento: 'Pago'
  }
];

export const INITIAL_INSUMOS: Insumo[] = [
  { id: 'i1', nome: 'Corte de Picanha Angustiana', estoqueAtual: 18.4, estoqueMinimo: 20.0, unidade: 'kg', categoria: 'Carnes', custoPorUnidade: 62.00, fornecedor: 'Frigorífico Sul Meat Ltda' },
  { id: 'i2', nome: 'Mandioca Amarela Descascada', estoqueAtual: 45.0, estoqueMinimo: 15.0, unidade: 'kg', categoria: 'Secos', custoPorUnidade: 6.50, fornecedor: 'Horti&Terra Dist.' },
  { id: 'i3', nome: 'Barriga de Porco Selecionada', estoqueAtual: 30.5, estoqueMinimo: 15.0, unidade: 'kg', categoria: 'Carnes', custoPorUnidade: 22.00, fornecedor: 'Suínos da Serra Brasil' },
  { id: 'i4', nome: 'Queijo de Coalho Nordestino', estoqueAtual: 22.0, estoqueMinimo: 10.0, unidade: 'kg', categoria: 'Lácteos', custoPorUnidade: 42.00, fornecedor: 'Laticínios Sertanejos' },
  { id: 'i5', nome: 'Limão Taiti Selecionado', estoqueAtual: 8.5, estoqueMinimo: 15.0, unidade: 'kg', categoria: 'Hortifruti', custoPorUnidade: 4.80, fornecedor: 'Horti&Terra Dist.' },
  { id: 'i6', nome: 'Cachaça Artesanal Envelhecida', estoqueAtual: 15.0, estoqueMinimo: 5.0, unidade: 'litros', categoria: 'Bebidas', custoPorUnidade: 28.00, fornecedor: 'Alambique Engenho Dourado' },
  { id: 'i7', nome: 'Cerveja Original 600ml Garrafa', estoqueAtual: 180, estoqueMinimo: 240, unidade: 'un', categoria: 'Bebidas', custoPorUnidade: 9.80, fornecedor: 'Ambev Distribuição SP' },
  { id: 'i8', nome: 'Farinha de Tapioca Fina', estoqueAtual: 12.0, estoqueMinimo: 10.0, unidade: 'kg', categoria: 'Secos', custoPorUnidade: 14.50, fornecedor: 'Secos & Molhados Nordeste' },
  { id: 'i9', nome: 'Doce de Leite Viçosa Balde', estoqueAtual: 5.0, estoqueMinimo: 3.0, unidade: 'kg', categoria: 'Lácteos', custoPorUnidade: 45.00, fornecedor: 'Viçosa Minas Distr.' },
  { id: 'i10', nome: 'Arroz Agulhinha Tipo 1', estoqueAtual: 150.0, estoqueMinimo: 30.0, unidade: 'kg', categoria: 'Secos', custoPorUnidade: 5.50, fornecedor: 'Cerealista Central Novo Rio' },
  { id: 'i11', nome: 'Feijão Carioquinha Novo', estoqueAtual: 120.0, estoqueMinimo: 25.0, unidade: 'kg', categoria: 'Secos', custoPorUnidade: 8.00, fornecedor: 'Cerealista Central Novo Rio' },
  { id: 'i12', nome: 'Couve Manteiga Fresca', estoqueAtual: 25.0, estoqueMinimo: 8.0, unidade: 'kg', categoria: 'Hortifruti', custoPorUnidade: 6.00, fornecedor: 'Horti&Terra Dist.' },
  { id: 'i13', nome: 'Ovo Vermelho Caipira', estoqueAtual: 300, estoqueMinimo: 100, unidade: 'un', categoria: 'Secos', custoPorUnidade: 0.50, fornecedor: 'Granja Novo Amanhecer' },
  { id: 'i14', nome: 'Filé de Frango Grelhado Peito', estoqueAtual: 80.0, estoqueMinimo: 20.0, unidade: 'kg', categoria: 'Carnes', custoPorUnidade: 14.50, fornecedor: 'Frigorífico Sul Meat Ltda' },
  { id: 'i15', nome: 'Carne / Bife de Boi Grelhado', estoqueAtual: 75.0, estoqueMinimo: 20.0, unidade: 'kg', categoria: 'Carnes', custoPorUnidade: 42.00, fornecedor: 'Frigorífico Sul Meat Ltda' },
  { id: 'i16', nome: 'Língua de Boi para Molho', estoqueAtual: 28.0, estoqueMinimo: 10.0, unidade: 'kg', categoria: 'Carnes', custoPorUnidade: 28.00, fornecedor: 'Frigorífico Sul Meat Ltda' },
  { id: 'i17', nome: 'Costelinha Suína Especial', estoqueAtual: 45.0, estoqueMinimo: 15.0, unidade: 'kg', categoria: 'Carnes', custoPorUnidade: 32.00, fornecedor: 'Suínos da Serra Brasil' },
  { id: 'i18', nome: 'Batata Doce Amarela', estoqueAtual: 60.0, estoqueMinimo: 15.0, unidade: 'kg', categoria: 'Hortifruti', custoPorUnidade: 4.20, fornecedor: 'Horti&Terra Dist.' },
  { id: 'i19', nome: 'Maionese de Ovos Tradicional', estoqueAtual: 15.0, estoqueMinimo: 5.0, unidade: 'kg', categoria: 'Lácteos', custoPorUnidade: 12.00, fornecedor: 'Distribuidora Aliança' },
  { id: 'i20', nome: 'Abóbora Cabotiá Madura', estoqueAtual: 35.0, estoqueMinimo: 10.0, unidade: 'kg', categoria: 'Hortifruti', custoPorUnidade: 3.80, fornecedor: 'Horti&Terra Dist.' },
  { id: 'i21', nome: 'Macarrão Espaguete de Sêmola', estoqueAtual: 80.0, estoqueMinimo: 20.0, unidade: 'kg', categoria: 'Secos', custoPorUnidade: 6.20, fornecedor: 'Secos & Molhados Nordeste' },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: 'l1', timestamp: '2026-05-22T02:56:00Z', usuario: 'Julia Alencar', acao: 'Criação de Pedido', categoria: 'Pedidos', detalhes: 'Pedido #1005 registrado para Mesa 10. Total: R$ 94,60.' },
  { id: 'l2', timestamp: '2026-05-22T02:40:00Z', usuario: 'Douglas Macedo', acao: 'Criação de Pedido', categoria: 'Pedidos', detalhes: 'Pedido de Delivery #1004 registrado para Gabriel Fabiano. Total: R$ 124,00.' },
  { id: 'l3', timestamp: '2026-05-22T01:30:00Z', usuario: 'Douglas Macedo', acao: 'Abertura de Caixa', categoria: 'Finanças', detalhes: 'Operador de Caixa Antônia Lima abriu o caixa do dia com saldo de R$ 500,00.' },
  { id: 'l4', timestamp: '2026-05-22T00:15:00Z', usuario: 'Mestre Valdir', acao: 'Ajuste de Estoque', categoria: 'Estoque', detalhes: 'Retirado 2.5kg de Barriga de Porco para porcionamento pré-salão.' },
  { id: 'l5', timestamp: '2026-05-21T23:05:00Z', usuario: 'Antônia Lima', acao: 'Fechamento de Caixa Anterior', categoria: 'Finanças', detalhes: 'Fechado o caixa do turno anterior com faturamento registrado de R$ 2.840,40.' }
];

export const INITIAL_CAIXA: CaixaDiario = {
  aberto: true,
  saldoInicial: 500.00,
  saldoAtual: 1241.50, // Saldo inicial + faturamento recente
  transacoes: [
    { id: 't1', timestamp: '2026-05-22T01:30:00Z', tipo: 'Entrada', valor: 500.00, descricao: 'Fundo de troco inicial - Abertura de Caixa', usuario: 'Douglas Macedo' },
    { id: 't2', timestamp: '2026-05-22T01:45:00Z', tipo: 'Saída', valor: 65.00, descricao: 'Compra emergencial de Limão Taiti (Mercado Local)', usuario: 'Antônia Lima' },
    { id: 't3', timestamp: '2026-05-22T02:10:00Z', tipo: 'Entrada', valor: 244.20, descricao: 'Recebimento Pedido #996 - Mesa 12 (Cartão Crédito)', usuario: 'Antônia Lima', metodo: 'Cartão Crédito' },
    { id: 't4', timestamp: '2026-05-22T02:30:00Z', tipo: 'Entrada', valor: 102.30, descricao: 'Recebimento Pedido #995 - Mesa 3 (Pix)', usuario: 'Antônia Lima', metodo: 'Pix' },
    { id: 't5', timestamp: '2026-05-22T02:50:00Z', tipo: 'Entrada', valor: 460.00, descricao: 'Aporte manual para reserva de troco', usuario: 'Douglas Macedo' }
  ]
};
