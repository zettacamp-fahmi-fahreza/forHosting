const DataLoader = require('dataloader');
const {users,ingredients,recipes,transactions} = require('../schema');

//CREATE LOADER FOR USER
const loadUser = async function(checkId){
    let userList = await users.find({
        _id:{
            $in: checkId
        }
    })
    let userMap = {}
    userList.forEach((user) => userMap[user._id] = user)
    return checkId.map(id => userMap[id])
}
//CREATE LOADER FOR RECIPES

const userLoader = new DataLoader(loadUser)

module.exports = userLoader;

