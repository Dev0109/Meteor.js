import { ReactiveVar } from 'meteor/reactive-var';
import { ReconService } from "./recon-service";
import { UtilityService } from "../utility-service";
import '../lib/global/erp-objects';
import '../lib/global/indexdbstorage.js';
import 'jquery-editable-select';
import { AccountService } from "../accounts/account-service";
import { ProductService } from "../product/product-service";
import { PurchaseBoardService } from "../js/purchase-service";
import { SideBarService } from '../js/sidebar-service';
import { YodleeService } from '../js/yodlee-service';
import { Random } from 'meteor/random';
import { PaymentsService } from "../payments/payments-service";
import { SalesBoardService } from "../js/sales-service";
import { ContactService } from "../contacts/contact-service";
import showBankInfo from "./bankInfo"

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
let yodleeService = new YodleeService();
let reconService = new ReconService();
let contactService = new ContactService();
let accountService = new AccountService();

let selectedLineID = null;
let selectedYodleeID = null;
let selectedAccountFlag = '';
let selectedTaxFlag = '';
let selectedCustomerFlag = '';
let customerList = [];
let supplierList = [];
let taxcodeList = [];
let VS1TransactionList = [];
let matchTransactionList = [];
let viewTransactionList = [];

Template.newbankrecon.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.accountnamerecords = new ReactiveVar();
    templateObject.lastTransactionDate = new ReactiveVar();
    templateObject.page_number = new ReactiveVar();
    templateObject.page_total = new ReactiveVar();
    templateObject.page_count = new ReactiveVar();
    templateObject.page_list = new ReactiveVar([]);
    templateObject.sort = new ReactiveVar();
    templateObject.sort_param = new ReactiveVar();
    templateObject.fa_sortDepositSpent = new ReactiveVar();
    templateObject.fa_sortDepositReceived = new ReactiveVar();
    templateObject.fa_sortWithdrawSpent = new ReactiveVar();
    templateObject.fa_sortWithdrawReceived = new ReactiveVar();
    templateObject.bankTransactionData = new ReactiveVar([]);
    templateObject.matchTransactionData = new ReactiveVar([]);
    templateObject.viewTransactionData = new ReactiveVar([]);
    templateObject.taxraterecords = new ReactiveVar([]);
    templateObject.baselinedata = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.defaultCustomerTerms = new ReactiveVar();
    templateObject.defaultSupplierTerms = new ReactiveVar();
});

