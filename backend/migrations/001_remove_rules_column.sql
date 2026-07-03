-- Migration: Remove rules column from games table
-- Date: 2026-07-04
-- Description: The rules attribute has been removed from the Game entity

-- Drop the rules column if it exists
ALTER TABLE games DROP COLUMN IF EXISTS rules;

-- Verify the column is removed
-- \d games (PostgreSQL command to describe table)
