import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [defaultBooks, setDefaultBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [selectedBook, setSelectedBook] = useState(null);

  const searchBooks = async () => {
    if (!query) return;
    const startIndex = page * 10;
    const URL = `https://www.googleapis.com/books/v1/volumes?q=${query}&startIndex=${startIndex}&maxResults=10`;
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(URL);
      if (response.data.totalItems === 0) {
        setError("No books found.");
        setBooks([]);
      } else {
        setBooks(response.data.items || []);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDefaultBooks = async () => {
    const URL = `https://www.googleapis.com/books/v1/volumes?q=best%20sellers&maxResults=8`;
    try {
      const response = await axios.get(URL);
      setDefaultBooks(response.data.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDefaultBooks();
  }, []);

  useEffect(() => {
    if (query) {
      searchBooks();
    }
    // eslint-disable-next-line
  }, [page]);

  // Get best image or fallback to Open Library
  const getBestImage = (volumeInfo) => {
    const links = volumeInfo.imageLinks;
    const googleImage =
      links?.extraLarge ||
      links?.large ||
      links?.medium ||
      links?.small ||
      links?.thumbnail ||
      links?.smallThumbnail ||
      null;

    if (googleImage) return googleImage;

    const isbn = volumeInfo.industryIdentifiers?.find(
      (id) => id.type === "ISBN_13" || id.type === "ISBN_10"
    )?.identifier;

    if (isbn) {
      return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
    }

    return null;
  };

  return (
    <div className="container py-5 px-3">
      <h1 className="text-center mb-4 text-primary">📚 Book Search App</h1>
      <div className="d-flex justify-content-center mb-4">
        <div
          className="input-group"
          style={{ maxWidth: "500px", width: "100%" }}
        >
          <input
            type="text"
            className="form-control"
            placeholder="Type a book name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            className="btn btn-primary"
            onClick={() => {
              setPage(0);
              searchBooks();
            }}
          >
            Search
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center my-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {error && <div className="alert alert-warning">{error}</div>}

      {/* Default Books */}
      {!query && defaultBooks.length > 0 && (
        <>
          <h3 className="mb-3">📖 Popular Books</h3>
          <div className="row">
            {defaultBooks.map((book) => {
              const image = getBestImage(book.volumeInfo);
              return (
                <div key={book.id} className="col-sm-6 col-md-3 mb-4">
                  <div className="card h-100 shadow-sm">
                    {image && (
                      <img
                        src={image}
                        className="card-img-top book-cover"
                        alt={book.volumeInfo.title}
                      />
                    )}
                    <div
                      className="card-body d-flex flex-column"
                      onClick={() => setSelectedBook(book)}
                      style={{ cursor: "pointer" }}
                    >
                      <h6 className="card-title">{book.volumeInfo.title}</h6>
                      {book.volumeInfo.authors && (
                        <p className="card-text">
                          <strong>Author:</strong>{" "}
                          {book.volumeInfo.authors.join(", ")}
                        </p>
                      )}
                      <p className="card-text">
                        {book.volumeInfo.description
                          ? `${book.volumeInfo.description.substring(
                              0,
                              100
                            )}...`
                          : "No description available"}
                      </p>
                      {book.volumeInfo.previewLink && (
                        <a
                          href={book.volumeInfo.previewLink}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-outline-primary mt-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Preview
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Search Results */}
      {query && (
        <>
          <h3 className="mb-3">🔍 Search Results</h3>
          <div className="row">
            {books.map((book) => {
              const image = getBestImage(book.volumeInfo);
              return (
                <div key={book.id} className="col-sm-6 col-md-4 mb-4">
                  <div className="card h-100 shadow-sm">
                    {image && (
                      <img
                        src={image}
                        className="card-img-top book-cover"
                        alt={book.volumeInfo.title}
                      />
                    )}
                    <div
                      className="card-body d-flex flex-column"
                      onClick={() => setSelectedBook(book)}
                      style={{ cursor: "pointer" }}
                    >
                      <h5 className="card-title">{book.volumeInfo.title}</h5>
                      {book.volumeInfo.authors && (
                        <p className="card-text">
                          <strong>Author:</strong>{" "}
                          {book.volumeInfo.authors.join(", ")}
                        </p>
                      )}
                      <p className="card-text">
                        {book.volumeInfo.description
                          ? `${book.volumeInfo.description.substring(
                              0,
                              100
                            )}...`
                          : "No description available"}
                      </p>
                      {book.volumeInfo.previewLink && (
                        <a
                          href={book.volumeInfo.previewLink}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-outline-primary mt-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Preview
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {books.length > 0 && (
            <div className="d-flex justify-content-center my-4">
              <button
                className="btn btn-secondary me-2"
                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                disabled={page === 0}
              >
                Previous
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={books.length < 10}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {selectedBook && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedBook.volumeInfo.title}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedBook(null)}
                ></button>
              </div>
              <div className="modal-body">
                {getBestImage(selectedBook.volumeInfo) && (
                  <img
                    src={getBestImage(selectedBook.volumeInfo)}
                    alt={selectedBook.volumeInfo.title}
                    className="img-fluid mb-3"
                  />
                )}
                <p>
                  {selectedBook.volumeInfo.description ||
                    "No description available."}
                </p>
                {selectedBook.volumeInfo.previewLink && (
                  <a
                    href={selectedBook.volumeInfo.previewLink}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary"
                  >
                    Read on Google Books
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
