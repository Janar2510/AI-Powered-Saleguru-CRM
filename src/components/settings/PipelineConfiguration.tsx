import React, { useState } from 'react';
import { Settings, Plus, GripVertical, Edit, Trash2, Target } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
  const [pipelines, setPipelines] = useState<Pipeline[]>([
    {
      id: 'sales-pipeline',
      name: 'Sales Pipeline',
      description: 'Standard B2B sales process',
      isDefault: true,
      stages: [
        { id: 'lead', name: 'Lead', color: 'bg-gray-500', probability: 10 },
        { id: 'qualified', name: 'Qualified', color: 'bg-blue-500', probability: 25 },
        { id: 'proposal', name: 'Proposal', color: 'bg-yellow-500', probability: 50 },
        { id: 'negotiation', name: 'Negotiation', color: 'bg-orange-500', probability: 75 },
        { id: 'closed-won', name: 'Closed Won', color: 'bg-green-500', probability: 100, isDefault: true },
        { id: 'closed-lost', name: 'Closed Lost', color: 'bg-red-500', probability: 0, isDefault: true }
      ]
    }
  ]);

  const [activePipeline, setActivePipeline] = useState('sales-pipeline');
  const [editingStage, setEditingStage] = useState<PipelineStage | null>(null);
  const [showStageModal, setShowStageModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const currentPipeline = pipelines.find(p => p.id === activePipeline);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const pipeline = pipelines.find(p => p.id === activePipeline);
      if (pipeline) {
        const oldIndex = pipeline.stages.findIndex(stage => stage.id === active.id);
        const newIndex = pipeline.stages.findIndex(stage => stage.id === over.id);
        
        const newStages = arrayMove(pipeline.stages, oldIndex, newIndex);
        
        setPipelines(prev => prev.map(p => 
          p.id === activePipeline 
            ? { ...p, stages: newStages }
            : p
        ));
        onChanges(true);
      }
    }
  };

  const handleAddStage = () => {
    setEditingStage({
      id: '',
      name: '',
      color: 'bg-blue-500',
      probability: 50
    });
    setShowStageModal(true);
  };

  const handleEditStage = (stage: PipelineStage) => {
    setEditingStage(stage);
    setShowStageModal(true);
  };

  const handleDeleteStage = (stageId: string) => {
    setPipelines(prev => prev.map(p => 
      p.id === activePipeline 
        ? { ...p, stages: p.stages.filter(s => s.id !== stageId) }
        : p
    ));
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
    <div className="space-y-6">
      {/* Pipeline Selection */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Target className="w-6 h-6 text-primary-600" />
            <h3 className="text-xl font-semibold text-white">Pipeline Configuration</h3>
          </div>
          <button className="btn-primary flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Pipeline</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pipelines.map((pipeline) => (
            <button
              key={pipeline.id}
              onClick={() => setActivePipeline(pipeline.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                activePipeline === pipeline.id
                  ? 'border-primary-600 bg-primary-600/10'
                  : 'border-secondary-600 hover:border-secondary-500'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white">{pipeline.name}</h4>
                {pipeline.isDefault && <Badge variant="primary" size="sm">Default</Badge>}
              </div>
              <p className="text-sm text-secondary-400">{pipeline.description}</p>
              <p className="text-xs text-secondary-500 mt-2">
                {pipeline.stages.length} stages
              </p>
            </button>
          ))}
        </div>
      </Card>

      {/* Pipeline Stages */}
      {currentPipeline && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-white">{currentPipeline.name} Stages</h3>
              <p className="text-secondary-400 mt-1">Drag and drop to reorder stages</p>
            </div>
            <button
              onClick={handleAddStage}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Stage</span>
            </button>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={currentPipeline.stages.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {currentPipeline.stages.map((stage) => (
                  <SortableStage
                    key={stage.id}
                    stage={stage}
                    onEdit={() => handleEditStage(stage)}
                    onDelete={() => handleDeleteStage(stage.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </Card>
      )}

      {/* Stage Modal */}
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
              <button
                onClick={() => setShowStageModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Save logic here
                  setShowStageModal(false);
                  onChanges(true);
                }}
                className="flex-1 btn-primary"
              >
                {editingStage.id ? 'Update' : 'Add'} Stage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PipelineConfiguration;