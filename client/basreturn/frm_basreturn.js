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

Template.basreturn.onCreated(() => {
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
    templateObject.deptrecords = new ReactiveVar([]);
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
    templateObject.taxSummaryListT3 = new ReactiveVar([]);
    templateObject.accountsList = new ReactiveVar([]);
    templateObject.availableCategories = new ReactiveVar([]);
    templateObject.pageTitle = new ReactiveVar();
    templateObject.getId = new ReactiveVar();
    templateObject.reasonT4 = new ReactiveVar([]);
    templateObject.reasonF4 = new ReactiveVar([]);
    templateObject.basreturnData = new ReactiveVar([]);
});

Template.basreturn.onRendered(function() {
    let templateObject = Template.instance();
    let utilityService = new UtilityService();
    let productService = new ProductService();
    let accountService = new AccountService();
    let purchaseService = new PurchaseBoardService();
    let taxRateList = new Array();
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
    //     .getBASReturnDetail()
    //     .then(function(data) {
    //     })
    //     .catch(function(err) {
    //         // Bert.alert('<strong>' + err + '</strong>!', 'danger');
    //         $(".fullScreenSpin").css("display", "none");
    //         // Meteor._reload.reload();
    //     });

    // accountService
    //     .getBASReturnLines()
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
                            if (data.ttaxcodevs1[i].RegionName == "Australia") {
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
                    }).catch(function(err) {
                        $('.fullScreenSpin').css('display', 'none');
                    });
                } else {
                    let data = JSON.parse(dataObject[0].data);
                    let useData = data.ttaxcodevs1;
                    for (let i = 0; i < useData.length; i++) {
                        if (useData[i].RegionName == "Australia") {
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
                        if (data.ttaxcodevs1[i].RegionName == "Australia") {
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

    templateObject.getAccountLists = function() {
        getVS1Data("TAccountVS1")
            .then(function(dataObject) {
                if (dataObject.length == 0) {
                    accountService
                        .getAccountListVS1()
                        .then(function(data) {
                            setAccountListVS1(data);
                        })
                        .catch(function(err) {
                            // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                            $(".fullScreenSpin").css("display", "none");
                            // Meteor._reload.reload();
                        });
                } else {
                    let data = JSON.parse(dataObject[0].data);
                    setAccountListVS1(data, true);
                }
            })
            .catch(function(err) {
                accountService
                    .getAccountListVS1()
                    .then(function(data) {
                        setAccountListVS1(data);
                    })
                    .catch(function(err) {
                        // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                        $(".fullScreenSpin").css("display", "none");
                        // Meteor._reload.reload();
                    });
            });
    };

    function setAccountListVS1(data, isField = false) {

        //addVS1Data('TAccountVS1', JSON.stringify(data));
        let lineItems = [];
        let lineItemObj = {};
        let fullAccountTypeName = "";
        let accBalance = "";
        dataTableList = [];

        for (let i = 0; i < data.taccountvs1.length; i++) {
            let lineData = data.taccountvs1[i];
            if (isField) {
                lineData = data.taccountvs1[i].fields;
            }
            if (accountTypeList) {
                for (var j = 0; j < accountTypeList.length; j++) {
                    if (
                        lineData.AccountTypeName ===
                        accountTypeList[j].accounttypename
                    ) {
                        fullAccountTypeName = accountTypeList[j].description || "";
                    }
                }
            }

            if (!isNaN(lineData.Balance)) {
                accBalance = utilityService.modifynegativeCurrencyFormat(lineData.Balance) || 0.0;
            } else {
                accBalance = Currency + "0.00";
            }
            if (data.taccountvs1[i].fields.ReceiptCategory && data.taccountvs1[i].fields.ReceiptCategory != '') {
                usedCategories.push(data.taccountvs1[i].fields);
            }

            var dataList = {
                id: lineData.ID || lineData.Id || "",
                accountname: lineData.AccountName || "",
                description: lineData.Description || "",
                accountnumber: lineData.AccountNumber || "",
                accounttypename: fullAccountTypeName || lineData.AccountTypeName,
                accounttypeshort: lineData.AccountTypeName || "",
                taxcode: lineData.TaxCode || "",
                bankaccountname: lineData.BankAccountName || "",
                bankname: lineData.BankName || "",
                bsb: lineData.BSB || "",
                bankaccountnumber: lineData.BankAccountNumber || "",
                swiftcode: lineData.Extra || "",
                routingNo: lineData.BankCode || "",
                apcanumber: lineData.BankNumber || "",
                balanceNumber: lineData.Balance || 0.0,
                balance: accBalance || 0.0,
                isheader: lineData.IsHeader || false,
                cardnumber: lineData.CarNumber || "",
                expirydate: lineData.ExpiryDate || "",
                cvc: lineData.CVC || "",
                useReceiptClaim: lineData.AllowExpenseClaim || false,
                expenseCategory: lineData.AccountGroup || ""
            };
            dataTableList.push(dataList);
        }

        usedCategories = [...new Set(usedCategories)];
        let availableCategories = categories.filter((item) => !usedCategories.includes(item));
        templateObject.availableCategories.set(availableCategories);
        templateObject.accountsList.set(dataTableList);

        categories.forEach((citem, j) => {
            let cdataList = null;
            let match = usedCategories.filter((item) => (item.ReceiptCategory == citem));
            if (match.length > 0) {
                let temp = match[0];
                cdataList = [
                    citem,
                    temp.AccountName || '',
                    temp.Description || '',
                    temp.AccountNumber || '',
                    temp.TaxCode || '',
                    temp.ID || ''
                ];
            } else {
                cdataList = [
                    citem,
                    '',
                    '',
                    '',
                    '',
                    ''
                ];
            }
            categoryAccountList.push(cdataList);
        });

        // if (templateObject.accountsList.get()) {
        //     setTimeout(function() {
        //         MakeNegative();
        //     }, 100);
        // }
    }

    templateObject.getAccountLists();

    templateObject.getAllBasReturnData = function() {

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

        getVS1Data('TBASReturn').then(function(dataObject) {
            let taxRateList = templateObject.taxRateList.get();
            let accountsList = templateObject.accountsList.get();
            let deptrecords = templateObject.deptrecords.get();
            if (dataObject.length == 0) {
                reportService.getAllBASReturn().then(function(data) {
                    for (let i = 0; i < data.tbasreturn.length; i++) {
                        if (getid == "") {
                            if (i == 0) {
                                if (data.tbasreturn[i].fields.AccMethod == "Accrual") {
                                    $("#accountingmethod1").prop('checked', true);
                                    $("#accountingmethod2").prop('checked', false);
                                } else {
                                    $("#accountingmethod1").prop('checked', false);
                                    $("#accountingmethod2").prop('checked', true);
                                }

                                if (data.tbasreturn[i].fields.Tab1_Type == "Quarterly") {
                                    $("#datemethod1").prop('checked', true);
                                    $("#datemethod2").prop('checked', false);
                                } else {
                                    $("#datemethod1").prop('checked', false);
                                    $("#datemethod2").prop('checked', true);
                                }

                                if (data.tbasreturn[i].fields.Tab2_Type == "Quarterly") {
                                    $("#datemethod1-t2").prop('checked', true);
                                    $("#datemethod2-t2").prop('checked', false);
                                } else {
                                    $("#datemethod1-t2").prop('checked', false);
                                    $("#datemethod2-t2").prop('checked', true);
                                }

                                if (data.tbasreturn[i].fields.Tab3_Type == "Quarterly") {
                                    $("#datemethod1-t2-2").prop('checked', true);
                                    $("#datemethod2-t2-2").prop('checked', false);
                                } else {
                                    $("#datemethod1-t2-2").prop('checked', false);
                                    $("#datemethod2-t2-2").prop('checked', true);
                                }

                                if (data.tbasreturn[i].fields.Tab4_Type == "Quarterly") {
                                    $("#datemethod1-t3").prop('checked', true);
                                    $("#datemethod2-t3").prop('checked', false);
                                } else {
                                    $("#datemethod1-t3").prop('checked', false);
                                    $("#datemethod2-t3").prop('checked', true);
                                }

                                shareFunctionByName.initTable(data.tbasreturn[i].fields.G1Selected, "tbltaxCodeCheckbox_G1");
                                shareFunctionByName.initTable(data.tbasreturn[i].fields.G2Selected, "tbltaxCodeCheckbox_G2");
                                shareFunctionByName.initTable(data.tbasreturn[i].fields.G3Selected, "tbltaxCodeCheckbox_G3");
                                shareFunctionByName.initTable(data.tbasreturn[i].fields.G4Selected, "tbltaxCodeCheckbox_G4");
                                shareFunctionByName.initTable(data.tbasreturn[i].fields.G7Selected, "tbltaxCodeCheckbox_G7");
                                shareFunctionByName.initTable(data.tbasreturn[i].fields.G10Selected, "tbltaxCodeCheckbox_G10");
                                shareFunctionByName.initTable(data.tbasreturn[i].fields.G11Selected, "tbltaxCodeCheckbox_G11");
                                shareFunctionByName.initTable(data.tbasreturn[i].fields.G13Selected, "tbltaxCodeCheckbox_G13");
                                shareFunctionByName.initTable(data.tbasreturn[i].fields.G14Selected, "tbltaxCodeCheckbox_G14");
                                shareFunctionByName.initTable(data.tbasreturn[i].fields.G15Selected, "tbltaxCodeCheckbox_G15");
                                shareFunctionByName.initTable(data.tbasreturn[i].fields.G18Selected, "tbltaxCodeCheckbox_G18");
                                shareFunctionByName.initTable(data.tbasreturn[i].fields._1CSelected, "tbltaxCodeCheckbox_1C");
                                shareFunctionByName.initTable(data.tbasreturn[i].fields._1ESelected, "tbltaxCodeCheckbox_1E");
                                shareFunctionByName.initTable(data.tbasreturn[i].fields._1DSelected, "tbltaxCodeCheckbox_1D");
                                shareFunctionByName.initTable(data.tbasreturn[i].fields._1FSelected, "tbltaxCodeCheckbox_1F");
                                shareFunctionByName.initTable(data.tbasreturn[i].fields._1GSelected, "tbltaxCodeCheckbox_1G");

                                shareFunctionByName.initTable(data.tbasreturn[i].fields.W1Selected, "tblaccountsCheckbox_W1");
                                shareFunctionByName.initTable(data.tbasreturn[i].fields.W2Selected, "tblaccountsCheckbox_W2");
                                shareFunctionByName.initTable(data.tbasreturn[i].fields.W3Selected, "tblaccountsCheckbox_W3");
                                shareFunctionByName.initTable(data.tbasreturn[i].fields.W4Selected, "tblaccountsCheckbox_W4");
                                shareFunctionByName.initTable(data.tbasreturn[i].fields.T1Selected, "tblaccountsCheckbox_T1");
                                shareFunctionByName.initTable(data.tbasreturn[i].fields._7DSelected, "tblaccountsCheckbox_7D");
                            }
                            if ($("#previousStartDate").val() == "" && data.tbasreturn[i].fields.Tab1_Year > 0 && data.tbasreturn[i].fields.Tab1_Month != "") {
                                let previousStartDate = data.tbasreturn[i].fields.Tab1_Year + "-" + months[data.tbasreturn[i].fields.Tab1_Month] + "-01";
                                let previousEndDate = "";
                                var endMonth = (data.tbasreturn[i].fields.Tab1_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tbasreturn[i].fields.Tab1_Month]) / 3) * 3) : (months[data.tbasreturn[i].fields.Tab1_Month]);
                                previousEndDate = new Date(data.tbasreturn[i].fields.Tab1_Year, (parseInt(endMonth)), 0);
                                previousEndDate = moment(previousEndDate).format("YYYY-MM-DD");
                                $("#previousStartDate").val(previousStartDate);
                                $("#previousEndDate").val(previousEndDate);
                                var fromDate = new Date(data.tbasreturn[i].fields.Tab1_Year, parseInt(endMonth), 1);
                                fromDate = moment(fromDate).format("YYYY-MM-DD");
                                for (var key in months) {
                                    if (months[key] == fromDate.split("-")[1]) {
                                        $("#beginmonthlydate").val(key);
                                    }
                                }
                                $("#currentyear").val(fromDate.split("-")[0]);
                                if (data.tbasreturn[i].fields.Tab1_Type == "Quarterly") {
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
                            if ($("#previousStartDate-t2").val() == "" && data.tbasreturn[i].fields.Tab2_Year > 0 && data.tbasreturn[i].fields.Tab2_Month != "") {
                                let previousStartDate = data.tbasreturn[i].fields.Tab2_Year + "-" + months[data.tbasreturn[i].fields.Tab2_Month] + "-01";
                                let previousEndDate = "";
                                var endMonth = (data.tbasreturn[i].fields.Tab2_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tbasreturn[i].fields.Tab2_Month]) / 3) * 3) : (months[data.tbasreturn[i].fields.Tab2_Month]);
                                previousEndDate = new Date(data.tbasreturn[i].fields.Tab2_Year, (parseInt(endMonth)), 0);
                                previousEndDate = moment(previousEndDate).format("YYYY-MM-DD");
                                $("#previousStartDate-t2").val(previousStartDate);
                                $("#previousEndDate-t2").val(previousEndDate);
                                var fromDate = new Date(data.tbasreturn[i].fields.Tab2_Year, parseInt(endMonth), 1);
                                fromDate = moment(fromDate).format("YYYY-MM-DD");
                                for (var key in months) {
                                    if (months[key] == fromDate.split("-")[1]) {
                                        $("#beginmonthlydate-t2").val(key);
                                    }
                                }
                                $("#currentyear-t2").val(fromDate.split("-")[0]);
                                if (data.tbasreturn[i].fields.Tab2_Type == "Quarterly") {
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
                            if ($("#previousStartDate-t2-2").val() == "" && data.tbasreturn[i].fields.Tab3_Year > 0 && data.tbasreturn[i].fields.Tab3_Month != "") {
                                let previousStartDate = data.tbasreturn[i].fields.Tab3_Year + "-" + months[data.tbasreturn[i].fields.Tab3_Month] + "-01";
                                let previousEndDate = "";
                                var endMonth = (data.tbasreturn[i].fields.Tab3_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tbasreturn[i].fields.Tab3_Month]) / 3) * 3) : (months[data.tbasreturn[i].fields.Tab3_Month]);
                                previousEndDate = new Date(data.tbasreturn[i].fields.Tab3_Year, (parseInt(endMonth)), 0);
                                previousEndDate = moment(previousEndDate).format("YYYY-MM-DD");
                                $("#previousStartDate-t2-2").val(previousStartDate);
                                $("#previousEndDate-t2-2").val(previousEndDate);
                                var fromDate = new Date(data.tbasreturn[i].fields.Tab3_Year, parseInt(endMonth), 1);
                                fromDate = moment(fromDate).format("YYYY-MM-DD");
                                for (var key in months) {
                                    if (months[key] == fromDate.split("-")[1]) {
                                        $("#beginmonthlydate-t2-2").val(key);
                                    }
                                }
                                $("#currentyear-t2-2").val(fromDate.split("-")[0]);
                                if (data.tbasreturn[i].fields.Tab3_Type == "Quarterly") {
                                    endMonth = Math.ceil(parseInt(fromDate.split("-")[1]) / 3) * 3;
                                    var toDate = new Date(fromDate.split("-")[0], (parseInt(endMonth)), 0);
                                    toDate = moment(toDate).format("YYYY-MM-DD");
                                    $("#endDate-t2-2").val(toDate);
                                } else {
                                    endMonth = parseInt(fromDate.split("-")[1]);
                                    var toDate = new Date(fromDate.split("-")[0], (parseInt(endMonth)), 0);
                                    toDate = moment(toDate).format("YYYY-MM-DD");
                                    $("#endDate-t2-2").val(toDate);
                                }
                            }
                            if ($("#previousStartDate-t3").val() == "" && data.tbasreturn[i].fields.Tab4_Year > 0 && data.tbasreturn[i].fields.Tab4_Month != "") {
                                let previousStartDate = data.tbasreturn[i].fields.Tab4_Year + "-" + months[data.tbasreturn[i].fields.Tab4_Month] + "-01";
                                let previousEndDate = "";
                                var endMonth = (data.tbasreturn[i].fields.Tab4_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tbasreturn[i].fields.Tab4_Month]) / 3) * 3) : (months[data.tbasreturn[i].fields.Tab4_Month]);
                                previousEndDate = new Date(data.tbasreturn[i].fields.Tab4_Year, (parseInt(endMonth)), 0);
                                previousEndDate = moment(previousEndDate).format("YYYY-MM-DD");
                                $("#previousStartDate-t3").val(previousStartDate);
                                $("#previousEndDate-t3").val(previousEndDate);
                                var fromDate = new Date(data.tbasreturn[i].fields.Tab4_Year, parseInt(endMonth), 1);
                                fromDate = moment(fromDate).format("YYYY-MM-DD");
                                for (var key in months) {
                                    if (months[key] == fromDate.split("-")[1]) {
                                        $("#beginmonthlydate-t3").val(key);
                                    }
                                }
                                $("#currentyear-t3").val(fromDate.split("-")[0]);
                                if (data.tbasreturn[i].fields.Tab4_Type == "Quarterly") {
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
                            if (getid > data.tbasreturn[i].fields.ID) {
                                if ($("#previousStartDate").val() == "" && data.tbasreturn[i].fields.Tab1_Year > 0 && data.tbasreturn[i].fields.Tab1_Month != "") {
                                    let previousStartDate = data.tbasreturn[i].fields.Tab1_Year + "-" + months[data.tbasreturn[i].fields.Tab1_Month] + "-01";
                                    let previousEndDate = "";
                                    var endMonth = (data.tbasreturn[i].fields.Tab1_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tbasreturn[i].fields.Tab1_Month]) / 3) * 3) : (months[data.tbasreturn[i].fields.Tab1_Month]);
                                    previousEndDate = new Date(data.tbasreturn[i].fields.Tab1_Year, (parseInt(endMonth)), 0);
                                    previousEndDate = moment(previousEndDate).format("YYYY-MM-DD");
                                    $("#previousStartDate").val(previousStartDate);
                                    $("#previousEndDate").val(previousEndDate);
                                }
                                if ($("#previousStartDate-t2").val() == "" && data.tbasreturn[i].fields.Tab2_Year > 0 && data.tbasreturn[i].fields.Tab2_Month != "") {
                                    let previousStartDate = data.tbasreturn[i].fields.Tab2_Year + "-" + months[data.tbasreturn[i].fields.Tab2_Month] + "-01";
                                    let previousEndDate = "";
                                    var endMonth = (data.tbasreturn[i].fields.Tab2_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tbasreturn[i].fields.Tab2_Month]) / 3) * 3) : (months[data.tbasreturn[i].fields.Tab2_Month]);
                                    previousEndDate = new Date(data.tbasreturn[i].fields.Tab2_Year, (parseInt(endMonth)), 0);
                                    previousEndDate = moment(previousEndDate).format("YYYY-MM-DD");
                                    $("#previousStartDate-t2").val(previousStartDate);
                                    $("#previousEndDate-t2").val(previousEndDate);
                                }
                                if ($("#previousStartDate-t2-2").val() == "" && data.tbasreturn[i].fields.Tab3_Year > 0 && data.tbasreturn[i].fields.Tab3_Month != "") {
                                    let previousStartDate = data.tbasreturn[i].fields.Tab3_Year + "-" + months[data.tbasreturn[i].fields.Tab3_Month] + "-01";
                                    let previousEndDate = "";
                                    var endMonth = (data.tbasreturn[i].fields.Tab3_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tbasreturn[i].fields.Tab3_Month]) / 3) * 3) : (months[data.tbasreturn[i].fields.Tab3_Month]);
                                    previousEndDate = new Date(data.tbasreturn[i].fields.Tab3_Year, (parseInt(endMonth)), 0);
                                    previousEndDate = moment(previousEndDate).format("YYYY-MM-DD");
                                    $("#previousStartDate-t2-2").val(previousStartDate);
                                    $("#previousEndDate-t2-2").val(previousEndDate);
                                }
                                if ($("#previousStartDate-t3").val() == "" && data.tbasreturn[i].fields.Tab4_Year > 0 && data.tbasreturn[i].fields.Tab4_Month != "") {
                                    let previousStartDate = data.tbasreturn[i].fields.Tab4_Year + "-" + months[data.tbasreturn[i].fields.Tab4_Month] + "-01";
                                    let previousEndDate = "";
                                    var endMonth = (data.tbasreturn[i].fields.Tab4_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tbasreturn[i].fields.Tab4_Month]) / 3) * 3) : (months[data.tbasreturn[i].fields.Tab4_Month]);
                                    previousEndDate = new Date(data.tbasreturn[i].fields.Tab4_Year, (parseInt(endMonth)), 0);
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
                for (let i = 0; i < data.tbasreturn.length; i++) {
                    if (getid == "") {
                        if (i == 0) {
                            if (data.tbasreturn[i].fields.AccMethod == "Accrual") {
                                $("#accountingmethod1").prop('checked', true);
                                $("#accountingmethod2").prop('checked', false);
                            } else {
                                $("#accountingmethod1").prop('checked', false);
                                $("#accountingmethod2").prop('checked', true);
                            }

                            if (data.tbasreturn[i].fields.Tab1_Type == "Quarterly") {
                                $("#datemethod1").prop('checked', true);
                                $("#datemethod2").prop('checked', false);
                            } else {
                                $("#datemethod1").prop('checked', false);
                                $("#datemethod2").prop('checked', true);
                            }

                            if (data.tbasreturn[i].fields.Tab2_Type == "Quarterly") {
                                $("#datemethod1-t2").prop('checked', true);
                                $("#datemethod2-t2").prop('checked', false);
                            } else {
                                $("#datemethod1-t2").prop('checked', false);
                                $("#datemethod2-t2").prop('checked', true);
                            }

                            if (data.tbasreturn[i].fields.Tab3_Type == "Quarterly") {
                                $("#datemethod1-t2-2").prop('checked', true);
                                $("#datemethod2-t2-2").prop('checked', false);
                            } else {
                                $("#datemethod1-t2-2").prop('checked', false);
                                $("#datemethod2-t2-2").prop('checked', true);
                            }

                            if (data.tbasreturn[i].fields.Tab4_Type == "Quarterly") {
                                $("#datemethod1-t3").prop('checked', true);
                                $("#datemethod2-t3").prop('checked', false);
                            } else {
                                $("#datemethod1-t3").prop('checked', false);
                                $("#datemethod2-t3").prop('checked', true);
                            }

                            shareFunctionByName.initTable(data.tbasreturn[i].fields.G1Selected, "tbltaxCodeCheckbox_G1");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields.G2Selected, "tbltaxCodeCheckbox_G2");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields.G3Selected, "tbltaxCodeCheckbox_G3");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields.G4Selected, "tbltaxCodeCheckbox_G4");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields.G7Selected, "tbltaxCodeCheckbox_G7");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields.G10Selected, "tbltaxCodeCheckbox_G10");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields.G11Selected, "tbltaxCodeCheckbox_G11");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields.G13Selected, "tbltaxCodeCheckbox_G13");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields.G14Selected, "tbltaxCodeCheckbox_G14");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields.G15Selected, "tbltaxCodeCheckbox_G15");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields.G18Selected, "tbltaxCodeCheckbox_G18");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields._1CSelected, "tbltaxCodeCheckbox_1C");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields._1ESelected, "tbltaxCodeCheckbox_1E");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields._1DSelected, "tbltaxCodeCheckbox_1D");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields._1FSelected, "tbltaxCodeCheckbox_1F");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields._1GSelected, "tbltaxCodeCheckbox_1G");

                            shareFunctionByName.initTable(data.tbasreturn[i].fields.W1Selected, "tblaccountsCheckbox_W1");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields.W2Selected, "tblaccountsCheckbox_W2");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields.W3Selected, "tblaccountsCheckbox_W3");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields.W4Selected, "tblaccountsCheckbox_W4");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields.T1Selected, "tblaccountsCheckbox_T1");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields._7DSelected, "tblaccountsCheckbox_7D");
                        }
                        if ($("#previousStartDate").val() == "" && data.tbasreturn[i].fields.Tab1_Year > 0 && data.tbasreturn[i].fields.Tab1_Month != "") {
                            let previousStartDate = data.tbasreturn[i].fields.Tab1_Year + "-" + months[data.tbasreturn[i].fields.Tab1_Month] + "-01";
                            let previousEndDate = "";
                            var endMonth = (data.tbasreturn[i].fields.Tab1_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tbasreturn[i].fields.Tab1_Month]) / 3) * 3) : (months[data.tbasreturn[i].fields.Tab1_Month]);
                            previousEndDate = new Date(data.tbasreturn[i].fields.Tab1_Year, (parseInt(endMonth)), 0);
                            previousEndDate = moment(previousEndDate).format("YYYY-MM-DD");
                            $("#previousStartDate").val(previousStartDate);
                            $("#previousEndDate").val(previousEndDate);
                            var fromDate = new Date(data.tbasreturn[i].fields.Tab1_Year, parseInt(endMonth), 1);
                            fromDate = moment(fromDate).format("YYYY-MM-DD");
                            for (var key in months) {
                                if (months[key] == fromDate.split("-")[1]) {
                                    $("#beginmonthlydate").val(key);
                                }
                            }
                            $("#currentyear").val(fromDate.split("-")[0]);
                            if (data.tbasreturn[i].fields.Tab1_Type == "Quarterly") {
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
                        if ($("#previousStartDate-t2").val() == "" && data.tbasreturn[i].fields.Tab2_Year > 0 && data.tbasreturn[i].fields.Tab2_Month != "") {
                            let previousStartDate = data.tbasreturn[i].fields.Tab2_Year + "-" + months[data.tbasreturn[i].fields.Tab2_Month] + "-01";
                            let previousEndDate = "";
                            var endMonth = (data.tbasreturn[i].fields.Tab2_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tbasreturn[i].fields.Tab2_Month]) / 3) * 3) : (months[data.tbasreturn[i].fields.Tab2_Month]);
                            previousEndDate = new Date(data.tbasreturn[i].fields.Tab2_Year, (parseInt(endMonth)), 0);
                            previousEndDate = moment(previousEndDate).format("YYYY-MM-DD");
                            $("#previousStartDate-t2").val(previousStartDate);
                            $("#previousEndDate-t2").val(previousEndDate);
                            var fromDate = new Date(data.tbasreturn[i].fields.Tab2_Year, parseInt(endMonth), 1);
                            fromDate = moment(fromDate).format("YYYY-MM-DD");
                            for (var key in months) {
                                if (months[key] == fromDate.split("-")[1]) {
                                    $("#beginmonthlydate-t2").val(key);
                                }
                            }
                            $("#currentyear-t2").val(fromDate.split("-")[0]);
                            if (data.tbasreturn[i].fields.Tab2_Type == "Quarterly") {
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
                        if ($("#previousStartDate-t2-2").val() == "" && data.tbasreturn[i].fields.Tab3_Year > 0 && data.tbasreturn[i].fields.Tab3_Month != "") {
                            let previousStartDate = data.tbasreturn[i].fields.Tab3_Year + "-" + months[data.tbasreturn[i].fields.Tab3_Month] + "-01";
                            let previousEndDate = "";
                            var endMonth = (data.tbasreturn[i].fields.Tab3_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tbasreturn[i].fields.Tab3_Month]) / 3) * 3) : (months[data.tbasreturn[i].fields.Tab3_Month]);
                            previousEndDate = new Date(data.tbasreturn[i].fields.Tab3_Year, (parseInt(endMonth)), 0);
                            previousEndDate = moment(previousEndDate).format("YYYY-MM-DD");
                            $("#previousStartDate-t2-2").val(previousStartDate);
                            $("#previousEndDate-t2-2").val(previousEndDate);
                            var fromDate = new Date(data.tbasreturn[i].fields.Tab3_Year, parseInt(endMonth), 1);
                            fromDate = moment(fromDate).format("YYYY-MM-DD");
                            for (var key in months) {
                                if (months[key] == fromDate.split("-")[1]) {
                                    $("#beginmonthlydate-t2-2").val(key);
                                }
                            }
                            $("#currentyear-t2-2").val(fromDate.split("-")[0]);
                            if (data.tbasreturn[i].fields.Tab3_Type == "Quarterly") {
                                endMonth = Math.ceil(parseInt(fromDate.split("-")[1]) / 3) * 3;
                                var toDate = new Date(fromDate.split("-")[0], (parseInt(endMonth)), 0);
                                toDate = moment(toDate).format("YYYY-MM-DD");
                                $("#endDate-t2-2").val(toDate);
                            } else {
                                endMonth = parseInt(fromDate.split("-")[1]);
                                var toDate = new Date(fromDate.split("-")[0], (parseInt(endMonth)), 0);
                                toDate = moment(toDate).format("YYYY-MM-DD");
                                $("#endDate-t2-2").val(toDate);
                            }
                        }
                        if ($("#previousStartDate-t3").val() == "" && data.tbasreturn[i].fields.Tab4_Year > 0 && data.tbasreturn[i].fields.Tab4_Month != "") {
                            let previousStartDate = data.tbasreturn[i].fields.Tab4_Year + "-" + months[data.tbasreturn[i].fields.Tab4_Month] + "-01";
                            let previousEndDate = "";
                            var endMonth = (data.tbasreturn[i].fields.Tab4_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tbasreturn[i].fields.Tab4_Month]) / 3) * 3) : (months[data.tbasreturn[i].fields.Tab4_Month]);
                            previousEndDate = new Date(data.tbasreturn[i].fields.Tab4_Year, (parseInt(endMonth)), 0);
                            previousEndDate = moment(previousEndDate).format("YYYY-MM-DD");
                            $("#previousStartDate-t3").val(previousStartDate);
                            $("#previousEndDate-t3").val(previousEndDate);
                            var fromDate = new Date(data.tbasreturn[i].fields.Tab4_Year, parseInt(endMonth), 1);
                            fromDate = moment(fromDate).format("YYYY-MM-DD");
                            for (var key in months) {
                                if (months[key] == fromDate.split("-")[1]) {
                                    $("#beginmonthlydate-t3").val(key);
                                }
                            }
                            $("#currentyear-t3").val(fromDate.split("-")[0]);
                            if (data.tbasreturn[i].fields.Tab4_Type == "Quarterly") {
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
                        if (getid > data.tbasreturn[i].fields.ID) {
                            if ($("#previousStartDate").val() == "" && data.tbasreturn[i].fields.Tab1_Year > 0 && data.tbasreturn[i].fields.Tab1_Month != "") {
                                let previousStartDate = data.tbasreturn[i].fields.Tab1_Year + "-" + months[data.tbasreturn[i].fields.Tab1_Month] + "-01";
                                let previousEndDate = "";
                                var endMonth = (data.tbasreturn[i].fields.Tab1_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tbasreturn[i].fields.Tab1_Month]) / 3) * 3) : (months[data.tbasreturn[i].fields.Tab1_Month]);
                                previousEndDate = new Date(data.tbasreturn[i].fields.Tab1_Year, (parseInt(endMonth)), 0);
                                previousEndDate = moment(previousEndDate).format("YYYY-MM-DD");
                                $("#previousStartDate").val(previousStartDate);
                                $("#previousEndDate").val(previousEndDate);
                            }
                            if ($("#previousStartDate-t2").val() == "" && data.tbasreturn[i].fields.Tab2_Year > 0 && data.tbasreturn[i].fields.Tab2_Month != "") {
                                let previousStartDate = data.tbasreturn[i].fields.Tab2_Year + "-" + months[data.tbasreturn[i].fields.Tab2_Month] + "-01";
                                let previousEndDate = "";
                                var endMonth = (data.tbasreturn[i].fields.Tab2_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tbasreturn[i].fields.Tab2_Month]) / 3) * 3) : (months[data.tbasreturn[i].fields.Tab2_Month]);
                                previousEndDate = new Date(data.tbasreturn[i].fields.Tab2_Year, (parseInt(endMonth)), 0);
                                previousEndDate = moment(previousEndDate).format("YYYY-MM-DD");
                                $("#previousStartDate-t2").val(previousStartDate);
                                $("#previousEndDate-t2").val(previousEndDate);
                            }
                            if ($("#previousStartDate-t2-2").val() == "" && data.tbasreturn[i].fields.Tab3_Year > 0 && data.tbasreturn[i].fields.Tab3_Month != "") {
                                let previousStartDate = data.tbasreturn[i].fields.Tab3_Year + "-" + months[data.tbasreturn[i].fields.Tab3_Month] + "-01";
                                let previousEndDate = "";
                                var endMonth = (data.tbasreturn[i].fields.Tab3_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tbasreturn[i].fields.Tab3_Month]) / 3) * 3) : (months[data.tbasreturn[i].fields.Tab3_Month]);
                                previousEndDate = new Date(data.tbasreturn[i].fields.Tab3_Year, (parseInt(endMonth)), 0);
                                previousEndDate = moment(previousEndDate).format("YYYY-MM-DD");
                                $("#previousStartDate-t2-2").val(previousStartDate);
                                $("#previousEndDate-t2-2").val(previousEndDate);
                            }
                            if ($("#previousStartDate-t3").val() == "" && data.tbasreturn[i].fields.Tab4_Year > 0 && data.tbasreturn[i].fields.Tab4_Month != "") {
                                let previousStartDate = data.tbasreturn[i].fields.Tab4_Year + "-" + months[data.tbasreturn[i].fields.Tab4_Month] + "-01";
                                let previousEndDate = "";
                                var endMonth = (data.tbasreturn[i].fields.Tab4_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tbasreturn[i].fields.Tab4_Month]) / 3) * 3) : (months[data.tbasreturn[i].fields.Tab4_Month]);
                                previousEndDate = new Date(data.tbasreturn[i].fields.Tab4_Year, (parseInt(endMonth)), 0);
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
            let accountsList = templateObject.accountsList.get();

            alert(3);

            reportService.getAllBASReturn().then(function(data) {
                for (let i = 0; i < data.tbasreturn.length; i++) {
                    if (getid == "") {
                        if (i == 0) {
                            if (data.tbasreturn[i].fields.AccMethod == "Accrual") {
                                $("#accountingmethod1").prop('checked', true);
                                $("#accountingmethod2").prop('checked', false);
                            } else {
                                $("#accountingmethod1").prop('checked', false);
                                $("#accountingmethod2").prop('checked', true);
                            }

                            if (data.tbasreturn[i].fields.Tab1_Type == "Quarterly") {
                                $("#datemethod1").prop('checked', true);
                                $("#datemethod2").prop('checked', false);
                            } else {
                                $("#datemethod1").prop('checked', false);
                                $("#datemethod2").prop('checked', true);
                            }

                            if (data.tbasreturn[i].fields.Tab2_Type == "Quarterly") {
                                $("#datemethod1-t2").prop('checked', true);
                                $("#datemethod2-t2").prop('checked', false);
                            } else {
                                $("#datemethod1-t2").prop('checked', false);
                                $("#datemethod2-t2").prop('checked', true);
                            }

                            if (data.tbasreturn[i].fields.Tab3_Type == "Quarterly") {
                                $("#datemethod1-t2-2").prop('checked', true);
                                $("#datemethod2-t2-2").prop('checked', false);
                            } else {
                                $("#datemethod1-t2-2").prop('checked', false);
                                $("#datemethod2-t2-2").prop('checked', true);
                            }

                            if (data.tbasreturn[i].fields.Tab4_Type == "Quarterly") {
                                $("#datemethod1-t3").prop('checked', true);
                                $("#datemethod2-t3").prop('checked', false);
                            } else {
                                $("#datemethod1-t3").prop('checked', false);
                                $("#datemethod2-t3").prop('checked', true);
                            }

                            shareFunctionByName.initTable(data.tbasreturn[i].fields.G1Selected, "tbltaxCodeCheckbox_G1");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields.G2Selected, "tbltaxCodeCheckbox_G2");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields.G3Selected, "tbltaxCodeCheckbox_G3");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields.G4Selected, "tbltaxCodeCheckbox_G4");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields.G7Selected, "tbltaxCodeCheckbox_G7");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields.G10Selected, "tbltaxCodeCheckbox_G10");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields.G11Selected, "tbltaxCodeCheckbox_G11");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields.G13Selected, "tbltaxCodeCheckbox_G13");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields.G14Selected, "tbltaxCodeCheckbox_G14");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields.G15Selected, "tbltaxCodeCheckbox_G15");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields.G18Selected, "tbltaxCodeCheckbox_G18");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields._1CSelected, "tbltaxCodeCheckbox_1C");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields._1ESelected, "tbltaxCodeCheckbox_1E");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields._1DSelected, "tbltaxCodeCheckbox_1D");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields._1FSelected, "tbltaxCodeCheckbox_1F");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields._1GSelected, "tbltaxCodeCheckbox_1G");

                            shareFunctionByName.initTable(data.tbasreturn[i].fields.W1Selected, "tblaccountsCheckbox_W1");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields.W2Selected, "tblaccountsCheckbox_W2");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields.W3Selected, "tblaccountsCheckbox_W3");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields.W4Selected, "tblaccountsCheckbox_W4");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields.T1Selected, "tblaccountsCheckbox_T1");
                            shareFunctionByName.initTable(data.tbasreturn[i].fields._7DSelected, "tblaccountsCheckbox_7D");
                        }
                        if ($("#previousStartDate").val() == "" && data.tbasreturn[i].fields.Tab1_Year > 0 && data.tbasreturn[i].fields.Tab1_Month != "") {
                            let previousStartDate = data.tbasreturn[i].fields.Tab1_Year + "-" + months[data.tbasreturn[i].fields.Tab1_Month] + "-01";
                            let previousEndDate = "";
                            var endMonth = (data.tbasreturn[i].fields.Tab1_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tbasreturn[i].fields.Tab1_Month]) / 3) * 3) : (months[data.tbasreturn[i].fields.Tab1_Month]);
                            previousEndDate = new Date(data.tbasreturn[i].fields.Tab1_Year, (parseInt(endMonth)), 0);
                            previousEndDate = moment(previousEndDate).format("YYYY-MM-DD");
                            $("#previousStartDate").val(previousStartDate);
                            $("#previousEndDate").val(previousEndDate);
                            var fromDate = new Date(data.tbasreturn[i].fields.Tab1_Year, parseInt(endMonth), 1);
                            fromDate = moment(fromDate).format("YYYY-MM-DD");
                            for (var key in months) {
                                if (months[key] == fromDate.split("-")[1]) {
                                    $("#beginmonthlydate").val(key);
                                }
                            }
                            $("#currentyear").val(fromDate.split("-")[0]);
                            if (data.tbasreturn[i].fields.Tab1_Type == "Quarterly") {
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
                        if ($("#previousStartDate-t2").val() == "" && data.tbasreturn[i].fields.Tab2_Year > 0 && data.tbasreturn[i].fields.Tab2_Month != "") {
                            let previousStartDate = data.tbasreturn[i].fields.Tab2_Year + "-" + months[data.tbasreturn[i].fields.Tab2_Month] + "-01";
                            let previousEndDate = "";
                            var endMonth = (data.tbasreturn[i].fields.Tab2_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tbasreturn[i].fields.Tab2_Month]) / 3) * 3) : (months[data.tbasreturn[i].fields.Tab2_Month]);
                            previousEndDate = new Date(data.tbasreturn[i].fields.Tab2_Year, (parseInt(endMonth)), 0);
                            previousEndDate = moment(previousEndDate).format("YYYY-MM-DD");
                            $("#previousStartDate-t2").val(previousStartDate);
                            $("#previousEndDate-t2").val(previousEndDate);
                            var fromDate = new Date(data.tbasreturn[i].fields.Tab2_Year, parseInt(endMonth), 1);
                            fromDate = moment(fromDate).format("YYYY-MM-DD");
                            for (var key in months) {
                                if (months[key] == fromDate.split("-")[1]) {
                                    $("#beginmonthlydate-t2").val(key);
                                }
                            }
                            $("#currentyear-t2").val(fromDate.split("-")[0]);
                            if (data.tbasreturn[i].fields.Tab2_Type == "Quarterly") {
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
                        if ($("#previousStartDate-t2-2").val() == "" && data.tbasreturn[i].fields.Tab3_Year > 0 && data.tbasreturn[i].fields.Tab3_Month != "") {
                            let previousStartDate = data.tbasreturn[i].fields.Tab3_Year + "-" + months[data.tbasreturn[i].fields.Tab3_Month] + "-01";
                            let previousEndDate = "";
                            var endMonth = (data.tbasreturn[i].fields.Tab3_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tbasreturn[i].fields.Tab3_Month]) / 3) * 3) : (months[data.tbasreturn[i].fields.Tab3_Month]);
                            previousEndDate = new Date(data.tbasreturn[i].fields.Tab3_Year, (parseInt(endMonth)), 0);
                            previousEndDate = moment(previousEndDate).format("YYYY-MM-DD");
                            $("#previousStartDate-t2-2").val(previousStartDate);
                            $("#previousEndDate-t2-2").val(previousEndDate);
                            var fromDate = new Date(data.tbasreturn[i].fields.Tab3_Year, parseInt(endMonth), 1);
                            fromDate = moment(fromDate).format("YYYY-MM-DD");
                            for (var key in months) {
                                if (months[key] == fromDate.split("-")[1]) {
                                    $("#beginmonthlydate-t2-2").val(key);
                                }
                            }
                            $("#currentyear-t2-2").val(fromDate.split("-")[0]);
                            if (data.tbasreturn[i].fields.Tab3_Type == "Quarterly") {
                                endMonth = Math.ceil(parseInt(fromDate.split("-")[1]) / 3) * 3;
                                var toDate = new Date(fromDate.split("-")[0], (parseInt(endMonth)), 0);
                                toDate = moment(toDate).format("YYYY-MM-DD");
                                $("#endDate-t2-2").val(toDate);
                            } else {
                                endMonth = parseInt(fromDate.split("-")[1]);
                                var toDate = new Date(fromDate.split("-")[0], (parseInt(endMonth)), 0);
                                toDate = moment(toDate).format("YYYY-MM-DD");
                                $("#endDate-t2-2").val(toDate);
                            }
                        }
                        if ($("#previousStartDate-t3").val() == "" && data.tbasreturn[i].fields.Tab4_Year > 0 && data.tbasreturn[i].fields.Tab4_Month != "") {
                            let previousStartDate = data.tbasreturn[i].fields.Tab4_Year + "-" + months[data.tbasreturn[i].fields.Tab4_Month] + "-01";
                            let previousEndDate = "";
                            var endMonth = (data.tbasreturn[i].fields.Tab4_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tbasreturn[i].fields.Tab4_Month]) / 3) * 3) : (months[data.tbasreturn[i].fields.Tab4_Month]);
                            previousEndDate = new Date(data.tbasreturn[i].fields.Tab4_Year, (parseInt(endMonth)), 0);
                            previousEndDate = moment(previousEndDate).format("YYYY-MM-DD");
                            $("#previousStartDate-t3").val(previousStartDate);
                            $("#previousEndDate-t3").val(previousEndDate);
                            var fromDate = new Date(data.tbasreturn[i].fields.Tab4_Year, parseInt(endMonth), 1);
                            fromDate = moment(fromDate).format("YYYY-MM-DD");
                            for (var key in months) {
                                if (months[key] == fromDate.split("-")[1]) {
                                    $("#beginmonthlydate-t3").val(key);
                                }
                            }
                            $("#currentyear-t3").val(fromDate.split("-")[0]);
                            if (data.tbasreturn[i].fields.Tab4_Type == "Quarterly") {
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
                        if (getid > data.tbasreturn[i].fields.ID) {
                            if ($("#previousStartDate").val() == "" && data.tbasreturn[i].fields.Tab1_Year > 0 && data.tbasreturn[i].fields.Tab1_Month != "") {
                                let previousStartDate = data.tbasreturn[i].fields.Tab1_Year + "-" + months[data.tbasreturn[i].fields.Tab1_Month] + "-01";
                                let previousEndDate = "";
                                var endMonth = (data.tbasreturn[i].fields.Tab1_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tbasreturn[i].fields.Tab1_Month]) / 3) * 3) : (months[data.tbasreturn[i].fields.Tab1_Month]);
                                previousEndDate = new Date(data.tbasreturn[i].fields.Tab1_Year, (parseInt(endMonth)), 0);
                                previousEndDate = moment(previousEndDate).format("YYYY-MM-DD");
                                $("#previousStartDate").val(previousStartDate);
                                $("#previousEndDate").val(previousEndDate);
                            }
                            if ($("#previousStartDate-t2").val() == "" && data.tbasreturn[i].fields.Tab2_Year > 0 && data.tbasreturn[i].fields.Tab2_Month != "") {
                                let previousStartDate = data.tbasreturn[i].fields.Tab2_Year + "-" + months[data.tbasreturn[i].fields.Tab2_Month] + "-01";
                                let previousEndDate = "";
                                var endMonth = (data.tbasreturn[i].fields.Tab2_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tbasreturn[i].fields.Tab2_Month]) / 3) * 3) : (months[data.tbasreturn[i].fields.Tab2_Month]);
                                previousEndDate = new Date(data.tbasreturn[i].fields.Tab2_Year, (parseInt(endMonth)), 0);
                                previousEndDate = moment(previousEndDate).format("YYYY-MM-DD");
                                $("#previousStartDate-t2").val(previousStartDate);
                                $("#previousEndDate-t2").val(previousEndDate);
                            }
                            if ($("#previousStartDate-t2-2").val() == "" && data.tbasreturn[i].fields.Tab3_Year > 0 && data.tbasreturn[i].fields.Tab3_Month != "") {
                                let previousStartDate = data.tbasreturn[i].fields.Tab3_Year + "-" + months[data.tbasreturn[i].fields.Tab3_Month] + "-01";
                                let previousEndDate = "";
                                var endMonth = (data.tbasreturn[i].fields.Tab3_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tbasreturn[i].fields.Tab3_Month]) / 3) * 3) : (months[data.tbasreturn[i].fields.Tab3_Month]);
                                previousEndDate = new Date(data.tbasreturn[i].fields.Tab3_Year, (parseInt(endMonth)), 0);
                                previousEndDate = moment(previousEndDate).format("YYYY-MM-DD");
                                $("#previousStartDate-t2-2").val(previousStartDate);
                                $("#previousEndDate-t2-2").val(previousEndDate);
                            }
                            if ($("#previousStartDate-t3").val() == "" && data.tbasreturn[i].fields.Tab4_Year > 0 && data.tbasreturn[i].fields.Tab4_Month != "") {
                                let previousStartDate = data.tbasreturn[i].fields.Tab4_Year + "-" + months[data.tbasreturn[i].fields.Tab4_Month] + "-01";
                                let previousEndDate = "";
                                var endMonth = (data.tbasreturn[i].fields.Tab4_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tbasreturn[i].fields.Tab4_Month]) / 3) * 3) : (months[data.tbasreturn[i].fields.Tab4_Month]);
                                previousEndDate = new Date(data.tbasreturn[i].fields.Tab4_Year, (parseInt(endMonth)), 0);
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
        templateObject.getAllBasReturnData();
    }, 1000);


    templateObject.getReceiptCategoryList = function() {
        getVS1Data('TReceiptCategory').then(function(dataObject) {
            if (dataObject.length == 0) {
                sideBarService.getReceiptCategory().then(function(data) {
                    setReceiptCategory(data);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                setReceiptCategory(data);
            }
        }).catch(function(err) {
            sideBarService.getReceiptCategory().then(function(data) {
                setReceiptCategory(data);
            });
        });
    };

    function setReceiptCategory(data) {
        for (let i in data.treceiptcategory) {
            if (data.treceiptcategory.hasOwnProperty(i)) {
                if (data.treceiptcategory[i].CategoryName != "") {
                    categories.push(data.treceiptcategory[i].CategoryName);
                }
            }
        }

        $('.fullScreenSpin').css('display', 'none');
        // templateObject.getAccountLists();
    }
    templateObject.getReceiptCategoryList();

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

                reportService.getTaxCodesDetailVS1().then(function(data__) {
                    const taxCodesDetail = data__.ttaxcodevs1;
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
                        templateObject.selTaxList(1);
                        templateObject.selTaxList(2);
                        templateObject.selTaxList(3);
                        templateObject.selTaxList(4);
                        templateObject.selTaxList(7);
                        templateObject.selTaxList(10);
                        templateObject.selTaxList(11);
                        templateObject.selTaxList(13);
                        templateObject.selTaxList(14);
                        templateObject.selTaxList(15);
                        templateObject.selTaxList(18);

                        var gst5cost = parseFloat($("#gst3cost").val()) + parseFloat($("#gst4cost").val());
                        $("#gst5cost").val(gst5cost);
                        $("#prt_gst5cost").html("$" + gst5cost);
                        var gst6cost = parseFloat($("#gst1cost").val()) + parseFloat($("#gst2cost").val()) + gst5cost;
                        $("#gst6cost").val(gst6cost);
                        $("#prt_gst6cost").html("$" + gst6cost);
                        var gst8cost = parseFloat($("#gst7cost").val()) + gst6cost;
                        $("#gst8cost").val(gst8cost);
                        $("#prt_gst8cost").html("$" + gst8cost);
                        var gst9cost = gst8cost / 11;
                        $("#gst9cost").val(gst9cost.toFixed(2));
                        $("#prt_gst9cost").html("$" + gst9cost.toFixed(2));
                        $("#debits1cost").val(gst9cost.toFixed(2));
                        $("#prt_gst21cost").html("$" + gst9cost.toFixed(2));
                        $("#prt_gst23cost").html("$" + gst9cost.toFixed(2));
                        $("#prt_debits1cost").html("$" + gst9cost.toFixed(2));
                        let debits2A = gst9cost + parseFloat($("#debits2cost").val()) + parseFloat($("#debits3cost").val());
                        $("#debits4cost").val(debits2A.toFixed(2));
                        $("#prt_debits4cost").html("$" + debits2A.toFixed(2));
                        var gst12cost = parseFloat($("#gst10cost").val()) + parseFloat($("#gst11cost").val());
                        $("#gst12cost").val(gst12cost);
                        $("#prt_gst12cost").html("$" + gst12cost);
                        var gst16cost = parseFloat($("#gst13cost").val()) + parseFloat($("#gst14cost").val()) + parseFloat($("#gst15cost").val());
                        $("#gst16cost").val(gst16cost);
                        $("#prt_gst16cost").html("$" + gst16cost);
                        var gst17cost = gst12cost + gst16cost;
                        $("#gst17cost").val(gst17cost);
                        $("#prt_gst17cost").html("$" + gst17cost);
                        var gst19cost = parseFloat($("#gst18cost").val()) + gst17cost;
                        $("#gst19cost").val(gst19cost);
                        $("#prt_gst19cost").html("$" + gst19cost);
                        var gst20cost = gst19cost / 11;
                        $("#gst20cost").val(gst20cost.toFixed(2));
                        $("#prt_gst20cost").html("$" + gst20cost.toFixed(2));
                        $("#credits1cost").val(gst20cost.toFixed(2));
                        $("#prt_credits1cost").html("$" + gst20cost.toFixed(2));
                        let credits2B = gst20cost + parseFloat($("#credits2cost").val()) + parseFloat($("#credits3cost").val()) + parseFloat($("#credits4cost").val());
                        $("#credits5cost").val(credits2B.toFixed(2));
                        $("#prt_credits5cost").html("$" + credits2B.toFixed(2));
                        let debits3 = debits2A - credits2B;
                        $("#debits5cost").val(debits3.toFixed(2));
                        $("#prt_debits5cost").html("$" + debits3.toFixed(2));
                        let credits8B = parseFloat($("#credits5cost").val()) + parseFloat($("#credits6cost").val()) + parseFloat($("#credits7cost").val()) + parseFloat($("#credits8cost").val());
                        $("#credits9cost").val(credits8B.toFixed(2));
                        $("#prt_credits9cost").html("$" + credits8B.toFixed(2));
                        let debits8A = parseFloat($("#debits1cost").val()) + parseFloat($("#debits6cost").val()) + parseFloat($("#debits7cost").val()) + parseFloat($("#debits9cost").val());
                        $("#debits10cost").val(debits8A.toFixed(2));
                        $("#prt_debits10cost").html("$" + debits8A.toFixed(2));
                        let debits9 = debits8A - parseFloat($("#credits9cost").val());
                        $("#debits11cost").val(debits9.toFixed(2));
                        $("#prt_debits11cost").html("$" + debits9.toFixed(2));
                    } else if (tabType == "t3") {
                        templateObject.taxSummaryListT3.set(mainReportRecords);
                        templateObject.sel3TaxList(1);
                        templateObject.sel3TaxList(2);
                        templateObject.sel3TaxList(3);
                        templateObject.sel3TaxList(4);
                        templateObject.sel3TaxList(5);
                    }
                });
            }

            $('.fullScreenSpin').css('display', 'none');

        }).catch(function(err) {
            if (tabType == "t1") {
                templateObject.taxSummaryListT1.set([]);
            } else if (tabType == "t3") {
                templateObject.taxSummaryListT3.set([]);
            }

            $('.fullScreenSpin').css('display', 'none');
        });
    };

    templateObject.getAccountsSummaryReports = function(dateFrom, dateTo, tabType) {
        reportService.getBalanceSheetRedirectRangeData(dateFrom, dateTo, 1000, 0).then(function(data) {
            if (data.taccountrunningbalancereport.length) {
                const accountsSummaryReport = data.taccountrunningbalancereport;
                let accountsReportRecords = [];

                for (let i = 0; i < accountsSummaryReport.length; i++) {
                    const mainReportData = {
                        AccountID: accountsSummaryReport[i].AccountID || '',
                        AccountName: accountsSummaryReport[i].AccountName || '',
                        AccountNumber: accountsSummaryReport[i].AccountNumber || '',
                        AccountType: accountsSummaryReport[i].AccountType || '',
                        clientname: accountsSummaryReport[i].clientname || '',
                        Type: accountsSummaryReport[i].Type || '',
                        transDate: accountsSummaryReport[i].Date || "",
                        debit: accountsSummaryReport[i].TotalDebitEx || 0.00,
                        credit: accountsSummaryReport[i].TotalCreditEx || 0.00,
                        balance: accountsSummaryReport[i].Balance || 0.00,
                        openingbalance: accountsSummaryReport[i].OpeningBalanceEx || 0.00,
                        closingbalance: accountsSummaryReport[i].ClosingBalanceEx || 0.00
                    };

                    accountsReportRecords.push(mainReportData);
                }

                accountsReportRecords = _.sortBy(accountsReportRecords, 'AccountName');

                if (tabType == "t2") {
                    templateObject.accountsSummaryListT2.set(accountsReportRecords);
                    templateObject.selAccountant("W1");
                    templateObject.selAccountant("W2");
                    templateObject.selAccountant("W3");
                    templateObject.selAccountant("W4");
                } else if (tabType == "t2-2") {
                    templateObject.accountsSummaryListT2_2.set(accountsReportRecords);
                    templateObject.selAccountant_2("T1");
                } else if (tabType == "t3") {
                    templateObject.accountsSummaryListT3.set(accountsReportRecords);
                    templateObject.sel3Accountant("7D");
                }
            }

            $('.fullScreenSpin').css('display', 'none');

        }).catch(function(err) {
            $('.fullScreenSpin').css('display', 'none');
            templateObject.accountsSummaryListT2.set([]);
            templateObject.accountsSummaryListT2_2.set([]);
            templateObject.accountsSummaryListT3.set([]);
        });
    };

    templateObject.selTaxList = function(pan) {
        let taxRateList = templateObject.taxRateList.get();
        let taxSummaryList = templateObject.taxSummaryListT1.get();

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
        $("#gst" + pan + "cost").val(total_tax.toFixed(2));
        $("#prt_gst" + pan + "cost").html("$" + total_tax.toFixed(2));
        $(".prt_gst" + pan + "cost").html("$" + total_tax.toFixed(2));
    };

    templateObject.selAccountant = function(pan) {
        let accountsList = templateObject.accountsList.get();
        let accountsSummaryList = templateObject.accountsSummaryListT2.get();

        var total_amounts = 0;
        for (var i = 0; i < accountsList.length; i++) {
            if ($("#f-" + pan + "-" + accountsList[i].id).prop('checked') == true) {
                for (var j = 0; j < accountsSummaryList.length; j++) {
                    if (accountsList[i].accountname == accountsSummaryList[j].AccountName) {
                        total_amounts += parseFloat(accountsSummaryList[j].balance);
                    }
                }
            }
        }

        $("#accounts" + pan + "cost").val(total_amounts.toFixed(2));
        $("#prt_accounts" + pan + "cost").html("$" + total_amounts.toFixed(2));

        if (pan == "W2" || pan == "W3" || pan == "W4") {
            let debits4 = parseFloat($("#accountsW2cost").val()) + parseFloat($("#accountsW3_cost").val()) + parseFloat($("#accountsW4cost").val());
            $("#debits6cost").val(debits4.toFixed(2));
            $("#prt_accountsW2+W3+W4cost").html("$" + debits4.toFixed(2));
            $("#prt_debits6cost").html("$" + debits4.toFixed(2));
            let debits8A = parseFloat($("#debits1cost").val()) + parseFloat($("#debits6cost").val()) + parseFloat($("#debits7cost").val()) + parseFloat($("#debits9cost").val());
            $("#debits10cost").val(debits8A.toFixed(2));
            $("#prt_debits10cost").html("$" + debits8A.toFixed(2));
            let debits9 = debits8A - parseFloat($("#credits9cost").val());
            $("#debits11cost").val(debits9.toFixed(2));
            $("#prt_debits11cost").html("$" + debits9.toFixed(2));
        }

        // if (pan == 5) {
        //     $("#debits7cost").val(total_amounts.toFixed(2));
        //     $("#prt_debits7cost").html("$" + total_amounts.toFixed(2));
        //     let debits8A = parseFloat($("#debits1cost").val()) + parseFloat($("#debits6cost").val()) + parseFloat($("#debits7cost").val()) + parseFloat($("#debits9cost").val());
        //     $("#debits10cost").val(debits8A.toFixed(2));
        //     $("#prt_debits10cost").html("$" + debits8A.toFixed(2));
        //     let debits9 = debits8A - parseFloat($("#credits9cost").val());
        //     $("#debits11cost").val(debits9.toFixed(2));
        //     $("#prt_debits11cost").html("$" + debits9.toFixed(2));
        // }
    };

    templateObject.selAccountant_2 = function(pan) {
        let accountsList = templateObject.accountsList.get();
        let accountsSummaryList = templateObject.accountsSummaryListT2_2.get();
        var total_amounts = 0;
        for (var i = 0; i < accountsList.length; i++) {
            if ($("#f-" + pan + "-" + accountsList[i].id).prop('checked') == true) {
                for (var j = 0; j < accountsSummaryList.length; j++) {
                    if (accountsList[i].accountname == accountsSummaryList[j].AccountName) {
                        total_amounts += parseFloat(accountsSummaryList[j].balance);
                    }
                }
            }
        }

        $("#accounts" + pan + "cost").val(total_amounts.toFixed(2));
        $("#prt_accounts" + pan + "cost").html("$" + total_amounts.toFixed(2));

        $("#debits7cost").val(total_amounts.toFixed(2));
        $("#prt_accountsT7cost").html("$" + total_amounts.toFixed(2));
        $("#prt_accountsT11cost").html("$" + total_amounts.toFixed(2));
        $("#prt_debits7cost").html("$" + total_amounts.toFixed(2));
        let debits8A = parseFloat($("#debits1cost").val()) + parseFloat($("#debits6cost").val()) + parseFloat($("#debits7cost").val()) + parseFloat($("#debits9cost").val());
        $("#debits10cost").val(debits8A.toFixed(2));
        $("#prt_debits10cost").html("$" + debits8A.toFixed(2));
        let debits9 = debits8A - parseFloat($("#credits9cost").val());
        $("#debits11cost").val(debits9.toFixed(2));
        $("#prt_debits11cost").html("$" + debits9.toFixed(2));
    };

    templateObject.sel3TaxList = function(pan) {
        let taxRateList = templateObject.taxRateList.get();
        let taxSummaryList = templateObject.taxSummaryListT3.get();

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

        $("#gst" + pan + "cost").val(total_tax.toFixed(2));
        $("#prt_gst" + pan + "cost").html("$" + total_tax.toFixed(2));

        if (pan == 1) {
            $("#debits2cost").val(total_tax.toFixed(2));
            $("#prt_debits2cost").html("$" + total_tax.toFixed(2));
            let debits2A = total_tax + parseFloat($("#debits1cost").val()) + parseFloat($("#debits3cost").val());
            $("#debits4cost").val(debits2A.toFixed(2));
            $("#prt_debits4cost").html("$" + debits2A.toFixed(2));
        }
        if (pan == 2) {
            $("#debits3cost").val(total_tax.toFixed(2));
            $("#prt_debits3cost").html("$" + total_tax.toFixed(2));
            let debits2A = total_tax + parseFloat($("#debits1cost").val()) + parseFloat($("#debits2cost").val());
            $("#debits4cost").val(debits2A.toFixed(2));
            $("#prt_debits4cost").html("$" + debits2A.toFixed(2));
        }
        if (pan == 3) {
            $("#credits2cost").val(total_tax.toFixed(2));
            $("#prt_credits2cost").html("$" + total_tax.toFixed(2));
            let credits2B = total_tax + parseFloat($("#credits1cost").val()) + parseFloat($("#credits3cost").val()) + parseFloat($("#credits4cost").val());
            $("#credits5cost").val(credits2B.toFixed(2));
            $("#prt_credits5cost").html("$" + credits2B.toFixed(2));
            let credits8B = parseFloat($("#credits5cost").val()) + parseFloat($("#credits6cost").val()) + parseFloat($("#credits7cost").val()) + parseFloat($("#credits8cost").val());
            $("#credits9cost").val(credits8B.toFixed(2));
            $("#prt_credits9cost").html("$" + credits8B.toFixed(2));
            let debits9 = parseFloat($("#debits10cost").val()) - parseFloat($("#credits9cost").val());
            $("#debits11cost").val(debits9.toFixed(2));
            $("#prt_debits11cost").html("$" + debits9.toFixed(2));
        }
        if (pan == 4) {
            $("#credits3cost").val(total_tax.toFixed(2));
            $("#prt_credits3cost").html("$" + total_tax.toFixed(2));
            let credits2B = total_tax + parseFloat($("#credits1cost").val()) + parseFloat($("#credits2cost").val()) + parseFloat($("#credits4cost").val());
            $("#credits5cost").val(credits2B.toFixed(2));
            $("#prt_credits5cost").html("$" + credits2B.toFixed(2));
            let credits8B = parseFloat($("#credits5cost").val()) + parseFloat($("#credits6cost").val()) + parseFloat($("#credits7cost").val()) + parseFloat($("#credits8cost").val());
            $("#credits9cost").val(credits8B.toFixed(2));
            $("#prt_credits9cost").html("$" + credits8B.toFixed(2));
            let debits9 = parseFloat($("#debits10cost").val()) - parseFloat($("#credits9cost").val());
            $("#debits11cost").val(debits9.toFixed(2));
            $("#prt_debits11cost").html("$" + debits9.toFixed(2));
        }
        if (pan == 5) {
            $("#credits4cost").val(total_tax.toFixed(2));
            $("#prt_credits4cost").html("$" + total_tax.toFixed(2));
            let credits2B = total_tax + parseFloat($("#credits1cost").val()) + parseFloat($("#credits2cost").val()) + parseFloat($("#credits3cost").val());
            $("#credits5cost").val(credits2B.toFixed(2));
            $("#prt_credits5cost").html("$" + credits2B.toFixed(2));
            let credits8B = parseFloat($("#credits5cost").val()) + parseFloat($("#credits6cost").val()) + parseFloat($("#credits7cost").val()) + parseFloat($("#credits8cost").val());
            $("#credits9cost").val(credits8B.toFixed(2));
            $("#prt_credits9cost").html("$" + credits8B.toFixed(2));
            let debits9 = parseFloat($("#debits10cost").val()) - parseFloat($("#credits9cost").val());
            $("#debits11cost").val(debits9.toFixed(2));
            $("#prt_debits11cost").html("$" + debits9.toFixed(2));
        }
    };

    templateObject.sel3Accountant = function(pan) {
        let accountsList = templateObject.accountsList.get();
        let accountsSummaryList = templateObject.accountsSummaryListT3.get();

        var total_amounts = 0;
        for (var i = 0; i < accountsList.length; i++) {
            if ($("#f-" + pan + "-" + accountsList[i].id).prop('checked') == true) {
                for (var j = 0; j < accountsSummaryList.length; j++) {
                    if (accountsList[i].accountname == accountsSummaryList[j].AccountName) {
                        total_amounts += parseFloat(accountsSummaryList[j].balance);
                    }
                }
            }
        }

        $("#t3accounts" + pan + "cost").val(total_amounts.toFixed(2));
        $("#prt_t3accounts" + pan + "cost").html("$" + total_amounts.toFixed(2));

        $("#credits8cost").val(total_amounts.toFixed(2));
        $("#prt_credits8cost").html("$" + total_amounts.toFixed(2));
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

                    getVS1Data('TBASReturn').then(function(dataObject) {
                        let taxRateList = templateObject.taxRateList.get();
                        let accountsList = templateObject.accountsList.get();
                        let deptrecords = templateObject.deptrecords.get();

                        if (dataObject.length == 0) {
                            reportService.getOneBASReturn(getid[1]).then(function(data) {
                                $("#description").val(data.tbasreturn[0].fields.BasSheetDesc);
                                $("#basreturnCategory1").prop('checked', data.tbasreturn[0].fields.HasTab1);
                                $("#basreturnCategory2").prop('checked', data.tbasreturn[0].fields.HasTab2);
                                $("#basreturnCategory3").prop('checked', data.tbasreturn[0].fields.HasTab3);
                                $("#basreturnCategory4").prop('checked', data.tbasreturn[0].fields.HasTab4);
                                if (data.tbasreturn[0].fields.HasTab1 == true) {
                                    document.getElementById("gstG1").setAttribute("href", "#gstG1option");
                                    document.getElementById("gstG2").setAttribute("href", "#gstG2option");
                                    document.getElementById("gstG3").setAttribute("href", "#gstG3option");
                                    document.getElementById("gstG4").setAttribute("href", "#gstG4option");
                                    document.getElementById("gstG7").setAttribute("href", "#gstG7option");
                                    document.getElementById("gstG10").setAttribute("href", "#gstG10option");
                                    document.getElementById("gstG11").setAttribute("href", "#gstG11option");
                                    document.getElementById("gstG13").setAttribute("href", "#gstG13option");
                                    document.getElementById("gstG14").setAttribute("href", "#gstG14option");
                                    document.getElementById("gstG15").setAttribute("href", "#gstG15option");
                                    document.getElementById("gstG18").setAttribute("href", "#gstG18option");
                                } else {
                                    document.getElementById("gstG1").setAttribute("href", "#");
                                    document.getElementById("gstG2").setAttribute("href", "#");
                                    document.getElementById("gstG3").setAttribute("href", "#");
                                    document.getElementById("gstG4").setAttribute("href", "#");
                                    document.getElementById("gstG7").setAttribute("href", "#");
                                    document.getElementById("gstG10").setAttribute("href", "#");
                                    document.getElementById("gstG11").setAttribute("href", "#");
                                    document.getElementById("gstG13").setAttribute("href", "#");
                                    document.getElementById("gstG14").setAttribute("href", "#");
                                    document.getElementById("gstG15").setAttribute("href", "#");
                                    document.getElementById("gstG18").setAttribute("href", "#");
                                }
                                if (data.tbasreturn[0].fields.HasTab2 == true) {
                                    document.getElementById("accountsW1").setAttribute("href", "#accountsW1option");
                                    document.getElementById("accountsW2").setAttribute("href", "#accountsW2option");
                                    document.getElementById("accountsW3_").setAttribute("href", "#accountsW3_option");
                                    document.getElementById("accountsW4").setAttribute("href", "#accountsW4option");
                                } else {
                                    document.getElementById("accountsW1").setAttribute("href", "#");
                                    document.getElementById("accountsW2").setAttribute("href", "#");
                                    document.getElementById("accountsW3_").setAttribute("href", "#");
                                    document.getElementById("accountsW4").setAttribute("href", "#");
                                }
                                if (data.tbasreturn[0].fields.HasTab3 == true) {
                                    document.getElementById("accountsT1").setAttribute("href", "#accountsT1option");
                                    $("#accountsT2cost").removeAttr("disabled");
                                    $("#accountsT3cost").removeAttr("disabled");
                                    $("#reasonT4").removeAttr("disabled");
                                    $("#accountsF1cost").removeAttr("disabled");
                                    $("#accountsF2cost").removeAttr("disabled");
                                    $("#accountsF3cost").removeAttr("disabled");
                                    $("#reasonF4").removeAttr("disabled");
                                } else {
                                    document.getElementById("accountsT1").setAttribute("href", "#");
                                    $("#accountsT2cost").attr("disabled", "disabled");
                                    $("#accountsT3cost").attr("disabled", "disabled");
                                    $("#reasonT4").attr("disabled", "disabled");
                                    $("#accountsF1cost").attr("disabled", "disabled");
                                    $("#accountsF2cost").attr("disabled", "disabled");
                                    $("#accountsF3cost").attr("disabled", "disabled");
                                    $("#reasonF4").attr("disabled", "disabled");
                                }
                                if (data.tbasreturn[0].fields.HasTab4 == true) {
                                    document.getElementById("gst1C").setAttribute("href", "#gst1Coption");
                                    document.getElementById("gst1E").setAttribute("href", "#gst1Eoption");
                                    document.getElementById("gst1D").setAttribute("href", "#gst1Doption");
                                    document.getElementById("gst1F").setAttribute("href", "#gst1Foption");
                                    document.getElementById("gst1G").setAttribute("href", "#gst1Goption");
                                    document.getElementById("accounts7D").setAttribute("href", "#accounts7Doption");
                                } else {
                                    document.getElementById("gst1C").setAttribute("href", "#");
                                    document.getElementById("gst1E").setAttribute("href", "#");
                                    document.getElementById("gst1D").setAttribute("href", "#");
                                    document.getElementById("gst1F").setAttribute("href", "#");
                                    document.getElementById("gst1G").setAttribute("href", "#");
                                    document.getElementById("accounts7D").setAttribute("href", "#");
                                }
                                if (data.tbasreturn[0].fields.ClassID > 0) {
                                    for (var i = 0; i < deptrecords.length; i++) {
                                        if (deptrecords[i].id == data.tbasreturn[0].fields.ClassID) {
                                            $("#sltDepartment").val(deptrecords[i].department);
                                            $("#sltDepartmentID").val(deptrecords[i].id);
                                        }
                                    }
                                }
                                if (data.tbasreturn[0].fields.AllClass == true) {
                                    $("#allDepart").prop('checked', true);
                                } else {
                                    $("#allDepart").prop('checked', false);
                                }
                                if (data.tbasreturn[0].fields.AccMethod == "Accrual") {
                                    $("#accountingmethod1").prop('checked', true);
                                    $("#accountingmethod2").prop('checked', false);
                                } else {
                                    $("#accountingmethod1").prop('checked', false);
                                    $("#accountingmethod2").prop('checked', true);
                                }
                                $("#prt_accountingMethod").html(data.tbasreturn[0].AccMethod);
                                if (data.tbasreturn[0].fields.Tab1_Type == "Quarterly") {
                                    $("#datemethod1").prop('checked', true);
                                    $("#datemethod2").prop('checked', false);
                                } else {
                                    $("#datemethod1").prop('checked', false);
                                    $("#datemethod2").prop('checked', true);
                                }
                                $("#beginmonthlydate").val(data.tbasreturn[0].fields.Tab1_Month);
                                $("#currentyear").val(data.tbasreturn[0].fields.Tab1_Year);
                                let tab1endDate = "";
                                if (data.tbasreturn[0].fields.Tab1_Month != "" && data.tbasreturn[0].fields.Tab1_Year > 0) {
                                    var endMonth = (data.tbasreturn[0].fields.Tab1_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tbasreturn[0].fields.Tab1_Month]) / 3) * 3) : (months[data.tbasreturn[0].fields.Tab1_Month]);
                                    tab1endDate = new Date(data.tbasreturn[0].fields.Tab1_Year, (parseInt(endMonth)), 0);
                                    tab1endDate = moment(tab1endDate).format("YYYY-MM-DD");
                                }
                                $("#endDate").val(tab1endDate);
                                $("#prt_beginningDate").html(data.tbasreturn[0].fields.Tab1_Month + " " + data.tbasreturn[0].fields.Tab1_Year);
                                $("#gstG1cost").val(data.tbasreturn[0].fields.G1);
                                $(".prt_gstG1cost").html("$" + data.tbasreturn[0].fields.G1);
                                $("#gstG2cost").val(data.tbasreturn[0].fields.G2);
                                $("#prt_gstG2cost").html("$" + data.tbasreturn[0].fields.G2);
                                $("#gstG3cost").val(data.tbasreturn[0].fields.G3);
                                $("#prt_gstG3cost").html("$" + data.tbasreturn[0].fields.G3);
                                $("#gstG4cost").val(data.tbasreturn[0].fields.G4);
                                // $("#prt_gstG4cost").html("$" + data.tbasreturn[0].fields.G4);
                                $("#gstG5cost").val(data.tbasreturn[0].fields.G5);
                                // $("#prt_gstG5cost").html("$" + data.tbasreturn[0].fields.G5);
                                $("#gstG6cost").val(data.tbasreturn[0].fields.G6);
                                // $("#prt_gstG6cost").html("$" + data.tbasreturn[0].fields.G6);
                                $("#gstG7cost").val(data.tbasreturn[0].fields.G7);
                                // $("#prt_gstG7cost").html("$" + data.tbasreturn[0].fields.G7);
                                $("#gstG8cost").val(data.tbasreturn[0].fields.G8);
                                // $("#prt_gstG8cost").html("$" + data.tbasreturn[0].fields.G8);
                                $("#gstG9cost").val(data.tbasreturn[0].fields.G9);
                                // $("#prt_gstG9cost").html("$" + data.tbasreturn[0].fields.G9);
                                $("#gstG10cost").val(data.tbasreturn[0].fields.G10);
                                $("#prt_gstG10cost").html("$" + data.tbasreturn[0].fields.G10);
                                $("#gstG11cost").val(data.tbasreturn[0].fields.G11);
                                $("#prt_gstG11cost").html("$" + data.tbasreturn[0].fields.G11);
                                $("#gstG12cost").val(data.tbasreturn[0].fields.G12);
                                // $("#prt_gstG12cost").html("$" + data.tbasreturn[0].fields.G12);
                                $("#gstG13cost").val(data.tbasreturn[0].fields.G13);
                                // $("#prt_gstG13cost").html("$" + data.tbasreturn[0].fields.G13);
                                $("#gstG14cost").val(data.tbasreturn[0].fields.G14);
                                // $("#prt_gstG14cost").html("$" + data.tbasreturn[0].fields.G14);
                                $("#gstG15cost").val(data.tbasreturn[0].fields.G15);
                                // $("#prt_gstG15cost").html("$" + data.tbasreturn[0].fields.G15);
                                $("#gstG16cost").val(data.tbasreturn[0].fields.G16);
                                // $("#prt_gstG16cost").html("$" + data.tbasreturn[0].fields.G16);
                                $("#gstG17cost").val(data.tbasreturn[0].fields.G17);
                                // $("#prt_gstG17cost").html("$" + data.tbasreturn[0].fields.G17);
                                $("#gstG18cost").val(data.tbasreturn[0].fields.G18);
                                // $("#prt_gstG18cost").html("$" + data.tbasreturn[0].fields.G18);
                                $("#gstG19cost").val(data.tbasreturn[0].fields.G19);
                                // $("#prt_gstG19cost").html("$" + data.tbasreturn[0].fields.G19);
                                $("#gstG20cost").val(data.tbasreturn[0].fields.G20);
                                // $("#prt_gstG20cost").html("$" + data.tbasreturn[0].fields.G20);

                                shareFunctionByName.initTable(data.tbasreturn[0].fields.G1Selected, "tbltaxCodeCheckbox_G1");
                                shareFunctionByName.initTable(data.tbasreturn[0].fields.G2Selected, "tbltaxCodeCheckbox_G2");
                                shareFunctionByName.initTable(data.tbasreturn[0].fields.G3Selected, "tbltaxCodeCheckbox_G3");
                                shareFunctionByName.initTable(data.tbasreturn[0].fields.G4Selected, "tbltaxCodeCheckbox_G4");
                                shareFunctionByName.initTable(data.tbasreturn[0].fields.G7Selected, "tbltaxCodeCheckbox_G7");
                                shareFunctionByName.initTable(data.tbasreturn[0].fields.G10Selected, "tbltaxCodeCheckbox_G10");
                                shareFunctionByName.initTable(data.tbasreturn[0].fields.G11Selected, "tbltaxCodeCheckbox_G11");
                                shareFunctionByName.initTable(data.tbasreturn[0].fields.G13Selected, "tbltaxCodeCheckbox_G13");
                                shareFunctionByName.initTable(data.tbasreturn[0].fields.G14Selected, "tbltaxCodeCheckbox_G14");
                                shareFunctionByName.initTable(data.tbasreturn[0].fields.G15Selected, "tbltaxCodeCheckbox_G15");
                                shareFunctionByName.initTable(data.tbasreturn[0].fields.G18Selected, "tbltaxCodeCheckbox_G18");
                                shareFunctionByName.initTable(data.tbasreturn[0].fields._1CSelected, "tbltaxCodeCheckbox_1C");
                                shareFunctionByName.initTable(data.tbasreturn[0].fields._1ESelected, "tbltaxCodeCheckbox_1E");
                                shareFunctionByName.initTable(data.tbasreturn[0].fields._1DSelected, "tbltaxCodeCheckbox_1D");
                                shareFunctionByName.initTable(data.tbasreturn[0].fields._1FSelected, "tbltaxCodeCheckbox_1F");
                                shareFunctionByName.initTable(data.tbasreturn[0].fields._1GSelected, "tbltaxCodeCheckbox_1G");

                                shareFunctionByName.initTable(data.tbasreturn[0].fields.W1Selected, "tblaccountsCheckbox_W1");
                                shareFunctionByName.initTable(data.tbasreturn[0].fields.W2Selected, "tblaccountsCheckbox_W2");
                                shareFunctionByName.initTable(data.tbasreturn[0].fields.W3Selected, "tblaccountsCheckbox_W3");
                                shareFunctionByName.initTable(data.tbasreturn[0].fields.W4Selected, "tblaccountsCheckbox_W4");
                                shareFunctionByName.initTable(data.tbasreturn[0].fields.T1Selected, "tblaccountsCheckbox_T1");
                                shareFunctionByName.initTable(data.tbasreturn[0].fields._7DSelected, "tblaccountsCheckbox_7D");

                                if (data.tbasreturn[0].fields.Tab2_Type == "Quarterly") {
                                    $("#datemethod1-t2").prop('checked', true);
                                    $("#datemethod2-t2").prop('checked', false);
                                } else {
                                    $("#datemethod1-t2").prop('checked', false);
                                    $("#datemethod2-t2").prop('checked', true);
                                }
                                $("#beginmonthlydate-t2").val(data.tbasreturn[0].fields.Tab2_Month);
                                $("#currentyear-t2").val(data.tbasreturn[0].fields.Tab2_Year);
                                let tab2endDate = "";
                                if (data.tbasreturn[0].fields.Tab2_Month != "" && data.tbasreturn[0].fields.Tab2_Year > 0) {
                                    var endMonth2 = (data.tbasreturn[0].fields.Tab2_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tbasreturn[0].fields.Tab2_Month]) / 3) * 3) : (months[data.tbasreturn[0].fields.Tab2_Month]);
                                    tab2endDate = new Date(data.tbasreturn[0].fields.Tab2_Year, (parseInt(endMonth2)), 0);
                                    tab2endDate = moment(tab2endDate).format("YYYY-MM-DD");
                                }
                                $("#endDate-t2").val(tab2endDate);
                                // $("#prt_beginningDateT2").html(data.tbasreturn[0].fields.Tab2_Month + " " + data.tbasreturn[0].fields.Tab2_Year);
                                if (data.tbasreturn[0].fields.Tab3_Type == "Quarterly") {
                                    $("#datemethod1-t2-2").prop('checked', true);
                                    $("#datemethod2-t2-2").prop('checked', false);
                                } else {
                                    $("#datemethod1-t2-2").prop('checked', false);
                                    $("#datemethod2-t2-2").prop('checked', true);
                                }
                                $("#beginmonthlydate-t2-2").val(data.tbasreturn[0].fields.Tab3_Month);
                                $("#currentyear-t2-2").val(data.tbasreturn[0].fields.Tab3_Year);
                                let tab3endDate = "";
                                if (data.tbasreturn[0].fields.Tab3_Month != "" && data.tbasreturn[0].fields.Tab3_Year > 0) {
                                    var endMonth3 = (data.tbasreturn[0].fields.Tab3_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tbasreturn[0].fields.Tab3_Month]) / 3) * 3) : (months[data.tbasreturn[0].fields.Tab3_Month]);
                                    tab3endDate = new Date(data.tbasreturn[0].fields.Tab3_Year, (parseInt(endMonth3)), 0);
                                    tab3endDate = moment(tab3endDate).format("YYYY-MM-DD");
                                }
                                $("#endDate-t2-2").val(tab3endDate);
                                // $("#prt_beginningDateT2-2").html(data.tbasreturn[0].fields.Tab3_Month + " " + data.tbasreturn[0].fields.Tab3_Year);
                                $("#accountsW1cost").val(data.tbasreturn[0].fields.W1);
                                $("#prt_accountsW1cost").html("$" + data.tbasreturn[0].fields.W1);
                                $("#accountsW2cost").val(data.tbasreturn[0].fields.W2);
                                $("#prt_accountsW2cost").html("$" + data.tbasreturn[0].fields.W2);
                                $("#accountsW3_cost").val(data.tbasreturn[0].fields.W3);
                                $("#prt_accountsW3_cost").html("$" + data.tbasreturn[0].fields.W3);
                                $("#accountsW4cost").val(data.tbasreturn[0].fields.W4);
                                $("#prt_accountsW4cost").html("$" + data.tbasreturn[0].fields.W4);
                                $("#accountsT1cost").val(data.tbasreturn[0].fields.T1);
                                $("#prt_accountsT1cost").html("$" + data.tbasreturn[0].fields.T1);
                                $("#accountsT2cost").val(data.tbasreturn[0].fields.T2);
                                $("#prt_accountsT2cost").html(data.tbasreturn[0].fields.T2 + "%");
                                $("#accountsT3cost").val(data.tbasreturn[0].fields.T3);
                                $("#prt_accountsT3cost").html(data.tbasreturn[0].fields.T3 + "%");
                                $("#reasonT4").val(data.tbasreturn[0].fields.T4);
                                $(".prt_reasonT4").html(data.tbasreturn[0].fields.T4);
                                $("#accountsF1cost").val(data.tbasreturn[0].fields.F1);
                                $("#prt_accountsF1cost").html("$" + data.tbasreturn[0].fields.F1);
                                $("#accountsF2cost").val(data.tbasreturn[0].fields.F2);
                                $("#prt_accountsF2cost").html("$" + data.tbasreturn[0].fields.F2);
                                $("#accountsF3cost").val(data.tbasreturn[0].fields.F3);
                                $("#prt_accountsF3cost").html("$" + data.tbasreturn[0].fields.F3);
                                $("#reasonF4").val(data.tbasreturn[0].fields.F4);
                                $("#prt_reasonF4").html(data.tbasreturn[0].fields.F4);

                                if (data.tbasreturn[0].fields.Tab4_Type == "Quarterly") {
                                    $("#datemethod1-t3").prop('checked', true);
                                    $("#datemethod2-t3").prop('checked', false);
                                } else {
                                    $("#datemethod1-t3").prop('checked', false);
                                    $("#datemethod2-t3").prop('checked', true);
                                }
                                $("#beginmonthlydate-t3").val(data.tbasreturn[0].fields.Tab4_Month);
                                $("#currentyear-t3").val(data.tbasreturn[0].fields.Tab4_Year);
                                let tab4endDate = "";
                                if (data.tbasreturn[0].fields.Tab4_Month != "" && data.tbasreturn[0].fields.Tab4_Year > 0) {
                                    var endMonth4 = (data.tbasreturn[0].fields.Tab4_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tbasreturn[0].fields.Tab4_Month]) / 3) * 3) : (months[data.tbasreturn[0].fields.Tab4_Month]);
                                    tab4endDate = new Date(data.tbasreturn[0].fields.Tab4_Year, (parseInt(endMonth4)), 0);
                                    tab4endDate = moment(tab4endDate).format("YYYY-MM-DD");
                                }
                                $("#endDate-t3").val(tab4endDate);
                                // $("#prt_beginningDateT3").html(data.tbasreturn[0].fields.Tab4_Month + " " + data.tbasreturn[0].fields.Tab4_Year);
                                $("#gst1Ccost").val(data.tbasreturn[0].fields._1C);
                                $("#prt_gst1Ccost").html("$" + data.tbasreturn[0].fields._1C);
                                $("#gst1Ecost").val(data.tbasreturn[0].fields._1E);
                                $("#prt_gst1Ecost").html("$" + data.tbasreturn[0].fields._1E);
                                $("#gst1Dcost").val(data.tbasreturn[0].fields._1D);
                                $("#prt_gst1Dcost").html("$" + data.tbasreturn[0].fields._1D);
                                $("#gst1Fcost").val(data.tbasreturn[0].fields._1F);
                                $("#prt_gst1Fcost").html("$" + data.tbasreturn[0].fields._1F);
                                $("#gst1Gcost").val(data.tbasreturn[0].fields._1G);
                                $("#prt_gst1Gcost").html("$" + data.tbasreturn[0].fields._1G);
                                $("#accounts7Dcost").val(data.tbasreturn[0].fields._7D);
                                $("#prt_accounts7Dcost").html("$" + data.tbasreturn[0].fields._7D);
                                $("#debits1cost").val(data.tbasreturn[0].fields._1A);
                                $("#prt_gstG21cost").html("$" + data.tbasreturn[0].fields._1A);
                                $("#prt_gstG23cost").html("$" + data.tbasreturn[0].fields._1A);
                                $("#prt_debits1cost").html("$" + data.tbasreturn[0].fields._1A);
                                $("#debits2cost").val(data.tbasreturn[0].fields._1C);
                                $("#prt_debits2cost").html("$" + data.tbasreturn[0].fields._1C);
                                $("#debits3cost").val(data.tbasreturn[0].fields._1E);
                                $("#prt_debits3cost").html("$" + data.tbasreturn[0].fields._1E);
                                $("#debits4cost").val(data.tbasreturn[0].fields._2A);
                                $("#prt_debits4cost").html("$" + data.tbasreturn[0].fields._2A);
                                $("#debits5cost").val(data.tbasreturn[0].fields._3);
                                $("#prt_debits5cost").html("$" + data.tbasreturn[0].fields._3);
                                $("#debits6cost").val(data.tbasreturn[0].fields._4);
                                $("#prt_accountsW2+W3+W4cost").html("$" + data.tbasreturn[0].fields._4);
                                $("#prt_debits6cost").html("$" + data.tbasreturn[0].fields._4);
                                $("#debits7cost").val(data.tbasreturn[0].fields._5A);
                                $("#prt_accountsT7cost").html("$" + data.tbasreturn[0].fields._5A);
                                $("#prt_accountsT11cost").html("$" + data.tbasreturn[0].fields._5A);
                                $("#prt_debits7cost").html("$" + data.tbasreturn[0].fields._5A);
                                $("#debits8cost").val(data.tbasreturn[0].fields._6A);
                                $("#prt_debits8cost").html("$" + data.tbasreturn[0].fields._6A);
                                $("#debits9cost").val(data.tbasreturn[0].fields._7);
                                $("#prt_debits9cost").html("$" + data.tbasreturn[0].fields._7);
                                $("#debits10cost").val(data.tbasreturn[0].fields._8A);
                                $("#prt_debits10cost").html("$" + data.tbasreturn[0].fields._8A);
                                $("#debits11cost").val(data.tbasreturn[0].fields._9);
                                $("#prt_debits11cost").html("$" + data.tbasreturn[0].fields._9);
                                $("#credits1cost").val(data.tbasreturn[0].fields._1B);
                                $("#prt_credits1cost").html("$" + data.tbasreturn[0].fields._1B);
                                $("#credits2cost").val(data.tbasreturn[0].fields._1D);
                                $("#prt_credits2cost").html("$" + data.tbasreturn[0].fields._1D);
                                $("#credits3cost").val(data.tbasreturn[0].fields._1F);
                                $("#prt_credits3cost").html("$" + data.tbasreturn[0].fields._1F);
                                $("#credits4cost").val(data.tbasreturn[0].fields._1G);
                                $("#prt_credits4cost").html("$" + data.tbasreturn[0].fields._1G);
                                $("#credits5cost").val(data.tbasreturn[0].fields._2B);
                                $("#prt_credits5cost").html("$" + data.tbasreturn[0].fields._2B);
                                $("#credits6cost").val(data.tbasreturn[0].fields._5B);
                                $("#prt_credits6cost").html("$" + data.tbasreturn[0].fields._5B);
                                $("#credits7cost").val(data.tbasreturn[0].fields._6B);
                                $("#prt_credits7cost").html("$" + data.tbasreturn[0].fields._6B);
                                $("#credits8cost").val(data.tbasreturn[0].fields._7D);
                                $("#prt_credits8cost").html("$" + data.tbasreturn[0].fields._7D);
                                $("#credits9cost").val(data.tbasreturn[0].fields._8B);
                                $("#prt_credits9cost").html("$" + data.tbasreturn[0].fields._8B);
                            })
                        } else {
                            let data = JSON.parse(dataObject[0].data);
                            for (let i = 0; i < data.tbasreturn.length; i++) {
                                if (getid[1] == data.tbasreturn[i].fields.ID) {
                                    $("#description").val(data.tbasreturn[i].fields.BasSheetDesc);
                                    $("#basreturnCategory1").prop('checked', data.tbasreturn[i].fields.HasTab1);
                                    $("#basreturnCategory2").prop('checked', data.tbasreturn[i].fields.HasTab2);
                                    $("#basreturnCategory3").prop('checked', data.tbasreturn[i].fields.HasTab3);
                                    $("#basreturnCategory4").prop('checked', data.tbasreturn[i].fields.HasTab4);
                                    if (data.tbasreturn[i].fields.HasTab1 == true) {
                                        document.getElementById("gstG1").setAttribute("href", "#gstG1option");
                                        document.getElementById("gstG2").setAttribute("href", "#gstG2option");
                                        document.getElementById("gstG3").setAttribute("href", "#gstG3option");
                                        document.getElementById("gstG4").setAttribute("href", "#gstG4option");
                                        document.getElementById("gstG7").setAttribute("href", "#gstG7option");
                                        document.getElementById("gstG10").setAttribute("href", "#gstG10option");
                                        document.getElementById("gstG11").setAttribute("href", "#gstG11option");
                                        document.getElementById("gstG13").setAttribute("href", "#gstG13option");
                                        document.getElementById("gstG14").setAttribute("href", "#gstG14option");
                                        document.getElementById("gstG15").setAttribute("href", "#gstG15option");
                                        document.getElementById("gstG18").setAttribute("href", "#gstG18option");
                                    } else {
                                        document.getElementById("gstG1").setAttribute("href", "#");
                                        document.getElementById("gstG2").setAttribute("href", "#");
                                        document.getElementById("gstG3").setAttribute("href", "#");
                                        document.getElementById("gstG4").setAttribute("href", "#");
                                        document.getElementById("gstG7").setAttribute("href", "#");
                                        document.getElementById("gstG10").setAttribute("href", "#");
                                        document.getElementById("gstG11").setAttribute("href", "#");
                                        document.getElementById("gstG13").setAttribute("href", "#");
                                        document.getElementById("gstG14").setAttribute("href", "#");
                                        document.getElementById("gstG15").setAttribute("href", "#");
                                        document.getElementById("gstG18").setAttribute("href", "#");
                                    }
                                    if (data.tbasreturn[i].fields.HasTab2 == true) {
                                        document.getElementById("accountsW1").setAttribute("href", "#accountsW1option");
                                        document.getElementById("accountsW2").setAttribute("href", "#accountsW2option");
                                        document.getElementById("accountsW3_").setAttribute("href", "#accountsW3_option");
                                        document.getElementById("accountsW4").setAttribute("href", "#accountsW4option");
                                    } else {
                                        document.getElementById("accountsW1").setAttribute("href", "#");
                                        document.getElementById("accountsW2").setAttribute("href", "#");
                                        document.getElementById("accountsW3_").setAttribute("href", "#");
                                        document.getElementById("accountsW4").setAttribute("href", "#");
                                    }
                                    if (data.tbasreturn[i].fields.HasTab3 == true) {
                                        document.getElementById("accountsT1").setAttribute("href", "#accountsT1option");
                                        $("#accountsT2cost").removeAttr("disabled");
                                        $("#accountsT3cost").removeAttr("disabled");
                                        $("#reasonT4").removeAttr("disabled");
                                        $("#accountsF1cost").removeAttr("disabled");
                                        $("#accountsF2cost").removeAttr("disabled");
                                        $("#accountsF3cost").removeAttr("disabled");
                                        $("#reasonF4").removeAttr("disabled");
                                    } else {
                                        document.getElementById("accountsT1").setAttribute("href", "#");
                                        $("#accountsT2cost").attr("disabled", "disabled");
                                        $("#accountsT3cost").attr("disabled", "disabled");
                                        $("#reasonT4").attr("disabled", "disabled");
                                        $("#accountsF1cost").attr("disabled", "disabled");
                                        $("#accountsF2cost").attr("disabled", "disabled");
                                        $("#accountsF3cost").attr("disabled", "disabled");
                                        $("#reasonF4").attr("disabled", "disabled");
                                    }
                                    if (data.tbasreturn[i].fields.HasTab4 == true) {
                                        document.getElementById("gst1C").setAttribute("href", "#gst1Coption");
                                        document.getElementById("gst1E").setAttribute("href", "#gst1Eoption");
                                        document.getElementById("gst1D").setAttribute("href", "#gst1Doption");
                                        document.getElementById("gst1F").setAttribute("href", "#gst1Foption");
                                        document.getElementById("gst1G").setAttribute("href", "#gst1Goption");
                                        document.getElementById("accounts7D").setAttribute("href", "#accounts7Doption");
                                    } else {
                                        document.getElementById("gst1C").setAttribute("href", "#");
                                        document.getElementById("gst1E").setAttribute("href", "#");
                                        document.getElementById("gst1D").setAttribute("href", "#");
                                        document.getElementById("gst1F").setAttribute("href", "#");
                                        document.getElementById("gst1G").setAttribute("href", "#");
                                        document.getElementById("accounts7D").setAttribute("href", "#");
                                    }
                                    if (data.tbasreturn[i].fields.ClassID > 0) {
                                        for (var j = 0; j < deptrecords.length; j++) {
                                            if (deptrecords[j].id == data.tbasreturn[i].fields.ClassID) {
                                                $("#sltDepartment").val(deptrecords[j].department);
                                                $("#sltDepartmentID").val(deptrecords[j].id);
                                            }
                                        }
                                    }
                                    if (data.tbasreturn[i].fields.AllClass == true) {
                                        $("#allDepart").prop('checked', true);
                                    } else {
                                        $("#allDepart").prop('checked', false);
                                    }
                                    if (data.tbasreturn[i].fields.AccMethod == "Accrual") {
                                        $("#accountingmethod1").prop('checked', true);
                                        $("#accountingmethod2").prop('checked', false);
                                    } else {
                                        $("#accountingmethod1").prop('checked', false);
                                        $("#accountingmethod2").prop('checked', true);
                                    }
                                    $("#prt_accountingMethod").html(data.tbasreturn[i].AccMethod);
                                    if (data.tbasreturn[i].fields.Tab1_Type == "Quarterly") {
                                        $("#datemethod1").prop('checked', true);
                                        $("#datemethod2").prop('checked', false);
                                    } else {
                                        $("#datemethod1").prop('checked', false);
                                        $("#datemethod2").prop('checked', true);
                                    }
                                    $("#beginmonthlydate").val(data.tbasreturn[i].fields.Tab1_Month);
                                    $("#currentyear").val(data.tbasreturn[i].fields.Tab1_Year);
                                    let tab1endDate = "";
                                    if (data.tbasreturn[i].fields.Tab1_Month != "" && data.tbasreturn[i].fields.Tab1_Year > 0) {
                                        var endMonth = (data.tbasreturn[i].fields.Tab1_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tbasreturn[i].fields.Tab1_Month]) / 3) * 3) : (months[data.tbasreturn[i].fields.Tab1_Month]);
                                        tab1endDate = new Date(data.tbasreturn[i].fields.Tab1_Year, (parseInt(endMonth)), 0);
                                        tab1endDate = moment(tab1endDate).format("YYYY-MM-DD");
                                    }
                                    $("#endDate").val(tab1endDate);
                                    $("#prt_beginningDate").html(data.tbasreturn[i].fields.Tab1_Month + " " + data.tbasreturn[i].fields.Tab1_Year);
                                    $("#gstG1cost").val(data.tbasreturn[i].fields.G1);
                                    $(".prt_gstG1cost").html("$" + data.tbasreturn[i].fields.G1);
                                    $("#gstG2cost").val(data.tbasreturn[i].fields.G2);
                                    $("#prt_gstG2cost").html("$" + data.tbasreturn[i].fields.G2);
                                    $("#gstG3cost").val(data.tbasreturn[i].fields.G3);
                                    $("#prt_gstG3cost").html("$" + data.tbasreturn[i].fields.G3);
                                    $("#gstG4cost").val(data.tbasreturn[i].fields.G4);
                                    // $("#prt_gstG4cost").html("$" + data.tbasreturn[i].fields.G4);
                                    $("#gstG5cost").val(data.tbasreturn[i].fields.G5);
                                    // $("#prt_gstG5cost").html("$" + data.tbasreturn[i].fields.G5);
                                    $("#gstG6cost").val(data.tbasreturn[i].fields.G6);
                                    // $("#prt_gstG6cost").html("$" + data.tbasreturn[i].fields.G6);
                                    $("#gstG7cost").val(data.tbasreturn[i].fields.G7);
                                    // $("#prt_gstG7cost").html("$" + data.tbasreturn[i].fields.G7);
                                    $("#gstG8cost").val(data.tbasreturn[i].fields.G8);
                                    // $("#prt_gstG8cost").html("$" + data.tbasreturn[i].fields.G8);
                                    $("#gstG9cost").val(data.tbasreturn[i].fields.G9);
                                    // $("#prt_gstG9cost").html("$" + data.tbasreturn[i].fields.G9);
                                    $("#gstG10cost").val(data.tbasreturn[i].fields.G10);
                                    $("#prt_gstG10cost").html("$" + data.tbasreturn[i].fields.G10);
                                    $("#gstG11cost").val(data.tbasreturn[i].fields.G11);
                                    $("#prt_gstG11cost").html("$" + data.tbasreturn[i].fields.G11);
                                    $("#gstG12cost").val(data.tbasreturn[i].fields.G12);
                                    // $("#prt_gstG12cost").html("$" + data.tbasreturn[i].fields.G12);
                                    $("#gstG13cost").val(data.tbasreturn[i].fields.G13);
                                    // $("#prt_gstG13cost").html("$" + data.tbasreturn[i].fields.G13);
                                    $("#gstG14cost").val(data.tbasreturn[i].fields.G14);
                                    // $("#prt_gstG14cost").html("$" + data.tbasreturn[i].fields.G14);
                                    $("#gstG15cost").val(data.tbasreturn[i].fields.G15);
                                    // $("#prt_gstG15cost").html("$" + data.tbasreturn[i].fields.G15);
                                    $("#gstG16cost").val(data.tbasreturn[i].fields.G16);
                                    // $("#prt_gstG16cost").html("$" + data.tbasreturn[i].fields.G16);
                                    $("#gstG17cost").val(data.tbasreturn[i].fields.G17);
                                    // $("#prt_gstG17cost").html("$" + data.tbasreturn[i].fields.G17);
                                    $("#gstG18cost").val(data.tbasreturn[i].fields.G18);
                                    // $("#prt_gstG18cost").html("$" + data.tbasreturn[i].fields.G18);
                                    $("#gstG19cost").val(data.tbasreturn[i].fields.G19);
                                    // $("#prt_gstG19cost").html("$" + data.tbasreturn[i].fields.G19);
                                    $("#gstG20cost").val(data.tbasreturn[i].fields.G20);
                                    // $("#prt_gstG20cost").html("$" + data.tbasreturn[i].fields.G20);

                                    shareFunctionByName.initTable(data.tbasreturn[i].fields.G1Selected, "tbltaxCodeCheckbox_G1");
                                    shareFunctionByName.initTable(data.tbasreturn[i].fields.G2Selected, "tbltaxCodeCheckbox_G2");
                                    shareFunctionByName.initTable(data.tbasreturn[i].fields.G3Selected, "tbltaxCodeCheckbox_G3");
                                    shareFunctionByName.initTable(data.tbasreturn[i].fields.G4Selected, "tbltaxCodeCheckbox_G4");
                                    shareFunctionByName.initTable(data.tbasreturn[i].fields.G7Selected, "tbltaxCodeCheckbox_G7");
                                    shareFunctionByName.initTable(data.tbasreturn[i].fields.G10Selected, "tbltaxCodeCheckbox_G10");
                                    shareFunctionByName.initTable(data.tbasreturn[i].fields.G11Selected, "tbltaxCodeCheckbox_G11");
                                    shareFunctionByName.initTable(data.tbasreturn[i].fields.G13Selected, "tbltaxCodeCheckbox_G13");
                                    shareFunctionByName.initTable(data.tbasreturn[i].fields.G14Selected, "tbltaxCodeCheckbox_G14");
                                    shareFunctionByName.initTable(data.tbasreturn[i].fields.G15Selected, "tbltaxCodeCheckbox_G15");
                                    shareFunctionByName.initTable(data.tbasreturn[i].fields.G18Selected, "tbltaxCodeCheckbox_G18");
                                    shareFunctionByName.initTable(data.tbasreturn[i].fields._1CSelected, "tbltaxCodeCheckbox_1C");
                                    shareFunctionByName.initTable(data.tbasreturn[i].fields._1ESelected, "tbltaxCodeCheckbox_1E");
                                    shareFunctionByName.initTable(data.tbasreturn[i].fields._1DSelected, "tbltaxCodeCheckbox_1D");
                                    shareFunctionByName.initTable(data.tbasreturn[i].fields._1FSelected, "tbltaxCodeCheckbox_1F");
                                    shareFunctionByName.initTable(data.tbasreturn[i].fields._1GSelected, "tbltaxCodeCheckbox_1G");

                                    shareFunctionByName.initTable(data.tbasreturn[i].fields.W1Selected, "tblaccountsCheckbox_W1");
                                    shareFunctionByName.initTable(data.tbasreturn[i].fields.W2Selected, "tblaccountsCheckbox_W2");
                                    shareFunctionByName.initTable(data.tbasreturn[i].fields.W3Selected, "tblaccountsCheckbox_W3");
                                    shareFunctionByName.initTable(data.tbasreturn[i].fields.W4Selected, "tblaccountsCheckbox_W4");
                                    shareFunctionByName.initTable(data.tbasreturn[i].fields.T1Selected, "tblaccountsCheckbox_T1");
                                    shareFunctionByName.initTable(data.tbasreturn[i].fields._7DSelected, "tblaccountsCheckbox_7D");

                                    if (data.tbasreturn[i].fields.Tab2_Type == "Quarterly") {
                                        $("#datemethod1-t2").prop('checked', true);
                                        $("#datemethod2-t2").prop('checked', false);
                                    } else {
                                        $("#datemethod1-t2").prop('checked', false);
                                        $("#datemethod2-t2").prop('checked', true);
                                    }
                                    $("#beginmonthlydate-t2").val(data.tbasreturn[i].fields.Tab2_Month);
                                    $("#currentyear-t2").val(data.tbasreturn[i].fields.Tab2_Year);
                                    let tab2endDate = "";
                                    if (data.tbasreturn[i].fields.Tab2_Month != "" && data.tbasreturn[i].fields.Tab2_Year > 0) {
                                        var endMonth2 = (data.tbasreturn[i].fields.Tab2_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tbasreturn[i].fields.Tab2_Month]) / 3) * 3) : (months[data.tbasreturn[i].fields.Tab2_Month]);
                                        tab2endDate = new Date(data.tbasreturn[i].fields.Tab2_Year, (parseInt(endMonth2)), 0);
                                        tab2endDate = moment(tab2endDate).format("YYYY-MM-DD");
                                    }
                                    $("#endDate-t2").val(tab2endDate);
                                    // $("#prt_beginningDateT2").html(data.tbasreturn[i].fields.Tab2_Month + " " + data.tbasreturn[i].fields.Tab2_Year);
                                    if (data.tbasreturn[i].fields.Tab3_Type == "Quarterly") {
                                        $("#datemethod1-t2-2").prop('checked', true);
                                        $("#datemethod2-t2-2").prop('checked', false);
                                    } else {
                                        $("#datemethod1-t2-2").prop('checked', false);
                                        $("#datemethod2-t2-2").prop('checked', true);
                                    }
                                    $("#beginmonthlydate-t2-2").val(data.tbasreturn[i].fields.Tab3_Month);
                                    $("#currentyear-t2-2").val(data.tbasreturn[i].fields.Tab3_Year);
                                    let tab3endDate = "";
                                    if (data.tbasreturn[i].fields.Tab3_Month != "" && data.tbasreturn[i].fields.Tab3_Year > 0) {
                                        var endMonth3 = (data.tbasreturn[i].fields.Tab3_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tbasreturn[i].fields.Tab3_Month]) / 3) * 3) : (months[data.tbasreturn[i].fields.Tab3_Month]);
                                        tab3endDate = new Date(data.tbasreturn[i].fields.Tab3_Year, (parseInt(endMonth3)), 0);
                                        tab3endDate = moment(tab3endDate).format("YYYY-MM-DD");
                                    }
                                    $("#endDate-t2-2").val(tab3endDate);
                                    // $("#prt_beginningDateT2-2").html(data.tbasreturn[i].fields.Tab3_Month + " " + data.tbasreturn[i].fields.Tab3_Year);
                                    $("#accountsW1cost").val(data.tbasreturn[i].fields.W1);
                                    $("#prt_accountsW1cost").html("$" + data.tbasreturn[i].fields.W1);
                                    $("#accountsW2cost").val(data.tbasreturn[i].fields.W2);
                                    $("#prt_accountsW2cost").html("$" + data.tbasreturn[i].fields.W2);
                                    $("#accountsW3_cost").val(data.tbasreturn[i].fields.W3);
                                    $("#prt_accountsW3_cost").html("$" + data.tbasreturn[i].fields.W3);
                                    $("#accountsW4cost").val(data.tbasreturn[i].fields.W4);
                                    $("#prt_accountsW4cost").html("$" + data.tbasreturn[i].fields.W4);
                                    $("#accountsT1cost").val(data.tbasreturn[i].fields.T1);
                                    $("#prt_accountsT1cost").html("$" + data.tbasreturn[i].fields.T1);
                                    $("#accountsT2cost").val(data.tbasreturn[i].fields.T2);
                                    $("#prt_accountsT2cost").html(data.tbasreturn[i].fields.T2 + "%");
                                    $("#accountsT3cost").val(data.tbasreturn[i].fields.T3);
                                    $("#prt_accountsT3cost").html(data.tbasreturn[i].fields.T3 + "%");
                                    $("#reasonT4").val(data.tbasreturn[i].fields.T4);
                                    $(".prt_reasonT4").html(data.tbasreturn[i].fields.T4);
                                    $("#accountsF1cost").val(data.tbasreturn[i].fields.F1);
                                    $("#prt_accountsF1cost").html("$" + data.tbasreturn[i].fields.F1);
                                    $("#accountsF2cost").val(data.tbasreturn[i].fields.F2);
                                    $("#prt_accountsF2cost").html("$" + data.tbasreturn[i].fields.F2);
                                    $("#accountsF3cost").val(data.tbasreturn[i].fields.F3);
                                    $("#prt_accountsF3cost").html("$" + data.tbasreturn[i].fields.F3);
                                    $("#reasonF4").val(data.tbasreturn[i].fields.F4);
                                    $("#prt_reasonF4").html(data.tbasreturn[i].fields.F4);

                                    if (data.tbasreturn[i].fields.Tab4_Type == "Quarterly") {
                                        $("#datemethod1-t3").prop('checked', true);
                                        $("#datemethod2-t3").prop('checked', false);
                                    } else {
                                        $("#datemethod1-t3").prop('checked', false);
                                        $("#datemethod2-t3").prop('checked', true);
                                    }
                                    $("#beginmonthlydate-t3").val(data.tbasreturn[i].fields.Tab4_Month);
                                    $("#currentyear-t3").val(data.tbasreturn[i].fields.Tab4_Year);
                                    let tab4endDate = "";
                                    if (data.tbasreturn[i].fields.Tab4_Month != "" && data.tbasreturn[0].fields.Tab4_Year > 0) {
                                        var endMonth4 = (data.tbasreturn[i].fields.Tab4_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tbasreturn[i].fields.Tab4_Month]) / 3) * 3) : (months[data.tbasreturn[i].fields.Tab4_Month]);
                                        tab4endDate = new Date(data.tbasreturn[i].fields.Tab4_Year, (parseInt(endMonth4)), 0);
                                        tab4endDate = moment(tab4endDate).format("YYYY-MM-DD");
                                    }
                                    $("#endDate-t3").val(tab4endDate);
                                    // $("#prt_beginningDateT3").html(data.tbasreturn[i].fields.Tab4_Month + " " + data.tbasreturn[i].fields.Tab4_Year);
                                    $("#gst1Ccost").val(data.tbasreturn[i].fields._1C);
                                    $("#prt_gst1Ccost").html("$" + data.tbasreturn[i].fields._1C);
                                    $("#gst1Ecost").val(data.tbasreturn[i].fields._1E);
                                    $("#prt_gst1Ecost").html("$" + data.tbasreturn[i].fields._1E);
                                    $("#gst1Dcost").val(data.tbasreturn[i].fields._1D);
                                    $("#prt_gst1Dcost").html("$" + data.tbasreturn[i].fields._1D);
                                    $("#gst1Fcost").val(data.tbasreturn[i].fields._1F);
                                    $("#prt_gst1Fcost").html("$" + data.tbasreturn[i].fields._1F);
                                    $("#gst1Gcost").val(data.tbasreturn[i].fields._1G);
                                    $("#prt_gst1Gcost").html("$" + data.tbasreturn[i].fields._1G);
                                    $("#accounts7Dcost").val(data.tbasreturn[i].fields._7D);
                                    $("#prt_accounts7Dcost").html("$" + data.tbasreturn[i].fields._7D);
                                    $("#debits1cost").val(data.tbasreturn[i].fields._1A);
                                    $("#prt_gstG21cost").html("$" + data.tbasreturn[i].fields._1A);
                                    $("#prt_gstG23cost").html("$" + data.tbasreturn[i].fields._1A);
                                    $("#prt_debits1cost").html("$" + data.tbasreturn[i].fields._1A);
                                    $("#debits2cost").val(data.tbasreturn[i].fields._1C);
                                    $("#prt_debits2cost").html("$" + data.tbasreturn[i].fields._1C);
                                    $("#debits3cost").val(data.tbasreturn[i].fields._1E);
                                    $("#prt_debits3cost").html("$" + data.tbasreturn[i].fields._1E);
                                    $("#debits4cost").val(data.tbasreturn[i].fields._2A);
                                    $("#prt_debits4cost").html("$" + data.tbasreturn[i].fields._2A);
                                    $("#debits5cost").val(data.tbasreturn[i].fields._3);
                                    $("#prt_debits5cost").html("$" + data.tbasreturn[i].fields._3);
                                    $("#debits6cost").val(data.tbasreturn[i].fields._4);
                                    $("#prt_accountsW2+W3+W4cost").html("$" + data.tbasreturn[i].fields._4);
                                    $("#prt_debits6cost").html("$" + data.tbasreturn[i].fields._4);
                                    $("#debits7cost").val(data.tbasreturn[i].fields._5A);
                                    $("#prt_accountsT7cost").html("$" + data.tbasreturn[i].fields._5A);
                                    $("#prt_accountsT11cost").html("$" + data.tbasreturn[i].fields._5A);
                                    $("#prt_debits7cost").html("$" + data.tbasreturn[i].fields._5A);
                                    $("#debits8cost").val(data.tbasreturn[i].fields._6A);
                                    $("#prt_debits8cost").html("$" + data.tbasreturn[i].fields._6A);
                                    $("#debits9cost").val(data.tbasreturn[i].fields._7);
                                    $("#prt_debits9cost").html("$" + data.tbasreturn[i].fields._7);
                                    $("#debits10cost").val(data.tbasreturn[i].fields._8A);
                                    $("#prt_debits10cost").html("$" + data.tbasreturn[i].fields._8A);
                                    $("#debits11cost").val(data.tbasreturn[i].fields._9);
                                    $("#prt_debits11cost").html("$" + data.tbasreturn[i].fields._9);
                                    $("#credits1cost").val(data.tbasreturn[i].fields._1B);
                                    $("#prt_credits1cost").html("$" + data.tbasreturn[i].fields._1B);
                                    $("#credits2cost").val(data.tbasreturn[i].fields._1D);
                                    $("#prt_credits2cost").html("$" + data.tbasreturn[i].fields._1D);
                                    $("#credits3cost").val(data.tbasreturn[i].fields._1F);
                                    $("#prt_credits3cost").html("$" + data.tbasreturn[i].fields._1F);
                                    $("#credits4cost").val(data.tbasreturn[i].fields._1G);
                                    $("#prt_credits4cost").html("$" + data.tbasreturn[i].fields._1G);
                                    $("#credits5cost").val(data.tbasreturn[i].fields._2B);
                                    $("#prt_credits5cost").html("$" + data.tbasreturn[i].fields._2B);
                                    $("#credits6cost").val(data.tbasreturn[i].fields._5B);
                                    $("#prt_credits6cost").html("$" + data.tbasreturn[i].fields._5B);
                                    $("#credits7cost").val(data.tbasreturn[i].fields._6B);
                                    $("#prt_credits7cost").html("$" + data.tbasreturn[i].fields._6B);
                                    $("#credits8cost").val(data.tbasreturn[i].fields._7D);
                                    $("#prt_credits8cost").html("$" + data.tbasreturn[i].fields._7D);
                                    $("#credits9cost").val(data.tbasreturn[i].fields._8B);
                                    $("#prt_credits9cost").html("$" + data.tbasreturn[i].fields._8B);
                                }
                            }
                        }
                    }).catch(function(err) {
                        let taxRateList = templateObject.taxRateList.get();
                        let accountsList = templateObject.accountsList.get();
                        let deptrecords = templateObject.deptrecords.get();
                        reportService.getOneBASReturn(getid[1]).then(function(data) {
                            $("#description").val(data.tbasreturn[0].fields.BasSheetDesc);
                            $("#basreturnCategory1").prop('checked', data.tbasreturn[0].fields.HasTab1);
                            $("#basreturnCategory2").prop('checked', data.tbasreturn[0].fields.HasTab2);
                            $("#basreturnCategory3").prop('checked', data.tbasreturn[0].fields.HasTab3);
                            $("#basreturnCategory4").prop('checked', data.tbasreturn[0].fields.HasTab4);
                            if (data.tbasreturn[0].fields.HasTab1 == true) {
                                document.getElementById("gstG1").setAttribute("href", "#gstG1option");
                                document.getElementById("gstG2").setAttribute("href", "#gstG2option");
                                document.getElementById("gstG3").setAttribute("href", "#gstG3option");
                                document.getElementById("gstG4").setAttribute("href", "#gstG4option");
                                document.getElementById("gstG7").setAttribute("href", "#gstG7option");
                                document.getElementById("gstG10").setAttribute("href", "#gstG10option");
                                document.getElementById("gstG11").setAttribute("href", "#gstG11option");
                                document.getElementById("gstG13").setAttribute("href", "#gstG13option");
                                document.getElementById("gstG14").setAttribute("href", "#gstG14option");
                                document.getElementById("gstG15").setAttribute("href", "#gstG15option");
                                document.getElementById("gstG18").setAttribute("href", "#gstG18option");
                            } else {
                                document.getElementById("gstG1").setAttribute("href", "#");
                                document.getElementById("gstG2").setAttribute("href", "#");
                                document.getElementById("gstG3").setAttribute("href", "#");
                                document.getElementById("gstG4").setAttribute("href", "#");
                                document.getElementById("gstG7").setAttribute("href", "#");
                                document.getElementById("gstG10").setAttribute("href", "#");
                                document.getElementById("gstG11").setAttribute("href", "#");
                                document.getElementById("gstG13").setAttribute("href", "#");
                                document.getElementById("gstG14").setAttribute("href", "#");
                                document.getElementById("gstG15").setAttribute("href", "#");
                                document.getElementById("gstG18").setAttribute("href", "#");
                            }
                            if (data.tbasreturn[0].fields.HasTab2 == true) {
                                document.getElementById("accountsW1").setAttribute("href", "#accountsW1option");
                                document.getElementById("accountsW2").setAttribute("href", "#accountsW2option");
                                document.getElementById("accountsW3_").setAttribute("href", "#accountsW3_option");
                                document.getElementById("accountsW4").setAttribute("href", "#accountsW4option");
                            } else {
                                document.getElementById("accountsW1").setAttribute("href", "#");
                                document.getElementById("accountsW2").setAttribute("href", "#");
                                document.getElementById("accountsW3_").setAttribute("href", "#");
                                document.getElementById("accountsW4").setAttribute("href", "#");
                            }
                            if (data.tbasreturn[0].fields.HasTab3 == true) {
                                document.getElementById("accountsT1").setAttribute("href", "#accountsT1option");
                                $("#accountsT2cost").removeAttr("disabled");
                                $("#accountsT3cost").removeAttr("disabled");
                                $("#reasonT4").removeAttr("disabled");
                                $("#accountsF1cost").removeAttr("disabled");
                                $("#accountsF2cost").removeAttr("disabled");
                                $("#accountsF3cost").removeAttr("disabled");
                                $("#reasonF4").removeAttr("disabled");
                            } else {
                                document.getElementById("accountsT1").setAttribute("href", "#");
                                $("#accountsT2cost").attr("disabled", "disabled");
                                $("#accountsT3cost").attr("disabled", "disabled");
                                $("#reasonT4").attr("disabled", "disabled");
                                $("#accountsF1cost").attr("disabled", "disabled");
                                $("#accountsF2cost").attr("disabled", "disabled");
                                $("#accountsF3cost").attr("disabled", "disabled");
                                $("#reasonF4").attr("disabled", "disabled");
                            }
                            if (data.tbasreturn[0].fields.HasTab4 == true) {
                                document.getElementById("gst1C").setAttribute("href", "#gst1Coption");
                                document.getElementById("gst1E").setAttribute("href", "#gst1Eoption");
                                document.getElementById("gst1D").setAttribute("href", "#gst1Doption");
                                document.getElementById("gst1F").setAttribute("href", "#gst1Foption");
                                document.getElementById("gst1G").setAttribute("href", "#gst1Goption");
                                document.getElementById("accounts7D").setAttribute("href", "#accounts7Doption");
                            } else {
                                document.getElementById("gst1C").setAttribute("href", "#");
                                document.getElementById("gst1E").setAttribute("href", "#");
                                document.getElementById("gst1D").setAttribute("href", "#");
                                document.getElementById("gst1F").setAttribute("href", "#");
                                document.getElementById("gst1G").setAttribute("href", "#");
                                document.getElementById("accounts7D").setAttribute("href", "#");
                            }
                            if (data.tbasreturn[0].fields.ClassID > 0) {
                                for (var i = 0; i < deptrecords.length; i++) {
                                    if (deptrecords[i].id == data.tbasreturn[0].fields.ClassID) {
                                        $("#sltDepartment").val(deptrecords[i].department);
                                        $("#sltDepartmentID").val(deptrecords[i].id);
                                    }
                                }
                            }
                            if (data.tbasreturn[0].fields.AllClass == true) {
                                $("#allDepart").prop('checked', true);
                            } else {
                                $("#allDepart").prop('checked', false);
                            }
                            if (data.tbasreturn[0].fields.AccMethod == "Accrual") {
                                $("#accountingmethod1").prop('checked', true);
                                $("#accountingmethod2").prop('checked', false);
                            } else {
                                $("#accountingmethod1").prop('checked', false);
                                $("#accountingmethod2").prop('checked', true);
                            }
                            $("#prt_accountingMethod").html(data.tbasreturn[0].AccMethod);
                            if (data.tbasreturn[0].fields.Tab1_Type == "Quarterly") {
                                $("#datemethod1").prop('checked', true);
                                $("#datemethod2").prop('checked', false);
                            } else {
                                $("#datemethod1").prop('checked', false);
                                $("#datemethod2").prop('checked', true);
                            }
                            $("#beginmonthlydate").val(data.tbasreturn[0].fields.Tab1_Month);
                            $("#currentyear").val(data.tbasreturn[0].fields.Tab1_Year);
                            let tab1endDate = "";
                            if (data.tbasreturn[0].fields.Tab1_Month != "" && data.tbasreturn[0].fields.Tab1_Year > 0) {
                                var endMonth = (data.tbasreturn[0].fields.Tab1_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tbasreturn[0].fields.Tab1_Month]) / 3) * 3) : (months[data.tbasreturn[0].fields.Tab1_Month]);
                                tab1endDate = new Date(data.tbasreturn[0].fields.Tab1_Year, (parseInt(endMonth)), 0);
                                tab1endDate = moment(tab1endDate).format("YYYY-MM-DD");
                            }
                            $("#endDate").val(tab1endDate);
                            $("#prt_beginningDate").html(data.tbasreturn[0].fields.Tab1_Month + " " + data.tbasreturn[0].fields.Tab1_Year);
                            $("#gstG1cost").val(data.tbasreturn[0].fields.G1);
                            $(".prt_gstG1cost").html("$" + data.tbasreturn[0].fields.G1);
                            $("#gstG2cost").val(data.tbasreturn[0].fields.G2);
                            $("#prt_gstG2cost").html("$" + data.tbasreturn[0].fields.G2);
                            $("#gstG3cost").val(data.tbasreturn[0].fields.G3);
                            $("#prt_gstG3cost").html("$" + data.tbasreturn[0].fields.G3);
                            $("#gstG4cost").val(data.tbasreturn[0].fields.G4);
                            // $("#prt_gstG4cost").html("$" + data.tbasreturn[0].fields.G4);
                            $("#gstG5cost").val(data.tbasreturn[0].fields.G5);
                            // $("#prt_gstG5cost").html("$" + data.tbasreturn[0].fields.G5);
                            $("#gstG6cost").val(data.tbasreturn[0].fields.G6);
                            // $("#prt_gstG6cost").html("$" + data.tbasreturn[0].fields.G6);
                            $("#gstG7cost").val(data.tbasreturn[0].fields.G7);
                            // $("#prt_gstG7cost").html("$" + data.tbasreturn[0].fields.G7);
                            $("#gstG8cost").val(data.tbasreturn[0].fields.G8);
                            // $("#prt_gstG8cost").html("$" + data.tbasreturn[0].fields.G8);
                            $("#gstG9cost").val(data.tbasreturn[0].fields.G9);
                            // $("#prt_gstG9cost").html("$" + data.tbasreturn[0].fields.G9);
                            $("#gstG10cost").val(data.tbasreturn[0].fields.G10);
                            $("#prt_gstG10cost").html("$" + data.tbasreturn[0].fields.G10);
                            $("#gstG11cost").val(data.tbasreturn[0].fields.G11);
                            $("#prt_gstG11cost").html("$" + data.tbasreturn[0].fields.G11);
                            $("#gstG12cost").val(data.tbasreturn[0].fields.G12);
                            // $("#prt_gstG12cost").html("$" + data.tbasreturn[0].fields.G12);
                            $("#gstG13cost").val(data.tbasreturn[0].fields.G13);
                            // $("#prt_gstG13cost").html("$" + data.tbasreturn[0].fields.G13);
                            $("#gstG14cost").val(data.tbasreturn[0].fields.G14);
                            // $("#prt_gstG14cost").html("$" + data.tbasreturn[0].fields.G14);
                            $("#gstG15cost").val(data.tbasreturn[0].fields.G15);
                            // $("#prt_gstG15cost").html("$" + data.tbasreturn[0].fields.G15);
                            $("#gstG16cost").val(data.tbasreturn[0].fields.G16);
                            // $("#prt_gstG16cost").html("$" + data.tbasreturn[0].fields.G16);
                            $("#gstG17cost").val(data.tbasreturn[0].fields.G17);
                            // $("#prt_gstG17cost").html("$" + data.tbasreturn[0].fields.G17);
                            $("#gstG18cost").val(data.tbasreturn[0].fields.G18);
                            // $("#prt_gstG18cost").html("$" + data.tbasreturn[0].fields.G18);
                            $("#gstG19cost").val(data.tbasreturn[0].fields.G19);
                            // $("#prt_gstG19cost").html("$" + data.tbasreturn[0].fields.G19);
                            $("#gstG20cost").val(data.tbasreturn[0].fields.G20);
                            // $("#prt_gstG20cost").html("$" + data.tbasreturn[0].fields.G20);

                            shareFunctionByName.initTable(data.tbasreturn[0].fields.G1Selected, "tbltaxCodeCheckbox_G1");
                            shareFunctionByName.initTable(data.tbasreturn[0].fields.G2Selected, "tbltaxCodeCheckbox_G2");
                            shareFunctionByName.initTable(data.tbasreturn[0].fields.G3Selected, "tbltaxCodeCheckbox_G3");
                            shareFunctionByName.initTable(data.tbasreturn[0].fields.G4Selected, "tbltaxCodeCheckbox_G4");
                            shareFunctionByName.initTable(data.tbasreturn[0].fields.G7Selected, "tbltaxCodeCheckbox_G7");
                            shareFunctionByName.initTable(data.tbasreturn[0].fields.G10Selected, "tbltaxCodeCheckbox_G10");
                            shareFunctionByName.initTable(data.tbasreturn[0].fields.G11Selected, "tbltaxCodeCheckbox_G11");
                            shareFunctionByName.initTable(data.tbasreturn[0].fields.G13Selected, "tbltaxCodeCheckbox_G13");
                            shareFunctionByName.initTable(data.tbasreturn[0].fields.G14Selected, "tbltaxCodeCheckbox_G14");
                            shareFunctionByName.initTable(data.tbasreturn[0].fields.G15Selected, "tbltaxCodeCheckbox_G15");
                            shareFunctionByName.initTable(data.tbasreturn[0].fields.G18Selected, "tbltaxCodeCheckbox_G18");
                            shareFunctionByName.initTable(data.tbasreturn[0].fields._1CSelected, "tbltaxCodeCheckbox_1C");
                            shareFunctionByName.initTable(data.tbasreturn[0].fields._1ESelected, "tbltaxCodeCheckbox_1E");
                            shareFunctionByName.initTable(data.tbasreturn[0].fields._1DSelected, "tbltaxCodeCheckbox_1D");
                            shareFunctionByName.initTable(data.tbasreturn[0].fields._1FSelected, "tbltaxCodeCheckbox_1F");
                            shareFunctionByName.initTable(data.tbasreturn[0].fields._1GSelected, "tbltaxCodeCheckbox_1G");

                            shareFunctionByName.initTable(data.tbasreturn[0].fields.W1Selected, "tblaccountsCheckbox_W1");
                            shareFunctionByName.initTable(data.tbasreturn[0].fields.W2Selected, "tblaccountsCheckbox_W2");
                            shareFunctionByName.initTable(data.tbasreturn[0].fields.W3Selected, "tblaccountsCheckbox_W3");
                            shareFunctionByName.initTable(data.tbasreturn[0].fields.W4Selected, "tblaccountsCheckbox_W4");
                            shareFunctionByName.initTable(data.tbasreturn[0].fields.T1Selected, "tblaccountsCheckbox_T1");
                            shareFunctionByName.initTable(data.tbasreturn[0].fields._7DSelected, "tblaccountsCheckbox_7D");

                            if (data.tbasreturn[0].fields.Tab2_Type == "Quarterly") {
                                $("#datemethod1-t2").prop('checked', true);
                                $("#datemethod2-t2").prop('checked', false);
                            } else {
                                $("#datemethod1-t2").prop('checked', false);
                                $("#datemethod2-t2").prop('checked', true);
                            }
                            $("#beginmonthlydate-t2").val(data.tbasreturn[0].fields.Tab2_Month);
                            $("#currentyear-t2").val(data.tbasreturn[0].fields.Tab2_Year);
                            let tab2endDate = "";
                            if (data.tbasreturn[0].fields.Tab2_Month != "" && data.tbasreturn[0].fields.Tab2_Year > 0) {
                                var endMonth2 = (data.tbasreturn[0].fields.Tab2_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tbasreturn[0].fields.Tab2_Month]) / 3) * 3) : (months[data.tbasreturn[0].fields.Tab2_Month]);
                                tab2endDate = new Date(data.tbasreturn[0].fields.Tab2_Year, (parseInt(endMonth2)), 0);
                                tab2endDate = moment(tab2endDate).format("YYYY-MM-DD");
                            }
                            $("#endDate-t2").val(tab2endDate);
                            // $("#prt_beginningDateT2").html(data.tbasreturn[0].fields.Tab2_Month + " " + data.tbasreturn[0].fields.Tab2_Year);
                            if (data.tbasreturn[0].fields.Tab3_Type == "Quarterly") {
                                $("#datemethod1-t2-2").prop('checked', true);
                                $("#datemethod2-t2-2").prop('checked', false);
                            } else {
                                $("#datemethod1-t2-2").prop('checked', false);
                                $("#datemethod2-t2-2").prop('checked', true);
                            }
                            $("#beginmonthlydate-t2-2").val(data.tbasreturn[0].fields.Tab3_Month);
                            $("#currentyear-t2-2").val(data.tbasreturn[0].fields.Tab3_Year);
                            let tab3endDate = "";
                            if (data.tbasreturn[0].fields.Tab3_Month != "" && data.tbasreturn[0].fields.Tab3_Year > 0) {
                                var endMonth3 = (data.tbasreturn[0].fields.Tab3_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tbasreturn[0].fields.Tab3_Month]) / 3) * 3) : (months[data.tbasreturn[0].fields.Tab3_Month]);
                                tab3endDate = new Date(data.tbasreturn[0].fields.Tab3_Year, (parseInt(endMonth3)), 0);
                                tab3endDate = moment(tab3endDate).format("YYYY-MM-DD");
                            }
                            $("#endDate-t2-2").val(tab3endDate);
                            // $("#prt_beginningDateT2-2").html(data.tbasreturn[i].fields.Tab3_Month + " " + data.tbasreturn[i].fields.Tab3_Year);
                            $("#accountsW1cost").val(data.tbasreturn[0].fields.W1);
                            $("#prt_accountsW1cost").html("$" + data.tbasreturn[0].fields.W1);
                            $("#accountsW2cost").val(data.tbasreturn[0].fields.W2);
                            $("#prt_accountsW2cost").html("$" + data.tbasreturn[0].fields.W2);
                            $("#accountsW3_cost").val(data.tbasreturn[0].fields.W3);
                            $("#prt_accountsW3_cost").html("$" + data.tbasreturn[0].fields.W3);
                            $("#accountsW4cost").val(data.tbasreturn[0].fields.W4);
                            $("#prt_accountsW4cost").html("$" + data.tbasreturn[0].fields.W4);
                            $("#accountsT1cost").val(data.tbasreturn[0].fields.T1);
                            $("#prt_accountsT1cost").html("$" + data.tbasreturn[0].fields.T1);
                            $("#accountsT2cost").val(data.tbasreturn[0].fields.T2);
                            $("#prt_accountsT2cost").html(data.tbasreturn[0].fields.T2 + "%");
                            $("#accountsT3cost").val(data.tbasreturn[0].fields.T3);
                            $("#prt_accountsT3cost").html(data.tbasreturn[0].fields.T3 + "%");
                            $("#reasonT4").val(data.tbasreturn[0].fields.T4);
                            $(".prt_reasonT4").html(data.tbasreturn[0].fields.T4);
                            $("#accountsF1cost").val(data.tbasreturn[0].fields.F1);
                            $("#prt_accountsF1cost").html("$" + data.tbasreturn[0].fields.F1);
                            $("#accountsF2cost").val(data.tbasreturn[0].fields.F2);
                            $("#prt_accountsF2cost").html("$" + data.tbasreturn[0].fields.F2);
                            $("#accountsF3cost").val(data.tbasreturn[0].fields.F3);
                            $("#prt_accountsF3cost").html("$" + data.tbasreturn[0].fields.F3);
                            $("#reasonF4").val(data.tbasreturn[0].fields.F4);
                            $("#prt_reasonF4").html(data.tbasreturn[0].fields.F4);

                            if (data.tbasreturn[0].fields.Tab4_Type == "Quarterly") {
                                $("#datemethod1-t3").prop('checked', true);
                                $("#datemethod2-t3").prop('checked', false);
                            } else {
                                $("#datemethod1-t3").prop('checked', false);
                                $("#datemethod2-t3").prop('checked', true);
                            }
                            $("#beginmonthlydate-t3").val(data.tbasreturn[0].fields.Tab4_Month);
                            $("#currentyear-t3").val(data.tbasreturn[0].fields.Tab4_Year);
                            let tab4endDate = "";
                            if (data.tbasreturn[0].fields.Tab4_Month != "" && data.tbasreturn[0].fields.Tab4_Year > 0) {
                                var endMonth4 = (data.tbasreturn[0].fields.Tab4_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.tbasreturn[0].fields.Tab4_Month]) / 3) * 3) : (months[data.tbasreturn[0].fields.Tab4_Month]);
                                tab4endDate = new Date(data.tbasreturn[0].fields.Tab4_Year, (parseInt(endMonth4)), 0);
                                tab4endDate = moment(tab4endDate).format("YYYY-MM-DD");
                            }
                            $("#endDate-t3").val(tab4endDate);
                            // $("#prt_beginningDateT3").html(data.tbasreturn[0].fields.Tab4_Month + " " + data.tbasreturn[0].fields.Tab4_Year);
                            $("#gst1Ccost").val(data.tbasreturn[0].fields._1C);
                            $("#prt_gst1Ccost").html("$" + data.tbasreturn[0].fields._1C);
                            $("#gst1Ecost").val(data.tbasreturn[0].fields._1E);
                            $("#prt_gst1Ecost").html("$" + data.tbasreturn[0].fields._1E);
                            $("#gst1Dcost").val(data.tbasreturn[0].fields._1D);
                            $("#prt_gst1Dcost").html("$" + data.tbasreturn[0].fields._1D);
                            $("#gst1Fcost").val(data.tbasreturn[0].fields._1F);
                            $("#prt_gst1Fcost").html("$" + data.tbasreturn[0].fields._1F);
                            $("#gst1Gcost").val(data.tbasreturn[0].fields._1G);
                            $("#prt_gst1Gcost").html("$" + data.tbasreturn[0].fields._1G);
                            $("#accounts7Dcost").val(data.tbasreturn[0].fields._7D);
                            $("#prt_accounts7Dcost").html("$" + data.tbasreturn[0].fields._7D);
                            $("#debits1cost").val(data.tbasreturn[0].fields._1A);
                            $("#prt_gstG21cost").html("$" + data.tbasreturn[0].fields._1A);
                            $("#prt_gstG23cost").html("$" + data.tbasreturn[0].fields._1A);
                            $("#prt_debits1cost").html("$" + data.tbasreturn[0].fields._1A);
                            $("#debits2cost").val(data.tbasreturn[0].fields._1C);
                            $("#prt_debits2cost").html("$" + data.tbasreturn[0].fields._1C);
                            $("#debits3cost").val(data.tbasreturn[0].fields._1E);
                            $("#prt_debits3cost").html("$" + data.tbasreturn[0].fields._1E);
                            $("#debits4cost").val(data.tbasreturn[0].fields._2A);
                            $("#prt_debits4cost").html("$" + data.tbasreturn[0].fields._2A);
                            $("#debits5cost").val(data.tbasreturn[0].fields._3);
                            $("#prt_debits5cost").html("$" + data.tbasreturn[0].fields._3);
                            $("#debits6cost").val(data.tbasreturn[0].fields._4);
                            $("#prt_accountsW2+W3+W4cost").html("$" + data.tbasreturn[0].fields._4);
                            $("#prt_debits6cost").html("$" + data.tbasreturn[0].fields._4);
                            $("#debits7cost").val(data.tbasreturn[0].fields._5A);
                            $("#prt_accountsT7cost").html("$" + data.tbasreturn[0].fields._5A);
                            $("#prt_accountsT11cost").html("$" + data.tbasreturn[0].fields._5A);
                            $("#prt_debits7cost").html("$" + data.tbasreturn[0].fields._5A);
                            $("#debits8cost").val(data.tbasreturn[0].fields._6A);
                            $("#prt_debits8cost").html("$" + data.tbasreturn[0].fields._6A);
                            $("#debits9cost").val(data.tbasreturn[0].fields._7);
                            $("#prt_debits9cost").html("$" + data.tbasreturn[0].fields._7);
                            $("#debits10cost").val(data.tbasreturn[0].fields._8A);
                            $("#prt_debits10cost").html("$" + data.tbasreturn[0].fields._8A);
                            $("#debits11cost").val(data.tbasreturn[0].fields._9);
                            $("#prt_debits11cost").html("$" + data.tbasreturn[0].fields._9);
                            $("#credits1cost").val(data.tbasreturn[0].fields._1B);
                            $("#prt_credits1cost").html("$" + data.tbasreturn[0].fields._1B);
                            $("#credits2cost").val(data.tbasreturn[0].fields._1D);
                            $("#prt_credits2cost").html("$" + data.tbasreturn[0].fields._1D);
                            $("#credits3cost").val(data.tbasreturn[0].fields._1F);
                            $("#prt_credits3cost").html("$" + data.tbasreturn[0].fields._1F);
                            $("#credits4cost").val(data.tbasreturn[0].fields._1G);
                            $("#prt_credits4cost").html("$" + data.tbasreturn[0].fields._1G);
                            $("#credits5cost").val(data.tbasreturn[0].fields._2B);
                            $("#prt_credits5cost").html("$" + data.tbasreturn[0].fields._2B);
                            $("#credits6cost").val(data.tbasreturn[0].fields._5B);
                            $("#prt_credits6cost").html("$" + data.tbasreturn[0].fields._5B);
                            $("#credits7cost").val(data.tbasreturn[0].fields._6B);
                            $("#prt_credits7cost").html("$" + data.tbasreturn[0].fields._6B);
                            $("#credits8cost").val(data.tbasreturn[0].fields._7D);
                            $("#prt_credits8cost").html("$" + data.tbasreturn[0].fields._7D);
                            $("#credits9cost").val(data.tbasreturn[0].fields._8B);
                            $("#prt_credits9cost").html("$" + data.tbasreturn[0].fields._8B);
                        }).catch(function(err) {
                            $('.fullScreenSpin').css('display', 'none');
                        })
                    });
                }
            } else {
                templateObject.pageTitle.set("New BAS Return");
            }

            $(document).on("click", "#basreturnCategory1", function(e) {
                if ($("#basreturnCategory1").prop('checked') == true) {
                    document.getElementById("gstG1").setAttribute("href", "#gstG1option");
                    document.getElementById("gstG2").setAttribute("href", "#gstG2option");
                    document.getElementById("gstG3").setAttribute("href", "#gstG3option");
                    document.getElementById("gstG4").setAttribute("href", "#gstG4option");
                    document.getElementById("gstG7").setAttribute("href", "#gstG7option");
                    document.getElementById("gstG10").setAttribute("href", "#gstG10option");
                    document.getElementById("gstG11").setAttribute("href", "#gstG11option");
                    document.getElementById("gstG13").setAttribute("href", "#gstG13option");
                    document.getElementById("gstG14").setAttribute("href", "#gstG14option");
                    document.getElementById("gstG15").setAttribute("href", "#gstG15option");
                    document.getElementById("gstG18").setAttribute("href", "#gstG18option");
                } else {
                    document.getElementById("gstG1").setAttribute("href", "#");
                    document.getElementById("gstG2").setAttribute("href", "#");
                    document.getElementById("gstG3").setAttribute("href", "#");
                    document.getElementById("gstG4").setAttribute("href", "#");
                    document.getElementById("gstG7").setAttribute("href", "#");
                    document.getElementById("gstG10").setAttribute("href", "#");
                    document.getElementById("gstG11").setAttribute("href", "#");
                    document.getElementById("gstG13").setAttribute("href", "#");
                    document.getElementById("gstG14").setAttribute("href", "#");
                    document.getElementById("gstG15").setAttribute("href", "#");
                    document.getElementById("gstG18").setAttribute("href", "#");
                }
            });

            $(document).on("click", "#basreturnCategory2", function(e) {
                if ($("#basreturnCategory2").prop('checked') == true) {
                    document.getElementById("accountsW1").setAttribute("href", "#accountsW1option");
                    document.getElementById("accountsW2").setAttribute("href", "#accountsW2option");
                    document.getElementById("accountsW3_").setAttribute("href", "#accountsW3_option");
                    document.getElementById("accountsW4").setAttribute("href", "#accountsW4option");
                } else {
                    document.getElementById("accountsW1").setAttribute("href", "#");
                    document.getElementById("accountsW2").setAttribute("href", "#");
                    document.getElementById("accountsW3_").setAttribute("href", "#");
                    document.getElementById("accountsW4").setAttribute("href", "#");
                }
            });

            $(document).on("click", "#basreturnCategory3", function(e) {
                if ($("#basreturnCategory3").prop('checked') == true) {
                    document.getElementById("accountsT1").setAttribute("href", "#accountsT1option");
                    $("#accountsT2cost").removeAttr("disabled");
                    $("#accountsT3cost").removeAttr("disabled");
                    $("#reasonT4").removeAttr("disabled");
                    $("#accountsF1cost").removeAttr("disabled");
                    $("#accountsF2cost").removeAttr("disabled");
                    $("#accountsF3cost").removeAttr("disabled");
                    $("#reasonF4").removeAttr("disabled");
                } else {
                    document.getElementById("accountsT1").setAttribute("href", "#");
                    $("#accountsT2cost").attr("disabled", "disabled");
                    $("#accountsT3cost").attr("disabled", "disabled");
                    $("#reasonT4").attr("disabled", "disabled");
                    $("#accountsF1cost").attr("disabled", "disabled");
                    $("#accountsF2cost").attr("disabled", "disabled");
                    $("#accountsF3cost").attr("disabled", "disabled");
                    $("#reasonF4").attr("disabled", "disabled");
                }
            });

            $(document).on("click", "#basreturnCategory4", function(e) {
                if ($("#basreturnCategory4").prop('checked') == true) {
                    document.getElementById("gst1C").setAttribute("href", "#gst1Coption");
                    document.getElementById("gst1E").setAttribute("href", "#gst1Eoption");
                    document.getElementById("gst1D").setAttribute("href", "#gst1Doption");
                    document.getElementById("gst1F").setAttribute("href", "#gst1Foption");
                    document.getElementById("gst1G").setAttribute("href", "#gst1Goption");
                    document.getElementById("accounts7D").setAttribute("href", "#accounts7Doption");
                } else {
                    document.getElementById("gst1C").setAttribute("href", "#");
                    document.getElementById("gst1E").setAttribute("href", "#");
                    document.getElementById("gst1D").setAttribute("href", "#");
                    document.getElementById("gst1F").setAttribute("href", "#");
                    document.getElementById("gst1G").setAttribute("href", "#");
                    document.getElementById("accounts7D").setAttribute("href", "#");
                }
            });
        });
    }, 500);

    $(document).on("click", "#departmentList tbody tr", function(e) {
        $('#sltDepartment').val($(this).find(".colDeptName").text());
        $('#sltDepartmentID').val($(this).attr("id"));
        $('#departmentModal').modal('toggle');
        $("#allDepart").prop('checked', false);
    });
});

