import { createField, createModelTemplate } from "./defaults"
import { Id, idOf } from "./id"
import { arrayToRecord } from "./record"
import { Model, ModelField, ModelTemplate } from "./types"

function createModel(
  id: Id,
  name: string,
  tmpls: ModelTemplate[],
  css: string,
  fields: ModelField[],
  now: number,
): Model {
  return {
    id,
    css,
    fields: arrayToRecord(fields),
    tmpls: arrayToRecord(tmpls),
    name,
    tags: [],
    type: 0,
    sort_field: fields[0]?.id,
    last_edited: now,
  }
}

export function cloneModel(id: Id, name: string, model: Model): Model {
  return {
    ...structuredClone(model),
    id,
    name,
    last_edited: Date.now(),
  }
}

function createBasicModel(now: number): Model {
  return createModel(
    idOf(3166958980394845),
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
    `.card {
  font-size: 1.5rem;
  text-align: center;
}

hr {
  border-width: 0;
  border-top-width: 1px;
  border-top-color: var(--z-border);
  border-style: solid;
}`,
    [createField("Front"), createField("Back")],
    now,
  )
}

function createBasicAndReversedModel(now: number): Model {
  return createModel(
    idOf(3323968114672263),
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
    `.card {
  font-size: 1.5rem;
  text-align: center;
}

hr {
  border-width: 0;
  border-top-width: 1px;
  border-top-color: var(--z-border);
  border-style: solid;
}`,
    [createField("Front"), createField("Back")],
    now,
  )
}

export function createBuiltinV3(now: number) {
  return [createBasicModel(now), createBasicAndReversedModel(now)]
}

export function createBuiltin(now: number) {
  return createBuiltinV3(now)
}

export const BUILTIN_IDS = Object.freeze([
  3166958980394845, 3323968114672263,
]) as readonly Id[]
