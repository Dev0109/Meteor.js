import { SalesBoardService } from "../js/sales-service";
import { ReactiveVar } from "meteor/reactive-var";
import { CoreService } from "../js/core-service";
import { EmployeeProfileService } from "../js/profile-service";
import { AccountService } from "../accounts/account-service";
import { UtilityService } from "../utility-service";
import { SideBarService } from "../js/sidebar-service";
import {OrganisationService} from '../js/organisation-service';

import "../lib/global/indexdbstorage.js";
import { convertToForeignAmount } from "../payments/paymentcard/supplierPaymentcard";
import { getCurrentCurrencySymbol } from "../popUps/currnecypopup";
let sideBarService = new SideBarService();
let utilityService = new UtilityService();


let defaultCurrencyCode = CountryAbbr;

Template.salesoverview.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.datatablerecords = new ReactiveVar([]);
  templateObject.tableheaderrecords = new ReactiveVar([]);
  templateObject.custfields = new ReactiveVar([]);
  templateObject.displayfields = new ReactiveVar([]);
  templateObject.reset_data = new ReactiveVar([]);
});

Template.salesoverview.onRendered(function () {
  $(".fullScreenSpin").css("display", "inline-block");
  let templateObject = Template.instance();


  // set initial table rest_data
  function init_reset_data() {
    let reset_data = [
      { index: 0, label: 'Sort Date', class:'SortDate', active: false, display: false, width: "0" },
      { index: 1, label: 'Sale Date', class:'SaleDate', active: true, display: true, width: "" },
      { index: 2, label: 'Sales No.', class:'SalesNo', active: true, display: true, width: "" },
      { index: 3, label: 'Type', class:'Type', active: true, display: true, width: "" },
      { index: 4, label: 'Customer', class:'Customer', active: true, display: true, width: "" },
      { index: 5, label: 'Amount (Ex)', class:'AmountEx', active: true, display: true, width: "" },
      { index: 6, label: 'Tax', class:'Tax', active: true, display: true, width: "" },
      { index: 7, label: 'Amount (Inc)', class:'Amount', active: true, display: true, width: "" },
      { index: 8, label: 'Paid', class:'Paid', active: true, display: true, width: "" },
      { index: 9, label: 'Balance Outstanding', class:'BalanceOutstanding', active: true, display: true, width: "" },
      { index: 10, label: 'Status', class:'Status', active: true, display: true, width: "" },
      { index: 11, label: 'Employee', class:'Employee', active: false, display: true, width: "" },
      { index: 12, label: 'Comments', class: 'Comments', active: true, display: true, width: "" },
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
               templateObject.showCustomFieldDisplaySettings(reset_data);
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

  templateObject.showCustomFieldDisplaySettings = async function(reset_data){

    let custFields = [];
    let customData = {};
    let customFieldCount = reset_data.length;
    for (let r = 0; r < customFieldCount; r++) {
      customData = {
        active: reset_data[r].active,
        id: reset_data[r].index,
        custfieldlabel: reset_data[r].label,
        class: reset_data[r].class||'',
        display: reset_data[r].display,
        width: reset_data[r].width ? reset_data[r].width : ''
      };

      //if(reset_data[r].class != ''){
        if(reset_data[r].active == true){
          $('#tblSalesOverview .'+reset_data[r].class).removeClass('hiddenColumn');
        }else if(reset_data[r].active == false){
          $('#tblSalesOverview .'+reset_data[r].class).addClass('hiddenColumn');
        };
      //};
      custFields.push(customData);
    }
    templateObject.displayfields.set(custFields);
  }

  templateObject.initCustomFieldDisplaySettings("", "tblSalesOverview");


  let accountService = new AccountService();
  let salesService = new SalesBoardService();
  const customerList = [];
  let salesOrderTable;
  var splashArray = new Array();
  const dataTableList = [];
  const tableHeaderList = [];

  var today = moment().format("DD/MM/YYYY");
  var currentDate = new Date();
  var begunDate = moment(currentDate).format("DD/MM/YYYY");
  let fromDateMonth = currentDate.getMonth() + 1;
  let fromDateDay = currentDate.getDate();
  if (currentDate.getMonth() + 1 < 10) {
    fromDateMonth = "0" + (currentDate.getMonth() + 1);
  }

  if (currentDate.getDate() < 10) {
    fromDateDay = "0" + currentDate.getDate();
  }
  var fromDate =
    fromDateDay + "/" + fromDateMonth + "/" + currentDate.getFullYear();

  $("#date-input,#dateTo,#dateFrom").datepicker({
    showOn: "button",
    buttonText: "Show Date",
    buttonImageOnly: true,
    buttonImage: "/img/imgCal2.png",
    dateFormat: "dd/mm/yy",
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
      $('td').each(function () {
          if ($(this).text().indexOf('-' + Currency) >= 0)
              $(this).addClass('text-danger')
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
  };

  templateObject.getAllSalesOrderData = function ( deleteFilter = false ) {
    var currentBeginDate = new Date();
    var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
    let fromDateMonth = currentBeginDate.getMonth() + 1;
    let fromDateDay = currentBeginDate.getDate();
    if (currentBeginDate.getMonth() + 1 < 10) {
      fromDateMonth = "0" + (currentBeginDate.getMonth() + 1);
    } else {
      fromDateMonth = currentBeginDate.getMonth() + 1;
    }

    if (currentBeginDate.getDate() < 10) {
      fromDateDay = "0" + currentBeginDate.getDate();
    }
    var toDate =
      currentBeginDate.getFullYear() + "-" + fromDateMonth + "-" + fromDateDay;
    let prevMonth11Date = moment()
      .subtract(reportsloadMonths, "months")
      .format("YYYY-MM-DD");

    getVS1Data("TSalesList").then(function (dataObject) {
        if (dataObject.length == 0) {
          sideBarService.getSalesListData(
              prevMonth11Date,
              toDate,
              true,
              initialReportLoad,
              0,
              deleteFilter
            )
            .then(function (data) {
              let lineItems = [];
              let lineItemObj = {};
              addVS1Data("TSalesList", JSON.stringify(data));
              if (data.Params.IgnoreDates == true) {
                $("#dateFrom").attr("readonly", true);
                $("#dateTo").attr("readonly", true);
                //FlowRouter.go("/salesoverview?ignoredate=true");
              } else {
                $('#dateFrom').attr('readonly', false);
                $('#dateTo').attr('readonly', false);
                $("#dateFrom").val(data.Params.DateFrom != ""? moment(data.Params.DateFrom).format("DD/MM/YYYY"): data.Params.DateFrom);
                $("#dateTo").val(data.Params.DateTo != ""? moment(data.Params.DateTo).format("DD/MM/YYYY"): data.Params.DateTo);
              }
              deleteFilter = false;
              if( data.Params.Search == ""){
                deleteFilter = true;
              }
              for (let i = 0; i < data.tsaleslist.length; i++) {
                let totalAmountEx =
                  utilityService.modifynegativeCurrencyFormat(
                    data.tsaleslist[i].TotalAmount
                  ) || 0.0;
                let totalTax =
                  utilityService.modifynegativeCurrencyFormat(
                    data.tsaleslist[i].TotalTax
                  ) || 0.0;
                // Currency+''+data.tsaleslist[i].TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
                let totalAmount =
                  utilityService.modifynegativeCurrencyFormat(
                    data.tsaleslist[i].TotalAmountinc
                  ) || 0.0;
                let totalPaid =
                  utilityService.modifynegativeCurrencyFormat(
                    data.tsaleslist[i].Payment
                  ) || 0.0;
                let totalOutstanding =
                  utilityService.modifynegativeCurrencyFormat(
                    data.tsaleslist[i].Balance
                  ) || 0.0;

                  let salestatus = data.tsaleslist[i].Status || '';
                  if(data.tsaleslist[i].Done == true){
                    salestatus = "Deleted";
                  }else if(data.tsaleslist[i].CustomerName == ''){
                    salestatus = "Deleted";
                  };
                  if( ( deleteFilter == true &&  salestatus == "Deleted" ) || salestatus !=  'Deleted' ){
                  var dataList = {
                    id: data.tsaleslist[i].SaleId || "",
                    employee: data.tsaleslist[i].employeename || "",
                    sortdate:
                      data.tsaleslist[i].SaleDate != ""
                        ? moment(data.tsaleslist[i].SaleDate).format("YYYY/MM/DD")
                        : data.tsaleslist[i].SaleDate,
                    saledate:
                      data.tsaleslist[i].SaleDate != ""
                        ? moment(data.tsaleslist[i].SaleDate).format("DD/MM/YYYY")
                        : data.tsaleslist[i].SaleDate,
                    customername: data.tsaleslist[i].CustomerName || "",
                    totalamountex: totalAmountEx || 0.0,
                    totaltax: totalTax || 0.0,
                    totalamount: totalAmount || 0.0,
                    totalpaid: totalPaid || 0.0,
                    totaloustanding: totalOutstanding || 0.0,
                    salestatus: salestatus || "",
                    custfield1: data.tsaleslist[i].SaleCustField1 || '',
                    custfield2: data.tsaleslist[i].SaleCustField2 || '',
                    custfield3: data.tsaleslist[i].SaleCustField3 || '',
                    comments: data.tsaleslist[i].Comments || "",
                    type: data.tsaleslist[i].Type || "",
                  };
                  //if(data.tsaleslist[i].Deleted == false){
                  dataTableList.push(dataList);
                  //}
                }
              }
              templateObject.datatablerecords.set(dataTableList);
              if (templateObject.datatablerecords.get()) {


                setTimeout(function () {
                  MakeNegative();
                }, 100);
              }

              setTimeout(function () {
                $(".fullScreenSpin").css("display", "none");
                //$.fn.dataTable.moment('DD/MM/YY');
                $("#tblSalesOverview")
                  .DataTable({
                    // dom: 'lBfrtip',
                    columnDefs: [
                      {
                        type: "date",
                        targets: 0,
                      },
                    ],
                    sDom: "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                    buttons: [
                      {
                        extend: "excelHtml5",
                        text: "",
                        download: "open",
                        className: "btntabletocsv hiddenColumn",
                        filename: "Sales Overview List - " + moment().format(),
                        orientation: "portrait",
                        exportOptions: {
                          columns: ":visible",
                          format: {
                            body: function (data, row, column) {
                              if (data.includes("</span>")) {
                                var res = data.split("</span>");
                                data = res[1];
                              }

                              return column === 1
                                ? data.replace(/<.*?>/gi, "")
                                : data;
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
                        filename: "Sales Overview List - " + moment().format(),
                        exportOptions: {
                          columns: ":visible",
                          stripHtml: false,
                        },
                      },
                    ],
                    select: true,
                    destroy: true,
                    colReorder: true,
                    // bStateSave: true,
                    // rowId: 0,
                    pageLength: initialReportDatatableLoad,
                    bLengthChange: false,
                    searching: true,
                    lengthMenu: [
                      [initialReportDatatableLoad, -1],
                      [initialReportDatatableLoad, "All"],
                    ],
                    info: true,
                    responsive: true,
                    order: [
                      [0, "desc"],
                      [2, "desc"],
                    ],
                    // "aaSorting": [[1,'desc']],
                    action: function () {
                      $("#tblSalesOverview").DataTable().ajax.reload();
                    },
                    fnDrawCallback: function (oSettings) {
                      let checkurlIgnoreDate =
                        FlowRouter.current().queryParams.ignoredate;

                      $(".paginate_button.page-item").removeClass("disabled");
                      $("#tblPurchaseOverview_ellipsis").addClass("disabled");

                      if (oSettings._iDisplayLength == -1) {
                        if (oSettings.fnRecordsDisplay() > 150) {
                          $(".paginate_button.page-item.previous").addClass(
                            "disabled"
                          );
                          $(".paginate_button.page-item.next").addClass(
                            "disabled"
                          );
                        }
                      } else {
                      }
                      if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                        $(".paginate_button.page-item.next").addClass(
                          "disabled"
                        );
                      }
                      $(
                        ".paginate_button.next:not(.disabled)",
                        this.api().table().container()
                      ).on("click", function () {
                        $(".fullScreenSpin").css("display", "inline-block");
                        let dataLenght = oSettings._iDisplayLength;

                        var dateFrom = new Date(
                          $("#dateFrom").datepicker("getDate")
                        );
                        var dateTo = new Date(
                          $("#dateTo").datepicker("getDate")
                        );

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
                        if(data.Params.IgnoreDates == true){
                          sideBarService
                            .getSalesListData(
                              formatDateFrom,
                              formatDateTo,
                              true,
                              initialDatatableLoad,
                              oSettings.fnRecordsDisplay()
                            )
                            .then(function (dataObjectnew) {
                              getVS1Data("TSalesList")
                                .then(function (dataObjectold) {
                                  if (dataObjectold.length == 0) {
                                  } else {
                                    let dataOld = JSON.parse(
                                      dataObjectold[0].data
                                    );
                                    var thirdaryData = $.merge(
                                      $.merge([], dataObjectnew.tsaleslist),
                                      dataOld.tsaleslist
                                    );
                                    let objCombineData = {
                                      Params: dataOld.Params,
                                      tsaleslist: thirdaryData,
                                    };

                                    addVS1Data(
                                      "TSalesList",
                                      JSON.stringify(objCombineData)
                                    )
                                      .then(function (datareturn) {
                                        templateObject.resetData(
                                          objCombineData
                                        );
                                        $(".fullScreenSpin").css(
                                          "display",
                                          "none"
                                        );
                                      })
                                      .catch(function (err) {
                                        $(".fullScreenSpin").css(
                                          "display",
                                          "none"
                                        );
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
                            .getSalesListData(
                              formatDateFrom,
                              formatDateTo,
                              false,
                              initialDatatableLoad,
                              oSettings.fnRecordsDisplay()
                            )
                            .then(function (dataObjectnew) {
                              getVS1Data("TSalesList")
                                .then(function (dataObjectold) {
                                  if (dataObjectold.length == 0) {
                                  } else {
                                    let dataOld = JSON.parse(
                                      dataObjectold[0].data
                                    );
                                    var thirdaryData = $.merge(
                                      $.merge([], dataObjectnew.tsaleslist),
                                      dataOld.tsaleslist
                                    );
                                    let objCombineData = {
                                      Params: dataOld.Params,
                                      tsaleslist: thirdaryData,
                                    };

                                    addVS1Data(
                                      "TSalesList",
                                      JSON.stringify(objCombineData)
                                    )
                                      .then(function (datareturn) {
                                        templateObject.resetData(
                                          objCombineData
                                        );
                                        $(".fullScreenSpin").css(
                                          "display",
                                          "none"
                                        );
                                      })
                                      .catch(function (err) {
                                        $(".fullScreenSpin").css(
                                          "display",
                                          "none"
                                        );
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
                    language: { search: "",searchPlaceholder: "Search List..." },
                    fnInitComplete: function () {
                      this.fnPageChange('last');
                      if(data.Params.Search.replace(/\s/g, "") == ""){
                        $("<button class='btn btn-danger btnHideDeleted' type='button' id='btnHideDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='far fa-check-circle' style='margin-right: 5px'></i>Hide Deleted</button>").insertAfter("#tblSalesOverview_filter");
                      }else{
                        $("<button class='btn btn-primary btnViewDeleted' type='button' id='btnViewDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fa fa-trash' style='margin-right: 5px'></i>View Deleted</button>").insertAfter("#tblSalesOverview_filter");
                      }
                      $("<button class='btn btn-primary btnRefreshSalesOverview' type='button' id='btnRefreshSalesOverview' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>"
                      ).insertAfter("#tblSalesOverview_filter");

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
                      let countTableData = data.Params.Count || 0; //get count from API data

                      return (
                        "Showing " +
                        iStart +
                        " to " +
                        iEnd +
                        " of " +
                        countTableData
                      );
                    },
                  })
                  .on("page", function () {
                    setTimeout(function () {
                      MakeNegative();
                    }, 100);

                  })
                  .on("column-reorder", function () {});

              }, 0);

              // setTimeout(function () {
              //   templateObject.getAllCustomFieldDisplaySettings();
              // }, 500);

              // var columns = $("#tblSalesOverview th");
              // let sTible = "";
              // let sWidth = "";
              // let sIndex = "";
              // let sVisible = "";
              // let columVisible = false;
              // let sClass = "";
              // $.each(columns, function (i, v) {
              //   if (v.hidden == false) {
              //     columVisible = true;
              //   }
              //   if (v.className.includes("hiddenColumn")) {
              //     columVisible = false;
              //   }
              //   sWidth = v.style.width.replace("px", "");

              //   let datatablerecordObj = {
              //     sTitle: v.innerText || "",
              //     sWidth: sWidth || "",
              //     sIndex: v.cellIndex || "",
              //     sVisible: columVisible || false,
              //     sClass: v.className || "",
              //   };
              //   tableHeaderList.push(datatablerecordObj);
              // });
              // templateObject.tableheaderrecords.set(tableHeaderList);
              // $("div.dataTables_filter input").addClass(
              //   "form-control form-control-sm"
              // );
            })
            .catch(function (err) {
              // Bert.alert('<strong>' + err + '</strong>!', 'danger');
              $(".fullScreenSpin").css("display", "none");
              // Meteor._reload.reload();
            });
        } else {
          let data = JSON.parse(dataObject[0].data);
          if (data.Params.IgnoreDates == true) {
            $("#dateFrom").attr("readonly", true);
            $("#dateTo").attr("readonly", true);
            //FlowRouter.go("/salesoverview?ignoredate=true");
          } else {
            $("#dateFrom").attr("readonly", false);
            $("#dateTo").attr("readonly", false);
            $("#dateFrom").val(data.Params.DateFrom != ""? moment(data.Params.DateFrom).format("DD/MM/YYYY"): data.Params.DateFrom);
            $("#dateTo").val(data.Params.DateTo != ""? moment(data.Params.DateTo).format("DD/MM/YYYY"): data.Params.DateTo);
          }
          deleteFilter = false;
          if( data.Params.Search == ""){
            deleteFilter = true;
          }

          let useData = data.tsaleslist;
          let lineItems = [];
          let lineItemObj = {};
          $(".fullScreenSpin").css("display", "none");
          for (let i = 0; i < useData.length; i++) {
            let totalAmountEx =
              utilityService.modifynegativeCurrencyFormat(
                useData[i].TotalAmount
              ) || 0.0;
            let totalTax =
              utilityService.modifynegativeCurrencyFormat(
                useData[i].TotalTax
              ) || 0.0;
            // Currency+''+useData[i].TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
            let totalAmount =
              utilityService.modifynegativeCurrencyFormat(
                useData[i].TotalAmountinc
              ) || 0.0;
            let totalPaid =
              utilityService.modifynegativeCurrencyFormat(useData[i].Payment) ||
              0.0;
            let totalOutstanding =
              utilityService.modifynegativeCurrencyFormat(useData[i].Balance) ||
              0.0;

              let salestatus = useData[i].Status || '';
              if(useData[i].Done == true){
                salestatus = "Deleted";
              }else if(useData[i].CustomerName == ''){
                salestatus = "Deleted";
              };
            if( ( deleteFilter == true &&  salestatus == "Deleted" ) || salestatus !=  'Deleted' ){
              var dataList = {
                id: useData[i].SaleId || "",
                employee: useData[i].employeename || "",
                sortdate:
                  useData[i].SaleDate != ""
                    ? moment(useData[i].SaleDate).format("YYYY/MM/DD")
                    : useData[i].SaleDate,
                saledate:
                  useData[i].SaleDate != ""
                    ? moment(useData[i].SaleDate).format("DD/MM/YYYY")
                    : useData[i].SaleDate,
                customername: useData[i].CustomerName || "",
                totalamountex: totalAmountEx || 0.0,
                totaltax: totalTax || 0.0,
                totalamount: totalAmount || 0.0,
                totalpaid: totalPaid || 0.0,
                totaloustanding: totalOutstanding || 0.0,
                salestatus: salestatus || "",
                custfield1: useData[i].SaleCustField1 || '',
                custfield2: useData[i].SaleCustField2 || '',
                custfield3: useData[i].SaleCustField3 || '',
                comments: useData[i].Comments || "",
                type: useData[i].Type || "",
              };
              //if(useData[i].Deleted == false){
              dataTableList.push(dataList);
              //}
            }
          }
          templateObject.datatablerecords.set(dataTableList);
          if (templateObject.datatablerecords.get()) {


            setTimeout(function () {
              MakeNegative();
            }, 100);
          }

          setTimeout(function () {
            $(".fullScreenSpin").css("display", "none");
            //$.fn.dataTable.moment('DD/MM/YY');
            $("#tblSalesOverview")
              .DataTable({
                // dom: 'lBfrtip',
                columnDefs: [
                  {
                    type: "date",
                    targets: 0,
                  },
                ],
                sDom: "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                buttons: [
                  {
                    extend: "excelHtml5",
                    text: "",
                    download: "open",
                    className: "btntabletocsv hiddenColumn",
                    filename: "Sales Overview List - " + moment().format(),
                    orientation: "portrait",
                    exportOptions: {
                      columns: ":visible",
                      format: {
                        body: function (data, row, column) {
                          if (data.includes("</span>")) {
                            var res = data.split("</span>");
                            data = res[1];
                          }

                          return column === 1
                            ? data.replace(/<.*?>/gi, "")
                            : data;
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
                    filename: "Sales Overview List - " + moment().format(),
                    exportOptions: {
                      columns: ":visible",
                      stripHtml: false,
                    },
                  },
                ],
                select: true,
                destroy: true,
                colReorder: true,
                // bStateSave: true,
                // rowId: 0,
                pageLength: initialReportDatatableLoad,
                bLengthChange: false,
                searching: true,
                lengthMenu: [
                  [initialReportDatatableLoad, -1],
                  [initialReportDatatableLoad, "All"],
                ],
                info: true,
                responsive: true,
                order: [
                  [0, "desc"],
                  [2, "desc"],
                ],
                // "aaSorting": [[1,'desc']],
                action: function () {
                  $("#tblSalesOverview").DataTable().ajax.reload();
                },
                fnDrawCallback: function (oSettings) {
                  let checkurlIgnoreDate =
                    FlowRouter.current().queryParams.ignoredate;

                  $(".paginate_button.page-item").removeClass("disabled");
                  $("#tblPurchaseOverview_ellipsis").addClass("disabled");

                  if (oSettings._iDisplayLength == -1) {
                    if (oSettings.fnRecordsDisplay() > 150) {
                      $(".paginate_button.page-item.previous").addClass(
                        "disabled"
                      );
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

                    var dateFrom = new Date(
                      $("#dateFrom").datepicker("getDate")
                    );
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
                  if(data.Params.IgnoreDates == true){
                      sideBarService
                        .getSalesListData(
                          formatDateFrom,
                          formatDateTo,
                          true,
                          initialDatatableLoad,
                          oSettings.fnRecordsDisplay()
                        )
                        .then(function (dataObjectnew) {
                          getVS1Data("TSalesList")
                            .then(function (dataObjectold) {
                              if (dataObjectold.length == 0) {
                              } else {
                                let dataOld = JSON.parse(dataObjectold[0].data);
                                var thirdaryData = $.merge(
                                  $.merge([], dataObjectnew.tsaleslist),
                                  dataOld.tsaleslist
                                );
                                let objCombineData = {
                                  Params: dataOld.Params,
                                  tsaleslist: thirdaryData,
                                };

                                addVS1Data(
                                  "TSalesList",
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
                        .getSalesListData(
                          formatDateFrom,
                          formatDateTo,
                          false,
                          initialDatatableLoad,
                          oSettings.fnRecordsDisplay()
                        )
                        .then(function (dataObjectnew) {
                          getVS1Data("TSalesList")
                            .then(function (dataObjectold) {
                              if (dataObjectold.length == 0) {
                              } else {
                                let dataOld = JSON.parse(dataObjectold[0].data);
                                var thirdaryData = $.merge(
                                  $.merge([], dataObjectnew.tsaleslist),
                                  dataOld.tsaleslist
                                );
                                let objCombineData = {
                                  Params: dataOld.Params,
                                  tsaleslist: thirdaryData,
                                };

                                addVS1Data(
                                  "TSalesList",
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
                language: { search: "",searchPlaceholder: "Search List..." },
                fnInitComplete: function () {
                  this.fnPageChange('last');
                  if(data.Params.Search.replace(/\s/g, "") == ""){
                    $("<button class='btn btn-danger btnHideDeleted' type='button' id='btnHideDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='far fa-check-circle' style='margin-right: 5px'></i>Hide Deleted</button>").insertAfter("#tblSalesOverview_filter");
                  }else{
                    $("<button class='btn btn-primary btnViewDeleted' type='button' id='btnViewDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fa fa-trash' style='margin-right: 5px'></i>View Deleted</button>").insertAfter("#tblSalesOverview_filter");
                  }
                  $("<button class='btn btn-primary btnRefreshSalesOverview' type='button' id='btnRefreshSalesOverview' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>"
                  ).insertAfter("#tblSalesOverview_filter");

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
                  let countTableData = data.Params.Count || 0; //get count from API data

                  return (
                    "Showing " +
                    iStart +
                    " to " +
                    iEnd +
                    " of " +
                    countTableData
                  );
                },
              })
              .on("page", function () {
                setTimeout(function () {
                  MakeNegative();
                }, 100);

              })
              .on("column-reorder", function () {});
          }, 0);

          // setTimeout(function () {
          //   templateObject.getAllCustomFieldDisplaySettings();
          // }, 500);

          // var columns = $("#tblSalesOverview th");
          // let sTible = "";
          // let sWidth = "";
          // let sIndex = "";
          // let sVisible = "";
          // let columVisible = false;
          // let sClass = "";
          // $.each(columns, function (i, v) {
          //   if (v.hidden == false) {
          //     columVisible = true;
          //   }
          //   if (v.className.includes("hiddenColumn")) {
          //     columVisible = false;
          //   }
          //   sWidth = v.style.width.replace("px", "");

          //   let datatablerecordObj = {
          //     sTitle: v.innerText || "",
          //     sWidth: sWidth || "",
          //     sIndex: v.cellIndex || "",
          //     sVisible: columVisible || false,
          //     sClass: v.className || "",
          //   };
          //   tableHeaderList.push(datatablerecordObj);
          // });
          // templateObject.tableheaderrecords.set(tableHeaderList);
          // $("div.dataTables_filter input").addClass(
          //   "form-control form-control-sm"
          // );
        }
      }).catch(function (err) {
        sideBarService
          .getSalesListData(
            prevMonth11Date,
            toDate,
            true,
            initialReportLoad,
            0
          )
          .then(function (data) {
            let lineItems = [];
            let lineItemObj = {};
            addVS1Data("TSalesList", JSON.stringify(data));
            if (data.Params.IgnoreDates == true) {
              $("#dateFrom").attr("readonly", true);
              $("#dateTo").attr("readonly", true);
              //FlowRouter.go("/salesoverview?ignoredate=true");
            } else {
              $('#dateFrom').attr('readonly', false);
              $('#dateTo').attr('readonly', false);
              $("#dateFrom").val(data.Params.DateFrom != ""? moment(data.Params.DateFrom).format("DD/MM/YYYY"): data.Params.DateFrom);
              $("#dateTo").val(data.Params.DateTo != ""? moment(data.Params.DateTo).format("DD/MM/YYYY"): data.Params.DateTo);
            }
            for (let i = 0; i < data.tsaleslist.length; i++) {
              let totalAmountEx =
                utilityService.modifynegativeCurrencyFormat(
                  data.tsaleslist[i].TotalAmount
                ) || 0.0;
              let totalTax =
                utilityService.modifynegativeCurrencyFormat(
                  data.tsaleslist[i].TotalTax
                ) || 0.0;
              // Currency+''+data.tsaleslist[i].TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
              let totalAmount =
                utilityService.modifynegativeCurrencyFormat(
                  data.tsaleslist[i].TotalAmountinc
                ) || 0.0;
              let totalPaid =
                utilityService.modifynegativeCurrencyFormat(
                  data.tsaleslist[i].Payment
                ) || 0.0;
              let totalOutstanding =
                utilityService.modifynegativeCurrencyFormat(
                  data.tsaleslist[i].Balance
                ) || 0.0;

                let salestatus = data.tsaleslist[i].Status || '';
                if(data.tsaleslist[i].Done == true){
                  salestatus = "Deleted";
                }else if(data.tsaleslist[i].CustomerName == ''){
                  salestatus = "Deleted";
                };
              var dataList = {
                id: data.tsaleslist[i].SaleId || "",
                employee: data.tsaleslist[i].employeename || "",
                sortdate:
                  data.tsaleslist[i].SaleDate != ""
                    ? moment(data.tsaleslist[i].SaleDate).format("YYYY/MM/DD")
                    : data.tsaleslist[i].SaleDate,
                saledate:
                  data.tsaleslist[i].SaleDate != ""
                    ? moment(data.tsaleslist[i].SaleDate).format("DD/MM/YYYY")
                    : data.tsaleslist[i].SaleDate,
                customername: data.tsaleslist[i].CustomerName || "",
                totalamountex: totalAmountEx || 0.0,
                totaltax: totalTax || 0.0,
                totalamount: totalAmount || 0.0,
                totalpaid: totalPaid || 0.0,
                totaloustanding: totalOutstanding || 0.0,
                salestatus: salestatus || "",
                custfield1: data.tsaleslist[i].SaleCustField1 || '',
                custfield2: data.tsaleslist[i].SaleCustField2 || '',
                custfield3: data.tsaleslist[i].SaleCustField3 || '',
                comments: data.tsaleslist[i].Comments || "",
                type: data.tsaleslist[i].Type || "",
              };
              //if(data.tsaleslist[i].Deleted == false){
              dataTableList.push(dataList);
              //}
            }
            templateObject.datatablerecords.set(dataTableList);
            if (templateObject.datatablerecords.get()) {


              setTimeout(function () {
                MakeNegative();
              }, 100);
            }

            setTimeout(function () {
              $(".fullScreenSpin").css("display", "none");
              //$.fn.dataTable.moment('DD/MM/YY');
              $("#tblSalesOverview")
                .DataTable({
                  // dom: 'lBfrtip',
                  columnDefs: [
                    {
                      type: "date",
                      targets: 0,
                    },
                  ],
                  sDom: "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                  buttons: [
                    {
                      extend: "excelHtml5",
                      text: "",
                      download: "open",
                      className: "btntabletocsv hiddenColumn",
                      filename: "Sales Overview List - " + moment().format(),
                      orientation: "portrait",
                      exportOptions: {
                        columns: ":visible",
                        format: {
                          body: function (data, row, column) {
                            if (data.includes("</span>")) {
                              var res = data.split("</span>");
                              data = res[1];
                            }

                            return column === 1
                              ? data.replace(/<.*?>/gi, "")
                              : data;
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
                      filename: "Sales Overview List - " + moment().format(),
                      exportOptions: {
                        columns: ":visible",
                        stripHtml: false,
                      },
                    },
                  ],
                  select: true,
                  destroy: true,
                  colReorder: true,
                  // bStateSave: true,
                  // rowId: 0,
                  pageLength: initialReportDatatableLoad,
                  bLengthChange: false,
                  searching: true,
                  lengthMenu: [
                    [initialReportDatatableLoad, -1],
                    [initialReportDatatableLoad, "All"],
                  ],
                  info: true,
                  responsive: true,
                  order: [
                    [0, "desc"],
                    [2, "desc"],
                  ],
                  // "aaSorting": [[1,'desc']],
                  action: function () {
                    $("#tblSalesOverview").DataTable().ajax.reload();
                  },
                  fnDrawCallback: function (oSettings) {
                    let checkurlIgnoreDate =
                      FlowRouter.current().queryParams.ignoredate;

                    $(".paginate_button.page-item").removeClass("disabled");
                    $("#tblPurchaseOverview_ellipsis").addClass("disabled");

                    if (oSettings._iDisplayLength == -1) {
                      if (oSettings.fnRecordsDisplay() > 150) {
                        $(".paginate_button.page-item.previous").addClass(
                          "disabled"
                        );
                        $(".paginate_button.page-item.next").addClass(
                          "disabled"
                        );
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

                      var dateFrom = new Date(
                        $("#dateFrom").datepicker("getDate")
                      );
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
                    if(data.Params.IgnoreDates == true){
                        sideBarService
                          .getSalesListData(
                            formatDateFrom,
                            formatDateTo,
                            true,
                            initialDatatableLoad,
                            oSettings.fnRecordsDisplay()
                          )
                          .then(function (dataObjectnew) {
                            getVS1Data("TSalesList")
                              .then(function (dataObjectold) {
                                if (dataObjectold.length == 0) {
                                } else {
                                  let dataOld = JSON.parse(
                                    dataObjectold[0].data
                                  );
                                  var thirdaryData = $.merge(
                                    $.merge([], dataObjectnew.tsaleslist),
                                    dataOld.tsaleslist
                                  );
                                  let objCombineData = {
                                    Params: dataOld.Params,
                                    tsaleslist: thirdaryData,
                                  };

                                  addVS1Data(
                                    "TSalesList",
                                    JSON.stringify(objCombineData)
                                  )
                                    .then(function (datareturn) {
                                      templateObject.resetData(objCombineData);
                                      $(".fullScreenSpin").css(
                                        "display",
                                        "none"
                                      );
                                    })
                                    .catch(function (err) {
                                      $(".fullScreenSpin").css(
                                        "display",
                                        "none"
                                      );
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
                          .getSalesListData(
                            formatDateFrom,
                            formatDateTo,
                            false,
                            initialDatatableLoad,
                            oSettings.fnRecordsDisplay()
                          )
                          .then(function (dataObjectnew) {
                            getVS1Data("TSalesList")
                              .then(function (dataObjectold) {
                                if (dataObjectold.length == 0) {
                                } else {
                                  let dataOld = JSON.parse(
                                    dataObjectold[0].data
                                  );
                                  var thirdaryData = $.merge(
                                    $.merge([], dataObjectnew.tsaleslist),
                                    dataOld.tsaleslist
                                  );
                                  let objCombineData = {
                                    Params: dataOld.Params,
                                    tsaleslist: thirdaryData,
                                  };

                                  addVS1Data(
                                    "TSalesList",
                                    JSON.stringify(objCombineData)
                                  )
                                    .then(function (datareturn) {
                                      templateObject.resetData(objCombineData);
                                      $(".fullScreenSpin").css(
                                        "display",
                                        "none"
                                      );
                                    })
                                    .catch(function (err) {
                                      $(".fullScreenSpin").css(
                                        "display",
                                        "none"
                                      );
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
                  language: { search: "",searchPlaceholder: "Search List..." },
                  fnInitComplete: function () {
                    this.fnPageChange('last');
                    if(data.Params.Search.replace(/\s/g, "") == ""){
                      $("<button class='btn btn-danger btnHideDeleted' type='button' id='btnHideDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='far fa-check-circle' style='margin-right: 5px'></i>Hide Deleted</button>").insertAfter("#tblSalesOverview_filter");
                    }else{
                      $("<button class='btn btn-primary btnViewDeleted' type='button' id='btnViewDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fa fa-trash' style='margin-right: 5px'></i>View Deleted</button>").insertAfter("#tblSalesOverview_filter");
                    }
                    $("<button class='btn btn-primary btnRefreshSalesOverview' type='button' id='btnRefreshSalesOverview' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>"
                    ).insertAfter("#tblSalesOverview_filter");

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
                    let countTableData = data.Params.Count || 0; //get count from API data

                    return (
                      "Showing " +
                      iStart +
                      " to " +
                      iEnd +
                      " of " +
                      countTableData
                    );
                  },
                })
                .on("page", function () {
                  setTimeout(function () {
                    MakeNegative();
                  }, 100);

                })
                .on("column-reorder", function () {});
            }, 0);

            // setTimeout(function () {
            //   templateObject.getAllCustomFieldDisplaySettings();
            // }, 500);

            // var columns = $("#tblSalesOverview th");
            // let sTible = "";
            // let sWidth = "";
            // let sIndex = "";
            // let sVisible = "";
            // let columVisible = false;
            // let sClass = "";
            // $.each(columns, function (i, v) {
            //   if (v.hidden == false) {
            //     columVisible = true;
            //   }
            //   if (v.className.includes("hiddenColumn")) {
            //     columVisible = false;
            //   }
            //   sWidth = v.style.width.replace("px", "");

            //   let datatablerecordObj = {
            //     sTitle: v.innerText || "",
            //     sWidth: sWidth || "",
            //     sIndex: v.cellIndex || "",
            //     sVisible: columVisible || false,
            //     sClass: v.className || "",
            //   };
            //   tableHeaderList.push(datatablerecordObj);
            // });
            // templateObject.tableheaderrecords.set(tableHeaderList);
            // $("div.dataTables_filter input").addClass(
            //   "form-control form-control-sm"
            // );
          })
          .catch(function (err) {
            // Bert.alert('<strong>' + err + '</strong>!', 'danger');
            $(".fullScreenSpin").css("display", "none");
            // Meteor._reload.reload();
          });
      });

    $("#tblSalesOverview tbody").on("click", "tr", function () {
      var listData = $(this).closest("tr").attr("id");
      var transactiontype = $(event.target).closest("tr").find(".colType").text();
      var checkDeleted = $(this).closest('tr').find('.colStatus').text() || '';
      if (listData && transactiontype) {
        if(checkDeleted == "Deleted"){
          swal('You Cannot View This Transaction', 'Because It Has Been Deleted', 'info');
        }else{
        if (transactiontype === "Invoice") {
          FlowRouter.go("/invoicecard?id=" + listData);
        } else if (transactiontype === "Quote") {
          FlowRouter.go("/quotecard?id=" + listData);
        } else if (transactiontype === "Sales Order") {
          FlowRouter.go("/salesordercard?id=" + listData);
        } else if (transactiontype === "Refund") {
          FlowRouter.go("/refundcard?id=" + listData);
        } else {
          //FlowRouter.go('/purchaseordercard?id=' + listData);
        }
      }
      }
    });
  };

  templateObject.getAllSalesOrderData();

  templateObject.getAllFilterSalesOrderData = function (fromDate,toDate,ignoreDate) {
    sideBarService.getSalesListData(fromDate, toDate, ignoreDate, initialReportLoad, 0).then(function (data) {
        addVS1Data("TSalesList", JSON.stringify(data)).then(function (datareturn) {
            location.reload();
          }).catch(function (err) {
            location.reload();
          });
      }).catch(function (err) {
        // Bert.alert('<strong>' + err + '</strong>!', 'danger');
        //templateObject.datatablerecords.set("");
        $(".fullScreenSpin").css("display", "none");
        // Meteor._reload.reload();
      });
  };

  let urlParametersDateFrom = FlowRouter.current().queryParams.fromDate;
  let urlParametersDateTo = FlowRouter.current().queryParams.toDate;
  let urlParametersIgnoreDate = FlowRouter.current().queryParams.ignoredate;
  if (urlParametersDateFrom) {
    if (urlParametersIgnoreDate == true) {
      $("#dateFrom").attr("readonly", true);
      $("#dateTo").attr("readonly", true);
    } else {
      $("#dateFrom").attr("readonly", false);
      $("#dateTo").attr("readonly", false);
      $("#dateFrom").val(urlParametersDateFrom != "" ? moment(urlParametersDateFrom).format("DD/MM/YYYY"): urlParametersDateFrom);
      $("#dateTo").val(urlParametersDateTo != ""? moment(urlParametersDateTo).format("DD/MM/YYYY"): urlParametersDateTo);
    }
  }

  // custom field displaysettings
  // templateObject.getAllCustomFieldDisplaySettings = function () {
  //     let listType = "ltSalesOverview";
  //     try {
  //       getVS1Data("TltSalesOverview").then(function (dataObject) {
  //         if (dataObject.length == 0) {
  //           sideBarService.getAllCustomFieldsWithQuery(listType).then(function (data) {
  //             initCustomFieldDisplaySettings(data, listType);
  //             addVS1Data("TltSalesOverview", JSON.stringify(data));
  //           });
  //         } else {
  //           let data = JSON.parse(dataObject[0].data);
  //           initCustomFieldDisplaySettings(data, listType);
  //           sideBarService.getAllCustomFieldsWithQuery(listType).then(function (data) {
  //             addVS1Data("TltSalesOverview", JSON.stringify(data));
  //           });
  //         }
  //       })
  //     } catch (error) {
  //     }
  // }
  // templateObject.getAllCustomFieldDisplaySettings();

  tableResize();
});

Template.salesoverview.events({
  "click .btnViewDeleted": async function (e) {
    $(".fullScreenSpin").css("display", "inline-block");
    e.stopImmediatePropagation();
    const templateObject = Template.instance();
    await clearData('TSalesList');
    $('.btnViewDeleted').css('display','none');
    $('.btnHideDeleted').css('display','inline-block');
    await templateObject.getAllSalesOrderData(true);
  },
  "click .btnHideDeleted": async function (e) {
    $(".fullScreenSpin").css("display", "inline-block");
    e.stopImmediatePropagation();
    let templateObject = Template.instance();
    await clearData('TSalesList');
    $('.btnHideDeleted').css('display','none');
    $('.btnViewDeleted').css('display','inline-block');
    await templateObject.getAllSalesOrderData(false);
  },
  "keyup #tblSalesOverview_filter input": function (event) {
    if ($(event.target).val() != "") {
      $(".btnRefreshSalesOverview").addClass("btnSearchAlert");
    } else {
      $(".btnRefreshSalesOverview").removeClass("btnSearchAlert");
    }
    if (event.keyCode == 13) {
      $(".btnRefresh").trigger("click");
    }
  },
  "click .btnRefresh": function () {
    $(".fullScreenSpin").css("display", "inline-block");
    let templateObject = Template.instance();
    var currentBeginDate = new Date();
    var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
    let fromDateMonth = currentBeginDate.getMonth() + 1;
    let fromDateDay = currentBeginDate.getDate();
    if (currentBeginDate.getMonth() + 1 < 10) {
      fromDateMonth = "0" + (currentBeginDate.getMonth() + 1);
    } else {
      fromDateMonth = currentBeginDate.getMonth() + 1;
    }

    if (currentBeginDate.getDate() < 10) {
      fromDateDay = "0" + currentBeginDate.getDate();
    }
    var toDate =
      currentBeginDate.getFullYear() + "-" + fromDateMonth + "-" + fromDateDay;
    let prevMonth11Date = moment()
      .subtract(reportsloadMonths, "months")
      .format("YYYY-MM-DD");

    sideBarService
      .getSalesListData(prevMonth11Date, toDate, true, initialReportLoad, 0)
      .then(function (dataSales) {
        addVS1Data("TSalesList", JSON.stringify(dataSales))
          .then(function (datareturn) {
            sideBarService
              .getAllInvoiceList(initialDataLoad, 0)
              .then(function (data) {
                addVS1Data("TInvoiceEx", JSON.stringify(data))
                  .then(function (datareturn) {
                    window.open('/salesoverview', '_self');
                  }).catch(function (err) {
                    window.open('/salesoverview', '_self');
                  });
              }).catch(function (err) {
                window.open('/salesoverview', '_self');
              });
          })
          .catch(function (err) {
            sideBarService
              .getAllInvoiceList(initialDataLoad, 0)
              .then(function (data) {
                addVS1Data("TInvoiceEx", JSON.stringify(data))
                  .then(function (datareturn) {
                    window.open('/salesoverview', '_self');
                  })
                  .catch(function (err) {
                    window.open("/salesoverview", "_self");
                  });
              })
              .catch(function (err) {
                window.open("/salesoverview", "_self");
              });
          });
      })
      .catch(function (err) {
        window.open("/salesoverview", "_self");
      });
  },
  "change #dateTo": function () {
    let templateObject = Template.instance();
    $(".fullScreenSpin").css("display", "inline-block");
    $("#dateFrom").attr("readonly", false);
    $("#dateTo").attr("readonly", false);
    setTimeout(function(){
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

    //  templateObject.getAgedPayableReports(formatDateFrom,formatDateTo,false);
    var formatDate =
      dateTo.getDate() +
      "/" +
      (dateTo.getMonth() + 1) +
      "/" +
      dateTo.getFullYear();
    //templateObject.dateAsAt.set(formatDate);
    if (
      $("#dateFrom").val().replace(/\s/g, "") == "" &&
      $("#dateFrom").val().replace(/\s/g, "") == ""
    ) {
    } else {
      templateObject.getAllFilterSalesOrderData(
        formatDateFrom,
        formatDateTo,
        false
      );
    }
    },500);
  },
  "change #dateFrom": function () {
    let templateObject = Template.instance();
    $(".fullScreenSpin").css("display", "inline-block");
    $("#dateFrom").attr("readonly", false);
    $("#dateTo").attr("readonly", false);
    setTimeout(function(){
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

    //  templateObject.getAgedPayableReports(formatDateFrom,formatDateTo,false);
    var formatDate =
      dateTo.getDate() +
      "/" +
      (dateTo.getMonth() + 1) +
      "/" +
      dateTo.getFullYear();
    //templateObject.dateAsAt.set(formatDate);
    if (
      $("#dateFrom").val().replace(/\s/g, "") == "" &&
      $("#dateFrom").val().replace(/\s/g, "") == ""
    ) {
    } else {
      templateObject.getAllFilterSalesOrderData(
        formatDateFrom,
        formatDateTo,
        false
      );
    }
    },500);
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
      fromDateMonth = "0" + (currentBeginDate.getMonth() + 1);
    } else {
      fromDateMonth = currentBeginDate.getMonth() + 1;
    }

    if (currentBeginDate.getDate() < 10) {
      fromDateDay = "0" + currentBeginDate.getDate();
    }
    var toDateERPFrom =
      currentBeginDate.getFullYear() + "-" + fromDateMonth + "-" + fromDateDay;
    var toDateERPTo =
      currentBeginDate.getFullYear() + "-" + fromDateMonth + "-" + fromDateDay;

    var toDateDisplayFrom =
      fromDateDay + "/" + fromDateMonth + "/" + currentBeginDate.getFullYear();
    var toDateDisplayTo =
      fromDateDay + "/" + fromDateMonth + "/" + currentBeginDate.getFullYear();

    $("#dateFrom").val(toDateDisplayFrom);
    $("#dateTo").val(toDateDisplayTo);
    templateObject.getAllFilterSalesOrderData(
      toDateERPFrom,
      toDateERPTo,
      false
    );
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
      fromDateMonth = "0" + (currentBeginDate.getMonth() + 1);
    } else {
      fromDateMonth = currentBeginDate.getMonth() + 1;
    }

    if (currentBeginDate.getDate() < 10) {
      fromDateDay = "0" + currentBeginDate.getDate();
    }
    var toDateERPFrom =
      currentBeginDate.getFullYear() +
      "-" +
      fromDateMonth +
      "-" +
      (fromDateDay - 7);
    var toDateERPTo =
      currentBeginDate.getFullYear() + "-" + fromDateMonth + "-" + fromDateDay;

    var toDateDisplayFrom =
      fromDateDay -
      7 +
      "/" +
      fromDateMonth +
      "/" +
      currentBeginDate.getFullYear();
    var toDateDisplayTo =
      fromDateDay + "/" + fromDateMonth + "/" + currentBeginDate.getFullYear();

    $("#dateFrom").val(toDateDisplayFrom);
    $("#dateTo").val(toDateDisplayTo);
    templateObject.getAllFilterSalesOrderData(
      toDateERPFrom,
      toDateERPTo,
      false
    );
  },
  "click #lastMonth": function () {
    let templateObject = Template.instance();
    $(".fullScreenSpin").css("display", "inline-block");
    $("#dateFrom").attr("readonly", false);
    $("#dateTo").attr("readonly", false);
    var currentDate = new Date();

    var prevMonthLastDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0
    );
    var prevMonthFirstDate = new Date(
      currentDate.getFullYear() - (currentDate.getMonth() > 0 ? 0 : 1),
      (currentDate.getMonth() - 1 + 12) % 12,
      1
    );

    var formatDateComponent = function (dateComponent) {
      return (dateComponent < 10 ? "0" : "") + dateComponent;
    };

    var formatDate = function (date) {
      return (
        formatDateComponent(date.getDate()) +
        "/" +
        formatDateComponent(date.getMonth() + 1) +
        "/" +
        date.getFullYear()
      );
    };

    var formatDateERP = function (date) {
      return (
        date.getFullYear() +
        "-" +
        formatDateComponent(date.getMonth() + 1) +
        "-" +
        formatDateComponent(date.getDate())
      );
    };

    var fromDate = formatDate(prevMonthFirstDate);
    var toDate = formatDate(prevMonthLastDate);

    $("#dateFrom").val(fromDate);
    $("#dateTo").val(toDate);

    var getLoadDate = formatDateERP(prevMonthLastDate);
    let getDateFrom = formatDateERP(prevMonthFirstDate);
    templateObject.getAllFilterSalesOrderData(getDateFrom, getLoadDate, false);
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
      return m > 4 ? m - 4 : m;
    }

    var quarterAdjustment = (moment().month() % 3) + 1;
    var lastQuarterEndDate = moment()
      .subtract({
        months: quarterAdjustment,
      })
      .endOf("month");
    var lastQuarterStartDate = lastQuarterEndDate
      .clone()
      .subtract({
        months: 2,
      })
      .startOf("month");

    var lastQuarterStartDateFormat =
      moment(lastQuarterStartDate).format("DD/MM/YYYY");
    var lastQuarterEndDateFormat =
      moment(lastQuarterEndDate).format("DD/MM/YYYY");

    $("#dateFrom").val(lastQuarterStartDateFormat);
    $("#dateTo").val(lastQuarterEndDateFormat);

    let fromDateMonth = getQuarter(currentDate);
    var quarterMonth = getQuarter(currentDate);
    let fromDateDay = currentDate.getDate();

    var getLoadDate = moment(lastQuarterEndDate).format("YYYY-MM-DD");
    let getDateFrom = moment(lastQuarterStartDateFormat).format("YYYY-MM-DD");
    templateObject.getAllFilterSalesOrderData(getDateFrom, getLoadDate, false);
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
      fromDateMonth = "0" + (currentDate.getMonth() + 1);
    }
    if (currentDate.getDate() < 10) {
      fromDateDay = "0" + currentDate.getDate();
    }

    var fromDate =
      fromDateDay +
      "/" +
      fromDateMonth +
      "/" +
      Math.floor(currentDate.getFullYear() - 1);
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
    let getDateFrom =
      Math.floor(currentDate2.getFullYear() - 1) +
      "-" +
      fromDateMonth2 +
      "-" +
      currentDate2.getDate();
    templateObject.getAllFilterSalesOrderData(getDateFrom, getLoadDate, false);
  },
  "click #ignoreDate": function () {
    let templateObject = Template.instance();
    $(".fullScreenSpin").css("display", "inline-block");
    $("#dateFrom").attr("readonly", true);
    $("#dateTo").attr("readonly", true);
    templateObject.getAllFilterSalesOrderData("", "", true);
  },
  "click .feeOnTopInput": function (event) {
    if ($(event.target).is(":checked")) {
      $(".feeInPriceInput").attr("checked", false);
    }
  },
  "click .feeInPriceInput": function (event) {
    if ($(event.target).is(":checked")) {
      $(".feeOnTopInput").attr("checked", false);
    }
  },
  "click #newSalesOrder": function (event) {
    FlowRouter.go("/salesordercard");
  },
  "click .salesOrderList": function (event) {
    FlowRouter.go("/salesorderslist");
  },
  "click #newInvoice": function (event) {
    FlowRouter.go("/invoicecard");
  },
  "click #newRefund": function (event) {
    FlowRouter.go("/refundcard");
  },
  "click .invoiceList": function (event) {
    FlowRouter.go("/invoicelist");
  },
  "click .refundList": function (event) {
    FlowRouter.go("/refundlist");
  },
  "click .invoiceListBO": function (event) {
    FlowRouter.go("/invoicelistBO");
  },
  "click #newQuote": function (event) {
    FlowRouter.go("/quotecard");
  },
  "click .QuoteList": function (event) {
    FlowRouter.go("/quoteslist");
  },
  "click .btnTaxRateSettings": function (event) {
    $(".modal-backdrop").css("display", "none");
    FlowRouter.go("/taxratesettings");
  },
  "click .btnTermsSettings": function (event) {
    $(".modal-backdrop").css("display", "none");
    FlowRouter.go("/termsettings");
  },
  "click .btnCurrencySettings": function (event) {
    $(".modal-backdrop").css("display", "none");
    FlowRouter.go("/currenciessettings");
  },
  "click .chkDatatable": function (event) {
    var columns = $("#tblSalesOverview th");
    let columnDataValue = $(event.target)
      .closest("div")
      .find(".divcolumn")
      .text();

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
  'click .chkType': function(event) {
    if ($(event.target).is(':checked')) {
      $('.colType').addClass('showColumn');
      $('.colType').removeClass('hiddenColumn');
    } else {
      $('.colType').addClass('hiddenColumn');
      $('.colType').removeClass('showColumn');
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
  // display settings


  'change .rngRangeSaleDate': function(event) {
      let range = $(event.target).val();
      $(".spWidthSaleDate").html(range);
      $('.colSaleDate').css('width', range);
  },
  'change .rngRangeSalesNo': function(event) {
      let range = $(event.target).val();
      $(".spWidthSalesNo").html(range);
      $('.colSalesNo').css('width', range);
  },
  'change .rngRangeType': function(event) {
      let range = $(event.target).val();
      $(".spWidthType").html(range);
      $('.colType').css('width', range);
  },
  'change .rngRangeUnitPriceInc': function(event) {
      let range = $(event.target).val();
      $(".spWidthUnitPrice").html(range);
      $('.colUnitPriceInc').css('width', range);
  },
  'change .rngRangeUnitPriceEx': function(event) {
      let range = $(event.target).val();
      $('.colUnitPriceEx').css('width', range);
  },
  'change .rngRangeTax': function(event) {
      let range = $(event.target).val();
      $(".spWidthTax").html(range);
      $('.colTax').css('width', range);
  },
  'change .rngRangeAmountInc': function (event) {
      let range = $(event.target).val();
      //$(".spWidthAmount").html(range);
      $('.colAmountInc').css('width', range);
  },
  'change .rngRangeAmountEx': function (event) {
      let range = $(event.target).val();
      //$(".spWidthAmount").html(range);
      $('.colAmountEx').css('width', range);
  },
  'change .rngRangePaid': function (event) {
      let range = $(event.target).val();
      //$(".spWidthAmount").html(range);
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
      $(".spWidthCustomer").html(range);
      $('.colCustomer').css('width', range);
  },
  'change .rngRangeEmployee': function(event) {
      let range = $(event.target).val();
      $(".spWidthEmployee").html(range);
      $('.colEmployee').css('width', range);
  },
  'change .rngRangeComments': function(event) {
      let range = $(event.target).val();
      $(".spWidthComments").html(range);
      $('.colComments').css('width', range);
  },
"blur .divcolumn": function (event) {
  let columData = $(event.target).html();
  let columHeaderUpdate = $(event.target).attr("valueupdate");
  $("th.col" + columHeaderUpdate + "").html(columData);
},
  "click .resetTable": function (event) {
    let templateObject = Template.instance();
    let reset_data = templateObject.reset_data.get();
    // let isBatchSerialNoTracking = Session.get("CloudShowSerial") || false;
    // if(isBatchSerialNoTracking) {
    //   reset_data[11].display = true;
    // } else {
    //   reset_data[11].display = false;
    // }
    reset_data = reset_data.filter(redata => redata.display);

    $(".displaySettings").each(function (index) {
      let $tblrow = $(this);
      $tblrow.find(".divcolumn").text(reset_data[index].label);
      $tblrow.find(".custom-control-input").prop("checked", reset_data[index].active);

      let title = $("#tblSalesOverview").find("th").eq(index+1);
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
  "click .saveTable": async function (event) {
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
      let tableName = "tblSalesOverview";
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
                 $('#displaySettingsModal2').modal('hide');
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

  // "blur .divcolumn": function (event) {
  //   let columData = $(event.target).text();

  //   let columnDatanIndex = $(event.target)
  //     .closest("div.columnSettings")
  //     .attr("id");

  //   var datable = $("#tblSalesOverview").DataTable();
  //   var title = datable.column(columnDatanIndex).header();
  //   $(title).html(columData);
  // },
  "change .rngRange": function (event) {
    let range = $(event.target).val();
    // $(event.target).closest("div.divColWidth").find(".spWidth").html(range+'px');

    // let columData = $(event.target).closest("div.divColWidth").find(".spWidth").attr("value");
    let columnDataValue = $(event.target)
      .closest("div")
      .prev()
      .find(".divcolumn")
      .text();
    var datable = $("#tblSalesOverview th");
    $.each(datable, function (i, v) {
      if (v.innerText == columnDataValue) {
        let className = v.className;
        let replaceClass = className.replace(/ /g, ".");
        $("." + replaceClass + "").css("width", range + "px");
      }
    });
  },
  // "click .btnOpenSettings": function (event) {
  //   let templateObject = Template.instance();
  //   var columns = $("#tblSalesOverview th");

  //   const tableHeaderList = [];
  //   let sTible = "";
  //   let sWidth = "";
  //   let sIndex = "";
  //   let sVisible = "";
  //   let columVisible = false;
  //   let sClass = "";
  //   $.each(columns, function (i, v) {
  //     if (v.hidden == false) {
  //       columVisible = true;
  //     }
  //     if (v.className.includes("hiddenColumn")) {
  //       columVisible = false;
  //     }
  //     sWidth = v.style.width.replace("px", "");

  //     let datatablerecordObj = {
  //       custid: $(this).attr("custid") || 0,
  //       sTitle: v.innerText || "",
  //       sWidth: sWidth || "",
  //       sIndex: v.cellIndex || "",
  //       sVisible: columVisible || false,
  //       sClass: v.className || "",
  //     };
  //     tableHeaderList.push(datatablerecordObj);
  //   });

  //   templateObject.tableheaderrecords.set(tableHeaderList);
  // },
  "click #exportbtn": function () {
    $(".fullScreenSpin").css("display", "inline-block");
    jQuery("#tblSalesOverview_wrapper .dt-buttons .btntabletocsv").click();
    $(".fullScreenSpin").css("display", "none");
  },
  "click .printConfirm": function (event) {
    playPrintAudio();
    setTimeout(function(){
    $(".fullScreenSpin").css("display", "inline-block");
    jQuery("#tblSalesOverview_wrapper .dt-buttons .btntabletopdf").click();
    $(".fullScreenSpin").css("display", "none");
    // $('#html-2-pdfwrapper').css('display','block');
    // var pdf =  new jsPDF('portrait','mm','a4');
    // //new jsPDF('p', 'pt', 'a4');
    //   pdf.setFontSize(18);
    //   var source = document.getElementById('html-2-pdfwrapper');
    //   pdf.addHTML(source, function () {
    //      pdf.save('salesoverview.pdf');
    //      $('#html-2-pdfwrapper').css('display','none');
    //  });
  }, delayTimeAfterSound);
  },
  "click .close": function (event) {
    var vid = document.getElementById("myVideo");
    vid.pause();
  },

});

Template.salesoverview.helpers({
  datatablerecords: () => {
    return Template.instance()
      .datatablerecords.get()
      .sort(function (a, b) {
        if (a.saledate == "NA") {
          return 1;
        } else if (b.saledate == "NA") {
          return -1;
        }
        return a.saledate.toUpperCase() > b.saledate.toUpperCase() ? 1 : -1;
      });
  },
  tableheaderrecords: () => {
    return Template.instance().tableheaderrecords.get();
  },
  salesCloudPreferenceRec: () => {
    return CloudPreference.findOne({
      userid: Session.get("mycloudLogonID"),
      PrefName: "tblSalesOverview",
    });
  },
  currentdate: () => {
    var currentDate = new Date();
    var begunDate = moment(currentDate).format("DD/MM/YYYY");
    return begunDate;
  },
  loggedCompany: () => {
    return localStorage.getItem("mySession") || "";
  },

  // custom fields displaysettings
  custfields: () => {
    return Template.instance().custfields.get();
  },

  // custom fields displaysettings
  displayfields: () => {
    return Template.instance().displayfields.get();
  },

});
