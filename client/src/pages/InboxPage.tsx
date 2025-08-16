import { useState } from "react";
import { Zap, Archive, UserPlus, Search, Star, ChevronDown } from "lucide-react";

interface InboxItem {
  id: string;
  from: string;
  subject: string;
  preview: string;
  avatar: string;
  time: string;
  selected?: boolean;
}

export default function InboxPage() {
  const [selectedItem, setSelectedItem] = useState<string | null>("ninja-usage");

  const inboxItems: InboxItem[] = [
    {
      id: "ninja-usage",
      from: "Holly Figum", 
      subject: "Ninja - usage rights confirm",
      preview: "confirming 3 months paid usage across paid social. Please share raw and edited files. Content can go live from 11 Aug...",
      avatar: "HF",
      time: "Today 12:04",
      selected: true
    },
    {
      id: "alteration-yard",
      from: "BTS Folder",
      subject: "The Alteration Yard - transcript ready", 
      preview: "BTS Folder",
      avatar: "BY",
      time: "Yesterday"
    },
    {
      id: "gdk-experimental",
      from: "Holly × GDK",
      subject: "Brand: GDK Experimental Series",
      preview: "Holly × GDK",
      avatar: "GD",
      time: "Yesterday"
    },
    {
      id: "typeform-inbound", 
      from: "Typeform",
      subject: "Typeform - New inbound: forest site",
      preview: "Typeform",
      avatar: "TF",
      time: "2 days ago"
    },
    {
      id: "british-snacks",
      from: "Notes",
      subject: "Top 5: British snacks foreigners hate",
      preview: "Notes", 
      avatar: "NS",
      time: "3 days ago"
    },
    {
      id: "record-abby",
      from: "Google Cal",
      subject: "Record with Abby - slot request",
      preview: "Google Cal",
      avatar: "GC", 
      time: "1 week ago"
    }
  ];

  const selectedEmail = inboxItems.find(item => item.id === selectedItem);

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
        </div>
      </div>

      <div className="grid grid-cols-5 gap-24 h-full">
        {/* Left Column - Inbox List */}
        <div className="col-span-2 card">
          <div className="card__header">
            <h3 className="card__title">Messages</h3>
            <div className="glass-pill">{inboxItems.length}</div>
          </div>
          <div className="card__content p-0">
          <h2 className="text-h2 mb-8">Inbox</h2>
          <p className="text-meta">One big problem. One new big. Archive. Assign. Or close.</p>
        </div>
        
        <div className="space-y-2">
          {inboxItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item.id)}
              className={`
                p-16 cursor-pointer transition-all duration-160 relative
                ${selectedItem === item.id 
                  ? 'bg-action-cyan-500 bg-opacity-8 border-l-2'
                  : 'hover:bg-surface-2'
                }
              `}
              style={{
                borderLeftColor: selectedItem === item.id ? 'var(--action-cyan-500)' : 'transparent'
              }}
            >
              <div className="flex items-start gap-12">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium"
                     style={{ background: 'var(--surface-2)', color: 'var(--ink-200)' }}>
                  {item.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-medium text-ink-200 truncate">{item.from}</p>
                    <span className="text-meta">{item.time}</span>
                  </div>
                  <h4 className="text-sm font-medium text-ink-200 mb-4">{item.subject}</h4>
                  <p className="text-meta text-sm truncate">{item.preview}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center Column - Email Detail */}
      <div className="col-span-5 flex flex-col">
        {selectedEmail && (
          <>
            {/* Email Header */}
            <div className="p-24 border-b" style={{ borderColor: 'var(--border-1)' }}>
              <div className="flex items-center justify-between mb-16">
                <h3 className="text-h3">{selectedEmail.subject}</h3>
                <span className="text-meta">{selectedEmail.time}</span>
              </div>
              <div className="flex items-center gap-12 mb-16">
                <div className="w-12 h-12 rounded-full flex items-center justify-center"
                     style={{ background: 'var(--surface-2)' }}>
                  {selectedEmail.avatar}
                </div>
                <div>
                  <p className="font-medium text-ink-200">From: {selectedEmail.from}</p>
                  <p className="text-meta">&lt;holly.figum@holly.com&gt;</p>
                </div>
              </div>
            </div>

            {/* Email Content */}
            <div className="flex-1 p-24" style={{ maxWidth: '64ch' }}>
              <div className="text-body space-y-16" style={{ lineHeight: '1.6' }}>
                <p>Hi Curtis,</p>
                <p>
                  Confirming 3 months paid usage across paid social. Please share raw and edited files. 
                  Content can go live from 11 Aug.
                </p>
                <p>Best, Holly</p>
              </div>

              {/* Action Row */}
              <div className="flex items-center gap-12 mt-32">
                <button className="btn btn--primary">
                  <Zap className="w-4 h-4" />
                  Turn into task
                </button>
                <button className="btn btn--secondary">
                  Add to project
                </button>
                <button className="btn btn--secondary">
                  Assign
                </button>
                <button className="btn btn--secondary">
                  <Archive className="w-4 h-4" />
                  Archive
                </button>
              </div>

              {/* Attachments */}
              <div className="mt-24 p-16 rounded-lg" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)' }}>
                <h4 className="text-meta mb-12">ATTACHMENTS</h4>
                <div className="flex items-center gap-12">
                  <div className="glass-pill">📄 Contract.pdf</div>
                  <div className="glass-pill">🖼️ Thumbnail.png</div>
                </div>
              </div>
            </div>

            {/* AI Parse Section */}
            <div className="p-24 border-t" style={{ borderColor: 'var(--border-1)' }}>
              <h4 className="text-h3 mb-16">AI Parse</h4>
              <div className="space-y-12">
                {[
                  { step: 1, title: "Create task: Deliver Ninja V3 by 6 Aug", status: "Owner Envim + High" },
                  { step: 2, title: "Add usage window: 13 Aug-11 Nov to Deal", status: "" },
                  { step: 3, title: "Schedule reminder: 9 Aug go live", status: "" }
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-16 p-12 rounded-lg" 
                       style={{ background: 'var(--surface-2)', border: '1px solid var(--border-1)' }}>
                    <span className="text-meta">{item.step})</span>
                    <span className="flex-1 text-body">{item.title}</span>
                    {item.status && <div className="glass-pill">{item.status}</div>}
                    <button className="glass-pill glass-pill--selected">Apply</button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right Column - Insights */}
      <div className="col-span-3 p-24" style={{ background: 'var(--surface-1)', borderLeft: '1px solid var(--border-2)' }}>
        <div className="card">
          <div className="card__header">
            <h3 className="card__title">Context</h3>
          </div>
          <div className="card__content">
            <div className="space-y-16">
              <div>
                <h4 className="text-meta mb-8">TASK COACH</h4>
                <h3 className="text-h3 mb-8">Prioritize today</h3>
                <p className="text-body text-sm mb-12">
                  Move Ninja first cut to morning. Slot Abby outreach after lunch.
                </p>
                <button className="btn btn--primary glow-cyan w-full">
                  <Zap className="w-4 h-4" />
                  Slot this
                </button>
              </div>
              
              <div className="space-y-8">
                <div>
                  <h4 className="text-meta mb-8">AI SUGGESTIONS</h4>
                  <p className="text-body text-sm">
                    Prioritize today
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}