const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const jwtSecretKey = 'key';

const isValid = (username, password)=>{ 
  const user = users.find((user) => user.username === username && user.password === password);
  return user !== undefined;
}

// Helper function to find a book by ISBN
function findBookByISBN(isbn) {
  return books[isbn];
}

// Middleware to verify the JWT token and extract the username
function verifyToken(req, res, next) {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Missing token.' });
  }

  jwt.verify(token, jwtSecretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token.' });
    }
    req.username = decoded.username;
    next();
  });
}

// Function to check if the user is authenticated
const authenticatedUser = (username) => {
  return users.some(user => user.username === username);
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Both username and password are required.' });
  }
  if (isValid(username, password)) {
    const token = jwt.sign({ username }, jwtSecretKey);
    req.session.accessToken = token;
    return res.status(200).json({ message: 'Login successful.', token });
  }

  return res.status(401).json({ error: 'Invalid username or password.' });
});

// Add a book review
regd_users.put("/auth/review/:isbn", verifyToken, (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  const username = req.username;

  if (!review) {
    return res.status(400).json({ error: 'Review text is required.' });
  }

  if (!authenticatedUser(username, req.body.password)) {
    return res.status(401).json({ error: 'Unauthorized: Invalid username or password.' });
  }

  const book = findBookByISBN(isbn);

  if (!book) {
    return res.status(404).json({ error: 'Book not found.' });
  }

  if (!book.reviews[username]) {
    book.reviews[username] = review;
  } else {
    book.reviews[username] = review;
  }

  return res.status(200).json({ message: 'Review added/modified successfully.', review });
});

regd_users.delete("/auth/review/:isbn", verifyToken, (req, res) => {
  const { isbn } = req.params;
  const username = req.username; // Get the username from the session

  // Find the book by ISBN
  const book = findBookByISBN(isbn);

  if (!book) {
    return res.status(404).json({ error: 'Book not found.' });
  }

  // Check if the user has reviewed this book
  if (!book.reviews[username]) {
    return res.status(404).json({ error: 'Review not found for this book.' });
  }

  // Delete the user's review for this book
  delete book.reviews[username];

  return res.status(200).json({ message: 'Review deleted successfully.' });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
