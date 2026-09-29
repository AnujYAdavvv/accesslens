'use client'

import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

export default function AuthButton() {
    const router = useRouter()
    const { data: session, isPending } = authClient.useSession()

    const handleSignOut = async() => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push('/')
                    router.refresh()
                }
            }
        })
    }


    if(isPending) {
        return <span className="text-sm">...</span>
    }

    if(!session){
        return (
            <button 
            onClick = {() => authClient.signIn.social({ provider: 'github', callbackURL: '/dashboard' })}
            className="border rounded px-3 py-1 text-sm"
            >
                Sign in with Github
            </button>
        )
    }

    return (
    <div className="flex items-center gap-3 text-sm">
      {session.user.image && (
        <img src={session.user.image} alt="" className="w-6 h-6 rounded-full" />
      )}
      <span>{session.user.name}</span>
      <button onClick={handleSignOut} className="border rounded px-3 py-1">
        Sign out
      </button>
    </div>
  )
}