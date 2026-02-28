import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MyLibrary = ({ user, darkMode }) => {
  const [books, setBooks] = useState([]);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.email) {
      fetch(`http://127.0.0.1:5001/api/library?email=${user.email}`)
        .then(res => res.json())
        .then(data => setBooks(data));
    }
  }, [user]);

  const filteredBooks = filter === 'all' ? books : books.filter(b => b.status === filter);

  const statusLabels = {
    reading: { text: 'Leyendo', color: '#3498db' },
    completed: { text: 'Leído', color: '#2ecc71' },
    pending: { text: 'Pendiente', color: '#f1c40f' },
    dropped: { text: 'Abandonado', color: '#e74c3c' }
  };

  const containerStyle = {
    padding: '40px 20px',
    maxWidth: '1000px',
    margin: '0 auto',
    color: darkMode ? '#fff' : '#333'
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>📚 Mi Biblioteca</h2>
      
      {/* FILTROS */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '40px', flexWrap: 'wrap' }}>
        {['all', 'reading', 'pending', 'completed', 'dropped'].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
              backgroundColor: filter === f ? '#3498db' : (darkMode ? '#2c3e50' : '#eee'),
              color: filter === f ? 'white' : (darkMode ? '#fff' : '#333'),
              fontWeight: 'bold', transition: '0.3s'
            }}
          >
            {f === 'all' ? 'Todos' : statusLabels[f].text}
          </button>
        ))}
      </div>

      {/* GRILLA DE LIBROS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '25px' }}>
        {filteredBooks.map(book => (
          <div 
            key={book.id} 
            onClick={() => navigate(`/book/${book.id}`)}
            style={{ cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ 
              height: '250px', backgroundColor: '#ddd', borderRadius: '8px', marginBottom: '10px',
              overflow: 'hidden', position: 'relative', boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
            }}>
              <img 
                src={`http://127.0.0.1:5001/static/covers/${book.author_note}`} 
                alt={book.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute', bottom: '0', left: '0', right: '0', padding: '5px',
                backgroundColor: statusLabels[book.status].color, color: 'white', fontSize: '0.8rem', fontWeight: 'bold'
              }}>
                {statusLabels[book.status].text}
              </div>
            </div>
            <h4 style={{ margin: '5px 0', fontSize: '1rem' }}>{book.title}</h4>
            <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>{book.author}</p>
          </div>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <p style={{ textAlign: 'center', marginTop: '50px', opacity: 0.5 }}>Aún no hay libros en esta categoría.</p>
      )}
    </div>
  );
};

export default MyLibrary;