CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  password_hash text NOT NULL,
  language text NOT NULL DEFAULT 'ar' CHECK (language IN ('ar', 'en')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx ON users (email);

CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS user_sessions_token_hash_unique_idx ON user_sessions (token_hash);
CREATE INDEX IF NOT EXISTS user_sessions_user_idx ON user_sessions (user_id);
CREATE INDEX IF NOT EXISTS user_sessions_expires_idx ON user_sessions (expires_at);
