import { ReportService } from "../reports/report-service";
import { SalesBoardService } from '../js/sales-service';
import 'jQuery.print/jQuery.print.js';
import { UtilityService } from "../utility-service";

let reportService = new ReportService();
let utilityService = new UtilityService();

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

Template.basreturntransactionlist.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
});

Template.basreturntransactionlist.onRendered(function() {
    let templateObject = Template.instance();
    const dataTableList = [];

    function MakeNegative() {
        $('td').each(function() {
            if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
        });
    };
    templateObject.resetData = function(dataVal) {
        location.reload();
    };

    templateObject.getAccountsSummaryReports = function(data, transactionitem) {
        let datemethod = "Accrual";
        var startDate = "";
        var endDate = "";
        if (transactionitem == "G1" || transactionitem == "G2" || transactionitem == "G3" || transactionitem == "G4" ||
            transactionitem == "G7" || transactionitem == "G10" || transactionitem == "G11" || transactionitem == "G13" ||
            transactionitem == "G14" || transactionitem == "G15" || transactionitem == "G18") {
            datemethod = data.Tab1_Type;
            startDate = data.Tab1_Year + "-" + months[data.Tab1_Month] + "-01";
            var endMonth = (data.Tab1_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.Tab1_Month]) / 3) * 3) : (months[data.Tab1_Month]);
            endDate = new Date(data.Tab1_Year, (parseInt(endMonth)), 0);
            endDate = moment(endDate).format("YYYY-MM-DD");
        }
        if (transactionitem == "W1" || transactionitem == "W2" || transactionitem == "W3" || transactionitem == "W4") {
            datemethod = data.Tab2_Type;
            startDate = data.Tab2_Year + "-" + months[data.Tab2_Month] + "-01";
            var endMonth = (data.Tab2_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.Tab2_Month]) / 3) * 3) : (months[data.Tab2_Month]);
            endDate = new Date(data.Tab2_Year, (parseInt(endMonth)), 0);
            endDate = moment(endDate).format("YYYY-MM-DD");
        }
        if (transactionitem == "T1") {
            datemethod = data.Tab3_Type;
            startDate = data.Tab3_Year + "-" + months[data.Tab3_Month] + "-01";
            var endMonth = (data.Tab3_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.Tab3_Month]) / 3) * 3) : (months[data.Tab3_Month]);
            endDate = new Date(data.Tab3_Year, (parseInt(endMonth)), 0);
            endDate = moment(endDate).format("YYYY-MM-DD");
        }
        if (transactionitem == "1C" || transactionitem == "1E" || transactionitem == "1D" ||
            transactionitem == "1F" || transactionitem == "1G" || transactionitem == "7D") {
            datemethod = data.Tab4_Type;
            startDate = data.Tab4_Year + "-" + months[data.Tab4_Month] + "-01";
            var endMonth = (data.Tab4_Type == "Quarterly") ? (Math.ceil(parseInt(months[data.Tab4_Month]) / 3) * 3) : (months[data.Tab4_Month]);
            endDate = new Date(data.Tab4_Year, (parseInt(endMonth)), 0);
            endDate = moment(endDate).format("YYYY-MM-DD");
        }
        for (let i = 0; i < data.Lines.length; i++) {
            if (data.Lines[i].fields.ReportCode == transactionitem) {
                var dataList = {
                    description: data.BasSheetDesc,
                    accountingMethod: data.AccMethod,
                    datemethod: datemethod,
                    dateFrom: startDate,
                    dateTo: endDate,
                    globalref: data.Lines[i].fields.TransGlobalref,
                    transtype: data.Lines[i].fields.Transtype,
                    transdate: moment(data.Lines[i].fields.TransDate).format("YYYY-MM-DD"),
                    amount: data.Lines[i].fields.Amount,
                };

                dataTableList.push(dataList);
            }
        }

        templateObject.datatablerecords.set(dataTableList);
        setTimeout(function() {
            $('#tblBasReturnTransactionList').DataTable({
                // dom: 'lBfrtip',
                columnDefs: [
                    { type: 'basnumber', targets: 0 }
                ],
                "sDom": "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                buttons: [{
                    extend: 'excelHtml5',
                    text: '',
                    title: 'BAS Return Details',
                    download: 'open',
                    className: "btntabletocsv hiddenColumn",
                    filename: "basreturndetails_" + moment().format(),
                    orientation: 'portrait',
                    exportOptions: {
                        columns: ':visible'
                    }
                }, {
                    extend: 'print',
                    download: 'open',
                    className: "btntabletopdf hiddenColumn",
                    text: '',
                    title: 'BAS Return List',
                    filename: "basreturndetails_" + moment().format(),
                    exportOptions: {
                        columns: ':visible'
                    }
                }],
                select: true,
                destroy: true,
                colReorder: true,
                // bStateSave: true,
                // rowId: 0,
                pageLength: initialDatatableLoad,
                "bLengthChange": false,
                info: true,
                responsive: true,
                "order": [
                    [0, "desc"],
                    // [2, "desc"]
                ],
                // "aaSorting": [[1,'desc']],
                action: function() {
                    $('#tblBasReturnTransactionList').DataTable().ajax.reload();
                },
                "fnInitComplete": function() {
                    // this.fnPageChange('last');
                    // if (data.Params.Search.replace(/\s/g, "") == "") {
                    //     $("<button class='btn btn-danger btnHideDeleted' type='button' id='btnHideDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 8px !important;'><i class='far fa-check-circle' style='margin-right: 5px'></i>Hide Deleted</button>").insertAfter("#tblBankingOverview_filter");
                    // } else {
                    //     $("<button class='btn btn-primary btnViewDeleted' type='button' id='btnViewDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 8px !important;'><i class='fa fa-trash' style='margin-right: 5px'></i>View Deleted</button>").insertAfter("#tblBankingOverview_filter");
                    // }
                    $("<button class='btn btn-primary btnRefreshBasReturn' type='button' id='btnRefreshBasReturn' style='padding: 4px 10px; font-size: 14px; margin-left: 8px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblBASReturnList_filter");
                    $('.myvarFilterForm').appendTo(".colDateFilter");
                },
                "fnInfoCallback": function(oSettings, iStart, iEnd, iMax, iTotal, sPre) {
                    let countTableData = data.length || 0; //get count from API data

                    return 'Showing ' + iStart + " to " + iEnd + " of " + countTableData;
                }

            }).on('page', function() {
                setTimeout(function() {
                    MakeNegative();
                }, 100);
                let draftRecord = templateObject.datatablerecords.get();
                templateObject.datatablerecords.set(draftRecord);
            }).on('column-reorder', function() {

            });
        }, 1000);
    }

    setTimeout(function() {
        $(document).ready(function() {
            $('.fullScreenSpin').css('display', 'inline-block');
            var basreturnid = FlowRouter.current().queryParams.basreturnid;
            var transactionitem = FlowRouter.current().queryParams.transactionitem;
            if (basreturnid) {
                getVS1Data('TBASReturn').then(function(dataObject) {
                    if (dataObject.length > 0) {
                        let data = JSON.parse(dataObject[0].data);
                        for (let i = 0; i < data.tbasreturn.length; i++) {
                            if (basreturnid == data.tbasreturn[i].fields.ID && transactionitem != "") {
                                templateObject.getAccountsSummaryReports(data.tbasreturn[i].fields, transactionitem);
                            }
                        }
                        $('.fullScreenSpin').css('display', 'none');
                    } else {
                        reportService.getOneBASReturn(basreturnid).then(function(data) {
                            if (data.tbasreturn.length > 0 && transactionitem != "") {
                                templateObject.getAccountsSummaryReports(data.tbasreturn[i].fields, transactionitem);
                            }
                            $('.fullScreenSpin').css('display', 'none');
                        })
                    }
                }).catch(function(err) {
                    reportService.getOneBASReturn(basreturnid).then(function(data) {
                        if (data.tbasreturn.length > 0 && transactionitem != "") {
                            templateObject.getAccountsSummaryReports(data.tbasreturn[i].fields, transactionitem);
                        }
                        $('.fullScreenSpin').css('display', 'none');
                    })
                });
            }
        });
    }, 500);

    // $('#tblBasReturnTransactionList tbody').on('click', 'tr', function() {
    //     var listData = $(this).closest('tr').attr('id');
    //     if (listData) {
    //         // window.open('/invoicecard?id=' + listData,'_self');
    //     }

    // });

    // $('#tblBasReturnTransactionList tbody').on('click', 'tr', function() {
    //     var listData = $(this).closest('tr').attr('id');
    //     var transactiontype = $(event.target).closest("tr").find(".transactiontype").text();

    //     if ((listData) && (transactiontype)) {
    //         if (transactiontype === 'Quote') {
    //             window.open('/quotecard?id=' + listData, '_self');
    //         } else if (transactiontype === 'Sales Order') {
    //             window.open('/salesordercard?id=' + listData, '_self');
    //         } else if (transactiontype === 'Invoice') {
    //             window.open('/invoicecard?id=' + listData, '_self');
    //         } else if (transactiontype === 'PO') {
    //             window.open('/purchaseordercard?id=' + listData, '_self');
    //         } else if (transactiontype === 'Bill') {
    //             //window.open('/billcard?id=' + listData,'_self');
    //         } else if (transactiontype === 'Credit') {
    //             //window.open('/creditcard?id=' + listData,'_self');
    //         } else if (transactiontype === 'Customer Payment') {
    //             window.open('/paymentcard?id=' + listData, '_self');
    //         } else if (transactiontype === 'Cheque') {
    //             window.open('/chequecard?id=' + listData, '_self');
    //         }

    //     }
    // });

});

