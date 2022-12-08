import { ReactiveVar } from "meteor/reactive-var";
import '../../lib/global/indexdbstorage.js';
const highCharts = require('highcharts');
require('highcharts/modules/exporting')(highCharts);
require('highcharts/highcharts-more')(highCharts);
let _ = require("lodash");
let formatDateFrom;
let formatDateTo;

Template.dashboardSalesCharts.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.employees = new ReactiveVar([]);
    templateObject.employeesByTotalSales = new ReactiveVar([]);
    templateObject.fromDate = new ReactiveVar([]);
    templateObject.toDate = new ReactiveVar([]);
});

Template.dashboardSalesCharts.onRendered(function() {
    const templateObject = Template.instance();

    async function renderCharts(formatDateFrom, formatDateTo, ignoreDate) {
        const fromDate = new Date($("#dateFrom").datepicker("getDate"));
        const toDate = new Date($("#dateTo").datepicker("getDate"));

        const dataInvoiceObject = await getVS1Data('TInvoiceList');
        let totalInvoiceValue2ndLastQuater = 0;
        let totalInvoiceValueLastQuater = 0;
        if (dataInvoiceObject.length) {
            let { tinvoicelist } = JSON.parse(dataInvoiceObject[0].data);
            // const start2ndLastQuater = moment().subtract(6, 'months').unix();
            // const endSecondLastQuater = moment().subtract(3, 'months').unix();
            // const startLastQuater = moment().subtract(3, 'months').unix();
            // const endLastQuater = moment().unix();
            tinvoicelist.forEach(tinvoice => {
                // if (moment(tinvoice.SaleDate).unix() > start2ndLastQuater && moment(tinvoice.SaleDate).unix() < endSecondLastQuater) {
                //     totalInvoiceValue2ndLastQuater += tinvoice.Balance;
                // }
                if (fromDate <= new Date(tinvoice.SaleDate) && toDate >= new Date(tinvoice.SaleDate)) {
                    // if (moment(tinvoice.SaleDate).unix() > startLastQuater && moment(tinvoice.SaleDate).unix() < endLastQuater) {
                    totalInvoiceValueLastQuater += tinvoice.Balance;
                }
            });
        }
        const dataQuoteObject = await getVS1Data('TQuoteList');
        let totalQuotesValue2ndLastQuater = 0;
        let totalQuotesValueLastQuater = 0;
        if (dataQuoteObject.length) {
            let { tquotelist = [] } = JSON.parse(dataQuoteObject[0].data);
            // const start2ndLastQuater = moment().subtract(6, 'months').unix();
            // const endSecondLastQuater = moment().subtract(3, 'months').unix();
            // const startLastQuater = moment().subtract(3, 'months').unix();
            // const endLastQuater = moment().unix();
            tquotelist.forEach(tquote => {
                // if (moment(tquote.SaleDate).unix() > start2ndLastQuater && moment(tquote.SaleDate).unix() < endSecondLastQuater) {
                //     totalQuotesValue2ndLastQuater += tquote.Balance;
                // }
                if (fromDate <= new Date(tquote.SaleDate) && toDate >= new Date(tquote.SaleDate)) {
                    // if (moment(tquote.SaleDate).unix() > startLastQuater && moment(tquote.SaleDate).unix() < endLastQuater) {
                    totalQuotesValueLastQuater += tquote.Balance;
                }
            });
        }
        const dataSaleObject = await getVS1Data('TSalesList');
        let totalSalesValue2ndLastQuater = 0;
        let totalSalesValueLastQuater = 0;
        if (dataSaleObject.length) {
            let { tsaleslist = [] } = JSON.parse(dataSaleObject[0].data);
            // const start2ndLastQuater = moment().subtract(6, 'months').unix();
            // const endSecondLastQuater = moment().subtract(3, 'months').unix();
            // const startLastQuater = moment().subtract(3, 'months').unix();
            // const endLastQuater = moment().unix();
            tsaleslist.forEach(tsale => {
                // if (moment(tsale.SaleDate).unix() > start2ndLastQuater && moment(tsale.SaleDate).unix() < endSecondLastQuater) {
                //     totalSalesValue2ndLastQuater += tsale.Balance;
                // }
                if (fromDate <= new Date(tsale.SaleDate) && toDate >= new Date(tsale.SaleDate)) {
                    // if (moment(tsale.SaleDate).unix() > startLastQuater && moment(tsale.SaleDate).unix() < endLastQuater) {
                    totalSalesValueLastQuater += tsale.Balance;
                }
            });
        }
        const categories = [moment(fromDate).format('MMMM YYYY'), moment(toDate).format('MMMM YYYY')];
        const quotaAmount = [0, totalQuotesValueLastQuater];
        const invoiceAmount = [0, totalInvoiceValueLastQuater];
        const closedAmount = [0, totalSalesValueLastQuater];
        renderComparisonChart({ categories, quotaAmount, invoiceAmount, closedAmount });

        // leads comparison charts logic
        const dataProspectObject = await getVS1Data('TProspectEx');
        let leadsCount6Months = 0;
        let leadsSources = {};
        if (dataProspectObject.length) {
            let { tprospect = [] } = JSON.parse(dataProspectObject[0].data);
            // const momentUnix = moment().subtract(6, 'months').unix();
            tprospect.forEach(tprospect => {
                if (fromDate <= new Date(tprospect.fields.CreationDate) && toDate >= new Date(tprospect.fields.CreationDate) && tprospect.fields.Status == 'Quoted') {
                    // if (moment(tprospect.fields.CreationDate).unix() > momentUnix && tprospect.fields.Status == 'Quoted') {
                    leadsSources[tprospect.fields.SourceName || 'Unknown'] = isNaN(parseInt(leadsSources[tprospect.fields.SourceName || 'Unknown'])) ? 1 : parseInt(leadsSources[tprospect.fields.SourceName || 'Unknown']) + 1;
                    leadsCount6Months += 1;
                }
            });
        }
        let leadsSourcesCount = _.map(_.keys(leadsSources), key => {
            return { totalCount: leadsSources[key], sourceName: key };
        });
        leadsSourcesCount = _.sortBy(leadsSourcesCount, ['totalCount']).reverse().slice(0, 3);
        let sources = ['Total Leads'];
        let sourcesValues = [leadsCount6Months];
        _.each(leadsSourcesCount, (sourceCount) => {
            sources.push(sourceCount.sourceName);
            sourcesValues.push(sourceCount.totalCount)
        });
        renderOpportunitiesChart({ sources, sourcesValues });
    }

    function renderComparisonChart({ categories, quotaAmount, invoiceAmount, closedAmount }) {
        const series = [{
            name: 'Quota Amount',
            data: quotaAmount
        }, {
            name: 'Expected Amount',
            data: invoiceAmount
        }, {
            name: 'Closed/Won',
            data: closedAmount
        }];

        highCharts.chart('sd-comparison-chart', {
            title: {
                text: 'Sales Performance VS Quota',
                style: {
                    display: 'none'
                }
            },
            yAxis: {
                title: {
                    text: ''
                }
            },
            exporting: {
                enabled: false
            },
            xAxis: {
                categories
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle'
            },
            plotOptions: {
                series: {
                    label: {
                        connectorAllowed: false
                    }
                }
            },
            series,
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 500
                    },
                    chartOptions: {
                        legend: {
                            layout: 'horizontal',
                            align: 'center',
                            verticalAlign: 'bottom'
                        }
                    }
                }]
            }
        });
    }

    function renderOpportunitiesChart({ sources, sourcesValues }) {
        highCharts.chart('opens-opportunities-chart', {
            series: [{
                name: 'Leads Count',
                data: sourcesValues
            }],
            chart: {
                type: 'column'
            },
            title: {
                text: 'Open Opportunities by Stage',
                style: {
                    display: 'none'
                }
            },
            exporting: {
                enabled: false
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                categories: sources
            },
            yAxis: {
                allowDecimals: false,
                title: {
                    text: ''
                }
            },
            tooltip: {
                formatter: function() {
                    return '<b>' + this.series.name + '</b><br/>' +
                        this.point.y;
                }
            }
        });
    }
    templateObject.setDateVal = function() {
        const dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        const dateTo = new Date($("#dateTo").datepicker("getDate"));
        templateObject.fromDate.set(dateFrom);
        templateObject.toDate.set(dateTo);
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

        renderCharts(formatDateFrom, formatDateTo, false);
    }

    setTimeout(function() {
        templateObject.setDateVal();
    }, 500);
});

