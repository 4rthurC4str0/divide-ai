let todasMesas = [];
let idMesaEmEdicao = null;

function navigate(pagina) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    document.querySelector(`[pagina='${pagina}']`).classList.add('active');

    document.querySelectorAll('.admin-content > section').forEach(s => s.classList.add('hidden'));

    document.querySelector(`.section-${pagina}`).classList.remove('hidden');
}

// function abrirModalMesa(id) {

// }

function abrirModalMesa(id) {
    // se existir uma mesa então vou edita-la assim armazeno o id para não perder nas outras funções
    idMesaEmEdicao = id ? id : null

    // aqui só abre o modal da mesa, se tiver id edita os conteudos, caso seja novo deixa padrão.

    const mesa = idMesaEmEdicao ? todasMesas.find(t => t.id === id) : null; 
    document.getElementById('titulo-modal-mesa').innerText = mesa ? 'Editar Mesa' : 'Nova Mesa';
    document.getElementById('numero-mesa').value = mesa ? mesa.numero : '';
    document.getElementById('capacidade-mesa').value = mesa ? mesa.capacidade : '';
    document.getElementById('status-mesa').value = mesa ? mesa.status : 'disponivel';
    abrirModal('modal-mesa')
}

function cadastrarMesa() {
    const numeroMesa = parseInt(document.getElementById('numero-mesa').value);
    const capacidadeMesa = parseInt(document.getElementById('capacidade-mesa').value)
    const statusMesa = document.getElementById('status-mesa').value;

    if (!numeroMesa || !capacidadeMesa) {return}

    if (idMesaEmEdicao ) {
        console.log(idMesaEmEdicao)
        let mesa = todasMesas.find(m => m.id === idMesaEmEdicao)

        mesa.numero = numeroMesa;
        mesa.capacidade = capacidadeMesa;
        mesa.status = statusMesa;
    } else {

        let novaMesa = {
            id: Math.floor(Math.random() * (10 - 2 + 1)) + 2,
            numero: numeroMesa,
            capacidade: capacidadeMesa,
            status: statusMesa,
        }
        todasMesas.push(novaMesa)
    }

    idMesaEmEdicao = null;
    fecharModal('modal-mesa')
    renderizarCardMesas()
}

function deletarMesa(id) {
    const indexMesa = id ? todasMesas.findIndex(mesa => mesa.id === id): null
    console.log(indexMesa)

    todasMesas = todasMesas.filter((mesa, index) => index !== indexMesa)

    console.log(todasMesas)
    renderizarCardMesas();
}

function renderizarCardMesas() {
    const grid = document.getElementById('grid-mesas')
    grid.innerHTML = todasMesas.map(m => {
        return `
            <div class="card-mesa ${m.status}">
                <div class="mesa-number">${m.numero}</div>
                <div class="mesa-capacidade">${m.capacidade} lugares</div>
                <div class="span-status status-${m.status}">${m.status}</div>
                <div>
                    <button class="btn btn-secondary btn-xs" onclick="abrirModalMesa(${m.id})">✏️</button>
                    <button class="btn btn-delete btn-xs" onclick="deletarMesa(${m.id})">🗑</button>
                </div>
            </div>
        `
    }).join('');
}