Template.newbankrecon.onRendered(function() {
    const templateObject = Template.instance();
    const productService = new ProductService();
    const supplierService = new PurchaseBoardService();

    let page_number = (FlowRouter.current().queryParams.page != undefined && parseInt(FlowRouter.current().queryParams.page) > 0)?FlowRouter.current().queryParams.page:1;
    templateObject.page_number.set(page_number);
    templateObject.sort.set((FlowRouter.current().queryParams.sort != undefined && FlowRouter.current().queryParams.sort != '')?FlowRouter.current().queryParams.sort:'');
    templateObject.sort_param.set((Template.instance().sort.get() != '')?'&sort='+Template.instance().sort.get():'');
    let page_limit = 10;
    let page_total = 0;

    const splashArrayTaxRateList = [];
    let accountnamerecords = [];

    let bankaccountid = Session.get('bankaccountid') || '';
    let bankaccountname = Session.get('bankaccountname') || '';
    let statementDate = localStorage.getItem('statementdate')|| '';

    templateObject.getAccountNames = function() {
        reconService.getAccountNameVS1().then(function(data) {
            if (data.taccountvs1.length > 0) {
                for (let i = 0; i < data.taccountvs1.length; i++) {
                    let accountnamerecordObj = {
                        accountid: data.taccountvs1[i].Id || ' ',
                        accountname: data.taccountvs1[i].AccountName || ' '
                    };
                    if ((data.taccountvs1[i].AccountTypeName == 'BANK') || (data.taccountvs1[i].AccountTypeName == 'CCARD')) {
                        accountnamerecords.push(accountnamerecordObj);
                        templateObject.accountnamerecords.set(accountnamerecords);
                    }
                }
            }
            // setTimeout(function() {
                if (bankaccountid != '') {
                    $('#bankAccountID').val(bankaccountid);
                    $('#bankAccountName').val(bankaccountname);
                    $('.fullScreenSpin').css('display', 'inline-block');
                    templateObject.getOpenBalance(bankaccountname);
                    templateObject.getBankTransactionData(bankaccountid, statementDate, true);
                    templateObject.getMatchTransactionData(bankaccountid, statementDate, true);
                } else {
                    $('.fullScreenSpin').css('display', 'none');
                }
            // }, 100);

        }).catch(function(err) {
            $('.fullScreenSpin').css('display', 'none');
        });
    };

    templateObject.getAllAccounts = function() {
        getVS1Data('TAccountVS1').then(function(dataObject) {
            if (dataObject.length === 0) {
                sideBarService.getAccountListVS1().then(function(data) {
                    setAccountListVS1(data);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                setAccountListVS1(data);
            }
        }).catch(function(err) {
            sideBarService.getAccountListVS1().then(function(data) {
                setAccountListVS1(data);
            });
        });
    };
    function setAccountListVS1(data) {
        let splashArrayAccountList = [];
        for (let i = 0; i < data.taccountvs1.length; i++) {
            let accBalance = 0;
            if (!isNaN(data.taccountvs1[i].fields.Balance)) {
                accBalance = utilityService.modifynegativeCurrencyFormat(data.taccountvs1[i].fields.Balance) || 0.00;
            } else {
                accBalance = Currency + "0.00";
            }
            const dataList = [
                data.taccountvs1[i].fields.AccountName || '-',
                data.taccountvs1[i].fields.Description || '',
                data.taccountvs1[i].fields.AccountNumber || '',
                data.taccountvs1[i].fields.AccountTypeName || '',
                accBalance,
                data.taccountvs1[i].fields.TaxCode || '',
                data.taccountvs1[i].fields.ID || ''
            ];
            splashArrayAccountList.push(dataList);
        }
        if (splashArrayAccountList) {
            $('#tblFullAccount').dataTable({
                data: splashArrayAccountList,
                "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                paging: true,
                "aaSorting": [],
                "orderMulti": true,
                columnDefs: [
                    { className: "productName", "targets": [0] },
                    { className: "productDesc", "targets": [1] },
                    { className: "accountnumber", "targets": [2] },
                    { className: "salePrice", "targets": [3] },
                    { className: "prdqty text-right", "targets": [4] },
                    { className: "taxrate", "targets": [5] },
                    { className: "colAccountID hiddenColumn", "targets": [6] }
                ],
                colReorder: true,
                "order": [
                    [0, "asc"]
                ],
                pageLength: initialDatatableLoad,
                lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                info: true,
                responsive: true,
                "fnInitComplete": function () {
                    $("<button class='btn btn-primary btnAddNewAccount' data-dismiss='modal' data-toggle='modal' data-target='#addAccountModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblFullAccount_filter");
                    $("<button class='btn btn-primary btnRefreshAccount' type='button' id='btnRefreshAccount' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblFullAccount_filter");
                }

            });
            $('div.dataTables_filter input').addClass('form-control form-control-sm');
        }
    }

    templateObject.getAllTaxCodes = function () {
        getVS1Data("TTaxcodeVS1").then(function (dataObject) {
            if (dataObject.length == 0) {
                productService.getTaxCodesVS1().then(function (data) {
                    setTaxCodeModal(data);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                setTaxCodeModal(data);
            }
        }).catch(function (err) {
            productService.getTaxCodesVS1().then(function (data) {
                setTaxCodeModal(data);
            });
        });
    };
    function setTaxCodeModal(data) {
        let useData = data.ttaxcodevs1;
        // let records = [];
        // let inventoryData = [];
        for (let i = 0; i < useData.length; i++) {
            let taxRate = (useData[i].Rate * 100).toFixed(2);
            const dataList = [
                useData[i].Id || "",
                useData[i].CodeName || "",
                useData[i].Description || "-",
                taxRate || 0,
            ];
            let taxcoderecordObj = {
                codename: useData[i].CodeName || " ",
                coderate: taxRate || " ",
            };
            taxcodeList.push(taxcoderecordObj);
            splashArrayTaxRateList.push(dataList);
        }
        templateObject.taxraterecords.set(taxcodeList);
        if (splashArrayTaxRateList) {
            $("#tblTaxRate").DataTable({
                data: splashArrayTaxRateList,
                sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                columnDefs: [
                    {
                        orderable: false,
                        targets: 0,
                    },
                    {
                        className: "taxName",
                        targets: [1],
                    },
                    {
                        className: "taxDesc",
                        targets: [2],
                    },
                    {
                        className: "taxRate text-right",
                        targets: [3],
                    },
                ],
                select: true,
                destroy: true,
                colReorder: true,

                pageLength: initialDatatableLoad,
                lengthMenu: [
                    [initialDatatableLoad, -1],
                    [initialDatatableLoad, "All"],
                ],
                info: true,
                responsive: true,
                fnDrawCallback: function (oSettings) {
                    // $('.dataTables_paginate').css('display', 'none');
                },
                fnInitComplete: function () {
                    $(
                        "<button class='btn btn-primary btnAddNewTaxRate' data-dismiss='modal' data-toggle='modal' data-target='#newTaxRateModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>"
                    ).insertAfter("#tblTaxRate_filter");
                    $(
                        "<button class='btn btn-primary btnRefreshTax' type='button' id='btnRefreshTax' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>"
                    ).insertAfter("#tblTaxRate_filter");
                },
            });
        }
    }

    templateObject.getAllCustomers = function () {
        getVS1Data('TCustomerVS1').then(function (dataObject) {
            if (dataObject.length == 0) {
                sideBarService.getClientVS1().then(function (data) {
                    setCustomerList(data.tcustomervs1);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tcustomervs1;
                setCustomerList(useData);
            }
        }).catch(function (err) {
            sideBarService.getClientVS1().then(function (data) {
                setCustomerList(data.tcustomervs1);
            });
        });
    };
    function setCustomerList(data) {
        for (let i in data) {
            if (data.hasOwnProperty(i)) {
                let customerrecordObj = {
                    customerid: data[i].fields.ID || '',
                    firstname: data[i].fields.FirstName || '',
                    lastname: data[i].fields.LastName || '',
                    customername: data[i].fields.ClientName || '',
                    customeremail: data[i].fields.Email || '',
                    street: data[i].fields.Street || '',
                    street2: data[i].fields.Street2 || '',
                    street3: data[i].fields.Street3 || '',
                    suburb: data[i].fields.Suburb || '',
                    statecode: data[i].fields.State + ' ' + data[i].fields.Postcode || '',
                    country: data[i].fields.Country || '',
                    billstreet: data[i].fields.BillStreet || '',
                    billstreet2: data[i].fields.BillStreet2 || '',
                    billcountry: data[i].fields.Billcountry || '',
                    billstatecode: data[i].fields.BillState + ' ' + data[i].fields.BillPostcode || '',
                    termsName: data[i].fields.TermsName || '',
                    taxCode: data[i].fields.TaxCodeName || 'E',
                    clienttypename: data[i].fields.ClientTypeName || 'Default',
                    discount: data[i].fields.Discount || 0,
                };
                customerList.push(customerrecordObj);
            }
        }
    }

    templateObject.getAllSuppliers = function() {
        getVS1Data('TSupplierVS1').then(function(dataObject) {
            if (dataObject.length == 0) {
                supplierService.getSupplierVS1().then(function(data) {
                    setSupplierList(data);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tsuppliervs1;
                setSupplierList(useData);
            }
        }).catch(function(err) {
            supplierService.getSupplierVS1().then(function(data) {
                setSupplierList(data);
            });
        });
    };
    function setSupplierList(data) {
        for (let i in data) {
            if (data.hasOwnProperty(i)) {
                let supplierrecordObj = {
                    supplierid: data[i].fields.ID || '',
                    suppliername: data[i].fields.ClientName || '',
                    supplieremail: data[i].fields.Email || '',
                    street: data[i].fields.Street || '',
                    street2: data[i].fields.Street2 || '',
                    street3: data[i].fields.Street3 || '',
                    suburb: data[i].fields.Suburb || '',
                    statecode: data[i].fields.State + ' ' + data[i].fields.Postcode || '',
                    country: data[i].fields.Country || '',
                    billstreet: data[i].fields.BillStreet || '',
                    billstree2: data[i].fields.BillStreet2 || '',
                    billcountry: data[i].fields.Billcountry || '',
                    billstatecode: data[i].fields.BillState + ' ' + data[i].fields.BillPostcode || '',
                    termsName: data[i].fields.TermsName || ''
                };
                supplierList.push(supplierrecordObj);
            }
        }
    }

    templateObject.getBankTransactionData = function (accountId, statementDate, ignoreDate) {
        let yodleeFromDate = null;
        if (ignoreDate) {
            yodleeFromDate = '2000-01-01';
        } else {
            yodleeFromDate = statementDate;
        }
        let yodleeData = [];
        const client_id = "KESAGIh3yF3Z220TwoYeMDJKgsRXSSk4";
        const secret = "TqDOhdMCOYHJq1se";
        const user_name = "sbMem5f85b3fb4145c1";

        yodleeService.getAccessToken(user_name, client_id, secret).then(function(data) {
            let access_token = data.token.accessToken;
            const yodleeAccountID = getYodleeAccountID(accountId);
            yodleeService.getTransactionData(access_token, yodleeFromDate).then(function(data) {
                let lastTransactionDate = '1899-12-31';
                let debitTypeList = [];
                let creditTypeList = [];
                for (let i = 0; i < data.transaction.length; i++ ) {
                    if (yodleeAccountID == data.transaction[i].accountId && (data.transaction[i].baseType == 'DEBIT' || data.transaction[i].baseType == 'CREDIT')
                        && data.transaction[i].merchant && data.transaction[i].merchant.name) {
                        let description = '';
                        if (data.transaction[i].description) {
                            if (data.transaction[i].description.simple) {
                                description += data.transaction[i].description.simple;
                            }
                            if (data.transaction[i].description.original) {
                                description += data.transaction[i].description.original;
                            }
                        }
                        // let yodleeTransactionDate = data.transaction[i].date != '' ? moment(data.transaction[i].date).format("DD/MM/YYYY") : data.transaction[i].date;
                        let yodleeTransactionDate = data.transaction[i].transactionDate != '' ? moment(data.transaction[i].transactionDate).format("DD/MM/YYYY") : '';
                        let yodleeDate = data.transaction[i].transactionDate != '' ? moment(data.transaction[i].transactionDate).format("YYYY-MM-DD") : '';
                        let deporwith = '';
                        let spentYodleeAmount = 0;
                        let receivedYodleeAmount = 0;
                        if (data.transaction[i].baseType == 'DEBIT') {
                            deporwith = 'spent';
                            spentYodleeAmount = data.transaction[i].amount.amount;
                            debitTypeList.push(data.transaction[i].type);
                        } else {
                            deporwith = 'received';
                            receivedYodleeAmount = data.transaction[i].amount.amount;
                            creditTypeList.push(data.transaction[i].type);
                        }
                        if (yodleeDate > lastTransactionDate) {
                            lastTransactionDate = yodleeDate;
                        }
                        let merchantName = '';
                        if (data.transaction[i].merchant && data.transaction[i].merchant.name) {
                            merchantName = data.transaction[i].merchant.name;
                        }
                        let yodleeObject = {
                            SortDate: yodleeDate,
                            YodleeDate: yodleeTransactionDate,
                            VS1Date: '',
                            CompanyName: merchantName || '',
                            VS1Notes: '',
                            VS1List: null,
                            Amount: 0,
                            YodleeAccountID: data.transaction[i].accountId || 0,
                            YodleeLineID: data.transaction[i].id || 0,
                            YodleeTransactionDate: yodleeTransactionDate,
                            YodleeAmount: data.transaction[i].amount.amount,
                            YodleeDescription: description,
                            YodleeBaseType: data.transaction[i].baseType || '',
                            YodleeCategory: data.transaction[i].category || '',
                            YodleeCategoryType: data.transaction[i].categoryType || '',
                            YodleeCheckNumber: data.transaction[i].checkNumber || '',
                            YodleeType: data.transaction[i].type || '',
                            YodleeMerchant: data.transaction[i].merchant || null,
                            deporwith: deporwith,
                            matched: false,
                            spentYodleeAmount: utilityService.modifynegativeCurrencyFormat(spentYodleeAmount),
                            receivedYodleeAmount: utilityService.modifynegativeCurrencyFormat(receivedYodleeAmount),
                            spentVS1Amount: utilityService.modifynegativeCurrencyFormat(0),
                            receivedVS1Amount: utilityService.modifynegativeCurrencyFormat(0),
                        };
                        yodleeData.push(yodleeObject);
                    }
                }
                debitTypeList = [...new Set(debitTypeList)];
                creditTypeList = [...new Set(creditTypeList)];
                templateObject.lastTransactionDate.set(moment(lastTransactionDate).format("DD/MM/YYYY"));
                const currentBeginDate = new Date();
                let fromDateMonth = (currentBeginDate.getMonth() + 1);
                let fromDateDay = currentBeginDate.getDate();
                if((currentBeginDate.getMonth()+1) < 10){
                    fromDateMonth = "0" + (currentBeginDate.getMonth()+1);
                } else {
                    fromDateMonth = (currentBeginDate.getMonth()+1);
                }
                if(currentBeginDate.getDate() < 10){
                    fromDateDay = "0" + currentBeginDate.getDate();
                }
                const toDate = currentBeginDate.getFullYear() + "-" + (fromDateMonth) + "-" + (fromDateDay);
                const fromDate = "1899-12-31";
                getVS1Data('TReconciliationList').then(function (dataObject) {
                    if(dataObject.length == 0){
                        sideBarService.getAllTReconcilationByName(fromDate, toDate, bankaccountname).then(function (data) {
                            setAllTReconciliation(data, yodleeData);
                        }).catch(function (err) {
                            $('.fullScreenSpin').css('display','none');
                        });
                    }else{
                        let data = JSON.parse(dataObject[0].data);
                        setAllTReconciliation(data, yodleeData);
                    }
                }).catch(function (err) {
                    sideBarService.getAllTReconcilationByName(fromDate, toDate, bankaccountname).then(function (data) {
                        setAllTReconciliation(data, yodleeData);
                    }).catch(function (err) {
                        $('.fullScreenSpin').css('display','none');
                    });
                });
            }).catch(function(err) {
                $('.fullScreenSpin').css('display', 'none');
            });
            yodleeService.getAccountData(access_token, yodleeAccountID).then(function(data) {
                for (let i = 0; i < data.account.length; i++ ) {
                    let yodleeBalance = data.account[0].currentBalance.amount;
                    let yodleeProviderAccountId = data.account[0].providerAccountId;
                    let yodleeAccountName = data.account[0].accountName;
                    $('.yodleeBalance').text(utilityService.modifynegativeCurrencyFormat(yodleeBalance));
                }
            }).catch(function(err) {
                $('.fullScreenSpin').css('display', 'none');
            });
        }).catch(function (err) {
            $('.fullScreenSpin').css('display', 'none');
        });
    };
    function setAllTReconciliation(data, yodleeData) {
        let reconList = [];
        for(let i=0; i<data.treconciliation.length; i++){
            if (bankaccountname == data.treconciliation[i].fields.AccountName ) {
                let openBalance = utilityService.modifynegativeCurrencyFormat(data.treconciliation[i].fields.OpenBalance) || 0.00;
                let closeBalance = utilityService.modifynegativeCurrencyFormat(data.treconciliation[i].fields.CloseBalance) || 0.00;
                let Amount = 0;
                if (data.treconciliation[i].fields.DepositLines && data.treconciliation[i].fields.DepositLines.length > 0) {
                    let depositLines = data.treconciliation[i].fields.DepositLines;
                    for (let a in depositLines) {
                        if (depositLines.hasOwnProperty(a)) {
                            Amount -= parseFloat(depositLines[a].fields.Amount);
                        }
                    }
                }
                if (data.treconciliation[i].fields.WithdrawalLines && data.treconciliation[i].fields.WithdrawalLines.length > 0) {
                    let withdrawalLines = data.treconciliation[i].fields.WithdrawalLines;
                    for (let b in withdrawalLines) {
                        if (withdrawalLines.hasOwnProperty(b)) {
                            Amount += parseFloat(withdrawalLines[b].fields.Amount);
                        }
                    }
                }
                let reconObj = {
                    VS1Date: data.treconciliation[i].fields.ReconciliationDate != '' ? moment(data.treconciliation[i].fields.ReconciliationDate).format("DD/MM/YYYY") : '',
                    CompanyName: data.treconciliation[i].fields.AccountName || '',
                    VS1Notes: data.treconciliation[i].fields.Notes || '',
                    Amount: Amount,
                    StatementLineID: data.treconciliation[i].fields.StatementNo || 0,
                    VS1Amount: utilityService.modifynegativeCurrencyFormat(Amount),
                    VS1List: data.treconciliation[i]
                };
                reconList.push(reconObj);
            }
        }
        let reconData = [];
        if (yodleeData.length > 0) {
            for (let k = 0; k < yodleeData.length; k++ ) {
                let VS1Date = ''; let CompanyName = yodleeData[k].CompanyName; let VS1Notes = ''; let Amount = 0; let VS1Amount = '';
                let VS1Data = null; let matched = false; let VS1List = null;
                if (reconList.length > 0) {
                    for (let j = 0; j < reconList.length; j++ ) {
                        if (yodleeData[k].YodleeLineID.toString() == reconList[j].StatementLineID) {
                            VS1Data = reconList[j];
                        }
                    }
                }
                if (VS1Data) {
                    VS1Date = VS1Data.VS1Date;
                    CompanyName = VS1Data.CompanyName;
                    VS1Notes = VS1Data.VS1Notes;
                    Amount = VS1Data.Amount;
                    VS1Amount = VS1Data.VS1Amount;
                    VS1List = VS1Data.VS1List.fields;
                    matched = parseFloat(yodleeData[k].YodleeAmount) == parseFloat(VS1Data.Amount);
                }
                let reconObject = {
                    SortDate: yodleeData[k].SortDate,
                    YodleeDate: yodleeData[k].YodleeDate,
                    VS1Date: VS1Date,
                    CompanyName: CompanyName,
                    VS1Notes: VS1Notes,
                    VS1List: VS1List,
                    Amount: Amount,
                    YodleeAccountID: yodleeData[k].YodleeAccountID,
                    YodleeLineID: yodleeData[k].YodleeLineID,
                    YodleeTransactionDate: yodleeData[k].YodleeTransactionDate,
                    YodleeAmount: yodleeData[k].YodleeAmount,
                    YodleeDescription: yodleeData[k].YodleeDescription,
                    YodleeBaseType: yodleeData[k].YodleeBaseType,
                    YodleeCategory: yodleeData[k].YodleeCategory,
                    YodleeCategoryType: yodleeData[k].YodleeCategoryType,
                    YodleeCheckNumber: yodleeData[k].YodleeCheckNumber,
                    YodleeType: yodleeData[k].YodleeType,
                    YodleeMerchant: yodleeData[k].YodleeMerchant,
                    deporwith: yodleeData[k].deporwith,
                    matched: matched,
                    spentYodleeAmount: yodleeData[k].spentYodleeAmount,
                    receivedYodleeAmount: yodleeData[k].receivedYodleeAmount,
                    spentVS1Amount: yodleeData[k].deporwith == 'spent'?VS1Amount:utilityService.modifynegativeCurrencyFormat(0),
                    receivedVS1Amount: yodleeData[k].deporwith == 'received'?VS1Amount:utilityService.modifynegativeCurrencyFormat(0),
                };
                reconData.push(reconObject);
            }
            setBankTransactionData(reconData);
        }
    }
    function setBankTransactionData(reconData) {
        page_total = reconData.length;
        templateObject.page_total.set(page_total);
        let page_cnt = Math.ceil(page_total/page_limit);
        templateObject.page_count.set(page_cnt);
        let page_list = Array.from({length: page_cnt}, (_, i) => i + 1);
        templateObject.page_list.set(page_list);
        let page_arr = [];
        let sort = templateObject.sort.get();
        if (sort == "ascDepositSpent") {
            page_arr = sortTransactionData(reconData, 'spentYodleeAmount', false);
            templateObject.fa_sortDepositSpent.set('fa-sort-asc');
            templateObject.fa_sortDepositReceived.set('fa-sort');
            templateObject.fa_sortWithdrawSpent.set('fa-sort');
            templateObject.fa_sortWithdrawReceived.set('fa-sort');
        } else if (sort == "descDepositSpent") {
            page_arr = sortTransactionData(reconData, 'spentYodleeAmount', true);
            templateObject.fa_sortDepositSpent.set('fa-sort-desc');
            templateObject.fa_sortDepositReceived.set('fa-sort');
            templateObject.fa_sortWithdrawSpent.set('fa-sort');
            templateObject.fa_sortWithdrawReceived.set('fa-sort');
        } else if (sort == "ascDepositReceived") {
            page_arr = sortTransactionData(reconData, 'receivedYodleeAmount', false);
            templateObject.fa_sortDepositSpent.set('fa-sort');
            templateObject.fa_sortDepositReceived.set('fa-sort-asc');
            templateObject.fa_sortWithdrawSpent.set('fa-sort');
            templateObject.fa_sortWithdrawReceived.set('fa-sort');
        } else if (sort == "descDepositReceived") {
            page_arr = sortTransactionData(reconData, 'receivedYodleeAmount', true);
            templateObject.fa_sortDepositSpent.set('fa-sort');
            templateObject.fa_sortDepositReceived.set('fa-sort-desc');
            templateObject.fa_sortWithdrawSpent.set('fa-sort');
            templateObject.fa_sortWithdrawReceived.set('fa-sort');
        } else if (sort == "ascWithdrawSpent") {
            page_arr = sortTransactionData(reconData, 'spentVS1Amount', false);
            templateObject.fa_sortDepositSpent.set('fa-sort');
            templateObject.fa_sortDepositReceived.set('fa-sort');
            templateObject.fa_sortWithdrawSpent.set('fa-sort-asc');
            templateObject.fa_sortWithdrawReceived.set('fa-sort');
        } else if (sort == "descWithdrawSpent") {
            page_arr = sortTransactionData(reconData, 'spentVS1Amount', true);
            templateObject.fa_sortDepositSpent.set('fa-sort');
            templateObject.fa_sortDepositReceived.set('fa-sort');
            templateObject.fa_sortWithdrawSpent.set('fa-sort-desc');
            templateObject.fa_sortWithdrawReceived.set('fa-sort');
        } else if (sort == "ascWithdrawReceived") {
            page_arr = sortTransactionData(reconData, 'receivedVS1Amount', false);
            templateObject.fa_sortDepositSpent.set('fa-sort');
            templateObject.fa_sortDepositReceived.set('fa-sort');
            templateObject.fa_sortWithdrawSpent.set('fa-sort');
            templateObject.fa_sortWithdrawReceived.set('fa-sort-asc');
        } else if (sort == "descWithdrawReceived") {
            page_arr = sortTransactionData(reconData, 'receivedVS1Amount', true);
            templateObject.fa_sortDepositSpent.set('fa-sort');
            templateObject.fa_sortDepositReceived.set('fa-sort');
            templateObject.fa_sortWithdrawSpent.set('fa-sort');
            templateObject.fa_sortWithdrawReceived.set('fa-sort-desc');
        } else {
            page_arr = sortTransactionData(reconData, 'SortDate');
            templateObject.fa_sortDepositSpent.set('fa-sort');
            templateObject.fa_sortDepositReceived.set('fa-sort');
            templateObject.fa_sortWithdrawSpent.set('fa-sort');
            templateObject.fa_sortWithdrawReceived.set('fa-sort');
        }
        page_arr = page_arr.slice((page_number-1)*page_limit, page_number*page_limit);
        let thirdaryData = $.merge($.merge([], templateObject.bankTransactionData.get()), page_arr);
        templateObject.bankTransactionData.set(thirdaryData);
        if (templateObject.bankTransactionData.get().length > 0) {
            setTimeout(function() {
                if (parseInt(page_number) == 1) {
                    $(".btnPagePrev").prop("disabled", true);
                }
                if (parseInt(page_number) == page_cnt) {
                    $(".btnPageNext").prop("disabled", true);
                }
                defineTabpanelEvent();
                $('.fullScreenSpin').css('display', 'none');
            }, 500);
        }
    }
    function getYodleeAccountID(accountID) {
        let yodleeAccountID = 12187126;
        return yodleeAccountID;
    }

    templateObject.getMatchTransactionData = function (accountId, statementDate, ignoreDate) {
        let matchData = [];
        reconService.getToBeReconciledDeposit(accountId, statementDate, ignoreDate).then(function(data) {
            if (data.ttobereconcileddeposit.length > 0) {
                for (let i = 0; i < data.ttobereconcileddeposit.length; i++ ) {
                    let reconciledepositObj = {
                        ID: 'd'+i,
                        VS1Date: data.ttobereconcileddeposit[i].DepositDate != '' ? moment(data.ttobereconcileddeposit[i].DepositDate).format("DD/MM/YYYY") : '',
                        SortDate: data.ttobereconcileddeposit[i].DepositDate != '' ? moment(data.ttobereconcileddeposit[i].DepositDate).format("YYYY-MM-DD") : '',
                        CompanyName: data.ttobereconcileddeposit[i].CompanyName || ' ',
                        PaymentType: data.ttobereconcileddeposit[i].Notes || ' ',
                        Amount: data.ttobereconcileddeposit[i].Amount,
                        DepositID: data.ttobereconcileddeposit[i].DepositID || ' ',
                        ReferenceNo: data.ttobereconcileddeposit[i].ReferenceNo || ' ',
                        Seqno: data.ttobereconcileddeposit[i].Seqno || 0,
                        PaymentID: data.ttobereconcileddeposit[i].PaymentID || 0,
                        DepositLineID: data.ttobereconcileddeposit[i].DepositLineID || 0,
                        CusID: data.ttobereconcileddeposit[i].CusID || 0,
                        StatementLineID: data.ttobereconcileddeposit[i].StatementLineID || 0,
                        StatementTransactionDate: data.ttobereconcileddeposit[i].StatementTransactionDate != '' ? moment(data.ttobereconcileddeposit[i].StatementTransactionDate).format("DD/MM/YYYY") : '',
                        StatementAmount: data.ttobereconcileddeposit[i].StatementAmount,
                        StatementDescription: data.ttobereconcileddeposit[i].StatementDescription || ' ',
                        deporwith: 'received',
                        spentVS1Amount: utilityService.modifynegativeCurrencyFormat(0),
                        receivedVS1Amount: utilityService.modifynegativeCurrencyFormat(data.ttobereconcileddeposit[i].Amount),
                    };
                    matchData.push(reconciledepositObj);
                }
            }
            reconService.getToBeReconciledWithdrawal(accountId, statementDate, ignoreDate).then(function(data) {
                if (data.ttobereconciledwithdrawal.length > 0) {
                    for (let j = 0; j < data.ttobereconciledwithdrawal.length; j++ ) {
                        let reconcilewithdrawalObj = {
                            ID: 'w'+j,
                            VS1Date: data.ttobereconciledwithdrawal[j].DepositDate != '' ? moment(data.ttobereconciledwithdrawal[j].DepositDate).format("DD/MM/YYYY") : '',
                            SortDate: data.ttobereconciledwithdrawal[j].DepositDate != '' ? moment(data.ttobereconciledwithdrawal[j].DepositDate).format("YYYY-MM-DD") : '',
                            CompanyName: data.ttobereconciledwithdrawal[j].CompanyName || ' ',
                            PaymentType: data.ttobereconciledwithdrawal[j].Notes || ' ',
                            Amount: data.ttobereconciledwithdrawal[j].Amount,
                            DepositID: data.ttobereconciledwithdrawal[j].DepositID || ' ',
                            ReferenceNo: data.ttobereconciledwithdrawal[j].ReferenceNo || ' ',
                            Seqno: data.ttobereconciledwithdrawal[j].Seqno || 0,
                            PaymentID: data.ttobereconciledwithdrawal[j].PaymentID || 0,
                            DepositLineID: data.ttobereconciledwithdrawal[j].DepositLineID || 0,
                            CusID: data.ttobereconciledwithdrawal[j].CusID || 0,
                            StatementLineID: data.ttobereconciledwithdrawal[j].StatementLineID || 0,
                            StatementTransactionDate: data.ttobereconciledwithdrawal[j].StatementTransactionDate != '' ? moment(data.ttobereconciledwithdrawal[j].StatementTransactionDate).format("DD/MM/YYYY") : '',
                            StatementAmount: data.ttobereconciledwithdrawal[j].StatementAmount,
                            StatementDescription: data.ttobereconciledwithdrawal[j].StatementDescription || ' ',
                            deporwith: 'spent',
                            spentVS1Amount: utilityService.modifynegativeCurrencyFormat(data.ttobereconciledwithdrawal[j].Amount),
                            receivedVS1Amount: utilityService.modifynegativeCurrencyFormat(0),
                        };
                        matchData.push(reconcilewithdrawalObj);
                    }
                }
                setMatchTransactionData(matchData);
            }).catch(function(err) {
                setMatchTransactionData(matchData);
            });
        }).catch(function(err) {
            $('.fullScreenSpin').css('display', 'none');
        });
    };
    function setMatchTransactionData(matchData) {
        let thirdaryData = sortTransactionData(matchData, 'SortDate');
        VS1TransactionList = thirdaryData;
        matchTransactionList = thirdaryData;
        viewTransactionList = [];
        // templateObject.matchTransactionData.set(thirdaryData);
    }

    templateObject.getAllReconListData = function () {
        const currentBeginDate = new Date();
        const begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
        let fromDateMonth = (currentBeginDate.getMonth() + 1);
        let fromDateDay = currentBeginDate.getDate();
        if((currentBeginDate.getMonth()+1) < 10){
            fromDateMonth = "0" + (currentBeginDate.getMonth()+1);
        } else {
            fromDateMonth = (currentBeginDate.getMonth()+1);
        }
        if(currentBeginDate.getDate() < 10){
            fromDateDay = "0" + currentBeginDate.getDate();
        }
        const toDate = currentBeginDate.getFullYear() + "-" + (fromDateMonth) + "-" + (fromDateDay);
        const fromDate = "2000-01-01";
        getVS1Data('TReconciliationList').then(function (dataObject) {
            if(dataObject.length == 0){
                sideBarService.getAllTReconcilationList(fromDate, toDate).then(function (data) {
                    setAllTReconciliationList(data);
                }).catch(function (err) {
                    $('.fullScreenSpin').css('display','none');
                });
            }else{
                let data = JSON.parse(dataObject[0].data);
                setAllTReconciliationList(data);
            }
        }).catch(function (err) {
            sideBarService.getAllTReconcilationList(fromDate, toDate).then(function (data) {
                setAllTReconciliationList(data);
            }).catch(function (err) {
                $('.fullScreenSpin').css('display','none');
            });
        });
    };
    function setAllTReconciliationList(data) {
        let reconList = [];
        for(let i=0; i<data.treconciliationlist.length; i++){
            let openBalance = utilityService.modifynegativeCurrencyFormat(data.treconciliationlist[i].OpenBalance)|| 0.00;
            let closeBalance = utilityService.modifynegativeCurrencyFormat(data.treconciliationlist[i].CloseBalance)|| 0.00;
            const dataList = {
                id: data.treconciliationlist[i].ID || '',
                sortdate: data.treconciliationlist[i].ReconciliationDate != '' ? moment(data.treconciliationlist[i].ReconciliationDate).format("YYYY/MM/DD") : '',
                recondate: data.treconciliationlist[i].ReconciliationDate != '' ? moment(data.treconciliationlist[i].ReconciliationDate).format("DD/MM/YYYY") : '',
                accountname: data.treconciliationlist[i].AccountName || '',
                statementno: data.treconciliationlist[i].StatementNo || '',
                department: data.treconciliationlist[i].Department || '',
                openbalance: openBalance || 0.00,
                closebalance: closeBalance || 0.00,
                employee: data.treconciliationlist[i].EmployeeName || '',
                notes: data.treconciliationlist[i].Notes || '',
                onhold: data.treconciliationlist[i].OnHold || false,
                finished: data.treconciliationlist[i].Finished || false,
            };
            if(data.treconciliationlist[i].ReconciliationDate != ''){
                reconList.push(dataList);
            }
        }
    }

    templateObject.getOpenBalance = function(bankAccount) {
        reconService.getReconciliationBalance(bankAccount).then(function(data) {
            let openBal = 0;
            let dataArray = [];
            if (data.treconciliation.length) {
                for (let k = 0; k < data.treconciliation.length; k++ ) {
                    //if(data.treconciliation[k].CloseBalance > 0){
                    if (data.treconciliation[k].AccountName == bankAccount) {
                        // counter++;
                        let objData = {
                            Id: data.treconciliation[k].Id,
                            AccountName: data.treconciliation[k].AccountName,
                            CloseBalance: data.treconciliation[k].CloseBalance||0,
                            OpenBalance: data.treconciliation[k].OpenBalance||0,
                            OnHold: data.treconciliation[k].OnHold
                        };
                        dataArray.push(objData);
                        if (FlowRouter.current().queryParams.id) {

                        } else {
                            if (data.treconciliation[k].OnHold == true) {
                                Session.setPersistent('bankaccountid', data.treconciliation[k].AccountID);
                                Session.setPersistent('bankaccountname', data.treconciliation[k].AccountName);
                            }
                        }
                    }
                }
                if (dataArray.length == 0) {
                    openBal = 0;
                } else {
                    for (let j in dataArray) {
                        if(dataArray[dataArray.length - 1].OnHold == true){
                            openBal = dataArray[dataArray.length - 1].OpenBalance;
                        }else{
                            openBal = dataArray[dataArray.length - 1].CloseBalance;
                        }
                    }
                }
                $('.vs1cloudBalance').text(utilityService.modifynegativeCurrencyFormat(openBal));
            } else {
                $('.vs1cloudBalance').text(utilityService.modifynegativeCurrencyFormat(openBal));
            }
        }).catch(function(err) {
            $('.fullScreenSpin').css('display', 'none');
        });
    };

    templateObject.getDefaultCustomerTerms = function() {
        sideBarService.getDefaultCustomerTerms().then(function(data) {
            if (data.ttermsvs1.length > 0) {
                const val = data.ttermsvs1[0].TermsName;
                // templateObject.defaultCustomerTerms.set(val);
                templateObject.defaultCustomerTerms.set('test');
            } else {
                templateObject.defaultCustomerTerms.set('test');
            }
        });
    };
    templateObject.getDefaultSupplierTerms = function() {
        sideBarService.getDefaultSupplierTerms().then(function(data) {
            if (data.ttermsvs1.length > 0) {
                const val = data.ttermsvs1[0].TermsName;
                // templateObject.defaultSupplierTerms.set(val);
                templateObject.defaultSupplierTerms.set('test');
            } else {
                templateObject.defaultSupplierTerms.set('test');
            }
        });
    };

    setTimeout(function () {
        $('.fullScreenSpin').css('display', 'inline-block');
        templateObject.getAccountNames();
        templateObject.getAllAccounts();
        templateObject.getAllTaxCodes();
        templateObject.getAllCustomers();
        templateObject.getAllSuppliers();
        templateObject.defaultCustomerTerms.set('test');
        templateObject.defaultSupplierTerms.set('test');
        // templateObject.getDefaultCustomerTerms();
        // templateObject.getDefaultSupplierTerms();
        // templateObject.getAllReconListData();
    }, 100);

    $('#bankAccountName').editableSelect();
    $('#bankAccountName').editableSelect().on('click.editable-select', function (e, li) {
        const $each = $(this);
        const offset = $each.offset();
        const accountDataName = e.target.value || '';
        selectedAccountFlag = 'ForBank';
        if (e.pageX > offset.left + $each.width() - 8) { // X button 16px wide?
            openBankAccountListModal();
        } else {
            if(accountDataName.replace(/\s/g, '') != ''){
                getVS1Data('TAccountVS1').then(function (dataObject) {
                    if (dataObject.length == 0) {
                        setOneAccountByName(accountDataName);
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        let added = false;
                        for (let a = 0; a < data.taccountvs1.length; a++) {
                            if((data.taccountvs1[a].fields.AccountName) == accountDataName){
                                added = true;
                                setBankAccountData(data, a);
                            }
                        }
                        if(!added) {
                            setOneAccountByName(accountDataName);
                        }
                    }
                }).catch(function (err) {
                    setOneAccountByName(accountDataName);
                });
                $('#bankAccountListModal').modal('toggle');
            }else{
                openBankAccountListModal();
            }
        }
    });

    function defineTabpanelEvent() {
        templateObject.bankTransactionData.get().forEach(function(item, index) {
            $('#ctaxRate_'+item.YodleeLineID).editableSelect();
            $('#ctaxRate_'+item.YodleeLineID).editableSelect().on("click.editable-select", function (e, li) {
                const $each = $(this);
                const offset = $each.offset();
                const taxRateDataName = e.target.value || "";
                selectedYodleeID = item.YodleeLineID;
                selectedTaxFlag = 'ForTab';
                if (e.pageX > offset.left + $each.width() - 8) {
                    // X button 16px wide?
                    $("#taxRateListModal").modal("toggle");
                } else {
                    if (taxRateDataName.replace(/\s/g, "") != "") {
                        $(".taxcodepopheader").text("Edit Tax Rate");
                        getVS1Data("TTaxcodeVS1").then(function (dataObject) {
                            if (dataObject.length == 0) {
                                setTaxCodeVS1(taxRateDataName);
                            } else {
                                let data = JSON.parse(dataObject[0].data);
                                $(".taxcodepopheader").text("Edit Tax Rate");
                                setTaxRateData(data, taxRateDataName);
                            }
                        }).catch(function (err) {
                            setTaxCodeVS1(taxRateDataName);
                        });
                    } else {
                        $("#taxRateListModal").modal("toggle");
                    }
                }
            });
            $('#who_'+item.YodleeLineID).editableSelect();
            $('#who_'+item.YodleeLineID).editableSelect().on('click.editable-select', function (e, li) {
                selectedYodleeID = item.YodleeLineID;
                editableWho(item, $(this), e);
            });
            $('#sender_'+item.YodleeLineID).editableSelect();
            $('#sender_'+item.YodleeLineID).editableSelect().on('click.editable-select', function (e, li) {
                selectedYodleeID = item.YodleeLineID;
                editableWho(item, $(this), e);
            });
            $('#what_'+item.YodleeLineID).editableSelect();
            $('#what_'+item.YodleeLineID).editableSelect().on('click.editable-select', function (e, li) {
                const $each = $(this);
                const offset = $each.offset();
                let accountDataName = e.target.value ||'';
                selectedAccountFlag = 'ForWhat';
                selectedYodleeID = item.YodleeLineID;
                if (e.pageX > offset.left + $each.width() - 8) { // X button 16px wide?
                    openBankAccountListModal();
                }else{
                    if(accountDataName.replace(/\s/g, '') != ''){
                        getVS1Data('TAccountVS1').then(function (dataObject) {
                            if (dataObject.length == 0) {
                                setOneAccountByName(accountDataName);
                            } else {
                                let data = JSON.parse(dataObject[0].data);
                                let added = false;
                                for (let a = 0; a < data.taccountvs1.length; a++) {
                                    if((data.taccountvs1[a].fields.AccountName) == accountDataName){
                                        added = true;
                                        setBankAccountData(data, a);
                                    }
                                }
                                if(!added) {
                                    setOneAccountByName(accountDataName);
                                }
                            }
                        }).catch(function (err) {
                            setOneAccountByName(accountDataName);
                        });
                        $('#addAccountModal').modal('toggle');
                    }else{
                        openBankAccountListModal();
                    }
                }
            });
            $('#transferAccount_'+item.YodleeLineID).editableSelect();
            $('#transferAccount_'+item.YodleeLineID).editableSelect().on('click.editable-select', function (e, li) {
                const $each = $(this);
                const offset = $each.offset();
                let accountDataName = e.target.value ||'';
                selectedAccountFlag = 'ForTransfer';
                selectedYodleeID = item.YodleeLineID;
                if (e.pageX > offset.left + $each.width() - 8) { // X button 16px wide?
                    openBankAccountListModal();
                }else{
                    if(accountDataName.replace(/\s/g, '') != ''){
                        getVS1Data('TAccountVS1').then(function (dataObject) {
                            if (dataObject.length == 0) {
                                setOneAccountByName(accountDataName);
                            } else {
                                let data = JSON.parse(dataObject[0].data);
                                let added = false;
                                for (let a = 0; a < data.taccountvs1.length; a++) {
                                    if((data.taccountvs1[a].fields.AccountName) == accountDataName){
                                        added = true;
                                        setBankAccountData(data, a);
                                    }
                                }
                                if(!added) {
                                    setOneAccountByName(accountDataName);
                                }
                            }
                        }).catch(function (err) {
                            setOneAccountByName(accountDataName);
                        });
                        $('#addAccountModal').modal('toggle');
                    }else{
                        openBankAccountListModal();
                    }
                }
            });

            $('#DateIn_'+item.YodleeLineID).datepicker({
                showOn: 'button',
                buttonText: 'Show Date',
                buttonImageOnly: true,
                buttonImage: '/img/imgCal2.png',
                dateFormat: 'dd/mm/yy',
                showOtherMonths: true,
                selectOtherMonths: true,
                changeMonth: true,
                changeYear: true,
                yearRange: "-90:+10",
            });
            if (item.VS1List){
                $('#reconID_'+item.YodleeLineID).val(item.VS1List.ID);
                let paymentFields = null;
                if (item.deporwith == "spent") {
                    if (item.VS1List.WithdrawalLines && item.VS1List.WithdrawalLines.length > 0) {
                        paymentFields = item.VS1List.WithdrawalLines[0].fields; // Note???
                    }
                } else {
                    if (item.VS1List.DepositLines && item.VS1List.DepositLines.length > 0) {
                        paymentFields = item.VS1List.DepositLines[0].fields;
                    }
                }
                if (paymentFields) {
                    $('#paymentID_' + item.YodleeLineID).val(paymentFields.PaymentID);
                    $('#what_' + item.YodleeLineID).val(paymentFields.AccountName);
                    $('#who_' + item.YodleeLineID).val(paymentFields.ClientName);
                    $('#whoID_' + item.YodleeLineID).val(paymentFields.ClientID);
                    $('#sender_' + item.YodleeLineID).val(paymentFields.ClientName);
                }
            } else {
                $('#who_' + item.YodleeLineID).val(item.CompanyName);
                if (item.deporwith == "received") {
                    let isExistCustomer = false;
                    customerList.forEach(customer => {
                        if (item.CompanyName == customer.customername) {
                            $('#whoID_' + item.YodleeLineID).val(customer.customerid);
                            isExistCustomer = true;
                        }
                    });
                    if (!isExistCustomer) {
                        contactService.getOneCustomerDataExByName(item.CompanyName).then(function (data) {
                            if (data.tcustomer.length == 0) {
                                const termsName = templateObject.defaultCustomerTerms.get();
                                let objDetails = {
                                    type: "TCustomer",
                                    fields: {
                                        ClientName: item.CompanyName,
                                        FirstName: item.CompanyName,
                                        LastName: 'Unknown',
                                        Phone: '',
                                        Mobile: '',
                                        Email: '',
                                        SkypeName: '',
                                        Street: item.YodleeMerchant.address.city || '',
                                        Street2: '',
                                        Suburb: '',
                                        State: item.YodleeMerchant.address.state || '',
                                        PostCode: '',
                                        Country: item.YodleeMerchant.address.country || '',
                                        BillStreet: '',
                                        BillStreet2: '',
                                        BillState: '',
                                        BillPostCode: '',
                                        Billcountry: '',
                                        TermsName: termsName || '',
                                        PublishOnVS1: true
                                    }
                                };
                                contactService.saveCustomer(objDetails).then(function (customer) {
                                    $('#whoID_' + item.YodleeLineID).val(customer.fields.ID);
                                    let customerrecordObj = {
                                        customerid: customer.fields.ID || '',
                                        customername: item.CompanyName || '',
                                        firstname: item.CompanyName || '',
                                        lastname: '',
                                        customeremail: '',
                                        street: item.YodleeMerchant.address.city || '',
                                        street2: '',
                                        street3: '',
                                        suburb: '',
                                        state: item.YodleeMerchant.address.state || '',
                                        country: item.YodleeMerchant.address.country || '',
                                        billstreet: '',
                                        billstree2: '',
                                        billcountry: '',
                                        billstatecode: '',
                                        termsName: '',
                                        taxCode: 'E',
                                        clienttypename: 'Default',
                                        discount: 0,
                                    };
                                    customerList.push(customerrecordObj);
                                }).catch(function (err) {
                                    //$('.fullScreenSpin').css('display','none');
                                });
                            } else {
                                $('#whoID_' + item.YodleeLineID).val(data.tcustomer[0].fields.ID);
                            }
                        }).catch(function (err) {

                        });
                    }
                } else {
                    let isExistSupplier = false;
                    supplierList.forEach(supplier => {
                        if (item.CompanyName == supplier.suppliername) {
                            $('#whoID_' + item.YodleeLineID).val(supplier.supplierid);
                            isExistSupplier = true;
                        }
                    });
                    if (!isExistSupplier) {
                        contactService.getOneSupplierDataExByName(item.CompanyName).then(function (data) {
                            if (data.tsupplier.length == 0) {
                                const termsName = templateObject.defaultSupplierTerms.get();
                                let objDetails = {
                                    type: "TSupplier",
                                    fields: {
                                        ClientName: item.CompanyName,
                                        FirstName: item.CompanyName,
                                        LastName: 'Unknown',
                                        Phone: '',
                                        Mobile: '',
                                        Email: '',
                                        SkypeName: '',
                                        Street: item.YodleeMerchant.address.city || '',
                                        Street2: '',
                                        Suburb: '',
                                        State: item.YodleeMerchant.address.state || '',
                                        PostCode: '',
                                        Country: item.YodleeMerchant.address.country || '',
                                        BillStreet: '',
                                        BillStreet2: '',
                                        BillState: '',
                                        BillPostCode: '',
                                        Billcountry: '',
                                        TermsName: termsName || '',
                                        PublishOnVS1: true
                                    }
                                };
                                contactService.saveSupplier(objDetails).then(function (supplier) {
                                    $('#whoID_' + item.YodleeLineID).val(supplier.fields.ID);
                                    let supplierrecordObj = {
                                        supplierid: supplier.fields.ID || '',
                                        suppliername: item.CompanyName || '',
                                        supplieremail: '',
                                        street: item.YodleeMerchant.address.city || '',
                                        street2: '',
                                        street3: '',
                                        suburb: '',
                                        state: item.YodleeMerchant.address.state || '',
                                        country: item.YodleeMerchant.address.country || '',
                                        billstreet: '',
                                        billstree2: '',
                                        billcountry: '',
                                        billstatecode: '',
                                        termsName: ''
                                    };
                                    supplierList.push(supplierrecordObj);
                                }).catch(function (err) {
                                    //$('.fullScreenSpin').css('display','none');
                                });
                            } else {
                                $('#whoID_' + item.YodleeLineID).val(data.tsupplier[0].fields.ID);
                            }
                        }).catch(function (err) {

                        });
                    }
                }
            }
            if (item.VS1Notes.trim() != "") {
                $('#discussNav_'+item.YodleeLineID+ ' a').text('Discuss*');
            }
            if (item.deporwith == "received") {
                $('#who_'+item.YodleeLineID).attr("placeholder", "Choose the customer...");
                $('#labelSender_'+item.YodleeLineID).text("Customer");
                $('#sender_'+item.YodleeLineID).attr("placeholder", "Choose the customer...");
            } else {
                $('#who_'+item.YodleeLineID).attr("placeholder", "Choose the supplier...");
                $('#labelSender_'+item.YodleeLineID).text("Supplier");
                $('#sender_'+item.YodleeLineID).attr("placeholder", "Choose the supplier...");
            }
            $('#btnAddDetail_'+item.YodleeLineID).on('click', function(e, li) {
                openTransactionDetail(item);
            });
            $('#matchNav_'+item.YodleeLineID+' a.nav-link').on('click', function(e, li) {
                if (!item.matched) {
                    initVS1Transaction();
                    openFindMatch(item);
                }
            });
            $('#btnFindMatch_'+item.YodleeLineID).on('click', function(e, li) {
                // $('#matchNav_'+item.YodleeLineID+' a.nav-link').trigger('click');
                initVS1Transaction();
                openFindMatch(item);
            });
            $('#btnFindMatch2_'+item.YodleeLineID).on('click', function(e, li) {
                if (!item.matched) {
                    initVS1Transaction();
                    openFindMatch(item);
                }
            });
            $('#btnMoreDetail_'+item.YodleeLineID).on('click', function(e, li) {
                $('#mdTransactionDate').text(item.YodleeTransactionDate);
                $('#mdCategory').text(item.YodleeCategory);
                $('#mdCategoryType').text(item.YodleeCategoryType);
                $('#mdDescription').text(item.YodleeDescription);
                $('#mdTransactionAmount').text(item.YodleeAmount);
                $('#mdTransactionType').text(item.YodleeBaseType);
                $('#mdChequeNo').text(item.YodleeCheckNumber);
                $('#mdType').text(item.YodleeType);
                $('#moreDetailModal').modal('show');
            });
            $('#btnDeleteLine_'+item.YodleeLineID).on('click', function(e, li) {
                $('#divLine_'+item.YodleeLineID).hide();
            });
            // $('#discussText_'+item.YodleeLineID).on('change', function(e, li) {
            //     $('#btnSaveDiscuss_'+item.YodleeLineID).show();
            // });
            $('#discussText_'+item.YodleeLineID).on('keydown', function(e, li) {
                const discussText = $(this).val() || "";
                if (discussText.trim() != "") {
                    $('#btnSaveDiscuss_' + item.YodleeLineID).show();
                } else {
                    $('#btnSaveDiscuss_' + item.YodleeLineID).hide();
                }
            });
            $('#btnSaveDiscuss_' + item.YodleeLineID).on('click', function(e, li) {
                const discussText = $('#discussText_'+item.YodleeLineID).val() || "";
                if (discussText.trim() != "") {
                    saveDiscuss(discussText, item.YodleeLineID);
                }
            });
            $('#chkSOR_' + item.YodleeLineID).on('click', function(e, li) {
                $("#divLineFindMatch_"+item.YodleeLineID+" #btnGoSearch").trigger('click');
            });
        })
    }
    function editableWho(item, $each, e) {
        const offset = $each.offset();
        if (item.deporwith == "received") {
            selectedCustomerFlag = 'ForTab';
            $('#edtCustomerPOPID').val('');
            //$('#edtCustomerCompany').attr('readonly', false);
            const customerDataName = e.target.value || '';
            if (e.pageX > offset.left + $each.width() - 8) { // X button 16px wide?
                openCustomerModal();
            } else {
                if (customerDataName.replace(/\s/g, '') != '') {
                    //FlowRouter.go('/customerscard?name=' + e.target.value);
                    $('#edtCustomerPOPID').val('');
                    getVS1Data('TCustomerVS1').then(function (dataObject) {
                        if (dataObject.length == 0) {
                            setOneCustomerDataExByName(customerDataName);
                        } else {
                            let data = JSON.parse(dataObject[0].data);
                            let useData = data.tcustomervs1;
                            let added = false;
                            for (let i = 0; i < useData.length; i++) {
                                if (useData[i].fields.ClientName == customerDataName) {
                                    setCustomerModal(useData[i]);
                                }
                            }
                            if (!added) {
                                setOneCustomerDataExByName(customerDataName);
                            }
                        }
                    }).catch(function (err) {
                        setOneCustomerDataExByName(customerDataName);
                    });
                } else {
                    openCustomerModal();
                }
            }
        }
        if (item.deporwith == "spent") {
            const supplierDataName = e.target.value || '';
            if (e.pageX > offset.left + $each.width() - 8) { // X button 16px wide?
                openSupplierModal();
            } else {
                if (supplierDataName.replace(/\s/g, '') != '') {
                    getVS1Data('TSupplierVS1').then(function (dataObject) {
                        if (dataObject.length == 0) {
                            setOneSupplierDataExByName(supplierDataName);
                        } else {
                            let data = JSON.parse(dataObject[0].data);
                            let useData = data.tsuppliervs1;
                            let added = false;
                            for (let i = 0; i < useData.length; i++) {
                                if (useData[i].fields.ClientName == supplierDataName) {
                                    setSupplierModal(useData[i]);
                                }
                            }
                            if (!added) {
                                setOneSupplierDataExByName(supplierDataName);
                            }
                        }
                    }).catch(function (err) {
                        setOneSupplierDataExByName(supplierDataName);
                    });
                } else {
                    openSupplierModal();
                }
            }
        }
    }
    // function editableWhat() {
    //
    // }
    function initVS1Transaction() {
        if (viewTransactionList.length == 0) {
            matchTransactionList = VS1TransactionList;
        }
        templateObject.matchTransactionData.set(matchTransactionList);
        templateObject.viewTransactionData.set(viewTransactionList);
    }

    $(document).on("click", ".newbankrecon #tblAccount tbody tr", function(e) {
        $(".colAccountName").removeClass('boldtablealertsborder');
        $(".colAccount").removeClass('boldtablealertsborder');
        const table = $(this);
        let accountname = table.find(".productName").text();
        let accountId = table.find(".colAccountID").text();
        $('#bankAccountListModal').modal('toggle');
        if (selectedAccountFlag == 'ForBank') {
            $('#bankAccountName').val(accountname);
            $('#bankAccountID').val(accountId);
            showBankInfo();
            if (accountId != "") {
                bankaccountid = accountId;
                bankaccountname = accountname;
                if (bankaccountid != Session.get('bankaccountid')) {
                    Session.setPersistent('bankaccountid', accountId);
                    Session.setPersistent('bankaccountname', accountname);
                    // setTimeout(function () {
                    //     Session.setPersistent('bankaccountid', accountId);
                    //     Session.setPersistent('bankaccountname', accountname);
                    //     window.open('/newbankrecon', '_self');
                    // }, 500);
                }
            }
        } else if (selectedAccountFlag == 'ForTransfer') {
            if (accountId != "") {
                $('#transferAccount_'+selectedYodleeID).val(accountname);
            }
        } else if (selectedAccountFlag == 'ForWhat') {
            if (accountId != "") {
                $('#what_'+selectedYodleeID).val(accountname);
                $('#whatTaxCode_' + selectedYodleeID).val($(this).find(".taxrate").text());
            }
        } else {

        }
        $('#tblAccount_filter .form-control-sm').val('');
    });
    $(document).on("click", ".newbankrecon #tblFullAccount tbody tr", function(e) {
        $(".colAccountName").removeClass('boldtablealertsborder');
        $(".colAccount").removeClass('boldtablealertsborder');
        $('#fullAccountListModal').modal('toggle');
        if (selectedLineID) {
            let lineAccountID = $(this).find(".colID").text();
            let lineAccountName = $(this).find(".productName").text();
            let lineProductDesc = $(this).find(".productDesc").text();
            let lineTaxCode = $(this).find(".taxrate").text();
            $('#divLineDetail_'+selectedYodleeID+' #' + selectedLineID + " .lineAccountName").val(lineAccountName);
            $('#divLineDetail_'+selectedYodleeID+' #' + selectedLineID + " .lineAccountID").val(lineAccountID);
            $('#divLineDetail_'+selectedYodleeID+' #' + selectedLineID + " .lineProductDesc").val(lineProductDesc);
            $('#divLineDetail_'+selectedYodleeID+' #' + selectedLineID + " .lineTaxRate").val(lineTaxCode);
        }
        setCalculated();
        $('#tblFullAccount_filter .form-control-sm').val('');
    });
    $(document).on("click", ".newbankrecon #tblCustomerlist tbody tr", function (e) {
        $('#customerListModal').modal('toggle');
        if (selectedCustomerFlag == "ForTab") {
            // $('#whatID_'+selectedYodleeID).val(parseInt($(this).find(".colID").text()));
            $('#whoID_'+selectedYodleeID).val($(this).find(".colID").text());
            $('#who_'+selectedYodleeID).val($(this).find(".colCompany").text());
            $('#sender_'+selectedYodleeID).val($(this).find(".colCompany").text());
        } else {
            if (selectedLineID) {
                let lineCustomerID = $(this).find(".colID").text();
                let lineCustomerName = $(this).find(".colCompany").text();
                $('#divLineDetail_'+selectedYodleeID+' #' + selectedLineID + " .lineCustomerName").val(lineCustomerName);
                $('#divLineDetail_'+selectedYodleeID+' #' + selectedLineID + " .lineCustomerID").val(lineCustomerID);
            }
        }
    });
    $(document).on("click", ".newbankrecon #tblSupplierlist tbody tr", function (e) {
        $('#supplierListModal').modal('toggle');
        $('#whoID_'+selectedYodleeID).val($(this).find(".colID").text());
        $('#who_'+selectedYodleeID).val($(this).find(".colCompany").text());
        $('#sender_'+selectedYodleeID).val($(this).find(".colCompany").text());
        setCalculated();
    });
    $(document).on("click", ".newbankrecon #tblTaxRate tbody tr", function (e) {
        $('#taxRateListModal').modal('toggle');
        if (selectedTaxFlag == "ForTab") {
            $('#ctaxRateID_'+selectedYodleeID).val(parseInt($(this).find(".sorting_1").text()));
            // $('#ctaxRateID_' + selectedYodleeID).val($(this).find(".taxName").text());
            $('#ctaxRate_' + selectedYodleeID).val($(this).find(".taxName").text());
        } else {
            if (selectedLineID) {
                let lineTaxRate = $(this).find(".taxName").text();
                $('#divLineDetail_'+selectedYodleeID+' #' + selectedLineID + " .lineTaxRate").val(lineTaxRate);
            }
            setCalculated();
        }
    });
    $(document).on("click", ".newbankrecon #tblInventory tbody tr", function (e) {
        $(".colProductName").removeClass('boldtablealertsborder');
        const trow = $(this);
        if (selectedYodleeID && selectedLineID) {
            let lineProductName = trow.find(".productName").text();
            let lineProductDesc = trow.find(".productDesc").text();
            let lineUnitPrice = trow.find(".salePrice").text();
            let lineTaxRate = trow.find(".taxrate").text();
            $('#divLineDetail_'+selectedYodleeID+' #' + selectedLineID + " .lineProductName").val(lineProductName);
            $('#divLineDetail_'+selectedYodleeID+' #' + selectedLineID + " .lineProductDesc").val(lineProductDesc);
            $('#divLineDetail_'+selectedYodleeID+' #' + selectedLineID + " .lineQty").val(1);
            $('#divLineDetail_'+selectedYodleeID+' #' + selectedLineID + " .lineUnitPrice").val(lineUnitPrice);
            $('#divLineDetail_'+selectedYodleeID+' #' + selectedLineID + " .lineTaxRate").val(lineTaxRate);
            $('#productListModal').modal('toggle');
        }
        setCalculated();
    });
});

Template.newbankrecon.events({
    'click .btnReconTransactionDetail': function() {
        FlowRouter.go('/recontransactiondetail');
        // window.open('/recontransactiondetail', '_self');
    },
    'click .btnPageStart': function() {
        let sort = Template.instance().sort_param.get();
        window.open('/newbankrecon?page=1'+sort, '_self');
    },
    'click .btnPageEnd': function() {
        let sort = (Template.instance().sort.get() != '')?'&sort='+Template.instance().sort.get():'';
        window.open('/newbankrecon?page='+Template.instance().page_count.get()+sort, '_self');
    },
    'click .btnPagePrev': function() {
        let sort = (Template.instance().sort.get() != '')?'&sort='+Template.instance().sort.get():'';
        let prev_page = (Template.instance().page_number.get() <= 1)? 1: parseInt(Template.instance().page_number.get()) - 1;
        window.open('/newbankrecon?page='+prev_page+sort, '_self');
    },
    'click .btnPageNext': function() {
        let sort = (Template.instance().sort.get() != '')?'&sort='+Template.instance().sort.get():'';
        let next_page = (Template.instance().page_number.get() >= Template.instance().page_count.get())? Template.instance().page_count.get(): parseInt(Template.instance().page_number.get()) + 1;
        window.open('/newbankrecon?page='+next_page+sort, '_self');
    },
    'click .sortDepositSpent': function() {
        let sort = '';
        if (Template.instance().sort.get() == "descDepositSpent") {
            sort = "ascDepositSpent";
        } else {
            sort = "descDepositSpent";
        }
        window.open('/newbankrecon?sort='+sort, '_self');
    },
    'click .sortDepositReceived': function() {
        let sort = '';
        if (Template.instance().sort.get() == "descDepositReceived") {
            sort = "ascDepositReceived";
        } else {
            sort = "descDepositReceived";
        }
        window.open('/newbankrecon?sort='+sort, '_self');
    },
    'click .sortWithdrawSpent': function() {
        let sort = '';
        if (Template.instance().sort.get() == "descWithdrawSpent") {
            sort = "ascWithdrawSpent";
        } else {
            sort = "descWithdrawSpent";
        }
        window.open('/newbankrecon?sort='+sort, '_self');
    },
    'click .sortWithdrawReceived': function() {
        let sort = '';
        if (Template.instance().sort.get() == "descWithdrawReceived") {
            sort = "ascWithdrawReceived";
        } else {
            sort = "descWithdrawReceived";
        }
        window.open('/newbankrecon?sort='+sort, '_self');
    },
    'click .btnAddNewAccount': function(event) {
        $('#add-account-title').text('Add New Account');
        $('#edtAccountID').val('');
        $('#sltAccountType').val('');
        $('#sltAccountType').removeAttr('readonly', true);
        $('#sltAccountType').removeAttr('disabled', 'disabled');
        $('#edtAccountName').val('');
        $('#edtAccountName').attr('readonly', false);
        $('#edtAccountNo').val('');
        $('#sltTaxCode').val('NT' || '');
        $('#txaAccountDescription').val('');
        $('#edtBankAccountName').val('');
        $('#edtBSB').val('');
        $('#edtBankAccountNo').val('');
        $('#routingNo').val('');
        $('#edtBankName').val('');
        $('#swiftCode').val('');
        $('.showOnTransactions').prop('checked', false);
        $('.isBankAccount').addClass('isNotBankAccount');
        $('.isCreditAccount').addClass('isNotCreditAccount');
    },
    'click .btnRefreshAccount': function (event) {
        $('.fullScreenSpin').css('display', 'inline-block');
        const splashArrayAccountList = [];
        let utilityService = new UtilityService();
        let sideBarService = new SideBarService();
        let dataSearchName = $('#tblFullAccount_filter input').val();
        if (dataSearchName.replace(/\s/g, '') !== '') {
            sideBarService.getAllAccountDataVS1ByName(dataSearchName).then(function (data) {
                let lineItems = [];
                let lineItemObj = {};
                if (data.taccountvs1.length > 0) {
                    for (let i = 0; i < data.taccountvs1.length; i++) {
                        const dataList = [
                            data.taccountvs1[i].fields.AccountName || '-',
                            data.taccountvs1[i].fields.Description || '',
                            data.taccountvs1[i].fields.AccountNumber || '',
                            data.taccountvs1[i].fields.AccountTypeName || '',
                            utilityService.modifynegativeCurrencyFormat(Math.floor(data.taccountvs1[i].fields.Balance * 100) / 100) || 0,
                            data.taccountvs1[i].fields.TaxCode || '',
                            data.taccountvs1[i].fields.ID || ''
                        ];
                        splashArrayAccountList.push(dataList);
                    }
                    const datatable = $('#tblFullAccount').DataTable();
                    datatable.clear();
                    datatable.rows.add(splashArrayAccountList);
                    datatable.draw(false);
                    $('.fullScreenSpin').css('display', 'none');
                } else {
                    $('.fullScreenSpin').css('display', 'none');
                    $('#accountListModal').modal('toggle');
                    swal({
                        title: 'Question',
                        text: "Account does not exist, would you like to create it?",
                        type: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Yes',
                        cancelButtonText: 'No'
                    }).then((result) => {
                        if (result.value) {
                            $('#addAccountModal').modal('toggle');
                            $('#edtAccountName').val(dataSearchName);
                        } else if (result.dismiss === 'cancel') {
                            $('#accountListModal').modal('toggle');
                        }
                    });
                }
            }).catch(function (err) {
                $('.fullScreenSpin').css('display', 'none');
            });
        } else {
            sideBarService.getAccountListVS1().then(function(data) {
                for (let i = 0; i < data.taccountvs1.length; i++) {
                    const dataList = [
                        data.taccountvs1[i].fields.AccountName || '-',
                        data.taccountvs1[i].fields.Description || '',
                        data.taccountvs1[i].fields.AccountNumber || '',
                        data.taccountvs1[i].fields.AccountTypeName || '',
                        utilityService.modifynegativeCurrencyFormat(Math.floor(data.taccountvs1[i].fields.Balance * 100) / 100),
                        data.taccountvs1[i].fields.TaxCode || '',
                        data.taccountvs1[i].fields.ID || ''
                    ];
                    splashArrayAccountList.push(dataList);
                }
                const datatable = $('#tblFullAccount').DataTable();
                datatable.clear();
                datatable.rows.add(splashArrayAccountList);
                datatable.draw(false);
                $('.fullScreenSpin').css('display', 'none');
            }).catch(function (err) {
                $('.fullScreenSpin').css('display', 'none');
            });
        }
    },
    'keyup #tblFullAccount_filter input': function (event) {
        if (event.keyCode === 13) {
            $(".btnRefreshAccount").trigger("click");
        }
    },
    'click .lineProductName, keydown .lineProductName': function (event) {
        selectedLineID = $(event.target).closest('tr').attr('id');
        const $each = $(event.currentTarget);
        const offset = $each.offset();
        $("#selectProductID").val('');
        const productDataName = $(event.target).val() || '';
        if (event.pageX > offset.left + $each.width() - 10) { // X button 16px wide?
            openProductListModal();
        } else {
            if (productDataName.replace(/\s/g, '') != '') {
                $('.fullScreenSpin').css('display', 'inline-block');
                getVS1Data('TProductVS1').then(function (dataObject) {
                    if (dataObject.length == 0) {
                        setOneProductDataByName(productDataName);
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        let added = false;
                        for (let i = 0; i < data.tproductvs1.length; i++) {
                            if (data.tproductvs1[i].fields.ProductName == productDataName) {
                                added = true;
                                $('.fullScreenSpin').css('display', 'none');
                                setProductNewModal(data.tproductvs1[i]);
                                setTimeout(function () {
                                    $('#newProductModal').modal('show');
                                }, 500);
                            }
                        }
                        if (!added) {
                            setOneProductDataByName(productDataName);
                        }
                    }
                }).catch(function (err) {
                    setOneProductDataByName(productDataName);
                });
                setTimeout(function () {
                    // WangYan: where are these element - dtDateTo, dtDateFrom
                    $("#dtDateTo").datepicker({
                        showOn: 'button',
                        buttonText: 'Show Date',
                        buttonImageOnly: true,
                        buttonImage: '/img/imgCal2.png',
                        constrainInput: false,
                        dateFormat: 'd/mm/yy',
                        showOtherMonths: true,
                        selectOtherMonths: true,
                        changeMonth: true,
                        changeYear: true,
                        yearRange: "-90:+10",
                    }).keyup(function (e) {
                        if (e.keyCode == 8 || e.keyCode == 46) {
                            $("#dtDateTo,#dtDateFrom").val('');
                        }
                    });

                    $("#dtDateFrom").datepicker({
                        showOn: 'button',
                        buttonText: 'Show Date',
                        altField: "#dtDateFrom",
                        buttonImageOnly: true,
                        buttonImage: '/img/imgCal2.png',
                        constrainInput: false,
                        dateFormat: 'd/mm/yy',
                        showOtherMonths: true,
                        selectOtherMonths: true,
                        changeMonth: true,
                        changeYear: true,
                        yearRange: "-90:+10",
                    }).keyup(function (e) {
                        if (e.keyCode == 8 || e.keyCode == 46) {
                            $("#dtDateTo,#dtDateFrom").val('');
                        }
                    });

                    $(".ui-datepicker .ui-state-hihglight").removeClass("ui-state-highlight");

                }, 1000);
            } else {
                openProductListModal();
            }
        }
    },
    'click .lineAccountName, keydown .lineAccountName': function (event) {
        selectedCustomerFlag = "ForDetail";
        selectedLineID = $(event.target).closest('tr').attr('id');
        const $each = $(event.currentTarget);
        const offset = $each.offset();
        $('#edtAccountID').val('');
        const accountName = event.target.value || '';
        if (event.pageX > offset.left + $each.width() - 8) { // X button 16px wide?
            openFullAccountModal();
        } else {
            if (accountName.replace(/\s/g, '') != '') {
                $('#edtAccountID').val('');
                getVS1Data('TAccountVS1').then(function (dataObject) {
                    if (dataObject.length == 0) {
                        setOneAccountByName(accountName);
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        let useData = data.taccountvs1;
                        let added = false;
                        for (let i = 0; i < useData.length; i++) {
                            if (useData[i].fields.AccountName == accountName) {
                                setBankAccountData(useData[i]);
                            }
                        }
                        if (!added) {
                            setOneAccountByName(accountName);
                        }
                    }
                }).catch(function (err) {
                    setOneAccountByName(accountName);
                });
            } else {
                openFullAccountModal();
            }
        }
    },
    'click .lineCustomerName, keydown .lineCustomerName': function (event) {
        selectedCustomerFlag = "ForDetail";
        selectedLineID = $(event.target).closest('tr').attr('id');
        const $each = $(event.currentTarget);
        const offset = $each.offset();
        $('#edtCustomerPOPID').val('');
        //$('#edtCustomerCompany').attr('readonly', false);
        const customerDataName = event.target.value || '';
        if (event.pageX > offset.left + $each.width() - 8) { // X button 16px wide?
            openCustomerModal();
        } else {
            if (customerDataName.replace(/\s/g, '') != '') {
                //FlowRouter.go('/customerscard?name=' + e.target.value);
                $('#edtCustomerPOPID').val('');
                getVS1Data('TCustomerVS1').then(function (dataObject) {
                    if (dataObject.length == 0) {
                        setOneCustomerDataExByName(customerDataName);
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        let useData = data.tcustomervs1;
                        let added = false;
                        for (let i = 0; i < useData.length; i++) {
                            if (useData[i].fields.ClientName == customerDataName) {
                                setCustomerModal(useData[i]);
                            }
                        }
                        if (!added) {
                            setOneCustomerDataExByName(customerDataName);
                        }
                    }
                }).catch(function (err) {
                    setOneCustomerDataExByName(customerDataName);
                });
            } else {
                openCustomerModal();
            }
        }
    },
    'click .lineTaxRate, keydown .lineTaxRate': function (event) {
        selectedTaxFlag = "ForDetail";
        selectedLineID = $(event.target).closest('tr').attr('id');
        const $each = $(event.currentTarget);
        const offset = $each.offset();
        const taxRateDataName = event.target.value || "";
        if (event.pageX > offset.left + $each.width() - 8) {
            // X button 16px wide?
            $("#taxRateListModal").modal("toggle");
        } else {
            if (taxRateDataName.replace(/\s/g, "") != "") {
                $(".taxcodepopheader").text("Edit Tax Rate");
                getVS1Data("TTaxcodeVS1").then(function (dataObject) {
                    if (dataObject.length == 0) {
                        setTaxCodeVS1(taxRateDataName);
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        $(".taxcodepopheader").text("Edit Tax Rate");
                        setTaxRateData(data, taxRateDataName);
                    }
                }).catch(function (err) {
                    setTaxCodeVS1(taxRateDataName);
                });
            } else {
                $("#taxRateListModal").modal("toggle");
            }
        }
    },
    'keydown .lineQty, keydown .lineUnitPrice': function (event) {
        selectedLineID = $(event.target).closest('tr').attr('id');
        if ($.inArray(event.keyCode, [46, 8, 9, 27, 13, 110]) != -1 ||
            (event.keyCode == 65 && (event.ctrlKey == true || event.metaKey == true)) ||
            (event.keyCode >= 35 && event.keyCode <= 40)) {
            return;
        }
        if (event.shiftKey == true) {
            event.preventDefault();
        }
        if ((event.keyCode >= 48 && event.keyCode <= 57) ||
            (event.keyCode >= 96 && event.keyCode <= 105) ||
            event.keyCode == 8 || event.keyCode == 9 ||
            event.keyCode == 37 || event.keyCode == 39 ||
            event.keyCode == 46 || event.keyCode == 190 || event.keyCode == 189 || event.keyCode == 109) {

        }
        else {
            event.preventDefault();
        }
    },
    'change .lineQty': function (event) {
        selectedLineID = $(event.target).closest('tr').attr('id');
        let qty = parseInt($(event.target).val()) || 0;
        $(event.target).val(qty);
        setCalculated(taxcodeList, customerList);
    },
    'change .lineUnitPrice': function (event) {
        selectedLineID = $(event.target).closest('tr').attr('id');
        setCurrencyFormatForInput(event.target);
        setCalculated();
    },
    'change .lineAmountInput': function (event) {
        selectedLineID = $(event.target).closest('tr').attr('id');
        setCurrencyFormatForInput(event.target);
        setCalculated();
    },
    'change #taxOption': function (event) {
        setCalculated();
    },
    'change #TotalAmount': function (event) {
        setCurrencyFormatForInput(event.target);
    },
    'click .btnRemove': function (event) {
        selectedLineID = null;
        $(event.target).closest('tr').remove();
        event.preventDefault();
        setCalculated();
    },
    'click #btnCancel': function() {
        playCancelAudio();
        setTimeout(function(){
        closeTransactionDetail();
        }, delayTimeAfterSound);
    },
    'click #addLine': function() {
        if (selectedYodleeID) {
            const rowData = $("#divLineDetail_"+selectedYodleeID+" #tblReconInvoice tbody>tr:last").clone(true);
            let DepOrWith = $("#DepOrWith_"+selectedYodleeID).val();
            let PaymentType = $("#PaymentType_"+selectedYodleeID).val();
            let tokenid = Random.id();

            $(".lineAccountName", rowData).val("");
            $(".lineAccountID", rowData).val("");
            $(".lineProductName", rowData).val("");
            $(".lineProductDesc", rowData).val("");
            $(".lineQty", rowData).val("");
            $(".lineUnitPrice", rowData).val("");
            $(".lineSubTotal", rowData).text("");
            $(".lineAmountInput", rowData).val("");
            $(".lineCustomerName", rowData).val("");
            $(".lineCustomerID", rowData).val("");
            $(".lineDiscount", rowData).text("");
            $(".lineTaxRate", rowData).val("");
            $(".lineTaxAmount", rowData).text("");
            $(".lineAmount", rowData).text("");
            $(".btnRemove", rowData).show();
            rowData.attr('id', tokenid);
            $("#divLineDetail_"+selectedYodleeID+" #tblReconInvoice tbody").append(rowData);
            setTimeout(function () {
                if (PaymentType == "Invoice" || PaymentType == "Purchase Order") {
                    $("#divLineDetail_"+selectedYodleeID+" #" + tokenid + " .lineProductName").trigger('click');
                } else {
                    $("#divLineDetail_"+selectedYodleeID+" #" + tokenid + " .lineAccountName").trigger('click');
                }
            }, 200);
        }
    },
    'click #btnSave': function (event) {
        if (selectedYodleeID) {
            let purchaseService = new PurchaseBoardService();
            let paymentService = new PaymentsService();
            let salesService = new SalesBoardService();
            let match_total = Number($("#divLineDetail_"+selectedYodleeID+" #TotalAmount").val().replace(/[^0-9.-]+/g, "")) || 0;
            let grand_total = Number($("#divLineDetail_"+selectedYodleeID+" .grand_total").text().replace(/[^0-9.-]+/g, "")) || 0;
            if (match_total != grand_total) {
                swal('The totals do not match.', '', 'error');
                $("#divLineDetail_"+selectedYodleeID+" #TotalAmount").focus();
                return false;
            }
            let employeeID = Session.get('mySessionEmployeeLoggedID');
            let employeename = Session.get('mySessionEmployee');
            let DepOrWith = $("#DepOrWith_"+selectedYodleeID).val();
            let PaymentType = $("#PaymentType_"+selectedYodleeID).val();
            let clientID = $("#whoID_"+selectedYodleeID).val();
            let clientName = $("#sender_"+selectedYodleeID).val();
            let reconNote = $('#YNote_'+selectedYodleeID).val();
            let discussNote = $("#discussText_"+selectedYodleeID).val();
            let reconcileID = $("#reconID_"+selectedYodleeID).val();
            reconcileID = (reconcileID && reconcileID != '')?parseInt(reconcileID):0;
            let paymentID = $("#paymentID_"+selectedYodleeID).val();
            paymentID = (paymentID && paymentID != '')?parseInt(paymentID):0;
            paymentID = 0; // Now keep 0 ???
            let resultPaymentID;
            let clientDetail = null;
            let defaultTermsName = '';
            if (DepOrWith == "spent") {
                defaultTermsName = Template.instance().defaultSupplierTerms.get();
                clientDetail = getClientDetail(clientName, 'supplier');
                if (!clientDetail) {
                    swal('Supplier must be vaild.', '', 'error');
                    $("#sender_"+selectedYodleeID).focus();
                    return false;
                }
            }
            if (DepOrWith == "received") {
                defaultTermsName = Template.instance().defaultCustomerTerms.get();
                clientDetail = getClientDetail(clientName, 'customer');
                if (!clientDetail) {
                    swal('Customer must be vaild.', '', 'error');
                    $("#sender_"+selectedYodleeID).focus();
                    return false;
                }
            }

            let clientShippingAddress = clientName + '\n' + clientDetail.street + '\n' + clientDetail.street2 + ' ' + clientDetail.statecode + '\n' + clientDetail.country;
            let clientBillingAddress = clientName + '\n' + clientDetail.billstreet + '\n' + clientDetail.billstreet2 + ' ' + clientDetail.billstatecode + '\n' + clientDetail.billcountry;
            let clientTermsName = clientDetail.termsName?clientDetail.termsName:defaultTermsName;
            $('.fullScreenSpin').css('display', 'inline-block');
            let bankaccountid = parseInt(Session.get('bankaccountid'));
            let bankAccountName = (Session.get("bankaccountname") != undefined && Session.get("bankaccountname") != '')?Session.get("bankaccountname"):null;
            let refText = $("#divLineDetail_"+selectedYodleeID+" #reference").val();
            let dateIn = $("#DateIn_"+selectedYodleeID).val() || '';
            let splitDate = dateIn.split("/");
            let withYear = splitDate[2];
            let withMonth = splitDate[1];
            let withDay = splitDate[0];
            let invoiceDate = withYear + "-" + withMonth + "-" + withDay;
            let comment = $("#divLineDetail_"+selectedYodleeID+" #textComment").val();

            let lineItems = [];
            let lineItemsObj = {};
            if (DepOrWith == "received") {
                // Received: invoice->customer payment->reconciliation deposit
                $("#divLineDetail_"+selectedYodleeID+" #tblReconInvoice > tbody > tr").each(function () {
                    let lineID = this.id;
                    let lineProductName = $("#divLineDetail_"+selectedYodleeID+" #" + lineID + " .lineProductName").val();
                    let lineProductDesc = $("#divLineDetail_"+selectedYodleeID+" #" + lineID + " .lineProductDesc").val();
                    let lineQty = $("#divLineDetail_"+selectedYodleeID+" #" + lineID + " .lineQty").val();
                    let lineUnitPrice = $("#divLineDetail_"+selectedYodleeID+" #" + lineID + " .lineUnitPrice").val();
                    let lineTaxRate = $("#divLineDetail_"+selectedYodleeID+" #" + lineID + " .lineTaxRate").val();
                    let lineAmount = $("#divLineDetail_"+selectedYodleeID+" #" + lineID + " .lineAmount").text();
                    lineAmount = Number(lineAmount.replace(/[^0-9.-]+/g, "")) || 0;
                    let lineDiscount = $("#divLineDetail_"+selectedYodleeID+" #" + lineID + " .lineDiscount").text();
                    lineItemsObj = {
                        type: "TInvoiceLine",
                        fields: {
                            ProductName: lineProductName || '',
                            ProductDescription: lineProductDesc || '',
                            UOMQtySold: parseFloat(lineQty) || 0,
                            UOMQtyShipped: parseFloat(lineQty) || 0,
                            LinePrice: Number(lineUnitPrice.replace(/[^0-9.-]+/g, "")) || 0,
                            Headershipdate: invoiceDate,
                            LineTaxCode: lineTaxRate || '',
                            DiscountPercent: parseFloat(lineDiscount) || 0
                        }
                    };
                    lineItems.push(lineItemsObj);
                });
                let objINVDetails = {
                    type: "TInvoiceEx",
                    fields: {
                        CustomerName: clientName,
                        ForeignExchangeCode: CountryAbbr,
                        Lines: lineItems,
                        InvoiceToDesc: clientBillingAddress,
                        SaleDate: invoiceDate,
                        // CustPONumber: poNumber,
                        ReferenceNo: refText,
                        TermsName: clientTermsName || '',
                        SaleClassName: defaultDept,
                        ShipToDesc: clientShippingAddress,
                        Comments: comment || '',
                        SalesStatus: ''
                    }
                };
                salesService.saveInvoiceEx(objINVDetails).then(function (resultINV) {
                    if (resultINV.fields.ID) {
                        let paymentData = [];
                        const lineID = resultINV.fields.ID;
                        let Line = {
                            type: 'TGuiCustPaymentLines',
                            fields: {
                                TransType: "Invoice",
                                TransID: parseInt(lineID) || 0,
                                Paid: true,
                                Payment: grand_total
                            }
                        };
                        paymentData.push(Line);
                        let objPaymentDetails = {
                            type: "TCustPayments",
                            fields: {
                                ID: paymentID,
                                Deleted: false,
                                ClientPrintName: clientName,
                                CompanyName: clientName,
                                DeptClassName: defaultDept,
                                EmployeeID: parseInt(employeeID) || 0,
                                EmployeeName: employeename || '',
                                GUILines: paymentData,
                                Notes: comment || '',
                                Payment: true,
                                PaymentDate: invoiceDate,
                                PayMethodName: "Direct Deposit",
                                ReferenceNo: refText || '',
                                AccountID: bankaccountid || 0,
                                AccountName: bankAccountName || '',
                            }
                        };
                        paymentService.saveDepositData(objPaymentDetails).then(function(resultPayment) {
                            if (resultPayment.fields.ID) {
                                resultPaymentID = resultPayment.fields.ID;
                                let lineReconObj = {
                                    type: "TReconciliationDepositLines",
                                    fields: {
                                        AccountID: bankaccountid || 0,
                                        AccountName: bankAccountName || '',
                                        Amount: grand_total,
                                        BankStatementLineID: selectedYodleeID,
                                        ClientID: clientID,
                                        ClientName: clientName,
                                        DepositDate: invoiceDate,
                                        Deposited: true,
                                        Notes: reconNote || '',
                                        PaymentID: resultPayment.fields.ID,
                                        Payee: '',
                                        Reconciled: false,
                                        Reference: refText || ''
                                    }
                                };
                                let reconData = [];
                                reconData.push(lineReconObj);
                                let objReconDetails = {
                                    type: "TReconciliation",
                                    fields: {
                                        ID: reconcileID,
                                        AccountID: bankaccountid || 0,
                                        AccountName: bankAccountName || '',
                                        // CloseBalance: closebalance,
                                        Deleted: false,
                                        DepositLines: reconData || '',
                                        DeptName: defaultDept,
                                        EmployeeID: parseInt(employeeID) || 0,
                                        EmployeeName: employeename || '',
                                        Finished: true,
                                        Notes: discussNote || '',
                                        OnHold: false,
                                        // OpenBalance: openbalance,
                                        ReconciliationDate: invoiceDate,
                                        StatementNo: selectedYodleeID.toString() || '0',
                                        WithdrawalLines: null
                                    }
                                };
                                reconService.saveReconciliation(objReconDetails).then(function (resultRecon) {
                                    if (resultRecon.fields.ID) {
                                        let newObj = {
                                            ID: 'dnew',
                                            VS1Date: moment(invoiceDate).format("DD/MM/YYYY"),
                                            SortDate: moment(invoiceDate).format("YYYY-MM-DD"),
                                            CompanyName: clientName,
                                            PaymentType: 'Customer Payment',
                                            Amount: grand_total,
                                            DepositID: '',
                                            ReferenceNo: '',
                                            Seqno: 0,
                                            PaymentID: paymentID,
                                            DepositLineID: 0,
                                            CusID: clientID,
                                            StatementLineID: 0,
                                            StatementTransactionDate: '',
                                            StatementAmount: 0,
                                            StatementDescription: '',
                                            deporwith: 'received',
                                            spentVS1Amount: utilityService.modifynegativeCurrencyFormat(0),
                                            receivedVS1Amount: utilityService.modifynegativeCurrencyFormat(grand_total),
                                        };
                                        let newData = [];
                                        newData.push(newObj);
                                        matchTransactionList = newData;
                                        viewTransactionList = newData;
                                        VS1TransactionList.push(newObj);
                                        VS1TransactionList = sortTransactionData(VS1TransactionList, 'SortDate');
                                        openFindMatchAfterSave(resultRecon.fields.ID, 'dnew');
                                        $('.fullScreenSpin').css('display', 'none');
                                    } else {
                                        $('.fullScreenSpin').css('display', 'none');
                                    }
                                }).catch(function (err) {
                                    handleSaveError(err);
                                });
                            } else {
                                $('.fullScreenSpin').css('display', 'none');
                            }
                        }).catch(function(err) {
                            handleSaveError(err);
                        });
                    } else {
                        $('.fullScreenSpin').css('display', 'none');
                    }
                }).catch(function (err) {
                    handleSaveError(err);
                });
            }
            if (DepOrWith == "spent") {
                // spent: purchase order->supplier payment->Reconciliation withdrawal
                // spent: bill->supplier payment->Reconciliation withdrawal
                // spent: cheque->Reconciliation withdrawal
                let isEmptyAccount = false;
                $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice > tbody > tr").each(function () {
                    let lineID = this.id;
                    let lineProductName = $("#divLineDetail_" + selectedYodleeID + " #" + lineID + " .lineProductName").val();
                    let lineProductDesc = $("#divLineDetail_" + selectedYodleeID + " #" + lineID + " .lineProductDesc").val();
                    let lineQty = $("#divLineDetail_" + selectedYodleeID + " #" + lineID + " .lineQty").val();
                    let lineUnitPrice = $("#divLineDetail_" + selectedYodleeID + " #" + lineID + " .lineUnitPrice").val();
                    let lineAccountName = $("#divLineDetail_" + selectedYodleeID + " #" + lineID + " .lineAccountName").val();
                    let lineAccountID = $("#divLineDetail_" + selectedYodleeID + " #" + lineID + " .lineAccountID").val();
                    let lineCustomerName = $("#divLineDetail_" + selectedYodleeID + " #" + lineID + " .lineCustomerName").val();
                    let lineTaxRate = $("#divLineDetail_" + selectedYodleeID + " #" + lineID + " .lineTaxRate").val();
                    let lineAmount = $("#divLineDetail_" + selectedYodleeID + " #" + lineID + " .lineAmount").text();
                    lineAmount = Number(lineAmount.replace(/[^0-9.-]+/g, "")) || 0;
                    if (PaymentType == 'Purchase Order') {
                        if (lineProductName == '') {
                            swal('Item must be valid.', '', 'error');
                            $('.fullScreenSpin').css('display', 'none');
                            isEmptyAccount = true;
                            return false;
                        } else {
                            lineItemsObj = {
                                type: "TPurchaseOrderLine",
                                fields: {
                                    ProductName: lineProductName || '',
                                    ProductDescription: lineProductDesc || '',
                                    UOMQtySold: parseFloat(lineQty) || 0,
                                    UOMQtyShipped: parseFloat(lineQty) || 0,
                                    LineCost: Number(lineUnitPrice.replace(/[^0-9.-]+/g, "")) || 0,
                                    CustomerJob: lineCustomerName || '',
                                    LineTaxCode: lineTaxRate || '',
                                    LineClassName: defaultDept
                                }
                            };
                            lineItems.push(lineItemsObj);
                        }
                    } else {
                        if (lineAccountName == '') {
                            swal('Account must be valid.', '', 'error');
                            $('.fullScreenSpin').css('display', 'none');
                            isEmptyAccount = true;
                            return false;
                        } else {
                            if (PaymentType == 'Bill') {
                                lineItemsObj = {
                                    type: "TBillLine",
                                    fields: {
                                        AccountName: lineAccountName || '',
                                        ProductDescription: lineProductDesc || '',
                                        CustomerJob: lineCustomerName || '',
                                        LineCost: Number(lineAmount.replace(/[^0-9.-]+/g, "")) || 0,
                                        LineTaxCode: lineTaxRate || '',
                                        LineClassName: defaultDept
                                    }
                                };
                                lineItems.push(lineItemsObj);
                            }
                            if (PaymentType == 'Cheque') {
                                lineItemsObj = {
                                    type: "TChequeLine",
                                    fields: {
                                        AccountName: lineAccountName || '',
                                        ProductDescription: lineProductDesc || '',
                                        LineCost: Number(lineAmount.replace(/[^0-9.-]+/g, "")) || 0,
                                        CustomerJob: lineCustomerName || '',
                                        LineTaxCode: lineTaxRate || ''
                                    }
                                };
                                lineItems.push(lineItemsObj);
                            }
                        }
                    }

                });
                if (lineItems.length == 0 || isEmptyAccount) {
                    $('.fullScreenSpin').css('display', 'none');
                    return false;
                }
                if (PaymentType == 'Purchase Order') {
                    let objPODetails = {
                        type: "TPurchaseOrderEx",
                        fields: {
                            SupplierName: clientName,
                            ForeignExchangeCode: CountryAbbr,
                            // SupplierInvoiceNumber: refText || '',
                            Lines: lineItems,
                            OrderTo: clientBillingAddress,
                            OrderDate: invoiceDate,
                            SupplierInvoiceDate: invoiceDate,
                            SaleLineRef: refText || '',
                            TermsName: clientTermsName || '',
                            Shipping: defaultDept,
                            ShipTo: clientShippingAddress,
                            Comments: comment || '',
                            OrderStatus: ''
                        }
                    };
                    purchaseService.savePurchaseOrderEx(objPODetails).then(function (resultPO) {
                        if (resultPO.fields.ID) {
                            let paymentData = [];
                            const lineID = resultPO.fields.ID;
                            let Line = {
                                type: 'TGuiSuppPaymentLines',
                                fields: {
                                    TransType: "Purchase Order",
                                    TransID: parseInt(lineID) || 0,
                                    Paid: true,
                                    Payment: grand_total
                                }
                            };
                            paymentData.push(Line);
                            let objPaymentDetails = {
                                type: "TSuppPayments",
                                fields: {
                                    ID: paymentID,
                                    Deleted: false,
                                    ClientPrintName: clientName,
                                    CompanyName: clientName,
                                    DeptClassName: defaultDept,
                                    EmployeeID: parseInt(employeeID) || 0,
                                    EmployeeName: employeename || '',
                                    GUILines: paymentData,
                                    Notes: comment || '',
                                    Payment: true,
                                    PaymentDate: invoiceDate,
                                    // PayMethodName: "Cheque", // why cheque?
                                    PayMethodName: "Purchase Order",
                                    ReferenceNo: refText || '',
                                    AccountID: bankaccountid || 0,
                                    AccountName: bankAccountName || '',
                                }
                            };
                            paymentService.saveSuppDepositData(objPaymentDetails).then(function (resultPayment) {
                                if (resultPayment.fields.ID) {
                                    let lineReconObj = {
                                        type: "TReconciliationWithdrawalLines",
                                        fields: {
                                            AccountID: bankaccountid || 0,
                                            AccountName: bankAccountName || '',
                                            Amount: grand_total,
                                            BankStatementLineID: selectedYodleeID,
                                            ClientID: clientID,
                                            ClientName: clientName,
                                            DepositDate: invoiceDate,
                                            Deposited: true,
                                            Notes: reconNote || '',
                                            PaymentID: resultPayment.fields.ID,
                                            Payee: '',
                                            Reconciled: false,
                                            Reference: refText || ''
                                        }
                                    };
                                    let reconData = [];
                                    reconData.push(lineReconObj);
                                    let objReconDetails = {
                                        type: "TReconciliation",
                                        fields: {
                                            ID: reconcileID,
                                            AccountID: bankaccountid || 0,
                                            AccountName: bankAccountName || '',
                                            // CloseBalance: closebalance,
                                            Deleted: false,
                                            DepositLines: null,
                                            DeptName: defaultDept,
                                            EmployeeID: parseInt(employeeID) || 0,
                                            EmployeeName: employeename || '',
                                            Finished: true,
                                            Notes: discussNote || '',
                                            OnHold: false,
                                            // OpenBalance: openbalance,
                                            ReconciliationDate: invoiceDate,
                                            StatementNo: selectedYodleeID.toString() || '0',
                                            WithdrawalLines: reconData || ''
                                        }
                                    };
                                    reconService.saveReconciliation(objReconDetails).then(function (resultRecon) {
                                        if (resultRecon.fields.ID) {
                                            openFindMatchAfterSave(resultRecon.fields.ID);
                                            $('.fullScreenSpin').css('display', 'none');
                                        } else {
                                            $('.fullScreenSpin').css('display', 'none');
                                        }
                                    }).catch(function (err) {
                                        handleSaveError(err);
                                    });
                                } else {
                                    $('.fullScreenSpin').css('display', 'none');
                                }
                                $('.fullScreenSpin').css('display', 'none');
                            }).catch(function (err) {
                                handleSaveError(err);
                            });
                        } else {
                            $('.fullScreenSpin').css('display', 'none');
                        }
                    }).catch(function (err) {
                        handleSaveError(err);
                    });
                } else if (PaymentType == "Bill") {
                    let objDetails = {
                        type: "TBillEx",
                        fields: {
                            SupplierName: clientName,
                            ForeignExchangeCode: CountryAbbr,
                            Lines: lineItems,
                            OrderTo: clientBillingAddress,
                            OrderDate: invoiceDate,
                            Deleted: false,
                            // SupplierInvoiceNumber: refText || '',
                            ConNote: refText || '',
                            TermsName: clientTermsName || '',
                            Shipping: defaultDept,
                            ShipTo: clientShippingAddress,
                            Comments: comment || '',
                            // SalesComments: pickingInfrmation,
                            OrderStatus: '',
                            BillTotal: grand_total
                        }
                    };
                    purchaseService.saveBillEx(objDetails).then(function(resultBill) {
                        if (resultBill.fields.ID) {
                            let paymentData = [];
                            const lineID = resultBill.fields.ID;
                            let Line = {
                                type: 'TGuiSuppPaymentLines',
                                fields: {
                                    TransType: "Bill",
                                    TransID: parseInt(lineID) || 0,
                                    Paid: true,
                                    Payment: grand_total
                                }
                            };
                            paymentData.push(Line);
                            let objPaymentDetails = {
                                type: "TSuppPayments",
                                fields: {
                                    ID: paymentID,
                                    Deleted: false,
                                    ClientPrintName: clientName,
                                    CompanyName: clientName,
                                    DeptClassName: defaultDept,
                                    EmployeeID: parseInt(employeeID) || 0,
                                    EmployeeName: employeename || '',
                                    GUILines: paymentData,
                                    Notes: comment || '',
                                    Payment: true,
                                    PaymentDate: invoiceDate,
                                    PayMethodName: "Bill",
                                    ReferenceNo: refText || '',
                                    AccountID: bankaccountid || 0,
                                    AccountName: bankAccountName || '',
                                }
                            };
                            paymentService.saveSuppDepositData(objPaymentDetails).then(function (resultPayment) {
                                if (resultPayment.fields.ID) {
                                    let lineReconObj = {
                                        type: "TReconciliationWithdrawalLines",
                                        fields: {
                                            AccountID: bankaccountid || 0,
                                            AccountName: bankAccountName || '',
                                            Amount: grand_total,
                                            BankStatementLineID: selectedYodleeID,
                                            ClientID: clientID,
                                            ClientName: clientName,
                                            DepositDate: invoiceDate,
                                            Deposited: true,
                                            Notes: reconNote || '',
                                            PaymentID: resultPayment.fields.ID,
                                            Payee: '',
                                            Reconciled: false,
                                            Reference: refText || ''
                                        }
                                    };
                                    let reconData = [];
                                    reconData.push(lineReconObj);
                                    let objReconDetails = {
                                        type: "TReconciliation",
                                        fields: {
                                            ID: reconcileID,
                                            AccountID: bankaccountid || 0,
                                            AccountName: bankAccountName || '',
                                            // CloseBalance: closebalance,
                                            Deleted: false,
                                            DepositLines: null,
                                            DeptName: defaultDept,
                                            EmployeeID: parseInt(employeeID) || 0,
                                            EmployeeName: employeename || '',
                                            Finished: true,
                                            Notes: discussNote || '',
                                            OnHold: false,
                                            // OpenBalance: openbalance,
                                            ReconciliationDate: invoiceDate,
                                            StatementNo: selectedYodleeID.toString() || '0',
                                            WithdrawalLines: reconData || ''
                                        }
                                    };
                                    reconService.saveReconciliation(objReconDetails).then(function (resultRecon) {
                                        if (resultRecon.fields.ID) {
                                            openFindMatchAfterSave(resultRecon.fields.ID);
                                            $('.fullScreenSpin').css('display', 'none');
                                        } else {
                                            $('.fullScreenSpin').css('display', 'none');
                                        }
                                    }).catch(function (err) {
                                        handleSaveError(err);
                                    });
                                } else {
                                    $('.fullScreenSpin').css('display', 'none');
                                }
                                $('.fullScreenSpin').css('display', 'none');
                            }).catch(function (err) {
                                handleSaveError(err);
                            });
                        } else {
                            $('.fullScreenSpin').css('display', 'none');
                        }
                    }).catch(function (err) {
                        handleSaveError(err);
                    });
                } else {
                    let objDetails = {
                        type: "TChequeEx",
                        fields: {
                            SupplierName: clientName,
                            ForeignExchangeCode: CountryAbbr,
                            Lines: lineItems,
                            OrderTo: clientBillingAddress,
                            GLAccountName: bankAccountName,
                            OrderDate: invoiceDate,
                            // SupplierInvoiceNumber: refText || '',
                            ConNote: refText || '',
                            Shipping: defaultDept,
                            ShipTo: clientShippingAddress,
                            Comments: comment || '',
                            RefNo: refText || '',
                            // SalesComments: pickingInfrmation,
                            OrderStatus: '',
                            Chequetotal: grand_total,
                        },
                    };
                    purchaseService.saveChequeEx(objDetails).then(function(resultCheque) {
                        if (resultCheque.fields.ID) {
                            let paymentData = [];
                            const lineID = resultCheque.fields.ID;
                            let Line = {
                                type: 'TGuiSuppPaymentLines',
                                fields: {
                                    TransType: "Cheque",
                                    TransID: parseInt(lineID) || 0,
                                    Paid: true,
                                    Payment: grand_total
                                }
                            };
                            paymentData.push(Line);
                            let objPaymentDetails = {
                                type: "TSuppPayments",
                                fields: {
                                    ID: paymentID,
                                    Deleted: false,
                                    ClientPrintName: clientName,
                                    CompanyName: clientName,
                                    DeptClassName: defaultDept,
                                    EmployeeID: parseInt(employeeID) || 0,
                                    EmployeeName: employeename || '',
                                    GUILines: paymentData,
                                    Notes: comment || '',
                                    Payment: true,
                                    PaymentDate: invoiceDate,
                                    PayMethodName: "Cheque",
                                    ReferenceNo: refText || '',
                                    AccountID: bankaccountid || 0,
                                    AccountName: bankAccountName || '',
                                }
                            };
                            paymentService.saveSuppDepositData(objPaymentDetails).then(function (resultPayment) {
                                if (resultPayment.fields.ID) {
                                    let lineReconObj = {
                                        type: "TReconciliationWithdrawalLines",
                                        fields: {
                                            AccountID: bankaccountid || 0,
                                            AccountName: bankAccountName || '',
                                            Amount: grand_total,
                                            BankStatementLineID: selectedYodleeID,
                                            ClientID: clientID,
                                            ClientName: clientName,
                                            DepositDate: invoiceDate,
                                            Deposited: true,
                                            Notes: reconNote || '',
                                            PaymentID: resultPayment.fields.ID,
                                            Payee: '',
                                            Reconciled: false,
                                            Reference: refText || ''
                                        }
                                    };
                                    let reconData = [];
                                    reconData.push(lineReconObj);
                                    let objReconDetails = {
                                        type: "TReconciliation",
                                        fields: {
                                            ID: reconcileID,
                                            AccountID: bankaccountid || 0,
                                            AccountName: bankAccountName || '',
                                            // CloseBalance: closebalance,
                                            Deleted: false,
                                            DepositLines: null,
                                            DeptName: defaultDept,
                                            EmployeeID: parseInt(employeeID) || 0,
                                            EmployeeName: employeename || '',
                                            Finished: true,
                                            Notes: discussNote || '',
                                            OnHold: false,
                                            // OpenBalance: openbalance,
                                            ReconciliationDate: invoiceDate,
                                            StatementNo: selectedYodleeID.toString() || '0',
                                            WithdrawalLines: reconData || ''
                                        }
                                    };
                                    reconService.saveReconciliation(objReconDetails).then(function (resultRecon) {
                                        if (resultRecon.fields.ID) {
                                            openFindMatchAfterSave(resultRecon.fields.ID);
                                            $('.fullScreenSpin').css('display', 'none');
                                        } else {
                                            $('.fullScreenSpin').css('display', 'none');
                                        }
                                    }).catch(function (err) {
                                        handleSaveError(err);
                                    });
                                } else {
                                    $('.fullScreenSpin').css('display', 'none');
                                }
                                $('.fullScreenSpin').css('display', 'none');
                            }).catch(function (err) {
                                handleSaveError(err);
                            });
                        } else {
                            $('.fullScreenSpin').css('display', 'none');
                        }
                    }).catch(function (err) {
                        handleSaveError(err);
                    });
                }
            }
        }
    },
    'click #btnMatchCancel': function() {
        playCancelAudio();
        setTimeout(function(){
        closeTransactionDetail();
        }, delayTimeAfterSound);
    },
    'click #btnGoSearch': function(event) {
        if (selectedYodleeID) {
            matchTransactionList = VS1TransactionList;
            Template.instance().matchTransactionData.set(matchTransactionList);
            // Template.instance().viewTransactionData.set(viewTransactionList);
            $('#tblFindTransaction tbody tr').show();
            let searchName = $("#divLineFindMatch_"+selectedYodleeID+" #searchName").val();
            let searchAmount = $("#divLineFindMatch_"+selectedYodleeID+" #searchAmount").val();
            let checked = $("#chkSOR_"+selectedYodleeID+":checked").val();
            let DepOrWith = $('#DepOrWith_'+selectedYodleeID).val();
            $('.tblFindTransaction tbody tr').each(function() {
                let found = false;
                let nameText = $(this).find(".colName").text().toLowerCase();
                let refText = $(this).find(".colRef").text().toLowerCase();
                let descText = $(this).find(".colDesc").text().toLowerCase();
                let spentAmount = Number($(this).find(".colSpentAmount").text().replace(/[^0-9.-]+/g, "")) || 0;
                let receivedAmount = Number($(this).find(".colReceivedAmount").text().replace(/[^0-9.-]+/g, "")) || 0;
                if (searchName != '' && searchAmount != '') {
                    if ((nameText.indexOf(searchName.toLowerCase()) >= 0 || refText.indexOf(searchName.toLowerCase()) >= 0 || descText.indexOf(searchName.toLowerCase()) >= 0)
                    && (parseFloat(spentAmount) == parseFloat(searchAmount) || parseFloat(receivedAmount) == parseFloat(searchAmount))) {
                        found = true;
                    }
                } else if (searchName != '') {
                    if (nameText.indexOf(searchName.toLowerCase()) >= 0 || refText.indexOf(searchName.toLowerCase()) >= 0 || descText.indexOf(searchName.toLowerCase()) >= 0) {
                        found = true;
                    }
                } else if (searchAmount != '') {
                    if (parseFloat(spentAmount) == parseFloat(searchAmount) || parseFloat(receivedAmount) == parseFloat(searchAmount)) {
                        found = true;
                    }
                } else {
                    found = true;
                }
                if (checked == undefined && DepOrWith == "spent") {
                    if (parseFloat(receivedAmount) > 0) {
                        found = false;
                    }
                }
                if (checked == undefined && DepOrWith == "received") {
                    if (parseFloat(spentAmount) > 0) {
                        found = false;
                    }
                }
                if (found) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
        }
    },
    'click #btnClearSearch': function(event) {
        if (selectedYodleeID) {
            $("#divLineFindMatch_"+selectedYodleeID+" #searchName").val('');
            $("#divLineFindMatch_"+selectedYodleeID+" #searchAmount").val('');
            $("#divLineFindMatch_"+selectedYodleeID+" #btnGoSearch").trigger('click');
        }
    },
    'change .selectMatchRow': function(event) {
        if (selectedYodleeID) {
            const templateObject = Template.instance();
            let matchTransactionData = templateObject.matchTransactionData.get();
            let viewTransactionData = templateObject.viewTransactionData.get();
            let lineID = event.target.id;
            lineID = lineID.split("_").pop();
            if ($(event.target).is(':checked')) {
                $(event.target).parent().parent().parent().addClass("matchedRow");
                // $(event.target).parent().parent().parent().css("background-color", "rgba(23, 166, 115, 0.5) !important");
                let unselectedData = matchTransactionData.filter(function (obj) {
                    return obj.ID != lineID;
                });
                let selectedData = matchTransactionData.filter(function (obj) {
                    return obj.ID == lineID;
                });
                viewTransactionData.push(selectedData[0]);
                templateObject.viewTransactionData.set(viewTransactionData);
            } else {
                $(event.target).parent().parent().parent().removeClass("matchedRow");
                // $(event.target).parent().parent().parent().css("background-color", "white !important");
                let unselectedData = viewTransactionData.filter(function (obj) {
                    return obj.ID != lineID;
                });
                templateObject.viewTransactionData.set(unselectedData);
            }
            setTimeout(function () {
                setCalculated2();
            }, 100);
        }
    },
    'change .selectViewRow': function(event) {
        if (selectedYodleeID) {
            const templateObject = Template.instance();
            let matchTransactionData = templateObject.matchTransactionData.get();
            let viewTransactionData = templateObject.viewTransactionData.get();
            let lineID = event.target.id;
            lineID = lineID.split("_").pop();
            let unselectedData = viewTransactionData.filter(function(obj) {
                return obj.ID != lineID;
            });
            let selectedData = viewTransactionData.filter(function(obj) {
                return obj.ID == lineID;
            });
            templateObject.viewTransactionData.set(unselectedData);
            setTimeout(function () {
                setCalculated2();
            }, 100);
        }
    },
    'click #btnSpendMoney': function(event) {
        if (selectedYodleeID) {
            $('#btnAddDetail_'+selectedYodleeID).trigger('click');
        }
    },
    'click #btnTransferMoney': function(event) {
        if (selectedYodleeID) {

        }
    },
    'click #swtCompactView': function(event) {
        let checked = $("#swtCompactView:checked").val();
        if (checked == "on") {
            $("#transactionDataBox").addClass('compactView');
        } else {
            $("#transactionDataBox").removeClass('compactView');
        }
    },
    'change .selectSuppPaymentType': function(event) {
        let type = $(event.target).val() || '';
        changeTblReconInvoice(type);
    },
    'change #bankAccountName': function(event) {
        swal({
            title: 'Question',
            text: "Account does not exist, would you like to create it?",
            type: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            console.log(result)
            console.log(localStorage.getItem("VS1Reconcile_Info"))
            localStorage.setItem("VS1Reconcile_Info", false);
            if (result.value) {
                $('#addAccountModal').modal('toggle');
                $('#edtAccountName').val(dataSearchName);
            } else if (result.dismiss === 'cancel') {
                $('#accountListModal').modal('toggle');
            }
        });
    },
});

Template.newbankrecon.helpers({
    accountnamerecords: () => {
        return Template.instance().accountnamerecords.get().sort(function(a, b) {
            if (a.accountname == 'NA') {
                return 1;
            } else if (b.accountname == 'NA') {
                return -1;
            }
            return (a.accountname.toUpperCase() > b.accountname.toUpperCase()) ? 1 : -1;
        });
    },
    taxraterecords: () => {
        return Template.instance()
            .taxraterecords.get()
            .sort(function (a, b) {
                if (a.description == "NA") {
                    return 1;
                } else if (b.description == "NA") {
                    return -1;
                }
                return a.description.toUpperCase() > b.description.toUpperCase()
                    ? 1
                    : -1;
            });
    },
    bankTransactionData: () => {
        return Template.instance().bankTransactionData.get();
    },
    matchTransactionData: () => {
        return Template.instance().matchTransactionData.get();
    },
    viewTransactionData: () => {
        return Template.instance().viewTransactionData.get();
    },
    lastTransactionDate: () => {
        return Template.instance().lastTransactionDate.get();
    },
    page_number: () => {
        return Template.instance().page_number.get();
    },
    page_total: () => {
        return Template.instance().page_total.get();
    },
    page_count: () => {
        return Template.instance().page_count.get();
    },
    page_list: () => {
        return Template.instance().page_list.get();
    },
    sort: () => {
        return Template.instance().sort.get();
    },
    sort_param: () => {
        return Template.instance().sort_param.get();
    },
    fa_sortDepositSpent: () => {
        return Template.instance().fa_sortDepositSpent.get();
    },
    fa_sortDepositReceived: () => {
        return Template.instance().fa_sortDepositReceived.get();
    },
    fa_sortWithdrawSpent: () => {
        return Template.instance().fa_sortWithdrawSpent.get();
    },
    fa_sortWithdrawReceived: () => {
        return Template.instance().fa_sortWithdrawReceived.get();
    },
    baselinedata : () => {
        return Template.instance().baselinedata.get();
    },
});

function openProductListModal() {
    $('#productListModal').modal('toggle');
    setTimeout(function () {
        $('#tblInventory_filter .form-control-sm').focus();
        $('#tblInventory_filter .form-control-sm').val('');
        $('#tblInventory_filter .form-control-sm').trigger("input");
        const datatable = $('#tblInventory').DataTable();
        datatable.draw();
        $('#tblInventory_filter .form-control-sm').trigger("input");
    }, 500);
}
function setOneProductDataByName(productDataName) {
    sideBarService.getOneProductdatavs1byname(productDataName).then(function (data) {
        $('.fullScreenSpin').css('display', 'none');
        setProductNewModal(data.tproduct[0]);
        setTimeout(function () {
            $('#newProductModal').modal('show');
        }, 500);
    }).catch(function (err) {
        $('.fullScreenSpin').css('display', 'none');
    });
}
function setProductNewModal(productInfo) {
    let currencySymbol = Currency;
    let totalquantity = 0;
    let productname = productInfo.fields.ProductName || '';
    let productcode = productInfo.fields.PRODUCTCODE || '';
    let productprintName = productInfo.fields.ProductPrintName || '';
    let assetaccount = productInfo.fields.AssetAccount || '';
    let buyqty1cost = utilityService.modifynegativeCurrencyFormat(productInfo.fields.BuyQty1Cost) || 0;
    let cogsaccount = productInfo.fields.CogsAccount || '';
    let taxcodepurchase = productInfo.fields.TaxCodePurchase || '';
    let purchasedescription = productInfo.fields.PurchaseDescription || '';
    let sellqty1price = utilityService.modifynegativeCurrencyFormat(productInfo.fields.SellQty1Price) || 0;
    let incomeaccount = productInfo.fields.IncomeAccount || '';
    let taxcodesales = productInfo.fields.TaxCodeSales || '';
    let salesdescription = productInfo.fields.SalesDescription || '';
    let active = productInfo.fields.Active;
    let lockextrasell = productInfo.fields.LockExtraSell || '';
    let customfield1 = productInfo.fields.CUSTFLD1 || '';
    let customfield2 = productInfo.fields.CUSTFLD2 || '';
    let barcode = productInfo.fields.BARCODE || '';
    $("#selectProductID").val(productInfo.fields.ID).trigger("change");
    $('#add-product-title').text('Edit Product');
    $('#edtproductname').val(productname);
    $('#edtsellqty1price').val(sellqty1price);
    $('#txasalesdescription').val(salesdescription);
    $('#sltsalesacount').val(incomeaccount);
    $('#slttaxcodesales').val(taxcodesales);
    $('#edtbarcode').val(barcode);
    $('#txapurchasedescription').val(purchasedescription);
    $('#sltcogsaccount').val(cogsaccount);
    $('#slttaxcodepurchase').val(taxcodepurchase);
    $('#edtbuyqty1cost').val(buyqty1cost);
}

function openBankAccountListModal(){
    $('#selectLineID').val('');
    $('#bankAccountListModal').modal();
    setTimeout(function () {
        $('#tblAccount_filter .form-control-sm').focus();
        $('#tblAccount_filter .form-control-sm').val('');
        $('#tblAccount_filter .form-control-sm').trigger("input");
        const datatable = $('#tblAccountlist').DataTable();
        datatable.draw();
        $('#tblAccountlist_filter .form-control-sm').trigger("input");
    }, 500);
}
function openFullAccountModal() {
    $('#fullAccountListModal').modal();
    setTimeout(function () {
        $('#tblFullAccount_filter .form-control-sm').focus();
        $('#tblFullAccount_filter .form-control-sm').val('');
        $('#tblFullAccount_filter .form-control-sm').trigger("input");
        const datatable = $('#tblFullAccount').DataTable();
        //datatable.clear();
        //datatable.rows.add(splashArrayCustomerList);
        datatable.draw();
        $('#tblFullAccount_filter .form-control-sm').trigger("input");
        //$('#tblCustomerlist').dataTable().fnFilter(' ').draw(false);
    }, 500);
}
function setOneAccountByName(accountDataName) {
    accountService.getOneAccountByName(accountDataName).then(function (data) {
        setBankAccountData(data);
    }).catch(function (err) {
        $('.fullScreenSpin').css('display','none');
    });
}
function setBankAccountData(data, i = 0) {
    let fullAccountTypeName = '';
    $('#add-account-title').text('Edit Account Details');
    $('#edtAccountName').attr('readonly', true);
    $('#sltAccountType').attr('readonly', true);
    $('#sltAccountType').attr('disabled', 'disabled');
    const accountid = data.taccountvs1[i].fields.ID || '';
    const accounttype = fullAccountTypeName || data.taccountvs1[i].fields.AccountTypeName;
    const accountname = data.taccountvs1[i].fields.AccountName || '';
    const accountno = data.taccountvs1[i].fields.AccountNumber || '';
    const taxcode = data.taccountvs1[i].fields.TaxCode || '';
    const accountdesc = data.taccountvs1[i].fields.Description || '';
    const bankaccountname = data.taccountvs1[i].fields.BankAccountName || '';
    const bankbsb = data.taccountvs1[i].fields.BSB || '';
    const bankacountno = data.taccountvs1[i].fields.BankAccountNumber || '';
    const swiftCode = data.taccountvs1[i].fields.Extra || '';
    const routingNo = data.taccountvs1[i].fields.BankCode || '';
    const showTrans = data.taccountvs1[i].fields.IsHeader || false;
    const cardnumber = data.taccountvs1[i].fields.CarNumber || '';
    const cardcvc = data.taccountvs1[i].fields.CVC || '';
    const cardexpiry = data.taccountvs1[i].fields.ExpiryDate || '';

    if ((accounttype == "BANK")) {
        $('.isBankAccount').removeClass('isNotBankAccount');
        $('.isCreditAccount').addClass('isNotCreditAccount');
    }else if ((accounttype == "CCARD")) {
        $('.isCreditAccount').removeClass('isNotCreditAccount');
        $('.isBankAccount').addClass('isNotBankAccount');
    } else {
        $('.isBankAccount').addClass('isNotBankAccount');
        $('.isCreditAccount').addClass('isNotCreditAccount');
    }

    $('#edtAccountID').val(accountid);
    $('#sltAccountType').val(accounttype);
    $('#sltAccountType').append('<option value="'+accounttype+'" selected="selected">'+accounttype+'</option>');
    $('#edtAccountName').val(accountname);
    $('#edtAccountNo').val(accountno);
    $('#sltTaxCode').val(taxcode);
    $('#txaAccountDescription').val(accountdesc);
    $('#edtBankAccountName').val(bankaccountname);
    $('#edtBSB').val(bankbsb);
    $('#edtBankAccountNo').val(bankacountno);
    $('#swiftCode').val(swiftCode);
    $('#routingNo').val(routingNo);
    $('#edtBankName').val(localStorage.getItem('vs1companyBankName') || '');

    $('#edtCardNumber').val(cardnumber);
    $('#edtExpiryDate').val(cardexpiry ? moment(cardexpiry).format('DD/MM/YYYY') : "");
    $('#edtCvc').val(cardcvc);

    if(showTrans == 'true'){
        $('.showOnTransactions').prop('checked', true);
    }else{
        $('.showOnTransactions').prop('checked', false);
    }

    setTimeout(function () {
        $('#addNewAccount').modal('show');
    }, 500);
}

function openCustomerModal() {
    $('#customerListModal').modal();
    setTimeout(function () {
        $('#tblCustomerlist_filter .form-control-sm').focus();
        $('#tblCustomerlist_filter .form-control-sm').val('');
        $('#tblCustomerlist_filter .form-control-sm').trigger("input");
        const datatable = $('#tblCustomerlist').DataTable();
        //datatable.clear();
        //datatable.rows.add(splashArrayCustomerList);
        datatable.draw();
        $('#tblCustomerlist_filter .form-control-sm').trigger("input");
        //$('#tblCustomerlist').dataTable().fnFilter(' ').draw(false);
    }, 500);
}
function setOneCustomerDataExByName(customerDataName) {
    $('.fullScreenSpin').css('display', 'inline-block');
    sideBarService.getOneCustomerDataExByName(customerDataName).then(function (data) {
        $('.fullScreenSpin').css('display', 'none');
        setCustomerModal(data.tcustomer[0]);
    }).catch(function (err) {
        $('.fullScreenSpin').css('display', 'none');
    });
}
function setCustomerModal(data) {
    $('.fullScreenSpin').css('display', 'none');
    let lineItems = [];
    $('#add-customer-title').text('Edit Customer');
    let popCustomerID = data.fields.ID || '';
    let popCustomerName = data.fields.ClientName || '';
    let popCustomerEmail = data.fields.Email || '';
    let popCustomerTitle = data.fields.Title || '';
    let popCustomerFirstName = data.fields.FirstName || '';
    let popCustomerMiddleName = data.fields.CUSTFLD10 || '';
    let popCustomerLastName = data.fields.LastName || '';
    let popCustomertfn = '' || '';
    let popCustomerPhone = data.fields.Phone || '';
    let popCustomerMobile = data.fields.Mobile || '';
    let popCustomerFaxnumber = data.fields.Faxnumber || '';
    let popCustomerSkypeName = data.fields.SkypeName || '';
    let popCustomerURL = data.fields.URL || '';
    let popCustomerStreet = data.fields.Street || '';
    let popCustomerStreet2 = data.fields.Street2 || '';
    let popCustomerState = data.fields.State || '';
    let popCustomerPostcode = data.fields.Postcode || '';
    let popCustomerCountry = data.fields.Country || LoggedCountry;
    let popCustomerbillingaddress = data.fields.BillStreet || '';
    let popCustomerbcity = data.fields.BillStreet2 || '';
    let popCustomerbstate = data.fields.BillState || '';
    let popCustomerbpostalcode = data.fields.BillPostcode || '';
    let popCustomerbcountry = data.fields.Billcountry || LoggedCountry;
    let popCustomercustfield1 = data.fields.CUSTFLD1 || '';
    let popCustomercustfield2 = data.fields.CUSTFLD2 || '';
    let popCustomercustfield3 = data.fields.CUSTFLD3 || '';
    let popCustomercustfield4 = data.fields.CUSTFLD4 || '';
    let popCustomernotes = data.fields.Notes || '';
    let popCustomerpreferedpayment = data.fields.PaymentMethodName || '';
    let popCustomerterms = data.fields.TermsName || '';
    let popCustomerdeliverymethod = data.fields.ShippingMethodName || '';
    let popCustomeraccountnumber = data.fields.ClientNo || '';
    let popCustomerisContractor = data.fields.Contractor || false;
    let popCustomerissupplier = data.fields.IsSupplier || false;
    let popCustomeriscustomer = data.fields.IsCustomer || false;
    let popCustomerTaxCode = data.fields.TaxCodeName || '';
    let popCustomerDiscount = data.fields.Discount || 0;
    let popCustomerType = data.fields.ClientTypeName || '';
    //$('#edtCustomerCompany').attr('readonly', true);
    $('#edtCustomerCompany').val(popCustomerName);
    $('#edtCustomerPOPID').val(popCustomerID);
    $('#edtCustomerPOPEmail').val(popCustomerEmail);
    $('#edtTitle').val(popCustomerTitle);
    $('#edtFirstName').val(popCustomerFirstName);
    $('#edtMiddleName').val(popCustomerMiddleName);
    $('#edtLastName').val(popCustomerLastName);
    $('#edtCustomerPhone').val(popCustomerPhone);
    $('#edtCustomerMobile').val(popCustomerMobile);
    $('#edtCustomerFax').val(popCustomerFaxnumber);
    $('#edtCustomerSkypeID').val(popCustomerSkypeName);
    $('#edtCustomerWebsite').val(popCustomerURL);
    $('#edtCustomerShippingAddress').val(popCustomerStreet);
    $('#edtCustomerShippingCity').val(popCustomerStreet2);
    $('#edtCustomerShippingState').val(popCustomerState);
    $('#edtCustomerShippingZIP').val(popCustomerPostcode);
    $('#sedtCountry').val(popCustomerCountry);
    $('#txaNotes').val(popCustomernotes);
    $('#sltPreferedPayment').val(popCustomerpreferedpayment);
    $('#sltTermsPOP').val(popCustomerterms);
    $('#sltCustomerType').val(popCustomerType);
    $('#edtCustomerCardDiscount').val(popCustomerDiscount);
    $('#edtCustomeField1').val(popCustomercustfield1);
    $('#edtCustomeField2').val(popCustomercustfield2);
    $('#edtCustomeField3').val(popCustomercustfield3);
    $('#edtCustomeField4').val(popCustomercustfield4);

    $('#sltTaxCode').val(popCustomerTaxCode);

    if ((data.fields.Street == data.fields.BillStreet) && (data.fields.Street2 == data.fields.BillStreet2) &&
        (data.fields.State == data.fields.BillState) && (data.fields.Postcode == data.fields.BillPostcode) &&
        (data.fields.Country == data.fields.Billcountry)) {
        $('#chkSameAsShipping2').attr("checked", "checked");
    }

    if (data.fields.IsSupplier == true) {
        // $('#isformcontractor')
        $('#chkSameAsSupplier').attr("checked", "checked");
    } else {
        $('#chkSameAsSupplier').removeAttr("checked");
    }

    setTimeout(function () {
        $('#addCustomerModal').modal('show');
    }, 200);
}

function openSupplierModal() {
    $('#supplierListModal').modal();
    setTimeout(function() {
        $('#tblSupplierlist_filter .form-control-sm').focus();
        $('#tblSupplierlist_filter .form-control-sm').val('');
        $('#tblSupplierlist_filter .form-control-sm').trigger("input");
        const datatable = $('#tblSupplierlist').DataTable();
        datatable.draw();
        $('#tblSupplierlist_filter .form-control-sm').trigger("input");
    }, 500);
}
function setOneSupplierDataExByName(supplierDataName) {
    $('.fullScreenSpin').css('display', 'inline-block');
    sideBarService.getOneSupplierDataExByName(supplierDataName).then(function (data) {
        $('.fullScreenSpin').css('display', 'none');
        setSupplierModal(data.tsupplier[0]);
    }).catch(function (err) {
        $('.fullScreenSpin').css('display', 'none');
    });
}
function setSupplierModal(data) {
    $('.fullScreenSpin').css('display', 'none');
    $('#add-supplier-title').text('Edit Supplier');
    let popSupplierID = data.fields.ID || '';
    let popSupplierName = data.fields.ClientName || '';
    let popSupplierEmail = data.fields.Email || '';
    let popSupplierTitle = data.fields.Title || '';
    let popSupplierFirstName = data.fields.FirstName || '';
    let popSupplierMiddleName = data.fields.CUSTFLD10 || '';
    let popSupplierLastName = data.fields.LastName || '';
    let popSuppliertfn = '' || '';
    let popSupplierPhone = data.fields.Phone || '';
    let popSupplierMobile = data.fields.Mobile || '';
    let popSupplierFaxnumber = data.fields.Faxnumber || '';
    let popSupplierSkypeName = data.fields.SkypeName || '';
    let popSupplierURL = data.fields.URL || '';
    let popSupplierStreet = data.fields.Street || '';
    let popSupplierStreet2 = data.fields.Street2 || '';
    let popSupplierState = data.fields.State || '';
    let popSupplierPostcode = data.fields.Postcode || '';
    let popSupplierCountry = data.fields.Country || LoggedCountry;
    let popSupplierbillingaddress = data.fields.BillStreet || '';
    let popSupplierbcity = data.fields.BillStreet2 || '';
    let popSupplierbstate = data.fields.BillState || '';
    let popSupplierbpostalcode = data.fields.BillPostcode || '';
    let popSupplierbcountry = data.fields.Billcountry || LoggedCountry;
    let popSuppliercustfield1 = data.fields.CUSTFLD1 || '';
    let popSuppliercustfield2 = data.fields.CUSTFLD2 || '';
    let popSuppliercustfield3 = data.fields.CUSTFLD3 || '';
    let popSuppliercustfield4 = data.fields.CUSTFLD4 || '';
    let popSuppliernotes = data.fields.Notes || '';
    let popSupplierpreferedpayment = data.fields.PaymentMethodName || '';
    let popSupplierterms = data.fields.TermsName || '';
    let popSupplierdeliverymethod = data.fields.ShippingMethodName || '';
    let popSupplieraccountnumber = data.fields.ClientNo || '';
    let popSupplierisContractor = data.fields.Contractor || false;
    let popSupplierissupplier = data.fields.IsSupplier || false;
    let popSupplieriscustomer = data.fields.IsCustomer || false;

    $('#edtSupplierCompany').val(popSupplierName);
    $('#edtSupplierPOPID').val(popSupplierID);
    $('#edtSupplierCompanyEmail').val(popSupplierEmail);
    $('#edtSupplierTitle').val(popSupplierTitle);
    $('#edtSupplierFirstName').val(popSupplierFirstName);
    $('#edtSupplierMiddleName').val(popSupplierMiddleName);
    $('#edtSupplierLastName').val(popSupplierLastName);
    $('#edtSupplierPhone').val(popSupplierPhone);
    $('#edtSupplierMobile').val(popSupplierMobile);
    $('#edtSupplierFax').val(popSupplierFaxnumber);
    $('#edtSupplierSkypeID').val(popSupplierSkypeName);
    $('#edtSupplierWebsite').val(popSupplierURL);
    $('#edtSupplierShippingAddress').val(popSupplierStreet);
    $('#edtSupplierShippingCity').val(popSupplierStreet2);
    $('#edtSupplierShippingState').val(popSupplierState);
    $('#edtSupplierShippingZIP').val(popSupplierPostcode);
    $('#sedtCountry').val(popSupplierCountry);
    $('#txaNotes').val(popSuppliernotes);
    $('#sltPreferedPayment').val(popSupplierpreferedpayment);
    $('#sltTerms').val(popSupplierterms);
    $('#suppAccountNo').val(popSupplieraccountnumber);
    $('#edtCustomeField1').val(popSuppliercustfield1);
    $('#edtCustomeField2').val(popSuppliercustfield2);
    $('#edtCustomeField3').val(popSuppliercustfield3);
    $('#edtCustomeField4').val(popSuppliercustfield4);

    if ((data.fields.Street == data.fields.BillStreet) && (data.fields.Street2 == data.fields.BillStreet2) &&
        (data.fields.State == data.fields.BillState) && (data.fields.Postcode == data.fields.Postcode) &&
        (data.fields.Country == data.fields.Billcountry)) {
        //templateObject.isSameAddress.set(true);
        $('#chkSameAsShipping').attr("checked", "checked");
    }
    if (data.fields.Contractor == true) {
        // $('#isformcontractor')
        $('#isformcontractor').attr("checked", "checked");
    } else {
        $('#isformcontractor').removeAttr("checked");
    }

    setTimeout(function() {
        $('#addSupplierModal').modal('show');
    }, 200);
}

function setTaxCodeVS1(taxRateDataName) {
    purchaseService.getTaxCodesVS1().then(function (data) {
        setTaxRateData(data, taxRateDataName);
    }).catch(function (err) {
        // Bert.alert('<strong>' + err + '</strong>!', 'danger');
        $(".fullScreenSpin").css("display", "none");
        // Meteor._reload.reload();
    });
}
function setTaxRateData(data, taxRateDataName) {
    for (let i = 0; i < data.ttaxcodevs1.length; i++) {
        if (data.ttaxcodevs1[i].CodeName == taxRateDataName) {
            $("#edtTaxNamePop").attr("readonly", true);
            let taxRate = (
                data.ttaxcodevs1[i].Rate * 100
            ).toFixed(2);
            const taxRateID = data.ttaxcodevs1[i].Id || "";
            const taxRateName = data.ttaxcodevs1[i].CodeName || "";
            const taxRateDesc = data.ttaxcodevs1[i].Description || "";
            $("#edtTaxID").val(taxRateID);
            $("#edtTaxNamePop").val(taxRateName);
            $("#edtTaxRatePop").val(taxRate);
            $("#edtTaxDescPop").val(taxRateDesc);
            setTimeout(function () {
                $("#newTaxRateModal").modal("toggle");
            }, 100);
        }
    }
}

function sortTransactionData(array, key, desc=true) {
    return array.sort(function(a, b) {
        let x = a[key];
        let y = b[key];
        if (key == 'SortDate') {
            x = new Date(x);
            y = new Date(y);
        }
        if (key == 'spentYodleeAmount' || key == 'receivedYodleeAmount' || key == 'spentVS1Amount' || key == 'receivedVS1Amount') {
            x = parseFloat(utilityService.substringMethod(x));
            y = parseFloat(utilityService.substringMethod(y));
        }
        if (!desc)
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        else
            return ((x > y) ? -1 : ((x < y) ? 1 : 0));
    });
}
function setCalculated() {
    if (selectedYodleeID) {
        let $tblrows = $('#divLineDetail_' + selectedYodleeID + ' #tblReconInvoice tbody tr');
        let lineAmount = 0;
        let subTotal = 0;
        let discountTotal = 0;
        let taxTotal = 0;
        let grandTotal = 0;
        let DepOrWith = $("#DepOrWith_"+selectedYodleeID).val();
        let paymentType = '';
        let discountRate = 0;
        if (DepOrWith == "received") {
            let customerName = $('#sender_' + selectedYodleeID).val();
            if (customerName != "") {
                let customerDetail = customerList.filter(customer => {
                    return customer.customername == customerName
                });
                customerDetail = customerDetail[0];
                discountRate = customerDetail.discount;
            }
            paymentType = 'Invoice';
        } else {
            paymentType = $("#sltSuppPaymentType_"+selectedYodleeID).val();
            if (paymentType == undefined) {
                paymentType = "Purchase Order";
            }
        }
        let taxOption = $('#divLineDetail_' + selectedYodleeID + " #taxOption").val();
        if (selectedLineID) {
            let lineQty = parseInt($('#divLineDetail_' + selectedYodleeID + ' #' + selectedLineID + ' .lineQty').val());
            let lineUnitPrice = $('#divLineDetail_' + selectedYodleeID + ' #' + selectedLineID + ' .lineUnitPrice').val();
            lineUnitPrice = Number(lineUnitPrice.replace(/[^0-9.-]+/g, "")) || 0;
            let lineAmountInput = $('#divLineDetail_' + selectedYodleeID + ' #' + selectedLineID + ' .lineAmountInput').val();
            lineAmountInput = Number(lineAmountInput.replace(/[^0-9.-]+/g, "")) || 0;
            let lineTaxRate = $('#divLineDetail_' + selectedYodleeID + ' #' + selectedLineID + " .lineTaxRate").val();
            let lineTaxRateVal = 0;
            if (lineTaxRate != "") {
                for (let i = 0; i < taxcodeList.length; i++) {
                    if (taxcodeList[i].codename == lineTaxRate) {
                        lineTaxRateVal = taxcodeList[i].coderate;
                    }
                }
            }
            let subTotal = 0;
            if (paymentType == "Invoice" || paymentType == "Purchase Order") {
                subTotal = lineQty * lineUnitPrice;
            } else {
                subTotal = lineAmountInput;
            }
            let lineTaxAmount = subTotal * lineTaxRateVal / 100;
            $('#divLineDetail_' + selectedYodleeID + ' #' + selectedLineID + " .lineSubTotal").text(utilityService.modifynegativeCurrencyFormat(subTotal));
            $('#divLineDetail_' + selectedYodleeID + ' #' + selectedLineID + " .lineTaxAmount").text(utilityService.modifynegativeCurrencyFormat(lineTaxAmount));

            let lineDiscount = (subTotal + lineTaxAmount) * discountRate / 100;
            if (DepOrWith == "received") {
                $('#divLineDetail_' + selectedYodleeID + ' #' + selectedLineID + " .lineDiscount").text(utilityService.modifynegativeCurrencyFormat(lineDiscount));
            }
            if (taxOption == 'tax_exclusive') {
                lineAmount = subTotal + lineTaxAmount - lineDiscount;
            } else if (taxOption == 'tax_inclusive') {
                lineAmount = subTotal - lineDiscount;
            } else {
                lineAmount = subTotal - lineDiscount;
            }
            $('#divLineDetail_' + selectedYodleeID + ' #' + selectedLineID + " .lineAmount").text(utilityService.modifynegativeCurrencyFormat(lineAmount));
        }
        $tblrows.each(function (index) {
            const $tblrow = $(this);
            let lineSubTotal = $tblrow.find(".lineSubTotal").text();
            lineSubTotal = Number(lineSubTotal.replace(/[^0-9.-]+/g, "")) || 0;
            let lineTaxAmount = $tblrow.find(".lineTaxAmount").text();
            lineTaxAmount = Number(lineTaxAmount.replace(/[^0-9.-]+/g, "")) || 0;
            let lineDiscount = $tblrow.find(".lineDiscount").text();
            lineDiscount = Number(lineDiscount.replace(/[^0-9.-]+/g, "")) || 0;
            let lineAmount = $tblrow.find(".lineAmount").text();
            lineAmount = Number(lineAmount.replace(/[^0-9.-]+/g, "")) || 0;

            subTotal += lineSubTotal;
            taxTotal += lineTaxAmount;
            discountTotal += lineDiscount;
            grandTotal += lineAmount;
            if (taxOption == 'tax_exclusive') {
                // grandTotal += lineAmount;
                $('#divLineDetail_' + selectedYodleeID + " #taxTotalDiv").show();
            } else if (taxOption == 'tax_inclusive') {
                // grandTotal += (lineAmount - lineTaxAmount);
                $('#divLineDetail_' + selectedYodleeID + " #taxTotalDiv").show();
            } else {
                // grandTotal += (lineAmount - lineTaxAmount);
                $('#divLineDetail_' + selectedYodleeID + " #taxTotalDiv").hide();
            }
        });
        $(".sub_total").text(utilityService.modifynegativeCurrencyFormat(subTotal));
        $(".tax_total").text(utilityService.modifynegativeCurrencyFormat(taxTotal));
        if (DepOrWith == "received") {
            $(".discount_total").text(utilityService.modifynegativeCurrencyFormat(discountTotal));
        }
        $(".grand_total").text(utilityService.modifynegativeCurrencyFormat(grandTotal));
    }
}
function getClientDetail(clientName, clientType) {
    let clientDetail = null;
    if (clientType == "customer") {
        clientDetail = customerList.filter(customer => {
            return customer.customername == clientName;
        });
        clientDetail = clientDetail.length > 0 ? clientDetail[0] : null;
    } else if (clientType == "supplier") {
        clientDetail = supplierList.filter(supplier => {
            return supplier.suppliername == clientName;
        });
        clientDetail = clientDetail.length > 0 ? clientDetail[0] : null;
    }
    return clientDetail;
}
function setTransactionDetail(Amount, DateIn, DepOrWith) {
    if (selectedYodleeID != null) {
        let clientDetail;
        let toCustomerName = '';
        let paymentType = '';
        if (DepOrWith == "received") {
            $("#suppPaymentType_" + selectedYodleeID).hide();
            $("#transactionTitle_" + selectedYodleeID).text("New Invoice");
            paymentType = 'Invoice';
        } else {
            clientDetail = getClientDetail($('#sender_' + selectedYodleeID).val(), 'customer');
            toCustomerName = clientDetail? clientDetail.customername:'';
            $("#suppPaymentType_" + selectedYodleeID).show();
            paymentType = $('#sltSuppPaymentType_' + selectedYodleeID).val();
            if (paymentType == undefined) {
                $('#sltSuppPaymentType_' + selectedYodleeID).val("Purchase Order");
                paymentType = "Purchase Order";
            }
            $("#transactionTitle_" + selectedYodleeID).text("New "+paymentType);
        }
        $('#PaymentType_'+selectedYodleeID).val(paymentType);
        changeTblReconInvoice(paymentType);
        let discountAmount = 0;
        if (DepOrWith == "received") {
            discountAmount = clientDetail? Amount * clientDetail.discount / 100 : 0;
        }
        let ctax = $('#ctaxRate_'+selectedYodleeID).val();
        if (ctax == "") {
            ctax = $('#whatTaxCode_'+selectedYodleeID).val();
        }
        let taxCodeDetail = taxcodeList.filter(taxcode => {
            return taxcode.codename == ctax;
        });
        taxCodeDetail = taxCodeDetail[0];
        let taxAmount = (taxCodeDetail != undefined)?Amount*taxCodeDetail.coderate/100:0;
        selectedLineID = 'firstLine';
        let taxrateName = (taxCodeDetail != undefined)? taxCodeDetail.codename:'';

        let dateIn_val = (DateIn !='')? moment(DateIn).format("DD/MM/YYYY"): DateIn;
        $('#DateIn_'+selectedYodleeID).val(dateIn_val);

        $('#labelPaymentMethod_'+selectedYodleeID).text(DepOrWith=='spent'?'Spent as':'Received as');
        $('#divLineDetail_'+selectedYodleeID+' #labelWho').text(DepOrWith=='spent'?'To':'From');
        // $('#divLineDetail_'+selectedYodleeID+' #FromWho').val(Who);
        $('#divLineDetail_'+selectedYodleeID+' #TotalAmount').val(utilityService.modifynegativeCurrencyFormat(Amount));
        $('#divLineDetail_'+selectedYodleeID+' #textSORBottom').text(DepOrWith=='spent'?'spent - Spent':'received - Received');
        $('#divLineDetail_'+selectedYodleeID+' #totalBottom1').text(utilityService.modifynegativeCurrencyFormat(Amount));
        $('#divLineDetail_'+selectedYodleeID+' #totalBottom2').text(utilityService.modifynegativeCurrencyFormat(Amount));
        $('#divLineDetail_'+selectedYodleeID+' #textComment').text($('#why_'+selectedYodleeID).val());
        $('#YNote_'+selectedYodleeID).val($('#YNote_'+selectedYodleeID).text());

        $('#divLineDetail_'+selectedYodleeID+' #firstLine .lineProductName').val('');
        $('#divLineDetail_'+selectedYodleeID+' #firstLine .lineProductDesc').val($('#YNote_'+selectedYodleeID).text());
        $('#divLineDetail_'+selectedYodleeID+' #firstLine .lineQty').val(1);
        $('#divLineDetail_'+selectedYodleeID+' #firstLine .lineUnitPrice').val(utilityService.modifynegativeCurrencyFormat(Amount));
        $('#divLineDetail_'+selectedYodleeID+' #firstLine .lineSubTotal').val(utilityService.modifynegativeCurrencyFormat(Amount));
        $('#divLineDetail_'+selectedYodleeID+' #firstLine .lineAmountInput').val(utilityService.modifynegativeCurrencyFormat(Amount));
        if (DepOrWith == "spent") { // purchase order need customer field
            $('#divLineDetail_'+selectedYodleeID+' #firstLine .lineAccountID').val($('#whatID_'+selectedYodleeID).val());
            $('#divLineDetail_'+selectedYodleeID+' #firstLine .lineAccountName').val($('#what_'+selectedYodleeID).val());
        }
        if (DepOrWith == "received") { // invoice need discount field
            $('#divLineDetail_'+selectedYodleeID+' #firstLine .lineDiscount').val(utilityService.modifynegativeCurrencyFormat(discountAmount));
        }
        $('#divLineDetail_'+selectedYodleeID+' #firstLine .lineTaxRate').val(taxrateName);
        $('#divLineDetail_'+selectedYodleeID+' #firstLine .lineTaxAmount').val(utilityService.modifynegativeCurrencyFormat(taxAmount));
        $('#divLineDetail_'+selectedYodleeID+' #firstLine .lineAmount').val(utilityService.modifynegativeCurrencyFormat(parseFloat(Amount) - discountAmount));

        setTimeout(function () {
            setCalculated();
            $('#' + selectedLineID + " .btnRemove").hide();
        }, 1000);
    }
}
function changeTblReconInvoice(type) {
    if (selectedYodleeID) {
        $("#transactionTitle_" + selectedYodleeID).text("New " + type);
        // Never change field: Description,
        if (type == "Invoice") {
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice thead>tr th.colAccount").hide();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice thead>tr th.colItem").show();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice thead>tr th.colQty").show();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice thead>tr th.colUnitPrice").show();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice thead>tr th.colSubTotal").show();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice thead>tr th.colAmountInput").hide();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice thead>tr th.colDiscount").show();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice thead>tr th.colCustomer").hide();

            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice tbody>tr td.colAccount").hide();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice tbody>tr td.colItem").show();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice tbody>tr td.colQty").show();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice tbody>tr td.colUnitPrice").show();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice tbody>tr td.colSubTotal").show();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice tbody>tr td.colAmountInput").hide();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice tbody>tr td.colDiscount").show();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice tbody>tr td.colCustomer").hide();
        } else if (type == "Purchase Order") {
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice thead>tr th.colAccount").hide();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice thead>tr th.colItem").show();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice thead>tr th.colQty").show();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice thead>tr th.colUnitPrice").show();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice thead>tr th.colSubTotal").show();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice thead>tr th.colAmountInput").hide();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice thead>tr th.colDiscount").hide();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice thead>tr th.colCustomer").show();

            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice tbody>tr td.colAccount").hide();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice tbody>tr td.colItem").show();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice tbody>tr td.colQty").show();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice tbody>tr td.colUnitPrice").show();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice tbody>tr td.colSubTotal").show();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice tbody>tr td.colAmountInput").hide();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice tbody>tr td.colDiscount").hide();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice tbody>tr td.colCustomer").show();
        } else if (type == "Bill") {
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice thead>tr th.colAccount").show();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice thead>tr th.colItem").hide();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice thead>tr th.colQty").hide();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice thead>tr th.colUnitPrice").hide();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice thead>tr th.colSubTotal").hide();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice thead>tr th.colAmountInput").show();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice thead>tr th.colDiscount").hide();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice thead>tr th.colCustomer").show();

            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice tbody>tr td.colAccount").show();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice tbody>tr td.colItem").hide();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice tbody>tr td.colQty").hide();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice tbody>tr td.colUnitPrice").hide();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice tbody>tr td.colSubTotal").hide();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice tbody>tr td.colAmountInput").show();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice tbody>tr td.colDiscount").hide();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice tbody>tr td.colCustomer").show();
        } else if (type == "Cheque") {
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice thead>tr th.colAccount").show();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice thead>tr th.colItem").hide();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice thead>tr th.colQty").hide();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice thead>tr th.colUnitPrice").hide();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice thead>tr th.colSubTotal").hide();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice thead>tr th.colAmountInput").show();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice thead>tr th.colDiscount").hide();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice thead>tr th.colCustomer").hide();

            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice tbody>tr td.colAccount").show();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice tbody>tr td.colItem").hide();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice tbody>tr td.colQty").hide();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice tbody>tr td.colUnitPrice").hide();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice tbody>tr td.colSubTotal").hide();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice tbody>tr td.colAmountInput").show();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice tbody>tr td.colDiscount").hide();
            $("#divLineDetail_" + selectedYodleeID + " #tblReconInvoice tbody>tr td.colCustomer").hide();
        }
        if (type != "Invoice") {
            let $tblrows = $('#divLineDetail_' + selectedYodleeID + ' #tblReconInvoice tbody tr');
            $tblrows.each(function (index) {
                if (this.id != "firstLine") {
                    $(this).remove();
                }
            });
        }
    }
}

