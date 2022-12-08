import {ReactiveVar} from 'meteor/reactive-var';
import {SideBarService} from '../../js/sidebar-service';
import { UtilityService } from "../../utility-service";
import Earning from '../../js/Api/Model/Earning'
import EarningFields from '../../js/Api/Model/EarningFields'
import EmployeePayrollApi from '../../js/Api/EmployeePayrollApi'
import ApiService from "../../js/Api/Module/ApiService";
import { EmployeePayrollService } from '../../js/employeepayroll-service';
import { ProductService } from "../../product/product-service";
import '../../lib/global/indexdbstorage.js';
import 'jquery-editable-select';
import LoadingOverlay from '../../LoadingOverlay';
import CachedHttp from '../../lib/global/CachedHttp';
import erpObject from '../../lib/global/erp-objects';
import TableHandler from '../../js/Table/TableHandler';

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
let productService = new ProductService();
const taxCodesList = [];
const splashArrayTaxRateList = [];
let employeePayrollService = new EmployeePayrollService();

Template.earningRateSettings.onCreated(function() {
  const templateObject = Template.instance();
  templateObject.datatablerecords = new ReactiveVar([]);
  templateObject.datatableallowancerecords = new ReactiveVar([]);
  templateObject.tableheaderrecords = new ReactiveVar([]);
  templateObject.countryData = new ReactiveVar();
  templateObject.Ratetypes = new ReactiveVar([]);
  templateObject.imageFileData=new ReactiveVar();
  templateObject.currentDrpDownID = new ReactiveVar();
  templateObject.taxraterecords = new ReactiveVar([]);
  // templateObject.Accounts = new ReactiveVar([]);

  templateObject.earningRates = new ReactiveVar([]);
  templateObject.earningTypes = new ReactiveVar([]);
  templateObject.earnings = new ReactiveVar([]);
});

