CREATE TABLE IF NOT EXISTS measurements (
  metric TEXT NOT NULL CHECK (metric IN ('weight', 'bodyFat')),
  day TEXT NOT NULL,
  value REAL NOT NULL,
  sample_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (metric, day)
);
CREATE INDEX IF NOT EXISTS measurements_sample_at_idx ON measurements(sample_at);
