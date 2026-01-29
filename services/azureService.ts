
const AZURE_SQL_API_ENDPOINT = "/api"; 

const MOCK_DATA = {
  providers: [
    { id: 'p1', name: 'Sole-Rinnai Global', shortName: 'Sole Corp', code: 'SR-001', country: 'Perú', logoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100' }
  ],
  users: [
    { id: 'u1', name: 'Administrador Sistema', email: 'admin@sole.com.pe', password: 'sole2024', role: 'Administrador' },
    { id: 'u2', name: 'Juan Sanchez', email: 'juan@sole.com.pe', password: 'sole2024', role: 'Gestor de Muestras' }
  ],
  samples: [],
  inspections: [],
  sheets: []
};

export const AzureService = {
  isConfigured(): boolean {
    return !!AZURE_SQL_API_ENDPOINT;
  },

  async checkHealth(): Promise<boolean> {
    try {
      const resp = await fetch(`${AZURE_SQL_API_ENDPOINT}/health`);
      return resp.ok;
    } catch {
      return false;
    }
  },

  async login(email: string, password: string): Promise<any> {
    console.log(`🌐 Intentando login en Azure SQL para: ${email}`);
    try {
      const response = await fetch(`${AZURE_SQL_API_ENDPOINT}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        const userData = await response.json();
        console.log("✅ Login confirmado por la base de datos.");
        return userData;
      }
      
      const err = await response.json();
      // Si el error es 401, las credenciales están mal y no deberíamos hacer fallback silencioso
      if (response.status === 401) {
        throw new Error(err.error || "Credenciales incorrectas.");
      }
      
      throw new Error(err.error || "Error del servidor.");
    } catch (error: any) {
      console.warn("⚠️ Azure Login falló. Verificando datos locales (Offline Mode)...", error.message);
      
      const user = MOCK_DATA.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (user) {
        console.log("ℹ️ Acceso concedido mediante MOCK_DATA (Modo Local).");
        return user;
      }
      
      throw error;
    }
  },

  async uploadFile(file: File): Promise<string> {
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const response = await fetch(`${AZURE_SQL_API_ENDPOINT}/upload-blob`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, contentType: file.type, base64Data: base64.split(',')[1] })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Error en la subida.");
      }
      const { url } = await response.json();
      return url;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  },

  async fetchFromSql(type: 'samples' | 'inspections' | 'sheets' | 'providers' | 'users'): Promise<any[]> {
    try {
      const response = await fetch(`${AZURE_SQL_API_ENDPOINT}/${type}`);
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem(`sole_cache_${type}`, JSON.stringify(data));
        return data;
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
    }
    const cached = localStorage.getItem(`sole_cache_${type}`);
    if (cached) return JSON.parse(cached);
    const initial = (MOCK_DATA as any)[type] || [];
    return initial;
  },

  async saveToSql(type: 'sample' | 'inspection' | 'sheet' | 'provider', data: any): Promise<void> {
    const collectionName = type === 'provider' ? 'providers' : `${type}s`;
    try {
      await fetch(`${AZURE_SQL_API_ENDPOINT}/${collectionName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error(`Error saving ${type}:`, error);
    }
  },

  async updateInSql(type: 'sample' | 'inspection' | 'sheet' | 'provider', data: any): Promise<void> {
    const collectionName = type === 'provider' ? 'providers' : `${type}s`;
    try {
      await fetch(`${AZURE_SQL_API_ENDPOINT}/${collectionName}/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error(`Error updating ${type}:`, error);
    }
  },

  async deleteFromSql(type: 'sample' | 'inspection' | 'sheet' | 'provider', id: string): Promise<void> {
    const collectionName = type === 'provider' ? 'providers' : `${type}s`;
    try {
      await fetch(`${AZURE_SQL_API_ENDPOINT}/${collectionName}/${id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
    }
  }
};
