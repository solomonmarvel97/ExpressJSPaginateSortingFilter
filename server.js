require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const port = process.env.PORT || 3000; // default would be 3000

// connect to mongodb using mongoose
mongoose.connect("mongodb://localhost:27017/books", { useNewUrlParser: true });

// mongoose book schema
const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  genre: String,
  publicationDate: Date,
});
const Book = mongoose.model("Book", bookSchema);

// accept json body
app.use(express.json());

// create book
app.post("/books", async (req, res) => {
  // data validation with joi or ajv or zod
  const book = new Book(req.body);
  
  try {
    const savedBook = await book.save();
    res.status(201).json(savedBook);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// fetch all boks
app.get("/books", async (req, res) => {
  try {
    const allBooks = await Book.find();
    res.status(200).json(allBooks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// filtering - working with any field on the schema as query parameter
app.get("/books/filter", async (req, res) => {
  try {
    // our filter object that would be passed into our mongoose command
    const filters = {};
    // if a query parameter was passed,
    // mark it as case-insensitive
    if (req.query.title) {
      filters.title = new RegExp(req.query.title, "i");
    }
    if (req.query.author) {
      filters.author = new RegExp(req.query.author, "i");
    }
    if (req.query.genre) {
      filters.genre = new RegExp(req.query.genre, "i");
    }
    if (req.query.publicationDate) {
      filters.publicationDate = req.query.publicationDate;
    }
    // find the books based on the filters params
    const books = await Book.find(filters);
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// pagination - work with the page and the pageSize query param
app.get("/books/paginate", async (req, res) => {
  try {
    // defaults to 1 if a page was not passed in the query param
    const page = parseInt(req.query.page) || 1
    // defaults to 2 if a pageSize was not passed in the query param
    const pageSize = parseInt(req.query.pageSize) || 2
    // compute for skip value
    const skip = (page - 1) * pageSize
    // gives us the totalBooks in the collection
    const totalBooks = await Book.countDocuments();
    // fetch all books and applied the pagination rules
    const books = await Book.find().skip(skip).limit(pageSize)
    res.json({books, totalBooks})
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// sorting - work with the sortField or sortOrder (asc, desc)
app.get("/books/sort", async (req, res) => {
    try {
        const sortField = req.query.sort || "title";
        const sortOrder = req.query.order === "desc" ? -1 : 1
        const books = await Book.find().sort({[sortField]: sortOrder})
        res.json(books)
    } catch (err) {
        res.status(500).json({ message: err.message });
      }
})

app.listen(port, () => {
  console.log(`Our app runs on port ${port}`);
});
