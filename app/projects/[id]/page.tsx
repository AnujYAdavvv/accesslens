import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import requireUser from "@/lib/session"
import { deleteProject } from "@/app/projects/actions"

type ProjectPageProps = {
    params: Promise<{
        id: string
    }>
}

export default async function ProjectPage({
    params, 
}: ProjectPageProps) {
    const user = await requireUser()
    const { id } = await params
    const project = await prisma.project.findFirst({
        where: {
            id,
            userId: user.id
        }
    })

    if (!project) {
        notFound()
    }
    const deleteWithId = deleteProject.bind(null, project.id)

      return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">
        {project.name}
      </h1>

      {project.url && (
        <p className="mt-2">
          URL: {project.url}
        </p>
      )}

      <form action={deleteWithId} className="mt-4">
        <button
          type="submit"
          className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          Delete Project
        </button>
      </form>

      <Link
        href="/dashboard"
        className="mt-4 inline-block"
      >
        ← Back to dashboard
      </Link>
    </main>

    )
} 
    