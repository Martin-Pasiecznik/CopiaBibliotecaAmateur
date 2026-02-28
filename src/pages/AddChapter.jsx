import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const AddChapter = ({ user, darkMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [issubmitting, setIsSubmitting] = useState(false);

  // --- LÓGICA DE CONTEO EN TIEMPO REAL ---
  const countWords = (text) => {
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  };

  const wordCount = countWords(content);

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
      // Enviamos el conteo al backend por si acaso, aunque el backend ya lo calcula
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
      alert("¡Capítulo publicado con éxito!");
      navigate(`/dashboard/book/${id}`); // Volver a los detalles del libro
    })
    .catch(err => {
      alert(err.message);
      setIsSubmitting(false);
    });
  };

  // --- ESTILOS ---
  const containerStyle = {
    maxWidth: '900px',
    margin: '40px auto',
    padding: '30px',
    backgroundColor: darkMode ? '#1a1d23' : '#fff',
    borderRadius: '15px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
    color: darkMode ? '#fff' : '#000'
  };

  const inputStyle = {
    width: '100%',
    padding: '15px',
    marginBottom: '20px',
    borderRadius: '8px',
    border: `1px solid ${darkMode ? '#333' : '#eee'}`,
    backgroundColor: darkMode ? '#2d2d2d' : '#f9f9f9',
    color: darkMode ? '#fff' : '#000',
    fontSize: '1.4rem',
    fontWeight: 'bold',
    outline: 'none'
  };

  const textareaStyle = {
    ...inputStyle,
    height: '450px',
    fontSize: '1.1rem',
    fontWeight: 'normal',
    lineHeight: '1.8',
    resize: 'vertical',
    fontFamily: 'serif'
  };

  const wordCountBadge = {
    padding: '8px 15px',
    backgroundColor: darkMode ? '#333' : '#f0f0f0',
    borderRadius: '20px',
    fontSize: '0.9rem',
    color: wordCount > 500 ? '#2ecc71' : (darkMode ? '#aaa' : '#666'),
    fontWeight: 'bold',
    display: 'inline-block',
    marginBottom: '10px'
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ marginBottom: '10px', color: '#3498db' }}>Nuevo Capítulo</h2>
      
      {/* CUADRITO DE INFORMACIÓN */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
         <span style={wordCountBadge}>
            📝 {wordCount} palabras
         </span>
         <span style={{...wordCountBadge, color: '#3498db'}}>
            📖 Lectura estimada: {Math.ceil(wordCount / 200)} min
         </span>
      </div>
      
      <form onSubmit={handleSubmit}>
        <input 
          style={inputStyle}
          placeholder="Título del capítulo..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        
        <textarea 
          style={textareaStyle}
          placeholder="Comienza a escribir tu historia aquí..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
          <button 
            type="button" 
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ❌ Cancelar y salir
          </button>
          
          <button 
            type="submit" 
            style={{
                padding: '15px 40px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '30px',
                cursor: issubmitting ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                boxShadow: '0 4px 15px rgba(52, 152, 219, 0.4)'
            }} 
            disabled={issubmitting}
          >
            {issubmitting ? 'Guardando...' : 'Publicar Capítulo'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddChapter;