CREATE TABLE clients (
                         id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         name        VARCHAR(255) NOT NULL,
                         email       VARCHAR(255) NOT NULL,
                         phone       VARCHAR(20),
                         document    VARCHAR(20),
                         active      BOOLEAN NOT NULL DEFAULT TRUE,
                         created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                         updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_active ON clients(active);
CREATE INDEX idx_clients_name ON clients(name);