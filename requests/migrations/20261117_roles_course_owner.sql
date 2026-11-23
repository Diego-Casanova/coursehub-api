-- Apply once to an existing PostgreSQL database before deploying this version.
DO $$
BEGIN
  CREATE TYPE user_role_enum AS ENUM ('admin', 'teacher', 'student');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user' AND column_name = 'role'
  ) THEN
    ALTER TABLE "user" ADD COLUMN "role" user_role_enum NOT NULL DEFAULT 'student';
  ELSE
    ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT;
    ALTER TABLE "user" ALTER COLUMN "role" TYPE user_role_enum
      USING "role"::text::user_role_enum;
    ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'student';
  END IF;
END $$;

ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS "ownerId" integer;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_attribute a
      ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
    WHERE c.contype = 'f'
      AND c.conrelid = 'courses'::regclass
      AND c.confrelid = '"user"'::regclass
      AND a.attname = 'ownerId'
  ) THEN
    ALTER TABLE courses
      ADD CONSTRAINT "FK_courses_owner_user"
      FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE SET NULL;
  END IF;
END $$;
