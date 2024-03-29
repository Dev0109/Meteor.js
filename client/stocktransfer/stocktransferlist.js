import { StockTransferService } from "../inventory/stockadjust-service";
import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../js/core-service';

import {UtilityService} from "../utility-service";
import { SideBarService } from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
let sideBarService = new SideBarService();
let utilityService = new UtilityService();
Template.stocktransferlist.onCreated(function(){
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
});

Template.stocktransferlist.onRendered(function() {
    $('.fullScreenSpin').css('display','inline-block');
    let templateObject = Template.instance();
    let stockTransferService = new StockTransferService();
    const customerList = [];
    let salesOrderTable;
    var splashArray = new Array();
    const dataTableList = [];
    const tableHeaderList = [];

    if(FlowRouter.current().queryParams.success){
        $('.btnRefresh').addClass('btnRefreshAlert');
    }

    Meteor.call('readPrefMethod',Session.get('mycloudLogonID'),'tblStockTransferList', function(error, result){
        if(error){

        }else{
            if(result){

                for (let i = 0; i < result.customFields.length; i++) {
                    let customcolumn = result.customFields;
                    let columData = customcolumn[i].label;
                    let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                    let hiddenColumn = customcolumn[i].hidden;
                    let columnClass = columHeaderUpdate.split('.')[1];
                    let columnWidth = customcolumn[i].width;
                    // let columnindex = customcolumn[i].index + 1;
                    $("th."+columnClass+"").html(columData);
                    $("th."+columnClass+"").css('width',""+columnWidth+"px");

                }
            }

        }
    });

    function MakeNegative() {
        $('td').each(function(){
            if($(this).text().indexOf('-'+Currency) >= 0) $(this).addClass('text-danger')
        });
    };
    // $('#tblStockTransferList').DataTable();
    templateObject.resetData = function (dataVal) {
        window.open('/stocktransferlist?page=last','_self');
    }

    templateObject.getAllStockTransferEntryData = function () {
        getVS1Data('TStockTransferEntry').then(function (dataObject) {
            if(dataObject.length == 0){
                sideBarService.getAllStockTransferEntry(initialDataLoad,0).then(function (data) {
                    let lineItems = [];
                    let lineItemObj = {};
                    addVS1Data('TStockTransferEntry',JSON.stringify(data));
                    for(let i=0; i<data.tstocktransferentry.length; i++){

                        //let totalCostEx = utilityService.modifynegativeCurrencyFormat(data.tstocktransferentry[i].fields.TotalCostEx)|| 0.00;
                        var dataList = {
                            id: data.tstocktransferentry[i].fields.ID || '',
                            employee:data.tstocktransferentry[i].fields.EmployeeName || '',
                            sortdate: data.tstocktransferentry[i].fields.CreationDate !=''? moment(data.tstocktransferentry[i].fields.CreationDate).format("YYYY/MM/DD"): data.tstocktransferentry[i].fields.CreationDate,
                            creationdate: data.tstocktransferentry[i].fields.CreationDate !=''? moment(data.tstocktransferentry[i].fields.CreationDate).format("DD/MM/YYYY"): data.tstocktransferentry[i].fields.CreationDate,
                            adjustmentdate: data.tstocktransferentry[i].fields.DateTransferred !=''? moment(data.tstocktransferentry[i].fields.DateTransferred).format("DD/MM/YYYY"): data.tstocktransferentry[i].fields.DateTransferred,
                            accountname: data.tstocktransferentry[i].fields.AccountName || '',
                            //totalcostex: totalCostEx || 0.00,
                            custfield1: '',
                            custfield2: '',
                            transferdept: data.tstocktransferentry[i].fields.TransferFromClassName || '',
                            notes: data.tstocktransferentry[i].fields.Notes || '',
                            processed: data.tstocktransferentry[i].fields.Processed
                        };
                        dataTableList.push(dataList);
                    }

                    templateObject.datatablerecords.set(dataTableList);
                    if(templateObject.datatablerecords.get()){

                        Meteor.call('readPrefMethod',Session.get('mycloudLogonID'),'tblStockTransferList', function(error, result){
                            if(error){

                            }else{
                                if(result){
                                    for (let i = 0; i < result.customFields.length; i++) {
                                        let customcolumn = result.customFields;
                                        let columData = customcolumn[i].label;
                                        let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                                        let hiddenColumn = customcolumn[i].hidden;
                                        let columnClass = columHeaderUpdate.split('.')[1];
                                        let columnWidth = customcolumn[i].width;
                                        let columnindex = customcolumn[i].index + 1;

                                        if(hiddenColumn == true){

                                            $("."+columnClass+"").addClass('hiddenColumn');
                                            $("."+columnClass+"").removeClass('showColumn');
                                        }else if(hiddenColumn == false){
                                            $("."+columnClass+"").removeClass('hiddenColumn');
                                            $("."+columnClass+"").addClass('showColumn');
                                        }

                                    }
                                }

                            }
                        });


                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                    }

                    $('.fullScreenSpin').css('display','none');
                    setTimeout(function () {
                        //$.fn.dataTable.moment('DD/MM/YY');
                        $('#tblStockTransferList').DataTable({
                            // dom: 'lBfrtip',
                            columnDefs: [
                                {type: 'date', targets: 0}
                                // ,
                                // { targets: 0, className: "text-center" }

                            ],
                            "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                            buttons: [
                                {
                                    extend: 'excelHtml5',
                                    text: '',
                                    download: 'open',
                                    className: "btntabletocsv hiddenColumn",
                                    filename: "Stock Adjustment List - "+ moment().format(),
                                    orientation:'portrait',
                                    exportOptions: {
                                        columns: ':visible',
                                        format: {
                                        body: function ( data, row, column ) {
                                            if(data.includes("</span>")){
                                                var res = data.split("</span>");
                                                data = res[1];
                                            }

                                            return column === 1 ? data.replace(/<.*?>/ig, ""): data;

                                        }
                                    }
                                    }
                                },{
                                    extend: 'print',
                                    download: 'open',
                                    className: "btntabletopdf hiddenColumn",
                                    text: '',
                                    title: 'Stock Adjust Overview',
                                    filename: "Stock Adjustment List - "+ moment().format(),
                                    exportOptions: {
                                        columns: ':visible',
                                        stripHtml: false
                                    },
                                    // customize: function ( win ) {
                                    //     $(win.document.body)
                                    //         .css( 'font-size', '10pt' )
                                    //         .prepend(
                                    //             '<img src="http://datatables.net/media/images/logo-fade.png" style="position:absolute; top:0; left:0;" />'
                                    //         );
                                    //
                                    //     $(win.document.body).find( 'table' )
                                    //         .addClass( 'compact' )
                                    //         .css( 'font-size', 'inherit' );
                                    // }
                                }],
                            select: true,
                            destroy: true,
                            colReorder: true,
                            // bStateSave: true,
                            // rowId: 0,
                            pageLength: initialDatatableLoad,
                            lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                            info: true,
                            responsive: true,
                            "order": [[ 1, "desc" ],[ 0, "desc" ]],
                            // "aaSorting": [[1,'desc']],
                            action: function () {
                                $('#tblStockTransferList').DataTable().ajax.reload();
                            },
                            "fnDrawCallback": function (oSettings) {
                                setTimeout(function () {
                                    MakeNegative();
                                }, 100);
                            },
                            language: { search: "",searchPlaceholder: "Search List..." },
                            "fnInitComplete": function () {
                            $("<button class='btn btn-primary btnRefreshStockAdjustment' type='button' id='btnRefreshStockAdjustment' style='padding: 4px 10px; font-size: 16px; margin-left: 14px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblStockTransferList_filter");
                        }

                        }).on('page', function () {
                            setTimeout(function () {
                                MakeNegative();
                            }, 100);
                            let draftRecord = templateObject.datatablerecords.get();
                            templateObject.datatablerecords.set(draftRecord);
                        }).on('column-reorder', function () {

                        });
                        $('.fullScreenSpin').css('display','none');
                    }, 0);

                    var columns = $('#tblStockTransferList th');
                    let sTible = "";
                    let sWidth = "";
                    let sIndex = "";
                    let sVisible = "";
                    let columVisible = false;
                    let sClass = "";
                    $.each(columns, function(i,v) {
                        if(v.hidden == false){
                            columVisible =  true;
                        }
                        if((v.className.includes("hiddenColumn"))){
                            columVisible = false;
                        }
                        sWidth = v.style.width.replace('px', "");

                        let datatablerecordObj = {
                            sTitle: v.innerText || '',
                            sWidth: sWidth || '',
                            sIndex: v.cellIndex || 0,
                            sVisible: columVisible || false,
                            sClass: v.className || ''
                        };
                        tableHeaderList.push(datatablerecordObj);
                    });
                    templateObject.tableheaderrecords.set(tableHeaderList);
                    $('div.dataTables_filter input').addClass('form-control form-control-sm');
                    $('#tblStockTransferList tbody').on( 'click', 'tr', function () {
                        var listData = $(this).closest('tr').attr('id');
                        if(listData){
                            window.open('/stocktransfercard?id=' + listData,'_self');
                        }
                    });

                }).catch(function (err) {
                    // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                    $('.fullScreenSpin').css('display','none');
                    // Meteor._reload.reload();
                });
            }else{
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tstocktransferentry;
                let lineItems = [];
                let lineItemObj = {};
                for(let i=0; i<useData.length; i++){
                  // let totalTransferQty = 0;
                  // if (useData[i].fields.Lines.length) {
                  //     for (let l = 0; l < useData[i].fields.Lines.length; l++) {
                  //       totalTransferQty = useData[i].fields.Lines[l].fields.TransferQty||0;
                  //     }
                  // }else{
                  //   totalTransferQty = useData[i].fields.Lines.fields.TransferQty||0;
                  // }
                    //let totalCostEx = utilityService.modifynegativeCurrencyFormat(useData[i].fields.TotalCostEx)|| 0.00;
                    var dataList = {
                        id: useData[i].fields.ID || '',
                        employee:useData[i].fields.EmployeeName || '',
                        sortdate: useData[i].fields.CreationDate !=''? moment(useData[i].fields.CreationDate).format("YYYY/MM/DD"): useData[i].fields.CreationDate,
                        creationdate: useData[i].fields.CreationDate !=''? moment(useData[i].fields.CreationDate).format("DD/MM/YYYY"): useData[i].fields.CreationDate,
                        adjustmentdate: useData[i].fields.DateTransferred !=''? moment(useData[i].fields.DateTransferred).format("DD/MM/YYYY"): useData[i].fields.DateTransferred,
                        accountname: useData[i].fields.AccountName || '',
                        //totaltrans: totalTransferQty || 0,
                        custfield1: '',
                        custfield2: '',
                        transferdept: useData[i].fields.TransferFromClassName || '',
                        notes: useData[i].fields.Notes || '',
                        processed: useData[i].fields.Processed
                    };
                    dataTableList.push(dataList);

                }

                templateObject.datatablerecords.set(dataTableList);
                if(templateObject.datatablerecords.get()){

                    Meteor.call('readPrefMethod',Session.get('mycloudLogonID'),'tblStockTransferList', function(error, result){
                        if(error){

                        }else{
                            if(result){
                                for (let i = 0; i < result.customFields.length; i++) {
                                    let customcolumn = result.customFields;
                                    let columData = customcolumn[i].label;
                                    let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                                    let hiddenColumn = customcolumn[i].hidden;
                                    let columnClass = columHeaderUpdate.split('.')[1];
                                    let columnWidth = customcolumn[i].width;
                                    let columnindex = customcolumn[i].index + 1;

                                    if(hiddenColumn == true){

                                        $("."+columnClass+"").addClass('hiddenColumn');
                                        $("."+columnClass+"").removeClass('showColumn');
                                    }else if(hiddenColumn == false){
                                        $("."+columnClass+"").removeClass('hiddenColumn');
                                        $("."+columnClass+"").addClass('showColumn');
                                    }

                                }
                            }

                        }
                    });


                    setTimeout(function () {
                        MakeNegative();
                    }, 100);
                }

                $('.fullScreenSpin').css('display','none');
                setTimeout(function () {
                    //$.fn.dataTable.moment('DD/MM/YY');
                    $('#tblStockTransferList').DataTable({
                        // dom: 'lBfrtip',
                        columnDefs: [
                            {type: 'date', targets: 0}
                            // ,
                            // { targets: 0, className: "text-center" }

                        ],
                        "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        buttons: [
                            {
                                extend: 'excelHtml5',
                                text: '',
                                download: 'open',
                                className: "btntabletocsv hiddenColumn",
                                filename: "Stock Adjustment List - "+ moment().format(),
                                orientation:'portrait',
                                exportOptions: {
                                    columns: ':visible',
                                    format: {
                                        body: function ( data, row, column ) {
                                            if(data.includes("</span>")){
                                                var res = data.split("</span>");
                                                data = res[1];
                                            }

                                            return column === 1 ? data.replace(/<.*?>/ig, ""): data;

                                        }
                                    }
                                }
                            },{
                                extend: 'print',
                                download: 'open',
                                className: "btntabletopdf hiddenColumn",
                                text: '',
                                title: 'Stock Adjust Overview',
                                filename: "Stock Adjustment List - "+ moment().format(),
                                exportOptions: {
                                    columns: ':visible',
                                    stripHtml: false
                                },
                                // customize: function ( win ) {
                                //     $(win.document.body)
                                //         .css( 'font-size', '10pt' )
                                //         .prepend(
                                //             '<img src="http://datatables.net/media/images/logo-fade.png" style="position:absolute; top:0; left:0;" />'
                                //         );
                                //
                                //     $(win.document.body).find( 'table' )
                                //         .addClass( 'compact' )
                                //         .css( 'font-size', 'inherit' );
                                // }
                            }],
                        select: true,
                        destroy: true,
                        colReorder: true,
                        // bStateSave: true,
                        // rowId: 0,
                        pageLength: initialDatatableLoad,
                        lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                        info: true,
                        responsive: true,
                        "order": [[ 1, "desc" ],[ 0, "desc" ]],
                        // "aaSorting": [[1,'desc']],
                        action: function () {
                            $('#tblStockTransferList').DataTable().ajax.reload();
                        },
                        "fnDrawCallback": function (oSettings) {
                          $('.paginate_button.page-item').removeClass('disabled');
                          $('#tblStockTransferList_ellipsis').addClass('disabled');

                          if(oSettings._iDisplayLength == -1){
                            if(oSettings.fnRecordsDisplay() > 150){
                              $('.paginate_button.page-item.previous').addClass('disabled');
                              $('.paginate_button.page-item.next').addClass('disabled');
                            }
                          }else{

                          }
                          if(oSettings.fnRecordsDisplay() < initialDatatableLoad){
                              $('.paginate_button.page-item.next').addClass('disabled');
                          }

                          $('.paginate_button.next:not(.disabled)', this.api().table().container())
                           .on('click', function(){
                             $('.fullScreenSpin').css('display','inline-block');
                             let dataLenght = oSettings._iDisplayLength;

                             sideBarService.getAllStockTransferEntry(initialDatatableLoad,oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
                               getVS1Data('TStockTransferEntry').then(function (dataObjectold) {
                                 if(dataObjectold.length == 0){

                                 }else{
                                   let dataOld = JSON.parse(dataObjectold[0].data);

                                   var thirdaryData = $.merge($.merge([], dataObjectnew.tstocktransferentry), dataOld.tstocktransferentry);
                                   let objCombineData = {
                                     tstocktransferentry:thirdaryData
                                   }


                                     addVS1Data('TStockTransferEntry',JSON.stringify(objCombineData)).then(function (datareturn) {
                                       templateObject.resetData(objCombineData);
                                     $('.fullScreenSpin').css('display','none');
                                     }).catch(function (err) {
                                     $('.fullScreenSpin').css('display','none');
                                     });

                                 }
                                }).catch(function (err) {

                                });

                             }).catch(function(err) {
                               $('.fullScreenSpin').css('display','none');
                             });

                           });
                            setTimeout(function () {
                                MakeNegative();
                            }, 100);
                        },
                        language: { search: "",searchPlaceholder: "Search List..." },
                        "fnInitComplete": function () {
                          let urlParametersPage = FlowRouter.current().queryParams.page;
                          if(urlParametersPage){
                            this.fnPageChange('last');
                          }
                            $("<button class='btn btn-primary btnRefreshStockAdjustment' type='button' id='btnRefreshStockAdjustment' style='padding: 4px 10px; font-size: 16px; margin-left: 14px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblStockTransferList_filter");
                         }

                    }).on('page', function () {
                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                        let draftRecord = templateObject.datatablerecords.get();
                        templateObject.datatablerecords.set(draftRecord);
                    }).on('column-reorder', function () {

                    }).on( 'length.dt', function ( e, settings, len ) {
                      $('.fullScreenSpin').css('display','inline-block');
                      let dataLenght = settings._iDisplayLength;
                      if(dataLenght == -1){
                        if(settings.fnRecordsDisplay() > initialDatatableLoad){
                          $('.fullScreenSpin').css('display','none');
                        }else{
                        sideBarService.getAllStockTransferEntry('All',1).then(function(dataNonBo) {

                          addVS1Data('TStockTransferEntry',JSON.stringify(dataNonBo)).then(function (datareturn) {
                            templateObject.resetData(dataNonBo);
                          $('.fullScreenSpin').css('display','none');
                          }).catch(function (err) {
                          $('.fullScreenSpin').css('display','none');
                          });
                        }).catch(function(err) {
                          $('.fullScreenSpin').css('display','none');
                        });
                       }
                      }else{
                        if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
                          $('.fullScreenSpin').css('display','none');
                        }else{
                          sideBarService.getAllStockTransferEntry(dataLenght,0).then(function(dataNonBo) {

                            addVS1Data('TStockTransferEntry',JSON.stringify(dataNonBo)).then(function (datareturn) {
                              templateObject.resetData(dataNonBo);
                            $('.fullScreenSpin').css('display','none');
                            }).catch(function (err) {
                            $('.fullScreenSpin').css('display','none');
                            });
                          }).catch(function(err) {
                            $('.fullScreenSpin').css('display','none');
                          });
                        }
                      }
                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                    });
                    $('.fullScreenSpin').css('display','none');
                }, 0);

                var columns = $('#tblStockTransferList th');
                let sTible = "";
                let sWidth = "";
                let sIndex = "";
                let sVisible = "";
                let columVisible = false;
                let sClass = "";
                $.each(columns, function(i,v) {
                    if(v.hidden == false){
                        columVisible =  true;
                    }
                    if((v.className.includes("hiddenColumn"))){
                        columVisible = false;
                    }
                    sWidth = v.style.width.replace('px', "");

                    let datatablerecordObj = {
                        sTitle: v.innerText || '',
                        sWidth: sWidth || '',
                        sIndex: v.cellIndex || 0,
                        sVisible: columVisible || false,
                        sClass: v.className || ''
                    };
                    tableHeaderList.push(datatablerecordObj);
                });
                templateObject.tableheaderrecords.set(tableHeaderList);
                $('div.dataTables_filter input').addClass('form-control form-control-sm');
                $('#tblStockTransferList tbody').on( 'click', 'tr', function () {
                    var listData = $(this).closest('tr').attr('id');
                    if(listData){
                        FlowRouter.go('/stocktransfercard?id=' + listData);
                    }
                });


            }
        }).catch(function (err) {
            sideBarService.getAllStockTransferEntry(initialDataLoad,0).then(function (data) {
                let lineItems = [];
                let lineItemObj = {};
                addVS1Data('TStockTransferEntry',JSON.stringify(data));
                for(let i=0; i<data.tstocktransferentry.length; i++){

                    //let totalCostEx = utilityService.modifynegativeCurrencyFormat(data.tstocktransferentry[i].fields.TotalCostEx)|| 0.00;
                    var dataList = {
                        id: data.tstocktransferentry[i].fields.ID || '',
                        employee:data.tstocktransferentry[i].fields.EmployeeName || '',
                        sortdate: data.tstocktransferentry[i].fields.CreationDate !=''? moment(data.tstocktransferentry[i].fields.CreationDate).format("YYYY/MM/DD"): data.tstocktransferentry[i].fields.CreationDate,
                        creationdate: data.tstocktransferentry[i].fields.CreationDate !=''? moment(data.tstocktransferentry[i].fields.CreationDate).format("DD/MM/YYYY"): data.tstocktransferentry[i].fields.CreationDate,
                        adjustmentdate: data.tstocktransferentry[i].fields.DateTransferred !=''? moment(data.tstocktransferentry[i].fields.DateTransferred).format("DD/MM/YYYY"): data.tstocktransferentry[i].fields.DateTransferred,
                        accountname: data.tstocktransferentry[i].fields.AccountName || '',
                        //totalcostex: totalCostEx || 0.00,
                        custfield1: '',
                        custfield2: '',
                        transferdept: data.tstocktransferentry[i].fields.TransferFromClassName || '',
                        notes: data.tstocktransferentry[i].fields.Notes || '',
                        processed: data.tstocktransferentry[i].fields.Processed,
                    };
                    dataTableList.push(dataList);
                }

                templateObject.datatablerecords.set(dataTableList);
                if(templateObject.datatablerecords.get()){

                    Meteor.call('readPrefMethod',Session.get('mycloudLogonID'),'tblStockTransferList', function(error, result){
                        if(error){

                        }else{
                            if(result){
                                for (let i = 0; i < result.customFields.length; i++) {
                                    let customcolumn = result.customFields;
                                    let columData = customcolumn[i].label;
                                    let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                                    let hiddenColumn = customcolumn[i].hidden;
                                    let columnClass = columHeaderUpdate.split('.')[1];
                                    let columnWidth = customcolumn[i].width;
                                    let columnindex = customcolumn[i].index + 1;

                                    if(hiddenColumn == true){

                                        $("."+columnClass+"").addClass('hiddenColumn');
                                        $("."+columnClass+"").removeClass('showColumn');
                                    }else if(hiddenColumn == false){
                                        $("."+columnClass+"").removeClass('hiddenColumn');
                                        $("."+columnClass+"").addClass('showColumn');
                                    }

                                }
                            }

                        }
                    });


                    setTimeout(function () {
                        MakeNegative();
                    }, 100);
                }

                $('.fullScreenSpin').css('display','none');
                setTimeout(function () {
                    //$.fn.dataTable.moment('DD/MM/YY');
                    $('#tblStockTransferList').DataTable({
                        // dom: 'lBfrtip',
                        columnDefs: [
                            {type: 'date', targets: 0}
                            // ,
                            // { targets: 0, className: "text-center" }

                        ],
                        "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        buttons: [
                            {
                                extend: 'excelHtml5',
                                text: '',
                                download: 'open',
                                className: "btntabletocsv hiddenColumn",
                                filename: "Stock Adjustment List - "+ moment().format(),
                                orientation:'portrait',
                                exportOptions: {
                                    columns: ':visible',
                                    format: {
                                        body: function ( data, row, column ) {
                                            if(data.includes("</span>")){
                                                var res = data.split("</span>");
                                                data = res[1];
                                            }

                                            return column === 1 ? data.replace(/<.*?>/ig, ""): data;

                                        }
                                    }
                                }
                            },{
                                extend: 'print',
                                download: 'open',
                                className: "btntabletopdf hiddenColumn",
                                text: '',
                                title: 'Stock Adjust Overview',
                                filename: "Stock Adjustment List - "+ moment().format(),
                                exportOptions: {
                                    columns: ':visible',
                                    stripHtml: false
                                },
                                // customize: function ( win ) {
                                //     $(win.document.body)
                                //         .css( 'font-size', '10pt' )
                                //         .prepend(
                                //             '<img src="http://datatables.net/media/images/logo-fade.png" style="position:absolute; top:0; left:0;" />'
                                //         );
                                //
                                //     $(win.document.body).find( 'table' )
                                //         .addClass( 'compact' )
                                //         .css( 'font-size', 'inherit' );
                                // }
                            }],
                        select: true,
                        destroy: true,
                        colReorder: true,
                        // bStateSave: true,
                        // rowId: 0,
                        pageLength: initialDatatableLoad,
                        lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                        info: true,
                        responsive: true,
                        "order": [[ 1, "desc" ],[ 0, "desc" ]],
                        // "aaSorting": [[1,'desc']],
                        action: function () {
                            $('#tblStockTransferList').DataTable().ajax.reload();
                        },
                        "fnDrawCallback": function (oSettings) {
                            setTimeout(function () {
                                MakeNegative();
                            }, 100);
                        },

                    }).on('page', function () {
                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                        let draftRecord = templateObject.datatablerecords.get();
                        templateObject.datatablerecords.set(draftRecord);
                    }).on('column-reorder', function () {

                    });
                    $('.fullScreenSpin').css('display','none');
                }, 0);

                var columns = $('#tblStockTransferList th');
                let sTible = "";
                let sWidth = "";
                let sIndex = "";
                let sVisible = "";
                let columVisible = false;
                let sClass = "";
                $.each(columns, function(i,v) {
                    if(v.hidden == false){
                        columVisible =  true;
                    }
                    if((v.className.includes("hiddenColumn"))){
                        columVisible = false;
                    }
                    sWidth = v.style.width.replace('px', "");

                    let datatablerecordObj = {
                        sTitle: v.innerText || '',
                        sWidth: sWidth || '',
                        sIndex: v.cellIndex || 0,
                        sVisible: columVisible || false,
                        sClass: v.className || ''
                    };
                    tableHeaderList.push(datatablerecordObj);
                });
                templateObject.tableheaderrecords.set(tableHeaderList);
                $('div.dataTables_filter input').addClass('form-control form-control-sm');
                $('#tblStockTransferList tbody').on( 'click', 'tr', function () {
                    var listData = $(this).closest('tr').attr('id');
                    if(listData){
                        window.open('/stocktransfercard?id=' + listData,'_self');
                    }
                });

            }).catch(function (err) {
                // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                $('.fullScreenSpin').css('display','none');
                // Meteor._reload.reload();
            });
        });

    }

    templateObject.getAllStockTransferEntryData();
    tableResize();
});

