import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Rankings = ({ darkMode }) => {
  const [topBooks, setTopBooks] = useState([]);
  const [filter, setFilter] = useState("");

  // NUEVA PALETA: Sincronizada con el estilo Neo-Editorial
  const theme = {
    bg: darkMode ? '#0a0b10' : '#f4f0ea', 
    card: darkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.5)',
    accent: darkMode ? '#d4af37' : '#b85b3f', // Oro / Terracota
    textMain: darkMode ? '#e3e1db' : '#2b2824',
    textMuted: darkMode ? '#8a8782' : '#857f77',
    border: darkMode ? 'rgba(212, 175, 55, 0.15)' : 'rgba(184, 91, 63, 0.15)',
    
    // Tonos de medallas adaptados a la nueva paleta
    gold: darkMode ? '#d4af37' : '#b85b3f',
    silver: darkMode ? '#9e9e9e' : '#8a8782',
    bronze: darkMode ? '#cd7f32' : '#a0522d',
    star: darkMode ? '#d4af37' : '#b85b3f'
  };

  useEffect(() => {
    fetch(`http://127.0.0.1:5001/api/rankings/top100${filter ? `?tag=${filter}` : ''}`)
      .then(r => r.json())
      .then(setTopBooks);
  }, [filter]);

  const getRankColor = (index) => {
    if (index === 0) return theme.gold;
    if (index === 1) return theme.silver;
    if (index === 2) return theme.bronze;
    return theme.textMuted;
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <header style={{ textAlign: 'center', marginBottom: '60px', position: 'relative' }}>
        {/* Pequeño halo de luz para el título */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '300px', height: '150px', background: `radial-gradient(circle, ${theme.accent}15 0%, transparent 70%)`,
          filter: 'blur(30px)', zIndex: -1, pointerEvents: 'none'
        }}></div>
        
        <h1 style={{ fontSize: '3.5rem', fontWeight: 400, margin: 0, color: theme.textMain, fontFamily: "'Crimson Pro', serif" }}>
          TOP <span style={{ color: theme.accent, fontStyle: 'italic' }}>100</span>
        </h1>
        <p style={{ color: theme.textMuted, fontWeight: 400, marginTop: '10px', fontSize: '1.1rem' }}>
          Las obras literarias más aclamadas por la comunidad.
        </p>
      </header>

      {/* FILTROS ELEGANTES */}
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '20px', marginBottom: '40px', scrollbarWidth: 'none', justifyContent: 'center' }}>
        {["", "Fantasía", "Romance", "Terror", "Ciencia Ficción", "Drama"].map(tag => (
          <button 
            key={tag}
            onClick={() => setFilter(tag)}
            style={{
              padding: '8px 22px', borderRadius: '50px', 
              border: `1px solid ${filter === tag ? theme.accent : theme.border}`,
              background: filter === tag ? theme.accent : 'transparent',
              // Si está seleccionado, el texto hace contraste (oscuro en modo oscuro/oro, blanco en modo claro/terracota)
              color: filter === tag ? (darkMode ? '#0a0b10' : '#ffffff') : theme.textMain,
              cursor: 'pointer', fontWeight: 600, transition: 'all 0.3s ease', whiteSpace: 'nowrap',
              boxShadow: filter === tag ? `0 0 15px ${theme.accent}40` : 'none',
              fontFamily: "'Inter', sans-serif", fontSize: '0.9rem'
            }}
          >
            {tag || "Todos los Géneros"}
          </button>
        ))}
      </div>

      {/* LISTA DE RANKING */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {topBooks.map((book, index) => (
          <Link key={book.id} to={`/book/${book.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{
              display: 'flex', alignItems: 'center', padding: '20px 25px', 
              background: theme.card, borderRadius: '20px', 
              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              border: `1px solid ${index < 3 ? getRankColor(index) + '50' : theme.border}`,
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative', overflow: 'hidden'
            }} 
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-5px) scale(1.01)';
              e.currentTarget.style.borderColor = index < 3 ? getRankColor(index) : theme.accent;
              e.currentTarget.style.boxShadow = `0 15px 30px rgba(0,0,0,${darkMode ? '0.4' : '0.1'})`;
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.borderColor = index < 3 ? getRankColor(index) + '50' : theme.border;
              e.currentTarget.style.boxShadow = 'none';
            }}>
              
              {/* NÚMERO EDITORIAL */}
              <span style={{ 
                fontSize: index < 3 ? '3rem' : '1.8rem', 
                fontWeight: index < 3 ? 400 : 300, 
                width: '60px', color: getRankColor(index),
                opacity: index < 3 ? 1 : 0.5, 
                fontFamily: "'Crimson Pro', serif", fontStyle: 'italic',
                lineHeight: 1
              }}>
                {index + 1}
              </span>

              <img 
                src={`http://127.0.0.1:5001/static/covers/${book.author_note}`} 
                style={{ width: '65px', height: '95px', objectFit: 'cover', borderRadius: '10px', marginRight: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }} 
                alt={book.title}
                onError={(e) => { e.target.src = "https://placehold.jp/24/333333/ffffff/65x95.png?text=No+Img" }}
              />

              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '1.25rem', fontWeight: 600, color: theme.textMain, fontFamily: "'Crimson Pro', serif" }}>{book.title}</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: theme.accent, fontWeight: 400, fontStyle: 'italic' }}>por {book.author}</p>
              </div>

              {/* Estadísticas minimalistas */}
              <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '1.3rem', fontWeight: 600, color: theme.textMain }}>
                      {book.avg_rating ? book.avg_rating.toFixed(1) : "0.0"}
                    </span>
                    <span style={{ color: theme.star, fontSize: '1.1rem' }}>✦</span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.65rem', letterSpacing: '1px', textTransform: 'uppercase', color: theme.textMuted, fontWeight: 600 }}>
                    {book.vote_count || 0} Votos
                  </p>
                </div>

                <div style={{ textAlign: 'center', minWidth: '70px', borderLeft: `1px solid ${theme.border}`, paddingLeft: '25px' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 400, color: theme.textMuted }}>
                    {book.views || 0}
                  </span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.65rem', letterSpacing: '1px', textTransform: 'uppercase', color: theme.textMuted, fontWeight: 600 }}>Vistas</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Rankings;