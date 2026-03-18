import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EditChapter = ({ darkMode }) => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ARMONIZACIÓN: Usando los mismos colores de tu App.js
  const theme = {
    bg: darkMode ? '#0a0b10' : '#f4f0ea',
    card: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.7)',
    accent: darkMode ? '#d4af37' : '#b85b3f', // Oro / Terracota
    textMain: darkMode ? '#e3e1db' : '#2b2824',
    textMuted: darkMode ? '#8a8782' : '#857f77',
    border: darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(184, 91, 63, 0.2)',
    inputBg: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
  };

  useEffect(() => {
    fetch(`http://127.0.0.1:5001/api/chapters/${chapterId}`) 
      .then(res => {
        if (!res.ok) throw new Error("No se encontró el capítulo");
        return res.json();
      })
      .then(data => {
        setTitle(data.title);
        setContent(data.content);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando capítulo:", err);
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
        navigate(-1);
      }
    } catch (err) {
      alert("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <div className="spinner"></div> {/* Reutiliza tu clase spinner de App.css */}
    </div>
  );

  return (
    <div style={{ 
      maxWidth: '900px', 
      margin: '0 auto', 
      padding: '120px 20px 60px 20px', // Padding superior para no chocar con la píldora
      color: theme.textMain,
      fontFamily: "'Inter', sans-serif"
    }}>
      
      <button 
        onClick={() => navigate(-1)} 
        style={{ 
          background: 'none', border: 'none', color: theme.textMuted, 
          cursor: 'pointer', marginBottom: '30px', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: '8px', transition: '0.3s'
        }}
        onMouseOver={(e) => e.target.style.color = theme.accent}
        onMouseOut={(e) => e.target.style.color = theme.textMuted}
      >
        ← Volver al panel
      </button>

      <div style={{ 
        backgroundColor: theme.card, 
        padding: '40px', 
        borderRadius: '24px', 
        border: `1px solid ${theme.border}`,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
      }}>
        
        <header style={{ marginBottom: '40px' }}>
          <h2 style={{ 
            fontFamily: "'Crimson Pro', serif", 
            fontSize: '2.2rem', 
            margin: 0,
            color: theme.accent 
          }}>Editar Capítulo</h2>
          <p style={{ color: theme.textMuted, fontSize: '0.9rem' }}>Refina tu historia y mantén a tus lectores enganchados.</p>
        </header>
        
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '25px' }}>
            <label style={labelStyle(theme)}>TÍTULO DEL CAPÍTULO</label>
            <input 
              style={inputStyle(theme)}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: El inicio del fin..."
              required
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={labelStyle(theme)}>CONTENIDO DE LA OBRA</label>
            <textarea 
              style={{ 
                ...inputStyle(theme), 
                height: '500px',
                fontFamily: "'Crimson Pro', serif",
                fontSize: '1.25rem',
                lineHeight: '1.7',
                resize: 'vertical',
                padding: '20px'
              }}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
            <button 
              type="submit" 
              disabled={saving}
              style={{ 
                ...btnStyle(theme, true),
                opacity: saving ? 0.6 : 1,
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              style={btnStyle(theme, false)}
            >
              Descartar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Estilos dinámicos para mantener la armonía
const labelStyle = (theme) => ({
  display: 'block', 
  marginBottom: '10px', 
  fontSize: '0.75rem', 
  fontWeight: 800, 
  letterSpacing: '1.5px',
  color: theme.accent,
  opacity: 0.8
});

const inputStyle = (theme) => ({
  width: '100%', 
  padding: '15px', 
  borderRadius: '12px', 
  backgroundColor: theme.inputBg, 
  color: theme.textMain, 
  border: `1px solid ${theme.border}`,
  fontSize: '1rem', 
  outline: 'none', 
  boxSizing: 'border-box',
  transition: 'border-color 0.3s ease'
});

const btnStyle = (theme, isPrimary) => ({
  padding: '14px 30px', 
  borderRadius: '12px', 
  border: isPrimary ? 'none' : `1px solid ${theme.border}`, 
  backgroundColor: isPrimary ? theme.accent : 'transparent', 
  color: isPrimary ? (theme.bg === '#0a0b10' ? '#000' : '#fff') : theme.textMain, 
  fontWeight: 700, 
  fontSize: '0.9rem',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  flex: 1
});

export default EditChapter;