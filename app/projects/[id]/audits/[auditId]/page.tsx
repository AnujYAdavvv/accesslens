import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import requireUser from '@/lib/session'
import type { Issue } from '@/app/generated/prisma/client'
import type { Impact } from '@/app/generated/prisma/enums'

const IMPACT_LABELS: Record<Impact, string> = {
  CRITICAL: 'Critical',
  SERIOUS: 'Serious',
  MODERATE: 'Moderate',
  MINOR: 'Minor',
}

function groupByImpact(issues: Issue[]): Map<Impact, Issue[]> {
  const groups = new Map<Impact, Issue[]>()
  for (const issue of issues) {
    const group = groups.get(issue.impact)
    if (group) {
      group.push(issue)
    } else {
      groups.set(issue.impact, [issue])
    }
  }
  return groups

}


export default async function AuditPage({
  params,
}: {
  params: Promise<{ id: string; auditId: string }>
}) {
  const { id, auditId } = await params
  const user = await requireUser()

  // Only load the audit if its project belongs to this user
  const audit = await prisma.audit.findFirst({
    where: {
      id: auditId,
      projectId: id,
      project: { userId: user.id },
    },
    include: {
      project: { select: { name: true } },
      issues: { orderBy: [{ impact: 'desc' }, { ruleId: 'asc' }] },
    },
  })
  if (!audit) notFound()
  const groups = groupByImpact(audit.issues)


return (
    <main>
      <p>
        <Link href={`/projects/${id}`}>← Back to {audit.project.name}</Link>
      </p>
      <h1>Audit results</h1>
      <p>
        {audit.source === 'URL' ? `Audited ${audit.sourceUrl}` : 'Audited pasted HTML'} on{' '}
        {audit.createdAt.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
      </p>

      {audit.status === 'FAILED' && <p role="alert">The audit failed: {audit.error}</p>}

      {(audit.status === 'PENDING' || audit.status === 'RUNNING') && (
        <p>This audit hasn&apos;t finished.</p>
      )}

      {audit.status === 'COMPLETED' && audit.issueCount === 0 && (
        <p>
          No issues found. Automated checks catch only some accessibility problems, so manual
          testing is still worth doing.
        </p>
      )}

      
        {audit.status === 'COMPLETED' && audit.issueCount > 0 && (
        <>
          <p>{audit.issueCount} issues found.</p>
          {[...groups].map(([impact, issues]) => (
            <section key={impact}>
              {<h2>{IMPACT_LABELS[impact]} ({issues.length})</h2>}
              <ul>
                {issues.map((issue) => (
                  <li key={issue.id}>
                    <h3>{issue.help}</h3>
                    <p>
                      Rule: <code>{issue.ruleId}</code>
                    </p>
                    <p>
                        Element: <code>{ issue.target }</code>
                    </p>
                    <pre>
                      <code>{ issue.html }</code>
                    </pre>
                    <a href={issue.helpUrl} target="_blank" rel="noopener noreferrer">
                      Learn more about {issue.ruleId}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </>
      )}
    </main>
  )
}