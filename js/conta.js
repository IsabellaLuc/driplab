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
