
import express from 'express';
import sql from 'mssql';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { ContainerClient, BlobServiceClient } from "@azure/storage-blob";
import { Buffer } from 'buffer';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors() as any);
app.use(compression() as any);
app.use(express.json({ limit: '50mb' }) as any);

const STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const STORAGE_SAS_URL_ENV = process.env.AZURE_STORAGE_SAS_URL;
const STORAGE_ACCOUNT_NAME = "soleblob1";
const CONTAINER_NAME = "industrial-plm";
const DEFAULT_SAS_TOKEN = "sp=rcw&st=2024-01-28T15:42:47Z&se=2030-01-28T23:57:47Z&spr=https&sv=2024-11-04&sr=c&sig=XJxSbZb%2FCMbJlmpBOPNbmczPHCKVx0kenZBBV6u0eJs%3D";

const getContainerClient = () => {
  if (STORAGE_CONNECTION_STRING) {
    const blobServiceClient = BlobServiceClient.fromConnectionString(STORAGE_CONNECTION_STRING);
    return blobServiceClient.getContainerClient(CONTAINER_NAME);
  }
  const sasUrl = STORAGE_SAS_URL_ENV || `https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${CONTAINER_NAME}?${DEFAULT_SAS_TOKEN}`;
  return new ContainerClient(sasUrl);
};

const sqlConfig: sql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  server: process.env.DB_SERVER || '',
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
  options: { encrypt: true, trustServerCertificate: false }
};

let pool: sql.ConnectionPool | null = null;

const getPool = async () => {
  if (pool && pool.connected) return pool;
  try {
    console.log("🔌 Intentando conectar a Azure SQL...");
    pool = await new sql.ConnectionPool(sqlConfig).connect();
    console.log("✅ Conexión SQL exitosa.");
    return pool;
  } catch (err) {
    console.error("❌ Error de conexión SQL:", err);
    pool = null;
    throw err;
  }
};

const handleSqlRequest = async (res: any, queryFn: (pool: sql.ConnectionPool) => Promise<any>) => {
  try {
    const activePool = await getPool();
    const result = await queryFn(activePool);
    res.json(result);
  } catch (err: any) {
    console.error("SQL Request Error:", err);
    res.status(500).json({ error: "Error en la operación de base de datos.", details: err.message });
  }
};

// --- ENDPOINTS DE SALUD ---
app.get('/api/health', async (req, res) => {
  try {
    const activePool = await getPool();
    await activePool.request().query("SELECT 1 as ok");
    res.json({ status: "online", database: "connected" });
  } catch (err: any) {
    res.status(503).json({ status: "degraded", error: err.message });
  }
});

// --- LOGIN ---
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Faltan credenciales." });

  try {
    const activePool = await getPool();
    const result = await activePool.request()
      .input('email', sql.NVarChar, email)
      .input('pwd', sql.NVarChar, password)
      .query("SELECT Id, Name, Email, Role, AvatarUrl FROM ID.Users WHERE Email = @email AND Password = @pwd");
    
    if (result.recordset.length > 0) {
      const u = result.recordset[0];
      res.json({ id: u.Id, name: u.Name, email: u.Email, role: u.Role, avatarUrl: u.AvatarUrl });
    } else {
      res.status(401).json({ error: "Usuario o contraseña incorrectos." });
    }
  } catch (err: any) {
    res.status(500).json({ error: "Error de servidor en login." });
  }
});

// --- FETCH ENDPOINTS CON MAPEO camelCase ---
app.get('/api/samples', (req, res) => handleSqlRequest(res, async (p) => {
  const r = await p.request().query("SELECT * FROM ID.Samples ORDER BY RegistrationDate DESC");
  return r.recordset.map(s => ({
    id: s.Id,
    sequentialId: s.SequentialId,
    name: s.Name,
    providerId: s.ProviderId,
    providerName: s.ProviderName,
    registrationDate: s.RegistrationDate ? new Date(s.RegistrationDate).toISOString().split('T')[0] : '',
    user: s.UserName,
    description: s.Description,
    category: s.Category,
    type: s.Type,
    status: s.Status,
    images: s.ImagesJson ? JSON.parse(s.ImagesJson) : []
  }));
}));

