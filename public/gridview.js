/**
 * http://usejsdoc.org/
 */

function GridView(aid) {
  this.classname = "gridview";

  this.InitDefaults();

  if (aid != undefined) {
    this.id_table = aid;
    this.ref_table = aid;
  }
}

GridView.prototype.setUserFormId = function (aid) {
  this.ref_userform = aid;
};

GridView.prototype.setDataProvider = function (aprovider) {
  this.p = aprovider;
  this.bUseDataProvider = true;
};

GridView.prototype.updateCache = function () {
  var ptr = this;

  try {
    this.p.getAll(function (data) {
      // update data and rerender grid
      /////   alert('callback called!  ');
      /////   alert('Data: ' + JSON.stringify(data));
      ptr.updateDataStore.call(ptr, data);
    });
  } catch (e) {
    alert("updateCache Error " + e.message);
  }
};

GridView.prototype.getSelectedOption = function (sel) {
  var res;
  try {
    //return sel.options[sel.value-1].text;
    res = $(sel).find("option:selected").text();
  } catch (e) {
    alert("getSelectedOption Error " + e.message);
    return "error";
  }
  return res;
};

GridView.prototype.resetData = function () {
  var fx = this.getUserFormElements();
  var ctl = fx["id"];
  ctl.value = 0;
};

// Method to gather data from form controls
GridView.prototype.getData = function () {
  ////////  alert('getData called!');
  var datarow = {};
  var fx = this.getUserFormElements();

  try {
    for (f in this.formfields) {
      var a = this.formfields[f];
      /////  alert('A: ' + JSON.stringify(a));

      ////// alert('ControlName: ' + a.uf_id);
      var ctl = fx[a.uf_id];
      var name = a.name;

      ///////// alert('ControlName: ' + a.uf_id + 'DataFieldName: '  + name);
      datarow[name] = ctl.value;
      if (a.sel != undefined) {
        if (a.fldtype == 4) {
          // sel options
          name = a.sel.opt;
          ////////    alert('Selector: ' + name);
          datarow[name] = this.getSelectedOption(ctl);
        }
      }
    }
  } catch (e) {
    alert("getData Error " + e.message);
  }

  //////  alert('get Data: ' + JSON.stringify(datarow));

  this.resetData();
  return datarow;
};

GridView.prototype.saveData = function () {
  var bIsNewRow = true;
  // Get data from userForm Controls
  var datarow = this.getData();
  if (datarow.id > 0) {
    bIsNewRow = false;
  }

  var ptr = this;
  this.p.saveRow(datarow, function (item) {
    ///////   alert('SaveRow callback called');
    ptr.updateDataStoreRow(item);

    var row = ptr.renderRow.call(ptr, item);
    if (bIsNewRow) {
      ptr.getTableBodyjq.call(ptr).append(row);
    } else {
      $("tr[data-rowid='" + item.id + "']").replaceWith(row);
    }
    ptr.doSortX();
  });
};

GridView.prototype.bindData = function (datarow) {
  var fx = this.getUserFormElements();
  //////////  alert('Data to bind: ' + JSON.stringify(datarow));

  try {
    for (f in this.formfields) {
      var a = this.formfields[f];
      /////  alert('A: ' + JSON.stringify(a));

      ////// alert('ControlName: ' + a.uf_id);
      var ctl = fx[a.uf_id];
      var name = a.name;

      ///////// alert('ControlName: ' + a.uf_id + 'DataFieldName: '  + name);

      ctl.value = datarow[name];
    }
  } catch (e) {
    alert("bindData Error " + e.message);
  }
};

GridView.prototype.removeRow = function (datarow) {
  try {
    $("tr[data-rowid='" + datarow.id + "']").remove();
  } catch (e) {
    alert("removeRow error " + e.message);
  }
};

GridView.prototype.renderRow = function (datarow) {
  var row = "<tr data-rowid='" + datarow.id + "' >";
  try {
    for (f in this.tablefields) {
      var s = "<td>";
      var a = this.tablefields[f];
      //alert('A ' + JSON.stringify(a));
      var fname = a.name;
      //alert('Fname ' + fname);
      s += datarow[fname];
      s += "</td>";
      row += s;
    }
  } catch (e) {
    alert("renderRow Error " + e.message);
  }
  //row += "<td><a class='editLink' data-id='" + datarow.id + "'>Змінити</a> | ";
  //row += "<a class='removeLink' data-id='" + datarow.id + "'>Видалити</a></td></tr>";
  row +=
    "<td><a  class='editLink' data-id='" +
    datarow.id +
    "'><span class='text-danger glyphicon glyphicon-edit'></span></a> | ";
  row +=
    "<a class='removeLink ' data-id='" +
    datarow.id +
    "'><span class='glyphicon glyphicon-remove-sign'></span></td></tr>";

  row += "</tr>";
  return row;
};

GridView.prototype.dsCheckCondition = function (acond, arow) {
  try {
    var res = false;
    var name = acond.name;
    var value = acond.value;
    var op = acond.op;
    var dst = arow[name];

    switch (op) {
      case 1: // ==
        if (dst == value) {
          res = true;
        }
        break;
      case 2: // like
        if (dst.indexOf(value) >= 0) {
          res = true;
        }
        break;
    }
    return res;
  } catch (e) {
    this.handleError(e, "dsCheckCondition");
    return false;
  }
};

GridView.prototype.dsFilterDataRow = function (arow) {
  try {
    /////// this.Trace('FilterExpression: ' + JSON.stringify(this.filterexpression));
    var res = false;
    //this.Trace('DataRow: ' + arow);
    for (p in this.filterexpression) {
      var a = this.filterexpression[p];
      /////////// this.Trace('Condition: ' + JSON.stringify(a));
      var res1 = this.dsCheckCondition(a, arow);
      if (res1) {
        res = res1;
      } else {
        res = false;
        break;
      }
    }
    return res;
  } catch (e) {
    this.handleError(e, "dsFilterDataRow");
    return false;
  }
};

GridView.prototype.dsOnRowCountChanged = function (acnt) {
  this.pgUpdatePaging();
};

GridView.prototype.dsPrepareFilterContext = function (afilter) {
  /////// this.Trace('dsPrepareFilterContext called ' + JSON.stringify(afilter));
  try {
    var name = this.pgGetFieldNameByCol(afilter.colindex);
    var value = afilter.value;
    var op = afilter.op;
    var parentop = 1; // And-
    var p = {
      name: name,
      value: value,
      op: op,
      parentop: parentop,
    };
    this.filterexpression = [];
    this.filterexpression.push(p);
    //////// this.Trace('FilterExpression ' + JSON.stringify(this.filterexpression));
  } catch (e) {
    this.handleError(e, "dsPrepareFilterContext");
  }
};

GridView.prototype.SetFilter = function (afilter) {
  //////// this.Trace('setFilter called ' + JSON.stringify(afilter));
  try {
    this.bUseFilter = true;
    this.dsPrepareFilterContext(afilter);
    var ptr = this;
    this.datastoref = this.datastore.filter(function (a) {
      return ptr.dsFilterDataRow.call(ptr, a);
    });
    _;
    /////////  this.Trace('FilteredData:' + JSON.stringify(this.datastoref));
    this.dsOnRowCountChanged(this.dsGetRowCount());
    this.pgShowFirstPage();
  } catch (e) {
    //this.handleError(e,'SetFilter');
    //console.log('er');
  }
};

GridView.prototype.ResetFilter = function () {
  try {
    //alert('er');
    ////// this.Trace('resetFilter called ');
    this.bUseFilter = false;
    //dispose this.datastoref
    this.dsOnRowCountChanged(this.dsGetRowCount());
    this.pgShowFirstPage();
  } catch (e) {
    //this.handleError(e,'UnSetFilter');
    //console.log('er');
  }
};

GridView.prototype.IsFilter = function () {
  if (this.bUseFilter != undefined) {
    return this.bUseFilter;
  } else {
    return false;
  }
};

