import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AuthorDashboard = ({ user, darkMode }) => {
  const [myBooks, setMyBooks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    fetch(`http://127.0.0.1:5001/api/my-books?email=${user.email}`)
      .then(res => res.json())
      .then(data => setMyBooks(data))
      .catch(err => console.error("Error:", err));
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div style={{ padding: '40px 0' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>Bienvenido a tu Studio, {user.given_name}</h1>
          <p style={{ opacity: 0.6 }}>Gestiona tus obras y analiza tu crecimiento.</p>
        </div>
        <Link to="/publish" style={btnStyle}>+ Crear Nuevo Libro</Link>
      </header>

      <h2 style={{ marginBottom: '20px', borderBottom: '2px solid #3498db', display: 'inline-block' }}>Tus Historias</h2>
      
      {myBooks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', background: darkMode ? '#1a1d23' : '#f9f9f9', borderRadius: '15px' }}>
          <p>Aún no has empezado tu legado literario.</p>
          <Link to="/publish" style={{ color: '#3498db' }}>Escribe tu primera historia ahora</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
          {myBooks.map(book => (
            <div key={book.id} style={cardStyle(darkMode)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                 <div style={{ width: '50px', height: '75px', backgroundColor: '#333', borderRadius: '4px', overflow: 'hidden' }}>
                    <img 
                      src={`http://127.0.0.1:5001/static/covers/${book.author_note}`} 
                      alt="" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => e.target.src = "https://placehold.jp/50x75.png"}
                    />
                 </div>
                 <div>
                    <h3 style={{ margin: 0 }}>{book.title}</h3>
                    <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>👁️ {book.views} lecturas totales</span>
                 </div>
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => navigate(`/dashboard/book/${book.id}`)} 
                  style={{ ...btnMini, background: '#3498db' }}
                >
                  📊 Detalles y Estadísticas
                </button>
                <button 
                  onClick={() => navigate(`/add-chapter/${book.id}`)} 
                  style={{ ...btnMini, background: '#2ecc71' }}
                >
                  ➕ Capítulos
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const btnStyle = { 
  background: '#3498db', color: 'white', padding: '12px 24px', 
  borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold',
  boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)'
};

const btnMini = { 
  border: 'none', color: 'white', padding: '8px 15px', 
  borderRadius: '6px', cursor: 'pointer', fontWeight: '600',
  fontSize: '0.85rem', transition: 'transform 0.2s'
};

const cardStyle = (dark) => ({
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
  padding: '20px', background: dark ? '#1a1d23' : '#fff', 
  marginBottom: '10px', borderRadius: '12px',
  border: `1px solid ${dark ? '#333' : '#eee'}`,
  boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
});

export default AuthorDashboard;