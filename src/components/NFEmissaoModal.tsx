import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import { Printer, ArrowRight, Lock, FileText, CheckCircle, RefreshCw, AlertCircle, QrCode, Wifi, X } from 'lucide-react';

export interface NFEmissaoData {
  items: { nome: string; preco: number; quantidade: number }[];
  subtotal: number;
  taxaServico: number;
  total: number;
  garcom: string;
  mesaNumero?: number;
  tipoAtendimento: 'Mesa' | 'Delivery' | 'Retirada';
  cpfCliente?: string;
  pagoMetodo: 'Dinheiro' | 'Cartão Crédito' | 'Cartão Débito' | 'Pix';
}

interface NFEmissaoModalProps {
  isOpen: boolean;
  data: NFEmissaoData | null;
  onClose: () => void;
  onConfirmSuccess: () => void;
}

export default function NFEmissaoModal({ isOpen, data, onClose, onConfirmSuccess }: NFEmissaoModalProps) {
  if (!isOpen || !data) return null;

  const [state, setState] = useState<'idle' | 'transmitting' | 'authorized'>('idle');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [cpf, setCpf] = useState(data.cpfCliente || '');
  const [metodo, setMetodo] = useState(data.pagoMetodo);

  const transmissionSteps = [
    'Estabelecendo conexão TLS 1.2 segura com o servidor SEFAZ...',
    'Gerando lote XML de Cupom Fiscal Eletrônico (NFC-e)...',
    'Assinando documento fiscal digitalmente com certificado A1...',
    'Transmitindo pacote de dados (Lote 4192) ao WebService...',
    'Aguardando processamento e distribuição do lote fiscal...',
    'NFC-e Autorizada com sucesso! Protocolo: 135260049281309.'
  ];

  useEffect(() => {
    if (state === 'transmitting') {
      setCurrentStepIndex(0);
      const interval = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev < transmissionSteps.length - 1) {
            return prev + 1;
          } else {
            clearInterval(interval);
            setState('authorized');
            return prev;
          }
        });
      }, 700);
      return () => clearInterval(interval);
    }
  }, [state]);

  const handleStartTransmission = () => {
    setState('transmitting');
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handlePrint = () => {
    if (!data) return;
    try {
      // 80mm width standard thermal paper receipt
      const pageHeight = 140 + (data.items.length * 6) + 40;
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, pageHeight]
      });

      // Set monospaced font so columns align nicely
      doc.setFont('courier', 'normal');
      doc.setFontSize(7.5);

      let y = 8;
      const xLeft = 4;
      const xRight = 76;
      const xCenter = 40;

      // Header
      doc.setFont('courier', 'bold');
      doc.text("DIGAO RESTAURANTE", xCenter, y, { align: 'center' });
      doc.setFont('courier', 'normal');
      doc.setFontSize(6.5);
      y += 4;
      doc.text("CNPJ: 40.829.100/0001-55 - IE: 110.293.412.392", xCenter, y, { align: 'center' });
      y += 3.5;
      doc.text("AVENIDA AFONSO PENA, 1212 - BELO HORIZONTE/MG", xCenter, y, { align: 'center' });
      y += 3.5;
      doc.text(`${todayDateStr} ${todayTimeStr} - Extrato No. ${Math.floor(12400 + Math.random() * 5000)}`, xCenter, y, { align: 'center' });
      
      y += 4.5;
      doc.setFontSize(7.5);
      doc.setFont('courier', 'bold');
      doc.text("CUPOM FISCAL ELETRONICO - SAT (NFC-e)", xCenter, y, { align: 'center' });
      
      y += 3.5;
      doc.setFont('courier', 'normal');
      doc.text("---------------------------------------------", xCenter, y, { align: 'center' });

      // Consumidor
      y += 3.5;
      doc.text("CONSUMIDOR:", xLeft, y);
      y += 3.5;
      doc.text(cpf ? `CPF/CNPJ: ${cpf}` : "CONSUMIDOR NAO IDENTIFICADO (GERAL)", xLeft, y);
      y += 3.5;
      doc.text(`METODO: ${metodo} | ORIGEM: ${data.tipoAtendimento}`, xLeft, y);
      if (data.mesaNumero) {
        y += 3.5;
        doc.text(`MESA: ${data.mesaNumero}`, xLeft, y);
      }

      y += 3.5;
      doc.text("---------------------------------------------", xCenter, y, { align: 'center' });

      // Items Header
      y += 3.5;
      doc.setFont('courier', 'bold');
      doc.text("QTD   DESCRICAO                         VALOR", xLeft, y);
      y += 3.5;
      doc.setFont('courier', 'normal');
      doc.text("---------------------------------------------", xCenter, y, { align: 'center' });

      // Items
      data.items.forEach(item => {
        y += 4;
        const qtyStr = `${item.quantidade}x`.padEnd(5);
        let nomeStr = item.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase(); // clear accents for pdf Courier font
        if (nomeStr.length > 25) nomeStr = nomeStr.substring(0, 22) + "...";
        nomeStr = nomeStr.padEnd(26);
        const precoStr = formatCurrency(item.preco * item.quantidade).padStart(11);
        doc.text(`${qtyStr}${nomeStr}${precoStr}`, xLeft, y);
      });

      y += 4;
      doc.text("---------------------------------------------", xCenter, y, { align: 'center' });

      // Totals
      y += 4;
      doc.text("SUBTOTAL CONSUMO:", xLeft, y);
      doc.text(formatCurrency(data.subtotal), xRight, y, { align: 'right' });
      
      if (data.taxaServico > 0) {
        y += 3.5;
        doc.text("TAXA SERVICO (10%):", xLeft, y);
        doc.text(formatCurrency(data.taxaServico), xRight, y, { align: 'right' });
      }

      y += 4.5;
      doc.setFont('courier', 'bold');
      doc.text("TOTAL DO CUPOM:", xLeft, y);
      doc.text(formatCurrency(data.total), xRight, y, { align: 'right' });

      y += 4;
      doc.setFont('courier', 'normal');
      doc.setFontSize(6);
      doc.text(`Tributos Totais Aprox. (IBPT): ${formatCurrency(data.total * 0.1345)} (13.45%)`, xLeft, y);

      y += 5;
      doc.setFontSize(7.5);
      doc.text("---------------------------------------------", xCenter, y, { align: 'center' });
      y += 3.5;
      doc.setFontSize(6.5);
      doc.text("Chave de Acesso SAT para Consulta SEFAZ MG:", xCenter, y, { align: 'center' });
      y += 3.5;
      const wrappedKey = accessKey.match(/.{1,21}/g) || [accessKey];
      wrappedKey.forEach(line => {
        doc.text(line.trim(), xCenter, y, { align: 'center' });
        y += 3;
      });

      y += 1.5;
      doc.setFontSize(6);
      doc.text("Assinado via SAT MG SAT78401392", xCenter, y, { align: 'center' });

      // Draw barcode lines
      y += 3;
      const barcodeX = 18;
      const barcodeWidth = 44;
      const barcodeHeight = 5;
      doc.setFillColor(0, 0, 0);
      for (let i = 0; i < 28; i++) {
        const stripeW = [0.25, 0.5, 0.75, 0.25, 1.0, 0.25, 0.5, 0.25, 0.75, 0.5, 0.25, 0.25][i % 12];
        const stripeOffset = (i * 1.5);
        if (stripeOffset < barcodeWidth) {
          doc.rect(barcodeX + stripeOffset, y, stripeW, barcodeHeight, 'F');
        }
      }

      // Save PDF
      doc.save(`NFCe_MG_${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      // fallback
      window.print();
    }
  };

  // Date and key values
  const todayDateStr = new Date().toLocaleDateString('pt-BR');
  const todayTimeStr = new Date().toLocaleTimeString('pt-BR');
  const accessKey = "3526 0540 8291 0001 5500 1000 0029 4810 " + Math.floor(100000000 + Math.random() * 900000000);

  return (
    <div id="nfe-emissao-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/85 backdrop-blur-sm overflow-y-auto select-none">
      <div id="nfe-emissao-dialog" className="bg-brand-charcoal border border-brand-light-charcoal rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-auto max-h-[90vh]">
        
        {/* Left Side: Controller Form (SEFAZ validator) */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6">
            
            {/* Header Status */}
            <div className="flex items-center justify-between border-b border-brand-light-charcoal pb-4">
              <div>
                <span className="text-brand-yellow font-mono text-[9px] font-bold tracking-widest uppercase flex items-center gap-1">
                  <Wifi className="w-3 h-3 animate-pulse text-emerald-400" /> SATELLITE FISCAL INTEGRATOR
                </span>
                <h3 className="font-sora font-extrabold text-base md:text-lg text-white">
                  Emissão de Nota Fiscal PDV
                </h3>
              </div>
              
              {state === 'idle' && (
                <span className="bg-amber-500/10 text-amber-400 text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded border border-amber-500/20">
                  Aguardando Envio
                </span>
              )}
              {state === 'transmitting' && (
                <span className="bg-brand-yellow/10 text-brand-yellow text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded border border-brand-yellow/20 animate-pulse">
                  Transmitindo
                </span>
              )}
              {state === 'authorized' && (
                <span className="bg-emerald-500/15 text-emerald-400 text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded border border-emerald-500/30">
                  Nota Autorizada
                </span>
              )}
            </div>

            {/* Editing customer details during checkout */}
            {state === 'idle' && (
              <div className="space-y-4">
                <div className="bg-brand-black/20 border border-brand-light-charcoal rounded-xl p-4 space-y-4">
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Identificação do Consumidor</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-gray-400 uppercase">CPF/CNPJ na Nota</label>
                      <input
                        id="nfe-cpf-input"
                        type="text"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        placeholder="Sem CPF (Venda Geral)"
                        className="w-full bg-brand-light-charcoal border border-brand-light-charcoal text-xs text-white p-2.5 rounded-lg focus:border-brand-yellow focus:ring-0"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-gray-400 uppercase">Método Rebatido</label>
                      <select
                        id="nfe-metodo-select"
                        value={metodo}
                        onChange={(e) => setMetodo(e.target.value as any)}
                        className="w-full bg-brand-light-charcoal border border-brand-light-charcoal text-xs text-white p-2.5 rounded-lg"
                      >
                        <option value="Pix">Pix</option>
                        <option value="Cartão Crédito">Cartão de Crédito</option>
                        <option value="Cartão Débito">Cartão de Débito</option>
                        <option value="Dinheiro">Dinheiro (Espécie)</option>
                      </select>
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-500 italic">
                    * Após a transmissão à SEFAZ, os tributos estaduais (ICMS/PIS/COFINS) serão calculados segundo a tabela IBPT de forma integrada ao Sistema de Escrituração Fiscal Digital.
                  </p>
                </div>

                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 flex items-start gap-3">
                  <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-[11px] font-bold text-emerald-400 uppercase">Integração Direta com Conta Bancária e Caixa</h5>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Confirmar a emissão enviará o imposto devido ao órgão de fiscalização fazendária e <strong className="text-white">acrescentará automaticamente</strong> o valor integral de <strong className="text-brand-yellow font-mono">{formatCurrency(data.total)}</strong> no fluxo de caixa/financeiro como <strong className="text-emerald-400">Entrada</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Loading transmission logs screen */}
            {state === 'transmitting' && (
              <div className="space-y-4 py-6">
                <div className="flex items-center justify-center py-4">
                  <RefreshCw className="w-10 h-10 text-brand-yellow animate-spin" />
                </div>
                <div className="bg-brand-black/60 border border-brand-light-charcoal rounded-xl p-4 font-mono text-[11px] text-brand-yellow space-y-2 h-44 overflow-y-auto">
                  <div className="text-emerald-400 font-bold flex items-center gap-1.5 border-b border-brand-light-charcoal/40 pb-1.5 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    CONEXÃO DE DADOS SEFAZ ATIVA
                  </div>
                  {transmissionSteps.slice(0, currentStepIndex + 1).map((step, idx) => (
                    <div key={idx} className="flex gap-2 animate-in fade-in duration-200">
                      <span className="text-gray-500 shrink-0">[{idx + 1}]</span>
                      <span className={idx === currentStepIndex ? 'text-white font-bold' : 'text-gray-400'}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Result status authorization details */}
            {state === 'authorized' && (
              <div className="space-y-4 animate-in zoom-in-95 duration-150">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 text-center space-y-2">
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-7 h-7" />
                  </div>
                  <h4 className="font-sora font-extrabold text-base text-white">NFC-e Transmitida & Autorizada!</h4>
                  <p className="text-xs text-gray-400 max-w-md mx-auto">
                    A nota fiscal eletrônica foi gerada, assinada digitalmente com sucesso e o financeiro foi atualizado de forma automática.
                  </p>
                </div>

                <div className="bg-brand-black/20 border border-brand-light-charcoal rounded-xl p-4 font-mono text-[10px] space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-500">NÚMERO DE SÉRIE:</span>
                    <span className="text-gray-300">002 / SÉRIE 041</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">CÓDIGO DE AUTORIZAÇÃO:</span>
                    <span className="text-gray-300">135260049281309</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">CHAVE DE ACESSO:</span>
                    <span className="text-gray-300 font-bold text-emerald-400">AUTORIZADA</span>
                  </div>
                  <div className="text-[9px] text-gray-500 text-center uppercase pt-2 border-t border-brand-light-charcoal/20">
                    Sincronizado instantaneamente com o Livro de Caixa e DRE do Dia
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Action buttons footer */}
          <div className="pt-6 border-t border-brand-light-charcoal mt-6 flex justify-between gap-3">
            {state === 'idle' && (
              <>
                <button
                  id="btn-nfe-cancel"
                  onClick={onClose}
                  className="bg-brand-light-charcoal hover:bg-brand-light-charcoal/80 text-gray-400 hover:text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase transition"
                >
                  Cancelar Saída
                </button>
                <button
                  id="btn-nfe-transmit"
                  onClick={handleStartTransmission}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 font-extrabold uppercase text-xs tracking-wider text-white py-2.5 px-6 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition"
                >
                  Confirmar e Transmitir Nota <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}

            {state === 'transmitting' && (
              <button
                disabled
                className="w-full bg-brand-light-charcoal text-gray-500 py-2.5 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <RefreshCw className="w-4 h-4 animate-spin" /> AGUARDANDO RETORNO DA SEFAZ MG...
              </button>
            )}

            {state === 'authorized' && (
              <>
                <button
                  id="btn-nfe-print"
                  onClick={handlePrint}
                  className="bg-brand-light-charcoal hover:bg-brand-light-charcoal/80 text-gray-300 hover:text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase transition flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Imprimir Cupom
                </button>
                <button
                  id="btn-nfe-success"
                  onClick={onConfirmSuccess}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-650 font-extrabold uppercase text-xs tracking-wider text-white py-2.5 px-6 rounded-lg flex items-center justify-center gap-1.5 active:scale-95 transition"
                >
                  Concluir Venda <CheckCircle className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Visual Receipt (SAT Thermal Paper Design) */}
        <div className="w-full md:w-[360px] bg-brand-black/40 border-t md:border-t-0 md:border-l border-brand-light-charcoal p-5 flex flex-col justify-between overflow-y-auto max-h-[40vh] md:max-h-none">
          <div className="bg-white text-gray-900 rounded-xl p-4 font-mono text-[10px] leading-tight space-y-3 shadow-md border border-gray-200 select-all relative overflow-hidden">
            {/* Thermal background overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/5 to-transparent pointer-events-none" />
            
            {/* Receipt Header details */}
            <div className="text-center font-bold space-y-0.5 border-b border-dashed border-gray-400 pb-2">
              <h4 className="text-xs uppercase font-extrabold">Digão Restaurante</h4>
              <p>CNPJ: 40.829.100/0001-55 - IE: 110.293.412.392</p>
              <p>AVENIDA AFONSO PENA, 1212 - BELO HORIZONTE/MG</p>
              <div className="text-[9px] text-gray-550 pt-1 font-normal">
                {todayDateStr} {todayTimeStr} - Extrato Nº: {Math.floor(12400 + Math.random() * 5000)}
              </div>
              <p className="text-[9px] uppercase tracking-wide font-extrabold border-t border-dashed border-gray-400 mt-1 pt-1">
                CUPOM FISCAL ELETRÔNICO - SAT (NFC-e)
              </p>
            </div>

            {/* Customer Details */}
            <div className="border-b border-dashed border-gray-400 pb-2">
              <p className="font-bold">CONSUMIDOR:</p>
              <p className="text-gray-700 truncate">
                {cpf ? `CPF/CNPJ: ${cpf}` : 'CONSUMIDOR NÃO IDENTIFICADO (GERAL)'}
              </p>
              <p className="text-gray-500">MÉTODO: {metodo} | ORIGEM: {data.tipoAtendimento}</p>
              {data.mesaNumero ? <p className="text-gray-500 font-bold">MESA: {data.mesaNumero}</p> : null}
            </div>

            {/* List of elements */}
            <div className="space-y-2 border-b border-dashed border-gray-400 pb-2">
              <div className="flex font-bold text-gray-800">
                <span className="w-8 shrink-0">QTD</span>
                <span className="flex-1">DESCRIÇÃO</span>
                <span className="w-16 text-right shrink-0">VALOR</span>
              </div>
              <div className="divide-y divide-gray-100 space-y-1">
                {data.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start pt-1 gap-1 text-gray-800">
                    <span className="w-8 shrink-0 font-bold">{item.quantidade}x</span>
                    <span className="flex-1 truncate uppercase">{item.nome}</span>
                    <span className="w-16 text-right shrink-0 font-bold">{formatCurrency(item.preco * item.quantidade)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subtotal, tax & total info */}
            <div className="space-y-1 text-right font-medium">
              <div className="flex justify-between">
                <span>SUBTOTAL CONSUMO:</span>
                <span>{formatCurrency(data.subtotal)}</span>
              </div>
              {data.taxaServico > 0 && (
                <div className="flex justify-between">
                  <span>TAXA SERVIÇO (10%):</span>
                  <span>{formatCurrency(data.taxaServico)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-xs font-extrabold text-black pt-1 border-t border-dashed border-gray-400">
                <span>TOTAL DO CUPOM:</span>
                <span>{formatCurrency(data.total)}</span>
              </div>

              <div className="flex justify-between text-[8px] text-gray-500 font-normal pt-2">
                <span>Tributos Totais Aprox. (IBPT):</span>
                <span>{formatCurrency(data.total * 0.1345)} (13.45%)</span>
              </div>
            </div>

            {/* Access key details and Barcode / QR Code simulation */}
            <div className="pt-2 border-t border-dashed border-gray-400 text-center space-y-1.5 font-normal text-gray-600">
              <p className="text-[8px] tracking-wide leading-relaxed uppercase">
                Chave de Acesso SAT para Consulta SEFAZ MG:
              </p>
              <p className="font-extrabold text-[8px] text-black break-all select-all hover:bg-gray-100">
                {accessKey}
              </p>
              
              {/* Fake QR Code and simulated barcode stripes */}
              <div className="flex flex-col items-center justify-center pt-2 space-y-1">
                <div className="w-16 h-16 bg-gray-150 rounded border border-gray-300 p-1 flex items-center justify-center">
                  <QrCode className="w-14 h-14 text-black" />
                </div>
                
                {/* Vertical stripes simulator for code bars */}
                <div className="w-32 h-6 flex justify-between items-stretch overflow-hidden mt-1 opacity-75">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-black"
                      style={{
                        width: `${[1, 2, 3, 1, 4, 1, 2, 1, 3, 2, 1, 1][i % 12]}px`,
                        marginRight: `${(i % 3 === 0) ? '1px' : '0px'}`
                      }}
                    />
                  ))}
                </div>
                <p className="text-[7px] text-gray-450 uppercase leading-none mt-1">
                  Assinado via SAT MG SAT78401392
                </p>
              </div>
            </div>

            {/* ZigZag paper tear effect at bottom */}
            <div className="absolute left-0 right-0 bottom-0 h-1.5 bg-gradient-to-t from-gray-100 to-transparent pointer-events-none" />
          </div>
          
          <p className="text-[9px] text-center text-gray-500 mt-2 font-mono uppercase">
            Pressione Esc ou clique em Cancelar para sair da nota
          </p>
        </div>

      </div>
    </div>
  );
}