GridView.prototype.dsGetPageDataSource = function (abounds) {
  /////alert('dsGetPageDataSource called');
  /////alert('Bounds: ' + JSON.stringify(abounds));
  try {
    if (abounds.start != undefined) {
      var from = abounds.start;
      var to = from + abounds.limit;
      if (this.IsFilter()) {
        //////////   this.Trace('filterd');
        // return this.datastore.filter(function (a) { return this.dsFilterDataRow(a)}).slice(from,to);
        return this.datastoref.slice(from, to);
      } else {
        //////this.Trace('Not filterd');
        return this.datastore.slice(from, to);
      }
    } else {
      if (this.IsFilter()) {
        ////////this.Trace('filterd');
        //return this.datastore.filter( function (a)
        //		                      { return this.dsFilterDataRow(a); }
        //                            );
        return this.datastoref;
      } else {
        return this.datastore;
      }
    }
  } catch (e) {
    alert("dsGetPageDataSource Error " + e.message);
  }
};

GridView.prototype.IsPaging = function () {
  if (this.bUsePaging != undefined) {
    return this.bUsePaging;
  } else {
    return false;
  }
};

GridView.prototype.GetPageDataStore = function () {
  var bounds = {};
  if (this.IsPaging()) {
    var size = this.pgGetPageSize();
    var from = (this.pgGetPageNum() - 1) * size;
    bounds.start = from;
    bounds.limit = size;
  }
  return this.dsGetPageDataSource(bounds);
};

GridView.prototype.renderTableBody = function () {
  var rows = "";
  var ds = this.GetPageDataStore();

  ///// alert('BodySource: ' + JSON.stringify(ds));

  try {
    /// for (  r in this.datastore  )
    this.getTableBodyjq().empty();
    for (r in ds) {
      var datarow = ds[r];
      //alert('DataRow: ' + JSON.stringify(datarow));
      var row = this.renderRow(datarow);
      //alert('Row: ' + row);
      rows += row;
    }
    this.getTableBodyjq().append(rows);
    ///// alert('call doSortX');
    ///////////////////// this.doSortX();
  } catch (e) {
    alert("renderTableBody error" + e.message);
  }
};

// create table fields and form fields arranged collections
GridView.prototype.parseModel = function () {
  ///// alert('ParseMode started!');

  // find fields to render in table
  this.tablefields = [];
  this.formfields = [];

  var fields = this.model.fields;

  ////// alert('Fields: ' + JSON.stringify(fields));

  for (f in fields) {
    //alert('F:' + f);
    var a = fields[f];
    //alert('Field['+f+'] = ' + JSON.stringify(a));

    // create and push table field
    var item;
    if (a.tblname != undefined) {
      item = {
        name: a.tblname,
      };
    } else {
      item = {
        name: a.name,
      };
    }
    this.tablefields.push(item);

    // create and push formfield
    if (a.name != undefined) {
      var name = a.name;
      var uf_id = a.uf_id;
      var fldtype = a.fldtype;
      var sel;
      if (a.sel != undefined) sel = a.sel;
      if (a.sel != undefined) {
        item = {
          name: name,
          uf_id: uf_id,
          fldtype: fldtype,
          sel: sel,
        };
      } else
        item = {
          name: name,
          uf_id: uf_id,
          fldtype: fldtype,
        };
    }
    this.formfields.push(item);
    // =============================================
  }
  ////////  alert('TableFields: ' + JSON.stringify(this.tablefields));
  ////////  alert('FormFields: ' + JSON.stringify(this.formfields));
};

GridView.prototype.InitDataModel = function (amodel) {
  //////   alert('InitDataModel');
  try {
    this.model = amodel;
    this.parseModel();
  } catch (e) {
    alert("InitDataModel error" + e.message);
  }
};

GridView.prototype.updateDataStore = function (rows) {
  try {
    this.datastore = rows;
    //////  alert('DataStore: ' +  JSON.stringify(this.datastore));
    this.doSortFields(this.datastore);
    ////// alert('Sorted: ' + JSON.stringify(this.datastore));

    this.pgUpdatePaging();
    this.renderTableBody();
    //////this.ShowFirstPage();
  } catch (e) {
    alert("updateDataStore Error: " + e.message);
  }
};

GridView.prototype.updateDataStoreRow = function (arow) {
  try {
    var bFound = false;
    for (r in this.datastore) {
      var row = this.datastore[r];
      if (row.id == arow.id) {
        this.datastore[r] = arow;
        bFound = true;
        break;
      }
    }
    if (!bFound) {
      this.datastore.push(arow);
    }
    this.pgUpdatePaging();
    this.doSortFields(this.datastore);
  } catch (e) {
    alert("updateDataStoreRow  Error: " + e.message);
  }
};

GridView.prototype.deleteDataStoreRow = function (arow) {
  //// alert('deleteDataStoreRow called ' + arow.id)
  try {
    var bFound = false;
    for (r in this.datastore) {
      var row = this.datastore[r];
      if (row.id == arow.id) {
        ///// this.Trace('beforeDelete: ' + JSON.stringify(this.datastore));
        this.datastore.splice(r, 1);
        ///// this.Trace('afterDelete: ' + JSON.stringify(this.datastore));
        bFound = true;
        break;
      }
    }

    this.pgUpdatePaging();
  } catch (e) {
    alert("deleteDataStoreRow  Error: " + e.message);
  }
};

GridView.prototype.HoverOn = function () {
  var sender = this;
  $(sender).addClass("focus");
};

GridView.prototype.HoverOff = function () {
  var sender = this;
  $(sender).removeClass("focus");
};

GridView.prototype.HeaderCellClickListener = function (e, sender) {
  //alert('THis: ' + JSON.stringify(this));
  /*
       try
       {
         ///// alert('Event: ' + JSON.stringify(e));
       } catch (e)
       {
    	//alert('StringiftError: ' + e.message);
       }
       if (sender.sortorder == undefined || sender.sortorder == 'asc')
       {
    	 sender.sortorder = 'desc';
       } else if ( sender.sortorder == 'desc' )
       {
   	      sender.sortorder = 'asc';
       }
       */

  var bIsAsc = $(sender).is(".asc");

  this.ResetHeaderSelection();

  var sortOrder = 0;
  //       if ($(sender).is('.asc'))
  if (bIsAsc) {
    $(sender).removeClass("asc");
    $(sender).addClass("desc selected");
    sortOrder = -1;
  } else {
    $(sender).addClass("asc selected");
    $(sender).removeClass("desc");
    sortOrder = 1;
  }

  var res = {
    datakey: -1,
    colname: $(sender).attr("cn"),
    displayvalue: $(sender).text(),
    sortorder: sortOrder,
    col: $(sender).index(),
    sender: sender,
  };

  /*
       var col = -1;

          switch (res.colname )
        {
          case 'date':
          col = 1;
          break;
          case 'tankname':
              col = 2;
              break;
          case 'productname':
              col = 3;
              break;
          case 'fact_volume':
              col = 4;
              break;
          case 'unitname':
              col = 5;
              break;
        };

       res.col = col;
       */

  ///// alert(JSON.stringify(res));
  this.HeaderClicked = res;
  this.dsPrepareSortContext(this.HeaderClicked);

  if (this.IsPaging()) {
    //this.doSortFields(this.datastore);
    this.doSortFields(this.dsGetDataStore());
    this.pgShowFirstPage();
  } else {
    this.doSort();
  }
};

GridView.prototype.dsGetDataStore = function () {
  if (this.IsFilter()) {
    return this.datastoref;
  } else {
    return this.datastore;
  }
};

GridView.prototype.handleError = function (ae, ainfo) {
  try {
    alert(ainfo + " error " + ae.message);
  } catch (e) {}
};

GridView.prototype.Trace = function (msg) {
  alert(msg);
};

GridView.prototype.pgGetFieldNameByCol = function (acol) {
  var res = "";
  /////this.Trace('pgGetFieldNameByCol tablefields: ' + JSON.stringify(this._tablefields));
  try {
    for (f in this._tablefields.fields) {
      var a = this._tablefields.fields[f];
      ///////this.Trace('A: ' + JSON.stringify(a));

      if (a.col == acol) {
        res = a.name;
        //////// this.Trace('Res: ' + res);
        break;
      }
    }
  } catch (e) {
    // this.handleError(e,'pgGetFieldNameByCol');
  }
  ////// this.Trace('pgGetFieldNameByCol res' + res);
  return res;
};

// define datafield name to grid column index  map
GridView.prototype.SetTableFields = function (afields) {
  this._tablefields = afields;
};

GridView.prototype.SetSortFields = function (afields) {
  this.sortfields = afields;
};

GridView.prototype.SetSortOrder = function (acols) {
  this.sortcols = acols;
};

