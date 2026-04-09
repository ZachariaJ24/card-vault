-- Add grade column to cards table
-- Run this in Supabase SQL Editor before seeding
-- Each card row now represents a specific card + grade combo

ALTER TABLE cards ADD COLUMN IF NOT EXISTS grade TEXT;

-- Create a unique constraint so the same card+grade isn't duplicated
-- (player_name + card_set + grade should be unique)
CREATE UNIQUE INDEX IF NOT EXISTS cards_unique_grade
  ON cards (name, COALESCE(grade, 'RAW'));

-- Update existing cards that don't have a grade to 'RAW'
UPDATE cards SET grade = 'RAW' WHERE grade IS NULL;
