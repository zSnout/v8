DROP TABLE graves;

CREATE TABLE IF NOT EXISTS graves (
  oid INTEGER NOT NULL,
  type INTEGER NOT NULL,
  UNIQUE (type, oid)
);

CREATE TRIGGER IF NOT EXISTS graves_from_cards AFTER DELETE ON cards BEGIN INSERT
OR IGNORE INTO graves (oid, type)
VALUES
  (old.id, 0);

END;

CREATE TRIGGER IF NOT EXISTS graves_from_notes AFTER DELETE ON notes BEGIN INSERT
OR IGNORE INTO graves (oid, type)
VALUES
  (old.id, 1);

END;

CREATE TRIGGER IF NOT EXISTS graves_from_decks AFTER DELETE ON decks BEGIN INSERT
OR IGNORE INTO graves (oid, type)
VALUES
  (old.id, 2);

END;

CREATE TRIGGER IF NOT EXISTS graves_from_models AFTER DELETE ON models BEGIN INSERT
OR IGNORE INTO graves (oid, type)
VALUES
  (old.id, 3);

END;

CREATE TRIGGER IF NOT EXISTS graves_from_prefs AFTER DELETE ON prefs BEGIN INSERT
OR IGNORE INTO graves (oid, type)
VALUES
  (old.id, 4);

END;

CREATE TRIGGER IF NOT EXISTS graves_from_charts AFTER DELETE ON charts BEGIN INSERT
OR IGNORE INTO graves (oid, type)
VALUES
  (old.id, 4);

END;
