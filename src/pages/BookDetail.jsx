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
    accent: '#3498db',
    textMain: darkMode ? '#e0e0e0' : '#2c3e50',
    textMuted: darkMode ? '#a0a0a0' : '#7f8c8d',
    card: darkMode ? '#1a1d23' : '#ffffff',
    border: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
    error: '#e74c3c',
    success: '#2ecc71',
    star: '#f1c40f',
    bgLight: darkMode ? 'rgba(255,255,255,0.05)' : '#f8f9fa',
    // --- NUEVO: COLORES PARA CAPÍTULOS LEÍDOS ---
    readColor: darkMode ? '#1e3a2b' : '#d4edda', // Fondo verde según modo
    readText: darkMode ? '#82e0aa' : '#155724'      // Texto verde según modo
  };

  const userReview = comments.find(c => c.user_email === user?.email);

  useEffect(() => {
    fetch(`http://127.0.0.1:5001/api/books/${id}`).then(r => r.json()).then(setBook);
    fetch(`http://127.0.0.1:5001/api/books/${id}/chapters`).then(r => r.json()).then(setChapters);
    fetchComments();

    if (user) {
      // Cargar rating
      fetch(`http://127.0.0.1:5001/api/books/${id}/rating-status/${user.email}`)
        .then(r => r.json())
        .then(data => setRating({ 
            average: data.average, 
            total: data.total_votes, 
            userScore: data.user_score 
        }));

      // Cargar estado en biblioteca
      fetch(`http://127.0.0.1:5001/api/library?email=${user.email}`)
        .then(r => r.json())
        .then(data => {
          const bookInLib = data.find(b => b.id === parseInt(id));
          if (bookInLib) setLibraryStatus(bookInLib.status);
        });
      
// --- ACTUALIZADO: CARGAR PROGRESO PERSISTENTE ---
if (user) {
  fetch(`http://127.0.0.1:5001/api/progress/${user.email}/${id}`)
    .then(r => {
      if (!r.ok) throw new Error('Error en la red');
      return r.json();
    })
    .then(data => {
      if (data) {
        setProgress({ 
          lastChapterIndex: data.last_chapter_id, // Asegúrate que el front use este ID
          readChapters: data.read_chapters || [] 
        });
      }
    })
    .catch(err => console.error("Error cargando progreso:", err)); // --- NUEVO: Captura el error de CORS ---
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

  // --- FUNCIÓN ACTUALIZAR BIBLIOTECA ---
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
      <span key={i} style={{ color: i < count ? theme.star : '#444', fontSize: '1.1rem' }}>
        {i < count ? '★' : '☆'}
      </span>
    ));
  };

  if (!book) return <div style={{padding: '100px', textAlign: 'center', color: theme.textMain}}>Cargando...</div>;

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', color: theme.textMain }}>
      
      <div style={{ display: 'flex', gap: '50px', marginBottom: '60px', flexWrap: 'wrap' }}>
        <img src={`http://127.0.0.1:5001/static/covers/${book.author_note}`} style={{ width: '280px', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }} alt="Portada" />
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h1 style={{ fontSize: '3rem', margin: '0 0 10px 0' }}>{book.title}</h1>
          <p style={{ color: theme.accent, fontSize: '1.2rem', marginBottom: '20px' }}>{book.author}</p>

          <div style={{ marginBottom: '20px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} onClick={() => handleRate(star)} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)}
                style={{ fontSize: '30px', cursor: 'pointer', background: 'none', border: 'none', color: star <= (hover || rating.userScore) ? theme.star : '#444' }}>
                ★
              </button>
            ))}
            <span style={{ marginLeft: '10px', fontSize: '1.5rem', fontWeight: 'bold' }}>{rating.average.toFixed(1)}</span>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '10px', opacity: 0.7 }}>MI BIBLIOTECA</label>
            <div style={{ 
              display: 'flex', background: theme.bgLight, borderRadius: '12px', padding: '5px', gap: '5px', border: `1px solid ${theme.border}`, flexWrap: 'wrap'
            }}>
              {[
                { id: 'reading', icon: '📖', label: 'Leyendo' },
                { id: 'pending', icon: '⏳', label: 'Pendiente' },
                { id: 'completed', icon: '✅', label: 'Leído' },
                { id: 'dropped', icon: '⏹️', label: 'Abandonado' }
              ].map((item) => (
                <button key={item.id} onClick={() => updateLibrary(item.id)} disabled={isUpdatingLib}
                  style={{
                    flex: 1, minWidth: '80px', padding: '10px 5px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold',
                    backgroundColor: libraryStatus === item.id ? theme.accent : 'transparent',
                    color: libraryStatus === item.id ? 'white' : theme.textMain,
                    transition: '0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
              {libraryStatus && (
                <button onClick={() => updateLibrary('remove')} style={{ padding: '0 15px', background: 'transparent', border: 'none', color: theme.error, cursor: 'pointer', fontSize: '1.2rem' }} title="Quitar de mi biblioteca">✕</button>
              )}
            </div>
          </div>

          <p style={{ lineHeight: '1.8', opacity: 0.9, marginBottom: '30px' }}>{book.description}</p>
          
          {chapters.length > 0 && (
            // --- ACTUALIZADO: Botón redirige al último capítulo ---
            <Link to={`/reader/${book.id}/${progress.lastChapterIndex !== -1 ? progress.lastChapterIndex : 0}`} style={{ background: theme.accent, color: 'white', padding: '12px 35px', borderRadius: '30px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block' }}>
              {progress.lastChapterIndex !== -1 ? "CONTINUAR LEYENDO" : "COMENZAR A LEER"}
            </Link>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '60px' }}>
        <h3 style={{ fontSize: '1.5rem', borderBottom: `2px solid ${theme.border}`, paddingBottom: '10px', marginBottom: '20px' }}>Índice de capítulos</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
          {chapters.map((ch, index) => {
            // --- NUEVO: LÓGICA DE ESTILOS POR PROGRESO ---
            const isRead = progress.readChapters.includes(ch.id);
            const isLast = progress.lastChapterIndex === index;

            return (
              <Link key={ch.id} to={`/reader/${book.id}/${index}`} style={{ 
                padding: '15px', 
                // --- ACTUALIZADO: Fondo verde si está leído ---
                background: isRead ? theme.readColor : theme.card, 
                // --- ACTUALIZADO: Borde destacado si es el último ---
                border: isLast ? `2px solid ${theme.accent}` : `1px solid ${theme.border}`,
                borderRadius: '8px', 
                textDecoration: 'none', 
                // --- ACTUALIZADO: Texto verde si está leído ---
                color: isRead ? theme.readText : theme.textMain, 
                display: 'flex', 
                justifyContent: 'space-between', 
                transition: '0.2s',
                position: 'relative' // Para posicionar la etiqueta "Donde quedaste"
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = theme.accent}
              onMouseOut={(e) => e.currentTarget.style.borderColor = isLast ? theme.accent : theme.border}
              >
                <span style={{ fontWeight: isLast ? 'bold' : 'normal' }}>
                  {index + 1}. {ch.title}
                  {/* --- NUEVO: Etiqueta Donde quedaste --- */}
                  {isLast && <span style={{color: theme.accent, fontSize: '0.7rem', display: 'block'}}>📍 Donde quedaste</span>}
                </span>
                <span style={{ fontSize: '0.8rem', color: isRead ? theme.readText : theme.textMuted }}>
                  {isRead ? '✅' : `${ch.word_count} pal.`}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <div style={{ borderTop: `2px solid ${theme.border}`, paddingTop: '40px' }}>
        <h3 style={{ fontSize: '1.8rem', marginBottom: '30px' }}>Reseñas de la comunidad</h3>

        <div style={{ 
          background: theme.card, padding: '30px', borderRadius: '15px', 
          border: userReview ? `2px solid ${theme.accent}` : `1px solid ${theme.border}`, marginBottom: '50px', position: 'relative'
        }}>
          {userReview && <div style={{ position: 'absolute', top: '-12px', right: '20px', background: theme.accent, color: 'white', padding: '2px 12px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 'bold' }}>RESEÑA YA PUBLICADA</div>}

          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>1. Estado de lectura</label>
              <select value={readingStatus} onChange={(e) => setReadingStatus(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '6px', background: darkMode ? '#2c313c' : '#f0f2f5', color: theme.textMain, border: `1px solid ${theme.border}` }}>
                <option value="">-- Selecciona progreso --</option>
                <option value="Completada">✅ Obra completada</option>
                <option value="Leyendo actualmente">📖 Leyendo actualmente</option>
                {chapters.map((ch, i) => <option key={i} value={`Capítulo ${i + 1}`}>📍 Cap. {i + 1}</option>)}
                <option value="Abandonada">⏹️ Abandonada</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>2. Tu calificación</label>
              <div style={{ padding: '8px 0' }}>{renderStars(rating.userScore)}</div>
            </div>
          </div>
          
          <textarea value={newComment} onChange={e => setNewComment(e.target.value)} 
            style={{ width: '100%', height: '100px', padding: '15px', borderRadius: '8px', background: darkMode ? '#000' : '#fff', color: theme.textMain, border: `1px solid ${theme.border}`, marginBottom: '15px' }} 
            placeholder="Escribe tu opinión..." />
          
          {errorMsg && <div style={{ color: theme.error, marginBottom: '15px', fontWeight: 'bold' }}>{errorMsg}</div>}
          
          <button onClick={postComment} style={{ padding: '12px 30px', background: userReview ? theme.success : theme.accent, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '800' }}>
            {userReview ? "ACTUALIZAR MI RESEÑA" : "PUBLICAR RESEÑA"}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {comments.map(c => {
            const statusMatch = c.text.match(/^\[Estado: (.*?)\]/);
            const statusTag = statusMatch ? statusMatch[1] : null;
            const cleanText = c.text.replace(/^\[Estado: (.*?)\]\s*/, '');

            return (
              <div key={c.id} style={{ 
                display: 'flex', gap: '20px', background: theme.card, padding: '25px', borderRadius: '12px', 
                border: c.user_email === user?.email ? `1px solid ${theme.accent}` : `1px solid ${theme.border}`
              }}>
                <img src={c.display_photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.user_email}`} style={{ width: '55px', height: '55px', borderRadius: '50%', border: `2px solid ${theme.accent}` }} alt="User" />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div>
                      <h4 style={{ margin: 0 }}>{c.display_name || c.user_name}</h4>
                      {statusTag && <span style={{ fontSize: '0.7rem', color: theme.accent, fontWeight: 'bold' }}>{statusTag}</span>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div>{renderStars(c.user_rating || 0)}</div>
                      <small style={{ color: theme.textMuted }}>{new Date(c.timestamp).toLocaleDateString()}</small>
                    </div>
                  </div>
                  <p style={{ margin: 0, opacity: 0.9 }}>{cleanText}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* NOTIFICACIÓN FLOTANTE (Toast) */}
      {notif && (
        <div style={{ 
          position: 'fixed', bottom: '30px', left: '30px', backgroundColor: '#2c3e50', color: 'white',
          padding: '12px 25px', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', borderLeft: `5px solid ${theme.accent}`,
          animation: 'slideIn 0.5s ease-out'
        }}>
          <span>✨</span> {notif}
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default BookDetail;