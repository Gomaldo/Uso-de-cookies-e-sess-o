const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ secret: 'secret-key', saveUninitialized: true, resave: false }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

let produtos = [];

// Middleware para verificar login
function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.send(`
            <h1>Acesso Negado</h1>
            <p>Você precisa fazer login para acessar esta página.</p>
            <a href="/login.html">Ir para a página de login</a>
        `);
    }
    next();
}

// Página inicial
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Rota para login
app.post('/login', (req, res) => {
    const { username } = req.body;
    req.session.user = username;
    res.cookie('lastAccess', new Date().toLocaleString(), { maxAge: 24 * 60 * 60 * 1000 });
    res.redirect('/cadastro');
});

// Página de cadastro de produtos (protegida)
app.get('/cadastro', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/cadastro.html'));
});

// Rota para adicionar produto (protegida)
app.post('/cadastro', requireLogin, (req, res) => {
    produtos.push(req.body);
    res.redirect('/tabela');
});

// Tabela de produtos (protegida)
app.get('/tabela', requireLogin, (req, res) => {
    const lastAccess = req.cookies.lastAccess || 'Primeiro acesso';
    res.render('tabela', { produtos, lastAccess });
});

// Configuração do EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
