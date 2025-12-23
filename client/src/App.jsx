import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Monitor, Send, Clock, CheckCircle, AlertCircle, 
  Menu, X, Trash2, Edit, Home, Settings, Activity 
} from 'lucide-react';

// --- CONFIGURACIÓN ---
const API_URL = 'http://localhost:3001/api/reportes';

const CATEGORIAS = {
  Hardware: ['Monitor', 'Teclado', 'Mouse', 'CPU / Procesador', 'Memoria RAM', 'Disco Duro', 'Fuente de Poder', 'Tarjeta Madre', 'Impresora'],
  Software: ['Sistema Operativo', 'Paquete Office', 'Navegadores', 'Antivirus', 'Drivers', 'Conectividad / Red', 'Software Académico']
};

function App() {
  // --- ESTADOS DE NAVEGACIÓN Y MENÚ ---
  const [vistaActual, setVistaActual] = useState('inicio'); // inicio | reporte | gestion
  const [menuAbierto, setMenuAbierto] = useState(false);
  
  // --- ESTADOS DE DATOS ---
  const [formData, setFormData] = useState({ solicitante: '', categoria: '', componente: '', descripcion: '' });
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editandoId, setEditandoId] = useState(null); // ID del reporte que se está editando

  // --- EFECTOS ---
  useEffect(() => {
    fetchReportes();
  }, []);

  const fetchReportes = async () => {
    try {
      const res = await axios.get(API_URL);
      setReportes(res.data);
    } catch (error) {
      console.error("Error cargando reportes", error);
    }
  };

  // --- LÓGICA DEL FORMULARIO (CREAR / EDITAR) ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'categoria') {
      setFormData(prev => ({ ...prev, categoria: e.target.value, componente: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoria || !formData.componente) return alert("Complete los campos requeridos");
    
    setLoading(true);
    try {
      if (editandoId) {
        // MODO EDICIÓN
        await axios.put(`${API_URL}/${editandoId}`, formData);
        alert("Reporte actualizado correctamente");
        setEditandoId(null);
      } else {
        // MODO CREACIÓN
        await axios.post(API_URL, formData);
        alert("Reporte enviado exitosamente");
      }
      
      setFormData({ solicitante: '', categoria: '', componente: '', descripcion: '' });
      fetchReportes();
      setVistaActual('gestion'); // Redirigir a gestión tras guardar
    } catch (error) {
      alert("Error al procesar la solicitud");
      console.error(error);
    }
    setLoading(false);
  };

  // --- LÓGICA DE GESTIÓN (ELIMINAR / PREPARAR EDICIÓN) ---
  const eliminarReporte = async (id) => {
    if(!window.confirm("¿Estás seguro de eliminar este reporte del historial?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchReportes();
    } catch (error) {
      alert("Error al eliminar");
    }
  };

  const cargarParaEditar = (reporte) => {
    setFormData({
      solicitante: reporte.solicitante,
      categoria: reporte.categoria,
      componente: reporte.componente,
      descripcion: reporte.descripcion
    });
    setEditandoId(reporte.id);
    setVistaActual('reporte'); // Llevar al formulario
    setMenuAbierto(false);
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await axios.put(`${API_URL}/${id}`, { estado: nuevoEstado });
      fetchReportes();
    } catch (error) { console.error(error); }
  };

  // --- NAVEGACIÓN ---
  const navegarA = (vista) => {
    setVistaActual(vista);
    setMenuAbierto(false);
    if (vista === 'reporte' && !editandoId) {
        setFormData({ solicitante: '', categoria: '', componente: '', descripcion: '' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      
      {/* HEADER AIS */}
      <header className="bg-blue-800 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          
          {/* Logo y Título */}
          <div className="flex items-center gap-4">
            {/* Aquí va tu imagen. Asegúrate de que la ruta sea correcta */}
            <div className="bg-white p-1 rounded-full h-12 w-12 flex items-center justify-center overflow-hidden">
               {/* Si no tienes la imagen aún, usa un icono temporal */}
               <img src="/img/logo-ais.png" alt="AIS" className="object-cover h-full w-full" onError={(e) => e.target.style.display='none'} />
               <Activity className="h-8 w-8 text-blue-800 absolute opacity-0" /> 
            </div>
            
            <div className="flex flex-col">
              <h1 className="text-2xl tracking-wider" style={{ fontFamily: '"Orbitron", sans-serif', fontWeight: 700 }}>
                UNERG <span className="text-blue-300">AIS</span>
              </h1>
              <span className="text-xs text-blue-200 tracking-widest uppercase">Sistema de Mensajeria y Reportes de Fallas </span>
            </div>
          </div>

          {/* Botón Menú Hamburguesa */}
          <button onClick={() => setMenuAbierto(!menuAbierto)} className="p-2 hover:bg-blue-700 rounded-lg transition-colors z-50 relative">
            {menuAbierto ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
          </button>
        </div>
      </header>

      {/* MENÚ LATERAL DESPLEGABLE (SLIDE-IN) */}
      <div className={`fixed inset-y-0 right-0 w-64 bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${menuAbierto ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="pt-24 px-6 flex flex-col gap-4">
          <p className="text-gray-400 text-sm uppercase font-bold tracking-wider mb-2">Menú Principal</p>
          
          <button onClick={() => navegarA('inicio')} className={`flex items-center gap-3 p-3 rounded-lg transition-all ${vistaActual === 'inicio' ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-gray-50'}`}>
            <Home size={20} /> Inicio
          </button>
          
          <button onClick={() => { setEditandoId(null); navegarA('reporte'); }} className={`flex items-center gap-3 p-3 rounded-lg transition-all ${vistaActual === 'nuevo' ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-gray-50'}`}>
            <Send size={20} /> Nuevo Reporte
          </button>
          
          <button onClick={() => navegarA('gestion')} className={`flex items-center gap-3 p-3 rounded-lg transition-all ${vistaActual === 'gestion' ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-gray-50'}`}>
            <Settings size={20} /> Gestión Reportes
          </button>
        </div>
      </div>

      {/* FONDO OSCURO PARA EL MENÚ (Overlay) */}
      {menuAbierto && (
        <div onClick={() => setMenuAbierto(false)} className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"></div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <main className="container mx-auto p-6 relative z-10">
        
        {/* --- VISTA 1: INICIO --- */}
        {vistaActual === 'inicio' && (
          <div className="text-center py-10 animate-fade-in-up">
            <h2 className="text-4xl font-bold text-blue-900 mb-6" style={{ fontFamily: '"Orbitron", sans-serif' }}>
              Bienvenido al Sistema AIS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
              <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-500 hover:-translate-y-1 transition">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                  <Monitor size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Reportar Fallas</h3>
                <p className="text-gray-600 mb-4">Notifica problemas de Hardware o Software inmediatamente.</p>
                <button onClick={() => navegarA('reporte')} className="text-blue-600 font-bold hover:underline">Ir a Reportar →</button>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-500 hover:-translate-y-1 transition">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                  <Activity size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Gestión de Reportes</h3>
                <p className="text-gray-600 mb-4">Revisa si tu equipo ya está siendo atendido o reparado.</p>
                <button onClick={() => navegarA('gestion')} className="text-blue-600 font-bold hover:underline">Ver Estado →</button>
              </div>

              
            </div>
          </div>
        )}

        {/* --- VISTA 2: NUEVO REPORTE (FORMULARIO) --- */}
        {vistaActual === 'reporte' && (
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-fade-in-up">
            <div className="bg-blue-700 p-4 flex justify-between items-center">
               <h2 className="text-xl font-bold text-white flex items-center gap-2">
                 {editandoId ? <Edit className="h-5 w-5"/> : <Send className="h-5 w-5"/>} 
                 {editandoId ? 'Modificar Reporte Existente' : 'Nuevo Reporte de Incidencia'}
               </h2>
               {editandoId && <button onClick={() => {setEditandoId(null); setFormData({ solicitante: '', categoria: '', componente: '', descripcion: '' });}} className="text-xs text-white bg-red-500 px-2 py-1 rounded">Cancelar Edición</button>}
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Solicitante</label>
                <input 
                  type="text" name="solicitante" value={formData.solicitante} onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                  placeholder="Ej: Juan Pérez" required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tipo de Incidencia</label>
                  <select name="categoria" value={formData.categoria} onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" required>
                    <option value="">-- Categoría --</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Software">Software</option>
                  </select>
                </div>
                {formData.categoria && (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Componente Afectado</label>
                    <select name="componente" value={formData.componente} onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" required>
                      <option value="">-- Componente --</option>
                      {CATEGORIAS[formData.categoria].map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Descripción del Problema</label>
                <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows="4"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  placeholder="Describa la falla detalladamente..." required
                ></textarea>
              </div>

              <button type="submit" disabled={loading}
                className={`w-full text-white font-bold py-3 px-4 rounded-lg transition duration-200 shadow-md ${editandoId ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-700 hover:bg-blue-800'}`}>
                {loading ? 'Procesando...' : (editandoId ? 'Actualizar Reporte' : 'Enviar Reporte')}
              </button>
            </form>
          </div>
        )}

        {/* --- VISTA 3: GESTIÓN DE REPORTES (HISTORIAL) --- */}
        {vistaActual === 'gestion' && (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-6 text-gray-700 flex items-center gap-2">
              <Settings className="h-6 w-6 text-blue-700" /> Gestión y Historial
            </h2>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              {reportes.length === 0 ? (
                <div className="p-10 text-center text-gray-500">No hay reportes registrados.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold">
                      <tr>
                        <th className="p-4">Fecha</th>
                        <th className="p-4">Solicitante</th>
                        <th className="p-4">Falla</th>
                        <th className="p-4">Estado</th>
                        <th className="p-4 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {reportes.map((rep) => (
                        <tr key={rep.id} className="hover:bg-blue-50 transition">
                          <td className="p-4 text-sm text-gray-500">
                            {new Date(rep.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 font-semibold text-gray-800">
                            {rep.solicitante}
                            <div className="text-xs font-normal text-gray-500">{rep.categoria} - {rep.componente}</div>
                          </td>
                          <td className="p-4 text-sm text-gray-600 max-w-xs truncate">{rep.descripcion}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold
                              ${rep.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' : 
                                rep.estado === 'Solucionado' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                              {rep.estado}
                            </span>
                            {/* Selector rápido de estado */}
                            <select 
                              className="ml-2 text-xs border border-gray-300 rounded p-1 outline-none bg-white"
                              value={rep.estado}
                              onChange={(e) => cambiarEstado(rep.id, e.target.value)}
                            >
                              <option value="Pendiente">Pendiente</option>
                              <option value="En Revisión">Revisión</option>
                              <option value="Solucionado">Solucionado</option>
                            </select>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => cargarParaEditar(rep)} title="Editar" className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition">
                                <Edit size={16} />
                              </button>
                              <button onClick={() => eliminarReporte(rep.id)} title="Eliminar" className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;