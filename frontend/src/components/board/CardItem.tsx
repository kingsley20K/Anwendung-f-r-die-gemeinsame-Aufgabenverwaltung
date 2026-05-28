import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Card } from '../../types';

interface Props {
  card: Card;
  isDragging?: boolean;
}

export function CardItem({ card, isDragging = false }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isSorting } =
    useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSorting && !isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing select-none
        ${isDragging ? 'shadow-lg rotate-1 opacity-90' : 'hover:shadow-md'}`}
    >
      <p className="text-sm font-medium text-gray-800">{card.title}</p>
      {card.description && (
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{card.description}</p>
      )}
    </div>
  );
}
