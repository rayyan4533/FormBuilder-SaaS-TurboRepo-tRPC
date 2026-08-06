import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { signInUserWithEmailAndPasswordInputModel, signInUserWithEmailAndPasswordOutputModel, signUpUserInputModel, signUpUserOutputModel } from "./model";
import { input } from "@tensorflow/tfjs";
import { userService } from "../../services";
import { setAuthenticationCookie } from "../../utils/cookie";
import { signInUserWithEmailAndPasswordInput } from "@repo/services/user/model";




const TAGS = ["/authentication"]
const getPath = generatePath("/authentication")

export const authRouter = router({
    signUpUser: publicProcedure
        .meta({
            openapi: {
                method: 'POST',
                path: getPath('signUpUser'),
                tags: TAGS
            }
        })
        .input(signUpUserInputModel)
        .output(signUpUserOutputModel)
        .mutation(async ({ input, ctx }) => {

            const { fullName, email, password } = input

            const { id, token } = await userService.signUpUser({
                fullName, email, password
            })

            setAuthenticationCookie(ctx, token)

            return {
                id
            }

        }),

    signInUserWithEmailAndPassword: publicProcedure.meta({
        openapi: {
            method: "POST",
            path: getPath('/SignInUserWithEmailAndPassword'),
            tags: TAGS
        }
    })
        .input(signInUserWithEmailAndPasswordInputModel)
        .output(signInUserWithEmailAndPasswordOutputModel)
        .mutation(async ({ input, ctx }) => {
            const { email, password } = input

            const { id, token } = await userService.signInUserWithEmailAndPassword({
                email, password
            })
            setAuthenticationCookie(ctx, token)

            return {
                id
            }
        }),

})