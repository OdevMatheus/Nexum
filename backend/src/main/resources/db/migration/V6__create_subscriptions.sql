CREATE TABLE subscriptions (
                               id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               owner_id        UUID NOT NULL REFERENCES users(id),
                               client_id       UUID NOT NULL REFERENCES clients(id),
                               plan_id         UUID NOT NULL REFERENCES plans(id),
                               status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
                               start_date      DATE NOT NULL,
                               next_due_date   DATE NOT NULL,
                               cancelled_at    TIMESTAMPTZ,
                               created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                               updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE subscription_cycles (
                                     id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                     subscription_id     UUID NOT NULL REFERENCES subscriptions(id),
                                     due_date            DATE NOT NULL,
                                     paid_at             TIMESTAMPTZ,
                                     amount_cents        INTEGER NOT NULL,
                                     status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
                                     created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_owner_id ON subscriptions(owner_id);
CREATE INDEX idx_subscriptions_client_id ON subscriptions(client_id);
CREATE INDEX idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_next_due_date ON subscriptions(next_due_date);
CREATE INDEX idx_cycles_subscription_id ON subscription_cycles(subscription_id);
CREATE INDEX idx_cycles_due_date ON subscription_cycles(due_date);
CREATE INDEX idx_cycles_status ON subscription_cycles(status);