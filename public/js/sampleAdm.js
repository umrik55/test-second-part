$.ajax(
    {
    url: "/roles",
    contentType: "application/json",
    method: "GET"}).done(function(data) {


    jsGrid.locale("ua");

    var SetApi = function(config) {
        jsGrid.Field.call(this, config);
    };
    var SetPass = function(config) {
        jsGrid.Field.call(this, config);
    };
    SetApi.prototype = new jsGrid.Field(SetApiType());
    SetPass.prototype = new jsGrid.Field(SetPasswordType());
    jsGrid.fields.SetApi = SetApi;
    jsGrid.fields.SetPass = SetPass;

    $("#jsGridAdm").jsGrid({
        height: "40%",
        width: "100%",
        filtering: true,
        filterable:true,
        inserting: true,
        editing: true,
        sorting: true,
        autoload: true,
        paging: false,
        pageSize: 50,
        loadIndication: true,
        loadIndicationDelay: 500,
        loadShading: true,
        pageButtonCount: 5,
        deleteConfirm: "Ви впевнені, що бажаєте видали?",
        controller: {
                    loadData:  function(filter) {
                        return $.ajax({
                            type: "GET",
                            url: "/admins",
                            data: filter
                        });

            },
            insertItem: function(item) {
                return $.ajax({
                    url: "/admins",
                    contentType: "application/json",
                    method: "POST",
                    data: JSON.stringify(item)
                });
            },
            updateItem: function(item) {
                return $.ajax({
                    url: "/admins",
                    contentType: "application/json",
                    method: "PUT",
                    data: JSON.stringify(item)
                });
            },
            deleteItem: function(item) {
                return $.ajax({
                    url: "/admins",
                    contentType: "application/json",
                    method: "DELETE",
                    data: JSON.stringify(item)
                });
            }
        },
        onOptionChanging: function(args) {
            //var filter = $("#jsGrid").jsGrid("getFilter");
            //console.log(filter)
        },
        onDataLoaded: function(args) {

        },
        onItemUpdated: function(args){

        },
        onItemInserting: function(args) {
            //console.log(args)
        },
        onItemInserted: function(args) {

        },
        onItemDeleted: function(args) {

        },
        fields: [
            { name: "email", title:"Email", type: "text"},
            { name: "username", title:"Username", type: "text"},
            { name: "password", title:"Password", type: "SetPass"},
            { name: "filial", title:"Filial", type: "number", width:30},
            { name: "level", title:"Level", type: "select", items: data, valueField: "id_level", textField: "name_level"},
            { name: "api_token", title:"API token", type: "SetApi", width:150},
            { name: "is_active", title:"Is active", type: "checkbox", width:30},
            { type: "control" }
        ]
    })
});


