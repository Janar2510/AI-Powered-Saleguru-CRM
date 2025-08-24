import React from 'react';
import { Modal } from '../ui/Modal';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/Button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';

export function CreateDealModal({ 
  open, 
  onOpenChange, 
  stages, 
  companies, 
  contacts 
}: { 
  open: boolean; 
  onOpenChange: (v: boolean) => void; 
  stages: any[]; 
  companies: any[]; 
  contacts: any[]; 
}) {
  const qc = useQueryClient();
  const [title, setTitle] = React.useState('');
  const [value, setValue] = React.useState('');
  const [stageId, setStageId] = React.useState('');
  const [companyId, setCompanyId] = React.useState('');
  const [contactId, setContactId] = React.useState('');

  const createDeal = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('deals')
        .insert({
          title,
          value_cents: value ? parseInt(value) * 100 : null,
          stage_id: stageId,
          company_id: companyId || null,
          contact_id: contactId || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deals'] });
      onOpenChange(false);
      setTitle('');
      setValue('');
      setStageId('');
      setCompanyId('');
      setContactId('');
    }
  });

  return (
    <Modal 
      open={open} 
      onClose={() => onOpenChange(false)} 
      size="lg" 
      title="Create New Deal"
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Deal Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter deal title..."
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="value">Value ($)</Label>
          <Input
            id="value"
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter deal value..."
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="stage">Stage</Label>
          <select
            id="stage"
            value={stageId}
            onChange={(e) => setStageId(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">Select a stage</option>
            {stages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <Label htmlFor="company">Company (Optional)</Label>
          <select
            id="company"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">Select a company</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <Label htmlFor="contact">Contact (Optional)</Label>
          <select
            id="contact"
            value={contactId}
            onChange={(e) => setContactId(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">Select a contact</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => createDeal.mutate()}
            disabled={!title || !stageId || createDeal.isPending}
          >
            {createDeal.isPending ? 'Creating...' : 'Create Deal'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
