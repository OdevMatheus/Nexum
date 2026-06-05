CREATE TABLE notifications (
                               id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
                               owner_id     UUID        NOT NULL REFERENCES users(id),
                               subscription_id UUID     NOT NULL REFERENCES subscriptions(id),
                               type         VARCHAR(50) NOT NULL,
                               message      TEXT        NOT NULL,
                               read         BOOLEAN     NOT NULL DEFAULT FALSE,
                               created_at   TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_owner_id  ON notifications(owner_id);
CREATE INDEX idx_notifications_owner_unread ON notifications(owner_id, read) WHERE read = FALSE;