
import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  server: process.env.DB_SERVER,
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
  options: { 
    encrypt: true, 
    trustServerCertificate: false 
  }
};

async function runSeed() {
  console.log("🚀 Iniciando actualización de esquemas en Azure SQL (Esquema ID)...");
  
  try {
    let pool = await sql.connect(sqlConfig);
    console.log("✅ Conexión establecida.");

    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'ID')
      BEGIN
        EXEC('CREATE SCHEMA ID')
      END

      DROP TABLE IF EXISTS ID.Sheets;
      DROP TABLE IF EXISTS ID.Inspections;
      DROP TABLE IF EXISTS ID.Samples;
      DROP TABLE IF EXISTS ID.Providers;
      DROP TABLE IF EXISTS ID.Users;
    `);

    await pool.request().query(`
      CREATE TABLE ID.Users (
        Id NVARCHAR(50) PRIMARY KEY,
        Name NVARCHAR(255) NOT NULL,
        Email NVARCHAR(255) NOT NULL UNIQUE,
        Password NVARCHAR(255) NOT NULL,
        Role NVARCHAR(50) NOT NULL,
        AvatarUrl NVARCHAR(MAX)
      );

      CREATE TABLE ID.Providers (
        Id NVARCHAR(50) PRIMARY KEY,
        Name NVARCHAR(255) NOT NULL,
        ShortName NVARCHAR(100),
        Code NVARCHAR(50) UNIQUE,
        LogoUrl NVARCHAR(MAX),
        Country NVARCHAR(100)
      );

      CREATE TABLE ID.Samples (
        Id NVARCHAR(50) PRIMARY KEY,
        SequentialId NVARCHAR(50) NOT NULL UNIQUE,
        Name NVARCHAR(255) NOT NULL,
        ProviderId NVARCHAR(50) FOREIGN KEY REFERENCES ID.Providers(Id),
        ProviderName NVARCHAR(255),
        RegistrationDate DATETIME2 DEFAULT GETDATE(),
        UserName NVARCHAR(100),
        Description NVARCHAR(MAX),
        Category NVARCHAR(100),
        Type NVARCHAR(100),
        Status NVARCHAR(50),
        ImagesJson NVARCHAR(MAX)
      );

      CREATE TABLE ID.Inspections (
        Id NVARCHAR(50) PRIMARY KEY,
        SampleId NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES ID.Samples(Id),
        Version INT NOT NULL,
        Date DATETIME2 DEFAULT GETDATE(),
        UserName NVARCHAR(255),
        Observations NVARCHAR(MAX),
        PdfUrl NVARCHAR(MAX),
        ImagesJson NVARCHAR(MAX)
      );

      CREATE TABLE ID.Sheets (
        Id NVARCHAR(50) PRIMARY KEY,
        SampleId NVARCHAR(50) NOT NULL FOREIGN KEY REFERENCES ID.Samples(Id),
        SoleCode NVARCHAR(100),
        Version INT NOT NULL,
        Date DATETIME2 DEFAULT GETDATE(),
        UserName NVARCHAR(255),
        Observations NVARCHAR(MAX),
        PdfUrl NVARCHAR(MAX)
      );
    `);

    await pool.request().query(`
      INSERT INTO ID.Users (Id, Name, Email, Password, Role) VALUES 
      ('u1', 'Administrador', 'admin@sole.com.pe', 'sole2024', 'Administrador'),
      ('u2', 'Juan Sanchez', 'juan@sole.com.pe', 'sole2024', 'Gestor de Muestras'),
      ('u3', 'Ana Martinez', 'ana@sole.com.pe', 'sole2024', 'Gestor de Inspecciones'),
      ('u4', 'Carlos Ruiz', 'carlos@sole.com.pe', 'sole2024', 'Gestor de Fichas');

      INSERT INTO ID.Providers (Id, Name, ShortName, Code, Country, LogoUrl) VALUES 
      ('p1', 'TermoHogar Solutions S.A.', 'TermoHogar', 'PRV-ESP-001', 'España', 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100'),
      ('p2', 'Global Tech Manufacturing', 'GlobalTech', 'PRV-GER-002', 'Alemania', 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=100');
    `);

    console.log("✨ Base de datos actualizada con esquema ID y credenciales @sole.com.pe.");
    (process as any).exit(0);
  } catch (err) {
    console.error("❌ Error en Seeding:", err);
    (process as any).exit(1);
  }
}

runSeed();
