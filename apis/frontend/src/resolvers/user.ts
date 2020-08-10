import { Resolver, Query, Arg } from 'type-graphql'
import { User, UserModel } from '../entities/User'

@Resolver()
export default class UserResolver {
    @Query(() => User)
    async user( @Arg('email') email: string ): Promise<User> {
        return (await UserModel.findOne({ email }))!
    }
}