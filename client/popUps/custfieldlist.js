import {
    TaxRateService
} from "../settings/settings-service";
import {
    ReactiveVar
} from 'meteor/reactive-var';
import {
    SideBarService
} from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
let sideBarService = new SideBarService();
Template.custfieldlist.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);

    templateObject.deptrecords = new ReactiveVar();

    templateObject.include7Days = new ReactiveVar();
    templateObject.include7Days.set(false);
    templateObject.include30Days = new ReactiveVar();
    templateObject.include30Days.set(false);
    templateObject.includeCOD = new ReactiveVar();
    templateObject.includeCOD.set(false);
    templateObject.includeEOM = new ReactiveVar();
    templateObject.includeEOM.set(false);
    templateObject.includeEOMPlus = new ReactiveVar();
    templateObject.includeEOMPlus.set(false);

    templateObject.includeSalesDefault = new ReactiveVar();
    templateObject.includeSalesDefault.set(false);
    templateObject.includePurchaseDefault = new ReactiveVar();
    templateObject.includePurchaseDefault.set(false);

});

Template.custfieldlist.onRendered(function() {
    let templateObject = Template.instance();
    let taxRateService = new TaxRateService();
    const dataTableList = [];
    const tableHeaderList = [];
    const deptrecords = [];
    let deptprodlineItems = [];
    Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblStatusPopList1', function(error, result) {
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

    templateObject.getSalesCustomFieldsList = function() {
        getVS1Data('TCustomFieldList').then(function(dataObject) {
            if (dataObject.length == 0) {
                sideBarService.getAllCustomFields().then(function(data) {
                  addVS1Data('TCustomFieldList', JSON.stringify(data));
                    let lineItems = [];
                    let lineItemObj = {};
                    let setISCOD = false;
                    for (let i = 0; i < data.tcustomfieldlist.length; i++) {
                        // let taxRate = (data.tdeptclass[i].fields.Rate * 100).toFixed(2) + '%';
                        var dataList = {
                            id: data.tcustomfieldlist[i].fields.ID || '',
                            typename: data.tcustomfieldlist[i].fields.Description || '',
                            description: data.tcustomfieldlist[i].Description
                        };

                        dataTableList.push(dataList);
                        //}
                    }


                    templateObject.datatablerecords.set(dataTableList);

                    if (templateObject.datatablerecords.get()) {

                        // Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblStatusPopList1', function(error, result) {
                        //     if (error) {

                        //     } else {
                        //         if (result) {
                        //             for (let i = 0; i < result.customFields.length; i++) {
                        //                 let customcolumn = result.customFields;
                        //                 let columData = customcolumn[i].label;
                        //                 let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                        //                 let hiddenColumn = customcolumn[i].hidden;
                        //                 let columnClass = columHeaderUpdate.split('.')[1];
                        //                 let columnWidth = customcolumn[i].width;
                        //                 let columnindex = customcolumn[i].index + 1;

                        //                 if (hiddenColumn == true) {

                        //                     $("." + columnClass + "").addClass('hiddenColumn');
                        //                     $("." + columnClass + "").removeClass('showColumn');
                        //                 } else if (hiddenColumn == false) {
                        //                     $("." + columnClass + "").removeClass('hiddenColumn');
                        //                     $("." + columnClass + "").addClass('showColumn');
                        //                 }

                        //             }
                        //         }

                        //     }
                        // });


                        // setTimeout(function() {
                        //     MakeNegative();
                        // }, 100);
                    }

                    $('.fullScreenSpin').css('display', 'none');
                    setTimeout(function() {
                        $('#tblStatusPopList1').DataTable({
                            columnDefs: [{
                                "orderable": false,
                                "targets": -1
                            }],
                            select: true,
                            destroy: true,
                            colReorder: true,
                            "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                            buttons: [{
                                    extend: 'csvHtml5',
                                    text: '',
                                    download: 'open',
                                    className: "btntabletocsv hiddenColumn",
                                    filename: "tblStatusPopList1_" + moment().format(),
                                    orientation: 'portrait',
                                    exportOptions: {
                                        columns: ':visible'
                                    }
                                }, {
                                    extend: 'print',
                                    download: 'open',
                                    className: "btntabletopdf hiddenColumn",
                                    text: '',
                                    title: 'Term List',
                                    filename: "tblStatusPopList1_" + moment().format(),
                                    exportOptions: {
                                        columns: ':visible'
                                    }
                                },
                                {
                                    extend: 'excelHtml5',
                                    title: '',
                                    download: 'open',
                                    className: "btntabletoexcel hiddenColumn",
                                    filename: "tblStatusPopList1_" + moment().format(),
                                    orientation: 'portrait',
                                    exportOptions: {
                                        columns: ':visible'
                                    }
                                    // ,
                                    // customize: function ( win ) {
                                    //   $(win.document.body).children("h1:first").remove();
                                    // }

                                }
                            ],
                            // bStateSave: true,
                            // rowId: 0,
                            paging: false,
                            // "scrollY": "400px",
                            // "scrollCollapse": true,
                            info: true,
                            responsive: true,
                            "order": [
                                [0, "asc"]
                            ],
                            // "aaSorting": [[1,'desc']],
                            action: function() {
                                $('#tblStatusPopList1').DataTable().ajax.reload();
                            },
                            "fnDrawCallback": function(oSettings) {
                                setTimeout(function() {
                                    MakeNegative();
                                }, 100);
                            },
                            "fnInitComplete": function () {
                                $("<button class='btn btn-primary btnAddNewStatus' data-dismiss='modal' data-toggle='modal' data-target='#newCustomFieldPop' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblStatusPopList1_filter");
                                $("<button class='btn btn-primary btnRefreshStatus' type='button' id='btnRefreshStatus' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblStatusPopList1_filter");
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
                        $('.fullScreenSpin').css('display', 'none');
                    }, 10);


                    // var columns = $('#tblStatusPopList1 th');
                    // let sTible = "";
                    // let sWidth = "";
                    // let sIndex = "";
                    // let sVisible = "";
                    // let columVisible = false;
                    // let sClass = "";
                    // $.each(columns, function(i, v) {
                    //     if (v.hidden == false) {
                    //         columVisible = true;
                    //     }
                    //     if ((v.className.includes("hiddenColumn"))) {
                    //         columVisible = false;
                    //     }
                    //     sWidth = v.style.width.replace('px', "");

                    //     let datatablerecordObj = {
                    //         sTitle: v.innerText || '',
                    //         sWidth: sWidth || '',
                    //         sIndex: v.cellIndex || '',
                    //         sVisible: columVisible || false,
                    //         sClass: v.className || ''
                    //     };
                    //     tableHeaderList.push(datatablerecordObj);
                    // });
                    // templateObject.tableheaderrecords.set(tableHeaderList);
                    // $('div.dataTables_filter input').addClass('form-control form-control-sm');

                }).catch(function(err) {
                    // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                    $('.fullScreenSpin').css('display', 'none');
                    // Meteor._reload.reload();
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tleadstatustype;
                let lineItems = [];
                let lineItemObj = {};
                let setISCOD = false;
                for (let i = 0; i < useData.length; i++) {
                    // let taxRate = (data.tdeptclass[i].fields.Rate * 100).toFixed(2) + '%';
                    var dataList = {
                        id: data.tcustomfieldlist[i].fields.ID || '',
                        typename: data.tcustomfieldlist[i].fields.Description || '',
                        description: data.tcustomfieldlist[i].Description
                    };

                    dataTableList.push(dataList);
                    //}
                }


                templateObject.datatablerecords.set(dataTableList);

                if (templateObject.datatablerecords.get()) {

                    // Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblStatusPopList1', function(error, result) {
                    //     if (error) {

                    //     } else {
                    //         if (result) {
                    //             for (let i = 0; i < result.customFields.length; i++) {
                    //                 let customcolumn = result.customFields;
                    //                 let columData = customcolumn[i].label;
                    //                 let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                    //                 let hiddenColumn = customcolumn[i].hidden;
                    //                 let columnClass = columHeaderUpdate.split('.')[1];
                    //                 let columnWidth = customcolumn[i].width;
                    //                 let columnindex = customcolumn[i].index + 1;

                    //                 if (hiddenColumn == true) {

                    //                     $("." + columnClass + "").addClass('hiddenColumn');
                    //                     $("." + columnClass + "").removeClass('showColumn');
                    //                 } else if (hiddenColumn == false) {
                    //                     $("." + columnClass + "").removeClass('hiddenColumn');
                    //                     $("." + columnClass + "").addClass('showColumn');
                    //                 }

                    //             }
                    //         }

                    //     }
                    // });


                    // setTimeout(function() {
                    //     MakeNegative();
                    // }, 100);
                }

                $('.fullScreenSpin').css('display', 'none');
                setTimeout(function() {
                    $('#tblStatusPopList1').DataTable({
                        columnDefs: [{
                            "orderable": false,
                            "targets": -1
                        }],
                        select: true,
                        destroy: true,
                        colReorder: true,
                        "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        buttons: [{
                                extend: 'csvHtml5',
                                text: '',
                                download: 'open',
                                className: "btntabletocsv hiddenColumn",
                                filename: "tblStatusPopList1_" + moment().format(),
                                orientation: 'portrait',
                                exportOptions: {
                                    columns: ':visible'
                                }
                            }, {
                                extend: 'print',
                                download: 'open',
                                className: "btntabletopdf hiddenColumn",
                                text: '',
                                title: 'Term List',
                                filename: "tblStatusPopList1_" + moment().format(),
                                exportOptions: {
                                    columns: ':visible'
                                }
                            },
                            {
                                extend: 'excelHtml5',
                                title: '',
                                download: 'open',
                                className: "btntabletoexcel hiddenColumn",
                                filename: "tblStatusPopList1_" + moment().format(),
                                orientation: 'portrait',
                                exportOptions: {
                                    columns: ':visible'
                                }
                                // ,
                                // customize: function ( win ) {
                                //   $(win.document.body).children("h1:first").remove();
                                // }

                            }
                        ],
                        // bStateSave: true,
                        // rowId: 0,
                        paging: false,
                        // "scrollY": "400px",
                        // "scrollCollapse": true,
                        info: true,
                        responsive: true,
                        "order": [
                            [0, "asc"]
                        ],
                        // "aaSorting": [[1,'desc']],
                        action: function() {
                            $('#tblStatusPopList1').DataTable().ajax.reload();
                        },
                        "fnDrawCallback": function(oSettings) {
                            setTimeout(function() {
                                MakeNegative();
                            }, 100);
                        },
                        "fnInitComplete": function () {
                            $("<button class='btn btn-primary btnAddNewStatus' data-dismiss='modal' data-toggle='modal' data-target='#newCustomFieldPop' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblStatusPopList1_filter");
                            $("<button class='btn btn-primary btnRefreshStatus' type='button' id='btnRefreshStatus' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblStatusPopList1_filter");
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
                    $('.fullScreenSpin').css('display', 'none');
                }, 10);


                // var columns = $('#tblStatusPopList1 th');
                // let sTible = "";
                // let sWidth = "";
                // let sIndex = "";
                // let sVisible = "";
                // let columVisible = false;
                // let sClass = "";
                // $.each(columns, function(i, v) {
                //     if (v.hidden == false) {
                //         columVisible = true;
                //     }
                //     if ((v.className.includes("hiddenColumn"))) {
                //         columVisible = false;
                //     }
                //     sWidth = v.style.width.replace('px', "");

                //     let datatablerecordObj = {
                //         sTitle: v.innerText || '',
                //         sWidth: sWidth || '',
                //         sIndex: v.cellIndex || '',
                //         sVisible: columVisible || false,
                //         sClass: v.className || ''
                //     };
                //     tableHeaderList.push(datatablerecordObj);
                // });
                // templateObject.tableheaderrecords.set(tableHeaderList);
                // $('div.dataTables_filter input').addClass('form-control form-control-sm');

            }
        }).catch(function(err) {

            sideBarService.getAllCustomFields().then(function(data) {
              addVS1Data('TCustomFieldList', JSON.stringify(data));
                let lineItems = [];
                let lineItemObj = {};
                let setISCOD = false;
                for (let i = 0; i < data.tcustomfieldlist.length; i++) {
                    // let taxRate = (data.tdeptclass[i].fields.Rate * 100).toFixed(2) + '%';
                    var dataList = {
                        id: data.tcustomfieldlist[i].fields.ID || '',
                            typename: data.tcustomfieldlist[i].fields.Description || '',
                            description: data.tcustomfieldlist[i].Description
                    };

                    dataTableList.push(dataList);
                    //}
                }


                templateObject.datatablerecords.set(dataTableList);

                if (templateObject.datatablerecords.get()) {

                    // Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblStatusPopList1', function(error, result) {
                    //     if (error) {

                    //     } else {
                    //         if (result) {
                    //             for (let i = 0; i < result.customFields.length; i++) {
                    //                 let customcolumn = result.customFields;
                    //                 let columData = customcolumn[i].label;
                    //                 let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                    //                 let hiddenColumn = customcolumn[i].hidden;
                    //                 let columnClass = columHeaderUpdate.split('.')[1];
                    //                 let columnWidth = customcolumn[i].width;
                    //                 let columnindex = customcolumn[i].index + 1;

                    //                 if (hiddenColumn == true) {

                    //                     $("." + columnClass + "").addClass('hiddenColumn');
                    //                     $("." + columnClass + "").removeClass('showColumn');
                    //                 } else if (hiddenColumn == false) {
                    //                     $("." + columnClass + "").removeClass('hiddenColumn');
                    //                     $("." + columnClass + "").addClass('showColumn');
                    //                 }

                    //             }
                    //         }

                    //     }
                    // });


                    // setTimeout(function() {
                    //     MakeNegative();
                    // }, 100);
                }

                $('.fullScreenSpin').css('display', 'none');
                setTimeout(function() {
                    $('#tblStatusPopList1').DataTable({
                        columnDefs: [{
                            "orderable": false,
                            "targets": -1
                        }],
                        select: true,
                        destroy: true,
                        colReorder: true,
                        "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        buttons: [{
                                extend: 'csvHtml5',
                                text: '',
                                download: 'open',
                                className: "btntabletocsv hiddenColumn",
                                filename: "tblStatusPopList1_" + moment().format(),
                                orientation: 'portrait',
                                exportOptions: {
                                    columns: ':visible'
                                }
                            }, {
                                extend: 'print',
                                download: 'open',
                                className: "btntabletopdf hiddenColumn",
                                text: '',
                                title: 'Term List',
                                filename: "tblStatusPopList1_" + moment().format(),
                                exportOptions: {
                                    columns: ':visible'
                                }
                            },
                            {
                                extend: 'excelHtml5',
                                title: '',
                                download: 'open',
                                className: "btntabletoexcel hiddenColumn",
                                filename: "tblStatusPopList1_" + moment().format(),
                                orientation: 'portrait',
                                exportOptions: {
                                    columns: ':visible'
                                }
                                // ,
                                // customize: function ( win ) {
                                //   $(win.document.body).children("h1:first").remove();
                                // }

                            }
                        ],
                        // bStateSave: true,
                        // rowId: 0,
                        paging: false,
                        // "scrollY": "400px",
                        // "scrollCollapse": true,
                        info: true,
                        responsive: true,
                        "order": [
                            [0, "asc"]
                        ],
                        // "aaSorting": [[1,'desc']],
                        action: function() {
                            $('#tblStatusPopList1').DataTable().ajax.reload();
                        },
                        "fnDrawCallback": function(oSettings) {
                            setTimeout(function() {
                                MakeNegative();
                            }, 100);
                        },
                        "fnInitComplete": function () {
                            $("<button class='btn btn-primary btnAddNewStatus' data-dismiss='modal' data-toggle='modal' data-target='#newCustomFieldPop' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblStatusPopList1_filter");
                            $("<button class='btn btn-primary btnRefreshStatus' type='button' id='btnRefreshStatus' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblStatusPopList1_filter");
                        }

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
                    $('.fullScreenSpin').css('display', 'none');
                }, 10);


                // var columns = $('#tblStatusPopList1 th');
                // let sTible = "";
                // let sWidth = "";
                // let sIndex = "";
                // let sVisible = "";
                // let columVisible = false;
                // let sClass = "";
                // $.each(columns, function(i, v) {
                //     if (v.hidden == false) {
                //         columVisible = true;
                //     }
                //     if ((v.className.includes("hiddenColumn"))) {
                //         columVisible = false;
                //     }
                //     sWidth = v.style.width.replace('px', "");

                //     let datatablerecordObj = {
                //         sTitle: v.innerText || '',
                //         sWidth: sWidth || '',
                //         sIndex: v.cellIndex || '',
                //         sVisible: columVisible || false,
                //         sClass: v.className || ''
                //     };
                //     tableHeaderList.push(datatablerecordObj);
                // });
                // templateObject.tableheaderrecords.set(tableHeaderList);
                // $('div.dataTables_filter input').addClass('form-control form-control-sm');

            }).catch(function(err) {
                // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                $('.fullScreenSpin').css('display', 'none');
                // Meteor._reload.reload();
            });
        });

    }

    templateObject.getSalesCustomFieldsList();

    // $(document).on('click', '.table-remove', function() {
    //     event.stopPropagation();
    //     event.stopPropagation();
    //     var targetID = $(event.target).closest('tr').attr('id'); // table row ID
    //     $('#selectDeleteLineID').val(targetID);
    //     $('#deleteLineModal').modal('toggle');
    //     // if ($('.tblStatusPopList1 tbody>tr').length > 1) {
    //     // // if(confirm("Are you sure you want to delete this row?")) {
    //     // this.click;
    //     // $(this).closest('tr').remove();
    //     // //} else { }
    //     // event.preventDefault();
    //     // return false;
    //     // }
    // });

//     $('#tblStatusPopList1 tbody').on('click', 'tr .colName, tr .colIsDays, tr .colIsEOM, tr .colDescription, tr .colIsCOD, tr .colIsEOMPlus, tr .colCustomerDef, tr .colSupplierDef', function() {


//                 $('#edtTermsID').val(termsID);
//                 $('#edtName').val(termsName);
//                 $('#edtName').prop('readonly', true);
//                 $('#edtDesc').val(description);
//                 $('#edtDays').val(days);
//                 $('#customFieldList').modal('hide');


// });

    });



Template.custfieldlist.events({
    'click .btnAddNewStatus': function (event) {
        setTimeout(function () {
          $('#status').focus();
        }, 1000);
    },
    'click #btnNewInvoice': function(event) {
        // FlowRouter.go('/invoicecard');
    },
    'click .chkDatatable': function(event) {
        var columns = $('#tblStatusPopList1 th');
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
                    PrefName: 'tblStatusPopList1'
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
    'click .saveTable': function(event) {
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
                    PrefName: 'tblStatusPopList1'
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
                            PrefName: 'tblStatusPopList1',
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
                        PrefName: 'tblStatusPopList1',
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
    },
    'blur .divcolumn': function(event) {
        let columData = $(event.target).text();

        let columnDatanIndex = $(event.target).closest("div.columnSettings").attr('id');
        var datable = $('#tblStatusPopList1').DataTable();
        var title = datable.column(columnDatanIndex).header();
        $(title).html(columData);

    },
    'change .rngRange': function(event) {
        let range = $(event.target).val();
        $(event.target).closest("div.divColWidth").find(".spWidth").html(range + 'px');

        let columData = $(event.target).closest("div.divColWidth").find(".spWidth").attr("value");
        let columnDataValue = $(event.target).closest("div").prev().find(".divcolumn").text();
        var datable = $('#tblStatusPopList1 th');
        $.each(datable, function(i, v) {

            if (v.innerText == columnDataValue) {
                let className = v.className;
                let replaceClass = className.replace(/ /g, ".");
                $("." + replaceClass + "").css('width', range + 'px');

            }
        });

    },
    'click .btnOpenSettings': function(event) {
        let templateObject = Template.instance();
        var columns = $('#tblStatusPopList1 th');

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
                sIndex: v.cellIndex || '',
                sVisible: columVisible || false,
                sClass: v.className || ''
            };
            tableHeaderList.push(datatablerecordObj);
        });
        templateObject.tableheaderrecords.set(tableHeaderList);
    },
    'click #exportbtn': function() {
        $('.fullScreenSpin').css('display', 'inline-block');
        jQuery('#tblStatusPopList1_wrapper .dt-buttons .btntabletoexcel').click();
        $('.fullScreenSpin').css('display', 'none');

    },
    'click .btnRefresh': function() {
        $('.fullScreenSpin').css('display', 'inline-block');
        sideBarService.getAllLeadStatus().then(function(dataReload) {
            addVS1Data('TTermsVS1', JSON.stringify(dataReload)).then(function(datareturn) {
                location.reload(true);
            }).catch(function(err) {
                location.reload(true);
            });
        }).catch(function(err) {
            location.reload(true);
        });
    },
    'click .btnDeleteTerms': function() {
        playDeleteAudio();
        let taxRateService = new TaxRateService();
        setTimeout(function(){

        let termsId = $('#selectDeleteLineID').val();
        let objDetails = {
            type: "TTerms",
            fields: {
                Id: parseInt(termsId),
                Active: false
            }
        };

        taxRateService.saveTerms(objDetails).then(function(objDetails) {
            sideBarService.getAllLeadStatus().then(function(dataReload) {
                addVS1Data('TTermsVS1', JSON.stringify(dataReload)).then(function(datareturn) {
                    Meteor._reload.reload();
                }).catch(function(err) {
                    Meteor._reload.reload();
                });
            }).catch(function(err) {
                Meteor._reload.reload();
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
                    Meteor._reload.reload();
                } else if (result.dismiss === 'cancel') {

                }
            });
            $('.fullScreenSpin').css('display', 'none');
        });
    }, delayTimeAfterSound);
    },
    'click .btnSaveTerms': function() {
        playSaveAudio();
        let taxRateService = new TaxRateService();
        setTimeout(function(){
        $('.fullScreenSpin').css('display', 'inline-block');
        let termsID = $('#edtTermsID').val();
        let termsName = $('#edtName').val();
        let description = $('#edtDesc').val();
        let termdays = $('#edtDays').val();

        let isDays = false;
        let is30days = false;
        let isEOM = false;
        let isEOMPlus = false;
        let days = 0;

        let isSalesdefault = false;
        let isPurchasedefault = false;
        if (termdays.replace(/\s/g, '') != "") {
            isDays = true;
        } else {
            isDays = false;
        }

        if ($('#isEOM').is(':checked')) {
            isEOM = true;
        } else {
            isEOM = false;
        }

        if ($('#isEOMPlus').is(':checked')) {
            isEOMPlus = true;
        } else {
            isEOMPlus = false;
        }

        if ($('#chkCustomerDef').is(':checked')) {
            isSalesdefault = true;
        } else {
            isSalesdefault = false;
        }

        if ($('#chkSupplierDef').is(':checked')) {
            isPurchasedefault = true;
        } else {
            isPurchasedefault = false;
        }

        let objDetails = '';
        if (termsName === '') {
            $('.fullScreenSpin').css('display', 'none');
            Bert.alert('<strong>WARNING:</strong> Term Name cannot be blank!', 'warning');
            e.preventDefault();
        }

        if (termsID == "") {
            taxRateService.checkTermByName(termsName).then(function(data) {
                termsID = data.tterms[0].Id;
                objDetails = {
                    type: "TTerms",
                    fields: {
                        ID: parseInt(termsID),
                        Active: true,
                        //TypeName: termsName,
                        Description: description,
                        IsDays: isDays,
                        IsEOM: isEOM,
                        IsEOMPlus: isEOMPlus,
                        isPurchasedefault: isPurchasedefault,
                        isSalesdefault: isSalesdefault,
                        Days: termdays || 0,
                        PublishOnVS1: true
                    }
                };

                taxRateService.saveTerms(objDetails).then(function(objDetails) {
                    sideBarService.getAllLeadStatus().then(function(dataReload) {
                        addVS1Data('TTermsVS1', JSON.stringify(dataReload)).then(function(datareturn) {
                            Meteor._reload.reload();
                        }).catch(function(err) {
                            Meteor._reload.reload();
                        });
                    }).catch(function(err) {
                        Meteor._reload.reload();
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
                            Meteor._reload.reload();
                        } else if (result.dismiss === 'cancel') {

                        }
                    });
                    $('.fullScreenSpin').css('display', 'none');
                });
            }).catch(function(err) {
                objDetails = {
                    type: "TTerms",
                    fields: {
                        Active: true,
                        TypeName: termsName,
                        Description: description,
                        IsDays: isDays,
                        IsEOM: isEOM,
                        IsEOMPlus: isEOMPlus,
                        Days: termdays || 0,
                        PublishOnVS1: true
                    }
                };

                taxRateService.saveTerms(objDetails).then(function(objDetails) {
                    sideBarService.getAllLeadStatus().then(function(dataReload) {
                        addVS1Data('TTermsVS1', JSON.stringify(dataReload)).then(function(datareturn) {
                            Meteor._reload.reload();
                        }).catch(function(err) {
                            Meteor._reload.reload();
                        });
                    }).catch(function(err) {
                        Meteor._reload.reload();
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
                            Meteor._reload.reload();
                        } else if (result.dismiss === 'cancel') {

                        }
                    });
                    $('.fullScreenSpin').css('display', 'none');
                });
            });

        } else {
            objDetails = {
                type: "TTerms",
                fields: {
                    ID: parseInt(termsID),
                    TypeName: termsName,
                    Description: description,
                    IsDays: isDays,
                    IsEOM: isEOM,
                    isPurchasedefault: isPurchasedefault,
                    isSalesdefault: isSalesdefault,
                    IsEOMPlus: isEOMPlus,
                    Days: termdays || 0,
                    PublishOnVS1: true
                }
            };

            taxRateService.saveTerms(objDetails).then(function(objDetails) {
                sideBarService.getAllLeadStatus().then(function(dataReload) {
                    addVS1Data('TTermsVS1', JSON.stringify(dataReload)).then(function(datareturn) {
                        Meteor._reload.reload();
                    }).catch(function(err) {
                        Meteor._reload.reload();
                    });
                }).catch(function(err) {
                    Meteor._reload.reload();
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
                        Meteor._reload.reload();
                    } else if (result.dismiss === 'cancel') {

                    }
                });
                $('.fullScreenSpin').css('display', 'none');
            });
        }

    }, delayTimeAfterSound);


    },
    'click .btnAddTerms': function() {
        let templateObject = Template.instance();
        $('#add-terms-title').text('Add New Term ');
        $('#edtTermsID').val('');
        $('#edtName').val('');
        $('#edtName').prop('readonly', false);
        $('#edtDesc').val('');
        $('#edtDays').val('');

        templateObject.include7Days.set(false);
        templateObject.includeCOD.set(false);
        templateObject.include30Days.set(false);
        templateObject.includeEOM.set(false);
        templateObject.includeEOMPlus.set(false);
    },
    'click .btnBack': function(event) {
        playCancelAudio();
        event.preventDefault();
        setTimeout(function(){
        history.back(1);
        }, delayTimeAfterSound);
    },
    'click .chkTerms': function(event) {
        var $box = $(event.target);

        if ($box.is(":checked")) {
            var group = "input:checkbox[name='" + $box.attr("name") + "']";
            $(group).prop("checked", false);
            $box.prop("checked", true);
        } else {
            $box.prop("checked", false);
        }
    },
    'keydown #edtDays': function(event) {
        if ($.inArray(event.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||
            // Allow: Ctrl+A, Command+A
            (event.keyCode === 65 && (event.ctrlKey === true || event.metaKey === true)) ||
            // Allow: home, end, left, right, down, up
            (event.keyCode >= 35 && event.keyCode <= 40)) {
            // let it happen, don't do anything
            return;
        }

        if (event.shiftKey == true) {
            event.preventDefault();
        }

        if ((event.keyCode >= 48 && event.keyCode <= 57) ||
            (event.keyCode >= 96 && event.keyCode <= 105) ||
            event.keyCode == 8 || event.keyCode == 9 ||
            event.keyCode == 37 || event.keyCode == 39 ||
            event.keyCode == 46 || event.keyCode == 190) {} else {
            event.preventDefault();
        }
    }


});

