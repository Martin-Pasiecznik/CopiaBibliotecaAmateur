import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PublishBook = ({ user, darkMode, refreshBooks }) => { 
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState(''); 
  const [cover, setCover] = useState(null); 
  const navigate = useNavigate();

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
      alert("Debes iniciar sesión con Google para publicar.");
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', user.name);
    formData.append('description', description);
    formData.append('author_email', user.email);
    formData.append('tags', tags); 
    
    if (cover) {
      formData.append('cover', cover);
    }

    fetch('http://127.0.0.1:5001/api/books', {
      method: 'POST',
      body: formData 
    })
    .then(res => {
      if (res.ok) {
        if (refreshBooks) refreshBooks(); 
        alert("¡Libro Publicado con éxito!");
        navigate('/dashboard'); 
      } else {
        alert("Error en el servidor al publicar.");
      }
    })
    .catch(err => {
      console.error("Error:", err);
      alert("No se pudo conectar con el servidor.");
    });
  };

  const inputStyle = {
    display: 'block', width: '100%', padding: '10px', marginBottom: '15px',
    backgroundColor: darkMode ? '#333' : '#fff', color: darkMode ? '#fff' : '#000',
    border: '1px solid #555', borderRadius: '4px', boxSizing: 'border-box'
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center' }}>Publicar Nueva Historia</h2>
      
      <p style={{ fontSize: '0.9rem', color: '#3498db', textAlign: 'center' }}>
        Publicando como: <strong>{user?.name || "Invitado"}</strong>
      </p>

      <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
        <label>Título de la obra</label>
        <input 
          placeholder="Ej: Crónicas de la IA" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          style={inputStyle} 
          required 
        />
        
        <label>Sinopsis / Descripción</label>
        <textarea 
          placeholder="¿De qué trata tu libro?" 
          value={description} 
          onChange={e => setDescription(e.target.value)} 
          style={{...inputStyle, height: '100px'}} 
          required 
        />

        <label>Géneros / Etiquetas (separados por coma)</label>
        <input 
          placeholder="Ej: Terror, Suspenso, Cyberpunk" 
          value={tags} 
          onChange={e => setTags(e.target.value)} 
          style={inputStyle} 
        />
        <div style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {suggestedGenres.map(genre => (
            <button
              key={genre}
              type="button"
              onClick={() => handleGenreClick(genre)}
              style={{
                padding: '5px 10px', borderRadius: '15px', border: '1px solid #3498db',
                backgroundColor: 'transparent', color: '#3498db', fontSize: '0.75rem', cursor: 'pointer'
              }}
            >
              + {genre}
            </button>
          ))}
        </div>

  {/* --- VISTA PREVIA DE PORTADA --- */}
  <label style={{ display: 'block', marginBottom: '10px' }}>Vista previa de la portada</label>
  <div style={{
   width: '160px',
    aspectRatio: '2/3',
    backgroundColor: darkMode ? '#222' : '#f0f0f0',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `2px solid ${darkMode ? '#444' : '#ccc'}`, 
   margin: '0 auto 20px auto',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)' 
  }}>
    <img 
      //  usa el cover local; si no, usa el DEFAULT del servidor
     src={cover ? URL.createObjectURL(cover) : "http://127.0.0.1:5001/static/covers/default_cover.jpeg"} 
     alt="Preview" 
     style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
    />
  </div>

        <label>Subir Portada (Opcional - Máx. 2MB)</label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange} 
          style={inputStyle}
        />

        <button type="submit" style={{ padding: '15px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%', fontWeight: 'bold', fontSize: '1rem', marginTop: '10px' }}>
          Confirmar y Publicar
        </button>
      </form>
    </div>
  );
};

export default PublishBook;