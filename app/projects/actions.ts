'use server'

import requireUser from "@/lib/session"
import { projectSchema } from "@/lib/validations"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export type CreateProjectState = {
    errors?: {
        name?: string[]
        url?: string[]
    }
}

export async function createProject(
    prevState: CreateProjectState,
    formData: FormData
){
    const user = await requireUser()
    const data = {
        name: formData.get("name"),
        url: formData.get("url")
    }
    const result = projectSchema.safeParse(data)
    
    if(!result.success){
        return {
            errors: result.error.flatten().fieldErrors
        }
    }
    const project = await prisma.project.create({
        data: {
            ...result.data,
            userId: user.id
        }

    })
    redirect(`/projects/${project.id}`)
}

export async function deleteProject(projectId: string){
    const user = await requireUser()
    await prisma.project.deleteMany({
        where: {
            id: projectId,
            userId: user.id
        }
    })
    redirect("/dashboard")
}