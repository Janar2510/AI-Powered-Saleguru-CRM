import React, { useState } from 'react';
import { Settings, Plus, GripVertical, Edit, Trash2, Target } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { supabase } from '../../services/supabase';
import { useEffect } from 'react';
import { BRAND } from '../../constants/theme';
import { Modal } from '../ui/Modal';

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  probability: number;
  isDefault?: boolean;
}

interface Pipeline {
  id: string;
  name: string;
  description: string;
  stages: PipelineStage[];
  isDefault: boolean;
}

interface PipelineConfigurationProps {
  onChanges: (hasChanges: boolean) => void;
}

const SortableStage: React.FC<{ stage: PipelineStage; onEdit: () => void; onDelete: () => void }> = ({ 
  stage, 
  onEdit, 
  onDelete 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: stage.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center space-x-4 p-4 bg-secondary-700 rounded-lg border border-secondary-600"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-secondary-400 hover:text-white"
      >
        <GripVertical className="w-5 h-5" />
      </div>
      
      <div className={`w-4 h-4 rounded-full ${stage.color}`}></div>
      
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <h4 className="font-medium text-white">{stage.name}</h4>
          {stage.isDefault && <Badge variant="primary" size="sm">Default</Badge>}
        </div>
        <p className="text-sm text-secondary-400">Win probability: {stage.probability}%</p>
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={onEdit}
          className="p-2 text-secondary-400 hover:text-white hover:bg-secondary-600 rounded-lg transition-colors"
        >
          <Edit className="w-4 h-4" />
        </button>
        {!stage.isDefault && (
          <button
            onClick={onDelete}
            className="p-2 text-secondary-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

const PipelineConfiguration: React.FC<PipelineConfigurationProps> = ({ onChanges }) => {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [activePipeline, setActivePipeline] = useState<string | null>(null);
  const [editingStage, setEditingStage] = useState<PipelineStage | null>(null);
  const [showStageModal, setShowStageModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null);
  const [pipelineForm, setPipelineForm] = useState({ name: '', description: '', isDefault: false });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch pipelines and stages from DB
  useEffect(() => {
    const fetchPipelines = async () => {
      const { data, error } = await supabase.from('pipelines').select('*').order('id');
      setPipelines(data || []);
      if (data && data.length > 0 && activePipeline === null) setActivePipeline(data[0].id);
    };
    fetchPipelines();
  }, []);

  useEffect(() => {
    if (activePipeline == null) return;
    const fetchStages = async () => {
      const { data, error } = await supabase.from('stages').select('*').eq('pipeline_id', activePipeline).order('sort_order');
      setStages(data || []);
    };
    fetchStages();
  }, [activePipeline]);

  const currentPipeline = pipelines.find(p => p.id === activePipeline);

  // Add, edit, delete, reorder handlers
  const handleAddStage = async (stage: Partial<PipelineStage>) => {
    if (!activePipeline) return;
    const { error } = await supabase.from('stages').insert({
      ...stage,
      pipeline_id: activePipeline,
      sort_order: stages.length,
      color: stage.color || '#6b7280',
      probability: stage.probability || 0
    });
    if (!error) {
      const { data } = await supabase.from('stages').select('*').eq('pipeline_id', activePipeline).order('sort_order');
      setStages(data || []);
    }
  };

  const handleEditStage = async (stageId: string, updates: Partial<PipelineStage>) => {
    const { error } = await supabase.from('stages').update(updates).eq('id', stageId);
    if (!error) {
      const { data } = await supabase.from('stages').select('*').eq('pipeline_id', activePipeline).order('sort_order');
      setStages(data || []);
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    const { error } = await supabase.from('stages').delete().eq('id', stageId);
    if (!error) {
      const { data } = await supabase.from('stages').select('*').eq('pipeline_id', activePipeline).order('sort_order');
      setStages(data || []);
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = stages.findIndex(stage => stage.id === active.id);
      const newIndex = stages.findIndex(stage => stage.id === over.id);
      const newStages = arrayMove(stages, oldIndex, newIndex);
      // Update sort_order in DB
      for (let i = 0; i < newStages.length; i++) {
        await supabase.from('stages').update({ sort_order: i }).eq('id', newStages[i].id);
      }
      setStages([...newStages]);
    }
  };

  // Pipeline settings handlers
  const openSettingsModal = (pipeline: Pipeline) => {
    setEditingPipeline(pipeline);
    setPipelineForm({ name: pipeline.name, description: pipeline.description, isDefault: pipeline.isDefault });
    setShowSettingsModal(true);
  };
  const handlePipelineFormChange = (field: string, value: any) => {
    setPipelineForm(prev => ({ ...prev, [field]: value }));
  };
  const handleSavePipelineSettings = async () => {
    if (!editingPipeline) return;
    // Update pipeline in DB (mocked here)
    // await supabase.from('pipelines').update({ ...pipelineForm }).eq('id', editingPipeline.id);
    setShowSettingsModal(false);
    onChanges(true);
  };

  const colors = [
    { value: 'bg-gray-500', label: 'Gray' },
    { value: 'bg-blue-500', label: 'Blue' },
    { value: 'bg-green-500', label: 'Green' },
    { value: 'bg-yellow-500', label: 'Yellow' },
    { value: 'bg-orange-500', label: 'Orange' },
    { value: 'bg-red-500', label: 'Red' },
    { value: 'bg-purple-500', label: 'Purple' },
    { value: 'bg-pink-500', label: 'Pink' }
  ];

  return (
    <div className={BRAND.DASHBOARD_LAYOUT.sectionSpacing}>
      {/* Pipeline Selection */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Target className="w-6 h-6 text-primary-600" />
            <h3 className={BRAND.DASHBOARD_LAYOUT.headerFont + ' text-white'}>Pipeline Configuration</h3>
          </div>
          <Button onClick={() => setShowCreateModal(true)} variant="gradient" size="lg" icon={Plus} className={BRAND.DASHBOARD_LAYOUT.buttonHeight + ' ' + BRAND.DASHBOARD_LAYOUT.buttonMinWidth}>
            New Pipeline
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pipelines.map((pipeline) => (
            <div className="relative group" key={pipeline.id}>
              <Button
                onClick={() => setActivePipeline(pipeline.id)}
                variant={activePipeline === pipeline.id ? 'gradient' : 'secondary'}
                fullWidth
                className="p-4 h-full text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white">{pipeline.name}</h4>
                  {pipeline.isDefault && <Badge variant="primary" size="sm">Default</Badge>}
                </div>
                <p className="text-sm text-secondary-400">{pipeline.description}</p>
                <p className="text-xs text-secondary-500 mt-2">
                  {(pipeline.stages ? pipeline.stages.length : 0)} stages
                </p>
              </Button>
              <button
                className="absolute top-2 right-2 opacity-70 group-hover:opacity-100 transition-opacity"
                onClick={() => openSettingsModal(pipeline)}
                title="Edit Pipeline Settings"
              >
                <Settings className="w-5 h-5 text-secondary-400 hover:text-primary-400" />
              </button>
            </div>
          ))}
        </div>
      </Card>
      {/* Pipeline Stages */}
      {currentPipeline && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={BRAND.DASHBOARD_LAYOUT.headerFont + ' text-white'}>{currentPipeline.name} Stages</h3>
              <p className={BRAND.DASHBOARD_LAYOUT.subheaderFont}>Drag and drop to reorder stages</p>
            </div>
            <Button
              onClick={() => {
                setEditingStage({
                  id: '',
                  name: '',
                  color: 'bg-blue-500',
                  probability: 50
                });
                setShowStageModal(true);
              }}
              variant="gradient"
              size="lg"
              icon={Plus}
              className={BRAND.DASHBOARD_LAYOUT.buttonHeight + ' ' + BRAND.DASHBOARD_LAYOUT.buttonMinWidth}
            >
              Add Stage
            </Button>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={(stages || []).map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {(stages || []).map((stage) => (
                  <SortableStage
                    key={stage.id}
                    stage={stage}
                    onEdit={() => {
                      setEditingStage(stage);
                      setShowStageModal(true);
                    }}
                    onDelete={() => handleDeleteStage(stage.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </Card>
      )}
      {/* Analytics Mini Bar Chart */}
      {currentPipeline && (
        <Card>
          <div className="mb-4">
            <h4 className="font-semibold text-white mb-2">Deals per Stage</h4>
            <div className="flex items-end space-x-4 h-32">
              {/* Mock data for now: replace with real data from deals table */}
              {(stages || []).map((stage, idx) => (
                <div key={stage.id} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 rounded-t-lg ${stage.color}`}
                    style={{ height: `${Math.max(10, Math.random() * 100)}px` }}
                  ></div>
                  <span className="text-xs text-white mt-2">{stage.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
      {/* Pipeline Settings Modal */}
      {showSettingsModal && editingPipeline && (
        <Modal open={showSettingsModal} onClose={() => setShowSettingsModal(false)}>
          <div className="space-y-6">
            <h3 className={BRAND.DASHBOARD_LAYOUT.headerFont + ' text-white'}>Edit Pipeline Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-2">Pipeline Name</label>
                <input
                  type="text"
                  value={pipelineForm.name}
                  onChange={e => handlePipelineFormChange('name', e.target.value)}
                  className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  placeholder="Enter pipeline name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-2">Description</label>
                <textarea
                  value={pipelineForm.description}
                  onChange={e => handlePipelineFormChange('description', e.target.value)}
                  className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  placeholder="Enter pipeline description"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={pipelineForm.isDefault}
                  onChange={e => handlePipelineFormChange('isDefault', e.target.checked)}
                  className="form-checkbox h-5 w-5 text-primary-600 rounded"
                  id="default-pipeline"
                />
                <label htmlFor="default-pipeline" className="text-white text-sm">Set as default pipeline</label>
              </div>
            </div>
            <div className="flex space-x-3 justify-end">
              <Button onClick={() => setShowSettingsModal(false)} variant="secondary" size="lg">Cancel</Button>
              <Button onClick={handleSavePipelineSettings} variant="gradient" size="lg">Save</Button>
            </div>
          </div>
        </Modal>
      )}
      {/* Stage Modal (unchanged) */}
      {showStageModal && editingStage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-secondary-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">
              {editingStage.id ? 'Edit Stage' : 'Add New Stage'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-2">
                  Stage Name
                </label>
                <input
                  type="text"
                  value={editingStage.name}
                  onChange={(e) => setEditingStage(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                  placeholder="Enter stage name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-2">
                  Color
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setEditingStage(prev => prev ? { ...prev, color: color.value } : null)}
                      className={`w-full h-10 rounded-lg border-2 ${color.value} ${
                        editingStage.color === color.value ? 'border-white' : 'border-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-300 mb-2">
                  Win Probability (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editingStage.probability}
                  onChange={(e) => setEditingStage(prev => prev ? { ...prev, probability: parseInt(e.target.value) } : null)}
                  className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                onClick={() => setShowStageModal(false)}
                variant="secondary"
                size="lg"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Save logic here
                  setShowStageModal(false);
                  onChanges(true);
                }}
                variant="gradient"
                size="lg"
                className="flex-1"
              >
                {editingStage.id ? 'Update' : 'Add'} Stage
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PipelineConfiguration;