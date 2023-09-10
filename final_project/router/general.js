const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Both username and password are required.' });
  }

  if (users.some(user => user.username === username)) {
    return res.status(400).json({ error: 'Username already exists.' });
  }

  const newUser = { username, password };
  users.push(newUser);

  return res.status(201).json({ message: 'User registered successfully.', user: newUser });
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
  try {
    const bookListPromise = new Promise((resolve) => {
      const formattedBookList = JSON.stringify(books, null, 2);
      resolve(formattedBookList);
    });

    const formattedBookList = await bookListPromise;

    return res.status(200).json({ books: formattedBookList });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const isbn = parseInt(req.params.isbn);

    const bookDetailsPromise = new Promise((resolve, reject) => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject({ error: 'Book not found' });
      }
    });

    const bookDetails = await bookDetailsPromise;

    return res.status(200).json(bookDetails);
  } catch (error) {
    console.error(error);
    return res.status(404).json(error);
  }
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const matchingBooks = [];

  for (const isbn in books) {
    if (books.hasOwnProperty(isbn)) {
      if (books[isbn].author === author) {
        matchingBooks.push(books[isbn]);
      }
    }
  }

  if (matchingBooks.length > 0) {
    res.status(200).json(matchingBooks);
  } else {
    res.status(404).json({ error: 'Books by this author not found' });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const matchingBooks = [];

  for (const isbn in books) {
    if (books.hasOwnProperty(isbn)) {
      if (books[isbn].title === title) {
        matchingBooks.push(books[isbn]);
      }
    }
  }

  if (matchingBooks.length > 0) {
    res.status(200).json(matchingBooks);
  } else {
    res.status(404).json({ error: 'Books with this title not found' });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = parseInt(req.params.isbn);
  if (books[isbn]) {
    res.status(200).json(books[isbn]);
  } else {
    res.status(404).json({ error: 'Book not found' });
  }
});

module.exports.general = public_users;
