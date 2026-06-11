ALTER TABLE users ADD COLUMN password_reset_token VARCHAR(255);
ALTER TABLE users ADD COLUMN password_reset_token_expires_at TIMESTAMPTZ;

CREATE INDEX idx_users_reset_token ON users(password_reset_token)
    WHERE password_reset_token IS NOT NULL;
