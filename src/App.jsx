import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google'
import { jwtDecode } from "jwt-decode"


// Componentes y Páginas
import BookReader from './pages/BookReader'
import PublishBook from './pages/PublishBook' 
import AuthorDashboard from './pages/AuthorDashboard'
import AddChapter from './pages/AddChapter' 
import BookDetail from './pages/BookDetail'
import Rankings from './pages/Rankings' 
import AuthorBookDetails from './pages/AuthorBookDetails'
import EditChapter from './pages/EditChapter';
import MyLibrary from './pages/MyLibrary'; 
import AdvancedSearch from './pages/AdvancedSearch'

// --- COMPONENTE MODAL DE CONFIGURACIÓN ---
const OnboardingModal = ({ user, onSave, darkMode }) => {
  const [nickname, setNickname] = useState(user.name || '');
  const [selectedPhoto, setSelectedPhoto] = useState(user.picture);

  const defaultAvatars = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Boots",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Casper"
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("La imagen es muy pesada. Intenta con una de menos de 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const modalStyle = {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center',
    alignItems: 'center', zIndex: 3000, backdropFilter: 'blur(8px)'
  };

  const cardStyle = {
    backgroundColor: darkMode ? '#1a1d23' : '#fff',
    padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '400px',
    textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
    border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
    maxHeight: '90vh', overflowY: 'auto'
  };

  return (
    <div style={modalStyle}>
      <div style={cardStyle}>
        <h2 style={{ marginBottom: '5px', fontSize: '1.6rem' }}>¡Personaliza tu perfil!</h2>
        <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '20px' }}>Así te verán otros lectores en los comentarios.</p>
        
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
          <img 
            src={selectedPhoto} 
            alt="Preview" 
            style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #3498db', padding: '3px' }} 
          />
        </div>

        <div style={{ textAlign: 'left', marginBottom: '15px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.6, display: 'block', marginBottom: '5px' }}>TU APODO</label>
          <input 
            type="text" 
            value={nickname} 
            onChange={(e) => setNickname(e.target.value)}
            style={{
              width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #3498db',
              backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : '#f9f9f9', color: darkMode ? '#fff' : '#000',
              fontSize: '1rem', outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ textAlign: 'left', marginBottom: '20px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.6, display: 'block', marginBottom: '5px' }}>SUBIR MI PROPIA FOTO</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={handleFileUpload}
            style={{ fontSize: '0.8rem', width: '100%' }}
          />
        </div>

        <label style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.6, display: 'block', marginBottom: '10px', textAlign: 'left' }}>O ELIGE UN AVATAR</label>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '25px' }}>
          {[user.picture, ...defaultAvatars].map((url, i) => (
            <img 
              key={i} src={url} alt="avatar"
              onClick={() => setSelectedPhoto(url)}
              style={{
                width: '50px', height: '50px', borderRadius: '12px', cursor: 'pointer',
                border: selectedPhoto === url ? '3px solid #3498db' : '2px solid transparent',
                transform: selectedPhoto === url ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.2s ease', backgroundColor: '#eee', objectFit: 'cover'
              }}
            />
          ))}
        </div>

        <button 
          onClick={() => onSave(nickname, selectedPhoto)}
          style={{
            backgroundColor: '#3498db', color: '#fff', border: 'none', padding: '14px',
            borderRadius: '10px', cursor: 'pointer', fontWeight: 700, width: '100%',
            fontSize: '1rem'
          }}
        >
          Guardar y Entrar
        </button>
      </div>
    </div>
  );
};

// --- COMPONENTE DE BOTÓN PERSONALIZADO ---
const CustomGoogleButton = ({ onSuccess, darkMode }) => {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      const data = await res.json();
      onSuccess(data);
    },
  });

  const btnStyle = {
    display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 16px',
    borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
    transition: 'all 0.3s ease',
    backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    color: darkMode ? '#e0e0e0' : '#2c3e50',
    border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
  };

  return (
    <button onClick={() => login()} style={btnStyle}>
      <svg width="16" height="16" viewBox="0 0 24 24">
        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      Acceder
    </button>
  );
};



