let carroPedidos = {};
let idMesaEmEdicao = null;
let idItemEmEdicao = null;
let addToOrderId = null;
let categoriaAtivaCardapio = 'todos'
let menuSearchQ = ''

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
    if (pagina === 'cardapio') renderizarCardapio();


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

    corpoTabela.innerHTML = todasMesas.map(m => {
        
        const pedidosMesa = pedidos.filter(p => m.idPedidos.includes(p.id))

        return `
            <tr>
                <td>Mesa ${m.numero}</td>
                <td class="td-itens">${m.capacidade} itens</td>
                <td class="td-accent">R$ ${pedidosMesa[0].total}</td>
                <td><span class="span-status status-${m.status}">${m.status}</span></td>
                <td style="color: var(--p-color);"> 40 min </td>
            </tr>
        `
    }).join('')
}

function abrirModalNovoPedido(idMesa) {
    
    idMesaEmEdicao = idMesa || idItemEmEdicao
    const table = todasMesas.find(m => m.id === idMesaEmEdicao);
    document.getElementById('titulo-novo-pedido').textContent = table ? ` Novo Pedido - Mesa ${table.numero}` : 'Novo Pedido';
    
    const select = document.getElementById('order-table-sel')
    select.innerHTML = todasMesas.map(m => `
        <option value="${m.id}" ${m.id === idMesaEmEdicao ? 'selected' : '' } > 
            Mesa ${m.numero} ( ${m.status} )
        </option>
    `).join('');

    categoriaAtivaCardapio = 'todos'
    document.getElementById('order-menu-search').value = ''; 
    renderizarItensCardapioPedidos()


    abrirModal('modal-novo-pedido')
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

        const item = itensCardapio.find(i => i.id === id);
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
    const total = subtotal + service + (addToOrderId ? 0 : couvert);

    box.innerHTML = `
        <h4>Resumo</h4>${lines}
        <div class="summary-item">
            <span>Serviço (10%)</span>
            <span>R$ ${service}</span>
        </div>

        ${!addToOrderId ? `<div class="summary-item"> <span>Couvert</span> <span>R$ ${couvert}</span> </div>` : ''}
        
        <div class="summary-total"><span>Total</span><span> R$ ${total}</span></div>
    `;
}


function enviarPedido() {
    const entries = Object.entries(carroPedidos);

    if (entries.length === 0) {
        alert("Adicione pelo menos um item ao pedido!");
        return;
    }

    const idMesa = parseInt(document.getElementById('order-table-sel').value);
    const mesa = todasMesas.find(m => m.id === idMesa);
    const couvert = parseFloat(document.getElementById('order-couvert-val').value || 0);
    const notes = document.getElementById('order-notes').value;

    let subtotal = 0;
    const items = entries.map(([id, qty]) => {
        const item = itensCardapio.find(i => i.id === id);
        const precoTotal = item.preco * qty;
        subtotal += precoTotal;
        return {
            id: Math.random().toString(36).substr(2, 9),
            idItem: id,
            nome: item.nome,
            quantidade: qty,
            precoUnitario: item.preco,
            precoTotal: precoTotal,
            done: false
        };
    });

    const service = subtotal * 0.1;
    const total = subtotal + service + couvert;

    const novoPedido = {
        id: Date.now(),
        idMesa: idMesa,
        numeroMesa: mesa ? mesa.numero : '?',
        items: items,
        subtotal: subtotal,
        porcentagemServico: 10,
        couvertArtistico: couvert,
        total: total,
        criado: new Date(),
        status: 'pending',
        notes: notes
    };

    todosPedidos.push(novoPedido);

    // Limpar carrinho e fechar modal
    carroPedidos = {};
    fecharModal('modal-novo-pedido');
    
}

