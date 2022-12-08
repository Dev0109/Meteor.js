import { ReactiveVar } from "meteor/reactive-var";
import '../../lib/global/indexdbstorage.js';
import { SideBarService } from '../../js/sidebar-service';
import { UtilityService } from "../../utility-service";
const highCharts = require('highcharts');
require('highcharts/modules/exporting')(highCharts);
require('highcharts/highcharts-more')(highCharts);
let _ = require("lodash");
let sideBarService = new SideBarService();
let utilityService = new UtilityService();
let formatDateFrom;
let formatDateTo;

Template.opportunitiesStatus.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.tleadsstatustype = new ReactiveVar([]);
});

Template.opportunitiesStatus.onRendered(function() {
    const templateObject = Template.instance();
    const dataTableList = [];

    templateObject.getLeadStatusData = function() {
        getVS1Data('TLeadStatusType').then(function(dataObject) {
            if (dataObject.length == 0) {
                sideBarService.getAllLeadStatus().then(function(data) {
                    setLeadStatusList(data);
                })
            } else {
                let data = JSON.parse(dataObject[0].data);
                setLeadStatusList(data);
            }
        }).catch(function(err) {
            sideBarService.getAllLeadStatus().then(function(data) {
                setLeadStatusList(data);
            })
        });
    }

    function setLeadStatusList(data) {
        for (let i = 0; i < data.tleadstatustype.length; i++) {
            let eqpm = Number(data.tleadstatustype[i].EQPM);
            const dataList = {
                id: data.tleadstatustype[i].Id || '',
                typeName: data.tleadstatustype[i].TypeName || '',
                description: data.tleadstatustype[i].Description || data.tleadstatustype[i].TypeName,
                eqpm: utilityService.negativeNumberFormat(eqpm)
            };
            dataTableList[data.tleadstatustype[i].TypeName] = dataList;
        }
        templateObject.tleadsstatustype.set(dataTableList);

    }
    templateObject.getLeadStatusData();

    function chartClickEvent(event, array) {
        if (array[0] != undefined) {
            // var activePoints = array[0]["_model"].label;
            // FlowRouter.go("/newprofitandloss?daterange=monthly" + activePoints);
            FlowRouter.go("/leadlist");
        }
    }

    async function renderCharts(formatDateFrom, formatDateTo, ignoreDate) {
        // leads comparison charts logic
        const dataProspectObject = await getVS1Data('TProspectEx');
        let leadsCount6Months = 0;
        let leadsStatus = {};
        if (dataProspectObject.length) {
            let { tprospect = [] } = JSON.parse(dataProspectObject[0].data);
            let leadsstatustype = templateObject.tleadsstatustype.get();

            // const momentUnix = moment().subtract(6, 'months').unix();
            const fromDate = new Date(formatDateFrom);
            const toDate = new Date(formatDateTo);

            tprospect.forEach(item => {
                let creationDate = (item.fields.CreationDate) ? new Date(item.fields.CreationDate) : "";
                if (fromDate <= creationDate && toDate >= creationDate) {
                    // if (moment(item.fields.CreationDate).unix() > momentUnix) {
                    if (leadsstatustype[item.fields.Status] != undefined) {
                        leadsStatus[item.fields.Status || 'Unqualified'] = {
                            amount: isNaN(parseInt(leadsStatus[item.fields.Status || 'Unqualified'])) ? 1 : parseInt(leadsStatus[item.fields.Status || 'Unqualified'].amount) + 1,
                            expect: isNaN(parseInt(leadsStatus[item.fields.Status || 'Unqualified'])) ? parseInt(leadsstatustype[item.fields.Status || 'Unqualified'].eqpm) : parseInt(leadsStatus[item.fields.Status || 'Unqualified'].expect) + parseInt(leadsstatustype[item.fields.Status || 'Unqualified'].eqpm)
                        }
                    }
                    leadsCount6Months += 1;
                }
            });
        }
        let leadsStatusCount = _.map(_.keys(leadsStatus), key => {
            return { amount: leadsStatus[key].amount, expect: leadsStatus[key].expect, statusName: key };
        });
        leadsStatusCount = _.sortBy(leadsStatusCount, ['totalCount']).reverse().slice(0, 3);
        let status = [];
        let statusValues = [];
        let statusExpectValues = [];
        _.each(leadsStatusCount, (statusCount) => {
            status.push(statusCount.statusName);
            statusValues.push(statusCount.amount)
            statusExpectValues.push(statusCount.expect)
        });
        renderOpportunitiesChart({ status, statusValues });
    }

    function renderOpportunitiesChart({ status, statusValues, statusExpectValues }) {
        var ctx = document
            .getElementById("opens-opportunitiesStatus-chart")
            .getContext("2d");
        var myChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: status,
                datasets: [{
                        label: "Amount",
                        backgroundColor: "#00a3d3",
                        borderColor: "rgba(78,115,223,0)",
                        data: statusValues,
                    },
                    {
                        label: "Expect",
                        backgroundColor: "#33c942",
                        data: statusExpectValues,
                    },
                ],
            },
            options: {
                maintainAspectRatio: false,
                responsive: true,
                tooltips: {
                    callbacks: {
                        label: function(tooltipItem, data) {
                            return (
                                // utilityService.modifynegativeCurrencyFormat(
                                Math.abs(tooltipItem.yLabel)
                                // ) || 0.0
                            );
                        },
                    },
                },
                //      bezierCurve : true,
                //     animation: {
                //     onComplete: done
                // },
                legend: {
                    display: true,
                    position: "right",
                    reverse: false,
                },
                onClick: chartClickEvent,
                title: {},
                scales: {
                    xAxes: [{
                        gridLines: {
                            color: "rgb(234, 236, 244)",
                            zeroLineColor: "rgb(234, 236, 244)",
                            drawBorder: false,
                            drawTicks: false,
                            borderDash: ["2"],
                            zeroLineBorderDash: ["2"],
                            drawOnChartArea: false,
                        },
                        ticks: {
                            fontColor: "#858796",
                            padding: 20,
                        },
                    }, ],
                    yAxes: [{
                        gridLines: {
                            color: "rgb(234, 236, 244)",
                            zeroLineColor: "rgb(234, 236, 244)",
                            drawBorder: false,
                            drawTicks: false,
                            borderDash: ["2"],
                            zeroLineBorderDash: ["2"],
                        },
                        ticks: {
                            fontColor: "#858796",
                            beginAtZero: true,
                            padding: 20,
                        },
                    }, ],
                },
            },
        });
    }
    templateObject.setDateVal = function() {
        const dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        const dateTo = new Date($("#dateTo").datepicker("getDate"));
        formatDateFrom =
            dateFrom.getFullYear() +
            "-" +
            (dateFrom.getMonth() + 1) +
            "-" +
            dateFrom.getDate();
        formatDateTo =
            dateTo.getFullYear() +
            "-" +
            (dateTo.getMonth() + 1) +
            "-" +
            dateTo.getDate();
        if (
            $("#dateFrom").val().replace(/\s/g, "") == "" &&
            $("#dateTo").val().replace(/\s/g, "") == ""
        ) {
            renderCharts(formatDateFrom, formatDateTo, true);
        } else {
            renderCharts(formatDateFrom, formatDateTo, false);
        }
    }

    setTimeout(function() {
        templateObject.setDateVal();
    }, 0);
});

Template.opportunitiesStatus.events({
    "click #opens-opportunities-chart": () => {
        // FlowRouter.go('/leadlist');
        window.open("/leadlist", '_self');
    },
});
