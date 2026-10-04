import { prisma } from '@/lib/prisma'
import { fetchHtml } from '@/lib/safe-fetch'
import { runAxe, violationsToIssues } from '@/lib/axe'
import { AuditError } from '@/lib/errors'
import type { RunAuditInput } from '@/lib/validations'

// Runs an audit that already exists in the database as RUNNING,
// and always leaves it as COMPLETED or FAILED

export async function executeAudit(auditId: string, input: RunAuditInput) {
    try{
        const html = input.source === 'url' ? await fetchHtml(input.url) : input.html

        const issues = violationsToIssues(await runAxe(html))

        await prisma.$transaction([
            prisma.issue.createMany({
                data: issues.map((issue) => ({
                    ...issue,
                    auditId,
                }))
            }),
            prisma.audit.update({
                where: {id: auditId},
                data: {status: 'COMPLETED', issueCount: issues.length, completedAt: new Date()},
            }),
        ])
    } catch (error) {
    console.error(`Audit ${auditId} failed:`, error)
    await prisma.audit.update({
        where: {id: auditId},
        data: {
            status: 'FAILED',
            error: error instanceof AuditError ? error.message : 'An unexpected error occurred.',
            completedAt: new Date(),
        },
    })
  }
}