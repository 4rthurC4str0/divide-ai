let clienteAtual = null;
let mesaAtual = null;
let splitPessoas = [];
let splitAtribuicoes = {};

const CLIENTE_SESSION_KEY = 'clienteLogado';
const CLIENTES_KEY = 'clientesCadastrados';

const CATEGORIAS_CLIENTE = {
    'entrada': 'Entradas',
    'prato-principal': 'Pratos Principais',
    'bebida': 'Bebidas',
    'sobremesa': 'Sobremesas',
};

function normalizarTelefone(telefone) {
    return String(telefone || '').replace(/\D/g, '');
}

function formatarValor(valor) {
    return Number(valor || 0).toFixed(2).replace('.', ',');
}

function escaparHTML(valor) {
    return String(valor || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function obterClientes() {
    return JSON.parse(localStorage.getItem(CLIENTES_KEY) || '[]');
}

function salvarClientes(clientes) {
    localStorage.setItem(CLIENTES_KEY, JSON.stringify(clientes));
}

function mostrarErroCliente(mensagem) {
    const erro = document.getElementById('client-login-error');
    if (erro) erro.textContent = mensagem;
}

function cadastrarCliente() {
    const nome = document.getElementById('cadastro-nome').value.trim();
    const telefoneOriginal = document.getElementById('cadastro-telefone').value.trim();
    const telefone = normalizarTelefone(telefoneOriginal);

    if (!nome || !telefone) {
        mostrarErroCliente('Informe nome e telefone para cadastrar.');
        return;
    }

    const clientes = obterClientes();
    const clienteExistente = clientes.find(cliente => normalizarTelefone(cliente.telefone) === telefone);

    if (clienteExistente) {
        clienteExistente.nome = nome;
        clienteExistente.telefone = telefoneOriginal;
    } else {
        clientes.push({
            id: Date.now(),
            nome,
            telefone: telefoneOriginal,
        });
    }

    salvarClientes(clientes);
    document.getElementById('login-cliente-nome').value = nome;
    document.getElementById('login-cliente-telefone').value = telefoneOriginal;
    document.getElementById('cadastro-nome').value = '';
    document.getElementById('cadastro-telefone').value = '';
    mostrarErroCliente('Cadastro realizado. Informe a mesa para entrar.');
}

function entrarCliente() {
    const nome = document.getElementById('login-cliente-nome').value.trim();
    const telefone = normalizarTelefone(document.getElementById('login-cliente-telefone').value);
    const numeroMesa = parseInt(document.getElementById('login-cliente-mesa').value);
    const clientes = obterClientes();
    const cliente = clientes.find(c =>
        normalizarTelefone(c.telefone) === telefone &&
        c.nome.trim().toLowerCase() === nome.toLowerCase()
    );
    const mesa = todasMesas.find(m => Number(m.numero) === numeroMesa);

    if (!cliente) {
        mostrarErroCliente('Cliente não encontrado. Faça o cadastro primeiro.');
        return;
    }

    if (!mesa) {
        mostrarErroCliente('Mesa não encontrada.');
        return;
    }

    clienteAtual = cliente;
    mesaAtual = mesa;
    sessionStorage.setItem(CLIENTE_SESSION_KEY, JSON.stringify({
        telefone: cliente.telefone,
        numeroMesa: mesa.numero,
    }));
    abrirAppCliente();
}

function sairCliente() {
    sessionStorage.removeItem(CLIENTE_SESSION_KEY);
    clienteAtual = null;
    mesaAtual = null;
    splitPessoas = [];
    splitAtribuicoes = {};

    document.getElementById('cliente-auth').classList.remove('hidden');
    document.getElementById('cliente-nav').classList.add('hidden');
    document.getElementById('cliente-app').classList.add('hidden');
    document.getElementById('btn-sair-cliente').classList.add('hidden');
    document.getElementById('cliente-header-subtitle').textContent = 'Restaurante & Bar';
}

function restaurarSessaoCliente() {
    const sessao = JSON.parse(sessionStorage.getItem(CLIENTE_SESSION_KEY) || 'null');
    if (!sessao) return;

    const cliente = obterClientes().find(c => normalizarTelefone(c.telefone) === normalizarTelefone(sessao.telefone));
    const mesa = todasMesas.find(m => Number(m.numero) === Number(sessao.numeroMesa));

    if (!cliente || !mesa) {
        sessionStorage.removeItem(CLIENTE_SESSION_KEY);
        return;
    }

    clienteAtual = cliente;
    mesaAtual = mesa;
    abrirAppCliente();
}

function abrirAppCliente() {
    document.getElementById('cliente-auth').classList.add('hidden');
    document.getElementById('cliente-nav').classList.remove('hidden');
    document.getElementById('cliente-app').classList.remove('hidden');
    document.getElementById('btn-sair-cliente').classList.remove('hidden');
    document.getElementById('cliente-header-subtitle').textContent = `${clienteAtual.nome} - Mesa ${mesaAtual.numero}`;

    prepararDivisaoInicial();
    renderizarCliente();
    navegarPaginas('conta');
}

function navegarPaginas(pagina) {
    document.querySelectorAll('#paginas-cliente .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab='${pagina}']`).classList.add('active');

    document.querySelectorAll('.client-content > section').forEach(pag => pag.classList.add('hidden'));
    document.getElementById(`tab-${pagina}`).classList.remove('hidden');

    if (pagina === 'conta') renderizarComandaCliente();
    if (pagina === 'menu') renderizarCardapioCliente();
    if (pagina === 'split') renderizarDivisaoConta();
}

function renderizarCliente() {
    renderizarComandaCliente();
    renderizarCardapioCliente();
    renderizarDivisaoConta();
}

function obterPedidosMesaAtual() {
    if (!mesaAtual) return [];
    return pedidos.filter(pedido => Number(pedido.idMesa) === Number(mesaAtual.id) && pedido.status !== 'pago');
}

function obterItensMesaAtual() {
    const itensPorProduto = new Map();

    obterPedidosMesaAtual().forEach(pedido => {
        pedido.items.forEach(item => {
            const idProduto = item.idItem || item.nome;
            const precoUnitario = Number(item.precoUnitario || 0);
            const key = `item-${encodeURIComponent(String(idProduto))}-${precoUnitario.toFixed(2)}`;
            const itemAgrupado = itensPorProduto.get(key);
            const quantidade = Number(item.quantidade || 0);
            const precoTotal = Number(item.precoTotal || (quantidade * precoUnitario));

            if (itemAgrupado) {
                itemAgrupado.quantidade += quantidade;
                itemAgrupado.precoTotal += precoTotal;
                if (!itemAgrupado.pedidoIds.includes(pedido.id)) {
                    itemAgrupado.pedidoIds.push(pedido.id);
                }
                return;
            }

            itensPorProduto.set(key, {
                key,
                nome: item.nome,
                quantidade,
                precoUnitario,
                precoTotal,
                pedidoIds: [pedido.id],
            });
        });
    });

    return Array.from(itensPorProduto.values());
}

function obterResumoMesa() {
    const pedidosMesa = obterPedidosMesaAtual();
    return pedidosMesa.reduce((resumo, pedido) => {
        const subtotal = Number(pedido.subtotal || 0);
        const total = Number(pedido.total || 0);
        const couvert = Number(pedido.couvertArtistico || 0);
        const servico = Math.max(total - subtotal - couvert, 0);

        resumo.subtotal += subtotal;
        resumo.servico += servico;
        resumo.couvert += couvert;
        resumo.total += total;
        return resumo;
    }, { subtotal: 0, servico: 0, couvert: 0, total: 0 });
}

function traduzirStatus(status) {
    const labels = {
        pending: 'Novo Pedido',
        preparing: 'Preparando',
        ready: 'Pronto',
        delivered: 'Entregue',
        pago: 'Pago',
    };

    return labels[status] || status || 'Sem pedido';
}

function renderizarComandaCliente() {
    if (!mesaAtual) return;

    const pedidosMesa = obterPedidosMesaAtual();
    const itens = obterItensMesaAtual();
    const resumo = obterResumoMesa();
    const status = pedidosMesa[0] ? traduzirStatus(pedidosMesa[0].status) : 'Sem pedidos ativos';

    document.getElementById('cliente-mesa-titulo').textContent = `Mesa ${mesaAtual.numero}`;
    document.getElementById('cliente-mesa-subtitulo').innerHTML = `${pedidosMesa.length} pedido(s) ativo(s) - <span class="span-status ${pedidosMesa[0] ? pedidosMesa[0].status : 'disponivel'}">${status}</span>`;

    const corpo = document.getElementById('cliente-comanda-itens');
    if (!itens.length) {
        corpo.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center;color:var(--p-color);padding:2rem">Nenhum item pedido nessa mesa.</td>
            </tr>
        `;
    } else {
        corpo.innerHTML = itens.map(item => `
            <tr>
                <td>${escaparHTML(item.nome)}</td>
                <td>${item.quantidade}</td>
                <td>R$ ${formatarValor(item.precoUnitario)}</td>
                <td>R$ ${formatarValor(item.precoTotal)}</td>
            </tr>
        `).join('');
    }

    document.getElementById('cliente-comanda-resumo').innerHTML = `
        <div class="summary-row">
            <span>Subtotal</span>
            <span>R$ ${formatarValor(resumo.subtotal)}</span>
        </div>
        <div class="summary-row">
            <span>Serviço</span>
            <span>R$ ${formatarValor(resumo.servico)}</span>
        </div>
        <div class="summary-row">
            <span>Couvert artístico</span>
            <span>R$ ${formatarValor(resumo.couvert)}</span>
        </div>
        <div class="summary-row grand-total">
            <span>Total</span>
            <span>R$ ${formatarValor(resumo.total)}</span>
        </div>
    `;
}

function renderizarCardapioCliente() {
    const container = document.getElementById('cliente-cardapio');
    const categorias = Object.keys(CATEGORIAS_CLIENTE).filter(categoria =>
        itensCardapio.some(item => item.categoria === categoria)
    );

    if (!itensCardapio.length || !categorias.length) {
        container.innerHTML = '<p class="empty-state">Nenhum item cadastrado no cardápio.</p>';
        return;
    }

    container.innerHTML = categorias.map(categoria => {
        const itens = itensCardapio.filter(item => item.categoria === categoria);

        return `
            <h3 class="menu-category-title">${CATEGORIAS_CLIENTE[categoria]}</h3>
            <div class="cardapio-items-grid">
                ${itens.map(item => `
                    <div class="cardapio-item-card">
                        <div class="cardapio-item-top">
                            <span class="cardapio-item-name">${escaparHTML(item.nome)}</span>
                            <span class="cardapio-item-price">R$ ${formatarValor(item.preco)}</span>
                        </div>
                        <p class="cardapio-item-desc">${escaparHTML(item.descricao || item.detalhes || '')}</p>
                        <div class="cardapio-item-meta">
                            <span class="cardapio-meta-tag">${Number(item.tempoPreparo || 0)} min</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }).join('');
}

function prepararDivisaoInicial() {
    splitPessoas = [{
        id: `p-${Date.now()}`,
        nome: clienteAtual.nome,
    }];
    splitAtribuicoes = {};
}

function adicionarPessoaDivisao() {
    const campo = document.getElementById('split-nova-pessoa');
    const nome = campo ? campo.value : '';
    if (!nome || !nome.trim()) return;

    if (splitPessoas.length === 1) {
        splitAtribuicoes = {};
    }

    splitPessoas.push({
        id: `p-${Date.now()}-${splitPessoas.length}`,
        nome: nome.trim(),
    });
    if (campo) campo.value = '';
    renderizarDivisaoConta();
}

function removerPessoaDivisao(idPessoa) {
    if (splitPessoas.length === 1) return;

    splitPessoas = splitPessoas.filter(pessoa => pessoa.id !== idPessoa);
    Object.keys(splitAtribuicoes).forEach(key => {
        if (Array.isArray(splitAtribuicoes[key])) {
            splitAtribuicoes[key] = {};
            return;
        }

        delete splitAtribuicoes[key][idPessoa];
    });
    renderizarDivisaoConta();
}

function obterAtribuicoesItem(keyItem) {
    const atribuicoes = splitAtribuicoes[keyItem];

    if (!atribuicoes || Array.isArray(atribuicoes)) {
        return {};
    }

    return atribuicoes;
}

function obterQuantidadeAtribuida(item, idPessoa) {
    return Number(obterAtribuicoesItem(item.key)[idPessoa] || 0);
}

function obterTotalQuantidadeAtribuida(item) {
    return Object.values(obterAtribuicoesItem(item.key)).reduce((total, quantidade) => total + Number(quantidade || 0), 0);
}

function pessoaTemAtribuicaoEspecifica(idPessoa) {
    return Object.values(splitAtribuicoes).some(atribuicoes => {
        if (!atribuicoes || Array.isArray(atribuicoes)) return false;
        return Number(atribuicoes[idPessoa] || 0) > 0;
    });
}

function obterPessoasNoRateioGeral(listaPessoas = splitPessoas) {
    return listaPessoas.filter(pessoa => !pessoaTemAtribuicaoEspecifica(pessoa.id));
}

function obterPessoasRateioRestanteItem(item, listaPessoas = splitPessoas) {
    const atribuicoes = obterAtribuicoesItem(item.key);
    const itemTemAtribuicao = Object.values(atribuicoes).some(quantidade => Number(quantidade || 0) > 0);

    if (itemTemAtribuicao) {
        return listaPessoas.filter(pessoa => Number(atribuicoes[pessoa.id] || 0) === 0);
    }

    return obterPessoasNoRateioGeral(listaPessoas);
}

function obterQuantidadePendenteItem(item) {
    const quantidadeAtribuida = obterTotalQuantidadeAtribuida(item);
    const quantidadeRestante = Math.max(Number(item.quantidade || 0) - quantidadeAtribuida, 0);
    if (quantidadeRestante === 0) return 0;

    const pessoasNoRateioRestante = obterPessoasRateioRestanteItem(item);

    return pessoasNoRateioRestante.length ? 0 : quantidadeRestante;
}

function itemEstaComDivisaoCompleta(item) {
    if (splitPessoas.length === 1) return true;
    return obterQuantidadePendenteItem(item) === 0;
}

function atualizarQuantidadeAtribuida(keyItem, idPessoa, quantidade) {
    const item = obterItensMesaAtual().find(itemMesa => itemMesa.key === keyItem);
    if (!item) return 0;

    const quantidadeNormalizada = Math.max(0, Math.floor(Number(quantidade || 0)));
    const atribuicoes = { ...obterAtribuicoesItem(keyItem) };
    const totalOutrasPessoas = Object.entries(atribuicoes).reduce((total, [id, qtd]) => {
        return id === idPessoa ? total : total + Number(qtd || 0);
    }, 0);
    const quantidadeMaxima = Math.max(Number(item.quantidade || 0) - totalOutrasPessoas, 0);
    const quantidadeFinal = Math.min(quantidadeNormalizada, quantidadeMaxima);

    if (quantidadeFinal > 0) {
        atribuicoes[idPessoa] = quantidadeFinal;
    } else {
        delete atribuicoes[idPessoa];
    }

    splitAtribuicoes[keyItem] = atribuicoes;
    renderizarResumoDivisao();
    return quantidadeFinal;
}

function calcularDivisao() {
    const itens = obterItensMesaAtual();
    const resumoMesa = obterResumoMesa();
    const resumoPessoas = splitPessoas.map(pessoa => ({
        ...pessoa,
        itens: [],
        subtotal: 0,
        servico: 0,
        couvert: 0,
        total: 0,
    }));

    if (splitPessoas.length === 1) {
        const pessoa = resumoPessoas[0];

        itens.forEach(item => {
            const quantidadeItem = Number(item.quantidade || 0);
            const valorItem = quantidadeItem * Number(item.precoUnitario || 0);

            pessoa.subtotal += valorItem;
            pessoa.itens.push({
                descricao: `${item.nome} x${quantidadeItem}`,
                valor: valorItem,
            });
        });

        pessoa.servico = resumoMesa.servico;
        pessoa.couvert = resumoMesa.couvert;
        pessoa.total = pessoa.subtotal + pessoa.servico + pessoa.couvert;

        return resumoPessoas;
    }

    itens.forEach(item => {
        const atribuicoes = obterAtribuicoesItem(item.key);
        const precoUnitario = Number(item.precoUnitario || 0);
        let quantidadeAtribuida = 0;
        const idsPessoasComAtribuicao = [];

        Object.entries(atribuicoes).forEach(([idPessoa, quantidade]) => {
            const pessoa = resumoPessoas.find(p => p.id === idPessoa);
            if (!pessoa) return;

            const quantidadePessoa = Math.max(0, Number(quantidade || 0));
            if (quantidadePessoa === 0) return;

            const valorPessoa = quantidadePessoa * precoUnitario;
            quantidadeAtribuida += quantidadePessoa;
            idsPessoasComAtribuicao.push(idPessoa);
            pessoa.subtotal += valorPessoa;
            pessoa.itens.push({
                descricao: `${item.nome} x${quantidadePessoa}`,
                valor: valorPessoa,
            });
        });

        const quantidadeRestante = Math.max(Number(item.quantidade || 0) - quantidadeAtribuida, 0);
        if (quantidadeRestante === 0 || !splitPessoas.length) return;

        const pessoasRateioRestante = obterPessoasRateioRestanteItem(item, resumoPessoas).filter(pessoa => {
            return !idsPessoasComAtribuicao.includes(pessoa.id);
        });

        if (!pessoasRateioRestante.length) return;

        const valorRestantePorPessoa = (quantidadeRestante * precoUnitario) / pessoasRateioRestante.length;
        pessoasRateioRestante.forEach(pessoaResumo => {
            pessoaResumo.subtotal += valorRestantePorPessoa;
            pessoaResumo.itens.push({
                descricao: `${item.nome} x${quantidadeRestante} ÷ ${pessoasRateioRestante.length}`,
                valor: valorRestantePorPessoa,
            });
        });
    });

    resumoPessoas.forEach(pessoa => {
        const proporcao = resumoMesa.subtotal > 0 ? pessoa.subtotal / resumoMesa.subtotal : 0;
        pessoa.servico = resumoMesa.servico * proporcao;
        pessoa.couvert = splitPessoas.length ? resumoMesa.couvert / splitPessoas.length : 0;
        pessoa.total = pessoa.subtotal + pessoa.servico + pessoa.couvert;
    });

    return resumoPessoas;
}

function renderizarResumoDivisao() {
    const listaResumo = document.getElementById('split-summary-list');
    if (!listaResumo) return;

    const resumoPessoas = calcularDivisao();
    listaResumo.innerHTML = resumoPessoas.map(pessoa => `
        <div class="split-item-card">
            <h4 class="split-item-title">${escaparHTML(pessoa.nome)}</h4>
            <div class="split-person-items">
                ${pessoa.itens.length ? pessoa.itens.map(item => `
                    <div class="summary-row split-summary-row">
                        <span class="split-item-meta">${escaparHTML(item.descricao)}</span>
                        <span>R$ ${formatarValor(item.valor)}</span>
                    </div>
                `).join('') : '<p class="split-item-meta">Nenhum item atribuído.</p>'}
            </div>
            <div class="summary-section split-person-total">
                <div class="summary-row">
                    <span>Subtotal</span>
                    <span>R$ ${formatarValor(pessoa.subtotal)}</span>
                </div>
                <div class="summary-row">
                    <span>Serviço</span>
                    <span>R$ ${formatarValor(pessoa.servico)}</span>
                </div>
                <div class="summary-row">
                    <span>Couvert</span>
                    <span>R$ ${formatarValor(pessoa.couvert)}</span>
                </div>
                <div class="summary-row grand-total">
                    <span>Total</span>
                    <span>R$ ${formatarValor(pessoa.total)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function renderizarDivisaoConta() {
    if (!mesaAtual) return;

    const itens = obterItensMesaAtual();
    const resumoMesa = obterResumoMesa();
    const itensAtribuidos = splitPessoas.length === 1
        ? itens.length
        : itens.filter(item => itemEstaComDivisaoCompleta(item)).length;

    document.getElementById('split-total-mesa').textContent = `Mesa ${mesaAtual.numero} - Total R$ ${formatarValor(resumoMesa.total)}`;
    document.getElementById('split-count').textContent = `(${itensAtribuidos}/${itens.length})`;

    document.getElementById('split-people-list').innerHTML = splitPessoas.map(pessoa => `
        <div class="split-person-row">
            <span class="split-person-name">${escaparHTML(pessoa.nome)}</span>
            <button class="split-delete-btn btn btn-delete btn-xs" onclick="removerPessoaDivisao('${pessoa.id}')" ${splitPessoas.length === 1 ? 'disabled' : ''}>Remover</button>
        </div>
    `).join('');

    const listaItens = document.getElementById('split-items-list');
    if (!itens.length) {
        listaItens.innerHTML = '<p class="empty-state">Nenhum item para dividir nessa mesa.</p>';
    } else {
        listaItens.innerHTML = itens.map(item => {
            const quantidadeAtribuida = obterTotalQuantidadeAtribuida(item);
            const quantidadeRestante = Math.max(Number(item.quantidade || 0) - quantidadeAtribuida, 0);
            const pessoasNoRateioRestante = obterPessoasRateioRestanteItem(item).length;
            const quantidadePendente = obterQuantidadePendenteItem(item);
            let status = 'Sem atribuição: todas as unidades são divididas entre as pessoas no rateio geral.';
            let statusClasse = '';

            if (splitPessoas.length === 1) {
                status = `Com uma pessoa, todas as unidades ficam para ${escaparHTML(splitPessoas[0].nome)}.`;
            } else if (quantidadeAtribuida > 0 && quantidadeRestante > 0) {
                if (quantidadePendente > 0) {
                    status = `${quantidadeAtribuida}/${item.quantidade} atribuído(s). Ainda faltam ${quantidadePendente} unidade(s) de ${escaparHTML(item.nome)} para atribuir a alguém.`;
                    statusClasse = ' split-item-status-warning';
                } else {
                    status = `${quantidadeAtribuida}/${item.quantidade} atribuído(s). ${quantidadeRestante} unidade(s) dividida(s) entre ${pessoasNoRateioRestante} pessoa(s) no rateio geral.`;
                }
            } else if (quantidadeAtribuida >= Number(item.quantidade || 0)) {
                status = `${quantidadeAtribuida}/${item.quantidade} atribuído(s).`;
            } else if (quantidadePendente > 0) {
                status = `Ainda faltam ${quantidadePendente} unidade(s) de ${escaparHTML(item.nome)} para atribuir a alguém.`;
                statusClasse = ' split-item-status-warning';
            }

            return `
                <div class="split-item-card">
                    <div class="split-item-header">
                        <div>
                            <h4 class="split-item-title">${escaparHTML(item.nome)}</h4>
                            <p class="split-item-meta">Qtd: ${item.quantidade} | Pedidos #${item.pedidoIds.join(', #')}</p>
                        </div>
                        <span class="split-item-price">R$ ${formatarValor(item.precoTotal)}</span>
                    </div>
                    <div class="split-item-status${statusClasse}">${status}</div>
                    <div class="split-assignees">
                        ${splitPessoas.map(pessoa => `
                            <label class="split-qty">
                                <span>${escaparHTML(pessoa.nome)}</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="${Number(item.quantidade || 0) - quantidadeAtribuida + obterQuantidadeAtribuida(item, pessoa.id)}"
                                    step="1"
                                    value="${obterQuantidadeAtribuida(item, pessoa.id)}"
                                    oninput="this.value = atualizarQuantidadeAtribuida('${item.key}', '${pessoa.id}', this.value)"
                                    onchange="renderizarDivisaoConta()"
                                >
                            </label>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    renderizarResumoDivisao();
}

document.addEventListener('DOMContentLoaded', () => {
    restaurarSessaoCliente();

    ['login-cliente-nome', 'login-cliente-telefone', 'login-cliente-mesa'].forEach(id => {
        const campo = document.getElementById(id);
        campo.addEventListener('keydown', event => {
            if (event.key === 'Enter') entrarCliente();
        });
    });

    const campoNovaPessoa = document.getElementById('split-nova-pessoa');
    campoNovaPessoa.addEventListener('keydown', event => {
        if (event.key === 'Enter') adicionarPessoaDivisao();
    });
});
