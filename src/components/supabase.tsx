import {
  createClient,
  type PostgrestError,
  type PostgrestSingleResponse,
} from "@supabase/supabase-js"
import { createResource, Match, Switch, type JSX } from "solid-js"
import type { Database } from "./supabase.types"

const supabaseUrl = import.meta.env.PUBLIC_V8_SUPABASE_URL
const supabaseKey = import.meta.env.PUBLIC_V8_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)

export function requireUser() {
  const p = (async () => {
    const user = await supabase.auth.getUser()
    if (user.error) {
      location.href = "/log-in"
      throw new Error("User is not logged in.")
    }
    return user.data.user
  })()

  return Object.assign(p, { resource: createResource(() => p) })
}

export function MatchQuery<T>(props: {
  result: PostgrestSingleResponse<T> | undefined
  loading: JSX.Element
  error: (error: PostgrestError) => JSX.Element
  ok: (data: T, count: number | null) => JSX.Element
}) {
  return (
    <Switch>
      <Match when={props.result == null}>{props.loading}</Match>
      <Match when={props.result && props.result.error}>
        {props.error(props.result?.error!)}
      </Match>
      <Match when={props.result && !props.result.error}>
        {props.ok(props.result?.data!, props.result?.count!)}
      </Match>
    </Switch>
  )
}

export function QueryLoading(props: { message: string }) {
  return <p class="text-center italic text-z-subtitle">{props.message}</p>
}

export function queryError(error: PostgrestError) {
  return <p class="text-center italic text-z-subtitle">{error.message}</p>
}
