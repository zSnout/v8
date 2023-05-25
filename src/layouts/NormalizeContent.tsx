export function NormalizeContent(props: { class?: string; children: any }) {
  return (
    <div
      class={
        "fixed left-0 top-0 flex h-screen w-screen flex-1 flex-col px-6 pb-4 pt-16 " +
        (props.class || "")
      }
    >
      {props.children}
    </div>
  )
}
