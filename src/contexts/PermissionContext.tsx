import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// Permission types
export type Permission = 
  | 'warehouse.delete'
  | 'warehouse.edit'
  | 'warehouse.create'
  | 'accounting.delete'
  | 'accounting.edit'
  | 'accounting.create'
  | 'documents.delete'
  | 'documents.edit'
  | 'documents.create'
  | 'payments.delete'
  | 'payments.edit'
  | 'payments.create'
  | 'users.manage'
  | 'settings.manage';

// Role definitions with permissions
const ROLE_PERMISSIONS = {
  admin: [
    'warehouse.delete',
    'warehouse.edit',
    'warehouse.create',
    'accounting.delete',
    'accounting.edit',
    'accounting.create',
    'documents.delete',
    'documents.edit',
    'documents.create',
    'payments.delete',
    'payments.edit',
    'payments.create',
    'users.manage',
    'settings.manage'
  ],
  manager: [
    'warehouse.edit',
    'warehouse.create',
    'accounting.edit',
    'accounting.create',
    'documents.edit',
    'documents.create',
    'payments.edit',
    'payments.create'
  ],
  user: [
    'warehouse.create',
    'accounting.create',
    'documents.create',
    'payments.create'
  ]
} as const;

interface PermissionContextType {
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  isAdmin: boolean;
  isManager: boolean;
  canDelete: (module: 'warehouse' | 'accounting' | 'documents' | 'payments') => boolean;
  canEdit: (module: 'warehouse' | 'accounting' | 'documents' | 'payments') => boolean;
  canCreate: (module: 'warehouse' | 'accounting' | 'documents' | 'payments') => boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    
    const userRole = user.role || 'user';
    const permissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS] || ROLE_PERMISSIONS.user;
    
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  const isAdmin = hasPermission('users.manage');
  const isManager = hasPermission('warehouse.edit') && !isAdmin;

  const canDelete = (module: 'warehouse' | 'accounting' | 'documents' | 'payments'): boolean => {
    return hasPermission(`${module}.delete` as Permission);
  };

  const canEdit = (module: 'warehouse' | 'accounting' | 'documents' | 'payments'): boolean => {
    return hasPermission(`${module}.edit` as Permission);
  };

  const canCreate = (module: 'warehouse' | 'accounting' | 'documents' | 'payments'): boolean => {
    return hasPermission(`${module}.create` as Permission);
  };

  const value: PermissionContextType = {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isManager,
    canDelete,
    canEdit,
    canCreate
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
}; 