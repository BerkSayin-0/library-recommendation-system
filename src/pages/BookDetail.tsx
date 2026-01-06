import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Modal } from '@/components/common/Modal';
import {
  getBook,
  getReadingLists,
  addBookToReadingList,
  getReviews,
  createReview,
} from '@/services/api';
import { Book, ReadingList, Review } from '@/types';
import { formatRating } from '@/utils/formatters';
import { handleApiError, showSuccess } from '@/utils/errorHandling';
import { useAuth } from '@/hooks/useAuth';

export function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [readingLists, setReadingLists] = useState<ReadingList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);

  // Reviews States
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const loadBook = useCallback(
    async (bookId: string) => {
      setIsLoading(true);
      try {
        const data = await getBook(bookId);
        if (!data) {
          navigate('/404');
          return;
        }
        setBook(data);
      } catch (error) {
        handleApiError(error);
      } finally {
        setIsLoading(false);
      }
    },
    [navigate]
  );

  const loadReviews = useCallback(async (bookId: string) => {
    try {
      const data = await getReviews(bookId);
      setReviews(data);
    } catch (error) {
      console.error('Reviews failed to load', error);
    }
  }, []);

  useEffect(() => {
    if (id) {
      loadBook(id);
      loadReviews(id);
    }
  }, [id, loadBook, loadReviews]);

  const handleOpenAddModal = async () => {
    try {
      const lists = await getReadingLists();
      setReadingLists(lists);
      if (lists.length > 0) setSelectedListId(lists[0].id);
      setIsModalOpen(true);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleAddToList = async () => {
    if (!selectedListId || !book) return;
    setIsAdding(true);
    try {
      await addBookToReadingList(selectedListId, book.id);

      showSuccess('Book added to reading list successfully!');
      setIsModalOpen(false);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddReview = async () => {
    if (!user) {
      handleApiError('Please login to write a review');
      return;
    }
    if (!newComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      const reviewData = {
        bookId: id!,
        userId: user.id,
        userName: user.name || 'Anonymous',
        rating: newRating,
        comment: newComment,
      };

      await createReview(reviewData);

      showSuccess('Review submitted successfully!');

      setNewComment('');
      setNewRating(5);
      setIsReviewModalOpen(false);
      loadReviews(id!);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!book) return null;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-600 hover:text-violet-600 mb-8 transition-colors group glass-effect px-4 py-2 rounded-xl border border-white/20 w-fit"
        >
          <svg
            className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="font-semibold">Back</span>
        </button>

        <div className="glass-effect rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 md:p-12">
            <div className="md:col-span-1">
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full rounded-2xl shadow-2xl"
              />
            </div>
            <div className="md:col-span-2">
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
                {book.title}
              </h1>
              <p className="text-xl text-slate-600 mb-6 font-medium">by {book.author}</p>
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <div className="flex items-center bg-amber-50 px-4 py-2 rounded-xl border border-amber-200">
                  <svg
                    className="w-5 h-5 text-amber-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-lg font-bold text-amber-700">
                    {formatRating(book.rating)}
                  </span>
                </div>
                <span className="badge-gradient px-4 py-2 text-sm">{book.genre}</span>
                <span className="font-semibold px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
                  {book.publishedYear}
                </span>
              </div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <span className="w-1 h-6 bg-gradient-to-b from-violet-600 to-indigo-600 rounded-full mr-3"></span>
                  Description
                </h2>
                <p className="text-slate-700 leading-relaxed text-lg">{book.description}</p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" size="lg" onClick={handleOpenAddModal}>
                  Add to Reading List
                </Button>
                <Button variant="outline" size="lg" onClick={() => setIsReviewModalOpen(true)}>
                  Write a Review
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8 glass-effect rounded-3xl shadow-xl border border-white/20 p-8 md:p-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center">
            <span className="w-1 h-8 bg-violet-600 rounded-full mr-3"></span>
            Reviews ({reviews.length})
          </h2>
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="p-6 bg-white/50 rounded-2xl border border-white/40">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="font-bold text-slate-900">
                        {review.userName || 'Anonymous'}
                      </span>
                      <div className="flex text-amber-400 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-slate-200'}`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-700">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-600">No reviews yet. Be the first to review!</p>
            </div>
          )}
        </div>

        {/* Modal: Add to List */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add to Reading List"
        >
          <div className="space-y-4">
            <select
              value={selectedListId}
              onChange={(e) => setSelectedListId(e.target.value)}
              className="w-full p-3 border rounded-xl outline-none"
            >
              {readingLists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleAddToList} disabled={isAdding}>
                {isAdding ? 'Adding...' : 'Add to List'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Modal: Write Review */}
        <Modal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          title="Write a Review"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Rating</label>
              <select
                value={newRating}
                onChange={(e) => setNewRating(Number(e.target.value))}
                className="w-full p-2 border rounded-lg"
              >
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Good</option>
                <option value="3">3 - Average</option>
                <option value="2">2 - Poor</option>
                <option value="1">1 - Terrible</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Your Comment</label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-3 border rounded-xl h-32"
                placeholder="What did you think of this book?"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsReviewModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleAddReview} disabled={isSubmittingReview}>
                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
