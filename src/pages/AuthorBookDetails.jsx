import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';

const AuthorBookDetails = ({ user, darkMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [stats, setStats] = useState({ reading: 0, pending: 0, completed: 0, dropped: 0 }); // NUEVO
  const [loading, setLoading] = useState(true);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ title: '', description: '', tags: '' });
  const [newCover, setNewCover] = useState(null);

  const theme = {
    bg: darkMode ? '#0a0b10' : '#f4f0ea',
    card: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.7)',
    accent: darkMode ? '#d4af37' : '#b85b3f',
    textMain: darkMode ? '#e3e1db' : '#2b2824',
    textMuted: darkMode ? '#8a8782' : '#857f77',
    border: darkMode ? 'rgba(212, 175, 55, 0.15)' : 'rgba(184, 91, 63, 0.15)',
    input: darkMode ? '#11131a' : '#fff',
    chartColors: [darkMode ? '#d4af37' : '#b85b3f', '#2ecc71', '#e74c3c', '#9b59b6']
  };

const loadData = async () => {
    try {
      setLoading(true);

      const [resBook, resChapters, resStats] = await Promise.all([
        fetch(`http://127.0.0.1:5001/api/books/${id}`),
        fetch(`http://127.0.0.1:5001/api/books/${id}/chapters`),
        fetch(`http://127.0.0.1:5001/api/books/${id}/library-stats`)
      ]);

      if (!resBook.ok) throw new Error("No se pudo cargar el libro principal");

      const bookData = await resBook.json();
      const chaptersData = resChapters.ok ? await resChapters.json() : [];
      
      // Manejo seguro para las estadísticas: si da 404, usamos ceros por defecto
      let statsData = { reading: 0, pending: 0, completed: 0, dropped: 0 };
      if (resStats.ok) {
        statsData = await resStats.json();
      } else {
        console.warn("Ruta de stats no encontrada (404). Usando ceros.");
      }

      setBook(bookData);
      setChapters(chaptersData);
      setStats(statsData);
      setEditData({ title: bookData.title, description: bookData.description, tags: bookData.tags || "" });

    } catch (err) {
      console.error("Error crítico cargando datos:", err);
    } finally {
      // 2. PASE LO QUE PASE, quitamos la pantalla de "Analizando manuscrito..."
      setLoading(false);
    }
  };

  // 3. DESPUÉS llamamos a la función en el useEffect
  useEffect(() => {
    loadData();
  }, [id]);

  const handleUpdateBook = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', editData.title);
    formData.append('description', editData.description);
    formData.append('tags', editData.tags);
    if (newCover) formData.append('cover', newCover);

    const res = await fetch(`http://127.0.0.1:5001/api/books/${id}/update`, {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      setShowEditModal(false);
      loadData();
    }
  };

  if (loading) return <div style={{padding: '100px', textAlign: 'center', color: theme.accent, backgroundColor: theme.bg, minHeight: '100vh'}}>Analizando manuscrito...</div>;

  // Datos para los gráficos
  const chartData = chapters.map((cap, index) => ({
    name: `Cap ${index + 1}`,
    palabras: cap.word_count || 0,
    vistas: Math.round(book.views / (index + 1.2)) 
  }));

  const pieData = [
    { name: 'Leyendo', value: stats.reading },
    { name: 'Pendiente', value: stats.pending },
    { name: 'Completado', value: stats.completed },
    { name: 'Abandonado', value: stats.dropped },
  ].filter(d => d.value > 0); // Solo mostrar si hay datos

  const totalInLibrary = stats.reading + stats.pending + stats.completed + stats.dropped;

  const EditModal = () => (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
      <div style={{ padding: '40px', borderRadius: '25px', width: '100%', maxWidth: '600px', backgroundColor: darkMode ? '#0f1117' : '#fcfaf7', border: `1px solid ${theme.border}`, color: theme.textMain }}>
        <h2 style={{ fontFamily: "'Crimson Pro', serif", color: theme.accent, marginTop: 0 }}>Ajustes de la Obra</h2>
        <form onSubmit={handleUpdateBook}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px', color: theme.textMuted }}>TÍTULO</label>
          <input style={{ width: '100%', padding: '12px', borderRadius: '10px', marginBottom: '20px', backgroundColor: theme.input, color: theme.textMain, border: `1px solid ${theme.border}`, outline: 'none' }} value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} />
          
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px', color: theme.textMuted }}>SINOPSIS</label>
          <textarea style={{ width: '100%', padding: '12px', borderRadius: '10px', marginBottom: '20px', height: '120px', backgroundColor: theme.input, color: theme.textMain, border: `1px solid ${theme.border}`, outline: 'none', fontFamily: 'inherit' }} value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})} />
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '50px', border: 'none', backgroundColor: theme.accent, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Guardar Cambios</button>
            <button type="button" onClick={() => setShowEditModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '50px', border: `1px solid ${theme.border}`, backgroundColor: 'transparent', color: theme.textMain, cursor: 'pointer' }}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '40px 0', color: theme.textMain, fontFamily: "'Inter', sans-serif", backgroundColor: theme.bg, minHeight: '100vh' }}>
      {showEditModal && <EditModal />}
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', marginBottom: '30px', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          ← VOLVER AL STUDIO
        </button>

        {/* HEADER TÉCNICO */}
        <div style={{ display: 'flex', gap: '40px', marginBottom: '60px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
              <img 
              src={`http://127.0.0.1:5001/static/covers/${book.author_note}`} 
              style={{ width: '180px', height: '270px', objectFit: 'cover', borderRadius: '12px', boxShadow: `0 20px 40px rgba(0,0,0,${darkMode ? '0.5' : '0.2'})`, border: `1px solid ${theme.border}` }}
              alt="Portada"
              onError={(e) => e.target.src = "https://placehold.jp/180x270.png?text=Sin+Portada"}
              />
          </div>
          
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: '3.5rem', fontFamily: "'Crimson Pro', serif", fontWeight: 400, lineHeight: 1 }}>{book.title}</h1>
            <p style={{ color: theme.textMuted, fontSize: '1.1rem', maxWidth: '700px', margin: '20px 0', lineHeight: '1.6' }}>{book.description}</p>
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
              <button onClick={() => navigate(`/add-chapter/${id}`)} style={{ padding: '14px 30px', borderRadius: '50px', border: 'none', backgroundColor: theme.accent, color: darkMode ? '#000' : '#fff', fontWeight: 700, cursor: 'pointer' }}>
                ✦ AÑADIR CAPÍTULO
              </button>
              <button onClick={() => setShowEditModal(true)} style={{ padding: '14px 30px', borderRadius: '50px', border: `1px solid ${theme.border}`, backgroundColor: 'transparent', color: theme.textMain, fontWeight: 600, cursor: 'pointer' }}>
                CONFIGURACIÓN
              </button>
            </div>
          </div>
        </div>

        {/* MÉTRICAS CLAVE */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {[
            { label: 'VISTAS TOTALES', value: book.views, color: theme.accent },
            { label: 'EN BIBLIOTECAS', value: totalInLibrary, color: theme.textMain },
            { label: 'PALABRAS', value: chapters.reduce((acc, cap) => acc + (cap.word_count || 0), 0).toLocaleString(), color: theme.textMain },
            { label: 'CAPÍTULOS', value: chapters.length, color: theme.textMain }
          ].map((stat, i) => (
            <div key={i} style={{ padding: '25px', borderRadius: '20px', backgroundColor: theme.card, border: `1px solid ${theme.border}`, textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: theme.textMuted, fontWeight: 800, letterSpacing: '1.5px' }}>{stat.label}</span>
              <h2 style={{ color: stat.color, fontSize: '2.2rem', margin: '10px 0 0 0', fontFamily: "'Crimson Pro', serif" }}>{stat.value}</h2>
            </div>
          ))}
        </div>

        {/* ANALÍTICA AVANZADA */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px', marginBottom: '50px' }}>
          
          {/* Gráfico de Barras */}
          <div style={{ padding: '30px', borderRadius: '25px', backgroundColor: theme.card, border: `1px solid ${theme.border}` }}>
            <h4 style={{ marginBottom: '25px', color: theme.textMuted, fontSize: '0.8rem', fontWeight: 800, letterSpacing: '1px' }}>EXTENSIÓN POR CAPÍTULO</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.border} vertical={false} />
                <XAxis dataKey="name" stroke={theme.textMuted} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={theme.textMuted} fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: darkMode ? '#111' : '#fff', border: `1px solid ${theme.border}`, borderRadius: '10px' }} />
                <Bar dataKey="palabras" fill={theme.accent} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* grafico de lecturas */}
          <div style={{ padding: '30px', borderRadius: '20px', backgroundColor: theme.card, border: `1px solid ${theme.border}` }}>
          <h4 style={{ marginBottom: '25px', color: theme.textMuted, fontSize: '0.9rem', fontWeight: 700, letterSpacing: '1px' }}>RETENCIÓN DE LECTORES</h4>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.accent} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={theme.accent} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.border} vertical={false} />
              <XAxis dataKey="name" stroke={theme.textMuted} fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke={theme.textMuted} fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '10px' }} />
              <Area type="monotone" dataKey="vistas" stroke={theme.accent} strokeWidth={3} fillOpacity={1} fill="url(#colorVis)" />
            </AreaChart>
          </ResponsiveContainer>
          </div>        

