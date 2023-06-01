const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "abc": {
    id: "abc", 
    email: "a@a.com", 
    password: "123"
  },
  "def": {
    id: "def", 
    email: "b@b.com", 
    password: "456"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("a@a.com", testUsers)
    const expectedUserID = "abc";
    assert.equal(user.id, expectedUserID);
  });

  it('should undefined when an email is not in users database', function() {
    const user = getUserByEmail("k@k.com", testUsers)
    const expectedUserID = undefined;
    assert.deepEqual(user, expectedUserID);
  });
});