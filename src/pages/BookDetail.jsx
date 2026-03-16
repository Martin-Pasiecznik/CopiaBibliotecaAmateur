import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const BookDetail = ({ user, darkMode }) => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  const [rating, setRating] = useState({ average: 0, total: 0, userScore: 0 });
  const [hover, setHover] = useState(0);
  const [readingStatus, setReadingStatus] = useState(""); 

  // --- NUEVOS ESTADOS PARA LA BIBLIOTECA ---
  const [libraryStatus, setLibraryStatus] = useState(null); 
  const [isUpdatingLib, setIsUpdatingLib] = useState(false);
  const [notif, setNotif] = useState("");

  // --- NUEVO: ESTADO PARA EL PROGRESO DE LECTURA (PERSISTENTE) ---
  const [progress, setProgress] = useState({ lastChapterIndex: -1, readChapters: [] });

  const theme = {
    accent: darkMode ? '#d4af37' : '#b85b3f', // Oro en dark, Tierra en light
    textMain: darkMode ? '#e3e1db' : '#2c2926',
    textMuted: darkMode ? '#8a8782' : '#7a746e',
    card: darkMode ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
    border: darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(184, 91, 63, 0.15)',
    error: '#e74c3c',
    success: darkMode ? '#82e0aa' : '#27ae60',
    star: darkMode ? '#d4af37' : '#b85b3f',
    bgLight: darkMode ? 'rgba(212, 175, 55, 0.05)' : '#fcfaf7',
    // --- COLORES PARA CAPÍTULOS LEÍDOS ---
    readColor: darkMode ? 'rgba(130, 224, 170, 0.05)' : '#f0f9f4',
    readText: darkMode ? '#82e0aa' : '#1e7e44'
  };

  // --- ESTILO PARA PORTADA POR DEFECTO ---
  const defaultCoverStyle = {
    width: '280px',
    aspectRatio: '2/3',
    borderRadius: '12px',
    backgroundColor: darkMode ? '#1a1a1a' : '#eee',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.textMuted,
    fontWeight: 800,
    fontSize: '1rem',
    border: `1px solid ${theme.border}`,
    textAlign: 'center',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
  };

  const userReview = comments.find(c => c.user_email === user?.email);

  useEffect(() => {
    fetch(`http://127.0.0.1:5001/api/books/${id}`).then(r => r.json()).then(setBook);
    fetch(`http://127.0.0.1:5001/api/books/${id}/chapters`).then(r => r.json()).then(setChapters);
    fetchComments();

    if (user) {
      fetch(`http://127.0.0.1:5001/api/books/${id}/rating-status/${user.email}`)
        .then(r => r.json())
        .then(data => setRating({ 
            average: data.average, 
            total: data.total_votes, 
            userScore: data.user_score 
        }));

      fetch(`http://127.0.0.1:5001/api/library?email=${user.email}`)
        .then(r => r.json())
        .then(data => {
          const bookInLib = data.find(b => b.id === parseInt(id));
          if (bookInLib) setLibraryStatus(bookInLib.status);
        });
      
      if (user) {
        fetch(`http://127.0.0.1:5001/api/progress/${user.email}/${id}`)
          .then(r => {
            if (!r.ok) throw new Error('Error en la red');
            return r.json();
          })
          .then(data => {
            if (data) {
              setProgress({ 
                lastChapterIndex: data.last_chapter_id, 
                readChapters: data.read_chapters || [] 
              });
            }
          })
          .catch(err => console.error("Error cargando progreso:", err)); 
      }
    }
  }, [id, user]);

  useEffect(() => {
    if (userReview) {
      const statusMatch = userReview.text.match(/^\[Estado: (.*?)\]/);
      if (statusMatch) setReadingStatus(statusMatch[1]);
      const cleanText = userReview.text.replace(/^\[Estado: (.*?)\]\s*/, '');
      setNewComment(cleanText);
    }
  }, [userReview]);

  const fetchComments = () => {
    fetch(`http://127.0.0.1:5001/api/books/${id}/comments?chapter_id=null`)
      .then(r => r.json())
      .then(setComments);
  };

  const handleRate = (score) => {
    if (!user) return setErrorMsg("Debes iniciar sesión para puntuar.");
    fetch(`http://127.0.0.1:5001/api/books/${id}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_email: user.email, score: score })
    })
    .then(res => res.json())
    .then(data => {
      setRating(prev => ({ ...prev, average: data.average, total: data.total_votes, userScore: score }));
      setErrorMsg(""); 
      fetchComments();
    });
  };

  const updateLibrary = (status) => {
    if (!user) return setErrorMsg("Debes iniciar sesión para guardar en tu biblioteca.");
    setIsUpdatingLib(true);
    fetch(`http://127.0.0.1:5001/api/library/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, book_id: parseInt(id), status: status })
    })
    .then(res => res.json())
    .then(() => {
      setLibraryStatus(status === 'remove' ? null : status);
      const labels = { reading: 'Leyendo', completed: 'Leído', dropped: 'Abandonado', pending: 'Pendiente' };
      setNotif(status === 'remove' ? "Libro quitado de tu lista" : `Añadido como: ${labels[status]}`);
      
      setTimeout(() => setNotif(""), 5000); 
      setIsUpdatingLib(false);
    })
    .catch(() => setIsUpdatingLib(false));
  };

  const postComment = () => {
    if (!user) return setErrorMsg("Debes iniciar sesión para dejar una reseña.");
    if (rating.userScore === 0) return setErrorMsg("Primero debes puntuar la obra con estrellas (arriba).");
    if (!readingStatus) return setErrorMsg("Por favor, selecciona tu progreso de lectura.");
    if (!newComment.trim()) return setErrorMsg("El texto de la reseña es obligatorio.");

    const fullText = `[Estado: ${readingStatus}] ${newComment}`;

    fetch(`http://127.0.0.1:5001/api/books/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        user_name: user.name, 
        user_email: user.email, 
        text: fullText,
        chapter_id: null
      })
    }).then(res => {
      if (res.ok) {
        setErrorMsg("");
        fetchComments();
        alert(userReview ? "Reseña actualizada" : "Reseña publicada");
      }
    });
  };

  const renderStars = (count) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} style={{ color: i < count ? theme.star : `${theme.textMuted}33`, fontSize: '1.1rem' }}>
        {i < count ? '★' : '★'}
      </span>
    ));
  };

  if (!book) return <div style={{padding: '100px', textAlign: 'center', color: theme.textMain, fontFamily: 'serif'}}>Cargando obra...</div>;

  return (
    <div style={{ padding: '60px 20px', maxWidth: '1100px', margin: '0 auto', color: theme.textMain, fontFamily: "'Inter', sans-serif" }}>
      
      <div style={{ display: 'flex', gap: '60px', marginBottom: '80px', flexWrap: 'wrap' }}>
        
        {/* PORTADA */}
        <div style={{ flexShrink: 0 }}>
          {book.author_note && book.author_note !== 'null' ? (
            <img 
              src={`http://127.0.0.1:5001/static/covers/${book.author_note}`} 
              style={{ width: '300px', borderRadius: '12px', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', border: `1px solid ${theme.border}`, objectFit: 'cover' }} 
              alt="Portada" 
            />
          ) : (
            <div style={defaultCoverStyle}>SIN PORTADA</div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: '320px' }}>
          <h1 style={{ fontSize: '3.5rem', margin: '0 0 10px 0', fontFamily: "'Crimson Pro', serif", fontWeight: 400, letterSpacing: '-1px' }}>{book.title}</h1>
          <p style={{ color: theme.accent, fontSize: '1.3rem', marginBottom: '30px', fontWeight: 500, fontStyle: 'italic', fontFamily: "'Crimson Pro', serif" }}>por {book.author}</p>

          <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ display: 'flex' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => handleRate(star)} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)}
                  style={{ fontSize: '32px', cursor: 'pointer', background: 'none', border: 'none', padding: 0, color: star <= (hover || rating.userScore) ? theme.star : `${theme.textMuted}33`, transition: 'transform 0.2s' }}>
                  ★
                </button>
              ))}
            </div>
            <span style={{ fontSize: '2rem', fontWeight: 300, fontFamily: "'Crimson Pro', serif" }}>{rating.average.toFixed(1)}</span>
            <span style={{ color: theme.textMuted, fontSize: '0.8rem', marginTop: '8px' }}>({rating.total} reseñas)</span>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 800, display: 'block', marginBottom: '12px', opacity: 0.6, letterSpacing: '2px' }}>MI BIBLIOTECA</label>
            <div style={{ 
              display: 'flex', background: theme.bgLight, borderRadius: '50px', padding: '5px', gap: '5px', border: `1px solid ${theme.border}`, flexWrap: 'wrap'
            }}>
              {[
                { id: 'reading', icon: '📖', label: 'Leyendo' },
                { id: 'pending', icon: '⏳', label: 'Pendiente' },
                { id: 'completed', icon: '✅', label: 'Leído' },
                { id: 'dropped', icon: '⏹️', label: 'Abandonado' }
              ].map((item) => (
                <button key={item.id} onClick={() => updateLibrary(item.id)} disabled={isUpdatingLib}
                  style={{
                    flex: 1, minWidth: '85px', padding: '8px 12px', border: 'none', borderRadius: '40px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700,
                    backgroundColor: libraryStatus === item.id ? theme.accent : 'transparent',
                    color: libraryStatus === item.id ? (darkMode ? '#000' : '#fff') : theme.textMain,
                    transition: '0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  {item.label.toUpperCase()}
                </button>
              ))}
              {libraryStatus && (
                <button onClick={() => updateLibrary('remove')} style={{ padding: '0 15px', background: 'transparent', border: 'none', color: theme.error, cursor: 'pointer', fontSize: '1.1rem' }} title="Quitar">✕</button>
              )}
            </div>
          </div>

          <p style={{ lineHeight: '1.8', fontSize: '1.1rem', color: theme.textMuted, marginBottom: '40px', maxWidth: '600px' }}>{book.description}</p>
          
          {chapters.length > 0 && (
            <Link to={`/reader/${book.id}/${progress.lastChapterIndex !== -1 ? progress.lastChapterIndex : 0}`} 
              style={{ background: theme.accent, color: darkMode ? '#000' : '#fff', padding: '16px 45px', borderRadius: '50px', textDecoration: 'none', fontWeight: 800, fontSize: '0.9rem', display: 'inline-block', boxShadow: `0 10px 20px ${theme.accent}33` }}>
              {progress.lastChapterIndex !== -1 ? "CONTINUAR LEYENDO" : "COMENZAR LECTURA"}
            </Link>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '80px' }}>
        <h3 style={{ fontSize: '1.8rem', fontFamily: "'Crimson Pro', serif", borderBottom: `1px solid ${theme.border}`, paddingBottom: '15px', marginBottom: '30px' }}>Índice de capítulos</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {chapters.map((ch, index) => {
            const isRead = progress.readChapters.includes(ch.id);
            const isLast = progress.lastChapterIndex === index;

            return (
              <Link key={ch.id} to={`/reader/${book.id}/${index}`} style={{ 
                padding: '20px', 
                background: isRead ? theme.readColor : theme.card, 
                border: isLast ? `1px solid ${theme.accent}` : `1px solid ${theme.border}`,
                borderRadius: '12px', 
                textDecoration: 'none', 
                color: isRead ? theme.readText : theme.textMain, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                transition: '0.3s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = isLast ? theme.accent : theme.border; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: theme.accent, display: 'block', marginBottom: '4px' }}>{String(index + 1).padStart(2, '0')}</span>
                  <span style={{ fontWeight: isLast ? 700 : 500, fontSize: '1.05rem' }}>{ch.title}</span>
                  {isLast && <span style={{color: theme.accent, fontSize: '0.65rem', fontWeight: 800, display: 'block', marginTop: '4px'}}>📍 ÚLTIMA LECTURA</span>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{isRead ? 'VISTO' : `${ch.word_count} PAL.`}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: '60px' }}>
        <h3 style={{ fontSize: '2.2rem', fontFamily: "'Crimson Pro', serif", marginBottom: '40px' }}>Críticas de la comunidad</h3>

        <div style={{ 
          background: theme.card, padding: '40px', borderRadius: '20px', 
          border: userReview ? `1px solid ${theme.accent}` : `1px solid ${theme.border}`, marginBottom: '60px', position: 'relative'
        }}>
          {userReview && <div style={{ position: 'absolute', top: '-12px', right: '30px', background: theme.accent, color: darkMode ? '#000' : '#fff', padding: '4px 15px', borderRadius: '40px', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px' }}>TU CRÍTICA</div>}

          <div style={{ display: 'flex', gap: '30px', marginBottom: '30px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.7rem', fontWeight: 800, color: theme.textMuted, display: 'block', marginBottom: '10px' }}>PROGRESO</label>
              <select value={readingStatus} onChange={(e) => setReadingStatus(e.target.value)}
                style={{ width: '100%', padding: '14px', borderRadius: '10px', background: theme.bgLight, color: theme.textMain, border: `1px solid ${theme.border}`, fontSize: '0.9rem', outline: 'none' }}>
                <option value="">-- Seleccionar progreso --</option>
                <option value="Completada">Obra completada</option>
                <option value="Leyendo actualmente">Leyendo actualmente</option>
                {chapters.map((ch, i) => <option key={i} value={`Capítulo ${i + 1}`}>Capítulo {i + 1}</option>)}
                <option value="Abandonada">Abandonada</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.7rem', fontWeight: 800, color: theme.textMuted, display: 'block', marginBottom: '10px' }}>TU CALIFICACIÓN</label>
              <div style={{ padding: '8px 0' }}>{renderStars(rating.userScore)}</div>
            </div>
          </div>
          
          <textarea value={newComment} onChange={e => setNewComment(e.target.value)} 
            style={{ width: '100%', height: '140px', padding: '20px', borderRadius: '12px', background: darkMode ? 'rgba(0,0,0,0.2)' : '#fff', color: theme.textMain, border: `1px solid ${theme.border}`, marginBottom: '20px', outline: 'none', fontSize: '1rem', fontFamily: 'inherit', resize: 'none' }} 
            placeholder="Escribe tu opinión aquí..." />
          
          {errorMsg && <div style={{ color: theme.error, marginBottom: '20px', fontSize: '0.85rem', fontWeight: 600 }}>{errorMsg}</div>}
          
          <button onClick={postComment} style={{ padding: '14px 40px', background: userReview ? theme.success : theme.accent, color: darkMode ? '#000' : '#fff', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 800, fontSize: '0.85rem' }}>
            {userReview ? "ACTUALIZAR RESEÑA" : "PUBLICAR CRÍTICA"}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {comments.map(c => {
            const statusMatch = c.text.match(/^\[Estado: (.*?)\]/);
            const statusTag = statusMatch ? statusMatch[1] : null;
            const cleanText = c.text.replace(/^\[Estado: (.*?)\]\s*/, '');

            return (
              <div key={c.id} style={{ 
                display: 'flex', gap: '25px', background: theme.card, padding: '30px', borderRadius: '15px', 
                border: c.user_email === user?.email ? `1px solid ${theme.accent}` : `1px solid ${theme.border}`
              }}>
                <img src={c.display_photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.user_email}`} style={{ width: '60px', height: '60px', borderRadius: '50%', border: `2px solid ${theme.accent}`, padding: '2px', background: theme.bgLight }} alt="User" />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', fontFamily: "'Crimson Pro', serif" }}>{c.display_name || c.user_name}</h4>
                      {statusTag && <span style={{ fontSize: '0.65rem', color: theme.accent, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>{statusTag}</span>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ marginBottom: '4px' }}>{renderStars(c.user_rating || 0)}</div>
                      <small style={{ color: theme.textMuted, fontSize: '0.7rem' }}>{new Date(c.timestamp).toLocaleDateString()}</small>
                    </div>
                  </div>
                  <p style={{ margin: 0, opacity: 0.85, lineHeight: '1.6', fontSize: '0.95rem' }}>{cleanText}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {notif && (
        <div style={{ 
          position: 'fixed', bottom: '30px', right: '30px', backgroundColor: '#1a1a1a', color: 'white',
          padding: '16px 30px', borderRadius: '50px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: '15px', fontSize: '0.85rem', border: `1px solid ${theme.accent}`,
          animation: 'slideIn 0.5s ease-out'
        }}>
          <span style={{ color: theme.accent }}>✦</span> {notif}
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;600;800&display=swap');
        @keyframes slideIn {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default BookDetail;