import { Rating, State } from "ts-fsrs"
import * as v from "valibot"

export function makeCard<
  T extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
>(last_review: T) {
  return v.object({
    /** Note id (links to a corresponding note) */
    nid: v.number(),

    /** Template id (which template to use for a given note) */
    tid: v.number(),

    /** Card id (unique to this card) */
    cid: v.number(),

    /** Deck id (links to a corresponding deck) */
    did: v.number(),

    /** Original deck id (used when this card is part of a filtered deck) */
    odid: v.optional(v.number()),

    /** Timestamp of last edit */
    last_edit: v.number(),

    /** For reviewed cards, when they're due. For new cards, their due order */
    due: v.number(),
    last_review,
    stability: v.number(),
    difficulty: v.number(),
    elapsed_days: v.number(),
    scheduled_days: v.number(),
    reps: v.number(),
    lapses: v.number(),
    state: v.enum(State),
  })
}

export type NewCard = v.InferOutput<typeof NewCard>
export const NewCard = makeCard(v.undefined())

export type ReviewedCard = v.InferOutput<typeof ReviewedCard>
export const ReviewedCard = makeCard(v.number())

export type AnyCard = v.InferOutput<typeof AnyCard>
export const AnyCard = makeCard(v.optional(v.number()))

export type Grave = v.InferOutput<typeof Grave>
export const Grave = v.object({
  /** The original id of the item to delete */
  oid: v.number(),

  /** The type of item to delete: 0 for card, 1 for note, and 2 for deck */
  type: v.picklist([0, 1, 2]),
})

export type Note = v.InferOutput<typeof Note>
export const Note = v.object({
  /** Note id */
  nid: v.number(),

  /** Creation timestamp */
  creation: v.number(),

  /** Model id */
  mid: v.number(),

  /** Last edited timestamp */
  last_edited: v.number(),

  /** Space-separated list of tags */
  tags: v.string(),

  /** Fields separated by `0x1f` */
  fields: v.string(),

  /** Value of sort field */
  sort_field: v.string(),

  /** Checksum used for duplicate check */
  csum: v.number(),
})

export type RevLog = v.InferOutput<typeof RevLog>
export const RevLog = v.object({
  /** Timestamp of when review was done */
  id: v.number(),

  /** Card id */
  cid: v.number(),

  /** The number of milliseconds taken in this review (max 60000) */
  time: v.number(),

  /** 0=learn, 1=review, 2=relearn, 3=filtered, 4=manual */
  type: v.picklist([0, 1, 2, 3, 4]),

  rating: v.enum(Rating),
  state: v.enum(State),
  due: v.number(),
  stability: v.number(),
  difficulty: v.number(),
  elapsed_days: v.number(),
  last_elapsed_days: v.number(),
  scheduled_days: v.number(),
  review: v.number(),
})

export type ModelField = v.InferOutput<typeof ModelField>
export const ModelField = v.object({
  /** Font family displayed in the entry window */
  font: v.optional(v.string()),

  /** Font size displayed in the entry window */
  size: v.optional(v.number()),

  /** Whether the entry window should use RTL text direction */
  rtl: v.boolean(),

  /** Name of this field */
  name: v.string(),

  /** The value to fill in by default when creating a new card of this model */
  sticky: v.optional(v.string()),
})

export type MathjaxOptions = v.InferOutput<typeof MathjaxOptions>
export const MathjaxOptions = v.object({
  /** Inserted at the beginning of any latex text */
  pre: v.string(),

  /** Inserted after any latex text */
  post: v.string(),
})

export type ModelTemplate = v.InferOutput<typeof ModelTemplate>
export const ModelTemplate = v.object({
  qfmt: v.string(),

  afmt: v.string(),

  /** Name of the template */
  name: v.string(),
})

export type Model = v.InferOutput<typeof Model>
export const Model = v.object({
  /** Model id */
  id: v.number(),

  /** CSS of this template */
  css: v.string(),

  /** Deck id that cards of this type go into by default */
  did: v.number(),

  /** Fields in this model */
  fields: v.array(ModelField),

  /** If present, Mathjax options. If absent, Mathquill is used */
  latex: v.optional(MathjaxOptions),

  /** Model name */
  name: v.string(),

  /** Which field to use when sorting */
  sort_field: v.number(),

  /** Templates that this model generates */
  tmpls: v.array(ModelTemplate),

  // mod: "modification time in seconds",
  // tags: "Anki saves the tags of the last added note to the current model, use an empty array []",
  // type: "Integer specifying what type of model. 0 for standard, 1 for cloze",
})

export type Deck = v.InferOutput<typeof Deck>
export const Deck = v.object({
  /** Deck id */
  did: v.number(),

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

  /** Description of deck */
  desc: v.string(),

  // conf: "id of option group from dconf in `col` table. Or absent if the deck is dynamic.
  //       Its absent in filtered deck",
})

export type DeckConf = v.InferOutput<typeof DeckConf>
export const DeckConf = v.object({
  /** Whether to autoplay audio */
  autoplay_audio: v.boolean(),

  /** Configuration id */
  id: v.number(),

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
  }),

  /** Whether to replay audio that's used in the question once answer is shown */
  replay_question_audio: v.boolean(),

  /** Configuration relating to review cards */
  review: v.object({
    /** Whether to bury cards from the same note */
    bury_related: v.boolean(),

    /** The maximum review interval, in days */
    max_review_interval: v.number(),

    /** The number of review cards per day */
    per_day: v.optional(v.number()),
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

export type GlobalConf = v.InferOutput<typeof GlobalConf>
export const GlobalConf = v.object({
  /** Current deck id */
  current_deck: v.optional(v.number()),

  /** Last model used */
  last_model_used: v.optional(v.number()),

  /** Active decks */
  active_decks: v.array(v.number()),

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

  /** Highest due value of a new card. Next note created should be higher than this */
  next_new_card_position: v.number(),

  /** The last time any card was unburied. If not today, then buried notes need to be unburied */
  last_unburied: v.optional(v.number()),

  /** Configuration relating to the browser */
  browser: v.object({
    /** Active columns in the browser */
    active_cols: v.array(
      v.picklist([
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
      ]),
    ),

    /** The field to sort by in the browser */
    sort_field: v.string(),

    /** Whether to sort backwards */
    sort_backwards: v.boolean(),
  }),
})

export type Core = v.InferOutput<typeof Core>
export const Core = v.object({
  /** Collection id */
  id: v.number(),

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

export type Collection = v.InferOutput<typeof Collection>
export const Collection = v.object({
  cards: v.array(AnyCard),
  graves: v.array(Grave),
  notes: v.array(Note),
  rev_log: v.array(RevLog),

  // All things below are part of `collection` in Anki
  core: Core,
  models: v.array(Model),
  decks: v.array(Deck),
  deck_confs: v.array(DeckConf),
  global_conf: GlobalConf,
})

// export function createCollection(): Collection {
//   return {
//     cards: [],
//     core: {},
//     deck_confs: [],
//     decks: [],
//     global_conf: {},
//     graves: [],
//     models: [],
//     notes: [],
//     rev_log: [],
//   }
// }
