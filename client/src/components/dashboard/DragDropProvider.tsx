import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { useState, createContext, useContext, ReactNode } from 'react';

interface DashboardItem {
  id: string;
  component: ReactNode;
  title: string;
  size: 'small' | 'medium' | 'large';
  enabled: boolean;
}

interface DashboardContextType {
  items: DashboardItem[];
  updateItems: (items: DashboardItem[]) => void;
  toggleWidget: (id: string) => void;
  isCustomizing: boolean;
  setIsCustomizing: (customizing: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DragDropProvider');
  }
  return context;
};

interface Props {
  children: ReactNode;
  initialItems: DashboardItem[];
}

export function DragDropProvider({ children, initialItems }: Props) {
  const [items, setItems] = useState<DashboardItem[]>(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('curtisOS-dashboard-layout');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge saved layout with initial items to handle new widgets
        const merged = initialItems.map(initial => {
          const saved = parsed.find((p: DashboardItem) => p.id === initial.id);
          return saved ? { ...initial, ...saved, component: initial.component } : initial;
        });
        // Add any new widgets that weren't in saved layout
        const newWidgets = initialItems.filter(
          initial => !parsed.some((p: DashboardItem) => p.id === initial.id)
        );
        return [...merged, ...newWidgets];
      } catch {
        return initialItems;
      }
    }
    return initialItems;
  });
  
  const [isCustomizing, setIsCustomizing] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const updateItems = (newItems: DashboardItem[]) => {
    setItems(newItems);
    // Save to localStorage (without component data)
    const saveData = newItems.map(({ component, ...item }) => item);
    localStorage.setItem('curtisOS-dashboard-layout', JSON.stringify(saveData));
  };

  const toggleWidget = (id: string) => {
    const newItems = items.map(item =>
      item.id === id ? { ...item, enabled: !item.enabled } : item
    );
    updateItems(newItems);
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over?.id);
      
      updateItems(arrayMove(items, oldIndex, newIndex));
    }
  }

  return (
    <DashboardContext.Provider 
      value={{ 
        items, 
        updateItems, 
        toggleWidget, 
        isCustomizing, 
        setIsCustomizing 
      }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToWindowEdges]}
      >
        <SortableContext items={items.map(item => item.id)} strategy={rectSortingStrategy}>
          {children}
        </SortableContext>
      </DndContext>
    </DashboardContext.Provider>
  );
}