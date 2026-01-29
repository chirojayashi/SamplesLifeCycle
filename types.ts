
export enum UserRole {
  ROLE1_SAMPLES = 'Gestor de Muestras',
  ROLE2_INSPECTIONS = 'Gestor de Inspecciones',
  ROLE3_TECHNICAL = 'Gestor de Fichas',
  ADMIN = 'Administrador'
}

export interface UserSession {
  name: string;
  role: UserRole;
  email: string;
  avatar?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatarUrl?: string;
}

export enum SampleStatus {
  REGISTERED = 'Registrado',
  INSPECTION = 'En Inspección',
  TECHNICAL = 'En Ficha Técnica',
  COMPLETED = 'Completado'
}

export interface Provider {
  id: string;
  name: string;
  shortName: string;
  code: string;
  logoUrl?: string;
  country: string;
}

export interface Sample {
  id: string;
  sequentialId: string;
  name: string;
  providerId: string;
  providerName: string;
  registrationDate: string;
  user: string;
  description: string;
  category: string;
  type: string;
  status: SampleStatus;
  images: string[];
}

export interface Inspection {
  id: string;
  sampleId: string;
  version: number;
  date: string;
  user: string;
  observations: string;
  images: string[];
  documents: string[];
  pdfUrl?: string;
}

export interface TechnicalSheet {
  id: string;
  sampleId: string;
  soleCode: string;
  version: number;
  date: string;
  user: string;
  observations: string;
  pdfUrl?: string;
}

export type AppView = 'login' | 'dashboard' | 'sample-detail' | 'new-sample' | 'providers' | 'users';
