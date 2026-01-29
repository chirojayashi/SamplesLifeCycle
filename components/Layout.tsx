
import React, { useState } from 'react';
import { LayoutDashboard, PlusCircle, Package, Settings, LogOut, Users, ShieldCheck, UserCircle, Cloud, CloudOff, Menu, X, Activity } from 'lucide-react';
import { UserRole, UserSession } from '../types';
import { AzureService } from '../services/azureService';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  setView: (view: any) => void;
  currentUser: UserSession;
  onRoleChange: (role: UserRole) => void;
  onLogout: () => void;
  isOnline?: boolean; // Nueva prop para estado real
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, setView, currentUser, onRoleChange, onLogout, isOnline = true }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const canManageSamples = currentUser.role === UserRole.ROLE1_SAMPLES || currentUser.role === UserRole.ADMIN;
  const isAdmin = currentUser.role === UserRole.ADMIN;
  const isConfigured = AzureService.isConfigured();

  const closeSidebar = () => setIsSidebarOpen(false);

  const navItems = (
    <>
      <div className="text-[10px] font-bold text-indigo-500 uppercase px-4 mb-2 tracking-widest">General</div>
      <button
        onClick={() => { setView('dashboard'); closeSidebar(); }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
          activeView === 'dashboard' ? 'bg-indigo-800 text-white shadow-inner translate-x-1' : 'text-indigo-200 hover:bg-indigo-900'
        }`}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span className="text-sm font-bold">Dashboard</span>
      </button>

      {canManageSamples && (
        <>
          <div className="text-[10px] font-bold text-indigo-500 uppercase px-4 mt-6 mb-2 tracking-widest">Operaciones</div>
          <button
            onClick={() => { setView('new-sample'); closeSidebar(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeView === 'new-sample' ? 'bg-indigo-800 text-white shadow-inner translate-x-1' : 'text-indigo-200 hover:bg-indigo-900'
            }`}
          >
            <PlusCircle className="w-5 h-5" />
            <span className="text-sm font-bold">Nueva Muestra</span>
          </button>
        </>
      )}

      {isAdmin && (
        <>
          <div className="text-[10px] font-bold text-indigo-500 uppercase px-4 mt-6 mb-2 tracking-widest">Administración</div>
          <button
            onClick={() => { setView('providers'); closeSidebar(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeView === 'providers' ? 'bg-indigo-800 text-white shadow-inner translate-x-1' : 'text-indigo-200 hover:bg-indigo-900'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-sm font-bold">Proveedores</span>
          </button>
          <button
            onClick={() => { setView('users'); closeSidebar(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeView === 'users' ? 'bg-indigo-800 text-white shadow-inner translate-x-1' : 'text-indigo-200 hover:bg-indigo-900'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm font-bold">Usuarios</span>
          </button>
        </>
      )}
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-indigo-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-indigo-950 text-white flex flex-col shadow-2xl z-50 transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-600 p-2 rounded-xl">
                <Package className="w-6 h-6 text-white" />
             </div>
             <div>
                <h1 className="text-xl font-black tracking-tight leading-none">Sole-Rinnai</h1>
                <p className="text-indigo-400 text-[8px] uppercase tracking-widest font-bold mt-1">Industrial PLM</p>
             </div>
          </div>
          <button onClick={closeSidebar} className="lg:hidden text-indigo-300 p-1">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems}
        </nav>

        <div className="p-4 border-t border-indigo-900 bg-indigo-950/50">
          <div className="bg-indigo-900/50 rounded-2xl p-4 mb-2 border border-indigo-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-xs font-black border border-indigo-400 shadow-lg shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black truncate text-white">{currentUser.name}</p>
                <p className="text-[9px] text-indigo-400 font-bold truncate flex items-center gap-1 uppercase tracking-tighter">
                   <ShieldCheck className="w-3 h-3" /> {currentUser.role}
                </p>
              </div>
            </div>
            {isAdmin && (
              <select 
                className="w-full mt-3 bg-indigo-800/50 border border-indigo-700 text-[9px] rounded-lg p-1.5 outline-none text-indigo-200 cursor-pointer font-bold"
                value={currentUser.role}
                onChange={(e) => onRoleChange(e.target.value as UserRole)}
              >
                <option value={UserRole.ADMIN}>Vista: Admin</option>
                <option value={UserRole.ROLE1_SAMPLES}>Vista: Muestras</option>
                <option value={UserRole.ROLE2_INSPECTIONS}>Vista: Inspección</option>
                <option value={UserRole.ROLE3_TECHNICAL}>Vista: Fichas</option>
              </select>
            )}
          </div>
          
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 transition-colors text-sm font-black uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4" />
            Salir
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col relative w-full">
        <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight line-clamp-1">
              {activeView === 'dashboard' && 'Panel de Control'}
              {activeView === 'providers' && 'Proveedores'}
              {activeView === 'users' && 'Usuarios'}
              {activeView === 'new-sample' && 'Nueva Muestra'}
              {activeView === 'sample-detail' && 'Detalle Producto'}
            </h2>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-6">
             {/* Dynamic Connectivity Badge */}
             <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm transition-all ${
               isOnline ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'
             }`}>
                {isOnline ? (
                  <>
                    <Cloud className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">Azure Cloud: OK</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-tighter">Modo Local</span>
                  </>
                )}
             </div>
             
             {/* Mobile status icon */}
             <div className="sm:hidden">
                {isOnline ? <Cloud className="w-5 h-5 text-emerald-500" /> : <Activity className="w-5 h-5 text-amber-500" />}
             </div>
             
             <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
             <div className="flex items-center gap-3 pl-2">
                <div className="hidden md:block text-right">
                   <p className="text-[10px] font-black text-slate-800 uppercase leading-none">{currentUser.name}</p>
                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Online Now</p>
                </div>
                <UserCircle className="w-9 h-9 text-slate-300" />
             </div>
          </div>
        </header>

        <div className="p-4 sm:p-8 flex-1 animate-in fade-in duration-300 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
