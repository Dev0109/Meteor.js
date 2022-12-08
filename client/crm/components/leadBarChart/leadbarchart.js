import '../../../lib/global/indexdbstorage.js';
import { CRMService } from "../../crm-service"
let _ = require('lodash');

Template.leadbarchart.onCreated(() => {
  const templateObject = Template.instance();
  templateObject.records = new ReactiveVar([]);
  templateObject.dateAsAt = new ReactiveVar();
  templateObject.deptrecords = new ReactiveVar();

  templateObject.salesperc = new ReactiveVar();
  templateObject.expenseperc = new ReactiveVar();
  templateObject.salespercTotal = new ReactiveVar();
  templateObject.expensepercTotal = new ReactiveVar();
  templateObject.topTenData = new ReactiveVar([]);
});


Template.leadbarchart.onRendered(() => {
  const templateObject = Template.instance();

  function chartClickEvent() {
    FlowRouter.go("/leadlist");
  }

  function getModdayOfCurrentWeek(date) {
    const today = new Date(date);
    const first = today.getDate() - today.getDay() + 1;

    const monday = moment(new Date(today.setDate(first))).format("DD/MM/YYYY");
    return monday;
  }

  function getSundayOfCurrentWeek(date) {
    const today = new Date(date);
    const first = today.getDate() - today.getDay() + 1;
    const last = first + 6;

    const sunday = moment(new Date(today.setDate(last))).format("DD/MM/YYYY");
    return sunday;
  }

  function drawBarChart(records) {
    let labels = [];
    let data = [];
    let colors = [];
    for (let key in records) {
      labels.push(key);
      data.push(records[key].length);
      colors.push('#01a2d3');
    }

    var ctx = document.getElementById("chart_leadbarchart").getContext("2d");
    var barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Record Count ',
          data: data,
          backgroundColor: colors,
          borderWidth: 1
        }]
      },
      options: {
        'onClick': chartClickEvent,
        maintainAspectRatio: false,
        responsive: true, 
        "legend": {
          "display": false
        },
        "title": {},
        "scales": {
          "xAxes": [
            {
              "gridLines": {
                "color": "rgb(234, 236, 244)",
                "zeroLineColor": "rgb(234, 236, 244)",
                "drawBorder": false,
                "drawTicks": false,
                "borderDash": ["2"],
                "zeroLineBorderDash": ["2"],
                "drawOnChartArea": false
              },
              "ticks": {
                "fontColor": "#858796",
                "beginAtZero": true,
                "padding": 20
              },
              "scaleLabel": {
                "display": true,
                "labelString": 'Created Date',
                "fontColor": "#546372"
              }
            }],
          "yAxes": [{
            "gridLines": {
              "color": "rgb(234, 236, 244)",
              "zeroLineColor": "rgb(234, 236, 244)",
              "drawBorder": false,
              "drawTicks": false,
              "borderDash": ["2"],
              "zeroLineBorderDash": ["2"]
            },
            "ticks": {
              "fontColor": "#858796",
              "beginAtZero": true,
              "padding": 20
            },
            "scaleLabel": {
              "display": true,
              "labelString": 'Record Count'
            }
          }
          ]
        }
      }
    });
  }


  function drawPieChart(records) {

    let labels = [];
    let data = [];
    let backgroundColors = ["#00a3d3",
      "#199700",
      "#fd7e14",
      "#36b9cc"];
    let borderColors = [];
    for (let key in records) {
      labels.push(key);
      data.push(records[key].length);
      borderColors.push('#ffffff00');
    } 

    var ctx = document.getElementById("chart_leadpiechart").getContext("2d");
    try {
      var pieChart = new Chart(ctx, {
        type: "pie",
        data: {
          labels: labels,
          datasets: [
            {
              label: labels[0],
              backgroundColor: backgroundColors,
              borderColor: borderColors,
              data: data,
            },
          ],
        },
        options: {
          'onClick': chartClickEvent,
          maintainAspectRatio: false,
          responsive: true,
          legend: {
            display: true,
            position: "bottom",
            reverse: false,
          },
          title: {
            display: false,
          },
        },
      });

    } catch (error) {

    }
  };

  templateObject.getLeadBarChartData = function () {
    let crmService = new CRMService();
    let dateFrom = moment().subtract(3, "months").format("YYYY-MM-DD") + " 00:00:00";

    getVS1Data("TCRMLeadBarChart").then(function (dataObject) {
      if (dataObject.length) {
        let data = JSON.parse(dataObject[0].data);
        drawBarChart(data)
      }
    }).catch(function (err) {

    });

    getVS1Data("TCRMLeadPieChart").then(function (dataObject) {
      if (dataObject.length) {
        let data = JSON.parse(dataObject[0].data);
        drawPieChart(data)
      }
    }).catch(function (err) {

    });

    crmService.getAllLeads(dateFrom).then(function (data) {

      let bar_records = [];
      let pie_records = [];
      if (data.tprospect.length) {

        let accountData = data.tprospect;
        for (let i = 0; i < accountData.length; i++) {
          let recordObj = {};
          recordObj.Id = data.tprospect[i].fields.ID;
          CreationDate = data.tprospect[i].fields.CreationDate ? data.tprospect[i].fields.CreationDate.substr(0, 10) : "";

          recordObj.CreationDateSort = CreationDate ? CreationDate : "-";
          recordObj.CreationDate = CreationDate ? getModdayOfCurrentWeek(CreationDate) + "~" : "-";
          bar_records.push(recordObj);

          let pieRecordObj = {};
          pieRecordObj.Id = data.tprospect[i].fields.ID;
          pieRecordObj.SourceName = data.tprospect[i].fields.SourceName ? data.tprospect[i].fields.SourceName : "-";
          pie_records.push(pieRecordObj);
        }

        bar_records = _.sortBy(bar_records, 'CreationDateSort');
        bar_records = _.groupBy(bar_records, 'CreationDate');

        pie_records = _.sortBy(pie_records, 'SourceName');
        pie_records = _.groupBy(pie_records, 'SourceName');

      } else {
        let recordObj = {};
        recordObj.Id = '';
        recordObj.CreationDate = '-';

        let pieRecordObj = {};
        pieRecordObj.Id = '';
        pieRecordObj.SourceName = '-';

        bar_records.push(recordObj);
        pie_records.push(pieRecordObj);
      }

      addVS1Data("TCRMLeadBarChart", JSON.stringify(bar_records));
      addVS1Data("TCRMLeadPieChart", JSON.stringify(pie_records)); 

    }).catch(function (err) {

    });
  }

  templateObject.getLeadBarChartData();

});
