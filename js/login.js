const formulario = document.querySelector('#form-login');

if (formulario) {
    formulario.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.querySelector('#email').value.trim();
        const senha = document.querySelector('#senha').value;

        try {
            const resposta = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(dados.mensagem || 'Não foi possível entrar.');
            }

            localStorage.setItem('token', dados.token);
            localStorage.setItem('usuario', JSON.stringify(dados.usuario));
            // Volta para a página de onde a pessoa veio (ex.: carrinho)
            const voltar = new URLSearchParams(location.search).get('voltar');
            window.location.href = /^[a-z]+\.html$/.test(voltar || '') ? voltar : 'home.html';
        } catch (erro) {
            alert(erro.message === 'Failed to fetch'
                ? 'Não foi possível conectar ao servidor.'
                : erro.message);
        }
    });
}

// "Esqueci minha senha": ainda não existe recuperação automática,
// então mostra como falar com o atendimento.
document.querySelector('#esqueci-senha')?.addEventListener('click', (event) => {
    event.preventDefault();
    alert('Para recuperar sua senha, fale com o nosso SAC:\n21 96763 2288 ou 21 97962 0717.');
});
