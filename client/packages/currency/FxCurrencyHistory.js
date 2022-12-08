import { ReportService } from "../../reports/report-service";
import { SalesBoardService } from "../../js/sales-service";
import "jQuery.print/jQuery.print.js";
import { UtilityService } from "../../utility-service";
import erpObjects from "../../lib/global/erp-objects";
import { SideBarService } from "../../js/sidebar-service";
import "../../lib/global/indexdbstorage.js";
import { CountryService } from "../../js/country-service";
import { TaxRateService } from "../../settings/settings-service";
import LoadingOverlay from "../../LoadingOverlay";
import CachedHttp from "../../lib/global/CachedHttp";
import FxGlobalFunctions from "./FxGlobalFunctions";

const sideBarService = new SideBarService();
const utilityService = new UtilityService();
const taxRateService = new TaxRateService();


const currentUrl = new URL(window.location.href);

Template.FxCurrencyHistory.onCreated(function () {
  const templateInstance = Template.instance();
  templateInstance.datatablerecords = new ReactiveVar([]);
  templateInstance.tableheaderrecords = new ReactiveVar([]);
  templateInstance.countryData = new ReactiveVar();
});

Template.FxCurrencyHistory.onRendered(function () {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  LoadingOverlay.show();
  let templateInstance = Template.instance();
  let dataTableList = [];
  const tableHeaderList = [];

  var countryService = new CountryService();
  let countries = [];

  var today = moment().format("DD/MM/YYYY");
  var currentDate = new Date();

  let fromDateMonth = currentDate.getMonth() + 1;
  let fromDateDay = currentDate.getDate();
  if (currentDate.getMonth() + 1 < 10) {
    fromDateMonth = "0" + (currentDate.getMonth() + 1);
  }

  if (currentDate.getDate() < 10) {
    fromDateDay = "0" + currentDate.getDate();
  }

  let begunDate = currentUrl.searchParams.has("dateTo")
    ? currentUrl.searchParams.get("dateTo").replaceAll("-", "/")
    : moment(currentDate).format("DD/MM/YYYY");

  let fromDate = currentUrl.searchParams.has("dateFrom")
    ? currentUrl.searchParams.get("dateFrom").replaceAll("-", "/")
    : fromDateDay + "/" + fromDateMonth + "/" + currentDate.getFullYear();

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
  }

  templateInstance.loadCurrencies  = async () => {
    LoadingOverlay.show();
    // let result = await taxRateService.getCurrencyHistory();

    let data = await CachedHttp.get(erpObjects.TCurrencyRateHistory, async () => {
      return await taxRateService.getCurrencyHistory();
    }, {
      useIndexDb: true,
      useLocalStorage: false,
      validate: (cachedResponse) => {
        return false;
      }
    });

    let result = data.response;


    if(result.tcurrencyratehistory) {
      const data = result.tcurrencyratehistory;

      for (let i = 0; i < data.length; i++) {
        // let taxRate = (data.tcurrency[i].fields.Rate * 100).toFixed(2) + '%';
        var dataList = {
          id: data[i].Id || "",
          code: data[i].Code || "-",
          currency: data[i].Currency || "-",
          symbol: data[i].CurrencySymbol || "-",
          buyrate: data[i].BuyRate || "-",
          sellrate: data[i].SellRate || "-",
          country: data[i].Country || "-",
          description: data[i].CurrencyDesc || "-",
          ratelastmodified: data[i].RateLastModified || "-",
          createdAt: new Date(data[i].MsTimeStamp) || "-",
          formatedCreatedAt: formatDateToString(
            new Date(data[i].MsTimeStamp)
          ),
        };

        dataTableList.push(dataList);
        //}
      }

      if (urlParams.get("currency")) {
        // Filter by currency
        dataTableList = dataTableList.filter((value, index) => {
          return value.code == urlParams.get("currency");
        });
      }

      if (urlParams.get("dateFrom") && urlParams.get("dateTo")) {
        const _dateFrom = formatDateFromUrl(begunDate);
        const _dateTo = formatDateFromUrl(fromDate);
        dataTableList = dataTableList.filter((value, index) => {
          if (_dateFrom > value.createdAt && _dateTo < value.createdAt) {
            return true;
          }
          return false;
        });
      }

      // Sort by created at
      dataTableList = dataTableList.sort(sortById);
      dataTableList.reverse();

      await templateInstance.datatablerecords.set(dataTableList);

      if (await templateInstance.datatablerecords.get()) {
        Meteor.call(
          "readPrefMethod",
          Session.get("mycloudLogonID"),
          "currencyLists",
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

        setTimeout(function () {
          $("#tblFxCurrencyHistory")
            .DataTable({
              columnDefs: [
                { type: "date", targets: 0 },
                { orderable: false, targets: -1 },
              ],
              sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
              buttons: [
                {
                  extend: "excelHtml5",
                  text: "",
                  download: "open",
                  className: "btntabletocsv hiddenColumn",
                  filename: "FX Currency History List - " + moment().format(),
                  orientation: "portrait",
                  exportOptions: {
                    columns: ":visible",
                  },
                },
                {
                  extend: "print",
                  download: "open",
                  className: "btntabletopdf hiddenColumn",
                  text: "",
                  title: "FX Currency History List",
                  filename: "FX Currency History List - " + moment().format(),
                  exportOptions: {
                    columns: ":visible",
                  },
                },
              ],
              select: true,
              destroy: true,
              colReorder: true,
              colReorder: {
                fixedColumnsRight: 1,
              },
              // bStateSave: true,
              // rowId: 0,
              pageLength: 25,
              paging: true,
              //                    "scrollY": "400px",
              //                    "scrollCollapse": true,
              info: true,
              responsive: true,
              order: [[0, "desc"]],
              action: function () {
                $("#tblFxCurrencyHistory").DataTable().ajax.reload();
              },
              fnDrawCallback: function (oSettings) {
                setTimeout(function () {
                  MakeNegative();
                }, 100);
              },
            })
            .on("page", function () {
              setTimeout(function () {
                MakeNegative();
              }, 100);
              let draftRecord = templateInstance.datatablerecords.get();
              templateInstance.datatablerecords.set(draftRecord);
            })
            .on("column-reorder", function () {})
            .on("length.dt", function (e, settings, len) {
              setTimeout(function () {
                MakeNegative();
              }, 100);
            });

          // $('#tblFxCurrencyHistory').DataTable().column( 0 ).visible( true );
         
        }, 300);
      }

     
      

      var columns = $("#tblFxCurrencyHistory th");
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
          sClass: v.className || "",
        };
        tableHeaderList.push(datatablerecordObj);
      });
      templateInstance.tableheaderrecords.set(tableHeaderList);
      $("div.dataTables_filter input").addClass(
        "form-control form-control-sm"
      );
    }
    LoadingOverlay.hide();
  }

 

  templateInstance.getTaxRates = function () {
    taxRateService.getCurrencyHistory().then((result) => {
        const data = result.tcurrencyratehistory;
        let lineItems = [];
        let lineItemObj = {};
        for (let i = 0; i < data.length; i++) {
          // let taxRate = (data.tcurrency[i].fields.Rate * 100).toFixed(2) + '%';
          var dataList = {
            id: data[i].Id || "",
            code: data[i].Code || "-",
            currency: data[i].Currency || "-",
            symbol: data[i].CurrencySymbol || "-",
            buyrate: data[i].BuyRate || "-",
            sellrate: data[i].SellRate || "-",
            country: data[i].Country || "-",
            description: data[i].CurrencyDesc || "-",
            ratelastmodified: data[i].RateLastModified || "-",
            createdAt: new Date(data[i].MsTimeStamp) || "-",
            formatedCreatedAt: formatDateToString(
              new Date(data[i].MsTimeStamp)
            ),
          };

          dataTableList.push(dataList);
          //}
        }

        if (urlParams.get("currency")) {
          // Filter by currency
          dataTableList = dataTableList.filter((value, index) => {
            return value.code == urlParams.get("currency");
          });
        }

        if (urlParams.get("dateFrom") && urlParams.get("dateTo")) {
          const _dateFrom = formatDateFromUrl(begunDate);
          const _dateTo = formatDateFromUrl(fromDate);
          dataTableList = dataTableList.filter((value, index) => {
            if (_dateFrom > value.createdAt && _dateTo < value.createdAt) {
              return true;
            }
            return false;
          });
        }

        // Sort by created at
        dataTableList = dataTableList.sort(sortById);
        dataTableList.reverse();

        templateInstance.datatablerecords.set(dataTableList);

        if (templateInstance.datatablerecords.get()) {
          Meteor.call(
            "readPrefMethod",
            Session.get("mycloudLogonID"),
            "currencyLists",
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

          setTimeout(function () {
            $("#tblFxCurrencyHistory")
              .DataTable({
                columnDefs: [
                  { type: "date", targets: 0 },
                  { orderable: false, targets: -1 },
                ],
                sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                buttons: [
                  {
                    extend: "excelHtml5",
                    text: "",
                    download: "open",
                    className: "btntabletocsv hiddenColumn",
                    filename: "currencylist_" + moment().format(),
                    orientation: "portrait",
                    exportOptions: {
                      columns: ":visible",
                    },
                  },
                  {
                    extend: "print",
                    download: "open",
                    className: "btntabletopdf hiddenColumn",
                    text: "",
                    title: "Currency List",
                    filename: "currencylist_" + moment().format(),
                    exportOptions: {
                      columns: ":visible",
                    },
                  },
                ],
                select: true,
                destroy: true,
                colReorder: true,
                colReorder: {
                  fixedColumnsRight: 1,
                },
                // bStateSave: true,
                // rowId: 0,
                pageLenght: 25,
                paging: true,
                //                    "scrollY": "400px",
                //                    "scrollCollapse": true,
                info: true,
                responsive: true,
                order: [[0, "desc"]],
                action: function () {
                  $("#tblFxCurrencyHistory").DataTable().ajax.reload();
                },
                fnDrawCallback: function (oSettings) {
                  setTimeout(function () {
                    MakeNegative();
                  }, 100);
                },
              })
              .on("page", function () {
                setTimeout(function () {
                  MakeNegative();
                }, 100);
                let draftRecord = templateInstance.datatablerecords.get();
                templateInstance.datatablerecords.set(draftRecord);
              })
              .on("column-reorder", function () {})
              .on("length.dt", function (e, settings, len) {
                setTimeout(function () {
                  MakeNegative();
                }, 100);
              });
  
            // $('#tblFxCurrencyHistory').DataTable().column( 0 ).visible( true );
            LoadingOverlay.hide();
          }, 300);
        }

        LoadingOverlay.hide();
        

        var columns = $("#tblFxCurrencyHistory th");
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
            sClass: v.className || "",
          };
          tableHeaderList.push(datatablerecordObj);
        });
        templateInstance.tableheaderrecords.set(tableHeaderList);
        $("div.dataTables_filter input").addClass(
          "form-control form-control-sm"
        );
      })
      .catch(function (err) {
        // Bert.alert('<strong>' + err + '</strong>!', 'danger');
        LoadingOverlay.hide();
        // Meteor._reload.reload();
      });
  };

  //templateInstance.getTaxRates();

  templateInstance.getCountryData = function () {
    getVS1Data("TCountries")
      .then(function (dataObject) {
        if (dataObject.length == 0) {
          countryService.getCountry().then((data) => {
            for (let i = 0; i < data.tcountries.length; i++) {
              countries.push(data.tcountries[i].Country);
            }
            countries.sort((a, b) => a.localeCompare(b));
            templateInstance.countryData.set(countries);
          });
        } else {
          let data = JSON.parse(dataObject[0].data);
          let useData = data.tcountries;
          for (let i = 0; i < useData.length; i++) {
            countries.push(useData[i].Country);
          }
          countries.sort((a, b) => a.localeCompare(b));
          templateInstance.countryData.set(countries);
        }
      })
      .catch(function (err) {
        countryService.getCountry().then((data) => {
          for (let i = 0; i < data.tcountries.length; i++) {
            countries.push(data.tcountries[i].Country);
          }
          countries.sort((a, b) => a.localeCompare(b));
          templateInstance.countryData.set(countries);
        });
      });
  };
 

  templateInstance.loadCurrencies();
  templateInstance.getCountryData();
  
  LoadingOverlay.hide();
});

