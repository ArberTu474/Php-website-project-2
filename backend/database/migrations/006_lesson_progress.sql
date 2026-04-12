CREATE TABLE lesson_progress (
  progress_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES enrollments (enrollment_id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons (lesson_id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (enrollment_id, lesson_id)
);