import { GraphQLScalarType, Kind } from "graphql";
import { ObjectId } from "mongodb";

export default new GraphQLScalarType({
    name: 'ObjectId',
    description: 'Mongo ObjectId scalar type',
    parseValue(value: string) {
        return new ObjectId(value); // value from the client input variables
    },
    serialize(value: ObjectId) {
        return value.toHexString(); // value sent to the client
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.STRING) {
            return new ObjectId(ast.value); // value from the client query
        }
    return null
  },
})