

function navigate(pagina) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    document.querySelector(`[pagina='${pagina}']`).classList.add('active');

    document.querySelectorAll('.admin-content > section').forEach(s => s.classList.add('hidden'));

    document.querySelector(`.section-${pagina}`).classList.remove('hidden');
}
