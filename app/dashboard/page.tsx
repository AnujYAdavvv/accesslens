import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function DashboardPage() {
    const session = await auth.api.getSession({ headers: await headers()})

    if(!session) {
        redirect('/')
    }

    return (
        <main className="p-8">
          <h1 className="text-2xl font-bold">My account</h1>
          <p className="mt-2">Name: {session.user.name}</p>
          <p>Email: {session.user.email}</p>
          <p>User ID: {session.user.id}</p>
        </main>
      )
}