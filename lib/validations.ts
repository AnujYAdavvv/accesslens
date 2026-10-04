import { z } from 'zod'


export const projectSchema = z.object({
    name: z.string().trim().min(1).max(100),
    url: z.preprocess((val) => {
        if ((typeof val === "string" && val.trim() === '') || val === null) return undefined
        if(typeof val === "string") return val.trim()
        return val
    }, z.url({protocol: /^https?$/}).optional())
})

export type ProjectInput = z.infer<typeof projectSchema>

export const runAuditSchema = z.discriminatedUnion('source', [
    z.object({
        source: z.literal('url'),
        url: z.url({protocol: /^https?$/, error: 'Enter a valid URL'}),
    }),
    z.object({
        source: z.literal('HTML'),
        html: z.string().trim().min(1, 'Enter some HTML to audit').max(500000, 'The HTML is too long to audit'),
    })
])

export type RunAuditInput = z.infer<typeof runAuditSchema>