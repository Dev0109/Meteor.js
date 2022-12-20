import { ReactiveVar } from 'meteor/reactive-var';
import { UtilityService } from "../utility-service";
import '../lib/global/erp-objects';
import '../lib/global/indexdbstorage.js';
import 'jquery-editable-select';
import { AccountService } from "../accounts/account-service";
import { ProductService } from "../product/product-service";
import { PurchaseBoardService } from "../js/purchase-service";
import { SideBarService } from '../js/sidebar-service';
import { Random } from 'meteor/random';

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
let accountService = new AccountService();

let selectedLineID = null;
let customerList = [];
let supplierList = [];
let taxcodeList = [];

Template.newreconrule.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.taxraterecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.defaultCustomerTerms = new ReactiveVar();
    templateObject.defaultSupplierTerms = new ReactiveVar();

    templateObject.spentConditionData = new ReactiveVar([]);
    templateObject.spentFixedItemData = new ReactiveVar([]);
    templateObject.spentPercentItemData = new ReactiveVar([]);
    templateObject.receivedConditionData = new ReactiveVar([]);
    templateObject.receivedFixedItemData = new ReactiveVar([]);
    templateObject.receivedPercentItemData = new ReactiveVar([]);
    templateObject.transferConditionData = new ReactiveVar([]);
});

