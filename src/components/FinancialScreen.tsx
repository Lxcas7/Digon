import React, { useState } from 'react';
import { CaixaDiario, CaixaTransacao, User } from '../types';
import { CreditCard, DollarSign, ArrowUpRight, ArrowDownRight, Search, PlusCircle, LayoutGrid, ToggleLeft, ToggleRight, Calendar, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

const HISTORICAL_REGISTERS: Record<string, CaixaDiario> = {
  '2026-05-21': {
    aberto: false,
    saldoInicial: 450.00,
    saldoAtual: 3750.50,
    transacoes: [
      { id: 'h21-1', timestamp: '2026-05-21T09:00:00Z', tipo: 'Entrada', valor: 450.00, descricao: 'Fundo de troco inicial - Início do Turno', usuario: 'Douglas Macedo' },
      { id: 'h21-2', timestamp: '2026-05-21T11:45:00Z', tipo: 'Entrada', valor: 284.50, descricao: 'Faturamento Comanda #980 - Mesa 4 (Pix)', usuario: 'Antônia Lima', metodo: 'Pix' },
      { id: 'h21-3', timestamp: '2026-05-21T12:30:00Z', tipo: 'Entrada', valor: 940.00, descricao: 'Recebimento Evento Corporativo - Mesa 12 (Cartão Crédito)', usuario: 'Douglas Macedo', metodo: 'Cartão Crédito' },
      { id: 'h21-4', timestamp: '2026-05-21T15:20:00Z', tipo: 'Saída', valor: 120.00, descricao: 'Retirada de caixa - Compra urgente de material de limpeza', usuario: 'Douglas Macedo' },
      { id: 'h21-5', timestamp: '2026-05-21T19:15:00Z', tipo: 'Entrada', valor: 1540.00, descricao: 'Aporte de fluxo de faturamento do salão', usuario: 'Antônia Lima', metodo: 'Dinheiro' },
      { id: 'h21-6', timestamp: '2026-05-21T21:00:00Z', tipo: 'Entrada', valor: 656.00, descricao: 'Faturamento Balcão Comanda #988 (Cartão Débito)', usuario: 'Antônia Lima', metodo: 'Cartão Débito' }
    ]
  },
  '2026-05-20': {
    aberto: false,
    saldoInicial: 500.00,
    saldoAtual: 3270.00,
    transacoes: [
      { id: 'h20-1', timestamp: '2026-05-20T09:00:00Z', tipo: 'Entrada', valor: 500.00, descricao: 'Abertura do Caixa Comercial e de Suporte', usuario: 'Douglas Macedo' },
      { id: 'h20-2', timestamp: '2026-05-20T12:15:00Z', tipo: 'Entrada', valor: 1450.00, descricao: 'Faturamento Almoço Executivo Coletivo (Pix)', usuario: 'Antônia Lima', metodo: 'Pix' },
      { id: 'h20-3', timestamp: '2026-05-20T14:30:00Z', tipo: 'Saída', valor: 210.00, descricao: 'Saída de caixa - Pagamento Hortifruti Dist. Horti&Terra', usuario: 'Douglas Macedo' },
      { id: 'h20-4', timestamp: '2026-05-20T20:45:00Z', tipo: 'Entrada', valor: 1530.00, descricao: 'Recebimentos Comandas de Jantar #950 a #965', usuario: 'Antônia Lima', metodo: 'Cartão Crédito' }
    ]
  },
  '2026-05-19': {
    aberto: false,
    saldoInicial: 500.00,
    saldoAtual: 4280.00,
    transacoes: [
      { id: 'h19-1', timestamp: '2026-05-19T09:00:00Z', tipo: 'Entrada', valor: 500.00, descricao: 'Abertura Operacional do Caixa', usuario: 'Douglas Macedo' },
      { id: 'h19-2', timestamp: '2026-05-19T13:00:00Z', tipo: 'Entrada', valor: 2120.00, descricao: 'Consolidado Vendas Turno Diurno (Cartão Débito)', usuario: 'Antônia Lima', metodo: 'Cartão Débito' },
      { id: 'h19-3', timestamp: '2026-05-19T16:00:00Z', tipo: 'Saída', valor: 340.00, descricao: 'Retirada para Manutenção Ar-condicionado Salão', usuario: 'Douglas Macedo' },
      { id: 'h19-4', timestamp: '2026-05-19T21:30:00Z', tipo: 'Entrada', valor: 2000.00, descricao: 'Consolidado Vendas Turno Noturno', usuario: 'Antônia Lima', metodo: 'Pix' }
    ]
  }
};

interface FinancialScreenProps {
  caixa: CaixaDiario;
  onAddTransacao: (transacao: Omit<CaixaTransacao, 'id' | 'timestamp'>) => void;
  onToggleCaixa: (aberto: boolean, saldoInicial?: number) => void;
  currentUser: User | null;
}

export default function FinancialScreen({ caixa, onAddTransacao, onToggleCaixa, currentUser }: FinancialScreenProps) {
  const [selectedDate, setSelectedDate] = useState<string>('2026-05-22');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [tipoFilter, setTipoFilter] = useState<string>('TODOS');
  
  // Create Manual Trans state
  const [showTransForm, setShowTransForm] = useState<boolean>(false);
  const [transTipo, setTransTipo] = useState<'Entrada' | 'Saída'>('Saída');
  const [transValor, setTransValor] = useState<number>(0);
  const [transDesc, setTransDesc] = useState<string>('');
  
  // Toggle Caixa shift state
  const [showToggleModal, setShowToggleModal] = useState<boolean>(false);
  const [showCloseModal, setShowCloseModal] = useState<boolean>(false);
  const [tempSaldoIn, setTempSaldoIn] = useState<number>(500);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [closeError, setCloseError] = useState<string>('');

  const getCaixaForDate = (dateStr: string): CaixaDiario => {
    if (dateStr === '2026-05-22') {
      return caixa;
    }
    if (HISTORICAL_REGISTERS[dateStr]) {
      return HISTORICAL_REGISTERS[dateStr];
    }
    
    // Otherwise, dynamically generate highly polished, repeatable fake data based on the date input!
    const seed = dateStr.split('-').reduce((acc, curr) => acc + parseInt(curr || '0', 10), 0);
    const dateObj = new Date(dateStr + 'T12:00:00');
    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
    
    const baseInicial = 500;
    const numEntradas = 3 + (seed % 4);
    const numSaidas = 1 + (seed % 2);
    
    const transacoesGenerated: CaixaTransacao[] = [
      {
        id: `gen-${dateStr}-ini`,
        timestamp: `${dateStr}T09:00:00Z`,
        tipo: 'Entrada',
        valor: baseInicial,
        descricao: 'Fundo de troco inicial - Abertura de Caixa Comercial',
        usuario: 'Douglas Macedo'
      }
    ];
    
    let totalEntradas = baseInicial;
    let totalSaidas = 0;
    
    const descricoesEntrada = [
      'Faturamento Jantar Comandas Combinado de Sushis/Drinks',
      'Recebimento Almoço Executivo Comanda #812',
      'Fundo de troco adicional - Entrada manual',
      'Faturamento Buffet Completo e Bebidas do Salão',
      'Recebimento via PIX Comanda Especial Familiar',
      'Faturamento sobremesa e cafés do salão',
      'Recebimento Grupo Empresarial Happy Hour',
      'Faturamento Delivery Digão Premium'
    ];
    
    const descricoesSaida = [
      'Saída de Caixa - Reposição Hortifruti de emergência',
      'Saída de Caixa - Compra material de embalagem delivery',
      'Retirada operacional - Devolução de troco incorreto',
      'Saída de Caixa - Manutenção rápida bico de chopeira salão',
      'Retirada de caixa - Compra emergencial de gelo'
    ];
    
    const operadores = ['Antônia Lima', 'Douglas Macedo', 'Julia Alencar'];
    const metodos = ['Pix', 'Cartão Crédito', 'Cartão Débito', 'Dinheiro'];
    
    for (let i = 0; i < numEntradas; i++) {
      const valor = (80 + ((seed + i * 47) % 350)) * (isWeekend ? 1.5 : 1.0);
      const desc = descricoesEntrada[(seed + i) % descricoesEntrada.length];
      const user = operadores[(seed + i) % operadores.length];
      const metodo = metodos[(seed + i) % metodos.length];
      
      transacoesGenerated.push({
        id: `gen-${dateStr}-ent-${i}`,
        timestamp: `${dateStr}T${11 + i * 2}:30:00Z`,
        tipo: 'Entrada',
        valor: parseFloat(valor.toFixed(2)),
        descricao: desc,
        usuario: user,
        metodo
      });
      totalEntradas += valor;
    }

    for (let i = 0; i < numSaidas; i++) {
      const valor = 30 + ((seed + i * 89) % 120);
      const desc = descricoesSaida[(seed + i) % descricoesSaida.length];
      const user = operadores[(seed + 1 + i) % operadores.length];
      
      transacoesGenerated.push({
        id: `gen-${dateStr}-sai-${i}`,
        timestamp: `${dateStr}T${15 + i * 2}:15:00Z`,
        tipo: 'Saída',
        valor: parseFloat(valor.toFixed(2)),
        descricao: desc,
        usuario: user
      });
      totalSaidas += valor;
    }
    
    transacoesGenerated.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      aberto: false,
      saldoInicial: baseInicial,
      saldoAtual: parseFloat((totalEntradas - totalSaidas).toFixed(2)),
      transacoes: transacoesGenerated
    };
  };

  const activeCaixa = getCaixaForDate(selectedDate);
  const isToday = selectedDate === '2026-05-22';

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

  // Calculations map to activeCaixa
  const entradas = activeCaixa.transacoes.filter(t => t.tipo === 'Entrada').reduce((acc, curr) => acc + curr.valor, 0);
  const saidas = activeCaixa.transacoes.filter(t => t.tipo === 'Saída').reduce((acc, curr) => acc + curr.valor, 0);

  const handleExport = (format: 'pdf' | 'excel' | 'csv', scope: 'ledger' | 'summary') => {
    const todayStr = selectedDate;
    const dateFormatted = selectedDate === '2026-05-22'
      ? new Date().toLocaleString('pt-BR')
      : `${new Date(selectedDate + 'T23:59:00').toLocaleDateString('pt-BR')} às 23:59`;

    if (format === 'csv') {
      let csvContent = "";
      if (scope === 'ledger') {
        const headers = ['ID do Lançamento', 'Data e Hora', 'Tipo', 'Valor (R$)', 'Descrição', 'Método de Pagamento', 'Operador'];
        const rows = filteredTransacoes.map(t => {
          const id = t.id.toUpperCase();
          const dateStr = new Date(t.timestamp).toLocaleString('pt-BR');
          const typeStr = t.tipo;
          const valueStr = t.valor.toFixed(2).replace('.', ',');
          const descStr = t.descricao.replace(/;/g, ',').replace(/"/g, '""');
          const methodStr = t.metodo || 'Lançamento Manual';
          const operatorStr = t.usuario.replace(/;/g, ',');
          return [id, dateStr, typeStr, valueStr, descStr, methodStr, operatorStr];
        });
        csvContent = "\uFEFF" + [headers.map(h => `"${h}"`).join(';'), ...rows.map(r => r.map(cell => `"${cell}"`).join(';'))].join('\r\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `extrato_lancamentos_caixa_${todayStr}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const headers = ['Métrica de Caixa', 'Valor'];
        const rows = [
          ['Status do Caixa', activeCaixa.aberto ? 'ABERTO' : 'FECHADO'],
          ['Troco Inicial (Partida)', activeCaixa.saldoInicial.toFixed(2).replace('.', ',')],
          ['Total Acumulado de Receitas (Entradas)', entradas.toFixed(2).replace('.', ',')],
          ['Total Acumulado de Saídas (Retiradas)', saidas.toFixed(2).replace('.', ',')],
          ['Saldo Atual em Caixa', activeCaixa.saldoAtual.toFixed(2).replace('.', ',')],
          ['Data e Hora de Extração', dateFormatted],
        ];
        csvContent = "\uFEFF" + [headers.map(h => `"${h}"`).join(';'), ...rows.map(r => r.map(cell => `"${cell}"`).join(';'))].join('\r\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `resumo_fechamento_caixa_${todayStr}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } 
    else if (format === 'excel') {
      if (scope === 'ledger') {
        const data = filteredTransacoes.map(t => ({
          'ID Lançamento': t.id.toUpperCase(),
          'Data / Hora': new Date(t.timestamp).toLocaleString('pt-BR'),
          'Tipo de Fluxo': t.tipo,
          'Valor (R$)': t.valor,
          'Descrição': t.descricao,
          'Meio de Pagamento': t.metodo || 'Lançamento Manual',
          'Operador Responsável': t.usuario
        }));
        
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Lançamentos de Caixa');
        
        worksheet['!cols'] = [
          { wch: 15 },
          { wch: 20 },
          { wch: 12 },
          { wch: 15 },
          { wch: 40 },
          { wch: 20 },
          { wch: 25 },
        ];

        XLSX.writeFile(workbook, `lancamentos_caixa_${todayStr}.xlsx`);
      } else {
        const data = [
          { 'Métrica de Competência': 'Status Operacional do Caixa', 'Subtotal / Totalizador': activeCaixa.aberto ? 'ABERTO' : 'FECHADO' },
          { 'Métrica de Competência': 'Fundo Inicial de Troco (Partida)', 'Subtotal / Totalizador': activeCaixa.saldoInicial },
          { 'Métrica de Competência': 'Total de Aportes / Entradas', 'Subtotal / Totalizador': entradas },
          { 'Métrica de Competência': 'Total de Saídas / Retiradas', 'Subtotal / Totalizador': saidas },
          { 'Métrica de Competência': 'Saldo Final em Caixa', 'Subtotal / Totalizador': activeCaixa.saldoAtual },
          { 'Métrica de Competência': 'Data Hora de Fechamento do Arquivo', 'Subtotal / Totalizador': dateFormatted }
        ];

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Resumo do Turno');
        
        worksheet['!cols'] = [
          { wch: 40 },
          { wch: 25 },
        ];

        XLSX.writeFile(workbook, `resumo_caixa_${todayStr}.xlsx`);
      }
    } 
    else if (format === 'pdf') {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Template styling
      doc.setFillColor(30, 30, 30);
      doc.rect(15, 15, 180, 8, 'F');
      
      // Title Block
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(30, 30, 30);
      doc.text('DIGÃO RESTAURANTE S.A.', 15, 32);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('CNPJ: 12.345.678/0001-99 | Relatório Oficial de Frente de Caixa / PDV', 15, 37);

      // Divider line
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(15, 41, 195, 41);

      // Label and header titles
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(40, 40, 40);
      doc.text(
        scope === 'ledger' 
          ? 'FOLHA RESUMO - DEMONSTRATIVO DE MOVIMENTAÇÕES DE CAIXA' 
          : 'FOLHA RESUMO - CONSOLIDAÇÃO E FECHAMENTO DE CAIXA', 
        15, 49
      );

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(60, 60, 60);
      doc.text(`Operador de Retirada: Douglas Macedo (Gestor)`, 15, 56);
      doc.text(`Data e Hora de Emissão: ${dateFormatted}`, 15, 61);
      doc.text(`Status do Caixa: ${activeCaixa.aberto ? 'ABERTO (Turno Ativo)' : 'FECHADO (Turno Encerrado)'}`, 15, 66);

      // Draw standard state boxes
      const addBox = (x: number, title: string, value: string, color: [number, number, number]) => {
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(x, 72, 41, 18, 2, 2, 'F');
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(110, 110, 110);
        doc.text(title, x + 3, 77);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(color[0], color[1], color[2]);
        doc.text(value, x + 3, 84);
      };

      addBox(15, 'TROCO DE PARTIDA', formatCurrency(activeCaixa.saldoInicial), [80, 80, 80]);
      addBox(60, 'ENTRADAS / RECEITAS', `+${formatCurrency(entradas)}`, [34, 139, 34]);
      addBox(105, 'SAÍDAS / RETIRADAS', `-${formatCurrency(saidas)}`, [220, 20, 60]);
      addBox(150, 'SALDO DISPONÍVEL', formatCurrency(activeCaixa.saldoAtual), [190, 130, 20]);

      if (scope === 'summary') {
        doc.setDrawColor(220, 220, 220);
        doc.line(15, 96, 195, 96);

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(30, 30, 30);
        doc.text('DEMONSTRATIVO ANALÍTICO DE FECHAMENTO', 15, 102);

        const startTabY = 108;
        const metrics = [
          { item: '01. Fundo Inicial de Reserva (Troco de Partida)', val: formatCurrency(activeCaixa.saldoInicial) },
          { item: '02. Total de Entradas de Capital (Vendas e Aportes)', val: formatCurrency(entradas) },
          { item: '03. Total de Saídas de Capital (Retiradas e Despesas)', val: `-${formatCurrency(saidas)}` },
          { item: '04. Caixa Sobrante Esperado em Caixa', val: formatCurrency(activeCaixa.saldoAtual) },
        ];

        metrics.forEach((m, idx) => {
          const y = startTabY + (idx * 9);
          const fillVal = idx % 2 === 0 ? 250 : 255;
          doc.setFillColor(fillVal, fillVal, fillVal);
          doc.rect(15, y, 180, 8, 'F');
          
          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(50, 50, 50);
          doc.text(m.item, 18, y + 5.5);

          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.setTextColor(30, 30, 30);
          doc.text(m.val, 160, y + 5.5);

          doc.setDrawColor(240, 240, 240);
          doc.line(15, y + 8, 195, y + 8);
        });

        // Signatures block
        const sigStart = 155;
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(40, 40, 40);
        doc.text('DECLARAÇÃO DE CONFERÊNCIA E AUDITORIA', 15, sigStart);

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(85, 85, 85);
        doc.text(
          'Declaramos para fins de registro e auditoria interna que os valores reportados nesta Folha Resumo coincidem',
          15, sigStart + 5
        );
        doc.text(
          'integralmente com a contagem física do numerário e dos comprovantes de cartão/comandas em posse deste caixa.',
          15, sigStart + 9
        );

        doc.setDrawColor(180, 180, 180);
        doc.line(20, sigStart + 32, 90, sigStart + 32);
        doc.line(110, sigStart + 32, 180, sigStart + 32);

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(60, 60, 60);
        doc.text('Assinatura do Operador de Caixa', 25, sigStart + 36);
        doc.text('Assinatura do Supervisor / Gerência', 115, sigStart + 36);
        
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.text('Colaborador: Douglas Macedo', 25, sigStart + 40);
        doc.text('Cargo: Supervisor Financeiro Geral', 115, sigStart + 40);
      } else {
        doc.setDrawColor(220, 220, 220);
        doc.line(15, 96, 195, 96);

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(30, 30, 30);
        doc.text('EXTRATO COMPLETO DE MOVIMENTAÇÕES DE CAIXA', 15, 102);

        const startY = 108;
        const colX = {
          id: 15,
          time: 35,
          flow: 50,
          value: 70,
          desc: 95,
          operator: 160
        };

        doc.setFillColor(235, 235, 235);
        doc.rect(15, startY, 180, 7.5, 'F');
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(50, 50, 50);
        doc.text('CÓD/COMPROV', colX.id + 2, startY + 5);
        doc.text('HORA', colX.time, startY + 5);
        doc.text('FLUXO', colX.flow, startY + 5);
        doc.text('VALOR', colX.value, startY + 5);
        doc.text('DESCRIÇÃO', colX.desc, startY + 5);
        doc.text('OPERADOR', colX.operator, startY + 5);

        let currentY = startY + 7.5;
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(7);

        filteredTransacoes.forEach((t, index) => {
          if (currentY > 265) {
            doc.addPage();
            currentY = 20;
            doc.setFillColor(235, 235, 235);
            doc.rect(15, currentY, 180, 7.5, 'F');
            doc.setFont('Helvetica', 'bold');
            doc.text('CÓD/COMPROV', colX.id + 2, currentY + 5);
            doc.text('HORA', colX.time, currentY + 5);
            doc.text('FLUXO', colX.flow, currentY + 5);
            doc.text('VALOR', colX.value, currentY + 5);
            doc.text('DESCRIÇÃO', colX.desc, currentY + 5);
            doc.text('OPERADOR', colX.operator, currentY + 5);
            currentY += 7.5;
            doc.setFont('Helvetica', 'normal');
          }

          if (index % 2 === 1) {
            doc.setFillColor(248, 248, 248);
            doc.rect(15, currentY, 180, 6, 'F');
          }

          doc.setTextColor(100, 100, 100);
          doc.text(t.id.slice(0, 8).toUpperCase(), colX.id + 2, currentY + 4.5);
          doc.text(formatTime(t.timestamp), colX.time, currentY + 4.5);
          
          if (t.tipo === 'Entrada') {
            doc.setTextColor(34, 139, 34);
            doc.text('ENTRADA', colX.flow, currentY + 4.5);
          } else {
            doc.setTextColor(220, 20, 60);
            doc.text('SAÍDA', colX.flow, currentY + 4.5);
          }

          doc.setTextColor(30, 30, 30);
          const flowSign = t.tipo === 'Entrada' ? '+' : '-';
          doc.text(`${flowSign}${formatCurrency(t.valor)}`, colX.value, currentY + 4.5);

          let desc = t.descricao;
          if (t.metodo) desc += ` (${t.metodo})`;
          if (desc.length > 36) {
            desc = desc.substring(0, 34) + '...';
          }
          doc.setTextColor(60, 60, 60);
          doc.text(desc, colX.desc, currentY + 4.5);

          const opt = t.usuario.split(' ')[0] || 'Gestor';
          doc.text(opt, colX.operator, currentY + 4.5);

          doc.setDrawColor(240, 240, 240);
          doc.line(15, currentY + 6, 195, currentY + 6);
          currentY += 6;
        });
      }

      const finalY = doc.internal.pageSize.getHeight() - 20;
      doc.setDrawColor(210, 210, 210);
      doc.setLineWidth(0.5);
      doc.line(15, finalY, 195, finalY);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(120, 120, 120);
      doc.text('DOCUMENTO DE ASSINATURA E CONTROLE FINANCEIRO • DIGÃO RESTAURANTE S.A.', 15, finalY + 5);
      doc.setFont('Helvetica', 'normal');
      doc.text('Gerado via sistema de gerenciamento de salão. Os dados constantes correspondem ao período selecionado.', 15, finalY + 9);

      doc.save(`folha_resumo_${scope}_${todayStr}.pdf`);
    }
  };

  const filteredTransacoes = activeCaixa.transacoes.filter(t => {
    const matchesSearch = t.descricao.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.usuario.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (tipoFilter === 'TODOS') return matchesSearch;
    return matchesSearch && t.tipo === tipoFilter;
  });

  const handleCreateTransSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transValor <= 0 || !transDesc) return;

    onAddTransacao({
      tipo: transTipo,
      valor: transValor,
      descricao: transDesc,
      usuario: 'Douglas Macedo (Gestor)'
    });

    setTransValor(0);
    setTransDesc('');
    setShowTransForm(false);
  };

  const handleToggleCaixaSubmit = () => {
    onToggleCaixa(!caixa.aberto, tempSaldoIn);
    setShowToggleModal(false);
  };

  return (
    <div className="space-y-6 select-none">
      
      {/* Treasury Header and Shift Handler with integrated Historical Date Selector */}
      <div className="bg-brand-charcoal border border-brand-light-charcoal p-5 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-5 animate-in fade-in duration-305">
        <div className="space-y-1">
          <span className="text-brand-yellow font-mono text-[10px] font-bold tracking-widest uppercase">FINANCEIRO</span>
          <h2 className="text-xl font-sora font-extrabold text-white">Fluxo de Caixa</h2>
          <p className="text-xs text-gray-400">Gerencie as entradas e saídas e acompanhe o fechamento do caixa diário.</p>
        </div>

        {/* Date Selector & Shift Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          
          {/* Historical Date Picker Control */}
          <div className="bg-brand-black/45 border border-brand-light-charcoal rounded-lg p-2.5 flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider font-mono">Competência do Caixa</span>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4 text-brand-yellow" />
                <input
                  id="datepicker-shift-history"
                  type="date"
                  max="2026-05-22"
                  value={selectedDate}
                  onChange={(e) => {
                    if (e.target.value) {
                      setSelectedDate(e.target.value);
                    }
                  }}
                  className="bg-transparent border-none text-xs text-white font-mono font-bold focus:outline-none focus:ring-0 cursor-pointer text-center"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </div>
            
            {/* Quick selector options for historical days */}
            <div className="border-l border-brand-light-charcoal pl-2.5 flex flex-col gap-1 justify-center">
              <button
                id="btn-quick-today"
                type="button"
                onClick={() => setSelectedDate('2026-05-22')}
                className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase transition ${
                  selectedDate === '2026-05-22'
                    ? 'bg-brand-yellow text-brand-black font-extrabold hover:bg-brand-yellow/90'
                    : 'text-gray-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                Hoje
              </button>
              <button
                id="btn-quick-yesterday"
                type="button"
                onClick={() => setSelectedDate('2026-05-21')}
                className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase transition ${
                  selectedDate === '2026-05-21'
                    ? 'bg-brand-yellow/15 text-brand-yellow border border-brand-yellow/20 hover:bg-brand-yellow/25'
                    : 'text-gray-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                Ontem
              </button>
            </div>
          </div>

          {/* Today's shift triggers vs Past day status notices */}
          {isToday ? (
            <div className="flex items-center gap-3">
              {/* Status badge */}
              <div className="bg-brand-black/40 border border-brand-light-charcoal rounded px-3 py-2.5 flex items-center gap-2 h-[46px]">
                <span className={`w-2 h-2 rounded-full ${caixa.aberto ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-[10px] font-mono font-bold text-gray-300">HOJE: {caixa.aberto ? 'ABERTO' : 'FECHADO'}</span>
              </div>

              <button
                id="btn-toggle-shift"
                type="button"
                onClick={() => {
                  if (caixa.aberto) {
                    setPasswordInput('');
                    setCloseError('');
                    setShowCloseModal(true);
                  } else {
                    setShowToggleModal(true);
                  }
                }}
                className={`px-4 py-3 rounded-lg text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition h-[46px] ${
                  caixa.aberto 
                    ? 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white' 
                    : 'bg-brand-yellow text-brand-black hover:bg-brand-yellow-dark'
                }`}
              >
                {caixa.aberto ? 'Fechar Turno' : 'Iniciar Caixa'}
              </button>
            </div>
          ) : (
            <div className="flex items-center bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg px-4 py-3 gap-2.5 text-xs font-bold font-mono h-[46px]">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <span>CAIXA FECHADO (HISTÓRICO)</span>
            </div>
          )}
        </div>
      </div>

      {/* Initialize Shift Modal simulation */}
      {showToggleModal && (
        <div className="bg-brand-charcoal border border-brand-light-charcoal rounded-xl p-5 max-w-md mx-auto space-y-4 animate-in fade-in duration-200">
          <h3 className="font-sora font-extrabold text-sm uppercase text-gray-200">Abertura de Caixa (Troco Inicial)</h3>
          <p className="text-xs text-gray-400">Insira o valor do troco disponível na gaveta física para iniciar os lançamentos de caixa.</p>
          
          <div className="space-y-1">
            <label className="text-[10px] text-gray-400 font-bold uppercase font-mono tracking-wider">Saldo Inicial (R$)</label>
            <input
              id="input-fundo-inicial"
              type="number"
              value={tempSaldoIn || ''}
              onChange={(e) => setTempSaldoIn(Number(e.target.value))}
              placeholder="Ex: 500.00"
              className="w-full bg-brand-black/40 border border-brand-light-charcoal text-white font-mono font-bold p-2.5 rounded-lg text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              id="btn-close-toggle-modal"
              onClick={() => setShowToggleModal(false)}
              className="text-xs text-gray-400 hover:text-white uppercase font-bold px-3 py-1.5"
            >
              Cancelar
            </button>
            <button
              id="btn-confirm-opening"
              onClick={handleToggleCaixaSubmit}
              className="bg-brand-yellow hover:bg-brand-yellow-dark text-brand-black text-xs font-extrabold uppercase px-5 py-2 rounded-lg"
            >
              Confirmar Abertura
            </button>
          </div>
        </div>
      )}

      {/* Close Shift Modal simulation */}
      {showCloseModal && (
        <div className="bg-brand-charcoal border border-brand-light-charcoal rounded-xl p-5 max-w-md mx-auto space-y-4 animate-in fade-in duration-200">
          <h3 className="font-sora font-extrabold text-sm uppercase text-red-400 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            Fechamento de Turno do Caixa
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Deseja realmente encerrar a atividade operacional e fechar o caixa de hoje?
          </p>
          
          <div className="bg-brand-black/35 border border-brand-light-charcoal rounded-xl p-4 space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center text-gray-400">
              <span>Troco Inicial (Partida):</span>
              <span className="font-bold text-gray-300">{formatCurrency(activeCaixa.saldoInicial)}</span>
            </div>
            <div className="flex justify-between items-center text-gray-400">
              <span>Faturamento (Entradas):</span>
              <span className="font-bold text-green-400">+{formatCurrency(entradas)}</span>
            </div>
            <div className="flex justify-between items-center text-gray-400">
              <span>Saídas do Caixa (Retiradas):</span>
              <span className="font-bold text-red-400">-{formatCurrency(saidas)}</span>
            </div>
            <div className="border-t border-brand-light-charcoal/40 pt-2.5 flex justify-between items-center text-gray-300">
              <span className="font-bold uppercase tracking-wider text-[10px]">Saldo Final Estimado:</span>
              <span className="font-black text-brand-yellow text-sm">{formatCurrency(activeCaixa.saldoAtual)}</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-brand-light-charcoal/30">
            <label className="text-[10px] text-gray-400 font-bold uppercase font-mono tracking-wider block">
              Confirmar com a Senha de {currentUser?.nome || 'Operador'}
            </label>
            <input
              id="input-fechar-senha"
              type="password"
              placeholder="Digite sua senha"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setCloseError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (passwordInput === (currentUser?.senha || '123')) {
                    onToggleCaixa(false);
                    setShowCloseModal(false);
                  } else {
                    setCloseError('Senha incorreta. Por favor, tente novamente (senha padrão no sistema é 123).');
                  }
                }
              }}
              className={`w-full bg-brand-black/40 border p-2.5 rounded-lg text-sm transition-colors text-white font-mono focus:outline-none ${
                closeError ? 'border-red-500 focus:border-red-500' : 'border-brand-light-charcoal focus:border-red-500'
              }`}
            />
            {closeError && (
              <p className="text-[10px] text-red-400 font-bold italic mt-1 font-sans">
                {closeError}
              </p>
            )}
          </div>

          <p className="text-[10px] text-gray-500 leading-normal">
            * Ao finalizar o turno, o status do caixa passará para "Fechado" e novos lançamentos não poderão ser feitos hoje. O resumo será salvo no histórico de caixa.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <button
              id="btn-close-close-modal"
              type="button"
              onClick={() => setShowCloseModal(false)}
              className="text-xs text-gray-400 hover:text-white uppercase font-bold px-3 py-1.5 transition"
            >
              Cancelar
            </button>
            <button
              id="btn-confirm-closing"
              type="button"
              onClick={() => {
                if (passwordInput === (currentUser?.senha || '123')) {
                  onToggleCaixa(false);
                  setShowCloseModal(false);
                } else {
                  setCloseError('Senha incorreta. Por favor, tente novamente (senha padrão no sistema é 123).');
                }
              }}
              className="bg-red-500 hover:bg-red-650 text-white text-xs font-extrabold uppercase px-5 py-2.5 rounded-lg transition"
            >
              Confirmar Fechamento
            </button>
          </div>
        </div>
      )}

      {/* KPI stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Fundo Inicial */}
        <div className="bg-brand-charcoal border border-brand-light-charcoal p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Troco de Partida</span>
            <div className="text-xl font-mono font-bold text-gray-300">
              {formatCurrency(activeCaixa.saldoInicial)}
            </div>
          </div>
          <div className="bg-brand-light-charcoal p-3 rounded-lg text-gray-400">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 2: Entradas brutas */}
        <div className="bg-brand-charcoal border border-brand-light-charcoal p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Entradas / Receitas</span>
            <div className="text-xl font-mono font-bold text-green-400">
              +{formatCurrency(entradas)}
            </div>
          </div>
          <div className="bg-emerald-500/10 p-3 rounded-lg text-emerald-400">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 3: Saídas brutas */}
        <div className="bg-brand-charcoal border border-brand-light-charcoal p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Saídas / Retiradas</span>
            <div className="text-xl font-mono font-bold text-red-400">
              -{formatCurrency(saidas)}
            </div>
          </div>
          <div className="bg-red-500/10 p-3 rounded-lg text-red-500">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 4: Saldo Gaveta */}
        <div className="bg-brand-charcoal border border-brand-light-charcoal p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Saldo Atual em Caixa</span>
            <div className="text-xl font-mono font-bold text-brand-yellow">
              {formatCurrency(activeCaixa.saldoAtual)}
            </div>
          </div>
          <div className="bg-brand-yellow/10 p-3 rounded-lg text-brand-yellow">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Grid of Manual transaction or ledger list */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Ledger table list: 8 cols */}
        <div className="xl:col-span-8 bg-brand-charcoal border border-brand-light-charcoal rounded-xl overflow-hidden flex flex-col">
          
          {/* Header searches and CSV Report Exports */}
          <div className="p-5 bg-brand-light-charcoal/20 border-b border-brand-light-charcoal flex flex-col gap-4">
            
            {/* Row 1: Search and Filter (Spacious and high contrast) */}
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Search bar */}
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-550">
                  <Search className="w-4 h-4 text-brand-yellow" />
                </span>
                <input
                  id="input-ledger-search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por descrição, operador de caixa, valor..."
                  className="w-full bg-brand-black/45 border border-brand-light-charcoal text-xs text-white pl-9 pr-3 py-2.5 rounded-lg focus:border-brand-yellow focus:outline-none transition-colors"
                />
              </div>

              {/* Transaction Type Selector (Now with comfortable custom width, preventing squeezing) */}
              <div className="flex items-center gap-3 shrink-0 w-full md:w-80">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider font-mono whitespace-nowrap">Filtrar:</span>
                <select
                  id="select-ledger-type-filter"
                  value={tipoFilter}
                  onChange={(e) => setTipoFilter(e.target.value)}
                  className="w-full bg-brand-black/45 border border-brand-light-charcoal text-xs text-white px-3 py-2.5 rounded-lg focus:border-brand-yellow focus:outline-none cursor-pointer font-medium"
                >
                  <option value="TODOS">Todas as Transações</option>
                  <option value="Entrada">Entradas (Faturamento/Troco)</option>
                  <option value="Saída">Saídas (Despesas/Retiradas)</option>
                </select>
              </div>
            </div>

            {/* Row 2: Export Blocks (Stacked elegantly to provide maximum hit target area and clear visual borders) */}
            <div className="border-t border-brand-light-charcoal/50 pt-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-col space-y-0.5">
                <span className="text-[10px] font-mono font-bold text-brand-yellow uppercase tracking-wider">Módulos de Exportação</span>
                <span className="text-[11px] text-gray-400">Emita demonstrativos consolidados do fechamento de caixa para o período.</span>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 self-stretch sm:self-auto shrink-0">
                {/* Resumo Caixa export block */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-mono font-black text-gray-400 uppercase tracking-widest block text-left sm:text-right">Resumos de Fechamento:</span>
                  <div className="flex items-center gap-1.5 matches-yellow-styles font-mono">
                    <button
                      id="btn-export-summary-pdf"
                      onClick={() => handleExport('pdf', 'summary')}
                      className="bg-brand-light-charcoal/65 hover:bg-brand-light-charcoal text-white hover:text-brand-yellow font-black uppercase text-[10px] tracking-wider px-3.5 py-2 rounded-lg border border-brand-light-charcoal flex items-center gap-1.5 transition cursor-pointer hover:shadow-sm"
                      title="Exportar Folha Resumo Fechamento em PDF (Folha Resumo)"
                    >
                      <FileText className="w-3.5 h-3.5 text-red-400" />
                      <span>PDF</span>
                    </button>
                    <button
                      id="btn-export-summary-excel"
                      onClick={() => handleExport('excel', 'summary')}
                      className="bg-brand-light-charcoal/65 hover:bg-brand-light-charcoal text-white hover:text-brand-yellow font-black uppercase text-[10px] tracking-wider px-3.5 py-2 rounded-lg border border-brand-light-charcoal flex items-center gap-1.5 transition cursor-pointer hover:shadow-sm"
                      title="Exportar Resumo Fechamento em Excel (XLSX)"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-green-400" />
                      <span>XLSX</span>
                    </button>
                    <button
                      id="btn-export-summary-csv"
                      onClick={() => handleExport('csv', 'summary')}
                      className="bg-brand-light-charcoal/65 hover:bg-brand-light-charcoal text-white hover:text-brand-yellow font-black uppercase text-[10px] tracking-wider px-3.5 py-2 rounded-lg border border-brand-light-charcoal flex items-center gap-1.5 transition cursor-pointer hover:shadow-sm"
                      title="Exportar Resumo Fechamento em CSV"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-400" />
                      <span>CSV</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredTransacoes.length === 0 ? (
              <div className="p-16 text-center text-gray-500 text-sm">
                Nenhuma movimentação registrada no caixa de hoje.
              </div>
            ) : (
              <table className="min-w-[700px] w-full text-left font-sans text-xs">
                <thead>
                  <tr className="bg-brand-light-charcoal/30 border-b border-brand-light-charcoal text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <th className="p-4">Cód/Comprov</th>
                    <th className="p-4">Hora</th>
                    <th className="p-4">Fluxo</th>
                    <th className="p-4">Valor</th>
                    <th className="p-4">Descrição de Lançamento</th>
                    <th className="p-4 mr-4 text-right">Operador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-light-charcoal/50">
                  {filteredTransacoes.map(t => {
                    const isInput = t.tipo === 'Entrada';
                    return (
                      <tr key={t.id} className="hover:bg-brand-light-charcoal/30 transition">
                        <td className="p-4 font-mono font-bold text-gray-400">
                          {t.id.toUpperCase()}
                        </td>
                        <td className="p-4 font-mono text-gray-400">
                           {formatTime(t.timestamp)}
                        </td>
                        <td className="p-4">
                          <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                            isInput 
                              ? 'text-green-400 bg-green-500/10 border-green-500/20' 
                              : 'text-red-400 bg-red-400/10 border-red-400/20'
                          }`}>
                            {t.tipo.toUpperCase()}
                          </span>
                        </td>
                        <td className={`p-4 font-mono font-extrabold text-sm ${isInput ? 'text-green-400' : 'text-red-400'}`}>
                          {isInput ? '+' : '-'}{formatCurrency(t.valor)}
                        </td>
                        <td className="p-4 text-gray-200 font-semibold">
                          {t.descricao}
                          {t.metodo && (
                            <span className="text-[10px] text-gray-500 font-mono ml-2 uppercase">
                              ({t.metodo})
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-gray-400 max-w-[120px] truncate text-right">
                          {t.usuario}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Manual adjustment drawer: 4 cols */}
        <div className="xl:col-span-4 bg-brand-charcoal border border-brand-light-charcoal rounded-xl p-5 space-y-4">
          <div className="border-b border-brand-light-charcoal pb-3">
            <h3 className="font-sora font-extrabold text-sm uppercase tracking-wider text-white">
              Nova Movimentação Manual
            </h3>
            <p className="text-xs text-gray-400 mt-1">Lançar entradas (Troco/Aportes) ou saídas rápidas (Retiradas/Pagamentos) de forma imediata.</p>
          </div>

          {!isToday ? (
            <div className="py-12 px-4 text-center text-amber-500/90 text-xs border border-amber-500/20 bg-amber-500/5 rounded-lg space-y-1 font-mono font-bold animate-in fade-in">
              <div>🚫 MOVIMENTAÇÃO RETROATIVA BLOQUEADA</div>
              <div className="text-[10px] text-gray-400 font-sans font-normal mt-1">
                Lançamentos em dias anteriores são bloqueados para segurança das contas. Você pode lançar as movimentações ativas no dia de hoje.
              </div>
            </div>
          ) : !caixa.aberto ? (
            <div className="py-12 text-center text-gray-500 text-xs">
              Abra o caixa de hoje (no topo) para liberar lançamentos manuais de entrada ou saída.
            </div>
          ) : (
            <form onSubmit={handleCreateTransSubmit} className="space-y-4">
              
              {/* Type Switcher */}
              <div className="space-y-1.5">
                <label className="block text-[10px] text-gray-400 font-bold uppercase font-mono tracking-wider">Tipo da Transação</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="btn-cash-in"
                    type="button"
                    onClick={() => setTransTipo('Entrada')}
                    className={`py-2 rounded text-xs font-bold uppercase tracking-wider transition ${
                      transTipo === 'Entrada'
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                        : 'bg-brand-light-charcoal/50 border border-brand-light-charcoal text-gray-400 hover:text-white'
                    }`}
                  >
                    Entrada (Aporte)
                  </button>

                  <button
                    id="btn-cash-out"
                    type="button"
                    onClick={() => setTransTipo('Saída')}
                    className={`py-2 rounded text-xs font-bold uppercase tracking-wider transition ${
                      transTipo === 'Saída'
                        ? 'bg-red-500/10 border border-red-500/30 text-red-500'
                        : 'bg-brand-light-charcoal/50 border border-brand-light-charcoal text-gray-400 hover:text-white'
                    }`}
                  >
                    Saída (Retirada)
                  </button>
                </div>
              </div>

              {/* Value Input */}
              <div className="space-y-1">
                <label className="block text-[10px] text-gray-400 font-bold uppercase font-mono tracking-wider">Valor Líquido (R$)</label>
                <input
                  id="input-trans-val"
                  type="number"
                  step="any"
                  required
                  value={transValor || ''}
                  onChange={(e) => setTransValor(Number(e.target.value))}
                  placeholder="Ex: 50.00"
                  className="w-full bg-brand-black/40 border border-brand-light-charcoal text-white font-mono font-bold p-2.5 rounded-lg"
                />
              </div>

              {/* Description Input */}
              <div className="space-y-1">
                <label className="block text-[10px] text-gray-400 font-bold uppercase font-mono tracking-wider">Descrição / Destinação dos Fundos</label>
                <textarea
                  id="textarea-trans-desc"
                  required
                  rows={3}
                  value={transDesc}
                  onChange={(e) => setTransDesc(e.target.value)}
                  placeholder="Ex: Compra de saco de gelo emergencial ou retirada para pagamento de taxa"
                  className="w-full bg-brand-black/40 border border-brand-light-charcoal text-xs text-white p-2.5 rounded-lg focus:border-brand-yellow"
                />
              </div>

              <button
                id="btn-submit-ledger-manual"
                type="submit"
                className="w-full bg-brand-yellow hover:bg-brand-yellow-dark text-brand-black font-extrabold text-xs uppercase tracking-wider py-2.5 rounded-lg transition"
              >
                Registrar Movimentação
              </button>
            </form>
          )}

        </div>

      </div>

    </div>
  );
}
