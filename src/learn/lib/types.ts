/* eslint-disable @typescript-eslint/no-empty-interface */
import { type Grade, Rating, State } from "ts-fsrs"
import * as v from "valibot"
import { Id, IdKey } from "./id"

export function makeCard<
  T extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
  U extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
>(last_review: T, state: U) {
  return v.object({
    /** Card id (unique to this card) */
    id: Id,

    /** Note id (links to a corresponding note) */
    nid: Id,

    /** Template id (can be found on the corresponding model) */
    tid: Id,

    /** Deck id (links to a corresponding deck) */
    did: Id,

    /** Original deck id (used when this card is part of a filtered deck) */
    odid: v.optional(Id),

    /** Timestamp of last edit */
    last_edit: v.number(),

    /** 0 = normal, 1 = buried, 2 = suspended */
    queue: v.picklist([0, 1, 2]),

    /** For reviewed cards, when they're due. For new cards, their due order */
    due: v.number(),

    /** Date of the last review (possibly optional) */
    last_review,

    /** Stability */
    stability: v.number(),

    /** Difficulty level */
    difficulty: v.number(),

    /** Number of days elapsed */
    elapsed_days: v.number(),

    /** Number of days scheduled */
    scheduled_days: v.number(),

    /** Repetition count */
    reps: v.number(),

    /** Number of lapses or mistakes */
    lapses: v.number(),

    /** Card state */
    state,
  })
}

export interface NewCard extends v.InferOutput<typeof NewCard> {}
export const NewCard = makeCard(v.undefined(), v.literal(State.New))

export interface ReviewedCard extends v.InferOutput<typeof ReviewedCard> {}
export const ReviewedCard = makeCard(v.number(), v.enum(State))

export interface AnyCard extends v.InferOutput<typeof AnyCard> {}
export const AnyCard = makeCard(v.optional(v.number()), v.enum(State))

export interface Grave extends v.InferOutput<typeof Grave> {}
export const Grave = v.object({
  /** The original id of the item to delete */
  oid: Id,

  /** The type of item to delete: 0 for card, 1 for note, and 2 for deck */
  type: v.picklist([0, 1, 2]),
})

export interface NoteFields extends v.InferOutput<typeof NoteFields> {}
export const NoteFields = v.record(IdKey, v.string())

export interface Note extends v.InferOutput<typeof Note> {}
export const Note = v.object({
  /** Note id */
  id: Id,

  /** Creation timestamp */
  creation: v.number(),

  /** Model id */
  mid: Id,

  /** Last edited timestamp */
  last_edited: v.number(),

  /** Space-separated list of tags */
  tags: v.string(),

  /** List of fields */
  fields: NoteFields,

  /** Value of sort field */
  sort_field: v.string(),

  /** Checksum used for duplicate check */
  csum: v.number(),
})

export interface Review extends v.InferOutput<typeof Review> {}
export const Review = v.object({
  /** Timestamp of when review was done */
  id: Id,

  /** Card id */
  cid: Id,

  /** The number of milliseconds taken in this review (max 60000) */
  time: v.number(),

  /** 0=learn, 1=review, 2=relearn, 3=filtered, 4=manual */
  type: v.picklist([0, 1, 2, 3, 4]),

  /** Rating of the review */
  rating: v.enum(Rating),

  /** State of the review */
  state: v.enum(State),

  /** Date of the last scheduling */
  due: v.number(),

  /** Memory stability during the review */
  stability: v.number(),

  /** Difficulty of the card during the review */
  difficulty: v.number(),

  /** Number of days elapsed since the last review */
  elapsed_days: v.number(),

  /** Number of dats between the last two reviews */
  last_elapsed_days: v.number(),

  /** Number of days until the next review */
  scheduled_days: v.number(),

  /** Date of the review */
  review: v.number(),
})

export interface ModelField extends v.InferOutput<typeof ModelField> {}
export const ModelField = v.object({
  /** Id used when sorting fields */
  id: Id,

  /** Font family displayed in the entry window */
  font: v.optional(v.string()),

  /** Font size displayed in the entry window */
  size: v.optional(v.number()),

  /** Whether the entry window should use RTL text direction */
  rtl: v.boolean(),

  /** Name of this field */
  name: v.string(),

  /** The value to fill in by default when creating a new card of this model */
  sticky: v.string(),

  /** Whether the field is collapsed in the editor */
  collapsed: v.boolean(),

  /** Whether the field defaults to html view */
  html: v.boolean(),

  /** The placeholder to show in the entry window when no value is entered. */
  desc: v.string(),

  /** Whether to exclude this field from unqualified searches */
  excludeFromSearch: v.boolean(),
})

export interface ModelFields extends v.InferOutput<typeof ModelFields> {}
export const ModelFields = v.record(IdKey, ModelField)

export interface MathjaxOptions extends v.InferOutput<typeof MathjaxOptions> {}
export const MathjaxOptions = v.object({
  /** Inserted at the beginning of any latex text */
  pre: v.string(),

  /** Inserted after any latex text */
  post: v.string(),
})

