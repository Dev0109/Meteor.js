import {SalesBoardService} from '../js/sales-service';
import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../js/core-service';
import {EmployeeProfileService} from "../js/profile-service";
import {AccountService} from "../accounts/account-service";
import {InvoiceService} from "../invoice/invoice-service";
import {UtilityService} from "../utility-service";
import { SideBarService } from '../js/sidebar-service';
import {OrganisationService} from '../js/organisation-service';
import {TaxRateService} from '../settings/settings-service';
import 'jquery-ui-dist/external/jquery/jquery';
import 'jquery-ui-dist/jquery-ui';
import 'jquery-editable-select';

Template.inventorassetaccountspop.onCreated(function(e) {
    const templateObject = Template.instance();
    templateObject.records = new ReactiveVar();
    templateObject.CleintName = new ReactiveVar();
    templateObject.Department = new ReactiveVar();
    templateObject.Date = new ReactiveVar();
    templateObject.DueDate = new ReactiveVar();
    templateObject.CreditNo = new ReactiveVar();
    templateObject.RefNo = new ReactiveVar();
    templateObject.Branding = new ReactiveVar();
    templateObject.Currency = new ReactiveVar();
    templateObject.Total = new ReactiveVar();
    templateObject.Subtotal = new ReactiveVar();
    templateObject.TotalTax = new ReactiveVar();
    templateObject.creditrecord = new ReactiveVar({});
    templateObject.taxrateobj = new ReactiveVar();
    templateObject.Accounts = new ReactiveVar([]);

    templateObject.CreditId = new ReactiveVar();
    templateObject.selectedCurrency = new ReactiveVar([]);
    templateObject.inputSelectedCurrency = new ReactiveVar([]);
    templateObject.currencySymbol = new ReactiveVar([]);
    templateObject.deptrecords = new ReactiveVar();
    templateObject.viarecords = new ReactiveVar();
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
})

