# Cadastro de Membros - IPBC

Sistema web para cadastro e gerenciamento de membros da igreja.

## Funcionalidades

- **Inserir Membro** — formulário completo com dados pessoais, nascimento, filiação, batismo, admissão e registro
- **Pesquisar Membro** — filtros por qualquer campo (nome, sexo, cidade, igreja, livro, ato, etc.)
- **Editar** — clique em qualquer linha da tabela para editar
- **Excluir** — remova registros individualmente
- **Exportar CSV** — exporte todos os dados para Excel/planilha

## Estrutura do Projeto

```
Cadastro-Membros-IPBC/
├── app.py                  # Servidor Flask + API REST
├── requirements.txt        # Dependências Python
├── .gitignore
├── README.md
├── static/
│   ├── css/
│   │   └── style.css       # Estilos da interface
│   └── js/
│       └── main.js          # Lógica do frontend
└── templates/
    └── index.html           # Página principal
```

## Como Rodar Localmente

```bash
pip install -r requirements.txt
python app.py
```

Acesse `http://127.0.0.1:5000`

## API REST

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/membros` | Lista membros (com filtros opcionais) |
| POST | `/api/membros` | Cria novo membro |
| PUT | `/api/membros/:id` | Atualiza membro |
| DELETE | `/api/membros/:id` | Remove membro |

## Deploy no Render

1. Conecte o repositório GitHub ao Render
2. **Build Command:** `pip install -r requirements.txt`
3. **Start Command:** `gunicorn app:app`

O banco de dados SQLite é criado automaticamente na primeira execução.