export interface ModelTemplate extends v.InferOutput<typeof ModelTemplate> {}
export const ModelTemplate = v.object({
  /** Template id used for sorting */
  id: Id,

  /** Format string for the question */
  qfmt: v.string(),

  /** Format string for the answer */
  afmt: v.string(),

  /** Name of the template */
  name: v.string(),
})

export interface ModelTemplates extends v.InferOutput<typeof ModelTemplates> {}
export const ModelTemplates = v.record(IdKey, ModelTemplate)

export interface Model extends v.InferOutput<typeof Model> {}
export const Model = v.object({
  /** Model id */
  id: Id,

  /** CSS of this template */
  css: v.string(),

  // /** Deck id that cards of this type go into by default */
  // did: v.optional(Id),

  /** Fields in this model */
  fields: ModelFields,

  /** If present, Mathjax options. If absent, Mathquill is used */
  latex: v.optional(MathjaxOptions),

  /** Model name */
  name: v.string(),

  /** Which field to use when sorting */
  sort_field: v.optional(Id),

  /** Templates that this model generates */
  tmpls: ModelTemplates,

  /** Last tags used with this model */
  tags: v.string(),

  /** 0=standard model, 1=cloze model */
  type: v.picklist([0, 1]),

  // mod: "modification time in seconds",
})

export interface Deck extends v.InferOutput<typeof Deck> {}
export const Deck = v.object({
  /** Deck id */
  id: Id,

  /** Name of deck */
  name: v.string(),

  /** Whether deck is collapsed */
  collapsed: v.boolean(),

  /** Whether deck is a filtered deck */
  is_filtered: v.boolean(),

  /** Custom limit on review cards for today */
  custom_revcard_limit: v.optional(v.number()),

  /** Custom limit on new cards for today */
  custom_newcard_limit: v.optional(v.number()),

  /** Last time this deck was edited */
  last_edited: v.number(),

  /** Number of new cards seen today */
  new_today: v.number(),

  /** Number of reviews done today */
  reviews_today: v.number(),

  /** When `new_today` and the `..._limit` properties were last updated */
  today: v.number(),

  /** Description of deck */
  desc: v.string(),

  /** Conf id */
  conf: Id,
})

export interface Conf extends v.InferOutput<typeof Conf> {}
export const Conf = v.object({
  /** Conf id */
  id: Id,

  /** Whether to autoplay audio */
  autoplay_audio: v.boolean(),

  /** Last time this configuration was edited */
  last_edited: v.number(),

  /** Name of the configuration */
  name: v.string(),

  /** Configuration relating to new cards */
  new: v.object({
    /** Whether to bury cards from the same note */
    bury_related: v.boolean(),

    /** Whether to pick new cards at random (default is in order) */
    pick_at_random: v.boolean(),

    /** The number of new cards available each day */
    per_day: v.number(),

    /** Learning steps (in seconds) */
    learning_steps: v.array(v.number()),
  }),

  /** Whether to replay audio that's used in the question once answer is shown */
  replay_question_audio: v.boolean(),

  /** Configuration relating to review cards */
  review: v.object({
    /** Whether to bury cards from the same note */
    bury_related: v.boolean(),

    /** Whether to enable fuzz when reviewing */
    enable_fuzz: v.boolean(),

    /** The maximum review interval, in days */
    max_review_interval: v.number(),

    /** The number of review cards per day */
    per_day: v.optional(v.number()),

    /** Relearning steps (in seconds) */
    relearning_steps: v.array(v.number()),
  }),

  /** Whether to show the global timer */
  show_global_timer: v.boolean(),

  /** If not undefined, shows a timer on each card (in seconds) */
  timer_per_card: v.optional(v.number()),

  // lapse : {
  //     "The configuration for lapse cards."
  //     delays : "The list of successive delay between the learning steps of the new cards, as explained in the manual."
  //     leechAction : "What to do to leech cards. 0 for suspend, 1 for mark. Numbers according to the order in which the choices appear in aqt/dconf.ui"
  //     leechFails : "the number of lapses authorized before doing leechAction."
  //     minInt: "a lower limit to the new interval after a leech"
  //     mult : "percent by which to multiply the current interval when a card goes has lapsed"
  // }
  // new : {
  //     "The configuration for new cards."
  //     delays : "The list of successive delay between the learning steps of the new cards, as explained in the manual."
  //     initialFactor : "The initial ease factor"
  //     // ints : "The list of delays according to the button pressed while leaving the learning mode. Good, easy and unused. In the GUI, the first two elements corresponds to Graduating Interval and Easy interval"

  // }
  // rev : {
  //     "The configuration for review cards."
  //     // bury : "Whether to bury cards related to new cards answered"
  //     ease4 : "the number to add to the easyness when the easy button is pressed"
  //     fuzz : "The new interval is multiplied by a random number between -fuzz and fuzz"
  //     ivlFct : "multiplication factor applied to the intervals Anki generates"
  //     // maxIvl : "the maximal interval for review"
  //     // minSpace : "not currently used according to decks.py code's comment"
  //     perDay : "Numbers of cards to review per day"
  // }
})