Template.custfieldlist.helpers({
    datatablerecords: () => {
        return Template.instance().datatablerecords.get().sort(function(a, b) {
            if (a.typename == 'NA') {
                return 1;
            } else if (b.typename == 'NA') {
                return -1;
            }
            return (a.typename.toUpperCase() > b.typename.toUpperCase()) ? 1 : -1;
        });
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    salesCloudPreferenceRec: () => {
        return CloudPreference.findOne({
            userid: Session.get('mycloudLogonID'),
            PrefName: 'tblStatusPopList1'
        });
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
    include7Days: () => {
        return Template.instance().include7Days.get();
    },
    include30Days: () => {
        return Template.instance().include30Days.get();
    },
    includeCOD: () => {
        return Template.instance().includeCOD.get();
    },
    includeEOM: () => {
        return Template.instance().includeEOM.get();
    },
    includeEOMPlus: () => {
        return Template.instance().includeEOMPlus.get();
    },
    includeSalesDefault: () => {
        return Template.instance().includeSalesDefault.get();
    },
    includePurchaseDefault: () => {
        return Template.instance().includePurchaseDefault.get();
    },
    loggedCompany: () => {
        return localStorage.getItem('mySession') || '';
    }
});

Template.registerHelper('equals', function(a, b) {
    return a === b;
});