function openTransactionDetail(item){
    if (selectedYodleeID) {
        closeTransactionDetail();
    }
    selectedYodleeID = item.YodleeLineID;
    let who = $('#who_'+selectedYodleeID).val();
    who = (who != '')?who:item.YodleeDescription;
    let amount = item.YodleeAmount;
    let dateIn = item.SortDate;
    $('#DepOrWith_'+selectedYodleeID).val(item.deporwith);

    $('#createNav_'+selectedYodleeID+' a.nav-link').removeClass('active');
    $('#createNav_'+selectedYodleeID).hide();
    $('#transferNav_'+selectedYodleeID).hide();
    $('#discussNav_'+selectedYodleeID+' a.nav-link').removeClass('active');
    $('#findMatchNav_'+selectedYodleeID+' a.nav-link').removeClass('active');
    $('#findMatchNav_'+selectedYodleeID).hide();
    $('#matchNav_'+selectedYodleeID+' a.nav-link').addClass('active');

    $('#match_'+selectedYodleeID).addClass('show');
    $('#match_'+selectedYodleeID).addClass('active');
    $('#create_'+selectedYodleeID).removeClass('show');
    $('#create_'+selectedYodleeID).removeClass('active');
    $('#discuss_'+selectedYodleeID).removeClass('show');
    $('#discuss_'+selectedYodleeID).removeClass('active');
    $('#match_'+selectedYodleeID+' .textFindMatch').show();
    $('#match_'+selectedYodleeID+' .btnFindMatch').hide();

    $('#divItemBox_'+selectedYodleeID).addClass('itemBox');
    $('#divLineDetail_'+selectedYodleeID).show();
    let $tblrows = $('#divLineDetail_' + selectedYodleeID + ' #tblReconInvoice tbody tr');
    $tblrows.each(function (index) {
        if (this.id != "firstLine") {
            $(this).remove();
        }
    });
    setTransactionDetail(amount, dateIn, item.deporwith);
}
function closeTransactionDetail() {
    if (selectedYodleeID) {
        $('#divLineDetail_' + selectedYodleeID).hide();
        $('#divLineFindMatch_' + selectedYodleeID).hide();
        $('#divLineFindMatchTotal_'+selectedYodleeID).hide();
        $('#divItemBox_'+selectedYodleeID).removeClass('itemBox');

        $('#findMatchNav_' + selectedYodleeID + ' a.nav-link').removeClass('active');
        $('#transferNav_' + selectedYodleeID + ' a.nav-link').removeClass('active');
        $('#discussNav_' + selectedYodleeID + ' a.nav-link').removeClass('active');
        $('#matchNav_' + selectedYodleeID + ' a.nav-link').removeClass('active');
        $('#createNav_' + selectedYodleeID).show();
        $('#transferNav_' + selectedYodleeID).show();
        $('#findMatchNav_' + selectedYodleeID).show();
        $('#createNav_' + selectedYodleeID + ' a.nav-link').addClass('active');

        $('#match_' + selectedYodleeID).removeClass('show');
        $('#match_' + selectedYodleeID).removeClass('active');
        $('#create_' + selectedYodleeID).addClass('show');
        $('#create_' + selectedYodleeID).addClass('active');
        $('#discuss_' + selectedYodleeID).removeClass('show');
        $('#discuss_' + selectedYodleeID).removeClass('active');
        $('#match_' + selectedYodleeID + ' .textFindMatch').hide();
        $('#match_' + selectedYodleeID + ' .btnFindMatch').show();
    }
    selectedYodleeID = null;
}

