import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CardModal } from './CardModal';
import type { Card } from '../../types';

interface Props {
  card: Card;
  boardId: string;
  isDragging?: boolean;
}

export function CardItem({ card, boardId, isDragging = false }: Props) {
  const [showModal, setShowModal] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isSorting } =
    useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSorting && !isDragging ? 0.4 : 1,
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`group bg-white rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing select-none relative
          ${isDragging ? 'shadow-lg rotate-1 opacity-90' : 'hover:shadow-md'}`}
      >
        <p className="text-sm font-medium text-gray-800 pr-6">{card.title}</p>
        {card.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{card.description}</p>
        )}

        {/* Edit button — stops pointer propagation so it doesn't start a drag */}
        {!isDragging && (
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-400
              hover:text-gray-700 transition-opacity text-base leading-none"
            aria-label="Modifier"
          >
            ✎
          </button>
        )}
      </div>

      {showModal && (
        <CardModal card={card} boardId={boardId} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
