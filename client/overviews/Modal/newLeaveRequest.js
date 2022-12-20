import { ReactiveVar } from "meteor/reactive-var";
import moment from "moment";
import { AccountService } from "../../accounts/account-service";
import Datehandler from "../../DateHandler";
import GlobalFunctions from "../../GlobalFunctions";
import { OrganisationService } from "../../js/organisation-service";
import { SideBarService } from "../../js/sidebar-service";
import TableHandler from "../../js/Table/TableHandler";
import CachedHttp from "../../lib/global/CachedHttp";
import erpObject from "../../lib/global/erp-objects";
import LoadingOverlay from "../../LoadingOverlay";
import { TaxRateService } from "../../settings/settings-service";
import { UtilityService } from "../../utility-service";
import EmployeePayrollApi from "../../js/Api/EmployeePayrollApi";
import AssignLeaveType from "../../js/Api/Model/AssignLeaveType";

let utilityService = new UtilityService();
let sideBarService = new SideBarService();
let accountService = new AccountService();
let taxRateService = new TaxRateService();
let organisationService = new OrganisationService();

Template.newLeaveRequestModal.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.assignLeaveTypeInfos = new ReactiveVar();
    templateObject.currentDrpDownID = new ReactiveVar();
});

Template.newLeaveRequestModal.onRendered(() => {
    const templateObject = Template.instance();
    $('#newLeaveRequestModal').on('shown.bs.modal', async function(e) {
        let empID = $('#edtEmpID').val() || 0;
        if (empID) {
            $('.fullScreenSpin').css('display', 'inline-block');
            $('.fullScreenSpin').css('display', 'none');
        }
    });

    templateObject.saveAssignLeaveType = async() => {
        const employeePayrolApis = new EmployeePayrollApi();
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

    templateObject.getAssignLeaveTypes();

    setTimeout(function() {
        $("#dtStartingDate,#dtDOB,#dtTermninationDate,#dtAsOf,#edtLeaveStartDate,#edtLeaveEndDate,#edtPeriodPaymentDate,#paymentDate").datepicker({
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
 

        $('#edtLeavePayPeriod').editableSelect('add', 'Weekly');
        $('#edtLeavePayPeriod').editableSelect('add', 'Fortnightly');
        $('#edtLeavePayPeriod').editableSelect('add', 'Twice Monthly');
        $('#edtLeavePayPeriod').editableSelect('add', 'Four Weekly');
        $('#edtLeavePayPeriod').editableSelect('add', 'Monthly');
        $('#edtLeavePayPeriod').editableSelect('add', 'Quarterly');
        
        $('#edtLeavePayPeriod').val('Weekly');

        $('#edtLeavePayStatus').editableSelect('add', 'Awaiting');
        $('#edtLeavePayStatus').editableSelect('add', 'Approved');
        $('#edtLeavePayStatus').editableSelect('add', 'Denied');
        $('#edtLeavePayStatus').editableSelect('add', 'Deleted');

        $('#edtLeavePayStatus').val('Awaiting'); 

        $('#period').editableSelect('add', 'Weekly');
        $('#period').editableSelect('add', 'Fortnightly');
        $('#period').editableSelect('add', 'Twice Monthly');
        $('#period').editableSelect('add', 'Four Weekly');
        $('#period').editableSelect('add', 'Monthly');
        $('#period').editableSelect('add', 'Quarterly'); 

        $('#edtLeaveTypeofRequest').editableSelect();
        $('#edtLeaveTypeofRequest').editableSelect()
            .on('click.editable-select', async function(e, li) {
                let $search = $(this);
                let dropDownID = $search.attr('id')
                templateObject.currentDrpDownID.set(dropDownID);
                let offset = $search.offset();
                let searchName = e.target.value || '';
                if (e.pageX > offset.left + $search.width() - 8) { // X button 16px wide?
                    $('#assignLeaveTypeSettingsModal').modal('show');
                } else {
                    if (searchName.replace(/\s/g, '') == '') {
                        $('#assignLeaveTypeSettingsModal').modal('show');
                        return false
                    }
                    let dataObject = await getVS1Data('TAssignLeaveType');
                    console.log(dataObject, "----------dataObject");
                    if (dataObject.length > 0) {
                        data = JSON.parse(dataObject[0].data);
                        let tAssignteavetype = data.tassignleavetype.filter((item) => {
                            if (item.fields.LeaveType == searchName) {
                                return item;
                            }
                        });

                        if (tAssignteavetype.length > 0) {

                            let leaveCalcMethod = tAssignteavetype[0].fields.LeaveCalcMethod || '';

                            $('#leaveCalcMethodSelect').val(leaveCalcMethod)
                            switch (leaveCalcMethod) {
                                case 'Manually Recorded Rate':
                                    $('#hoursLeave').val('');
                                    $('.handleLeaveTypeOption').addClass('hideelement');
                                    $('.manuallyRecordedRate').removeClass('hideelement');
                                    $('#hoursLeave').val(tAssignteavetype[0].fields.HoursLeave);
                                    break;
                                case 'No Calculation Required':
                                    $('.handleLeaveTypeOption').addClass('hideelement')
                                    break;
                                case 'Based on Ordinary Earnings':
                                    $('#hoursAccruedAnnuallyFullTimeEmp').val('');
                                    $('#hoursFullTimeEmpFortnightlyPay').val('');
                                    $('.handleLeaveTypeOption').addClass('hideelement');
                                    $('.basedonOrdinaryEarnings').removeClass('hideelement');
                                    $('#hoursAccruedAnnuallyFullTimeEmp').val(tAssignteavetype[0].fields.HoursAccruedAnnuallyFullTimeEmp);
                                    $('#hoursFullTimeEmpFortnightlyPay').val(tAssignteavetype[0].fields.HoursFullTimeEmpFortnightlyPay);
                                    break;
                                default:
                                    $('#hoursAccruedAnnually').val('');
                                    $('.handleLeaveTypeOption').addClass('hideelement');
                                    $('.fixedAmountEachPeriodOption').removeClass('hideelement');
                                    $('#hoursAccruedAnnually').val(tAssignteavetype[0].fields.HoursAccruedAnnually);
                                    break;
                            }

                            $('#leaveTypeSelect').val(tAssignteavetype[0].fields.LeaveType || '');
                            $('#leaveCalcMethodSelect').val(tAssignteavetype[0].fields.LeaveCalcMethod);

                            $('#openingBalance').val(tAssignteavetype[0].fields.OpeningBalance);
                            $('#onTerminationUnusedBalance').prop("checked", tAssignteavetype[0].fields.OnTerminationUnusedBalance);
                            $("#eftLeaveType").prop('checked', tAssignteavetype[0].fields.EFTLeaveType)
                            $("#superannuationGuarantee").prop('checked', tAssignteavetype[0].fields.SuperannuationGuarantee)

                            $('#assignteavetypeID').val(tAssignteavetype[0].fields.ID) || 0;
                        }
                        $('#assignLeaveTypeModal').modal('show');
                    }
                }
            });
    }, 1000);

});

Template.newLeaveRequestModal.events({
    'click #btnSaveLeaveRequest': async function(event) {
        
        playSaveAudio();

        let templateObject = Template.instance();
        
        setTimeout(async function() {

            let currentId     = FlowRouter.current().queryParams;
            let employeeID    = (!isNaN(currentId.id)) ? currentId.id : 0;
            let ID            = $('#edtLeaveRequestID').val();
            let TypeofRequest = $('#edtLeaveTypeofRequestID').val();
            let Leave         = $('#edtLeaveTypeofRequest').val();
            let Description   = $('#edtLeaveDescription').val();
            let StartDate     = $('#edtLeaveStartDate').val();
            let EndDate       = $('#edtLeaveEndDate').val();
            let PayPeriod     = $('#edtLeavePayPeriod').val();
            let Hours         = $('#edtLeaveHours').val();
            let Status        = $('#edtLeavePayStatus').val();

            const leaveRequests = [];
            const employeePayrolApis = new EmployeePayrollApi();

            const apiEndpoint = employeePayrolApis.collection.findByName(
                employeePayrolApis.collectionNames.TLeavRequest
            );

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
                let dbEndDate   = moment(EndDate, "DD/MM/YYYY").format('YYYY-MM-DD HH:mm:ss')

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

                        window.open("/appointments", "_self");
                    } 
                    else 
                    {
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

});

Template.newLeaveRequestModal.helpers({

});