-- Fix corrupted tempo field data
-- Issue: Tempo values showing question marks (2???1???2) instead of hyphens (2-1-2)
-- Cause: Character encoding corruption during data migration from old app
-- Date: 2026-02-26

UPDATE exercise
SET tempo = REPLACE(tempo, '???', '-')
WHERE tempo LIKE '%?%';

-- This fixes 57 exercises with corrupted tempo notation
