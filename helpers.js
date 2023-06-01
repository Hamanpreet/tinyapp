//Helper function to check if user already registered with that email
const getUserByEmail = function(email, database) {
  let foundUser = null;
  for(let user_id in database) {
    if(database[user_id].email === email) {
      return foundUser = database[user_id];
    }
  }
};

module.exports = {getUserByEmail};