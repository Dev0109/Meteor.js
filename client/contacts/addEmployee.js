import { ContactService } from "./contact-service";
import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../js/core-service';
import { UtilityService } from "../utility-service";
import { CountryService } from '../js/country-service';
import { PaymentsService } from '../payments/payments-service';
import { ProductService } from '../product/product-service';
import { SideBarService } from '../js/sidebar-service';
import { EmployeePayrollService } from '../js/employeepayroll-service';
import EmployeePayrollApi from "../js/Api/EmployeePayrollApi";
import { Random } from 'meteor/random';
import { AppointmentService } from '../appointments/appointment-service';
import EmployeePaySettings from "../js/Api/Model/EmployeePaySettings";
import EmployeePaySettingFields from "../js/Api/Model/EmployeePaySettingFields";
import { Employee, EmployeeFields } from '../js/Api/Model/Employee';
import AssignLeaveType from "../js/Api/Model/AssignLeaveType";
import AssignLeaveTypeFields from "../js/Api/Model/AssignLeaveTypeFields";
import PayTemplateEarningLine from "../js/Api/Model/PayTemplateEarningLine";
import PayTemplateEarningLineFields from "../js/Api/Model/PayTemplateEarningLineFields";
import PayTemplateDeductionLine from "../js/Api/Model/PayTemplateDeductionLine";
import PayTemplateDeductionLineFields from "../js/Api/Model/PayTemplateDeductionLineFields";
import PayTemplateSuperannuationLine from "../js/Api/Model/PayTemplateSuperannuationLine";
import PayTemplateSuperannuationLineFields from "../js/Api/Model/PayTemplateSuperannuationLineFields";
import PayTemplateReiumbursementLine from "../js/Api/Model/PayTemplateReiumbursementLine";
import PayTemplateReiumbursementLineFields from "../js/Api/Model/PayTemplateReiumbursementLineFields";
import OpeningBalance from "../js/Api/Model/OpeningBalance";
import OpeningBalanceFields from "../js/Api/Model/OpeningBalanceFields";
import ApiService from "../js/Api/Module/ApiService";
import LeaveRequest from "../js/Api/Model/LeaveRequest";
import LeaveRequestFields from "../js/Api/Model/LeaveRequestFields";
import PayNotes from "../js/Api/Model/PayNotes";
import PayNotesFields from "../js/Api/Model/PayNotesFields";
import PaySlips from "../js/Api/Model/PaySlips";
import PaySlipsFields from "../js/Api/Model/PaySlipsFields";
import 'jquery-editable-select';
import '../lib/global/indexdbstorage.js';
import { functionsIn, template } from "lodash";
import moment from "moment";
import LoadingOverlay from '../LoadingOverlay';
import { jsPDF } from "jspdf";
import erpObject from "../lib/global/erp-objects";
import CachedHttp from "../lib/global/CachedHttp";
import GlobalFunctions from "../GlobalFunctions";

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
const employeePayrollServices = new EmployeePayrollService();
let edtProductSelect = "";

Template.employeescard.onCreated(function() {
    const templateObject = Template.instance();
    setTimeout(function() {
        // $('#period').editableSelect('add','Hourly');
        // $('#period').editableSelect('add','Daily');
        // $('#period').editableSelect('add','Weekly');
        // $('#period').editableSelect('add','Monthly');
        $("#paymentDate").datepicker({
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
    }, 1000);

    templateObject.AppTableModalData = new ReactiveVar([]);
    templateObject.ResidencyStatusList = new ReactiveVar();
    templateObject.EmploymentBasisList = new ReactiveVar();
    templateObject.PayPeriodList = new ReactiveVar();
    templateObject.TFNExemptionList = new ReactiveVar();
    templateObject.records = new ReactiveVar();
    templateObject.payTemplateEarningLineInfo = new ReactiveVar();
    templateObject.openingBalanceInfo = new ReactiveVar();
    templateObject.payTemplateDeductionLineInfo = new ReactiveVar();
    templateObject.payTemplateSuperannuationLineInfo = new ReactiveVar();
    templateObject.payTemplateReiumbursementLineInfo = new ReactiveVar();
    templateObject.paySlipInfos = new ReactiveVar();
    templateObject.currentDrpDownID = new ReactiveVar();
    templateObject.employeePayInfos = new ReactiveVar();
    templateObject.employeePaySettings = new ReactiveVar();
    templateObject.leaveTypesDrpDown = new ReactiveVar();
    templateObject.assignLeaveTypeInfos = new ReactiveVar();
    templateObject.payNotesInfos = new ReactiveVar();
    templateObject.leaveRequestInfos = new ReactiveVar();
    templateObject.bankAccList = new ReactiveVar();
    templateObject.countryData = new ReactiveVar();
    templateObject.phoneCodeData = new ReactiveVar();
    templateObject.productsdatatable = new ReactiveVar();
    templateObject.notesrecords = new ReactiveVar();
    templateObject.empuserrecord = new ReactiveVar();
    templateObject.employeerecords = new ReactiveVar([]);
    templateObject.empPriorities = new ReactiveVar([]);
    templateObject.recentTrasactions = new ReactiveVar([]);
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.isCloudUserPass = new ReactiveVar();
    templateObject.isCloudUserPass.set(false);
    templateObject.selectedproducts = new ReactiveVar([]);
    templateObject.selectedemployeeproducts = new ReactiveVar([]);
    templateObject.preferedPaymentList = new ReactiveVar();
    templateObject.termsList = new ReactiveVar();
    templateObject.deliveryMethodList = new ReactiveVar();
    templateObject.taxCodeList = new ReactiveVar();
    templateObject.defaultsaletaxcode = new ReactiveVar();

    /* Attachments */
    templateObject.uploadedFile = new ReactiveVar();
    templateObject.uploadedFiles = new ReactiveVar([]);
    templateObject.attachmentCount = new ReactiveVar();
    templateObject.currentAttachLineID = new ReactiveVar();
    templateObject.imageFileData = new ReactiveVar();
    templateObject.countUserCreated = new ReactiveVar();
    templateObject.isUserAddition = new ReactiveVar();
    templateObject.isUserAddition.set(true);
    templateObject.calendarOptions = new ReactiveVar([]);
    templateObject.allrepservicedata = new ReactiveVar([]);

    templateObject.earningLines = new ReactiveVar([]);


    /* PayRun related vars */
    templateObject.payPeriods = new ReactiveVar([]);

    templateObject.allProducts = new ReactiveVar([]);
    templateObject.deletedSelectedProducts = new ReactiveVar([]);
    templateObject.TRepServices = new ReactiveVar([]);
});

Template.employeescard.onRendered(function() {
    let begunDate;
    let currentDate;
    const erpGet = erpDb();
    LoadingOverlay.show();
    Session.setPersistent('cloudCurrentLogonName', '');
    //var splashArrayRepServiceList = new Array();
    let templateObject = Template.instance();
    let contactService = new ContactService();
    const countryService = new CountryService();
    let paymentService = new PaymentsService();
    let productService = new ProductService();
    let appointmentService = new AppointmentService();
    const records = [];
    let countries = [];
    let preferedPayments = [];
    let terms = [];
    let deliveryMethods = [];
    let taxCodes = [];
    let employeePriority = [];
    let currentId = FlowRouter.current().queryParams;
    let employeeID = (!isNaN(currentId.id)) ? currentId.id : 0;
    const activeParentTab = ((currentId.activeparenttab)) ? currentId.activeparenttab : 'employeeTab';
    const activeChildTab = ((currentId.activechildtab)) ? currentId.activechildtab : 'contact-tab';

    const dataTableList = [];
    const tableHeaderList = [];

    let salestaxcode = '';
    let totAmount = 0;
    let totAmountOverDue = 0;

    // setTimeout(function() {
    //     $('#tblLeaveRequests').DataTable({
    //         "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
    //         buttons: [{
    //             extend: 'excelHtml5',
    //             text: '',
    //             download: 'open',
    //             className: "btntabletocsv hiddenColumn",
    //             filename: "taxratelist_" + moment().format(),
    //             orientation: 'portrait',
    //             exportOptions: {
    //                 columns: ':visible'
    //             }
    //         }, {
    //             extend: 'print',
    //             download: 'open',
    //             className: "btntabletopdf hiddenColumn",
    //             text: '',
    //             title: 'Tax Rate List',
    //             filename: "taxratelist_" + moment().format(),
    //             exportOptions: {
    //                 columns: ':visible'
    //             }
    //         }],
    //         select: true,
    //         destroy: true,
    //         colReorder: {
    //             fixedColumnsRight: 1
    //         },
    //         lengthMenu: [
    //             [25, -1],
    //             [25, "All"]
    //         ],
    //         // bStateSave: true,
    //         // rowId: 0,
    //         paging: true,
    //         info: true,
    //         responsive: true,
    //         "order": [
    //             [0, "asc"]
    //         ],
    //         action: function() {
    //             $('#tblLeaveRequests').DataTable().ajax.reload();
    //         },
    //         "fnDrawCallback": function(oSettings) {
    //             setTimeout(function() {
    //                 MakeNegative();
    //             }, 100);
    //         },

    //     }).on('page', function() {
    //         setTimeout(function() {
    //             MakeNegative();
    //         }, 100);
    //         let draftRecord = templateObject.datatablerecords.get();
    //         templateObject.datatablerecords.set(draftRecord);
    //     }).on('column-reorder', function() {

    //     }).on('length.dt', function(e, settings, len) {
    //         setTimeout(function() {
    //             MakeNegative();
    //         }, 100);
    //     });

    //     // $('#currencyLists').DataTable().column( 0 ).visible( true );
    //     $('.fullScreenSpin').css('display', 'none');
    // }, 100);

    // setTimeout(function() {
    //     $('#tblPayslipHistory').DataTable({
    //         columnDefs: [{
    //             "orderable": false,
    //             "targets": -1
    //         }],
    //         "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
    //         buttons: [{
    //             extend: 'excelHtml5',
    //             text: '',
    //             download: 'open',
    //             className: "btntabletocsv hiddenColumn",
    //             filename: "taxratelist_" + moment().format(),
    //             orientation: 'portrait',
    //             exportOptions: {
    //                 columns: ':visible'
    //             }
    //         }, {
    //             extend: 'print',
    //             download: 'open',
    //             className: "btntabletopdf hiddenColumn",
    //             text: '',
    //             title: 'Tax Rate List',
    //             filename: "taxratelist_" + moment().format(),
    //             exportOptions: {
    //                 columns: ':visible'
    //             }
    //         }],
    //         select: true,
    //         destroy: true,
    //         colReorder: {
    //             fixedColumnsRight: 1
    //         },
    //         lengthMenu: [
    //             [25, -1],
    //             [25, "All"]
    //         ],
    //         // bStateSave: true,
    //         // rowId: 0,
    //         paging: true,
    //         info: true,
    //         responsive: true,
    //         "order": [
    //             [0, "asc"]
    //         ],
    //         action: function() {
    //             $('#tblPayslipHistory').DataTable().ajax.reload();
    //         },
    //         "fnDrawCallback": function(oSettings) {
    //             setTimeout(function() {
    //                 MakeNegative();
    //             }, 100);
    //         },

    //     }).on('page', function() {
    //         setTimeout(function() {
    //             MakeNegative();
    //         }, 100);
    //         let draftRecord = templateObject.datatablerecords.get();
    //         templateObject.datatablerecords.set(draftRecord);
    //     }).on('column-reorder', function() {

    //     }).on('length.dt', function(e, settings, len) {
    //         setTimeout(function() {
    //             MakeNegative();
    //         }, 100);
    //     });

    //     // $('#currencyLists').DataTable().column( 0 ).visible( true );
    //     $('.fullScreenSpin').css('display', 'none');
    // }, 100);

    // setTimeout(function() {
    //     $('#tblPayrollNotes').DataTable({
    //         "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
    //         buttons: [{
    //             extend: 'excelHtml5',
    //             text: '',
    //             download: 'open',
    //             className: "btntabletocsv hiddenColumn",
    //             filename: "taxratelist_" + moment().format(),
    //             orientation: 'portrait',
    //             exportOptions: {
    //                 columns: ':visible'
    //             }
    //         }, {
    //             extend: 'print',
    //             download: 'open',
    //             className: "btntabletopdf hiddenColumn",
    //             text: '',
    //             title: 'Tax Rate List',
    //             filename: "taxratelist_" + moment().format(),
    //             exportOptions: {
    //                 columns: ':visible'
    //             }
    //         }],
    //         select: true,
    //         destroy: true,
    //         colReorder: {
    //             fixedColumnsRight: 1
    //         },
    //         lengthMenu: [
    //             [25, -1],
    //             [25, "All"]
    //         ],
    //         // bStateSave: true,
    //         // rowId: 0,
    //         paging: true,
    //         info: true,
    //         responsive: true,
    //         "order": [
    //             [0, "asc"]
    //         ],
    //         action: function() {
    //             $('#tblPayrollNotes').DataTable().ajax.reload();
    //         },
    //         "fnDrawCallback": function(oSettings) {
    //             setTimeout(function() {
    //                 MakeNegative();
    //             }, 100);
    //         },

    //     }).on('page', function() {
    //         setTimeout(function() {
    //             MakeNegative();
    //         }, 100);
    //         let draftRecord = templateObject.datatablerecords.get();
    //         templateObject.datatablerecords.set(draftRecord);
    //     }).on('column-reorder', function() {

    //     }).on('length.dt', function(e, settings, len) {
    //         setTimeout(function() {
    //             MakeNegative();
    //         }, 100);
    //     });

    //     // $('#currencyLists').DataTable().column( 0 ).visible( true );
    //     $('.fullScreenSpin').css('display', 'none');
    // }, 200);


    setTimeout(function() {
        const redirectUrl = document.location.toString();
        if (redirectUrl.match('&')) {
            $('.nav-tabs a[data-target="#' + redirectUrl.split('&')[1] + '"]').tab('show');
            setTimeout(function() {
                $('.nav-tabs a[href="#payslips').tab('show');
            }, 100);
        }
    }, 100);

    // $('.nav-tabs a').on('shown.bs.tab', function (e) {
    //     window.location.hash = e.target.hash;
    // });
    setTimeout(function() {
        Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'defaulttax', function(error, result) {
            if (error) {
                salestaxcode = loggedTaxCodeSalesInc;
                templateObject.defaultsaletaxcode.set(salestaxcode);
            } else {
                if (result) {
                    salestaxcode = result.customFields[1].taxvalue || loggedTaxCodeSalesInc;
                    templateObject.defaultsaletaxcode.set(salestaxcode);
                }
            }
        });

    }, 500);

    setTimeout(function() {
        $('[data-toggle="tooltip"]').tooltip();
    }, 1000);

    setTimeout(function() {
        MakeNegative();
        $("#edtFirstPayDate, #dtStartingDate,#dtDOB,#dtTermninationDate,#dtAsOf,#edtLeaveStartDate,#edtLeaveEndDate,#edtPeriodPaymentDate").datepicker({
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

        $("#edtLeaveEndDate").datepicker({ dateFormat: 'dd/mm/yy',  }).datepicker("setDate", new Date().getDay+7); 

    }, 500);

    const CloudUserPass = Session.get('CloudUserPass');
    if (CloudUserPass) {
        templateObject.isCloudUserPass.set(true);
    }

    Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblTransactionlist', function(error, result) {
        if (error) {} else {
            if (result) {
                for (let i = 0; i < result.customFields.length; i++) {
                    let customcolumn = result.customFields;
                    let columData = customcolumn[i].label;
                    let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                    let hiddenColumn = customcolumn[i].hidden;
                    let columnClass = columHeaderUpdate.split('.')[1];
                    let columnWidth = customcolumn[i].width;
                    // let columnindex = customcolumn[i].index + 1;
                    $("th." + columnClass + "").html(columData);
                    $("th." + columnClass + "").css('width', "" + columnWidth + "px");
                }
            }
        }
    });

    function MakeNegative() {
        $('td').each(function() {
            if ($(this).text().indexOf('-' + Currency) >= 0)
                $(this).addClass('text-danger')
        });
    }

    setTimeout(function() {
        if (currentId.transTab == 'prod') {
            $('.nav-link').removeClass('active');
            $('.tabproductsservices').trigger('click');
            $([document.documentElement, document.body]).animate({
                scrollTop: $("#tab-productsservices").offset().top
            }, 1000);
        }
    }, 500);

    // setTimeout(function () {
    //     if( activeParentTab != ""){
    //         $('#mainTabs ul li a').removeClass('active');
    //         $(`.${activeParentTab}`).trigger('click');
    //     }
    // }, 1000);


    /***
     * This is to load all product with it details
     */
    templateObject.loadAllProducts = async() => {
        let data = await CachedHttp.get(erpObject.TProductVS1, async() => {
            return await productService.getNewProductListVS1();
        }, {
            useIndexDb: true,
            useLocalStorage: false,
            fallBackToLocal: true,
            validate: (cachedResponse) => {
                return false;
            }
        });
        data = data.response;
        let products = data.tproductvs1;
        templateObject.allProducts.set(products); // we store the product in memory
    }


    /**
     * This will load employee products
     */
    templateObject.getEmployeeProducts = async(employeeName = null) => {
        LoadingOverlay.show();
        // await templateObject.loadAllProducts();

        let data = await CachedHttp.get(erpObject.TRepServices, async() => {
            return await sideBarService.getSelectedProducts(employeeName);
        }, {
            useIndexDb: true,
            useLocalStorage: false,
            fallBackToLocal: true,
            validate: (cachedResponse) => {
                return true;
            }
        });

        data = data.response;
        await templateObject.TRepServices.set(data.trepservices);

        let objects = data.trepservices.map(s => s.fields);


        const products = await templateObject.allProducts.get();

        let selectedProducts = objects.map(obj => products.find(p => p.ProductName == obj.ServiceDesc))

        // objects.forEach((obj, index) => {
        //     objects[index] = products.find(p => p.ProductName == obj.ServiceDesc)
        // });

        // We do this to avoid undefined valeus
        selectedProducts = selectedProducts.filter(element => {
            return element !== undefined;
        });

        templateObject.selectedproducts.set(selectedProducts);
        templateObject.rebuildProductTable();



        LoadingOverlay.hide();
    }



    /**
     * @deprecated since 05/10/2022
     */
    templateObject.getAllSelectedProducts = function(employeeName) {
        let productlist = [];
        LoadingOverlay.show();

        var splashArrayRepServiceList = new Array();
        sideBarService.getSelectedProducts(employeeName).then(function(data) {
            var dataList = {};
            $('.fullScreenSpin').css('display', 'none');
            if (data.trepservices.length > 0) {
                for (let i = 0; i < data.trepservices.length; i++) {
                    let linePayRate = data.trepservices[i].PayRate || 0;
                    if (data.trepservices[i].PayRate != 0) {

                    } else {
                        linePayRate = data.trepservices[i].Rate;
                    }

                    let calcRate = utilityService.modifynegativeCurrencyFormat(data.trepservices[i].Rate) || 0.00;
                    let calcPayRate = utilityService.modifynegativeCurrencyFormat(linePayRate) || utilityService.modifynegativeCurrencyFormat(linePayRate) || 0.00;
                    var dataListService = [
                        data.trepservices[i].ServiceDesc || '',
                        data.trepservices[i].ServiceDesc || '',
                        '<input class="colServiceCostPrice highlightInput" type="text" value="' + calcRate + '">' || '',
                        '<input class="colServiceSalesPrice highlightInput" type="text" value="' + calcPayRate + '">' || '',
                        data.trepservices[i].Id || '',
                        '<span class="table-remove colServiceDelete"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span>' || ''
                        // JSON.stringify(data.tproductvs1[i].fields.ExtraSellPrice)||null
                    ];

                    splashArrayRepServiceList.push(dataListService);
                    dataList = {
                        id: data.trepservices[i].Id || '',
                        employee: data.trepservices[i].EmployeeName || '',
                        productname: data.trepservices[i].ServiceDesc || '',
                        productdesc: data.trepservices[i].ServiceDesc || '',
                        rate: utilityService.modifynegativeCurrencyFormat(data.trepservices[i].Rate) || 0.00,
                        payrate: utilityService.modifynegativeCurrencyFormat(linePayRate) || utilityService.modifynegativeCurrencyFormat(linePayRate) || 0.00
                    };

                    //if(employeeName == data.trepservices[i].fields.EmployeeName){
                    productlist.push(dataList);
                    //}


                }
            } else {

                var dataListService = [
                    '',
                    '',
                    '<input class="colServiceCostPrice highlightInput" type="text" value="">' || '',
                    '<input class="colServiceSalesPrice highlightInput" type="text" value="">' || '',
                    Random.id(),
                    '<span class="table-remove colServiceDelete"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span>' || ''
                    // JSON.stringify(data.tproductvs1[i].fields.ExtraSellPrice)||null
                ];
                //splashArrayRepServiceList.push(dataListService);
                dataList = {
                    id: '',
                    employee: '',
                    productname: '',
                    productdesc: '',
                    rate: Currency + 0.00,
                    payrate: Currency + 0.00
                };
                productlist.push(dataList);
            }
            templateObject.selectedproducts.set(productlist);

            if (templateObject.selectedproducts.get()) {
                setTimeout(function() {
                    templateObject.allrepservicedata.set(splashArrayRepServiceList);
                    $('#tblEmpServiceList').DataTable({
                        data: splashArrayRepServiceList,
                        columnDefs: [
                            { contenteditable: "false", className: "colServiceName", targets: 0 },
                            { contenteditable: "false", className: "colServiceDescription", targets: 1 },
                            { contenteditable: "true", targets: 2 },
                            { contenteditable: "true", targets: 3 },
                            { contenteditable: "false", className: "colID hiddenColumn", targets: 4 },
                            { contenteditable: "false", "orderable": false, className: "colServiceDelete", targets: -1 }
                        ],
                        "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        select: true,
                        destroy: true,
                        colReorder: {
                            fixedColumnsRight: 1
                        },
                        // pageLength: initialDatatableLoad,
                        // lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                        paging: false,
                        // "scrollY": "400px",
                        info: true,
                        pageLength: -1,
                        lengthMenu: [
                            [-1],
                            ["All"]
                        ],
                        responsive: true,
                        "order": [
                            [0, "asc"]
                        ],
                        action: function() {
                            $('#tblEmpServiceList').DataTable().ajax.reload();
                        },
                        "fnDrawCallback": function(oSettings) {
                            setTimeout(function() {
                                MakeNegative();
                            }, 100);
                        },
                        "fnInitComplete": function() {
                            $("<button class='btn btn-primary' data-dismiss='modal' data-toggle='modal' data-target='#productListModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblEmpServiceList_filter");
                            $("<button class='btn btn-primary btnRefreshProductService' type='button' id='btnRefreshProductService' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblEmpServiceList_filter");
                        }

                    }).on('page', function() {
                        setTimeout(function() {
                            MakeNegative();
                        }, 100);
                        let draftRecord = templateObject.datatablerecords.get();
                        templateObject.datatablerecords.set(draftRecord);
                    }).on('search.dt', function(eventSearch, searchdata) {
                        let dataSearchName = $('#tblEmpServiceList_filter input').val();
                        if (searchdata.fnRecordsDisplay() > 0) {

                        } else {
                            if (dataSearchName.replace(/\s/g, '') != '') {
                                $('#productListModal').modal();
                                setTimeout(function() {
                                    $('#tblInventoryService_filter .form-control-sm').focus();
                                    $('#tblInventoryService_filter .form-control-sm').val(dataSearchName);
                                    $('#tblInventoryService_filter .form-control-sm').trigger("input");

                                }, 500);
                            }
                        }
                    }).on('column-reorder', function() {});
                    $('.fullScreenSpin').css('display', 'none');
                }, 100);
            }

        }).catch(function(err) {
            $('.fullScreenSpin').css('display', 'none');
            var dataList = {
                id: '',
                employee: '',
                productname: '',
                productdesc: '',
                rate: Currency + 0.00,
                payrate: Currency + 0.00
            }
            productlist.push(dataList);
            templateObject.selectedproducts.set(productlist);
            var dataListService = [
                '',
                '',
                '<input class="colServiceCostPrice highlightInput" type="text" value="">' || '',
                '<input class="colServiceSalesPrice highlightInput" type="text" value="">' || '',
                Random.id(),
                '<span class="table-remove colServiceDelete"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span>' || ''
                // JSON.stringify(data.tproductvs1[i].fields.ExtraSellPrice)||null
            ];

            setTimeout(function() {
                templateObject.allrepservicedata.set(splashArrayRepServiceList);
                $('#tblEmpServiceList').DataTable({
                    data: splashArrayRepServiceList,
                    columnDefs: [
                        { contenteditable: "false", className: "colServiceName", targets: 0 },
                        { contenteditable: "false", className: "colServiceDescription", targets: 1 },
                        { contenteditable: "true", targets: 2 },
                        { contenteditable: "true", targets: 3 },
                        { contenteditable: "false", className: "colID hiddenColumn", targets: 4 },
                        { contenteditable: "false", "orderable": false, className: "colServiceDelete", targets: -1 }
                    ],
                    "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                    select: true,
                    destroy: true,
                    colReorder: {
                        fixedColumnsRight: 1
                    },
                    // pageLength: initialDatatableLoad,
                    // lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                    paging: false,
                    // "scrollY": "400px",
                    info: true,
                    pageLength: -1,
                    lengthMenu: [
                        [-1],
                        ["All"]
                    ],
                    responsive: true,
                    "order": [
                        [0, "asc"]
                    ],
                    action: function() {
                        $('#tblEmpServiceList').DataTable().ajax.reload();
                    },
                    "fnDrawCallback": function(oSettings) {
                        setTimeout(function() {
                            MakeNegative();
                        }, 100);
                    },
                    "fnInitComplete": function() {
                        $("<button class='btn btn-primary' data-dismiss='modal' data-toggle='modal' data-target='#productListModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblEmpServiceList_filter");
                        $("<button class='btn btn-primary btnRefreshProductService' type='button' id='btnRefreshProductService' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblEmpServiceList_filter");
                    }

                }).on('page', function() {
                    setTimeout(function() {
                        MakeNegative();
                    }, 100);
                    let draftRecord = templateObject.datatablerecords.get();
                    templateObject.datatablerecords.set(draftRecord);
                }).on('column-reorder', function() {});
                $('.fullScreenSpin').css('display', 'none');
            }, 0);
        });
    }


    templateObject.rebuildProductTable = (destroy = true) => {
        //if(! $.fn.DataTable.isDataTable( '#tblEmpServiceList' )) {
        if (templateObject.selectedproducts.get()) {
            setTimeout(() => {
                $("#tblEmpServiceList").DataTable({
                    processing: true,
                    //serverSide: true,
                    destroy: destroy,
                    // "searching": true,
                    "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",

                    select: true,

                    colReorder: {
                        fixedColumnsRight: 1
                    },
                    // pageLength: initialDatatableLoad,
                    // lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                    paging: false,
                    // "scrollY": "400px",
                    info: true,
                    pageLength: -1,
                    lengthMenu: [
                        [-1],
                        ["All"]
                    ],
                    responsive: true,
                    "order": [
                        [0, "asc"]
                    ],
                    action: function() {
                        $('#tblEmpServiceList').DataTable().ajax.reload();
                    },
                    "fnDrawCallback": function(oSettings) {
                        setTimeout(function() {
                            MakeNegative();
                        }, 100);
                    },
                    "fnInitComplete": function() {
                        $("<button class='btn btn-primary' data-dismiss='modal' data-toggle='modal' data-target='#productListModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblEmpServiceList_filter");
                        $("<button class='btn btn-primary btnRefreshProductService' type='button' id='btnRefreshProductService' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblEmpServiceList_filter");
                    }

                }).on('page', function() {
                    setTimeout(function() {
                        MakeNegative();
                    }, 100);
                    let draftRecord = templateObject.datatablerecords.get();
                    templateObject.datatablerecords.set(draftRecord);
                }).on('search.dt', function(eventSearch, searchdata) {
                    let dataSearchName = $('#tblEmpServiceList_filter input').val();
                    if (searchdata.fnRecordsDisplay() > 0) {

                    } else {
                        if (dataSearchName.replace(/\s/g, '') != '') {
                            $('#productListModal').modal();
                            setTimeout(function() {
                                $('#tblInventoryService_filter .form-control-sm').focus();
                                $('#tblInventoryService_filter .form-control-sm').val(dataSearchName);
                                $('#tblInventoryService_filter .form-control-sm').trigger("input");

                            }, 500);
                        }
                    }
                }).on('column-reorder', function() {});

            }, 1000);
        }
        // }

    }

    templateObject.addSelectedProduct = async() => {
        const allProducts = await templateObject.allProducts.get();

        let selectedProducts = await templateObject.selectedproducts.get();

        /**
         * This function will filter the product that are already in the previous list
         */
        const filterProducts = (productToRemove = [], productList = []) => {
            return productList.filter(p => !productToRemove.some(pr => pr.Id == p.Id));
        }
        let productIds = $("#tblInventoryService").find("input.chkServiceCard:checked");
        selectedProducts.push(...filterProducts(selectedProducts, productIds.map((index, input) => allProducts.find(p => p.Id == parseInt($(input).attr("product-id")))).toArray()));

        // We do this to avoid undefined valeus
        selectedProducts = selectedProducts.filter(element => {
            return element !== undefined;
        });

        await templateObject.selectedproducts.set(selectedProducts);

        // templateObject.rebuildProductTable();

        // selectedProducts.each((index, product) => {
        //     let objServiceDetails = {
        //         type:"TServices",
        //         fields:
        //         {
        //             ProductId:parseInt(productServiceID),
        //             ServiceDesc:productServiceName,
        //             StandardRate:parseFloat(productServicerate.replace(/[^0-9.-]+/g,"")) || 0,
        //         }
        //     };

        //     productService.saveProductService(objServiceDetails);

        // });






        $('#productListModal').modal('hide');
        return;



        let trepserviceObjects = templateObject.selectedemployeeproducts.get();
        let getselectedproducts = templateObject.selectedproducts.get();
        let productService = new ProductService();
        const splashArrayRepServiceListGet = new Array();
        let tempCurrenctTRePService = templateObject.allrepservicedata.get() || '';
        //var splashArrayRepServiceList = new Array();
        //var splashArrayRepServiceList = new Array();
        let tokenid = Random.id();
        const tblInventoryService = $(".tblInventoryService").dataTable();
        let dataserviceList = {};
        let productservicelist = [];

        $(".chkServiceCard:checked", tblInventoryService.fnGetNodes()).each(function() {
            let productServiceID = $(this).closest('tr').find('.colProuctPOPID').text() || '';
            let productServiceName = $(this).closest('tr').find('.productName').text() || '';
            let productServiceDesc = $(this).closest('tr').find('.productDesc').text() || '';
            let productServicerate = $(this).closest('tr').find('.costPrice').text() || '';
            let productServicecost = $(this).closest('tr').find('.salePrice').text() || '';
            let objServiceDetails = {
                type: "TServices",
                fields: {
                    ProductId: parseInt(productServiceID),
                    ServiceDesc: productServiceName,
                    StandardRate: parseFloat(productServicerate.replace(/[^0-9.-]+/g, "")) || 0,
                }
            };
            productService.saveProductService(objServiceDetails).then(function(objServiceDetails) {});

            dataserviceList = {
                id: tokenid || '',
                employee: Session.get('mySessionEmployee') || '',
                productname: productServiceName || '',
                productdesc: productServiceDesc || '',
                rate: productServicerate || 0,
                payrate: productServicecost || 0
            };
            const dataListService = [
                productServiceName || '',
                productServiceDesc || '',
                '<input class="colServiceCostPrice highlightInput" type="text" value="' + productServicerate + '">' || '',
                '<input class="colServiceSalesPrice highlightInput" type="text" value="' + productServicecost + '">' || '',
                tokenid || '',
                '<span class="table-remove colServiceDelete"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span>' || ''
                // JSON.stringify(data.tproductvs1[i].fields.ExtraSellPrice)||null
            ];
            let checkServiceArray = getselectedproducts.filter(function(prodData) { return prodData.productname === productServiceName }) || '';
            if (checkServiceArray.length > 0) {

            } else {
                splashArrayRepServiceListGet.push(dataListService);
                getselectedproducts.push(dataserviceList);
            }
        });
        templateObject.selectedproducts.set(getselectedproducts);
        const thirdaryData = $.merge($.merge([], tempCurrenctTRePService), splashArrayRepServiceListGet);
        if (thirdaryData) {
            templateObject.allrepservicedata.set(thirdaryData);
            let uniqueChars = [...new Set(thirdaryData)];
            const datatable = $('#tblEmpServiceList').DataTable();
            datatable.clear();
            datatable.rows.add(uniqueChars);
            datatable.draw(false);
        }
        //$('#tblEmpServiceList_info').html('Showing 1 to '+getselectedproducts.length+ ' of ' +getselectedproducts.length+ ' entries');
        $('#productListModal').modal('toggle');

    }


    templateObject.saveSelectedProduct = async() => {
        LoadingOverlay.show();
        const selectedProducts = await templateObject.selectedproducts.get();
        const deletedProducts = await templateObject.deletedSelectedProducts.get();
        const tRepServices = await templateObject.TRepServices.get();

        const findProductService = (searchedProduct) => {
            let product = tRepServices.find(s => searchedProduct.ProductName == s.fields.ServiceDesc);

            return product;
        }

        await GlobalFunctions.asyncForEach(selectedProducts, async(product, index) => {
            // This needs a review.
            // Why using Tservices ? Shouldn't we have something like TEmployeeProducts ?
            let objServiceDetails = {
                type: "TServices",
                fields: {
                    ProductId: parseInt(product.Id), // We save this but, is it really used ?
                    ServiceDesc: product.ProductName // Why ServiceDesc is the product Desc ??
                        //StandardRate: product.BuyQty1Cost || 0,  The standRate property is not a costPrice nor salePrice
                }
            };


            await productService.saveProductService(objServiceDetails);
        });

        await GlobalFunctions.asyncForEach(deletedProducts, async(product, index) => {
            let serviceObj = findProductService(product);

            let objDetails = {
                type: serviceObj.type,
                fields: {
                    ID: serviceObj.fields.ID,
                    Active: false
                }
            }
            await contactService.saveEmployeeProducts(objDetails);
        });

        LoadingOverlay.hide();
    }


    /**
     * Removing a product in the list of selected products
     * Wont be saved unless we press on save
     *
     * no API used here
     * @param {integer} productId
     */
    templateObject.removeSelectedProduct = async(productId) => {

        let result = await swal({
            title: 'Delete Active Product',
            text: "Are you sure you want to Delete this Employee Active Product?",
            type: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes'
        });

        if (result.value) {
            let selectedProducts = await templateObject.selectedproducts.get();
            let deletedProducts = await templateObject.deletedSelectedProducts.get();

            // We do this to avoid undefined valeus
            selectedProducts = selectedProducts.filter(element => {
                return element !== undefined;
            });



            let removedProduct = selectedProducts.find(p => p.Id == productId);
            deletedProducts.push(removedProduct);

            let products = selectedProducts.filter(p => p.Id != removedProduct.Id);

            await templateObject.deletedSelectedProducts.set(deletedProducts);
            await templateObject.selectedproducts.set(products);
        }


    }


    templateObject.getAllProductData = function() {
            let productList = [];
            getVS1Data('TProductVS1').then(function(dataObject) {
                if (dataObject.length == 0) {
                    productService.getNewProductListVS1().then(function(data) {
                        let dataList = {};
                        for (let i = 0; i < data.tproductvs1.length; i++) {
                            dataList = {
                                id: data.tproductvs1[i].Id || '',
                                productname: data.tproductvs1[i].ProductName || ''
                            }
                            if (data.tproductvs1[i].ProductType != 'INV') {
                                productList.push(dataList);
                            }
                        }
                        templateObject.productsdatatable.set(productList);
                    });
                } else {
                    let data = JSON.parse(dataObject[0].data);
                    let useData = data.tproductvs1;
                    let dataList = {};
                    for (let i = 0; i < useData.length; i++) {
                        dataList = {
                            id: useData[i].fields.ID || '',
                            productname: useData[i].fields.ProductName || ''
                        }
                        if (useData[i].fields.ProductType != 'INV') {
                            productList.push(dataList);
                        }
                    }
                    templateObject.productsdatatable.set(productList);

                }
            }).catch(function(err) {
                productService.getNewProductListVS1().then(function(data) {
                    let dataList = {};
                    for (let i = 0; i < data.tproductvs1.length; i++) {
                        dataList = {
                            id: data.tproductvs1[i].Id || '',
                            productname: data.tproductvs1[i].ProductName || ''
                        }
                        if (data.tproductvs1[i].ProductType != 'INV') {
                            productList.push(dataList);
                        }
                    }
                    templateObject.productsdatatable.set(productList);
                });
            });

        }
        //templateObject.getAllProductData();

    contactService.getAllEmployeesPriority().then(function(data) {
        if (data.temployee.length > 0) {
            for (let x = 0; x < data.temployee.length; x++) {
                if (data.temployee[x].CustFld5 != "" && data.temployee[x].CustFld5 != "0") {
                    employeePriority.push(data.temployee[x].CustFld5);
                }
            }
            const result = employeePriority.map(function(x) {
                return parseInt(x, 10);
            });
            templateObject.empPriorities.set(result);
        }
    });
    templateObject.getAllProductRecentTransactions = function(employeeName) {
        getVS1Data('TInvoiceEx').then(function(dataObject) {
            if (dataObject.length == 0) {
                contactService.getAllInvoiceListByEmployee(employeeName).then(function(data) {
                    let lineItems = [];
                    let lineItemObj = {};
                    for (let i = 0; i < data.tinvoice.length; i++) {
                        let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.tinvoice[i].TotalAmount) || 0.00;
                        let totalTax = utilityService.modifynegativeCurrencyFormat(data.tinvoice[i].TotalTax) || 0.00;
                        // Currency+''+data.tinvoice[i].TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
                        let totalAmount = utilityService.modifynegativeCurrencyFormat(data.tinvoice[i].TotalAmountInc) || 0.00;
                        let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tinvoice[i].TotalPaid) || 0.00;
                        let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tinvoice[i].TotalBalance) || 0.00;
                        var dataList = {
                            id: data.tinvoice[i].Id || '',
                            employee: data.tinvoice[i].EmployeeName || '',
                            sortdate: data.tinvoice[i].SaleDate != '' ? moment(data.tinvoice[i].SaleDate).format("YYYY/MM/DD") : data.tinvoice[i].SaleDate,
                            saledate: data.tinvoice[i].SaleDate != '' ? moment(data.tinvoice[i].SaleDate).format("DD/MM/YYYY") : data.tinvoice[i].SaleDate,
                            customername: data.tinvoice[i].CustomerName || '',
                            totalamountex: totalAmountEx || 0.00,
                            totaltax: totalTax || 0.00,
                            totalamount: totalAmount || 0.00,
                            totalpaid: totalPaid || 0.00,
                            totaloustanding: totalOutstanding || 0.00,
                            salestatus: data.tinvoice[i].SalesStatus || '',
                            custfield1: data.tinvoice[i].SaleCustField1 || '',
                            custfield2: data.tinvoice[i].SaleCustField2 || '',
                            comments: data.tinvoice[i].Comments || '',
                        };
                        dataTableList.push(dataList);
                    }
                    templateObject.datatablerecords.set(dataTableList);

                    if (templateObject.datatablerecords.get()) {

                        Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblTransactionlist', function(error, result) {
                            if (error) {} else {
                                if (result) {
                                    for (let i = 0; i < result.customFields.length; i++) {
                                        let customcolumn = result.customFields;
                                        let columData = customcolumn[i].label;
                                        let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                                        let hiddenColumn = customcolumn[i].hidden;
                                        let columnClass = columHeaderUpdate.split('.')[1];
                                        let columnWidth = customcolumn[i].width;
                                        let columnindex = customcolumn[i].index + 1;

                                        if (hiddenColumn == true) {

                                            $("." + columnClass + "").addClass('hiddenColumn');
                                            $("." + columnClass + "").removeClass('showColumn');
                                        } else if (hiddenColumn == false) {
                                            $("." + columnClass + "").removeClass('hiddenColumn');
                                            $("." + columnClass + "").addClass('showColumn');
                                        }

                                    }
                                }

                            }
                        });

                        setTimeout(function() {
                            MakeNegative();
                        }, 100);
                    }

                    $('.fullScreenSpin').css('display', 'none');
                    setTimeout(function() {
                        //$.fn.dataTable.moment('DD/MM/YY');
                        $('#tblTransactionlist').DataTable({
                            // dom: 'lBfrtip',
                            columnDefs: [{
                                type: 'date',
                                targets: 0
                            }],
                            "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                            buttons: [{
                                extend: 'excelHtml5',
                                text: '',
                                download: 'open',
                                className: "btntabletocsv hiddenColumn",
                                filename: "Employee Transaction List - " + moment().format(),
                                orientation: 'portrait',
                                exportOptions: {
                                    columns: ':visible'
                                }
                            }, {
                                extend: 'print',
                                download: 'open',
                                className: "btntabletopdf hiddenColumn",
                                text: '',
                                title: 'Sales Transaction',
                                filename: "Employee Transaction List - " + moment().format(),
                                exportOptions: {
                                    columns: ':visible',
                                    stripHtml: false
                                }
                            }],
                            select: true,
                            destroy: true,
                            colReorder: true,
                            pageLength: initialDatatableLoad,
                            lengthMenu: [
                                [initialDatatableLoad, -1],
                                [initialDatatableLoad, "All"]
                            ],
                            info: true,
                            responsive: true,
                            "order": [
                                [0, "asc"]
                            ],
                            action: function() {
                                $('#tblTransactionlist').DataTable().ajax.reload();
                            },
                            "fnDrawCallback": function(oSettings) {
                                setTimeout(function() {
                                    MakeNegative();
                                }, 100);
                            },

                        }).on('page', function() {
                            setTimeout(function() {
                                MakeNegative();
                            }, 100);
                            let draftRecord = templateObject.datatablerecords.get();
                            templateObject.datatablerecords.set(draftRecord);
                        }).on('column-reorder', function() {});
                        $('.fullScreenSpin').css('display', 'none');
                    }, 0);

                    var columns = $('#tblTransactionlist th');
                    let sTible = "";
                    let sWidth = "";
                    let sIndex = "";
                    let sVisible = "";
                    let columVisible = false;
                    let sClass = "";
                    $.each(columns, function(i, v) {
                        if (v.hidden == false) {
                            columVisible = true;
                        }
                        if ((v.className.includes("hiddenColumn"))) {
                            columVisible = false;
                        }
                        sWidth = v.style.width.replace('px', "");

                        let datatablerecordObj = {
                            sTitle: v.innerText || '',
                            sWidth: sWidth || '',
                            sIndex: v.cellIndex || 0,
                            sVisible: columVisible || false,
                            sClass: v.className || ''
                        };
                        tableHeaderList.push(datatablerecordObj);
                    });
                    templateObject.tableheaderrecords.set(tableHeaderList);
                    $('div.dataTables_filter input').addClass('form-control form-control-sm');
                    $('#tblTransactionlist tbody').on('click', 'tr', function() {
                        var listData = $(this).closest('tr').attr('id');
                        if (listData) {
                            window.open('/invoicecard?id=' + listData, '_self');
                        }
                    });

                }).catch(function(err) {
                    // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                    $('.fullScreenSpin').css('display', 'none');

                    // Meteor._reload.reload();
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tinvoiceex;
                let lineItems = [];
                let lineItemObj = {};
                for (let i = 0; i < useData.length; i++) {
                    let totalAmountEx = utilityService.modifynegativeCurrencyFormat(useData[i].fields.TotalAmount) || 0.00;
                    let totalTax = utilityService.modifynegativeCurrencyFormat(useData[i].fields.TotalTax) || 0.00;
                    // Currency+''+useData[i].TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
                    let totalAmount = utilityService.modifynegativeCurrencyFormat(useData[i].fields.TotalAmountInc) || 0.00;
                    let totalPaid = utilityService.modifynegativeCurrencyFormat(useData[i].fields.TotalPaid) || 0.00;
                    let totalOutstanding = utilityService.modifynegativeCurrencyFormat(useData[i].fields.TotalBalance) || 0.00;
                    var dataList = {
                        id: useData[i].fields.ID || '',
                        employee: useData[i].fields.EmployeeName || '',
                        sortdate: useData[i].fields.SaleDate != '' ? moment(useData[i].fields.SaleDate).format("YYYY/MM/DD") : useData[i].fields.SaleDate,
                        saledate: useData[i].fields.SaleDate != '' ? moment(useData[i].fields.SaleDate).format("DD/MM/YYYY") : useData[i].fields.SaleDate,
                        customername: useData[i].fields.CustomerName || '',
                        totalamountex: totalAmountEx || 0.00,
                        totaltax: totalTax || 0.00,
                        totalamount: totalAmount || 0.00,
                        totalpaid: totalPaid || 0.00,
                        totaloustanding: totalOutstanding || 0.00,
                        salestatus: useData[i].fields.SalesStatus || '',
                        custfield1: useData[i].fields.SaleCustField1 || '',
                        custfield2: useData[i].fields.SaleCustField2 || '',
                        comments: useData[i].fields.Comments || '',
                    };
                    dataTableList.push(dataList);
                }
                templateObject.datatablerecords.set(dataTableList);

                if (templateObject.datatablerecords.get()) {

                    Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblTransactionlist', function(error, result) {
                        if (error) {} else {
                            if (result) {
                                for (let i = 0; i < result.customFields.length; i++) {
                                    let customcolumn = result.customFields;
                                    let columData = customcolumn[i].label;
                                    let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                                    let hiddenColumn = customcolumn[i].hidden;
                                    let columnClass = columHeaderUpdate.split('.')[1];
                                    let columnWidth = customcolumn[i].width;
                                    let columnindex = customcolumn[i].index + 1;

                                    if (hiddenColumn == true) {

                                        $("." + columnClass + "").addClass('hiddenColumn');
                                        $("." + columnClass + "").removeClass('showColumn');
                                    } else if (hiddenColumn == false) {
                                        $("." + columnClass + "").removeClass('hiddenColumn');
                                        $("." + columnClass + "").addClass('showColumn');
                                    }

                                }
                            }

                        }
                    });

                    setTimeout(function() {
                        MakeNegative();
                    }, 100);
                }

                $('.fullScreenSpin').css('display', 'none');
                setTimeout(function() {
                    //$.fn.dataTable.moment('DD/MM/YY');
                    $('#tblTransactionlist').DataTable({
                        // dom: 'lBfrtip',
                        columnDefs: [{
                            type: 'date',
                            targets: 0
                        }],
                        "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        buttons: [{
                            extend: 'excelHtml5',
                            text: '',
                            download: 'open',
                            className: "btntabletocsv hiddenColumn",
                            filename: "Employee Transaction List - " + moment().format(),
                            orientation: 'portrait',
                            exportOptions: {
                                columns: ':visible'
                            }
                        }, {
                            extend: 'print',
                            download: 'open',
                            className: "btntabletopdf hiddenColumn",
                            text: '',
                            title: 'Sales Transaction',
                            filename: "Employee Transaction List - " + moment().format(),
                            exportOptions: {
                                columns: ':visible',
                                stripHtml: false
                            }
                        }],
                        select: true,
                        destroy: true,
                        colReorder: true,
                        pageLength: initialDatatableLoad,
                        lengthMenu: [
                            [initialDatatableLoad, -1],
                            [initialDatatableLoad, "All"]
                        ],
                        info: true,
                        responsive: true,
                        "order": [
                            [0, "asc"]
                        ],
                        action: function() {
                            $('#tblTransactionlist').DataTable().ajax.reload();
                        },
                        "fnDrawCallback": function(oSettings) {
                            setTimeout(function() {
                                MakeNegative();
                            }, 100);
                        },

                    }).on('page', function() {
                        setTimeout(function() {
                            MakeNegative();
                        }, 100);
                        let draftRecord = templateObject.datatablerecords.get();
                        templateObject.datatablerecords.set(draftRecord);
                    }).on('column-reorder', function() {});
                    $('.fullScreenSpin').css('display', 'none');
                }, 0);

                var columns = $('#tblTransactionlist th');
                let sTible = "";
                let sWidth = "";
                let sIndex = "";
                let sVisible = "";
                let columVisible = false;
                let sClass = "";
                $.each(columns, function(i, v) {
                    if (v.hidden == false) {
                        columVisible = true;
                    }
                    if ((v.className.includes("hiddenColumn"))) {
                        columVisible = false;
                    }
                    sWidth = v.style.width.replace('px', "");

                    let datatablerecordObj = {
                        sTitle: v.innerText || '',
                        sWidth: sWidth || '',
                        sIndex: v.cellIndex || 0,
                        sVisible: columVisible || false,
                        sClass: v.className || ''
                    };
                    tableHeaderList.push(datatablerecordObj);
                });
                templateObject.tableheaderrecords.set(tableHeaderList);
                $('div.dataTables_filter input').addClass('form-control form-control-sm');
                $('#tblTransactionlist tbody').on('click', 'tr', function() {
                    var listData = $(this).closest('tr').attr('id');
                    if (listData) {
                        window.open('/invoicecard?id=' + listData, '_self');
                    }
                });

            }
        }).catch(function(err) {
            contactService.getAllInvoiceListByEmployee(employeeName).then(function(data) {
                let lineItems = [];
                let lineItemObj = {};
                for (let i = 0; i < data.tinvoice.length; i++) {
                    let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.tinvoice[i].TotalAmount) || 0.00;
                    let totalTax = utilityService.modifynegativeCurrencyFormat(data.tinvoice[i].TotalTax) || 0.00;
                    // Currency+''+data.tinvoice[i].TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
                    let totalAmount = utilityService.modifynegativeCurrencyFormat(data.tinvoice[i].TotalAmountInc) || 0.00;
                    let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tinvoice[i].TotalPaid) || 0.00;
                    let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tinvoice[i].TotalBalance) || 0.00;
                    const dataList = {
                        id: data.tinvoice[i].Id || '',
                        employee: data.tinvoice[i].EmployeeName || '',
                        sortdate: data.tinvoice[i].SaleDate != '' ? moment(data.tinvoice[i].SaleDate).format("YYYY/MM/DD") : data.tinvoice[i].SaleDate,
                        saledate: data.tinvoice[i].SaleDate != '' ? moment(data.tinvoice[i].SaleDate).format("DD/MM/YYYY") : data.tinvoice[i].SaleDate,
                        customername: data.tinvoice[i].CustomerName || '',
                        totalamountex: totalAmountEx || 0.00,
                        totaltax: totalTax || 0.00,
                        totalamount: totalAmount || 0.00,
                        totalpaid: totalPaid || 0.00,
                        totaloustanding: totalOutstanding || 0.00,
                        salestatus: data.tinvoice[i].SalesStatus || '',
                        custfield1: data.tinvoice[i].SaleCustField1 || '',
                        custfield2: data.tinvoice[i].SaleCustField2 || '',
                        comments: data.tinvoice[i].Comments || '',
                    };
                    dataTableList.push(dataList);
                }
                templateObject.datatablerecords.set(dataTableList);

                if (templateObject.datatablerecords.get()) {

                    Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblTransactionlist', function(error, result) {
                        if (error) {} else {
                            if (result) {
                                for (let i = 0; i < result.customFields.length; i++) {
                                    let customcolumn = result.customFields;
                                    let columData = customcolumn[i].label;
                                    let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                                    let hiddenColumn = customcolumn[i].hidden;
                                    let columnClass = columHeaderUpdate.split('.')[1];
                                    let columnWidth = customcolumn[i].width;
                                    let columnindex = customcolumn[i].index + 1;

                                    if (hiddenColumn == true) {
                                        $("." + columnClass + "").addClass('hiddenColumn');
                                        $("." + columnClass + "").removeClass('showColumn');
                                    } else if (hiddenColumn == false) {
                                        $("." + columnClass + "").removeClass('hiddenColumn');
                                        $("." + columnClass + "").addClass('showColumn');
                                    }
                                }
                            }
                        }
                    });
                    setTimeout(function() {
                        MakeNegative();
                    }, 100);
                }

                $('.fullScreenSpin').css('display', 'none');
                setTimeout(function() {
                    //$.fn.dataTable.moment('DD/MM/YY');
                    $('#tblTransactionlist').DataTable({
                        // dom: 'lBfrtip',
                        columnDefs: [{
                            type: 'date',
                            targets: 0
                        }],
                        "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        buttons: [{
                            extend: 'excelHtml5',
                            text: '',
                            download: 'open',
                            className: "btntabletocsv hiddenColumn",
                            filename: "Employee Transaction List - " + moment().format(),
                            orientation: 'portrait',
                            exportOptions: {
                                columns: ':visible'
                            }
                        }, {
                            extend: 'print',
                            download: 'open',
                            className: "btntabletopdf hiddenColumn",
                            text: '',
                            title: 'Sales Transaction',
                            filename: "Employee Transaction List - " + moment().format(),
                            exportOptions: {
                                columns: ':visible',
                                stripHtml: false
                            }
                        }],
                        select: true,
                        destroy: true,
                        colReorder: true,
                        pageLength: initialDatatableLoad,
                        lengthMenu: [
                            [initialDatatableLoad, -1],
                            [initialDatatableLoad, "All"]
                        ],
                        info: true,
                        responsive: true,
                        "order": [
                            [0, "asc"]
                        ],
                        action: function() {
                            $('#tblTransactionlist').DataTable().ajax.reload();
                        },
                        "fnDrawCallback": function(oSettings) {
                            setTimeout(function() {
                                MakeNegative();
                            }, 100);
                        },

                    }).on('page', function() {
                        setTimeout(function() {
                            MakeNegative();
                        }, 100);
                        let draftRecord = templateObject.datatablerecords.get();
                        templateObject.datatablerecords.set(draftRecord);
                    }).on('column-reorder', function() {});
                    $('.fullScreenSpin').css('display', 'none');
                }, 0);

                var columns = $('#tblTransactionlist th');
                let sTible = "";
                let sWidth = "";
                let sIndex = "";
                let sVisible = "";
                let columVisible = false;
                let sClass = "";
                $.each(columns, function(i, v) {
                    if (v.hidden == false) {
                        columVisible = true;
                    }
                    if ((v.className.includes("hiddenColumn"))) {
                        columVisible = false;
                    }
                    sWidth = v.style.width.replace('px', "");

                    let datatablerecordObj = {
                        sTitle: v.innerText || '',
                        sWidth: sWidth || '',
                        sIndex: v.cellIndex || 0,
                        sVisible: columVisible || false,
                        sClass: v.className || ''
                    };
                    tableHeaderList.push(datatablerecordObj);
                });
                templateObject.tableheaderrecords.set(tableHeaderList);
                $('div.dataTables_filter input').addClass('form-control form-control-sm');
                $('#tblTransactionlist tbody').on('click', 'tr', function() {
                    var listData = $(this).closest('tr').attr('id');
                    if (listData) {
                        window.open('/invoicecard?id=' + listData, '_self');
                    }
                });

            }).catch(function(err) {
                // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                $('.fullScreenSpin').css('display', 'none');
                // Meteor._reload.reload();
            });
        });

    }

    templateObject.getCountryData = function() {
        getVS1Data('TCountries').then(function(dataObject) {
            if (dataObject.length == 0) {
                sideBarService.getCountry().then((data) => {
                    for (let i = 0; i < data.tcountries.length; i++) {
                        countries.push(data.tcountries[i].Country)
                    }
                    countries.sort((a, b) => a.localeCompare(b));
                    templateObject.countryData.set(countries);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tcountries;
                for (let i = 0; i < useData.length; i++) {
                    countries.push(useData[i].Country)
                }
                countries.sort((a, b) => a.localeCompare(b));
                templateObject.countryData.set(countries);
            }
        }).catch(function(err) {
            sideBarService.getCountry().then((data) => {
                for (let i = 0; i < data.tcountries.length; i++) {
                    countries.push(data.tcountries[i].Country)
                }
                countries.sort((a, b) => a.localeCompare(b));
                templateObject.countryData.set(countries);
            });
        });
        let countriesPhone = [];
        let dataPhone = countryService.getCountryJeyhun();
        templateObject.phoneCodeData.set(dataPhone);
    };
    templateObject.getCountryData();

    templateObject.getEmployeeProfileImageData = function(employeeName) {
        contactService.getEmployeeProfileImageByName(employeeName).then((data) => {
            let employeeProfile = '';
            for (let i = 0; i < data.temployeepicture.length; i++) {

                if (data.temployeepicture[i].EmployeeName === employeeName) {
                    employeeProfile = data.temployeepicture[i].EncodedPic;
                    $('.imageUpload').attr('src', 'data:image/jpeg;base64,' + employeeProfile);
                    $('.cloudEmpImgID').val(data.temployeepicture[i].Id);
                }
            }
        });
    }



    templateObject.initData = async() => {
        await templateObject.loadAllProducts();

        if (currentId.id) await templateObject.getEmployeeProducts(employeeID);



    }

    templateObject.initData();

    if (currentId.id == "undefined") {
        currentDate = new Date();
        $('.fullScreenSpin').css('display', 'none');
        begunDate = moment(currentDate).format("DD/MM/YYYY");
        let lineItemObj = {
            id: '',
            lid: 'Add Employee',
            title: '',
            company: '',
            firstname: '',
            middlename: '',
            lastname: '',
            tfn: '',
            priority: 0,
            color: "#00a3d3",
            email: '',
            phone: '',
            mobile: '',
            fax: '',
            skype: '',
            gender: '',
            dob: begunDate || '',
            startdate: begunDate || '',
            datefinished: '',
            position: '',
            streetaddress: '',
            city: '',
            state: '',
            postalcode: '',
            country: LoggedCountry || '',
            custFld1: '',
            custFld2: '',
            dashboardOptions: '',
            salesQuota: 5000,
            website: '',
            isEmployee:true
        }

        templateObject.records.set(lineItemObj);
        setTimeout(function() {
            $('#tblTransactionlist').DataTable();
            $('.employeeTab').trigger('click');
            $('.fullScreenSpin').css('display', 'none');
        }, 100);

        setTimeout(function() {
            $("#dtStartingDate,#dtDOB,#dtTermninationDate,#dtAsOf").datepicker({
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
            $('.fullScreenSpin').css('display', 'none');
        }, 100);
    } else {
        if (!isNaN(currentId.id)) {
            employeeID = currentId.id;
            // templateObject.getAllSelectedProducts(employeeID);
            //templateObject.getEmployeeProducts(employeeID);
            templateObject.getEmployeeData = function() {
                getVS1Data('TEmployee').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        contactService.getOneEmployeeDataEx(employeeID).then(function(data) {
                            setEmployeeData(data);
                        });
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        let useData = data.temployee;
                        let added = false;
                        for (let i = 0; i < useData.length; i++) {
                            if (parseInt(useData[i].fields.ID) === parseInt(employeeID)) {
                                added = true;
                                setEmployeeData(useData[i]);
                            }
                        }
                        if (!added) {
                            contactService.getOneEmployeeDataEx(employeeID).then(function(data) {
                                setEmployeeData(data);
                            });
                        }
                    }
                }).catch(function(err) {
                    contactService.getOneEmployeeDataEx(employeeID).then(function(data) {
                        setEmployeeData(data);
                    });
                });
            }
            templateObject.getEmployeeData();
        } else {
            $('.fullScreenSpin').css('display', 'none');
            currentDate = new Date();
            begunDate = moment(currentDate).format("DD/MM/YYYY");
            let lineItemObj = {
                id: '',
                lid: 'Add Employee',
                title: '',
                firstname: '',
                middlename: '',
                lastname: '',
                company: '',
                tfn: '',
                priority: 0,
                email: '',
                phone: '',
                mobile: '',
                fax: '',
                skype: '',
                gender: '',
                dob: begunDate || '',
                startdate: begunDate || '',
                datefinished: '',
                position: '',
                streetaddress: '',
                city: '',
                state: '',
                postalcode: '',
                country: LoggedCountry || '',
                custFld1: '',
                custFld2: '',
                website: '',
                dashboardOptions: '',
                salesQuota: 5000,
                isEmployee:true
            }

            templateObject.records.set(lineItemObj);
            let emplineItems = [];
            let emplineItemObj = {};
            emplineItemObj = {
                empID: '',
                EmployeeName: '',
                LogonName: ''
            };
            emplineItems.push(emplineItemObj);
            templateObject.empuserrecord.set(emplineItems);

            if (currentId.addvs1user == "true") {
                // swal("Please fill in the employee details below.", "Please ensure the employee has a email and password.", "info");
                swal({
                    title: 'Please fill in the employee details below.',
                    text: 'Please ensure the employee has a email and password.',
                    type: 'info',
                    showCancelButton: false,
                    confirmButtonText: 'OK'
                }).then((result) => {
                    if (result.value) {
                        $('#cloudEmpEmailAddress').focus();
                    } else if (result.dismiss === 'cancel') {}
                });
                setTimeout(function() {
                    $('.employeeTab').trigger('click');
                    $('.addvs1usertab').trigger('click');
                    $('#cloudEmpEmailAddress').focus();
                    // var scrollBottom = $(document).height() - $(window).height() - $(window).scrollTop();
                    // window.scrollTo(scrollBottom);
                }, 100);

                // if((currentId.addvs1user == "true") && (currentId.id === "undefined")){

                // }
            } else {
                setTimeout(function() {
                    $('#tblTransactionlist').DataTable();
                    $('.fullScreenSpin').css('display', 'none');
                    $('.employeeTab').trigger('click');
                }, 100);
            }
            setTimeout(function() {
                $('#cloudEmpName').val('');
                $("#dtStartingDate,#dtDOB,#dtTermninationDate,#dtAsOf").datepicker({
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
                $("#addAllProducts").prop("checked", false);
                $('.activeProductEmployee').css('display', 'block');
                $('.fullScreenSpin').css('display', 'none');
            }, 100);
        }
    }


    function setEmployeeData(data) {
        $('.fullScreenSpin').css('display', 'none');
        let lineItems = [];
        let empEmail = '';
        let overideset = data.fields.CustFld14 || '';
        if (overideset != "") {
            overideset = !!(overideset = "true");
            $("#overridesettings").prop('checked', overideset);
        } else {
            $("#overridesettings").prop('checked', false);
        }
        if (data.fields.Email.replace(/\s/g, '') == '') {
            if (data.fields.User != null) {
                let emplineItems = [];
                let emplineItemObj = {};
                if (Array.isArray(data.fields.User)) {
                    empEmail = data.fields.User[0].fields.LogonName;
                    Session.setPersistent('cloudCurrentLogonName', data.fields.User[0].fields.LogonName);
                    emplineItemObj = {
                        empID: data.fields.User[0].fields.EmployeeId || '',
                        EmployeeName: data.fields.User[0].fields.EmployeeName || '',
                        LogonName: data.fields.User[0].fields.LogonName || '',
                        PasswordHash: data.fields.User[0].fields.LogonPassword || ''
                    };
                } else {
                    empEmail = data.fields.User.fields.LogonName;
                    Session.setPersistent('cloudCurrentLogonName', data.fields.User.fields.LogonName);
                    emplineItemObj = {
                        empID: data.fields.User.fields.EmployeeId || '',
                        EmployeeName: data.fields.User.fields.EmployeeName || '',
                        LogonName: data.fields.User.fields.LogonName || '',
                        PasswordHash: data.fields.User.fields.LogonPassword || ''
                    };
                }
                emplineItems.push(emplineItemObj);
                templateObject.empuserrecord.set(emplineItems);
            } else {
                let emplineItems = [];
                let emplineItemObj = {};
                emplineItemObj = {
                    empID: '',
                    EmployeeName: data.fields.EmployeeName,
                    LogonName: ''
                };
                emplineItems.push(emplineItemObj);
                templateObject.empuserrecord.set(emplineItems);
            }
        } else {
            empEmail = data.fields.Email;
            if (data.fields.User != null) {
                let emplineItems = [];
                let emplineItemObj = {};
                if (Array.isArray(data.fields.User)) {
                    Session.setPersistent('cloudCurrentLogonName', data.fields.User[0].fields.LogonName);
                    emplineItemObj = {
                        empID: data.fields.User[0].fields.EmployeeId || '',
                        EmployeeName: data.fields.User[0].fields.EmployeeName || '',
                        LogonName: data.fields.User[0].fields.LogonName || '',
                        PasswordHash: data.fields.User[0].fields.LogonPassword || ''
                    };
                } else {
                    Session.setPersistent('cloudCurrentLogonName', data.fields.User.fields.LogonName);
                    emplineItemObj = {
                        empID: data.fields.User.fields.EmployeeId || '',
                        EmployeeName: data.fields.User.fields.EmployeeName || '',
                        LogonName: data.fields.User.fields.LogonName || '',
                        PasswordHash: data.fields.User.fields.LogonPassword || ''
                    };
                }
                emplineItems.push(emplineItemObj);
                templateObject.empuserrecord.set(emplineItems);
            } else {
                let emplineItems = [];
                let emplineItemObj = {};
                emplineItemObj = {
                    empID: '',
                    EmployeeName: data.fields.EmployeeName,
                    LogonName: ''
                };
                emplineItems.push(emplineItemObj);
                templateObject.empuserrecord.set(emplineItems);
            }
        }

        let lineItemObj = {
            id: data.fields.ID,
            lid: 'Edit Employee',
            title: data.fields.Title || '',
            firstname: data.fields.FirstName || '',
            middlename: data.fields.MiddleName || '',
            lastname: data.fields.LastName || '',
            company: data.fields.EmployeeName || '',
            tfn: data.fields.TFN || '',
            priority: data.fields.CustFld5 || 0,
            color: data.fields.CustFld6 || "#00a3d3",
            email: empEmail || '',
            phone: data.fields.Phone || '',
            mobile: data.fields.Mobile || '',
            fax: data.fields.FaxNumber || '',
            skype: data.fields.SkypeName || '',
            gender: data.fields.Sex || '',
            dob: data.fields.DOB ? moment(data.fields.DOB).format('DD/MM/YYYY') : "",
            startdate: data.fields.DateStarted ? moment(data.fields.DateStarted).format('DD/MM/YYYY') : "",
            datefinished: data.fields.DateFinished ? moment(data.fields.DateFinished).format('DD/MM/YYYY') : "",
            position: data.fields.Position || '',
            streetaddress: data.fields.Street || '',
            city: data.fields.Street2 || '',
            state: data.fields.State || '',
            postalcode: data.fields.PostCode || '',
            country: data.fields.Country || LoggedCountry,
            custfield1: data.fields.CustFld1 || '',
            custfield2: data.fields.CustFld2 || '',
            custfield3: data.fields.CustFld3 || '',
            custfield4: data.fields.CustFld4 || '',
            custfield14: data.fields.CustFld14 || '',
            website: '',
            notes: data.fields.Notes || '',
            dashboardOptions: data.fields.CustFld11 || '',
            salesQuota: data.fields.CustFld12 || '',
            isEmployee:true,
        };
        templateObject.getEmployeeProfileImageData(data.fields.EmployeeName);

        templateObject.records.set(lineItemObj);
        setTimeout(function() {
            if (data.fields.CustFld7 == "true") {
                $("#productCostPayRate").prop("checked", true);
            } else {
                $("#productCostPayRate").prop("checked", false);
            }
            if (data.fields.CustFld8 == "true" || data.fields.CustFld8 == "") {
                $("#addAllProducts").prop("checked", true);
                $('.activeProductEmployee').css('display', 'none');
            } else {
                $("#addAllProducts").prop("checked", false);
                $('.activeProductEmployee').css('display', 'block');
            }
        }, 500);
        if (currentId.addvs1user == "true") {
            setTimeout(function() {
                $('.employeeTab').trigger('click');
                $('.addvs1usertab').trigger('click');
                $('#cloudEmpEmailAddress').focus();
            }, 100);
        }

        if ((currentId.addvs1user == "true") && (currentId.id)) {
            // swal("Please ensure the employee has a email and password.", "", "info");
            if (useData[i].fields.User != null) {
                swal({
                    title: 'User currently has an Existing Login.',
                    text: '',
                    type: 'info',
                    showCancelButton: false,
                    confirmButtonText: 'OK'
                }).then((result) => {
                    if (result.value) {
                        $('#cloudEmpEmailAddress').focus();
                        $('.modal-backdrop').css('display', 'none');
                    } else if (result.dismiss === 'cancel') {
                        $('.modal-backdrop').css('display', 'none');
                    }
                });
            } else {
                swal({
                    title: 'Please ensure the employee has a email and password.',
                    text: '',
                    type: 'info',
                    showCancelButton: false,
                    confirmButtonText: 'OK'
                }).then((result) => {
                    if (result.value) {
                        $('#cloudEmpEmailAddress').focus();
                        $('.modal-backdrop').css('display', 'none');
                    } else if (result.dismiss === 'cancel') {
                        $('.modal-backdrop').css('display', 'none');
                    }
                });
            }

        }
        /* START attachment */
        templateObject.attachmentCount.set(0);
        if (data.fields.Attachments) {
            if (data.fields.Attachments.length) {
                templateObject.attachmentCount.set(data.fields.Attachments.length);
                templateObject.uploadedFiles.set(data.fields.Attachments);
            }
        }
        /* END  attachment */

        //templateObject.getAllProductRecentTransactions(data.fields.EmployeeName);
        // $('.fullScreenSpin').css('display','none');
        setTimeout(function() {
            const rowCount = $('.results tbody tr').length;
            $('.counter').text(rowCount + ' items');
            $('#cloudEmpName').val(data.fields.EmployeeName);
            $("#dtStartingDate,#dtDOB,#dtTermninationDate,#dtAsOf").datepicker({
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
            // $('.fullScreenSpin').css('display','none');
        }, 500);
    }

    templateObject.getPreferedPaymentList = function() {
        getVS1Data('TPaymentMethod').then(function(dataObject) {
            if (dataObject.length == 0) {
                contactService.getPaymentMethodDataVS1().then((data) => {
                    for (let i = 0; i < data.tpaymentmethodvs1.length; i++) {
                        preferedPayments.push(data.tpaymentmethodvs1[i].fields.PaymentMethodName)
                    }
                    preferedPayments = _.sortBy(preferedPayments);
                    templateObject.preferedPaymentList.set(preferedPayments);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tpaymentmethodvs1;
                for (let i = 0; i < useData.length; i++) {
                    preferedPayments.push(useData[i].fields.PaymentMethodName)
                }
                preferedPayments = _.sortBy(preferedPayments);
                templateObject.preferedPaymentList.set(preferedPayments);
            }
        }).catch(function(err) {
            contactService.getPaymentMethodDataVS1().then((data) => {
                for (let i = 0; i < data.tpaymentmethodvs1.length; i++) {
                    preferedPayments.push(data.tpaymentmethodvs1[i].fields.PaymentMethodName)
                }
                preferedPayments = _.sortBy(preferedPayments);
                templateObject.preferedPaymentList.set(preferedPayments);
            });
        });
    };
    templateObject.getTermsList = function() {
        contactService.getTermDataVS1().then((data) => {
            for (let i = 0; i < data.ttermsvs1.length; i++) {
                terms.push(data.ttermsvs1[i].TermsName)
            }
            terms = _.sortBy(terms);
            templateObject.termsList.set(terms);
        });
    };

    templateObject.getDeliveryMethodList = function() {
        contactService.getShippingMethodData().then((data) => {
            for (let i = 0; i < data.tshippingmethod.length; i++) {
                deliveryMethods.push(data.tshippingmethod[i].ShippingMethod)
            }
            deliveryMethods = _.sortBy(deliveryMethods);
            templateObject.deliveryMethodList.set(deliveryMethods);
        });
    };

    templateObject.getTaxCodesList = function() {
        contactService.getTaxCodesVS1().then((data) => {
            for (let i = 0; i < data.ttaxcodevs1.length; i++) {
                taxCodes.push(data.ttaxcodevs1[i].CodeName)
            }
            taxCodes = _.sortBy(taxCodes);
            templateObject.taxCodeList.set(taxCodes);
        });
    };

    templateObject.getEmployeesList = function() {
        getVS1Data('TEmployee').then(function(dataObject) {

            if (dataObject.length == 0) {
                contactService.getAllEmployeeSideData().then(function(data) {
                    let lineItems = [];
                    let lineItemObj = {};
                    let totalUser = 0;
                    for (let i = 0; i < data.temployee.length; i++) {
                        let classname = '';
                        if (!isNaN(currentId.id)) {
                            if (useData[i].fields.ID == parseInt(currentId.id)) {
                                classname = 'currentSelect';
                            }
                        }
                        const dataList = {
                            id: data.temployee[i].fields.ID || '',
                            company: data.temployee[i].fields.EmployeeName || '',
                            classname: classname
                        };
                        if (data.temployee[i].fields.User != null) {
                            totalUser = i + 1;
                        }
                        if (data.temployee[i].fields.EmployeeName.replace(/\s/g, '') !== "") {
                            lineItems.push(dataList);
                        }
                    }

                    let cloudPackage = localStorage.getItem('vs1cloudlicenselevel');
                    if (cloudPackage === "Simple Start") {
                        templateObject.isUserAddition.set(true);
                    } else if ((cloudPackage === "Essentials") && (totalUser < 3)) {
                        templateObject.isUserAddition.set(false);
                    } else if ((cloudPackage === "PLUS") && (totalUser < 3)) {
                        templateObject.isUserAddition.set(false);
                    }
                    if (localStorage.getItem('EDatabase')) {
                        if (localStorage.getItem('EDatabase') == 'rapp_australia_pty_ltd') {
                            templateObject.isUserAddition.set(false);
                        }
                    }
                    templateObject.countUserCreated.set(totalUser);
                    templateObject.employeerecords.set(lineItems);

                    if (templateObject.employeerecords.get()) {

                        setTimeout(function() {
                            $('.counter').text(lineItems.length + ' items');

                        }, 100);
                    }

                }).catch(function(err) {});
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.temployee;
                let lineItems = [];
                let lineItemObj = {};
                let totalUser = 0;
                for (let i = 0; i < useData.length; i++) {
                    let classname = '';
                    if (!isNaN(currentId.id)) {
                        if (useData[i].fields.ID == parseInt(currentId.id)) {
                            classname = 'currentSelect';
                        }
                    }
                    const dataList = {
                        id: useData[i].fields.ID || '',
                        company: useData[i].fields.EmployeeName || '',
                        classname: classname
                    };
                    if (useData[i].fields.User != null) {
                        totalUser = i + 1;
                    }
                    if (useData[i].fields.EmployeeName.replace(/\s/g, '') !== "") {
                        lineItems.push(dataList);
                    }
                }
                let cloudPackage = localStorage.getItem('vs1cloudlicenselevel');
                if (cloudPackage === "Simple Start") {
                    templateObject.isUserAddition.set(true);
                } else if ((cloudPackage === "Essentials") && (totalUser < 3)) {
                    templateObject.isUserAddition.set(false);
                } else if ((cloudPackage === "PLUS") && (totalUser < 3)) {
                    templateObject.isUserAddition.set(false);
                }

                if (localStorage.getItem('EDatabase')) {
                    if (localStorage.getItem('EDatabase') == 'rapp_australia_pty_ltd') {
                        templateObject.isUserAddition.set(false);
                    }
                }
                templateObject.countUserCreated.set(totalUser);
                templateObject.employeerecords.set(lineItems);
                if (templateObject.employeerecords.get()) {
                    setTimeout(function() {
                        $('.counter').text(lineItems.length + ' items');
                    }, 100);
                }
            }
        }).catch(function(err) {
            contactService.getAllEmployeeSideData().then(function(data) {
                let lineItems = [];
                let lineItemObj = {};
                let totalUser = 0;
                for (let i = 0; i < data.temployee.length; i++) {
                    let classname = '';
                    if (!isNaN(currentId.id)) {
                        if (data.temployee[i].fields.ID == parseInt(currentId.id)) {
                            classname = 'currentSelect';
                        }
                    }
                    const dataList = {
                        id: data.temployee[i].fields.ID || '',
                        company: data.temployee[i].fields.EmployeeName || '',
                        classname: classname
                    };
                    if (data.temployee[i].fields.User != null) {
                        totalUser = i + 1;
                    }
                    if (data.temployee[i].fields.EmployeeName.replace(/\s/g, '') !== "") {
                        lineItems.push(dataList);
                    }
                }
                let cloudPackage = localStorage.getItem('vs1cloudlicenselevel');
                if (cloudPackage === "Simple Start") {
                    templateObject.isUserAddition.set(true);
                } else if ((cloudPackage === "Essentials") && (totalUser < 3)) {
                    templateObject.isUserAddition.set(false);
                } else if ((cloudPackage === "PLUS") && (totalUser < 3)) {
                    templateObject.isUserAddition.set(false);
                }
                if (localStorage.getItem('EDatabase')) {
                    if (localStorage.getItem('EDatabase') == 'rapp_australia_pty_ltd') {
                        templateObject.isUserAddition.set(false);
                    }
                }
                templateObject.countUserCreated.set(totalUser);
                templateObject.employeerecords.set(lineItems);
                if (templateObject.employeerecords.get()) {
                    setTimeout(function() {
                        $('.counter').text(lineItems.length + ' items');
                    }, 100);
                }
            }).catch(function(err) {});
        });
    }
    templateObject.getEmployeesList();

    // TODO: You should use this in the future to load employees list
    templateObject.loadEmployees = async(refresh = false) => {
        let data = await CachedHttp.get(
            erpObject.TEmployee,
            async() => {
                return await contactService.getAllEmployeeSideData();
            }, {
                useIndexDb: true,
                useLocalStorage: false,
                fallBackToLocal: true,
                forceOverride: refresh,
                validate: (cachedResponse) => {
                    return true; // this will validate and not do eny extra checks
                },
            }
        );

        data = data.response;

        let employees = data.temployee.map((e) => e.fields);

        await templateObject.employees.set(employees);
    }

    $(document).ready(function() {
        setTimeout(function() {
            $('#product-list').editableSelect();
            $('#edtDashboardOptions').editableSelect();
            $('#product-list').editableSelect()
            $('#editEmployeeTitle').editableSelect()
                .on('click.editable-select', function(e, li) {
                    const $earch = $(this);
                    const offset = $earch.offset();
                    const productDataName = e.target.value || '';
                    edtProductSelect = "appointment"
                    if (event.pageX > offset.left + $earch.width() - 10) { // X button 16px wide?
                        $('#productListModal').modal('toggle');
                    } else {
                        if (productDataName.replace(/\s/g, '') != '') {
                            let lineExtaSellItems = [];
                            let lineExtaSellObj = {};
                            LoadingOverlay.show();

                            getVS1Data('TProductWeb').then(function(dataObject) {
                                if (dataObject.length == 0) {
                                    sideBarService.getOneProductdatavs1byname(productDataName).then(function(data) {
                                        $('.fullScreenSpin').css('display', 'none');
                                        let lineItems = [];
                                        let lineItemObj = {};
                                        let currencySymbol = Currency;
                                        let totalquantity = 0;
                                        let productname = data.tproduct[0].fields.ProductName || '';
                                        let productcode = data.tproduct[0].fields.PRODUCTCODE || '';
                                        let productprintName = data.tproduct[0].fields.ProductPrintName || '';
                                        let assetaccount = data.tproduct[0].fields.AssetAccount || '';
                                        let buyqty1cost = utilityService.modifynegativeCurrencyFormat(data.tproduct[0].fields.BuyQty1Cost) || 0;
                                        let cogsaccount = data.tproduct[0].fields.CogsAccount || '';
                                        let taxcodepurchase = data.tproduct[0].fields.TaxCodePurchase || '';
                                        let purchasedescription = data.tproduct[0].fields.PurchaseDescription || '';
                                        let sellqty1price = utilityService.modifynegativeCurrencyFormat(data.tproduct[0].fields.SellQty1Price) || 0;
                                        let incomeaccount = data.tproduct[0].fields.IncomeAccount || '';
                                        let taxcodesales = data.tproduct[0].fields.TaxCodeSales || '';
                                        let salesdescription = data.tproduct[0].fields.SalesDescription || '';
                                        let active = data.tproduct[0].fields.Active;
                                        let lockextrasell = data.tproduct[0].fields.LockExtraSell || '';
                                        let customfield1 = data.tproduct[0].fields.CUSTFLD1 || '';
                                        let customfield2 = data.tproduct[0].fields.CUSTFLD2 || '';
                                        let barcode = data.tproduct[0].fields.BARCODE || '';
                                        $("#selectProductID").val(data.tproduct[0].fields.ID).trigger("change");
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

                                        setTimeout(function() {
                                            $('#newProductModal').modal('show');
                                        }, 500);
                                    }).catch(function(err) {

                                        $('.fullScreenSpin').css('display', 'none');
                                    });
                                } else {
                                    let data = JSON.parse(dataObject[0].data);
                                    let useData = data.tproductvs1;
                                    var added = false;

                                    for (let i = 0; i < data.tproductvs1.length; i++) {
                                        if (data.tproductvs1[i].fields.ProductName === productDataName) {
                                            added = true;
                                            $('.fullScreenSpin').css('display', 'none');
                                            let lineItems = [];
                                            let lineItemObj = {};
                                            let currencySymbol = Currency;
                                            let totalquantity = 0;

                                            let productname = data.tproductvs1[i].fields.ProductName || '';
                                            let productcode = data.tproductvs1[i].fields.PRODUCTCODE || '';
                                            let productprintName = data.tproductvs1[i].fields.ProductPrintName || '';
                                            let assetaccount = data.tproductvs1[i].fields.AssetAccount || '';
                                            let buyqty1cost = utilityService.modifynegativeCurrencyFormat(data.tproductvs1[i].fields.BuyQty1Cost) || 0;
                                            let cogsaccount = data.tproductvs1[i].fields.CogsAccount || '';
                                            let taxcodepurchase = data.tproductvs1[i].fields.TaxCodePurchase || '';
                                            let purchasedescription = data.tproductvs1[i].fields.PurchaseDescription || '';
                                            let sellqty1price = utilityService.modifynegativeCurrencyFormat(data.tproductvs1[i].fields.SellQty1Price) || 0;
                                            let incomeaccount = data.tproductvs1[i].fields.IncomeAccount || '';
                                            let taxcodesales = data.tproductvs1[i].fields.TaxCodeSales || '';
                                            let salesdescription = data.tproductvs1[i].fields.SalesDescription || '';
                                            let active = data.tproductvs1[i].fields.Active;
                                            let lockextrasell = data.tproductvs1[i].fields.LockExtraSell || '';
                                            let customfield1 = data.tproductvs1[i].fields.CUSTFLD1 || '';
                                            let customfield2 = data.tproductvs1[i].fields.CUSTFLD2 || '';
                                            let barcode = data.tproductvs1[i].fields.BARCODE || '';
                                            $("#selectProductID").val(data.tproductvs1[i].fields.ID).trigger("change");
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

                                            setTimeout(function() {
                                                $('#newProductModal').modal('show');
                                            }, 500);
                                        }
                                    }
                                    if (!added) {
                                        sideBarService.getOneProductdatavs1byname(productDataName).then(function(data) {
                                            $('.fullScreenSpin').css('display', 'none');
                                            let lineItems = [];
                                            let lineItemObj = {};
                                            let currencySymbol = Currency;
                                            let totalquantity = 0;
                                            let productname = data.tproduct[0].fields.ProductName || '';
                                            let productcode = data.tproduct[0].fields.PRODUCTCODE || '';
                                            let productprintName = data.tproduct[0].fields.ProductPrintName || '';
                                            let assetaccount = data.tproduct[0].fields.AssetAccount || '';
                                            let buyqty1cost = utilityService.modifynegativeCurrencyFormat(data.tproduct[0].fields.BuyQty1Cost) || 0;
                                            let cogsaccount = data.tproduct[0].fields.CogsAccount || '';
                                            let taxcodepurchase = data.tproduct[0].fields.TaxCodePurchase || '';
                                            let purchasedescription = data.tproduct[0].fields.PurchaseDescription || '';
                                            let sellqty1price = utilityService.modifynegativeCurrencyFormat(data.tproduct[0].fields.SellQty1Price) || 0;
                                            let incomeaccount = data.tproduct[0].fields.IncomeAccount || '';
                                            let taxcodesales = data.tproduct[0].fields.TaxCodeSales || '';
                                            let salesdescription = data.tproduct[0].fields.SalesDescription || '';
                                            let active = data.tproduct[0].fields.Active;
                                            let lockextrasell = data.tproduct[0].fields.LockExtraSell || '';
                                            let customfield1 = data.tproduct[0].fields.CUSTFLD1 || '';
                                            let customfield2 = data.tproduct[0].fields.CUSTFLD2 || '';
                                            let barcode = data.tproduct[0].fields.BARCODE || '';
                                            $("#selectProductID").val(data.tproduct[0].fields.ID).trigger("change");
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

                                            setTimeout(function() {
                                                $('#newProductModal').modal('show');
                                            }, 500);
                                        }).catch(function(err) {

                                            $('.fullScreenSpin').css('display', 'none');
                                        });
                                    }
                                }
                            }).catch(function(err) {

                                sideBarService.getOneProductdatavs1byname(productDataName).then(function(data) {
                                    $('.fullScreenSpin').css('display', 'none');
                                    let lineItems = [];
                                    let lineItemObj = {};
                                    let currencySymbol = Currency;
                                    let totalquantity = 0;
                                    let productname = data.tproduct[0].fields.ProductName || '';
                                    let productcode = data.tproduct[0].fields.PRODUCTCODE || '';
                                    let productprintName = data.tproduct[0].fields.ProductPrintName || '';
                                    let assetaccount = data.tproduct[0].fields.AssetAccount || '';
                                    let buyqty1cost = utilityService.modifynegativeCurrencyFormat(data.tproduct[0].fields.BuyQty1Cost) || 0;
                                    let cogsaccount = data.tproduct[0].fields.CogsAccount || '';
                                    let taxcodepurchase = data.tproduct[0].fields.TaxCodePurchase || '';
                                    let purchasedescription = data.tproduct[0].fields.PurchaseDescription || '';
                                    let sellqty1price = utilityService.modifynegativeCurrencyFormat(data.tproduct[0].fields.SellQty1Price) || 0;
                                    let incomeaccount = data.tproduct[0].fields.IncomeAccount || '';
                                    let taxcodesales = data.tproduct[0].fields.TaxCodeSales || '';
                                    let salesdescription = data.tproduct[0].fields.SalesDescription || '';
                                    let active = data.tproduct[0].fields.Active;
                                    let lockextrasell = data.tproduct[0].fields.LockExtraSell || '';
                                    let customfield1 = data.tproduct[0].fields.CUSTFLD1 || '';
                                    let customfield2 = data.tproduct[0].fields.CUSTFLD2 || '';
                                    let barcode = data.tproduct[0].fields.BARCODE || '';
                                    $("#selectProductID").val(data.tproduct[0].fields.ID).trigger("change");
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

                                    setTimeout(function() {
                                        $('#newProductModal').modal('show');
                                    }, 500);
                                }).catch(function(err) {
                                    $('.fullScreenSpin').css('display', 'none');
                                });

                            });

                            setTimeout(function() {
                                const begin_day_value = $('#event_begin_day').attr('value');
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
                                }).keyup(function(e) {
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
                                }).keyup(function(e) {
                                    if (e.keyCode == 8 || e.keyCode == 46) {
                                        $("#dtDateTo,#dtDateFrom").val('');
                                    }
                                });

                                $(".ui-datepicker .ui-state-hihglight").removeClass("ui-state-highlight");

                            }, 1000);
                            //}

                            templateObject.getProductClassQtyData = function() {
                                productService.getOneProductClassQtyData(currentProductID).then(function(data) {
                                    $('.fullScreenSpin').css('display', 'none');
                                    let qtylineItems = [];
                                    let qtylineItemObj = {};
                                    let currencySymbol = Currency;
                                    let totaldeptquantity = 0;

                                    for (let j in data.tproductclassquantity) {
                                        qtylineItemObj = {
                                            department: data.tproductclassquantity[j].DepartmentName || '',
                                            quantity: data.tproductclassquantity[j].InStockQty || 0,
                                        }
                                        totaldeptquantity += data.tproductclassquantity[j].InStockQty;
                                        qtylineItems.push(qtylineItemObj);
                                    }
                                    // $('#edttotalqtyinstock').val(totaldeptquantity);
                                    templateObject.productqtyrecords.set(qtylineItems);
                                    templateObject.totaldeptquantity.set(totaldeptquantity);

                                }).catch(function(err) {

                                    $('.fullScreenSpin').css('display', 'none');
                                });

                            }

                            //templateObject.getProductClassQtyData();
                            //templateObject.getProductData();
                        } else {
                            $('#productListModal').modal('toggle');

                            setTimeout(function() {
                                $('#tblInventoryPayrollService_filter .form-control-sm').focus();
                                $('#tblInventoryPayrollService_filter .form-control-sm').val('');
                                $('#tblInventoryPayrollService_filter .form-control-sm').trigger("input");

                                const datatable = $('#tblInventoryPayrollService').DataTable();
                                datatable.draw();
                                $('#tblInventoryPayrollService_filter .form-control-sm').trigger("input");

                            }, 500);
                        }

                    }
                });

            $('#edtDashboardOptions').editableSelect().on('click.editable-select', function(e, li) {
                const $earch = $(this);
                const offset = $earch.offset();
                const dashboardoptions = e.target.value || '';
                const dashboardDefaultoptions = $("#edtDashboardOptions").attr("defaultlogin") || 'Accounts';
                if (event.pageX > offset.left + $earch.width() - 10) { // X button 16px wide?
                    $('#dashboardOptionListModal').modal('toggle');
                } else {
                    if (dashboardoptions.replace(/\s/g, '') != '') {
                        $("input[name=optradioDL][value=" + dashboardDefaultoptions + "]").attr('checked', 'checked');
                        $('#dashboardOptionListModal').modal('toggle');
                    } else {
                        $('#dashboardOptionListModal').modal('toggle');

                        setTimeout(function() {
                            $('#tblDashboardOptions_filter .form-control-sm').focus();
                            $('#tblDashboardOptions_filter .form-control-sm').val('');
                            $('#tblDashboardOptions_filter .form-control-sm').trigger("input");
                            $('#tblDashboardOptions_filter .form-control-sm').trigger("input");

                        }, 500);
                    }

                }
            });
        }, 1000)

        //On Click Client Type List
        $(document).on("click", "#tblInventoryService tbody tr", function(e) {
            const table = $(this);
            if (edtProductSelect == "appointment") {
                let productName = table.find(".productName").text() || '';
                let productID = table.find(".colProuctPOPID").text() || '';
                $('#product-list').val(productName);
                $('#product-listID').val(productID);
                $('#productListModal').modal('toggle');
            }
        });

        $(document).on("click", "#tblDashboardOptions tbody tr .colOptionsName", function(e) {
            const tblDashboardOptions = $(this);
            var listData = $(this).closest("tr").attr("id");
            var optionName = $(event.target).closest("tr").find(".colOptionsName").text() || 'All';
            let isDefaultLogin = $("input[name=optradioDL]:checked").val() || "Accounts";
            $('#edtDashboardOptions').val(optionName);
            $('#edtDashboardOptions').attr("defaultlogin", isDefaultLogin);
            $('#dashboardOptionListModal').modal('toggle');
        });
        $(document).on("click", "#tblTitleList tbody tr", function (e) {
            $('#editEmployeeTitle').val($(this).find(".colTypeName").text());
            $('#employeeTitlePopModal').modal('toggle');
        });
    });

    $(document).on('click', '#editEmployeeTitle', function(e, li) {
        const $earch = $(this);
        const offset = $earch.offset();
        if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
            $('#employeeTitlePopModal').modal('toggle');
        } else {
            $('#employeeTitlePopModal').modal();
        }
    });

    let prefObject = "";
    if (currentId.id != undefined) {
        setTimeout(function() {
            appointmentService.getEmployeeCalendarSettings(currentId.id).then(function(data) {
                if (data.tappointmentpreferences.length > 0) {
                    prefObject = {
                        id: data.tappointmentpreferences[data.tappointmentpreferences.length - 1].Id || '',
                        defaultProduct: data.tappointmentpreferences[data.tappointmentpreferences.length - 1].DefaultServiceProduct || '',
                        defaultProductID: data.tappointmentpreferences[data.tappointmentpreferences.length - 1].DefaultServiceProductID || '',
                        showSat: data.tappointmentpreferences[data.tappointmentpreferences.length - 1].ShowSaturdayinApptCalendar || false,
                        showSun: data.tappointmentpreferences[data.tappointmentpreferences.length - 1].ShowSundayinApptCalendar || false,
                        defaultApptDuration: data.tappointmentpreferences[data.tappointmentpreferences.length - 1].DefaultApptDuration || '',
                    }
                    $("#showSaturday").prop('checked', prefObject.showSat);
                    $("#showSunday").prop('checked', prefObject.showSun);
                    if (prefObject.defaultProduct) {
                        //$('#product-list').prepend('<option selected value=' + prefObject.id + '>' + prefObject.defaultProduct + '</option>');
                        $('#product-list').val(prefObject.defaultProduct);
                        $('#product-listID').val(prefObject.id);
                    }
                    if (prefObject.defaultApptDuration) {
                        if (prefObject.defaultApptDuration == "120") {
                            $('#defaultTime').prepend('<option selected>' + 2 + ' Hour</option>');
                        } else {
                            $('#defaultTime').prepend('<option selected>' + prefObject.defaultApptDuration + ' Hour</option>');
                        }
                    }
                }
                templateObject.calendarOptions.set(prefObject);
            }).catch(function(err) {});
        }, 1000);
    }

    templateObject.savePaySlipLocalDB = async function() {
        const employeePayrolApis = new EmployeePayrollApi();
        // now we have to make the post request to save the data in database
        const employeePayrolEndpoint = employeePayrolApis.collection.findByName(
            employeePayrolApis.collectionNames.TPaySlips
        );

        employeePayrolEndpoint.url.searchParams.append(
            "ListType",
            "'Detail'"
        );
        const employeePayrolEndpointResponse = await employeePayrolEndpoint.fetch(); // here i should get from database all charts to be displayed

        if (employeePayrolEndpointResponse.ok == true) {
            const employeePayrolEndpointJsonResponse = await employeePayrolEndpointResponse.json();
            if (employeePayrolEndpointJsonResponse.tpayslips.length) {
                await addVS1Data('TPaySlips', JSON.stringify(employeePayrolEndpointJsonResponse))
            }
            return employeePayrolEndpointJsonResponse
        }
        return '';
    };

    templateObject.saveLeaveRequestLocalDB = async function() {
        const employeePayrolApis = new EmployeePayrollApi();
        // now we have to make the post request to save the data in database
        const employeePayrolEndpoint = employeePayrolApis.collection.findByName(
            employeePayrolApis.collectionNames.TLeavRequest
        );

        employeePayrolEndpoint.url.searchParams.append(
            "ListType",
            "'Detail'"
        );
        const employeePayrolEndpointResponse = await employeePayrolEndpoint.fetch(); // here i should get from database all charts to be displayed

        if (employeePayrolEndpointResponse.ok == true) {
            const employeePayrolEndpointJsonResponse = await employeePayrolEndpointResponse.json();
            if (employeePayrolEndpointJsonResponse.tleavrequest.length) {
                await addVS1Data('TLeavRequest', JSON.stringify(employeePayrolEndpointJsonResponse))
            }
            return employeePayrolEndpointJsonResponse
        }
        return '';
    };
    templateObject.saveAssignLeaveLocalDB = async function() {
        const employeePayrolApis = new EmployeePayrollApi();
        // now we have to make the post request to save the data in database
        let employeePayrolEndpoint = {};
        employeePayrolEndpoint = employeePayrolApis.collection.findByName(
            employeePayrolApis.collectionNames.TAssignLeaveType
        );

        employeePayrolEndpoint.url.searchParams.append(
            "ListType",
            "'Detail'"
        );
        const employeePayrolEndpointResponse = await employeePayrolEndpoint.fetch(); // here i should get from database all charts to be displayed
        if (employeePayrolEndpointResponse.ok == true) {
            const employeePayrolEndpointJsonResponse = await employeePayrolEndpointResponse.json();
            if (employeePayrolEndpointJsonResponse.tassignleavetype.length) {
                await addVS1Data('TAssignLeaveType', JSON.stringify(employeePayrolEndpointJsonResponse))
            }
            return employeePayrolEndpointJsonResponse
        }
        return '';
    };

    templateObject.getLeaveRequests = async() => {
        let data = []
        let dataObject = await getVS1Data('TLeavRequest')
        if (dataObject.length == 0) {
            data = await templateObject.saveLeaveRequestLocalDB();
        } else {
            data = JSON.parse(dataObject[0].data);
        }
        let splashArrayList = [];
        if (data.tleavrequest.length > 0) {
            let useData = LeaveRequest.fromList(
                data.tleavrequest
            ).filter((item) => {
                if (parseInt(item.fields.EmployeeID) == parseInt(employeeID)) {
                    return item;
                }
            });
            for (let i = 0; i < useData.length; i++) {
                let dataListAllowance = [
                    useData[i].fields.ID || '',
                    useData[i].fields.Description || '',
                    useData[i].fields.PayPeriod || '',
                    useData[i].fields.LeaveMethod || '',
                    useData[i].fields.Status || '',
                    (useData[i].fields.Status == 'Deleted') ? '' : `<button type="button" class="btn btn-danger btn-rounded removeLeaveRequest smallFontSizeBtn" data-id="${useData[i].fields.ID}" autocomplete="off"><i class="fa fa-remove"></i></button>`
                ];
                splashArrayList.push(dataListAllowance);
            }
        }

        setTimeout(function() {
            $('#tblLeaveRequests').DataTable({
                data: splashArrayList,
                "sDom": "Rlfrtip",
                columnDefs: [

                    {
                        className: "colLRID colLeaveRequest hiddenColumn",
                        "targets": [0]
                    },
                    {
                        className: "colLeaveRequest colLRDescription",
                        "targets": [1]
                    },
                    {
                        className: "colLeaveRequest colLRLeavePeriod",
                        "targets": [2]
                    },
                    {
                        className: "colLeaveRequest colLRLeaveType",
                        "targets": [3]
                    },
                    {
                        className: "colLeaveRequest colLRStatus",
                        "targets": [4]
                    },
                    {
                        className: "colLRAction",
                        "targets": [5]
                    }
                ],
                select: true,
                destroy: true,
                colReorder: true,
                pageLength: initialDatatableLoad,
                lengthMenu: [
                    [initialDatatableLoad, -1],
                    [initialDatatableLoad, "All"]
                ],
                info: true,
                responsive: true,
                "order": [
                    [0, "asc"]
                ],
                action: function() {
                    $('#tblLeaveRequests').DataTable().ajax.reload();
                },
                "fnDrawCallback": function(oSettings) {
                    $('.paginate_button.page-item').removeClass('disabled');
                    $('#tblLeaveRequests_ellipsis').addClass('disabled');
                    if (oSettings._iDisplayLength == -1) {
                        if (oSettings.fnRecordsDisplay() > 150) {

                        }
                    } else {

                    }
                    if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                        $('.paginate_button.page-item.next').addClass('disabled');
                    }

                    $('.paginate_button.next:not(.disabled)', this.api().table().container())
                        .on('click', function() {
                            LoadingOverlay.show();

                            var splashArrayList = new Array();
                            let dataLenght = oSettings._iDisplayLength;
                            let customerSearch = $('#tblLeaveRequests_filter input').val();

                            sideBarService.getLeaveRequestList(initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(useData) {
                                for (let i = 0; i < useData.length; i++) {
                                    let dataListAllowance = [
                                        useData[i].fields.ID || '',
                                        useData[i].fields.Description || '',
                                        useData[i].fields.PayPeriod || '',
                                        useData[i].fields.LeaveMethod || '',
                                        useData[i].fields.Status || '',
                                        (useData[i].fields.Status == 'Deleted') ? '' : `<button type="button" class="btn btn-danger btn-rounded btn-sm removeLeaveRequest" data-id="${useData[i].fields.ID}" style="margin-bottom: 24px;" autocomplete="off"><i class="fa fa-remove"></i></button>`
                                    ];
                                    splashArrayList.push(dataListAllowance);
                                }

                                let uniqueChars = [...new Set(splashArrayList)];
                                var datatable = $('#tblLeaveRequests').DataTable();
                                datatable.clear();
                                datatable.rows.add(uniqueChars);
                                datatable.draw(false);
                                setTimeout(function() {
                                    $("#tblLeaveRequests").dataTable().fnPageChange('last');
                                }, 400);

                                $('.fullScreenSpin').css('display', 'none');


                            }).catch(function(err) {
                                $('.fullScreenSpin').css('display', 'none');
                            });

                        });
                    setTimeout(function() {
                        MakeNegative();
                    }, 100);
                },
                "fnInitComplete": function() {
                    $("<button class='btn btn-primary btnLeaveRequestBtn' data-dismiss='modal' data-toggle='modal' data-target='#newLeaveRequestModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblLeaveRequests_filter");
                    $("<button class='btn btn-primary btnRefreshLeaveRequest' type='button' id='btnRefreshLeaveRequest' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblLeaveRequests_filter");
                }

            }).on('page', function() {
                setTimeout(function() {
                    MakeNegative();
                }, 100);

            }).on('column-reorder', function() {

            }).on('length.dt', function(e, settings, len) {
                //LoadingOverlay.show();

                let dataLenght = settings._iDisplayLength;
                let splashArrayPayNotesList = [];
                if (dataLenght == -1) {
                    $('.fullScreenSpin').css('display', 'none');

                } else {
                    if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
                        $('.fullScreenSpin').css('display', 'none');
                    } else {
                        sideBarService.getLeaveRequestList(dataLenght, 0).then(function(dataNonBo) {

                            addVS1Data('TLeavRequest', JSON.stringify(dataNonBo)).then(function(datareturn) {
                                // templateObject.resetData(dataNonBo);
                                $('.fullScreenSpin').css('display', 'none');
                            }).catch(function(err) {
                                $('.fullScreenSpin').css('display', 'none');
                            });
                        }).catch(function(err) {
                            $('.fullScreenSpin').css('display', 'none');
                        });
                    }
                }
                setTimeout(function() {
                    MakeNegative();
                }, 1000);
            });
        }, 1000);
    };
    templateObject.getLeaveRequests();

    templateObject.saveNotesLocalDB = async function() {
        const employeePayrolApis = new EmployeePayrollApi();
        // now we have to make the post request to save the data in database
        const employeePayrolEndpoint = employeePayrolApis.collection.findByName(
            employeePayrolApis.collectionNames.TPayNotes
        );
        employeePayrolEndpoint.url.searchParams.append(
            "ListType",
            "'Detail'"
        );
        const employeePayrolEndpointResponse = await employeePayrolEndpoint.fetch(); // here i should get from database all charts to be displayed

        if (employeePayrolEndpointResponse.ok == true) {
            const employeePayrolEndpointJsonResponse = await employeePayrolEndpointResponse.json();
            if (employeePayrolEndpointJsonResponse.tpaynotes.length) {
                await addVS1Data('TPayNotes', JSON.stringify(employeePayrolEndpointJsonResponse))
            }
            return employeePayrolEndpointJsonResponse
        }
        return '';
    };

    templateObject.getPayNotesTypes = async() => {

        let dataObject = await getVS1Data('TPayNotes');
        let TPayNotesData;
        if (dataObject.length == 0) {
            TPayNotesData = await templateObject.saveNotesLocalDB();
        } else {
            TPayNotesData = JSON.parse(dataObject[0].data);
        }
        let useData = PayNotes.fromList(
            TPayNotesData.tpaynotes
        ).filter((item) => {
            if (parseInt(item.fields.EmployeeID) == parseInt(employeeID) && item.fields.Active == true) {
                return item;
            }
        });
        let splashArrayPayNotesList = [];
        for (let i = 0; i < useData.length; i++) {
            let dataListAllowance = [
                useData[i].fields.ID || '',
                (useData[i].fields.CreatedAt == 0) ? '' : moment(useData[i].fields.CreatedAt).format("DD/MM/YYYY") || '',
                useData[i].fields.UserName || '',
                useData[i].fields.Notes || '',
                `<button type="button" class="btn btn-danger btn-rounded btn-sm btnDeletePayNote" data-id="${useData[i].fields.ID}" style="margin: 0;" autocomplete="off"><i class="fa fa-remove"></i></button>`
            ];
            splashArrayPayNotesList.push(dataListAllowance);
        }
        setTimeout(function() {
            $('#tblEmpPayrollNotes').DataTable({
                data: splashArrayPayNotesList,
                "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                columnDefs: [

                    {
                        className: "colEmpPayrollNotes colEmpPayrollNotesID hiddenColumn",
                        "targets": [0]
                    },
                    {
                        className: "colEmpPayrollNotes colEmpPayrollNotesDate",
                        "targets": [1]
                    },
                    {
                        className: "colEmpPayrollNotes colEmpPayrollNotesUser",
                        "targets": [2]
                    },
                    {
                        className: "colEmpPayrollNotes colEmpPayrollNotesDesc",
                        "targets": [3]
                    },
                    {
                        className: "colEmpPayrollDeleteEdit",
                        "targets": [4]
                    }
                ],
                select: true,
                destroy: true,
                colReorder: true,
                pageLength: initialDatatableLoad,
                lengthMenu: [
                    [initialDatatableLoad, -1],
                    [initialDatatableLoad, "All"]
                ],
                info: true,
                responsive: true,
                "order": [
                    [0, "asc"]
                ],
                action: function() {
                    $('#tblEmpPayrollNotes').DataTable().ajax.reload();
                },
                "fnDrawCallback": function(oSettings) {
                    $('.paginate_button.page-item').removeClass('disabled');
                    $('#tblEmpPayrollNotes_ellipsis').addClass('disabled');
                    if (oSettings._iDisplayLength == -1) {
                        if (oSettings.fnRecordsDisplay() > 150) {

                        }
                    } else {

                    }
                    if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                        $('.paginate_button.page-item.next').addClass('disabled');
                    }

                    $('.paginate_button.next:not(.disabled)', this.api().table().container())
                        .on('click', function() {
                            LoadingOverlay.show();

                            var splashArrayPayNotesListDupp = new Array();
                            let dataLenght = oSettings._iDisplayLength;
                            let customerSearch = $('#tblEmpPayrollNotes_filter input').val();

                            sideBarService.getPayNotes(initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(data) {

                                for (let i = 0; i < useData.length; i++) {
                                    let dataListAllowance = [
                                        useData[i].fields.ID || '',
                                        (useData[i].fields.CreatedAt == 0) ? '' : moment(useData[i].fields.CreatedAt).format("DD/MM/YYYY") || '',
                                        useData[i].fields.UserName || '',
                                        useData[i].fields.Notes || '',
                                        `<button type="button" class="btn btn-danger btn-rounded btn-sm btnDeletePayNote" data-id="${useData[i].fields.ID}" style="margin: 0;" autocomplete="off"><i class="fa fa-remove"></i></button>`
                                    ];
                                    splashArrayPayNotesList.push(dataListAllowance);
                                }

                                let uniqueChars = [...new Set(splashArrayPayNotesList)];
                                var datatable = $('#tblEmpPayrollNotes').DataTable();
                                datatable.clear();
                                datatable.rows.add(uniqueChars);
                                datatable.draw(false);
                                setTimeout(function() {
                                    $("#tblEmpPayrollNotes").dataTable().fnPageChange('last');
                                }, 400);

                                $('.fullScreenSpin').css('display', 'none');


                            }).catch(function(err) {
                                $('.fullScreenSpin').css('display', 'none');
                            });

                        });
                    setTimeout(function() {
                        MakeNegative();
                    }, 100);
                },
                "fnInitComplete": function() {
                    $("<button class='btn btn-primary btnAddNewNotes' data-dismiss='modal' data-toggle='modal' data-target='#newNoteModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblEmpPayrollNotes_filter");
                    $("<button class='btn btn-primary btnRefreshPayNotes' type='button' id='btnRefreshPayNotes' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblEmpPayrollNotes_filter");
                }

            }).on('page', function() {
                setTimeout(function() {
                    MakeNegative();
                }, 100);

            }).on('column-reorder', function() {

            }).on('length.dt', function(e, settings, len) {
                //LoadingOverlay.show();

                let dataLenght = settings._iDisplayLength;
                splashArrayPayNotesList = [];
                if (dataLenght == -1) {
                    $('.fullScreenSpin').css('display', 'none');

                } else {
                    if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
                        $('.fullScreenSpin').css('display', 'none');
                    } else {
                        sideBarService.getPayNotes(dataLenght, 0).then(function(dataNonBo) {

                            addVS1Data('TPayNotes', JSON.stringify(dataNonBo)).then(function(datareturn) {
                                // templateObject.resetData(dataNonBo);
                                $('.fullScreenSpin').css('display', 'none');
                            }).catch(function(err) {
                                $('.fullScreenSpin').css('display', 'none');
                            });
                        }).catch(function(err) {
                            $('.fullScreenSpin').css('display', 'none');
                        });
                    }
                }
            });
        }, 1000);
    };
    templateObject.getPayNotesTypes();

    templateObject.filterPayTemplates = function(type) {
        let currentId = FlowRouter.current().queryParams;
        let employeeID = (!isNaN(currentId.id)) ? currentId.id : 0;

        if (type == "earningLines") {
            let payTemplateEarningLines = [];
            let checkPayTemplateEarningLine = templateObject.payTemplateEarningLineInfo.get();
            if (Array.isArray(checkPayTemplateEarningLine) && checkPayTemplateEarningLine.length > 0) {
                payTemplateEarningLines = checkPayTemplateEarningLine.filter((item) => {
                    if (parseInt(item.EmployeeID) == parseInt(employeeID) && item.Active == true) {
                        return item;
                    }
                });
            }
            return payTemplateEarningLines;
        }

        if (type == "deductionLines") {
            let payTemplateDeductionLines = [];
            let checkPayTemplateDeductionLine = templateObject.payTemplateDeductionLineInfo.get();
            if (Array.isArray(checkPayTemplateDeductionLine)) {
                payTemplateDeductionLines = PayTemplateDeductionLine.fromList(
                    checkPayTemplateDeductionLine
                ).filter((item) => {
                    if (parseInt(item.EmployeeID) == parseInt(employeeID) && item.Active == true) {
                        return item;
                    }
                });
            }
            return payTemplateDeductionLines;
        }
        if (type == "superannuationLines") {
            let payTemplateSuperannuationLines = [];
            let checkPayTemplateSuperannuationLine = templateObject.payTemplateSuperannuationLineInfo.get();
            if (Array.isArray(checkPayTemplateSuperannuationLine)) {
                payTemplateSuperannuationLines = PayTemplateSuperannuationLine.fromList(
                    checkPayTemplateSuperannuationLine
                ).filter((item) => {
                    if (parseInt(item.EmployeeID) == parseInt(employeeID) && item.Active == true) {
                        return item;
                    }
                });
            }
            return payTemplateSuperannuationLines;

        }
        if (type == "reiumbursementLines") {
            let payTemplateReiumbursementLines = [];
            let checkPayTemplateReiumbursementLine = templateObject.payTemplateReiumbursementLineInfo.get();
            if (Array.isArray(checkPayTemplateReiumbursementLine)) {
                payTemplateReiumbursementLines = PayTemplateReiumbursementLine.fromList(
                    checkPayTemplateReiumbursementLine
                ).filter((item) => {
                    if (parseInt(item.EmployeeID) == parseInt(employeeID) && item.Active == true) {
                        return item;
                    }
                });
            }
            return payTemplateReiumbursementLines;
        }
    };

    /**
     *
     * @param {integer} employeeID
     * @param {boolean} refresh
     * @returns {object[]} earnings
     */
    templateObject.getEarnings = async(employeeID = null, refresh = false) => {
        let data = await CachedHttp.get(erpObject.TPayTemplateEarningLine, async() => {
            const employeePayrolApis = new EmployeePayrollApi();
            const employeePayrolEndpoint = employeePayrolApis.collection.findByName(
                employeePayrolApis.collectionNames.TPayTemplateEarningLine
            );
            employeePayrolEndpoint.url.searchParams.append(
                "ListType",
                "'Detail'"
            );

            const response = await employeePayrolEndpoint.fetch();
            if (response.ok == true) {
                return await response.json();
            }
            return null;
        }, {
            useIndexDb: true,
            useLocalStorage: false,
            forceOverride: refresh,
            validate: (cachedResponse) => {
                return false;
            }
        });

        let response = data.response;

        let earningLines = response.tpaytemplateearningline.map((earning) => earning.fields);
        if (employeeID) {
            earningLines = earningLines.filter((item) => parseInt(item.EmployeeID) == parseInt(employeeID));
        }


        await templateObject.earningLines.set(earningLines);

        return earningLines;
    }

    templateObject.saveEarningLocalDB = async function() {
        const employeePayrolApis = new EmployeePayrollApi();
        // now we have to make the post request to save the data in database
        const employeePayrolEndpoint = employeePayrolApis.collection.findByName(
            employeePayrolApis.collectionNames.TPayTemplateEarningLine
        );
        employeePayrolEndpoint.url.searchParams.append(
            "ListType",
            "'Detail'"
        );
        const employeePayrolEndpointResponse = await employeePayrolEndpoint.fetch(); // here i should get from database all charts to be displayed
        if (employeePayrolEndpointResponse.ok == true) {
            const employeePayrolEndpointJsonResponse = await employeePayrolEndpointResponse.json();
            if (employeePayrolEndpointJsonResponse.tpaytemplateearningline.length) {
                await addVS1Data('TPayTemplateEarningLine', JSON.stringify(employeePayrolEndpointJsonResponse))
            }
            return employeePayrolEndpointJsonResponse
        }
        return '';
    };

    templateObject.getPayEarningLines = async function() {
        let earningLines = await templateObject.getEarnings(employeeID);
        // let dataObject = await getVS1Data('TPayTemplateEarningLine')
        // if (dataObject.length == 0) {
        //     data = await templateObject.saveEarningLocalDB();
        // } else {
        //     data = JSON.parse(dataObject[0].data);
        // }

        // let useData = PayTemplateEarningLine.fromList(
        //     data.tpaytemplateearningline
        // ).filter((item) => {
        //     if (parseInt( item.EmployeeID ) == parseInt( employeeID ) ) {
        //         return item;
        //     }
        // });

        await templateObject.payTemplateEarningLineInfo.set(earningLines);
        await templateObject.setEarningLineDropDown();
        // if( earningLines.length ){
        //     setTimeout(function () {
        //         Array.prototype.forEach.call(earningLines, (item) => {
        //             $(`#ptEarningRate${item.ID}`).val( item.EarningRate );
        //             $(`#ptEarningAmount${item.ID}`).val( utilityService.modifynegativeCurrencyFormat(item.Amount)|| 0.00 );
        //         })
        //     }, 500);
        // }

    };

    templateObject.getPayEarningLines();

    templateObject.saveDeductionLocalDB = async function() {
        const employeePayrolApis = new EmployeePayrollApi();
        // now we have to make the post request to save the data in database
        const employeePayrolEndpoint = employeePayrolApis.collection.findByName(
            employeePayrolApis.collectionNames.TPayTemplateDeductionLine
        );
        employeePayrolEndpoint.url.searchParams.append(
            "ListType",
            "'Detail'"
        );
        const employeePayrolEndpointResponse = await employeePayrolEndpoint.fetch(); // here i should get from database all charts to be displayed
        if (employeePayrolEndpointResponse.ok == true) {
            const employeePayrolEndpointJsonResponse = await employeePayrolEndpointResponse.json();
            if (employeePayrolEndpointJsonResponse.tpaytemplatedeductionline.length) {
                await addVS1Data('TPayTemplateDeductionLine', JSON.stringify(employeePayrolEndpointJsonResponse))
            }
            return employeePayrolEndpointJsonResponse
        }
        return '';
    };
    templateObject.getPayDeducitonLines = async function() {
        let data = [];
        let dataObject = await getVS1Data('TPayTemplateDeductionLine')
        if (dataObject.length == 0) {
            data = await templateObject.saveDeductionLocalDB();
        } else {
            data = JSON.parse(dataObject[0].data);
        }
        let useData = PayTemplateDeductionLine.fromList(
            data.tpaytemplatedeductionline
        ).filter((item) => {
            if (parseInt(item.fields.EmployeeID) == parseInt(employeeID)) {
                return item;
            }
        });
        await templateObject.payTemplateDeductionLineInfo.set(useData);
        await templateObject.setDeductionLineDropDown();
        if (useData.length) {
            setTimeout(function() {
                Array.prototype.forEach.call(useData, (item) => {
                    let amount = item.fields.Amount;
                    if (isNaN(amount) || !amount) {
                        amount = (amount === undefined || amount === null || amount == '') ? 0 : item.fields.Amount;
                        amount = (amount) ? Number(amount.replace(/[^0-9.-]+/g, "")) : 0;
                    }
                    $(`#ptDeductionType${item.fields.ID}`).val(item.fields.DeductionType);
                    $(`#ptDeductionAmount${item.fields.ID}`).val(utilityService.modifynegativeCurrencyFormat(amount) || 0.00);
                    let percentage = (item.fields.Percentage === undefined || item.fields.Percentage === null || item.fields.Percentage.length === 0) ? 0 : item.fields.Percentage;
                    let percentVal = (percentage) ? Number(percentage.replace(/[^0-9.-]+/g, "")) : 0;
                    $(`#ptDeductionPercentage${item.fields.ID}`).val(`${parseFloat(percentVal).toFixed(2)}%`);
                })
            }, 500);
        }

    };

    templateObject.getPayDeducitonLines();

    templateObject.saveSuperannuationLocalDB = async function() {
        const employeePayrolApis = new EmployeePayrollApi();
        // now we have to make the post request to save the data in database
        const employeePayrolEndpoint = employeePayrolApis.collection.findByName(
            employeePayrolApis.collectionNames.TPayTemplateSuperannuationLine
        );

        employeePayrolEndpoint.url.searchParams.append(
            "ListType",
            "'Detail'"
        );

        const employeePayrolEndpointResponse = await employeePayrolEndpoint.fetch(); // here i should get from database all charts to be displayed

        if (employeePayrolEndpointResponse.ok == true) {
            const employeePayrolEndpointJsonResponse = await employeePayrolEndpointResponse.json();
            if (employeePayrolEndpointJsonResponse.tpaytemplatesuperannuationline.length) {
                await addVS1Data('TPayTemplateSuperannuationLine', JSON.stringify(employeePayrolEndpointJsonResponse))
            }
            return employeePayrolEndpointJsonResponse
        }
        return '';
    };

    templateObject.getPaySuperannuationLines = async function() {
        let data = [];
        let dataObject = await getVS1Data('TPayTemplateSuperannuationLine')
        if (dataObject.length == 0) {
            data = await templateObject.saveSuperannuationLocalDB();
        } else {
            data = JSON.parse(dataObject[0].data);
        }
        let useData = PayTemplateSuperannuationLine.fromList(
            data.tpaytemplatesuperannuationline
        ).filter((item) => {
            if (parseInt(item.fields.EmployeeID) == parseInt(employeeID)) {
                return item;
            }
        });
        await templateObject.payTemplateSuperannuationLineInfo.set(useData);
        await templateObject.setSuperannuationDropDown();

        if (useData.length) {
            setTimeout(function() {
                Array.prototype.forEach.call(useData, (item) => {
                    $(`#ptSuperannuationFund${item.fields.ID}`).val(item.fields.Fund);
                    $(`#ptSuperannuationAmount${item.fields.ID}`).val(utilityService.modifynegativeCurrencyFormat(item.fields.Amount) || 0.00);
                    $(`#ptSuperannuationPercentage${item.fields.ID}`).val(`${parseFloat(item.fields.Percentage).toFixed(2)}%`);
                })
            }, 500);
        }

    };

    templateObject.getPaySuperannuationLines();

    templateObject.saveReiumbursementDB = async function() {
        const employeePayrolApis = new EmployeePayrollApi();
        // now we have to make the post request to save the data in database
        const employeePayrolEndpoint = employeePayrolApis.collection.findByName(
            employeePayrolApis.collectionNames.TPayTemplateReiumbursementLine
        );

        employeePayrolEndpoint.url.searchParams.append(
            "ListType",
            "'Detail'"
        );

        const employeePayrolEndpointResponse = await employeePayrolEndpoint.fetch(); // here i should get from database all charts to be displayed

        if (employeePayrolEndpointResponse.ok == true) {
            const employeePayrolEndpointJsonResponse = await employeePayrolEndpointResponse.json();
            if (employeePayrolEndpointJsonResponse.tpaytemplatereiumbursementline.length) {
                await addVS1Data('TPayTemplateReiumbursementLine', JSON.stringify(employeePayrolEndpointJsonResponse))
            }
            return employeePayrolEndpointJsonResponse
        }
        return '';
    };

    templateObject.getPayReiumbursementLines = async function() {
        let data = [];
        let dataObject = await getVS1Data('TPayTemplateReiumbursementLine')
        if (dataObject.length == 0) {
            data = await templateObject.saveReiumbursementDB();
        } else {
            data = JSON.parse(dataObject[0].data);
        }
        let useData = PayTemplateReiumbursementLine.fromList(
            data.tpaytemplatereiumbursementline
        ).filter((item) => {
            if (parseInt(item.fields.EmployeeID) == parseInt(employeeID)) {
                return item;
            }
        });
        await templateObject.payTemplateReiumbursementLineInfo.set(useData);
        await templateObject.setReiumbursementDropDown();
        if (useData.length) {
            setTimeout(function() {
                Array.prototype.forEach.call(useData, (item) => {
                    $(`#ptReimbursementType${item.fields.ID}`).val(item.fields.ReiumbursementType);
                    $(`#ptReimbursementAmount${item.fields.ID}`).val(utilityService.modifynegativeCurrencyFormat(item.fields.Amount) || 0.00);
                });
            }, 500);
        }
    };

    templateObject.getPayReiumbursementLines();

    templateObject.saveOpeningBalanceLocalDB = async function() {
        const employeePayrolApis = new EmployeePayrollApi();
        // now we have to make the post request to save the data in database
        const employeePayrolEndpoint = employeePayrolApis.collection.findByName(
            employeePayrolApis.collectionNames.TOpeningBalances
        );

        employeePayrolEndpoint.url.searchParams.append(
            "ListType",
            "'Detail'"
        );

        const employeePayrolEndpointResponse = await employeePayrolEndpoint.fetch(); // here i should get from database all charts to be displayed
        if (employeePayrolEndpointResponse.ok == true) {
            const employeePayrolEndpointJsonResponse = await employeePayrolEndpointResponse.json();
            if (employeePayrolEndpointJsonResponse.topeningbalances.length) {
                await addVS1Data('TOpeningBalances', JSON.stringify(employeePayrolEndpointJsonResponse))
            }

            return employeePayrolEndpointJsonResponse
        }
        return '';
    };

    templateObject.saveAssignLeaveType = async() => {
        const employeePayrolApis = new EmployeePayrollApi();
        // now we have to make the post request to save the data in database
        const employeePayrolEndpoint = employeePayrolApis.collection.findByName(
            employeePayrolApis.collectionNames.TAssignLeaveType
        );

        employeePayrolEndpoint.url.searchParams.append(
            "ListType",
            "'Detail'"
        );

        const employeePayrolEndpointResponse = await employeePayrolEndpoint.fetch(); // here i should get from database all charts to be displayed

        if (employeePayrolEndpointResponse.ok == true) {
            let employeePayrolEndpointJsonResponse = await employeePayrolEndpointResponse.json();
            if (employeePayrolEndpointJsonResponse.tassignleavetype.length) {
                await addVS1Data('TAssignLeaveType', JSON.stringify(employeePayrolEndpointJsonResponse))
            }
            return employeePayrolEndpointJsonResponse
        }
        return '';
    };

    templateObject.getAssignLeaveTypes = async() => {
        let data = [];
        let dataObject = await getVS1Data('TAssignLeaveType')
        if (dataObject.length == 0) {
            data = await templateObject.saveAssignLeaveType();
        } else {
            data = JSON.parse(dataObject[0].data);
        }
        let splashArrayAssignLeaveList = [];

        if (data.tassignleavetype.length > 0) {
            let useData = AssignLeaveType.fromList(
                data.tassignleavetype
            ).filter((item) => {
                if (parseInt(item.fields.EmployeeID) == parseInt(employeeID) && item.fields.Active == true) {
                    return item;
                }
            });

            templateObject.assignLeaveTypeInfos.set(useData);
            for (let i = 0; i < useData.length; i++) {

                let dataListAllowance = [
                    useData[i].fields.ID || '',
                    useData[i].fields.LeaveType || '',
                    useData[i].fields.LeaveCalcMethod || '',
                    useData[i].fields.HoursAccruedAnnually || '',
                    useData[i].fields.HoursAccruedAnnuallyFullTimeEmp || '',
                    useData[i].fields.HoursFullTimeEmpFortnightlyPay || '',
                    useData[i].fields.HoursLeave || '',
                    useData[i].fields.OpeningBalance || '',
                    ((useData[i].fields.OnTerminationUnusedBalance) ? 'Paid Out' : 'Not Paid Out'),
                    `<button type="button" style="margin-bottom: 24px;" class="btn btn-danger btn-rounded btn-sm btnDeleteAssignLeaveType" id="btnDeleteAssignLeaveType" data-id="` + useData[i].fields.ID + `"><i class="fa fa-remove"></i></button>`
                ];
                splashArrayAssignLeaveList.push(dataListAllowance);
            }
        }
        setTimeout(function() {
            $('#tblAssignLeaveTypes').DataTable({
                data: splashArrayAssignLeaveList,
                "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                columnDefs: [

                    {
                        className: "colALType colALTypeID hiddenColumn",
                        "targets": [0]
                    },
                    {
                        className: "colALType colALTypeLeave",
                        "targets": [1]
                    },
                    {
                        className: "colALType colALTypeLeaveCalMethod",
                        "targets": [2]
                    },
                    {
                        className: "colALType colALTypeHoursAccruedAnnually",
                        "targets": [3]
                    },
                    {
                        className: "colALType colALTypeHoursAccruedAnnuallyFullTimeEmp",
                        "targets": [4]
                    },
                    {
                        className: "colALType colALTypeHoursFullTimeEmpFortnightlyPay",
                        "targets": [5]
                    },
                    {
                        className: "colALType colALTypeHours",
                        "targets": [6]
                    },
                    {
                        className: "colALType colALTypeOpeningBalance",
                        "targets": [7]
                    },
                    {
                        className: "colALType colALTypeTerminationBalance",
                        "targets": [8]
                    },
                    {
                        className: "colALTypeActions",
                        "targets": [9]
                    }
                ],
                select: true,
                destroy: true,
                colReorder: true,
                pageLength: initialDatatableLoad,
                lengthMenu: [
                    [initialDatatableLoad, -1],
                    [initialDatatableLoad, "All"]
                ],
                info: true,
                responsive: true,
                "order": [
                    [0, "asc"]
                ],
                action: function() {
                    $('#tblAssignLeaveTypes').DataTable().ajax.reload();
                },
                "fnDrawCallback": function(oSettings) {
                    $('.paginate_button.page-item').removeClass('disabled');
                    $('#tblAssignLeaveTypes_ellipsis').addClass('disabled');
                    if (oSettings._iDisplayLength == -1) {
                        if (oSettings.fnRecordsDisplay() > 150) {

                        }
                    } else {

                    }
                    if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                        $('.paginate_button.page-item.next').addClass('disabled');
                    }

                    $('.paginate_button.next:not(.disabled)', this.api().table().container())
                        .on('click', function() {
                            LoadingOverlay.show();

                            var splashArrayAssignLeaveListDupp = new Array();
                            let dataLenght = oSettings._iDisplayLength;
                            let customerSearch = $('#tblAssignLeaveTypes_filter input').val();

                            sideBarService.getAssignLeaveType(initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(useData) {

                                for (let i = 0; i < useData.length; i++) {
                                    let dataListAllowance = [
                                        useData[i].fields.ID || '',
                                        useData[i].fields.LeaveType || '',
                                        useData[i].fields.LeaveCalcMethod || '',
                                        useData[i].fields.HoursAccruedAnnually || '',
                                        useData[i].fields.HoursAccruedAnnuallyFullTimeEmp || '',
                                        useData[i].fields.HoursFullTimeEmpFortnightlyPay || '',
                                        useData[i].fields.HoursLeave || '',
                                        useData[i].fields.OpeningBalance || '',
                                        ((useData[i].fields.OnTerminationUnusedBalance) ? 'Paid Out' : 'Not Paid Out'),
                                        `<button type="button" style="margin-bottom: 24px;" class="btn btn-danger btn-rounded btn-sm btnDeleteAssignLeaveType" id="btnDeleteAssignLeaveType" data-id="` + useData[i].fields.ID + `"><i class="fa fa-remove"></i></button>`
                                    ];
                                    splashArrayAssignLeaveList.push(dataListAllowance);
                                }

                                let uniqueChars = [...new Set(splashArrayAssignLeaveList)];
                                var datatable = $('#tblAssignLeaveTypes').DataTable();
                                datatable.clear();
                                datatable.rows.add(uniqueChars);
                                datatable.draw(false);
                                setTimeout(function() {
                                    $("#tblAssignLeaveTypes").dataTable().fnPageChange('last');
                                }, 400);

                                $('.fullScreenSpin').css('display', 'none');


                            }).catch(function(err) {
                                $('.fullScreenSpin').css('display', 'none');
                            });

                        });
                    setTimeout(function() {
                        MakeNegative();
                    }, 100);
                },
                "fnInitComplete": function() {
                    $("<button class='btn btn-primary btnAssignLeaveType' data-dismiss='modal' data-toggle='modal' data-target='#assignLeaveTypeModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblAssignLeaveTypes_filter");
                    $("<button class='btn btn-primary btnRefreshAssignLeave' type='button' id='btnRefreshAssignLeave' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblAssignLeaveTypes_filter");
                }

            }).on('page', function() {
                setTimeout(function() {
                    MakeNegative();
                }, 100);

            }).on('column-reorder', function() {

            }).on('length.dt', function(e, settings, len) {
                //LoadingOverlay.show();

                let dataLenght = settings._iDisplayLength;
                splashArrayAssignLeaveList = [];
                if (dataLenght == -1) {
                    $('.fullScreenSpin').css('display', 'none');

                } else {
                    if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
                        $('.fullScreenSpin').css('display', 'none');
                    } else {
                        sideBarService.getAssignLeaveType(dataLenght, 0).then(function(dataNonBo) {

                            addVS1Data('TAssignLeaveType', JSON.stringify(dataNonBo)).then(function(datareturn) {
                                // templateObject.resetData(dataNonBo);
                                $('.fullScreenSpin').css('display', 'none');
                            }).catch(function(err) {
                                $('.fullScreenSpin').css('display', 'none');
                            });
                        }).catch(function(err) {
                            $('.fullScreenSpin').css('display', 'none');
                        });
                    }
                }
                setTimeout(function() {
                    MakeNegative();
                }, 100);
            });
        }, 300);
    };

    templateObject.getAssignLeaveTypes();

    templateObject.filterOpeningBalance = (type) => {
        const templateObject = Template.instance();
        let openingBalanceLines = []
        let currentId = FlowRouter.current().queryParams;
        let employeeID = (!isNaN(currentId.id)) ? currentId.id : 0;
        let checkOpeningBalances = templateObject.openingBalanceInfo.get();
        if (Array.isArray(checkOpeningBalances)) {
            openingBalanceLines = OpeningBalance.fromList(
                checkOpeningBalances
            ).filter((item) => {
                if (parseInt(item.fields.EmployeeID) == parseInt(employeeID) && item.fields.Balance == type && item.fields.Active == true) {
                    return item;
                }
            });
        }
        return openingBalanceLines;
    };

    templateObject.getOpeningBalances = async() => {
        let data = [];
        let TOpeningBalances = await getVS1Data('TOpeningBalances');
        if (TOpeningBalances.length == 0) {
            data = await templateObject.saveOpeningBalanceLocalDB();
        } else {
            data = JSON.parse(TOpeningBalances[0].data);
        }
        let openingBalances = OpeningBalance.fromList(
            data.topeningbalances
        ).filter((item) => {
            if (parseInt(item.fields.EmployeeID) == parseInt(employeeID)) {
                return item;
            }
        });
        await templateObject.openingBalanceInfo.set(openingBalances);
        templateObject.setOpeningBalance();
    };

    templateObject.getOpeningBalances();

    templateObject.setOpeningBalance = async() => {
        setTimeout(function() {
            let checkOpeningBalances = templateObject.openingBalanceInfo.get();
            for (const item of checkOpeningBalances) {
                if (item.fields.Active == true) {
                    let amount = utilityService.modifynegativeCurrencyFormat(item.fields.Amount);
                    switch (item.fields.Balance) {
                        case 0:
                            $(`#obEarningRate${ item.fields.ID }`).val(item.fields.AType);
                            $(`#obEarningAmount${ item.fields.ID }`).val(amount);
                            break;
                        case 1:
                            $(`#obDeductionLine${ item.fields.ID }`).val(item.fields.AType);
                            $(`#obDeductionAmount${ item.fields.ID }`).val(amount);
                            break;
                        case 2:
                            $(`#obSuperannuationFund${ item.fields.ID }`).val(item.fields.AType);
                            $(`#obSuperannuationAmount${ item.fields.ID }`).val(amount);
                            break;
                        case 3:
                            $(`#obReimbursementFund${ item.fields.ID }`).val(item.fields.AType);
                            $(`#obReimbursementAmount${ item.fields.ID }`).val(amount);
                            break;
                    }
                }
            }
        }, 2000);
    }

    templateObject.saveEmployeePaySettingsLocalDB = async function() {
        const employeePayrolApis = new EmployeePayrollApi();
        // now we have to make the post request to save the data in database
        const employeePayrolEndpoint = employeePayrolApis.collection.findByName(
            employeePayrolApis.collectionNames.TEmployeepaysettings
        );

        employeePayrolEndpoint.url.searchParams.append(
            "ListType",
            "'Detail'"
        );

        const employeePayrolEndpointResponse = await employeePayrolEndpoint.fetch(); // here i should get from database all charts to be displayed
        if (employeePayrolEndpointResponse.ok == true) {
            const employeePayrolEndpointJsonResponse = await employeePayrolEndpointResponse.json();
            if (employeePayrolEndpointJsonResponse.temployeepaysettings.length) {
                await addVS1Data('TEmployeepaysettings', JSON.stringify(employeePayrolEndpointJsonResponse))
            }
            return employeePayrolEndpointJsonResponse
        }
        return '';
    };

    templateObject.getEmployeePaySettings = async(refresh = false) => {  

        try {
            // EmployeePayrollApi fetch data from indexDB
            let data = [];
            let TEmployeepaysettings = await getVS1Data('TEmployeepaysettings');
            if (TEmployeepaysettings.length == 0) {
                data = templateObject.saveEmployeePaySettingsLocalDB();
            } else {
                data = JSON.parse(TEmployeepaysettings[0].data);
            }

            let useData = EmployeePaySettings.fromList(
                data.temployeepaysettings
            ).filter((item) => {
                if (item.fields.Employeeid == employeeID) {
                    return item;
                }
            });

            let employeePaySettings = {}
            let objEmployeePaySettings = {}
            if (useData.length == 0) {
                let ePaySettings = await contactService.getOneEmployeeDataEx(employeeID);
                if (ePaySettings) {
                    objEmployeePaySettings = {
                        ID: 0,
                        Payperiod: "",
                        EmployeeName: ePaySettings.fields.EmployeeName,
                        StartingDate: "",
                        BankAccountName: "",
                        BankAccountBSB: "",
                        BankAccountNo: "",
                        StatementText: "",
                        AnnualSalary: 0,
                        EarningYTD: 0,
                        NextPayDate: moment().format('YYYY-MM-DD'),
                        AnnSalary: 0,
                        TFN: ePaySettings.fields.TFN,
                        Country: ePaySettings.fields.Country,
                        TaxFreeThreshold: false,
                        TFNExemption: "",
                        EmploymentBasis: "",
                        ResidencyStatus: "",
                        StudyTrainingSupportLoan: false,
                        EligibleToReceiveLeaveLoading: false,
                        OtherTaxOffsetClaimed: false,
                        UpwardvariationRequested: false,
                        SeniorandPensionersTaxOffsetClaimed: false,
                        HasApprovedWithholdingVariation: false,
                    }
                }
                templateObject.employeePaySettings.set(objEmployeePaySettings);
            } else {
                employeePaySettings = useData[0]
                objEmployeePaySettings = {
                    ID: employeePaySettings.fields.ID,
                    Payperiod: employeePaySettings.fields.Payperiod,
                    StartingDate: moment(employeePaySettings.fields.StartingDate).format("DD/MM/YYYY"),
                    EmployeeName: employeePaySettings.fields.Employee.fields.EmployeeName,
                    BankAccountName: employeePaySettings.fields.BankAccountName,
                    BankAccountBSB: employeePaySettings.fields.BankAccountBSB,
                    BankAccountNo: employeePaySettings.fields.BankAccountNo,
                    StatementText: employeePaySettings.fields.Statement,
                    AnnualSalary: employeePaySettings.fields.AnnualSalary,
                    EarningYTD: employeePaySettings.fields.EarningYTD,
                    NextPayDate: employeePaySettings.fields.NextPayDate,
                    AnnSalary: employeePaySettings.fields.Employee.fields.Wages * 12,
                    TFN: employeePaySettings.fields.Employee.fields.TFN,
                    Country: employeePaySettings.fields.Employee.fields.Country,
                    TaxFreeThreshold: employeePaySettings.fields.Employee.fields.TaxFreeThreshold ? employeePaySettings.fields.Employee.fields.TaxFreeThreshold : false,

                    TFNExemption: employeePaySettings.fields.Employee.fields.CgtExempt ? employeePaySettings.fields.Employee.fields.CgtExempt : "",
                    EmploymentBasis: employeePaySettings.fields.Employee.fields.BasisOfPayment ? employeePaySettings.fields.Employee.fields.BasisOfPayment : "",
                    ResidencyStatus: employeePaySettings.fields.Employee.fields.Resident,
                    StudyTrainingSupportLoan: employeePaySettings.fields.Employee.fields.StudentLoanIndicator ? employeePaySettings.fields.Employee.fields.StudentLoanIndicator : false,
                    EligibleToReceiveLeaveLoading: employeePaySettings.fields.Employee.fields.PaySuperonLeaveLoading ? employeePaySettings.fields.Employee.fields.PaySuperonLeaveLoading : false,
                    OtherTaxOffsetClaimed: employeePaySettings.fields.Employee.fields.OtherTaxOffsetClaimed ? employeePaySettings.fields.Employee.fields.OtherTaxOffsetClaimed : false,
                    UpwardvariationRequested: employeePaySettings.fields.Employee.fields.UpwardvariationRequested ? employeePaySettings.fields.Employee.fields.UpwardvariationRequested : false,
                    SeniorandPensionersTaxOffsetClaimed: employeePaySettings.fields.Employee.fields.Pensioner ? employeePaySettings.fields.Employee.fields.Pensioner : false,
                    HasApprovedWithholdingVariation: employeePaySettings.fields.Employee.fields.HasApprovedWithholdingVariation ? employeePaySettings.fields.Employee.fields.HasApprovedWithholdingVariation : false,
                }

                templateObject.employeePaySettings.set(objEmployeePaySettings);

                templateObject.employeePayInfos.set(employeePaySettings);

                $(`#edtTfnExemption option[value='${objEmployeePaySettings.TFNExemption}']`).attr('selected', 'selected');
                $(`#edtPayPeriod`).val(objEmployeePaySettings.Payperiod);
                $(`#edtLeavePayPeriod`).val(objEmployeePaySettings.Payperiod);
                $(`#edtEmploymentBasis option[value='${objEmployeePaySettings.EmploymentBasis}']`).attr('selected', 'selected');
                $(`#edtResidencyStatus option[value='${objEmployeePaySettings.ResidencyStatus}']`).attr('selected', 'selected');
            }
        } catch (err) {
            let employeePayrollService = new EmployeePayrollService();
            let data = await employeePayrollService.getAllEmployeePaySettings('All', 0)
            for (let i = 0; i < data.temployeepaysettings.length; i++) {
                if (parseInt(data.temployeepaysettings[i].fields.Employeeid) === parseInt(employeeID)) {

                    $('.fullScreenSpin').css('display', 'none');
                    let lineItems = [];

                    let payInfo = {
                        ID: data.temployeepaysettings[i].fields.ID,
                        Payperiod: "",
                        StartingDate: "",
                        EmployeeID: data.temployeepaysettings[i].fields.Employeeid,
                        EmployeeName: data.temployeepaysettings[i].fields.Employee.fields.EmployeeName,
                        AnnSalary: data.temployeepaysettings[i].fields.Employee.fields.Wages * 12,
                        TFN: data.temployeepaysettings[i].fields.Employee.fields.TFN,
                        Country: data.temployeepaysettings[i].fields.Employee.fields.Country,
                        TaxFreeThreshold: data.temployeepaysettings[i].fields.Employee.fields.TaxFreeThreshold,
                    };
                    templateObject.employeePayInfos.set(payInfo);
                }
            }
        }
    }
    templateObject.getEmployeePaySettings();

    templateObject.getTLeaveTypes = async() => {
        try {
            let dataObj = await getVS1Data('TLeavetypes');
        } catch (err) {

            let employeePayrollService = new EmployeePayrollService();
            let data = await employeePayrollService.getAllTLeaveTypes('All', 0)
            await templateObject.leaveTypesDrpDown.set(data.tleavetypes);
        }
    }
    templateObject.getTLeaveTypes();

    templateObject.getTBankAccounts = function() {
        let employeePayrollService = new EmployeePayrollService();
        getVS1Data('TBankAccounts').then(function(dataObj) {
            let newData = {
                primary: null,
                first: null,
                second: null,
                third: null
            };
            if (dataObj.length > 0) {
                let data = JSON.parse(dataObj[0].data);
                let index = 1;
                for (let i = 0; i < data.length; i++) {
                    if (parseInt(data[i].fields.EmployeeID) == parseInt(employeeID)) {
                        if (data[i].fields.IsPrimary == false) {
                            // let newItem = {...data[i].fields};
                            // newItem.order = index;
                            // data[i].fields.order = index;
                            if (index == 1) newData.first = data[i].fields;
                            else if (index == 2) newData.second = data[i].fields;
                            else if (index == 3) newData.third = data[i].fields;
                            index++;
                        } else {
                            newData.primary = data[i].fields;
                        }
                    }
                }
            }
            templateObject.bankAccList.set(newData);

        }).catch(function(err) {
            employeePayrollService.getAllTBankAccounts('All', 0).then(function(data) {

            }).catch(function(err) {});
        });
    }
    templateObject.getTBankAccounts();

    templateObject.updateOBTotal = async function(Amount, ID) {
        let data = templateObject.openingBalanceInfo.get();
        let formattedAmount = utilityService.convertSubstringParseFloat(Amount);
        if (data) {
            let useData = data.map((item) => {
                if (ID == item.fields.ID) {
                    item.fields.Amount = formattedAmount;
                }
                return item;
            });
            templateObject.openingBalanceInfo.set(useData);
        }
    }

    // Pay Slip table
    templateObject.getPaySlips = async function() {
        try {
            let data = {};
            let splashArrayPaySlipList = [];
            let dataObject = await getVS1Data('TPaySlips')
            if (dataObject.length == 0) {
                const employeePayrolApis = new EmployeePayrollApi();
                // now we have to make the post request to save the data in database
                const employeePayrolEndpoint = employeePayrolApis.collection.findByName(
                    employeePayrolApis.collectionNames.TPaySlips
                );

                employeePayrolEndpoint.url.searchParams.append(
                    "ListType",
                    "'Detail'"
                );

                const employeePayrolEndpointResponse = await employeePayrolEndpoint.fetch(); // here i should get from database all charts to be displayed

                if (employeePayrolEndpointResponse.ok == true) {
                    data = await employeePayrolEndpointResponse.json();
                    if (data.tpayslips.length) {
                        await addVS1Data('TPaySlips', JSON.stringify(data))
                    }
                }
            } else {
                data = JSON.parse(dataObject[0].data);
            }

            let dataListAllowance = [];
            let useData = PaySlips.fromList(
                data.tpayslips
            ).filter((item) => {
                if (parseInt(item.fields.EmployeeID) == parseInt(employeeID) && item.fields.Active == true) {
                    return item;
                }
            });
            templateObject.paySlipInfos.set(useData);

            let utilityService = new UtilityService();
            for (let i = 0; i < useData.length; i++) {
                dataListAllowance = [
                    useData[i].fields.ID || '',
                    useData[i].fields.Period || '',
                    (useData[i].fields.PaymentDate == 0) ? '' : moment(useData[i].fields.PaymentDate).format("DD/MM/YYYY") || '',
                    utilityService.modifynegativeCurrencyFormat(useData[i].fields.TotalPay) || '',
                    `<button type="button"" class="btn btn-success btn-rounded btn-sm btnDownloadPayslip smallFontSizeBtn"><i class="fas fa-file-download"></i></button>
                    <button type="button" class="btn btn-danger btn-rounded btn-sm btnDeletePayslip" data-id="${useData[i].fields.ID}" autocomplete="off"><i class="fa fa-remove"></i></button>`,
                ];
                splashArrayPaySlipList.push(dataListAllowance);
            }

            // templateObject.datatablerecords.set(splashArrayPaySlipList);

            setTimeout(function() {
                $('#tblPayslipHistory').DataTable({
                    data: splashArrayPaySlipList,
                    "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                    columnDefs: [{
                            className: "colPaySlip colPayslipID hiddenColumn",
                            "targets": [0]
                        },
                        {
                            className: "colPaySlip colPayslipPeriod",
                            "targets": [1]
                        },
                        {
                            className: "colPaySlip colPayslipPaymentDate",
                            "targets": [2]
                        },
                        {
                            className: "colPaySlip colPayslipTotalPay",
                            "targets": [3]
                        },
                        {
                            className: "colPayslipActions",
                            "targets": [4]
                        }
                    ],
                    select: true,
                    destroy: true,
                    colReorder: true,
                    pageLength: initialDatatableLoad,
                    lengthMenu: [
                        [initialDatatableLoad, -1],
                        [initialDatatableLoad, "All"]
                    ],
                    info: true,
                    responsive: true,
                    "order": [
                        [0, "asc"]
                    ],
                    action: function() {
                        $('#tblPayslipHistory').DataTable().ajax.reload();
                    },
                    "fnDrawCallback": function(oSettings) {
                        $('.paginate_button.page-item').removeClass('disabled');
                        $('#tblPayslipHistory_ellipsis').addClass('disabled');
                        if (oSettings._iDisplayLength == -1) {
                            if (oSettings.fnRecordsDisplay() > 150) {

                            }
                        } else {

                        }
                        if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                            $('.paginate_button.page-item.next').addClass('disabled');
                        }

                        $('.paginate_button.next:not(.disabled)', this.api().table().container())
                            .on('click', function() {
                                LoadingOverlay.show();

                                var splashArrayPaySlipListDupp = new Array();
                                let dataLenght = oSettings._iDisplayLength;
                                let customerSearch = $('#tblPayslipHistory_filter input').val();

                                sideBarService.getPaySlip(initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(data) {

                                    for (let i = 0; i < useData.length; i++) {
                                        dataListAllowance = [
                                            useData[i].fields.ID || '',
                                            useData[i].fields.Period || '',
                                            (useData[i].fields.PaymentDate == 0) ? '' : moment(useData[i].fields.PaymentDate).format("DD/MM/YYYY") || '',
                                            utilityService.modifynegativeCurrencyFormat(useData[i].fields.TotalPay) || '',
                                            `<button type="button" class="btn btn-success btnDownloadPayslip" style="margin-bottom: 24px;"><i class="fas fa-file-download"></i></button>
                                            <button type="button" class="btn btn-danger btn-rounded btn-sm btn-rounded btn-sm btnDeletePayslip" data-id="${useData[i].fields.ID}" style="margin-bottom: 24px;" autocomplete="off"><i class="fa fa-remove"></i></button>`,
                                        ];
                                        splashArrayPaySlipList.push(dataListAllowance);
                                    }

                                    let uniqueChars = [...new Set(splashArrayPaySlipList)];
                                    var datatable = $('#tblPayslipHistory').DataTable();
                                    datatable.clear();
                                    datatable.rows.add(uniqueChars);
                                    datatable.draw(false);
                                    setTimeout(function() {
                                        $("#tblPayslipHistory").dataTable().fnPageChange('last');
                                    }, 400);

                                    $('.fullScreenSpin').css('display', 'none');


                                }).catch(function(err) {
                                    $('.fullScreenSpin').css('display', 'none');
                                });

                            });
                        setTimeout(function() {
                            MakeNegative();
                        }, 100);
                    },
                    "fnInitComplete": function() {
                        $("<button class='btn btn-primary addNewSlip' data-dismiss='modal' data-toggle='modal' data-target='#paySlipModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblPayslipHistory_filter");
                        $("<button class='btn btn-primary btnRefreshPaySlip' type='button' id='btnRefreshPaySlip' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblPayslipHistory_filter");
                    }

                }).on('page', function() {
                    setTimeout(function() {
                        MakeNegative();
                    }, 100);

                }).on('column-reorder', function() {

                }).on('length.dt', function(e, settings, len) {
                    //LoadingOverlay.show();

                    let dataLenght = settings._iDisplayLength;
                    splashArrayPaySlipList = [];
                    if (dataLenght == -1) {
                        $('.fullScreenSpin').css('display', 'none');

                    } else {
                        if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
                            $('.fullScreenSpin').css('display', 'none');
                        } else {
                            sideBarService.getPaySlip(dataLenght, 0).then(function(dataNonBo) {

                                addVS1Data('TPaySlips', JSON.stringify(dataNonBo)).then(function(datareturn) {
                                    // templateObject.resetData(dataNonBo);
                                    $('.fullScreenSpin').css('display', 'none');
                                }).catch(function(err) {
                                    $('.fullScreenSpin').css('display', 'none');
                                });
                            }).catch(function(err) {
                                $('.fullScreenSpin').css('display', 'none');
                            });
                        }
                    }
                    setTimeout(function() {
                        MakeNegative();
                    }, 100);
                });
            }, 1000);

        } catch (error) {
            $('.fullScreenSpin').css('display', 'none');
        }
    };
    templateObject.getPaySlips();

    // Display pay template tab inputs
    templateObject.displayPayTempEarningLines = function() {
        // let payLines = templateObject.payTemplateEarningLineInfo.get();
        // if( payLines ){
        //     Array.prototype.forEach.call(payLines, (item, index) => {
        //         $('#ptEarningRate' + index).val(item.fields.EarningRate);
        //         $('#ptEarningAmount' + index).val(item.fields.Amount);
        //     })
        // }
    }

    templateObject.displayPayTempDeductionLines = function() {
        let payLines = templateObject.payTemplateDeductionLineInfo.get();
        if (payLines) {
            Array.prototype.forEach.call(payLines, (item, index) => {
                $('#ptDeductionType' + index).val(item.fields.DeductionType);
                $('#ptDeductionAmount' + index).val(item.fields.Amount);
                $('#ptDeductionPercentage' + index).val(item.fields.Percentage);
            })
        }
    }

    templateObject.displayPayTempSuperannuationLines = function() {
        let payLines = templateObject.payTemplateSuperannuationLineInfo.get();
        if (payLines) {
            Array.prototype.forEach.call(payLines, (item, index) => {
                $('#ptSuperannuationFund' + index).val(item.fields.Fund);
                $('#ptSuperannuationAmount' + index).val(item.fields.Amount);
                $('#ptSuperannuationPercentage' + index).val(item.fields.Percentage);
            })
        }
    }

    templateObject.displayPayTempReimbursementLines = function() {
        let payLines = templateObject.payTemplateReiumbursementLineInfo.get();
        if (payLines) {
            Array.prototype.forEach.call(payLines, (item, index) => {
                $('#ptReimbursementType' + index).val(item.fields.ReiumbursementType);
                $('#ptReimbursementAmount' + index).val(item.fields.Amount);
            })
        }
    }

    templateObject.setEarningLineDropDown = function() {
        // setTimeout( function () {
        //     $('.earningLineDropDown').editableSelect();
        //     $('.earningLineDropDown').editableSelect().on('click.editable-select', async function (e, li) {
        //         let $search = $(this);
        //         let offset = $search.offset();
        //         let dropDownID = $search.attr('id')
        //         $('#edtEarningDropDownID').val(dropDownID);
        //         templateObject.currentDrpDownID.set(dropDownID);
        //         let searchName = e.target.value || '';
        //         if (e.pageX > offset.left + $search.width() - 8) { // X button 16px wide?
        //             $('#earningRateSettingsModal').modal('show');
        //         } else {
        //             if (searchName.replace(/\s/g, '') == '') {
        //                 $('#earningRateSettingsModal').modal('show');
        //                 return false
        //             }
        //             let data = {};
        //             let dataObject = await getVS1Data('TEarnings');
        //             if ( dataObject.length > 0) {
        //                 data = JSON.parse(dataObject[0].data);
        //                 let tEarnings = data.tearnings.filter((item) => {
        //                     if( item.fields.EarningsName == searchName ){
        //                         return item;
        //                     }
        //                 });
        //                 $('#headerEarningLabel').text('Edit Earning');
        //                 $('#earningRateForm')[0].reset();
        //                 $('#addEarningsLineModal').modal('hide');
        //                 if( tEarnings.length > 0 ){
        //                     let earningRate = tEarnings[0];
        //                     $('#earningID').val(earningRate.fields.ID)
        //                     $('#edtEarningsName').val(earningRate.fields.EarningsName)
        //                     $('#edtEarningsType').val(earningRate.fields.EarningType)
        //                     $('#edtDisplayName').val(earningRate.fields.EarningsDisplayName)
        //                     $('#edtRateType').val(earningRate.fields.EarningsRateType)
        //                     $('#edtExpenseAccount').val(earningRate.fields.ExpenseAccount)
        //                     $('#formCheck-ExemptPAYG').prop('checked', earningRate.fields.EarningsExemptPaygWithholding)
        //                     $('#formCheck-ExemptSuperannuation').prop('checked', earningRate.fields.EarningsExemptSuperannuationGuaranteeCont)
        //                     $('#formCheck-ExemptReportable').prop('checked', earningRate.fields.EarningsReportableW1onActivityStatement)
        //                 }
        //                 $('#earningRateSettingsModal').modal('hide');
        //                 $('#ordinaryTimeEarningsModal').modal('show');
        //             }
        //         }
        //     });
        // }, 500)
    }

    templateObject.setDeductionLineDropDown = function() {
        setTimeout(function() {
            $('.deductionLineDropDown').editableSelect();
            $('.deductionLineDropDown').editableSelect()
                .on('click.editable-select', async function(e, li) {
                    let $search = $(this);
                    let offset = $search.offset();
                    let dropDownID = $search.attr('id')
                    $('#edtDeductionDropDownID').val(dropDownID);
                    templateObject.currentDrpDownID.set(dropDownID);
                    let searchName = e.target.value || '';
                    if (e.pageX > offset.left + $search.width() - 8) { // X button 16px wide?
                        $('#deductionSettingsModal').modal('show');
                    } else {
                        if (searchName.replace(/\s/g, '') == '') {
                            $('#deductionSettingsModal').modal('show');
                            return false
                        }
                        let dataObject = await getVS1Data('TDeduction');
                        if (dataObject.length > 0) {
                            let data = JSON.parse(dataObject[0].data);
                            let tDeduction = data.tdeduction.filter((item) => {
                                if (item.fields.Description == searchName) {
                                    return item;
                                }
                            });
                            $('#headerDeductionLabel').text('Edit Deduction');
                            $('#deductionRateForm')[0].reset();
                            $('#deductionSettingsModal').modal('hide');
                            if (tDeduction.length > 0) {
                                let deductionType = 'None';
                                if (tDeduction[0].fields.Taxexempt == true) {
                                    deductionType = 'None';
                                } else {
                                    if (tDeduction[0].fields.IsWorkPlacegiving == true) {
                                        deductionType = 'Workplace Giving';
                                    }
                                    if (tDeduction[0].fields.Unionfees == true) {
                                        deductionType = 'Union / Association Fees';
                                    }
                                }
                                $('#edtDeductionID').val(tDeduction[0].fields.ID)
                                $('#edtDeductionType').val(deductionType)
                                $('#edtDeductionAccount').val(tDeduction[0].fields.Accountname)
                                $('#edtDeductionAmount').val(tDeduction[0].fields.Amount)
                                $('#edtDeductionAccountID').val(tDeduction[0].fields.Accountid)
                                $('#edtDeductionDesctiption').val(tDeduction[0].fields.Description)
                                $('#formCheck-ReducesPAYGDeduction').prop('checked', tDeduction[0].fields.Payrolltaxexempt || false)
                                $('#formCheck-ReducesSuperannuationDeduction').prop('checked', tDeduction[0].fields.Superinc || false)
                                $('#formCheck-ExcludedDeduction').prop('checked', tDeduction[0].fields.Workcoverexempt || false)
                            }
                            $('#deductionSettingsModal').modal('hide');
                            $('#noneModal').modal('show');
                        }
                    }
                });
        }, 500);
    }
    templateObject.setDeductionLineDropDown();

    templateObject.setSuperannuationDropDown = async() => {
        setTimeout(function() {
            $('.superannuationDropDown').editableSelect();
            $('.superannuationDropDown').editableSelect()
                .on('click.editable-select', async function(e, li) {
                    let $search = $(this);
                    let dropDownID = $search.attr('id')
                    $('#edtSuperAnnuationDropDownID').val(dropDownID);
                    templateObject.currentDrpDownID.set(dropDownID);
                    let offset = $search.offset();
                    let searchName = e.target.value || '';
                    if (e.pageX > offset.left + $search.width() - 8) { // X button 16px wide?
                        $('#superannuationSettingsModal').modal('show');
                    } else {
                        if (searchName.replace(/\s/g, '') == '') {
                            $('#superannuationSettingsModal').modal('show');
                            return false
                        }
                        let dataObject = await getVS1Data('TSuperannuation');
                        if (dataObject.length > 0) {
                            let data = JSON.parse(dataObject[0].data);
                            let tSuperannuation = data.tsuperannuation.filter((item) => {
                                if (item.fields.Superfund == searchName) {
                                    return item;
                                }
                            });

                            $('#superannuationRateForm')[0].reset();
                            $('#newSuperannuationFundLabel').text('Edit Superannuation Fund')
                            $('#superannuationSettingsModal').modal('hide');

                            if (tSuperannuation.length > 0) {
                                if (tSuperannuation[0].fields.Supertypeid == 'Self-Managed Superannuation Fund') {
                                    $('#acountabmandelectronic').css('display', 'block');
                                    $('#accountbsb').css('display', 'block');
                                    $('#account_name').css('display', 'block');
                                } else {
                                    $('#acountabmandelectronic').css('display', 'none');
                                    $('#accountbsb').css('display', 'none');
                                    $('#account_name').css('display', 'none');
                                }

                                $('#newSuperannuationFundId').val(tSuperannuation[0].fields.ID);
                                $('#edtFundType').val(tSuperannuation[0].fields.Supertypeid);
                                $('#edtFundName').val(tSuperannuation[0].fields.Superfund);
                                $('#edtelectronicsalias').val(tSuperannuation[0].fields.ElectronicsServiceAddressAlias);
                                $('#edtEmployerNumber').val(tSuperannuation[0].fields.Employeeid);
                                $('#edtaccountnumber').val(tSuperannuation[0].fields.Accountno);
                                $('#edtbsb').val(tSuperannuation[0].fields.BSB);
                                $('#edtaccountname').val(tSuperannuation[0].fields.AccountName);
                            }
                            $('#superannuationSettingsModal').modal('hide');
                            $('#newSuperannuationFundModal').modal('show');
                        }
                    }
                });
        }, 500);
    }
    templateObject.setSuperannuationDropDown();

    templateObject.setReiumbursementDropDown = function() {
        setTimeout(function() {
            $('.reimbursementDropDown').editableSelect();
            $('.reimbursementDropDown').editableSelect()
                .on('click.editable-select', async function(e, li) {
                    let $search = $(this);
                    let dropDownID = $search.attr('id')
                    $('#edtReimbursementDropDownID').val(dropDownID);
                    templateObject.currentDrpDownID.set(dropDownID);
                    let offset = $search.offset();
                    let searchName = e.target.value || '';
                    if (e.pageX > offset.left + $search.width() - 8) { // X button 16px wide?
                        $('#reimbursementSettingsModal').modal('show');
                    } else {
                        if (searchName.replace(/\s/g, '') == '') {
                            $('#reimbursementSettingsModal').modal('show');
                            return false
                        }
                        let dataObject = await getVS1Data('TReimbursement');
                        if (dataObject.length > 0) {
                            let data = JSON.parse(dataObject[0].data);
                            let tReimbursement = data.treimbursement.filter((item) => {
                                if (item.fields.ReimbursementName == searchName) {
                                    return item;
                                }
                            });

                            $('#reimbursementRateForm')[0].reset();
                            $('#newReimbursementLabel').text('Edit Reiumbursement');
                            $('#reimbursementSettingsModal').modal('hide');

                            if (tReimbursement.length > 0) {
                                $('#res_id').val(tReimbursement[0].fields.ID) || 0;
                                $('#edtReimbursementName').val(tReimbursement[0].fields.ReimbursementName) || '';
                                $('#edtReimbursementAccount').val(tReimbursement[0].fields.ReimbursementAccount) || '';
                            }
                            $('#reimbursementSettingsModal').modal('hide');
                            $('#newReimbursementModal').modal('show');
                        }
                    }
                });
        }, 500);
    }

    /**
     * This is used when you delete an employee
     * It will just deactivate it
     */
    templateObject.deactivateEmployee = async() => {
        playDeleteAudio();
        setTimeout(async function() {
            LoadingOverlay.show();
            let employeeId = FlowRouter.current().queryParams.id;

            if (!isNaN(employeeId)) {
                const currentEmployee = parseInt(employeeId);
                const objDetails = {
                    type: "TEmployeeEx",
                    fields: {
                        ID: currentEmployee,
                        Active: false
                    }
                };

                try {
                    const response = await contactService.saveEmployeeEx(objDetails);

                    LoadingOverlay.hide(0);
                    FlowRouter.go('/employeelist?success=true');

                } catch (e) {
                    LoadingOverlay.hide(0);
                    const result = await swal({
                        title: 'Oooops...',
                        text: err,
                        type: 'error',
                        showCancelButton: true,
                        confirmButtonText: 'Try Again'
                    });

                    if (result.value) {
                        await templateObject.deactivateEmployee();
                    } else if (result.dismiss === 'cancel') {}

                }

            } else {
                LoadingOverlay.hide(0);
                const result = await swal({
                    title: 'Cannot delete this employee...',
                    text: "This employee doesn't not exist",
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Ok'
                });

                if (result.value) {
                    window.open('/', '_self');
                } else if (result.dismiss === 'cancel') {}
            }
            $('#deleteEmployeeModal').modal('toggle');
        }, delayTimeAfterSound);
    }

    //On Click Earnings List
    // $(document).on("click", "#tblEarnings tbody tr", function (e) {
    //     const table = $(this);
    //     let earningsName = table.find(".colEarningsNames").text()||'';
    //     let earningsID = table.find(".colEarningsID").text()||'';
    //     let account = table.find(".colEarningsAccounts").text()||'';
    //     let searchFilterID = templateObject.currentDrpDownID.get()
    //     $('#' + searchFilterID).val(earningsName);
    //     $('#' + searchFilterID + 'ID').val(earningsID);
    //     if( searchFilterID == 'earningRateSelect'){
    //         $('#expenseAccount').val(account)
    //     }
    //     $('#earningRateSettingsModal').modal('toggle');
    // });
    //On Click Deduction List
    $(document).on("click", "#tblDeductions tbody tr", function(e) {
        const table = $(this);
        let deductionName = table.find(".colDeductionsNames").text() || '';
        let deductionID = table.find(".colDeductionsID").text() || '';
        let account = table.find(".colDeductionsAccounts").text() || '';
        let searchFilterID = templateObject.currentDrpDownID.get()
        $('#' + searchFilterID).val(deductionName);
        $('#' + searchFilterID + 'ID').val(deductionID);
        if (searchFilterID == 'deductionTypeSelect') {
            $('#controlAccountDeduction').val(account)
        }
        $('#deductionSettingsModal').modal('toggle');
    });
    //On Click Superannuation List
    $(document).on("click", "#tblSuperannuation tbody tr", function(e) {
        const table = $(this);
        let name = table.find(".colSuperannuationName").text() || '';
        let ID = table.find(".colSuperannuationID").text() || '';
        let account = table.find(".colaccountname").text() || '';
        let searchFilterID = templateObject.currentDrpDownID.get()
        $('#' + searchFilterID).val(name);
        $('#' + searchFilterID + 'ID').val(ID);
        if (searchFilterID == 'superannuationFund') {
            $('#expenseSuperannuationAccount').val(account)
        }
        $('#superannuationSettingsModal').modal('toggle');
    });
    //On Click Superannuation List
    $(document).on("click", "#tblReimbursements tbody tr", function(e) {
        const table = $(this);
        let name = table.find(".colReimbursementName").text() || '';
        let ID = table.find(".colReimbursementID").text() || '';
        let account = table.find(".colReimbursementAccount").text() || '';
        let searchFilterID = templateObject.currentDrpDownID.get()
        $('#' + searchFilterID).val(name);
        $('#' + searchFilterID + 'ID').val(ID);
        if (searchFilterID == 'reimbursementTypeSelect') {
            $('#controlExpenseAccount').val(account)
        }
        $('#reimbursementSettingsModal').modal('toggle');
    });


    templateObject.loadPayRunCalendar = async() => {
        LoadingOverlay.show();

        let list = [];
        let data = await CachedHttp.get(erpObject.TPayrollCalendars, async() => {
            return await sideBarService.getCalender(initialBaseDataLoad, 0);
        }, {
            useIndexDb: true,
            useLocalStorage: false,
            validate: cachedResponse => {
                return false;
            }
        });

        data = data.response.tpayrollcalendars.map((obj) => {
            return {...obj.fields }
        });




        // data.tpayrollcalendars.forEach(element => {
        //   list.push(element.fields);
        // });
        // let splashArrayCalenderList = [];

        // data.tpayrollcalendars.forEach(calendar => {
        //   dataListAllowance = [
        //     calendar.fields.ID || "",
        //     calendar.fields.PayrollCalendarName || "",
        //     calendar.fields.PayrollCalendarPayPeriod || "",
        //     moment(calendar.fields.PayrollCalendarStartDate).format("DD/MM/YYYY") || "",
        //     moment(calendar.fields.PayrollCalendarFirstPaymentDate).format("DD/MM/YYYY") || "",
        //     '<td contenteditable="false" class="colDeleteCalenders"><span class="table-remove"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0"><i class="fa fa-remove"></i></button></span>'
        //   ];

        //   splashArrayCalenderList.push(dataListAllowance);
        // });

        templateObject.payPeriods.set(data);
        LoadingOverlay.hide();
    };

    templateObject.initPayPeriods = async() => {
        // await templateObject.loadPayRunCalendar();

        // let payPeriods = templateObject.payPeriods.get();



        // payPeriods.forEach((period) => {
        //     $('#edtPayPeriod').editableSelect(
        //         'add', `${period.PayrollCalendarName} (${period.PayrollCalendarPayPeriod})`,
        //         null,
        //         {
        //             name: "period-id",
        //             value: period.ID
        //         },
        //         {
        //             name: "period-id",
        //             value: period.ID
        //         }
        //         );
        // });

        $('#period').editableSelect('add', 'Hourly');
        $('#period').editableSelect('add', 'Daily');
        $('#period').editableSelect('add', 'Weekly');
        $('#period').editableSelect('add', 'Monthly');

    }

    templateObject.initPayPeriods();

});

/**
 * This will contain only clean code
 * Please void all duplications
 */
Template.employeescard.onRendered(function() {
    const currentEmployeeId = parseInt(FlowRouter.current().queryParams.id || 0);

    this.earnings = {
        /**
         *
         * @param {integer} employeeID
         * @param {boolean} refresh
         * @returns {Promise<object[]>} earnings
         */
        load: async(employeeID = null, refresh = false) => {
            let data = await CachedHttp.get(
                erpObject.TPayTemplateEarningLine,
                async() => {
                    const employeePayrolApis = new EmployeePayrollApi();
                    const employeePayrolEndpoint =
                        employeePayrolApis.collection.findByName(
                            employeePayrolApis.collectionNames.TPayTemplateEarningLine
                        );
                    employeePayrolEndpoint.url.searchParams.append(
                        "ListType",
                        "'Detail'"
                    );

                    const response = await employeePayrolEndpoint.fetch();
                    if (response.ok == true) {
                        return await response.json();
                    }
                    return null;
                }, {
                    forceOverride: refresh,
                    validate: (cachedResponse) => {
                        return true;
                    },
                }
            );

            let response = data.response;

            let earningLines = response.tpaytemplateearningline.map(
                (earning) => earning.fields
            );
            if (employeeID) {
                earningLines = earningLines.filter(
                    (item) => parseInt(item.EmployeeID) == parseInt(employeeID)
                );
            }

            await this.earningLines.set(earningLines);

            return earningLines;
        },
        /**
         *
         * @param {integer} earningId
         */
        delete: async(earningId) => {
            LoadingOverlay.show();
            // Here ask for removal first

            const result = await swal({
                title: "Delete Earning Line",
                text: "Are you sure you want to Delete this Earning Line?",
                type: "question",
                showCancelButton: true,
                confirmButtonText: "Yes",
            });

            if (result.value) {
                // $(e.target).parents('.earningLinesContainer').remove();

                const employeePayrolApis = new EmployeePayrollApi();
                // now we have to make the post request to save the data in database
                const apiEndpoint = employeePayrolApis.collection.findByName(
                    employeePayrolApis.collectionNames.TPayTemplateEarningLine
                );

                let earningSettings = new PayTemplateEarningLine({
                    type: "TPayTemplateEarningLine",
                    fields: new PayTemplateEarningLineFields({
                        ID: earningId,
                        Active: false,
                    }),
                });

                const ApiResponse = await apiEndpoint.fetch(null, {
                    method: "POST",
                    headers: ApiService.getPostHeaders(),
                    body: JSON.stringify(earningSettings),
                });

                // then refresh the list only
                if (ApiResponse.ok) {
                    // refresh
                    await this.earnings.load(currentEmployeeId, true);
                }
            }

            LoadingOverlay.hide();
        },
        /**
         *
         * @returns
         */
        add: async(
            fields = {
                EarningRate: $("#earningRateSelect").val(),
                CalculationType: $("input[name=calculationType]:checked").val(),
                ExpenseAccount: $("#expenseAccount").val(),
            }
        ) => {
            // let EarningRate = $('#earningRateSelect').val();
            // let CalculationType = $('input[name=calculationType]:checked').val();
            // let ExpenseAccount = $('#expenseAccount').val();

            if (fields.EarningRate == "") {
                handleValidationError(
                    "Please select Earning Rate!",
                    "earningRateSelect"
                );
                return false;
            }

            if (fields.CalculationType == "") {
                handleValidationError(
                    "Please select Calculation Type!",
                    "calculationType"
                );
                return false;
            }

            if (fields.ExpenseAccount == "") {
                handleValidationError(
                    "Please enter Expense Account!",
                    "expenseAccount"
                );
                return false;
            }

            LoadingOverlay.show();
            const employeePayrolApis = new EmployeePayrollApi();
            // now we have to make the post request to save the data in database
            const apiEndpoint = employeePayrolApis.collection.findByName(
                employeePayrolApis.collectionNames.TPayTemplateEarningLine
            );

            let payEarningLines = new PayTemplateEarningLine({
                type: "TPayTemplateEarningLine",
                fields: new PayTemplateEarningLineFields({
                    ID: 0,
                    EmployeeID: currentEmployeeId,
                    // EarningRate: EarningRate,
                    // CalculationType: CalculationType,
                    // ExpenseAccount: ExpenseAccount,
                    Amount: 0,
                    Active: true,
                    ...fields,
                }),
            });

            const ApiResponse = await apiEndpoint.fetch(null, {
                method: "POST",
                headers: ApiService.getPostHeaders(),
                body: JSON.stringify(payEarningLines),
            });

            if (ApiResponse.ok == true) {
                // Load all the earnings Line from Database
                $("input[name=calculationType]:checked").attr("checked", false);
                $("#expenseAccount").val("");
                $("#earningRateSelect").val("");
                $("#addEarningsLineModal").modal("hide");

                LoadingOverlay.hide(0);
                const result = await swal({
                    title: "Earning Line added successfully",
                    text: "",
                    type: "success",
                    showCancelButton: false,
                    confirmButtonText: "OK",
                });

                if (result.value) {
                    LoadingOverlay.show();
                    await this.earnings.load(currentEmployeeId, true);
                    LoadingOverlay.hide();
                }
            } else {
                LoadingOverlay.hide(0);
                const result = await swal({
                    title: "Oooops...",
                    text: error,
                    type: "error",
                    showCancelButton: false,
                    confirmButtonText: "Try Again",
                });

                if (result.value) {
                    await this.earnings.add(fields);
                }
            }

        },
    };



    /**
     * Load inside of this function everything needed on first page launch
     * No need to load everything that we might not even check.
     */
    this.initPage = async() => {
        LoadingOverlay.show();





        LoadingOverlay.hide();
    }

    // this.initPage();

});


Template.employeescard.events({
    // 'click #edtResidencyStatus': (e, ui) => {
    //     ui.AppTableModalData.set({
    //         title: 'Residency Status',
    //         headers: [
    //             {title: 'Title'}
    //         ],
    //         body: [
    //             {
    //                 title: 'Australian Resident',
    //                 value: true,
    //             },
    //             {
    //                 title: 'Foreign Resident',
    //                 value: false,
    //             },
    //             {
    //                 value: 'Working Holiday Maker',
    //                 title: 'Working Holiday Maker'
    //             }

    //         ]
    //     });

    //     setTimeout(() => {
    //         $('#AppTableModal').modal('toggle');
    //         $('#AppTableModal tbody tr').on('click', (event) => {
    //             const value = $(event.currentTarget).find('td').attr('value');
    //             const text = $(event.currentTarget).find('td').text();
    //             $(e.currentTarget).attr('data-value', value);
    //             $(e.currentTarget).val(text);
    //             $('#AppTableModal').modal('toggle');
    //             $('#AppTableModal tbody tr').off('click');
    //         });
    //     }, 300);
    // },
    // 'click #edtEmploymentBasis': (e, ui) => {
    //     ui.AppTableModalData.set({
    //         title: 'Employment Basis',
    //         headers: [
    //             {title: 'Title'}
    //         ],
    //         body: [
    //             {
    //                 title: 'Full-time employment',
    //                 value: 'F',
    //             },
    //             {
    //                 title: 'Part-time employment',
    //                 value: 'P',
    //             },
    //             {
    //                 title: 'Casual employment',
    //                 value: 'C',
    //             },
    //             {
    //                 title: 'Labour hire',
    //                 value: 'L',
    //             },
    //             {
    //                 title: 'Superannuation income stream',
    //                 value: 'S',
    //             },

    //         ]
    //     });

    //     setTimeout(() => {
    //         $('#AppTableModal').modal('toggle');
    //         $('#AppTableModal tbody tr').on('click', (event) => {
    //             const value = $(event.currentTarget).find('td').attr('value');
    //             const text = $(event.currentTarget).find('td').text();
    //             $(e.currentTarget).attr('data-value', value);
    //             $(e.currentTarget).val(text);
    //             $('#AppTableModal').modal('toggle');
    //             $('#AppTableModal tbody tr').off('click');
    //         });
    //     }, 300);
    // },
    // 'click #edtPayPeriod': (e, ui) => {
    // $('#period').editableSelect('add','Hourly');
    // $('#period').editableSelect('add','Daily');
    // $('#period').editableSelect('add','Weekly');
    // $('#period').editableSelect('add','Monthly');
    // ui.AppTableModalData.set({
    //     title: 'Pay Period',
    //     headers: [
    //         {title: 'Title'}
    //     ],
    //     body: [
    //         {
    //             title: 'Hourly',
    //             value: 'hourly',
    //         },
    //         {
    //             title: 'Daily',
    //             value: 'daily',
    //         },
    //         {
    //             title: 'Weekly',
    //             value: 'Weekly',
    //         },
    //         {
    //             title: 'Monthly',
    //             value: 'Monthly',
    //         },
    //     ]
    // });

    //     setTimeout(() => {
    //         $('#AppTableModal').modal('toggle');
    //         $('#AppTableModal tbody tr').on('click', (event) => {
    //             const value = $(event.currentTarget).find('td').attr('value');
    //             const text = $(event.currentTarget).find('td').text();
    //             $(e.currentTarget).attr('data-value', value);
    //             $(e.currentTarget).val(text);
    //             $('#AppTableModal').modal('toggle');
    //             $('#AppTableModal tbody tr').off('click');
    //         });
    //     }, 300);
    // },
    // 'click #edtTfnExemption': (e, ui) => {
    //     ui.AppTableModalData.set({
    //         title: 'TFN Exemption',
    //         headers: [
    //             {title: 'Title'}
    //         ],
    //         body: [
    //             {
    //                 title: 'No TFN Quoted',
    //                 value: '0',
    //             },
    //             {
    //                 title: 'TFN Pending',
    //                 value: '1',
    //             },
    //             {
    //                 title: 'TFN Exempt - Under 18',
    //                 value: '2',
    //             },
    //             {
    //                 title: 'TFN Exempt - Pensioner',
    //                 value: '3',
    //             },
    //         ]
    //     });

    //     setTimeout(() => {
    //         $('#AppTableModal').modal('toggle');
    //         $('#AppTableModal tbody tr').on('click', (event) => {
    //             const value = $(event.currentTarget).find('td').attr('value');
    //             const text = $(event.currentTarget).find('td').text();
    //             $(e.currentTarget).attr('data-value', value);
    //             $(e.currentTarget).val(text);
    //             $('#edtTaxFileNumber').val(''); // here we clear the value
    //             $('#AppTableModal').modal('toggle');
    //             $('#AppTableModal tbody tr').off('click');
    //         });
    //     }, 300);
    // },
    // 'click #leaveCalcMethodSelect': (e, ui) => {

    //     ui.AppTableModalData.set({
    //         title: 'Leave Calculation Method',
    //         headers: [
    //             {title: 'Title'}
    //         ],
    //         body: [
    //             {
    //                 title: 'Fixed Amount Each Period',
    //                 value: 'Fixed Amount Each Period',
    //             },
    //             {
    //                 title: 'Manually Recorded Rate',
    //                 value: 'Manually Recorded Rate',
    //             },
    //             {
    //                 title: 'No Calculation Required',
    //                 value: 'No Calculation Required',
    //             },
    //             {
    //                 title: 'Based on Ordinary Earnings',
    //                 value: 'Based on Ordinary Earnings',
    //             },
    //         ]
    //     });

    //     setTimeout(() => {
    //         $('#AppTableModal').modal('toggle');
    //         $('#AppTableModal tbody tr').on('click', (event) => {
    //             const value = $(event.currentTarget).find('td').attr('value');
    //             const text = $(event.currentTarget).find('td').text();
    //             $(e.currentTarget).attr('data-value', value);
    //             $(e.currentTarget).val(text);
    //             $('#AppTableModal').modal('toggle');
    //             $('#AppTableModal tbody tr').off('click');
    //         });
    //     }, 300);
    // },
    // 'click #onTerminationUnusedBalance': (e, ui) => {

    //     ui.AppTableModalData.set({
    //         title: 'On termination unused balance is:',
    //         headers: [
    //             {title: 'Title'}
    //         ],
    //         body: [
    //             {
    //                 title: 'Not Paid Out',
    //                 value: '0',
    //             },
    //             {
    //                 title: 'Paid Out',
    //                 value: '1',
    //             },
    //         ]
    //     });

    //     setTimeout(() => {
    //         $('#AppTableModal').modal('toggle');
    //         $('#AppTableModal tbody tr').on('click', (event) => {
    //             const value = $(event.currentTarget).find('td').attr('value');
    //             if( value == '1' ){
    //                 $('.eftLeaveTypeCont').removeClass('hideelement')
    //                 $("#eftLeaveType").attr('checked', false)
    //             }else{
    //                 $('.eftLeaveTypeCont').addClass('hideelement')
    //                 $('.superannuationGuaranteeCont').addClass('hideelement')
    //             }
    //             const text = $(event.currentTarget).find('td').text();
    //             $(e.currentTarget).attr('data-value', value);
    //             $(e.currentTarget).val(text);
    //             $('#AppTableModal').modal('toggle');
    //             $('#AppTableModal tbody tr').off('click');
    //         });
    //     }, 300);
    // },
    'keydown #edtTaxFileNumber': (e, ui) => {
        $('#edtTfnExemption').removeAttr('data-value');
        $('#edtTfnExemption').val('');
    },
    // 'click #edtLeavePayPeriod': (e, ui) => {
    //     ui.AppTableModalData.set({
    //         title: 'Leave Pay Period',
    //         headers: [
    //             {title: 'Title'}
    //         ],
    //         body: [
    //             {
    //                 title: 'Hourly',
    //                 value: 'hourly',
    //             },
    //             {
    //                 title: 'Fortnightly',
    //                 value: 'Fortnightly',
    //             },
    //             {
    //                 title: 'Twice Monthly',
    //                 value: 'Twice Monthly',
    //             },
    //             {
    //                 title: 'Four Weekly',
    //                 value: 'Four Weekly',
    //             },
    //             {
    //                 title: 'Monthly',
    //                 value: 'Monthly',
    //             },
    //             {
    //                 title: 'Quarterly',
    //                 value: 'Quarterly',
    //             },
    //         ]
    //     });

    //     setTimeout(() => {
    //         $('#AppTableModal').modal('toggle');
    //         $('#AppTableModal tbody tr').on('click', (event) => {
    //             const value = $(event.currentTarget).find('td').attr('value');
    //             const text = $(event.currentTarget).find('td').text();
    //             $(e.currentTarget).attr('data-value', value);
    //             $(e.currentTarget).val(text);
    //             $('#AppTableModal').modal('toggle');
    //             $('#AppTableModal tbody tr').off('click');
    //         });
    //     }, 300);
    // },
    // 'click #edtLeavePayStatus': (e, ui) => {
    //     ui.AppTableModalData.set({
    //         title: 'Leave Pay Status',
    //         headers: [
    //             {title: 'Title'}
    //         ],
    //         body: [
    //             {
    //                 title: 'Awaiting',
    //                 value: 'Awaiting',
    //             },
    //             {
    //                 title: 'Approved',
    //                 value: 'Approved',
    //             },
    //             {
    //                 title: 'Denied',
    //                 value: 'Denied',
    //             },
    //         ]
    //     });

    //     setTimeout(() => {
    //         $('#AppTableModal').modal('toggle');
    //         $('#AppTableModal tbody tr').on('click', (event) => {
    //             const value = $(event.currentTarget).find('td').attr('value');
    //             const text = $(event.currentTarget).find('td').text();
    //             $(e.currentTarget).attr('data-value', value);
    //             $(e.currentTarget).val(text);
    //             $('#AppTableModal').modal('toggle');
    //             $('#AppTableModal tbody tr').off('click');
    //         });
    //     }, 300);
    // },
    'keyup #tblLeaveRequests_filter input': function(event) {
        if ($(event.target).val() != '') {
            $(".btnRefreshLeaveRequest").addClass('btnSearchAlert');
        } else {
            $(".btnRefreshLeaveRequest").removeClass('btnSearchAlert');
        }
        if (event.keyCode == 13) {
            $(".btnRefreshLeaveRequest").trigger("click");
        }
    },
    'click .btnRefreshLeaveRequest': function(event) {
        let templateObject = Template.instance();
        let currentId = FlowRouter.current().queryParams;
        let employeeID = (!isNaN(currentId.id)) ? currentId.id : 0;
        var splashArrayLeaveList = new Array();
        const lineExtaSellItems = [];
        let dataSearchName = $('#tblLeaveRequests_filter input').val();
        if (dataSearchName.replace(/\s/g, '') != '') {
            LoadingOverlay.show();

            employeePayrollServices.getLeaveRequestByName(dataSearchName).then(function(data) {
                $(".btnRefreshLeaveRequest").removeClass('btnSearchAlert');
                let lineItems = [];
                let splashArrayList = [];
                let useData = LeaveRequest.fromList(
                    data.tleavrequest
                ).filter((item) => {
                    if (parseInt(item.fields.EmployeeID) == parseInt(employeeID)) {
                        return item;
                    }
                });
                if (useData.length > 0) {
                    for (let i = 0; i < useData.length; i++) {
                        let dataListAllowance = [
                            useData[i].fields.ID || '',
                            useData[i].fields.Description || '',
                            useData[i].fields.PayPeriod || '',
                            useData[i].fields.LeaveMethod || '',
                            useData[i].fields.Status || '',
                        ];
                        splashArrayList.push(dataListAllowance);
                    }
                    let uniqueChars = [...new Set(splashArrayLeaveList)];
                    var datatable = $('#tblLeaveRequests').DataTable();
                    datatable.clear();
                    datatable.rows.add(uniqueChars);
                    datatable.draw(false);
                    setTimeout(function() {
                        $("#tblLeaveRequests").dataTable().fnPageChange('last');
                    }, 400);

                    $('.fullScreenSpin').css('display', 'none');

                } else {
                    $('.fullScreenSpin').css('display', 'none');

                    swal({
                        title: 'Question',
                        text: "Leave Request does not exist, would you like to create it?",
                        type: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Yes',
                        cancelButtonText: 'No'
                    }).then((result) => {
                        if (result.value) {
                            $('#leaveRequestForm')[0].reset();
                            $('#edtLeaveTypeofRequest').val(dataSearchName);
                            $('#tblLeaveRequests').modal('hide');
                            $('#newLeaveRequestModal').modal('show');
                        }
                    });
                }
            }).catch(function(err) {
                $('.fullScreenSpin').css('display', 'none');
            });
        } else {
            $(".btnSearchAlert").trigger("click");
        }
    },
    'keyup #tblAssignLeaveTypes_filter input': function(event) {
        if ($(event.target).val() != '') {
            $(".btnRefreshAssignLeave").addClass('btnSearchAlert');
        } else {
            $(".btnRefreshAssignLeave").removeClass('btnSearchAlert');
        }
        if (event.keyCode == 13) {
            $(".btnRefreshAssignLeave").trigger("click");
        }
    },
    'click .btnRefreshAssignLeave': function(event) {
        let templateObject = Template.instance();
        let currentId = FlowRouter.current().queryParams;
        let employeeID = (!isNaN(currentId.id)) ? currentId.id : 0;
        var splashArrayLeaveList = new Array();
        const lineExtaSellItems = [];
        let dataSearchName = $('#tblAssignLeaveTypes_filter input').val();
        if (dataSearchName.replace(/\s/g, '') != '') {
            LoadingOverlay.show();

            employeePayrollServices.getAssignLeaveTypeByName(dataSearchName).then(function(data) {
                $(".btnRefreshAssignLeave").removeClass('btnSearchAlert');
                let lineItems = [];
                let useData = AssignLeaveType.fromList(
                    data.tassignleavetype
                ).filter((item) => {
                    if (parseInt(item.fields.EmployeeID) == parseInt(employeeID) && item.fields.Active == true) {
                        return item;
                    }
                });
                if (useData.length > 0) {
                    for (let i = 0; i < useData.length; i++) {
                        let dataListAllowance = [
                            useData[i].fields.ID || '',
                            useData[i].fields.LeaveType || '',
                            useData[i].fields.LeaveCalcMethod || '',
                            useData[i].fields.HoursAccruedAnnually || '',
                            useData[i].fields.HoursAccruedAnnuallyFullTimeEmp || '',
                            useData[i].fields.HoursFullTimeEmpFortnightlyPay || '',
                            useData[i].fields.HoursLeave || '',
                            useData[i].fields.OpeningBalance || '',
                            ((useData[i].fields.OnTerminationUnusedBalance) ? 'Paid Out' : 'Not Paid Out'),
                            `<button type="button" class="btn btn-danger btnDeleteAssignLeaveType" id="btnDeleteAssignLeaveType" data-id="` + useData[i].fields.ID + `"><i class="fas fa-trash"></i></button>`
                        ];
                        splashArrayAssignLeaveList.push(dataListAllowance);
                    }
                    let uniqueChars = [...new Set(splashArrayLeaveList)];
                    var datatable = $('#tblAssignLeaveTypes').DataTable();
                    datatable.clear();
                    datatable.rows.add(uniqueChars);
                    datatable.draw(false);
                    setTimeout(function() {
                        $("#tblAssignLeaveTypes").dataTable().fnPageChange('last');
                    }, 400);

                    $('.fullScreenSpin').css('display', 'none');

                } else {
                    $('.fullScreenSpin').css('display', 'none');

                    swal({
                        title: 'Question',
                        text: "Assign Leave does not exist, would you like to create it?",
                        type: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Yes',
                        cancelButtonText: 'No'
                    }).then((result) => {
                        if (result.value) {
                            $('#assignLeaveTypeForm')[0].reset();
                            $('#leaveTypeSelect').val(dataSearchName);
                            $('#assignLeaveTypeSettingsModal').modal('hide');
                            $('#assignLeaveTypeModal').modal('show');
                        }
                    });
                }
            }).catch(function(err) {
                $('.fullScreenSpin').css('display', 'none');
            });
        } else {
            $(".btnSearchAlert").trigger("click");
        }
    },
    'keyup .txtSearchCustomer': function(event) {
        if ($(event.target).val() != '') {
            $(".btnRefreshEmployees").addClass('btnSearchAlert');
        } else {
            $(".btnRefreshEmployees").removeClass('btnSearchAlert');
        }
        if (event.keyCode == 13) {
            $(".btnRefreshEmployees").trigger("click");
        }
    },
    'click .btnRefreshEmployees': async function(event) {
        let templateObject = Template.instance();
        let utilityService = new UtilityService();
        let tableProductList;
        const dataTableList = [];
        var splashArrayInvoiceList = new Array();
        const lineExtaSellItems = [];
        const self = this;
        let lineItems = [];
        let lineItemObj = {};
        let currentId = FlowRouter.current().queryParams;
        LoadingOverlay.show();

        let dataSearchName = $('.txtSearchCustomer').val() || '';
        if (dataSearchName.replace(/\s/g, '') != '') {
            sideBarService.getNewEmployeeByNameOrID(dataSearchName).then(async function(data) {
                $(".btnRefreshEmployees").removeClass('btnSearchAlert');
                let lineItems = [];
                let lineItemObj = {};
                if (data.temployee.length > 0) {
                    $("#tblEmployeeSideList > tbody").empty();
                    for (let i = 0; i < data.temployee.length; i++) {
                        let classname = '';
                        if (!isNaN(currentId.id)) {
                            if (useData[i].fields.ID == parseInt(currentId.id)) {
                                classname = 'currentSelect';
                            }
                        }
                        var dataList = {
                            id: data.temployee[i].fields.ID || '',
                            company: data.temployee[i].fields.EmployeeName || '',
                            classname: classname
                        };
                        $(".tblEmployeeSideList > tbody").append(
                            ' <tr id="' + dataList.id + '" style="cursor: pointer;">' +
                            '<td data-toggle="tooltip" data-bs-tooltip="" data-placement="bottom" title="' + dataList.company + '" id="' + dataList.id + '" class="' + dataList.classname + '" >' + dataList.company + '</td>' +
                            '</tr>');
                        lineItems.push(dataList);
                    }

                    setTimeout(function() {
                        $('.counter').text(lineItems.length + ' items');
                    }, 100);
                    $('.fullScreenSpin').css('display', 'none');
                } else {
                    $('.fullScreenSpin').css('display', 'none');
                }
            }).catch(function(err) {
                $('.fullScreenSpin').css('display', 'none');
            });
        } else {
            Meteor._reload.reload();
            $('.fullScreenSpin').css('display', 'none');
        }
    },
    'click .closeModel': function(e) {
        $('.modal').modal('hide');
    },
    'click #customerShipping-1': function(event) {
        if ($(event.target).is(':checked')) {
            $('.customerShipping-2').css('display', 'none');
        } else {
            $('.customerShipping-2').css('display', 'block');
        }
    },
    'click .tabproductsservices:not(.active)': (event, ui) => {
        let currentId = FlowRouter.current().queryParams.id;
        ui.getEmployeeProducts(currentId);
        //let tempCurrenctTRePService = templateObject.allrepservicedata.get() || '';

        // if (currentId) {
        //     if (tempCurrenctTRePService.length > 0) {
        //         $('.fullScreenSpin').css('display', 'none');
        //     } else {
        //         templateObject.getAllSelectedProducts(currentId);
        //     }
        // } else {
        //     $('.fullScreenSpin').css('display', 'none');
        // }
    },
    'click .colServiceDelete button': async(event, templateObject) => {
        const productId = $(event.currentTarget).attr('product-id');
        await templateObject.removeSelectedProduct(productId);

        return;

        var targetID = $(event.target).closest('tr').find('.colID').text() || ''; // table row ID
        let contactService = new ContactService();
        var tblRepService = $('#tblEmpServiceList').DataTable();
        tblRepService.$('tr.selected').removeClass('selected');
        $(event.target).closest('tr').addClass('selected');
        // if ( $(event.target).closest('tr').hasClass('selected') ) {
        //     $(event.target).closest('tr').removeClass('selected');
        // }else {
        //     //tblRepService.$('tr.selected').removeClass('selected');
        //     $(event.target).closest('tr').addClass('selected');
        // }

        //$('#selectDeleteServiceID').val(targetID);
        //$('#deleteServiceModal').modal('toggle');

        swal({
            title: 'Delete Active Product',
            text: "Are you sure you want to Delete this Employee Active Product?",
            type: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes'
        }).then((result) => {
            if (result.value) {
                //LoadingOverlay.show();


                if ($.isNumeric(targetID)) {
                    var objDetails = {
                        type: "TRepServices",
                        fields: {
                            ID: parseInt(targetID) || 0,
                            Active: false
                        }
                    };
                    contactService.saveEmployeeProducts(objDetails).then(function(data) {});
                } else {

                }

                //$(event.target).closest('tr').remove();
                tblRepService.row('.selected').remove().draw(false);
            } else {
                tblRepService.$('tr.selected').removeClass('selected');
                $('.fullScreenSpin').css('display', 'none');
            }
        });
    },
    'click .btnRefreshProductService': (event, ui) => {
        let currentId = FlowRouter.current().queryParams.id;
        ui.getEmployeeProducts(currentId);

        // LoadingOverlay.show();
        // let templateObject = Template.instance();
        // let currentId = FlowRouter.current().queryParams;
        // if(FlowRouter.current().queryParams.id){
        //     templateObject.getAllSelectedProducts(FlowRouter.current().queryParams.id);
        //     window.open('/employeescard?id=' + currentId.id +'&transTab=prod', '_self');
        // } else {
        //     $('.fullScreenSpin').css('display', 'none');
        // }

        // let templateObject = Template.instance();
        // var targetID = $(event.target).closest('tr').attr('id'); // table row ID
        // $('#selectDeleteServiceID').val(targetID);
        // $('#deleteServiceModal').modal('toggle');
    },
    'click .btnDeleteProductService': function(event) {
        playDeleteAudio();
        let selectLineID = $('#selectDeleteServiceID').val() || '';
        let contactService = new ContactService();
        if ($.isNumeric(selectLineID)) {
            const objDetails = {
                type: "TRepServices",
                fields: {
                    ID: parseInt(selectLineID) || 0,
                    Active: false
                }
            };
            contactService.saveEmployeeProducts(objDetails).then(function(data) {});
        } else {

        }
        $('#' + selectLineID).closest('tr').remove();
        $('#deleteServiceModal').modal('toggle');
    },
    'click .chkServiceCardTest': function() {
        const templateObject = Template.instance();
        let selectedproduct = [];
        // const selectedAwaitingPayment2 = [];
        $('.chkServiceCard:checkbox:checked').each(function() {
            let productName = $(this).closest('tr').find('.productName').text();
            // let paymentTransObj = {
            //         type: "TRepServices",
            //         fields: {
            //             EmployeeName: Session.get('mySessionEmployee') || '',
            //             ServiceDesc: productName
            //         }
            //
            // };
            selectedproduct.push(productName);
        });
        templateObject.selectedemployeeproducts.set(selectedproduct);
    },
    'click .chkBoxAll': function() {
        if ($(event.target).is(':checked')) {
            $(".chkBox").prop("checked", true);
            $("#addAllProducts").prop("checked", true);
            $('.activeProductEmployee').css('display', 'none');
        } else {
            $(".chkBox").prop("checked", false);
            $("#addAllProducts").prop("checked", false);
            $('.activeProductEmployee').css('display', 'block');
        }
    },
    'click .btnSelectProducts': (event, templateObject) => {
        templateObject.addSelectedProduct();
    },
    'click .btnSave': async(e, templateObject) => {
        playSaveAudio();
        await templateObject.saveSelectedProduct();
        let contactService = new ContactService();
        let appointmentService = new AppointmentService();
        let uploadedItems = templateObject.uploadedFiles.get();
        setTimeout(async function() {
            LoadingOverlay.show();
            let title = $('#editEmployeeTitle').val();
            let firstname = $('#edtFirstName').val();
            if (firstname === '') {
                $('.fullScreenSpin').css('display', 'none');
                // Bert.alert('<strong>WARNING:</strong> First Name cannot be blank!', 'warning');
                swal('Please provide the first name !', '', 'warning');
                e.preventDefault();
                $('#edtFirstName').focus();
            }
            let middlename = $('#edtMiddleName').val() || '';
            let lastname = $('#edtLastName').val() || '';
            let suffix = $('#edtSuffix').val() || '';
            let email = $('#edtEmailAddress').val() || '';
            let phone = $('#edtPhone').val() || '';
            let mobile = $('#edtMobile').val() || '';
            let fax = $('#edtFax').val() || '';
            let skype = $('#edtSkype').val() || '';
            let gender = $('#edtGender').val() || '';
            let employeeName = $('#edtCustomerCompany').val() || '';
            const dateofbirthTime = new Date($("#dtDOB").datepicker("getDate"));
            const startdateTime = new Date($("#dtStartingDate").datepicker("getDate"));
            let dateofbirth = dateofbirthTime.getFullYear() + "-" + (dateofbirthTime.getMonth() + 1) + "-" + dateofbirthTime.getDate();
            let startdate = startdateTime.getFullYear() + "-" + (startdateTime.getMonth() + 1) + "-" + startdateTime.getDate();
            let employeeID = $('#edtEmployeeID').val();
            let position = $('#edtPosition').val();
            let webiste = $('#edtWebsite').val();
            let streetaddress = $('#edtStreetAddress').val();
            let city = $('#edtCity').val();
            let state = $('#edtState').val();
            let postalcode = $('#edtPostalCode').val();
            let country = $('#edtCountry').val();
            if (mobile != '') {
                mobile = contactService.changeDialFormat(mobile, country);
            }
            if (phone != '') {
                phone = contactService.changeDialFormat(phone, country);
            }

            let custField4 = $('#edtCustomeField4').val();
            // add to custom field
            let custField1 = $('#edtSaleCustField1').val() || '';
            let custField2 = $('#edtSaleCustField2').val() || '';
            let custField3 = $('#edtSaleCustField3').val() || '';
            let priorityData = $('#edtPriority').val() || '';

            let notes = $('#txaNotes').val();
            const url = FlowRouter.current().path;
            const getemp_id = url.split('?id=');
            //var currentEmployee = getemp_id[getemp_id.length-1];
            let currentEmployee = 0;
            let overrideGlobalCalendarSet = "false";
            let useProductCostaspayRate = "false";
            let includeAllProducts = "false";

            if ($('#overridesettings').is(':checked')) {
                overrideGlobalCalendarSet = "true";
            }
            if ($('#productCostPayRate').is(':checked')) {
                useProductCostaspayRate = "true";
            }
            if ($('#addAllProducts').is(':checked')) {
                includeAllProducts = "true";
            }
            let currentId = FlowRouter.current().queryParams;

            if ((priorityData.replace(/\s/g, '') != '') && (priorityData.replace(/\s/g, '') != 0)) {
                let checkEmpPriorityData = await contactService.getCheckCustomersPriority(priorityData);
                if (checkEmpPriorityData.temployee.length) {
                    if (checkEmpPriorityData.temployee[0].Id === parseInt(currentId.id)) {} else {
                        $('.fullScreenSpin').css('display', 'none');
                        swal({
                            title: 'Sort Order already in use',
                            text: 'Please enter another.',
                            type: 'warning',
                            showCancelButton: false,
                            confirmButtonText: 'OK'
                        }).then((result) => {});
                        return false;
                    }
                }
            }
            let objDetails = '';

            let imageData = '';
            if (templateObject.imageFileData.get()) {
                imageData = templateObject.imageFileData.get().split(',')[1] || '';
            }

            let edtDashboardOptions = $('#edtDashboardOptions').val() || '';
            let utilityService = new UtilityService();
            let edtSalesQuota = $('#edtSalesQuota').val() || '';
            edtSalesQuota = utilityService.removeCurrency(edtSalesQuota);
            if (!isNaN(currentId.id)) {
                currentEmployee = parseInt(currentId.id);
                objDetails = {
                    type: "TEmployeeEx",
                    fields: {
                        ID: currentEmployee,
                        Title: title,
                        FirstName: firstname,
                        MiddleName: middlename,
                        LastName: lastname,
                        TFN: suffix,
                        FaxNumber: fax,
                        Email: email,
                        Phone: phone,
                        Mobile: mobile,
                        SkypeName: skype,
                        Sex: gender,
                        DOB: dateofbirth || '',
                        DateStarted: startdate || '',
                        Position: position,
                        Street: streetaddress,
                        Street2: city,
                        State: state,
                        PostCode: postalcode,
                        Country: country,
                        Notes: notes,
                        Attachments: uploadedItems,
                        CustFld1: custField1,
                        CustFld2: custField2,
                        CustFld3: custField3,
                        CustFld4: custField4,
                        CustFld5: $('#edtPriority').val(),
                        CustFld6: $('#favcolor').val(),
                        CustFld14: overrideGlobalCalendarSet,
                        CustFld7: useProductCostaspayRate,
                        CustFld8: includeAllProducts,
                        CustFld11: edtDashboardOptions, // tempcode until the fields are added in backend
                        CustFld12: edtSalesQuota // tempcode
                    }
                };
            } else {
                objDetails = {
                    type: "TEmployeeEx",
                    fields: {
                        Title: title,
                        FirstName: firstname,
                        MiddleName: middlename,
                        LastName: lastname,
                        TFN: suffix,
                        FaxNumber: fax,
                        Email: email,
                        Phone: phone,
                        Mobile: mobile,
                        SkypeName: skype,
                        Sex: gender,
                        DOB: dateofbirth || '',
                        DateStarted: startdate || '',
                        Position: position,
                        Street: streetaddress,
                        Street2: city,
                        State: state,
                        PostCode: postalcode,
                        Country: country,
                        Notes: notes,
                        Attachments: uploadedItems,
                        CustFld1: custField1,
                        CustFld2: custField2,
                        CustFld3: custField3,
                        CustFld4: custField4,
                        CustFld5: $('#edtPriority').val(),
                        CustFld6: $('#favcolor').val(),
                        CustFld14: overrideGlobalCalendarSet,
                        CustFld7: useProductCostaspayRate,
                        CustFld8: includeAllProducts,
                        CustFld11: edtDashboardOptions, // tempcode until the fields are added in backend
                        CustFld12: edtSalesQuota // tempcode

                    }
                };
            }
            contactService.saveEmployeeEx(objDetails).then(function(objDetails) {
                let employeeSaveID = objDetails.fields.ID;
                sideBarService.getAllEmployees(initialBaseDataLoad, 0).then(function(dataReload) {
                    addVS1Data('TEmployee', JSON.stringify(dataReload));
                }).catch(function(err) {

                });

                $('#selectEmployeeID').val(employeeSaveID);
                // var erpUserID = $("#erpEmpID").val();
                let employeePicObj = "";
                if ($('.cloudEmpImgID').val() == "") {
                    employeePicObj = {
                        type: "TEmployeePicture",
                        fields: {
                            EmployeeName: employeeName,
                            EncodedPic: imageData
                        }
                    }
                } else {
                    employeePicObj = {
                        type: "TEmployeePicture",
                        fields: {
                            ID: parseInt($('.cloudEmpImgID').val()),
                            EmployeeName: employeeName,
                            EncodedPic: imageData
                        }
                    }
                }

                contactService.saveEmployeePicture(employeePicObj).then(function(employeePicObj) {});

                const tblSelectedInventoryService = $(".tblEmpServiceList").dataTable();
                if (includeAllProducts == "true") {

                } else {
                    $(".colServiceName", tblSelectedInventoryService).each(function() {
                        const lineID = $(this).closest('tr').find('.colID').text() || ''; // table row ID
                        let tdproduct = $(this).text() || '';
                        //$('#' + lineID + " .colServiceName").text()||'';
                        let tddescription = $(this).closest('tr').find('.colServiceDescription').text() || '';
                        //$('#' + lineID + " .colServiceDescription").text()||'';
                        let tdCostPrice = $(this).closest('tr').find('.colServiceCostPrice').val() || Currency + 0;
                        //$('#' + lineID + " .colServiceCostPrice").val() || 0;

                        let tdSalePrice = $(this).closest('tr').find('.colServiceSalesPrice').val() || Currency + 0;
                        //$('#' + lineID + " .colServiceSalesPrice").val()|| 0;
                        //$('#' + lineID + " .colServiceSalesPrice").val()|| 0;
                        let paymentTransObj = '';
                        if (tdproduct != '' && tdproduct != 'Name') {
                            if ($.isNumeric(lineID)) {
                                paymentTransObj = {
                                    type: "TRepServices",
                                    fields: {
                                        ID: parseInt(lineID) || 0,
                                        EmployeeName: employeeName || '',
                                        Rate: Number(tdCostPrice.replace(/[^0-9.-]+/g, "")) || 0,
                                        PayRate: Number(tdSalePrice.replace(/[^0-9.-]+/g, "")) || 0,
                                        ServiceDesc: tdproduct || ''
                                    }
                                };
                            } else {
                                paymentTransObj = {
                                    type: "TRepServices",
                                    fields: {
                                        EmployeeName: employeeName || '',
                                        Rate: Number(tdCostPrice.replace(/[^0-9.-]+/g, "")) || 0,
                                        PayRate: Number(tdSalePrice.replace(/[^0-9.-]+/g, "")) || 0,
                                        ServiceDesc: tdproduct || ''
                                    }
                                };
                            }
                            contactService.saveEmployeeProducts(paymentTransObj).then(function(paymentTransObj) {

                            });
                        }
                    });
                }

                let showSat = false;
                let showSun = false;
                let overrideGlobalCalendarSet = "false";
                if ($('#showSaturday').is(':checked')) {
                    showSat = true;
                }

                if ($('#showSunday').is(':checked')) {
                    showSun = true;
                }

                if ($('#overridesettings').is(':checked')) {
                    overrideGlobalCalendarSet = overrideGlobalCalendarSet;
                }

                let settingID = '';
                let calOptions = templateObject.calendarOptions.get();
                if (calOptions) {
                    settingID = calOptions.id;
                }

                let defaultTime = parseInt($('#defaultTime').val().split(' ')[0]) || 2;
                let defaultProduct = $('#product-list').val() || '';
                let defaultProductID = $('#product-listID').val() || 0;

                let objectData = "";
                if (settingID == "") {
                    objectData = {
                        type: "TAppointmentPreferences",
                        fields: {
                            EmployeeID: employeeSaveID,
                            DefaultApptDuration: defaultTime,
                            DefaultServiceProductID: defaultProductID,
                            DefaultServiceProduct: defaultProduct,
                            ShowSaturdayinApptCalendar: showSat,
                            ShowSundayinApptCalendar: showSun
                        }
                    };
                } else {
                    objectData = {
                        type: "TAppointmentPreferences",
                        fields: {
                            ID: settingID,
                            EmployeeID: employeeSaveID,
                            DefaultApptDuration: defaultTime,
                            DefaultServiceProductID: defaultProductID,
                            DefaultServiceProduct: defaultProduct,
                            ShowSaturdayinApptCalendar: showSat,
                            ShowSundayinApptCalendar: showSun
                        }
                    };
                }
                appointmentService.saveAppointmentPreferences(objectData).then(function(data) {
                    var cloudDBID = Session.get('mycloudLogonDBID');
                    sideBarService.getAllAppointmentPredList().then(function(dataAPPPref) {
                        addVS1Data('TAppointmentPreferences', JSON.stringify(dataAPPPref)).then(function(datareturn) {

                        }).catch(function(err) {

                        });
                    }).catch(function(err) {

                    });

                    // var logonName = $("#cloudEmpLogonName").val();
                    var enteredEmail = $("#cloudEmpEmailAddress").val();
                    var checkifupdate = $("#cloudCheckEmpEmailAddress").val();
                    var enteredPassword = $("#cloudEmpUserPassword").val();
                    let cloudpassword = $("#cloudEmpUserPassword").val() && $("#cloudEmpUserPassword").val().replace(/;/g, ",");
                    let cloudcheckpassword = $("#cloudCheckEmpUserPassword").val();
                    if (($.trim(enteredEmail).length != 0) && ($.trim(enteredPassword).length != 0)) {
                        if (cloudpassword && cloudcheckpassword && cloudpassword.toUpperCase() != cloudcheckpassword.toUpperCase()) {
                            var cloudHashPassword = CryptoJS.MD5(enteredPassword).toString().toUpperCase();
                            if ($.trim(checkifupdate).length != 0) {

                                if (cloudpassword.length < 8) {

                                    swal('Invalid VS1 Password', 'Password must be at least eight characters including one capital letter and one number!', 'error');
                                    $('#cloudEmpUserPassword').css('border-color', 'red');
                                    $('#cloudEmpUserPassword').focus();

                                    $('.fullScreenSpin').css('display', 'none');
                                    return false;
                                } else {
                                    var erpGet = erpDb();

                                    let objDetailsUserPassword = {
                                        //JsonIn:{
                                        Name: "VS1_ChangePassword",
                                        Params: {
                                            // FirstName: firstname,
                                            // LastName: lastname,
                                            // EmployeeName: $('#edtCustomerCompany').val(),
                                            ERPLoginDetails: {
                                                erpusername: $('#cloudCheckEmpEmailAddress').val(),
                                                // VS1Password: $('#cloudCheckEmpUserPassword').val(),
                                                NewPassword: cloudpassword
                                            }
                                        }
                                        //}
                                    };
                                    if (cloudpassword.toUpperCase() != cloudcheckpassword.toUpperCase()) {

                                        var oPost = new XMLHttpRequest();
                                        oPost.open("POST", URLRequest + loggedserverIP + ':' + loggedserverPort + '/' + 'erpapi/VS1_Cloud_Task/Method?Name="VS1_ChangePassword"', true);
                                        oPost.setRequestHeader("database", vs1loggedDatatbase);
                                        oPost.setRequestHeader("username", 'VS1_Cloud_Admin');
                                        oPost.setRequestHeader("password", 'DptfGw83mFl1j&9');
                                        oPost.setRequestHeader("Accept", "application/json");
                                        oPost.setRequestHeader("Accept", "application/html");
                                        oPost.setRequestHeader("Content-type", "application/json");

                                        //var myString = '"JsonIn"' + ':' + JSON.stringify(objDetailsUser);
                                        var myStringUserPassword = '"JsonIn"' + ':' + JSON.stringify(objDetailsUserPassword);
                                        //
                                        oPost.send(myStringUserPassword);

                                        oPost.onreadystatechange = function() {
                                            if (oPost.readyState == 4 && oPost.status == 200) {
                                                var myArrResponsData = JSON.parse(oPost.responseText);

                                                if (myArrResponsData.ProcessLog.ResponseNo == 401) {
                                                    swal({
                                                        title: 'VS1 Change User Password Failed',
                                                        text: myArrResponsData.ProcessLog.ResponseStatus,
                                                        type: 'error',
                                                        showCancelButton: false,
                                                        confirmButtonText: 'OK'
                                                    }).then((result) => {
                                                        if (result.value) {
                                                            FlowRouter.go('/employeelist?success=true');
                                                        } else {
                                                            FlowRouter.go('/employeelist?success=true');
                                                        }
                                                    });
                                                } else {
                                                    if (employeeSaveID) {
                                                        sideBarService.getAllEmployees(initialBaseDataLoad, 0).then(function(dataReload) {
                                                            addVS1Data('TEmployee', JSON.stringify(dataReload)).then(function(datareturn) {}).catch(function(err) {});
                                                        }).catch(function(err) {});

                                                        getVS1Data('vscloudlogininfo').then(function(dataObject) {
                                                            if (dataObject.length == 0) {
                                                                swal({
                                                                    title: 'Password successfully changed',
                                                                    text: '',
                                                                    type: 'success',
                                                                    showCancelButton: false,
                                                                    confirmButtonText: 'OK'
                                                                }).then((result) => {
                                                                    if (result.value) {
                                                                        FlowRouter.go('/employeelist?success=true');
                                                                    } else {
                                                                        FlowRouter.go('/employeelist?success=true');
                                                                    }
                                                                });
                                                            } else {
                                                                let loginDataArray = [];
                                                                if (dataObject[0].EmployeeEmail === $('#cloudCheckEmpEmailAddress').val()) {
                                                                    loginDataArray = dataObject[0].data;
                                                                    loginDataArray.ProcessLog.VS1AdminPassword = cloudpassword;
                                                                    addLoginData(loginDataArray).then(function(datareturnCheck) {
                                                                        swal({
                                                                            title: 'Password successfully changed',
                                                                            text: '',
                                                                            type: 'success',
                                                                            showCancelButton: false,
                                                                            confirmButtonText: 'OK'
                                                                        }).then((result) => {
                                                                            if (result.value) {
                                                                                window.open('/', '_self');
                                                                            } else {
                                                                                window.open('/', '_self');
                                                                            }
                                                                        });

                                                                    }).catch(function(err) {
                                                                        swal({
                                                                            title: 'Password successfully changed',
                                                                            text: '',
                                                                            type: 'success',
                                                                            showCancelButton: false,
                                                                            confirmButtonText: 'OK'
                                                                        }).then((result) => {
                                                                            if (result.value) {
                                                                                window.open('/', '_self');
                                                                            } else {
                                                                                window.open('/', '_self');
                                                                            }
                                                                        });
                                                                    });

                                                                } else {
                                                                    swal({
                                                                        title: 'Password successfully changed',
                                                                        text: '',
                                                                        type: 'success',
                                                                        showCancelButton: false,
                                                                        confirmButtonText: 'OK'
                                                                    }).then((result) => {
                                                                        if (result.value) {
                                                                            FlowRouter.go('/employeelist?success=true');
                                                                        } else {
                                                                            FlowRouter.go('/employeelist?success=true');
                                                                        }
                                                                    });
                                                                }
                                                            }
                                                        }).catch(function(err) {
                                                            swal({
                                                                title: 'Password successfully changed',
                                                                text: '',
                                                                type: 'success',
                                                                showCancelButton: false,
                                                                confirmButtonText: 'OK'
                                                            }).then((result) => {
                                                                if (result.value) {
                                                                    FlowRouter.go('/employeelist?success=true');
                                                                } else {
                                                                    FlowRouter.go('/employeelist?success=true');
                                                                }
                                                            });
                                                        });

                                                    }

                                                }

                                            } else if (oPost.readyState == 4 && oPost.status == 403) {
                                                $('.fullScreenSpin').css('display', 'none');
                                                swal({
                                                    title: 'Oooops...',
                                                    text: oPost.getResponseHeader('errormessage'),
                                                    type: 'error',
                                                    showCancelButton: false,
                                                    confirmButtonText: 'Try Again'
                                                }).then((result) => {
                                                    if (result.value) {
                                                        window.open('/employeescard', '_self');
                                                    } else if (result.dismiss === 'cancel') {
                                                        window.open('/employeescard', '_self');
                                                    }
                                                });
                                            } else if (oPost.readyState == 4 && oPost.status == 406) {
                                                $('.fullScreenSpin').css('display', 'none');
                                                var ErrorResponse = oPost.getResponseHeader('errormessage');
                                                var segError = ErrorResponse.split(':');

                                                if ((segError[1]) == ' "Unable to lock object') {

                                                    swal({
                                                        title: 'Oooops...',
                                                        text: oPost.getResponseHeader('errormessage'),
                                                        type: 'error',
                                                        showCancelButton: false,
                                                        confirmButtonText: 'Try Again'
                                                    }).then((result) => {
                                                        if (result.value) {
                                                            window.open('/employeescard', '_self');
                                                        } else if (result.dismiss === 'cancel') {
                                                            window.open('/employeescard', '_self');
                                                        }
                                                    });
                                                } else {
                                                    swal({
                                                        title: 'Oooops...',
                                                        text: oPost.getResponseHeader('errormessage'),
                                                        type: 'error',
                                                        showCancelButton: false,
                                                        confirmButtonText: 'Try Again'
                                                    }).then((result) => {
                                                        if (result.value) {
                                                            window.open('/employeescard', '_self');
                                                        } else if (result.dismiss === 'cancel') {
                                                            window.open('/employeescard', '_self');
                                                        }
                                                    });
                                                }

                                            } else if (oPost.readyState == '') {

                                                swal({
                                                    title: 'Oooops...',
                                                    text: oPost.getResponseHeader('errormessage'),
                                                    type: 'error',
                                                    showCancelButton: false,
                                                    confirmButtonText: 'Try Again'
                                                }).then((result) => {
                                                    if (result.value) {
                                                        window.open('/employeescard', '_self');
                                                    } else if (result.dismiss === 'cancel') {
                                                        window.open('/employeescard', '_self');
                                                    }
                                                });
                                            } else {
                                                $('.fullScreenSpin').css('display', 'none');
                                            }
                                        }

                                    } else {
                                        if (employeeSaveID) {
                                            //window.open('/employeescard?id=' + employeeSaveID,'_self');
                                            sideBarService.getAllEmployees(25, 0).then(function(dataReload) {
                                                addVS1Data('TEmployee', JSON.stringify(dataReload)).then(function(datareturn) {
                                                    //FlowRouter.go('/employeelist?success=true');
                                                    sideBarService.getAllAppointmentPredList().then(function(data) {
                                                        addVS1Data('TAppointmentPreferences', JSON.stringify(data)).then(function(datareturn) {
                                                            FlowRouter.go('/employeelist?success=true');
                                                        }).catch(function(err) {
                                                            FlowRouter.go('/employeelist?success=true');
                                                        });
                                                    }).catch(function(err) {
                                                        FlowRouter.go('/employeelist?success=true');
                                                    });
                                                }).catch(function(err) {
                                                    FlowRouter.go('/employeelist?success=true');
                                                });
                                            }).catch(function(err) {
                                                FlowRouter.go('/employeelist?success=true');
                                            });
                                        }
                                    }

                                }
                            } else {
                                $('.fullScreenSpin').css('display', 'none');
                                $('#addvs1userModal').modal('toggle');

                            }

                        } else {
                            FlowRouter.go('/employeelist?success=true');
                        }

                    } else {
                        if (employeeSaveID) {
                            //window.open('/employeescard?id=' + employeeSaveID,'_self');
                            sideBarService.getAllEmployees(25, 0).then(function(dataReload) {
                                addVS1Data('TEmployee', JSON.stringify(dataReload)).then(function(datareturn) {
                                    sideBarService.getAllAppointmentPredList().then(function(dataAPPPref) {
                                        addVS1Data('TAppointmentPreferences', JSON.stringify(dataAPPPref)).then(function(datareturn) {
                                            FlowRouter.go('/employeelist?success=true');
                                        }).catch(function(err) {
                                            FlowRouter.go('/employeelist?success=true');
                                        });
                                    }).catch(function(err) {
                                        FlowRouter.go('/employeelist?success=true');
                                    });
                                }).catch(function(err) {
                                    FlowRouter.go('/employeelist?success=true');
                                });
                            }).catch(function(err) {
                                sideBarService.getAllAppointmentPredList().then(function(dataAPPPref) {
                                    addVS1Data('TAppointmentPreferences', JSON.stringify(dataAPPPref)).then(function(datareturn) {
                                        FlowRouter.go('/employeelist?success=true');
                                    }).catch(function(err) {
                                        FlowRouter.go('/employeelist?success=true');
                                    });
                                }).catch(function(err) {
                                    FlowRouter.go('/employeelist?success=true');
                                });
                            });
                        }
                    }
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
                        //Meteor._reload.reload();
                    } else if (result.dismiss === 'cancel') {}
                });
                $('.fullScreenSpin').css('display', 'none');
            });
        }, delayTimeAfterSound);
    },
    'click .btnDownloadPayslip': async function(event) {
        // $('.fullScreenSpin').css('display', 'block');
        let PayPeriod = $(event.target).parents('tr').find('.colPayslipPeriod').text();
        let PaymentDate = $(event.target).parents('tr').find('.colPayslipPaymentDate').text();
        let TotalPay = $(event.target).parents('tr').find('.colPayslipTotalPay').text();
        let EmployeeName = $('#edtCustomerCompany').val();
        let EmployeeEmail = $('#edtEmailAddress').val();
        let FirstName = $('#edtFirstName').val();
        let LastName = $('#edtLastName').val();
        let Phone = $('#edtPhone').val();
        let DOB = $('#dtDOB').val();
        let doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(EmployeeName, 20, 40);
        doc.text(EmployeeEmail, 50, 40);
        doc.text(DOB, 20, 50);
        doc.text(Phone, 50, 50);
        doc.text(EmployeeName, 20, 70);
        doc.text(PaymentDate, 50, 70);
        doc.text(PayPeriod, 20, 80);
        doc.text(TotalPay, 50, 80);
        doc.setFontType('bold');
        doc.save("Payslip.pdf");
    },
    'click #btnPayslip': async function(event) {
        let templateObject = Template.instance();
        let currentId = FlowRouter.current().queryParams;
        let employeeID = (!isNaN(currentId.id)) ? currentId.id : 0;
        let period = $('#period').val();
        let ID = $('#periodID').val();
        let paymentDate = $('#paymentDate').val();
        let totalPay = $('#totalPay').val();

        if (period == '') {
            handleValidationError('Please enter Period!', 'period');
            return false
        }
        if (paymentDate == '') {
            handleValidationError('Please enter Payment Date!', 'paymentDate');
            return false
        }
        if (totalPay == '') {
            handleValidationError('Please enter Total Pay!', 'totalPay');
            return false
        }

        // Making a post request to save payslips
        $('.fullScreenSpin').css('display', 'block');
        const employeePayrolApis = new EmployeePayrollApi();
        const apiEndpoint = employeePayrolApis.collection.findByName(
            employeePayrolApis.collectionNames.TPaySlips
        );
        totalPay = Number(totalPay.replace(/[^0-9.-]+/g, ""));
        let paySlipSettings = new PaySlips({
            type: "TPaySlips",
            fields: new PaySlipsFields({
                ID: parseInt(ID),
                EmployeeID: parseInt(employeeID),
                Period: period,
                PaymentDate: moment(paymentDate, "DD/MM/YYYY").format('YYYY-MM-DD HH:mm:ss'),
                TotalPay: parseInt(totalPay),
                Active: true
            }),
        });

        try {
            const ApiResponse = await apiEndpoint.fetch(null, {
                method: "POST",
                headers: ApiService.getPostHeaders(),
                body: JSON.stringify(paySlipSettings),
            });
            if (ApiResponse.ok == true) {
                await templateObject.savePaySlipLocalDB();
                await templateObject.getPaySlips();
                $('#paySlipModal').modal('hide');
                $('#period, #paymentDate, #totalPay').val('');
                $('.fullScreenSpin').css('display', 'none');
                swal({
                    title: (parseInt(ID) != 0) ? 'Pay slip updated successfully' : 'Pay slip added successfully',
                    text: '',
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'OK'
                }).then((result) => {
                    if (result.value) {
                        if (result.value) {}
                    }
                });
            } else {
                $('.fullScreenSpin').css('display', 'none');
                swal({
                    title: 'Oooops...',
                    text: ApiResponse.headers.get('errormessage'),
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {}
                });
            }
        } catch (error) {
            $('.fullScreenSpin').css('display', 'none');
            swal({
                title: 'Oooops...',
                text: error,
                type: 'error',
                showCancelButton: false,
                confirmButtonText: 'Try Again'
            }).then((result) => {
                if (result.value) {}
            });
        }
    },
    'click #saveObEarningsRate': async function(event) {
        let templateObject = Template.instance();
        let currentId = FlowRouter.current().queryParams;
        let employeeID = (!isNaN(currentId.id)) ? currentId.id : 0;
        let EarningsRate = $('#obEarningsRate').val();
        if (EarningsRate == '') {
            handleValidationError('Please select Earning Rate!', 'obEarningsRate');
            return false;
        }
        $('.fullScreenSpin').css('display', 'block');
        const openingBalances = [];

        const employeePayrolApis = new EmployeePayrollApi();
        // now we have to make the post request to save the data in database
        const apiEndpoint = employeePayrolApis.collection.findByName(
            employeePayrolApis.collectionNames.TOpeningBalances
        );
        let openingSettings = new OpeningBalance({
            type: "TOpeningBalances",
            fields: new OpeningBalanceFields({
                EmployeeID: employeeID,
                AType: EarningsRate,
                Amount: 0,
                Balance: 0,
                Active: true
            }),
        })
        try {
            const ApiResponse = await apiEndpoint.fetch(null, {
                method: "POST",
                headers: ApiService.getPostHeaders(),
                body: JSON.stringify(openingSettings),
            });
            if (ApiResponse.ok == true) {
                const jsonResponse = await ApiResponse.json();
                $('#obEarningsRate').val('');
                await templateObject.saveOpeningBalanceLocalDB();
                await templateObject.getOpeningBalances();
                $('#addEarningsLineModal2').modal('hide');
                $('.fullScreenSpin').css('display', 'none');
                swal({
                    title: 'Earning added successfully',
                    text: '',
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'OK'
                }).then((result) => {
                    if (result.value) {
                        if (result.value) {}
                    }
                });
            } else {
                $('.fullScreenSpin').css('display', 'none');
                swal({
                    title: 'Oooops...',
                    text: ApiResponse.headers.get('errormessage'),
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {}
                });
            }
        } catch (error) {
            $('.fullScreenSpin').css('display', 'none');
            swal({
                title: 'Oooops...',
                text: error,
                type: 'error',
                showCancelButton: false,
                confirmButtonText: 'Try Again'
            }).then((result) => {
                if (result.value) {}
            });
        }
    },
    'click #saveObDeductionType': async function(event) {
        let templateObject = Template.instance();
        let currentId = FlowRouter.current().queryParams;
        let employeeID = (!isNaN(currentId.id)) ? currentId.id : 0;
        let DeductionType = $('#obDeductionType').val();
        if (DeductionType == '') {
            handleValidationError('Please select Deduction Type!', 'obDeductionType');
            return false;
        }
        $('.fullScreenSpin').css('display', 'block');
        const openingBalances = [];

        const employeePayrolApis = new EmployeePayrollApi();
        const apiEndpoint = employeePayrolApis.collection.findByName(
            employeePayrolApis.collectionNames.TOpeningBalances
        );
        let openingSettings = new OpeningBalance({
            type: "TOpeningBalances",
            fields: new OpeningBalanceFields({
                EmployeeID: employeeID,
                AType: DeductionType,
                Amount: 0,
                Balance: 1,
                Active: true
            }),
        })

        try {
            const ApiResponse = await apiEndpoint.fetch(null, {
                method: "POST",
                headers: ApiService.getPostHeaders(),
                body: JSON.stringify(openingSettings),
            });
            if (ApiResponse.ok == true) {
                const jsonResponse = await ApiResponse.json();
                $('#obDeductionType').val('');
                await templateObject.saveOpeningBalanceLocalDB();
                await templateObject.getOpeningBalances();
                $('#addDeductionLineModal2').modal('hide');
                $('.fullScreenSpin').css('display', 'none');
                swal({
                    title: 'Deduction added successfully',
                    text: '',
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'OK'
                }).then((result) => {
                    if (result.value) {
                        if (result.value) {}
                    }
                });
            } else {
                $('.fullScreenSpin').css('display', 'none');
                swal({
                    title: 'Oooops...',
                    text: ApiResponse.headers.get('errormessage'),
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {}
                });
            }
        } catch (error) {
            $('.fullScreenSpin').css('display', 'none');
            swal({
                title: 'Oooops...',
                text: error,
                type: 'error',
                showCancelButton: false,
                confirmButtonText: 'Try Again'
            }).then((result) => {
                if (result.value) {}
            });
        }
    },
    'click #saveObSuperannuationType': async function(event) {
        let templateObject = Template.instance();
        let currentId = FlowRouter.current().queryParams;
        let employeeID = (!isNaN(currentId.id)) ? currentId.id : 0;
        let SuperannuationFund = $('#obSuperannuationFund').val();
        let ContributionType = $('#obContributionType').val();
        if (SuperannuationFund == '') {
            handleValidationError('Please select Superannuation Fund!', 'obSuperannuationFund');
            return false;
        }
        $('.fullScreenSpin').css('display', 'block');
        const openingBalances = [];

        const employeePayrolApis = new EmployeePayrollApi();
        const apiEndpoint = employeePayrolApis.collection.findByName(
            employeePayrolApis.collectionNames.TOpeningBalances
        );
        let openingSettings = new OpeningBalance({
            type: "TOpeningBalances",
            fields: new OpeningBalanceFields({
                EmployeeID: employeeID,
                AType: SuperannuationFund,
                Amount: 0,
                ContributionType: ContributionType,
                Balance: 2,
                Active: true
            }),
        });

        try {
            const ApiResponse = await apiEndpoint.fetch(null, {
                method: "POST",
                headers: ApiService.getPostHeaders(),
                body: JSON.stringify(openingSettings),
            });
            if (ApiResponse.ok == true) {
                const jsonResponse = await ApiResponse.json();
                $('#obSuperannuationFund').val('');
                $('#obContributionType').val('');
                await templateObject.saveOpeningBalanceLocalDB();
                await templateObject.getOpeningBalances();
                $('#addSuperannuationLineModal2').modal('hide');
                $('.fullScreenSpin').css('display', 'none');
                swal({
                    title: 'Superannuation added successfully',
                    text: '',
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'OK'
                }).then((result) => {
                    if (result.value) {
                        if (result.value) {}
                    }
                });
            } else {
                $('.fullScreenSpin').css('display', 'none');
                swal({
                    title: 'Oooops...',
                    text: ApiResponse.headers.get('errormessage'),
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {}
                });
            }
        } catch (error) {
            $('.fullScreenSpin').css('display', 'none');
            swal({
                title: 'Oooops...',
                text: error,
                type: 'error',
                showCancelButton: false,
                confirmButtonText: 'Try Again'
            }).then((result) => {
                if (result.value) {}
            });
        }
    },
    'click .colEmpPayrollNotes': function(event) {
        $('#newPayNotesLabel').text('Edit Note');
        let ID = $(event.target).parent().find('.colEmpPayrollNotesID').text();
        let NotesDesc = $(event.target).parent().find('.colEmpPayrollNotesDesc').text();
        $('#payRollNoteID').val(ID);
        $('#payRollNotes').val(NotesDesc);
        $('#newNoteModal').modal('show');
    },
    'click .btnAddNewNotes': function() {
        $('#newPayNotesLabel').text('Add New Note');
        $('#payRollNoteID').val(0);
        $('#payRollNotes').val("");
    },
    'click #saveobReimbursement': async function(event) {
        let templateObject = Template.instance();
        let currentId = FlowRouter.current().queryParams;
        let employeeID = (!isNaN(currentId.id)) ? currentId.id : 0;
        let Reimbursement = $('#obReimbursementType').val();
        if (Reimbursement == '') {
            handleValidationError('Please select Reimbursement!', 'obReimbursementType');
            return false;
        }
        $('.fullScreenSpin').css('display', 'block');
        const openingBalances = [];

        const employeePayrolApis = new EmployeePayrollApi();
        const apiEndpoint = employeePayrolApis.collection.findByName(
            employeePayrolApis.collectionNames.TOpeningBalances
        );
        let openingSettings = new OpeningBalance({
            type: "TOpeningBalances",
            fields: new OpeningBalanceFields({
                EmployeeID: employeeID,
                AType: Reimbursement,
                Amount: 0,
                Balance: 3,
                Active: true
            }),
        });

        try {
            const ApiResponse = await apiEndpoint.fetch(null, {
                method: "POST",
                headers: ApiService.getPostHeaders(),
                body: JSON.stringify(openingSettings),
            });
            if (ApiResponse.ok == true) {
                const jsonResponse = await ApiResponse.json();
                $('#obReimbursementType').val('');
                await templateObject.saveOpeningBalanceLocalDB();
                await templateObject.getOpeningBalances();
                $('#addReimbursementLineModal2').modal('hide');
                $('.fullScreenSpin').css('display', 'none');
                swal({
                    title: 'Reimbursement added successfully',
                    text: '',
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'OK'
                }).then((result) => {
                    if (result.value) {
                        if (result.value) {}
                    }
                });
            } else {
                $('.fullScreenSpin').css('display', 'none');
                swal({
                    title: 'Oooops...',
                    text: ApiResponse.headers.get('errormessage'),
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {}
                });
            }
        } catch (error) {
            $('.fullScreenSpin').css('display', 'none');
            swal({
                title: 'Oooops...',
                text: error,
                type: 'error',
                showCancelButton: false,
                confirmButtonText: 'Try Again'
            }).then((result) => {
                if (result.value) {}
            });
        }
    },
    // Save LeaveRequest Popup
    'click #btnSaveLeaveRequest': async function(event) {
        playSaveAudio();
        let templateObject = Template.instance();
        setTimeout(async function() {
            let currentId = FlowRouter.current().queryParams;
            let employeeID = (!isNaN(currentId.id)) ? currentId.id : 0;
            let ID = $('#edtLeaveRequestID').val();
            let TypeofRequest = $('#edtLeaveTypeofRequestID').val();
            let Leave = $('#edtLeaveTypeofRequest').val();
            let Description = $('#edtLeaveDescription').val();
            let StartDate = $('#edtLeaveStartDate').val();
            let EndDate = $('#edtLeaveEndDate').val();
            let PayPeriod = $('#edtLeavePayPeriod').val();
            let Hours = $('#edtLeaveHours').val();
            let Status = $('#edtLeavePayStatus').val();
            const leaveRequests = [];
            const employeePayrolApis = new EmployeePayrollApi();
            // now we have to make the post request to save the data in database
            const apiEndpoint = employeePayrolApis.collection.findByName(
                employeePayrolApis.collectionNames.TLeavRequest
            );
            // let TLeaveRequest = await getVS1Data('TLeaveRequest');
            // if( TLeaveRequest.length ){
            //     let TLeaveRequestData = JSON.parse(TLeaveRequest[0].data);
            //     leaveRequests = AssignLeaveType.fromList(
            //         TLeaveRequestData.tleaverequest
            //     );
            // }
            if (isNaN(TypeofRequest)) {
                handleValidationError('Request type must be a number!', 'edtLeaveTypeofRequestID');
                return false
            } else if (Description == '') {
                handleValidationError('Please enter Leave Description!', 'edtLeaveDescription');
                return false
            } else if (PayPeriod == '') {
                handleValidationError('Please enter Pay Period!', 'edtLeavePayPeriod');
                return false;
            } else if (Hours == '') {
                handleValidationError('Please enter Hours!', 'edtLeaveHours');
                return false;
            } else if (isNaN(Hours)) {
                handleValidationError('Hours must be a Number!', 'edtLeaveHours');
                return false;
            } else if (Status == '') {
                handleValidationError('HPlease select Status!', 'edtLeavePayStatus');
                return false;
            } else {
                $('.fullScreenSpin').css('display', 'block');

                let dbStartDate = moment(StartDate, "DD/MM/YYYY").format('YYYY-MM-DD HH:mm:ss')
                let dbEndDate = moment(EndDate, "DD/MM/YYYY").format('YYYY-MM-DD HH:mm:ss')
                    // leaveRequests.push(
                let leaveRequestSettings = new LeaveRequest({
                        type: "TLeavRequest",
                        fields: new LeaveRequestFields({
                            ID: parseInt(ID),
                            EmployeeID: parseInt(employeeID),
                            TypeOfRequest: parseInt(TypeofRequest),
                            LeaveMethod: Leave,
                            Description: Description,
                            StartDate: dbStartDate,
                            EndDate: dbEndDate,
                            PayPeriod: PayPeriod,
                            Hours: parseInt(Hours),
                            Status: Status
                        }),
                    })
                    // );

                const ApiResponse = await apiEndpoint.fetch(null, {
                    method: "POST",
                    headers: ApiService.getPostHeaders(),
                    body: JSON.stringify(leaveRequestSettings),
                });

                try {
                    if (ApiResponse.ok == true) {
                        const jsonResponse = await ApiResponse.json();
                        await templateObject.saveLeaveRequestLocalDB();
                        await templateObject.getLeaveRequests();
                        $('#newLeaveRequestModal').modal('hide');
                        $('#edtLeaveTypeofRequestID, #edtLeaveTypeofRequest, #edtLeaveDescription, #edtLeavePayPeriod, #edtLeaveHours, #edtLeavePayStatus').val('');
                        $('.fullScreenSpin').css('display', 'none');
                        swal({
                            title: 'Leave request added successfully',
                            text: '',
                            type: 'success',
                            showCancelButton: false,
                            confirmButtonText: 'OK'
                        }).then((result) => {
                            if (result.value) {
                                if (result.value) {}
                            }
                        });
                    } else {
                        $('.fullScreenSpin').css('display', 'none');
                        swal({
                            title: 'Oooops...',
                            text: ApiResponse.headers.get('errormessage'),
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {}
                        });
                    }
                } catch (error) {
                    $('.fullScreenSpin').css('display', 'none');
                    swal({
                        title: 'Oooops...',
                        text: error,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {}
                    });
                }
            }
        }, delayTimeAfterSound);
    },
    // Save AssignLeaveType Popup
    'click #btnSaveAssignLeaveType': async function(event) {
        playSaveAudio();
        let templateObject = Template.instance();
        setTimeout(async function() {
            let currentId = FlowRouter.current().queryParams;
            let employeeID = (!isNaN(currentId.id)) ? currentId.id : 0;

            const employeePayrolApis = new EmployeePayrollApi();
            // now we have to make the post request to save the data in database
            const apiEndpoint = employeePayrolApis.collection.findByName(
                employeePayrolApis.collectionNames.TAssignLeaveType
            );

            let LeaveType = $('#leaveTypeSelect').val();
            let LeaveCalcMethod = $('#leaveCalcMethodSelect').val();
            let OpeningBalance = $('#openingBalance').val();

            let HoursLeave = 0;
            let HoursAccruedAnnuallyFullTimeEmp = 0;
            let HoursFullTimeEmpFortnightlyPay = 0;
            let HoursAccruedAnnually = 0;
            if (LeaveType == "") {
                handleValidationError('Please select a Leave!', 'leaveTypeSelect');
                return false;
            }
            if (LeaveCalcMethod == "") {
                handleValidationError('Leave Calculation Method!', 'leaveCalcMethodSelect');
                return false;
            }
            switch (LeaveCalcMethod) {
                case 'Manually Recorded Rate':
                    HoursLeave = $('#hoursLeave').val();
                    if (HoursLeave == "") {
                        handleValidationError('Hours Leave is required!', 'hoursLeave');
                        return false;
                    }
                    break;
                case 'No Calculation Required':

                    break;
                case 'Based on Ordinary Earnings':
                    HoursAccruedAnnuallyFullTimeEmp = $('#hoursAccruedAnnuallyFullTimeEmp').val();
                    HoursFullTimeEmpFortnightlyPay = $('#hoursFullTimeEmpFortnightlyPay').val();
                    if (HoursAccruedAnnuallyFullTimeEmp == "") {
                        handleValidationError('Hours Accrued Annually Full Time Emp is required!', 'hoursAccruedAnnuallyFullTimeEmp');
                        return false;
                    }
                    break;
                default:
                    HoursAccruedAnnually = $('#hoursAccruedAnnually').val();
                    if (HoursAccruedAnnually == "") {
                        handleValidationError('Hours Accrued Annually is required!', 'hoursAccruedAnnually');
                        return false;
                    }
                    break;
            }

            if (OpeningBalance == "") {
                handleValidationError('Opening Balance is required!', 'openingBalance');
                return false;
            }
            $('.fullScreenSpin').css('display', 'block');

            let OnTerminationUnusedBalance = $('#onTerminationUnusedBalance').val();
            let OnTerminationBalance = 0;
            if (OnTerminationUnusedBalance == "Paid Out") {
                OnTerminationBalance = 1;
            }
            let EFTLeaveType = $("#eftLeaveType").is(':checked') ? true : false;
            let SuperannuationGuarantee = (EFTLeaveType) ? $("#superannuationGuarantee").is(':checked') ? true : false : false;

            // const assignLeaveTypes = [];
            // let TAssignLeaveTypes = await getVS1Data('TAssignLeaveType');
            // if( TAssignLeaveTypes.length ){
            //     let TAssignLeaveTypesData = JSON.parse(TAssignLeaveTypes[0].data);
            //     assignLeaveTypes = AssignLeaveType.fromList(
            //         TAssignLeaveTypesData.tassignteavetype
            //     );
            // }

            // assignLeaveTypes.push(
            let assignLeaveTypes = new AssignLeaveType({
                type: "TAssignLeaveType",
                fields: new AssignLeaveTypeFields({
                    LeaveType: LeaveType,
                    EmployeeID: parseInt(employeeID),
                    LeaveCalcMethod: LeaveCalcMethod,
                    HoursAccruedAnnually: parseInt(HoursAccruedAnnually),
                    HoursAccruedAnnuallyFullTimeEmp: parseInt(HoursAccruedAnnuallyFullTimeEmp),
                    HoursFullTimeEmpFortnightlyPay: parseInt(HoursAccruedAnnuallyFullTimeEmp),
                    HoursLeave: parseInt(HoursLeave),
                    OpeningBalance: parseInt(OpeningBalance),
                    OnTerminationUnusedBalance: OnTerminationBalance,
                    EFTLeaveType: EFTLeaveType,
                    SuperannuationGuarantee: SuperannuationGuarantee,
                    Active: true
                }),
            })

            try {
                const ApiResponse = await apiEndpoint.fetch(null, {
                    method: "POST",
                    headers: ApiService.getPostHeaders(),
                    body: JSON.stringify(assignLeaveTypes),
                });

                if (ApiResponse.ok == true) {
                    await templateObject.saveAssignLeaveLocalDB();
                    await templateObject.getAssignLeaveTypes();
                    $('#assignLeaveTypeModal').modal('hide');
                    $('#assignLeaveTypeForm')[0].reset();
                    $('.fullScreenSpin').css('display', 'none');
                    swal({
                        title: 'Assign Leave Type added successfully',
                        text: '',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'OK'
                    }).then((result) => {
                        if (result.value) {
                            if (result.value) {}
                        }
                    });
                } else {
                    $('.fullScreenSpin').css('display', 'none');
                    swal({
                        title: 'Oooops...',
                        text: ApiResponse.headers.get('errormessage'),
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {}
                    });
                }
            } catch (error) {
                $('.fullScreenSpin').css('display', 'none');
                swal({
                    title: 'Oooops...',
                    text: error,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {}
                });
            }
        }, delayTimeAfterSound);
    },
    'click #savePayRollNotes': async function() {
        let templateObject = Template.instance();

        const employeePayrolApis = new EmployeePayrollApi();
        // now we have to make the post request to save the data in database
        const apiEndpoint = employeePayrolApis.collection.findByName(
            employeePayrolApis.collectionNames.TPayNotes
        );

        let currentId = FlowRouter.current().queryParams;
        let employeeID = (!isNaN(currentId.id)) ? currentId.id : 0;
        let Notes = $('#payRollNotes').val();
        let ID = $('#payRollNoteID').val();
        if (Notes == '') {
            handleValidationError('Please enter a Note!', 'payRollNotes');
            return false;
        }
        $('.fullScreenSpin').css('display', 'block');
        let noteSetting = new PayNotes({
            type: "TPayNotes",
            fields: new PayNotesFields({
                ID: parseInt(ID),
                EmployeeID: parseInt(employeeID),
                Notes: Notes,
                CreatedAt: moment(),
                UserID: Session.get("mySessionEmployeeLoggedID"),
                UserName: Session.get('mySessionEmployee') || '',
                Active: true
            }),
        })
        try {
            const ApiResponse = await apiEndpoint.fetch(null, {
                method: "POST",
                headers: ApiService.getPostHeaders(),
                body: JSON.stringify(noteSetting),
            });
            if (ApiResponse.ok == true) {
                await templateObject.saveNotesLocalDB();
                await templateObject.getPayNotesTypes();
                $('#payRollNotes').val('');
                $('#payRollNoteID').val(0)
                $('#newNoteModal').modal('hide');
                $('.fullScreenSpin').css('display', 'none');
                swal({
                    title: (parseInt(ID) == 0) ? 'Note added successfully' : 'Note updated successfully',
                    text: '',
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'OK'
                }).then((result) => {
                    if (result.value) {
                        if (result.value) {}
                    }
                });
            } else {
                $('.fullScreenSpin').css('display', 'none');
                swal({
                    title: 'Oooops...',
                    text: ApiResponse.headers.get('errormessage'),
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {}
                });
            }
        } catch (error) {
            $('.fullScreenSpin').css('display', 'none');
            swal({
                title: 'Oooops...',
                text: error,
                type: 'error',
                showCancelButton: false,
                confirmButtonText: 'Try Again'
            }).then((result) => {
                if (result.value) {}
            });
        }
    },
    // NEXT TASK HERE
    'click .btnLeaveRequestBtn': async function() {
        let templateObject = Template.instance();

        $('#newLeaveRequestLabel').text('New Leave Request');
        let today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        const yyyy = today.getFullYear();
        today = dd + '/' + mm + '/' + yyyy; 

         let nextWeek = new Date() 
        $('#leaveRequestForm')[0].reset();
        $('#edtLeavePayStatus').val('Awaiting'); 
        $('#edtLeaveStartDate').val(today); 
        $('#edtLeaveEndDate').val(new Date(nextWeek.setDate( new Date().getDate() + 7)).toLocaleDateString());
        $('#removeLeaveRequestBtn').hide();
        $(`#edtLeavePayPeriod`).val();
        await templateObject.getEmployeePaySettings(true); 
    },
    'change #taxes :input, #taxes :select': async function() {
        $('.statusSaved').hide();
        $('.statusUnsaved').show();
    },
    // Pay Template Tab
    'click #addEarningsLine': (e, ui) => {
        ui.earnings.add();
        // let templateObject = Template.instance();
        // let currentId = FlowRouter.current().queryParams;
        // let employeeID = ( !isNaN(currentId.id) )? currentId.id : 0;

        // let EarningRate = $('#earningRateSelect').val();
        // let CalculationType = $('input[name=calculationType]:checked').val();
        // let ExpenseAccount = $('#expenseAccount').val();

        // if( EarningRate == ""){
        //     handleValidationError('Please select Earning Rate!', 'earningRateSelect');
        //     return false
        // }

        // if( CalculationType == ""){
        //     handleValidationError('Please select Calculation Type!', 'calculationType');
        //     return false
        // }

        // if( ExpenseAccount == ""){
        //     handleValidationError('Please enter Expense Account!', 'expenseAccount');
        //     return false
        // }

        // $('.fullScreenSpin').css('display', 'block');
        // const employeePayrolApis = new EmployeePayrollApi();
        // // now we have to make the post request to save the data in database
        // const apiEndpoint = employeePayrolApis.collection.findByName(
        //     employeePayrolApis.collectionNames.TPayTemplateEarningLine
        // );

        // let payEarningLines = new PayTemplateEarningLine({
        //         type: 'TPayTemplateEarningLine',
        //         fields: new PayTemplateEarningLineFields({
        //             ID: 0,
        //             EmployeeID: employeeID,
        //             EarningRate: EarningRate,
        //             CalculationType: CalculationType,
        //             ExpenseAccount: ExpenseAccount,
        //             Amount: 0,
        //             Active: true
        //         })
        //     });
        // try {
        //     const ApiResponse = await apiEndpoint.fetch(null, {
        //         method: "POST",
        //         headers: ApiService.getPostHeaders(),
        //         body: JSON.stringify(payEarningLines),
        //     });

        //     if (ApiResponse.ok == true) {
        //         // Load all the earnings Line from Database
        //         await templateObject.saveEarningLocalDB();
        //         await templateObject.getPayEarningLines();
        //         $('input[name=calculationType]:checked').attr('checked', false);
        //         $('#expenseAccount').val('');
        //         $('#earningRateSelect').val('');
        //         $('#addEarningsLineModal').modal('hide');
        //         $('.fullScreenSpin').css('display', 'none');
        //         swal({
        //             title: 'Earning Line added successfully',
        //             text: '',
        //             type: 'success',
        //             showCancelButton: false,
        //             confirmButtonText: 'OK'
        //         }).then((result) => {
        //             if (result.value) {
        //                 if (result.value) {}
        //             }
        //         });
        //     }else{
        //         $('.fullScreenSpin').css('display', 'none');
        //         swal({
        //             title: 'Oooops...',
        //             text: ApiResponse.headers.get('errormessage'),
        //             type: 'error',
        //             showCancelButton: false,
        //             confirmButtonText: 'Try Again'
        //         }).then((result) => {
        //             if (result.value) {}
        //         });
        //     }
        // } catch (error) {
        //     $('.fullScreenSpin').css('display', 'none');
        //     swal({
        //         title: 'Oooops...',
        //         text: error,
        //         type: 'error',
        //         showCancelButton: false,
        //         confirmButtonText: 'Try Again'
        //     }).then((result) => {
        //         if (result.value) {}
        //     });
        // }
    },
    'click #addDeductionLine': async function() {
        let templateObject = Template.instance();
        let currentId = FlowRouter.current().queryParams;
        let employeeID = (!isNaN(currentId.id)) ? currentId.id : 0;
        let DeductionType = $('#deductionTypeSelect').val();
        let CalculationType = $('input[name=calculationTypeDeduction]:checked').val();
        let ControlAccount = $('#controlAccountDeduction').val();

        if (DeductionType == "") {
            handleValidationError('Please select Deduction Type!', 'deductionTypeSelect');
            return false
        }

        if (CalculationType == "") {
            handleValidationError('Please select Calculation Type!', 'calculationTypeDeduction');
            return false
        }

        if (ControlAccount == "") {
            handleValidationError('Please select Control Account!', 'controlAccountDeduction');
            return false
        }

        $('.fullScreenSpin').css('display', 'block');
        const employeePayrolApis = new EmployeePayrollApi();
        // now we have to make the post request to save the data in database
        const apiEndpoint = employeePayrolApis.collection.findByName(
            employeePayrolApis.collectionNames.TPayTemplateDeductionLine
        );
        let payDeductionLines = new PayTemplateDeductionLine({
            type: 'TPayTemplateDeductionLine',
            fields: new PayTemplateDeductionLineFields({
                EmployeeID: parseInt(employeeID),
                DeductionType: DeductionType,
                CalculationType: CalculationType,
                ExpenseAccount: ControlAccount,
                Amount: 0,
                Percentage: '0',
                Active: true
            })
        });

        try {
            const ApiResponse = await apiEndpoint.fetch(null, {
                method: "POST",
                headers: ApiService.getPostHeaders(),
                body: JSON.stringify(payDeductionLines),
            });
            if (ApiResponse.ok == true) {
                const jsonResponse = await ApiResponse.json();
                // Load all the earnings Line from Database
                await templateObject.saveDeductionLocalDB();
                await templateObject.getPayDeducitonLines();
                $('#deductionTypeSelect').val('');
                $('input[name=calculationTypeDeduction]:checked').attr('checked', false);
                $('#controlAccountDeduction').val('');
                $('#addDeductionLineModal').modal('hide');
                $('.fullScreenSpin').css('display', 'none');
                swal({
                    title: 'Deduction Line added successfully',
                    text: '',
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'OK'
                }).then((result) => {
                    if (result.value) {
                        if (result.value) {}
                    }
                });
            } else {
                $('.fullScreenSpin').css('display', 'none');
                swal({
                    title: 'Oooops...',
                    text: ApiResponse.headers.get('errormessage'),
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {}
                });
            }
        } catch (error) {
            $('.fullScreenSpin').css('display', 'none');
            swal({
                title: 'Oooops...',
                text: error,
                type: 'error',
                showCancelButton: false,
                confirmButtonText: 'Try Again'
            }).then((result) => {
                if (result.value) {}
            });
        }
    },
    'click #addSuperannuationLine': async function() {
        let templateObject = Template.instance();
        let currentId = FlowRouter.current().queryParams;
        let employeeID = (!isNaN(currentId.id)) ? currentId.id : 0;
        let Fund = $('#superannuationFund').val();
        let ContributionType = $('#superannuationTypeSelect').val();
        let ReducesSGC = ($('#reducesSGC').is(':checked')) ? "1" : "0";
        let CalculationType = $('input[name=calculationTypeSuperannuation]:checked').val();
        let MinimumMonthlyEarnings = $('#minimumMonthlyEarnings').val();
        let ExpenseAccount = $('#expenseSuperannuationAccount').val();
        let LiabilityAccount = $('#liabilityAccount').val();
        let PaymentFrequency = $('#paymentFrequency').val();
        let PeriodPaymentDate = $('#edtPeriodPaymentDate').val();
        if (Fund == '') {
            handleValidationError('Please select Superannuation Fund!', 'superannuationFund');
            return false
        }
        if (ContributionType == '') {
            handleValidationError('Please select Contribution Type!', 'superannuationTypeSelect');
            return false
        }
        if (CalculationType == '') {
            handleValidationError('Please select Calculation Type!', 'calculationTypeSuperannuation');
            return false
        }
        if (MinimumMonthlyEarnings == '') {
            handleValidationError('Please enter Minimum Monthly Earnings!', 'MinimumMonthlyEarnings');
            return false;
        }
        if (ExpenseAccount == '') {
            handleValidationError('Please select Expense Account!', 'expenseSuperannuationAccount');
            return false;
        }
        $('.fullScreenSpin').css('display', 'block');
        const employeePayrolApis = new EmployeePayrollApi();
        // now we have to make the post request to save the data in database
        const apiEndpoint = employeePayrolApis.collection.findByName(
            employeePayrolApis.collectionNames.TPayTemplateSuperannuationLine
        );

        let paySuperannuationLines = new PayTemplateSuperannuationLine({
            type: 'TPayTemplateSuperannuationLine',
            fields: new PayTemplateSuperannuationLineFields({
                ID: 0,
                EmployeeID: employeeID,
                Fund: Fund,
                ContributionType: ContributionType,
                ReducesSGC: ReducesSGC,
                CalculationType: parseInt(CalculationType),
                MinimumMonthlyEarnings: parseInt(MinimumMonthlyEarnings),
                ExpenseAccount: ExpenseAccount,
                LiabilityAccount: LiabilityAccount,
                PaymentFrequency: PaymentFrequency,
                PeriodPaymentDate: moment(PeriodPaymentDate, "DD/MM/YYYY").format('YYYY-MM-DD HH:mm:ss'),
                // PeriodPaymentDate: 0,
                Percentage: 0,
                Amount: 0,
                Active: true
            })
        });

        try {
            const ApiResponse = await apiEndpoint.fetch(null, {
                method: "POST",
                headers: ApiService.getPostHeaders(),
                body: JSON.stringify(paySuperannuationLines),
            });

            if (ApiResponse.ok == true) {
                const jsonResponse = await ApiResponse.json();
                // Load all the earnings Line from Database
                await templateObject.saveSuperannuationLocalDB();
                await templateObject.getPaySuperannuationLines();
                $('#superannuationFund').val('');
                $('#superannuationTypeSelect').val('');
                $('#reducesSGC').attr('checked', false);
                $('input[name=calculationTypeSuperannuation]:checked').attr('checked', false);
                $('#minimumMonthlyEarnings').val('');
                $('#expenseSuperannuationAccount').val('');
                $('#liabilityAccount').val('');
                $('#paymentFrequency').val('Monthly');
                $('#edtPeriodPaymentDate').val('');
                $('#addSuperannuationLineModal').modal('hide');
                $('.fullScreenSpin').css('display', 'none');
                swal({
                    title: 'Superannuation Line added successfully',
                    text: '',
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'OK'
                }).then((result) => {
                    if (result.value) {
                        if (result.value) {}
                    }
                });
            } else {
                $('.fullScreenSpin').css('display', 'none');
                swal({
                    title: 'Oooops...',
                    text: ApiResponse.headers.get('errormessage'),
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {}
                });
            }
        } catch (error) {
            $('.fullScreenSpin').css('display', 'none');
            swal({
                title: 'Oooops...',
                text: error,
                type: 'error',
                showCancelButton: false,
                confirmButtonText: 'Try Again'
            }).then((result) => {
                if (result.value) {}
            });
        }
    },
    'click #addReiumbursementLine': async function() {
        const templateObject = Template.instance();
        let currentId = FlowRouter.current().queryParams;
        let employeeID = (!isNaN(currentId.id)) ? currentId.id : 0;
        let ReiumbursementType = $('#reimbursementTypeSelect').val();
        let Description = $('#reiumbursementDescription').val();
        let ControlExpenseAccount = $('#controlExpenseAccount').val();

        if (ReiumbursementType == '') {
            handleValidationError('Please Select Reiumbursement Type!', 'reimbursementTypeSelect');
            return false;
        }

        if (Description == '') {
            handleValidationError('Please Enter Description!', 'reiumbursementDescription');
            return false;
        }

        if (ControlExpenseAccount == '') {
            handleValidationError('lease Enter Control Expense Account!', 'controlExpenseAccount');
            return false;
        }

        $('.fullScreenSpin').css('display', 'block');

        const employeePayrolApis = new EmployeePayrollApi();
        // now we have to make the post request to save the data in database
        const apiEndpoint = employeePayrolApis.collection.findByName(
            employeePayrolApis.collectionNames.TPayTemplateReiumbursementLine
        );
        let payReiumbursementLines = new PayTemplateReiumbursementLine({
            type: 'TPayTemplateReiumbursementLine',
            fields: new PayTemplateReiumbursementLineFields({
                ID: 0,
                EmployeeID: employeeID,
                ReiumbursementType: ReiumbursementType,
                Description: Description,
                ExpenseAccount: ControlExpenseAccount,
                Amount: 0,
                Active: true
            })
        })

        try {
            const ApiResponse = await apiEndpoint.fetch(null, {
                method: "POST",
                headers: ApiService.getPostHeaders(),
                body: JSON.stringify(payReiumbursementLines),
            });

            if (ApiResponse.ok == true) {
                // Load all the earnings Line from Database
                await templateObject.saveReiumbursementDB();
                await templateObject.getPayReiumbursementLines();
                $('#reimbursementTypeSelect').val('');
                $('#reiumbursementDescription').val('');
                $('#controlExpenseAccount').val('');
                $('#addReimbursementLineModal').modal('hide');
                $('.fullScreenSpin').css('display', 'none');
                swal({
                    title: 'Reiumbursement Line added successfully',
                    text: '',
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'OK'
                }).then((result) => {
                    if (result.value) {
                        if (result.value) {}
                    }
                });
            } else {
                $('.fullScreenSpin').css('display', 'none');
                swal({
                    title: 'Oooops...',
                    text: ApiResponse.headers.get('errormessage'),
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {}
                });
            }
        } catch (error) {
            $('.fullScreenSpin').css('display', 'none');
            swal({
                title: 'Oooops...',
                text: error,
                type: 'error',
                showCancelButton: false,
                confirmButtonText: 'Try Again'
            }).then((result) => {
                if (result.value) {}
            });
        }
    },
    'change #superannuationTypeSelect': function() {
        let CalculationType = $('#superannuationTypeSelect').val();
        $('#reducesSGCContainer').addClass('hideelement')
        $('#statutoryRateContainer').addClass('hideelement')
        $('input[name=calculationTypeSuperannuation]:checked').attr('checked', false);
        switch (CalculationType) {
            case 'Superannuation Guarantee Contribution (SGC)':
                $('#statutoryRateContainer').removeClass('hideelement')
                break;
            case 'Pre-Tax Voluntary Contribution (RESC)':
                $('#reducesSGCContainer').removeClass('hideelement')
                break;
            default:
                break;
        }
    },
    'click .removePayTempEarning': (e, ui) => {
        let deleteID = $(e.currentTarget).attr('earning-id');
        // ui.removeEarning(deleteID);
        ui.earnings.delete(deleteID);
        // swal({
        //     title: 'Delete Earning Line',
        //     text: "Are you sure you want to Delete this Earning Line?",
        //     type: 'question',
        //     showCancelButton: true,
        //     confirmButtonText: 'Yes'
        // }).then( async (result) => {
        //     if (result.value) {
        //         $('.fullScreenSpin').css('display', 'block');
        //         // $(e.target).parents('.earningLinesContainer').remove();

        //         const employeePayrolApis = new EmployeePayrollApi();
        //         // now we have to make the post request to save the data in database
        //         const apiEndpoint = employeePayrolApis.collection.findByName(
        //             employeePayrolApis.collectionNames.TPayTemplateEarningLine
        //         );

        //         let earningSettings =  new PayTemplateEarningLine({
        //             type: "TPayTemplateEarningLine",
        //             fields: new PayTemplateEarningLineFields({
        //                 ID: deleteID,
        //                 Active: false,
        //             }),
        //         })

        //         try {
        //             const ApiResponse = await apiEndpoint.fetch(null, {
        //                 method: "POST",
        //                 headers: ApiService.getPostHeaders(),
        //                 body: JSON.stringify(earningSettings),
        //             });

        //             if (ApiResponse.ok == true) {
        //                 // Save into indexDB
        //                 let dataObject = await getVS1Data('TPayTemplateEarningLine');
        //                 if ( dataObject.length > 0) {
        //                     data = JSON.parse(dataObject[0].data);
        //                     if( data.tpaytemplateearningline.length > 0 ){
        //                         let useData = data.tpaytemplateearningline.map( (item) => {
        //                             if( deleteID == item.fields.ID ){
        //                                 item.fields.Active = false;
        //                             }
        //                             return item;
        //                         });
        //                         let updatedObj = {
        //                             tpaytemplateearningline: useData
        //                         }
        //                         await addVS1Data('TPayTemplateEarningLine', JSON.stringify(updatedObj))
        //                         // Bind with html content
        //                         await templateObject.payTemplateEarningLineInfo.set(useData);
        //                     }
        //                 }
        //                 $('.fullScreenSpin').css('display', 'none');
        //                 swal({
        //                     title: 'Earning Line deleted successfully',
        //                     text: '',
        //                     type: 'success',
        //                     showCancelButton: false,
        //                     confirmButtonText: 'OK'
        //                 }).then((result) => {
        //                     if (result.value) {
        //                         if (result.value) {}
        //                     }
        //                 });
        //             }else{
        //                 $('.fullScreenSpin').css('display', 'none');
        //                 swal({
        //                     title: 'Oooops...',
        //                     text: ApiResponse.headers.get('errormessage'),
        //                     type: 'error',
        //                     showCancelButton: false,
        //                     confirmButtonText: 'Try Again'
        //                 }).then((result) => {
        //                     if (result.value) {}
        //                 });
        //             }
        //         } catch (error) {
        //             $('.fullScreenSpin').css('display', 'none');
        //             swal({
        //                 title: 'Oooops...',
        //                 text: error,
        //                 type: 'error',
        //                 showCancelButton: false,
        //                 confirmButtonText: 'Try Again'
        //             }).then((result) => {
        //                 if (result.value) {}
        //             });
        //         }
        //     }
        // });
    },
    'click .removePayTempDeduction': async function(e) {
        let templateObject = Template.instance();
        let deleteID = $(e.target).data('id');
        swal({
            title: 'Delete Deduction Line',
            text: "Are you sure you want to Delete this Deduction Line?",
            type: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes'
        }).then(async(result) => {
            if (result.value) {
                $('.fullScreenSpin').css('display', 'block');
                const employeePayrolApis = new EmployeePayrollApi();
                // now we have to make the post request to save the data in database
                const apiEndpoint = employeePayrolApis.collection.findByName(
                    employeePayrolApis.collectionNames.TPayTemplateDeductionLine
                );

                let deductionSettings = new PayTemplateDeductionLine({
                    type: "TPayTemplateDeductionLine",
                    fields: new PayTemplateDeductionLineFields({
                        ID: deleteID,
                        Active: false,
                    }),
                })

                try {
                    const ApiResponse = await apiEndpoint.fetch(null, {
                        method: "POST",
                        headers: ApiService.getPostHeaders(),
                        body: JSON.stringify(deductionSettings),
                    });
                    if (ApiResponse.ok == true) {
                        let dataObject = await getVS1Data('TPayTemplateDeductionLine');
                        if (dataObject.length > 0) {
                            data = JSON.parse(dataObject[0].data);
                            if (data.tpaytemplatedeductionline.length > 0) {
                                let useData = data.tpaytemplatedeductionline.map((item) => {
                                    if (deleteID == item.fields.ID) {
                                        item.fields.Active = false;
                                    }
                                    return item;
                                });
                                let updatedObj = {
                                    tpaytemplatedeductionline: useData
                                }
                                await addVS1Data('TPayTemplateDeductionLine', JSON.stringify(updatedObj))
                                await templateObject.payTemplateDeductionLineInfo.set(useData);
                            }
                        }
                        $('.fullScreenSpin').css('display', 'none');
                        swal({
                            title: 'Deduction Line deleted successfully',
                            text: '',
                            type: 'success',
                            showCancelButton: false,
                            confirmButtonText: 'OK'
                        }).then((result) => {
                            if (result.value) {
                                if (result.value) {}
                            }
                        });
                    } else {
                        $('.fullScreenSpin').css('display', 'none');
                        swal({
                            title: 'Oooops...',
                            text: ApiResponse.headers.get('errormessage'),
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {}
                        });
                    }
                } catch (error) {
                    $('.fullScreenSpin').css('display', 'none');
                    swal({
                        title: 'Oooops...',
                        text: error,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {}
                    });
                }
            }
        });
    },
    'click .btnAssignLeaveType': function() {
        $('#assignteavetypeID').val(0);
        $('#assignLeaveTypeForm')[0].reset();
    },
    'click .removePayTempSuperannuation': async function(e) {
        let templateObject = Template.instance();
        let deleteID = $(e.target).data('id');
        swal({
            title: 'Delete Superannuation Line',
            text: "Are you sure you want to Delete this Superannuation Line?",
            type: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes'
        }).then(async(result) => {
            if (result.value) {
                $('.fullScreenSpin').css('display', 'block');
                const employeePayrolApis = new EmployeePayrollApi();
                // now we have to make the post request to save the data in database
                const apiEndpoint = employeePayrolApis.collection.findByName(
                    employeePayrolApis.collectionNames.TPayTemplateSuperannuationLine
                );

                let superannuationSettings = new PayTemplateSuperannuationLine({
                    type: "TPayTemplateSuperannuationLine",
                    fields: new PayTemplateSuperannuationLineFields({
                        ID: deleteID,
                        Active: false,
                    }),
                })

                try {
                    const ApiResponse = await apiEndpoint.fetch(null, {
                        method: "POST",
                        headers: ApiService.getPostHeaders(),
                        body: JSON.stringify(superannuationSettings),
                    });
                    if (ApiResponse.ok == true) {
                        let dataObject = await getVS1Data('TPayTemplateSuperannuationLine');
                        if (dataObject.length > 0) {
                            data = JSON.parse(dataObject[0].data);
                            if (data.tpaytemplatesuperannuationline.length > 0) {
                                let useData = data.tpaytemplatesuperannuationline.map((item) => {
                                    if (deleteID == item.fields.ID) {
                                        item.fields.Active = false;
                                    }
                                    return item;
                                });
                                let updatedObj = {
                                    tpaytemplatesuperannuationline: useData
                                }
                                await addVS1Data('TPayTemplateSuperannuationLine', JSON.stringify(updatedObj))
                                await templateObject.payTemplateSuperannuationLineInfo.set(useData);
                            }
                        }
                        $('.fullScreenSpin').css('display', 'none');
                        swal({
                            title: 'Superannuation Line deleted successfully',
                            text: '',
                            type: 'success',
                            showCancelButton: false,
                            confirmButtonText: 'OK'
                        }).then((result) => {
                            if (result.value) {
                                if (result.value) {}
                            }
                        });
                    } else {
                        $('.fullScreenSpin').css('display', 'none');
                        swal({
                            title: 'Oooops...',
                            text: ApiResponse.headers.get('errormessage'),
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {}
                        });
                    }
                } catch (error) {
                    $('.fullScreenSpin').css('display', 'none');
                    swal({
                        title: 'Oooops...',
                        text: error,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {}
                    });
                }
            }
        });
    },
    'click .removePayTempReimbursement': async function(e) {
        let templateObject = Template.instance();
        let deleteID = $(e.target).data('id');
        swal({
            title: 'Delete Superannuation Line',
            text: "Are you sure you want to Delete this Superannuation Line?",
            type: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes'
        }).then(async(result) => {
            if (result.value) {
                $('.fullScreenSpin').css('display', 'block');
                const employeePayrolApis = new EmployeePayrollApi();
                // now we have to make the post request to save the data in database
                const apiEndpoint = employeePayrolApis.collection.findByName(
                    employeePayrolApis.collectionNames.TPayTemplateReiumbursementLine
                );

                let reiumbursementSettings = new PayTemplateReiumbursementLine({
                    type: "TPayTemplateReiumbursementLine",
                    fields: new PayTemplateReiumbursementLineFields({
                        ID: deleteID,
                        Active: false,
                    }),
                });

                try {
                    const ApiResponse = await apiEndpoint.fetch(null, {
                        method: "POST",
                        headers: ApiService.getPostHeaders(),
                        body: JSON.stringify(reiumbursementSettings),
                    });
                    if (ApiResponse.ok == true) {
                        let dataObject = await getVS1Data('TPayTemplateReiumbursementLine');
                        if (dataObject.length > 0) {
                            data = JSON.parse(dataObject[0].data);
                            if (data.tpaytemplatereiumbursementline.length > 0) {
                                let useData = data.tpaytemplatereiumbursementline.map((item) => {
                                    if (deleteID == item.fields.ID) {
                                        item.fields.Active = false;
                                    }
                                    return item;
                                });
                                let updatedObj = {
                                    tpaytemplatereiumbursementline: useData
                                }
                                await addVS1Data('TPayTemplateReiumbursementLine', JSON.stringify(updatedObj))
                                await templateObject.payTemplateReiumbursementLineInfo.set(useData);
                            }
                        }
                        $('.fullScreenSpin').css('display', 'none');
                        swal({
                            title: 'Reiumbursement Line deleted successfully',
                            text: '',
                            type: 'success',
                            showCancelButton: false,
                            confirmButtonText: 'OK'
                        }).then((result) => {
                            if (result.value) {
                                if (result.value) {}
                            }
                        });
                    } else {
                        $('.fullScreenSpin').css('display', 'none');
                        swal({
                            title: 'Oooops...',
                            text: ApiResponse.headers.get('errormessage'),
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {}
                        });
                    }
                } catch (error) {
                    $('.fullScreenSpin').css('display', 'none');
                    swal({
                        title: 'Oooops...',
                        text: error,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {}
                    });
                }
            }
        });
    },
    'click .removeObEarning': async function(e) {
        let templateObject = Template.instance();
        let deleteID = $(e.target).data('id');
        swal({
            title: 'Delete Earning',
            text: "Are you sure you want to Delete this Earning?",
            type: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes'
        }).then(async(result) => {
            if (result.value) {
                $('.fullScreenSpin').css('display', 'block');
                const employeePayrolApis = new EmployeePayrollApi();
                // now we have to make the post request to save the data in database
                const apiEndpoint = employeePayrolApis.collection.findByName(
                    employeePayrolApis.collectionNames.TOpeningBalances
                );

                let reiumbursementSettings = new OpeningBalance({
                    type: "TOpeningBalances",
                    fields: new OpeningBalanceFields({
                        ID: deleteID,
                        Active: false
                    }),
                })

                try {
                    const ApiResponse = await apiEndpoint.fetch(null, {
                        method: "POST",
                        headers: ApiService.getPostHeaders(),
                        body: JSON.stringify(reiumbursementSettings),
                    });

                    if (ApiResponse.ok == true) {
                        let dataObject = await getVS1Data('TOpeningBalances');
                        if (dataObject.length > 0) {
                            data = JSON.parse(dataObject[0].data);
                            if (data.topeningbalances.length > 0) {
                                let useData = data.topeningbalances.map((item) => {
                                    if (deleteID == item.fields.ID) {
                                        item.fields.Active = false;
                                    }
                                    return item;
                                });
                                let updatedObj = {
                                    topeningbalances: useData
                                }
                                await addVS1Data('TOpeningBalances', JSON.stringify(updatedObj))
                            }
                        }
                        await templateObject.getOpeningBalances();
                        $('.fullScreenSpin').css('display', 'none');
                        swal({
                            title: 'Earning deleted successfully',
                            text: '',
                            type: 'success',
                            showCancelButton: false,
                            confirmButtonText: 'OK'
                        }).then((result) => {
                            if (result.value) {
                                if (result.value) {}
                            }
                        });
                    } else {
                        $('.fullScreenSpin').css('display', 'none');
                        swal({
                            title: 'Oooops...',
                            text: ApiResponse.headers.get('errormessage'),
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {}
                        });
                    }
                } catch (error) {
                    $('.fullScreenSpin').css('display', 'none');
                    swal({
                        title: 'Oooops...',
                        text: error,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {}
                    });
                }
            }
        })
    },
    'click .removeObDeduction': async function(e) {
        let templateObject = Template.instance();
        // let currentId = FlowRouter.current().queryParams;
        // let employeeID = ( !isNaN(currentId.id) )? currentId.id : 0;
        let deleteID = $(e.target).data('id');
        swal({
            title: 'Delete Deduction',
            text: "Are you sure you want to Delete this Deduction?",
            type: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes'
        }).then(async(result) => {
            if (result.value) {
                $('.fullScreenSpin').css('display', 'block');
                const employeePayrolApis = new EmployeePayrollApi();
                // now we have to make the post request to save the data in database
                const apiEndpoint = employeePayrolApis.collection.findByName(
                    employeePayrolApis.collectionNames.TOpeningBalances
                );

                let reiumbursementSettings = new OpeningBalance({
                    type: "TOpeningBalances",
                    fields: new OpeningBalanceFields({
                        ID: deleteID,
                        Active: false
                    }),
                })

                try {
                    const ApiResponse = await apiEndpoint.fetch(null, {
                        method: "POST",
                        headers: ApiService.getPostHeaders(),
                        body: JSON.stringify(reiumbursementSettings),
                    });

                    if (ApiResponse.ok == true) {
                        let dataObject = await getVS1Data('TOpeningBalances');
                        if (dataObject.length > 0) {
                            data = JSON.parse(dataObject[0].data);
                            if (data.topeningbalances.length > 0) {
                                let useData = data.topeningbalances.map((item) => {
                                    if (deleteID == item.fields.ID) {
                                        item.fields.Active = false;
                                    }
                                    return item;
                                });
                                let updatedObj = {
                                    topeningbalances: useData
                                }
                                await addVS1Data('TOpeningBalances', JSON.stringify(updatedObj))
                            }
                        }
                        await templateObject.getOpeningBalances();
                        $('.fullScreenSpin').css('display', 'none');
                        swal({
                            title: 'Deduction deleted successfully',
                            text: '',
                            type: 'success',
                            showCancelButton: false,
                            confirmButtonText: 'OK'
                        }).then((result) => {
                            if (result.value) {
                                if (result.value) {}
                            }
                        });
                    } else {
                        $('.fullScreenSpin').css('display', 'none');
                        swal({
                            title: 'Oooops...',
                            text: ApiResponse.headers.get('errormessage'),
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {}
                        });
                    }
                } catch (error) {
                    $('.fullScreenSpin').css('display', 'none');
                    swal({
                        title: 'Oooops...',
                        text: error,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {}
                    });
                }
            }
        });
    },
    'click .removeObSuperannuation': async function(e) {
        let templateObject = Template.instance();

        let deleteID = $(e.target).data('id');
        swal({
            title: 'Delete Superannuation',
            text: "Are you sure you want to Delete this Superannuation?",
            type: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes'
        }).then(async(result) => {
            if (result.value) {
                $('.fullScreenSpin').css('display', 'block');
                const employeePayrolApis = new EmployeePayrollApi();
                // now we have to make the post request to save the data in database
                const apiEndpoint = employeePayrolApis.collection.findByName(
                    employeePayrolApis.collectionNames.TOpeningBalances
                );
                let reiumbursementSettings = new OpeningBalance({
                    type: "TOpeningBalances",
                    fields: new OpeningBalanceFields({
                        ID: deleteID,
                        Active: false
                    }),
                })
                try {
                    const ApiResponse = await apiEndpoint.fetch(null, {
                        method: "POST",
                        headers: ApiService.getPostHeaders(),
                        body: JSON.stringify(reiumbursementSettings),
                    });
                    if (ApiResponse.ok == true) {
                        let dataObject = await getVS1Data('TOpeningBalances');
                        if (dataObject.length > 0) {
                            data = JSON.parse(dataObject[0].data);
                            if (data.topeningbalances.length > 0) {
                                let useData = data.topeningbalances.map((item) => {
                                    if (deleteID == item.fields.ID) {
                                        item.fields.Active = false;
                                    }
                                    return item;
                                });
                                let updatedObj = {
                                    topeningbalances: useData
                                }
                                await addVS1Data('TOpeningBalances', JSON.stringify(updatedObj))
                            }
                        }
                        await templateObject.getOpeningBalances();
                        $('.fullScreenSpin').css('display', 'none');
                        swal({
                            title: 'Superannuation deleted successfully',
                            text: '',
                            type: 'success',
                            showCancelButton: false,
                            confirmButtonText: 'OK'
                        }).then((result) => {
                            if (result.value) {
                                if (result.value) {}
                            }
                        });
                    } else {
                        $('.fullScreenSpin').css('display', 'none');
                        swal({
                            title: 'Oooops...',
                            text: ApiResponse.headers.get('errormessage'),
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {}
                        });
                    }
                } catch (error) {
                    $('.fullScreenSpin').css('display', 'none');
                    swal({
                        title: 'Oooops...',
                        text: error,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {}
                    });
                }
            }
        });
    },
    'click .removeObReimbursement': async function(e) {
        let templateObject = Template.instance();
        let currentId = FlowRouter.current().queryParams;
        let employeeID = (!isNaN(currentId.id)) ? currentId.id : 0;
        let deleteID = $(e.target).data('id');
        swal({
            title: 'Delete Reimbursement',
            text: "Are you sure you want to Delete this Reimbursement?",
            type: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes'
        }).then(async(result) => {
            if (result) {
                $('.fullScreenSpin').css('display', 'block');
                const employeePayrolApis = new EmployeePayrollApi();
                // now we have to make the post request to save the data in database
                const apiEndpoint = employeePayrolApis.collection.findByName(
                    employeePayrolApis.collectionNames.TOpeningBalances
                );

                let reiumbursementSettings = new OpeningBalance({
                    type: "TOpeningBalances",
                    fields: new OpeningBalanceFields({
                        ID: deleteID,
                        Active: false
                    }),
                })

                try {
                    const ApiResponse = await apiEndpoint.fetch(null, {
                        method: "POST",
                        headers: ApiService.getPostHeaders(),
                        body: JSON.stringify(reiumbursementSettings),
                    });

                    if (ApiResponse.ok == true) {
                        let dataObject = await getVS1Data('TOpeningBalances');
                        if (dataObject.length > 0) {
                            data = JSON.parse(dataObject[0].data);
                            if (data.topeningbalances.length > 0) {
                                let useData = data.topeningbalances.map((item) => {
                                    if (deleteID == item.fields.ID) {
                                        item.fields.Active = false;
                                    }
                                    return item;
                                });
                                let updatedObj = {
                                    topeningbalances: useData
                                }
                                await addVS1Data('TOpeningBalances', JSON.stringify(updatedObj));
                            }
                        }
                        await templateObject.getOpeningBalances();
                        $('.fullScreenSpin').css('display', 'none');
                        swal({
                            title: 'Reimbursement deleted successfully',
                            text: '',
                            type: 'success',
                            showCancelButton: false,
                            confirmButtonText: 'OK'
                        }).then((result) => {
                            if (result.value) {
                                if (result.value) {}
                            }
                        });
                    } else {
                        $('.fullScreenSpin').css('display', 'none');
                        swal({
                            title: 'Oooops...',
                            text: ApiResponse.headers.get('errormessage'),
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {}
                        });
                    }
                } catch (error) {
                    $('.fullScreenSpin').css('display', 'none');
                    swal({
                        title: 'Oooops...',
                        text: error,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {}
                    });
                }
            }
        })
    },
    'change .obCalculateTotalAmount': function(e) {
        let templateObject = Template.instance();
        // handleTotalAmount( 'obCalculateEarningTotalAmount', 'obEarningTotalAmount' )
        let Amount = $(e.target).val();
        let ID = $(e.target).data('id');
        templateObject.updateOBTotal(Amount, ID);
    },
    'click #saveOpeningBalance': async function(e) {
        // TO DO
        $('.fullScreenSpin').css('display', 'block');
        let templateObject = Template.instance();
        let currentId = FlowRouter.current().queryParams;
        let employeeID = (!isNaN(currentId.id)) ? currentId.id : 0;
        let openingBalances = []
        let TOpeningBalances = await getVS1Data('TOpeningBalances');
        if (TOpeningBalances.length) {
            let TOpeningBalancesData = JSON.parse(TOpeningBalances[0].data);
            openingBalances = OpeningBalance.fromList(
                TOpeningBalancesData.topeningbalances
            ).filter((item) => {
                if (parseInt(item.fields.EmployeeID) !== parseInt(employeeID)) {
                    return item;
                }
            });
        }
        let obEarningLines = [];
        let checkOpeningBalances = templateObject.openingBalanceInfo.get();
        if (Array.isArray(checkOpeningBalances)) {
            obEarningLines = OpeningBalance.fromList(
                checkOpeningBalances
            ).filter((item) => {
                if (parseInt(item.fields.EmployeeID) == parseInt(employeeID) && item.fields.Type == 'EarningLine') {
                    return item;
                }
            });
        }
        if (obEarningLines.length) {
            Array.prototype.forEach.call(obEarningLines, (EarningLine, index) => {
                EarningLine.fields.Amount = $('#obEarningAmount' + index).val();
                openingBalances.push(EarningLine);
            })
        }
        let obDeductionLines = [];
        if (Array.isArray(checkOpeningBalances)) {
            obDeductionLines = OpeningBalance.fromList(
                checkOpeningBalances
            ).filter((item) => {
                if (parseInt(item.fields.EmployeeID) == parseInt(employeeID) && item.fields.Type == 'DeductionLine') {
                    return item;
                }
            });
        }
        if (obDeductionLines.length) {
            Array.prototype.forEach.call(obDeductionLines, (DeductionLine, index) => {
                DeductionLine.fields.Amount = $('#obDeductionAmount' + index).val();
                openingBalances.push(DeductionLine);
            })
        }
        let obSuperannuationLines = []
        if (Array.isArray(checkOpeningBalances)) {
            obSuperannuationLines = OpeningBalance.fromList(
                checkOpeningBalances
            ).filter((item) => {
                if (parseInt(item.fields.EmployeeID) == parseInt(employeeID) && item.fields.Type == 'SuperannuationLine') {
                    return item;
                }
            });
        }
        if (obSuperannuationLines.length) {
            Array.prototype.forEach.call(obEarningLines, (obSuperannuationLine, index) => {
                obSuperannuationLine.fields.Amount = $('#obSuperannuationAmount' + index).val();
                openingBalances.push(obSuperannuationLine);
            })
        }
        let obReimbursementLines = [];
        if (Array.isArray(checkOpeningBalances)) {
            obReimbursementLines = OpeningBalance.fromList(
                checkOpeningBalances
            ).filter((item) => {
                if (parseInt(item.fields.EmployeeID) == parseInt(employeeID) && item.fields.Type == 'ReimbursementLine') {
                    return item;
                }
            });
        }
        if (obReimbursementLines.length) {
            Array.prototype.forEach.call(obEarningLines, (obReimbursementLine, index) => {
                obReimbursementLine.fields.Amount = $('#obReimbursementAmount' + index).val();
                openingBalances.push(obReimbursementLine);
            })
        }
        let updatedOpeningBalances = {
            topeningbalances: openingBalances,
        }
        await addVS1Data('TOpeningBalances', JSON.stringify(updatedOpeningBalances));
        $('.fullScreenSpin').css('display', 'none');
    },
    // hide save button
    'click .nav-link': function(e) {
        if ($(e.target).hasClass('hideSaveButton')) {
            $('#btnSaveEmployeePayroll').hide();
        } else {
            $('#btnSaveEmployeePayroll').show();
        }

    },
    // Save active tab data
    'click #btnSaveEmployeePayroll': async(event) => {
        playSaveAudio();
        // setTimeout(async function(){
        let activeTab = "";
        if ($('div#taxes').attr("class").indexOf("active") >= 0) activeTab = "taxes";
        if ($('div#leave').attr("class").indexOf("active") >= 0) activeTab = "leave";
        if ($('div#bankaccounts').attr("class").indexOf("active") >= 0) activeTab = "bankaccounts";
        if ($('div#payslips').attr("class").indexOf("active") >= 0) activeTab = "payslips";
        if ($('div#paytemplate').attr("class").indexOf("active") >= 0) activeTab = "paytemplate";
        if ($('div#openingbalances').attr("class").indexOf("active") >= 0) activeTab = "openingbalances";
        if ($('div#notes').attr("class").indexOf("active") >= 0) activeTab = "notes";
        if (activeTab == "taxes") {
            // we are in tax rates tab
            let TaxFileNumber = $("#edtTaxFileNumber").val();
            let TFNExemption = $("#edtTfnExemption").val();
            let EmploymentBasis = $("#edtEmploymentBasis").val();
            let ResidencyStatus = $("#edtResidencyStatus").val();

            // We should use the ID of the selected calendar and not the text value
            // let EdtPayPeriod = $("#edtPayPeriod").attr('calendar-id') || '';
            let EdtPayPeriod = $("#edtPayPeriod").val() || '';

            let FirstPayDate = $("#edtFirstPayDate").val();
            let StartingDate = $("#dtStartingDate").val();
            let FirstName = $("#edtFirstName").val();
            let LastName = $("#edtLastName").val();
            let DOB = $("#dtDOB").val();
            let Gender = $('#edtGender').val();
            let Email = $("#edtEmailAddress").val();
            let TaxFreeThreshold = $("#taxesTaxFreeThresholdClaimed").is(':checked') ? true : false;
            let StudyTrainingSupportLoan = $("#taxesStudyTrainingSupportLoans").is(':checked') ? true : false;
            let EligibleToReceiveLeaveLoading = $("#taxesEligibleReceiveLeaveLoading").is(':checked') ? true : false;
            let OtherTaxOffsetClaimed = $("#taxesOtherTaxOffsetClaimed").is(':checked') ? true : false;
            let UpwardvariationRequested = $("#taxesUpwardVariationRequested").is(':checked') ? true : false;
            let SeniorandPensionersTaxOffsetClaimed = $("#taxesSeniorPensionersTaxOffsetClaimed").is(':checked') ? true : false;
            let HasApprovedWithholdingVariation = $("#taxesHasApprovedWithholdingVariation").is(':checked') ? true : false;
            if (TaxFileNumber == "" && TFNExemption == "") {
                handleValidationError('Please enter Tax File Number or TFN Exemption!', 'edtTaxFileNumber');
                return false;
            }
            if (EmploymentBasis == "") {
                handleValidationError('Please select Employment Basis!', 'edtEmploymentBasis');
                return false;
            }
            if (ResidencyStatus == "") {
                handleValidationError('Please select Residency Status!', 'edtResidencyStatus');
                return false;
            }
            if (EdtPayPeriod == "") {
                handleValidationError('Please select Pay Period!', 'edtPayPeriod');
                return false;
            }
            if (FirstPayDate == "") {
                handleValidationError('Please select First Pay Date!', 'edtFirstPayDate');
                return false;
            }
            LoadingOverlay.show();
            let currentId = FlowRouter.current().queryParams;
            let employeeID = (!isNaN(currentId.id)) ? currentId.id : 0;
            let templateObject = Template.instance();
            let Exemption = 0;
            switch (TFNExemption) {
                case "No TFN Quoted":
                    Exemption = 0;
                    break;
                case "TFN Pending":
                    Exemption = 1;
                    break;
                case "TFN Exempt - Under 18":
                    Exemption = 2;
                    break;
                case "TFN Exempt - Pensioner":
                    Exemption = 3;
                    break;
            }

            /**
             * Load EmployeePayrollApi API
             */
            const employeePayrollApi = new EmployeePayrollApi();

            const apiEndpoint = employeePayrollApi.collection.findByName(
                employeePayrollApi.collectionNames.TEmployeepaysettings
            );

            let useData = [];
            const listEmployeePaySettings = {}
            let ePaySettings = templateObject.employeePaySettings.get();
            let employeePaySettings = {
                type: 'TEmployeepaysettings',
                fields: {
                    ID: ePaySettings.ID || 0,
                    Employeeid: parseInt(employeeID),
                    Payperiod: EdtPayPeriod,
                    FirstPayDate: moment(FirstPayDate, "DD/MM/YYYY").format('YYYY-MM-DD HH:mm:ss'),
                    Employee: {
                        type: 'TEmployeeDetails',
                        fields: {
                            ID: parseInt(employeeID),
                            TFN: TaxFileNumber,
                            TaxScaleID: 0,
                            TaxFreeThreshold: TaxFreeThreshold,
                            CgtExempt: (Exemption) ? parseInt(Exemption) : 0,
                            BasisOfPayment: EmploymentBasis,
                            Resident: (ResidencyStatus == 'true') ? true : false,
                            StudentLoanIndicator: StudyTrainingSupportLoan,
                            PaySuperonLeaveLoading: EligibleToReceiveLeaveLoading,
                            Pensioner: SeniorandPensionersTaxOffsetClaimed,
                            FirstName: FirstName,
                            LastName: LastName,
                            DateStarted: moment(StartingDate, "DD/MM/YYYY").format('YYYY-MM-DD HH:mm:ss'),
                            DOB: moment(DOB, "DD/MM/YYYY").format('YYYY-MM-DD HH:mm:ss'),
                            Sex: Gender,
                            Email: Email
                        }
                    }
                }
            };
            try {
                const ApiResponse = await apiEndpoint.fetch(null, {
                    method: "POST",
                    headers: ApiService.getPostHeaders(),
                    body: JSON.stringify(employeePaySettings),
                });
                if (ApiResponse.ok == true) {
                    // await templateObject.saveEmployeePaySettingsLocalDB();
                    await templateObject.getEmployeePaySettings(true);
                    $('.statusUnsaved').hide();
                    $('.statusSaved').show();
                    $('.fullScreenSpin').css('display', 'none');
                    swal({
                        title: 'Taxes saved successfully',
                        text: '',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'OK'
                    }).then((result) => {
                        if (result.value) {
                            if (result.value) {}
                        }
                    });
                } else {
                    $('.fullScreenSpin').css('display', 'none');
                    swal({
                        title: 'Oooops...',
                        text: ApiResponse.headers.get('errormessage'),
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {}
                    });
                }
            } catch (error) {
                $('.fullScreenSpin').css('display', 'none');
                swal({
                    title: 'Oooops...',
                    text: error,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {}
                });
            }
            return false

            /**
             * Saving employeePaySettings Object in localDB
             */

            listEmployeePaySettings.temployeepaysettings = useData;
            await addVS1Data('TEmployeepaysettings', JSON.stringify(listEmployeePaySettings));
            $('.fullScreenSpin').css('display', 'none');

            return false;

            addVS1Data('TEmployeepaysettings', JSON.stringify(currentInfo));
            $('.fullScreenSpin').css('display', 'none');
            return;
            
            employeePayrollService.saveTEmployeepaysettings(objDetails).then(function(objDetails) {
                employeePayrollService.getAllEmployeePaySettings('All', 0).then(function(data) {
                    addVS1Data('TEmployeepaysettings', newDataObj);
                }).catch(function(err) {});

            }).catch(function(err) {
                swal({
                    title: 'Oooops...',
                    text: err,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {
                        //Meteor._reload.reload();
                    } else if (result.dismiss === 'cancel') {}
                });
                $('.fullScreenSpin').css('display', 'none');
            });
        } else if (activeTab == "leave") {

        } else if (activeTab == "bankaccounts") {

            let currentId = FlowRouter.current().queryParams;
            let employeeID = (!isNaN(currentId.id)) ? currentId.id : 0;
            let templateObject = Template.instance();
            /**
             * Load EmployeePayrollApi API
             */
            const employeePayrollApi = new EmployeePayrollApi();

            const apiEndpoint = employeePayrollApi.collection.findByName(
                employeePayrollApi.collectionNames.TEmployeepaysettings
            );

            let bankAccountStatement = $("#bankAccountStatement").val();
            let bankAccountName = $("#bankAccountName").val();
            let bankAccountBSB = $("#bankAccountBSB").val();
            let bankAccountNo = $("#bankAccountNo").val();
            // We should use the ID of the selected calendar and not the text value
            // let EdtPayPeriod = $("#edtPayPeriod").attr('calendar-id') || '';
            let EdtPayPeriod = $("#edtPayPeriod").val() || '';

            let FirstPayDate = $("#edtFirstPayDate").val();
            if (FirstPayDate == "") {
                handleValidationError('Please select First Pay Date in Taxes Tab!', 'edtFirstPayDate');
                return false;
            }
            if (EdtPayPeriod == "") {
                handleValidationError('Please select Pay Period in Taxes Tab!', 'edtPayPeriod');
                return false
            }
            if (bankAccountStatement == "") {
                handleValidationError('Please enter Statement Text!', 'bankAccountStatement');
                return false
            }
            if (bankAccountName == "") {
                handleValidationError('Please enter Account Name!', 'bankAccountName');
                return false
            }
            if (bankAccountNo == "") {
                handleValidationError('Please enter Account Number!', 'bankAccountNo');
                return false
            }
            if (bankAccountBSB == "") {
                handleValidationError('Please enter Account BSB!', 'bankAccountBSB');
                return false
            }
            $('.fullScreenSpin').css('display', 'block');

            let employeePaySettings = templateObject.employeePaySettings.get();

            let employeeBankPaySettings = {
                type: 'TEmployeepaysettings',
                fields: {
                    ID: employeePaySettings.ID,
                    Employeeid: parseInt(employeeID),
                    BankAccountBSB: bankAccountBSB,
                    BankAccountName: bankAccountName,
                    BankAccountNo: bankAccountNo,
                    Statement: bankAccountStatement,
                    Payperiod: EdtPayPeriod,
                    FirstPayDate: moment(FirstPayDate, "DD/MM/YYYY").format('YYYY-MM-DD HH:mm:ss')
                }
            }

            try {
                const ApiResponse = await apiEndpoint.fetch(null, {
                    method: "POST",
                    headers: ApiService.getPostHeaders(),
                    body: JSON.stringify(employeeBankPaySettings),
                });

                if (ApiResponse.ok == true) {
                    // await templateObject.saveEmployeePaySettingsLocalDB();
                    await templateObject.getEmployeePaySettings(true);
                    $('.fullScreenSpin').css('display', 'none');
                    swal({
                        title: 'Bank Accounts Saved Successfully',
                        text: '',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'OK'
                    }).then((result) => {
                        if (result.value) {
                            if (result.value) {}
                        }
                    });
                } else {
                    $('.fullScreenSpin').css('display', 'none');
                    swal({
                        title: 'Oooops...',
                        text: ApiResponse.headers.get('errormessage'),
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {}
                    });
                }
            } catch (error) {
                $('.fullScreenSpin').css('display', 'none');
                swal({
                    title: 'Oooops...',
                    text: error,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {}
                });
            }

            return false;
            // Old Dev Code
            let data = [];

            let employeePayrollService = new EmployeePayrollService();

            let EmployeeID = FlowRouter.current().queryParams;

            let firstContainer = ($(".firstContainer").attr("class").indexOf("d-none") >= 0) ? true : false;
            let secondContainer = ($(".secondContainer").attr("class").indexOf("d-none") >= 0) ? true : false;
            let thirdContainer = ($(".thirdContainer").attr("class").indexOf("d-none") >= 0) ? true : false;

            let primaryFlag = false;
            let firstFlag = false;
            let secondFlag = false;
            let thirdFlag = false;

            let primaryObj = null;
            let firstObj = null;
            let secondObj = null;
            let thirdObj = null;

            let primaryStatementText = $(".primaryStatementText").val().trim();
            let primaryAccName = $(".primaryAccName").val().trim();
            let primaryBsbNumber = $(".primaryBsbNumber").val().trim();
            let primaryAccNumber = $(".primaryAccNumber").val().trim();
            let primaryID = $(".primaryID").val();

            if (primaryStatementText == "") primaryFlag = true;
            if (primaryAccName == "") primaryFlag = true;
            if (primaryBsbNumber == "") primaryFlag = true;
            if (primaryAccNumber == "") primaryFlag = true;

            if (primaryFlag) {

                swal('Primary Bank Account cannot be blank!', '', 'info');
                event.preventDefault();
                return;
            }

            data.push({
                type: "TBankAccounts",
                fields: {
                    ID: primaryID ? primaryID : null,
                    EmployeeID: EmployeeID.id,
                    IsPrimary: true,
                    StatementText: primaryStatementText,
                    AccName: primaryAccName,
                    BSBNumber: primaryBsbNumber,
                    AccNumber: primaryAccNumber,
                }
            });

            let firstStatementText = $(".firstStatementText").val().trim();
            let firstAccName = $(".firstAccName").val().trim();
            let firstBsbNumber = $(".firstBsbNumber").val().trim();
            let firstAccNumber = $(".firstAccNumber").val().trim();
            let firstID = $(".firstID").val();

            if (!firstContainer) {
                if (firstStatementText == "") firstFlag = true;
                if (firstAccName == "") firstFlag = true;
                if (firstBsbNumber == "") firstFlag = true;
                if (firstAccNumber == "") firstFlag = true;

                if (firstFlag) {
                    swal('First Bank Account cannot be blank!', '', 'info');
                    event.preventDefault();
                    return;
                }

                data.push({
                    type: "TBankAccounts",
                    fields: {
                        ID: firstID ? firstID : null,
                        EmployeeID: EmployeeID.id,
                        IsPrimary: false,
                        StatementText: firstStatementText,
                        AccName: firstAccName,
                        BSBNumber: firstBsbNumber,
                        AccNumber: firstAccNumber,
                    }
                });
            }
            let secondStatementText = $(".secondStatementText").val();
            let secondAccName = $(".secondAccName").val();
            let secondBsbNumber = $(".secondBsbNumber").val();
            let secondAccNumber = $(".secondAccNumber").val();
            let secondID = $(".secondID").val();

            if (!secondContainer) {
                if (secondStatementText == "") secondFlag = true;
                if (secondAccName == "") secondFlag = true;
                if (secondBsbNumber == "") secondFlag = true;
                if (secondAccNumber == "") secondFlag = true;
                if (secondFlag) {
                    swal('Second Bank Account cannot be blank!', '', 'info');
                    event.preventDefault();
                    return;
                }
                data.push({
                    type: "TBankAccounts",
                    fields: {
                        ID: secondID ? secondID : null,
                        EmployeeID: EmployeeID.id,
                        IsPrimary: false,
                        StatementText: secondStatementText,
                        AccName: secondAccName,
                        BSBNumber: secondBsbNumber,
                        AccNumber: secondAccNumber,
                    }
                });
            }

            let thirdStatementText = $(".thirdStatementText").val();
            let thirdAccName = $(".thirdAccName").val();
            let thirdBsbNumber = $(".thirdBsbNumber").val();
            let thirdAccNumber = $(".thirdAccNumber").val();
            let thirdID = $(".thirdID").val();

            if (!thirdContainer) {
                if (thirdStatementText == "") thirdFlag = true;
                if (thirdAccName == "") thirdFlag = true;
                if (thirdBsbNumber == "") thirdFlag = true;
                if (thirdAccNumber == "") thirdFlag = true;
                if (thirdFlag) {
                    swal('Third Bank Account cannot be blank!', '', 'info');
                    event.preventDefault();
                    return;
                }
                data.push({
                    type: "TBankAccounts",
                    fields: {
                        ID: thirdID ? thirdID : null,
                        EmployeeID: EmployeeID.id,
                        IsPrimary: false,
                        StatementText: thirdStatementText,
                        AccName: thirdAccName,
                        BSBNumber: thirdBsbNumber,
                        AccNumber: thirdAccNumber,
                    }
                });
            }
            LoadingOverlay.show();
            addVS1Data('TBankAccounts', JSON.stringify(data));
            $('.fullScreenSpin').css('display', 'none');
            return;
            employeePayrollService.saveTBankAccounts(data).then(function(objDetails) {
                employeePayrollService.getAllTBankAccounts('All', 0).then(function(data) {
                    addVS1Data('TBankAccounts', data);
                }).catch(function(err) {});

            }).catch(function(err) {
                swal({
                    title: 'Oooops...',
                    text: err,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {
                        //Meteor._reload.reload();
                    } else if (result.dismiss === 'cancel') {}
                });
                $('.fullScreenSpin').css('display', 'none');
            });

            // let StatementText = $(".statementText").val();
            // let AccName = $(".accName").val();
            // let BSBNumber = $(".bsbNumber").val();
            // let AccNumber = $(".accNumber").val();
            // let ID;
            // let Primary;


            // let data = [{
            //     type: "TBankAccounts",
            //     fields: {
            //         ID: 1,
            //         EmployeeID: EmployeeID.id,
            //         IsPrimary: true,
            //         StatementText: StatementText,
            //         AccName: AccName,
            //         BSBNumber: BSBNumber,
            //         AccNumber: AccNumber,
            //     }
            // }]
            // addVS1Data('TBankAccounts', JSON.stringify(data));

        } else if (activeTab == "payslips") {

        } else if (activeTab == "paytemplate") {
            $('.fullScreenSpin').css('display', 'block');
            // $('.fullScreenSpin').show();
            let templateObject = Template.instance();
            let currentId = FlowRouter.current().queryParams;
            let employeeID = (!isNaN(currentId.id)) ? currentId.id : 0;
            const employeePayrolApis = new EmployeePayrollApi();
            let apiEndpoint = [];

            // WORKING HERE
            // Fetch earning lines values
            let tPayTemplateEarningLine = [];
            let tPayTemplateDeductionLine = [];
            let tPayTemplateSuperannuationLine = [];
            let tPayTemplateReiumbursementLine = [];
            let earningLines = await templateObject.filterPayTemplates("earningLines");
            let superannuationLines = await templateObject.filterPayTemplates("superannuationLines");
            let deductionLines = await templateObject.filterPayTemplates("deductionLines");
            let reiumbursementLines = await templateObject.filterPayTemplates("reiumbursementLines");

            if (earningLines.length > 0) {
                for (const item of earningLines) {
                    if (item.Active == true) {
                        let EarningRate = $(`#ptEarningRate${item.ID}`).val();
                        let amount = $(`#ptEarningAmount${item.ID}`).val();
                        amount = (amount === undefined || amount === null || amount == '') ? 0 : amount;
                        amount = (amount) ? Number(amount.replace(/[^0-9.-]+/g, "")) : 0;
                        tPayTemplateEarningLine.push({
                            type: "TPayTemplateEarningLine",
                            fields: {
                                ID: item.ID,
                                EarningRate: EarningRate,
                                Amount: parseFloat(amount),
                                Active: true,
                            },
                        })
                    }
                }
                apiEndpoint = employeePayrolApis.collection.findByName(
                    employeePayrolApis.collectionNames.TPayTemplateEarningLine
                );
                // Making bulk saving object
                let payTemplateEarningLineObj = {
                    type: "TPayTemplateEarningLine",
                    objects: tPayTemplateEarningLine
                };
                const ApiResponse = await apiEndpoint.fetch(null, {
                    method: "POST",
                    headers: ApiService.getPostHeaders(),
                    body: JSON.stringify(payTemplateEarningLineObj),
                });
                if (ApiResponse.ok == true) {
                    const jsonResponse = await ApiResponse.json();
                    await templateObject.saveEarningLocalDB();
                    // await templateObject.getPayEarningLines();
                }
            }
            // Fetch deduction lines values
            if (deductionLines.length > 0) {
                for (const item of deductionLines) {
                    if (item.fields.Active == true) {
                        let DeductionType = $(`#ptDeductionType${item.fields.ID}`).val();
                        let amount = $(`#ptDeductionAmount${item.fields.ID}`).val();
                        let percentVal = $(`#ptDeductionPercentage${item.fields.ID}`).val();
                        percentVal = (percentVal === undefined || percentVal === null || percentVal.length === 0) ? 0 : percentVal;
                        percentVal = (percentVal) ? Number(percentVal.replace(/[^0-9.-]+/g, "")) : 0;
                        amount = (amount === undefined || amount === null || amount == '') ? 0 : amount;
                        amount = (amount) ? Number(amount.replace(/[^0-9.-]+/g, "")) : 0;
                        tPayTemplateDeductionLine.push({
                            type: "TPayTemplateDeductionLine",
                            fields: {
                                ID: item.fields.ID,
                                DeductionType: DeductionType,
                                Amount: parseFloat(amount),
                                Percentage: String(percentVal),
                                Active: true,
                            },
                        });
                    }
                }

                apiEndpoint = employeePayrolApis.collection.findByName(
                    employeePayrolApis.collectionNames.TPayTemplateDeductionLine
                );
                // Making bulk saving object
                let payTemplateDeductionLineObj = {
                    type: "TPayTemplateDeductionLine",
                    objects: tPayTemplateDeductionLine
                };
                const ApiResponse = await apiEndpoint.fetch(null, {
                    method: "POST",
                    headers: ApiService.getPostHeaders(),
                    body: JSON.stringify(payTemplateDeductionLineObj),
                });
                if (ApiResponse.ok == true) {
                    const jsonResponse = await ApiResponse.json();
                    await templateObject.saveDeductionLocalDB();
                }
            }
            // Fetch superannuation funds values
            if (superannuationLines.length > 0) {
                for (const item of superannuationLines) {
                    if (item.fields.Active == true) {
                        let SuperannuationFund = $(`#ptSuperannuationFund${item.fields.ID}`).val();
                        let amount = $(`#ptSuperannuationAmount${item.fields.ID}`).val();
                        let percentVal = $(`#ptSuperannuationPercentage${item.fields.ID}`).val();
                        amount = (amount === undefined || amount === null || amount == '') ? 0 : amount;
                        amount = (amount) ? Number(amount.replace(/[^0-9.-]+/g, "")) : 0;
                        percentVal = (percentVal === undefined || percentVal === null || percentVal.length === 0) ? 0 : percentVal;
                        percentVal = (percentVal) ? Number(percentVal.replace(/[^0-9.-]+/g, "")) : 0;
                        tPayTemplateSuperannuationLine.push({
                            type: "TPayTemplateSuperannuationLine",
                            fields: {
                                ID: item.fields.ID,
                                Fund: SuperannuationFund,
                                Amount: parseFloat(amount),
                                Percentage: percentVal,
                                Active: true,
                            },
                        })

                    }
                }

                apiEndpoint = employeePayrolApis.collection.findByName(
                    employeePayrolApis.collectionNames.TPayTemplateSuperannuationLine
                );
                // Making bulk saving object
                let payTemplateSuperannuationLineObj = {
                    type: "TPayTemplateSuperannuationLine",
                    objects: tPayTemplateSuperannuationLine
                };
                const ApiResponse = await apiEndpoint.fetch(null, {
                    method: "POST",
                    headers: ApiService.getPostHeaders(),
                    body: JSON.stringify(payTemplateSuperannuationLineObj),
                });
                if (ApiResponse.ok == true) {
                    const jsonResponse = await ApiResponse.json();
                    await templateObject.saveSuperannuationLocalDB();
                    // await templateObject.getPaySuperannuationLines();
                }
            }
            // Fetch reiumbursement funds values
            if (reiumbursementLines.length > 0) {
                for (const item of reiumbursementLines) {
                    if (item.fields.Active == true) {
                        let ReiumbursementType = $(`#ptReimbursementType${item.fields.ID}`).val();
                        let amount = $(`#ptReimbursementAmount${item.fields.ID}`).val();
                        amount = (amount === undefined || amount === null || amount == '') ? 0 : amount;
                        amount = (amount) ? Number(amount.replace(/[^0-9.-]+/g, "")) : 0;
                        tPayTemplateReiumbursementLine.push({
                            type: "TPayTemplateReiumbursementLine",
                            fields: {
                                ID: item.fields.ID,
                                ReiumbursementType: ReiumbursementType,
                                Amount: parseFloat(amount),
                                Active: true,
                                EmployeeID: employeeID,
                            },
                        });
                    }
                }

                apiEndpoint = employeePayrolApis.collection.findByName(
                    employeePayrolApis.collectionNames.TPayTemplateReiumbursementLine
                );
                // Making bulk saving object
                let payTemplateReiumbursementLineObj = {
                    type: "TPayTemplateReiumbursementLine",
                    objects: tPayTemplateReiumbursementLine
                };
                const ApiResponse = await apiEndpoint.fetch(null, {
                    method: "POST",
                    headers: ApiService.getPostHeaders(),
                    body: JSON.stringify(payTemplateReiumbursementLineObj),
                });
                if (ApiResponse.ok == true) {
                    const jsonResponse = await ApiResponse.json();
                    await templateObject.saveReiumbursementDB();
                    // await templateObject.getPayReiumbursementLines();
                }
            }

            if (deductionLines.length > 0 || earningLines.length > 0 || superannuationLines.length > 0 || reiumbursementLines.length > 0) {
                $('.fullScreenSpin').css('display', 'none');
                swal({
                    title: 'Pay Template Saved Successfully',
                    text: '',
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'OK'
                });
            } else {
                $('.fullScreenSpin').css('display', 'none');
            }

        } else if (activeTab == "openingbalances") {
            $('.fullScreenSpin').show();
            let templateObject = Template.instance();
            let currentId = FlowRouter.current().queryParams;
            let employeeID = (!isNaN(currentId.id)) ? currentId.id : 0;

            // WORKING HERE
            /**
             * Fetch Earning Opening fields data
             */
            let tOpeningBalance = [];
            let obEarningLines = templateObject.filterOpeningBalance(0);
            if (obEarningLines.length > 0) {
                for (const item of obEarningLines) {
                    if (item.fields.Active == true) {
                        let AType = $(`#obEarningRate${item.fields.ID}`).val();
                        let amount = $(`#obEarningAmount${item.fields.ID}`).val();
                        amount = (amount === undefined || amount === null || amount == '') ? 0 : amount;
                        amount = (amount) ? Number(amount.replace(/[^0-9.-]+/g, "")) : 0;
                        tOpeningBalance.push({
                            type: "TOpeningBalances",
                            fields: {
                                ID: item.fields.ID,
                                AType: AType,
                                Amount: amount,
                                Active: true
                            }
                        })
                    }
                }
            }
            /**
             * Fetch deduction Opening fields data
             */
            let obDeductionLines = templateObject.filterOpeningBalance(1);
            if (obDeductionLines.length > 0) {
                for (const item of obDeductionLines) {
                    if (item.fields.Active == true) {
                        let AType = $(`#obDeductionLine${item.fields.ID}`).val();
                        let amount = $(`#obDeductionAmount${item.fields.ID}`).val();
                        amount = (amount === undefined || amount === null || amount == '') ? 0 : amount;
                        amount = (amount) ? Number(amount.replace(/[^0-9.-]+/g, "")) : 0;
                        tOpeningBalance.push({
                            type: "TOpeningBalances",
                            fields: {
                                ID: item.fields.ID,
                                AType: AType,
                                Amount: amount,
                                Active: true
                            }
                        })
                    }
                }
            }
            /**
             * Fetch superannuation Opening fields data
             */
            let obSAnnuationLines = templateObject.filterOpeningBalance(2);
            if (obSAnnuationLines.length > 0) {
                for (const item of obSAnnuationLines) {
                    if (item.fields.Active == true) {
                        let AType = $(`#obSuperannuationFund${item.fields.ID}`).val();
                        let amount = $(`#obSuperannuationAmount${item.fields.ID}`).val();
                        amount = (amount === undefined || amount === null || amount == '') ? 0 : amount;
                        amount = (amount) ? Number(amount.replace(/[^0-9.-]+/g, "")) : 0;
                        tOpeningBalance.push({
                            type: "TOpeningBalances",
                            fields: {
                                ID: item.fields.ID,
                                AType: AType,
                                Amount: amount,
                                Active: true
                            }
                        })
                    }
                }
            }
            /**
             * Fetch Reinmbursment Opening fields data
             */
            let obReImbursmentLines = templateObject.filterOpeningBalance(3);
            if (obReImbursmentLines.length > 0) {
                for (const item of obReImbursmentLines) {
                    if (item.fields.Active == true) {
                        let AType = $(`#obReimbursementFund${item.fields.ID}`).val();
                        let amount = $(`#obReimbursementAmount${item.fields.ID}`).val();
                        amount = (amount === undefined || amount === null || amount == '') ? 0 : amount;
                        amount = (amount) ? Number(amount.replace(/[^0-9.-]+/g, "")) : 0;
                        tOpeningBalance.push({
                            type: "TOpeningBalances",
                            fields: {
                                ID: item.fields.ID,
                                AType: AType,
                                Amount: amount,
                                Active: true
                            }
                        })
                    }
                }
            }
            // Making bulk saving object
            if (tOpeningBalance.length > 0) {
                let openingBalanceObj = {
                    type: "TOpeningBalances",
                    objects: tOpeningBalance
                };
                const employeePayrolApis = new EmployeePayrollApi();
                const apiEndpoint = employeePayrolApis.collection.findByName(
                    employeePayrolApis.collectionNames.TOpeningBalances
                );
                const ApiResponse = await apiEndpoint.fetch(null, {
                    method: "POST",
                    headers: ApiService.getPostHeaders(),
                    body: JSON.stringify(openingBalanceObj),
                });
                if (ApiResponse.ok == true) {
                    const jsonResponse = await ApiResponse.json();
                    $('#obEarningsRate').val('');
                    await templateObject.saveOpeningBalanceLocalDB();
                    await templateObject.getOpeningBalances();
                    $('#addEarningsLineModal2').modal('hide');
                    $('.fullScreenSpin').css('display', 'none');
                    swal({
                        title: 'Opening Balances has been saved',
                        text: '',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'OK'
                    }).then((result) => {
                        if (result.value) {
                            if (result.value) {}
                        }
                    });
                } else {
                    $('.fullScreenSpin').css('display', 'none');
                    swal({
                        title: 'Oooops...',
                        text: ApiResponse.headers.get('errormessage'),
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {}
                    });
                }
            } else {
                $('.fullScreenSpin').css('display', 'none');
                swal({
                    title: 'Oooops...',
                    text: error,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {}
                });
            }
        } else if (activeTab == "notes") {

        } else {
            return;
        }
        // }, delayTimeAfterSound);
    },
    'change .colServiceCostPrice': function(event) {
        let utilityService = new UtilityService();
        let inputUnitPrice = 0;
        if (!isNaN($(event.target).val())) {
            inputUnitPrice = parseFloat($(event.target).val()) || 0;
            $(event.target).val(utilityService.modifynegativeCurrencyFormat(inputUnitPrice));
        } else {
            inputUnitPrice = Number($(event.target).val().replace(/[^0-9.-]+/g, "")) || 0;
            $(event.target).val(utilityService.modifynegativeCurrencyFormat(inputUnitPrice));
        }
    },
    'change .colServiceSalesPrice': function(event) {

        let utilityService = new UtilityService();
        let inputUnitPrice = 0;
        if (!isNaN($(event.target).val())) {
            inputUnitPrice = parseFloat($(event.target).val()) || 0;
            $(event.target).val(utilityService.modifynegativeCurrencyFormat(inputUnitPrice));
        } else {
            inputUnitPrice = Number($(event.target).val().replace(/[^0-9.-]+/g, "")) || 0;

            $(event.target).val(utilityService.modifynegativeCurrencyFormat(inputUnitPrice));

        }
    },
    'click #addAllProducts': function(event) {
        if ($(event.target).is(':checked')) {
            $('.activeProductEmployee').css('display', 'none');
        } else {
            $('.activeProductEmployee').css('display', 'block');
        }
    },
    'keydown .colServiceCostPrice, keydown .colServiceSalesPrice': function(event) {
        if ($.inArray(event.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||
            (event.keyCode === 65 && (event.ctrlKey === true || event.metaKey === true)) ||
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
            event.keyCode == 46 || event.keyCode == 190 || event.keyCode == 189 || event.keyCode == 109) {} else {
            event.preventDefault();
        }
    },
    'click .btnClosePayment': function(event) {
        if (FlowRouter.current().queryParams.id) {
            window.open('/employeescard?id=' + FlowRouter.current().queryParams.id, '_self');
        } else {
            window.open('/employeescard', '_self');
        }
    },
    'click .btnChargeAccount': function(event) {
        LoadingOverlay.show();

        var enteredEmail = $("#cloudEmpEmailAddress").val();
        let cloudpassword = $("#cloudEmpUserPassword").val();
        let employeeSaveID = $('#selectEmployeeID').val();
        // if(cloudpassword.length < 8) {
        //   swal('Invalid VS1 Password', 'Password must be at least eight characters including one capital letterand one number!', 'error');
        //   $('#cloudEmpUserPassword').css('border-color','red');
        //   $('#cloudEmpUserPassword').focus();
        //   $('.fullScreenSpin').css('display','none');
        // }else{
        //
        //   if((cloudpassword.match(/[A-z]/)) && (cloudpassword.match(/[A-Z]/)) && (cloudpassword.match(/\d/))){
        //     $('#cloudEmpUserPassword').css('border-color','#b5b8bb #e2e4e7 #e8eaec #bdbfc3');

        var empFirstName = $("#edtFirstName").val();
        var empLastName = $("#edtLastName").val();
        var empPhone = $("#edtPhone").val();

        var dateofbirthTime = new Date($("#dtDOB").datepicker("getDate"));
        var startdateTime = new Date($("#dtStartingDate").datepicker("getDate"));

        let empDOB = dateofbirthTime.getFullYear() + "-" + (dateofbirthTime.getMonth() + 1) + "-" + dateofbirthTime.getDate();
        let empStartDate = startdateTime.getFullYear() + "-" + (startdateTime.getMonth() + 1) + "-" + startdateTime.getDate();

        var empGender = $("#edtGender").val() || 'M';
        let addgender = '';
        if (empGender === "Male") {
            addgender = "M";
        } else if (empGender === "Female") {
            addgender = "F";
        } else {
            addgender = empGender;
        };
        var enteredEmail = $("#cloudEmpEmailAddress").val();
        var enteredPassword = $("#cloudEmpUserPassword").val();
        var cloudHashPassword = CryptoJS.MD5(enteredPassword).toString().toUpperCase();
        var erpGet = erpDb();

        let objDetailsUser = {
            //JsonIn:{
            Name: "VS1_NewUser",
            Params: {
                Vs1UserName: enteredEmail,
                Vs1Password: enteredPassword,
                Modulename: "Add Extra User",
                Paymentamount: Number(addExtraUserPrice.replace(/[^0-9.-]+/g, "")) || 35,
                PayMethod: "Cash",
                Price: Number(addExtraUserPrice.replace(/[^0-9.-]+/g, "")) || 35,
                DiscountedPrice: Number(addExtraUserPrice.replace(/[^0-9.-]+/g, "")) || 35,
                DiscountDesc: "",
                RenewPrice: Number(addExtraUserPrice.replace(/[^0-9.-]+/g, "")) || 35,
                RenewDiscountedPrice: Number(addExtraUserPrice.replace(/[^0-9.-]+/g, "")) || 35,
                RenewDiscountDesc: "",
                EmployeeDetails: {
                    ID: parseInt(employeeSaveID) || 0,
                    FirstName: empFirstName,
                    LastName: empLastName,
                    MiddleName: $('#edtMiddleName').val() || '',
                    Phone: empPhone,
                    DateStarted: empStartDate,
                    DOB: empDOB,
                    Sex: addgender,
                },
                DatabaseName: erpGet.ERPDatabase,
                ServerName: erpGet.ERPIPAddress,
                ERPLoginDetails: {
                    ERPUserName: localStorage.getItem('mySession'),
                    ERPPassword: localStorage.getItem('EPassword')
                }
            }
            //}
        };

        var oPost = new XMLHttpRequest();
        oPost.open("POST", URLRequest + loggedserverIP + ':' + loggedserverPort + '/' + 'erpapi/VS1_Cloud_Task/Method?Name="VS1_NewUser"', true);
        oPost.setRequestHeader("database", vs1loggedDatatbase);
        oPost.setRequestHeader("username", 'VS1_Cloud_Admin');
        oPost.setRequestHeader("password", 'DptfGw83mFl1j&9');
        oPost.setRequestHeader("Accept", "application/json");
        oPost.setRequestHeader("Accept", "application/html");
        oPost.setRequestHeader("Content-type", "application/json");

        var myString = '"JsonIn"' + ':' + JSON.stringify(objDetailsUser);

        //
        oPost.send(myString);

        oPost.onreadystatechange = function() {
                if (oPost.readyState == 4 && oPost.status == 200) {

                    $('.fullScreenSpin').css('display', 'none');
                    var myArrResponse = JSON.parse(oPost.responseText);

                    if (myArrResponse.ProcessLog.ResponseStatus != "OK") {
                        // Bert.alert('Database Error<strong> :'+ myArrResponse.ProcessLog.Error+'</strong>', 'now-error');
                        // swal('Ooops...', myArrResponse.ProcessLog.Error, 'error');
                        swal({
                            title: 'Ooops...',
                            text: myArrResponse.ProcessLog.ResponseStatus,
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'OK'
                        }).then((result) => {
                            if (result.value) {
                                if (FlowRouter.current().queryParams.id) {
                                    window.open('/employeescard?id=' + FlowRouter.current().queryParams.id, '_self');
                                } else {
                                    window.open('/employeescard', '_self');
                                }
                            } else if (result.dismiss === 'cancel') {
                                if (FlowRouter.current().queryParams.id) {
                                    window.open('/employeescard?id=' + FlowRouter.current().queryParams.id, '_self');
                                } else {
                                    window.open('/employeescard', '_self');
                                }
                            }
                        });
                    } else {
                        let newStripePrice = objDetailsUser.Params.Price.toFixed(2);
                        // Meteor.call('braintreeChargeCard', Session.get('VS1AdminUserName'), 35);
                        // Meteor.call('StripeChargeCard', Session.get('VS1AdminUserName'), 3500);
                        // swal('User details successfully added', '', 'success');
                        let to2Decimal = objDetailsUser.Params.Price.toFixed(2)
                        let amount = to2Decimal.toString().replace(/\./g, '')
                        let currencyname = (CountryAbbr).toLowerCase();
                        let stringQuery = "?";
                        let name = Session.get('mySessionEmployee').split(' ')[0];
                        let surname = Session.get('mySessionEmployee').split(' ')[1];
                        stringQuery = stringQuery + "product" + 0 + "= New User" + "&price" + 0 + "=" + Currency + objDetailsUser.Params.Price + "&qty" + 0 + "=" + 1 + "&";
                        stringQuery = stringQuery + "tax=0" + "&total=" + Currency + objDetailsUser.Params.Price + "&customer=" + Session.get('vs1companyName') + "&name=" + name + "&surname=" + surname + "&company=" + Session.get('vs1companyName') + "&customeremail=" + localStorage.getItem('mySession') + "&type=VS1 Modules Purchase&url=" + window.location.href + "&server=" + erpGet.ERPIPAddress + "&username=" + erpGet.ERPUsername + "&token=" + erpGet.ERPPassword + "&session=" + erpGet.ERPDatabase + "&port=" + erpGet.ERPPort + "&currency=" + currencyname;
                        sideBarService.getAllEmployees(25, 0).then(function(dataReload) {
                            addVS1Data('TEmployee', JSON.stringify(dataReload)).then(function(datareturn) {
                                $.ajax({
                                    url: stripeGlobalURL + 'vs1_module_purchase.php',
                                    data: {
                                        'email': Session.get('VS1AdminUserName'),
                                        'price': newStripePrice.replace('.', ''),
                                        'currency': currencyname
                                    },
                                    method: 'post',
                                    success: function(response) {
                                        let response2 = JSON.parse(response);
                                        if (response2 != null) {
                                            //Give Full Access To new User created
                                            let objDetailsAccess = {
                                                Name: "VS1_EmployeeAccess",
                                                Params: {
                                                    VS1EmployeeAccessList: [{
                                                        EmployeeId: parseInt(employeeSaveID) || 0,
                                                        formID: 0,
                                                        Access: 1
                                                    }]
                                                }
                                            };

                                            var oPostAccessLevel = new XMLHttpRequest();
                                            var erpGetAccessLevel = erpDb();
                                            oPostAccessLevel.open("POST", URLRequest + erpGetAccessLevel.ERPIPAddress + ':' + erpGetAccessLevel.ERPPort + '/' + 'erpapi/VS1_Cloud_Task/Method?Name="VS1_EmployeeAccess"', true);
                                            oPostAccessLevel.setRequestHeader("database", erpGetAccessLevel.ERPDatabase);
                                            oPostAccessLevel.setRequestHeader("username", erpGetAccessLevel.ERPUsername);
                                            oPostAccessLevel.setRequestHeader("password", erpGetAccessLevel.ERPPassword);
                                            oPostAccessLevel.setRequestHeader("Accept", "application/json");
                                            oPostAccessLevel.setRequestHeader("Accept", "application/html");
                                            oPostAccessLevel.setRequestHeader("Content-type", "application/json");
                                            var myStringAccess = '"JsonIn"' + ':' + JSON.stringify(objDetailsAccess);
                                            oPostAccessLevel.send(myStringAccess);
                                            oPostAccessLevel.onreadystatechange = function() {
                                                if (oPostAccessLevel.readyState == 4 && oPostAccessLevel.status == 200) {

                                                }
                                            };

                                            swal({
                                                title: 'User details successfully added',
                                                text: '',
                                                type: 'success',
                                                showCancelButton: false,
                                                confirmButtonText: 'OK'
                                            }).then((result) => {
                                                if (result.value) {
                                                    let employeeName = $('#edtCustomerCompany').val() || '';
                                                    window.open('/accesslevel?empuser=' + employeeName + '&empuserid=' + employeeSaveID, '_self');

                                                } else {
                                                    FlowRouter.go('/employeelist?success=true');
                                                }
                                            });
                                        } else {
                                            window.open(stripeGlobalURL + stringQuery, '_self');
                                        }
                                    }
                                });
                                //FlowRouter.go('/employeelist?success=true');
                            }).catch(function(err) {
                                FlowRouter.go('/employeelist?success=true');
                                //window.open('https://www.depot.vs1cloud.com/stripe/' + stringQuery, '_self');
                            });
                        }).catch(function(err) {
                            FlowRouter.go('/employeelist?success=true');
                            //window.open('https://www.depot.vs1cloud.com/stripe/' + stringQuery, '_self');
                        });

                    }

                    // Bert.alert('<strong>SUCCESS:</strong> Employee successfully updated!', 'success');

                } else if (oPost.readyState == 4 && oPost.status == 403) {
                    $('.fullScreenSpin').css('display', 'none');
                    swal({
                        title: 'Oooops...',
                        text: oPost.getResponseHeader('errormessage'),
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {
                            window.open('/employeescard', '_self');
                        } else if (result.dismiss === 'cancel') {
                            window.open('/employeescard', '_self');
                        }
                    });
                } else if (oPost.readyState == 4 && oPost.status == 406) {
                    $('.fullScreenSpin').css('display', 'none');
                    var ErrorResponse = oPost.getResponseHeader('errormessage');
                    var segError = ErrorResponse.split(':');

                    if ((segError[1]) == ' "Unable to lock object') {

                        swal({
                            title: 'Oooops...',
                            text: oPost.getResponseHeader('errormessage'),
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {
                                window.open('/employeescard', '_self');
                            } else if (result.dismiss === 'cancel') {
                                window.open('/employeescard', '_self');
                            }
                        });
                    } else {
                        swal({
                            title: 'Oooops...',
                            text: oPost.getResponseHeader('errormessage'),
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {
                                window.open('/employeescard', '_self');
                            } else if (result.dismiss === 'cancel') {
                                window.open('/employeescard', '_self');
                            }
                        });
                    }

                } else if (oPost.readyState == 4 && oPost.status == 401) {
                    $('.fullScreenSpin').css('display', 'none');
                    var ErrorResponse = oPost.getResponseHeader('errormessage');
                    if (ErrorResponse.indexOf("Could not connect to ERP") >= 0) {
                        swal({
                            title: 'Oooops...',
                            text: "Could not connect to Database. Unable to start Database. Licence on hold ",
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {
                                Meteor._reload.reload();
                            } else if (result.dismiss === 'cancel') {

                            }
                        });
                    } else {
                        swal({
                            title: 'Oooops...',
                            text: oPost.getResponseHeader('errormessage'),
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {
                                // Meteor._reload.reload();
                            } else if (result.dismiss === 'cancel') {}
                        });
                    }
                } else if (oPost.readyState == '') {
                    $('.fullScreenSpin').css('display', 'none');
                    //Bert.alert('<strong>'+ oPost.getResponseHeader('errormessage')+'</strong>!', 'danger');
                    swal({
                        title: 'Oooops...',
                        text: oPost.getResponseHeader('errormessage'),
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {
                            window.open('/employeescard', '_self');
                        } else if (result.dismiss === 'cancel') {
                            window.open('/employeescard', '_self');
                        }
                    });
                } else {
                    $('.fullScreenSpin').css('display', 'none');
                }
            }
            //   }else {
            //     swal('Invalid VS1 Password', 'Password must be at least eight characters including one capital letterand one number!', 'error');
            //     $('#cloudEmpUserPassword').css('border-color','red');
            //     $('#cloudEmpUserPassword').focus();
            //     $('.fullScreenSpin').css('display','none');
            //   }
            //
            // }
    },
    'click .btnChargeFreeAccount': function(event) {
        LoadingOverlay.show();

        var enteredEmail = $("#cloudEmpEmailAddress").val();
        let cloudpassword = $("#cloudEmpUserPassword").val();
        let employeeSaveID = $('#selectEmployeeID').val();
        var empFirstName = $("#edtFirstName").val();
        var empLastName = $("#edtLastName").val();
        var empPhone = $("#edtPhone").val();

        var dateofbirthTime = new Date($("#dtDOB").datepicker("getDate"));
        var startdateTime = new Date($("#dtStartingDate").datepicker("getDate"));

        let empDOB = dateofbirthTime.getFullYear() + "-" + (dateofbirthTime.getMonth() + 1) + "-" + dateofbirthTime.getDate();
        let empStartDate = startdateTime.getFullYear() + "-" + (startdateTime.getMonth() + 1) + "-" + startdateTime.getDate();

        var empGender = $("#edtGender").val() || 'M';
        let addgender = '';
        if (empGender === "Male") {
            addgender = "M";
        } else if (empGender === "Female") {
            addgender = "F";
        } else {
            addgender = empGender;
        };
        var enteredEmail = $("#cloudEmpEmailAddress").val();
        var enteredPassword = $("#cloudEmpUserPassword").val();
        var cloudHashPassword = CryptoJS.MD5(enteredPassword).toString().toUpperCase();
        var erpGet = erpDb();

        let objDetailsUser = {
            //JsonIn:{
            Name: "VS1_NewUser",
            Params: {
                Vs1UserName: enteredEmail,
                Vs1Password: enteredPassword,
                Modulename: "Add Extra User",
                // Paymentamount:35,
                Paymentamount: 0,
                Price: Number(addExtraUserPrice.replace(/[^0-9.-]+/g, "")) || 35,
                DiscountedPrice: 0,
                DiscountDesc: "",
                RenewPrice: 0,
                RenewDiscountedPrice: 0,
                RenewDiscountDesc: "Free User Included in the license",
                // PayMethod:"Cash",
                EmployeeDetails: {
                    ID: parseInt(employeeSaveID) || 0,
                    FirstName: empFirstName,
                    LastName: empLastName,
                    MiddleName: $('#edtMiddleName').val() || '',
                    Phone: empPhone,
                    DateStarted: empStartDate,
                    DOB: empDOB,
                    Sex: addgender,
                },
                DatabaseName: erpGet.ERPDatabase,
                ServerName: erpGet.ERPIPAddress,
                ERPLoginDetails: {
                    ERPUserName: localStorage.getItem('mySession'),
                    ERPPassword: localStorage.getItem('EPassword')
                }
            }
            //}
        };

        var oPost = new XMLHttpRequest();
        oPost.open("POST", URLRequest + loggedserverIP + ':' + loggedserverPort + '/' + 'erpapi/VS1_Cloud_Task/Method?Name="VS1_NewUser"', true);
        oPost.setRequestHeader("database", vs1loggedDatatbase);
        oPost.setRequestHeader("username", 'VS1_Cloud_Admin');
        oPost.setRequestHeader("password", 'DptfGw83mFl1j&9');
        oPost.setRequestHeader("Accept", "application/json");
        oPost.setRequestHeader("Accept", "application/html");
        oPost.setRequestHeader("Content-type", "application/json");

        var myString = '"JsonIn"' + ':' + JSON.stringify(objDetailsUser);
        oPost.send(myString);
        oPost.onreadystatechange = function() {
            if (oPost.readyState == 4 && oPost.status == 200) {

                $('.fullScreenSpin').css('display', 'none');
                var myArrResponse = JSON.parse(oPost.responseText);

                if (myArrResponse.ProcessLog.ResponseStatus != "OK") {
                    // swal('Ooops...', myArrResponse.ProcessLog.Error, 'error');
                    swal({
                        title: 'Ooops...',
                        text: myArrResponse.ProcessLog.ResponseStatus,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'OK'
                    }).then((result) => {
                        if (result.value) {
                            if (FlowRouter.current().queryParams.id) {
                                window.open('/employeescard?id=' + FlowRouter.current().queryParams.id, '_self');
                            } else {
                                window.open('/employeescard', '_self');
                            }
                        } else if (result.dismiss === 'cancel') {
                            if (FlowRouter.current().queryParams.id) {
                                window.open('/employeescard?id=' + FlowRouter.current().queryParams.id, '_self');
                            } else {
                                window.open('/employeescard', '_self');
                            }
                        }
                    });
                } else {
                    //Give Full Access To new User created
                    let objDetailsAccess = {
                        Name: "VS1_EmployeeAccess",
                        Params: {
                            VS1EmployeeAccessList: [{
                                EmployeeId: parseInt(employeeSaveID) || 0,
                                formID: 0,
                                Access: 1
                            }]
                        }
                    };

                    var oPostAccessLevel = new XMLHttpRequest();
                    var erpGetAccessLevel = erpDb();
                    oPostAccessLevel.open("POST", URLRequest + erpGetAccessLevel.ERPIPAddress + ':' + erpGetAccessLevel.ERPPort + '/' + 'erpapi/VS1_Cloud_Task/Method?Name="VS1_EmployeeAccess"', true);
                    oPostAccessLevel.setRequestHeader("database", erpGetAccessLevel.ERPDatabase);
                    oPostAccessLevel.setRequestHeader("username", erpGetAccessLevel.ERPUsername);
                    oPostAccessLevel.setRequestHeader("password", erpGetAccessLevel.ERPPassword);
                    oPostAccessLevel.setRequestHeader("Accept", "application/json");
                    oPostAccessLevel.setRequestHeader("Accept", "application/html");
                    oPostAccessLevel.setRequestHeader("Content-type", "application/json");
                    var myStringAccess = '"JsonIn"' + ':' + JSON.stringify(objDetailsAccess);
                    oPostAccessLevel.send(myStringAccess);
                    oPostAccessLevel.onreadystatechange = function() {
                        if (oPostAccessLevel.readyState == 4 && oPostAccessLevel.status == 200) {

                        }
                    };

                    swal({
                        title: 'User details successfully added',
                        text: '',
                        type: 'success',
                        showCancelButton: false,
                        confirmButtonText: 'OK'
                    }).then((result) => {
                        if (result.value) {
                            let employeeName = $('#edtCustomerCompany').val() || '';
                            //window.open('/accesslevel?empuser=' + employeeName, '_self');
                            window.open('/accesslevel?empuser=' + employeeName + '&empuserid=' + employeeSaveID, '_self');

                        } else {
                            sideBarService.getAllEmployees(25, 0).then(function(dataReload) {
                                addVS1Data('TEmployee', JSON.stringify(dataReload)).then(function(datareturn) {
                                    FlowRouter.go('/employeelist?success=true');
                                }).catch(function(err) {
                                    FlowRouter.go('/employeelist?success=true');
                                });
                            }).catch(function(err) {
                                FlowRouter.go('/employeelist?success=true');
                            });
                        }
                    });
                }
            } else if (oPost.readyState == 4 && oPost.status == 403) {
                $('.fullScreenSpin').css('display', 'none');
                swal({
                    title: 'Oooops...',
                    text: oPost.getResponseHeader('errormessage'),
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {
                        window.open('/employeescard', '_self');
                    } else if (result.dismiss === 'cancel') {
                        window.open('/employeescard', '_self');
                    }
                });
            } else if (oPost.readyState == 4 && oPost.status == 406) {
                $('.fullScreenSpin').css('display', 'none');
                var ErrorResponse = oPost.getResponseHeader('errormessage');
                var segError = ErrorResponse.split(':');

                if ((segError[1]) == ' "Unable to lock object') {

                    swal({
                        title: 'Oooops...',
                        text: oPost.getResponseHeader('errormessage'),
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {
                            window.open('/employeescard', '_self');
                        } else if (result.dismiss === 'cancel') {
                            window.open('/employeescard', '_self');
                        }
                    });
                } else {
                    swal({
                        title: 'Oooops...',
                        text: oPost.getResponseHeader('errormessage'),
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {
                            window.open('/employeescard', '_self');
                        } else if (result.dismiss === 'cancel') {
                            window.open('/employeescard', '_self');
                        }
                    });
                }

            } else if (oPost.readyState == 4 && oPost.status == 401) {
                $('.fullScreenSpin').css('display', 'none');
                var ErrorResponse = oPost.getResponseHeader('errormessage');
                if (ErrorResponse.indexOf("Could not connect to ERP") >= 0) {
                    swal({
                        title: 'Oooops...',
                        text: "Could not connect to Database. Unable to start Database. Licence on hold ",
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {
                            Meteor._reload.reload();
                        } else if (result.dismiss === 'cancel') {

                        }
                    });
                } else {
                    swal({
                        title: 'Oooops...',
                        text: oPost.getResponseHeader('errormessage'),
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {
                            // Meteor._reload.reload();
                        } else if (result.dismiss === 'cancel') {}
                    });
                }
            } else if (oPost.readyState == '') {
                $('.fullScreenSpin').css('display', 'none');
                //Bert.alert('<strong>'+ oPost.getResponseHeader('errormessage')+'</strong>!', 'danger');
                swal({
                    title: 'Oooops...',
                    text: oPost.getResponseHeader('errormessage'),
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {
                        window.open('/employeescard', '_self');
                    } else if (result.dismiss === 'cancel') {
                        window.open('/employeescard', '_self');
                    }
                });
            }
        }
    },
    'click .btnBack': function(event) {
        playCancelAudio();
        event.preventDefault();
        setTimeout(function() {
            history.back(1);
        }, delayTimeAfterSound);
    },
    'click #chkSameAsShipping': function(event) {
        // if($(event.target).is(':checked')){
        //   let streetAddress = $('#edtStreetAddress').val();
        //   let city = $('#edtCity').val();
        //   let state =  $('#edtState').val();
        //   let zipcode =  $('#edtPostalCode').val();
        //
        //   let country =  $('#edtCountry').val();
        //    $('#bedtStreetAddress').val(streetAddress);
        //    $('#bedtCity').val(city);
        //    $('#bedtState').val(state);
        //    $('#bedtPostalCode').val(zipcode);
        //    $('#bedtCountry').val(country);
        // }else{
        //   $('#bedtStreetAddress').val('');
        //   $('#bedtCity').val('');
        //   $('#bedtState').val('');
        //   $('#bedtPostalCode').val('');
        //   $('#bedtCountry').val('');
        // }
    },
    'blur #edtFirstName': function(event) {
        let firstname = $('#edtFirstName').val();
        let lastname = $('#edtLastName').val();
        let employeename = firstname + ' ' + lastname;
        $('#cloudEmpName').val(employeename);
        $('#edtCustomerCompany').val(employeename);

    },
    'blur #edtLastName': function(event) {
        let firstname = $('#edtFirstName').val();
        let lastname = $('#edtLastName').val();
        let employeename = firstname + ' ' + lastname;
        $('#cloudEmpName').val(employeename);
        $('#edtCustomerCompany').val(employeename);
    },
    'keyup .search': function(event) {
        const searchTerm = $(".search").val();
        const listItem = $('.results tbody').children('tr');
        const searchSplit = searchTerm.replace(/ /g, "'):containsi('");
        $.extend($.expr[':'], {
            'containsi': function(elem, i, match, array) {
                return (elem.textContent || elem.innerText || '').toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
            }
        });
        $(".results tbody tr").not(":containsi('" + searchSplit + "')").each(function(e) {
            $(this).attr('visible', 'false');
        });
        $(".results tbody tr:containsi('" + searchSplit + "')").each(function(e) {
            $(this).attr('visible', 'true');
        });
        const jobCount = $('.results tbody tr[visible="true"]').length;
        $('.counter').text(jobCount + ' items');

        if (jobCount == '0') {
            $('.no-result').show();
        } else {
            $('.no-result').hide();
        }
        if (searchTerm === "") {
            $(".results tbody tr").each(function(e) {
                $(this).attr('visible', 'true');
                $('.no-result').hide();
            });
            //setTimeout(function () {
            const rowCount = $('.results tbody tr').length;
            $('.counter').text(rowCount + ' items');
            //}, 500);
        }
    },
    'click .tblEmployeeSideList tbody tr': function(event) {
        const empLineID = $(event.target).attr('id');
        if (empLineID) {
            window.open('/employeescard?id=' + empLineID, '_self');
        }
    },
    'click .chkDatatable': function(event) {
        const columns = $('#tblTransactionlist th');
        let columnDataValue = $(event.target).closest("div").find(".divcolumn").text();
        $.each(columns, function(i, v) {
            let className = v.classList;
            let replaceClass = className[1];
            if (v.innerText == columnDataValue) {
                if ($(event.target).is(':checked')) {
                    $("." + replaceClass + "").css('display', 'table-cell');
                    $("." + replaceClass + "").css('padding', '.75rem');
                    $("." + replaceClass + "").css('vertical-align', 'top');
                } else {
                    $("." + replaceClass + "").css('display', 'none');
                }
            }
        });
    },
    'click .resetTable': function(event) {
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
                    PrefName: 'tblTransactionlist'
                });
                if (checkPrefDetails) {
                    CloudPreference.remove({
                        _id: checkPrefDetails._id
                    }, function(err, idTag) {
                        if (err) {} else {
                            Meteor._reload.reload();
                        }
                    });

                }
            }
        }
    },
    'click .saveTable': function(event) {
        let lineItems = [];
        //let datatable =$('#tblTransactionlist').DataTable();
        $('.columnSettings').each(function(index) {
            var $tblrow = $(this);
            var colTitle = $tblrow.find(".divcolumn").text() || '';
            var colWidth = $tblrow.find(".custom-range").val() || 0;
            var colthClass = $tblrow.find(".divcolumn").attr("valueupdate") || '';
            var colHidden = false;
            colHidden = !$tblrow.find(".custom-control-input").is(':checked');
            let lineItemObj = {
                index: index,
                label: colTitle,
                hidden: colHidden,
                width: colWidth,
                thclass: colthClass
            }

            lineItems.push(lineItemObj);
        });
        //datatable.state.save();

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
                    PrefName: 'tblTransactionlist'
                });
                if (checkPrefDetails) {
                    CloudPreference.update({
                        _id: checkPrefDetails._id
                    }, {
                        $set: {
                            userid: clientID,
                            username: clientUsername,
                            useremail: clientEmail,
                            PrefGroup: 'salesform',
                            PrefName: 'tblTransactionlist',
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
                        PrefGroup: 'salesform',
                        PrefName: 'tblTransactionlist',
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
        //Meteor._reload.reload();
    },
    'keyup #cloudEmpEmailAddress': function(event) {
        let columData = $(event.target).val();

        $('#cloudEmpLogonName').val(columData);
        // $('#edtEmailAddress').val(columData);

    },
    'keyup #edtEmailAddress': function(event) {
        let columData = $(event.target).val();

        // $('#cloudEmpLogonName').val(columData);
        // $('#cloudEmpEmailAddress').val(columData);

    },
    'blur #cloudEmpEmailAddress, blur #edtEmailAddress': function(event) {
        let emailData = $(event.target).val().replace(/;/g, ",");

        //$('#cloudEmpLogonName').val(emailData);

        function isEmailValid(emailData) {
            return /^[A-Z0-9'.1234z_%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(emailData);
        }

        // if (emailData != '') {
        //     if (!isEmailValid(emailData)) {
        //         swal('Oops...', 'The email field must be a valid email address, please re-enter your email addres and try again!', 'error');
        //         // $('#cloudEmpEmailAddress').focus();
        //         e.preventDefault();
        //         return false;
        //     }
        // }
    },
    'blur #cloudEmpUserPassword': function(event) {
        let cloudpassword = $(event.target).val().replace(/;/g, ",");
        if (cloudpassword != '') {
            if (cloudpassword.length < 8) {
                swal('Invalid VS1 Password', 'Password must be at least eight characters including one capital letterand one number!', 'error');
                // $('#cloudEmpUserPassword').focus();
                event.preventDefault();
                return false;
            }
        }
    },
    'blur .divcolumn': function(event) {
        let columData = $(event.target).text();
        let columnDatanIndex = $(event.target).closest("div.columnSettings").attr('id');
        const datable = $('#tblTransactionlist').DataTable();
        const title = datable.column(columnDatanIndex).header();
        $(title).html(columData);
    },
    'change .rngRange': function(event) {
        let range = $(event.target).val();
        // $(event.target).closest("div.divColWidth").find(".spWidth").html(range+'px');
        // let columData = $(event.target).closest("div.divColWidth").find(".spWidth").attr("value");
        let columnDataValue = $(event.target).closest("div").prev().find(".divcolumn").text();
        const datable = $('#tblTransactionlist th');
        $.each(datable, function(i, v) {
            if (v.innerText == columnDataValue) {
                let className = v.className;
                let replaceClass = className.replace(/ /g, ".");
                $("." + replaceClass + "").css('width', range + 'px');
            }
        });
    },
    'click .transTab': function(event) {
        let templateObject = Template.instance();
        let employeeName = $('#edtCustomerCompany').val();
        templateObject.getAllProductRecentTransactions(employeeName);
    },
    'click .btnOpenSettings': function(event) {
        let templateObject = Template.instance();
        var columns = $('#tblTransactionlist th');

        const tableHeaderList = [];
        let sTible = "";
        let sWidth = "";
        let sIndex = "";
        let sVisible = "";
        let columVisible = false;
        let sClass = "";
        $.each(columns, function(i, v) {
            if (v.hidden == false) {
                columVisible = true;
            }
            if ((v.className.includes("hiddenColumn"))) {
                columVisible = false;
            }
            sWidth = v.style.width.replace('px', "");

            let datatablerecordObj = {
                sTitle: v.innerText || '',
                sWidth: sWidth || '',
                sIndex: v.cellIndex || 0,
                sVisible: columVisible || false,
                sClass: v.className || ''
            };
            tableHeaderList.push(datatablerecordObj);
        });

        templateObject.tableheaderrecords.set(tableHeaderList);
    },
    'click #exportbtn': function() {
        LoadingOverlay.show();
        jQuery('#tblTransactionlist_wrapper .dt-buttons .btntabletocsv').click();
        $('.fullScreenSpin').css('display', 'none');
    },
    'click .printConfirm': function(event) {
        playPrintAudio();
        LoadingOverlay.show();
        setTimeout(function() {

            jQuery('#tblTransactionlist_wrapper .dt-buttons .btntabletopdf').click();
            $('.fullScreenSpin').css('display', 'none');
        }, delayTimeAfterSound);
    },
    'click .btnRefresh': function() {
        Meteor._reload.reload();
    },
    'click .btnRemoveProduct': function() {

    },
    'click #formCheck-2': function() {
        if ($(event.target).is(':checked')) {
            $('#autoUpdate').css('display', 'none');
        } else {
            $('#autoUpdate').css('display', 'block');
        }
    },
    'click #formCheck-one': function(event) {
        if ($(event.target).is(':checked')) {
            $('.checkbox1div').css('display', 'block');

        } else {
            $('.checkbox1div').css('display', 'none');
        }
    },
    'click #formCheck-two': function(event) {
        if ($(event.target).is(':checked')) {
            $('.checkbox2div').css('display', 'block');

        } else {
            $('.checkbox2div').css('display', 'none');
        }
    },
    'click #formCheck-three': function(event) {
        if ($(event.target).is(':checked')) {
            $('.checkbox3div').css('display', 'block');

        } else {
            $('.checkbox3div').css('display', 'none');
        }
    },
    'click #formCheck-four': function(event) {
        if ($(event.target).is(':checked')) {
            $('.checkbox4div').css('display', 'block');

        } else {
            $('.checkbox4div').css('display', 'none');
        }
    },
    'blur .edtPriceFormatting': function(event) {
        let utilityService = new UtilityService();
        let sellPrice = $(event.target).val();
        if (!isNaN(sellPrice)) {
            $(event.target).val(utilityService.modifynegativeCurrencyFormat(sellPrice));
        } else {
            sellPrice = Number($(event.target).val().replace(/[^0-9.-]+/g, ""));
            $(event.target).val(utilityService.modifynegativeCurrencyFormat(sellPrice));
        }
    },
    'blur .edtPercentFormatting': function(event) {
        let utilityService = new UtilityService();
        let sellPrice = $(event.target).val();
        if (!isNaN(sellPrice)) {
            sellPrice = Number($(event.target).val().replace(/[^0-9.-]+/g, ""));
            $(event.target).val(`${parseFloat(sellPrice).toFixed(2)}%`);
        } else {
            sellPrice = Number($(event.target).val().replace(/[^0-9.-]+/g, ""));
            $(event.target).val(`${parseFloat(sellPrice).toFixed(2)}%`);
        }
    },
    'blur .customField1Text': function(event) {
        var inputValue1 = $('.customField1Text').text();
        $('.lblCustomField1').text(inputValue1);
    },
    'blur .customField2Text': function(event) {
        var inputValue2 = $('.customField2Text').text();
        $('.lblCustomField2').text(inputValue2);
    },
    'blur .customField3Text': function(event) {
        var inputValue3 = $('.customField3Text').text();
        $('.lblCustomField3').text(inputValue3);
    },
    'blur .customField4Text': function(event) {
        var inputValue4 = $('.customField4Text').text();
        $('.lblCustomField4').text(inputValue4);
    },
    'click .btnSaveSettings': function(event) {
        playSaveAudio();
        let templateObject = Template.instance();
        setTimeout(function() {

            $('.lblCustomField1').html('');
            $('.lblCustomField2').html('');
            $('.lblCustomField3').html('');
            $('.lblCustomField4').html('');
            let getchkcustomField1 = true;
            let getchkcustomField2 = true;
            let getchkcustomField3 = true;
            let getchkcustomField4 = true;
            let getcustomField1 = $('.customField1Text').html();
            let getcustomField2 = $('.customField2Text').html();
            let getcustomField3 = $('.customField3Text').html();
            let getcustomField4 = $('.customField4Text').html();
            if ($('#formCheck-one').is(':checked')) {
                getchkcustomField1 = false;
            }
            if ($('#formCheck-two').is(':checked')) {
                getchkcustomField2 = false;
            }
            if ($('#formCheck-three').is(':checked')) {
                getchkcustomField3 = false;
            }
            if ($('#formCheck-four').is(':checked')) {
                getchkcustomField4 = false;
            }

            $('#customfieldModal').modal('toggle');
        }, delayTimeAfterSound);
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
                    PrefName: 'employeescard'
                });
                if (checkPrefDetails) {
                    CloudPreference.remove({
                        _id: checkPrefDetails._id
                    }, function(err, idTag) {
                        if (err) {} else {
                            Meteor._reload.reload();
                        }
                    });

                }
            }
        }
    },
    'click .new_attachment_btn': function(event) {
        $('#attachment-upload').trigger('click');

    },
    'click #edtPriority': function(event) {
        let templateObject = Template.instance();
        let priorities = templateObject.empPriorities.get().sort((a, b) => a - b);
        let allpriorities = priorities.join(',');
        swal({
            title: 'Enter Sort Order',
            input: 'text',
            inputPlaceholder: 'Please enter sort order',
            text: 'Sort Order in use are: ' + allpriorities
        }).then((result) => {
            if (result.value) {
                $('#edtPriority').focus();
                $('#edtPriority').val(result.value);
            } else if (result.dismiss === 'cancel') {}
        })

        // swal({
        //     title: 'User currently has an Existing Login.',
        //     text: '',
        //     type: 'info',
        //     showCancelButton: false,
        //     confirmButtonText: 'OK'
        // }).then((result) => {
        //     if (result.value) {
        //         $('#cloudEmpEmailAddress').focus();
        //     } else if (result.dismiss === 'cancel') {

        //     }
        // });

    },
    'change #attachment-upload': function(e) {
        let templateObj = Template.instance();
        let saveToTAttachment = false;
        let lineIDForAttachment = false;
        let uploadedFilesArray = templateObj.uploadedFiles.get();

        let myFiles = $('#attachment-upload')[0].files;
        let uploadData = utilityService.attachmentUploadTabs(uploadedFilesArray, myFiles, saveToTAttachment, lineIDForAttachment);
        templateObj.uploadedFiles.set(uploadData.uploadedFilesArray);
        templateObj.attachmentCount.set(uploadData.totalAttachments);
    },
    'click .img_new_attachment_btn': function(event) {
        $('#img-attachment-upload').trigger('click');

    },
    'change #img-attachment-upload': function(e) {
        let templateObj = Template.instance();
        let saveToTAttachment = false;
        let lineIDForAttachment = false;
        let uploadedFilesArray = templateObj.uploadedFiles.get();

        let myFiles = $('#img-attachment-upload')[0].files;
        let uploadData = utilityService.attachmentUpload(uploadedFilesArray, myFiles, saveToTAttachment, lineIDForAttachment);
        templateObj.uploadedFiles.set(uploadData.uploadedFilesArray);
        templateObj.attachmentCount.set(uploadData.totalAttachments);
    },
    'click .remove-attachment': function(event, ui) {
        let tempObj = Template.instance();
        let attachmentID = parseInt(event.target.id.split('remove-attachment-')[1]);
        if (tempObj.$("#confirm-action-" + attachmentID).length) {
            tempObj.$("#confirm-action-" + attachmentID).remove();
        } else {
            let actionElement = '<div class="confirm-action" id="confirm-action-' + attachmentID + '"><a class="confirm-delete-attachment btn btn-default" id="delete-attachment-' + attachmentID + '">' +
                'Delete</a><button class="save-to-library btn btn-default">Remove & save to File Library</button></div>';
            tempObj.$('#attachment-name-' + attachmentID).append(actionElement);
        }
        tempObj.$("#new-attachment2-tooltip").show();

    },
    'click .file-name': function(event) {
        let attachmentID = parseInt(event.currentTarget.parentNode.id.split('attachment-name-')[1]);
        let templateObj = Template.instance();
        let uploadedFiles = templateObj.uploadedFiles.get();

        $('#myModalAttachment').modal('hide');
        let previewFile = {};
        let input = uploadedFiles[attachmentID].fields.Description;
        previewFile.link = 'data:' + input + ';base64,' + uploadedFiles[attachmentID].fields.Attachment;
        previewFile.name = uploadedFiles[attachmentID].fields.AttachmentName;
        let type = uploadedFiles[attachmentID].fields.Description;
        if (type === 'application/pdf') {
            previewFile.class = 'pdf-class';
        } else if (type === 'application/msword' || type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            previewFile.class = 'docx-class';
        } else if (type === 'application/vnd.ms-excel' || type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            previewFile.class = 'excel-class';
        } else if (type === 'application/vnd.ms-powerpoint' || type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
            previewFile.class = 'ppt-class';
        } else if (type === 'application/vnd.oasis.opendocument.formula' || type === 'text/csv' || type === 'text/plain' || type === 'text/rtf') {
            previewFile.class = 'txt-class';
        } else if (type === 'application/zip' || type === 'application/rar' || type === 'application/x-zip-compressed' || type === 'application/x-zip,application/x-7z-compressed') {
            previewFile.class = 'zip-class';
        } else {
            previewFile.class = 'default-class';
        }

        previewFile.image = type.split('/')[0] === 'image';
        templateObj.uploadedFile.set(previewFile);

        $('#files_view').modal('show');

    },
    'click .confirm-delete-attachment': function(event, ui) {
        let tempObj = Template.instance();
        tempObj.$("#new-attachment2-tooltip").show();
        let attachmentID = parseInt(event.target.id.split('delete-attachment-')[1]);
        let uploadedArray = tempObj.uploadedFiles.get();
        let attachmentCount = tempObj.attachmentCount.get();
        $('#attachment-upload').val('');
        uploadedArray.splice(attachmentID, 1);
        tempObj.uploadedFiles.set(uploadedArray);
        attachmentCount--;
        if (attachmentCount === 0) {
            let elementToAdd = '<div class="col inboxcol1"><img src="/icons/nofiles_icon.jpg" class=""></div> <div class="col inboxcol2"> <div>Upload  files or add files from the file library</div> <p style="color: #ababab;">Only users with access to your company can view these files</p></div>';
            $('#file-display').html(elementToAdd);
        }
        tempObj.attachmentCount.set(attachmentCount);
        if (uploadedArray.length > 0) {
            let utilityService = new UtilityService();
            utilityService.showUploadedAttachmentTabs(uploadedArray);
        } else {
            $(".attchment-tooltip").show();
        }
    },
    'click .attachmentTab': function() {
        let templateInstance = Template.instance();
        let uploadedFileArray = templateInstance.uploadedFiles.get();
        if (uploadedFileArray.length > 0) {
            let utilityService = new UtilityService();
            utilityService.showUploadedAttachmentTabs(uploadedFileArray);
        } else {
            $(".attchment-tooltip").show();
        }
    },
    'click .btnUploadFilePicture': function(event) {
        $('#fileInput').trigger('click');
    },
    'change #fileInput': function(event) {
        let templateObject = Template.instance();
        let selectedFile = event.target.files[0];
        let reader = new FileReader();
        $(".Choose_file").text('');
        reader.onload = function(event) {

            $("#uploadImg").prop("disabled", false);
            $("#uploadImg").addClass("on-upload-logo");
            $(".Choose_file").text(selectedFile.name);
            templateObject.imageFileData.set(event.target.result);
        };
        reader.readAsDataURL(selectedFile);
    },
    'click #uploadImg': function(event) {
        //let imageData= (localStorage.getItem("Image"));
        let templateObject = Template.instance();
        let imageData = templateObject.imageFileData.get();
        if (imageData != null && imageData != "") {
            //localStorage.setItem("Image",imageData);
            $('#uploadedImage').attr('src', imageData);
            $('#uploadedImage').attr('width', '50%');
            $('#removeLogo').show();
            $('#changeLogo').show();
        }

    },
    'click #removeLogo': function(event) {
        let templateObject = Template.instance();
        templateObject.imageFileData.set(null);
        let imageData = templateObject.imageFileData.get();
        $('#uploadedImage').attr('src', imageData);
        $('#uploadedImage').attr('width', '50%');
    },
    'click .btnNewEmployee': function(event) {
        // FlowRouter.go('/employeescard');
        window.open('/employeescard', '_self');
    },
    'click .btnView': function(e) {
        var btnView = document.getElementById("btnView");
        var btnHide = document.getElementById("btnHide");

        var displayList = document.getElementById("displayList");
        var displayInfo = document.getElementById("displayInfo");
        if (displayList.style.display === "none") {
            displayList.style.display = "flex";
            $("#displayInfo").removeClass("col-12");
            $("#displayInfo").addClass("col-9");
            btnView.style.display = "none";
            btnHide.style.display = "flex";
        } else {
            displayList.style.display = "none";
            $("#displayInfo").removeClass("col-9");
            $("#displayInfo").addClass("col-12");
            btnView.style.display = "flex";
            btnHide.style.display = "none";
        }
    },
    'click .btnDeleteEmployee': (e, ui) => {
        let templateObject = Template.instance();
        templateObject.deactivateEmployee();

        // LoadingOverlay.show();
        // let templateObject = Template.instance();
        // let contactService2 = new ContactService();

        // const url = FlowRouter.current().path;
        // const getso_id = url.split('?id=');

        // let currentId = FlowRouter.current().queryParams;
        // let objDetails = '';

        // if (!isNaN(currentId.id)) {
        //     const currentEmployee = parseInt(currentId.id);
        //     objDetails = {
        //         type: "TEmployeeEx",
        //         fields: {
        //             ID: currentEmployee,
        //             Active: false
        //         }
        //     };
        //     contactService2.saveEmployeeEx(objDetails).then(function (objDetails) {
        //         FlowRouter.go('/employeelist?success=true');
        //     }).catch(function (err) {
        //         swal({
        //             title: 'Oooops...',
        //             text: err,
        //             type: 'error',
        //             showCancelButton: false,
        //             confirmButtonText: 'Try Again'
        //         }).then((result) => {
        //             if (result.value) {if(err === checkResponseError){window.open('/', '_self');}}
        //             else if (result.dismiss === 'cancel') {}
        //         });
        //         $('.fullScreenSpin').css('display', 'none');
        //     });
        // } else {
        //     FlowRouter.go('/employeelist?success=true');
        // }
        // $('#deleteEmployeeModal').modal('toggle');
    },
    'click .scanProdServiceBarcodePOP': function(event) {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {

        } else {
            Bert.alert('<strong>Please Note:</strong> This function is only available on mobile devices!', 'now-dangerorange');
        }
    },
    // 'change #leaveCalcMethodSelect': function(e){
    //     let leaveCalcMethod = $(e.target).val();
    //     switch(leaveCalcMethod){
    //         case 'Manually Recorded Rate':
    //             $('#hoursLeave').val('');
    //             $('.handleLeaveTypeOption').addClass('hideelement')
    //             $('.manuallyRecordedRate').removeClass('hideelement')
    //         break;
    //         case 'No Calculation Required':
    //             $('.handleLeaveTypeOption').addClass('hideelement')
    //         break;
    //         case 'Based on Ordinary Earnings':
    //             $('#hoursAccruedAnnuallyFullTimeEmp').val('');
    //             $('#hoursFullTimeEmpFortnightlyPay').val('');
    //             $('.handleLeaveTypeOption').addClass('hideelement')
    //             $('.basedonOrdinaryEarnings').removeClass('hideelement')
    //         break;
    //         default:
    //             $('#hoursAccruedAnnually').val('');
    //             $('.handleLeaveTypeOption').addClass('hideelement')
    //             $('.fixedAmountEachPeriodOption').removeClass('hideelement')
    //         break;
    //     }
    // },

    // 'change #onTerminationUnusedBalance': function(e){
    //     let onTerminationUnusedBalance = $('#onTerminationUnusedBalance').val();
    //     if( onTerminationUnusedBalance == '1' || onTerminationUnusedBalance == 'Paid Out'){
    //         $('.eftLeaveTypeCont').removeClass('hideelement')
    //         $("#eftLeaveType").attr('checked', false)
    //     }else{
    //         $('.eftLeaveTypeCont').addClass('hideelement')
    //         $('.superannuationGuaranteeCont').addClass('hideelement')
    //     }
    // },
    'click #eftLeaveType': function() {
        if ($('#eftLeaveType').is(':checked')) {
            $('.superannuationGuaranteeCont').removeClass('hideelement')
            $("#superannuationGuarantee").attr('checked', false)
        } else {
            $('.superannuationGuaranteeCont').addClass('hideelement')
        }
    },
    // add to custom field
    "click #edtSaleCustField1": function(e) {
        $("#clickedControl").val("one");
    },
    // add to custom field
    "click #edtSaleCustField2": function(e) {
        $("#clickedControl").val("two");
    },
    // add to custom field
    "click #edtSaleCustField3": function(e) {
        $("#clickedControl").val("three");
    },
    "click .btnDeletePayslip": function(e) {
        playDeleteAudio();
        let templateObject = Template.instance();
        let deleteID = $(e.target).data('id') || '';
        swal({
            title: 'Delete Pay Slip',
            text: "Are you sure you want to Delete this pay slip?",
            type: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes'
        }).then(async(result) => {
            if (result.value) {
                $('.fullScreenSpin').css('display', 'block');
                const employeePayrolApis = new EmployeePayrollApi();
                // now we have to make the post request to save the data in database
                const apiEndpoint = employeePayrolApis.collection.findByName(
                    employeePayrolApis.collectionNames.TPaySlips
                );

                let paySlipSettings = new PaySlips({
                    type: "TPaySlips",
                    fields: new PaySlipsFields({
                        ID: parseInt(deleteID),
                        Active: false
                    }),
                })

                try {
                    const ApiResponse = await apiEndpoint.fetch(null, {
                        method: "POST",
                        headers: ApiService.getPostHeaders(),
                        body: JSON.stringify(paySlipSettings),
                    });
                    if (ApiResponse.ok == true) {
                        let dataObject = await getVS1Data('TPaySlips');
                        if (dataObject.length > 0) {
                            data = JSON.parse(dataObject[0].data);
                            let updatedLines = data.tpayslips.map((item) => {
                                if (parseInt(item.fields.ID) == parseInt(deleteID)) {
                                    item.fields.Active = false;
                                }
                                return item;
                            });
                            let paySlipObj = {
                                tpayslips: updatedLines
                            }
                            await addVS1Data('TPaySlips', JSON.stringify(paySlipObj));
                        }
                        templateObject.getPaySlips();
                        $('.fullScreenSpin').css('display', 'none');
                        swal({
                            title: 'Pay Slip deleted successfully',
                            text: '',
                            type: 'success',
                            showCancelButton: false,
                            confirmButtonText: 'OK'
                        }).then((result) => {
                            if (result.value) {
                                if (result.value) {}
                            }
                        });
                    } else {
                        $('.fullScreenSpin').css('display', 'none');
                        swal({
                            title: 'Oooops...',
                            text: error,
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {}
                        });
                    }
                } catch (error) {
                    $('.fullScreenSpin').css('display', 'none');
                    swal({
                        title: 'Oooops...',
                        text: ApiResponse.headers.get('errormessage'),
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {}
                    });
                }
            }
        });
    },
    "click .btnDeleteAssignLeaveType": function(e) {
        playDeleteAudio();
        let templateObject = Template.instance();
        setTimeout(function() {

            let deleteID = $(e.target).data('id') || '';
            swal({
                title: 'Delete Assign Leave Type',
                text: "Are you sure you want to Delete this assign leave type?",
                type: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes'
            }).then(async(result) => {
                if (result.value) {
                    $('.fullScreenSpin').css('display', 'block');

                    const employeePayrolApis = new EmployeePayrollApi();
                    // now we have to make the post request to save the data in database
                    const apiEndpoint = employeePayrolApis.collection.findByName(
                        employeePayrolApis.collectionNames.TAssignLeaveType
                    );

                    let assignLeaveSettings = new AssignLeaveType({
                        type: "TAssignLeaveType",
                        fields: new AssignLeaveTypeFields({
                            ID: parseInt(deleteID),
                            Active: false
                        }),
                    })

                    try {
                        const ApiResponse = await apiEndpoint.fetch(null, {
                            method: "POST",
                            headers: ApiService.getPostHeaders(),
                            body: JSON.stringify(assignLeaveSettings),
                        });

                        let dataObject = await getVS1Data('TAssignLeaveType')

                        if (dataObject.length > 0) {
                            data = JSON.parse(dataObject[0].data);
                            if (data.tassignleavetype.length > 0) {
                                let updatedLines = data.tassignleavetype.map((item) => {
                                    if (parseInt(item.fields.ID) == parseInt(deleteID)) {
                                        item.fields.Active = false;
                                    }
                                    return item;
                                });
                                let leaveTypeObj = {
                                    tassignleavetype: updatedLines
                                }
                                await addVS1Data('TAssignLeaveType', JSON.stringify(leaveTypeObj))
                                await templateObject.getAssignLeaveTypes();
                            }
                            $('.fullScreenSpin').css('display', 'none');
                            swal({
                                title: 'Assign Leave deleted successfully',
                                text: '',
                                type: 'success',
                                showCancelButton: false,
                                confirmButtonText: 'OK'
                            }).then((result) => {
                                if (result.value) {
                                    if (result.value) {}
                                }
                            });
                        } else {
                            $('.fullScreenSpin').css('display', 'none');
                            swal({
                                title: 'Oooops...',
                                text: error,
                                type: 'error',
                                showCancelButton: false,
                                confirmButtonText: 'Try Again'
                            }).then((result) => {
                                if (result.value) {}
                            });
                        }
                    } catch (error) {
                        $('.fullScreenSpin').css('display', 'none');
                        swal({
                            title: 'Oooops...',
                            text: ApiResponse.headers.get('errormessage'),
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {}
                        });
                    }
                }
            });
        }, delayTimeAfterSound);
    },
    "click .removeLeaveRequest": function(e) {
        let templateObject = Template.instance();
        const deleteID = $(e.target).data('id') || '';
        swal({
            title: 'Delete Leave Request',
            text: "Are you sure you want to Delete this Leave Request?",
            type: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes'
        }).then(async(result) => {
            if (result.value) {
                $('.fullScreenSpin').css('display', 'block');
                const employeePayrolApis = new EmployeePayrollApi();
                const apiEndpoint = employeePayrolApis.collection.findByName(
                    employeePayrolApis.collectionNames.TLeavRequest
                );

                try {
                    let leaveSetting = new LeaveRequest({
                        type: "TLeavRequest",
                        fields: new LeaveRequestFields({
                            ID: parseInt(deleteID),
                            Status: 'Deleted'
                        }),
                    })

                    const ApiResponse = await apiEndpoint.fetch(null, {
                        method: "POST",
                        headers: ApiService.getPostHeaders(),
                        body: JSON.stringify(leaveSetting),
                    });
                    if (ApiResponse.ok == true) {
                        let dataObject = await getVS1Data('TLeavRequest');
                        if (dataObject.length > 0) {
                            data = JSON.parse(dataObject[0].data);
                            if (data.tleavrequest.length > 0) {
                                let updatedLeaveRequest = data.tleavrequest.map((item) => {
                                    if (deleteID == item.fields.ID) {
                                        item.fields.Status = 'Deleted';
                                    }
                                    return item;
                                });
                                let leaveRequestObj = {
                                    tleavrequest: updatedLeaveRequest
                                }
                                await addVS1Data('TLeavRequest', JSON.stringify(leaveRequestObj))
                            }
                        }
                        await templateObject.getLeaveRequests();
                        $('.fullScreenSpin').css('display', 'none');
                        swal({
                            title: 'Leave request deleted successfully',
                            text: '',
                            type: 'success',
                            showCancelButton: false,
                            confirmButtonText: 'OK'
                        });
                    } else {
                        $('.fullScreenSpin').css('display', 'none');
                        swal({
                            title: 'Oooops...',
                            text: error,
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {}
                        });
                    }
                } catch (error) {
                    $('.fullScreenSpin').css('display', 'none');
                    swal({
                        title: 'Oooops...',
                        text: error,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {}
                    });
                }
            }
        });
    },
    "click .btnDeletePayNote": function(e) {
        playDeleteAudio();
        let templateObject = Template.instance();
        setTimeout(function() {

            let deleteID = $(e.target).data('id') || '';
            swal({
                title: 'Delete Note',
                text: "Are you sure you want to delete this note?",
                type: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes'
            }).then(async(result) => {
                if (result.value) {
                    $('.fullScreenSpin').css('display', 'block');
                    const employeePayrolApis = new EmployeePayrollApi();
                    // now we have to make the post request to save the data in database
                    const apiEndpoint = employeePayrolApis.collection.findByName(
                        employeePayrolApis.collectionNames.TPayNotes
                    );

                    let noteSettings = new PayNotes({
                        type: "TPayNotes",
                        fields: new PayNotesFields({
                            ID: parseInt(deleteID),
                            Active: false
                        }),
                    })

                    try {
                        const ApiResponse = await apiEndpoint.fetch(null, {
                            method: "POST",
                            headers: ApiService.getPostHeaders(),
                            body: JSON.stringify(noteSettings),
                        });
                        if (ApiResponse.ok == true) {
                            let dataObject = await getVS1Data('TPayNotes');
                            if (dataObject.length > 0) {
                                data = JSON.parse(dataObject[0].data);
                                if (data.tpaynotes.length > 0) {
                                    let updatedNotes = data.tpaynotes.map((item) => {
                                        if (deleteID == item.fields.ID) {
                                            item.fields.Active = false;
                                        }
                                        return item;
                                    });
                                    let notesObj = {
                                        tpaynotes: updatedNotes
                                    }
                                    await addVS1Data('TPayNotes', JSON.stringify(notesObj))
                                }
                            }
                            await templateObject.getPayNotesTypes();
                            $('.fullScreenSpin').css('display', 'none');
                            swal({
                                title: 'Note deleted successfully',
                                text: '',
                                type: 'success',
                                showCancelButton: false,
                                confirmButtonText: 'OK'
                            }).then((result) => {
                                if (result.value) {
                                    if (result.value) {}
                                }
                            });
                        } else {
                            $('.fullScreenSpin').css('display', 'none');
                            swal({
                                title: 'Oooops...',
                                text: error,
                                type: 'error',
                                showCancelButton: false,
                                confirmButtonText: 'Try Again'
                            }).then((result) => {
                                if (result.value) {}
                            });
                        }
                    } catch (error) {
                        $('.fullScreenSpin').css('display', 'none');
                        swal({
                            title: 'Oooops...',
                            text: error,
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {}
                        });
                    }
                }
            });
        }, delayTimeAfterSound);
    },
    "click #btnEditAssignLeaveType": function(e) {
        setTimeout(() => {
            $("#edtLeaveTypeofRequest").trigger("click.editable-select");
        }, 200);
    },
    "click .colLeaveRequest": async function(e) {
        $('.fullScreenSpin').css('display', 'block');
        let ID = $(e.target).parent().find('.colLRID').text();
        $('#newLeaveRequestLabel').text('Edit Leave Request');
        let dataObject = await getVS1Data('TLeavRequest');

        if (dataObject.length > 0) {
            data = JSON.parse(dataObject[0].data);
            if (data.tleavrequest.length > 0) {
                let useData = data.tleavrequest.filter((item) => {
                    if (ID == item.fields.ID) {
                        return item;
                    }
                });
                if (useData.length > 0) {
                    $('#removeLeaveRequestBtn').show();
                    $('#edtLeaveRequestID').val(useData[0].fields.ID);
                    $('#removeLeaveRequestBtn').data('id', useData[0].fields.ID);
                    $('#edtLeaveTypeofRequestID').val(useData[0].fields.TypeOfRequest);
                    $('#edtLeaveTypeofRequest').val(useData[0].fields.LeaveMethod);
                    $('#edtLeaveDescription').val(useData[0].fields.Description);
                    $('#edtLeaveStartDate').val(moment(useData[0].fields.StartDate).format('DD/MM/YYYY'));
                    $('#edtLeaveEndDate').val(moment(useData[0].fields.EndDate).format('DD/MM/YYYY'));
                    $('#edtLeavePayPeriod').val(useData[0].fields.PayPeriod);   
                    $('#edtLeaveHours').val(useData[0].fields.Hours);
                    $('#edtLeavePayStatus').val(useData[0].fields.Status); 
                }
            }
        } 

        $('#newLeaveRequestModal').modal('show');
        $('.fullScreenSpin').css('display', 'none');
    },
    "click .addNewSlip": function() {
        $('#btnDeletePayslipBtn').hide();
        $('#newPaySlipLabel').text('New payslip');
        $('#paySlipForm')[0].reset();
        $('#periodID').val(0);
        $('#paymentDate').val(moment().format('DD/MM/YYYY'));
    },
    "click .colPaySlip": async function(e) {
        $('.fullScreenSpin').css('display', 'block');
        let ID = $(e.target).parent().find('.colPayslipID').text();
        $('#newPaySlipLabel').text('Edit Pay Slip');
        let dataObject = await getVS1Data('TPaySlips');
        if (dataObject.length > 0) {
            let data = JSON.parse(dataObject[0].data);
            if (data.tpayslips.length > 0) {
                let useData = data.tpayslips.filter((item) => {
                    if (ID == item.fields.ID) {
                        return item;
                    }
                });
                if (useData.length > 0) {
                    $('#periodID').val(useData[0].fields.ID);
                    $('#period').val(useData[0].fields.Period);
                    $('#paymentDate').val(moment(useData[0].fields.PaymentDate).format('DD/MM/YYYY'));
                    let payPrice = useData[0].fields.TotalPay
                    if (!isNaN(payPrice)) {
                        $('#totalPay').val(utilityService.modifynegativeCurrencyFormat(payPrice));
                    } else {
                        payPrice = Number(payPrice.replace(/[^0-9.-]+/g, ""));
                        $('#totalPay').val(utilityService.modifynegativeCurrencyFormat(payPrice));
                    }
                    $('#btnDeletePayslipBtn').show();
                    $('#btnDeletePayslipBtn').data('id', useData[0].fields.ID);
                }
            }
        }
        $('#paySlipModal').modal('show');
        $('.fullScreenSpin').css('display', 'none');
    },
    "blur #edtSalesQuota": function() {
        let utilityService = new UtilityService();
        let amount = $('#edtSalesQuota').val();
        if (isNaN(amount)) {
            amount = (amount === undefined || amount === null || amount.length === 0) ? 0 : amount;
            amount = (amount) ? Number(amount.replace(/[^0-9.-]+/g, "")) : 0;
        }
        amount = utilityService.modifynegativeCurrencyFormat(amount) || 0.00;
        $('#edtSalesQuota').val(amount);
    },

    "click input#edtPayPeriod": (e, ui) => {
        $('#SelectPayRunModal').modal("show");
    },
    "click .earningLineDropDown": (e, ui) => {
        $(e.currentTarget).addClass('paste-earnings');
        $('#earningRateSettingsModal').modal('show');
    },

    "click #expenseAccount": (e, ui) => {
        $(e.currentTarget).addClass('paste-expenses');
    },
    "click #tblAccount tbody tr": (e, ui) => {
        const id = $(e.currentTarget).find('.colAccountID').text();
        const accountName = $(e.currentTarget).find('.productName').text();
        $(".paste-expenses").val(accountName);
        $(".paste-expenses").attr('account-id', id);
        $(".paste-expenses").removeClass('paste-expenses')
    },

    "click #tblEarnings tbody tr": (e, ui) => {
        const tr = $(e.currentTarget);
        const id = parseInt(tr.find('.colEarningsID').text());
        const earningName = tr.find('.colEarningsNames').text();

        let earningsName = tr.find(".colEarningsNames").text() || '';
        let earningsID = tr.find(".colEarningsID").text() || '';
        let account = tr.find(".colEarningsAccounts").text() || '';
        let searchFilterID = ui.currentDrpDownID.get();
        $('#' + searchFilterID).val(earningsName);
        $('#' + searchFilterID + 'ID').val(earningsID);
        if (searchFilterID == 'earningRateSelect') {
            $('#expenseAccount').val(account)
        }
        $('#earningRateSettingsModal').modal('toggle');
    },


});

Template.employeescard.helpers({
    AppTableModalData: () => {
        return Template.instance().AppTableModalData.get();
    },
    isCloudTrueERP: function() {
        let checkCloudTrueERP = Session.get('CloudTrueERPModule') || false;
        return checkCloudTrueERP;
    },
    checkForAllowance: function(EarningRate) {
        if (EarningRate == "Allowances exempt from tax withholding and super" || EarningRate == "Allowances subject to tax withholding and super") {
            return true
        }
        return false
    },
    isCloudUserPass: () => {
        return Template.instance().isCloudUserPass.get();
    },
    record: () => {
        let temp = Template.instance().records.get();
        let phoneCodes = Template.instance().phoneCodeData.get();
        if (temp && temp.mobile && temp.country) {
            let thisCountry = phoneCodes.find(item => {
                return item.name == temp.country
            })
            temp.mobile = temp.mobile.replace(thisCountry.dial_code, '0')
        }
        return temp;
    },
    employeePayInfo: () => {
        return Template.instance().employeePayInfos.get();
    },
    employeePaySetting: () => {
        return Template.instance().employeePaySettings.get();
    },
    leaveTypeInfo: () => {
        return Template.instance().leaveTypesDrpDown.get();
    },
    assignLeaveTypeInfo: () => {
        return Template.instance().assignLeaveTypeInfos.get();
    },
    payNotesInfo: () => {
        return Template.instance().payNotesInfos.get();
    },
    leaveRequestInfo: () => {
        return Template.instance().leaveRequestInfos.get();
    },
    bankAccountList: () => {
        return Template.instance().bankAccList.get();
    },
    payTemplateEarningLines: () => {
        const templateObject = Template.instance();
        let ptEarningLines = templateObject.filterPayTemplates("earningLines");
        return ptEarningLines;
    },
    payTemplateDeductionLines: () => {
        const templateObject = Template.instance();
        let ptEarningLines = templateObject.filterPayTemplates("deductionLines");
        return ptEarningLines;
    },
    payTemplateSuperannuationLines: () => {
        const templateObject = Template.instance();
        let ptEarningLines = templateObject.filterPayTemplates("superannuationLines");
        return ptEarningLines;
    },
    payTemplateReiumbursementLines: () => {
        const templateObject = Template.instance();
        let ptEarningLines = templateObject.filterPayTemplates("reiumbursementLines");
        return ptEarningLines;
    },
    obEarningLines: () => {
        const templateObject = Template.instance();
        return templateObject.filterOpeningBalance(0);
    },
    obDeductionLines: () => {
        const templateObject = Template.instance();
        return templateObject.filterOpeningBalance(1);
    },
    obSuperannuationLines: () => {
        const templateObject = Template.instance();
        return templateObject.filterOpeningBalance(2);
    },
    obReimbursementLines: () => {
        const templateObject = Template.instance();
        return templateObject.filterOpeningBalance(3);
    },
    calculateOpeningBalanceTotal(items) {
        let totalAmount = 0;
        for (const item of items) {
            totalAmount += item.fields.Amount
        }
        let utilityService = new UtilityService();
        return utilityService.modifynegativeCurrencyFormat(totalAmount) || 0.00;
    },
    // formatPrice( amount ){
    //     let utilityService = new UtilityService();
    //     if( isNaN(amount) || !amount){
    //         amount = ( amount === undefined || amount === null || amount.length === 0 ) ? 0 : amount;
    //         amount = ( amount )? Number(amount.replace(/[^0-9.-]+/g,"")): 0;
    //     }
    //     return utilityService.modifynegativeCurrencyFormat(amount)|| 0.00;
    // },
    formatPercent(percentVal) {
        if (isNaN(percentVal)) {
            percentVal = (percentVal === undefined || percentVal === null || percentVal.length === 0) ? 0 : percentVal;
            percentVal = (percentVal) ? Number(percentVal.replace(/[^0-9.-]+/g, "")) : 0;
        }
        return `${parseFloat(percentVal).toFixed(2)}%`;
    },
    formatDate: (date) => {
        return moment(date).format("DD/MM/YYYY");
    },
    extraUserPrice: () => {
        return addExtraUserPrice || '$35';
    },
    countryList: () => {
        return Template.instance().countryData.get();
    },
    phoneCodeList: () => {
        return Template.instance().phoneCodeData.get();
    },
    employeerecords: () => {
        return Template.instance().employeerecords.get().sort(function(a, b) {
            if (a.company == 'NA') {
                return 1;
            } else if (b.company == 'NA') {
                return -1;
            }
            return (a.company.toUpperCase() > b.company.toUpperCase()) ? 1 : -1;
        });
    },
    productsdatatable: () => {
        return Template.instance().productsdatatable.get().sort(function(a, b) {
            if (a.productname == 'NA') {
                return 1;
            } else if (b.productname == 'NA') {
                return -1;
            }
            return (a.productname.toUpperCase() > b.productname.toUpperCase()) ? 1 : -1;
        });
    },
    selectedproducts: () => {
        return Template.instance().selectedproducts.get();
        return Template.instance().selectedproducts.get().sort(function(a, b) {
            if (a.productname == 'NA') {
                return 1;
            } else if (b.productname == 'NA') {
                return -1;
            }
            return (a.productname.toUpperCase() > b.productname.toUpperCase()) ? 1 : -1;
        });
    },
    notesrecords: () => {
        return Template.instance().notesrecords.get();
    },

    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    salesCloudPreferenceRec: () => {
        return CloudPreference.findOne({
            userid: Session.get('mycloudLogonID'),
            PrefName: 'tblSalesOverview'
        });
    },
    currentdate: () => {
        var currentDate = new Date();
        var begunDate = moment(currentDate).format("DD/MM/YYYY");
        return begunDate;
    },
    empuserrecord: () => {
        return Template.instance().empuserrecord.get();
    },
    cloudUserDetails: function() {
        if ((Session.get('cloudCurrentLogonName')) && (Session.get('cloudCurrentLogonName') != '')) {
            let userID = '';
            var usertoLoad = CloudUser.find({
                clouddatabaseID: Session.get('mycloudLogonDBID')
            }).forEach(function(doc) {
                if ((doc.cloudUsername == Session.get('cloudCurrentLogonName')) || (doc.cloudUsername == Session.get('cloudCurrentLogonName').toLowerCase())) {
                    userID = doc._id;
                }
            });
            return CloudUser.find({
                _id: userID
            }).fetch();
        }
    },
    preferedPaymentList: () => {
        return Template.instance().preferedPaymentList.get();
    },
    termsList: () => {
        return Template.instance().termsList.get();
    },
    deliveryMethodList: () => {
        return Template.instance().deliveryMethodList.get();
    },
    dashboardOptionsList: () => {
        return ['All', 'Accounts', 'Executive', 'Marketing', 'Sales', 'Sales Manager'];
    },
    taxCodeList: () => {
        return Template.instance().taxCodeList.get();
    },
    uploadedFiles: () => {
        return Template.instance().uploadedFiles.get();
    },
    attachmentCount: () => {
        return Template.instance().attachmentCount.get();
    },
    uploadedFile: () => {
        return Template.instance().uploadedFile.get();
    },
    contactCloudPreferenceRec: () => {
        return CloudPreference.findOne({
            userid: Session.get('mycloudLogonID'),
            PrefName: 'employeescard'
        });
    },
    isUserAddition: () => {
        return Template.instance().isUserAddition.get();
    },
    isMobileDevices: () => {
        var isMobile = false; //initiate as false
        // device detection
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) ||
            /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
            isMobile = true;
        }

        return isMobile;
    },
    includePayroll: () => {
        let isPayroll = Session.get('CloudPayrollModule') || false;
        return isPayroll;
    },
    earningLines: () => {
        return Template.instance().earningLines.get();
    },
    formatPrice: (price) => GlobalFunctions.formatPrice(price),
});