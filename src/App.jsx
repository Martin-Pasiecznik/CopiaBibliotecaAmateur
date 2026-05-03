import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

// Componentes y Páginas
import BookReader from "./pages/BookReader";
import PublishBook from "./pages/PublishBook";
import AuthorDashboard from "./pages/AuthorDashboard";
import AddChapter from "./pages/AddChapter";
import BookDetail from "./pages/BookDetail";
import Rankings from "./pages/Rankings";
import AuthorBookDetails from "./pages/AuthorBookDetails";
import EditChapter from "./pages/EditChapter";
import MyLibrary from "./pages/MyLibrary";
import AdvancedSearch from "./pages/AdvancedSearch";

// --- COMPONENTE MODAL DE CONFIGURACIÓN ---
const OnboardingModal = ({ user, onSave, darkMode, theme }) => {
  const [nickname, setNickname] = useState(user.name || "");
  const [selectedPhoto, setSelectedPhoto] = useState(user.picture);

  const localAvatars = [
    "1.png",
    "2.png",
    "3.png",
    "4.png",
    "5.png",
    "6.png",
    "7.png",
    "8.png",
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
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.75)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3000,
    backdropFilter: "blur(12px)",
  };

  const cardStyle = {
    backgroundColor: theme.bg,
    color: theme.textMain,
    padding: "40px",
    borderRadius: "28px",
    width: "90%",
    maxWidth: "420px",
    textAlign: "center",
    boxShadow: theme.shadow,
    border: `1px solid ${theme.border}`,
    maxHeight: "90vh",
    overflowY: "auto",
  };

  return (
    <div style={modalStyle}>
      <div style={cardStyle}>
        <h2
          style={{
            marginBottom: "8px",
            fontSize: "1.8rem",
            color: theme.accent,
          }}
        >
          ¡Personaliza tu perfil!
        </h2>
        <p
          style={{
            fontSize: "0.9rem",
            color: theme.textMuted,
            marginBottom: "25px",
          }}
        >
          ¿Cómo quieres que te vean los demás autores y lectores?
        </p>

        <div
          style={{
            marginBottom: "25px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <img
            src={
              selectedPhoto?.startsWith("http") ||
              selectedPhoto?.startsWith("data:image")
                ? selectedPhoto
                : `http://127.0.0.1:5001/static/avatars_uploaded/${selectedPhoto}`
            }
            alt="Preview"
            referrerPolicy="no-referrer"
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              objectFit: "cover",
              border: `3px solid ${theme.accent}`,
              padding: "4px",
              backgroundColor: theme.card,
            }}
          />
        </div>

        <div style={{ textAlign: "left", marginBottom: "20px" }}>
          <label
            style={{
              fontSize: "0.7rem",
              fontWeight: 800,
              color: theme.accent,
              letterSpacing: "1px",
              display: "block",
              marginBottom: "8px",
            }}
          >
            TU NICKNAME
          </label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              border: `1px solid ${theme.border}`,
              backgroundColor: darkMode
                ? "rgba(255,255,255,0.03)"
                : "rgba(0,0,0,0.03)",
              color: theme.textMain,
              fontSize: "1rem",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <label
          style={{
            fontSize: "0.7rem",
            fontWeight: 800,
            color: theme.accent,
            letterSpacing: "1px",
            display: "block",
            marginBottom: "12px",
            textAlign: "left",
          }}
        >
          PUEDES ELEGIR UN AVATAR COMO IMAGEN
        </label>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "10px",
            marginBottom: "25px",
            padding: "12px",
            backgroundColor: darkMode ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.05)",
            borderRadius: "15px",
          }}
        >
          {localAvatars.map((file, i) => {
            const url = `http://127.0.0.1:5001/static/avatars/${file}`;
            return (
              <img
                key={i}
                src={url}
                alt="avatar"
                onClick={() => setSelectedPhoto(url)}
                style={{
                  width: "100%",
                  aspectRatio: "1/1",
                  borderRadius: "10px",
                  cursor: "pointer",
                  border:
                    selectedPhoto === url
                      ? `3px solid ${theme.accent}`
                      : "2px solid transparent",
                  transform: selectedPhoto === url ? "scale(1.1)" : "scale(1)",
                  transition: "all 0.2s ease",
                  backgroundColor: theme.card,
                  objectFit: "cover",
                }}
              />
            );
          })}
        </div>

        <div style={{ textAlign: "left", marginBottom: "25px" }}>
          <label
            style={{
              fontSize: "0.7rem",
              fontWeight: 800,
              color: theme.textMuted,
              display: "block",
              marginBottom: "5px",
            }}
          >
            O SUBE TU PROPIA FOTO
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{
              fontSize: "0.8rem",
              color: theme.textMuted,
              width: "100%",
            }}
          />
        </div>

        <button
          onClick={() => onSave(nickname, selectedPhoto)}
          style={{
            backgroundColor: theme.accent,
            color: darkMode ? "#000" : "#fff",
            border: "none",
            padding: "16px",
            borderRadius: "14px",
            cursor: "pointer",
            fontWeight: 800,
            width: "100%",
            fontSize: "1rem",
            boxShadow: `0 4px 15px ${theme.accent}44`,
          }}
        >
          Guardar y Entrar
        </button>
      </div>
    </div>
  );
};

