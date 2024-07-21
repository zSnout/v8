CREATE TABLE IF NOT EXISTS
  core (
    id INTEGER PRIMARY KEY NOT NULL CHECK (id = 0),
    version INTEGER NOT NULL,
    creation INTEGER NOT NULL DEFAULT (1000 * strftime('%s', 'now')),
    last_edited INTEGER NOT NULL DEFAULT (1000 * strftime('%s', 'now')),
    last_schema_edit INTEGER NOT NULL DEFAULT (1000 * strftime('%s', 'now')),
    last_sync INTEGER NOT NULL DEFAULT (1000 * strftime('%s', 'now')),
    tags TEXT NOT NULL DEFAULT ''
  );

CREATE TABLE IF NOT EXISTS
  graves (
    id INTEGER PRIMARY KEY NOT NULL,
    oid INTEGER NOT NULL,
    type INTEGER NOT NULL
  );

CREATE TABLE IF NOT EXISTS
  confs (
    id INTEGER PRIMARY KEY NOT NULL,
    autoplay_audio BOOLEAN NOT NULL DEFAULT 1,
    last_edited INTEGER NOT NULL DEFAULT (1000 * strftime('%s', 'now')),
    name TEXT NOT NULL UNIQUE,
    new_bury_related BOOLEAN NOT NULL DEFAULT 0,
    new_pick_at_random BOOLEAN NOT NULL DEFAULT 0,
    new_per_day INTEGER NOT NULL DEFAULT 20,
    new_learning_steps TEXT NOT NULL DEFAULT '[60,600]', -- json array
    replay_question_audio BOOLEAN NOT NULL DEFAULT 0,
    review_bury_related BOOLEAN NOT NULL DEFAULT 0,
    review_enable_fuzz BOOLEAN NOT NULL DEFAULT 0,
    review_max_review_interval INTEGER NOT NULL DEFAULT 36500,
    review_per_day INTEGER, -- can be null
    review_relearning_steps TEXT NOT NULL DEFAULT '[600]', -- json array
    review_requested_retention REAL NOT NULL DEFAULT 0.9,
    review_w TEXT, -- json array; can be null
    show_global_timer BOOLEAN NOT NULL DEFAULT 0,
    timer_per_card INTEGER -- can be null
  );

CREATE TABLE IF NOT EXISTS
  decks (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL UNIQUE,
    collapsed BOOLEAN NOT NULL DEFAULT 0,
    is_filtered BOOLEAN NOT NULL,
    custom_revcard_limit INTEGER, -- can be null
    custom_newcard_limit INTEGER, -- can be null
    default_revcard_limit INTEGER, -- can be null
    default_newcard_limit INTEGER, -- can be null
    last_edited INTEGER NOT NULL DEFAULT (1000 * strftime('%s', 'now')),
    new_today TEXT NOT NULL DEFAULT '[]', -- json array
    revcards_today TEXT NOT NULL DEFAULT '[]', -- json array
    revlogs_today INTEGER NOT NULL DEFAULT 0,
    today INTEGER NOT NULL DEFAULT (1000 * strftime('%s', 'now')),
    desc TEXT NOT NULL DEFAULT '',
    cfid INTEGER NOT NULL DEFAULT 0,
    creation INTEGER NOT NULL DEFAULT (1000 * strftime('%s', 'now')),
    FOREIGN KEY (cfid) REFERENCES confs (id) ON UPDATE CASCADE ON DELETE CASCADE
  );

CREATE INDEX IF NOT EXISTS decks_name ON decks (name);

CREATE INDEX IF NOT EXISTS decks_cfid ON decks (cfid);

CREATE TABLE IF NOT EXISTS
  models (
    id INTEGER PRIMARY KEY NOT NULL,
    css TEXT NOT NULL DEFAULT '',
    fields TEXT NOT NULL DEFAULT '{}', -- json
    latex TEXT, -- json; can be null
    name TEXT NOT NULL UNIQUE,
    sort_field INTEGER, -- can be null
    tmpls TEXT NOT NULL DEFAULT '{}', -- json
    tags TEXT NOT NULL DEFAULT '', -- space-separated tags
    type INTEGER NOT NULL, -- 0=standard, 1=cloze
    creation INTEGER NOT NULL DEFAULT (1000 * strftime('%s', 'now')),
    last_edited INTEGER NOT NULL DEFAULT (1000 * strftime('%s', 'now'))
  );

CREATE TABLE IF NOT EXISTS
  notes (
    id INTEGER PRIMARY KEY NOT NULL,
    creation INTEGER NOT NULL DEFAULT (1000 * strftime('%s', 'now')),
    mid INTEGER NOT NULL,
    last_edited INTEGER NOT NULL DEFAULT (1000 * strftime('%s', 'now')),
    tags TEXT NOT NULL DEFAULT '', -- space-separated tags
    fields TEXT NOT NULL, -- json fields data
    sort_field TEXT, -- can be null
    csum INTEGER NOT NULL DEFAULT 0, -- FEAT: implement this
    marks INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (mid) REFERENCES models (id) ON UPDATE CASCADE ON DELETE CASCADE
  );

