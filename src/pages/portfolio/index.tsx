import TEST from "./TEST.png"

export function Main() {
  return (
    <div class="relative h-72 w-full overflow-hidden rounded-xl">
      <img
        class="absolute left-0 top-0 h-full w-full origin-bottom rounded-xl object-cover"
        src={TEST}
      />

      <img
        class="absolute left-0 top-0 h-full w-full origin-bottom translate-y-[64000px] scale-y-[200000%] rounded-xl object-cover"
        src={TEST}
      />

      <img
        class="absolute left-0 top-0 h-56 w-full rounded-t-xl object-cover"
        src={TEST}
      />

      <div class="absolute left-0 top-0 h-full w-full">
        <div class="absolute bottom-0 left-0 h-16 w-full rounded-b-xl backdrop-blur-lg" />

        {/* <div class="absolute bottom-0 left-0 h-[45%] w-full backdrop-blur-sm" />
        <div class="absolute bottom-0 left-0 h-[40%] w-full backdrop-blur-sm" />
        <div class="absolute bottom-0 left-0 h-[35%] w-full backdrop-blur-sm" />
        <div class="absolute bottom-0 left-0 h-[30%] w-full backdrop-blur-sm" />
        <div class="absolute bottom-0 left-0 h-[25%] w-full backdrop-blur-sm" />
        <div class="absolute bottom-0 left-0 h-[20%] w-full backdrop-blur-sm" />
        <div class="absolute bottom-0 left-0 h-[15%] w-full backdrop-blur-sm" />
        <div class="absolute bottom-0 left-0 h-[10%] w-full backdrop-blur-sm" />
        <div class="absolute bottom-0 left-0 h-[05%] w-full backdrop-blur-sm" /> */}
      </div>
    </div>
  )
}
