export function Heading(props: { children: any; center?: boolean }) {
  return (
    <h1
      class={
        "mb-4 text-lg font-light " +
        (props.center ? "text-center" : "group-[/center]:text-center")
      }
    >
      {props.children}
    </h1>
  )
}
