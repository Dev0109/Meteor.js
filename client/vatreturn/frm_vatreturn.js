import { PurchaseBoardService } from '../js/purchase-service';
import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../js/core-service';
import { DashBoardService } from "../Dashboard/dashboard-service";
import { UtilityService } from "../utility-service";
import { ProductService } from "../product/product-service";
import { AccountService } from "../accounts/account-service";
import { ReportService } from "../reports/report-service";
import { OrganisationService } from '../js/organisation-service';
import '../lib/global/erp-objects';
import 'jquery-ui-dist/external/jquery/jquery';
import 'jquery-ui-dist/jquery-ui';
import { Random } from 'meteor/random';
import { jsPDF } from 'jspdf';
import 'jQuery.print/jQuery.print.js';
import { autoTable } from 'jspdf-autotable';
import 'jquery-editable-select';
import { SideBarService } from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
let sideBarService = new SideBarService();
let utilityService = new UtilityService();
let reportService = new ReportService();
let organisationService = new OrganisationService();
var times = 0;

const months = [];
months["January"] = "01";
months["February"] = "02";
months["March"] = "03";
months["April"] = "04";
months["May"] = "05";
months["June"] = "06";
months["July"] = "07";
months["August"] = "08";
months["September"] = "09";
months["October"] = "10";
months["November"] = "11";
months["December"] = "12";

Template.vatreturn.onCreated(() => {
    const templateObject = Template.instance();
    templateObject.records = new ReactiveVar();
    templateObject.CleintName = new ReactiveVar();
    templateObject.Department = new ReactiveVar();
    templateObject.Date = new ReactiveVar();
    templateObject.DueDate = new ReactiveVar();
    templateObject.BillNo = new ReactiveVar();
    templateObject.RefNo = new ReactiveVar();
    templateObject.Branding = new ReactiveVar();
    templateObject.Currency = new ReactiveVar();
    templateObject.Total = new ReactiveVar();
    templateObject.Subtotal = new ReactiveVar();
    templateObject.TotalTax = new ReactiveVar();
    templateObject.record = new ReactiveVar({});
    templateObject.taxrateobj = new ReactiveVar();
    templateObject.Accounts = new ReactiveVar([]);
    templateObject.BillId = new ReactiveVar();
    templateObject.selectedCurrency = new ReactiveVar([]);
    templateObject.inputSelectedCurrency = new ReactiveVar([]);
    templateObject.currencySymbol = new ReactiveVar([]);
    templateObject.deptrecords = new ReactiveVar();
    templateObject.termrecords = new ReactiveVar();
    templateObject.clientrecords = new ReactiveVar([]);
    templateObject.taxraterecords = new ReactiveVar([]);


    templateObject.uploadedFile = new ReactiveVar();
    templateObject.uploadedFiles = new ReactiveVar([]);
    templateObject.attachmentCount = new ReactiveVar();

    templateObject.address = new ReactiveVar();
    templateObject.abn = new ReactiveVar();
    templateObject.referenceNumber = new ReactiveVar();

    templateObject.statusrecords = new ReactiveVar([]);

    templateObject.totalCredit = new ReactiveVar();
    templateObject.totalCredit.set(Currency + '0.00');
    templateObject.totalDebit = new ReactiveVar();
    templateObject.totalDebit.set(Currency + '0.00');

    templateObject.totalCreditInc = new ReactiveVar();
    templateObject.totalCreditInc.set(Currency + '0.00');
    templateObject.totalDebitInc = new ReactiveVar();
    templateObject.totalDebitInc.set(Currency + '0.00');
    templateObject.currencyList = new ReactiveVar([]);

    templateObject.taxRateList = new ReactiveVar([]);
    templateObject.accountsSummaryListT2 = new ReactiveVar([]);
    templateObject.accountsSummaryListT2_2 = new ReactiveVar([]);
    templateObject.accountsSummaryListT3 = new ReactiveVar([]);
    templateObject.taxSummaryListT1 = new ReactiveVar([]);
    templateObject.taxSummaryListT2 = new ReactiveVar([]);
    templateObject.taxSummaryListT3 = new ReactiveVar([]);
    templateObject.accountsList = new ReactiveVar([]);
    templateObject.availableCategories = new ReactiveVar([]);
    templateObject.pageTitle = new ReactiveVar();
    templateObject.getId = new ReactiveVar();
    templateObject.reasonT4 = new ReactiveVar([]);
    templateObject.reasonF4 = new ReactiveVar([]);
    templateObject.basreturnData = new ReactiveVar([]);
});

