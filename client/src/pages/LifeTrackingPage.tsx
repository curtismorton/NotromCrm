import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, 
  Plus, 
  Calendar, 
  DollarSign, 
  Coffee, 
  Activity,
  Target,
  Clock,
  Utensils,
  TrendingUp
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface LifeEntry {
  id: number;
  type: 'habit' | 'meal' | 'expense' | 'mood' | 'exercise' | 'sleep';
  title: string;
  description?: string;
  value?: number;
  unit?: string;
  category?: string;
  date: string;
  createdAt: string;
}

export default function LifeTrackingPage() {
  const [newEntryOpen, setNewEntryOpen] = useState(false);
  const [entryType, setEntryType] = useState<string>('habit');
  const [entryTitle, setEntryTitle] = useState("");
  const [entryDescription, setEntryDescription] = useState("");
  const [entryValue, setEntryValue] = useState("");
  const [entryUnit, setEntryUnit] = useState("");
  const [entryCategory, setEntryCategory] = useState("");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mock data - would be replaced with actual API
  const { data: entries = [], isLoading } = useQuery<LifeEntry[]>({
    queryKey: ["/api/life-tracking"],
    queryFn: () => {
      return Promise.resolve([]);
    }
  });

  const createEntryMutation = useMutation({
    mutationFn: async (entryData: any) => {
      toast({
        title: "Coming Soon",
        description: "Life tracking functionality will be implemented soon",
      });
      return Promise.resolve();
    },
    onSuccess: () => {
      setNewEntryOpen(false);
      setEntryTitle("");
      setEntryDescription("");
      setEntryValue("");
      setEntryUnit("");
      setEntryCategory("");
      setEntryDate(new Date().toISOString().split('T')[0]);
    },
  });

  const handleCreateEntry = () => {
    if (!entryTitle.trim()) return;

    createEntryMutation.mutate({
      type: entryType,
      title: entryTitle,
      description: entryDescription,
      value: entryValue ? parseFloat(entryValue) : null,
      unit: entryUnit || null,
      category: entryCategory || null,
      date: entryDate,
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'habit': return 'bg-green-100 text-green-800';
      case 'meal': return 'bg-orange-100 text-orange-800';
      case 'expense': return 'bg-red-100 text-red-800';
      case 'mood': return 'bg-purple-100 text-purple-800';
      case 'exercise': return 'bg-blue-100 text-blue-800';
      case 'sleep': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'habit': return <Target className="w-4 h-4" />;
      case 'meal': return <Utensils className="w-4 h-4" />;
      case 'expense': return <DollarSign className="w-4 h-4" />;
      case 'mood': return <Heart className="w-4 h-4" />;
      case 'exercise': return <Activity className="w-4 h-4" />;
      case 'sleep': return <Clock className="w-4 h-4" />;
      default: return <Coffee className="w-4 h-4" />;
    }
  };

  const habitEntries = entries.filter(e => e.type === 'habit');
  const mealEntries = entries.filter(e => e.type === 'meal');
  const expenseEntries = entries.filter(e => e.type === 'expense');
  const totalExpenses = expenseEntries.reduce((sum, entry) => sum + (entry.value || 0), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Heart className="w-8 h-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Life Tracking</h1>
            <p className="text-gray-600">Track habits, meals, expenses, and personal metrics</p>
          </div>
        </div>

        <Dialog open={newEntryOpen} onOpenChange={setNewEntryOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Life Tracking Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={entryType} onValueChange={setEntryType}>
                <SelectTrigger>
                  <SelectValue placeholder="Entry type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="habit">Habit</SelectItem>
                  <SelectItem value="meal">Meal</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="mood">Mood</SelectItem>
                  <SelectItem value="exercise">Exercise</SelectItem>
                  <SelectItem value="sleep">Sleep</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Title"
                value={entryTitle}
                onChange={(e) => setEntryTitle(e.target.value)}
              />
              <Textarea
                placeholder="Description (optional)"
                value={entryDescription}
                onChange={(e) => setEntryDescription(e.target.value)}
              />
              <div className="grid grid-cols-3 gap-4">
                <Input
                  type="number"
                  placeholder="Value (optional)"
                  value={entryValue}
                  onChange={(e) => setEntryValue(e.target.value)}
                  step="0.01"
                />
                <Input
                  placeholder="Unit (e.g., minutes, $, cups)"
                  value={entryUnit}
                  onChange={(e) => setEntryUnit(e.target.value)}
                />
                <Input
                  placeholder="Category (optional)"
                  value={entryCategory}
                  onChange={(e) => setEntryCategory(e.target.value)}
                />
              </div>
              <Input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setNewEntryOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateEntry}
                  disabled={!entryTitle.trim() || createEntryMutation.isPending}
                >
                  {createEntryMutation.isPending ? "Adding..." : "Add Entry"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Entries</p>
                <p className="text-2xl font-bold text-gray-900">{entries.length}</p>
              </div>
              <Heart className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Habits Tracked</p>
                <p className="text-2xl font-bold text-green-900">{habitEntries.length}</p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Meals Logged</p>
                <p className="text-2xl font-bold text-orange-900">{mealEntries.length}</p>
              </div>
              <Utensils className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-900">
                  ${totalExpenses.toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tracking Categories */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="habits">Habits</TabsTrigger>
          <TabsTrigger value="meals">Meals</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="mood">Mood</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
            {entries.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No entries yet</h3>
                  <p className="text-gray-500 mb-6">Start tracking your daily life to build better habits</p>
                  <Button 
                    onClick={() => setNewEntryOpen(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Entry
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Entries</h3>
                {entries.slice(0, 10).map((entry) => (
                  <Card key={entry.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(entry.type)}
                            <Badge className={getTypeColor(entry.type)}>
                              {entry.type}
                            </Badge>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{entry.title}</h4>
                            {entry.description && (
                              <p className="text-sm text-gray-600">{entry.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {entry.value && (
                            <p className="font-medium text-gray-900">
                              {entry.value} {entry.unit}
                            </p>
                          )}
                          <p className="text-sm text-gray-500">
                            {new Date(entry.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="habits">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Habit Tracking</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Target className="w-12 h-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Habit Tracking Coming Soon</h3>
                <p className="text-gray-500">Track daily habits and build consistent routines</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meals">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Utensils className="w-5 h-5" />
                <span>Meal Tracking</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Utensils className="w-12 h-12 mx-auto text-orange-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Meal Tracking Coming Soon</h3>
                <p className="text-gray-500">Log meals and track nutrition goals</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Expense Tracking</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 mx-auto text-red-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Expense Tracking Coming Soon</h3>
                <p className="text-gray-500">Monitor spending and budget management</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Health Metrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="w-12 h-12 mx-auto text-blue-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Health Tracking Coming Soon</h3>
                <p className="text-gray-500">Track exercise, sleep, and wellness metrics</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mood">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="w-5 h-5" />
                <span>Mood Tracking</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Heart className="w-12 h-12 mx-auto text-purple-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Mood Tracking Coming Soon</h3>
                <p className="text-gray-500">Monitor emotional wellbeing and patterns</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}