// 20201207` сервіси для посилань меню + сервис архив оборудования
// 20200921` сервіси для посилань меню + план конфигурации турникетов
// 20180814 сервіси для посилань меню
module.exports = (app) => {
  var bodyParser = require("body-parser");
  var fs = require("fs");
  var usersFile = "data/users.json"; // файл пользователей
  var refValidateFile = "data/validations.json"; // файл по валидациям
  var refCardsFile = "data/cards.json"; // файл по билетным продуктам
  var refEvendsFile = "data/evends.json"; // файл события водителей
  var jsonParser = bodyParser.json();

  const User = require("../models/dataUser");

  //var fs = require('fs');
    var fetch=require("node-fetch");
	var peConfigFile = 'data/configTurniketsPlan.json'; // файл конфигураций выход для мониторинга
	var content = fs.readFileSync(peConfigFile, 'utf8');
	var peConfig  = JSON.parse(content);
	peConfig={};
	
    var peConfig1 = 'data/inPlanTurn.json'; // файл конфигураций вход сервис для мониторинга
	var contentp1 = fs.readFileSync(peConfig1, 'utf8');
	var inPlan  = JSON.parse(contentp1);
	

	
    // получения списка сотрудников группы Киев
    async function getPlan(){	
		try{		 
			//var response = await fetch("http://inventoryakp.kpt.kiev.ua/api/get-asop/PYilplp3b2lsjAQtVTBK9nYWDMrZJYi5", {
			var response = await fetch("http://193.23.225.178:3001/api/get-asop/test/", {				
			'method': 'Get',
				 'Host': "http://inventoryakp.kpt.kiev.ua",
				 'Accept-Encoding': 'gzip,deflate',
				 'Connection': 'Keep-Alive',
				 headers: {
							'Content-Type': 'application/json; charset=UTF-8',
							'Authorization' : 'User XF03dCx0vc10+YJESlINEVu1TsiEICH16g5WxAMYOqg='
						}
				
				
			}); 		
			var data = await response.json();

		return data;
		}
		catch(error){
			throw new Error("Не вдалося отримати дані з планом конфігурації ");		 
		}	
    }
	
	
	
	function confirmConfig(pe, trips, timeData, validationArr, Station) {
			try{
			
				var result = false;
				// pe
				try{
					peConfig[pe].note_time=timeData;
					//console.log("валид.ПЕ "+peConfig[pe].validCount);			
					result = true;
				}catch(e){
					//console.log("1. Создан вестибуль "+pe);
					peConfig[pe]={};					
					peConfig[pe].note_time=timeData;
					peConfig[pe].note_time_=timeData;
					//peConfig[pe][trips].info="Новий вестибуль "+pe+"<br>";
					peConfig[pe].info="Новий вестибуль "+pe+", "+timeData+"<br>";
					result = false;
				};
				
				// 
				try{				
					peConfig[pe][trips].timestamp=timeData;					
					result = true;
				}catch(e){
					//console.log("2. Создан контролер. "+trips);
					peConfig[pe][trips]={};				
					peConfig[pe][trips].timestamp=timeData;
					peConfig[pe][trips].timestamp_=timeData;
					peConfig[pe][trips].info="Новий контролер "+trips+", "+timeData+"<br>";
					//console.log("3. Создан массив валидаторов "+validationArr);				
					peConfig[pe][trips].validations=validationArr;
					peConfig[pe][trips].validations_=validationArr;
					
					result = false;					
				};
				
			///*
				try{
					
					if(result){										
						//console.log("111"+pe+" - "+trips+" - "+ timeData+" - "+ validationArr);
							if(validationArr.length===peConfig[pe][trips].validations.length){
								//console.log("1111");
								for (var i = 0; i < validationArr.length; i++) {
									//console.log(peConfig[pe][trips].validations.indexOf(validationsArr[i]));
									//console.log(validationArr[i]);
									//console.log(peConfig[pe][trips].validations.indexOf("24701"));
								  if (peConfig[pe][trips].validations.indexOf(validationArr[i]) === -1) {								
									result = false;
									peConfig[pe][trips].info="Валідатор - "+validationArr[i]+", "+timeData+"<br>";
									peConfig[pe][trips].timestamp_=peConfig[pe][trips].timestamp;
									peConfig[pe][trips].timestamp=timeData;
									peConfig[pe][trips].validations_=peConfig[pe][trips].validations;
									peConfig[pe][trips].validations=validationArr;
								  }
								}
							}else{					
								result = false;
								peConfig[pe][trips].info="Не співпадає кількість валідаторів"+", "+timeData+"<br>";
								peConfig[pe][trips].timestamp_=peConfig[pe][trips].timestamp;
								peConfig[pe][trips].timestamp=timeData;
								peConfig[pe][trips].validations_=peConfig[pe][trips].validations;
								peConfig[pe][trips].validations=validationArr;
							}
						
						//}	
					}
					
				}catch(e){
					//console.log("4. Помилка створення массиву валідаторів ");
					//console.log(e);
					peConfig[pe][trips].validations=validationArr;
					peConfig[pe][trips].validations_=validationArr;
					result = false;
				};
				
				
            //*/   				
				
				
				
				return result;
			}
			catch(e){
				console.log('----------Error confirm config----------');
				console.log("Помилка - Вестибуль="+Station+pe+" - "+trips+" - "+ timeData+" - "+ validationArr);
				return result;
			}
		}
		
	// переход на новые транспортные сутки
	function saveConfig() {
			try{	
				var result = false;
				var data = JSON.stringify(peConfig);			
				fs.writeFileSync(peConfigFile, data);
				result = true;
				
				var result = false;
				var data = JSON.stringify(inPlan);			
				fs.writeFileSync(peConfig1, data);
				result = true;
				
				return " Сформовано Планову конфігурацію турнікетів станцій ";
			}catch(e){
				console.log('Error - Планової конфігурації турнікетів станцій');
				//console.log(e);
				return result;
			}
		}
		
	// Функція СОРТУВАННЯ станция+контролер
	function compareJson(a, b) {
		var aSize = a.Locatio_ID;
		var bSize = b.Locatio_ID;
		var aLow = a.Number_RIDANGO;
		var bLow = b.Number_RIDANGO;
		return (aSize < bSize) ? -1 : (aSize > bSize) ? 1 : (aLow < bLow) ? -1 : (aLow > bLow) ? 1 : 0;
	}; 

	 // начало запроса плана конфигурации турникетов
	app.get('/planTurnSt',function(request, response) {
			try {
				//var content = fs.readFileSync(refValidateFile, 'utf8');
				var users = [1,2];
					response.render('inPlanTurnStart.hbs', {	
					users: users,
				});
			} catch (e) {
				var errit = [];
				errit.push(e);
				response.render('error.hbs', { errit: errit });
			}
	});
	  
		
	  
	  // запрос плана конфигурации турникетов
	app.get('/planTurn',async function(request, response) {
	try {		
		var users = [];
		var erN =0;
		//users.push({"id" : ++erN, "factWorkHeaderID" : "111"})
				
		var contPlan = await getPlan();
		//var inPlan1  = JSON.parse(contPlan);
		//console.log(contPlan.length);
		
		inPlan={};
		inPlan=contPlan;
		 
		 inPlan=inPlan.sort(compareJson);
		 var planTurn=[];   // перечень номеров валидаторов 
		 var loc_id; //вестибуль
		 var loc_name; //вестибуль название
		 var num_r;  // контролер
		 var turn;   // турникет
		 loc_id=inPlan[0].Locatio_ID;
		 loc_name=inPlan[0].Station;
		 num_r=inPlan[0].Number_RIDANGO;	 
		// console.log("h   "+loc_id+"h   "+num_r);	
		for (var i = 0; i < inPlan.length; i++) {
			 if(inPlan[i].Locatio_ID===loc_id && inPlan[i].Number_RIDANGO=== num_r ){
					planTurn.push(inPlan[i].PLACE_ID);					
			 }else{
					 var peT = "V"+loc_id;   //вестибуль
					 var tripsT = num_r; //контролер	  
					 let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
					 let localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 19);
					 let local = localISOTime;
					 var timeDataT = local;  //время посылки
					 try{
					 if (planTurn.length>0){
						var validationArrT = planTurn;   // перечень номеров валидаторов 
					 }else{
						var validationArrT =[];
					 };
					 }catch(e){
						 var validationArrT =[];
					 };
					 try{
					if ((typeof loc_id === "undefined") || (typeof num_r === "undefined") || (typeof validationArrT === "undefined"))
					//if ((typeof peT === "undefined") || (typeof tripsT === "undefined"))	
						
					{
						users.push({"id" : ++erN, "factWorkHeaderID" : loc_id, "name" : loc_name, "PENumPe":tripsT,"driversTabNum":validationArrT})
					}else{						 
						confirmConfig(peT, tripsT, timeDataT, validationArrT, inPlan[i-1].Station);
					}
					 }
					 catch(e){
						 console.log("Помилкові дані: Вестибуль - "+peT+" , контролер - "+tripsT) 
					 };
					 loc_id=inPlan[i].Locatio_ID;
					 loc_name=inPlan[i].Station;
					 num_r =inPlan[i].Number_RIDANGO;	  
					 planTurn=[];
					 planTurn.push(inPlan[i].PLACE_ID);
			 };	 
						 
		};
			var peT = "V"+loc_id; 
			var tripsT = num_r; //контролер	  
			let tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
			let localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 19);
			let local = localISOTime;
			var timeDataT = local;  //время посылки
			var validationArrT = planTurn;   // перечень номеров валидаторов 
			
			if ((typeof loc_id === "undefined") || (typeof num_r === "undefined") || (typeof validationArrT === "undefined"))
				{
					users.push({"id" : ++erN, "factWorkHeaderID" : loc_id, "name" : loc_name, "PENumPe":tripsT,"driversTabNum":validationArrT})
				}else{						 
					confirmConfig(peT, tripsT, timeDataT, validationArrT, inPlan[i-1].Station);
				};
		
		    /*
			var usersFile = 'data/LocationsAll.json'; // файл с остановками метро
			var content = fs.readFileSync(usersFile, 'utf8');
			var usersM = JSON.parse(content);
			users.push({"id" : " ", "factWorkHeaderID" : "Відсутні зупинки метро", "name" : " ", "PENumPe":" ","driversTabNum":" "})
			for (var i = 0; i < usersM.length; i++) {
			 	
			
			};
		    */ 
		
		
		/* запись файла с новыми данными*/
		//console.log(saveConfig());
		users.push({"id" : " ", "factWorkHeaderID" : saveConfig(), "name" : " ", "PENumPe":" ","driversTabNum":" "})
				
				
			
			response.send(users);
		} catch (e) {
			var errit = [];
			errit.push(e);
			response.render('error.hbs', { errit: errit });
		}
	});
  
  // запрос страницы с пользователями
  app.get("/", function (request, response) {
    try {
      var content = fs.readFileSync(usersFile, "utf8");
      var users = JSON.parse(content);
      response.render("inUser.hbs", {
        users: users,
      });
    } catch (e) {
      var errit = [];
      errit.push(e);
      response.render("error.hbs", { errit: errit });
    }
  });

  // запрос страницы ведомость заправки 5.3
  app.get("/repaddeshl", function (request, response) {
    try {
      var content = fs.readFileSync("data/filii.json", "utf8");
      var repps = JSON.parse(content);
      response.render("inESHL.hbs", {
        repps: repps,
      });
    } catch (e) {
      var errit = [];
      errit.push(e);
      response.render("error.hbs", { errit: errit });
    }
  });

  // запрос страницы с валидациями АСОП
  app.get("/agentN", function (request, response) {
    try {
    
	   var users=[];
	  //var content = fs.readFileSync(refValidateFile, "utf8");
        //   users = JSON.parse(content);
		//var content = loadDBVal(refValidateFile);
        //var users = JSON.parse(content);	
		
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

  // запрос страницы с валидациями АСОП
  app.get("/agentBD", function (request, response) {
    try {
    /* 
	 User.findById(request.session.userId).exec(function (error, user) {
        if (error) {
          return response.redirect("/auth");		  
        } else {
          if (user === null || user.is_active === false) {
            return response.redirect("/auth");
          } else {
            var content = fs.readFileSync(refValidateFile, "utf8");
            var users = JSON.parse(content);
            response.render("inAgent.hbs", {
              users: users,
            });
          }
        }
      });
	  */
	   var users=[];
	  // var content = fs.readFileSync(refValidateFile, "utf8");
      //      var users = JSON.parse(content);
            response.render("inAgentMongo.hbs", {
              users: users,
            });
	  
    } catch (e) {
      var errit = [];
      errit.push(e);
      response.render("error.hbs", { errit: errit });
    }
  });
  
  // запрос страницы с действия водителей базы АСОП 
  app.get("/evendsBD", function (request, response) {
    try {	   
            var users=[];
            response.render("inEventsMongo.hbs", {
              users: users,
            });
	  
    } catch (e) {
      var errit = [];
      errit.push(e);
      response.render("error.hbs", { errit: errit });
    }
  });
  
   // запрос страницы с валидациями базы АСОП интерфей Дм 
  app.get("/agentBDDm", function (request, response) {
    try {   
	   //var content = fs.readFileSync(refValidateFile, "utf8");
           // var users = JSON.parse(content);
            var users =[];
			response.render("inAgentMongoDm.hbs", {
              users: users,
            });
	  
    } catch (e) {
      var errit = [];
      errit.push(e);
      response.render("error.hbs", { errit: errit });
    }
  });
  
   // запрос страницы с действия водителей базы АСОП интерфей Дм 
  app.get("/evendsBDDm", function (request, response) {
    try {   
	   //var content = fs.readFileSync(refValidateFile, "utf8");	   
            //var users = JSON.parse(content);
			var users =[];
            response.render("inEvendsMongoDm.hbs", {
              users: users,
            });
	  
    } catch (e) {
      var errit = [];
      errit.push(e);
      response.render("error.hbs", { errit: errit });
    }
  });
  
  // действия механиков 
  app.get("/evendsMeh", function (request, response) {
    try {   
	   //var content = fs.readFileSync(refValidateFile, "utf8");	   
            //var users = JSON.parse(content);
			var users =[];
            response.render("inEvendsEquipsMh.hbs", {
              users: users,
            });
	  
    } catch (e) {
      var errit = [];
      errit.push(e);
      response.render("error.hbs", { errit: errit });
    }
  });
  
  // запрос страницы с оборудованием  базы АСОП интерфей Дм 
  app.get("/equipsBDDm", function (request, response) {
    try {	  
			var users =[];
            response.render("inEquipsMongoDm.hbs", {
              users: users,
            });
	  
    } catch (e) {
      var errit = [];
      errit.push(e);
      response.render("error.hbs", { errit: errit });
    }
  });
  
  // запрос страницы с оборудования базы АСОП
  app.get("/equipsBD", function (request, response) {
    try {	   
            var users=[];
            response.render("inEquipsMongo.hbs", {
              users: users,
            });
	  
    } catch (e) {
      var errit = [];
      errit.push(e);
      response.render("error.hbs", { errit: errit });
    }
  });

  
  // запрос рейсов с валидациями АСОП
  app.get("/trips", function (request, response) {
    try {
      var content = fs.readFileSync(refValidateFile, "utf8");
      var users = JSON.parse(content);
      response.render("inTrips.hbs", {
        users: users,
      });
    } catch (e) {
      var errit = [];
      errit.push(e);
      response.render("error.hbs", { errit: errit });
    }
  });

  // запрос страницы с билетными продуктами АСОП
  app.get("/cards", function (request, response) {
    try {
      var content = fs.readFileSync(refCardsFile, "utf8");
      var users = JSON.parse(content);
      response.render("inCards.hbs", {
        users: users,
      });
    } catch (e) {
      var errit = [];
      errit.push(e);
      response.render("error.hbs", { errit: errit });
    }
  });

  // запрос страницы с состоянием оборудования  АСОП
  app.get("/equipsN", function (request, response) {
    try {
    /* 
	 User.findById(request.session.userId).exec(function (error, user) {
        if (error) {
          return response.redirect("/auth");
        } else {
          if (user === null || user.is_active === false) {
            return response.redirect("/auth");
          } else {
            var content = fs.readFileSync(refEvendsFile, "utf8");
            var users = JSON.parse(content);
            response.render("inEquips.hbs", {
              users: users,
            });
          }
        }
      });
	  */
	   var users =[];
	   //var content = fs.readFileSync(refEvendsFile, "utf8");
         //   var users = JSON.parse(content);
            response.render("inEquips.hbs", {
              users: users,
            });
	  
    } catch (e) {
      var errit = [];
      errit.push(e);
      response.render("error.hbs", { errit: errit });
    }
  });

  // запрос страницы с событиями водителей  АСОП
  app.get("/evendsN", function (request, response) {
    try {
	/*	
	 User.findById(request.session.userId).exec(function (error, user) {
        if (error) {
          return response.redirect("/auth");
        } else {
          if (user === null || user.is_active === false) {
            return response.redirect("/auth");
          } else {
            var content = fs.readFileSync(refEvendsFile, "utf8");
            var users = JSON.parse(content);
            //console.log(users);
            response.render("inEvents.hbs", {
              users: users,
            });
          }
        }
      });
	  */
	  var users=[];
	  // var content = fs.readFileSync(refEvendsFile, "utf8");
        //    var users = JSON.parse(content);
            //console.log(users);
            response.render("inEvents.hbs", {
              users: users,
            });
    } catch (e) {
      var errit = [];
      errit.push(e);
      response.render("error.hbs", { errit: errit });
    }
  });
};
