import { ReactiveVar } from 'meteor/reactive-var';
import { SideBarService } from "../../../js/sidebar-service";
import { UtilityService } from "../../../utility-service";

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
let _ = require("lodash");
const _cardGroup = 'TPurchaseHeaderCard';
const _tabGroup = 7;

Template.purchasesoverviewcards.onCreated(function() {
    const templateObject = Template.instance();
});

Template.purchasesoverviewcards.onRendered(function() {
    let templateObject = Template.instance();
    const dataTableList = [];
  const tableHeaderList = [];
  let totAmount = 0;
  let totAmountBill = 0;
  let totAmountCredit = 0;

  let totCreditCount = 0;
  let totBillCount = 0;
  let totPOCount = 0;

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

  var date = new Date();
  var month = date.getMonth() + 1;
  date.setDate(1);
  var all_days = [];
  var all_daysNoYear = [];
  while (date.getMonth() + 1 == month) {
    var d =
      date.getFullYear() +
      "-" +
      month.toString().padStart(2, "0") +
      "-" +
      date.getDate().toString().padStart(2, "0");
    var dnoyear =
      moment(month.toString().padStart(2, "0")).format("MMMM").substring(0, 3) +
      " " +
      date.getDate().toString().padStart(2, "0");
    all_days.push(d);
    all_daysNoYear.push(dnoyear);
    date.setDate(date.getDate() + 1);
  }
    templateObject.getAllPurchaseOrderAll = function () {
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

        getVS1Data("TbillReport")
          .then(function (dataObject) {
            if (dataObject.length == 0) {
              sideBarService
                .getAllPurchaseOrderListAll(
                  prevMonth11Date,
                  toDate,
                  true,
                  initialReportLoad,
                  0
                )
                .then(function (data) {
                  let lineItems = [];
                  let lineItemObj = {};
                  addVS1Data("TbillReport", JSON.stringify(data));
                  let totalExpense = 0;
                  let totalBill = 0;
                  let totalCredit = 0;
                  let totalPO = 0;

                  for (let i = 0; i < data.tbillreport.length; i++) {
                    let orderType = data.tbillreport[i].Type;
                    totalExpense += Number(
                      data.tbillreport[i]["Total Amount (Inc)"]
                    );
                    if (data.tbillreport[i].Type == "Credit") {
                      totCreditCount++;
                      totalCredit += Number(
                        data.tbillreport[i]["Total Amount (Inc)"]
                      );
                    }

                    if (data.tbillreport[i].Type == "Bill") {
                      totBillCount++;
                      totalBill += Number(
                        data.tbillreport[i]["Total Amount (Inc)"]
                      );
                    }

                    if (data.tbillreport[i].Type == "Purchase Order") {
                      totPOCount++;
                      orderType = "PO";
                      totalPO += Number(data.tbillreport[i]["Total Amount (Inc)"]);
                    }
                    let totalAmountEx =
                      utilityService.modifynegativeCurrencyFormat(
                        data.tbillreport[i]["Total Amount (Ex)"]
                      ) || 0.0;
                    let totalTax =
                      utilityService.modifynegativeCurrencyFormat(
                        data.tbillreport[i]["Total Tax"]
                      ) || 0.0;
                    let totalAmount =
                      utilityService.modifynegativeCurrencyFormat(
                        data.tbillreport[i]["Total Amount (Inc)"]
                      ) || 0.0;
                    let amountPaidCalc =
                      data.tbillreport[i]["Total Amount (Inc)"] -
                      data.tbillreport[i].Balance;
                    let totalPaid =
                      utilityService.modifynegativeCurrencyFormat(amountPaidCalc) ||
                      0.0;
                    let totalOutstanding =
                      utilityService.modifynegativeCurrencyFormat(
                        data.tbillreport[i].Balance
                      ) || 0.0;
                    var dataList = {
                      id: data.tbillreport[i].PurchaseOrderID || "",
                      employee: data.tbillreport[i].Contact || "",
                      sortdate:
                        data.tbillreport[i].OrderDate != ""
                          ? moment(data.tbillreport[i].OrderDate).format(
                              "YYYY/MM/DD"
                            )
                          : data.tbillreport[i].OrderDate,
                      orderdate:
                        data.tbillreport[i].OrderDate != ""
                          ? moment(data.tbillreport[i].OrderDate).format(
                              "DD/MM/YYYY"
                            )
                          : data.tbillreport[i].OrderDate,
                      suppliername: data.tbillreport[i].Company || "",
                      totalamountex: totalAmountEx || 0.0,
                      totaltax: totalTax || 0.0,
                      totalamount: totalAmount || 0.0,
                      totalpaid: totalPaid || 0.0,
                      totaloustanding: totalOutstanding || 0.0,
                      // orderstatus: data.tbillreport[i].OrderStatus || '',
                      type: orderType || "",
                      custfield1: data.tbillreport[i].Phone || "",
                      custfield2: data.tbillreport[i].InvoiceNumber || "",
                      comments: data.tbillreport[i].Comments || "",
                    };
                    if (data.tbillreport[i].Deleted === false) {
                      dataTableList.push(dataList);
                      if (data.tbillreport[i].Balance != 0) {
                        if (data.tbillreport[i].Type == "Purchase Order") {
                          totAmount += Number(data.tbillreport[i].Balance);
                        }
                        if (data.tbillreport[i].Type == "Bill") {
                          totAmountBill += Number(data.tbillreport[i].Balance);
                        }
                        if (data.tbillreport[i].Type == "Credit") {
                          totAmountCredit += Number(data.tbillreport[i].Balance);
                        }
                      }
                    }
                    $(".suppAwaitingAmt").text(
                      utilityService.modifynegativeCurrencyFormat(totAmount)
                    );
                    $(".billAmt").text(
                      utilityService.modifynegativeCurrencyFormat(totAmountBill)
                    );
                    $(".creditAmt").text(
                      utilityService.modifynegativeCurrencyFormat(totAmountCredit)
                    );
                    // splashArray.push(dataList);
                    //}
                  }
                })
                .catch(function (err) {
                });
            } else {
              let data = JSON.parse(dataObject[0].data);
              let useData = data.tbillreport;
              let lineItems = [];
              let lineItemObj = {};

              if (data.Params.IgnoreDates == true) {
                $("#dateFrom").attr("readonly", true);
                $("#dateTo").attr("readonly", true);
                //FlowRouter.go("/purchasesoverview?ignoredate=true");
              } else {
                $("#dateFrom").attr("readonly", false);
                $("#dateTo").attr("readonly", false);
                $("#dateFrom").val(data.Params.DateFrom != ""? moment(data.Params.DateFrom).format("DD/MM/YYYY"): data.Params.DateFrom);
                $("#dateTo").val(data.Params.DateTo != ""? moment(data.Params.DateTo).format("DD/MM/YYYY"): data.Params.DateTo);
              }
              let totalExpense = 0;
              let totalBill = 0;
              let totalCredit = 0;
              let totalPO = 0;
              $(".fullScreenSpin").css("display", "none");
              for (let i = 0; i < useData.length; i++) {
                totalExpense += Number(useData[i]["Total Amount (Inc)"]);
                let orderType = useData[i].Type;
                if (useData[i].Type == "Credit") {
                  totCreditCount++;
                  totalCredit += Number(useData[i]["Total Amount (Inc)"]);
                }

                if (useData[i].Type == "Bill") {
                  totBillCount++;
                  totalBill += Number(useData[i]["Total Amount (Inc)"]);
                }

                if (useData[i].Type == "Purchase Order") {
                  totPOCount++;
                  orderType = "PO";
                  totalPO += Number(useData[i]["Total Amount (Inc)"]);
                }
                let totalAmountEx =
                  utilityService.modifynegativeCurrencyFormat(
                    useData[i]["Total Amount (Ex)"]
                  ) || 0.0;
                let totalTax =
                  utilityService.modifynegativeCurrencyFormat(
                    useData[i]["Total Tax"]
                  ) || 0.0;
                let totalAmount =
                  utilityService.modifynegativeCurrencyFormat(
                    useData[i]["Total Amount (Inc)"]
                  ) || 0.0;
                let amountPaidCalc =
                  useData[i]["Total Amount (Inc)"] - useData[i].Balance;
                let totalPaid =
                  utilityService.modifynegativeCurrencyFormat(amountPaidCalc) ||
                  0.0;
                let totalOutstanding =
                  utilityService.modifynegativeCurrencyFormat(useData[i].Balance) ||
                  0.0;
                var dataList = {
                  id: useData[i].PurchaseOrderID || "",
                  employee: useData[i].Contact || "",
                  sortdate:
                    useData[i].OrderDate != ""
                      ? moment(useData[i].OrderDate).format("YYYY/MM/DD")
                      : useData[i].OrderDate,
                  orderdate:
                    useData[i].OrderDate != ""
                      ? moment(useData[i].OrderDate).format("DD/MM/YYYY")
                      : useData[i].OrderDate,
                  suppliername: useData[i].Company || "",
                  totalamountex: totalAmountEx || 0.0,
                  totaltax: totalTax || 0.0,
                  totalamount: totalAmount || 0.0,
                  totalpaid: totalPaid || 0.0,
                  totaloustanding: totalOutstanding || 0.0,
                  // orderstatus: useData[i].OrderStatus || '',
                  type: orderType || "",
                  custfield1: useData[i].Phone || "",
                  custfield2: useData[i].InvoiceNumber || "",
                  comments: useData[i].Comments || "",
                };
                //if (useData[i].Deleted === false) {
                dataTableList.push(dataList);
                //if (useData[i].Balance != 0) {
                if (useData[i].Type == "Purchase Order") {
                  totAmount += Number(useData[i].Balance);
                }

                if (useData[i].Type == "Bill") {
                  totAmountBill += Number(useData[i].Balance);
                }

                if (useData[i].Type == "Credit") {
                  totAmountCredit += Number(useData[i].Balance);
                }
                //}
                //}
                $(".suppAwaitingAmt").text(
                  utilityService.modifynegativeCurrencyFormat(totAmount)
                );
                $(".billAmt").text(
                  utilityService.modifynegativeCurrencyFormat(totAmountBill)
                );
                $(".creditAmt").text(
                  utilityService.modifynegativeCurrencyFormat(totAmountCredit)
                );
                // splashArray.push(dataList);
                //}
              }
            }
          })
          .catch(function (err) {
            sideBarService
              .getAllPurchaseOrderListAll(
                prevMonth11Date,
                toDate,
                true,
                initialReportLoad,
                0
              )
              .then(function (data) {
                addVS1Data("TbillReport", JSON.stringify(data));
                let lineItems = [];
                let lineItemObj = {};

                let totalExpense = 0;
                let totalBill = 0;
                let totalCredit = 0;
                let totalPO = 0;

                for (let i = 0; i < data.tbillreport.length; i++) {
                  let orderType = data.tbillreport[i].Type;
                  totalExpense += Number(data.tbillreport[i]["Total Amount (Inc)"]);
                  if (data.tbillreport[i].Type == "Credit") {
                    totCreditCount++;
                    totalCredit += Number(
                      data.tbillreport[i]["Total Amount (Inc)"]
                    );
                  }

                  if (data.tbillreport[i].Type == "Bill") {
                    totBillCount++;
                    totalBill += Number(data.tbillreport[i]["Total Amount (Inc)"]);
                  }

                  if (data.tbillreport[i].Type == "Purchase Order") {
                    totPOCount++;
                    orderType = "PO";
                    totalPO += Number(data.tbillreport[i]["Total Amount (Inc)"]);
                  }
                  let totalAmountEx =
                    utilityService.modifynegativeCurrencyFormat(
                      data.tbillreport[i]["Total Amount (Ex)"]
                    ) || 0.0;
                  let totalTax =
                    utilityService.modifynegativeCurrencyFormat(
                      data.tbillreport[i]["Total Tax"]
                    ) || 0.0;
                  let totalAmount =
                    utilityService.modifynegativeCurrencyFormat(
                      data.tbillreport[i]["Total Amount (Inc)"]
                    ) || 0.0;
                  let amountPaidCalc =
                    data.tbillreport[i]["Total Amount (Inc)"] -
                    data.tbillreport[i].Balance;
                  let totalPaid =
                    utilityService.modifynegativeCurrencyFormat(amountPaidCalc) ||
                    0.0;
                  let totalOutstanding =
                    utilityService.modifynegativeCurrencyFormat(
                      data.tbillreport[i].Balance
                    ) || 0.0;
                  var dataList = {
                    id: data.tbillreport[i].PurchaseOrderID || "",
                    employee: data.tbillreport[i].Contact || "",
                    sortdate:
                      data.tbillreport[i].OrderDate != ""
                        ? moment(data.tbillreport[i].OrderDate).format("YYYY/MM/DD")
                        : data.tbillreport[i].OrderDate,
                    orderdate:
                      data.tbillreport[i].OrderDate != ""
                        ? moment(data.tbillreport[i].OrderDate).format("DD/MM/YYYY")
                        : data.tbillreport[i].OrderDate,
                    suppliername: data.tbillreport[i].Company || "",
                    totalamountex: totalAmountEx || 0.0,
                    totaltax: totalTax || 0.0,
                    totalamount: totalAmount || 0.0,
                    totalpaid: totalPaid || 0.0,
                    totaloustanding: totalOutstanding || 0.0,
                    // orderstatus: data.tbillreport[i].OrderStatus || '',
                    type: orderType || "",
                    custfield1: data.tbillreport[i].Phone || "",
                    custfield2: data.tbillreport[i].InvoiceNumber || "",
                    comments: data.tbillreport[i].Comments || "",
                  };
                  if (data.tbillreport[i].Deleted === false) {
                    dataTableList.push(dataList);
                    if (data.tbillreport[i].Balance != 0) {
                      if (data.tbillreport[i].Type == "Purchase Order") {
                        totAmount += Number(data.tbillreport[i].Balance);
                      }
                      if (data.tbillreport[i].Type == "Bill") {
                        totAmountBill += Number(data.tbillreport[i].Balance);
                      }
                      if (data.tbillreport[i].Type == "Credit") {
                        totAmountCredit += Number(data.tbillreport[i].Balance);
                      }
                    }
                  }
                  $(".suppAwaitingAmt").text(
                    utilityService.modifynegativeCurrencyFormat(totAmount)
                  );
                  $(".billAmt").text(
                    utilityService.modifynegativeCurrencyFormat(totAmountBill)
                  );
                  $(".creditAmt").text(
                    utilityService.modifynegativeCurrencyFormat(totAmountCredit)
                  );
                }
              })
              .catch(function (err) {
                // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                $(".fullScreenSpin").css("display", "none");
                // Meteor._reload.reload();
              });
          });
      };

      templateObject.getAllPurchaseOrderAll();
});

Template.purchasesoverviewcards.helpers({

});
