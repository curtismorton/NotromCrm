import { useState } from "react";
import { Search, Archive, Star, ChevronDown, Reply, Forward, MoreHorizontal } from "lucide-react";

interface InboxItem {
  id: string;
  from: string;
  subject: string;
  preview: string;
  avatar: string;
  time: string;
  priority: "high" | "medium" | "low";
  isRead: boolean;
}

export default function InboxPageFixed() {
  const [selectedItem, setSelectedItem] = useState<string | null>("ninja-usage");
  const [viewMode, setViewMode] = useState<"list" | "detail">("detail");

  const inboxItems: InboxItem[] = [
    {
      id: "ninja-usage",
      from: "Holly Figum", 
      subject: "Ninja - usage rights confirm",
      preview: "confirming 3 months paid usage across paid social. Please share raw and edited files. Content can go live from 11 Aug...",
      avatar: "HF",
      time: "Today 12:04",
      priority: "high",
      isRead: false
    },
    {
      id: "alteration-yard",
      from: "BTS Folder",
      subject: "The Alteration Yard - transcript ready", 
      preview: "BTS Folder - episode ready for review",
      avatar: "BY",
      time: "Yesterday",
      priority: "medium",
      isRead: true
    },
    {
      id: "gdk-experimental",
      from: "Holly × GDK",
      subject: "Brand: GDK Experimental Series",
      preview: "New project brief for experimental content series",
      avatar: "GD",
      time: "Yesterday",
      priority: "medium",
      isRead: false
    },
    {
      id: "typeform-inbound", 
      from: "Typeform",
      subject: "Typeform - New inbound: forest site",
      preview: "New form submission from potential client",
      avatar: "TF",
      time: "2 days ago",
      priority: "low",
      isRead: true
    },
    {
      id: "british-snacks",
      from: "Notes",
      subject: "Top 5: British snacks foreigners hate",
      preview: "Content idea for upcoming episode", 
      avatar: "NS",
      time: "3 days ago",
      priority: "low",
      isRead: true
    }
  ];

  const selectedEmail = inboxItems.find(item => item.id === selectedItem);

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "high": return "priority--urgent";
      case "medium": return "priority--high";
      default: return "priority--medium";
    }
  };

  return (
    <div className="space-y-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 mb-8">Inbox</h1>
          <p className="text-meta">Process incoming items and organize your workflow.</p>
        </div>
        <div className="flex items-center gap-12">
          <div className="search-box">
            <Search className="search-box__icon" />
            <input 
              className="search-box__input" 
              placeholder="Search inbox..."
            />
          </div>
          <button className="btn btn--secondary btn--small">
            <Archive className="w-4 h-4" />
            Archive
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-24">
        {/* Left Column - Inbox List */}
        <div className="col-span-2 card">
          <div className="card__header">
            <div className="flex items-center justify-between">
              <h3 className="card__title">Messages</h3>
              <div className="glass-pill">{inboxItems.length}</div>
            </div>
          </div>
          <div className="card__content p-0">
            <div className="space-y-2">
              {inboxItems.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedItem(item.id)}
                  className={`p-12 cursor-pointer transition-all duration-160 rounded-lg flex items-start gap-12 ${
                    selectedItem === item.id 
                      ? 'bg-action-cyan-500 bg-opacity-15 ring-1 ring-action-cyan-500' 
                      : 'hover:bg-surface-2'
                  }`}
                >
                  <div className={`priority-spine ${getPriorityClass(item.priority)}`} style={{ height: '40px' }}></div>
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                    style={{ background: 'var(--surface-3)', color: 'var(--ink-200)' }}
                  >
                    {item.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-4">
                      <p className={`font-medium truncate ${item.isRead ? 'text-ink-300' : 'text-ink-200'}`}>
                        {item.from}
                      </p>
                      <span className="text-meta text-xs">{item.time}</span>
                    </div>
                    <p className={`text-sm mb-2 truncate ${item.isRead ? 'text-ink-300' : 'text-ink-100 font-medium'}`}>
                      {item.subject}
                    </p>
                    <p className="text-meta text-xs truncate">{item.preview}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Email Detail */}
        <div className="col-span-3 card">
          {selectedEmail ? (
            <>
              <div className="card__header">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-12">
                    <div className={`priority-spine ${getPriorityClass(selectedEmail.priority)}`} style={{ height: '24px' }}></div>
                    <div>
                      <h3 className="card__title">{selectedEmail.subject}</h3>
                      <p className="card__meta">From {selectedEmail.from} • {selectedEmail.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <button className="btn btn--secondary btn--small">
                      <Reply className="w-4 h-4" />
                    </button>
                    <button className="btn btn--secondary btn--small">
                      <Forward className="w-4 h-4" />
                    </button>
                    <button className="btn btn--secondary btn--small">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="card__content">
                <div className="space-y-16">
                  <div className="flex items-start gap-12">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center font-medium"
                      style={{ background: 'var(--action-cyan-500)', color: 'var(--ink-100)' }}
                    >
                      {selectedEmail.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="mb-12">
                        <p className="text-body font-medium text-ink-200 mb-4">{selectedEmail.from}</p>
                        <p className="text-meta">to Curtis • {selectedEmail.time}</p>
                      </div>
                      <div className="prose prose-invert max-w-none">
                        <p className="text-body text-ink-200 leading-relaxed">
                          {selectedEmail.id === "ninja-usage" && (
                            <>
                              Hi Curtis,<br/><br/>
                              Hope you're well! I'm confirming the usage rights for the Ninja collaboration content. 
                              We've agreed on 3 months paid usage across paid social channels.<br/><br/>
                              Please share both the raw files and edited versions when ready. The content can go 
                              live from August 11th onwards.<br/><br/>
                              Let me know if you need any clarification on the brief or timeline.<br/><br/>
                              Best,<br/>Holly
                            </>
                          )}
                          {selectedEmail.id === "alteration-yard" && (
                            <>
                              The transcript for "The Alteration Yard" episode is now ready for your review.
                              <br/><br/>
                              You can find it in the shared BTS folder. Please review and let us know if any 
                              corrections are needed before we proceed with final editing.
                            </>
                          )}
                          {selectedEmail.id === "gdk-experimental" && (
                            <>
                              New project brief available for the GDK Experimental Series collaboration.
                              <br/><br/>
                              This is an exciting opportunity to explore creative content formats. 
                              The brief includes technical requirements and creative direction.
                            </>
                          )}
                          {!["ninja-usage", "alteration-yard", "gdk-experimental"].includes(selectedEmail.id) && (
                            selectedEmail.preview
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-8 pt-16 border-t" style={{ borderColor: 'var(--border-1)' }}>
                    <button className="btn btn--primary btn--small">Reply</button>
                    <button className="btn btn--secondary btn--small">Forward</button>
                    <button className="btn btn--secondary btn--small">Archive</button>
                    <button className="btn btn--secondary btn--small">
                      <Star className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="card__content">
              <div className="flex items-center justify-center h-64">
                <p className="text-meta">Select a message to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}