
import React, { useState, useMemo, useEffect, Suspense, lazy } from 'react';
import Layout from './components/Layout';
import Login from './components/Login';
import { AppView, Sample, Inspection, TechnicalSheet, SampleStatus, Provider, UserRole, UserSession, User } from './types';
import { Package, ClipboardList, BookOpen, Cloud, Users, ShieldCheck, Loader2, ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react';
import { AzureService } from './services/azureService';

const SampleForm = lazy(() => import('./components/SampleForm'));
const SampleDetail = lazy(() => import('./components/SampleDetail'));
const ProviderManager = lazy(() => import('./components/ProviderManager'));
const UserManager = lazy(() => import('./components/UserManager'));

const LoadingView = () => (
  <div className="flex flex-col items-center justify-center py-20 gap-4">
    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cargando módulo...</p>
  </div>
);

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  
  const [view, setView] = useState<AppView>('dashboard');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [sheets, setSheets] = useState<TechnicalSheet[]>([]);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{message: string, type: 'success' | 'error' | 'syncing' | null}>({message: '', type: null});

  useEffect(() => {
    const loadInitialData = async () => {
      setIsSyncing(true);
      try {
        const isHealthy = await AzureService.checkHealth();
        setIsOnline(isHealthy);

        const results = await Promise.allSettled([
          AzureService.fetchFromSql('samples'),
          AzureService.fetchFromSql('providers'),
          AzureService.fetchFromSql('inspections'),
          AzureService.fetchFromSql('sheets'),
          AzureService.fetchFromSql('users')
        ]);

        if (results[0].status === 'fulfilled') setSamples(results[0].value);
        if (results[1].status === 'fulfilled') setProviders(results[1].value);
        if (results[2].status === 'fulfilled') setInspections(results[2].value);
        if (results[3].status === 'fulfilled') setSheets(results[3].value);
        if (results[4].status === 'fulfilled') setUsers(results[4].value);
      } finally {
        setIsInitializing(false);
        setIsSyncing(false);
      }
    };
    loadInitialData();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' | 'syncing', duration = 3000) => {
    setSyncStatus({message, type});
    if (type !== 'syncing') {
      setTimeout(() => setSyncStatus({message: '', type: null}), duration);
    }
  };

  const handleLogin = (user: any) => {
    setCurrentUser({ 
      name: user.name, 
      role: user.role as UserRole, 
      email: user.email, 
      avatar: user.avatarUrl 
    });
    setIsAuthenticated(true);
    setView('dashboard');
  };

  const handleLogout = () => { setIsAuthenticated(false); setCurrentUser(null); setView('login'); };

  const handleRegisterSample = async (sample: Sample) => {
    setIsSyncing(true);
    showNotification('Guardando en Azure SQL...', 'syncing');
    try {
      setSamples(prev => [sample, ...prev]);
      await AzureService.saveToSql('sample', sample);
      showNotification('Muestra registrada correctamente', 'success');
      setView('dashboard');
    } catch (err) {
      showNotification('Error de red. Guardado localmente', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddInspection = async (sampleId: string, observations: string, images: string[]) => {
    setIsSyncing(true);
    showNotification('Registrando inspección...', 'syncing');
    const version = (inspections.filter(i => i.sampleId === sampleId).length) + 1;
    const newInspection: Inspection = {
      id: Math.random().toString(36).substr(2, 9),
      sampleId,
      version,
      date: new Date().toISOString().split('T')[0],
      user: currentUser?.name || 'Sistema',
      observations,
      images,
      documents: []
    };

    try {
      setInspections(prev => [newInspection, ...prev]);
      setSamples(prev => prev.map(s => s.id === sampleId ? { ...s, status: SampleStatus.INSPECTION } : s));
      await AzureService.saveToSql('inspection', newInspection);
      showNotification('Inspección registrada con éxito', 'success');
    } catch (err) {
      showNotification('Solo guardado local (Offline)', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddSheet = async (sampleId: string, soleCode: string, observations: string, pdfUrl?: string) => {
    setIsSyncing(true);
    showNotification('Generando ficha técnica...', 'syncing');
    const version = (sheets.filter(s => s.sampleId === sampleId).length) + 1;
    const newSheet: TechnicalSheet = {
      id: Math.random().toString(36).substr(2, 9),
      sampleId,
      soleCode,
      version,
      date: new Date().toISOString().split('T')[0],
      user: currentUser?.name || 'Sistema',
      observations,
      pdfUrl
    };

    try {
      setSheets(prev => [newSheet, ...prev]);
      setSamples(prev => prev.map(s => s.id === sampleId ? { ...s, status: SampleStatus.TECHNICAL } : s));
      await AzureService.saveToSql('sheet', newSheet);
      showNotification(`Ficha V${version} publicada`, 'success');
    } catch (err) {
      showNotification('Offline: Ficha guardada localmente', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddProvider = async (provider: Provider) => {
    setProviders(prev => [provider, ...prev]);
    await AzureService.saveToSql('provider', provider);
  };

  const handleUpdateProvider = async (provider: Provider) => {
    setProviders(prev => prev.map(p => p.id === provider.id ? provider : p));
    await AzureService.updateInSql('provider', provider);
  };

  const handleDeleteProvider = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este proveedor?')) {
      setProviders(prev => prev.filter(p => p.id !== id));
      await AzureService.deleteFromSql('provider', id);
    }
  };

  const activeSample = samples.find(s => s.id === selectedSampleId);
  const activeInspections = inspections.filter(i => i.sampleId === selectedSampleId);
  const activeSheets = sheets.filter(s => s.sampleId === selectedSampleId);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-indigo-950 flex flex-col items-center justify-center gap-4 text-white">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
        <p className="text-xs font-bold uppercase tracking-[0.3em]">Cargando Entorno Industrial...</p>
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) { return <Login onLogin={handleLogin} />; }

  return (
    <Layout 
      activeView={view} 
      setView={setView} 
      currentUser={currentUser} 
      onLogout={handleLogout} 
      isOnline={isOnline}
      onRoleChange={(role) => setCurrentUser({ ...currentUser, role })}
    >
      {syncStatus.type && (
        <div className={`fixed top-24 right-6 z-[100] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-4 border ${
          syncStatus.type === 'success' ? 'bg-emerald-600 border-emerald-400 text-white' : 
          syncStatus.type === 'error' ? 'bg-amber-600 border-amber-400 text-white' :
          'bg-indigo-600 border-indigo-400 text-white animate-pulse'
        }`}>
          {syncStatus.type === 'success' && <CheckCircle className="w-4 h-4" />}
          {syncStatus.type === 'error' && <AlertTriangle className="w-4 h-4" />}
          {syncStatus.type === 'syncing' && <Cloud className="w-4 h-4" />}
          <span className="text-[10px] font-black uppercase tracking-widest">{syncStatus.message}</span>
        </div>
      )}

      <Suspense fallback={<LoadingView />}>
        {view === 'dashboard' && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-4">
                <div className="bg-blue-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-blue-600 shrink-0"><Package className="w-5 h-5" /></div>
                <div><p className="text-xl sm:text-2xl font-black text-slate-800">{samples.length}</p><p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Muestras</p></div>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-4">
                <div className="bg-emerald-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-emerald-600 shrink-0"><Users className="w-5 h-5" /></div>
                <div><p className="text-xl sm:text-2xl font-black text-slate-800">{providers.length}</p><p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Proveedores</p></div>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-4">
                <div className="bg-orange-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-orange-600 shrink-0"><ClipboardList className="w-5 h-5" /></div>
                <div><p className="text-xl sm:text-2xl font-black text-slate-800">{inspections.length}</p><p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Inspecciones</p></div>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-4">
                <div className="bg-indigo-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-indigo-600 shrink-0"><BookOpen className="w-5 h-5" /></div>
                <div><p className="text-xl sm:text-2xl font-black text-slate-800">{sheets.length}</p><p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Fichas</p></div>
              </div>
            </div>

            <div className="bg-white rounded-[1.5rem] sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Registros de Producción</h4>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-6 sm:px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                      <th className="px-6 sm:px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Producto</th>
                      <th className="px-6 sm:px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Fabricante</th>
                      <th className="px-6 sm:px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                      <th className="px-6 sm:px-8 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {samples.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 sm:px-8 py-4 font-black text-indigo-600 text-[10px]">{s.sequentialId}</td>
                        <td className="px-6 sm:px-8 py-4 font-bold text-slate-800 text-xs truncate max-w-[150px]">{s.name}</td>
                        <td className="px-6 sm:px-8 py-4 text-[10px] font-medium text-slate-500">{s.providerName}</td>
                        <td className="px-6 sm:px-8 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tight border ${
                            s.status === SampleStatus.COMPLETED ? 'bg-green-50 text-green-700 border-green-100' : 
                            s.status === SampleStatus.TECHNICAL ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            'bg-indigo-50 text-indigo-700 border-indigo-100'
                          }`}>{s.status}</span>
                        </td>
                        <td className="px-6 sm:px-8 py-4 text-right">
                          <button onClick={() => { setSelectedSampleId(s.id); setView('sample-detail'); }} className="bg-white border border-slate-200 p-2 rounded-lg text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><ChevronRight className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {view === 'providers' && (
          <ProviderManager 
            providers={providers} 
            onAdd={handleAddProvider} 
            onUpdate={handleUpdateProvider} 
            onDelete={handleDeleteProvider} 
          />
        )}
        {view === 'users' && <UserManager users={users} onAdd={() => {}} onDelete={() => {}} />}
        {view === 'new-sample' && <SampleForm onSave={handleRegisterSample} providers={providers} />}
        {view === 'sample-detail' && activeSample && (
          <SampleDetail
            sample={activeSample}
            inspections={activeInspections}
            sheets={activeSheets}
            currentUser={currentUser}
            onAddInspection={handleAddInspection}
            onAddSheet={handleAddSheet}
          />
        )}
      </Suspense>
    </Layout>
  );
};

export default App;
