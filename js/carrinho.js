const lista=document.querySelector('.sacola-pg-listagem'); const resumo=document.querySelector('.sacola-pg-informacoes');
function ler(){try{const x=JSON.parse(localStorage.getItem('carrinho')||'[]');return Array.isArray(x)?x:[]}catch{return []}}
function render(){if(!lista||!resumo)return;lista.querySelectorAll('.sacola-pg-item,.carrinho-vazio').forEach(x=>x.remove());const itens=ler();if(!itens.length){const p=document.createElement('p');p.className='carrinho-vazio';p.textContent='Seu carrinho está vazio.';lista.appendChild(p)}itens.forEach((item,i)=>{const a=document.createElement('article');a.className='sacola-pg-item';const foto=document.createElement('div');foto.className='sacola-pg-foto';const im=document.createElement('img');im.src=item.imagem||'../img/produto1.png';im.alt=item.nome;foto.appendChild(im);const det=document.createElement('div');det.className='sacola-pg-detalhes';const h=document.createElement('h3');h.textContent=item.nome;const tam=document.createElement('p');tam.textContent=item.tamanho?'Tamanho: '+item.tamanho:'';const val=document.createElement('p');val.className='sacola-pg-valor';val.textContent=Number(item.preco||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});const rem=document.createElement('button');rem.type='button';rem.className='btn-remover-produto';rem.dataset.remover=i;rem.textContent='Remover';det.append(h,tam,val,rem);const ctl=document.createElement('div');ctl.className='sacola-pg-controle';const menos=document.createElement('button');menos.type='button';menos.dataset.menos=i;menos.textContent='−';const qtd=document.createElement('span');qtd.textContent=Number(item.quantidade||1);const mais=document.createElement('button');mais.type='button';mais.dataset.mais=i;mais.textContent='+';ctl.append(menos,qtd,mais);a.append(foto,det,ctl);lista.appendChild(a)});const total=itens.reduce((s,x)=>s+Number(x.preco||0)*Number(x.quantidade||1),0);resumo.textContent=`Subtotal: ${total.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}`}
lista?.addEventListener('click',e=>{const itens=ler();const r=e.target.closest('[data-remover]'),m=e.target.closest('[data-mais]'),n=e.target.closest('[data-menos]');if(r)itens.splice(Number(r.dataset.remover),1);else if(m){const x=itens[Number(m.dataset.mais)];if(x)x.quantidade=Number(x.quantidade||1)+1}else if(n){const x=itens[Number(n.dataset.menos)];if(x&&Number(x.quantidade||1)>1)x.quantidade--}else return;localStorage.setItem('carrinho',JSON.stringify(itens));render()});render();


/* =========================================================
   CUPOM
   Ainda não existe cupom cadastrado no sistema,
   então o botão avisa que o código não é válido.
   ========================================================= */

const campoCupom = document.getElementById('campo-cupom');
const mensagemCupom = document.getElementById('mensagem-cupom');

document.getElementById('btn-cupom')?.addEventListener('click', () => {
    const codigo = campoCupom.value.trim();

    if (!codigo) {
        mensagemCupom.textContent = 'Digite o código do cupom.';
    } else {
        mensagemCupom.textContent = `O cupom "${codigo}" não é válido ou já expirou.`;
    }

    mensagemCupom.className = 'mensagem-cupom erro';
});


/* =========================================================
   FINALIZAR COMPRA
   1. Confere se tem itens e se a pessoa está logada
   2. Envia o pedido para a API (POST /api/pedidos)
   3. Esvazia o carrinho e mostra o número do pedido
   ========================================================= */

const botaoFinalizar = document.querySelector('.btn-finalizar');
const mensagemCheckout = document.getElementById('mensagem-checkout');

function avisoCheckout(texto, tipo = '') {
    mensagemCheckout.textContent = texto;
    mensagemCheckout.className = `mensagem-checkout ${tipo}`;
}

botaoFinalizar?.addEventListener('click', async () => {
    const itens = ler();

    if (!itens.length) {
        avisoCheckout('Seu carrinho está vazio.', 'erro');
        return;
    }

    const tokenUsuario = localStorage.getItem('token');

    if (!tokenUsuario) {
        if (confirm('Para finalizar a compra você precisa entrar na sua conta. Ir para o login agora?')) {
            window.location.href = '../html/index.html?voltar=carrinho.html';
        }
        return;
    }

    const endereco = document.getElementById('endereco-entrega').value.trim();
    const formaPagamento = document.getElementById('forma-pagamento').value;

    if (endereco.length < 10) {
        avisoCheckout('Informe o endereço completo de entrega.', 'erro');
        return;
    }

    botaoFinalizar.disabled = true;
    avisoCheckout('Finalizando...');

    try {
        const resposta = await fetch('/api/pedidos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${tokenUsuario}`
            },
            body: JSON.stringify({
                itens: itens.map(item => ({
                    produto_id: item.produto_id,
                    quantidade: Number(item.quantidade || 1)
                })),
                endereco_entrega: endereco,
                forma_pagamento: formaPagamento
            })
        });

        const dados = await resposta.json().catch(() => ({}));

        // Login vencido: pede para entrar de novo
        if (resposta.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            avisoCheckout('Sua sessão expirou. Entre novamente para finalizar.', 'erro');
            return;
        }

        if (!resposta.ok) {
            throw new Error(dados.mensagem || 'Não foi possível finalizar a compra.');
        }

        localStorage.setItem('carrinho', '[]');
        render();
        document.getElementById('endereco-entrega').value = '';

        avisoCheckout(`Pedido nº ${dados.pedido.id} realizado! Acompanhe em "Minha conta".`, 'sucesso');

    } catch (erro) {
        avisoCheckout(
            erro.message === 'Failed to fetch' ? 'Não foi possível conectar ao servidor.' : erro.message,
            'erro'
        );
    } finally {
        botaoFinalizar.disabled = false;
    }
});
