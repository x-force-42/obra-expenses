CREATE TABLE share_links (
    id BIGSERIAL PRIMARY KEY,
    construction_id BIGINT NOT NULL,
    token VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    disabled_at TIMESTAMPTZ,
    regenerated_at TIMESTAMPTZ,
    CONSTRAINT fk_share_links_construction FOREIGN KEY (construction_id) REFERENCES constructions (id) ON DELETE CASCADE,
    CONSTRAINT uk_share_links_construction UNIQUE (construction_id),
    CONSTRAINT uk_share_links_token UNIQUE (token)
);

CREATE INDEX idx_share_links_token ON share_links (token);
CREATE INDEX idx_share_links_construction_id ON share_links (construction_id);