GridView.prototype.doSortFields = function (adata) {
  ///// alert('sortFields called!');

  if (this.sortfields == undefined) {
    ////// alert('Sort fields not defined!');
    return;
  }

  ////////   this.Trace('doSortFields Input: ' + JSON.stringify(adata));

  var fields = this.sortfields.fields;
  var sortOrder = this.sortfields.sortOrder;

  /////  alert('F: ' + JSON.stringify(fields) +  ' sortOrder: ' + sortOrder);

  var fcompare = function (a, b) {
    var res = 0;
    if ($.isNumeric(a) && $.isNumeric(b)) {
      res = sortOrder == 1 ? a - b : b - a;
    } else {
      res = a < b ? -sortOrder : a > b ? sortOrder : 0;
      ////  alert('R= ' + res + 'a= ' + a + 'b= ' + b);
    }
    return res;
  };

  adata.sort(function (a, b) {
    var res = 0;
    for (f in fields) {
      var af = fields[f];
      var name = af.name;
      var v1 = a[name];
      var v2 = b[name];
      /////////////   alert('name: ' + name + 'v1= ' + v1 + ' v2=' + v2);

      var res = fcompare(v1, v2);
      if (res != 0) {
        //////  alert('NE! ' + res);
        return res;
      }
    }
    return res;
  });

  //////  alert('Result: ' + JSON.stringify(adata));
  //return adata;
};

GridView.prototype.doSortX = function () {
  //  $(document).ready(function() {
  //  http://www.learningjquery.com/2017/03/how-to-sort-html-table-using-jquery-code

  //////   alert('doSortX started');

  if (this.sortcols == undefined) {
    //alert('SortOrder not defined!');
    return;
  }

  var ptr = this;
  var cols = this.sortcols.cols;
  var sortOrder = this.sortcols.sortOrder; //// this.HeaderClicked.sortorder;

  ////// alert('Cols: ' + JSON.stringify(cols) + ' sortOrder ' +  sortOrder);

  try {
    $("th").removeClass("asc selected");
    $("th").removeClass("desc selected");

    //var arrData = $('table').find('tbody >tr:has(td)').toArray();    //.get();
    var arrData = $(this.ref_table).find("tbody >tr:has(td)").toArray(); //.get();

    /////  alert('arrData: ' + JSON.stringify(arrData));

    arrData.sort(function (a, b) {
      var res = 0;

      for (c in cols) {
        var af = cols[c];
        var col = af.col;

        var val1 = $(a).children("td").eq(col).text().toUpperCase();
        var val2 = $(b).children("td").eq(col).text().toUpperCase();

        ///// alert('col: ' + col +  'V1: ' + val1 + ' V2: ' + val2);

        if ($.isNumeric(val1) && $.isNumeric(val2)) {
          res = sortOrder == 1 ? val1 - val2 : val2 - val1;
        } else {
          res = val1 < val2 ? -sortOrder : val1 > val2 ? sortOrder : 0;
        }

        if (res != 0) {
          //// alert('NE!' + res);
          return res;
        }
      }

      return res;
    });

    $(ptr.ref_tbody).children().remove();
    $.each(arrData, function (index, row) {
      //////////////alert('R: ' + row);
      $(ptr.ref_tbody).append(row);
    });
  } catch (e) {
    alert("SortErrorX: " + e.message);
  }
};

GridView.prototype.doSort = function () {
  //  $(document).ready(function() {
  //   http://www.learningjquery.com/2017/03/how-to-sort-html-table-using-jquery-code

  var ptr = this;

  try {
    var dst = document.getElementById("ptable");
    var dstbody = document.getElementById("tbldata");
    var sender = this.HeaderClicked.sender;
    var sortOrder = this.HeaderClicked.sortorder;
    var col = this.HeaderClicked.col;
    ///////alert('Col: '+ col);

    ///////////////   $('th').each(function(col) {

    // $(this).hover(

    //  function() { $(this).addClass('focus'); },

    //  function() { $(this).removeClass('focus'); }

    //);

    //$(this).click(function() {

    //  if ($(this).is('.asc')) {

    //    $(this).removeClass('asc');

    //    $(this).addClass('desc selected');

    //    sortOrder = -1;

    //  }

    //  else {

    //    $(this).addClass('asc selected');

    //    $(this).removeClass('desc');

    //    sortOrder = 1;

    // }

    //alert('SortOrder:' + sortOrder);

    $(sender).siblings().removeClass("asc selected");
    $(sender).siblings().removeClass("desc selected");

    try {
      // alert('Table: ' + JSON.stringify(dst));
    } catch (e) {
      alert("GridError: " + e.message);
    }

    //var arrData = $('table').find('tbody >tr:has(td)').toArray();    //.get();
    var arrData = $(this.ref_table).find("tbody >tr:has(td)").toArray(); //.get();

    //var arrData = $(dst).find('tbody').get();

    // alert('Data:' +  JSON.stringify(arrData));

    arrData.sort(function (a, b) {
      var val1 = $(a).children("td").eq(col).text().toUpperCase();
      var val2 = $(b).children("td").eq(col).text().toUpperCase();

      // alert('V1: ' + val1);
      // alert('V2: ' + val2);

      if ($.isNumeric(val1) && $.isNumeric(val2)) {
        return sortOrder == 1 ? val1 - val2 : val2 - val1;
      } else {
        return val1 < val2 ? -sortOrder : val1 > val2 ? sortOrder : 0;
      }
    });

    $.each(arrData, function (index, row) {
      //$('tbody').append(row);
      //$(dstbody).append(row);
      $(ptr.ref_tbody).append(row);
    });

    //////////////////////    });

    //});

    // });
  } catch (e) {
    alert("SortError: " + e.message);
  }
};

GridView.prototype.getColIndexByColName = function (aname) {
  var col = -1;

  switch (aname) {
    case "date":
      col = 1;
      break;

    case "tankname":
      col = 2;
      break;

    case "productname":
      col = 3;
      break;

    case "fact_volume":
      col = 4;
      break;

    case "unitname":
      col = 5;
      break;

    default:
      col = -1;
      break;
  }

  return col;
};

GridView.prototype.ResetSelection = function () {
  $("td").removeClass("selected");
  $("td").removeClass("found");
};

GridView.prototype.ResetHeaderSelection = function () {
  $("th").removeClass("desc selected");
  $("th").removeClass("asc");
};

GridView.prototype.dsPrepareSortContext = function (aparam) {
  var sortOrder = this.HeaderClicked.sortorder;
  var col = this.HeaderClicked.col;
  ///////   this.Trace('Col: ' + col);
  var name = this.pgGetFieldNameByCol(col);
  ///////// this.Trace('NameFound:  ' + name  + ' sortOrder ' + sortOrder);

  var f = {
    sortOrder: sortOrder,
    fields: [{ name: name }],
  };

  this.sortfields = f;
  /////////// alert('F: ' + JSON.stringify(f));
};

GridView.prototype.DataCellClickListener = function (e, sender) {
  //alert('class' + this.classname);
  //alert('TDClicked!');
  //alert(JSON.stringify(sender));
  //alert(JSON.stringify($(sender).parent()));
  //alert($(sender).parent().attr('data-rowid'));

  //try
  //{
  //   alert('Index: ' + $(sender).index());
  //}  catch (e)
  //{
  //   alert('IndexError: ' + e.message);
  //}
  try {
    if ($(sender).children().hasClass("removeLink")) {
      //alert('Дійсно видалити?');
      //e.stopPropagation();
      return;
    }

    if ($(sender).children().hasClass("editLink")) {
      //alert('Edit');
      return;
    }
  } catch (e) {
    alert("ClassCheck Error" + e.message);
  }

  var res = {
    datakey: $(sender).parent().attr("data-rowid"),
    //colname: $(sender).attr('cn'),
    displayvalue: $(sender).text(),
    colindex: $(sender).index(), //  -1
  };

  //try
  //{
  //  res.colindex = this.getColIndexByColName(res.colname);
  //} catch (e)
  //{
  //	  alert(e.message);
  //}

  ////// alert(JSON.stringify(res));
  this.CellClicked = res;

  try {
    var c = document.getElementById("txtFilterExpression");
    //var s = res.colname + "=" + res.displayvalue;
    var s = $("th").eq(res.colindex).text() + "=" + res.displayvalue;
    c.value = s;
  } catch (e) {}

  // $('td').removeClass('selected');
  this.ResetSelection();
  $(sender).addClass("selected");

  ///// $(sender).parent().addClass('hidden');

  //  $(sender).parent().addClass('hidden');

  /*
	   var dstbody = document.getElementById('tbldata');
	   try
	   {
	   $(dstbody).children().each(
			            function(index,a)
			                           {
			            	             //$(this).addClass('hidden');
			            	             //alert(JSON.stringify(item));
			            	              var col = 4;
			            	              ///// $(item).addClass('hidden');
			            	              alert($(a).children('td').eq(col).text());
			                           }
			          );
	   } catch (e)
	   {
		   alert(e.message);
	   }
        */
};

