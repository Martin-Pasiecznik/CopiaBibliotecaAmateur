from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)

# Configuración de la base de datos
DB_PATH = os.path.join(os.path.dirname(__file__), "database.db")

def init_db_internal():
    """Inicializa la base de datos y crea las tablas necesarias al arrancar"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 1. TABLA DE LIBROS
    cursor.execute('''CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        author_email TEXT,
        description TEXT,
        views INTEGER DEFAULT 0,
        author_note TEXT)''')

    # 2. TABLA DE CAPÍTULOS
    cursor.execute('''CREATE TABLE IF NOT EXISTS chapters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        word_count INTEGER DEFAULT 0,
        order_index INTEGER,
        FOREIGN KEY (book_id) REFERENCES books (id))''')

    # 3. TABLA DE BIBLIOTECA (Para las estadísticas del gráfico)
    cursor.execute('''CREATE TABLE IF NOT EXISTS library (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email TEXT NOT NULL,
        book_id INTEGER NOT NULL,
        status TEXT DEFAULT 'reading', -- 'reading', 'pending', 'completed', 'dropped'
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (book_id) REFERENCES books (id))''')
    
    conn.commit()
    conn.close()
    print(">>> Base de datos verificada: Libros, Capítulos y Biblioteca listos.")

def get_db_connection():
    """Crea una conexión lista para devolver diccionarios"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# --- RUTAS DE LA API ---

@app.route('/api/books', methods=['GET'])
def get_books():
    """Obtiene todos los libros para la Home"""
    try:
        conn = get_db_connection()
        books = conn.execute('SELECT * FROM books').fetchall()
        conn.close()
        return jsonify([dict(b) for b in books])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/books/<int:book_id>', methods=['GET'])
def get_book_detail(book_id):
    try:
        conn = get_db_connection()
        book = conn.execute('SELECT * FROM books WHERE id = ?', (book_id,)).fetchone()
        conn.close()
        
        if book:
            return jsonify(dict(book))
        else:
            return jsonify({"error": "Libro no encontrado"}), 404
            
    except Exception as e:
        print(f"Error en book_detail: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/books', methods=['POST'])
def create_book():
    """Crea un nuevo libro"""
    try:
        data = request.get_json()
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO books (title, author, author_email, description, author_note) VALUES (?, ?, ?, ?, ?)',
            (data.get('title'), data.get('author'), data.get('author_email'), data.get('description'), "Welcome!")
        )
        conn.commit()
        conn.close()
        return jsonify({"message": "Success"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/my-books', methods=['GET'])
def get_my_books():
    """Libros del autor logueado para el Dashboard"""
    email = request.args.get('email')
    if not email: return jsonify({"error": "Email is required"}), 400
    try:
        conn = get_db_connection()
        books = conn.execute('SELECT * FROM books WHERE author_email = ?', (email,)).fetchall()
        conn.close()
        return jsonify([dict(b) for b in books])
    except Exception as e:
        return jsonify([]), 500

@app.route('/api/books/<int:book_id>/chapters', methods=['GET'])
def get_chapters(book_id):
    try:
        conn = get_db_connection()
        chapters = conn.execute('SELECT * FROM chapters WHERE book_id = ? ORDER BY order_index ASC', (book_id,)).fetchall()
        conn.close()
        return jsonify([dict(c) for c in chapters])
    except Exception as e:
        return jsonify([]), 500

@app.route('/api/books/<int:book_id>/library-stats', methods=['GET'])
def get_library_stats(book_id):
    try:
        conn = get_db_connection()
        # Contamos cuántos usuarios hay por cada estado para ese libro
        query = 'SELECT status, COUNT(*) as count FROM library WHERE book_id = ? GROUP BY status'
        stats = conn.execute(query, (book_id,)).fetchall()
        conn.close()
        
        # Inicializamos con ceros
        result = {"reading": 0, "pending": 0, "completed": 0, "dropped": 0}
        
        # Llenamos con los datos reales de la base de datos
        for row in stats:
            status_name = row['status'].lower()
            if status_name in result:
                result[status_name] = row['count']
                
        return jsonify(result), 200 # Aseguramos el status 200
    except Exception as e:
        print(f"Error en library-stats: {e}")
        return jsonify({"error": str(e)}), 500

    #barra de estado del lector, leyendo, pendiente, abandonado, etc
@app.route('/api/library/update', methods=['POST'])
def update_library():
    try:
        data = request.get_json()
        email = data.get('email')
        book_id = data.get('book_id')
        status = data.get('status')

        if not email or not book_id:
            return jsonify({"error": "Faltan datos"}), 400

        conn = get_db_connection()
        
        if status == 'remove':
            conn.execute('DELETE FROM library WHERE user_email = ? AND book_id = ?', (email, book_id))
        else:
            # UPSERT: Si ya existe el registro de este usuario para este libro, lo actualiza. 
            # Si no, lo crea.
            existing = conn.execute('SELECT id FROM library WHERE user_email = ? AND book_id = ?', 
                                   (email, book_id)).fetchone()
            if existing:
                conn.execute('UPDATE library SET status = ? WHERE user_email = ? AND book_id = ?', 
                            (status, email, book_id))
            else:
                conn.execute('INSERT INTO library (user_email, book_id, status) VALUES (?, ?, ?)', 
                            (email, book_id, status))
        
        conn.commit()
        conn.close()
        return jsonify({"message": "Biblioteca actualizada correctamente"}), 200
    except Exception as e:
        print(f"Error en update_library: {e}")
        return jsonify({"error": str(e)}), 500    

# --- EJECUCIÓN ---

if __name__ == '__main__':
    init_db_internal() # Crea las tablas al empezar
    app.run(debug=True, host='0.0.0.0', port=5001)