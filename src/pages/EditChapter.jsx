import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EditChapter = ({ darkMode }) => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estilos basados en tu sistema de diseño
  const theme = {
    card: darkMode ? '#1a1d23' : '#fff',
    text: darkMode ? '#eee' : '#222',
    border: darkMode ? '#333' : '#eee',
    accent: '#3498db',
    input: darkMode ? '#2d2d2d' : '#f9f9f9',
  };

useEffect(() => {
  // 1. Necesitamos el capítulo específico. 
  // Usamos el ID del capítulo que viene en la URL
  fetch(`http://127.0.0.1:5001/api/chapters/${chapterId}`) 
    .then(res => {
      if (!res.ok) throw new Error("No se encontró el capítulo");
      return res.json();
    })
    .then(data => {
      // 'data' ya debería ser el objeto del capítulo
      setTitle(data.title);
      setContent(data.content);
      setLoading(false);
    })
    .catch(err => {
      console.error("Error cargando capítulo:", err);
      alert("No se pudo cargar el capítulo.");
      setLoading(false);
    });
}, [chapterId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`http://127.0.0.1:5001/api/chapters/${chapterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });

      if (res.ok) {
        alert("Capítulo actualizado con éxito");
        navigate(-1); // Volver atrás
      }
    } catch (err) {
      alert("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{textAlign: 'center', padding: '50px', color: theme.text}}>Cargando editor...</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', color: theme.text }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ background: 'none', border: 'none', color: theme.accent, cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' }}
      >
        ← Cancelar y Volver
      </button>

      <div style={{ backgroundColor: theme.card, padding: '30px', borderRadius: '15px', border: `1px solid ${theme.border}` }}>
        <h2 style={{ marginTop: 0, color: theme.accent }}>Editar Capítulo</h2>
        
        <form onSubmit={handleSave}>
          <label style={labelStyle}>Título del Capítulo</label>
          <input 
            style={{ ...inputStyle, backgroundColor: theme.input, color: theme.text, border: `1px solid ${theme.border}` }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label style={labelStyle}>Contenido</label>
          <textarea 
            style={{ 
              ...inputStyle, 
              backgroundColor: theme.input, 
              color: theme.text, 
              border: `1px solid ${theme.border}`,
              height: '400px',
              fontFamily: 'serif',
              fontSize: '1.1rem',
              lineHeight: '1.6'
            }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button 
              type="submit" 
              disabled={saving}
              style={{ ...btnStyle, opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Guardando...' : '💾 Guardar Cambios'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              style={{ ...btnStyle, backgroundColor: '#7f8c8d' }}
            >
              Descartar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Reutilizando tus estilos
const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 'bold' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' };
const btnStyle = { padding: '12px 25px', borderRadius: '8px', border: 'none', backgroundColor: '#3498db', color: 'white', fontWeight: 'bold', cursor: 'pointer' };

export default EditChapter;