const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {User} = require('./../models/User');
const {users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);

describe('GET /api/users/:id', () => {
    it('should return user document', (done) => {
        let hexId = users[0]._id.toHexString();

        request(app)
            .get(`/api/users/${hexId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.user.email).toBe(users[0].email);
            })
            .end(done);
    });

    it('should return 404 if user not found', (done) => {
        request(app)
            .get(`/api/users/${new ObjectID().toHexString()}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 for non ObjectId', (done) => {
        request(app)
            .get(`/api/users/123abc`)
            .expect(404)
            .end(done);
    });
});

describe('GET /api/users', () => {
    it('should get all users', (done) => {
        request(app)
            .get('/api/users')
            .expect(200)
            .expect((res) => {
                expect(res.body.users.length).toBe(2);
            })
            .end(done);
    });

    it('should get first user based on a search string(by first_name)', (done) => {
        const searchString = 'do';

        request(app)
            .get(`/api/users?search=${searchString}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.users.length).toBe(1);
                expect(res.body.users[0].email).toBe(users[0].email);
            })
            .end(done);
    });

    it('should get second user based on a search string(by email)', (done) => {
        const searchString = 'e@e';

        request(app)
            .get(`/api/users?search=${searchString}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.users.length).toBe(1);
                expect(res.body.users[0].email).toBe(users[1].email);
            })
            .end(done);
    });

    it('should get both user based on a search string(by email)', (done) => {
        const searchString = 'example';

        request(app)
            .get(`/api/users?search=${searchString}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.users.length).toBe(2);
            })
            .end(done);
    });
});

describe('POST /api/users', () => {
    it('should should create a user', (done) => {
        const newUser = {
            email: 'example@example.com',
            password: '123mAnb123',
            first_name: 'another',
            last_name: 'user',
            city: 'Kiev'
        };

        request(app)
            .post('/api/users')
            .send(newUser)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBeTruthy();
                expect(res.body.email).toBe(newUser.email);
            })
            .end((error) => {
                if (error) {
                    return done(error);
                }

                User.findOne({email: newUser.email}).then((user) => {
                    expect(user).toBeTruthy();
                    expect(user.password).not.toBe(newUser.password);
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should return a validation errors if request invalid', (done) => {
        const newUser = {
            email: 'exampleample.com',
            password: '123m',
            first_name: '',
            last_name: '',
            city: 'Kiev'
        };

        request(app)
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect((res) => {
                expect(res.body.errors.email).toBeTruthy();
                expect(res.body.errors.password).toBeTruthy();
                expect(res.body.errors.first_name).toBeTruthy();
                expect(res.body.errors.last_name).toBeTruthy();
            })
            .end(done);
    });

    it('should not create user if email in use', (done) => {
        const newUser = {
            email: users[0].email,
            password: '123mAnb123',
            first_name: 'another',
            last_name: 'user',
            city: 'Kiev'
        };

        request(app)
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .end(done);
    });
});

describe('PATCH /api/users/:id', () => {
    it('should update the user but not password', (done) => {
        let hexId = users[0]._id.toHexString();
        const update = {
            first_name: 'new Name',
            city: 'city',
            password: '123123Aqffwfqw'
        };

        User.findById(hexId).then((user) => {
            const oldPassword = user.password;

            request(app)
                .patch(`/api/users/${hexId}`)
                .send(update)
                .expect(200)
                .expect((res) => {
                    expect(res.body.user.first_name).toBe(update.first_name);
                    expect(res.body.user.city).toBe(update.city);
                })
                .end((error) => {
                    if (error) {
                        return done(error);
                    }

                    User.findById(hexId).then((user) => {
                        expect(user.password).toBe(oldPassword);
                        done();
                    }).catch((e) => done(e));
                });
        });
    });

    it('should return a validation errors if request invalid', (done) => {
        let hexId = users[0]._id.toHexString();
        const update = {
            email: 'exampleample.com',
            password: '123mAwedjgweg',
            first_name: '',
            last_name: '',
            city: 'Kiev'
        };

        request(app)
            .patch(`/api/users/${hexId}`)
            .send(update)
            .expect(400)
            .expect((res) => {
                expect(res.body.errors.email).toBeTruthy();
                expect(res.body.errors.first_name).toBeTruthy();
                expect(res.body.errors.last_name).toBeTruthy();
            })
            .end(done);
    });
});

describe('PATCH /api/users/:id/password', () => {
    it('should update only user password and hash it', (done) => {
        let hexId = users[0]._id.toHexString();
        const update = {
            first_name: 'new Name',
            city: 'city',
            password: '123123Aqffwfqw'
        };

        User.findById(hexId).then((user) => {
            const oldPassword = user.password;

            request(app)
                .patch(`/api/users/${hexId}/password`)
                .send(update)
                .expect(200)
                .expect((res) => {
                    expect(res.body.user.first_name).not.toBe(update.first_name);
                    expect(res.body.user.city).not.toBe(update.city);
                })
                .end((error) => {
                    if (error) {
                        return done(error);
                    }

                    User.findById(hexId).then((user) => {
                        expect(user.password).not.toBe(update.password);
                        expect(user.password).not.toBe(oldPassword);
                        done();
                    }).catch((e) => done(e));
                });
        });
    });

    it('should return a validation errors if password is in invalid format', (done) => {
        let hexId = users[0]._id.toHexString();
        const update = {
            password: '123m',
        };

        request(app)
            .patch(`/api/users/${hexId}/password`)
            .send(update)
            .expect(400)
            .expect((res) => {
                expect(res.body.errors.password).toBeTruthy();
            })
            .end(done);
    });
});

describe('DELETE /users/:id', () => {
    it('should remove a user', (done) => {
        let hexId = users[1]._id.toHexString();

        request(app)
            .delete(`/api/users/${hexId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.user._id).toBe(hexId);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                User.findById(hexId).then((user) => {
                    expect(user).toBeFalsy();
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should return 404 if user not found', (done) => {
        let hexId = new ObjectID().toHexString();

        request(app)
            .delete(`/api/user/${hexId}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 for non ObjectId', (done) => {
        request(app)
            .delete(`/api/user/123abc`)
            .expect(404)
            .end(done);
    });
});



