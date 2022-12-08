import {PurchaseBoardService} from '../js/purchase-service';
import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../js/core-service';
import {EmployeeProfileService} from "../js/profile-service";
import {AccountService} from "../accounts/account-service";
import {UtilityService} from "../utility-service";
import { SideBarService } from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
import {OrganisationService} from '../js/organisation-service';
import CachedHttp from '../lib/global/CachedHttp';
import erpObject from '../lib/global/erp-objects';
import LoadingOverlay from '../LoadingOverlay';
import GlobalFunctions from '../GlobalFunctions';
import TableHandler from '../js/Table/TableHandler';

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
Template.billlist.onCreated(function(){
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.custfields = new ReactiveVar([]);
    templateObject.displayfields = new ReactiveVar([]);
    templateObject.reset_data = new ReactiveVar([]);

    templateObject.billResponse = new ReactiveVar();
    templateObject.bills = new ReactiveVar([]);
});

Template.billlist.onRendered(function() {
    // $('.fullScreenSpin').css('display','inline-block');
    let templateObject = Template.instance();

    // set initial table rest_data
    function init_reset_data() {
      let reset_data = [
        { index: 0, label: 'Sort Date', class:'SortDate', active: false, display: false, width: "0" },
        { index: 1, label: "Order Date", class: "OrderDate", active: true, display: true, width: "" },
        { index: 2, label: "Bill No.", class: "PurchaseNo", active: true, display: true, width: "" },
        { index: 3, label: "Supplier", class: "Supplier", active: true, display: true, width: "" },
        { index: 4, label: "Amount (Ex)", class: "AmountEx", active: true, display: true, width: "" },
        { index: 5, label: "Tax", class: "Tax", active: true, display: true, width: "" },
        { index: 6, label: "Amount", class: "Amount", active: true, display: true, width: "" },
        { index: 7, label: "Paid", class: "Paid", active: true, display: true, width: "" },
        { index: 8, label: "Outstanding", class: "BalanceOutstanding", active: false, display: true, width: "" },
        { index: 9, label: "Status", class: "Status", active: true, display: true, width: "" },
        { index: 10, label: "Employee", class: "Employee", active: true, display: true, width: "" },
        { index: 11, label: "Comments", class: "Comments", active: false, display: true, width: "" },
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
      showCustomFieldDisplaySettings(reset_data);

      try {
        getVS1Data("VS1_Customize").then(function (dataObject) {
          if (dataObject.length == 0) {
            sideBarService.getNewCustomFieldsWithQuery(parseInt(Session.get('mySessionEmployeeLoggedID')), listType).then(function (data) {
                // reset_data = data.ProcessLog.CustomLayout.Columns;
                reset_data = data.ProcessLog.Obj.CustomLayout[0].Columns;
                showCustomFieldDisplaySettings(reset_data);
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

    function showCustomFieldDisplaySettings(reset_data) {
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
     templateObject.initCustomFieldDisplaySettings("", "tblbilllist");
    // custom field displaysettings


    let accountService = new AccountService();
    let purchaseService = new PurchaseBoardService();
    const supplierList = [];
    let billTable;
    var splashArray = new Array();
    const dataTableList = [];
    const tableHeaderList = [];

    var today = moment().format('DD/MM/YYYY');
    var currentDate = new Date();
    var begunDate = moment(currentDate).format("DD/MM/YYYY");
    let fromDateMonth = (currentDate.getMonth() + 1);
    let fromDateDay = currentDate.getDate();
    if ((currentDate.getMonth() + 1) < 10) {
        fromDateMonth = "0" + (currentDate.getMonth() + 1);
    }

    if (currentDate.getDate() < 10) {
        fromDateDay = "0" + currentDate.getDate();
    }
    var fromDate = fromDateDay + "/" + (fromDateMonth) + "/" + currentDate.getFullYear();

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

    if(FlowRouter.current().queryParams.success){
        $('.btnRefresh').addClass('btnRefreshAlert');
    }


    function MakeNegative() {

        $('td').each(function(){
            if($(this).text().indexOf('-'+Currency) >= 0) $(this).addClass('text-danger')
        });

        $('td.colStatus').each(function(){
            if($(this).text() == "Deleted") $(this).addClass('text-deleted');
            if ($(this).text() == "Full") $(this).addClass('text-fullyPaid');
            if ($(this).text() == "Part") $(this).addClass('text-partialPaid');
            if ($(this).text() == "Rec") $(this).addClass('text-reconciled');
        });
    };

    templateObject.resetData = function (dataVal) {
      location.reload();
    }

    templateObject.loadBills = async (refresh = false) => {

      var currentBeginDate = new Date();
      var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
      let fromDateMonth = (currentBeginDate.getMonth() + 1);
      let fromDateDay = currentBeginDate.getDate();
      if ((currentBeginDate.getMonth() + 1) < 10) {
          fromDateMonth = "0" + (currentBeginDate.getMonth() + 1);
      } else {
          fromDateMonth = (currentBeginDate.getMonth() + 1);
      }

      if (currentBeginDate.getDate() < 10) {
          fromDateDay = "0" + currentBeginDate.getDate();
      }
      var toDate = currentBeginDate.getFullYear() + "-" + (fromDateMonth) + "-" + (fromDateDay);
      let prevMonth11Date = (moment().subtract(reportsloadMonths, 'months')).format("YYYY-MM-DD");


      let data = await CachedHttp.get(erpObject.TBillList, async () => {
        return await sideBarService.getAllBillListData(prevMonth11Date,toDate, true,initialReportLoad,0);
      }, {
        useIndexDb: true,
        forceOverride: refresh,
        validate: (cachedResponse) => {
          return true;
        }
      });

      data = data.response;
      await templateObject.billResponse.set(data);
      let bills = data.tbilllist.map(bill => {
        return {
          ...bill,
          OrderStatus: bill.Deleted == true || bill.SupplierName == "" ? "Deleted" : bill.OrderStatus,
        }
      });

      await templateObject.bills.set(bills);
    }

    templateObject.setupTable = () => {
      const response  = templateObject.billResponse.get();
      setTimeout(function () {
        $("#tblbilllist")
          .DataTable({
            ...TableHandler.getDefaultTableConfiguration("tblbilllist"),

            // "sDom": "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
            buttons: [
              {
                extend: "excelHtml5",
                text: "",
                download: "open",
                className: "btntabletocsv hiddenColumn",
                filename: "Bill List - " + moment().format(),
                orientation: "portrait",
                exportOptions: {
                  columns: ":visible",
                  format: {
                    body: function (data, row, column) {
                      if (data.includes("</span>")) {
                        var res = data.split("</span>");
                        data = res[1];
                      }

                      return column === 1 ? data.replace(/<.*?>/gi, "") : data;
                    },
                  },
                },
              },
              {
                extend: "print",
                download: "open",
                className: "btntabletopdf hiddenColumn",
                text: "",
                title: "Sales Overview",
                filename: "Bill List - " + moment().format(),
                exportOptions: {
                  columns: ":visible",
                  stripHtml: false,
                },
              },
            ],
            select: true,
            destroy: true,
            colReorder: true,
            pageLength: initialDatatableLoad,
            bLengthChange: false,
            lengthMenu: [
              [initialDatatableLoad, -1],
              [initialDatatableLoad, "All"],
            ],
            info: true,
            responsive: true,
            order: [
              [0, "desc"],
              [2, "desc"],
            ],
            action: function () {
              $("#tblbilllist").DataTable().ajax.reload();
            },
            fnDrawCallback: function (oSettings) {
              let checkurlIgnoreDate =
                FlowRouter.current().queryParams.ignoredate;

              $(".paginate_button.page-item").removeClass("disabled");
              $("#tblbilllist_ellipsis").addClass("disabled");

              if (oSettings._iDisplayLength == -1) {
                if (oSettings.fnRecordsDisplay() > 150) {
                  $(".paginate_button.page-item.previous").addClass("disabled");
                  $(".paginate_button.page-item.next").addClass("disabled");
                }
              } else {
              }
              if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                $(".paginate_button.page-item.next").addClass("disabled");
              }

              $(
                ".paginate_button.next:not(.disabled)",
                this.api().table().container()
              ).on("click", function () {
                $(".fullScreenSpin").css("display", "inline-block");
                let dataLenght = oSettings._iDisplayLength;
                var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
                var dateTo = new Date($("#dateTo").datepicker("getDate"));

                let formatDateFrom =
                  dateFrom.getFullYear() +
                  "-" +
                  (dateFrom.getMonth() + 1) +
                  "-" +
                  dateFrom.getDate();
                let formatDateTo =
                  dateTo.getFullYear() +
                  "-" +
                  (dateTo.getMonth() + 1) +
                  "-" +
                  dateTo.getDate();
                if (data.Params.IgnoreDates == true) {
                  sideBarService
                    .getAllBillListData(
                      formatDateFrom,
                      formatDateTo,
                      true,
                      initialDatatableLoad,
                      oSettings.fnRecordsDisplay()
                    )
                    .then(function (dataObjectnew) {
                      getVS1Data("TBillList")
                        .then(function (dataObjectold) {
                          if (dataObjectold.length == 0) {
                          } else {
                            let dataOld = JSON.parse(dataObjectold[0].data);

                            var thirdaryData = $.merge(
                              $.merge([], dataObjectnew.tbilllist),
                              dataOld.tbilllist
                            );
                            let objCombineData = {
                              Params: dataOld.Params,
                              tbilllist: thirdaryData,
                            };

                            addVS1Data(
                              "TBillList",
                              JSON.stringify(objCombineData)
                            )
                              .then(function (datareturn) {
                                templateObject.resetData(objCombineData);
                                $(".fullScreenSpin").css("display", "none");
                              })
                              .catch(function (err) {
                                $(".fullScreenSpin").css("display", "none");
                              });
                          }
                        })
                        .catch(function (err) {});
                    })
                    .catch(function (err) {
                      $(".fullScreenSpin").css("display", "none");
                    });
                } else {
                  sideBarService
                    .getAllBillListData(
                      formatDateFrom,
                      formatDateTo,
                      false,
                      initialDatatableLoad,
                      oSettings.fnRecordsDisplay()
                    )
                    .then(function (dataObjectnew) {
                      getVS1Data("TBillList")
                        .then(function (dataObjectold) {
                          if (dataObjectold.length == 0) {
                          } else {
                            let dataOld = JSON.parse(dataObjectold[0].data);

                            var thirdaryData = $.merge(
                              $.merge([], dataObjectnew.tbilllist),
                              dataOld.tbilllist
                            );
                            let objCombineData = {
                              Params: dataOld.Params,
                              tbilllist: thirdaryData,
                            };

                            addVS1Data(
                              "TBillList",
                              JSON.stringify(objCombineData)
                            )
                              .then(function (datareturn) {
                                templateObject.resetData(objCombineData);
                                $(".fullScreenSpin").css("display", "none");
                              })
                              .catch(function (err) {
                                $(".fullScreenSpin").css("display", "none");
                              });
                          }
                        })
                        .catch(function (err) {});
                    })
                    .catch(function (err) {
                      $(".fullScreenSpin").css("display", "none");
                    });
                }
              });

              setTimeout(function () {
                MakeNegative();
              }, 100);
            },
            fnInitComplete: function () {
              this.fnPageChange("last");
              if (response.Params.Search.replace(/\s/g, "") == "") {
                $(
                  "<button class='btn btn-danger btnHideDeleted' type='button' id='btnHideDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='far fa-check-circle' style='margin-right: 5px'></i>Hide Deleted</button>"
                ).insertAfter("#tblbilllist_filter");
              } else {
                $(
                  "<button class='btn btn-primary btnViewDeleted' type='button' id='btnViewDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fa fa-trash' style='margin-right: 5px'></i>View Deleted</button>"
                ).insertAfter("#tblbilllist_filter");
              }
              $(
                "<button class='btn btn-primary btnRefreshBillList' type='button' id='btnRefreshBillList' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>"
              ).insertAfter("#tblbilllist_filter");
              $(".myvarFilterForm").appendTo(".colDateFilter");
            },
            fnInfoCallback: function (
              oSettings,
              iStart,
              iEnd,
              iMax,
              iTotal,
              sPre
            ) {
             // let countTableData = data.response.Params.Count || 0; //get count from API data
              let countTableData = response.Params.Count || 0;
              let bills = templateObject.bills.get() || [];

              return (
                "Showing " + iStart + " to " + iEnd + " of " + countTableData //bills.length
              );
            },
          })
          .on("page", function () {
            setTimeout(function () {
              MakeNegative();
            }, 100);
            let draftRecord = templateObject.datatablerecords.get();
            templateObject.datatablerecords.set(draftRecord);
          })
          .on("column-reorder", function () {})
          .on("length.dt", function (e, settings, len) {
            setTimeout(function () {
              MakeNegative();
            }, 100);
          });
        $(".fullScreenSpin").css("display", "none");
      }, 300);

      $("div.dataTables_filter input").addClass("form-control form-control-sm");
      $("#tblbilllist tbody").on("click", "tr", function () {
        var listData = $(this).closest("tr").attr("id");
        var checkDeleted =
          $(this).closest("tr").find(".colStatus").text() || "";
        if (listData) {
          if (checkDeleted == "Deleted") {
            swal(
              "You Cannot View This Transaction",
              "Because It Has Been Deleted",
              "info"
            );
          } else {
            FlowRouter.go("/billcard?id=" + listData);
          }
        }
      });

      templateObject.getCustomFieldData();
    };

    /**
     * @deprecated since 1 nov 2022
     */
    templateObject.getAllBillData = function () {

      var currentBeginDate = new Date();
      var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
      let fromDateMonth = (currentBeginDate.getMonth() + 1);
      let fromDateDay = currentBeginDate.getDate();
      if ((currentBeginDate.getMonth() + 1) < 10) {
          fromDateMonth = "0" + (currentBeginDate.getMonth() + 1);
      } else {
          fromDateMonth = (currentBeginDate.getMonth() + 1);
      }

      if (currentBeginDate.getDate() < 10) {
          fromDateDay = "0" + currentBeginDate.getDate();
      }
      var toDate = currentBeginDate.getFullYear() + "-" + (fromDateMonth) + "-" + (fromDateDay);
      let prevMonth11Date = (moment().subtract(reportsloadMonths, 'months')).format("YYYY-MM-DD");

        getVS1Data('TBillList').then(function (dataObject) {
            if(dataObject.length == 0){
                sideBarService.getAllBillListData(prevMonth11Date,toDate, true,initialReportLoad,0).then(function (data) {
                    let lineItems = [];
                    let lineItemObj = {};
                    addVS1Data('TBillList',JSON.stringify(data));
                    if (data.Params.IgnoreDates == true) {
                        $('#dateFrom').attr('readonly', true);
                        $('#dateTo').attr('readonly', true);
                    } else {
                        $('#dateFrom').attr('readonly', false);
                        $('#dateTo').attr('readonly', false);
                        $("#dateFrom").val(data.Params.DateFrom != '' ? moment(data.Params.DateFrom).format("DD/MM/YYYY") : data.Params.DateFrom);
                        $("#dateTo").val(data.Params.DateTo != '' ? moment(data.Params.DateTo).format("DD/MM/YYYY") : data.Params.DateTo);
                    }

                    for(let i=0; i<data.tbilllist.length; i++){
                        let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.tbilllist[i].TotalAmount)|| 0.00;
                        let totalTax = utilityService.modifynegativeCurrencyFormat(data.tbilllist[i].TotalTax) || 0.00;
                        let totalAmount = utilityService.modifynegativeCurrencyFormat(data.tbilllist[i].TotalAmountInc)|| 0.00;
                        let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tbilllist[i].Payment)|| 0.00;
                        let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tbilllist[i].Balance)|| 0.00;
                        let orderstatus = data.tbilllist[i].OrderStatus || '';
                        if(data.tbilllist[i].Deleted == true){
                          orderstatus = "Deleted";
                        }else if(data.tbilllist[i].SupplierName == ''){
                          orderstatus = "Deleted";
                        };
                        var dataList = {
                            id: data.tbilllist[i].PurchaseOrderID || '',
                            employee:data.tbilllist[i].EmployeeName || '',
                            accountname:data.tbilllist[i].Account || '',
                            sortdate: data.tbilllist[i].OrderDate !=''? moment(data.tbilllist[i].OrderDate).format("YYYY/MM/DD"): data.tbilllist[i].OrderDate,
                            orderdate: data.tbilllist[i].OrderDate !=''? moment(data.tbilllist[i].OrderDate).format("DD/MM/YYYY"): data.tbilllist[i].OrderDate,
                            suppliername: data.tbilllist[i].SupplierName || '',
                            totalamountex: totalAmountEx || 0.00,
                            totaltax: totalTax || 0.00,
                            totalamount: totalAmount || 0.00,
                            totalpaid: totalPaid || 0.00,
                            totaloustanding: totalOutstanding || 0.00,
                            orderstatus: orderstatus || '',
                            custfield1: '' || '',
                            custfield2: '' || '',
                            comments: data.tbilllist[i].Comments || '',
                        };
                        dataTableList.push(dataList);

                    }
                    templateObject.datatablerecords.set(dataTableList);

                    if(templateObject.datatablerecords.get()){

                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                    }

                    setTimeout(function () {
                        $('.fullScreenSpin').css('display','none');

                        $('#tblbilllist').DataTable({

                            "sDom": "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                            buttons: [
                                {
                                    extend: 'excelHtml5',
                                    text: '',
                                    download: 'open',
                                    className: "btntabletocsv hiddenColumn",
                                    filename: "Bill List - "+ moment().format(),
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
                                    title: 'Sales Overview',
                                    filename: "Bill List - "+ moment().format(),
                                    exportOptions: {
                                        columns: ':visible',
                                        stripHtml: false
                                    }
                                }],
                            select: true,
                            destroy: true,
                            colReorder: true,
                            pageLength: initialDatatableLoad,
                            "bLengthChange": false,
                            lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                            info: true,
                            responsive: true,
                            "order": [[ 0, "desc" ],[ 2, "desc" ]],
                            action: function () {
                                $('#tblbilllist').DataTable().ajax.reload();
                            },
                            "fnDrawCallback": function (oSettings) {
                              let checkurlIgnoreDate = FlowRouter.current().queryParams.ignoredate;

                              $('.paginate_button.page-item').removeClass('disabled');
                              $('#tblbilllist_ellipsis').addClass('disabled');

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
                                 var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
                                 var dateTo = new Date($("#dateTo").datepicker("getDate"));

                                 let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
                                 let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();
                                 if(data.Params.IgnoreDates == true){
                                   sideBarService.getAllBillListData(formatDateFrom, formatDateTo, true, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
                                     getVS1Data('TBillList').then(function (dataObjectold) {
                                       if(dataObjectold.length == 0){

                                       }else{
                                         let dataOld = JSON.parse(dataObjectold[0].data);

                                         var thirdaryData = $.merge($.merge([], dataObjectnew.tbilllist), dataOld.tbilllist);
                                         let objCombineData = {
                                           Params: dataOld.Params,
                                           tbilllist:thirdaryData
                                         }


                                           addVS1Data('TBillList',JSON.stringify(objCombineData)).then(function (datareturn) {
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
                                 sideBarService.getAllBillListData(formatDateFrom, formatDateTo, false, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
                                   getVS1Data('TBillList').then(function (dataObjectold) {
                                     if(dataObjectold.length == 0){

                                     }else{
                                       let dataOld = JSON.parse(dataObjectold[0].data);

                                       var thirdaryData = $.merge($.merge([], dataObjectnew.tbilllist), dataOld.tbilllist);
                                       let objCombineData = {
                                         Params: dataOld.Params,
                                         tbilllist:thirdaryData
                                       }


                                         addVS1Data('TBillList',JSON.stringify(objCombineData)).then(function (datareturn) {
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
                               if(data.Params.Search.replace(/\s/g, "") == ""){
                                 $("<button class='btn btn-danger btnHideDeleted' type='button' id='btnHideDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='far fa-check-circle' style='margin-right: 5px'></i>Hide Deleted</button>").insertAfter("#tblbilllist_filter");
                               }else{
                                 $("<button class='btn btn-primary btnViewDeleted' type='button' id='btnViewDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fa fa-trash' style='margin-right: 5px'></i>View Deleted</button>").insertAfter("#tblbilllist_filter");
                               };
                             $("<button class='btn btn-primary btnRefreshBillList' type='button' id='btnRefreshBillList' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblbilllist_filter");
                             $('.myvarFilterForm').appendTo(".colDateFilter");
                         },
                         "fnInfoCallback": function (oSettings, iStart, iEnd, iMax, iTotal, sPre) {
                           let countTableData = data.Params.Count || 0; //get count from API data

                             return 'Showing '+ iStart + " to " + iEnd + " of " + countTableData;
                         }

                        }).on('page', function () {
                            setTimeout(function () {
                                MakeNegative();
                            }, 100);
                            let draftRecord = templateObject.datatablerecords.get();
                            templateObject.datatablerecords.set(draftRecord);
                        }).on('column-reorder', function () {

                        }).on( 'length.dt', function ( e, settings, len ) {
                            setTimeout(function () {
                                MakeNegative();
                            }, 100);
                        });
                        $('.fullScreenSpin').css('display','none');

                    }, 0);

                    $('div.dataTables_filter input').addClass('form-control form-control-sm');
                    $('#tblbilllist tbody').on( 'click', 'tr', function () {
                        var listData = $(this).closest('tr').attr('id');
                        var checkDeleted = $(this).closest('tr').find('.colStatus').text() || '';
                        if(listData){
                          if(checkDeleted == "Deleted"){
                            swal('You Cannot View This Transaction', 'Because It Has Been Deleted', 'info');
                          }else{
                            FlowRouter.go('/billcard?id=' + listData);
                          }
                        }
                    });

                    templateObject.getCustomFieldData();
                }).catch(function (err) {

                    $('.fullScreenSpin').css('display','none');

                });
            }else{
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tbilllist;
                let lineItems = [];
                let lineItemObj = {};
                if (data.Params.IgnoreDates == true) {
                    $('#dateFrom').attr('readonly', true);
                    $('#dateTo').attr('readonly', true);

                } else {
                  $('#dateFrom').attr('readonly', false);
                  $('#dateTo').attr('readonly', false);
                    $("#dateFrom").val(data.Params.DateFrom != '' ? moment(data.Params.DateFrom).format("DD/MM/YYYY") : data.Params.DateFrom);
                    $("#dateTo").val(data.Params.DateTo != '' ? moment(data.Params.DateTo).format("DD/MM/YYYY") : data.Params.DateTo);
                }

                for(let i=0; i<data.tbilllist.length; i++){
                    let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.tbilllist[i].TotalAmount)|| 0.00;
                    let totalTax = utilityService.modifynegativeCurrencyFormat(data.tbilllist[i].TotalTax) || 0.00;
                    let totalAmount = utilityService.modifynegativeCurrencyFormat(data.tbilllist[i].TotalAmountInc)|| 0.00;
                    let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tbilllist[i].Payment)|| 0.00;
                    let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tbilllist[i].Balance)|| 0.00;
                    let orderstatus = data.tbilllist[i].OrderStatus || '';
                    if(data.tbilllist[i].Deleted == true){
                      orderstatus = "Deleted";
                    }else if(data.tbilllist[i].SupplierName == ''){
                      orderstatus = "Deleted";
                    };
                    var dataList = {
                        id: data.tbilllist[i].PurchaseOrderID || '',
                        employee:data.tbilllist[i].EmployeeName || '',
                        accountname:data.tbilllist[i].Account || '',
                        sortdate: data.tbilllist[i].OrderDate !=''? moment(data.tbilllist[i].OrderDate).format("YYYY/MM/DD"): data.tbilllist[i].OrderDate,
                        orderdate: data.tbilllist[i].OrderDate !=''? moment(data.tbilllist[i].OrderDate).format("DD/MM/YYYY"): data.tbilllist[i].OrderDate,
                        suppliername: data.tbilllist[i].SupplierName || '',
                        totalamountex: totalAmountEx || 0.00,
                        totaltax: totalTax || 0.00,
                        totalamount: totalAmount || 0.00,
                        totalpaid: totalPaid || 0.00,
                        totaloustanding: totalOutstanding || 0.00,
                        orderstatus: orderstatus || '',
                        custfield1: '' || '',
                        custfield2: '' || '',
                        comments: data.tbilllist[i].Comments || '',
                    };
                    dataTableList.push(dataList);

                }
                templateObject.datatablerecords.set(dataTableList);

                if(templateObject.datatablerecords.get()){

                    setTimeout(function () {
                        MakeNegative();
                    }, 100);
                }

                setTimeout(function () {
                    $('.fullScreenSpin').css('display','none');

                    $('#tblbilllist').DataTable({

                        "sDom": "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        buttons: [
                            {
                                extend: 'excelHtml5',
                                text: '',
                                download: 'open',
                                className: "btntabletocsv hiddenColumn",
                                filename: "Bill List - "+ moment().format(),
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
                                title: 'Sales Overview',
                                filename: "Bill List - "+ moment().format(),
                                exportOptions: {
                                    columns: ':visible',
                                    stripHtml: false
                                }
                            }],
                        select: true,
                        destroy: true,
                        colReorder: true,
                        pageLength: initialDatatableLoad,
                        "bLengthChange": false,
                        lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                        info: true,
                        responsive: true,
                        "order": [[ 0, "desc" ],[ 2, "desc" ]],
                        action: function () {
                            $('#tblbilllist').DataTable().ajax.reload();
                        },
                        "fnDrawCallback": function (oSettings) {
                          let checkurlIgnoreDate = FlowRouter.current().queryParams.ignoredate;

                          $('.paginate_button.page-item').removeClass('disabled');
                          $('#tblbilllist_ellipsis').addClass('disabled');

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
                             var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
                             var dateTo = new Date($("#dateTo").datepicker("getDate"));

                             let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
                             let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();
                             if(data.Params.IgnoreDates == true){
                               sideBarService.getAllBillListData(formatDateFrom, formatDateTo, true, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
                                 getVS1Data('TBillList').then(function (dataObjectold) {
                                   if(dataObjectold.length == 0){

                                   }else{
                                     let dataOld = JSON.parse(dataObjectold[0].data);

                                     var thirdaryData = $.merge($.merge([], dataObjectnew.tbilllist), dataOld.tbilllist);
                                     let objCombineData = {
                                       Params: dataOld.Params,
                                       tbilllist:thirdaryData
                                     }


                                       addVS1Data('TBillList',JSON.stringify(objCombineData)).then(function (datareturn) {
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
                             sideBarService.getAllBillListData(formatDateFrom, formatDateTo, false, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
                               getVS1Data('TBillList').then(function (dataObjectold) {
                                 if(dataObjectold.length == 0){

                                 }else{
                                   let dataOld = JSON.parse(dataObjectold[0].data);

                                   var thirdaryData = $.merge($.merge([], dataObjectnew.tbilllist), dataOld.tbilllist);
                                   let objCombineData = {
                                     Params: dataOld.Params,
                                     tbilllist:thirdaryData
                                   }


                                     addVS1Data('TBillList',JSON.stringify(objCombineData)).then(function (datareturn) {
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
                           if(data.Params.Search.replace(/\s/g, "") == ""){
                             $("<button class='btn btn-danger btnHideDeleted' type='button' id='btnHideDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='far fa-check-circle' style='margin-right: 5px'></i>Hide Deleted</button>").insertAfter("#tblbilllist_filter");
                           }else{
                             $("<button class='btn btn-primary btnViewDeleted' type='button' id='btnViewDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fa fa-trash' style='margin-right: 5px'></i>View Deleted</button>").insertAfter("#tblbilllist_filter");
                           };

                         $("<button class='btn btn-primary btnRefreshBillList' type='button' id='btnRefreshBillList' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblbilllist_filter");
                         $('.myvarFilterForm').appendTo(".colDateFilter");
                     },
                     "fnInfoCallback": function (oSettings, iStart, iEnd, iMax, iTotal, sPre) {
                       let countTableData = data.Params.Count || 0; //get count from API data

                         return 'Showing '+ iStart + " to " + iEnd + " of " + countTableData;
                     }

                    }).on('page', function () {
                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                        let draftRecord = templateObject.datatablerecords.get();
                        templateObject.datatablerecords.set(draftRecord);
                    }).on('column-reorder', function () {

                    }).on( 'length.dt', function ( e, settings, len ) {
                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                    });
                    $('.fullScreenSpin').css('display','none');


                }, 0);

                $('div.dataTables_filter input').addClass('form-control form-control-sm');
                $('#tblbilllist tbody').on( 'click', 'tr', function () {
                    var listData = $(this).closest('tr').attr('id');
                    var checkDeleted = $(this).closest('tr').find('.colStatus').text() || '';
                    if(listData){
                      if(checkDeleted == "Deleted"){
                        swal('You Cannot View This Transaction', 'Because It Has Been Deleted', 'info');
                      }else{
                        FlowRouter.go('/billcard?id=' + listData);
                      }
                    }
                });

                templateObject.getCustomFieldData();
            }
        }).catch(function (err) {
          sideBarService.getAllBillListData(prevMonth11Date,toDate, true,initialReportLoad,0).then(function (data) {
              let lineItems = [];
              let lineItemObj = {};
              addVS1Data('TBillList',JSON.stringify(data));
              if (data.Params.IgnoreDates == true) {
                  $('#dateFrom').attr('readonly', true);
                  $('#dateTo').attr('readonly', true);

              } else {
                $('#dateFrom').attr('readonly', false);
                $('#dateTo').attr('readonly', false);
                  $("#dateFrom").val(data.Params.DateFrom != '' ? moment(data.Params.DateFrom).format("DD/MM/YYYY") : data.Params.DateFrom);
                  $("#dateTo").val(data.Params.DateTo != '' ? moment(data.Params.DateTo).format("DD/MM/YYYY") : data.Params.DateTo);
              }

              for(let i=0; i<data.tbilllist.length; i++){
                  let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.tbilllist[i].TotalAmount)|| 0.00;
                  let totalTax = utilityService.modifynegativeCurrencyFormat(data.tbilllist[i].TotalTax) || 0.00;
                  let totalAmount = utilityService.modifynegativeCurrencyFormat(data.tbilllist[i].TotalAmountInc)|| 0.00;
                  let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tbilllist[i].Payment)|| 0.00;
                  let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tbilllist[i].Balance)|| 0.00;
                  let orderstatus = data.tbilllist[i].OrderStatus || '';
                  if(data.tbilllist[i].Deleted == true){
                    orderstatus = "Deleted";
                  }else if(data.tbilllist[i].SupplierName == ''){
                    orderstatus = "Deleted";
                  };
                  var dataList = {
                      id: data.tbilllist[i].PurchaseOrderID || '',
                      employee:data.tbilllist[i].EmployeeName || '',
                      accountname:data.tbilllist[i].Account || '',
                      sortdate: data.tbilllist[i].OrderDate !=''? moment(data.tbilllist[i].OrderDate).format("YYYY/MM/DD"): data.tbilllist[i].OrderDate,
                      orderdate: data.tbilllist[i].OrderDate !=''? moment(data.tbilllist[i].OrderDate).format("DD/MM/YYYY"): data.tbilllist[i].OrderDate,
                      suppliername: data.tbilllist[i].SupplierName || '',
                      totalamountex: totalAmountEx || 0.00,
                      totaltax: totalTax || 0.00,
                      totalamount: totalAmount || 0.00,
                      totalpaid: totalPaid || 0.00,
                      totaloustanding: totalOutstanding || 0.00,
                      orderstatus: orderstatus || '',
                      custfield1: '' || '',
                      custfield2: '' || '',
                      comments: data.tbilllist[i].Comments || '',
                  };
                  dataTableList.push(dataList);

              }
              templateObject.datatablerecords.set(dataTableList);

              if(templateObject.datatablerecords.get()){
                  setTimeout(function () {
                      MakeNegative();
                  }, 100);
              }

              setTimeout(function () {
                  $('.fullScreenSpin').css('display','none');

                  $('#tblbilllist').DataTable({

                      "sDom": "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                      buttons: [
                          {
                              extend: 'excelHtml5',
                              text: '',
                              download: 'open',
                              className: "btntabletocsv hiddenColumn",
                              filename: "Bill List - "+ moment().format(),
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
                              title: 'Sales Overview',
                              filename: "Bill List - "+ moment().format(),
                              exportOptions: {
                                  columns: ':visible',
                                  stripHtml: false
                              }
                          }],
                      select: true,
                      destroy: true,
                      colReorder: true,
                      pageLength: initialDatatableLoad,
                      "bLengthChange": false,
                      lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                      info: true,
                      responsive: true,
                      "order": [[ 0, "desc" ],[ 2, "desc" ]],
                      action: function () {
                          $('#tblbilllist').DataTable().ajax.reload();
                      },
                      "fnDrawCallback": function (oSettings) {
                        let checkurlIgnoreDate = FlowRouter.current().queryParams.ignoredate;

                        $('.paginate_button.page-item').removeClass('disabled');
                        $('#tblbilllist_ellipsis').addClass('disabled');

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
                           var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
                           var dateTo = new Date($("#dateTo").datepicker("getDate"));

                           let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
                           let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();
                           if(data.Params.IgnoreDates == true){
                             sideBarService.getAllBillListData(formatDateFrom, formatDateTo, true, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
                               getVS1Data('TBillList').then(function (dataObjectold) {
                                 if(dataObjectold.length == 0){

                                 }else{
                                   let dataOld = JSON.parse(dataObjectold[0].data);

                                   var thirdaryData = $.merge($.merge([], dataObjectnew.tbilllist), dataOld.tbilllist);
                                   let objCombineData = {
                                     Params: dataOld.Params,
                                     tbilllist:thirdaryData
                                   }


                                     addVS1Data('TBillList',JSON.stringify(objCombineData)).then(function (datareturn) {
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
                           sideBarService.getAllBillListData(formatDateFrom, formatDateTo, false, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
                             getVS1Data('TBillList').then(function (dataObjectold) {
                               if(dataObjectold.length == 0){

                               }else{
                                 let dataOld = JSON.parse(dataObjectold[0].data);

                                 var thirdaryData = $.merge($.merge([], dataObjectnew.tbilllist), dataOld.tbilllist);
                                 let objCombineData = {
                                   Params: dataOld.Params,
                                   tbilllist:thirdaryData
                                 }


                                   addVS1Data('TBillList',JSON.stringify(objCombineData)).then(function (datareturn) {
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
                         if(data.Params.Search.replace(/\s/g, "") == ""){
                           $("<button class='btn btn-danger btnHideDeleted' type='button' id='btnHideDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='far fa-check-circle' style='margin-right: 5px'></i>Hide Deleted</button>").insertAfter("#tblbilllist_filter");
                         }else{
                           $("<button class='btn btn-primary btnViewDeleted' type='button' id='btnViewDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fa fa-trash' style='margin-right: 5px'></i>View Deleted</button>").insertAfter("#tblbilllist_filter");
                         };
                       $("<button class='btn btn-primary btnRefreshBillList' type='button' id='btnRefreshBillList' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblbilllist_filter");
                       $('.myvarFilterForm').appendTo(".colDateFilter");
                   },
                   "fnInfoCallback": function (oSettings, iStart, iEnd, iMax, iTotal, sPre) {
                     let countTableData = data.Params.Count || 0; //get count from API data

                       return 'Showing '+ iStart + " to " + iEnd + " of " + countTableData;
                   }

                  }).on('page', function () {
                      setTimeout(function () {
                          MakeNegative();
                      }, 100);
                      let draftRecord = templateObject.datatablerecords.get();
                      templateObject.datatablerecords.set(draftRecord);
                  }).on('column-reorder', function () {

                  }).on( 'length.dt', function ( e, settings, len ) {
                      setTimeout(function () {
                          MakeNegative();
                      }, 100);
                  });
                  $('.fullScreenSpin').css('display','none');


              }, 0);

              $('div.dataTables_filter input').addClass('form-control form-control-sm');
              $('#tblbilllist tbody').on( 'click', 'tr', function () {
                  var listData = $(this).closest('tr').attr('id');
                  var checkDeleted = $(this).closest('tr').find('.colStatus').text() || '';
                  if(listData){
                    if(checkDeleted == "Deleted"){
                      swal('You Cannot View This Transaction', 'Because It Has Been Deleted', 'info');
                    }else{
                      FlowRouter.go('/billcard?id=' + listData);
                    }
                  }
              });

              templateObject.getCustomFieldData();
          }).catch(function (err) {

              $('.fullScreenSpin').css('display','none');

          });
        });
    }


    templateObject.loadAllFilteredBills = async (fromDate, toDate, ignoreDate, refresh = false) => {

      let data = await CachedHttp.get(erpObject.TBillList, async () => {
        return await sideBarService.getAllBillListData(fromDate, toDate, ignoreDate,initialReportLoad,0);
      }, {
        useIndexDb: true,
        forceOverride: refresh,
        validate: (cachedResponse) => {
          return true;
        }
      });

      data = data.response;
      await templateObject.billResponse.set(data);
      let bills = data.tbilllist;
      await templateObject.bills.set(bills);
    }


    templateObject.getAllFilterBillData = function(fromDate, toDate, ignoreDate) {
        sideBarService.getAllBillListData(fromDate, toDate, ignoreDate,initialReportLoad,0).then(function(data) {
            addVS1Data('TBillList', JSON.stringify(data)).then(function(datareturn) {
                location.reload();
            }).catch(function(err) {
                $('.fullScreenSpin').css('display', 'none');
            });
        }).catch(function(err) {
            $('.fullScreenSpin').css('display', 'none');
        });
    }

    // if(FlowRouter.current().queryParams.overview){
    //   templateObject.getAllFilterBillData("", "", true);
    // }else{
    //   templateObject.getAllBillData();
    // }

    let urlParametersDateFrom = FlowRouter.current().queryParams.fromDate;
    let urlParametersDateTo = FlowRouter.current().queryParams.toDate;
    let urlParametersIgnoreDate = FlowRouter.current().queryParams.ignoredate;
    if (urlParametersDateFrom) {
        if (urlParametersIgnoreDate == true) {
            $('#dateFrom').attr('readonly', true);
            $('#dateTo').attr('readonly', true);
        } else {

            $("#dateFrom").val(urlParametersDateFrom != '' ? moment(urlParametersDateFrom).format("DD/MM/YYYY") : urlParametersDateFrom);
            $("#dateTo").val(urlParametersDateTo != '' ? moment(urlParametersDateTo).format("DD/MM/YYYY") : urlParametersDateTo);
        }
    }


    // custom field displaysettings
  templateObject.getCustomFieldData= function() {
    // let listType = "ltBillList";
    //   getVS1Data('TCustomFieldList').then(function (dataObject) {
    //       if(dataObject.length == 0){
    //             sideBarService.getAllCustomFieldsWithQuery(listType).then(function (data) {
    //               templateObject.setCustomFieldDataCheckIndexDB(data);
    //             });
    //         }else{
    //           let data = JSON.parse(dataObject[0].data);
    //           templateObject.setCustomFieldDataCheckIndexDB(data);
    //         }
    //   }).catch(function (err) {
    //         sideBarService.getAllCustomFieldsWithQuery(listType).then(function (data) {
    //           templateObject.setCustomFieldDataCheckIndexDB(data);
    //         });
    //   });
  }

  // custom field displaysettings
  templateObject.setCustomFieldDataCheckIndexDB = function(data) {


    let custFields = [];
    let dispFields = [];
    let customData = {};
    let customFieldCount = 11;
    let listType = "ltBillList";

    let reset_data = [

      { label: 'Order Date', class: 'colOrderDate', active: true },
      { label: 'Bill No.', class: 'colPurchaseNo', active: true },
      { label: 'Supplier', class: 'colSupplier', active: true },
      { label: 'Amount (Ex)', class: 'colAmountEx', active: true },
      { label: 'Tax', class: 'colTax', active: true },
      { label: 'Amount', class: 'colAmount', active: true },
      { label: 'Paid', class: 'colPaid', active: true },
      { label: 'Outstanding', class: 'colBalanceOutstanding', active: false },
      { label: 'Status', class: 'colStatus', active: true },
      { label: 'Employee', class: 'colEmployee', active: true },
      { label: 'Comments', class: 'colComments', active: false },
    ];
      for (let x = 0; x < data.tcustomfieldlist.length; x++) {
        if (data.tcustomfieldlist[x].fields.ListType == 'ltOrder') {
          customData = {
            active: data.tcustomfieldlist[x].fields.Active || false,
            id: parseInt(data.tcustomfieldlist[x].fields.ID) || 0,
            custfieldlabel: data.tcustomfieldlist[x].fields.Description || "",
            datatype: data.tcustomfieldlist[x].fields.DataType || "",
            isempty: data.tcustomfieldlist[x].fields.ISEmpty || false,
            iscombo: data.tcustomfieldlist[x].fields.IsCombo || false,
            dropdown: data.tcustomfieldlist[x].fields.Dropdown || null,
          };
          custFields.push(customData);
        } else if (data.tcustomfieldlist[x].fields.ListType == listType) {
          customData = {
            active: data.tcustomfieldlist[x].fields.Active || false,
            id: parseInt(data.tcustomfieldlist[x].fields.ID) || 0,
            custfieldlabel: data.tcustomfieldlist[x].fields.Description || "",
            datatype: data.tcustomfieldlist[x].fields.DataType || "",
            isempty: data.tcustomfieldlist[x].fields.ISEmpty || false,
            iscombo: data.tcustomfieldlist[x].fields.IsCombo || false,
            dropdown: data.tcustomfieldlist[x].fields.Dropdown || null,
          };
          dispFields.push(customData);
        }
      }

      if (custFields.length < 3) {
        let remainder = 3 - custFields.length;
        let getRemCustomFields = parseInt(custFields.length);
        for (let r = 0; r < remainder; r++) {
          getRemCustomFields++;
          customData = {
            active: false,
            id: "",
            custfieldlabel: "Custom Field " + getRemCustomFields,
            datatype: "",
            isempty: true,
            iscombo: false,
          };
          // count++;
          custFields.push(customData);
        }
      }

      if (dispFields.length < customFieldCount) {
        let remainder = customFieldCount - dispFields.length;
        let getRemCustomFields = parseInt(dispFields.length);
        for (let r = 0; r < remainder; r++) {
          customData = {
            active: reset_data[getRemCustomFields].active,
            id: "",
            custfieldlabel: reset_data[getRemCustomFields].label,
            datatype: "",
            isempty: true,
            iscombo: false,
          };
          getRemCustomFields++;
          // count++;
          dispFields.push(customData);
        }
      }

      for (let index = 0; index < custFields.length; index++) {
        const element = custFields[index];
        dispFields.push(element);

      }

      templateObject.custfields.set(custFields);
      templateObject.displayfields.set(dispFields);

  }

  templateObject.initPage = async (refresh = false) =>  {

    LoadingOverlay.show();

    // I dont understand the purpose of this...
    if(FlowRouter.current().queryParams.overview){
      // templateObject.getAllFilterBillData("", "", true);
      await templateObject.loadAllFilteredBills("", "", true, refresh);
    }else{
      //templateObject.getAllBillData();
      await templateObject.loadBills(refresh);
    }


    templateObject.setupTable(refresh);
    LoadingOverlay.hide();
  }

  templateObject.initPage();
});

Template.billlist.events({
    'click #btnNewBill':function(event){
        FlowRouter.go('/billcard');
    },
    'click .chkDatatable' : function(event){
        var columns = $('#tblbilllist th');
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
     'keyup #tblbilllist_filter input': function (event) {
          if($(event.target).val() != ''){
            $(".btnRefreshBillList").addClass('btnSearchAlert');
          }else{
            $(".btnRefreshBillList").removeClass('btnSearchAlert');
          }
          if (event.keyCode == 13) {
             $(".btnRefreshBillList").trigger("click");
          }
        },
    'click .btnRefreshBillList':function(event){
        let templateObject = Template.instance();
        let utilityService = new UtilityService();
        let tableProductList;
        const dataTableList = [];
        var splashArrayInvoiceList = new Array();
        const lineExtaSellItems = [];
        $('.fullScreenSpin').css('display', 'inline-block');
        let dataSearchName = $('#tblbilllist_filter input').val();
        if (dataSearchName.replace(/\s/g, '') != '') {
            sideBarService.getNewBillByNameOrID(dataSearchName).then(function (data) {
               let lineItems = [];
                    let lineItemObj = {};
                    addVS1Data('TBillEx',JSON.stringify(data));
                    for(let i=0; i<data.tbillex.length; i++){
                        let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.tbillex[i].fields.TotalAmount)|| 0.00;
                        let totalTax = utilityService.modifynegativeCurrencyFormat(data.tbillex[i].fields.TotalTax) || 0.00;
                        let totalAmount = utilityService.modifynegativeCurrencyFormat(data.tbillex[i].fields.TotalAmountInc)|| 0.00;
                        let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tbillex[i].fields.TotalPaid)|| 0.00;
                        let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tbillex[i].fields.TotalBalance)|| 0.00;
                        let orderstatus = data.tbillex[i].fields.OrderStatus || '';
                        if(data.tbillex[i].fields.Deleted == true){
                          orderstatus = "Deleted";
                        }else if(data.tbillex[i].fields.CustomerName == ''){
                          orderstatus = "Deleted";
                        };
                        var dataList = {
                            id: data.tbillex[i].fields.ID || '',
                            employee:data.tbillex[i].fields.EmployeeName || '',
                            accountname:data.tbillex[i].fields.AccountName || '',
                            sortdate: data.tbillex[i].fields.OrderDate !=''? moment(data.tbillex[i].fields.OrderDate).format("YYYY/MM/DD"): data.tbillex[i].fields.OrderDate,
                            orderdate: data.tbillex[i].fields.OrderDate !=''? moment(data.tbillex[i].fields.OrderDate).format("DD/MM/YYYY"): data.tbillex[i].fields.OrderDate,
                            suppliername: data.tbillex[i].fields.SupplierName || '',
                            totalamountex: totalAmountEx || 0.00,
                            totaltax: totalTax || 0.00,
                            totalamount: totalAmount || 0.00,
                            totalpaid: totalPaid || 0.00,
                            totaloustanding: totalOutstanding || 0.00,
                            orderstatus: orderstatus || '',
                            custfield1: '' || '',
                            custfield2: '' || '',
                            comments: data.tbillex[i].fields.Comments || '',
                        };
                        dataTableList.push(dataList);


                    }
                    templateObject.datatablerecords.set(dataTableList);
                    let item = templateObject.datatablerecords.get();
                    $('.fullScreenSpin').css('display', 'none');
                    if (dataTableList) {
                        var datatable = $('#tblbilllist').DataTable();
                        $("#tblbilllist > tbody").empty();
                        for (let x = 0; x < item.length; x++) {
                            $("#tblbilllist > tbody").append(
                                ' <tr class="dnd-moved" id="' + item[x].id + '" style="cursor: pointer;">' +
                                '<td contenteditable="false" class="colSortDate hiddenColumn">' + item[x].sortdate + '</td>' +
                                '<td contenteditable="false" class="colOrderDate" ><span style="display:none;">' + item[x].sortdate + '</span>' + item[x].orderdate + '</td>' +
                                '<td contenteditable="false" class="colPurchaseNo">' + item[x].id + '</td>' +
                                '<td contenteditable="false" class="colSupplier" >' + item[x].suppliername + '</td>' +
                                '<td contenteditable="false" class="colAmountEx" style="text-align: right!important;">' + item[x].totalamountex + '</td>' +
                                '<td contenteditable="false" class="colTax" style="text-align: right!important;">' + item[x].totaltax + '</td>' +
                                '<td contenteditable="false" class="colAmount" style="text-align: right!important;">' + item[x].totalamount + '</td>' +
                                '<td contenteditable="false" class="colPaid" style="text-align: right!important;">' + item[x].totalpaid + '</td>' +
                                '<td contenteditable="false" class="colBalanceOutstanding" style="text-align: right!important;">' + item[x].totaloustanding + '</td>' +
                                '<td contenteditable="false" class="colStatus">' + item[x].orderstatus + '</td>' +
                                '<td contenteditable="false" class="colSaleCustField1 hiddenColumn">' + item[x].custfield1 + '</td>' +
                                '<td contenteditable="false" class="colSaleCustField2 hiddenColumn">' + item[x].custfield2 + '</td>' +
                                '<td contenteditable="false" class="colEmployee hiddenColumn">' + item[x].employee + '</td>' +
                                '<td contenteditable="false" class="colComments">' + item[x].comments + '</td>' +
                                '</tr>');

                        }
                        $('.dataTables_info').html('Showing 1 to ' + data.tbillex.length + ' of ' + data.tbillex.length + ' entries');
                        setTimeout(function() {
                        	makeNegativeGlobal();
                        }, 100);
                    } else {
                    $('.fullScreenSpin').css('display', 'none');
                    swal({
                        title: 'Question',
                        text: "Bill does not exist, would you like to create it?",
                        type: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Yes',
                        cancelButtonText: 'No'
                    }).then((result) => {
                        if (result.value) {
                            FlowRouter.go('/billcard');
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
    'click .resetTable' : function(event){
      let templateObject = Template.instance();
      let reset_data = templateObject.reset_data.get();
      reset_data = reset_data.filter(redata => redata.display);

      $(".displaySettings").each(function (index) {
        let $tblrow = $(this);
        $tblrow.find(".divcolumn").text(reset_data[index].label);
        $tblrow.find(".custom-control-input").prop("checked", reset_data[index].active);

        let title = $("#tblbilllist").find("th").eq(index+1);
        $(title).html(reset_data[index].label);

        if (reset_data[index].active) {
          $('.col' + reset_data[index].class).addClass('showColumn');
          $('.col' + reset_data[index].class).removeClass('hiddenColumn');
        } else {
          $('.col' + reset_data[index].class).addClass('hiddenColumn');
          $('.col' + reset_data[index].class).removeClass('showColumn');
        }
        $(".rngRange" + reset_data[index].class).val('');
      });
    },

    'click .saveTable' : async function(event){
      let lineItems = [];
      $(".fullScreenSpin").css("display", "inline-block");

      $(".displaySettings").each(function (index) {
        var $tblrow = $(this);
        var fieldID = $tblrow.attr("custid") || 0;
        var colTitle = $tblrow.find(".divcolumn").text() || "";
        var colWidth = $tblrow.find(".custom-range").val() || 0;
        var colthClass = $tblrow.find(".divcolumn").attr("valueupdate") || "";
        var colHidden = false;
        if ($tblrow.find(".custom-control-input").is(":checked")) {
          colHidden = true;
        } else {
          colHidden = false;
        }
        let lineItemObj = {
          index: parseInt(fieldID),
          label: colTitle,
          active: colHidden,
          width: parseInt(colWidth),
          class: colthClass,
          display: true
        };

        lineItems.push(lineItemObj);
      });

      let templateObject = Template.instance();
      let reset_data = templateObject.reset_data.get();
      reset_data = reset_data.filter(redata => redata.display == false);
      lineItems.push(...reset_data);
      lineItems.sort((a,b) => a.index - b.index);

      try {
        let erpGet = erpDb();
        let tableName = "tblbilllist";
        let employeeId = parseInt(Session.get('mySessionEmployeeLoggedID'))||0;
        let added = await sideBarService.saveNewCustomFields(erpGet, tableName, employeeId, lineItems);
        $(".fullScreenSpin").css("display", "none");
        if(added) {
          sideBarService.getNewCustomFieldsWithQuery(parseInt(Session.get('mySessionEmployeeLoggedID')),'').then(function (dataCustomize) {
              addVS1Data('VS1_Customize', JSON.stringify(dataCustomize));
          });
            swal({
              title: 'SUCCESS',
              text: "Display settings is updated!",
              type: 'success',
              showCancelButton: false,
              confirmButtonText: 'OK'
            }).then((result) => {
                if (result.value) {
                  $('#myModal2').modal('hide');
                }
            });
        } else {
          swal("Something went wrong!", "", "error");
        }
      } catch (error) {
        $(".fullScreenSpin").css("display", "none");
        swal("Something went wrong!", "", "error");
      }
    },
    // 'blur .divcolumn' : function(event){
    //     let columData = $(event.target).text();
    //     let columnDatanIndex = $(event.target).closest("div.columnSettings").attr('id');
    //     var datable = $('#tblbilllist').DataTable();
    //     var title = datable.column( columnDatanIndex ).header();
    //     $(title).html(columData);

    // },


    'click .chkSaleDate': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colSaleDate').addClass('showColumn');
        $('.colSaleDate').removeClass('hiddenColumn');
      } else {
        $('.colSaleDate').addClass('hiddenColumn');
        $('.colSaleDate').removeClass('showColumn');
      }
    },
    'click .chkSalesNo': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colSalesNo').addClass('showColumn');
        $('.colSalesNo').removeClass('hiddenColumn');
      } else {
        $('.colSalesNo').addClass('hiddenColumn');
        $('.colSalesNo').removeClass('showColumn');
      }
    },
    'click .chkDueDate': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colDueDate').addClass('showColumn');
        $('.colDueDate').removeClass('hiddenColumn');
      } else {
        $('.colDueDate').addClass('hiddenColumn');
        $('.colDueDate').removeClass('showColumn');
      }
    },
    'click .chkCustomer': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colCustomer').addClass('showColumn');
        $('.colCustomer').removeClass('hiddenColumn');
      } else {
        $('.colCustomer').addClass('hiddenColumn');
        $('.colCustomer').removeClass('showColumn');
      }
    },
    'click .chkAmountEx': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colAmountEx').addClass('showColumn');
        $('.colAmountEx').removeClass('hiddenColumn');
      } else {
        $('.colAmountEx').addClass('hiddenColumn');
        $('.colAmountEx').removeClass('showColumn');
      }
    },
    'click .chkTax': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colTax').addClass('showColumn');
        $('.colTax').removeClass('hiddenColumn');
      } else {
        $('.colTax').addClass('hiddenColumn');
        $('.colTax').removeClass('showColumn');
      }
    },
    // displaysettings
    'click .chkAmount': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colAmount').addClass('showColumn');
        $('.colAmount').removeClass('hiddenColumn');
      } else {
        $('.colAmount').addClass('hiddenColumn');
        $('.colAmount').removeClass('showColumn');
      }
    },
    'click .chkPaid': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colPaid').addClass('showColumn');
        $('.colPaid').removeClass('hiddenColumn');
      } else {
        $('.colPaid').addClass('hiddenColumn');
        $('.colPaid').removeClass('showColumn');
      }
    },

    'click .chkBalanceOutstanding': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colBalanceOutstanding').addClass('showColumn');
        $('.colBalanceOutstanding').removeClass('hiddenColumn');
      } else {
          $('.colBalanceOutstanding').addClass('hiddenColumn');
          $('.colBalanceOutstanding').removeClass('showColumn');
      }
    },
    'click .chkStatus': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colStatus').addClass('showColumn');
        $('.colStatus').removeClass('hiddenColumn');
      } else {
        $('.colStatus').addClass('hiddenColumn');
        $('.colStatus').removeClass('showColumn');
      }
    },
    'click .chkEmployee': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colEmployee').addClass('showColumn');
        $('.colEmployee').removeClass('hiddenColumn');
      } else {
        $('.colEmployee').addClass('hiddenColumn');
        $('.colEmployee').removeClass('showColumn');
      }
    },
    'click .chkComments': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colComments').addClass('showColumn');
        $('.colComments').removeClass('hiddenColumn');
      } else {
        $('.colComments').addClass('hiddenColumn');
        $('.colComments').removeClass('showColumn');
      }
    },
    'click .chkPONumber': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colPONumber').addClass('showColumn');
        $('.colPONumber').removeClass('hiddenColumn');
      } else {
        $('.colPONumber').addClass('hiddenColumn');
        $('.colPONumber').removeClass('showColumn');
      }
    },
    'click .chkReference': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colReference').addClass('showColumn');
        $('.colReference').removeClass('hiddenColumn');
      } else {
        $('.colReference').addClass('hiddenColumn');
        $('.colReference').removeClass('showColumn');
      }
    },
    'click .chkConverted': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colConverted').addClass('showColumn');
        $('.colConverted').removeClass('hiddenColumn');
      } else {
        $('.colConverted').addClass('hiddenColumn');
        $('.colConverted').removeClass('showColumn');
      }
    },


    'click .chkOrderDate': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colOrderDate').addClass('showColumn');
        $('.colOrderDate').removeClass('hiddenColumn');
      } else {
          $('.colOrderDate').addClass('hiddenColumn');
          $('.colOrderDate').removeClass('showColumn');
      }
    },

    'click .chkPurchaseNo': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colPurchaseNo').addClass('showColumn');
        $('.colPurchaseNo').removeClass('hiddenColumn');
      } else {
          $('.colPurchaseNo').addClass('hiddenColumn');
          $('.colPurchaseNo').removeClass('showColumn');
      }
    },

    'click .chkSupplier': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colSupplier').addClass('showColumn');
        $('.colSupplier').removeClass('hiddenColumn');
      } else {
          $('.colSupplier').addClass('hiddenColumn');
          $('.colSupplier').removeClass('showColumn');
      }
    },
    // display settings


    'change .rngRangeSaleDate': function(event) {
        let range = $(event.target).val();
        $('.colSaleDate').css('width', range);
    },
    'change .rngRangeSalesNo': function(event) {
        let range = $(event.target).val();
        $('.colSalesNo').css('width', range);
    },
    'change .rngRangeDueDate': function(event) {
        let range = $(event.target).val();
        $('.colDueDate').css('width', range);
    },
    'change .rngRangeUnitPriceInc': function(event) {
        let range = $(event.target).val();
        $('.colUnitPriceInc').css('width', range);
    },
    'change .rngRangeUnitPriceEx': function(event) {
        let range = $(event.target).val();
        $('.colUnitPriceEx').css('width', range);
    },
    'change .rngRangeTax': function(event) {
        let range = $(event.target).val();
        $('.colTax').css('width', range);
    },
    'change .rngRangeAmountInc': function (event) {
        let range = $(event.target).val();
        $('.colAmountInc').css('width', range);
    },
    'change .rngRangeAmountEx': function (event) {
        let range = $(event.target).val();
        $('.colAmountEx').css('width', range);
    },
    'change .rngRangePaid': function (event) {
        let range = $(event.target).val();
        $('.colPaid').css('width', range);
    },
    'change .rngRangeBalanceOutstanding': function (event) {
        let range = $(event.target).val();
        $('.colBalanceOutstanding').css('width', range);
    },
    'change .rngRangeStatus': function (event) {
        let range = $(event.target).val();
        $('.colStatus').css('width', range);
    },
    'change .rngRangeAmount': function (event) {
        let range = $(event.target).val();
        $('.colAmount').css('width', range);
    },
    'change .rngRangeCustomer': function(event) {
        let range = $(event.target).val();
        $('.colCustomer').css('width', range);
    },
    'change .rngRangeEmployee': function(event) {
        let range = $(event.target).val();
        $('.colEmployee').css('width', range);
    },
    'change .rngRangeComments': function(event) {
        let range = $(event.target).val();
        $('.colComments').css('width', range);
    },
    'change .rngRangePONumber': function(event) {
        let range = $(event.target).val();
        $('.colPONumber').css('width', range);
    },
    'change .rngRangeReference': function(event) {
        let range = $(event.target).val();
        $('.colReference').css('width', range);
    },
    'change .rngRangeConverted': function(event) {
        let range = $(event.target).val();
        $('.colConverted').css('width', range);
    },
    "blur .divcolumn": function (event) {
      let columData = $(event.target).html();
      let columHeaderUpdate = $(event.target).attr("valueupdate");
      $("th.col" + columHeaderUpdate + "").html(columData);
    },

    'change .rngRange' : function(event){
        let range = $(event.target).val();
        let columnDataValue = $(event.target).closest("div").prev().find(".divcolumn").text();
        var datable = $('#tblbilllist th');
        $.each(datable, function(i,v) {
            if(v.innerText == columnDataValue){
                let className = v.className;
                let replaceClass = className.replace(/ /g, ".");
                $("."+replaceClass+"").css('width',range+'px');

            }
        });

    },
    'click #exportbtn': function () {
        $('.fullScreenSpin').css('display','inline-block');
        jQuery('#tblbilllist_wrapper .dt-buttons .btntabletocsv').click();
        $('.fullScreenSpin').css('display','none');

    },
    'click .btnRefresh':  (e, ui) => {
      //ui.initPage(true);
        $('.fullScreenSpin').css('display','inline-block');
        let currentDate = new Date();
        let hours = currentDate.getHours();
        let minutes = currentDate.getMinutes();
        let seconds = currentDate.getSeconds();
        let month = (currentDate.getMonth()+1);
        let days = currentDate.getDate();

        if((currentDate.getMonth()+1) < 10){
            month = "0" + (currentDate.getMonth()+1);
        }

        if(currentDate.getDate() < 10){
            days = "0" + currentDate.getDate();
        }
        let currenctTodayDate = currentDate.getFullYear() + "-" + month + "-" + days + " "+ hours+ ":"+ minutes+ ":"+ seconds;
        let templateObject = Template.instance();

      var currentBeginDate = new Date();
      var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
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
      var toDate = currentBeginDate.getFullYear()+ "-" +(fromDateMonth) + "-"+(fromDateDay);
      let prevMonth11Date = (moment().subtract(reportsloadMonths, 'months')).format("YYYY-MM-DD");


      sideBarService.getAllBillExList(initialDataLoad,0).then(function(dataBill) {
          addVS1Data('TBillEx',JSON.stringify(dataBill)).then(function (datareturn) {

          }).catch(function (err) {

          });
      }).catch(function(err) {

      });

      sideBarService.getAllPurchaseOrderListAll(prevMonth11Date,toDate,true,initialReportLoad,0).then(function (data) {
        addVS1Data("TbillReport", JSON.stringify(data)).then(function (datareturn) {

          }).catch(function (err) {

          });
      }).catch(function (err) {

      });

      sideBarService.getAllPurchasesList(prevMonth11Date,toDate,true,initialReportLoad,0).then(function (dataPList) {
          addVS1Data("TPurchasesList", JSON.stringify(dataPList)).then(function (datareturnPlist) {

            }).catch(function (err) {

            });
        }).catch(function (err) {

        });

      sideBarService.getAllBillListData(prevMonth11Date,toDate, true,initialReportLoad,0).then(function(dataBillList) {
          addVS1Data('TBillList',JSON.stringify(dataBillList)).then(function (datareturn) {
            sideBarService.getTPaymentList(prevMonth11Date, toDate, true, initialReportLoad, 0, '').then(function(dataPaymentList) {
            addVS1Data('TPaymentList', JSON.stringify(dataPaymentList)).then(function(datareturn) {
                sideBarService.getAllTSupplierPaymentListData(prevMonth11Date, toDate, true, initialReportLoad, 0).then(function(dataSuppPay) {
                    addVS1Data('TSupplierPaymentList', JSON.stringify(dataSuppPay)).then(function(datareturn) {
                        sideBarService.getAllTCustomerPaymentListData(prevMonth11Date, toDate, true, initialReportLoad, 0).then(function(dataCustPay) {
                            addVS1Data('TCustomerPaymentList', JSON.stringify(dataCustPay)).then(function(datareturn) {
                              setTimeout(function () {
                                window.open('/billlist', '_self');
                              }, 2000);
                            }).catch(function(err) {
                              setTimeout(function () {
                                window.open('/billlist', '_self');
                              }, 2000);
                            });
                        }).catch(function(err) {
                          setTimeout(function () {
                            window.open('/billlist', '_self');
                          }, 2000);
                        });
                    }).catch(function(err) {
                        setTimeout(function () {
                            window.open('/billlist', '_self');
                         }, 2000);
                    });
                }).catch(function(err) {
                  setTimeout(function () {
                    window.open('/billlist', '_self');
                  }, 2000);
                });
            }).catch(function(err) {
              setTimeout(function () {
                window.open('/billlist', '_self');
              }, 2000);
            });
        }).catch(function(err) {
          setTimeout(function () {
            window.open('/billlist', '_self');
          }, 2000);

        });
          }).catch(function (err) {
            sideBarService.getAllBillExList(initialDataLoad,0).then(function(dataBill) {
                addVS1Data('TBillEx',JSON.stringify(dataBill)).then(function (datareturn) {
                    window.open('/billlist','_self');
                }).catch(function (err) {
                    window.open('/billlist','_self');
                });
            }).catch(function(err) {
                window.open('/billlist','_self');
            });
          });
      }).catch(function(err) {
        window.open('/billlist','_self');
      });


    },
    'change #dateTo': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        setTimeout(function(){
        var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        var dateTo = new Date($("#dateTo").datepicker("getDate"));

        let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
        let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();

        //  templateObject.getAgedPayableReports(formatDateFrom,formatDateTo,false);
        var formatDate = dateTo.getDate() + "/" + (dateTo.getMonth() + 1) + "/" + dateTo.getFullYear();
        //templateObject.dateAsAt.set(formatDate);
        if (($("#dateFrom").val().replace(/\s/g, '') == "") && ($("#dateFrom").val().replace(/\s/g, '') == "")) {

        } else {
            templateObject.getAllFilterBillData(formatDateFrom, formatDateTo, false);
        }
        },500);
    },
    'change #dateFrom': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        setTimeout(function(){
        var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        var dateTo = new Date($("#dateTo").datepicker("getDate"));

        let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
        let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();

        //  templateObject.getAgedPayableReports(formatDateFrom,formatDateTo,false);
        var formatDate = dateTo.getDate() + "/" + (dateTo.getMonth() + 1) + "/" + dateTo.getFullYear();
        //templateObject.dateAsAt.set(formatDate);
        if (($("#dateFrom").val().replace(/\s/g, '') == "") && ($("#dateFrom").val().replace(/\s/g, '') == "")) {

        } else {
            templateObject.getAllFilterBillData(formatDateFrom, formatDateTo, false);
        }
        },500);
    },
    'click #today': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var currentBeginDate = new Date();
        var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
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
        var toDateERPFrom = currentBeginDate.getFullYear()+ "-" +(fromDateMonth) + "-"+(fromDateDay);
        var toDateERPTo = currentBeginDate.getFullYear()+ "-" +(fromDateMonth) + "-"+(fromDateDay);

        var toDateDisplayFrom = (fromDateDay)+ "/" +(fromDateMonth) + "/"+currentBeginDate.getFullYear();
        var toDateDisplayTo = (fromDateDay)+ "/" +(fromDateMonth) + "/"+currentBeginDate.getFullYear();

        $("#dateFrom").val(toDateDisplayFrom);
        $("#dateTo").val(toDateDisplayTo);
        templateObject.getAllFilterBillData(toDateERPFrom,toDateERPTo, false);
    },
    'click #lastweek': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var currentBeginDate = new Date();
        var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
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
        var toDateERPFrom = currentBeginDate.getFullYear()+ "-" +(fromDateMonth) + "-"+(fromDateDay - 7);
        var toDateERPTo = currentBeginDate.getFullYear()+ "-" +(fromDateMonth) + "-"+(fromDateDay);

        var toDateDisplayFrom = (fromDateDay -7)+ "/" +(fromDateMonth) + "/"+currentBeginDate.getFullYear();
        var toDateDisplayTo = (fromDateDay)+ "/" +(fromDateMonth) + "/"+currentBeginDate.getFullYear();

        $("#dateFrom").val(toDateDisplayFrom);
        $("#dateTo").val(toDateDisplayTo);
        templateObject.getAllFilterBillData(toDateERPFrom,toDateERPTo, false);
    },
    'click #lastMonth': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var currentDate = new Date();

        var prevMonthLastDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        var prevMonthFirstDate = new Date(currentDate.getFullYear() - (currentDate.getMonth() > 0 ? 0 : 1), (currentDate.getMonth() - 1 + 12) % 12, 1);

        var formatDateComponent = function(dateComponent) {
          return (dateComponent < 10 ? '0' : '') + dateComponent;
        };

        var formatDate = function(date) {
          return  formatDateComponent(date.getDate()) + '/' + formatDateComponent(date.getMonth() + 1) + '/' + date.getFullYear();
        };

        var formatDateERP = function(date) {
          return  date.getFullYear() + '-' + formatDateComponent(date.getMonth() + 1) + '-' + formatDateComponent(date.getDate());
        };


        var fromDate = formatDate(prevMonthFirstDate);
        var toDate = formatDate(prevMonthLastDate);

        $("#dateFrom").val(fromDate);
        $("#dateTo").val(toDate);

        var getLoadDate = formatDateERP(prevMonthLastDate);
        let getDateFrom = formatDateERP(prevMonthFirstDate);
        templateObject.getAllFilterBillData(getDateFrom, getLoadDate, false);
    },
    'click #lastQuarter': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var currentDate = new Date();
        var begunDate = moment(currentDate).format("DD/MM/YYYY");

        var begunDate = moment(currentDate).format("DD/MM/YYYY");

        function getQuarter(d) {
            d = d || new Date();
            var m = Math.floor(d.getMonth() / 3) + 2;
            return m > 4 ? m - 4 : m;
        }

        var quarterAdjustment = (moment().month() % 3) + 1;
        var lastQuarterEndDate = moment().subtract({
            months: quarterAdjustment
        }).endOf('month');
        var lastQuarterStartDate = lastQuarterEndDate.clone().subtract({
            months: 2
        }).startOf('month');

        var lastQuarterStartDateFormat = moment(lastQuarterStartDate).format("DD/MM/YYYY");
        var lastQuarterEndDateFormat = moment(lastQuarterEndDate).format("DD/MM/YYYY");


        $("#dateFrom").val(lastQuarterStartDateFormat);
        $("#dateTo").val(lastQuarterEndDateFormat);

        let fromDateMonth = getQuarter(currentDate);
        var quarterMonth = getQuarter(currentDate);
        let fromDateDay = currentDate.getDate();

        var getLoadDate = moment(lastQuarterEndDate).format("YYYY-MM-DD");
        let getDateFrom = moment(lastQuarterStartDateFormat).format("YYYY-MM-DD");
        templateObject.getAllFilterBillData(getDateFrom, getLoadDate, false);
    },
    'click #last12Months': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var currentDate = new Date();
        var begunDate = moment(currentDate).format("DD/MM/YYYY");

        let fromDateMonth = Math.floor(currentDate.getMonth() + 1);
        let fromDateDay = currentDate.getDate();
        if ((currentDate.getMonth() + 1) < 10) {
            fromDateMonth = "0" + (currentDate.getMonth() + 1);
        }
        if (currentDate.getDate() < 10) {
            fromDateDay = "0" + currentDate.getDate();
        }

        var fromDate = fromDateDay + "/" + (fromDateMonth) + "/" + Math.floor(currentDate.getFullYear() - 1);
        $("#dateFrom").val(fromDate);
        $("#dateTo").val(begunDate);

        var currentDate2 = new Date();
        if ((currentDate2.getMonth() + 1) < 10) {
            fromDateMonth2 = "0" + Math.floor(currentDate2.getMonth() + 1);
        }
        if (currentDate2.getDate() < 10) {
            fromDateDay2 = "0" + currentDate2.getDate();
        }
        var getLoadDate = moment(currentDate2).format("YYYY-MM-DD");
        let getDateFrom = Math.floor(currentDate2.getFullYear() - 1) + "-" + fromDateMonth2 + "-" + currentDate2.getDate();
        templateObject.getAllFilterBillData(getDateFrom, getLoadDate, false);

    },
    'click #ignoreDate': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', true);
        $('#dateTo').attr('readonly', true);
        templateObject.getAllFilterBillData('', '', true);
    },
    'click .printConfirm' : function(event){
        playPrintAudio();
        setTimeout(function(){
        $('.fullScreenSpin').css('display','inline-block');
        jQuery('#tblbilllist_wrapper .dt-buttons .btntabletopdf').click();
        $('.fullScreenSpin').css('display','none');
      }, delayTimeAfterSound);
    }

});

Template.billlist.helpers({
    datatablerecords : () => {
        return Template.instance().datatablerecords.get().sort(function(a, b){
            if (a.orderdate == 'NA') {
                return 1;
            }
            else if (b.orderdate == 'NA') {
                return -1;
            }
            return (a.orderdate.toUpperCase() > b.orderdate.toUpperCase()) ? 1 : -1;
        });
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    purchasesCloudPreferenceRec: () => {
        return CloudPreference.findOne({userid:Session.get('mycloudLogonID'),PrefName:'tblbilllist'});
    },


  // custom fields displaysettings
  custfields: () => {
    return Template.instance().custfields.get();
  },

  // custom fields displaysettings
  displayfields: () => {
    return Template.instance().displayfields.get();
  },
  bills: () => {
    return Template.instance().bills.get();
  },
  formatDate: (date) => GlobalFunctions.formatDate(date),
  formatPrice: (price) => GlobalFunctions.formatPrice(price)

});
