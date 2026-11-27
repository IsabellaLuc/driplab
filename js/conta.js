const token = localStorage.getItem('token');
const statusConta = document.getElementById('conta-status');

function sair() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    location.href = 'index.html';
}

if (!token) {
    location.href = 'index.html';
} else {
    fetch('/api/usuarios/me', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then(async (r) => {
            const d = await r.json();

            if (!r.ok) {
                throw new Error(d.mensagem || 'Não foi possível carregar a conta.');
            }

            document.getElementById('conta-nome').textContent = d.nome || '—';
            document.getElementById('conta-username').textContent = d.username || '—';
            document.getElementById('conta-email').textContent = d.email || '—';
            document.getElementById('conta-telefone').textContent = d.telefone || '—';

            const acessoAdm = document.getElementById('conta-acesso-adm');
            acessoAdm.hidden = d.tipo !== 'administrador';

            localStorage.setItem('usuario', JSON.stringify({
                id: d.id,
                nome: d.nome,
                username: d.username,
                email: d.email,
                telefone: d.telefone,
                tipo: d.tipo
            }));

            statusConta.textContent = 'Informações da sua conta DRIPLAB';
        })
        .catch((e) => {
            statusConta.textContent = e.message;
        });
}

document.getElementById('conta-sair')?.addEventListener('click', sair);

document.getElementById('conta-excluir')?.addEventListener('click', async () => {
    if (!confirm('Tem certeza de que deseja excluir sua conta? Essa ação não poderá ser desfeita.')) {
        return;
    }

    try {
        const r = await fetch('/api/usuarios/me', {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const d = await r.json();

        if (!r.ok) {
            throw new Error(d.mensagem || 'Não foi possível excluir a conta.');
        }

        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        alert('Sua conta foi excluída.');
        location.href = 'home.html';
    } catch (e) {
        alert(e.message);
    }
});


// Botão "sair" do cabeçalho (nesta página o auth.js não é carregado)
document.getElementById('btn-sair')?.addEventListener('click', sair);

// Nesta página a pessoa sempre está logada: esconde o "Cadastre-se" do topo
const caixaDeslogado = document.getElementById('usuario-deslogado');
if (caixaDeslogado) caixaDeslogado.style.display = 'none';


/* MEUS PEDIDOS (GET /api/pedidos/meus) */

async function carregarMeusPedidos() {
    const lista = document.getElementById('conta-lista-pedidos');
    if (!lista || !token) return;

    try {
        const resposta = await fetch('/api/pedidos/meus', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const pedidos = await resposta.json();

        if (!resposta.ok) {
            throw new Error(pedidos.mensagem || 'Não foi possível carregar os pedidos.');
        }

        lista.replaceChildren();

        if (!pedidos.length) {
            const vazio = document.createElement('p');
            vazio.textContent = 'Você ainda não fez nenhum pedido.';
            lista.appendChild(vazio);
            return;
        }

        pedidos.forEach(pedido => {
            const caixa = document.createElement('div');
            caixa.className = 'conta-pedido';

            const status = document.createElement('span');
            status.className = 'status-pedido';
            status.textContent = pedido.status;

            const titulo = document.createElement('strong');
            titulo.textContent = `Pedido nº ${pedido.id}`;

            const data = new Date(pedido.createdAt || pedido.created_at).toLocaleDateString('pt-BR');
            const total = Number(pedido.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            const itens = (pedido.ItemPedidos || [])
                .map(item => `${item.quantidade}x ${item.Produto ? item.Produto.nome : 'Produto'}`)
                .join(', ');

            const detalhes = document.createElement('p');
            detalhes.textContent = `${data} · ${total} · ${itens}`;

            caixa.append(status, titulo, detalhes);
            lista.appendChild(caixa);
        });
    } catch (erro) {
        lista.textContent = erro.message;
    }
}

carregarMeusPedidos();
