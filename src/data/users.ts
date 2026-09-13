import { User } from '../types';

export const SYSTEM_USERS: User[] = [
  {
    id: 'usr-admin-01',
    name: 'Dr. Ramesh Chandra (Admin)',
    email: 'admin.metrology@nic.in',
    role: 'admin',
    department: 'Directorate of Legal Metrology, Ministry of Consumer Affairs',
    badgeNumber: 'DLM-HQ-001',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'usr-officer-01',
    name: 'Sanjay Sharma (Officer)',
    email: 'sanjay.sharma@lm.gov.in',
    role: 'officer',
    department: 'Enforcement Division, Delhi NCR Circle',
    badgeNumber: 'LM-DEL-2024-88',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'usr-inspector-01',
    name: 'Rajesh Verma (Inspector)',
    email: 'rajesh.verma@lm.gov.in',
    role: 'inspector',
    department: 'Market Inspection Wing, Bengaluru South',
    badgeNumber: 'INSP-BLR-2025-07',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'usr-viewer-01',
    name: 'Pooja Nair (Auditor / Viewer)',
    email: 'pooja.nair@audit.gov.in',
    role: 'viewer',
    department: 'Quality & Audit Compliance Bureau',
    badgeNumber: 'AUD-MUM-2026-19',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  },
];

export const USERS = SYSTEM_USERS;
