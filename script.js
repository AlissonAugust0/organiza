const API = '/api/tarefas';

const form = document.getElementById('formTarefa');
const campoTitulo = document.getElementById('titulo');
const lista = document.getElementById('listaTarefas');
const total = document.getElementById('totalTarefas');
const mensagem = document.getElementById('mensagem');
const filtro = document.getElementById('filtro');

let tarefas = [];

async function carregarTarefas() {

    try {

        const resposta = await fetch(API);

        if (!resposta.ok) {
            throw new Error('Erro ao carregar tarefas');
        }

        tarefas = await resposta.json();

        renderizarTarefas();

    } catch (erro) {

        mensagem.textContent = 'Erro ao conectar com o servidor.';

        console.error(erro);

    }
}

function renderizarTarefas() {

    lista.innerHTML = '';

    total.textContent = tarefas.length;

    const modo = filtro.value;

    const exibidas = tarefas.filter(tarefa => {

        if (modo === 'pendentes') {
            return !tarefa.concluida;
        }

        if (modo === 'concluidas') {
            return tarefa.concluida;
        }

        return true;

    });

    const concluidas = tarefas.filter(t => t.concluida).length;

    mensagem.textContent =
        `${concluidas} concluída(s) de ${tarefas.length}`;

    if (exibidas.length === 0) {

        lista.innerHTML =
            '<li class="vazio">Nenhuma tarefa encontrada.</li>';

        return;
    }

    exibidas.forEach(tarefa => {

        const item = document.createElement('li');

        item.className = `tarefa ${
            tarefa.concluida ? 'concluida' : ''
        }`;

        const checkbox = document.createElement('input');

        checkbox.type = 'checkbox';
        checkbox.checked = tarefa.concluida;

        checkbox.addEventListener('change', () => {
            atualizarTarefa(tarefa.id, checkbox.checked);
        });

        const nome = document.createElement('span');

        nome.className = 'tarefa-nome';
        nome.textContent = tarefa.titulo;

        const excluir = document.createElement('button');

        excluir.className = 'excluir';
        excluir.textContent = 'Excluir';

        excluir.addEventListener('click', () => {
            excluirTarefa(tarefa.id);
        });

        item.append(checkbox, nome, excluir);

        lista.appendChild(item);

    });
}

form.addEventListener('submit', async (evento) => {

    evento.preventDefault();

    const titulo = campoTitulo.value.trim();

    if (!titulo) return;

    try {

        const resposta = await fetch(API, {

            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({ titulo })

        });

        if (!resposta.ok) {
            throw new Error('Erro ao adicionar tarefa');
        }

        campoTitulo.value = '';

        await carregarTarefas();

    } catch (erro) {

        alert('Não foi possível adicionar a tarefa.');

        console.error(erro);

    }

});

async function atualizarTarefa(id, concluida) {

    try {

        const resposta = await fetch(`${API}/${id}`, {

            method: 'PATCH',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({ concluida })

        });

        if (!resposta.ok) {
            throw new Error('Erro ao atualizar tarefa');
        }

        await carregarTarefas();

    } catch (erro) {

        alert('Erro ao atualizar tarefa.');

        console.error(erro);

    }

}

async function excluirTarefa(id) {

    const confirmar = confirm(
        'Deseja realmente excluir esta tarefa?'
    );

    if (!confirmar) return;

    try {

        const resposta = await fetch(`${API}/${id}`, {
            method: 'DELETE'
        });

        if (!resposta.ok) {
            throw new Error('Erro ao excluir tarefa');
        }

        await carregarTarefas();

    } catch (erro) {

        alert('Não foi possível excluir a tarefa.');

        console.error(erro);

    }

}

filtro.addEventListener('change', renderizarTarefas);

carregarTarefas();