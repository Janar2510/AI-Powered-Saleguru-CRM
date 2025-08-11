-- Script to promote a user to admin role
-- Replace 'user@example.com' with the actual email of the user you want to promote

UPDATE user_profiles 
SET 
  role = 'admin',
  permissions = '["warehouse.delete", "warehouse.edit", "warehouse.create", "accounting.delete", "accounting.edit", "accounting.create", "documents.delete", "documents.edit", "documents.create", "payments.delete", "payments.edit", "payments.create", "users.manage", "settings.manage"]'::jsonb
WHERE email = 'user@example.com';

-- To promote a user by their UUID instead:
-- UPDATE user_profiles 
-- SET 
--   role = 'admin',
--   permissions = '["warehouse.delete", "warehouse.edit", "warehouse.create", "accounting.delete", "accounting.edit", "accounting.create", "documents.delete", "documents.edit", "documents.create", "payments.delete", "payments.edit", "payments.create", "users.manage", "settings.manage"]'::jsonb
-- WHERE id = 'your-user-uuid-here'; 