app.get('/api/providers', (req, res) => handleSqlRequest(res, async (p) => {
  const r = await p.request().query("SELECT * FROM ID.Providers ORDER BY Name ASC");
  return r.recordset.map(pv => ({
    id: pv.Id,
    name: pv.Name,
    shortName: pv.ShortName,
    code: pv.Code,
    logoUrl: pv.LogoUrl,
    country: pv.Country
  }));
}));

app.get('/api/inspections', (req, res) => handleSqlRequest(res, async (p) => {
  const r = await p.request().query("SELECT * FROM ID.Inspections ORDER BY Date DESC");
  return r.recordset.map(i => ({
    id: i.Id,
    sampleId: i.SampleId,
    version: i.Version,
    date: i.Date ? new Date(i.Date).toISOString().split('T')[0] : '',
    user: i.UserName,
    observations: i.Observations,
    pdfUrl: i.PdfUrl,
    images: i.ImagesJson ? JSON.parse(i.ImagesJson) : []
  }));
}));

app.get('/api/sheets', (req, res) => handleSqlRequest(res, async (p) => {
  const r = await p.request().query("SELECT * FROM ID.Sheets ORDER BY Date DESC");
  return r.recordset.map(sh => ({
    id: sh.Id,
    sampleId: sh.SampleId,
    soleCode: sh.SoleCode,
    version: sh.Version,
    date: sh.Date ? new Date(sh.Date).toISOString().split('T')[0] : '',
    user: sh.UserName,
    observations: sh.Observations,
    pdfUrl: sh.PdfUrl
  }));
}));

app.get('/api/users', (req, res) => handleSqlRequest(res, async (p) => {
  const r = await p.request().query("SELECT Id, Name, Email, Role, AvatarUrl FROM ID.Users ORDER BY Name ASC");
  return r.recordset.map(u => ({ id: u.Id, name: u.Name, email: u.Email, role: u.Role, avatarUrl: u.AvatarUrl }));
}));

// --- PERSISTENCE ---
app.post('/api/samples', async (req, res) => {
  try {
    const { id, sequentialId, name, providerId, providerName, user, description, category, type, status, images } = req.body;
    const activePool = await getPool();
    await activePool.request()
      .input('id', sql.NVarChar, id).input('sid', sql.NVarChar, sequentialId)
      .input('name', sql.NVarChar, name).input('pid', sql.NVarChar, providerId)
      .input('pname', sql.NVarChar, providerName).input('user', sql.NVarChar, user)
      .input('desc', sql.NVarChar, description).input('cat', sql.NVarChar, category)
      .input('type', sql.NVarChar, type).input('status', sql.NVarChar, status)
      .input('imgs', sql.NVarChar, JSON.stringify(images || []))
      .query(`INSERT INTO ID.Samples (Id, SequentialId, Name, ProviderId, ProviderName, UserName, Description, Category, Type, Status, ImagesJson) VALUES (@id, @sid, @name, @pid, @pname, @user, @desc, @cat, @type, @status, @imgs)`);
    res.status(201).json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post('/api/upload-blob', async (req, res) => {
  try {
    const { fileName, contentType, base64Data } = req.body;
    if (!fileName || !base64Data) return res.status(400).json({ error: "Datos incompletos." });
    const containerClient = getContainerClient();
    const uniqueName = `${Date.now()}-${fileName.replace(/\s+/g, '_')}`;
    const blockBlobClient = containerClient.getBlockBlobClient(uniqueName);
    const buffer = Buffer.from(base64Data, 'base64');
    await blockBlobClient.uploadData(buffer, { blobHTTPHeaders: { blobContentType: contentType } });
    res.status(201).json({ url: blockBlobClient.url.split('?')[0] });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fix: Using 'any' types for the catch-all route to resolve Express type resolution issues (No overload matches this call) 
// and to ensure the 'sendFile' property is accessible in this specific environment.
app.get('*', (req: any, res: any) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Industrial API Server running on port ${PORT}`));
