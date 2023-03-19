export function Center(props: { isPopup?: boolean; children: any }) {
  return (
    <div
      class={
        "group/center m-auto flex w-96 max-w-full flex-col " +
        (props.isPopup ? "mb-0 xs:mb-auto" : "")
      }
    >
      {props.children}
    </div>
  )
}
