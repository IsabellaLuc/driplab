(() => {
    const token = localStorage.getItem('token');
    let usuario = null;

    try {
        usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    } catch {
        usuario = null;
    }

    if (!token || !usuario || usuario.tipo !== 'administrador') {
        alert('Acesso permitido somente para administradores.');
        window.location.replace('index.html');
        return;
    }

    const API = '/api';
    const formulario = document.querySelector('#form-produto');
    const tabela = document.querySelector('#tabela-produtos');
    const mensagem = document.querySelector('#mensagem');
    const filtroNome = document.querySelector('#filtro-nome');
    const campoId = document.querySelector('#produto-id');
    const btnSalvar = document.querySelector('#btn-salvar');
    const btnCancelar = document.querySelector('#btn-cancelar-edicao');
    const linhaAtivo = document.querySelector('#linha-ativo');
    let produtos = [];

    document.querySelector('#nome-admin').textContent =
        `Olá, ${usuario.nome || 'administrador'}`;

    function mostrarMensagem(texto, tipo = 'sucesso') {
        mensagem.textContent = texto;
        mensagem.className = `mensagem visivel ${tipo}`;
        window.clearTimeout(mostrarMensagem.timer);
        mostrarMensagem.timer = window.setTimeout(() => {
            mensagem.className = 'mensagem';
            mensagem.textContent = '';
        }, 5000);
    }

    async function requisicao(url, opcoes = {}) {
        const resposta = await fetch(url, {
            ...opcoes,
            headers: {
                ...(opcoes.headers || {}),
                Authorization: `Bearer ${token}`,
                ...(opcoes.body ? { 'Content-Type': 'application/json' } : {})
            }
        });

        const dados = await resposta.json().catch(() => ({}));

        if (resposta.status === 401 || resposta.status === 403) {
            throw new Error(dados.mensagem || 'Sua sessão não tem autorização. Entre novamente com uma conta administradora.');
        }

        if (!resposta.ok) {
            throw new Error(dados.mensagem || `Erro na solicitação (${resposta.status}).`);
        }

        return dados;
    }

    function criarCelula(texto) {
        const td = document.createElement('td');
        td.textContent = texto ?? '—';
        return td;
    }

    function renderizarProdutos() {
        const termo = filtroNome.value.trim().toLocaleLowerCase('pt-BR');
        const filtrados = produtos.filter(produto =>
            String(produto.nome || '').toLocaleLowerCase('pt-BR').includes(termo)
        );

        tabela.replaceChildren();

        if (!filtrados.length) {
            const linha = document.createElement('tr');
            const celula = criarCelula('Nenhum produto encontrado.');
            celula.colSpan = 6;
            celula.className = 'vazio';
            linha.appendChild(celula);
            tabela.appendChild(linha);
            return;
        }

        filtrados.forEach(produto => {
            const linha = document.createElement('tr');

            const tdProduto = document.createElement('td');
            const blocoProduto = document.createElement('div');
            blocoProduto.className = 'produto-celula';

            const imagem = document.createElement('img');
            imagem.src = produto.imagens?.frente || produto.imagem || `../img/produto${produto.id}.png`;
            imagem.alt = '';
            imagem.onerror = () => {
                imagem.onerror = null;
                imagem.src = '../img/produto1.png';
            };

            const nome = document.createElement('span');
            nome.textContent = produto.nome || 'Produto sem nome';
            blocoProduto.append(imagem, nome);
            tdProduto.appendChild(blocoProduto);

            const preco = Number(produto.preco);
            const tdPreco = criarCelula(Number.isFinite(preco)
                ? preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                : '—');

            const tdStatus = document.createElement('td');
            const status = document.createElement('span');
            status.className = `status ${produto.ativo ? 'ativo' : 'inativo'}`;
            status.textContent = produto.ativo ? 'Ativo' : 'Inativo';
            tdStatus.appendChild(status);

            const tdAcoes = document.createElement('td');
            const acoes = document.createElement('div');
            acoes.className = 'acoes-tabela';

            const editar = document.createElement('button');
            editar.type = 'button';
            editar.className = 'btn-editar';
            editar.textContent = 'Editar';
            editar.addEventListener('click', () => preencherFormulario(produto));

            const excluir = document.createElement('button');
            excluir.type = 'button';
            excluir.className = 'btn-excluir';
            excluir.textContent = produto.ativo ? 'Desativar' : 'Excluir';
            excluir.disabled = !produto.ativo;
            excluir.title = produto.ativo ? 'Desativar produto da loja' : 'Produto já está inativo';
            excluir.addEventListener('click', () => desativarProduto(produto.id));

            acoes.append(editar, excluir);
            tdAcoes.appendChild(acoes);

            linha.append(
                tdProduto,
                criarCelula(produto.categoria),
                tdPreco,
                criarCelula(String(produto.estoque ?? 0)),
                tdStatus,
                tdAcoes
            );
            tabela.appendChild(linha);
        });
    }

    async function carregarProdutos() {
        tabela.innerHTML = '<tr><td colspan="6" class="vazio">Carregando produtos...</td></tr>';

        try {
            const dados = await requisicao(`${API}/admin/produtos`);
            produtos = Array.isArray(dados.produtos) ? dados.produtos : [];
            renderizarProdutos();
        } catch (erro) {
            tabela.innerHTML = '<tr><td colspan="6" class="vazio">Não foi possível carregar os produtos.</td></tr>';
            mostrarMensagem(erro.message, 'erro');
        }
    }

    function obterDadosFormulario() {
        return {
            nome: document.querySelector('#nome').value.trim(),
            descricao: document.querySelector('#descricao').value.trim(),
            preco: Number(document.querySelector('#preco').value),
            categoria: document.querySelector('#categoria').value.trim(),
            imagem: document.querySelector('#imagem').value.trim(),
            imagens: {
                frente: document.querySelector('#imagem').value.trim(),
                lateral: document.querySelector('#imagem-lateral').value.trim(),
                costas: document.querySelector('#imagem-costas').value.trim(),
                detalhe: document.querySelector('#imagem-detalhe').value.trim()
            },
            tamanho: document.querySelector('#tamanho').value || null,
            cor: document.querySelector('#cor').value.trim(),
            estoque: Number(document.querySelector('#estoque').value)
        };
    }

    function preencherFormulario(produto) {
        campoId.value = produto.id;
        document.querySelector('#nome').value = produto.nome || '';
        document.querySelector('#descricao').value = produto.descricao || '';
        document.querySelector('#preco').value = produto.preco ?? '';
        document.querySelector('#categoria').value = produto.categoria || '';
        const imagens = produto.imagens || {};
        document.querySelector('#imagem').value = imagens.frente || produto.imagem || '';
        document.querySelector('#imagem-lateral').value = imagens.lateral || '';
        document.querySelector('#imagem-costas').value = imagens.costas || '';
        document.querySelector('#imagem-detalhe').value = imagens.detalhe || '';
        document.querySelector('#tamanho').value = produto.tamanho || '';
        document.querySelector('#cor').value = produto.cor || '';
        document.querySelector('#estoque').value = produto.estoque ?? 0;
        document.querySelector('#ativo').checked = Boolean(produto.ativo);
        linhaAtivo.hidden = false;
        document.querySelector('#titulo-formulario').textContent = `Editar: ${produto.nome}`;
        btnSalvar.textContent = 'Salvar alterações';
        btnCancelar.hidden = false;
        formulario.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function limparFormulario() {
        formulario.reset();
        document.querySelector('#categoria').value = 'Moletom';
        campoId.value = '';
        document.querySelector('#estoque').value = 0;
        linhaAtivo.hidden = true;
        document.querySelector('#titulo-formulario').textContent = 'Adicionar produto';
        btnSalvar.textContent = 'Cadastrar produto';
        btnCancelar.hidden = true;
    }

    formulario.addEventListener('submit', async event => {
        event.preventDefault();

        const dados = obterDadosFormulario();
        if (!dados.nome || !['Moletom', 'Camiseta', 'Tenis'].includes(dados.categoria) || !Number.isFinite(dados.preco) ||
            dados.preco <= 0 || !Number.isInteger(dados.estoque) || dados.estoque < 0) {
            mostrarMensagem('Confira nome, categoria, preço e estoque.', 'erro');
            return;
        }

        const id = campoId.value;
        if (id) dados.ativo = document.querySelector('#ativo').checked;

        btnSalvar.disabled = true;

        try {
            const resultado = await requisicao(
                id ? `${API}/produtos/${encodeURIComponent(id)}` : `${API}/produtos`,
                {
                    method: id ? 'PATCH' : 'POST',
                    body: JSON.stringify(dados)
                }
            );

            mostrarMensagem(resultado.mensagem || (id ? 'Produto atualizado.' : 'Produto cadastrado.'));
            limparFormulario();
            await carregarProdutos();
        } catch (erro) {
            mostrarMensagem(erro.message, 'erro');
        } finally {
            btnSalvar.disabled = false;
        }
    });

    async function desativarProduto(id) {
        const produto = produtos.find(item => String(item.id) === String(id));
        if (!produto || !produto.ativo) return;

        if (!window.confirm(`Deseja desativar "${produto.nome}"? Ele deixará de aparecer na loja, mas continuará no banco de dados.`)) {
            return;
        }

        try {
            const resultado = await requisicao(`${API}/produtos/${encodeURIComponent(id)}`, {
                method: 'DELETE'
            });
            mostrarMensagem(resultado.mensagem || 'Produto desativado.');
            await carregarProdutos();
        } catch (erro) {
            mostrarMensagem(erro.message, 'erro');
        }
    }

    document.querySelector('#btn-limpar').addEventListener('click', limparFormulario);
    btnCancelar.addEventListener('click', limparFormulario);
    document.querySelector('#btn-atualizar').addEventListener('click', carregarProdutos);
    filtroNome.addEventListener('input', renderizarProdutos);

    document.querySelector('#btn-sair').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = 'index.html';
    });

    carregarProdutos();
})();
