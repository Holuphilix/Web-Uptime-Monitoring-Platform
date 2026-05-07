CREATE TABLE monitored_urls (
    id SERIAL PRIMARY KEY,
    url TEXT UNIQUE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE check_results (
    id SERIAL PRIMARY KEY,
    url_id INTEGER REFERENCES monitored_urls(id) ON DELETE CASCADE,
    status VARCHAR(10),
    response_time FLOAT,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
