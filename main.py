from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)

# Asegurar que la ruta sea correcta
DB_PATH = os.path.join(os.path.dirname(__file__), "database.db")

def init_db_internal():
    """Crea las tablas si no existen al arrancar el server"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Aseguramos que la tabla tenga la columna author_email
    cursor.execute('''CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        author_email TEXT,
        description TEXT,
        author_note TEXT)''')
    cursor.execute('''CREATE TABLE IF NOT EXISTS chapters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        order_index INTEGER,
        FOREIGN KEY (book_id) REFERENCES books (id))''')
    conn.commit()
    conn.close()

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# --- RUTA PARA TODOS LOS LIBROS (HOME) ---
@app.route('/api/books', methods=['GET'])
def get_books():
    try:
        conn = get_db_connection()
        books = conn.execute('SELECT * FROM books').fetchall()
        conn.close()
        return jsonify([dict(b) for b in books])
    except Exception as e:
        print(f"ERROR EN GET: {e}")
        return jsonify([]), 500

# --- RUTA PARA CREAR LIBRO ---
@app.route('/api/books', methods=['POST'])
def create_book():
    try:
        data = request.get_json()
        title = data.get('title')
        author_name = data.get('author')
        description = data.get('description')
        author_email = data.get('author_email') 

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO books (title, author, author_email, description, author_note) VALUES (?, ?, ?, ?, ?)',
            (title, author_name, author_email, description, "Welcome!")
        )
        conn.commit()
        conn.close()
        return jsonify({"message": "Success"}), 201
    except Exception as e:
        print(f"Error en POST: {e}")
        return jsonify({"error": str(e)}), 500

# --- RUTA PARA MIS LIBROS (DASHBOARD) ---
@app.route('/api/my-books', methods=['GET'])
def get_my_books():
    email = request.args.get('email')
    if not email:
        return jsonify({"error": "Email is required"}), 400
    try:
        conn = get_db_connection()
        books = conn.execute('SELECT * FROM books WHERE author_email = ?', (email,)).fetchall()
        conn.close()
        return jsonify([dict(b) for b in books])
    except Exception as e:
        print(f"Error en my-books: {e}")
        return jsonify([]), 500

if __name__ == '__main__':
    init_db_internal() 
    # Mantenemos el puerto 5001 que es más seguro en Windows
    app.run(debug=True, host='0.0.0.0', port=5001)