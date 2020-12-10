// 20201203  версия для ГИОЦ Этап 2, чтение/save с базы данных mongodb + интерфейс Evends Dm
// 20201130  версия для ГИОЦ Этап 2, чтение/save с базы данных mongodb + nDocEndItem return
// 20201108  версия для ГИОЦ Этап 2, чтение/save с базы данных mongodb
// 20201029  версия для ГИОЦ Этап 2, история валидаций в базе данных mongodb
// 20201019  версия для ГИОЦ Этап 2, чтение/save с базы данных mongodb
// 20200909  версия для ГИОЦ Этап 2, чтение с базы данных mongodb
// 20200909  версия для ГИОЦ Этап 2, без передачи валидаций в ГИОЦ 193.23.225.178 read config
// 20181130  сервисы принятия от АСОП валидаций, билетной продукции, событий водителя
module.exports = app => {
	var bodyParser = require('body-parser');
	var fs = require('fs');
	var request = require('request'); 
	var hbs = require('hbs'); // шаблонизатор
	var _mssql = require('@frangiskos/mssql');
	var cronJob=require('cron').CronJob;

	//запуск начала новых транспортных суток
	var cron = require('cron');
	var cronJob = cron.job("0 50 3 * * *", function(){    
	//var cronJob = cron.job("11 55 * * * *", function(){  
    //console.info('Новые транспортные сутки');	
	var d = new Date();
	d.setDate(d.getDate()-1);
	
	var dateLast = d.getFullYear()+'-'+				
		//(+d.getMonth()+1)+
		((d.getMonth()+1)<10 ? "0"+(d.getMonth()+1): (d.getMonth()+1))+"-"+
		//'-'+
		//d.getDate();
		((d.getDate())<10 ? "0"+(d.getDate()): (d.getDate()));
	//initValTr(dateLast);
	initValTrN(dateLast);
	//console.log(dateLast);
	}); 
	cronJob.start();
	
	//установка флагов разрешения записи файлов
	var valFlag=true;
	var validCount=0;
	
	//var usersFile = 'data/agent.json'; // файл пользователей
	var usersFile = 'data/validations.json'; // файл пользователей
	var jsonParser = bodyParser.json();
	//var urlencodedParser = bodyParser.urlencoded({ extended: true });
	var urlencodedParser = bodyParser.urlencoded({ extended: false });
	
	var validPeFile = 'data/validPe.json'; // файл последних действий водителя
    var validPe = {}; // объявление obj последних действий водителя
	var vapecont = fs.readFileSync(validPeFile, 'utf8');
	validPe = JSON.parse(vapecont);	
	
	//валидации по рейсам ПЕ, водитель
	var peValidTrip = 'data/peValidTrips.json'; // файл валидации по рейсам
	var content = fs.readFileSync(peValidTrip, 'utf8');
	var peTrip  = JSON.parse(content);
	
	//валидаторы Герц бортовой ПЕ
	var peValidGerc = 'data/validPeGerc.json'; // файл валидации по рейсам
	var content = fs.readFileSync(peValidGerc, 'utf8');
	var peGercS  = JSON.parse(content);
	
	function addvalid(pe, trips, timeData) {
			try{
			
				var result = false;
				// pe
				try{
					//console.log("валид.ПЕ "+peTrip[pe].validCount);
					peTrip[pe].validCount=Number(peTrip[pe].validCount)+1;
					//console.log("валид.ПЕ "+peTrip[pe].validCount);
					
					peTrip[pe].timestamp=timeData;
				}catch(e){
					console.log("1. валид.ПЕ "+trips);
					peTrip[pe]={};
					peTrip[pe].validCount=1;
					peTrip[pe].timestamp="";
				};
				
				// 
				try{				
					peTrip[pe][trips].timestampTrips=timeData;
				}catch(e){
					console.log("2. Время вал. "+trips);
					peTrip[pe][trips]={};				
					peTrip[pe][trips].timestampTrips=timeData;
					peTrip[pe][trips].validTripsCount=0;
				};
				
				try{
					peTrip[pe][trips].validTripsCount=Number(peTrip[pe][trips].validTripsCount)+1;
				}catch(e){
					console.log("3. К-во вал. "+trips);				
					peTrip[pe][trips].validTripsCount=1;
				};	
				result = true;
				return result+" validation";;
			}catch(e){
				console.log('----------Error add validation----------');
				return result;
			}
		}

	function addnotvalid(pe, timeData) {
			try{
			
				var result = false;
				// pe
				try{										
					peTrip[pe].timestamp=timeData;
				}catch(e){
					console.log("1. время состояния валидатора ");
					peTrip[pe]={};
					//peTrip[pe].validCount=0;
					peTrip[pe].timestamp="_";
					peTrip[pe].validCount=0;
				};
				/*
                try{
					//console.log("валид.ПЕ "+peTrip[pe].validCount);
					peTrip[pe].validCount=Number(peTrip[pe].validCount)+0;
					//console.log("валид.ПЕ "+peTrip[pe].validCount);
					
					//peTrip[pe].timestamp=timeData;
				}catch(e){
					console.log("1. состояния валидатора ");
					peTrip[pe]={};
					peTrip[pe].validCount=0;
					//peTrip[pe].timestamp="";
				};				
				*/
				result = true;
				return result+" время состояния валидатора";
			}catch(e){
				console.log('----------Error add validation----------');
				return result;
			}
		}	
		
	function addtrip(pe, trips, timeData, vod, cod) {
			try{	
				var result = false;
				//console.log("Функция ");
				pe=trips[0]+pe;
				try{
					peTrip[pe].validCount=peTrip[pe].validCount;
				}catch(e){
					//console.log("1");
					peTrip[pe]={};
					peTrip[pe].validCount=0;
					peTrip[pe].timestamp="";
				};
				
				try{				
					peTrip[pe][trips].timestampTrips=peTrip[pe][trips].timestampTrips;
				}catch(e){
					//console.log("2 "+vod+" kod "+cod);
					peTrip[pe][trips]={};				
					peTrip[pe][trips].timestampTrips="";
					peTrip[pe][trips].validTripsCount=0;
				};
				if (cod==="SN"){
					try{
						peTrip[pe][trips][vod].eTimeB=timeData;
					}catch(e){
						//console.log("3 "+vod);
						peTrip[pe][trips][vod]={};
						peTrip[pe][trips][vod].eTimeB=timeData;
						peTrip[pe][trips][vod].eTimeE="";
					};
				}	
				if (cod==="SE"){
						try{
						peTrip[pe][trips][vod].eTimeE=timeData;
					}catch(e){
						//console.log("3 "+vod);
						peTrip[pe][trips][vod]={};
						peTrip[pe][trips][vod].eTimeE=timeData;
						peTrip[pe][trips][vod].eTimeB="";
					};
				};	
				result=true;
				return result+" trip";
			}catch(e){
				console.log('----------Error add trip----------');
				return result;
			}
		}	
	// переход на новые транспортные сутки
	function initValTr(dateLast) {
			try{	
				var result = false;
				// перезаписываем файл с данными за прошлые сутки
				console.info('Новые транспортные сутки');	
	            var d = new Date();
				d.setDate(d.getDate()-1);
		            				
				var dateLast1 = d.getFullYear()+'-'+			  
					((d.getMonth()+1)<10 ? "0"+(d.getMonth()+1): (d.getMonth()+1))+"-"+		
					((d.getDate())<10 ? "0"+(d.getDate()): (d.getDate()));

				var peValidTripSS = 'data/peValidTrips'+dateLast1+'.json'; 
				try {
					if (fs.existsSync(peValidTripSS)) {
						//file exists
					}else{	
						//saveValTr();
						//валидации по рейсам ПЕ, водитель
						peValidTrip = 'data/peValidTrips.json'; // файл валидации по рейсам
						var contentTr = fs.readFileSync(peValidTrip, 'utf8');
						var peTripTr  = JSON.parse(contentTr);
						var data = JSON.stringify(peTripTr);				
						fs.writeFileSync(peValidTripSS, data);
					}
					
				} catch(err) {
					console.error(err)
				}
				
							
				
				// формируем файл с данными на текущие сутки			
				peTrip={};
				var data = JSON.stringify(peTrip);			
				fs.writeFileSync(peValidTrip, data);
				
				//console.log("Получаем - " + peTrip);
				result=true;
				return result + " init new date";
			}catch(e){
				console.log('----------Error init new date----------');
				//console.log(e);
				return false;
			}
		}
	
	// переход на новые транспортные сутки
	function initValTrN(dateLast) {
			try{	
				var result = false;
				// перезаписываем файл с данными за прошлые сутки
				console.info('Новые транспортные сутки');	
	            var d = new Date();
				d.setDate(d.getDate()-1);
		            				
				var dateLast1 = d.getFullYear()+'-'+			  
					((d.getMonth()+1)<10 ? "0"+(d.getMonth()+1): (d.getMonth()+1))+"-"+		
					((d.getDate())<10 ? "0"+(d.getDate()): (d.getDate()));

				var peValidTripSS = 'data/peValidTrips'+dateLast1+'.json'; 
				try {
					fs.rename(peValidTrip, peValidTripSS, (err) => {
						if (err) {
							 console.log(err);
						}else{	 
							console.log('renamed complete');
						// формируем файл с данными на текущие сутки			
						peTrip={};
						var data = JSON.stringify(peTrip);			
						fs.writeFileSync(peValidTrip, data);
						console.log(dateLast1);
						main(dateLast1);
						};	
					});
					
				} catch(err) {
					console.error(err)
				};		
								
				result=true;
				return result + " init new date";
			}catch(e){
				console.log('----------Error init new date----------');
				//console.log(e);
				return false;
			}
		}
	
	// переход на новые транспортные сутки
	function saveValTr() {
			try{	
				
				var result = false;
				var data = JSON.stringify(peTrip);			
				fs.writeFileSync(peValidTrip, data);
				result = true;
				return result;
			}catch(e){
				console.log('----------Error save file----------');
				//console.log(e);
				return result;
			}
		}
	
		
	
//pe filii
async function qweryBDTimeFilii(nameserv, namebd, log, pass, dater, filii) { 
	var SqlConfig = {
		
		user: log,
		password: pass,
		server: nameserv,   //'10.11.1.117',
		database: namebd,   //'ASDU_V026',
		options: 
        {
           //database: 'ASDU_avtobus', //update me
            encrypt: false
        }
		
	};
	// connect BD
	try {
		_mssql.sql.init(SqlConfig);
	} catch (error) {
		//console.error(error);
		console.log("Error Init")
	};
	// qwery BD
	try {
	     // var sqlz=`SELECT  TOP (10) f.[ID]
		 var sqlz=`SELECT   f.[ID]		
							,p.NumPe
							
							,f.[PeID]
							,(CAST(f.[End]-f.[Begin] AS time(7))) as delta
							,f.[Begin]
							,f.[End]	 
							 
				FROM [ASDU_V026].[dbo].[FactWorkHeader] f,[ASDU_V026].[dbo].[PE] p 
				where f.PeID=p.ID and f.Date='${dater}'  and  f.WhoIsOpen=${filii} `;
				//where f.PeID=p.ID and Date='${dater}' and  f.WhoIsOpen=${filii} and f.ID=b.HeaderID`;
				//where f.PeID=p.ID and Date='2020-05-25' and  p.NumPe=2652 and f.ID=b.HeaderID `;
		var data = await _mssql.sql.query(`${sqlz}`);		
		return data;
	} catch (er) {
		console.error("er.error");
	}
};

//pe2 filii
async function qweryBDTimeFilii2(nameserv, namebd, log, pass, dater, filii) { 
	var SqlConfig = {
		
		user: log,
		password: pass,
		server: nameserv,   //'10.11.1.117',
		database: namebd,   //'ASDU_V026',
		options: 
        {
           //database: 'ASDU_avtobus', //update me
            encrypt: false
        }
		
	};
	// connect BD
	try {
		_mssql.sql.init(SqlConfig);
	} catch (error) {
		//console.error(error);
		console.log("Error Init")
	};
	// qwery BD
	try {
	      //var sqlz=`SELECT  TOP (10)  f.[ID]
		 var sqlz=`SELECT   f.[ID]		
							,p.NumPe as NumPe2
							
							,f.[PeID2]
							,(CAST(f.[End]-f.[Begin] AS time(7))) as delta
							,f.[Begin]
							,f.[End]	 
							 
				FROM [ASDU_V026].[dbo].[FactWorkHeader] f,[ASDU_V026].[dbo].[PE] p 
				where f.PeID2=p.ID and f.Date='${dater}'  and  f.WhoIsOpen=${filii} `;
				//where f.PeID=p.ID and Date='${dater}' and  f.WhoIsOpen=${filii} and f.ID=b.HeaderID`;
				//where f.PeID=p.ID and Date='2020-05-25' and  p.NumPe=2652 and f.ID=b.HeaderID `;
		var data = await _mssql.sql.query(`${sqlz}`);		
		return data;
	} catch (er) {
		console.error("er.error");
	}
};

function uniqueArray2(arr) {
    var a = [];
	var out = [];
    for (var i=0; i<arr.length; i++){
        if (a.indexOf(arr[i].NumPe) === -1){
            a.push(arr[i].NumPe);
		    out.push(arr[i]);
		};
	};	
    return out;
}
////
async function main(tempDate2){
	try{		
	//информация с конфиг-файла
	var typeRoute=nconf.get("route_type"); // символы идентификации типа филии A-автобус, B- троллейбус,  C-трамвай
	var fiA=nconf.get("A_"); // масcив id филий автобуса
	var fiB=nconf.get("B_"); // масcив id филий троллейбуса
	var fiC=nconf.get("C_"); // масcив id филий трамвая
	var typeTemp; // текущий тип транспорта
	var fiTemp;   //текущая филия типа транспорта
	var fiLengtcTemp;   //количество фимлий в виде транспорта
	var k,u;
	var id_filii; //id филии текущего вида транспорта
	var peASDU;
	var losses=[];
	
	var tempDate = new Date();
	var tempTime = tempDate.getFullYear()+"-"+
		((tempDate.getMonth()+1)<10 ? "0"+(tempDate.getMonth()+1): (tempDate.getMonth()+1))+"-"+
		((tempDate.getDate())<10 ? "0"+(tempDate.getDate()): (tempDate.getDate()));
	//console.log(tempTime);	
	if(fDate===tempTime){
		var name = 'data/peValidTrips.json';
		var vtratyFile = 'data/vtratyRep.json';
	}
	else{
		var name = 'data/peValidTrips'+tempDate2+'.json';
		var vtratyFile = 'data/vtratyRep'+tempDate2+'.json';
	};		
	var tripsPeFile = name; // 
	var tripsPe = {}; // работа ПЕ в АСОП 
	var tripscont = fs.readFileSync(tripsPeFile, 'utf8');
	tripsPe = JSON.parse(tripscont);	
	
	var userSum ={};
	userSum.id_filii = "sum";
	userSum.timeAsdu = 0;
	userSum.formularN = 0;
	userSum.tDate = tempDate2;
	userSum.tVid = "ABC";
	userSum.tripsNoValid = 0;
	userSum.timeNotAsopF = 0;
	userSum.timeNotValidAsopF = 0;
	userSum.timeAsop = 0;
	userSum.NPE = 0;
	userSum.NValid=0;	
	userSum.NPENotAsop = [];
	
	// выручка турникетов
/*
	userSum.NValidTurn=0;
	var turnKpt=[];
	var turnFile =  'data/LocationsSTAll.json';
	var turncont = fs.readFileSync(tripsPeFile, 'utf8');
	turnKpt = JSON.parse(turncont);
	//требуется реализовать учет валидаций по контролнрам турникетов
	
	var turnSum =0;
	var typeKpt="V"
	for (var v = 0; v < turnKpt.length; ++v){
			var tKpt=turnKpt[v].location_id;				
			var turnArr=[];
			try{	
			turnArr=Object.keys(tripsPe[typeKpt+tKpt]);						
			if(turnArr.length>0){
				try{
				 turnSum=turnSum+tripsPe[typeKpt+tKpt].validCount
				}
				catch(e){
					
				};
			}	
			}
			catch(e){
				
			};		
	}; 
	userSum.NValidTurn=turnSum;
*/	
		
	for (u = 0; u < typeRoute.length; ++u){
        //for (u = 1; u < 2; ++u){
			var userASDU=[];
			peASDU=0;
			typeTemp=typeRoute[u];
			//цикл для филий автобуса
			console.log("");
			console.log("");
			if(typeTemp==='A') fiLengtcTemp = fiA.length;
			if(typeTemp==='B') fiLengtcTemp = fiB.length;
			if(typeTemp==='C') fiLengtcTemp = fiC.length;
			var logType;
			
			for (k = 0; k < fiLengtcTemp; ++k){ 
			//for (k = 2; k < 3; ++k){ 
				if(typeTemp==='A') fiTemp = fiA[k];
				if(typeTemp==='B') fiTemp = fiB[k];
				if(typeTemp==='C') fiTemp = fiC[k];
				id_filii=fiTemp;							
					
				if(typeTemp==='A'){
					console.log("==========Втрати автобусів  в АСДУ id-філії = "+id_filii+" ==========");
					var nameserv = "10.11.1.117";
					var namebd = "ASDU_V026";
					var log = 'Nar';
					var	pass = '123';
					
					
					var userASDU1= await qweryBDTimeFilii(nameserv, namebd, log, pass, tempDate2, id_filii);
					//var userASDU1= await qweryBDTimeTr(nameserv, namebd, log, pass, "2020-05-25", "4521");
					var userASDU2= await qweryBDTimeFilii2(nameserv, namebd, log, pass, tempDate2, id_filii);
					var fDate = tempDate2;
					//var fPE = userASDU1.length;
					var descr = "A";		
					
				}
				if(typeTemp==='B') {
					console.log("==========Втрати Тролейбусів в АСДУ id-філії = "+id_filii+" ==========");
					var nameserv = "10.11.1.115";
					var namebd = "ASDU_V026";
					var log = 'Nar';
					var	pass = '123';
					
					var userASDU1= await qweryBDTimeFilii(nameserv, namebd, log, pass, tempDate2, id_filii);					
					var userASDU2= await qweryBDTimeFilii2(nameserv, namebd, log, pass, tempDate2, id_filii);					
					var fDate = tempDate2;
					//var fPE = userASDU1.length;
					var descr = "B";					
				};				
				if(typeTemp==='C'){
					console.log("==========Втрати Трамваїв в АСДУ id-філії = "+id_filii+" ==========");
					var nameserv = "10.11.1.159";
					var namebd = "ASDU_V026";
					var log = 'ttc';
					var	pass = 'ttc_Admin';					
					var userASDU1= await qweryBDTimeFilii(nameserv, namebd, log, pass, tempDate2, id_filii);					
					var userASDU2= await qweryBDTimeFilii2(nameserv, namebd, log, pass, tempDate2, id_filii);					
					var fDate = tempDate2;
					//if(userASDU1.length>0) var fPE = userASDU1[0].NumPe;
					var descr = "C";
				};
				
				var addPe={};
				var tempPe2=[];
				for (let i=0; i<userASDU1.length; i++){					
					
					if(userASDU1[i].NumPe<10){
								userASDU1[i].NumPe = "0"+ userASDU1[i].NumPe;
					}						
					
				}
				for (let i=0; i<userASDU2.length; i++){						
					
					try{	
						
						if (userASDU2[i].NumPe2){
							if(userASDU2[i].NumPe2<10){
								userASDU2[i].NumPe2 = "0"+ userASDU2[i].NumPe2;
							}
							addPe={};
							addPe=userASDU2[i];
							addPe.NumPe=userASDU2[i].NumPe2;
							tempPe2.push(addPe);
							//console.log(userASDU1[i].NumPe2);
							//console.log(addPe.NumPe);
						}
					}
					catch(e){
						
					}					
					
				}
				//console.log("tempPe2[i].NumPe");
				for (let i=0; i<tempPe2.length; i++){
					userASDU1.push(tempPe2[i]);
					//console.log(tempPe2[i]);
				};	
				
				var timeAsduF=0;
				var timeNotAsopF=0;
				var timeNotValidAsopF=0;				

				var userf = {};
						userf.id_filii=id_filii
						userf.timeAsdu=0;						
						userf.formularN=userASDU1.length;
						userf.tDate=fDate;
						userf.tVid=descr;
						userf.tripsNoValid=0;
						userf.timeNotAsopF=0;
						userf.timeNotValidAsopF=0;
						userf.timeAsop=0;
						userf.NValid=0;
						userf.NPENotAsop = [];	
				
				for (let i=0; i<userASDU1.length; i++){
					//console.log((i+1)+". "+JSON.stringify(userASDU1[i]));
					var timeAsdu=0;		// время формуляра в АСЛУ			
					var timeNotAsop=0;  // время формуляра в АСОП
					var timeNotValidAsop=0;  // время формуляра не в АСОП
					// timeAsdu.
				   try{	 			   
					   //console.log(("Час мл.сек = "+userASDU1[i].delta.getTime()));
					   timeAsdu=userASDU1[i].delta.getTime();
					   timeAsduF+=timeAsdu;
				   }
				   catch(e){
					   userASDU1[i].delta='1970-01-01T00:00:00.000Z';
					   //console.log("Час мл.сек = "+Date.parse(userASDU1[i].delta));
					   timeAsdu=0;
					   timeAsduF+=timeAsdu;
				   };				   
                }
				userf.timeAsdu+=timeAsduF;
				//console.log("in = "+userASDU1.length);		
				var userASDU11=uniqueArray2( userASDU1 );				
				//console.log("out = "+userASDU11.length);
				userf.NPE=userASDU11.length;
				userASDU1=userASDU11;
				for (let i=0; i<userASDU1.length; i++){
					try {   									
						//userf.timeAsdu+=timeAsduF;						
						var fPE=userASDU1[i].NumPe;							
						var tripsArr=[];												
						tripsArr=Object.keys(tripsPe[descr+fPE]);						
						if(tripsArr.length>0){							
							var deltaPeAsop=0
							userf.NValid = userf.NValid + tripsPe[descr+fPE].validCount;	
							//for (var j = 2; j < tripsArr.length; j++){	
							for (var j = 2; j < 3; j++){		
								try{									
									var tkol = tripsPe[descr+fPE][tripsArr[j]].validTripsCount;
var rs = tripsPe[descr+fPE]
var rs0=true;
//console.log("1 rs ="+rs)
for(var key1 in rs) {
if (key1==="validCount" || key1==="timestamp"){
}else{

//console.log("22 rs ="+rs)
	//console.log("key1= "+key1)
	if(key1.indexOf('_0') !== -1) {
		rs0=false;;
		//console.log(key1)
	};
	if(key1.indexOf('_-99') !== -1) {
		rs0=false;;
		//console.log(key1)
	};
	if(key1.indexOf('_-') !== -1) {
		rs0=false;;
		//console.log(key1)
	};


									
									var tt={};
									//tt=(tripsPe[descr+fPE][tripsArr[j]]);
									tt=(tripsPe[descr+fPE][key1]);
									tkol=rs[key1].validTripsCount;
									//console.log("="+tkol);
									//tkol=1;
									//console.log(tt);
									var er=true;
									for(var key in tt) {
									//if(key===validTripsCount){	
										//console.log("key="+key);
										var deltaTemp=0	
											try{
											//console.log("key="+key);	
												if(tt[key].eTimeB && tt[key].eTimeE ){
																							
														deltaTemp=Date.parse(tt[key].eTimeE)-Date.parse(tt[key].eTimeB);
														deltaPeAsop=deltaPeAsop+deltaTemp;												
													
														if(tkol===0 && deltaTemp>600000 && rs0 && er){										
														userf.timeNotValidAsopF+=deltaTemp;
														}	
														if(tkol===0 && deltaTemp>600000 && rs0 && er){
															//console.log("1="+tkol+"2="+deltaTemp+"3="+rs0+"4="+key1);
															userf.tripsNoValid=userf.tripsNoValid+1;
															//console.log("key="+key);	
															
														}
												}
											}	
											catch(e){
												console.log("error"+key)
												deltaPeAsop=deltaPeAsop+0;
												deltaTemp=0;
											}
									//}
									er=false;//break;											
									}
										
										
									//}

}} //цикл по рейсам									
									
								}catch(e){								
									//console.log(e.error);
								};
								
							};
							userf.timeAsop+=deltaPeAsop;							
							//userf.timeNotValidAsopF+=timeNotValidAsop;
							/*
							try{
								var datetemp=tripsPe[descr+fPE].timestamp.slice(0,11);
								var re = new RegExp(datetemp, 'g');
							}catch(e){
								var datetemp="??";
								var re = new RegExp(datetemp, 'g');
								//console.log(e);
							};
							*/
						}else{
							
							userf.timeNotAsopF+=timeAsdu ;
							console.log("Інформація з АСОП відсутня РО= "+userASDU1[i].NumPe);
							userf.NPENotAsop.push(userASDU1[i].NumPe);
							userSum.NPENotAsop.push(userf.id_filii+"-"+userASDU1[i].NumPe);
						};
						
					/*
					try{
						
						//userf.validators = tripsPe[descr+fPE].validCount;
						if (userf.validators===0){
							//userf.timeNotValidAsopF+=timeNotValidAsop;
                            timeNotValidAsop=timeNotValidAsop+deltaTemp							
						};										
					}catch(e){
						//userf.validators = "";						
						//userf.timeNotValidAsopF+=timeNotAsop;
                        timeNotValidAsop=timeNotValidAsop+deltaTemp						
					};					
					*/				
				}	
				catch(err)
				{					
					console.log("Інформація з АСОП відсутня РО= "+userASDU1[i].NumPe);
					userf.timeNotAsopF+=timeAsdu ;
					userf.NPENotAsop.push(userASDU1[i].NumPe);
					userSum.NPENotAsop.push(userf.id_filii+"-"+userASDU1[i].NumPe);	
				};
								
			}; 	//цикл по формулярам филии
			
			
			userSum.id_filii = "sum";
			userSum.timeAsdu = userSum.timeAsdu+userf.timeAsdu;
			userSum.formularN = userSum.formularN+ userf.formularN;
			userSum.tDate = userf.tDate;
			userSum.tVid = "ABC";
			userSum.tripsNoValid = userSum.tripsNoValid+userf.tripsNoValid;
			userSum.timeNotAsopF = userSum.timeNotAsopF+userf.timeNotAsopF;
			userSum.timeNotValidAsopF = userSum.timeNotValidAsopF+userf.timeNotValidAsopF;
			userSum.timeAsop = userSum.timeAsop+userf.timeAsop;
			userSum.NPE = userSum.NPE+userf.NPE;			
			userSum.NValid = userSum.NValid+userf.NValid
			
			userf.timeNotValidAsopF+=timeNotValidAsop;			
			userf.timeAsdu= (userf.timeAsdu/3600000).toFixed(3);
			userf.timeNotAsopF= (userf.timeNotAsopF/3600000).toFixed(3);
			userf.timeNotValidAsopF= (userf.timeNotValidAsopF/3600000).toFixed(3);	
			userf.timeAsop= (userf.timeAsop/3600000).toFixed(3);	
			console.log(userf);	
			losses.push(userf);			
			
		}	// цикл по филии виду транспорта		
	}	 // цикл по виду транспорта
	
				
	userSum.timeAsdu= (userSum.timeAsdu/3600000).toFixed(3);
	userSum.timeNotAsopF= (userSum.timeNotAsopF/3600000).toFixed(3);
	userSum.timeNotValidAsopF= (userSum.timeNotValidAsopF/3600000).toFixed(3);	
	userSum.timeAsop= (userSum.timeAsop/3600000).toFixed(3);
	losses.push(userSum);
	console.log("==========Сумарні втрати  ==========");
	console.log(userSum);	;    
    var data = JSON.stringify(losses);
	fs.writeFileSync(vtratyFile, data);	
	//process.exit(-1);
	return
  }	
	catch(error){
	console.log("----------Розрахунок втрат завершена аварійно----------");		
	console.log(error);
	return	
  }	
}

	
/*	
	////////////////////
				
	userSum.timeAsdu= (userSum.timeAsdu/3600000).toFixed(3);
	userSum.timeNotAsopF= (userSum.timeNotAsopF/3600000).toFixed(3);
	userSum.timeNotValidAsopF= (userSum.timeNotValidAsopF/3600000).toFixed(3);	
	userSum.timeAsop= (userSum.timeAsop/3600000).toFixed(3);
	losses.push(userSum);
	console.log("==========Сумарні втрати  ==========");
	console.log(userSum);	;    
    var data = JSON.stringify(losses);
	fs.writeFileSync(vtratyFile, data);	
	process.exit(-1);
  }	
	catch(error){
	console.log("----------Розрахунок втрат завершена аварійно----------");		
	console.log(error);
	return	
  }	
}
*/


////

	
	///////////////mongodb
	var nconf = require('nconf');
	var filenameconf = './config.json';
	nconf
		.argv()
		.env()
		.file({ file: filenameconf }); // подключаем конфиг файл
	//файлы с конфиг-файла
	var urldb = nconf.get('urldb'); // база данных
	var MongoClient = require('mongodb').MongoClient;
	var db;
	//Connection
	MongoClient.connect(urldb, function(err, database) {
		if (err) throw err;
		else {
			db = database;
			console.log('Connected agent.json to MongoDB');
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
				if (err) console.log('Error save mongo agent.json');
				else console.log('Success save mongo agent.json');
			});
		return result;
	}
	
	function insertDB(name, data) {
		var result = 0;
		//console.log(name);
		//console.log(data);
		var tempData = { _id: name, cont: data };
		db
			.collection('fuelhistory')
			.insertOne({ tempData }, function(
				err,
				result
			) {
				if (err) {
					console.log('Error insert mongo agent.json');
					console.log(err);
				}else console.log('Success insert mongo agent.json');
			});
		return result;
	}
	
	function insertDB2(name, data) {
		var result = 0;
		//console.log(name);
		//console.log(data);
		//var tempData = { _id: name, cont: data };
		db
			.collection(name)
			.insertOne({cont: data }, function(
				err,
				result
			) {
				if (err) {
					console.log('Error insert2 mongo agent.json');
					console.log(err);
				}else console.log('Success insert2 mongo agent.json');
			});
		return result;
	}
	
	async function loadDB(name) {
		try{
		var result1 = await db.collection('fuel').find({ _id: name }).toArray();
		//console.log(JSON.parse(result1[0].tempData.cont).length);
		return result1[0].tempData.cont;
		}catch(e){
			console.log("Помилка читання БД "+name);
			var result1 = "[{}]";
			return result1;
		}	
	}
	
	async function loadDBHistory(name) {
		try{
	var result1 = await db.collection('fuelhistory').find({ 'tempData._id' : name }).toArray();
	//var result1 = await db.collection('fuelhistory').find({ 'tempData._id' : { #eq : name }}).toArray();
	//var result1 = await db.collection('fuelhistory').find({ _id : name }).toArray();
		//console.log(JSON.parse(result1[0].tempData.cont).length);
		//return result1[0].tempData.cont;		
		return result1;
		}catch(e){
			console.log("Помилка читання БД "+name);
			var result1 = "[]";
			return result1;
		}	
	}
	
	async function loadDBHistory2_(name) {
		try{
	var result1 = await db.collection(name).find().limit(3).skip(0).toArray();
	
		//console.log(JSON.parse(result1[0].tempData.cont).length);
		//return result1[0].tempData.cont;		
		return result1;
		}catch(e){
			console.log("Помилка читання БД "+name);
			var result1 = "[]";
			return result1;
		}	
	}
	
	async function loadDBHistory2(name) {
		try{
	var result1 = await db.collection(name).find().limit(3000).skip(0).toArray();
	
		//console.log(JSON.parse(result1[0].tempData.cont).length);
		//return result1[0].tempData.cont;		
		return result1;
		}catch(e){
			console.log("Помилка читання БД "+name);
			var result1 = "[]";
			return result1;
		}	
	}
	
	async function loadDBHistory3(name,  rowPerPage, curentpage) {
		try{
		//console.log((Number(curentpage)-1)* Number(rowPerPage));	
		var result1 = await db.collection(name).find().limit(rowPerPage).skip((curentpage-1)*Number(rowPerPage)).toArray();
	
		//console.log(JSON.parse(result1[0].tempData.cont).length);
		//return result1[0].tempData.cont;		
		return result1;
		}catch(e){
			console.log("Помилка читання БД "+name);
			var result1 = "[]";
			return result1;
		}	
	}
	
		
	async function loadDBHistory3_Bec(name,  rowPerPage, curentpage) {
		try{		
		
        var result1 = await db.collection(name).find({}, function(err, item){               
				if(err) return console.log(err);							
				//console.log("+++ ---");	
				return item				
			}).limit(rowPerPage).skip(curentpage).toArray();
			//});
			var cursor=result1;
			var arr=[];
			var nDoc=0;
			var nVal=0;
			var nDocEnd=0;
			try{
				cursor.forEach(function(x) {					
					var valid=JSON.parse(x.cont);
					nDoc=nDoc+1;
					nDocEnd=0;
					for (var i = 0; i < valid.length; i++) {
					 {
						//if (valid[i].location_id===filter_location_id){
							//console.log(valid[i].location_id);
							arr.push({cont :"["+JSON.stringify( valid[i])+"]"});
							nVal=nVal+1;
						//}
					 }
					}	
				})
				if(nDoc===rowPerPage) nDocEnd=nDocEnd+nDoc+curentpage;						
				}
				catch(e){
					console.log(e);
				};	
				//console.log("11111111111111111111+++ ---");	
		return {"cont" :{"arr" : arr, "nDoc" : nDoc, "nVal" : nVal,  "nDocEnd" : nDocEnd }};
		}catch(e){
			console.log("Помилка читання БД "+name);
			var result1 = "[]";
			return result1;
		}	
	}
	
	async function loadDBHistory3_BecEvends(name,  rowPerPage, curentpage) {
		try{		
		
        var result1 = await db.collection(name).find({}, function(err, item){               
				if(err) return console.log(err);							
				//console.log("+++ ---");	
				return item				
			}).limit(rowPerPage).skip(curentpage).toArray();
			//});
			
			var cursor=result1;
			var arr=[];
			var nDoc=0;
			var nVal=0;
			var nDocEnd=0;
			
			try{
				cursor.forEach(function(x) {					
					var valid=JSON.parse(x.cont);
					nDoc=nDoc+1;
					nDocEnd=0;
					for (var i = 0; i < valid.length; i++) {
					 {
						//if (valid[i].location_id===filter_location_id){
							//console.log(valid[i].location_id);
							arr.push({cont :"["+JSON.stringify( valid[i])+"]"});
							nVal=nVal+1;
						//}
					 }
					}	
				})
				if(nDoc===rowPerPage) nDocEnd=nDocEnd+nDoc+curentpage;						
				}
				catch(e){
					console.log(e);
				};
				
				//console.log(result1);	
		//return {"cont" :{"arr" : arr, "nDoc" : nDoc, "nVal" : nVal,  "nDocEnd" : nDocEnd }};
		return {"cont" :{"arr" : result1, "nDoc" : nDoc, "nVal" : nVal,  "nDocEnd" : nDocEnd }};
		}catch(e){
			console.log("Помилка читання БД "+name);
			var result1 = "[]";
			return result1;
		}	
	}
	
	
	async function loadDBHistoryBec(name,  rowPerPage, curentpage, filter_location_id) {
		try{		
		
        var result1 = await db.collection(name).find({}, function(err, item){               
				if(err) return console.log(err);							
				//console.log("+++ ---");	
				return item				
			}).toArray();
			//});
			var cursor=result1;
			var arr=[];
			var nDoc=0;
			var nVal=0;
			var nDocEnd=0;
			try{
				cursor.forEach(function(x) {					
					var valid=JSON.parse(x.cont);
					nDoc=nDoc+1;
					nDocEnd=0;
					for (var i = 0; i < valid.length; i++) {
					 {
						if (valid[i].location_id===filter_location_id){
							//console.log(valid[i].location_id);
							arr.push({cont :"["+JSON.stringify( valid[i])+"]"});
							nVal=nVal+1;
						}
					 }
					}	
				})				
				}
				catch(e){
					console.log(e);
				};	
				//console.log("11111111111111111111+++ ---");	
		return {"cont" :{"arr" : arr, "nDoc" : nDoc, "nVal" : nVal,  "nDocEnd" : nDocEnd }};
		}catch(e){
			console.log("Помилка читання БД "+name);
			var result1 = "[]";
			return result1;
		}	
	}
	
	async function loadDBHistoryBecTime(name,  rowPerPage, curentpage, filter_Note_time) {
		try{		
		
        var result1 = await db.collection(name).find({}, function(err, item){               
				if(err) return console.log(err);							
				//console.log("+++ ---");	
				return item				
			}).toArray();
			//});
			var cursor=result1;
			var arr=[];
			var nDoc=0;
			var nVal=0;
			var nDocEnd=0;
			try{
				cursor.forEach(function(x) {					
					var valid=JSON.parse(x.cont);
					nDoc=nDoc+1;
					nDocEnd=0;
					for (var i = 0; i < valid.length; i++) {
					 {
						try{
							if (valid[i].Note_time.includes(filter_Note_time)){
								//console.log(valid[i].Note_time);
								arr.push({cont :"["+JSON.stringify( valid[i])+"]"});
								nVal=nVal+1;
							}else{
								//break;
							};							
						}catch(e){
							console.log("Ошибка в формате оборудования");
							break;
						};
					 }
					}	
				})				
				}
				catch(e){
					console.log(e);
				};	
				//console.log("11111111111111111111+++ ---");	
		return {"cont" :{"arr" : arr, "nDoc" : nDoc, "nVal" : nVal,  "nDocEnd" : nDocEnd }};
		}catch(e){
			console.log("Помилка читання БД "+name);
			var result1 = "[]";
			return result1;
		}	
	}
	
	
	async function loadDBHistoryBecDriv(name,  rowPerPage, curentpage, filter_driver_id) {
		try{		
		
        var result1 = await db.collection(name).find({}, function(err, item){               
				if(err) return console.log(err);							
				//console.log("+++ ---");	
				return item				
			}).toArray();
			//});
			var cursor=result1;
			var arr=[];
			var nDoc=0;
			var nVal=0;
			var nDocEnd=0;
			try{
				cursor.forEach(function(x) {					
					var valid=JSON.parse(x.cont);
					nDoc=nDoc+1;
					nDocEnd=0;
					for (var i = 0; i < valid.length; i++) {
					 {
						if (valid[i].ext_driver_id===filter_driver_id){
							//console.log(valid[i].location_id);
							arr.push({cont :"["+JSON.stringify( valid[i])+"]"});
							nVal=nVal+1;
						}
					 }
					}	
				})				
				}
				catch(e){
					console.log(e);
				};	
				//console.log("11111111111111111111+++ ---");	
		return {"cont" :{"arr" : arr, "nDoc" : nDoc, "nVal" : nVal,  "nDocEnd" : nDocEnd }};
		}catch(e){
			console.log("Помилка читання БД "+name);
			var result1 = "[]";
			return result1;
		}	
	}
	
	
	
	/////////////////////
// получение данных втрат из файла отчета
	app.get('/api/vtraty/:sdate', function(req, res) {
		var sdate = req.params.sdate; // получаем datu
		var usersFileDate= 'data/vtratyRep'+sdate+'.json';
		try{
			var content = fs.readFileSync(usersFileDate, 'utf8');
			var usersP = JSON.parse(content);
		}
		catch(e){
			var usersP = [];
		};		
		res.send(usersP);
	});
	// получение списка данных
	app.get('/api/ausers', async function(req, res) {
		//var content = fs.readFileSync(usersFile, 'utf8');
		//var usersP = JSON.parse(content);
		
		var content = await loadDB(usersFile);
		var usersP = JSON.parse(content);
		
		if(usersP.length-700>0){
			var poz = usersP.length-700
			var users =usersP.slice(poz);
		}else{
			var users =usersP;
		};	
		//console.log(usersP);
		res.send(users);
	});
	// получение валидацый с базы данных
	app.get('/api/ausers/:id',async function(req, res) {
		var id = req.params.id; // получаем день		
		var usersFile1 = 'val_'+id;
		//console.log(usersFile1);
		var user = [];	
		item =0;			
		var cont28 = [];
		var contval = [];
		var kol =0;
		cont28 = await loadDBHistory2(usersFile1);
		//console.log(cont28);	
			for (var i = 0; i < cont28.length; i++) {
				contval=JSON.parse(cont28[i].cont);
				//console.log("-------------Блок № "+i);
				kol=kol+(contval.length);
				for (var j = 0; j < contval.length; j++) {
					//console.log(contval[j]);
					user.push(contval[j]);
					
				}	
            //console.log("Валидаций = "+kol);  
			}
		if(user.length-700>0){
			var poz = user.length-700
			var users =user.slice(poz);
		}else{
			var users =user;
		};	
		
		// отправляем пользователя
		if (users) {
			res.send(users);
		} else {
			res.status(404).send();
		}
	});
	
	// валидации база
	app.post('/api/ausers',async function(req, res) {
		//var id = req.params.id; // получаем день
		//console.log(req.body);
		var id = req.body.dat1;
		var usersFile1 = 'val_'+id;
		console.log(usersFile1);
		/*
		var rowPerPage = req.body.rowPerPage;
		var currentPage = req.body.currentPage;
		var filter.date.start = req.body.filter.date.start;
		var filter.date.end = req.body.filter.date.end;
		var filter.line : "",
		var filter.trip_id : "",
		var filter.passengers : "",
		var filter.stop_code : "",
		var filter.stop_sequence : "",		 
		var filter.location_id : "",
		var filter.product_id : "",
		var filter.card_id : "",
		var filter.doc_num : ""
		*/
		
		var user = [];	
		item =0;			
		var cont28 = [];
		var contval = [];
		var kol =0;
		cont28 = await loadDBHistory2(usersFile1);
		//console.log(cont28);	
			for (var i = 0; i < cont28.length; i++) {
				contval=JSON.parse(cont28[i].cont);
				//console.log("-------------Блок № "+i);
				kol=kol+(contval.length);
				for (var j = 0; j < contval.length; j++) {
					//console.log(contval[j]);
					user.push(contval[j]);
					
				}	
            //console.log("Валидаций = "+kol);  
			}
		if(user.length-700>0){
			var poz = user.length-700
			var users =user.slice(poz);
		}else{
			var users =user;
		};	
		
		// отправляем пользователя
		if (users) {
			res.send(users);
		} else {
			res.status(404).send();
		}
	});
	
	// действия водителей база, интерфейс Дима 
	app.post('/api/evendsdm',async function(req, res) {
		//var id = req.params.id; // получаем день
		//console.log(req.body);
		//var id = req.body.dat1;
		var id = req.body.bodyreg.filter.date.start.substr(0,10);		
		var usersFile1 = 'even_'+id;
		console.log(usersFile1);
		//var partN=req.body.bodyreg.currentPage;
		//var rowPerPage=req.body.bodyreg.rowPerPage;
		
		
		var rowPerPage = req.body.bodyreg.rowPerPage;
		var currentPage = req.body.bodyreg.currentPage;
		var filter_date_start = req.body.bodyreg.filter.date.start;
		var filter_date_end = req.body.bodyreg.filter.date.end;
		
		var filter_driver_id = req.body.bodyreg.filter.driver_id;
		var filter_location_id = req.body.bodyreg.filter.location_id;
		var filter_duty_code = req.body.bodyreg.filter.duty_code;		
		var filter_line = req.body.bodyreg.filter.line;
		var filter_trip_id = req.body.bodyreg.filter.trip_id;
		var filter_evends_id = req.body.bodyreg.filter.evends_id;
		
		//var filter_card_id = req.body.bodyreg.filter.card_id;
		//var filter_doc_num = req.body.bodyreg.filter.doc_num;
		//var filter_stop_sequence = req.body.bodyreg.filter.stop_sequence;	
		
		console.log(currentPage +" - "+rowPerPage);
		var user = [];	
		item =0;			
		var cont28 = [];
		var contval = [];
		var kol =0;
		var contDocN=0;
		var contValN=0;
		var contDocEnd=0;
		
		//cont28 = await loadDBHistory2(usersFile1);
		//cont28 = await loadDBHistory3(usersFile1,rowPerPage, currentPage);
		if ((filter_location_id==="") && (filter_driver_id==="")){		
				contR = await loadDBHistory3_BecEvends(usersFile1,rowPerPage, currentPage);
				cont28 = contR.cont.arr; 
				//console.log(contR.cont.arr);
				//console.log(contR.cont.nDoc);
				//console.log(contR.cont.nVal);
				//console.log(contR.cont.nDocEnd);
				contDocN=contR.cont.nDoc;
				contValN=contR.cont.nVal;
				contDocEnd=contR.cont.nDocEnd;
		}else{
			
			// запрос с информации полного дня (location id)	{"cont" :{"arr" : arr, "nDoc" = nDoc, "nVal" : nVal }};
			if(!(filter_location_id==="")){
			var contR = await loadDBHistoryBec(usersFile1,rowPerPage, currentPage, filter_location_id);
				cont28 = contR.cont.arr;
				contDocN=contR.cont.nDoc;
				contValN=contR.cont.nVal;
				contDocEnd=contR.cont.nDocEnd;
			}else{
				var contR = await loadDBHistoryBecDriv(usersFile1,rowPerPage, currentPage, filter_driver_id);
				cont28 = contR.cont.arr;
				contDocN=contR.cont.nDoc;
				contValN=contR.cont.nVal;
				contDocEnd=contR.cont.nDocEnd;
			};	
		}
		
		//console.log(cont28);	
			for (var i = 0; i < cont28.length; i++) {
				contval=JSON.parse(cont28[i].cont);
				//console.log("-------------Блок № "+i);
				kol=kol+(contval.length);
				for (var j = 0; j < contval.length; j++) {					
					{
						user.push(contval[j]);
						//console.log(contval[j]);
					}
				}	
          
			}
			
			
			// маршрут
			var userFF = user.slice(0);
			//console.log(userFF);
			if(filter_line!="")
			{
				var userF = userFF.filter(function (a) {
				
				if(a.route===null){					
					return false
				}else{					
					return (String(a.route).includes(filter_line));
				}
				});
				userFF=userF.slice(0);
			}			
						
			// номер водителя
			if(filter_driver_id!="")
			{				
				var userF = userFF.slice(0);
				var userF = userF.filter(function (a) {
				
				if(a.driver_id===null){					
					return false
				}else{					
					return (String(a.driver_id).includes(filter_driver_id));					
				}
				userFF=userF.slice(0);
				});
			}			
			
			
			console.log(filter_evends_id);
			// код действий водителя
			if(filter_evends_id!="")
			{
				var userF = userFF.slice(0);
				var userF = userF.filter(function (a) {
				var par=a.event;
				console.log(par);
				if(par===null){					
					return false
				}else{					
					return (String(par).includes(filter_evends_id));					
				}
				});
				userFF=userF.slice(0);
			}
			var userF = userFF.slice(0);
		

		var users =userF.slice(0);	
		
		if (users) {
			res.send({cont:{users : users, nDoc : contDocN, nVal : contValN, nDocEndItem : contDocEnd}});
		} else {
			res.status(404).send();
		}
	});
	
	// оборудование база, интерфейс Дима 
	app.post('/api/equipsdm',async function(req, res) {
		//var id = req.params.id; // получаем день
		//console.log(req.body);
		//var id = req.body.dat1;
		var id = req.body.bodyreg.filter.date.start.substr(0,10);		
		var usersFile1 = 'equip_'+id;
		console.log(usersFile1);
		//var partN=req.body.bodyreg.currentPage;
		//var rowPerPage=req.body.bodyreg.rowPerPage;
		
		
		var rowPerPage = req.body.bodyreg.rowPerPage;
		var currentPage = req.body.bodyreg.currentPage;
		var filter_date_start = req.body.bodyreg.filter.date.start;
		var filter_date_end = req.body.bodyreg.filter.date.end;
		
		var filter_Note_time = req.body.bodyreg.filter.Note_time;
		if(filter_Note_time===""){
		}else{
			filter_Note_time = id+"T"+filter_Note_time;
		};
		console.log(filter_Note_time);
		var filter_Location_type = req.body.bodyreg.filter.Location_type;
		var filter_Event = req.body.bodyreg.filter.Event;		
		var filter_Device_ID = req.body.bodyreg.filter.Device_ID;
		var filter_Location = req.body.bodyreg.filter.Location;
		var filter_Message_uptime = req.body.bodyreg.filter.Message_uptime;		
		var filter_Message_fwVersion = req.body.bodyreg.filter.Message_fwVersion;
		var filter_Message_validators = req.body.bodyreg.filter.Message_validators;		
		var filter_Message_applicationUptime = req.body.bodyreg.filter.Message_applicationUptime;
		var filter_Message_systemState = req.body.bodyreg.filter.Message_systemState;		
		var filter_Message_gps = req.body.bodyreg.filter.Message_gps;
		var filter_Message_driverInterface = req.body.bodyreg.filter.Message_driverInterface;		
		var filter_Message_service_id = req.body.bodyreg.filter.Message_service_id;
		
		//var filter_card_id = req.body.bodyreg.filter.card_id;
		//var filter_doc_num = req.body.bodyreg.filter.doc_num;
		//var filter_stop_sequence = req.body.bodyreg.filter.stop_sequence;	
		
		console.log(currentPage +" - "+rowPerPage);
		var user = [];	
		item =0;			
		var cont28 = [];
		var contval = [];
		var kol =0;
		var contDocN=0;
		var contValN=0;
		var contDocEnd=0;
		
		//cont28 = await loadDBHistory2(usersFile1);
		//cont28 = await loadDBHistory3(usersFile1,rowPerPage, currentPage);
		if (filter_Note_time===""){		
				contR = await loadDBHistory3_BecEvends(usersFile1,rowPerPage, currentPage);
				cont28 = contR.cont.arr; 
				//console.log(contR.cont.arr);
				//console.log(contR.cont.nDoc);
				//console.log(contR.cont.nVal);
				//console.log(contR.cont.nDocEnd);
				contDocN=contR.cont.nDoc;
				contValN=contR.cont.nVal;
				contDocEnd=contR.cont.nDocEnd;
		}else{
			
			// запрос с информации полного дня (location id)	{"cont" :{"arr" : arr, "nDoc" = nDoc, "nVal" : nVal }};
			if(!(filter_Note_time==="")){
			var contR = await loadDBHistoryBecTime(usersFile1,rowPerPage, currentPage, filter_Note_time);
				cont28 = contR.cont.arr;
				contDocN=contR.cont.nDoc;
				contValN=contR.cont.nVal;
				contDocEnd=contR.cont.nDocEnd;
			}else{
				/*
				var contR = await loadDBHistoryBecDriv(usersFile1,rowPerPage, currentPage, filter_driver_id);
				cont28 = contR.cont.arr;
				contDocN=contR.cont.nDoc;
				contValN=contR.cont.nVal;
				contDocEnd=contR.cont.nDocEnd;
				*/
			};	
		}
		
		//console.log(cont28);	
			for (var i = 0; i < cont28.length; i++) {
				contval=JSON.parse(cont28[i].cont);
				//console.log("-------------Блок № "+i);
				kol=kol+(contval.length);
				for (var j = 0; j < contval.length; j++) {					
					{
						user.push(contval[j]);
						//console.log(contval[j]);
					}
				}	
          
			}
			var userF = user.slice(0);
			
			
			// PE
			var userFF = user.slice(0);
			//console.log(userFF);
			if(filter_Location!="")
			{
				var userF = userFF.filter(function (a) {
				
				if(a.Location===null){					
					return false
				}else{					
					return (String(a.Location)===String(filter_Location));
				}
				});
				userFF=userF.slice(0);
			}			
			
			// вид транспорта
			if(filter_Location_type!="")
			{				
				var userF = userFF.slice(0);
				var userF = userF.filter(function (a) {
				
				if(a.Location_type===null){					
					return false
				}else{					
					return (String(a.Location_type.toLowerCase()).includes(filter_Location_type.toLowerCase()));					
				}
				userFF=userF.slice(0);
				});
			}	
			
			// статус системы
			if(filter_Message_systemState!="")
			{				
				var userF = userFF.slice(0);
				var userF = userF.filter(function (a) {
				
				if(a.Message_systemState===null){					
					return false
				}else{					
					return (String(a.Message_systemState.toLowerCase()).includes(filter_Message_systemState.toLowerCase()));					
				}
				userFF=userF.slice(0);
				});
			}	
			
			/*			
			// номер водителя
			if(filter_driver_id!="")
			{				
				var userF = userFF.slice(0);
				var userF = userF.filter(function (a) {
				
				if(a.driver_id===null){					
					return false
				}else{					
					return (String(a.driver_id).includes(filter_driver_id));					
				}
				userFF=userF.slice(0);
				});
			}			
			
			
			console.log(filter_evends_id);
			// код действий водителя
			if(filter_evends_id!="")
			{
				var userF = userFF.slice(0);
				var userF = userF.filter(function (a) {
				var par=a.event;
				console.log(par);
				if(par===null){					
					return false
				}else{					
					return (String(par).includes(filter_evends_id));					
				}
				});
				userFF=userF.slice(0);
			}
			var userF = userFF.slice(0);
		*/

		
		var users =userF.slice(0);
		users.sort(function(a, b){
			var nameA=a.Note_time.toLowerCase();
			var nameB=b.Note_time.toLowerCase();
			if (nameA < nameB) return -1;	//сортируем строки по возрастанию			
			if (nameA > nameB) return 1;
			return 0;                       // Никакой сортировки
		})
		
		//console.log(users);
		
		if (users) {
			res.send({cont:{users : users, nDoc : contDocN, nVal : contValN, nDocEndItem : contDocEnd}});
		} else {
			res.status(404).send();
		}
	});
	
	
	
	// действия водителей база, интерфейс Дима 
	app.post('/api/ausersdm',async function(req, res) {
		//var id = req.params.id; // получаем день
		//console.log(req.body);
		//var id = req.body.dat1;
		var id = req.body.bodyreg.filter.date.start.substr(0,10);		
		var usersFile1 = 'val_'+id;
		console.log(usersFile1);
		//var partN=req.body.bodyreg.currentPage;
		//var rowPerPage=req.body.bodyreg.rowPerPage;
		
		
		var rowPerPage = req.body.bodyreg.rowPerPage;
		var currentPage = req.body.bodyreg.currentPage;
		var filter_date_start = req.body.bodyreg.filter.date.start;
		var filter_date_end = req.body.bodyreg.filter.date.end;
		var filter_line = req.body.bodyreg.filter.line;
		var filter_trip_id = req.body.bodyreg.filter.trip_id;
		var filter_passengers = req.body.bodyreg.filter.passengers;
		var filter_stop_code = req.body.bodyreg.filter.stop_code;
		var filter_stop_sequence = req.body.bodyreg.filter.stop_sequence;		 
		var filter_location_id = req.body.bodyreg.filter.location_id;
		var filter_product_id = req.body.bodyreg.filter.product_id;
		var filter_card_id = req.body.bodyreg.filter.card_id;
		var filter_doc_num = req.body.bodyreg.filter.doc_num;
		
		console.log(currentPage +" - "+rowPerPage);
		var user = [];	
		item =0;			
		var cont28 = [];
		var contval = [];
		var kol =0;
		var contDocN=0;
		var contValN=0;
		var contDocEnd=0;
		
		//cont28 = await loadDBHistory2(usersFile1);
		//cont28 = await loadDBHistory3(usersFile1,rowPerPage, currentPage);
		if (filter_location_id===""){
		//if (true){	
			//cont28 = await loadDBHistory3(usersFile1,rowPerPage, currentPage);
				contR = await loadDBHistory3_Bec(usersFile1,rowPerPage, currentPage);
				cont28 = contR.cont.arr; 
				//console.log(contR.cont.arr);
				//console.log(contR.cont.nDoc);
				//console.log(contR.cont.nVal);
				//console.log(contR.cont.nDocEnd);
				contDocN=contR.cont.nDoc;
				contValN=contR.cont.nVal;
				contDocEnd=contR.cont.nDocEnd;
		}else{
			// запрос с информации полного дня (location id)	{"cont" :{"arr" : arr, "nDoc" = nDoc, "nVal" : nVal }};
			var contR = await loadDBHistoryBec(usersFile1,rowPerPage, currentPage, filter_location_id);
				cont28 = contR.cont.arr; 
				//console.log(contR.cont.arr);
				//console.log(contR.cont.nDoc);
				//console.log(contR.cont.nVal);
				//console.log(contR.cont.nDocEnd);
				contDocN=contR.cont.nDoc;
				contValN=contR.cont.nVal;
				contDocEnd=contR.cont.nDocEnd;	
		}
		//console.log(cont28);	
			for (var i = 0; i < cont28.length; i++) {
				contval=JSON.parse(cont28[i].cont);
				//console.log("-------------Блок № "+i);
				kol=kol+(contval.length);
				for (var j = 0; j < contval.length; j++) {					
					{
						user.push(contval[j]);
						//console.log(contval[j]);
					}
				}	
              
			}
			
			// маршрут
			var userFF = user.slice(0);
			if(filter_line!="")
			{
				var userF = userFF.filter(function (a) {
				
				if(a.line===null){					
					return false
				}else{					
					return (String(a.line).includes(filter_line));
				}
				});
				userFF=userF.slice(0);
			}	
			
			//console.log(userFF);		
			// номер турникета
			if(filter_product_id!="")
			{
				var userF = userFF.slice(0);
				var userF = userF.filter(function (a) {
				
				if(a.product_id===null){
					return false
				}else{					
					return (String(a.product_id).includes(filter_product_id));					
				}
				});
				userFF=userF.slice(0);
			}
			
			// номер рейса
			if(filter_trip_id!="")
			{
				var userF = userFF.slice(0);
				var userF = userF.filter(function (a) {
				
				if(a.trip_id===null){
					return false
				}else{					
					return (String(a.trip_id).includes(filter_trip_id));					
				}
				});
				userFF=userF.slice(0);
			}
			            
			// номер ПЕ, станции с турникетами
			if(filter_location_id!="")
			{				
				var userF = userFF.slice(0);
				var userF = userF.filter(function (a) {
				
				if(a.location_id===null){					
					return false
				}else{					
					return (String(a.location_id).includes(filter_location_id));					
				}
				});
				userFF=userF.slice(0);
			}			
			
			// тип билета
			if(filter_card_id!="")
			{				
				var userF = userFF.slice(0);
				var userF = userF.filter(function (a) {				
				if(a.card_id===null){					
					return false
				}else{
					return (String(a.card_id).includes(filter_card_id));
				}
				});
				userFF=userF.slice(0);
			}	
			
			// к-во пассажиров
			if(filter_passengers!="")
			{				
				var userF = userFF.slice(0);
				var userF = userF.filter(function (a) {
				
				if(a.card_id===null){					
					return false
				}else{
					return (String(a.passengers).includes(filter_passengers));					
				}
				});
				userFF=userF.slice(0);
			}	
			
			var userF = userFF.slice(0);
		
		var users =userF.slice(0);		
		if (users) {
			res.send({cont:{users : users, nDoc : contDocN, nVal : contValN, nDocEndItem : contDocEnd}});
		} else {
			res.status(404).send();
		}
	});
	
	
	
	// действия водителей база
	app.post('/api/vausers',async function(req, res) {
		//var id = req.params.id; // получаем день
		//console.log(req.body);
		var id = req.body.dat1;
		var usersFile1 = 'even_'+id;
		console.log(usersFile1);
		
		
		var user = [];	
		item =0;			
		var cont28 = [];
		var contval = [];
		var kol =0;
		cont28 = await loadDBHistory2(usersFile1);
		//console.log(cont28);	
			for (var i = 0; i < cont28.length; i++) {
				contval=JSON.parse(cont28[i].cont);
				//console.log("-------------Блок № "+i);
				kol=kol+(contval.length);
				for (var j = 0; j < contval.length; j++) {
					//console.log(contval[j]);
					user.push(contval[j]);
					
				}	
            //console.log("Валидаций = "+kol);  
			}
		if(user.length-700>0){
			var poz = user.length-700
			var users =user.slice(poz);
		}else{
			var users =user;
		};	
		
		// отправляем пользователя
		if (users) {
			res.send(users);
		} else {
			res.status(404).send();
		}
	});
	
	// оборудование база
	app.post('/api/qvausersN',async function(req, res) {
		//var id = req.params.id; // получаем день
		//console.log(req.body);
		var id = req.body.dat1;
		var usersFile1 = 'equip_'+id;
		//console.log('qqqqq');
		console.log(usersFile1);
				
		var user = [];	
		item =0;			
		var cont28 = [];
		var contval = [];
		var kol =0;		
		cont28 = await loadDBHistory2_(usersFile1);
		//cont28 = await loadDBHistory3(usersFile1,rowPerPage, currentPage);		
		//console.log(cont28);	
			for (var i = 0; i < cont28.length; i++) {
				contval=JSON.parse(cont28[i].cont);
				//console.log("-------------Блок № "+i);
				kol=kol+(contval.length);
				for (var j = 0; j < contval.length; j++) {
					//console.log(contval[j]);
					user.push(contval[j]);
					
				}	
            //console.log("Валидаций = "+kol);  
			}
			
		if(user.length-700>0){
			var poz = user.length-700
			var users =user.slice(poz);
		}else{
			var users =user;
		};	
		
		
		// отправляем пользователя
		if (users) {
			res.send(users);
		} else {
			res.status(404).send();
		}
	});
	
	
	
	
		// получение отправленных данных
	app.post('/api/validate', urlencodedParser, function(req, res) {
		if (!req.body) return res.sendStatus(400);
        if (!req.headers.authorization) return res.sendStatus(401);
		if (req.headers.authorization!="User wv/JXE6Ac6cnUwdl7pzDwFOljhGkNeNZ7hmj/4ZtDD4=") return res.sendStatus(401);
		console.log(JSON.stringify(req.headers));
		//var kluch = JSON.stringify(req.headers);
		console.log(JSON.stringify(req.headers.authorization));
		console.log(req.body);
	 try {
		
		//читаем существующие валидации
		var id;
		var data = fs.readFileSync(usersFile, 'utf8');
				var users = JSON.parse(data);

				// находим максимальный id
				//var id = Math.max.apply(Math,users.map(function(o){return o.id;}))
				// находим максимальный id
				if (users.length == 0) {
					id = 0;
				} else {
					id = Math.max.apply(
						Math,
						users.map(function(o) {
							return o.id;
						})
					);
				}
		
		// Принимаем массив валидаций
		var arr=[];
		var arr1,strtemp;
		var arrtemp=[];
		arr1=JSON.stringify(req.body);
		arr1=arr1.slice(2,arr1.length-4);
		//console.log(arr1);
		arrtemp=arr1.split("");
		//проверяем и исправляем на формат массива
		if (arrtemp[0]!="["){
			arrtemp.splice(0, 0, "[");
			arrtemp.splice(arrtemp.length-1, 0, "]");
		};
		//console.log(arrtemp);
		for (var i = 0;  i< arrtemp.length; i++) {	
			if (arrtemp[i]=="{"){
				strtemp=arrtemp[i];
				for (var j = i+1;  j< arrtemp.length; j++) {
					if (arrtemp[j]!="}"){
						if (arrtemp[j]!="\\") strtemp+=arrtemp[j];					
					}else{
						strtemp+=arrtemp[j];
						//console.log(strtemp);
						//var strtemp1=JSON.parse(strtemp);
						arr.push(strtemp);
						strtemp="";
						i=j;
						j=arrtemp.length;
					};
					
				};	
			}; 
			
		};
		//arr1=arr2.split('\"').join('"');
		//console.log("==================");
		//console.log(arr);
		
		//console.log("------------------");
		//console.log("Lentch = "+ arr.length);
		//console.log(arr[0]);
		//console.log("----"+arr[1]);
		//console.log(JSON.parse(arr[0]));
		//console.log(arr);
		for (var i = 0; i < arr.length; i++) {	
		//for (var i = 0; i < 0; i++) {
                var tempParse = JSON.parse(arr[i]);	
//console.log("1111 "+tempParse);				
				var timestamp = tempParse.timestamp;
				var line = tempParse.line;
				var trip_id = tempParse.trip_id;
				var passengers = tempParse.passengers;
				var stop_code = tempParse.stop_code;
				var stop_sequence = tempParse.stop_sequence;
				var location_id = tempParse.location_id;
				var product_id = tempParse.product_id;
				var card_id = tempParse.card_id;
				var doc_num = tempParse.doc_num;					
				
				var user = { 
				timestamp : timestamp,
				line : line,
				trip_id : trip_id,
				passengers : passengers,
				stop_code : stop_code,
				stop_sequence : stop_sequence,
				location_id : location_id,
				product_id : product_id,
				card_id : card_id,
				doc_num : doc_num
				};

				
				// увеличиваем его на единицу
				user.id = id + 1+i;
				//console.log(user.id);
				// добавляем пользователя в массив
				users.push(user);
		};
		var data = JSON.stringify(users);
		// перезаписываем файл с новыми данными
		fs.writeFileSync(usersFile, data);
		saveDB(usersFile, data);
		res.send("code: 204");
	}
	catch (e) {
                console.log(e)
				res.sendStatus(417)
            }
	 }
);
	
	// получение отправленных данных
	app.post('/api/ausers', jsonParser, function(req, res) {
		if (!req.body) return res.sendStatus(400);

		var timestamp = req.body.timestamp;
		var line = req.body.line;
		var trip_id = req.body.trip_id;
		var passengers = req.body.passengers;
		var stop_code = req.body.stop_code;
		var stop_sequence = req.body.stop_sequence;
		var location_id = req.body.location_id;
		var product_id = req.body.product_id;
		var card_id = req.body.card_id;
		var doc_num = req.body.doc_num;
					
		
		var user = { 
		timestamp : timestamp,
		line : line,
		trip_id : trip_id,
		passengers : passengers,
		stop_code : stop_code,
		stop_sequence : stop_sequence,
		location_id : location_id,
		product_id : product_id,
		card_id : card_id,
		doc_num : doc_num
		};

		var data = fs.readFileSync(usersFile, 'utf8');
		var users = JSON.parse(data);

		// находим максимальный id
		//var id = Math.max.apply(Math,users.map(function(o){return o.id;}))
		// находим максимальный id
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
		// увеличиваем его на единицу
		user.id = id + 1;
		// добавляем пользователя в массив
		users.push(user);
		var data = JSON.stringify(users);
		// перезаписываем файл с новыми данными
		fs.writeFileSync(usersFile, data);
		res.send(user);
		saveDB(usersFile, data);
	});
	
	// получение по рейсу начало, конец, водитель id
	app.get('/api/tripsvod/:trips/:pe/:vod/:timeData/:cod', function(req, res) {
	//app.get('/api/tripsvod/:trips', function(req, res) {	
		try{
			//console.log("Действия водителя получены 1");
			var trips = req.params.trips; // получаем trips
			var pe = req.params.pe; // получаем pe
			var vod = req.params.vod; // получаем vod
			var timeData = req.params.timeData; // time
			var cod = req.params.cod; // получаем cod
			// добавляем рейс водитель, начало, конец
			addtrip(pe, trips, timeData, vod, cod);			
			res.status(200).send();
			
		}catch(e){
			res.status(404).send();
		};		
	});
	
	
	
	// получение рейсов и валидаций
	app.post('/api/auserstrips', jsonParser, function(req, res) {
		if (!req.body) return res.sendStatus(400);

		var timestamp = req.body.timestamp;
		var line = req.body.line;
		var trip_id = req.body.trip_id;
		var passengers = req.body.passengers;
		var stop_code = req.body.stop_code;
		var stop_sequence = req.body.stop_sequence;
		var location_id = req.body.location_id;
		var product_id = req.body.product_id;
		var card_id = req.body.card_id;
		var doc_num = req.body.doc_num;
					
		try{
		var user = { 
		id : 1,
		timestamp : peTrip[location_id].timestamp,
		line : peTrip[location_id].validCount,
		trip_id : trip_id,
		passengers : passengers,
		stop_code : stop_code,
		stop_sequence : stop_sequence,
		location_id : location_id,
		product_id : product_id,
		card_id : card_id,
		doc_num : doc_num
		};
		var data = JSON.stringify(peTrip[location_id]).replace(/,/g,"<br>");
		}catch(e){
			var user = { 
			id : 1,
			timestamp : "",
			line : "ІНФОРМАЦІЯ ВІДСУТНЯ",
			trip_id : "",
			passengers : "",
			stop_code : "",
			stop_sequence : "",
			location_id : location_id,
			product_id : "",
			card_id : "",
			doc_num : ""			
		};
			var data="";
		};

		
		/*
		var data="";
		for (var key in peTrip[location_id]) {
			if (typeof peTrip[location_id][key] === "object"){
				for (var key1 in peTrip[location_id][key]) {
					data = data + "Рейс _"+key1+"<br>";
					data = data + peTrip[location_id][key][key1]+"<br>";
				}	
			}else{
				data = data + peTrip[location_id][key]+"<br>";
			};
		}
		*/
		user.passengers=peTrip[location_id];
		user.trip_id=data;		
		res.send(user);
		
	});
	
	
	
	// получение валидаций с АСОП (тестовая+продуктовая среда)	
	app.post('/validations', bodyParser.json(), async function(req, res) {	
		
		if (!req.body) return res.sendStatus(400);
		var tempdata=[];
		var item = 0; // указатель блока вaлидаций для истории
		var itemdata=[]; // блок вaлидаций для истории
		
		//var giocValid=nconf.get("giocValids");		
		validCount=validCount+1;
		var tempstr=req.body;
		tempdata.push(tempstr);
		tempstr=JSON.stringify(req.headers);
		tempdata.push(tempstr);
		var datatemp = JSON.stringify(tempdata);
		// перезаписываем файл с новыми данными
		fs.writeFileSync("data/tempValidations.json", datatemp);		
		
		
        if (!req.headers.authorization) return res.sendStatus(401);
		if (req.headers.authorization != "User wv/JXE6Ac6cnUwdl7pzDwFOljhGkNeNZ7hmj/4ZtDD4="){
            if (req.headers.authorization != "User XF03dCx0vc10+YJESlINEVu1TsiEICH16g5WxAMYOqg=") {return res.sendStatus(401)};
		};			
		//console.log(JSON.stringify(req.headers));
		//var kluch = JSON.stringify(req.headers);
		//console.log(JSON.stringify(req.headers.authorization));
		//console.log(req.body);
	
	try {
		
		// передача валидаций 10.31.11.241:3000 
		var btest=JSON.stringify(req.body)+"      ";
		//console.log("body- "+btest);
		var headtest1=req.headers;
		//console.log("header- "+JSON.stringify(headtest1));
		var headtest={ "host":"cards.ttc.net.ua", "x-forwarded-for":"185.185.252.20", "x-real-ip":"185.185.252.20",
		"x-forwarded-proto":"http", "x-request-uri":"/validations", "connection":"close", "content-length":"184",
		"user-agent":"Apache-HttpClient/4.5.10 (Java/1.8.0_252)", "accept-encoding":"gzip, deflate","accept":"application/json",
		"content-type":"application/json","authorization":"User wv/JXE6Ac6cnUwdl7pzDwFOljhGkNeNZ7hmj/4ZtDD4="};
		var tt="content-length";
		//headtest[tt]=headtest1[tt];
		
		//console.log("header- "+(headtest[tt]));
		//console.log("header_lencht- "+(headtest1[tt]));
		
	    if(typeof req.body === "string"){}else{ btest=JSON.stringify(req.body)+"      "};
		if(btest.length>2000){btest=btest+"      "}; 	
		//console.log("body_lencht- "+(btest.length));
		headtest[tt]=btest.length;
		if (validCount>0){
		//request.post({ url: "http://sip.ttc.net.ua:3000/validations", headers : req.headers, body : btest},	
		
		//request.post({ url: "http://193.23.225.178:3000/validations", headers : req.headers, body : btest},	
				
		//request.post({ url: "http://10.31.11.26:3000/validations", headers : req.headers, body : btest},	
		//request.post({ url: "http://10.31.11.26:3000/validations", headers : headtest, body : btest},	
		//request.post({ url: "http://193.23.225.178:3000/validations", headers : headtest, body : btest},	
		request.post({ url: "http://185.185.255.181:3000/validations", headers : headtest, body : btest},	
			
			function(err, remoteResponse, remoteBody) {
				if (err) { 
					console.log("Error validate copy send = "+err);
				};
				console.log("validate copy send - ok");
				//res.write(remoteResponse.statusCode.toString()); // copy all headers from remoteResponse
				//res.end(remoteBody);
			
		});
				
		validCount=0;
		};
        	 
	 
		//читаем существующие валидации
		var id;
		var data = fs.readFileSync(usersFile, 'utf8');
				var users = JSON.parse(data);

				// находим максимальный id
				//var id = Math.max.apply(Math,users.map(function(o){return o.id;}))
				// находим максимальный id
				if (users.length == 0) {
					id = 0;
				} else {
					id = Math.max.apply(
						Math,
						users.map(function(o) {
							return o.id;
						})
					);
				}

////
		// Принимаем массив валидаций
	
		
		var arr;
		arr=req.body;
 //	arr=[{ "timestamp": "2018-11-11 22:15:01.000",  "line": "37",
 // "trip_id": "V109190_6",  "passengers": 1,  "stop_code": "V9473",  "stop_sequence": 5,  "location_id": "9999",  "product_id": 1911, 
 // "card_id": "3086490070060000466",  "doc_num": 76263601509229570, door_id:1111,card_type:"QR"}];		
				
		for (var i = 0; i < arr.length; i++) {	
		
				var KC,QR,TC;
				var timestamp = arr[i].timestamp;
				var line = arr[i].line;
				var trip_id = arr[i].trip_id;
				var passengers = arr[i].passengers;
				var stop_code = arr[i].stop_code;
				var stop_sequence = arr[i].stop_sequence;
				var location_id = arr[i].location_id;
				var product_id = arr[i].product_id;
				var card_id = arr[i].card_id;
				var doc_num = arr[i].doc_num;	
				try{
					var door_id = arr[i].door_id;
					var card_type = arr[i].card_type;
				}catch(e)
				{
					var door_id = "";
					var card_type = "";
				};	
				
				if (location_id.length<4 && location_id.charAt(0)==="0"){
					location_id=location_id.substring(1);
				};				
				var user = { 
				timestamp : timestamp,
				line : line,
				trip_id : trip_id,
				passengers : passengers,
				stop_code : stop_code,
				stop_sequence : stop_sequence,
				location_id : location_id,
				//product_id : product_id,
				//card_id : card_id,
				product_id : door_id,
				card_id : card_type,
				doc_num : doc_num
				};

				// сохраняем порцию валидаций в массиве истории БД
		///*				
				// увеличиваем его на единицу
				item=item+1;
				
				// добавляем  пользователя в массив	истории БД			
				itemdata.push(user);
		//*/			
				// увеличиваем его на единицу
				user.id = id + 1+i;
				// удаляем 1 пользователя из массива
				if(users.length>4000) users.splice(0,1);	
				// добавляем пользователя в массив
				users.push(user);
				if (user.stop_code === null ){
					var pe = "V"+user.location_id;
				}else{					
					var pe = user.stop_code.substring(0,1)+user.location_id;
					if(user.location_id==="0289"){
						var pe = "V"+user.location_id;
					};
                };
				
				if (!validPe[pe])	
				{				
					try{
						
						if(user.card_id==="KC"){
							
							try{
								TC=validPe[pe].timestampTC
							}
							catch(e){
								TC=""								
							};
							try{
								QR=validPe[pe].timestampQR
							}
							catch(e){
								QR="";
							};
							validPe[pe]={
								"timestamp": user.timestamp,
								"timestampKC": user.timestamp,
								"timestampTC": TC,								
								"timestampQR": QR
								};
						};
						
						if(user.card_id==="TC"){
							try{
								KC=validPe[pe].timestampKC
							}
							catch(e){
								KC="";
							};
							try{
								QR=validPe[pe].timestampQR
							}
							catch(e){
								QR="";
							};
							validPe[pe]={
								"timestamp": user.timestamp,
								"timestampTC": user.timestamp,
								"timestampKC": KC,
								"timestampQR": QR								
								};
						};
						if(user.card_id==="QR"){
							try{
								KC=validPe[pe].timestampKC
							}
							catch(e){
								KC="";
							};
							try{
								TC=validPe[pe].timestampTC
							}
							catch(e){
								TC="";
							};
							validPe[pe]={
								"timestamp": user.timestamp,
								"timestampQR": user.timestamp,
								"timestampKC": KC,
								"timestampTC": TC									
								};
						};
					}catch(e){
						validPe[pe]={
							"timestamp": user.timestamp							
							};
						console.log(e);	
					};
					// Добавляем валидацию рейса 
					var peT = pe;
					try{
						var tripsT = user.trip_id;
					}catch(e){
						var tripsT = "0";
					};
					try{
						var timeDataT = user.timestamp;
					}catch(e){
						var timeDataT = "00:00";
					};
					try{
						addvalid(peT, tripsT, timeDataT); 	
					}catch(e){
						console.log("Помилка додавання вал. рейсу - "+ peT+"_"+ tripsT+"_"+ timeDataT);
					};
						
				}else{
					if (validPe[pe].timestamp<user.timestamp){												
						try{
						//validPe[pe]={
								//"timestamp": user.timestamp								
								//};	
						if(user.card_id==="KC"){
							
							try{
								TC=validPe[pe].timestampTC
							}
							catch(e){
								TC=""								
							};
							try{
								QR=validPe[pe].timestampQR
							}
							catch(e){
								QR="";
							};
							validPe[pe]={
								"timestamp": user.timestamp,
								"timestampKC": user.timestamp,
								"timestampTC": TC,								
								"timestampQR": QR
								};
						};
						
						if(user.card_id==="TC"){
							try{
								KC=validPe[pe].timestampKC
							}
							catch(e){
								KC="";
							};
							try{
								QR=validPe[pe].timestampQR
							}
							catch(e){
								QR="";
							};
							validPe[pe]={
								"timestamp": user.timestamp,
								"timestampTC": user.timestamp,
								"timestampKC": KC,
								"timestampQR": QR								
								};
						};
						if(user.card_id==="QR"){
							try{
								KC=validPe[pe].timestampKC
							}
							catch(e){
								KC="";
							};
							try{
								TC=validPe[pe].timestampTC
							}
							catch(e){
								TC="";
							};
							validPe[pe]={
								"timestamp": user.timestamp,
								"timestampQR": user.timestamp,
								"timestampKC": KC,
								"timestampTC": TC									
								};
						};
						}catch(e){
							validPe[pe]={
								"timestamp": user.timestamp							
								};
						};	
							
							
					};
					// Добавляем валидацию рейса 
					var peT = pe;
					try{
						var tripsT = user.trip_id;
					}catch(e){
						var tripsT = "0";
					};
					try{
						var timeDataT = user.timestamp;
					}catch(e){
						var timeDataT = "00:00";
					};
					try{
						addvalid(peT, tripsT, timeDataT); 	
					}catch(e){
						console.log("Помилка додавання вал. рейсу - "+ peT+"_"+ tripsT+"_"+ timeDataT);
					};	
				};
		};
		
		// запись истории в БД
		if(item>0){
			var usersFile1 = 'val_'+itemdata[0].timestamp.substring(0,10);
			var data = JSON.stringify(itemdata);
			//insertDB(usersFile1, data);
			insertDB2(usersFile1, data);			
			item =0;			
			var cont28 = [];
			var contval = [];
			var kol =0;
			//cont28 = await loadDBHistory2(usersFile1);
			//console.log(cont28);
			
			//cont28 = await loadDBHistory(usersFile1);
			
			
			//var cont29 = JSON.parse(cont28);
			//console.log(cont28[0].cont);
			//console.log(cont28.length + " записей в базу");
			//contval=JSON.parse(cont28[0].cont);
			//console.log(contval.length + " валидаций в блоке 0");
			/*
			for (var i = 0; i < cont28.length; i++) {
				contval=JSON.parse(cont28[i].cont);
				//console.log("-------------Блок № "+i);
				kol=kol+(contval.length);
				for (var j = 0; j < contval.length; j++) {
					//console.log(contval[j]);
					
				}	
            //console.log("Валидаций = "+kol);  
			}
			*/
				
		};
		
		// запись файлов раз в 5 секунд
		var data = JSON.stringify(validPe);
		// перезаписываем BD с новыми данными
			saveDB(validPeFile, data);
		// перезаписываем файл с новыми данными
			fs.writeFileSync(validPeFile, data);
			
			
		var	data1 = JSON.stringify(users);		
			// перезаписываем файл с новыми данными
			fs.writeFileSync(usersFile, data1);
			saveDB(usersFile, data1);	
					
			
		//if(valFlag){
						
			// запись файла рейсов с новыми данными
			//console.log("Запись");
			saveValTr();						
			//valFlag=false;
		//};
		res.send("code: 204");		
		
	}
	
	catch (e) {
                console.log(e)
				res.sendStatus(417)
            }
	 }
);
	
	// получение валидаций от Герц
	app.put('/equipsGerc', bodyParser.json(), function(req, res) {		
		
		if (!req.body) return res.sendStatus(400);
		
		var tempdata=[];
		var item = 0;		
		var tempstr=req.body;
		tempdata.push(tempstr);
		tempstr=JSON.stringify(req.headers);
		tempdata.push(tempstr);
		var datatemp = JSON.stringify(tempdata);
		// перезаписываем файл с новыми данными
		fs.writeFileSync("data/tempValidationsGerc.json", datatemp);		
		
		
        //if (!req.headers.authorization) return res.sendStatus(401);
		//if (req.headers.authorization != "User wv/JXE6Ac6cnUwdl7pzDwFOljhGkNeNZ7hmj/4ZtDD4="){
        //   if (req.headers.authorization != "User XF03dCx0vc10+YJESlINEVu1TsiEICH16g5WxAMYOqg=") {return res.sendStatus(401)};
		//};
		
		
	 try {	
		// Принимаем массив валидаций
	
		
		var arr;
		arr=req.body;
	
		for (var i = 0; i < arr.length; i++) {	
		
				var timestamp = arr[i].last_contact_time;
				var device_id =arr[i].device_id;
				var device_serial =arr[i].device_serial;
				//console.log(peGerc[device_serial]);
				//console.log(peGercS);
				try{
					
					var location_id = peGercS[device_serial].pe;
				}
				catch(e){
					var location_id = device_serial;
				};
				var location_type = "U";
				//console.log(location_id);
							
				//var passengers = arr[i].passengers;
				
				//var stop_code = arr[i].stop_code;
				//var stop_sequence = arr[i].stop_sequence;
				
				//var product_id = arr[i].product_id;
				//var card_id = arr[i].card_id;
				//var doc_num = arr[i].doc_num;					
				
				
	/*
				var user = { 
				timestamp : timestamp,
				line : line,
				trip_id : trip_id,
				passengers : passengers,
				stop_code : stop_code,
				stop_sequence : stop_sequence,
				location_id : location_id,
				product_id : product_id,
				card_id : card_id,
				doc_num : doc_num
				};
    */
				try{
					if (location_type === "U" ){
						var pe = "A"+location_id;
						var peT = "U"+location_id;
					}
				}catch(e){
				    var pe = "U"+"error";
					var peT = pe;
				};
				
				
				
				if (!peTrip[pe])	
					{					
						//console.log(timestamp);	
						//console.log(pe);
						try{
							var tripsArr=[];
							tripsArr=Object.keys(peTrip[pe]);			
							if(tripsArr.length-2>0){
								//var tripsT = tripsArr[tripsArr.length-3];
								var tripsT = tripsArr[tripsArr.length-1];
							}else{
								var tripsT = "Gerc_0";
							}						
						}catch(e){
							var tripsT = "Gerc_0";
						};
						//console.log(tripsArr);
						//console.log(pe);
						//var tripsTT=tripsT.replace(/:/g,"");
						try{
							var timeDataT = timestamp;
						}catch(e){
							var timeDataT = "00:00";
						};
						//console.log(timeDataT);
						try{
							addnotvalid(peT, timeDataT);
							var nValid =[];
							nValid = arr[i].validations;
							for (var j = 0; j < nValid.length; j++) {
								timeDataT=nValid[j].timestamp;
								addvalid(peT, tripsT, timeDataT);
								//console.info(j+" - "+timeDataT);
							};	
						}catch(e){
							console.log("Помилка додавання вал. рейсу Герц - "+ peT+"_"+ tripsT+"_"+ timeDataT);
						};
						
				}else{
					
					try{
						var tripsArr=[];
						tripsArr=Object.keys(peTrip[pe]);						
						if(tripsArr.length-2>0){
							var tripsT = tripsArr[tripsArr.length-1];
						}else{
							var tripsT = "Gerc_0";
						};
					}catch(e){
						var tripsT = "Gerc_0";
					};
					/*
					for (var k = 2; k < tripsArr.length-1; k++) {
						console.log(JSON.stringify(peTrip[pe][tripsArr[k]]));
					};
					*/
					//var tripsTT=tripsT.replace(/:/g,"");
					try{
						var timeDataT = timestamp;
					}catch(e){
						var timeDataT = "00:00";
					};
					try{
						addnotvalid(peT, timeDataT);
						var nValid =[];
						nValid = arr[i].validations;
						//console.log(tripsT);	
					    //console.log(pe);
						//console.log(nValid);	
					
						for (var j = 0; j < nValid.length; j++) {
							//timeDataT=nValid[j].timestamp.substring(0,19).replace(/T/g,"");;
							timeDataT=nValid[j].timestamp;
							//console.log(peT +" - "+ tripsT +" - "+ timeDataT);
							addvalid(peT, tripsT, timeDataT); 
						};	
					}catch(e){
						console.log("Помилка додавання вал. рейсу Герц- "+ peT+"_"+ tripsT+"_"+ timeDataT);
					};	
				};
				
		};
		
		
		// запись файлов раз в 5 секунд
		var data = JSON.stringify(validPe);
			// перезаписываем файл с новыми данными
			fs.writeFileSync(validPeFile, data);
		
			
		if(valFlag){
						
			// запись файла рейсов с новыми данными
			//console.log("Запись");
			saveValTr();						
			//valFlag=false;
		};
		res.send("code: 205");		
		
	}
	
	catch (e) {
                console.log(e)
				res.sendStatus(417)
            }
	 }
);


	
	
	// удаление пользователя по id
	app.delete('/api/ausers/:id', function(req, res) {
		var id = req.params.id;
		var data = fs.readFileSync(usersFile, 'utf8');
		var users = JSON.parse(data);
		var index = -1;
		// находим индекс пользователя в массиве
		for (var i = 0; i < users.length; i++) {
			if (users[i].id == id) {
				index = i;
				break;
			}
		}
		if (index || index === 0) {
			// удаляем пользователя из массива по индексу
			var user = users.splice(index, 1)[0];
			var data = JSON.stringify(users);
			fs.writeFileSync(usersFile, data);
			// отправляем удаленного пользователя
			res.send(user);
			saveDB(usersFile, data);
		} else {
			res.status(404).send();
		}
	});
	// изменение пользователя
	app.put('/api/ausers', jsonParser, function(req, res) {
		if (!req.body) return res.sendStatus(400);

		var userId = req.body.id;
		var timestamp = req.body.timestamp;
		var line = req.body.line;
		var trip_id = req.body.trip_id;
		var passengers = req.body.passengers;
		var stop_code = req.body.stop_code;
		var stop_sequence = req.body.stop_sequence;
		var location_id = req.body.location_id;
		var product_id = req.body.product_id;
		var card_id = req.body.card_id;
		var doc_num = req.body.doc_num;

		var data = fs.readFileSync(usersFile, 'utf8');
		var users = JSON.parse(data);
		var user;
		for (var i = 0; i < users.length; i++) {
			if (users[i].id == userId) {
				user = users[i];
				break;
			}
		}
		// изменяем данные у пользователя
		if (user) {
			user.timestamp = timestamp;
			user.line = line;
			user.trip_id = trip_id;
			user.passengers = passengers;
			user.stop_code = stop_code;
			user.stop_sequence = stop_sequence;
			user.location_id = location_id;
			user.product_id = product_id;
			user.card_id = card_id;
			user.doc_num = doc_num;
									
			var data = JSON.stringify(users);
			fs.writeFileSync(usersFile, data);
			res.send(user);
			saveDB(usersFile, data);
		} else {
			res.status(404).send(user);
		}
	});
};
