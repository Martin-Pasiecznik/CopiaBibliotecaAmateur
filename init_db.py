import sqlite3

def init_db():
    # Creamos el archivo de la base de datos
    connection = sqlite3.connect('database.db')
    cursor = connection.cursor()

    # Tabla de Libros
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        author_email TEXT,  -- <--- NUEVO: Para saber de quién es el libro
        description TEXT,
        author_note TEXT
         )
    ''')

    # Tabla de Capítulos
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chapters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            book_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            order_index INTEGER,
            FOREIGN KEY (book_id) REFERENCES books (id)
        )
    ''')

    # Insertamos datos de prueba
    cursor.execute('INSERT INTO books (title, author, description, author_note) VALUES (?, ?, ?, ?)',
                   ('The Silent Weaver', 'Carlos Ruiz', 'A story about magic silk.', 'Welcome to my first book!'))
    
    cursor.execute('INSERT INTO chapters (book_id, title, content, order_index) VALUES (?, ?, ?, ?)',
                   (1, 'Chapter 1: The First Thread', 'The weaver touched the glowing silk...', 1))

    connection.commit()
    connection.close()
    print("Database initialized successfully!")

if __name__ == '__main__':
    init_db()