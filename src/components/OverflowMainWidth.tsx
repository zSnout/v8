export function OverflowMainWidth(props: { children: any }) {
  return (
    <div class="relative left-[min(-1.5rem,32rem_-_50vw)] flex w-screen overflow-x-auto px-[max(1.5rem,50vw_-_32rem)] scrollbar:hidden">
      {props.children}
    </div>
  )
}
