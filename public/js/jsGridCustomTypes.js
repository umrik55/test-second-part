var myChartFilial;

function setCarNumLocalType() {
  return {
    css: "date-field", // redefine general property 'css'
    align: "center", // redefine general property 'align'

    itemTemplate: function (value) {
      return value;
    },
    insertTemplate: function (value) {
      var gArr = [];
      return (this._insertAuto = $("<input id='carNumLoc'>").autocomplete({
        source: function (request, response) {
          $.ajax({
            url: "/api/get-cars-asotr" + request.term + "/" + "NumPe",
            type: "GET",
            dataType: "json",
            success: function (data) {
              gArr = data;
              var arr = [];

              for (var i = 0; i < data.length; i++) arr.push(data[i].NumPe);

              response(arr);
            },
            error: function (data) {
              response([]);
            },
          });
        },
        select: function (e, ui) {
          $("#carNumGl").val(gArr.find((x) => x.NumPe == ui.item.value).NumGov);
        },
      }));
    },
    insertValue: function () {
      return this._insertAuto.val();
    },
    editTemplate: function (value, value2) {
      if (value2.asotrNum == null) {
        var gArr = [];
        return (this._editAuto = $(
          "<input id='carNumLocEdit' value='" + value + "'>"
        ).autocomplete({
          source: function (request, response) {
            $.ajax({
              url: "/api/get-cars-asotr" + request.term + "/" + "NumPe",
              type: "GET",
              dataType: "json",
              success: function (data) {
                gArr = data;
                var arr = [];

                for (var i = 0; i < data.length; i++) arr.push(data[i].NumPe);

                response(arr);
              },
              error: function (data) {
                response([]);
              },
            });
          },
          select: function (e, ui) {
            $("#carNumGlEdit").val(
              gArr.find((x) => x.NumPe == ui.item.value).NumGov
            );
          },
        }));
      } else {
        return (this._editAuto = value);
      }
    },
    editValue: function () {
      return typeof this._editAuto !== "object"
        ? this._editAuto
        : this._editAuto.val();
    },

    filterTemplate: function (value) {
      var grid = this._grid;
      var gArrS = [];
      //autoSearch(this._grid)
      this._filterControl = $(
        "<input id='carNumLocFilter' class='autoFind'>"
      ).autocomplete({
        source: function (request, response) {
          $.ajax({
            url: "/api/get-cars-asotr" + request.term + "/" + "NumPe",
            type: "GET",
            dataType: "json",
            success: function (data) {
              gArrS = data;
              var arr = [];

              for (var i = 0; i < data.length; i++) arr.push(data[i].NumPe);

              response(arr);
            },
            error: function (data) {
              response([]);
            },
          });
        },
        select: function (e, ui) {
          $("#carNumGlFilter").val(
            gArrS.find((x) => x.NumPe == ui.item.value).NumGov
          );
        },
      });
      this._filterControl.on("keyup", function (e) {
        grid.search();
      });

      return this._filterControl;
    },
    filterValue: function () {
      return this._filterControl.val();
    },
  };
}

