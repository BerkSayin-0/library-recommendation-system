import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { Input } from '@/components/common/Input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

import {
  getReadingLists,
  createReadingList,
  updateReadingList,
  deleteReadingList,
} from '@/services/api';
import { ReadingList } from '@/types';
import { formatDate } from '@/utils/formatters';
import { handleApiError, showSuccess } from '@/utils/errorHandling';

/**
 * ReadingLists page component with Modern Confirmation Modal
 */
export function ReadingLists() {
  const navigate = useNavigate();
  const [lists, setLists] = useState<ReadingList[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingList, setEditingList] = useState<ReadingList | null>(null);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    setIsLoading(true);
    try {
      const data = await getReadingLists();
      setLists(data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingList(null);
    setNewListName('');
    setNewListDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (e: React.MouseEvent, list: ReadingList) => {
    e.stopPropagation();
    setEditingList(list);
    setNewListName(list.name);
    setNewListDescription(list.description || '');
    setIsModalOpen(true);
  };

  const handleSaveList = async () => {
    if (!newListName.trim()) {
      alert('Please enter a list name');
      return;
    }

    try {
      if (editingList) {
        const updatedList = await updateReadingList(editingList.id, {
          name: newListName,
          description: newListDescription,
        });
        setLists(lists.map((l) => (l.id === editingList.id ? updatedList : l)));
        showSuccess('Reading list updated successfully!');
      } else {
        const newList = await createReadingList({
          userId: '1',
          name: newListName,
          description: newListDescription,
          bookIds: [],
        });
        setLists([...lists, newList]);
        showSuccess('Reading list created successfully!');
      }

      setIsModalOpen(false);
      setNewListName('');
      setNewListDescription('');
      setEditingList(null);
    } catch (error) {
      handleApiError(error);
    }
  };

  // 1. Silme butonuna tıklandığında modalı açan fonksiyon
  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setListToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  // 2. Modern modalda onay verildiğinde çalışan asıl silme fonksiyonu
  const handleConfirmDelete = async () => {
    if (!listToDelete) return;

    try {
      await deleteReadingList(listToDelete);
      setLists(lists.filter((l) => l.id !== listToDelete));
      showSuccess('Reading list deleted successfully');
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsDeleteConfirmOpen(false);
      setListToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">My Reading Lists</h1>
            <p className="text-slate-600 text-lg">Organize your books into custom lists</p>
          </div>
          <Button variant="primary" size="lg" onClick={openCreateModal}>
            Create New List
          </Button>
        </div>

        {lists.length === 0 ? (
          <div className="text-center py-12 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200">
            <svg
              className="w-16 h-16 text-slate-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No reading lists yet</h3>
            <p className="text-slate-600 mb-4">
              Create your first list to start organizing your books
            </p>
            <Button variant="primary" onClick={openCreateModal}>
              Create Your First List
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => (
              <div
                key={list.id}
                onClick={() => navigate(`/reading-lists/${list.id}`)}
                className="group relative bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-xl hover:border-blue-300 transition-all duration-300 cursor-pointer"
              >
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => openEditModal(e, list)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
                    title="Edit List"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(e, list.id)}
                    className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                    title="Delete List"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 pr-16">{list.name}</h3>
                <p className="text-slate-600 mb-4 line-clamp-2 h-12">
                  {list.description || 'No description'}
                </p>
                <div className="flex items-center justify-between text-sm text-slate-500 mt-auto">
                  <span>{list.bookIds?.length || 0} books</span>
                  <span>Created {formatDate(list.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingList ? 'Edit Reading List' : 'Create New Reading List'}
        >
          <div>
            <Input
              label="List Name"
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="e.g., Summer Reading 2024"
              required
            />
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
                placeholder="What's this list about?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px] resize-none"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="primary" onClick={handleSaveList} className="flex-1">
                {editingList ? 'Save Changes' : 'Create List'}
              </Button>
              <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        <ConfirmModal
          isOpen={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Reading List"
          message="Are you sure you want to delete this reading list? All your saved books in this list will be unorganized."
          confirmText="Delete List"
          variant="danger"
        />
      </div>
    </div>
  );
}
