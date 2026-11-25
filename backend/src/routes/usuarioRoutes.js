const express = require('express');
const router = express.Router();
const { listar, atualizar, excluir, minhaConta, excluirMinhaConta } = require('../controllers/usuarioController');
const auth = require('../middlewares/auth');
const permitir = require('../middlewares/permitir');

router.get('/api/usuarios/me', auth, minhaConta);
router.delete('/api/usuarios/me', auth, excluirMinhaConta);

router.get('/api/usuarios', auth, permitir('administrador'), listar);
router.patch('/api/usuarios/:id', auth, permitir('administrador'), atualizar);
router.delete('/api/usuarios/:id', auth, permitir('administrador'), excluir);

module.exports = router;