Template.newreconrule.onRendered(function() {
    const templateObject = Template.instance();
    const productService = new ProductService();
    const supplierService = new PurchaseBoardService();

    const splashArrayTaxRateList = [];

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

    templateObject.getFields = function () {
        let datalist  = [];
        datalist.push(['Any text field', '']);
        datalist.push(['Payee', '']);
        datalist.push(['Description', '']);
        datalist.push(['Amount', '']);
        datalist.push(['Reference', '']);
        datalist.push(['Analysis code', '']);
        if (datalist) {
            $('#tblFields').dataTable({
                data: datalist,
                "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                paging: true,
                "aaSorting": [],
                "orderMulti": true,
                columnDefs: [
                    { className: "colName", "targets": [0] },
                    { className: "colDesc", "targets": [1] }
                ],
                colReorder: true,
                "order": [
                    [0, "asc"]
                ],
                pageLength: initialDatatableLoad,
                lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                info: true,
                responsive: true
            });
            $('div.dataTables_filter input').addClass('form-control form-control-sm');
        }
    }
    templateObject.getConditions = function () {
        let datalist  = [];
        datalist.push(['equals', '']);
        datalist.push(['contains', '']);
        datalist.push(['starts with', '']);
        datalist.push(['is blank', '']);
        if (datalist) {
            $('#tblConditions').dataTable({
                data: datalist,
                "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                paging: true,
                "aaSorting": [],
                "orderMulti": true,
                columnDefs: [
                    { className: "colName", "targets": [0] },
                    { className: "colDesc", "targets": [1] }
                ],
                colReorder: true,
                "order": [
                    [0, "asc"]
                ],
                pageLength: initialDatatableLoad,
                lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                info: true,
                responsive: true
            });
            $('div.dataTables_filter input').addClass('form-control form-control-sm');
        }
    }

    setTimeout(function () {
        templateObject.getAllAccounts();
        templateObject.getAllTaxCodes();
        templateObject.getAllCustomers();
        templateObject.getAllSuppliers();
        templateObject.getFields();
        templateObject.getConditions();
        templateObject.defaultCustomerTerms.set('test');
        templateObject.defaultSupplierTerms.set('test');
        // templateObject.getDefaultCustomerTerms();
        // templateObject.getDefaultSupplierTerms();
    }, 100);

    $('#sltCustomer').editableSelect();
    $('#sltCustomer').editableSelect().on('click.editable-select', function (e, li) {
        const $each = $(this);
        const offset = $each.offset();
        const customerDataName = e.target.value || '';
        if (e.pageX > offset.left + $each.width() - 8) { // X button 16px wide?
            openCustomerModal();
        } else {
            if (customerDataName.replace(/\s/g, '') != '') {
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
    });
    $('#sltSupplier').editableSelect();
    $('#sltSupplier').editableSelect().on('click.editable-select', function (e, li) {
        const $each = $(this);
        const offset = $each.offset();
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
    });
    $('#sltBankAccount').editableSelect();
    $('#sltBankAccount').editableSelect().on('click.editable-select', function (e, li) {
        const $each = $(this);
        const offset = $each.offset();
        let accountDataName = e.target.value ||'';
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

    $(document).on("click", ".newbankrule #tblAccount tbody tr", function(e) {
        $(".colAccountName").removeClass('boldtablealertsborder');
        $(".colAccount").removeClass('boldtablealertsborder');
        const table = $(this);
        let accountname = table.find(".productName").text();
        let accountId = table.find(".colAccountID").text();
        $('#bankAccountListModal').modal('toggle');
        $('#sltBankAccount').val(accountname);
        $('#sltBankAccountID').val(accountId);
        $('#tblAccount_filter .form-control-sm').val('');
    });
    $(document).on("click", ".newbankrule #tblFullAccount tbody tr", function(e) {
        $(".colAccountName").removeClass('boldtablealertsborder');
        $(".colAccount").removeClass('boldtablealertsborder');
        $('#fullAccountListModal').modal('toggle');
        if (selectedLineID) {
            let lineAccountName = $(this).find(".productName").text();
            let prefix = selectedLineID.substring(0, 2);
            if (prefix == "sf") {
                $("#tblSpentFixedItem tbody #" + selectedLineID + " .lineAccountName").val(lineAccountName);
            } else if (prefix == "sp") {
                $("#tblSpentPercentItem tbody #" + selectedLineID + " .lineAccountName").val(lineAccountName);
            } else if (prefix == "rf") {
                $("#tblReceivedFixedItem tbody #" + selectedLineID + " .lineAccountName").val(lineAccountName);
            } else if (prefix == "rp") {
                $("#tblReceivedPercentItem tbody #" + selectedLineID + " .lineAccountName").val(lineAccountName);
            }
        }
        $('#tblFullAccount_filter .form-control-sm').val('');
    });
    $(document).on("click", ".newbankrule #tblCustomerlist tbody tr", function (e) {
        $('#customerListModal').modal('toggle');
        let lineCustomerID = $(this).find(".colID").text();
        let lineCustomerName = $(this).find(".colCompany").text();
        $("#sltCustomer").val(lineCustomerName);
        $("#sltCustomerID").val(lineCustomerID);
    });
    $(document).on("click", ".newbankrule #tblSupplierlist tbody tr", function (e) {
        $('#supplierListModal').modal('toggle');
        let lineSupplierID = $(this).find(".colID").text();
        let lineSupplierName = $(this).find(".colCompany").text();
        $("#sltSupplier").val(lineSupplierName);
        $("#sltSupplierID").val(lineSupplierID);
    });
    $(document).on("click", ".newbankrule #tblTaxRate tbody tr", function (e) {
        $('#taxRateListModal').modal('toggle');
        if (selectedLineID) {
            let lineTaxCode = $(this).find(".taxName").text();
            let prefix = selectedLineID.substring(0, 2);
            if (prefix == "sf") {
                $("#tblSpentFixedItem tbody #" + selectedLineID + " .lineTaxCode").val(lineTaxCode);
            } else if (prefix == "sp") {
                $("#tblSpentPercentItem tbody #" + selectedLineID + " .lineTaxCode").val(lineTaxCode);
            } else if (prefix == "rf") {
                $("#tblReceivedFixedItem tbody #" + selectedLineID + " .lineTaxCode").val(lineTaxCode);
            } else if (prefix == "rp") {
                $("#tblReceivedPercentItem tbody #" + selectedLineID + " .lineTaxCode").val(lineTaxCode);
            }
        }
    });
    $(document).on("click", "#tblFields tbody tr", function (e) {
        $('#fieldModal').modal('toggle');
        if (selectedLineID) {
            let lineField = $(this).find(".colName").text();
            let prefix = selectedLineID.substring(0, 2);
            if (prefix == "sc") {
                $("#tblSpentCondition tbody #" + selectedLineID + " .lineField").val(lineField);
            } else if (prefix == "rc") {
                $("#tblReceivedCondition tbody #" + selectedLineID + " .lineField").val(lineField);
            } else if (prefix == "tc") {
                $("#tblTransferCondition tbody #" + selectedLineID + " .lineField").val(lineField);
            }
        }
    });
    $(document).on("click", "#tblConditions tbody tr", function (e) {
        $('#conditionModal').modal('toggle');
        if (selectedLineID) {
            let lineCondition = $(this).find(".colName").text();
            let prefix = selectedLineID.substring(0, 2);
            if (prefix == "sc") {
                $("#tblSpentCondition tbody #" + selectedLineID + " .lineCondition").val(lineCondition);
            } else if (prefix == "rc") {
                $("#tblReceivedCondition tbody #" + selectedLineID + " .lineCondition").val(lineCondition);
            } else if (prefix == "tc") {
                $("#tblTransferCondition tbody #" + selectedLineID + " .lineCondition").val(lineCondition);
            }
        }
    });
});

Template.newreconrule.events({
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
    'click .lineField, keydown .lineField': function (event) {
        selectedLineID = $(event.target).closest('tr').attr('id');
        $("#fieldModal").modal("toggle");
    },
    'click .lineCondition, keydown .lineCondition': function (event) {
        selectedLineID = $(event.target).closest('tr').attr('id');
        $("#conditionModal").modal("toggle");
    },
    'change .lineValue': function (event) {
        selectedLineID = $(event.target).closest('tr').attr('id');
    },
    'click .lineAccountName, keydown .lineAccountName': function (event) {
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
    'click .lineTaxCode, keydown .lineTaxCode': function (event) {
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
    'keydown .lineAmount, keydown .linePercent': function (event) {
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
    'change .lineAmount': function (event) {
        selectedLineID = $(event.target).closest('tr').attr('id');
        let qty = parseInt($(event.target).val()) || 0;
        $(event.target).val(qty);
        setCalculated();
    },
    'change .linePercent': function (event) {
        selectedLineID = $(event.target).closest('tr').attr('id');
        let qty = parseInt($(event.target).val()) || 0;
        $(event.target).val(qty);
        setCalculated();
    },
    'click .btnRemove': function (event) {
        selectedLineID = null;
        $(event.target).closest('tr').remove();
        event.preventDefault();
        setCalculated();
    },
    'click #addLineCondition': function() {
        let selectedCard = $('#selectedCard').val();
        let noDataLine = null;
        let rowData = null;
        let prefix = "";
        if (selectedCard == "spent") {
            rowData = $("#tblSpentCondition tbody #sampleData").clone(true);
            noDataLine = $("#tblSpentCondition tbody #noData");
            prefix = "sc_";
        } else if (selectedCard == "received") {
            rowData = $("#tblReceivedCondition tbody #sampleData").clone(true);
            noDataLine = $("#tblReceivedCondition tbody #noData");
            prefix = "rc_";
        } else if (selectedCard == "transfer") {
            rowData = $("#tblTransferCondition tbody #sampleData").clone(true);
            noDataLine = $("#tblTransferCondition tbody #noData");
            prefix = "tc_";
        }
        if (noDataLine != null) {
            noDataLine.remove();
        }
        if (rowData != null) {
            let tokenid = Random.id();
            $(".colID", rowData).text(tokenid);
            $(".lineField", rowData).val("");
            $(".lineCondition", rowData).val("");
            $(".lineValue", rowData).val("");
            rowData.attr("id", prefix + tokenid);
            rowData.show();
            if (selectedCard == "spent") {
                $("#tblSpentCondition tbody").append(rowData);
            } else if (selectedCard == "received") {
                $("#tblReceivedCondition tbody").append(rowData);
            } else if (selectedCard == "transfer") {
                $("#tblTransferCondition tbody").append(rowData);
            }
        }
    },
    'click #addLineFixed': function() {
        let selectedCard = $('#selectedCard').val();
        let noDataLine = null;
        let rowData = null;
        let prefix = "";
        if (selectedCard == "spent") {
            rowData = $("#tblSpentFixedItem tbody #sampleData").clone(true);
            noDataLine = $("#tblSpentFixedItem tbody #noData");
            prefix = "sf_";
        } else if (selectedCard == "received") {
            rowData = $("#tblReceivedFixedItem tbody #sampleData").clone(true);
            noDataLine = $("#tblReceivedFixedItem tbody #noData");
            prefix = "rf_";
        }
        if (noDataLine != null) {
            noDataLine.remove();
        }
        if (rowData != null) {
            let tokenid = Random.id();
            $(".colID", rowData).text(tokenid);
            $(".lineDesc", rowData).val("");
            $(".lineAccountName", rowData).val("");
            $(".lineTaxCode", rowData).val("");
            $(".lineAmount", rowData).val("");
            rowData.attr("id", prefix + tokenid);
            rowData.show();
            if (selectedCard == "spent") {
                $("#tblSpentFixedItem tbody").append(rowData);
            } else if (selectedCard == "received") {
                $("#tblReceivedFixedItem tbody").append(rowData);
            }
        }
    },
    'click #addLinePercent': function() {
        let selectedCard = $('#selectedCard').val();
        let noDataLine = null;
        let rowData = null;
        let prefix = "";
        if (selectedCard == "spent") {
            rowData = $("#tblSpentPercentItem tbody #sampleData").clone(true);
            noDataLine = $("#tblSpentPercentItem tbody #noData");
            prefix = "sp_";
        } else if (selectedCard == "received") {
            rowData = $("#tblReceivedPercentItem tbody #sampleData").clone(true);
            noDataLine = $("#tblReceivedPercentItem tbody #noData");
            prefix = "rp_";
        }
        if (noDataLine != null) {
            noDataLine.remove();
        }
        if (rowData != null) {
            let tokenid = Random.id();
            $(".colID", rowData).text(tokenid);
            $(".lineDesc", rowData).val("");
            $(".lineAccountName", rowData).val("");
            $(".lineTaxCode", rowData).val("");
            $(".linePercent", rowData).val("");
            rowData.attr("id", prefix + tokenid);
            rowData.show();
            if (selectedCard == "spent") {
                $("#tblSpentPercentItem tbody").append(rowData);
            } else if (selectedCard == "received") {
                $("#tblReceivedPercentItem tbody").append(rowData);
            }
        }
    },
    'click .btnSave': function (event) {
        playSaveAudio();
        setTimeout(function(){
        let selectedCard = $('#selectedCard').val();
        if (selectedCard == "spent") {
            let tblSpentConditionRows = $('#tblSpentCondition tbody tr');
            let tblSpentFixedRows = $('#tblSpentFixedItem tbody tr');
            let tblSpentPercentRows = $('#tblSpentFixedItem tbody tr');
            let spentTotalPercent = $("#spentTotalPercent").text();
            spentTotalPercent = Number(spentTotalPercent.replace(/[^0-9.-]+/g, "")) || 0;
            if (spentTotalPercent != 100) {
                swal('The total percent must be 100%.', '', 'error');
                return false;
            }
            // $('.fullScreenSpin').css('display', 'inline-block');
        } else if (selectedCard == "received") {
            let receivedTotalPercent = $("#receivedTotalPercent").text();
            receivedTotalPercent = Number(receivedTotalPercent.replace(/[^0-9.-]+/g, "")) || 0;
            if (receivedTotalPercent != 100) {
                swal('The total percent must be 100%.', '', 'error');
                return false;
            }
        } else if (selectedCard == "transfer") {

        }
        swal('API is not ready.', '', 'error');
        return false;
    }, delayTimeAfterSound);
    },
    'click #btnSpentRule': function(event) {
        $('#btnSpentRule').addClass('ruleTypeActive');
        $('#btnReceivedRule').removeClass('ruleTypeActive');
        $('#btnTransferRule').removeClass('ruleTypeActive');
        $('#spentRuleCard').show();
        $('#receivedRuleCard').hide();
        $('#transferRuleCard').hide();
        $('#selectedCard').val("spent");
    },
    'click #btnReceivedRule': function(event) {
        $('#btnSpentRule').removeClass('ruleTypeActive');
        $('#btnReceivedRule').addClass('ruleTypeActive');
        $('#btnTransferRule').removeClass('ruleTypeActive');
        $('#spentRuleCard').hide();
        $('#receivedRuleCard').show();
        $('#transferRuleCard').hide();
        $('#selectedCard').val("received");
    },
    'click #btnTransferRule': function(event) {
        $('#btnSpentRule').removeClass('ruleTypeActive');
        $('#btnReceivedRule').removeClass('ruleTypeActive');
        $('#btnTransferRule').addClass('ruleTypeActive');
        $('#spentRuleCard').hide();
        $('#receivedRuleCard').hide();
        $('#transferRuleCard').show();
        $('#selectedCard').val("transfer");
    },
});

Template.newreconrule.helpers({
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
    baselinedata : () => {
        return Template.instance().baselinedata.get();
    },
    spentConditionData : () => {
        return Template.instance().spentConditionData.get();
    },
    spentFixedItemData : () => {
        return Template.instance().spentFixedItemData.get();
    },
    spentPercentItemData : () => {
        return Template.instance().spentPercentItemData.get();
    },
    receivedConditionData : () => {
        return Template.instance().receivedConditionData.get();
    },
    receivedFixedItemData : () => {
        return Template.instance().receivedFixedItemData.get();
    },
    receivedPercentItemData : () => {
        return Template.instance().receivedPercentItemData.get();
    },
    transferConditionData : () => {
        return Template.instance().transferConditionData.get();
    },
});

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
    let tblSpentFixedRows = $('#tblSpentFixedItem tbody tr');
    let spentFixedTotal = 0;
    let tblSpentPercentRows = $('#tblSpentPercentItem tbody tr');
    let spentPercentTotal = 0;
    let tblReceivedFixedRows = $('#tblReceivedFixedItem tbody tr');
    let receivedFixedTotal = 0;
    let tblReceivedPercentRows = $('#tblReceivedPercentItem tbody tr');
    let receivedPercentTotal = 0;
    tblSpentFixedRows.each(function (index) {
        const $tblrow = $(this);
        let trid = $tblrow.attr('id');
        if (trid != undefined && trid != 'sampleData' && trid != 'noData') {
            let lineAmount = $tblrow.find(".lineAmount").val();
            lineAmount = Number(lineAmount.replace(/[^0-9.-]+/g, "")) || 0;
            spentFixedTotal += lineAmount;
        }
    });
    tblSpentPercentRows.each(function (index) {
        const $tblrow = $(this);
        let trid = $tblrow.attr('id');
        if (trid != undefined && trid != 'sampleData' && trid != 'noData') {
            let linePercent = $tblrow.find(".linePercent").val();
            linePercent = Number(linePercent.replace(/[^0-9.-]+/g, "")) || 0;
            spentPercentTotal += linePercent;
        }
    });
    tblReceivedFixedRows.each(function (index) {
        const $tblrow = $(this);
        let trid = $tblrow.attr('id');
        if (trid != undefined && trid != 'sampleData' && trid != 'noData') {
            let lineAmount = $tblrow.find(".lineAmount").val();
            lineAmount = Number(lineAmount.replace(/[^0-9.-]+/g, "")) || 0;
            receivedFixedTotal += lineAmount;
        }
    });
    tblReceivedPercentRows.each(function (index) {
        const $tblrow = $(this);
        let trid = $tblrow.attr('id');
        if (trid != undefined && trid != 'sampleData' && trid != 'noData') {
            let linePercent = $tblrow.find(".linePercent").val();
            linePercent = Number(linePercent.replace(/[^0-9.-]+/g, "")) || 0;
            receivedPercentTotal += linePercent;
        }
    });
    $("#spentTotalAmount").text(utilityService.modifynegativeCurrencyFormat(spentFixedTotal));
    $("#spentTotalPercent").text(setPercentFormat(spentPercentTotal));
    $("#receivedTotalAmount").text(utilityService.modifynegativeCurrencyFormat(receivedFixedTotal));
    $("#receivedTotalPercent").text(setPercentFormat(receivedPercentTotal));
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
function setPercentFormat(price) {
    if(price < 0) {
        let currency = price.toString().split('-')[1];
        currency = (parseFloat(currency).toLocaleString(undefined, {minimumFractionDigits: 2,maximumFractionDigits: 2})) + '%';
        return currency;
    } else {
        return ((parseFloat(price).toLocaleString(undefined, {minimumFractionDigits: 2,maximumFractionDigits: 2})) + '%');
    }
}
