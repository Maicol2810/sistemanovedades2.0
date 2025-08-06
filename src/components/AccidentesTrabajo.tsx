import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Download,
  User,
  AlertTriangle,
  Building,
  Calendar,
  Clock,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

interface AccidenteTrabajo {
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
}

interface CatalogItem {
  id: string;
  nombre: string;
}

interface Funcionario {
  id: string;
  cedula: string;
  nombre: string;
  cargo: string;
  dependencia: string;
}

const AccidentesTrabajo: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [accidentes, setAccidentes] = useState<AccidenteTrabajo[]>([]);
  const [tiposAT, setTiposAT] = useState<CatalogItem[]>([]);
  const [tiposLesion, setTiposLesion] = useState<CatalogItem[]>([]);
  const [partesCuerpo, setPartesCuerpo] = useState<CatalogItem[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAccidente, setEditingAccidente] = useState<AccidenteTrabajo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [formData, setFormData] = useState({
    cedula: '',
    nombre: '',
    cargo: '',
    dependencia: '',
    tipo_at: '',
    tipo_lesion: '',
    parte_cuerpo_afectada: '',
    fecha: '',
    hora: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [accidentesRes, tiposATRes, tiposLesionRes, partesCuerpoRes, funcionariosRes] = await Promise.all([
        supabase.from('accidentes_trabajo').select('*').order('created_at', { ascending: false }),
        supabase.from('tipos_at').select('*').eq('activo', true).order('nombre'),
        supabase.from('tipos_lesion').select('*').eq('activo', true).order('nombre'),
        supabase.from('partes_cuerpo').select('*').eq('activo', true).order('nombre'),
        supabase.from('funcionarios').select('*').eq('activo', true).order('nombre')
      ]);

      if (accidentesRes.error) throw accidentesRes.error;
      if (tiposATRes.error) throw tiposATRes.error;
      if (tiposLesionRes.error) throw tiposLesionRes.error;
      if (partesCuerpoRes.error) throw partesCuerpoRes.error;
      if (funcionariosRes.error) throw funcionariosRes.error;

      setAccidentes(accidentesRes.data || []);
      setTiposAT(tiposATRes.data || []);
      setTiposLesion(tiposLesionRes.data || []);
      setPartesCuerpo(partesCuerpoRes.data || []);
      setFuncionarios(funcionariosRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCedulaChange = (cedula: string) => {
    const funcionario = funcionarios.find(f => f.cedula === cedula);
    if (funcionario) {
      setFormData({
        ...formData,
        cedula,
        nombre: funcionario.nombre,
        cargo: funcionario.cargo,
        dependencia: funcionario.dependencia
      });
    } else {
      setFormData({
        ...formData,
        cedula
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasPermission('accidentes_trabajo', editingAccidente ? 'update' : 'create')) {
      toast.error('No tienes permisos para esta acción');
      return;
    }

    try {
      const accidenteData = {
        ...formData,
        created_by: user?.id || ''
      };

      if (editingAccidente) {
        const { error } = await supabase
          .from('accidentes_trabajo')
          .update(accidenteData)
          .eq('id', editingAccidente.id);

        if (error) throw error;
        toast.success('Accidente de trabajo actualizado exitosamente');
      } else {
        const { error } = await supabase
          .from('accidentes_trabajo')
          .insert([accidenteData]);

        if (error) throw error;
        toast.success('Accidente de trabajo registrado exitosamente');
      }

      setShowModal(false);
      setEditingAccidente(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving accidente:', error);
      toast.error('Error al guardar el accidente de trabajo');
    }
  };

  const handleEdit = (accidente: AccidenteTrabajo) => {
    if (!hasPermission('accidentes_trabajo', 'update')) {
      toast.error('No tienes permisos para editar');
      return;
    }

    setEditingAccidente(accidente);
    setFormData({
      cedula: accidente.cedula,
      nombre: accidente.nombre,
      cargo: accidente.cargo,
      dependencia: accidente.dependencia,
      tipo_at: accidente.tipo_at,
      tipo_lesion: accidente.tipo_lesion,
      parte_cuerpo_afectada: accidente.parte_cuerpo_afectada,
      fecha: accidente.fecha,
      hora: accidente.hora
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!hasPermission('accidentes_trabajo', 'delete')) {
      toast.error('No tienes permisos para eliminar');
      return;
    }

    if (!confirm('¿Estás seguro de que deseas eliminar este registro?')) return;

    try {
      const { error } = await supabase
        .from('accidentes_trabajo')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Accidente de trabajo eliminado exitosamente');
      loadData();
    } catch (error) {
      console.error('Error deleting accidente:', error);
      toast.error('Error al eliminar el accidente de trabajo');
    }
  };

  const resetForm = () => {
    setFormData({
      cedula: '',
      nombre: '',
      cargo: '',
      dependencia: '',
      tipo_at: '',
      tipo_lesion: '',
      parte_cuerpo_afectada: '',
      fecha: '',
      hora: ''
    });
  };

  const exportToExcel = () => {
    const dataToExport = getFilteredData();
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'AccidentesTrabajo');
    
    const fileName = startDate && endDate 
      ? `accidentes_trabajo_${startDate}_${endDate}.xlsx`
      : 'accidentes_trabajo.xlsx';
    
    XLSX.writeFile(wb, fileName);
    toast.success('Archivo exportado exitosamente');
  };

  const getFilteredData = () => {
    return accidentes.filter(accidente => {
      const matchesSearch = accidente.cedula.toLowerCase().includes(searchTerm.toLowerCase()) ||
        accidente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        accidente.tipo_at.toLowerCase().includes(searchTerm.toLowerCase()) ||
        accidente.tipo_lesion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        accidente.dependencia.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDateRange = (!startDate || accidente.fecha >= startDate) &&
        (!endDate || accidente.fecha <= endDate);

      return matchesSearch && matchesDateRange;
    });
  };

  const filteredAccidentes = getFilteredData();

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
              <AlertTriangle className="mr-3 h-6 w-6 text-red-600" />
              Accidentes de Trabajo
            </h1>
            <p className="text-gray-600 mt-1">
              Administra los registros de accidentes de trabajo
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
            {hasPermission('accidentes_trabajo', 'create') && (
              <button
                onClick={() => {
                  resetForm();
                  setEditingAccidente(null);
                  setShowModal(true);
                }}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Accidente
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por cédula, nombre, tipo de AT o dependencia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
          
          <div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="date"
                placeholder="Fecha desde"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
          
          <div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="date"
                placeholder="Fecha hasta"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
        </div>
        
        {(startDate || endDate) && (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Filter className="h-4 w-4" />
              <span>
                Filtrado por fecha: {startDate || 'Inicio'} - {endDate || 'Fin'}
              </span>
            </div>
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Personal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cargo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dependencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo AT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lesión
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parte Afectada
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAccidentes.map((accidente) => (
                <tr key={accidente.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {accidente.nombre}
                        </div>
                        <div className="text-sm text-gray-500">
                          CC: {accidente.cedula}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {accidente.cargo}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900">{accidente.dependencia}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {accidente.tipo_at}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {accidente.tipo_lesion}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {accidente.parte_cuerpo_afectada}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{new Date(accidente.fecha + 'T00:00:00').toLocaleDateString('es-ES')}</span>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{accidente.hora}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {hasPermission('accidentes_trabajo', 'update') && (
                        <button
                          onClick={() => handleEdit(accidente)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {hasPermission('accidentes_trabajo', 'delete') && (
                        <button
                          onClick={() => handleDelete(accidente.id)}
                          className="text-red-600 hover:text-red-900"
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
        
        {filteredAccidentes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No se encontraron accidentes de trabajo que coincidan con los filtros aplicados
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                {editingAccidente ? 'Editar Accidente de Trabajo' : 'Nuevo Accidente de Trabajo'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Cédula *
                    </label>
                    <input
                      type="text"
                      value={formData.cedula}
                      onChange={(e) => handleCedulaChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Ingrese número de cédula"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Se autocompleta con la cédula"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cargo *
                    </label>
                    <input
                      type="text"
                      value={formData.cargo}
                      onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Se autocompleta con la cédula"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dependencia *
                    </label>
                    <input
                      type="text"
                      value={formData.dependencia}
                      onChange={(e) => setFormData({ ...formData, dependencia: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Se autocompleta con la cédula"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de AT *
                    </label>
                    <select
                      value={formData.tipo_at}
                      onChange={(e) => setFormData({ ...formData, tipo_at: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    >
                      <option value="">Seleccionar tipo de AT</option>
                      {tiposAT.map(tipo => (
                        <option key={tipo.id} value={tipo.nombre}>
                          {tipo.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Lesión *
                    </label>
                    <select
                      value={formData.tipo_lesion}
                      onChange={(e) => setFormData({ ...formData, tipo_lesion: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    >
                      <option value="">Seleccionar tipo de lesión</option>
                      {tiposLesion.map(tipo => (
                        <option key={tipo.id} value={tipo.nombre}>
                          {tipo.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parte del Cuerpo Afectada *
                    </label>
                    <select
                      value={formData.parte_cuerpo_afectada}
                      onChange={(e) => setFormData({ ...formData, parte_cuerpo_afectada: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    >
                      <option value="">Seleccionar parte del cuerpo</option>
                      {partesCuerpo.map(parte => (
                        <option key={parte.id} value={parte.nombre}>
                          {parte.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha del Accidente *
                    </label>
                    <input
                      type="date"
                      value={formData.fecha}
                      onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora del Accidente *
                    </label>
                    <input
                      type="time"
                      value={formData.hora}
                      onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingAccidente(null);
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
                    {editingAccidente ? 'Actualizar' : 'Registrar'} Accidente
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

export default AccidentesTrabajo;