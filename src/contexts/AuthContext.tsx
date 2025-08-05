import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import bcrypt from 'bcryptjs';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  role: string;
}

interface Permission {
  module: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
}

interface AuthContextType {
  user: User | null;
  permissions: Permission[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  hasPermission: (module: string, action: 'create' | 'read' | 'update' | 'delete') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Función para simular uid() en el cliente
const setCurrentUserId = (userId: string | null) => {
  if (userId) {
    localStorage.setItem('current_user_id', userId);
  } else {
    localStorage.removeItem('current_user_id');
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('upca_token');
    const userData = localStorage.getItem('upca_user');

    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setCurrentUserId(parsedUser.id);
      loadPermissions(parsedUser.id);
    }
    setLoading(false);
  }, []);

  const loadPermissions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error loading permissions:', error);
        return;
      }
      setPermissions(data || []);
    } catch (error) {
      console.error('Error loading permissions:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔍 Iniciando login para:', email);
      
      // Buscar usuario por email
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      console.log('📊 Resultado de Supabase:', { user, error });

      if (error) {
        console.error('❌ Database error:', error);
        toast.error('Error al conectar con la base de datos');
        return false;
      }

      if (!user) {
        console.log('❌ Usuario no encontrado');
        toast.error('Usuario no encontrado. Verifica tu email.');
        return false;
      }

      console.log('✅ Usuario encontrado:', {
        id: user.id,
        email: user.email,
        role: user.role,
        hasPasswordHash: !!user.password_hash,
        passwordHashLength: user.password_hash?.length
      });

      console.log('🔐 Datos para comparación:');
      console.log('  - Contraseña ingresada:', password);
      console.log('  - Hash en BD:', user.password_hash);
      console.log('  - Longitud del hash:', user.password_hash?.length);
      console.log('  - Empieza con $2b$?', user.password_hash?.startsWith('$2b$'));

      // Test manual del hash para el admin
      if (email === 'admin@upca.edu.co' && password === 'admin1028') {
        console.log('🧪 Probando hash manual para admin...');
        const testHash = '$2b$10$96fYwpWK4CAlS8ScdyabVO7xCJfFvBgL6vwdrtY8.cgPk3J9DPK2q';
        const testResult = await bcrypt.compare('admin1028', testHash);
        console.log('  - Resultado test manual:', testResult);
      }

      // Comparar contraseña con el hash usando bcrypt
      console.log('🔄 Iniciando comparación bcrypt...');
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      console.log('✅ Resultado comparación bcrypt:', isValidPassword);

      if (!isValidPassword) {
        console.log('❌ Contraseña incorrecta');
        toast.error('Contraseña incorrecta');
        return false;
      }

      console.log('🎉 Login exitoso, configurando usuario...');

      const userData = {
        id: user.id,
        email: user.email,
        role: user.role
      };

      setUser(userData);
      setCurrentUserId(user.id);

      localStorage.setItem('upca_token', 'authenticated');
      localStorage.setItem('upca_user', JSON.stringify(userData));

      await loadPermissions(user.id);

      toast.success('Inicio de sesión exitoso');
      return true;
    } catch (error) {
      console.error('💥 Login error:', error);
      toast.error('Error al iniciar sesión');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setPermissions([]);
    setCurrentUserId(null);
    localStorage.removeItem('upca_token');
    localStorage.removeItem('upca_user');
    toast.success('Sesión cerrada');
  };

  const hasPermission = (module: string, action: 'create' | 'read' | 'update' | 'delete'): boolean => {
    if (user?.role === 'Admin') return true;
    if (module === 'dashboard' && action === 'read') return true;

    const permission = permissions.find(p => p.module === module);
    if (!permission) return false;

    switch (action) {
      case 'create': return permission.can_create;
      case 'read': return permission.can_read;
      case 'update': return permission.can_update;
      case 'delete': return permission.can_delete;
      default: return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      permissions,
      login,
      logout,
      loading,
      hasPermission
    }}>
      {children}
    </AuthContext.Provider>
  );
};