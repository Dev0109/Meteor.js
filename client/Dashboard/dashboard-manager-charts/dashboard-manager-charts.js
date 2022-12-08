import { ReactiveVar } from "meteor/reactive-var";
const highCharts = require('highcharts');
require('highcharts/modules/exporting')(highCharts);
require('highcharts/highcharts-more')(highCharts);
let _ = require("lodash");
import { UtilityService } from "../../utility-service";
import {SideBarService} from "../../js/sidebar-service";

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
let formatDateFrom;
let formatDateTo;

Template.dashboardManagerCharts.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.employees = new ReactiveVar([]);
    templateObject.employeesByTotalSales = new ReactiveVar([]);
});

Template.dashboardManagerCharts.onRendered(function () {
    const templateObject = Template.instance();
    function formatPrice(amount){
        if( isNaN(amount) || !amount){
            amount = ( amount === undefined || amount === null || amount.length === 0 ) ? 0 : amount;
            amount = ( amount )? Number(amount.replace(/[^0-9.-]+/g,"")): 0;
        }
        return utilityService.modifynegativeCurrencyFormat(amount)|| 0.00;
    }

    function renderSPMEmployeeChart() {
        let employeeNames = [];
        let employeesTotalDiscount = [];
        const filteredEmployees = _.filter(templateObject.employeesByTotalSales.get(), emp => !!emp.totalDiscount);
        _.each(filteredEmployees, emp => {
            if(emp.totalDiscount > 0) {
                employeeNames.push(emp.name);
                employeesTotalDiscount.push(emp.totalDiscount);
            }
        });
        /*
        highCharts.chart('spd-employee-chart', {
            series: [{
                name: 'Employees',
                data: employeesTotalDiscount
            }],
            chart: {
                type: 'bar'
            },
            title: {
                text: '',
                style: {
                    display: 'none'
                }
            },
            subtitle: {
                text: 'Discount Given By Employees',
                style: {
                    display: 'none'
                }
            },
            exporting: {
                enabled: false
            },
            xAxis: {
                categories: employeeNames
            },
            yAxis: {
                allowDecimals: false,
                title: {
                    text: ''
                }
            },
            tooltip: {
                formatter: function () {
                    return '<b>' + this.series.name + '</b><br/>' +
                        this.point.y;
                }
            }
        });
        */
        if (employeeNames.length > 0) {
            const ctx = document.getElementById("spd-employee-chart").getContext("2d");
            const myChart = new Chart(ctx, {
                type: "horizontalBar",
                data: {
                    labels: employeeNames,
                    datasets: [
                        {
                            label: "Earnings",
                            data: employeesTotalDiscount,
                            backgroundColor: [
                                "#f6c23e",
                                "#f6c23e",
                                "#f6c23e",
                                "#f6c23e",
                                "#f6c23e",
                                "#f6c23e",
                            ],
                            borderColor: [
                                "rgba(78,115,223,0)",
                                "rgba(78,115,223,0)",
                                "rgba(78,115,223,0)",
                                "rgba(78,115,223,0)",
                                "rgba(78,115,223,0)",
                                "rgba(78,115,223,0)",
                            ],
                            borderWidth: 1,
                        },
                    ],
                },
                options: {
                    onClick: chartClickEvent,
                    maintainAspectRatio: false,
                    responsive: true,
                    tooltips: {
                        callbacks: {
                            label: function (tooltipItem, data) {
                                return (
                                    utilityService.modifynegativeCurrencyFormat(
                                        tooltipItem.xLabel
                                    ) || 0.0
                                );
                            },
                        },
                    },
                    legend: {
                        display: false,
                    },
                    title: {},
                    scales: {
                        xAxes: [
                            {
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
                                    beginAtZero: true,
                                    padding: 20,
                                },
                            },
                        ],
                        yAxes: [
                            {
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
                            },
                        ],
                    },
                },
            });
        }
    }

    function chartClickEvent() {
        FlowRouter.go("/employeelist");
    }

    function setGaugeChart({ divId, empData, index }) {
        const fourtyPercentOfQuota = ((40 / 100) * empData.salesQuota).toFixed();
        const eightyPercentOfQuota = ((80 / 100) * empData.salesQuota).toFixed();
        const oneTwentyPercentOfQuota = ((120 / 100) * empData.salesQuota).toFixed();
        const chartEndRangeValue = empData.totalSales > oneTwentyPercentOfQuota ? parseInt(empData.totalSales) : oneTwentyPercentOfQuota;
        const options = {
            chart: {
                type: 'gauge',
                plotBackgroundColor: null,
                plotBackgroundImage: null,
                plotBorderWidth: 0,
                plotShadow: false
            },
            title: {
                text: empData.name,
                align: 'center',
                verticalAlign: 'bottom',
                y: 10
            },
            exporting: {
                enabled: false
            },
            pane: {
                startAngle: -150,
                endAngle: 150,
                background: [{
                    backgroundColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                            [0, '#FFF'],
                            [1, '#333']
                        ]
                    },
                    borderWidth: 0,
                    outerRadius: '109%'
                }, {
                    backgroundColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                            [0, '#333'],
                            [1, '#FFF']
                        ]
                    },
                    borderWidth: 1,
                    outerRadius: '107%'
                }, {
                    // default background
                }, {
                    backgroundColor: '#DDD',
                    borderWidth: 0,
                    outerRadius: '105%',
                    innerRadius: '103%'
                }]
            },
            // the value axis
            yAxis: {
                min: 0,
                max: chartEndRangeValue,
                minorTickInterval: 'auto',
                minorTickWidth: 1,
                minorTickLength: 10,
                minorTickPosition: 'inside',
                minorTickColor: '#666',
                tickPixelInterval: 30,
                tickWidth: 2,
                tickPosition: 'inside',
                tickLength: 10,
                tickColor: '#666',
                labels: {
                    step: 2,
                    rotation: 'auto',
                    style: {
                        color: '#000'
                    }
                },
                title: {
                    text: ''
                },
                plotBands: [{
                    from: 0,
                    to: fourtyPercentOfQuota,
                    color: '#DF5353', // red
                    thickness: 30
                }, {
                    from: fourtyPercentOfQuota,
                    to: eightyPercentOfQuota,
                    color: '#DDDF0D', // yellow
                    thickness: 30
                }, {
                    from: eightyPercentOfQuota,
                    to: chartEndRangeValue,
                    color: '#55BF3B', // green
                    thickness: 30
                }]
            },
            plotOptions: {
                series: {
                    dataLabels: {
                        verticalAlign: 'bottom'
                    }
                }
            },
            series: [{
                name: 'Total Sales ',
                data: [Math.round(empData.totalSales,2)],
                dial: {
                    radius: '80%',
                    backgroundColor: 'gray',
                    baseWidth: 12,
                    baseLength: '0%',
                    rearLength: '0%'
                },
                dataLabels: {
                    useHTML: true,
                    enabled: true,
                    verticalAlign: 'bottom',
                    // x: 0,
                    // y: 90,
                    overflow: "allow",
                    borderWidth: 0,
                    className: 'rev-counter',
                    formatter: function() {
                        return formatPrice(empData.totalSales)
                    },
                }
            }]
        };

        if ($(`#${divId}`).length) {
            highCharts.chart(divId, options);
            $(`#${divId}`).css('display', 'block');
            $('.sortable-chart-widget-js').removeClass(`spd-gauge-chart${index+1}`);
            // if($(`#${divId}-emp`).length) {
            //     $(`#${divId}-emp`).css('display', 'block');
            //     $(`#${divId}-emp`).html(empData.name);
            // }
            // if($(`#${divId}-amount`).length) {
            //     $(`#${divId}-amount`).css('display', 'block');
            //     $(`#${divId}-amount`).html(formatPrice(empData.totalSales));
            // }
        }
    }

    templateObject.renderSPDCharts = function () {
        const filteredEmployees = _.sortBy(_.filter(templateObject.employeesByTotalSales.get(), emp => !!emp.salesQuota), ['totalSales']);
        const employeesByTotalSales = _.sortBy(filteredEmployees, ['sale']).reverse().slice(0, 6); // get top 6 employees
        const empByTotalSalesLength = employeesByTotalSales.length;
        if(empByTotalSalesLength < 6){
            for(var i=1; i<=(6-empByTotalSalesLength); i++){
                employeesByTotalSales.push({
                    name: "Unknown",
                    salesQuota: 5000,
                    totalDiscount:0,
                    totalSales:0
                });
            }
        }
        _.each(employeesByTotalSales, (empData, index) => {
            if (empData && empData.name) {
                $('#gauge-card-'+(index + 1)).show();
                setGaugeChart({ divId: `spd-gauge-area${index + 1}`, empData, index });
            }
        });
    };

    templateObject.getDashboardData = async function (fromDate,toDate,ignoreDate) {
        const employeeObject = await getVS1Data('TEmployee');
        let employeeNames = [];
        let employeeSalesQuota = [];
        if (employeeObject.length) {
            let { temployee = [] } = JSON.parse(employeeObject[0].data);
            let employees = [];
            temployee.forEach(employee => {
                employees.push(employee.fields);
                if(!(isNaN(parseInt(employee.fields.CustFld12)) || parseInt(employee.fields.CustFld12) == 0)) {
                    // employeeNames.push(employee.fields.EmployeeName);
                    employeeNames.push(employee.fields.FirstName + " " + employee.fields.LastName);
                    employeeSalesQuota.push(parseInt(employee.fields.CustFld12));
                }
            });
            templateObject.employees.set(employees);
        }

        let startUnix = moment().subtract(2, 'months').unix();
        let endUnix = moment().unix();
        if (fromDate != "") {
            let startDate = new Date(fromDate);
            startUnix = moment(startDate).unix();
        }
        if (toDate != "") {
            let endDate = new Date(toDate);
            endUnix = moment(endDate).unix();
        }

        getVS1Data('TInvoiceList').then(function (dataObject) {
            if (dataObject.length) {
                let { tinvoicelist } = JSON.parse(dataObject[0].data);
                const tinvoicelistGroupBy = _.groupBy(tinvoicelist, 'EmployeeName');
                let employeesByTotalSales = [];
                _.each(templateObject.employees.get(), employee => {
                    let empName = employee.FirstName + " " + employee.LastName;
                    let employeeData = { name: empName, totalSales: 0, salesQuota: 0, totalDiscount: 0 };
                    if (employee.CustFld12 && Number(employee.CustFld12) != 'NaN' && Number(employee.CustFld12) > 0) {
                        employeeData.salesQuota = Number(employee.CustFld12);
                    }
                    if (tinvoicelistGroupBy[empName]) {
                        _.each(tinvoicelistGroupBy[empName], invoiceData => {
                            if (ignoreDate) {
                                employeeData.totalSales += invoiceData.TotalAmountInc;
                                employeeData.totalDiscount += invoiceData.TotalDiscount;
                            } else {
                                if (moment(invoiceData.SaleDate).unix() > startUnix && moment(invoiceData.SaleDate).unix() < endUnix) {
                                    employeeData.totalSales += invoiceData.TotalAmountInc;
                                    employeeData.totalDiscount += invoiceData.TotalDiscount;
                                }
                            }
                        });
                    }
                    employeesByTotalSales.push(employeeData);
                });
                templateObject.employeesByTotalSales.set(employeesByTotalSales);
                renderSPMEmployeeChart();
                templateObject.renderSPDCharts();
            }
        }).catch(function (err) {
        });
    };

    templateObject.setDateVal = function () {
        const dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        const dateTo = new Date($("#dateTo").datepicker("getDate"));
        formatDateFrom = dateFrom.getFullYear() +"-" +(dateFrom.getMonth() + 1) +"-" +dateFrom.getDate();
        formatDateTo = dateTo.getFullYear() +"-" +(dateTo.getMonth() + 1) +"-" +dateTo.getDate();
        templateObject.getDashboardData(formatDateFrom, formatDateTo, false);
    }

    setTimeout(function(){
        templateObject.setDateVal();
    },500);
});

