import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function requireUser() {
    const session = await auth.api.getSession({ headers: await headers()})

    if(!session) {
        redirect('/')
    }

    return (
        session.user
      )
}