const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");



public_users.post("/register", (req,res) => {
    const username = req.body?.username;
    const password = req.body?.password;
  
    if (!username || !password) {
      return res.status(400).json({ message: "Both username and password are required." });
    }
  
    const alreadyExists = users.some((u) => u.username === username);
    if (alreadyExists) {
      return res.status(409).json({ message: "Username already exists." });
    }
  
  
    users.push({ username, password });
    return res.status(201).json({ message: "User successfully registered." });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
  
    if (books[isbn]) {
      return res.status(200).send(JSON.stringify(books[isbn], null, 4));
    }
    return res.status(404).json({ message: `Book not found for ISBN: ${isbn}` });
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author.toLowerCase();
  
    const results = Object.keys(books)
      .filter((isbn) => books[isbn].author?.toLowerCase() === author)
      .map((isbn) => ({ isbn, ...books[isbn] }));
  
    if (results.length > 0) {
      return res.status(200).send(JSON.stringify(results, null, 4));
    }
    return res.status(404).json({ message: `No books found for author: ${req.params.author}` });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title.toLowerCase();
  
    const results = Object.keys(books)
      .filter((isbn) => books[isbn].title?.toLowerCase() === title)
      .map((isbn) => ({ isbn, ...books[isbn] }));
  
    if (results.length > 0) {
      return res.status(200).send(JSON.stringify(results, null, 4));
    }
    return res.status(404).json({ message: `No books found for title: ${req.params.title}` });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
  
    if (books[isbn]) {
      return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
    }
    return res.status(404).json({ message: `Book not found for ISBN: ${isbn}` });
});


public_users.get("/async/books", async (req, res) => {
  try {
    const response = await axios.get("http://localhost:5000/");
    return res.status(200).send(response.data);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching books", error: err.message });
  }
});

public_users.get("/async/isbn/:isbn", async (req, res) => {
    try {
      const isbn = req.params.isbn;
      const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
      return res.status(200).send(response.data);
    } catch (err) {
      if (err.response) {
        return res.status(err.response.status).send(err.response.data);
      }
      return res.status(500).json({ message: "Error fetching book by ISBN", error: err.message });
    }
});

public_users.get("/async/author/:author", async (req, res) => {
    try {
      const author = encodeURIComponent(req.params.author);
      const response = await axios.get(`http://localhost:5000/author/${author}`);
      return res.status(200).send(response.data);
    } catch (err) {
      if (err.response) {
        return res.status(err.response.status).send(err.response.data);
      }
      return res.status(500).json({ message: "Error fetching books by author", error: err.message });
    }
});

public_users.get("/async/title/:title", async (req, res) => {
    try {
      const title = encodeURIComponent(req.params.title);
      const response = await axios.get(`http://localhost:5000/title/${title}`);
      return res.status(200).send(response.data);
    } catch (err) {
      if (err.response) {
        return res.status(err.response.status).send(err.response.data);
      }
      return res.status(500).json({ message: "Error fetching books by title", error: err.message });
    }
});

module.exports.general = public_users;
