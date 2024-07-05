import { JSX } from "solid-js"

export function BottomButtons(props: { class: string; children: JSX.Element }) {
  return (
    <div class="mt-auto flex w-full justify-center">
      <div class={props.class}>{props.children}</div>
    </div>
  )

  // return (
  //   <div class="sticky -bottom-8 -mx-6 -mb-8 mt-auto flex flex-col justify-center">
  //     <div class="flex flex-1 justify-center px-6 pb-8 *:*:border-z-bg-body *:*:shadow">
  //       <div class={props.class}>{props.children}</div>
  //     </div>
  //   </div>
  // )
}
