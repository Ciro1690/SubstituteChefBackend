CREATE TABLE users (
  username VARCHAR(25) PRIMARY KEY,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL
    CHECK (position('@' IN email) > 1)
);

CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT,
  address TEXT NOT NULL,
  lat FLOAT NOT NULL,
  lng FLOAT NOT NULL,
  username TEXT NOT NULL
    REFERENCES users ON DELETE CASCADE
);

CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  position TEXT NOT NULL,
  hourly_pay FLOAT CHECK (hourly_pay >= 14.0),
  date DATE NOT NULL,
  company_id INTEGER NOT NULL
    REFERENCES companies ON DELETE CASCADE
);

CREATE TABLE applications (
  status TEXT DEFAULT 'PENDING',
  username VARCHAR(25)
    REFERENCES users ON DELETE CASCADE,
  job_id INTEGER
    REFERENCES jobs ON DELETE CASCADE,
  PRIMARY KEY (username, job_id)
);