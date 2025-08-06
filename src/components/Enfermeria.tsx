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
  Stethoscope,
  Building,
  AlertCircle,
  Calendar,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

interface Enfermeria {
  id: string;
  cedula: string;
  cedula: string;
  nombre: string;
  cargo: string;
  dependencia: string;
  sintomas: string;
  antecedentes_salud: string;
  salida?: string;
  observaciones: string | null;
  fecha?: string;
  created_at: string;
  created_by: string;
}

interface Funcionario {
  id: string;
  cedula: string;
  nombre: string;
  cargo: string;
  dependencia: string;
}

interface CatalogItem {
  id: string;
  nombre: string;
}

const Enfermeria: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [enfermeriaRecords, setEnfermeriaRecords] = useState<Enfermeria[]>([]);
  const [cargos, setCargos] = useState<CatalogItem[]>([]);
  const [dependencias, setDependencias] = useState<CatalogItem[]>([]);
  const [sintomas, setSintomas] = useState<CatalogItem[]>([]);
  const [antecedentesSalud, setAntecedentesSalud] = useState<CatalogItem[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Enfermeria | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [formData, setFormData] = useState({
    cedula: '',
    cedula: '',
    nombre: '',
    cargo: '',
    dependencia: '',
    sintomas: '',
    antecedentes_salud: '',
    salida: 'No',
    observaciones: '',
    fecha: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [enfermeriaRes, cargosRes, dependenciasRes, sintomasRes, antecedentesRes, funcionariosRes] = await Promise.all([
        supabase.from('enfermeria').select('*').order('created_at', { ascending: false }),
        supabase.from('cargos').select('*').eq('activo', true).order('nombre'),
        supabase.from('dependencias').select('*').eq('activo', true).order('nombre'),
        supabase.from('sintomas').select('*').eq('activo', true).order('nombre'),
        supabase.from('antecedentes_salud').select('*').eq('activo', true).order('nombre'),
        supabase.from('funcionarios').select('*').eq('activo', true).order('nombre')
      ]);

      if (enfermeriaRes.error) throw enfermeriaRes.error;
      if (cargosRes.error) throw cargosRes.error;
      if (dependenciasRes.error) throw dependenciasRes.error;
      if (sintomasRes.error) throw sintomasRes.error;
      if (antecedentesRes.error) throw antecedentesRes.error;
      if (funcionariosRes.error) throw funcionariosRes.error;

      setEnfermeriaRecords(enfermeriaRes.data || []);
      setCargos(cargosRes.data || []);
      setDependencias(dependenciasRes.data || []);
      setSintomas(sintomasRes.data || []);
      setAntecedentesSalud(antecedentesRes.data || []);
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

  const filteredRecords = enfermeriaRecords.filter(record => {
    const matchesSearch =
      record.cedula.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.dependencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.sintomas.toLowerCase().includes(searchTerm.toLowerCase());

    const recordDate = record.fecha ? new Date(record.fecha) : null;
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const matchesDate =
      (!start || (recordDate && recordDate >= start)) &&
      (!end || (recordDate && recordDate <= end));

    return matchesSearch && matchesDate;
  });

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredRecords);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Enfermeria');
    XLSX.writeFile(wb, 'enfermeria_filtrado.xlsx');
    toast.success('Archivo exportado exitosamente');
  };

  const handleEdit = (record: Enfermeria) => {
    if (!hasPermission('enfermeria', 'update')) {
      toast.error('No tienes permisos para editar');
      return;
    }

    setEditingRecord(record);
    setFormData({
      cedula: record.cedula || '',
      cedula: record.cedula,
      nombre: record.nombre,
      cargo: record.cargo,
      dependencia: record.dependencia,
      sintomas: record.sintomas,
      antecedentes_salud: record.antecedentes_salud,
      salida: record.salida || 'No',
      observaciones: record.observaciones || '',
      fecha: record.fecha || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!hasPermission('enfermeria', 'delete')) {
      toast.error('No tienes permisos para eliminar');
      return;
    }

    if (!confirm('¿Estás seguro de que deseas eliminar este registro?')) return;

    try {
      const { error } = await supabase
        .from('enfermeria')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Registro eliminado exitosamente');
      loadData();
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error('Error al eliminar el registro');
    }
  };

  const resetForm = () => {
    setFormData({
      cedula: '',
      cedula: '',
      nombre: '',
      cargo: '',
      dependencia: '',
      sintomas: '',
      antecedentes_salud: '',
      salida: 'No',
      observaciones: '',
      fecha: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingRecord) {
        const { error } = await supabase
          .from('enfermeria')
          .update(formData)
          .eq('id', editingRecord.id);

        if (error) throw error;
        toast.success('Registro actualizado exitosamente');
      } else {
        const { error } = await supabase
          .from('enfermeria')
          .insert([{ ...formData, created_by: user?.id }]);

        if (error) throw error;
        toast.success('Registro creado exitosamente');
      }

      setShowModal(false);
      setEditingRecord(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving record:', error);
      toast.error('Error al guardar el registro');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <Stethoscope className="mr-3 h-6 w-6 text-red-600" />
              Gestión de Enfermería
            </h1>
            <p className="text-gray-600 mt-1">
              Administra los registros médicos y de enfermería
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0">
            <button
              onClick={exportToExcel}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </button>
            {hasPermission('enfermeria', 'create') && (
              <button
                onClick={() => {
                  resetForm();
                  setEditingRecord(null);
                  setShowModal(true);
                }}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Registro
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por número de cédula, nombre, cargo, dependencia o síntomas..."
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
                  Síntomas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Antecedentes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salida
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                 Fecha
                 </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {record.nombre}
                        </div>
                        <div className="text-sm text-gray-500">
                          CC: {record.cedula}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {record.cargo}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900">{record.dependencia}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-red-400 mr-1" />
                      <span className="text-sm text-gray-900">{record.sintomas}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {record.antecedentes_salud}
                    </span>
                  </td> 
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      record.salida === 'Sí' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {record.salida || 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {record.fecha ? 
                      new Date(record.fecha + 'T00:00:00').toLocaleDateString('es-ES') : 
                      new Date(record.created_at).toLocaleDateString('es-ES')
                    }
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {hasPermission('enfermeria', 'update') && (
                        <button
                          onClick={() => handleEdit(record)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {hasPermission('enfermeria', 'delete') && (
                        <button
                          onClick={() => handleDelete(record.id)}
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
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                {editingRecord ? 'Editar Registro' : 'Nuevo Registro de Enfermería'}
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
                      Número de Cédula *
                    </label>
                    <input
                      type="text"
                      value={formData.cedula}
                      onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                      Síntomas *
                    </label>
                    <select
                      value={formData.sintomas}
                      onChange={(e) => setFormData({ ...formData, sintomas: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    >
                      <option value="">Seleccionar síntomas</option>
                      {sintomas.map(sintoma => (
                        <option key={sintoma.id} value={sintoma.nombre}>
                          {sintoma.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Antecedentes de Salud *
                    </label>
                    <select
                      value={formData.antecedentes_salud}
                      onChange={(e) => setFormData({ ...formData, antecedentes_salud: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    >
                      <option value="">Seleccionar antecedentes</option>
                      {antecedentesSalud.map(antecedente => (
                        <option key={antecedente.id} value={antecedente.nombre}>
                          {antecedente.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Fecha *
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
                    Observaciones
                  </label>
                  <textarea
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Observaciones adicionales..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingRecord(null);
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
                    {editingRecord ? 'Actualizar' : 'Crear'} Registro
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

export default Enfermeria;
