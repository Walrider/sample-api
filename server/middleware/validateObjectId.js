const {ObjectID} = require('mongodb');

const validateObjectId = (req, res, next) => {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send('Supplied id is invalid');
    }

    next();
};

module.exports = {validateObjectId};
