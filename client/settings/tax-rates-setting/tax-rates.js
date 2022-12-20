import { TaxRateService } from "../settings-service";
import { ReactiveVar } from 'meteor/reactive-var';
import { SideBarService } from '../../js/sidebar-service';
import { OrganisationService } from "../../js/organisation-service";
import '../../lib/global/indexdbstorage.js';
let sideBarService = new SideBarService();
let organisationService = new OrganisationService();

const numberInputValidate = (event) => {
    if (
        $.inArray(event.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||
        // Allow: Ctrl+A, Command+A
        (event.keyCode === 65 &&
            (event.ctrlKey === true || event.metaKey === true)) ||
        // Allow: home, end, left, right, down, up
        (event.keyCode >= 35 && event.keyCode <= 40)
    ) {
        // let it happen, don't do anything
        return;
    }

    if ((event.keyCode >= 48 && event.keyCode <= 57) ||
        (event.keyCode >= 96 && event.keyCode <= 105) ||
        event.keyCode == 8 || event.keyCode == 9 ||
        event.keyCode == 37 || event.keyCode == 39 ||
        event.keyCode == 46 || event.keyCode == 190) {} else {
        event.preventDefault();
    }
}

Template.taxRatesSettings.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);

    templateObject.defaultpurchasetaxcode = new ReactiveVar();
    templateObject.defaultsaletaxcode = new ReactiveVar();

    templateObject.isChkUSRegionTax = new ReactiveVar();
    templateObject.isChkUSRegionTax.set(false);

    templateObject.subtaxcodes = new ReactiveVar([]);
    templateObject.subtaxlines = new ReactiveVar([]);
});

