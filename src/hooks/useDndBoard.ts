import { useMemo, useState } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverEvent, 
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  KeyboardSensor,
  TouchSensor
} from '@dnd-kit/core';
import { 
  SortableContext, 
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy
} from '@dnd-kit/sortable';

export interface DndStage {
  id: string;
  name: string;
  color?: string;
  wip_limit?: number;
}

export interface DndDeal {
  id: string;
  title: string;
  stage_id: string;
  value_cents?: number;
  currency?: string;
  company_name?: string;
  first_name?: string;
  last_name?: string;
  updated_at?: string;
}

export function useDndBoard(
  stages: DndStage[], 
  deals: DndDeal[], 
  onMove: (dealId: string, toStageId: string) => void
) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overStageId, setOverStageId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const stageIds = useMemo(() => stages.map(s => s.id), [stages]);

  const itemsByStage = useMemo(() => {
    const result: Record<string, string[]> = {};
    stageIds.forEach(stageId => {
      result[stageId] = deals
        .filter(deal => deal.stage_id === stageId)
        .map(deal => deal.id);
    });
    return result;
  }, [deals, stageIds]);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { over } = event;
    if (!over) {
      setOverStageId(null);
      return;
    }
    
    const overId = String(over.id);
    setOverStageId(
      stageIds.includes(overId) 
        ? overId 
        : (Object.entries(itemsByStage).find(([sid, ids]) => ids.includes(overId))?.[0] || null)
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    setOverStageId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // If dropping on a stage, move the deal there
    if (stageIds.includes(overId)) {
      onMove(activeId, overId);
      return;
    }

    // If dropping on another deal, find its stage and move there
    const targetStage = Object.entries(itemsByStage).find(([sid, ids]) => 
      ids.includes(overId)
    )?.[0];
    
    if (targetStage) {
      onMove(activeId, targetStage);
    }
  }

  return {
    activeId,
    overStageId,
    stageIds,
    itemsByStage,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    closestCorners,
    verticalListSortingStrategy,
    rectSortingStrategy,
  } as const;
}
