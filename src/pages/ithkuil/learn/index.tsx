import { QuizLayout } from "@/components/Quiz"

export function Index() {
  let index = 0

  return (
    <QuizLayout
      createQuestion={() => {
        if (Math.random() < 0.5) {
          return {
            question: "Hello world " + index,
            type: "true-or-false",
            check(value) {
              if (value) {
                index++
                return { correct: true }
              } else {
                return { correct: false, note: "Whoops! You missed " + index }
              }
            },
          }
        } else {
          return {
            question: "What number directly follows " + ++index + "?",

            type: "field",
            check(value) {
              if (+value == index + 1) {
                return { correct: true }
              } else {
                return { correct: false }
              }
            },
          }
        }
      }}
    />
  )
}
