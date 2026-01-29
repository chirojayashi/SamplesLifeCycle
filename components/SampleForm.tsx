
import React, { useState } from 'react';
import { Camera, FileText, User, Tag, Archive, Calendar, Save, Package, PlusCircle, Users, X, Loader2 } from 'lucide-react';
import { Sample, SampleStatus, Provider } from '../types';
import { AzureService } from '../services/azureService';

interface SampleFormProps {
  onSave: (sample: Sample) => void;
  providers: Provider[];
}

const SampleForm: React.FC<SampleFormProps> = ({ onSave, providers }) => {
  const [formData, setFormData] = useState({
    name: '',
    providerId: '',
    description: '',
    category: '',
    type: '',
    user: 'Juan Sanchez'
  });
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsUploading(true);
      try {
        const uploadPromises = Array.from(files).map(file => AzureService.uploadFile(file));
        const urls = await Promise.all(uploadPromises);
        setImages(prev => [...prev, ...urls]);
      } catch (error) {
        alert("Error al subir imágenes al servidor de archivos.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) return;
    
    const selectedProvider = providers.find(p => p.id === formData.providerId);
    const newSample: Sample = {
      id: Math.random().toString(36).substr(2, 9),
      sequentialId: `S-${Math.floor(1000 + Math.random() * 9000)}`,
      ...formData,
      providerName: selectedProvider?.name || 'Desconocido',
      registrationDate: new Date().toISOString().split('T')[0],
      status: SampleStatus.REGISTERED,
      images
    };
    onSave(newSample);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Package className="w-5 h-5" />
          Ficha de Registro de Producto
        </h3>
        <span className="text-indigo-100 text-sm font-black uppercase tracking-widest text-[10px]">Paso 1: Identificación</span>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Package className="w-4 h-4" /> Nombre Comercial
            </label>
            <input
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-sm"
              type="text"
              placeholder="Ej: Calentador de Gas 10L Premium"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Users className="w-4 h-4" /> Fabricante (Socio)
            </label>
            <select
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-sm"
              value={formData.providerId}
              onChange={e => setFormData({ ...formData, providerId: e.target.value })}
            >
              <option value="">Seleccionar del maestro...</option>
              {providers.map(p => (
                <option key={p.id} value={p.id}>{p.name} - {p.country}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Tag className="w-4 h-4" /> Categoría de Producto
            </label>
            <select
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="">Elegir categoría...</option>
              <option value="Hogar">Línea Hogar</option>
              <option value="Industrial">Línea Industrial</option>
              <option value="Electrónicos">Electrónicos</option>
              <option value="Repuestos">Repuestos y Accesorios</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Archive className="w-4 h-4" /> Tipo de Muestra
            </label>
            <input
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-sm"
              type="text"
              placeholder="Ej: Prototipo A1 / Muestra de Oro"
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <FileText className="w-4 h-4" /> Descripción Detallada
          </label>
          <textarea
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none min-h-[120px] font-medium text-sm"
            placeholder="Especificaciones técnicas iniciales, estado del paquete, etc."
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Camera className="w-4 h-4" /> Adjuntos: Imágenes de Muestra ({images.length})
          </label>
          <div className="flex flex-wrap gap-4">
            <label className="w-32 h-32 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all group relative overflow-hidden">
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                  <span className="text-[8px] font-black text-indigo-500 uppercase">Subiendo...</span>
                </div>
              ) : (
                <>
                  <PlusCircle className="w-8 h-8 text-slate-300 group-hover:text-indigo-500" />
                  <span className="text-[9px] text-slate-400 mt-2 font-black uppercase tracking-tighter text-center px-2">Añadir Archivos</span>
                </>
              )}
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
            </label>
            {images.map((img, idx) => (
              <div key={idx} className="w-32 h-32 rounded-2xl overflow-hidden border border-slate-200 relative group shadow-sm">
                <img src={img} className="w-full h-full object-cover" alt={`Ref ${idx}`} />
                <button
                  type="button"
                  onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-lg p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-slate-100">
          <button
            type="submit"
            disabled={isUploading}
            className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-10 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 transition-all"
          >
            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Guardar en Azure SQL
          </button>
        </div>
      </form>
    </div>
  );
};

export default SampleForm;
