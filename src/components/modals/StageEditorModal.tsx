import React from 'react';
import { Modal } from '../ui/Modal';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/Button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';

export type StageModel = {
  id: string;
  name: string;
  color: string | null;
  position: number;
  probability: number | null;
  wip_limit?: number | null;
  org_id?: string;
};

export function StageEditorModal({ open, onOpenChange, stages, orgId }: { open: boolean; onOpenChange: (v: boolean) => void; stages: StageModel[]; orgId?: string; }) {
  const qc = useQueryClient();
  const [rows, setRows] = React.useState<StageModel[]>(stages);

  React.useEffect(() => setRows(stages), [stages]);

  const updateStage = useMutation({
    mutationFn: async (s: StageModel) => {
      const { error } = await supabase
        .from('pipeline_stages')
        .update({
          name: s.name,
          color: s.color,
          position: s.position,
          probability: s.probability ?? 0,
          wip_limit: s.wip_limit ?? null
        })
        .eq('id', s.id);
      if (error) throw error;
    },
  });

  const createStage = useMutation({
    mutationFn: async () => {
      if (!orgId) throw new Error('No org');
      const maxPos = Math.max(0, ...rows.map(r => r.position || 0));
      const { data, error } = await supabase
        .from('pipeline_stages')
        .insert({
          org_id: orgId,
          name: 'New Stage',
          position: maxPos + 1,
          color: '#6E56CF',
          probability: 0
        })
        .select('id')
        .single();
      if (error) throw error;
      return data?.id as string;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stages', orgId] })
  });

  const removeStage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('pipeline_stages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stages', orgId] })
  });

  const saveAll = async () => {
    await Promise.all(rows.map(r => updateStage.mutateAsync(r)));
    await qc.invalidateQueries({ queryKey: ['stages', orgId] });
    onOpenChange(false);
  };

  const setRow = (i: number, patch: Partial<StageModel>) =>
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, ...patch } : r));

  const move = (i: number, dir: -1 | 1) => setRows(prev => {
    const copy = [...prev];
    const j = i + dir;
    if (j < 0 || j >= copy.length) return prev;
    [copy[i], copy[j]] = [copy[j], copy[i]];
    return copy.map((r, k) => ({ ...r, position: k }));
  });

  return (
    <Modal open={open} onClose={() => onOpenChange(false)} size="3xl" title="Edit Stages">
      <div className="space-y-4">
        {rows.map((r, i) => (
          <div key={r.id} className="grid grid-cols-12 gap-3 items-center border rounded-lg p-3">
            <div className="col-span-3">
              <Label className="text-xs">Name</Label>
              <Input
                value={r.name}
                onChange={(e) => setRow(i, { name: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Color</Label>
              <div className="flex items-center gap-2">
                <div
                  className="h-6 w-6 rounded border"
                  style={{ background: r.color || '#6E56CF' }}
                />
                <Input
                  type="color"
                  value={r.color || '#6E56CF'}
                  onChange={(e) => setRow(i, { color: e.target.value })}
                  className="w-16 h-8 p-1"
                />
              </div>
            </div>
            <div className="col-span-3">
              <Label className="text-xs">Probability: {r.probability ?? 0}%</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="5"
                value={r.probability ?? 0}
                onChange={(e) => setRow(i, { probability: Number(e.target.value) })}
              />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">WIP limit</Label>
              <Input
                type="number"
                min="0"
                value={r.wip_limit ?? ''}
                onChange={(e) => setRow(i, { wip_limit: e.target.value ? Number(e.target.value) : null })}
                placeholder="—"
              />
            </div>
            <div className="col-span-2 flex gap-2 justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => move(i, -1)}
                disabled={i === 0}
              >
                ↑
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => move(i, 1)}
                disabled={i === rows.length - 1}
              >
                ↓
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm('Delete stage?')) removeStage.mutate(r.id);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => createStage.mutate()}>
            + Add Stage
          </Button>
          <div className="space-x-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={saveAll} disabled={updateStage.isPending}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
