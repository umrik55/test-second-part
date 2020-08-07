module.exports = app => {
    var bodyParser = require('body-parser');
    var jsonParser = bodyParser.json();
    const User = require('../models/dataUser');
    const Role = require('../models/dataUserAccess');

    app.get('/roles', function (req, res, next) {
        User.findById(req.session.userId)
            .exec(function (error, user) {
                if (error) {
                    return res.redirect('/auth');
                } else {
                    if (user === null) {
                        return res.redirect('/auth');
                    } else {
                        Role.find({}, function (error, data) {
                            if (error) { console.error(error); }
                            res.send(data)
                        }).sort({_id:-1})
                    }
                }
            });
    });

    app.post('/roles', jsonParser , function (req, res, next) {
        User.findById(req.session.userId)
            .exec(function (error, user) {
                if (error) {
                    return res.redirect('/auth');
                } else {
                    if (user !=null && user.level > 1) {
                        let newData = req.body;
                            Role.create(newData, function (error, user) {
                                if (error) {
                                    console.log(error)
                                } else {
                                    return res.send(newData)
                                }
                            });
                    } else {
                        return res.redirect('/auth');
                    }
                }
            });
    });

    app.delete('/roles', jsonParser , function (req, res, next) {
        User.findById(req.session.userId)
            .exec(function (error, user) {
                if (error) {
                    return res.redirect('/auth');
                } else {
                    if (user !=null && user.level > 1) {
                        let item = req.body;
                        Role.deleteOne({
                            _id: item._id
                        }, function(err, post) {
                            if (err)
                                res.send(err)

                            res.send(item)
                        })
                    } else {
                        return res.redirect('/auth');
                    }
                }
            });
    });

    app.put('/roles', jsonParser, function (req, res, next) {
        User.findById(req.session.userId)
            .exec(function (error, user) {
                if (error) {
                    return res.redirect('/auth');
                } else {
                    if (user !=null && user.level > 1) {
                        let item = req.body;

                        Role.findById(item._id, function (error, dataDb) {
                            if (error) { console.error(error); }
                            dataDb.name_level = item.name_level;
                            dataDb.id_level = item.id_level;
                            dataDb.read_route = item.read_route;
                            dataDb.set_route = item.set_route;
                            dataDb.change_route = item.change_route;
                            dataDb.delete_route = item.delete_route;
                            dataDb.api_route = item.api_route;
                            dataDb.save(function (error) {
                                if (error) {
                                    console.log(error)
                                }
                                res.send(item)
                            })
                        })
                    } else {
                        return res.redirect('/auth');
                    }
                }
            });
    });
}
