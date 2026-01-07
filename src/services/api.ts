import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Book, ReadingList, Review } from '@/types';
import { updateUserAttributes, updatePassword } from 'aws-amplify/auth';
import { resetPassword, confirmResetPassword } from 'aws-amplify/auth';

const API_BASE_URL = 'https://4etlmjk252.execute-api.us-east-1.amazonaws.com/dev';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('No auth session found', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- BOOKS API (Gerçek Veri) ---

export async function getBooks(): Promise<Book[]> {
  const response = await apiClient.get<Book[]>('/books');
  return response.data;
}

export async function getBook(id: string): Promise<Book | null> {
  try {
    const response = await apiClient.get<Book>(`/books/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

// --- BOOK MANAGEMENT ---

export async function createBook(book: Omit<Book, 'id'>): Promise<Book> {
  const response = await apiClient.post<Book>('/books', book);
  return response.data;
}

export async function updateBook(id: string, book: Partial<Book>): Promise<Book> {
  const response = await apiClient.put<Book>(`/books/${id}`, book);
  return response.data;
}

export async function deleteBook(id: string): Promise<void> {
  await apiClient.delete(`/books/${id}`);
}

// --- RECOMMENDATIONS & OTHERS ---

export const getRecommendations = async (query: string) => {
  try {
    const session = await fetchAuthSession().catch(() => null);

    const token = session?.tokens?.accessToken?.toString();

    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

    const response = await apiClient.post('/recommendations', { query }, config);
    return response.data;
  } catch (error) {
    console.error('AI Öneri Hatası:', error);
    throw error;
  }
};

export async function getReadingLists(): Promise<ReadingList[]> {
  try {
    const response = await apiClient.get<ReadingList[]>('/reading-lists');
    return response.data;
  } catch (error) {
    console.error('API Hatası (Reading Lists):', error);
    return [];
  }
}

/**
 * Merkezi İstatistik Fonksiyonu
 * Hem kullanıcı sayısını hem de toplam okuma listesi sayısını döner.
 */
export async function getStats(): Promise<{ totalUsers: number; totalLists: number }> {
  try {
    const response = await apiClient.get('/stats');
    return {
      totalUsers: response.data.totalUsers || 0,
      totalLists: response.data.totalLists || 0,
    };
  } catch (error) {
    console.error('İstatistikler çekilemedi:', error);
    return { totalUsers: 1, totalLists: 0 };
  }
}

// Geriye dönük uyumluluk için (getUserCount kullanan yerler hata almasın diye)
export async function getUserCount(): Promise<number> {
  const stats = await getStats();
  return stats.totalUsers;
}

// --- READING LISTS MANAGEMENT ---

export async function createReadingList(
  list: Omit<ReadingList, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ReadingList> {
  const response = await apiClient.post<ReadingList>('/reading-lists', list);
  return response.data;
}

export async function addBookToReadingList(listId: string, bookId: string): Promise<void> {
  await apiClient.post(`/reading-lists/${listId}/books`, { bookId });
}

export async function updateReadingList(
  id: string,
  list: Partial<ReadingList>
): Promise<ReadingList> {
  const response = await apiClient.put<ReadingList>(`/reading-lists/${id}`, list);
  return response.data;
}

export async function deleteReadingList(id: string): Promise<void> {
  await apiClient.delete(`/reading-lists/${id}`);
}

// --- REVIEWS API ---

export async function getReviews(bookId: string): Promise<Review[]> {
  const response = await apiClient.get<Review[]>(`/books/${bookId}/reviews`);
  return response.data;
}

export async function createReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
  const response = await apiClient.post<Review>(`/books/${review.bookId}/reviews`, review);
  return response.data;
}
export async function updateEmailAttribute(newEmail: string) {
  return await updateUserAttributes({
    userAttributes: {
      email: newEmail,
    },
  });
}

// Şifre değiştirme
export async function changeUserPassword(oldPassword: string, newPassword: string) {
  return await updatePassword({ oldPassword, newPassword });
}

//Şifremi Unuttum

export async function handleResetPassword(username: string) {
  try {
    const output = await resetPassword({ username });
    return output;
  } catch (error) {
    console.error(error);
  }
}

export async function handleConfirmResetPassword(
  username: string,
  confirmationCode: string,
  newPassword: string
) {
  try {
    await confirmResetPassword({ username, confirmationCode, newPassword });
  } catch (error) {
    console.error(error);
  }
}