Template.vatreturn.onRendered(function() {
    let templateObject = Template.instance();
    let utilityService = new UtilityService();
    let productService = new ProductService();
    let accountService = new AccountService();
    let purchaseService = new PurchaseBoardService();
    let taxRateList = [];
    let categories = [];
    let categoryAccountList = [];
    let usedCategories = [];
    const accountTypeList = [];
    const dataTableList = [];
    let deptrecords = [];

    let reasonT4 = [
        { val: "T4-1", title: "Mergers, acquisitions and takeovers" },
        { val: "T4-2", title: "Cessation of business activity" },
        { val: "T4-3", title: "Expected utilisation of losses of a revenue or capital nature" },
        { val: "T4-4", title: "Significant (abnormal) transactions affecting income or expenses" },
        { val: "T4-5", title: "Change in trading conditions affecting income or expenses" },
        { val: "T4-6", title: "Domestic or foreign financial market changes" },
        { val: "T4-7", title: "Change in investment strategies or policies" },
        { val: "T4-8", title: "Change in product mix" },
        { val: "T4-9", title: "Business expansion or contraction" },
        { val: "T4-10", title: "Change in entity structure" },
        { val: "T4-11", title: "Internal or external restructuring of business activity" },
        { val: "T4-12", title: "Change in any legislation" },
        { val: "T4-13", title: "Change in profit margin" },
    ];

    let reasonF4 = [
        { val: "F4-1", title: "Benefits ceased/reduced and salary increased" },
        { val: "F4-2", title: "Benefits ceased/reduced and no compensation to employees" },
        { val: "F4-3", title: "Fewer employees" },
        { val: "F4-4", title: "Increase in employee contribution" },
        { val: "F4-5", title: "Section 65J rebate now claimed" },
        { val: "F4-6", title: "Liquidation, receiver/manager appointed" },
        { val: "F4-7", title: "None of the above" },
    ];

    templateObject.reasonT4.set(reasonT4);
    templateObject.reasonF4.set(reasonF4);

    // accountService
    //     .getVATReturnDetail()
    //     .then(function(data) {
    //     })
    //     .catch(function(err) {
    //         // Bert.alert('<strong>' + err + '</strong>!', 'danger');
    //         $(".fullScreenSpin").css("display", "none");
    //         // Meteor._reload.reload();
    //     });

    templateObject.getTaxrateList = function() {
        $('.fullScreenSpin').css('display', 'inline-block');
        getVS1Data("TTaxcodeVS1").then(function(dataObject) {
                if (dataObject.length === 0) {
                    productService.getTaxCodesVS1().then(function(data) {
                        for (let i = 0; i < data.ttaxcodevs1.length; i++) {
                            if (data.ttaxcodevs1[i].RegionName == "South Africa") {
                                let taxRate = (data.ttaxcodevs1[i].Rate * 100).toFixed(2);
                                var dataList = {
                                    Id: data.ttaxcodevs1[i].Id || '',
                                    CodeName: data.ttaxcodevs1[i].CodeName || '',
                                    Description: data.ttaxcodevs1[i].Description || '-',
                                    TaxRate: taxRate || 0,
                                };
                                taxRateList.push(dataList);
                            }
                        }
                        templateObject.taxRateList.set(taxRateList);
                        $('.fullScreenSpin').css('display', 'none');
                    }).catch(function(err) {
                        $('.fullScreenSpin').css('display', 'none');
                    });
                } else {
                    let data = JSON.parse(dataObject[0].data);
                    let useData = data.ttaxcodevs1;
                    for (let i = 0; i < useData.length; i++) {
                        if (useData[i].RegionName == "South Africa") {
                            let taxRate = (useData[i].Rate * 100).toFixed(2);
                            var dataList = {
                                Id: useData[i].Id || '',
                                CodeName: useData[i].CodeName || '',
                                Description: useData[i].Description || '-',
                                TaxRate: taxRate || 0,
                            };

                            taxRateList.push(dataList);
                        }
                    }
                    templateObject.taxRateList.set(taxRateList);
                    $('.fullScreenSpin').css('display', 'none');
                }
            })
            .catch(function(err) {
                productService.getTaxCodesVS1().then(function(data) {
                    for (let i = 0; i < data.ttaxcodevs1.length; i++) {
                        if (data.ttaxcodevs1[i].RegionName == "South Africa") {
                            let taxRate = (data.ttaxcodevs1[i].Rate * 100).toFixed(2);
                            var dataList = {
                                Id: data.ttaxcodevs1[i].Id || '',
                                CodeName: data.ttaxcodevs1[i].CodeName || '',
                                Description: data.ttaxcodevs1[i].Description || '-',
                                TaxRate: taxRate || 0,
                            };

                            taxRateList.push(dataList);
                        }
                    }
                    templateObject.taxRateList.set(taxRateList);
                });
            });
    }

    templateObject.getTaxrateList();

    templateObject.getDepartments = function() {
        getVS1Data("TDeptClass")
            .then(function(dataObject) {
                if (dataObject.length == 0) {
                    sideBarService.getDepartment().then(function(data) {
                        //let deptArr = [];
                        for (let i in data.tdeptclass) {
                            let deptrecordObj = {
                                id: data.tdeptclass[i].Id || " ",
                                department: data.tdeptclass[i].DeptClassName || " ",
                            };
                            //deptArr.push(data.tdeptclass[i].DeptClassName);
                            deptrecords.push(deptrecordObj);
                            templateObject.deptrecords.set(deptrecords);
                        }
                    });
                } else {
                    let data = JSON.parse(dataObject[0].data);
                    let useData = data.tdeptclass;
                    for (let i in useData) {
                        let deptrecordObj = {
                            id: useData[i].Id || " ",
                            department: useData[i].DeptClassName || " ",
                        };
                        //deptArr.push(data.tdeptclass[i].DeptClassName);
                        deptrecords.push(deptrecordObj);
                        templateObject.deptrecords.set(deptrecords);
                    }
                }
            })
            .catch(function(err) {
                productService.getDepartment().then(function(data) {
                    //let deptArr = [];
                    for (let i in data.tdeptclass) {
                        let deptrecordObj = {
                            id: data.tdeptclass[i].Id || " ",
                            department: data.tdeptclass[i].DeptClassName || " ",
                        };
                        //deptArr.push(data.tdeptclass[i].DeptClassName);
                        deptrecords.push(deptrecordObj);
                        templateObject.deptrecords.set(deptrecords);
                    }
                });
            });
    };

    templateObject.getDepartments();

    templateObject.getAllVatReturnData = function() {

        var url = FlowRouter.current().path;
        var getid = "";
        if (url.indexOf('?id=') > 0) {
            getid = url.split('?id=');
            if (getid[1]) {
                getid = getid[1];
            } else {
                getid = "";
            }
        }

        getVS1Data('TVATReturn').then(function(dataObject) {
            let taxRateList = templateObject.taxRateList.get();
            if (dataObject.length == 0) {
                reportService.getAllVATReturn().then(function(data) {
                    for (let i = 0; i < data.tvatreturn.length; i++) {
                        if (getid == "") {
                            if (i == 0) {
                                if (data.tvatreturn[i].fields.AccMethod == "Accrual") {
                                    $("#accountingmethod1").prop('checked', true);
                                    $("#accountingmethod2").prop('checked', false);
                                } else {
                                    $("#accountingmethod1").prop('checked', false);
                                    $("#accountingmethod2").prop('checked', true);
                                }

                                if (data.tvatreturn[i].fields.Tab1_Type == "Quarterly") {
                                    $("#datemethod1").prop('checked', true);
                                    $("#datemethod2").prop('checked', false);
                                } else {
                                    $("#datemethod1").prop('checked', false);
                                    $("#datemethod2").prop('checked', true);
                                }

                                if (data.tvatreturn[i].fields.Tab2_Type == "Quarterly") {
                                    $("#datemethod1-t2").prop('checked', true);
                                    $("#datemethod2-t2").prop('checked', false);
                                } else {
                                    $("#datemethod1-t2").prop('checked', false);
                                    $("#datemethod2-t2").prop('checked', true);
                                }

                                if (data.tvatreturn[i].fields.Tab3_Type == "Quarterly") {
                                    $("#datemethod1-t3").prop('checked', true);
                                    $("#datemethod2-t3").prop('checked', false);
                                } else {
                                    $("#datemethod1-t3").prop('checked', false);
                                    $("#datemethod2-t3").prop('checked', true);
                                }

                                shareFunctionByName.initTable(data.tvatreturn[i].fields._1Selected, "tbltaxCodeCheckbox_1");
                                shareFunctionByName.initTable(data.tvatreturn[i].fields._1ASelected, "tbltaxCodeCheckbox_1A");
                                shareFunctionByName.initTable(data.tvatreturn[i].fields._2Selected, "tbltaxCodeCheckbox_2");
                                shareFunctionByName.initTable(data.tvatreturn[i].fields._2ASelected, "tbltaxCodeCheckbox_2A");
                                shareFunctionByName.initTable(data.tvatreturn[i].fields._3Selected, "tbltaxCodeCheckbox_3");
                                shareFunctionByName.initTable(data.tvatreturn[i].fields._5Selected, "tbltaxCodeCheckbox_5");
                                shareFunctionByName.initTable(data.tvatreturn[i].fields._7Selected, "tbltaxCodeCheckbox_7");
                                shareFunctionByName.initTable(data.tvatreturn[i].fields._10Selected, "tbltaxCodeCheckbox_10");
                                shareFunctionByName.initTable(data.tvatreturn[i].fields._12Selected, "tbltaxCodeCheckbox_12");
                                shareFunctionByName.initTable(data.tvatreturn[i].fields._14Selected, "tbltaxCodeCheckbox_14");
                                shareFunctionByName.initTable(data.tvatreturn[i].fields._14ASelected, "tbltaxCodeCheckbox_14A");
                                shareFunctionByName.initTable(data.tvatreturn[i].fields._15Selected, "tbltaxCodeCheckbox_15");
                                shareFunctionByName.initTable(data.tvatreturn[i].fields._15ASelected, "tbltaxCodeCheckbox_15A");
                                shareFunctionByName.initTable(data.tvatreturn[i].fields._16Selected, "tbltaxCodeCheckbox_16");
                                shareFunctionByName.initTable(data.tvatreturn[i].fields._17Selected, "tbltaxCodeCheckbox_17");
                                shareFunctionByName.initTable(data.tvatreturn[i].fields._18Selected, "tbltaxCodeCheckbox_18");
                                shareFunctionByName.initTable(data.tvatreturn[i].fields._21Selected, "tbltaxCodeCheckbox_21");
                                shareFunctionByName.initTable(data.tvatreturn[i].fields._22Selected, "tbltaxCodeCheckbox_22");
                                shareFunctionByName.initTable(data.tvatreturn[i].fields._26Selected, "tbltaxCodeCheckbox_26");
                                shareFunctionByName.initTable(data.tvatreturn[i].fields._27Selected, "tbltaxCodeCheckbox_27");
                                shareFunctionByName.initTable(data.tvatreturn[i].fields._30Selected, "tbltaxCodeCheckbox_30");
                                shareFunctionByName.initTable(data.tvatreturn[i].fields._31Selected, "tbltaxCodeCheckbox_31");
                                shareFunctionByName.initTable(data.tvatreturn[i].fields._34Selected, "tbltaxCodeCheckbox_34");
                                shareFunctionByName.initTable(data.tvatreturn[i].fields._35Selected, "tbltaxCodeCheckbox_35");
                            }
                            if ($("#previousStartDate").val() == "" && data.tvatreturn[i].fields.Tab1_Year > 0 && data.tvatreturn[i].fields.Tab1_Month != "") {
                                let previousStartDate = data.tvatreturn[i].fields.Tab1_Year + "-" + months[data.tvatreturn[i].fields.Tab1_Month] + "-01";
                                let previousEndDate = "";
                                var endMonth = (data.tvatreturn[i].fields.Tab1_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tvatreturn[i].fields.Tab1_Month]) / 3) * 3) : (months[data.tvatreturn[i].fields.Tab1_Month]);
                                previousEndDate = new Date(data.tvatreturn[i].fields.Tab1_Year, (parseInt(endMonth)), 0);
                                previousEndDate = moment(previousEndDate).format("YYYY-MM-DD");
                                $("#previousStartDate").val(previousStartDate);
                                $("#previousEndDate").val(previousEndDate);
                                var fromDate = new Date(data.tvatreturn[i].fields.Tab1_Year, parseInt(endMonth), 1);
                                fromDate = moment(fromDate).format("YYYY-MM-DD");
                                for (var key in months) {
                                    if (months[key] == fromDate.split("-")[1]) {
                                        $("#beginmonthlydate").val(key);
                                    }
                                }
                                $("#currentyear").val(fromDate.split("-")[0]);
                                if (data.tvatreturn[i].fields.Tab1_Type == "Quarterly") {
                                    endMonth = Math.ceil(parseInt(fromDate.split("-")[1]) / 3) * 3;
                                    var toDate = new Date(fromDate.split("-")[0], (parseInt(endMonth)), 0);
                                    toDate = moment(toDate).format("YYYY-MM-DD");
                                    $("#endDate").val(toDate);
                                } else {
                                    endMonth = parseInt(fromDate.split("-")[1]);
                                    var toDate = new Date(fromDate.split("-")[0], (parseInt(endMonth)), 0);
                                    toDate = moment(toDate).format("YYYY-MM-DD");
                                    $("#endDate").val(toDate);
                                }
                            }
                            if ($("#previousStartDate-t2").val() == "" && data.tvatreturn[i].fields.Tab2_Year > 0 && data.tvatreturn[i].fields.Tab2_Month != "") {
                                let previousStartDate = data.tvatreturn[i].fields.Tab2_Year + "-" + months[data.tvatreturn[i].fields.Tab2_Month] + "-01";
                                let previousEndDate = "";
                                var endMonth = (data.tvatreturn[i].fields.Tab2_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tvatreturn[i].fields.Tab2_Month]) / 3) * 3) : (months[data.tvatreturn[i].fields.Tab2_Month]);
                                previousEndDate = new Date(data.tvatreturn[i].fields.Tab2_Year, (parseInt(endMonth)), 0);
                                previousEndDate = moment(previousEndDate).format("YYYY-MM-DD");
                                $("#previousStartDate-t2").val(previousStartDate);
                                $("#previousEndDate-t2").val(previousEndDate);
                                var fromDate = new Date(data.tvatreturn[i].fields.Tab2_Year, parseInt(endMonth), 1);
                                fromDate = moment(fromDate).format("YYYY-MM-DD");
                                for (var key in months) {
                                    if (months[key] == fromDate.split("-")[1]) {
                                        $("#beginmonthlydate-t2").val(key);
                                    }
                                }
                                $("#currentyear-t2").val(fromDate.split("-")[0]);
                                if (data.tvatreturn[i].fields.Tab2_Type == "Quarterly") {
                                    endMonth = Math.ceil(parseInt(fromDate.split("-")[1]) / 3) * 3;
                                    var toDate = new Date(fromDate.split("-")[0], (parseInt(endMonth)), 0);
                                    toDate = moment(toDate).format("YYYY-MM-DD");
                                    $("#endDate-t2").val(toDate);
                                } else {
                                    endMonth = parseInt(fromDate.split("-")[1]);
                                    var toDate = new Date(fromDate.split("-")[0], (parseInt(endMonth)), 0);
                                    toDate = moment(toDate).format("YYYY-MM-DD");
                                    $("#endDate-t2").val(toDate);
                                }
                            }
                            if ($("#previousStartDate-t3").val() == "" && data.tvatreturn[i].fields.Tab3_Year > 0 && data.tvatreturn[i].fields.Tab3_Month != "") {
                                let previousStartDate = data.tvatreturn[i].fields.Tab4_Year + "-" + months[data.tvatreturn[i].fields.Tab4_Month] + "-01";
                                let previousEndDate = "";
                                var endMonth = (data.tvatreturn[i].fields.Tab3_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tvatreturn[i].fields.Tab3_Month]) / 3) * 3) : (months[data.tvatreturn[i].fields.Tab3_Month]);
                                previousEndDate = new Date(data.tvatreturn[i].fields.Tab4_Year, (parseInt(endMonth)), 0);
                                previousEndDate = moment(previousEndDate).format("YYYY-MM-DD");
                                $("#previousStartDate-t3").val(previousStartDate);
                                $("#previousEndDate-t3").val(previousEndDate);
                                var fromDate = new Date(data.tvatreturn[i].fields.Tab3_Year, parseInt(endMonth), 1);
                                fromDate = moment(fromDate).format("YYYY-MM-DD");
                                for (var key in months) {
                                    if (months[key] == fromDate.split("-")[1]) {
                                        $("#beginmonthlydate-t3").val(key);
                                    }
                                }
                                $("#currentyear-t3").val(fromDate.split("-")[0]);
                                if (data.tvatreturn[i].fields.Tab3_Type == "Quarterly") {
                                    endMonth = Math.ceil(parseInt(fromDate.split("-")[1]) / 3) * 3;
                                    var toDate = new Date(fromDate.split("-")[0], (parseInt(endMonth)), 0);
                                    toDate = moment(toDate).format("YYYY-MM-DD");
                                    $("#endDate-t3").val(toDate);
                                } else {
                                    endMonth = parseInt(fromDate.split("-")[1]);
                                    var toDate = new Date(fromDate.split("-")[0], (parseInt(endMonth)), 0);
                                    toDate = moment(toDate).format("YYYY-MM-DD");
                                    $("#endDate-t3").val(toDate);
                                }
                            }
                        } else {
                            if (getid > data.tvatreturn[i].fields.ID) {
                                if ($("#previousStartDate").val() == "" && data.tvatreturn[i].fields.Tab1_Year > 0 && data.tvatreturn[i].fields.Tab1_Month != "") {
                                    let previousStartDate = data.tvatreturn[i].fields.Tab1_Year + "-" + months[data.tvatreturn[i].fields.Tab1_Month] + "-01";
                                    let previousEndDate = "";
                                    var endMonth = (data.tvatreturn[i].fields.Tab1_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tvatreturn[i].fields.Tab1_Month]) / 3) * 3) : (months[data.tvatreturn[i].fields.Tab1_Month]);
                                    previousEndDate = new Date(data.tvatreturn[i].fields.Tab1_Year, (parseInt(endMonth)), 0);
                                    previousEndDate = moment(previousEndDate).format("YYYY-MM-DD");
                                    $("#previousStartDate").val(previousStartDate);
                                    $("#previousEndDate").val(previousEndDate);
                                }
                                if ($("#previousStartDate-t2").val() == "" && data.tvatreturn[i].fields.Tab2_Year > 0 && data.tvatreturn[i].fields.Tab2_Month != "") {
                                    let previousStartDate = data.tvatreturn[i].fields.Tab2_Year + "-" + months[data.tvatreturn[i].fields.Tab2_Month] + "-01";
                                    let previousEndDate = "";
                                    var endMonth = (data.tvatreturn[i].fields.Tab2_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tvatreturn[i].fields.Tab2_Month]) / 3) * 3) : (months[data.tvatreturn[i].fields.Tab2_Month]);
                                    previousEndDate = new Date(data.tvatreturn[i].fields.Tab2_Year, (parseInt(endMonth)), 0);
                                    previousEndDate = moment(previousEndDate).format("YYYY-MM-DD");
                                    $("#previousStartDate-t2").val(previousStartDate);
                                    $("#previousEndDate-t2").val(previousEndDate);
                                }
                                if ($("#previousStartDate-t3").val() == "" && data.tvatreturn[i].fields.Tab3_Year > 0 && data.tvatreturn[i].fields.Tab3_Month != "") {
                                    let previousStartDate = data.tvatreturn[i].fields.Tab3_Year + "-" + months[data.tvatreturn[i].fields.Tab3_Month] + "-01";
                                    let previousEndDate = "";
                                    var endMonth = (data.tvatreturn[i].fields.Tab3_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tvatreturn[i].fields.Tab3_Month]) / 3) * 3) : (months[data.tvatreturn[i].fields.Tab3_Month]);
                                    previousEndDate = new Date(data.tvatreturn[i].fields.Tab3_Year, (parseInt(endMonth)), 0);
                                    previousEndDate = moment(previousEndDate).format("YYYY-MM-DD");
                                    $("#previousStartDate-t3").val(previousStartDate);
                                    $("#previousEndDate-t3").val(previousEndDate);
                                }
                            }
                        }
                    }
                    $('.fullScreenSpin').css('display', 'none');
                }).catch(function(err) {
                    $('.fullScreenSpin').css('display', 'none');
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                for (let i = 0; i < data.tvatreturn.length; i++) {
                    if (getid == "") {
                        if (i == 0) {
                            if (data.tvatreturn[i].fields.AccMethod == "Accrual") {
                                $("#accountingmethod1").prop('checked', true);
                                $("#accountingmethod2").prop('checked', false);
                            } else {
                                $("#accountingmethod1").prop('checked', false);
                                $("#accountingmethod2").prop('checked', true);
                            }

                            if (data.tvatreturn[i].fields.Tab1_Type == "Quarterly") {
                                $("#datemethod1").prop('checked', true);
                                $("#datemethod2").prop('checked', false);
                            } else {
                                $("#datemethod1").prop('checked', false);
                                $("#datemethod2").prop('checked', true);
                            }

                            if (data.tvatreturn[i].fields.Tab2_Type == "Quarterly") {
                                $("#datemethod1-t2").prop('checked', true);
                                $("#datemethod2-t2").prop('checked', false);
                            } else {
                                $("#datemethod1-t2").prop('checked', false);
                                $("#datemethod2-t2").prop('checked', true);
                            }

                            if (data.tvatreturn[i].fields.Tab3_Type == "Quarterly") {
                                $("#datemethod1-t3").prop('checked', true);
                                $("#datemethod2-t3").prop('checked', false);
                            } else {
                                $("#datemethod1-t3").prop('checked', false);
                                $("#datemethod2-t3").prop('checked', true);
                            }

                            shareFunctionByName.initTable(data.tvatreturn[i].fields._1Selected, "tbltaxCodeCheckbox_1");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._1ASelected, "tbltaxCodeCheckbox_1A");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._2Selected, "tbltaxCodeCheckbox_2");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._2ASelected, "tbltaxCodeCheckbox_2A");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._3Selected, "tbltaxCodeCheckbox_3");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._5Selected, "tbltaxCodeCheckbox_5");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._7Selected, "tbltaxCodeCheckbox_7");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._10Selected, "tbltaxCodeCheckbox_10");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._12Selected, "tbltaxCodeCheckbox_12");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._14Selected, "tbltaxCodeCheckbox_14");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._14ASelected, "tbltaxCodeCheckbox_14A");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._15Selected, "tbltaxCodeCheckbox_15");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._15ASelected, "tbltaxCodeCheckbox_15A");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._16Selected, "tbltaxCodeCheckbox_16");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._17Selected, "tbltaxCodeCheckbox_17");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._18Selected, "tbltaxCodeCheckbox_18");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._21Selected, "tbltaxCodeCheckbox_21");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._22Selected, "tbltaxCodeCheckbox_22");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._26Selected, "tbltaxCodeCheckbox_26");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._27Selected, "tbltaxCodeCheckbox_27");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._30Selected, "tbltaxCodeCheckbox_30");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._31Selected, "tbltaxCodeCheckbox_31");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._34Selected, "tbltaxCodeCheckbox_34");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._35Selected, "tbltaxCodeCheckbox_35");
                        }
                        if ($("#previousStartDate").val() == "" && data.tvatreturn[i].fields.Tab1_Year > 0 && data.tvatreturn[i].fields.Tab1_Month != "") {
                            let previousStartDate = data.tvatreturn[i].fields.Tab1_Year + "-" + months[data.tvatreturn[i].fields.Tab1_Month] + "-01";
                            let previousEndDate = "";
                            var endMonth = (data.tvatreturn[i].fields.Tab1_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tvatreturn[i].fields.Tab1_Month]) / 3) * 3) : (months[data.tvatreturn[i].fields.Tab1_Month]);
                            previousEndDate = new Date(data.tvatreturn[i].fields.Tab1_Year, (parseInt(endMonth)), 0);
                            previousEndDate = moment(previousEndDate).format("YYYY-MM-DD");
                            $("#previousStartDate").val(previousStartDate);
                            $("#previousEndDate").val(previousEndDate);
                            var fromDate = new Date(data.tvatreturn[i].fields.Tab1_Year, parseInt(endMonth), 1);
                            fromDate = moment(fromDate).format("YYYY-MM-DD");
                            for (var key in months) {
                                if (months[key] == fromDate.split("-")[1]) {
                                    $("#beginmonthlydate").val(key);
                                }
                            }
                            $("#currentyear").val(fromDate.split("-")[0]);
                            if (data.tvatreturn[i].fields.Tab1_Type == "Quarterly") {
                                endMonth = Math.ceil(parseInt(fromDate.split("-")[1]) / 3) * 3;
                                var toDate = new Date(fromDate.split("-")[0], (parseInt(endMonth)), 0);
                                toDate = moment(toDate).format("YYYY-MM-DD");
                                $("#endDate").val(toDate);
                            } else {
                                endMonth = parseInt(fromDate.split("-")[1]);
                                var toDate = new Date(fromDate.split("-")[0], (parseInt(endMonth)), 0);
                                toDate = moment(toDate).format("YYYY-MM-DD");
                                $("#endDate").val(toDate);
                            }
                        }
                        if ($("#previousStartDate-t2").val() == "" && data.tvatreturn[i].fields.Tab2_Year > 0 && data.tvatreturn[i].fields.Tab2_Month != "") {
                            let previousStartDate = data.tvatreturn[i].fields.Tab2_Year + "-" + months[data.tvatreturn[i].fields.Tab2_Month] + "-01";
                            let previousEndDate = "";
                            var endMonth = (data.tvatreturn[i].fields.Tab2_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tvatreturn[i].fields.Tab2_Month]) / 3) * 3) : (months[data.tvatreturn[i].fields.Tab2_Month]);
                            previousEndDate = new Date(data.tvatreturn[i].fields.Tab2_Year, (parseInt(endMonth)), 0);
                            previousEndDate = moment(previousEndDate).format("YYYY-MM-DD");
                            $("#previousStartDate-t2").val(previousStartDate);
                            $("#previousEndDate-t2").val(previousEndDate);
                            var fromDate = new Date(data.tvatreturn[i].fields.Tab2_Year, parseInt(endMonth), 1);
                            fromDate = moment(fromDate).format("YYYY-MM-DD");
                            for (var key in months) {
                                if (months[key] == fromDate.split("-")[1]) {
                                    $("#beginmonthlydate-t2").val(key);
                                }
                            }
                            $("#currentyear-t2").val(fromDate.split("-")[0]);
                            if (data.tvatreturn[i].fields.Tab2_Type == "Quarterly") {
                                endMonth = Math.ceil(parseInt(fromDate.split("-")[1]) / 3) * 3;
                                var toDate = new Date(fromDate.split("-")[0], (parseInt(endMonth)), 0);
                                toDate = moment(toDate).format("YYYY-MM-DD");
                                $("#endDate-t2").val(toDate);
                            } else {
                                endMonth = parseInt(fromDate.split("-")[1]);
                                var toDate = new Date(fromDate.split("-")[0], (parseInt(endMonth)), 0);
                                toDate = moment(toDate).format("YYYY-MM-DD");
                                $("#endDate-t2").val(toDate);
                            }
                        }
                        if ($("#previousStartDate-t3").val() == "" && data.tvatreturn[i].fields.Tab3_Year > 0 && data.tvatreturn[i].fields.Tab3_Month != "") {
                            let previousStartDate = data.tvatreturn[i].fields.Tab3_Year + "-" + months[data.tvatreturn[i].fields.Tab3_Month] + "-01";
                            let previousEndDate = "";
                            var endMonth = (data.tvatreturn[i].fields.Tab3_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tvatreturn[i].fields.Tab3_Month]) / 3) * 3) : (months[data.tvatreturn[i].fields.Tab3_Month]);
                            previousEndDate = new Date(data.tvatreturn[i].fields.Tab3_Year, (parseInt(endMonth)), 0);
                            previousEndDate = moment(previousEndDate).format("YYYY-MM-DD");
                            $("#previousStartDate-t3").val(previousStartDate);
                            $("#previousEndDate-t3").val(previousEndDate);
                            var fromDate = new Date(data.tvatreturn[i].fields.Tab3_Year, parseInt(endMonth), 1);
                            fromDate = moment(fromDate).format("YYYY-MM-DD");
                            for (var key in months) {
                                if (months[key] == fromDate.split("-")[1]) {
                                    $("#beginmonthlydate-t3").val(key);
                                }
                            }
                            $("#currentyear-t3").val(fromDate.split("-")[0]);
                            if (data.tvatreturn[i].fields.Tab3_Type == "Quarterly") {
                                endMonth = Math.ceil(parseInt(fromDate.split("-")[1]) / 3) * 3;
                                var toDate = new Date(fromDate.split("-")[0], (parseInt(endMonth)), 0);
                                toDate = moment(toDate).format("YYYY-MM-DD");
                                $("#endDate-t3").val(toDate);
                            } else {
                                endMonth = parseInt(fromDate.split("-")[1]);
                                var toDate = new Date(fromDate.split("-")[0], (parseInt(endMonth)), 0);
                                toDate = moment(toDate).format("YYYY-MM-DD");
                                $("#endDate-t3").val(toDate);
                            }
                        }
                    } else {
                        if (getid > data.tvatreturn[i].fields.ID) {
                            if ($("#previousStartDate").val() == "" && data.tvatreturn[i].fields.Tab1_Year > 0 && data.tvatreturn[i].fields.Tab1_Month != "") {
                                let previousStartDate = data.tvatreturn[i].fields.Tab1_Year + "-" + months[data.tvatreturn[i].fields.Tab1_Month] + "-01";
                                let previousEndDate = "";
                                var endMonth = (data.tvatreturn[i].fields.Tab1_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tvatreturn[i].fields.Tab1_Month]) / 3) * 3) : (months[data.tvatreturn[i].fields.Tab1_Month]);
                                previousEndDate = new Date(data.tvatreturn[i].fields.Tab1_Year, (parseInt(endMonth)), 0);
                                previousEndDate = moment(previousEndDate).format("YYYY-MM-DD");
                                $("#previousStartDate").val(previousStartDate);
                                $("#previousEndDate").val(previousEndDate);
                            }
                            if ($("#previousStartDate-t2").val() == "" && data.tvatreturn[i].fields.Tab2_Year > 0 && data.tvatreturn[i].fields.Tab2_Month != "") {
                                let previousStartDate = data.tvatreturn[i].fields.Tab2_Year + "-" + months[data.tvatreturn[i].fields.Tab2_Month] + "-01";
                                let previousEndDate = "";
                                var endMonth = (data.tvatreturn[i].fields.Tab2_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tvatreturn[i].fields.Tab2_Month]) / 3) * 3) : (months[data.tvatreturn[i].fields.Tab2_Month]);
                                previousEndDate = new Date(data.tvatreturn[i].fields.Tab2_Year, (parseInt(endMonth)), 0);
                                previousEndDate = moment(previousEndDate).format("YYYY-MM-DD");
                                $("#previousStartDate-t2").val(previousStartDate);
                                $("#previousEndDate-t2").val(previousEndDate);
                            }
                            if ($("#previousStartDate-t3").val() == "" && data.tvatreturn[i].fields.Tab3_Year > 0 && data.tvatreturn[i].fields.Tab3_Month != "") {
                                let previousStartDate = data.tvatreturn[i].fields.Tab3_Year + "-" + months[data.tvatreturn[i].fields.Tab3_Month] + "-01";
                                let previousEndDate = "";
                                var endMonth = (data.tvatreturn[i].fields.Tab3_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tvatreturn[i].fields.Tab3_Month]) / 3) * 3) : (months[data.tvatreturn[i].fields.Tab3_Month]);
                                previousEndDate = new Date(data.tvatreturn[i].fields.Tab3_Year, (parseInt(endMonth)), 0);
                                previousEndDate = moment(previousEndDate).format("YYYY-MM-DD");
                                $("#previousStartDate-t3").val(previousStartDate);
                                $("#previousEndDate-t3").val(previousEndDate);
                            }
                        }
                    }
                }
                $('.fullScreenSpin').css('display', 'none');
            }
        }).catch(function(err) {
            let taxRateList = templateObject.taxRateList.get();

            reportService.getAllBASReturn().then(function(data) {
                for (let i = 0; i < data.tvatreturn.length; i++) {
                    if (getid == "") {
                        if (i == 0) {
                            if (data.tvatreturn[i].fields.AccMethod == "Accrual") {
                                $("#accountingmethod1").prop('checked', true);
                                $("#accountingmethod2").prop('checked', false);
                            } else {
                                $("#accountingmethod1").prop('checked', false);
                                $("#accountingmethod2").prop('checked', true);
                            }

                            if (data.tvatreturn[i].fields.Tab1_Type == "Quarterly") {
                                $("#datemethod1").prop('checked', true);
                                $("#datemethod2").prop('checked', false);
                            } else {
                                $("#datemethod1").prop('checked', false);
                                $("#datemethod2").prop('checked', true);
                            }

                            if (data.tvatreturn[i].fields.Tab2_Type == "Quarterly") {
                                $("#datemethod1-t2").prop('checked', true);
                                $("#datemethod2-t2").prop('checked', false);
                            } else {
                                $("#datemethod1-t2").prop('checked', false);
                                $("#datemethod2-t2").prop('checked', true);
                            }

                            if (data.tvatreturn[i].fields.Tab4_Type == "Quarterly") {
                                $("#datemethod1-t3").prop('checked', true);
                                $("#datemethod2-t3").prop('checked', false);
                            } else {
                                $("#datemethod1-t3").prop('checked', false);
                                $("#datemethod2-t3").prop('checked', true);
                            }

                            shareFunctionByName.initTable(data.tvatreturn[i].fields._1Selected, "tbltaxCodeCheckbox_1");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._1ASelected, "tbltaxCodeCheckbox_1A");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._2Selected, "tbltaxCodeCheckbox_2");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._2ASelected, "tbltaxCodeCheckbox_2A");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._3Selected, "tbltaxCodeCheckbox_3");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._5Selected, "tbltaxCodeCheckbox_5");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._7Selected, "tbltaxCodeCheckbox_7");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._10Selected, "tbltaxCodeCheckbox_10");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._12Selected, "tbltaxCodeCheckbox_12");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._14Selected, "tbltaxCodeCheckbox_14");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._14ASelected, "tbltaxCodeCheckbox_14A");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._15Selected, "tbltaxCodeCheckbox_15");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._15ASelected, "tbltaxCodeCheckbox_15A");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._16Selected, "tbltaxCodeCheckbox_16");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._17Selected, "tbltaxCodeCheckbox_17");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._18Selected, "tbltaxCodeCheckbox_18");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._21Selected, "tbltaxCodeCheckbox_21");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._22Selected, "tbltaxCodeCheckbox_22");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._26Selected, "tbltaxCodeCheckbox_26");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._27Selected, "tbltaxCodeCheckbox_27");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._30Selected, "tbltaxCodeCheckbox_30");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._31Selected, "tbltaxCodeCheckbox_31");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._34Selected, "tbltaxCodeCheckbox_34");
                            shareFunctionByName.initTable(data.tvatreturn[i].fields._35Selected, "tbltaxCodeCheckbox_35");
                        }
                        if ($("#previousStartDate").val() == "" && data.tvatreturn[i].fields.Tab1_Year > 0 && data.tvatreturn[i].fields.Tab1_Month != "") {
                            let previousStartDate = data.tvatreturn[i].fields.Tab1_Year + "-" + months[data.tvatreturn[i].fields.Tab1_Month] + "-01";
                            let previousEndDate = "";
                            var endMonth = (data.tvatreturn[i].fields.Tab1_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tvatreturn[i].fields.Tab1_Month]) / 3) * 3) : (months[data.tvatreturn[i].fields.Tab1_Month]);
                            previousEndDate = new Date(data.tvatreturn[i].fields.Tab1_Year, (parseInt(endMonth)), 0);
                            previousEndDate = moment(previousEndDate).format("YYYY-MM-DD");
                            $("#previousStartDate").val(previousStartDate);
                            $("#previousEndDate").val(previousEndDate);
                            var fromDate = new Date(data.tvatreturn[i].fields.Tab1_Year, parseInt(endMonth), 1);
                            fromDate = moment(fromDate).format("YYYY-MM-DD");
                            for (var key in months) {
                                if (months[key] == fromDate.split("-")[1]) {
                                    $("#beginmonthlydate").val(key);
                                }
                            }
                            $("#currentyear").val(fromDate.split("-")[0]);
                            if (data.tvatreturn[i].fields.Tab1_Type == "Quarterly") {
                                endMonth = Math.ceil(parseInt(fromDate.split("-")[1]) / 3) * 3;
                                var toDate = new Date(fromDate.split("-")[0], (parseInt(endMonth)), 0);
                                toDate = moment(toDate).format("YYYY-MM-DD");
                                $("#endDate").val(toDate);
                            } else {
                                endMonth = parseInt(fromDate.split("-")[1]);
                                var toDate = new Date(fromDate.split("-")[0], (parseInt(endMonth)), 0);
                                toDate = moment(toDate).format("YYYY-MM-DD");
                                $("#endDate").val(toDate);
                            }
                        }
                        if ($("#previousStartDate-t2").val() == "" && data.tvatreturn[i].fields.Tab2_Year > 0 && data.tvatreturn[i].fields.Tab2_Month != "") {
                            let previousStartDate = data.tvatreturn[i].fields.Tab2_Year + "-" + months[data.tvatreturn[i].fields.Tab2_Month] + "-01";
                            let previousEndDate = "";
                            var endMonth = (data.tvatreturn[i].fields.Tab2_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tvatreturn[i].fields.Tab2_Month]) / 3) * 3) : (months[data.tvatreturn[i].fields.Tab2_Month]);
                            previousEndDate = new Date(data.tvatreturn[i].fields.Tab2_Year, (parseInt(endMonth)), 0);
                            previousEndDate = moment(previousEndDate).format("YYYY-MM-DD");
                            $("#previousStartDate-t2").val(previousStartDate);
                            $("#previousEndDate-t2").val(previousEndDate);
                            var fromDate = new Date(data.tvatreturn[i].fields.Tab2_Year, parseInt(endMonth), 1);
                            fromDate = moment(fromDate).format("YYYY-MM-DD");
                            for (var key in months) {
                                if (months[key] == fromDate.split("-")[1]) {
                                    $("#beginmonthlydate-t2").val(key);
                                }
                            }
                            $("#currentyear-t2").val(fromDate.split("-")[0]);
                            if (data.tvatreturn[i].fields.Tab2_Type == "Quarterly") {
                                endMonth = Math.ceil(parseInt(fromDate.split("-")[1]) / 3) * 3;
                                var toDate = new Date(fromDate.split("-")[0], (parseInt(endMonth)), 0);
                                toDate = moment(toDate).format("YYYY-MM-DD");
                                $("#endDate-t2").val(toDate);
                            } else {
                                endMonth = parseInt(fromDate.split("-")[1]);
                                var toDate = new Date(fromDate.split("-")[0], (parseInt(endMonth)), 0);
                                toDate = moment(toDate).format("YYYY-MM-DD");
                                $("#endDate-t2").val(toDate);
                            }
                        }
                        if ($("#previousStartDate-t3").val() == "" && data.tvatreturn[i].fields.Tab3_Year > 0 && data.tvatreturn[i].fields.Tab3_Month != "") {
                            let previousStartDate = data.tvatreturn[i].fields.Tab3_Year + "-" + months[data.tvatreturn[i].fields.Tab3_Month] + "-01";
                            let previousEndDate = "";
                            var endMonth = (data.tvatreturn[i].fields.Tab3_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tvatreturn[i].fields.Tab3_Month]) / 3) * 3) : (months[data.tvatreturn[i].fields.Tab3_Month]);
                            previousEndDate = new Date(data.tvatreturn[i].fields.Tab4_Year, (parseInt(endMonth)), 0);
                            previousEndDate = moment(previousEndDate).format("YYYY-MM-DD");
                            $("#previousStartDate-t3").val(previousStartDate);
                            $("#previousEndDate-t3").val(previousEndDate);
                            var fromDate = new Date(data.tvatreturn[i].fields.Tab3_Year, parseInt(endMonth), 1);
                            fromDate = moment(fromDate).format("YYYY-MM-DD");
                            for (var key in months) {
                                if (months[key] == fromDate.split("-")[1]) {
                                    $("#beginmonthlydate-t3").val(key);
                                }
                            }
                            $("#currentyear-t3").val(fromDate.split("-")[0]);
                            if (data.tvatreturn[i].fields.Tab3_Type == "Quarterly") {
                                endMonth = Math.ceil(parseInt(fromDate.split("-")[1]) / 3) * 3;
                                var toDate = new Date(fromDate.split("-")[0], (parseInt(endMonth)), 0);
                                toDate = moment(toDate).format("YYYY-MM-DD");
                                $("#endDate-t3").val(toDate);
                            } else {
                                endMonth = parseInt(fromDate.split("-")[1]);
                                var toDate = new Date(fromDate.split("-")[0], (parseInt(endMonth)), 0);
                                toDate = moment(toDate).format("YYYY-MM-DD");
                                $("#endDate-t3").val(toDate);
                            }
                        }
                    } else {
                        if (getid > data.tvatreturn[i].fields.ID) {
                            if ($("#previousStartDate").val() == "" && data.tvatreturn[i].fields.Tab1_Year > 0 && data.tvatreturn[i].fields.Tab1_Month != "") {
                                let previousStartDate = data.tvatreturn[i].fields.Tab1_Year + "-" + months[data.tvatreturn[i].fields.Tab1_Month] + "-01";
                                let previousEndDate = "";
                                var endMonth = (data.tvatreturn[i].fields.Tab1_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tvatreturn[i].fields.Tab1_Month]) / 3) * 3) : (months[data.tvatreturn[i].fields.Tab1_Month]);
                                previousEndDate = new Date(data.tvatreturn[i].fields.Tab1_Year, (parseInt(endMonth)), 0);
                                previousEndDate = moment(previousEndDate).format("YYYY-MM-DD");
                                $("#previousStartDate").val(previousStartDate);
                                $("#previousEndDate").val(previousEndDate);
                            }
                            if ($("#previousStartDate-t2").val() == "" && data.tvatreturn[i].fields.Tab2_Year > 0 && data.tvatreturn[i].fields.Tab2_Month != "") {
                                let previousStartDate = data.tvatreturn[i].fields.Tab2_Year + "-" + months[data.tvatreturn[i].fields.Tab2_Month] + "-01";
                                let previousEndDate = "";
                                var endMonth = (data.tvatreturn[i].fields.Tab2_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tvatreturn[i].fields.Tab2_Month]) / 3) * 3) : (months[data.tvatreturn[i].fields.Tab2_Month]);
                                previousEndDate = new Date(data.tvatreturn[i].fields.Tab2_Year, (parseInt(endMonth)), 0);
                                previousEndDate = moment(previousEndDate).format("YYYY-MM-DD");
                                $("#previousStartDate-t2").val(previousStartDate);
                                $("#previousEndDate-t2").val(previousEndDate);
                            }
                            if ($("#previousStartDate-t3").val() == "" && data.tvatreturn[i].fields.Tab3_Year > 0 && data.tvatreturn[i].fields.Tab3_Month != "") {
                                let previousStartDate = data.tvatreturn[i].fields.Tab3_Year + "-" + months[data.tvatreturn[i].fields.Tab3_Month] + "-01";
                                let previousEndDate = "";
                                var endMonth = (data.tvatreturn[i].fields.Tab3_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tvatreturn[i].fields.Tab3_Month]) / 3) * 3) : (months[data.tvatreturn[i].fields.Tab3_Month]);
                                previousEndDate = new Date(data.tvatreturn[i].fields.Tab3_Year, (parseInt(endMonth)), 0);
                                previousEndDate = moment(previousEndDate).format("YYYY-MM-DD");
                                $("#previousStartDate-t3").val(previousStartDate);
                                $("#previousEndDate-t3").val(previousEndDate);
                            }
                        }
                    }
                }
                $('.fullScreenSpin').css('display', 'none');
            }).catch(function(err) {
                $('.fullScreenSpin').css('display', 'none');
            });
        });
    }
    setTimeout(function() {
        templateObject.getAllVatReturnData();
    }, 1000);

    function MakeNegative() {
        var TDs = document.getElementsByTagName("td");
        for (var i = 0; i < TDs.length; i++) {
            var temp = TDs[i];
            if (temp.firstChild.nodeValue.indexOf("-" + Currency) === 0) {
                temp.className = "colBalance text-danger";
            }
        }
    }

    templateObject.getTaxSummaryReports = function(dateFrom, dateTo, ignoreDate, tabType = "t1") {
        reportService.getTaxSummaryData(dateFrom, dateTo, ignoreDate).then(function(data) {
            if (data.ttaxsummaryreport.length) {
                const taxSummaryReport = data.ttaxsummaryreport;

                reportService.getTaxCodesDetailVS1().then(function(data) {
                    const taxCodesDetail = data.ttaxcodevs1;
                    let mainReportRecords = [];
                    let subReportRecords = [];

                    for (let i = 0; i < taxSummaryReport.length; i++) {
                        let inputsexpurchases = utilityService.modifynegativeCurrencyFormat(taxSummaryReport[i].INPUT_AmountEx) || 0;
                        let inputsincpurchases = utilityService.modifynegativeCurrencyFormat(taxSummaryReport[i].INPUT_AmountInc) || 0;
                        let outputexsales = utilityService.modifynegativeCurrencyFormat(taxSummaryReport[i].OUTPUT_AmountEx) || 0;
                        let outputincsales = utilityService.modifynegativeCurrencyFormat(taxSummaryReport[i].OUTPUT_AmountInc) || 0;
                        let totalnet = utilityService.modifynegativeCurrencyFormat(taxSummaryReport[i].TotalNet) || 0;
                        let totaltax = utilityService.modifynegativeCurrencyFormat(taxSummaryReport[i].TotalTax) || 0;
                        let totaltax1 = utilityService.modifynegativeCurrencyFormat(taxSummaryReport[i].TotalTax1) || 0;
                        const mainReportData = {
                            id: taxSummaryReport[i].ID || '',
                            taxcode: taxSummaryReport[i].TaxCode || '',
                            clientid: taxSummaryReport[i].ClientID || '',
                            inputsexpurchases: inputsexpurchases,
                            inputsincpurchases: inputsincpurchases,
                            outputexsales: outputexsales,
                            outputincsales: outputincsales,
                            totalnet: totalnet || 0.00,
                            totaltax: totaltax || 0.00,
                            totaltaxdigit: taxSummaryReport[i].TotalTax || 0,
                            totaltax1: totaltax1 || 0.00,
                            taxrate: (taxSummaryReport[i].TaxRate * 100).toFixed(2) + '%' || 0,
                            taxrate2: (taxSummaryReport[i].TaxRate * 100).toFixed(2) || 0
                        };

                        mainReportRecords.push(mainReportData);

                        const taxDetail = taxCodesDetail.find((v) => v.CodeName === taxSummaryReport[i].TaxCode);
                        if (taxDetail && taxDetail.Lines) {
                            for (let j = 0; j < taxDetail.Lines.length; j++) {
                                const tax = (utilityService.convertSubstringParseFloat(inputsexpurchases) - utilityService.convertSubstringParseFloat(outputexsales)) * taxDetail.Lines[j].Percentage / 100.0;
                                const subReportData = {
                                    id: taxSummaryReport[i].ID || '',
                                    taxcode: taxSummaryReport[i].TaxCode || '',
                                    subtaxcode: taxDetail.Lines[j].SubTaxCode || '',
                                    clientid: '',
                                    inputsexpurchases: inputsexpurchases,
                                    inputsincpurchases: inputsincpurchases,
                                    outputexsales: outputexsales,
                                    outputincsales: outputincsales,
                                    totalnet: totalnet || 0.00,
                                    totaltax: utilityService.modifynegativeCurrencyFormat(Math.abs(tax)) || 0.00,
                                    totaltax1: utilityService.modifynegativeCurrencyFormat(tax) || 0.00,
                                    taxrate: (taxDetail.Lines[j].Percentage).toFixed(2) + '%' || 0,
                                    taxrate2: (taxDetail.Lines[j].Percentage).toFixed(2) || 0
                                };
                                subReportRecords.push(subReportData);
                            }
                        }
                    }

                    mainReportRecords = _.sortBy(mainReportRecords, 'taxcode');
                    subReportRecords = _.sortBy(subReportRecords, 'subtaxcode');

                    if (tabType == "t1") {
                        templateObject.taxSummaryListT1.set(mainReportRecords);
                        templateObject.selTaxList("1");
                        templateObject.selTaxList("1a");
                        templateObject.selTaxList("2");
                        templateObject.selTaxList("2a");
                        templateObject.selTaxList("3");
                        templateObject.selTaxList("5");
                        templateObject.selTaxList("7");
                        templateObject.selTaxList("10");
                        templateObject.selTaxList("12");
                    } else if (tabType == "t2") {
                        templateObject.taxSummaryListT2.set(mainReportRecords);
                        templateObject.selTaxList("14");
                        templateObject.selTaxList("14a");
                        templateObject.selTaxList("15");
                        templateObject.selTaxList("15a");
                        templateObject.selTaxList("16");
                        templateObject.selTaxList("17");
                        templateObject.selTaxList("18");
                    } else if (tabType == "t3") {
                        templateObject.taxSummaryListT3.set(mainReportRecords);
                        templateObject.selTaxList("21");
                        templateObject.selTaxList("22");
                        templateObject.selTaxList("23");
                        templateObject.selTaxList("26");
                        templateObject.selTaxList("27");
                        templateObject.selTaxList("28");
                        templateObject.selTaxList("30");
                        templateObject.selTaxList("31");
                        templateObject.selTaxList("32");
                        templateObject.selTaxList("34");
                        templateObject.selTaxList("35");
                        templateObject.selTaxList("36");
                    }

                    var tax4cost = parseFloat($("#tax1cost").val()) * 15 / (100 + 15);
                    $("#tax4cost").val(tax4cost.toFixed(2));
                    $("#prt_tax4cost").html("$" + tax4cost.toFixed(2));
                    var tax4acost = parseFloat($("#tax1acost").val()) * 15 / (100 + 15);
                    $("#tax4acost").val(tax4acost.toFixed(2));
                    $("#prt_tax4acost").html("$" + tax4acost.toFixed(2));
                    var tax6cost = parseFloat($("#tax5acost").val()) * 60 / 100;
                    $("#tax6cost").val(tax6cost.toFixed(2));
                    $("#prt_tax6cost").html("$" + tax6cost.toFixed(2));
                    var tax8cost = tax6cost + parseFloat($("#tax7acost").val());
                    $("#tax8cost").val(tax8cost.toFixed(2));
                    $("#prt_tax8cost").html("$" + tax8cost.toFixed(2));
                    var tax9cost = tax8cost * 15 / 100;
                    $("#tax9cost").val(tax9cost.toFixed(2));
                    $("#prt_tax9cost").html("$" + tax9cost.toFixed(2));
                    var tax11cost = parseFloat($("#tax10cost").val()) * 15 / (100 + 15);
                    $("#tax11cost").val(tax11cost.toFixed(2));
                    $("#prt_tax11cost").html("$" + tax11cost.toFixed(2));
                    var tax13cost = tax4cost + tax4acost + tax9cost + tax11cost + parseFloat($("#tax12cost").val());
                    $("#tax13cost").val(tax13cost.toFixed(2));
                    $("#prt_tax13cost").html("$" + tax13cost.toFixed(2));
                    var tax19cost = parseFloat($("#tax14cost").val()) + parseFloat($("#tax14acost").val()) + parseFloat($("#tax15cost").val()) + parseFloat($("#tax15acost").val()) + parseFloat($("#tax16cost").val()) + parseFloat($("#tax17cost").val()) + parseFloat($("#tax18cost").val());
                    $("#tax19cost").val(tax19cost.toFixed(2));
                    $("#prt_tax19cost").html("$" + tax19cost.toFixed(2));
                    var tax20cost = tax13cost - tax19cost;
                    $("#tax20cost").val(tax20cost.toFixed(2));
                    $("#prt_tax20cost").html("$" + tax20cost.toFixed(2));
                    var tax23cost = parseFloat($("#tax21cost").val()) - parseFloat($("#tax22cost").val());
                    $("#tax23cost").val(tax23cost.toFixed(2));
                    $("#prt_tax23cost").html("$" + tax23cost.toFixed(2));
                    var tax24cost = tax23cost * 80 / 100;
                    $("#tax24cost").val(tax24cost.toFixed(2));
                    $("#prt_tax24cost").html("$" + tax24cost.toFixed(2));
                    var tax25cost = tax24cost * 332.8 / 100;
                    $("#tax25cost").val(tax25cost.toFixed(2));
                    $("#prt_tax25cost").html("$" + tax25cost.toFixed(2));
                    var tax28cost = parseFloat($("#tax26cost").val()) - parseFloat($("#tax27cost").val());
                    $("#tax28cost").val(tax28cost.toFixed(2));
                    $("#prt_tax28cost").html("$" + tax28cost.toFixed(2));
                    var tax29cost = tax28cost * 562 / 100;
                    $("#tax29cost").val(tax29cost.toFixed(2));
                    $("#prt_tax29cost").html("$" + tax29cost.toFixed(2));
                    var tax32cost = parseFloat($("#tax30cost").val()) - parseFloat($("#tax31cost").val());
                    $("#tax32cost").val(tax32cost.toFixed(2));
                    $("#prt_tax32cost").html("$" + tax32cost.toFixed(2));
                    var tax33cost = tax32cost * 207 / 100;
                    $("#tax33cost").val(tax33cost.toFixed(2));
                    $("#prt_tax33cost").html("$" + tax33cost.toFixed(2));
                    var tax36cost = parseFloat($("#tax34cost").val()) - parseFloat($("#tax35cost").val());
                    $("#tax36cost").val(tax36cost.toFixed(2));
                    $("#prt_tax36cost").html("$" + tax36cost.toFixed(2));
                    var tax37cost = tax36cost * 384.5 / 100;
                    $("#tax37cost").val(tax37cost.toFixed(2));
                    $("#prt_tax37cost").html("$" + tax37cost.toFixed(2));
                    var tax38cost = tax20cost - (tax25cost + tax29cost + tax33cost + tax37cost);
                    $("#tax38cost").val(tax38cost.toFixed(2));
                    $("#prt_tax38cost").html("$" + tax38cost.toFixed(2));
                });
            }

            $('.fullScreenSpin').css('display', 'none');

        }).catch(function(err) {
            if (tabType == "t1") {
                templateObject.taxSummaryListT1.set([]);
            } else if (tabType == "t2") {
                templateObject.taxSummaryListT2.set([]);
            } else if (tabType == "t3") {
                templateObject.taxSummaryListT3.set([]);
            }

            $('.fullScreenSpin').css('display', 'none');
        });
    };

    templateObject.selTaxList = function(pan) {
        let taxRateList = templateObject.taxRateList.get();
        let taxSummaryList = [];
        if (["1", "1a", "2", "2a", "3", "5", "7", "10", "12"].includes(pan)) {
            taxSummaryList = templateObject.taxSummaryListT1.get();
        } else if (["14", "14a", "15", "15a", "16", "17", "18"].includes(pan)) {
            taxSummaryList = templateObject.taxSummaryListT2.get();
        } else if (["21", "22", "23", "26", "27", "28", "30", "31", "32", "34", "35", "36"].includes(pan)) {
            taxSummaryList = templateObject.taxSummaryListT3.get();
        }

        var total_tax = 0;
        for (var i = 0; i < taxRateList.length; i++) {
            if ($("#t-" + pan + "-" + taxRateList[i].Id).prop('checked') == true) {
                for (var j = 0; j < taxSummaryList.length; j++) {
                    if (taxRateList[i].CodeName == taxSummaryList[j].taxcode) {
                        total_tax += parseFloat(taxSummaryList[j].totaltaxdigit);
                    }
                }
            }
        }
        $("#tax" + pan + "cost").val(total_tax.toFixed(2));
        $("#prt_tax" + pan + "cost").html("$" + total_tax.toFixed(2));
    };

    $('#sltDepartment').editableSelect();

    $('#sltDepartment').editableSelect()
        .on('click.editable-select', function(e, li) {
            var $earch = $(this);
            var offset = $earch.offset();
            var deptDataName = e.target.value || '';
            $('#edtDepartmentID').val('');
            if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
                $('#departmentModal').modal('toggle');
            } else {
                if (deptDataName.replace(/\s/g, '') != '') {
                    $('#newDeptHeader').text('Edit Department');

                    getVS1Data('TDeptClass').then(function(dataObject) {
                        if (dataObject.length == 0) {
                            $('.fullScreenSpin').css('display', 'inline-block');
                            sideBarService.getDepartment().then(function(data) {
                                for (let i = 0; i < data.tdeptclass.length; i++) {
                                    if (data.tdeptclass[i].DeptClassName === deptDataName) {
                                        $('#edtDepartmentID').val(data.tdeptclass[i].Id);
                                        $('#edtNewDeptName').val(data.tdeptclass[i].DeptClassName);
                                        $('#edtSiteCode').val(data.tdeptclass[i].SiteCode);
                                        $('#edtDeptDesc').val(data.tdeptclass[i].Description);
                                    }
                                }
                                setTimeout(function() {
                                    $('.fullScreenSpin').css('display', 'none');
                                    $('#newDepartmentModal').modal('toggle');
                                }, 200);
                            });
                        } else {
                            let data = JSON.parse(dataObject[0].data);
                            let useData = data.tdeptclass;
                            for (let i = 0; i < data.tdeptclass.length; i++) {
                                if (data.tdeptclass[i].DeptClassName === deptDataName) {
                                    $('#edtDepartmentID').val(data.tdeptclass[i].Id);
                                    $('#edtNewDeptName').val(data.tdeptclass[i].DeptClassName);
                                    $('#edtSiteCode').val(data.tdeptclass[i].SiteCode);
                                    $('#edtDeptDesc').val(data.tdeptclass[i].Description);
                                }
                            }
                            setTimeout(function() {
                                $('.fullScreenSpin').css('display', 'none');
                                $('#newDepartmentModal').modal('toggle');
                            }, 200);
                        }
                    }).catch(function(err) {
                        $('.fullScreenSpin').css('display', 'inline-block');
                        sideBarService.getDepartment().then(function(data) {
                            for (let i = 0; i < data.tdeptclass.length; i++) {
                                if (data.tdeptclass[i].DeptClassName === deptDataName) {
                                    $('#edtDepartmentID').val(data.tdeptclass[i].Id);
                                    $('#edtNewDeptName').val(data.tdeptclass[i].DeptClassName);
                                    $('#edtSiteCode').val(data.tdeptclass[i].SiteCode);
                                    $('#edtDeptDesc').val(data.tdeptclass[i].Description);
                                }
                            }
                            setTimeout(function() {
                                $('.fullScreenSpin').css('display', 'none');
                                $('#newDepartmentModal').modal('toggle');
                            }, 200);
                        });
                    });
                } else {
                    $('#departmentModal').modal();
                    setTimeout(function() {
                        $('#departmentList_filter .form-control-sm').focus();
                        $('#departmentList_filter .form-control-sm').val('');
                        $('#departmentList_filter .form-control-sm').trigger("input");
                        var datatable = $('#departmentList').DataTable();
                        datatable.draw();
                        $('#departmentList_filter .form-control-sm').trigger("input");
                    }, 500);
                }
            }
        });

    setTimeout(function() {
        $(document).ready(function() {
            $('.fullScreenSpin').css('display', 'inline-block');
            organisationService.getOrganisationDetail().then(function(data) {
                let mainData = data.tcompanyinfo[0];
                $("#prt_companyName").html(mainData.CompanyName);
                $("#prt_companyAddress").html(mainData.Address);
                $("#prt_companyCity").html(mainData.City);
                $("#prt_companyZipState").html(mainData.PoState + " " + mainData.Postcode);
                $("#prt_companyPhoneNumber").html(mainData.PhoneNumber);
            });
            var url = FlowRouter.current().path;
            if (url.indexOf('?id=') > 0) {
                var getid = url.split('?id=');

                if (getid[1]) {
                    templateObject.getId.set(getid[1]);
                    templateObject.pageTitle.set("Edit VAT Return");

                    getVS1Data('TVATReturn').then(function(dataObject) {
                        let taxRateList = templateObject.taxRateList.get();
                        let deptrecords = templateObject.deptrecords.get();
                        if (dataObject.length == 0) {
                            reportService.getOneVATReturn(getid[1]).then(function(data) {
                                $("#description").val(data.tvatreturn[0].fields.VatSheetDesc);
                                $("#vatreturnCategory1").prop('checked', data.tvatreturn[0].fields.HasTab1);
                                $("#vatreturnCategory2").prop('checked', data.tvatreturn[0].fields.HasTab2);
                                $("#vatreturnCategory3").prop('checked', data.tvatreturn[0].fields.HasTab3);
                                if (data.tvatreturn[0].fields.HasTab1 == true) {
                                    document.getElementById("tax1").setAttribute("href", "#taxCode1option");
                                    document.getElementById("tax1a").setAttribute("href", "#taxCode1aoption");
                                    document.getElementById("tax2").setAttribute("href", "#taxCode2option");
                                    document.getElementById("tax2a").setAttribute("href", "#taxCode2aoption");
                                    document.getElementById("tax3").setAttribute("href", "#taxCode3option");
                                    $("#tax4cost").attr("disabled", "disabled");
                                    $("#tax4acost").attr("disabled", "disabled");
                                    document.getElementById("tax5").setAttribute("href", "#taxCode5option");
                                    document.getElementById("tax7").setAttribute("href", "#taxCode7option");
                                    document.getElementById("tax10").setAttribute("href", "#taxCode10option");
                                    $("#tax11cost").attr("disabled", "disabled");
                                    document.getElementById("tax12").setAttribute("href", "#taxCode12option");
                                } else {
                                    document.getElementById("tax1").setAttribute("href", "#");
                                    document.getElementById("tax1a").setAttribute("href", "#");
                                    document.getElementById("tax2").setAttribute("href", "#");
                                    document.getElementById("tax2a").setAttribute("href", "#");
                                    document.getElementById("tax3").setAttribute("href", "#");
                                    $("#tax4cost").attr("disabled", "disabled");
                                    $("#tax4acost").attr("disabled", "disabled");
                                    document.getElementById("tax5").setAttribute("href", "#");
                                    document.getElementById("tax7").setAttribute("href", "#");
                                    document.getElementById("tax10").setAttribute("href", "#");
                                    $("#tax11cost").attr("disabled", "disabled");
                                    document.getElementById("tax12").setAttribute("href", "#");
                                }
                                if (data.tvatreturn[0].fields.HasTab2 == true) {
                                    document.getElementById("tax14").setAttribute("href", "#taxCode14option");
                                    document.getElementById("tax14a").setAttribute("href", "#taxCode14aoption");
                                    document.getElementById("tax15").setAttribute("href", "#taxCode15option");
                                    document.getElementById("tax15a").setAttribute("href", "#taxCode15aoption");
                                    document.getElementById("tax16").setAttribute("href", "#taxCode16option");
                                    document.getElementById("tax17").setAttribute("href", "#taxCode17option");
                                    document.getElementById("tax18").setAttribute("href", "#taxCode18option");
                                } else {
                                    document.getElementById("tax14").setAttribute("href", "#");
                                    document.getElementById("tax14a").setAttribute("href", "#");
                                    document.getElementById("tax15").setAttribute("href", "#");
                                    document.getElementById("tax15a").setAttribute("href", "#");
                                    document.getElementById("tax16").setAttribute("href", "#");
                                    document.getElementById("tax17").setAttribute("href", "#");
                                    document.getElementById("tax18").setAttribute("href", "#");
                                }
                                if (data.tvatreturn[0].fields.HasTab3 == true) {
                                    document.getElementById("tax21").setAttribute("href", "#taxCode21option");
                                    document.getElementById("tax22").setAttribute("href", "#taxCode22option");
                                    document.getElementById("tax26").setAttribute("href", "#taxCode26option");
                                    document.getElementById("tax27").setAttribute("href", "#taxCode27option");
                                    document.getElementById("tax30").setAttribute("href", "#taxCode30option");
                                    document.getElementById("tax31").setAttribute("href", "#taxCode31option");
                                    document.getElementById("tax34").setAttribute("href", "#taxCode34option");
                                    document.getElementById("tax35").setAttribute("href", "#taxCode35option");
                                } else {
                                    document.getElementById("tax21").setAttribute("href", "#taxCode21option");
                                    document.getElementById("tax22").setAttribute("href", "#taxCode22option");
                                    document.getElementById("tax26").setAttribute("href", "#taxCode26option");
                                    document.getElementById("tax27").setAttribute("href", "#taxCode27option");
                                    document.getElementById("tax30").setAttribute("href", "#taxCode30option");
                                    document.getElementById("tax31").setAttribute("href", "#taxCode31option");
                                    document.getElementById("tax34").setAttribute("href", "#taxCode34option");
                                    document.getElementById("tax35").setAttribute("href", "#taxCode35option");
                                }

                                if (data.tvatreturn[0].fields.ClassID > 0) {
                                    for (var i = 0; i < deptrecords.length; i++) {
                                        if (deptrecords[i].id == data.tvatreturn[0].fields.ClassID) {
                                            $("#sltDepartment").val(deptrecords[i].department);
                                            $("#sltDepartmentID").val(deptrecords[i].id);
                                        }
                                    }
                                }
                                if (data.tvatreturn[0].fields.AllClass == true) {
                                    $("#allDepart").prop('checked', true);
                                } else {
                                    $("#allDepart").prop('checked', false);
                                }
                                if (data.tvatreturn[0].fields.AccMethod == "Accrual") {
                                    $("#accountingmethod1").prop('checked', true);
                                    $("#accountingmethod2").prop('checked', false);
                                } else {
                                    $("#accountingmethod1").prop('checked', false);
                                    $("#accountingmethod2").prop('checked', true);
                                }
                                $("#prt_accountingMethod").html(data.tvatreturn[0].AccMethod);
                                if (data.tvatreturn[0].fields.Tab1_Type == "Quarterly") {
                                    $("#datemethod1").prop('checked', true);
                                    $("#datemethod2").prop('checked', false);
                                } else {
                                    $("#datemethod1").prop('checked', false);
                                    $("#datemethod2").prop('checked', true);
                                }
                                $("#beginmonthlydate").val(data.tvatreturn[0].fields.Tab1_Month);
                                $("#currentyear").val(data.tvatreturn[0].fields.Tab1_Year);
                                let tab1endDate = "";
                                if (data.tvatreturn[0].fields.Tab1_Month != "" && data.tvatreturn[0].fields.Tab1_Year > 0) {
                                    var endMonth = (data.tvatreturn[0].fields.Tab1_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tvatreturn[0].fields.Tab1_Month]) / 3) * 3) : (months[data.tvatreturn[0].fields.Tab1_Month]);
                                    tab1endDate = new Date(data.tvatreturn[0].fields.Tab1_Year, (parseInt(endMonth)), 0);
                                    tab1endDate = moment(tab1endDate).format("YYYY-MM-DD");
                                }
                                $("#endDate").val(tab1endDate);
                                $("#prt_beginningDate").html(data.tvatreturn[0].fields.Tab1_Month + " " + data.tvatreturn[0].fields.Tab1_Year);
                                $("#tax1cost").val(data.tvatreturn[0].fields._1);
                                $(".prt_tax1cost").html("$" + data.tvatreturn[0].fields._1);
                                $("#tax1acost").val(data.tvatreturn[0].fields._1A);
                                $("#prt_tax1acost").html("$" + data.tvatreturn[0].fields._1A);
                                $("#tax2cost").val(data.tvatreturn[0].fields._2);
                                $("#prt_tax2cost").html("$" + data.tvatreturn[0].fields._2);
                                $("#tax2acost").val(data.tvatreturn[0].fields._2A);
                                $("#prt_tax2acost").html("$" + data.tvatreturn[0].fields._2A);
                                $("#tax3cost").val(data.tvatreturn[0].fields._3);
                                $("#prt_tax3cost").html("$" + data.tvatreturn[0].fields._3);
                                $("#tax4cost").val(data.tvatreturn[0].fields._4);
                                $("#prt_tax4cost").html("$" + data.tvatreturn[0].fields._4);
                                $("#tax4acost").val(data.tvatreturn[0].fields._4A);
                                $("#prt_tax4acost").html("$" + data.tvatreturn[0].fields._4A);
                                $("#tax5cost").val(data.tvatreturn[0].fields._5);
                                $("#prt_tax5cost").html("$" + data.tvatreturn[0].fields._5);
                                $("#tax7cost").val(data.tvatreturn[0].fields._7);
                                $("#prt_tax7cost").html("$" + data.tvatreturn[0].fields._7);
                                $("#tax10cost").val(data.tvatreturn[0].fields._10);
                                $("#prt_tax10cost").html("$" + data.tvatreturn[0].fields._10);
                                $("#tax11cost").val(data.tvatreturn[0].fields._11);
                                $("#prt_tax11cost").html("$" + data.tvatreturn[0].fields._11);
                                $("#tax12cost").val(data.tvatreturn[0].fields._12);
                                $("#prt_tax12cost").html("$" + data.tvatreturn[0].fields._12);
                                let tax13cost = data.tvatreturn[0].fields._4 + data.tvatreturn[0].fields._4A + data.tvatreturn[0].fields._9 + data.tvatreturn[0].fields._11 + data.tvatreturn[0].fields._12;
                                $("#tax13cost").val(tax13cost);
                                $("#prt_tax13cost").html("$" + tax13cost);

                                shareFunctionByName.initTable(data.tvatreturn[0].fields._1Selected, "tbltaxCodeCheckbox_1");
                                shareFunctionByName.initTable(data.tvatreturn[0].fields._1ASelected, "tbltaxCodeCheckbox_1A");
                                shareFunctionByName.initTable(data.tvatreturn[0].fields._2Selected, "tbltaxCodeCheckbox_2");
                                shareFunctionByName.initTable(data.tvatreturn[0].fields._2ASelected, "tbltaxCodeCheckbox_2A");
                                shareFunctionByName.initTable(data.tvatreturn[0].fields._3Selected, "tbltaxCodeCheckbox_3");
                                shareFunctionByName.initTable(data.tvatreturn[0].fields._5Selected, "tbltaxCodeCheckbox_5");
                                shareFunctionByName.initTable(data.tvatreturn[0].fields._7Selected, "tbltaxCodeCheckbox_7");
                                shareFunctionByName.initTable(data.tvatreturn[0].fields._10Selected, "tbltaxCodeCheckbox_10");
                                shareFunctionByName.initTable(data.tvatreturn[0].fields._12Selected, "tbltaxCodeCheckbox_12");
                                shareFunctionByName.initTable(data.tvatreturn[0].fields._14Selected, "tbltaxCodeCheckbox_14");
                                shareFunctionByName.initTable(data.tvatreturn[0].fields._14ASelected, "tbltaxCodeCheckbox_14A");
                                shareFunctionByName.initTable(data.tvatreturn[0].fields._15Selected, "tbltaxCodeCheckbox_15");
                                shareFunctionByName.initTable(data.tvatreturn[0].fields._15ASelected, "tbltaxCodeCheckbox_15A");
                                shareFunctionByName.initTable(data.tvatreturn[0].fields._16Selected, "tbltaxCodeCheckbox_16");
                                shareFunctionByName.initTable(data.tvatreturn[0].fields._17Selected, "tbltaxCodeCheckbox_17");
                                shareFunctionByName.initTable(data.tvatreturn[0].fields._18Selected, "tbltaxCodeCheckbox_18");
                                shareFunctionByName.initTable(data.tvatreturn[0].fields._21Selected, "tbltaxCodeCheckbox_21");
                                shareFunctionByName.initTable(data.tvatreturn[0].fields._22Selected, "tbltaxCodeCheckbox_22");
                                shareFunctionByName.initTable(data.tvatreturn[0].fields._26Selected, "tbltaxCodeCheckbox_26");
                                shareFunctionByName.initTable(data.tvatreturn[0].fields._27Selected, "tbltaxCodeCheckbox_27");
                                shareFunctionByName.initTable(data.tvatreturn[0].fields._30Selected, "tbltaxCodeCheckbox_30");
                                shareFunctionByName.initTable(data.tvatreturn[0].fields._31Selected, "tbltaxCodeCheckbox_31");
                                shareFunctionByName.initTable(data.tvatreturn[0].fields._34Selected, "tbltaxCodeCheckbox_34");
                                shareFunctionByName.initTable(data.tvatreturn[0].fields._35Selected, "tbltaxCodeCheckbox_35");
                                if (data.tvatreturn[0].fields.Tab2_Type == "Quarterly") {
                                    $("#datemethod1-t2").prop('checked', true);
                                    $("#datemethod2-t2").prop('checked', false);
                                } else {
                                    $("#datemethod1-t2").prop('checked', false);
                                    $("#datemethod2-t2").prop('checked', true);
                                }
                                $("#beginmonthlydate-t2").val(data.tvatreturn[0].fields.Tab2_Month);
                                $("#currentyear-t2").val(data.tvatreturn[0].fields.Tab2_Year);
                                let tab2endDate = "";
                                if (data.tvatreturn[0].fields.Tab2_Month != "" && data.tvatreturn[0].fields.Tab2_Year > 0) {
                                    var endMonth2 = (data.tvatreturn[0].fields.Tab2_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tvatreturn[0].fields.Tab2_Month]) / 3) * 3) : (months[data.tvatreturn[0].fields.Tab2_Month]);
                                    tab2endDate = new Date(data.tvatreturn[0].fields.Tab2_Year, (parseInt(endMonth2)), 0);
                                    tab2endDate = moment(tab2endDate).format("YYYY-MM-DD");
                                }
                                $("#endDate-t2").val(tab2endDate);
                                // $("#prt_beginningDateT2").html(data.tvatreturn[0].fields.Tab2_Month + " " + data.tvatreturn[0].fields.Tab2_Year);
                                $("#tax14cost").val(data.tvatreturn[0].fields._14);
                                $("#prt_tax14cost").html("$" + data.tvatreturn[0].fields._14);
                                $("#tax14acost").val(data.tvatreturn[0].fields._14A);
                                $("#prt_tax14acost").html("$" + data.tvatreturn[0].fields._14A);
                                $("#tax15cost").val(data.tvatreturn[0].fields._15);
                                $("#prt_tax15cost").html("$" + data.tvatreturn[0].fields._15);
                                $("#tax15acost").val(data.tvatreturn[0].fields._15A);
                                $("#prt_tax15acost").html("$" + data.tvatreturn[0].fields._15A);
                                $("#tax16cost").val(data.tvatreturn[0].fields._16);
                                $("#prt_tax16cost").html("$" + data.tvatreturn[0].fields._16);
                                $("#tax17cost").val(data.tvatreturn[0].fields._17);
                                $("#prt_tax17cost").html("$" + data.tvatreturn[0].fields._17);
                                $("#tax18cost").val(data.tvatreturn[0].fields._18);
                                $("#prt_tax18cost").html("$" + data.tvatreturn[0].fields._18);
                                let tax19cost = data.tvatreturn[0].fields._14 + data.tvatreturn[0].fields._14A + data.tvatreturn[0].fields._15 + data.tvatreturn[0].fields._15A + data.tvatreturn[0].fields._16 + data.tvatreturn[0].fields._17 + data.tvatreturn[0].fields._18;
                                $("#tax19cost").val(tax19cost);
                                $("#prt_tax19cost").html("$" + tax19cost);
                                let tax20cost = tax13cost - tax19cost;
                                $("#tax20cost").val(tax20cost);
                                $("#prt_tax20cost").html("$" + tax20cost);
                                if (data.tvatreturn[0].fields.Tab3_Type == "Quarterly") {
                                    $("#datemethod1-t3").prop('checked', true);
                                    $("#datemethod2-t3").prop('checked', false);
                                } else {
                                    $("#datemethod1-t3").prop('checked', false);
                                    $("#datemethod2-t3").prop('checked', true);
                                }
                                $("#beginmonthlydate-t3").val(data.tvatreturn[0].fields.Tab3_Month);
                                $("#currentyear-t3").val(data.tvatreturn[0].fields.Tab3_Year);
                                let tab3endDate = "";
                                if (data.tvatreturn[0].fields.Tab3_Month != "" && data.tvatreturn[0].fields.Tab3_Year > 0) {
                                    var endMonth3 = (data.tvatreturn[0].fields.Tab3_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tvatreturn[0].fields.Tab3_Month]) / 3) * 3) : (months[data.tvatreturn[0].fields.Tab3_Month]);
                                    tab3endDate = new Date(data.tvatreturn[0].fields.Tab3_Year, (parseInt(endMonth3)), 0);
                                    tab3endDate = moment(tab3endDate).format("YYYY-MM-DD");
                                }
                                $("#endDate-t3").val(tab3endDate);
                                // $("#prt_beginningDateT3").html(data.tvatreturn[0].fields.Tab4_Month + " " + data.tvatreturn[0].fields.Tab4_Year);
                                $("#tax21cost").val(data.tvatreturn[0].fields._21);
                                $("#prt_tax21cost").html("$" + data.tvatreturn[0].fields._21);
                                $("#tax22cost").val(data.tvatreturn[0].fields._22);
                                $("#prt_tax22cost").html("$" + data.tvatreturn[0].fields._22);
                                var tax23cost = parseFloat(data.tvatreturn[0].fields._21) - parseFloat(data.tvatreturn[0].fields._22);
                                $("#tax23cost").val(tax23cost.toFixed(2));
                                $("#prt_tax23cost").html("$" + data.tvatreturn[0].fields._23);
                                var tax24cost = tax23cost * 80 / 100;
                                $("#tax24cost").val(tax24cost.toFixed(2));
                                $("#prt_tax24cost").val(tax24cost.toFixed(2));
                                var tax25cost = tax24cost * 332.8 / 100;
                                $("#tax25cost").val(tax25cost.toFixed(2));
                                $("#prt_tax25cost").val(tax25cost.toFixed(2));
                                var tax28cost = parseFloat(data.tvatreturn[0].fields._26) - parseFloat(data.tvatreturn[0].fields._27);
                                $("#tax28cost").val(tax28cost.toFixed(2));
                                $("#prt_tax28cost").val(tax28cost.toFixed(2));
                                var tax29cost = tax28cost * 562 / 100;
                                $("#tax29cost").val(tax29cost.toFixed(2));
                                $("#prt_tax29cost").val(tax29cost.toFixed(2));
                                var tax32cost = parseFloat(data.tvatreturn[0].fields._30) - parseFloat(data.tvatreturn[0].fields._31);
                                $("#tax32cost").val(tax32cost.toFixed(2));
                                $("#prt_tax32cost").val(tax32cost.toFixed(2));
                                var tax33cost = tax32cost * 207 / 100;
                                $("#tax33cost").val(tax33cost.toFixed(2));
                                $("#prt_tax33cost").val(tax33cost.toFixed(2));
                                var tax36cost = parseFloat(data.tvatreturn[0].fields._34) - parseFloat(data.tvatreturn[0].fields._35);
                                $("#tax36cost").val(tax36cost.toFixed(2));
                                $("#prt_tax36cost").val(tax36cost.toFixed(2));
                                var tax37cost = tax36cost * 384.5 / 100;
                                $("#tax37cost").val(tax37cost.toFixed(2));
                                $("#prt_tax37cost").val(tax37cost.toFixed(2));
                                var tax38cost = tax20cost - (tax25cost + tax29cost + tax33cost + tax37cost);
                                $("#tax38cost").val(tax38cost.toFixed(2));
                                $("#prt_tax38cost").val(tax38cost.toFixed(2));
                            })
                        } else {
                            let data = JSON.parse(dataObject[0].data);
                            for (let i = 0; i < data.tvatreturn.length; i++) {
                                if (getid[1] == data.tvatreturn[i].fields.ID) {
                                    $("#description").val(data.tvatreturn[i].fields.VatSheetDesc);
                                    $("#vatreturnCategory1").prop('checked', data.tvatreturn[i].fields.HasTab1);
                                    $("#vatreturnCategory2").prop('checked', data.tvatreturn[i].fields.HasTab2);
                                    $("#vatreturnCategory3").prop('checked', data.tvatreturn[i].fields.HasTab3);
                                    if (data.tvatreturn[i].fields.HasTab1 == true) {
                                        document.getElementById("tax1").setAttribute("href", "#taxCode1option");
                                        document.getElementById("tax1a").setAttribute("href", "#taxCode1aoption");
                                        document.getElementById("tax2").setAttribute("href", "#taxCode2option");
                                        document.getElementById("tax2a").setAttribute("href", "#taxCode2aoption");
                                        document.getElementById("tax3").setAttribute("href", "#taxCode3option");
                                        $("#tax4cost").attr("disabled", "disabled");
                                        $("#tax4acost").attr("disabled", "disabled");
                                        document.getElementById("tax5").setAttribute("href", "#taxCode5option");
                                        document.getElementById("tax7").setAttribute("href", "#taxCode7option");
                                        document.getElementById("tax10").setAttribute("href", "#taxCode10option");
                                        $("#tax11cost").attr("disabled", "disabled");
                                        document.getElementById("tax12").setAttribute("href", "#taxCode12option");
                                    } else {
                                        document.getElementById("tax1").setAttribute("href", "#");
                                        document.getElementById("tax1a").setAttribute("href", "#");
                                        document.getElementById("tax2").setAttribute("href", "#");
                                        document.getElementById("tax2a").setAttribute("href", "#");
                                        document.getElementById("tax3").setAttribute("href", "#");
                                        $("#tax4cost").attr("disabled", "disabled");
                                        $("#tax4acost").attr("disabled", "disabled");
                                        document.getElementById("tax5").setAttribute("href", "#");
                                        document.getElementById("tax7").setAttribute("href", "#");
                                        document.getElementById("tax10").setAttribute("href", "#");
                                        $("#tax11cost").attr("disabled", "disabled");
                                        document.getElementById("tax12").setAttribute("href", "#");
                                    }
                                    if (data.tvatreturn[i].fields.HasTab2 == true) {
                                        document.getElementById("tax14").setAttribute("href", "#taxCode14option");
                                        document.getElementById("tax14a").setAttribute("href", "#taxCode14aoption");
                                        document.getElementById("tax15").setAttribute("href", "#taxCode15option");
                                        document.getElementById("tax15a").setAttribute("href", "#taxCode15aoption");
                                        document.getElementById("tax16").setAttribute("href", "#taxCode16option");
                                        document.getElementById("tax17").setAttribute("href", "#taxCode17option");
                                        document.getElementById("tax18").setAttribute("href", "#taxCode18option");
                                    } else {
                                        document.getElementById("tax14").setAttribute("href", "#");
                                        document.getElementById("tax14a").setAttribute("href", "#");
                                        document.getElementById("tax15").setAttribute("href", "#");
                                        document.getElementById("tax15a").setAttribute("href", "#");
                                        document.getElementById("tax16").setAttribute("href", "#");
                                        document.getElementById("tax17").setAttribute("href", "#");
                                        document.getElementById("tax18").setAttribute("href", "#");
                                    }
                                    if (data.tvatreturn[i].fields.HasTab3 == true) {
                                        document.getElementById("tax21").setAttribute("href", "#taxCode21option");
                                        document.getElementById("tax22").setAttribute("href", "#taxCode22option");
                                        document.getElementById("tax26").setAttribute("href", "#taxCode26option");
                                        document.getElementById("tax27").setAttribute("href", "#taxCode27option");
                                        document.getElementById("tax30").setAttribute("href", "#taxCode30option");
                                        document.getElementById("tax31").setAttribute("href", "#taxCode31option");
                                        document.getElementById("tax34").setAttribute("href", "#taxCode34option");
                                        document.getElementById("tax35").setAttribute("href", "#taxCode35option");
                                    } else {
                                        document.getElementById("tax21").setAttribute("href", "#taxCode21option");
                                        document.getElementById("tax22").setAttribute("href", "#taxCode22option");
                                        document.getElementById("tax26").setAttribute("href", "#taxCode26option");
                                        document.getElementById("tax27").setAttribute("href", "#taxCode27option");
                                        document.getElementById("tax30").setAttribute("href", "#taxCode30option");
                                        document.getElementById("tax31").setAttribute("href", "#taxCode31option");
                                        document.getElementById("tax34").setAttribute("href", "#taxCode34option");
                                        document.getElementById("tax35").setAttribute("href", "#taxCode35option");
                                    }

                                    if (data.tvatreturn[i].fields.ClassID > 0) {
                                        for (var j = 0; j < deptrecords.length; j++) {
                                            if (deptrecords[j].id == data.tvatreturn[i].fields.ClassID) {
                                                $("#sltDepartment").val(deptrecords[j].department);
                                                $("#sltDepartmentID").val(deptrecords[j].id);
                                            }
                                        }
                                    }
                                    if (data.tvatreturn[i].fields.AllClass == true) {
                                        $("#allDepart").prop('checked', true);
                                    } else {
                                        $("#allDepart").prop('checked', false);
                                    }
                                    if (data.tvatreturn[i].fields.AccMethod == "Accrual") {
                                        $("#accountingmethod1").prop('checked', true);
                                        $("#accountingmethod2").prop('checked', false);
                                    } else {
                                        $("#accountingmethod1").prop('checked', false);
                                        $("#accountingmethod2").prop('checked', true);
                                    }
                                    $("#prt_accountingMethod").html(data.tvatreturn[i].AccMethod);
                                    if (data.tvatreturn[i].fields.Tab1_Type == "Quarterly") {
                                        $("#datemethod1").prop('checked', true);
                                        $("#datemethod2").prop('checked', false);
                                    } else {
                                        $("#datemethod1").prop('checked', false);
                                        $("#datemethod2").prop('checked', true);
                                    }
                                    $("#beginmonthlydate").val(data.tvatreturn[i].fields.Tab1_Month);
                                    $("#currentyear").val(data.tvatreturn[i].fields.Tab1_Year);
                                    let tab1endDate = "";
                                    if (data.tvatreturn[i].fields.Tab1_Month != "" && data.tvatreturn[i].fields.Tab1_Year > 0) {
                                        var endMonth = (data.tvatreturn[i].fields.Tab1_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tvatreturn[i].fields.Tab1_Month]) / 3) * 3) : (months[data.tvatreturn[i].fields.Tab1_Month]);
                                        tab1endDate = new Date(data.tvatreturn[i].fields.Tab1_Year, (parseInt(endMonth)), 0);
                                        tab1endDate = moment(tab1endDate).format("YYYY-MM-DD");
                                    }
                                    $("#endDate").val(tab1endDate);
                                    $("#prt_beginningDate").html(data.tvatreturn[i].fields.Tab1_Month + " " + data.tvatreturn[i].fields.Tab1_Year);
                                    $("#tax1cost").val(data.tvatreturn[i].fields._1);
                                    $(".prt_tax1cost").html("$" + data.tvatreturn[i].fields._1);
                                    $("#tax1acost").val(data.tvatreturn[i].fields._1A);
                                    $("#prt_tax1acost").html("$" + data.tvatreturn[i].fields._1A);
                                    $("#tax2cost").val(data.tvatreturn[i].fields._2);
                                    $("#prt_tax2cost").html("$" + data.tvatreturn[i].fields._2);
                                    $("#tax2acost").val(data.tvatreturn[i].fields._2A);
                                    $("#prt_tax2acost").html("$" + data.tvatreturn[i].fields._2A);
                                    $("#tax3cost").val(data.tvatreturn[i].fields._3);
                                    $("#prt_tax3cost").html("$" + data.tvatreturn[i].fields._3);
                                    $("#tax4cost").val(data.tvatreturn[i].fields._4);
                                    $("#prt_tax4cost").html("$" + data.tvatreturn[i].fields._4);
                                    $("#tax4acost").val(data.tvatreturn[i].fields._4A);
                                    $("#prt_tax4acost").html("$" + data.tvatreturn[i].fields._4A);
                                    $("#tax5cost").val(data.tvatreturn[i].fields._5);
                                    $("#prt_tax5cost").html("$" + data.tvatreturn[i].fields._5);
                                    $("#tax7cost").val(data.tvatreturn[i].fields._7);
                                    $("#prt_tax7cost").html("$" + data.tvatreturn[i].fields._7);
                                    $("#tax10cost").val(data.tvatreturn[i].fields._10);
                                    $("#prt_tax10cost").html("$" + data.tvatreturn[i].fields._10);
                                    $("#tax11cost").val(data.tvatreturn[i].fields._11);
                                    $("#prt_tax11cost").html("$" + data.tvatreturn[i].fields._11);
                                    $("#tax12cost").val(data.tvatreturn[i].fields._12);
                                    $("#prt_tax12cost").html("$" + data.tvatreturn[i].fields._12);
                                    let tax13cost = data.tvatreturn[i].fields._4 + data.tvatreturn[i].fields._4A + data.tvatreturn[i].fields._9 + data.tvatreturn[i].fields._11 + data.tvatreturn[i].fields._12;
                                    $("#tax13cost").val(tax13cost);
                                    $("#prt_tax13cost").html("$" + tax13cost);

                                    shareFunctionByName.initTable(data.tvatreturn[i].fields._1Selected, "tbltaxCodeCheckbox_1");
                                    shareFunctionByName.initTable(data.tvatreturn[i].fields._1ASelected, "tbltaxCodeCheckbox_1A");
                                    shareFunctionByName.initTable(data.tvatreturn[i].fields._2Selected, "tbltaxCodeCheckbox_2");
                                    shareFunctionByName.initTable(data.tvatreturn[i].fields._2ASelected, "tbltaxCodeCheckbox_2A");
                                    shareFunctionByName.initTable(data.tvatreturn[i].fields._3Selected, "tbltaxCodeCheckbox_3");
                                    shareFunctionByName.initTable(data.tvatreturn[i].fields._5Selected, "tbltaxCodeCheckbox_5");
                                    shareFunctionByName.initTable(data.tvatreturn[i].fields._7Selected, "tbltaxCodeCheckbox_7");
                                    shareFunctionByName.initTable(data.tvatreturn[i].fields._10Selected, "tbltaxCodeCheckbox_10");
                                    shareFunctionByName.initTable(data.tvatreturn[i].fields._12Selected, "tbltaxCodeCheckbox_12");
                                    shareFunctionByName.initTable(data.tvatreturn[i].fields._14Selected, "tbltaxCodeCheckbox_14");
                                    shareFunctionByName.initTable(data.tvatreturn[i].fields._14ASelected, "tbltaxCodeCheckbox_14A");
                                    shareFunctionByName.initTable(data.tvatreturn[i].fields._15Selected, "tbltaxCodeCheckbox_15");
                                    shareFunctionByName.initTable(data.tvatreturn[i].fields._15ASelected, "tbltaxCodeCheckbox_15A");
                                    shareFunctionByName.initTable(data.tvatreturn[i].fields._16Selected, "tbltaxCodeCheckbox_16");
                                    shareFunctionByName.initTable(data.tvatreturn[i].fields._17Selected, "tbltaxCodeCheckbox_17");
                                    shareFunctionByName.initTable(data.tvatreturn[i].fields._18Selected, "tbltaxCodeCheckbox_18");
                                    shareFunctionByName.initTable(data.tvatreturn[i].fields._21Selected, "tbltaxCodeCheckbox_21");
                                    shareFunctionByName.initTable(data.tvatreturn[i].fields._22Selected, "tbltaxCodeCheckbox_22");
                                    shareFunctionByName.initTable(data.tvatreturn[i].fields._26Selected, "tbltaxCodeCheckbox_26");
                                    shareFunctionByName.initTable(data.tvatreturn[i].fields._27Selected, "tbltaxCodeCheckbox_27");
                                    shareFunctionByName.initTable(data.tvatreturn[i].fields._30Selected, "tbltaxCodeCheckbox_30");
                                    shareFunctionByName.initTable(data.tvatreturn[i].fields._31Selected, "tbltaxCodeCheckbox_31");
                                    shareFunctionByName.initTable(data.tvatreturn[i].fields._34Selected, "tbltaxCodeCheckbox_34");
                                    shareFunctionByName.initTable(data.tvatreturn[i].fields._35Selected, "tbltaxCodeCheckbox_35");
                                    if (data.tvatreturn[i].fields.Tab2_Type == "Quarterly") {
                                        $("#datemethod1-t2").prop('checked', true);
                                        $("#datemethod2-t2").prop('checked', false);
                                    } else {
                                        $("#datemethod1-t2").prop('checked', false);
                                        $("#datemethod2-t2").prop('checked', true);
                                    }
                                    $("#beginmonthlydate-t2").val(data.tvatreturn[i].fields.Tab2_Month);
                                    $("#currentyear-t2").val(data.tvatreturn[i].fields.Tab2_Year);
                                    let tab2endDate = "";
                                    if (data.tvatreturn[i].fields.Tab2_Month != "" && data.tvatreturn[i].fields.Tab2_Year > 0) {
                                        var endMonth2 = (data.tvatreturn[i].fields.Tab2_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tvatreturn[i].fields.Tab2_Month]) / 3) * 3) : (months[data.tvatreturn[i].fields.Tab2_Month]);
                                        tab2endDate = new Date(data.tvatreturn[i].fields.Tab2_Year, (parseInt(endMonth2)), 0);
                                        tab2endDate = moment(tab2endDate).format("YYYY-MM-DD");
                                    }
                                    $("#endDate-t2").val(tab2endDate);
                                    // $("#prt_beginningDateT2").html(data.tvatreturn[0].fields.Tab2_Month + " " + data.tvatreturn[0].fields.Tab2_Year);
                                    $("#tax14cost").val(data.tvatreturn[i].fields._14);
                                    $("#prt_tax14cost").html("$" + data.tvatreturn[i].fields._14);
                                    $("#tax14acost").val(data.tvatreturn[i].fields._14A);
                                    $("#prt_tax14acost").html("$" + data.tvatreturn[i].fields._14A);
                                    $("#tax15cost").val(data.tvatreturn[i].fields._15);
                                    $("#prt_tax15cost").html("$" + data.tvatreturn[i].fields._15);
                                    $("#tax15acost").val(data.tvatreturn[i].fields._15A);
                                    // $("#prt_tax15acost").html("$" + data.tvatreturn[i].fields._15A);
                                    $("#tax16cost").val(data.tvatreturn[i].fields._16);
                                    // $("#prt_tax16cost").html("$" + data.tvatreturn[i].fields._16);
                                    $("#tax17cost").val(data.tvatreturn[i].fields._17);
                                    // $("#prt_tax17cost").html("$" + data.tvatreturn[i].fields._17);
                                    $("#tax18cost").val(data.tvatreturn[i].fields._18);
                                    // $("#prt_tax18cost").html("$" + data.tvatreturn[i].fields._18);
                                    let tax19cost = data.tvatreturn[i].fields._14 + data.tvatreturn[i].fields._14A + data.tvatreturn[i].fields._15 + data.tvatreturn[i].fields._15A + data.tvatreturn[i].fields._16 + data.tvatreturn[i].fields._17 + data.tvatreturn[i].fields._18;
                                    $("#tax19cost").val(tax19cost);
                                    $("#prt_tax19cost").html("$" + tax19cost);
                                    let tax20cost = tax13cost - tax19cost;
                                    $("#tax20cost").val(tax20cost);
                                    $("#prt_tax20cost").html("$" + tax20cost);
                                    if (data.tvatreturn[i].fields.Tab3_Type == "Quarterly") {
                                        $("#datemethod1-t3").prop('checked', true);
                                        $("#datemethod2-t3").prop('checked', false);
                                    } else {
                                        $("#datemethod1-t3").prop('checked', false);
                                        $("#datemethod2-t3").prop('checked', true);
                                    }
                                    $("#beginmonthlydate-t3").val(data.tvatreturn[i].fields.Tab3_Month);
                                    $("#currentyear-t3").val(data.tvatreturn[i].fields.Tab3_Year);
                                    let tab3endDate = "";
                                    if (data.tvatreturn[i].fields.Tab3_Month != "" && data.tvatreturn[i].fields.Tab3_Year > 0) {
                                        var endMonth3 = (data.tvatreturn[i].fields.Tab3_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tvatreturn[i].fields.Tab3_Month]) / 3) * 3) : (months[data.tvatreturn[i].fields.Tab3_Month]);
                                        tab3endDate = new Date(data.tvatreturn[i].fields.Tab3_Year, (parseInt(endMonth3)), 0);
                                        tab3endDate = moment(tab3endDate).format("YYYY-MM-DD");
                                    }
                                    $("#endDate-t3").val(tab3endDate);
                                    // $("#prt_beginningDateT3").html(data.tvatreturn[i].fields.Tab4_Month + " " + data.tvatreturn[i].fields.Tab4_Year);
                                    $("#tax21cost").val(data.tvatreturn[i].fields._21);
                                    $("#prt_tax21cost").html("$" + data.tvatreturn[i].fields._21);
                                    $("#tax22cost").val(data.tvatreturn[i].fields._22);
                                    $("#prt_tax22cost").html("$" + data.tvatreturn[i].fields._22);
                                    var tax23cost = parseFloat(data.tvatreturn[i].fields._21) - parseFloat(data.tvatreturn[i].fields._22);
                                    $("#tax23cost").val(tax23cost.toFixed(2));
                                    $("#prt_tax23cost").html("$" + data.tvatreturn[i].fields._23);
                                    var tax24cost = tax23cost * 80 / 100;
                                    $("#tax24cost").val(tax24cost.toFixed(2));
                                    $("#prt_tax24cost").val(tax24cost.toFixed(2));
                                    var tax25cost = tax24cost * 332.8 / 100;
                                    $("#tax25cost").val(tax25cost.toFixed(2));
                                    $("#prt_tax25cost").val(tax25cost.toFixed(2));
                                    var tax28cost = parseFloat(data.tvatreturn[i].fields._26) - parseFloat(data.tvatreturn[i].fields._27);
                                    $("#tax28cost").val(tax28cost.toFixed(2));
                                    $("#prt_tax28cost").val(tax28cost.toFixed(2));
                                    var tax29cost = tax28cost * 562 / 100;
                                    $("#tax29cost").val(tax29cost.toFixed(2));
                                    $("#prt_tax29cost").val(tax29cost.toFixed(2));
                                    var tax32cost = parseFloat(data.tvatreturn[i].fields._30) - parseFloat(data.tvatreturn[i].fields._31);
                                    $("#tax32cost").val(tax32cost.toFixed(2));
                                    $("#prt_tax32cost").val(tax32cost.toFixed(2));
                                    var tax33cost = tax32cost * 207 / 100;
                                    $("#tax33cost").val(tax33cost.toFixed(2));
                                    $("#prt_tax33cost").val(tax33cost.toFixed(2));
                                    var tax36cost = parseFloat(data.tvatreturn[i].fields._34) - parseFloat(data.tvatreturn[i].fields._35);
                                    $("#tax36cost").val(tax36cost.toFixed(2));
                                    $("#prt_tax36cost").val(tax36cost.toFixed(2));
                                    var tax37cost = tax36cost * 384.5 / 100;
                                    $("#tax37cost").val(tax37cost.toFixed(2));
                                    $("#prt_tax37cost").val(tax37cost.toFixed(2));
                                    var tax38cost = tax20cost - (tax25cost + tax29cost + tax33cost + tax37cost);
                                    $("#tax38cost").val(tax38cost.toFixed(2));
                                    $("#prt_tax38cost").val(tax38cost.toFixed(2));
                                }
                            }
                        }
                    }).catch(function(err) {
                        let taxRateList = templateObject.taxRateList.get();
                        let deptrecords = templateObject.deptrecords.get();
                        reportService.getOneVATReturn(getid[1]).then(function(data) {
                            $("#description").val(data.tvatreturn[0].fields.VatSheetDesc);
                            $("#vatreturnCategory1").prop('checked', data.tvatreturn[0].fields.HasTab1);
                            $("#vatreturnCategory2").prop('checked', data.tvatreturn[0].fields.HasTab2);
                            $("#vatreturnCategory3").prop('checked', data.tvatreturn[0].fields.HasTab3);
                            if (data.tvatreturn[0].fields.HasTab1 == true) {
                                document.getElementById("tax1").setAttribute("href", "#taxCode1option");
                                document.getElementById("tax1a").setAttribute("href", "#taxCode1aoption");
                                document.getElementById("tax2").setAttribute("href", "#taxCode2option");
                                document.getElementById("tax2a").setAttribute("href", "#taxCode2aoption");
                                document.getElementById("tax3").setAttribute("href", "#taxCode3option");
                                $("#tax4cost").attr("disabled", "disabled");
                                $("#tax4acost").attr("disabled", "disabled");
                                document.getElementById("tax5").setAttribute("href", "#taxCode5option");
                                document.getElementById("tax7").setAttribute("href", "#taxCode7option");
                                document.getElementById("tax10").setAttribute("href", "#taxCode10option");
                                $("#tax11cost").attr("disabled", "disabled");
                                document.getElementById("tax12").setAttribute("href", "#taxCode12option");
                            } else {
                                document.getElementById("tax1").setAttribute("href", "#");
                                document.getElementById("tax1a").setAttribute("href", "#");
                                document.getElementById("tax2").setAttribute("href", "#");
                                document.getElementById("tax2a").setAttribute("href", "#");
                                document.getElementById("tax3").setAttribute("href", "#");
                                $("#tax4cost").attr("disabled", "disabled");
                                $("#tax4acost").attr("disabled", "disabled");
                                document.getElementById("tax5").setAttribute("href", "#");
                                document.getElementById("tax7").setAttribute("href", "#");
                                document.getElementById("tax10").setAttribute("href", "#");
                                $("#tax11cost").attr("disabled", "disabled");
                                document.getElementById("tax12").setAttribute("href", "#");
                            }
                            if (data.tvatreturn[0].fields.HasTab2 == true) {
                                document.getElementById("tax14").setAttribute("href", "#taxCode14option");
                                document.getElementById("tax14a").setAttribute("href", "#taxCode14aoption");
                                document.getElementById("tax15").setAttribute("href", "#taxCode15option");
                                document.getElementById("tax15a").setAttribute("href", "#taxCode15aoption");
                                document.getElementById("tax16").setAttribute("href", "#taxCode16option");
                                document.getElementById("tax17").setAttribute("href", "#taxCode17option");
                                document.getElementById("tax18").setAttribute("href", "#taxCode18option");
                            } else {
                                document.getElementById("tax14").setAttribute("href", "#");
                                document.getElementById("tax14a").setAttribute("href", "#");
                                document.getElementById("tax15").setAttribute("href", "#");
                                document.getElementById("tax15a").setAttribute("href", "#");
                                document.getElementById("tax16").setAttribute("href", "#");
                                document.getElementById("tax17").setAttribute("href", "#");
                                document.getElementById("tax18").setAttribute("href", "#");
                            }
                            if (data.tvatreturn[0].fields.HasTab3 == true) {
                                document.getElementById("tax21").setAttribute("href", "#taxCode21option");
                                document.getElementById("tax22").setAttribute("href", "#taxCode22option");
                                document.getElementById("tax26").setAttribute("href", "#taxCode26option");
                                document.getElementById("tax27").setAttribute("href", "#taxCode27option");
                                document.getElementById("tax30").setAttribute("href", "#taxCode30option");
                                document.getElementById("tax31").setAttribute("href", "#taxCode31option");
                                document.getElementById("tax34").setAttribute("href", "#taxCode34option");
                                document.getElementById("tax35").setAttribute("href", "#taxCode35option");
                            } else {
                                document.getElementById("tax21").setAttribute("href", "#taxCode21option");
                                document.getElementById("tax22").setAttribute("href", "#taxCode22option");
                                document.getElementById("tax26").setAttribute("href", "#taxCode26option");
                                document.getElementById("tax27").setAttribute("href", "#taxCode27option");
                                document.getElementById("tax30").setAttribute("href", "#taxCode30option");
                                document.getElementById("tax31").setAttribute("href", "#taxCode31option");
                                document.getElementById("tax34").setAttribute("href", "#taxCode34option");
                                document.getElementById("tax35").setAttribute("href", "#taxCode35option");
                            }

                            if (data.tvatreturn[0].fields.ClassID > 0) {
                                for (var i = 0; i < deptrecords.length; i++) {
                                    if (deptrecords[i].id == data.tvatreturn[0].fields.ClassID) {
                                        $("#sltDepartment").val(deptrecords[i].department);
                                        $("#sltDepartmentID").val(deptrecords[i].id);
                                    }
                                }
                            }
                            if (data.tvatreturn[0].fields.AllClass == true) {
                                $("#allDepart").prop('checked', true);
                            } else {
                                $("#allDepart").prop('checked', false);
                            }
                            if (data.tvatreturn[0].fields.AccMethod == "Accrual") {
                                $("#accountingmethod1").prop('checked', true);
                                $("#accountingmethod2").prop('checked', false);
                            } else {
                                $("#accountingmethod1").prop('checked', false);
                                $("#accountingmethod2").prop('checked', true);
                            }
                            $("#prt_accountingMethod").html(data.tvatreturn[0].AccMethod);
                            if (data.tvatreturn[0].fields.Tab1_Type == "Quarterly") {
                                $("#datemethod1").prop('checked', true);
                                $("#datemethod2").prop('checked', false);
                            } else {
                                $("#datemethod1").prop('checked', false);
                                $("#datemethod2").prop('checked', true);
                            }
                            $("#beginmonthlydate").val(data.tvatreturn[0].fields.Tab1_Month);
                            $("#currentyear").val(data.tvatreturn[0].fields.Tab1_Year);
                            let tab1endDate = "";
                            if (data.tvatreturn[0].fields.Tab1_Month != "" && data.tvatreturn[0].fields.Tab1_Year > 0) {
                                var endMonth = (data.tvatreturn[0].fields.Tab1_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tvatreturn[0].fields.Tab1_Month]) / 3) * 3) : (months[data.tvatreturn[0].fields.Tab1_Month]);
                                tab1endDate = new Date(data.tvatreturn[0].fields.Tab1_Year, (parseInt(endMonth)), 0);
                                tab1endDate = moment(tab1endDate).format("YYYY-MM-DD");
                            }
                            $("#endDate").val(tab1endDate);
                            $("#prt_beginningDate").html(data.tvatreturn[0].fields.Tab1_Month + " " + data.tvatreturn[0].fields.Tab1_Year);
                            $("#tax1cost").val(data.tvatreturn[0].fields._1);
                            $(".prt_tax1cost").html("$" + data.tvatreturn[0].fields._1);
                            $("#tax1acost").val(data.tvatreturn[0].fields._1A);
                            $("#prt_tax1acost").html("$" + data.tvatreturn[0].fields._1A);
                            $("#tax2cost").val(data.tvatreturn[0].fields._2);
                            $("#prt_tax2cost").html("$" + data.tvatreturn[0].fields._2);
                            $("#tax2acost").val(data.tvatreturn[0].fields._2A);
                            $("#prt_tax2acost").html("$" + data.tvatreturn[0].fields._2A);
                            $("#tax3cost").val(data.tvatreturn[0].fields._3);
                            $("#prt_tax3cost").html("$" + data.tvatreturn[0].fields._3);
                            $("#tax4cost").val(data.tvatreturn[0].fields._4);
                            $("#prt_tax4cost").html("$" + data.tvatreturn[0].fields._4);
                            $("#tax4acost").val(data.tvatreturn[0].fields._4A);
                            $("#prt_tax4acost").html("$" + data.tvatreturn[0].fields._4A);
                            $("#tax5cost").val(data.tvatreturn[0].fields._5);
                            $("#prt_tax5cost").html("$" + data.tvatreturn[0].fields._5);
                            $("#tax7cost").val(data.tvatreturn[0].fields._7);
                            $("#prt_tax7cost").html("$" + data.tvatreturn[0].fields._7);
                            $("#tax10cost").val(data.tvatreturn[0].fields._10);
                            $("#prt_tax10cost").html("$" + data.tvatreturn[0].fields._10);
                            $("#tax11cost").val(data.tvatreturn[0].fields._11);
                            $("#prt_tax11cost").html("$" + data.tvatreturn[0].fields._11);
                            $("#tax12cost").val(data.tvatreturn[0].fields._12);
                            $("#prt_tax12cost").html("$" + data.tvatreturn[0].fields._12);
                            let tax13cost = data.tvatreturn[0].fields._4 + data.tvatreturn[0].fields._4A + data.tvatreturn[0].fields._9 + data.tvatreturn[0].fields._11 + data.tvatreturn[0].fields._12;
                            $("#tax13cost").val(tax13cost);
                            $("#prt_tax13cost").html("$" + tax13cost);

                            shareFunctionByName.initTable(data.tvatreturn[0].fields._1Selected, "tbltaxCodeCheckbox_1");
                            shareFunctionByName.initTable(data.tvatreturn[0].fields._1ASelected, "tbltaxCodeCheckbox_1A");
                            shareFunctionByName.initTable(data.tvatreturn[0].fields._2Selected, "tbltaxCodeCheckbox_2");
                            shareFunctionByName.initTable(data.tvatreturn[0].fields._2ASelected, "tbltaxCodeCheckbox_2A");
                            shareFunctionByName.initTable(data.tvatreturn[0].fields._3Selected, "tbltaxCodeCheckbox_3");
                            shareFunctionByName.initTable(data.tvatreturn[0].fields._5Selected, "tbltaxCodeCheckbox_5");
                            shareFunctionByName.initTable(data.tvatreturn[0].fields._7Selected, "tbltaxCodeCheckbox_7");
                            shareFunctionByName.initTable(data.tvatreturn[0].fields._10Selected, "tbltaxCodeCheckbox_10");
                            shareFunctionByName.initTable(data.tvatreturn[0].fields._12Selected, "tbltaxCodeCheckbox_12");
                            shareFunctionByName.initTable(data.tvatreturn[0].fields._14Selected, "tbltaxCodeCheckbox_14");
                            shareFunctionByName.initTable(data.tvatreturn[0].fields._14ASelected, "tbltaxCodeCheckbox_14A");
                            shareFunctionByName.initTable(data.tvatreturn[0].fields._15Selected, "tbltaxCodeCheckbox_15");
                            shareFunctionByName.initTable(data.tvatreturn[0].fields._15ASelected, "tbltaxCodeCheckbox_15A");
                            shareFunctionByName.initTable(data.tvatreturn[0].fields._16Selected, "tbltaxCodeCheckbox_16");
                            shareFunctionByName.initTable(data.tvatreturn[0].fields._17Selected, "tbltaxCodeCheckbox_17");
                            shareFunctionByName.initTable(data.tvatreturn[0].fields._18Selected, "tbltaxCodeCheckbox_18");
                            shareFunctionByName.initTable(data.tvatreturn[0].fields._21Selected, "tbltaxCodeCheckbox_21");
                            shareFunctionByName.initTable(data.tvatreturn[0].fields._22Selected, "tbltaxCodeCheckbox_22");
                            shareFunctionByName.initTable(data.tvatreturn[0].fields._26Selected, "tbltaxCodeCheckbox_26");
                            shareFunctionByName.initTable(data.tvatreturn[0].fields._27Selected, "tbltaxCodeCheckbox_27");
                            shareFunctionByName.initTable(data.tvatreturn[0].fields._30Selected, "tbltaxCodeCheckbox_30");
                            shareFunctionByName.initTable(data.tvatreturn[0].fields._31Selected, "tbltaxCodeCheckbox_31");
                            shareFunctionByName.initTable(data.tvatreturn[0].fields._34Selected, "tbltaxCodeCheckbox_34");
                            shareFunctionByName.initTable(data.tvatreturn[0].fields._35Selected, "tbltaxCodeCheckbox_35");
                            if (data.tvatreturn[0].fields.Tab2_Type == "Quarterly") {
                                $("#datemethod1-t2").prop('checked', true);
                                $("#datemethod2-t2").prop('checked', false);
                            } else {
                                $("#datemethod1-t2").prop('checked', false);
                                $("#datemethod2-t2").prop('checked', true);
                            }
                            $("#beginmonthlydate-t2").val(data.tvatreturn[0].fields.Tab2_Month);
                            $("#currentyear-t2").val(data.tvatreturn[0].fields.Tab2_Year);
                            let tab2endDate = "";
                            if (data.tvatreturn[0].fields.Tab2_Month != "" && data.tvatreturn[0].fields.Tab2_Year > 0) {
                                var endMonth2 = (data.tvatreturn[0].fields.Tab2_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tvatreturn[0].fields.Tab2_Month]) / 3) * 3) : (months[data.tvatreturn[0].fields.Tab2_Month]);
                                tab2endDate = new Date(data.tvatreturn[0].fields.Tab2_Year, (parseInt(endMonth2)), 0);
                                tab2endDate = moment(tab2endDate).format("YYYY-MM-DD");
                            }
                            $("#endDate-t2").val(tab2endDate);
                            // $("#prt_beginningDateT2").html(data.tvatreturn[0].fields.Tab2_Month + " " + data.tvatreturn[0].fields.Tab2_Year);
                            $("#tax14cost").val(data.tvatreturn[0].fields._14);
                            $("#prt_tax14cost").html("$" + data.tvatreturn[0].fields._14);
                            $("#tax14acost").val(data.tvatreturn[0].fields._14A);
                            $("#prt_tax14acost").html("$" + data.tvatreturn[0].fields._14A);
                            $("#tax15cost").val(data.tvatreturn[0].fields._15);
                            $("#prt_tax15cost").html("$" + data.tvatreturn[0].fields._15);
                            $("#tax15acost").val(data.tvatreturn[0].fields._15A);
                            // $("#prt_tax15acost").html("$" + data.tvatreturn[0].fields._15A);
                            $("#tax16cost").val(data.tvatreturn[0].fields._16);
                            // $("#prt_tax16cost").html("$" + data.tvatreturn[0].fields._16);
                            $("#tax17cost").val(data.tvatreturn[0].fields._17);
                            // $("#prt_tax17cost").html("$" + data.tvatreturn[0].fields._17);
                            $("#tax18cost").val(data.tvatreturn[0].fields._18);
                            // $("#prt_tax18cost").html("$" + data.tvatreturn[0].fields._18);
                            let tax19cost = data.tvatreturn[0].fields._14 + data.tvatreturn[0].fields._14A + data.tvatreturn[0].fields._15 + data.tvatreturn[0].fields._15A + data.tvatreturn[0].fields._16 + data.tvatreturn[0].fields._17 + data.tvatreturn[0].fields._18;
                            $("#tax19cost").val(tax19cost);
                            $("#prt_tax19cost").html("$" + tax19cost);
                            let tax20cost = tax13cost - tax19cost;
                            $("#tax20cost").val(tax20cost);
                            $("#prt_tax20cost").html("$" + tax20cost);
                            if (data.tvatreturn[0].fields.Tab3_Type == "Quarterly") {
                                $("#datemethod1-t3").prop('checked', true);
                                $("#datemethod2-t3").prop('checked', false);
                            } else {
                                $("#datemethod1-t3").prop('checked', false);
                                $("#datemethod2-t3").prop('checked', true);
                            }
                            $("#beginmonthlydate-t3").val(data.tvatreturn[0].fields.Tab3_Month);
                            $("#currentyear-t3").val(data.tvatreturn[0].fields.Tab3_Year);
                            let tab3endDate = "";
                            if (data.tvatreturn[0].fields.Tab3_Month != "" && data.tvatreturn[0].fields.Tab3_Year > 0) {
                                var endMonth3 = (data.tvatreturn[0].fields.Tab3_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tvatreturn[0].fields.Tab3_Month]) / 3) * 3) : (months[data.tvatreturn[0].fields.Tab3_Month]);
                                tab3endDate = new Date(data.tvatreturn[0].fields.Tab3_Year, (parseInt(endMonth3)), 0);
                                tab3endDate = moment(tab3endDate).format("YYYY-MM-DD");
                            }
                            $("#endDate-t3").val(tab3endDate);
                            // $("#prt_beginningDateT3").html(data.tvatreturn[0].fields.Tab4_Month + " " + data.tvatreturn[0].fields.Tab4_Year);
                            $("#tax21cost").val(data.tvatreturn[0].fields._21);
                            $("#prt_tax21cost").html("$" + data.tvatreturn[0].fields._21);
                            $("#tax22cost").val(data.tvatreturn[0].fields._22);
                            $("#prt_tax22cost").html("$" + data.tvatreturn[0].fields._22);
                            var tax23cost = parseFloat(data.tvatreturn[0].fields._21) - parseFloat(data.tvatreturn[0].fields._22);
                            $("#tax23cost").val(tax23cost.toFixed(2));
                            $("#prt_tax23cost").html("$" + data.tvatreturn[0].fields._23);
                            var tax24cost = tax23cost * 80 / 100;
                            $("#tax24cost").val(tax24cost.toFixed(2));
                            $("#prt_tax24cost").val(tax24cost.toFixed(2));
                            var tax25cost = tax24cost * 332.8 / 100;
                            $("#tax25cost").val(tax25cost.toFixed(2));
                            $("#prt_tax25cost").val(tax25cost.toFixed(2));
                            var tax28cost = parseFloat(data.tvatreturn[0].fields._26) - parseFloat(data.tvatreturn[0].fields._27);
                            $("#tax28cost").val(tax28cost.toFixed(2));
                            $("#prt_tax28cost").val(tax28cost.toFixed(2));
                            var tax29cost = tax28cost * 562 / 100;
                            $("#tax29cost").val(tax29cost.toFixed(2));
                            $("#prt_tax29cost").val(tax29cost.toFixed(2));
                            var tax32cost = parseFloat(data.tvatreturn[0].fields._30) - parseFloat(data.tvatreturn[0].fields._31);
                            $("#tax32cost").val(tax32cost.toFixed(2));
                            $("#prt_tax32cost").val(tax32cost.toFixed(2));
                            var tax33cost = tax32cost * 207 / 100;
                            $("#tax33cost").val(tax33cost.toFixed(2));
                            $("#prt_tax33cost").val(tax33cost.toFixed(2));
                            var tax36cost = parseFloat(data.tvatreturn[0].fields._34) - parseFloat(data.tvatreturn[0].fields._35);
                            $("#tax36cost").val(tax36cost.toFixed(2));
                            $("#prt_tax36cost").val(tax36cost.toFixed(2));
                            var tax37cost = tax36cost * 384.5 / 100;
                            $("#tax37cost").val(tax37cost.toFixed(2));
                            $("#prt_tax37cost").val(tax37cost.toFixed(2));
                            var tax38cost = tax20cost - (tax25cost + tax29cost + tax33cost + tax37cost);
                            $("#tax38cost").val(tax38cost.toFixed(2));
                            $("#prt_tax38cost").val(tax38cost.toFixed(2));
                        }).catch(function(err) {
                            $('.fullScreenSpin').css('display', 'none');
                        })
                    });
                }
            } else {
                templateObject.pageTitle.set("New VAT Return");
            }

            $(document).on("click", "#vatreturnCategory1", function(e) {
                if ($("#vatreturnCategory1").prop('checked') == true) {
                    document.getElementById("tax1").setAttribute("href", "#taxCode1option");
                    document.getElementById("tax1a").setAttribute("href", "#taxCode1aoption");
                    document.getElementById("tax2").setAttribute("href", "#taxCode2option");
                    document.getElementById("tax2a").setAttribute("href", "#taxCode2aoption");
                    document.getElementById("tax3").setAttribute("href", "#taxCode3option");
                    document.getElementById("tax5").setAttribute("href", "#taxCode5option");
                    document.getElementById("tax7").setAttribute("href", "#taxCode7option");
                    document.getElementById("tax10").setAttribute("href", "#taxCode10option");
                    document.getElementById("tax12").setAttribute("href", "#taxCode12option");

                    $("#tax4cost").removeAttr("disabled");
                    $("#tax4acost").removeAttr("disabled");
                    $("#tax11cost").removeAttr("disabled");
                } else {
                    document.getElementById("tax1").setAttribute("href", "#");
                    document.getElementById("tax1a").setAttribute("href", "#");
                    document.getElementById("tax2").setAttribute("href", "#");
                    document.getElementById("tax2a").setAttribute("href", "#");
                    document.getElementById("tax3").setAttribute("href", "#");
                    document.getElementById("tax5").setAttribute("href", "#");
                    document.getElementById("tax7").setAttribute("href", "#");
                    document.getElementById("tax10").setAttribute("href", "#");
                    document.getElementById("tax12").setAttribute("href", "#");

                    $("#tax4cost").attr("disabled", "disabled");
                    $("#tax4acost").attr("disabled", "disabled");
                    $("#tax11cost").attr("disabled", "disabled");
                }
            });

            $(document).on("click", "#vatreturnCategory2", function(e) {
                if ($("#vatreturnCategory2").prop('checked') == true) {
                    document.getElementById("tax14").setAttribute("href", "#taxCode14option");
                    document.getElementById("tax14a").setAttribute("href", "#taxCode14aoption");
                    document.getElementById("tax15").setAttribute("href", "#taxCode15option");
                    document.getElementById("tax15a").setAttribute("href", "#taxCode15aoption");
                    document.getElementById("tax16").setAttribute("href", "#taxCode16option");
                    document.getElementById("tax17").setAttribute("href", "#taxCode17option");
                    document.getElementById("tax18").setAttribute("href", "#taxCode18option");
                } else {
                    document.getElementById("tax14").setAttribute("href", "#");
                    document.getElementById("tax14a").setAttribute("href", "#");
                    document.getElementById("tax15").setAttribute("href", "#");
                    document.getElementById("tax15a").setAttribute("href", "#");
                    document.getElementById("tax16").setAttribute("href", "#");
                    document.getElementById("tax17").setAttribute("href", "#");
                    document.getElementById("tax18").setAttribute("href", "#");
                }
            });

            $(document).on("click", "#vatreturnCategory3", function(e) {
                if ($("#vatreturnCategory3").prop('checked') == true) {
                    document.getElementById("tax21").setAttribute("href", "#taxCode21option");
                    document.getElementById("tax22").setAttribute("href", "#taxCode22option");
                    document.getElementById("tax23").setAttribute("href", "#taxCode23option");
                    document.getElementById("tax26").setAttribute("href", "#taxCode26option");
                    document.getElementById("tax27").setAttribute("href", "#taxCode27option");
                    document.getElementById("tax28").setAttribute("href", "#taxCode28option");
                    document.getElementById("tax30").setAttribute("href", "#taxCode30option");
                    document.getElementById("tax31").setAttribute("href", "#taxCode31option");
                    document.getElementById("tax32").setAttribute("href", "#taxCode32option");
                    document.getElementById("tax34").setAttribute("href", "#taxCode34option");
                    document.getElementById("tax35").setAttribute("href", "#taxCode35option");
                    document.getElementById("tax36").setAttribute("href", "#taxCode36option");
                } else {
                    document.getElementById("tax21").setAttribute("href", "#");
                    document.getElementById("tax22").setAttribute("href", "#");
                    document.getElementById("tax23").setAttribute("href", "#");
                    document.getElementById("tax26").setAttribute("href", "#");
                    document.getElementById("tax27").setAttribute("href", "#");
                    document.getElementById("tax28").setAttribute("href", "#");
                    document.getElementById("tax30").setAttribute("href", "#");
                    document.getElementById("tax31").setAttribute("href", "#");
                    document.getElementById("tax32").setAttribute("href", "#");
                    document.getElementById("tax34").setAttribute("href", "#");
                    document.getElementById("tax35").setAttribute("href", "#");
                    document.getElementById("tax36").setAttribute("href", "#");
                }
            });
        });
    }, 500);

    $(document).on("click", "#departmentList tbody tr", function(e) {
        $('#sltDepartment').val($(this).find(".colDeptName").text());
        $('#departmentModal').modal('toggle');
        $("#allDepart").prop('checked', false);
    });
});

