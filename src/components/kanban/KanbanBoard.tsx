import React, { useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface KanbanColumn<T> {
  id: string;
  title: string;
  items: T[];
}

export interface KanbanBoardProps<T> {
  columns: KanbanColumn<T>[];
  renderItem: (item: T, isDragging: boolean) => React.ReactNode;
  onDragEnd: (itemId: string, sourceColumnId: string, destColumnId: string, destIndex: number) => void;
  getItemId: (item: T) => string;
  getColumnIdOfItem: (itemId: string) => string;
  className?: string;
}

export function KanbanBoard<T>({
  columns,
  renderItem,
  onDragEnd,
  getItemId,
  getColumnIdOfItem,
  className = '',
}: KanbanBoardProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const itemId = active.id as string;
    const sourceColumnId = getColumnIdOfItem(itemId);
    const destColumnId = over.data.current?.columnId || over.id as string;
    if (sourceColumnId && destColumnId && sourceColumnId !== destColumnId) {
      // Find the index in the destination column
      const destCol = columns.find(col => col.id === destColumnId);
      const destIndex = destCol ? destCol.items.length : 0;
      onDragEnd(itemId, sourceColumnId, destColumnId, destIndex);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={`flex space-x-6 overflow-x-auto pb-6 ${className}`} role="list" aria-label="Kanban Board Columns">
        {columns.map((column) => (
          <div key={column.id} className="flex-1 min-w-[320px] bg-secondary-800 rounded-xl p-4 shadow-xl border border-secondary-700" role="listitem" aria-label={column.title}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{column.title}</h3>
              {/* Add column actions here if needed */}
            </div>
            <SortableContext items={column.items.map(getItemId)} strategy={verticalListSortingStrategy}>
              {column.items.map((item) => (
                <KanbanSortableCard
                  key={getItemId(item)}
                  id={getItemId(item)}
                  renderItem={renderItem}
                  item={item}
                  isDragging={activeId === getItemId(item)}
                />
              ))}
            </SortableContext>
          </div>
        ))}
      </div>
      <DragOverlay>
        {activeId && (() => {
          const item = columns.flatMap(col => col.items).find(i => getItemId(i) === activeId);
          return item ? renderItem(item, true) : null;
        })()}
      </DragOverlay>
    </DndContext>
  );
}

interface KanbanSortableCardProps<T> {
  id: string;
  item: T;
  renderItem: (item: T, isDragging: boolean) => React.ReactNode;
  isDragging: boolean;
}

function KanbanSortableCard<T>({ id, item, renderItem, isDragging }: KanbanSortableCardProps<T>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: dndDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: dndDragging ? 0.5 : 1,
    zIndex: dndDragging ? 999 : 'auto',
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} tabIndex={0} aria-grabbed={dndDragging}>
      {renderItem(item, isDragging)}
    </div>
  );
} 