CREATE INDEX IF NOT EXISTS notes_mid ON notes (mid);

CREATE TABLE IF NOT EXISTS
  cards (
    id INTEGER PRIMARY KEY NOT NULL,
    nid INTEGER NOT NULL,
    tid INTEGER NOT NULL,
    did INTEGER NOT NULL,
    odid INTEGER,
    creation INTEGER NOT NULL DEFAULT (1000 * strftime('%s', 'now')),
    last_edited INTEGER NOT NULL DEFAULT (1000 * strftime('%s', 'now')),
    queue INTEGER NOT NULL DEFAULT 0,
    due INTEGER NOT NULL,
    last_review INTEGER, -- can be null
    stability REAL NOT NULL DEFAULT 0,
    difficulty REAL NOT NULL DEFAULT 0,
    elapsed_days INTEGER NOT NULL DEFAULT 0,
    scheduled_days INTEGER NOT NULL DEFAULT 0,
    reps INTEGER NOT NULL DEFAULT 0,
    lapses INTEGER NOT NULL DEFAULT 0,
    flags INTEGER NOT NULL DEFAULT 0,
    state INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (nid) REFERENCES notes (id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (did) REFERENCES decks (id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (odid) REFERENCES decks (id) ON UPDATE CASCADE ON DELETE CASCADE
  );

CREATE INDEX IF NOT EXISTS cards_nid ON cards (nid);

CREATE INDEX IF NOT EXISTS cards_did ON cards (did);

CREATE INDEX IF NOT EXISTS cards_due ON cards (due);

CREATE TABLE IF NOT EXISTS
  rev_log (
    id INTEGER PRIMARY KEY NOT NULL,
    cid INTEGER NOT NULL,
    time INTEGER NOT NULL,
    type INTEGER NOT NULL,
    rating INTEGER NOT NULL,
    state INTEGER NOT NULL,
    due INTEGER NOT NULL,
    stability REAL NOT NULL,
    difficulty REAL NOT NULL,
    elapsed_days INTEGER NOT NULL,
    last_elapsed_days INTEGER NOT NULL,
    scheduled_days INTEGER NOT NULL,
    review INTEGER NOT NULL
  );

CREATE INDEX IF NOT EXISTS rev_log_cid ON rev_log (cid);

CREATE TABLE IF NOT EXISTS
  prefs (
    id INTEGER PRIMARY KEY NOT NULL CHECK (id = 0),
    last_edited INTEGER NOT NULL DEFAULT (1000 * strftime('%s', 'now')),
    current_deck INTEGER, -- can be null
    last_model_used INTEGER, -- can be null
    new_spread INTEGER NOT NULL DEFAULT 0,
    collapse_time INTEGER NOT NULL DEFAULT (60 * 20),
    notify_after_time INTEGER NOT NULL DEFAULT 0,
    show_review_time_above_buttons BOOLEAN NOT NULL DEFAULT 1,
    show_remaining_due_counts BOOLEAN NOT NULL DEFAULT 1,
    show_deck_name BOOLEAN NOT NULL DEFAULT 1,
    next_new_card_position INTEGER NOT NULL DEFAULT 0,
    last_unburied INTEGER NOT NULL DEFAULT (1000 * strftime('%s', 'now')),
    day_start INTEGER NOT NULL DEFAULT (1000 * 60 * 60 * 4),
    debug BOOLEAN NOT NULL DEFAULT 0,
    sidebar_state INTEGER NOT NULL DEFAULT 1, -- auto=1, open=2, closed=3
    template_edit_style TEXT NOT NULL DEFAULT '{"row":"inline","template":{"front":true,"back":true,"styling":true},"theme":{"light":true,"dark":true}}', -- json data
    show_flags_in_sidebar BOOLEAN NOT NULL DEFAULT 1,
    show_marks_in_sidebar BOOLEAN NOT NULL DEFAULT 1,
    browser TEXT NOT NULL DEFAULT '{"active_cols":["Sort Field","Due","Card","Tags","Deck"],"sort_field":"Sort Field","sort_backwards":false}', -- json data
    FOREIGN KEY (current_deck) REFERENCES decks (id) ON UPDATE SET NULL ON DELETE SET NULL,
    FOREIGN KEY (last_model_used) REFERENCES models (id) ON UPDATE SET NULL ON DELETE SET NULL
  );

CREATE TABLE IF NOT EXISTS
  stats (
    id INTEGER PRIMARY KEY NOT NULL,
    last_edited INTEGER NOT NULL DEFAULT (1000 * strftime('%s', 'now')),
    title TEXT NOT NULL,
    query TEXT NOT NULL,
    chart TEXT NOT NULL,
    style TEXT NOT NULL
  );