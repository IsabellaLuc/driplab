const parametrosProduto = new URLSearchParams(location.search);
const idProduto = parametrosProduto.get('id');
const slugProduto = parametrosProduto.get('produto') || 'outlaw';
const catalogoMoletons = {
    outlaw: { nome: 'Moletom Outlaw', preco: 99.90, descricao: 'Moletom preto oversized com arte gráfica em tons de prata, tecido macio e acabamento canelado.' },
    ignition: { nome: 'Moletom Ignition', preco: 78.90, descricao: 'Moletom grafite com estampa abstrata em laranja, capuz estruturado e bolso frontal.' },
    aftershock: { nome: 'Moletom Aftershock', preco: 85.90, descricao: 'Moletom azul-marinho com grafismo elétrico azul e modelagem urbana confortável.' },
    crimson: { nome: 'Moletom Crimson', preco: 109.90, descricao: 'Moletom vinho com estampa tonal, visual marcante e interior aconchegante.' }
};
function lerCarrinho() { try { const v=JSON.parse(localStorage.getItem('carrinho')||'[]'); return Array.isArray(v)?v:[]; } catch { return []; } }
function configurarGaleria(slug) {
    const base=`../img/moletom-${slug}-`;
    const miniaturas=document.querySelector('.miniaturas');
    const principal=document.querySelector('.imagem-principal img');
    if(!miniaturas||!principal) return;
    const imagens=[['frente','Vista frontal'],['lateral','Vista lateral'],['detalhe','Detalhe da estampa e do tecido']];
    miniaturas.replaceChildren();
    imagens.forEach(([tipo,alt],i)=>{
        const b=document.createElement('button'); b.type='button'; b.className='miniatura'+(i===0?' selecionada':''); b.setAttribute('aria-label',alt);
        const img=document.createElement('img'); img.src=base+tipo+'.jpg'; img.alt=alt; b.appendChild(img);
        b.addEventListener('click',()=>{ principal.src=img.src; principal.alt=alt; miniaturas.querySelectorAll('.miniatura').forEach(x=>x.classList.remove('selecionada')); b.classList.add('selecionada'); });
        miniaturas.appendChild(b);
    });
    principal.src=base+'frente.jpg'; principal.alt='Vista frontal do '+slug;
}
async function carregarProduto(){
    let produto=catalogoMoletons[slugProduto]||catalogoMoletons.outlaw;
    if(idProduto){ try { const r=await fetch(`/api/produtos/${encodeURIComponent(idProduto)}`); const d=await r.json(); if(r.ok) produto={...produto,...d}; } catch(e){ console.error(e); } }
    const titulo=document.querySelector('.informacoes-produto h1'); const preco=document.querySelector('.preco span'); const descricao=document.querySelector('.descricao');
    if(titulo) titulo.textContent=produto.nome; if(preco) preco.textContent=Number(produto.preco).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); if(descricao) descricao.textContent=produto.descricao||'';
    document.title=`DRIPLAB — ${produto.nome}`; configurarGaleria(slugProduto);
    const form=document.querySelector('#form-produto'); if(form) form.addEventListener('submit',e=>{e.preventDefault(); const tamanho=form.querySelector('input[name="tamanho"]:checked')?.value; if(!tamanho){alert('Selecione um tamanho.');return;} const itens=lerCarrinho(); const chave=produto.id??slugProduto; const existente=itens.find(x=>(x.produto_id??x.slug)===chave&&x.tamanho===tamanho); if(existente) existente.quantidade=Number(existente.quantidade||1)+1; else itens.push({produto_id:produto.id??null,slug:slugProduto,nome:produto.nome,preco:Number(produto.preco),imagem:`../img/moletom-${slugProduto}-frente.jpg`,tamanho,quantidade:1}); localStorage.setItem('carrinho',JSON.stringify(itens)); alert('Produto adicionado ao carrinho!'); });
}
carregarProduto();
