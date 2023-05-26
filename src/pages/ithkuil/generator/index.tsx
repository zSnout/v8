import {
  createLabeledQuadRadioGroup,
  LabeledQuadRadioGroup,
} from "@/components/fields/DetailedRadioGroup"
import { Heading } from "@/components/Heading"

export function Index() {
  const [stem, elStem] = createLabeledQuadRadioGroup({
    label: "Stem",
    options: [
      {
        value: 1,
        description: "The default stem of a word.",
        name: "Stem 1",
      },
      {
        value: 2,
        description: "The second stem of a word.",
        name: "Stem 2",
      },
      {
        value: 3,
        description: "The third stem of a word.",
        name: "Stem 3",
      },
      {
        value: 0,
        description:
          "Marks that all three stems of the word are being used simulataneously or ambiguously.",
        name: "Stem 0",
      },
    ],
  })

  return (
    <>
      <div class="group/center contents">
        <Heading>Ithkuil Word Generator</Heading>
      </div>

      {elStem}
    </>
  )
}
