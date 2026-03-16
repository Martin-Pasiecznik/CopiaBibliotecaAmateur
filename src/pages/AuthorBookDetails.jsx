import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';

const AuthorBookDetails = ({ user, darkMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ title: '', description: '', tags: '' });
  const [newCover, setNewCover] = useState(null);

  const suggestedTags = ["Fantasía", "Romance", "Aventura", "Terror", "Ciencia Ficción", "Misterio", "Drama", "Acción", "Suspenso", "Histórico"];

  const theme = {
    bg: darkMode ? '#0a0b10' : '#f4f0ea',
    card: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.7)',
    accent: darkMode ? '#d4af37' : '#b85b3f',
    textMain: darkMode ? '#e3e1db' : '#2b2824',
    textMuted: darkMode ? '#8a8782' : '#857f77',
    border: darkMode ? 'rgba(212, 175, 55, 0.15)' : 'rgba(184, 91, 63, 0.15)',
    input: darkMode ? '#11131a' : '#fff'
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = () => {
    Promise.all([
      fetch(`http://127.0.0.1:5001/api/books/${id}`).then(res => res.json()),
      fetch(`http://127.0.0.1:5001/api/books/${id}/chapters`).then(res => res.json())
    ]).then(([bookData, chaptersData]) => {
      setBook(bookData);
      setChapters(chaptersData);
      setEditData({ title: bookData.title, description: bookData.description, tags: bookData.tags || "" });
      setLoading(false);
    });
  };

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

  if (loading) return <div style={{padding: '100px', textAlign: 'center', color: theme.accent}}>Analizando manuscrito...</div>;

  const chartData = chapters.map((cap, index) => ({
    name: `Cap ${index + 1}`,
    palabras: cap.word_count || 0,
    vistas: Math.round(book.views / (index + 1.2)) 
  }));

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
    <div style={{ padding: '40px 0', color: theme.textMain, fontFamily: "'Inter', sans-serif" }}>
      {showEditModal && <EditModal />}
      
      <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', marginBottom: '30px', fontWeight: 600, fontSize: '0.9rem' }}>
        ← VOLVER AL STUDIO
      </button>

      {/* HEADER TÉCNICO */}
      <div style={{ display: 'flex', gap: '40px', marginBottom: '60px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
            <img 
            src={`http://127.0.0.1:5001/static/covers/${book.author_note}`} 
            style={{ width: '180px', borderRadius: '12px', boxShadow: `0 20px 40px rgba(0,0,0,${darkMode ? '0.5' : '0.2'})`, border: `1px solid ${theme.border}` }}
            alt="Portada"
            onError={(e) => e.target.src = "https://placehold.jp/180x270.png?text=Sin+Portada"}
            />
            <div style={{ position: 'absolute', top: -10, left: -10, background: theme.accent, color: darkMode ? '#000' : '#fff', padding: '5px 12px', borderRadius: '5px', fontSize: '0.7rem', fontWeight: 800 }}>PRO</div>
        </div>
        
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: '3rem', fontFamily: "'Crimson Pro', serif", fontWeight: 400 }}>{book.title}</h1>
          <p style={{ color: theme.textMuted, fontSize: '1.1rem', maxWidth: '600px', margin: '15px 0' }}>{book.description?.substring(0, 180)}...</p>
          
          <div style={{ display: 'flex', gap: '12px', marginTop: '25px' }}>
            <button onClick={() => navigate(`/add-chapter/${id}`)} style={{ padding: '12px 25px', borderRadius: '50px', border: 'none', backgroundColor: theme.accent, color: darkMode ? '#000' : '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: `0 10px 20px ${theme.accent}30` }}>
              ✦ AÑADIR CAPÍTULO
            </button>
            <button onClick={() => setShowEditModal(true)} style={{ padding: '12px 25px', borderRadius: '50px', border: `1px solid ${theme.border}`, backgroundColor: 'transparent', color: theme.textMain, fontWeight: 600, cursor: 'pointer' }}>
              CONFIGURACIÓN
            </button>
          </div>
        </div>
      </div>

      {/* MÉTRICAS CLAVE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '25px', marginBottom: '40px' }}>
        <div style={{ padding: '30px', borderRadius: '20px', backgroundColor: theme.card, border: `1px solid ${theme.border}`, textAlign: 'center', backdropFilter: 'blur(10px)' }}>
          <span style={{ fontSize: '0.75rem', color: theme.textMuted, fontWeight: 800, letterSpacing: '1px' }}>LECTURAS TOTALES</span>
          <h2 style={{ color: theme.accent, fontSize: '2.5rem', margin: '10px 0 0 0', fontFamily: "'Crimson Pro', serif" }}>{book.views}</h2>
        </div>
        <div style={{ padding: '30px', borderRadius: '20px', backgroundColor: theme.card, border: `1px solid ${theme.border}`, textAlign: 'center', backdropFilter: 'blur(10px)' }}>
          <span style={{ fontSize: '0.75rem', color: theme.textMuted, fontWeight: 800, letterSpacing: '1px' }}>VOLUMEN DE PALABRAS</span>
          <h2 style={{ color: theme.textMain, fontSize: '2.5rem', margin: '10px 0 0 0', fontFamily: "'Crimson Pro', serif" }}>{chapters.reduce((acc, cap) => acc + (cap.word_count || 0), 0).toLocaleString()}</h2>
        </div>
        <div style={{ padding: '30px', borderRadius: '20px', backgroundColor: theme.card, border: `1px solid ${theme.border}`, textAlign: 'center', backdropFilter: 'blur(10px)' }}>
          <span style={{ fontSize: '0.75rem', color: theme.textMuted, fontWeight: 800, letterSpacing: '1px' }}>CAPÍTULOS</span>
          <h2 style={{ color: theme.textMain, fontSize: '2.5rem', margin: '10px 0 0 0', fontFamily: "'Crimson Pro', serif" }}>{chapters.length}</h2>
        </div>
      </div>

      {/* GRÁFICOS ANALÍTICOS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '30px', marginBottom: '50px' }}>
        <div style={{ padding: '30px', borderRadius: '20px', backgroundColor: theme.card, border: `1px solid ${theme.border}` }}>
          <h4 style={{ marginBottom: '25px', color: theme.textMuted, fontSize: '0.9rem', fontWeight: 700, letterSpacing: '1px' }}>EXTENSIÓN POR CAPÍTULO</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.border} vertical={false} />
              <XAxis dataKey="name" stroke={theme.textMuted} fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke={theme.textMuted} fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '10px', fontSize: '12px' }} />
              <Bar dataKey="palabras" fill={theme.accent} radius={[5, 5, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>

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
      </div>

      {/* ÍNDICE DE MANUSCRITO */}
      <div style={{ backgroundColor: theme.card, borderRadius: '20px', overflow: 'hidden', border: `1px solid ${theme.border}`, backdropFilter: 'blur(10px)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${theme.border}`, textAlign: 'left' }}>
              <th style={{ padding: '20px', fontSize: '0.8rem', color: theme.textMuted }}>ORDEN</th>
              <th style={{ padding: '20px', fontSize: '0.8rem', color: theme.textMuted }}>TÍTULO DEL CAPÍTULO</th>
              <th style={{ padding: '20px', fontSize: '0.8rem', color: theme.textMuted }}>PALABRAS</th>
              <th style={{ padding: '20px', fontSize: '0.8rem', color: theme.textMuted }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {chapters.map((cap, index) => (
              <tr key={cap.id} style={{ borderBottom: `1px solid ${theme.border}`, transition: 'background 0.3s' }} className="table-row">
                <td style={{ padding: '20px', fontWeight: 700, opacity: 0.5 }}>{String(index + 1).padStart(2, '0')}</td>
                <td style={{ padding: '20px' }}>
                  <Link to={`/reader/${id}/${index}`} style={{ color: theme.textMain, textDecoration: 'none', fontWeight: 600, fontFamily: "'Crimson Pro', serif", fontSize: '1.2rem' }}>{cap.title}</Link>
                </td>
                <td style={{ padding: '20px', color: theme.textMuted, fontSize: '0.9rem' }}>{cap.word_count || 0} palabras</td>
                <td style={{ padding: '20px' }}>
                   <button onClick={() => navigate(`/edit-chapter/${cap.id}`)} style={{ background: 'none', border: 'none', color: theme.accent, cursor: 'pointer', fontWeight: 700, marginRight: '20px', fontSize: '0.8rem' }}>EDITAR</button>
                   <button onClick={() => {/* Lógica borrar */}} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', opacity: 0.7 }}>ELIMINAR</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .table-row:hover { background: rgba(255,255,255,0.02); }
      `}</style>
    </div>
  );
};

export default AuthorBookDetails;