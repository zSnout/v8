import { MegaCard } from "./MegaCard"
import { pages } from "./pages"

export function LatestBlogArticle() {
  return <MegaCard {...pages[0]!} />
}
