const mongoose = require('mongoose');
const {users} = require('../schema');
const { ApolloError} = require('apollo-errors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


async function addUser(parent,args, context, info){
    args.password = await bcrypt.hash(args.password, 5)
    const newUser = new users(args)
    await newUser.save()
    return newUser;
}




async function getAllUsers(parent,args, context){
    // const getAll = await users.find()
    // return getAll
    // verifyJwt(context)
    let count = await users.count();
    let aggregateQuery = [
        {$match: {
            status: 'active'
        }}
    ]
    if (args.page){
        aggregateQuery.push({
            $skip: (args.page - 1)*args.limit
        },
        {$limit: args.limit})
        
    }
    if(args.email){
        aggregateQuery.push({
            $match: {email: args.email}
        },{
            $sort: {email: 1}
        })
    }
    if(args.last_name){
        aggregateQuery.push({
            $match: {last_name: new RegExp(args.last_name, "i") }
        },{
            $sort: {last_name: 1}
        })
    }
    if(args.first_name){
        aggregateQuery.push({
            $match: {first_name:  new RegExp(args.first_name, "i") }
        },{
            $sort: {first_name: 1}
        })
    }
    
            if(aggregateQuery.length === 0){
                let result = await users.find()
                result.forEach((el)=>{
                    el.id = mongoose.Types.ObjectId(el.id)
                })
                return {
                    count: count,
                    // page: 0,
                    users: result
                    };
            }
            let result = await users.aggregate(aggregateQuery);
                result.forEach((el)=>{
                            el.id = mongoose.Types.ObjectId(el.id)
                        })
                return {
                count: count,
                page: args.page,
                users: result
                };
            
}
async function getOneUser(parent,args, context){
    if(args.id){
        const getUser = await users.findById(args.id)
        return getUser
    }else if(args.email){
        const getUser = await users.findOne({
            email: args.email
        })
        return getUser
    }else{
        return new ApolloError('FooError', {
            message: 'Put at least one parameter!'
          });
    }
}
async function updateUser(parent, args,contect){
    
    
      if(!args.password){
        throw new ApolloError('FooError', {
            message: 'Password is Needed!'
          });
    }
    args.password = await bcrypt.hash(args.password, 5)
    const updateUser = await users.findByIdAndUpdate(args.id, args,{
        new: true
    })
    if(updateUser){
        return updateUser
    }
    throw new ApolloError('FooError', {
        message: 'Wrong ID!'
      });
}
async function deleteUser(parent, args,context){
    const deleteUser = await users.findByIdAndUpdate(args.id,{
        status: 'deleted'
    }, {
        new : true
    })
    if(deleteUser){
        return {deleteUser, message: 'User Has been deleted!', data: deleteUser}
    }
    throw new ApolloError('FooError', {
        message: 'Wrong ID!'
      });
    
}
async function getToken(parent, args,context){
    // const email = await u
    const userCheck = await users.findOne({email: args.email})
    if(!userCheck){
        return new ApolloError('FooError', {
            message: 'Email Not Found !'
          });
    }
    if(userCheck.status === 'deleted'){
        throw new ApolloError('FooError', 
        {message: "Can't Login, User Status: Deleted!"})
    }
    const getPassword = await bcrypt.compare(args.password, userCheck.password )
    if(!getPassword){
        throw new ApolloError('FooError', 
        {message: "Wrong password!"})
    }
    const token = jwt.sign({ email: args.email, id: userCheck.id},'zetta',{expiresIn:'10h'});
    return{message: token}
}





const resolverUser  = {
    Query: {
        getAllUsers,
        getOneUser,
    },
    Mutation: {
        addUser,
        updateUser,
        deleteUser,
        getToken,
    }
}
module.exports = resolverUser;