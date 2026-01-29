
import React, { useState } from 'react';
import { Plus, Users, Globe, Hash, Image as ImageIcon, Save, Trash2, X, Edit2 } from 'lucide-react';
import { Provider } from '../types';

interface ProviderManagerProps {
  providers: Provider[];
  onAdd: (provider: Provider) => void;
  onUpdate: (provider: Provider) => void;
  onDelete: (id: string) => void;
}

const ProviderManager: React.FC<ProviderManagerProps> = ({ providers, onAdd, onUpdate, onDelete }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProviderId, setEditingProviderId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    code: '',
    country: '',
    logoUrl: ''
  });

  const handleEdit = (provider: Provider) => {
    setFormData({
      name: provider.name,
      shortName: provider.shortName,
      code: provider.code,
      country: provider.country,
      logoUrl: provider.logoUrl || ''
    });
    setEditingProviderId(provider.id);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProviderId(null);
    setFormData({ name: '', shortName: '', code: '', country: '', logoUrl: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProviderId) {
      onUpdate({
        id: editingProviderId,
        ...formData
      });
    } else {
      onAdd({
        id: Math.random().toString(36).substr(2, 9),
        ...formData
      });
    }
    handleCloseForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            Maestro de Proveedores
          </h3>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-tight">Registro centralizado de fabricantes y socios comerciales</p>
        </div>
        {!isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
          >
            <Plus className="w-4 h-4" /> Nuevo Proveedor
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-2xl border-2 border-indigo-100 shadow-xl animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-black text-indigo-900 uppercase text-xs tracking-widest">
              {editingProviderId ? 'Editar Proveedor' : 'Registrar Proveedor'}
            </h4>
            <button onClick={handleCloseForm} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Legal</label>
              <div className="relative">
                <Users className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  required 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm transition-all" 
                  placeholder="Ej: TermoHogar Solutions S.A."
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Comercial</label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  required 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm transition-all" 
                  placeholder="Ej: TermoHogar"
                  value={formData.shortName} 
                  onChange={e => setFormData({ ...formData, shortName: e.target.value })} 
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Código ERP</label>
              <div className="relative">
                <Hash className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  required 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm transition-all" 
                  placeholder="PRV-000"
                  value={formData.code} 
                  onChange={e => setFormData({ ...formData, code: e.target.value })} 
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">País / Región</label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  required 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm transition-all" 
                  placeholder="España"
                  value={formData.country} 
                  onChange={e => setFormData({ ...formData, country: e.target.value })} 
                />
              </div>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">URL Logo (Imagen)</label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm transition-all" 
                  placeholder="https://..."
                  value={formData.logoUrl} 
                  onChange={e => setFormData({ ...formData, logoUrl: e.target.value })} 
                />
              </div>
            </div>
            <div className="lg:col-span-3 flex justify-end gap-3 pt-4">
              <button 
                type="button"
                onClick={handleCloseForm}
                className="px-6 py-2.5 rounded-xl font-black text-xs uppercase text-slate-500 hover:bg-slate-100 transition-all"
              >
                Cancelar
              </button>
              <button type="submit" className="bg-slate-900 text-white px-8 py-2.5 rounded-xl font-black text-xs uppercase hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-200">
                <Save className="w-4 h-4" /> {editingProviderId ? 'Actualizar Cambios' : 'Guardar Proveedor'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {providers.map((p) => (
          <div key={p.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200 overflow-hidden">
                {p.logoUrl ? <img src={p.logoUrl} className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-slate-300" />}
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="font-black text-slate-800 leading-none truncate">{p.shortName}</h5>
                <p className="text-[10px] text-indigo-500 font-bold uppercase mt-1 tracking-widest">{p.code}</p>
              </div>
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleEdit(p)}
                  className="text-slate-400 hover:text-indigo-600 transition-colors p-1.5 bg-slate-50 rounded-lg"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => onDelete(p.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1.5 bg-slate-50 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="space-y-2 border-t border-slate-50 pt-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                <Globe className="w-3 h-3 text-indigo-400" /> {p.country}
              </div>
              <p className="text-xs text-slate-400 font-medium truncate">{p.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProviderManager;
