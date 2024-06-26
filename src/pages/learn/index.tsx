import { Application } from "./lib/application"
import { createCollection } from "./lib/defaults"

const app = new Application(createCollection(Date.now()))

export function Main() {
  return <div class="flex flex-col"></div>
}
