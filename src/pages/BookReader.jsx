import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const BookReader = ({ user, darkMode, setDarkMode }) => {
  const { id, chapterIndex } = useParams();
  const navigate = useNavigate();

  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(20); // Un poco más grande por defecto
  const [fontFamily, setFontFamily] = useState("'Crimson Pro', serif");

  // ESTADOS PARA COMENTARIOS
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasCounted = useRef(false);
  const triggerRef = useRef(null);
  const timerRef = useRef(null);

  const theme = {
    accent: darkMode ? '#d4af37' : '#b85b3f',
    textMain: darkMode ? '#e3e1db' : '#2c2926',
    textMuted: darkMode ? '#8a8782' : '#7a746e',
    bg: darkMode ? '#121418' : '#fcfaf7',
    card: darkMode ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
    border: darkMode ? 'rgba(212, 175, 55, 0.15)' : 'rgba(184, 91, 63, 0.12)'
  };

  // 1. CARGA INICIAL DE CAPÍTULOS
  useEffect(() => {
    loadChapterData();
  }, [id]);

  // 2. CAMBIO DE CAPÍTULO Y ACTUALIZACIÓN DE PROGRESO
  useEffect(() => {
    if (chapters.length > 0) {
      const currentCap = chapters[parseInt(chapterIndex)];
      if (currentCap) {
        fetchComments(currentCap.id);
        if (user) {
          updateProgress(currentCap.id);
        }
      }
      window.scrollTo(0, 0);
      hasCounted.current = false;
    }
  }, [chapterIndex, chapters, user]);

  const updateProgress = (chapterId) => {
    fetch(`http://127.0.0.1:5001/api/progress/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        book_id: parseInt(id),
        chapter_id: chapterId
      })
    })
    .catch(err => console.error("Error actualizando progreso:", err));
  };

  const loadChapterData = () => {
    setLoading(true);
    fetch(`http://127.0.0.1:5001/api/books/${id}/chapters`)
      .then(response => response.json())
      .then(data => {
        setChapters(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  };

  const fetchComments = (chapterId) => {
    fetch(`http://127.0.0.1:5001/api/books/${id}/comments?chapter_id=${chapterId}`)
      .then(res => res.json())
      .then(data => setComments(data))
      .catch(err => console.error("Error al cargar comentarios:", err));
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    const currentCap = chapters[parseInt(chapterIndex)];
    if (!newComment.trim() || !currentCap) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`http://127.0.0.1:5001/api/books/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: user?.displayName || user?.name || "Lector Anónimo",
          user_email: user?.email || "anon@lector.com",
          text: newComment,
          chapter_id: currentCap.id
        })
      });

      if (res.ok) {
        setNewComment("");
        fetchComments(currentCap.id);
      }
    } catch (err) {
      console.error("Error al comentar:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (loading || !chapters.length || !triggerRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && !hasCounted.current) {
        timerRef.current = setTimeout(() => {
          hasCounted.current = true;
          fetch(`http://127.0.0.1:5001/api/books/${id}/view`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chapter_index: parseInt(chapterIndex) })
          })
          .then(res => res.json())
          .catch(err => console.error("Error al contabilizar:", err));
        }, 2000);
      } else {
        if (timerRef.current) clearTimeout(timerRef.current);
      }
    }, { threshold: 0.1 });

    observer.observe(triggerRef.current);
    return () => {
      observer.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [loading, id, chapterIndex, chapters]);

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: theme.accent, fontFamily: "'Crimson Pro', serif", fontSize: '1.2rem' }}>Abriendo manuscrito...</div>;

  const currentIndex = parseInt(chapterIndex) || 0;
  const currentChapter = chapters[currentIndex];

  if (!currentChapter) return <div style={{ textAlign: 'center', padding: '50px', color: theme.textMain }}>Capítulo no encontrado.</div>;

  const contentLines = currentChapter.content.split('\n');
  const midPoint = Math.floor(contentLines.length / 2);

  const readerTextStyle = {
    fontSize: `${fontSize}px`,
    fontFamily: fontFamily,
    lineHeight: '1.8',
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'justify',
    color: theme.textMain,
    whiteSpace: 'pre-wrap',
    padding: '0 30px',
    opacity: 0.95
  };

  return (
    <div style={{ position: 'relative', backgroundColor: theme.bg, minHeight: '100vh', transition: '0.3s', fontFamily: "'Inter', sans-serif" }}>
      {/* HEADER TOOLS */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '15px 30px', position: 'sticky', top: '0',
        backgroundColor: theme.bg, borderBottom: `1px solid ${theme.border}`,
        zIndex: 1000, marginBottom: '60px', backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={btnSmall(darkMode, theme)} onClick={() => setFontSize(fontSize + 2)}>A<span style={{fontSize: '0.6rem'}}>+</span></button>
          <button style={btnSmall(darkMode, theme)} onClick={() => setFontSize(fontSize - 2)}>A<span style={{fontSize: '0.6rem'}}>-</span></button>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button style={{...btnSmall(darkMode, theme), border: 'none', fontWeight: 700, letterSpacing: '1px'}} onClick={() => navigate(`/book/${id}`)}>VOLVER AL ÍNDICE</button>
          <button style={{...btnSmall(darkMode, theme), borderRadius: '50%', width: '40px', height: '40px', padding: 0}} onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      <main style={{ paddingBottom: '60px' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px', padding: '0 20px' }}>
          <span style={{ color: theme.accent, fontWeight: 800, fontSize: '0.8rem', letterSpacing: '3px' }}>CAPÍTULO {currentIndex + 1}</span>
          <h1 style={{ 
            fontSize: '3.5rem', marginTop: '10px', color: theme.textMain, 
            fontFamily: "'Crimson Pro', serif", fontWeight: 400 
          }}>
            {currentChapter.title}
          </h1>
          <div style={{ width: '40px', height: '2px', background: theme.accent, margin: '20px auto' }}></div>
        </div>

        <div style={readerTextStyle}>
          {contentLines.slice(0, midPoint).join('\n')}
          <div ref={triggerRef} style={{ height: '40px', margin: '20px 0', opacity: 0.1, textAlign: 'center' }}>✦</div>
          {contentLines.slice(midPoint).join('\n')}
        </div>
      </main>

      {/* SECCIÓN COMENTARIOS */}
      <section style={{ maxWidth: '800px', margin: '80px auto', padding: '0 30px' }}>
        <h3 style={{ 
          color: theme.textMain, fontFamily: "'Crimson Pro', serif", fontSize: '1.8rem',
          borderBottom: `1px solid ${theme.border}`, paddingBottom: '20px', marginBottom: '40px'
        }}>
          Notas de los lectores ({comments.length})
        </h3>

        <form onSubmit={handlePostComment} style={{ marginBottom: '50px' }}>
          <textarea 
            style={{ 
              width: '100%', padding: '20px', borderRadius: '15px', 
              backgroundColor: theme.card, color: theme.textMain, 
              border: `1px solid ${theme.border}`, outline: 'none',
              resize: 'vertical', minHeight: '120px', boxSizing: 'border-box',
              fontSize: '1rem', fontFamily: 'inherit', transition: '0.3s'
            }}
            onFocus={(e) => e.target.style.borderColor = theme.accent}
            placeholder="Comparte tus impresiones sobre este capítulo..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <div style={{ textAlign: 'right', marginTop: '15px' }}>
            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{ 
                padding: '12px 35px', borderRadius: '50px', 
                backgroundColor: theme.accent, color: darkMode ? '#000' : '#fff', border: 'none', 
                cursor: 'pointer', fontWeight: 800, fontSize: '0.8rem',
                opacity: isSubmitting ? 0.6 : 1, boxShadow: `0 10px 20px ${theme.accent}33`
              }}
            >
              {isSubmitting ? "ENVIANDO..." : "PUBLICAR NOTA"}
            </button>
          </div>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {comments.map((c) => (
            <div key={c.id} style={{ 
              padding: '25px', borderRadius: '15px', 
              backgroundColor: theme.card, border: `1px solid ${theme.border}`,
              display: 'flex', gap: '20px'
            }}>
              <div style={{ 
                width: '45px', height: '45px', borderRadius: '50%', 
                background: theme.accent, color: darkMode ? '#000' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '0.9rem', flexShrink: 0
              }}>
                {c.user_name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: theme.accent, fontSize: '0.9rem' }}>{c.user_name}</span>
                  <span style={{ fontSize: '0.7rem', color: theme.textMuted, fontWeight: 600 }}>
                    {new Date(c.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ margin: 0, color: theme.textMain, lineHeight: '1.6', fontSize: '0.95rem', opacity: 0.9 }}>{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NAVEGACIÓN INFERIOR */}
      <div style={{ 
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        gap: '40px', padding: '80px 0 120px 0',
        borderTop: `1px solid ${theme.border}`, marginTop: '60px'
      }}>
        <button 
          style={{...navBtnStyle(theme), opacity: currentIndex === 0 ? 0.2 : 1}} 
          disabled={currentIndex === 0}
          onClick={() => navigate(`/reader/${id}/${currentIndex - 1}`)}
        >
          ANTERIOR
        </button>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontWeight: 800, color: theme.textMain, fontSize: '1rem', display: 'block' }}> 
            {currentIndex + 1} / {chapters.length} 
          </span>
          <span style={{ fontSize: '0.6rem', color: theme.accent, fontWeight: 800, letterSpacing: '1px' }}>PÁGINA</span>
        </div>
        <button 
          style={{...navBtnStyle(theme), opacity: currentIndex === chapters.length - 1 ? 0.2 : 1}} 
          disabled={currentIndex === chapters.length - 1}
          onClick={() => navigate(`/reader/${id}/${currentIndex + 1}`)}
        >
          SIGUIENTE
        </button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;700;800&display=swap');
      `}</style>
    </div>
  );
};

const btnSmall = (darkMode, theme) => ({ 
  padding: '8px 15px', cursor: 'pointer', borderRadius: '8px', 
  border: `1px solid ${theme.border}`, backgroundColor: theme.card, 
  color: theme.textMain, fontSize: '0.8rem', transition: '0.3s',
  display: 'flex', alignItems: 'center', justifyContent: 'center'
});

const navBtnStyle = (theme) => ({ 
  padding: '14px 40px', backgroundColor: 'transparent', color: theme.textMain, 
  border: `1px solid ${theme.accent}`, borderRadius: '50px', cursor: 'pointer', 
  fontWeight: 800, fontSize: '0.75rem', letterSpacing: '2px', transition: '0.3s'
});

export default BookReader;