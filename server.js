const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();

const PORT = 3000;

const db = new Database('tarefas.db');

// Criar tabela
db.exec(`
    CREATE TABLE IF NOT EXISTS tarefas (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        titulo TEXT NOT NULL,

        concluida INTEGER DEFAULT 0,

        criada_em TEXT DEFAULT CURRENT_TIMESTAMP

    )
`);

app.use(express.json());

app.use(express.static(path.join(__dirname)));

// Listar tarefas
app.get('/api/tarefas', (req, res) => {

    const tarefas = db.prepare(`
        SELECT id, titulo, concluida
        FROM tarefas
        ORDER BY id DESC
    `).all();

    res.json(tarefas.map(t => ({
        ...t,
        concluida: Boolean(t.concluida)
    })));

});

// Adicionar tarefa
app.post('/api/tarefas', (req, res) => {

    const titulo = typeof req.body.titulo === 'string'
        ? req.body.titulo.trim()
        : '';

    if (!titulo) {
        return res.status(400).json({
            erro: 'Título obrigatório'
        });
    }

    if (titulo.length > 100) {
        return res.status(400).json({
            erro: 'Máximo de 100 caracteres'
        });
    }

    const resultado = db.prepare(`
        INSERT INTO tarefas (titulo)
        VALUES (?)
    `).run(titulo);

    res.status(201).json({
        id: resultado.lastInsertRowid,
        titulo,
        concluida: false
    });

});

// Atualizar tarefa
app.patch('/api/tarefas/:id', (req, res) => {

    const id = Number(req.params.id);

    const tarefa = db.prepare(`
        SELECT id FROM tarefas WHERE id = ?
    `).get(id);

    if (!tarefa) {
        return res.status(404).json({
            erro: 'Tarefa não encontrada'
        });
    }

    const concluida = req.body.concluida ? 1 : 0;

    db.prepare(`
        UPDATE tarefas
        SET concluida = ?
        WHERE id = ?
    `).run(concluida, id);

    res.json({
        sucesso: true
    });

});

// Excluir tarefa
app.delete('/api/tarefas/:id', (req, res) => {

    const resultado = db.prepare(`
        DELETE FROM tarefas WHERE id = ?
    `).run(Number(req.params.id));

    if (resultado.changes === 0) {
        return res.status(404).json({
            erro: 'Tarefa não encontrada'
        });
    }

    res.status(204).end();

});

// Iniciar servidor
app.listen(PORT, () => {

    console.log(
        `Servidor rodando em http://localhost:${PORT}`
    );

});