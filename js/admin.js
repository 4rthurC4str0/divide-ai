let carroPedidos = {};
let idMesaEmEdicao = null;
let idItemEmEdicao = null;
let addToOrderId = null;
let categoriaAtivaCardapio = 'todos'
let menuSearchQ = ''
let idMesaSelecionada = null;
let metodoPagamentoSelecionado = 'Cartão';
let idPedidoDetalhado = null;

function navigate(pagina) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    document.querySelector(`[pagina='${pagina}']`).classList.add('active');
    
    document.querySelectorAll('.admin-content > section').forEach(s => s.classList.add('hidden'));

    document.querySelector(`.section-${pagina}`).classList.remove('hidden');

    renderizarPagina(pagina);
}

function renderizarPagina(pagina) {
    if (pagina === 'dashboard') renderizarPedidosRecentes();
    if (pagina === 'mesas') renderizarCardMesas();
    if (pagina === 'pedidos') renderizarKanbanPedidos();
    if (pagina === 'cardapio') renderizarCardapio();
    if (pagina === 'pagamentos') renderizarPagamentos();


}

function entrarAdmin(){
    document.querySelector('.login-page').classList.add('hidden')
    document.querySelector('.admin-display').classList.remove('hidden')
    navigate('dashboard')
}

function sairAdmin() {
    document.querySelector('.login-page').classList.remove('hidden')
    document.querySelector('.admin-display').classList.add('hidden')

}

/********************************************** MESAS ************************************************ */

function abrirModalMesa(id) {
    // se existir uma mesa então vou edita-la assim armazeno o id para não perder nas outras funções
    idMesaEmEdicao = id ? id : null

    // aqui só abre o modal da mesa, se tiver id edita os conteudos, caso seja novo deixa padrão.

    const mesa = idMesaEmEdicao ? todasMesas.find(t => t.id === id) : null; 

    document.getElementById('titulo-modal-mesa').innerText = mesa ? 'Editar Mesa' : 'Nova Mesa';
    document.getElementById('numero-mesa').value = mesa ? mesa.numero : '';
    document.getElementById('capacidade-mesa').value = mesa ? mesa.capacidade : '';
    document.getElementById('status-mesa').value = mesa ? mesa.status : 'disponivel';

    //abre o modal na tela 
    abrirModal('modal-mesa')
}