Template.vatreturn.helpers({
    years: () => {
        let currentDate = new Date();
        let years = [];
        for (var i = currentDate.getFullYear(); i >= 2020; i--) {
            years.push(i);
        }
        return years;
    },
    taxRateList: () => {
        return Template.instance().taxRateList.get();
    },
    taxCodePanList: () => {
        let taxCodePanArray = ["1", "1a", "2", "2a", "3", "5", "7", "10", "12", "14", "14a", "15", "15a", "16", "17", "21", "22", "26", "27", "30", "31", "34", "35"];
        return taxCodePanArray;
    },
    accountsList: () => {
        return Template.instance()
            .accountsList.get()
            .sort(function(a, b) {
                if (a.accountname === "NA") {
                    return 1;
                } else if (b.accountname === "NA") {
                    return -1;
                }
                return a.accountname.toUpperCase() > b.accountname.toUpperCase() ?
                    1 :
                    -1;
            });
    },
    pageTitle: () => {
        return Template.instance().pageTitle.get();
    },
    reasonT4: () => {
        return Template.instance().reasonT4.get();
    },
    reasonF4: () => {
        return Template.instance().reasonF4.get();
    },



    record: () => {
        return Template.instance().record.get();
    },
    deptrecords: () => {
        return Template.instance().deptrecords.get().sort(function(a, b) {
            if (a.department == 'NA') {
                return 1;
            } else if (b.department == 'NA') {
                return -1;
            }
            return (a.department.toUpperCase() > b.department.toUpperCase()) ? 1 : -1;
        });
    },
});