function setCarNumGlobalType() {
  return {
    css: "date-field", // redefine general property 'css'
    align: "center", // redefine general property 'align'

    itemTemplate: function (value) {
      return value;
    },
    insertTemplate: function (value) {
      var gArr2 = [];
      return (this._insertAuto = $("<input id='carNumGl'>").autocomplete({
        source: function (request, response) {
          $.ajax({
            url: "/api/get-cars-asotr" + request.term + "/" + "NumGov",
            type: "GET",
            dataType: "json",
            success: function (data) {
              gArr2 = data;
              var arr = [];

              for (var i = 0; i < data.length; i++) arr.push(data[i].NumGov);

              response(arr);
            },
            error: function (data) {
              response([]);
            },
          });
        },
        select: function (e, ui) {
          var NumPe = gArr2.find((x) => x.NumGov == ui.item.value).NumPe;
          $("#carNumLoc").val(NumPe ? NumPe : 0);
        },
      }));
    },
    insertValue: function () {
      return this._insertAuto.val();
    },
    editTemplate: function (value, value2) {
      if (value2.asotrNum == null) {
        var gArr2 = [];
        return (this._editAuto = $(
          "<input id='carNumGlEdit' value='" + value + "'>"
        ).autocomplete({
          source: function (request, response) {
            $.ajax({
              url: "/api/get-cars-asotr" + request.term + "/" + "NumGov",
              type: "GET",
              dataType: "json",
              success: function (data) {
                gArr2 = data;
                var arr = [];

                for (var i = 0; i < data.length; i++) arr.push(data[i].NumGov);

                response(arr);
              },
              error: function (data) {
                response([]);
              },
            });
          },
          select: function (e, ui) {
            var NumPe = gArr2.find((x) => x.NumGov == ui.item.value).NumPe;
            $("#carNumLocEdit").val(NumPe ? NumPe : 0);
          },
        }));
      } else {
        return (this._editAuto = value);
      }
    },
    editValue: function () {
      return typeof this._editAuto !== "object"
        ? this._editAuto
        : this._editAuto.val();
    },
    filterTemplate: function (value) {
      var grid = this._grid;
      var gArr2S = [];
      this._filterControl = $("<input id='carNumGlFilter'>").autocomplete({
        source: function (request, response) {
          $.ajax({
            url: "/api/get-cars-asotr" + request.term + "/" + "NumGov",
            type: "GET",
            dataType: "json",
            success: function (data) {
              gArr2S = data;
              var arr = [];

              for (var i = 0; i < data.length; i++) arr.push(data[i].NumGov);

              response(arr);
            },
            error: function (data) {
              response([]);
            },
          });
        },
        select: function (e, ui) {
          $("#carNumLocFilter").val(
            gArr2S.find((x) => x.NumGov == ui.item.value).NumPe
          );
        },
      });

      this._filterControl.on("keyup", function (e) {
        grid.search();
      });

      return this._filterControl;
    },
    filterValue: function () {
      return this._filterControl.val();
    },
  };
}

function setDriverNumType() {
  return {
    edit: "false",
    css: "date-field", // redefine general property 'css'
    align: "center", // redefine general property 'align'

    itemTemplate: function (value) {
      return value;
    },
    insertTemplate: function (value) {
      var grid = this._grid;
      var gArr3 = [];
      return (this._insertAuto = $("<input id='driverNum'>").autocomplete({
        source: function (request, response) {
          $.ajax({
            url: "/api/get-drivers-asotr" + request.term + "/" + "basic_number",
            type: "GET",
            dataType: "json",
            success: function (data) {
              gArr3 = data;
              var arr = [];

              for (var i = 0; i < data.length; i++)
                arr.push(data[i].basic_number);

              response(arr);
            },
            error: function (data) {
              response([]);
            },
          });
        },
        select: function (e, ui) {
          $("#driverName").val(
            gArr3.find((x) => x.basic_number == ui.item.value).name
          );
        },
      }));
    },
    insertValue: function () {
      return this._insertAuto.val();
    },

    editTemplate: function (value, value2) {
      if (value2.asotrNum == null) {
        var gArr3 = [];
        return (this._editAuto = $(
          "<input id='driverNumEdit' value='" + value + "'>"
        ).autocomplete({
          source: function (request, response) {
            $.ajax({
              url:
                "/api/get-drivers-asotr" + request.term + "/" + "basic_number",
              type: "GET",
              dataType: "json",
              success: function (data) {
                gArr3 = data;
                var arr = [];

                for (var i = 0; i < data.length; i++)
                  arr.push(data[i].basic_number);

                response(arr);
              },
              error: function (data) {
                response([]);
              },
            });
          },
          select: function (e, ui) {
            $("#driverNameEdit").val(
              gArr3.find((x) => x.basic_number == ui.item.value).name
            );
          },
        }));
      } else {
        return (this._editAuto = value);
      }
    },
    editValue: function () {
      return typeof this._editAuto !== "object"
        ? this._editAuto
        : this._editAuto.val();
    },

    filterTemplate: function (value) {
      var grid = this._grid;
      var gArr3S = [];
      this._filterControl = $("<input id='driverNumFilter'>").autocomplete({
        source: function (request, response) {
          $.ajax({
            url: "/api/get-drivers-asotr" + request.term + "/" + "basic_number",
            type: "GET",
            dataType: "json",
            success: function (data) {
              gArr3S = data;
              var arr = [];

              for (var i = 0; i < data.length; i++)
                arr.push(data[i].basic_number);

              response(arr);
            },
            error: function (data) {
              response([]);
            },
          });
        },
        select: function (e, ui) {
          $("#driverNameFilter").val(
            gArr3S.find((x) => x.basic_number == ui.item.value).name
          );
        },
      });
      this._filterControl.on("keyup", function (e) {
        grid.search();
      });

      return this._filterControl;
    },
    filterValue: function () {
      return this._filterControl.val();
    },
  };
}

