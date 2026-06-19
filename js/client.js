
function navegarPaginas(pagina) {
    document.querySelectorAll('#paginas-cliente .tab-btn').forEach(btn => btn.classList.remove('active'))
    document.querySelector(`[data-tab='${pagina}']`).classList.add('active')

    document.querySelectorAll('.client-content > section').forEach(pag => pag.classList.add('hidden'))
    document.getElementById(`tab-${pagina}`).classList.remove('hidden')
}