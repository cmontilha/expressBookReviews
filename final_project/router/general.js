const express = require('express');
const axios = require('axios').default;
let books = require("../booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

/** TASK 1 – todos os livros */
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 2));
});

/** TASK 2 – por ISBN */
public_users.get('/isbn/:isbn', function (req, res) {
  const { isbn } = req.params;
  const book = books[isbn];
  if (book) return res.status(200).json(book);
  return res.status(404).json({ message: "ISBN não encontrado." });
});

/** TASK 3 – por Autor */
public_users.get('/author/:author', function (req, res) {
  const { author } = req.params;
  const result = Object.keys(books)
      .filter(isbn => books[isbn].author.toLowerCase() === author.toLowerCase())
      .reduce((acc, isbn) => (acc[isbn] = books[isbn], acc), {});
  if (Object.keys(result).length === 0)
    return res.status(404).json({ message: "Nenhum livro encontrado para este autor." });
  return res.status(200).json(result);
});

/** TASK 4 – por Título */
public_users.get('/title/:title', function (req, res) {
  const { title } = req.params;
  const result = Object.keys(books)
      .filter(isbn => books[isbn].title.toLowerCase() === title.toLowerCase())
      .reduce((acc, isbn) => (acc[isbn] = books[isbn], acc), {});
  if (Object.keys(result).length === 0)
    return res.status(404).json({ message: "Nenhum livro encontrado para este título." });
  return res.status(200).json(result);
});

/** TASK 5 – reviews por ISBN */
public_users.get('/review/:isbn', function (req, res) {
  const { isbn } = req.params;
  const book = books[isbn];
  if (!book) return res.status(404).json({ message: "ISBN não encontrado." });
  return res.status(200).json(book.reviews || {});
});

/** TASK 6 – registro */
public_users.post('/register', function (req, res) {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Username e password são obrigatórios." });
  if (!isValid(username))
    return res.status(409).json({ message: "Usuário já existe." });
  users.push({ username, password });
  return res.status(201).json({ message: "Usuário registrado com sucesso." });
});

/* ====== TASKS 10–13 (Axios: async/promise) ====== */
public_users.get('/async/books', async (req, res) => {
  try {
    const r = await axios.get('http://localhost:5000/');
    return res.status(200).json(r.data);
  } catch (e) {
    return res.status(500).json({ message: "Erro ao buscar livros (async).", error: e.message });
  }
});

public_users.get('/async/isbn/:isbn', (req, res) => {
  const { isbn } = req.params;
  axios.get(`http://localhost:5000/isbn/${isbn}`)
      .then(r => res.status(200).json(r.data))
      .catch(e => res.status(500).json({ message: "Erro ao buscar por ISBN (promise).", error: e.message }));
});

public_users.get('/async/author/:author', async (req, res) => {
  try {
    const { author } = req.params;
    const r = await axios.get(`http://localhost:5000/author/${encodeURIComponent(author)}`);
    return res.status(200).json(r.data);
  } catch (e) {
    return res.status(500).json({ message: "Erro ao buscar por autor (async).", error: e.message });
  }
});

public_users.get('/async/title/:title', (req, res) => {
  const { title } = req.params;
  axios.get(`http://localhost:5000/title/${encodeURIComponent(title)}`)
      .then(r => res.status(200).json(r.data))
      .catch(e => res.status(500).json({ message: "Erro ao buscar por título (promise).", error: e.message }));
});

module.exports.general = public_users;
