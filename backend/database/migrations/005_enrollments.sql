CREATE TABLE enrollments (
  enrollment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses (course_id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE (student_id, course_id)
);