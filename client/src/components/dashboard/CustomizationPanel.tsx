import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Eye, 
  EyeOff,
  Palette,
  Layout
} from 'lucide-react';
import { useDashboard } from './DragDropProvider';
import { useState } from 'react';

export function CustomizationPanel() {
  const { items, isCustomizing, setIsCustomizing, toggleWidget, updateItems } = useDashboard();
  const [showPanel, setShowPanel] = useState(false);

  const handleReset = () => {
    localStorage.removeItem('curtisOS-dashboard-layout');
    window.location.reload();
  };

  const handleSave = () => {
    setIsCustomizing(false);
    setShowPanel(false);
  };

  const enabledCount = items.filter(item => item.enabled).length;
  const totalCount = items.length;

  if (!showPanel && !isCustomizing) {
    return (
      <Button
        onClick={() => setShowPanel(true)}
        variant="outline"
        size="sm"
        className="fixed top-4 right-4 z-50 shadow-lg"
      >
        <Settings className="h-4 w-4 mr-2" />
        Customize Dashboard
      </Button>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Card className="w-80 shadow-xl border-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Dashboard Customization
            </div>
            <Badge variant="secondary">{enabledCount}/{totalCount}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Customization Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Edit Mode</span>
            <Switch
              checked={isCustomizing}
              onCheckedChange={setIsCustomizing}
            />
          </div>

          {/* Widget List */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Layout className="h-4 w-4" />
              Widgets
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {items.map(item => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    {item.enabled ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm">{item.title}</span>
                  </div>
                  <Switch
                    checked={item.enabled}
                    onCheckedChange={() => toggleWidget(item.id)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button
              onClick={handleSave}
              size="sm"
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>

          {isCustomizing && (
            <div className="text-xs text-muted-foreground p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <strong>Edit Mode Active:</strong> Drag widgets by their grip handle, toggle visibility with the eye icon.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}