'use client'

import { startTransition, useActionState, useState } from 'react'
import type { RunAuditState } from '@/app/projects/audit-action'

type Props = {
    action: (state: RunAuditState, formData: FormData) => Promise<RunAuditState>
    defaultUrl?: string | null
}

const initialState: RunAuditState = {}

export function RunAuditForm({ action, defaultUrl }: Props) {
  const [state, formAction, isPending] = useActionState(action, initialState)
  const [source, setSource] = useState<'url' | 'html'>('url')
    const [url, setUrl] = useState(defaultUrl ?? '')
  const [html, setHtml] = useState('')

    const errorProps = state.error
    ? { 'aria-invalid': true, 'aria-describedby': 'audit-error' }
    : {}
  
  return (
    <form
      onSubmit={(event) => {
        // Submit it ourselves, so React doesn't reset the form afterwards
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        startTransition(() => formAction(formData))
      }}
    >
      <fieldset>
        <legend>What do you want to audit?</legend>
        <label>
          <input
            type="radio"
            name="source"
            value="url"
            checked={source === 'url'}
            onChange={() => setSource('url')}
          />
          A web page URL
        </label>
        <label>
          <input
            type="radio"
            name="source"
            value="html"
            checked={source === 'html'}
            onChange={() => setSource('html')}
          />
          Pasted HTML
        </label>
      </fieldset>

      {source === 'url' ? (
        <div>
          <label htmlFor="audit-url">Page URL</label>
          <input
            id="audit-url"
            name="url"
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            {...errorProps}
          />
        </div>
      ) : (
        <div>
          <label htmlFor="audit-html">HTML</label>
          <textarea
            id="audit-html"
            name="html"
            rows={10}
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            {...errorProps}
          />
        </div>
      )}

      {state.error && <p role="alert">{state.error}</p>}

      <button type="submit" disabled={isPending}>
        {isPending ? 'Running audit…' : 'Run audit'}
      </button>
    </form>
  )
}