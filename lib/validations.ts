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