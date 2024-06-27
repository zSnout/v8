import { notNull, pray } from "@/components/pray"
import { FSRS, Rating, RecordLogItem, State } from "ts-fsrs"
import { randomId } from "./id"
import { AppPrefs } from "./state"
import {
  AnyCard,
  Conf,
  NonNewState,
  RepeatItem,
  RepeatResult,
  ReviewedCard,
} from "./types"

function createRepeatItem(
  prev: AnyCard,
  rating: Rating,
  time: number,
  prefs: AppPrefs,
  next: ReviewedCard,
): RepeatItem {
  return {
    card: next,
    log: {
      cid: next.cid,
      difficulty: next.difficulty,
      type: (next.state - 1) as 0 | 1 | 2,
      due: next.due,
      state: next.state,
      id: randomId(),
      rating,
      review: next.last_review,
      last_elapsed_days: prev.elapsed_days,
      elapsed_days: prefs.daysBetween(prev.last_review, next.last_review),
      scheduled_days: prefs.daysBetween(next.due, next.last_review),
      stability: next.stability,
      time,
    },
  }
}

const stateMap = {
  get [State.New](): never {
    throw new Error("Card state cannot be `New` immediately after review.")
  },
  [State.Learning]: NonNewState.Learning,
  [State.Review]: NonNewState.Review,
  [State.Relearning]: NonNewState.Relearning,
}

function merge(
  prev: AnyCard,
  rating: Rating,
  { card: fsrsCard }: RecordLogItem,
  time: number,
  prefs: AppPrefs,
) {
  const lastReview = notNull(
    fsrsCard.last_review,
    "last_review cannot be null directly after a review",
  ).getTime()

  return createRepeatItem(prev, rating, time, prefs, {
    ...prev,
    due: fsrsCard.due.getTime(),
    last_review: lastReview,
    reps: fsrsCard.reps,
    state: stateMap[fsrsCard.state],
    elapsed_days: fsrsCard.elapsed_days,
    scheduled_days: fsrsCard.scheduled_days,
    stability: fsrsCard.stability,
    difficulty: fsrsCard.difficulty,
    lapses: fsrsCard.lapses,
  })
}

function setDue(card: AnyCard, now: number): AnyCard {
  if (card.state == State.New) {
    return { ...card, state: State.Learning, due: now }
  } else {
    return card
  }
}

function repeatFsrs(
  card: AnyCard,
  _conf: Conf,
  prefs: AppPrefs,
  f: FSRS,
  now: number,
  time: number,
): RepeatResult {
  card = setDue(card, now)
  const byFsrs = f.repeat(card, now)

  return {
    [Rating.Again]: merge(
      card,
      Rating.Again,
      byFsrs[Rating.Again],
      time,
      prefs,
    ),
    [Rating.Hard]: merge(card, Rating.Hard, byFsrs[Rating.Hard], time, prefs),
    [Rating.Good]: merge(card, Rating.Good, byFsrs[Rating.Good], time, prefs),
    [Rating.Easy]: merge(card, Rating.Easy, byFsrs[Rating.Easy], time, prefs),
  }
}

function repeatLearning(
  card: AnyCard,
  conf: Conf,
  prefs: AppPrefs,
  f: FSRS,
  now: number,
  time: number,
): RepeatResult {
  card = setDue(card, now)
  const learningSteps = conf.new.learning_steps

  const againStep = learningSteps[0]
  pray(againStep != null, "must have at least one learning step")

  const lastStep = card.last_review ? card.due - card.last_review : againStep
  let lastStepIndex = learningSteps.findLastIndex((step) => step <= lastStep)
  if (lastStepIndex == -1) {
    lastStepIndex = 0
  }

  const byFsrs = repeatFsrs(card, conf, prefs, f, now, time)

  const dueAgain = now + againStep * 1000

  const areLearningStepsLeft = lastStepIndex + 1 < learningSteps.length

  const dueGood = areLearningStepsLeft
    ? now + learningSteps[lastStepIndex + 1]!
    : byFsrs[Rating.Good].card.due

  const dueHard = areLearningStepsLeft
    ? // average again and good
      (dueAgain + dueGood) / 2
    : learningSteps.length == 1
    ? // higher than `Again`
      now + againStep * 1500
    : // go back to last learning step
      now + learningSteps[learningSteps.length - 1]! * 1000

  return {
    [Rating.Again]: createRepeatItem(card, Rating.Again, time, prefs, {
      ...card,
      due: dueAgain,
      last_review: now,
      reps: card.reps + 1,
      state: NonNewState.Learning,
      elapsed_days: prefs.daysBetween(card.last_review, now),
      scheduled_days: 0,
      stability: byFsrs[Rating.Again].card.stability,
      difficulty: byFsrs[Rating.Again].card.difficulty,
      lapses: byFsrs[Rating.Again].card.lapses,
    }),

    [Rating.Hard]: createRepeatItem(card, Rating.Hard, time, prefs, {
      ...card,
      due: dueHard,
      last_review: now,
      reps: card.reps + 1,
      state: NonNewState.Learning,
      elapsed_days: prefs.daysBetween(card.last_review, now),
      scheduled_days: 0,
      stability: byFsrs[Rating.Hard].card.stability,
      difficulty: byFsrs[Rating.Hard].card.difficulty,
      lapses: byFsrs[Rating.Hard].card.lapses,
    }),

    [Rating.Good]: areLearningStepsLeft
      ? createRepeatItem(card, Rating.Good, time, prefs, {
          ...card,
          due: dueGood,
          last_review: now,
          reps: card.reps + 1,
          state: NonNewState.Learning,
          elapsed_days: prefs.daysBetween(card.last_review, now),
          scheduled_days: 0,
          stability: byFsrs[Rating.Good].card.stability,
          difficulty: byFsrs[Rating.Good].card.difficulty,
          lapses: byFsrs[Rating.Good].card.lapses,
        })
      : byFsrs[Rating.Good],

    [Rating.Easy]: byFsrs[Rating.Easy],
  }
}

/**
 * This should really only be available in `state.ts`, but it's nice to break up
 * the code into multiple modules. So this function is given a very long name to
 * dissuade it from being used in other areas of the code.
 */
export function __unsafeDoNotUseDangerouslySetInnerHtmlYetAnotherMockOfReactRepeatUnfiltered(
  card: AnyCard,
  conf: Conf,
  prefs: AppPrefs,
  f: FSRS,
  now: number,
  time: number,
): RepeatResult {
  if (
    card.last_review == null ||
    card.state == State.New ||
    card.state == State.Learning
  ) {
    return repeatLearning(card, conf, prefs, f, now, time)
  }

  return repeatFsrs(card, conf, prefs, f, now, time)
}
