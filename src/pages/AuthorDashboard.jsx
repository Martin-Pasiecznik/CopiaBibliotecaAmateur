import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AuthorDashboard = ({ user, darkMode }) => {
  const [myBooks, setMyBooks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Si no está logueado, lo mandamos a la Home
    if (!user) {
      navigate('/');
      return;
    }

    // Pedimos a Python solo los libros de este email
    fetch(`http://127.0.0.1:5001/api/my-books?email=${user.email}`)
      .then(res => res.json())
      .then(data => setMyBooks(data))
      .catch(err => console.error("Error:", err));
  }, [user]);

  if (!user) return null;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Bienvenido, {user.given_name}</h1>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/publish" style={btnStyle}>+ Crear Nuevo Libro</Link>
      </div>

      <h2>Tus Historias</h2>
      {myBooks.length === 0 ? (
        <p>Aún no has publicado nada.</p>
      ) : (
        myBooks.map(book => (
          <div key={book.id} style={cardStyle(darkMode)}>
            <span>{book.title}</span>
            <Link to={`/add-chapter/${book.id}`} style={btnMini}>Gestionar Capítulos</Link>
          </div>
        ))
      )}
    </div>
  );
};

const btnStyle = { background: '#3498db', color: 'white', padding: '10px', borderRadius: '5px', textDecoration: 'none' };
const btnMini = { background: '#2ecc71', color: 'white', padding: '5px 10px', borderRadius: '3px', textDecoration: 'none', fontSize: '0.8rem' };
const cardStyle = (dark) => ({
  display: 'flex', justifyContent: 'space-between', padding: '15px', 
  background: dark ? '#222' : '#eee', marginBottom: '10px', borderRadius: '8px'
});

export default AuthorDashboard;