import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  DndContext, DragOverlay, closestCorners,
  type DragStartEvent, type DragEndEvent,
} from '@dnd-kit/core';
import { useBoardStore } from '../store/boardStore';
import { Column } from '../components/board/Column';
import { CardItem } from '../components/board/CardItem';
import { joinBoard, leaveBoard } from '../sockets/socket.client';
import * as cardsApi from '../api/endpoints/cards.api';
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
  const { board, isLoading, loadBoard, clearBoard, moveCardOptimistic, rollbackCard } = useBoardStore();

  const [activeCard, setActiveCard]     = useState<Card | null>(null);
  const [dragSnapshot, setDragSnapshot] = useState<{ columnId: string; position: number } | null>(null);

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

    const targetColumn  = board?.columns.find((c) => c.id === targetColumnId);
    const newPosition   = computePosition(targetColumn?.cards ?? [], active.id.toString());

    moveCardOptimistic(active.id.toString(), targetColumnId, newPosition);
    setDragSnapshot(null);

    try {
      await cardsApi.moveCard(boardId, active.id.toString(), { columnId: targetColumnId, position: newPosition });
    } catch {
      rollbackCard(active.id.toString(), dragSnapshot.columnId, dragSnapshot.position);
    }
  }, [board, boardId, dragSnapshot, moveCardOptimistic, rollbackCard]);

  if (isLoading) return <BoardSkeleton />;
  if (!board)    return <p className="p-8 text-gray-500">Board not found.</p>;

  return (
    <div className="flex flex-col h-screen bg-blue-600">
      <header className="px-6 py-3 flex items-center gap-3">
        <h1 className="text-white font-bold text-lg">{board.title}</h1>
      </header>

      <main className="flex-1 overflow-hidden">
        <DndContext collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 h-full overflow-x-auto p-4 pb-6">
            {board.columns.map((column) => (
              <Column key={column.id} column={column} />
            ))}
          </div>

          <DragOverlay>
            {activeCard ? <CardItem card={activeCard} isDragging /> : null}
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
        <div key={i} className="flex-shrink-0 w-72 bg-gray-200 rounded-xl h-64" />
      ))}
    </div>
  );
}
