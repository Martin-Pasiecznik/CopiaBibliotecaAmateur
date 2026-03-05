import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AdvancedSearch = ({ darkMode }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState({
    q: '',
    tags: [], // Ahora es un array
    minRating: 0,
    sort: 'newest'
  });

  const tagsDisponibles = ["Terror", "Romance", "Fantasía", "Misterio", "Ciencia Ficción", "Aventura", "Drama"];

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
      tags: filters.tags.join(','), // Enviamos los tags separados por coma
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

  const theme = {
    bg: darkMode ? '#0f1115' : '#fcfaf7',
    card: darkMode ? '#1a1d23' : '#fff',
    text: darkMode ? '#e0e0e0' : '#2c3e50',
    accent: '#3498db',
    border: darkMode ? 'rgba(255,255,255,0.1)' : '#ddd'
  };

  return (
    <div style={{ display: 'flex', gap: '30px', padding: '40px 20px', color: theme.text, minHeight: '100vh', backgroundColor: theme.bg }}>
      
      {/* SIDEBAR */}
      <aside style={{ width: '280px', backgroundColor: theme.card, padding: '25px', borderRadius: '15px', height: 'fit-content', border: `1px solid ${theme.border}`, position: 'sticky', top: '100px' }}>
        <h3 style={{ marginBottom: '20px' }}>Refinar Búsqueda</h3>
        
        {/* FILTRO ESTRELLAS */}
        <label style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.7 }}>CALIFICACIÓN MÍNIMA</label>
        <div style={{ display: 'flex', gap: '5px', margin: '10px 0 25px 0' }}>
          {[1, 2, 3, 4, 5].map(star => (
            <span 
              key={star} 
              onClick={() => setFilters({...filters, minRating: star === filters.minRating ? 0 : star})}
              style={{ 
                cursor: 'pointer', 
                fontSize: '1.5rem', 
                color: star <= filters.minRating ? '#f1c40f' : '#444',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              ★
            </span>
          ))}
          {filters.minRating > 0 && <span style={{fontSize: '0.7rem', marginLeft: '5px', opacity: 0.5}}>o más</span>}
        </div>

        {/* ORDENAR */}
        <label style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.7 }}>ORDENAR POR</label>
        <select value={filters.sort} onChange={e => setFilters({...filters, sort: e.target.value})} 
          style={{ width: '100%', padding: '10px', borderRadius: '8px', margin: '10px 0 25px 0', backgroundColor: darkMode ? '#222' : '#fff', color: theme.text, border: `1px solid ${theme.border}` }}>
          <option value="newest">Más recientes</option>
          <option value="rating">Mejor calificados</option>
          <option value="views">Lecturas</option>
        </select>

        {/* TAGS ACUMULABLES */}
        <label style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.7 }}>ETIQUETAS ({filters.tags.length})</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
          {tagsDisponibles.map(t => (
            <button key={t} onClick={() => toggleTag(t)}
              style={{
                padding: '6px 12px', fontSize: '0.75rem', borderRadius: '20px', border: 'none',
                backgroundColor: filters.tags.includes(t) ? theme.accent : (darkMode ? '#333' : '#eee'),
                color: filters.tags.includes(t) ? '#fff' : theme.text, cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
              {filters.tags.includes(t) ? '✓ ' : ''}{t}
            </button>
          ))}
        </div>
        {filters.tags.length > 0 && (
          <button onClick={() => setFilters({...filters, tags: []})} style={{background: 'none', border: 'none', color: theme.accent, fontSize: '0.7rem', marginTop: '10px', cursor: 'pointer'}}>Limpiar etiquetas</button>
        )}
      </aside>

      {/* RESULTADOS */}
      <main style={{ flex: 1 }}>
        <div style={{ position: 'relative', marginBottom: '30px' }}>
          <input 
            type="text" 
            placeholder="Buscar por título o autor..." 
            value={filters.q}
            onChange={e => setFilters({...filters, q: e.target.value})}
            style={{ width: '100%', padding: '18px 25px', borderRadius: '15px', border: `1px solid ${theme.border}`, fontSize: '1.1rem', backgroundColor: theme.card, color: theme.text, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          {loading && <div style={{ position: 'absolute', right: '20px', top: '20px' }}>⌛</div>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '25px' }}>
          {results.map(book => (
            <Link to={`/book/${book.id}`} key={book.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ backgroundColor: theme.card, borderRadius: '12px', overflow: 'hidden', border: `1px solid ${theme.border}`, transition: 'transform 0.3s' }} className="search-card">
                <img src={book.author_note && book.author_note !== 'null' ? `http://127.0.0.1:5001/static/covers/${book.author_note}` : "http://127.0.0.1:5001/static/covers/default_cover.jpg"} 
                     style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover' }} 
                     onError={(e) => e.target.src = "http://127.0.0.1:5001/static/covers/default_cover.jpg"} />
                <div style={{ padding: '15px' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.title}</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#f1c40f', fontWeight: 700 }}>⭐ {book.avg_rating?.toFixed(1) || '0.0'}</span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>👁️ {book.views || 0}</span>
                    <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{book.vote_count} votos</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {!loading && results.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '100px', opacity: 0.5 }}>
            <p style={{ fontSize: '3rem' }}>🔍</p>
            <p>No encontramos libros con esos filtros. ¡Prueba otra combinación!</p>
          </div>
        )}
      </main>

      <style>{`
        .search-card:hover { transform: translateY(-5px); border-color: ${theme.accent} !important; }
      `}</style>
    </div>
  );
};

export default AdvancedSearch;