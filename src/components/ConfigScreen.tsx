import React, { useState } from 'react';
import { ToggleLeft, ToggleRight, Check, Settings, Printer, Percent, HelpCircle, Trash2, Plus, Play, RefreshCw, Cpu, Wifi, X } from 'lucide-react';

interface ConfigScreenProps {
  onAddConfigLog: (details: string) => void;
}

interface CustomPrinter {
  id: string;
  setor: string;
  ip: string;
  modelo: string;
  status: 'Pronto' | 'Offline' | 'Testando';
}

export default function ConfigScreen({ onAddConfigLog }: ConfigScreenProps) {
  // Config states
  const [nomeFantasia, setNomeFantasia] = useState<string>('Digão Restaurante');
  const [razaoSocial, setRazaoSocial] = useState<string>('Digão Alimentos Ltda');
  const [cnpj, setCnpj] = useState<string>('12.345.678/0001-90');
  
  const [taxaServicoPerc, setTaxaServicoPerc] = useState<number>(10);
  const [nfcAtiva, setNfcAtiva] = useState<boolean>(true);
  
  const [printerKdsIp, setPrinterKdsIp] = useState<string>('192.168.1.180');
  const [printerCaixaIp, setPrinterCaixaIp] = useState<string>('192.168.1.191');
  const [backupNuvem, setBackupNuvem] = useState<boolean>(true);

  // Additional Printers state list
  const [customPrinters, setCustomPrinters] = useState<CustomPrinter[]>([
    { id: 'p1', setor: 'Copa / Drinks & Bar', ip: '192.168.1.185', modelo: 'Epson TM-T20X', status: 'Pronto' },
    { id: 'p2', setor: 'Expedição / Delivery', ip: '192.168.1.186', modelo: 'Bematech MP-4200 TH', status: 'Pronto' }
  ]);

  // Form states for new printers
  const [newSetor, setNewSetor] = useState<string>('');
  const [newIp, setNewIp] = useState<string>('');
  const [newModelo, setNewModelo] = useState<string>('Epson TM-T20X');

  // Spooler testing simulator states
  const [testingPrinterId, setTestingPrinterId] = useState<string | null>(null);
  const [testReceipt, setTestReceipt] = useState<{ sector: string; ip: string; content: string } | null>(null);

  const [savingMessage, setSavingMessage] = useState<boolean>(false);

  const handleSaveConfigs = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMessage(true);
    
    onAddConfigLog(`Alterações de configurações e periféricos operacionais salvas. Impressoras ativas: ${customPrinters.length + 2}`);

    setTimeout(() => {
      setSavingMessage(false);
      alert('Configurações do sistema e rede de impressoras armazenadas com sucesso no SATE!');
    }, 800);
  };

  // Add client printer
  const handleAddPrinter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSetor.trim() || !newIp.trim()) return;

    const newPrinter: CustomPrinter = {
      id: `custom_${Date.now()}`,
      setor: newSetor.trim(),
      ip: newIp.trim(),
      modelo: newModelo,
      status: 'Pronto'
    };

    setCustomPrinters(prev => [...prev, newPrinter]);
    onAddConfigLog(`Criada associação de Hardware de impressão: [${newPrinter.setor}] no IP ${newPrinter.ip}`);

    // clear states
    setNewSetor('');
    setNewIp('');
  };

  // Delete printer
  const handleDeletePrinter = (id: string) => {
    const target = customPrinters.find(p => p.id === id);
    if (target) {
      onAddConfigLog(`Desvinculada impressora setorial: [${target.setor}]`);
      setCustomPrinters(prev => prev.filter(p => p.id !== id));
    }
  };

  // Fire simulation test print slip
  const handleTestPrinter = (p: CustomPrinter) => {
    setTestingPrinterId(p.id);
    onAddConfigLog(`Requisitada contingência de teste para impressora [${p.setor}] no spooler local.`);

    setTimeout(() => {
      setTestingPrinterId(null);
      setTestReceipt({
        sector: p.setor,
        ip: p.ip,
        content: `
=================================
        DIGÃO RESTAURANTE
      SIMULADOR COUPLING SATE
=================================
TIPO PERIFÉRICO: TERMICO 80MM
CANAL / SETOR: ${p.setor.toUpperCase()}
MÍDIA IP ADDR: ${p.ip}
DRIVER DRV: ${p.modelo}
DIAGNÓSTICO: PORTA 9100 - ONLINE (4ms)
COMPROVANTE IMPRESSO COM SUCESSO.

SESSÃO DE TRABALHO ATIVADA
---------------------------------
DOUGLAS MACEDO - OPERAÇÃO SATELLITI
GERADOR DE TICKETS DE PREPARO
REGISTRO IMUTÁVEL DE LOGS: OK
=================================
`
      });
    }, 1200);
  };

  return (
    <div className="space-y-6 select-none max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="bg-brand-charcoal border border-brand-light-charcoal p-5 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-brand-yellow text-brand-black p-2 rounded-lg">
            <Settings className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <div>
            <h1 className="text-lg font-sora font-extrabold text-white">
              Painel Geral de Configurações do Sistema
            </h1>
            <p className="text-xs text-gray-400">
              Gerencie identificadores fiscais brasileiros, periféricos de rede e regras tributárias.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveConfigs} className="space-y-6">
        
        {/* Core Profile */}
        <div className="bg-brand-charcoal border border-brand-light-charcoal rounded-xl p-5 space-y-4">
          <h3 className="font-sora font-extrabold text-sm uppercase text-white tracking-wider border-b border-brand-light-charcoal pb-2">
            1. Perfil Jurídico do Estabelecimento
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-gray-400 font-bold uppercase block">Nome Fantasia</label>
              <input
                id="cfg-nome-fantasia"
                type="text"
                value={nomeFantasia}
                onChange={(e) => setNomeFantasia(e.target.value)}
                className="w-full bg-brand-black/40 border border-brand-light-charcoal text-white rounded-lg p-2.5 font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-400 font-bold uppercase block">Razão Social</label>
              <input
                id="cfg-razao-social"
                type="text"
                value={razaoSocial}
                onChange={(e) => setRazaoSocial(e.target.value)}
                className="w-full bg-brand-black/40 border border-brand-light-charcoal text-white rounded-lg p-2.5 font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-400 font-bold uppercase block">CNPJ Cadastrado</label>
              <input
                id="cfg-cnpj"
                type="text"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                className="w-full bg-brand-black/40 border border-brand-light-charcoal text-white rounded-lg p-2.5 font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* Taxation rules */}
        <div className="bg-brand-charcoal border border-brand-light-charcoal rounded-xl p-5 space-y-4 col-span-1">
          <h3 className="font-sora font-extrabold text-sm uppercase text-white tracking-wider border-b border-brand-light-charcoal pb-2">
            2. Tributação & Taxas de Atendimento
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-2">
              <label className="text-gray-400 font-bold uppercase block">Percentual Gratuidade Garçom (%)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <Percent className="w-4 h-4" />
                </span>
                <input
                  id="cfg-service-pct"
                  type="number"
                  value={taxaServicoPerc}
                  onChange={(e) => setTaxaServicoPerc(Number(e.target.value))}
                  className="w-full bg-brand-black/40 border border-brand-light-charcoal text-white pl-9 pr-3 py-2.5 rounded-lg font-mono font-bold"
                />
              </div>
              <p className="text-[10px] text-gray-500">Sugere acréscimo de 10% padrão na visualização final de comandas do salão.</p>
            </div>

            {/* SAT active toggle */}
            <div className="bg-brand-black/25 border border-brand-light-charcoal/50 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="font-bold text-gray-200">Emissão SAT Automática</span>
                <p className="text-[10px] text-gray-500 font-sans mt-0.5">Transmite os comprovantes fiscais imediatamente para a SEFAZ/SP.</p>
              </div>
              <button
                id="btn-toggle-sate"
                type="button"
                onClick={() => setNfcAtiva(!nfcAtiva)}
                className="p-1 hover:scale-105 transition"
              >
                {nfcAtiva ? (
                  <ToggleRight className="w-10 h-10 text-brand-yellow" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Network & Peripheral Print targets */}
        <div className="bg-brand-charcoal border border-brand-light-charcoal rounded-xl p-5 space-y-4">
          <h3 className="font-sora font-extrabold text-sm uppercase text-white tracking-wider border-b border-brand-light-charcoal pb-2">
            3. Comunicação de Impressoras Térmicas Principais (Rede Local)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <label className="text-gray-400 font-bold uppercase block">Impressora Cozinha (KDS Prep)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <Printer className="w-4 h-4" />
                </span>
                <input
                  id="cfg-printer-kds"
                  type="text"
                  value={printerKdsIp}
                  onChange={(e) => setPrinterKdsIp(e.target.value)}
                  className="w-full bg-brand-black/40 border border-brand-light-charcoal text-white pl-9 pr-3 py-2.5 rounded-lg font-mono font-bold"
                />
              </div>
              <p className="text-[10px] text-gray-500">Endereço IP da impressora térmica de bobina 80mm no fogão.</p>
            </div>

            <div className="space-y-2">
              <label className="text-gray-400 font-bold uppercase block">Impressora Frente Caixa (Comandas)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <Printer className="w-4 h-4" />
                </span>
                <input
                  id="cfg-printer-cashier"
                  type="text"
                  value={printerCaixaIp}
                  onChange={(e) => setPrinterCaixaIp(e.target.value)}
                  className="w-full bg-brand-black/40 border border-brand-light-charcoal text-white pl-9 pr-3 py-2.5 rounded-lg font-mono font-bold"
                />
              </div>
              <p className="text-[10px] text-gray-500">Bobina térmica de expedição de cupons fiscais e fechamento do salão.</p>
            </div>
          </div>
        </div>

        {/* 4. Additional Setorial Printers */}
        <div className="bg-brand-charcoal border border-brand-light-charcoal rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-brand-light-charcoal pb-2">
            <h3 className="font-sora font-extrabold text-sm uppercase text-white tracking-wider flex items-center gap-1.5">
              <Printer className="w-4 h-4 text-brand-yellow" /> 4. Impressoras Térmicas por Setor (Drinks, Delivery, etc.)
            </h3>
            <span className="text-[10px] text-brand-yellow font-mono font-black uppercase tracking-widest bg-brand-yellow/10 px-2 py-0.5 rounded">Setoriais LAN</span>
          </div>

          <p className="text-xs text-gray-400 mt-1">
            Defina canais adicionais de escoamento de pedidos para otimizar a retaguarda do restaurante ou a preparação rápida.
          </p>

          {/* Form to bind new custom printer */}
          <div className="bg-brand-black/20 p-4 rounded-xl border border-brand-light-charcoal/50 text-xs space-y-4">
            <h4 className="font-bold text-gray-200 uppercase tracking-widest text-[9px] flex items-center gap-1.5 border-b border-brand-light-charcoal pb-2">
              <Plus className="w-3.5 h-3.5 text-brand-yellow" /> Vincular Ponto de Impressão Setorial
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase block font-mono">Área / Setor Vinculado</label>
                <input
                  id="add-print-setor"
                  type="text"
                  placeholder="Ex: Bar / Copa, Delivery, Balcão 2"
                  value={newSetor}
                  onChange={(e) => setNewSetor(e.target.value)}
                  className="w-full bg-brand-black/40 border border-brand-light-charcoal text-white rounded-lg p-2.5 font-bold text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase block font-mono">Endereço IP Local</label>
                <input
                  id="add-print-ip"
                  type="text"
                  placeholder="Ex: 192.168.1.185"
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  className="w-full bg-brand-black/40 border border-brand-light-charcoal text-white rounded-lg p-2.5 font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase block font-mono">Driver de Bobina</label>
                <select
                  id="add-print-modelo"
                  value={newModelo}
                  onChange={(e) => setNewModelo(e.target.value)}
                  className="w-full bg-brand-black/40 border border-brand-light-charcoal text-white rounded-lg p-2 text-xs"
                >
                  <option value="Epson TM-T20X">Epson TM-T20X (ESC/POS)</option>
                  <option value="Bematech MP-4200 TH">Bematech MP-4200 TH</option>
                  <option value="Elgin I9">Elgin I9 (80mm)</option>
                  <option value="Control iD Print">Control iD Print</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                id="btn-add-custom-printer"
                type="button"
                onClick={handleAddPrinter}
                disabled={!newSetor.trim() || !newIp.trim()}
                className="bg-brand-yellow hover:bg-brand-yellow-dark disabled:bg-zinc-300 text-brand-black text-[10px] uppercase font-bold tracking-wider px-4 py-2 rounded-lg flex items-center gap-1.5 transition disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Periférico
              </button>
            </div>
          </div>

          {/* List of custom active printers */}
          <div className="space-y-2.5 pt-2">
            <h4 className="font-mono text-[9px] font-black uppercase text-gray-400 tracking-wider pl-1">
              Fila de Periféricos Cadastrados
            </h4>

            {customPrinters.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border border-dashed border-brand-light-charcoal rounded-xl text-xs">
                Nenhum ponto adicional de escoamento ativo.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customPrinters.map(p => {
                  const isTesting = testingPrinterId === p.id;
                  return (
                    <div key={p.id} className="bg-brand-black/10 border border-brand-light-charcoal rounded-xl p-3.5 flex items-center justify-between text-xs transition hover:border-[#b1b1b1]">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-gray-200 font-sora">{p.setor}</span>
                          <span className="text-[9px] font-mono text-gray-450 bg-brand-light-charcoal px-1.5 py-0.5 rounded uppercase">
                            {p.modelo}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-gray-400 flex items-center gap-1">
                          <Wifi className="w-3 h-3 text-emerald-500" /> Host IP: <strong className="text-gray-300">{p.ip}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          id={`btn-test-printer-${p.id}`}
                          type="button"
                          disabled={testingPrinterId !== null}
                          onClick={() => handleTestPrinter(p)}
                          className="bg-brand-yellow hover:bg-brand-yellow-dark text-brand-black disabled:bg-zinc-300 text-[10px] uppercase font-extrabold px-3 py-1.5 rounded-lg tracking-wider flex items-center gap-1.5 transition"
                          title="Transmitir cupom simulado"
                        >
                          {isTesting ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" /> Conectando
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 text-brand-black" /> Testar
                            </>
                          )}
                        </button>

                        <button
                          id={`btn-delete-printer-${p.id}`}
                          type="button"
                          onClick={() => handleDeletePrinter(p.id)}
                          className="p-1.5 border border-red-500/15 hover:border-red-500 text-red-500 rounded bg-red-500/5 hover:bg-red-500/15 transition"
                          title="Remover Impressora"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 flex justify-end gap-3.5 border-t border-brand-light-charcoal/40">
          <button
            id="btn-save-configurations"
            type="submit"
            disabled={savingMessage}
            className="bg-brand-yellow hover:bg-brand-yellow-dark disabled:bg-brand-light-charcoal text-brand-black px-8 py-3 rounded-lg font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 transition"
          >
            {savingMessage ? 'Salvando Parâmetros...' : <><Check className="w-4 h-4" /> Salvar Configurações</>}
          </button>
        </div>

      </form>

      {/* Spooler Paper Receipt Drawer Simulador Modal */}
      {testReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-brand-charcoal border border-brand-light-charcoal rounded-2xl max-w-sm w-full overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-150">
            
            {/* Simulation Header */}
            <div className="p-3 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-900">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 text-zinc-350">
                <Cpu className="text-brand-yellow w-4 h-4" /> spooler_test_outbox.sys
              </span>
              <button
                id="btn-close-spooler-x"
                onClick={() => setTestReceipt(null)}
                className="text-zinc-550 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Receipt Spool tape surface */}
            <div className="p-6 bg-zinc-100 flex justify-center border-b border-brand-light-charcoal">
              <div 
                className="bg-white text-zinc-900 p-5 shadow-2xl border-t-4 border-amber-500 w-full relative"
                style={{
                  fontFamily: '"Fira Code", "Fira Mono", "JetBrains Mono", Courier, monospace',
                  fontSize: '11px',
                  lineHeight: '1.3'
                }}
              >
                {/* Decorative Jagged TOP edge */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1.5 bg-zinc-150" 
                  style={{
                    clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)'
                  }} 
                />

                <pre className="whitespace-pre-wrap select-text selection:bg-amber-100 uppercase tracking-tight font-mono text-[10px]">
                  {testReceipt.content.trim()}
                </pre>

                {/* Decorative Jagged BOTTOM edge */}
                <div 
                  className="absolute bottom-[-4px] left-0 right-0 h-1.5 bg-zinc-100" 
                  style={{
                    backgroundColor: '#eaeae8',
                    clipPath: 'polygon(0% 100%, 5% 0%, 10% 100%, 15% 0%, 20% 100%, 25% 0%, 30% 100%, 35% 0%, 40% 100%, 45% 0%, 50% 100%, 55% 0%, 60% 100%, 65% 0%, 70% 100%, 75% 0%, 80% 100%, 85% 0%, 90% 100%, 95% 0%, 100% 100%)'
                  }} 
                />
              </div>
            </div>

            {/* Modal Bottom control */}
            <div className="p-3.5 bg-brand-charcoal border-t border-brand-light-charcoal flex justify-between items-center">
              <span className="text-[9px] font-mono text-gray-500 uppercase font-black">Status: CONECTADO</span>
              <button
                id="btn-spooler-dismiss-bottom"
                onClick={() => setTestReceipt(null)}
                className="bg-brand-yellow hover:bg-brand-yellow-dark text-brand-black px-4 py-2 rounded-lg font-bold text-xs uppercase"
              >
                Concluir Teste
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