GridView.prototype.searchOnClientSideNext = function () {
  var ptr = this;
  var value;

  try {
    /////// alert('searchOnClientSide_F3 under construction ');
    value = ptr.CellFoundFirst.displayvalue;
    if (this.cellsfound.length == 0) {
      this.cellsfoundindex = -1;

      var dstbody = this.getTableBody();
      /////  this.Trace('Value: ' + ptr.CellFoundFirst.displayvalue);

      var ptr = this;
      var bFound = false;
      try {
        $(dstbody)
          .children()
          .each(
            // scan rows
            function (index, row) {
              try {
                ////  alert('Ridx: ' + index);
                $(row)
                  .children()
                  .each(
                    function (indexa, cell) {
                      try {
                        //// alert('Cidx: ' + indexa);
                        var s = $(cell).text();

                        //                    	 if (s == value)
                        if (s.indexOf(value) >= 0) {
                          ptr.cellsfound.push(cell);
                          // if (!bFound)
                          if (true) {
                            ////ptr.ResetSelection.call(ptr);
                            //$(cell).addClass('found');
                            bFound = true;

                            var sender = cell;
                            var res = {
                              datakey: $(sender).parent().attr("data-rowid"),
                              colname: $(sender).attr("cn"),
                              displayvalue: $(sender).text(),
                              colindex: -1,
                            };
                            ptr.CellFoundNext = res;
                          }
                        }
                      } catch (e) {
                        // inner catch
                      }
                    } // outer of cell handler
                  ); /// outer of foreach cell
              } catch (e) {}
            } // outer f1
            // alert('CellFoundFirst: ' + JSON.stringify(this.CellFoundFirst));
          );
      } catch (e) {
        alert(e.message);
      }
      _;
    } // outer of  cellsfound arrat emoty

    var cnt = this.cellsfound.length;
    var idx = this.cellsfoundindex;

    if (cnt > 0 && idx + 1 < cnt) {
      this.cellsfoundindex = ++idx;
      var cell = this.cellsfound[idx];
      ptr.ResetSelection.call(ptr);
      $(cell).addClass("found");
      cell.scrollIntoView({ block: "center", behavior: "smooth" });

      var sender = cell;
      var res = {
        datakey: $(sender).parent().attr("data-rowid"),
        colname: $(sender).attr("cn"),
        displayvalue: $(sender).text(),
        colindex: -1,
      };
      ptr.CellFoundNext = res;
    } else {
      // alert('Знаяення ' + value  + ' не знайдено');
      try {
        var pagenum = this.pgGetNextPageWithValueIndex(value);
        if (pagenum > 0) {
          this.cellsfound = [];
          this.cellsfoundindex = 0;
          this.pgShowPage(pagenum);
          this.searchOnClientSideNext();
        } else {
          alert("Значення " + ptr.CellFoundFirst.displayvalue + " не знайдено");
          return;
        }
      } catch (e) {
        alert("Значення " + " не знайдено");
      }
    }

    /*
  	 var sender = cell;
     var res =
     {
  	  datakey: $(sender).parent().attr('data-rowid'),
        colname: $(sender).attr('cn'),
        displayvalue: $(sender).text(),
        colindex: -1
     };
	       this.CellFoundNext = res;
	       alert('CellFoundFordt: ' + JSON.stringify(this.CellFoundFirst));
	  */
  } catch (e) {
    //alert('searchOnClientSideNext error: ' + e.message);
    alert("Значення не знайдено ");
  }
};

GridView.prototype.searchOnClientSide = function (value) {
  ////// alert('searchOnClientSide under construction ' + value);
  //return;

  var bFound = false;
  this.cellsfound = [];
  this.cellsfoundindex = 0;

  // Reset prev search results
  this.CellFoundFirst = undefined;
  this.CellFoundNext = undefined;
  // Implement validate!
  // ===========================================

  try {
    value = value.trim();
  } catch (e) {}

  var dstbody = this.getTableBody();

  var ptr = this;
  try {
    $(dstbody)
      .children()
      .each(
        // scan rows
        function (index, row) {
          try {
            ////  alert('Ridx: ' + index);
            $(row)
              .children()
              .each(function (indexa, cell) {
                try {
                  //// alert('Cidx: ' + indexa);
                  var s = $(cell).text();

                  //                	 if (s == value)
                  if (s.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                    ptr.cellsfound.push(cell);
                    if (!bFound) {
                      ptr.ResetSelection.call(ptr);
                      $(cell).addClass("found");
                      bFound = true;
                      cell.scrollIntoView({
                        block: "center",
                        behavior: "smooth",
                      });

                      var sender = cell;
                      var res = {
                        datakey: $(sender).parent().attr("data-rowid"),
                        colname: $(sender).attr("cn"),
                        displayvalue: $(sender).text(),
                        colindex: -1,
                      };
                      ptr.CellFoundFirst = res;
                    }
                    // alert('CellFoundFirst: ' + JSON.stringify(this.CellFoundFirst));
                  }
                } catch (e) {
                  alert(e.message);
                }

                //  if ( indexa >= 4 )
                //{
                //  return false;
                //
                //}
                if (bFound) {
                  ///// return false;
                }
              });
          } catch (e) {
            alert(e.message);
          }
          if (bFound) {
            /////// return false;
          }
          _;
        }
      );

    if (!bFound) {
      var idx = this.pgGetNextPageWithValueIndex(value);
      if (idx >= 1) {
        this.pgShowPage(idx);
        this.searchOnClientSide(value);
        return;
      }
      alert("Значення " + value + " не знайдено");
    } else {
      //////// alert('FoundCount ' + this.cellsfound.length);
    }
  } catch (e) {
    //alert(' searchOnClientSide error ' + e.message );
    alert(" Значення не знайдено ");
  }
};

GridView.prototype.createSearchControls = function () {
  this.id_mydiv = "dv_gvPanel";
  var mydiv = $("#" + this.id_mydiv);
  var mytable = $("#" + this.id_table);

  //return;

  try {
    var controls = $(
      "<div style=' margin:0; float:right; margin-top: -21px;'>" +
        "<input type='text' class='form-control' id='txtSearch' placeholder='Знайти'/>" +
        "<input  type='button' class='btn btn-sm btn-primary' id='btnapplysearch' value='Пошук'/>" +
        "<span/>" +
        "<input  type='button' class='btn btn-sm btn-primary' id='btnnextsearch' value='Шукати далі'/>" +
        //"<label >Шукати далі - F3</label>"
        +"</div>"
      //+"<span/><span/><span/><span/><span/><span/><span/><span/><span/>"
    );

    var myanchor = $("#" + this.id_mydiv); //$('#g1');
    myanchor.append(controls);

    //.mytable.before(controls);
  } catch (e) {
    alert("createSearchControls error " + e.message);
  }
};