// --- COMPONENTE DE BOTÓN GOOGLE ---
const AuthButton = ({ onSuccess, darkMode }) => {
  return (
    <div style={{ overflow: "hidden", borderRadius: "50px" }}>
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          const decodedUser = jwtDecode(credentialResponse.credential);
          const userData = {
            email: decodedUser.email,
            name: decodedUser.name,
            picture: decodedUser.picture,
            sub: decodedUser.sub,
          };
          onSuccess(userData);
        }}
        onError={() => console.error("El inicio de sesión falló")}
        useOneTap
        theme={darkMode ? "filled_black" : "outline"}
        shape="pill"
        text="continue_with"
      />
    </div>
  );
};

const ForceScrollToTop = () => {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  const location = useLocation();
  const isReaderRoute = location.pathname.startsWith("/reader");

  const [darkMode, setDarkMode] = useState(true);
  const [books, setBooks] = useState([]);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [recentlyUpdated, setRecentlyUpdated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("userSession");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const theme = {
    bg: darkMode ? "#0a0b10" : "#f4f0ea",
    card: darkMode ? "rgba(255, 255, 255, 0.02)" : "rgba(255, 255, 255, 0.5)",
    accent: darkMode ? "#d4af37" : "#b85b3f",
    textMain: darkMode ? "#e3e1db" : "#2b2824",
    textMuted: darkMode ? "#8a8782" : "#857f77",
    border: darkMode ? "rgba(212, 175, 55, 0.15)" : "rgba(184, 91, 63, 0.15)",
    navBg: darkMode ? "rgba(10, 11, 16, 0.7)" : "rgba(244, 240, 234, 0.7)",
    shadow: darkMode
      ? "0 15px 35px rgba(0,0,0,0.5)"
      : "0 15px 35px rgba(133,127,119,0.15)",
  };

  useEffect(() => {
    document.body.style.backgroundColor = theme.bg;
  }, [theme.bg]);

  const refreshBooks = useCallback(() => {
    setLoading(true);
    const fetchAllBooks = fetch("http://127.0.0.1:5001/api/books")
      .then((res) => res.json())
      .catch(() => []);
    const fetchRecent = fetch(
      "http://127.0.0.1:5001/api/books/recently-updated",
    )
      .then((res) => res.json())
      .catch(() => []);
    const fetchFeatured = fetch(
      "http://127.0.0.1:5001/api/books/featured-random",
    )
      .then((res) => res.json())
      .catch(() => []);

    Promise.all([fetchAllBooks, fetchFeatured, fetchRecent]).then(
      ([all, feat, recent]) => {
        setBooks(all);
        setFeaturedBooks(feat);
        setRecentlyUpdated(recent);
        setLoading(false);
      },
    );
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
      await fetch("http://127.0.0.1:5001/api/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          nickname: newNick,
          picture: newPhoto,
        }),
      });
      setUser(updatedUser);
      localStorage.setItem("userSession", JSON.stringify(updatedUser));
      setShowOnboarding(false);
    } catch (error) {
      setShowOnboarding(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("userSession");
  };

  const defaultCoverStyle = {
    width: "100%",
    aspectRatio: "2/3",
    borderRadius: "8px",
    backgroundColor: darkMode ? "#252a33" : "#efeae4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: darkMode ? "#4a5568" : "#b2a89f",
    fontSize: "0.9rem",
  };

  return (
    <GoogleOAuthProvider clientId="750793668642-7apu45i7te8b8gibnrelnhjgqj7vg512.apps.googleusercontent.com">
      <ForceScrollToTop />

      {showOnboarding && user && (
        <OnboardingModal
          user={user}
          onSave={handleSaveProfile}
          darkMode={darkMode}
          theme={theme}
        />
      )}

      <div
        style={{
          backgroundColor: theme.bg,
          color: theme.textMain,
          minHeight: "100vh",
          width: "100%",
          transition: "all 0.4s ease",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {!isReaderRoute && (
          <div
            style={{
              position: "sticky",
              top: "20px",
              zIndex: 1000,
              padding: "0 20px",
            }}
          >
            <nav
              style={{
                maxWidth: "1000px",
                margin: "0 auto",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                backgroundColor: theme.navBg,
                border: `1px solid ${theme.border}`,
                padding: "12px 25px",
                borderRadius: "50px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: theme.shadow,
              }}
            >
              <div
                style={{ display: "flex", gap: "30px", alignItems: "center" }}
              >
                <Link
                  to="/"
                  style={{
                    color: theme.textMain,
                    textDecoration: "none",
                    fontWeight: 800,
                    fontSize: "1.2rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontFamily: "'Crimson Pro', serif",
                  }}
                >
                  <span style={{ color: theme.accent }}>✦</span> Libreria
                  Amateur
                </Link>
                <div style={{ display: "flex", gap: "20px" }}>
                  <Link
                    to="/rankings"
                    style={{
                      color: theme.textMain,
                      textDecoration: "none",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      opacity: 0.7,
                    }}
                  >
                    Rankings
                  </Link>
                  <Link
                    to="/search"
                    style={{
                      color: theme.textMain,
                      textDecoration: "none",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      opacity: 0.7,
                    }}
                  >
                    Explorar
                  </Link>
                  {user && (
                    <>
                      <Link
                        to="/library"
                        style={{
                          color: theme.textMain,
                          textDecoration: "none",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          opacity: 0.7,
                        }}
                      >
                        Mi Biblioteca
                      </Link>
                      <Link
                        to="/dashboard"
                        style={{
                          color: theme.textMain,
                          textDecoration: "none",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          opacity: 0.7,
                        }}
                      >
                        Mi Studio
                      </Link>
                    </>
                  )}
                </div>
              </div>
              <div
                style={{ display: "flex", gap: "15px", alignItems: "center" }}
              >
                {!user ? (
                  <AuthButton
                    onSuccess={handleLoginSuccess}
                    darkMode={darkMode}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      borderRight: `1px solid ${theme.border}`,
                      paddingRight: "15px",
                    }}
                  >
                    <img
                      src={
                        user.picture?.startsWith("http") ||
                        user.picture?.startsWith("data:image")
                          ? user.picture
                          : `http://127.0.0.1:5001/static/avatars_uploaded/${user.picture}`
                      }
                      alt="profile"
                      referrerPolicy="no-referrer"
                      onClick={() => setShowOnboarding(true)} //evento para de hacer clikc en imagen perfil y que aparezca el modal de inicio de sesioón.
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        cursor: "pointer",
                        transition: "transform 0.2s ease",
                        display: "block",
                        border: `2px solid ${theme.primary}50`,
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.transform = "scale(1.1)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                      /* ---------------------- */
                    />
                    <button
                      onClick={handleLogout}
                      style={{
                        background: "none",
                        border: "none",
                        color: theme.textMuted,
                        cursor: "pointer",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                      }}
                    >
                      Salir
                    </button>
                  </div>
                )}
                <button
                  className="mode-toggle"
                  onClick={() => setDarkMode(!darkMode)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "1.2rem",
                    cursor: "pointer",
                  }}
                >
                  {darkMode ? "☀️" : "🌙"}
                </button>
              </div>
            </nav>
          </div>
        )}

        <div
          style={{
            maxWidth: isReaderRoute ? "100%" : "1100px",
            margin: "0 auto",
            padding: isReaderRoute ? "0" : "0 20px",
          }}
        >
          <Routes>
            <Route
              path="/"
              element={
                <main style={{ paddingTop: "80px" }}>
                  <header
                    style={{
                      marginBottom: "100px",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <p
                      style={{
                        color: theme.accent,
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        letterSpacing: "0.4em",
                        textTransform: "uppercase",
                        marginBottom: "24px",
                      }}
                    >
                      Comunidad Literaria
                    </p>
                    <h1
                      style={{
                        fontSize: "clamp(2.2rem, 6vw, 4.2rem)",
                        fontWeight: 300,
                        color: theme.textMain,
                      }}
                    >
                      El lugar donde{" "}
                      <span
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontStyle: "italic",
                          color: theme.accent,
                          fontWeight: 800,
                        }}
                      >
                        todo Autor
                      </span>{" "}
                      tiene visibilidad.
                    </h1>
                  </header>

                  <section style={{ marginBottom: "60px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "20px",
                      }}
                    >
                      <h2
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: 800,
                          textTransform: "uppercase",
                        }}
                      >
                        Destacados
                      </h2>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(180px, 1fr))",
                        gap: "20px",
                      }}
                    >
                      {featuredBooks.map((book) => (
                        <Link
                          key={`feat-${book.id}`}
                          to={`/book/${book.id}`}
                          style={{ textDecoration: "none", color: "inherit" }}
                        >
                          <div
                            className="book-card-featured"
                            style={{
                              backgroundColor: theme.card,
                              padding: "15px",
                              borderRadius: "12px",
                              border: `1px solid ${theme.border}`,
                            }}
                          >
                            {book.author_note && book.author_note !== "null" ? (
                              <img
                                src={`http://127.0.0.1:5001/static/covers/${book.author_note}`}
                                alt={book.title}
                                style={{
                                  width: "100%",
                                  aspectRatio: "2/3",
                                  borderRadius: "8px",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <div style={defaultCoverStyle}>SIN IMAGEN</div>
                            )}
                            <h3
                              style={{
                                margin: "15px 0 0 0",
                                fontSize: "0.9rem",
                                fontWeight: 700,
                                textAlign: "center",
                              }}
                            >
                              {book.title}
                            </h3>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>

                  {/* --- SECCIÓN: RECIÉN ACTUALIZADOS --- */}
                  <section style={{ marginBottom: "60px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "20px",
                      }}
                    >
                      <h2
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: 800,
                          textTransform: "uppercase",
                        }}
                      >
                        Actualizados Recientemente
                      </h2>
                      <div
                        style={{
                          flex: 1,
                          height: "1px",
                          backgroundColor: theme.border,
                        }}
                      ></div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: "20px",
                      }}
                    >
                      {recentlyUpdated.map((book) => (
                        <Link
                          key={`recent-${book.id}`}
                          to={`/book/${book.id}`}
                          style={{ textDecoration: "none", color: "inherit" }}
                        >
                          <div
                            className="recent-item"
                            style={{
                              display: "flex",
                              gap: "15px",
                              padding: "15px",
                              borderRadius: "16px",
                              alignItems: "center",
                              backgroundColor: theme.card,
                              border: `1px solid ${theme.border}`,
                            }}
                          >
                            {/* Miniatura de la Portada */}
                            <div
                              style={{
                                width: "60px",
                                height: "80px",
                                flexShrink: 0,
                              }}
                            >
                              {book.author_note &&
                              book.author_note !== "null" ? (
                                <img
                                  src={`http://127.0.0.1:5001/static/covers/${book.author_note}`}
                                  alt={book.title}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    borderRadius: "6px",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    ...defaultCoverStyle,
                                    fontSize: "0.5rem",
                                  }}
                                >
                                  SIN FOTO
                                </div>
                              )}
                            </div>

                            {/* Info del Libro */}
                            <div style={{ overflow: "hidden" }}>
                              <h3
                                style={{
                                  fontSize: "0.95rem",
                                  fontWeight: 700,
                                  margin: "0 0 4px 0",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {book.title}
                              </h3>
                              <p
                                style={{
                                  fontSize: "0.8rem",
                                  color: theme.textMuted,
                                  margin: 0,
                                }}
                              >
                                Por {book.author || "Autor Anónimo"}
                              </p>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  marginTop: "8px",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "0.7rem",
                                    color: theme.accent,
                                    backgroundColor: `${theme.accent}15`,
                                    padding: "2px 8px",
                                    borderRadius: "4px",
                                    fontWeight: 700,
                                  }}
                                >
                                  {book.category || "General"}
                                </span>
                                <span
                                  style={{
                                    fontSize: "0.7rem",
                                    color: theme.textMuted,
                                  }}
                                >
                                  ⭐{" "}
                                  {book.avg_rating
                                    ? book.avg_rating.toFixed(1)
                                    : "0.0"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                </main>
              }
            />
            <Route
              path="/rankings"
              element={<Rankings darkMode={darkMode} />}
            />
            <Route
              path="/library"
              element={<MyLibrary user={user} darkMode={darkMode} />}
            />
            <Route
              path="/book/:id"
              element={<BookDetail user={user} darkMode={darkMode} />}
            />
            <Route
              path="/reader/:id/:chapterIndex"
              element={
                <BookReader
                  user={user}
                  darkMode={darkMode}
                  setDarkMode={setDarkMode}
                />
              }
            />
            <Route
              path="/publish"
              element={
                <PublishBook
                  user={user}
                  darkMode={darkMode}
                  refreshBooks={refreshBooks}
                />
              }
            />
            <Route
              path="/dashboard"
              element={<AuthorDashboard user={user} darkMode={darkMode} />}
            />
            <Route
              path="/add-chapter/:id"
              element={<AddChapter user={user} darkMode={darkMode} />}
            />
            <Route
              path="/dashboard/book/:id"
              element={<AuthorBookDetails user={user} darkMode={darkMode} />}
            />
            <Route
              path="/edit-chapter/:chapterId"
              element={<EditChapter darkMode={darkMode} />}
            />
            <Route
              path="/search"
              element={<AdvancedSearch darkMode={darkMode} />}
            />
          </Routes>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;700&family=Inter:wght@300;400;600&family=Cormorant+Garamond:ital,wght@1,600&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { -webkit-font-smoothing: antialiased; }
        .book-card, .book-card-featured, .recent-item {
          transition: all 0.3s ease;
          background-color: ${theme.card};
          border: 1px solid ${theme.border};
        }
        .book-card:hover, .book-card-featured:hover { 
          border-color: ${theme.accent} !important; 
          transform: translateY(-5px);
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: ${theme.border}; border-radius: 10px; }
      `}</style>
    </GoogleOAuthProvider>
  );
}

export default App;