Template.taxRatesSettings.onRendered(function() {
    $('.fullScreenSpin').css('display', 'inline-block');
    let templateObject = Template.instance();
    let taxRateService = new TaxRateService();
// Inactive Tax Button Change
    if (localStorage.getItem("inactiveFlag") == "true") {
        $(".btnInactiveTax").text("Inactive Tax Codes");
    } else {
        $(".btnInactiveTax").text("Active Tax Codes");
    }

    const tableHeaderList = [];

    let purchasetaxcode = '';
    let salestaxcode = '';
    templateObject.defaultpurchasetaxcode.set(loggedTaxCodePurchaseInc);
    templateObject.defaultsaletaxcode.set(loggedTaxCodeSalesInc);

    setTimeout(function() {
        Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'defaulttax', function(error, result) {
            if (error) {
                purchasetaxcode = loggedTaxCodePurchaseInc;
                salestaxcode = loggedTaxCodeSalesInc;
                templateObject.defaultpurchasetaxcode.set(loggedTaxCodePurchaseInc);
                templateObject.defaultsaletaxcode.set(loggedTaxCodeSalesInc);
            } else {
                if (result) {
                    purchasetaxcode = result.customFields[0].taxvalue || loggedTaxCodePurchaseInc;
                    salestaxcode = result.customFields[1].taxvalue || loggedTaxCodeSalesInc;
                    templateObject.defaultpurchasetaxcode.set(purchasetaxcode);
                    templateObject.defaultsaletaxcode.set(salestaxcode);
                }

            }
        });
    }, 500);

    Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'taxRatesList', function(error, result) {
        if (error) {

        } else {
            if (result) {
                for (let i = 0; i < result.customFields.length; i++) {
                    let customcolumn = result.customFields;
                    let columData = customcolumn[i].label;
                    let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                    let hiddenColumn = customcolumn[i].hidden;
                    let columnClass = columHeaderUpdate.split('.')[1];
                    let columnWidth = customcolumn[i].width;

                    $("th." + columnClass + "").html(columData);
                    $("th." + columnClass + "").css('width', "" + columnWidth + "px");

                }
            }
        }
    });

    function MakeNegative() {
        $('td').each(function() {
            if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
        });
    };

    templateObject.getTaxRates = function() {
        const dataTableList = [];
        getVS1Data('TTaxcodeVS1').then(function(dataObject) {
            if (dataObject.length == 0) {
                taxRateService.getTaxRateVS1().then(function(data) {
                    for (let i = 0; i < data.ttaxcodevs1.length; i++) {
                        let taxRate = (data.ttaxcodevs1[i].Rate * 100).toFixed(2) + '%';
                        var dataList = {
                            id: data.ttaxcodevs1[i].Id || '',
                            codename: data.ttaxcodevs1[i].CodeName || '-',
                            description: data.ttaxcodevs1[i].Description || '-',
                            region: data.ttaxcodevs1[i].RegionName || '-',
                            rate: taxRate || '-',
                            isUSTax: data.ttaxcodevs1[i].Lines ? true : false,
                            lines: data.ttaxcodevs1[i].Lines || [],
                        };

                        dataTableList.push(dataList);
                    }

                    templateObject.datatablerecords.set(dataTableList);

                    if (templateObject.datatablerecords.get()) {
                        Meteor.call(
                            "readPrefMethod",
                            Session.get("mycloudLogonID"),
                            "taxRatesList",
                            function(error, result) {
                                if (error) {} else {
                                    if (result) {
                                        for (let i = 0; i < result.customFields.length; i++) {
                                            let customcolumn = result.customFields;
                                            let columData = customcolumn[i].label;
                                            let columHeaderUpdate = customcolumn[i].thclass.replace(
                                                / /g,
                                                "."
                                            );
                                            let hiddenColumn = customcolumn[i].hidden;
                                            let columnClass = columHeaderUpdate.split(".")[1];
                                            let columnWidth = customcolumn[i].width;
                                            let columnindex = customcolumn[i].index + 1;

                                            if (hiddenColumn == true) {
                                                $("." + columnClass + "").addClass("hiddenColumn");
                                                $("." + columnClass + "").removeClass("showColumn");
                                            } else if (hiddenColumn == false) {
                                                $("." + columnClass + "").removeClass("hiddenColumn");
                                                $("." + columnClass + "").addClass("showColumn");
                                            }
                                        }
                                    }
                                }
                            }
                        );

                        setTimeout(function() {
                            MakeNegative();
                        }, 100);
                    }

                    $(".fullScreenSpin").css("display", "none");
                    setTimeout(function() {
                        $("#taxRatesList")
                            .DataTable({
                                columnDefs: [
                                    { type: "date", targets: 0 },
                                    { orderable: false, targets: -1 },
                                ],
                                sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                                buttons: [{
                                        extend: 'excelHtml5',
                                        text: '',
                                        download: 'open',
                                        className: "btntabletocsv hiddenColumn",
                                        filename: "taxratelist_" + moment().format(),
                                        orientation: 'portrait',
                                        exportOptions: {
                                            columns: ":visible",
                                        },
                                    },
                                    {
                                        extend: "print",
                                        download: "open",
                                        className: "btntabletopdf hiddenColumn",
                                        text: "",
                                        title: "Tax Rate List",
                                        filename: "taxratelist_" + moment().format(),
                                        exportOptions: {
                                            columns: ":visible",
                                        },
                                        // bStateSave: true,
                                        // rowId: 0,
                                        // pageLength: 25,
                                        paging: false,
                                        //                      "scrollY": "400px",
                                        //                      "scrollCollapse": true,
                                        info: true,
                                        responsive: true,
                                        "order": [
                                            [0, "asc"]
                                        ],
                                        action: function() {
                                            $('#taxRatesList').DataTable().ajax.reload();
                                        },
                                    },
                                    {
                                        extend: "print",
                                        download: "open",
                                        className: "btntabletopdf hiddenColumn",
                                        text: "",
                                        title: "Tax Rate List",
                                        filename: "taxratelist_" + moment().format(),
                                        exportOptions: {
                                            columns: ":visible",
                                        },
                                    },
                                ],
                                select: true,
                                destroy: true,
                                // colReorder: true,
                                colReorder: {
                                    fixedColumnsRight: 1,
                                },
                                // bStateSave: true,
                                // rowId: 0,
                                // pageLength: 25,
                                paging: false,
                                //                    "scrollY": "400px",
                                //                    "scrollCollapse": true,
                                info: true,
                                responsive: true,
                                order: [
                                    [0, "asc"]
                                ],
                                action: function() {
                                    $("#taxRatesList").DataTable().ajax.reload();
                                },
                                fnDrawCallback: function(oSettings) {
                                    setTimeout(function() {
                                        MakeNegative();
                                    }, 100);
                                },
                            })
                            .on("page", function() {
                                setTimeout(function() {
                                    MakeNegative();
                                }, 100);
                                let draftRecord = templateObject.datatablerecords.get();
                                templateObject.datatablerecords.set(draftRecord);
                            })
                            .on("column-reorder", function() {})
                            .on("length.dt", function(e, settings, len) {
                                setTimeout(function() {
                                    MakeNegative();
                                }, 100);
                            });

                        // $('#taxRatesList').DataTable().column( 0 ).visible( true );
                        $(".fullScreenSpin").css("display", "none");
                    }, 0);

                    var columns = $("#taxRatesList th");
                    let sWidth = "";
                    let columVisible = false;
                    $.each(columns, function(i, v) {
                        if (v.hidden == false) {
                            columVisible = true;
                        }
                        if (v.className.includes("hiddenColumn")) {
                            columVisible = false;
                        }
                        sWidth = v.style.width.replace("px", "");

                        let datatablerecordObj = {
                            sTitle: v.innerText || "",
                            sWidth: sWidth || "",
                            sIndex: v.cellIndex || "",
                            sVisible: columVisible || false,
                            sClass: v.className || "",
                        };
                        tableHeaderList.push(datatablerecordObj);
                    });
                    templateObject.tableheaderrecords.set(tableHeaderList);
                    $('div.dataTables_filter input').addClass('form-control form-control-sm');

                }).catch(function(err) {
                    // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                    $(".fullScreenSpin").css("display", "none");
                    // Meteor._reload.reload();
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.ttaxcodevs1;
                for (let i = 0; i < useData.length; i++) {
                    let taxRate = (useData[i].Rate * 100).toFixed(2) + '%';
                    var dataList = {
                        id: useData[i].Id || '',
                        codename: useData[i].CodeName || '-',
                        description: useData[i].Description || '-',
                        region: useData[i].RegionName || '-',
                        rate: taxRate || '-',
                        isUSTax: useData[i].Lines ? true : false,
                        lines: useData[i].Lines || [],
                    };

                    dataTableList.push(dataList);
                }

                templateObject.datatablerecords.set(dataTableList);

                if (templateObject.datatablerecords.get()) {

                    Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'taxRatesList', function(error, result) {
                        if (error) {

                        } else {
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
                    $('#taxRatesList').DataTable({
                        columnDefs: [
                            { type: 'date', targets: 0 },
                            { "orderable": false, "targets": -1 }
                        ],
                        "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        buttons: [{
                            extend: 'excelHtml5',
                            text: '',
                            download: 'open',
                            className: "btntabletocsv hiddenColumn",
                            filename: "taxratelist_" + moment().format(),
                            orientation: 'portrait',
                            exportOptions: {
                                columns: ':visible'
                            }
                        }, {
                            extend: 'print',
                            download: 'open',
                            className: "btntabletopdf hiddenColumn",
                            text: '',
                            title: 'Tax Rate List',
                            filename: "taxratelist_" + moment().format(),
                            exportOptions: {
                                columns: ':visible'
                            }
                        }],
                        select: true,
                        destroy: true,
                        // colReorder: true,
                        colReorder: {
                            fixedColumnsRight: 1
                        },
                        // bStateSave: true,
                        // rowId: 0,
                        // pageLength: 25,
                        paging: false,
                        //          "scrollY": "400px",
                        //          "scrollCollapse": true,
                        info: true,
                        responsive: true,
                        "order": [
                            [0, "asc"]
                        ],
                        action: function() {
                            $('#taxRatesList').DataTable().ajax.reload();
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
                    }).on('column-reorder', function() {

                    }).on('length.dt', function(e, settings, len) {
                        setTimeout(function() {
                            MakeNegative();
                        }, 100);
                    });

                    // $('#taxRatesList').DataTable().column( 0 ).visible( true );
                    $('.fullScreenSpin').css('display', 'none');
                }, 0);

                var columns = $('#taxRatesList th');
                let sWidth = "";
                let columVisible = false;
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
                        sIndex: v.cellIndex || '',
                        sVisible: columVisible || false,
                        sClass: v.className || ''
                    };
                    tableHeaderList.push(datatablerecordObj);
                });
                templateObject.tableheaderrecords.set(tableHeaderList);
                $('div.dataTables_filter input').addClass('form-control form-control-sm');

            }
        }).catch(function(err) {
            taxRateService.getTaxRateVS1().then(function(data) {
                for (let i = 0; i < data.ttaxcodevs1.length; i++) {
                    let taxRate = (data.ttaxcodevs1[i].Rate * 100).toFixed(2) + '%';
                    var dataList = {
                        id: data.ttaxcodevs1[i].Id || '',
                        codename: data.ttaxcodevs1[i].CodeName || '-',
                        description: data.ttaxcodevs1[i].Description || '-',
                        region: data.ttaxcodevs1[i].RegionName || '-',
                        rate: taxRate || '-',
                        isUSTax: data.ttaxcodevs1[i].Lines ? true : false,
                        lines: data.ttaxcodevs1[i].Lines || [],
                    };

                    dataTableList.push(dataList);
                }

                templateObject.datatablerecords.set(dataTableList);

                if (templateObject.datatablerecords.get()) {

                    Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'taxRatesList', function(error, result) {
                        if (error) {

                        } else {
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
                    $('#taxRatesList').DataTable({
                        columnDefs: [
                            { type: 'date', targets: 0 },
                            { "orderable": false, "targets": -1 }
                        ],
                        "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        buttons: [{
                            extend: 'excelHtml5',
                            text: '',
                            download: 'open',
                            className: "btntabletocsv hiddenColumn",
                            filename: "taxratelist_" + moment().format(),
                            orientation: 'portrait',
                            exportOptions: {
                                columns: ':visible'
                            }
                        }, {
                            extend: 'print',
                            download: 'open',
                            className: "btntabletopdf hiddenColumn",
                            text: '',
                            title: 'Tax Rate List',
                            filename: "taxratelist_" + moment().format(),
                            exportOptions: {
                                columns: ':visible'
                            }
                        }],
                        select: true,
                        destroy: true,
                        // colReorder: true,
                        colReorder: {
                            fixedColumnsRight: 1
                        },
                        // bStateSave: true,
                        // rowId: 0,
                        // pageLength: 25,
                        paging: false,
                        //                    "scrollY": "400px",
                        //                    "scrollCollapse": true,
                        info: true,
                        responsive: true,
                        "order": [
                            [0, "asc"]
                        ],
                        action: function() {
                            $('#taxRatesList').DataTable().ajax.reload();
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
                    }).on('column-reorder', function() {

                    }).on('length.dt', function(e, settings, len) {
                        setTimeout(function() {
                            MakeNegative();
                        }, 100);
                    });

                    // $('#taxRatesList').DataTable().column( 0 ).visible( true );
                    $('.fullScreenSpin').css('display', 'none');
                }, 0);

                var columns = $('#taxRatesList th');
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
                        sIndex: v.cellIndex || '',
                        sVisible: columVisible || false,
                        sClass: v.className || ''
                    };
                    tableHeaderList.push(datatablerecordObj);
                });
                templateObject.tableheaderrecords.set(tableHeaderList);
                $('div.dataTables_filter input').addClass('form-control form-control-sm');



            }).catch(function(err) {
                // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                $('.fullScreenSpin').css('display', 'none');
                // Meteor._reload.reload();
            });
        });

    }

    templateObject.chkSubTaxRateSetting = function() {
        organisationService.getChkUSRegionTaxSetting().then(function(dataListRet) {
            let mainData = dataListRet.tcompanyinfo[0];
            if (mainData.IsUSRegionTax || mainData.Country == "United States") {
                templateObject.isChkUSRegionTax.set(true);
                $(".btnSubTaxes").show();
                $(".btnTaxSummary").show();
                $("#edtTaxRate").prop("disabled", true);
            } else {
                $(".btnSubTaxes").hide();
                $(".btnTaxSummary").hide();
                $("#edtTaxRate").prop("disabled", false);
            }
            templateObject.getTaxRates();
        });
    }

    templateObject.chkSubTaxRateSetting();

    templateObject.getSubTaxCodes = function() {

        let subTaxTableList = [];

        getVS1Data('TSubTaxVS1').then(function(dataObject) {
            if (dataObject.length == 0) {
                taxRateService.getSubTaxCode().then(function(data) {
                    for (let i = 0; i < data.tsubtaxcode.length; i++) {
                        var dataList = {
                            id: data.tsubtaxcode[i].Id || '',
                            codename: data.tsubtaxcode[i].Code || '-',
                            description: data.tsubtaxcode[i].Description || '-',
                            category: data.tsubtaxcode[i].Category || '-'
                        };

                        subTaxTableList.push(dataList);
                    }

                    templateObject.subtaxcodes.set(subTaxTableList);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tsubtaxcode;
                for (let i = 0; i < useData.length; i++) {
                    var dataList = {
                        id: useData[i].Id || '',
                        codename: useData[i].Code || '-',
                        description: useData[i].Description || '-',
                        category: useData[i].Category || '-'
                    };

                    subTaxTableList.push(dataList);
                }

                templateObject.subtaxcodes.set(subTaxTableList);
            }
        }).catch(function(err) {
            taxRateService.getSubTaxCode().then(function(data) {
                for (let i = 0; i < data.tsubtaxcode.length; i++) {
                    var dataList = {
                        id: data.tsubtaxcode[i].Id || '',
                        codename: data.tsubtaxcode[i].Code || '-',
                        description: data.tsubtaxcode[i].Description || '-',
                        category: data.tsubtaxcode[i].Category || '-'
                    };

                    subTaxTableList.push(dataList);
                }

                templateObject.subtaxcodes.set(subTaxTableList);
            });

        });
    }

    templateObject.getSubTaxCodes();

    $(document).on('click', '.table-remove', function() {
        event.stopPropagation();
        var targetID = $(event.target).closest('tr').attr('id'); // table row ID
        $('#selectDeleteLineID').val(targetID);
        $('#deleteLineModal').modal('toggle');
    });

    $('#taxRatesList tbody').on('click', 'tr .colName, tr .colDescription, tr .colRate', function() {
        var listData = $(this).closest('tr').attr('id');

        if (listData) {
            $('#add-tax-title').text('Edit Tax Rate');
            $('#edtTaxName').prop('readonly', true);
            if (listData !== '') {
                listData = Number(listData);
                //taxRateService.getOneTaxRate(listData).then(function (data) {

                var taxid = listData || '';
                let tax = templateObject.datatablerecords.get().find((v) => String(v.id) === String(taxid));

                // var taxname = tr.find(".colName").text() || "";
                // var taxDesc = tr.find(".colDescription").text() || "";
                // var taxRate = tr.find(".colRate").text().replace("%", "") || "0";
                //data.fields.Rate || '';

                $("#edtTaxID").val(tax.id);
                $("#edtTaxName").val(tax.codename);

                $("#edtTaxRate").val(String(tax.rate).replace("%", ""));
                $("#edtTaxDesc").val(tax.description);

                let subTaxLines = tax.lines.map((v, index) => ({
                    RowId: `subtax_${index}`,
                    SubTaxCode: v.SubTaxCode,
                    Percentage: v.Percentage,
                    PercentageOn: v.PercentageOn,
                    CapAmount: v.CapAmount,
                    ThresholdAmount: v.ThresholdAmount,
                    Description: v.Description
                }));
                templateObject.subtaxlines.set(subTaxLines);

                //});

                $("#addNewTaxRate").modal("toggle");
            }
        }
    });

});