function setDriverNameType() {
  return {
    itemTemplate: function (value) {
      return value;
    },
    insertTemplate: function (value) {
      var gArr4 = [];
      return (this._insertAuto = $("<input id='driverName'>").autocomplete({
        source: function (request, response) {
          $.ajax({
            url: "/api/get-drivers-asotr" + request.term + "/" + "name",
            type: "GET",
            dataType: "json",
            success: function (data) {
              gArr4 = data;
              var arr = [];

              for (var i = 0; i < data.length; i++) arr.push(data[i].name);

              response(arr);
            },
            error: function (data) {
              response([]);
            },
          });
        },
        select: function (e, ui) {
          $("#driverNum").val(
            gArr4.find((x) => x.name == ui.item.value).basic_number
          );
        },
      }));
    },
    insertValue: function () {
      return this._insertAuto.val();
    },

    editTemplate: function (value, value2) {
      if (value2.asotrNum == null) {
        var gArr4 = [];
        return (this._editAuto = $(
          "<input id='driverNameEdit' value='" + value + "'>"
        ).autocomplete({
          source: function (request, response) {
            $.ajax({
              url: "/api/get-drivers-asotr" + request.term + "/" + "name",
              type: "GET",
              dataType: "json",
              success: function (data) {
                gArr4 = data;
                var arr = [];

                for (var i = 0; i < data.length; i++) arr.push(data[i].name);

                response(arr);
              },
              error: function (data) {
                response([]);
              },
            });
          },
          select: function (e, ui) {
            $("#driverNumEdit").val(
              gArr4.find((x) => x.name == ui.item.value).basic_number
            );
          },
        }));
      } else {
        return (this._editAuto = value);
      }
    },
    editValue: function () {
      return typeof this._editAuto !== "object"
        ? this._editAuto
        : this._editAuto.val();
    },
    filterTemplate: function (value) {
      var grid = this._grid;
      var gArr4S = [];
      this._filterControl = $("<input id='driverNameFilter'>").autocomplete({
        source: function (request, response) {
          $.ajax({
            url: "/api/get-drivers-asotr" + request.term + "/" + "name",
            type: "GET",
            dataType: "json",
            success: function (data) {
              gArr4S = data;
              var arr = [];

              for (var i = 0; i < data.length; i++) arr.push(data[i].name);

              response(arr);
            },
            error: function (data) {
              response([]);
            },
          });
        },
        select: function (e, ui) {
          $("#driverNumFilter").val(
            gArr4S.find((x) => x.name == ui.item.value).basic_number
          );
        },
      });

      this._filterControl.on("keyup", function (e) {
        grid.search();
      });
      return this._filterControl;
    },
    filterValue: function () {
      return this._filterControl.val();
    },
  };
}

