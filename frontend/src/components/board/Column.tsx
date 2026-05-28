import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Column as ColumnType } from '../../types';
import { CardItem } from './CardItem';

interface Props {
  column: ColumnType;
}

export function Column({ column }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: `col:${column.id}` });

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
    </div>
  );
}
