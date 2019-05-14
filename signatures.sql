DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    signature TEXT NOT NULL,
    users_id INTEGER,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