GridView.prototype.createDefaultControls = function () {
  this.id_mydiv = "dv_gvPanel";
  ////// this.id_table = 'ptable';
  var mydiv = $("#" + this.id_mydiv);
  var mytable = $("#" + this.id_table);

  try {
    var filterbar = $(
      // "<div id='dv_FilterBar'> " +
      //"<input type='button' id='btnapplyfilter' value='застосувати фільтр' style='background-image:url(/img/filterapply.gif);'/>" +
      //"<input type='image' id='btnresetfilter' src='/img/filteroff.gif'/> ") ;
      //"<div id='" + this.id_mydiv + "' style='display:flex;justify-content:center;'>" +
      "<div class='top-panel' id='" +
        this.id_mydiv +
        "'>" +
        "<div id='g1' style='float: right; margin-top: -21px; padding-left: 5px'>" +
        "<input type='button' class='btn btn-sm btn-primary' id='btnapplyfilter' value='Застосувати фільтр'/>" +
        "<input type='button' class='btn btn-sm btn-primary' id='btnresetfilter' value='Очистити фільтр'/> " +
        "</div>" +
        "</div>"
    );
    //+ "</div>");
    mytable.before(filterbar);

    var tableheader = $(
      "<!-- div id='dv_gvHeader' align='left'>" +
        "<div id='dv_PageSize' class='hidden'>" +
        "<label>Показывать</label>" +
        "<select id='sel_PageSize'  class='form-control'>" +
        "<option value=1>3</oprion> " +
        "<option value=1>10</oprion>" +
        "<option value=1>25</oprion>" +
        "</select>" +
        "<label>строк на странице</label>" +
        "</div-->" +
        //"<div id='dv_Filter'>" +
        " <input type='text' class='form-control' id='txtFilterExpression' placeholder='Фільтр'/>"
      //"</div>" +
      //"<div>" +
      //"</div>" +
      //"<div id='dv_Search' align='right'>" +

      /////"<label for 'txtSearch'>  Знайти:</label>" +
      /////"<input type='text' id='txtSearch'/>" +
      ////"<input type='button' id='btnapplysearch' value='Пошук'/>" +
      /////"<label>Шукати далі - F3</label>"
    ); // +
    //"</div>" +
    //"</div>");

    var myanchor = $("#btnresetfilter");

    myanchor.before(tableheader);
    //mytable.before(tableheader);
  } catch (e) {
    alert("createDefaultControls error " + e.message);
  }

  this.createSearchControls();
};

GridView.prototype.InitDefaults = function () {
  this.ref_table = "ptable";
  this.ref_userform = "userForm";
};

GridView.prototype.getUserFormElements = function () {
  return document.forms[this.ref_userform].elements;
};

GridView.prototype.getUserFormElementsjq = function () {
  return $(this.ref_userform).children();
};

GridView.prototype.getTableBodyjq = function () {
  return $(this.ref_tbody);
};

GridView.prototype.getTablejq = function () {
  return $(this.ref_table);
};

GridView.prototype.Init = function () {
  var bUseDataProvider = false; //  true;   //false;
  //this.bUseDataProvider = false;
  this.bUsePaging = false;
  this.bUseFilter = false;

  this.createDefaultControls();

  this.ref_table = "#" + this.id_table;
  this.ref_tbody = this.ref_table + " tbody";
  this.ref_th = this.ref_table + " th";

  var ptr = this;

  if (bUseDataProvider) {
    // set SubmitForm button listener
    $("form").submit(function (e) {
      e.preventDefault();
      ///////     alert('GridView setDataCalled');
      // Gather form values, save in DB and rerender table
      ptr.saveData.call(ptr);
    });
  }
  //

  //  set column header click handler
  //$("body").on('click','.hcell',function (e) {
  //$("#ptable").on('click','th',function (e) {
  $(this.ref_table).on("click", "th", function (e) {
    e.preventDefault();
    var sender = this;
    ptr.HeaderCellClickListener(e, sender);
  });

  // Edit record
  if (bUseDataProvider) {
    $(this.ref_table).on("click", ".editLink", function (e) {
      try {
        var id = $(this).data("id");
        /////////   alert('Edit called ' + id);
        ptr.p.getRow(id, function (datarow) {
          ///////   alert('Bind data callback called');
          ptr.bindData.call(ptr, datarow);
        });
      } catch (e) {
        alert("EditRow error: " + e.message);
      }
      //e.preventDefault();
      //var sender = this;
      //ptr.HeaderCellClickListener(e, sender);
    });
  }

  // delete record
  if (bUseDataProvider) {
    $(this.ref_table).on("click", ".removeLink", function (e) {
      var id = $(this).data("id");
      ////////////    alert('Remove called ' + id);
      ptr.p.deleteRow(id, function (datarow) {
        //////////// alert('Delete row callback called');
        ptr.deleteDataStoreRow.call(ptr, datarow);
        //$("tr[data-rowid='" + datarow.id + "']").remove();
        ptr.removeRow.call(ptr, datarow);
      });
      //e.preventDefault();
      //var sender = this;
      //ptr.HeaderCellClickListener(e, sender);
    });
  }

  /*
	 $(".hcell").hover(function (e) {
         //e.preventDefault();
		 //alert('hover!');
         //var sender = this;
         ptr.HoverOn();
         ptr.HoverOff();
     });
	 */

  //  set column header hover handler
  //$('#ptable th').each(function(col) {
  $(this.ref_th).each(function (col) {
    $(this).hover(
      function () {
        $(this).addClass("focus");
      },
      function () {
        $(this).removeClass("focus");
      }
    );
  });

  // set data cell click handler  handler
  //$("body").on('click','.dcell',function (e) {
  //$("#ptable").on('click','td',function (e) {
  $(this.ref_table).on("click", "td", function (e) {
    e.preventDefault();
    var sender = this;
    ptr.DataCellClickListener(e, sender);
  });

  // set applyfilter handler
  this.applyfilterid = "btnapplyfilter";
  $("#" + this.applyfilterid).on("click", function (e) {
    //// alert('applyFilter');  //return;
    e.preventDefault();
    var sender = this;
    ptr.applyFilterOnClienSide();
  });

  // set resetfilter handler
  this.resetfilterid = "btnresetfilter";
  $("#" + this.resetfilterid).on("click", function (e) {
    //alert('resetFilter'); return;
    e.preventDefault();
    var sender = this;
    ptr.resetFilterOnClienSide();
  });

  this.txtsearchid = "txtSearch";
  this.applysearchid = "btnapplysearch";

  $("#" + this.applysearchid).on("click", function (e) {
    //var pattern =
    //$('#'+this.txtsearchid).attr('value');

    var pattern = document.getElementById("txtSearch").value;

    ///////   alert('Search: ' + pattern);
    //return;

    e.preventDefault();
    var sender = this;
    ptr.searchOnClientSide(pattern);
  });

  this.nextsearchid = "btnnextsearch";

  $("#" + this.nextsearchid).on("click", function (e) {
    //var pattern =
    //$('#'+this.txtsearchid).attr('value');
    try {
      ptr.searchOnClientSideNext();
    } catch (e1) {
      //alert( 'searchOnClientSideNext error: ' + e1.message );
      alert("Значення не знайдено ");
    }
  });

  // keypress handlers
  $("body").keypress(function (event) {
    ///////   alert('KeyCode: ' + event.keyCode);
    if (event.which == 13) {
      event.preventDefault();
    }

    switch (event.keyCode) {
      // Find Next  ( F3 pressed handler )
      case 114: // 'F3' keycode
        event.preventDefault();
        ///////  alert('F3 pressed!');
        try {
          ptr.searchOnClientSideNext();
        } catch (e) {
          //alert( 'searchOnClientSideNext error: ' + e.message );
          alert("Значення не знайдено");
        }
        break;

      default:
        break;
    }

    //var xTriggered = 1;
    //alert(event.which + '#' + event.keyCode);
    //var msg = "Handler for .keypress() called " + xTriggered + " time(s).";
    //alert(msg);
    //$.print( msg, "html" );
    //$.print( event );
  });
};

GridView.prototype.setVisible = function (dst, bVisible) {
  try {
    var p = $(dst);

    if (bVisible) {
      p.removeClass("hidden");
    } else {
      p.addClass("hidden");
    }
  } catch (e) {
    alert("setrVisibleError: " + e.message);
  }
};

GridView.prototype.getTableBody = function () {
  //this.tbodyid = 'tbldata';
  var dstbody = this.ref_tbody; //    document.getElementById(this.tbodyid);
  return dstbody;
};

GridView.prototype.getFilter = function () {
  var p = this.CellClicked;
  var colindex = p.colindex;
  var value = p.displayvalue;

  var res = {
    colindex: colindex,
    value: value,
    op: 1,
  };

  return res;
};

// Method to get filter conditions
// and call appropriate filtering method
GridView.prototype.applyFilterOnClienSide = function () {
  try {
    var filter = this.getFilter(); // Get filter to apply
    //// alert('Filter: ' + JSON.stringify(filter));

    this.SetFilter(filter);

    var colindex = filter.colindex;
    var value = filter.value;
    var op = filter.op;
    this.filterByColumn(colindex, value, op);
  } catch (e) {
    alert("applyFilterOnClienSide error: " + e.message);
  }
};

