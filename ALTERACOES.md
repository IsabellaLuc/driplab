# Registro de alterações: DripLab (ajustes pontuais)

O design foi mantido. Só foi corrigido o que não funcionava.

## 1. Camisetas e Tênis

| Problema | Motivo | Correção |
|---|---|---|
| "Camisetas" e "Tênis" no menu não abriam | As páginas `camisa.html` e `tenis.html` não existiam, e os links estavam marcados como desativados (`naoutil`) | Páginas criadas (iguais à de moletom) e links ativados |
| Banco só aceitava moletom | A coluna `categoria` era `ENUM('Moletom')` | Agora aceita `Moletom`, `Camiseta` e `Tenis` (model, controller e área administrativa) |
| Não havia camisetas nem tênis cadastrados | — | 4 camisetas e 2 tênis cadastrados com fotos que já estavam na pasta `img` (`sql/produtos_camisetas_tenis.sql`) |
| `moletom.js` só buscava moletons | Categoria fixa no código | Lê a categoria do `data-categoria` da página: o mesmo arquivo serve para as 3 categorias |

## 2. Botões e links

| Problema | Correção |
|---|---|
| "Finalizar compra" não fazia nada | Campos de endereço e forma de pagamento + envio do pedido para a API (`POST /api/pedidos`). Sem login, leva ao login e depois volta ao carrinho |
| Botão "Aplicar" do cupom não fazia nada | Agora avisa que o cupom não é válido (ainda não existe cupom cadastrado) |
| Botão de carrinho nos cards adicionava o produto sem tamanho | Leva para a página do produto, onde o tamanho é escolhido |
| Depois de adicionar ao carrinho não havia caminho para o carrinho (deslogado) | Pergunta se quer ir para o carrinho |
| Pesquisa só funcionava em páginas com produtos | Pesquisa em todos os produtos (ignora acentos) e mostra os resultados na home |
| "Mais vendidos" e "Promoções" não funcionavam fora da home | Apontam para `home.html#...` |
| "Esqueci minha senha" levava a uma página que não existe | Mostra o telefone do SAC |
| Botão do Google não fazia login | Removido; no lugar, link para o cadastro |
| Botão "sair" do topo não funcionava na página da conta | Corrigido |
| Faixa branca embaixo do rodapé em páginas curtas | Fundo da página preto |

## 3. Novidade

- **Meus pedidos** na página "Minha conta" (`GET /api/pedidos/meus`).

## 4. Para rodar a atualização no banco

No MySQL Workbench, rode o arquivo **`sql/produtos_camisetas_tenis.sql`**. Ele pode ser executado mais de uma vez sem duplicar os produtos.
