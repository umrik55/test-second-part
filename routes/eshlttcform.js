//20210413  версия для ГИОЦ Этап 2, чтение с базы данных mongodb
module.exports = app => {
    var bodyParser = require('body-parser');
    var fs = require('fs');
    var hbs = require('hbs'); // шаблонизатор
    var usersFile;// = 'data/Eshl_2017_11_30_formular_tb.json'; // файл формуляров путевого листа
    var jsonParser = bodyParser.json();
    var _mssql = require('@frangiskos/mssql');

    var filiiName;
    var formDate;
    var formTNum;

   //mongodb
	var nconf = require('nconf');
	var filenameconf = './config.json';
	nconf
		.argv()
		.env()
		.file({ file: filenameconf }); // подключаем конфиг файл
	//с конфиг-файла
	var urldb = nconf.get('urldb'); // база данных
	var MongoClient = require('mongodb').MongoClient;
	var db;
	//Connection
	MongoClient.connect(urldb, function(err, database) {
		if (err) throw err;
		else {
			db = database;
			console.log('Connected *.json to MongoDB');
		}
	});

    function saveDB(name, data) {
        var result = 0;
        var tempData = { _id: name, cont: data };
        db
            .collection('fuel')
            .update({ _id: name }, { tempData }, { upsert: true }, function(
                err,
                result
            ) {
                if (err) console.log('Error save mongo '+name);
                else console.log('Success save mongo '+name);
            });
        return result;
    }
	
	async function loadDB(name) {
		try {
		  var result1 = await db.collection('fuel').find({ _id: name }).toArray();
		  return result1[0].tempData.cont;
		} catch (e) {
		  console.log('Помилка читання БД ' + name);
		  var result1 = '[{}]';
		  result1 = fs.readFileSync(name, 'utf8');
		  //var evpecont = fs.readFileSync(eventPeFile, 'utf8');
		  return result1;
		}
	  }

	async function loadDBTrips(name) {
		try {
		  var result1 = await db.collection('fuel').find({ _id: name }).toArray();
		  return result1[0].tempData.cont;
		} catch (e) {
		  console.log('Помилка читання БД_trips ' + name);
		  var result1 = {};
		  //result1 = fs.readFileSync(name, 'utf8');
		  return result1;
		}
	  }

	function saveDBEv(name, data) {
        var result = 0;
        var tempData = { _id: name, cont: data };
        db
            .collection('evends')
            .update({ _id: name }, { tempData }, { upsert: true }, function(
                err,
                result
            ) {
                if (err) console.log('Error save mongo '+name);
                else console.log('Success save mongo '+name);
            });
        return result;
    }
	function saveDBEq(name, data) {
        var result = 0;
        var tempData = { _id: name, cont: data };
        db
            .collection('equips')
            .update({ _id: name }, { tempData }, { upsert: true }, function(
                err,
                result
            ) {
                if (err) console.log('Error save mongo '+name);
                else console.log('Success save mongo '+name);
            });
        return result;
    }

	 async function loadDBVal(name) {
		try{
		var result1 = await db.collection('fuel').find({ _id: name }).toArray();
		//console.log(JSON.parse(result1[0].tempData.cont).length);
		return result1[0].tempData.cont;
		}catch(e){
			var result1 = {};
			console.log("Помилка читання БД "+name);
			//result1  = fs.readFileSync(name, 'utf8');
			return result1;

		}
	}

	 async function loadDBEv(name) {
		try{
		var result1 = await db.collection('evends').find({ _id: name }).toArray();
		return result1[0].tempData.cont;
		}catch(e){
			var result1 = {};
			console.log("Помилка читання БД "+name);
			//result1  = fs.readFileSync(name, 'utf8');
			return result1;
		}
	}

	 async function loadDBEq(name) {
		try{
		var result1 = await db.collection('equips').find({ _id: name }).toArray();
		return result1[0].tempData.cont;
		}catch(e){
			var result1 = {};
			console.log("Помилка читання БД "+name);
			//result1  = fs.readFileSync(name, 'utf8');
			return result1;
		}
	}

    //Функция для получения расписания с фтп
    function getSchedule(date){
        var strDate = date.replace(/-/g, "_");
        var strDir = "ASDUavto_"+strDate+"_schedule.json";
        if (!fs.existsSync("data/"+strDir)) {
            try {
                var Ftp = new JSFtp({
                    host: dataFtp.hostFtp,
                    port: dataFtp.portFtp,
                    user: dataFtp.userFtp,
                    pass: dataFtp.passFtp,
                    debugMode: true
                });
                Ftp.keepAlive();
                Ftp.get(dataFtp.shedulepath + strDir, "data/" + strDir, function (hadErr) {
                    if (hadErr) {
                        console.log("Помилка при завантаженні файлу розкладу" + strDir + "з ФТП:" + hadErr);
                    }
                });
            }
            catch (e) {
                console.log(e)
            }
        }
    }

    // создаем парсер для данных application/x-www-form-urlencoded
    var urlencodedParser = bodyParser.urlencoded({ extended: false });
    // устанавливаем путь к каталогу с частичными представлениями
    hbs.registerPartials(__dirname + '/views/partials');
    app.set('view engine', 'hbs');
	;
    //Запись шаблонов, если файлы на текущую дату отсутствуют
    function WriteExample(nameExample, strDate, addExample, obj) {
        if(obj == null) {
            var data = fs.readFileSync(nameExample, 'utf8');
            var users = JSON.parse(data);
            var data_new = JSON.stringify(users);
            fs.writeFileSync("data/Eshl_" + strDate + addExample, data_new);
        }else {
            fs.writeFileSync("data/Eshl_" + strDate + addExample, obj);
        }
    }
    //Отображение списка формуляров
    function ResponceTub(res, users) {
        if (users) {
            res.send(users);
        } else {
            res.status(404).send();
        }
    }

    // получение списка данных для общего списка формуляров
    app.post('/api/eshl_form', jsonParser, function(req, res) {
        if (!req.body)
            return res.sendStatus(400);

        var fDate = req.body.tDate;
        var fNum = req.body.tNum;

        try{
            var API = require('./getAPI.js');
            var result = new API(fDate, null);//Заполнение конструктора значением даты и таб. номера
            result.getFormular(function(obj) {

                if(obj != null) {
                    var SubAdd = require('./users_add.js')//Подключаем модуль
                    var SubFuel = require('./users_addfuel.js')//Подключаем модуль
                    var users2 = JSON.parse(obj);
                    var strDate = fDate.replace(/-/g, "_");
                    var data_new;
                    usersFile = "data/Eshl_"+strDate+"_formular_tb.json";
                    if (!fs.existsSync(usersFile)) {//Формуляров на текущую датту ещё нет на сервисе
                        WriteExample(null, strDate, "_formular_tb.json", obj); //запись в файл списка формуляров за тек. сутки
                        WriteExample("data/Eshl_add_example.json", strDate, "_add_tb.json", null); //Запись шаблона не линейной работы
                        WriteExample("data/Eshl_fuel_example.json", strDate, "_fuel_tb.json", null); //запись шаблона топлива
                        ResponceTub(res, users2);
                    }else{//уже есть
                        var content = fs.readFileSync("data/Eshl_"+strDate+"_formular_tb.json", 'utf8');//Текущий файл формуляров
                        var users = JSON.parse(content);
	                    var keyss = [];//массив для текущих ключей *ИД формуляра*
                        var users_new = [];//массив для обновлённых формуляров
                        var max_id = 0;//переменная для поиска максимального локального ид
                        users2.reduce(function(sum, current) {
                            keyss[current.factWorkHeaderID] = true;//назначение ключу флага
                        }, 0);

						//Занесение новых полученых данных в массив посредник
                        users2.forEach(function (entry) {
                            users_new.push(entry);
                            if(entry.id > max_id)
                                max_id = entry.id;
                        });
						//поиск и добавление старых формуляров в предидущем файле, которых не оказалось в новом
                        users.forEach(function (entry) {
							if (!keyss[entry.factWorkHeaderID]) {
								entry.id = max_id+1;
								users_new.push(entry);
								max_id++;
							}
                        });
                        data_new = JSON.stringify(users_new);
                        ResponceTub(res, users_new)
                        WriteExample(null, strDate, "_formular_tb.json", data_new); //запись в файл списка формуляров за тек. сутки
                    }
                    new SubAdd("data/Eshl_"+strDate+"_add_tb.json");//Вызов конструктора для передачи текущего названия файла
                    new SubFuel("data/Eshl_"+strDate+"_fuel_tb.json");//Вызов конструктора для передачи текущего названия файла
                } else {
                    res.send(data_new);
                }
            });
        }
        catch(e){console.log(e);}
    });

	function monduty(userf, descr, users, usersvalid, eventPe, validPe, obPe, userfs) {
	    var user = null;
        // находим в массиве пользователя по id

		var id= descr+userf.factWorkHeaderID;
		var pef= userf.PENumPe;
		var obdescr="";
		userf.obtime=0;
		if (descr==="A") obdescr="B";
		if (descr==="B") obdescr="O";
		if (descr==="C") obdescr="A";

		if(obPe[obdescr+userf.PENumPe])
					{
					userf.obtime = obPe[obdescr+userf.PENumPe].Note_time ? obPe[obdescr+userf.PENumPe].Note_time.substr(0,19) : null;
					userf.info = obPe[obdescr+userf.PENumPe].Info;
					userf.Message_bad_validators = obPe[obdescr+userf.PENumPe].Message_bad_validators;
					userf.Message_bad_driverInterface = obPe[obdescr+userf.PENumPe].Message_bad_driverInterface;
					}
		 userf.A2 = 3;    // признак нет логина
		 userf.smenTripCount = 0;   // текущий рейс

		try{for (var i = usersvalid.length-1; i >0 ; i--) {
				if(typeof usersvalid[i].line == "undefined"){
				}else{
				   	if(typeof usersvalid[i].trip_id == "undefined" || usersvalid[i].trip_id ==null){
					}else{
						if (usersvalid[i].location_id == pef ) {
							if(usersvalid[i].trip_id.substr(0,1)==descr){
								userf.validation = usersvalid[i].timestamp.substr(11,8);
								break;
							}
						}
					}
				}
		}
			if (userf.validation==0){
					//userf.A2 = 4;
					if(validPe[descr+userf.PENumPe])
					{
					userf.validation = validPe[descr+userf.PENumPe].timestamp.substr(0,19);
					}
				}

			for (var i = users.length-1; i >0 ; i--) {
				if(typeof users[i].duty_code == "undefined"){
				}else{
					if (users[i].duty_code == id) {
						 userf.A2 = 0;
						userf.smenTripCount = users[i].ext_trip_id+", ("+users[i].timestamp.substr(11,8)+")";
						break;
					}
				}
				if(typeof users[i].location_id == "undefined"){
				}else{
						if (users[i].location_id == pef && users[i].ext_driver_id.substr(0,1) == descr) {
							userf.A2 = 1;
							if(typeof users[i].duty_code == "undefined"){
							}else{
								for (var jj = 0; jj< userfs.length; jj++) {
									if((descr+userfs[jj].factWorkHeaderID)===users[i].duty_code){
										userf.factWorkHeaderID=userf.factWorkHeaderID+"<br>("+descr+userfs[jj].factWorkHeaderID+" "+
										" РО="+userfs[jj].PENumPe+"<br>М="+userfs[jj].marNum+"-"+userfs[jj].vipNum+"-"+userfs[jj].smenNum+
										" Тб="+userfs[jj].driversTabNum+" Ч="+userfs[jj].factWorkHeaderBegin.substr(11,5)+"-"+userfs[jj].factWorkHeaderEnd.substr(11,5)+")";
									};

								}

							};
							if(typeof users[i].ext_trip_id == "undefined"){
								if(users[i].event=="SI" || users[i].event=="SO"){
									userf.smenTripCount = users[i].event +", ("+users[i].timestamp.substr(11,8)+")";
									break;
								};
							}else{
						     	userf.smenTripCount = users[i].ext_trip_id+", ("+users[i].timestamp.substr(11,8)+")";
								break;
							}
						}
				}
				if (userf.smenTripCount==0){
					userf.A2 = 4;
					if(eventPe[descr+userf.PENumPe])
					{
					userf.smenTripCount = eventPe[descr+userf.PENumPe].timestamp.substr(0,19)+" "+eventPe[descr+userf.PENumPe].event;
					}
				}
			};
		}
		catch(err)
		{
			console.log(err);
		};
		return userf;
	}

	function mondutyTrips(userf, descr, users, usersvalid, fDate, eventPe, validPe, obPe, tripsPe) {
		//console.log("F="+descr);
		
		
		
		
        var user = null;
        // находим в массиве пользователя по id
		var id= descr+userf.factWorkHeaderID;
		var pef= userf.PENumPe;
		var obdescr="";
		userf.obtime=0;
		if (descr==="A") obdescr="B";
		if (descr==="B") obdescr="O";
		if (descr==="C") obdescr="A";
		if (userf.PENumPe==="A7558") console.log([descr+" "+userf.PENumPe]);
		if(obPe[obdescr+userf.PENumPe])
					{
					try{
					userf.obtime = tripsPe[descr+userf.PENumPe].timestamp ? tripsPe[descr+userf.PENumPe].timestamp.substr(0,19) : null;
					}
					catch(e){
						userf.obtime ="";
					};
					if(tripsPe[descr+userf.PENumPe]){
						var infot = JSON.stringify(tripsPe[descr+userf.PENumPe]);
						var tripsArr=[];
						tripsArr=Object.keys(tripsPe[descr+userf.PENumPe]);
						var tempDateH = new Date();
						var tempTimeH = tempDateH.getHours()+":"+(tempDateH.getMinutes()<10 ? "0"+tempDateH.getMinutes(): tempDateH.getMinutes());
						var infot="<h3 > Оперативний перелік виконаних рейсів РО, час "+(tempTimeH<10 ? "0"+tempTimeH: tempTimeH)+" : </h3><table>"+
									"(Всього рейсів = "+Number(tripsArr.length-2)+". "+
									"Всього валідацій = "+Number(tripsPe[descr+userf.PENumPe].validCount)+")"+
											"<tr><th>№ Рейсу (факт)</th>"+
											"<th>Показники рейсу</th> ";
						for (var j = 2; j < tripsArr.length; j++){
							infot+="<tr><td>"+tripsArr[j]+"</td>"+"<td>"+JSON.stringify(tripsPe[descr+userf.PENumPe][tripsArr[j]])+"</td></tr>";

						};
						try{
							var datetemp=tripsPe[descr+userf.PENumPe].timestamp.slice(0,11);
							var re = new RegExp(datetemp, 'g');
						}catch(e){
							var datetemp="??";
							var re = new RegExp(datetemp, 'g');
						};
						infot+="</table>";
						if(tripsPe["U"+userf.PENumPe]){
							infot+="<br> <strong>Валідації від валідатора Герц</strong> <br>";
							infot+=JSON.stringify(tripsPe["U"+userf.PENumPe]).replace(/,/g,"<br>");
							userf.obtime+="<br><strong>+ валідатор Герц</strong>"
						};

						userf.info = infot.replace(/,/g,". ")
									.replace(/:{/g," - ")
									//.replace(/:"/g,'="')
									.replace(/{"validCount"/g,"Всього валідацій")
									.replace(/"timestamp"/g,"Час останньої активності")
									.replace(/"eTimeB"/g,"Початок ")
									.replace(/"eTimeE"/g,"Кінець ")
									.replace(/"timestampTrips"/g,"Остання валідація ")
									.replace(/"validTripsCount"/g,"Кількість валідацій ")
									.replace(/}/g,"")
									.replace(/02:00/g,"")
									.replace(/.000/g,"")
									.replace(/\+/g,"")
									.replace(re,"")
									.replace(/"undefined"/g,"")


					}else{
						userf.info = "Інформація відсутня";
					};
						try{
						userf.Message_bad_validators = tripsPe[descr+userf.PENumPe].validCount;
						userf.Message_bad_driverInterface = "";
						}catch(e){
							userf.Message_bad_validators = "";
						    userf.Message_bad_driverInterface = "";
						};
					}
		 userf.A2 = 3;    // признак нет логина
		 userf.smenTripCount = 0;   // текущий рейс
		try{for (var i = usersvalid.length-1; i >0 ; i--) {
				if(typeof usersvalid[i].line == "undefined"){
				}else{
				   	if(typeof usersvalid[i].trip_id == "undefined" || usersvalid[i].trip_id ==null){
					}else{
						if (usersvalid[i].location_id == pef ) {
							if(usersvalid[i].trip_id.substr(0,1)==descr){
								userf.validation = usersvalid[i].timestamp.substr(11,8);
								break;
							}
						}
					}
				}
		}
			if (userf.validation==0){
					if(validPe[descr+userf.PENumPe])
					{
					userf.validation = validPe[descr+userf.PENumPe].timestamp.substr(0,19);
					}
				}

			for (var i = users.length-1; i >0 ; i--) {
				if(typeof users[i].duty_code == "undefined"){
				}else{
					if (users[i].duty_code == id) {
						 userf.A2 = 0;
						userf.smenTripCount= users[i].ext_trip_id+", ("+users[i].timestamp.substr(11,8)+")";
						break;
					}
				}
					if(typeof users[i].location_id == "undefined"){
				}else{
						if (users[i].location_id == pef && users[i].ext_driver_id.substr(0,1) == descr) {
							userf.A2 = 1;
							if(typeof users[i].duty_code == "undefined"){
							}else{
								userf.factWorkHeaderID = userf.factWorkHeaderID +" ("+users[i].duty_code+")";
							};
							if(typeof users[i].ext_trip_id == "undefined"){
								if(users[i].event=="SI" || users[i].event=="SO"){
									userf.smenTripCount = users[i].event +", ("+users[i].timestamp.substr(11,8)+")";
									break;
								};
							}else{
						     	userf.smenTripCount = users[i].ext_trip_id+", ("+users[i].timestamp.substr(11,8)+")";
								break;
							}
						}
				}
				if (userf.smenTripCount==0){
					userf.A2 = 4;
					if(eventPe[descr+userf.PENumPe])
					{
					userf.smenTripCount = eventPe[descr+userf.PENumPe].timestamp.substr(0,19)+" "+eventPe[descr+userf.PENumPe].event;
					}
				}
			};
		try{
			userf.smenTripCount=Number(tripsArr.length-2)+"<br>"+userf.smenTripCount;
		}catch(e){
			userf.smenTripCount="<br>"+userf.smenTripCount;
			};
		}
		catch(err)
		{
			console.log(err);
		};
		return userf;
	}

	function factControlerInfo(info,locaton,obpe, plan) {
		var contest ="";
		var chanconfig="";
		var obinfo="";

		for(var key in info) {
			if(key!="note_time" && key!="note_time_" && key!="info"){
			chanconfig=JSON.stringify(info[key]).replace(/"timestamp"/g," Час перевірки")
				.replace(/.000/g,"")
				.replace(/T/g," ")
				.replace(/"info"/g," Інф.")
				.replace(/"info"/g," Інф.")
				.replace(/<br>/g,"")
				.replace(/"validations_"/g," Було")
				.replace(/"validations"/g," Стало")
				.replace(/"timestamp_"/g," Час зміни");
				obinfo=JSON.stringify(obpe.Info).replace(/<br>/g," ")
				.replace(/.000/g,"")
				.replace(/T/g," ")
				.replace(/"Час -/g,"Час перевірки")
				.replace(/№=/g,",  №=")
				.replace(/Валідатор -/g,"Валідатори")
				.replace(/Термінал водія -/g,". ")
				.replace(/Статус/g," Статус станції")
				.replace(/РО/g," Код станції");
				contest = contest +"<a href='../detal/"+obinfo+"/"+chanconfig+"/"+plan+"'>"+key+"</a>" + " = " + JSON.stringify(info[key].validations)+" ";
			};
        }
		if(contest.length>67){
			var cont1=contest.substr(0, 67)+" ";
			var cont2=contest.substr(67);
			//contest=contest.substr(0, 32)+" "+contest.substr(32,contest.length-1);
			contest=cont1+cont2;
		}
		return contest
	};

	function controlerInfo(info,locaton,infoFact) {
		var contest ="";
		for(var key in info) {
			if(key!="note_time" && key!="note_time_" && key!="info"){
				contest = contest +"<a href='../detalpl/"+key+"/"+locaton+"'>"+key+"</a>" + " = " + JSON.stringify(info[key].validations)+" ";
			};
        }
		if(contest.length>67){
			var cont1=contest.substr(0, 67)+" ";
			var cont2=contest.substr(67);
			contest=cont1+cont2;
		}
		return contest
	};

	function controlerFlag(confP,confF) {
		var contest ="Ні";
		for(var key in confF) {
			var egvt=0;
			try{
				var fF=confF[key].validations.length;
				var fP=confP[key].validations.length;
			}catch(e){
				var fF=0;
				var fP=1;
			}
			if(key!="note_time" && key!="note_time_" && key!="info"){
				if(fF===fP){
					for (var i = 0; i < confP[key].validations.length; i++) {
						for (var j = 0; j < confF[key].validations.length; j++) {
							egvt=0;
							if(confP[key].validations[i]===confF[key].validations[j]){
								egvt=1;
								break;
							};
						}
						if(egvt===0){
							contest = "Так";
							break;
						}
					}
				}else{
					contest = "Так";
					break;
				};
			};
        };
		return contest
	};

	function controlerValid(info,locaton,infoFact,validations) {
		var valid=validations.filter(function (e) {
				  return "V"+e.location_id === locaton && e.stop_code === null;
				});
		var errvalid=true;
		var planfakt=[];
		var test=[];
		for(var key in info) {
			if(key!="note_time" && key!="note_time_" && key!="info"){
				planfakt =info[key].validations;
			};
        }
		for (var i = 0; i < valid.length; i++) {
			errvalid=true;
			for (var j = 0; j < planfakt.length; j++) {
				if(valid[i].product_id===planfakt[j]){
				   errvalid=false;
					break;
				}
			}
			if(errvalid && test.length<5) test.push(valid[i]);
		};
		var tkey=JSON.stringify(test);
		var tlocaton=planfakt;
		var contest ="<a href='../detalvalid/"+tkey+"/"+tlocaton+"'>"+test.length+"</a>";
		return contest
	};

	function mondutyM(userf, descr, users, usersvalid, eventPe, validPe, obPe, chobPe, chobPeP) {
        var user = null;
		var id= descr+userf.factWorkHeaderID;
		var pef= userf.location_id;
		var obdescr="V";
		userf.obtime=0;
		if (descr==="A") obdescr="B";
		if (descr==="B") obdescr="O";
		if (descr==="C") obdescr="A";
		if(obPe[obdescr+userf.location_id])
					{
					try{
					userf.obtime = obPe[obdescr+userf.location_id].Note_time.substr(0,19);
					userf.info = obPe[obdescr+userf.location_id].Info;
					try{
						userf.conftime=chobPe[obdescr+userf.location_id].note_time;
						userf.conftime_=chobPe[obdescr+userf.location_id].note_time_;
						userf.conf1f= factControlerInfo(chobPe[obdescr+userf.location_id],obdescr+userf.location_id,obPe[obdescr+userf.location_id],userf.name );
						userf.conf1p= controlerInfo(chobPeP[obdescr+userf.location_id],obdescr+userf.location_id,chobPe[obdescr+userf.location_id]);
						userf.confFlag= controlerFlag(chobPeP[obdescr+userf.location_id], chobPe[obdescr+userf.location_id]);
						userf.errorValid= controlerValid(chobPeP[obdescr+userf.location_id],obdescr+userf.location_id,chobPe[obdescr+userf.location_id],usersvalid);
						userf.info= userf.info+JSON.stringify(chobPe[obdescr+userf.location_id]).replace(/,/g,"<br>")
								    .replace(/:{/g," - ")
									.replace(/{/g,"<br>Контролер - ")
									.replace(/"РО"/g,"Вестибуль")
									.replace(/"timestamp"/g,"Час перевірки контролера")
									.replace(/"timestamp_"/g,"Час попередньої зміни контролера")
									.replace(/"validations"/g,"Валідатори")
									.replace(/"validations_"/g,"Валідатори_")
									.replace(/"info"/g,"Причина зміни")
									.replace(/"note_time_"/g,"Час попередньої зміни вестибулю")
									.replace(/"note_time"/g,"Час перевірки вестибулю")
									.replace(/T/g," ")
									.replace(/}/g,"")
									.replace(/02:00/g,"")
									.replace(/.000/g,"")
									.replace(/\+/g,"")
									.replace(/"РО"/g,"Вестибуль")
									.replace(/"undefined"/g,"");
					}catch(e){
						userf.conftime="";
						userf.conftime_="";
					}

					}catch(e){
						userf.obtime = "";
						userf.info = "";
					    };
					}
		 userf.A2 = 3;    // признак нет логина
		 userf.smenTripCount = 0;   // текущий рейс
		try

		{for (var i = usersvalid.length-1; i >0 ; i--) {

				if(typeof usersvalid[i].line == "undefined"){
				}else{
				   	if(typeof usersvalid[i].trip_id == "undefined" || usersvalid[i].trip_id ==null){
					}else{
						if (usersvalid[i].location_id == pef ) {
							if(usersvalid[i].trip_id.substr(0,1)==descr){
								userf.validation = usersvalid[i].timestamp.substr(11,8);
								break;
							}
						}
					}
				}
		}
					if(validPe[obdescr+userf.location_id])
					{
						userf.validation = validPe[obdescr+userf.location_id].timestamp.substr(0,19);

						try{
							userf.validationKC = validPe[obdescr+userf.location_id].timestampKC.substr(0,19);
						}
						catch(e){
							userf.validationKC = "";
						};
						try{
							userf.validationTC = validPe[obdescr+userf.location_id].timestampTC.substr(0,19);
						}
						catch(e){
							userf.validationTC = "";
						};	try{
							userf.validationQR = validPe[obdescr+userf.location_id].timestampQR.substr(0,19);
						}
						catch(e){
							userf.validationQR = "";
						};
					}
		}
		catch(err)
		{
			console.log(err);
		};
		return userf;
	}

	function compare(a,b) {
		  if (a.factWorkHeaderBegin < b.factWorkHeaderBegin)
			return -1;
		  if (a.factWorkHeaderBegin > b.factWorkHeaderBegin)
			return 1;
    }

	function validtype(num,place,arrv) {
		  var valid ={
			  KC : "",
			  TC : "",
			  QR : ""
		  };
		 for (var i = 0; i <arrv.length ; i++) {
			try{
			if(arrv[i].product_id===place || arrv[i].product_id===num){
				 if (arrv[i].card_id==="KC"){
					valid.KC =  arrv[i].timestamp.slice(0,19);
				 };
				 if (arrv[i].card_id==="TC"){
					valid.TC =  arrv[i].timestamp.slice(0,19);
				 };
				 if (arrv[i].card_id==="QR"){
					valid.QR =  arrv[i].timestamp.slice(0,19);
				 };
			 };
			}catch(e){
				console.log(e);
			};

		 };
		return valid;
    }

  // переход к подробностям плана конфигурации турникетов
    app.get('/detalpl/:parms/:locaton', function(req, res) {
        try {
            var parms = req.params.parms;//получаем парметр строки
			var locaton = req.params.locaton;//получаем парметр строки
			var validPeFile = 'data/validations.json'; // файл буфер валидаций
			var valid = {}; // последние изменения сообщений оборудования по ПЕ
			var validcont = fs.readFileSync(validPeFile, 'utf8');
			valid = JSON.parse(validcont);
			var valid=valid.filter(function (e) {
				  return "V"+e.location_id === locaton;
				});

			var chobPeFile = 'data/configTurnikets.json'; // файл изменения состояния оборудования
			var chobPe = {}; // последние изменения сообщений оборудования по ПЕ
			chvapecont = fs.readFileSync(chobPeFile, 'utf8');
			chobPe = JSON.parse(chvapecont);
			var infoFact=chobPe[locaton];
			var keyCon="";
			var timeUp="";
			var arrTur=[];
			var keyCon2="";
			var timeUp2="";
			var arrTur2=[];
			var dubl=0;

			for(var key1 in infoFact) {
			if(key1!="note_time" && key1!="note_time_" && key1!="info"){
				if(dubl===0){
					keyCon=key1
					timeUp=infoFact[key1].timestamp.slice(0,19);
					arrTur=infoFact[key1].validations;
					dubl=dubl+1;
				}else{
					keyCon2=key1
					timeUp2=infoFact[key1].timestamp.slice(0,19);
					arrTur2=infoFact[key1].validations;
					dubl=dubl+1;
				}

			}
			};

			var confPFile = 'data/inPlanTurn.json'; // файл плана конфигурации
			var confP = []; // плана конфигурации
			var chvapecontp = fs.readFileSync(confPFile, 'utf8');
			confP = JSON.parse(chvapecontp);
			confP = confP.filter(function (e) {
				  return "V"+e.Locatio_ID === locaton;
				});

			var nameSt = confP[0].Station;
			for (var i = 0; i <confP.length ; i++) {
				if(arrTur.find(function(item){if(item === confP[i].PLACE_ID) return confP[i].PLACE_ID})===confP[i].PLACE_ID){
					if(confP[i].Number_RIDANGO===keyCon){
						confP[i].keyCon=keyCon;
					}else{
						confP[i].keyCon=""+keyCon+"";
					};
					confP[i].timeUp=timeUp;
					confP[i].tur=confP[i].PLACE_ID;
				}else{
					if(arrTur2.find(function(item){if(item === confP[i].PLACE_ID) return confP[i].PLACE_ID})===confP[i].PLACE_ID){
						if(confP[i].Number_RIDANGO===keyCon2){
							confP[i].keyCon=keyCon2;
						}else{
							confP[i].keyCon=""+keyCon2+"";
						};
						confP[i].timeUp=timeUp;
						confP[i].tur=confP[i].PLACE_ID;
					}else{
						confP[i].keyCon="";
						confP[i].timeUp="";
						confP[i].tur="";
					}
				}
			};

			for (var i = 0; i <arrTur.length ; i++) {
				if(confP.find(function(item){if(item.PLACE_ID === arrTur[i]) return arrTur[i]})!=undefined){
				}else{
					confP.push({"keyCon" : keyCon,
					"timeUp" : timeUp,
					tur : arrTur[i]});
				}
			};

			for (var i = 0; i <arrTur2.length ; i++) {
				if(confP.find(function(item){if(item.PLACE_ID === arrTur2[i]) return arrTur2[i]})!=undefined){
				}else{
					confP.push({"keyCon" : keyCon2,
					"timeUp" : timeUp2,
					tur : arrTur2[i]});
				}
			};

			for (var i = 0; i <confP.length ; i++) {
				var validT = validtype(confP[i].tur,confP[i].PLACE_ID,valid);
				confP[i].TC=validT.TC;
				confP[i].KC=validT.KC;
				confP[i].QR=validT.QR;
			};

			res.render('inDetalTurPlan.hbs', {
				tNum : parms,
				locaton : locaton,
				confp : confP,
				nameSt : nameSt
            })
        } catch (e) {
            var errit = [];
            errit.push(e);
            res.render('error.hbs', { errit: errit });
        }
    });


  // переход к подробностям факта конфигурации турникетов
    app.get('/detal/:parms/:locaton/:name', function(req, res) {
        try {
            var parms = req.params.parms;//получаем парметр строки
            var locaton = req.params.locaton;//получаем парметр строки
			var name = req.params.name;//получаем парметр строки
			res.render('inDetalTur.hbs', {
               tNum : parms,
			   locaton : locaton,
			   name : name
            })
        } catch (e) {
            var errit = [];
            errit.push(e);
            res.render('error.hbs', { errit: errit });
        }
    });

	 // переход к подробностям факта конфигурации турникетов
    app.get('/detalvalid/:parms/:locaton', function(req, res) {
        try {
            var parms = req.params.parms;//получаем парметр строки
            var locaton = req.params.locaton;//получаем парметр строки
			res.render('inDetalTurValid.hbs', {
               tNum : parms,
			   locaton : locaton
            })
        } catch (e) {
            var errit = [];
            errit.push(e);
            res.render('error.hbs', { errit: errit });
        }
    });

	//Получение списка всех формуляров на текущую датту для просмотра
    app.post('/api/formulars_form', jsonParser, async function(req, res) {
				try {
				// действия водителей
				var usersFile = 'data/evends.json'; // файл driver
				var content = await loadDBEv(usersFile);
				var usersdr = JSON.parse(content);
				usersdr.sort(function (a, b) {
				  if (a.timestamp > b.timestamp) {
						return 1;
				  }
					  if (a.timestamp < b.timestamp) {
							return -1;
						  }
						  return -1;
				});
				// валидации
				usersFile = 'data/validations.json'; // файл валидаций
				var content = await loadDBVal(usersFile);
				var usersvalid = JSON.parse(content);

				//
				var eventPeFile = 'data/eventPe.json'; // файл последних действий водителя
				var eventPe = {}; // объявление obj последних действий водителя
				var evpecont= await loadDBEv(eventPeFile);
				eventPe = JSON.parse(evpecont);

				var validPeFile = 'data/validPe.json'; // файл последних действий водителя
				var validPe = {}; // объявление obj последних действий водителя
				var vapecont= await loadDBVal(validPeFile);
				validPe = JSON.parse(vapecont);

				var obPeFile = 'data/equipsPe.json'; // файл последних действий водителя
				var obPe = {}; // объявление obj последних сообщений оборудования
				var vapecont1= await loadDBEq(obPeFile);
				obPe = JSON.parse(vapecont1);

				var fDate = req.body.tDate;
				var fFilii = req.body.tData4;
                var API = require('./getAPI.js');
                var result = new API(fDate, null, fFilii);//Заполнение конструктора значением даты и таб. номера
                result.getFormular(function (obj) {
                    if (obj != null) {
                        var users = JSON.parse(obj);
						var rez = users[0].vipFilialID;
						var descr = "A";
						switch ( true ) {
						  case (rez)>0 && (rez)<9:
							descr = "A";
							break;
						  case (rez)>8 && (rez)<13:
							descr = "B";
							break;
						  case (rez)>12 && (rez)<16:
							descr = "C";
							break;
						  default:
							descr = "A";
						}

						for (var i=0; i < users.length; i++) {
							users[i] = monduty(users[i],descr,usersdr, usersvalid, eventPe, validPe, obPe, users);
							};

                        res.send(users.sort(compare));
                    }else{
                        res.send(users);
                    }
                });
        }
        catch(e){console.log(e);}
    });

	 // запрос страницы с валидациями АСОП
  app.get("/agent", function (request, response) {
    try {
	   var users=[];
            response.render("inAgent.hbs", {
              users: users,
            });

    } catch (e) {
		console.log(e);
      var errit = [];
      errit.push(e);
      response.render("error.hbs", { errit: errit });
    }
  });  

	//Получение списка всех формуляров на текущую датту для просмотра рейсов
    app.post('/api/formulars_formTrips', jsonParser, function(req, res) {
        try {
                var fDate = req.body.tDate;
				var fFilii = req.body.tData4;
				//console.log(fFilii);
                var API = require('./getAPI.js');
                var result = new API(fDate, null, fFilii);//Заполнение конструктора значением даты и таб. номера
                result.getFormular(function (obj) {
                    if (obj != null) {
                        var users = JSON.parse(obj);
						var rez = users[0].vipFilialID;
						var descr = "A";
						switch ( true ) {
						  case (rez)>0 && (rez)<9:
							descr = "A";
							break;
						  case (rez)>8 && (rez)<13:
							descr = "B";
							break;
						  case (rez)>12 && (rez)<16:
							descr = "C";
							break;
						  default:
							descr = "A";
						}
						// действия водителей
						var usersFile = 'data/evends.json'; // файл driver
						var content = fs.readFileSync(usersFile, 'utf8');
						var usersdr = JSON.parse(content);
						usersdr.sort(function (a, b) {
							  if (a.timestamp > b.timestamp) {
								return 1;
							  }
							  if (a.timestamp < b.timestamp) {
								return -1;
							  }
							  // a равно b обратный порядок 
							  return -1;
							});
						
						
						
						// валидации
						usersFile = 'data/validations.json'; // файл валидаций
						content = fs.readFileSync(usersFile, 'utf8');
						var usersvalid = JSON.parse(content);
						
						
						for (var i=0; i < users.length; i++) {
							users[i] = mondutyTrips(users[i],descr,usersdr, usersvalid, fDate);  
							};
						//users.sort(compare);
										
						
                        res.send(users.sort(compare));
                    }else{
                        res.send(users);
                    }
                });
        }
        catch(e){console.log(e);}
    });
	
  
  

    //Получение списка всех формуляров на текущую датту для просмотра рейсов
    app.post('/api/formulars_formTripsFi', jsonParser,  function(req, res) {
        try {
            var todayStatus=[]; // возвращаемый массив по филиям	
			var fDate = req.body.tDate;
			var fFilii = req.body.tData4;
			var aFilii=[2,5,6,8,9,10,11,12,13,14,15]
            //for (var index = 0; index < aFilii.length; ++index) {
			//fFilii=aFilii[index];
				var API = require('./getAPI.js');
                var result = new API(fDate, null, fFilii);//Заполнение конструктора значением даты и таб. номера
                result.getFormular(async function (obj) {
                    if (obj != null) {
                        var users = JSON.parse(obj);
						var rez = users[0].vipFilialID;
						var descr = "A";
						switch ( true ) {
						  case (rez)>0 && (rez)<9:
							descr = "A";
							break;
						  case (rez)>8 && (rez)<13:
							descr = "B";
							break;
						  case (rez)>12 && (rez)<16:
							descr = "C";
							break;
						  default:
							descr = "A";
						}
						// действия водителей
						var usersFile = 'data/evends.json'; // файл driver
						//var content = fs.readFileSync(usersFile, 'utf8');
						var content = await loadDBEv(usersFile);
						var usersdr = JSON.parse(content);
						usersdr.sort(function (a, b) {
							  if (a.timestamp > b.timestamp) {
								return 1;
							  }
							  if (a.timestamp < b.timestamp) {
								return -1;
							  }
							  // a равно b обратный порядок
							  return -1;
							});



						// валидации
						usersFile = 'data/validations.json'; // файл валидаций
						//content = fs.readFileSync(usersFile, 'utf8');
						content = await loadDBVal(usersFile);
						var usersvalid = JSON.parse(content);
						
						//  начало БД вместо файла mondutyTrips
						var eventPeFile = 'data/eventPe.json'; // файл последних действий водителя ПЕ
						var eventPe = {}; // объявление obj последних действий водителя
						try{						
							var evpecont = await loadDBEv(eventPeFile);
							eventPe = JSON.parse(evpecont);
						}catch(e){
							var evpecont = fs.readFileSync(eventPeFile, 'utf8');
							eventPe = JSON.parse(evpecont);			
						};
						
						var validPeFile = 'data/validPe.json'; // файл последних валидаций ПЕ
						var validPe = {}; // объявление obj последних действий водителя
						try{						
							var vapecont = await loadDBVal(validPeFile);
							validPe = JSON.parse(vapecont);
						}catch(e){
							var vapecont = fs.readFileSync(validPeFile, 'utf8');
							validPe = JSON.parse(vapecont);			
						};
						
						var obPeFile = 'data/equipsPe.json'; // файл последнего оборудования ПЕ 
						var obPe = {}; // объявление obj последних сообщений оборудования
						try{						
							var vapecont1 = await loadDBEq(obPeFile);
							obPe = JSON.parse(vapecont1);						
						}catch(e){
							var vapecont1 = fs.readFileSync(obPeFile, 'utf8');
							obPe = JSON.parse(vapecont1);			
						};
						
						var tempDate = new Date();
							var tempTime = tempDate.getFullYear()+"-"+
								((tempDate.getMonth()+1)<10 ? "0"+(tempDate.getMonth()+1): (tempDate.getMonth()+1))+"-"+
								((tempDate.getDate())<10 ? "0"+(tempDate.getDate()): (tempDate.getDate()));
							if(fDate===tempTime){
								var tripsPeFile = 'data/peValidTrips.json';
							}
							else{
								var tripsPeFile = 'data/peValidTrips'+fDate+'.json';
							};
						var tripsPe = {}; // последние рейсы ПЕ
						try{							
							var tripscont = await loadDBTrips(tripsPeFile);
							tripsPe = JSON.parse(tripscont);
						}catch(e){
	                       //???
							try{
								var tripscont = fs.readFileSync(tripsPeFile, 'utf8');
								tripsPe = JSON.parse(tripscont);
							}catch(e){
								tripsPe = {};
							}
						};						
						// конец БД вместо файла mondutyTrips
						// сортировка по ПЕ
						users.sort(function (a, b) {
						  if (a.PENumPe > b.PENumPe) {
							return 1;
						  }
						  if (a.PENumPe < b.PENumPe) {
							return -1;
						  }
						  // a должно быть равным b
						  return 0;
						});
						
						var sumValFil=0;
						var sumNoValFil=0;
						var sumTripsFil=0;						
						var tempTrips=[];
						var separator="<";
						var peValYes={};
						var peTripsYes={};
						var tempPE=0;
						var tempNPE=0;
						for (var i=0; i < users.length; i++) {
							//console.log("cikl = "+i);
							users[i] = mondutyTrips(users[i],descr,usersdr, usersvalid, fDate, eventPe, validPe, obPe, tripsPe);
							//console.log(users[i]);
							//console.log("-----------------");
							if(tempPE!=users[i].PENumPe){
								if(users[i].Message_bad_validators){								
									if (Number.isInteger(users[i].Message_bad_validators)){
										sumValFil+=users[i].Message_bad_validators;
									};
								};
								if(users[i].smenTripCount.length>5){
									tempTrips=users[i].smenTripCount.split(separator);
									//console.log(tempTrips);
									tempTrips[0]=Number(tempTrips[0]);
									if (Number.isInteger(tempTrips[0])){
										sumTripsFil+=tempTrips[0];
									};
								};
								tempPE=users[i].PENumPe;
								tempNPE+=1;	
							};	
								if ((users[i].factWorkHeaderisClosed>0) && (users[i].Message_bad_validators===0)){
									try{
										sumNoValFil+=tempTrips[0];
									}
									catch(e){
										sumNoValFil+=1;
									};
								};
								
							
						};
							
						todayStatus.push(
						{
							"id_filii":  ""+users[0].vipFilialID,
							"timeAsdu": "0",
							"formularN": "0",
							"tDate":  users[0].factWorkHeaderDate,
							"tVid": descr,
							"tripsNoValid": sumTripsFil,
							"timeNotAsopF": "0.000",
							"timeNotValidAsopF": "0.000",
							"timeAsop": "0.000",
							"timeAsopVal": "0.000",
							"NValid": sumValFil,
							"NPENotAsop": [],
							"NPE": tempNPE,
							"NoPEVal": sumNoValFil
						}						
						);
							 
						//users.sort(compare);
						//console.log("len = "+users.length);
						//console.log("SumVal = "+sumValFil);
						//console.log("SumTrips = "+sumTripsFil);
						//console.log("filii = "+JSON.stringify(todayStatus[0]));
                        //res.send(users.sort(compare));
						res.send(todayStatus);
                    }else{
                        res.send(todayStatus);
                    }					
                });
			//} // цикл
			
        }
        catch(e){console.log(e);}
    });

	 //Просмотр рейсов по (вид транспорта, дата, борт ПЕ)
    app.post('/api/pe_date_formTrips', jsonParser, function(req, res) {
	try {
            var fDate = req.body.tDate;
			var fPE = req.body.tPE;
			var descr = req.body.tVid;
			var userf = {
				tPE : 1111,
				tDate : "2019-12-23",
				tVid : "B"
			};
			userf.tPE=fPE;
			userf.tDate=fDate;
			userf.tVid=descr;
			userf.tNoValid=0;
			var tempDate = new Date();
			var tempTime = tempDate.getFullYear()+"-"+
				((tempDate.getMonth()+1)<10 ? "0"+(tempDate.getMonth()+1): (tempDate.getMonth()+1))+"-"+
				((tempDate.getDate())<10 ? "0"+(tempDate.getDate()): (tempDate.getDate()));
			if(fDate===tempTime){
				var name = 'data/peValidTrips.json';
			}
			else{
				var name = 'data/peValidTrips'+fDate+'.json';
			};
			var tripsPeFile = name; // файл последних действий водителя
			var tripsPe = {}; // объявление obj последних действий водителя
			var tripscont = fs.readFileSync(tripsPeFile, 'utf8');
			tripsPe = JSON.parse(tripscont);
			var pef= fPE;
			var obdescr="";
			userf.PENumPe=fPE;

					if(tripsPe[descr+fPE]){
						var infot = JSON.stringify(tripsPe[descr+fPE]);
						var tripsArr=[];
						tripsArr=Object.keys(tripsPe[descr+fPE]);
						var tempDateH = new Date();
						var tempTimeH = tempDateH.getHours()+":"+(tempDateH.getMinutes()<10 ? "0"+tempDateH.getMinutes(): tempDateH.getMinutes());
						var infot="<h3 > Оперативний перелік виконаних рейсів РО="+fPE+", час "+(tempTimeH<10 ? "0"+tempTimeH: tempTimeH)+" : </h3><table>"+
									"(Всього рейсів = "+Number(tripsArr.length-2)+". "+
									"Всього валідацій = "+Number(tripsPe[descr+fPE].validCount)+")"+
											"<tr><th>№ Рейсу (факт)</th>"+
											"<th>Показники рейсу</th> ";
						for (var j = 2; j < tripsArr.length; j++){

							infot+="<tr><td>"+tripsArr[j]+"</td>"+"<td>"+JSON.stringify(tripsPe[descr+fPE][tripsArr[j]])+"</td></tr>";
						    try{
								var tkol = tripsPe[descr+fPE][tripsArr[j]].validTripsCount;
								if(tkol===0) userf.tNoValid=userf.tNoValid+1;
							}catch(e){
							};

						};
						try{
							var datetemp=tripsPe[descr+fPE].timestamp.slice(0,11);
							var re = new RegExp(datetemp, 'g');
						}catch(e){
							var datetemp="??";
							var re = new RegExp(datetemp, 'g');
						};
						infot+="</table>";
						userf.info = infot.replace(/,/g,". ")
									.replace(/:{/g," - ")
									.replace(/{"validCount"/g,"Всього валідацій")
									.replace(/"timestamp"/g,"Час останньої")
									.replace(/"eTimeB"/g,"Початок ")
									.replace(/"eTimeE"/g,"Кінець ")
									.replace(/"timestampTrips"/g,"Остання валідація ")
									.replace(/"validTripsCount"/g,"Кількість валідацій ")
									.replace(/}/g,"")
									.replace(/02:00/g,"")
									.replace(/.000/g,"")
									.replace(/\+/g,"")
									.replace(re,"")
									.replace(/"undefined"/g,"")

					}else{
						userf.info = "Інформація відсутня";
					};

					try{

						userf.Message_bad_validators = tripsPe[descr+fPE].validCount;
					}catch(e){
						userf.Message_bad_validators = "";

					};
				//}



				try{
					userf.smenTripCount=Number(tripsArr.length-2);
				}catch(e){
					userf.smenTripCount="";
				};
			res.send(userf);
		}
		catch(err)
		{
			userf.info = "День з інформацією відсутній";
			res.send(userf);
		};

    });


	async function qweryBDTimeTr(nameserv, namebd, log, pass, dater, peTemp) {
	var SqlConfig = {
		user: log,
		password: pass,
		server: nameserv,   //'10.11.1.117',
		database: namebd,   //'ASDU_V026',
		options:
        {
            encrypt: false
        }

	};
	try {
		_mssql.sql.init(SqlConfig);
	} catch (error) {
		console.log("Error Init")
	};
	try {
		 var sqlz=`SELECT   f.[ID]
							,p.NumPe
							,f.[PeID]
							,(CAST(b.[EndFact]-b.[BeginFact] AS time(7))) as delta
				FROM [ASDU_V026].[dbo].[FactWorkHeader] f,[ASDU_V026].[dbo].[PE] p , [ASDU_V026].[dbo].[FactWorkBody] b
				where f.PeID=p.ID and Date='${dater}' and  p.NumPe=${peTemp} and f.ID=b.HeaderID`;
				//where f.PeID=p.ID and Date='2020-05-25' and  p.NumPe=2652 and f.ID=b.HeaderID`;
		var data = await _mssql.sql.query(`${sqlz}`);
		return data;
	} catch (error) {
		console.error(error);
	}
};

	 //Просмотр втрат валидаций по (вид транспорта, дата, борт ПЕ)
    app.post('/api/pe_date_formVtrat', jsonParser,async function(req, res) {
		try {
			var fDate = req.body.tDate;
			var fPE = req.body.tPE;
			var typeTemp = req.body.tVid;
			console.log(fDate);
			console.log(fPE);
			console.log(typeTemp);
			if(typeTemp==='A'){
				console.log("==========Показники автобусу АСДУ та АСОП==========");
				var nameserv = "10.11.1.117";
				var namebd = "ASDU_V026";
				var log = 'Nar';
				var	pass = '123';
				var userASDU1= await qweryBDTimeTr(nameserv, namebd, log, pass, fDate, fPE);
				var descr = "A";
			}
			if(typeTemp==='B') {
				console.log("==========Показники тролейбусу АСДУ та АСОП==========");
				var nameserv = "10.11.1.115";
				var namebd = "ASDU_V026";
				var log = 'Nar';
				var	pass = '123';
				var userASDU1= await qweryBDTimeTr(nameserv, namebd, log, pass, fDate, fPE);
				var descr = "B";
			};
			if(typeTemp==='C'){
				console.log("==========Показники трамваю АСДУ та АСОП==========");
				var nameserv = "10.11.1.159";
				var namebd = "ASDU_V026";
				var log = 'ttc';
				var	pass = 'ttc_Admin';
				var userASDU1= await qweryBDTimeTr(nameserv, namebd, log, pass, fDate, fPE);
				var descr = "C";
			};

			console.log("Формулярів = "+userASDU1.length);
			var timeAsdu=0
			for (let i=0; i<userASDU1.length; i++){
				console.log((i+1)+". "+JSON.stringify(userASDU1[i]));
				try{
				console.log(("Час мл.сек = "+userASDU1[i].delta.getTime()));
				timeAsdu=timeAsdu+userASDU1[i].delta.getTime();
				}
				catch(e){
				   userASDU1[i].delta='1970-01-01T00:00:00.000Z';
				   console.log("Час мл.сек = "+Date.parse(userASDU1[i].delta));

				};
			};


		}
		catch(err)
		{
			var userf = {};
			userf.info = "День з інформацією відсутній";
			res.send(userf);
		};
			try {

			var userf = {
				tPE : 1111,
				tDate : "2019-12-23",
				tVid : "B"
			};
			userf.timeAsdu=timeAsdu;
			userf.tPE=fPE;
			userf.tDate=fDate;
			userf.tVid=descr;
			userf.tripsNoValid=0;
			var tempDate = new Date();
			var tempTime = tempDate.getFullYear()+"-"+
				((tempDate.getMonth()+1)<10 ? "0"+(tempDate.getMonth()+1): (tempDate.getMonth()+1))+"-"+
				((tempDate.getDate())<10 ? "0"+(tempDate.getDate()): (tempDate.getDate()));
			if(fDate===tempTime){
				var name = 'data/peValidTrips.json';
			}
			else{
				var name = 'data/peValidTrips'+fDate+'.json';
			};
			var tripsPeFile = name;
			var tripsPe = {};
			var tripscont = fs.readFileSync(tripsPeFile, 'utf8');
			tripsPe = JSON.parse(tripscont);

			if(tripsPe[descr+fPE]){
				var infot = JSON.stringify(tripsPe[descr+fPE]);
				var tripsArr=[];
				tripsArr=Object.keys(tripsPe[descr+fPE]);
				var tempDateH = new Date();
				var tempTimeH = tempDateH.getHours()+":"+(tempDateH.getMinutes()<10 ? "0"+tempDateH.getMinutes(): tempDateH.getMinutes());
				var infot="<h3 > Оперативний перелік виконаних рейсів РО="+fPE+", час "+(tempTimeH<10 ? "0"+tempTimeH: tempTimeH)+" : </h3><table>"+
							"(Всього рейсів = "+Number(tripsArr.length-2)+". "+
							"Всього валідацій = "+Number(tripsPe[descr+fPE].validCount)+")"+
									"<tr><th>№ Рейсу (факт)</th>"+
									"<th>Показники рейсу</th> ";
				var deltaPeAsop=0
				for (var j = 2; j < tripsArr.length; j++){
					infot+="<tr><td>"+tripsArr[j]+"</td>"+"<td>"+JSON.stringify(tripsPe[descr+fPE][tripsArr[j]])+"</td></tr>";
					try{
						var tkol = tripsPe[descr+fPE][tripsArr[j]].validTripsCount;
						//console.log(tkol);
						var tt={};
						tt=(tripsPe[descr+fPE][tripsArr[j]]);

						for(var key in tt) {
							var deltaTemp=0
							if(tt[key].eTimeB && tt[key].eTimeE ){
								try{
								deltaTemp=Date.parse(tt[key].eTimeE)-Date.parse(tt[key].eTimeB);
								deltaPeAsop=deltaPeAsop+deltaTemp;
								}
								catch(e){
									deltaPeAsop=deltaPeAsop+0;
								}

							}
						}

						if(tkol===0) userf.tripsNoValid=userf.tripsNoValid+1;

					}catch(e){
					};

				};
				userf.timeAsop=deltaPeAsop;
				try{
					var datetemp=tripsPe[descr+fPE].timestamp.slice(0,11);
					var re = new RegExp(datetemp, 'g');
				}catch(e){
					var datetemp="??";
					var re = new RegExp(datetemp, 'g');
				};
				infot+="</table>";
				userf.info = infot.replace(/,/g,". ")
							.replace(/:{/g," - ")
							.replace(/{"validCount"/g,"Всього валідацій")
							.replace(/"timestamp"/g,"Час останньої")
							.replace(/"eTimeB"/g,"Початок ")
							.replace(/"eTimeE"/g,"Кінець ")
							.replace(/"timestampTrips"/g,"Остання валідація ")
							.replace(/"validTripsCount"/g,"Кількість валідацій ")
							.replace(/}/g,"")
							.replace(/02:00/g,"")
							.replace(/.000/g,"")
							.replace(/\+/g,"")
							.replace(re,"")
							.replace(/"undefined"/g,"")

			}else{
				userf.info = "Інформація відсутня";
			};

			try{
				userf.validators = tripsPe[descr+fPE].validCount;
			}catch(e){
				userf.validators = "";

			};

			userf.infotime="Час в АСДУ = "+timeAsdu/3600000 + ". Час в АСОП = "+deltaPeAsop/3600000;//delete
			try{
				userf.smenTripCount=Number(tripsArr.length-2);
			}catch(e){
				userf.smenTripCount="";
			};
			res.send(userf);
		}
		catch(err)
		{
			userf.info = "День з інформацією відсутній";
			res.send(userf);
		};
    }
	);

	//Получение списка всех турникетов на текущую дату для просмотра
     app.post('/api/formularst_form', jsonParser,async function(req, res) {
        try {
                var fDate = req.body.tDate;
				var fFilii = req.body.tData4;
				var validPeFile = 'data/LocationsM1.json'; // файл с описанием расположения турникетов
				var descr = "";
				var usersdr = "";
				if (fFilii==="M1") validPeFile = 'data/LocationsM1.json';
				if (fFilii==="M2") validPeFile = 'data/LocationsM2.json';
				if (fFilii==="M3") validPeFile = 'data/LocationsM3.json';
				if (fFilii==="Mon") validPeFile = 'data/LocationsAll.json';
				if (fFilii==="ST1") validPeFile = 'data/LocationsSTBo.json';
				if (fFilii==="ST2") validPeFile = 'data/LocationsSTTr.json';
				if (fFilii==="ST3") validPeFile = 'data/LocationsSTEl.json';
				if (fFilii==="STMon") validPeFile = 'data/LocationsSTAll.json';

						var obj = fs.readFileSync(validPeFile, 'utf8');
					    //var obj = await loadDBVal(validPeFile);
						var users = JSON.parse(obj);

						// валидации
						usersFile = 'data/validations.json'; // файл валидаций
						content = await loadDBVal(usersFile);
						var usersvalid = JSON.parse(content);

						var eventPeFile = 'data/eventPe.json'; // файл последних действий водителя
						var eventPe = {}; // объявление obj последних действий водителя
						var evpecont = await loadDBEv(eventPeFile);
						eventPe = JSON.parse(evpecont);

						var validPeFile = 'data/validPe.json'; // файл последних валидаций
						var validPe = {}; // объявление obj последних валидаций ПЕ
						var vapecont = await loadDBVal(validPeFile);
						validPe = JSON.parse(vapecont);

						var chobPeFile = 'data/configTurnikets.json'; // файл изменения состояния оборудования
						var chobPe = {}; // последние изменения сообщений оборудования по ПЕ
						chvapecont = fs.readFileSync(chobPeFile, 'utf8');
						chobPe = JSON.parse(chvapecont);

						var chobPeFileP = 'data/configTurniketsPlan.json'; // файл изменения состояния оборудования план
						var chobPeP = {}; // последние изменения сообщений оборудования по ПЕ
						chvapecontp = fs.readFileSync(chobPeFileP, 'utf8');
						chobPeP = JSON.parse(chvapecontp);

						var obPeFile = 'data/equipsPe.json'; // файл состояния оборудования
						var obPe = {}; // объявление obj последних сообщений оборудования по ПЕ
						vapecont = await loadDBEq(obPeFile);
						obPe = JSON.parse(vapecont);




						for (var i=0; i < users.length; i++) {
							users[i] = mondutyM(users[i],descr,usersdr, usersvalid, eventPe, validPe, obPe, chobPe,chobPeP );
							};
                     res.send(users);
                    //}
                //});

        }
        catch(e){console.log(e);}
    });

    app.post('/api/climatyk_form', jsonParser, function(req, res) {
        try {
                var fDate = req.body.tDate;
                var API = require('./getAPI.js');
                var result = new API(fDate, null);//Заполнение конструктора значением даты и таб. номера
                result.getClimatyk(function (obj) {
                    if (obj != null) {
                        var users = JSON.parse(obj);
                        res.send(users);
                    }else{
                        res.send(users);
                    }
                });
        }
        catch(e){console.log(e);}
    });

    app.post('/api/climatyk_formA', jsonParser, function(req, res) {
        try {
				var fDate = req.body.tDate;
				var fNum = req.body.tNum;
				var fFilii = req.body.tFilii;
                var API = require('./getAPI.js');
                var result = new API(fDate, fNum, fFilii);//Заполнение конструктора значением даты и PE
                result.getClimatykA(function (obj) {
                    if (obj != null) {
                        var users = JSON.parse(obj);
                        res.send(users);
                    }else{
                        res.send(users);
                    }
                });
        }
        catch(e){console.log(e);}
    });

    app.post('/api/formulars_med', jsonParser, function(req, res) {
        try {
            var fDate = req.body.tDate;
            var API = require('./getAPI.js');
            var result = new API(fDate, null);//Заполнение конструктора значением даты и таб. номера
            result.getMed(function (obj) {
                if(obj !== null)
                    res.send(obj);
            });
        }
        catch(e){console.log(e);}
    });

	app.post('/api/formulars_vtk', jsonParser, function(req, res) {
        try {
            var fDate = req.body.tDate;
            var API = require('./getAPI.js');
            var result = new API(fDate, null);//Заполнение конструктора значением даты и таб. номера
            result.getVtk(function (obj) {
                if(obj !== null)
                    res.send(obj);
            });
        }
        catch(e){console.log(e);}
    });

    app.post('/api/formulars_fuel', jsonParser, function(req, res) {
        try {
            var fDate = req.body.tDate;
            var API = require('./getAPI.js');
            var result = new API(fDate, null);//Заполнение конструктора значением даты и таб. номера
            result.getFuel(function (obj) {
                if(obj !== null)
                    res.send(obj);
            });
        }
        catch(e){console.log(e);}
    });

    //Перенаправление на список всех формуляров в корне URL
    app.get('/', function(request, response) {
		 var content = fs.readFileSync('data/filii.json', 'utf8');
         var repps = JSON.parse(content);
        try {
            response.render('inFormulars.hbs', {
				 repps: repps,
		 });
        } catch (e) {
            var errit = [];
            errit.push(e);
            response.render('error.hbs', { errit: errit });
        }
    });

	//Перенаправление на список всех формуляров в корне URL
    app.get('/intrips', function(request, response) {
		 var content = fs.readFileSync('data/filii.json', 'utf8');
         var repps = JSON.parse(content);
        try {
            response.render('inMonTrips.hbs', {
				 repps: repps,
		 });
        } catch (e) {
            var errit = [];
            errit.push(e);
            response.render('error.hbs', { errit: errit });
        }
    });
	
	//текущий отчет на сегодня 
    app.get('/intripsD', function(request, response) {
		 var content = fs.readFileSync('data/filii.json', 'utf8');
         var repps = JSON.parse(content);
        try {
            response.render('inRepportKpt.hbs', {
				 repps: repps,
		 });
        } catch (e) {
            var errit = [];
            errit.push(e);
            response.render('error.hbs', { errit: errit });
        }
    });

	//Перенаправление на турникеты метро
    app.get('/metro', function(request, response) {
		 var content = fs.readFileSync('data/turnikets.json', 'utf8');
         var repps = JSON.parse(content);
        try {
            response.render('inFormularsMetro.hbs', {
				 repps: repps,
		 });
        } catch (e) {
            var errit = [];
            errit.push(e);
            response.render('error.hbs', { errit: errit });
        }
    });

	//Перенаправление на турникеты метро
    app.get('/metroconfig', function(request, response) {
		 var content = fs.readFileSync('data/turnikets.json', 'utf8');
         var repps = JSON.parse(content);
        try {
            response.render('inMetroConfig.hbs', {
				 repps: repps,
		 });
        } catch (e) {
            var errit = [];
            errit.push(e);
            response.render('error.hbs', { errit: errit });
        }
    });


	//Перенаправление на турникеты скоросного трамвая
    app.get('/st', function(request, response) {
		 var content = fs.readFileSync('data/turniketsST.json', 'utf8');
         var repps = JSON.parse(content);
        try {
            response.render('inFormularsST.hbs', {
				 repps: repps,
		 });
        } catch (e) {
            var errit = [];
            errit.push(e);
            response.render('error.hbs', { errit: errit });
        }
    });

	//Перенаправление на турникеты скоросного трамвая
    app.get('/stconfig', function(request, response) {
		 var content = fs.readFileSync('data/turniketsST.json', 'utf8');
         var repps = JSON.parse(content);
        try {
            response.render('inSTConfig.hbs', {
				 repps: repps,
		 });
        } catch (e) {
            var errit = [];
            errit.push(e);
            response.render('error.hbs', { errit: errit });
        }
    });

	//Мониторинг за турникетами метро
    app.get('/metroMon', function(request, response) {
		 var content = fs.readFileSync('data/turnikets.json', 'utf8');
         var repps = JSON.parse(content);
        try {
            response.render('inFormularsMetroMon.hbs', {
				 repps: repps,
		 });
        } catch (e) {
            var errit = [];
            errit.push(e);
            response.render('error.hbs', { errit: errit });
        }
    });

	//Мониторинг за турникетами скоросного трамвая
    app.get('/stMon', function(request, response) {
		 var content = fs.readFileSync('data/turniketsST.json', 'utf8');
         var repps = JSON.parse(content);
        try {
            response.render('inFormularsSTMon.hbs', {
				 repps: repps,
		 });
        } catch (e) {
            var errit = [];
            errit.push(e);
            response.render('error.hbs', { errit: errit });
        }
    });

	//Перенаправление на список всех формуляров в корне URL
    app.get('/vn', function(request, response) {
		 var content = fs.readFileSync('data/filii.json', 'utf8');
         var repps = JSON.parse(content);
        try {
            response.render('inFormularsN.hbs', {
				 repps: repps,
		 });
        } catch (e) {
            var errit = [];
            errit.push(e);
            response.render('error.hbs', { errit: errit });
        }
    });

	app.get('/climatyk', function(request, response) {
        try {
            var content = fs.readFileSync('data/filii.json', 'utf8');
            var repps = JSON.parse(content);
            response.render('inClimatyk.hbs', {
                repps: repps,
            });
        } catch (e) {
            var errit = [];
            errit.push(e);
            response.render('error.hbs', { errit: errit });
        }
    });

	app.post('/climatyk',urlencodedParser, function(request, response) {
        try {
            var data3 = request.body.datebegin;    //текущая дата расчёта
			var data4 = request.body.selectReport;   //текущая филия
			var data2  = request.body.tNum;  //PE
			var dataAll = data2+"d"+data3+"d"+data4;//генерируем строку для передачи одним параметром
		    var url = "/formeshl"+dataAll
			response.redirect(url);
        } catch (e) {
            var errit = [];
            errit.push(e);
            response.render('error.hbs', { errit: errit });
        }
    });

	 // запрос страницы для запроса климатического оборудования 2335
    app.get('/greateeshldiag', function(request, response) {
        try {
            var content = fs.readFileSync('data/filii.json', 'utf8');
            var repps = JSON.parse(content);
            response.render('inESHLTbNdiag.hbs', {
                repps: repps,
            });
        } catch (e) {
            var errit = [];
            errit.push(e);
            response.render('error.hbs', { errit: errit });
        }
    });


	app.get('/greateeshl', function(request, response) {
        try {
            var content = fs.readFileSync('data/filii.json', 'utf8');
            var repps = JSON.parse(content);
            response.render('inESHLTbN.hbs', {
                repps: repps,
            });
        } catch (e) {
            var errit = [];
            errit.push(e);
            response.render('error.hbs', { errit: errit });
        }
    });

    app.get('/api/eshl_old/:id/:tDate/:tNum', function(req, res) {
        var id = req.params.id; // получаем id
        var dt = req.params.tDate; // получаем id
        var nm = req.params.tNum; // получаем id
        var API = require('./getAPI.js');
        var result = new API(dt, nm);//Заполнение конструктора значением даты БЕЗ таб. номера
        result.getFormular(function (obj) {
            var users = JSON.parse(obj);
            var user = null;
            for (var i = 0; i < users.length; i++) {
                if (users[i].id == id) {
                    user = users[i];
                    break;
                }
            }
            if (user) {
                res.send(user);
            } else {
                res.status(404).send();
            }
        });
    });

    app.get('/api/eshl/:id/:tDate/:tNum', function(req, res) {
        var id = req.params.id; // получаем id
        var content = fs.readFileSync(usersFile, 'utf8');
        var users = JSON.parse(content);
        var user = null;
        for (var i = 0; i < users.length; i++) {
            if (users[i].id == id) {
                user = users[i];
                break;
            }
        }
        if (user) {
            res.send(user);
        } else {
            res.status(404).send();
        }
    });

    // переход к подробностям формуляров со страницы списка формуляров
    app.get('/formeshl:parms', function(req, res) {
        try {
            var parms = req.params.parms;//получаем парметр строки
            var splitParms = parms.split('d');//разбиваем дату с табельным номером
            var tDate1="";
			tDate=tDate1+splitParms[1];
			tFilii=tDate1+splitParms[2];
			res.render('inClimatykA.hbs', {
                tDate: tDate,
				tFilii : tFilii,
                tNum: splitParms[0]

            })
        } catch (e) {
            var errit = [];
            errit.push(e);
            res.render('error.hbs', { errit: errit });
        }
    });

     app.get('/formeshldiag:parms', function(req, res) {
        try {
            var parms = req.params.parms;//получаем парметр строки
            var splitParms = parms.split('d');//разбиваем дату с табельным номером
            var tDate1="";
			tDate=tDate1+splitParms[1];
			tFilii=tDate1+splitParms[2];
			res.render('inClimatykA.hbs', {
                tDate: tDate,
				tFilii : tFilii,
                tNum: splitParms[0]

            })
        } catch (e) {
            var errit = [];
            errit.push(e);
            res.render('error.hbs', { errit: errit });
        }
    })

    app.post('/createeshl', urlencodedParser, function(request, res) {
        try {
            var mesTemp = '';
            var filiiName = request.body.selectReport;
			var idFilii = request.body.selectReport;
            var formDate = request.body.datebegin;
			var formDateEnd = request.body.dateend;
            var formTNum = request.body.tNum;
            if (filiiName && formDate && formTNum && formDateEnd) {
				res.render('inEshlttc.hbs', {
                    tDate : formDate,
					tDateEnd : formDateEnd,
                    tNum: formTNum,
					tIDF: idFilii
                })
            } else {
                var errit = [];
                errit.push('Не всі поля заповнені! Перевірте та спробуйте ще раз.');
                res.render('error_ESHL', { errit: errit });
            }
        } catch (e) {
            var errit = [];
            errit.push(e);
            res.render('error', { errit: errit });
        }
    });

    app.post('/createeshl2', jsonParser, function(request, res) {
		var formDate = request.body.datebegin;
		var formDateEnd = request.body.dateend;
        var formTNum = request.body.tNum;
		var formIDF = request.body.idf;
        var usersn = calculatePeriod(request,res);
    });

    app.post('/api/eshl', jsonParser, function(req, res) {
        if (!req.body) return res.sendStatus(400);
        var userName = req.body.name;
        var userTypeFuel = req.body.typeFuel;
        var userAmount = req.body.amount;
        var userDateGreate = req.body.dateGreate;
        var user = {
            name: userName,
            typeFuel: userTypeFuel,
            amount: userAmount,
            dateGreate: userDateGreate,
        };
        var data = fs.readFileSync(usersFile, 'utf8');
        var users = JSON.parse(data);
        if (users.length == 0) {
            var id = 0;
        } else {
            var id = Math.max.apply(
                Math,
                users.map(function(o) {
                    return o.id;
                })
            );
        }
        user.id = id + 1;
        users.push(user);
        var data = JSON.stringify(users);
        fs.writeFileSync(usersFile, data);
        saveDB(usersFile, data);
    });

    // удаление по id
    app.delete('/api/eshl/:id', function(req, res) {
        var id = req.params.id;
        var data = fs.readFileSync(usersFile, 'utf8');
        var users = JSON.parse(data);
        var index = -1;
        // находим индекс в массиве
        for (var i = 0; i < users.length; i++) {
            if (users[i].id == id) {
                index = i;
                break;
            }
        }
        if (index || index === 0) {
            // удаляем из массива по индексу
            var user = users.splice(index, 1)[0];
            var data = JSON.stringify(users);
            fs.writeFileSync(usersFile, data);
            res.send(user);
            saveDB(usersFile, data);
        } else {
            res.status(404).send();
        }
    });

	// изменение
    app.put('/api/eshl', jsonParser, function(req, res) {
        if (!req.body) return res.sendStatus(400);
        var userId = req.body.id;
        var userName = req.body.name;
        var userTypeFuel = req.body.typeFuel;
        var userAmount = req.body.amount;
        var userDateGreate = req.body.dateGreate;
        var data = fs.readFileSync(usersFile, 'utf8');
        var users = JSON.parse(data);
        var user;
        for (var i = 0; i < users.length; i++) {
            if (users[i].id == userId) {
                user = users[i];
                break;
            }
        }
        if (user) {
            user.name = userName;
            user.typeFuel = userTypeFuel;
            user.amount = userAmount;
            user.dateGreate = userDateGreate;
            var data = JSON.stringify(users);
            fs.writeFileSync(usersFile, data);
            res.send(user);
            saveDB(usersFile, data);
        } else {
            res.status(404).send(user);
        }
    });

	function calculatePeriod(request,res){
		var result =[];
		var tempDate;
		var content =[];
        var tNum = request.body.tNum;
		var tIDF = request.body.idf;
		var dateB =new Date(request.body.datebegin);
		var dateE =new Date(request.body.dateend);
		var tempValueN = 0;
		var tempValueC = 0;
		var tempDate1;
		while (dateB <= dateE) {
			tempDate = fileASDUName(dateE);
			tempDate1 = tempDate
			calculateAPI(tempDate1, tNum, tIDF, dateE, dateB, function (num) {
				var temp = [ tempDate1, num[1], num[0], num[2], num[3] ];
				result.push(temp);
				if (dateB > dateE)  {res.send(result);
				dateE= getDateAgo(dateE, 10);}
			});
			dateE= getDateAgo(dateE, 1);
		}

}


 //Получение данных для запроса
    function calculateAPI(tDate, tNum, tIDF, t1, t2, callback ) {
		var idUrl = "http://10.11.1.114/" + "asdu/api/alarm/" + tDate + "/"+ tNum +"/"+tIDF;
		var strUrl = idUrl.replace(/\/0,/g, "/");//чистим строку для запроса от муссора jquery
		calculate( strUrl,  function (num){
			console.log("api" + num); callback(num)}
		 );
    }

   //Запрос к АПИ
    function calculate( test, callback) {
        var temp = [0,0,0,0,0];
        var urlIn = test;
        var url = encodeURI(urlIn);
        require('request')(url, function(error, response, body) {
                var str = JSON.parse(body);
				var temp = otv(str);
				console.log("calc"+temp);
                callback(temp)
            })
    }
    function otv(users) {
       if (users != null) {
			console.log("otvet1");
			var tempValueN = 0;   // печка
			var tempValueC = 0;   // кондиціонер
			var tempValueNR  = 0; // выключено
			var tempValueRem = 0;  // ремонт
			for (var i = 0; i < users.length; i++) {
				switch (users[i].A2) {
					  case 0:
						tempValueN  =tempValueN + 0;
						tempValueC  =tempValueC + 0;
						tempValueNR  =tempValueNR + 1;
						tempValueRem =tempValueRem + 0;
						break;
					  case 1:
						tempValueN  =tempValueN + 1;
						tempValueC  =tempValueC + 0;
						tempValueNR  =tempValueNR + 0;
						tempValueRem =tempValueRem + 0;
						break;
					  case 2:
						tempValueN  =tempValueN + 0;
						tempValueC  =tempValueC + 1;
						tempValueNR  =tempValueNR + 0;
						tempValueRem =tempValueRem + 0;
						break;
					  case 3:
						tempValueN  =tempValueN + 1;
						tempValueC  =tempValueC + 1;
						tempValueNR  =tempValueNR + 0;
						tempValueRem =tempValueRem + 0;
						break;
					  default:
						tempValueN  =tempValueN + 0;
						tempValueC  =tempValueC + 0;
						tempValueNR  =tempValueNR + 0;
						tempValueRem =tempValueRem + 1;
				}
			}
		var temp = [ tempValueC, tempValueN, tempValueNR, tempValueRem];
		console.log("otvet" + temp);
	}else{
			tempValueN = 0;
			tempValueC = 0;
			tempValueNR = 0;
			tempValueRem = 0;
		}
		var temp = [ tempValueC, tempValueN, tempValueNR, tempValueRem];
		console.log("otvet" + temp);
		return  temp;

    }

	// дата days дней назад
	function getDateAgo(date, days) {
	  var dateCopy = date;
	  dateCopy.setDate(date.getDate() - days);
	  return dateCopy;
	}

	// наименования файла расписание АСДУ автобус
	function fileASDUName(dateB){
		var mesTemp, dayTemp;
		if ((dateB.getUTCMonth()+1)<10){
			mesTemp ="0"+(dateB.getUTCMonth()+1)
		}
		else{
			mesTemp =(dateB.getUTCMonth()+1)
		};
		if (dateB.getDate()<10){
			dayTemp ="0"+dateB.getDate()
		}
		else{
			dayTemp =dateB.getDate()
		};
		return dateB.getFullYear()+"-"+mesTemp+"-"+dayTemp;
	};
}