const ForceScrollToTop = () => {
  const { pathname } = useLocation(); // Escuchar solo la ruta, no todo el objeto

  useLayoutEffect(() => {
    // 1. Apagar el comportamiento automático del navegador
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // 2. Forzar scroll arriba instantáneamente
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // 3. El truco maestro: Doble requestAnimationFrame. 
    // Esto espera exactamente al frame donde el nuevo DOM ya tiene sus alturas reales.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
      });
    });

  }, [pathname]); 

  return null;
};




function App() {
  //ocultar la barra de navegacion si se lee un capitulo en BookReader
  const location = useLocation();
  const isReaderRoute = location.pathname.startsWith('/reader'); 
//////


  const [darkMode, setDarkMode] = useState(true);
  const [books, setBooks] = useState([]);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [recentlyUpdated, setRecentlyUpdated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('userSession');
    return savedUser ? JSON.parse(savedUser) : null;
  });

const theme = {
  // OSCURO: Tinta profunda con acentos en oro viejo
  // CLARO: Papel papiro suave con acentos en terracota
  bg: darkMode ? '#0a0b10' : '#f4f0ea', 
  card: darkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.5)', // Efecto cristal
  accent: darkMode ? '#d4af37' : '#b85b3f', // Oro / Terracota
  textMain: darkMode ? '#e3e1db' : '#2b2824',
  textMuted: darkMode ? '#8a8782' : '#857f77',
  border: darkMode ? 'rgba(212, 175, 55, 0.15)' : 'rgba(184, 91, 63, 0.15)',
  navBg: darkMode ? 'rgba(10, 11, 16, 0.7)' : 'rgba(244, 240, 234, 0.7)',
  shadow: darkMode ? '0 15px 35px rgba(0,0,0,0.5)' : '0 15px 35px rgba(133,127,119,0.15)'
};

  useEffect(() => {
    document.body.style.backgroundColor = theme.bg;
  }, [theme.bg]);

  const refreshBooks = useCallback(() => {
    setLoading(true);
    const fetchAllBooks = fetch('http://127.0.0.1:5001/api/books')
      .then(res => res.ok ? res.json() : [])
      .catch(() => []);

const fetchRecent = fetch('http://127.0.0.1:5001/api/books/recently-updated')
  .then(res => res.ok ? res.json() : [])
  .catch(() => []); // Esto evita que el 404 bloquee el resto de la app

    const now = new Date().getTime();
    const lastFetch = localStorage.getItem('featuredLastFetch');
    const savedFeatured = localStorage.getItem('featuredBooks');

    let fetchFeatured;
    if (savedFeatured && lastFetch && (now - lastFetch < 10 * 1000)) {
      fetchFeatured = Promise.resolve(JSON.parse(savedFeatured));
    } else {
      fetchFeatured = fetch('http://127.0.0.1:5001/api/books/featured-random')
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          localStorage.setItem('featuredBooks', JSON.stringify(data));
          localStorage.setItem('featuredLastFetch', now.toString());
          return data;
        })
        .catch(() => []);
    }

    Promise.all([fetchAllBooks, fetchFeatured, fetchRecent]).then(([all, feat, recent]) => {
      setBooks(Array.isArray(all) ? all : []);
      setFeaturedBooks(Array.isArray(feat) ? feat : []);
      setRecentlyUpdated(Array.isArray(recent) ? recent : []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    refreshBooks();
  }, [refreshBooks]);

  const handleLoginSuccess = (userData) => {
    setUser(userData); 
    setShowOnboarding(true); 
  };

  const handleSaveProfile = async (newNick, newPhoto) => {
    const updatedUser = { ...user, name: newNick, picture: newPhoto };
    try {
      await fetch('http://127.0.0.1:5001/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, nickname: newNick, picture: newPhoto }),
      });
      setUser(updatedUser);
      localStorage.setItem('userSession', JSON.stringify(updatedUser));
      setShowOnboarding(false);
    } catch (error) {
      setShowOnboarding(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('userSession');
  };

  // --- ESTILO PORTADA PREDETERMINADA (REUTILIZABLE) ---
const defaultCoverStyle = {
  width: '100%', aspectRatio: '2/3', borderRadius: '8px', 
  backgroundColor: darkMode ? '#252a33' : '#efeae4',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: darkMode ? '#4a5568' : '#b2a89f', 
  fontFamily: "'Crimson Pro', serif", fontSize: '0.9rem',
  textAlign: 'center'
};

return (
    <GoogleOAuthProvider clientId="750793668642-7apu45i7te8b8gibnrelnhjgqj7vg512.apps.googleusercontent.com">

    <ForceScrollToTop />

      {showOnboarding && user && (
        <OnboardingModal user={user} onSave={handleSaveProfile} darkMode={darkMode} />
      )}

    <div style={{ backgroundColor: theme.bg, color: theme.textMain, minHeight: '100vh', width: '100%', transition: 'background-color 0.4s ease, color 0.4s ease', fontFamily: "'Inter', sans-serif" }}>
        
        {/* NAVBAR TIPO PÍLDORA FLOTANTE - Solo se muestra si NO estás leyendo */}
        {!isReaderRoute && (
          <div style={{ position: 'sticky', top: '20px', zIndex: 1000, padding: '0 20px' }}>
            <nav style={{ 
              maxWidth: '1000px', margin: '0 auto', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
              backgroundColor: theme.navBg, border: `1px solid ${theme.border}`, padding: '12px 25px', 
              borderRadius: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              boxShadow: theme.shadow 
            }}>
              <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                <Link to="/" style={{ color: theme.textMain, textDecoration: 'none', fontWeight: 800, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Crimson Pro', serif" }}>
                  <span style={{ color: theme.accent }}>✦</span> Libreria Amateur
                </Link>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <Link to="/rankings" style={{ color: theme.textMain, textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, opacity: 0.7, transition: '0.3s' }}>Rankings</Link>
                  <Link to="/search" style={{ color: theme.textMain, textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, opacity: 0.7, transition: '0.3s' }}>Explorar</Link>
                  {user && (
                    <>
                      <Link to="/library" style={{ color: theme.textMain, textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, opacity: 0.7 }}>Mi Biblioteca</Link>
                      <Link to="/dashboard" style={{ color: theme.textMain, textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, opacity: 0.7 }}>Mi Studio</Link>
                    </>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                {!user ? <CustomGoogleButton onSuccess={handleLoginSuccess} darkMode={darkMode} /> : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderRight: `1px solid ${theme.border}`, paddingRight: '15px' }}>
                    <img src={user.picture} alt="profile" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                    <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Salir</button>
                  </div>
                )}
                <button className="mode-toggle" onClick={() => setDarkMode(!darkMode)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', display: 'flex' }}>
                  {darkMode ? '☀️' : '🌙'}
                </button>
              </div>
            </nav>
          </div>
        )}

        {/* CONTENEDOR DE RUTAS - Ajustado para modo lectura inmersivo */}
        <div style={{ 
          maxWidth: isReaderRoute ? '100%' : '1100px', 
          margin: '0 auto', 
          padding: isReaderRoute ? '0' : '0 20px' 
        }}>
          <Routes>
            <Route path="/" element={
              <main style={{ paddingTop: '80px' }}>
                
                {/* CABECERA EDITORIAL CON HALO DE LUZ */}
<header style={{ 
  marginBottom: '100px', 
  textAlign: 'center', 
  padding: '0 20px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
}}>
  {/* Subtítulo minimalista */}
  <p style={{ 
    color: theme.accent, 
    fontSize: '0.75rem', 
    fontWeight: 600, 
    letterSpacing: '0.4em', 
    textTransform: 'uppercase', 
    marginBottom: '24px',
    opacity: 0.8
  }}>
    Comunidad Literaria
  </p>

  {/* Título Principal */}
  <h1 style={{ 
    fontSize: 'clamp(2.2rem, 6vw, 4.2rem)', 
    fontWeight: 300, // Un peso más ligero lo hace ver más sofisticado
    lineHeight: 1.1, 
    maxWidth: '900px', 
    margin: '0 auto',
    color: theme.textMain,
    letterSpacing: '-0.03em'
  }}>
    El lugar donde{' '}
    <span style={{ 
      fontFamily: "'Cormorant Garamond', serif", // Tipografía elegante
      fontStyle: 'italic', 
      color: theme.accent,
      fontWeight: 800,
      padding: '0 4px', // Un pequeño respiro lateral
      display: 'inline-block' 
    }}>
      todo Autor
    </span>{' '}
    tiene visibilidad.
  </h1>

  {/* Opcional: Una línea divisoria muy sutil para armonizar el final del header */}
  <div style={{ 
    width: '40px', 
    height: '1px', 
    background: theme.accent, 
    marginTop: '40px',
    opacity: 0.4 
  }}></div>
</header>

                {featuredBooks.length > 0 && (
                  <section style={{ marginBottom: '60px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                      <h2 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Destacados</h2>
                      <span style={{ fontSize: '0.65rem', backgroundColor: '#f1c40f', color: '#000', padding: '2px 8px', borderRadius: '4px', fontWeight: 900 }}>6 HORAS</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
                      {featuredBooks.map(book => (
                        <Link key={`feat-${book.id}`} to={`/book/${book.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <div className="book-card-featured" style={{ backgroundColor: theme.card, padding: '15px', borderRadius: '12px', border: `1px solid ${theme.border}` }}>
                            {book.author_note && book.author_note !== 'null' ? (
                                <img src={`http://127.0.0.1:5001/static/covers/${book.author_note}`} alt={book.title} style={{ width: '100%', aspectRatio: '2/3', borderRadius: '8px', objectFit: 'cover' }} />
                            ) : (
                                <div style={defaultCoverStyle}>SIN IMAGEN</div>
                            )}
                            <h3 style={{ margin: '15px 0 0 0', fontSize: '0.9rem', fontWeight: 700, textAlign: 'center' }}>{book.title}</h3>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                <section style={{ marginBottom: '60px' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '25px' }}>Todos los Libros</h2>
                  {loading ? <div className="spinner"></div> : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '40px' }}>
                      {books.map(book => (
                        <Link key={book.id} to={`/book/${book.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <div className="book-card" style={{ padding: '15px' }}>
                            <div style={{ width: '100%', aspectRatio: '2/3', backgroundColor: '#222', borderRadius: '8px', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                               {book.author_note && book.author_note !== 'null' ? (
                                   <img src={`http://127.0.0.1:5001/static/covers/${book.author_note}`} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                               ) : (
                                   <div style={{ ...defaultCoverStyle, border: 'none' }}>SIN IMAGEN</div>
                               )}
                            </div>
                            <h3 style={{ margin: '15px 0 4px 0', fontSize: '1.05rem', fontWeight: 700, textAlign: 'center' }}>{book.title}</h3>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </section>

                {recentlyUpdated.length > 0 && (
                  <section style={{ padding: '40px 0 100px 0', borderTop: `1px solid ${theme.border}` }}>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '25px' }}>Recién Actualizados</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
                      {recentlyUpdated.map(book => (
                        <Link key={`recent-${book.id}`} to={`/book/${book.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <div className="recent-item" style={{ display: 'flex', gap: '15px', padding: '12px', backgroundColor: theme.card, borderRadius: '10px', border: `1px solid ${theme.border}`, transition: 'all 0.2s' }}>
                            {book.author_note && book.author_note !== 'null' ? (
                                <img src={`http://127.0.0.1:5001/static/covers/${book.author_note}`} style={{ width: '50px', height: '70px', borderRadius: '4px', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '50px', height: '70px', borderRadius: '4px', backgroundColor: darkMode ? '#333' : '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', fontWeight: 800, color: darkMode ? '#555' : '#aaa', textAlign: 'center' }}>SIN<br/>IMG</div>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>{book.title}</h4>
                              <p style={{ margin: '2px 0', fontSize: '0.8rem', opacity: 0.6 }}>Por {book.author}</p>
                              <span style={{ fontSize: '0.7rem', color: theme.accent, fontWeight: 700 }}>Capítulo nuevo</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
              </main>
            } />
            <Route path="/rankings" element={<Rankings darkMode={darkMode} />} />
            <Route path="/library" element={<MyLibrary user={user} darkMode={darkMode} />} />
            <Route path="/book/:id" element={<BookDetail user={user} darkMode={darkMode} />} />
            <Route path="/reader/:id/:chapterIndex" element={<BookReader user={user} darkMode={darkMode} setDarkMode={setDarkMode} />} />
            <Route path="/publish" element={<PublishBook user={user} darkMode={darkMode} refreshBooks={refreshBooks} />} />
            <Route path="/dashboard" element={<AuthorDashboard user={user} darkMode={darkMode} />} />
            <Route path="/add-chapter/:id" element={<AddChapter user={user} darkMode={darkMode} />} />
            <Route path="/dashboard/book/:id" element={<AuthorBookDetails user={user} darkMode={darkMode} />} />
            <Route path="/edit-chapter/:chapterId" element={<EditChapter darkMode={darkMode} />} />
            <Route path="/search" element={<AdvancedSearch darkMode={darkMode} />} />
          </Routes>
        </div>
      </div>

<style>{`
  @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;600&family=Cormorant+Garamond:ital,wght@1,600&display=swap');

  * { 
    margin: 0; 
    padding: 0; 
    box-sizing: border-box; 
    transition: background-color 0.6s ease, color 0.4s ease, border-color 0.4s ease;
  }

  body { 
    -webkit-font-smoothing: antialiased;
  }

  /* Tipografías Híbridas */
  h1, h2, h3 { font-family: 'Crimson Pro', serif; }
  p, span, a, button, nav { font-family: 'Inter', sans-serif; }

  /* El Halo Mágico detrás del título */
  .ambient-glow {
    position: absolute;
    top: -50px;
    left: 50%;
    transform: translateX(-50%);
    width: 600px;
    height: 300px;
    z-index: -1;
    filter: blur(60px);
    pointer-events: none;
  }

  /* Tarjetas estilo Glassmorphism (Cristal) */
  .book-card, .book-card-featured, .recent-item {
    border-radius: 20px !important;
    background-color: ${theme.card} !important;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid ${theme.border} !important;
    position: relative;
    overflow: hidden;
  }

  /* Portada Estática */
  .book-card > div:first-child, .book-card-featured > img, .book-card-featured > div:first-child {
    border-radius: 8px !important;
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
    transition: box-shadow 0.4s ease;
  }

  /* Brillo en el recuadro al pasar el mouse */
  .book-card:hover, .book-card-featured:hover, .recent-item:hover { 
    border-color: ${theme.accent} !important; 
    box-shadow: 0 0 15px ${theme.accent}33;
  }
  
  .mode-toggle { transition: transform 0.5s ease; }
  .mode-toggle:hover { transform: rotate(45deg); }

  /* Enlaces del nav */
  nav a:hover { opacity: 1 !important; color: ${theme.accent} !important; }

  /* Spinner Elegante */
  .spinner { 
    width: 35px; height: 35px; 
    border: 2px solid transparent; 
    border-top-color: ${theme.accent}; 
    border-left-color: ${theme.accent};
    border-radius: 50%; 
    animation: spin 1s cubic-bezier(0.6, 0.2, 0.4, 0.8) infinite; 
    margin: 60px auto; 
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${theme.border}; border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: ${theme.accent}; }
`}</style>
    </GoogleOAuthProvider>
  )
}

export default App;