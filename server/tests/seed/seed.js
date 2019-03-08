const {ObjectID} = require('mongodb');

const {User} = require('./../../models/User');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [{
    _id: userOneId,
    email: 'jon@example.com',
    password: 'userOnePass',
    first_name: 'Jon',
    last_name: 'Doe'
}, {
    _id: userTwoId,
    email: 'jane@example.com',
    password: 'userTwoPass',
    first_name: 'Jane',
    last_name: 'Eod',
    city: 'Jmerenka'
}];

const populateUsers = (done) => {
    User.deleteMany({}).then(() => {
        let userOne = new User(users[0]).save();
        let userTwo = new User(users[1]).save();

        return Promise.all([userOne, userTwo]);
    }).then(() => done());
};

module.exports = {users, populateUsers};
