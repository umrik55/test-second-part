module.exports = app => {
    var bodyParser = require('body-parser');
    var jsonParser = bodyParser.json();
    const User = require('../models/dataUser');
    const nodemailer = require("nodemailer");
    const nconf = require('nconf');
    const email= nconf.get('email')

    app.get('/admins', function (req, res, next) {
        User.findById(req.session.userId)
            .exec(function (error, user) {
                if (error) {
                    return res.redirect('/auth');
                } else {
                    if (user === null || user.is_active === false) {
                        return res.redirect('/auth');
                    } else {
                        User.find({},'-password', function (error, data) {
                            if (error) { console.error(error); }
                            res.send(data)
                        }).sort({_id:-1})
                    }
                }
            });
    });

    app.post('/admins', jsonParser , function (req, res, next) {
        User.findById(req.session.userId)
            .exec(function (error, user) {
                if (error) {
                    return res.redirect('/auth');
                } else {
                    if (user !=null && user.level > 1) {
                        let newData = req.body;
                        sendMail(newData);

                        User.create(newData, function (error, user) {
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

    app.delete('/admins', jsonParser , function (req, res, next) {
        User.findById(req.session.userId)
            .exec(function (error, user) {
                if (error) {
                    return res.redirect('/auth');
                } else {
                    if (user !=null && user.level > 1) {
                        let item = req.body;
                        User.deleteOne({
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

    app.put('/admins', jsonParser, function (req, res, next) {
        User.findById(req.session.userId)
            .exec(function (error, user) {
                if (error) {
                    return res.redirect('/auth');
                } else {
                    if (user !=null && user.level > 1) {
                        let item = req.body;

                        sendMail(item);

                        User.findById(item._id, function (error, dataDb) {
                            if (error) { console.error(error); }
                            dataDb.email = item.email;
                            dataDb.username = item.username;
                            dataDb.password = item.password;
                            dataDb.filial = item.filial;
                            dataDb.level = item.level;
                            dataDb.api_token = item.api_token;
                            dataDb.is_active = item.is_active;
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

    async function sendMail(data){
        try {
            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                host: email.smtp_host,
                port: email.port,
                tls: {
                    rejectUnauthorized: false
                },
                secure: false, // true for 465, false for other ports
                auth: {
                    user: email.user,
                    pass: email.pass
                }
            });

            // send mail with defined transport object
            let info = await transporter.sendMail({
                from: '"Dmitry Liamtsev" <eticket@ttc.net.ua>', // sender address
                to: data.email, // list of receivers
                subject: "Auth data for use ”ASOP Monitoring E-TICKET”", // Subject line
                html: data.is_active? `Hello, <b>${data.username}!</b><br><b>Your login:</b> ${data.email}<br><b>Your password:</b> ${data.password}<br><b>Your API-token:</b> ${data.api_token}<br><br>Have some questions? - contact with developer: Dmitry Liamtsev (lyama961@gmail.com)<br>This mail automatic, not answer pls:)` : `Hello, <b>${data.username}!</b><br><b>Your auth data has been blocked! Contact with developer: Dmitry Liamtsev (lyama961@gmail.com)<br>This mail automatic, not answer pls:)` // plain text body
            });
        }
        catch (e) {
            console.log(e)
        }
    }
}