GridView.prototype.showAllRows = function () {
  var dstbody = this.getTableBody();
  var ptr = this;
  $(dstbody)
    .children()
    .each(
      // scan rows
      function (index, row) {
        ptr.setVisible(row, true);
      }
    );
};

GridView.prototype.resetFilterOnClienSide = function () {
  this.ResetFilter();
  // do something with context
  // and show all rows
  var c = document.getElementById("txtFilterExpression");
  c.value = "";
  this.showAllRows();
};

GridView.prototype.filterByColumn = function (col, value, op) {
  ///// alert('Col: ' + col + ' Value: ' + value + 'Op: ' + op);

  // get tbody element
  var dstbody = this.getTableBody();
  var ptr = this;

  $(dstbody)
    .children()
    .each(
      // scan rows
      function (index, row) {
        // scan row cells to find foltered value
        var s = $(row).children().eq(col).text();
        //// alert('S= ' + s);
        ///// alert (s==value);

        if (s == value) {
        } else {
          $(row).addClass("hidden");
        }
        return;

        var bFiltered = false;
        switch (op) {
          // ==
          case 1:
          case "1":
            if (s == value) {
              bFiltered = true;
            }
            break;

          default:
            // yet not implemented operations
            bFiltered = true;
            break;
        }

        if (!bFiltered) {
          //$(row).addClass('hidden');
          ptr.setVisible(row, false);
        }

        _;
      }
    );
};

GridView.prototype.pgUpdatePaging = function () {
  ///// alert('pgUpdatePaging called');

  try {
    if (this.bUsePaging) {
      ////// alert('pgUpdateValues called');

      // set row count
      var rowcount = this.dsGetRowCount(); //  this.pgGetPageSize();
      $("#" + this.ref_PageNavigatorCountRow).attr("value", rowcount);

      // set page num
      var pagesize = this.pgGetPageSize();
      //alert('pagesize: ' + pagesize);
      $("#" + this.ref_PageNavigatorSize).attr("value", pagesize);

      // set page count
      pagecount = this.pgGetPageCount(); //  this.pgGetPageSize();
      $("#" + this.ref_PageNavigatorCountPage).attr("value", pagecount);

      // set page num
      var pagenum = this.pgGetPageNum(); //  this.pgGetPageSize();
      $("#" + this.ref_PageNavigatorCurPage).attr("value", pagenum);
    }
  } catch (e) {
    //alert('pgUpdatePaging error ' + e.message);
    alert("Не достатьня швидкість мережі!");
  }
};

GridView.prototype.InitPaging = function (amode, apagesize) {
  // alert('InitPaging started');
  try {
    if (amode) {
      this.bUsePaging = true;
      this.pgSetPageSize(apagesize);
      this.pgCreatePagingControlsB(true);
      this.pgUpdatePaging();
    }
  } catch (e) {
    alert("InitPaging Error " + e.message);
  }
  //this.createSearchControls();
};

GridView.prototype.RefreshGrid = function () {
  this.pgValidateNavigatorButtons();
  this.pgValidatePageNum();
  this.renderTableBody();
};

GridView.prototype.pgShowPage = function (anum) {
  ///// alert('pgShowPage called ' + anum);
  var pagenum = 1;
  var pagecount = this.pgGetPageCount();
  ////// alert('anum= ' + anum +  'pagenum= ' + pagenum + ' pagecount ' + pagecount);
  if (anum >= pagenum && anum <= pagecount) {
    this.pgSetPageNum(anum);
    this.RefreshGrid();
  }
};

GridView.prototype.pgShowFirstPage = function () {
  var pagenum = 1;
  this.pgShowPage(pagenum);
};

GridView.prototype.pgShowNextPage = function () {
  var pagenum = this.pgGetPageNum();
  this.pgShowPage(++pagenum);
};

GridView.prototype.pgShowPrevPage = function (anum) {
  var pagenum = this.pgGetPageNum();
  this.pgShowPage(--pagenum);
};

GridView.prototype.pgShowLastPage = function (anum) {
  var pagenum = this.pgGetPageCount();
  this.pgShowPage(pagenum);
};

GridView.prototype.pgGetNextPageWithValueIndex = function (avalue) {
  var res = 0;
  var anum = this.pgGetPageNum();
  anum++;
  //////////this.Trace('Page: ' + anum);
  //////////this.Trace('Value: ' + avalue);
  //var count = this.pgGetPageCount();
  //if (pagenum < count)
  //{ res = pagenum + 1; }

  var pagenum = 1;
  var pagecount = this.pgGetPageCount();
  ////// alert('anum= ' + anum +  'pagenum= ' + pagenum + ' pagecount ' + pagecount);

  if (anum > pagecount) {
    return res;
  }

  //if ( (anum >= pagenum)  && (anum <= pagecount))
  while (anum <= pagecount) {
    //////   return anum;
    //this.pgSetPageNum(anum);
    //this.RefreshGrid();
    // var ds = this.GetPageDataStore();
    var bounds = {};
    if (this.IsPaging()) {
      var size = this.pgGetPageSize();
      // var from = (this.pgGetPageNum()-1)*size;
      var from = (anum - 1) * size;
      bounds.start = from;
      bounds.limit = size;
    }
    var ds = this.dsGetPageDataSource(bounds);

    ///////////////this.Trace('DS: ' + JSON.stringify(ds));

    var ptr = this;
    try {
      var f = function (a) {
        //var res1 = true;

        ////////ptr.Trace('A ' + JSON.stringify(a));
        var res = false;
        for (p in a) {
          var t = a[p];
          ////////////ptr.Trace('T ' + t);

          if (t == avalue) {
            res = true;
            break;
          }

          try {
            if (t.indexOf(avalue) >= 0) {
              res = true;
              break;
            }
          } catch (e) {}
        }
        return res;
      };

      if (ds.find(f) != undefined) {
        res = anum;
        return res;
      }
    } catch (e) {
      this.handleError(e, "pgGetNextPageWithValueIndex ");
    }
    anum++;
  }
  return res;
};

GridView.prototype.pgResetNavigatorButtons = function () {
  try {
    $("#" + this.ref_PageNavigatorFirst).css("visibility", "visible");
    $("#" + this.ref_PageNavigatorPrev).css("visibility", "visible");
    $("#" + this.ref_PageNavigatorNext).css("visibility", "visible");
    $("#" + this.ref_PageNavigatorLast).css("visibility", "visible");
  } catch (e) {
    // non critical error
  }
};

GridView.prototype.pgValidateNavigatorButtons = function () {
  /// this.Trace('pgValidateNavigatorButtons called');
  // In AIS hidden!
  return;

  try {
    var pagenum = this.pgGetPageNum();
    var count = this.pgGetPageCount();
    this.pgResetNavigatorButtons();

    if (pagenum == 1) {
      $("#" + this.ref_PageNavigatorFirst).css("visibility", "hidden");
      $("#" + this.ref_PageNavigatorPrev).css("visibility", "hidden");
    }
    if (pagenum == count) {
      $("#" + this.ref_PageNavigatorLast).css("visibility", "hidden");
      $("#" + this.ref_PageNavigatorNext).css("visibility", "hidden");
    }
  } catch (e) {}
};

GridView.prototype.pgValidatePageNum = function () {
  var pagenum = this.pgGetPageNum();
  $("#" + this.ref_PageNavigatorCurPage).attr("value", pagenum);
};

GridView.prototype.pgGetPageNum = function () {
  if (this.pageNum == undefined) {
    this.pageNum = 1;
  }
  return this.pageNum;
};

GridView.prototype.pgSetPageNum = function (anum) {
  ////// alert('pgSetPageNum called ' + anum);
  var pagenum = this.pgGetPageNum();
  var pagecount = this.pgGetPageCount();
  if (anum < 1) return pagenum;
  if (anum > pagecount) return pagenum;
  pagenum = anum;
  this.pageNum = pagenum;

  return pagenum;
};

GridView.prototype.pgSetPageSize = function (asize) {
  this.pageSize = asize;
};

GridView.prototype.pgGetPageSize = function () {
  return this.pageSize;
};

