import { Form, FormField } from "@/components/form"
import { requireUser, supabase } from "@/components/supabase"
import { wait } from "@/components/wait"
import { randomId } from "@/learn/lib/id"

export function Main() {
  const user = requireUser()

  return (
    <Form
      title="Create new story group"
      submit="Create Group"
      onSubmit={async (info) => {
        const name = String(info.data().get("name") ?? "")
        const id = randomId()

        const { id: userId } = await user

        // create the group
        let result = await supabase.from("StoryGroup").insert({ name, id })
        if (result.error) {
          console.error({ ...result.error })
          return result.error.message
        }

        await wait(500)

        // insert ourselves
        result = await supabase
          .from("StoryMemberStats")
          .insert({ group: id, user: userId })
        if (result.error) {
          console.error({ ...result.error })
          return result.error.message
        }

        location.href = `/story/group?id=${id}`
        return "Group created! Redirecting..."
      }}
    >
      {() => (
        <FormField label="Group name">
          <input
            class="z-field w-full shadow-none"
            type="text"
            name="name"
            autocomplete="off"
            minlength={4}
            required
          />
        </FormField>
      )}
    </Form>
  )
}
