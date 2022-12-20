import { SalesBoardService } from "../js/sales-service";
import { ReactiveVar } from "meteor/reactive-var";
import { CoreService } from "../js/core-service";
import { EmployeeProfileService } from "../js/profile-service";
import { AccountService } from "../accounts/account-service";
import { InvoiceService } from "../invoice/invoice-service";
import { UtilityService } from "../utility-service";
import { SideBarService } from "../js/sidebar-service";
import "../lib/global/indexdbstorage.js";
import { OrganisationService } from "../js/organisation-service";
import CachedHttp from "../lib/global/CachedHttp";
import erpObject from "../lib/global/erp-objects";
import TableHandler from "../js/Table/TableHandler";
import LoadingOverlay from "../LoadingOverlay";

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
Template.invoicelist.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.datatablerecords = new ReactiveVar([]);
  templateObject.tableheaderrecords = new ReactiveVar([]);
  templateObject.custfields = new ReactiveVar([]);
  templateObject.displayfields = new ReactiveVar([]);
  templateObject.reset_data = new ReactiveVar([]);
});

Template.invoicelist.onRendered(function () {
  $(".fullScreenSpin").css("display", "inline-block");
  let templateObject = Template.instance();
  let custfield1_index = 0;
  let custfield2_index = 1;
  let custfield3_index = 2;


  // set initial table rest_data
  function init_reset_data() {
    let reset_data = [
      { index: 0, label: 'Sort Date', class:'SortDate', active: false, display: false, width: "0" },
      { index: 1, label: "Sale Date", class: "SaleDate", active: true, display: true, width: "" },
      { index: 2, label: "Sales No.", class: "SalesNo", active: true, display: true, width: "" },
      { index: 3, label: "Due Date", class: "DueDate", active: true, display: true, width: "" },
      { index: 4, label: "Customer", class: "Customer", active: true, display: true, width: "" },
      { index: 5, label: "Amount (Ex)", class: "AmountEx", active: true, display: true, width: "" },
      { index: 6, label: "Tax", class: "Tax", active: true, display: true, width: "" },
      { index: 7, label: "Amount (Inc)", class: "Amount", active: true, display: true, width: "" },
      { index: 8, label: "Paid", class: "Paid", active: true, display: true, width: "" },
      { index: 9, label: "Outstanding", class: "BalanceOutstanding", active: false, display: true, width: "" },
      { index: 10, label: "Status", class: "Status", active: true, display: true, width: "" },
      { index: 11, label: "P.O. Number", class: "PONumber", active: false, display: true, width: "" },
      { index: 12, label: "Reference", class: "Reference", active: false, display: true, width: "" },
      { index: 13, label: "Employee", class: "Employee", active: true, display: true, width: "" },
      { index: 14, label: "Comments", class: "Comments", active: false, display: true, width: "" },
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
          }
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
  templateObject.initCustomFieldDisplaySettings("", "tblInvoicelist");


  let accountService = new AccountService();
  let salesService = new SalesBoardService();
  const customerList = [];
  let salesOrderTable;
  var splashArray = new Array();
  const dataTableList = [];
  const tableHeaderList = [];

  if (FlowRouter.current().queryParams.success) {
    $(".btnRefresh").addClass("btnRefreshAlert");
  }

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
    onChangeMonthYear: function (year, month, inst) {
      // Set date to picker
      $(this).datepicker(
        "setDate",
        new Date(year, inst.selectedMonth, inst.selectedDay)
      );
      // Hide (close) the picker
      // $(this).datepicker('hide');
      // // Change ttrigger the on change function
      // $(this).trigger('change');
    },
  });

  if (FlowRouter.current().queryParams.range == "month") {
    fromDate = moment().startOf("month").startOf("day").format("DD/MM/YYYY");
    begunDate = moment().endOf("month").endOf("day").format("DD/MM/YYYY");
  }

  if (FlowRouter.current().queryParams.range == "year") {
    fromDate = moment()
      .subtract(12, "months")
      .startOf("day")
      .format("DD/MM/YYYY");
    begunDate = moment().endOf("day").format("DD/MM/YYYY");
  }

  if (FlowRouter.current().queryParams.range == "lastMonth") {
    fromDate = moment()
      .subtract(1, "month")
      .startOf("day")
      .format("DD/MM/YYYY");
    begunDate = moment().endOf("day").format("DD/MM/YYYY");
  }

  $("#dateFrom").val(fromDate);
  $("#dateTo").val(begunDate);


  function MakeNegative() {
    $("td").each(function () {
      if (
        $(this)
          .text()
          .indexOf("-" + Currency) >= 0
      )
        $(this).addClass("text-danger");
    });

    $("td.colStatus").each(function () {
      if ($(this).text() == "Deleted") $(this).addClass("text-deleted");
      if ($(this).text() == "Full") $(this).addClass("text-fullyPaid");
      if ($(this).text() == "Part") $(this).addClass("text-partialPaid");
      if ($(this).text() == "Rec") $(this).addClass("text-reconciled");
    });
  }

  templateObject.resetData = function (dataVal) {
    location.reload();
  };

  templateObject.loadCustomFields = async() => {
    let custFields = [];
    let customFieldCount = 3; // customfield tempcode
    let customData = {};

    await sideBarService.getAllCustomFields().then(function (data) {
      for (let x = 0; x < data.tcustomfieldlist.length; x++) {
        if (data.tcustomfieldlist[x].fields.ListType == 'ltSales') {
          customData = {
            active: data.tcustomfieldlist[x].fields.Active || false,
            id: parseInt(data.tcustomfieldlist[x].fields.ID) || 0,
            custfieldlabel: data.tcustomfieldlist[x].fields.Description || "",
            class: "custfield" + x,
            display: false,
            width: ""
            
          };
          custFields.push(customData);
        }
      }

      if (custFields.length < customFieldCount) {
        let remainder = customFieldCount - custFields.length;
        let getRemCustomFields = parseInt(custFields.length);
        // count = count + remainder;
        for (let r = 0; r < remainder; r++) {
          getRemCustomFields++;
          customData = {
            active: false,
            id: "",
            custfieldlabel: "Custom Field " + getRemCustomFields,
            class: "custfield" + r + customFields.length,
            display: false,
            width: ""
          };
          // count++;
          custFields.push(customData);
        }
      }
      templateObject.custfields.set(custFields);
    })
  }

  templateObject.loadInvoices = async (refresh = false) => {
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


      let data = await CachedHttp.get(erpObject.TInvoiceList, async () => {
        return await sideBarService.getAllTInvoiceListData(prevMonth11Date,toDate,true,initialReportLoad,0);
      }, {
        forceOverride: refresh,
        validate: (cachedResponse) => {
          return true;
        }
      });
      data = data.response;

      for (let i = 0; i < data.tinvoicelist.length; i++) {
        let totalAmountEx =
          utilityService.modifynegativeCurrencyFormat(
            data.tinvoicelist[i].TotalAmount
          ) || 0.0;
        let totalTax =
          utilityService.modifynegativeCurrencyFormat(
            data.tinvoicelist[i].TotalTax
          ) || 0.0;
        // Currency+''+data.tinvoiceex[i].fields.TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
        let totalAmount =
          utilityService.modifynegativeCurrencyFormat(
            data.tinvoicelist[i].TotalAmountInc
          ) || 0.0;
        let totalPaid =
          utilityService.modifynegativeCurrencyFormat(
            data.tinvoicelist[i].Payment
          ) || 0.0;
        let totalOutstanding =
          utilityService.modifynegativeCurrencyFormat(
            data.tinvoicelist[i].Balance
          ) || 0.0;
        let salestatus = data.tinvoicelist[i].QuoteStatus || "";
        if (data.tinvoicelist[i].Deleted == true) {
          salestatus = "Deleted";
        } else if (data.tinvoicelist[i].CustomerName == "") {
          salestatus = "Deleted";
        }

        var dataList = {
          id: data.tinvoicelist[i].SaleID || "",
          apptid: data.tinvoicelist[i].AppointID || 0,
          employee: data.tinvoicelist[i].EmployeeName || "",
          sortdate:
            data.tinvoicelist[i].SaleDate != ""
              ? moment(data.tinvoicelist[i].SaleDate).format(
                  "YYYY/MM/DD"
                )
              : data.tinvoicelist[i].SaleDate,
          saledate:
            data.tinvoicelist[i].SaleDate != ""
              ? moment(data.tinvoicelist[i].SaleDate).format(
                  "DD/MM/YYYY"
                )
              : data.tinvoicelist[i].SaleDate,
          duedate:
            data.tinvoicelist[i].DueDate != ""
              ? moment(data.tinvoicelist[i].DueDate).format(
                  "DD/MM/YYYY"
                )
              : data.tinvoicelist[i].DueDate,
          customername: data.tinvoicelist[i].CustomerName || "",
          totalamountex: totalAmountEx || 0.0,
          totaltax: totalTax || 0.0,
          totalamount: totalAmount || 0.0,
          totalpaid: totalPaid || 0.0,
          totaloustanding: totalOutstanding || 0.0,
          salestatus: salestatus || "",
          ponumber: data.tinvoicelist[i].PONumber || "",
          referenceno: data.tinvoicelist[i].ReferenceNo || "",
          custfield1: data.tinvoicelist[i].SaleCustField1 || "",
          custfield2: data.tinvoicelist[i].SaleCustField2 || "",
          custfield3: data.tinvoicelist[i].SaleCustField3 || "",
          comments: data.tinvoicelist[i].Comments || "",
          // shipdate:data.tinvoiceex[i].fields.ShipDate !=''? moment(data.tinvoiceex[i].fields.ShipDate).format("DD/MM/YYYY"): data.tinvoiceex[i].fields.ShipDate,
        };

        let tmpObjCustFields = templateObject.custfields.get();
        if (dataList.custfield1 != "") {
          tmpObjCustFields[custfield1_index].active = true;
          tmpObjCustFields[custfield1_index].display = true;
        } else {
          tmpObjCustFields[custfield1_index].active = false;
          tmpObjCustFields[custfield1_index].display = false;
        }

        if (dataList.custfield2 != "") {
          tmpObjCustFields[custfield2_index].active = true;
          tmpObjCustFields[custfield2_index].display = true;
        } else {
          tmpObjCustFields[custfield2_index].active = false;
          tmpObjCustFields[custfield2_index].display = false;
        }

        if (dataList.custfield3 != "") {
          tmpObjCustFields[custfield3_index].active = true;
          tmpObjCustFields[custfield3_index].display = true;
        } else {
          tmpObjCustFields[custfield3_index].active = false;
          tmpObjCustFields[custfield3_index].display = false;
        }
        
        templateObject.custfields.set(tmpObjCustFields);
        //if (data.tinvoiceex[i].fields.Deleted == false && data.tinvoiceex[i].fields.CustomerName.replace(/\s/g, '') != '') {
        dataTableList.push(dataList);
        //}

        //}
      }

      templateObject.datatablerecords.set(dataTableList);

      if (templateObject.datatablerecords.get()) {
        Meteor.call(
          "readPrefMethod",
          Session.get("mycloudLogonID"),
          "tblInvoicelist",
          function (error, result) {
            if (error) {
            } else {
              if (result) {
                for (let i = 0; i < result.customFields.length; i++) {
                  let customcolumn = result.customFields;
                  let columData = customcolumn[i].label;
                  let columHeaderUpdate = customcolumn[
                    i
                  ].thclass.replace(/ /g, ".");
                  let hiddenColumn = customcolumn[i].hidden;
                  let columnClass = columHeaderUpdate.split(".")[1];
                  let columnWidth = customcolumn[i].width;
                  let columnindex = customcolumn[i].index + 1;

                  if (hiddenColumn == true) {
                    $("." + columnClass + "").addClass("hiddenColumn");
                    $("." + columnClass + "").removeClass("showColumn");
                  } else if (hiddenColumn == false) {
                    $("." + columnClass + "").removeClass(
                      "hiddenColumn"
                    );
                    $("." + columnClass + "").addClass("showColumn");
                  }
                }
              }
            }
          }
        );

        setTimeout(function () {
          MakeNegative();
        }, 100);
      }

      setTimeout(function () {
        $("#tblInvoicelist")
          .DataTable({
            ...TableHandler.getDefaultTableConfiguration("tblInvoicelist"),
            columnDefs: [
              {
                type: "date",
                targets: 0,
              },
            ],
            //sDom: "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
            buttons: [
              {
                extend: "excelHtml5",
                text: "",
                download: "open",
                className: "btntabletocsv hiddenColumn",
                filename: "Invoice List excel - " + moment().format(),
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
                title: "Invoice List",
                filename: "Invoice List - " + moment().format(),
                exportOptions: {
                  columns: ":visible",
                  stripHtml: false,
                },
              },
            ],
            // select: true,
            // destroy: true,
            // colReorder: true,
            // // bStateSave: true,
            // // rowId: 0,
            pageLength: initialDatatableLoad,
            bLengthChange: false,
            // info: true,
            // responsive: true,
            order: [
              [0, "desc"],
              [2, "desc"],
            ],
            action: function () {
              $("#tblInvoicelist").DataTable().ajax.reload();
            },
            fnDrawCallback: function (oSettings) {
              let checkurlIgnoreDate =
                FlowRouter.current().queryParams.ignoredate;

              $(".paginate_button.page-item").removeClass("disabled");
              $("#tblInvoicelist_ellipsis").addClass("disabled");

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
                if (data.Params.IgnoreDates == true) {
                  sideBarService
                    .getAllTInvoiceListData(
                      formatDateFrom,
                      formatDateTo,
                      true,
                      initialDatatableLoad,
                      oSettings.fnRecordsDisplay()
                    )
                    .then(function (dataObjectnew) {
                      getVS1Data("TInvoiceList")
                        .then(function (dataObjectold) {
                          if (dataObjectold.length == 0) {
                          } else {
                            let dataOld = JSON.parse(
                              dataObjectold[0].data
                            );

                            var thirdaryData = $.merge(
                              $.merge([], dataObjectnew.tinvoicelist),
                              dataOld.tinvoicelist
                            );
                            let objCombineData = {
                              Params: dataOld.Params,
                              tinvoicelist: thirdaryData,
                            };

                            addVS1Data(
                              "TInvoiceList",
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
                    .getAllTInvoiceListData(
                      formatDateFrom,
                      formatDateTo,
                      false,
                      initialDatatableLoad,
                      oSettings.fnRecordsDisplay()
                    )
                    .then(function (dataObjectnew) {
                      getVS1Data("TInvoiceList")
                        .then(function (dataObjectold) {
                          if (dataObjectold.length == 0) {
                          } else {
                            let dataOld = JSON.parse(
                              dataObjectold[0].data
                            );

                            var thirdaryData = $.merge(
                              $.merge([], dataObjectnew.tinvoicelist),
                              dataOld.tinvoicelist
                            );
                            let objCombineData = {
                              Params: dataOld.Params,
                              tinvoicelist: thirdaryData,
                            };

                            addVS1Data(
                              "TInvoiceList",
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
            // language: { search: "",searchPlaceholder: "Search List..." },
            fnInitComplete: function () {
              this.fnPageChange("last");
              if (data.Params.Search.replace(/\s/g, "") == "") {
                $(
                  "<button class='btn btn-danger btnHideDeleted' type='button' id='btnHideDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='far fa-check-circle' style='margin-right: 5px'></i>Hide Deleted</button>"
                ).insertAfter("#tblInvoicelist_filter");
              } else {
                $(
                  "<button class='btn btn-primary btnViewDeleted' type='button' id='btnViewDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fa fa-trash' style='margin-right: 5px'></i>View Deleted</button>"
                ).insertAfter("#tblInvoicelist_filter");
              }
              $(
                "<button class='btn btn-primary btnRefreshInvoiceList' type='button' id='btnRefreshInvoiceList' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>"
              ).insertAfter("#tblInvoicelist_filter");
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
            let draftRecord = templateObject.datatablerecords.get();
            templateObject.datatablerecords.set(draftRecord);
          })
          .on("column-reorder", function () {})
          .on("length.dt", function (e, settings, len) {
            setTimeout(function () {
              MakeNegative();
            }, 100);
          });

        // $('#tblInvoicelist').DataTable().column( 0 ).visible( true );
        $(".fullScreenSpin").css("display", "none");
      }, 0);

      $("#tblInvoicelist tbody").on("click", "tr", function () {
        var listData = $(this).closest("tr").attr("id");
        var apptId = $(this).closest("tr").attr("apptid");
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
            // let apptId = FlowRouter.current().queryParams.apptId;
            if(parseInt(apptId) > 0){
              FlowRouter.go(
                  "/invoicecard?id=" + listData + "&apptId=" + apptId
              );
            }
            else{
              FlowRouter.go(
                  "/invoicecard?id=" + listData
              );
            }
          }
        }
      });

  }

  templateObject.getAllInvoiceData = function () {
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

    getVS1Data("TInvoiceList")
      .then(function (dataObject) {
        if (dataObject.length == 0) {
          sideBarService
            .getAllTInvoiceListData(
              prevMonth11Date,
              toDate,
              true,
              initialReportLoad,
              0
            )
            .then(function (data) {
              let lineItems = [];
              let lineItemObj = {};
              addVS1Data("TInvoiceList", JSON.stringify(data))
                .then(function (datareturn) {})
                .catch(function (err) {});
              if (data.Params.IgnoreDates == true) {
                $("#dateFrom").attr("readonly", true);
                $("#dateTo").attr("readonly", true);
              } else {
                $("#dateFrom").attr("readonly", false);
                $("#dateTo").attr("readonly", false);
                $("#dateFrom").val(
                  data.Params.DateFrom != ""
                    ? moment(data.Params.DateFrom).format("DD/MM/YYYY")
                    : data.Params.DateFrom
                );
                $("#dateTo").val(
                  data.Params.DateTo != ""
                    ? moment(data.Params.DateTo).format("DD/MM/YYYY")
                    : data.Params.DateTo
                );
              }
              for (let i = 0; i < data.tinvoicelist.length; i++) {
                let totalAmountEx =
                  utilityService.modifynegativeCurrencyFormat(
                    data.tinvoicelist[i].TotalAmount
                  ) || 0.0;
                let totalTax =
                  utilityService.modifynegativeCurrencyFormat(
                    data.tinvoicelist[i].TotalTax
                  ) || 0.0;
                // Currency+''+data.tinvoiceex[i].fields.TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
                let totalAmount =
                  utilityService.modifynegativeCurrencyFormat(
                    data.tinvoicelist[i].TotalAmountInc
                  ) || 0.0;
                let totalPaid =
                  utilityService.modifynegativeCurrencyFormat(
                    data.tinvoicelist[i].Payment
                  ) || 0.0;
                let totalOutstanding =
                  utilityService.modifynegativeCurrencyFormat(
                    data.tinvoicelist[i].Balance
                  ) || 0.0;
                let salestatus = data.tinvoicelist[i].QuoteStatus || "";
                if (data.tinvoicelist[i].Deleted == true) {
                  salestatus = "Deleted";
                } else if (data.tinvoicelist[i].CustomerName == "") {
                  salestatus = "Deleted";
                }

                var dataList = {
                  id: data.tinvoicelist[i].SaleID || "",
                  apptid: data.tinvoicelist[i].AppointID || 0,
                  employee: data.tinvoicelist[i].EmployeeName || "",
                  sortdate:
                    data.tinvoicelist[i].SaleDate != ""
                      ? moment(data.tinvoicelist[i].SaleDate).format(
                          "YYYY/MM/DD"
                        )
                      : data.tinvoicelist[i].SaleDate,
                  saledate:
                    data.tinvoicelist[i].SaleDate != ""
                      ? moment(data.tinvoicelist[i].SaleDate).format(
                          "DD/MM/YYYY"
                        )
                      : data.tinvoicelist[i].SaleDate,
                  duedate:
                    data.tinvoicelist[i].DueDate != ""
                      ? moment(data.tinvoicelist[i].DueDate).format(
                          "DD/MM/YYYY"
                        )
                      : data.tinvoicelist[i].DueDate,
                  customername: data.tinvoicelist[i].CustomerName || "",
                  totalamountex: totalAmountEx || 0.0,
                  totaltax: totalTax || 0.0,
                  totalamount: totalAmount || 0.0,
                  totalpaid: totalPaid || 0.0,
                  totaloustanding: totalOutstanding || 0.0,
                  salestatus: salestatus || "",
                  ponumber: data.tinvoicelist[i].PONumber || "",
                  referenceno: data.tinvoicelist[i].ReferenceNo || "",
                  custfield1: data.tinvoicelist[i].SaleCustField1 || "",
                  custfield2: data.tinvoicelist[i].SaleCustField2 || "",
                  custfield3: data.tinvoicelist[i].SaleCustField3 || "",
                  comments: data.tinvoicelist[i].Comments || "",
                  // shipdate:data.tinvoiceex[i].fields.ShipDate !=''? moment(data.tinvoiceex[i].fields.ShipDate).format("DD/MM/YYYY"): data.tinvoiceex[i].fields.ShipDate,
                };

                //if (data.tinvoiceex[i].fields.Deleted == false && data.tinvoiceex[i].fields.CustomerName.replace(/\s/g, '') != '') {
                dataTableList.push(dataList);
                //}

                //}
              }

              templateObject.datatablerecords.set(dataTableList);

              if (templateObject.datatablerecords.get()) {
                Meteor.call(
                  "readPrefMethod",
                  Session.get("mycloudLogonID"),
                  "tblInvoicelist",
                  function (error, result) {
                    if (error) {
                    } else {
                      if (result) {
                        for (let i = 0; i < result.customFields.length; i++) {
                          let customcolumn = result.customFields;
                          let columData = customcolumn[i].label;
                          let columHeaderUpdate = customcolumn[
                            i
                          ].thclass.replace(/ /g, ".");
                          let hiddenColumn = customcolumn[i].hidden;
                          let columnClass = columHeaderUpdate.split(".")[1];
                          let columnWidth = customcolumn[i].width;
                          let columnindex = customcolumn[i].index + 1;

                          if (hiddenColumn == true) {
                            $("." + columnClass + "").addClass("hiddenColumn");
                            $("." + columnClass + "").removeClass("showColumn");
                          } else if (hiddenColumn == false) {
                            $("." + columnClass + "").removeClass(
                              "hiddenColumn"
                            );
                            $("." + columnClass + "").addClass("showColumn");
                          }
                        }
                      }
                    }
                  }
                );

                setTimeout(function () {
                  MakeNegative();
                }, 100);
              }

              $(".fullScreenSpin").css("display", "none");
              setTimeout(function () {
                $("#tblInvoicelist")
                  .DataTable({
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
                        filename: "Invoice List excel - " + moment().format(),
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
                        title: "Invoice List",
                        filename: "Invoice List - " + moment().format(),
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
                    pageLength: initialDatatableLoad,
                    bLengthChange: false,
                    info: true,
                    responsive: true,
                    order: [
                      [0, "desc"],
                      [2, "desc"],
                    ],
                    action: function () {
                      $("#tblInvoicelist").DataTable().ajax.reload();
                    },
                    fnDrawCallback: function (oSettings) {
                      let checkurlIgnoreDate =
                        FlowRouter.current().queryParams.ignoredate;

                      $(".paginate_button.page-item").removeClass("disabled");
                      $("#tblInvoicelist_ellipsis").addClass("disabled");

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
                        if (data.Params.IgnoreDates == true) {
                          sideBarService
                            .getAllTInvoiceListData(
                              formatDateFrom,
                              formatDateTo,
                              true,
                              initialDatatableLoad,
                              oSettings.fnRecordsDisplay()
                            )
                            .then(function (dataObjectnew) {
                              getVS1Data("TInvoiceList")
                                .then(function (dataObjectold) {
                                  if (dataObjectold.length == 0) {
                                  } else {
                                    let dataOld = JSON.parse(
                                      dataObjectold[0].data
                                    );

                                    var thirdaryData = $.merge(
                                      $.merge([], dataObjectnew.tinvoicelist),
                                      dataOld.tinvoicelist
                                    );
                                    let objCombineData = {
                                      Params: dataOld.Params,
                                      tinvoicelist: thirdaryData,
                                    };

                                    addVS1Data(
                                      "TInvoiceList",
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
                            .getAllTInvoiceListData(
                              formatDateFrom,
                              formatDateTo,
                              false,
                              initialDatatableLoad,
                              oSettings.fnRecordsDisplay()
                            )
                            .then(function (dataObjectnew) {
                              getVS1Data("TInvoiceList")
                                .then(function (dataObjectold) {
                                  if (dataObjectold.length == 0) {
                                  } else {
                                    let dataOld = JSON.parse(
                                      dataObjectold[0].data
                                    );

                                    var thirdaryData = $.merge(
                                      $.merge([], dataObjectnew.tinvoicelist),
                                      dataOld.tinvoicelist
                                    );
                                    let objCombineData = {
                                      Params: dataOld.Params,
                                      tinvoicelist: thirdaryData,
                                    };

                                    addVS1Data(
                                      "TInvoiceList",
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
                      this.fnPageChange("last");
                      if (data.Params.Search.replace(/\s/g, "") == "") {
                        $(
                          "<button class='btn btn-danger btnHideDeleted' type='button' id='btnHideDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='far fa-check-circle' style='margin-right: 5px'></i>Hide Deleted</button>"
                        ).insertAfter("#tblInvoicelist_filter");
                      } else {
                        $(
                          "<button class='btn btn-primary btnViewDeleted' type='button' id='btnViewDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fa fa-trash' style='margin-right: 5px'></i>View Deleted</button>"
                        ).insertAfter("#tblInvoicelist_filter");
                      }
                      $(
                        "<button class='btn btn-primary btnRefreshInvoiceList' type='button' id='btnRefreshInvoiceList' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>"
                      ).insertAfter("#tblInvoicelist_filter");
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
                    let draftRecord = templateObject.datatablerecords.get();
                    templateObject.datatablerecords.set(draftRecord);
                  })
                  .on("column-reorder", function () {})
                  .on("length.dt", function (e, settings, len) {
                    setTimeout(function () {
                      MakeNegative();
                    }, 100);
                  });

                // $('#tblInvoicelist').DataTable().column( 0 ).visible( true );
                $(".fullScreenSpin").css("display", "none");
              }, 0);

              // var columns = $("#tblInvoicelist th");
              // let sTible = "";
              // let sWidth = "";
              // let sIndex = "";
              // let sVisible = "";
              // let columVisible = false;
              // let isCustomField = false;
              // let sClass = "";
              // $.each(columns, function (i, v) {
              //   if (v.hidden == false) {
              //     columVisible = true;
              //   }
              //   if (v.className.includes("hiddenColumn")) {
              //     columVisible = false;
              //   }

              //   if (v.className.includes("customFieldColumn")) {
              //     isCustomField = true;
              //   } else {
              //     isCustomField = false;
              //   }

              //   sWidth = v.style.width.replace("px", "");

              //   let datatablerecordObj = {
              //     custid: $(this).attr("custid") || 0,
              //     sTitle: v.innerText || "",
              //     sWidth: sWidth || "9",
              //     sIndex: v.cellIndex || "",
              //     sVisible: columVisible || false,
              //     sCustomField: isCustomField || false,
              //     sClass: v.className || "",
              //   };
              //   tableHeaderList.push(datatablerecordObj);
              // });
              // templateObject.tableheaderrecords.set(tableHeaderList);
              // $("div.dataTables_filter input").addClass(
              //   "form-control form-control-sm"
              // );

              $("#tblInvoicelist tbody").on("click", "tr", function () {
                var listData = $(this).closest("tr").attr("id");
                var apptId = $(this).closest("tr").attr("apptid");
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
                    // let apptId = FlowRouter.current().queryParams.apptId;
                    if(parseInt(apptId) > 0){
                      FlowRouter.go(
                          "/invoicecard?id=" + listData + "&apptId=" + apptId
                      );
                    }
                    else{
                      FlowRouter.go(
                          "/invoicecard?id=" + listData
                      );
                    }
                  }
                }
              });
            })
            .catch(function (err) {
              // Bert.alert('<strong>' + err + '</strong>!', 'danger');
              $(".fullScreenSpin").css("display", "none");
              // Meteor._reload.reload();
            });
          templateObject.getCustomFieldData();
        } else {
          let data = JSON.parse(dataObject[0].data);
          let useData = data;
          let lineItems = [];
          let lineItemObj = {};
          if (data.Params.IgnoreDates == true) {
            $("#dateFrom").attr("readonly", true);
            $("#dateTo").attr("readonly", true);
          } else {
            $("#dateFrom").attr("readonly", false);
            $("#dateTo").attr("readonly", false);
            $("#dateFrom").val(
              data.Params.DateFrom != ""
                ? moment(data.Params.DateFrom).format("DD/MM/YYYY")
                : data.Params.DateFrom
            );
            $("#dateTo").val(
              data.Params.DateTo != ""
                ? moment(data.Params.DateTo).format("DD/MM/YYYY")
                : data.Params.DateTo
            );
          }
          for (let i = 0; i < data.tinvoicelist.length; i++) {
            let totalAmountEx =
              utilityService.modifynegativeCurrencyFormat(
                data.tinvoicelist[i].TotalAmount
              ) || 0.0;
            let totalTax =
              utilityService.modifynegativeCurrencyFormat(
                data.tinvoicelist[i].TotalTax
              ) || 0.0;
            // Currency+''+data.tinvoiceex[i].fields.TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
            let totalAmount =
              utilityService.modifynegativeCurrencyFormat(
                data.tinvoicelist[i].TotalAmountInc
              ) || 0.0;
            let totalPaid =
              utilityService.modifynegativeCurrencyFormat(
                data.tinvoicelist[i].Payment
              ) || 0.0;
            let totalOutstanding =
              utilityService.modifynegativeCurrencyFormat(
                data.tinvoicelist[i].Balance
              ) || 0.0;
            let salestatus = data.tinvoicelist[i].QuoteStatus || "";
            if (data.tinvoicelist[i].Deleted == true) {
              salestatus = "Deleted";
            } else if (data.tinvoicelist[i].CustomerName == "") {
              salestatus = "Deleted";
            }

            var dataList = {
              id: data.tinvoicelist[i].SaleID || "",
              apptid: data.tinvoicelist[i].AppointID || 0,
              employee: data.tinvoicelist[i].EmployeeName || "",
              sortdate:
                data.tinvoicelist[i].SaleDate != ""
                  ? moment(data.tinvoicelist[i].SaleDate).format("YYYY/MM/DD")
                  : data.tinvoicelist[i].SaleDate,
              saledate:
                data.tinvoicelist[i].SaleDate != ""
                  ? moment(data.tinvoicelist[i].SaleDate).format("DD/MM/YYYY")
                  : data.tinvoicelist[i].SaleDate,
              duedate:
                data.tinvoicelist[i].DueDate != ""
                  ? moment(data.tinvoicelist[i].DueDate).format("DD/MM/YYYY")
                  : data.tinvoicelist[i].DueDate,
              customername: data.tinvoicelist[i].CustomerName || "",
              totalamountex: totalAmountEx || 0.0,
              totaltax: totalTax || 0.0,
              totalamount: totalAmount || 0.0,
              totalpaid: totalPaid || 0.0,
              totaloustanding: totalOutstanding || 0.0,
              salestatus: salestatus || "",
              ponumber: data.tinvoicelist[i].PONumber || "",
              referenceno: data.tinvoicelist[i].ReferenceNo || "",
              custfield1: data.tinvoicelist[i].SaleCustField1 || "",
              custfield2: data.tinvoicelist[i].SaleCustField2 || "",
              custfield3: data.tinvoicelist[i].SaleCustField3 || "",
              custfield: data.tinvoicelist[i].SaleCustField || "",
              comments: data.tinvoicelist[i].Comments || "",
              // shipdate:data.tinvoiceex[i].fields.ShipDate !=''? moment(data.tinvoiceex[i].fields.ShipDate).format("DD/MM/YYYY"): data.tinvoiceex[i].fields.ShipDate,
            };

            //if (data.tinvoiceex[i].fields.Deleted == false && data.tinvoiceex[i].fields.CustomerName.replace(/\s/g, '') != '') {
            dataTableList.push(dataList);
            //}

            //}
          }

          templateObject.datatablerecords.set(dataTableList);

          if (templateObject.datatablerecords.get()) {
            Meteor.call(
              "readPrefMethod",
              Session.get("mycloudLogonID"),
              "tblInvoicelist",
              function (error, result) {
                if (error) {
                } else {
                  if (result) {
                    for (let i = 0; i < result.customFields.length; i++) {
                      let customcolumn = result.customFields;
                      let columData = customcolumn[i].label;
                      let columHeaderUpdate = customcolumn[i].thclass.replace(
                        / /g,
                        "."
                      );
                      let hiddenColumn = customcolumn[i].hidden;
                      let columnClass = columHeaderUpdate.split(".")[1];
                      let columnWidth = customcolumn[i].width;
                      let columnindex = customcolumn[i].index + 1;

                      if (hiddenColumn == true) {
                        $("." + columnClass + "").addClass("hiddenColumn");
                        $("." + columnClass + "").removeClass("showColumn");
                      } else if (hiddenColumn == false) {
                        $("." + columnClass + "").removeClass("hiddenColumn");
                        $("." + columnClass + "").addClass("showColumn");
                      }
                    }
                  }
                }
              }
            );

            setTimeout(function () {
              MakeNegative();
            }, 100);
          }

          $(".fullScreenSpin").css("display", "none");
          setTimeout(function () {
            $("#tblInvoicelist")
              .DataTable({
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
                    filename: "Invoice List excel - " + moment().format(),
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
                    title: "Invoice List",
                    filename: "Invoice List - " + moment().format(),
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
                pageLength: initialDatatableLoad,
                bLengthChange: false,
                info: true,
                responsive: true,
                order: [
                  [0, "desc"],
                  [2, "desc"],
                ],
                action: function () {
                  $("#tblInvoicelist").DataTable().ajax.reload();
                },
                fnDrawCallback: function (oSettings) {
                  let checkurlIgnoreDate =
                    FlowRouter.current().queryParams.ignoredate;

                  $(".paginate_button.page-item").removeClass("disabled");
                  $("#tblInvoicelist_ellipsis").addClass("disabled");

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
                    if (data.Params.IgnoreDates == true) {
                      sideBarService
                        .getAllTInvoiceListData(
                          formatDateFrom,
                          formatDateTo,
                          true,
                          initialDatatableLoad,
                          oSettings.fnRecordsDisplay()
                        )
                        .then(function (dataObjectnew) {
                          getVS1Data("TInvoiceList")
                            .then(function (dataObjectold) {
                              if (dataObjectold.length == 0) {
                              } else {
                                let dataOld = JSON.parse(dataObjectold[0].data);

                                var thirdaryData = $.merge(
                                  $.merge([], dataObjectnew.tinvoicelist),
                                  dataOld.tinvoicelist
                                );
                                let objCombineData = {
                                  Params: dataOld.Params,
                                  tinvoicelist: thirdaryData,
                                };

                                addVS1Data(
                                  "TInvoiceList",
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
                        .getAllTInvoiceListData(
                          formatDateFrom,
                          formatDateTo,
                          false,
                          initialDatatableLoad,
                          oSettings.fnRecordsDisplay()
                        )
                        .then(function (dataObjectnew) {
                          getVS1Data("TInvoiceList")
                            .then(function (dataObjectold) {
                              if (dataObjectold.length == 0) {
                              } else {
                                let dataOld = JSON.parse(dataObjectold[0].data);

                                var thirdaryData = $.merge(
                                  $.merge([], dataObjectnew.tinvoicelist),
                                  dataOld.tinvoicelist
                                );
                                let objCombineData = {
                                  Params: dataOld.Params,
                                  tinvoicelist: thirdaryData,
                                };

                                addVS1Data(
                                  "TInvoiceList",
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
                  this.fnPageChange("last");
                  if (data.Params.Search.replace(/\s/g, "") == "") {
                    $(
                      "<button class='btn btn-danger btnHideDeleted' type='button' id='btnHideDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='far fa-check-circle' style='margin-right: 5px'></i>Hide Deleted</button>"
                    ).insertAfter("#tblInvoicelist_filter");
                  } else {
                    $(
                      "<button class='btn btn-primary btnViewDeleted' type='button' id='btnViewDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fa fa-trash' style='margin-right: 5px'></i>View Deleted</button>"
                    ).insertAfter("#tblInvoicelist_filter");
                  }
                  $(
                    "<button class='btn btn-primary btnRefreshInvoiceList' type='button' id='btnRefreshInvoiceList' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>"
                  ).insertAfter("#tblInvoicelist_filter");
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
                let draftRecord = templateObject.datatablerecords.get();
                templateObject.datatablerecords.set(draftRecord);
              })
              .on("column-reorder", function () {})
              .on("length.dt", function (e, settings, len) {
                setTimeout(function () {
                  MakeNegative();
                }, 100);
              });

            // $('#tblInvoicelist').DataTable().column( 0 ).visible( true );
            $(".fullScreenSpin").css("display", "none");
          }, 0);
          // var columns = $("#tblInvoicelist th");
          // let sTible = "";
          // let sWidth = "";
          // let sIndex = "";
          // let sVisible = "";
          // let columVisible = false;
          // let sClass = "";
          // let isCustomField = false;

          // $.each(columns, function (i, v) {
          //   if (v.hidden == false) {
          //     columVisible = true;
          //   }
          //   if (v.className.includes("hiddenColumn")) {
          //     columVisible = false;
          //   }
          //   sWidth = v.style.width.replace("px", "");

          //   if (v.className.includes("customFieldColumn")) {
          //     isCustomField = true;
          //   } else {
          //     isCustomField = false;
          //   }

          //   let datatablerecordObj = {
          //     custid: $(this).attr("custid") || 0,
          //     sTitle: v.innerText || "",
          //     sWidth: sWidth || "",
          //     sIndex: v.cellIndex || "",
          //     sVisible: columVisible || false,
          //     sCustomField: isCustomField || false,
          //     sClass: v.className || "",
          //   };
          //   tableHeaderList.push(datatablerecordObj);
          // });
          // templateObject.tableheaderrecords.set(tableHeaderList);
          // $("div.dataTables_filter input").addClass(
          //   "form-control form-control-sm"
          // );
          $("#tblInvoicelist tbody").on("click", "tr", function () {
            var listData = $(this).closest("tr").attr("id");
            let apptId = $(this).closest("tr").attr("apptid");
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
                if(parseInt(apptId) > 0){
                  FlowRouter.go(
                      "/invoicecard?id=" + listData + "&apptId=" + apptId
                  );
                }
                else{
                  FlowRouter.go(
                      "/invoicecard?id=" + listData
                  );
                }
              }
            }
          });
          templateObject.getCustomFieldData();
        }
      })
      .catch(function (err) {
        sideBarService
          .getAllTInvoiceListData(
            prevMonth11Date,
            toDate,
            true,
            initialReportLoad,
            0
          )
          .then(function (data) {
            let lineItems = [];
            let lineItemObj = {};
            addVS1Data("TInvoiceList", JSON.stringify(data))
              .then(function (datareturn) {})
              .catch(function (err) {});
            if (data.Params.IgnoreDates == true) {
              $("#dateFrom").attr("readonly", true);
              $("#dateTo").attr("readonly", true);
            } else {
              $("#dateFrom").attr("readonly", false);
              $("#dateTo").attr("readonly", false);
              $("#dateFrom").val(
                data.Params.DateFrom != ""
                  ? moment(data.Params.DateFrom).format("DD/MM/YYYY")
                  : data.Params.DateFrom
              );
              $("#dateTo").val(
                data.Params.DateTo != ""
                  ? moment(data.Params.DateTo).format("DD/MM/YYYY")
                  : data.Params.DateTo
              );
            }
            for (let i = 0; i < data.tinvoicelist.length; i++) {
              let totalAmountEx =
                utilityService.modifynegativeCurrencyFormat(
                  data.tinvoicelist[i].TotalAmount
                ) || 0.0;
              let totalTax =
                utilityService.modifynegativeCurrencyFormat(
                  data.tinvoicelist[i].TotalTax
                ) || 0.0;
              // Currency+''+data.tinvoiceex[i].fields.TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
              let totalAmount =
                utilityService.modifynegativeCurrencyFormat(
                  data.tinvoicelist[i].TotalAmountInc
                ) || 0.0;
              let totalPaid =
                utilityService.modifynegativeCurrencyFormat(
                  data.tinvoicelist[i].Payment
                ) || 0.0;
              let totalOutstanding =
                utilityService.modifynegativeCurrencyFormat(
                  data.tinvoicelist[i].Balance
                ) || 0.0;
              let salestatus = data.tinvoicelist[i].QuoteStatus || "";
              if (data.tinvoicelist[i].Deleted == true) {
                salestatus = "Deleted";
              } else if (data.tinvoicelist[i].CustomerName == "") {
                salestatus = "Deleted";
              }

              var dataList = {
                id: data.tinvoicelist[i].SaleID || "",
                apptid: data.tinvoicelist[i].AppointID || 0,
                employee: data.tinvoicelist[i].EmployeeName || "",
                sortdate:
                  data.tinvoicelist[i].SaleDate != ""
                    ? moment(data.tinvoicelist[i].SaleDate).format("YYYY/MM/DD")
                    : data.tinvoicelist[i].SaleDate,
                saledate:
                  data.tinvoicelist[i].SaleDate != ""
                    ? moment(data.tinvoicelist[i].SaleDate).format("DD/MM/YYYY")
                    : data.tinvoicelist[i].SaleDate,
                duedate:
                  data.tinvoicelist[i].DueDate != ""
                    ? moment(data.tinvoicelist[i].DueDate).format("DD/MM/YYYY")
                    : data.tinvoicelist[i].DueDate,
                customername: data.tinvoicelist[i].CustomerName || "",
                totalamountex: totalAmountEx || 0.0,
                totaltax: totalTax || 0.0,
                totalamount: totalAmount || 0.0,
                totalpaid: totalPaid || 0.0,
                totaloustanding: totalOutstanding || 0.0,
                salestatus: salestatus || "",
                ponumber: data.tinvoicelist[i].PONumber || "",
                referenceno: data.tinvoicelist[i].ReferenceNo || "",
                custfield1: data.tinvoicelist[i].SaleCustField1 || "",
                custfield2: data.tinvoicelist[i].SaleCustField2 || "",
                custfield3: data.tinvoicelist[i].SaleCustField3 || "",
                comments: data.tinvoicelist[i].Comments || "",
                // shipdate:data.tinvoiceex[i].fields.ShipDate !=''? moment(data.tinvoiceex[i].fields.ShipDate).format("DD/MM/YYYY"): data.tinvoiceex[i].fields.ShipDate,
              };

              //if (data.tinvoiceex[i].fields.Deleted == false && data.tinvoiceex[i].fields.CustomerName.replace(/\s/g, '') != '') {
              dataTableList.push(dataList);
              //}

              //}
            }

            templateObject.datatablerecords.set(dataTableList);

            if (templateObject.datatablerecords.get()) {
              setTimeout(function () {
                MakeNegative();
              }, 100);
            }

            $(".fullScreenSpin").css("display", "none");
            setTimeout(function () {
              $("#tblInvoicelist")
                .DataTable({
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
                      filename: "Invoice List excel - " + moment().format(),
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
                      title: "Invoice List",
                      filename: "Invoice List - " + moment().format(),
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
                  pageLength: initialDatatableLoad,
                  bLengthChange: false,
                  info: true,
                  responsive: true,
                  order: [
                    [0, "desc"],
                    [2, "desc"],
                  ],
                  action: function () {
                    $("#tblInvoicelist").DataTable().ajax.reload();
                  },
                  fnDrawCallback: function (oSettings) {
                    let checkurlIgnoreDate =
                      FlowRouter.current().queryParams.ignoredate;

                    $(".paginate_button.page-item").removeClass("disabled");
                    $("#tblInvoicelist_ellipsis").addClass("disabled");

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
                      if (data.Params.IgnoreDates == true) {
                        sideBarService
                          .getAllTInvoiceListData(
                            formatDateFrom,
                            formatDateTo,
                            true,
                            initialDatatableLoad,
                            oSettings.fnRecordsDisplay()
                          )
                          .then(function (dataObjectnew) {
                            getVS1Data("TInvoiceList")
                              .then(function (dataObjectold) {
                                if (dataObjectold.length == 0) {
                                } else {
                                  let dataOld = JSON.parse(
                                    dataObjectold[0].data
                                  );

                                  var thirdaryData = $.merge(
                                    $.merge([], dataObjectnew.tinvoicelist),
                                    dataOld.tinvoicelist
                                  );
                                  let objCombineData = {
                                    Params: dataOld.Params,
                                    tinvoicelist: thirdaryData,
                                  };

                                  addVS1Data(
                                    "TInvoiceList",
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
                          .getAllTInvoiceListData(
                            formatDateFrom,
                            formatDateTo,
                            false,
                            initialDatatableLoad,
                            oSettings.fnRecordsDisplay()
                          )
                          .then(function (dataObjectnew) {
                            getVS1Data("TInvoiceList")
                              .then(function (dataObjectold) {
                                if (dataObjectold.length == 0) {
                                } else {
                                  let dataOld = JSON.parse(
                                    dataObjectold[0].data
                                  );

                                  var thirdaryData = $.merge(
                                    $.merge([], dataObjectnew.tinvoicelist),
                                    dataOld.tinvoicelist
                                  );
                                  let objCombineData = {
                                    Params: dataOld.Params,
                                    tinvoicelist: thirdaryData,
                                  };

                                  addVS1Data(
                                    "TInvoiceList",
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
                    this.fnPageChange("last");
                    if (data.Params.Search.replace(/\s/g, "") == "") {
                      $(
                        "<button class='btn btn-danger btnHideDeleted' type='button' id='btnHideDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='far fa-check-circle' style='margin-right: 5px'></i>Hide Deleted</button>"
                      ).insertAfter("#tblInvoicelist_filter");
                    } else {
                      $(
                        "<button class='btn btn-primary btnViewDeleted' type='button' id='btnViewDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fa fa-trash' style='margin-right: 5px'></i>View Deleted</button>"
                      ).insertAfter("#tblInvoicelist_filter");
                    }
                    $(
                      "<button class='btn btn-primary btnRefreshInvoiceList' type='button' id='btnRefreshInvoiceList' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>"
                    ).insertAfter("#tblInvoicelist_filter");
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
                  let draftRecord = templateObject.datatablerecords.get();
                  templateObject.datatablerecords.set(draftRecord);
                })
                .on("column-reorder", function () {})
                .on("length.dt", function (e, settings, len) {
                  setTimeout(function () {
                    MakeNegative();
                  }, 100);
                });

              // $('#tblInvoicelist').DataTable().column( 0 ).visible( true );
              $(".fullScreenSpin").css("display", "none");
            }, 0);

            // var columns = $("#tblInvoicelist th");
            // let sTible = "";
            // let sWidth = "";
            // let sIndex = "";
            // let sVisible = "";
            // let columVisible = false;
            // let sClass = "";
            // let isCustomField = false;
            // $.each(columns, function (i, v) {
            //   if (v.hidden == false) {
            //     columVisible = true;
            //   }
            //   if (v.className.includes("hiddenColumn")) {
            //     columVisible = false;
            //   }
            //   sWidth = v.style.width.replace("px", "");

            //   if (v.className.includes("customFieldColumn")) {
            //     isCustomField = true;
            //   } else {
            //     isCustomField = false;
            //   }

            //   let datatablerecordObj = {
            //     custid: $(this).attr("custid") || 0,
            //     sTitle: v.innerText || "",
            //     sWidth: sWidth || "",
            //     sIndex: v.cellIndex || "",
            //     sVisible: columVisible || false,
            //     sCustomField: isCustomField || false,
            //     sClass: v.className || "",
            //   };
            //   tableHeaderList.push(datatablerecordObj);
            // });
            // templateObject.tableheaderrecords.set(tableHeaderList);
            // $("div.dataTables_filter input").addClass(
            //   "form-control form-control-sm"
            // );
            $("#tblInvoicelist tbody").on("click", "tr", function () {
              var listData = $(this).closest("tr").attr("id");
              var apptId = $(this).closest("tr").attr("apptid");
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
                  if(parseInt(apptId) > 0){
                    FlowRouter.go(
                        "/invoicecard?id=" + listData + "&apptId=" + apptId
                    );
                  }
                  else{
                    FlowRouter.go(
                        "/invoicecard?id=" + listData
                    );
                  }
                }
              }
            });

            templateObject.getCustomFieldData();
          })
          .catch(function (err) {
            // Bert.alert('<strong>' + err + '</strong>!', 'danger');
            $(".fullScreenSpin").css("display", "none");
            // Meteor._reload.reload();
          });
      });
  };

  // $("#tblInvoicelist tbody").on("click", "tr", function () {
  //   var listData = $(this).closest("tr").attr("id");
  //   var checkDeleted = $(this).closest("tr").find(".colStatus").text() || "";
  //   if (listData) {
  //     if (checkDeleted == "Deleted") {
  //       swal("You Cannot View This Transaction", "Because It Has Been Deleted","info");
  //     } else {
  //       FlowRouter.go("/invoicecard?id=" + listData);
  //     }
  //   }
  // });

  templateObject.getCustomFieldData = function () {
    return;
    // let listType = "ltInvoiceList";
    // getVS1Data("TCustomFieldList")
    //   .then(function (dataObject) {
    //     if (dataObject.length == 0) {
    //       sideBarService
    //         .getAllCustomFieldsWithQuery(listType)
    //         .then(function (data) {
    //           templateObject.setCustomFieldDataCheckIndexDB(data);
    //         });
    //     } else {
    //       let data = JSON.parse(dataObject[0].data);
    //       templateObject.setCustomFieldDataCheckIndexDB(data);
    //     }
    //   })
    //   .catch(function (err) {
    //     sideBarService
    //       .getAllCustomFieldsWithQuery(listType)
    //       .then(function (data) {
    //         templateObject.setCustomFieldDataCheckIndexDB(data);
    //       });
    //   });
  };

  // templateObject.getAllInvoiceData();
  templateObject.getAllFilterInvoiceData = function (
    fromDate,
    toDate,
    ignoreDate
  ) {
    sideBarService
      .getAllTInvoiceListData(
        fromDate,
        toDate,
        ignoreDate,
        initialReportLoad,
        0
      )
      .then(function (data) {
        addVS1Data("TInvoiceList", JSON.stringify(data))
          .then(function (datareturn) {
            location.reload();
          })
          .catch(function (err) {
            location.reload();
          });
      })
      .catch(function (err) {
        $(".fullScreenSpin").css("display", "none");
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
      $("#dateFrom").val(
        urlParametersDateFrom != ""
          ? moment(urlParametersDateFrom).format("DD/MM/YYYY")
          : urlParametersDateFrom
      );
      $("#dateTo").val(
        urlParametersDateTo != ""
          ? moment(urlParametersDateTo).format("DD/MM/YYYY")
          : urlParametersDateTo
      );
    }
  }
  tableResize();

  templateObject.initPage = async (refresh = false) => {
    LoadingOverlay.show();
    await templateObject.loadCustomFields();
    await templateObject.loadInvoices(refresh);

    LoadingOverlay.hide();
  }

  templateObject.initPage();
});

Template.invoicelist.events({
  "click #btnNewInvoice": function (event) {
    FlowRouter.go("/invoicecard");
  },
  "keyup #tblInvoicelist_filter input": function (event) {
    if ($(event.target).val() != "") {
      $(".btnRefreshInvoiceList").addClass("btnSearchAlert");
    } else {
      $(".btnRefreshInvoiceList").removeClass("btnSearchAlert");
    }
    if (event.keyCode == 13) {
      $(".btnRefreshInvoiceList").trigger("click");
    }
  },
  "click .btnRefreshInvoiceList": function (event, ui) {
    ui.initPage(true);

    let templateObject = Template.instance();
    let utilityService = new UtilityService();
    let tableProductList;
    const dataTableList = [];
    var splashArrayInvoiceList = new Array();
    const lineExtaSellItems = [];
    $(".fullScreenSpin").css("display", "inline-block");
    let dataSearchName = $("#tblInvoicelist_filter input").val();
    if (dataSearchName.replace(/\s/g, "") != "") {
      sideBarService
        .getNewInvoiceByNameOrID(dataSearchName)
        .then(function (data) {
          $(".btnRefreshInvoiceList").removeClass("btnSearchAlert");
          let lineItems = [];
          let lineItemObj = {};
          if (data.tinvoiceex.length > 0) {
            for (let i = 0; i < data.tinvoiceex.length; i++) {
              let totalAmountEx =
                utilityService.modifynegativeCurrencyFormat(
                  data.tinvoiceex[i].fields.TotalAmount
                ) || 0.0;
              let totalTax =
                utilityService.modifynegativeCurrencyFormat(
                  data.tinvoiceex[i].fields.TotalTax
                ) || 0.0;
              // Currency+''+data.tinvoiceex[i].fields.TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
              let totalAmount =
                utilityService.modifynegativeCurrencyFormat(
                  data.tinvoiceex[i].fields.TotalAmountInc
                ) || 0.0;
              let totalPaid =
                utilityService.modifynegativeCurrencyFormat(
                  data.tinvoiceex[i].fields.TotalPaid
                ) || 0.0;
              let totalOutstanding =
                utilityService.modifynegativeCurrencyFormat(
                  data.tinvoiceex[i].fields.TotalBalance
                ) || 0.0;
              let salestatus = data.tinvoiceex[i].fields.SalesStatus || "";
              if (data.tinvoiceex[i].fields.Deleted == true) {
                salestatus = "Deleted";
              } else if (data.tinvoiceex[i].fields.CustomerName == "") {
                salestatus = "Deleted";
              }

              var dataList = {
                id: data.tinvoiceex[i].fields.ID || "",
                apptid: data.tinvoicelist[i].fields.AppointID || 0,
                employee: data.tinvoiceex[i].fields.EmployeeName || "",
                sortdate:
                  data.tinvoiceex[i].fields.SaleDate != ""
                    ? moment(data.tinvoiceex[i].fields.SaleDate).format(
                        "YYYY/MM/DD"
                      )
                    : data.tinvoiceex[i].fields.SaleDate,
                saledate:
                  data.tinvoiceex[i].fields.SaleDate != ""
                    ? moment(data.tinvoiceex[i].fields.SaleDate).format(
                        "DD/MM/YYYY"
                      )
                    : data.tinvoiceex[i].fields.SaleDate,
                duedate:
                  data.tinvoiceex[i].fields.DueDate != ""
                    ? moment(data.tinvoiceex[i].fields.DueDate).format(
                        "DD/MM/YYYY"
                      )
                    : data.tinvoiceex[i].fields.DueDate,
                customername: data.tinvoiceex[i].fields.CustomerName || "",
                totalamountex: totalAmountEx || 0.0,
                totaltax: totalTax || 0.0,
                totalamount: totalAmount || 0.0,
                totalpaid: totalPaid || 0.0,
                totaloustanding: totalOutstanding || 0.0,
                salestatus: salestatus || "",
                ponumber: data.tinvoicelist[i].PONumber || "",
                referenceno: data.tinvoicelist[i].ReferenceNo || "",
                custfield1: data.tinvoiceex[i].fields.SaleCustField1 || "",
                custfield2: data.tinvoiceex[i].fields.SaleCustField2 || "",
                custfield3: data.tinvoiceex[i].fields.SaleCustField3 || "",
                comments: data.tinvoiceex[i].fields.Comments || "",
                // shipdate:data.tinvoiceex[i].fields.ShipDate !=''? moment(data.tinvoiceex[i].fields.ShipDate).format("DD/MM/YYYY"): data.tinvoiceex[i].fields.ShipDate,
              };

              //if(data.tinvoiceex[i].fields.Deleted == false){
              //splashArrayInvoiceList.push(dataList);
              dataTableList.push(dataList);
              //}

              //}
            }
            templateObject.datatablerecords.set(dataTableList);

            let item = templateObject.datatablerecords.get();
            $(".fullScreenSpin").css("display", "none");
            if (dataTableList) {
              var datatable = $("#tblInvoicelist").DataTable();
              $("#tblInvoicelist > tbody").empty();
              for (let x = 0; x < item.length; x++) {
                $("#tblInvoicelist > tbody").append(
                  ' <tr class="dnd-moved" id="' +
                    item[x].id +
                    '" style="cursor: pointer;">' +
                    '<td contenteditable="false" class="colSortDate hiddenColumn">' +
                    item[x].sortdate +
                    "</td>" +
                    '<td contenteditable="false" class="colSaleDate" ><span style="display:none;">' +
                    item[x].sortdate +
                    "</span>" +
                    item[x].saledate +
                    "</td>" +
                    '<td contenteditable="false" class="colSalesNo">' +
                    item[x].id +
                    "</td>" +
                    '<td contenteditable="false" class="colDueDate" >' +
                    item[x].duedate +
                    "</td>" +
                    '<td contenteditable="false" class="colCustomer">' +
                    item[x].customername +
                    "</td>" +
                    '<td contenteditable="false" class="colAmountEx" style="text-align: right!important;">' +
                    item[x].totalamountex +
                    "</td>" +
                    '<td contenteditable="false" class="colTax" style="text-align: right!important;">' +
                    item[x].totaltax +
                    "</td>" +
                    '<td contenteditable="false" class="colAmount" style="text-align: right!important;">' +
                    item[x].totalamount +
                    "</td>" +
                    '<td contenteditable="false" class="colPaid" style="text-align: right!important;">' +
                    item[x].totalpaid +
                    "</td>" +
                    '<td contenteditable="false" class="colBalanceOutstanding" style="text-align: right!important;">' +
                    item[x].totaloustanding +
                    "</td>" +
                    '<td contenteditable="false" class="colStatus">' +
                    item[x].salestatus +
                    "</td>" +
                    '<td contenteditable="false" class="colPONumber">' +
                    item[x].ponumber +
                    "</td>" +
                    '<td contenteditable="false" class="colReference">' +
                    item[x].referenceno +
                    "</td>" +
                    '<td contenteditable="false" class="colSaleCustField1 customFieldColumn hiddenColumn">' +
                    item[x].custfield1 +
                    "</td>" +
                    '<td contenteditable="false" class="colSaleCustField2 customFieldColumn hiddenColumn">' +
                    item[x].custfield2 +
                    "</td>" +
                    '<td contenteditable="false" class="colSaleCustField3 customFieldColumn hiddenColumn">' +
                    item[x].custfield3 +
                    "</td>" +
                    '<td contenteditable="false" class="colEmployee hiddenColumn">' +
                    item[x].employee +
                    "</td>" +
                    '<td contenteditable="false" class="colComments">' +
                    item[x].comments +
                    "</td>" +
                    "</tr>"
                );
              }
              $(".dataTables_info").html(
                "Showing 1 to " +
                  data.tinvoiceex.length +
                  " of " +
                  data.tinvoiceex.length +
                  " entries"
              );
              setTimeout(function () {
                makeNegativeGlobal();
              }, 100);
            }
          } else {
            $(".fullScreenSpin").css("display", "none");

            swal({
              title: "Question",
              text: "Invoice does not exist, would you like to create it?",
              type: "question",
              showCancelButton: true,
              confirmButtonText: "Yes",
              cancelButtonText: "No",
            }).then((result) => {
              if (result.value) {
                FlowRouter.go("/invoicecard");
              } else if (result.dismiss === "cancel") {
                //$('#productListModal').modal('toggle');
              }
            });
          }
        })
        .catch(function (err) {
          $(".fullScreenSpin").css("display", "none");
        });
    } else {
      $(".btnRefresh").trigger("click");
    }
  },
  "click #btnInvoiceBOList": function (event) {
    FlowRouter.go("/invoicelistBO");
  },
  "click .chkDatatable": function (event) {
    var columns = $("#tblInvoicelist th");
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

  // custom field displaysettings
  "click .resetTable": function (event) {
    let templateObject = Template.instance();
    let reset_data = templateObject.reset_data.get();
    templateObject.showCustomFieldDisplaySettings(reset_data);

    reset_data = reset_data.filter(redata => redata.display);
    $(".customDisplaySettings").each(function (index) {
      let $tblrow = $(this);
      $tblrow.find(".divcolumn").text(reset_data[index].label);
      $tblrow
        .find(".custom-control-input")
        .prop("checked", reset_data[index].active);

        let title = $("#tblInvoicelist").find("th").eq(index+1);
        $(title).html(reset_data[index].label);

      if (reset_data[index].active) {
        $('.col' + reset_data[index].class).addClass('showColumn');
        $('.col' + reset_data[index].class).removeClass('hiddenColumn');
      } else {
        $('.col' + reset_data[index].class).addClass('hiddenColumn');
        $('.col' + reset_data[index].class).removeClass('showColumn');
      }
      $(".rngRange" + reset_data[index].class).val(reset_data[index].width);
    });
  },

  // custom field displaysettings
  "click .saveTable": async function (event) {
    let lineItems = [];
    $(".fullScreenSpin").css("display", "inline-block");

    $(".customDisplaySettings").each(function (index) {
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
      let tableName = "tblInvoicelist";
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


  'change .custom-range': function(event) {
    let range = $(event.target).val();
    let colClassName = $(event.target).attr("valueclass");
    $('.col' + colClassName).css('width', range);
  },
  'click .custom-control-input': function(event) {
    let colClassName = $(event.target).attr("id");
    if ($(event.target).is(':checked')) {
      $('.col' + colClassName).addClass('showColumn');
      $('.col' + colClassName).removeClass('hiddenColumn');
    } else {
      $('.col' + colClassName).addClass('hiddenColumn');
      $('.col' + colClassName).removeClass('showColumn');
    }
  },

  // 'click .chkSaleDate': function(event) {
  //   if ($(event.target).is(':checked')) {
  //     $('.colSaleDate').addClass('showColumn');
  //     $('.colSaleDate').removeClass('hiddenColumn');
  //   } else {
  //     $('.colSaleDate').addClass('hiddenColumn');
  //     $('.colSaleDate').removeClass('showColumn');
  //   }
  // },
  // 'click .chkSalesNo': function(event) {
  //   if ($(event.target).is(':checked')) {
  //     $('.colSalesNo').addClass('showColumn');
  //     $('.colSalesNo').removeClass('hiddenColumn');
  //   } else {
  //     $('.colSalesNo').addClass('hiddenColumn');
  //     $('.colSalesNo').removeClass('showColumn');
  //   }
  // },
  // 'click .chkDueDate': function(event) {
  //   if ($(event.target).is(':checked')) {
  //     $('.colDueDate').addClass('showColumn');
  //     $('.colDueDate').removeClass('hiddenColumn');
  //   } else {
  //     $('.colDueDate').addClass('hiddenColumn');
  //     $('.colDueDate').removeClass('showColumn');
  //   }
  // },
  // 'click .chkCustomer': function(event) {
  //   if ($(event.target).is(':checked')) {
  //     $('.colCustomer').addClass('showColumn');
  //     $('.colCustomer').removeClass('hiddenColumn');
  //   } else {
  //     $('.colCustomer').addClass('hiddenColumn');
  //     $('.colCustomer').removeClass('showColumn');
  //   }
  // },
  // 'click .chkAmountEx': function(event) {
  //   if ($(event.target).is(':checked')) {
  //     $('.colAmountEx').addClass('showColumn');
  //     $('.colAmountEx').removeClass('hiddenColumn');
  //   } else {
  //     $('.colAmountEx').addClass('hiddenColumn');
  //     $('.colAmountEx').removeClass('showColumn');
  //   }
  // },
  // 'click .chkTax': function(event) {
  //   if ($(event.target).is(':checked')) {
  //     $('.colTax').addClass('showColumn');
  //     $('.colTax').removeClass('hiddenColumn');
  //   } else {
  //     $('.colTax').addClass('hiddenColumn');
  //     $('.colTax').removeClass('showColumn');
  //   }
  // },
  // // displaysettings
  // 'click .chkAmount': function(event) {
  //   if ($(event.target).is(':checked')) {
  //     $('.colAmount').addClass('showColumn');
  //     $('.colAmount').removeClass('hiddenColumn');
  //   } else {
  //     $('.colAmount').addClass('hiddenColumn');
  //     $('.colAmount').removeClass('showColumn');
  //   }
  // },
  // 'click .chkPaid': function(event) {
  //   if ($(event.target).is(':checked')) {
  //     $('.colPaid').addClass('showColumn');
  //     $('.colPaid').removeClass('hiddenColumn');
  //   } else {
  //     $('.colPaid').addClass('hiddenColumn');
  //     $('.colPaid').removeClass('showColumn');
  //   }
  // },

  // 'click .chkBalanceOutstanding': function(event) {
  //   if ($(event.target).is(':checked')) {
  //     $('.colBalanceOutstanding').addClass('showColumn');
  //     $('.colBalanceOutstanding').removeClass('hiddenColumn');
  //   } else {
  //       $('.colBalanceOutstanding').addClass('hiddenColumn');
  //       $('.colBalanceOutstanding').removeClass('showColumn');
  //   }
  // },
  // 'click .chkStatus': function(event) {
  //   if ($(event.target).is(':checked')) {
  //     $('.colStatus').addClass('showColumn');
  //     $('.colStatus').removeClass('hiddenColumn');
  //   } else {
  //     $('.colStatus').addClass('hiddenColumn');
  //     $('.colStatus').removeClass('showColumn');
  //   }
  // },
  // 'click .chkEmployee': function(event) {
  //   if ($(event.target).is(':checked')) {
  //     $('.colEmployee').addClass('showColumn');
  //     $('.colEmployee').removeClass('hiddenColumn');
  //   } else {
  //     $('.colEmployee').addClass('hiddenColumn');
  //     $('.colEmployee').removeClass('showColumn');
  //   }
  // },
  // 'click .chkComments': function(event) {
  //   if ($(event.target).is(':checked')) {
  //     $('.colComments').addClass('showColumn');
  //     $('.colComments').removeClass('hiddenColumn');
  //   } else {
  //     $('.colComments').addClass('hiddenColumn');
  //     $('.colComments').removeClass('showColumn');
  //   }
  // },
  // 'click .chkPONumber': function(event) {
  //   if ($(event.target).is(':checked')) {
  //     $('.colPONumber').addClass('showColumn');
  //     $('.colPONumber').removeClass('hiddenColumn');
  //   } else {
  //     $('.colPONumber').addClass('hiddenColumn');
  //     $('.colPONumber').removeClass('showColumn');
  //   }
  // },
  // 'click .chkReference': function(event) {
  //   if ($(event.target).is(':checked')) {
  //     $('.colReference').addClass('showColumn');
  //     $('.colReference').removeClass('hiddenColumn');
  //   } else {
  //     $('.colReference').addClass('hiddenColumn');
  //     $('.colReference').removeClass('showColumn');
  //   }
  // },
  // // display settings


  // 'change .rngRangeSaleDate': function(event) {
  //     let range = $(event.target).val();
  //     $(".spWidthSaleDate").html(range);
  //     $('.colSaleDate').css('width', range);
  // },
  // 'change .rngRangeSalesNo': function(event) {
  //     let range = $(event.target).val();
  //     $(".spWidthSalesNo").html(range);
  //     $('.colSalesNo').css('width', range);
  // },
  // 'change .rngRangeDueDate': function(event) {
  //     let range = $(event.target).val();
  //     $(".spWidthDueDate").html(range);
  //     $('.colDueDate').css('width', range);
  // },
  // 'change .rngRangeUnitPriceInc': function(event) {
  //     let range = $(event.target).val();
  //     $(".spWidthUnitPrice").html(range);
  //     $('.colUnitPriceInc').css('width', range);
  // },
  // 'change .rngRangeUnitPriceEx': function(event) {
  //     let range = $(event.target).val();
  //     $('.colUnitPriceEx').css('width', range);
  // },
  // 'change .rngRangeTax': function(event) {
  //     let range = $(event.target).val();
  //     $(".spWidthTax").html(range);
  //     $('.colTax').css('width', range);
  // },
  // 'change .rngRangeAmountInc': function (event) {
  //     let range = $(event.target).val();
  //     //$(".spWidthAmount").html(range);
  //     $('.colAmountInc').css('width', range);
  // },
  // 'change .rngRangeAmountEx': function (event) {
  //     let range = $(event.target).val();
  //     //$(".spWidthAmount").html(range);
  //     $('.colAmountEx').css('width', range);
  // },
  // 'change .rngRangePaid': function (event) {
  //     let range = $(event.target).val();
  //     //$(".spWidthAmount").html(range);
  //     $('.colPaid').css('width', range);
  // },
  // 'change .rngRangeBalanceOutstanding': function (event) {
  //     let range = $(event.target).val();
  //     $('.colBalanceOutstanding').css('width', range);
  // },
  // 'change .rngRangeStatus': function (event) {
  //     let range = $(event.target).val();
  //     $('.colStatus').css('width', range);
  // },
  // 'change .rngRangeAmount': function (event) {
  //     let range = $(event.target).val();
  //     $('.colAmount').css('width', range);
  // },
  // 'change .rngRangeCustomer': function(event) {
  //     let range = $(event.target).val();
  //     $(".spWidthCustomer").html(range);
  //     $('.colCustomer').css('width', range);
  // },
  // 'change .rngRangeEmployee': function(event) {
  //     let range = $(event.target).val();
  //     $(".spWidthEmployee").html(range);
  //     $('.colEmployee').css('width', range);
  // },
  // 'change .rngRangeComments': function(event) {
  //     let range = $(event.target).val();
  //     $(".spWidthComments").html(range);
  //     $('.colComments').css('width', range);
  // },
  // 'change .rngRangePONumber': function(event) {
  //     let range = $(event.target).val();
  //     $(".spWidthPONumber").html(range);
  //     $('.colPONumber').css('width', range);
  // },
  // 'change .rngRangeReference': function(event) {
  //     let range = $(event.target).val();
  //     $(".spWidthReference").html(range);
  //     $('.colReference').css('width', range);
  // },
  "blur .divcolumn": function (event) {
    let columData = $(event.target).html();
    let columHeaderUpdate = $(event.target).attr("valueupdate");
    $("th.col" + columHeaderUpdate + "").html(columData);
  },

  "change .rngRange": function (event) {
    let range = $(event.target).val();
    $(event.target)
      .closest("div.divColWidth")
      .find(".spWidth")
      .html(range + "px");

    let columData = $(event.target)
      .closest("div.divColWidth")
      .find(".spWidth")
      .attr("value");
    let columnDataValue = $(event.target)
      .closest("div")
      .prev()
      .find(".divcolumn")
      .text();
    var datable = $("#tblInvoicelist th");
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
  //   var columns = $("#tblInvoicelist th");

  //   const tableHeaderList = [];
  //   let sTible = "";
  //   let sWidth = "";
  //   let sIndex = "";
  //   let sVisible = "";
  //   let columVisible = false;
  //   let sClass = "";
  //   let isCustomField = false;
  //   $.each(columns, function (i, v) {
  //     if (v.hidden == false) {
  //       columVisible = true;
  //     }
  //     if (v.className.includes("hiddenColumn")) {
  //       columVisible = false;
  //     }
  //     sWidth = v.style.width.replace("px", "");

  //     if (v.className.includes("customFieldColumn")) {
  //       isCustomField = true;
  //     } else {
  //       isCustomField = false;
  //     }

  //     let datatablerecordObj = {
  //       custid: $(this).attr("custid") || 0,
  //       sTitle: v.innerText || "",
  //       sWidth: sWidth || "",
  //       sIndex: v.cellIndex || "",
  //       sVisible: columVisible || false,
  //       sCustomField: isCustomField || false,
  //       sClass: v.className || "",
  //     };
  //     tableHeaderList.push(datatablerecordObj);
  //   });
  //   templateObject.tableheaderrecords.set(tableHeaderList);
  // },
  "click #exportbtn": function () {
    $(".fullScreenSpin").css("display", "inline-block");
    jQuery("#tblInvoicelist_wrapper .dt-buttons .btntabletocsv").click();
    $(".fullScreenSpin").css("display", "none");
  },
  "click .btnRefresh": function () {
    $(".fullScreenSpin").css("display", "inline-block");
    let currentDate = new Date();
    let hours = currentDate.getHours(); //returns 0-23
    let minutes = currentDate.getMinutes(); //returns 0-59
    let seconds = currentDate.getSeconds(); //returns 0-59
    let month = currentDate.getMonth() + 1;
    let days = currentDate.getDate();

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
    let prevMonth11Date = moment().subtract(reportsloadMonths, "months").format("YYYY-MM-DD");


    sideBarService.getSalesListData(prevMonth11Date, toDate, true, initialReportLoad, 0).then(function (dataSales) {
        addVS1Data("TSalesList", JSON.stringify(dataSales)).then(function (datareturn) {}).catch(function (err) {});
      }).catch(function (err) {});


      sideBarService.getTPaymentList(prevMonth11Date,toDate,true,initialReportLoad,0,"").then(function (dataPaymentList) {
         addVS1Data("TPaymentList",JSON.stringify(dataPaymentList)).then(function (datareturn) {
            }).catch(function (err) {

            });
        }).catch(function (err) {

        });

    sideBarService.getAllTInvoiceListData(prevMonth11Date,toDate,true,initialReportLoad,0).then(function (dataInvoice) {
        addVS1Data("TInvoiceList", JSON.stringify(dataInvoice)).then(function (datareturn) {
              sideBarService.getAllInvoiceList(initialDataLoad, 0).then(function (dataInvoice) {
                   addVS1Data("TInvoiceEx", JSON.stringify(dataInvoice)).then(function (datareturn) {
                     window.open("/invoicelist", "_self");
                   }).catch(function (err) {
                     window.open("/invoicelist", "_self");
                   });
                }).catch(function (err) {
                  window.open("/invoicelist", "_self");
                });
          }).catch(function (err) {
            window.open("/invoicelist", "_self");
          });
      }).catch(function (err) {
        window.open("/invoicelist", "_self");
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
        templateObject.getAllFilterInvoiceData(
          formatDateFrom,
          formatDateTo,
          false
        );
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
        templateObject.getAllFilterInvoiceData(
          formatDateFrom,
          formatDateTo,
          false
        );
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
    templateObject.getAllFilterInvoiceData(toDateERPFrom, toDateERPTo, false);
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
    templateObject.getAllFilterInvoiceData(toDateERPFrom, toDateERPTo, false);
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
    templateObject.getAllFilterInvoiceData(getDateFrom, getLoadDate, false);
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
    templateObject.getAllFilterInvoiceData(getDateFrom, getLoadDate, false);
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
    templateObject.getAllFilterInvoiceData(getDateFrom, getLoadDate, false);
  },
  "click #ignoreDate": function () {
    let templateObject = Template.instance();
    $(".fullScreenSpin").css("display", "inline-block");
    $("#dateFrom").attr("readonly", true);
    $("#dateTo").attr("readonly", true);
    templateObject.getAllFilterInvoiceData("", "", true);
  },
  "click .printConfirm": function (event) {
    playPrintAudio();
    setTimeout(function(){
    $(".fullScreenSpin").css("display", "inline-block");
    jQuery("#tblInvoicelist_wrapper .dt-buttons .btntabletopdf").click();
    $(".fullScreenSpin").css("display", "none");
  }, delayTimeAfterSound);
  },
});

Template.invoicelist.helpers({
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
        // return (a.saledate.toUpperCase() < b.saledate.toUpperCase()) ? 1 : -1;
      });
  },
  tableheaderrecords: () => {
    return Template.instance().tableheaderrecords.get();
  },
  salesCloudPreferenceRec: () => {
    return CloudPreference.findOne({
      userid: Session.get("mycloudLogonID"),
      PrefName: "tblInvoicelist",
    });
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
