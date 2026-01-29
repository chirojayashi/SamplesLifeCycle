
import React, { useState } from 'react';
import { 
  ClipboardCheck, FileText, Plus, 
  User, MessageSquare, ExternalLink,
  Info, Package, Calendar, Tag, Shield, X, Upload, FileDown, 
  Layers, ChevronRight, ArrowLeftRight, CheckCircle2, History, Camera, Save, Hash, Loader2, FileUp
} from 'lucide-react';
import { Sample, Inspection, TechnicalSheet, SampleStatus, UserRole, UserSession } from '../types';
import { AzureService } from '../services/azureService';

interface SampleDetailProps {
  sample: Sample;
  inspections: Inspection[];
  sheets: TechnicalSheet[];
  currentUser: UserSession;
  onAddInspection: (sampleId: string, observations: string, images: string[], pdfUrl?: string) => void;
  onAddSheet: (sampleId: string, soleCode: string, observations: string, pdfUrl?: string) => void;
}

const SampleDetail: React.FC<SampleDetailProps> = ({ sample, inspections, sheets, currentUser, onAddInspection, onAddSheet }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'inspections' | 'sheets'>('info');
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [showSheetModal, setShowSheetModal] = useState(false);
  
  const [newObs, setNewObs] = useState('');
  const [newSoleCode, setNewSoleCode] = useState('');
  const [newImages, setNewImages] = useState<string[]>([]);
  const [newPdfUrl, setNewPdfUrl] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);

  const isAdmin = currentUser.role === UserRole.ADMIN;
  const canInspect = isAdmin || currentUser.role === UserRole.ROLE2_INSPECTIONS;
  const canFinalize = isAdmin || currentUser.role === UserRole.ROLE3_TECHNICAL;

  const handleInspectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) return;
    onAddInspection(sample.id, newObs, newImages, newPdfUrl);
    setNewObs('');
    setNewImages([]);
    setNewPdfUrl(undefined);
    setShowInspectionModal(false);
    setActiveTab('inspections');
  };

  const handleSheetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) return;
    onAddSheet(sample.id, newSoleCode, newObs, newPdfUrl);
    setNewSoleCode('');
    setNewObs('');
    setNewPdfUrl(undefined);
    setShowSheetModal(false);
    setActiveTab('sheets');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isImage: boolean) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsUploading(true);
      try {
        if (isImage) {
          const uploadPromises = Array.from(files).map(file => AzureService.uploadFile(file));
          const urls = await Promise.all(uploadPromises);
          setNewImages(prev => [...prev, ...urls]);
        } else {
          const url = await AzureService.uploadFile(files[0]);
          setNewPdfUrl(url);
        }
      } catch (err) {
        alert("Error al subir archivo a Azure Storage.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-2 pb-20">
      {/* Header Info con Barra de Acciones Persistente */}
      <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 flex flex-col lg:flex-row gap-6 sm:gap-8 items-start relative">
          <div className="w-full lg:absolute lg:top-0 lg:right-0 p-0 lg:p-8 flex justify-between lg:justify-end items-center lg:items-end z-10">
             <div className="lg:text-right">
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ID Producto</p>
                <h2 className="text-2xl sm:text-4xl font-black text-indigo-600 tracking-tighter leading-none">{sample.sequentialId}</h2>
             </div>
          </div>

          <div className="w-full sm:w-56 h-48 sm:h-56 bg-slate-50 rounded-2xl sm:rounded-3xl overflow-hidden flex-shrink-0 border border-slate-200 shadow-inner group">
            {sample.images.length > 0 ? (
              <img 
                src={sample.images[0]} 
                loading="lazy"
                className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                alt={sample.name} 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <Package className="w-12 h-12" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4 sm:space-y-6 w-full">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-4xl font-black text-slate-800 tracking-tight leading-tight">{sample.name}</h1>
              <p className="text-slate-500 font-bold text-sm sm:text-lg">Fabricante: <span className="text-indigo-600">{sample.providerName}</span></p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 bg-slate-50/80 rounded-xl sm:rounded-2xl border border-slate-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3 h-3 text-indigo-400" />
                  <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">F. Registro</p>
                </div>
                <p className="text-[10px] sm:text-xs font-black text-slate-700">{sample.registrationDate}</p>
              </div>
              <div className="p-3 sm:p-4 bg-indigo-50/50 rounded-xl sm:rounded-2xl border border-indigo-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <Shield className="w-3 h-3 text-indigo-400" />
                  <p className="text-[9px] text-indigo-400 uppercase font-black tracking-widest">Etapa Actual</p>
                </div>
                <p className="text-[10px] sm:text-xs font-black text-indigo-700 uppercase tracking-tighter">{sample.status}</p>
              </div>
            </div>
          </div>
        </div>

        {/* BARRA DE ACCIONES PERSISTENTE */}
        <div className="bg-slate-900 px-6 py-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 mr-auto">
             <Shield className="w-4 h-4 text-indigo-400" />
             <span className="text-[10px] font-black text-white uppercase tracking-widest">Ciclo de Vida:</span>
          </div>
          
          {canInspect && (
            <button 
              onClick={() => { setShowInspectionModal(true); setNewPdfUrl(undefined); setNewImages([]); }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"
            >
              <ClipboardCheck className="w-3.5 h-3.5" /> Nueva Inspección
            </button>
          )}

          {canFinalize && (
            <button 
              onClick={() => { setShowSheetModal(true); setNewPdfUrl(undefined); }}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"
            >
              <FileUp className="w-3.5 h-3.5" /> Nueva Ficha Técnica
            </button>
          )}
        </div>
      </div>

      {/* Tabs Control */}
      <div className="flex gap-2 bg-slate-200/50 p-1.5 rounded-2xl w-full overflow-x-auto sticky top-[72px] z-20 backdrop-blur-md border border-white/50">
        <button onClick={() => setActiveTab('info')} className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'info' ? 'bg-white text-indigo-600 shadow-md border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}>Resumen Técnico</button>
        <button onClick={() => setActiveTab('inspections')} className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'inspections' ? 'bg-white text-indigo-600 shadow-md border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}>Inspecciones ({inspections.length})</button>
        <button onClick={() => setActiveTab('sheets')} className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'sheets' ? 'bg-white text-indigo-600 shadow-md border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}>Fichas Técnicas ({sheets.length})</button>
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-6 sm:p-10 rounded-[2rem] border border-slate-200 shadow-sm space-y-8">
                <div className="space-y-4">
                  <h4 className="text-slate-800 font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-3">
                    <div className="w-6 h-px bg-indigo-500"></div>
                    Especificaciones Maestras
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Categoría</p>
                      <p className="font-bold text-slate-700">{sample.category || 'No especificada'}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Tipo de Muestra</p>
                      <p className="font-bold text-slate-700">{sample.type || 'Estándar'}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Alcance del Registro</p>
                      <p className="text-slate-600 font-medium leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100 italic">
                        "{sample.description || 'Sin observaciones registradas.'}"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-slate-800 font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-3">
                    <div className="w-6 h-px bg-indigo-500"></div>
                    Evidencia de Referencia (Cloud)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {sample.images.map((img, i) => (
                      <a key={i} href={img} target="_blank" rel="noreferrer" className="aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm group cursor-pointer block">
                        <img src={img} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={`G${i}`} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 text-center">Trazabilidad Industrial</h4>
                 <div className="relative pl-6 space-y-8">
                    <div className="absolute left-1.5 top-0 bottom-0 w-0.5 bg-slate-100"></div>
                    <div className="relative">
                       <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-indigo-600 border-2 border-white shadow-md"></div>
                       <p className="text-[10px] font-black text-indigo-600 uppercase tracking-tight">Registro Maestro</p>
                       <p className="text-[9px] text-slate-400 font-bold">{sample.registrationDate}</p>
                    </div>
                    <div className="relative">
                       <div className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-white shadow-md ${inspections.length > 0 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                       <p className={`text-[10px] font-black uppercase ${inspections.length > 0 ? 'text-slate-800' : 'text-slate-400'}`}>Validación Técnica</p>
                       <p className="text-[9px] text-slate-400 font-bold">{inspections.length} informes</p>
                    </div>
                    <div className="relative">
                       <div className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-white shadow-md ${sheets.length > 0 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                       <p className={`text-[10px] font-black uppercase ${sheets.length > 0 ? 'text-slate-800' : 'text-slate-400'}`}>Ficha Técnica Sole</p>
                       <p className="text-[9px] text-slate-400 font-bold">{sheets.length} versiones</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inspections' && (
          <div className="space-y-4 max-w-4xl animate-in slide-in-from-right-2">
            {inspections.length === 0 ? (
              <div className="bg-white p-16 rounded-[2rem] text-center border border-slate-100 shadow-sm">
                <ClipboardCheck className="w-16 h-16 text-slate-50 mx-auto mb-6" />
                <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">Inspección técnica requerida</p>
              </div>
            ) : (
              inspections.map((ins, i) => (
                <div key={ins.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-6 hover:border-indigo-200 transition-colors group">
                  <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600 font-black text-sm shrink-0 border border-indigo-100 shadow-inner">V{ins.version}</div>
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-center">
                       <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-black">{ins.user.charAt(0)}</div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ins.user} • {ins.date}</p>
                       </div>
                       {ins.pdfUrl && <a href={ins.pdfUrl} target="_blank" className="text-indigo-600 flex items-center gap-1 text-[10px] font-black uppercase hover:underline"><FileDown className="w-3.5 h-3.5" /> Informe PDF</a>}
                    </div>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed bg-slate-50/50 p-6 rounded-2xl border border-slate-100 italic">"{ins.observations}"</p>
                    {ins.images.length > 0 && (
                      <div className="flex gap-3 pt-2">
                        {ins.images.map((im, idx) => (
                           <a key={idx} href={im} target="_blank"><img src={im} className="w-20 h-20 rounded-xl object-cover border border-slate-200 shadow-sm hover:scale-110 transition-transform cursor-pointer" /></a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'sheets' && (
          <div className="space-y-4 max-w-4xl animate-in slide-in-from-right-2">
            {sheets.length === 0 ? (
              <div className="bg-white p-16 rounded-[2rem] text-center border border-slate-100 shadow-sm">
                <FileText className="w-16 h-16 text-slate-50 mx-auto mb-6" />
                <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">Sin Ficha Técnica Cloud</p>
              </div>
            ) : (
              sheets.map((sh) => (
                <div key={sh.id} className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl flex items-start gap-8 relative overflow-hidden border border-slate-700 group">
                   <div className="absolute top-0 right-0 p-8 opacity-5"><FileText className="w-48 h-48" /></div>
                   <div className="bg-indigo-600 p-4 rounded-2xl shrink-0 shadow-lg shadow-indigo-900/40 font-black text-sm flex items-center justify-center h-12 w-12">V{sh.version}</div>
                   <div className="flex-1 space-y-6 relative z-10">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">CÓDIGO SOLE ASIGNADO</h5>
                          <p className="text-3xl font-black tracking-tighter text-white">{sh.soleCode}</p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-500/30">Release Digital</span>
                          {sh.pdfUrl && (
                            <a href={sh.pdfUrl} target="_blank" className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all shadow-lg shadow-indigo-900/20">
                               <FileDown className="w-3.5 h-3.5" /> Ver PDF de Ficha
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-8 border-y border-white/5 py-6">
                        <div>
                          <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Fecha Emisión</p>
                          <p className="text-xs font-bold text-slate-300">{sh.date}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Publicado por</p>
                          <p className="text-xs font-bold text-slate-300">{sh.user}</p>
                        </div>
                      </div>
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                         <p className="text-xs text-indigo-100 leading-relaxed font-medium italic">"{sh.observations}"</p>
                      </div>
                   </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* MODAL INSPECCION */}
      {showInspectionModal && (
        <div className="fixed inset-0 bg-indigo-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8">
              <div className="bg-indigo-600 p-6 flex justify-between items-center text-white">
                 <h3 className="font-black text-xs uppercase tracking-widest">Nuevo Informe Técnico</h3>
                 <button onClick={() => setShowInspectionModal(false)} className="hover:bg-white/10 p-1 rounded-lg transition-colors" disabled={isUploading}><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleInspectionSubmit} className="p-8 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Observaciones de Calidad</label>
                    <textarea 
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 min-h-[140px] shadow-inner"
                      placeholder="Detalla los resultados de las pruebas..."
                      value={newObs}
                      onChange={e => setNewObs(e.target.value)}
                    />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Fotos Evidencia ({newImages.length})</label>
                    <div className="flex flex-wrap gap-3">
                       <label className="w-16 h-16 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-100 hover:border-indigo-300 transition-all group relative">
                          {isUploading ? <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" /> : <Camera className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />}
                          <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, true)} disabled={isUploading} />
                       </label>
                       {newImages.map((img, i) => (
                         <img key={i} src={img} className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm" />
                       ))}
                    </div>
                 </div>
                 <button type="submit" disabled={isUploading} className="w-full bg-indigo-600 disabled:bg-slate-300 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 transition-all">
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Registrar V{inspections.length + 1}
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* MODAL FICHA TÉCNICA */}
      {showSheetModal && (
        <div className="fixed inset-0 bg-indigo-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8">
              <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
                 <h3 className="font-black text-xs uppercase tracking-widest">Generar Nueva Versión de Ficha</h3>
                 <button onClick={() => setShowSheetModal(false)} className="hover:bg-white/10 p-1 rounded-lg transition-colors" disabled={isUploading}><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleSheetSubmit} className="p-8 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Código Sole Autorizado</label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        required
                        className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
                        placeholder="Ej: CAL-10L-GAS-01"
                        value={newSoleCode}
                        onChange={e => setNewSoleCode(e.target.value)}
                      />
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Documento Técnico Oficial</label>
                    <label className={`w-full flex items-center justify-center gap-3 p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${newPdfUrl ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-indigo-400 hover:text-indigo-600'}`}>
                        {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : (newPdfUrl ? <CheckCircle2 className="w-5 h-5" /> : <FileUp className="w-5 h-5" />)}
                        <span className="text-[10px] font-black uppercase">{isUploading ? 'Subiendo Documento...' : (newPdfUrl ? 'PDF Cargado Correctamente' : 'Adjuntar PDF de Ficha')}</span>
                        <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFileUpload(e, false)} disabled={isUploading} />
                    </label>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Notas de Versión</label>
                    <textarea 
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] shadow-inner"
                      placeholder="Indica qué cambios o mejoras se incluyen en esta versión..."
                      value={newObs}
                      onChange={e => setNewObs(e.target.value)}
                    />
                 </div>

                 <button type="submit" disabled={isUploading} className="w-full bg-slate-900 disabled:bg-slate-300 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 flex items-center justify-center gap-3 transition-all">
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />} Publicar Versión V{sheets.length + 1}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default SampleDetail;