export type BrowserColumn = v.InferOutput<typeof BrowserColumn>
export const BrowserColumn = v.picklist([
  "Question",
  "Answer",
  "Card",
  "Deck",
  "Sort Field",
  "Created",
  "Edited",
  "Due",
  "Interval",
  "Ease",
  "Reviews",
  "Lapses",
  "Tags",
  "Note",
])

export type SortableBrowserColumn = v.InferOutput<typeof SortableBrowserColumn>
export const SortableBrowserColumn = v.picklist([
  "Card",
  "Deck",
  "Sort Field",
  "Created",
  "Edited",
  "Due",
  "Interval",
  "Ease",
  "Reviews",
  "Lapses",
  "Tags",
  "Note",
])

export type EditStyleRow = v.InferOutput<typeof EditStyleRow>
export const EditStyleRow = v.picklist(["inline", "separate", "all-separate"])

export interface TemplateEditStyle
  extends v.InferOutput<typeof TemplateEditStyle> {}
export const TemplateEditStyle = v.object({
  row: EditStyleRow,
  template: v.object({
    front: v.boolean(),
    back: v.boolean(),
    styling: v.boolean(),
  }),
  theme: v.object({
    light: v.boolean(),
    dark: v.boolean(),
  }),
})

export interface Prefs extends v.InferOutput<typeof Prefs> {}
export const Prefs = v.object({
  /** Current deck id */
  current_deck: v.optional(Id),

  /** Last model used */
  last_model_used: v.optional(Id),

  /** Active decks */
  active_decks: v.array(Id),

  /** 0 = mix new and review, 1 = new after review, 2 = new before review */
  new_spread: v.picklist([0, 1, 2]),

  /** If a review is due before this many seconds, it is advanced to now */
  collapse_time: v.number(),

  /** Each time this number of seconds elapses, the application tells you how many cards you reviewed */
  notify_after_time: v.number(),

  /** Whether to show review time above the buttons */
  show_review_time_above_buttons: v.boolean(),

  /** Whether to show the remaining due counts */
  show_remaining_due_counts: v.boolean(),

  /** Whether to show deck names */
  show_deck_name: v.boolean(),

  /** Highest due value of a new card. Next note created should be higher than this */
  next_new_card_position: v.number(),

  /** The last time any card was unburied. If not today, then buried notes need to be unburied */
  last_unburied: v.optional(v.number()),

  /** When the day is considered to start, in milliseconds after midnight */
  day_start: v.number(),

  /** Whether to enable debug features */
  debug: v.boolean(),

  /** The state of the sidebar during reviews */
  sidebar_state: v.picklist(["auto", "open", "closed"]),

  /** Options used when editing templates */
  template_edit_style: TemplateEditStyle,

  /** Configuration relating to the browser */
  browser: v.object({
    /** Active columns in the browser */
    active_cols: v.array(BrowserColumn),

    /** The field to sort by in the browser */
    sort_field: SortableBrowserColumn,

    /** Whether to sort backwards */
    sort_backwards: v.boolean(),
  }),
})

export interface Core extends v.InferOutput<typeof Core> {}
export const Core = v.object({
  /** Collection id */
  id: Id,

  /** Creation timestamp of the collection */
  creation: v.number(),

  /** Last time anything was modified */
  last_edited: v.number(),

  /**
   * Last time note types or fields were edited.
   *
   * If later than the server, a force push is required. If earlier than the
   * server, a force pull is required.
   */
  last_schema_edit: v.number(),

  /** Last sync time */
  last_sync: v.number(),

  /** Space-separated list of tags used in this collection */
  tags: v.string(),
})

export interface Decks extends v.InferOutput<typeof Decks> {}
export const Decks = v.record(IdKey, Deck)

export interface Confs extends v.InferOutput<typeof Confs> {}
export const Confs = v.record(IdKey, Conf)

export interface Cards extends v.InferOutput<typeof Cards> {}
export const Cards = v.record(IdKey, AnyCard)

export interface Notes extends v.InferOutput<typeof Notes> {}
export const Notes = v.record(IdKey, Note)

/** A map from card ids to arrays of reviews. */
export interface RevLog extends v.InferOutput<typeof RevLog> {}
export const RevLog = v.record(IdKey, v.array(Review))

export interface Models extends v.InferOutput<typeof Models> {}
export const Models = v.record(IdKey, Model)

export interface Collection extends v.InferOutput<typeof Collection> {}
export const Collection = v.object({
  /** The special `version` tag is updated whenever the data format changes */
  version: v.literal(1),

  /** A record from card ids to their corresponding cards */
  cards: Cards,

  /** An array of graves */
  graves: v.array(Grave),

  /** A record from note ids to their corresponding notes */
  notes: Notes,

  /** A record from card ids to their corresponding reviews */
  rev_log: RevLog,

  // All things below are part of `collection` in Anki
  core: Core,
  models: Models,
  decks: Decks,
  confs: Confs,
  prefs: Prefs,
})

export interface RepeatItem {
  card: ReviewedCard
  log: Review
}

export type RepeatInfo = Record<Grade, RepeatItem>
