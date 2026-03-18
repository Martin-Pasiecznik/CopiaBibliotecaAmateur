import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PublishBook = ({ user, darkMode, refreshBooks }) => { 
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState(''); 
  const [cover, setCover] = useState(null); 
  const navigate = useNavigate();

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

  const suggestedGenres = ["Terror", "Romance", "Fantasía", "Ciencia Ficción", "Misterio", "Aventura"];

  const handleGenreClick = (genre) => {
    if (!tags.includes(genre)) {
      setTags(tags === "" ? genre : `${tags}, ${genre}`);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("La imagen es demasiado pesada. El límite es 2MB.");
        e.target.value = ""; 
        setCover(null);
        return;
      }
      setCover(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      alert("Debes iniciar sesión para publicar.");
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', user.name);
    formData.append('description', description);
    formData.append('author_email', user.email);
    formData.append('tags', tags); 
    if (cover) formData.append('cover', cover);

    fetch('http://127.0.0.1:5001/api/books', {
      method: 'POST',
      body: formData 
    })
    .then(res => {
      if (res.ok) {
        if (refreshBooks) refreshBooks(); 
        navigate('/dashboard'); 
      }
    })
    .catch(err => console.error("Error:", err));
  };

  return (
    <div style={{ 
      maxWidth: '700px', 
      margin: '0 auto', 
      padding: '120px 20px 60px 20px', // Respetando la píldora
      color: theme.textMain,
      fontFamily: "'Inter', sans-serif"
    }}>
      
      <div style={{ 
        backgroundColor: theme.card, 
        padding: '40px', 
        borderRadius: '24px', 
        border: `1px solid ${theme.border}`,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}>
        
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontFamily: "'Crimson Pro', serif", fontSize: '2.2rem', margin: 0, color: theme.accent }}>
            Publicar Nueva Historia
          </h2>
          <p style={{ fontSize: '0.85rem', color: theme.textMuted, marginTop: '10px' }}>
            Autor: <strong style={{ color: theme.textMain }}>{user?.name || "Invitado"}</strong>
          </p>
        </header>

        <form onSubmit={handleSubmit}>
          <label style={labelStyle(theme)}>TÍTULO DE LA OBRA</label>
          <input 
            placeholder="Ej: La Leyenda del Norte" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            style={inputStyle(theme)} 
            required 
          />
          
          <label style={labelStyle(theme)}>SINOPSIS / DESCRIPCIÓN</label>
          <textarea 
            placeholder="Escribe una breve sinopsis para atraer a tus lectores..." 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            style={{...inputStyle(theme), height: '120px', resize: 'none'}} 
            required 
          />

          <label style={labelStyle(theme)}>GÉNEROS Y ETIQUETAS</label>
          <input 
            placeholder="Terror, Suspenso, Cyberpunk..." 
            value={tags} 
            onChange={e => setTags(e.target.value)} 
            style={inputStyle(theme)} 
          />
          
          <div style={{ marginBottom: '30px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {suggestedGenres.map(genre => (
              <button
                key={genre}
                type="button"
                onClick={() => handleGenreClick(genre)}
                style={genreBtnStyle(theme)}
              >
                + {genre}
              </button>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <label style={{...labelStyle(theme), textAlign: 'center'}}>VISTA PREVIA DE PORTADA</label>
            <div style={{
              width: '150px',
              aspectRatio: '2/3',
              backgroundColor: theme.inputBg,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${theme.border}`, 
              margin: '15px auto',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)' 
            }}>
              <img 
                src={cover ? URL.createObjectURL(cover) : "http://127.0.0.1:5001/static/covers/default_cover.jpeg"} 
                alt="Preview" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              style={{ fontSize: '0.8rem', color: theme.textMuted, cursor: 'pointer' }}
            />
          </div>

          <button type="submit" style={submitBtnStyle(theme)}>
            Confirmar y Publicar
          </button>
        </form>
      </div>
    </div>
  );
};

// --- ESTILOS AUXILIARES ---
const labelStyle = (theme) => ({
  display: 'block', marginBottom: '10px', fontSize: '0.75rem', fontWeight: 800, 
  letterSpacing: '1.5px', color: theme.accent, opacity: 0.8
});

const inputStyle = (theme) => ({
  width: '100%', padding: '15px', marginBottom: '25px', borderRadius: '12px',
  backgroundColor: theme.inputBg, color: theme.textMain, border: `1px solid ${theme.border}`,
  fontSize: '1rem', outline: 'none', boxSizing: 'border-box'
});

const genreBtnStyle = (theme) => ({
  padding: '6px 14px', borderRadius: '20px', border: `1px solid ${theme.border}`,
  backgroundColor: 'transparent', color: theme.textMuted, fontSize: '0.75rem', 
  cursor: 'pointer', fontWeight: 600, transition: '0.3s'
});

const submitBtnStyle = (theme) => ({
  width: '100%', padding: '16px', backgroundColor: theme.accent, 
  color: theme.bg === '#0a0b10' ? '#000' : '#fff', border: 'none', 
  borderRadius: '50px', cursor: 'pointer', fontWeight: 800, fontSize: '1rem',
  transition: '0.3s', boxShadow: 'none' // Sin sombra, como pediste
});

export default PublishBook;