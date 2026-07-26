import { db, eq, usersTable } from "@repo/database";
import { generateUserTokenPayload, GenerateUserTokenPayloadType, signInUserWithEmailAndPasswordInput, SignInUserWithEmailAndPasswordInputType, userSignUpInput, userSignUpInputType } from "./model";
import { createHmac, randomBytes } from "crypto";
import * as JWT from "jsonwebtoken"
import { env } from '../env'

class UserService {

  private async getUserByEmail(email: string) {
    const result = await db.select().from(usersTable).where(eq(usersTable.email, email))
    if (!result || result.length === 0) return null
    return result[0]//cause array return hoga
  }

  private async generateHash(salt: string, password: string) {
    return createHmac('sha256', salt).update(password).digest('hex')
  }

  private async generateUserToken(payload: GenerateUserTokenPayloadType) {
    const { id } = await generateUserTokenPayload.parseAsync(payload)
    const token = JWT.sign({ id }, env.JWT_SECRET)
    return { token }

  }


  private async signUpUser(payload: userSignUpInputType) {
    const { fullName, email, password } = await userSignUpInput.parseAsync(payload)
    if (this.getUserByEmail != null) throw new Error(`user with email ${email} already exists`)

    //insert the data but hash the password
    const salt = randomBytes(16).toString('hex')
    const hash = await this.generateHash(salt, password)

    const insertresult = await db.insert(usersTable)
      .values({ email, fullName, password: hash, salt })
      .returning({
        id: usersTable.id
      })
    if (!insertresult || insertresult.length === 0 || !insertresult[0]?.id) throw new Error('something went wrong')

    const userId = insertresult[0].id
    const { token } = await this.generateUserToken({ id: userId })

    return {
      id: userId,
      token
    }

  }

  public async signInUserWithEmailAndPassword(payload: SignInUserWithEmailAndPasswordInputType) {
    const { email, password } = await signInUserWithEmailAndPasswordInput.parseAsync(payload)

    const existingUser = await this.getUserByEmail(email)
    if (!existingUser) throw new Error(`User with email ${email} does not exists`)

    if (!existingUser.password || !existingUser.salt) throw new Error(`Invalid authentication method`)

    const hash = await this.generateHash(existingUser.salt, password)

    if (hash !== existingUser.password) throw new Error(`Invalid email address or password`)

    const { token } = await this.generateUserToken({ id: existingUser.id })

    return {
      id: existingUser.id,
      token
    }

  }


}
export default UserService