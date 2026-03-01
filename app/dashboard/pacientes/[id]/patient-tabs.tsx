'use client'

import { useState } from "react"
import { FileText, Activity, DollarSign, Upload, File as FileIcon } from "lucide-react"
import { createMedicalRecord } from "@/app/actions/prontuario"

// Tipos simplificados para a UI
type PatientData = {
  id: string
  name: string
  records: any[]
  appointments: any[]
}

export function PatientTabs({ patient }: { patient: PatientData }) {
  const [activeTab, setActiveTab] = useState("prontuario")
  const [isUploading, setIsUploading] = useState(false)

  // Filtra todos os anexos de todos os registros
  const allAttachments = patient.records.flatMap(r => r.attachments || [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsUploading(true)
    const formData = new FormData(e.currentTarget)
    await createMedicalRecord(formData)
    setIsUploading(false)
    // Limpa o form (opcional)
    const form = e.target as HTMLFormElement;
    form.reset();
  }

  return (
    <div className="mt-6">
      {/* Navegação das Abas */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {[
          { id: 'resumo', label: 'Resumo', icon: Activity },
          { id: 'prontuario', label: 'Prontuário & Evolução', icon: FileText },
          { id: 'exames', label: 'Exames & Arquivos', icon: FileIcon },
          { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap
              ${activeTab === tab.id 
                ? "border-blue-600 text-blue-600" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Conteúdo das Abas */}
      <div className="min-h-[400px]">
        
        {/* ABA: RESUMO */}
        {activeTab === 'resumo' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <h3 className="text-gray-500 text-sm">Total Consultas</h3>
                    <p className="text-2xl font-bold">{patient.appointments.length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <h3 className="text-gray-500 text-sm">Última Visita</h3>
                    <p className="text-xl font-semibold">
                        {patient.appointments[0]?.date 
                         ? new Date(patient.appointments[0].date).toLocaleDateString('pt-BR') 
                         : 'N/A'}
                    </p>
                </div>
            </div>
        )}

        {/* ABA: PRONTUÁRIO (TIMELINE + FORM) */}
        {activeTab === 'prontuario' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Esquerda: Novo Registro */}
            <div className="lg:col-span-1">
                <div className="bg-white p-4 rounded-lg border shadow-sm sticky top-4">
                    <h3 className="font-semibold mb-4">Nova Evolução / Exame</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="hidden" name="patientId" value={patient.id} />
                        
                        <div>
                            <label className="text-xs text-gray-500 font-medium">Descrição Clínica</label>
                            <textarea 
                                name="description" 
                                required
                                rows={4}
                                className="w-full mt-1 p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Descreva a evolução ou o exame anexado..."
                            />
                        </div>

                        <div>
                            <label className="text-xs text-gray-500 font-medium block mb-1">Anexar Exame (PDF/Img)</label>
                            <input 
                                type="file" 
                                name="file"
                                accept="image/*,.pdf"
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>

                        <button 
                            disabled={isUploading}
                            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 flex justify-center gap-2 items-center"
                        >
                            {isUploading ? "Salvando..." : <><Upload size={16}/> Salvar Evolução</>}
                        </button>
                    </form>
                </div>
            </div>

            {/* Direita: Histórico (Timeline) */}
            <div className="lg:col-span-2 space-y-4">
                {patient.records.length === 0 && (
                    <p className="text-gray-400 text-center py-10">Nenhum registro clínico encontrado.</p>
                )}
                {patient.records.map((record) => (
                    <div key={record.id} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                {new Date(record.createdAt).toLocaleDateString('pt-BR')} às {new Date(record.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                        <p className="text-gray-800 whitespace-pre-line text-sm">{record.description}</p>
                        
                        {/* Se tiver anexo neste registro */}
                        {record.attachments && record.attachments.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-dashed">
                                {record.attachments.map((att: any) => (
                                    <a key={att.id} href={att.url} target="_blank" className="flex items-center gap-2 text-xs text-blue-600 hover:underline">
                                        <FileIcon size={14} />
                                        {att.name} (Abrir)
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
          </div>
        )}

        {/* ABA: EXAMES (GALERIA) */}
        {activeTab === 'exames' && (
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {allAttachments.length === 0 && <p className="text-gray-400 col-span-4">Nenhum exame anexado.</p>}
                
                {allAttachments.map((att) => (
                    <a key={att.id} href={att.url} target="_blank" className="group block border rounded-lg p-3 hover:border-blue-400 hover:shadow-md transition bg-white">
                        <div className="h-24 bg-gray-50 rounded mb-2 flex items-center justify-center text-gray-300 group-hover:text-blue-500">
                             {/* Se fosse real, mostraria thumbnail aqui */}
                             <FileIcon size={32} />
                        </div>
                        <p className="text-sm font-medium truncate text-gray-700">{att.name}</p>
                        <p className="text-xs text-gray-400">{new Date(att.createdAt).toLocaleDateString()}</p>
                    </a>
                ))}
             </div>
        )}

        {/* ABA: FINANCEIRO */}
        {activeTab === 'financeiro' && (
            <div className="bg-gray-50 border rounded-lg p-8 text-center text-gray-500">
                <DollarSign size={40} className="mx-auto mb-2 opacity-20" />
                <p>Módulo Financeiro do Paciente em construção.</p>
                <p className="text-xs">Aqui aparecerão faturas e pagamentos específicos deste CPF.</p>
            </div>
        )}
      </div>
    </div>
  )
}