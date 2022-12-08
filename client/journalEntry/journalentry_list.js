import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../js/core-service';
import {EmployeeProfileService} from "../js/profile-service";
import {AccountService} from "../accounts/account-service";
import {UtilityService} from "../utility-service";
import { SideBarService } from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
import LoadingOverlay from '../LoadingOverlay';
import GlobalFunctions from '../GlobalFunctions';
import { TaxRateService } from '../settings/settings-service';
import FxGlobalFunctions from '../packages/currency/FxGlobalFunctions';
import CachedHttp from '../lib/global/CachedHttp';
import erpObject from '../lib/global/erp-objects';


let utilityService = new UtilityService();
let sideBarService = new SideBarService();
let taxRateService = new TaxRateService();

let defaultCurrencyCode = CountryAbbr;


Template.journalentrylist.onCreated(function(){
  const templateObject = Template.instance();
  templateObject.datatablerecords = new ReactiveVar([]);
  templateObject.tableheaderrecords = new ReactiveVar([]);
  templateObject.custfields = new ReactiveVar([]);
  templateObject.displayfields = new ReactiveVar([]);
  templateObject.reset_data = new ReactiveVar([]);

  // Currency related vars //
  FxGlobalFunctions.initVars(templateObject);

});

Template.journalentrylist.onRendered(function() {
  $('.fullScreenSpin').css('display','inline-block');
  let templateObject = Template.instance();
  let accountService = new AccountService();
  const customerList = [];
  let salesOrderTable;
  var splashArray = new Array();
  const dataTableList = [];
  const tableHeaderList = [];
  if(FlowRouter.current().queryParams.success){
    $('.btnRefresh').addClass('btnRefreshAlert');
  }

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



  // set initial table rest_data
  function init_reset_data() {
    let reset_data = [
      { index: 0, label: 'Transaction Date', class:'colAccountName', active: true, display: true, width: "85" },
      { index: 1, label: 'Account Name', class:'colAccountName', active: true, display: true, width: "" },
      { index: 2, label: 'Department Name', class:'colAccountName', active: true, display: true, width: "" },
      { index: 3, label: 'Entry No', class:'colAccountName', active: true, display: true, width: "" },
      { index: 4, label: 'Debit Amount', class:'colAccountName', active: true, display: true, width: "" },
      { index: 5, label: 'Credit Amount', class:'colAccountName', active: true, display: true, width: "" },
      { index: 6, label: 'Tax Amount', class:'colAccountName', active: true, display: true, width: "" },
      { index: 7, label: 'Account No', class:'colAccountName', active: false, display: true, width: "" },
      { index: 8, label: 'Employee Name', class:'colAccountName', active: false, display: true, width: "" },
      { index: 9, label: 'Approved', class:'colAccountName', active: false, display: true, width: "" },
      { index: 10, label: 'Journal Memo', class:'colAccountName', active: false, display: true, width: "" },
      { index: 11, label: 'Memo', class:'colAccountName', active: false, display: true, width: "" },
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
      // getVS1Data("VS1_Customize").then(function (dataObject) {
      //   if (dataObject.length == 0) {
      //     sideBarService.getNewCustomFieldsWithQuery(parseInt(Session.get('mySessionEmployeeLoggedID')), listType).then(function (data) {
      //         // reset_data = data.ProcessLog.CustomLayout.Columns;
      //         reset_data = data.ProcessLog.Obj.CustomLayout[0].Columns;
      //         templateObject.showCustomFieldDisplaySettings(reset_data);
      //     }).catch(function (err) {
      //     });
      //   } else {
      //     let data = JSON.parse(dataObject[0].data);
      //     if(data.ProcessLog.Obj.CustomLayout.length > 0){
      //      for (let i = 0; i < data.ProcessLog.Obj.CustomLayout.length; i++) {
      //        if(data.ProcessLog.Obj.CustomLayout[i].TableName == listType){
      //          reset_data = data.ProcessLog.Obj.CustomLayout[i].Columns;
      //          templateObject.showCustomFieldDisplaySettings(reset_data);
      //        }
      //      }
      //    };
      //     // handle process here
      //   }
      // });
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
  templateObject.initCustomFieldDisplaySettings("", "tblJournalList");


  templateObject.resetData = function (dataVal) {
      window.open('/journalentrylist?page=last', '_self');
  }

  templateObject.loadReport = async () => {
    var currentBeginDate = new Date();
    var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
    let fromDateMonth = currentBeginDate.getMonth() + 1;
    let fromDateDay = currentBeginDate.getDate();
    if (currentBeginDate.getMonth() + 1 < 10) {
      fromDateMonth = "0" + (
      currentBeginDate.getMonth() + 1);
    } else {
      fromDateMonth = currentBeginDate.getMonth() + 1;
    }

    if (currentBeginDate.getDate() < 10) {
      fromDateDay = "0" + currentBeginDate.getDate();
    }
    var toDate = currentBeginDate.getFullYear() + "-" + fromDateMonth + "-" + fromDateDay;
    let prevMonth11Date = moment().subtract(reportsloadMonths, "months").format("YYYY-MM-DD");

    let data = await CachedHttp.get(erpObject.TJournalEntryList, async () => {
      return await sideBarService.getTJournalEntryListData(prevMonth11Date, toDate, true, initialReportLoad, 0);
    }, {
      useIndexDb: true,
      useLocalStorage: false,
      fallBackToLocal: true,
      validate: cachedResponse => {
        return true;
      }
    });

    data = data.response;

    if (data.Params.IgnoreDates == true) {
      $("#dateFrom").attr("readonly", true);
      $("#dateTo").attr("readonly", true);
      //FlowRouter.go('/journalentrylist?ignoredate=true');
    } else {
      $("#dateFrom").attr("readonly", false);
      $("#dateTo").attr("readonly", false);
      $("#dateFrom").val(
        data.Params.DateFrom != ""
        ? moment(data.Params.DateFrom).format("DD/MM/YYYY")
        : data.Params.DateFrom);
      $("#dateTo").val(
        data.Params.DateTo != ""
        ? moment(data.Params.DateTo).format("DD/MM/YYYY")
        : data.Params.DateTo);
    }

    for (let i = 0; i < data.tjournalentrylist.length; i++) {
      let totalDebitAmount = utilityService.modifynegativeCurrencyFormat(data.tjournalentrylist[i].DebitAmount) || 0.0;
      let totalCreditAmount = utilityService.modifynegativeCurrencyFormat(data.tjournalentrylist[i].CreditAmount) || 0.0;
      // Currency+''+data.tjournalentry[i].TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
      let totalTaxAmount = utilityService.modifynegativeCurrencyFormat(data.tjournalentrylist[i].TaxAmount) || 0.0;
      let orderstatus = data.tjournalentrylist[i].Deleted || "";
      if (data.tjournalentrylist[i].Deleted == true) {
        orderstatus = "Deleted";
      } else if (data.tjournalentrylist[i].IsOnHOLD == true) {
        orderstatus = "On Hold";
      } else if (data.tjournalentrylist[i].Reconciled == true) {
        orderstatus = "Rec";
      }

      var dataList = {
        id: data.tjournalentrylist[i].GJID || "",
        employee: data.tjournalentrylist[i].EmployeeName || "",
        sortdate: data.tjournalentrylist[i].TransactionDate != ""
          ? moment(data.tjournalentrylist[i].TransactionDate).format("YYYY/MM/DD")
          : data.tjournalentrylist[i].TransactionDate,
        transactiondate: data.tjournalentrylist[i].TransactionDate != ""
          ? moment(data.tjournalentrylist[i].TransactionDate).format("DD/MM/YYYY")
          : data.tjournalentrylist[i].TransactionDate,
        accountname: data.tjournalentrylist[i].AccountName || "",
        department: data.tjournalentrylist[i].ClassName || "",
        entryno: data.tjournalentrylist[i].GJID || "",
        debitamount: totalDebitAmount || 0.0,
        creditamount: totalCreditAmount || 0.0,
        taxamount: totalTaxAmount || 0.0,
        orderstatus: orderstatus || "",
        accountno: data.tjournalentrylist[i].AccountNumber || "",
        employeename: data.tjournalentrylist[i].EmployeeName || "",

        memo: data.tjournalentrylist[i].Memo || ""
      };
      dataTableList.push(dataList);
      templateObject.datatablerecords.set(dataTableList);
    }

    if (templateObject.datatablerecords.get()) {
      setTimeout(function () {
        MakeNegative();
      }, 100);
    }

    LoadingOverlay.hide();
    setTimeout(function () {
      //$.fn.dataTable.moment('DD/MM/YY');
      $("#tblJournalList").DataTable({
        // dom: 'lBfrtip',

        columnDefs: [
          {
            type: "date",
            targets: 0
          }
        ],
        sDom: "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
        buttons: [
          {
            extend: "excelHtml5",
            text: "",
            download: "open",
            className: "btntabletocsv hiddenColumn",
            filename: "journalentrylist_" + moment().format(),
            orientation: "portrait",
            exportOptions: {
              columns: ":visible"
            }
          }, {
            extend: "print",
            download: "open",
            className: "btntabletopdf hiddenColumn",
            text: "",
            title: "Journal Entries",
            filename: "journalentrylist_" + moment().format(),
            exportOptions: {
              columns: ":visible"
            }
          }
        ],
        select: true,
        destroy: true,
        colReorder: true,

        pageLength: initialDatatableLoad,
        bLengthChange: false,
        info: true,
        responsive: true,
        order: [
          [
            0, "desc"
          ],
          [
            2, "desc"
          ]
        ],
        // "aaSorting": [[1,'desc']],
        action: function () {
          $("#tblJournalList").DataTable().ajax.reload();
        },
        fnDrawCallback: function (oSettings) {
          let checkurlIgnoreDate = FlowRouter.current().queryParams.ignoredate;

          $(".paginate_button.page-item").removeClass("disabled");
          $("#tblJournalList_ellipsis").addClass("disabled");

          if (oSettings._iDisplayLength == -1) {
            if (oSettings.fnRecordsDisplay() > 150) {
              $(".paginate_button.page-item.previous").addClass("disabled");
              $(".paginate_button.page-item.next").addClass("disabled");
            }
          } else {}
          if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
            $(".paginate_button.page-item.next").addClass("disabled");
          }

          $(".paginate_button.next:not(.disabled)", this.api().table().container()).on("click", function () {
            $(".fullScreenSpin").css("display", "inline-block");
            let dataLenght = oSettings._iDisplayLength;
            var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
            var dateTo = new Date($("#dateTo").datepicker("getDate"));

            let formatDateFrom = dateFrom.getFullYear() + "-" + (
            dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
            let formatDateTo = dateTo.getFullYear() + "-" + (
            dateTo.getMonth() + 1) + "-" + dateTo.getDate();
            if (data.Params.IgnoreDates == true) {
              sideBarService.getTJournalEntryListData(formatDateFrom, formatDateTo, true, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (dataObjectnew) {
                getVS1Data("TJournalEntryList").then(function (dataObjectold) {
                  if (dataObjectold.length == 0) {} else {
                    let dataOld = JSON.parse(dataObjectold[0].data);

                    var thirdaryData = $.merge($.merge([], dataObjectnew.tjournalentrylist), dataOld.tjournalentrylist);
                    let objCombineData = {
                      Params: dataOld.Params,
                      tjournalentrylist: thirdaryData
                    };

                    addVS1Data("TJournalEntryList", JSON.stringify(objCombineData)).then(function (datareturn) {
                      templateObject.resetData(objCombineData);
                      LoadingOverlay.hide();
                    }).catch(function (err) {
                      LoadingOverlay.hide();
                    });
                  }
                }).catch(function (err) {});
              }).catch(function (err) {
                LoadingOverlay.hide();
              });
            } else {
              sideBarService.getTJournalEntryListData(formatDateFrom, formatDateTo, false, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (dataObjectnew) {
                getVS1Data("TJournalEntryList").then(function (dataObjectold) {
                  if (dataObjectold.length == 0) {} else {
                    let dataOld = JSON.parse(dataObjectold[0].data);

                    var thirdaryData = $.merge($.merge([], dataObjectnew.tjournalentrylist), dataOld.tjournalentrylist);
                    let objCombineData = {
                      Params: dataOld.Params,
                      tjournalentrylist: thirdaryData
                    };

                    addVS1Data("TJournalEntryList", JSON.stringify(objCombineData)).then(function (datareturn) {
                      templateObject.resetData(objCombineData);
                      LoadingOverlay.hide();
                    }).catch(function (err) {
                      LoadingOverlay.hide();
                    });
                  }
                }).catch(function (err) {});
              }).catch(function (err) {
                LoadingOverlay.hide();
              });
            }
          });

          setTimeout(function () {
            MakeNegative();
          }, 100);
        },
        language: {
          search: "",
          searchPlaceholder: "Search List..."
        },
        fnInitComplete: function () {
          this.fnPageChange("last");
          if (data.Params.Search.replace(/\s/g, "") == "") {
            $("<button class='btn btn-danger btnHideDeleted' type='button' id='btnHideDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 14px !important;'><i class='far fa-check-circle' style='margin-right: 5px'></i>Hide Deleted</button>").insertAfter("#tblBankingOverview_filter");
          } else {
            $("<button class='btn btn-primary btnViewDeleted' type='button' id='btnViewDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 14px !important;'><i class='fa fa-trash' style='margin-right: 5px'></i>View Deleted</button>").insertAfter("#tblBankingOverview_filter");
          }
          $("<button class='btn btn-primary btnRefreshJournalEntry' type='button' id='btnRefreshJournalEntry' style='padding: 4px 10px; font-size: 16px; margin-left: 14px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblJournalList_filter");
          $(".myvarFilterForm").appendTo(".colDateFilter");
        },
        fnInfoCallback: function (oSettings, iStart, iEnd, iMax, iTotal, sPre) {
          let countTableData = data.Params.Count || 0; //get count from API data

          return "Showing " + iStart + " to " + iEnd + " of " + countTableData;
        }
      }).on("page", function () {
        setTimeout(function () {
          MakeNegative();
        }, 100);
        let draftRecord = templateObject.datatablerecords.get();
        templateObject.datatablerecords.set(draftRecord);
      }).on("column-reorder", function () {});
      LoadingOverlay.hide();
    }, 100);

    var columns = $("#tblJournalList th");
    let sTible = "";
    let sWidth = "";
    let sIndex = "";
    let sVisible = "";
    let columVisible = false;
    let sClass = "";
    $.each(columns, function (i, v) {
      if (v.hidden == false) {
        columVisible = true;
      }
      if (v.className.includes("hiddenColumn")) {
        columVisible = false;
      }
      sWidth = v.style.width.replace("px", "");

      let datatablerecordObj = {
        sTitle: v.innerText || "",
        sWidth: sWidth || "",
        sIndex: v.cellIndex || 0,
        sVisible: columVisible || false,
        sClass: v.className || ""
      };
      tableHeaderList.push(datatablerecordObj);
    });
    templateObject.tableheaderrecords.set(tableHeaderList);
    $("div.dataTables_filter input").addClass("form-control form-control-sm");
    $("#tblJournalList tbody").on("click", "tr", function () {
      var listData = $(this).closest("tr").attr("id");
      var checkDeleted = $(this).closest("tr").find(".colStatus").text() || "";

      if (listData) {
        if (checkDeleted == "Deleted") {
          swal("You Cannot View This Transaction", "Because It Has Been Deleted", "info");
        } else {
          FlowRouter.go("/journalentrycard?id=" + listData);
        }
      }
    });

    // setTimeout(() => {
    //   $('#tblJournalList').DataTable({
    //     sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
    //     select: true,
    //     destroy: true,
    //     colReorder: true,
    //     pageLength: 25,
    //     paging: true,
    //     info: true,
    //     responsive: true,
    //     order: [
    //       [0, "asc"]
    //     ],
    //     action: function () {
    //       $("#tblJournalList").DataTable().ajax.reload();
    //     },
    //   });
    // }, 500)
  };

  /**
   * @deprecated
   */
  templateObject.getAllJournalEntryData = function () {

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

    getVS1Data("TJournalEntryList").then(function (dataObject) {
      if (dataObject.length == 0) {
        sideBarService.getTJournalEntryListData(prevMonth11Date, toDate, true, initialReportLoad, 0).then(function (data) {
          let lineItems = [];
          let lineItemObj = {};
          addVS1Data("TJournalEntryList", JSON.stringify(data));
          if (data.Params.IgnoreDates == true) {
            $("#dateFrom").attr("readonly", true);
            $("#dateTo").attr("readonly", true);
            //FlowRouter.go('/journalentrylist?ignoredate=true');
          } else {
            $("#dateFrom").attr("readonly", false);
            $("#dateTo").attr("readonly", false);
            $("#dateFrom").val(
              data.Params.DateFrom != ""
              ? moment(data.Params.DateFrom).format("DD/MM/YYYY")
              : data.Params.DateFrom);
            $("#dateTo").val(
              data.Params.DateTo != ""
              ? moment(data.Params.DateTo).format("DD/MM/YYYY")
              : data.Params.DateTo);
          }
          for (let i = 0; i < data.tjournalentrylist.length; i++) {
            let totalDebitAmount = utilityService.modifynegativeCurrencyFormat(data.tjournalentrylist[i].DebitAmount) || 0.0;
            let totalCreditAmount = utilityService.modifynegativeCurrencyFormat(data.tjournalentrylist[i].CreditAmount) || 0.0;
            // Currency+''+data.tjournalentry[i].TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
            let totalTaxAmount = utilityService.modifynegativeCurrencyFormat(data.tjournalentrylist[i].TaxAmount) || 0.0;
            let orderstatus = data.tjournalentrylist[i].Deleted || "";
            if (data.tjournalentrylist[i].Deleted == true) {
              orderstatus = "Deleted";
            } else if (data.tjournalentrylist[i].IsOnHOLD == true) {
              orderstatus = "On Hold";
            } else if (data.tjournalentrylist[i].Reconciled == true) {
              orderstatus = "Rec";
            }

              var dataList = {
              id: data.tjournalentrylist[i].GJID || "",
              employee: data.tjournalentrylist[i].EmployeeName || "",
              sortdate: data.tjournalentrylist[i].TransactionDate != ""
                ? moment(data.tjournalentrylist[i].TransactionDate).format("YYYY/MM/DD")
                : data.tjournalentrylist[i].TransactionDate,
              transactiondate: data.tjournalentrylist[i].TransactionDate != ""
                ? moment(data.tjournalentrylist[i].TransactionDate).format("DD/MM/YYYY")
                : data.tjournalentrylist[i].TransactionDate,
              accountname: data.tjournalentrylist[i].AccountName || "",
              department: data.tjournalentrylist[i].ClassName || "",
              entryno: data.tjournalentrylist[i].GJID || "",
              debitamount: totalDebitAmount || 0.0,
              creditamount: totalCreditAmount || 0.0,
              taxamount: totalTaxAmount || 0.0,
              orderstatus: orderstatus || "",
              accountno: data.tjournalentrylist[i].AccountNumber || "",
              employeename: data.tjournalentrylist[i].EmployeeName || "",

                memo: data.tjournalentrylist[i].Memo || ""
            };
            dataTableList.push(dataList);
            templateObject.datatablerecords.set(dataTableList);
          }

            if (templateObject.datatablerecords.get()) {
            setTimeout(function () {
              MakeNegative();
            }, 100);
          }

          LoadingOverlay.hide();
          setTimeout(function () {
            //$.fn.dataTable.moment('DD/MM/YY');
            $("#tblJournalList").DataTable({
              // dom: 'lBfrtip',
              columnDefs: [
                {
                  type: "date",
                  targets: 0
            }
              ],
              sDom: "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
              buttons: [
                {
                  extend: "excelHtml5",
                  text: "",
                  download: "open",
                  className: "btntabletocsv hiddenColumn",
                  filename: "journalentrylist_" + moment().format(),
                  orientation: "portrait",
                  exportOptions: {
                    columns: ":visible"
                  }
                }, {
                  extend: "print",
                  download: "open",
                  className: "btntabletopdf hiddenColumn",
                  text: "",
                  title: "Journal Entries",
                  filename: "journalentrylist_" + moment().format(),
                  exportOptions: {
                    columns: ":visible"
                  }
                }
              ],
              select: true,
              destroy: true,
              colReorder: true,
              // bStateSave: true,
              // rowId: 0,
              pageLength: initialDatatableLoad,
              bLengthChange: false,
              info: true,
              responsive: true,
              order: [
                [
                  0, "desc"
                ],
                [
                  2, "desc"
                ]
              ],
              // "aaSorting": [[1,'desc']],
              action: function () {
                $("#tblJournalList").DataTable().ajax.reload();
              },
              fnDrawCallback: function (oSettings) {
                let checkurlIgnoreDate = FlowRouter.current().queryParams.ignoredate;

                  $(".paginate_button.page-item").removeClass("disabled");
                $("#tblJournalList_ellipsis").addClass("disabled");

                  if (oSettings._iDisplayLength == -1) {
                  if (oSettings.fnRecordsDisplay() > 150) {
                    $(".paginate_button.page-item.previous").addClass("disabled");
                    $(".paginate_button.page-item.next").addClass("disabled");
                  }
                } else {}
                if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                  $(".paginate_button.page-item.next").addClass("disabled");
                }

                  $(".paginate_button.next:not(.disabled)", this.api().table().container()).on("click", function () {
                  $(".fullScreenSpin").css("display", "inline-block");
                  let dataLenght = oSettings._iDisplayLength;
                  var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
                  var dateTo = new Date($("#dateTo").datepicker("getDate"));

                    let formatDateFrom = dateFrom.getFullYear() + "-" + (
                  dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
                  let formatDateTo = dateTo.getFullYear() + "-" + (
                  dateTo.getMonth() + 1) + "-" + dateTo.getDate();
                  if (data.Params.IgnoreDates == true) {
                    sideBarService.getTJournalEntryListData(formatDateFrom, formatDateTo, true, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (dataObjectnew) {
                      getVS1Data("TJournalEntryList").then(function (dataObjectold) {
                        if (dataObjectold.length == 0) {} else {
                          let dataOld = JSON.parse(dataObjectold[0].data);

                            var thirdaryData = $.merge($.merge([], dataObjectnew.tjournalentrylist), dataOld.tjournalentrylist);
                          let objCombineData = {
                            Params: dataOld.Params,
                            tjournalentrylist: thirdaryData
                          };

                            addVS1Data("TJournalEntryList", JSON.stringify(objCombineData)).then(function (datareturn) {
                            templateObject.resetData(objCombineData);
                            LoadingOverlay.hide();
                          }).catch(function (err) {
                            LoadingOverlay.hide();
                          });
                        }
                      }).catch(function (err) {});
                    }).catch(function (err) {
                      LoadingOverlay.hide();
                    });
                  } else {
                    sideBarService.getTJournalEntryListData(formatDateFrom, formatDateTo, false, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (dataObjectnew) {
                      getVS1Data("TJournalEntryList").then(function (dataObjectold) {
                        if (dataObjectold.length == 0) {} else {
                          let dataOld = JSON.parse(dataObjectold[0].data);

                            var thirdaryData = $.merge($.merge([], dataObjectnew.tjournalentrylist), dataOld.tjournalentrylist);
                          let objCombineData = {
                            Params: dataOld.Params,
                            tjournalentrylist: thirdaryData
                          };

                            addVS1Data("TJournalEntryList", JSON.stringify(objCombineData)).then(function (datareturn) {
                            templateObject.resetData(objCombineData);
                            LoadingOverlay.hide();
                          }).catch(function (err) {
                            LoadingOverlay.hide();
                          });
                        }
                      }).catch(function (err) {});
                    }).catch(function (err) {
                      LoadingOverlay.hide();
                    });
              }
                  });

                setTimeout(function () {
                  MakeNegative();
                }, 100);
                },
              language: {
                search: "",
                searchPlaceholder: "Search List..."
              },
              fnInitComplete: function () {
                this.fnPageChange("last");
                if (data.Params.Search.replace(/\s/g, "") == "") {
                  $("<button class='btn btn-danger btnHideDeleted' type='button' id='btnHideDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 14px !important;'><i class='far fa-check-circle' style='margin-right: 5px'></i>Hide Deleted</button>").insertAfter("#tblBankingOverview_filter");
                } else {
                  $("<button class='btn btn-primary btnViewDeleted' type='button' id='btnViewDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 14px !important;'><i class='fa fa-trash' style='margin-right: 5px'></i>View Deleted</button>").insertAfter("#tblBankingOverview_filter");
                }
                $("<button class='btn btn-primary btnRefreshJournalEntry' type='button' id='btnRefreshJournalEntry' style='padding: 4px 10px; font-size: 16px; margin-left: 14px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblJournalList_filter");
                $(".myvarFilterForm").appendTo(".colDateFilter");
              },
              fnInfoCallback: function (oSettings, iStart, iEnd, iMax, iTotal, sPre) {
                let countTableData = data.Params.Count || 0; //get count from API data

                return ("Showing " + iStart + " to " + iEnd + " of " + countTableData);
          }
            }).on("page", function () {
          setTimeout(function () {
                  MakeNegative();
              }, 100);
              let draftRecord = templateObject.datatablerecords.get();
              templateObject.datatablerecords.set(draftRecord);
            }).on("column-reorder", function () {});
            LoadingOverlay.hide();
          }, 0);

            var columns = $("#tblJournalList th");
          let sTible = "";
          let sWidth = "";
          let sIndex = "";
          let sVisible = "";
          let columVisible = false;
          let sClass = "";
          $.each(columns, function (i, v) {
            if (v.hidden == false) {
              columVisible = true;
            }
            if (v.className.includes("hiddenColumn")) {
              columVisible = false;
            }
            sWidth = v.style.width.replace("px", "");

              let datatablerecordObj = {
              sTitle: v.innerText || "",
              sWidth: sWidth || "",
              sIndex: v.cellIndex || 0,
              sVisible: columVisible || false,
              sClass: v.className || ""
            };
            tableHeaderList.push(datatablerecordObj);
          });
          templateObject.tableheaderrecords.set(tableHeaderList);
          $("div.dataTables_filter input").addClass("form-control form-control-sm");
          $("#tblJournalList tbody").on("click", "tr", function () {
            var listData = $(this).closest("tr").attr("id");
            var checkDeleted = $(this).closest("tr").find(".colStatus").text() || "";

              if (listData) {
              if (checkDeleted == "Deleted") {
                swal("You Cannot View This Transaction", "Because It Has Been Deleted", "info");
              } else {
                FlowRouter.go("/journalentrycard?id=" + listData);
              }
            }
          });
        }).catch(function (err) {
          // Bert.alert('<strong>' + err + '</strong>!', 'danger');
          LoadingOverlay.hide();
          // Meteor._reload.reload();
        });
      } else {
        let data = JSON.parse(dataObject[0].data);
        let useData = data.tjournalentrylist;
        let lineItems = [];
        let lineItemObj = {};
        if (data.Params.IgnoreDates == true) {
          $("#dateFrom").attr("readonly", true);
          $("#dateTo").attr("readonly", true);
          //FlowRouter.go('/journalentrylist?ignoredate=true');
        } else {
          $("#dateFrom").attr("readonly", false);
          $("#dateTo").attr("readonly", false);
          $("#dateFrom").val(
            data.Params.DateFrom != ""
            ? moment(data.Params.DateFrom).format("DD/MM/YYYY")
            : data.Params.DateFrom);
          $("#dateTo").val(
            data.Params.DateTo != ""
            ? moment(data.Params.DateTo).format("DD/MM/YYYY")
            : data.Params.DateTo);
        }
        for (let i = 0; i < data.tjournalentrylist.length; i++) {
          let totalDebitAmount = utilityService.modifynegativeCurrencyFormat(data.tjournalentrylist[i].DebitAmount) || 0.0;
          let totalCreditAmount = utilityService.modifynegativeCurrencyFormat(data.tjournalentrylist[i].CreditAmount) || 0.0;
          // Currency+''+data.tjournalentry[i].TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
          let totalTaxAmount = utilityService.modifynegativeCurrencyFormat(data.tjournalentrylist[i].TaxAmount) || 0.0;
          let orderstatus = data.tjournalentrylist[i].Deleted || "";
          if (data.tjournalentrylist[i].Deleted == true) {
            orderstatus = "Deleted";
          } else if (data.tjournalentrylist[i].IsOnHOLD == true) {
            orderstatus = "On Hold";
          } else if (data.tjournalentrylist[i].Reconciled == true) {
            orderstatus = "Rec";
          }

            var dataList = {
            id: data.tjournalentrylist[i].GJID || "",
            employee: data.tjournalentrylist[i].EmployeeName || "",
            sortdate: data.tjournalentrylist[i].TransactionDate != ""
              ? moment(data.tjournalentrylist[i].TransactionDate).format("YYYY/MM/DD")
              : data.tjournalentrylist[i].TransactionDate,
            transactiondate: data.tjournalentrylist[i].TransactionDate != ""
              ? moment(data.tjournalentrylist[i].TransactionDate).format("DD/MM/YYYY")
              : data.tjournalentrylist[i].TransactionDate,
            accountname: data.tjournalentrylist[i].AccountName || "",
            department: data.tjournalentrylist[i].ClassName || "",
            entryno: data.tjournalentrylist[i].GJID || "",
            debitamount: totalDebitAmount || 0.0,
            creditamount: totalCreditAmount || 0.0,
            taxamount: totalTaxAmount || 0.0,
            orderstatus: orderstatus || "",
            accountno: data.tjournalentrylist[i].AccountNumber || "",
            employeename: data.tjournalentrylist[i].EmployeeName || "",

              memo: data.tjournalentrylist[i].Memo || ""
          };
          dataTableList.push(dataList);
          templateObject.datatablerecords.set(dataTableList);
        }

          if (templateObject.datatablerecords.get()) {
          setTimeout(function () {
            MakeNegative();
          }, 100);
        }

          LoadingOverlay.hide();
        setTimeout(function () {
          //$.fn.dataTable.moment('DD/MM/YY');
          $("#tblJournalList").DataTable({
            // dom: 'lBfrtip',
            columnDefs: [
              {
                type: "date",
                targets: 0
              }
            ],
            sDom: "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
            buttons: [
              {
                extend: "excelHtml5",
                text: "",
                download: "open",
                className: "btntabletocsv hiddenColumn",
                filename: "journalentrylist_" + moment().format(),
                orientation: "portrait",
                exportOptions: {
                  columns: ":visible"
                }
              }, {
                extend: "print",
                download: "open",
                className: "btntabletopdf hiddenColumn",
                text: "",
                title: "Journal Entries",
                filename: "journalentrylist_" + moment().format(),
                exportOptions: {
                  columns: ":visible"
                }
              }
            ],
            select: true,
            destroy: true,
            colReorder: true,
            // bStateSave: true,
            // rowId: 0,
            pageLength: initialDatatableLoad,
            bLengthChange: false,
            info: true,
            responsive: true,
            order: [
              [
                0, "desc"
              ],
              [
                2, "desc"
              ]
            ],
            // "aaSorting": [[1,'desc']],
            action: function () {
              $("#tblJournalList").DataTable().ajax.reload();
            },
            fnDrawCallback: function (oSettings) {
              let checkurlIgnoreDate = FlowRouter.current().queryParams.ignoredate;

              $(".paginate_button.page-item").removeClass("disabled");
              $("#tblJournalList_ellipsis").addClass("disabled");

                if (oSettings._iDisplayLength == -1) {
                if (oSettings.fnRecordsDisplay() > 150) {
                  $(".paginate_button.page-item.previous").addClass("disabled");
                  $(".paginate_button.page-item.next").addClass("disabled");
                }
              } else {}
              if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                $(".paginate_button.page-item.next").addClass("disabled");
              }

                $(".paginate_button.next:not(.disabled)", this.api().table().container()).on("click", function () {
                $(".fullScreenSpin").css("display", "inline-block");
                let dataLenght = oSettings._iDisplayLength;
                var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
                var dateTo = new Date($("#dateTo").datepicker("getDate"));

                  let formatDateFrom = dateFrom.getFullYear() + "-" + (
                dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
                let formatDateTo = dateTo.getFullYear() + "-" + (
                dateTo.getMonth() + 1) + "-" + dateTo.getDate();
                if (data.Params.IgnoreDates == true) {
                  sideBarService.getTJournalEntryListData(formatDateFrom, formatDateTo, true, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (dataObjectnew) {
                    getVS1Data("TJournalEntryList").then(function (dataObjectold) {
                      if (dataObjectold.length == 0) {} else {
                        let dataOld = JSON.parse(dataObjectold[0].data);

                          var thirdaryData = $.merge($.merge([], dataObjectnew.tjournalentrylist), dataOld.tjournalentrylist);
                        let objCombineData = {
                          Params: dataOld.Params,
                          tjournalentrylist: thirdaryData
                        };

                          addVS1Data("TJournalEntryList", JSON.stringify(objCombineData)).then(function (datareturn) {
                          templateObject.resetData(objCombineData);
                          LoadingOverlay.hide();
                        }).catch(function (err) {
                          LoadingOverlay.hide();
                        });
                      }
                    }).catch(function (err) {});
                  }).catch(function (err) {
                    LoadingOverlay.hide();
                  });
                } else {
                  sideBarService.getTJournalEntryListData(formatDateFrom, formatDateTo, false, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (dataObjectnew) {
                    getVS1Data("TJournalEntryList").then(function (dataObjectold) {
                      if (dataObjectold.length == 0) {} else {
                        let dataOld = JSON.parse(dataObjectold[0].data);

                          var thirdaryData = $.merge($.merge([], dataObjectnew.tjournalentrylist), dataOld.tjournalentrylist);
                        let objCombineData = {
                          Params: dataOld.Params,
                          tjournalentrylist: thirdaryData
                        };

                        addVS1Data("TJournalEntryList", JSON.stringify(objCombineData)).then(function (datareturn) {
                          templateObject.resetData(objCombineData);
                          LoadingOverlay.hide();
                        }).catch(function (err) {
                          LoadingOverlay.hide();
                        });
                      }
                    }).catch(function (err) {});
                  }).catch(function (err) {
                    LoadingOverlay.hide();
                  });
                }
              });

                setTimeout(function () {
                MakeNegative();
              }, 100);
            },
            language: {
              search: "",
              searchPlaceholder: "Search List..."
            },
            fnInitComplete: function () {
              this.fnPageChange("last");
              if (data.Params.Search.replace(/\s/g, "") == "") {
                $("<button class='btn btn-danger btnHideDeleted' type='button' id='btnHideDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 14px !important;'><i class='far fa-check-circle' style='margin-right: 5px'></i>Hide Deleted</button>").insertAfter("#tblBankingOverview_filter");
              } else {
                $("<button class='btn btn-primary btnViewDeleted' type='button' id='btnViewDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 14px !important;'><i class='fa fa-trash' style='margin-right: 5px'></i>View Deleted</button>").insertAfter("#tblBankingOverview_filter");
              }
              $("<button class='btn btn-primary btnRefreshJournalEntry' type='button' id='btnRefreshJournalEntry' style='padding: 4px 10px; font-size: 16px; margin-left: 14px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblJournalList_filter");
              $(".myvarFilterForm").appendTo(".colDateFilter");
            },
            fnInfoCallback: function (oSettings, iStart, iEnd, iMax, iTotal, sPre) {
              let countTableData = data.Params.Count || 0; //get count from API data

                return ("Showing " + iStart + " to " + iEnd + " of " + countTableData);
            }
          }).on("page", function () {
            setTimeout(function () {
              MakeNegative();
            }, 100);
            let draftRecord = templateObject.datatablerecords.get();
            templateObject.datatablerecords.set(draftRecord);
          }).on("column-reorder", function () {});
          LoadingOverlay.hide();
        }, 0);

          var columns = $("#tblJournalList th");
        let sTible = "";
        let sWidth = "";
        let sIndex = "";
        let sVisible = "";
        let columVisible = false;
        let sClass = "";
        $.each(columns, function (i, v) {
          if (v.hidden == false) {
            columVisible = true;
          }
          if (v.className.includes("hiddenColumn")) {
            columVisible = false;
          }
          sWidth = v.style.width.replace("px", "");

            let datatablerecordObj = {
            sTitle: v.innerText || "",
            sWidth: sWidth || "",
            sIndex: v.cellIndex || 0,
            sVisible: columVisible || false,
            sClass: v.className || ""
          };
          tableHeaderList.push(datatablerecordObj);
        });
        templateObject.tableheaderrecords.set(tableHeaderList);
        $("div.dataTables_filter input").addClass("form-control form-control-sm");
        $("#tblJournalList tbody").on("click", "tr", function () {
          var listData = $(this).closest("tr").attr("id");
          var checkDeleted = $(this).closest("tr").find(".colStatus").text() || "";

            if (listData) {
            if (checkDeleted == "Deleted") {
              swal("You Cannot View This Transaction", "Because It Has Been Deleted", "info");
            } else {
              FlowRouter.go("/journalentrycard?id=" + listData);
            }
          }
        });
      }
    }).catch(function (err) {
      sideBarService.getTJournalEntryListData(prevMonth11Date, toDate, true, initialReportLoad, 0).then(function (data) {
        let lineItems = [];
        let lineItemObj = {};
        addVS1Data("TJournalEntryList", JSON.stringify(data));
        if (data.Params.IgnoreDates == true) {
          $("#dateFrom").attr("readonly", true);
          $("#dateTo").attr("readonly", true);
          //FlowRouter.go('/journalentrylist?ignoredate=true');
        } else {
          $("#dateFrom").attr("readonly", false);
          $("#dateTo").attr("readonly", false);
          $("#dateFrom").val(
            data.Params.DateFrom != ""
            ? moment(data.Params.DateFrom).format("DD/MM/YYYY")
            : data.Params.DateFrom);
          $("#dateTo").val(
            data.Params.DateTo != ""
            ? moment(data.Params.DateTo).format("DD/MM/YYYY")
            : data.Params.DateTo);
        }
        for (let i = 0; i < data.tjournalentrylist.length; i++) {
          let totalDebitAmount = utilityService.modifynegativeCurrencyFormat(data.tjournalentrylist[i].DebitAmount) || 0.0;
          let totalCreditAmount = utilityService.modifynegativeCurrencyFormat(data.tjournalentrylist[i].CreditAmount) || 0.0;
          // Currency+''+data.tjournalentry[i].TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
          let totalTaxAmount = utilityService.modifynegativeCurrencyFormat(data.tjournalentrylist[i].TaxAmount) || 0.0;
          let orderstatus = data.tjournalentrylist[i].Deleted || "";
          if (data.tjournalentrylist[i].Deleted == true) {
            orderstatus = "Deleted";
          } else if (data.tjournalentrylist[i].IsOnHOLD == true) {
            orderstatus = "On Hold";
          } else if (data.tjournalentrylist[i].Reconciled == true) {
            orderstatus = "Rec";
          }

            var dataList = {
            id: data.tjournalentrylist[i].GJID || "",
            employee: data.tjournalentrylist[i].EmployeeName || "",
            sortdate: data.tjournalentrylist[i].TransactionDate != ""
              ? moment(data.tjournalentrylist[i].TransactionDate).format("YYYY/MM/DD")
              : data.tjournalentrylist[i].TransactionDate,
            transactiondate: data.tjournalentrylist[i].TransactionDate != ""
              ? moment(data.tjournalentrylist[i].TransactionDate).format("DD/MM/YYYY")
              : data.tjournalentrylist[i].TransactionDate,
            accountname: data.tjournalentrylist[i].AccountName || "",
            department: data.tjournalentrylist[i].ClassName || "",
            entryno: data.tjournalentrylist[i].GJID || "",
            debitamount: totalDebitAmount || 0.0,
            creditamount: totalCreditAmount || 0.0,
            taxamount: totalTaxAmount || 0.0,
            orderstatus: orderstatus || "",
            accountno: data.tjournalentrylist[i].AccountNumber || "",
            employeename: data.tjournalentrylist[i].EmployeeName || "",

              memo: data.tjournalentrylist[i].Memo || ""
          };
          dataTableList.push(dataList);
          templateObject.datatablerecords.set(dataTableList);
        }

          if (templateObject.datatablerecords.get()) {
          setTimeout(function () {
            MakeNegative();
          }, 100);
        }

          LoadingOverlay.hide();
        setTimeout(function () {
          //$.fn.dataTable.moment('DD/MM/YY');
          $("#tblJournalList").DataTable({
            // dom: 'lBfrtip',
            columnDefs: [
              {
                type: "date",
                targets: 0
              }
            ],
            sDom: "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
            buttons: [
              {
                extend: "excelHtml5",
                text: "",
                download: "open",
                className: "btntabletocsv hiddenColumn",
                filename: "journalentrylist_" + moment().format(),
                orientation: "portrait",
                exportOptions: {
                  columns: ":visible"
            }
                }, {
                extend: "print",
                download: "open",
                className: "btntabletopdf hiddenColumn",
                text: "",
                title: "Journal Entries",
                filename: "journalentrylist_" + moment().format(),
                exportOptions: {
                  columns: ":visible"
                }
          }
              ],
            select: true,
            destroy: true,
            colReorder: true,
            // bStateSave: true,
            // rowId: 0,
            pageLength: initialDatatableLoad,
            bLengthChange: false,
            info: true,
            responsive: true,
            order: [
              [
                0, "desc"
              ],
              [
                2, "desc"
              ]
            ],
            // "aaSorting": [[1,'desc']],
            action: function () {
              $("#tblJournalList").DataTable().ajax.reload();
            },
            fnDrawCallback: function (oSettings) {
              let checkurlIgnoreDate = FlowRouter.current().queryParams.ignoredate;

                $(".paginate_button.page-item").removeClass("disabled");
              $("#tblJournalList_ellipsis").addClass("disabled");

                if (oSettings._iDisplayLength == -1) {
                if (oSettings.fnRecordsDisplay() > 150) {
                  $(".paginate_button.page-item.previous").addClass("disabled");
                  $(".paginate_button.page-item.next").addClass("disabled");
                }
              } else {}
              if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                $(".paginate_button.page-item.next").addClass("disabled");
          }

                $(".paginate_button.next:not(.disabled)", this.api().table().container()).on("click", function () {
                $(".fullScreenSpin").css("display", "inline-block");
                let dataLenght = oSettings._iDisplayLength;
                var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
                var dateTo = new Date($("#dateTo").datepicker("getDate"));

                  let formatDateFrom = dateFrom.getFullYear() + "-" + (
                dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
                let formatDateTo = dateTo.getFullYear() + "-" + (
                dateTo.getMonth() + 1) + "-" + dateTo.getDate();
                if (data.Params.IgnoreDates == true) {
                  sideBarService.getTJournalEntryListData(formatDateFrom, formatDateTo, true, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (dataObjectnew) {
                    getVS1Data("TJournalEntryList").then(function (dataObjectold) {
                      if (dataObjectold.length == 0) {} else {
                        let dataOld = JSON.parse(dataObjectold[0].data);

                          var thirdaryData = $.merge($.merge([], dataObjectnew.tjournalentrylist), dataOld.tjournalentrylist);
                        let objCombineData = {
                          Params: dataOld.Params,
                          tjournalentrylist: thirdaryData
                        };

                          addVS1Data("TJournalEntryList", JSON.stringify(objCombineData)).then(function (datareturn) {
                          templateObject.resetData(objCombineData);
                          LoadingOverlay.hide();
                        }).catch(function (err) {
                          LoadingOverlay.hide();
                        });
                      }
                    }).catch(function (err) {});
                  }).catch(function (err) {
                    LoadingOverlay.hide();
                  });
                } else {
                  sideBarService.getTJournalEntryListData(formatDateFrom, formatDateTo, false, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (dataObjectnew) {
                    getVS1Data("TJournalEntryList").then(function (dataObjectold) {
                      if (dataObjectold.length == 0) {} else {
                        let dataOld = JSON.parse(dataObjectold[0].data);

                          var thirdaryData = $.merge($.merge([], dataObjectnew.tjournalentrylist), dataOld.tjournalentrylist);
                        let objCombineData = {
                          Params: dataOld.Params,
                          tjournalentrylist: thirdaryData
                        };

                          addVS1Data("TJournalEntryList", JSON.stringify(objCombineData)).then(function (datareturn) {
                          templateObject.resetData(objCombineData);
                          LoadingOverlay.hide();
                        }).catch(function (err) {
                          LoadingOverlay.hide();
                        });
                      }
                    }).catch(function (err) {});
                  }).catch(function (err) {
                    LoadingOverlay.hide();
                  });
                }
              });

                setTimeout(function () {
                MakeNegative();
              }, 100);
            },
            language: {
              search: "",
              searchPlaceholder: "Search List..."
            },
            fnInitComplete: function () {
              this.fnPageChange("last");
              if (data.Params.Search.replace(/\s/g, "") == "") {
                $("<button class='btn btn-danger btnHideDeleted' type='button' id='btnHideDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 14px !important;'><i class='far fa-check-circle' style='margin-right: 5px'></i>Hide Deleted</button>").insertAfter("#tblBankingOverview_filter");
              } else {
                $("<button class='btn btn-primary btnViewDeleted' type='button' id='btnViewDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 14px !important;'><i class='fa fa-trash' style='margin-right: 5px'></i>View Deleted</button>").insertAfter("#tblBankingOverview_filter");
              }
              $("<button class='btn btn-primary btnRefreshJournalEntry' type='button' id='btnRefreshJournalEntry' style='padding: 4px 10px; font-size: 16px; margin-left: 14px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblJournalList_filter");
              $(".myvarFilterForm").appendTo(".colDateFilter");
            },
            fnInfoCallback: function (oSettings, iStart, iEnd, iMax, iTotal, sPre) {
              let countTableData = data.Params.Count || 0; //get count from API data

                return ("Showing " + iStart + " to " + iEnd + " of " + countTableData);
            }
          }).on("page", function () {
            setTimeout(function () {
              MakeNegative();
            }, 100);
            let draftRecord = templateObject.datatablerecords.get();
            templateObject.datatablerecords.set(draftRecord);
          }).on("column-reorder", function () {});
          LoadingOverlay.hide();
        }, 0);

        var columns = $("#tblJournalList th");
        let sTible = "";
        let sWidth = "";
        let sIndex = "";
        let sVisible = "";
        let columVisible = false;
        let sClass = "";
        $.each(columns, function (i, v) {
          if (v.hidden == false) {
            columVisible = true;
          }
          if (v.className.includes("hiddenColumn")) {
            columVisible = false;
          }
          sWidth = v.style.width.replace("px", "");

            let datatablerecordObj = {
            sTitle: v.innerText || "",
            sWidth: sWidth || "",
            sIndex: v.cellIndex || 0,
            sVisible: columVisible || false,
            sClass: v.className || ""
          };
          tableHeaderList.push(datatablerecordObj);
        });
        templateObject.tableheaderrecords.set(tableHeaderList);
        $("div.dataTables_filter input").addClass("form-control form-control-sm");
        $("#tblJournalList tbody").on("click", "tr", function () {
          var listData = $(this).closest("tr").attr("id");
          var checkDeleted = $(this).closest("tr").find(".colStatus").text() || "";

            if (listData) {
            if (checkDeleted == "Deleted") {
              swal("You Cannot View This Transaction", "Because It Has Been Deleted", "info");
            } else {
              FlowRouter.go("/journalentrycard?id=" + listData);
            }
          }
        });
      }).catch(function (err) {
        // Bert.alert('<strong>' + err + '</strong>!', 'danger');
        LoadingOverlay.hide();
        // Meteor._reload.reload();
      });
    });



  }

  //templateObject.getAllJournalEntryData();
  templateObject.loadReport();

  templateObject.getAllFilterJournalEntryData = function(fromDate, toDate, ignoreDate) {
      sideBarService.getTJournalEntryListData(fromDate, toDate, ignoreDate,initialReportLoad,0).then(function(data) {
          addVS1Data('TJournalEntryList', JSON.stringify(data)).then(function(datareturn) {
            location.reload();
          }).catch(function(err) {
              location.reload();
          });
      }).catch(function(err) {
          $('.fullScreenSpin').css('display', 'none');
      });
  }

  let urlParametersDateFrom = FlowRouter.current().queryParams.fromDate;
  let urlParametersDateTo = FlowRouter.current().queryParams.toDate;
  let urlParametersIgnoreDate = FlowRouter.current().queryParams.ignoredate;
  if (urlParametersDateFrom) {
      if (urlParametersIgnoreDate == true) {
          $('#dateFrom').attr('readonly', true);
          $('#dateTo').attr('readonly', true);
      } else {
          $('#dateFrom').attr('readonly', false);
          $('#dateTo').attr('readonly', false);
          $("#dateFrom").val(urlParametersDateFrom != '' ? moment(urlParametersDateFrom).format("DD/MM/YYYY") : urlParametersDateFrom);
          $("#dateTo").val(urlParametersDateTo != '' ? moment(urlParametersDateTo).format("DD/MM/YYYY") : urlParametersDateTo);
      }
  }
  tableResize();





});

Template.journalentrylist.events({

  "click .btnRefresh": function () {
    $(".fullScreenSpin").css("display", "inline-block");
    let templateObject = Template.instance();

    var currentBeginDate = new Date();
    var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
    let fromDateMonth = currentBeginDate.getMonth() + 1;
    let fromDateDay = currentBeginDate.getDate();
    if (currentBeginDate.getMonth() + 1 < 10) {
      fromDateMonth = "0" + (
      currentBeginDate.getMonth() + 1);
    } else {
      fromDateMonth = currentBeginDate.getMonth() + 1;
    }

    if (currentBeginDate.getDate() < 10) {
      fromDateDay = "0" + currentBeginDate.getDate();
    }
    var toDate = currentBeginDate.getFullYear() + "-" + fromDateMonth + "-" + fromDateDay;
    let prevMonth11Date = moment().subtract(reportsloadMonths, "months").format("YYYY-MM-DD");

    sideBarService.getAllPurchasesList(prevMonth11Date, toDate, true, initialReportLoad, 0).then(function (data) {
      addVS1Data("TPurchasesList", JSON.stringify(data)).then(function (datareturn) {}).catch(function (err) {});
    }).catch(function (err) {});

    sideBarService.getTJournalEntryListData(prevMonth11Date, toDate, true, initialReportLoad, 0).then(function (dataJournal) {
      addVS1Data("TJournalEntryList", JSON.stringify(dataJournal)).then(function (datareturn) {
        sideBarService.getAllJournalEnrtryLinesList(initialDataLoad, 0).then(function (data) {
          addVS1Data("TJournalEntryLines", JSON.stringify(data)).then(function (datareturn) {
            window.open("/journalentrylist", "_self");
          }).catch(function (err) {
            window.open("/journalentrylist", "_self");
          });
        }).catch(function (err) {
          window.open("/journalentrylist", "_self");
        });
      }).catch(function (err) {
        sideBarService.getAllJournalEnrtryLinesList(initialDataLoad, 0).then(function (data) {
          addVS1Data("TJournalEntryLines", JSON.stringify(data)).then(function (datareturn) {
            window.open("/journalentrylist", "_self");
          }).catch(function (err) {
            window.open("/journalentrylist", "_self");
          });
        }).catch(function (err) {
          window.open("/journalentrylist", "_self");
        });
      });
    }).catch(function (err) {
      window.open("/journalentrylist", "_self");
    });
  },
  "change #dateTo": function () {
    let templateObject = Template.instance();
    $(".fullScreenSpin").css("display", "inline-block");
    $("#dateFrom").attr("readonly", false);
    $("#dateTo").attr("readonly", false);
    setTimeout(function () {
      var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
      var dateTo = new Date($("#dateTo").datepicker("getDate"));

      let formatDateFrom = dateFrom.getFullYear() + "-" + (
      dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
      let formatDateTo = dateTo.getFullYear() + "-" + (
      dateTo.getMonth() + 1) + "-" + dateTo.getDate();

      //  templateObject.getAgedPayableReports(formatDateFrom,formatDateTo,false);
      var formatDate = dateTo.getDate() + "/" + (
      dateTo.getMonth() + 1) + "/" + dateTo.getFullYear();
      //templateObject.dateAsAt.set(formatDate);
      if ($("#dateFrom").val().replace(/\s/g, "") == "" && $("#dateFrom").val().replace(/\s/g, "") == "") {} else {
        templateObject.getAllFilterJournalEntryData(formatDateFrom, formatDateTo, false);
      }
    }, 500);
  },
  "change #dateFrom": function () {
    let templateObject = Template.instance();
    $(".fullScreenSpin").css("display", "inline-block");
    $("#dateFrom").attr("readonly", false);
    $("#dateTo").attr("readonly", false);
    setTimeout(function () {
      var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
      var dateTo = new Date($("#dateTo").datepicker("getDate"));

      let formatDateFrom = dateFrom.getFullYear() + "-" + (
      dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
      let formatDateTo = dateTo.getFullYear() + "-" + (
      dateTo.getMonth() + 1) + "-" + dateTo.getDate();

      //  templateObject.getAgedPayableReports(formatDateFrom,formatDateTo,false);
      var formatDate = dateTo.getDate() + "/" + (
      dateTo.getMonth() + 1) + "/" + dateTo.getFullYear();
      //templateObject.dateAsAt.set(formatDate);
      if ($("#dateFrom").val().replace(/\s/g, "") == "" && $("#dateFrom").val().replace(/\s/g, "") == "") {} else {
        templateObject.getAllFilterJournalEntryData(formatDateFrom, formatDateTo, false);
      }
    }, 500);
  },
  "click #today": function () {
    let templateObject = Template.instance();
    $(".fullScreenSpin").css("display", "inline-block");
    $("#dateFrom").attr("readonly", false);
    $("#dateTo").attr("readonly", false);
    var currentBeginDate = new Date();
    var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
    let fromDateMonth = currentBeginDate.getMonth() + 1;
    let fromDateDay = currentBeginDate.getDate();
    if (currentBeginDate.getMonth() + 1 < 10) {
      fromDateMonth = "0" + (
      currentBeginDate.getMonth() + 1);
    } else {
      fromDateMonth = currentBeginDate.getMonth() + 1;
    }

    if (currentBeginDate.getDate() < 10) {
      fromDateDay = "0" + currentBeginDate.getDate();
    }
    var toDateERPFrom = currentBeginDate.getFullYear() + "-" + fromDateMonth + "-" + fromDateDay;
    var toDateERPTo = currentBeginDate.getFullYear() + "-" + fromDateMonth + "-" + fromDateDay;

    var toDateDisplayFrom = fromDateDay + "/" + fromDateMonth + "/" + currentBeginDate.getFullYear();
    var toDateDisplayTo = fromDateDay + "/" + fromDateMonth + "/" + currentBeginDate.getFullYear();

    $("#dateFrom").val(toDateDisplayFrom);
    $("#dateTo").val(toDateDisplayTo);
    templateObject.getAllFilterJournalEntryData(toDateERPFrom, toDateERPTo, false);
  },
  "click #lastweek": function () {
    let templateObject = Template.instance();
    $(".fullScreenSpin").css("display", "inline-block");
    $("#dateFrom").attr("readonly", false);
    $("#dateTo").attr("readonly", false);
    var currentBeginDate = new Date();
    var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
    let fromDateMonth = currentBeginDate.getMonth() + 1;
    let fromDateDay = currentBeginDate.getDate();
    if (currentBeginDate.getMonth() + 1 < 10) {
      fromDateMonth = "0" + (
      currentBeginDate.getMonth() + 1);
    } else {
      fromDateMonth = currentBeginDate.getMonth() + 1;
    }

    if (currentBeginDate.getDate() < 10) {
      fromDateDay = "0" + currentBeginDate.getDate();
    }
    var toDateERPFrom = currentBeginDate.getFullYear() + "-" + fromDateMonth + "-" + (
    fromDateDay - 7);
    var toDateERPTo = currentBeginDate.getFullYear() + "-" + fromDateMonth + "-" + fromDateDay;

    var toDateDisplayFrom = fromDateDay - 7 + "/" + fromDateMonth + "/" + currentBeginDate.getFullYear();
    var toDateDisplayTo = fromDateDay + "/" + fromDateMonth + "/" + currentBeginDate.getFullYear();

    $("#dateFrom").val(toDateDisplayFrom);
    $("#dateTo").val(toDateDisplayTo);
    templateObject.getAllFilterJournalEntryData(toDateERPFrom, toDateERPTo, false);
  },
  "click #lastMonth": function () {
    let templateObject = Template.instance();
    $(".fullScreenSpin").css("display", "inline-block");
    $("#dateFrom").attr("readonly", false);
    $("#dateTo").attr("readonly", false);
    var currentDate = new Date();

    var prevMonthLastDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    var prevMonthFirstDate = new Date(currentDate.getFullYear() - (
      currentDate.getMonth() > 0
      ? 0
      : 1), (currentDate.getMonth() - 1 + 12) % 12, 1);

    var formatDateComponent = function (dateComponent) {
      return (
        dateComponent < 10
        ? "0"
        : "") + dateComponent;
    };

    var formatDate = function (date) {
      return (formatDateComponent(date.getDate()) + "/" + formatDateComponent(date.getMonth() + 1) + "/" + date.getFullYear());
    };

    var formatDateERP = function (date) {
      return (date.getFullYear() + "-" + formatDateComponent(date.getMonth() + 1) + "-" + formatDateComponent(date.getDate()));
    };

    var fromDate = formatDate(prevMonthFirstDate);
    var toDate = formatDate(prevMonthLastDate);

    $("#dateFrom").val(fromDate);
    $("#dateTo").val(toDate);

    var getLoadDate = formatDateERP(prevMonthLastDate);
    let getDateFrom = formatDateERP(prevMonthFirstDate);
    templateObject.getAllFilterJournalEntryData(getDateFrom, getLoadDate, false);
  },
  "click #lastQuarter": function () {
    let templateObject = Template.instance();
    $(".fullScreenSpin").css("display", "inline-block");
    $("#dateFrom").attr("readonly", false);
    $("#dateTo").attr("readonly", false);
    var currentDate = new Date();
    var begunDate = moment(currentDate).format("DD/MM/YYYY");

    var begunDate = moment(currentDate).format("DD/MM/YYYY");

    function getQuarter(d) {
      d = d || new Date();
      var m = Math.floor(d.getMonth() / 3) + 2;
      return m > 4
        ? m - 4
        : m;
    }

    var quarterAdjustment = (moment().month() % 3) + 1;
    var lastQuarterEndDate = moment().subtract({months: quarterAdjustment}).endOf("month");
    var lastQuarterStartDate = lastQuarterEndDate.clone().subtract({months: 2}).startOf("month");

    var lastQuarterStartDateFormat = moment(lastQuarterStartDate).format("DD/MM/YYYY");
    var lastQuarterEndDateFormat = moment(lastQuarterEndDate).format("DD/MM/YYYY");

    $("#dateFrom").val(lastQuarterStartDateFormat);
    $("#dateTo").val(lastQuarterEndDateFormat);

    let fromDateMonth = getQuarter(currentDate);
    var quarterMonth = getQuarter(currentDate);
    let fromDateDay = currentDate.getDate();

    var getLoadDate = moment(lastQuarterEndDate).format("YYYY-MM-DD");
    let getDateFrom = moment(lastQuarterStartDateFormat).format("YYYY-MM-DD");
    templateObject.getAllFilterJournalEntryData(getDateFrom, getLoadDate, false);
  },
  "click #last12Months": function () {
    let templateObject = Template.instance();
    $(".fullScreenSpin").css("display", "inline-block");
    $("#dateFrom").attr("readonly", false);
    $("#dateTo").attr("readonly", false);
    var currentDate = new Date();
    var begunDate = moment(currentDate).format("DD/MM/YYYY");

    let fromDateMonth = Math.floor(currentDate.getMonth() + 1);
    let fromDateDay = currentDate.getDate();
    if (currentDate.getMonth() + 1 < 10) {
      fromDateMonth = "0" + (
      currentDate.getMonth() + 1);
    }
    if (currentDate.getDate() < 10) {
      fromDateDay = "0" + currentDate.getDate();
    }

    var fromDate = fromDateDay + "/" + fromDateMonth + "/" + Math.floor(currentDate.getFullYear() - 1);
    $("#dateFrom").val(fromDate);
    $("#dateTo").val(begunDate);

    var currentDate2 = new Date();
    if (currentDate2.getMonth() + 1 < 10) {
      fromDateMonth2 = "0" + Math.floor(currentDate2.getMonth() + 1);
    }
    if (currentDate2.getDate() < 10) {
      fromDateDay2 = "0" + currentDate2.getDate();
    }
    var getLoadDate = moment(currentDate2).format("YYYY-MM-DD");
    let getDateFrom = Math.floor(currentDate2.getFullYear() - 1) + "-" + fromDateMonth2 + "-" + currentDate2.getDate();
    templateObject.getAllFilterJournalEntryData(getDateFrom, getLoadDate, false);
  },
  "click #ignoreDate": function () {
    let templateObject = Template.instance();
    $(".fullScreenSpin").css("display", "inline-block");
    $("#dateFrom").attr("readonly", true);
    $("#dateTo").attr("readonly", true);
    templateObject.getAllFilterJournalEntryData("", "", true);
  },
  "click #btnNewJournalEntry": function (event) {
    FlowRouter.go("/journalentrycard");
  },
  "click .chkDatatable": function (event) {
    var columns = $("#tblJournalList th");
    let columnDataValue = $(event.target).closest("div").find(".divcolumn").text();

    $.each(columns, function (i, v) {
      let className = v.classList;
      let replaceClass = className[1];

      if (v.innerText == columnDataValue) {
        if ($(event.target).is(":checked")) {
          $("." + replaceClass + "").css("display", "table-cell");
          $("." + replaceClass + "").css("padding", ".75rem");
          $("." + replaceClass + "").css("vertical-align", "top");
        } else {
          $("." + replaceClass + "").css("display", "none");
        }
      }
    });
  },
  "keyup #tblJournalList_filter input": function (event) {
    if ($(event.target).val() != "") {
      $(".btnRefreshJournalEntry").addClass("btnSearchAlert");
    } else {
      $(".btnRefreshJournalEntry").removeClass("btnSearchAlert");
    }
    if (event.keyCode == 13) {
      $(".btnRefreshJournalEntry").trigger("click");
    }
  },
  "click .btnRefreshJournalEntry": function (event) {
    $(".btnRefresh").trigger("click");
  },
  "click .resetTable": function (event) {
    var getcurrentCloudDetails = CloudUser.findOne({_id: Session.get("mycloudLogonID"), clouddatabaseID: Session.get("mycloudLogonDBID")});
    if (getcurrentCloudDetails) {
      if (getcurrentCloudDetails._id.length > 0) {
        var clientID = getcurrentCloudDetails._id;
        var clientUsername = getcurrentCloudDetails.cloudUsername;
        var clientEmail = getcurrentCloudDetails.cloudEmail;
        var checkPrefDetails = CloudPreference.findOne({userid: clientID, PrefName: "tblJournalList"});
        if (checkPrefDetails) {
          CloudPreference.remove({
            _id: checkPrefDetails._id
          }, function (err, idTag) {
            if (err) {} else {
              Meteor._reload.reload();
            }
          });
        }
      }
    }
  },
  "click .saveTable": function (event) {
    let lineItems = [];
    //let datatable =$('#tblJournalList').DataTable();
    $(".columnSettings").each(function (index) {
      var $tblrow = $(this);
      var colTitle = $tblrow.find(".divcolumn").text() || "";
      var colWidth = $tblrow.find(".custom-range").val() || 0;
      var colthClass = $tblrow.find(".divcolumn").attr("valueupdate") || "";
      var colHidden = false;
      if ($tblrow.find(".custom-control-input").is(":checked")) {
        colHidden = false;
      } else {
        colHidden = true;
      }
      let lineItemObj = {
        index: index,
        label: colTitle,
        hidden: colHidden,
        width: colWidth,
        thclass: colthClass
      };

      lineItems.push(lineItemObj);
    });
    //datatable.state.save();
    var getcurrentCloudDetails = CloudUser.findOne({_id: Session.get("mycloudLogonID"), clouddatabaseID: Session.get("mycloudLogonDBID")});
    if (getcurrentCloudDetails) {
      if (getcurrentCloudDetails._id.length > 0) {
        var clientID = getcurrentCloudDetails._id;
        var clientUsername = getcurrentCloudDetails.cloudUsername;
        var clientEmail = getcurrentCloudDetails.cloudEmail;
        var checkPrefDetails = CloudPreference.findOne({userid: clientID, PrefName: "tblJournalList"});
        if (checkPrefDetails) {
          CloudPreference.update({
            _id: checkPrefDetails._id
          }, {
            $set: {
              userid: clientID,
              username: clientUsername,
              useremail: clientEmail,
              PrefGroup: "salesform",
              PrefName: "tblJournalList",
              published: true,
              customFields: lineItems,
              updatedAt: new Date()
            }
          }, function (err, idTag) {
            if (err) {
              $("#myModal2").modal("toggle");
            } else {
              $("#myModal2").modal("toggle");
            }
          });
        } else {
          CloudPreference.insert({
            userid: clientID,
            username: clientUsername,
            useremail: clientEmail,
            PrefGroup: "salesform",
            PrefName: "tblJournalList",
            published: true,
            customFields: lineItems,
            createdAt: new Date()
          }, function (err, idTag) {
            if (err) {
              $("#myModal2").modal("toggle");
            } else {
              $("#myModal2").modal("toggle");
            }
          });
        }
      }
    }
    $("#myModal2").modal("toggle");
    //Meteor._reload.reload();
  },
  "blur .divcolumn": function (event) {
    let columData = $(event.target).text();

    let columnDatanIndex = $(event.target).closest("div.columnSettings").attr("id");

    var datable = $("#tblJournalList").DataTable();
    var title = datable.column(columnDatanIndex).header();
    $(title).html(columData);
  },
  "change .rngRange": function (event) {
    let range = $(event.target).val();
    // $(event.target).closest("div.divColWidth").find(".spWidth").html(range+'px');

    // let columData = $(event.target).closest("div.divColWidth").find(".spWidth").attr("value");
    let columnDataValue = $(event.target).closest("div").prev().find(".divcolumn").text();
    var datable = $("#tblJournalList th");
    $.each(datable, function (i, v) {
      if (v.innerText == columnDataValue) {
        let className = v.className;
        let replaceClass = className.replace(/ /g, ".");
        $("." + replaceClass + "").css("width", range + "px");
      }
    });
  },
  "click .btnOpenSettings": function (event) {
    let templateObject = Template.instance();
    var columns = $("#tblJournalList th");

    const tableHeaderList = [];
    let sTible = "";
    let sWidth = "";
    let sIndex = "";
    let sVisible = "";
    let columVisible = false;
    let sClass = "";
    $.each(columns, function (i, v) {
      if (v.hidden == false) {
        columVisible = true;
      }
      if (v.className.includes("hiddenColumn")) {
        columVisible = false;
      }
      sWidth = v.style.width.replace("px", "");

      let datatablerecordObj = {
        sTitle: v.innerText || "",
        sWidth: sWidth || "",
        sIndex: v.cellIndex || "",
        sVisible: columVisible || false,
        sClass: v.className || ""
      };
      tableHeaderList.push(datatablerecordObj);
    });

    templateObject.tableheaderrecords.set(tableHeaderList);
  },
  "click #exportbtn": function () {
    $(".fullScreenSpin").css("display", "inline-block");
    jQuery("#tblJournalList_wrapper .dt-buttons .btntabletocsv").click();
    LoadingOverlay.hide();
  },
  "click .printConfirm": function (event) {
    playPrintAudio();
    setTimeout(function(){
    $(".fullScreenSpin").css("display", "inline-block");
    jQuery("#tblJournalList_wrapper .dt-buttons .btntabletopdf").click();
    LoadingOverlay.hide();
    // $('#html-2-pdfwrapper').css('display','block');
    // var pdf =  new jsPDF('portrait','mm','a4');
    // new jsPDF('p', 'pt', 'a4');
    //   pdf.setFontSize(18);
    //   var source = document.getElementById('html-2-pdfwrapper');
    //   pdf.addHTML(source, function () {
    //      pdf.save('journalentrylist.pdf');
    //      $('#html-2-pdfwrapper').css('display','none');
    //  });
  }, delayTimeAfterSound);
  },
   // CURRENCY MODULE //
   ...FxGlobalFunctions.getEvents(),
  "click .currency-modal-save": (e) => {
    //$(e.currentTarget).parentsUntil(".modal").modal("hide");
    LoadingOverlay.show();

    let templateObject = Template.instance();

    // Get all currency list
    let _currencyList = templateObject.currencyList.get();

    // Get all selected currencies
    const currencySelected = $(".currency-selector-js:checked");
    let _currencySelectedList = [];
    if (currencySelected.length > 0) {
      $.each(currencySelected, (index, e) => {
        const sellRate = $(e).attr("sell-rate");
        const buyRate = $(e).attr("buy-rate");
        const currencyCode = $(e).attr("currency");
        const currencyId = $(e).attr("currency-id");
        let _currency = _currencyList.find((c) => c.id == currencyId);
        _currency.active = true;
        _currencySelectedList.push(_currency);
      });
    } else {
      let _currency = _currencyList.find((c) => c.code == defaultCurrencyCode);
      _currency.active = true;
      _currencySelectedList.push(_currency);
    }

    _currencyList.forEach((value, index) => {
      if (_currencySelectedList.some((c) => c.id == _currencyList[index].id)) {
        _currencyList[index].active = _currencySelectedList.find(
          (c) => c.id == _currencyList[index].id
        ).active;
      } else {
        _currencyList[index].active = false;
      }
    });

    _currencyList = _currencyList.sort((a, b) => {
      if (a.code == defaultCurrencyCode) {
        return -1;
      }
      return 1;
    });

    // templateObject.activeCurrencyList.set(_activeCurrencyList);
    templateObject.currencyList.set(_currencyList);

    LoadingOverlay.hide();
  },
});
Template.journalentrylist.helpers({
  isCurrencyEnable: () => FxGlobalFunctions.isCurrencyEnabled(),
  datatablerecords: () => {
    return Template.instance().datatablerecords.get().sort(function (a, b) {
      if (a.transactiondate == "NA") {
        return 1;
      } else if (b.transactiondate == "NA") {
        return -1;
      }
      return a.transactiondate.toUpperCase() > b.transactiondate.toUpperCase()
        ? 1
        : -1;
    });
  },
  tableheaderrecords: () => {
    return Template.instance().tableheaderrecords.get();
  },
  salesCloudPreferenceRec: () => {
    return CloudPreference.findOne({userid: Session.get("mycloudLogonID"), PrefName: "tblJournalList"});
  },
  currentdate: () => {
    var currentDate = new Date();
    var begunDate = moment(currentDate).format("DD/MM/YYYY");
    return begunDate;
  },


  // FX Module
  convertAmount: (amount, currencyData) => {
    let currencyList = Template.instance().tcurrencyratehistory.get(); // Get tCurrencyHistory

    if (isNaN(amount)) {
      if (!amount || amount.trim() == "") {
        return "";
      }
      amount = utilityService.convertSubstringParseFloat(amount); // This will remove all currency symbol
    }
    // if (currencyData.code == defaultCurrencyCode) {
    //    default currency
    //   return amount;
    // }

    // Lets remove the minus character
    const isMinus = amount < 0;
    if (isMinus == true)
      amount = amount * -1; // make it positive for now

    //  get default currency symbol
    // let _defaultCurrency = currencyList.filter(
    //   (a) => a.Code == defaultCurrencyCode
    // )[0];

    // amount = amount.replace(_defaultCurrency.symbol, "");

    // amount =
    //   isNaN(amount) == true
    //     ? parseFloat(amount.substring(1))
    //     : parseFloat(amount);

    // Get the selected date
    let dateTo = $("#dateTo").val();
    const day = dateTo.split("/")[0];
    const m = dateTo.split("/")[1];
    const y = dateTo.split("/")[2];
    dateTo = new Date(y, m, day);
    dateTo.setMonth(dateTo.getMonth() - 1); // remove one month (because we added one before)

    // Filter by currency code
    currencyList = currencyList.filter(a => a.Code == currencyData.code);

    // Sort by the closest date
    currencyList = currencyList.sort((a, b) => {
      a = GlobalFunctions.timestampToDate(a.MsTimeStamp);
      a.setHours(0);
      a.setMinutes(0);
      a.setSeconds(0);

      b = GlobalFunctions.timestampToDate(b.MsTimeStamp);
      b.setHours(0);
      b.setMinutes(0);
      b.setSeconds(0);

      var distancea = Math.abs(dateTo - a);
      var distanceb = Math.abs(dateTo - b);
      return distancea - distanceb; // sort a before b when the distance is smaller

      // const adate= new Date(a.MsTimeStamp);
      // const bdate = new Date(b.MsTimeStamp);

      // if(adate < bdate) {
      //   return 1;
      // }
      // return -1;
    });

    const [firstElem] = currencyList; // Get the firest element of the array which is the closest to that date

    let rate = currencyData.code == defaultCurrencyCode
      ? 1
      : firstElem.BuyRate; // Must used from tcurrecyhistory

    amount = parseFloat(amount * rate); // Multiply by the rate
    amount = Number(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }); // Add commas

    let convertedAmount = isMinus == true
      ? `- ${currencyData.symbol} ${amount}`
      : `${currencyData.symbol} ${amount}`;

    return convertedAmount;
  },
  count: array => {
    return array.length;
  },
  countActive: array => {
    if (array.length == 0) {
      return 0;
    }
    let activeArray = array.filter(c => c.active == true);
    return activeArray.length;
  },
  currencyList: () => {
    return Template.instance().currencyList.get();
  },
  isNegativeAmount(amount) {
    if (Math.sign(amount) === -1) {
      return true;
    }
    return false;
  },
  isOnlyDefaultActive() {
    const array = Template.instance().currencyList.get();
    if (array.length == 0) {
      return false;
    }
    let activeArray = array.filter(c => c.active == true);

    if (activeArray.length == 1) {
      if (activeArray[0].code == defaultCurrencyCode) {
        return !true;
      } else {
        return !false;
      }
    } else {
      return !false;
    }
  },
  isCurrencyListActive() {
    const array = Template.instance().currencyList.get();
    let activeArray = array.filter(c => c.active == true);

    return activeArray.length > 0;
  },
  isObject(variable) {
    return typeof variable === "object" && variable !== null;
  },
  currency: () => {
    return Currency;
  },
  // custom fields displaysettings
  displayfields: () => {
    return Template.instance().displayfields.get();
  },
});