Template.dashboardSalesCharts.events({
    "click #sd-comparison-chart": () => {
        let fromDate = new Date(formatDateFrom);
        fromDate = moment(fromDate).format('DD-MM-YYYY');
        let toDate = new Date(formatDateTo);
        toDate = moment().format('DD-MM-YYYY');
        // FlowRouter.go(`/invoicelist?fromDate=${fromDate}&toDate=${toDate}`);
        window.open("/invoicelist?fromDate=" + fromDate + "&toDate=" + toDate, '_self');
    },
    "click #opens-opportunities-chart": () => {
        // FlowRouter.go('/leadlist');
        window.open("/leadlist", '_self');
    },
});

Template.dashboardSalesCharts.helpers({
    salesPerformanceTooltip: function() {
        let templateObject = Template.instance();
        const fromDate = templateObject.fromDate.get();
        const toDate = templateObject.toDate.get();
        let monthCount = (
            toDate.getMonth() -
            fromDate.getMonth() +
            12 * (toDate.getFullYear() - fromDate.getFullYear())
        );
        return "This is the chart of Quota amount for last " + monthCount + " months. This is the chart of Quotes per month for last " + monthCount + " months. This is the chart of Invoices per month for last " + monthCount + " months";
    },
    openOpportunitiesTooltip: function() {
        let templateObject = Template.instance();
        const fromDate = templateObject.fromDate.get();
        const toDate = templateObject.toDate.get();
        let monthCount = (
            toDate.getMonth() -
            fromDate.getMonth() +
            12 * (toDate.getFullYear() - fromDate.getFullYear())
        );
        return "This is the chart of Lead/Customer count for last " + monthCount + " months where a quote has been made. This is the chart of top 3 source counts for last " + monthCount + " months where a quote has been made.";
    },
});