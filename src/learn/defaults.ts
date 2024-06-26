import { Id, idOf, randomId } from "./id"
import type { Collection, Conf, Core, Deck, ModelField, Prefs } from "./types"

const ID_DECK_DEFAULT = idOf(1)
const ID_CONF_DEFAULT = idOf(1)
const ID_MODEL_BASIC = idOf(1)
const ID_MODEL_BASIC_AND_REVERSED = idOf(2)
// const ID_MODEL_BASIC_OPTIONAL_REVERSED = idOf(3)
// const ID_MODEL_BASIC_TYPE_ANSWER = idOf(4)
// const ID_MODEL_BASIC_CLOZE = idOf(5)
// const ID_MODEL_BASIC_IMAGE_OCCLUSION = idOf(5)

export function createCore(now: number): Core {
  return {
    id: randomId(),
    creation: now,
    last_edited: now,
    last_schema_edit: now,
    last_sync: now,
    tags: "",
  }
}

export function createPrefs(): Prefs {
  return {
    current_deck: undefined,
    last_model_used: undefined,
    active_decks: [],
    new_spread: 0,
    collapse_time: 0,
    notify_after_time: 0,
    show_review_time_above_buttons: true,
    show_remaining_due_counts: true,
    next_new_card_position: 0,
    last_unburied: 0,
    day_start: 1000 * 60 * 60 * 4,
    browser: {
      active_cols: ["Sort Field", "Due", "Card", "Tags", "Deck"],
      sort_field: "Sort Field",
      sort_backwards: false,
    },
  }
}

export function createConf(now: number): Conf {
  return {
    id: ID_CONF_DEFAULT,
    autoplay_audio: true,
    last_edited: now,
    name: "Default",
    new: {
      bury_related: false,
      pick_at_random: false,
      per_day: 20,
      learning_steps: [60, 10 * 60],
    },
    replay_question_audio: false,
    review: {
      bury_related: false,
      max_review_interval: 36500,
      per_day: Infinity,
      relearning_steps: [10 * 60],
    },
    show_global_timer: false,
    timer_per_card: undefined,
  }
}

export function createDeck(now: number, name: string, id: Id): Deck {
  return {
    id,
    collapsed: true,
    desc: "",
    is_filtered: false,
    last_edited: now,
    name,
    new_today: 0,
    conf: ID_CONF_DEFAULT,
  }
}

export function createField(name: string): ModelField {
  return {
    id: randomId(),
    name,
    rtl: false,
    desc: "",
    collapsed: false,
    excludeFromSearch: false,
    html: false,
  }
}

export function createModels(): Collection["models"] {
  return {
    [ID_MODEL_BASIC]: {
      id: ID_MODEL_BASIC,
      css: `.card {
    font-family: Arial, sans-serif;
    font-size: 1.5rem;
    text-align: center;
    color: black;
    background-color: white;
}`,
      fields: [createField("Front"), createField("Back")],
      name: "Basic",
      sort_field: 0,
      tmpls: [
        {
          qfmt: "{{Front}}",
          afmt: `{{Front}}

<hr id="answer" />

{{Back}}`,
          name: "Front --> Back",
        },
      ],
      tags: "",
      type: 0,
    },
    [ID_MODEL_BASIC_AND_REVERSED]: {
      id: ID_MODEL_BASIC_AND_REVERSED,
      css: `.card {
    font-family: Arial, sans-serif;
    font-size: 1.5rem;
    text-align: center;
    color: black;
    background-color: white;
}`,
      fields: [createField("Front"), createField("Back")],
      name: "Basic and reversed",
      sort_field: 0,
      tmpls: [
        {
          qfmt: "{{Front}}",
          afmt: `{{Front}}

<hr id="answer" />

{{Back}}`,
          name: "Front --> Back",
        },
        {
          qfmt: "{{Back}}",
          afmt: `{{Back}}

<hr id="answer" />

{{Front}}`,
          name: "Back --> Front",
        },
      ],
      tags: "",
      type: 0,
    },
  }
}

export function createCollection(now: number): Collection {
  return {
    version: 1,

    cards: {},
    graves: [],
    notes: {},
    rev_log: {},

    core: createCore(now),
    decks: {
      [ID_DECK_DEFAULT]: createDeck(now, "Default::wow", ID_DECK_DEFAULT),
    },
    confs: { [ID_CONF_DEFAULT]: createConf(now) },
    prefs: createPrefs(),
    models: createModels(),
  }
}
