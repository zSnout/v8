import { createField, createModel, createModelTemplate } from "../lib/defaults"
import { idOf } from "../lib/id"
import { Model } from "../lib/types"

export function createBasicModel(now: number): Model {
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

export function createBasicAndReversedModel(now: number): Model {
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