Template.taxRatesSettings.events({
    "click #btnNewInvoice": function(event) {
        // FlowRouter.go('/invoicecard');
    },
    "click .chkDatatable": function(event) {
        var columns = $("#taxRatesList th");
        let columnDataValue = $(event.target)
            .closest("div")
            .find(".divcolumn")
            .text();

        $.each(columns, function(i, v) {
            let className = v.classList;
            let replaceClass = className[1];

            if (v.innerText == columnDataValue) {
                if ($(event.target).is(":checked")) {
                    $("." + replaceClass + "").css("display", "table-cell");
                    $("." + replaceClass + "").css("padding", ".75rem");
                    $("." + replaceClass + "").css("vertical-align", "top");
                } else {
                    $("." + replaceClass + "").css("display", "none");
                }
            }
        });
    },
    "click .resetTable": function(event) {
        var getcurrentCloudDetails = CloudUser.findOne({
            _id: Session.get("mycloudLogonID"),
            clouddatabaseID: Session.get("mycloudLogonDBID"),
        });
        if (getcurrentCloudDetails) {
            if (getcurrentCloudDetails._id.length > 0) {
                var clientID = getcurrentCloudDetails._id;
                var clientUsername = getcurrentCloudDetails.cloudUsername;
                var clientEmail = getcurrentCloudDetails.cloudEmail;
                var checkPrefDetails = CloudPreference.findOne({
                    userid: clientID,
                    PrefName: "taxRatesList",
                });
                if (checkPrefDetails) {
                    CloudPreference.remove({ _id: checkPrefDetails._id },
                        function(err, idTag) {
                            if (err) {} else {
                                Meteor._reload.reload();
                            }
                        }
                    );
                }
            }
        }
    },
    "click .saveTable": function(event) {
        let lineItems = [];
        $(".columnSettings").each(function(index) {
            var $tblrow = $(this);
            var colTitle = $tblrow.find(".divcolumn").text() || "";
            var colWidth = $tblrow.find(".custom-range").val() || 0;
            var colthClass = $tblrow.find(".divcolumn").attr("valueupdate") || "";
            var colHidden = false;
            if ($tblrow.find(".custom-control-input").is(":checked")) {
                colHidden = false;
            } else {
                colHidden = true;
            }
            let lineItemObj = {
                index: index,
                label: colTitle,
                hidden: colHidden,
                width: colWidth,
                thclass: colthClass,
            };

            lineItems.push(lineItemObj);
        });

        var getcurrentCloudDetails = CloudUser.findOne({
            _id: Session.get("mycloudLogonID"),
            clouddatabaseID: Session.get("mycloudLogonDBID"),
        });
        if (getcurrentCloudDetails) {
            if (getcurrentCloudDetails._id.length > 0) {
                var clientID = getcurrentCloudDetails._id;
                var clientUsername = getcurrentCloudDetails.cloudUsername;
                var clientEmail = getcurrentCloudDetails.cloudEmail;
                var checkPrefDetails = CloudPreference.findOne({
                    userid: clientID,
                    PrefName: "taxRatesList",
                });
                if (checkPrefDetails) {
                    CloudPreference.update({ _id: checkPrefDetails._id }, {
                            $set: {
                                userid: clientID,
                                username: clientUsername,
                                useremail: clientEmail,
                                PrefGroup: "salesform",
                                PrefName: "taxRatesList",
                                published: true,
                                customFields: lineItems,
                                updatedAt: new Date(),
                            },
                        },
                        function(err, idTag) {
                            if (err) {
                                $("#myModal2").modal("toggle");
                            } else {
                                $("#myModal2").modal("toggle");
                            }
                        }
                    );
                } else {
                    CloudPreference.insert({
                            userid: clientID,
                            username: clientUsername,
                            useremail: clientEmail,
                            PrefGroup: "salesform",
                            PrefName: "taxRatesList",
                            published: true,
                            customFields: lineItems,
                            createdAt: new Date(),
                        },
                        function(err, idTag) {
                            if (err) {
                                $("#myModal2").modal("toggle");
                            } else {
                                $("#myModal2").modal("toggle");
                            }
                        }
                    );
                }
            }
        }
    },
    "blur .divcolumn": function(event) {
        let columData = $(event.target).text();

        let columnDatanIndex = $(event.target)
            .closest("div.columnSettings")
            .attr("id");
        var datable = $("#taxRatesList").DataTable();
        var title = datable.column(columnDatanIndex).header();
        $(title).html(columData);
    },
    "change .rngRange": function(event) {
        let range = $(event.target).val();
        $(event.target)
            .closest("div.divColWidth")
            .find(".spWidth")
            .html(range + "px");

        let columData = $(event.target)
            .closest("div.divColWidth")
            .find(".spWidth")
            .attr("value");
        let columnDataValue = $(event.target)
            .closest("div")
            .prev()
            .find(".divcolumn")
            .text();
        var datable = $("#taxRatesList th");
        $.each(datable, function(i, v) {
            if (v.innerText == columnDataValue) {
                let className = v.className;
                let replaceClass = className.replace(/ /g, ".");
                $("." + replaceClass + "").css("width", range + "px");
            }
        });
    },
    "click .btnOpenSettings": function(event) {
        let templateObject = Template.instance();
        var columns = $("#taxRatesList th");

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
            if (v.className.includes("hiddenColumn")) {
                columVisible = false;
            }
            sWidth = v.style.width.replace("px", "");

            let datatablerecordObj = {
                sTitle: v.innerText || "",
                sWidth: sWidth || "",
                sIndex: v.cellIndex || "",
                sVisible: columVisible || false,
                sClass: v.className || "",
            };
            tableHeaderList.push(datatablerecordObj);
        });
        templateObject.tableheaderrecords.set(tableHeaderList);
    },
    "click #exportbtn": function() {
        $(".fullScreenSpin").css("display", "inline-block");
        jQuery("#taxRatesList_wrapper .dt-buttons .btntabletocsv").click();
        $(".fullScreenSpin").css("display", "none");
    },
    "click .btnRefresh": function() {
        $(".fullScreenSpin").css("display", "inline-block");
        sideBarService
            .getTaxRateVS1()
            .then(function(dataReload) {
                addVS1Data("TTaxcodeVS1", JSON.stringify(dataReload))
                    .then(function(datareturn) {
                        location.reload(true);
                    })
                    .catch(function(err) {
                        location.reload(true);
                    });
            })
            .catch(function(err) {
                location.reload(true);
            });
    },
    "click .btnSaveDefaultTax": function() {
        playSaveAudio();
        setTimeout(function() {
            let purchasetaxcode = $("input[name=optradioP]:checked").val() || "";
            let salestaxcode = $("input[name=optradioS]:checked").val() || "";

            Session.setPersistent("ERPTaxCodePurchaseInc", purchasetaxcode || "");
            Session.setPersistent("ERPTaxCodeSalesInc", salestaxcode || "");
            getVS1Data("vscloudlogininfo").then(function(dataObject) {
                if (dataObject.length == 0) {
                    swal({
                        title: "Default Tax Rate Successfully Changed",
                        text: "",
                        type: "success",
                        showCancelButton: false,
                        confirmButtonText: "OK",
                    }).then((result) => {
                        if (result.value) {
                            Meteor._reload.reload();
                        } else {
                            Meteor._reload.reload();
                        }
                    });
                } else {
                    let loginDataArray = [];
                    if (
                        dataObject[0].EmployeeEmail === localStorage.getItem("mySession")
                    ) {
                        loginDataArray = dataObject[0].data;

                        loginDataArray.ProcessLog.ClientDetails.ProcessLog.TUser.TVS1_Dashboard_summary.fields.RegionalOptions_TaxCodePurchaseInc = purchasetaxcode;
                        loginDataArray.ProcessLog.ClientDetails.ProcessLog.TUser.TVS1_Dashboard_summary.fields.RegionalOptions_TaxCodeSalesInc = salestaxcode;
                        addLoginData(loginDataArray).then(function(datareturnCheck) {
                                swal({
                                    title: "Default Tax Rate Successfully Changed",
                                    text: "",
                                    type: "success",
                                    showCancelButton: false,
                                    confirmButtonText: "OK",
                                }).then((result) => {
                                    if (result.value) {
                                        Meteor._reload.reload();
                                    } else {
                                        Meteor._reload.reload();
                                    }
                                });
                            })
                            .catch(function(err) {
                                swal({
                                    title: "Default Tax Rate Successfully Changed",
                                    text: "",
                                    type: "success",
                                    showCancelButton: false,
                                    confirmButtonText: "OK",
                                }).then((result) => {
                                    if (result.value) {
                                        Meteor._reload.reload();
                                    } else {
                                        Meteor._reload.reload();
                                    }
                                });
                            });
                    } else {
                        swal({
                            title: "Default Tax Rate Successfully Changed",
                            text: "",
                            type: "success",
                            showCancelButton: false,
                            confirmButtonText: "OK",
                        }).then((result) => {
                            if (result.value) {
                                Meteor._reload.reload();
                            } else {
                                Meteor._reload.reload();
                            }
                        });
                    }
                }
            }).catch(function(err) {
                swal({
                    title: "Default Tax Rate Successfully Changed",
                    text: "",
                    type: "success",
                    showCancelButton: false,
                    confirmButtonText: "OK",
                }).then((result) => {
                    if (result.value) {
                        Meteor._reload.reload();
                    } else {
                        Meteor._reload.reload();
                    }
                });
            });
        }, delayTimeAfterSound);
    },
    "keydown #edtTaxRate": numberInputValidate,
    "keydown #subTaxPercent": numberInputValidate,
    "keydown #subTaxCapAmt": numberInputValidate,
    "keydown #subTaxThresholdAmt": numberInputValidate,
    "click .btnNewSubTax": function() {
        $("#edtSubTaxLineId").val('');
        $('#subTaxCode').val('');
        $('#subTaxPercent').val('');
        $('#subTaxPercentageOn').prop('readonly', false);
        $('#subTaxCapAmt').val('0');
        $('#subTaxThresholdAmt').val('0');
        $('#add-subtax-title').text('Add Sub Tax');
    },
    "click .btnSaveSubTax": function() {
        playSaveAudio();
        let templateObject = Template.instance();
        setTimeout(function() {

            let edtSubTaxLineId = $("#edtSubTaxLineId").val();
            let subTaxId = $('#subTaxCode').val();
            let subTaxCodes = templateObject.subtaxcodes.get();
            let subTaxCode = subTaxCodes.find((v) => String(v.codename) === String(subTaxId));

            let subTaxPercent = parseFloat($('#subTaxPercent').val());
            let subTaxPercentageOn = $('#subTaxPercentageOn').val();
            let subTaxCapAmt = parseFloat($('#subTaxCapAmt').val());
            let subTaxThresholdAmt = parseFloat($('#subTaxThresholdAmt').val());

            let subTaxLines = templateObject.subtaxlines.get();

            if (edtSubTaxLineId == '') {
                let newSubTaxLine = {
                    RowId: `subtax_${subTaxLines.length}`,
                    SubTaxCode: subTaxCode.codename,
                    Percentage: subTaxPercent,
                    PercentageOn: subTaxPercentageOn,
                    CapAmount: subTaxCapAmt,
                    ThresholdAmount: subTaxThresholdAmt,
                    Description: subTaxCode.description
                };

                subTaxLines.push(newSubTaxLine);
                templateObject.subtaxlines.set(subTaxLines);
            } else {
                subTaxLines = subTaxLines.map((v) => v.RowId === edtSubTaxLineId ? ({
                    RowId: v.RowId,
                    Id: v.Id,
                    ID: v.ID,
                    SubTaxCode: subTaxCode.codename,
                    Percentage: subTaxPercent,
                    PercentageOn: subTaxPercentageOn,
                    CapAmount: subTaxCapAmt,
                    ThresholdAmount: subTaxThresholdAmt,
                    Description: subTaxCode.description
                }) : v);

                templateObject.subtaxlines.set(subTaxLines);
            }

            let taxPercent = 0;
            subTaxLines.map((v) => taxPercent += v.Percentage);
            $('#edtTaxRate').val(Math.min(taxPercent, 100));

            $('#addSubTaxModal').modal('hide');
        }, delayTimeAfterSound);
    },
    'click .btnSaveTaxRate': function() {
        playSaveAudio();
        let templateObject = Template.instance();
        let taxRateService = new TaxRateService();
        setTimeout(function() {
            $('.fullScreenSpin').css('display', 'inline-block');
            let taxtID = $('#edtTaxID').val();
            let taxName = $('#edtTaxName').val();
            let taxDesc = $('#edtTaxDesc').val();
            let taxRate = parseFloat($('#edtTaxRate').val() / 100);
            let objDetails = '';
            if (taxName === '') {
                Bert.alert('<strong>WARNING:</strong> Tax Rate cannot be blank!', 'warning');
                $('.fullScreenSpin').css('display', 'none');
                e.preventDefault();
            }

            let lines = templateObject.subtaxlines.get().map((v) => {
                return {
                    type: "TTaxCodeLines",
                    fields: {
                        ID: v.ID,
                        Id: v.Id,
                        SubTaxCode: v.SubTaxCode,
                        Percentage: v.Percentage,
                        PercentageOn: v.PercentageOn,
                        CapAmount: v.CapAmount,
                        ThresholdAmount: v.ThresholdAmount,
                        // Description: v.Description
                    }
                }
            });
            if (taxtID == "") {
                taxRateService.checkTaxRateByName(taxName).then(function(data) {
                        taxtID = data.ttaxcode[0].Id;
                        let objDetails = {
                            type: "TTaxcode",
                            fields: {
                                ID: parseInt(taxtID),
                                Active: true,
                                // CodeName: taxName,
                                Description: taxDesc,
                                Rate: taxRate,
                                PublishOnVS1: true,
                            },
                        };
                        if (templateObject.isChkUSRegionTax.get()) {
                            objDetails.fields.Lines = lines;
                        }
                        taxRateService
                            .saveTaxRate(objDetails)
                            .then(function(objDetails) {
                                sideBarService
                                    .getTaxRateVS1()
                                    .then(function(dataReload) {
                                        addVS1Data("TTaxcodeVS1", JSON.stringify(dataReload))
                                            .then(function(datareturn) {
                                                Meteor._reload.reload();
                                            })
                                            .catch(function(err) {
                                                Meteor._reload.reload();
                                            });
                                    })
                                    .catch(function(err) {
                                        Meteor._reload.reload();
                                    });
                            })
                            .catch(function(err) {
                                swal({
                                    title: "Oooops...",
                                    text: err,
                                    type: "error",
                                    showCancelButton: false,
                                    confirmButtonText: "Try Again",
                                }).then((result) => {
                                    if (result.value) {
                                        Meteor._reload.reload();
                                    } else if (result.dismiss === "cancel") {}
                                });
                                $(".fullScreenSpin").css("display", "none");
                            });
                    })
                    .catch(function(err) {
                        let objDetails = {
                            type: "TTaxcode",
                            fields: {
                                // Id: taxCodeId,
                                Active: true,
                                CodeName: taxName,
                                Description: taxDesc,
                                Rate: taxRate,
                                PublishOnVS1: true,
                            },
                        };
                        if (templateObject.isChkUSRegionTax.get()) {
                            objDetails.fields.Lines = lines;
                        }

                        taxRateService
                            .saveTaxRate(objDetails)
                            .then(function(objDetails) {
                                sideBarService
                                    .getTaxRateVS1()
                                    .then(function(dataReload) {
                                        addVS1Data("TTaxcodeVS1", JSON.stringify(dataReload))
                                            .then(function(datareturn) {
                                                Meteor._reload.reload();
                                            })
                                            .catch(function(err) {
                                                Meteor._reload.reload();
                                            });
                                    })
                                    .catch(function(err) {
                                        Meteor._reload.reload();
                                    });
                            })
                            .catch(function(err) {
                                swal({
                                    title: "Oooops...",
                                    text: err,
                                    type: "error",
                                    showCancelButton: false,
                                    confirmButtonText: "Try Again",
                                }).then((result) => {
                                    if (result.value) {
                                        Meteor._reload.reload();
                                    } else if (result.dismiss === "cancel") {}
                                });
                                $(".fullScreenSpin").css("display", "none");
                            });
                    });
            } else {
                let objDetails = {
                    type: "TTaxcode",
                    fields: {
                        ID: parseInt(taxtID),
                        Active: true,
                        CodeName: taxName,
                        Description: taxDesc,
                        Rate: taxRate,
                        PublishOnVS1: true,
                    },
                };
                if (templateObject.isChkUSRegionTax.get()) {
                    objDetails.fields.Lines = lines;
                }

                taxRateService
                    .saveTaxRate(objDetails)
                    .then(function(objDetails) {
                        sideBarService
                            .getTaxRateVS1()
                            .then(function(dataReload) {
                                addVS1Data("TTaxcodeVS1", JSON.stringify(dataReload))
                                    .then(function(datareturn) {
                                        Meteor._reload.reload();
                                    })
                                    .catch(function(err) {
                                        Meteor._reload.reload();
                                    });
                            })
                            .catch(function(err) {
                                Meteor._reload.reload();
                            });
                    })
                    .catch(function(err) {
                        swal({
                            title: "Oooops...",
                            text: err,
                            type: "error",
                            showCancelButton: false,
                            confirmButtonText: "Try Again",
                        }).then((result) => {
                            if (result.value) {
                                Meteor._reload.reload();
                            } else if (result.dismiss === "cancel") {}
                        });
                        $(".fullScreenSpin").css("display", "none");
                    });
                $('.fullScreenSpin').css('display', 'none');

            }
        }, delayTimeAfterSound);
    },
    'click .btnAddTaxRate': function() {
        $('#add-tax-title').text('Add New Tax Rate');
        $('#edtTaxID').val('');
        $('#edtTaxName').val('S');
        $('#edtTaxName').prop('readonly', false);
        $('#edtTaxRate').val('4');
        $('#edtTaxDesc').val('Sales Tax Default');
        let templateObject = Template.instance();

        if (templateObject.isChkUSRegionTax.get()) {
            let newSubTaxLines = [{
                RowId: `subtax_0`,
                SubTaxCode: 'STRT',
                Percentage: 1,
                PercentageOn: 'Selling Price',
                CapAmount: 0,
                ThresholdAmount: 0,
                Description: ''
            }, {
                RowId: `subtax_1`,
                SubTaxCode: 'CTRT',
                Percentage: 1,
                PercentageOn: 'Selling Price',
                CapAmount: 0,
                ThresholdAmount: 0,
                Description: ''
            }, {
                RowId: `subtax_2`,
                SubTaxCode: 'SPRT',
                Percentage: 1,
                PercentageOn: 'Selling Price',
                CapAmount: 0,
                ThresholdAmount: 0,
                Description: ''
            }, {
                RowId: `subtax_3`,
                SubTaxCode: 'CONRT',
                Percentage: 1,
                PercentageOn: 'Selling Price',
                CapAmount: 0,
                ThresholdAmount: 0,
                Description: ''
            }];
            templateObject.subtaxlines.set(newSubTaxLines);
        } else {
            templateObject.subtaxlines.set([]);
        }

    },
    "click #subTaxList td.clickable": (e) => SubTaxEditListener(e),
    "click #subTaxList .table-remove": (e) => {
        e.stopPropagation();
        const targetID = $(e.target).closest("tr").attr("id"); // table row ID
        let templateObject = Template.instance();
        let subTaxLines = templateObject.subtaxlines.get();
        subTaxLines = subTaxLines.filter((v) => v.RowId !== targetID);
        templateObject.subtaxlines.set(subTaxLines);
        let taxPercent = 0;
        subTaxLines.map((v) => taxPercent += v.Percentage);
        $('#edtTaxRate').val(Math.min(taxPercent, 100));
    },
    'click .btnSubTaxes': function() {
        FlowRouter.go('/subtaxsettings');
    },
    'click .btnTaxSummary': function() {
        FlowRouter.go('/taxsummaryreport');
    },
    'click .btnInactiveTax': function() {
        let requestFlag = true;
        let btnStr = $(".btnInactiveTax").text();
        if (btnStr == "Inactive Tax Codes") {
            $(".btnInactiveTax").text("Active Tax Codes");
            requestFlag = false;
            localStorage.setItem("inactiveFlag", false);
        } else if (btnStr == "Active Tax Codes") {
            $(".btnInactiveTax").text("Inactive Tax Codes");
            requestFlag = true;
            localStorage.setItem("inactiveFlag", true);
        }

        let taxRateService = new TaxRateService();
        taxRateService.getTaxRateVS1("", requestFlag)
        .then(function(dataReload) {
            addVS1Data("TTaxcodeVS1", JSON.stringify(dataReload))
                .then(function(datareturn) {
                    location.reload(true);
                })
                .catch(function(err) {
                    location.reload(true);
                });
        })
        .catch(function(err) {
            console.error("err", err);
            // location.reload(true);
        });
    },
    'click .btnDeleteTaxRate': function() {
        playDeleteAudio();
        let taxRateService = new TaxRateService();
        setTimeout(function() {
            let taxCodeId = $('#selectDeleteLineID').val();

            let objDetails = {
                type: "TTaxcode",
                fields: {
                    Id: parseInt(taxCodeId),
                    Active: false
                }
            };

            taxRateService
                .saveTaxRate(objDetails)
                .then(function(objDetails) {
                    sideBarService
                        .getTaxRateVS1()
                        .then(function(dataReload) {
                            addVS1Data("TTaxcodeVS1", JSON.stringify(dataReload))
                                .then(function(datareturn) {
                                    Meteor._reload.reload();
                                })
                                .catch(function(err) {
                                    Meteor._reload.reload();
                                });
                        })
                        .catch(function(err) {
                            Meteor._reload.reload();
                        });
                })
                .catch(function(err) {
                    swal({
                        title: "Oooops...",
                        text: err,
                        type: "error",
                        showCancelButton: false,
                        confirmButtonText: "Try Again",
                    }).then((result) => {
                        if (result.value) {
                            Meteor._reload.reload();
                        } else if (result.dismiss === "cancel") {}
                    });
                    $(".fullScreenSpin").css("display", "none");
                });
        }, delayTimeAfterSound);
    },
    "click .btnBack": function(event) {
        playCancelAudio();
        event.preventDefault();
        setTimeout(function() {
            history.back(1);
        }, delayTimeAfterSound);
    },
    "click #taxRatesList td.clickable": (e) => TaxRatesEditListener(e),
    "click #taxRatesList .table-remove": (e) => {
        e.stopPropagation();
        const targetID = $(e.target).closest("tr").attr("id"); // table row ID
        $("#selectDeleteLineID").val(targetID);
        $("#deleteLineModal").modal("toggle");
    },
    'click .btnBack': function(event) {
        playCancelAudio();
        event.preventDefault();
        setTimeout(function() {
            history.back(1);
        }, delayTimeAfterSound);
    }
});

