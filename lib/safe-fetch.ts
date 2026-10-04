import { lookup } from 'node:dns/promises'
import ipaddr from 'ipaddr.js'

const MAX_REDIRECTS = 3
const TIMEOUT_MS = 10_000
const MAX_BYTES = 2 * 1024 * 1024 // 2 MB

async function assertSafeUrl(url: string):
Promise<URL> {
    let parsed: URL
    try {
        parsed = new URL(url)
    } catch {
        throw new Error("That doesn't look like a valid URL.")
    }
    if(parsed.protocol !== 'http:' && parsed.protocol !== 'https:'){
        throw new Error("Only HTTP and HTTPS protocols are allowed.")
    }
    //IPV6 Hostnames are enclosed in brackets, so we need to remove them before checking if it's an IP address
    const hostname = parsed.hostname.replace(/^\[|\]$/g, '')
    
    let addresses: { address: string }[]
    try {
        addresses = await lookup(hostname, { all: true})
    } catch {
        throw new Error("We couldn't find the address.")
    }
    for (const { address } of addresses) {
        if (ipaddr.process(address).range() !== 'unicast') {
            throw new Error("this address isn't allowed.")
        }
    }
    return parsed
}

async function readBodyWithLimit(res: Response):
Promise<string> {
    const declaredLength = 
    Number(res.headers.get('content-length'))
    if(declaredLength > MAX_BYTES){
        throw new Error("The response is too large.")
    }
    if(!res.body){
        throw new Error("The page was empty.")
    }

    const reader = res.body.getReader()
    const chunks: Uint8Array[] = []
    let total = 0

    while(true){
        const { done, value } = await reader.read()
        if(done) break

         total += value.length
    if (total > MAX_BYTES) {
      await reader.cancel()
      throw new Error('The page is too large to audit.')
    }
    chunks.push(value)
  }

  return Buffer.concat(chunks).toString('utf8')
}


export async function fetchHtml(url: string): Promise<string> {
  let currentUrl = url

  // The first request plus up to MAX_REDIRECTS redirects
  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    const safeUrl = await assertSafeUrl(currentUrl)

    let res: Response
    try {
      res = await fetch(safeUrl, {
        redirect: 'manual',
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { 'user-agent': 'AccessLens accessibility checker' },
      })
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new Error('The website took too long to respond.')
      }
      throw new Error("We couldn't connect to that website.")
    }

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location')
      if (!location) {
        throw new Error('The website sent a broken redirect.')
      }
      // Resolve relative redirects like "/home" against the current URL
      currentUrl = new URL(location, safeUrl).toString()
      continue
    }

    if (!res.ok) {
      throw new Error(`The page returned an error (${res.status}).`)
    }

    const contentType = res.headers.get('content-type') ?? ''
    if (!contentType.includes('text/html')) {
      throw new Error("That URL isn't an HTML page.")
    }

    return readBodyWithLimit(res)
  }

  throw new Error('Too many redirects.')
}