Template.dashboardManagerCharts.events({
    "click #spd-employee-chart": () => {
        // FlowRouter.go('/employeelist');
        window.open("/employeelist", '_self');
    },
    "click #spd-gauge-area1": () => {
        let fromDate = new Date(formatDateFrom);
        fromDate = moment(fromDate).format('YYYY-MM-DD');
        let toDate = new Date(formatDateTo);
        toDate = moment().format('YYYY-MM-DD');
        // FlowRouter.go(`/invoicelist?fromDate=${fromDate}&toDate=${toDate}`);
        window.open("/invoicelist?fromDate="+fromDate+"&toDate="+toDate, '_self');
    },
    "click #spd-gauge-area2": () => {
        let fromDate = new Date(formatDateFrom);
        fromDate = moment(fromDate).format('YYYY-MM-DD');
        let toDate = new Date(formatDateTo);
        toDate = moment().format('YYYY-MM-DD');
        // FlowRouter.go(`/invoicelist?fromDate=${fromDate}&toDate=${toDate}`);
        window.open("/invoicelist?fromDate="+fromDate+"&toDate="+toDate, '_self');
    },
    "click #spd-gauge-area3": () => {
        let fromDate = new Date(formatDateFrom);
        fromDate = moment(fromDate).format('YYYY-MM-DD');
        let toDate = new Date(formatDateTo);
        toDate = moment().format('YYYY-MM-DD');
        // FlowRouter.go(`/invoicelist?fromDate=${fromDate}&toDate=${toDate}`);
        window.open("/invoicelist?fromDate="+fromDate+"&toDate="+toDate, '_self');
    },
    "click #spd-gauge-area4": () => {
        let fromDate = new Date(formatDateFrom);
        fromDate = moment(fromDate).format('YYYY-MM-DD');
        let toDate = new Date(formatDateTo);
        toDate = moment().format('YYYY-MM-DD');
        // FlowRouter.go(`/invoicelist?fromDate=${fromDate}&toDate=${toDate}`);
        window.open("/invoicelist?fromDate="+fromDate+"&toDate="+toDate, '_self');
    },
    "click #spd-gauge-area5": () => {
        let fromDate = new Date(formatDateFrom);
        fromDate = moment(fromDate).format('YYYY-MM-DD');
        let toDate = new Date(formatDateTo);
        toDate = moment().format('YYYY-MM-DD');
        // FlowRouter.go(`/invoicelist?fromDate=${fromDate}&toDate=${toDate}`);
        window.open("/invoicelist?fromDate="+fromDate+"&toDate="+toDate, '_self');
    },
    "click #spd-gauge-area6": () => {
        let fromDate = new Date(formatDateFrom);
        fromDate = moment(fromDate).format('YYYY-MM-DD');
        let toDate = new Date(formatDateTo);
        toDate = moment().format('YYYY-MM-DD');
        // FlowRouter.go(`/invoicelist?fromDate=${fromDate}&toDate=${toDate}`);
        window.open("/invoicelist?fromDate="+fromDate+"&toDate="+toDate, '_self');
    }
});
