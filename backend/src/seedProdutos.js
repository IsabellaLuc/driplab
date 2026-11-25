const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const sequelize = require('./config/database');
const { Produto } = require('./models');

const produtosIniciais = [
    { nome: 'Produto 1', preco: 99.90, imagem: '/img/produto1.png' },
    { nome: 'Produto 2', preco: 189.90, imagem: '/img/produto2.png' },
    { nome: 'Produto 3', preco: 145.90, imagem: '/img/produto3.png' },
    { nome: 'Produto 4', preco: 159.90, imagem: '/img/produto4.png' },
    { nome: 'Produto 5', preco: 178.90, imagem: '/img/produto5.png' },
    { nome: 'Produto 6', preco: 59.90, imagem: '/img/produto6.png' },
    { nome: 'Produto 7', preco: 219.90, imagem: '/img/produto7.png' },
    { nome: 'Produto 8', preco: 85.90, imagem: '/img/produto8.png' },
    { nome: 'Produto 9', preco: 159.90, imagem: '/img/produto9.png' },
    { nome: 'Produto 10', preco: 49.90, imagem: '/img/produto10.png' },
    { nome: 'Produto 11', preco: 78.90, imagem: '/img/produto11.png' }
].map((produto) => ({
    ...produto,
    descricao: 'Produto do catálogo DRIPLAB.',
    categoria: 'Streetwear',
    estoque: 10,
    ativo: true
}));

async function inserirProdutosIniciais() {
    try {
        await sequelize.authenticate();
        await sequelize.sync();

        const quantidade = await Produto.count();

        if (quantidade > 0) {
            console.log(`A tabela Produto já possui ${quantidade} registro(s). Nenhum produto foi inserido para evitar duplicações.`);
            return;
        }

        await Produto.bulkCreate(produtosIniciais);
        console.log(`${produtosIniciais.length} produtos de demonstração foram cadastrados.`);
    } catch (erro) {
        console.error('Não foi possível cadastrar os produtos iniciais:', erro);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
}

inserirProdutosIniciais();
