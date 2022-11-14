
const { ApolloServer,gql } = require('apollo-server');

const transactionTypeDefs = gql`#graphql
# scalar Date
type Menu {
        recipe_id: Recipe
        amount: Int
        note: String
    }
input transactionInput {
    user_id: ID
    menu: [menuInput]
}
input menuInput{
        recipe_id: ID
        amount: Int
        note: String
    }
type Transaction {
        id:ID
        user_id: User
        menu: [Menu]
        order_status: enumStatus
        order_date: String
        status: Enum
    }
type transactionPage{
    count: Int
    page: Int
    data: [Transaction]
    }
enum enumStatus {
        success
        failed
    }

type Query {
    getOneTransaction(id:ID!) : Transaction!
    getAllTransactions(page: Int limit: Int last_name_user: String recipe_name:String order_status: String order_date: String ) : transactionPage!
}
type Mutation {
    createTransaction( input: [menuInput]) : Transaction
    deleteTransaction(id:ID!) : Transaction!
}
`


module.exports = {transactionTypeDefs}