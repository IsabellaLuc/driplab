const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const sequelize = require('./config/database');
const { Produto } = require('./models');

const base = '/img/';
const produtosIniciais = [
    {
        nome: 'Moletom Outlaw',
        descricao: 'Moletom preto oversized com arte gráfica em tons de prata, tecido macio e acabamento canelado.',
        preco: 99.90,
        imagem: `${base}produto1-frente.jpg`,
        imagens: {
            frente: `${base}produto1-frente.jpg`,
            lateral: `${base}produto1-lateral.jpg`,
            costas: `${base}produto1-costas.jpg`,
            detalhe: `${base}produto1-detalhe.jpg`
        },
        categoria: 'Moletom'
    },
    {
        nome: 'Moletom Ignition',
        descricao: 'Moletom grafite com estampa abstrata em laranja, capuz estruturado e bolso frontal.',
        preco: 78.90,
        imagem: `${base}produto2-frente.jpg`,
        imagens: {
            frente: `${base}produto2-frente.jpg`,
            lateral: `${base}produto2-lateral.jpg`,
            detalhe: `${base}produto2-detalhe.jpg`
        },
        categoria: 'Moletom'
    },
    {
        nome: 'Moletom Aftershock',
        descricao: 'Moletom azul-marinho com grafismo elétrico azul e modelagem urbana confortável.',
        preco: 85.90,
        imagem: `${base}produto3-frente.jpg`,
        imagens: {
            frente: `${base}produto3-frente.jpg`,
            lateral: `${base}produto3-lateral.jpg`,
            detalhe: `${base}produto3-detalhe.jpg`
        },
        categoria: 'Moletom'
    },
    {
        nome: 'Moletom Crimson',
        descricao: 'Moletom vinho com estampa tonal, visual marcante e interior aconchegante.',
        preco: 109.90,
        imagem: `${base}produto4-frente.jpg`,
        imagens: {
            frente: `${base}produto4-frente.jpg`,
            lateral: `${base}produto4-lateral.jpg`,
            detalhe: `${base}produto4-detalhe.jpg`
        },
        categoria: 'Moletom'
    }
].map(produto => ({
    ...produto,
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
        console.log(`${produtosIniciais.length} produtos iniciais foram cadastrados.`);
    } catch (erro) {
        console.error('Não foi possível cadastrar os produtos iniciais:', erro);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
}

inserirProdutosIniciais();
