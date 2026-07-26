import z, { email } from "zod";

export const userSignUpInput = z.object({
  fullName: z.string().describe('full name of the user'),
  email: z.email().describe('email address of the user'),
  password: z.string().describe('password of the user')
})
export type userSignUpInputType = z.infer<typeof userSignUpInput>


export const generateUserTokenPayload = z.object({
  id: z.string().describe('uuid of the user'),
})
export type GenerateUserTokenPayloadType = z.infer<typeof generateUserTokenPayload>

export const signInUserWithEmailAndPasswordInput = z.object({
  email: z.email().describe('email of the user'),
  password: z.string().describe('password of the user')
})

export type SignInUserWithEmailAndPasswordInputType = z.infer<typeof signInUserWithEmailAndPasswordInput>

