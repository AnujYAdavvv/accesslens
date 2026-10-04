import { prisma } from '../lib/prisma'
import { executeAudit } from '../lib/audit'

// ✏️ Paste the id of one of YOUR projects here
const PROJECT_ID = 'cmuo2s2lj0000n0qhrlzg28ri'

// A small page with four deliberate accessibility problems
const html = `
<!DOCTYPE html>
<html>
  <head><title>Test page</title></head>
  <body>
    <main>
      <h1>Welcome</h1>
      <img src="logo.png">
      <form>
        <input type="text" name="email">
        <button></button>
      </form>
    </main>
  </body>
</html>
`

async function main() {
  const audit = await prisma.audit.create({
    data: { projectId: PROJECT_ID, source: 'HTML', status: 'RUNNING' },
  })
  console.log('Created audit', audit.id, audit.status)

  await executeAudit(audit.id, { source: 'url', url: 'http://localhost:3000' })

  const saved = await prisma.audit.findUnique({
    where: { id: audit.id },
    include: { issues: true },
  })
  console.log('Status:', saved?.status)
  console.log('issueCount:', saved?.issueCount)
  console.log('Issue rows:', saved?.issues.length)
  console.log('Error:', saved?.error)

  await prisma.$disconnect()
}

main()