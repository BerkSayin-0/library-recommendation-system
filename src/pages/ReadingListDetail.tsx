import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReadingLists, getBook } from '@/services/api';
import { ReadingList, Book } from '@/types';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export function ReadingListDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [list, setList] = useState<ReadingList | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadListAndBooks(id);
    }
  }, [id]);

  const loadListAndBooks = async (listId: string) => {
    setIsLoading(true);
    try {
      // Backend'de "Tekil Liste Getir" endpoint'i yapmadığımız için
      // Hepsini çekip frontend'de aradığımızı buluyoruz (Pratik Çözüm)
      const allLists = await getReadingLists();
      const foundList = allLists.find((l) => l.id === listId);

      if (!foundList) {
        navigate('/reading-lists');
        return;
      }

      setList(foundList);

      if (foundList.bookIds && foundList.bookIds.length > 0) {
        // Kitap detaylarını tek tek çek
        const bookPromises = foundList.bookIds.map((bookId) => getBook(bookId));
        const booksData = await Promise.all(bookPromises);
        setBooks(booksData.filter((b): b is Book => b !== null));
      }
    } catch (error) {
      console.error('Liste yüklenirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  if (!list) return <div>List not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="outline" onClick={() => navigate('/reading-lists')} className="mb-4">
          ← Back to Lists
        </Button>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{list.name}</h1>
        {list.description && <p className="text-xl text-gray-600">{list.description}</p>}
        <p className="text-sm text-gray-500 mt-2">{books.length} books in this list</p>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">No books in this list yet.</p>
          <Button variant="primary" className="mt-4" onClick={() => navigate('/books')}>
            Browse Books
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-xl shadow-sm border p-4 flex gap-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/books/${book.id}`)}
            >
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-24 h-36 object-cover rounded-md shadow-sm"
              />
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{book.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{book.author}</p>
                <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                  {book.genre}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
