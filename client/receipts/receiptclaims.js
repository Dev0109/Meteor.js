import { ReactiveVar } from 'meteor/reactive-var';
import { ContactService } from "../contacts/contact-service";
import { AccountService } from "../accounts/account-service";
import { UtilityService } from "../utility-service";
import { SideBarService } from '../js/sidebar-service';
import { OCRService } from '../js/ocr-service';
import '../lib/global/indexdbstorage.js';
import moment from 'moment';
import CurrencyConverter from '../packages/currency/CurrencyConverter';
import { PurchaseBoardService } from "../js/purchase-service";
import { ReceiptService } from "./receipt-service";
import { onExhangeRateChanged, saveCurrencyHistory } from '../packages/currency/CurrencyWidget';
import FxGlobalFunctions from '../packages/currency/FxGlobalFunctions';
import GlobalFunctions from '../GlobalFunctions';

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
let accountService = new AccountService();
let ocrService = new OCRService();
let contactService = new ContactService();

let defaultCurrencyCode = CountryAbbr;

Template.receiptsoverview.onCreated(function () {
    const templateObject = Template.instance();
    templateObject.employees = new ReactiveVar([]);
    templateObject.suppliers = new ReactiveVar([]);
    templateObject.chartAccounts = new ReactiveVar([]);
    templateObject.receiptCategories = new ReactiveVar([]);
    templateObject.categoryAccounts = new ReactiveVar([]);
    templateObject.tripGroups = new ReactiveVar([]);
    templateObject.expenseClaimList = new ReactiveVar([]);
    templateObject.editExpenseClaim = new ReactiveVar();
    templateObject.multiReceiptRecords = new ReactiveVar([]);
    templateObject.mergeReceiptRecords = new ReactiveVar([]);
    templateObject.mergeReceiptSelectedIndex = new ReactiveVar(0);
});

