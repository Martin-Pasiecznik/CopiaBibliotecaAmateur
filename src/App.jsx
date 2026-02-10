import React, { useState, useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from "jwt-decode"

// Componentes y Páginas
import BookCard from './components/BookCard'
import BookReader from './pages/BookReader'
import PublishBook from './pages/PublishBook' 
import AuthorDashboard from './pages/AuthorDashboard'
import AddChapter from './pages/AddChapter' // Asegúrate de tener este archivo creado

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); // Estado para el usuario global

  // Cargar libros de la Home
  useEffect(() => {
    fetch('http://127.0.0.1:5001/api/books')
      .then(response => response.ok ? response.json() : [])
      .then(data => {
        setBooks(Array.isArray(data) ? data : []); 
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  }, []);

  // Manejar el éxito del Login
  const handleLoginSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    setUser(decoded); 
    console.log("Sesión iniciada:", decoded.email);
  };

  const globalWrapperStyle = {
    backgroundColor: darkMode ? '#121212' : '#f9f9f9',
    color: darkMode ? '#f0f0f0' : '#1a1a1a',
    minHeight: '100vh',
    width: '100%',
    transition: 'background-color 0.3s ease',
    margin: 0,
    padding: 0,
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
  };

  return (
    // REEMPLAZA ESTE CLIENT ID por el tuyo de Google Console cuando lo tengas
    <GoogleOAuthProvider clientId="750793668642-7apu45i7te8b8gibnrelnhjgqj7vg512.apps.googleusercontent.com">
      <div style={globalWrapperStyle}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
          
          <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <Link to="/" style={{ color: '#3498db', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.4rem' }}>
                HISPANO LIBRARY
              </Link>
              
              {/* Solo mostramos links de autor si está logueado */}
              {user && (
                <>
                  <Link to="/publish" style={{ color: darkMode ? '#fff' : '#333', textDecoration: 'none', fontSize: '0.9rem', border: '1px solid #3498db', padding: '5px 10px', borderRadius: '5px' }}>
                    + Publish Story
                  </Link>
                  <Link to="/dashboard" style={{ color: '#3498db', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    My Studio
                  </Link>
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              {/* Si no hay usuario, botón de Google. Si hay, su foto y el botón DarkMode */}
              {!user ? (
                <GoogleLogin 
                  onSuccess={handleLoginSuccess} 
                  onError={() => console.log('Login Failed')}
                />
              ) : (
                <img 
                  src={user.picture} 
                  alt="profile" 
                  style={{ width: '35px', borderRadius: '50%', border: '2px solid #3498db' }} 
                />
              )}

              <button 
                onClick={() => setDarkMode(!darkMode)}
                style={{ 
                  padding: '10px 20px', borderRadius: '25px', cursor: 'pointer', 
                  border: '1px solid #3498db', backgroundColor: darkMode ? '#333' : '#fff', 
                  color: darkMode ? '#fff' : '#333', fontWeight: 'bold'
                }}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </nav>

          <Routes>
            <Route path="/" element={
              <main>
                <h1 style={{ textAlign: 'center', margin: '30px 0' }}>Latest Stories</h1>
                {loading ? (
                  <p style={{ textAlign: 'center' }}>Searching for books...</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {books.map(book => (
                      <Link key={book.id} to={`/book/${book.id}`} style={{ textDecoration: 'none' }}>
                        <BookCard {...book} darkMode={darkMode} />
                      </Link>
                    ))}
                  </div>
                )}
              </main>
            } />
            
            <Route path="/book/:id" element={<BookReader darkMode={darkMode} />} />
            
            {/* Rutas protegidas (pasan el objeto 'user') */}
            <Route path="/publish" element={<PublishBook user={user} darkMode={darkMode} />} />
            <Route path="/dashboard" element={<AuthorDashboard user={user} darkMode={darkMode} />} />
            <Route path="/add-chapter/:id" element={<AddChapter user={user} darkMode={darkMode} />} />
          </Routes>
        </div>
      </div>
    </GoogleOAuthProvider>
  )
}

export default App