Template.FxCurrencyHistory.events({
  "click #ignoreDate": (e) => {
    const myUrl = new URL(currentUrl.origin + currentUrl.pathname);
    if (currentUrl.searchParams.has("currency"))
      myUrl.searchParams.append(
        "currency",
        currentUrl.searchParams.get("currency")
      );
    window.location.href = myUrl;
  },
  "click #last12Months": (e) => {
    // https://stackoverflow.com/questions/19021117/last-12-months-in-javascript

    const d = new Date();

    // last 12 months
    for (i = 0; i <= 11; i++) {
      d.setMonth(d.getMonth() - 1);
    }

    const formatDateFrom = formatDateToString(d);
    const formatDateTo = formatDateToString(new Date());

    $("#dateTo").val(formatDateTo);
    $("#dateFrom").val(formatDateFrom);
    $("#dateTo").trigger("change");
    $("#dateFrom").trigger("change");
  },
  "click #lastQuarter": (e) => {
    // https://stackoverflow.com/questions/9840512/get-dates-for-last-quarter-and-this-quarter-through-javascript

    const today = new Date();
    const quarter = Math.floor(today.getMonth() / 3);

    // Previous quarter
    const startFullQuarter = new Date(today.getFullYear(), quarter * 3 - 3, 1);
    const endFullQuarter = new Date(
      startFullQuarter.getFullYear(),
      startFullQuarter.getMonth() + 3,
      0
    );

    const formatDateFrom = formatDateToString(startFullQuarter);
    const formatDateTo = formatDateToString(endFullQuarter);

    $("#dateTo").val(formatDateTo);
    $("#dateFrom").val(formatDateFrom);
    $("#dateTo").trigger("change");
    $("#dateFrom").trigger("change");
  },
  "click #lastMonth": (e) => {
    // https://stackoverflow.com/questions/13571700/get-first-and-last-date-of-current-month-with-javascript-or-jquery
    const d = new Date();

    var y = d.getFullYear();
    var m = d.getMonth();

    var firstDay = new Date(y, m, 1);
    var lastDay = new Date(y, m + 1, 0);

    const formatDateFrom = formatDateToString(firstDay);
    const formatDateTo = formatDateToString(lastDay);

    $("#dateTo").val(formatDateTo);
    $("#dateFrom").val(formatDateFrom);
    $("#dateTo").trigger("change");
    $("#dateFrom").trigger("change");
  },
  "click #lastweek": (e) => {
    // https://stackoverflow.com/questions/11431259/get-start-date-and-last-date-of-last-week-javascript
    const d = new Date();

    var to = d.setTime(
      d.getTime() - (d.getDay() ? d.getDay() : 7) * 24 * 60 * 60 * 1000
    );
    var from = d.setTime(d.getTime() - 6 * 24 * 60 * 60 * 1000);
    const formatDateFrom = formatDateToString(new Date(from));
    const formatDateTo = formatDateToString(new Date(to));

    $("#dateTo").val(formatDateTo);
    $("#dateFrom").val(formatDateFrom);
    $("#dateTo").trigger("change");
    $("#dateFrom").trigger("change");
  },
  "click #today": (e) => {
    const _currenctDate = new Date();
    const formatDateFrom = formatDateToString(_currenctDate);
    const formatDateTo = formatDateToString(_currenctDate);

    $("#dateTo").val(formatDateTo);
    $("#dateFrom").val(formatDateFrom);
    $("#dateTo").trigger("change");
    $("#dateFrom").trigger("change");
  },
  "change #dateTo": function () {
    let templateObject = Template.instance();
    //LoadingOverlay.show();
    LoadingOverlay.show();
    $("#dateFrom").attr("readonly", false);
    $("#dateTo").attr("readonly", false);

    let dateFrom = new Date($("#dateFrom").datepicker("getDate"));
    let dateTo = new Date($("#dateTo").datepicker("getDate"));

    let formatDateFrom = formatDateToUrl(dateFrom);
    let formatDateTo = formatDateToUrl(dateTo);

    const myUrl = new URL(currentUrl.origin + currentUrl.pathname);
    if (currentUrl.searchParams.has("currency"))
      myUrl.searchParams.append(
        "currency",
        currentUrl.searchParams.get("currency")
      );
    myUrl.searchParams.append("dateFrom", formatDateFrom);
    myUrl.searchParams.append("dateTo", formatDateTo);

    window.location.href = myUrl;
  },
  "change #dateFrom": function () {
    let templateObject = Template.instance();
    LoadingOverlay.show();
    $("#dateFrom").attr("readonly", false);
    $("#dateTo").attr("readonly", false);

    let dateFrom = new Date($("#dateFrom").datepicker("getDate"));
    let dateTo = new Date($("#dateTo").datepicker("getDate"));

    let formatDateFrom = formatDateToUrl(dateFrom);
    let formatDateTo = formatDateToUrl(dateTo);

    const myUrl = new URL(currentUrl.origin + currentUrl.pathname);
    if (currentUrl.searchParams.has("currency"))
      myUrl.searchParams.append(
        "currency",
        currentUrl.searchParams.get("currency")
      );
    myUrl.searchParams.append("dateFrom", formatDateFrom);
    myUrl.searchParams.append("dateTo", formatDateTo);

    window.location.href = myUrl;
  },
  "click .chkDatatable": function (event) {
    var columns = $("#tblFxCurrencyHistory th");
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
  "click .resetTable": function (event) {
    var getcurrentCloudDetails = CloudUser.findOne({
      _id: Session.get("mycloudLogonID"),
      clouddatabaseID: Session.get("mycloudLogonDBID"),
    });
    if (getcurrentCloudDetails) {
      if (getcurrentCloudDetails._id.length > 0) {
        var clientID = getcurrentCloudDetails._id;
        var clientUsername = getcurrentCloudDetails.cloudUsername;
        var clientEmail = getcurrentCloudDetails.cloudEmail;
        var checkPrefDetails = CloudPreference.findOne({
          userid: clientID,
          PrefName: "tblFxCurrencyHistory",
        });
        if (checkPrefDetails) {
          CloudPreference.remove(
            { _id: checkPrefDetails._id },
            function (err, idTag) {
              if (err) {
              } else {
                Meteor._reload.reload();
              }
            }
          );
        }
      }
    }
  },
  "click .saveTable": function (event) {
    LoadingOverlay.show();

    let lineItems = [];
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
        thclass: colthClass,
      };

      lineItems.push(lineItemObj);
    });

    var getcurrentCloudDetails = CloudUser.findOne({
      _id: Session.get("mycloudLogonID"),
      clouddatabaseID: Session.get("mycloudLogonDBID"),
    });
    if (getcurrentCloudDetails) {
      if (getcurrentCloudDetails._id.length > 0) {
        var clientID = getcurrentCloudDetails._id;
        var clientUsername = getcurrentCloudDetails.cloudUsername;
        var clientEmail = getcurrentCloudDetails.cloudEmail;
        var checkPrefDetails = CloudPreference.findOne({
          userid: clientID,
          PrefName: "tblFxCurrencyHistory",
        });
        if (checkPrefDetails) {
          CloudPreference.update(
            { _id: checkPrefDetails._id },
            {
              $set: {
                userid: clientID,
                username: clientUsername,
                useremail: clientEmail,
                PrefGroup: "salesform",
                PrefName: "tblFxCurrencyHistory",
                published: true,
                customFields: lineItems,
                updatedAt: new Date(),
              },
            },
            function (err, idTag) {
              if (err) {
                $("#myModal2").modal("toggle");
              } else {
                $("#myModal2").modal("toggle");
              }
            }
          );
        } else {
          CloudPreference.insert(
            {
              userid: clientID,
              username: clientUsername,
              useremail: clientEmail,
              PrefGroup: "salesform",
              PrefName: "tblFxCurrencyHistory",
              published: true,
              customFields: lineItems,
              createdAt: new Date(),
            },
            function (err, idTag) {
              if (err) {
                $("#myModal2").modal("toggle");
              } else {
                $("#myModal2").modal("toggle");
              }
            }
          );
        }
      }
    }
    LoadingOverlay.hide();
  },
  "blur .divcolumn": function (event) {
    let columData = $(event.target).text();

    let columnDatanIndex = $(event.target)
      .closest("div.columnSettings")
      .attr("id");
    var datable = $("#tblFxCurrencyHistory").DataTable();
    var title = datable.column(columnDatanIndex).header();
    $(title).html(columData);
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
    var datable = $("#tblFxCurrencyHistory th");
    $.each(datable, function (i, v) {
      if (v.innerText == columnDataValue) {
        let className = v.className;
        let replaceClass = className.replace(/ /g, ".");
        $("." + replaceClass + "").css("width", range + "px");
      }
    });
  },
  "click .btnOpenSettings": function (event) {
    let templateInstance = Template.instance();
    var columns = $("#tblFxCurrencyHistory th");

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
        sClass: v.className || "",
      };
      tableHeaderList.push(datatablerecordObj);
    });
    templateInstance.tableheaderrecords.set(tableHeaderList);
  },
  // "click .btnExportReportProfit": function () {
  //   $(".fullScreenSpin").css("display", "inline-block");
  //   let utilityService = new UtilityService();
  //   let templateObject = Template.instance();
  //   var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
  //   var dateTo = new Date($("#dateTo").datepicker("getDate"));

  //   let formatDateFrom =
  //     dateFrom.getFullYear() +
  //     "-" +
  //     (dateFrom.getMonth() + 1) +
  //     "-" +
  //     dateFrom.getDate();
  //   let formatDateTo =
  //     dateTo.getFullYear() +
  //     "-" +
  //     (dateTo.getMonth() + 1) +
  //     "-" +
  //     dateTo.getDate();

  //   const filename = loggedCompany + "-Profit and Loss" + ".csv";
  //   utilityService.exportReportToCsvTable("tableExport", filename, "csv");
  //   let rows = [];
  //   // reportService.getProfitandLoss(formatDateFrom,formatDateTo,false).then(function (data) {
  //   //     if(data.profitandlossreport){
  //   //         rows[0] = ['Account Type','Account Name', 'Account Number', 'Total Amount(EX)'];
  //   //         data.profitandlossreport.forEach(function (e, i) {
  //   //             rows.push([
  //   //               data.profitandlossreport[i]['AccountTypeDesc'],
  //   //               data.profitandlossreport[i].AccountName,
  //   //               data.profitandlossreport[i].AccountNo,
  //   //               // utilityService.modifynegativeCurrencyFormat(data.profitandlossreport[i]['Sub Account Total']),
  //   //               utilityService.modifynegativeCurrencyFormat(data.profitandlossreport[i].TotalAmount)]);
  //   //         });
  //   //         setTimeout(function () {
  //   //             utilityService.exportReportToCsv(rows, filename, 'xls');
  //   //             $('.fullScreenSpin').css('display','none');
  //   //         }, 1000);
  //   //     }
  //   //
  //   // });
  // },
  "click #exportbtn": function () {
    LoadingOverlay.show();
     jQuery("#tblFxCurrencyHistory_wrapper .dt-buttons .btntabletocsv").click();

    LoadingOverlay.hide();
  },
  "click .printConfirm": function (event) {
    playPrintAudio();
    setTimeout(function(){
    LoadingOverlay.show();
    // jQuery("#tblFxCurrencyHistory_wrapper .dt-buttons .btntabletopdf").click();

    document.title = 'vs1cloud';
    $("#tblFxCurrencyHistory").print({
      title: document.title + " | Fx Currency History | " + loggedCompany,
      noPrintSelector: ".addSummaryEditor, .excludeButton",
      exportOptions: {
        stripHtml: false,
      },
    });
    LoadingOverlay.hide();
  }, delayTimeAfterSound);
  },
  "click .btnRefresh": function () {
    LoadingOverlay.show();
    localStorage.setItem("VS1BalanceTrans_Report", "");
    Meteor._reload.reload();
  },
});

