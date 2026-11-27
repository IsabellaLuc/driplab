const { Op } = require('sequelize');
const { Produto } = require('../models');
const { paginaLimite, numeroPositivo } = require('../utils/validacoes');

// Categorias da loja (iguais às páginas moletom.html, camisa.html e tenis.html)
const CATEGORIAS = ['Moletom', 'Camiseta', 'Tenis'];

async function listar(req, res) {
    const limit = Math.min(Number(req.query.limit) || 100, 100);
    const { pagina, limite, offset } = paginaLimite(req.query);
    const where = { ativo: true };

    if (req.query.nome) {
        where.nome = { [Op.like]: `%${String(req.query.nome).trim()}%` };
    }
    if (req.query.categoria) {
        where.categoria = String(req.query.categoria).trim();
    }

    const resultado = await Produto.findAndCountAll({
        where,
        limit: limite,
        offset,
        order: [['createdAt', 'DESC']]
    });

    return res.json({
        total: resultado.count,
        pagina,
        limite,
        produtos: resultado.rows
    });
}


async function listarAdministracao(req, res) {
    const { pagina, limite, offset } = paginaLimite(req.query);
    const where = {};

    if (req.query.nome) {
        where.nome = { [Op.like]: `%${String(req.query.nome).trim()}%` };
    }
    if (req.query.categoria) {
        where.categoria = String(req.query.categoria).trim();
    }
    
    const limit = Number.parseInt(req.query.limit, 10) || 100;
    const resultado = await Produto.findAndCountAll({
        where,
        limit,
        offset,
        order: [['createdAt', 'DESC']]
    });

    return res.json({
        total: resultado.count,
        pagina,
        limite,
        produtos: resultado.rows
    });
}

async function obter(req, res) {
    const produto = await Produto.findOne({
        where: { id: req.params.id, ativo: true }
    });

    if (!produto) {
        return res.status(404).json({ mensagem: 'Produto não encontrado' });
    }

    return res.json(produto);
}

async function cadastrar(req, res) {
    const { nome, descricao, preco, imagem, imagens, categoria, tamanho, cor, estoque = 0 } = req.body;
    const estoqueNumero = Number(estoque);

    if (
        !String(nome || '').trim() ||
        !CATEGORIAS.includes(categoria) ||
        !numeroPositivo(preco) ||
        !Number.isInteger(estoqueNumero) ||
        estoqueNumero < 0
    ) {
        return res.status(400).json({
            mensagem: 'Informe nome, categoria, preço positivo e estoque válido'
        });
    }

    const produto = await Produto.create({
        nome: String(nome).trim(),
        descricao,
        preco,
        imagem,
        imagens: imagens && typeof imagens === 'object' ? imagens : null,
        categoria,
        tamanho: tamanho || null,
        cor,
        estoque: estoqueNumero
    });

    return res.status(201).json({ mensagem: 'Produto cadastrado', produto });
}

async function atualizar(req, res) {
    const produto = await Produto.findByPk(req.params.id);
    if (!produto) {
        return res.status(404).json({ mensagem: 'Produto não encontrado' });
    }

    const campos = ['nome', 'descricao', 'preco', 'imagem', 'imagens', 'tamanho', 'cor', 'estoque', 'ativo'];
    for (const campo of campos) {
        if (req.body[campo] !== undefined) produto[campo] = req.body[campo];
    }

    if (req.body.categoria !== undefined) {
        if (!CATEGORIAS.includes(req.body.categoria)) {
            return res.status(400).json({ mensagem: 'Categoria inválida. Use Moletom, Camiseta ou Tenis.' });
        }
        produto.categoria = req.body.categoria;
    }

    if (!numeroPositivo(produto.preco) || !Number.isInteger(Number(produto.estoque)) || Number(produto.estoque) < 0) {
        return res.status(400).json({
            mensagem: 'Preço deve ser positivo e estoque deve ser um número inteiro não negativo'
        });
    }

    await produto.save();
    return res.json({ mensagem: 'Produto atualizado', produto });
}

async function excluir(req, res) {
    const produto = await Produto.findByPk(req.params.id);
    if (!produto) {
        return res.status(404).json({ mensagem: 'Produto não encontrado' });
    }

    produto.ativo = false;
    await produto.save();
    return res.json({ mensagem: 'Produto desativado' });
}

module.exports = { listar, listarAdministracao, obter, cadastrar, atualizar, excluir };
