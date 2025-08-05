import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Settings,
  Tag,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import toast from 'react-hot-toast';

interface CatalogItem {
  id: string;
  nombre: string;
  activo: boolean;
  created_at: string;
}

const Configuracion: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('tipos_novedad');
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    activo: true
  });

  const catalogs = [
    { key: 'tipos_novedad', label: 'Tipos de Novedad', table: 'tipos_novedad' },
    { key: 'diagnosticos', label: 'Diagnósticos', table: 'diagnosticos' },
    { key: 'tipos_incapacidad', label: 'Tipos de Incapacidad', table: 'tipos_incapacidad' },
    { key: 'cargos', label: 'Cargos', table: 'cargos' },
    { key: 'dependencias', label: 'Dependencias', table: 'dependencias' },
    { key: 'sintomas', label: 'Síntomas', table: 'sintomas' },
    { key: 'antecedentes_salud', label: 'Antecedentes de Salud', table: 'antecedentes_salud' }
  ];

  const currentCatalog = catalogs.find(c => c.key === activeTab);

  useEffect(() => {
    if (user?.role === 'Admin') {
      loadItems();
    }
  }, [activeTab, user]);

  const loadItems = async () => {
    if (!currentCatalog) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from(currentCatalog.table)
        .select('*')
        .order('nombre');

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error loading items:', error);
      toast.error('Error al cargar los elementos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (user?.role !== 'Admin') {
      toast.error('No tienes permisos para esta acción');
      return;
    }

    if (!currentCatalog) return;

    try {
      if (editingItem) {
        const { error } = await supabase
          .from(currentCatalog.table)
          .update(formData)
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success('Elemento actualizado exitosamente');
      } else {
        const { error } = await supabase
          .from(currentCatalog.table)
          .insert([formData]);

        if (error) throw error;
        toast.success('Elemento creado exitosamente');
      }

      setShowModal(false);
      setEditingItem(null);
      resetForm();
      loadItems();
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('Error al guardar el elemento');
    }
  };

  const handleEdit = (item: CatalogItem) => {
    if (user?.role !== 'Admin') {
      toast.error('No tienes permisos para editar');
      return;
    }

    setEditingItem(item);
    setFormData({
      nombre: item.nombre,
      activo: item.activo
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (user?.role !== 'Admin') {
      toast.error('No tienes permisos para eliminar');
      return;
    }

    if (!currentCatalog) return;

    if (!confirm('¿Estás seguro de que deseas eliminar este elemento?')) return;

    try {
      const { error } = await supabase
        .from(currentCatalog.table)
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Elemento eliminado exitosamente');
      loadItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Error al eliminar el elemento');
    }
  };

  const toggleActive = async (item: CatalogItem) => {
    if (user?.role !== 'Admin') {
      toast.error('No tienes permisos para esta acción');
      return;
    }

    if (!currentCatalog) return;

    try {
      const { error } = await supabase
        .from(currentCatalog.table)
        .update({ activo: !item.activo })
        .eq('id', item.id);

      if (error) throw error;
      toast.success(`Elemento ${!item.activo ? 'activado' : 'desactivado'} exitosamente`);
      loadItems();
    } catch (error) {
      console.error('Error toggling item:', error);
      toast.error('Error al cambiar el estado del elemento');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      activo: true
    });
  };

  const filteredItems = items.filter(item =>
    item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (user?.role !== 'Admin') {
    return (
      <div className="text-center py-12">
        <Settings className="mx-auto h-12 w-12 text-gray-400" />
        <h2 className="text-2xl font-bold text-gray-800 mt-4">Acceso Denegado</h2>
        <p className="text-gray-600 mt-2">Solo los administradores pueden acceder a esta sección.</p>
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
              <Settings className="mr-3 h-6 w-6 text-red-600" />
              Configuración del Sistema
            </h1>
            <p className="text-gray-600 mt-1">
              Administra los catálogos y configuraciones del sistema
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {catalogs.map((catalog) => (
              <button
                key={catalog.key}
                onClick={() => setActiveTab(catalog.key)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === catalog.key
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {catalog.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Search and Add */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
            <button
              onClick={() => {
                resetForm();
                setEditingItem(null);
                setShowModal(true);
              }}
              className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar {currentCatalog?.label}
            </button>
          </div>

          {/* Items List */}
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <Tag className="h-5 w-5 text-gray-400" />
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        {item.nombre}
                      </span>
                      <div className="text-xs text-gray-500">
                        Creado: {new Date(item.created_at).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleActive(item)}
                      className={`p-1 rounded ${
                        item.activo ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title={item.activo ? 'Desactivar' : 'Activar'}
                    >
                      {item.activo ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                    </button>
                    
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {filteredItems.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No se encontraron elementos
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                {editingItem ? 'Editar' : 'Agregar'} {currentCatalog?.label}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.activo}
                      onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Activo</span>
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingItem(null);
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
                    {editingItem ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Configuracion;