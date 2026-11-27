// Esta função serve para as 3 páginas de categoria (moletom, camisa e tênis).
// A categoria vem do atributo data-categoria da <section> no HTML.
async function carregarMoletons() {
    const lista = document.querySelector('#lista-moletons');
    if (!lista) return;

    const categoria = lista.dataset.categoria || 'Moletom';
    const nomeCategoria = lista.dataset.nome || 'produtos';

    lista.replaceChildren();
    const carregando = document.createElement('p');
    carregando.className = 'mensagem-produtos';
    carregando.textContent = `Carregando ${nomeCategoria}...`;
    lista.appendChild(carregando);

    try {
        const resposta = await fetch(`/api/produtos?categoria=${encodeURIComponent(categoria)}&limite=100`);
        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
            throw new Error(dados.mensagem || 'Não foi possível carregar os produtos.');
        }

        const produtos = Array.isArray(dados.produtos) ? dados.produtos : [];
        lista.replaceChildren();

        if (!produtos.length) {
            const vazio = document.createElement('p');
            vazio.className = 'mensagem-produtos';
            vazio.textContent = `Nenhum produto em ${nomeCategoria} no momento.`;
            lista.appendChild(vazio);
            return;
        }

        produtos.forEach(produto => {
            const artigo = document.createElement('article');
            artigo.className = 'prod';

            const caixaImagem = document.createElement('div');
            caixaImagem.className = 'imagem-prod';

            const link = document.createElement('a');
            link.className = 'util';
            link.href = `../html/produto.html?id=${encodeURIComponent(produto.id)}`;

            const imagem = document.createElement('img');
            const caminho = produto.imagens?.frente || produto.imagem || `produto${produto.id}.png`;
            imagem.src = /^(https?:|data:|blob:|\/)/i.test(String(caminho))
                ? String(caminho).replace(/^\/img\//, '/img/')
                : `/img/${String(caminho).replace(/^\.\.\/img\//, '').replace(/^img\//, '')}`;
            imagem.alt = produto.nome || 'Moletom DRIPLAB';
            imagem.loading = 'lazy';
            imagem.onerror = () => {
                imagem.onerror = null;
                imagem.src = '../img/produto1.png';
            };
            link.appendChild(imagem);

            const botao = document.createElement('button');
            botao.type = 'button';
            botao.className = 'carrinho';
            botao.setAttribute('aria-label', `Escolher tamanho de ${produto.nome}`);

            const icone = document.createElement('img');
            icone.src = '../img/carrinho.png';
            icone.alt = '';
            botao.appendChild(icone);

            // O tamanho é obrigatório: o botão leva para a página do produto,
            // onde a pessoa escolhe o tamanho e adiciona ao carrinho.
            botao.addEventListener('click', event => {
                event.preventDefault();
                event.stopPropagation();
                window.location.href = link.href;
            });

            caixaImagem.append(link, botao);

            const info = document.createElement('div');
            info.className = 'info';

            const nome = document.createElement('p');
            nome.className = 'nome-prod';
            nome.textContent = produto.nome;

            const preco = document.createElement('p');
            preco.className = 'preco';
            preco.textContent = Number(produto.preco).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });

            const estrelas = document.createElement('div');
            estrelas.className = 'estrelas';
            estrelas.textContent = '★★★★★';

            const avaliacoes = document.createElement('p');
            avaliacoes.className = 'avaliacoes';
            avaliacoes.textContent = 'Produto DRIPLAB';

            info.append(nome, preco, estrelas, avaliacoes);
            artigo.append(caixaImagem, info);
            lista.appendChild(artigo);
        });
    } catch (erro) {
        lista.replaceChildren();
        const mensagem = document.createElement('p');
        mensagem.className = 'mensagem-produtos';
        mensagem.textContent = `Não foi possível carregar ${nomeCategoria}. Verifique se o servidor está ligado.`;
        lista.appendChild(mensagem);
        console.error(erro);
    }
}

document.addEventListener('DOMContentLoaded', carregarMoletons);
