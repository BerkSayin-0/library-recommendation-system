import { useState, useEffect, useMemo } from 'react';
import { BookSearch, SearchFilters } from '@/components/books/BookSearch';
import { BookGrid } from '@/components/books/BookGrid';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { getBooks } from '@/services/api';
import { Book } from '@/types';
import { handleApiError } from '@/utils/errorHandling';

/**
 * Books page component with search, filtering, sorting and pagination
 */
export function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('title');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 12;

  const availableGenres = useMemo(() => {
    const genres = books.map((book) => book.genre);
    return Array.from(new Set(genres)).sort();
  }, [books]);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setIsLoading(true);
    try {
      const data = await getBooks();
      setBooks(data);
      setFilteredBooks(sortBooks(data, 'title'));
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const sortBooks = (booksList: Book[], criterion: string): Book[] => {
    return [...booksList].sort((a, b) => {
      switch (criterion) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'rating':
          return b.rating - a.rating;
        case 'year':
          return b.publishedYear - a.publishedYear;
        default:
          return 0;
      }
    });
  };

  const handleSearch = (query: string, filters: SearchFilters) => {
    let result = books;

    // 1. Metin Araması
    if (query.trim()) {
      const lowercaseQuery = query.toLowerCase();
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(lowercaseQuery) ||
          book.author.toLowerCase().includes(lowercaseQuery) ||
          book.genre.toLowerCase().includes(lowercaseQuery)
      );
    }

    // 2. Kategori (Genre) Filtresi
    if (filters.genre) {
      result = result.filter((book) => book.genre === filters.genre);
    }

    // 3. Puan (Rating) Filtresi
    if (filters.rating) {
      const minRating = parseFloat(filters.rating);
      result = result.filter((book) => book.rating >= minRating);
    }

    // 4. Yıl Aralığı Filtre Mantığı
    if (filters.year) {
      if (filters.year.includes('-')) {
        const years = filters.year.split('-');
        const startYear = parseInt(years[0]?.trim());
        const endYear = parseInt(years[1]?.trim());

        if (!isNaN(startYear) && !isNaN(endYear)) {
          result = result.filter(
            (book) => book.publishedYear >= startYear && book.publishedYear <= endYear
          );
        }
      } else {
        result = result.filter((book) => book.publishedYear.toString().includes(filters.year));
      }
    }

    const sortedResult = sortBooks(result, sortBy);
    setFilteredBooks(sortedResult);
    setCurrentPage(1);
  };

  const handleSort = (value: string) => {
    setSortBy(value);
    setFilteredBooks(sortBooks(filteredBooks, value));
  };

  // Pagination Logic
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
            <span className="gradient-text">Book Catalog</span>
          </h1>
          <p className="text-slate-600 text-xl">
            Browse our collection of {/* Dinamik sayı: Toplam kitap sayısı (books.length) */}
            <span className="font-bold text-violet-600">{books.length}</span> amazing books
          </p>
        </div>

        {/* Search & Filter */}
        <div className="mb-8">
          <BookSearch onSearch={handleSearch} availableGenres={availableGenres} />
        </div>

        {/* Results Info & Sort */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="glass-effect px-4 py-2 rounded-xl border border-white/20">
            <p className="text-slate-700 font-semibold">
              Showing <span className="text-violet-600">{filteredBooks.length}</span>{' '}
              {filteredBooks.length === 1 ? 'book' : 'books'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-700 font-semibold">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
              className="input-modern px-4 py-2.5 text-sm font-medium"
            >
              <option value="title">Title (A-Z)</option>
              <option value="author">Author (A-Z)</option>
              <option value="rating">Rating (High-Low)</option>
              <option value="year">Year (Newest)</option>
            </select>
          </div>
        </div>

        {/* Book Grid */}
        {filteredBooks.length > 0 ? (
          <>
            <BookGrid books={currentBooks} />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => paginate(i + 1)}
                    className={`w-10 h-10 rounded-lg border transition-colors ${
                      currentPage === i + 1
                        ? 'bg-violet-600 border-violet-600 text-white'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No books found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
