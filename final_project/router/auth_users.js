const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("../booksdb.js");
const regd_users = express.Router();

// "Banco" de usuários em memória
let users = [];

/** Retorna true se o username AINDA NÃO existe (válido para registrar) */
const isValid = (username) => {
  const found = users.find(u => u.username === username);
  return !found;
};

/** Retorna true se username + password conferem */
const authenticatedUser = (username, password) => {
  const found = users.find(u => u.username === username && u.password === password);
  return !!found;
};

/** TASK 7 – Login: salva JWT na sessão */
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: "Username e password são obrigatórios." });
  }
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Credenciais inválidas." });
  }
  const accessToken = jwt.sign({ username }, "access", { expiresIn: 60 * 60 }); // 1h
  req.session.authorization = { accessToken, username };
  return res.status(200).json({ message: "Login bem-sucedido.", token: accessToken });
});

/** TASK 8 – Adicionar/Modificar review (autenticado) */
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const review = req.query.review;
  const username = req.session.authorization?.username;

  if (!username) return res.status(403).json({ message: "Usuário não autenticado." });
  if (!review)   return res.status(400).json({ message: "Forneça a review em ?review=..." });
  if (!books[isbn]) return res.status(404).json({ message: "ISBN não encontrado." });

  if (!books[isbn].reviews) books[isbn].reviews = {};
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review adicionada/atualizada com sucesso.",
    reviews: books[isbn].reviews
  });
});

/** TASK 9 – Deletar review do usuário logado (autenticado) */
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const username = req.session.authorization?.username;

  if (!username)   return res.status(403).json({ message: "Usuário não autenticado." });
  if (!books[isbn]) return res.status(404).json({ message: "ISBN não encontrado." });

  if (books[isbn].reviews && books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).json({
      message: "Review apagada com sucesso.",
      reviews: books[isbn].reviews
    });
  }
  return res.status(404).json({ message: "Nenhuma review deste usuário para este ISBN." });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.authenticatedUser = authenticatedUser;
module.exports.users = users;
