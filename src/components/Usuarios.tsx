import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Download,
  Users as UsersIcon,
  Shield,
  Mail,
  Key,
  UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import bcrypt from 'bcryptjs';

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface Permission {
  id: string;
  user_id: string;
  module: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
}

const Usuarios: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'Usuario'
  });
  const [userPermissions, setUserPermissions] = useState({
    novedades: { can_create: false, can_read: false, can_update: false, can_delete: false },
    incapacidades: { can_create: false, can_read: false, can_update: false, can_delete: false },
    enfermeria: { can_create: false, can_read: false, can_update: false, can_delete: false }
  });

  const roles = ['Admin', 'Usuario'];
  const modules = ['novedades', 'incapacidades', 'enfermeria'];

  useEffect(() => {
    if (currentUser?.role === 'Admin') {
      loadUsers();
    }
  }, [currentUser]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const loadUserPermissions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      const permissionsMap = {
        novedades: { can_create: false, can_read: false, can_update: false, can_delete: false },
        incapacidades: { can_create: false, can_read: false, can_update: false, can_delete: false },
        enfermeria: { can_create: false, can_read: false, can_update: false, can_delete: false }
      };

      data?.forEach(permission => {
        if (permissionsMap[permission.module as keyof typeof permissionsMap]) {
          permissionsMap[permission.module as keyof typeof permissionsMap] = {
            can_create: permission.can_create,
            can_read: permission.can_read,
            can_update: permission.can_update,
            can_delete: permission.can_delete
          };
        }
      });

      setUserPermissions(permissionsMap);
    } catch (error) {
      console.error('Error loading permissions:', error);
      toast.error('Error al cargar los permisos');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentUser?.role !== 'Admin') {
      toast.error('No tienes permisos para esta acción');
      return;
    }

    try {
      if (editingUser) {
        const updateData: any = {
          email: formData.email,
          role: formData.role
        };

        if (formData.password) {
          updateData.password_hash = await bcrypt.hash(formData.password, 10);
        }

        const { error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', editingUser.id);

        if (error) throw error;
        toast.success('Usuario actualizado exitosamente');
      } else {
        const password_hash = await bcrypt.hash(formData.password, 10);
        
        const { error } = await supabase
          .from('users')
          .insert([{
            email: formData.email,
            password_hash,
            role: formData.role
          }]);

        if (error) throw error;
        toast.success('Usuario creado exitosamente');
      }

      setShowModal(false);
      setEditingUser(null);
      resetForm();
      loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Error al guardar el usuario');
    }
  };

  const handleEdit = (user: User) => {
    if (currentUser?.role !== 'Admin') {
      toast.error('No tienes permisos para editar');
      return;
    }

    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      role: user.role
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (currentUser?.role !== 'Admin') {
      toast.error('No tienes permisos para eliminar');
      return;
    }

    if (id === currentUser.id) {
      toast.error('No puedes eliminar tu propio usuario');
      return;
    }

    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Usuario eliminado exitosamente');
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error al eliminar el usuario');
    }
  };

  const handlePermissions = async (user: User) => {
    setSelectedUser(user);
    await loadUserPermissions(user.id);
    setShowPermissionsModal(true);
  };

  const savePermissions = async () => {
    if (!selectedUser) return;

    try {
      // Delete existing permissions
      await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', selectedUser.id);

      // Insert new permissions
      const permissionsToInsert = [];
      for (const [module, perms] of Object.entries(userPermissions)) {
        permissionsToInsert.push({
          user_id: selectedUser.id,
          module,
          can_create: perms.can_create,
          can_read: perms.can_read,
          can_update: perms.can_update,
          can_delete: perms.can_delete
        });
      }

      const { error } = await supabase
        .from('user_permissions')
        .insert(permissionsToInsert);

      if (error) throw error;
      
      toast.success('Permisos actualizados exitosamente');
      setShowPermissionsModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast.error('Error al guardar los permisos');
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      role: 'Usuario'
    });
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(users);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');
    XLSX.writeFile(wb, 'usuarios.xlsx');
    toast.success('Archivo exportado exitosamente');
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (currentUser?.role !== 'Admin') {
    return (
      <div className="text-center py-12">
        <Shield className="mx-auto h-12 w-12 text-gray-400" />
        <h2 className="text-2xl font-bold text-gray-800 mt-4">Acceso Denegado</h2>
        <p className="text-gray-600 mt-2">Solo los administradores pueden acceder a esta sección.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <UsersIcon className="mr-3 h-6 w-6 text-red-600" />
              Gestión de Usuarios
            </h1>
            <p className="text-gray-600 mt-1">
              Administra los usuarios del sistema y sus permisos
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={exportToExcel}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </button>
            <button
              onClick={() => {
                resetForm();
                setEditingUser(null);
                setShowModal(true);
              }}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Usuario
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por email o rol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Creación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-400 mr-2" />
                      <div className="text-sm font-medium text-gray-900">
                        {user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'Admin' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(user.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar usuario"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handlePermissions(user)}
                        className="text-green-600 hover:text-green-900"
                        title="Gestionar permisos"
                      >
                        <UserCheck className="h-4 w-4" />
                      </button>
                      {user.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña {editingUser ? '(dejar vacío para mantener actual)' : '*'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required={!editingUser}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rol *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  >
                    {roles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingUser(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                  >
                    {editingUser ? 'Actualizar' : 'Crear'} Usuario
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Permisos para {selectedUser.email}
              </h2>
              
              <div className="space-y-6">
                {modules.map(module => (
                  <div key={module} className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 capitalize">
                      {module}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['can_create', 'can_read', 'can_update', 'can_delete'].map(permission => (
                        <label key={permission} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={userPermissions[module as keyof typeof userPermissions][permission as keyof typeof userPermissions.novedades]}
                            onChange={(e) => {
                              setUserPermissions(prev => ({
                                ...prev,
                                [module]: {
                                  ...prev[module as keyof typeof prev],
                                  [permission]: e.target.checked
                                }
                              }));
                            }}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700">
                            {permission.replace('can_', '').charAt(0).toUpperCase() + permission.replace('can_', '').slice(1)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  onClick={() => {
                    setShowPermissionsModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={savePermissions}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Guardar Permisos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;