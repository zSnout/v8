import { faChevronRight } from "@fortawesome/free-solid-svg-icons"
import {
  For,
  JSX,
  batch,
  createEffect,
  createSignal,
  onMount,
  untrack,
} from "solid-js"
import { Fa } from "./Fa"
import { TreeOf } from "./tree"

// export type ItemProps<T, U> = {
//   data: U
//   parent: string[]
//   name: string
//   subtree?: undefined
//   item: Item<T, U>
//   group: Group<T, U>
//   setExpanded: (parent: string[], name: string, expanded: boolean) => void
//   isExpanded: (parent: string[], name: string) => boolean
// }

// export type GroupProps<T, U> = {
//   data: U
//   parent: string[]
//   name: string
//   subtree: TreeOf<T, U>
//   item: Item<T, U>
//   group: Group<T, U>
//   setExpanded: (parent: string[], name: string, expanded: boolean) => void
//   isExpanded: (parent: string[], name: string) => boolean
// }

// export type NodeProps<T, U> = {
//   data: T | U
//   parent: string[]
//   name: string
//   subtree?: TreeOf<T, U> | undefined
//   item: Item<T, U>
//   group: Group<T, U>
//   setExpanded: (parent: string[], name: string, expanded: boolean) => void
//   isExpanded: (parent: string[], name: string) => boolean
// }

// export type Item<T, U> = (props: ItemProps<T, U>) => JSX.Element
// export type Group<T, U> = (props: GroupProps<T, U>) => JSX.Element

export function Expandable(props: {
  children?: JSX.Element
  label: JSX.Element
  expanded?: boolean
  setExpanded?(value: boolean): void
}) {
  const [expanding, setExpanding] = createSignal(false)
  let inner: HTMLDivElement | undefined

  let last = untrack(() => props.expanded)
  createEffect(() => {
    if (last == props.expanded) {
      return
    }

    last = props.expanded
    setExpanding(true)

    if (!inner) {
      return
    }

    inner.classList.remove("hidden")
  })
  onMount(() => {
    if (!props.expanded) {
      inner?.classList.add("hidden")
    }
    setExpanding(false)
  })

  return (
    <li class="flex flex-col" classList={{ "z-expanding": expanding() }}>
      <div class="flex w-full gap-2">
        <button
          class="z-expand-checkbox-group"
          classList={{ "z-expanded-now": props.expanded }}
          // @ts-ignore solid is fine with this
          onforceopen={() => props.setExpanded?.(true)}
          // @ts-ignore solid is fine with this
          onforceclose={() => props.setExpanded?.(false)}
          onClick={() => props.setExpanded?.(!props.expanded)}
          onContextMenu={(event) => {
            if (!inner) {
              return
            }

            event.preventDefault()

            const dropdowns = Array.from(
              inner.getElementsByClassName("z-expand-checkbox-group"),
            )

            batch(() => {
              if (
                dropdowns.every((x) => x.classList.contains("z-expanded-now"))
              ) {
                for (const d of dropdowns) {
                  d.dispatchEvent(new CustomEvent("forceclose"))
                  props.setExpanded?.(false)
                }
              } else {
                for (const d of dropdowns) {
                  d.dispatchEvent(new CustomEvent("forceopen"))
                  props.setExpanded?.(true)
                }
              }
            })
          }}
        >
          <Fa
            class={"h-3 w-3 transition" + (props.expanded ? " rotate-90" : "")}
            icon={faChevronRight}
            title="expand section"
          />
        </button>

        {props.label}
      </div>

      <div
        class="overflow-clip transition-[max-height]"
        classList={{
          "max-h-[--max-height]": props.expanded,
          "[&:has(.z-expanding)]:max-h-auto": props.expanded,
          "[&:has(.z-expanding)]:transition-none": props.expanded,
          "max-h-0": !props.expanded,
          "[.z-expanding_&]:transition-none": !expanding(),
        }}
        ref={(el) => (inner = el)}
        onTransitionEnd={(event) => {
          if (event.currentTarget != event.target) return
          if (!props.expanded) event.currentTarget.classList.add("hidden")
          setExpanding(false)
        }}
        inert={!props.expanded}
        aria-hidden={!props.expanded}
      >
        <ul
          class="relative flex flex-col gap-1 pl-6 [&>:first-child]:mt-1"
          ref={(el) => {
            const observer = new ResizeObserver(([entry]) => {
              const { height } = entry!.contentRect || entry!.contentBoxSize
              // if (height == 0) return
              el.parentElement?.style.setProperty("--max-height", height + "px")
            })
            observer.observe(el, { box: "content-box" })
          }}
        >
          {props.children}
        </ul>
      </div>
    </li>
  )
}

// function Item<T, U>(props: ItemProps<T, U>) {
//   return (
//     <li class="flex w-full pl-6">
//       <Expandable label={props.item(props)} />
//     </li>
//   )
// }

// function Group<T, U>(props: GroupProps<T, U>) {
//   return (
//     <Expandable
//       label={props.group(props)}
//       expanded={props.isExpanded(props.parent, props.name)}
//     >
//       <For each={Object.entries(props.subtree)}>{([key, node]) => 0}</For>
//     </Expandable>
//   )
// }

// function Node<T, U>(props: NodeProps<T, U>) {
//   if (props.subtree) {
//     return Group<T, U>(props as GroupProps<T, U>)
//   } else {
//     return Item<T, U>(props as ItemProps<T, U>)
//   }
// }

// // export function ExpandableNode<T>(props: {
// //   key: string
// //   parent: readonly string[]
// //   isLeaf: (value: BasicTreeOf<T> | T) => value is T
// //   node: BasicTreeOf<T> | T
// //   tree: BasicTree<T>
// // }) {
// //   if (props.isLeaf(props.node)) {
// //     return (
// //       <ExpandableItem
// //         label={props.key}
// //         checked={props.tree.isEnabled(props.parent, props.key)}
// //         onInput={(enabled) =>
// //           props.tree.toggleEnabled(props.parent, props.key, enabled)
// //         }
// //       />
// //     )
// //   } else {
// //     return (
// //       <ExpandableGroup
// //         label={props.key}
// //         expanded={props.tree.isExpanded(props.parent, props.key)}
// //         onExpanded={(enabled) =>
// //           props.tree.toggleExpanded(props.parent, props.key, enabled)
// //         }
// //       >
// //         <For each={Object.entries(props.node)}>
// //           {([key, node]) => (
// //             <ExpandableNode<T>
// //               key={key}
// //               isLeaf={props.isLeaf}
// //               node={node}
// //               tree={props.tree}
// //               parent={props.parent.concat(props.key)}
// //             />
// //           )}
// //         </For>
// //       </ExpandableGroup>
// //     )
// //   }
// // }

// // export function ExpandableTree<T>(props: { tree: BasicTree<T> }) {
// //   return (
// //     <For each={Object.entries(props.tree.tree)}>
// //       {([key, node]) => (
// //         <ExpandableNode<T>
// //           key={key}
// //           isLeaf={props.tree.isLeaf}
// //           node={node}
// //           tree={props.tree}
// //           parent={[]}
// //         />
// //       )}
// //     </For>
// //   )
// // }

// // export function ExpandableTree<T, U>(props: { indent: `pl-${PaddingSize}` }) {}

// // // prettier-ignore
// // type PaddingSize =
// //   | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 12 | 14 | 16 | 20 | 24 | 28 | 32
// //   | 36 | 40 | 44 | 48 | 52 | 56 | 60 | 64 | 72 | 80 | 96 | "px" | 0.5 | 1.5
// //   | 2.5 | 3.5 | 4.5
