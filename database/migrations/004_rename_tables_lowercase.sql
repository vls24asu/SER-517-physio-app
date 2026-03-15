-- Migration 004: Rename tables to lowercase for Linux/Railway case-sensitive compatibility
-- Run this ONCE on the Railway MySQL database after DDL.sql
-- Linux MySQL is case-sensitive; DAOs query: exercise, muscle_group, exercise_muscle_group

RENAME TABLE `Exercise`              TO `exercise`;
RENAME TABLE `Muscle_Group`          TO `muscle_group`;
RENAME TABLE `Exercise_Muscle_Group` TO `exercise_muscle_group`;