function setRouteNameType() {
  return {
    edit: "true",
    itemTemplate: function (value) {
      return value;
    },
    insertTemplate: function (value) {
      return (this._insertAuto = $("<input id='routeName'>").autocomplete({
        source: function (request, response) {
          $.ajax({
            url: "/api/get-routes-asotr" + request.term + "/" + "Num",
            type: "GET",
            dataType: "json",
            success: function (data) {
              var arr = [];

              for (var i = 0; i < data.length; i++) arr.push(data[i].Num);

              response(arr);
            },
            error: function (data) {
              response([]);
            },
          });
        },
        select: function (e, ui) {
          //$('#driverNum').val(gArr4.find(x => x.name == ui.item.value).basic_number);
        },
      }));
    },
    insertValue: function () {
      return this._insertAuto.val();
    },
    editTemplate: function (value, value2) {
      if (value2.asotrNum == null) {
        return (this._editControl = $(
          "<input id='routeNameEdit' value='" + value + "'>"
        ).autocomplete({
          source: function (request, response) {
            $.ajax({
              url: "/api/get-routes-asotr" + request.term + "/" + "Num",
              type: "GET",
              dataType: "json",
              success: function (data) {
                var arr = [];

                for (var i = 0; i < data.length; i++) arr.push(data[i].Num);

                response(arr);
              },
              error: function (data) {
                response([]);
              },
            });
          },
          select: function (e, ui) {
            //$('#driverNumFilter').val(gArr4S.find(x => x.name == ui.item.value).basic_number);
          },
        }));
      } else {
        return (this._editControl = value);
      }
    },
    editValue: function () {
      return typeof this._editControl !== "object"
        ? this._editControl
        : this._editControl.val();
    },
    filterTemplate: function (value) {
      var grid = this._grid;
      this._filterControl = $("<input id='routeNameFilter'>").autocomplete({
        source: function (request, response) {
          $.ajax({
            url: "/api/get-routes-asotr" + request.term + "/" + "Num",
            type: "GET",
            dataType: "json",
            success: function (data) {
              var arr = [];

              for (var i = 0; i < data.length; i++) arr.push(data[i].Num);

              response(arr);
            },
            error: function (data) {
              response([]);
            },
          });
        },
        select: function (e, ui) {
          //$('#driverNumFilter').val(gArr4S.find(x => x.name == ui.item.value).basic_number);
        },
      });
      this._filterControl.on("keyup", function (e) {
        grid.search();
      });

      return this._filterControl;
    },
    filterValue: function () {
      return this._filterControl.val();
    },
  };
}

function setDatePickerType() {
  return {
    css: "date-field", // redefine general property 'css'
    align: "center", // redefine general property 'align'

    sorter: function (date1, date2) {
      return new Date(date1) - new Date(date2);
    },

    itemTemplate: function (value) {
      return new Date(value).customFormat("#DD#.#MM#.#YYYY#");
    },

    insertTemplate: function (value) {
      return (this._insertPicker = $(
        "<input id='datetimepicker'>"
      ).datetimepicker({
        format: "d.m.Y",
        mask: true,
        closeOnDateSelect: true,
        onSelectDate: function (ct, $i) {
          //
        },
      }));
    },

    editTemplate: function (value, value2) {
      if (value2.asotrNum == null) {
        return (this._editPicker = $(
          "<input id='datetimepickerE'>"
        ).datetimepicker({
          format: "d.m.Y",
          mask: true,
          closeOnDateSelect: true,
          onSelectDate: function (ct, $i) {
            //
          },
        }));
      } else {
        return (this._editPicker = new Date(value).customFormat(
          "#DD#.#MM#.#YYYY#"
        ));
      }
    },

    filterTemplate: function (value) {
      var grid = this._grid;
      return (this._filterPicker = $(
        "<input id='datetimepickerF'>"
      ).datetimepicker({
        format: "d.m.Y",
        mask: true,
        closeOnDateSelect: true,
        onSelectDate: function (ct, $i) {
          grid.search();
        },
      }));
    },

    filterValue: function () {
      return this._filterPicker.datetimepicker("getValue") != null
        ? this._filterPicker
            .datetimepicker("getValue")
            .customFormat("#YYYY#-#MM#-#DD#")
        : "";
    },

    insertValue: function () {
      return this._insertPicker.datetimepicker("getValue").toISOString();
    },

    editValue: function () {
      return this._editPicker.datetimepicker("getValue").toISOString();
    },
  };
}

