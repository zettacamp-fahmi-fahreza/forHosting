const mongoose = require('mongoose');
const {ingredients, recipes} = require('../schema');
const { ApolloError} = require('apollo-errors');

async function getAllIngredient(parent,args,context){
    const tick = Date.now()
    let count = await ingredients.count();
    let aggregateQuery = [
        
            // {$match: {
            //     status: 'active'
            // }}
        
    ]
    if (args.page){
        aggregateQuery.push({
            $skip: (args.page - 1)*args.limit
        },
        {$limit: args.limit})
    }
    if(args.name){
        aggregateQuery.push({
            $match: {name: new RegExp(args.name, "i")}
        },{
            $sort: {name: 1}
        })
    }
    if(args.stock && args.stock>0){
        aggregateQuery.push({
            $match: {stock: {$gte :args.stock}}
        },{
            $sort: {stock: 1}
        })
    }
    if(args.stock <= 0){
        throw new ApolloError('FooError', {
            message: 'Stock Cannot Be Zero!'
          });
    }
    if(aggregateQuery.length === 0){
        let result = await ingredients.find({
            // status: 'active'
        })
        result.forEach((el)=>{
            el.id = mongoose.Types.ObjectId(el._id)
        })
        // console.log(`total time: ${Date.now()- tick} ms`)
        return {
            count: count,
            // page: 0,
            data: result
            };
    }
    let result = await ingredients.aggregate(aggregateQuery);
                result.forEach((el)=>{
                            el.id = mongoose.Types.ObjectId(el._id)
                        })
                        console.log(`total time: ${Date.now()- tick} ms`)
                        count = result.length
                return {
                count: count,
                max_page: Math.ceil(count/args.limit),
                page: args.page,
                data: result
                };
}

// ERRORR ADD REGEX HERE TO AVOID DUPICATION
async function addIngredient(parent,args,context){
    const newIngredient = new ingredients(args)
    await newIngredient.save()
    return newIngredient;
}
async function getOneIngredient(parent,args,context){
    const getOneIngredient = await ingredients.findById(args.id)
    return getOneIngredient
}
async function updateIngredient(parent,args,context){
    console.log(typeof(args.id))
    if(args.stock < 0){
        throw new ApolloError('FooError', {
            message: 'Stock Cannot be less than 0!'
          });
    }
    const updateIngredient = await ingredients.findByIdAndUpdate(args.id, args,{
        new: true
    })
    if(updateIngredient){
        return updateIngredient
    }
    throw new ApolloError('FooError', {
        message: 'Wrong ID!'
      });
}
// async function deleteIngredient(parent,args,context) {
//     const allRecipes = await recipes.find()
//     for(let recipe of allRecipes){
//         for(let ingredient of recipe.ingredients){
//             let ingredient_id = ingredient.ingredient_id.toString()
//             if(ingredient_id === args.id){
//                 throw new ApolloError('FooError', {
//                     message: 'Cannot delete this ingredient!'
//                   });
//         }
//     }
//     }
//     const deleteIngredient = await ingredients.findByIdAndUpdate(args.id,{
//         status: 'deleted',
//         stock: 0
//     }, {
//         new : true
//     })
//     if(deleteIngredient){
//         return {deleteIngredient, message: 'Ingredient Has been deleted!', data: deleteIngredient}
//     }
//     throw new ApolloError('FooError', {
//         message: 'Wrong ID!'
//       });
// 
// }

async function findIngredientInRecipe(id) {
    const checkRecipe = await recipes.find({ ingredients: { $elemMatch: { ingredient_id: mongoose.Types.ObjectId(id) } } })
    if (!checkRecipe.length) return true
    return false;
}
async function deleteIngredient(parent,args,context) {
    console.log(args.id)
    const checkIngredient = await findIngredientInRecipe(args.id)
    if (!checkIngredient){
        throw new ApolloError('FooError', {
            message: 'Ingredient is used in recipe, Cannot Delete!'
          });
    }
    const deleteIngredient = await ingredients.findByIdAndUpdate(args.id,{
        status: 'deleted',
        stock: 0
    }, {
        new : true
    })
    if(deleteIngredient){
        return {deleteIngredient, message: 'Ingredient Has been deleted!', data: deleteIngredient}
    }
    throw new ApolloError('FooError', {
        message: 'Wrong ID!'
      });
}



const resolverIngredient = {
    Query: {
        getOneIngredient,
        getAllIngredient,
    },
    Mutation: {
        addIngredient,
        updateIngredient,
        deleteIngredient,
    }
}
module.exports = resolverIngredient