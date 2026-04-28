CREATE TABLE modules (
  module_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (course_id, order_index)
);

CREATE TABLE lessons (
  lesson_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id     UUID NOT NULL REFERENCES modules(module_id) ON DELETE CASCADE,
  title         VARCHAR(255) NOT NULL,
  content       TEXT,        -- markdown content
  video_url     TEXT,
  order_index   INTEGER NOT NULL DEFAULT 0,
  duration_mins INTEGER,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (module_id, order_index)
);