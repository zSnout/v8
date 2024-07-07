import { Id, idOf, randomId } from "./id"
import { arrayToRecord } from "./record"
import type {
  Collection,
  Conf,
  Core,
  Deck,
  Model,
  ModelField,
  Models,
  ModelTemplate,
  Prefs,
} from "./types"

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
    debug: false,
    show_deck_name: true,
    sidebar_state: "closed",
    template_edit_style: {
      row: "inline",
      template: { front: true, back: true, styling: true },
      theme: { light: true, dark: true },
    },
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
      enable_fuzz: true,
      max_review_interval: 36500,
      per_day: Number.MAX_SAFE_INTEGER,
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
    today: now,
    reviews_today: 0,
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
    sticky: "",
  }
}

export function createModelTemplate(
  qfmt: string,
  afmt: string,
  name: string,
): ModelTemplate {
  const id = randomId()
  return { id, qfmt, afmt, name }
}

export function createModel(
  id: Id,
  name: string,
  tmpls: ModelTemplate[],
  css: string,
  fields: ModelField[],
): Model {
  return {
    id,
    css,
    fields: arrayToRecord(fields),
    tmpls: arrayToRecord(tmpls),
    name,
    tags: "",
    type: 0,
    sort_field: fields[0]?.id,
  }
}

const DEFAULT_MODEL_CSS = `.card {
  font-size: 1.5rem;
  text-align: center;
}

hr {
  border-width: 0;
  border-top-width: 1px;
  border-top-color: var(--z-border);
  border-style: solid;
}`

export function createBasicModel(): Model {
  return createModel(
    ID_MODEL_BASIC,
    "Basic",
    [
      createModelTemplate(
        "{{Front}}",
        `{{FrontSide}}

<hr id="answer" />

{{Back}}`,
        "Front --> Back",
      ),
    ],
    DEFAULT_MODEL_CSS,
    [createField("Front"), createField("Back")],
  )
}

export function createModels(): Models {
  const basicAndReversed = createModel(
    ID_MODEL_BASIC_AND_REVERSED,
    "Basic and reversed",
    [
      createModelTemplate(
        "{{Front}}",
        `{{FrontSide}}

<hr id="answer" />

{{Back}}`,
        "Front --> Back",
      ),
      createModelTemplate(
        "{{Back}}",
        `{{FrontSide}}

<hr id="answer" />

{{Front}}`,
        "Back --> Front",
      ),
    ],
    DEFAULT_MODEL_CSS,
    [createField("Front"), createField("Back")],
  )
  return arrayToRecord([createBasicModel(), basicAndReversed])
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
