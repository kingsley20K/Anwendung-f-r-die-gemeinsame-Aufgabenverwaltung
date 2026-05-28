import { useState, type FormEvent } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useBoardStore } from '../../store/boardStore';
import * as cardsApi from '../../api/endpoints/cards.api';
import type { Column as ColumnType } from '../../types';
import { CardItem } from './CardItem';

interface Props {
  column: ColumnType;
  boardId: string;
}

export function Column({ column, boardId }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: `col:${column.id}` });
  const applyRemoteCardCreated = useBoardStore((s) => s.applyRemoteCardCreated);

  const [adding, setAdding]   = useState(false);
  const [title, setTitle]     = useState('');
  const [saving, setSaving]   = useState(false);

  async function handleAddCard(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const card = await cardsApi.createCard(boardId, column.id, { title: title.trim() });
      applyRemoteCardCreated(card);
      setTitle('');
      setAdding(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex-shrink-0 w-72 bg-gray-100 rounded-xl p-3 flex flex-col gap-2 max-h-full">
      <h3 className="font-semibold text-gray-700 px-1 text-sm uppercase tracking-wide">
        {column.title}
        <span className="ml-2 text-gray-400 font-normal normal-case">
          {column.cards.length}
        </span>
      </h3>

      <SortableContext
        items={column.cards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={`flex flex-col gap-2 min-h-[40px] rounded-lg p-1 transition-colors overflow-y-auto
            ${isOver ? 'bg-blue-50 ring-2 ring-blue-200' : ''}`}
        >
          {column.cards.map((card) => (
            <CardItem key={card.id} card={card} />
          ))}
        </div>
      </SortableContext>

      {/* Add card */}
      {adding ? (
        <form onSubmit={handleAddCard} className="flex flex-col gap-2 mt-1">
          <textarea
            autoFocus
            required
            rows={2}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddCard(e as any); } }}
            placeholder="Titre de la carte…"
            className="w-full rounded-lg px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              {saving ? '…' : 'Ajouter'}
            </button>
            <button
              type="button"
              onClick={() => { setAdding(false); setTitle(''); }}
              className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-lg transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="text-left text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg px-2 py-1.5 text-sm transition-colors"
        >
          + Ajouter une carte
        </button>
      )}
    </div>
  );
}