function cadastrarMesa() {
    const numeroMesa = parseInt(document.getElementById('numero-mesa').value);
    const capacidadeMesa = parseInt(document.getElementById('capacidade-mesa').value)
    const statusMesa = document.getElementById('status-mesa').value;

    if (!numeroMesa || !capacidadeMesa) {return}

    if (idMesaEmEdicao ) {

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
            comanda: {
                total: 0,
            },
            pedidos: [],
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

    todasMesas.splice(indexMesa, 1)

    console.log(todasMesas)
    renderizarCardMesas();
}

function renderizarCardMesas() {
    const grid = document.getElementById('grid-mesas')
    grid.innerHTML = todasMesas.map(m => {
        const pedidosMesa = obterPedidosDaMesa(m.id);
        const totalMesa = calcularTotalPedidos(pedidosMesa);
        const pedidosAtivos = pedidosMesa.filter(p => p.status !== 'pago').length;

        return `
            <div class="card-mesa ${m.status}" onclick="abrirDetalhesMesa(${m.id})">
                <div class="mesa-order-badge">${pedidosAtivos}</div>
                <div class="mesa-number">${m.numero}</div>
                <div class="mesa-capacidade">${m.capacidade} lugares</div>
                <div class="span-status status-${m.status}">${m.status}</div>
                <div class="mesa-card-total">R$ ${formatarValor(totalMesa)}</div>
                <div onclick="event.stopPropagation()">
                    <button class="btn btn-secondary btn-xs" onclick="abrirModalMesa(${m.id})">Editar</button>
                    <button class="btn btn-delete btn-xs" onclick="deletarMesa(${m.id})">Excluir</button>
                </div>
            </div>
        `
    }).join('');
}

function obterListaPedidos() {
    if (typeof pedidos === 'undefined') return [];
    return pedidos;
}

function obterPedidosDaMesa(idMesa) {
    return obterListaPedidos().filter(p => p.idMesa === idMesa && p.status !== 'pago');
}

function formatarValor(valor) {
    return Number(valor || 0).toFixed(2).replace('.', ',');
}

function calcularTotalPedidos(listaPedidos) {
    return listaPedidos.reduce((total, pedido) => total + Number(pedido.total || 0), 0);
}

function calcularSubtotalPedidos(listaPedidos) {
    return listaPedidos.reduce((total, pedido) => total + Number(pedido.subtotal || 0), 0);
}

function calcularServicoPedidos(listaPedidos) {
    return listaPedidos.reduce((total, pedido) => {
        const subtotal = Number(pedido.subtotal || 0);
        const totalPedido = Number(pedido.total || 0);
        const couvert = Number(pedido.couvertArtistico || 0);
        return total + Math.max(totalPedido - subtotal - couvert, 0);
    }, 0);
}

function calcularCouvertPedidos(listaPedidos) {
    return listaPedidos.reduce((total, pedido) => total + Number(pedido.couvertArtistico || 0), 0);
}

function renderizarComandaCompleta(listaPedidos) {
    const subtotal = calcularSubtotalPedidos(listaPedidos);
    const servico = calcularServicoPedidos(listaPedidos);
    const couvert = calcularCouvertPedidos(listaPedidos);
    const total = calcularTotalPedidos(listaPedidos);
    const itensComanda = [];

    listaPedidos.forEach(pedido => {
        pedido.items.forEach(item => {
            const itemExistente = itensComanda.find(i => i.nome === item.nome && Number(i.precoUnitario) === Number(item.precoUnitario));

            if (itemExistente) {
                itemExistente.quantidade += Number(item.quantidade || 0);
                itemExistente.precoTotal += Number(item.precoTotal || 0);
            } else {
                itensComanda.push({
                    nome: item.nome,
                    quantidade: Number(item.quantidade || 0),
                    precoUnitario: Number(item.precoUnitario || 0),
                    precoTotal: Number(item.precoTotal || 0)
                });
            }
        });
    });

    const totalItens = itensComanda.reduce((totalItens, item) => totalItens + item.quantidade, 0);

    if (!listaPedidos.length) {
        return '<p class="empty-state">Nenhum item para cobrar nessa mesa.</p>';
    }

    return `
        <div class="comanda-section">
            <div class="comanda-section-title">Itens consumidos</div>
            <div class="table-container comanda-table-container">
                <table class="tabela-comanda tabela-comanda-admin">
                    <thead>
                        <tr class="head-table">
                            <th>ITEM</th>
                            <th>QTD</th>
                            <th>UNITÁRIO</th>
                            <th>TOTAL</th>
                        </tr>
                    </thead>
                    <tbody class="itens-tabela-comanda">
                        ${itensComanda.map(item => `
                            <tr>
                                <td>${item.nome}</td>
                                <td>${item.quantidade}</td>
                                <td>R$ ${formatarValor(item.precoUnitario)}</td>
                                <td>R$ ${formatarValor(item.precoTotal)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="comanda-section">
            <div class="comanda-section-title">Valores a pagar</div>
            <div class="summary-item"><span>Total de itens</span><span>${totalItens}</span></div>
            <div class="summary-item"><span>Subtotal dos itens</span><span>R$ ${formatarValor(subtotal)}</span></div>
            <div class="summary-item"><span>Serviço</span><span>R$ ${formatarValor(servico)}</span></div>
            <div class="summary-item"><span>Couvert</span><span>R$ ${formatarValor(couvert)}</span></div>
            <div class="summary-total"><span>Total da comanda</span><span>R$ ${formatarValor(total)}</span></div>
        </div>
    `;
}

function abrirDetalhesMesa(idMesa) {
    idMesaSelecionada = idMesa;
    renderizarDetalhesMesa();
    abrirModal('modal-detalhes-mesa');
}

function renderizarDetalhesMesa() {
    const mesa = todasMesas.find(m => m.id === idMesaSelecionada);
    if (!mesa) return;

    const pedidosMesa = obterPedidosDaMesa(mesa.id);

    document.getElementById('titulo-detalhes-mesa').textContent = `Mesa ${mesa.numero}`;
    document.getElementById('subtitulo-detalhes-mesa').textContent = `${mesa.capacidade} lugares · ${mesa.status}`;
    document.getElementById('btn-novo-pedido-mesa').onclick = () => {
        fecharModal('modal-detalhes-mesa');
        abrirModalNovoPedido(mesa.id);
    };
    document.getElementById('btn-pagamento-mesa').onclick = () => abrirPagamentoMesa(mesa.id);
    document.getElementById('btn-pagamento-mesa').disabled = pedidosMesa.length === 0;

    document.getElementById('mesa-pedidos-lista').innerHTML = pedidosMesa.length ? pedidosMesa.map(pedido => {
        const indexPedido = pedidos.indexOf(pedido);

        return `
        <div class="mesa-pedido-card">
            <div class="mesa-pedido-top">
                <div>
                    <strong>Pedido #${pedido.id}</strong>
                    <span>${pedido.items.length} item(ns)</span>
                </div>
                <span class="span-status ${pedido.status}">${traduzirStatusPedido(pedido.status)}</span>
            </div>
            <div class="mesa-pedido-items">
                ${pedido.items.map(item => `
                    <div class="summary-item">
                        <span>${item.nome} × ${item.quantidade}</span>
                        <span>R$ ${formatarValor(item.precoTotal)}</span>
                    </div>
                `).join('')}
            </div>
            ${pedido.notes ? `<div class="mesa-pedido-notes">Obs: ${pedido.notes}</div>` : ''}
            <div class="summary-total"><span>Total do pedido</span><span>R$ ${formatarValor(pedido.total)}</span></div>
            <div class="mesa-pedido-actions">
                <button class="btn btn-secondary btn-xs" onclick="abrirModalEditarPedido(${indexPedido})">Editar</button>
                <button class="btn btn-delete btn-xs" onclick="excluirPedido(${indexPedido})">Excluir</button>
            </div>
        </div>
    `;
    }).join('') : '<p class="empty-state">Nenhum pedido ativo nessa mesa.</p>';

    document.getElementById('mesa-comanda-resumo').innerHTML = renderizarComandaCompleta(pedidosMesa);
}

function traduzirStatusPedido(status) {
    const statusPedido = {
        pending: 'Novo',
        preparing: 'Preparando',
        ready: 'Pronto',
        delivered: 'Entregue',
        pago: 'Pago'
    };

    return statusPedido[status] || status;
}

function obterPedidoPorId(idPedido) {
    return obterListaPedidos().find(p => String(p.id) === String(idPedido));
}

function obterMinutosPedido(pedido) {
    return Math.max(1, Math.floor((Date.now() - new Date(pedido.criado).getTime()) / 60000));
}

function obterResumoItensPedido(pedido) {
    return pedido.items.map(item => `${item.nome} x${item.quantidade}`).join(', ');
}

function obterProgressoPedido(pedido) {
    const total = pedido.items.length;
    const feitos = pedido.items.filter(item => item.done).length;
    return { total, feitos };
}

function renderizarDotsProgresso(pedido) {
    const { total } = obterProgressoPedido(pedido);

    if (!total) {
        return '<div class="progress-dot"></div>';
    }

    return pedido.items.map(item => `
        <div class="progress-dot ${item.done ? 'done' : ''}"></div>
    `).join('');
}

function obterConfigAcaoPedido(status) {
    const config = {
        pending: { proximoStatus: 'preparing', label: 'Preparar', classe: 'btn-secondary' },
        preparing: { proximoStatus: 'ready', label: 'Pronto', classe: 'btn-green' },
        ready: { proximoStatus: 'delivered', label: 'Entregue', classe: 'btn-secondary' }
    };

    return config[status] || null;
}

function sincronizarTelasPedidos() {
    renderizarKanbanPedidos();
    renderizarPedidosRecentes();
    renderizarCardMesas();

    if (idMesaSelecionada) {
        renderizarDetalhesMesa();
    }

    if (idPedidoDetalhado) {
        renderizarDetalhePedido();
    }
}

function renderizarKanbanPedidos() {
    const colunas = ['pending', 'preparing', 'ready'];

    colunas.forEach(status => {
        const container = document.getElementById(`kanban-${status}`);
        const contador = document.getElementById(`kanban-count-${status}`);
        if (!container || !contador) return;

        const pedidosStatus = obterListaPedidos().filter(pedido => pedido.status === status);
        contador.textContent = pedidosStatus.length;

        if (!pedidosStatus.length) {
            container.innerHTML = '<div class="kanban-empty">Nenhum pedido nessa etapa.</div>';
            return;
        }

        container.innerHTML = pedidosStatus.map(pedido => {
            const { total, feitos } = obterProgressoPedido(pedido);
            const acao = obterConfigAcaoPedido(pedido.status);

            return `
                <div class="kanban-card" onclick="abrirDetalhePedido(${pedido.id})">
                    <div class="kanban-card-top">
                        <span class="kanban-mesa">Mesa ${pedido.numeroMesa}</span>
                        <span class="kanban-time">${obterMinutosPedido(pedido)} min</span>
                    </div>

                    <div class="kanban-items-preview">${obterResumoItensPedido(pedido)}</div>
                    ${pedido.notes ? `<div class="kanban-notes">Obs: ${pedido.notes}</div>` : ''}

                    <div class="kanban-footer">
                        <div class="kanban-progress">${renderizarDotsProgresso(pedido)}</div>
                        <div class="kanban-card-actions" onclick="event.stopPropagation()">
                            ${acao ? `<button class="btn ${acao.classe} btn-xs" onclick="avancarPedido(${pedido.id}, '${acao.proximoStatus}')">${acao.label}</button>` : ''}
                        </div>
                    </div>
                    <div class="kanban-progress-text">${feitos}/${total} itens marcados</div>
                </div>
            `;
        }).join('');
    });
}

function avancarPedido(idPedido, novoStatus) {
    const pedido = obterPedidoPorId(idPedido);
    if (!pedido || pedido.status === 'pago') return;

    pedido.status = novoStatus;

    if (novoStatus === 'delivered') {
        fecharModal('modal-detalhe-pedido');
        idPedidoDetalhado = null;
    }

    sincronizarTelasPedidos();
}

function alternarItemPedido(idPedido, idItemPedido) {
    const pedido = obterPedidoPorId(idPedido);
    if (!pedido) return;

    const item = pedido.items.find(i => String(i.id) === String(idItemPedido));
    if (!item) return;

    item.done = !item.done;
    sincronizarTelasPedidos();
}

function abrirDetalhePedido(idPedido) {
    idPedidoDetalhado = idPedido;
    renderizarDetalhePedido();
    abrirModal('modal-detalhe-pedido');
}

function renderizarDetalhePedido() {
    const pedido = obterPedidoPorId(idPedidoDetalhado);
    const corpo = document.getElementById('pedido-detalhe-corpo');
    if (!corpo) return;

    if (!pedido) {
        fecharModal('modal-detalhe-pedido');
        idPedidoDetalhado = null;
        return;
    }

    const { total, feitos } = obterProgressoPedido(pedido);
    const acao = obterConfigAcaoPedido(pedido.status);

    document.getElementById('titulo-detalhe-pedido').textContent = `Pedido #${pedido.id}`;
    document.getElementById('subtitulo-detalhe-pedido').textContent = `Mesa ${pedido.numeroMesa} - ${traduzirStatusPedido(pedido.status)} - ${obterMinutosPedido(pedido)} min`;

    corpo.innerHTML = `
        <div class="pedido-detail-summary">
            <div>
                <span>Status</span>
                <strong>${traduzirStatusPedido(pedido.status)}</strong>
            </div>
            <div>
                <span>Itens feitos</span>
                <strong>${feitos}/${total}</strong>
            </div>
            <div>
                <span>Total</span>
                <strong>R$ ${formatarValor(pedido.total)}</strong>
            </div>
        </div>

        <div class="pedido-detail-section">
            <h4>Itens do pedido</h4>
            <div class="pedido-detail-items">
                ${pedido.items.map(item => `
                    <label class="pedido-detail-item ${item.done ? 'done' : ''}">
                        <input type="checkbox" ${item.done ? 'checked' : ''} onchange="alternarItemPedido(${pedido.id}, '${item.id}')">
                        <div>
                            <strong>${item.nome} x${item.quantidade}</strong>
                            <span>R$ ${formatarValor(item.precoTotal)}</span>
                        </div>
                    </label>
                `).join('')}
            </div>
        </div>

        ${pedido.notes ? `
            <div class="pedido-detail-section">
                <h4>Observações</h4>
                <p class="pedido-detail-note">${pedido.notes}</p>
            </div>
        ` : ''}
    `;

    const footer = document.getElementById('pedido-detalhe-acoes');
    footer.innerHTML = `
        <button class="btn btn-secondary btn-sm" onclick="fecharModal('modal-detalhe-pedido')">Fechar</button>
        ${acao ? `<button class="btn ${acao.classe} btn-sm" onclick="avancarPedido(${pedido.id}, '${acao.proximoStatus}')">${acao.label}</button>` : ''}
    `;
}

function abrirPagamentoMesa(idMesa) {
    idMesaSelecionada = idMesa;
    const mesa = todasMesas.find(m => m.id === idMesaSelecionada);
    const pedidosMesa = obterPedidosDaMesa(idMesaSelecionada);
    const totalMesa = calcularTotalPedidos(pedidosMesa);

    if (!mesa || pedidosMesa.length === 0) return;

    document.getElementById('titulo-pagamento-mesa').textContent = `Pagamento - Mesa ${mesa.numero}`;
    document.getElementById('pagamento-mesa-resumo').innerHTML = renderizarComandaCompleta(pedidosMesa);
    document.getElementById('pagamento-valor-final').value = totalMesa.toFixed(2);
    selecionarMetodoPagamento('Cartão');

    abrirModal('modal-pagamento-mesa');
}

function selecionarMetodoPagamento(metodo) {
    metodoPagamentoSelecionado = metodo;
    document.querySelectorAll('.payment-method-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.metodo === metodo);
    });
}

function confirmarPagamentoMesa() {
    const mesa = todasMesas.find(m => m.id === idMesaSelecionada);
    const pedidosMesa = obterPedidosDaMesa(idMesaSelecionada);
    const valorFinal = parseFloat(document.getElementById('pagamento-valor-final').value || 0);

    if (!mesa || pedidosMesa.length === 0) return;
    if (valorFinal < 0) {
        alert('Informe um valor final válido.');
        return;
    }

    pagamentos.push({
        id: Date.now(),
        idMesa: mesa.id,
        numeroMesa: mesa.numero,
        idsPedidos: pedidosMesa.map(p => p.id),
        valor: valorFinal,
        valorOriginal: calcularTotalPedidos(pedidosMesa),
        desconto: Math.max(calcularTotalPedidos(pedidosMesa) - valorFinal, 0),
        metodo: metodoPagamentoSelecionado,
        status: 'Concluído',
        criado: new Date()
    });

    pedidosMesa.forEach(p => p.status = 'pago');
    mesa.status = 'disponivel';

    fecharModal('modal-pagamento-mesa');
    fecharModal('modal-detalhes-mesa');
    renderizarCardMesas();
    renderizarPagamentos();
    renderizarPedidosRecentes();
    renderizarKanbanPedidos();
}

/**************************************************** CARDAPIO ********************************************* */



const CAT_CONFIG = {
  'entrada':        {color: 'var(--font-green)',  dim: 'var(--bg-green)', value:'Entradas',  },
  'prato-principal':{color: 'var(--accent)', dim: 'var(--accent-background)', value:'Pratos Principais', },
  'bebida':          {color: 'var(--font-blue)',   dim: 'var(--bg-blue)', value:'Bebidas',   },
  'sobremesa':       {color: 'var(--font-yellow)', dim: 'var(--bg-yellow)', value:'Sobremesas', },
};

// function filtrarMenuCategorias(categoria) {
//     // toggle() diciona uma classe css caso ela não exista, no caso adiciona ao item que tem um atributo com o mesmo valor do passado na função
//     document.querySelectorAll('.categoria-opcao').forEach(cat => cat.classList.toggle('active', cat.dataset.categoria === categoria))

// }    

function abrirModalCardapio(id) {
  
    idItemEmEdicao = id ? id : null;
    
    const item = id ? itensCardapio.find(i => i.id === id) : null;

    document.getElementById('titulo-modal-cardapio').innerText = item ? 'Editar Item' : 'Novo Item'
    document.getElementById('menu-nome').value = item ? item.nome : '';
    document.getElementById('menu-categoria').value = item ? item.categoria : 'entrada';
    document.getElementById('menu-descricao').value = item ? item.descricao : '';
    document.getElementById('menu-preco').value = item ? item.preco : '';
    document.getElementById('menu-tempo-preparo').value = item ? item.tempoPreparo : '';
    document.getElementById('menu-detalhes').value = item ? item.detalhes : '';

    //abre realmente o modal com os dados conform seja editar ou criar um novo
    abrirModal('modal-cardapio')
}

function cadastrarItemMenu() {
    const nomeItem = document.getElementById('menu-nome').value
    const categoriaItem = document.getElementById('menu-categoria').value
    const descricaoItem = document.getElementById('menu-descricao').value
    const precoItem = document.getElementById('menu-preco').value
    const tempoPreparoItem = document.getElementById('menu-tempo-preparo').value
    const detalhesItem = document.getElementById('menu-detalhes').value


    if (idItemEmEdicao) {
        let item = itensCardapio.find(i => i.id === idItemEmEdicao)
        console.log(idItemEmEdicao, 'idItemEdicao')
        
        item.nome = nomeItem
        item.categoria = categoriaItem
        item.descricao = descricaoItem
        item.preco = precoItem
        item.tempoPreparo = tempoPreparoItem
        item.detalhes = detalhesItem
    } else {
        let novoItem = {
            id: Math.floor(Math.random() * (10 - 2 + 1)) + 2,
            nome: nomeItem,
            categoria: categoriaItem,
            descricao: descricaoItem,
            preco: precoItem,
            tempoPreparo: tempoPreparoItem,
            detalhes: detalhesItem,
        }

        itensCardapio.push(novoItem)

    }

    idItemEmEdicao = null;

    fecharModal('modal-cardapio')
    renderizarCardapio()
}

function filtrarCardapio(categoria) {
    categoriaAtivaCardapio = categoria;
    document.querySelectorAll('#opcoes-filtros-cardapio .categoria-opcao').forEach( opcao => 
        opcao.classList.toggle( 'active', opcao.dataset.categoria === categoria )
    );

    renderizarCardapio();
}

function filtrarCardapioCat(cat) {
    categoriaAtivaCardapio = cat;
    document.querySelectorAll('.cat-pill').forEach( opcao => 
        opcao.classList.toggle( 'active', opcao.dataset.categoria === cat )
    );

    renderizarItensCardapioPedidos();
}

function renderizarCardapio() {

    const container = document.getElementById("categorias-cardapio");

    // o new Set() pega esse array que o map retornou e tira as duplicidades
    // o spread ... pega cada item do objeto que o set criou e distribui no array
    const categorias = [ ...new Set(itensCardapio.map( i => i.categoria))] 
    
    const filtrado = categoriaAtivaCardapio === 'todos' ? categorias : categorias.filter(c => c === categoriaAtivaCardapio)
    
    if (!filtrado.length || !itensCardapio.length) {
        container.innerHTML = '<p style="color:var(--p-color); padding:2rem; text-align:center "> Nenhum item encontrado. </p>'
        return;
    }

    container.innerHTML = filtrado.map(categoria => {
        // items é um array que guarda todos os itens da categoria que tem no filtrado
        const items = itensCardapio.filter(i => i.categoria === categoria)
        const cfg = CAT_CONFIG[categoria] || {color: 'var(--p-color)', dim: 'var(--bg-secondary)', value:'Oxiiii' }
        
        return `
        
            <div class="cardapio-cat-section" style="margin-bottom:2rem" >
                <div class="cardapio-cat-header">

                    <div class="cardapio-cat-label" style="--cat-color:${cfg.color};--cat-dim:${cfg.dim}">
                        <span>${cfg.value}</span>
                        <span class="cardapio-cat-count">${items.length}</span>
                    </div>
                </div>

                <div class="cardapio-items-grid">

                    ${items.map(item => `
                        
                        <div class="cardapio-item-card">
                        
                            <div class="cardapio-item-top">
                                <div class="cardapio-item-name">${item.nome}</div>
                                <div class="cardapio-item-price">R$ ${item.preco}</div>
                            </div>

                            <div class="cardapio-item-desc">${item.descricao}</div>
    
                            <div class="cardapio-item-meta">
                                ${item.tempoPreparo ? `<span class="cardapio-meta-tag">⏱ ${item.tempoPreparo}min</span>` : ''}
                                ${(item.alergicos||[]).length ? `<span class="cardapio-meta-tag cardapio-meta-warn">⚠ ${item.alergicos.join(', ')}</span>` : ''}
                            </div>
                            
                            <div class="cardapio-item-actions">
                                <button class="btn btn-secondary btn-sm" onclick="abrirModalCardapio(${item.id})">✏️ Editar</button>
                                <button class="btn btn-delete btn-sm" onclick="deletarItemCardapio(${item.id})">🗑 Remover</button>
                            </div>

                        </div>
                    `).join('')}

                </div>
            </div>
        `;
    }).join('');
}

function deletarItemCardapio(id) {
    const idItem = id ? id : null
    const indexItem = idItem ? itensCardapio.findIndex(i => i.id === idItem) : null
       

    itensCardapio.splice(indexItem, 1);

    renderizarCardapio();
}

// renderizar No dashboard os pedidos recentes // no momento está renderizando só as mesas, total e status
function renderizarPedidosRecentes() {

    const corpoTabela = document.querySelector('.section-dashboard .table-container tbody') 
    const cardsDashboard = document.querySelectorAll('.section-dashboard .status-content');
    const descDashboard = document.querySelectorAll('.section-dashboard .status-desc');
    const pedidosAtivosDashboard = obterListaPedidos().filter(p => !['delivered', 'pago'].includes(p.status));
    const pedidosCozinha = obterListaPedidos().filter(p => p.status === 'pending');
    const mesasOcupadas = todasMesas.filter(m => m.status === 'ocupada').length;
    const mesasDisponiveis = todasMesas.filter(m => m.status === 'disponivel').length;
    const receitaHoje = pagamentos.reduce((total, pagamento) => total + Number(pagamento.valor || 0), 0);

    if (cardsDashboard[0]) cardsDashboard[0].textContent = pedidosAtivosDashboard.length;
    if (cardsDashboard[1]) cardsDashboard[1].textContent = `R$ ${formatarValor(receitaHoje)}`;
    if (cardsDashboard[2]) cardsDashboard[2].textContent = `${mesasOcupadas}/${todasMesas.length}`;
    if (cardsDashboard[3]) cardsDashboard[3].textContent = pedidosCozinha.length;
    if (descDashboard[0]) descDashboard[0].textContent = `${obterListaPedidos().length} total`;
    if (descDashboard[1]) descDashboard[1].textContent = `${pagamentos.length} pagamentos`;
    if (descDashboard[2]) descDashboard[2].textContent = `${mesasDisponiveis} disponiveis`;
    if (descDashboard[3]) descDashboard[3].textContent = 'novos pedidos';

    const pedidosRecentes = obterListaPedidos()
        .filter(pedido => !['delivered', 'pago'].includes(pedido.status))
        .slice()
        .sort((a, b) => new Date(b.criado) - new Date(a.criado));

    if (!pedidosRecentes.length) {
        corpoTabela.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;color:var(--p-color);padding:2rem">Nenhum pedido ativo.</td>
            </tr>
        `;
        return;
    }

    corpoTabela.innerHTML = pedidosRecentes.map(pedido => {
        const totalItens = pedido.items.reduce((sum, item) => sum + Number(item.quantidade || 0), 0);
        
        return `
            <tr onclick="abrirDetalhePedido(${pedido.id})" style="cursor:pointer">
                <td>Mesa ${pedido.numeroMesa}</td>
                <td class="td-itens">${totalItens} itens</td>
                <td class="td-accent">R$ ${formatarValor(pedido.total)}</td>
                <td><span class="span-status ${pedido.status}">${traduzirStatusPedido(pedido.status)}</span></td>
                <td style="color: var(--p-color);">${obterMinutosPedido(pedido)} min</td>
            </tr>
        `
    }).join('')
}

function abrirModalNovoPedido(idMesa) {
    
    addToOrderId = null;
    idMesaEmEdicao = idMesa || null
    const table = todasMesas.find(m => m.id === idMesaEmEdicao);
    document.getElementById('titulo-novo-pedido').textContent = table ? ` Novo Pedido - Mesa ${table.numero}` : 'Novo Pedido';
    document.getElementById('btn-enviar-pedido').textContent = 'Enviar para Cozinha';
    
    const select = document.getElementById('order-table-sel')
    select.innerHTML = todasMesas.map(m => `
        <option value="${m.id}" ${m.id === idMesaEmEdicao ? 'selected' : '' } > 
            Mesa ${m.numero} ( ${m.status} )
        </option>
    `).join('');
    select.disabled = false;
    select.onchange = () => {
        const mesaSelecionada = todasMesas.find(m => m.id === parseInt(select.value));
        document.getElementById('order-couvert-val').value = mesaSelecionada && obterPedidosDaMesa(mesaSelecionada.id).length ? 0 : 15;
        atualizarResumoPedidos();
    };

    categoriaAtivaCardapio = 'todos'
    carroPedidos = {};
    menuSearchQ = '';
    document.querySelectorAll('.cat-pill').forEach(opcao =>
        opcao.classList.toggle('active', opcao.dataset.categoria === 'todos')
    );
    document.getElementById('order-menu-search').value = ''; 
    document.getElementById('order-notes').value = '';
    document.getElementById('order-couvert-val').value = table && obterPedidosDaMesa(table.id).length ? 0 : 15;
    document.getElementById('order-couvert-val').oninput = atualizarResumoPedidos;
    renderizarItensCardapioPedidos()
    atualizarResumoPedidos()


    abrirModal('modal-novo-pedido')
}

function abrirModalEditarPedido(indexPedido) {
    const pedido = pedidos[indexPedido];
    if (!pedido || pedido.status === 'pago') return;

    addToOrderId = indexPedido;
    idMesaEmEdicao = pedido.idMesa;
    carroPedidos = {};
    pedido.items.forEach(item => {
        const itemCardapio = itensCardapio.find(i => String(i.id) === String(item.idItem)) || itensCardapio.find(i => i.nome === item.nome);
        if (itemCardapio) {
            carroPedidos[itemCardapio.id] = Number(item.quantidade || 0);
        }
    });

    const select = document.getElementById('order-table-sel');
    select.innerHTML = todasMesas.map(m => `
        <option value="${m.id}" ${m.id === pedido.idMesa ? 'selected' : ''}>
            Mesa ${m.numero} ( ${m.status} )
        </option>
    `).join('');
    select.disabled = true;

    categoriaAtivaCardapio = 'todos';
    menuSearchQ = '';
    document.querySelectorAll('.cat-pill').forEach(opcao =>
        opcao.classList.toggle('active', opcao.dataset.categoria === 'todos')
    );
    document.getElementById('titulo-novo-pedido').textContent = `Editar Pedido - Mesa ${pedido.numeroMesa}`;
    document.getElementById('btn-enviar-pedido').textContent = 'Salvar alterações';
    document.getElementById('order-menu-search').value = '';
    document.getElementById('order-notes').value = pedido.notes || '';
    document.getElementById('order-couvert-val').value = Number(pedido.couvertArtistico || 0);
    document.getElementById('order-couvert-val').oninput = atualizarResumoPedidos;

    renderizarItensCardapioPedidos();
    atualizarResumoPedidos();
    abrirModal('modal-novo-pedido');
}

function excluirPedido(indexPedido) {
    const pedido = pedidos[indexPedido];
    if (!pedido || pedido.status === 'pago') return;

    if (!confirm(`Excluir o pedido #${pedido.id}?`)) return;

    const idMesa = pedido.idMesa;
    const indexTodosPedidos = todosPedidos.indexOf(pedido);

    pedidos.splice(indexPedido, 1);
    if (indexTodosPedidos !== -1) {
        todosPedidos.splice(indexTodosPedidos, 1);
    }

    const mesa = todasMesas.find(m => m.id === idMesa);
    if (mesa && obterPedidosDaMesa(idMesa).length === 0) {
        mesa.status = 'disponivel';
    }

    renderizarCardMesas();
    renderizarPedidosRecentes();
    renderizarKanbanPedidos();
    if (idMesaSelecionada === idMesa) {
        renderizarDetalhesMesa();
    }
}

function renderizarItensCardapioPedidos() {
  const q = menuSearchQ.toLowerCase();

  const items = itensCardapio.filter(i =>
    (categoriaAtivaCardapio === 'todos' || i.categoria === categoriaAtivaCardapio) &&
    (!q || i.nome.toLowerCase().includes(q))
  );

  document.getElementById('order-items-list').innerHTML = items.map(item => {
    const qty = carroPedidos[item.id] || 0;
    return `
    <div class="order-item-row">
      <div class="item-info">
        <div class="item-name">${item.nome}</div>
        <div class="item-price">${item.preco} · ${item.categoria}</div>
      </div>    
      <div class="qty-controls">
        <button class="qty-btn" onclick="mudarQtd('${item.id}',-1)">−</button>
        <span class="qty-val">${qty}</span>
        <button class="qty-btn" onclick="mudarQtd('${item.id}',1)">+</button>
      </div>
    </div>`;
  }).join('');

  
}

// idItem -> identificar o item que será adicionado no carrinho
// alt -> parametro que é passada a alteração de valor do item, "-1" item ou "1" item 
function mudarQtd(idItem, alt) {
    const current = carroPedidos[idItem] || 0;
    const next = Math.max(0, current + alt)

    if (next === 0) {
        delete carroPedidos[idItem] 
    } else {
        carroPedidos[idItem] = next
    }
    renderizarItensCardapioPedidos()
    atualizarResumoPedidos()
}

function atualizarResumoPedidos() {
    const box = document.getElementById('order-summary-box')
    const entries = Object.entries(carroPedidos);

    if (!entries.length) { box.innerHTML = '<p style="color:var(--p-color);font-size:.82rem;text-align:center">Nenhum item selecionado</p>'; return; }

    const couvert = parseFloat(document.getElementById('order-couvert-val').value || 15);
    let subtotal = 0;

    const lines = entries.map(([id, qty]) => {

        const item = itensCardapio.find(i => String(i.id) === String(id));
        if (!item) return '';
        const tot = item.preco * qty;
        subtotal += tot;

        return `
            <div class="summary-item">
                <span>${item.nome} × ${qty} </span> 
                <span>R$ ${tot}</span>
            </div>
        `;
    }).join('');

    const service = subtotal * 0.1;
    const total = subtotal + service + couvert;

    box.innerHTML = `
        <h4>Resumo</h4>${lines}
        <div class="summary-item">
            <span>Serviço (10%)</span>
            <span>R$ ${formatarValor(service)}</span>
        </div>

        <div class="summary-item"> <span>Couvert</span> <span>R$ ${formatarValor(couvert)}</span> </div>
        
        <div class="summary-total"><span>Total</span><span> R$ ${formatarValor(total)}</span></div>
    `;
}

function montarDadosPedidoAPartirDoCarrinho() {
    const entries = Object.entries(carroPedidos);
    const couvert = parseFloat(document.getElementById('order-couvert-val').value || 0);
    let subtotal = 0;

    const items = entries.map(([id, qty]) => {
        const item = itensCardapio.find(i => String(i.id) === String(id));
        if (!item) return null;
        const precoTotal = Number(item.preco) * Number(qty);
        subtotal += precoTotal;
        return {
            id: Math.random().toString(36).substr(2, 9),
            idItem: id,
            nome: item.nome,
            quantidade: Number(qty),
            precoUnitario: Number(item.preco),
            precoTotal: precoTotal,
            done: false
        };
    }).filter(Boolean);

    const service = subtotal * 0.1;

    return {
        items: items,
        subtotal: subtotal,
        porcentagemServico: 10,
        couvertArtistico: couvert,
        total: subtotal + service + couvert
    };
}

function enviarPedido() {
    const entries = Object.entries(carroPedidos);

    if (entries.length === 0) {
        alert("Adicione pelo menos um item ao pedido!");
        return;
    }

    const idMesa = parseInt(document.getElementById('order-table-sel').value);
    const mesa = todasMesas.find(m => m.id === idMesa);
    const notes = document.getElementById('order-notes').value;
    const dadosPedido = montarDadosPedidoAPartirDoCarrinho();

    if (dadosPedido.items.length === 0) {
        alert("Adicione pelo menos um item válido ao pedido!");
        return;
    }

    if (addToOrderId !== null) {
        const pedido = pedidos[addToOrderId];
        if (!pedido) return;

        pedido.items = dadosPedido.items;
        pedido.subtotal = dadosPedido.subtotal;
        pedido.porcentagemServico = dadosPedido.porcentagemServico;
        pedido.couvertArtistico = dadosPedido.couvertArtistico;
        pedido.total = dadosPedido.total;
        pedido.notes = notes;

        carroPedidos = {};
        addToOrderId = null;
        document.getElementById('order-table-sel').disabled = false;
        fecharModal('modal-novo-pedido');
        renderizarCardMesas();
        renderizarPedidosRecentes();
        renderizarKanbanPedidos();
        if (idMesaSelecionada === pedido.idMesa) {
            renderizarDetalhesMesa();
        }
        return;
    }

    const novoPedido = {
        id: Date.now(),
        idMesa: idMesa,
        numeroMesa: mesa ? mesa.numero : '?',
        items: dadosPedido.items,
        subtotal: dadosPedido.subtotal,
        porcentagemServico: dadosPedido.porcentagemServico,
        couvertArtistico: dadosPedido.couvertArtistico,
        total: dadosPedido.total,
        criado: new Date(),
        status: 'pending',
        notes: notes
    };

    pedidos.push(novoPedido);
    todosPedidos.push(novoPedido);

    mesa.status = 'ocupada';

    // Limpar carrinho e fechar modal
    carroPedidos = {};
    fecharModal('modal-novo-pedido');
    renderizarCardMesas();
    renderizarPedidosRecentes();
    renderizarKanbanPedidos();
    if (idMesaSelecionada === idMesa) {
        renderizarDetalhesMesa();
    }
    
}

function renderizarPagamentos() {
    const tabela = document.querySelector('.tabela-pagamentos tbody');
    if (!tabela) return;

    const totalRecebido = pagamentos.reduce((total, pagamento) => total + Number(pagamento.valor || 0), 0);
    const totalPendente = todasMesas.reduce((total, mesa) => total + calcularTotalPedidos(obterPedidosDaMesa(mesa.id)), 0);
    const cards = document.querySelectorAll('.section-pagamentos .status-content');

    if (cards[0]) cards[0].textContent = `R$ ${formatarValor(totalRecebido + totalPendente)}`;
    if (cards[1]) cards[1].textContent = `R$ ${formatarValor(totalRecebido)}`;
    if (cards[2]) cards[2].textContent = `R$ ${formatarValor(totalPendente)}`;

    if (!pagamentos.length) {
        tabela.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;color:var(--p-color);padding:2rem">Nenhum pagamento registrado.</td>
            </tr>
        `;
        return;
    }

    tabela.innerHTML = pagamentos.slice().reverse().map(pagamento => `
        <tr>
            <td style="color: var(--p-color)">${pagamento.idsPedidos.join(', ')}</td>
            <td style="font-weight: 600;">Mesa ${pagamento.numeroMesa}</td>
            <td style="color: var(--accent); font-weight: bold;">R$ ${formatarValor(pagamento.valor)}</td>
            <td>${pagamento.metodo}</td>
            <td><span class="span-status pronto">${pagamento.status}</span></td>
            <td style="text-align: left; color: var(--p-color);">${new Date(pagamento.criado).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
        </tr>
    `).join('');
}