Template.earningRateSettings.onRendered(function() {
    $('#edtEarningsType').editableSelect('add', function(item){
        $(this).val(item.id);
        $(this).text(item.name);
    });
  const templateObject = Template.instance();
  const dataTableList = [];
  var splashArrayEarningList = new Array();

    function MakeNegative() {
        $('td').each(function() {
            if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
        });
        $(function() {
            $('.modal-dialog').draggable({
                "handle":".modal-header, .modal-footer"
            });
        });
    };

    templateObject.saveDataLocalDB = async () => {

        const employeePayrolApis = new EmployeePayrollApi();
        // now we have to make the post request to save the data in database
        const employeePayrolEndpoint = employeePayrolApis.collection.findByName(
            employeePayrolApis.collectionNames.TEarnings
        );

        employeePayrolEndpoint.url.searchParams.append(
            "ListType",
            "'Detail'"
        );

        const employeePayrolEndpointResponse = await employeePayrolEndpoint.fetch(); // here i should get from database all charts to be displayed

        if (employeePayrolEndpointResponse.ok == true) {
            employeePayrolEndpointJsonResponse = await employeePayrolEndpointResponse.json();
            if( employeePayrolEndpointJsonResponse.tearnings.length ){
                await addVS1Data('TEarnings', JSON.stringify(employeePayrolEndpointJsonResponse))
            }
            return employeePayrolEndpointJsonResponse
        }
        return '';
    }

    /**
     * This will load earning types
     * Hardcoded for now
     */
    templateObject.getEarningTypes = async (refresh = false) => {

        const earningTypes = [
            "Ordinary Time Earnings",
            "Overtime Earnings",
            "Employment Termnination Payments",
            "Lump Sum E",
            "Bonuses & Commissions",
            "Lump Sum W",
            "Directors Fees"
        ].map(t => {
            return {
                value: t,
                text: t
            }
        });

        await templateObject.earningTypes.set(earningTypes);

    }


    templateObject.loadEarnings = async (refresh = false) => {
        let data = await CachedHttp.get(erpObject.TEarnings, async () => {
            const employeePayrolApis = new EmployeePayrollApi();
            // now we have to make the post request to save the data in database
            const employeePayrolEndpoint = employeePayrolApis.collection.findByName(
                employeePayrolApis.collectionNames.TEarnings
            );

            employeePayrolEndpoint.url.searchParams.append(
                "ListType",
                "'Detail'"
            );

            const response = await employeePayrolEndpoint.fetch(); // here i should get from database all charts to be displayed
            if (response.ok == true) {
                let earnings = await response.json();
                if( earnings.tearnings.length ){
                    return earnings.tearnings;
                }
                return null;
            }

            return null;
        }, {
            refresh: refresh,
            validate: (cachedResponse) => {
                return true;
            }
        });





        // const resp = await getVS1Data(erpObject.TEarningData);
        // let data = resp.length > 0 ? JSON.parse(resp[0].data) : [];
        const response  = data.response;

        let earnings = response.map(e => e.fields != undefined ? e.fields : e);



        await templateObject.earnings.set(earnings);

        setTimeout(function () {
            $('#earningRateSettingsModal #tblEarnings').DataTable({
                ...TableHandler.getDefaultTableConfiguration("tblEarnings"),
                "order": [[0, "asc"]],
                action: function () {
                    $('#earningRateSettingsModal #tblEarnings').DataTable().ajax.reload();
                },
                // "fnDrawCallback": function (oSettings) {
                //     $('.paginate_button.page-item').removeClass('disabled');
                //     $('#tblEarnings_ellipsis').addClass('disabled');
                //     if (oSettings._iDisplayLength == -1) {
                //         if (oSettings.fnRecordsDisplay() > 150) {

                //         }
                //     } else {

                //     }
                //     if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                //         $('.paginate_button.page-item.next').addClass('disabled');
                //     }

                //     $('.paginate_button.next:not(.disabled)', this.api().table().container())
                //         .on('click', function () {
                //             // $('.fullScreenSpin').css('display', 'inline-block');
                //             var splashArrayEarningListDupp = new Array();
                //             let dataLenght = oSettings._iDisplayLength;
                //             let customerSearch = $('#tblEarnings_filter input').val();



                //         });
                //     setTimeout(function () {
                //         MakeNegative();
                //     }, 100);
                // },
                // "fnInitComplete": function () {
                //   $("<button class='btn btn-primary btnAddordinaryTimeEarnings' data-dismiss='modal' data-toggle='modal' data-target='#add-tblEarnings_modal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblEarnings_filter");
                //   $("<button class='btn btn-primary btnRefreshEarnings' type='button' id='btnRefreshEarnings' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblEarnings_filter");

                // }

            }).on('page', function () {
                setTimeout(function () {
                    MakeNegative();
                }, 100);

            }).on('column-reorder', function () {

            }).on('length.dt', function (e, settings, len) {
            //// $('.fullScreenSpin').css('display', 'inline-block');
            let dataLenght = settings._iDisplayLength;
            splashArrayEarningList = [];
            if (dataLenght == -1) {
                LoadingOverlay.hide();

            } else {
                if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
                    LoadingOverlay.hide();
                } else {

                }
            }
                setTimeout(function () {
                    MakeNegative();
                }, 100);
            });


        }, 300);

        $('div.dataTables_filter input').addClass('form-control form-control-sm');

    }

    templateObject.getEarnings = async function(){
        try {
            let data = {};
            let splashArrayEarningList = new Array();
            let dataObject = await getVS1Data('TEarnings')
            if ( dataObject.length == 0) {
                data = await templateObject.saveDataLocalDB();
            }else{
                data = JSON.parse(dataObject[0].data);
            }
            if( data.tearnings.length > 0 ){
                for (let i = 0; i < data.tearnings.length; i++) {
                    let dataList = [
                        data.tearnings[i].fields.ID || '',
                        data.tearnings[i].fields.EarningsName || '',
                        data.tearnings[i].fields.EarningType || '',
                        data.tearnings[i].fields.EarningsDisplayName || '',
                        data.tearnings[i].fields.EarningsRateType||'',
                        data.tearnings[i].fields.ExpenseAccount || '',
                        data.tearnings[i].fields.EarningsExemptPaygWithholding || '',
                        data.tearnings[i].fields.EarningsExemptSuperannuationGuaranteeCont || '',
                        data.tearnings[i].fields.EarningsReportableW1onActivityStatement || ''
                    ];
                    splashArrayEarningList.push(dataList);
                }
            }
            templateObject.datatablerecords.set(splashArrayEarningList);
            $('.fullScreenSpin').css('display', 'none');
            setTimeout(function () {
                $('#tblEarnings').DataTable({
                    data: splashArrayEarningList,
                    "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                    columnDefs: [

                        {
                            className: "colEarningsID hiddenColumn",
                            "targets": [0]
                        },
                        {
                            className: "colEarningsNames",
                            "targets": [1]
                        },
                        {
                            className: "colEarningsType",
                            "targets": [2]
                        },
                        {
                        className: "colEarningsDisplayName",
                        "targets": [3]
                        },
                        {
                        className: "colEarningsAccounts",
                        "targets": [4]
                        },
                        {
                        className: "colEarningsRateType",
                        "targets": [5]
                        },
                        {
                        className: "colEarningsPAYG hiddenColumn"  ,
                        "targets": [6]
                        },
                        {
                        className: "colEarningsSuperannuation hiddenColumn",
                        "targets": [7]
                        },
                        {
                        className: "colEarningsReportableasW1 hiddenColumn",
                        "targets": [8]
                        }
                    ],
                    select: true,
                    destroy: true,
                    colReorder: true,
                    pageLength: initialDatatableLoad,
                    lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                    info: true,
                    responsive: true,
                    "order": [[0, "asc"]],
                    action: function () {
                        $('#tblEarnings').DataTable().ajax.reload();
                    },
                    "fnDrawCallback": function (oSettings) {
                        $('.paginate_button.page-item').removeClass('disabled');
                        $('#tblEarnings_ellipsis').addClass('disabled');
                        if (oSettings._iDisplayLength == -1) {
                            if (oSettings.fnRecordsDisplay() > 150) {

                            }
                        } else {

                        }
                        if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                            $('.paginate_button.page-item.next').addClass('disabled');
                        }

                        $('.paginate_button.next:not(.disabled)', this.api().table().container())
                            .on('click', function () {
                                $('.fullScreenSpin').css('display', 'inline-block');
                                var splashArrayEarningListDupp = new Array();
                                let dataLenght = oSettings._iDisplayLength;
                                let customerSearch = $('#tblEarnings_filter input').val();

                                sideBarService.getEarnings(initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (data) {

                                    for (let i = 0; i < data.tearnings.length; i++) {
                                        var dataList = [
                                        data.tearnings[i].fields.ID || '',
                                        data.tearnings[i].fields.EarningsName || '',
                                        data.tearnings[i].fields.EarningType || '',
                                        data.tearnings[i].fields.EarningsDisplayName || '',
                                        data.tearnings[i].fields.EarningsRateType||'',
                                        data.tearnings[i].fields.ExpenseAccount || '',
                                        data.tearnings[i].fields.EarningsExemptPaygWithholding || '',
                                        data.tearnings[i].fields.EarningsExemptSuperannuationGuaranteeCont || '',
                                        data.tearnings[i].fields.EarningsReportableW1onActivityStatement || ''
                                        ];
                                        splashArrayEarningList.push(dataList);
                                    }
                                    let uniqueChars = [...new Set(splashArrayEarningList)];
                                    var datatable = $('#tblEarnings').DataTable();
                                    datatable.clear();
                                    datatable.rows.add(uniqueChars);
                                    datatable.draw(false);
                                    setTimeout(function () {
                                        $("#tblEarnings").dataTable().fnPageChange('last');
                                    }, 400);

                                    $('.fullScreenSpin').css('display', 'none');


                                }).catch(function (err) {
                                    $('.fullScreenSpin').css('display', 'none');
                                });

                            });
                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                    },
                    "fnInitComplete": function () {
                        $("<button class='btn btn-primary btnAddordinaryTimeEarnings' data-dismiss='modal' data-toggle='modal' data-target='#add-tblEarnings_modal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblEarnings_filter");
                        $("<button class='btn btn-primary btnRefreshEarnings' type='button' id='btnRefreshEarnings' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblEarnings_filter");
                    }

                }).on('page', function () {
                    setTimeout(function () {
                        MakeNegative();
                    }, 100);

                }).on('column-reorder', function () {

                }).on('length.dt', function (e, settings, len) {
                    //$('.fullScreenSpin').css('display', 'inline-block');
                    let dataLenght = settings._iDisplayLength;
                    splashArrayEarningList = [];
                    if (dataLenght == -1) {
                    $('.fullScreenSpin').css('display', 'none');

                    } else {
                        if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
                            $('.fullScreenSpin').css('display', 'none');
                        } else {
                            sideBarService.getEarnings(dataLenght, 0).then(function (dataNonBo) {

                                addVS1Data('TEarnings', JSON.stringify(dataNonBo)).then(function (datareturn) {
                                    templateObject.resetData(dataNonBo);
                                    $('.fullScreenSpin').css('display', 'none');
                                }).catch(function (err) {
                                    $('.fullScreenSpin').css('display', 'none');
                                });
                            }).catch(function (err) {
                                $('.fullScreenSpin').css('display', 'none');
                            });
                        }
                    }
                    setTimeout(function () {
                        MakeNegative();
                    }, 100);
                });
            }, 1000);
        } catch (error) {
            $('.fullScreenSpin').css('display', 'none');
        }
    };
    //templateObject.getEarnings();

    templateObject.getAllTaxCodes = function() {
        getVS1Data("TTaxcodeVS1").then(function(dataObject) {
            if (dataObject.length === 0) {
                productService.getTaxCodesVS1().then(function(data) {
                    let records = [];
                    let inventoryData = [];
                    for (let i = 0; i < data.ttaxcodevs1.length; i++) {
                        let taxRate = (data.ttaxcodevs1[i].Rate * 100).toFixed(2);
                        var dataList = [
                            data.ttaxcodevs1[i].Id || "",
                            data.ttaxcodevs1[i].CodeName || "",
                            data.ttaxcodevs1[i].Description || "-",
                            taxRate || 0,
                        ];

                        let taxcoderecordObj = {
                            codename: data.ttaxcodevs1[i].CodeName || " ",
                            coderate: taxRate || " ",
                        };

                        taxCodesList.push(taxcoderecordObj);

                        splashArrayTaxRateList.push(dataList);
                    }
                    templateObject.taxraterecords.set(taxCodesList);

                    if (splashArrayTaxRateList) {
                        $("#tblTaxRate").DataTable({
                            data: splashArrayTaxRateList,
                            sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                            columnDefs: [{
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
                            fnDrawCallback: function(oSettings) {
                                // $('.dataTables_paginate').css('display', 'none');
                            },
                            fnInitComplete: function() {
                                $(
                                    "<button class='btn btn-primary btnAddNewTaxRate' data-dismiss='modal' data-toggle='modal' data-target='#newTaxRateModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>"
                                ).insertAfter("#tblTaxRate_filter");
                                $(
                                    "<button class='btn btn-primary btnRefreshTax' type='button' id='btnRefreshTax' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>"
                                ).insertAfter("#tblTaxRate_filter");
                            },
                        });
                    }
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.ttaxcodevs1;
                let records = [];
                let inventoryData = [];
                for (let i = 0; i < useData.length; i++) {
                    let taxRate = (useData[i].Rate * 100).toFixed(2);
                    var dataList = [
                        useData[i].Id || "",
                        useData[i].CodeName || "",
                        useData[i].Description || "-",
                        taxRate || 0,
                    ];

                    let taxcoderecordObj = {
                        codename: useData[i].CodeName || " ",
                        coderate: taxRate || " ",
                    };

                    taxCodesList.push(taxcoderecordObj);

                    splashArrayTaxRateList.push(dataList);
                }
                templateObject.taxraterecords.set(taxCodesList);
                if (splashArrayTaxRateList) {
                    $("#tblTaxRate").DataTable({
                        data: splashArrayTaxRateList,
                        sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",

                        columnDefs: [{
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
                        fnDrawCallback: function(oSettings) {
                            // $('.dataTables_paginate').css('display', 'none');
                        },
                        fnInitComplete: function() {
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
        }).catch(function(err) {
            productService.getTaxCodesVS1().then(function(data) {
                let records = [];
                let inventoryData = [];
                for (let i = 0; i < data.ttaxcodevs1.length; i++) {
                    let taxRate = (data.ttaxcodevs1[i].Rate * 100).toFixed(2);
                    var dataList = [
                        data.ttaxcodevs1[i].Id || "",
                        data.ttaxcodevs1[i].CodeName || "",
                        data.ttaxcodevs1[i].Description || "-",
                        taxRate || 0,
                    ];

                    let taxcoderecordObj = {
                        codename: data.ttaxcodevs1[i].CodeName || " ",
                        coderate: taxRate || " ",
                    };

                    taxCodesList.push(taxcoderecordObj);

                    splashArrayTaxRateList.push(dataList);
                }
                templateObject.taxraterecords.set(taxCodesList);

                if (splashArrayTaxRateList) {
                    $("#tblTaxRate").DataTable({
                        data: splashArrayTaxRateList,
                        sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",

                        columnDefs: [{
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
                        fnDrawCallback: function(oSettings) {
                            // $('.dataTables_paginate').css('display', 'none');
                        },
                        fnInitComplete: function() {
                            $(
                                "<button class='btn btn-primary btnAddNewTaxRate' data-dismiss='modal' data-toggle='modal' data-target='#newTaxRateModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>"
                            ).insertAfter("#tblTaxRate_filter");
                            $(
                                "<button class='btn btn-primary btnRefreshTax' type='button' id='btnRefreshTax' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>"
                            ).insertAfter("#tblTaxRate_filter");
                        },
                    });
                }
            });
        });
    };

    templateObject.editEarning = async (id) => {
        $('#add-tblEarnings_modal').modal('show');
        $('#add-tblEarnings_modal').attr('earning-id', id);

    }

    // setTimeout(function() {
    //     templateObject.getAllTaxCodes();
    //     templateObject.getEarningTypes();
    // }, 500);

    templateObject.initData = async (refresh = false) => {
        await templateObject.getAllTaxCodes(refresh);
        await templateObject.getEarningTypes(refresh);
        await templateObject.loadEarnings(refresh);
    }

    templateObject.initData();

/**
 * Drop down code start
*/
    $('.taxCodedrpDown').editableSelect();
    $('.taxCodedrpDown').editableSelect().on('click.editable-select', function (e, li) {
        var $earch = $(this);
        var taxSelected = "sales";
        var offset = $earch.offset();
        var taxRateDataName = e.target.value || '';
        let dropDownID = $earch.attr('id')
        templateObject.currentDrpDownID.set(dropDownID);
        if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
            $('#taxRateListModal').modal('toggle');
        } else {
            if (taxRateDataName.replace(/\s/g, '') != '') {
                $('.taxcodepopheader').text('Edit Tax Rate');
                getVS1Data('TTaxcodeVS1').then(function (dataObject) {
                    if (dataObject.length === 0) {
                        purchaseService.getTaxCodesVS1().then(function (data) {
                            let lineItems = [];
                            let lineItemObj = {};
                            for (let i = 0; i < data.ttaxcodevs1.length; i++) {
                                if ((data.ttaxcodevs1[i].CodeName) === taxRateDataName) {
                                    $('#edtTaxNamePop').attr('readonly', true);
                                    let taxRate = (data.ttaxcodevs1[i].Rate * 100).toFixed(2);
                                    var taxRateID = data.ttaxcodevs1[i].Id || '';
                                    var taxRateName = data.ttaxcodevs1[i].CodeName || '';
                                    var taxRateDesc = data.ttaxcodevs1[i].Description || '';
                                    $('#edtTaxID').val(taxRateID);
                                    $('#edtTaxNamePop').val(taxRateName);
                                    $('#edtTaxRatePop').val(taxRate);
                                    $('#edtTaxDescPop').val(taxRateDesc);
                                    setTimeout(function () {
                                        $('#newTaxRateModal').modal('toggle');
                                    }, 100);
                                }
                            }

                        }).catch(function (err) {
                            // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                            $('.fullScreenSpin').css('display', 'none');
                            // Meteor._reload.reload();
                        });
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        let useData = data.ttaxcodevs1;
                        let lineItems = [];
                        let lineItemObj = {};
                        $('.taxcodepopheader').text('Edit Tax Rate');
                        for (let i = 0; i < useData.length; i++) {

                            if ((useData[i].CodeName) === taxRateDataName) {
                                $('#edtTaxNamePop').attr('readonly', true);
                                let taxRate = (useData[i].Rate * 100).toFixed(2);
                                var taxRateID = useData[i].Id || '';
                                var taxRateName = useData[i].CodeName || '';
                                var taxRateDesc = useData[i].Description || '';
                                $('#edtTaxID').val(taxRateID);
                                $('#edtTaxNamePop').val(taxRateName);
                                $('#edtTaxRatePop').val(taxRate);
                                $('#edtTaxDescPop').val(taxRateDesc);
                                //setTimeout(function() {
                                $('#newTaxRateModal').modal('toggle');
                                //}, 500);
                            }
                        }
                    }
                }).catch(function (err) {
                    purchaseService.getTaxCodesVS1().then(function (data) {
                        let lineItems = [];
                        let lineItemObj = {};
                        for (let i = 0; i < data.ttaxcodevs1.length; i++) {
                            if ((data.ttaxcodevs1[i].CodeName) === taxRateDataName) {
                                $('#edtTaxNamePop').attr('readonly', true);
                                let taxRate = (data.ttaxcodevs1[i].Rate * 100).toFixed(2);
                                var taxRateID = data.ttaxcodevs1[i].Id || '';
                                var taxRateName = data.ttaxcodevs1[i].CodeName || '';
                                var taxRateDesc = data.ttaxcodevs1[i].Description || '';
                                $('#edtTaxID').val(taxRateID);
                                $('#edtTaxNamePop').val(taxRateName);
                                $('#edtTaxRatePop').val(taxRate);
                                $('#edtTaxDescPop').val(taxRateDesc);
                                setTimeout(function () {
                                    $('#newTaxRateModal').modal('toggle');
                                }, 100);

                            }
                        }

                    }).catch(function (err) {
                        // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                        $('.fullScreenSpin').css('display', 'none');
                        // Meteor._reload.reload();
                    });
                });
            } else {
                $('#taxRateListModal').modal('toggle');
            }

        }
    });

    $('.edtRateTypeDropDown').editableSelect();
    $('.edtRateTypeDropDown').editableSelect().on('click.editable-select', async function (e, li) {
        let $search = $(this);
        let dropDownID = $search.attr('id')
        $('#selectLineID').val(dropDownID);
        $('#tblratetypelist input').val('');
        templateObject.currentDrpDownID.set(dropDownID);
        $('#tblratetypelist input').trigger('keyup');
        let offset = $search.offset();
        let searchName = e.target.value || '';
        if (e.pageX > offset.left + $search.width() - 8) { // X button 16px wide?
            $('#rateTypeListModel').modal('show');
        } else {
            if (searchName.replace(/\s/g, '') == '') {
                $('#rateTypeListModel').modal('show');
                return false
            }
            if(searchName.replace(/\s/g, '') != ''){
                let data = [];
                let dataObject =  await getVS1Data('TPayRatetype');
                if( dataObject.length == 0 ){
                    data = await sideBarService.getRateListVS1();
                    addVS1Data('TPayRatetype',JSON.stringify(data));
                }else{
                    data = JSON.parse(dataObject[0].data);
                }
                let useData = data.tpayratetype.filter((item) => {
                    if( item.fields.Description == searchName ){
                        return item;
                    }
                });
                if( useData.length > 0 ){
                    $('#edtRateID').val( useData[0].fields.ID || '' );
                    $('#edtRateDescription').val(useData[0].fields.Description || '');
                }
                $('#addRateModel').modal('show');
            }
        }
    });

    $('.edtExpenseAccountDropDown').editableSelect();
    $('.edtExpenseAccountDropDown').editableSelect().on('click.editable-select', async function (e, li) {
        let $search = $(this);
        let dropDownID = $search.attr('id')
        $('#accSelected').val(dropDownID);
        if( dropDownID == 'liabilityAccount'){
            $('#tblAccount_filter input').val('liability');
            $('#tblAccount_filter input').trigger('keyup');
        }else{
            $('#tblAccount_filter input').val('');
            $('#tblAccount_filter input').trigger('keyup');
        }
        let offset = $search.offset();
        let searchName = e.target.value || '';
        if (e.pageX > offset.left + $search.width() - 8) { // X button 16px wide?
            $('#accountListModal').modal('show');
        } else {
            if (searchName.replace(/\s/g, '') == '') {
                $('#accountListModal').modal('show');
                return false
            }
            let dataObject =  await getVS1Data('TAccountVS1');
            if( dataObject.length > 0 ){
                data = JSON.parse(dataObject[0].data);
                let tAccounts = data.taccountvs1.filter((item) => {
                    if( item.fields.AccountName == searchName ){
                        return item;
                    }
                });

                var accountid = tAccounts[0].fields.ID || '';
                var accounttype = tAccounts[0].fields.AccountTypeName;
                var accountname = tAccounts[0].fields.AccountName || '';
                var accountno = tAccounts[0].fields.AccountNumber || '';
                var taxcode = tAccounts[0].fields.TaxCode || '';
                var accountdesc = tAccounts[0].fields.Description || '';
                var bankaccountname = tAccounts[0].fields.BankAccountName || '';
                var bankbsb = tAccounts[0].fields.BSB || '';
                var bankacountno = tAccounts[0].fields.BankAccountNumber || '';

                var swiftCode = tAccounts[0].fields.Extra || '';
                var routingNo = tAccounts[0].fields.BankCode || '';

                var showTrans = tAccounts[0].fields.IsHeader || false;

                var cardnumber = tAccounts[0].fields.CarNumber || '';
                var cardcvc = tAccounts[0].fields.CVC || '';
                var cardexpiry = tAccounts[0].fields.ExpiryDate || '';

                if ((accounttype === "BANK")) {
                    $('.isBankAccount').removeClass('isNotBankAccount');
                    $('.isCreditAccount').addClass('isNotCreditAccount');
                }else if ((accounttype === "CCARD")) {
                    $('.isCreditAccount').removeClass('isNotCreditAccount');
                    $('.isBankAccount').addClass('isNotBankAccount');
                } else {
                    $('.isBankAccount').addClass('isNotBankAccount');
                    $('.isCreditAccount').addClass('isNotCreditAccount');
                }
                $('#sltAccountType').attr('disabled', true);
                $('#edtAccountName').attr('disabled', true);
                $('#add-account-title').text('Edit Account');
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
            }
            $('#addAccountModal').modal('show');
        }
    });
    // Standard drop down
    $('.earningLineDropDown').editableSelect();
    $('.earningLineDropDown').editableSelect().on('click.editable-select', async function (e, li) {
        let $search = $(this);
        let offset = $search.offset();
        let dropDownID = $search.attr('id')
        $('#edtEarningDropDownID').val(dropDownID);
        templateObject.currentDrpDownID.set(dropDownID);
        let searchName = e.target.value || '';
        if (e.pageX > offset.left + $search.width() - 8) { // X button 16px wide?
            $('#earningRateForm')[0].reset();
            $('#earningRateSettingsModal').modal('show');
        } else {
            if (searchName.replace(/\s/g, '') == '') {
                $('#earningRateSettingsModal').modal('show');
                return false
            }
            let data = {};
            let dataObject = await getVS1Data('TEarnings');
            if ( dataObject.length == 0) {
                data = await templateObject.saveDataLocalDB();
            }else{
                data = JSON.parse(dataObject[0].data);
            }
            if( data.tearnings.length > 0 ){
                let tEarnings = data.tearnings.filter((item) => {
                    if( item.fields.EarningsName == searchName ){
                        return item;
                    }
                });
                $('#headerEarningLabel').text('Edit Earning');
                $('#earningRateForm')[0].reset();
                $('#addEarningsLineModal').modal('hide');
                if( tEarnings.length > 0 ){
                    let earningRate = tEarnings[0];
                    $('#earningID').val(earningRate.fields.ID)
                    $('#edtEarningsName').val(earningRate.fields.EarningsName)
                    $('#edtEarningsType').val(earningRate.fields.EarningType)
                    $('#edtDisplayName').val(earningRate.fields.EarningsDisplayName)
                    $('#edtRateType').val(earningRate.fields.EarningsRateType)
                    $('#edtExpenseAccount').val(earningRate.fields.ExpenseAccount)
                    $('#formCheck-ExemptPAYG').prop('checked', earningRate.fields.EarningsExemptPaygWithholding)
                    $('#formCheck-ExemptSuperannuation').prop('checked', earningRate.fields.EarningsExemptSuperannuationGuaranteeCont)
                    $('#formCheck-ExemptReportable').prop('checked', earningRate.fields.EarningsReportableW1onActivityStatement)
                }
                $('#earningRateSettingsModal').modal('hide');
                $('#add-tblEarnings_modal').modal('show');
            }
        }
    });

    // $(document).on("click", "#tblEarnings tbody tr", function (e) {
    //     var table = $(this);
    //     let earningRateID = templateObject.currentDrpDownID.get();
    //     let earningRate = table.find(".colEarningsNames").text()||'';
    //     $('#' + earningRateID).val(earningRate);
    //     $('#earningRateSettingsModal').modal('toggle');
    // });

    $(document).on("click", "#tblratetypelist tbody tr", function (e) {
        var table = $(this);
        let drpDownID = templateObject.currentDrpDownID.get();
        let drpDownValue = table.find(".thDescription").text()||'';
        $('#' + drpDownID).val(drpDownValue);
        $('#rateTypeListModel').modal('toggle');
    });

    $(document).on("click", "#tblTaxRate tbody tr", function (e) {
        var table = $(this);
        // let drpDownID = templateObject.currentDrpDownID.get();
        let drpDownValue = table.find(".taxName").text()||'';
        $('.taxCodedrpDown').val(drpDownValue);
        $('#taxRateListModal').modal('toggle');
    });

    $(document).on("click", "#tblAccount tbody tr", function (e) {
        var table = $(this);
        let name = table.find(".productName").text() ||'';
        let accountID = table.find(".colAccountID").text() ||'';
        let description = table.find(".productDesc").text() ||'';
        // let searchFilterID = templateObject.currentDrpDownID.get()
        let searchFilterID = $('#selectLineID').val();
        $('#' + searchFilterID).val(name);
        $("#edtDeductionAccountID").val(accountID);
        // $("#edtDeductionDesctiption").val(description);
        $('#accountListModal').modal('toggle');
    });

});


Template.earningRateSettings.events({
    'keyup #tblEarnings_filter input': function (event) {
        if($(event.target).val() != ''){
          $(".btnRefreshEarnings").addClass('btnSearchAlert');
        }else{
          $(".btnRefreshEarnings").removeClass('btnSearchAlert');
        }
        if (event.keyCode == 13) {
           $(".btnRefreshEarnings").trigger("click");
        }
    },
    'click .btnAddNewAccount':function(){
        $('#add-account-title').text('Add New Account');
        $('#sltAccountType').prop('disabled', true);
        $('#edtAccountName').prop('disabled', true);
    },
    'click .btnAddordinaryTimeEarnings':function(event){
        $('#headerEarningLabel').text('Add New Earning');
        $('#earningRateForm')[0].reset();
        $('#addEarningsLineModal').modal('hide');
    },
    'click .btnRefreshEarnings':function(event){
        let templateObject = Template.instance();
        var splashArrayEarningList = new Array();
        const lineExtaSellItems = [];
        $('.fullScreenSpin').css('display', 'inline-block');
        let dataSearchName = $('#tblEarnings_filter input').val();
        if (dataSearchName.replace(/\s/g, '') != '') {
            employeePayrollService.getEarningByName(dataSearchName).then(function (data) {
                $(".btnRefreshEarnings").removeClass('btnSearchAlert');
                let lineItems = [];
                if (data.tearnings.length > 0) {
                    for (let i = 0; i < data.tearnings.length; i++) {
                        let dataList = [
                          data.tearnings[i].fields.ID || '',
                          data.tearnings[i].fields.EarningsName || '',
                          data.tearnings[i].fields.EarningType || '',
                          data.tearnings[i].fields.EarningsDisplayName || '',
                          data.tearnings[i].fields.EarningsRateType||'',
                          data.tearnings[i].fields.ExpenseAccount || '',
                          data.tearnings[i].fields.EarningsExemptPaygWithholding || '',
                          data.tearnings[i].fields.EarningsExemptSuperannuationGuaranteeCont || '',
                          data.tearnings[i].fields.EarningsReportableW1onActivityStatement || ''
                        ];
                        splashArrayEarningList.push(dataList);
                    }
                    let uniqueChars = [...new Set(splashArrayEarningList)];
                    var datatable = $('#tblEarnings').DataTable();
                    datatable.clear();
                    datatable.rows.add(uniqueChars);
                    datatable.draw(false);
                    setTimeout(function () {
                        $("#tblEarnings").dataTable().fnPageChange('last');
                    }, 400);

                    $('.fullScreenSpin').css('display', 'none');

                } else {
                    $('.fullScreenSpin').css('display', 'none');

                    swal({
                        title: 'Question',
                        text: "Earning Rate does not exist, would you like to create it?",
                        type: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Yes',
                        cancelButtonText: 'No'
                    }).then((result) => {
                        if (result.value) {
                            $('#earningRateForm')[0].reset();
                            $('#edtEarningsName').val(dataSearchName)
                            $('#earningRateSettingsModal').modal('hide');
                            $('#addEarningsLineModal').modal('hide');
                            $('#add-tblEarnings_modal').modal('show');
                        }
                    });
                }
            }).catch(function (err) {
                $('.fullScreenSpin').css('display', 'none');
            });
        } else {

          $(".btnRefresh").trigger("click");
        }

    },
    'click .saveEarningRates': async function (event) {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');

        const employeePayrolApis = new EmployeePayrollApi();
        // now we have to make the post request to save the data in database
        const apiEndpoint = employeePayrolApis.collection.findByName(
            employeePayrolApis.collectionNames.TEarnings
        );

        let EarningsName = $('#edtEarningsName').val();
        let ID = $('#earningID').val();
        let EarningsType = $('#edtEarningsType').val();
        let EarningsDisplayName = $('#edtDisplayName').val();
        let EarningsRateType = $('#edtRateType').val();
        let ExpenseAccount = $('#edtExpenseAccount').val();
        let ExemptPAYG = ( $('#formCheck-ExemptPAYG').is(':checked') )? true: false;
        let ExemptSuperannuation = ( $('#formCheck-ExemptSuperannuation').is(':checked') )? true: false;
        let ExemptReportable = ( $('#formCheck-ExemptReportable').is(':checked') )? true: false;

        if(EarningsName == ''){
            handleValidationError('Please select Earning Name!', 'edtEarningsName');
            return false;
        }

        if(EarningsRateType == ''){
            handleValidationError('Please enter Earning Rate Type!', 'edtRateType');
            return false;
        }

        if(ExpenseAccount == ''){
            handleValidationError('Please enter Expense Account!', 'edtExpenseAccount');
            return false;
        }


        /**
         * Saving Earning Object in localDB
        */
        let earningRateSetting = new Earning({
            type: 'TEarnings',
            fields: new EarningFields({
                ID: parseInt(ID),
                EarningsName: EarningsName,
                EarningType: EarningsType,
                EarningsDisplayName: EarningsDisplayName,
                EarningsRateType: EarningsRateType,
                ExpenseAccount: ExpenseAccount,
                EarningsExemptPaygWithholding: ExemptPAYG,
                EarningsExemptSuperannuationGuaranteeCont: ExemptSuperannuation,
                EarningsReportableW1onActivityStatement: ExemptReportable,
                Active: true
            })
        });

        try {
            const ApiResponse = await apiEndpoint.fetch(null, {
                method: "POST",
                headers: ApiService.getPostHeaders(),
                body: JSON.stringify(earningRateSetting),
            });

            if (ApiResponse.ok == true) {
                const jsonResponse = await ApiResponse.json();
                $('#earningRateForm')[0].reset();
                await templateObject.saveDataLocalDB();
                await templateObject.getEarnings();
                let drpDownID = $('#edtEarningDropDownID').val();
                $('#' + drpDownID).val(EarningsName);
                $('#add-tblEarnings_modal').modal('hide');
                $('.fullScreenSpin').css('display', 'none');
                swal({
                    title: 'Earning Rate saved successfully',
                    text: '',
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'OK'
                }).then((result) => {
                    if (result.value) {
                        if (result.value) { }
                    }
                });
            }else{
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
    "click #tblEarnings tbody tr": (e, ui) => {
        var table = $(e.currentTarget);
        let earningRateID = ui.currentDrpDownID.get();
        let earningRate = table.find(".colEarningsNames").text()||'';
        $('#' + earningRateID).val(earningRate);
        $('#earningRateSettingsModal').modal('toggle');
    },

});

Template.earningRateSettings.helpers({
    datatablerecords: () => {
        return Template.instance().datatablerecords.get();
    },
    earningTypes: () => {
        return Template.instance().earningTypes.get();
    },
    earnings: () => {
        return Template.instance().earnings.get();
    },
});

//
