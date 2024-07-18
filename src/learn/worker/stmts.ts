import { ID_ZERO } from "@/learn/lib/id"
import { deserializeSidebar, serializeSidebar } from "@/learn/lib/sidebar"
import {
  AnyCard,
  Conf,
  Core,
  Deck,
  Grave,
  Model,
  Note,
  Prefs,
  Review,
} from "@/learn/lib/types"
import type { SqlValue } from "sql.js"
import { parse } from "valibot"
import { db } from "./db"

export const VERSION = 8

export type INTEGER = number
export type BOOLEAN = number
export type TEXT = string

export const stmts = {
  core: {
    prepareInsert() {
      return db.prepare("INSERT INTO core VALUES (?, ?, ?, ?, ?, ?, ?)")
    },
    makeArgs(core: Core): SqlValue[] {
      return [
        ID_ZERO satisfies INTEGER,
        VERSION satisfies INTEGER,
        core.creation satisfies INTEGER,
        core.last_edited satisfies INTEGER,
        core.last_schema_edit satisfies INTEGER,
        core.last_sync satisfies INTEGER,
        core.tags satisfies TEXT,
      ]
    },
  },
  graves: {
    prepareInsert() {
      return db.prepare("INSERT INTO graves VALUES (?, ?, ?)")
    },
    makeArgs(grave: Grave): SqlValue[] {
      return [
        grave.id satisfies INTEGER,
        grave.oid satisfies INTEGER,
        grave.type satisfies INTEGER,
      ]
    },
  },
  confs: {
    prepareInsert() {
      return db.prepare(
        "INSERT INTO confs VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
    },
    makeArgs(conf: Conf): SqlValue[] {
      return [
        conf.id satisfies INTEGER,
        +conf.autoplay_audio satisfies BOOLEAN,
        conf.last_edited satisfies INTEGER,
        conf.name satisfies TEXT,
        +conf.new.bury_related satisfies BOOLEAN,
        +conf.new.pick_at_random satisfies BOOLEAN,
        conf.new.per_day satisfies INTEGER,
        JSON.stringify(conf.new.learning_steps) satisfies TEXT,
        +conf.replay_question_audio satisfies BOOLEAN,
        +conf.review.bury_related satisfies BOOLEAN,
        +conf.review.enable_fuzz satisfies BOOLEAN,
        conf.review.max_review_interval satisfies INTEGER,
        conf.review.per_day ?? (null satisfies INTEGER | null),
        JSON.stringify(conf.review.relearning_steps) satisfies TEXT,
        conf.review.requested_retention satisfies INTEGER,
        (conf.review.w
          ? JSON.stringify(conf.review.w)
          : null) satisfies TEXT | null,
        +conf.show_global_timer satisfies BOOLEAN,
        conf.timer_per_card ?? (null satisfies INTEGER | null),
      ]
    },
  },
  decks: {
    prepareInsert() {
      return db.prepare(
        "INSERT INTO decks VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
    },
    makeArgs(deck: Deck): SqlValue[] {
      return [
        deck.id satisfies INTEGER,
        deck.name satisfies TEXT,
        +deck.collapsed satisfies BOOLEAN,
        +deck.is_filtered satisfies BOOLEAN,
        (deck.custom_revcard_limit ?? null) satisfies INTEGER | null,
        (deck.custom_newcard_limit ?? null) satisfies INTEGER | null,
        (deck.default_revcard_limit ?? null) satisfies INTEGER | null,
        (deck.default_newcard_limit ?? null) satisfies INTEGER | null,
        deck.last_edited satisfies INTEGER,
        JSON.stringify(deck.new_today) satisfies TEXT,
        JSON.stringify(deck.revcards_today) satisfies TEXT,
        deck.revlogs_today satisfies INTEGER,
        deck.today satisfies INTEGER,
        deck.desc satisfies TEXT,
        deck.cfid satisfies INTEGER,
      ]
    },
  },
  models: {
    prepareInsert() {
      return db.prepare(
        "INSERT INTO models VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
    },
    makeArgs(model: Model): SqlValue[] {
      return [
        model.id satisfies INTEGER,
        model.css satisfies TEXT,
        JSON.stringify(model.fields) satisfies TEXT,
        (model.latex
          ? JSON.stringify(model.latex)
          : null) satisfies TEXT | null,
        model.name satisfies TEXT,
        (model.sort_field ?? null) satisfies INTEGER | null,
        JSON.stringify(model.tmpls) satisfies TEXT,
        model.tags.join(" ") satisfies TEXT,
        model.type satisfies INTEGER,
        model.creation satisfies INTEGER,
        model.last_edited satisfies INTEGER,
      ]
    },
  },
  notes: {
    prepareInsert() {
      return db.prepare("INSERT INTO notes VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
    },
    makeArgs(note: Note): SqlValue[] {
      return [
        note.id satisfies INTEGER,
        note.creation satisfies INTEGER,
        note.mid satisfies INTEGER,
        note.last_edited satisfies INTEGER,
        note.tags.join(" ") satisfies TEXT,
        JSON.stringify(note.fields) satisfies TEXT,
        note.sort_field satisfies TEXT,
        note.csum satisfies INTEGER,
        note.marks satisfies INTEGER,
      ]
    },
  },
  cards: {
    prepareInsert() {
      return db.prepare(
        "INSERT INTO cards VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
    },
    makeArgs(card: AnyCard): SqlValue[] {
      return [
        card.id satisfies INTEGER,
        card.nid satisfies INTEGER,
        card.tid satisfies INTEGER,
        card.did satisfies INTEGER,
        (card.odid ?? null) satisfies INTEGER | null,
        card.creation satisfies INTEGER,
        card.last_edited satisfies INTEGER,
        card.queue satisfies INTEGER,
        card.due satisfies INTEGER,
        (card.last_review ?? null) satisfies INTEGER | null,
        card.stability satisfies INTEGER,
        card.difficulty satisfies INTEGER,
        card.elapsed_days satisfies INTEGER,
        card.scheduled_days satisfies INTEGER,
        card.reps satisfies INTEGER,
        card.lapses satisfies INTEGER,
        card.flags satisfies INTEGER,
        card.state satisfies INTEGER,
      ]
    },
  },
  rev_log: {
    prepareInsert() {
      return db.prepare(
        "INSERT INTO rev_log VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
    },
    makeArgs(review: Review) {
      return [
        review.id satisfies INTEGER,
        review.cid satisfies INTEGER,
        review.time satisfies INTEGER,
        review.type satisfies INTEGER,
        review.rating satisfies INTEGER,
        review.state satisfies INTEGER,
        review.due satisfies INTEGER,
        review.stability satisfies INTEGER,
        review.difficulty satisfies INTEGER,
        review.elapsed_days satisfies INTEGER,
        review.last_elapsed_days satisfies INTEGER,
        review.scheduled_days satisfies INTEGER,
        review.review satisfies INTEGER,
      ]
    },
  },
  prefs: {
    prepareInsert() {
      return db.prepare(
        "INSERT INTO prefs VALUES (0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
    },
    prepareUpdate() {
      return db.prepare(
        "UPDATE prefs SET last_edited = ?, current_deck = ?, last_model_used = ?, new_spread = ?, collapse_time = ?, notify_after_time = ?, show_review_time_above_buttons = ?, show_remaining_due_counts = ?, show_deck_name = ?, next_new_card_position = ?, last_unburied = ?, day_start = ?, debug = ?, sidebar_state = ?, template_edit_style = ?, show_flags_in_sidebar = ?, show_marks_in_sidebar = ?, browser = ? WHERE id = 0",
      )
    },
    /**
     * Expects data from SELECT *.
     *
     * Not compatiable with makeArgs.
     */
    interpret(data: SqlValue[]): Prefs {
      const result = {
        // data[0] is ID_ZERO
        last_edited: data[1],
        current_deck: data[2],
        last_model_used: data[3],
        new_spread: data[4],
        collapse_time: data[5],
        notify_after_time: data[6],
        show_review_time_above_buttons: !!data[7],
        show_remaining_due_counts: !!data[8],
        show_deck_name: !!data[9],
        next_new_card_position: data[10],
        last_unburied: data[11],
        day_start: data[12],
        debug: !!data[13],
        sidebar_state: deserializeSidebar(data[14] as number),
        template_edit_style: JSON.parse(data[15] as string),
        show_flags_in_sidebar: !!data[16],
        show_marks_in_sidebar: !!data[17],
        browser: JSON.parse(data[18] as string),
      }

      return parse(Prefs, result)
    },
    /**
     * Prepares arguments for INSERT or UPDATE.
     *
     * Not compatiable with interpret.
     */
    makeArgs(prefs: Prefs) {
      return [
        prefs.last_edited satisfies INTEGER,
        (prefs.current_deck ?? null) satisfies INTEGER | null,
        (prefs.last_model_used ?? null) satisfies INTEGER | null,
        prefs.new_spread satisfies INTEGER,
        prefs.collapse_time satisfies INTEGER,
        prefs.notify_after_time satisfies INTEGER,
        +prefs.show_review_time_above_buttons satisfies BOOLEAN,
        +prefs.show_remaining_due_counts satisfies BOOLEAN,
        +prefs.show_deck_name satisfies BOOLEAN,
        prefs.next_new_card_position satisfies INTEGER,
        (prefs.last_unburied ?? null) satisfies INTEGER | null,
        prefs.day_start satisfies INTEGER,
        +prefs.debug satisfies BOOLEAN,
        serializeSidebar(prefs.sidebar_state) satisfies INTEGER,
        JSON.stringify(prefs.template_edit_style) satisfies TEXT,
        +prefs.show_flags_in_sidebar satisfies BOOLEAN,
        +prefs.show_marks_in_sidebar satisfies BOOLEAN,
        JSON.stringify(prefs.browser) satisfies TEXT,
      ] satisfies SqlValue[]
    },
  },
}
