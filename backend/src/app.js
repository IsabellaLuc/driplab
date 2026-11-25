const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
require('./models');

const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const produtoRoutes = require('./routes/produtoRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');
const { rotaNaoEncontrada, tratarErro } = require('./middlewares/erros');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, '../../')));

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', sistema: 'DRIPLAB API' });
});

app.use(authRoutes);
app.use(usuarioRoutes);
app.use(produtoRoutes);
app.use(pedidoRoutes);

app.use(rotaNaoEncontrada);
app.use(tratarErro);

const PORT = Number(process.env.PORT || 3000);

async function iniciarServidor() {
    try {
        if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 24) {
            throw new Error('JWT_SECRET precisa existir no backend/.env e ter pelo menos 24 caracteres.');
        }

        await sequelize.authenticate();
        console.log('Conectado ao banco de dados MySQL.');

        await sequelize.sync();
        console.log('Modelos sincronizados com o banco de dados.');

        app.listen(PORT, () => {
            console.log(`Servidor DRIPLAB rodando na porta ${PORT}`);
            console.log(`Home: http://localhost:${PORT}/html/home.html`);
            console.log(`API de produtos: http://localhost:${PORT}/api/produtos`);
        });
    } catch (erro) {
        console.error('Não foi possível iniciar o servidor:');
        console.error(erro);
        process.exit(1);
    }
}

iniciarServidor();
