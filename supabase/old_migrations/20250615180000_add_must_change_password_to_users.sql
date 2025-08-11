-- Add must_change_password column to users table
ALTER TABLE users
ADD COLUMN must_change_password boolean NOT NULL DEFAULT false; 