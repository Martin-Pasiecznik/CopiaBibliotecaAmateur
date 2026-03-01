import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const BookReader = ({ user, darkMode, setDarkMode }) => {
  const { id, chapterIndex } = useParams();
  const navigate = useNavigate();

  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState('serif');

  // ESTADOS PARA COMENTARIOS
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasCounted = useRef(false);
  const triggerRef = useRef(null);
  const timerRef = useRef(null);

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
        
        // --- NUEVO: ACTUALIZAR PROGRESO EN EL BACKEND ---
        if (user) {
          updateProgress(currentCap.id);
        }
        // ------------------------------------------------
      }
      window.scrollTo(0, 0);
      hasCounted.current = false;
    }
  }, [chapterIndex, chapters, user]); // Añadido user a dependencias

  // --- NUEVO: FUNCIÓN PARA ENVIAR PROGRESO AL BACKEND ---
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
  // -----------------------------------------------------

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

  // --- LÓGICA DEL SENSOR DE VISTAS (CORREGIDA) ---
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

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', opacity: 0.5, color: darkMode ? '#fff' : '#000' }}>Abriendo pergaminos...</div>;

  const currentIndex = parseInt(chapterIndex) || 0;
  const currentChapter = chapters[currentIndex];

  if (!currentChapter) return <div style={{ textAlign: 'center', padding: '50px', color: darkMode ? '#fff' : '#000' }}>Capítulo no encontrado.</div>;

  const contentLines = currentChapter.content.split('\n');
  const midPoint = Math.floor(contentLines.length / 2);

  const theme = {
    text: darkMode ? '#d1d1d1' : '#2c3e50',
    bg: darkMode ? '#1a1d23' : '#f8f9fa',
    card: darkMode ? '#242831' : '#fff',
    border: darkMode ? '#333' : '#eee'
  };

  const readerTextStyle = {
    fontSize: `${fontSize}px`,
    fontFamily: fontFamily,
    lineHeight: '1.8',
    maxWidth: '750px',
    margin: '0 auto',
    textAlign: 'justify',
    color: theme.text,
    whiteSpace: 'pre-wrap',
    padding: '0 20px'
  };

  return (
    <div style={{ position: 'relative', backgroundColor: darkMode ? '#121418' : '#fff', minHeight: '100vh' }}>
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 20px', position: 'sticky', top: '0',
        backgroundColor: theme.bg, borderBottom: `1px solid ${theme.border}`,
        zIndex: 1000, marginBottom: '40px'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={btnSmall(darkMode)} onClick={() => setFontSize(fontSize + 2)}>A+</button>
          <button style={btnSmall(darkMode)} onClick={() => setFontSize(fontSize - 2)}>A-</button>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={btnSmall(darkMode)} onClick={() => navigate(`/book/${id}`)}>Índice</button>
          <button style={btnSmall(darkMode)} onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      <main style={{ paddingBottom: '40px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '40px', color: darkMode ? '#fff' : '#000' }}>
          {currentChapter.title}
        </h1>
        <div style={readerTextStyle}>
          {contentLines.slice(0, midPoint).join('\n')}
          <div ref={triggerRef} style={{ height: '20px', margin: '10px 0' }} />
          {contentLines.slice(midPoint).join('\n')}
        </div>
      </main>

      {/* SECCIÓN COMENTARIOS */}
      <section style={{ maxWidth: '750px', margin: '60px auto', padding: '0 20px' }}>
        <h3 style={{ color: theme.text, borderBottom: `2px solid ${theme.border}`, paddingBottom: '10px' }}>
          Comentarios del Capítulo ({comments.length})
        </h3>
        <form onSubmit={handlePostComment} style={{ marginBottom: '30px', marginTop: '20px' }}>
          <textarea 
            style={{ 
              width: '100%', padding: '15px', borderRadius: '10px', 
              backgroundColor: theme.card, color: theme.text, 
              border: `1px solid ${theme.border}`, outline: 'none',
              resize: 'vertical', minHeight: '80px', boxSizing: 'border-box'
            }}
            placeholder="¿Qué te pareció este capítulo?..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{ 
              marginTop: '10px', padding: '10px 20px', borderRadius: '5px', 
              backgroundColor: '#3498db', color: 'white', border: 'none', 
              cursor: 'pointer', fontWeight: 'bold', opacity: isSubmitting ? 0.6 : 1
            }}
          >
            {isSubmitting ? "Enviando..." : "Publicar comentario"}
          </button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {comments.map((c) => (
            <div key={c.id} style={{ 
              padding: '15px', borderRadius: '10px', 
              backgroundColor: theme.card, border: `1px solid ${theme.border}` 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontWeight: 'bold', color: '#3498db' }}>{c.user_name}</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.5, color: theme.text }}>
                  {new Date(c.timestamp).toLocaleDateString()}
                </span>
              </div>
              <p style={{ margin: 0, color: theme.text, lineHeight: '1.5' }}>{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      <div style={{ 
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        gap: '30px', padding: '60px 0 100px 0',
        borderTop: `1px solid ${theme.border}`, marginTop: '40px'
      }}>
        <button 
          style={{...navBtnStyle, opacity: currentIndex === 0 ? 0.3 : 1}} 
          disabled={currentIndex === 0}
          onClick={() => navigate(`/reader/${id}/${currentIndex - 1}`)}
        >
          ← Anterior
        </button>
        <span style={{ fontWeight: 600, opacity: 0.6, color: darkMode ? '#fff' : '#000' }}> 
          {currentIndex + 1} / {chapters.length} 
        </span>
        <button 
          style={{...navBtnStyle, opacity: currentIndex === chapters.length - 1 ? 0.3 : 1}} 
          disabled={currentIndex === chapters.length - 1}
          onClick={() => navigate(`/reader/${id}/${currentIndex + 1}`)}
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
};

const btnSmall = (darkMode) => ({ 
  padding: '6px 12px', cursor: 'pointer', borderRadius: '4px', 
  border: '1px solid #ccc', backgroundColor: 'transparent', 
  color: darkMode ? '#fff' : '#000' 
});

const navBtnStyle = { 
  padding: '12px 30px', backgroundColor: '#3498db', color: 'white', 
  border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' 
};

export default BookReader;