function setDatePeriodPickerType() {
  var initDateE = new Date();
  var initDateS = new Date();
  initDateS.setHours(0, 0, 0);

  return {
    css: "date-field", // redefine general property 'css'
    align: "center", // redefine general property 'align'

    sorter: function (date1, date2) {
      return new Date(date1) - new Date(date2);
    },

    itemTemplate: function (value) {
      return new Date(value).customFormat("#YYYY#-#MM#-#DD# #hhhh#:#mm#");
    },

    filterTemplate: function (value) {
      var grid = this._grid;
      return (this._periodfilterPicker = $(
        "<input id='datetimepicker_period'>"
      ).daterangepicker(
        {
          startDate: initDateS,
          endDate: initDateE,
          timePicker: true,
          timePicker24Hour: true,
          locale: {
            format: "YYYY-MM-DD H:mm",
            applyLabel: "Пошук",
            cancelLabel: "Відміна",
            fromLabel: "Період з",
            toLabel: "По",
            customRangeLabel: "Custom",
            daysOfWeek: ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
            monthNames: [
              "Cічень",
              "Лютий",
              "Березень",
              "Квітень",
              "Травень",
              "Червень",
              "Липень",
              "Серпень",
              "Вересень",
              "Жовтень",
              "Листопад",
              "Грудень",
            ],
            firstDay: 1,
          },
          opens: "left",
        },
        function (start, end, label) {
          var localFilter = $("#jsGridAsopPlanFact").data("JSGrid").getFilter();

          if (someFilter) {
            if (someFilter.id) localFilter.id = someFilter.id;

            if (someFilter.name_filial)
              localFilter.name_filial = someFilter.name_filial;

            if (someFilter.type_filial)
              localFilter.type_filial = someFilter.type_filial;

            if (someFilter.not_validations)
              localFilter.not_validations = someFilter.not_validations;
          }

          grid.search(localFilter);

          if (localFilter.not_validations)
            showChartNotValidations(localFilter, 0);
          else showChart(localFilter);
        }
      ));
    },

    filterValue: function () {
      //console.log($('#datetimepicker_period').data('daterangepicker').startDate._d.customFormat("#YYYY#-#MM#-#DD#"));
      //return this._filterPicker.datetimepicker("getValue") != null? this._filterPicker.datetimepicker("getValue").customFormat("#YYYY#-#MM#-#DD#") : ""
      return {
        dateS: $("#datetimepicker_period")
          .data("daterangepicker")
          .startDate._d.customFormat("#YYYY#-#MM#-#DD# #hhhh#:#mm#"),
        dateE: $("#datetimepicker_period")
          .data("daterangepicker")
          .endDate._d.customFormat("#YYYY#-#MM#-#DD# #hhhh#:#mm#"),
      };
    },
  };
}

function setDatePeriodPickerType2() {
  return {
    css: "date-field", // redefine general property 'css'
    align: "center", // redefine general property 'align'

    sorter: function (date1, date2) {
      return new Date(date1) - new Date(date2);
    },

    itemTemplate: function (value) {
      return new Date(value).customFormat("#DD#-#MM#-#YYYY# #hhhh#:#mm#:#ss#");
    },
  };
}

function setNumFuelType() {
  return {
    css: "date-field", // redefine general property 'css'
    align: "center", // redefine general property 'align'

    itemTemplate: function (value) {
      return value;
    },

    insertTemplate: function (value) {
      return (this._insertNumFuel = $("<input id='numFuel'>"));
    },

    editTemplate: function (value, value2) {
      if (value2.asotrNum == null) {
        return (this._editNumFuel = $(
          "<input id='numFuel' value='" + value + "'>"
        ));
      } else {
        return (this._editNumFuel = value);
      }
    },

    filterTemplate: function (value) {
      //return this._filterNumFuel = $("<input id='numFuelfilter'>");

      var grid = this._grid;
      this._filterNumFuel = $("<input id='numFuelfilter'>");
      this._filterNumFuel.on("keyup", function (e) {
        var localFilter = $("#jsGridAsopPlanFact").data("JSGrid").getFilter();

        if (someFilter) {
          if (someFilter.id) localFilter.id = someFilter.id;

          if (someFilter.name_filial)
            localFilter.name_filial = someFilter.name_filial;

          if (someFilter.type_filial)
            localFilter.type_filial = someFilter.type_filial;

          if (someFilter.not_validations)
            localFilter.not_validations = someFilter.not_validations;
        }

        grid.search(localFilter);

        //console.log(localFilter)

        //if(localFilter.not_validations)
        //showChartNotValidations(localFilter, 0);
        //else
        //showChart(localFilter);
      });

      return this._filterNumFuel;
    },

    insertValue: function () {
      return this._insertNumFuel.val();
    },

    editValue: function () {
      return typeof this._editNumFuel !== "object"
        ? this._editNumFuel
        : this._editNumFuel.val();
    },

    filterValue: function () {
      return this._filterNumFuel.val();
    },
  };
}

