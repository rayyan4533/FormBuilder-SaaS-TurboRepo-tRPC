import z from "zod";



export const createFormInput = z.object({
    title: z.string().max(55).describe('Title of the form'),
    description: z.string().max(300).optional().describe('Description of the form'),
    createdBy: z.string().uuid().describe('UUID of the user creating the form'),
})

export type CreateFormInputType = z.infer<typeof createFormInput>


export const listFormsByUserIdInput = z.object({
    userId: z.string().uuid().describe('UUID of the user'),
})

export type listFormsByUserIdInputType = z.infer<typeof listFormsByUserIdInput>

export const getFormByIdInput = z.object({
    formId: z.string().uuid().describe('UUID of the form'),
})

export type GetFormByIdInputType = z.infer<typeof getFormByIdInput>

export const updateFormInput = z.object({
    formId: z.string().uuid().describe('UUID of the form to update'),
    title: z.string().max(55).optional().describe('Updated title'),
    description: z.string().max(300).optional().nullable().describe('Updated description'),
})

export type UpdateFormInputType = z.infer<typeof updateFormInput>