Template.basreturntransactionlist.events({
    'click .chkDatatable': function(event) {
        var columns = $('#tblBasReturnTransactionList th');
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
        var getcurrentCloudDetails = CloudUser.findOne({ _id: Session.get('mycloudLogonID'), clouddatabaseID: Session.get('mycloudLogonDBID') });
        if (getcurrentCloudDetails) {
            if (getcurrentCloudDetails._id.length > 0) {
                var clientID = getcurrentCloudDetails._id;
                var clientUsername = getcurrentCloudDetails.cloudUsername;
                var clientEmail = getcurrentCloudDetails.cloudEmail;
                var checkPrefDetails = CloudPreference.findOne({ userid: clientID, PrefName: 'tblBasReturnTransactionList' });
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
                var checkPrefDetails = CloudPreference.findOne({ userid: clientID, PrefName: 'tblBasReturnTransactionList' });
                if (checkPrefDetails) {
                    CloudPreference.update({ _id: checkPrefDetails._id }, {
                        $set: {
                            userid: clientID,
                            username: clientUsername,
                            useremail: clientEmail,
                            PrefGroup: 'salesform',
                            PrefName: 'tblBasReturnTransactionList',
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
                        PrefName: 'tblBasReturnTransactionList',
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
        var datable = $('#tblBasReturnTransactionList').DataTable();
        var title = datable.column(columnDatanIndex).header();
        $(title).html(columData);

    },
    'change .rngRange': function(event) {
        let range = $(event.target).val();
        $(event.target).closest("div.divColWidth").find(".spWidth").html(range + 'px');

        let columData = $(event.target).closest("div.divColWidth").find(".spWidth").attr("value");
        let columnDataValue = $(event.target).closest("div").prev().find(".divcolumn").text();
        var datable = $('#tblBasReturnTransactionList th');
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
        var columns = $('#tblBasReturnTransactionList th');

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
                sIndex: v.id || '',
                sVisible: columVisible || false,
                sClass: v.className || ''
            };
            tableHeaderList.push(datatablerecordObj);
        });
        templateObject.tableheaderrecords.set(tableHeaderList);
    },
    'click #exportbtn': function() {
        $('.fullScreenSpin').css('display', 'inline-block');
        jQuery('#tblBasReturnTransactionList_wrapper .dt-buttons .btntabletocsv').click();
        $('.fullScreenSpin').css('display', 'none');

    },
    'click .printConfirm': function(event) {
        playPrintAudio();
        setTimeout(function() {
            $('.fullScreenSpin').css('display', 'inline-block');
            jQuery('#tblBasReturnTransactionList_wrapper .dt-buttons .btntabletopdf').click();
            $('.fullScreenSpin').css('display', 'none');
        }, delayTimeAfterSound);
    },
    'click .btnRefresh': function() {
        $('.fullScreenSpin').css('display', 'inline-block');
        //localStorage.setItem('VS1BalanceTrans_Report', '');
        Meteor._reload.reload();
    },
    'click .btnRefreshTrans': function() {
        $('.fullScreenSpin').css('display', 'inline-block');
        //localStorage.setItem('VS1BalanceTrans_Report', '');
        Meteor._reload.reload();
    },
    'keyup #tblBasReturnTransactionList_filter input': function(event) {
        if ($(event.target).val() != '') {
            $(".btnRefreshTrans").addClass('btnSearchAlert');
        } else {
            $(".btnRefreshTrans").removeClass('btnSearchAlert');
        }
        if (event.keyCode == 13) {
            $(".btnRefreshTrans").trigger("click");
        }
    }
});

Template.basreturntransactionlist.helpers({
    datatablerecords: () => {
        return Template.instance().datatablerecords.get();
        // return Template.instance().datatablerecords.get().sort(function(a, b) {
        //     if (a.type == 'NA') {
        //         return 1;
        //     } else if (b.type == 'NA') {
        //         return -1;
        //     }
        //     return (a.type.toUpperCase() > b.type.toUpperCase()) ? 1 : -1;
        // });
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    salesCloudPreferenceRec: () => {
        return CloudPreference.findOne({ userid: Session.get('mycloudLogonID'), PrefName: 'tblBasReturnTransactionList' });
    }
});