
import  requireUser  from '@/lib/session'
import { createProject } from '../projects/actions'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import CreateProjectForm from '@/components/CreateProjectForm'


export default async function DashboardPage() {
    const user = await requireUser()
    const projects = await prisma.project.findMany({
        where: {
            userId: user.id
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
    

    return (
        <main className="p-8">
          <h1 className="text-2xl font-bold">My account</h1>
          <p className="mt-2">Name: {user.name}</p>
          <p>Email: {user.email}</p>
          <h2 className='mt-4 text-xl font-bold'>My Projects</h2>
          {projects.length === 0 ? (
            <p className="mt-2">You have no projects yet.</p>
          ) : (
            <ul className="mt-2">
              {projects.map((project) => (
                <li key={project.id} className="mt-1">
                  <Link href={`/projects/${project.id}`} className="text-blue-500 hover:underline">
                  {project.name}
                  </Link>  
                  </li>
              ))}
            </ul>
          )}

          < CreateProjectForm />
          
        </main>
      )
}