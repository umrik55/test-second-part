$.ajax(
    {
    url: "/roles",
    contentType: "application/json",
    method: "GET"}).done(function(data) {


    jsGrid.locale("ua");

    $("#jsGridRole").jsGrid({
        height: "100%",
        width: "100%",
        filtering: true,
        filterable:true,
        inserting: true,
        editing: true,
        sorting: true,
        autoload: true,
        paging: false,
        pageSize: 10,
        loadIndication: true,
        loadIndicationDelay: 500,
        loadShading: true,
        pageButtonCount: 5,
        deleteConfirm: "Ви впевнені, що бажаєте видали?",
        controller: {
                    loadData:  function(filter) {
                        return $.ajax({
                            type: "GET",
                            url: "/roles",
                            data: filter
                        });

            },
            insertItem: function(item) {
                return $.ajax({
                    url: "/roles",
                    contentType: "application/json",
                    method: "POST",
                    data: JSON.stringify(item)
                });
            },
            updateItem: function(item) {
                return $.ajax({
                    url: "/roles",
                    contentType: "application/json",
                    method: "PUT",
                    data: JSON.stringify(item)
                });
            },
            deleteItem: function(item) {
                return $.ajax({
                    url: "/roles",
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
            { name: "name_level", title:"Name", type: "text"},
            { name: "id_level", title:"ID", type: "number"},
            { name: "read_route", title:"Read", type: "checkbox"},
            { name: "set_route", title:"Set", type: "checkbox"},
            { name: "delete_route", title:"Delete", type: "checkbox"},
            { name: "change_route", title:"Change", type: "checkbox"},
            { name: "api_route", title:"API", type: "checkbox"},
            { type: "control" }
        ]
    })
});