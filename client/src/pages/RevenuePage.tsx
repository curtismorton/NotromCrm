import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DollarSign, Plus, TrendingUp, TrendingDown, Calendar, Receipt } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface RevenueEntry {
  id: number;
  amount: number;
  description: string;
  category: 'project_payment' | 'retainer' | 'consultation' | 'maintenance' | 'other';
  clientName?: string;
  date: string;
  createdAt: string;
}

export default function RevenuePage() {
  const [newEntryOpen, setNewEntryOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>('project_payment');
  const [clientName, setClientName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // For now, we'll create a mock data structure since we don't have a revenue API yet
  const { data: revenue = [], isLoading } = useQuery<RevenueEntry[]>({
    queryKey: ["/api/revenue"],
    queryFn: () => {
      // Return empty array for now - this would be replaced with actual API call
      return Promise.resolve([]);
    }
  });

  const totalRevenue = revenue.reduce((sum, entry) => sum + entry.amount, 0);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const thisMonthRevenue = revenue
    .filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    })
    .reduce((sum, entry) => sum + entry.amount, 0);

  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  const lastMonthRevenue = revenue
    .filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === lastMonth && entryDate.getFullYear() === lastMonthYear;
    })
    .reduce((sum, entry) => sum + entry.amount, 0);

  // Mock create function - would be replaced with actual API
  const createRevenueMutation = useMutation({
    mutationFn: async (entryData: any) => {
      // Mock API call - would be replaced with actual implementation
      toast({
        title: "Coming Soon",
        description: "Revenue tracking functionality will be implemented soon",
      });
      return Promise.resolve();
    },
    onSuccess: () => {
      setNewEntryOpen(false);
      setAmount("");
      setDescription("");
      setCategory('project_payment');
      setClientName("");
      setDate(new Date().toISOString().split('T')[0]);
    },
  });

  const handleCreateEntry = () => {
    if (!amount || !description.trim()) return;

    createRevenueMutation.mutate({
      amount: parseFloat(amount),
      description,
      category,
      clientName: clientName || null,
      date,
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'project_payment': return 'bg-green-100 text-green-800';
      case 'retainer': return 'bg-blue-100 text-blue-800';
      case 'consultation': return 'bg-purple-100 text-purple-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <DollarSign className="w-8 h-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Revenue Tracking</h1>
            <p className="text-gray-600">Monitor your Notrom business income and financial performance</p>
          </div>
        </div>

        <Dialog open={newEntryOpen} onOpenChange={setNewEntryOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Revenue
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Revenue Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                type="number"
                placeholder="Amount ($)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
              />
              <Textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Input
                placeholder="Client name (optional)"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project_payment">Project Payment</SelectItem>
                    <SelectItem value="retainer">Retainer</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setNewEntryOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateEntry}
                  disabled={!amount || !description.trim() || createRevenueMutation.isPending}
                >
                  {createRevenueMutation.isPending ? "Recording..." : "Record Entry"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(thisMonthRevenue)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Month</p>
                <p className="text-2xl font-bold text-blue-900">{formatCurrency(lastMonthRevenue)}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Growth</p>
                <p className="text-2xl font-bold text-purple-900">
                  {lastMonthRevenue > 0 
                    ? `${(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)}%`
                    : '—'
                  }
                </p>
              </div>
              {thisMonthRevenue >= lastMonthRevenue ? (
                <TrendingUp className="w-8 h-8 text-green-500" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Receipt className="w-5 h-5" />
            <span>Revenue History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {revenue.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No revenue entries yet</h3>
              <p className="text-gray-500 mb-6">Start tracking your business income</p>
              <Button 
                onClick={() => setNewEntryOpen(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Entry
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {revenue.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <h4 className="font-medium text-gray-900">{entry.description}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(entry.category)}`}>
                        {entry.category.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {entry.clientName && <span>Client: {entry.clientName}</span>}
                      <span>{new Date(entry.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">{formatCurrency(entry.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}