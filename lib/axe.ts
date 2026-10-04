import { JSDOM } from 'jsdom'
import axe from 'axe-core'
import type { Impact } from '@/app/generated/prisma/enums'



type AxeWindow = Window & { axe: typeof axe}
const IMPACTS: Record<NonNullable<axe.ImpactValue>, Impact> = {
    minor: 'MINOR',
    moderate: 'MODERATE',
    serious: 'SERIOUS',
    critical: 'CRITICAL',
}

export type NewIssue = {
    ruleId: string
    impact: Impact
    description: string
    help: string
    helpUrl: string
    target: string
    html: string
    wcagTags: string[]
}

// One Issue per failing element (node), not per rule
export function violationsToIssues(violations: axe.Result[]): NewIssue[] {
  const issues: NewIssue[] = []

  for (const violation of violations) {
    // axe can leave impact empty; treat that as the lowest level
    const impact = violation.impact ? IMPACTS[violation.impact] : 'MINOR'
    const wcagTags =  violation.tags.filter((tag) => tag.startsWith('wcag'))// ✏️ only the tags that start with 'wcag'

    for (const node of violation.nodes) {
      issues.push({
        ruleId: violation.id,
        impact,
        description: violation.description,
        help: violation.help,
        helpUrl: violation.helpUrl,
        target: node.target.join(' '),
        html: node.html,
        wcagTags,

      })
    }
  }

  return issues
}

// Runs axe-core on an HTML string and returns the failed rules

export async function runAxe(html: string): Promise<axe.Result[]> {
    const dom = new JSDOM(html, { runScripts: 'outside-only' })
    try{
        dom.window.eval(axe.source)
        const window = dom.window as unknown as AxeWindow
    const results = await window.axe.run(window.document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
      resultTypes: ['violations'],
    })
    return results.violations
  } finally {
    dom.window.close()
    }
}