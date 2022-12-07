const DataLoader = require('dataloader');
const log = require('loglevel');
const {users,ingredients,recipes,transactions} = require('../schema');

const loadRecipe = async function(checkId){
    let recipeList = await recipes.find({
        _id: {
            $in: checkId
        }
    })
    let recipeMap = {}
    recipeList.forEach((recipe) => recipeMap[recipe._id] = recipe)
    return checkId.map(id => recipeMap[id])
}
const recipeLoader = new DataLoader(loadRecipe)

module.exports = recipeLoader