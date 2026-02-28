import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Rankings = ({ darkMode }) => {
  const [topBooks, setTopBooks] = useState([]);
  const [filter, setFilter] = useState("");

  const theme = {
    accent: '#3498db',
    textMain: darkMode ? '#e0e0e0' : '#2c3e50',
    textMuted: darkMode ? '#999' : '#666',
    card: darkMode ? '#1a1d23' : '#ffffff',
    border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    gold: '#f1c40f',
    silver: '#95a5a6',
    bronze: '#e67e22',
    star: '#f1c40f'
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
    return theme.textMain;
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto', minHeight: '100vh' }}>
      <header style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-3px', margin: 0, color: theme.textMain }}>
          TOP <span style={{ color: theme.accent }}>100</span>
        </h1>
        <p style={{ color: theme.textMuted, fontWeight: 500, marginTop: '10px' }}>
          Las obras mejor valoradas por los lectores
        </p>
      </header>

      {/* FILTROS */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '20px', marginBottom: '30px', scrollbarWidth: 'none' }}>
        {["", "Fantasía", "Romance", "Terror", "Ciencia Ficción", "Drama"].map(tag => (
          <button 
            key={tag}
            onClick={() => setFilter(tag)}
            style={{
              padding: '10px 24px', borderRadius: '25px', border: `2px solid ${filter === tag ? theme.accent : theme.border}`,
              background: filter === tag ? theme.accent : theme.card,
              color: filter === tag ? 'white' : theme.textMain,
              cursor: 'pointer', fontWeight: 700, transition: '0.3s', whiteSpace: 'nowrap',
              boxShadow: filter === tag ? `0 4px 15px ${theme.accent}44` : 'none'
            }}
          >
            {tag || "Todos los Géneros"}
          </button>
        ))}
      </div>

      {/* LISTA DE RANKING */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {topBooks.map((book, index) => (
          <Link key={book.id} to={`/book/${book.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{
              display: 'flex', alignItems: 'center', padding: '15px 25px', 
              background: theme.card, borderRadius: '16px', border: `1px solid ${index < 3 ? getRankColor(index) + '66' : theme.border}`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative', overflow: 'hidden'
            }} 
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateX(10px)';
              e.currentTarget.style.boxShadow = `0 10px 30px rgba(0,0,0,${darkMode ? '0.3' : '0.1'})`;
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              
              <span style={{ 
                fontSize: index < 3 ? '2.5rem' : '1.5rem', 
                fontWeight: 900, width: '60px', color: getRankColor(index),
                opacity: index < 3 ? 1 : 0.3, fontStyle: 'italic'
              }}>
                {index + 1}
              </span>

              <img 
                src={`http://127.0.0.1:5001/static/covers/${book.author_note}`} 
                style={{ width: '60px', height: '85px', objectFit: 'cover', borderRadius: '8px', marginRight: '20px' }} 
                alt={book.title}
                onError={(e) => { e.target.src = "https://placehold.jp/24/333333/ffffff/60x85.png?text=No" }}
              />

              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: theme.textMain }}>{book.title}</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: theme.accent, fontWeight: 600 }}>{book.author}</p>
              </div>

              {/* Estadísticas: Rating y Votos */}
              <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: theme.textMain }}>
                      {book.avg_rating ? book.avg_rating.toFixed(1) : "0.0"}
                    </span>
                    <span style={{ color: theme.star, fontSize: '1.2rem' }}>★</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.65rem', textTransform: 'uppercase', color: theme.textMuted, fontWeight: 700 }}>
                    {book.vote_count || 0} Votos
                  </p>
                </div>

                <div style={{ textAlign: 'center', minWidth: '70px', borderLeft: `1px solid ${theme.border}`, paddingLeft: '20px' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 600, color: theme.textMuted }}>
                    {book.views || 0}
                  </span>
                  <p style={{ margin: 0, fontSize: '0.65rem', textTransform: 'uppercase', color: theme.textMuted }}>Vistas</p>
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