/***
 * generate random shortURl(6 digits) for the longURL provided.
 */


const generateRandomString = function() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
};

/***
 * @param {string} id: user_id cookie(generated by randomID)
 * Function returns the urls owned by specific user in a result object
 */

const urlsForUser = function(id, urlDatabase) {
  const result = {};
  for (const key in urlDatabase) {
   if (urlDatabase[key].userID === id) {
      result[key] = urlDatabase[key].longURL;
    }
  }
  return result;
};

//Helper function to check if user already registered with that email
const getUserByEmail = function(email, database) {
  let foundUser = null;
  for (let user_id in database) {
    if (database[user_id].email === email) {
      return foundUser = database[user_id];
    }
  }
};

//exporting these helper functions to express_server
module.exports = {getUserByEmail,generateRandomString, urlsForUser};