function setCalculated2() {
    if (selectedYodleeID) {
        let $tblrows = $('#divLineFindMatch_' + selectedYodleeID + ' #tblViewTransaction tbody tr');
        let subTotal = 0;
        let DepOrWith = $("#DepOrWith_"+selectedYodleeID).val();
        let matchTotal = $("#divLineFindMatch_"+selectedYodleeID+" #matchTotal").text();
        matchTotal = Number(matchTotal.replace(/[^0-9.-]+/g, "")) || 0;

        let viewIDs = [];
        $("#divLineFindMatch_"+selectedYodleeID+' .tblViewTransaction tbody tr').each(function() {
            let vid = $(this).find('input[type="checkbox"]').attr("id");
            if (vid != undefined) {
                vid = vid.split("_").pop();
                viewIDs.push(vid);
            }
        });
        if (viewIDs.length > 0) {
            $("#divLineFindMatch_" + selectedYodleeID + ' .tblFindTransaction tbody tr').each(function () {
                let fid = $(this).find('input[type="checkbox"]').attr("id");
                if (fid != undefined) {
                    fid = fid.split("_").pop();
                    if (jQuery.inArray(fid, viewIDs) != -1) {
                        $(this).addClass("matchedRow");
                        $(this).find('input[type="checkbox"]').prop('checked', true);
                    }
                }
            });
        }

        $tblrows.each(function (index) {
            const $tblrow = $(this);
            let lineSpentAmount = $tblrow.find(".colSpentAmount").text();
            lineSpentAmount = Number(lineSpentAmount.replace(/[^0-9.-]+/g, "")) || 0;
            let lineReceivedAmount = $tblrow.find(".colReceivedAmount").text();
            lineReceivedAmount = Number(lineReceivedAmount.replace(/[^0-9.-]+/g, "")) || 0;
            if (DepOrWith == "spent") {
                subTotal += lineSpentAmount;
                subTotal -= lineReceivedAmount;
            }
            if (DepOrWith == "received") {
                subTotal -= lineSpentAmount;
                subTotal += lineReceivedAmount;
            }
        });
        let outTotal = matchTotal - subTotal;
        if (outTotal == 0) {
            $("#divLineFindMatch_"+selectedYodleeID+" #textMatched").show();
            $("#divLineFindMatch_"+selectedYodleeID+" #textOutBy").hide();
            $("#divLineFindMatch_"+selectedYodleeID+" #btnReconcile").prop('disabled', false);
        } else {
            $("#divLineFindMatch_"+selectedYodleeID+" #textMatched").hide();
            $("#divLineFindMatch_"+selectedYodleeID+" #textOutBy").show();
            $("#divLineFindMatch_"+selectedYodleeID+" #matchOutBy").text(utilityService.modifynegativeCurrencyFormat(outTotal));
            $("#divLineFindMatch_"+selectedYodleeID+" #btnReconcile").prop('disabled', true);
        }
        $("#divLineFindMatch_" + selectedYodleeID + " #matchSubtotal").text(utilityService.modifynegativeCurrencyFormat(subTotal));
    }
}
function openFindMatch(item){
    if (selectedYodleeID) {
        closeTransactionDetail();
    }
    selectedYodleeID = item.YodleeLineID;
    $('#DepOrWith_'+selectedYodleeID).val(item.deporwith);
    // $('#divLineFindMatch_'+selectedYodleeID+ ' #tblFindTransaction').empty();
    $('#divLineFindMatch_'+selectedYodleeID+ ' #tblFindTransaction').DataTable({
        sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
        paging: false,
        filter: false,
        scrollCollapse: true,
        colReorder: {
            fixedColumnsLeft: 1
        },
        // select: true,
        // destroy: true,
        lengthMenu: [
            [initialDatatableLoad, -1],
            [initialDatatableLoad, "All"]
        ],
        info: true,
        responsive: true,
        order: [
            [1, "desc"]
        ],
        action: function() {
            $('#divLineFindMatch_'+selectedYodleeID+ ' #tblFindTransaction').DataTable().ajax.reload();
        }
    });
    $('#divLineFindMatch_'+selectedYodleeID+ ' #tblFindTransaction').wrap('<div class="dataTables_scroll" />');

    // $('#divLineFindMatch_'+selectedYodleeID+ ' #tblViewTransaction').empty();
    $('#divLineFindMatch_'+selectedYodleeID+ ' #tblViewTransaction').DataTable({
        sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
        paging: false,
        filter: false,
        scrollCollapse: true,
        colReorder: {
            fixedColumnsLeft: 1
        },
        // select: true,
        // destroy: true,
        lengthMenu: [
            [initialDatatableLoad, -1],
            [initialDatatableLoad, "All"]
        ],
        info: true,
        responsive: true,
        order: [
            [1, "desc"]
        ],
        action: function() {
            $('#divLineFindMatch_'+selectedYodleeID+ ' #tblViewTransaction').DataTable().ajax.reload();
        }
    });
    $('#divLineFindMatch_'+selectedYodleeID+ ' #tblViewTransaction').wrap('<div class="dataTables_scroll" />');

    $('#createNav_'+selectedYodleeID+' a.nav-link').removeClass('active');
    $('#createNav_'+selectedYodleeID).hide();
    $('#transferNav_'+selectedYodleeID).hide();
    $('#discussNav_'+selectedYodleeID+' a.nav-link').removeClass('active');
    $('#findMatchNav_'+selectedYodleeID+' a.nav-link').removeClass('active');
    $('#findMatchNav_'+selectedYodleeID).hide();
    $('#matchNav_'+selectedYodleeID+' a.nav-link').addClass('active');

    $('#create_'+selectedYodleeID).removeClass('show');
    $('#create_'+selectedYodleeID).removeClass('active');
    $('#transfer_'+selectedYodleeID).removeClass('show');
    $('#transfer_'+selectedYodleeID).removeClass('active');
    $('#discuss_'+selectedYodleeID).removeClass('show');
    $('#discuss_'+selectedYodleeID).removeClass('active');
    $('#match_'+selectedYodleeID).addClass('show');
    $('#match_'+selectedYodleeID).addClass('active');
    $('#match_'+selectedYodleeID+' .textFindMatch').show();
    $('#match_'+selectedYodleeID+' .btnFindMatch').hide();
    if (item.deporwith == 'spent') {
        $('#divLineFindMatch_'+selectedYodleeID+ ' #labelChkSOR').text("Show Received Items");
    } else {
        $('#divLineFindMatch_'+selectedYodleeID+ ' #labelChkSOR').text("Show Spent Items");
    }
    $('#divLineFindMatch_'+selectedYodleeID+ ' #matchTotal').text((utilityService.modifynegativeCurrencyFormat(item.YodleeAmount)));
    $('#divLineFindMatch_'+selectedYodleeID+ ' #matchTotal2').text((utilityService.modifynegativeCurrencyFormat(item.YodleeAmount)));
    $('#divLineFindMatchTotal_'+selectedYodleeID+ ' #matchTotal3').text((utilityService.modifynegativeCurrencyFormat(item.YodleeAmount)));

    $('#divItemBox_'+selectedYodleeID).addClass('itemBox');
    $('#divLineFindMatch_'+selectedYodleeID).show();
    $('#divLineFindMatchTotal_'+selectedYodleeID).show();
    setTimeout(function () {
        setCalculated2();
    }, 1000);
}

