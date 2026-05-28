import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getBoards, createBoard, deleteBoard } from '../api/endpoints/boards.api';
import { ProfileModal } from '../components/ui/ProfileModal';
import type { Board } from '../types';

export function BoardsPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [boards, setBoards]       = useState<Board[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [title, setTitle]         = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating]   = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    getBoards()
      .then((res) => setBoards(res.boards))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      const board = await createBoard({ title: title.trim(), description: description.trim() || undefined });
      setBoards((prev) => [...prev, board]);
      setTitle('');
      setDescription('');
      setShowForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteBoard(boardId: string) {
    setDeletingId(boardId);
    try {
      await deleteBoard(boardId);
      setBoards((prev) => prev.filter((b) => b.id !== boardId));
      setConfirmDeleteId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 px-6 py-4 flex items-center justify-between shadow">
        <h1 className="text-white font-bold text-xl">Task Board</h1>
        <div className="flex items-center gap-3">
          {/* Profile avatar button */}
          <button
            onClick={() => setShowProfile(true)}
            title="Modifier mon profil"
            className="w-9 h-9 rounded-full bg-blue-400 hover:bg-blue-300 border-2 border-blue-500 flex items-center justify-center text-sm font-bold text-white uppercase transition-colors"
          >
            {(user?.displayName ?? user?.email ?? '?').charAt(0)}
          </button>
          <span className="text-blue-100 text-sm hidden sm:block">{user?.displayName}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-white bg-blue-700 hover:bg-blue-800 px-3 py-1.5 rounded-lg transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </header>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gray-800 text-lg font-semibold">Mes tableaux</h2>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Nouveau tableau
          </button>
        </div>

        {/* Create board form */}
        {showForm && (
          <form
            onSubmit={handleCreate}
            className="bg-white border border-gray-200 rounded-xl p-5 mb-6 flex flex-col gap-3 shadow-sm"
          >
            <h3 className="font-semibold text-gray-700">Nouveau tableau</h3>
            <input
              autoFocus
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre du tableau"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optionnel)"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={creating}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {creating ? 'Création…' : 'Créer'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setTitle(''); setDescription(''); }}
                className="text-sm text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        )}

        {/* Board grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-28" />
            ))}
          </div>
        ) : boards.length === 0 ? (
          <p className="text-gray-400 text-center py-16">
            Aucun tableau. Créez-en un pour commencer !
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {boards.map((board) => (
              <div
                key={board.id}
                className="group bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-300 transition-all relative"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => navigate(`/boards/${board.id}`)}
                >
                  <h3 className="font-semibold text-gray-800 mb-1 truncate pr-6">{board.title}</h3>
                  {board.description && (
                    <p className="text-gray-500 text-sm line-clamp-2">{board.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-3">Ouvrir le tableau</p>
                </div>

                {/* Delete board */}
                <div className="absolute top-3 right-3">
                  {confirmDeleteId === board.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDeleteBoard(board.id)}
                        disabled={deletingId === board.id}
                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                      >
                        {deletingId === board.id ? '…' : 'Oui'}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        Non
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(board.id); }}
                      className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all text-base leading-none"
                      aria-label="Supprimer le tableau"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
