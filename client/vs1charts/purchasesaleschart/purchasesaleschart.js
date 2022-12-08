import {VS1ChartService} from "../vs1charts-service";
import 'jQuery.print/jQuery.print.js';
import {UtilityService} from "../../utility-service";
import "../../lib/global/indexdbstorage.js";
import {ReportService} from "../../reports/report-service";

let _ = require('lodash');
let reportService = new ReportService();
let vs1chartService = new VS1ChartService();
let utilityService = new UtilityService();
const _tabGroup = 1;

Template.purchasesaleschart.onCreated(()=>{
    const templateObject = Template.instance();
    templateObject.records = new ReactiveVar([]);
    templateObject.dateAsAt = new ReactiveVar();
    templateObject.deptrecords = new ReactiveVar();

    templateObject.salesperc = new ReactiveVar();
    templateObject.expenseperc = new ReactiveVar();
    templateObject.salespercTotal = new ReactiveVar();
    templateObject.expensepercTotal = new ReactiveVar();
});

Template.purchasesaleschart.onRendered(()=>{

    const templateObject = Template.instance();
    let utilityService = new UtilityService();
    let salesOrderTable;
    var splashArray = new Array();
    var today = moment().format('DD/MM/YYYY');
    let dateTo = moment().format("YYYY-MM-DD");
    let dateFrom = moment().subtract(3, "months").format("YYYY-MM-DD");
    let contactID = "";
    let ignoreDate = true;

    templateObject.getAgedReceivableReportCard = async function () {
        let data = [];
        if( !localStorage.getItem('VS1AgedReceivableSummary_Card') ){
            data = await reportService.getAgedReceivableDetailsSummaryData(dateFrom, dateTo, ignoreDate,contactID);
            localStorage.setItem('VS1AgedReceivableSummary_Card', JSON.stringify(data) || '');
        }else{
            data = JSON.parse(localStorage.getItem('VS1AgedReceivableSummary_Card'));
        }
        let amountdueTotal = 0;
        let currentTotal = 0;
        let itemsAwaitingPaymentcount = [];
        if( data.tarreport.length > 0 ){
            for (const item of data.tarreport) {
                itemsAwaitingPaymentcount.push({
                    id: item.ClientID || '',
                });
                amountdueTotal += item.AmountDue
                currentTotal += item.Current
            }
        }

        let totalRecievableSummaryAmount = amountdueTotal + currentTotal;
        $('.oustandingInvQty').text(data.Params.Count);
        if (!isNaN(totalRecievableSummaryAmount)) {
            $('.oustandaingInvAmt').text(utilityService.modifynegativeCurrencyFormat(totalRecievableSummaryAmount));
        }else{
            $('.oustandaingInvAmt').text(Currency+'0.00');
        }
    }

    templateObject.getAgedReceivableReportCard();


    templateObject.getAgedPayablesReportCard = async function () {
        let data = [];
        if( !localStorage.getItem('VS1AgedPayablesSummary_Card') ){
            data = await reportService.getAgedPayableDetailsSummaryData(dateFrom, dateTo, true,contactID);
            localStorage.setItem('VS1AgedPayablesSummary_Card', JSON.stringify(data) || '');
        }else{
            data = JSON.parse(localStorage.getItem('VS1AgedPayablesSummary_Report'));
        }
        let amountdueTotal = 0;
        let currentTotal = 0;
        let itemsPayablescount = [];
        if( data.tapreport.length > 0 ){
            for (const item of data.tapreport) {
                itemsPayablescount.push({
                    id: item.ClientID || '',
                });
                amountdueTotal += item.AmountDue
                currentTotal += item.Current
            }
        }
        // let totalPayablesSummaryAmount = amountdueTotal + currentTotal;
        let totalPayablesSummaryAmount = amountdueTotal;
        $('.suppAwaitingAP').text(data.Params.Count);
        if (!isNaN(totalPayablesSummaryAmount)) {
            $('.suppAwaitingAPAmtdash').text(utilityService.modifynegativeCurrencyFormat(amountdueTotal));
        }else{
            $('.suppAwaitingAPAmtdash').text(Currency+'0.00');
        }
    }

    templateObject.getAgedPayablesReportCard();



});

Template.purchasesaleschart.helpers({
    dateAsAt: () =>{
        return Template.instance().dateAsAt.get() || '-';
    },
    companyname: () =>{
        return loggedCompany;
    },
    salesperc: () =>{
        return Template.instance().salesperc.get() || 0;
    },
    expenseperc: () =>{
        return Template.instance().expenseperc.get() || 0;
    },
    salespercTotal: () =>{
        return Template.instance().salespercTotal.get() || 0;
    },
    expensepercTotal: () =>{
        return Template.instance().expensepercTotal.get() || 0;
    }
});

Template.purchasesaleschart.events({
    'click .overdueInvoiceAmt':function(event){
        FlowRouter.go('/agedreceivablessummary');
    },
    'click .overdueInvoiceQty':function(event){
        FlowRouter.go('/agedreceivables');
    },
    'click .outstaningPayablesAmt':function(event){
        FlowRouter.go('/agedpayablessummary');
    },
    'click .outstaningPayablesQty':function(event){
        FlowRouter.go('/agedpayables');
    },
});

Template.registerHelper('equals', function (a, b) {
    return a === b;
});

Template.registerHelper('notEquals', function (a, b) {
    return a != b;
});

Template.registerHelper('containsequals', function (a, b) {
    return (a.indexOf(b) >= 0 );
});
