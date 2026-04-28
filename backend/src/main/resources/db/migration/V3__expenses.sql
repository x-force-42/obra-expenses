CREATE TABLE expenses (
    id BIGSERIAL PRIMARY KEY,
    construction_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    stage_id BIGINT NOT NULL,
    amount NUMERIC(19, 2) NOT NULL CHECK (amount > 0),
    description TEXT,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_expenses_construction FOREIGN KEY (construction_id) REFERENCES constructions (id) ON DELETE CASCADE,
    CONSTRAINT fk_expenses_category FOREIGN KEY (category_id) REFERENCES categories (id),
    CONSTRAINT fk_expenses_stage FOREIGN KEY (stage_id) REFERENCES stages (id)
);

CREATE INDEX idx_expenses_construction_id ON expenses (construction_id);
CREATE INDEX idx_expenses_category_id ON expenses (category_id);
CREATE INDEX idx_expenses_stage_id ON expenses (stage_id);
CREATE INDEX idx_expenses_occurred_at ON expenses (occurred_at DESC);
CREATE INDEX idx_expenses_deleted ON expenses (deleted);
