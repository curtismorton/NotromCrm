import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Plus, Clock, MapPin, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useWorkspace } from "@/hooks/use-workspace";

interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  attendees?: string;
  category: 'meeting' | 'deadline' | 'appointment' | 'reminder' | 'personal';
  context: string;
  createdAt: string;
}

export default function CalendarPage() {
  const [newEventOpen, setNewEventOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventStartTime, setEventStartTime] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventAttendees, setEventAttendees] = useState("");
  const [eventCategory, setEventCategory] = useState<string>('meeting');
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { currentWorkspace } = useWorkspace();

  // Mock data for calendar events - would be replaced with actual API
  const { data: events = [], isLoading } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/calendar"],
    queryFn: () => {
      // Return empty array for now - this would be replaced with actual API call
      return Promise.resolve([]);
    }
  });

  // Filter events by workspace context
  const workspaceEvents = events.filter(event => {
    if (currentWorkspace.id === 'notrom') {
      return event.context === 'notrom';
    } else {
      return ['personal', 'podcast', 'day_job'].includes(event.context);
    }
  });

  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      toast({
        title: "Coming Soon",
        description: "Calendar functionality will be implemented soon",
      });
      return Promise.resolve();
    },
    onSuccess: () => {
      setNewEventOpen(false);
      setEventTitle("");
      setEventDescription("");
      setEventStartTime("");
      setEventEndTime("");
      setEventLocation("");
      setEventAttendees("");
      setEventCategory('meeting');
    },
  });

  const handleCreateEvent = () => {
    if (!eventTitle.trim() || !eventStartTime) return;

    createEventMutation.mutate({
      title: eventTitle,
      description: eventDescription,
      startTime: eventStartTime,
      endTime: eventEndTime || eventStartTime,
      location: eventLocation,
      attendees: eventAttendees,
      category: eventCategory,
      context: currentWorkspace.id === 'notrom' ? 'notrom' : 'personal',
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'meeting': return 'bg-blue-100 text-blue-800';
      case 'deadline': return 'bg-red-100 text-red-800';
      case 'appointment': return 'bg-green-100 text-green-800';
      case 'reminder': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-purple-100 text-purple-800';
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getCalendarTitle = () => {
    if (currentWorkspace.id === 'notrom') {
      return 'Business Calendar';
    } else {
      return 'Personal Calendar';
    }
  };

  const getCalendarDescription = () => {
    if (currentWorkspace.id === 'notrom') {
      return 'Manage business meetings, deadlines, and important dates';
    } else {
      return 'Track personal events, podcast schedule, and day job activities';
    }
  };

  // Get today's events
  const today = new Date();
  const todayEvents = workspaceEvents.filter(event => {
    const eventDate = new Date(event.startTime);
    return eventDate.toDateString() === today.toDateString();
  });

  // Get upcoming events (next 7 days)
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  const upcomingEvents = workspaceEvents.filter(event => {
    const eventDate = new Date(event.startTime);
    return eventDate > today && eventDate <= nextWeek;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Calendar className="w-8 h-8 text-indigo-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{getCalendarTitle()}</h1>
            <p className="text-gray-600">{getCalendarDescription()}</p>
          </div>
        </div>

        <Dialog open={newEventOpen} onOpenChange={setNewEventOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              New Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Calendar Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Event title"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
              />
              <Textarea
                placeholder="Event description (optional)"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="datetime-local"
                  placeholder="Start time"
                  value={eventStartTime}
                  onChange={(e) => setEventStartTime(e.target.value)}
                />
                <Input
                  type="datetime-local"
                  placeholder="End time"
                  value={eventEndTime}
                  onChange={(e) => setEventEndTime(e.target.value)}
                />
              </div>
              <Input
                placeholder="Location (optional)"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
              />
              <Input
                placeholder="Attendees (optional)"
                value={eventAttendees}
                onChange={(e) => setEventAttendees(e.target.value)}
              />
              <Select value={eventCategory} onValueChange={setEventCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Event category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="appointment">Appointment</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setNewEventOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateEvent}
                  disabled={!eventTitle.trim() || !eventStartTime || createEventMutation.isPending}
                >
                  {createEventMutation.isPending ? "Creating..." : "Create Event"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Events</p>
                <p className="text-2xl font-bold text-gray-900">{todayEvents.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-blue-900">{upcomingEvents.length}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-purple-900">{workspaceEvents.length}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Events */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Today's Events</span>
            <Badge>{todayEvents.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayEvents.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">No events scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                      <Badge className={getCategoryColor(event.category)}>
                        {event.category}
                      </Badge>
                    </div>
                    {event.description && (
                      <p className="text-sm text-gray-600 mb-1">{event.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(event.startTime)}</span>
                        {event.endTime && event.endTime !== event.startTime && (
                          <span>- {formatTime(event.endTime)}</span>
                        )}
                      </div>
                      {event.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calendar View Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Calendar View</CardTitle>
        </CardHeader>
        <CardContent>
          {workspaceEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events scheduled</h3>
              <p className="text-gray-500 mb-6">Create your first event to get started</p>
              <Button 
                onClick={() => setNewEventOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto text-indigo-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Calendar View Coming Soon</h3>
              <p className="text-gray-500">Full calendar integration will be available soon</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}