import React from 'react';
import { Trash2, AlertTriangle, Shield } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { usePermissions } from '../../contexts/PermissionContext';
import { useToastContext } from '../../contexts/ToastContext';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName: string;
  module: 'warehouse' | 'accounting' | 'documents' | 'payments';
  isLoading?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  module,
  isLoading = false
}) => {
  const { canDelete, isAdmin, isManager } = usePermissions();
  const { showToast } = useToastContext();

  const handleConfirm = () => {
    if (!canDelete(module)) {
      showToast({
        title: 'Permission Denied',
        type: 'error',
        description: 'You do not have permission to delete this item. Please contact an administrator.'
      });
      return;
    }

    onConfirm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <Card className="relative w-full max-w-md mx-4 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <Trash2 className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-[#b0b0d0] text-sm">
              {isAdmin ? 'Admin' : isManager ? 'Manager' : 'User'} • {module}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-[#b0b0d0] mb-3">{message}</p>
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-red-400 text-sm font-medium">
                This action cannot be undone
              </span>
            </div>
          </div>
        </div>

        {/* Permission Check */}
        {!canDelete(module) && (
          <div className="mb-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-yellow-500" />
              <span className="text-yellow-400 text-sm">
                You need admin or manager permissions to delete {module} items
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end space-x-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={isLoading || !canDelete(module)}
            className="flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete {itemName}
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default DeleteConfirmationModal; 