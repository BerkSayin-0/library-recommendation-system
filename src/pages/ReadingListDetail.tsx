import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReadingLists, getBooks, updateReadingList } from '@/services/api';
import { ReadingList, Book } from '@/types';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { handleApiError, showSuccess } from '@/utils/errorHandling';

/**
 * ReadingListDetail page component
 * Updated to navigate to Catalog for adding books and hover-delete effects
 */
export function ReadingListDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [list, setList] = useState<ReadingList | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [bookToRemove, setBookToRemove] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadListAndBooks(id);
    }
  }, [id]);

  const loadListAndBooks = async (listId: string) => {
    setIsLoading(true);
    try {
      const [allLists, allBooksData] = await Promise.all([getReadingLists(), getBooks()]);

      const foundList = allLists.find((l) => l.id === listId);
      if (!foundList) {
        navigate('/reading-lists');
        return;
      }

      setList(foundList);

      if (foundList.bookIds && foundList.bookIds.length > 0) {
        const booksData = allBooksData.filter((b) => foundList.bookIds.includes(b.id));
        setBooks(booksData);
      } else {
        setBooks([]);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const openRemoveConfirm = (e: React.MouseEvent, bookId: string) => {
    e.stopPropagation();
    setBookToRemove(bookId);
    setIsDeleteConfirmOpen(true);
  };

  const handleRemoveBook = async () => {
    if (!list || !bookToRemove) return;

    try {
      const updatedBookIds = list.bookIds.filter((id) => id !== bookToRemove);
      await updateReadingList(list.id, { bookIds: updatedBookIds });

      showSuccess('Book removed from list');
      loadListAndBooks(list.id);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsDeleteConfirmOpen(false);
      setBookToRemove(null);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  if (!list) return <div className="p-20 text-center">List not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <Button variant="outline" onClick={() => navigate('/reading-lists')} className="mb-4">
            ← Back to Lists
          </Button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{list.name}</h1>
          {list.description && <p className="text-xl text-gray-600">{list.description}</p>}
          <p className="text-sm text-gray-500 mt-2">{books.length} books in this list</p>
        </div>

        <Button variant="primary" onClick={() => navigate('/books')}>
          + Add Book
        </Button>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">No books in this list yet.</p>
          <Button variant="primary" className="mt-4" onClick={() => navigate('/books')}>
            Browse Catalog to Add Books
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <div
              key={book.id}
              className="group relative bg-white rounded-xl shadow-sm border p-4 flex gap-4 hover:shadow-md transition-all cursor-pointer overflow-hidden"
              onClick={() => navigate(`/books/${book.id}`)}
            >
              <button
                onClick={(e) => openRemoveConfirm(e, book.id)}
                className="absolute top-2 right-2 p-1.5 bg-red-50 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:text-white z-10 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <img
                src={book.coverImage}
                alt={book.title}
                className="w-24 h-36 object-cover rounded-md shadow-sm"
              />
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="font-bold text-lg text-gray-900 line-clamp-2 leading-tight mb-1">
                  {book.title}
                </h3>
                <p className="text-gray-600 text-sm mb-2">{book.author}</p>
                <span className="w-fit px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded uppercase tracking-wider border border-blue-100">
                  {book.genre}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleRemoveBook}
        title="Remove Book from List"
        message="Are you sure you want to remove this book from your reading list?"
        confirmText="Remove"
        variant="danger"
      />
    </div>
  );
}
