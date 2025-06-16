import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Send, AtSign, User, Clock, Edit, Trash2 } from 'lucide-react';
import Badge from '../ui/Badge';

interface DealNote {
  id: string;
  author_id: string;
  author_name: string;
  note_text: string;
  mentions: string[];
  timestamp: Date;
  is_edited?: boolean;
}

interface DealNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: {
    id: string;
    deal_id: string;
    title: string;
    company: string;
  };
}

const DealNotesModal: React.FC<DealNotesModalProps> = ({ isOpen, onClose, deal }) => {
  const [notes, setNotes] = useState<DealNote[]>([
    {
      id: '1',
      author_id: 'janar-kuusk',
      author_name: 'Janar Kuusk',
      note_text: 'Had a great call with @john-smith about the implementation timeline. They\'re excited about Q3 rollout.',
      mentions: ['john-smith'],
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: '2',
      author_id: 'sarah-wilson',
      author_name: 'Sarah Wilson',
      note_text: 'Sent technical documentation. @mike-chen please review the security requirements section.',
      mentions: ['mike-chen'],
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
    },
    {
      id: '3',
      author_id: 'janar-kuusk',
      author_name: 'Janar Kuusk',
      note_text: 'Contract terms look good. Waiting for legal review from their side. Should hear back by Friday.',
      mentions: [],
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  ]);

  const [newNote, setNewNote] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const teamMembers = [
    { id: 'john-smith', name: 'John Smith', role: 'Client Contact' },
    { id: 'sarah-wilson', name: 'Sarah Wilson', role: 'Account Manager' },
    { id: 'mike-chen', name: 'Mike Chen', role: 'Technical Lead' },
    { id: 'lisa-park', name: 'Lisa Park', role: 'Sales Engineer' },
    { id: 'david-brown', name: 'David Brown', role: 'Project Manager' }
  ];

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleNoteChange = (value: string) => {
    setNewNote(value);
    
    // Check for @ mentions
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const textAfterAt = value.substring(lastAtIndex + 1);
      if (!textAfterAt.includes(' ') && textAfterAt.length > 0) {
        setMentionQuery(textAfterAt);
        setShowMentions(true);
        setCursorPosition(lastAtIndex);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (member: typeof teamMembers[0]) => {
    const beforeAt = newNote.substring(0, cursorPosition);
    const afterMention = newNote.substring(cursorPosition + mentionQuery.length + 1);
    const newText = `${beforeAt}@${member.name}${afterMention}`;
    
    setNewNote(newText);
    setShowMentions(false);
    setMentionQuery('');
    
    // Focus back to textarea
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@([A-Za-z\s]+)(?=\s|$)/g;
    const mentions: string[] = [];
    let match;
    
    while ((match = mentionRegex.exec(text)) !== null) {
      const mentionedName = match[1].trim();
      const member = teamMembers.find(m => m.name.toLowerCase() === mentionedName.toLowerCase());
      if (member) {
        mentions.push(member.id);
      }
    }
    
    return mentions;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const mentions = extractMentions(newNote);
    
    const note: DealNote = {
      id: Date.now().toString(),
      author_id: 'janar-kuusk',
      author_name: 'Janar Kuusk',
      note_text: newNote,
      mentions,
      timestamp: new Date()
    };

    setNotes(prev => [note, ...prev]);
    setNewNote('');
    
    // In real implementation, save to Supabase deal_notes table
    console.log('Saving note:', {
      deal_id: deal.id,
      ...note
    });
  };

  const renderNoteText = (text: string, mentions: string[]) => {
    if (mentions.length === 0) return text;

    let renderedText = text;
    mentions.forEach(mentionId => {
      const member = teamMembers.find(m => m.id === mentionId);
      if (member) {
        const mentionRegex = new RegExp(`@${member.name}`, 'gi');
        renderedText = renderedText.replace(
          mentionRegex,
          `<span class="bg-primary-600/20 text-primary-300 px-1 rounded">@${member.name}</span>`
        );
      }
    });

    return <span dangerouslySetInnerHTML={{ __html: renderedText }} />;
  };

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary-800 rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-700">
          <div>
            <h3 className="text-xl font-semibold text-white">Deal Notes</h3>
            <p className="text-secondary-400 text-sm mt-1">
              {deal.deal_id} - {deal.title} ({deal.company})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="bg-secondary-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{note.author_name}</h4>
                    <div className="flex items-center space-x-2 text-xs text-secondary-400">
                      <Clock className="w-3 h-3" />
                      <span>{note.timestamp.toLocaleString()}</span>
                      {note.is_edited && <Badge variant="secondary" size="sm">Edited</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-1 text-secondary-400 hover:text-white transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-secondary-400 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="text-secondary-200 leading-relaxed">
                {renderNoteText(note.note_text, note.mentions)}
              </div>
              
              {note.mentions.length > 0 && (
                <div className="flex items-center space-x-2 mt-3">
                  <AtSign className="w-4 h-4 text-secondary-400" />
                  <div className="flex space-x-1">
                    {note.mentions.map((mentionId) => {
                      const member = teamMembers.find(m => m.id === mentionId);
                      return member ? (
                        <Badge key={mentionId} variant="primary" size="sm">
                          {member.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}

          {notes.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-secondary-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-secondary-400" />
              </div>
              <p className="text-secondary-400">No notes yet</p>
              <p className="text-secondary-500 text-sm mt-1">Add the first note to start collaborating</p>
            </div>
          )}
        </div>

        {/* Add Note Form */}
        <div className="border-t border-secondary-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={newNote}
                onChange={(e) => handleNoteChange(e.target.value)}
                placeholder="Add a note... Use @name to mention team members"
                rows={3}
                className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600 resize-none"
              />
              
              {/* Mention Dropdown */}
              {showMentions && filteredMembers.length > 0 && (
                <div className="absolute bottom-full left-0 mb-2 w-64 bg-secondary-700 border border-secondary-600 rounded-lg shadow-lg z-10">
                  <div className="p-2">
                    <div className="text-xs text-secondary-400 mb-2">Mention team member:</div>
                    {filteredMembers.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => insertMention(member)}
                        className="w-full text-left p-2 hover:bg-secondary-600 rounded-lg transition-colors"
                      >
                        <div className="font-medium text-white">{member.name}</div>
                        <div className="text-xs text-secondary-400">{member.role}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-xs text-secondary-400">
                Use @name to mention team members and notify them
              </div>
              <button
                type="submit"
                disabled={!newNote.trim()}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>Add Note</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DealNotesModal;