CREATE TABLE logs (
  id SERIAL PRIMARY KEY,
  unix_ts BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  event_name VARCHAR(10) NOT NULL CHECK (event_name IN ('login', 'logout'))
);