Template.taxRatesSettings.helpers({
    datatablerecords: () => {
        return Template.instance()
            .datatablerecords.get()
            .sort(function(a, b) {
                if (a.codename == "NA") {
                    return 1;
                } else if (b.codename == "NA") {
                    return -1;
                }
                return a.codename.toUpperCase() > b.codename.toUpperCase() ? 1 : -1;
                // return (a.saledate.toUpperCase() < b.saledate.toUpperCase()) ? 1 : -1;
            });
    },
    subtaxcodes: () => {
        return Template.instance().subtaxcodes.get();
    },
    subtaxlines: () => {
        return Template.instance().subtaxlines.get();
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    salesCloudPreferenceRec: () => {
        return CloudPreference.findOne({ userid: Session.get('mycloudLogonID'), PrefName: 'taxRatesList' });
    },
    defaultpurchasetaxcode: () => {
        return Template.instance().defaultpurchasetaxcode.get();
    },
    defaultsaletaxcode: () => {
        return Template.instance().defaultsaletaxcode.get();
    },
    loggedCompany: () => {
        return localStorage.getItem('mySession') || '';
    },
    isChkUSRegionTax: () => {
        return Template.instance().isChkUSRegionTax.get();
    },
});

Template.registerHelper('equals', function(a, b) {
    return a === b;
});

export const TaxRatesEditListener = (e) => {
    if (!e) return false;

    const templateObject = Template.instance();

    const tr = $(e.currentTarget).parent();
    var listData = tr.attr("id");
    // var tabletaxtcode = $(event.target).closest("tr").find(".colTaxCode").text();
    // var accountName = $(event.target).closest("tr").find(".colAccountName").text();
    // let columnBalClass = $(event.target).attr('class');
    // let accountService = new AccountService();
    if (listData) {
        $("#add-tax-title").text("Edit Tax Rate");
        $("#edtTaxName").prop("readonly", true);
        if (listData !== "") {
            listData = Number(listData);
            //taxRateService.getOneTaxRate(listData).then(function (data) {

            var taxid = listData || "";
            let tax = templateObject.datatablerecords.get().find((v) => String(v.id) === String(taxid));

            // var taxname = tr.find(".colName").text() || "";
            // var taxDesc = tr.find(".colDescription").text() || "";
            // var taxRate = tr.find(".colRate").text().replace("%", "") || "0";
            //data.fields.Rate || '';

            $("#edtTaxID").val(tax.id);
            $("#edtTaxName").val(tax.codename);

            $("#edtTaxRate").val(String(tax.rate).replace("%", ""));
            $("#edtTaxDesc").val(tax.description);

            let subTaxLines = tax.lines.map((v, index) => ({
                RowId: `subtax_${index}`,
                ID: v.ID,
                SubTaxCode: v.SubTaxCode,
                Percentage: v.Percentage,
                PercentageOn: v.PercentageOn,
                CapAmount: v.CapAmount,
                ThresholdAmount: v.ThresholdAmount,
                Description: v.Description
            }));
            templateObject.subtaxlines.set(subTaxLines);

            $("#addNewTaxRate").modal("toggle");
        }
    }
};

export const SubTaxEditListener = (e) => {
    if (!e) return false;

    const templateObject = Template.instance();

    const tr = $(e.currentTarget).parent();
    let lineId = tr.attr("id");

    if (lineId) {
        $("#add-subtax-title").text("Edit Sub Tax");
        $("#edtTaxName").prop("readonly", true);
        if (lineId !== "") {
            var subTaxLineId = lineId || "";
            let subTax = templateObject.subtaxlines.get().find((v) => String(v.RowId) === String(subTaxLineId));

            $("#edtSubTaxLineId").val(subTaxLineId);
            $("#subTaxCode").val(subTax.SubTaxCode);
            $("#subTaxPercent").val(subTax.Percentage);
            $("#subTaxPercentageOn").val(subTax.PercentageOn);
            $("#subTaxCapAmt").val(subTax.CapAmount);
            $("#subTaxThresholdAmt").val(subTax.ThresholdAmount);

            $("#addSubTaxModal").modal("toggle");
        }
    }
};