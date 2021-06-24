\echo 'Delete and recreate subchef db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE subchef;
CREATE DATABASE subchef;
\connect subchef

\i subchef-schema.sql
\i subchef-seed.sql

\echo 'Delete and recreate subchef_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE subchef_test;
CREATE DATABASE subchef_test;
\connect subchef_test

\i subchef-schema.sql
