CREATE TABLE plans (
                       id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       owner_id            UUID NOT NULL REFERENCES users(id),
                       name                VARCHAR(255) NOT NULL,
                       description         TEXT,
                       amount_cents        INTEGER NOT NULL,
                       recurrence          VARCHAR(20) NOT NULL,
                       custom_days         INTEGER,
                       trial_days          INTEGER NOT NULL DEFAULT 0,
                       max_subscriptions   INTEGER,
                       features            TEXT,
                       active              BOOLEAN NOT NULL DEFAULT TRUE,
                       archived_at         TIMESTAMPTZ,
                       created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                       updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

                       CONSTRAINT chk_amount_cents CHECK (amount_cents >= 100),
                       CONSTRAINT chk_trial_days CHECK (trial_days >= 0),
                       CONSTRAINT chk_custom_days CHECK (custom_days IS NULL OR custom_days >= 1),
                       CONSTRAINT chk_max_subscriptions CHECK (max_subscriptions IS NULL OR max_subscriptions >= 1),
                       CONSTRAINT chk_custom_recurrence CHECK (
                           recurrence != 'CUSTOM' OR custom_days IS NOT NULL
)
    );

CREATE INDEX idx_plans_owner_id ON plans(owner_id);
CREATE INDEX idx_plans_active ON plans(active);
CREATE INDEX idx_plans_owner_active ON plans(owner_id, active);