Template.stocktransferlist.events({
    'click .btnRefresh': function () {
        $('.fullScreenSpin').css('display','inline-block');
        sideBarService.getAllStockTransferEntry(initialDataLoad,0).then(function(data) {
            addVS1Data('TStockTransferEntry',JSON.stringify(data)).then(function (datareturn) {
                window.open('/stocktransferlist','_self');
            }).catch(function (err) {
                window.open('/stocktransferlist','_self');
            });
        }).catch(function(err) {
            window.open('/stocktransferlist','_self');
        });
    },
    'click .btnnewstockadjustment' : function(event){
        FlowRouter.go('/stocktransfercard');
    },
    'click .chkDatatable' : function(event){
        var columns = $('#tblStockTransferList th');
        let columnDataValue = $(event.target).closest("div").find(".divcolumn").text();

        $.each(columns, function(i,v) {
            let className = v.classList;
            let replaceClass = className[1];

            if(v.innerText == columnDataValue){
                if($(event.target).is(':checked')){
                    $("."+replaceClass+"").css('display','table-cell');
                    $("."+replaceClass+"").css('padding','.75rem');
                    $("."+replaceClass+"").css('vertical-align','top');
                }else{
                    $("."+replaceClass+"").css('display','none');
                }
            }
        });
    },
    'keyup #tblStockTransferList_filter input': function (event) {
          if($(event.target).val() != ''){
            $(".btnRefreshStockAdjustment").addClass('btnSearchAlert');
          }else{
            $(".btnRefreshStockAdjustment").removeClass('btnSearchAlert');
          }
          if (event.keyCode == 13) {
             $(".btnRefreshStockAdjustment").trigger("click");
          }
        },
        'click .btnRefreshStockAdjustment':function(event){
        $(".btnRefresh").trigger("click");
    },
    'click .resetTable' : function(event){
        var getcurrentCloudDetails = CloudUser.findOne({_id:Session.get('mycloudLogonID'),clouddatabaseID:Session.get('mycloudLogonDBID')});
        if(getcurrentCloudDetails){
            if (getcurrentCloudDetails._id.length > 0) {
                var clientID = getcurrentCloudDetails._id;
                var clientUsername = getcurrentCloudDetails.cloudUsername;
                var clientEmail = getcurrentCloudDetails.cloudEmail;
                var checkPrefDetails = CloudPreference.findOne({userid:clientID,PrefName:'tblStockTransferList'});
                if (checkPrefDetails) {
                    CloudPreference.remove({_id:checkPrefDetails._id}, function(err, idTag) {
                        if (err) {

                        }else{
                            Meteor._reload.reload();
                        }
                    });

                }
            }
        }
    },
    'click .saveTable' : function(event){
        let lineItems = [];
        //let datatable =$('#tblStockTransferList').DataTable();
        $('.columnSettings').each(function (index) {
            var $tblrow = $(this);
            var colTitle = $tblrow.find(".divcolumn").text()||'';
            var colWidth = $tblrow.find(".custom-range").val()||0;
            var colthClass = $tblrow.find(".divcolumn").attr("valueupdate")||'';
            var colHidden = false;
            if($tblrow.find(".custom-control-input").is(':checked')){
                colHidden = false;
            }else{
                colHidden = true;
            }
            let lineItemObj = {
                index: index,
                label: colTitle,
                hidden: colHidden,
                width: colWidth,
                thclass: colthClass
            }

            lineItems.push(lineItemObj);
        });
        //datatable.state.save();

        var getcurrentCloudDetails = CloudUser.findOne({_id:Session.get('mycloudLogonID'),clouddatabaseID:Session.get('mycloudLogonDBID')});
        if(getcurrentCloudDetails){
            if (getcurrentCloudDetails._id.length > 0) {
                var clientID = getcurrentCloudDetails._id;
                var clientUsername = getcurrentCloudDetails.cloudUsername;
                var clientEmail = getcurrentCloudDetails.cloudEmail;
                var checkPrefDetails = CloudPreference.findOne({userid:clientID,PrefName:'tblStockTransferList'});
                if (checkPrefDetails) {
                    CloudPreference.update({_id: checkPrefDetails._id},{$set: { userid: clientID,username:clientUsername,useremail:clientEmail,
                                                                               PrefGroup:'salesform',PrefName:'tblStockTransferList',published:true,
                                                                               customFields:lineItems,
                                                                               updatedAt: new Date() }}, function(err, idTag) {
                        if (err) {
                            $('#myModal2').modal('toggle');
                        } else {
                            $('#myModal2').modal('toggle');
                        }
                    });

                }else{
                    CloudPreference.insert({ userid: clientID,username:clientUsername,useremail:clientEmail,
                                            PrefGroup:'salesform',PrefName:'tblStockTransferList',published:true,
                                            customFields:lineItems,
                                            createdAt: new Date() }, function(err, idTag) {
                        if (err) {
                            $('#myModal2').modal('toggle');
                        } else {
                            $('#myModal2').modal('toggle');

                        }
                    });

                }
            }
        }

        //Meteor._reload.reload();
    },
    'blur .divcolumn' : function(event){
        let columData = $(event.target).text();

        let columnDatanIndex = $(event.target).closest("div.columnSettings").attr('id');

        var datable = $('#tblStockTransferList').DataTable();
        var title = datable.column( columnDatanIndex ).header();
        $(title).html(columData);

    },
    'change .rngRange' : function(event){
        let range = $(event.target).val();
        // $(event.target).closest("div.divColWidth").find(".spWidth").html(range+'px');

        // let columData = $(event.target).closest("div.divColWidth").find(".spWidth").attr("value");
        let columnDataValue = $(event.target).closest("div").prev().find(".divcolumn").text();
        var datable = $('#tblStockTransferList th');
        $.each(datable, function(i,v) {

            if(v.innerText == columnDataValue){
                let className = v.className;
                let replaceClass = className.replace(/ /g, ".");
                $("."+replaceClass+"").css('width',range+'px');

            }
        });

    },
    'click .btnOpenSettings' : function(event){
        let templateObject = Template.instance();
        var columns = $('#tblStockTransferList th');

        const tableHeaderList = [];
        let sTible = "";
        let sWidth = "";
        let sIndex = "";
        let sVisible = "";
        let columVisible = false;
        let sClass = "";
        $.each(columns, function(i,v) {
            if(v.hidden == false){
                columVisible =  true;
            }
            if((v.className.includes("hiddenColumn"))){
                columVisible = false;
            }
            sWidth = v.style.width.replace('px', "");

            let datatablerecordObj = {
                sTitle: v.innerText || '',
                sWidth: sWidth || '',
                sIndex: v.cellIndex || 0,
                sVisible: columVisible || false,
                sClass: v.className || ''
            };
            tableHeaderList.push(datatablerecordObj);
        });

        templateObject.tableheaderrecords.set(tableHeaderList);
    },
    'click #exportbtn': function () {

        $('.fullScreenSpin').css('display','inline-block');
        jQuery('#tblStockTransferList_wrapper .dt-buttons .btntabletocsv').click();
        $('.fullScreenSpin').css('display','none');

    },
    'click .printConfirm' : function(event){
        playPrintAudio();
        setTimeout(function(){
        $('.fullScreenSpin').css('display','inline-block');
        jQuery('#tblStockTransferList_wrapper .dt-buttons .btntabletopdf').click();
        $('.fullScreenSpin').css('display','none');
    }, delayTimeAfterSound);
    },

    'click .printConfirm' : function(event){
        playPrintAudio();
        setTimeout(function(){
    $('.fullScreenSpin').css('display','inline-block');
    jQuery('#tblInventory_wrapper .dt-buttons .btntabletopdf').click();
    $('.fullScreenSpin').css('display','none');
    }, delayTimeAfterSound);
    },
    'click .btnStockAdjustment' : function(event){
      FlowRouter.go('/stockadjustmentoverview');
    },
    'click .templateDownload': function () {
    let utilityService = new UtilityService();
    let rows =[];
    const filename = 'SampleProduct'+'.csv';
    rows[0]= ['Product Name','Sales Description','Sale Price', 'Sales Account', 'Tax Code','Barcode', 'Purchase Description', 'COGGS Account', 'Purchase Tax Code', 'Cost'];
    rows[1]= ['TSL - Black','T-Shirt Large Black', '600', 'Sales','NT', '','T-Shirt Large Black', 'Cost of Goods Sold', 'NT', '700'];
    utilityService.exportToCsv(rows, filename, 'csv');
    },
    'click .btnUploadFile':function(event){
    $('#attachment-upload').val('');
    $('.file-name').text('');
    //$(".btnImport").removeAttr("disabled");
    $('#attachment-upload').trigger('click');
    },
    'click .templateDownloadXLSX': function (e) {

      e.preventDefault();  //stop the browser from following
      window.location.href = 'sample_imports/SampleProduct.xlsx';
    },
    'change #attachment-upload': function (e) {
        let templateObj = Template.instance();
        var filename = $('#attachment-upload')[0].files[0]['name'];
        var fileExtension = filename.split('.').pop().toLowerCase();
        var validExtensions = ["csv","txt","xlsx"];
        var validCSVExtensions = ["csv","txt"];
        var validExcelExtensions = ["xlsx","xls"];

        if (validExtensions.indexOf(fileExtension) == -1) {
            // Bert.alert('<strong>formats allowed are : '+ validExtensions.join(', ')+'</strong>!', 'danger');
            swal('Invalid Format', 'formats allowed are :' + validExtensions.join(', '), 'error');
            $('.file-name').text('');
            $(".btnImport").Attr("disabled");
        }else if(validCSVExtensions.indexOf(fileExtension) != -1){

          $('.file-name').text(filename);
          let selectedFile = event.target.files[0];
          templateObj.selectedFile.set(selectedFile);
          if($('.file-name').text() != ""){
            $(".btnImport").removeAttr("disabled");
          }else{
            $(".btnImport").Attr("disabled");
          }
        }else if(fileExtension == 'xlsx'){
          $('.file-name').text(filename);
          let selectedFile = event.target.files[0];
          var oFileIn;
        var oFile = selectedFile;
        var sFilename = oFile.name;
        // Create A File Reader HTML5
        var reader = new FileReader();

        // Ready The Event For When A File Gets Selected
        reader.onload = function (e) {
                    var data = e.target.result;
                    data = new Uint8Array(data);
                    var workbook = XLSX.read(data, {type: 'array'});

                    var result = {};
                    workbook.SheetNames.forEach(function (sheetName) {
                        var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {header: 1});
                        var sCSV = XLSX.utils.make_csv(workbook.Sheets[sheetName]);
                        templateObj.selectedFile.set(sCSV);

                        if (roa.length) result[sheetName] = roa;
                    });
                    // see the result, caution: it works after reader event is done.

                };
                reader.readAsArrayBuffer(oFile);

                if($('.file-name').text() != ""){
                  $(".btnImport").removeAttr("disabled");
                }else{
                  $(".btnImport").Attr("disabled");
                }

        }



    },
    'click .btnImport' : function () {
    $('.fullScreenSpin').css('display','inline-block');
    let templateObject = Template.instance();
    let productService = new ProductService();
    let objDetails;

    Papa.parse(templateObject.selectedFile.get(), {

    complete: function(results) {

      if(results.data.length > 0){
    if((results.data[0][0] == "Product Name") && (results.data[0][1] == "Sales Description")
    && (results.data[0][2] == "Sale Price") && (results.data[0][3] == "Sales Account")
    && (results.data[0][4] == "Tax Code") && (results.data[0][5] == "Barcode")
    && (results.data[0][6] == "Purchase Description") && (results.data[0][7] == "COGGS Account")
    && (results.data[0][8] == "Purchase Tax Code") && (results.data[0][9] == "Cost")) {

    let dataLength = results.data.length * 3000;
    setTimeout(function(){
    // $('#importModal').modal('toggle');
    Meteor._reload.reload();
    },parseInt(dataLength));

    for (let i = 0; i < results.data.length -1; i++) {
    objDetails = {
     type: "TProduct",
     fields:
         {
           Active:true,
           ProductType:"INV",

           ProductPrintName:results.data[i+1][0],
           ProductName:results.data[i+1][0],
           SalesDescription:results.data[i+1][1],
           SellQty1Price:parseFloat(results.data[i+1][2].replace(/[^0-9.-]+/g,"")) || 0,
           IncomeAccount:results.data[i+1][3],
           TaxCodeSales:results.data[i+1][4],
           Barcode:results.data[i+1][5],
           PurchaseDescription:results.data[i+1][6],

           // AssetAccount:results.data[i+1][0],
           CogsAccount:results.data[i+1][7],


           TaxCodePurchase:results.data[i+1][8],

           BuyQty1Cost:parseFloat(results.data[i+1][9].replace(/[^0-9.-]+/g,"")) || 0,

           PublishOnVS1: true
         }
    };
    if(results.data[i+1][1]){
    if(results.data[i+1][1] !== "") {
    productService.saveProduct(objDetails).then(function (data) {
    //$('.fullScreenSpin').css('display','none');
    //Meteor._reload.reload();
    }).catch(function (err) {
    //$('.fullScreenSpin').css('display','none');
    swal({
    title: 'Oooops...',
    text: err,
    type: 'error',
    showCancelButton: false,
    confirmButtonText: 'Try Again'
    }).then((result) => {
    if (result.value) {
      Meteor._reload.reload();
    } else if (result.dismiss === 'cancel') {

    }
    });
    });
    }
    }
    }

    }else{
      $('.fullScreenSpin').css('display','none');
      // Bert.alert('<strong> Data Mapping fields invalid. </strong> Please check that you are importing the correct file with the correct column headers.', 'danger');
      swal('Invalid Data Mapping fields ', 'Please check that you are importing the correct file with the correct column headers.', 'error');
    }
    }else{
    $('.fullScreenSpin').css('display','none');
    // Bert.alert('<strong> Data Mapping fields invalid. </strong> Please check that you are importing the correct file with the correct column headers.', 'danger');
    swal('Invalid Data Mapping fields ', 'Please check that you are importing the correct file with the correct column headers.', 'error');
    }

    }
    });
    }


});
Template.stocktransferlist.helpers({
    datatablerecords : () => {
        return Template.instance().datatablerecords.get().sort(function(a, b){
            if (a.creationdate == 'NA') {
                return 1;
            }
            else if (b.creationdate == 'NA') {
                return -1;
            }
            return (a.creationdate.toUpperCase() > b.creationdate.toUpperCase()) ? 1 : -1;
        });
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    salesCloudPreferenceRec: () => {
        return CloudPreference.findOne({userid:Session.get('mycloudLogonID'),PrefName:'tblStockTransferList'});
    },
    currentdate : () => {
        var currentDate = new Date();
        var begunDate = moment(currentDate).format("DD/MM/YYYY");
        return begunDate;
    }
});
