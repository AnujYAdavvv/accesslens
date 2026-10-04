import { fetchHtml } from '../lib/safe-fetch'

const urls = [
  'https://example.com',
  'http://localhost:3000',
  'http://127.0.0.1',
  'http://169.254.169.254/latest/meta-data',
  'http://10.0.0.1',
  'file:///etc/passwd',
]

async function main() {
  for (const url of urls) {
    try {
      const html = await fetchHtml(url)
      console.log(`OK       ${url}  (${html.length} characters)`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.log(`BLOCKED  ${url}  ${message}`)
    }
  }
}

main()