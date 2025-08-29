const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
app.use(express.json());

// Sessão para rotas /customer
app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
}));

// Middleware de autenticação para rotas protegidas
app.use("/customer/auth/*", function auth(req,res,next){
    if (!req.session.authorization) {
        return res.status(403).json({ message: "Usuário não logado." });
    }
    const token = req.session.authorization.accessToken;
    try {
        const decoded = jwt.verify(token, "access"); // mesma secret usada no login
        req.user = decoded;
        return next();
    } catch (err) {
        return res.status(403).json({ message: "Token inválido ou expirado." });
    }
});

const PORT = 5000;
app.use("/customer", customer_routes); // autenticadas
app.use("/", genl_routes);              // públicas

app.listen(PORT, ()=>console.log("Server is running"));
