import {
  ALL_CONTEXTS,
  ALL_EXTENSIONS,
  ALL_PERSPECTIVES,
  type Configuration,
} from "@zsnout/ithkuil/generate"
import { Primary, type PrimaryCharacter } from "@zsnout/ithkuil/script"
import { type Accessor, type Setter, createSignal } from "solid-js"

export function PrimaryEditor(props: {
  get: Accessor<PrimaryCharacter>
  set: Setter<PrimaryCharacter>
}) {
  function Button(props: { active: boolean; label: any; onClick: () => void }) {
    return (
      <button
        class="px-2 font-mono"
        classList={{
          "bg-z-body-selected": props.active,
          "bg-z-body": !props.active,
        }}
        onClick={props.onClick}
      >
        {props.label}
      </button>
    )
  }

  function InnerContainer(props: { min?: boolean; children: any }) {
    return (
      <div
        class="flex flex-wrap items-center justify-center gap-px overflow-clip rounded border border-z bg-z-border"
        classList={{ "w-min": props.min }}
      >
        {props.children}
      </div>
    )
  }

  function Container(props: { min?: boolean; children: any }) {
    return (
      <div class="flex items-center justify-center">
        <InnerContainer {...props} />
      </div>
    )
  }

  const { get, set } = props

  return (
    <div class="grid h-full max-h-full flex-1 grid-cols-3">
      <div class="flex flex-col items-center justify-center gap-2">
        <InnerContainer>
          {ALL_PERSPECTIVES.map((perspective) => (
            <Button
              active={(get().perspective || "M") == perspective}
              onClick={() => set((x) => ({ ...x, perspective }))}
              label={perspective}
            />
          ))}
        </InnerContainer>
        <InnerContainer>
          {ALL_EXTENSIONS.map((extension) => (
            <Button
              active={(get().extension || "DEL") == extension}
              onClick={() => set((x) => ({ ...x, extension }))}
              label={extension}
            />
          ))}
        </InnerContainer>
      </div>
      <Container>
        {ALL_CONTEXTS.map((context) => (
          <Button
            active={(get().context || "EXS") == context}
            onClick={() => set((x) => ({ ...x, context }))}
            label={context}
          />
        ))}
      </Container>
      <div />

      <div />
      <svg class="z-field h-96 w-96" viewBox="-100 -100 200 200">
        {(get(), (<Primary {...get()} />))}
      </svg>
      <div />

      <Container min>
        <div class="flex gap-px">
          <Button
            active={(get().configuration || "UPX").endsWith("PX")}
            onClick={() =>
              set((x) => ({
                ...x,
                configuration: x.configuration?.startsWith("D") ? "DPX" : "UPX",
              }))
            }
            label="PX"
          />
          {["SS", "SC", "SF", "DS"].map((config) => (
            <Button
              active={get().configuration?.endsWith(config) || false}
              onClick={() =>
                set((x) => ({
                  ...x,
                  configuration: (x.configuration?.startsWith("D") ?
                    "D" + config
                  : "M" + config) as Configuration,
                }))
              }
              label={config}
            />
          ))}
        </div>
        <div class="flex gap-px">
          {["DC", "DF", "FS", "FC", "FF"].map((config) => (
            <Button
              active={get().configuration?.endsWith(config) || false}
              onClick={() =>
                set((x) => ({
                  ...x,
                  configuration: (x.configuration?.startsWith("D") ?
                    "D" + config
                  : "M" + config) as Configuration,
                }))
              }
              label={config}
            />
          ))}
        </div>
      </Container>
      <Container>
        <Button
          active={(get().bottom || "UNF/C") == "UNF/C"}
          onClick={() => set((x) => ({ ...x, bottom: "UNF/C" }))}
          label="UNF/C"
        />
        <Button
          active={get().bottom == "UNF/K"}
          onClick={() => set((x) => ({ ...x, bottom: "UNF/K" }))}
          label="UNF/K"
        />
        <Button
          active={get().bottom == "FRM"}
          onClick={() => set((x) => ({ ...x, bottom: "FRM" }))}
          label="FRM"
        />
        <Button
          active={get().bottom == 1}
          onClick={() => set((x) => ({ ...x, bottom: 1 }))}
          label="T1"
        />
        <Button
          active={get().bottom == 2}
          onClick={() => set((x) => ({ ...x, bottom: 2 }))}
          label="T2"
        />
      </Container>
      <div />
    </div>
  )
}

export function Main() {
  for (const el of document.getElementsByClassName("rw33")) {
    el.remove()
  }

  const [get, set] = createSignal<PrimaryCharacter>({})

  return <PrimaryEditor get={get} set={set} />
}
