'use client';

import { useState } from 'react';
import { Printer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ReceitaProps {
  patientId: string;
  patientName: string;
  doctorName: string;
  crm: string;
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
  clinicLogo?: string | null; // Adicionado
}

export default function ReceitaSimples({ 
  patientId, patientName, doctorName, crm, clinicName, clinicAddress, clinicPhone, clinicLogo 
}: ReceitaProps) {
  
  const [content, setContent] = useState(
    `Paciente: ${patientName}\n\nUso Oral:\n\n1. Dipirona Sódica 500mg ---------------- 1 cx\n   Tomar 1 comprimido a cada 6 horas em caso de dor ou febre.`
  );

  const handlePrint = () => {
    window.print();
  };

  const dataAtual = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
      
      {/* CSS GLOBAL APENAS PARA IMPRESSÃO */}
      <style jsx global>{`
        @media print {
          @page { margin: 0; size: A4; }
          body { margin: 0; padding: 0; background: white; }
          
          /* Esconde tudo */
          body * { visibility: hidden; }
          
          /* Mostra só o papel e posiciona no topo */
          #folha-receita, #folha-receita * {
            visibility: visible;
          }
          #folha-receita {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 20mm; /* Margem interna do papel */
            box-shadow: none;
            border: none;
          }
        }
      `}</style>

      {/* --- MENU (Some ao imprimir via CSS acima) --- */}
      <div className="w-full max-w-[210mm] flex justify-between items-center mb-6 px-4 md:px-0 no-print">
        <Link 
          href={`/dashboard/pacientes/${patientId}`} 
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-full font-bold shadow hover:bg-primary/90 transition-all"
        >
          <Printer className="w-4 h-4" /> Imprimir
        </button>
      </div>

      {/* --- FOLHA DE PAPEL A4 --- */}
      {/* 1. Adicionei 'overflow-hidden' aqui */}
      <div id="folha-receita" className="bg-white shadow-2xl w-[210mm] min-h-[297mm] p-[20mm] relative overflow-hidden">
        
        {/* 2. NOVA LÓGICA DA MARCA D'ÁGUA (Fica no fundo) */}
        {clinicLogo && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                    src={clinicLogo} 
                    alt="Marca d'água" 
                    className="w-2/3 opacity-10" /*--- basta adicionar grayscale após o 10 caso queira em escala de cinza a logo---*/
                />
            </div>
        )}

        {/* 3. CONTEÚDO ENVELOPADO (z-index maior para ficar na frente da imagem) */}
        <div className="relative z-10 h-full flex flex-col">
            
            {/* Cabeçalho */}
            <header className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wider">{clinicName}</h1>
                    <p className="text-sm font-semibold text-gray-600 mt-1">{doctorName}</p>
                    <p className="text-xs text-gray-500">CRM {crm || "---"}</p>
                </div>
                <div className="text-right text-xs text-gray-500 max-w-[200px]">
                    <p>{clinicAddress}</p>
                    <p className="mt-1">{clinicPhone}</p>
                </div>
            </header>

            {/* Título */}
            <div className="text-center mb-10">
                <h2 className="text-lg font-bold uppercase underline decoration-2 underline-offset-4">Receituário Médico</h2>
            </div>

            {/* Área de Texto */}
            <textarea 
                className="w-full h-[150mm] resize-none outline-none text-lg leading-loose text-gray-900 font-serif bg-transparent placeholder:text-gray-300 border-none focus:ring-0 p-0"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                spellCheck={false}
            />

            {/* Rodapé */}
            <footer className="absolute bottom-0 left-0 right-0"> {/* Ajustei o posicionamento relativo ao container interno */}
                <div className="flex flex-col items-center gap-8">
                    <div className="flex justify-between w-full items-end">
                        <p className="text-sm text-gray-600 italic">
                            {clinicAddress ? clinicAddress.split(',')[0] : 'Local'}, {dataAtual}.
                        </p>
                        <div className="text-center">
                            <div className="w-48 border-t border-gray-900 mb-1"></div>
                            <p className="text-xs text-gray-500 uppercase">Assinatura</p>
                        </div>
                    </div>
                </div>
            </footer>

        </div>
      </div>
    </div>
  );
}