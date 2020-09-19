var typesSelect = [
    {id: 0, val:'Червона'},
    {id: 1, val:'Синя'},
    {id: 2, val:'Зелена'},
    {id: 3, val:'Борщагівська лінія ШТ'},
    {id: 4, val:'Фунікулер'},
    {id: 5, val:'Троєщинська лінія ШТ'},
    {id: 6, val:'Міська електричка'}
]


    jsGrid.locale("ua");

    var AutoFilter = function (config) {
        jsGrid.Field.call(this, config);
    };

    var AutoFilterNum = function (config) {
        jsGrid.Field.call(this, config);
    };

    AutoFilter.prototype = new jsGrid.Field(setAutoFilterType());
    AutoFilterNum.prototype = new jsGrid.Field(setAutoFilterTypeNum());

    jsGrid.fields.AutoFilter = AutoFilter;
    jsGrid.fields.AutoFilterNum = AutoFilterNum;

    $("#jsGridAsop").jsGrid({
        height: "100%",
        width: "100%",
        filtering: true,
        filterable: true,
        inserting: true,
        editing: true,
        deleting: true,
        sorting: true,
        autoload: true,
        paging: true,
        pageSize: 50,
        loadIndication: true,
        loadIndicationDelay: 500,
        loadShading: true,
        pageButtonCount: 5,
        noDataContent: "Дані не знайдені, зверніться до адміністратора!",
        deleteConfirm: "Ви впевнені, що бажаєте видали?",
        invalidNotify: function(args) {
            var msgArr = args.errors
            console.log(msgArr)
            var totalStr = "";

            for (var i=0; i<msgArr.length; i++){
                if(i===0)
                    totalStr = msgArr[i].message;
                else
                    totalStr += `<br>${msgArr[i].message}`;
            }

            $('#warning-alert').html(totalStr);
            $('#warning-alert').show();
        },
        controller: {
            loadData: function (filter) {
                return $.ajax({
                    url: "/asop-get",
                    contentType: "application/json",
                    method: "POST",
                    data: JSON.stringify(filter)
                }).done(function(data) {
                    document.getElementById("loader").style.display = "none";
                })
            },
            insertItem: function(item) {
                document.getElementById("loader").style.display = "block";
                return $.ajax({
                    url: "/asop-manipulate",
                    contentType: "application/json",
                    method: "POST",
                    data: JSON.stringify(item),
                    success: function(res){
                        res.status === 200? $("#jsGridAsop").jsGrid("option", "data", res.data) : alert("Помилка при додаванні даних, зверніться до адміністратора!")//replace grid data
                        document.getElementById("loader").style.display = "none";
                    }
                }).error((e) =>{if(e.status === 500){alert("Доступ заборонено, зверніться до адміністратора!")}});
            },
            updateItem: function(item) {
                document.getElementById("loader").style.display = "block";
                return $.ajax({
                    url: "/asop-manipulate",
                    contentType: "application/json",
                    method: "PUT",
                    data: JSON.stringify(item),
                    success: function(res){
                        res.status === 200? $("#jsGridAsop").jsGrid("option", "data", res.data) : alert("Помилка при додаванні даних, зверніться до адміністратора!")//replace grid data
                        document.getElementById("loader").style.display = "none";
                    }
                }).error((e) =>{if(e.status === 500){alert("Доступ заборонено, зверніться до адміністратора!")}});
            },
            deleteItem: function(item) {
                document.getElementById("loader").style.display = "block";
                return $.ajax({
                    url: "/asop-manipulate",
                    contentType: "application/json",
                    method: "DELETE",
                    data: JSON.stringify(item),
                    success: function(res){
                        res.status === 200? $("#jsGridAsop").jsGrid("option", "data", res.data) : alert("Помилка при видаленні даних, зверніться до адміністратора!")//replace grid data
                        document.getElementById("loader").style.display = "none";
                    }
                }).error((e) =>{if(e.status === 500){alert("Доступ заборонено, зверніться до адміністратора!")}});
            }
        },
        fields: [
            {name: "type", type: "select", items: typesSelect,
                valueField: "id",             // name of property of item to be used as value
                textField: "val",              // name of property of item to be used as displaying value
                filtering: true
            },
            {name: "Locatio_ID", type: "AutoFilterNum", filtering: true, validate: { message: "Поле <b>Location_ID</b> обов'язкове до заповнення!", validator: function(value) { return value !== ""; } } },
            {name: "Station", type: "AutoFilter", filtering: true, validate: { message: "Поле <b>Station</b> обов'язкове до заповнення!", validator: function(value) { return value !== ""; } }},
            {name: "AKP_number", title:"AKP_n", type: "AutoFilterNum", filtering: true, validate: { message: "Поле <b>AKP_n</b> обов'язкове до заповнення!", validator: function(value) { return value !== ""; } }},
            {name: "AKP_Inventory_______number", title:"AKP_InvN", type: "AutoFilter", filtering: true},
            {name: "PLACE_ID", type: "AutoFilterNum", filtering: true, validate: { message: "Поле <b>PLACE_ID</b> обов'язкове до заповнення!", validator: function(value) { return value !== ""; } }},
            {name: "IP_AKP", type: "AutoFilter", filtering: true},
            {name: "MAC", type: "AutoFilter", filtering: true},
            {name: "Type_equipment", type: "AutoFilter",filtering: true, validate: { message: "Поле <b>Type_equipment</b> обов'язкове до заповнення!", validator: function(value) { return value !== ""; } }},
            {name: "Number_RIDANGO", title:"Number_RID", type: "AutoFilterNum", filtering: true, validate: { message: "Поле <b>Number_RID</b> обов'язкове до заповнення!", validator: function(value) { return value !== ""; } }},
            {name: "IP_RIDANGO", title:"IP_RID", type: "AutoFilter"},
            {name: "MAC_RID", title:"MAC_RID", type: "AutoFilter"},
            {name: "Data_sending_link", type: "AutoFilter",filtering: true, width:140},
            {name: "Reserve_RIDANGO", title:"Reserve_RID", type: "AutoFilter", filtering: true},
            {name: "Notes", type: "AutoFilter", filtering: true},
            { type: "control" }
        ]
})


