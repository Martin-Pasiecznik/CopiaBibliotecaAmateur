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

  // --- ACCIONES DE CAPÍTULOS ---

  const handleDeleteChapter = async (chapterId, title) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el capítulo: "${title}"?`)) {
      try {
        const res = await fetch(`http://127.0.0.1:5001/api/chapters/${chapterId}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          loadData(); // Recargar datos tras borrar
        }
      } catch (err) {
        console.error("Error al borrar capítulo:", err);
      }
    }
  };

  const handleEditChapter = (chapterId) => {
    // Redirige a una vista de edición (debes tener esta ruta creada en tu App.js)
    navigate(`/edit-chapter/${chapterId}`);
  };

  // --- GESTIÓN DE LIBRO ---

  const handleTagClick = (tag) => {
    const currentTags = editData.tags ? editData.tags.split(',').map(t => t.trim()).filter(t => t !== "") : [];
    if (currentTags.includes(tag)) {
      setEditData({ ...editData, tags: currentTags.filter(t => t !== tag).join(', ') });
    } else {
      setEditData({ ...editData, tags: [...currentTags, tag].join(', ') });
    }
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
      alert("¡Libro actualizado!");
    }
  };

  if (loading) return <div style={{padding: '100px', textAlign: 'center'}}>Cargando datos...</div>;

  const chartData = chapters.map((cap, index) => ({
    name: `Cap ${index + 1}`,
    palabras: cap.word_count || 0,
    vistas: Math.round(book.views / (index + 1.2)) 
  }));

  const theme = {
    card: darkMode ? '#1a1d23' : '#fff',
    text: darkMode ? '#eee' : '#222',
    border: darkMode ? '#333' : '#eee',
    accent: '#3498db',
    grid: darkMode ? '#333' : '#f0f0f0',
    input: darkMode ? '#2d2d2d' : '#f9f9f9',
    tagBg: darkMode ? '#34495e' : '#e1f0fa'
  };

  const EditModal = () => (
    <div style={modalOverlayStyle}>
      <div style={{ ...modalContentStyle, backgroundColor: theme.card, border: `1px solid ${theme.border}`, color: theme.text }}>
        <h2 style={{ color: theme.accent, marginTop: 0 }}>Editar Detalles del Libro</h2>
        <form onSubmit={handleUpdateBook}>
          <label style={labelStyle}>Título</label>
          <input style={{...inputStyle, backgroundColor: theme.input, color: theme.text, border: `1px solid ${theme.border}`}} value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} />
          
          <label style={labelStyle}>Sinopsis</label>
          <textarea style={{...inputStyle, height: '80px', backgroundColor: theme.input, color: theme.text, border: `1px solid ${theme.border}`}} value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})} />
          
          <label style={labelStyle}>Tags (Sugeridos)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
            {suggestedTags.map(tag => (
              <span key={tag} onClick={() => handleTagClick(tag)} style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', cursor: 'pointer', backgroundColor: editData.tags.includes(tag) ? theme.accent : theme.tagBg, color: editData.tags.includes(tag) ? '#fff' : theme.text }}>{tag}</span>
            ))}
          </div>
          <input style={{...inputStyle, backgroundColor: theme.input, color: theme.text, border: `1px solid ${theme.border}`}} value={editData.tags} onChange={e => setEditData({...editData, tags: e.target.value})} placeholder="Tags separados por coma" />
          
          <label style={labelStyle}>Portada</label>
          <input type="file" style={{marginBottom: '20px'}} onChange={e => setNewCover(e.target.files[0])} />
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" style={btnStyle}>Guardar</button>
            <button type="button" onClick={() => setShowEditModal(false)} style={{...btnStyle, backgroundColor: '#7f8c8d'}}>Cerrar</button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '40px 0', color: theme.text }}>
      {showEditModal && <EditModal />}
      
      <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: theme.accent, cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' }}>
        ← Volver al Studio
      </button>

      {/* HEADER */}
      <div style={{ display: 'flex', gap: '30px', marginBottom: '40px', alignItems: 'center', flexWrap: 'wrap' }}>
        <img 
          src={`http://127.0.0.1:5001/static/covers/${book.author_note}`} 
          style={{ width: '150px', borderRadius: '8px', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}
          alt="Portada"
          onError={(e) => e.target.src = "https://placehold.jp/150x225.png?text=Sin+Portada"}
        />
        <div>
          <h1 style={{ margin: 0, fontSize: '2.5rem' }}>{book.title}</h1>
          <div style={{ display: 'flex', gap: '5px', margin: '10px 0' }}>
            {book.tags?.split(',').map(tag => tag.trim() && (
              <span key={tag} style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '10px', backgroundColor: theme.accent, color: '#fff' }}>{tag}</span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button onClick={() => navigate(`/add-chapter/${id}`)} style={btnStyle}>➕ Añadir Capítulo</button>
            <button onClick={() => setShowEditModal(true)} style={{...btnStyle, backgroundColor: '#e67e22'}}>⚙️ Editar Libro</button>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{...statCard, backgroundColor: theme.card, border: `1px solid ${theme.border}` }}>
          <span style={statLabel}>LECTURAS TOTALES</span>
          <h2 style={{ color: theme.accent }}>{book.views}</h2>
        </div>
        <div style={{...statCard, backgroundColor: theme.card, border: `1px solid ${theme.border}` }}>
          <span style={statLabel}>PALABRAS</span>
          <h2>{chapters.reduce((acc, cap) => acc + (cap.word_count || 0), 0).toLocaleString()}</h2>
        </div>
      </div>

      {/* GRÁFICOS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{...chartWrapper, backgroundColor: theme.card, border: `1px solid ${theme.border}`}}>
          <h4 style={{ marginBottom: '20px', opacity: 0.7 }}>Extensión (Palabras)</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
              <XAxis dataKey="name" stroke={theme.text} fontSize={12} />
              <YAxis stroke={theme.text} fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: theme.card, border: `1px solid ${theme.border}`, borderRadius: '8px' }} />
              <Bar dataKey="palabras" fill={theme.accent} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{...chartWrapper, backgroundColor: theme.card, border: `1px solid ${theme.border}`}}>
          <h4 style={{ marginBottom: '20px', opacity: 0.7 }}>Retención (Vistas)</h4>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
              <XAxis dataKey="name" stroke={theme.text} fontSize={12} />
              <YAxis stroke={theme.text} fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: theme.card, border: `1px solid ${theme.border}` }} />
              <Area type="monotone" dataKey="vistas" stroke="#2ecc71" fill="#2ecc71" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TABLA DE CAPÍTULOS ACTUALIZADA */}
      <div style={{ backgroundColor: theme.card, borderRadius: '12px', overflow: 'hidden', border: `1px solid ${theme.border}` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(0,0,0,0.05)', textAlign: 'left' }}>
              <th style={thStyle}>#</th>
              <th style={thStyle}>Título</th>
              <th style={thStyle}>Palabras</th>
              <th style={thStyle}>💬 Coment.</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {chapters.map((cap, index) => (
              <tr key={cap.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                <td style={tdStyle}>{index + 1}</td>
                <td style={tdStyle}>
                  <Link to={`/reader/${id}/${index}`} style={{ color: theme.accent, textDecoration: 'none', fontWeight: 'bold' }}>{cap.title}</Link>
                </td>
                <td style={tdStyle}>{cap.word_count || 0}</td>
                <td style={tdStyle}>{cap.comments_count || 0}</td>
                <td style={tdStyle}>
                   <button 
                    onClick={() => handleEditChapter(cap.id)} 
                    style={actionBtn}
                   >
                    📝 Editar
                   </button>
                   <button 
                    onClick={() => handleDeleteChapter(cap.id, cap.title)} 
                    style={{...actionBtn, color: '#e74c3c'}}
                   >
                    🗑️ Borrar
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Estilos ---
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' };
const modalContentStyle = { padding: '30px', borderRadius: '15px', width: '100%', maxWidth: '600px', maxHeight: '95vh', overflowY: 'auto' };
const labelStyle = { display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: 'bold' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '1rem', outline: 'none' };
const btnStyle = { padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#3498db', color: 'white', fontWeight: 'bold', cursor: 'pointer' };
const statCard = { padding: '20px', borderRadius: '15px', textAlign: 'center' };
const statLabel = { fontSize: '0.7rem', opacity: 0.6, fontWeight: 'bold' };
const thStyle = { padding: '15px 20px', fontSize: '0.9rem', opacity: 0.7 };
const tdStyle = { padding: '15px 20px' };
const actionBtn = { background: 'none', border: 'none', color: '#3498db', cursor: 'pointer', fontWeight: 'bold', marginRight: '10px' };
const chartWrapper = { padding: '20px', borderRadius: '15px' };

export default AuthorBookDetails;