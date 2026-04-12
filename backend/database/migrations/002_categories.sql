CREATE TABLE categories (
  category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL
);

-- Some defaults
INSERT INTO
  categories (name, slug)
VALUES
  ('Web Development', 'web-development'),
  ('Mobile Development', 'mobile-development'),
  ('Data Science', 'data-science'),
  ('Design', 'design'),
  ('Business', 'business'),
  ('Marketing', 'marketing'),
  ('Photography', 'photography'),
  ('Music', 'music');