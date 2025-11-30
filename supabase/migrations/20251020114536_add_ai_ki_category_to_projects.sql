ALTER TYPE project_category ADD VALUE 'ai_ki';

-- To rollback this migration, you would need to run:
-- ALTER TYPE project_category RENAME VALUE 'ai_ki' TO 'ai_ki_old';
-- ALTER TYPE project_category DROP VALUE 'ai_ki_old';