function setNumEshlType() {
  return {
    css: "date-field", // redefine general property 'css'
    align: "center", // redefine general property 'align'

    itemTemplate: function (value) {
      return value;
    },

    insertTemplate: function (value) {
      return (this._insertNumEshl = $("<input id='numEshl'>").inputmask({
        mask: "9999-99-99_9999",
      }));
    },

    editTemplate: function (value, value2) {
      if (value2.asotrNum == null) {
        return (this._editNumEshl = $(
          "<input id='numEshlEdit' value='" + value + "'>"
        ).inputmask({ mask: "9999-99-99_9999" }));
      } else {
        return (this._editNumEshl = value);
      }
    },

    filterTemplate: function (value) {
      var grid = this._grid;
      this._filterNumEshl = $("<input id='numEshlfilter'>");

      this._filterNumEshl.on("keyup", function (e) {
        grid.search();
      });

      return this._filterNumEshl;
    },

    insertValue: function () {
      return this._insertNumEshl.val();
    },

    editValue: function () {
      return typeof this._editNumEshl !== "object"
        ? this._editNumEshl
        : this._editNumEshl.val();
    },

    filterValue: function () {
      return this._filterNumEshl.val();
    },
  };
}

function setChangerNameType() {
  return {
    css: "date-field", // redefine general property 'css'
    align: "center", // redefine general property 'align'

    itemTemplate: function (value) {
      return value;
    },

    insertTemplate: function (value) {
      return (this._insertNameChanger = (function () {
        var tmp = null;
        $.ajax({
          async: false,
          type: "GET",
          global: false,
          dataType: "json",
          url: "/get-my-data",
          success: function (data) {
            tmp = data.username;
          },
        });
        return tmp;
      })());
    },

    editTemplate: function (value) {
      return (this._editNameChanger = (function () {
        var tmp = null;
        $.ajax({
          async: false,
          type: "GET",
          global: false,
          dataType: "json",
          url: "/get-my-data",
          success: function (data) {
            tmp = data.username;
          },
        });
        return tmp;
      })());
    },

    filterTemplate: function (value) {
      var grid = this._grid;
      this._filterNameChanger = $("<input id='nameChangerFilter'>");
      this._filterNameChanger.on("keyup", function (e) {
        grid.search();
      });

      return this._filterNameChanger;
    },

    insertValue: function () {
      return this._insertNameChanger;
    },

    editValue: function () {
      return this._editNameChanger;
    },

    filterValue: function () {
      return this._filterNameChanger.val();
    },
  };
}

function SetApiType() {
  return {
    css: "date-field", // redefine general property 'css'
    align: "center", // redefine general property 'align'

    itemTemplate: function (value) {
      return value;
    },

    insertTemplate: function () {
      return (this._insertSetApi = generate_token(32));
    },

    editTemplate: function (value) {
      return (this._editSetApi = generate_token(32));
    },

    insertValue: function () {
      return this._insertSetApi;
    },

    editValue: function () {
      return this._editSetApi;
    },
  };
}

function SetPasswordType() {
  return {
    css: "date-field", // redefine general property 'css'
    align: "center", // redefine general property 'align'

    itemTemplate: function (value) {
      return value;
    },

    insertTemplate: function () {
      return (this._insertSetPass = generate_token(8));
    },

    editTemplate: function (value) {
      return (this._editSetPass = generate_token(8));
    },

    insertValue: function () {
      return this._insertSetPass;
    },

    editValue: function () {
      return this._editSetPass;
    },
  };
}