Template.vatreturn.events({
    "click #loadVatOption": (e) => {
        if ($("#allDepart").prop('checked') == false && $('#sltDepartment').val() == "") {
            swal('Department cannot be blank!', '', 'warning');
        } else {
            $("#vatoptionmodal").modal("toggle");
        }
    },
    // "click #allDepart": (e) => {
    //     if ($("#allDepart").prop('checked') == true) {
    //         $("#sltDepartment").attr("disabled", "disabled");
    //     } else {
    //         $("#sltDepartment").removeAttr("disabled");
    //     }
    // },
    "click #datemethod1": (e) => {

    },
    "click #datemethod2": (e) => {

    },
    "click #datemethod1-t2": (e) => {

    },
    "click #datemethod2-t2": (e) => {

    },
    "click #datemethod1-t3": (e) => {

    },
    "click #datemethod2-t3": (e) => {

    },
    'click #datemethod1, click #datemethod2, change #beginmonthlydate, change #currentyear': function(event) {
        let toDate = new Date();
        toDate = moment(toDate).format("YYYY-MM-DD");

        if ($("#datemethod1").prop('checked') == true) {
            if ($("#beginmonthlydate").val() != "" && $("#currentyear").val() != "" && $("#beginmonthlydate").val() != null && $("#currentyear").val() != null) {
                var endMonth = Math.ceil(parseInt(months[$("#beginmonthlydate").val()]) / 3) * 3;
                toDate = new Date($("#currentyear").val(), (parseInt(endMonth)), 0);
                toDate = moment(toDate).format("YYYY-MM-DD");
                $("#endDate").val(toDate);
            }
        } else {
            if ($("#beginmonthlydate").val() != "" && $("#currentyear").val() != "" && $("#beginmonthlydate").val() != null && $("#currentyear").val() != null) {
                var endMonth = parseInt(months[$("#beginmonthlydate").val()]);
                toDate = new Date($("#currentyear").val(), (parseInt(endMonth)), 0);
                toDate = moment(toDate).format("YYYY-MM-DD");
                $("#endDate").val(toDate);
            }
        }
    },
    'click #datemethod1-t2, click #datemethod2-t2, change #beginmonthlydate-t2, change #currentyear-t2': function(event) {
        let toDate = new Date();
        toDate = moment(toDate).format("YYYY-MM-DD");

        if ($("#datemethod1-t2").prop('checked') == true) {
            if ($("#beginmonthlydate-t2").val() != "" && $("#currentyear-t2").val() != "" && $("#beginmonthlydate-t2").val() != null && $("#currentyear-t2").val() != null) {
                var endMonth = Math.ceil(parseInt(months[$("#beginmonthlydate-t2").val()]) / 3) * 3;
                toDate = new Date($("#currentyear-t2").val(), (parseInt(endMonth)), 0);
                toDate = moment(toDate).format("YYYY-MM-DD");
                $("#endDate-t2").val(toDate);
            }
        } else {
            if ($("#beginmonthlydate-t2").val() != "" && $("#currentyear-t2").val() != "" && $("#beginmonthlydate-t2").val() != null && $("#currentyear-t2").val() != null) {
                var endMonth = parseInt(months[$("#beginmonthlydate-t2").val()]);
                toDate = new Date($("#currentyear-t2").val(), (parseInt(endMonth)), 0);
                toDate = moment(toDate).format("YYYY-MM-DD");
                $("#endDate-t2").val(toDate);
            }
        }
    },
    'click #datemethod1-t3, click #datemethod2-t3, change #beginmonthlydate-t3, change #currentyear-t3': function(event) {
        let toDate = new Date();
        toDate = moment(toDate).format("YYYY-MM-DD");

        if ($("#datemethod1-t3").prop('checked') == true) {
            if ($("#beginmonthlydate-t3").val() != "" && $("#currentyear-t3").val() != "" && $("#beginmonthlydate-t3").val() != null && $("#currentyear-t3").val() != null) {
                var endMonth = Math.ceil(parseInt(months[$("#beginmonthlydate-t3").val()]) / 3) * 3;
                toDate = new Date($("#currentyear-t3").val(), (parseInt(endMonth)), 0);
                toDate = moment(toDate).format("YYYY-MM-DD");
                $("#endDate-t3").val(toDate);
            }
        } else {
            if ($("#beginmonthlydate-t3").val() != "" && $("#currentyear-t3").val() != "" && $("#beginmonthlydate-t3").val() != null && $("#currentyear-t3").val() != null) {
                var endMonth = parseInt(months[$("#beginmonthlydate-t3").val()]);
                toDate = new Date($("#currentyear-t3").val(), (parseInt(endMonth)), 0);
                toDate = moment(toDate).format("YYYY-MM-DD");
                $("#endDate-t3").val(toDate);
            }
        }
    },
    'click .btnselTaxList': function(event) {
        const templateObject = Template.instance();

        let taxCodePanID = $(event.target).attr('id').split("-")[1];
        Template.instance().selTaxList(taxCodePanID);

        var tax4cost = parseFloat($("#tax1cost").val()) * 15 / (100 + 15);
        $("#tax4cost").val(tax4cost.toFixed(2));
        $("#prt_tax4cost").html("$" + tax4cost.toFixed(2));
        var tax4acost = parseFloat($("#tax1acost").val()) * 15 / (100 + 15);
        $("#tax4acost").val(tax4acost.toFixed(2));
        $("#prt_tax4acost").html("$" + tax4acost.toFixed(2));
        var tax6cost = parseFloat($("#tax5cost").val()) * 60 / 100;
        $("#tax6cost").val(tax6cost.toFixed(2));
        $("#prt_tax6cost").html("$" + tax6cost.toFixed(2));
        var tax8cost = tax6cost + parseFloat($("#tax7acost").val());
        $("#tax8cost").val(tax8cost.toFixed(2));
        $("#prt_tax8cost").html("$" + tax8cost.toFixed(2));
        var tax9cost = tax8cost * 15 / 100;
        $("#tax9cost").val(tax9cost.toFixed(2));
        $("#prt_tax9cost").html("$" + tax9cost.toFixed(2));
        var tax11cost = parseFloat($("#tax10cost").val()) * 15 / (100 + 15);
        $("#tax11cost").val(tax11cost.toFixed(2));
        $("#prt_tax11cost").html("$" + tax11cost.toFixed(2));
        var tax13cost = tax4cost + tax4acost + tax9cost + tax11cost + parseFloat($("#tax12cost").val());
        $("#tax13cost").val(tax13cost.toFixed(2));
        $("#prt_tax13cost").html("$" + tax13cost.toFixed(2));
        var tax19cost = parseFloat($("#tax14cost").val()) + parseFloat($("#tax14acost").val()) + parseFloat($("#tax15cost").val()) + parseFloat($("#tax15acost").val()) + parseFloat($("#tax16cost").val()) + parseFloat($("#tax17cost").val()) + parseFloat($("#tax18cost").val());
        $("#tax19cost").val(tax19cost.toFixed(2));
        $("#prt_tax19cost").html("$" + tax19cost.toFixed(2));
        var tax20cost = tax13cost - tax19cost;
        $("#tax20cost").val(tax20cost.toFixed(2));
        $("#prt_tax20cost").html("$" + tax20cost.toFixed(2));
        var tax23cost = parseFloat($("#tax21cost").val()) - parseFloat($("#tax22cost").val());
        $("#tax23cost").val(tax23cost.toFixed(2));
        $("#prt_tax23cost").html("$" + tax23cost.toFixed(2));
        var tax24cost = tax23cost * 80 / 100;
        $("#tax24cost").val(tax24cost.toFixed(2));
        $("#prt_tax24cost").html("$" + tax24cost.toFixed(2));
        var tax25cost = tax24cost * 332.8 / 100;
        $("#tax25cost").val(tax25cost.toFixed(2));
        $("#prt_tax25cost").html("$" + tax25cost.toFixed(2));
        var tax28cost = parseFloat($("#tax26cost").val()) - parseFloat($("#tax27cost").val());
        $("#tax28cost").val(tax28cost.toFixed(2));
        $("#prt_tax28cost").html("$" + tax28cost.toFixed(2));
        var tax29cost = tax28cost * 562 / 100;
        $("#tax29cost").val(tax29cost.toFixed(2));
        $("#prt_tax29cost").html("$" + tax29cost.toFixed(2));
        var tax32cost = parseFloat($("#tax30cost").val()) - parseFloat($("#tax31cost").val());
        $("#tax32cost").val(tax32cost.toFixed(2));
        $("#prt_tax32cost").html("$" + tax32cost.toFixed(2));
        var tax33cost = tax32cost * 207 / 100;
        $("#tax33cost").val(tax33cost.toFixed(2));
        $("#prt_tax33cost").html("$" + tax33cost.toFixed(2));
        var tax36cost = parseFloat($("#tax34cost").val()) - parseFloat($("#tax35cost").val());
        $("#tax36cost").val(tax36cost.toFixed(2));
        $("#prt_tax36cost").html("$" + tax36cost.toFixed(2));
        var tax37cost = tax36cost * 384.5 / 100;
        $("#tax37cost").val(tax37cost.toFixed(2));
        $("#prt_tax37cost").html("$" + tax37cost.toFixed(2));
        var tax38cost = tax20cost - (tax25cost + tax29cost + tax33cost + tax37cost);
        $("#tax38cost").val(tax38cost.toFixed(2));
        $("#prt_tax38cost").html("$" + tax38cost.toFixed(2));

        $("#taxCode" + taxCodePanID + "option").modal("toggle");
    },
    'dblclick .transactionView': function(event) {
        const templateObject = Template.instance();
        let getID = $(event.target).attr('id');

        if (parseFloat($("#" + getID).val()) > 0) {
            if (!templateObject.getId.get()) {
                swal({
                    title: 'VAT Return Details',
                    text: "You must save it to go to the VAT Return Details page.\r\nDo you want to save the data?",
                    type: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Yes'
                }).then((result) => {
                    if (result.value) {
                        $('.fullScreenSpin').css('display', 'inline-block');
                        let taxRateList = templateObject.taxRateList.get();

                        let description = $('#description').val();
                        let allClass = true;
                        let classID = 0;
                        if ($("#allDepart").prop('checked') == false) {
                            allClass = false;
                            classID = $('#sltDepartmentID').val();
                        }
                        let accMethod = "Accrual";
                        if ($("#accountingmethod1").prop('checked') == true) {
                            accMethod = "Accrual";
                        } else {
                            accMethod = "Cash";
                        }

                        let hasTab1 = $("#basreturnCategory1").prop('checked');
                        let tab1_type = "Quarterly";
                        if ($("#datemethod1").prop('checked') == true) {
                            tab1_type = "Quarterly";
                        } else {
                            tab1_type = "Monthly";
                        }
                        let tab1_month = $("#beginmonthlydate").val();
                        let tab1_year = $("#currentyear").val() || 0;
                        let tax1cost = $('#tax1cost').val();
                        let tax1acost = $('#tax1acost').val();
                        let tax2cost = $('#tax2cost').val();
                        let tax2acost = $('#tax2acost').val();
                        let tax3cost = $('#tax3cost').val();
                        let tax4cost = $('#tax4cost').val();
                        let tax4acost = $('#tax4acost').val();
                        let tax5cost = $('#tax5cost').val();
                        let tax6cost = $('#tax6cost').val();
                        let tax7cost = $('#tax7cost').val();
                        let tax8cost = $('#tax8cost').val();
                        let tax9cost = $('#tax9cost').val();
                        let tax10cost = $('#tax10cost').val();
                        let tax11cost = $('#tax11cost').val();
                        let tax12cost = $('#tax12cost').val();
                        let taxcodes1 = "";
                        let taxcodes1a = "";
                        let taxcodes2 = "";
                        let taxcodes2a = "";
                        let taxcodes3 = "";
                        let taxcodes5 = "";
                        let taxcodes7 = "";
                        let taxcodes10 = "";
                        let taxcodes12 = "";
                        let taxcodes14 = "";
                        let taxcodes14a = "";
                        let taxcodes15 = "";
                        let taxcodes15a = "";
                        let taxcodes16 = "";
                        let taxcodes17 = "";
                        let taxcodes18 = "";
                        let taxcodes21 = "";
                        let taxcodes22 = "";
                        let taxcodes26 = "";
                        let taxcodes27 = "";
                        let taxcodes30 = "";
                        let taxcodes31 = "";
                        let taxcodes34 = "";
                        let taxcodes35 = "";
                        for (var i = 0; i < taxRateList.length; i++) {
                            if ($("#t-1-" + taxRateList[i].Id).prop('checked') == true) {
                                taxcodes1 = (taxcodes1 == "") ? taxRateList[i].CodeName : taxcodes1 + "," + taxRateList[i].CodeName;
                            } else if ($("#t-1a-" + taxRateList[i].Id).prop('checked') == true) {
                                taxcodes1a = (taxcodes1a == "") ? taxRateList[i].CodeName : taxcodes1a + "," + taxRateList[i].CodeName;
                            } else if ($("#t-2-" + taxRateList[i].Id).prop('checked') == true) {
                                taxcodes2 = (taxcodes2 == "") ? taxRateList[i].CodeName : taxcodes2 + "," + taxRateList[i].CodeName;
                            } else if ($("#t-2a-" + taxRateList[i].Id).prop('checked') == true) {
                                taxcodes2a = (taxcodes2a == "") ? taxRateList[i].CodeName : taxcodes2a + "," + taxRateList[i].CodeName;
                            } else if ($("#t-3-" + taxRateList[i].Id).prop('checked') == true) {
                                taxcodes3 = (taxcodes3 == "") ? taxRateList[i].CodeName : taxcodes3 + "," + taxRateList[i].CodeName;
                            } else if ($("#t-5-" + taxRateList[i].Id).prop('checked') == true) {
                                taxcodes5 = (taxcodes5 == "") ? taxRateList[i].CodeName : taxcodes5 + "," + taxRateList[i].CodeName;
                            } else if ($("#t-7-" + taxRateList[i].Id).prop('checked') == true) {
                                taxcodes7 = (taxcodes7 == "") ? taxRateList[i].CodeName : taxcodes7 + "," + taxRateList[i].CodeName;
                            } else if ($("#t-10-" + taxRateList[i].Id).prop('checked') == true) {
                                taxcodes10 = (taxcodes10 == "") ? taxRateList[i].CodeName : taxcodes10 + "," + taxRateList[i].CodeName;
                            } else if ($("#t-12-" + taxRateList[i].Id).prop('checked') == true) {
                                taxcodes12 = (taxcodes12 == "") ? taxRateList[i].CodeName : taxcodes12 + "," + taxRateList[i].CodeName;
                            } else if ($("#t-14-" + taxRateList[i].Id).prop('checked') == true) {
                                taxcodes14 = (taxcodes14 == "") ? taxRateList[i].CodeName : taxcodes14 + "," + taxRateList[i].CodeName;
                            } else if ($("#t-14a-" + taxRateList[i].Id).prop('checked') == true) {
                                taxcodes14a = (taxcodes14a == "") ? taxRateList[i].CodeName : taxcodes14a + "," + taxRateList[i].CodeName;
                            } else if ($("#t-15-" + taxRateList[i].Id).prop('checked') == true) {
                                taxcodes15 = (taxcodes15 == "") ? taxRateList[i].CodeName : taxcodes15 + "," + taxRateList[i].CodeName;
                            } else if ($("#t-15a-" + taxRateList[i].Id).prop('checked') == true) {
                                taxcodes15a = (taxcodes15a == "") ? taxRateList[i].CodeName : taxcodes15a + "," + taxRateList[i].CodeName;
                            } else if ($("#t-16-" + taxRateList[i].Id).prop('checked') == true) {
                                taxcodes16 = (taxcodes16 == "") ? taxRateList[i].CodeName : taxcodes16 + "," + taxRateList[i].CodeName;
                            } else if ($("#t-17-" + taxRateList[i].Id).prop('checked') == true) {
                                taxcodes17 = (taxcodes17 == "") ? taxRateList[i].CodeName : taxcodes17 + "," + taxRateList[i].CodeName;
                            } else if ($("#t-18-" + taxRateList[i].Id).prop('checked') == true) {
                                taxcodes18 = (taxcodes18 == "") ? taxRateList[i].CodeName : taxcodes18 + "," + taxRateList[i].CodeName;
                            } else if ($("#t-21-" + taxRateList[i].Id).prop('checked') == true) {
                                taxcodes21 = (taxcodes21 == "") ? taxRateList[i].CodeName : taxcodes21 + "," + taxRateList[i].CodeName;
                            } else if ($("#t-22-" + taxRateList[i].Id).prop('checked') == true) {
                                taxcodes22 = (taxcodes22 == "") ? taxRateList[i].CodeName : taxcodes22 + "," + taxRateList[i].CodeName;
                            } else if ($("#t-26-" + taxRateList[i].Id).prop('checked') == true) {
                                taxcodes26 = (taxcodes26 == "") ? taxRateList[i].CodeName : taxcodes26 + "," + taxRateList[i].CodeName;
                            } else if ($("#t-27-" + taxRateList[i].Id).prop('checked') == true) {
                                taxcodes27 = (taxcodes27 == "") ? taxRateList[i].CodeName : taxcodes27 + "," + taxRateList[i].CodeName;
                            } else if ($("#t-30-" + taxRateList[i].Id).prop('checked') == true) {
                                taxcodes30 = (taxcodes30 == "") ? taxRateList[i].CodeName : taxcodes30 + "," + taxRateList[i].CodeName;
                            } else if ($("#t-31-" + taxRateList[i].Id).prop('checked') == true) {
                                taxcodes31 = (taxcodes31 == "") ? taxRateList[i].CodeName : taxcodes31 + "," + taxRateList[i].CodeName;
                            } else if ($("#t-34-" + taxRateList[i].Id).prop('checked') == true) {
                                taxcodes34 = (taxcodes34 == "") ? taxRateList[i].CodeName : taxcodes34 + "," + taxRateList[i].CodeName;
                            } else if ($("#t-35-" + taxRateList[i].Id).prop('checked') == true) {
                                taxcodes35 = (taxcodes35 == "") ? taxRateList[i].CodeName : taxcodes35 + "," + taxRateList[i].CodeName;
                            }
                        }
                        let hasTab2 = $("#basreturnCategory2").prop('checked');
                        let tab2_type = "Quarterly";
                        // let startDate = "0000-00-00";
                        // let endDate = "0000-00-00";
                        if ($("#datemethod1-t2").prop('checked') == true) {
                            tab2_type = "Quarterly";
                        } else {
                            tab2_type = "Monthly";
                        }
                        let tab2_month = $("#beginmonthlydate-t2").val();
                        let tab2_year = $("#currentyear-t2").val() || 0;
                        let tax14cost = $('#tax14cost').val();
                        let tax14acost = $('#tax14acost').val();
                        let tax15cost = $('#tax15cost').val();
                        let tax15acost = $('#tax15acost').val();
                        let tax16cost = $('#tax16cost').val();
                        let tax17cost = $('#tax17cost').val();
                        let tax18cost = $('#tax18cost').val();
                        let tax19cost = $('#tax19cost').val();
                        let tax20cost = $('#tax20cost').val();
                        let hasTab3 = $("#basreturnCategory3").prop('checked');
                        let tab3_type = "Quarterly";
                        // let startDate = "0000-00-00";
                        // let endDate = "0000-00-00";
                        if ($("#datemethod1-t3").prop('checked') == true) {
                            tab3_type = "Quarterly";
                        } else {
                            tab3_type = "Monthly";
                        }
                        let tab3_month = $("#beginmonthlydate-t3").val();
                        let tab3_year = $("#currentyear-t3").val() || 0;
                        let tax21cost = $('#tax21cost').val();
                        let tax22cost = $('#tax22cost').val();
                        let tax23cost = $('#tax23cost').val();
                        let tax24cost = $('#tax24cost').val();
                        let tax25cost = $('#tax25cost').val();
                        let tax26cost = $('#tax26cost').val();
                        let tax27cost = $('#tax27cost').val();
                        let tax28cost = $('#tax28cost').val();
                        let tax29cost = $('#tax29cost').val();
                        let tax30cost = $('#tax30cost').val();
                        let tax31cost = $('#tax31cost').val();
                        let tax32cost = $('#tax32cost').val();
                        let tax33cost = $('#tax33cost').val();
                        let tax34cost = $('#tax34cost').val();
                        let tax35cost = $('#tax35cost').val();

                        if (description === '') {
                            // Bert.alert('<strong>WARNING:</strong> BAS Return Description cannot be blank!', 'warning');
                            swal('VAT Return Description cannot be blank!', '', 'warning');
                            $('.fullScreenSpin').css('display', 'none');
                        } else {
                            getVS1Data('TVATReturn').then(function(dataObject) {
                                if (dataObject.length > 0) {
                                    dataArray = JSON.parse(dataObject[0].data);
                                }
                            });

                            setTimeout(function() {
                                let jsonObj = {
                                    type: "TVATReturns",
                                    fields: {
                                        AccMethod: accMethod,
                                        Active: true,
                                        AllClass: allClass,
                                        ClassID: classID,
                                        VatSheetDesc: description,
                                        Done: false,
                                        HasTab1: hasTab1,
                                        Tab1_Type: tab1_type,
                                        Tab1_Month: tab1_month,
                                        Tab1_Year: tab1_year,
                                        _1: parseFloat(tax1cost),
                                        _1Selected: taxcodes1,
                                        _1A: parseFloat(tax1acost),
                                        _1ASelected: taxcodes1a,
                                        _2: parseFloat(tax2cost),
                                        _2Selected: taxcodes2,
                                        _2A: parseFloat(tax2acost),
                                        _2ASelected: taxcodes2a,
                                        _3: parseFloat(tax3cost),
                                        _3Selected: taxcodes3,
                                        _4: parseFloat(tax4cost),
                                        _4A: parseFloat(tax4acost),
                                        _5: parseFloat(tax5cost),
                                        _5Selected: taxcodes5,
                                        _7: parseFloat(tax7cost),
                                        _7Selected: taxcodes7,
                                        _10: parseFloat(tax10cost),
                                        _10Selected: taxcodes10,
                                        _12: parseFloat(tax12cost),
                                        _12Selected: taxcodes12,
                                        HasTab2: hasTab2,
                                        Tab2_Type: tab2_type,
                                        Tab2_Month: tab2_month,
                                        Tab2_Year: tab2_year,
                                        _14: parseFloat(tax14cost),
                                        _14Selected: taxcodes14,
                                        _14A: parseFloat(tax14acost),
                                        _14ASelected: taxcodes14a,
                                        _15: parseFloat(tax15cost),
                                        _15Selected: taxcodes15,
                                        _15A: parseFloat(tax15acost),
                                        _15ASelected: taxcodes15a,
                                        _16: parseFloat(tax16cost),
                                        _16Selected: taxcodes16,
                                        _17: parseFloat(tax17cost),
                                        _17Selected: taxcodes17,
                                        _18: parseFloat(tax18cost),
                                        _18Selected: taxcodes18,
                                        HasTab3: hasTab3,
                                        Tab3_Type: tab3_type,
                                        Tab3_Month: tab3_month,
                                        Tab3_Year: tab3_year,
                                        _21: parseFloat(tax21cost),
                                        _21Selected: taxcodes21,
                                        _22: parseFloat(tax22cost),
                                        _22Selected: taxcodes22,
                                        _26: parseFloat(tax26cost),
                                        _26Selected: taxcodes26,
                                        _27: parseFloat(tax27cost),
                                        _27Selected: taxcodes27,
                                        _30: parseFloat(tax30cost),
                                        _30Selected: taxcodes30,
                                        _31: parseFloat(tax31cost),
                                        _31Selected: taxcodes31,
                                        _34: parseFloat(tax34cost),
                                        _34Selected: taxcodes34,
                                        _35: parseFloat(tax35cost),
                                        _35Selected: taxcodes35,
                                    }
                                }

                                if (templateObject.getId.get()) {
                                    jsonObj.fields.ID = parseInt(templateObject.getId.get());
                                }

                                reportService.saveVATReturn(jsonObj).then(function(res) {
                                    reportService.getAllVATReturn().then(function(data) {
                                        addVS1Data("TVATReturn", JSON.stringify(data)).then(function(datareturn) {
                                            window.open("vatreturnlist", "_self");
                                        }).catch(function(err) {
                                            window.open("vatreturnlist", "_self");
                                        });
                                    }).catch(function(err) {
                                        window.open("vatreturnlist", "_self");
                                    });
                                }).catch(function(err) {
                                    alert(err);
                                    swal({
                                        title: 'Oooops...',
                                        text: err,
                                        type: 'error',
                                        showCancelButton: false,
                                        confirmButtonText: 'Try Again'
                                    }).then((result) => {
                                        if (result.value) {
                                            // Meteor._reload.reload();
                                        } else if (result.dismiss === 'cancel') {}
                                    });
                                    $('.fullScreenSpin').css('display', 'none');
                                });
                            }, 500);
                        }
                    } else {}
                });
            } else {
                if (getID == "tax1cost") {
                    FlowRouter.go("/vatreturntransactionlist?vatreturnid=" + templateObject.getId.get() + "&transactionitem=1");
                } else if (getID == "tax1acost") {
                    FlowRouter.go("/vatreturntransactionlist?vatreturnid=" + templateObject.getId.get() + "&transactionitem=1A");
                } else if (getID == "tax2cost") {
                    FlowRouter.go("/vatreturntransactionlist?vatreturnid=" + templateObject.getId.get() + "&transactionitem=2");
                } else if (getID == "tax2acost") {
                    FlowRouter.go("/vatreturntransactionlist?vatreturnid=" + templateObject.getId.get() + "&transactionitem=2A");
                } else if (getID == "tax3cost") {
                    FlowRouter.go("/vatreturntransactionlist?vatreturnid=" + templateObject.getId.get() + "&transactionitem=3");
                } else if (getID == "tax5cost") {
                    FlowRouter.go("/vatreturntransactionlist?vatreturnid=" + templateObject.getId.get() + "&transactionitem=5");
                } else if (getID == "tax7cost") {
                    FlowRouter.go("/vatreturntransactionlist?vatreturnid=" + templateObject.getId.get() + "&transactionitem=7");
                } else if (getID == "tax10cost") {
                    FlowRouter.go("/vatreturntransactionlist?vatreturnid=" + templateObject.getId.get() + "&transactionitem=10");
                } else if (getID == "tax12cost") {
                    FlowRouter.go("/vatreturntransactionlist?vatreturnid=" + templateObject.getId.get() + "&transactionitem=12");
                } else if (getID == "tax14cost") {
                    FlowRouter.go("/vatreturntransactionlist?vatreturnid=" + templateObject.getId.get() + "&transactionitem=14");
                } else if (getID == "tax14acost") {
                    FlowRouter.go("/vatreturntransactionlist?vatreturnid=" + templateObject.getId.get() + "&transactionitem=14a");
                } else if (getID == "tax15cost") {
                    FlowRouter.go("/vatreturntransactionlist?vatreturnid=" + templateObject.getId.get() + "&transactionitem=15");
                } else if (getID == "tax15acost") {
                    FlowRouter.go("/vatreturntransactionlist?vatreturnid=" + templateObject.getId.get() + "&transactionitem=15a");
                } else if (getID == "tax16cost") {
                    FlowRouter.go("/vatreturntransactionlist?vatreturnid=" + templateObject.getId.get() + "&transactionitem=16");
                } else if (getID == "tax17cost") {
                    FlowRouter.go("/vatreturntransactionlist?vatreturnid=" + templateObject.getId.get() + "&transactionitem=17");
                } else if (getID == "tax18cost") {
                    FlowRouter.go("/vatreturntransactionlist?vatreturnid=" + templateObject.getId.get() + "&transactionitem=18");
                } else if (getID == "tax21cost") {
                    FlowRouter.go("/vatreturntransactionlist?vatreturnid=" + templateObject.getId.get() + "&transactionitem=21");
                } else if (getID == "tax22cost") {
                    FlowRouter.go("/vatreturntransactionlist?vatreturnid=" + templateObject.getId.get() + "&transactionitem=22");
                } else if (getID == "tax26cost") {
                    FlowRouter.go("/vatreturntransactionlist?vatreturnid=" + templateObject.getId.get() + "&transactionitem=26");
                } else if (getID == "tax27cost") {
                    FlowRouter.go("/vatreturntransactionlist?vatreturnid=" + templateObject.getId.get() + "&transactionitem=27");
                } else if (getID == "tax30cost") {
                    FlowRouter.go("/vatreturntransactionlist?vatreturnid=" + templateObject.getId.get() + "&transactionitem=30");
                } else if (getID == "tax31cost") {
                    FlowRouter.go("/vatreturntransactionlist?vatreturnid=" + templateObject.getId.get() + "&transactionitem=31");
                } else if (getID == "tax34cost") {
                    FlowRouter.go("/vatreturntransactionlist?vatreturnid=" + templateObject.getId.get() + "&transactionitem=34");
                } else if (getID == "tax35cost") {
                    FlowRouter.go("/vatreturntransactionlist?vatreturnid=" + templateObject.getId.get() + "&transactionitem=35");
                }
            }
        }
    },

    'click .btnRefresh': function(event) {
        let templateObject = Template.instance();
        let fromDate = "0000-00-00";
        let toDate = new Date();
        toDate = moment(toDate).format("YYYY-MM-DD");

        $('.fullScreenSpin').css('display', 'inline-block');
        if ($("#beginmonthlydate").val() != "" && $("#currentyear").val() != "" && $("#beginmonthlydate").val() != null && $("#currentyear").val() != null) {
            fromDate = new Date($("#currentyear").val() + "-" + $("#beginmonthlydate").val());
            fromDate = moment(fromDate).format("YYYY-MM-DD");
            toDate = $("#endDate").val();
            templateObject.getTaxSummaryReports(fromDate, toDate, false, "t1");
        }
        if ($("#beginmonthlydate-t2").val() != "" && $("#currentyear-t2").val() != "" && $("#beginmonthlydate-t2").val() != null && $("#currentyear-t2").val() != null) {
            fromDate = new Date($("#currentyear-t2").val() + "-" + $("#beginmonthlydate-t2").val());
            fromDate = moment(fromDate).format("YYYY-MM-DD");
            toDate = $("#endDate-t2").val();
            templateObject.getTaxSummaryReports(fromDate, toDate, false, "t2");
        }
        if ($("#beginmonthlydate-t3").val() != "" && $("#currentyear-t3").val() != "" && $("#beginmonthlydate-t3").val() != null && $("#currentyear-t3").val() != null) {
            fromDate = new Date($("#currentyear-t3").val() + "-" + $("#beginmonthlydate-t3").val());
            fromDate = moment(fromDate).format("YYYY-MM-DD");
            toDate = $("#endDate-t3").val();
            templateObject.getTaxSummaryReports(fromDate, toDate, false, "t3");
        }
    },
    'click .printConfirm': function(event) {
        playPrintAudio();
        $(".printVATReturn").show();
        $("a").attr("href", "/");
        document.title = "VAT Return";
        $(".printVATReturn").print({
            title: document.title + " | " + loggedCompany,
            noPrintSelector: ".addSummaryEditor",
            mediaPrint: false,
        });

        setTimeout(function() {
            $("a").attr("href", "#");
            $(".printVATReturn").hide();
        }, 100);
    },
    'click .btnDelete': function(event) {
        playDeleteAudio();
        let templateObject = Template.instance();
        setTimeout(function() {
            if (templateObject.getId.get()) {
                swal({
                    title: 'Delete VAT Return',
                    text: "Are you sure you want to Delete this VAT Return?",
                    type: 'info',
                    showCancelButton: true,
                    confirmButtonText: 'Yes'
                }).then((result) => {
                    if (result.value) {
                        $('.fullScreenSpin').css('display', 'inline-block');
                        getVS1Data('TVATReturn').then(function(dataObject) {
                            if (dataObject.length > 0) {
                                let dataArray = JSON.parse(dataObject[0].data);
                                dataArray.forEach((item, j) => {
                                    if (item.vatNumber == templateObject.getId.get()) {
                                        dataArray.splice(j, 1);
                                    }
                                });
                                addVS1Data('TVATReturn', JSON.stringify(dataArray)).then(function(datareturn) {
                                    FlowRouter.go('/vatreturnlist');
                                    $('.modal-backdrop').css('display', 'none');
                                    $('.fullScreenSpin').css('display', 'none');
                                }).catch(function(err) {
                                    swal({
                                        title: 'Oooops...',
                                        text: err,
                                        type: 'error',
                                        showCancelButton: false,
                                        confirmButtonText: 'Try Again'
                                    }).then((result) => {
                                        if (result.value) { if (err === checkResponseError) { window.open('/', '_self'); } } else if (result.dismiss === 'cancel') {

                                        }
                                    });
                                    $('.fullScreenSpin').css('display', 'none');
                                });
                            }
                        });
                    } else {}
                });
            }
        }, delayTimeAfterSound);
    },
    'click .btnSaveSettings': function(event) {
        playSaveAudio();
        setTimeout(function() {
            $('#myModal4').modal('toggle');
        }, delayTimeAfterSound);
    },
    'click .btnSave': function(event) {
        let templateObject = Template.instance();
        playSaveAudio();
        setTimeout(function() {
            $('.fullScreenSpin').css('display', 'inline-block');
            let taxRateList = templateObject.taxRateList.get();

            let dataArray = [];
            let description = $('#description').val();
            let allClass = true;
            let classID = 0;
            if ($("#allDepart").prop('checked') == false) {
                allClass = false;
                classID = $('#sltDepartmentID').val();
            }
            let accMethod = "Accrual";
            if ($("#accountingmethod1").prop('checked') == true) {
                accMethod = "Accrual";
            } else {
                accMethod = "Cash";
            }

            let hasTab1 = $("#basreturnCategory1").prop('checked');
            let tab1_type = "Quarterly";
            if ($("#datemethod1").prop('checked') == true) {
                tab1_type = "Quarterly";
            } else {
                tab1_type = "Monthly";
            }
            let tab1_month = $("#beginmonthlydate").val();
            let tab1_year = $("#currentyear").val() || 0;
            let tax1cost = $('#tax1cost').val();
            let tax1acost = $('#tax1acost').val();
            let tax2cost = $('#tax2cost').val();
            let tax2acost = $('#tax2acost').val();
            let tax3cost = $('#tax3cost').val();
            let tax4cost = $('#tax4cost').val();
            let tax4acost = $('#tax4acost').val();
            let tax5cost = $('#tax5cost').val();
            let tax6cost = $('#tax6cost').val();
            let tax7cost = $('#tax7cost').val();
            let tax8cost = $('#tax8cost').val();
            let tax9cost = $('#tax9cost').val();
            let tax10cost = $('#tax10cost').val();
            let tax11cost = $('#tax11cost').val();
            let tax12cost = $('#tax12cost').val();
            let taxcodes1 = "";
            let taxcodes1a = "";
            let taxcodes2 = "";
            let taxcodes2a = "";
            let taxcodes3 = "";
            let taxcodes5 = "";
            let taxcodes7 = "";
            let taxcodes10 = "";
            let taxcodes12 = "";
            let taxcodes14 = "";
            let taxcodes14a = "";
            let taxcodes15 = "";
            let taxcodes15a = "";
            let taxcodes16 = "";
            let taxcodes17 = "";
            let taxcodes18 = "";
            let taxcodes21 = "";
            let taxcodes22 = "";
            let taxcodes26 = "";
            let taxcodes27 = "";
            let taxcodes30 = "";
            let taxcodes31 = "";
            let taxcodes34 = "";
            let taxcodes35 = "";
            for (var i = 0; i < taxRateList.length; i++) {
                if ($("#t-1-" + taxRateList[i].Id).prop('checked') == true) {
                    taxcodes1 = (taxcodes1 == "") ? taxRateList[i].CodeName : taxcodes1 + "," + taxRateList[i].CodeName;
                } else if ($("#t-1a-" + taxRateList[i].Id).prop('checked') == true) {
                    taxcodes1a = (taxcodes1a == "") ? taxRateList[i].CodeName : taxcodes1a + "," + taxRateList[i].CodeName;
                } else if ($("#t-2-" + taxRateList[i].Id).prop('checked') == true) {
                    taxcodes2 = (taxcodes2 == "") ? taxRateList[i].CodeName : taxcodes2 + "," + taxRateList[i].CodeName;
                } else if ($("#t-2a-" + taxRateList[i].Id).prop('checked') == true) {
                    taxcodes2a = (taxcodes2a == "") ? taxRateList[i].CodeName : taxcodes2a + "," + taxRateList[i].CodeName;
                } else if ($("#t-3-" + taxRateList[i].Id).prop('checked') == true) {
                    taxcodes3 = (taxcodes3 == "") ? taxRateList[i].CodeName : taxcodes3 + "," + taxRateList[i].CodeName;
                } else if ($("#t-5-" + taxRateList[i].Id).prop('checked') == true) {
                    taxcodes5 = (taxcodes5 == "") ? taxRateList[i].CodeName : taxcodes5 + "," + taxRateList[i].CodeName;
                } else if ($("#t-7-" + taxRateList[i].Id).prop('checked') == true) {
                    taxcodes7 = (taxcodes7 == "") ? taxRateList[i].CodeName : taxcodes7 + "," + taxRateList[i].CodeName;
                } else if ($("#t-10-" + taxRateList[i].Id).prop('checked') == true) {
                    taxcodes10 = (taxcodes10 == "") ? taxRateList[i].CodeName : taxcodes10 + "," + taxRateList[i].CodeName;
                } else if ($("#t-12-" + taxRateList[i].Id).prop('checked') == true) {
                    taxcodes12 = (taxcodes12 == "") ? taxRateList[i].CodeName : taxcodes12 + "," + taxRateList[i].CodeName;
                } else if ($("#t-14-" + taxRateList[i].Id).prop('checked') == true) {
                    taxcodes14 = (taxcodes14 == "") ? taxRateList[i].CodeName : taxcodes14 + "," + taxRateList[i].CodeName;
                } else if ($("#t-14a-" + taxRateList[i].Id).prop('checked') == true) {
                    taxcodes14a = (taxcodes14a == "") ? taxRateList[i].CodeName : taxcodes14a + "," + taxRateList[i].CodeName;
                } else if ($("#t-15-" + taxRateList[i].Id).prop('checked') == true) {
                    taxcodes15 = (taxcodes15 == "") ? taxRateList[i].CodeName : taxcodes15 + "," + taxRateList[i].CodeName;
                } else if ($("#t-15a-" + taxRateList[i].Id).prop('checked') == true) {
                    taxcodes15a = (taxcodes15a == "") ? taxRateList[i].CodeName : taxcodes15a + "," + taxRateList[i].CodeName;
                } else if ($("#t-16-" + taxRateList[i].Id).prop('checked') == true) {
                    taxcodes16 = (taxcodes16 == "") ? taxRateList[i].CodeName : taxcodes16 + "," + taxRateList[i].CodeName;
                } else if ($("#t-17-" + taxRateList[i].Id).prop('checked') == true) {
                    taxcodes17 = (taxcodes17 == "") ? taxRateList[i].CodeName : taxcodes17 + "," + taxRateList[i].CodeName;
                } else if ($("#t-18-" + taxRateList[i].Id).prop('checked') == true) {
                    taxcodes18 = (taxcodes18 == "") ? taxRateList[i].CodeName : taxcodes18 + "," + taxRateList[i].CodeName;
                } else if ($("#t-21-" + taxRateList[i].Id).prop('checked') == true) {
                    taxcodes21 = (taxcodes21 == "") ? taxRateList[i].CodeName : taxcodes21 + "," + taxRateList[i].CodeName;
                } else if ($("#t-22-" + taxRateList[i].Id).prop('checked') == true) {
                    taxcodes22 = (taxcodes22 == "") ? taxRateList[i].CodeName : taxcodes22 + "," + taxRateList[i].CodeName;
                } else if ($("#t-26-" + taxRateList[i].Id).prop('checked') == true) {
                    taxcodes26 = (taxcodes26 == "") ? taxRateList[i].CodeName : taxcodes26 + "," + taxRateList[i].CodeName;
                } else if ($("#t-27-" + taxRateList[i].Id).prop('checked') == true) {
                    taxcodes27 = (taxcodes27 == "") ? taxRateList[i].CodeName : taxcodes27 + "," + taxRateList[i].CodeName;
                } else if ($("#t-30-" + taxRateList[i].Id).prop('checked') == true) {
                    taxcodes30 = (taxcodes30 == "") ? taxRateList[i].CodeName : taxcodes30 + "," + taxRateList[i].CodeName;
                } else if ($("#t-31-" + taxRateList[i].Id).prop('checked') == true) {
                    taxcodes31 = (taxcodes31 == "") ? taxRateList[i].CodeName : taxcodes31 + "," + taxRateList[i].CodeName;
                } else if ($("#t-34-" + taxRateList[i].Id).prop('checked') == true) {
                    taxcodes34 = (taxcodes34 == "") ? taxRateList[i].CodeName : taxcodes34 + "," + taxRateList[i].CodeName;
                } else if ($("#t-35-" + taxRateList[i].Id).prop('checked') == true) {
                    taxcodes35 = (taxcodes35 == "") ? taxRateList[i].CodeName : taxcodes35 + "," + taxRateList[i].CodeName;
                }
            }
            let hasTab2 = $("#basreturnCategory2").prop('checked');
            let tab2_type = "Quarterly";
            // let startDate = "0000-00-00";
            // let endDate = "0000-00-00";
            if ($("#datemethod1-t2").prop('checked') == true) {
                tab2_type = "Quarterly";
            } else {
                tab2_type = "Monthly";
            }
            let tab2_month = $("#beginmonthlydate-t2").val();
            let tab2_year = $("#currentyear-t2").val() || 0;
            let tax14cost = $('#tax14cost').val();
            let tax14acost = $('#tax14acost').val();
            let tax15cost = $('#tax15cost').val();
            let tax15acost = $('#tax15acost').val();
            let tax16cost = $('#tax16cost').val();
            let tax17cost = $('#tax17cost').val();
            let tax18cost = $('#tax18cost').val();
            let tax19cost = $('#tax19cost').val();
            let tax20cost = $('#tax20cost').val();
            let hasTab3 = $("#basreturnCategory3").prop('checked');
            let tab3_type = "Quarterly";
            // let startDate = "0000-00-00";
            // let endDate = "0000-00-00";
            if ($("#datemethod1-t3").prop('checked') == true) {
                tab3_type = "Quarterly";
            } else {
                tab3_type = "Monthly";
            }
            let tab3_month = $("#beginmonthlydate-t3").val();
            let tab3_year = $("#currentyear-t3").val() || 0;
            let tax21cost = $('#tax21cost').val();
            let tax22cost = $('#tax22cost').val();
            let tax23cost = $('#tax23cost').val();
            let tax24cost = $('#tax24cost').val();
            let tax25cost = $('#tax25cost').val();
            let tax26cost = $('#tax26cost').val();
            let tax27cost = $('#tax27cost').val();
            let tax28cost = $('#tax28cost').val();
            let tax29cost = $('#tax29cost').val();
            let tax30cost = $('#tax30cost').val();
            let tax31cost = $('#tax31cost').val();
            let tax32cost = $('#tax32cost').val();
            let tax33cost = $('#tax33cost').val();
            let tax34cost = $('#tax34cost').val();
            let tax35cost = $('#tax35cost').val();

            if (description === '') {
                // Bert.alert('<strong>WARNING:</strong> BAS Return Description cannot be blank!', 'warning');
                swal('VAT Return Description cannot be blank!', '', 'warning');
                $('.fullScreenSpin').css('display', 'none');
            } else {
                getVS1Data('TVATReturn').then(function(dataObject) {
                    if (dataObject.length > 0) {
                        dataArray = JSON.parse(dataObject[0].data);
                    }
                });

                setTimeout(function() {
                    let jsonObj = {
                        type: "TVATReturns",
                        fields: {
                            AccMethod: accMethod,
                            Active: true,
                            AllClass: allClass,
                            ClassID: classID,
                            VatSheetDesc: description,
                            Done: false,
                            HasTab1: hasTab1,
                            Tab1_Type: tab1_type,
                            Tab1_Month: tab1_month,
                            Tab1_Year: tab1_year,
                            _1: parseFloat(tax1cost),
                            _1Selected: taxcodes1,
                            _1A: parseFloat(tax1acost),
                            _1ASelected: taxcodes1a,
                            _2: parseFloat(tax2cost),
                            _2Selected: taxcodes2,
                            _2A: parseFloat(tax2acost),
                            _2ASelected: taxcodes2a,
                            _3: parseFloat(tax3cost),
                            _3Selected: taxcodes3,
                            _4: parseFloat(tax4cost),
                            _4A: parseFloat(tax4acost),
                            _5: parseFloat(tax5cost),
                            _5Selected: taxcodes5,
                            _7: parseFloat(tax7cost),
                            _7Selected: taxcodes7,
                            _10: parseFloat(tax10cost),
                            _10Selected: taxcodes10,
                            _12: parseFloat(tax12cost),
                            _12Selected: taxcodes12,
                            HasTab2: hasTab2,
                            Tab2_Type: tab2_type,
                            Tab2_Month: tab2_month,
                            Tab2_Year: tab2_year,
                            _14: parseFloat(tax14cost),
                            _14Selected: taxcodes14,
                            _14A: parseFloat(tax14acost),
                            _14ASelected: taxcodes14a,
                            _15: parseFloat(tax15cost),
                            _15Selected: taxcodes15,
                            _15A: parseFloat(tax15acost),
                            _15ASelected: taxcodes15a,
                            _16: parseFloat(tax16cost),
                            _16Selected: taxcodes16,
                            _17: parseFloat(tax17cost),
                            _17Selected: taxcodes17,
                            _18: parseFloat(tax18cost),
                            _18Selected: taxcodes18,
                            HasTab3: hasTab3,
                            Tab3_Type: tab3_type,
                            Tab3_Month: tab3_month,
                            Tab3_Year: tab3_year,
                            _21: parseFloat(tax21cost),
                            _21Selected: taxcodes21,
                            _22: parseFloat(tax22cost),
                            _22Selected: taxcodes22,
                            _26: parseFloat(tax26cost),
                            _26Selected: taxcodes26,
                            _27: parseFloat(tax27cost),
                            _27Selected: taxcodes27,
                            _30: parseFloat(tax30cost),
                            _30Selected: taxcodes30,
                            _31: parseFloat(tax31cost),
                            _31Selected: taxcodes31,
                            _34: parseFloat(tax34cost),
                            _34Selected: taxcodes34,
                            _35: parseFloat(tax35cost),
                            _35Selected: taxcodes35,
                        }
                    }

                    if (templateObject.getId.get()) {
                        jsonObj.fields.ID = parseInt(templateObject.getId.get());
                    }

                    reportService.saveVATReturn(jsonObj).then(function(res) {
                        reportService.getAllVATReturn().then(function(data) {
                            addVS1Data("TVATReturn", JSON.stringify(data)).then(function(datareturn) {
                                window.open("vatreturnlist", "_self");
                            }).catch(function(err) {
                                window.open("vatreturnlist", "_self");
                            });
                        }).catch(function(err) {
                            window.open("vatreturnlist", "_self");
                        });
                    }).catch(function(err) {
                        alert(err);
                        swal({
                            title: 'Oooops...',
                            text: err,
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {
                                // Meteor._reload.reload();
                            } else if (result.dismiss === 'cancel') {}
                        });
                        $('.fullScreenSpin').css('display', 'none');
                    });
                }, 500);
            }
        }, delayTimeAfterSound);
    },
    'click .chkcolAccountName': function(event) {
        if ($(event.target).is(':checked')) {
            $('.colAccountName').css('display', 'table-cell');
            $('.colAccountName').css('padding', '.75rem');
            $('.colAccountName').css('vertical-align', 'top');
        } else {
            $('.colAccountName').css('display', 'none');
        }
    },
    'click .chkcolAccountNo': function(event) {
        if ($(event.target).is(':checked')) {
            $('.colAccountNo').css('display', 'table-cell');
            $('.colAccountNo').css('padding', '.75rem');
            $('.colAccountNo').css('vertical-align', 'top');
        } else {
            $('.colAccountNo').css('display', 'none');
        }
    },
    'click .chkcolMemo': function(event) {
        if ($(event.target).is(':checked')) {
            $('.colMemo').css('display', 'table-cell');
            $('.colMemo').css('padding', '.75rem');
            $('.colMemo').css('vertical-align', 'top');
        } else {
            $('.colMemo').css('display', 'none');
        }
    },
    'blur .divcolumn': function(event) {
        let columData = $(event.target).html();
        let columHeaderUpdate = $(event.target).attr("valueupdate");
        $("" + columHeaderUpdate + "").html(columData);
    },
    'click .btnResetGridSettings': function(event) {
        var getcurrentCloudDetails = CloudUser.findOne({
            _id: Session.get('mycloudLogonID'),
            clouddatabaseID: Session.get('mycloudLogonDBID')
        });
        if (getcurrentCloudDetails) {
            if (getcurrentCloudDetails._id.length > 0) {
                var clientID = getcurrentCloudDetails._id;
                var clientUsername = getcurrentCloudDetails.cloudUsername;
                var clientEmail = getcurrentCloudDetails.cloudEmail;
                var checkPrefDetails = CloudPreference.findOne({
                    userid: clientID,
                    PrefName: 'tblJournalEntryLine'
                });
                if (checkPrefDetails) {
                    CloudPreference.remove({
                        _id: checkPrefDetails._id
                    }, function(err, idTag) {
                        if (err) {

                        } else {
                            Meteor._reload.reload();
                        }
                    });

                }
            }
        }
    },
    'click .btnResetSettings': function(event) {
        var getcurrentCloudDetails = CloudUser.findOne({
            _id: Session.get('mycloudLogonID'),
            clouddatabaseID: Session.get('mycloudLogonDBID')
        });
        if (getcurrentCloudDetails) {
            if (getcurrentCloudDetails._id.length > 0) {
                var clientID = getcurrentCloudDetails._id;
                var clientUsername = getcurrentCloudDetails.cloudUsername;
                var clientEmail = getcurrentCloudDetails.cloudEmail;
                var checkPrefDetails = CloudPreference.findOne({
                    userid: clientID,
                    PrefName: 'journalentrycard'
                });
                if (checkPrefDetails) {
                    CloudPreference.remove({
                        _id: checkPrefDetails._id
                    }, function(err, idTag) {
                        if (err) {

                        } else {
                            Meteor._reload.reload();
                        }
                    });

                }
            }
        }
    },
    'click .btnBack': function(event) {
        playCancelAudio();
        event.preventDefault();
        setTimeout(function() {
            history.back(1);
        }, delayTimeAfterSound);
    }

});

Template.registerHelper('equals', function(a, b) {
    return a === b;
});