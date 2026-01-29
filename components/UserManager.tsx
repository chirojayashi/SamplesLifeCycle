
import React, { useState } from 'react';
import { UserPlus, Shield, Mail, User as UserIcon, Trash2, X, Save, ShieldCheck } from 'lucide-react';
import { User, UserRole } from '../types';

interface UserManagerProps {
  users: User[];
  onAdd: (user: User) => void;
  onDelete: (id: string) => void;
}

const ROLE_COLORS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'bg-purple-100 text-purple-700 border-purple-200',
  [UserRole.ROLE1_SAMPLES]: 'bg-blue-100 text-blue-700 border-blue-200',
  [UserRole.ROLE2_INSPECTIONS]: 'bg-orange-100 text-orange-700 border-orange-200',
  [UserRole.ROLE3_TECHNICAL]: 'bg-indigo-100 text-indigo-700 border-indigo-200',
};

const UserManager: React.FC<UserManagerProps> = ({ users, onAdd, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: UserRole.ROLE1_SAMPLES,
    avatarUrl: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      ...formData
    });
    setFormData({ name: '', email: '', role: UserRole.ROLE1_SAMPLES, avatarUrl: '' });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            Control de Usuarios y Accesos
          </h3>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-tight">Administración centralizada de roles del sistema</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
        >
          <UserPlus className="w-4 h-4" /> Nuevo Usuario
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl border-2 border-indigo-100 shadow-xl animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-black text-indigo-900 uppercase text-xs tracking-widest">Crear Nuevo Acceso</h4>
            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase">Nombre Completo</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  required 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm transition-all" 
                  placeholder="Ej: Ana Martinez"
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase">Correo Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  required 
                  type="email"
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm transition-all" 
                  placeholder="ana@empresa.com"
                  value={formData.email} 
                  onChange={e => setFormData({ ...formData, email: e.target.value })} 
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase">Rol del Sistema</label>
              <div className="relative">
                <Shield className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <select 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm transition-all appearance-none"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                >
                  {Object.values(UserRole).map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="md:col-span-3 flex justify-end">
              <button type="submit" className="bg-slate-900 text-white px-8 py-2.5 rounded-xl font-black text-xs uppercase hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-200">
                <Save className="w-4 h-4" /> Confirmar Alta
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {users.map((user) => (
          <div key={user.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all flex items-center gap-4 group">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 flex-shrink-0">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <span className="text-indigo-600 font-black text-xl">{user.name.charAt(0)}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h5 className="font-black text-slate-800 leading-none truncate">{user.name}</h5>
                <button 
                  onClick={() => onDelete(user.id)} 
                  className="text-red-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-slate-400 font-medium truncate mb-2">{user.email}</p>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${ROLE_COLORS[user.role]}`}>
                {user.role}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManager;
