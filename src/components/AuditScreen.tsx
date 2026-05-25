import React, { useState } from 'react';
import { AuditLog } from '../types';
import { ShieldCheck, Search, Filter, Trash, Archive, Shield, Download, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

interface AuditScreenProps {
  logs: AuditLog[];
}

export default function AuditScreen({ logs }: AuditScreenProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [catFilter, setCatFilter] = useState<string>('TODOS');

  const filtered = logs.filter(log => {
    const matchesSearch = 
      log.usuario.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.acao.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.detalhes.toLowerCase().includes(searchTerm.toLowerCase());

    if (catFilter === 'TODOS') return matchesSearch;
    return matchesSearch && log.categoria === catFilter;
  });

  const getCategoryClass = (cat: string) => {
    return {
      Segurança: 'text-red-400 bg-red-400/10 border-red-500/20',
      Finanças: 'text-green-400 bg-green-400/10 border-green-500/20',
      Pedidos: 'text-blue-400 bg-blue-400/10 border-blue-500/20',
      Estoque: 'text-orange-400 bg-orange-400/10 border-orange-500/20',
      Mesas: 'text-purple-400 bg-purple-400/10 border-purple-500/20'
    }[cat] || 'text-gray-400 bg-gray-500/10';
  };

  const getIsoTimeString = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString('pt-BR');
    } catch {
      return iso;
    }
  };

  const handleExportExcel = () => {
    try {
      const dataToExport = filtered.map(log => ({
        'Data e Hora': getIsoTimeString(log.timestamp),
        'Usuário': log.usuario,
        'Categoria': log.categoria,
        'Ação': log.acao,
        'Detalhes': log.detalhes
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Logs de Auditoria');

      worksheet['!cols'] = [
        { wch: 20 }, // Data e Hora
        { wch: 15 }, // Usuário
        { wch: 15 }, // Categoria
        { wch: 30 }, // Ação
        { wch: 60 }  // Detalhes
      ];

      XLSX.writeFile(workbook, `auditoria_logs_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
    }
  };

  const handleExportCSV = () => {
    try {
      const dataToExport = filtered.map(log => ({
        'Data e Hora': getIsoTimeString(log.timestamp),
        'Usuário': log.usuario,
        'Categoria': log.categoria,
        'Ação': log.acao,
        'Detalhes': log.detalhes
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const csvContent = XLSX.utils.sheet_to_csv(worksheet);
      
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `auditoria_logs_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
    }
  };

  return (
    <div className="space-y-6 select-none">
      
      {/* Audit Header Banner */}
      <div className="bg-brand-charcoal border border-brand-light-charcoal p-5 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-brand-yellow text-brand-black p-2 rounded-lg">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-sora font-extrabold text-white">
              Log de Auditoria & Segurança Operacional
            </h1>
            <p className="text-xs text-gray-400">
              Histórico rastreável e imutável de todas as ações de caixa, estoque e salão.
            </p>
          </div>
        </div>

        <div className="bg-brand-black/50 border border-brand-light-charcoal rounded px-3 py-1 text-center font-mono text-xs">
          <span className="block text-[8px] text-gray-500 uppercase font-black">LOGS TOTAIS</span>
          <strong className="text-brand-yellow font-bold text-sm">{logs.length}</strong>
        </div>
      </div>

      {/* Grid filter system */}
      <div className="bg-brand-charcoal border border-brand-light-charcoal rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 bg-brand-light-charcoal/20 border-b border-brand-light-charcoal flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                id="input-audit-search-filter"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar por colaborador, ação ou detalhe..."
                className="w-full bg-brand-black/40 border border-brand-light-charcoal text-xs text-white pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:border-brand-yellow"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider whitespace-nowrap">Grupo fiscal:</span>
              <select
                id="select-audit-category-filter"
                value={catFilter}
                onChange={(e) => setCatFilter(e.target.value)}
                className="w-full bg-brand-black/40 border border-brand-light-charcoal text-xs text-white p-2 rounded focus:outline-none focus:border-brand-yellow"
              >
                <option value="TODOS">Todas as Categorias</option>
                <option value="Segurança">Segurança & Logon</option>
                <option value="Finanças">Finanças & Movimentações</option>
                <option value="Pedidos">Pedidos & Vendas</option>
                <option value="Estoque">Estoque & Descartes</option>
                <option value="Mesas">Mesas & Salões</option>
              </select>
            </div>
          </div>

          <div className="flex sm:flex-row flex-col items-stretch gap-2 shrink-0">
            <button
              id="btn-export-csv"
              type="button"
              onClick={handleExportCSV}
              disabled={filtered.length === 0}
              className="flex items-center justify-center gap-2 text-xs font-bold text-gray-300 hover:text-white bg-brand-light-charcoal hover:bg-brand-light-charcoal/80 disabled:opacity-50 disabled:cursor-not-allowed border border-brand-light-charcoal/60 px-4 py-2 rounded-lg transition"
              title="Exportar logs filtrados para CSV"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Exportar CSV</span>
            </button>
            <button
              id="btn-export-excel"
              type="button"
              onClick={handleExportExcel}
              disabled={filtered.length === 0}
              className="flex items-center justify-center gap-2 text-xs font-bold text-brand-black bg-brand-yellow hover:bg-brand-yellow-dark disabled:opacity-50 disabled:bg-brand-light-charcoal disabled:text-gray-500 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition"
              title="Exportar logs filtrados para Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar Excel</span>
            </button>
          </div>
        </div>

        {/* Ledger view */}
        <div className="overflow-x-auto text-xs text-gray-200">
          {filtered.length === 0 ? (
            <div className="p-16 text-center text-gray-500">
              Nenhum registro de auditoria condiz com os termos consultados.
            </div>
          ) : (
            <table className="min-w-[800px] w-full text-left font-sans">
              <thead>
                <tr className="bg-brand-light-charcoal/30 border-b border-brand-light-charcoal text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <th className="p-4">Carimbo de Data/Hora</th>
                  <th className="p-4">Usuário</th>
                  <th className="p-4">Grupo</th>
                  <th className="p-4">Ação</th>
                  <th className="p-4 mr-4 text-right">Detalhamento Técnico Extenso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-light-charcoal/50 font-mono">
                {filtered.map(log => (
                  <tr key={log.id} className="hover:bg-brand-light-charcoal/30 transition">
                    <td className="p-4 text-gray-400 text-[11px] whitespace-nowrap">
                      {getIsoTimeString(log.timestamp)}
                    </td>
                    <td className="p-4 font-sans font-bold text-gray-300 whitespace-nowrap">
                      {log.usuario}
                    </td>
                    <td className="p-4">
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${getCategoryClass(log.categoria)}`}>
                        {log.categoria}
                      </span>
                    </td>
                    <td className="p-4 font-sans font-bold text-white whitespace-nowrap">
                      {log.acao}
                    </td>
                    <td className="p-4 text-gray-400 font-sans text-right">
                      {log.detalhes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
