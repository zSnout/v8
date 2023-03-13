export function Heading(props: { children: any }) {
  return (
    <h1 class="mb-4 text-lg font-light group-[center]:text-center">
      {props.children}
    </h1>
  )
}