function SetHyperLinkTypeCar() {
  return {
    css: "date-field", // redefine general property 'css'
    align: "center", // redefine general property 'align'

    itemTemplate: function (value, item) {
      //<a class="iframeFuel" data-fancybox-type="iframe" href="/remains" >Журнал залишків</a>
      var $link = $("<a class='iframeFuelMore'>")
        .attr("id_filial", `${item.id_filial}`)
        .text(item.name_filial);
      return $(
        "<div class='filialMore' data-filial='" + item.id_filial + "'>"
      ).append($link);
    },

    filterTemplate: function (value) {
      var grid = this._grid;
      this._filterLinkChanger = $("<input id='linkChangerFilter'>");
      this._filterLinkChanger.on("keyup", function (e) {
        grid.search();
      });

      return this._filterLinkChanger;
    },
    filterValue: function () {
      return this._filterLinkChanger.val();
    },
  };
}

function SetTextAutoFilterType() {
  return {
    css: "date-field", // redefine general property 'css'
    align: "center", // redefine general property 'align'

    sorter: function (val1, val2) {
      if (val1 === "") val1 = "0";

      if (val2 === "") val2 = "0";

      return val1 - val2;
    },

    itemTemplate: function (value, item) {
      return value;
    },

    filterTemplate: function (value) {
      var grid = this._grid;
      this._filterLinkChanger = $(`<input id='${this.name}ChangerFilter'>`);
      this._filterLinkChanger.on("keyup", function (e) {
        grid.search();
      });

      return this._filterLinkChanger;
    },
    filterValue: function () {
      return this._filterLinkChanger.val();
    },
  };
}

function SetTextAutoFilterTypeCar() {
  return {
    css: "date-field", // redefine general property 'css'
    align: "center", // redefine general property 'align'

    itemTemplate: function (value, item) {
      return value;
    },

    filterTemplate: function (value) {
      var grid = this._grid;
      this._filterLinkChangerCar = $(
        `<input id='ChangerFilterCar' value='${
          JSON.parse($("#scriptID").html()).car
        }'>`
      );
      this._filterLinkChangerCar.on("keyup", function (e) {
        grid.search();
      });

      return this._filterLinkChangerCar;
    },
    filterValue: function () {
      return this._filterLinkChangerCar.val();
    },
  };
}

function calcAllLitres(arrData) {
  var result = arrData.reduce((a, b) => +a + +b.fuelCount, 0);
  $("#countLit").html(
    "<h1>Кількість літрів за заданим фільтром: <b><font color='red'>" +
      result +
      "</font></b></h1>"
  );
  return result;
}

function calcAllLitresMore(arrData) {
  var result = arrData.reduce((a, b) => +a + +b.PEfuelOst2, 0);
  $("#countLitMore").html(
    "<h3> | Залишок палива по РО за заданим фільтром: <b><font color='red'>" +
      result +
      "</font></b>(л)</h3>"
  );
  return result;
}

Date.prototype.customFormat = function (formatString) {
  var YYYY,
    YY,
    MMMM,
    MMM,
    MM,
    M,
    DDDD,
    DDD,
    DD,
    D,
    hhhh,
    hhh,
    hh,
    h,
    mm,
    m,
    ss,
    s,
    ampm,
    AMPM,
    dMod,
    th;
  YY = ((YYYY = this.getFullYear()) + "").slice(-2);
  MM = (M = this.getMonth() + 1) < 10 ? "0" + M : M;
  MMM = (MMMM = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ][M - 1]).substring(0, 3);
  DD = (D = this.getDate()) < 10 ? "0" + D : D;
  DDD = (DDDD = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ][this.getDay()]).substring(0, 3);
  th =
    D >= 10 && D <= 20
      ? "th"
      : (dMod = D % 10) == 1
      ? "st"
      : dMod == 2
      ? "nd"
      : dMod == 3
      ? "rd"
      : "th";
  formatString = formatString
    .replace("#YYYY#", YYYY)
    .replace("#YY#", YY)
    .replace("#MMMM#", MMMM)
    .replace("#MMM#", MMM)
    .replace("#MM#", MM)
    .replace("#M#", M)
    .replace("#DDDD#", DDDD)
    .replace("#DDD#", DDD)
    .replace("#DD#", DD)
    .replace("#D#", D)
    .replace("#th#", th);
  h = hhh = this.getHours();
  if (h == 0) h = 24;
  if (h > 12) h -= 12;
  hh = h < 10 ? "0" + h : h;
  hhhh = hhh < 10 ? "0" + hhh : hhh;
  AMPM = (ampm = hhh < 12 ? "am" : "pm").toUpperCase();
  mm = (m = this.getMinutes()) < 10 ? "0" + m : m;
  ss = (s = this.getSeconds()) < 10 ? "0" + s : s;
  return formatString
    .replace("#hhhh#", hhhh)
    .replace("#hhh#", hhh)
    .replace("#hh#", hh)
    .replace("#h#", h)
    .replace("#mm#", mm)
    .replace("#m#", m)
    .replace("#ss#", ss)
    .replace("#s#", s)
    .replace("#ampm#", ampm)
    .replace("#AMPM#", AMPM);
};

