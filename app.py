from flask import Flask, request, jsonify, render_template, redirect, url_for, session
from functools import wraps
import sqlite3
import os

app = Flask(__name__)
app.secret_key = os.environ.get('FLASK_SECRET_KEY', os.urandom(24).hex())

DB_PATH = os.path.join(os.path.dirname(__file__), 'membros.db')

# === AUTH ===
ADMIN_USER = os.environ.get('ADMIN_USERNAME', 'admin')
ADMIN_PASS = os.environ.get('ADMIN_PASSWORD', 'admin123')

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('logged_in'):
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated

def api_login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('logged_in'):
            return jsonify({'error': 'Nao autorizado'}), 401
        return f(*args, **kwargs)
    return decorated

# === DATABASE ===
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn

def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS membros (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT,
            sexo TEXT,
            nascimento_data TEXT,
            nascimento_cidade TEXT,
            nascimento_estado TEXT,
            pai TEXT,
            pai_religiao TEXT,
            mae TEXT,
            mae_religiao TEXT,
            batismo_data TEXT,
            batismo_local TEXT,
            batismo_oficiante TEXT,
            admissao_data TEXT,
            admissao_modo TEXT,
            admissao_deonde TEXT,
            admissao_oficiante TEXT,
            livro_numero TEXT,
            ato_numero TEXT,
            endereco TEXT,
            igreja TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

init_db()

# === ROTAS DE AUTENTICACAO ===
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form
        user = data.get('username', '')
        pwd = data.get('password', '')
        if user == ADMIN_USER and pwd == ADMIN_PASS:
            session['logged_in'] = True
            if request.is_json:
                return jsonify({'ok': True})
            return redirect(url_for('index'))
        if request.is_json:
            return jsonify({'error': 'Usuario ou senha invalidos'}), 401
        return render_template('login.html', erro='Usuário ou senha inválidos')
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    return redirect(url_for('login'))

# === ROTAS PROTEGIDAS ===
@app.route('/')
@login_required
def index():
    return render_template('index.html')

@app.route('/api/membros', methods=['GET'])
@api_login_required
def listar_membros():
    conn = get_db()
    filters = []
    params = []

    for campo in ['nome', 'sexo', 'nascimento_cidade', 'nascimento_estado',
                  'pai', 'mae', 'batismo_local', 'batismo_oficiante',
                  'admissao_modo', 'admissao_deonde', 'admissao_oficiante',
                  'livro_numero', 'ato_numero', 'endereco', 'igreja',
                  'pai_religiao', 'mae_religiao']:
        valor = request.args.get(campo)
        if valor:
            filters.append(f"{campo} LIKE ?")
            params.append(f"%{valor}%")

    where = ""
    if filters:
        where = "WHERE " + " AND ".join(filters)

    query = f"SELECT * FROM membros {where} ORDER BY nome ASC"

    total = conn.execute(f"SELECT COUNT(*) FROM membros {where}", params).fetchone()[0]
    rows = conn.execute(query, params).fetchall()
    conn.close()

    return jsonify({
        'total': total,
        'data': [dict(r) for r in rows]
    })

@app.route('/api/membros', methods=['POST'])
@api_login_required
def criar_membro():
    data = request.get_json()
    conn = get_db()
    cursor = conn.execute("""
        INSERT INTO membros (
            nome, sexo,
            nascimento_data, nascimento_cidade, nascimento_estado,
            pai, pai_religiao, mae, mae_religiao,
            batismo_data, batismo_local, batismo_oficiante,
            admissao_data, admissao_modo, admissao_deonde, admissao_oficiante,
            livro_numero, ato_numero, endereco, igreja
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data.get('nome'), data.get('sexo'),
        data.get('nascimento_data'), data.get('nascimento_cidade'), data.get('nascimento_estado'),
        data.get('pai'), data.get('pai_religiao'), data.get('mae'), data.get('mae_religiao'),
        data.get('batismo_data'), data.get('batismo_local'), data.get('batismo_oficiante'),
        data.get('admissao_data'), data.get('admissao_modo'), data.get('admissao_deonde'), data.get('admissao_oficiante'),
        data.get('livro_numero'), data.get('ato_numero'), data.get('endereco'), data.get('igreja')
    ))
    conn.commit()
    conn.close()
    return jsonify({'id': cursor.lastrowid}), 201

@app.route('/api/membros/<int:id>', methods=['PUT'])
@api_login_required
def atualizar_membro(id):
    data = request.get_json()
    conn = get_db()
    conn.execute("""
        UPDATE membros SET
            nome=?, sexo=?,
            nascimento_data=?, nascimento_cidade=?, nascimento_estado=?,
            pai=?, pai_religiao=?, mae=?, mae_religiao=?,
            batismo_data=?, batismo_local=?, batismo_oficiante=?,
            admissao_data=?, admissao_modo=?, admissao_deonde=?, admissao_oficiante=?,
            livro_numero=?, ato_numero=?, endereco=?, igreja=?
        WHERE id=?
    """, (
        data.get('nome'), data.get('sexo'),
        data.get('nascimento_data'), data.get('nascimento_cidade'), data.get('nascimento_estado'),
        data.get('pai'), data.get('pai_religiao'), data.get('mae'), data.get('mae_religiao'),
        data.get('batismo_data'), data.get('batismo_local'), data.get('batismo_oficiante'),
        data.get('admissao_data'), data.get('admissao_modo'), data.get('admissao_deonde'), data.get('admissao_oficiante'),
        data.get('livro_numero'), data.get('ato_numero'), data.get('endereco'), data.get('igreja'),
        id
    ))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})

@app.route('/api/membros/<int:id>', methods=['DELETE'])
@api_login_required
def deletar_membro(id):
    conn = get_db()
    conn.execute("DELETE FROM membros WHERE id=?", (id,))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
