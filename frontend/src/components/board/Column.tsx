import { useState, type FormEvent } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useBoardStore } from '../../store/boardStore';
import * as cardsApi from '../../api/endpoints/cards.api';
import * as columnsApi from '../../api/endpoints/columns.api';
import { EditableTitle } from './EditableTitle';
import type { Column as ColumnType } from '../../types';
import { CardItem } from './CardItem';

interface Props {
  column: ColumnType;
  boardId: string;
}

export function Column({ column, boardId }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: `col:${column.id}` });
  const { applyRemoteCardCreated, applyRemoteColumnUpdated, applyRemoteColumnDeleted } = useBoardStore();

  const [addingCard, setAddingCard]     = useState(false);
  const [cardTitle, setCardTitle]       = useState('');
  const [savingCard, setSavingCard]     = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting]         = useState(false);

  async function handleAddCard(e: FormEvent) {
    e.preventDefault();
    if (!cardTitle.trim()) return;
    setSavingCard(true);
    try {
      const card = await cardsApi.createCard(boardId, column.id, { title: cardTitle.trim() });
      applyRemoteCardCreated(card);
      setCardTitle('');
      setAddingCard(false);
    } catch (err) { console.error(err); }
    finally { setSavingCard(false); }
  }

  async function handleRenameColumn(newTitle: string) {
    const updated = await columnsApi.updateColumn(boardId, column.id, { title: newTitle });
    applyRemoteColumnUpdated({ ...column, ...updated });
  }

  async function handleDeleteColumn() {
    setDeleting(true);
    try {
      await columnsApi.deleteColumn(boardId, column.id);
      applyRemoteColumnDeleted(column.id);
    } catch (err) { console.error(err); setDeleting(false); }
  }

  return (
    <div className="flex-shrink-0 w-72 bg-gray-100 rounded-xl p-3 flex flex-col gap-2 max-h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-1 gap-2">
        <EditableTitle
          value={column.title}
          onSave={handleRenameColumn}
          className="font-semibold text-gray-700 text-sm uppercase tracking-wide"
          inputClassName="font-semibold text-gray-700 text-sm uppercase tracking-wide w-full"
        />
        <span className="text-gray-400 text-sm shrink-0">{column.cards.length}</span>

        {/* Delete column */}
        {confirmDelete ? (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleDeleteColumn}
              disabled={deleting}
              className="text-xs text-red-600 hover:text-red-800 font-medium"
            >
              {deleting ? '…' : 'Oui'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Non
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-gray-300 hover:text-red-400 transition-colors shrink-0 text-base leading-none"
            aria-label="Supprimer la colonne"
          >
            ×
          </button>
        )}
      </div>

      <SortableContext items={column.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex flex-col gap-2 min-h-[40px] rounded-lg p-1 transition-colors overflow-y-auto
            ${isOver ? 'bg-blue-50 ring-2 ring-blue-200' : ''}`}
        >
          {column.cards.map((card) => (
            <CardItem key={card.id} card={card} boardId={boardId} />
          ))}
        </div>
      </SortableContext>

      {/* Add card */}
      {addingCard ? (
        <form onSubmit={handleAddCard} className="flex flex-col gap-2 mt-1">
          <textarea
            autoFocus
            required
            rows={2}
            value={cardTitle}
            onChange={(e) => setCardTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddCard(e as any); } }}
            placeholder="Titre de la carte…"
            className="w-full rounded-lg px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={savingCard}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors">
              {savingCard ? '…' : 'Ajouter'}
            </button>
            <button type="button" onClick={() => { setAddingCard(false); setCardTitle(''); }}
              className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-lg transition-colors">
              Annuler
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setAddingCard(true)}
          className="text-left text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg px-2 py-1.5 text-sm transition-colors">
          + Ajouter une carte
        </button>
      )}
    </div>
  );
}
