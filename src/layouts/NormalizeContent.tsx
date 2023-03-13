export function NormalizeContent(props: { class?: string; children: any }) {
  return (
    <div
      class={
        "fixed top-0 left-0 flex h-screen w-screen flex-1 flex-col px-6 pt-16 pb-4 " +
        (props.class || "")
      }
    >
      {props.children}
    </div>
  )
}
