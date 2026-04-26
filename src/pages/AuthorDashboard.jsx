import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AuthorDashboard = ({ user, darkMode }) => {
  const [myBooks, setMyBooks] = useState([]);
  const navigate = useNavigate();

  // PALETA NEO-EDITORIAL UNIFICADA
  const theme = {
    bg: darkMode ? '#0a0b10' : '#f4f0ea',
    card: darkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.6)',
    accent: darkMode ? '#d4af37' : '#b85b3f',
    textMain: darkMode ? '#e3e1db' : '#2b2824',
    textMuted: darkMode ? '#8a8782' : '#857f77',
    border: darkMode ? 'rgba(212, 175, 55, 0.15)' : 'rgba(184, 91, 63, 0.15)',
  };

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
    <div style={{ padding: '60px 0', minHeight: '100vh', color: theme.textMain, fontFamily: "'Inter', sans-serif" }}>
      
      {/* CABECERA DASHBOARD */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end', 
        marginBottom: '60px',
        borderBottom: `1px solid ${theme.border}`,
        paddingBottom: '30px'
      }}>
        <div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '2.8rem', 
            fontFamily: "'Crimson Pro', serif", 
            fontWeight: 400 
          }}>
            Bienvenido a tu <span style={{ fontStyle: 'italic', color: theme.accent }}>Estudio</span>
          </h1>
        </div>
        <Link to="/publish" style={{
          background: theme.accent,
          color: darkMode ? '#0a0b10' : '#fff',
          padding: '12px 28px',
          borderRadius: '50px',
          textDecoration: 'none',
          fontWeight: 700,
          fontSize: '0.9rem',
          boxShadow: `none`,
          transition: 'transform 0.3s ease'
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          ✦ CREAR NUEVA OBRA
        </Link>
      </header>

      <h2 style={{ 
        fontSize: '1.2rem', 
        textTransform: 'uppercase', 
        letterSpacing: '2px', 
        marginBottom: '30px', 
        color: theme.accent,
        fontWeight: 800
      }}>
        Tus Historias
      </h2>
      
      {myBooks.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '80px', 
          background: theme.card, 
          borderRadius: '20px',
          border: `1px dashed ${theme.border}`,
          backdropFilter: 'blur(10px)'
        }}>
          <p style={{ fontSize: '1.2rem', color: theme.textMuted }}>Aún no has empezado tu legado literario.</p>
          <Link to="/publish" style={{ color: theme.accent, fontWeight: 600, textDecoration: 'none', display: 'block', marginTop: '15px' }}>
            Escribe tu primera historia ahora →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {myBooks.map(book => (
            <div key={book.id} style={{
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '25px', 
              background: theme.card, 
              borderRadius: '20px',
              border: `1px solid ${theme.border}`,
              backdropFilter: 'blur(12px)',
              transition: 'all 0.3s ease'
            }}
            className="dashboard-card"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                 <div style={{ 
                   width: '60px', 
                   height: '85px', 
                   backgroundColor: '#111', 
                   borderRadius: '8px', 
                   overflow: 'hidden',
                   boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
                 }}>
                    <img 
                      src={`http://127.0.0.1:5001/static/covers/${book.author_note}`} 
                      alt="" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => e.target.src = "https://placehold.jp/60x85.png?text=No+Cover"}
                    />
                 </div>
                 <div>
                    <h3 style={{ 
                      margin: '0 0 5px 0', 
                      fontFamily: "'Crimson Pro', serif", 
                      fontSize: '1.4rem',
                      fontWeight: 600
                    }}>{book.title}</h3>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: theme.textMuted, fontWeight: 600 }}>
                        <span style={{ color: theme.accent }}>✦</span> {book.views} LECTURAS
                      </span>
                    </div>
                 </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => navigate(`/dashboard/book/${book.id}`)} 
                  style={{ 
                    border: `1px solid ${theme.border}`,
                    background: 'transparent',
                    color: theme.textMain,
                    padding: '10px 20px',
                    borderRadius: '50px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.borderColor = theme.accent;
                    e.currentTarget.style.color = theme.accent;
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.borderColor = theme.border;
                    e.currentTarget.style.color = theme.textMain;
                  }}
                >
                  ESTADÍSTICAS
                </button>
                <button 
                  onClick={() => navigate(`/add-chapter/${book.id}`)} 
                  style={{ 
                    border: 'none',
                    background: darkMode ? 'rgba(212, 175, 55, 0.1)' : 'rgba(184, 91, 63, 0.1)',
                    color: theme.accent,
                    padding: '10px 20px',
                    borderRadius: '50px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = theme.accent + '30'}
                  onMouseOut={e => e.currentTarget.style.background = darkMode ? 'rgba(212, 175, 55, 0.1)' : 'rgba(184, 91, 63, 0.1)'}
                >
                  + CAPÍTULOS
                </button>
              </div>
            </div>
          ))}
        </div>
      )}


    </div>
  );
};

export default AuthorDashboard;