import { useEffect, useState, useCallback, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext, DragOverlay, closestCorners,
  type DragStartEvent, type DragEndEvent,
} from '@dnd-kit/core';
import { useBoardStore } from '../store/boardStore';
import { useAuthStore } from '../store/authStore';
import { Column } from '../components/board/Column';
import { CardItem } from '../components/board/CardItem';
import { EditableTitle } from '../components/board/EditableTitle';
import { MembersPanel } from '../components/board/MembersPanel';
import { joinBoard, leaveBoard } from '../sockets/socket.client';
import * as cardsApi from '../api/endpoints/cards.api';
import * as columnsApi from '../api/endpoints/columns.api';
import * as boardsApi from '../api/endpoints/boards.api';
import type { Card } from '../types';

function computePosition(cards: Card[], overId: string): number {
  const idx = cards.findIndex((c) => c.id === overId);
  if (idx === -1) return (cards[cards.length - 1]?.position ?? 0) + 1000;
  const before = cards[idx - 1]?.position ?? 0;
  const after  = cards[idx]?.position ?? before + 2000;
  return (before + after) / 2;
}

export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const { board, isLoading, loadBoard, clearBoard, moveCardOptimistic, rollbackCard, applyRemoteColumnCreated, applyRemoteBoardTitleUpdated, presenceUsers } = useBoardStore();
  const { user } = useAuthStore();

  const [activeCard, setActiveCard]     = useState<Card | null>(null);
  const [dragSnapshot, setDragSnapshot] = useState<{ columnId: string; position: number } | null>(null);

  const [showMembers, setShowMembers] = useState(false);

  // Add-column form state
  const [addingColumn, setAddingColumn] = useState(false);
  const [columnTitle, setColumnTitle]   = useState('');
  const [savingColumn, setSavingColumn] = useState(false);

  useEffect(() => {
    if (!boardId) return;
    loadBoard(boardId);
    joinBoard(boardId);
    return () => {
      leaveBoard(boardId);
      clearBoard();
    };
  }, [boardId]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const card = board?.columns.flatMap((c) => c.cards).find((c) => c.id === event.active.id);
    if (!card) return;
    setActiveCard(card);
    setDragSnapshot({ columnId: card.columnId, position: card.position });
  }, [board]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);
    if (!over || !dragSnapshot || !boardId) return;

    const overId = over.id.toString();
    const targetColumnId = overId.startsWith('col:')
      ? overId.slice(4)
      : board?.columns.find((c) => c.cards.some((ca) => ca.id === overId))?.id;

    if (!targetColumnId) return;

    const targetColumn = board?.columns.find((c) => c.id === targetColumnId);
    const newPosition  = computePosition(targetColumn?.cards ?? [], active.id.toString());

    moveCardOptimistic(active.id.toString(), targetColumnId, newPosition);
    setDragSnapshot(null);

    try {
      await cardsApi.moveCard(boardId, active.id.toString(), { columnId: targetColumnId, position: newPosition });
    } catch {
      rollbackCard(active.id.toString(), dragSnapshot.columnId, dragSnapshot.position);
    }
  }, [board, boardId, dragSnapshot, moveCardOptimistic, rollbackCard]);

  async function handleRenameBoard(newTitle: string) {
    if (!boardId) return;
    const updated = await boardsApi.updateBoard(boardId, { title: newTitle });
    applyRemoteBoardTitleUpdated(updated.title);
  }

  async function handleAddColumn(e: FormEvent) {
    e.preventDefault();
    if (!columnTitle.trim() || !boardId) return;
    setSavingColumn(true);
    try {
      const column = await columnsApi.createColumn(boardId, { title: columnTitle.trim() });
      applyRemoteColumnCreated(column);
      setColumnTitle('');
      setAddingColumn(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingColumn(false);
    }
  }

  if (isLoading) return <BoardSkeleton />;
  if (!board)    return <p className="p-8 text-gray-500">Tableau introuvable.</p>;

  return (
    <div className="flex flex-col h-screen bg-blue-600">
      <header className="px-4 py-3 flex items-center gap-3 shrink-0">
        <button
          onClick={() => navigate('/boards')}
          className="text-blue-200 hover:text-white transition-colors text-sm font-medium px-2 py-1 rounded hover:bg-blue-500"
        >
          ← Retour
        </button>
        <EditableTitle
          value={board.title}
          onSave={handleRenameBoard}
          className="font-bold text-white text-lg"
          inputClassName="font-bold text-white text-lg bg-blue-700 rounded px-1"
        />

        <div className="flex items-center gap-2 ml-auto">
          {/* Presence avatars — current user + others on the board */}
          <div className="flex items-center -space-x-2">
            {/* Current user always shown */}
            {user && (
              <div
                title={`${user.displayName} (vous)`}
                className="w-8 h-8 rounded-full bg-green-400 border-2 border-blue-600 flex items-center justify-center text-xs font-bold text-white uppercase select-none z-10"
              >
                {(user.displayName || user.email).charAt(0)}
              </div>
            )}
            {presenceUsers.slice(0, 4).map((u) => (
              <div
                key={u.userId}
                title={u.displayName || u.email}
                className="w-8 h-8 rounded-full bg-blue-300 border-2 border-blue-600 flex items-center justify-center text-xs font-bold text-white uppercase select-none"
              >
                {(u.displayName || u.email).charAt(0)}
              </div>
            ))}
            {presenceUsers.length > 4 && (
              <div className="w-8 h-8 rounded-full bg-blue-200 border-2 border-blue-600 flex items-center justify-center text-xs font-bold text-blue-700 select-none">
                +{presenceUsers.length - 4}
              </div>
            )}
          </div>

          {/* Members button */}
          <button
            onClick={() => setShowMembers(true)}
            className="text-blue-100 hover:text-white hover:bg-blue-500 transition-colors text-sm font-medium px-3 py-1.5 rounded-lg"
          >
            Membres
          </button>
        </div>
      </header>

      {showMembers && (
        <MembersPanel
          boardId={board.id}
          ownerId={board.owner.id}
          onClose={() => setShowMembers(false)}
        />
      )}

      <main className="flex-1 overflow-hidden">
        <DndContext collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 h-full overflow-x-auto p-4 pb-6 items-start">
            {board.columns.map((column) => (
              <Column key={column.id} column={column} boardId={board.id} />
            ))}

            {/* Add column */}
            <div className="flex-shrink-0 w-72">
              {addingColumn ? (
                <form
                  onSubmit={handleAddColumn}
                  className="bg-gray-100 rounded-xl p-3 flex flex-col gap-2"
                >
                  <input
                    autoFocus
                    required
                    value={columnTitle}
                    onChange={(e) => setColumnTitle(e.target.value)}
                    placeholder="Nom de la colonne"
                    className="rounded-lg px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={savingColumn}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {savingColumn ? '…' : 'Ajouter'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAddingColumn(false); setColumnTitle(''); }}
                      className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setAddingColumn(true)}
                  className="w-full text-left text-white/80 hover:text-white hover:bg-blue-500 rounded-xl px-4 py-3 text-sm font-medium transition-colors"
                >
                  + Ajouter une colonne
                </button>
              )}
            </div>
          </div>

          <DragOverlay>
            {activeCard ? <CardItem card={activeCard} boardId={board.id} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      </main>
    </div>
  );
}

function BoardSkeleton() {
  return (
    <div className="flex gap-4 p-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex-shrink-0 w-72 bg-blue-500 rounded-xl h-64" />
      ))}
    </div>
  );
}
