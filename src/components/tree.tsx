import { For, JSX } from "solid-js"
import { pray } from "./pray"

export type SubtreeOf<T, U> = { subtree: TreeOf<T, U>; data: T }
export type LeafOf<U> = { subtree?: undefined; data: U }
export type NodeOf<T, U> = SubtreeOf<T, U> | LeafOf<U>
export type TreeOf<T, U> = { [name: PropertyKey]: NodeOf<T, U> }

export class Tree<T, U> {
  constructor(readonly tree: TreeOf<T, U> = Object.create(null)) {}

  set(
    path: readonly PropertyKey[],
    leaf: U,
    leafToSubtree: (leaf: U) => T,
    newSubtree: (path: PropertyKey[]) => T,
    mergeFromLeaf: (current: U, next: U) => U,
    mergeFromSubtree: (current: T, next: U) => T,
  ) {
    let tree = this.tree

    const last = path[path.length - 1]
    pray(last != null, "the path must have at least one segment")

    for (let index = 0; index < path.length - 1; index++) {
      const part = path[index]!
      const next = tree[part]

      if (next == null) {
        const subtree = Object.create(null)
        tree[part] = { subtree, data: newSubtree(path.slice(0, index + 1)) }
        tree = subtree
      } else if (!next.subtree) {
        const subtree = Object.create(null)
        tree[part] = { subtree, data: leafToSubtree(next.data) }
        tree = subtree
      } else {
        tree = next.subtree
      }
    }

    const next = tree[last]

    if (next == null) {
      tree[last] = { data: leaf }
    } else if (!next.subtree) {
      next.data = mergeFromLeaf(next.data, leaf)
    } else {
      next.data = mergeFromSubtree(next.data, leaf)
    }
  }
}

export interface SubtreeProps<T, U> {
  data: T
  key: string
  children: JSX.Element
  parent: readonly string[]
  subtree: TreeOf<T, U>
}

export interface LeafProps<U> {
  data: U
  key: string
  children?: undefined
  parent: readonly string[]
  subtree?: undefined
}

export interface NodeProps<T, U> {
  data: T | U
  key: string
  children?: JSX.Element | undefined
  parent: readonly string[]
  subtree?: TreeOf<T, U>
}

function RenderTreeInner<T, U>(props: {
  tree: TreeOf<T, U>
  subtree: (props: SubtreeProps<T, U>) => JSX.Element
  leaf: (props: LeafProps<U>) => JSX.Element
  path: readonly string[]
}) {
  return (
    <For each={Object.entries(props.tree)}>
      {([key, value]) => {
        if (value.subtree) {
          return props.subtree({
            children: (
              <RenderTreeInner
                tree={value.subtree}
                subtree={props.subtree}
                leaf={props.leaf}
                path={props.path.concat(key)}
              />
            ),
            data: value.data,
            key,
            parent: props.path,
            subtree: value.subtree,
          })
        } else {
          return props.leaf({
            data: value.data,
            key,
            parent: props.path,
          })
        }
      }}
    </For>
  )
}

export function RenderTree<T, U>(props: {
  tree: TreeOf<T, U> | Tree<T, U>
  subtree: (props: SubtreeProps<T, U>) => JSX.Element
  leaf: (props: LeafProps<U>) => JSX.Element
}) {
  return (
    <RenderTreeInner
      tree={props.tree instanceof Tree ? props.tree.tree : props.tree}
      leaf={props.leaf}
      subtree={props.subtree}
      path={[]}
    />
  )
}

export function RenderUniformTree<T, U>(props: {
  tree: TreeOf<T, U> | Tree<T, U>
  children: (props: NodeProps<T, U>) => JSX.Element
}) {
  return (
    <RenderTreeInner
      tree={props.tree instanceof Tree ? props.tree.tree : props.tree}
      leaf={props.children}
      subtree={props.children}
      path={[]}
    />
  )
}