Template.basreturn.helpers({
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
    gstPanList: () => {
        let gstArray = ["G1", "G2", "G3", "G4", "G7", "G10", "G11", "G13", "G14", "G15", "G18", "1C", "1E", "1D", "1F", "1G"];
        return gstArray;
    },
    accountsPanList: () => {
        let accountsArray = ["W1", "W2", "W4", "W3_", "T1", "7D"];
        return accountsArray;
    },
    taxcodesPanListT3: () => {
        let taxcodesArray = [1, 2, 3, 4, 5];
        return taxcodesArray;
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

Template.basreturn.events({
    "click #loadBasOption": (e) => {
        if ($("#allDepart").prop('checked') == false && $('#sltDepartment').val() == "") {
            swal('Department cannot be blank!', '', 'warning');
        } else {
            $("#basoptionmodal").modal("toggle");
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
    "click #datemethod1-t2-2": (e) => {

    },
    "click #datemethod2-t2-2": (e) => {

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
    'click #datemethod1-t2-2, click #datemethod2-t2-2, change #beginmonthlydate-t2-2, change #currentyear-t2-2': function(event) {
        let toDate = new Date();
        toDate = moment(toDate).format("YYYY-MM-DD");

        if ($("#datemethod1-t2-2").prop('checked') == true) {
            if ($("#beginmonthlydate-t2-2").val() != "" && $("#currentyear-t2-2").val() != "" && $("#beginmonthlydate-t2-2").val() != null && $("#currentyear-t2-2").val() != null) {
                var endMonth = Math.ceil(parseInt(months[$("#beginmonthlydate-t2-2").val()]) / 3) * 3;
                toDate = new Date($("#currentyear-t2-2").val(), (parseInt(endMonth)), 0);
                toDate = moment(toDate).format("YYYY-MM-DD");
                $("#endDate-t2-2").val(toDate);
            }
        } else {
            if ($("#beginmonthlydate-t2-2").val() != "" && $("#currentyear-t2-2").val() != "" && $("#beginmonthlydate-t2-2").val() != null && $("#currentyear-t2-2").val() != null) {
                var endMonth = parseInt(months[$("#beginmonthlydate-t2-2").val()]);
                toDate = new Date($("#currentyear-t2-2").val(), (parseInt(endMonth)), 0);
                toDate = moment(toDate).format("YYYY-MM-DD");
                $("#endDate-t2-2").val(toDate);
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

        let gstPanID = $(event.target).attr('id').split("-")[1];
        Template.instance().selTaxList(gstPanID);

        var gst5cost = parseFloat($("#gstG3cost").val()) + parseFloat($("#gstG4cost").val());
        $("#gstG5cost").val(gst5cost);
        $("#prt_gstG5cost").html("$" + gst5cost);
        var gst6cost = parseFloat($("#gstG1cost").val()) + parseFloat($("#gstG2cost").val()) + gst5cost;
        $("#gstG6cost").val(gst6cost);
        $("#prt_gstG6cost").html("$" + gst6cost);
        var gst8cost = parseFloat($("#gstG7cost").val()) + gst6cost;
        $("#gstG8cost").val(gst8cost);
        $("#prt_gstG8cost").html("$" + gst8cost);
        var gst9cost = gst8cost / 11;
        $("#gstG9cost").val(gst9cost.toFixed(2));
        $("#prt_gstG9cost").html("$" + gst9cost.toFixed(2));
        $("#debits1cost").val(gst9cost.toFixed(2));
        $("#prt_gstG21cost").html("$" + gst9cost.toFixed(2));
        $("#prt_gstG23cost").html("$" + gst9cost.toFixed(2));
        $("#prt_debits1cost").html("$" + gst9cost.toFixed(2));
        let debits2A = gst9cost + parseFloat($("#debits2cost").val()) + parseFloat($("#debits3cost").val());
        $("#debits4cost").val(debits2A.toFixed(2));
        $("#prt_debits4cost").html("$" + debits2A.toFixed(2));
        var gst12cost = parseFloat($("#gstG10cost").val()) + parseFloat($("#gstG11cost").val());
        $("#gstG12cost").val(gst12cost);
        $("#prt_gstG12cost").html("$" + gst12cost);
        var gst16cost = parseFloat($("#gstG13cost").val()) + parseFloat($("#gstG14cost").val()) + parseFloat($("#gstG15cost").val());
        $("#gstG16cost").val(gst16cost);
        $("#prt_gstG16cost").html("$" + gst16cost);
        var gst17cost = gst12cost + gst16cost;
        $("#gstG17cost").val(gst17cost);
        $("#prt_gstG17cost").html("$" + gst17cost);
        var gst19cost = parseFloat($("#gstG18cost").val()) + gst17cost;
        $("#gstG19cost").val(gst19cost);
        $("#prt_gstG19cost").html("$" + gst19cost);
        var gst20cost = gst19cost / 11;
        $("#gstG20cost").val(gst20cost.toFixed(2));
        $("#prt_gstG20cost").html("$" + gst20cost.toFixed(2));
        $("#credits1cost").val(gst20cost.toFixed(2));
        $("#prt_credits1cost").html("$" + gst20cost.toFixed(2));
        let credits2B = gst20cost + parseFloat($("#credits2cost").val()) + parseFloat($("#credits3cost").val()) + parseFloat($("#credits4cost").val());
        $("#credits5cost").val(credits2B.toFixed(2));
        $("#prt_credits5cost").html("$" + credits2B.toFixed(2));
        let debits3 = debits2A - credits2B;
        $("#debits5cost").val(debits3.toFixed(2));
        $("#prt_debits5cost").html("$" + debits3.toFixed(2));
        let credits8B = parseFloat($("#credits5cost").val()) + parseFloat($("#credits6cost").val()) + parseFloat($("#credits7cost").val()) + parseFloat($("#credits8cost").val());
        $("#credits9cost").val(credits8B.toFixed(2));
        $("#prt_credits9cost").html("$" + credits8B.toFixed(2));
        let debits8A = parseFloat($("#debits1cost").val()) + parseFloat($("#debits6cost").val()) + parseFloat($("#debits7cost").val()) + parseFloat($("#debits9cost").val());
        $("#debits10cost").val(debits8A.toFixed(2));
        $("#prt_debits10cost").html("$" + debits8A.toFixed(2));
        let debits9 = debits8A - parseFloat($("#credits9cost").val());
        $("#debits11cost").val(debits9.toFixed(2));
        $("#prt_debits11cost").html("$" + debits9.toFixed(2));

        $("#gst" + gstPanID + "option").modal("toggle");
    },
    'click .btnselAccountant': function(event) {
        const templateObject = Template.instance();

        let accountsPanID = $(event.target).attr('id').split("-")[1];
        if (accountsPanID == "T1") {
            templateObject.selAccountant_2(accountsPanID);
        } else if (accountsPanID == "7D") {
            templateObject.sel3Accountant(accountsPanID);
        } else {
            templateObject.selAccountant(accountsPanID);
        }

        $("#accounts" + accountsPanID + "option").modal("toggle");
    },
    'keyup #accountsF1cost, keyup #accountsF2cost, keyup #accountsF3cost': function(event) {
        let debits6A = parseFloat($("#accountsF1cost").val()) + parseFloat($("#accountsF2cost").val()) + parseFloat($("#accountsF3cost").val());
        $("#debits8cost").val(debits6A.toFixed(2));
        $("#prt_debits8cost").html("$" + debits6A.toFixed(2));
    },
    'keyup #debits9cost': function(event) {
        let debits8A = parseFloat($("#debits1cost").val()) + parseFloat($("#debits6cost").val()) + parseFloat($("#debits7cost").val()) + parseFloat($("#debits9cost").val());
        $("#debits10cost").val(debits8A.toFixed(2));
        $("#prt_debits10cost").html("$" + debits8A.toFixed(2));
        let debits9 = debits8A - parseFloat($("#credits9cost").val());
        $("#debits11cost").val(debits9.toFixed(2));
        $("#prt_debits11cost").html("$" + debits9.toFixed(2));
    },
    'keyup #credits6cost, keyup #credits7cost': function(event) {
        let credits8B = parseFloat($("#credits5cost").val()) + parseFloat($("#credits6cost").val()) + parseFloat($("#credits7cost").val()) + parseFloat($("#credits8cost").val());
        $("#credits9cost").val(credits8B.toFixed(2));
        $("#prt_credits9cost").html("$" + credits8B.toFixed(2));
        let debits8A = parseFloat($("#debits1cost").val()) + parseFloat($("#debits6cost").val()) + parseFloat($("#debits7cost").val()) + parseFloat($("#debits9cost").val());
        $("#debits10cost").val(debits8A.toFixed(2));
        $("#prt_debits10cost").html("$" + debits8A.toFixed(2));
        let debits9 = parseFloat($("#debits10cost").val()) - parseFloat($("#credits9cost").val());
        $("#debits11cost").val(debits9.toFixed(2));
        $("#prt_debits11cost").html("$" + debits9.toFixed(2));
    },
    'dblclick .transactionView': function(event) {
        const templateObject = Template.instance();
        let getID = $(event.target).attr('id');

        if (parseFloat($("#" + getID).val()) > 0) {
            if (!templateObject.getId.get()) {
                swal({
                    title: 'BAS Return Details',
                    text: "You must save it to go to the BAS Return Details page.\r\nDo you want to save the data?",
                    type: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Yes'
                }).then((result) => {
                    if (result.value) {
                        $('.fullScreenSpin').css('display', 'inline-block');
                        let taxRateList = templateObject.taxRateList.get();
                        let accountsList = templateObject.accountsList.get();

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
                        let gst1cost = $('#gstG1cost').val();
                        let gst2cost = $('#gstG2cost').val();
                        let gst3cost = $('#gstG3cost').val();
                        let gst4cost = $('#gstG4cost').val();
                        let gst5cost = $('#gstG5cost').val();
                        let gst6cost = $('#gstG6cost').val();
                        let gst7cost = $('#gstG7cost').val();
                        let gst8cost = $('#gstG8cost').val();
                        let gst9cost = $('#gstG9cost').val();
                        let gst10cost = $('#gstG10cost').val();
                        let gst11cost = $('#gstG11cost').val();
                        let gst12cost = $('#gstG12cost').val();
                        let gst13cost = $('#gstG13cost').val();
                        let gst14cost = $('#gstG14cost').val();
                        let gst15cost = $('#gstG15cost').val();
                        let gst16cost = $('#gstG16cost').val();
                        let gst17cost = $('#gstG17cost').val();
                        let gst18cost = $('#gstG18cost').val();
                        let gst19cost = $('#gstG19cost').val();
                        let gst20cost = $('#gstG20cost').val();
                        let gst1taxcodes = "";
                        let gst2taxcodes = "";
                        let gst3taxcodes = "";
                        let gst4taxcodes = "";
                        let gst7taxcodes = "";
                        let gst10taxcodes = "";
                        let gst11taxcodes = "";
                        let gst13taxcodes = "";
                        let gst14taxcodes = "";
                        let gst15taxcodes = "";
                        let gst18taxcodes = "";
                        let t3taxcodes1 = "";
                        let t3taxcodes2 = "";
                        let t3taxcodes3 = "";
                        let t3taxcodes4 = "";
                        let t3taxcodes5 = "";
                        for (var i = 0; i < taxRateList.length; i++) {
                            if ($("#t-G1-" + taxRateList[i].Id).prop('checked') == true) {
                                gst1taxcodes = (gst1taxcodes == "") ? taxRateList[i].CodeName : gst1taxcodes + "," + taxRateList[i].CodeName;
                            }
                            if ($("#t-G2-" + taxRateList[i].Id).prop('checked') == true) {
                                gst2taxcodes = (gst2taxcodes == "") ? taxRateList[i].CodeName : gst2taxcodes + "," + taxRateList[i].CodeName;
                            }
                            if ($("#t-G3-" + taxRateList[i].Id).prop('checked') == true) {
                                gst3taxcodes = (gst3taxcodes == "") ? taxRateList[i].CodeName : gst3taxcodes + "," + taxRateList[i].CodeName;
                            }
                            if ($("#t-G4-" + taxRateList[i].Id).prop('checked') == true) {
                                gst4taxcodes = (gst4taxcodes == "") ? taxRateList[i].CodeName : gst4taxcodes + "," + taxRateList[i].CodeName;
                            }
                            if ($("#t-G7-" + taxRateList[i].Id).prop('checked') == true) {
                                gst7taxcodes = (gst7taxcodes == "") ? taxRateList[i].CodeName : gst7taxcodes + "," + taxRateList[i].CodeName;
                            }
                            if ($("#t-G10-" + taxRateList[i].Id).prop('checked') == true) {
                                gst10taxcodes = (gst10taxcodes == "") ? taxRateList[i].CodeName : gst10taxcodes + "," + taxRateList[i].CodeName;
                            }
                            if ($("#t-G11-" + taxRateList[i].Id).prop('checked') == true) {
                                gst11taxcodes = (gst11taxcodes == "") ? taxRateList[i].CodeName : gst11taxcodes + "," + taxRateList[i].CodeName;
                            }
                            if ($("#t-G13-" + taxRateList[i].Id).prop('checked') == true) {
                                gst13taxcodes = (gst13taxcodes == "") ? taxRateList[i].CodeName : gst13taxcodes + "," + taxRateList[i].CodeName;
                            }
                            if ($("#t-G14-" + taxRateList[i].Id).prop('checked') == true) {
                                gst14taxcodes = (gst14taxcodes == "") ? taxRateList[i].CodeName : gst14taxcodes + "," + taxRateList[i].CodeName;
                            }
                            if ($("#t-G15-" + taxRateList[i].Id).prop('checked') == true) {
                                gst15taxcodes = (gst15taxcodes == "") ? taxRateList[i].CodeName : gst15taxcodes + "," + taxRateList[i].CodeName;
                            }
                            if ($("#t-G18-" + taxRateList[i].Id).prop('checked') == true) {
                                gst18taxcodes = (gst18taxcodes == "") ? taxRateList[i].CodeName : gst18taxcodes + "," + taxRateList[i].CodeName;
                            }
                            if ($("#t-1C-" + taxRateList[i].Id).prop('checked') == true) {
                                t3taxcodes1 = (t3taxcodes1 == "") ? taxRateList[i].CodeName : t3taxcodes1 + "," + taxRateList[i].CodeName;
                            }
                            if ($("#t-1E-" + taxRateList[i].Id).prop('checked') == true) {
                                t3taxcodes2 = (t3taxcodes2 == "") ? taxRateList[i].CodeName : t3taxcodes2 + "," + taxRateList[i].CodeName;
                            }
                            if ($("#t-1D-" + taxRateList[i].Id).prop('checked') == true) {
                                t3taxcodes3 = (t3taxcodes3 == "") ? taxRateList[i].CodeName : t3taxcodes3 + "," + taxRateList[i].CodeName;
                            }
                            if ($("#t-1F-" + taxRateList[i].Id).prop('checked') == true) {
                                t3taxcodes4 = (t3taxcodes4 == "") ? taxRateList[i].CodeName : t3taxcodes4 + "," + taxRateList[i].CodeName;
                            }
                            if ($("#t-1G-" + taxRateList[i].Id).prop('checked') == true) {
                                t3taxcodes5 = (t3taxcodes5 == "") ? taxRateList[i].CodeName : t3taxcodes5 + "," + taxRateList[i].CodeName;
                            }
                        }
                        let hasTab2 = $("#basreturnCategory2").prop('checked');
                        let tab2_type = "Quarterly";
                        if ($("#datemethod1-t2").prop('checked') == true) {
                            tab2_type = "Quarterly";
                        } else {
                            tab2_type = "Monthly";
                        }
                        let tab2_month = $("#beginmonthlydate-t2").val();
                        let tab2_year = $("#currentyear-t2").val() || 0;

                        let hasTab3 = $("#basreturnCategory3").prop('checked');
                        let tab3_type = "Quarterly";
                        if ($("#datemethod1-t2-2").prop('checked') == true) {
                            tab3_type = "Quarterly";
                        } else {
                            tab3_type = "Monthly";
                        }
                        let tab3_month = $("#beginmonthlydate-t2-2").val();
                        let tab3_year = $("#currentyear-t2-2").val() || 0;
                        let accounts1cost = $('#accountsW1cost').val();
                        let accounts2cost = $('#accountsW2cost').val();
                        let accounts3cost = $('#accountsW3_cost').val();
                        let accounts4cost = $('#accountsW4cost').val();
                        let accounts5cost = $('#accountsT1cost').val();
                        let accounts6cost = $('#accountsT2cost').val();
                        let accounts7cost = $('#accountsT3cost').val();
                        let reasonT4 = $('#reasonT4').val();
                        let accounts9cost = $('#accountsF1cost').val();
                        let accounts10cost = $('#accountsF2cost').val();
                        let accounts11cost = $('#accountsF3cost').val();
                        let reasonF4 = $('#reasonF4').val();
                        let accounts1 = "";
                        let accounts2 = "";
                        let accounts3 = "";
                        let accounts4 = "";
                        let accounts5 = "";
                        let t3accounts1 = "";
                        for (var i = 0; i < accountsList.length; i++) {
                            if ($("#f-W1-" + accountsList[i].id).prop('checked') == true) {
                                accounts1 = (accounts1 == "") ? accountsList[i].accountname : accounts1 + "," + accountsList[i].accountname;
                            }
                            if ($("#f-W2-" + accountsList[i].id).prop('checked') == true) {
                                accounts2 = (accounts2 == "") ? accountsList[i].accountname : accounts2 + "," + accountsList[i].accountname;
                            }
                            if ($("#f-W3_-" + accountsList[i].id).prop('checked') == true) {
                                accounts3 = (accounts3 == "") ? accountsList[i].accountname : accounts3 + "," + accountsList[i].accountname;
                            }
                            if ($("#f-W4-" + accountsList[i].id).prop('checked') == true) {
                                accounts4 = (accounts4 == "") ? accountsList[i].accountname : accounts4 + "," + accountsList[i].accountname;
                            }
                            if ($("#f-T1-" + accountsList[i].id).prop('checked') == true) {
                                accounts5 = (accounts5 == "") ? accountsList[i].accountname : accounts5 + "," + accountsList[i].accountname;
                            }
                            if ($("#f-7D-" + accountsList[i].id).prop('checked') == true) {
                                t3accounts1 = (t3accounts1 == "") ? accountsList[i].accountname : t3accounts1 + "," + accountsList[i].accountname;
                            }
                        }
                        let hasTab4 = $("#basreturnCategory4").prop('checked');
                        let tab4_type = "Quarterly";
                        if ($("#datemethod1-t3").prop('checked') == true) {
                            tab4_type = "Quarterly";
                        } else {
                            tab4_type = "Monthly";
                        }
                        let tab4_month = $("#beginmonthlydate-t3").val();
                        let tab4_year = $("#currentyear-t3").val() || 0;
                        let t3taxcodes1cost = $('#gst1Ccost').val();
                        let t3taxcodes2cost = $('#gst1Ecost').val();
                        let t3taxcodes3cost = $('#gst1Dcost').val();
                        let t3taxcodes4cost = $('#gst1Fcost').val();
                        let t3taxcodes5cost = $('#gst1Gcost').val();
                        let t3accounts1cost = $('#accounts7Dcost').val();
                        let debits1cost = $('#debits1cost').val();
                        let debits2cost = $('#debits2cost').val();
                        let debits3cost = $('#debits3cost').val();
                        let debits4cost = $('#debits4cost').val();
                        let debits5cost = $('#debits5cost').val();
                        let debits6cost = $('#debits6cost').val();
                        let debits7cost = $('#debits7cost').val();
                        let debits8cost = $('#debits8cost').val();
                        let debits9cost = $('#debits9cost').val();
                        let debits10cost = $('#debits10cost').val();
                        let debits11cost = $('#debits11cost').val();
                        let credits1cost = $('#credits1cost').val();
                        let credits2cost = $('#credits2cost').val();
                        let credits3cost = $('#credits3cost').val();
                        let credits4cost = $('#credits4cost').val();
                        let credits5cost = $('#credits5cost').val();
                        let credits6cost = $('#credits6cost').val();
                        let credits7cost = $('#credits7cost').val();
                        let credits8cost = $('#credits8cost').val();
                        let credits9cost = $('#credits9cost').val();

                        if (description === '') {
                            swal('BAS Return Description cannot be blank!', '', 'warning');
                            $('.fullScreenSpin').css('display', 'none');
                        } else {
                            setTimeout(function() {
                                let jsonObj = {
                                    type: "TBASReturn",
                                    fields: {
                                        AccMethod: accMethod,
                                        Active: true,
                                        AllClass: allClass,
                                        ClassID: classID,
                                        BasSheetDesc: description,
                                        Done: false,
                                        HasTab1: hasTab1,
                                        Tab1_Type: tab1_type,
                                        Tab1_Month: tab1_month,
                                        Tab1_Year: tab1_year,
                                        G1: parseFloat(gst1cost),
                                        G1Selected: gst1taxcodes,
                                        G2: parseFloat(gst2cost),
                                        G2Selected: gst2taxcodes,
                                        G3: parseFloat(gst3cost),
                                        G3Selected: gst3taxcodes,
                                        G4: parseFloat(gst4cost),
                                        G4Selected: gst4taxcodes,
                                        G5: parseFloat(gst5cost),
                                        G6: parseFloat(gst6cost),
                                        G7: parseFloat(gst7cost),
                                        G7Selected: gst7taxcodes,
                                        G8: parseFloat(gst8cost),
                                        G9: parseFloat(gst9cost),
                                        G10: parseFloat(gst10cost),
                                        G10Selected: gst10taxcodes,
                                        G11: parseFloat(gst11cost),
                                        G11Selected: gst11taxcodes,
                                        G12: parseFloat(gst12cost),
                                        G13: parseFloat(gst13cost),
                                        G13Selected: gst13taxcodes,
                                        G14: parseFloat(gst14cost),
                                        G14Selected: gst14taxcodes,
                                        G15: parseFloat(gst15cost),
                                        G15Selected: gst15taxcodes,
                                        G16: parseFloat(gst16cost),
                                        G17: parseFloat(gst17cost),
                                        G18: parseFloat(gst18cost),
                                        G18Selected: gst18taxcodes,
                                        G19: parseFloat(gst19cost),
                                        G20: parseFloat(gst20cost),
                                        HasTab2: hasTab2,
                                        Tab2_Type: tab2_type,
                                        Tab2_Month: tab2_month,
                                        Tab2_Year: tab2_year,
                                        W1: parseFloat(accounts1cost),
                                        W1Selected: accounts1,
                                        W2: parseFloat(accounts2cost),
                                        W2Selected: accounts2,
                                        W3: parseFloat(accounts3cost),
                                        W3Selected: accounts3,
                                        W4: parseFloat(accounts4cost),
                                        W4Selected: accounts4,
                                        HasTab3: hasTab3,
                                        Tab3_Type: tab3_type,
                                        Tab3_Month: tab3_month,
                                        Tab3_Year: tab3_year,
                                        T1: parseFloat(accounts5cost),
                                        T1Selected: accounts5,
                                        T2: parseFloat(accounts6cost),
                                        T3: parseFloat(accounts7cost),
                                        T4: reasonT4,
                                        F1: parseFloat(accounts9cost),
                                        F2: parseFloat(accounts10cost),
                                        F3: parseFloat(accounts11cost),
                                        F4: reasonF4,
                                        HasTab4: hasTab4,
                                        Tab4_Type: tab4_type,
                                        Tab4_Month: tab4_month,
                                        Tab4_Year: tab4_year,
                                        _1C: parseFloat(t3taxcodes1cost),
                                        _1CSelected: t3taxcodes1,
                                        _1E: parseFloat(t3taxcodes2cost),
                                        _1ESelected: t3taxcodes2,
                                        _1D: parseFloat(t3taxcodes3cost),
                                        _1DSelected: t3taxcodes3,
                                        _1F: parseFloat(t3taxcodes4cost),
                                        _1FSelected: t3taxcodes4,
                                        _1G: parseFloat(t3taxcodes5cost),
                                        _1GSelected: t3taxcodes5,
                                        _7D: parseFloat(t3accounts1cost),
                                        _7DSelected: t3accounts1,
                                        _1A: parseFloat(debits1cost),
                                        _1C: parseFloat(debits2cost),
                                        _2A: parseFloat(debits4cost),
                                        _3: parseFloat(debits5cost),
                                        _4: parseFloat(debits6cost),
                                        _5A: parseFloat(debits7cost),
                                        _6A: parseFloat(debits8cost),
                                        _7: parseFloat(debits9cost),
                                        _8A: parseFloat(debits10cost),
                                        _9: parseFloat(debits11cost),
                                        _1B: parseFloat(credits1cost),
                                        _2B: parseFloat(credits5cost),
                                        _5B: parseFloat(credits6cost),
                                        _6B: parseFloat(credits7cost),
                                        _7D: parseFloat(credits8cost),
                                        _8B: parseFloat(credits9cost),
                                    }
                                }

                                reportService.saveBASReturn(jsonObj).then(function(res) {
                                    templateObject.getId.set(res.fields.ID);
                                    reportService.getAllBASReturn().then(function(data) {
                                        addVS1Data("TBASReturn", JSON.stringify(data)).then(function(datareturn) {
                                            if (getID == "gstG1cost") {
                                                FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=G1");
                                            } else if (getID == "gstG2cost") {
                                                FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=G2");
                                            } else if (getID == "gstG3cost") {
                                                FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=G3");
                                            } else if (getID == "gstG4cost") {
                                                FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=G4");
                                            } else if (getID == "gstG7cost") {
                                                FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=G7");
                                            } else if (getID == "gstG10cost") {
                                                FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=G10");
                                            } else if (getID == "gstG11cost") {
                                                FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=G11");
                                            } else if (getID == "gstG13cost") {
                                                FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=G13");
                                            } else if (getID == "gstG14cost") {
                                                FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=G14");
                                            } else if (getID == "gstG15cost") {
                                                FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=G15");
                                            } else if (getID == "gstG18cost") {
                                                FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=G18");
                                            } else if (getID == "accountsW1cost") {
                                                FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=W1");
                                            } else if (getID == "accountsW2cost") {
                                                FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=W2");
                                            } else if (getID == "accountsW3_cost") {
                                                FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=W3");
                                            } else if (getID == "accountsW4cost") {
                                                FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=W4");
                                            } else if (getID == "accountsT1cost") {
                                                FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=T1");
                                            } else if (getID == "gst1Ccost") {
                                                FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=1C");
                                            } else if (getID == "gst1Ecost") {
                                                FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=1E");
                                            } else if (getID == "gst1Dcost") {
                                                FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=1D");
                                            } else if (getID == "gst1Fcost") {
                                                FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=1F");
                                            } else if (getID == "gst1Gcost") {
                                                FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=1G");
                                            } else if (getID == "accounts7Dcost") {
                                                FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=7D");
                                            }
                                            $('.fullScreenSpin').css('display', 'none');
                                        }).catch(function(err) {
                                            $('.fullScreenSpin').css('display', 'none');
                                        });
                                    }).catch(function(err) {
                                        $('.fullScreenSpin').css('display', 'none');
                                    });
                                }).catch(function(err) {
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
                if (getID == "gstG1cost") {
                    FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=G1");
                } else if (getID == "gstG2cost") {
                    FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=G2");
                } else if (getID == "gstG3cost") {
                    FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=G3");
                } else if (getID == "gstG4cost") {
                    FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=G4");
                } else if (getID == "gstG7cost") {
                    FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=G7");
                } else if (getID == "gstG10cost") {
                    FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=G10");
                } else if (getID == "gstG11cost") {
                    FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=G11");
                } else if (getID == "gstG13cost") {
                    FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=G13");
                } else if (getID == "gstG14cost") {
                    FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=G14");
                } else if (getID == "gstG15cost") {
                    FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=G15");
                } else if (getID == "gstG18cost") {
                    FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=G18");
                } else if (getID == "accountsW1cost") {
                    FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=W1");
                } else if (getID == "accountsW2cost") {
                    FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=W2");
                } else if (getID == "accountsW3_cost") {
                    FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=W3");
                } else if (getID == "accountsW4cost") {
                    FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=W4");
                } else if (getID == "accountsT1cost") {
                    FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=T1");
                } else if (getID == "gst1Ccost") {
                    FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=1C");
                } else if (getID == "gst1Ecost") {
                    FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=1E");
                } else if (getID == "gst1Dcost") {
                    FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=1D");
                } else if (getID == "gst1Fcost") {
                    FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=1F");
                } else if (getID == "gst1Gcost") {
                    FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=1G");
                } else if (getID == "accounts7Dcost") {
                    FlowRouter.go("/basreturntransactionlist?basreturnid=" + templateObject.getId.get() + "&transactionitem=7D");
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
            fromDate = new Date($("#currentyear").val() + "-" + months[$("#beginmonthlydate").val()] + "-01");
            fromDate = moment(fromDate).format("YYYY-MM-DD");
            toDate = $("#endDate").val();
            templateObject.getTaxSummaryReports(fromDate, toDate, false, "t1");
        }
        if ($("#beginmonthlydate-t2").val() != "" && $("#currentyear-t2").val() != "" && $("#beginmonthlydate-t2").val() != null && $("#currentyear-t2").val() != null) {
            fromDate = new Date($("#currentyear-t2").val() + "-" + months[$("#beginmonthlydate-t2").val()] + "-01");
            fromDate = moment(fromDate).format("YYYY-MM-DD");
            toDate = $("#endDate-t2").val();
            templateObject.getAccountsSummaryReports(fromDate, toDate, 't2');
        }
        if ($("#beginmonthlydate-t2-2").val() != "" && $("#currentyear-t2-2").val() != "" && $("#beginmonthlydate-t2-2").val() != null && $("#currentyear-t2-2").val() != null) {
            fromDate = new Date($("#currentyear-t2-2").val() + "-" + months[$("#beginmonthlydate-t2-2").val()] + "-01");
            fromDate = moment(fromDate).format("YYYY-MM-DD");
            toDate = $("#endDate-t2-2").val();
            templateObject.getAccountsSummaryReports(fromDate, toDate, 't2-2');
        }
        if ($("#beginmonthlydate-t3").val() != "" && $("#currentyear-t3").val() != "" && $("#beginmonthlydate-t3").val() != null && $("#currentyear-t3").val() != null) {
            fromDate = new Date($("#currentyear-t3").val() + "-" + months[$("#beginmonthlydate-t3").val()] + "-01");
            fromDate = moment(fromDate).format("YYYY-MM-DD");
            toDate = $("#endDate-t3").val();
            templateObject.getTaxSummaryReports(fromDate, toDate, false, "t3");
            templateObject.getAccountsSummaryReports(fromDate, toDate, 't3');
        }
    },
    'click .printConfirm': function(event) {
        playPrintAudio();
        setTimeout(function() {
            $(".printBASReturn").show();
            $("a").attr("href", "/");
            document.title = "BAS Return";
            $(".printBASReturn").print({
                title: document.title + " | " + loggedCompany,
                noPrintSelector: ".addSummaryEditor",
                mediaPrint: false,
            });

            setTimeout(function() {
                $("a").attr("href", "#");
                $(".printBASReturn").hide();
            }, 100);
        }, delayTimeAfterSound);
    },
    'click .btnDelete': function(event) {
        playDeleteAudio();
        let templateObject = Template.instance();
        setTimeout(function() {
            if (templateObject.getId.get()) {
                swal({
                    title: 'Delete BAS Return',
                    text: "Are you sure you want to Delete this BAS Return?",
                    type: 'info',
                    showCancelButton: true,
                    confirmButtonText: 'Yes'
                }).then((result) => {
                    if (result.value) {
                        $('.fullScreenSpin').css('display', 'inline-block');
                        let jsonObj = {
                            type: "TBASReturn",
                            fields: {
                                ID: templateObject.getId.get(),
                                Active: false,
                            }
                        }

                        reportService.saveBASReturn(jsonObj).then(function(res) {
                            reportService.getAllBASReturn().then(function(data) {
                                addVS1Data("TBASReturn", JSON.stringify(data)).then(function(datareturn) {
                                    window.open("basreturnlist", "_self");
                                }).catch(function(err) {
                                    window.open("basreturnlist", "_self");
                                });
                            }).catch(function(err) {
                                window.open("basreturnlist", "_self");
                            });
                        }).catch(function(err) {
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
            let accountsList = templateObject.accountsList.get();

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
            // let startDate = "0000-00-00";
            // let endDate = "0000-00-00";
            if ($("#datemethod1").prop('checked') == true) {
                tab1_type = "Quarterly";
            } else {
                tab1_type = "Monthly";
            }
            let tab1_month = $("#beginmonthlydate").val();
            let tab1_year = $("#currentyear").val() || 0;
            let gst1cost = $('#gstG1cost').val();
            let gst2cost = $('#gstG2cost').val();
            let gst3cost = $('#gstG3cost').val();
            let gst4cost = $('#gstG4cost').val();
            let gst5cost = $('#gstG5cost').val();
            let gst6cost = $('#gstG6cost').val();
            let gst7cost = $('#gstG7cost').val();
            let gst8cost = $('#gstG8cost').val();
            let gst9cost = $('#gstG9cost').val();
            let gst10cost = $('#gstG10cost').val();
            let gst11cost = $('#gstG11cost').val();
            let gst12cost = $('#gstG12cost').val();
            let gst13cost = $('#gstG13cost').val();
            let gst14cost = $('#gstG14cost').val();
            let gst15cost = $('#gstG15cost').val();
            let gst16cost = $('#gstG16cost').val();
            let gst17cost = $('#gstG17cost').val();
            let gst18cost = $('#gstG18cost').val();
            let gst19cost = $('#gstG19cost').val();
            let gst20cost = $('#gstG20cost').val();
            let gst1taxcodes = "";
            let gst2taxcodes = "";
            let gst3taxcodes = "";
            let gst4taxcodes = "";
            let gst7taxcodes = "";
            let gst10taxcodes = "";
            let gst11taxcodes = "";
            let gst13taxcodes = "";
            let gst14taxcodes = "";
            let gst15taxcodes = "";
            let gst18taxcodes = "";
            let t3taxcodes1 = "";
            let t3taxcodes2 = "";
            let t3taxcodes3 = "";
            let t3taxcodes4 = "";
            let t3taxcodes5 = "";
            for (var i = 0; i < taxRateList.length; i++) {
                if ($("#t-G1-" + taxRateList[i].Id).prop('checked') == true) {
                    gst1taxcodes = (gst1taxcodes == "") ? taxRateList[i].CodeName : gst1taxcodes + "," + taxRateList[i].CodeName;
                }
                if ($("#t-G2-" + taxRateList[i].Id).prop('checked') == true) {
                    gst2taxcodes = (gst2taxcodes == "") ? taxRateList[i].CodeName : gst2taxcodes + "," + taxRateList[i].CodeName;
                }
                if ($("#t-G3-" + taxRateList[i].Id).prop('checked') == true) {
                    gst3taxcodes = (gst3taxcodes == "") ? taxRateList[i].CodeName : gst3taxcodes + "," + taxRateList[i].CodeName;
                }
                if ($("#t-G4-" + taxRateList[i].Id).prop('checked') == true) {
                    gst4taxcodes = (gst4taxcodes == "") ? taxRateList[i].CodeName : gst4taxcodes + "," + taxRateList[i].CodeName;
                }
                if ($("#t-G7-" + taxRateList[i].Id).prop('checked') == true) {
                    gst7taxcodes = (gst7taxcodes == "") ? taxRateList[i].CodeName : gst7taxcodes + "," + taxRateList[i].CodeName;
                }
                if ($("#t-G10-" + taxRateList[i].Id).prop('checked') == true) {
                    gst10taxcodes = (gst10taxcodes == "") ? taxRateList[i].CodeName : gst10taxcodes + "," + taxRateList[i].CodeName;
                }
                if ($("#t-G11-" + taxRateList[i].Id).prop('checked') == true) {
                    gst11taxcodes = (gst11taxcodes == "") ? taxRateList[i].CodeName : gst11taxcodes + "," + taxRateList[i].CodeName;
                }
                if ($("#t-G13-" + taxRateList[i].Id).prop('checked') == true) {
                    gst13taxcodes = (gst13taxcodes == "") ? taxRateList[i].CodeName : gst13taxcodes + "," + taxRateList[i].CodeName;
                }
                if ($("#t-G14-" + taxRateList[i].Id).prop('checked') == true) {
                    gst14taxcodes = (gst14taxcodes == "") ? taxRateList[i].CodeName : gst14taxcodes + "," + taxRateList[i].CodeName;
                }
                if ($("#t-G15-" + taxRateList[i].Id).prop('checked') == true) {
                    gst15taxcodes = (gst15taxcodes == "") ? taxRateList[i].CodeName : gst15taxcodes + "," + taxRateList[i].CodeName;
                }
                if ($("#t-G18-" + taxRateList[i].Id).prop('checked') == true) {
                    gst18taxcodes = (gst18taxcodes == "") ? taxRateList[i].CodeName : gst18taxcodes + "," + taxRateList[i].CodeName;
                }
                if ($("#t-1C-" + taxRateList[i].Id).prop('checked') == true) {
                    t3taxcodes1 = (t3taxcodes1 == "") ? taxRateList[i].CodeName : t3taxcodes1 + "," + taxRateList[i].CodeName;
                }
                if ($("#t-1E-" + taxRateList[i].Id).prop('checked') == true) {
                    t3taxcodes2 = (t3taxcodes2 == "") ? taxRateList[i].CodeName : t3taxcodes2 + "," + taxRateList[i].CodeName;
                }
                if ($("#t-1D-" + taxRateList[i].Id).prop('checked') == true) {
                    t3taxcodes3 = (t3taxcodes3 == "") ? taxRateList[i].CodeName : t3taxcodes3 + "," + taxRateList[i].CodeName;
                }
                if ($("#t-1F-" + taxRateList[i].Id).prop('checked') == true) {
                    t3taxcodes4 = (t3taxcodes4 == "") ? taxRateList[i].CodeName : t3taxcodes4 + "," + taxRateList[i].CodeName;
                }
                if ($("#t-1G-" + taxRateList[i].Id).prop('checked') == true) {
                    t3taxcodes5 = (t3taxcodes5 == "") ? taxRateList[i].CodeName : t3taxcodes5 + "," + taxRateList[i].CodeName;
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

            let hasTab3 = $("#basreturnCategory3").prop('checked');
            let tab3_type = "Quarterly";
            // let startDate = "0000-00-00";
            // let endDate = "0000-00-00";
            if ($("#datemethod1-t2-2").prop('checked') == true) {
                tab3_type = "Quarterly";
            } else {
                tab3_type = "Monthly";
            }
            let tab3_month = $("#beginmonthlydate-t2-2").val();
            let tab3_year = $("#currentyear-t2-2").val() || 0;
            let accounts1cost = $('#accountsW1cost').val();
            let accounts2cost = $('#accountsW2cost').val();
            let accounts3cost = $('#accountsW3_cost').val();
            let accounts4cost = $('#accountsW4cost').val();
            let accounts5cost = $('#accountsT1cost').val();
            let accounts6cost = $('#accountsT2cost').val();
            let accounts7cost = $('#accountsT3cost').val();
            let reasonT4 = $('#reasonT4').val();
            let accounts9cost = $('#accountsF1cost').val();
            let accounts10cost = $('#accountsF2cost').val();
            let accounts11cost = $('#accountsF3cost').val();
            let reasonF4 = $('#reasonF4').val();
            let accounts1 = "";
            let accounts2 = "";
            let accounts3 = "";
            let accounts4 = "";
            let accounts5 = "";
            let t3accounts1 = "";
            for (var i = 0; i < accountsList.length; i++) {
                if ($("#f-W1-" + accountsList[i].id).prop('checked') == true) {
                    accounts1 = (accounts1 == "") ? accountsList[i].accountname : accounts1 + "," + accountsList[i].accountname;
                }
                if ($("#f-W2-" + accountsList[i].id).prop('checked') == true) {
                    accounts2 = (accounts2 == "") ? accountsList[i].accountname : accounts2 + "," + accountsList[i].accountname;
                }
                if ($("#f-W3_-" + accountsList[i].id).prop('checked') == true) {
                    accounts3 = (accounts3 == "") ? accountsList[i].accountname : accounts3 + "," + accountsList[i].accountname;
                }
                if ($("#f-W4-" + accountsList[i].id).prop('checked') == true) {
                    accounts4 = (accounts4 == "") ? accountsList[i].accountname : accounts4 + "," + accountsList[i].accountname;
                }
                if ($("#f-T1-" + accountsList[i].id).prop('checked') == true) {
                    accounts5 = (accounts5 == "") ? accountsList[i].accountname : accounts5 + "," + accountsList[i].accountname;
                }
                if ($("#f-7D-" + accountsList[i].id).prop('checked') == true) {
                    t3accounts1 = (t3accounts1 == "") ? accountsList[i].accountname : t3accounts1 + "," + accountsList[i].accountname;
                }
            }
            let hasTab4 = $("#basreturnCategory4").prop('checked');
            let tab4_type = "Quarterly";
            // let startDate = "0000-00-00";
            // let endDate = "0000-00-00";
            if ($("#datemethod1-t3").prop('checked') == true) {
                tab4_type = "Quarterly";
            } else {
                tab4_type = "Monthly";
            }
            let tab4_month = $("#beginmonthlydate-t3").val();
            let tab4_year = $("#currentyear-t3").val() || 0;
            let t3taxcodes1cost = $('#gst1Ccost').val();
            let t3taxcodes2cost = $('#gst1Ecost').val();
            let t3taxcodes3cost = $('#gst1Dcost').val();
            let t3taxcodes4cost = $('#gst1Fcost').val();
            let t3taxcodes5cost = $('#gst1Gcost').val();
            let t3accounts1cost = $('#accounts7Dcost').val();
            let debits1cost = $('#debits1cost').val();
            let debits2cost = $('#debits2cost').val();
            let debits3cost = $('#debits3cost').val();
            let debits4cost = $('#debits4cost').val();
            let debits5cost = $('#debits5cost').val();
            let debits6cost = $('#debits6cost').val();
            let debits7cost = $('#debits7cost').val();
            let debits8cost = $('#debits8cost').val();
            let debits9cost = $('#debits9cost').val();
            let debits10cost = $('#debits10cost').val();
            let debits11cost = $('#debits11cost').val();
            let credits1cost = $('#credits1cost').val();
            let credits2cost = $('#credits2cost').val();
            let credits3cost = $('#credits3cost').val();
            let credits4cost = $('#credits4cost').val();
            let credits5cost = $('#credits5cost').val();
            let credits6cost = $('#credits6cost').val();
            let credits7cost = $('#credits7cost').val();
            let credits8cost = $('#credits8cost').val();
            let credits9cost = $('#credits9cost').val();

            if (description === '') {
                // Bert.alert('<strong>WARNING:</strong> BAS Return Description cannot be blank!', 'warning');
                swal('BAS Return Description cannot be blank!', '', 'warning');
                $('.fullScreenSpin').css('display', 'none');
            } else {
                getVS1Data('TBASReturn').then(function(dataObject) {
                    if (dataObject.length > 0) {
                        dataArray = JSON.parse(dataObject[0].data);
                    }
                });

                setTimeout(function() {
                    let jsonObj = {
                        type: "TBASReturn",
                        fields: {
                            AccMethod: accMethod,
                            Active: true,
                            AllClass: allClass,
                            ClassID: classID,
                            BasSheetDesc: description,
                            Done: false,
                            HasTab1: hasTab1,
                            Tab1_Type: tab1_type,
                            Tab1_Month: tab1_month,
                            Tab1_Year: tab1_year,
                            G1: parseFloat(gst1cost),
                            G1Selected: gst1taxcodes,
                            G2: parseFloat(gst2cost),
                            G2Selected: gst2taxcodes,
                            G3: parseFloat(gst3cost),
                            G3Selected: gst3taxcodes,
                            G4: parseFloat(gst4cost),
                            G4Selected: gst4taxcodes,
                            G5: parseFloat(gst5cost),
                            G6: parseFloat(gst6cost),
                            G7: parseFloat(gst7cost),
                            G7Selected: gst7taxcodes,
                            G8: parseFloat(gst8cost),
                            G9: parseFloat(gst9cost),
                            G10: parseFloat(gst10cost),
                            G10Selected: gst10taxcodes,
                            G11: parseFloat(gst11cost),
                            G11Selected: gst11taxcodes,
                            G12: parseFloat(gst12cost),
                            G13: parseFloat(gst13cost),
                            G13Selected: gst13taxcodes,
                            G14: parseFloat(gst14cost),
                            G14Selected: gst14taxcodes,
                            G15: parseFloat(gst15cost),
                            G15Selected: gst15taxcodes,
                            G16: parseFloat(gst16cost),
                            G17: parseFloat(gst17cost),
                            G18: parseFloat(gst18cost),
                            G18Selected: gst18taxcodes,
                            G19: parseFloat(gst19cost),
                            G20: parseFloat(gst20cost),
                            HasTab2: hasTab2,
                            Tab2_Type: tab2_type,
                            Tab2_Month: tab2_month,
                            Tab2_Year: tab2_year,
                            W1: parseFloat(accounts1cost),
                            W1Selected: accounts1,
                            W2: parseFloat(accounts2cost),
                            W2Selected: accounts2,
                            W3: parseFloat(accounts3cost),
                            W3Selected: accounts3,
                            W4: parseFloat(accounts4cost),
                            W4Selected: accounts4,
                            HasTab3: hasTab3,
                            Tab3_Type: tab3_type,
                            Tab3_Month: tab3_month,
                            Tab3_Year: tab3_year,
                            T1: parseFloat(accounts5cost),
                            T1Selected: accounts5,
                            T2: parseFloat(accounts6cost),
                            T3: parseFloat(accounts7cost),
                            T4: reasonT4,
                            F1: parseFloat(accounts9cost),
                            F2: parseFloat(accounts10cost),
                            F3: parseFloat(accounts11cost),
                            F4: reasonF4,
                            HasTab4: hasTab4,
                            Tab4_Type: tab4_type,
                            Tab4_Month: tab4_month,
                            Tab4_Year: tab4_year,
                            _1C: parseFloat(t3taxcodes1cost),
                            _1CSelected: t3taxcodes1,
                            _1E: parseFloat(t3taxcodes2cost),
                            _1ESelected: t3taxcodes2,
                            _1D: parseFloat(t3taxcodes3cost),
                            _1DSelected: t3taxcodes3,
                            _1F: parseFloat(t3taxcodes4cost),
                            _1FSelected: t3taxcodes4,
                            _1G: parseFloat(t3taxcodes5cost),
                            _1GSelected: t3taxcodes5,
                            _7D: parseFloat(t3accounts1cost),
                            _7DSelected: t3accounts1,
                            _1A: parseFloat(debits1cost),
                            _1C: parseFloat(debits2cost),
                            _2A: parseFloat(debits4cost),
                            _3: parseFloat(debits5cost),
                            _4: parseFloat(debits6cost),
                            _5A: parseFloat(debits7cost),
                            _6A: parseFloat(debits8cost),
                            _7: parseFloat(debits9cost),
                            _8A: parseFloat(debits10cost),
                            _9: parseFloat(debits11cost),
                            _1B: parseFloat(credits1cost),
                            _2B: parseFloat(credits5cost),
                            _5B: parseFloat(credits6cost),
                            _6B: parseFloat(credits7cost),
                            _7D: parseFloat(credits8cost),
                            _8B: parseFloat(credits9cost),
                        }
                    }

                    if (templateObject.getId.get()) {
                        jsonObj.fields.ID = parseInt(templateObject.getId.get());
                    }

                    reportService.saveBASReturn(jsonObj).then(function(res) {
                        reportService.getAllBASReturn().then(function(data) {
                            addVS1Data("TBASReturn", JSON.stringify(data)).then(function(datareturn) {
                                window.open("basreturnlist", "_self");
                            }).catch(function(err) {
                                window.open("basreturnlist", "_self");
                            });
                        }).catch(function(err) {
                            window.open("basreturnlist", "_self");
                        });
                    }).catch(function(err) {
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
    'click .btnSaveGridSettings': function(event) {
        playSaveAudio();
        setTimeout(function() {
            let lineItems = [];

            $('.columnSettings').each(function(index) {
                var $tblrow = $(this);
                var colTitle = $tblrow.find(".divcolumn").text() || '';
                var colWidth = $tblrow.find(".custom-range").val() || 0;
                var colthClass = $tblrow.find(".divcolumn").attr("valueupdate") || '';
                var colHidden = false;
                if ($tblrow.find(".custom-control-input").is(':checked')) {
                    colHidden = false;
                } else {
                    colHidden = true;
                }
                let lineItemObj = {
                    index: index,
                    label: colTitle,
                    hidden: colHidden,
                    width: colWidth,
                    thclass: colthClass
                }

                lineItems.push(lineItemObj);
            });

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
                        CloudPreference.update({
                            _id: checkPrefDetails._id
                        }, {
                            $set: {
                                userid: clientID,
                                username: clientUsername,
                                useremail: clientEmail,
                                PrefGroup: 'purchaseform',
                                PrefName: 'tblJournalEntryLine',
                                published: true,
                                customFields: lineItems,
                                updatedAt: new Date()
                            }
                        }, function(err, idTag) {
                            if (err) {
                                $('#myModal2').modal('toggle');

                            } else {
                                $('#myModal2').modal('toggle');


                            }
                        });

                    } else {
                        CloudPreference.insert({
                            userid: clientID,
                            username: clientUsername,
                            useremail: clientEmail,
                            PrefGroup: 'purchaseform',
                            PrefName: 'tblJournalEntryLine',
                            published: true,
                            customFields: lineItems,
                            createdAt: new Date()
                        }, function(err, idTag) {
                            if (err) {
                                $('#myModal2').modal('toggle');

                            } else {
                                $('#myModal2').modal('toggle');


                            }
                        });

                    }
                }
            }
            $('#myModal2').modal('toggle');
        }, delayTimeAfterSound);
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