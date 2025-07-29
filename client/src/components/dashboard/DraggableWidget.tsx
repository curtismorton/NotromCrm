import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, Eye, EyeOff } from 'lucide-react';
import { useDashboard } from './DragDropProvider';
import { ReactNode } from 'react';

interface Props {
  id: string;
  children: ReactNode;
  title: string;
  size?: 'small' | 'medium' | 'large';
  enabled?: boolean;
}

export function DraggableWidget({ 
  id, 
  children, 
  title, 
  size = 'medium',
  enabled = true 
}: Props) {
  const { isCustomizing, toggleWidget } = useDashboard();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Don't render if disabled and not customizing
  if (!enabled && !isCustomizing) {
    return null;
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'col-span-1';
      case 'large':
        return 'col-span-2 row-span-2';
      default:
        return 'col-span-1';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${getSizeClasses()} ${!enabled && isCustomizing ? 'opacity-50' : ''}`}
    >
      <Card className={`h-full relative ${isDragging ? 'shadow-2xl ring-2 ring-primary' : ''}`}>
        {/* Customization overlay */}
        {isCustomizing && (
          <div className="absolute top-2 right-2 z-10 flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => toggleWidget(id)}
              className="h-8 w-8 p-0"
            >
              {enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0 cursor-move"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {/* Widget content */}
        <div className={`${isCustomizing ? 'pointer-events-none' : ''} h-full`}>
          {children}
        </div>
        
        {/* Disabled overlay */}
        {!enabled && isCustomizing && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
            <p className="text-sm font-medium text-muted-foreground">
              Widget Hidden
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}