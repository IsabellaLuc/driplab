// Deixa o texto minúsculo e sem acento (ex.: "Tênis" -> "tenis") para a pesquisa
function semAcento(texto) {
    return String(texto).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

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
        let produtos = Array.isArray(dados.produtos) ? dados.produtos : [];

        // PESQUISA: home.html?busca=texto mostra só os produtos encontrados
        const busca = new URLSearchParams(location.search).get('busca');

        if (busca) {
            const termo = semAcento(busca);
            produtos = produtos.filter(produto =>
                semAcento(`${produto.nome} ${produto.categoria} ${produto.descricao || ''}`).includes(termo)
            );

            const titulo = document.querySelector('#maisvendidos .subtit');
            if (titulo) titulo.textContent = `Resultados para "${busca}"`;

            const campo = document.querySelector('#campo-pesquisa');
            if (campo) campo.value = busca;
        }

        carrossel.replaceChildren();

        if (produtos.length === 0) {
            const mensagem = document.createElement('p');
            mensagem.className = 'mensagem-produtos';
            mensagem.textContent = busca
                ? `Nenhum produto encontrado para "${busca}".`
                : 'Nenhum produto cadastrado no momento.';
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
            const caminho = produto.imagens?.frente || produto.imagem || `produto${produto.id}.png`;
            imagem.src = /^(https?:|data:|blob:|\/)/i.test(String(caminho))
                ? String(caminho).replace(/^\/img\//, '/img/')
                : `/img/${String(caminho).replace(/^\.\.\/img\//, '').replace(/^img\//, '')}`;
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