Template.FxCurrencyHistory.helpers({
  datatablerecords: () => {
    return Template.instance().datatablerecords.get().sort(function (a, b) {
        if (a.code == "NA") {
          return 1;
        } else if (b.code == "NA") {
          return -1;
        }
        return a.code.toUpperCase() > b.code.toUpperCase() ? 1 : -1;
        // return (a.saledate.toUpperCase() < b.saledate.toUpperCase()) ? 1 : -1;
      }).sort(sortById);
    // .sort(sortByDate);
    // .sort((a, b) => a.createdAt - b.createdAt);
  },
  tableheaderrecords: () => {
    let data = Template.instance().tableheaderrecords.get();
    return data;
  },
  salesCloudPreferenceRec: () => {
    return CloudPreference.findOne({
      userid: Session.get("mycloudLogonID"),
      PrefName: "currencyLists",
    });
  },
  countryList: () => {
    return Template.instance().countryData.get();
  },
  loggedCompany: () => {
    return localStorage.getItem("mySession") || "";
  },
  isCurrencyEnable: () => FxGlobalFunctions.isCurrencyEnabled()

});

function sortById(a, b) {
  return a.id - b.id;
}

/**
 *
 * @param {Date} a
 * @param {Date} b
 * @returns
 */
function sortByDate(a, b) {
  return a - b;
}

/**
 *
 * @param {string} urlDate
 * @returns {Date}
 */
function formatDateFromUrl(urlDate) {
  const _date = urlDate.split("/");

  const finalDate = new Date(_date[2], _date[1], _date[0]);

  return finalDate;
}

/**
 *
 * @param {Date} date
 * @returns {string}
 */
function formatDateToUrl(date) {
  let _date = formatDateToString(date);
  _date = _date.replaceAll("/", "-");
  return _date;
}

/**
 *
 * @param {Date} date
 * @returns {string}
 */
function formatDateToString(date) {
  let _date = date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return _date;
}