GridView.prototype.pgGetPageCount = function () {
  // return this.pageSize;
  var res = 1;
  var pagesize = this.pgGetPageSize();
  var rowcount = this.dsGetRowCount();

  ////////  alert('Pagesize: ' + pagesize + ' Rowcount: ' + rowcount);

  res = Math.floor(rowcount / pagesize);
  var remainder = rowcount % pagesize;

  if (remainder > 0) {
    res++;
  }

  return res;
};

GridView.prototype.pgShowPagingControls = function (astate) {};

GridView.prototype.dsGetRowCount = function () {
  ////// alert('dsGetRowCount called ' + this.datastore.length);
  if (this.IsFilter()) {
    return this.datastoref.length;
  } else {
    return this.datastore.length;
  }
};

GridView.prototype.pgCreatePagingControls = function (astate) {
  var mytable = this.getTablejq();

  try {
    this.ref_PageNavigatorDiv = "ptable_dv_pagenavigator";
    this.ref_PageNavigatorFirst = "ptable_btn_firstpage";
    this.ref_PageNavigatorNext = "ptable_btn_nextpage";
    this.ref_PageNavigatorPrev = "ptable_btn_prevpage";
    this.ref_PageNavigatorLast = "ptable_btn_lastpage";
    this.ref_PageNavigatorSizeLbl = "ptable_lbl_pagesize";
    this.ref_PageNavigatorSize = "ptable_input_pagesize";
    this.ref_PageNavigatorCurPageLbl = "ptable_lbl_curpage";
    this.ref_PageNavigatorCurPage = "ptable_lbl_curpagenum";
    this.ref_PageNavigatorCountPageLbl = "ptable_lbl_countpage";
    this.ref_PageNavigatorCountPage = "ptable_lbl_countpagenum";
    this.ref_PageNavigatorCountRowLbl = "ptable_lbl_countrow";
    this.ref_PageNavigatorCountRow = "ptable_lbl_countrownum";

    var pagenavigator = $();
    //	"<div style='width:100%' id='" + this.ref_PageNavigatorDiv + "'>" +
    ///// "<span/><span/><span/><span/><span/><span/><span/><span/><span/>" +

    // +
    //"<span/><span/><label id='" +  this.ref_PageNavigatorSizeLbl + "' " +
    //" for '" +  this.ref_PageNavigatorSize + "'>"  +
    //"Розмір"  + "</label>" +
    //"<input disabled='true' style='width:40px'  type=text id='" +  this.ref_PageNavigatorSize + "' value='2' />" +
    //"<span/><label id='" +  this.ref_PageNavigatorCountPageLbl + "' " +
    //" for '" +  this.ref_PageNavigatorCountPage + "'>"  +
    //"Сторінок"  + "</label>" +
    //"<input disabled='true' style='width:60px' type=text id='" +  this.ref_PageNavigatorCountPage + "' value='10' />" +
    //"<span/><span/><label id='" +  this.ref_PageNavigatorCountRowLbl + "' " +
    //" for '" +  this.ref_PageNavigatorCountRow + "'>"  +
    //" Рядків"  + "</label>" +
    //"<input disabled='true' style='width:80px' type=text id='" +  this.ref_PageNavigatorCountRow + "' value='100' />"
    //"</div>"

    mytable.before(pagenavigator);

    var myanchor = $("#" + "g1");
    //myanchor.after(pagenavigator);
    //myanchor.before(pagenavigator);

    myanchor = $("#" + this.id_mydiv);
    //myanchor.before(pagenavigator);

    myanchor.append(pagenavigator);

    var pagefooter = $(
      "<div id='pages-control'>" +
        "<input type=image class='btn btn-outline btn-default' id='" +
        this.ref_PageNavigatorFirst +
        "' src='img/DataContainer_MoveFirstHS.png' />" +
        "<input type=image class='btn btn-outline btn-default' id='" +
        this.ref_PageNavigatorPrev +
        "' src='img/DataContainer_MovePreviousHS.png' />" +
        "<input disabled='true' class='form-control' type=text id='" +
        this.ref_PageNavigatorCurPage +
        "' value='1' />" +
        "<input type=image class='btn btn-outline btn-default' id='" +
        this.ref_PageNavigatorNext +
        "' src='img/DataContainer_MoveNextHS.png' />" +
        "<input type=image class='btn btn-outline btn-default' id='" +
        this.ref_PageNavigatorLast +
        "' src='img/DataContainer_MoveLastHS.png' />" +
        "<span/><span/><label id='" +
        this.ref_PageNavigatorSizeLbl +
        "' " +
        " for '" +
        this.ref_PageNavigatorSize +
        "'>" +
        "Розмір" +
        "</label>" +
        "<input disabled='true' class='form-control'  type=text id='" +
        this.ref_PageNavigatorSize +
        "' value='2' />" +
        "<span/><label id='" +
        this.ref_PageNavigatorCountPageLbl +
        "' " +
        " for '" +
        this.ref_PageNavigatorCountPage +
        "'>" +
        "Сторінок" +
        "</label>" +
        "<input disabled='true' class='form-control' type=text id='" +
        this.ref_PageNavigatorCountPage +
        "' value='10' />" +
        "<span/><span/><label id='" +
        this.ref_PageNavigatorCountRowLbl +
        "' " +
        " for '" +
        this.ref_PageNavigatorCountRow +
        "'>" +
        " Рядків" +
        "</label>" +
        "<input disabled='true' class='form-control' type=text id='" +
        this.ref_PageNavigatorCountRow +
        "' value='100' />" +
        "</div>"
    );

    //mytable.after(pagefooter);

    mytable.after(pagefooter);

    //
    /*
    // set page num
    var pagesize = this.pgGetPageSize();
    //alert('pagesize: ' + pagesize);
    $("#"+this.ref_PageNavigatorSize).attr("value",pagesize);


    // set page num
    var pagenum = 11;    //  this.pgGetPageSize();
    $("#"+this.ref_PageNavigatorCurPage).attr("value",pagenum);

    // set page count
    var pagecount = this.dsGetRowCount();     //  this.pgGetPageSize();
    $("#"+this.ref_PageNavigatorCountPage).attr("value",pagecount);

    // set row count
    var rowcount = 1230;    //  this.pgGetPageSize();
    $("#"+this.ref_PageNavigatorCountRow).attr("value",rowcount);
    */

    var ptr = this;
    $("#" + this.ref_PageNavigatorFirst).click(function () {
      //alert('First!');
      ptr.pgShowFirstPage.call(ptr);
    });

    $("#" + this.ref_PageNavigatorNext).click(function () {
      //alert('Next!');
      ptr.pgShowNextPage.call(ptr);
    });

    $("#" + this.ref_PageNavigatorPrev).click(function () {
      //alert('Prev');
      ptr.pgShowPrevPage.call(ptr);
    });

    $("#" + this.ref_PageNavigatorLast).click(function () {
      //alert('Last!');
      ptr.pgShowLastPage.call(ptr);
    });
  } catch (e) {
    alert("createPagingControls error " + e.message);
  }
};

