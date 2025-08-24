import React from 'react';
import { Dialog, DialogContent } from '../ui/dialog';
import { Input } from '../ui/input';

export function useCommandPalette() {
  const [open, setOpen] = React.useState(false);
  
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes('mac');
      if ((isMac && e.metaKey && e.key.toLowerCase() === 'k') || (!isMac && e.ctrlKey && e.key.toLowerCase() === 'k')) {
        e.preventDefault(); 
        setOpen((v) => !v);
      }
    };
    
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  
  return { open, setOpen } as const;
}

export function CommandPalette({ 
  open, 
  onOpenChange, 
  onAction 
}: { 
  open: boolean; 
  onOpenChange: (v: boolean) => void; 
  onAction: (id: string) => void; 
}) {
  const [q, setQ] = React.useState('');
  
  const actions = [
    { id: 'deal:new', label: 'New deal', icon: '💼' },
    { id: 'contact:new', label: 'New contact', icon: '👤' },
    { id: 'task:new', label: 'New task', icon: '✅' },
    { id: 'company:new', label: 'New company', icon: '🏢' },
    { id: 'quote:new', label: 'New quote', icon: '📄' },
  ];
  
  const filtered = actions.filter(a => 
    a.label.toLowerCase().includes(q.toLowerCase())
  );
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-[#2d014d] text-white max-w-md">
        <div className="border-b border-[#2d014d] p-3">
          <Input 
            autoFocus 
            placeholder="Type a command…" 
            value={q} 
            onChange={(e) => setQ(e.target.value)}
            className="bg-[#23233a]/60 border-[#2d014d] text-white placeholder-[#b0b0d0] focus:border-[#a259ff] focus:ring-[#a259ff]/20"
          />
        </div>
        <div className="max-h-64 overflow-auto">
          {filtered.map(a => (
            <button 
              key={a.id} 
              className="w-full text-left px-3 py-3 hover:bg-[#2d014d]/20 transition-colors flex items-center gap-3"
              onClick={() => { 
                onAction(a.id); 
                onOpenChange(false); 
              }}
            >
              <span className="text-lg">{a.icon}</span>
              <span className="text-[#b0b0d0]">{a.label}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="px-3 py-6 text-sm opacity-60 text-center">No commands found</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
