'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import requireUser from '@/lib/session'
import { runAuditSchema } from '@/lib/validations'
import { executeAudit } from '@/lib/audit'

export type RunAuditState = { error?: string }

export async function runAudit(
  projectId: string,
  _prevState: RunAuditState,
  formData: FormData,
): Promise<RunAuditState> {
  const user = await requireUser()

  // Only the owner can audit a project
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: user.id },
    select: { id: true },
  })
  if (!project) {
    return { error: 'Project not found.' }
  }

  const parsed = runAuditSchema.safeParse({
    source: formData.get('source'),
    url: formData.get('url'),
    html: formData.get('html'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' }
  }
  const input = parsed.data

  const audit = await prisma.audit.create({
    data: {
      projectId: project.id,
      source: input.source === 'url' ? 'URL' : 'HTML',
      sourceUrl: input.source === 'url' ? input.url : null,
      status: 'RUNNING',
    },
  })

  await executeAudit(audit.id, input)

  revalidatePath(`/projects/${project.id}`)
  redirect(`/projects/${project.id}/audits/${audit.id}`)
}