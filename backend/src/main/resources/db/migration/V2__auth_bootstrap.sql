CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    google_subject VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    picture_url VARCHAR(1000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_users_google_subject UNIQUE (google_subject),
    CONSTRAINT uk_users_email UNIQUE (email)
);

CREATE TABLE constructions (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    current_stage_id BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_constructions_owner FOREIGN KEY (owner_id) REFERENCES users (id)
);

CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    construction_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_default BOOLEAN NOT NULL,
    active BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_categories_construction FOREIGN KEY (construction_id) REFERENCES constructions (id) ON DELETE CASCADE,
    CONSTRAINT uk_categories_construction_name UNIQUE (construction_id, name)
);

CREATE TABLE stages (
    id BIGSERIAL PRIMARY KEY,
    construction_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_default BOOLEAN NOT NULL,
    active BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_stages_construction FOREIGN KEY (construction_id) REFERENCES constructions (id) ON DELETE CASCADE,
    CONSTRAINT uk_stages_construction_name UNIQUE (construction_id, name)
);

ALTER TABLE constructions
    ADD CONSTRAINT fk_constructions_current_stage FOREIGN KEY (current_stage_id) REFERENCES stages (id);

CREATE INDEX idx_constructions_owner_id ON constructions (owner_id);
CREATE INDEX idx_categories_construction_id ON categories (construction_id);
CREATE INDEX idx_stages_construction_id ON stages (construction_id);
