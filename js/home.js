async function carregarProdutos() {
    const carrossel = document.querySelector('.carrossel');
    if (!carrossel) return;

    carrossel.replaceChildren();
    const carregando = document.createElement('p');
    carregando.className = 'mensagem-produtos';
    carregando.textContent = 'Carregando produtos...';
    carrossel.appendChild(carregando);

    try {
        const resposta = await fetch('/api/produtos?limite=100');

        if (!resposta.ok) {
            const erroServidor = await resposta.json().catch(() => ({}));
            throw new Error(erroServidor.mensagem || `Erro HTTP ${resposta.status}`);
        }

        const dados = await resposta.json();
        const produtos = Array.isArray(dados.produtos) ? dados.produtos : [];

        carrossel.replaceChildren();

        if (produtos.length === 0) {
            const mensagem = document.createElement('p');
            mensagem.className = 'mensagem-produtos';
            mensagem.textContent = 'Nenhum produto cadastrado no momento.';
            carrossel.appendChild(mensagem);
            return;
        }

        produtos.forEach((produto) => {
            const card = document.createElement('div');
            card.className = 'produto';

            const link = document.createElement('a');
            link.className = 'util';
            link.href = `../html/produto.html?id=${encodeURIComponent(produto.id)}`;

            const imagem = document.createElement('img');
            imagem.src = produto.imagem || '../img/produto1.png';
            imagem.alt = produto.nome || 'Produto DRIPLAB';
            imagem.loading = 'lazy';
            imagem.onerror = () => {
                imagem.onerror = null;
                imagem.src = '../img/produto1.png';
            };

            const preco = document.createElement('p');
            const valor = Number(produto.preco);
            preco.textContent = Number.isFinite(valor)
                ? valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                : 'Preço indisponível';

            const botao = document.createElement('span');
            botao.className = 'botao-produto';
            botao.textContent = 'Ver produto';

            link.append(imagem, preco, botao);
            card.appendChild(link);
            carrossel.appendChild(card);
        });
    } catch (erro) {
        console.error('Erro ao carregar produtos:', erro);
        carrossel.replaceChildren();

        const mensagem = document.createElement('p');
        mensagem.className = 'mensagem-produtos';
        mensagem.textContent = 'Não foi possível carregar os produtos. Verifique se o servidor está ligado.';
        carrossel.appendChild(mensagem);
    }
}

document.addEventListener('DOMContentLoaded', carregarProdutos);
