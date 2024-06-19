export function Main() {
  return (
    <div class="flex flex-1 gap-6">
      <div class="flex flex-1 flex-col">
        <div class="mb-auto flex flex-col gap-4">
          <div class="text-center text-6xl font-semibold text-z-heading sm:text-7xl md:text-8xl lg:text-9xl">
            7:00
          </div>

          <hr class="border-z" />

          <div class="text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
            しちじ
          </div>
        </div>

        <div class="grid grid-cols-4 gap-1 md:gap-2">
          <button class="rounded bg-red-300 py-2 text-red-900">Again</button>
          <button class="rounded bg-[#ffcc91] py-2 text-yellow-900">
            Hard
          </button>
          <button class="rounded bg-green-300 py-2 text-green-900">Good</button>
          <button class="rounded bg-blue-300 py-2 text-blue-900">Easy</button>
        </div>
      </div>

      <div class="hidden w-48 rounded-lg border border-z sm:flex md:w-72"></div>
    </div>
  )
}
