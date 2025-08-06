import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tqxmehhlsexmfznymsgm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxeG1laGhsc2V4bWZ6bnltc2dtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTA1Mzk3MiwiZXhwIjoyMDY2NjI5OTcyfQ.N9fZ4htxX-RzNZMzWj0apWbqbKUmIrdEMIcNuFs60b8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  global: {
    headers: {
      'x-application-name': 'upca-system'
    }
  }
});

// Función para simular auth.uid() en las políticas RLS
export const getCurrentUserId = (): string | null => {
  return localStorage.getItem('current_user_id');
};

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash: string;
          role: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_permissions: {
        Row: {
          id: string;
          user_id: string;
          module: string;
          can_create: boolean;
          can_read: boolean;
          can_update: boolean;
          can_delete: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          module: string;
          can_create?: boolean;
          can_read?: boolean;
          can_update?: boolean;
          can_delete?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          module?: string;
          can_create?: boolean;
          can_read?: boolean;
          can_update?: boolean;
          can_delete?: boolean;
        };
      };
      novedades: {
        Row: {
          id: string;
          cedula: string;
          nombre: string;
          tipo_planta: string;
          fecha_inicio: string;
          hora_inicio: string;
          fecha_fin: string;
          hora_fin: string;
          horas_ausencia: number;
          tipo_novedad: string;
          observacion: string | null;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          cedula: string;
          nombre: string;
          tipo_planta: string;
          fecha_inicio: string;
          hora_inicio: string;
          fecha_fin: string;
          hora_fin: string;
          horas_ausencia: number;
          tipo_novedad: string;
          observacion?: string | null;
          created_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          cedula?: string;
          nombre?: string;
          tipo_planta?: string;
          fecha_inicio?: string;
          hora_inicio?: string;
          fecha_fin?: string;
          hora_fin?: string;
          horas_ausencia?: number;
          tipo_novedad?: string;
          observacion?: string | null;
          created_at?: string;
          created_by?: string;
        };
      };
      incapacidades: {
        Row: {
          id: string;
          numero_id: string;
          nombre_completo: string;
          fecha_inicio: string;
          fecha_fin: string;
          dias_incapacidad: number;
          diagnostico: string;
          tipo_incapacidad: string;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          numero_id: string;
          nombre_completo: string;
          fecha_inicio: string;
          fecha_fin: string;
          dias_incapacidad: number;
          diagnostico: string;
          tipo_incapacidad: string;
          created_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          numero_id?: string;
          nombre_completo?: string;
          fecha_inicio?: string;
          fecha_fin?: string;
          dias_incapacidad?: number;
          diagnostico?: string;
          tipo_incapacidad?: string;
          created_at?: string;
          created_by?: string;
        };
      };
      enfermeria: {
        Row: {
          id: string;
          cedula: string;
          nombre: string;
          cargo: string;
          dependencia: string;
          sintomas: string;
          antecedentes_salud: string;
          observaciones: string | null;
          salida: string;
          fecha: string;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          cedula: string;
          nombre: string;
          cargo: string;
          dependencia: string;
          sintomas: string;
          antecedentes_salud: string;
          observaciones?: string | null;
          salida?: string;
          fecha?: string;
          created_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          cedula?: string;
          nombre?: string;
          cargo?: string;
          dependencia?: string;
          sintomas?: string;
          antecedentes_salud?: string;
          observaciones?: string | null;
          salida?: string;
          fecha?: string;
          created_at?: string;
          created_by?: string;
        };
      };
      accidentes_trabajo: {
        Row: {
          id: string;
          cedula: string;
          nombre: string;
          cargo: string;
          dependencia: string;
          tipo_at: string;
          tipo_lesion: string;
          parte_cuerpo_afectada: string;
          fecha: string;
          hora: string;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          cedula: string;
          nombre: string;
          cargo: string;
          dependencia: string;
          tipo_at: string;
          tipo_lesion: string;
          parte_cuerpo_afectada: string;
          fecha: string;
          hora: string;
          created_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          cedula?: string;
          nombre?: string;
          cargo?: string;
          dependencia?: string;
          tipo_at?: string;
          tipo_lesion?: string;
          parte_cuerpo_afectada?: string;
          fecha?: string;
          hora?: string;
          created_at?: string;
          created_by?: string;
        };
      };
    };
  };
};