GridView.prototype.pgCreatePagingControlsB = function (astate) {
  var mytable = this.getTablejq();

  try {
    this.ref_PageNavigatorDiv = "ptable_dv_pagenavigator";
    this.ref_PageNavigatorFirst = "ptable_btn_firstpage";
    this.ref_PageNavigatorNext = "ptable_btn_nextpage";
    this.ref_PageNavigatorPrev = "ptable_btn_prevpage";
    this.ref_PageNavigatorLast = "ptable_btn_lastpage";
    this.ref_PageNavigatorSizeLbl = "ptable_lbl_pagesize";
    this.ref_PageNavigatorSize = "ptable_input_pagesize";
    this.ref_PageNavigatorCurPageLbl = "ptable_lbl_curpage";
    this.ref_PageNavigatorCurPage = "ptable_lbl_curpagenum";
    this.ref_PageNavigatorCountPageLbl = "ptable_lbl_countpage";
    this.ref_PageNavigatorCountPage = "ptable_lbl_countpagenum";
    this.ref_PageNavigatorCountRowLbl = "ptable_lbl_countrow";
    this.ref_PageNavigatorCountRow = "ptable_lbl_countrownum";

    var pagenavigator = $(
      "<div style='width:100%'  id='" +
        this.ref_PageNavigatorDiv +
        "'>" +
        "<br><center>" +
        "<span/><span/><span/><span/><span/><span/><span/><span/><span/><input type=image id='" +
        this.ref_PageNavigatorFirst +
        "' src='img/DataContainer_MoveFirstHS.png' />" +
        "<input type=image id='" +
        this.ref_PageNavigatorPrev +
        "' src='img/DataContainer_MovePreviousHS.png' />" +
        "<span/><input disabled='true' style='width:40px' type=text id='" +
        this.ref_PageNavigatorCurPage +
        "' value='1' />" +
        "<input type=image id='" +
        this.ref_PageNavigatorNext +
        "' src='img/DataContainer_MoveNextHS.png' />" +
        "<input type=image id='" +
        this.ref_PageNavigatorLast +
        "' src='img/DataContainer_MoveLastHS.png' />" +
        "<span/><span/><label id='" +
        this.ref_PageNavigatorSizeLbl +
        "' " +
        " for '" +
        this.ref_PageNavigatorSize +
        "'>" +
        "Розмір" +
        "</label>" +
        "<input disabled='true' style='width:40px'  type=text id='" +
        this.ref_PageNavigatorSize +
        "' value='2' />" +
        "<span/><label id='" +
        this.ref_PageNavigatorCountPageLbl +
        "' " +
        " for '" +
        this.ref_PageNavigatorCountPage +
        "'>" +
        "Сторінок" +
        "</label>" +
        "<input disabled='true' style='width:60px' type=text id='" +
        this.ref_PageNavigatorCountPage +
        "' value='10' />" +
        "<span/><span/><label id='" +
        this.ref_PageNavigatorCountRowLbl +
        "' " +
        " for '" +
        this.ref_PageNavigatorCountRow +
        "'>" +
        " Рядків" +
        "</label>" +
        "<input disabled='true' style='width:80px' type=text id='" +
        this.ref_PageNavigatorCountRow +
        "' value='100' />"
      //"</div>"
    );
    mytable.before(pagenavigator);
    //
    /*
    // set page num
    var pagesize = this.pgGetPageSize();
    //alert('pagesize: ' + pagesize);
    $("#"+this.ref_PageNavigatorSize).attr("value",pagesize);


    // set page num
    var pagenum = 11;    //  this.pgGetPageSize();
    $("#"+this.ref_PageNavigatorCurPage).attr("value",pagenum);

    // set page count
    var pagecount = this.dsGetRowCount();     //  this.pgGetPageSize();
    $("#"+this.ref_PageNavigatorCountPage).attr("value",pagecount);

    // set row count
    var rowcount = 1230;    //  this.pgGetPageSize();
    $("#"+this.ref_PageNavigatorCountRow).attr("value",rowcount);
    */

    var ptr = this;
    $("#" + this.ref_PageNavigatorFirst).click(function () {
      //alert('First!');
      ptr.pgShowFirstPage.call(ptr);
    });

    $("#" + this.ref_PageNavigatorNext).click(function () {
      //alert('Next!');
      ptr.pgShowNextPage.call(ptr);
    });

    $("#" + this.ref_PageNavigatorPrev).click(function () {
      //alert('Prev');
      ptr.pgShowPrevPage.call(ptr);
    });

    $("#" + this.ref_PageNavigatorLast).click(function () {
      //alert('Last!');
      ptr.pgShowLastPage.call(ptr);
    });
  } catch (e) {
    alert("createPagingControls error " + e.message);
  }
};

GridView.prototype.pgCreatePagingControlsA = function (astate) {
  var mytable = this.getTablejq();

  try {
    this.ref_PageNavigatorDiv = "ptable_dv_pagenavigator";
    this.ref_PageNavigatorFirst = "ptable_btn_firstpage";
    this.ref_PageNavigatorNext = "ptable_btn_nextpage";
    this.ref_PageNavigatorPrev = "ptable_btn_prevpage";
    this.ref_PageNavigatorLast = "ptable_btn_lastpage";
    this.ref_PageNavigatorSizeLbl = "ptable_lbl_pagesize";
    this.ref_PageNavigatorSize = "ptable_input_pagesize";
    this.ref_PageNavigatorCurPageLbl = "ptable_lbl_curpage";
    this.ref_PageNavigatorCurPage = "ptable_lbl_curpagenum";
    this.ref_PageNavigatorCountPageLbl = "ptable_lbl_countpage";
    this.ref_PageNavigatorCountPage = "ptable_lbl_countpagenum";
    this.ref_PageNavigatorCountRowLbl = "ptable_lbl_countrow";
    this.ref_PageNavigatorCountRow = "ptable_lbl_countrownum";

    var pagenavigator = $(
      "<div style='width:100%' id='" +
        this.ref_PageNavigatorDiv +
        "'>" +
        "<span/><span/><input type=button id='" +
        this.ref_PageNavigatorFirst +
        "' value='First' />" +
        "<input type=button id='" +
        this.ref_PageNavigatorNext +
        "' value='Next' />" +
        "<input type=button id='" +
        this.ref_PageNavigatorPrev +
        "' value='Prev' />" +
        "<input type=button id='" +
        this.ref_PageNavigatorLast +
        "' value='Last' />" +
        "<span/><span/><label id='" +
        this.ref_PageNavigatorSizeLbl +
        "' " +
        " for '" +
        this.ref_PageNavigatorSize +
        "'>" +
        "PageSize" +
        "</label>" +
        "<input disabled='true' style='width:40px'  type=text id='" +
        this.ref_PageNavigatorSize +
        "' value='2' />" +
        "<span/><label id='" +
        this.ref_PageNavigatorCurPageLbl +
        "' " +
        " for '" +
        this.ref_PageNavigatorCurPage +
        "'>" +
        "Page" +
        "</label>" +
        "<input disabled='true' style='width:40px' type=text id='" +
        this.ref_PageNavigatorCurPage +
        "' value='1' />" +
        "<label id='" +
        this.ref_PageNavigatorCountPageLbl +
        "' " +
        " for '" +
        this.ref_PageNavigatorCountPage +
        "'>" +
        "Pages" +
        "</label>" +
        "<input disabled='true' style='width:60px' type=text id='" +
        this.ref_PageNavigatorCountPage +
        "' value='10' />" +
        "<span/><span/><label id='" +
        this.ref_PageNavigatorCountRowLbl +
        "' " +
        " for '" +
        this.ref_PageNavigatorCountRow +
        "'>" +
        " Rows" +
        "</label>" +
        "<input disabled='true' style='width:80px' type=text id='" +
        this.ref_PageNavigatorCountRow +
        "' value='100' />" +
        "</div>"
    );
    mytable.before(pagenavigator);
    //
    /*
    // set page num
    var pagesize = this.pgGetPageSize();
    //alert('pagesize: ' + pagesize);
    $("#"+this.ref_PageNavigatorSize).attr("value",pagesize);


    // set page num
    var pagenum = 11;    //  this.pgGetPageSize();
    $("#"+this.ref_PageNavigatorCurPage).attr("value",pagenum);

    // set page count
    var pagecount = this.dsGetRowCount();     //  this.pgGetPageSize();
    $("#"+this.ref_PageNavigatorCountPage).attr("value",pagecount);

    // set row count
    var rowcount = 1230;    //  this.pgGetPageSize();
    $("#"+this.ref_PageNavigatorCountRow).attr("value",rowcount);
    */

    var ptr = this;
    $("#" + this.ref_PageNavigatorFirst).click(function () {
      //alert('First!');
      ptr.pgShowFirstPage.call(ptr);
    });

    $("#" + this.ref_PageNavigatorNext).click(function () {
      //alert('Next!');
      ptr.pgShowNextPage.call(ptr);
    });

    $("#" + this.ref_PageNavigatorPrev).click(function () {
      //alert('Prev');
      ptr.pgShowPrevPage.call(ptr);
    });

    $("#" + this.ref_PageNavigatorLast).click(function () {
      //alert('Last!');
      ptr.pgShowLastPage.call(ptr);
    });
  } catch (e) {
    alert("createPagingControls error " + e.message);
  }
};

///var g = new GridView();

////g.Init();

/*
 $("body").on('click','.hcell',function (e) {

            e.preventDefault();
            alert('THClicked!');
            alert(JSON.stringify(this));
            this.sortorder = 'desc';
        });

 $("body").on('click','.dcell',function (e) {

            e.preventDefault();
            alert('TDClicked!');
            alert(JSON.stringify(this));
});
 */
