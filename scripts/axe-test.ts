import { runAxe, violationsToIssues } from '../lib/axe'

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
  const violations = await runAxe(html)
  const issues = violationsToIssues(violations)

  console.log(`${violations.length} rules failed, ${issues.length} issues to save`)
  console.table(issues, ['ruleId', 'impact', 'target'])
  console.log(issues[0])
}

main()