Template.inventorassetaccountspop.onRendered(function() {
    let tempObj = Template.instance();
    let sideBarService = new SideBarService();
    let utilityService = new UtilityService();
    let accountService = new AccountService();
    let tableProductList;
    var splashArrayAccountList = new Array();
    var splashArrayTaxRateList = new Array();
    const taxCodesList = [];
    var currentLoc = FlowRouter.current().route.path;
    let accBalance = 0;
    let taxRateService = new TaxRateService();
    tempObj.getAllExpenseAccounts = function() {
        getVS1Data('TAccountVS1').then(function(dataObject) {
            if (dataObject.length === 0) {
                sideBarService.getAccountListVS1().then(function(data) {
                    let records = [];
                    let inventoryData = [];
                    addVS1Data('TAccountVS1',JSON.stringify(data));
                    let tempArray = data.taccountvs1;
                    tempArray = tempArray.filter (account => {
                        return account.fields.AccountTypeName === 'OCASSET';
                    })
                    for (let i = 0; i < tempArray.length; i++) {
                       if (!isNaN(tempArray[i].fields.Balance)) {
                      	accBalance = utilityService.modifynegativeCurrencyFormat(tempArray[i].fields.Balance) || 0.00;
                      } else {
                      	accBalance = Currency + "0.00";
                      }
                      var dataList = [
                      	tempArray[i].fields.AccountName || '-',
                      	tempArray[i].fields.Description || '',
                      	tempArray[i].fields.AccountNumber || '',
                      	tempArray[i].fields.AccountTypeName || '',
                      	accBalance,
                      	tempArray[i].fields.TaxCode || '',
                        tempArray[i].fields.ID || ''
                      ];
                       if (currentLoc === "/receiptsoverview"){
                          if(tempArray[i].fields.AllowExpenseClaim){
                              splashArrayAccountList.push(dataList);
                          }
                      }else{
                        splashArrayAccountList.push(dataList);
                      }

                  }
                    //localStorage.setItem('VS1PurchaseAccountList', JSON.stringify(splashArrayAccountList));
                    if (splashArrayAccountList) {
                        $('#tblInventoryWastageAccount').dataTable({
                            data: splashArrayAccountList,
                            "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                            // paging: true,
                            // "aaSorting": [],
                            // "orderMulti": true,
                            columnDefs: [
                                { className: "productName", "targets": [0] },
                                { className: "productDesc", "targets": [1] },
                                { className: "accountnumber", "targets": [2] },
                                { className: "salePrice", "targets": [3] },
                                { className: "prdqty text-right", "targets": [4] },
                                { className: "taxrate", "targets": [5] },
                                { className: "colAccountID hiddenColumn", "targets": [6] }
                            ],
                            select: true,
                            destroy: true,
                            colReorder: true,
                            pageLength: initialDatatableLoad,
                            lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                            info: true,
                            responsive: true,
                            language: { search: "",searchPlaceholder: "Search List..." },
                            "fnInitComplete": function () {
                              $("<button class='btn btn-primary btnAddNewAccount' data-dismiss='modal' data-toggle='modal' data-target='#addAccountModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblInventoryWastageAccount_filter");
                                $("<button class='btn btn-primary btnRefreshAccount' type='button' id='btnRefreshAccount' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblInventoryWastageAccount_filter");
                            }
                        });
                        $('div.dataTables_filter input').addClass('form-control form-control-sm');
                    }
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.taccountvs1;
                useData = useData.filter (account => {
                    return account.fields.AccountTypeName === 'OCASSET';
                })
                let records = [];
                let inventoryData = [];
                for (let i = 0; i < useData.length; i++) {
                    if (!isNaN(useData[i].fields.Balance)) {
                        accBalance = utilityService.modifynegativeCurrencyFormat(useData[i].fields.Balance) || 0.00;
                    } else {
                        accBalance = Currency + "0.00";
                    }
                    var dataList = [
                        useData[i].fields.AccountName || '-',
                        useData[i].fields.Description || '',
                        useData[i].fields.AccountNumber || '',
                        useData[i].fields.AccountTypeName || '',
                        accBalance,
                        useData[i].fields.TaxCode || '',
                        useData[i].fields.ID || ''
                    ];
                    if (currentLoc === "/receiptsoverview"){
                        if(data.taccountvs1[i].fields.AllowExpenseClaim){
                            splashArrayAccountList.push(dataList);
                        }
                    }else{
                      splashArrayAccountList.push(dataList);
                    }

                }
                //localStorage.setItem('VS1PurchaseAccountList', JSON.stringify(splashArrayAccountList));
                if (splashArrayAccountList) {
                    $('#tblInventoryWastageAccount').dataTable({
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
                        language: { search: "",searchPlaceholder: "Search List..." },
                        "fnInitComplete": function () {
                            $("<button class='btn btn-primary btnAddNewAccount' data-dismiss='modal' data-toggle='modal' data-target='#addAccountModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblInventoryWastageAccount_filter");
                            $("<button class='btn btn-primary btnRefreshAccount' type='button' id='btnRefreshAccount' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblInventoryWastageAccount_filter");
                        }
                    });
                    $('div.dataTables_filter input').addClass('form-control form-control-sm');
                }
            }
        }).catch(function(err) {
            sideBarService.getAccountListVS1().then(function(data) {
                let records = [];
                let inventoryData = [];
                let tempArray = data.taccountvs1;
                tempArray = tempArray.filter(account => {
                    return account.fields.AccountTypeName === 'OCASSET'
                })
                for (let i = 0; i < tempArray.length; i++) {
                   if (!isNaN(tempArray[i].fields.Balance)) {
                    accBalance = utilityService.modifynegativeCurrencyFormat(tempArray[i].fields.Balance) || 0.00;
                  } else {
                    accBalance = Currency + "0.00";
                  }
                  var dataList = [
                    tempArray[i].fields.AccountName || '-',
                    tempArray[i].fields.Description || '',
                    tempArray[i].fields.AccountNumber || '',
                    tempArray[i].fields.AccountTypeName || '',
                    accBalance,
                    tempArray[i].fields.TaxCode || '',
                    tempArray[i].fields.ID || ''
                  ];
                 if (currentLoc === "/receiptsoverview"){
                      if(tempArray[i].fields.AllowExpenseClaim){
                          splashArrayAccountList.push(dataList);
                      }
                  }else{
                    splashArrayAccountList.push(dataList);
                  }

              }
                //localStorage.setItem('VS1PurchaseAccountList', JSON.stringify(splashArrayAccountList));
                if (splashArrayAccountList) {
                    $('#tblInventoryWastageAccount').dataTable({
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
                        language: { search: "",searchPlaceholder: "Search List..." },
                        "fnInitComplete": function () {
                            $("<button class='btn btn-primary btnAddNewAccount' data-dismiss='modal' data-toggle='modal' data-target='#addAccountModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("tblInventoryWastageAccount_filter");
                            $("<button class='btn btn-primary btnRefreshAccount' type='button' id='btnRefreshAccount' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblInventoryWastageAccount_filter");
                        }

                    });
                    $('div.dataTables_filter input').addClass('form-control form-control-sm');
                }
            });
        });
    };
    tempObj.getAllExpenseAccounts();
})

Template.inventorassetaccountspop.helpers({

})
