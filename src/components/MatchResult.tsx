import { Match, Show, Switch, type Accessor, type JSX } from "solid-js"
import type { Result } from "./result"

export function MatchResult<T>(props: {
  children: (value: Accessor<NonNullable<T>>) => JSX.Element
  fallback: (value: Accessor<string>) => JSX.Element
  result: Result<T>
}) {
  return (
    <Show
      fallback={props.fallback(() =>
        props.result.ok ? "" : props.result.reason,
      )}
      when={props.result.ok ? props.result.value : undefined}
    >
      {(value) => props.children(value)}
    </Show>
  )
}

export function MatchResultOf<T, E>(props: {
  children: (value: Accessor<NonNullable<T>>) => JSX.Element
  fallback: (value: Accessor<NonNullable<E>>) => JSX.Element
  result: Result<T, E>
}) {
  return (
    <Switch>
      <Match when={props.result.ok ? props.result.value : undefined}>
        {(value) => props.children(value)}
      </Match>

      <Match when={props.result.ok ? undefined : props.result.reason}>
        {(value) => props.fallback(value)}
      </Match>
    </Switch>
  )
}
