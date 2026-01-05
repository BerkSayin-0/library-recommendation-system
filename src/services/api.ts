import { Book, ReadingList, Review, Recommendation } from '@/types';
import { mockBooks, mockReadingLists } from './mockData';

const API_BASE_URL = 'https://4etlmjk252.execute-api.us-east-1.amazonaws.com/dev';

export async function getBooks(): Promise<Book[]> {
  const response = await fetch(`${API_BASE_URL}/books`);
  if (!response.ok) throw new Error('Failed to fetch books');
  return response.json();
}

export async function getBook(id: string): Promise<Book | null> {
  const response = await fetch(`${API_BASE_URL}/books/${id}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Failed to fetch book');
  return response.json();
}

export async function createBook(book: Omit<Book, 'id'>): Promise<Book> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newBook: Book = {
        ...book,
        id: Date.now().toString(),
      };
      resolve(newBook);
    }, 500);
  });
}

export async function updateBook(id: string, book: Partial<Book>): Promise<Book> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const existingBook = mockBooks.find((b) => b.id === id);
      const updatedBook: Book = {
        ...existingBook!,
        ...book,
        id,
      };
      resolve(updatedBook);
    }, 500);
  });
}

export async function deleteBook(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), 300);
  });
}

export async function getRecommendations(): Promise<Recommendation[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockRecommendations: Recommendation[] = [
        {
          id: '1',
          bookId: '1',
          reason: 'Based on your interest in philosophical fiction...',
          confidence: 0.92,
        },
        {
          id: '2',
          bookId: '2',
          reason: 'If you enjoy science-based thrillers...',
          confidence: 0.88,
        },
      ];
      resolve(mockRecommendations);
    }, 1000);
  });
}

export async function getReadingLists(): Promise<ReadingList[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/reading-lists?userId=user-1`);

    if (!response.ok) {
      console.error('API Hatası:', response.status);
      return [];
    }

    const data = await response.json();

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Fetch Hatası:', error);
    return [];
  }
}

export async function createReadingList(
  list: Omit<ReadingList, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ReadingList> {
  const response = await fetch(`${API_BASE_URL}/reading-lists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(list),
  });

  if (!response.ok) throw new Error('Failed to create reading list');

  return response.json();
}

export async function updateReadingList(
  id: string,
  list: Partial<ReadingList>
): Promise<ReadingList> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const existingList = mockReadingLists.find((l) => l.id === id);
      const updatedList: ReadingList = {
        ...existingList!,
        ...list,
        id,
        updatedAt: new Date().toISOString(),
      };
      resolve(updatedList);
    }, 500);
  });
}

export async function deleteReadingList(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), 300);
  });
}

export async function getReviews(bookId: string): Promise<Review[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockReviews: Review[] = [
        {
          id: '1',
          bookId,
          userId: '1',
          rating: 5,
          comment: 'Absolutely loved this book!',
          createdAt: '2024-11-01T10:00:00Z',
        },
      ];
      resolve(mockReviews);
    }, 500);
  });
}

export async function createReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newReview: Review = {
        ...review,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      resolve(newReview);
    }, 500);
  });
}

export async function addBookToReadingList(listId: string, bookId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/reading-lists/${listId}/books`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ bookId }),
  });

  if (!response.ok) {
    throw new Error('Failed to add book to reading list');
  }
}
