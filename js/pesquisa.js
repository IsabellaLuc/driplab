(() => {
    const formulario = document.querySelector('#form-pesquisa');
    const campoPesquisa = document.querySelector('#campo-pesquisa');

    if (!formulario || !campoPesquisa) {
        return;
    }

    formulario.addEventListener('submit', function(evento) {
        evento.preventDefault();

        const pesquisa = campoPesquisa.value.trim();

        if (pesquisa === '') {
            return;
        }

        // A pesquisa procura em TODOS os produtos da loja:
        // vai para a home, que mostra o resultado em "Mais vendidos".
        window.location.href = `../html/home.html?busca=${encodeURIComponent(pesquisa)}#maisvendidos`;
    });
})();
