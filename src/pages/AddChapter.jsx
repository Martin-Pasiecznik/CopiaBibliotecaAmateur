import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const AddChapter = ({ user, darkMode }) => {
  const { id } = useParams(); // Obtiene el ID del libro de la URL
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [issubmitting, setIsSubmitting] = useState(false);

  // Si alguien intenta entrar sin estar logueado, lo mandamos afuera
  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Acceso Denegado</h2>
        <p>Debes iniciar sesión para escribir capítulos.</p>
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
      author_email: user.email // Usamos el email real de Google
    };

    fetch('http://127.0.0.1:5001/api/chapters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chapterData)
    })
    .then(res => {
      if (!res.ok) throw new Error("No tienes permiso para editar este libro.");
      return res.json();
    })
    .then(() => {
      alert("¡Capítulo publicado con éxito!");
      navigate('/dashboard');
    })
    .catch(err => {
      alert(err.message);
      setIsSubmitting(false);
    });
  };

  // Estilos
  const containerStyle = {
    maxWidth: '800px',
    margin: '40px auto',
    padding: '20px',
    backgroundColor: darkMode ? '#1e1e1e' : '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    marginBottom: '20px',
    borderRadius: '8px',
    border: `1px solid ${darkMode ? '#444' : '#ddd'}`,
    backgroundColor: darkMode ? '#2d2d2d' : '#fff',
    color: darkMode ? '#fff' : '#000',
    fontSize: '1.2rem',
    outline: 'none'
  };

  const textareaStyle = {
    ...inputStyle,
    height: '400px',
    fontSize: '1.1rem',
    lineHeight: '1.6',
    resize: 'vertical'
  };

  const buttonStyle = {
    padding: '12px 30px',
    backgroundColor: '#2ecc71',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    cursor: issubmitting ? 'not-allowed' : 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
    opacity: issubmitting ? 0.7 : 1
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ marginBottom: '20px', color: '#3498db' }}>Escribir Nuevo Capítulo</h2>
      <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Editando libro ID: {id}</p>
      
      <form onSubmit={handleSubmit}>
        <input 
          style={inputStyle}
          placeholder="Título del capítulo (ej: El inicio de la aventura)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        
        <textarea 
          style={textareaStyle}
          placeholder="Había una vez..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            type="button" 
            onClick={() => navigate('/dashboard')}
            style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}
          >
            Cancelar
          </button>
          
          <button type="submit" style={buttonStyle} disabled={issubmitting}>
            {issubmitting ? 'Publicando...' : 'Publicar Capítulo'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddChapter;