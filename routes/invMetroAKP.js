/*Inventory configuration akp inventory API endpoints */
module.exports = app => {
    const nconf = require('nconf');
    const bodyParser = require('body-parser');
    const jsonParser = bodyParser.json();
    //const User = require('../models/dataUser');
    //const UserAccess = require('../models/dataUserAccess');
    const excelMongo = require('../models/excel-to-mongodb');
    const multer = require('multer');//пакет для получения файла с клиента
    const util = require('util');
    const dbLocal = require('../db/mongodb');
    const connection = dbLocal.connect();
    var ObjectId = require('mongodb').ObjectID;


    //Get page for period data with filter ohn routing
    app.get('/inventory-plan-akp', async function (req, res, next) {
/*        User.findById(req.session.userId)
            .exec(function (error, user) {
                if (error) {
                    return res.redirect('/');
                } else {
                    if (user !=null) {*/
                        return res.render('inv_metro_akp.hbs');
/*                    } else {
                        return res.redirect('/');
                    }
                }
            });*/
    });

    //Get data for grid
    app.post('/asop-get', async function (req, res, next) {
        const filterObj = req.body;
/*        User.findById(req.session.userId)
            .exec(function (error, user) {
                if (error) {
                    return res.redirect('/');
                } else {
                    if (user === null || user.is_active === false) {
                        return res.redirect('/');
                    } else {
                        let access = UserAccess.getAccess(user.level, {read_route:1,_id:0});
                        access.then((x) => {
                            if(x.read_route){*/
                                getDataAsopSettings({date: '2020-03-28', data:{}}).then((result) => {

                                    let filtArr;

                                    if(Object.keys(filterObj).length != 0 && filterObj.constructor === Object) {
                                        filtArr = result.filter((num) => {
                                            let iter = num;

                                            if (iter.type !== filterObj.type)
                                                return false;

                                            if (iter.Locatio_ID)
                                                if (iter.Locatio_ID.toString().toLowerCase().indexOf(filterObj.Locatio_ID.toString().toLowerCase()) < 0)
                                                    return false;

                                            if (iter.Station)
                                                if (iter.Station.toString().toLowerCase().indexOf(filterObj.Station.toString().toLowerCase()) < 0)
                                                    return false;

                                            if (iter.AKP_number)
                                                if (iter.AKP_number.toString().toLowerCase().indexOf(filterObj.AKP_number.toString().toLowerCase()) < 0)
                                                    return false;

                                            if (iter.AKP_Inventory_______number)
                                                if (iter.AKP_Inventory_______number.toString().toLowerCase().indexOf(filterObj.AKP_Inventory_______number.toString().toLowerCase()) < 0)
                                                    return false;

                                            if (iter.PLACE_ID)
                                                if (iter.PLACE_ID.toString().toLowerCase().indexOf(filterObj.PLACE_ID.toString().toLowerCase()) < 0)
                                                    return false;

                                            if (iter.IP_AKP)
                                                if (iter.IP_AKP.toString().toLowerCase().indexOf(filterObj.IP_AKP.toString().toLowerCase()) < 0)
                                                    return false;

                                            if (iter.MAC)
                                                if (iter.MAC.toString().toLowerCase().indexOf(filterObj.MAC.toString().toLowerCase()) < 0)
                                                    return false;

                                            if (iter.Type_equipment)
                                                if (iter.Type_equipment.toString().toLowerCase().indexOf(filterObj.Type_equipment.toString().toLowerCase()) < 0)
                                                    return false;

                                            if (iter.Number_RIDANGO)
                                                if (iter.Number_RIDANGO.toString().toLowerCase().indexOf(filterObj.Number_RIDANGO.toString().toLowerCase()) < 0)
                                                    return false;

                                            if (iter.IP_RIDANGO)
                                                if (iter.IP_RIDANGO.toString().toLowerCase().indexOf(filterObj.IP_RIDANGO.toString().toLowerCase()) < 0)
                                                    return false;

                                            if (iter.MAC_RID)
                                                if (iter.MAC_RID.toString().toLowerCase().indexOf(filterObj.MAC_RID.toString().toLowerCase()) < 0)
                                                    return false;

                                            if (iter.Data_sending_link)
                                                if (iter.Data_sending_link.toString().toLowerCase().indexOf(filterObj.Data_sending_link.toString().toLowerCase()) < 0)
                                                    return false;

                                            if (iter.Reserve_RIDANGO)
                                                if (iter.Reserve_RIDANGO.toString().toLowerCase().indexOf(filterObj.Reserve_RIDANGO.toString().toLowerCase()) < 0)
                                                    return false;

                                            if (iter.Notes)
                                                if (iter.Notes.toString().toLowerCase().indexOf(filterObj.Notes.toString().toLowerCase()) < 0)
                                                    return false;

                                            return true;
                                        })
                                    }else{
                                        filtArr = result
                                    }
                                    res.send(filtArr);
                                })
        /*
                            }else{
                                res.sendStatus(500);
                            }
                        })

                    }
                }
            });*/
    });

    //REST-api for get ;ist data
    app.get('/api/get-asop/:token/', async (req, res) => {
        let gData = req.params;

        if(!gData)
            res.sendStatus(401);

        try {
/*            let authControl = await User.authenticateAPI(gData.token).then((x) => {
                if(x){
                    if(x.api_route === true)
                        return true;
                    else
                        return false;
                }
                else
                    return false;
            });

            authControl === true? res.send(await getDataAsopSettings({date: '2020-03-28', data:{}})) : res.sendStatus(401);*/

            getDataAsopSettings({date: '2020-03-28', data:{}}).then((result) => {

                //Filter all not full data
                let filtArr = result.filter((num) => {
                    let iter = num;

                    if (iter.Locatio_ID) {
                        if (iter.Locatio_ID === "")
                            return false;
                    } else {
                        return false;
                    }

                    if (iter.Station) {
                        if (iter.Station === "")
                            return false;
                    } else {
                        return false;
                    }

                    if (iter.AKP_number) {
                        if (iter.AKP_number === "")
                            return false;
                    } else {
                        return false;
                    }

                    if (iter.PLACE_ID) {
                        if (iter.PLACE_ID === "")
                            return false;
                    } else {
                        return false;
                    }

                    if (iter.Type_equipment) {
                        if (iter.Type_equipment === "")
                            return false;
                    } else {
                        return false;
                    }

                    if (iter.Number_RIDANGO) {
                        if (iter.Number_RIDANGO === "")
                            return false;
                    } else {
                        return false;
                    }

                    return true;
                })
                console.log(filtArr.length)
                res.send(filtArr);
            })
        }
        catch (e) {
            res.send([])
        }
    });

    app.post('/asop-manipulate', jsonParser , function (req, res, next) {
/*        User.findById(req.session.userId)
            .exec(function (error, user) {
                if (error) {
                    return res.redirect('/');
                } else {
                    if (user === null || user.is_active === false) {
                        return res.redirect('/');
                    } else {
                        let access = UserAccess.getAccess(user.level, {set_route:1,_id:0});
                        access.then((x) => {
                            if (x.set_route) {*/
                                let newData = req.body;
                                let update = updateDataAsopSettings(newData);
                                update.then((xy) => {
                                    getDataAsopSettings({date: '2020-03-28', data:{}}).then((result) => {
                                        res.send({data: result, status: xy.result.upserted? 200 : 500});
                                    })
                                })
/*                            } else {
                                res.sendStatus(500);
                            }
                        })
                    }
                }
            });*/
    });

    app.put('/asop-manipulate', jsonParser, function (req, res, next) {
/*        User.findById(req.session.userId)
            .exec(function (error, user) {
                if (error) {
                    return res.redirect('/');
                } else {
                    if (user === null || user.is_active === false) {
                        return res.redirect('/');
                    } else {
                        let access = UserAccess.getAccess(user.level, {change_route:1,_id:0});
                        access.then((x) => {
                            if (x.change_route) {*/
                                let item = req.body;
                                let update = updateDataAsopSettings(item);
                                update.then((xy) => {
                                    getDataAsopSettings({date: '2020-03-28', data:{}}).then((result) => {
                                        res.send({data: result, status: xy.result.nModified === 1? 200 : 500});
                                    })
                                })
                                //console.log(item)
/*                            } else {
                                res.sendStatus(500);
                            }
                        })
                    }
                }
            });*/
    });

    app.delete('/asop-manipulate', jsonParser, function (req, res, next) {
       /* User.findById(req.session.userId)
            .exec(function (error, user) {
                if (error) {
                    return res.redirect('/');
                } else {
                    if (user === null || user.is_active === false) {
                        return res.redirect('/');
                    } else {
                        let access = UserAccess.getAccess(user.level, {delete_route:1,_id:0});
                        access.then((x) => {
                            if (x.delete_route) {*/
                                let item = req.body;
                                let deleteIt = deleteDataAsopSettings(item);
                                deleteIt.then((xy) => {
                                    getDataAsopSettings({date: '2020-03-28', data:{}}).then((result) => {
                                        res.send({data: result, status: xy.result.n === 1? 200 : 500});
                                    })
                                })
/*
                            } else {
                                res.sendStatus(500);
                            }
                        })
                    }
                }
            })*/
    });

    //Отлов 'прибытия' файла и назначением ему имени
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'db/data/excel')
        },
        filename: function (req, file, cb) {
            var nameOrig = file.originalname;
            var date = new Date()
            var strDate = date.customFormat("#YYYY#-#MM#-#DD#")
            cb(null, file.fieldname + strDate + '.xlsx')
        }
    })
    let upload = multer({ storage: storage }).single('Order_');

    // Запрос на закачку файла на сервер
    app.post('/upload', async function (req, res, next) {
        try {
            const uploadAsync = util.promisify(upload);
            let resultUpload = await uploadAsync(req, res);
            let resultParse = await parseDataToDB({date: new Date().customFormat("#YYYY#-#MM#-#DD#")})
            res.render('inv_metro_akp.hbs', {date_auto: '2020-03-28'});
            //res.sendStatus(resultParse? 200 : 500);
        }
        catch(e){
            console.log(e)
        }
    });

    //Function getting data from API-service ew.kpt.kiev.ua...
    const getDataAsopSettings = async data => {
        return new Promise((x) => {
            connection.db.collection(`asops`, function (err, collection) {
                collection.find(data.data).toArray(function (err, data) {
                    for(var i=0; i< data.length; i++){
                        let parsed = parseInt(data[i].PLACE_ID);
                        let parsed2 = parseInt(data[i].Number_RIDANGO);

                        if(isNaN(parsed))
                            parsed = 0;

                        if(isNaN(parsed2))
                            parsed2 = 0;

                        data[i].PLACE_ID = parsed;
                        data[i].Number_RIDANGO = parsed2;
                    }
                    x(data); // it will print your collection data
                })
            });
        });
    }

    const updateDataAsopSettings = async data => {
        return new Promise((x) => {
            let objectID = ObjectId(data._id);
            delete(data._id)
            connection.db.collection(`asops`, function (err, collection) {
                x(collection.update({ _id: objectID}, data, {upsert:true}))
            });
        });
    }

    const deleteDataAsopSettings = async data => {
        return new Promise((x) => {
            let objectID = ObjectId(data._id);
            connection.db.collection(`asops`, function (err, collection) {
                x(collection.remove({ _id: objectID}))
            });
        });
    }

    const parseDataToDB = async data => {
        return new Promise((X) => {
            let credentials = {
                host: 'localhost',
                path: `./db/data/excel/Order_${data.date}.xlsx`,
                collection: `asop`,
                db: nconf.get('urldb'),
            };
            let options = {
                safeMode: false,//Backup the db to the current working directory in dump/<db> folder.
                verbose: false, //Console.log the current step processing.
                customStartEnd: false, //Custom insert the row and columns rather than full excel-file. Do take care! Specifying endRow or endCol may result in insertion of redundant dat
                allSheets: nconf.get('parse_excel:count_sheets')
            }
            let test = excelMongo.covertToMongo(credentials, options, function (res) {
                X(res)
            }); //returns documents inserted in the database.
        })
    }

    //custom date obj
    Date.prototype.customFormat = function (formatString) {
        var YYYY, YY, MMMM, MMM, MM, M, DDDD, DDD, DD, D, hhhh, hhh, hh, h, mm, m, ss, s, ampm, AMPM, dMod, th;
        YY = ((YYYY = this.getFullYear()) + "").slice(-2);
        MM = (M = this.getMonth() + 1) < 10 ? ('0' + M) : M;
        MMM = (MMMM = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][M - 1]).substring(0, 3);
        DD = (D = this.getDate()) < 10 ? ('0' + D) : D;
        DDD = (DDDD = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][this.getDay()]).substring(0, 3);
        th = (D >= 10 && D <= 20) ? 'th' : ((dMod = D % 10) == 1) ? 'st' : (dMod == 2) ? 'nd' : (dMod == 3) ? 'rd' : 'th';
        formatString = formatString.replace("#YYYY#", YYYY).replace("#YY#", YY).replace("#MMMM#", MMMM).replace("#MMM#", MMM).replace("#MM#", MM).replace("#M#", M).replace("#DDDD#", DDDD).replace("#DDD#", DDD).replace("#DD#", DD).replace("#D#", D).replace("#th#", th);
        h = (hhh = this.getHours());
        if (h == 0) h = 24;
        if (h > 12) h -= 12;
        hh = h < 10 ? ('0' + h) : h;
        hhhh = hhh < 10 ? ('0' + hhh) : hhh;
        AMPM = (ampm = hhh < 12 ? 'am' : 'pm').toUpperCase();
        mm = (m = this.getMinutes()) < 10 ? ('0' + m) : m;
        ss = (s = this.getSeconds()) < 10 ? ('0' + s) : s;
        return formatString.replace("#hhhh#", hhhh).replace("#hhh#", hhh).replace("#hh#", hh).replace("#h#", h).replace("#mm#", mm).replace("#m#", m).replace("#ss#", ss).replace("#s#", s).replace("#ampm#", ampm).replace("#AMPM#", AMPM);
    };
}
