import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PublishBook = ({ darkMode }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Dentro de handleSubmit en PublishBook.jsx
    const newBook = { 
    title, 
     author, 
     description, 
     author_email: "test@author.com" // <--- Por ahora usamos este de prueba
    };

    fetch('http://127.0.0.1:5001/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBook)
    })
    .then(res => res.json())
    .then(() => {
      alert("¡Libro Publicado!");
      window.location.href = "/"; // Forzamos recarga para ver el libro nuevo
      navigate('/');
    })
    .catch(err => console.error(err));
  };

  const inputStyle = {
    display: 'block', width: '100%', padding: '10px', marginBottom: '15px',
    backgroundColor: darkMode ? '#333' : '#fff', color: darkMode ? '#fff' : '#000',
    border: '1px solid #555', borderRadius: '4px'
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Publish Your Story</h2>
      <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} required />
        <input placeholder="Author" value={author} onChange={e => setAuthor(e.target.value)} style={inputStyle} required />
        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} style={{...inputStyle, height: '100px'}} required />
        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Confirm Publication
        </button>
      </form>
    </div>
  );
};

export default PublishBook;