//TODO: generate random token for din model
function generate_token(length) {
  //edit the token allowed characters
  let a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split(
    ""
  );
  let b = [];
  for (let i = 0; i < length; i++) {
    let j = (Math.random() * (a.length - 1)).toFixed(0);
    b[i] = a[j];
  }
  return b.join("");
}

function editPickerFixDate(str) {
  var date = str.split(" ")[0];
  date = date.split(".");
  var time = str.split(" ")[1];
  console.log(date[2] + "-" + date[1] + "-" + date[0] + "T" + time);
  return new Date(
    date[2] + "-" + date[1] + "-" + date[0] + "T" + time
  ).toISOString();
}

$("body").on("click", ".exportLink", function () {
  var arrData = $("#jsGrid").jsGrid("option", "data");
  var allCount = calcAllLitres(arrData);

  $("#dvjson").excelexportjs({
    containerid: "jsGrid",
    datatype: "table",
    all: allCount,
  });
});

$("body").on("click", ".exportLinkTable", function () {
  //var arrData = $("#jsGridMore").jsGrid("option", "data");
  $("#dvjson").excelexportjs({
    containerid: "jsGridMovingMore",
    datatype: "table",
    all: false,
  });
});

$("body").on("click", ".updateLink", function () {
  location.reload();
});

$("body").on("click", ".filialMore", function () {
  var id = $(this).attr("data-filial");

  var dates = {
    dateS: $("#datetimepicker_period")
      .data("daterangepicker")
      .startDate._d.customFormat("#YYYY#-#MM#-#DD# #hhhh#:#mm#"),
    dateE: $("#datetimepicker_period")
      .data("daterangepicker")
      .endDate._d.customFormat("#YYYY#-#MM#-#DD# #hhhh#:#mm#"),
  };

  document.getElementById(
    "labelChartFilial"
  ).innerHTML = `Всього по: ${this.innerText} за обраний період.`;

  $.ajax({
    url: "/asop-get-plan-fact-diagram",
    contentType: "application/json",
    method: "POST",
    data: JSON.stringify({ date_time: dates, id: id }),
  }).done(function (data) {
    var ctxF = document.getElementById("myChartFilial").getContext("2d");

    if (myChartFilial != null) {
      myChartFilial.destroy();
    }

    myChartFilial = new Chart(ctxF, {
      type: "bar",
      data: {
        labels: data.labels,
        datasets: [
          {
            label: "Кількість рухомого складу",
            data: data.vehicles,
            backgroundColor: "rgba(0, 204, 102, 0.8)",
            borderColor: "rgba(0, 204, 102, 0.8)",
            borderWidth: 1,
          },
          {
            label: "Кількість валідацій",
            data: data.validations,
            backgroundColor: "rgba(51, 51, 255, 0.8)",
            borderColor: "rgba(51, 51, 255, 0.8)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },
    });
    myChart.canvas.parentNode.style.width = "1028px";
  });

  $.fancybox({
    width: 1000,
    height: 600,
    autoSize: false,
    content: $("#filialGraph"),
  });
});

$("body").on("click", "#userMore", function () {
  var carNum = this.innerText;
  $("#jsGridMovingMore").jsGrid("loadData");
});
