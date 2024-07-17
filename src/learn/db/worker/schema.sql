PRAGMA journal_mode = MEMORY;

PRAGMA foreign_keys = ON;

-- tables without relations
CREATE TABLE IF NOT EXISTS
  core (
    id INTEGER PRIMARY KEY NOT NULL CHECK (id = 0),
    version INTEGER NOT NULL,
    creation INTEGER NOT NULL,
    last_edited INTEGER NOT NULL,
    last_schema_edit INTEGER NOT NULL,
    last_sync INTEGER NOT NULL,
    tags TEXT NOT NULL
  );

CREATE TABLE IF NOT EXISTS
  graves (
    id INTEGER PRIMARY KEY NOT NULL,
    oid INTEGER NOT NULL,
    type INTEGER NOT NULL
  );

-- tables with relations, defined in the order of their relations
-- confs <-- decks
-- models <-- notes
-- decks <-- cards
-- notes <-- cards
-- cards <-- rev_log
CREATE TABLE IF NOT EXISTS
  confs (
    id INTEGER PRIMARY KEY NOT NULL,
    autoplay_audio BOOLEAN NOT NULL,
    last_edited INTEGER NOT NULL,
    name TEXT NOT NULL UNIQUE,
    new_bury_related BOOLEAN NOT NULL,
    new_pick_at_random BOOLEAN NOT NULL,
    new_per_day INTEGER NOT NULL,
    new_learning_steps TEXT NOT NULL,
    replay_question_audio BOOLEAN NOT NULL,
    review_bury_related BOOLEAN NOT NULL,
    review_enable_fuzz BOOLEAN NOT NULL,
    review_max_review_interval INTEGER NOT NULL,
    review_per_day INTEGER, -- can be null
    review_relearning_steps TEXT NOT NULL,
    review_requested_retention INTEGER NOT NULL,
    review_w TEXT, -- can be null
    show_global_timer BOOLEAN NOT NULL,
    timer_per_card INTEGER -- can be null
  );

CREATE TABLE IF NOT EXISTS
  decks (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL UNIQUE,
    collapsed BOOLEAN NOT NULL,
    is_filtered BOOLEAN NOT NULL,
    custom_revcard_limit INTEGER, -- can be null
    custom_newcard_limit INTEGER, -- can be null
    default_revcard_limit INTEGER, -- can be null
    default_newcard_limit INTEGER, -- can be null
    last_edited INTEGER NOT NULL,
    new_today TEXT NOT NULL, -- json array
    revcards_today TEXT NOT NULL, -- json array
    revlogs_today INTEGER NOT NULL,
    today INTEGER NOT NULL,
    desc TEXT NOT NULL,
    cfid INTEGER NOT NULL,
    FOREIGN KEY (cfid) REFERENCES confs (id) ON UPDATE CASCADE ON DELETE CASCADE
  );

CREATE INDEX IF NOT EXISTS decks_name ON decks (name);

CREATE INDEX IF NOT EXISTS decks_cfid ON decks (cfid);

CREATE TABLE IF NOT EXISTS
  models (
    id INTEGER PRIMARY KEY NOT NULL,
    css TEXT NOT NULL,
    fields TEXT NOT NULL, -- json
    latex TEXT, -- json; can be null
    name TEXT NOT NULL UNIQUE,
    sort_field INTEGER, -- can be null
    tmpls TEXT NOT NULL, -- json
    tags TEXT NOT NULL, -- space-separated tags
    type INTEGER NOT NULL, -- 0=standard, 1=cloze
    creation INTEGER NOT NULL,
    last_edited INTEGER NOT NULL
  );

CREATE TABLE IF NOT EXISTS
  notes (
    id INTEGER PRIMARY KEY NOT NULL,
    creation INTEGER NOT NULL,
    mid INTEGER NOT NULL,
    last_edited INTEGER NOT NULL,
    tags TEXT NOT NULL, -- space-separated tags
    fields TEXT NOT NULL, -- json fields data
    sort_field TEXT, -- can be null
    csum INTEGER NOT NULL, -- FEAT: implement this
    marks INTEGER NOT NULL,
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
    creation INTEGER NOT NULL,
    last_edited INTEGER NOT NULL,
    queue INTEGER NOT NULL,
    due INTEGER NOT NULL,
    last_review INTEGER, -- can be null
    stability INTEGER NOT NULL,
    difficulty INTEGER NOT NULL,
    elapsed_days INTEGER NOT NULL,
    scheduled_days INTEGER NOT NULL,
    reps INTEGER NOT NULL,
    lapses INTEGER NOT NULL,
    flags INTEGER NOT NULL,
    state INTEGER NOT NULL,
    FOREIGN KEY (nid) REFERENCES notes (id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (did) REFERENCES decks (id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (odid) REFERENCES decks (id) ON UPDATE CASCADE ON DELETE CASCADE
  );

CREATE INDEX IF NOT EXISTS cards_nid ON cards (nid);

CREATE INDEX IF NOT EXISTS cards_did ON cards (did);

CREATE TABLE IF NOT EXISTS
  rev_log (
    id INTEGER PRIMARY KEY NOT NULL,
    cid INTEGER NOT NULL,
    time INTEGER NOT NULL,
    type INTEGER NOT NULL,
    rating INTEGER NOT NULL,
    state INTEGER NOT NULL,
    due INTEGER NOT NULL,
    stability INTEGER NOT NULL,
    difficulty INTEGER NOT NULL,
    elapsed_days INTEGER NOT NULL,
    last_elapsed_days INTEGER NOT NULL,
    scheduled_days INTEGER NOT NULL,
    review INTEGER NOT NULL
  );

CREATE INDEX IF NOT EXISTS rev_log_cid ON rev_log (cid);

CREATE TABLE IF NOT EXISTS
  prefs (
    id INTEGER PRIMARY KEY NOT NULL CHECK (id = 0),
    last_edited INTEGER NOT NULL,
    current_deck INTEGER, -- can be null
    last_model_used INTEGER, -- can be null
    active_decks INTEGER NOT NULL, -- FEAT: does this need to exist
    new_spread INTEGER NOT NULL,
    collapse_time INTEGER NOT NULL,
    notify_after_time INTEGER NOT NULL,
    show_review_time_above_buttons BOOLEAN NOT NULL,
    show_remaining_due_counts BOOLEAN NOT NULL,
    show_deck_name BOOLEAN NOT NULL,
    next_new_card_position INTEGER NOT NULL,
    last_unburied INTEGER, -- can be null
    day_start INTEGER NOT NULL,
    debug BOOLEAN NOT NULL,
    sidebar_state INTEGER NOT NULL, -- auto=1, open=2, closed=3
    template_edit_style TEXT NOT NULL, -- json data
    show_flags_in_sidebar BOOLEAN NOT NULL,
    show_marks_in_sidebar BOOLEAN NOT NULL,
    browser TEXT NOT NULL, -- json data
    FOREIGN KEY (current_deck) REFERENCES decks (id) ON UPDATE SET NULL ON DELETE SET NULL,
    FOREIGN KEY (last_model_used) REFERENCES models (id) ON UPDATE SET NULL ON DELETE SET NULL
  );