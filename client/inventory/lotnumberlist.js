import { ReactiveVar } from 'meteor/reactive-var';
import { SideBarService } from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
let sideBarService = new SideBarService();
Template.lotnumberlist.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
});

Template.lotnumberlist.onRendered(function() {

    $('.fullScreenSpin').css('display', 'inline-block');
    let templateObject = Template.instance();
    const dataTableList = [];
    const tableHeaderList = [];

    if (FlowRouter.current().queryParams.success) {
        $('.btnRefresh').addClass('btnRefreshAlert');
    }
    Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblLotNumberList', function(error, result) {
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
                    // let columnindex = customcolumn[i].index + 1;
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

    templateObject.resetData = function(dataVal) {
        window.open('/lotnumberlist?page=last', '_self');
    }
    templateObject.getAllSerialNumberData = function() {
        sideBarService.getAllSerialNumber().then(function(data) {

            for (let i = 0; i < data.tserialnumberlistcurrentreport.length; i++) {
                let datet=new Date(data.tserialnumberlistcurrentreport[i].TransDate);
                let sdatet = `${datet.getDate()}/${datet.getMonth()}/${datet.getFullYear()}`;
                let dateep = new Date(data.tserialnumberlistcurrentreport[i].BatchExpiryDate);
                let sdateep = `${dateep.getDate()}/${dateep.getMonth()}/${dateep.getFullYear()}`;
                if(data.tserialnumberlistcurrentreport[i].AllocType == "Sold"){
                    tclass="text-sold";
                }else if(data.tserialnumberlistcurrentreport[i].AllocType == "In-Stock"){
                    tclass="text-instock";
                }else if(data.tserialnumberlistcurrentreport[i].AllocType == "Transferred (Not Available)"){
                    tclass="text-transfered";
                }else{
                    tclass='';
                }
                let dataList = {
                    productname: data.tserialnumberlistcurrentreport[i].ProductName != '' ? data.tserialnumberlistcurrentreport[i].ProductName : 'Unknown',
                    department: data.tserialnumberlistcurrentreport[i].DepartmentName != '' ? data.tserialnumberlistcurrentreport[i].DepartmentName : 'Unknown',
                    lotnumber: data.tserialnumberlistcurrentreport[i].BatchNumber,
                    salsedes: data.tserialnumberlistcurrentreport[i].PartsDescription,
                    barcode: data.tserialnumberlistcurrentreport[i].barcode,
                    status: data.tserialnumberlistcurrentreport[i].AllocType,
                    date: data.tserialnumberlistcurrentreport[i].TransDate !=''? moment(data.tserialnumberlistcurrentreport[i].TransDate).format("YYYY/MM/DD"): data.tserialnumberlistcurrentreport[i].TransDate,
                    expirydate: data.tserialnumberlistcurrentreport[i].BatchExpiryDate !=''? moment(data.tserialnumberlistcurrentreport[i].BatchExpiryDate).format("YYYY/MM/DD"): data.tserialnumberlistcurrentreport[i].BatchExpiryDate,
                    cssclass: tclass
                };
                dataTableList.push(dataList);
            }

            templateObject.datatablerecords.set(dataTableList);
            if (templateObject.datatablerecords.get()) {

                Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblLotNumberList', function(error, result) {
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
                $('#tblLotNumberList').DataTable({
                    columnDefs: [
                        { type: 'date', targets: 0 }

                    ],
                    "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                    buttons: [{
                        extend: 'excelHtml5',
                        text: '',
                        download: 'open',
                        className: "btntabletocsv hiddenColumn",
                        filename: "Lot Number - " + moment().format(),
                        orientation: 'portrait',
                        exportOptions: {
                            columns: ':visible',
                            format: {
                                body: function(data, row, column) {
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
                        title: 'Lot Number List',
                        filename: "Lot Number List - " + moment().format(),
                        exportOptions: {
                            columns: ':visible',
                            stripHtml: false
                        },
                    }],
                    select: true,
                    destroy: true,
                    colReorder: true,
                    // bStateSave: true,
                    // rowId: 0,
                    pageLength: initialDatatableLoad,
                    lengthMenu: [
                        [initialDatatableLoad, -1],
                        [initialDatatableLoad, "All"]
                    ],
                    info: true,
                    responsive: true,
                    "order": [
                        [1, "desc"],
                        [0, "desc"]
                    ],
                    // "aaSorting": [[1,'desc']],
                    action: function() {
                        $('#tblLotNumberList').DataTable().ajax.reload();
                    },
                    "fnDrawCallback": function(oSettings) {
                        $('.paginate_button.page-item').removeClass('disabled');
                        $('#tblLotNumberList_ellipsis').addClass('disabled');

                        if (oSettings._iDisplayLength == -1) {
                            if (oSettings.fnRecordsDisplay() > 150) {
                                $('.paginate_button.page-item.previous').addClass('disabled');
                                $('.paginate_button.page-item.next').addClass('disabled');
                            }
                        } else {

                        }
                        if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                            $('.paginate_button.page-item.next').addClass('disabled');
                        }

                        $('.paginate_button.next:not(.disabled)', this.api().table().container())
                            .on('click', function() {

                                $('.fullScreenSpin').css('display', 'inline-block');
                                let dataLenght = oSettings._iDisplayLength;

                                sideBarService.getAllSerialNumber(initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
                                    getVS1Data('TSerialNumberListCurrentReport').then(function(dataObjectold) {
                                        if (dataObjectold.length == 0) {

                                        } else {
                                            let dataOld = JSON.parse(dataObjectold[0].data);

                                            var thirdaryData = $.merge($.merge([], dataObjectnew.tserialnumberlistcurrentreport), dataOld.tserialnumberlistcurrentreport);
                                            let objCombineData = {
                                                tserialnumberlistcurrentreport: thirdaryData
                                            }


                                            addVS1Data('TSerialNumberListCurrentReport', JSON.stringify(objCombineData)).then(function(datareturn) {
                                                templateObject.resetData(objCombineData);
                                                $('.fullScreenSpin').css('display', 'none');
                                            }).catch(function(err) {
                                                $('.fullScreenSpin').css('display', 'none');
                                            });

                                        }
                                    }).catch(function(err) {

                                    });

                                }).catch(function(err) {
                                    $('.fullScreenSpin').css('display', 'none');
                                });

                            });
                        setTimeout(function() {
                            MakeNegative();
                        }, 100);
                    },
                    "fnInitComplete": function() {
                        let urlParametersPage = FlowRouter.current().queryParams.page;
                        if (urlParametersPage) {
                            this.fnPageChange('last');
                        }
                        $("<button class='btn btn-primary btnRefreshStockAdjustment' type='button' id='btnRefreshStockAdjustment' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblLotNumberList_filter");
                    }

                }).on('page', function() {
                    setTimeout(function() {
                        MakeNegative();
                    }, 100);
                    let draftRecord = templateObject.datatablerecords.get();
                    templateObject.datatablerecords.set(draftRecord);
                }).on('column-reorder', function() {

                }).on('length.dt', function(e, settings, len) {

                    $('.fullScreenSpin').css('display', 'inline-block');
                    let dataLenght = settings._iDisplayLength;
                    if (dataLenght == -1) {
                        if (settings.fnRecordsDisplay() > initialDatatableLoad) {
                            $('.fullScreenSpin').css('display', 'none');
                        } else {
                            sideBarService.getAllSerialNumber('All', 1).then(function(dataNonBo) {

                                addVS1Data('TSerialNumberListCurrentReport', JSON.stringify(dataNonBo)).then(function(datareturn) {
                                    templateObject.resetData(dataNonBo);
                                    $('.fullScreenSpin').css('display', 'none');
                                }).catch(function(err) {
                                    $('.fullScreenSpin').css('display', 'none');
                                });
                            }).catch(function(err) {
                                $('.fullScreenSpin').css('display', 'none');
                            });
                        }
                    } else {
                        if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
                            $('.fullScreenSpin').css('display', 'none');
                        } else {
                            sideBarService.getAllSerialNumber(dataLenght, 0).then(function(dataNonBo) {

                                addVS1Data('TSerialNumberListCurrentReport', JSON.stringify(dataNonBo)).then(function(datareturn) {
                                    templateObject.resetData(dataNonBo);
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
                $('.fullScreenSpin').css('display', 'none');
            }, 0);

            var columns = $('#tblLotNumberList th');
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
            $('#tblLotNumberList tbody').on('click', 'tr', function() {
                var listData = $(this).closest('tr').attr('id');
                if (listData) {
                    FlowRouter.go('/stocktransfercard?id=' + listData);
                }
            });

        }).catch(function(err) {
            sideBarService.getAllSerialNumber().then(function(data) {
                let lineItems = [];
                let lineItemObj = {};
                addVS1Data('TSerialNumberListCurrentReport', JSON.stringify(data));
                for (let i = 0; i < data.tserialnumberlistcurrentreport.length; i++) {
                    let datet=new Date(data.tserialnumberlistcurrentreport[i].TransDate);
                    let sdatet = `${datet.getDate()}/${datet.getMonth()}/${datet.getFullYear()}`;
                    let dateep = new Date(data.tserialnumberlistcurrentreport[i].BatchExpiryDate);
                    let sdateep = `${dateep.getDate()}/${dateep.getMonth()}/${dateep.getFullYear()}`;
                    if(data.tserialnumberlistcurrentreport[i].AllocType == "Sold"){
                        tclass="text-sold";
                    }else if(data.tserialnumberlistcurrentreport[i].AllocType == "In-Stock"){
                        tclass="text-instock";
                    }else if(data.tserialnumberlistcurrentreport[i].AllocType == "Transferred (Not Available)"){
                        tclass="text-transfered";
                    }else{
                        tclass='';
                    }
                    let dataList = {
                        productname: data.tserialnumberlistcurrentreport[i].ProductName != '' ? data.tserialnumberlistcurrentreport[i].ProductName : 'Unknown',
                        department: data.tserialnumberlistcurrentreport[i].DepartmentName != '' ? data.tserialnumberlistcurrentreport[i].DepartmentName : 'Unknown',
                        lotnumber: data.tserialnumberlistcurrentreport[i].BatchNumber,
                        salsedes: data.tserialnumberlistcurrentreport[i].PartsDescription,
                        barcode: data.tserialnumberlistcurrentreport[i].barcode,
                        status: data.tserialnumberlistcurrentreport[i].AllocType,
                        date: data.tserialnumberlistcurrentreport[i].TransDate !=''? moment(data.tserialnumberlistcurrentreport[i].TransDate).format("YYYY/MM/DD"): data.tserialnumberlistcurrentreport[i].TransDate,
                        expirydate: data.tserialnumberlistcurrentreport[i].BatchExpiryDate !=''? moment(data.tserialnumberlistcurrentreport[i].BatchExpiryDate).format("YYYY/MM/DD"): data.tserialnumberlistcurrentreport[i].BatchExpiryDate,
                        cssclass: tclass
                    };

                    dataTableList.push(dataList);

                }

                templateObject.datatablerecords.set(dataTableList);
                if (templateObject.datatablerecords.get()) {

                    Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblLotNumberList', function(error, result) {
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
                    //$.fn.dataTable.moment('DD/MM/YY');
                    $('#tblLotNumberList').DataTable({
                        // dom: 'lBfrtip',
                        columnDefs: [
                            { type: 'date', targets: 0 }
                            // ,
                            // { targets: 0, className: "text-center" }

                        ],
                        "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        buttons: [{
                            extend: 'excelHtml5',
                            text: '',
                            download: 'open',
                            className: "btntabletocsv hiddenColumn",
                            filename: "Serial Number List - " + moment().format(),
                            orientation: 'portrait',
                            exportOptions: {
                                columns: ':visible',
                                format: {
                                    body: function(data, row, column) {
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
                            title: 'Serial Number List',
                            filename: "Serial Number List - " + moment().format(),
                            exportOptions: {
                                columns: ':visible',
                                stripHtml: false
                            },
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
                            [1, "desc"],
                            [0, "desc"]
                        ],
                        // "aaSorting": [[1,'desc']],
                        action: function() {
                            $('#tblLotNumberList').DataTable().ajax.reload();
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

                    });
                    $('.fullScreenSpin').css('display', 'none');
                }, 0);

                var columns = $('#tblLotNumberList th');
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
                $('#tblLotNumberList tbody').on('click', 'tr', function() {
                    var listData = $(this).closest('tr').attr('id');
                    if (listData) {
                        window.open('/stocktransfercard?id=' + listData, '_self');
                    }
                });

            }).catch(function(err) {
                $('.fullScreenSpin').css('display', 'none');
            });
        });

    }

    templateObject.getAllSerialNumberData();
    tableResize();
});

Template.lotnumberlist.events({
    'click .btnRefresh': function() {

        $('.fullScreenSpin').css('display', 'inline-block');
        sideBarService.getAllSerialNumber(initialDataLoad, 0).then(function(data) {
            addVS1Data('TSerialNumberListCurrentReport', JSON.stringify(data)).then(function(datareturn) {
                window.open('/lotnumberlist', '_self');
            }).catch(function(err) {
                window.open('/lotnumberlist', '_self');
            });
        }).catch(function(err) {
            window.open('/lotnumberlist', '_self');
        });
    },
    'click .chkDatatable': function(event) {
        var columns = $('#tblLotNumberList th');
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
    'keyup #tblLotNumberList_filter input': function(event) {
        if ($(event.target).val() != '') {
            $(".btnRefreshStockAdjustment").addClass('btnSearchAlert');
        } else {
            $(".btnRefreshStockAdjustment").removeClass('btnSearchAlert');
        }
        if (event.keyCode == 13) {
            $(".btnRefreshStockAdjustment").trigger("click");
        }
    },
    'click .btnRefreshStockAdjustment': function(event) {
        $(".btnRefresh").trigger("click");
    },
    'click .resetTable': function(event) {
        var getcurrentCloudDetails = CloudUser.findOne({ _id: Session.get('mycloudLogonID'), clouddatabaseID: Session.get('mycloudLogonDBID') });
        if (getcurrentCloudDetails) {
            if (getcurrentCloudDetails._id.length > 0) {
                var clientID = getcurrentCloudDetails._id;
                var clientUsername = getcurrentCloudDetails.cloudUsername;
                var clientEmail = getcurrentCloudDetails.cloudEmail;
                var checkPrefDetails = CloudPreference.findOne({ userid: clientID, PrefName: 'tblLotNumberList' });
                if (checkPrefDetails) {
                    CloudPreference.remove({ _id: checkPrefDetails._id }, function(err, idTag) {
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
        //let datatable =$('#tblLotNumberList').DataTable();
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

        var getcurrentCloudDetails = CloudUser.findOne({ _id: Session.get('mycloudLogonID'), clouddatabaseID: Session.get('mycloudLogonDBID') });
        if (getcurrentCloudDetails) {
            if (getcurrentCloudDetails._id.length > 0) {
                var clientID = getcurrentCloudDetails._id;
                var clientUsername = getcurrentCloudDetails.cloudUsername;
                var clientEmail = getcurrentCloudDetails.cloudEmail;
                var checkPrefDetails = CloudPreference.findOne({ userid: clientID, PrefName: 'tblLotNumberList' });
                if (checkPrefDetails) {
                    CloudPreference.update({ _id: checkPrefDetails._id }, {
                        $set: {
                            userid: clientID,
                            username: clientUsername,
                            useremail: clientEmail,
                            PrefGroup: 'salesform',
                            PrefName: 'tblLotNumberList',
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
                        PrefName: 'tblLotNumberList',
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
    },
    'blur .divcolumn': function(event) {
        let columData = $(event.target).text();

        let columnDatanIndex = $(event.target).closest("div.columnSettings").attr('id');

        var datable = $('#tblLotNumberList').DataTable();
        var title = datable.column(columnDatanIndex).header();
        $(title).html(columData);

    },
    'change .rngRange': function(event) {
        let range = $(event.target).val();
        // $(event.target).closest("div.divColWidth").find(".spWidth").html(range+'px');

        // let columData = $(event.target).closest("div.divColWidth").find(".spWidth").attr("value");
        let columnDataValue = $(event.target).closest("div").prev().find(".divcolumn").text();
        var datable = $('#tblLotNumberList th');
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
        var columns = $('#tblLotNumberList th');

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

        $('.fullScreenSpin').css('display', 'inline-block');
        jQuery('#tblLotNumberList_wrapper .dt-buttons .btntabletocsv').click();
        $('.fullScreenSpin').css('display', 'none');

    },
    'click .printConfirm': function(event) {
        playPrintAudio();
        setTimeout(function(){
        $('.fullScreenSpin').css('display', 'inline-block');
        jQuery('#tblLotNumberList_wrapper .dt-buttons .btntabletopdf').click();
        $('.fullScreenSpin').css('display', 'none');
    }, delayTimeAfterSound);
    }
});
Template.lotnumberlist.helpers({
    datatablerecords: () => {
        return Template.instance().datatablerecords.get();
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    salesCloudPreferenceRec: () => {
        return CloudPreference.findOne({ userid: Session.get('mycloudLogonID'), PrefName: 'tblLotNumberList' });
    },
    currentdate: () => {
        var currentDate = new Date();
        var begunDate = moment(currentDate).format("DD/MM/YYYY");
        return begunDate;
    }
});

Template.registerHelper("equals", function(a, b) {
    return a === b;
});