{/* Gráfico de Biblioteca (NUEVO) */}
          <div style={{ padding: '30px', borderRadius: '25px', backgroundColor: theme.card, border: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' }}>
            <h4 style={{ marginBottom: '25px', color: theme.textMuted, fontSize: '0.8rem', fontWeight: 800, letterSpacing: '1px' }}>ESTADO DE LA AUDIENCIA</h4>
            
            {totalInLibrary === 0 ? (
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: theme.textMuted, fontStyle: 'italic', fontSize: '0.9rem' }}>
                No hay lectores registrados aún.
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={theme.chartColors[index % theme.chartColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ paddingLeft: '20px' }}>
                      {pieData.map((entry, index) => (
                          <div key={index} style={{ fontSize: '0.8rem', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: theme.chartColors[index] }}></div>
                              <span style={{ color: theme.textMuted }}>{entry.name}:</span>
                              <span style={{ fontWeight: 700 }}>{entry.value}</span>
                          </div>
                      ))}
                  </div>
              </div>
            )}
          </div>
        </div>

        {/* ÍNDICE DE MANUSCRITO */}
        <div style={{ backgroundColor: theme.card, borderRadius: '25px', overflow: 'hidden', border: `1px solid ${theme.border}` }}>
          <div style={{ padding: '25px 30px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <h3 style={{ margin: 0, fontFamily: "'Crimson Pro', serif", fontSize: '1.5rem' }}>Estructura de la Obra</h3>
             <span style={{ fontSize: '0.8rem', color: theme.textMuted }}>{chapters.length} Capítulos publicados</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <th style={{ padding: '20px 30px', fontSize: '0.7rem', color: theme.textMuted, letterSpacing: '1px' }}>ORDEN</th>
                <th style={{ padding: '20px', fontSize: '0.7rem', color: theme.textMuted, letterSpacing: '1px' }}>TÍTULO DEL CAPÍTULO</th>
                <th style={{ padding: '20px', fontSize: '0.7rem', color: theme.textMuted, letterSpacing: '1px' }}>PALABRAS</th>
                <th style={{ padding: '20px 30px', fontSize: '0.7rem', color: theme.textMuted, letterSpacing: '1px', textAlign: 'right' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {chapters.map((cap, index) => (
                <tr key={cap.id} style={{ borderBottom: `1px solid ${theme.border}` }} className="table-row">
                  <td style={{ padding: '20px 30px', fontWeight: 700, opacity: 0.3, fontSize: '1.2rem', fontFamily: "'Crimson Pro', serif" }}>{index + 1}</td>
                  <td style={{ padding: '20px' }}>
                    <Link to={`/reader/${id}/${index}`} style={{ color: theme.textMain, textDecoration: 'none', fontWeight: 600, fontSize: '1.1rem' }}>{cap.title}</Link>
                  </td>
                  <td style={{ padding: '20px', color: theme.textMuted, fontSize: '0.9rem' }}>{cap.word_count || 0} palabras</td>
                  <td style={{ padding: '20px 30px', textAlign: 'right' }}>
                     <button onClick={() => navigate(`/edit-chapter/${cap.id}`)} style={{ background: 'none', border: 'none', color: theme.accent, cursor: 'pointer', fontWeight: 700, marginRight: '20px', fontSize: '0.75rem', letterSpacing: '0.5px' }}>EDITAR</button>
                     <button onClick={() => {}} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem', opacity: 0.7 }}>ELIMINAR</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .table-row:hover { background: rgba(255,255,255,0.02); }
        input::placeholder, textarea::placeholder { color: #555; }
      `}</style>
    </div>
  );
};

export default AuthorBookDetails;