import { PurchaseBoardService } from '../js/purchase-service';
import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../js/core-service';
import { EmployeeProfileService } from "../js/profile-service";
import { AccountService } from "../accounts/account-service";
import { UtilityService } from "../utility-service";
import { SideBarService } from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
let sideBarService = new SideBarService();
let utilityService = new UtilityService();
Template.chequelist.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.displayfields = new ReactiveVar([]);
    templateObject.reset_data = new ReactiveVar([]);
});

Template.chequelist.onRendered(function() {
    $('.fullScreenSpin').css('display', 'inline-block');
    let templateObject = Template.instance();
    let accountService = new AccountService();
    let purchaseService = new PurchaseBoardService();


    // set initial table rest_data
    function init_reset_data() {
        let reset_data = [
            { index: 0, label: 'ID', class:'ID', active: false, display: true, width: "0" },
            { index: 1, label: "Order Date", class: "OrderDate", active: true, display: true, width: "" },
            { index: 2, label: "#ID", class: "ChequeID", active: true, display: true, width: "" },
            { index: 3, label: "Bank Account", class: "BankAccount", active: true, display: true, width: "" },
            { index: 4, label: "Company", class: "Supplier", active: true, display: true, width: "" },
            { index: 5, label: "Reference", class: "Reference", active: true, display: true, width: "" },
            { index: 6, label: "Via", class: "Via", active: true, display: true, width: "" },
            { index: 7, label: "Currency", class: "Currency", active: true, display: true, width: "" },
            { index: 8, label: "AmountEx", class: "Amount (Inc)", active: true, display: true, width: "" },
            { index: 9, label: "Paid", class: "Paid", active: true, display: true, width: "" },
            { index: 10, label: "Outstanding", class: "Outstanding", active: true, display: true, width: "" },
            { index: 11, label: "Status", class: "Status", active: true, display: true, width: "" },
            { index: 12, label: "PurchaseCustField1", class: "Custom Field 1", active: false, display: true, width: "" },
            { index: 13, label: "PurchaseCustField2", class: "Custom Field 2", active: false, display: true, width: "" },
            { index: 13, label: "Employee", class: "Employee", active: false, display: true, width: "" },
            { index: 13, label: "Comments", class: "Comments", active: true, display: true, width: "" },
        ];

        let templateObject = Template.instance();
        templateObject.reset_data.set(reset_data);
    }
    init_reset_data();
    // set initial table rest_data


    // custom field displaysettings
    templateObject.initCustomFieldDisplaySettings = function(data, listType) {
        let templateObject = Template.instance();
        let reset_data = templateObject.reset_data.get();
        templateObject.showCustomFieldDisplaySettings(reset_data);

        try {
        getVS1Data("VS1_Customize").then(function (dataObject) {
            if (dataObject.length == 0) {
            sideBarService.getNewCustomFieldsWithQuery(parseInt(Session.get('mySessionEmployeeLoggedID')), listType).then(function (data) {
                // reset_data = data.ProcessLog.CustomLayout.Columns;
                reset_data = data.ProcessLog.Obj.CustomLayout[0].Columns;
                templateObject.showCustomFieldDisplaySettings(reset_data);
            }).catch(function (err) {
            });
            } else {
            let data = JSON.parse(dataObject[0].data);
            if(data.ProcessLog.Obj.CustomLayout.length > 0){
             for (let i = 0; i < data.ProcessLog.Obj.CustomLayout.length; i++) {
               if(data.ProcessLog.Obj.CustomLayout[i].TableName == listType){
                 reset_data = data.ProcessLog.Obj.CustomLayout[i].Columns;
                 showCustomFieldDisplaySettings(reset_data);
               }
             }
           };
            // handle process here
            }
        });
        } catch (error) {
        }
        return;
    }

    templateObject.showCustomFieldDisplaySettings = function(reset_data){
    //function showCustomFieldDisplaySettings(reset_data) {

        let custFields = [];
        let customData = {};
        let customFieldCount = reset_data.length;

        for (let r = 0; r < customFieldCount; r++) {
        customData = {
            active: reset_data[r].active,
            id: reset_data[r].index,
            custfieldlabel: reset_data[r].label,
            class: reset_data[r].class,
            display: reset_data[r].display,
            width: reset_data[r].width ? reset_data[r].width : ''
        };
        custFields.push(customData);
        }
        templateObject.displayfields.set(custFields);
    }
    templateObject.initCustomFieldDisplaySettings("", "tblchequelist");

    const supplierList = [];
    let billTable;
    const splashArray = [];
    const dataTableList = [];
    const tableHeaderList = [];
    if (FlowRouter.current().queryParams.success) {
        $('.btnRefresh').addClass('btnRefreshAlert');
    }

    const today = moment().format('DD/MM/YYYY');
    const currentDate = new Date();
    const begunDate = moment(currentDate).format("DD/MM/YYYY");
    let fromDateMonth = (currentDate.getMonth() + 1);
    let fromDateDay = currentDate.getDate();
    if ((currentDate.getMonth()+1) < 10) {
        fromDateMonth = "0" + (currentDate.getMonth()+1);
    }

    if (currentDate.getDate() < 10) {
        fromDateDay = "0" + currentDate.getDate();
    }
    const fromDate = fromDateDay + "/" + (fromDateMonth) + "/" + currentDate.getFullYear();

    $("#date-input,#dateTo,#dateFrom").datepicker({
        showOn: 'button',
        buttonText: 'Show Date',
        buttonImageOnly: true,
        buttonImage: '/img/imgCal2.png',
        dateFormat: 'dd/mm/yy',
        showOtherMonths: true,
        selectOtherMonths: true,
        changeMonth: true,
        changeYear: true,
        yearRange: "-90:+10",
        onChangeMonthYear: function(year, month, inst){
        // Set date to picker
        $(this).datepicker('setDate', new Date(year, inst.selectedMonth, inst.selectedDay));
        // Hide (close) the picker
        // $(this).datepicker('hide');
        // // Change ttrigger the on change function
        // $(this).trigger('change');
       }
    });

    $("#dateFrom").val(fromDate);
    $("#dateTo").val(begunDate);

    function MakeNegative() {
        $('td').each(function() {
            if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
        });
        $('td.colStatus').each(function(){
            if($(this).text() == "Deleted") $(this).addClass('text-deleted');
            if ($(this).text() == "Full") $(this).addClass('text-fullyPaid');
            if ($(this).text() == "Part") $(this).addClass('text-partialPaid');
            if ($(this).text() == "Rec") $(this).addClass('text-reconciled');
        });
    }

    templateObject.resetData = function (dataVal) {
      location.reload();
    };

    templateObject.getAllChequeData = function() {
        const currentBeginDate = new Date();
        const begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
        let fromDateMonth = (currentBeginDate.getMonth() + 1);
        let fromDateDay = currentBeginDate.getDate();
        if((currentBeginDate.getMonth()+1) < 10){
            fromDateMonth = "0" + (currentBeginDate.getMonth()+1);
        }else{
            fromDateMonth = (currentBeginDate.getMonth()+1);
        }
        if(currentBeginDate.getDate() < 10){
            fromDateDay = "0" + currentBeginDate.getDate();
        }
        const toDate = currentBeginDate.getFullYear() + "-" + (fromDateMonth) + "-" + (fromDateDay);
        let prevMonth11Date = (moment().subtract(reportsloadMonths, 'months')).format("YYYY-MM-DD");

        getVS1Data('TChequeList').then(function(dataObject) {
            if (dataObject.length == 0) {
                sideBarService.getAllChequeListData(prevMonth11Date,toDate, true,initialReportLoad,0).then(function(data) {
                    setChequeListData(data);
                }).catch(function(err) {
                    // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                    $('.fullScreenSpin').css('display', 'none');
                    // Meteor._reload.reload();
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                setChequeListData(data);
            }
        }).catch(function(err) {
            sideBarService.getAllChequeListData(prevMonth11Date,toDate, true,initialReportLoad,0).then(function(data) {
                setChequeListData(data);
            }).catch(function(err) {
                // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                $('.fullScreenSpin').css('display', 'none');
                // Meteor._reload.reload();
            });
        });
    };

    function setChequeListData(data) {
        addVS1Data('TChequeList',JSON.stringify(data));
        if (data.Params.IgnoreDates == true) {
            $('#dateFrom').attr('readonly', true);
            $('#dateTo').attr('readonly', true);

        } else {
            $('#dateFrom').attr('readonly', false);
            $('#dateTo').attr('readonly', false);
            $("#dateFrom").val(data.Params.DateFrom != '' ? moment(data.Params.DateFrom).format("DD/MM/YYYY") : data.Params.DateFrom);
            $("#dateTo").val(data.Params.DateTo != '' ? moment(data.Params.DateTo).format("DD/MM/YYYY") : data.Params.DateTo);
        }
        for (let i = 0; i < data.tchequelist.length; i++) {
            let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.tchequelist[i].TotalAmount) || 0.00;
            let totalTax = utilityService.modifynegativeCurrencyFormat(data.tchequelist[i].TotalTax) || 0.00;
            let totalAmount = utilityService.modifynegativeCurrencyFormat(data.tchequelist[i].TotalAmountInc) || 0.00;
            let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tchequelist[i].Balance) || 0.00;
            let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tchequelist[i].Payment) || 0.00;

              if(data.tchequelist[i].TotalAmount > 0 && data.tchequelist[i].TotalAmount != 0){
                totalAmountEx = utilityService.modifynegativeCurrencyFormat(-Math.abs(data.tchequelist[i].TotalAmount)) || 0.00;
              }else{
                totalAmountEx = utilityService.modifynegativeCurrencyFormat(Math.abs(data.tchequelist[i].TotalAmount)) || 0.00;
              }

              if(data.tchequelist[i].TotalTax > 0 && data.tchequelist[i].TotalTax != 0){
                totalTax = utilityService.modifynegativeCurrencyFormat(-Math.abs(data.tchequelist[i].TotalTax)) || 0.00;
              }else{
                totalTax = utilityService.modifynegativeCurrencyFormat(Math.abs(data.tchequelist[i].TotalTax)) || 0.00;
              }


              if(data.tchequelist[i].TotalAmountInc > 0 && data.tchequelist[i].TotalAmountInc != 0){
                totalAmount = utilityService.modifynegativeCurrencyFormat(-Math.abs(data.tchequelist[i].TotalAmountInc)) || 0.00;
              }else{
                totalAmount = utilityService.modifynegativeCurrencyFormat(Math.abs(data.tchequelist[i].TotalAmountInc)) || 0.00;
              }


              if(data.tchequelist[i].Balance > 0 && data.tchequelist[i].Balance != 0){
                totalOutstanding = utilityService.modifynegativeCurrencyFormat(-Math.abs(data.tchequelist[i].Balance)) || 0.00;
              }else{
                totalOutstanding = utilityService.modifynegativeCurrencyFormat(Math.abs(data.tchequelist[i].Balance)) || 0.00;
              }


            let orderstatus = data.tchequelist[i].OrderStatus || '';
            if (data.tchequelist[i].Deleted == true){
                orderstatus = "Deleted";
            } else if (data.tchequelist[i].SupplierName == ''){
                orderstatus = "Deleted";
            }
            const dataList = {
                id: data.tchequelist[i].PurchaseOrderID || '',
                employee: data.tchequelist[i].EmployeeName || '',
                accountname: data.tchequelist[i].Account || '',
                sortdate: data.tchequelist[i].OrderDate != '' ? moment(data.tchequelist[i].OrderDate).format("YYYY/MM/DD") : data.tchequelist[i].OrderDate,
                orderdate: data.tchequelist[i].OrderDate != '' ? moment(data.tchequelist[i].OrderDate).format("DD/MM/YYYY") : data.tchequelist[i].OrderDate,
                suppliername: data.tchequelist[i].SupplierName || '',
                chequeNumber: data.tchequelist[i].InvoiceNumber || '',
                reference: data.tchequelist[i].RefNo || '',
                via: data.tchequelist[i].Shipping || '',
                currency: data.tchequelist[i].ForeignExchangeCode || '',
                totalamountex: totalAmountEx || 0.00,
                totaltax: totalTax || 0.00,
                totalamount: totalAmount || 0.00,
                totalpaid: totalPaid || 0.00,
                totaloustanding: totalOutstanding || 0.00,
                orderstatus: orderstatus || '',
                custfield1: '' || '',
                custfield2: '' || '',
                comments: data.tchequelist[i].Comments || '',
            };
            if (orderstatus != "Deleted") {
                dataTableList.push(dataList);
            }

        }
        templateObject.datatablerecords.set(dataTableList);

        if (templateObject.datatablerecords.get()) {

            setTimeout(function() {
                MakeNegative();
            }, 100);
        }

        setTimeout(function() {
            $('.fullScreenSpin').css('display', 'none');
            $('#tblchequelist').DataTable({
              "columnDefs": [{ "targets": 0, "type": "date" }],
              "sDom": "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                buttons: [{
                    extend: 'excelHtml5',
                    text: '',
                    download: 'open',
                    className: "btntabletocsv hiddenColumn",
                    filename: chequeSpelling+" "+"List - " + moment().format(),
                    orientation: 'portrait',
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
                }, {
                    extend: 'print',
                    download: 'open',
                    className: "btntabletopdf hiddenColumn",
                    text: '',
                    title: chequeSpelling,
                    filename: chequeSpelling+" "+"List - " + moment().format(),
                    exportOptions: {
                        columns: ':visible',
                        stripHtml: false
                    }
                }],
                select: true,
                destroy: true,
                colReorder: true,
                pageLength: initialReportDatatableLoad,
                "bLengthChange": false,
                lengthMenu: [ [initialReportDatatableLoad, -1], [initialReportDatatableLoad, "All"] ],
                info: true,
                responsive: true,
                "order": [[ 0, "desc" ],[ 2, "desc" ]],
                action: function() {
                    $('#tblchequelist').DataTable().ajax.reload();
                },
                "fnDrawCallback": function (oSettings) {
                    let checkurlIgnoreDate = FlowRouter.current().queryParams.ignoredate;

                    $('.paginate_button.page-item').removeClass('disabled');
                    $('#tblchequelist_ellipsis').addClass('disabled');

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
                            const dateFrom = new Date($("#dateFrom").datepicker("getDate"));
                            const dateTo = new Date($("#dateTo").datepicker("getDate"));

                            let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
                            let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();
                            if(data.Params.IgnoreDates == true){
                                sideBarService.getAllChequeListData(formatDateFrom, formatDateTo, true, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
                                    getVS1Data('TChequeList').then(function (dataObjectold) {
                                        if(dataObjectold.length == 0){

                                        }else{
                                            let dataOld = JSON.parse(dataObjectold[0].data);

                                            const thirdaryData = $.merge($.merge([], dataObjectnew.tchequelist), dataOld.tchequelist);
                                            let objCombineData = {
                                                Params: dataOld.Params,
                                                tchequelist:thirdaryData
                                            };


                                            addVS1Data('TChequeList',JSON.stringify(objCombineData)).then(function (datareturn) {

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
                            }else{
                                sideBarService.getAllChequeListData(formatDateFrom, formatDateTo, false, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
                                    getVS1Data('TChequeList').then(function (dataObjectold) {
                                        if(dataObjectold.length == 0){

                                        }else{
                                            let dataOld = JSON.parse(dataObjectold[0].data);

                                            var thirdaryData = $.merge($.merge([], dataObjectnew.tchequelist), dataOld.tchequelist);
                                            let objCombineData = {
                                                Params: dataOld.Params,
                                                tchequelist:thirdaryData
                                            }


                                            addVS1Data('TChequeList',JSON.stringify(objCombineData)).then(function (datareturn) {

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
                            }
                        });


                    setTimeout(function () {
                        MakeNegative();
                    }, 100);
                },
                language: { search: "",searchPlaceholder: "Search List..." },
                "fnInitComplete": function () {
                    this.fnPageChange('last');
                    $("<button class='btn btn-primary btnRefreshCheque' type='button' id='btnRefreshCheque' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblchequelist_filter");
                    $('.myvarFilterForm').appendTo(".colDateFilter");
                },
                "fnInfoCallback": function (oSettings, iStart, iEnd, iMax, iTotal, sPre) {
                    let countTableData = data.Params.Count || 0; //get count from API data

                    return 'Showing '+ iStart + " to " + iEnd + " of " + countTableData;
                }

            }).on('page', function() {
                setTimeout(function() {
                    MakeNegative();
                }, 100);
                let draftRecord = templateObject.datatablerecords.get();
                templateObject.datatablerecords.set(draftRecord);
            }).on('column-reorder', function() {

            });
            $('.fullScreenSpin').css('display', 'none');

        }, 0);

        const columns = $('#tblchequelist th');
        let sTible = "";
        let sWidth = "";
        let sIndex = "";
        let sVisible = "";
        let columVisible = false;
        let sClass = "";
        $.each(columns, function(i, v) {
            if (v.hidden == false) {
                columVisible = true;
            }
            if ((v.className.includes("hiddenColumn"))) {
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
        $('#tblchequelist tbody').on('click', 'tr', function() {
            var listData = $(this).closest('tr').attr('id');
            var checkDeleted = $(this).closest('tr').find('.colStatus').text() || '';
            if (listData) {
                if(checkDeleted == "Deleted"){
                    swal('You Cannot View This Transaction', 'Because It Has Been Deleted', 'info');
                }else{
                    FlowRouter.go('/chequecard?id=' + listData);

                }
            }
        });
    }

    templateObject.getAllChequeData();

    templateObject.getAllFilterChequeData = function (fromDate,toDate, ignoreDate) {
      sideBarService.getAllChequeListData(fromDate,toDate, ignoreDate,initialReportLoad,0).then(function(data) {

        addVS1Data('TChequeList',JSON.stringify(data)).then(function (datareturn) {
            location.reload();
        }).catch(function (err) {
          location.reload();
        });

            }).catch(function (err) {
                // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                templateObject.datatablerecords.set('');
                $('.fullScreenSpin').css('display','none');
                // Meteor._reload.reload();
            });
    };

    let urlParametersDateFrom = FlowRouter.current().queryParams.fromDate;
    let urlParametersDateTo = FlowRouter.current().queryParams.toDate;
    let urlParametersIgnoreDate = FlowRouter.current().queryParams.ignoredate;
    if(urlParametersDateFrom){
      if(urlParametersIgnoreDate == true){
        $('#dateFrom').attr('readonly', true);
        $('#dateTo').attr('readonly', true);
      }else{

        $("#dateFrom").val(urlParametersDateFrom !=''? moment(urlParametersDateFrom).format("DD/MM/YYYY"): urlParametersDateFrom);
        $("#dateTo").val(urlParametersDateTo !=''? moment(urlParametersDateTo).format("DD/MM/YYYY"): urlParametersDateTo);
      }
    }
    tableResize();
});

Template.chequelist.events({

    'click #btnNewCheque': function(event) {
        FlowRouter.go('/chequecard');
    },
    'click .btnRefreshCheque': function (event) {
        let templateObject = Template.instance();
        let utilityService = new UtilityService();
        let tableProductList;
        const dataTableList = [];
        var splashArrayInvoiceList = new Array();
        const lineExtaSellItems = [];
        $('.fullScreenSpin').css('display', 'inline-block');
        let dataSearchName = $('#tblchequelist_filter input').val();
        if (dataSearchName.replace(/\s/g, '') != '') {
            sideBarService.getNewChequeByNameOrID(dataSearchName).then(function (data) {
              $(".btnRefreshCheque").removeClass('btnSearchAlert');
                let lineItems = [];
                let lineItemObj = {};
                if (data.tchequeex.length > 0) {
                   for (let i = 0; i < data.tchequeex.length; i++) {
                        let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.tchequeex[i].fields.TotalAmount) || 0.00;
                        let totalTax = utilityService.modifynegativeCurrencyFormat(data.tchequeex[i].fields.TotalTax) || 0.00;
                        let totalAmount = utilityService.modifynegativeCurrencyFormat(data.tchequeex[i].fields.TotalAmountInc) || 0.00;
                        let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tchequeex[i].fields.TotalPaid) || 0.00;
                        let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tchequeex[i].fields.TotalBalance) || 0.00;
                        let orderstatus = data.tchequeex[i].fields.OrderStatus || '';
                        if(data.tchequeex[i].fields.Deleted == true){
                          orderstatus = "Deleted";
                        }else if(data.tchequeex[i].fields.CustomerName == ''){
                          orderstatus = "Deleted";
                        };
                        var dataList = {
                            id: data.tchequeex[i].fields.ID || '',
                            employee: data.tchequeex[i].fields.EmployeeName || '',
                            accountname: data.tchequeex[i].fields.GLAccountName || '',
                            sortdate: data.tchequeex[i].fields.OrderDate != '' ? moment(data.tchequeex[i].fields.OrderDate).format("YYYY/MM/DD") : data.tchequeex[i].fields.OrderDate,
                            orderdate: data.tchequeex[i].fields.OrderDate != '' ? moment(data.tchequeex[i].fields.OrderDate).format("DD/MM/YYYY") : data.tchequeex[i].fields.OrderDate,
                            suppliername: data.tchequeex[i].fields.SupplierName || '',
                            chequeNumber: data.tchequeex[i].fields.SupplierInvoiceNumber || '',
                            reference: data.tchequelist[i].fields.RefNo || '',
                            via: data.tchequelist[i].fields.Shipping || '',
                            currency: data.tchequelist[i].fields.ForeignExchangeCode || '',
                            totalamountex: totalAmountEx || 0.00,
                            totaltax: totalTax || 0.00,
                            totalamount: totalAmount || 0.00,
                            totalpaid: totalPaid || 0.00,
                            totaloustanding: totalOutstanding || 0.00,
                            orderstatus: orderstatus || '',
                            custfield1: '' || '',
                            custfield2: '' || '',
                            comments: data.tchequeex[i].fields.Comments || '',
                        };
                        if(data.tchequeex[i].fields.Deleted == false){
                        splashArrayInvoiceList.push(dataList);
                        }

                    }
                    templateObject.datatablerecords.set(splashArrayInvoiceList);

                    let item = templateObject.datatablerecords.get();
                    $('.fullScreenSpin').css('display', 'none');
                    if (splashArrayInvoiceList) {
                        var datatable = $('#tblchequelist').DataTable();
                        $("#tblchequelist > tbody").empty();
                        for (let x = 0; x < item.length; x++) {
                            $("#tblchequelist > tbody").append(
                                ' <tr class="dnd-moved" id="' + item[x].id + '" style="cursor: pointer;">' +
                                '<td contenteditable="false" class="colSortDate hiddenColumn">' + item[x].sortdate + '</td>' +
                                '<td contenteditable="false" class="colOrderDate" ><span style="display:none;">' + item[x].orderdate + '</span>' + item[x].orderdate + '</td>' +
                                '<td contenteditable="false" class="colChequeID">' + item[x].id + '</td>' +
                                '<td contenteditable="false" class="colBankAccount" >' + item[x].accountname + '</td>' +
                                '<td contenteditable="false" class="colPurchaseNo">' + item[x].chequeNumber + '</td>' +
                                '<td contenteditable="false" class="colSupplier">' + item[x].suppliername + '</td>' +
                                '<td contenteditable="false" class="colReference">' + item[x].reference + '</td>' +
                                '<td contenteditable="false" class="colVia">' + item[x].via + '</td>' +
                                '<td contenteditable="false" class="colCurrency">' + item[x].currency + '</td>' +
                                '<td contenteditable="false" class="colAmountEx" style="text-align: right!important;">' + item[x].totalamountex + '</td>' +
                                '<td contenteditable="false" class="colTax" style="text-align: right!important;">' + item[x].totaltax + '</td>' +
                                '<td contenteditable="false" class="colAmount" style="text-align: right!important;">' + item[x].totalamount + '</td>' +
                                '<td contenteditable="false" class="colPaid" style="text-align: right!important;">' + item[x].totalpaid + '</td>' +
                                '<td contenteditable="false" class="colBalanceOutstanding" style="text-align: right!important;"">' + item[x].totaloustanding + '</td>' +
                                '<td contenteditable="false" class="colStatus">' + item[x].orderstatus + '</td>' +
                                '<td contenteditable="false" class="colPurchaseCustField1 hiddenColumn">' + item[x].custfield1 + '</td>' +
                                '<td contenteditable="false" class="colPurchaseCustField2 hiddenColumn">' + item[x].custfield2 + '</td>' +
                                '<td contenteditable="false" class="colComments">' + item[x].comments + '</td>' +
                                '</tr>');

                        }
                        $('.dataTables_info').html('Showing 1 to ' + data.tchequeex.length + ' of ' + data.tchequeex.length + ' entries');
                        setTimeout(function() {
                            makeNegativeGlobal();
                        }, 100);
                    }

                } else {
                    $('.fullScreenSpin').css('display', 'none');

                    swal({
                        title: 'Question',
                        text: "Cheque does not exist, would you like to create it?",
                        type: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Yes',
                        cancelButtonText: 'No'
                    }).then((result) => {
                        if (result.value) {
                            FlowRouter.go('/chequecard');
                        } else if (result.dismiss === 'cancel') {
                            //$('#productListModal').modal('toggle');
                        }
                    });
                }
            }).catch(function (err) {
                $('.fullScreenSpin').css('display', 'none');
            });
        } else {

            $(".btnRefresh").trigger("click");
        }
    },
    'click .chkDatatable': function(event) {
        const columns = $('#tblchequelist th');
        let columnDataValue = $(event.target).closest("div").find(".divcolumn").text();
        $.each(columns, function(i, v) {
            let className = v.classList;
            let replaceClass = className[1];
            if (v.innerText == columnDataValue) {
                if ($(event.target).is(':checked')) {
                    $("." + replaceClass + "").css('display', 'table-cell');
                    $("." + replaceClass + "").css('padding', '.75rem');
                    // $("." + replaceClass + "").css('vertical-align', 'top');
                } else {
                    $("." + replaceClass + "").css('display', 'none');
                }
            }
        });
    },
    'keyup #tblchequelist_filter input': function (event) {
          if($(event.target).val() != ''){
            $(".btnRefreshCheque").addClass('btnSearchAlert');
          }else{
            $(".btnRefreshCheque").removeClass('btnSearchAlert');
          }
          if (event.keyCode == 13) {
             $(".btnRefreshCheque").trigger("click");
          }
        },
    'click .resetTable': function(event) {
        const getcurrentCloudDetails = CloudUser.findOne({
            _id: Session.get('mycloudLogonID'),
            clouddatabaseID: Session.get('mycloudLogonDBID')
        });
        if (getcurrentCloudDetails) {
            if (getcurrentCloudDetails._id.length > 0) {
                var clientID = getcurrentCloudDetails._id;
                var clientUsername = getcurrentCloudDetails.cloudUsername;
                var clientEmail = getcurrentCloudDetails.cloudEmail;
                var checkPrefDetails = CloudPreference.findOne({ userid: clientID, PrefName: 'tblchequelist' });
                if (checkPrefDetails) {
                    CloudPreference.remove({ _id: checkPrefDetails._id }, function(err, idTag) {
                        if (err) {

                        } else {
                            Meteor._reload.reload();
                        }
                    });

                }
            }
        }
    },
    'click .saveTable': function(event) {
        let lineItems = [];
        $('.columnSettings').each(function(index) {
            const $tblrow = $(this);
            const colTitle = $tblrow.find(".divcolumn").text() || '';
            const colWidth = $tblrow.find(".custom-range").val() || 0;
            const colthClass = $tblrow.find(".divcolumn").attr("valueupdate") || '';
            let colHidden = false;
            colHidden = !$tblrow.find(".custom-control-input").is(':checked');
            let lineItemObj = {
                index: index,
                label: colTitle,
                hidden: colHidden,
                width: colWidth,
                thclass: colthClass
            };
            lineItems.push(lineItemObj);
        });
        const getcurrentCloudDetails = CloudUser.findOne({
            _id: Session.get('mycloudLogonID'),
            clouddatabaseID: Session.get('mycloudLogonDBID')
        });
        if (getcurrentCloudDetails) {
            if (getcurrentCloudDetails._id.length > 0) {
                const clientID = getcurrentCloudDetails._id;
                const clientUsername = getcurrentCloudDetails.cloudUsername;
                const clientEmail = getcurrentCloudDetails.cloudEmail;
                const checkPrefDetails = CloudPreference.findOne({userid: clientID, PrefName: 'tblchequelist'});
                if (checkPrefDetails) {
                    CloudPreference.update({ _id: checkPrefDetails._id }, {
                        $set: {
                            userid: clientID,
                            username: clientUsername,
                            useremail: clientEmail,
                            PrefGroup: 'salesform',
                            PrefName: 'tblchequelist',
                            published: true,
                            customFields: lineItems,
                            updatedAt: new Date()
                        }
                    }, function(err, idTag) {
                        if (err) {
                            $('#myModal2').modal('toggle');
                        } else {
                            $('#myModal2').modal('toggle');
                        }
                    });

                } else {
                    CloudPreference.insert({
                        userid: clientID,
                        username: clientUsername,
                        useremail: clientEmail,
                        PrefGroup: 'salesform',
                        PrefName: 'tblchequelist',
                        published: true,
                        customFields: lineItems,
                        createdAt: new Date()
                    }, function(err, idTag) {
                        if (err) {
                            $('#myModal2').modal('toggle');
                        } else {
                            $('#myModal2').modal('toggle');

                        }
                    });

                }
            }
        }
        $('#myModal2').modal('toggle');
    },
    'blur .divcolumn': function(event) {
        let columData = $(event.target).text();
        let columnDatanIndex = $(event.target).closest("div.columnSettings").attr('id');
        var datable = $('#tblchequelist').DataTable();
        var title = datable.column(columnDatanIndex).header();
        $(title).html(columData);

    },
    'change .rngRange': function(event) {
        let range = $(event.target).val();
        let columnDataValue = $(event.target).closest("div").prev().find(".divcolumn").text();
        const datable = $('#tblchequelist th');
        $.each(datable, function(i, v) {
            if (v.innerText == columnDataValue) {
                let className = v.className;
                let replaceClass = className.replace(/ /g, ".");
                $("." + replaceClass + "").css('width', range + 'px');

            }
        });
    },
    'click .btnOpenSettings': function(event) {
        let templateObject = Template.instance();
        const columns = $('#tblchequelist th');
        const tableHeaderList = [];
        let sTible = "";
        let sWidth = "";
        let sIndex = "";
        let sVisible = "";
        let columVisible = false;
        let sClass = "";
        $.each(columns, function(i, v) {
            if (v.hidden == false) {
                columVisible = true;
            }
            if ((v.className.includes("hiddenColumn"))) {
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
    'click #exportbtn': function() {
        $('.fullScreenSpin').css('display', 'inline-block');
        jQuery('#tblchequelist_wrapper .dt-buttons .btntabletocsv').click();
        $('.fullScreenSpin').css('display', 'none');

    },
    'click .btnRefresh': function() {
        $('.fullScreenSpin').css('display', 'inline-block');
        const currentBeginDate = new Date();
        const begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
        let fromDateMonth = (currentBeginDate.getMonth() + 1);
        let fromDateDay = currentBeginDate.getDate();
        if((currentBeginDate.getMonth()+1) < 10){
            fromDateMonth = "0" + (currentBeginDate.getMonth()+1);
        } else {
            fromDateMonth = (currentBeginDate.getMonth()+1);
        }
        if(currentBeginDate.getDate() < 10){
            fromDateDay = "0" + currentBeginDate.getDate();
        }
        const toDate = currentBeginDate.getFullYear() + "-" + (fromDateMonth) + "-" + (fromDateDay);
        let prevMonth11Date = (moment().subtract(reportsloadMonths, 'months')).format("YYYY-MM-DD");

        sideBarService.getAllPurchasesList(prevMonth11Date,toDate, true,initialReportLoad,0).then(function(data) {
            addVS1Data('TPurchasesList',JSON.stringify(data)).then(function (datareturn) {

            }).catch(function (err) {

            });
        }).catch(function(err) {

        });
        sideBarService.getAllChequeListData(prevMonth11Date,toDate, true,initialReportLoad,0).then(function(dataCheque) {
            addVS1Data('TChequeList', JSON.stringify(dataCheque)).then(function(datareturn) {
              sideBarService.getAllChequeList(initialDataLoad,0).then(function(data) {
                  addVS1Data('TCheque', JSON.stringify(data)).then(function(datareturn) {
                      window.open('/chequelist', '_self');
                  }).catch(function(err) {
                     window.open('/chequelist', '_self');
                  });
              }).catch(function(err) {
                  window.open('/chequelist', '_self');
              });
            }).catch(function(err) {
              sideBarService.getAllChequeList(initialDataLoad,0).then(function(data) {
                  addVS1Data('TCheque', JSON.stringify(data)).then(function(datareturn) {
                      window.open('/chequelist', '_self');
                  }).catch(function(err) {
                     window.open('/chequelist', '_self');
                  });
              }).catch(function(err) {
                  window.open('/chequelist', '_self');
              });
            });
        }).catch(function(err) {
            window.open('/chequelist', '_self');
        });
    },
    'change #dateTo': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        setTimeout(function(){
            const dateFrom = new Date($("#dateFrom").datepicker("getDate"));
            const dateTo = new Date($("#dateTo").datepicker("getDate"));

            let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
            let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();
            //  templateObject.getAgedPayableReports(formatDateFrom,formatDateTo,false);
            const formatDate = dateTo.getDate() + "/" + (dateTo.getMonth() + 1) + "/" + dateTo.getFullYear();
            //templateObject.dateAsAt.set(formatDate);
            if (($("#dateFrom").val().replace(/\s/g, '') == "") && ($("#dateFrom").val().replace(/\s/g, '') == "")) {

            } else {
              templateObject.getAllFilterChequeData(formatDateFrom,formatDateTo, false);
            }
        },500);
    },
    'change #dateFrom': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        setTimeout(function(){
            const dateFrom = new Date($("#dateFrom").datepicker("getDate"));
            const dateTo = new Date($("#dateTo").datepicker("getDate"));
            let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
            let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();
            //  templateObject.getAgedPayableReports(formatDateFrom,formatDateTo,false);
            const formatDate = dateTo.getDate() + "/" + (dateTo.getMonth() + 1) + "/" + dateTo.getFullYear();
            //templateObject.dateAsAt.set(formatDate);
            if (($("#dateFrom").val().replace(/\s/g, '') == "") && ($("#dateFrom").val().replace(/\s/g, '') == "")) {

            } else {
                templateObject.getAllFilterChequeData(formatDateFrom,formatDateTo, false);
            }
        },500);
    },
    'click #today': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        const currentBeginDate = new Date();
        const begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
        let fromDateMonth = (currentBeginDate.getMonth() + 1);
        let fromDateDay = currentBeginDate.getDate();
        if((currentBeginDate.getMonth()+1) < 10){
            fromDateMonth = "0" + (currentBeginDate.getMonth()+1);
        } else {
          fromDateMonth = (currentBeginDate.getMonth()+1);
        }
        if(currentBeginDate.getDate() < 10){
            fromDateDay = "0" + currentBeginDate.getDate();
        }
        const toDateERPFrom = currentBeginDate.getFullYear() + "-" + (fromDateMonth) + "-" + (fromDateDay);
        const toDateERPTo = currentBeginDate.getFullYear() + "-" + (fromDateMonth) + "-" + (fromDateDay);
        const toDateDisplayFrom = (fromDateDay) + "/" + (fromDateMonth) + "/" + currentBeginDate.getFullYear();
        const toDateDisplayTo = (fromDateDay) + "/" + (fromDateMonth) + "/" + currentBeginDate.getFullYear();
        $("#dateFrom").val(toDateDisplayFrom);
        $("#dateTo").val(toDateDisplayTo);
        templateObject.getAllFilterChequeData(toDateERPFrom,toDateERPTo, false);
    },
    'click #lastweek': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        const currentBeginDate = new Date();
        const begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
        let fromDateMonth = (currentBeginDate.getMonth() + 1);
        let fromDateDay = currentBeginDate.getDate();
        if((currentBeginDate.getMonth()+1) < 10){
            fromDateMonth = "0" + (currentBeginDate.getMonth()+1);
        } else {
          fromDateMonth = (currentBeginDate.getMonth()+1);
        }
        if(currentBeginDate.getDate() < 10){
            fromDateDay = "0" + currentBeginDate.getDate();
        }
        const toDateERPFrom = currentBeginDate.getFullYear() + "-" + (fromDateMonth) + "-" + (fromDateDay - 7);
        const toDateERPTo = currentBeginDate.getFullYear() + "-" + (fromDateMonth) + "-" + (fromDateDay);
        const toDateDisplayFrom = (fromDateDay - 7) + "/" + (fromDateMonth) + "/" + currentBeginDate.getFullYear();
        const toDateDisplayTo = (fromDateDay) + "/" + (fromDateMonth) + "/" + currentBeginDate.getFullYear();
        $("#dateFrom").val(toDateDisplayFrom);
        $("#dateTo").val(toDateDisplayTo);
        templateObject.getAllFilterChequeData(toDateERPFrom,toDateERPTo, false);
    },
    'click #lastMonth': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        const currentDate = new Date();
        const prevMonthLastDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        const prevMonthFirstDate = new Date(currentDate.getFullYear() - (currentDate.getMonth() > 0 ? 0 : 1), (currentDate.getMonth() - 1 + 12) % 12, 1);
        const formatDateComponent = function (dateComponent) {
            return (dateComponent < 10 ? '0' : '') + dateComponent;
        };
        const formatDate = function (date) {
            return formatDateComponent(date.getDate()) + '/' + formatDateComponent(date.getMonth() + 1) + '/' + date.getFullYear();
        };
        const formatDateERP = function (date) {
            return date.getFullYear() + '-' + formatDateComponent(date.getMonth() + 1) + '-' + formatDateComponent(date.getDate());
        };
        const fromDate = formatDate(prevMonthFirstDate);
        const toDate = formatDate(prevMonthLastDate);
        $("#dateFrom").val(fromDate);
        $("#dateTo").val(toDate);
        const getLoadDate = formatDateERP(prevMonthLastDate);
        let getDateFrom = formatDateERP(prevMonthFirstDate);
        templateObject.getAllFilterChequeData(getDateFrom,getLoadDate, false);
    },
    'click #lastQuarter': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        const currentDate = new Date();
        const begunDate = moment(currentDate).format("DD/MM/YYYY");
        function getQuarter(d) {
            d = d || new Date();
            const m = Math.floor(d.getMonth() / 3) + 2;
            return m > 4 ? m - 4 : m;
        }
        const quarterAdjustment = (moment().month() % 3) + 1;
        const lastQuarterEndDate = moment().subtract({
            months: quarterAdjustment
        }).endOf('month');
        const lastQuarterStartDate = lastQuarterEndDate.clone().subtract({
            months: 2
        }).startOf('month');
        const lastQuarterStartDateFormat = moment(lastQuarterStartDate).format("DD/MM/YYYY");
        const lastQuarterEndDateFormat = moment(lastQuarterEndDate).format("DD/MM/YYYY");
        $("#dateFrom").val(lastQuarterStartDateFormat);
        $("#dateTo").val(lastQuarterEndDateFormat);
        let fromDateMonth = getQuarter(currentDate);
        const quarterMonth = getQuarter(currentDate);
        let fromDateDay = currentDate.getDate();
        const getLoadDate = moment(lastQuarterEndDate).format("YYYY-MM-DD");
        let getDateFrom = moment(lastQuarterStartDateFormat).format("YYYY-MM-DD");
        templateObject.getAllFilterChequeData(getDateFrom,getLoadDate, false);
    },
    'click #last12Months': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        const currentDate = new Date();
        const begunDate = moment(currentDate).format("DD/MM/YYYY");
        let fromDateMonth = Math.floor(currentDate.getMonth() + 1);
        let fromDateDay = currentDate.getDate();
        if ((currentDate.getMonth()+1) < 10) {
            fromDateMonth = "0" + (currentDate.getMonth()+1);
        }
        if (currentDate.getDate() < 10) {
            fromDateDay = "0" + currentDate.getDate();
        }

        const fromDate = fromDateDay + "/" + (fromDateMonth) + "/" + Math.floor(currentDate.getFullYear() - 1);
        $("#dateFrom").val(fromDate);
        $("#dateTo").val(begunDate);

        const currentDate2 = new Date();
        let fromDateMonth2;
        if ((currentDate2.getMonth()+1) < 10) {
            fromDateMonth2 = "0" + Math.floor(currentDate2.getMonth() + 1);
        }
        let fromDateDay2;
        if (currentDate2.getDate() < 10) {
            fromDateDay2 = "0" + currentDate2.getDate();
        }
        const getLoadDate = moment(currentDate2).format("YYYY-MM-DD");
        let getDateFrom = Math.floor(currentDate2.getFullYear() - 1) + "-" + fromDateMonth2 + "-" + currentDate2.getDate();
        templateObject.getAllFilterChequeData(getDateFrom,getLoadDate, false);
    },
    'click #ignoreDate': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', true);
        $('#dateTo').attr('readonly', true);
        templateObject.getAllFilterChequeData('', '', true);
    },
    'click .printConfirm': function(event) {
        playPrintAudio();
        setTimeout(function(){
        let values = [];
        let basedOnTypeStorages = Object.keys(localStorage);
        basedOnTypeStorages = basedOnTypeStorages.filter((storage) => {
            let employeeId = storage.split('_')[2];
            return storage.includes('BasedOnType_') && employeeId == Session.get('mySessionEmployeeLoggedID')
        });
        let i = basedOnTypeStorages.length;
        if (i > 0) {
            while (i--) {
                values.push(localStorage.getItem(basedOnTypeStorages[i]));
            }
        }
        values.forEach(value => {
            let reportData = JSON.parse(value);
            reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
            if (reportData.BasedOnType.includes("P")) {
                if (reportData.FormID == 1) {
                    let formIds = reportData.FormIDs.split(',');
                    if (formIds.includes("18")) {
                        reportData.FormID = 18;
                        Meteor.call('sendNormalEmail', reportData);
                    }
                } else {
                    if (reportData.FormID == 18)
                        Meteor.call('sendNormalEmail', reportData);
                }
            }
        });

        $('.fullScreenSpin').css('display', 'inline-block');
        jQuery('#tblchequelist_wrapper .dt-buttons .btntabletopdf').click();
        $('.fullScreenSpin').css('display', 'none');
    }, delayTimeAfterSound);
    }

});

Template.chequelist.helpers({
    datatablerecords: () => {
        return Template.instance().datatablerecords.get().sort(function(a, b) {
            if (a.orderdate == 'NA') {
                return 1;
            } else if (b.orderdate == 'NA') {
                return -1;
            }
            return (a.orderdate.toUpperCase() > b.orderdate.toUpperCase()) ? 1 : -1;
        });
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    purchasesCloudPreferenceRec: () => {
        return CloudPreference.findOne({ userid: Session.get('mycloudLogonID'), PrefName: 'tblchequelist' });
    },
    formname: () => {
        return chequeSpelling;
    },
    displayfields: () => {
        return Template.instance().displayfields.get();
    }

});
Template.registerHelper('equals', function(a, b) {
    return a === b;
});
