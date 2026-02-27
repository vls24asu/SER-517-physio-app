-- Fix corrupted character encoding in exercise table
-- Issue: Question marks (???) appearing instead of proper punctuation
-- Cause: Unicode character corruption during data migration from old app
-- Date: 2026-02-26

-- Fix tempo field: 2???1???2 → 2-1-2 (57 exercises)
UPDATE exercise
SET tempo = REPLACE(tempo, '???', '-')
WHERE tempo LIKE '%?%';

-- Fix name field: Child???s Pose → Child's Pose (1 exercise)
UPDATE exercise
SET name = REPLACE(name, '???', "'")
WHERE name LIKE '%?%';

-- Fix tips field (3 exercises)
UPDATE exercise
SET tips = REPLACE(tips, '???', "'")
WHERE tips LIKE '%?%';

-- Fix position field (1 exercise)
UPDATE exercise
SET position = REPLACE(position, '???', "'")
WHERE position LIKE '%?%';

-- Fix common_mistakes field (if needed)
UPDATE exercise
SET common_mistakes = REPLACE(common_mistakes, '???', "'")
WHERE common_mistakes LIKE '%?%';

-- Fix equipment_needed field (if needed)
UPDATE exercise
SET equipment_needed = REPLACE(equipment_needed, '???', "'")
WHERE equipment_needed LIKE '%?%';
