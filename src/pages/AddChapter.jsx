import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const AddChapter = ({ user, darkMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [issubmitting, setIsSubmitting] = useState(false);

  // ARMONIZACIÓN: Sistema de diseño unificado
  const theme = {
    bg: darkMode ? '#0a0b10' : '#f4f0ea',
    card: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.7)',
    accent: darkMode ? '#d4af37' : '#b85b3f', 
    textMain: darkMode ? '#e3e1db' : '#2b2824',
    textMuted: darkMode ? '#8a8782' : '#857f77',
    border: darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(184, 91, 63, 0.2)',
    inputBg: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
  };

  const countWords = (text) => {
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  };

  const wordCount = countWords(content);

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '150px 20px', color: theme.textMain }}>
        <h2 style={{ fontFamily: "'Crimson Pro', serif", fontSize: '2rem' }}>Acceso Denegado</h2>
        <p style={{ opacity: 0.7 }}>Debes iniciar sesión para escribir capítulos.</p>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const chapterData = {
      book_id: id,
      title: title,
      content: content,
      word_count: wordCount, 
      author_email: user.email 
    };

    fetch('http://127.0.0.1:5001/api/chapters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chapterData)
    })
    .then(res => {
      if (!res.ok) throw new Error("Error al guardar el capítulo.");
      return res.json();
    })
    .then(() => {
      navigate(`/dashboard/book/${id}`);
    })
    .catch(err => {
      alert(err.message);
      setIsSubmitting(false);
    });
  };

  return (
    <div style={{ 
      maxWidth: '900px', 
      margin: '0 auto', 
      padding: '120px 20px 60px 20px', 
      color: theme.textMain,
      fontFamily: "'Inter', sans-serif"
    }}>
      
      <button 
        onClick={() => navigate(-1)} 
        style={{ 
          background: 'none', border: 'none', color: theme.textMuted, 
          cursor: 'pointer', marginBottom: '30px', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: '8px'
        }}
      >
        ← Cancelar y salir
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
        
        <header style={{ marginBottom: '30px' }}>
          <h2 style={{ 
            fontFamily: "'Crimson Pro', serif", 
            fontSize: '2.2rem', 
            margin: 0,
            color: theme.accent 
          }}>Nuevo Capítulo</h2>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
             <span style={badgeStyle(theme)}>
                📝 {wordCount} palabras
             </span>
             <span style={{...badgeStyle(theme), color: theme.accent, borderColor: theme.accent}}>
                📖 Lectura: {Math.ceil(wordCount / 200)} min
             </span>
          </div>
        </header>
        
        <form onSubmit={handleSubmit}>
          <input 
            style={inputStyle(theme, true)}
            placeholder="Título del capítulo..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          
          <textarea 
            style={inputStyle(theme, false)}
            placeholder="Comienza a escribir tu historia aquí..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px' }}>
            <button 
              type="submit" 
              disabled={issubmitting}
              style={{
                padding: '16px 45px',
                backgroundColor: theme.accent,
                color: darkMode ? '#000' : '#fff',
                border: 'none',
                borderRadius: '50px',
                cursor: issubmitting ? 'not-allowed' : 'pointer',
                fontWeight: 800,
                fontSize: '1rem',
                boxShadow: `none`,
                transition: 'all 0.3s ease',
                opacity: issubmitting ? 0.6 : 1
              }}
            >
              {issubmitting ? 'Publicando...' : 'Publicar Capítulo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- ESTILOS AUXILIARES ---
const badgeStyle = (theme) => ({
  padding: '6px 14px',
  backgroundColor: theme.darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)', // Fondo sutil
  border: `1px solid ${theme.border}`,
  borderRadius: '20px',
  fontSize: '0.75rem',
  color: theme.textMuted, // Ambos quedan en el color gris/atenuado
  fontWeight: 700,
  letterSpacing: '0.5px'
});

const inputStyle = (theme, isTitle) => ({
  width: '100%',
  padding: '20px',
  marginBottom: '20px',
  borderRadius: '12px',
  border: `1px solid ${theme.border}`,
  backgroundColor: theme.inputBg,
  color: theme.textMain,
  fontSize: isTitle ? '1.5rem' : '1.2rem',
  fontWeight: isTitle ? '700' : '400',
  fontFamily: isTitle ? "'Crimson Pro', serif" : "'Crimson Pro', serif",
  lineHeight: '1.6',
  outline: 'none',
  boxSizing: 'border-box',
  height: isTitle ? 'auto' : '500px',
  resize: isTitle ? 'none' : 'vertical',
  transition: 'border-color 0.3s ease'
});

export default AddChapter;