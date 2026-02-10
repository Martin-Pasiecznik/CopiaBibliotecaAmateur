import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const BookReader = ({ darkMode, setDarkMode }) => {
  const { id } = useParams(); // Obtenemos el ID de la URL (ej: /book/1)
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState('serif');

  // --- BUSCAR DATOS DEL LIBRO EN PYTHON ---
  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/books/${id}`)
      .then(response => response.json())
      .then(data => {
        setBook(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching book details:', error);
        setLoading(false);
      });
  }, [id]); // Si el ID cambia, vuelve a buscar el libro

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading chapter...</div>;
  if (!book) return <div style={{ textAlign: 'center', padding: '50px' }}>Book not found.</div>;

  // Supongamos que mostramos el capítulo 1 por ahora
  const currentChapter = book.chapters[0];

  const readerTextStyle = {
    fontSize: `${fontSize}px`,
    fontFamily: fontFamily,
    lineHeight: '1.8',
    maxWidth: '750px',
    margin: '0 auto',
    textAlign: 'justify',
    color: darkMode ? '#d1d1d1' : '#2c3e50',
    whiteSpace: 'pre-wrap' // Mantiene los saltos de línea del texto
  };

  return (
    <div>
      {/* TOOLBAR DE AJUSTES */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        padding: '15px', 
        backgroundColor: darkMode ? '#1e1e1e' : '#eee',
        borderRadius: '8px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setFontSize(fontSize + 2)}>A+</button>
          <button onClick={() => setFontSize(fontSize - 2)}>A-</button>
          <select onChange={(e) => setFontFamily(e.target.value)} style={{ padding: '5px' }}>
            <option value="serif">Serif (Classic)</option>
            <option value="sans-serif">Sans (Modern)</option>
          </select>
        </div>
        
        <button onClick={() => setDarkMode(!darkMode)} style={{ borderRadius: '20px', padding: '5px 15px' }}>
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      {/* ANUNCIO DEL AUTOR (AUTHOR NOTE) */}
      <div style={{ 
        backgroundColor: darkMode ? '#1a3a5a' : '#e3f2fd', 
        padding: '20px', 
        borderRadius: '8px', 
        borderLeft: '5px solid #3498db',
        marginBottom: '30px' 
      }}>
        <strong style={{ color: '#3498db' }}>Author's Note:</strong>
        <p style={{ marginTop: '10px', fontStyle: 'italic' }}>
          "Thanks for reading {book.title}! This is a data-driven announcement from Python."
        </p>
      </div>

      {/* CONTENIDO DEL CAPÍTULO */}
      <main>
        <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>{currentChapter.title}</h1>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: '40px' }}>by {book.author}</p>
        
        <div style={readerTextStyle}>
          {currentChapter.content}
        </div>
      </main>

      {/* NAVEGACIÓN ENTRE CAPÍTULOS */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', margin: '50px 0', paddingBottom: '50px' }}>
        <button style={navBtnStyle} disabled>← Previous</button>
        <button style={navBtnStyle}>Next Chapter →</button>
      </div>
    </div>
  );
};

const navBtnStyle = {
  padding: '12px 25px',
  backgroundColor: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

export default BookReader;