function handleSaveError(err) {
    swal({
        title: 'Oooops...',
        text: err,
        type: 'error',
        showCancelButton: false,
        confirmButtonText: 'Try Again'
    }).then((result) => {
        if (result.value) {if(err == checkResponseError){window.open('/', '_self');}}
        else if (result.dismiss == 'cancel') {

        }
    });
    $('.fullScreenSpin').css('display', 'none');
}
function saveDiscuss(text, yodleeID) {
    if (yodleeID) {
        $('.fullScreenSpin').css('display', 'inline-block');
        let employeeID = Session.get('mySessionEmployeeLoggedID');
        let employeename = Session.get('mySessionEmployee');
        let bankaccountid = parseInt(Session.get('bankaccountid'));
        let bankAccountName = (Session.get("bankaccountname") != undefined && Session.get("bankaccountname") != '')?Session.get("bankaccountname"):null;
        let reconcileID = $("#reconID_"+yodleeID).val();
        reconcileID = (reconcileID && reconcileID != '')?parseInt(reconcileID):0;
        let objReconDetails = {
            type: "TReconciliation",
            fields: {
                ID: reconcileID,
                AccountID: bankaccountid || 0,
                AccountName: bankAccountName || '',
                // CloseBalance: closebalance,
                Deleted: false,
                DeptName: defaultDept,
                EmployeeID: parseInt(employeeID) || 0,
                EmployeeName: employeename || '',
                Finished: true,
                Notes: text || '',
                OnHold: false,
                // OpenBalance: openbalance,
                StatementNo: yodleeID.toString() || '0',
            }
        };
        reconService.saveReconciliation(objReconDetails).then(function (resultRecon) {
            if (resultRecon.fields.ID) {
                $("#reconID_"+yodleeID).val(resultRecon.fields.ID);
                $('.fullScreenSpin').css('display', 'none');
            } else {
                $('.fullScreenSpin').css('display', 'none');
            }
        }).catch(function (err) {
            handleSaveError(err);
        });
    }
}
function openFindMatchAfterSave(savedReconID, rowID) {
    if (selectedYodleeID) {
        $("#reconID_"+selectedYodleeID).val(savedReconID);
        $('#btnFindMatch_'+selectedYodleeID).trigger("click");
    }
}
function setCurrencyFormatForInput(target) {
    let input = 0;
    if (!isNaN($(target).val())) {
        input = parseFloat($(target).val()) || 0;
        $(target).val(utilityService.modifynegativeCurrencyFormat(input));
    } else {
        input = Number($(target).val().replace(/[^0-9.-]+/g, "")) || 0;
        $(target).val(utilityService.modifynegativeCurrencyFormat(input));
    }
}