Template.receiptsoverview.onRendered(function () {
    let templateObject = Template.instance();

    /**
     * Lets load the default currency
     */
    templateObject.loadDefaultCurrency = async c => FxGlobalFunctions.loadDefaultCurrencyForReport(c);


    if (FlowRouter.current().queryParams.success) {
        $('.btnRefresh').addClass('btnSearchAlert');
    }
    let sessionCurrency = Session.get('ERPCountryAbbr');
    let categories = [];
    let multipleRecords = [];
    for (let i = 0; i < 10; i++) {
        let item = {
            date: moment().format("DD/MM/YYYY"),
            amount: 0,
            merchantName: "",
            merchantId: 0,
            accountName: "",
            accountId: 0,
            currency: sessionCurrency,
            description: ""
        };
        multipleRecords.push(item);
    }
    templateObject.multiReceiptRecords.set(multipleRecords);

    setTimeout(() => {
        $('.multipleSupplier').editableSelect();
        $('.multipleAccount').editableSelect();
        $(".dtMultiple").datepicker({
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
    }, 200);

    $('.employees').editableSelect();
    $('.merchants').editableSelect();
    $('.chart-accounts').editableSelect();
    $('.trip-groups').editableSelect();
    $('.currencies').editableSelect();
    $('.transactionTypes').editableSelect();

    $('.employees').on('click', function (e, li) {
        setEmployeeSelect(e);
    });
    $('.merchants').on('click', function (e, li) {
        templateObject.setSupplierSelect(e);
    });
    $('.currencies').on('click', function (e, li) {
        setCurrencySelect(e);
    });
    $('.chart-accounts').on('click', function (e, li) {
        templateObject.setCategoryAccountList(e);
    });
    $('.trip-groups').on('click', function (e, li) {
        templateObject.setTripGroupList(e);
    });
    templateObject.getAllReceiptCategory = function () {
        getVS1Data('TReceiptCategory').then(function (dataObject) {
            if (dataObject.length === 0) {
                sideBarService.getReceiptCategory().then(function (data) {
                    addVS1Data('TReceiptCategory', JSON.stringify(data));
                    setReceiptCategory(data);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                setReceiptCategory(data);
            }
        }).catch(function (err) {
            sideBarService.getReceiptCategory().then(function (data) {
                addVS1Data('TReceiptCategory', JSON.stringify(data));
                setReceiptCategory(data);
            });
        });
    };

    function setReceiptCategory(data) {
        for (let i in data.treceiptcategory) {
            if (data.treceiptcategory.hasOwnProperty(i)) {
                categories.push(data.treceiptcategory[i].CategoryName);
            }
        }
        templateObject.receiptCategories.set(categories);
        templateObject.getAllAccounts();
    }
    templateObject.getAllReceiptCategory();

    templateObject.getAllAccounts = function () {
        getVS1Data('TAccountVS1').then(function (dataObject) {
            if (dataObject.length === 0) {
                sideBarService.getAccountListVS1().then(function (data) {
                    setAccountListVS1(data);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                setAccountListVS1(data);
            }
        }).catch(function (err) {
            sideBarService.getAccountListVS1().then(function (data) {
                setAccountListVS1(data);
            });
        });
    };

    function setAccountListVS1(data) {
        let categoryAccountList = [];
        let splashArrayAccountList = [];
        for (let i = 0; i < data.taccountvs1.length; i++) {
            const dataList = [
                data.taccountvs1[i].fields.ReceiptCategory || '',
                data.taccountvs1[i].fields.AccountName || '',
                data.taccountvs1[i].fields.Description || '',
                data.taccountvs1[i].fields.AccountNumber || '',
                data.taccountvs1[i].fields.TaxCode || '',
                data.taccountvs1[i].fields.ID || ''
            ];
            // if(data.taccountvs1[i].fields.AllowExpenseClaim && data.taccountvs1[i].fields.ReceiptCategory != ''){
            if (data.taccountvs1[i].fields.ReceiptCategory != '' && categories.includes(data.taccountvs1[i].fields.ReceiptCategory)) {
                categoryAccountList.push(dataList);
            }
            let accBalance = 0;
            if (!isNaN(data.taccountvs1[i].fields.Balance)) {
                accBalance = utilityService.modifynegativeCurrencyFormat(data.taccountvs1[i].fields.Balance) || 0.00;
            } else {
                accBalance = Currency + "0.00";
            }
            const dataList2 = [
                data.taccountvs1[i].fields.AccountName || '-',
                data.taccountvs1[i].fields.Description || '',
                data.taccountvs1[i].fields.AccountNumber || '',
                data.taccountvs1[i].fields.AccountTypeName || '',
                accBalance,
                data.taccountvs1[i].fields.TaxCode || '',
                data.taccountvs1[i].fields.ID || ''
            ];
            splashArrayAccountList.push(dataList2);
        }
        templateObject.categoryAccounts.set(categoryAccountList);
        //localStorage.setItem('VS1PurchaseAccountList', JSON.stringify(splashArrayAccountList));
        if (categoryAccountList) {
            $('#tblCategory').dataTable({
                data: categoryAccountList,
                "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                paging: true,
                "aaSorting": [],
                "orderMulti": true,
                columnDefs: [
                    { className: "colReceiptCategory", "targets": [0] },
                    { className: "colAccountName", "targets": [1] },
                    { className: "colAccountDesc", "targets": [2] },
                    { className: "colAccountNumber", "targets": [3] },
                    { className: "colTaxCode", "targets": [4] },
                    { className: "colAccountID hiddenColumn", "targets": [5] }
                ],
                // select: true,
                // destroy: true,
                colReorder: true,
                "order": [
                    [0, "asc"]
                ],
                pageLength: initialDatatableLoad,
                lengthMenu: [
                    [initialDatatableLoad, -1],
                    [initialDatatableLoad, "All"]
                ],
                info: true,
                responsive: true,
                "fnInitComplete": function () {
                    $("<button class='btn btn-primary btnAddNewReceiptCategory' data-dismiss='modal' data-toggle='modal' data-target='#addReceiptCategoryModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblCategory_filter");
                    $("<button class='btn btn-primary btnRefreshCategoryAccount' type='button' id='btnRefreshCategoryAccount' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblCategory_filter");
                }
            });
            $('#tblAccountReceipt').dataTable({
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
                lengthMenu: [
                    [initialDatatableLoad, -1],
                    [initialDatatableLoad, "All"]
                ],
                info: true,
                responsive: true,
                "fnInitComplete": function () {
                    $("<button class='btn btn-primary btnAddNewAccount' data-dismiss='modal' data-toggle='modal' data-target='#addAccountModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblAccountReceipt_filter");
                    $("<button class='btn btn-primary btnRefreshAccount' type='button' id='btnRefreshAccount' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblAccountReceipt_filter");
                }

            });
            $('div.dataTables_filter input').addClass('form-control form-control-sm');
        }
    }
    templateObject.setCategoryAccountList = function (e) {
        const $each = $(e.target);
        const offset = $each.offset();
        $('#edtReceiptCategoryID').val('');
        const searchDataName = e.target.value || '';
        if (e.pageX > offset.left + $each.width() - 8) { // X button 16px wide?
            $each.attr('data-id', '');
            $('#categoryListModal').modal('toggle');
            setTimeout(function () {
                $('#tblCategory_filter .form-control-sm').focus();
                $('#tblCategory_filter .form-control-sm').val('');
                $('#tblCategory_filter .form-control-sm').trigger("input");
                const datatable = $('#tblCategory').DataTable();
                datatable.draw();
                $('#tblCategory_filter .form-control-sm').trigger("input");
            }, 200);
        } else {
            if (searchDataName.replace(/\s/g, '') != '') {
                getVS1Data('TReceiptCategory').then(function (dataObject) {
                    if (dataObject.length == 0) {
                        $('.fullScreenSpin').css('display', 'inline-block');
                        sideBarService.getReceiptCategoryByName(searchDataName).then(function (data) {
                            showEditReceiptCategoryView(data.treceiptcategory[0]);
                        }).catch(function (err) {
                            $('.fullScreenSpin').css('display', 'none');
                        });
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        let added = false;
                        for (let i = 0; i < data.treceiptcategory.length; i++) {
                            if ((data.treceiptcategory[i].CategoryName) === searchDataName) {
                                added = true;
                                showEditReceiptCategoryView(data.treceiptcategory[i]);
                            }
                        }
                        if (!added) {
                            $('.fullScreenSpin').css('display', 'inline-block');
                            sideBarService.getReceiptCategoryByName(searchDataName).then(function (data) {
                                showEditReceiptCategoryView(data.treceiptcategory[0]);
                            }).catch(function (err) {
                                $('.fullScreenSpin').css('display', 'none');
                            });
                        }
                    }
                }).catch(function (err) {
                    sideBarService.getReceiptCategoryByName(searchDataName).then(function (data) {
                        showEditReceiptCategoryView(data.treceiptcategory[0]);
                    }).catch(function (err) {
                        $('.fullScreenSpin').css('display', 'none');
                    });
                });
            } else {
                $('#categoryListModal').modal('toggle');
                setTimeout(function () {
                    $('#tblCategory_filter .form-control-sm').focus();
                    $('#tblCategory_filter .form-control-sm').val('');
                    $('#tblCategory_filter .form-control-sm').trigger("input");
                    const datatable = $('#tblCategory').DataTable();
                    datatable.draw();
                    $('#tblCategory_filter .form-control-sm').trigger("input");
                }, 200);
            }
        }
    };

    function showEditReceiptCategoryView(data) {
        $("#add-receiptcategory-title").text("Edit Receipt Category");
        $('#edtReceiptCategoryID').val(data.Id);
        $('#edtReceiptCategoryName').val(data.CategoryName);
        $('#edtReceiptCategoryDesc').val(data.CategoryDesc);
        setTimeout(function () {
            $('#addReceiptCategoryModal').modal('show');
        }, 200);
    }

    templateObject.getTripGroup = function () {
        getVS1Data('TTripGroup').then(function (dataObject) {
            if (dataObject.length === 0) {
                sideBarService.getTripGroup().then(function (data) {
                    addVS1Data('TTripGroup', JSON.stringify(data));
                    setTripGroup(data);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                setTripGroup(data);
            }
        }).catch(function (err) {
            sideBarService.getTripGroup().then(function (data) {
                addVS1Data('TTripGroup', JSON.stringify(data));
                setTripGroup(data);
            });
        });
    };

    function setTripGroup(data) {
        let tripGroupList = [];
        for (let i = 0; i < data.ttripgroup.length; i++) {
            const dataList = [
                data.ttripgroup[i].TripName || '',
                data.ttripgroup[i].Description || '',
                data.ttripgroup[i].Id || ''
            ];
            tripGroupList.push(dataList);
        }
        templateObject.tripGroups.set(tripGroupList);
        if (tripGroupList) {
            $('#tblTripGroup').dataTable({
                data: tripGroupList,
                "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                paging: true,
                "aaSorting": [],
                "orderMulti": true,
                columnDefs: [
                    { className: "colTripName", "targets": [0] },
                    { className: "colDescription", "targets": [1] },
                    { className: "colID hiddenColumn", "targets": [2] }
                ],
                // select: true,
                // destroy: true,
                colReorder: true,
                "order": [
                    [0, "asc"]
                ],
                pageLength: initialDatatableLoad,
                lengthMenu: [
                    [initialDatatableLoad, -1],
                    [initialDatatableLoad, "All"]
                ],
                info: true,
                responsive: true,
                "fnInitComplete": function () {
                    $("<button class='btn btn-primary btnAddNewTripGroup' data-dismiss='modal' data-toggle='modal' data-target='#addTripGroupModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblTripGroup_filter");
                    $("<button class='btn btn-primary btnRefreshTripGroup' type='button' id='btnRefreshTripGroup' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblTripGroup_filter");
                }
            });
            $('div.dataTables_filter input').addClass('form-control form-control-sm');
        }
    }
    templateObject.getTripGroup();
    templateObject.setTripGroupList = function (e) {
        const $each = $(e.target);
        const offset = $each.offset();
        $('#edtTripGroupID').val('');
        const searchDataName = e.target.value || '';
        if (e.pageX > offset.left + $each.width() - 8) { // X button 16px wide?
            $each.attr('data-id', '');
            $('#tripGroupListModal').modal('toggle');
            setTimeout(function () {
                $('#tblTripGroup_filter .form-control-sm').focus();
                $('#tblTripGroup_filter .form-control-sm').val('');
                $('#tblTripGroup_filter .form-control-sm').trigger("input");
                const datatable = $('#tblTripGroup').DataTable();
                datatable.draw();
                $('#tblTripGroup_filter .form-control-sm').trigger("input");
            }, 200);
        } else {
            if (searchDataName.replace(/\s/g, '') != '') {
                getVS1Data('TTripGroup').then(function (dataObject) {
                    if (dataObject.length == 0) {
                        $('.fullScreenSpin').css('display', 'inline-block');
                        sideBarService.getTripGroupByName(searchDataName).then(function (data) {
                            showEditTripGroupView(data.ttripgroup[0]);
                        }).catch(function (err) {
                            $('.fullScreenSpin').css('display', 'none');
                        });
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        let added = false;
                        for (let i = 0; i < data.ttripgroup.length; i++) {
                            if ((data.ttripgroup[i].TripName) === searchDataName) {
                                added = true;
                                showEditTripGroupView(data.ttripgroup[i]);
                            }
                        }
                        if (!added) {
                            $('.fullScreenSpin').css('display', 'inline-block');
                            sideBarService.getTripGroupByName(searchDataName).then(function (data) {
                                showEditTripGroupView(data.ttripgroup[0]);
                            }).catch(function (err) {
                                $('.fullScreenSpin').css('display', 'none');
                            });
                        }
                    }
                }).catch(function (err) {
                    sideBarService.getTripGroupByName(searchDataName).then(function (data) {
                        showEditTripGroupView(data.ttripgroup[0]);
                    }).catch(function (err) {
                        $('.fullScreenSpin').css('display', 'none');
                    });
                });
            } else {
                $('#tripGroupListModal').modal('toggle');
                setTimeout(function () {
                    $('#tblTripGroup_filter .form-control-sm').focus();
                    $('#tblTripGroup_filter .form-control-sm').val('');
                    $('#tblTripGroup_filter .form-control-sm').trigger("input");
                    const datatable = $('#tblTripGroup').DataTable();
                    datatable.draw();
                    $('#tblTripGroup_filter .form-control-sm').trigger("input");
                }, 200);
            }
        }
    };

    function showEditTripGroupView(data) {
        $('.fullScreenSpin').css('display', 'none');
        $("#add-tripgroup-title").text("Edit Trip-Group");
        $('#edtTripGroupID').val(data.fields.Id);
        $('#edtTripGroupName').val(data.fields.TripName);
        $('#edtTripGroupDesc').val(data.fields.Description);
        setTimeout(function () {
            $('#addTripGroupModal').modal('show');
        }, 200);
    }

    $('.transactionTypes').on('click', function (e, li) {
        setPaymentMethodSelect(e);
    });

    function setEmployeeSelect(e) {
        const $each = $(e.target);
        const offset = $each.offset();
        const employeeName = e.target.value || '';

        if (e.pageX > offset.left + $each.width() - 8) { // X button 16px wide?
            $each.attr('data-id', '');
            $('#employeeListModal').modal('toggle');
            setTimeout(function () {
                $('#tblEmployeelist_filter .form-control-sm').focus();
                $('#tblEmployeelist_filter .form-control-sm').val('');
                $('#tblEmployeelist_filter .form-control-sm').trigger("input");
                const datatable = $('#tblEmployeelist').DataTable();
                datatable.draw();
                $('#tblEmployeelist_filter .form-control-sm').trigger("input");
            }, 500);
        } else {
            if (employeeName.replace(/\s/g, '') != '') { // edit employee
                let editId = $('#viewReceiptModal .employees').attr('data-id');
                getVS1Data('TEmployee').then(function (dataObject) {
                    if (dataObject.length == 0) {
                        sideBarService.getAllEmployees(initialBaseDataLoad, 0).then(function (data) {
                            setEmployeeData(data, editId);
                        }).catch(function (err) {

                        });
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        setEmployeeData(data, editId);
                    }
                }).catch(function (err) {
                    sideBarService.getAllEmployees(initialBaseDataLoad, 0).then(function (data) {
                        setEmployeeData(data, editId);
                    }).catch(function (err) {

                    });
                });
            } else {
                $('#employeeListModal').modal('toggle');
            }
        }
    }

    function setEmployeeData(data, editId) {
        addVS1Data('TEmployee', JSON.stringify(data));
        for (let i = 0; i < data.temployee.length; i++) {
            if (data.temployee[i].fields.ID == editId) {
                showEditEmployeeView(data.temployee[i].fields);
            }
        }
    }

    function showEditEmployeeView(data) {
        $('.fullScreenSpin').css('display', 'none');
        $('#add-customer-title').text('Edit Employee');
        let popCustomerID = data.ID || '';
        let popCustomerName = data.EmployeeName || '';
        let popCustomerEmail = data.Email || '';
        let popCustomerTitle = data.Title || '';
        let popCustomerFirstName = data.FirstName || '';
        let popCustomerMiddleName = data.MiddleName || '';
        let popCustomerLastName = data.LastName || '';
        let popCustomerPhone = data.Phone || '';
        let popCustomerMobile = data.Mobile || '';
        let popCustomerFaxnumber = data.Faxnumber || '';
        let popCustomerSkypeName = data.SkypeName || '';
        let popCustomerURL = data.URL || '';
        let popCustomerStreet = data.Street || '';
        let popCustomerStreet2 = data.Street2 || '';
        let popCustomerState = data.State || '';
        let popCustomerPostcode = data.Postcode || '';
        let popCustomerCountry = data.Country || LoggedCountry;
        let popCustomercustfield1 = data.CustFld1 || '';
        let popCustomercustfield2 = data.CustFld2 || '';
        let popCustomercustfield3 = data.CustFld3 || '';
        let popCustomercustfield4 = data.CustFld4 || '';
        let popCustomernotes = data.Notes || '';
        let popCustomerpreferedpayment = data.PaymentMethodName || '';
        let popGender = data.Sex == "F" ? "Female" : data.Sex == "M" ? "Male" : "";

        //$('#edtCustomerCompany').attr('readonly', true);
        $('#edtCustomerCompany').val(popCustomerName);
        $('#edtEmployeePOPID').val(popCustomerID);
        $('#edtEmailAddress').val(popCustomerEmail);
        $('#edtTitle').val(popCustomerTitle);
        $('#edtFirstName').val(popCustomerFirstName);
        $('#edtMiddleName').val(popCustomerMiddleName);
        $('#edtLastName').val(popCustomerLastName);
        $('#edtPhone').val(popCustomerPhone);
        $('#edtMobile').val(popCustomerMobile);
        $('#edtFax').val(popCustomerFaxnumber);
        $('#edtSkype').val(popCustomerSkypeName);
        $('#edtCustomerWebsite').val(popCustomerURL);
        $('#edtAddress').val(popCustomerStreet);
        $('#edtCity').val(popCustomerStreet2);
        $('#edtState').val(popCustomerState);
        $('#edtPostalCode').val(popCustomerPostcode);
        $('#sedtCountry').val(popCustomerCountry);
        $('#txaNotes').val(popCustomernotes);
        $('#sltPreferedPayment').val(popCustomerpreferedpayment);
        $('#edtCustomeField1').val(popCustomercustfield1);
        $('#edtCustomeField2').val(popCustomercustfield2);
        $('#edtCustomeField3').val(popCustomercustfield3);
        $('#edtCustomeField4').val(popCustomercustfield4);
        $('#edtGender').val(popGender);

        setTimeout(function () {
            $('#addEmployeeModal').modal('show');
        }, 200);
    }

    templateObject.setSupplierSelect = function (e) {
        const $each = $(e.target);
        const offset = $each.offset();
        $('#edtSupplierPOPID').val('');
        const supplierDataName = e.target.value || '';
        if (e.pageX > offset.left + $each.width() - 8) { // X button 16px wide?
            $each.attr('data-id', '');
            $('#supplierListModal').modal();
            setTimeout(function () {
                $('#tblSupplierlist_filter .form-control-sm').focus();
                $('#tblSupplierlist_filter .form-control-sm').val('');
                $('#tblSupplierlist_filter .form-control-sm').trigger("input");
                const datatable = $('#tblSupplierlist').DataTable();
                datatable.draw();
                $('#tblSupplierlist_filter .form-control-sm').trigger("input");
            }, 500);
        } else {
            if (supplierDataName.replace(/\s/g, '') != '') {
                getVS1Data('TSupplierVS1').then(function (dataObject) {
                    if (dataObject.length == 0) {
                        sideBarService.getAllSuppliersDataVS1(initialBaseDataLoad, 0).then(function (data) {
                            setSupplierData(data, supplierDataName);
                        }).catch(function (err) {

                        });
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        setSupplierData(data, supplierDataName);
                    }
                }).catch(function (err) {
                    sideBarService.getAllSuppliersDataVS1(initialBaseDataLoad, 0).then(function (data) {
                        setSupplierData(data, supplierDataName);
                    }).catch(function (err) {

                    });
                });
            } else {
                $('#supplierListModal').modal();
                setTimeout(function () {
                    $('#tblSupplierlist_filter .form-control-sm').focus();
                    $('#tblSupplierlist_filter .form-control-sm').val('');
                    $('#tblSupplierlist_filter .form-control-sm').trigger("input");
                    const datatable = $('#tblSupplierlist').DataTable();
                    datatable.draw();
                    $('#tblSupplierlist_filter .form-control-sm').trigger("input");
                }, 500);
            }
        }
    };

    function setSupplierData(data, supplierDataName) {
        addVS1Data('TSupplierVS1', JSON.stringify(data));
        let added = false;
        for (let i = 0; i < data.tsuppliervs1.length; i++) {
            if ((data.tsuppliervs1[i].fields.ClientName) === supplierDataName) {
                added = true;
                showEditSupplierView(data.tsuppliervs1[i].fields);
            }
        }
        if (!added) {
            sideBarService.getOneSupplierDataExByName(supplierDataName).then(function (data) {
                showEditSupplierView(data.tsuppliervs1[0].fields);
            }).catch(function (err) {

            });
        }
    }

    function showEditSupplierView(data) {
        $('.fullScreenSpin').css('display', 'none');
        $('#add-supplier-title').text('Edit Supplier');
        let popSupplierID = data.ID || '';
        let popSupplierName = data.ClientName || '';
        let popSupplierEmail = data.Email || '';
        let popSupplierTitle = data.Title || '';
        let popSupplierFirstName = data.FirstName || '';
        let popSupplierMiddleName = data.CUSTFLD10 || '';
        let popSupplierLastName = data.LastName || '';
        let popSuppliertfn = '' || '';
        let popSupplierPhone = data.Phone || '';
        let popSupplierMobile = data.Mobile || '';
        let popSupplierFaxnumber = data.Faxnumber || '';
        let popSupplierSkypeName = data.SkypeName || '';
        let popSupplierURL = data.URL || '';
        let popSupplierStreet = data.Street || '';
        let popSupplierStreet2 = data.Street2 || '';
        let popSupplierState = data.State || '';
        let popSupplierPostcode = data.Postcode || '';
        let popSupplierCountry = data.Country || LoggedCountry;
        let popSupplierbillingaddress = data.BillStreet || '';
        let popSupplierbcity = data.BillStreet2 || '';
        let popSupplierbstate = data.BillState || '';
        let popSupplierbpostalcode = data.BillPostcode || '';
        let popSupplierbcountry = data.Billcountry || LoggedCountry;
        let popSuppliercustfield1 = data.CUSTFLD1 || '';
        let popSuppliercustfield2 = data.CUSTFLD2 || '';
        let popSuppliercustfield3 = data.CUSTFLD3 || '';
        let popSuppliercustfield4 = data.CUSTFLD4 || '';
        let popSuppliernotes = data.Notes || '';
        let popSupplierpreferedpayment = data.PaymentMethodName || '';
        let popSupplierterms = data.TermsName || '';
        let popSupplierdeliverymethod = data.ShippingMethodName || '';
        let popSupplieraccountnumber = data.ClientNo || '';
        let popSupplierisContractor = data.Contractor || false;
        let popSupplierissupplier = data.IsSupplier || false;
        let popSupplieriscustomer = data.IsCustomer || false;

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

        setTimeout(function () {
            $('#addSupplierModal').modal('show');
        }, 200);

        // if(popSupplierID == ""){
        //     window.open('/supplierscard', '_self');
        // }
        // else{
        //     window.open('/supplierscard?id='+popSupplierID, '_self');
        // }
    }

    function setCurrencySelect(e) {
        const $each = $(e.target);
        const offset = $each.offset();
        const currencyDataName = e.target.value || '';
        $('#edtCurrencyID').val('');
        if (e.pageX > offset.left + $each.width() - 8) { // X button 16px wide?
            $each.attr('data-id', '');
            $('#currencyModal').modal('toggle');
        } else {
            if (currencyDataName.replace(/\s/g, '') != '') {
                $('#add-currency-title').text('Edit Currency');
                $('#sedtCountry').prop('readonly', true);
                getVS1Data('TCurrency').then(function (dataObject) {
                    if (dataObject.length == 0) {
                        $('.fullScreenSpin').css('display', 'inline-block');
                        sideBarService.getCurrencies().then(function (data) {
                            setCurrencyData(data, currencyDataName);
                        });
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        setCurrencyData(data, currencyDataName);
                    }
                }).catch(function (err) {
                    $('.fullScreenSpin').css('display', 'inline-block');
                    sideBarService.getCurrencies().then(function (data) {
                        setCurrencyData(data, currencyDataName);
                    });
                });
            } else {
                $('#currencyModal').modal();
                setTimeout(function () {
                    $('#tblCurrencyPopList_filter .form-control-sm').focus();
                    $('#tblCurrencyPopList_filter .form-control-sm').val('');
                    $('#tblCurrencyPopList_filter .form-control-sm').trigger("input");
                    const datatable = $('#tblCurrencyPopList').DataTable();
                    datatable.draw();
                    $('#tblCurrencyPopList_filter .form-control-sm').trigger("input");
                }, 500);
            }
        }
    }

    function setCurrencyData(data, currencyDataName) {
        addVS1Data('TCurrency', JSON.stringify(data));
        for (let i in data.tcurrency) {
            if (data.tcurrency.hasOwnProperty(i)) {
                if (data.tcurrency[i].fields.Code === currencyDataName) {
                    showEditCurrencyView(data.tcurrency[i]);
                }
            }
        }
        setTimeout(function () {
            $('.fullScreenSpin').css('display', 'none');
            $('#newCurrencyModal').modal('toggle');
            $('#sedtCountry').attr('readonly', true);
        }, 200);
    }

    function showEditCurrencyView(data) {
        $('#edtCurrencyID').val(data.fields.ID);
        setTimeout(function () {
            $('#sedtCountry').val(data.fields.Country);
        }, 200);
        //$('#sedtCountry').val(data.Country);
        $('#currencyCode').val(data.fields.Code);
        $('#currencySymbol').val(data.fields.CurrencySymbol);
        $('#edtCurrencyName').val(data.fields.Currency);
        $('#edtCurrencyDesc').val(data.fields.CurrencyDesc);
        $('#edtBuyRate').val(data.fields.BuyRate);
        $('#edtSellRate').val(data.fields.SellRate);
    }

    templateObject.setAccountSelect = function (e) {
        const $each = $(e.target);
        const offset = $each.offset();
        const accountDataName = e.target.value || '';

        if (e.pageX > offset.left + $each.width() - 8) { // X button 16px wide?
            $each.attr('data-id', '');
            $('#accountListModal').modal('toggle');
            setTimeout(function () {
                $('#tblAccountReceipt_filter .form-control-sm').focus();
                $('#tblAccountReceipt_filter .form-control-sm').val('');
                $('#tblAccountReceipt_filter .form-control-sm').trigger("input");
                const datatable = $('#tblAccountReceipt').DataTable();
                datatable.draw();
                $('#tblAccountReceipt_filter .form-control-sm').trigger("input");
            }, 500);
        } else {
            if (accountDataName.replace(/\s/g, '') != '') { // edit employee
                getVS1Data('TAccountVS1').then(function (dataObject) {
                    if (dataObject.length == 0) {
                        accountService.getAccountListVS1().then(function (data) {
                            setAccountData(data, accountDataName);
                        }).catch(function (err) {

                        });
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        setAccountData(data, accountDataName);
                    }
                }).catch(function (err) {
                    accountService.getAccountListVS1().then(function (data) {
                        setAccountData(data, accountDataName);
                    }).catch(function (err) {

                    });
                });
                $('#addAccountModal').modal('toggle');
            } else {
                $('#accountListModal').modal('toggle');
                const targetID = $(event.target).closest('tr').attr('id');
                $('#selectLineID').val(targetID);
                setTimeout(function () {
                    $('#tblAccountReceipt_filter .form-control-sm').focus();
                    $('#tblAccountReceipt_filter .form-control-sm').val('');
                    $('#tblAccountReceipt_filter .form-control-sm').trigger("input");
                    const datatable = $('#tblInventory').DataTable();
                    datatable.draw();
                    $('#tblAccountReceipt_filter .form-control-sm').trigger("input");
                }, 500);
            }
        }
    };

    function setAccountData(data, accountDataName) {
        addVS1Data('TAccountVS1', JSON.stringify(data));
        let added = false;
        $('#add-account-title').text('Edit Account Details');
        $('#edtAccountName').attr('readonly', true);
        $('#sltAccountType').attr('readonly', true);
        $('#sltAccountType').attr('disabled', 'disabled');
        for (let a = 0; a < data.taccountvs1.length; a++) {
            if ((data.taccountvs1[a].fields.AccountName) === accountDataName) {
                added = true;
                showEditAccountView(data.taccountvs1[a]);
            }
        }
        if (!added) {
            accountService.getOneAccountByName(accountDataName).then(function (data) {
                $('#add-account-title').text('Edit Account Details');
                $('#edtAccountName').attr('readonly', true);
                $('#sltAccountType').attr('readonly', true);
                $('#sltAccountType').attr('disabled', 'disabled');
                showEditAccountView(data.taccountvs1[0]);
            }).catch(function (err) {
                $('.fullScreenSpin').css('display', 'none');
            });
        }
    }

    function showEditAccountView(data) {
        $('.fullScreenSpin').css('display', 'none');
        const accountid = data.fields.ID || '';
        const accounttype = data.fields.AccountTypeName || '';
        const accountname = data.fields.AccountName || '';
        const accountno = data.fields.AccountNumber || '';
        const taxcode = data.fields.TaxCode || '';
        const accountdesc = data.fields.Description || '';
        const bankaccountname = data.fields.BankAccountName || '';
        const bankbsb = data.fields.BSB || '';
        const bankacountno = data.fields.BankAccountNumber || '';
        const swiftCode = data.fields.Extra || '';
        const routingNo = data.BankCode || '';
        const showTrans = data.fields.IsHeader || false;
        const cardnumber = data.fields.CarNumber || '';
        const cardcvc = data.fields.CVC || '';
        const cardexpiry = data.fields.ExpiryDate || '';
        if ((accounttype === "BANK")) {
            $('.isBankAccount').removeClass('isNotBankAccount');
            $('.isCreditAccount').addClass('isNotCreditAccount');
        } else if ((accounttype === "CCARD")) {
            $('.isCreditAccount').removeClass('isNotCreditAccount');
            $('.isBankAccount').addClass('isNotBankAccount');
        } else {
            $('.isBankAccount').addClass('isNotBankAccount');
            $('.isCreditAccount').addClass('isNotCreditAccount');
        }
        $('#edtAccountID').val(accountid);
        $('#sltAccountType').val(accounttype);
        $('#sltAccountType').append('<option value="' + accounttype + '" selected="selected">' + accounttype + '</option>');
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
        if (showTrans == 'true') {
            $('.showOnTransactions').prop('checked', true);
        } else {
            $('.showOnTransactions').prop('checked', false);
        }
        setTimeout(function () {
            $('#addNewAccount').modal('show');
        }, 500);
    }

    function setPaymentMethodSelect(e) {
        const $each = $(e.target);
        const offset = $each.offset();
        const paymentDataName = e.target.value || '';
        $('#edtPaymentMethodID').val('');
        if (e.pageX > offset.left + $each.width() - 8) { // X button 16px wide?
            $each.attr('data-id', '');
            $('#paymentMethodModal').modal('toggle');
        } else {
            if (paymentDataName.replace(/\s/g, '') != '') {
                $('#paymentMethodHeader').text('Edit Payment Method');
                getVS1Data('TPaymentMethod').then(function (dataObject) {
                    if (dataObject.length == 0) {
                        sideBarService.getPaymentMethodDataVS1().then(function (data) {
                            setPaymentMethodData(data, paymentDataName);
                        });
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        setPaymentMethodData(data, paymentDataName);
                    }
                }).catch(function (err) {
                    sideBarService.getPaymentMethodDataVS1().then(function (data) {
                        setPaymentMethodData(data, paymentDataName);
                    });
                });
            } else {
                $('#paymentMethodModal').modal();
                setTimeout(function () {
                    $('#paymentmethodList_filter .form-control-sm').focus();
                    $('#paymentmethodList_filter .form-control-sm').val('');
                    $('#paymentmethodList_filter .form-control-sm').trigger("input");
                    const datatable = $('#paymentmethodList').DataTable();
                    datatable.draw();
                    $('#paymentmethodList_filter .form-control-sm').trigger("input");
                }, 500);
            }
        }
    }

    function setPaymentMethodData(data, paymentDataName) {
        addVS1Data('TPaymentMethod', JSON.stringify(data));
        for (let i = 0; i < data.tpaymentmethodvs1.length; i++) {
            if (data.tpaymentmethodvs1[i].fields.PaymentMethodName === paymentDataName) {
                $('#edtPaymentMethodID').val(data.tpaymentmethodvs1[i].fields.ID);
                $('#edtPaymentMethodName').val(data.tpaymentmethodvs1[i].fields.PaymentMethodName);
                if (data.tpaymentmethodvs1[i].fields.IsCreditCard === true) {
                    $('#isformcreditcard').prop('checked', true);
                } else {
                    $('#isformcreditcard').prop('checked', false);
                }
            }
        }
        setTimeout(function () {
            $('#newPaymentMethodModal').modal('toggle');
        }, 200);
    }

    $("#date-input,#dateTo,#dateFrom,.dtReceiptDate, #dateFromMerge, #dateToMerge").datepicker({
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

    templateObject.setTimeFilter = function (option) {
        let startDate;
        let endDate = moment().format("DD/MM/YYYY");
        if (option == 'lastMonth') {
            startDate = moment().subtract(1, 'months').format("DD/MM/YYYY");
        } else if (option == 'lastQuarter') {
            startDate = moment().subtract(1, 'quarter').format("DD/MM/YYYY");
        } else if (option == 'last12Months') {
            startDate = moment().subtract(12, 'months').format("DD/MM/YYYY");
        } else if (option == 'ignoreDate') {
            startDate = '';
            endDate = '';
        }
        $('#dateFrom').val(startDate);
        $('#dateTo').val(endDate);
        $('#dateFrom').trigger('change');

    };
    templateObject.setMergeTimeFilter = function (option) {
        let startDate;
        let endDate = moment().format("DD/MM/YYYY");
        if (option == 'lastMonthMerge') {
            startDate = moment().subtract(1, 'months').format("DD/MM/YYYY");
        } else if (option == 'lastQuarterMerge') {
            startDate = moment().subtract(1, 'quarter').format("DD/MM/YYYY");
        } else if (option == 'last12MonthsMerge') {
            startDate = moment().subtract(12, 'months').format("DD/MM/YYYY");
        } else if (option == 'ignoreDateMerge') {
            startDate = '';
            endDate = '';
        }
        $('#dateFromMerge').val(startDate);
        $('#dateToMerge').val(endDate);
        $('#dateFromMerge').trigger('change');
    };

    $.fn.dataTableExt.afnFiltering.push(
        function (settings, data, dataIndex) {
            let date;
            let max;
            let min;
            if (settings.nTable.id === 'tblReceiptList') {
                min = $('#dateFrom').val();
                max = $('#dateTo').val();
                let startDate = moment(min, 'DD/MM/YYYY');
                let endDate = moment(max, 'DD/MM/YYYY');
                date = moment(data[1], 'DD/MM/YYYY');
                return (min === '' && max === '') ||
                    (min === '' && date <= endDate) ||
                    (startDate <= date && max === null) ||
                    (startDate <= date && date <= endDate);

            } else if (settings.nTable.id === 'tblMerge') {
                min = $('#dateFromMerge').val();
                max = $('#dateToMerge').val();
                let startDate = moment(min, 'DD/MM/YYYY');
                let endDate = moment(max, 'DD/MM/YYYY');
                date = moment(data[1], 'DD/MM/YYYY');

                let merchantFilter = $('#mergeModal .merchants').val();
                let accountFilter = $('#mergeModal .chart-accounts').val();

                if ((min === '' && max === '') ||
                    (min === '' && date <= endDate) ||
                    (startDate <= date && max === null) ||
                    (startDate <= date && date <= endDate)) {
                    return (merchantFilter == '' || merchantFilter == data[2]) && (accountFilter == '' || accountFilter == data[4]);
                }
                return false;
            } else {
                return true;
            }
        }
    );

    setTimeout(function () {
        //$.fn.dataTable.moment('DD/MM/YY');
        $('#tblSplitExpense').DataTable({
            "columns": [{
                'data': 'DateTime'
            },
            {
                'data': 'AccountName'
            },
            {
                'data': 'AmountInc'
            },
            {
                'data': null
            },
            ],
            columnDefs: [{
                type: 'date',
                targets: 0,
                width: '140px',
                class: "colReceiptDate",
                render: function (data, type, row, meta) {
                    let index = meta.row + meta.settings._iDisplayStart;
                    let html = '<div class="input-group date" style="cursor: pointer;width: 140px;">' +
                        '<input type="text" class="form-control dtSplitReceipt" name="dtSplitReceipt" value="' + data + '">' +
                        '<div class="input-group-addon">' +
                        '<span class="glyphicon glyphicon-th" style="cursor: pointer;"></span>' +
                        '</div>' +
                        '</div>';
                    return html;
                }
            }, {
                targets: 1,
                class: "colReceiptAccount",
                render: function (data, type, row, meta) {
                    let index = meta.row + meta.settings._iDisplayStart;
                    let html = '<select type="search" id="splitAccount-' + index + '" class="form-control" style="background-color:rgb(255, 255, 255);cursor: pointer;" ></select>';
                    return html;
                }
            }, {
                targets: 2,
                class: "colReceiptAmount",
                width: '20%',
                render: function (data, type, row, meta) {
                    let index = meta.row + meta.settings._iDisplayStart;
                    return '<input id="splitAmount-' + index + '" class="form-control" style="text-align: right" value="$' + data + '" />';
                }
            }, {
                orderable: false,
                targets: 3,
                class: "colDelete",
                width: '3%',
                render: function (data, type, row, meta) {
                    let index = meta.row + meta.settings._iDisplayStart;
                    return '<span class="table-remove btnRemove"><button id="splitRemove-' + index + '" type="button" class="btn btn-danger btn-rounded btn-sm my-0" autocomplete="off"><i class="fa fa-remove"></i></button></span>';
                }
            },],
            "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f>>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
            buttons: [{
                extend: 'excelHtml5',
                text: '',
                download: 'open',
                className: "btntabletocsv hiddenColumn",
                filename: "Awaiting Expense Claim List - " + moment().format(),
                orientation: 'portrait',
                exportOptions: {
                    columns: ':visible:not(.chkBox)',
                    format: {
                        body: function (data, row, column) {
                            if (data.includes("</span>")) {
                                var res = data.split("</span>");
                                data = res[1];
                            }
                            return column === 1 ? data.replace(/<.*?>/ig, "") : data;
                        }
                    }
                }
            }, {
                extend: 'print',
                download: 'open',
                className: "btntabletopdf hiddenColumn",
                text: '',
                title: 'Supplier Payment',
                filename: "Awaiting Expense Claim List - " + moment().format(),
                exportOptions: {
                    columns: ':visible:not(.chkBox)',
                    stripHtml: false
                }
            }],
            select: true,
            destroy: true,
            // colReorder: true,
            colReorder: {
                fixedColumnsLeft: 0
            },
            pageLength: initialReportDatatableLoad,
            "bLengthChange": false,
            info: true,
            responsive: true,
            autoWidth: false,
            "order": [
                [1, "desc"]
            ],
            action: function () {
                // $('#tblSplitExpense').DataTable().ajax.reload();
            },
            "fnInitComplete": function () {
                $("<button class='btn btn-primary btnRefresh' type='button' id='btnRefreshSplit' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblSplitExpense_filter");
                // $('.myvarFilterFormSplit').appendTo(".colDateFilterSplit");
            }
        }).on('page', function () {
            setTimeout(function () {
                MakeNegative();
            }, 100);
        }).on('column-reorder', function () { }).on('length.dt', function (e, settings, len) {
            setTimeout(function () {
                MakeNegative();
            }, 100);
        });
    }, 0);

    $('.imageParent')
        // tile mouse actions
        .on('mouseover', function () {
            $(this).children('.receiptPhoto').css({
                'transform': 'scale(' + $(this).attr('data-scale') + ')'
            });
        })
        .on('mouseout', function () {
            $(this).children('.receiptPhoto').css({
                'transform': 'scale(1)'
            });
        })
        .on('mousemove', function (e) {
            $(this).children('.receiptPhoto').css({
                'transform-origin': ((e.pageX - $(this).offset().left) / $(this).width()) * 100 + '% ' + ((e.pageY - $(this).offset().top) / $(this).height()) * 100 + '%'
            });
        })
        // tiles set up
        .each(function () {
            $(this)
                // add a photo container
                .append('<div class="receiptPhoto"></div>')
            // set up a background image for each tile based on data-image attribute
            // .children('.receiptPhoto').css({
            //     'background-image': 'url(' + $(this).attr('data-image') + ')'
            // });
        });
    $('.imageParentMerge')
        // tile mouse actions
        .on('mouseover', function () {
            $(this).children('.receiptPhotoMerge').css({
                'transform': 'scale(' + $(this).attr('data-scale') + ')'
            });
        })
        .on('mouseout', function () {
            $(this).children('.receiptPhotoMerge').css({
                'transform': 'scale(1)'
            });
        })
        .on('mousemove', function (e) {
            $(this).children('.receiptPhotoMerge').css({
                'transform-origin': ((e.pageX - $(this).offset().left) / $(this).width()) * 100 + '% ' + ((e.pageY - $(this).offset().top) / $(this).height()) * 100 + '%'
            });
        })
        // tiles set up
        .each(function () {
            $(this)
                // add a photo container
                .append('<div class="receiptPhotoMerge"></div>')
            // set up a background image for each tile based on data-image attribute
            // .children('.receiptPhoto').css({
            //     'background-image': 'url(' + $(this).attr('data-image') + ')'
            // });
        });

    jQuery.extend(jQuery.fn.dataTableExt.oSort, {
        "extract-date-pre": function (date) {
            date = date.split('/');
            return Date.parse(date[1] + '/' + date[0] + '/' + date[2])
        },
        "extract-date-asc": function (a, b) {
            return ((a < b) ? -1 : ((a > b) ? 1 : 0));
        },
        "extract-date-desc": function (a, b) {
            return ((a < b) ? 1 : ((a > b) ? -1 : 0));
        }
    });

    templateObject.getSuppliers = function () {
        accountService.getSupplierVS1().then(function (data) {
            let lineItems = [];
            for (let i in data.tsuppliervs1) {
                if (data.tsuppliervs1.hasOwnProperty(i)) {
                    let lineItem = {
                        supplierid: data.tsuppliervs1[i].Id || ' ',
                        suppliername: data.tsuppliervs1[i].ClientName || ' ',
                        billingAddress: data.tsuppliervs[i].ClientName + "\n" + data.tsuppliervs[i].BillStreet + "\n" + data.tsuppliervs[i].BillStreet2 + "\n" + data.tsuppliervs[i].BillState + "\n" +
                            data.tsuppliervs[i].BillPostcode + "\n" + data.tsuppliervs[i].Billcountry
                    };
                    lineItems.push(lineItem);
                }
            }
            templateObject.suppliers.set(lineItems);
        }).catch(function (err) {

        });
    };
    templateObject.getSuppliers();

    templateObject.getExpenseClaims = function () {
        $('.fullScreenSpin').css('display', 'inline-block');
        //Load Indexdb data
        getVS1Data('TExpenseClaim').then(function (dataObject) {
            if (dataObject.length == 0) { // check if no idexdb
                accountService.getExpenseClaim().then(function (data) {
                    getExpenseClaimList(data);
                });
            } else { //else load data from indexdb
                let data = JSON.parse(dataObject[0].data);
                getExpenseClaimList(data);
            }
        }).catch(function (err) {
            accountService.getExpenseClaim().then(function (data) {
                getExpenseClaimList(data);
            });
        });
    };


    templateObject.openReceiptClaimModal = function (selectedId) {
        let selectedClaim = templateObject.expenseClaimList.get().filter(claim => claim.MetaID == selectedId)[0];
        templateObject.editExpenseClaim.set(selectedClaim);
        let categoryAccountList = templateObject.categoryAccounts.get();
        let categoryName = '';
        for (let i = 0; i < categoryAccountList.length; i++) {
            if ((categoryAccountList[i][5]) === selectedClaim.AccountId) {
                categoryName = categoryAccountList[i][0];
            }
        }
        $('#employeeListModal').attr('data-from', 'ViewReceipt');
        $('#viewReceiptModal').modal('toggle');
        $('#viewReceiptModal .receiptID').html(selectedId);
        $('#viewReceiptModal .employees').val(selectedClaim.EmployeeName);
        $('#viewReceiptModal .employees').attr('data-id', selectedClaim.EmployeeID);
        $('#viewReceiptModal .merchants').val(selectedClaim.SupplierName);
        $('#viewReceiptModal .merchants').attr('data-id', selectedClaim.SupplierID);
        $('#viewReceiptModal .chart-accounts').val(categoryName);
        $('#viewReceiptModal .chart-accounts').attr('data-id', selectedClaim.AccountId);
        $('#viewReceiptModal .chart-accounts').attr('data-name', selectedClaim.AccountName);
        $('#viewReceiptModal .transactionTypes').val(selectedClaim.Paymethod);
        $('#viewReceiptModal .txaDescription').val(selectedClaim.Description);
        $('#viewReceiptModal .trip-groups').val(selectedClaim.TripGroup);
        $('#viewReceiptModal #receiptMetaID').val(selectedClaim.MetaID);
        $('#viewReceiptModal #receiptLineID').val(selectedClaim.LineID);

        if (selectedClaim.Attachments) {
            let imageData = selectedClaim.Attachments[0].fields.Description + "," + selectedClaim.Attachments[0].fields.Attachment;
            $('#viewReceiptModal .receiptPhoto').css('background-image', "url('" + imageData + "')");
            $('#viewReceiptModal .receiptPhoto').attr('data-name', selectedClaim.Attachments[0].fields.AttachmentName);
            $('#viewReceiptModal .img-placeholder').css('opacity', 0);
        } else {
            $('#viewReceiptModal .receiptPhoto').css('background-image', "none");
            $('#viewReceiptModal .receiptPhoto').attr('data-name', "");
            $('#viewReceiptModal .img-placeholder').css('opacity', 1);
        }
    }

    function getExpenseClaimList(data) {
        addVS1Data('TExpenseClaim', JSON.stringify(data));
        let lineItems = [];
        data.texpenseclaimex.forEach(expense => {
            if (Object.prototype.toString.call(expense.fields.Lines) === "[object Array]") {
                expense.fields.Lines.forEach(claim => {
                    let lineItem = claim.fields;
                    lineItem.DateTime = claim.fields.DateTime != '' ? moment(claim.fields.DateTime).format("DD/MM/YYYY") : '';
                    lineItem.MetaID = expense.fields.ID;
                    lineItem.LineID = lineItem.ID;
                    lineItem.TripGroup = expense.fields.TripGroup;
                    if (lineItem.TripGroup == "T") {
                        lineItem.TripGroup = "";
                    }
                    lineItems.push(lineItem);
                })
            } else if (Object.prototype.toString.call(expense.fields.Lines) === "[object Object]") {
                let lineItem = expense.fields.Lines.fields;
                lineItem.DateTime = lineItem.DateTime != '' ? moment(lineItem.DateTime).format("DD/MM/YYYY") : '';
                lineItem.MetaID = expense.fields.ID;
                lineItem.LineID = lineItem.ID;
                lineItem.TripGroup = expense.fields.TripGroup;
                if (lineItem.TripGroup == "T") {
                    lineItem.TripGroup = "";
                }
                lineItems.push(lineItem);
            }
        });
        templateObject.expenseClaimList.set(lineItems);
        setTimeout(function () {
            //$.fn.dataTable.moment('DD/MM/YY');
            $('#tblReceiptList').DataTable({
                columnDefs: [{
                    "orderable": false,
                    "targets": 0
                }, {
                    type: 'extract-date',
                    targets: 1
                }],
                "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-12 col-md-6 colDateFilter p-0'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                buttons: [{
                    extend: 'excelHtml5',
                    text: '',
                    download: 'open',
                    className: "btntabletocsv hiddenColumn",
                    filename: "Awaiting Expense Payments Claim - " + moment().format(),
                    orientation: 'portrait',
                    exportOptions: {
                        columns: ':visible:not(.chkBox)',
                        format: {
                            body: function (data, row, column) {
                                if (data.includes("</span>")) {
                                    const res = data.split("</span>");
                                    data = res[1];
                                }
                                return column === 1 ? data.replace(/<.*?>/ig, "") : data;
                            }
                        }
                    }
                }, {
                    extend: 'print',
                    download: 'open',
                    className: "btntabletopdf hiddenColumn",
                    text: '',
                    title: 'Expense Claim',
                    filename: "Awaiting Expense Claim List - " + moment().format(),
                    exportOptions: {
                        columns: ':visible:not(.chkBox)',
                        stripHtml: false
                    }
                }],
                select: true,
                destroy: true,
                // colReorder: true,
                colReorder: {
                    fixedColumnsLeft: 0
                },
                pageLength: initialReportDatatableLoad,
                "bLengthChange": false,
                info: true,
                responsive: true,
                "order": [
                    [1, "desc"]
                ],
                action: function () {
                    // $('#tblReceiptList').DataTable().ajax.reload();
                },
                "fnInitComplete": function () {
                    $("<button class='btn btn-primary btnRefresh' type='button' id='btnRefresh' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblReceiptList_filter");
                    $('.myvarFilterForm').appendTo(".colDateFilter");
                    if (FlowRouter.current().queryParams.id) {
                        templateObject.openReceiptClaimModal(FlowRouter.current().queryParams.id);
                    }
                }
            }).on('page', function () {
                setTimeout(function () {
                    MakeNegative();
                }, 100);

            }).on('column-reorder', function () { }).on('length.dt', function (e, settings, len) {
                setTimeout(function () {
                    MakeNegative();
                }, 100);
            });

            $('#tblMerge').DataTable({
                columnDefs: [{
                    orderable: false,
                    targets: 0
                }, {
                    type: 'extract-date',
                    targets: 1
                }],
                "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6 colDateFilterMerge'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                buttons: [{
                    extend: 'excelHtml5',
                    text: '',
                    download: 'open',
                    className: "btntabletocsv hiddenColumn",
                    filename: "Awaiting Expense Claim List - " + moment().format(),
                    orientation: 'portrait',
                    exportOptions: {
                        columns: ':visible:not(.chkBoxMerge)',
                        format: {
                            body: function (data, row, column) {
                                if (data.includes("</span>")) {
                                    const res = data.split("</span>");
                                    data = res[1];
                                }
                                return column === 1 ? data.replace(/<.*?>/ig, "") : data;
                            }
                        }
                    }
                }, {
                    extend: 'print',
                    download: 'open',
                    className: "btntabletopdf hiddenColumn",
                    text: '',
                    title: 'Supplier Payment',
                    filename: "Awaiting Expense Claim List - " + moment().format(),
                    exportOptions: {
                        columns: ':visible:not(.chkBoxMerge)',
                        stripHtml: false
                    }
                }],
                select: true,
                destroy: true,
                colReorder: true,
                // colReorder: {
                //     fixedColumnsLeft: 0
                // },
                pageLength: initialReportDatatableLoad,
                "bLengthChange": false,
                info: true,
                responsive: true,
                "order": [
                    [1, "desc"]
                ],
                action: function () {
                    $('#tblMerge').DataTable().ajax.reload();
                },
                "fnInitComplete": function () {
                    $("<button class='btn btn-primary btnRefresh' type='button' id='btnRefreshMerge' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblMerge_filter");
                    $('.myvarFilterFormMerge').appendTo(".colDateFilterMerge");
                }
            }).on('page', function () {
                setTimeout(function () {
                    MakeNegative();
                }, 100);
                // let draftRecord = templateObject.datatablerecords.get();
                // templateObject.datatablerecords.set(draftRecord);
            }).on('column-reorder', function () { }).on('length.dt', function (e, settings, len) {
                setTimeout(function () {
                    MakeNegative();
                }, 100);
            });
            $('.fullScreenSpin').css('display', 'none');

            templateObject.setTimeFilter('lastMonth');
            templateObject.setMergeTimeFilter('lastMonthMerge');

        }, 0);
        // $('.dataTables_info').html('Showing 1 to '+ lineItems.length + ' of ' + lineItems.length + ' entries');
    }
    templateObject.getExpenseClaims();

    templateObject.getOCRResultFromImage = function (imageData, fileName) {
        $('.fullScreenSpin').css('display', 'inline-block');
        ocrService.POST(imageData, fileName).then(function (data) {
            $('.fullScreenSpin').css('display', 'none');

            let from = $('#employeeListModal').attr('data-from');
            let paymenttype = data.payment_type;
            let transactionTypeName = "Cash";
            if (paymenttype == "master_card") {
                transactionTypeName = "Master Card";
            } else if (paymenttype == "credit_card") {
                transactionTypeName = "Credit Card";
            } else if (paymenttype == "visa") {
                transactionTypeName = "VISA";
            }
            let loggedUserName = Session.get('mySessionEmployee');
            let loggedUserId = Session.get('mySessionEmployeeLoggedID');
            let currency = Session.get('ERPCountryAbbr');
            let parentElement;
            if (from == 'ViewReceipt') {
                parentElement = "#viewReceiptModal";
            } else if (from == 'NavExpense') {
                parentElement = "#nav-expense";
            } else if (from == 'NavTime') {
                parentElement = "#nav-time";
            }
            let objDetails;
            let supplier_name = data.supplier.value?  data.supplier.value:"";
            let phone_number = "";
            // let phone_number = data.vendor.phone_number? data.vendor.phone_number:"";
            let email = "";
            // let email = data.vendor.email? data.vendor.email:"";
            let currency_code = data.locale.currency? data.locale.currency:"";
            let note = data.tip.value? data.tip.value:"";
            // let address = data.vendor.address? data.vendor.address:"";
            let address = "";
            let vendor_type = data.category.value? data.category.value : "";

            // if (supplier_name == "") {
            //     let keyword = "Store:";
            //     let start_pos = data.ocr_text.indexOf(keyword);
            //     if (start_pos > 0) {
            //         start_pos += keyword.length;
            //         let subtext = data.ocr_text.substring(start_pos, data.ocr_text.length-1);
            //         let end_pos = subtext.trim().indexOf("\n");
            //         let subtext2 = subtext.substring(0, end_pos+1);
            //         let end_pos2 = subtext2.trim().indexOf("\t");
            //         if (end_pos2 != -1) {
            //             supplier_name = subtext2.substring(0, end_pos2+1);
            //         } else {
            //             supplier_name = subtext2;
            //         }
            //         supplier_name = supplier_name.trim();
            //     } else if (data.vendor.address && data.vendor.address != "") {
            //         let pos = data.ocr_text.indexOf(data.vendor.address);
            //         supplier_name = data.ocr_text.substring(0, pos-1);
            //         supplier_name = supplier_name.replace("\n", " ");
            //         supplier_name = supplier_name.trim();
            //     }
            // }
            if (supplier_name != "") {
                let isExistSupplier = false;
                templateObject.suppliers.get().forEach(supplier => {
                    if (supplier_name == supplier.suppliername) {
                        isExistSupplier = true;
                        $(parentElement + ' .merchants').val(supplier_name);
                        $(parentElement + ' .merchants').attr('data-id', supplier.supplierid);
                    }
                });
                if (!isExistSupplier) {
                    contactService.getOneSupplierDataExByName(supplier_name).then(function (data) {
                        if (data.tsupplier.length == 0) {
                            // create supplier with vendor data
                            objDetails = {
                                type: "TSupplier",
                                fields: {
                                    ClientName: supplier_name,
                                    FirstName: 'Unknown',
                                    LastName: '',
                                    Phone: phone_number,
                                    Mobile: '',
                                    Email: email,
                                    SkypeName: '',
                                    Street: address,
                                    Street2: '',
                                    Suburb: '',
                                    State: '',
                                    PostCode: '',
                                    Country: '',
                                    BillStreet: address,
                                    BillStreet2: '',
                                    BillState: '',
                                    BillPostCode: '',
                                    Billcountry: '',
                                    PublishOnVS1: true,
                                    Notes: vendor_type
                                }
                            };
                            contactService.saveSupplier(objDetails).then(function (supplier) {
                                let supplierSaveID = supplier.fields.ID;
                                if (supplierSaveID) {
                                    sideBarService.getAllSuppliersDataVS1(initialBaseDataLoad, 0).then(function (dataReload) {
                                        addVS1Data('TSupplierVS1', JSON.stringify(dataReload));
                                        $('.fullScreenSpin').css('display', 'none');
                                        //  Meteor._reload.reload();
                                        $(parentElement + ' .merchants').val(supplier_name);
                                        $(parentElement + ' .merchants').attr('data-id', supplier.fields.ID);
                                        const suppliers = templateObject.suppliers.get();
                                        suppliers.push({
                                            supplierid: supplier.fields.ID,
                                            suppliername: supplier_name,
                                        });
                                        templateObject.suppliers.set(suppliers);
                                    }).catch(function (err) {
                                        $('.fullScreenSpin').css('display', 'none');
                                    });
                                }
                            }).catch(function (err) {
                                swal({
                                    title: 'Oooops...',
                                    text: err,
                                    type: 'error',
                                    showCancelButton: false,
                                    confirmButtonText: 'Try Again'
                                }).then((result) => {
                                    if (result.value) {

                                    } else if (result.dismiss == 'cancel') {

                                    }
                                });
                                $('.fullScreenSpin').css('display', 'none');
                            });
                        } else {
                            $(parentElement + ' .merchants').val(supplier_name);
                            $(parentElement + ' .merchants').attr('data-id', data.tsupplier[0].fields.ID);
                            const suppliers = templateObject.suppliers.get();
                            suppliers.push({
                                supplierid: data.tsupplier[0].fields.ID,
                                suppliername: supplier_name,
                            });
                            templateObject.suppliers.set(suppliers);
                            $('.fullScreenSpin').css('display', 'none');
                        }
                    }).catch(function (err) {

                    });
                }
            } else {
                swal({
                    title: 'Oooops...',
                    text: "Failed to get information from the Receipt. Please use other valid receipt.",
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {

                    } else if (result.dismiss == 'cancel') {

                    }
                });
                $('.fullScreenSpin').css('display', 'none');
            }
            $(parentElement + ' .employees').attr('data-id', loggedUserId);
            $(parentElement + ' .employees').val(loggedUserName);
            // $(parentElement + ' .currencies').val(currency);
            $(parentElement + ' .currencies').val(currency_code);
            $(parentElement + ' .dtReceiptDate').datepicker('setDate', new Date(data.date.value));
            // $(parentElement + ' .edtTotal').val('$' + data.total);
            $(parentElement + ' .edtTotal').val(data.total_amount.value);
            $(parentElement + ' .transactionTypes').val(transactionTypeName);
            $(parentElement + ' #txaDescription').val(note);
        }).catch(function (err) {
            let errText = "";
            if (err.error == "401") {
                errText = "You have run out of free scans. Please upgrade your account to get more scans";
                swal({
                    title: 'Oooops...',
                    text: errText,
                    type: 'error',
                    showCancelButton: false,
                    showConfirmButton: false,
                    // confirmButtonText: 'Try Again'
                    timer: 2000
                }).then((result) => {
                    swal.close();
                });
            } else {
                errText = err;
            }
            $('.fullScreenSpin').css('display', 'none');
        });
    };

    templateObject.getOCRResultFromImageForMultiple = function(imageData, fileName, index) {
        
        $('.fullScreenSpin').css('display', 'inline-block');
        ocrService.POST(imageData, fileName).then(function(data) {
            $('.fullScreenSpin').css('display', 'none');

            let from = $('#employeeListModal').attr('data-from');
            let paymenttype = data.payment_type;
            let transactionTypeName = "Cash";
            if (paymenttype == "master_card") {
                transactionTypeName = "Master Card";
            } else if (paymenttype == "credit_card") {
                transactionTypeName = "Credit Card";
            } else if (paymenttype == "visa") {
                transactionTypeName = "VISA";
            }
            let loggedUserName = Session.get('mySessionEmployee');
            let loggedUserId = Session.get('mySessionEmployeeLoggedID');
            let currency = Session.get('ERPCountryAbbr');
            let parentElement;
            if (from == 'ViewReceipt') {
                parentElement = "#viewReceiptModal";
            } else if (from == 'NavExpense') {
                parentElement = "#nav-expense";
            } else if (from == 'NavTime') {
                parentElement = "#nav-time";
            }
            let objDetails;
            let supplier_name = data.supplier.value?  data.supplier.value:"";
            let phone_number = "";
            // let phone_number = data.vendor.phone_number? data.vendor.phone_number:"";
            let email = "";
            // let email = data.vendor.email? data.vendor.email:"";
            let currency_code = data.locale.currency? data.locale.currency:"";
            let note = data.tip.value? data.tip.value:"";
            // let address = data.vendor.address? data.vendor.address:"";
            let address = "";
            let vendor_type = data.category.value? data.category.value : "";

            // if (supplier_name == "") {
            //     let keyword = "Store:";
            //     let start_pos = data.ocr_text.indexOf(keyword);
            //     if (start_pos > 0) {
            //         start_pos += keyword.length;
            //         let subtext = data.ocr_text.substring(start_pos, data.ocr_text.length-1);
            //         let end_pos = subtext.trim().indexOf("\n");
            //         let subtext2 = subtext.substring(0, end_pos+1);
            //         let end_pos2 = subtext2.trim().indexOf("\t");
            //         if (end_pos2 != -1) {
            //             supplier_name = subtext2.substring(0, end_pos2+1);
            //         } else {
            //             supplier_name = subtext2;
            //         }
            //         supplier_name = supplier_name.trim();
            //     } else if (data.vendor.address && data.vendor.address != "") {
            //         let pos = data.ocr_text.indexOf(data.vendor.address);
            //         supplier_name = data.ocr_text.substring(0, pos-1);
            //         supplier_name = supplier_name.replace("\n", " ");
            //         supplier_name = supplier_name.trim();
            //     }
            // }
            if (supplier_name != "") {
                let isExistSupplier = false;
                templateObject.suppliers.get().forEach(supplier => {
                    if (supplier_name == supplier.suppliername) {
                        isExistSupplier = true;
                        $('#multipleSupplier-' + index).val(supplier_name);
                        $('#multipleSupplier-' + index).attr('data-id', supplier.supplierid);
                    }
                });
                if (!isExistSupplier) {
                    contactService.getOneSupplierDataExByName(supplier_name).then(function(data) {
                        if (data.tsupplier.length == 0) {
                            // create supplier with vendor data
                            objDetails = {
                                type: "TSupplier",
                                fields: {
                                    ClientName: supplier_name,
                                    FirstName: 'Unknown',
                                    LastName: '',
                                    Phone: phone_number,
                                    Mobile: '',
                                    Email: email,
                                    SkypeName: '',
                                    Street: address,
                                    Street2: '',
                                    Suburb: '',
                                    State: '',
                                    PostCode: '',
                                    Country: '',
                                    BillStreet: address,
                                    BillStreet2: '',
                                    BillState: '',
                                    BillPostCode: '',
                                    Billcountry: '',
                                    PublishOnVS1: true,
                                    Notes: vendor_type
                                }
                            };
                            contactService.saveSupplier(objDetails).then(function(supplier) {
                                let supplierSaveID = supplier.fields.ID;
                                if (supplierSaveID) {
                                    sideBarService.getAllSuppliersDataVS1(initialBaseDataLoad, 0).then(function(dataReload) {
                                        addVS1Data('TSupplierVS1', JSON.stringify(dataReload));
                                        $('.fullScreenSpin').css('display', 'none');
                                        //  Meteor._reload.reload();
                                        $('#multipleSupplier-' + index).val(supplier_name);
                                        $('#multipleSupplier-' + index).attr('data-id', supplier.fields.ID);
                                        const suppliers = templateObject.suppliers.get();
                                        suppliers.push({
                                            supplierid: supplier.fields.ID,
                                            suppliername: supplier_name,
                                        });
                                        templateObject.suppliers.set(suppliers);
                                    }).catch(function(err) {
                                        $('.fullScreenSpin').css('display', 'none');
                                    });
                                }
                            }).catch(function(err) {
                                swal({
                                    title: 'Oooops...',
                                    text: err,
                                    type: 'error',
                                    showCancelButton: false,
                                    confirmButtonText: 'Try Again'
                                }).then((result) => {
                                    if (result.value) {

                                    } else if (result.dismiss == 'cancel') {

                                    }
                                });
                                $('.fullScreenSpin').css('display', 'none');
                            });
                        } else {
                            $('#multipleSupplier-' + index).val(supplier_name);
                            $('#multipleSupplier-' + index).attr('data-id', data.tsupplier[0].fields.ID);
                            const suppliers = templateObject.suppliers.get();
                            suppliers.push({
                                supplierid: data.tsupplier[0].fields.ID,
                                suppliername: supplier_name,
                            });
                            templateObject.suppliers.set(suppliers);
                            $('.fullScreenSpin').css('display', 'none');
                        }
                    }).catch(function(err) {

                    });
                }
            } else {
                swal({
                    title: 'Oooops...',
                    text: "Failed to get information from the Receipt. Please use other valid receipt.",
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {

                    } else if (result.dismiss == 'cancel') {

                    }
                });
                $('.fullScreenSpin').css('display', 'none');
            }
            // $(parentElement + ' .employees').attr('data-id', loggedUserId);
            // $(parentElement + ' .employees').val(loggedUserName);
            // // $(parentElement + ' .currencies').val(currency);
            $('#multipleCurrency' + index).val(currency_code);
            $('#multipleDate-' + index).datepicker('setDate', new Date(data.date.value));
            // // $(parentElement + ' .edtTotal').val('$' + data.total);
            $('#multipleAmount-' + index).val(data.total_amount.value);
            // $(parentElement + ' .transactionTypes').val(transactionTypeName);
            $(' #multipleDescription-'+index).val(note);
        }).catch(function(err) {
            let errText = "";
            if (err.error == "401") {
                errText = "You have run out of free scans. Please upgrade your account to get more scans";
                swal({
                    title: 'Oooops...',
                    text: errText,
                    type: 'error',
                    showCancelButton: false,
                    showConfirmButton: false,
                    // confirmButtonText: 'Try Again'
                    timer: 2000
                }).then((result) => {
                    swal.close();
                });
            } else {
                errText = err;
            }
            $('.fullScreenSpin').css('display', 'none');
        });
    };

    templateObject.base64data = function(file) {
        return new Promise((resolve, reject) => {
            const fr = new FileReader();
            fr.onerror = reject;
            fr.onload = function () {
                resolve(fr.result);
            };
            fr.readAsDataURL(file);
        })
    };

    templateObject.refreshSplitTable = function (rows) {
        let $splitDataTable = $('#tblSplitExpense').DataTable();
        $splitDataTable.clear();
        $splitDataTable.rows.add(rows);
        $splitDataTable.columns.adjust().draw();

        $(".dtSplitReceipt").datepicker({
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
        $(".dtSplitReceipt").css('z-index', '1600');
        $('.colReceiptAmount').css('vertical-align', 'middle');
        $('select[id^="splitAccount-"]').editableSelect();
        setTimeout(() => {
            for (let i = 0; i < rows.length; i++) {
                $('#splitAccount-' + i).attr('data-id', rows[i].AccountId);
                $('#splitAccount-' + i).val(rows[i].AccountName);
            }
        }, 100);
    };
    tableResize();

    templateObject.loadDefaultCurrency(defaultCurrencyCode);
});

Template.receiptsoverview.events({
    'click #nav-multiple-tab': function (event) {
        $("#newExpenseModalDialog").removeClass("modal-lg").addClass("modal-xl");
    },
    'click #nav-expense-tab': function (event) {
        $("#newExpenseModalDialog").removeClass("modal-xl").addClass("modal-lg");
    },
    'click #nav-time-tab': function (event) {
        $("#newExpenseModalDialog").removeClass("modal-xl").addClass("modal-lg");
    },
    'click a#showManuallyCreate, click .btnNewReceipt, click #newReceiptModal #nav-expense-tab': function () {
        $('a.nav-link.active').removeClass('active');
        $('a.nav-link#nav-expense-tab').addClass('active');
        $('#newReceiptModal .tab-pane.show.active').removeClass('show active');
        $('#newReceiptModal .tab-pane#nav-expense').addClass('show active');
        $('#employeeListModal').attr('data-from', 'NavExpense');
        let loggedUserName = Session.get('mySessionEmployee');
        let loggedUserId = Session.get('mySessionEmployeeLoggedID');
        let currency = Session.get('ERPCountryAbbr');
        $('#nav-expense .employees').attr('data-id', loggedUserId);
        $('#nav-expense .employees').val(loggedUserName);
        $('#nav-expense .transactionTypes').attr('data-id', '');
        $('#nav-expense .transactionTypes').val('');
        $('#nav-expense .merchants').attr('data-id', '');
        $('#nav-expense .merchants').val('');
        $('#nav-expense .currencies').attr('data-id', '');
        $('#nav-expense .currencies').val(currency);
        $('#nav-expense .chart-accounts').attr('data-id', '');
        $('#nav-expense .chart-accounts').val('');
        $('#nav-expense .dtReceiptDate').datepicker('setDate', new Date());
        $('#nav-expense .edtTotal').val('');
        $('#nav-expense .swtReiumbursable').attr('checked', false);
        $('#nav-expense #txaDescription').val('');
        $('#nav-expense .receiptPhoto').css('background-image', 'none');
        $('#nav-expense .receiptPhoto').attr('data-name', "");
        $('#nav-expense .img-placeholder').css('opacity', 1);
    },
    'click a#showMultiple, click #newReceiptModal #nav-multiple-tab': function () {
        $('a.nav-link.active').removeClass('active');
        $('a.nav-link#nav-multiple-tab').addClass('active');
        $('#newReceiptModal .tab-pane.show.active').removeClass('show active');
        $('#newReceiptModal .tab-pane#nav-multiple').addClass('show active');
        $('.dtMultiple').val(moment().format('DD/MM/YYYY'));
        $('.multipleAmount').val('$0');
        $('.multipleSupplier').val('');
        $('.multipleSupplier').attr('data-id', 0);
        $('.multipleAccount').val('');
        $('.multipleAccount').attr('data-id', 0);
        $('.multipleDescription').val('');
        $('.multipleAttach').attr('data-image', '');
    },
    'click a#showTime, click #newReceiptModal #nav-time-tab': function () {
        $('a.nav-link.active').removeClass('active');
        $('a.nav-link#nav-time-tab').addClass('active');
        $('#newReceiptModal .tab-pane.show.active').removeClass('show active');
        $('#newReceiptModal .tab-pane#nav-time').addClass('show active');
        $('#employeeListModal').attr('data-from', 'NavTime');
        let loggedUserName = Session.get('mySessionEmployee');
        let loggedUserId = Session.get('mySessionEmployeeLoggedID');
        let currency = Session.get('ERPCountryAbbr');
        $('#nav-time .employees').attr('data-id', loggedUserId);
        $('#nav-time .employees').val(loggedUserName);
        $('#nav-time .transactionTypes').attr('data-id', '');
        $('#nav-time .transactionTypes').val('');
        $('#nav-time .merchants').attr('data-id', '');
        $('#nav-time .merchants').val('');
        $('#nav-time .currencies').attr('data-id', '');
        $('#nav-time .currencies').val(currency);
        $('#nav-time .chart-accounts').attr('data-id', '');
        $('#nav-time .chart-accounts').val('');
        $('#nav-time .dtReceiptDate').datepicker('setDate', new Date());
        $('#nav-time .edtTotal').val('');
        $('#nav-time .swtReiumbursable').attr('checked', false);
        $('#nav-time #txaDescription').val('');
        $('#nav-time .receiptPhoto').css('background-image', "none");
        $('#nav-time .receiptPhoto').attr('data-name', "");
        $('#nav-time .img-placeholder').css('opacity', 1);
    },
    'click #nav-expense .btn-upload': function (event) {
        $('#nav-expense .attachment-upload').trigger('click');
    },
    'click #nav-time .btn-upload': function (event) {
        $('#nav-time .attachment-upload').trigger('click');
    },
    'click #viewReceiptModal .btn-upload': function (event) {
        $('#viewReceiptModal .attachment-upload').trigger('click');
    },
    'change #viewReceiptModal .attachment-upload': function (event) {
        let files = $(event.target)[0].files;
        let imageFile = files[0];
        let template = Template.instance();
        template.base64data(imageFile).then(imageData => {
            $('#viewReceiptModal .receiptPhoto').css('background-image', "url('" + imageData + "')");
            $('#viewReceiptModal .receiptPhoto').attr('data-name', imageFile.name);
            $('#viewReceiptModal .img-placeholder').css('opacity', 0);
            template.getOCRResultFromImage(imageData, imageFile.name);
        })
    },
    'change #nav-expense .attachment-upload': function (event) {
        let files = $(event.target)[0].files;
        let imageFile = files[0];
        let template = Template.instance();
        template.base64data(imageFile).then(imageData => {
            $('#nav-expense .receiptPhoto').css('background-image', "url('" + imageData + "')");
            $('#nav-expense .receiptPhoto').attr('data-name', imageFile.name);
            $('#nav-expense .img-placeholder').css('opacity', 0);
            template.getOCRResultFromImage(imageData, imageFile.name);
        })
    },
    'change #nav-time .attachment-upload': function (event) {
        let files = $(event.target)[0].files;
        let imageFile = files[0];
        let template = Template.instance();
        template.base64data(imageFile).then(imageData => {
            $('#nav-time .receiptPhoto').css('background-image', "url('" + imageData + "')");
            $('#nav-time .receiptPhoto').attr('data-name', imageFile.name);
            $('#nav-time .img-placeholder').css('opacity', 0);
            template.getOCRResultFromImage(imageData, imageFile.name);
        })
    },    
    'change #dateFrom, change #dateTo': function(event) {
        const receiptTable = $('#tblReceiptList').DataTable();
        receiptTable.draw();
    },
    'change #dateFromMerge, change #dateToMerge': function (event) {
        const receiptTable = $('#tblMerge').DataTable();
        receiptTable.draw();
    },
    'click #formCheck-All': function (event) {
        if ($(event.target).is(':checked')) {
            $(".chkBox").prop("checked", true);
        } else {
            $(".chkBox").prop("checked", false);
        }
    },
    'click #formCheckMerge-All': function (event) {
        let template = Template.instance();
        if ($(event.target).is(':checked')) {
            $(".chkBoxMerge").prop("checked", true);
            let mergeTable = $('#tblMerge').DataTable();
            const lineItems = mergeTable.rows().data();
            template.mergeReceiptRecords.set(lineItems);
        } else {
            $(".chkBoxMerge").prop("checked", false);
            template.mergeReceiptRecords.set([]);
        }
    },
    'click input[id^="formCheckMerge-"]': function (e) {
        let mergeReceipts;
        let template = Template.instance();
        let itemId = e.target.id.split('-')[1];
        let lineItem = template.expenseClaimList.get().filter(item => item.ID == itemId)[0];
        if ($(e.target).is(':checked')) {
            mergeReceipts = template.mergeReceiptRecords.get();
            let index = mergeReceipts.findIndex(x => x.ID == itemId);
            if (index === -1) {
                mergeReceipts.push(lineItem);
            }
            template.mergeReceiptRecords.set(mergeReceipts);
        } else {
            mergeReceipts = template.mergeReceiptRecords.get();
            let index = mergeReceipts.findIndex(x => x.ID == itemId);
            mergeReceipts.splice(index, 1);
            template.mergeReceiptRecords.set(mergeReceipts);
        }
    },
    'click .timeFilter': function (event) {
        let id = event.target.id;
        let template = Template.instance();
        template.setTimeFilter(id);
    },
    'click .timeFilterMerge': function (event) {
        let id = event.target.id;
        let template = Template.instance();
        template.setMergeTimeFilter(id);
    },
    'click #tblReceiptList tbody tr td:not(:first-child)': function (event) {
        let template = Template.instance();
        const selectedId = $(event.target).closest('tr').attr('id');
        template.openReceiptClaimModal(selectedId)
    },
    'click #tblEmployeelist tbody tr': function (e) {
        let employeeName = $(e.target).closest('tr').find(".colEmployeeName").text() || '';
        let employeeID = $(e.target).closest('tr').find(".colID").text() || '';
        let from = $('#employeeListModal').attr('data-from');
        if (from == 'ViewReceipt') {
            $('#viewReceiptModal .employees').val(employeeName);
            $('#viewReceiptModal .employees').attr('data-id', employeeID);
        } else if (from == 'NavExpense') {
            $('#nav-expense .employees').val(employeeName);
            $('#nav-expense .employees').attr('data-id', employeeID);
        } else if (from == 'NavTime') {
            $('#nav-time .employees').val(employeeName);
            $('#nav-time .employees').attr('data-id', employeeID);
        }
        $('#employeeListModal').modal('toggle');
    },
    'click #tblSupplierlist tbody tr': function (e) {
        let supplierName = $(e.target).closest('tr').find(".colCompany").text() || '';
        let supplierID = $(e.target).closest('tr').find(".colID").text() || '';
        let from = $('#employeeListModal').attr('data-from');
        if (from == 'ViewReceipt') {
            $('#viewReceiptModal .merchants').val(supplierName);
            $('#viewReceiptModal .merchants').attr('data-id', supplierID);
        } else if (from == 'NavExpense') {
            $('#nav-expense .merchants').val(supplierName);
            $('#nav-expense .merchants').attr('data-id', supplierID);
        } else if (from == 'NavTime') {
            $('#nav-time .merchants').val(supplierName);
            $('#nav-time .merchants').attr('data-id', supplierID);
        } else if (from.includes('multipleSupplier-')) {
            $('#' + from).val(supplierName);
            $('#' + from).attr('data-id', supplierID);
        } else if (from == 'MergeModal') {
            $('#mergeModal .merchants').val(supplierName);
            $('#mergeModal .merchants').attr('data-id', supplierID);
            $('#tblMerge').DataTable().draw();
        }
        $('#supplierListModal').modal('toggle');
    },
    'click #tblCurrencyPopList tbody tr': function (e) {
        let currencyName = $(e.target).closest('tr').find(".colCode").text() || '';
        let currencyID = $(e.target).closest('tr').attr('id') || '';
        let buyRate = $(e.target).closest('tr').find(".colBuyRate").text() || "";
        let from = $('#employeeListModal').attr('data-from');

        if (from == 'ViewReceipt') {
            $('#viewReceiptModal .currencies').val(currencyName);
            $('#viewReceiptModal .currencies').attr('data-id', currencyID);
            $('#viewReceiptModal .currencies').attr('buy-rate', buyRate);
            $('#viewReceiptModal .currencies').trigger("change");
        } else if (from == 'NavExpense') {
            $('#nav-expense .currencies').val(currencyName);
            $('#nav-expense .currencies').attr('data-id', currencyID);
            $('#nav-expense .currencies').attr('buy-rate', buyRate);
            $('#nav-expense .currencies').trigger("change");
        } else if (from == 'NavTime') {
            $('#nav-time .currencies').val(currencyName);
            $('#nav-time .currencies').attr('data-id', currencyID);
            $('#nav-time .currencies').attr('buy-rate', buyRate);
            $('#nav-time .currencies').trigger("change");
        }
        $('#currencyModal').modal('toggle');
    },
    'click #tblAccountReceipt tbody tr': function (e) {
        let accountName = $(e.target).closest('tr').find(".productName").text() || '';
        let accountID = $(e.target).closest('tr').find(".colAccountID").text() || '';
        let from = $('#employeeListModal').attr('data-from');

        if (from == 'ViewReceipt') {
            $('#viewReceiptModal .chart-accounts').val(accountName);
            $('#viewReceiptModal .chart-accounts').attr('data-id', accountID);
        } else if (from == 'NavExpense') {
            $('#nav-expense .chart-accounts').val(accountName);
            $('#nav-expense .chart-accounts').attr('data-id', accountID);
        } else if (from == 'NavTime') {
            $('#nav-time .chart-accounts').val(accountName);
            $('#nav-time .chart-accounts').attr('data-id', accountID);
        } else if (from.includes('splitAccount-')) {
            $('#' + from).val(accountName);
            $('#' + from).attr('data-id', accountID);
            let index = from.split('-')[1];
            let splitDataTable = $('#tblSplitExpense').DataTable();
            let rowData = splitDataTable.row(index).data();
            rowData.AccountId = parseInt(accountID);
            rowData.AccountName = accountName;
        } else if (from.includes('multipleAccount-')) {
            $('#' + from).val(accountName);
            $('#' + from).attr('data-id', accountID);
        } else if (from == 'MergeModal') {
            $('#mergeModal .chart-accounts').val(accountName);
            $('#mergeModal .chart-accounts').attr('data-id', accountID);
            $('#tblMerge').DataTable().draw();
        }
        $('#accountListModal').modal('toggle');
    },
    'click .btnAddNewAccount': function (event) {
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
        let dataSearchName = $('#tblAccountReceipt_filter input').val();
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
                    const datatable = $('#tblAccountReceipt').DataTable();
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
            sideBarService.getAccountListVS1().then(function (data) {
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
                const datatable = $('#tblAccountReceipt').DataTable();
                datatable.clear();
                datatable.rows.add(splashArrayAccountList);
                datatable.draw(false);
                $('.fullScreenSpin').css('display', 'none');
            }).catch(function (err) {
                $('.fullScreenSpin').css('display', 'none');
            });
        }
    },
    'keyup #tblAccountReceipt_filter input': function (event) {
        if (event.keyCode === 13) {
            $(".btnRefreshAccount").trigger("click");
        }
    },
    'click #tblCategory tbody tr': function (e) {
        let category = $(e.target).closest('tr').find(".colReceiptCategory").text() || '';
        let accountName = $(e.target).closest('tr').find(".colAccountName").text() || '';
        let accountID = $(e.target).closest('tr').find(".colAccountID").text() || '';
        let from = $('#employeeListModal').attr('data-from');

        if (from == 'ViewReceipt') {
            $('#viewReceiptModal .chart-accounts').val(category);
            $('#viewReceiptModal .chart-accounts').attr('data-name', accountName);
            $('#viewReceiptModal .chart-accounts').attr('data-id', accountID);
        } else if (from == 'NavExpense') {
            $('#nav-expense .chart-accounts').val(category);
            $('#nav-expense .chart-accounts').attr('data-name', accountName);
            $('#nav-expense .chart-accounts').attr('data-id', accountID);
        } else if (from == 'NavTime') {
            $('#nav-time .chart-accounts').val(category);
            $('#nav-time .chart-accounts').attr('data-name', accountName);
            $('#nav-time .chart-accounts').attr('data-id', accountID);
        }
        $('#categoryListModal').modal('toggle');
    },
    'click .btnAddNewReceiptCategory': function (event) {
        $('#add-receiptcategory-title').text('Add New Receipt Category');
        $('#edtReceiptCategoryID').val('');
        $('#edtReceiptCategoryName').val('');
        $('#edtReceiptCategoryDesc').val('');
    },
    'click .btnRefreshCategoryAccount': function (event) {
        $('.fullScreenSpin').css('display', 'inline-block');
        const splashArrayAccountList = [];
        let receiptService = new ReceiptService();
        let sideBarService = new SideBarService();
        let dataSearchName = $('#tblCategory_filter input').val();
        let categories = [];
        if (dataSearchName.replace(/\s/g, '') !== '') {
            receiptService.getSearchReceiptCategoryByName(dataSearchName).then(function (data) {
                if (data.treceiptcategory.length > 0) {
                    for (let i in data.treceiptcategory) {
                        if (data.treceiptcategory.hasOwnProperty(i)) {
                            categories.push(data.treceiptcategory[i].fields.CategoryName);
                        }
                    }
                    sideBarService.getAccountListVS1().then(function (data) {
                        if (data.taccountvs1.length > 0) {
                            for (let i = 0; i < data.taccountvs1.length; i++) {
                                const dataList = [
                                    data.taccountvs1[i].fields.ReceiptCategory || '',
                                    data.taccountvs1[i].fields.AccountName || '',
                                    data.taccountvs1[i].fields.Description || '',
                                    data.taccountvs1[i].fields.AccountNumber || '',
                                    data.taccountvs1[i].fields.TaxCode || '',
                                    data.taccountvs1[i].fields.ID || ''
                                ];
                                if (data.taccountvs1[i].fields.ReceiptCategory != '' && categories.includes(data.taccountvs1[i].fields.ReceiptCategory)) {
                                    splashArrayAccountList.push(dataList);
                                }
                            }
                            const datatable = $('#tblCategory').DataTable();
                            datatable.clear();
                            datatable.rows.add(splashArrayAccountList);
                            datatable.draw(false);
                        }
                        $('.fullScreenSpin').css('display', 'none');
                    }).catch(function (err) {
                        $('.fullScreenSpin').css('display', 'none');
                    })
                } else {
                    $('.fullScreenSpin').css('display', 'none');
                    $('#categoryListModal').modal('toggle');
                    swal({
                        title: 'Question',
                        text: "Category does not exist, would you like to create it?",
                        type: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Yes',
                        cancelButtonText: 'No'
                    }).then((result) => {
                        if (result.value) {
                            $('#addReceiptCategoryModal').modal('toggle');
                            $('#edtReceiptCategoryName').val(dataSearchName);
                        } else if (result.dismiss === 'cancel') {
                            $('#categoryListModal').modal('toggle');
                        }
                    });
                }
            }).catch(function (err) {
                $('.fullScreenSpin').css('display', 'none');
            });
        } else {
            sideBarService.getReceiptCategory().then(function (data) {
                if (data.treceiptcategory.length > 0) {
                    for (let i in data.treceiptcategory) {
                        if (data.treceiptcategory.hasOwnProperty(i)) {
                            categories.push(data.treceiptcategory[i].CategoryName);
                        }
                    }
                    sideBarService.getAccountListVS1().then(function (data) {
                        if (data.taccountvs1.length > 0) {
                            for (let i = 0; i < data.taccountvs1.length; i++) {
                                const dataList = [
                                    data.taccountvs1[i].fields.ReceiptCategory || '',
                                    data.taccountvs1[i].fields.AccountName || '',
                                    data.taccountvs1[i].fields.Description || '',
                                    data.taccountvs1[i].fields.AccountNumber || '',
                                    data.taccountvs1[i].fields.TaxCode || '',
                                    data.taccountvs1[i].fields.ID || ''
                                ];
                                if (data.taccountvs1[i].fields.ReceiptCategory != '' && categories.includes(data.taccountvs1[i].fields.ReceiptCategory)) {
                                    splashArrayAccountList.push(dataList);
                                }
                            }
                            const datatable = $('#tblCategory').DataTable();
                            datatable.clear();
                            datatable.rows.add(splashArrayAccountList);
                            datatable.draw(false);
                            $('.fullScreenSpin').css('display', 'none');
                        }
                    }).catch(function (err) {
                        $('.fullScreenSpin').css('display', 'none');
                    })
                }
                $('.fullScreenSpin').css('display', 'none');
            }).catch(function (err) {
                $('.fullScreenSpin').css('display', 'none');
            });
        }
    },
    'keyup #tblCategory_filter input': function (event) {
        if (event.keyCode === 13) {
            $(".btnRefreshCategoryAccount").trigger("click");
        }
    },
    'click #addReceiptCategoryModal .btnSave': function (event) {
        playSaveAudio();
        let receiptService = new ReceiptService();
        setTimeout(function () {
            $('.fullScreenSpin').css('display', 'inline-block');

            let receiptCategoryID = $('#edtReceiptCategoryID').val();
            let receiptCategoryName = $('#edtReceiptCategoryName').val();
            if (receiptCategoryName == '') {
                swal('Receipt Category name cannot be blank!', '', 'warning');
                $('.fullScreenSpin').css('display', 'none');
                return false;
            }
            let receiptCategoryDesc = $('#edtReceiptCategoryDesc').val();
            let objDetails = '';
            if (receiptCategoryID == "") {
                receiptService.getOneReceiptCategoryDataExByName(receiptCategoryName).then(function (data) {
                    if (data.treceiptcategory.length > 0) {
                        swal('Category name duplicated.', '', 'warning');
                        $('.fullScreenSpin').css('display', 'none');
                        return false;
                    } else {
                        objDetails = {
                            type: "TReceiptCategory",
                            fields: {
                                ID: parseInt(receiptCategoryID) || 0,
                                Active: true,
                                CategoryName: receiptCategoryName,
                                CategoryDesc: receiptCategoryDesc
                            }
                        };
                        doSaveReceiptCategory(objDetails);
                    }
                }).catch(function (err) {
                    objDetails = {
                        type: "TReceiptCategory",
                        fields: {
                            Active: true,
                            CategoryName: receiptCategoryName,
                            CategoryDesc: receiptCategoryDesc
                        }
                    };
                    // doSaveReceiptCategory(objDetails);
                });
            } else {
                objDetails = {
                    type: "TReceiptCategory",
                    fields: {
                        ID: parseInt(receiptCategoryID),
                        Active: true,
                        CategoryName: receiptCategoryName,
                        CategoryDesc: receiptCategoryDesc
                    }
                };
                doSaveReceiptCategory(objDetails);
            }
        }, delayTimeAfterSound);

        function doSaveReceiptCategory(objDetails) {
            receiptService.saveReceiptCategory(objDetails).then(function (objDetails) {
                sideBarService.getReceiptCategory().then(function (dataReload) {
                    addVS1Data('TReceiptCategory', JSON.stringify(dataReload)).then(function (datareturn) {
                        location.reload(true);
                    }).catch(function (err) {
                        location.reload(true);
                    });
                }).catch(function (err) {
                    location.reload(true);
                });
            }).catch(function (err) {
                swal({
                    title: 'Oooops...',
                    text: err,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {
                        // Meteor._reload.reload();
                    } else if (result.dismiss === 'cancel') {

                    }
                });
                $('.fullScreenSpin').css('display', 'none');
            });
        }
    },
    'click #tblTripGroup tbody tr': function (e) {
        let tripName = $(e.target).closest('tr').find(".colTripName").text() || '';
        let description = $(e.target).closest('tr').find(".colDescription").text() || '';
        let tripGroupID = $(e.target).closest('tr').find(".colID").text() || '';
        let from = $('#employeeListModal').attr('data-from');

        if (from == 'ViewReceipt') {
            $('#viewReceiptModal .trip-groups').val(tripName);
            $('#viewReceiptModal .trip-groups').attr('data-name', description);
            $('#viewReceiptModal .trip-groups').attr('data-id', tripGroupID);
        } else if (from == 'NavExpense') {
            $('#nav-expense .trip-groups').val(tripName);
            $('#nav-expense .trip-groups').attr('data-name', description);
            $('#nav-expense .trip-groups').attr('data-id', tripGroupID);
        } else if (from == 'NavTime') {
            $('#nav-time .trip-groups').val(tripName);
            $('#nav-time .trip-groups').attr('data-name', description);
            $('#nav-time .trip-groups').attr('data-id', tripGroupID);
        }
        $('#tripGroupListModal').modal('toggle');
    },
    'click .btnAddNewTripGroup': function (event) {
        $('#add-tripgroup-title').text('Add New Trip-Group');
        $('#edtTripGroupID').val('');
        $('#edtTripGroupName').val('');
        $('#edtTripGroupDesc').val('');
    },
    'click .btnRefreshTripGroup': function (event) {
        $('.fullScreenSpin').css('display', 'inline-block');
        const splashArrayAccountList = [];
        let utilityService = new UtilityService();
        let sideBarService = new SideBarService();
        let dataSearchName = $('#tblTripGroup_filter input').val();
        if (dataSearchName.replace(/\s/g, '') !== '') {
            sideBarService.getTripGroupByName(dataSearchName).then(function (data) {
                if (data.ttripgroup.length > 0) {
                    for (let i = 0; i < data.ttripgroup.length; i++) {
                        const dataList = [
                            data.ttripgroup[i].fields.TripName || '-',
                            data.ttripgroup[i].fields.Description || '',
                            data.ttripgroup[i].fields.Id || ''
                        ];
                        splashArrayAccountList.push(dataList);
                    }
                    const datatable = $('#tblTripGroup').DataTable();
                    datatable.clear();
                    datatable.rows.add(splashArrayAccountList);
                    datatable.draw(false);
                    $('.fullScreenSpin').css('display', 'none');
                } else {
                    $('.fullScreenSpin').css('display', 'none');
                    $('#tripGroupListModal').modal('toggle');
                    swal({
                        title: 'Question',
                        text: "Trip-Group does not exist, would you like to create it?",
                        type: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Yes',
                        cancelButtonText: 'No'
                    }).then((result) => {
                        if (result.value) {
                            $('#addTripGroupModal').modal('toggle');
                            $('#edtTripGroupName').val(dataSearchName);
                        } else if (result.dismiss === 'cancel') {
                            $('#tripGroupListModal').modal('toggle');
                        }
                    });
                }
            }).catch(function (err) {
                $('.fullScreenSpin').css('display', 'none');
            });
        } else {
            sideBarService.getTripGroup().then(function (data) {
                for (let i = 0; i < data.ttripgroup.length; i++) {
                    const dataList = [
                        data.ttripgroup[i].fields.TripName || '-',
                        data.ttripgroup[i].fields.Description || '',
                        data.ttripgroup[i].fields.Id || ''
                    ];
                    splashArrayAccountList.push(dataList);
                }
                const datatable = $('#tblTripGroup').DataTable();
                datatable.clear();
                datatable.rows.add(splashArrayAccountList);
                datatable.draw(false);
                $('.fullScreenSpin').css('display', 'none');
            }).catch(function (err) {
                $('.fullScreenSpin').css('display', 'none');
            });
        }
    },
    'keyup #tblTripGroup_filter input': function (event) {
        if (event.keyCode === 13) {
            $(".btnRefreshTripGroup").trigger("click");
        }
    },
    'click #addTripGroupModal .btnSave': function (event) {
        playSaveAudio();
        let receiptService = new ReceiptService();
        setTimeout(function () {
            $('.fullScreenSpin').css('display', 'inline-block');

            let tripGroupID = $('#edtTripGroupID').val();
            let tripGroupName = $('#edtTripGroupName').val();
            if (tripGroupName == '') {
                swal('Trip-Group name cannot be blank!', '', 'warning');
                $('.fullScreenSpin').css('display', 'none');
                return false;
            }
            let tripGroupDesc = $('#edtTripGroupDesc').val();
            let objDetails = '';
            if (tripGroupID == "") {
                receiptService.getOneTripGroupDataExByName(tripGroupName).then(function (data) {
                    if (data.ttripgroup.length > 0) {
                        swal('Trip-Group name duplicated', '', 'warning');
                        $('.fullScreenSpin').css('display', 'none');
                        return false;
                    } else {
                        objDetails = {
                            type: "TTripGroup",
                            fields: {
                                Active: true,
                                TripName: tripGroupName,
                                Description: tripGroupDesc
                            }
                        };
                        doSaveTripGroup(objDetails);
                    }
                }).catch(function (err) {
                    objDetails = {
                        type: "TTripGroup",
                        fields: {
                            Active: true,
                            TripName: tripGroupName,
                            Description: tripGroupDesc
                        }
                    };
                    // doSaveTripGroup(objDetails);
                    $('.fullScreenSpin').css('display', 'none');
                });
            } else {
                objDetails = {
                    type: "TTripGroup",
                    fields: {
                        ID: parseInt(tripGroupID),
                        Active: true,
                        TripName: tripGroupName,
                        Description: tripGroupDesc
                    }
                };
                doSaveTripGroup(objDetails);
            }
        }, delayTimeAfterSound);

        function doSaveTripGroup(objDetails) {
            receiptService.saveTripGroup(objDetails).then(function (objDetails) {
                sideBarService.getTripGroup().then(function (dataReload) {
                    addVS1Data('TTripGroup', JSON.stringify(dataReload)).then(function (datareturn) {
                        $('.fullScreenSpin').css('display', 'none');
                        location.reload(true);
                    }).catch(function (err) {
                        $('.fullScreenSpin').css('display', 'none');
                        location.reload(true);
                    });
                }).catch(function (err) {
                    $('.fullScreenSpin').css('display', 'none');
                    location.reload(true);
                });
            }).catch(function (err) {
                swal({
                    title: 'Oooops...',
                    text: err,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {
                        // Meteor._reload.reload();
                    } else if (result.dismiss === 'cancel') {

                    }
                });
                $('.fullScreenSpin').css('display', 'none');
            });
        }
    },
    'click #paymentmethodList tbody tr': function (e) {
        let typeName = $(e.target).closest('tr').find(".colName").text() || '';
        let typeID = $(e.target).closest('tr').find("input.chkBox").attr('id') || '';
        let from = $('#employeeListModal').attr('data-from');
        if (from == 'ViewReceipt') {
            $('#viewReceiptModal .transactionTypes').val(typeName);
            $('#viewReceiptModal .transactionTypes').attr('data-id', typeID);
        } else if (from == 'NavExpense') {
            $('#nav-expense .transactionTypes').val(typeName);
            $('#nav-expense .transactionTypes').attr('data-id', typeID);
        } else if (from == 'NavTime') {
            $('#nav-time .transactionTypes').val(typeName);
            $('#nav-time .transactionTypes').attr('data-id', typeID);
        }
        $('#paymentMethodModal').modal('toggle');
    },
    'change .multipleAmount': function (e) {
        let val = e.target.value;
        val = val.replace('$', '');
        e.target.value = '$' + val;
    },
    'change .edtTotal': function (e) {
        let val = e.target.value;
        val = val.replace('$', '');
        e.target.value = '$' + val;
    },
    'change #claimHours': function (e) {
        const val = e.target.value;
        let numVal = parseFloat(val) || 0;
        e.target.value = numVal;

        let rate = parseFloat($('#claimRate').val().replace('$', '')) || 0;
        $('#nav-time .edtTotal').val('$' + (numVal * rate));
    },
    'change #claimRate': function (e) {
        const val = e.target.value;
        let numVal = parseFloat(val.replace('$', '')) || 0;
        e.target.value = '$' + numVal;
        let hours = parseFloat($('#claimHours').val()) || 0;
        $('#nav-time .edtTotal').val('$' + (numVal * hours));
    },
    'click #viewReceiptModal .btnSave': function (e) {
        playSaveAudio();
        setTimeout(function () {
            let imageData = $('#viewReceiptModal .receiptPhoto').css('background-image');
            let imageName = $('#viewReceiptModal .receiptPhoto').attr('data-name');
            let attachment;
            if (imageData != 'none') {
                imageData = imageData.split(/"/)[1];
                let imageBase64 = imageData.split(',')[1];
                let imageDescryption = imageData.split(',')[0];
                attachment = [{
                    type: "TAttachment",
                    fields: {
                        Attachment: imageBase64,
                        AttachmentName: imageName,
                        Description: imageDescryption,
                        TableName: "tblexpenseclaimline"
                    }
                }];
            }

            let metaID = $('#viewReceiptModal #receiptMetaID').val() || 0;
            let lineID = $('#viewReceiptModal #receiptLineID').val() || 0;
            let employeeId = $('#viewReceiptModal .employees').attr('data-id');
            let employeeName = $('#viewReceiptModal .employees').val() || ' ';
            let transactionTypeId = $('#viewReceiptModal .transactionTypes').attr('data-id');
            let transactionTypeName = $('#viewReceiptModal .transactionTypes').val() || ' ';
            let supplierId = $('#viewReceiptModal .merchants').attr('data-id');
            let supplierName = $('#viewReceiptModal .merchants').val() || ' ';
            let currencyId = $('#viewReceiptModal .currencies').attr('data-id');
            let currencyName = $('#viewReceiptModal .currencies').val() || ' ';
            let chartAccountId = $('#viewReceiptModal .chart-accounts').attr('data-id');
            let chartAccountName = $('#viewReceiptModal .chart-accounts').attr('data-name') || ' ';
            let tripGroupName = $('#viewReceiptModal .trip-groups').val() || ' ';
            let claimDate = $('#viewReceiptModal .dtReceiptDate').val() || ' ';
            let totalAmount = $('#viewReceiptModal .edtTotal').val().replace('$', '');
            let reimbursement = $('#viewReceiptModal .swtReiumbursable').prop('checked');
            let description = $('#viewReceiptModal #txaDescription').val() || 'Receipt Claim';

            let expenseClaimLine = {
                type: "TExpenseClaimLineEx",
                fields: {
                    ID: lineID,
                    EmployeeID: employeeId ? parseInt(employeeId) : 0,
                    EmployeeName: employeeName,
                    SupplierID: supplierId ? parseInt(supplierId) : 0,
                    SupplierName: supplierName,
                    AccountId: chartAccountId ? parseInt(chartAccountId) : 0,
                    AccountName: chartAccountName,
                    AmountInc: totalAmount ? parseFloat(totalAmount) : 0,
                    Reimbursement: reimbursement,
                    DateTime: moment(claimDate, 'DD/MM/YYYY').format('YYYY-MM-DD'),
                    Description: description,
                    Paymethod: transactionTypeName,
                    Attachments: attachment,
                    // GroupReport: groupReport,
                    // TransactionTypeID: transactionTypeId ? parseInt(transactionTypeId) : 0,
                    // TransactionTypeName: transactionTypeName,
                    // CurrencyID: currencyId ? parseInt(currencyId) : 0,
                    // CurrencyName: currencyName,
                }
            };

            let expenseClaim = {
                type: "TExpenseClaimEx",
                fields: {
                    ID: metaID,
                    EmployeeID: employeeId ? parseInt(employeeId) : 0,
                    EmployeeName: employeeName,
                    DateTime: moment(claimDate, 'DD/MM/YYYY').format('YYYY-MM-DD'),
                    Description: description,
                    Lines: [expenseClaimLine],
                    RequestToEmployeeID: employeeId ? parseInt(employeeId) : 0,
                    RequestToEmployeeName: employeeName,
                    TripGroup: tripGroupName
                }
            };
            $('.fullScreenSpin').css('display', 'inline-block');
            accountService.saveReceipt(expenseClaim).then(function (data) {
                // $('.fullScreenSpin').css('display', 'none');
                // setTimeout(() => {
                window.open('/receiptsoverview?success=true', '_self');
                // }, 200);
            }).catch(function (err) {
                swal({
                    title: 'Oooops...',
                    text: err,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) { if (err == checkResponseError) { window.open('/', '_self'); } } else if (result.dismiss == 'cancel') {

                    }
                });
                $('.fullScreenSpin').css('display', 'none');
            });
        }, delayTimeAfterSound);
    },
    'click #viewReceiptModal .btn-download': function (e) {
        let imageData = $('#viewReceiptModal .receiptPhoto').css('background-image');
        let imageName = $('#viewReceiptModal .receiptPhoto').attr('data-name');
        if (imageData != 'none') {
            imageData = imageData.split(/"/)[1];
            const a = document.createElement("a"); //Create <a>
            a.href = imageData; //Image Base64 Goes here
            a.download = imageName; //File name Here
            a.click();
        } else {
            swal("There is no attachment to download", '', 'warning');
        }
    },
    'click .btn-detach': function (e) {
        let from = $('#employeeListModal').attr('data-from');
        let parentElement;
        if (from == "ViewReceipt") {
            parentElement = "#viewReceiptModal";
        } else if (from == "NavExpense") {
            parentElement = "#nav-expense";
        } else if (from == "NavTime") {
            parentElement = "#nav-time";
        }

        $(parentElement + ' .receiptPhoto').css('background-image', 'none');
        $(parentElement + ' .receiptPhoto').attr('data-name', '');
        $(parentElement + ' .img-placeholder').css('opacity', 1);
    },
    'click #newReceiptModal .btnSave': function (e) {
        playSaveAudio();
        setTimeout(function () {
            if ($('#newReceiptModal .tab-pane#nav-multiple').hasClass('active')) {
                const receipts = [];
                let loggedUserName = Session.get('mySessionEmployee');
                let loggedUserId = Session.get('mySessionEmployeeLoggedID');
                for (let i = 0; i < 10; i++) {
                    const amount = $('#multipleAmount-' + i).val().replace('$', '');
                    let numAmount = parseFloat(amount) || 0;
                    if (numAmount > 0) {
                        let accountName = $('#multipleAccount-' + i).val();
                        let accountId = $('#multipleAccount-' + i).attr('data-id');
                        let merchantName = $('#multipleSupplier-' + i).val();
                        let merchantId = $('#multipleSupplier-' + i).attr('data-id');
                        let description = $('#multipleDescription-' + i).val();
                        let date = $('#multipleDate-' + i).val();
                        if (!accountName || !merchantName) {
                            swal("Select merchant and account for saving receipt", '', 'warning');
                            return;
                        }
                        let expenseClaimLine = {
                            type: "TExpenseClaimLineEx",
                            fields: {
                                EmployeeID: loggedUserId,
                                EmployeeName: loggedUserName,
                                SupplierID: merchantId ? parseInt(merchantId) : 0,
                                SupplierName: merchantName,
                                AccountId: accountId ? parseInt(accountId) : 0,
                                AccountName: accountName,
                                AmountInc: numAmount,
                                Reimbursement: false,
                                DateTime: moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD'),
                                Description: description || "Receipt Claim",
                                Paymethod: ''
                            }
                        };
                        let expenseClaim = {
                            type: "TExpenseClaimEx",
                            fields: {
                                EmployeeID: loggedUserId,
                                EmployeeName: loggedUserName,
                                DateTime: moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD'),
                                Description: description || "Receipt Claim",
                                Lines: [expenseClaimLine],
                                RequestToEmployeeID: loggedUserId,
                                RequestToEmployeeName: loggedUserName,
                            }
                        };
                        receipts.push(expenseClaim);
                    }
                }
                $('.fullScreenSpin').css('display', 'inline-block');
                for (let i = 0; i < receipts.length; i++) {
                    accountService.saveReceipt(receipts[i]).then(function (data) {
                        // $('.fullScreenSpin').css('display', 'none');
                        setTimeout(() => {
                            window.open('/receiptsoverview?success=true', '_self');
                        }, 200);
                    }).catch(function (err) {
                        swal({
                            title: 'Oooops...',
                            text: err,
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) { if (err == checkResponseError) { window.open('/', '_self'); } } else if (result.dismiss == 'cancel') {

                            }
                        });
                        $('.fullScreenSpin').css('display', 'none');
                    });
                }
            } else {
                let from = $('#employeeListModal').attr('data-from');
                let parentElement = from == 'NavExpense' ? '#nav-expense' : '#nav-time';
                let imageData = $(parentElement + ' .receiptPhoto').css('background-image');
                let imageName = $(parentElement + ' .receiptPhoto').attr('data-name');
                let attachment = null;
                if (imageData != 'none') {
                    imageData = imageData.split(/"/)[1];
                    let imageBase64 = imageData.split(',')[1];
                    let imageDescryption = imageData.split(',')[0];
                    attachment = [{
                        type: "TAttachment",
                        fields: {
                            Attachment: imageBase64,
                            AttachmentName: imageName,
                            Description: imageDescryption,
                            TableName: "tblexpenseclaimline"
                        }
                    }]
                }
                let employeeId = $(parentElement + ' .employees').attr('data-id');
                let employeeName = $(parentElement + ' .employees').val() || ' ';
                let transactionTypeId = $(parentElement + ' .transactionTypes').attr('data-id');
                let transactionTypeName = $(parentElement + ' .transactionTypes').val() || ' ';
                let supplierId = $(parentElement + ' .merchants').attr('data-id');
                let supplierName = $(parentElement + ' .merchants').val() || ' ';
                let currencyId = $(parentElement + ' .currencies').attr('data-id');
                let currencyName = $(parentElement + ' .currencies').val() || ' ';
                let currencyBuyRate = $(parentElement + ' .exchange-rate-js').val() || ' ';
                let chartAccountId = $(parentElement + ' .chart-accounts').attr('data-id');
                let chartAccountName = $(parentElement + ' .chart-accounts').attr('data-name') || ' ';
                let tripGroupName = $(parentElement + ' .trip-groups').val() || ' ';
                let claimDate = $(parentElement + ' .dtReceiptDate').val() || ' ';
                let reimbursement = $(parentElement + ' .swtReiumbursable').prop('checked');
                let description = $(parentElement + ' #txaDescription').val() || 'Receipt Claim';
                let totalAmount = 0;
                totalAmount = $(parentElement + ' .edtTotal').val().replace('$', '');
                let expenseClaimLineItems = [];
                let expenseClaimLine = {
                    type: "TExpenseClaimLineEx",
                    fields: {
                        EmployeeID: employeeId ? parseInt(employeeId) : 0,
                        EmployeeName: employeeName,
                        SupplierID: supplierId ? parseInt(supplierId) : 0,
                        SupplierName: supplierName,
                        AccountId: chartAccountId ? parseInt(chartAccountId) : 0,
                        AccountName: chartAccountName,
                        AmountInc: totalAmount ? parseFloat(totalAmount) : 0,
                        Reimbursement: reimbursement,
                        DateTime: moment(claimDate, 'DD/MM/YYYY').format('YYYY-MM-DD'),
                        Description: description,
                        PayTo: "",
                        Paymethod: transactionTypeName,
                        Attachments: attachment,
                        // GroupReport: groupReport,
                        // TransactionTypeID: transactionTypeId ? parseInt(transactionTypeId) : 0,
                        // TransactionTypeName: transactionTypeName,
                    }
                };
                expenseClaimLineItems.push(expenseClaimLine);
                let expenseClaim = {
                    type: "TExpenseClaimEx",
                    fields: {
                        EmployeeID: employeeId ? parseInt(employeeId) : 0,
                        EmployeeName: employeeName,
                        DateTime: moment(claimDate, 'DD/MM/YYYY').format('YYYY-MM-DD'),
                        Description: description,
                        Lines: expenseClaimLineItems,
                        RequestToEmployeeID: employeeId ? parseInt(employeeId) : 0,
                        RequestToEmployeeName: employeeName,
                        // CurrencyID: currencyId ? parseInt(currencyId) : 0,
                        // CurrencyName: currencyName,
                        // CurrencyRate: currencyBuyRate,
                        // ForeignExchangeRate: parseFloat(parseFloat(currencyBuyRate).toFixed(2)),

                        // ForeignExchangeRate: 1, // why should be 1
                        // ForeignExchangeCode: currencyName,
                        // ForeignTotalAmount: CurrencyConverter.convertAmount(totalAmount, currencyBuyRate),

                        TripGroup: tripGroupName
                    }
                };
                $('.fullScreenSpin').css('display', 'inline-block');
                accountService.saveReceipt(expenseClaim).then(function (data) {
                    // $('.fullScreenSpin').css('display', 'none');
                    // setTimeout(() => {
                    window.open('/receiptsoverview?success=true', '_self');
                    // }, 200);
                }).catch(function (err) {
                    swal({
                        title: 'Oooops...',
                        text: err,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) { if (err == checkResponseError) { window.open('/', '_self'); } } else if (result.dismiss == 'cancel') {

                        }
                    });
                    $('.fullScreenSpin').css('display', 'none');
                });
            }
        }, delayTimeAfterSound);
    },
    'click #btnShowSplitModal': function (e) {
        let template = Template.instance();
        $('#splitExpenseModal').modal('toggle');
        let receipt = Object.assign({}, template.editExpenseClaim.get());
        template.refreshSplitTable([receipt]);
    },
    'click #btnDeleteReceipt': function (e) {
        let template = Template.instance();
        let receipt = template.editExpenseClaim.get();
        swal({
            title: 'Delete Receipt Claim',
            text: 'Are you sure to delete this receipt claim?',
            type: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes'
        }).then((result) => {
            if (result.value) {
                let employeeId = $('#viewReceiptModal .employees').attr('data-id');
                let employeeName = $('#viewReceiptModal .employees').val() || ' ';
                let transactionTypeId = $('#viewReceiptModal .transactionTypes').attr('data-id');
                let transactionTypeName = $('#viewReceiptModal .transactionTypes').val() || ' ';
                let supplierId = $('#viewReceiptModal .merchants').attr('data-id');
                let supplierName = $('#viewReceiptModal .merchants').val() || ' ';
                let currencyId = $('#viewReceiptModal .currencies').attr('data-id');
                let currencyName = $('#viewReceiptModal .currencies').val() || ' ';
                let chartAccountId = $('#viewReceiptModal .chart-accounts').attr('data-id');
                let chartAccountName = $('#viewReceiptModal .chart-accounts').attr('data-name') || ' ';
                let tripGroupName = $('#viewReceiptModal .trip-groups').val() || ' ';
                let claimDate = $('#viewReceiptModal .dtReceiptDate').val() || ' ';
                let totalAmount = $('#viewReceiptModal .edtTotal').val().replace('$', '');
                let reimbursement = $('#viewReceiptModal .swtReiumbursable').prop('checked');
                let description = $('#viewReceiptModal #txaDescription').val() || 'Receipt Claim';

                let expenseClaimLine = {
                    type: "TExpenseClaimLineEx",
                    fields: {
                        ID: receipt.ID,
                        EmployeeID: employeeId ? parseInt(employeeId) : 0,
                        EmployeeName: employeeName,
                        SupplierID: supplierId ? parseInt(supplierId) : 0,
                        SupplierName: supplierName,
                        AccountId: chartAccountId ? parseInt(chartAccountId) : 0,
                        AccountName: chartAccountName,
                        AmountInc: totalAmount ? parseFloat(totalAmount) : 0,
                        Reimbursement: reimbursement,
                        DateTime: moment(claimDate, 'DD/MM/YYYY').format('YYYY-MM-DD'),
                        Description: description,
                        Paymethod: transactionTypeName,
                        Active: false,
                        // GroupReport: groupReport,
                        // TransactionTypeID: transactionTypeId ? parseInt(transactionTypeId) : 0,
                        // TransactionTypeName: transactionTypeName,
                        // CurrencyID: currencyId ? parseInt(currencyId) : 0,
                        // CurrencyName: currencyName,
                    }
                };

                let expenseClaim = {
                    type: "TExpenseClaimEx",
                    fields: {
                        ID: receipt.ExpenseClaimID,
                        EmployeeID: employeeId ? parseInt(employeeId) : 0,
                        EmployeeName: employeeName,
                        DateTime: moment(claimDate, 'DD/MM/YYYY').format('YYYY-MM-DD'),
                        Description: description,
                        Lines: [expenseClaimLine],
                        RequestToEmployeeID: employeeId ? parseInt(employeeId) : 0,
                        RequestToEmployeeName: employeeName,
                        Active: false
                    }
                };
                $('.fullScreenSpin').css('display', 'inline-block');
                accountService.saveReceipt(expenseClaim).then(function (data) {
                    // $('.fullScreenSpin').css('display', 'none');
                    window.open('/receiptsoverview?success=true', '_self');
                }).catch(function (err) {
                    swal({
                        title: 'Oooops...',
                        text: err,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) { if (err == checkResponseError) { window.open('/', '_self'); } } else if (result.dismiss == 'cancel') {

                        }
                    });
                    $('.fullScreenSpin').css('display', 'none');
                });
            } else if (result.dismiss === 'cancel') {

            }
        });
    },
    'click a#dropdownMenuLink': function (e) {
        let template = Template.instance();
        let receipt = template.editExpenseClaim.get();
        $('#dtSplitStart').datepicker('setDate', receipt.DateTime);
        $('#dtSplitEnd').datepicker('setDate', moment(receipt.DateTime, "DD/MM/YYYY").add(1, 'days').format("DD/MM/YYYY"));
    },
    'click #btnSplitByDays': function (e) {
        playSaveAudio();
        let template = Template.instance();
        setTimeout(function () {
            let endDate = $('#dtSplitEnd').val();
            let startDate = $('#dtSplitStart').val();
            if (!endDate || !startDate) {
                swal("Select valid date for split", '', 'warning');
                return;
            }
            let diffDays = moment(endDate, "DD/MM/YYYY").diff(moment(startDate, "DD/MM/YYYY"), 'days');
            if (diffDays < 0) {
                swal("Select end date later than start date", '', 'warning');
                return;
            }
            if (diffDays == 0) {
                diffDays = 1;
            }
            diffDays += 1;

            let receipt = template.editExpenseClaim.get();
            const receiptList = [];
            let amount = Math.round(receipt.AmountInc * 100 / diffDays) / 100;
            for (let i = 0; i < diffDays; i++) {
                let lineItem = Object.assign({}, receipt);
                lineItem.DateTime = moment(lineItem.DateTime, "DD/MM/YYYY").add(i, 'days').format("DD/MM/YYYY");

                if (i == diffDays - 1) {
                    lineItem.AmountInc = Math.round((receipt.AmountInc - amount * i) * 100) / 100;
                } else {
                    lineItem.AmountInc = amount;
                }
                receiptList.push(lineItem);
            }
            template.refreshSplitTable(receiptList);
        }, delayTimeAfterSound);
    },
    'click #btnAddSplit': function (e) {
        let template = Template.instance();
        let splitDataTable = $('#tblSplitExpense').DataTable();
        const lineItems = splitDataTable.rows().data();

        let lineItem = Object.assign({}, lineItems[lineItems.length - 1]);
        lineItem.AmountInc = 0;
        lineItems.push(lineItem);

        template.refreshSplitTable(lineItems);
    },
    'click #btnSplitEven': function (e) {
        let template = Template.instance();
        let receipt = template.editExpenseClaim.get();
        let splitDataTable = $('#tblSplitExpense').DataTable();
        const lineItems = splitDataTable.rows().data();
        let amount = Math.round(receipt.AmountInc * 100 / (lineItems.length)) / 100;
        for (let i = 0; i < lineItems.length; i++) {
            if (i == lineItems.length - 1) {
                lineItems[i].AmountInc = Math.round((receipt.AmountInc - amount * i) * 100) / 100;
            } else {
                lineItems[i].AmountInc = amount;
            }
        }
        template.refreshSplitTable(lineItems);
    },
    'click #splitExpenseModal .btnSave': function (e) {
        playSaveAudio();
        let template = Template.instance();
        setTimeout(function () {
            let receipt = template.editExpenseClaim.get();
            receipt.Description = receipt.Description ? receipt.Description : "Receipt Claim";
            let splitDataTable = $('#tblSplitExpense').DataTable();
            const lineItems = splitDataTable.rows().data();
            let totalAmount = 0;
            for (let i = 0; i < lineItems.length; i++) {
                let amount = lineItems[i].AmountInc;
                totalAmount += amount;
            }
            totalAmount = Math.trunc(totalAmount * 100) / 100;
            if (totalAmount != receipt.AmountInc) {
                swal("Splited amount is not same as original receipt's", '', 'warning');
                return;
            }
            $('.fullScreenSpin').css('display', 'inline-block');
            for (let i = 0; i < lineItems.length; i++) {
                let lineItem = lineItems[i];
                lineItem.DateTime = moment(lineItem.DateTime, 'DD/MM/YYYY').format('YYYY-MM-DD');
                let expenseClaim;
                if (i > 0) {
                    let expenseClaimLine = {
                        type: "TExpenseClaimLineEx",
                        fields: {
                            EmployeeID: lineItem.EmployeeID,
                            EmployeeName: lineItem.EmployeeName,
                            SupplierID: lineItem.SupplierID,
                            SupplierName: lineItem.SupplierName,
                            AccountId: lineItem.AccountId,
                            AccountName: lineItem.AccountName,
                            AmountInc: lineItem.AmountInc,
                            Reimbursement: lineItem.Reimbursement,
                            DateTime: lineItem.DateTime,
                            Description: lineItem.Description ? lineItem.Description : "Receipt Claim",
                            Paymethod: lineItem.Paymethod
                            // GroupReport: groupReport,
                            // TransactionTypeID: transactionTypeId ? parseInt(transactionTypeId) : 0,
                            // TransactionTypeName: transactionTypeName,
                            // CurrencyID: currencyId ? parseInt(currencyId) : 0,
                            // CurrencyName: currencyName,
                        }
                    };
                    expenseClaim = {
                        type: "TExpenseClaimEx",
                        fields: {
                            EmployeeID: receipt.EmployeeID,
                            EmployeeName: receipt.EmployeeName,
                            DateTime: lineItem.DateTime,
                            Description: receipt.Description,
                            Lines: [expenseClaimLine],
                            RequestToEmployeeID: receipt.EmployeeID,
                            RequestToEmployeeName: receipt.EmployeeName,
                            TripGroup: receipt.TripGroup
                        }
                    }
                } else {
                    let expenseClaimLine = {
                        type: "TExpenseClaimLineEx",
                        fields: {
                            ID: receipt.ID,
                            EmployeeID: lineItem.EmployeeID,
                            EmployeeName: lineItem.EmployeeName,
                            SupplierID: lineItem.SupplierID,
                            SupplierName: lineItem.SupplierName,
                            AccountId: lineItem.AccountId,
                            AccountName: lineItem.AccountName,
                            AmountInc: lineItem.AmountInc,
                            Reimbursement: lineItem.Reimbursement,
                            DateTime: lineItem.DateTime,
                            Description: lineItem.Description ? lineItem.Description : "Receipt Claim",
                            Paymethod: lineItem.Paymethod,
                            Attachments: lineItem.Attachments
                            // GroupReport: groupReport,
                            // TransactionTypeID: transactionTypeId ? parseInt(transactionTypeId) : 0,
                            // TransactionTypeName: transactionTypeName,
                            // CurrencyID: currencyId ? parseInt(currencyId) : 0,
                            // CurrencyName: currencyName,
                        }
                    };
                    expenseClaim = {
                        type: "TExpenseClaimEx",
                        fields: {
                            ID: receipt.ExpenseClaimID,
                            DateTime: lineItem.DateTime,
                            Lines: [expenseClaimLine],
                            TripGroup: receipt.TripGroup
                        }
                    }
                }

                accountService.saveReceipt(expenseClaim).then(function (data) {
                    // $('.fullScreenSpin').css('display', 'none');
                    setTimeout(() => {
                        window.open('/receiptsoverview?success=true', '_self');
                    }, 200);
                }).catch(function (err) {
                    swal({
                        title: 'Oooops...',
                        text: err,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) { if (err == checkResponseError) { window.open('/', '_self'); } } else if (result.dismiss == 'cancel') {

                        }
                    });
                    $('.fullScreenSpin').css('display', 'none');
                });
            }
        }, delayTimeAfterSound);
    },
    'click button[id^="multipleAttachButton-"]' : function(e) {
        let index = e.target.parentElement.id.split('-')[1];
        $('#selectedIndexForMultiple').val(index);
        $('#nav-multiple .attachment-multiple-upload').trigger('click');
    },
    'change #nav-multiple .attachment-multiple-upload': function(event) {
        let files = $(event.target)[0].files;
        if (files == null || files.length == 0) {
            return;
        }
        let imageFile = files[0];
        let template = Template.instance();
        template.base64data(imageFile).then(imageData => {
            template.getOCRResultFromImageForMultiple(imageData, imageFile, $('#selectedIndexForMultiple').val());
            $('#nav-multiple .attachment-multiple-upload').val('');
        })
    },

    'change input[id^="splitAmount-"]': function(e) {
        let index = e.target.id.split('-')[1];
        let newValue = e.target.value.replace('$', '');
        let splitDataTable = $('#tblSplitExpense').DataTable();
        let rowData = splitDataTable.row(index).data();
        rowData.AmountInc = newValue ? parseFloat(newValue) : 0;
        setCurrencyFormatForInput(e.target);
    },
    'click input[id^="splitAccount-"]': function (e) {
        $('#employeeListModal').attr('data-from', e.target.id);
        let template = Template.instance();
        template.setAccountSelect(e);
    },
    'click input[id^="multipleAccount-"]': function (e) {
        $('#employeeListModal').attr('data-from', e.target.id);
        let template = Template.instance();
        template.setAccountSelect(e);
    },
    'click input[id^="multipleSupplier-"]': function (e) {
        $('#employeeListModal').attr('data-from', e.target.id);
        let template = Template.instance();
        template.setSupplierSelect(e);
    },
    'click button[id^="splitRemove-"]': function (e) {
        let index = e.target.id.split('-')[1];
        let template = Template.instance();
        let receipt = template.editExpenseClaim.get();
        let splitDataTable = $('#tblSplitExpense').DataTable();
        const lineItems = splitDataTable.rows().data();
        const newLineItems = [];
        for (let i = 0; i < lineItems.length; i++) {
            if (i == index) {
                continue;
            }
            newLineItems.push(lineItems[i]);
        }
        let amount = Math.round(receipt.AmountInc * 100 / (newLineItems.length)) / 100;
        for (let i = 0; i < newLineItems.length; i++) {
            if (i == newLineItems.length - 1) {
                newLineItems[i].AmountInc = Math.round((receipt.AmountInc - amount * i) * 100) / 100;
            } else {
                newLineItems[i].AmountInc = amount;
            }
        }
        template.refreshSplitTable(newLineItems);
    },
    'click #btnDuplicate': function (e) {
        let template = Template.instance();
        let lineItem = Object.assign({}, template.editExpenseClaim.get());
        lineItem.Description = lineItem.Description ? lineItem.Description : "Receipt Claim";
        lineItem.DateTime = moment(lineItem.DateTime, 'DD/MM/YYYY').format('YYYY-MM-DD');
        let expenseClaimLine = {
            type: "TExpenseClaimLineEx",
            fields: {
                EmployeeID: lineItem.EmployeeID,
                EmployeeName: lineItem.EmployeeName,
                SupplierID: lineItem.SupplierID,
                SupplierName: lineItem.SupplierName,
                AccountId: lineItem.AccountId,
                AccountName: lineItem.AccountName,
                AmountInc: lineItem.AmountInc,
                Reimbursement: lineItem.Reimbursement,
                DateTime: lineItem.DateTime,
                Description: lineItem.Description ? lineItem.Description : "Receipt Claim",
                Paymethod: lineItem.Paymethod,
                Attachments: lineItem.Attachments,
                // GroupReport: groupReport,
                // TransactionTypeID: transactionTypeId ? parseInt(transactionTypeId) : 0,
                // TransactionTypeName: transactionTypeName,
                // CurrencyID: currencyId ? parseInt(currencyId) : 0,
                // CurrencyName: currencyName,
                Comments: lineItem.Comments
            }
        };
        let expenseClaim = {
            type: "TExpenseClaimEx",
            fields: {
                EmployeeID: lineItem.EmployeeID,
                EmployeeName: lineItem.EmployeeName,
                DateTime: lineItem.DateTime,
                Description: lineItem.Description,
                Lines: [expenseClaimLine],
                RequestToEmployeeID: lineItem.EmployeeID,
                RequestToEmployeeName: lineItem.EmployeeName,
            }
        };

        $('.fullScreenSpin').css('display', 'inline-block');
        accountService.saveReceipt(expenseClaim).then(function (data) {
            // $('.fullScreenSpin').css('display', 'none');
            // setTimeout(() => {
            window.open('/receiptsoverview?success=true', '_self');
            // }, 200);
        }).catch(function (err) {
            swal({
                title: 'Oooops...',
                text: err,
                type: 'error',
                showCancelButton: false,
                confirmButtonText: 'Try Again'
            }).then((result) => {
                if (result.value) { if (err == checkResponseError) { window.open('/', '_self'); } } else if (result.dismiss == 'cancel') {

                }
            });
            $('.fullScreenSpin').css('display', 'none');
        });
    },
    'click .btnRefresh': function () {
        $('.fullScreenSpin').css('display', 'inline-block');
        // sideBarService.getAllExpenseCliamExDataVS1().then(function(expenseData) {
        sideBarService.getAllExpenseClaimExData().then(function (expenseData) {
            addVS1Data('TExpenseClaim', JSON.stringify(expenseData)).then(function (datareturn) {
                sideBarService.getAllSuppliersDataVS1(initialBaseDataLoad, 0).then(function (dataReload) {
                    addVS1Data('TSupplierVS1', JSON.stringify(dataReload)).then(function (datareturn) {
                        window.open('/receiptsoverview', '_self');
                    }).catch(function (err) {
                        window.open('/receiptsoverview', '_self');
                    });
                }).catch(function (err) {
                    window.open('/receiptsoverview', '_self');
                });
            }).catch(function (err) {
                setTimeout(() => {
                    window.open('/receiptsoverview', '_self');
                }, 200);
            });
        }).catch(function (err) {
            setTimeout(() => {
                window.open('/receiptsoverview', '_self');
            }, 200);
        });
    },
    'click #btnShowMergeModal': function (e) {
        $('#mergeModal').modal('toggle');
        $('#employeeListModal').attr('data-from', 'MergeModal');
        $('#formCheckMerge-All').attr('checked', false);
        $('input[id^="formCheckMerge-"]').attr('checked', false);
        let template = Template.instance();
        let editingExpense = template.editExpenseClaim.get();
        template.mergeReceiptRecords.set([editingExpense]);
        setTimeout(() => {
            $("#formCheckMerge-" + editingExpense.ID).prop('checked', true);
        }, 100);
    },
    'click #btnMergeDetail': function () {
        let template = Template.instance();
        let mergeList = template.mergeReceiptRecords.get();
        if (mergeList.length < 2) {
            swal('Select more than 2 records to merge', '', 'warning');
            return;
        }
        $('#mergeModal').modal('toggle');
        $('#mergeDetailModal').modal('toggle');

        if (mergeList[0].Attachments) {
            let imageData = mergeList[0].Attachments[0].fields.Description + "," + mergeList[0].Attachments[0].fields.Attachment;
            $('#mergeDetailModal .receiptPhotoMerge').css('background-image', "url('" + imageData + "')");
            $('#mergeDetailModal .receiptPhotoMerge').attr('data-name', mergeList[0].Attachments[0].fields.AttachmentName);
            $('#mergeDetailModal .img-placeholder').css('opacity', 0);
        } else {
            $('#mergeDetailModal .receiptPhotoMerge').css('background-image', "none");
            $('#mergeDetailModal .receiptPhotoMerge').attr('data-name', "");
            $('#mergeDetailModal .img-placeholder').css('opacity', 1);
        }
    },
    'change #sltExpenseKeep': function (e) {
        let selected = $(e.target).children("option:selected").val();
        let template = Template.instance();
        template.mergeReceiptSelectedIndex.set(parseInt(selected));
        let selectedExpense = template.mergeReceiptRecords.get()[selected];
        $('#mergedEmployee').val(selectedExpense.EmployeeName);
        $('#mergedSupplier').val(selectedExpense.SupplierName);
        $('#mergedAccount').val(selectedExpense.AccountName);
        $('#mergedDescription').val(selectedExpense.Description);
        if (selectedExpense.Attachments) {
            let imageData = selectedExpense.Attachments[0].fields.Description + "," + selectedExpense.Attachments[0].fields.Attachment;
            $('#mergeDetailModal .receiptPhotoMerge').css('background-image', "url('" + imageData + "')");
            $('#mergeDetailModal .receiptPhotoMerge').attr('data-name', selectedExpense.Attachments[0].fields.AttachmentName);
            $('#mergeDetailModal .img-placeholder').css('opacity', 0);
        } else {
            $('#mergeDetailModal .receiptPhotoMerge').css('background-image', "none");
            $('#mergeDetailModal .receiptPhotoMerge').attr('data-name', "");
            $('#mergeDetailModal .img-placeholder').css('opacity', 1);
        }
    },
    'change #mergedReceipt': function (e) {
        let selected = $(e.target).children("option:selected").val();
        let template = Template.instance();
        let selectedExpense = template.mergeReceiptRecords.get()[parseInt(selected)];
        if (selectedExpense.Attachments) {
            let imageData = selectedExpense.Attachments[0].fields.Description + "," + selectedExpense.Attachments[0].fields.Attachment;
            $('#mergeDetailModal .receiptPhotoMerge').css('background-image', "url('" + imageData + "')");
            $('#mergeDetailModal .receiptPhotoMerge').attr('data-name', selectedExpense.Attachments[0].fields.AttachmentName);
            $('#mergeDetailModal .img-placeholder').css('opacity', 0);
        } else {
            $('#mergeDetailModal .receiptPhotoMerge').css('background-image', "none");
            $('#mergeDetailModal .receiptPhotoMerge').attr('data-name', "");
            $('#mergeDetailModal .img-placeholder').css('opacity', 1);
        }
    },
    'click #mergeDetailModal .btnSave': function (e) {
        playSaveAudio();
        let template = Template.instance();
        setTimeout(function () {
            let receiptRecords = template.mergeReceiptRecords.get();
            let index = template.mergeReceiptSelectedIndex.get();
            for (let i = 0; i < receiptRecords.length; i++) {
                if (i == index) {
                    let mergedExpense = Object.assign({}, receiptRecords[index]);
                    let selectedReceiptIndex = $('#mergedReceipt').children("option:selected").val();
                    mergedExpense.Attachments = receiptRecords[selectedReceiptIndex].Attachments;
                    let selectedDateTime = $('#mergedDateTime option:selected').text();
                    mergedExpense.DateTime = selectedDateTime ? moment(selectedDateTime, 'DD/MM/YYYY').format('YYYY-MM-DD') : '';
                    let selectedAmount = $('#mergedAmount option:selected').text();
                    mergedExpense.AmountInc = parseFloat(selectedAmount.replace('$', '')) || 0;
                    let selectedPaymethod = $('#mergedTransactionType option:selected').text();
                    mergedExpense.Paymethod = selectedPaymethod;
                    let selectedReiumbursable = $('#swtMergedReiumbursable').prop('checked');
                    mergedExpense.Reimbursement = selectedReiumbursable;
                    let tripGroup = mergedExpense.TripGroup;
                    delete mergedExpense.MetaID;
                    delete mergedExpense.LineID;
                    delete mergedExpense.TripGroup;
                    let expenseClaimLine = {
                        type: "TExpenseClaimLineEx",
                        fields: mergedExpense
                    };
                    let expenseClaim = {
                        type: "TExpenseClaimEx",
                        fields: {
                            ID: mergedExpense.ExpenseClaimID,
                            EmployeeID: mergedExpense.EmployeeID,
                            EmployeeName: mergedExpense.EmployeeName,
                            DateTime: mergedExpense.DateTime,
                            Description: mergedExpense.Description,
                            Lines: [expenseClaimLine],
                            TripGroup: tripGroup,
                            RequestToEmployeeID: mergedExpense.EmployeeID,
                            RequestToEmployeeName: mergedExpense.EmployeeName,
                        }
                    };
                    $('.fullScreenSpin').css('display', 'inline-block');
                    accountService.saveReceipt(expenseClaim).then(function (data) {
                        // $('.fullScreenSpin').css('display', 'none');
                        setTimeout(() => {
                            window.open('/receiptsoverview?success=true', '_self');
                        }, 200);
                    }).catch(function (err) {
                        swal({
                            title: 'Oooops...',
                            text: err,
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) { if (err == checkResponseError) { window.open('/', '_self'); } } else if (result.dismiss == 'cancel') {

                            }
                        });
                        $('.fullScreenSpin').css('display', 'none');
                    });
                } else {
                    let receipt = receiptRecords[i];
                    let expenseClaimLine = {
                        type: "TExpenseClaimLineEx",
                        fields: {
                            ID: receipt.ID,
                            EmployeeID: receipt.EmployeeID,
                            EmployeeName: receipt.EmployeeName,
                            SupplierID: receipt.SupplierID,
                            SupplierName: receipt.SupplierName,
                            AccountId: receipt.AccountId,
                            AccountName: receipt.AccountName,
                            AmountInc: receipt.AmountInc,
                            Reimbursement: receipt.Reimbursement,
                            DateTime: moment(receipt.DateTime, 'DD/MM/YYYY').format('YYYY-MM-DD'),
                            Description: receipt.Description,
                            Paymethod: receipt.Paymethod,
                            Active: false
                            // GroupReport: groupReport,
                            // TransactionTypeID: transactionTypeId ? parseInt(transactionTypeId) : 0,
                            // TransactionTypeName: transactionTypeName,
                            // CurrencyID: currencyId ? parseInt(currencyId) : 0,
                            // CurrencyName: currencyName,
                        }
                    };

                    let expenseClaim = {
                        type: "TExpenseClaimEx",
                        fields: {
                            ID: receipt.ExpenseClaimID,
                            EmployeeID: receipt.EmployeeID,
                            EmployeeName: receipt.EmployeeName,
                            DateTime: moment(receipt.DateTime, 'DD/MM/YYYY').format('YYYY-MM-DD'),
                            Description: receipt.Description,
                            Lines: [expenseClaimLine],
                            RequestToEmployeeID: receipt.EmployeeID,
                            RequestToEmployeeName: receipt.EmployeeName,
                            Active: false,
                            TripGroup: receipt.TripGroup
                        }
                    };

                    $('.fullScreenSpin').css('display', 'inline-block');
                    accountService.saveReceipt(expenseClaim).then(function (data) {
                        // $('.fullScreenSpin').css('display', 'none');
                    }).catch(function (err) {
                        swal({
                            title: 'Oooops...',
                            text: err,
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) { if (err == checkResponseError) { window.open('/', '_self'); } } else if (result.dismiss == 'cancel') {

                            }
                        });
                        $('.fullScreenSpin').css('display', 'none');
                    });
                }
            }
        }, delayTimeAfterSound);
    },
    'change .currencies': (e) => {
        const value = $(e.currentTarget).attr('buy-rate');
        let from = $('#employeeListModal').attr('data-from');
        if (from == 'ViewReceipt') {
            $('#viewReceiptModal .exchange-rate-js').val(value);
            $('#viewReceiptModal .exchange-rate-js').trigger("change");
        } else if (from == 'NavExpense') {
            $('#nav-expense .exchange-rate-js').val(value);
            $('#nav-expense .exchange-rate-js').trigger("change");
        } else if (from == 'NavTime') {
            $('#nav-time .exchange-rate-js').val(value);
            $('#nav-time .exchange-rate-js').trigger("change");
        }
    },
    'click .btnCheque': function (e) {
        let purchaseService = new PurchaseBoardService();
        let template = Template.instance();
        let supplierList = template.suppliers.get();
        let hasSelected = false;
        $('#tblReceiptList tbody tr').each(function () {
            let checked = $(this).find("input:checked").val();
            if (checked == "on") {
                hasSelected = true;
            }
        });
        if (hasSelected) {
            $('#tblReceiptList tbody tr').each(function () {
                let checked = $(this).find("input:checked").val();
                if (checked == "on") {
                    let tr = $(this);
                    let supplierID = $(this).find(".colSupplierID").text();
                    let supplierName = $(this).find(".colReceiptSupplier").text();
                    let taxCode = $(this).find(".colTaxCode").text();
                    let employeeID = $(this).find(".colEmployeeID").text();
                    let employeeName = $(this).find(".colEmployeeName").text();
                    let reimbursement = $(this).find(".colReimbursement").text();
                    if (reimbursement == "true" && employeeName != "") {
                        supplierName = "";
                        contactService.getOneSupplierDataExByName(employeeName).then(function (data) {
                            if (data.tsupplier.length == 0) {
                                contactService.getOneEmployeeData(employeeID).then(function (data) {
                                    if (data.fields.ID) {
                                        let objDetails = {
                                            type: "TSupplier",
                                            fields: {
                                                ClientName: employeeName,
                                                FirstName: data.fields.FirstName || '',
                                                LastName: data.fields.LastName || '',
                                                Phone: data.fields.Phone || '',
                                                Mobile: data.fields.Mobile || '',
                                                Email: data.fields.Email || '',
                                                SkypeName: data.fields.SkypeName || '',
                                                Street: data.fields.Street || '',
                                                Street2: data.fields.Street2 || '',
                                                Suburb: data.fields.Suburb || '',
                                                State: data.fields.State || '',
                                                PostCode: data.fields.PostCode || '',
                                                Country: data.fields.Country || '',
                                                BillStreet: '',
                                                BillStreet2: '',
                                                BillState: '',
                                                BillPostCode: '',
                                                Billcountry: '',
                                                PublishOnVS1: true
                                            }
                                        };
                                        $('.fullScreenSpin').css('display', 'inline-block');
                                        contactService.saveSupplier(objDetails).then(function (supplier) {
                                            supplierID = supplier.fields.ID;
                                            supplierName = employeeName;
                                            saveCheque(supplierID, supplierName, tr);
                                        }).catch(function (err) {
                                            swal({
                                                title: 'Oooops...',
                                                text: err,
                                                type: 'error',
                                                showCancelButton: false,
                                                confirmButtonText: 'Try Again'
                                            }).then((result) => {
                                                if (result.value) {

                                                } else if (result.dismiss == 'cancel') {

                                                }
                                            });
                                            $('.fullScreenSpin').css('display', 'none');
                                        });
                                    }
                                }).catch(function (err) {

                                });

                            } else {
                                supplierID = data.tsupplier[0].fields.ID;
                                supplierName = data.tsupplier[0].fields.ClientName;
                                saveCheque(supplierID, supplierName, tr);
                            }
                        }).catch(function (err) {

                        });
                    } else {
                        saveCheque(supplierID, supplierName, tr);
                    }
                }
            });
        } else {
            let errText = "Please select receipt claim line.";
            swal({
                title: 'Oooops...',
                text: errText,
                type: 'error',
                showCancelButton: false,
                confirmButtonText: 'Try Again'
            }).then((result) => {
                if (result.value) {

                } else if (result.dismiss == 'cancel') {

                }
            });
        }

        function saveCheque(supplierID, supplierName, tr) {
            let taxCode = tr.find(".colTaxCode").text();
            taxCode = (taxCode != "") ? taxCode : "NT";
            if (supplierName != "" && taxCode != "") {
                let amount = tr.find(".colReceiptAmount").text();
                let accountName = tr.find(".colReceiptAccount").text();
                let description = tr.find(".colReceiptDesc").text();
                let date = moment(tr.find(".colReceiptDate").text(), 'DD/MM/YYYY').format('YYYY-MM-DD');
                let accountID = tr.find(".colAccountID").text();
                let taxAmount = tr.find(".colTaxAmount").text();
                let amountEx = tr.find(".colAmountEx").text();
                let amountInc = tr.find(".colAmountInc").text();
                let lineItemsForm = [];
                let lineItemObjForm = {};
                lineItemObjForm = {
                    type: "TChequeLine",
                    fields: {
                        // ID: parseInt(erpLineID) || 0,
                        AccountName: accountName || "",
                        ProductDescription: description || "",
                        LineCost: Number(amount.replace(/[^0-9.-]+/g, "")) || 0,
                        LineTaxCode: taxCode || "",
                        TotalLineAmount: Number(amountEx.replace(/[^0-9.-]+/g, "")) || 0,
                        TotalLineAmountInc: Number(amountInc.replace(/[^0-9.-]+/g, "")) || 0,
                    },
                };
                lineItemsForm.push(lineItemObjForm);
                let objDetails = {
                    type: "TChequeEx",
                    fields: {
                        // ID: 0,
                        SupplierID: supplierID || 0,
                        SupplierName: supplierName,
                        // ClientName: employeeName || "",
                        ClientName: supplierName || "",
                        // ForeignExchangeCode: currencyCode,
                        Lines: lineItemsForm,
                        // OrderTo: billingAddress,
                        // GLAccountName: bankAccount,
                        OrderDate: date,
                        // SupplierInvoiceNumber: poNumber,
                        // ConNote: reference,
                        // Shipping: shipviaData,
                        // ShipTo: shippingAddress,
                        // Comments: comments,
                        // RefNo: reference,
                        // SalesComments: pickingInfrmation,
                        // Attachments: uploadedItems,
                        // OrderStatus: $("#sltStatus").val(),
                        Chequetotal: Number(amount.replace(/[^0-9.-]+/g, "")) || 0,
                    },
                };
                $('.fullScreenSpin').css('display', 'inline-block');
                purchaseService.saveChequeEx(objDetails).then(function (result) {
                    if (result.fields.ID) {
                        swal({
                            title: 'Success',
                            text: 'Make new cheque successfully.',
                            type: 'success',
                            showCancelButton: false,
                            confirmButtonText: 'Done'
                        }).then((result) => {
                            if (result.value) {

                            } else if (result.dismiss == 'cancel') {

                            }
                        });
                    } else {

                    }
                    $('.fullScreenSpin').css('display', 'none');
                }).catch(function (err) {
                    swal({
                        title: 'Oooops...',
                        text: err,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {

                        } else if (result.dismiss == 'cancel') {

                        }
                    });
                    $('.fullScreenSpin').css('display', 'none');
                })
            } else {
                let errText = "";
                if (supplierName == "") {
                    errText = "Supplier is empty.";
                } else if (taxCode == "") {
                    errText = "Tax Code is empty.";
                }
                if (errText != "") {
                    swal({
                        title: 'Oooops...',
                        text: errText,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {

                        } else if (result.dismiss == 'cancel') {

                        }
                    });
                }
            }
        }
    },

    "keyup #exchange_rate": e => onExhangeRateChanged(e),
    "change #exchange_rate": e => onExhangeRateChanged(e),
    // "click #newReceiptModal .btnSave": (e, ui) => {
    //     const nav = $(".nav-link.active");
    //     if(nav.attr('href') == "#nav-expense") {
    //         saveCurrencyHistory(
    //             GlobalFunctions.convertYearMonthDay($('#nav-expense .dtReceiptDate').val())
    //         );
    //     } else if (nav.attr('href') == "#nav-time") {
    //         saveCurrencyHistory(
    //             GlobalFunctions.convertYearMonthDay($('#nav-time .dtReceiptDate').val())
    //         );
    //     }
    // }
});

Template.receiptsoverview.helpers({
    expenseClaimList: () => {
        return Template.instance().expenseClaimList.get();
    },
    editExpenseClaim: () => {
        return Template.instance().editExpenseClaim.get();
    },
    multiReceiptRecords: () => {
        return Template.instance().multiReceiptRecords.get();
    },
    mergeReceiptRecords: () => {
        return Template.instance().mergeReceiptRecords.get();
    },
    mergeReceiptSelectedIndex: () => {
        return Template.instance().mergeReceiptSelectedIndex.get();
    },
    sessionCurrency: () => {
        return Session.get('ERPCountryAbbr');
    },
    isCurrencyEnable: () => FxGlobalFunctions.isCurrencyEnabled()
});

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
