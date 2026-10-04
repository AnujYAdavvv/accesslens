"use client"

import { useActionState } from "react"
import { createProject, type CreateProjectState } from "@/app/projects/actions"

const initialState: CreateProjectState = {}

export default function CreateProjectForm() {
  const [state, formAction, isPending] = useActionState(
    createProject,
    initialState
  )

  return (
    <form action={formAction}>
      <div>
        <label htmlFor="name">Name</label>

        <input
          id="name"
          name="name"
          type="text"
          aria-invalid={!!state.errors?.name}
          aria-describedby={state.errors?.name ? "name-error" : undefined}
        />

        {state.errors?.name && (
          <p id="name-error">
            {state.errors.name[0]}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="url">URL</label>

        <input
          id="url"
          name="url"
          type="url"
          aria-invalid={!!state.errors?.url}
          aria-describedby={state.errors?.url ? "url-error" : undefined}
        />

        {state.errors?.url && (
          <p id="url-error">
            {state.errors.url[0]}
          </p>
        )}
      </div>

      <button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create project"}
      </button>
    </form>
  )
}