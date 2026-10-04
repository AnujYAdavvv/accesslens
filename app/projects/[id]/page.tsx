import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import requireUser from "@/lib/session"
import { deleteProject } from "@/app/projects/actions"
import { runAudit } from '@/app/projects/audit-action'
import { RunAuditForm } from '@/components/RunAuditForm'
import type { AuditStatus } from '@/app/generated/prisma/enums'


const STATUS_LABELS: Record<AuditStatus, string> = {
  PENDING: 'Waiting',
  RUNNING: 'Running',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
}

type ProjectPageProps = {
    params: Promise<{
        id: string
    }>
}

export default async function ProjectPage({
    params, 
}: ProjectPageProps) {
    const user = await requireUser()
    const { id } = await params
    const project = await prisma.project.findFirst({
        where: {
            id,
            userId: user.id
        },
        include: {
        audits: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: {
            id: true,
            source: true,
            sourceUrl: true,
            status: true,
            issueCount: true,
            createdAt: true,
          },
        },
      },
    })

    if (!project) {
        notFound()
    }
    const deleteWithId = deleteProject.bind(null, project.id)

      return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">
        {project.name}
      </h1>

      {project.url && (
        <p className="mt-2">
          URL: {project.url}
        </p>
      )}

      <form action={deleteWithId} className="mt-4">
        <button
          type="submit"
          className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          Delete Project
        </button>
      </form>

      <Link
        href="/dashboard"
        className="mt-4 inline-block"
      >
        ← Back to dashboard
      </Link>
      <h2>Run an audit</h2>
      <RunAuditForm action={runAudit.bind(null, project.id)} />
            <h2>Audits</h2>
      {project.audits.length === 0 ? (
        <p>No audits yet. Run your first one above.</p>
      ) : (
        <ul>
          {project.audits.map((audit) => (
            <li key={audit.id}>
              <Link href={`/projects/${project.id}/audits/${audit.id}`}>
                {audit.createdAt.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </Link>{' '}
              · {audit.source === 'URL' ? audit.sourceUrl : 'Pasted HTML'} ·{' '}
              {STATUS_LABELS[audit.status]}
              {audit.status === 'COMPLETED' && ` · ${audit.issueCount} issues`}
            </li>
          ))}
        </ul>
      )}
    </main>

    )
} 
    