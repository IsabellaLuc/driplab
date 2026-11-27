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
        },

    // ---------- CAMISETAS ----------
    {
        nome: 'Camiseta Thorn',
        descricao: 'Camiseta preta de manga longa com arte de espinhos prateados e detalhes em vermelho.',
        preco: 69.90,
        imagem: `${base}produto8.png`,
        imagens: { frente: `${base}produto8.png` },
        categoria: 'Camiseta'
    },
    {
        nome: 'Camiseta Star Patch',
        descricao: 'Camiseta vermelha com estrela grande, recortes xadrez e acabamento desfiado.',
        preco: 64.90,
        imagem: `${base}produto10.png`,
        imagens: { frente: `${base}produto10.png` },
        categoria: 'Camiseta'
    },
    {
        nome: 'Camiseta Velocity',
        descricao: 'Camiseta preta de manga longa com recortes vermelhos e logo DRIPLAB no peito.',
        preco: 72.90,
        imagem: `${base}produto11.png`,
        imagens: { frente: `${base}produto11.png` },
        categoria: 'Camiseta'
    },
    {
        nome: 'Camiseta Ruins',
        descricao: 'Camiseta verde-musgo com efeito destroyed e estrela vermelha bordada.',
        preco: 59.90,
        imagem: `${base}produto6.png`,
        imagens: { frente: `${base}produto6.png` },
        categoria: 'Camiseta'
    },

    // ---------- TÊNIS ----------
    {
        nome: 'Tênis Drift',
        descricao: 'Tênis cano baixo vermelho, preto e off-white com solado robusto.',
        preco: 189.90,
        imagem: `${base}produto2.png`,
        imagens: { frente: `${base}produto2.png` },
        categoria: 'Tenis'
    },
    {
        nome: 'Coturno Riot',
        descricao: 'Coturno preto com solado tratorado alto e cadarço reforçado.',
        preco: 219.90,
        imagem: `${base}produto4.png`,
        imagens: { frente: `${base}produto4.png` },
        categoria: 'Tenis'
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

        // Só cadastra os produtos que ainda não existem (pelo nome),
        // assim dá para rodar o comando de novo sem duplicar nada.
        let inseridos = 0;

        for (const produto of produtosIniciais) {
            const existe = await Produto.findOne({ where: { nome: produto.nome } });
            if (!existe) {
                await Produto.create(produto);
                inseridos++;
            }
        }

        console.log(`${inseridos} produto(s) novo(s) cadastrado(s).`);
    } catch (erro) {
        console.error('Não foi possível cadastrar os produtos iniciais:', erro);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
}

inserirProdutosIniciais();
