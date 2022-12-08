import { ReactiveVar } from 'meteor/reactive-var';
import { SideBarService } from "../../js/sidebar-service";
import { UtilityService } from "../../utility-service";

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
let _ = require('lodash');

Template.expensebreakdown.onCreated(function(){
  const templateObject = Template.instance();
  templateObject.datatablerecords = new ReactiveVar([]);
  templateObject.tableheaderrecords = new ReactiveVar([]);

  templateObject.creditperc = new ReactiveVar();
  templateObject.billperc = new ReactiveVar();
  templateObject.poperc = new ReactiveVar();
  templateObject.billpercTotal = new ReactiveVar();
  templateObject.creditpercTotal = new ReactiveVar();
  templateObject.popercTotal = new ReactiveVar();
});


Template.expensebreakdown.onRendered(function() {
  let templateObject = Template.instance();
  let totCreditCount = 0;
  let totBillCount = 0;
  let totPOCount = 0;
  function chartClickEvent(event, array) {
    if (array[0] != undefined) {
      FlowRouter.go("/newprofitandloss?daterange=ignore&?show=loss");
    }
  }
  var ctx = document.getElementById("expensebreakdownchart").getContext("2d");

  templateObject.displayExpenseChart = async (e) => {
    var myChart = new Chart(ctx, {
      type: "pie",

      data: {
        labels: ["Credit", "Bill", "Purchase Order"],
        datasets: [
          {
            label: "Credit",
            backgroundColor: [
              "#e74a3b",
              "#f6c23e",
              "#1cc88a",
              "#36b9cc",
            ],
            borderColor: [
              "#ffffff",
              "#ffffff",
              "#ffffff",
              "#ffffff",
            ],
            data: [totCreditCount, totBillCount, totPOCount],
          },
        ],
      },
      options: {
        'onClick': chartClickEvent,
        maintainAspectRatio: false,
        responsive: true,
        legend: {
          display: true,
          position: "right",
          reverse: false,
        },
        title: {
          display: false,
        },
      },
    });
  };
  templateObject.getAllPurchaseOrderAll = async (e) => {
    let totalExpense = 0;
    let useData = [];
    setTimeout( async function () {
      let billReportObj = await getVS1Data("TPurchasesList");
      if (billReportObj.length == 0) {
        var currentBeginDate = new Date();
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
        var toDate = currentBeginDate.getFullYear() + "-" + fromDateMonth + "-" + fromDateDay;
        let prevMonth11Date = moment().subtract(reportsloadMonths, "months").format("YYYY-MM-DD");
        let data = await sideBarService.getAllPurchasesList(prevMonth11Date, toDate, false, initialReportLoad, 0 );
        useData = data.tbilllist;
      }else{
        let data = JSON.parse(billReportObj[0].data);
        useData = data.tbilllist;
      }
      // get common data from both request
      if( useData.length ){
        for (let i = 0; i < useData.length; i++) {
          totalExpense += Number(useData[i].TotalAmountInc);
          if (useData[i].IsCredit == true) {
            totCreditCount++;
          }
          if (useData[i].IsBill == true) {
            totBillCount++;
          }
          if (useData[i].IsPO == true) {
            totPOCount++;
          }
        }
      }
      $(".spExpenseTotal").text(
        utilityService.modifynegativeCurrencyFormat(totalExpense)
      );
      // show chart
      templateObject.displayExpenseChart();
    }, 1000)
  };
  templateObject.getAllPurchaseOrderAll();
});
