import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { api, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Loader2, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { z } from "zod";

const episodeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  episodeNumber: z.number().optional(),
  status: z.enum(["planning", "recorded", "editing", "published"]).default("planning"),
  duration: z.number().optional(),
  youtubeUrl: z.string().optional(),
  spotifyUrl: z.string().optional(),
  notes: z.string().optional(),
});

type EpisodeFormData = z.infer<typeof episodeSchema>;

interface EpisodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EpisodeModal({ isOpen, onClose }: EpisodeModalProps) {
  const { toast } = useToast();
  const [publishDate, setPublishDate] = useState<Date>();
  const [topics, setTopics] = useState<string[]>([]);
  const [guests, setGuests] = useState<string[]>([]);
  const [newTopic, setNewTopic] = useState("");
  const [newGuest, setNewGuest] = useState("");

  const form = useForm<EpisodeFormData>({
    resolver: zodResolver(episodeSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "planning",
      notes: "",
    },
  });

  const createEpisodeMutation = useMutation({
    mutationFn: (data: EpisodeFormData & { publishDate?: string; topics: string[]; guests: string[] }) => {
      return api.post("/api/podcast-episodes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/podcast-episodes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Episode created",
        description: "Podcast episode has been created successfully",
      });
      form.reset();
      setPublishDate(undefined);
      setTopics([]);
      setGuests([]);
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create episode",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EpisodeFormData) => {
    const formattedData = {
      ...data,
      publishDate: publishDate ? publishDate.toISOString() : undefined,
      topics,
      guests,
    };
    createEpisodeMutation.mutate(formattedData);
  };

  const addTopic = () => {
    if (newTopic.trim() && !topics.includes(newTopic.trim())) {
      setTopics([...topics, newTopic.trim()]);
      setNewTopic("");
    }
  };

  const removeTopic = (topic: string) => {
    setTopics(topics.filter(t => t !== topic));
  };

  const addGuest = () => {
    if (newGuest.trim() && !guests.includes(newGuest.trim())) {
      setGuests([...guests, newGuest.trim()]);
      setNewGuest("");
    }
  };

  const removeGuest = (guest: string) => {
    setGuests(guests.filter(g => g !== guest));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Podcast Episode</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Episode Title*</FormLabel>
                    <FormControl>
                      <Input placeholder="Behind The Screens: Episode Title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="episodeNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Episode Number</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="42"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Episode description and show notes..."
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="recorded">Recorded</SelectItem>
                        <SelectItem value="editing">Editing</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="45"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormLabel>Publish Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !publishDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {publishDate ? format(publishDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={publishDate}
                    onSelect={setPublishDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Topics */}
            <div>
              <FormLabel>Topics</FormLabel>
              <div className="flex gap-2 mt-1">
                <Input 
                  placeholder="Add topic..."
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic())}
                />
                <Button type="button" onClick={addTopic} variant="outline">Add</Button>
              </div>
              {topics.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {topics.map((topic, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {topic}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeTopic(topic)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Guests */}
            <div>
              <FormLabel>Guests</FormLabel>
              <div className="flex gap-2 mt-1">
                <Input 
                  placeholder="Add guest name..."
                  value={newGuest}
                  onChange={(e) => setNewGuest(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGuest())}
                />
                <Button type="button" onClick={addGuest} variant="outline">Add</Button>
              </div>
              {guests.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {guests.map((guest, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {guest}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeGuest(guest)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="youtubeUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>YouTube URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://youtube.com/..." {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="spotifyUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Spotify URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://spotify.com/..." {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Production notes, ideas, follow-ups..."
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createEpisodeMutation.isPending}
                className="min-w-[100px]"
              >
                {createEpisodeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Episode"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}