import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AdvancedSearch = ({ darkMode }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState({
    q: '',
    tags: [],
    minRating: 0,
    sort: 'newest'
  });

  const tagsDisponibles = ["Terror", "Romance", "Fantasía", "Misterio", "Ciencia Ficción", "Aventura", "Drama"];

  // PALETA UNIFICADA NEO-EDITORIAL
  const theme = {
    bg: darkMode ? '#0a0b10' : '#f4f0ea', 
    card: darkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.5)',
    accent: darkMode ? '#d4af37' : '#b85b3f', // Oro / Terracota
    textMain: darkMode ? '#e3e1db' : '#2b2824',
    textMuted: darkMode ? '#8a8782' : '#857f77',
    border: darkMode ? 'rgba(212, 175, 55, 0.15)' : 'rgba(184, 91, 63, 0.15)',
    star: darkMode ? '#d4af37' : '#b85b3f'
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchResults();
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [filters]);

  const fetchResults = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      q: filters.q,
      tags: filters.tags.join(','),
      min_rating: filters.minRating,
      sort: filters.sort
    });
    
    try {
      const res = await fetch(`http://127.0.0.1:5001/api/search/advanced?${params}`);
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error("Error buscando:", error);
    }
    setLoading(false);
  };

  const toggleTag = (tag) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag) 
        : [...prev.tags, tag]
    }));
  };

  return (
    <div style={{ display: 'flex', gap: '30px', padding: '40px 20px', color: theme.textMain, minHeight: '100vh', backgroundColor: theme.bg, fontFamily: "'Inter', sans-serif" }}>
      
      {/* SIDEBAR EDITORIAL (Con efecto cristal) */}
      <aside style={{ 
        width: '280px', 
        backgroundColor: theme.card, 
        padding: '30px', 
        borderRadius: '20px', 
        height: 'fit-content', 
        border: `1px solid ${theme.border}`, 
        position: 'sticky', 
        top: '100px',
        backdropFilter: 'blur(16px)', 
        WebkitBackdropFilter: 'blur(16px)'
      }}>
        <h3 style={{ marginBottom: '25px', fontSize: '1.4rem', fontWeight: 600, fontFamily: "'Crimson Pro', serif", color: theme.textMain }}>Refinar Búsqueda</h3>
        
        {/* FILTRO ESTRELLAS */}
        <label style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', color: theme.textMuted, textTransform: 'uppercase' }}>Calificación Mínima</label>
        <div style={{ display: 'flex', gap: '8px', margin: '15px 0 30px 0', alignItems: 'center' }}>
          {[1, 2, 3, 4, 5].map(star => (
            <span 
              key={star} 
              onClick={() => setFilters({...filters, minRating: star === filters.minRating ? 0 : star})}
              style={{ 
                cursor: 'pointer', 
                fontSize: '1.5rem', 
                color: star <= filters.minRating ? theme.star : theme.border,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                textShadow: star <= filters.minRating ? `0 0 10px ${theme.star}40` : 'none'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.2) translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1) translateY(0)'}
            >
              ✦
            </span>
          ))}
          {filters.minRating > 0 && <span style={{fontSize: '0.75rem', marginLeft: '8px', color: theme.textMuted, fontStyle: 'italic'}}>o más</span>}
        </div>

        {/* ORDENAR */}
        <label style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', color: theme.textMuted, textTransform: 'uppercase' }}>Ordenar Por</label>
        <div style={{ position: 'relative', margin: '15px 0 30px 0' }}>
          <select value={filters.sort} onChange={e => setFilters({...filters, sort: e.target.value})} 
            style={{ 
              width: '100%', padding: '12px 15px', borderRadius: '12px', 
              backgroundColor: darkMode ? '#11131a' : '#ffffff', 
              color: theme.textMain, border: `1px solid ${theme.border}`,
              appearance: 'none', outline: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif"
            }}>
            <option value="newest">Más recientes</option>
            <option value="rating">Mejor calificados</option>
            <option value="views">Más leídos</option>
          </select>
          <span style={{ position: 'absolute', right: '15px', top: '12px', color: theme.accent, pointerEvents: 'none' }}>▼</span>
        </div>

        {/* ETIQUETAS ELEGANTES */}
        <label style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', color: theme.textMuted, textTransform: 'uppercase' }}>
          Etiquetas <span style={{ color: theme.accent, fontWeight: 400 }}>({filters.tags.length})</span>
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '15px' }}>
          {tagsDisponibles.map(t => {
            const isSelected = filters.tags.includes(t);
            return (
              <button key={t} onClick={() => toggleTag(t)}
                style={{
                  padding: '8px 14px', fontSize: '0.8rem', borderRadius: '20px', 
                  border: `1px solid ${isSelected ? theme.accent : theme.border}`,
                  backgroundColor: isSelected ? theme.accent : 'transparent',
                  color: isSelected ? (darkMode ? '#0a0b10' : '#ffffff') : theme.textMain, 
                  cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s ease'
                }}>
                {isSelected ? '✦ ' : ''}{t}
              </button>
            )
          })}
        </div>
        {filters.tags.length > 0 && (
          <button onClick={() => setFilters({...filters, tags: []})} 
            style={{background: 'none', border: 'none', color: theme.textMuted, fontSize: '0.8rem', marginTop: '15px', cursor: 'pointer', textDecoration: 'underline', fontStyle: 'italic'}}>
            Limpiar etiquetas
          </button>
        )}
      </aside>

      {/* RESULTADOS */}
      <main style={{ flex: 1 }}>
        <div style={{ position: 'relative', marginBottom: '40px' }}>
          <input 
            type="text" 
            placeholder="Buscar por título, autor o palabra clave..." 
            value={filters.q}
            onChange={e => setFilters({...filters, q: e.target.value})}
            style={{ 
              width: '100%', padding: '20px 30px', borderRadius: '20px', 
              border: `1px solid ${theme.border}`, fontSize: '1.2rem', 
              backgroundColor: theme.card, color: theme.textMain, 
              boxShadow: `0 10px 30px rgba(0,0,0,${darkMode ? '0.3' : '0.05'})`,
              backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
              outline: 'none', fontFamily: "'Crimson Pro', serif"
            }}
          />
          {/* Indicador de carga sutil estilo destello */}
          {loading && <span style={{ position: 'absolute', right: '30px', top: '22px', color: theme.accent, fontSize: '1.2rem', animation: 'pulse 1.5s infinite' }}>✦</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '30px' }}>
          {results.map(book => (
            <Link to={`/book/${book.id}`} key={book.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ 
                backgroundColor: theme.card, borderRadius: '16px', overflow: 'hidden', 
                border: `1px solid ${theme.border}`, transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)'
              }} className="search-card">
                <img src={book.author_note && book.author_note !== 'null' ? `http://127.0.0.1:5001/static/covers/${book.author_note}` : "https://placehold.jp/24/333333/ffffff/220x330.png?text=No+Cover"} 
                     style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', borderBottom: `1px solid ${theme.border}` }} 
                     onError={(e) => e.target.src = "https://placehold.jp/24/333333/ffffff/220x330.png?text=No+Cover"} 
                     alt={book.title} />
                <div style={{ padding: '20px 15px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: "'Crimson Pro', serif", color: theme.textMain }}>{book.title}</h4>
                  
                  {/* Estadísticas Minimalistas en la Tarjeta */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ color: theme.star, fontWeight: 700, fontSize: '1.1rem' }}>{book.avg_rating?.toFixed(1) || '0.0'}</span>
                      <span style={{ color: theme.star, fontSize: '0.9rem' }}>✦</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                      <span style={{ fontSize: '0.75rem', color: theme.textMuted, fontWeight: 600 }}>{book.views || 0} VISTAS</span>
                      <span style={{ fontSize: '0.7rem', color: theme.textMuted }}>{book.vote_count} votos</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* ESTADO VACÍO (Sin Emojis) */}
        {!loading && results.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '100px', color: theme.textMuted }}>
            <p style={{ fontSize: '3rem', color: theme.accent, opacity: 0.5, margin: '0 0 15px 0' }}>✧</p>
            <h3 style={{ fontFamily: "'Crimson Pro', serif", fontSize: '1.5rem', fontWeight: 400, color: theme.textMain, margin: '0 0 10px 0' }}>El estante está vacío</h3>
            <p style={{ fontSize: '1rem' }}>No encontramos manuscritos con esa combinación de filtros. <br/>Prueba explorar otros géneros.</p>
          </div>
        )}
      </main>

      {/* ESTILOS INYECTADOS */}
      <style>{`
        .search-card:hover { 
          transform: translateY(-8px); 
          border-color: ${theme.accent} !important;
          box-shadow: 0 15px 30px rgba(0,0,0,${darkMode ? '0.4' : '0.1'});
        }
        @keyframes pulse {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default AdvancedSearch;