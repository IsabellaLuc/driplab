const parametrosProduto = new URLSearchParams(location.search);
const idProduto = parametrosProduto.get('id');

function caminhoImagem(caminho, alternativa = '') {
    let valor = String(caminho || alternativa || '').trim();
    if (!valor) return '';
    if (/^(https?:|data:|blob:)/i.test(valor)) return valor;
    valor = valor.replace(/\\/g, '/');
    if (valor.startsWith('../img/')) return `/img/${valor.slice(7)}`;
    if (valor.startsWith('img/')) return `/${valor}`;
    if (valor.startsWith('/')) return valor;
    return `/img/${valor.replace(/^\.\//, '')}`;
}

function lerCarrinho() {
    try {
        const itens = JSON.parse(localStorage.getItem('carrinho') || '[]');
        return Array.isArray(itens) ? itens : [];
    } catch {
        return [];
    }
}

function configurarGaleria(produto) {
    const miniaturas = document.querySelector('.miniaturas');
    const principal = document.querySelector('.imagem-principal img');
    if (!miniaturas || !principal) return;

    const imagens = produto.imagens && typeof produto.imagens === 'object'
        ? produto.imagens
        : {};
    const idNumerico = Number(produto.id);
    const imagemPrincipal = caminhoImagem(
        imagens.frente || produto.imagem,
        `produto${produto.id}.png`
    );
    const galeria = [{ caminho: imagemPrincipal, descricao: 'Imagem principal do produto' }];

    if (Number.isInteger(idNumerico) && idNumerico >= 1 && idNumerico <= 4) {
        for (let indice = 1; indice <= 3; indice++) {
            galeria.push({
                caminho: `/img/produto${idNumerico}-detalhe-${indice}.jpg`,
                descricao: `Detalhe ${indice} do produto`
            });
        }
    } else {
        ['lateral', 'costas', 'detalhe'].forEach(chave => {
            if (imagens[chave]) {
                galeria.push({
                    caminho: caminhoImagem(imagens[chave]),
                    descricao: chave === 'detalhe' ? 'Detalhe do produto' :
                        chave === 'lateral' ? 'Vista lateral do produto' : 'Vista das costas do produto'
                });
            }
        });
    }

    miniaturas.replaceChildren();
    galeria.forEach((item, indice) => {
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = `miniatura${indice === 0 ? ' selecionada' : ''}`;
        botao.setAttribute('aria-label', item.descricao);

        const imagem = document.createElement('img');
        imagem.src = item.caminho;
        imagem.alt = item.descricao;
        imagem.onerror = () => botao.remove();

        botao.appendChild(imagem);
        botao.addEventListener('click', () => {
            principal.src = item.caminho;
            principal.alt = item.descricao;
            miniaturas.querySelectorAll('.miniatura').forEach(el => el.classList.remove('selecionada'));
            botao.classList.add('selecionada');
        });
        miniaturas.appendChild(botao);
    });

    principal.onerror = () => {
        principal.onerror = null;
        principal.src = `/img/produto${produto.id}.png`;
        principal.onerror = () => {
            principal.onerror = null;
            principal.src = '/img/produto1.png';
        };
    };
    principal.src = imagemPrincipal;
    principal.alt = 'Imagem principal do produto';
}

async function carregarProduto() {
    const titulo = document.querySelector('.informacoes-produto h1');
    const preco = document.querySelector('.preco span');
    const descricao = document.querySelector('.descricao');

    if (!idProduto) {
        if (titulo) titulo.textContent = 'Produto não encontrado';
        if (descricao) descricao.textContent = 'Volte à categoria Moletom e selecione um produto.';
        return;
    }

    try {
        const resposta = await fetch(`/api/produtos/${encodeURIComponent(idProduto)}`);
        const produto = await resposta.json().catch(() => ({}));
        if (!resposta.ok) throw new Error(produto.mensagem || 'Produto não encontrado.');

        if (titulo) titulo.textContent = produto.nome;
        if (preco) {
            preco.textContent = Number(produto.preco).toLocaleString('pt-BR', {
                style: 'currency', currency: 'BRL'
            });
        }
        if (descricao) descricao.textContent = produto.descricao || '';
        document.title = `DRIPLAB — ${produto.nome}`;
        configurarGaleria(produto);

        const formulario = document.querySelector('#form-produto');
        if (!formulario) return;
        formulario.addEventListener('submit', event => {
            event.preventDefault();
            const tamanho = formulario.querySelector('input[name="tamanho"]:checked')?.value;
            if (!tamanho) {
                alert('Selecione um tamanho.');
                return;
            }

            const itens = lerCarrinho();
            const existente = itens.find(item =>
                Number(item.produto_id) === Number(produto.id) && item.tamanho === tamanho
            );
            if (existente) {
                existente.quantidade = Number(existente.quantidade || 1) + 1;
            } else {
                itens.push({
                    produto_id: produto.id,
                    slug: String(produto.id),
                    nome: produto.nome,
                    preco: Number(produto.preco),
                    imagem: caminhoImagem(produto.imagens?.frente || produto.imagem, `produto${produto.id}.png`),
                    tamanho,
                    quantidade: 1
                });
            }
            localStorage.setItem('carrinho', JSON.stringify(itens));
            alert('Produto adicionado ao carrinho!');
        });
    } catch (erro) {
        if (titulo) titulo.textContent = 'Produto indisponível';
        if (descricao) descricao.textContent = erro.message;
    }
}

document.addEventListener('DOMContentLoaded', carregarProduto);
