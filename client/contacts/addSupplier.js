import { ContactService } from "./contact-service";
import { ReactiveVar } from 'meteor/reactive-var';
import { UtilityService } from "../utility-service";
import { CountryService } from '../js/country-service';
import { PaymentsService } from '../payments/payments-service';
import { SideBarService } from '../js/sidebar-service';
import { CRMService } from "../crm/crm-service";
import '../lib/global/indexdbstorage.js';

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
Template.supplierscard.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.records = new ReactiveVar();
    templateObject.countryData = new ReactiveVar();
    templateObject.supplierrecords = new ReactiveVar([]);
    templateObject.recentTrasactions = new ReactiveVar([]);
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.preferredPaymentList = new ReactiveVar();
    templateObject.termsList = new ReactiveVar();
    templateObject.deliveryMethodList = new ReactiveVar();
    templateObject.taxCodeList = new ReactiveVar();
    templateObject.defaultpurchasetaxcode = new ReactiveVar();
    templateObject.defaultpurchaseterm = new ReactiveVar();
    templateObject.isSameAddress = new ReactiveVar();
    templateObject.isSameAddress.set(false);

    /* Attachments */
    templateObject.uploadedFile = new ReactiveVar();
    templateObject.uploadedFiles = new ReactiveVar([]);
    templateObject.attachmentCount = new ReactiveVar();
    templateObject.currentAttachLineID = new ReactiveVar();
    templateObject.correspondences = new ReactiveVar([]);
    templateObject.crmRecords = new ReactiveVar([]);

    templateObject.active_projects = new ReactiveVar([]);
    templateObject.deleted_projects = new ReactiveVar([]);
    templateObject.favorite_projects = new ReactiveVar([]);
    templateObject.tprojectlist = new ReactiveVar([]);
    templateObject.all_projects = new ReactiveVar([]);
    templateObject.subTasks = new ReactiveVar([]);
});

Template.supplierscard.onRendered(function() {
    $('.fullScreenSpin').css('display', 'inline-block');

    let templateObject = Template.instance();
    const contactService = new ContactService();
    const countryService = new CountryService();
    const paymentService = new PaymentsService();
    const crmService = new CRMService();
    let countries = [];

    let preferredPayments = [];
    let terms = [];
    let deliveryMethods = [];
    let taxCodes = [];
    let currentId = FlowRouter.current().queryParams;
    if (FlowRouter.current().route.name != "supplierscard") {
        currentId = "";
    }
    let supplierID = '';
    let totAmount = 0;
    let totAmountOverDue = 0;
    const dataTableList = [];
    const tableHeaderList = [];

    let purchasetaxcode = '';
    templateObject.defaultpurchasetaxcode.set(loggedTaxCodeSalesInc);

    setTimeout(() => {
        $("#edtBankName").editableSelect();
        $("#edtBankName")
            .editableSelect()
            .on("click.editable-select", function(e, li) {
                var $earch = $(this);
                var offset = $earch.offset();
                var bankName = e.target.value || "";

                if (e.pageX > offset.left + $earch.width() - 8) {
                    $("#bankNameModal").modal();
                    $(".fullScreenSpin").css("display", "none");

                } else {
                    if (bankName.replace(/\s/g, "") != "") {
                        $("#bankNameModal").modal("toggle");
                    } else {
                        $("#bankNameModal").modal();
                    }
                }
            });

    }, 2500);

    templateObject.updateTaskSchedule = function(id, date) {
        let due_date = "";
        let due_date_display = "No Date";
        if (date) {
            due_date = moment(date).format("YYYY-MM-DD hh:mm:ss");
            due_date_display = moment(due_date).format("dddd, Do MMMM");
        }
        $('#edit_task_modal_due_date').html(due_date_display)

        var objDetails = {
            type: "Tprojecttasks",
            fields: {
                ID: id,
                due_date: due_date,
            },
        };

        if (id) {
            $(".fullScreenSpin").css("display", "inline-block");
            crmService.saveNewTask(objDetails).then(function(data) {
                templateObject.getAllTaskList();
                $(".fullScreenSpin").css("display", "none");
                $(".btnRefresh").addClass('btnSearchAlert');
            });
        }
    };

    $(document).on("click", "#tblBankName tbody tr", function(e) {
        var table = $(this);
        let BankName = table.find(".bankName").text();
        $('#bankNameModal').modal('toggle');
        $('#edtBankName').val(BankName);
    });

    templateObject.fillBankInfoFromUrl = function() {
        var queryParams = FlowRouter.current().queryParams;
        if (queryParams.bank) {
            let edtBankName = queryParams.edtBankName;
            let edtBankAccountName = queryParams.edtBankAccountName;
            let edtBSB = queryParams.edtBSB;
            let edtBankAccountNo = queryParams.edtBankAccountNo;
            let swiftCode = queryParams.swiftCode;
            let apcaNo = queryParams.apcaNo;
            let routingNo = queryParams.routingNo;
            let sltBankCodes = queryParams.sltBankCodes;
            $('.bilingTab').click();
            $('#edtBankName').val(edtBankName)
            $('#edtBankAccountName').val(edtBankAccountName)
            $('#edtBsb').val(edtBSB)
            $('#edtBankAccountNumber').val(edtBankAccountNo)
            $('#edtSwiftCode').val(swiftCode)
            $('#edtRoutingNumber').val(routingNo)
                // $('#sltCurrency').val()
        }
    }
    setTimeout(() => {
        templateObject.fillBankInfoFromUrl();
    }, 3500);

    // $(document).ready(function () {
    //     history.pushState(null, document.title, location.href);
    //     window.addEventListener('popstate', function (event) {
    //         swal({
    //             title: 'Leave Supplier Screen',
    //             text: "Do you want to leave this screen?",
    //             type: 'info',
    //             showCancelButton: true,
    //             confirmButtonText: 'Save'
    //         }).then((result) => {
    //             if (result.value) {
    //                 $(".btnSave").trigger("click");
    //             } else if (result.dismiss === 'cancel') {
    //                 window.open('/supplierlist', "_self");
    //             } else {

    //             }
    //         });

    //     });


    // });
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
    setTimeout(function() {
        $("#dtAsOf").datepicker({
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
    }, 100);

    function MakeNegative() {
        $('td').each(function() {
            if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
        });
    }

    templateObject.getReferenceLetters = () => {
        getVS1Data('TCorrespondence').then(data => {
            if (data.length == 0) {
                sideBarService.getCorrespondences().then(dataObject => {
                    addVS1Data('TCorrespondence', JSON.stringify(dataObject))
                    let tempArray = [];
                    if (dataObject.tcorrespondence.length > 0) {
                        let temp = dataObject.tcorrespondence.filter(item => {
                            return item.fields.EmployeeId == Session.get('mySessionEmployeeLoggedID')
                        })

                        for (let i = 0; i < temp.length; i++) {
                            for (let j = i + 1; j < temp.length; j++) {
                                if (temp[i].fields.Ref_Type == temp[j].fields.Ref_Type) {
                                    temp[j].fields.dup = true
                                }
                            }
                        }

                        temp.map(item => {
                            if (item.fields.EmployeeId == Session.get('mySessionEmployeeLoggedID') && item.fields.dup != true) {
                                tempArray.push(item.fields)
                            }
                        })
                    }
                    templateObject.correspondences.set(tempArray)
                })
            } else {
                let dataObj = JSON.parse(data[0].data);
                let tempArray = [];
                if (dataObj.tcorrespondence.length > 0) {
                    let temp = dataObj.tcorrespondence.filter(item => {
                        return item.fields.EmployeeId == Session.get('mySessionEmployeeLoggedID')
                    })

                    for (let i = 0; i < temp.length; i++) {
                        for (let j = i + 1; j < temp.length; j++) {
                            if (temp[i].fields.Ref_Type == temp[j].fields.Ref_Type) {
                                temp[j].fields.dup = true
                            }
                        }
                    }
                    temp.map(item => {
                        if (item.fields.EmployeeId == Session.get('mySessionEmployeeLoggedID') && item.fields.dup != true) {
                            tempArray.push(item.fields)
                        }
                    })
                }
                templateObject.correspondences.set(tempArray)
            }
        }).catch(function() {
            sideBarService.getCorrespondences().then(dataObject => {
                addVS1Data('TCorrespondence', JSON.stringify(dataObject));
                let tempArray = [];
                if (dataObject.tcorrespondence.length > 0) {
                    let temp = dataObject.tcorrespondence.filter(item => {
                        return item.fields.EmployeeId == Session.get('mySessionEmployeeLoggedID')
                    })

                    for (let i = 0; i < temp.length; i++) {
                        for (let j = i + 1; j < temp.length; j++) {
                            if (temp[i].fields.Ref_Type == temp[j].fields.Ref_Type) {
                                temp[j].fields.dup = true
                            }
                        }
                    }
                    temp.map(item => {
                        if (item.fields.EmployeeId == Session.get('mySessionEmployeeLoggedID') && item.fields.dup != true) {
                            tempArray.push(item.fields)
                        }
                    })
                }
                templateObject.correspondences.set(tempArray)
            })
        })
    }

    templateObject.makeTaskTableRows = function(task_array) {
        let taskRows = new Array();
        let td0, td1, tflag, td11, td2, td3, td4, td5, td6 = "",
            tcontact = "";
        let projectName = "";
        let labelsForExcel = "";
        let color_num = '100';

        let todayDate = moment().format("ddd");
        let tomorrowDay = moment().add(1, "day").format("ddd");
        let nextMonday = moment(moment()).day(1 + 7).format("ddd MMM D");

        let chk_complete, completed = "";
        let completed_style = "";
        task_array.forEach((item) => {
            if (item.fields.Completed) {
                completed = "checked";
                chk_complete = "chk_uncomplete";
                // completed_style = "display:none;"
            } else {
                completed = "";
                chk_complete = "chk_complete";
            }
            td0 = `
        <div class="custom-control custom-checkbox chkBox pointer no-modal "
          style="width:15px;margin-right: -6px;">
          <input class="custom-control-input chkBox chkComplete pointer ${chk_complete}" type="checkbox"
            id="formCheck-${item.fields.ID}" ${completed}>
          <label class="custom-control-label chkBox pointer ${chk_complete}" data-id="${item.fields.ID}"
            for="formCheck-${item.fields.ID}"></label>
        </div>`;

            tflag = `<i class="fas fa-flag task_modal_priority_${item.fields.priority}" data-id="${item.fields.ID}" aria-haspopup="true" aria-expanded="false"></i>`;

            // tempcode  need to add ContactName, AssignName fields to Tprojecttasks
            tcontact = item.fields.ContactName;
            // if (item.fields.LeadID) {
            //   let cData = getContactDetailById(item.fields.LeadID, 'Lead');
            //   tcontact = cData ? cData.fields.ClientName : "";
            // } else if (item.fields.SupplierID) {
            //   let cData = getContactDetailById(item.fields.SupplierID, 'Supplier');
            //   tcontact = cData ? cData.fields.ClientName : "";
            // } else if (item.fields.JobID) {
            //   let cData = getContactDetailById(item.fields.LeadID, 'Job');
            //   tcontact = cData ? cData.fields.ClientName : "";
            // } else {

            // }

            if (item.fields.due_date == "" || item.fields.due_date == null) {
                td1 = "";
                td11 = "";
            } else {
                td11 = moment(item.fields.due_date).format("DD/MM/YYYY");
                td1 = `<label style="display:none;">${item.fields.due_date}</label>` + td11;

                let tdue_date = moment(item.fields.due_date).format("YYYY-MM-DD");
                if (tdue_date <= moment().format("YYYY-MM-DD")) {
                    color_num = 3; // Red
                } else if (tdue_date > moment().format("YYYY-MM-DD") && tdue_date <= moment().add(2, "day").format("YYYY-MM-DD")) {
                    color_num = 2; // Orange
                } else if (tdue_date > moment().add(2, "day").format("YYYY-MM-DD") && tdue_date <= moment().add(7, "day").format("YYYY-MM-DD")) {
                    color_num = 0; // Green
                }

                td0 = `
        <div class="custom-control custom-checkbox chkBox pointer no-modal task_priority_${color_num}"
          style="width:15px;margin-right: -6px;${completed_style}">
          <input class="custom-control-input chkBox chkComplete pointer" type="checkbox"
            id="formCheck-${item.fields.ID}" ${completed}>
          <label class="custom-control-label chkBox pointer ${chk_complete}" data-id="${item.fields.ID}"
            for="formCheck-${item.fields.ID}"></label>
        </div>`;
            }

            td2 = item.fields.TaskName;
            td3 = item.fields.TaskDescription.length < 80 ? item.fields.TaskDescription : item.fields.TaskDescription.substring(0, 79) + "...";

            if (item.fields.TaskLabel) {
                if (item.fields.TaskLabel.fields) {
                    td4 = `<span class="taskTag"><a class="taganchor filterByLabel" href="" data-id="${item.fields.TaskLabel.fields.ID}"><i class="fas fa-tag"
          style="margin-right: 5px; color:${item.fields.TaskLabel.fields.Color}" data-id="${item.fields.TaskLabel.fields.ID}"></i>${item.fields.TaskLabel.fields.TaskLabelName}</a></span>`;
                    labelsForExcel = item.fields.TaskLabel.fields.TaskLabelName;
                } else {
                    item.fields.TaskLabel.forEach((lbl) => {
                        td4 += `<span class="taskTag"><a class="taganchor filterByLabel" href="" data-id="${lbl.fields.ID}"><i class="fas fa-tag"
            style="margin-right: 5px; color:${lbl.fields.Color}" data-id="${lbl.fields.ID}"></i>${lbl.fields.TaskLabelName}</a></span>`;
                        labelsForExcel += lbl.fields.TaskLabelName + " ";
                    });
                }
            } else {
                td4 = "";
            }

            projectName = item.fields.ProjectName;
            if (item.fields.ProjectName == "" || item.fields.ProjectName == "Default") {
                projectName = "";
            }

            let all_projects = templateObject.all_projects.get();
            let projectColor = 'transparent';
            if (item.fields.ProjectID != 0) {
                let projects = all_projects.filter(project => project.fields.ID == item.fields.ProjectID);
                if (projects.length && projects[0].fields.ProjectColour) {
                    projectColor = projects[0].fields.ProjectColour;
                }
            }

            td5 = `
      <div style="display:flex; justify-content:center;">
        <div class="dropdown btnTaskTableAction">
          <button type="button" class="btn btn-success" data-toggle="dropdown"><i
              class="far fa-calendar" title="Reschedule Task"></i></button>
          <div class="dropdown-menu dropdown-menu-right reschedule-dropdown-menu  no-modal"
            aria-labelledby="dropdownMenuButton" style="width: 275px;">
            <a class="dropdown-item no-modal setScheduleToday" href="#" data-id="${item.fields.ID}">
              <i class="fas fa-calendar-day text-success no-modal"
                style="margin-right: 8px;"></i>Today
              <div class="float-right no-modal" style="width: 40%; text-align: end; color: #858796;">
                ${todayDate}</div>
            </a>
            <a class="dropdown-item no-modal setScheduleTomorrow" href="#"
              data-id="${item.fields.ID}">
              <i class="fas fa-sun text-warning no-modal" style="margin-right: 8px;"></i>Tomorrow
              <div class="float-right no-modal" style="width: 40%; text-align: end; color: #858796;">
                ${tomorrowDay}</div>
            </a>
            <a class="dropdown-item no-modal setScheduleWeekend" href="#"
              data-id="${item.fields.ID}">
              <i class="fas fa-couch text-primary no-modal" style="margin-right: 8px;"></i>This Weekend
              <div class="float-right no-modal" style="width: 40%; text-align: end; color: #858796;">
                Sat</div>
            </a>
            <a class="dropdown-item no-modal setScheduleNexweek" href="#"
              data-id="${item.fields.ID}">
              <i class="fas fa-calendar-alt text-danger no-modal" style="margin-right: 8px;"></i>Next Week
              <div class="float-right no-modal" style="width: 40%; text-align: end; color: #858796;">
                ${nextMonday}
              </div>
            </a>
            <a class="dropdown-item no-modal setScheduleNodate" href="#" data-id="${item.fields.ID}">
              <i class="fas fa-ban text-secondary no-modal" style="margin-right: 8px;"></i>
              No Date</a>
            <div class="dropdown-divider no-modal"></div>
            <div class="form-group no-modal" data-toggle="tooltip" data-placement="bottom"
              title="Date format: DD/MM/YYYY" style="display:flex; margin: 6px 20px; margin-top: 0px; z-index: 99999;">
              <label style="margin-top: 6px; margin-right: 16px; width: 146px;">Select Date</label>
              <div class="input-group date no-modal" style="cursor: pointer;">
                <input type="text" id="${item.fields.ID}" class="form-control crmDatepicker no-modal"
                  autocomplete="off">
                <div class="input-group-addon no-modal">
                  <span class="glyphicon glyphicon-th no-modal" style="cursor: pointer;"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="dropdown btnTaskTableAction">
          <button type="button" class="btn btn-warning openEditTaskModal" data-id="${item.fields.ID}"
            data-ttype="comment" data-catg="${projectName}"
            title="Add a Comment"><i class="far fa-comment-alt" data-id="${item.fields.ID}"
              data-ttype="comment"
              data-catg="${projectName}"></i></button>
        </div>

        <div class="dropdown btnTaskTableAction">
          <button type="button" class="btn btn-secondary" data-toggle="dropdown"
            data-placement="bottom" title="More Options"><i class="fas fa-ellipsis-h"></i></button>
          <div class="dropdown-menu dropdown-menu-right crmtaskdrop" id="">
            <a class="dropdown-item openEditTaskModal" data-id="${item.fields.ID}"
              data-catg="${projectName}">
              <i class="far fa-edit" style="margin-right: 8px;" data-id="${item.fields.ID}"
                data-catg="${projectName}"></i>Edit
              Task</a>

            <div class="dropdown-divider"></div>

            <div class="dropdown-item-wrap no-modal">
              <div class="no-modal">
                <div class="no-modal">
                  <span class="no-modal">Priority</span>
                </div>
                <div class="no-modal" style="display: inline-flex;">
                  <i class="fas fa-flag no-modal taskDropSecondFlag task_modal_priority_3" style="padding-left: 8px;" data-toggle="tooltip"
                    data-placement="bottom" title="Priority 1" data-priority="3"
                    data-id="${item.fields.ID}"></i>
                  <i class="fas fa-flag no-modal taskDropSecondFlag task_modal_priority_2"
                    data-toggle="tooltip" data-placement="bottom" title="Priority 2" data-priority="2"
                    data-id="${item.fields.ID}"></i>
                  <i class="fas fa-flag no-modal taskDropSecondFlag task_modal_priority_1"
                    data-toggle="tooltip" data-placement="bottom" title="Priority 3" data-priority="1"
                    data-id="${item.fields.ID}"></i>
                  <i class="fas fa-flag no-modal taskDropSecondFlag task_modal_priority_0" data-toggle="tooltip"
                    data-placement="bottom" title="Priority 4" data-priority="0"
                    data-id="${item.fields.ID}"></i>
                </div>
              </div>
            </div>

            <div class="dropdown-divider"></div>

            <a class="dropdown-item no-modal movetoproject" data-id="${item.fields.ID}"
              data-projectid="${item.fields.ProjectID}">
              <i class="fa fa-arrow-circle-right" style="margin-right: 8px;"
                data-id="${item.fields.ID}" data-projectid="${item.fields.ProjectID}"></i>Move to
              Project</a>
            <a class="dropdown-item duplicate-task no-modal" data-id="${item.fields.ID}">
              <i class="fa fa-plus-square-o" style="margin-right: 8px;"
                data-id="${item.fields.ID}"></i>Duplicate</a>

            <div class="dropdown-divider"></div>

            <a class="dropdown-item delete-task no-modal" data-id="${item.fields.ID}">
              <i class="fas fa-trash-alt" style="margin-right: 8px;"
                data-id="${item.fields.ID}"></i>Delete
              Task</a>
          </div>
        </div>
      </div>`;

            td6 = ``;
            if (item.fields.Active) {
                td6 = "";
            } else {
                td6 = "In-Active";
            }
            taskRows.push([
                // td0,
                tflag,
                tcontact,
                td1,
                td2,
                td3,
                td4,
                projectName,
                td6,
                item.fields.ID,
                color_num,
                labelsForExcel,
                item.fields.Completed,
                projectColor
            ]);
        });
        return taskRows;
    };

    templateObject.initSubtaskDatatable = function() {

        let splashArrayTaskList = templateObject.makeTaskTableRows(templateObject.subTasks.get());

        try {
            $("#tblSubtaskDatatable").DataTable({
                data: splashArrayTaskList,
                columnDefs: [
                    // {
                    //   orderable: false,
                    //   targets: 0,
                    //   className: "colCompleteTask colSubComplete",
                    //   createdCell: function (td, cellData, rowData, row, col) {
                    //     $(td).closest("tr").attr("data-id", rowData[8]);
                    //     $(td).attr("data-id", rowData[8]);
                    //     $(td).addClass("task_priority_" + rowData[10]);
                    //     if (rowData[12]) {
                    //       $(td).addClass("taskCompleted");
                    //     }
                    //   },
                    //   width: "18px",
                    // },
                    {
                        orderable: false,
                        targets: 0,
                        className: "colPriority openEditSubTaskModal hiddenColumn",
                        createdCell: function(td, cellData, rowData, row, col) {
                            $(td).closest("tr").attr("data-id", rowData[8]);
                            $(td).attr("data-id", rowData[8]);
                        },
                        width: "100px",
                    },
                    {
                        orderable: false,
                        targets: 1,
                        className: "colContact openEditSubTaskModal hiddenColumn",
                        createdCell: function(td, cellData, rowData, row, col) {
                            $(td).attr("data-id", rowData[8]);
                        },
                        width: "100px",
                    },
                    {
                        targets: 2,
                        className: "colSubDate openEditSubTaskModal",
                        createdCell: function(td, cellData, rowData, row, col) {
                            $(td).attr("data-id", rowData[8]);
                        },
                        width: "120px",
                    },
                    {
                        targets: 3,
                        className: "colSubTaskName openEditSubTaskModal",
                        createdCell: function(td, cellData, rowData, row, col) {
                            $(td).attr("data-id", rowData[9]);
                        },
                    },
                    {
                        targets: 4,
                        className: "colTaskDesc openEditSubTaskModal hiddenColumn",
                        createdCell: function(td, cellData, rowData, row, col) {
                            $(td).attr("data-id", rowData[8]);
                        },
                    },
                    {
                        targets: 5,
                        className: "colTaskLabels openEditSubTaskModal hiddenColumn",
                        createdCell: function(td, cellData, rowData, row, col) {
                            $(td).attr("data-id", rowData[8]);
                        },
                    },
                    {
                        targets: 6,
                        className: "colTaskProjects openEditSubTaskModal hiddenColumn",
                        createdCell: function(td, cellData, rowData, row, col) {
                            $(td).attr("data-id", rowData[8]);
                        },
                    },
                    {
                        orderable: false,
                        targets: 7,
                        className: "colStatus openEditSubTaskModal",
                        createdCell: function(td, cellData, rowData, row, col) {
                            $(td).attr("data-id", rowData[8]);
                        },
                    },
                    // {
                    //   orderable: false,
                    //   targets: 8,
                    //   className: "colTaskActions",
                    //   createdCell: function (td, cellData, rowData, row, col) {
                    //     $(td).attr("data-id", rowData[8]);
                    //   },
                    //   width: "150px",
                    // },
                ],
                colReorder: {
                    fixedColumnsLeft: 0,
                },
                sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                select: true,
                destroy: true,
                // colReorder: true,
                pageLength: initialDatatableLoad,
                lengthMenu: [
                    [initialDatatableLoad, -1],
                    [initialDatatableLoad, "All"],
                ],
                info: true,
                responsive: true,
                order: [
                    [1, "desc"],
                ],
                action: function() {
                    $("#tblSubtaskDatatable").DataTable().ajax.reload();
                },
            });

        } catch (error) {}
    }

    templateObject.getOverviewAPData = function(supplierName, supplierID) {
        // getVS1Data('TAPReport1').then(function (dataObject) {
        //     if(dataObject.length === 0){
        //         paymentService.getOverviewAPDetailsSupp(supplierID).then(function (data) {
        //             setOverviewAPDetails(data, supplierName);
        //         });
        //     }else{
        //         let data = JSON.parse(dataObject[0].data);
        //         setOverviewAPDetails(data, supplierName);
        //     }
        // }).catch(function (err) {
        //     paymentService.getOverviewAPDetailsSupp(supplierID).then(function (data) {
        //         setOverviewAPDetails(data, supplierName);
        //     });
        // });
    };

    function setOverviewAPDetails(data, supplierName) {
        let itemsAwaitingPaymentcount = [];
        let itemsOverduePaymentcount = [];
        let dataListAwaitingCust = {};
        let customerawaitingpaymentCount = '';
        for (let i = 0; i < data.tapreport.length; i++) {
            if ((data.tapreport[i].AmountDue !== 0) && supplierName.replace(/\s/g, '') === data.tapreport[i].Printname.replace(/\s/g, '')) {
                //itemsAwaitingPaymentcount.push(dataListAwaitingCust);
                totAmount += Number(data.tapreport[i].AmountDue);
                let date = new Date(data.tapreport[i].DueDate);
                let totOverdueLine = Number(data.tapreport[i].AmountDue) - Number(data.tapreport[i].Current) || 0;
                //if (date < new Date()) {
                //itemsOverduePaymentcount.push(dataListAwaitingCust);
                totAmountOverDue += totOverdueLine;
                //}
            }
        }
        $('.suppAwaitingAmt').text(utilityService.modifynegativeCurrencyFormat(totAmount));
        $('.suppOverdueAmt').text(utilityService.modifynegativeCurrencyFormat(totAmountOverDue));
    }

    templateObject.getCountryData = function() {
        getVS1Data('TCountries').then(function(dataObject) {
            if (dataObject.length === 0) {
                countryService.getCountry().then((data) => {
                    setCountry(data);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                setCountry(data);

            }
        }).catch(function(err) {
            countryService.getCountry().then((data) => {
                setCountry(data);
            });
        });
    };

    function setCountry(data) {
        for (let i = 0; i < data.tcountries.length; i++) {
            countries.push(data.tcountries[i].Country)
        }
        countries.sort((a, b) => a.localeCompare(b));
        templateObject.countryData.set(countries);
    }
    templateObject.getCountryData();

    templateObject.getAllProductRecentTransactions = function(supplierName) {
        getVS1Data('TbillReport').then(function(dataObject) {
            if (dataObject.length === 0) {
                contactService.getAllTransListBySupplier(supplierName).then(function(data) {
                    setAllProductRecentTransactions(data, supplierName);
                }).catch(function(err) {
                    // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                    $('.fullScreenSpin').css('display', 'none');
                    // Meteor._reload.reload();
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                setAllProductRecentTransactions(data, supplierName);
            }
        }).catch(function(err) {
            contactService.getAllTransListBySupplier(supplierName).then(function(data) {
                setAllProductRecentTransactions(data, supplierName);
            }).catch(function(err) {
                // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                $('.fullScreenSpin').css('display', 'none');
                // Meteor._reload.reload();
            });
        });

    };

    function setAllProductRecentTransactions(data, supplierName) {
        for (let i = 0; i < data.tbillreport.length; i++) {
            let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.tbillreport[i]['Total Amount (Ex)']) || 0.00;
            let totalTax = utilityService.modifynegativeCurrencyFormat(data.tbillreport[i]['Total Tax']) || 0.00;
            let totalAmount = utilityService.modifynegativeCurrencyFormat(data.tbillreport[i]['Total Amount (Inc)']) || 0.00;
            let amountPaidCalc = data.tbillreport[i]['Total Amount (Inc)'] - data.tbillreport[i].Balance;
            let totalPaid = utilityService.modifynegativeCurrencyFormat(amountPaidCalc) || 0.00;
            let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tbillreport[i].Balance) || 0.00;
            const dataList = {
                id: data.tbillreport[i].PurchaseOrderID || '',
                employee: data.tbillreport[i].Contact || '',
                sortdate: data.tbillreport[i].OrderDate !== '' ? moment(data.tbillreport[i].OrderDate).format("YYYY/MM/DD") : data.tbillreport[i].OrderDate,
                orderdate: data.tbillreport[i].OrderDate !== '' ? moment(data.tbillreport[i].OrderDate).format("DD/MM/YYYY") : data.tbillreport[i].OrderDate,
                suppliername: data.tbillreport[i].Company || '',
                totalamountex: totalAmountEx || 0.00,
                totaltax: totalTax || 0.00,
                totalamount: totalAmount || 0.00,
                totalpaid: totalPaid || 0.00,
                totaloustanding: totalOutstanding || 0.00,
                orderstatus: '',
                type: data.tbillreport[i].Type || '',
                custfield1: data.tbillreport[i].Phone || '',
                custfield2: data.tbillreport[i].InvoiceNumber || '',
                comments: data.tbillreport[i].Comments || '',
            };
            if (data.tbillreport[i].Company === supplierName) {
                dataTableList.push(dataList);
            }
        }
        templateObject.datatablerecords.set(dataTableList);
        if (templateObject.datatablerecords.get()) {
            setTimeout(function() {
                MakeNegative();
            }, 100);
        }
        // $('.suppAwaitingAmt').text(utilityService.modifynegativeCurrencyFormat(totAmount));
        // $('.suppOverdueAmt').text(utilityService.modifynegativeCurrencyFormat(totAmountOverDue));
        $('.fullScreenSpin').css('display', 'none');
        setTimeout(function() {
            //$.fn.dataTable.moment('DD/MM/YY');
            $('#tblTransactionlist').DataTable({
                // dom: 'lBfrtip',
                columnDefs: [
                    { type: 'date', targets: 0 }
                ],
                "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                buttons: [{
                    extend: 'excelHtml5',
                    text: '',
                    download: 'open',
                    className: "btntabletocsv hiddenColumn",
                    filename: "Supplier Purchase Transactions - " + moment().format(),
                    orientation: 'portrait',
                    exportOptions: {
                        columns: ':visible'
                    }
                }, {
                    extend: 'print',
                    download: 'open',
                    className: "btntabletopdf hiddenColumn",
                    text: '',
                    title: 'Purchase Transaction',
                    filename: "Supplier Purchase Transactions - " + moment().format(),
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
            }).on('column-reorder', function() {

            });
            $('.fullScreenSpin').css('display', 'none');
        }, 0);

        const columns = $('#tblTransactionlist th');
        let sWidth = "";
        let columVisible = false;
        $.each(columns, function(i, v) {
            if (v.hidden === false) {
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
            const listData = $(this).closest('tr').attr('id');
            const transactiontype = $(event.target).closest("tr").find(".colStatus").text();
            if ((listData) && (transactiontype)) {
                if (transactiontype === 'Purchase Order') {
                    window.open('/purchaseordercard?id=' + listData, '_self');
                } else if (transactiontype === 'Bill') {
                    window.open('/billcard?id=' + listData, '_self');
                } else if (transactiontype === 'Credit') {
                    window.open('/creditcard?id=' + listData, '_self');
                } else {
                    //window.open('/purchaseordercard?id=' + listData,'_self');
                }
            }
        });
    }

    templateObject.getPreferredPaymentList = function() {
        getVS1Data('TPaymentMethod').then(function(dataObject) {
            if (dataObject.length === 0) {
                contactService.getPaymentMethodDataVS1().then((data) => {
                    setPreferredPaymentList(data);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                setPreferredPaymentList(data);
            }
        }).catch(function(err) {
            contactService.getPaymentMethodDataVS1().then((data) => {
                setPreferredPaymentList(data);
            });
        });
    };

    function setPreferredPaymentList(data) {
        for (let i = 0; i < data.tpaymentmethodvs1.length; i++) {
            preferredPayments.push(data.tpaymentmethodvs1[i].fields.PaymentMethodName)
        }
        preferredPayments = _.sortBy(preferredPayments);
        templateObject.preferredPaymentList.set(preferredPayments);
    }
    templateObject.getPreferredPaymentList();

    templateObject.getTermsList = function() {
        getVS1Data('TTermsVS1').then(function(dataObject) {
            if (dataObject.length === 0) {
                contactService.getTermDataVS1().then((data) => {
                    setTermsDataVS1(data);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                setTermsDataVS1(data);
            }
        }).catch(function(err) {
            contactService.getTermDataVS1().then((data) => {
                setTermsDataVS1(data);
            });
        });
    };

    function setTermsDataVS1(data) {
        for (let i = 0; i < data.ttermsvs1.length; i++) {
            terms.push(data.ttermsvs1[i].TermsName);
            if (data.ttermsvs1[i].isPurchasedefault === true) {
                templateObject.defaultpurchaseterm.set(data.ttermsvs1[i].TermsName);
                Session.setPersistent('ERPTermsPurchase', data.ttermsvs1[i].TermsName || "COD");
                if (JSON.stringify(currentId) != '{}') {
                    if (currentId.id == "undefined") {
                        $('#sltTerms').val(data.ttermsvs1[i].TermsName);
                    }
                } else {
                    $('#sltTerms').val(data.ttermsvs1[i].TermsName);
                }
            }
        }
        terms = _.sortBy(terms);
        templateObject.termsList.set(terms);
    }
    templateObject.getTermsList();

    templateObject.getDeliveryMethodList = function() {
        getVS1Data('TShippingMethod').then(function(dataObject) {
            if (dataObject.length === 0) {
                contactService.getShippingMethodData().then((data) => {
                    setShippingMethodData(data);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                setShippingMethodData(data);
            }
        }).catch(function(err) {
            contactService.getShippingMethodData().then((data) => {
                setShippingMethodData(data);
            });
        });

    };

    function setShippingMethodData(data) {
        for (let i = 0; i < data.tshippingmethod.length; i++) {
            deliveryMethods.push(data.tshippingmethod[i].ShippingMethod)
        }
        deliveryMethods = _.sortBy(deliveryMethods);
        templateObject.deliveryMethodList.set(deliveryMethods);
    }
    templateObject.getDeliveryMethodList();

    templateObject.getTaxCodesList = function() {
        getVS1Data('TTaxcodeVS1').then(function(dataObject) {
            if (dataObject.length === 0) {
                contactService.getTaxCodesVS1().then((data) => {
                    setTaxCodesVS1(data);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                setTaxCodesVS1(data);
            }
        }).catch(function(err) {
            contactService.getTaxCodesVS1().then((data) => {
                setTaxCodesVS1(data);
            });
        });

    };

    function setTaxCodesVS1(data) {
        for (let i = 0; i < data.ttaxcodevs1.length; i++) {
            taxCodes.push(data.ttaxcodevs1[i].CodeName)
        }
        taxCodes = _.sortBy(taxCodes);
        templateObject.taxCodeList.set(taxCodes);
    }
    templateObject.getTaxCodesList();

    templateObject.getEmployeeData = function() {
        getVS1Data('TSupplierVS1').then(function(dataObject) {
            if (dataObject.length === 0) {
                contactService.getOneSupplierDataEx(supplierID).then(function(data) {

                    setOneSupplierDataEx(data);
                    // add to custom field
                    // tempcode
                    // setTimeout(function () {
                    //   $('#edtSaleCustField1').val(data.fields.CUSTFLD1);
                    //   $('#edtSaleCustField2').val(data.fields.CUSTFLD2);
                    //   $('#edtSaleCustField3').val(data.fields.CUSTFLD3);
                    // }, 5500);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tsuppliervs1;
                let added = false;
                for (let i = 0; i < useData.length; i++) {
                    if (parseInt(useData[i].fields.ID) === parseInt(supplierID)) {
                        added = true;
                        setOneSupplierDataEx(useData[i]);
                        // add to custom field
                        // tempcode
                        // setTimeout(function () {
                        //   $('#edtSaleCustField1').val(useData[i].fields.CUSTFLD1);
                        //   $('#edtSaleCustField2').val(useData[i].fields.CUSTFLD2);
                        //   $('#edtSaleCustField3').val(useData[i].fields.CUSTFLD3);
                        // }, 5500);
                    }
                }
                if (!added) {
                    contactService.getOneSupplierDataEx(supplierID).then(function(data) {
                        setOneSupplierDataEx(data);
                        // add to custom field
                        // tempcode
                        // setTimeout(function () {
                        //   $('#edtSaleCustField1').val(data.fields.CUSTFLD1);
                        //   $('#edtSaleCustField2').val(data.fields.CUSTFLD2);
                        //   $('#edtSaleCustField3').val(data.fields.CUSTFLD3);
                        // }, 5500);
                    });
                }
            }
        }).catch(function(err) {
            contactService.getOneSupplierDataEx(supplierID).then(function(data) {
                setOneSupplierDataEx(data);
            });
        });
    };
    templateObject.getEmployeeDataByName = function() {
        getVS1Data('TSupplierVS1').then(function(dataObject) {
            if (dataObject.length === 0) {
                contactService.getOneSupplierDataExByName(supplierID).then(function(data) {
                    setOneSupplierDataEx(data.tsupplier[0]);
                }).catch(function(err) {
                    $('.fullScreenSpin').css('display', 'none');
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tsuppliervs1;
                let added = false;
                for (let i = 0; i < useData.length; i++) {
                    if ((useData[i].fields.ClientName) === supplierID) {
                        added = true;
                        setOneSupplierDataEx(useData[i]);
                    }
                }
                if (!added) {
                    contactService.getOneSupplierDataExByName(supplierID).then(function(data) {
                        setOneSupplierDataEx(data.tsupplier[0]);
                    }).catch(function(err) {
                        $('.fullScreenSpin').css('display', 'none');
                    });
                }
            }
        }).catch(function(err) {
            contactService.getOneSupplierDataExByName(supplierID).then(function(data) {
                setOneSupplierDataEx(data.tsupplier[0]);
            }).catch(function(err) {
                $('.fullScreenSpin').css('display', 'none');
            });
        });
    };

    function setOneSupplierDataEx(data) {
        let lineItemObj = {
            id: data.fields.ID,
            lid: 'Edit Supplier',
            company: data.fields.ClientName || '',
            email: data.fields.Email || '',
            title: data.fields.Title || '',
            firstname: data.fields.FirstName || '',
            middlename: data.fields.CUSTFLD10 || '',
            lastname: data.fields.LastName || '',
            tfn: '' || '',
            phone: data.fields.Phone || '',
            mobile: data.fields.Mobile || '',
            fax: data.fields.Faxnumber || '',
            skype: data.fields.SkypeName || '',
            website: data.fields.URL || '',
            shippingaddress: data.fields.Street || '',
            scity: data.fields.Street2 || '',
            sstate: data.fields.State || '',
            spostalcode: data.fields.Postcode || '',
            scountry: data.fields.Country || LoggedCountry,
            billingaddress: data.fields.BillStreet || '',
            bcity: data.fields.BillStreet2 || '',
            bstate: data.fields.BillState || '',
            bpostalcode: data.fields.BillPostcode || '',
            bcountry: data.fields.Billcountry || '',
            custfield1: data.fields.CUSTFLD1 || '',
            custfield2: data.fields.CUSTFLD2 || '',
            custfield3: data.fields.CUSTFLD3 || '',
            custfield4: data.fields.CUSTFLD4 || '',
            notes: data.fields.Notes || '',
            preferedpayment: data.fields.PaymentMethodName || '',
            terms: data.fields.TermsName || '',
            deliverymethod: data.fields.ShippingMethodName || '',
            accountnumber: data.fields.ClientNo || 0.00,
            isContractor: data.fields.Contractor || false,
            issupplier: data.fields.IsSupplier || false,
            iscustomer: data.fields.IsCustomer || false,
            bankName: data.fields.BankName || '',
            swiftCode: data.fields.SwiftCode || '',
            routingNumber: data.fields.RoutingNumber || '',
            bankAccountName: data.fields.BankAccountName || '',
            bankAccountBSB: data.fields.BankAccountBSB || '',
            bankAccountNo: data.fields.BankAccountNo || '',
            foreignExchangeCode: data.fields.ForeignExchangeCode || CountryAbbr,
            // openingbalancedate: data.fields.RewardPointsOpeningDate ? moment(data.fields.RewardPointsOpeningDate).format('DD/MM/YYYY') : "",
            // taxcode:data.fields.TaxCodeName || templateObject.defaultsaletaxcode.get()
        };


        $('#sltCurrency').val(data.fields.ForeignExchangeCode || CountryAbbr);

        if ((data.fields.Street === data.fields.BillStreet) && (data.fields.Street2 === data.fields.BillStreet2) &&
            (data.fields.State === data.fields.BillState) && (data.fields.Postcode === data.fields.Postcode) &&
            (data.fields.Country === data.fields.Billcountry)) {
            templateObject.isSameAddress.set(true);
        }
        if (data.fields.Contractor === true) {
            // $('#isformcontractor')
            $('#isformcontractor').attr("checked", "checked");
        } else {
            $('#isformcontractor').removeAttr("checked");
        }
        templateObject.getOverviewAPData(data.fields.ClientName, data.fields.ID);
        templateObject.records.set(lineItemObj);
        templateObject.getAllCrm(data.fields.ClientName);
        /* START attachment */
        templateObject.attachmentCount.set(0);
        if (data.fields.Attachments) {
            if (data.fields.Attachments.length) {
                templateObject.attachmentCount.set(data.fields.Attachments.length);
                templateObject.uploadedFiles.set(data.fields.Attachments);

            }
        }

        setTimeout(function() {
                const rowCount = $('.results tbody tr').length;
                $('.counter').text(rowCount + 'items');
                setTab();
            }, 1000)
            /* END  attachment */
            //templateObject.getAllProductRecentTransactions(data.fields.ClientName);
        $('.fullScreenSpin').css('display', 'none');
    }

    templateObject.getAllCrm = function(supplierName) {
        $('.fullScreenSpin').css('display', 'inline-block');
        let employeeID = Session.get("mySessionEmployeeLoggedID");
        var url = FlowRouter.current().path;
        if (url.includes("/employeescard")) {
            url = new URL(window.location.href);
            employeeID = url.searchParams.get("id");
        }
        let dataTableList = [];
        crmService.getAllTasksByContactName(supplierName).then(async function(data) {
            if (data.tprojecttasks.length > 0) {
                for (let i = 0; i < data.tprojecttasks.length; i++) {
                    let taskLabel = data.tprojecttasks[i].fields.TaskLabel;
                    let taskLabelArray = [];
                    if (taskLabel !== null) {
                        if (taskLabel.length === undefined || taskLabel.length === 0) {
                            taskLabelArray.push(taskLabel.fields);
                        } else {
                            for (let j = 0; j < taskLabel.length; j++) {
                                taskLabelArray.push(taskLabel[j].fields);
                            }
                        }
                    }
                    let taskDescription = data.tprojecttasks[i].fields.TaskDescription || '';
                    taskDescription = taskDescription.length < 50 ? taskDescription : taskDescription.substring(0, 49) + "...";
                    const dataList = {
                        id: data.tprojecttasks[i].fields.ID || 0,
                        priority: data.tprojecttasks[i].fields.priority || 0,
                        date: data.tprojecttasks[i].fields.due_date !== '' ? moment(data.tprojecttasks[i].fields.due_date).format("DD/MM/YYYY") : '',
                        taskName: 'Task',
                        projectID: data.tprojecttasks[i].fields.ProjectID || '',
                        projectName: data.tprojecttasks[i].fields.ProjectName || '',
                        description: taskDescription,
                        labels: taskLabelArray,
                        category: 'task',
                        completed: data.tprojecttasks[i].fields.Completed,
                        completedby: data.tprojecttasks[i].fields.due_date ? moment(data.tprojecttasks[i].fields.due_date).format("DD/MM/YYYY") : "",
                    };
                    dataTableList.push(dataList);
                }
            }
            await getAppointments();
        }).catch(function(err) {
            getAppointments();
        })

        async function getAppointments() {
            crmService.getAllAppointments(supplierName).then(async function(dataObj) {
                if (dataObj.tappointmentex.length > 0) {
                    dataObj.tappointmentex.map(data => {
                        let obj = {
                            id: data.fields.ID,
                            priority: 0,
                            date: data.fields.StartTime !== '' ? moment(data.fields.StartTime).format("DD/MM/YYYY") : '',
                            taskName: 'Appointment',
                            projectID: data.fields.ProjectID || '',
                            projectName: '',
                            description: '',
                            labels: '',
                            category: 'appointment',
                            completed: data.fields.Actual_EndTime ? true : false,
                            completedby: data.fields.Actual_EndTime ? moment(data.fields.Actual_EndTime).format("DD/MM/YYYY") : "",
                        }

                        dataTableList.push(obj);
                    })
                }
                await getEmails();
            }).catch(function(error) {
                getEmails();
            })
        }

        async function getEmails() {
            sideBarService.getCorrespondences().then(dataReturn => {
                    let totalCorrespondences = dataReturn.tcorrespondence;
                    totalCorrespondences = totalCorrespondences.filter(item => {
                        return item.fields.MessageTo == $('#edtSupplierCompanyEmail').val()
                    })
                    if (totalCorrespondences.length > 0 && $('#edtSupplierCompanyEmail').val() != '') {
                        totalCorrespondences.map(item => {
                            let labels = [];
                            labels.push(item.fields.Ref_Type)
                            let obj = {
                                id: item.fields.MessageId ? parseInt(item.fields.MessageId) : 999999,
                                priority: 0,
                                date: item.fields.Ref_Date !== '' ? moment(item.fields.Ref_Date).format('DD/MM/YYYY') : '',
                                taskName: 'Email',
                                projectID: '',
                                projectName: '',
                                description: '',
                                labels: '',
                                category: 'email',
                                completed: false,
                                completedby: "",
                            }
                            dataTableList.push(obj)
                        })
                    }
                    try {
                        dataTableList.sort((a, b) => {
                            new Date(a.date) - new Date(b.date)
                        })
                        templateObject.crmRecords.set(dataTableList);
                    } catch (error) {}
                    setCrmProjectTasks()

                })
                .catch((err) => {
                    templateObject.crmRecords.set(dataTableList);
                    setCrmProjectTasks()
                    $('.fullScreenSpin').css('display', 'none');
                })
        }

    };

    function setCrmProjectTasks() {
        let tableHeaderList = [];

        if (templateObject.crmRecords.get()) {
            setTimeout(function() {
                MakeNegative();
                $("#dtAsOf").datepicker({
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
            }, 100);
        }
        // $('.custAwaitingAmt').text(utilityService.modifynegativeCurrencyFormat(totAmount));
        // $('.custOverdueAmt').text(utilityService.modifynegativeCurrencyFormat(totAmountOverDue));
        $('.fullScreenSpin').css('display', 'none');
        setTimeout(function() {
            //$.fn.dataTable.moment('DD/MM/YY');
            $('#tblCrmList').DataTable({
                // dom: 'lBfrtip',
                columnDefs: [
                    { type: 'date', targets: 0 }
                ],
                "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                buttons: [{
                    extend: 'excelHtml5',
                    text: '',
                    download: 'open',
                    className: "btntabletocsv hiddenColumn",
                    filename: "Leads CRM List - " + moment().format(),
                    orientation: 'portrait',
                    exportOptions: {
                        columns: ':visible'
                    }
                }, {
                    extend: 'print',
                    download: 'open',
                    className: "btntabletopdf hiddenColumn",
                    text: '',
                    title: 'Leads CRM',
                    filename: "Leads CRM List - " + moment().format(),
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
                    [0, "desc"],
                    [2, "desc"]
                ],
                action: function() {
                    $('#tblCrmList').DataTable().ajax.reload();
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
                let draftRecord = templateObject.crmRecords.get();
                templateObject.crmRecords.set(draftRecord);
            }).on('column-reorder', function() {

            });

            $('.fullScreenSpin').css('display', 'none');
        }, 0);

        const columns = $('#tblCrmList th');
        let sWidth = "";
        let columVisible = false;
        $.each(columns, function(i, v) {
            if (v.hidden === false) {
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
        templateObject.crmTableheaderRecords.set(tableHeaderList);
        $('div.dataTables_filter input').addClass('form-control form-control-sm');
    }
    async function setInitialForEmptyCurrentID() {
        let lineItemObj = {
            id: '',
            lid: 'Add Supplier',
            company: '',
            email: '',
            title: '',
            firstname: '',
            middlename: '',
            lastname: '',
            tfn: '',
            terms: loggedTermsPurchase || '',
            phone: '',
            mobile: '',
            fax: '',
            shippingaddress: '',
            scity: '',
            sstate: '',
            spostalcode: '',
            scountry: LoggedCountry || '',
            billingaddress: '',
            bcity: '',
            bstate: '',
            bpostalcode: '',
            bcountry: LoggedCountry || '',
            custFld1: '',
            custFld2: '',
            bankName: '',
            swiftCode: '',
            routingNumber: '',
            bankAccountName: '',
            bankAccountBSB: '',
            bankAccountNo: '',
        };
        templateObject.isSameAddress.set(true);
        templateObject.records.set(lineItemObj);
        setTimeout(function() {
            $('#tblTransactionlist').DataTable();
            // $('.supplierTab').trigger('click');
            setTab();
            $('.fullScreenSpin').css('display', 'none');
        }, 100);

        await templateObject.getTermsList();
        setTimeout(function() {
            $('#sltTerms').val(lineItemObj.terms);
        }, 3000);
        $('.fullScreenSpin').css('display', 'none');
    }
    if (JSON.stringify(currentId) != '{}') {
        if (currentId.id === "undefined" || currentId.name === "undefined") {
            setInitialForEmptyCurrentID();
        } else {
            if (!isNaN(currentId.id)) {
                supplierID = currentId.id;
                templateObject.getEmployeeData();
                templateObject.getReferenceLetters();
            } else if ((currentId.name)) {
                supplierID = currentId.name.replace(/%20/g, " ");
                templateObject.getEmployeeDataByName();
            } else {
                setInitialForEmptyCurrentID();
            }
        }
    } else {
        setInitialForEmptyCurrentID();
    }
    templateObject.getSuppliersList = function() {
        getVS1Data('TSupplierVS1').then(function(dataObject) {
            if (dataObject.length === 0) {
                contactService.getAllSupplierSideDataVS1().then(function(data) {
                    setAllSupplierSideDataVS1(data);
                }).catch(function(err) {

                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                setAllSupplierSideDataVS1(data);
            }
        }).catch(function(err) {
            contactService.getAllSupplierSideDataVS1().then(function(data) {
                setAllSupplierSideDataVS1(data);
            }).catch(function(err) {

            });
        });
    };

    function setAllSupplierSideDataVS1(data) {
        let lineItemsSupp = [];
        for (let j = 0; j < data.tsuppliervs1.length; j++) {
            let classname = '';
            if (!isNaN(currentId.id)) {
                if (data.tsuppliervs1[j].fields.ID === parseInt(currentId.id)) {
                    classname = 'currentSelect';
                }
            }
            const dataListSupp = {
                id: data.tsuppliervs1[j].fields.ID || '',
                company: data.tsuppliervs1[j].fields.ClientName || '',
                classname: classname
            };
            lineItemsSupp.push(dataListSupp);
        }
        templateObject.supplierrecords.set(lineItemsSupp);
        if (templateObject.supplierrecords.get()) {
            setTimeout(function() {
                $('.counter').text(lineItemsSupp.length + ' items');
            }, 100);
        }
    }
    templateObject.getSuppliersList();

    setTimeout(function() {
        const x = window.matchMedia("(max-width: 1024px)");

        function mediaQuery(x) {
            if (x.matches) {
                $("#displayList").removeClass("col-2");
                $("#displayList").addClass("col-3");
                $("#displayInfo").removeClass("col-10");
                $("#displayInfo").addClass("col-9");
            }
        }
        mediaQuery(x);
        x.addListener(mediaQuery)
    }, 500);
    setTimeout(function() {
        const x = window.matchMedia("(max-width: 420px)");
        const btnView = document.getElementById("btnsViewHide");

        function mediaQuery(x) {
            if (x.matches) {
                $("#displayList").removeClass("col-3");
                $("#displayList").addClass("col-12");
                $("#supplierListCard").removeClass("cardB");
                $("#supplierListCard").addClass("cardB420");
                btnsViewHide.style.display = "none";
                $("#displayInfo").removeClass("col-10");
                $("#displayInfo").addClass("col-12");
            }
        }
        mediaQuery(x);
        x.addListener(mediaQuery)
    }, 500);

    $(document).on("click", "#paymentmethodList tbody tr", function(e) {
        let table = $(this);
        let linePaymentMethod = table.find(".colName").text();
        $("#sltPreferredPayment").val(linePaymentMethod);
        $('#paymentMethodModal').modal('toggle');
    });

    $(document).on('click', '#editSupplierTitle', function(e, li) {
        const $earch = $(this);
        const offset = $earch.offset();
        if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
            $('#supplierTitlePopModal').modal('toggle');
        } else {
            $('#supplierTitlePopModal').modal();
            // setTimeout(function() {
            //     $('#tblSupplierTitlePopList_filter .form-control-sm').focus();
            //     $('#tblSupplierTitlePopList_filter .form-control-sm').val('');
            //     $('#tblSupplierTitlePopList_filter .form-control-sm').trigger("input");
            //     const datatable = $('#tblSupplierTitlePopList').DataTable();
            //     datatable.draw();
            //     $('#tblSupplierTitlePopList_filter .form-control-sm').trigger("input");
            // }, 500);
        }
    });

    // $(document).on("click", "#tblSupplierTitlePopList tbody tr", function(e) {
    //     $('#editSupplierTitle').val($(this).find(".colTitleName").text());
    //     $('#supplierTitlePopModal').modal('toggle');
    //     $('#tblSupplierTitlePopList_filter .form-control-sm').val('');
    //     setTimeout(function() {
    //         $('.fullScreenSpin').css('display', 'none');
    //     }, 1000);
    // });

    function setTab() {
        if (currentId.crmTab === 'active') {
            $('.supplierTab').removeClass('active');
            $('.crmTab').trigger('click');
        } else {
            $('.supplierTab').addClass('active');
            $('.supplierTab').trigger('click')
        }
    }




    $(document).ready(function() {
        setTimeout(function() {
            $('#sltTerms').editableSelect();
            $('#sltPreferredPayment').editableSelect();
            $('#editSupplierTitle').editableSelect();
            $('#sltTerms').editableSelect()
                .on('click.editable-select', function(e, li) {
                    var $earch = $(this);
                    var offset = $earch.offset();
                    var termsDataName = e.target.value || '';
                    $('#edtTermsID').val('');
                    if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
                        $('#termsListModal').modal('toggle');
                    } else {
                        if (termsDataName.replace(/\s/g, '') != '') {
                            $('#termModalHeader').text('Edit Terms');
                            getVS1Data('TTermsVS1').then(function(dataObject) { //edit to test indexdb
                                if (dataObject.length == 0) {
                                    $('.fullScreenSpin').css('display', 'inline-block');
                                    sideBarService.getTermsVS1().then(function(data) {
                                        for (let i in data.ttermsvs1) {
                                            if (data.ttermsvs1[i].TermsName === termsDataName) {
                                                $('#edtTermsID').val(data.ttermsvs1[i].Id);
                                                $('#edtDays').val(data.ttermsvs1[i].Days);
                                                $('#edtName').val(data.ttermsvs1[i].TermsName);
                                                $('#edtDesc').val(data.ttermsvs1[i].Description);
                                                if (data.ttermsvs1[i].IsEOM === true) {
                                                    $('#isEOM').prop('checked', true);
                                                } else {
                                                    $('#isEOM').prop('checked', false);
                                                }
                                                if (data.ttermsvs1[i].IsEOMPlus === true) {
                                                    $('#isEOMPlus').prop('checked', true);
                                                } else {
                                                    $('#isEOMPlus').prop('checked', false);
                                                }
                                                if (data.ttermsvs1[i].isSalesdefault === true) {
                                                    $('#chkCustomerDef').prop('checked', true);
                                                } else {
                                                    $('#chkCustomerDef').prop('checked', false);
                                                }
                                                if (data.ttermsvs1[i].isPurchasedefault === true) {
                                                    $('#chkSupplierDef').prop('checked', true);
                                                } else {
                                                    $('#chkSupplierDef').prop('checked', false);
                                                }
                                            }
                                        }
                                        setTimeout(function() {
                                            $('.fullScreenSpin').css('display', 'none');
                                            $('#newTermsModal').modal('toggle');
                                        }, 200);
                                    });
                                } else {
                                    let data = JSON.parse(dataObject[0].data);
                                    let useData = data.ttermsvs1;
                                    for (let i in useData) {
                                        if (useData[i].TermsName === termsDataName) {
                                            $('#edtTermsID').val(useData[i].Id);
                                            $('#edtDays').val(useData[i].Days);
                                            $('#edtName').val(useData[i].TermsName);
                                            $('#edtDesc').val(useData[i].Description);
                                            if (useData[i].IsEOM === true) {
                                                $('#isEOM').prop('checked', true);
                                            } else {
                                                $('#isEOM').prop('checked', false);
                                            }
                                            if (useData[i].IsEOMPlus === true) {
                                                $('#isEOMPlus').prop('checked', true);
                                            } else {
                                                $('#isEOMPlus').prop('checked', false);
                                            }
                                            if (useData[i].isSalesdefault === true) {
                                                $('#chkCustomerDef').prop('checked', true);
                                            } else {
                                                $('#chkCustomerDef').prop('checked', false);
                                            }
                                            if (useData[i].isPurchasedefault === true) {
                                                $('#chkSupplierDef').prop('checked', true);
                                            } else {
                                                $('#chkSupplierDef').prop('checked', false);
                                            }
                                        }
                                    }
                                    setTimeout(function() {
                                        $('.fullScreenSpin').css('display', 'none');
                                        $('#newTermsModal').modal('toggle');
                                    }, 200);
                                }
                            }).catch(function(err) {
                                $('.fullScreenSpin').css('display', 'inline-block');
                                sideBarService.getTermsVS1().then(function(data) {
                                    for (let i in data.ttermsvs1) {
                                        if (data.ttermsvs1[i].TermsName === termsDataName) {
                                            $('#edtTermsID').val(data.ttermsvs1[i].Id);
                                            $('#edtDays').val(data.ttermsvs1[i].Days);
                                            $('#edtName').val(data.ttermsvs1[i].TermsName);
                                            $('#edtDesc').val(data.ttermsvs1[i].Description);
                                            if (data.ttermsvs1[i].IsEOM === true) {
                                                $('#isEOM').prop('checked', true);
                                            } else {
                                                $('#isEOM').prop('checked', false);
                                            }
                                            if (data.ttermsvs1[i].IsEOMPlus === true) {
                                                $('#isEOMPlus').prop('checked', true);
                                            } else {
                                                $('#isEOMPlus').prop('checked', false);
                                            }
                                            if (data.ttermsvs1[i].isSalesdefault === true) {
                                                $('#chkCustomerDef').prop('checked', true);
                                            } else {
                                                $('#chkCustomerDef').prop('checked', false);
                                            }
                                            if (data.ttermsvs1[i].isPurchasedefault === true) {
                                                $('#chkSupplierDef').prop('checked', true);
                                            } else {
                                                $('#chkSupplierDef').prop('checked', false);
                                            }
                                        }
                                    }
                                    setTimeout(function() {
                                        $('.fullScreenSpin').css('display', 'none');
                                        $('#newTermsModal').modal('toggle');
                                    }, 200);
                                });
                            });
                        } else {
                            $('#termsListModal').modal();
                            setTimeout(function() {
                                $('#termsList_filter .form-control-sm').focus();
                                $('#termsList_filter .form-control-sm').val('');
                                $('#termsList_filter .form-control-sm').trigger("input");
                                var datatable = $('#termsList').DataTable();
                                datatable.draw();
                                $('#termsList_filter .form-control-sm').trigger("input");
                            }, 500);
                        }
                    }
                });


            $('#sltPreferredPayment').editableSelect()
                .on('click.editable-select', function(e, li) {
                    var $earch = $(event.currentTarget);
                    var offset = $earch.offset();

                    // let customername = $('#edtCustomerName').val();
                    const templateObject = Template.instance();
                    $("#selectPaymentMethodLineID").val('');
                    $('#edtPaymentMethodID').val('');
                    $('#paymentMethodHeader').text('New Payment Method');
                    var paymentDataName = $(event.target).val() || '';
                    if (event.pageX > offset.left + $earch.width() - 10) { // X button 16px wide?
                        $('#paymentMethodModal').modal('toggle');
                        var targetID = $(event.target).closest('tr').attr('id');
                        $('#selectPaymentMethodLineID').val(targetID);
                        setTimeout(function() {
                            $('#paymentmethodList_filter .form-control-sm').focus();
                            $('#paymentmethodList_filter .form-control-sm').val('');
                            $('#paymentmethodList_filter .form-control-sm').trigger("input");

                            var datatable = $('#paymentmethodList').DataTable();
                            datatable.draw();
                            $('#paymentmethodList_filter .form-control-sm').trigger("input");

                        }, 500);
                    } else {
                        // var productDataID = $(event.target).attr('prodid').replace(/\s/g, '') || '';
                        if (paymentDataName.replace(/\s/g, '') != '') {
                            var targetID = $(event.target).closest('tr').attr('id');
                            $('#selectPaymentMethodLineID').val(targetID);

                            $('#paymentMethodHeader').text('Edit Payment Method');

                            getVS1Data('TPaymentMethod').then(function(dataObject) {
                                if (dataObject.length == 0) {
                                    $('.fullScreenSpin').css('display', 'inline-block');
                                    sideBarService.getPaymentMethodDataVS1().then(function(data) {
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
                                        setTimeout(function() {
                                            $('.fullScreenSpin').css('display', 'none');
                                            $('#newPaymentMethodModal').modal('toggle');
                                        }, 200);
                                    });
                                } else {
                                    let data = JSON.parse(dataObject[0].data);
                                    let useData = data.tpaymentmethodvs1;

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
                                    setTimeout(function() {
                                        $('.fullScreenSpin').css('display', 'none');
                                        $('#newPaymentMethodModal').modal('toggle');
                                    }, 200);
                                }
                            }).catch(function(err) {
                                $('.fullScreenSpin').css('display', 'inline-block');
                                sideBarService.getPaymentMethodDataVS1().then(function(data) {
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
                                    setTimeout(function() {
                                        $('.fullScreenSpin').css('display', 'none');
                                        $('#newPaymentMethodModal').modal('toggle');
                                    }, 200);
                                });
                            });

                        } else {
                            $('#paymentMethodModal').modal('toggle');
                            var targetID = $(event.target).closest('tr').attr('id');
                            $('#selectPaymentMethodLineID').val(targetID);
                            setTimeout(function() {
                                $('#paymentmethodList_filter .form-control-sm').focus();
                                $('#paymentmethodList_filter .form-control-sm').val('');
                                $('#paymentmethodList_filter .form-control-sm').trigger("input");

                                var datatable = $('#paymentmethodList').DataTable();
                                datatable.draw();
                                $('#paymentmethodList_filter .form-control-sm').trigger("input");

                            }, 500);
                        }

                    }

                });

            $(document).on("click", "#referenceLetterModal .btnSaveLetterTemp", function(e) {
                if ($("input[name='refTemp']:checked").attr('value') == undefined || $("input[name='refTemp']:checked").attr('value') == null) {
                    swal({
                        title: 'Oooops...',
                        text: "No email template has been set",
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Cancel'
                    }).then((result) => {
                        if (result.value) {
                            $('#referenceLetterModal').modal('toggle');
                        }
                    });
                } else {
                    let email = $('#edtSupplierCompanyEmail').val();
                    let dataLabel = $("input[name='refTemp']:checked").attr('value');
                    let dataSubject = $("input[name='refTemp']:checked").attr('data-subject');
                    let dataMemo = $("input[name='refTemp']:checked").attr('data-memo');
                    if (email && email != null && email != '') {
                        document.location =
                            "mailto:" + email + "?subject=" + dataSubject + "&body=" + dataMemo;
                        sideBarService.getCorrespondences().then(dataObject => {
                            let temp = {
                                type: "TCorrespondence",
                                fields: {
                                    Active: true,
                                    EmployeeId: Session.get('mySessionEmployeeLoggedID'),
                                    Ref_Type: dataLabel,
                                    MessageAsString: dataMemo,
                                    MessageFrom: Session.get('mySessionEmployee'),
                                    MessageId: dataObject.tcorrespondence.length.toString(),
                                    MessageTo: email,
                                    ReferenceTxt: dataSubject,
                                    Ref_Date: moment().format('YYYY-MM-DD'),
                                    Status: ""
                                }
                            }
                            sideBarService.saveCorrespondence(temp).then(data => {
                                sideBarService.getCorrespondences().then(dataUpdate => {
                                    addVS1Data('TCorrespondence', JSON.stringify(dataUpdate));
                                })
                                $('#referenceLetterModal').modal('toggle');
                            })
                        })
                    } else {
                        swal({
                            title: 'Oooops...',
                            text: "No user email has been set",
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Cancel'
                        }).then((result) => {
                            if (result.value) {
                                $('#referenceLetterModal').modal('toggle');
                            }
                        });
                    }
                }
            });

            $(document).on('click', '#referenceLetterModal .btnAddLetter', function(e) {
                $('#addLetterTemplateModal').modal('toggle')
            })


            $(document).on('click', '#addLetterTemplateModal #save-correspondence', function() {
                $('.fullScreenSpin').css('display', 'inline-block');
                // let correspondenceData = localStorage.getItem('correspondence');
                let correspondenceTemp = templateObject.correspondences.get()
                let tempLabel = $("#edtTemplateLbl").val();
                let tempSubject = $('#edtTemplateSubject').val();
                let tempContent = $("#edtTemplateContent").val();
                if (correspondenceTemp.length > 0) {
                    let index = correspondenceTemp.findIndex(item => {
                        return item.Ref_Type == tempLabel
                    })
                    if (index > 0) {
                        swal({
                            title: 'Oooops...',
                            text: 'There is already a template labeled ' + tempLabel,
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                        }).then((result) => {
                            if (result.value) {} else if (result.dismiss === 'cancel') {}
                        });
                        $('.fullScreenSpin').css('display', 'none');
                    } else {

                        sideBarService.getCorrespondences().then(dObject => {

                            let temp = {
                                Active: true,
                                EmployeeId: Session.get('mySessionEmployeeLoggedID'),
                                Ref_Type: tempLabel,
                                MessageAsString: tempContent,
                                MessageFrom: "",
                                MessageId: dObject.tcorrespondence.length.toString(),
                                MessageTo: "",
                                ReferenceTxt: tempSubject,
                                Ref_Date: moment().format('YYYY-MM-DD'),
                                Status: ""
                            }
                            let objDetails = {
                                type: 'TCorrespondence',
                                fields: temp
                            }

                            // let array = [];
                            // array.push(objDetails)

                            sideBarService.saveCorrespondence(objDetails).then(data => {
                                sideBarService.getCorrespondences().then(dataUpdate => {
                                    addVS1Data('TCorrespondence', JSON.stringify(dataUpdate)).then(function() {
                                        $('.fullScreenSpin').css('display', 'none');
                                        swal({
                                            title: 'Success',
                                            text: 'Template has been saved successfully ',
                                            type: 'success',
                                            showCancelButton: false,
                                            confirmButtonText: 'Continue'
                                        }).then((result) => {
                                            if (result.value) {
                                                $('#addLetterTemplateModal').modal('toggle')
                                                templateObject.getReferenceLetters();
                                            } else if (result.dismiss === 'cancel') {}
                                        });
                                    })
                                }).catch(function() {
                                    $('.fullScreenSpin').css('display', 'none');
                                    swal({
                                        title: 'Oooops...',
                                        text: 'Something went wrong',
                                        type: 'error',
                                        showCancelButton: false,
                                        confirmButtonText: 'Try Again'
                                    }).then((result) => {
                                        if (result.value) {
                                            $('#addLetterTemplateModal').modal('toggle')
                                        } else if (result.dismiss === 'cancel') {}
                                    });
                                })
                            }).catch(function() {
                                $('.fullScreenSpin').css('display', 'none');
                                swal({
                                    title: 'Oooops...',
                                    text: 'Something went wrong',
                                    type: 'error',
                                    showCancelButton: false,
                                    confirmButtonText: 'Try Again'
                                }).then((result) => {
                                    if (result.value) {
                                        $('#addLetterTemplateModal').modal('toggle')
                                    } else if (result.dismiss === 'cancel') {}
                                });
                            })

                        })
                    }
                } else {
                    sideBarService.getCorrespondences().then(dObject => {
                        let temp = {
                            Active: true,
                            EmployeeId: Session.get('mySessionEmployeeLoggedID'),
                            Ref_Type: tempLabel,
                            MessageAsString: tempContent,
                            MessageFrom: "",
                            MessageId: dObject.tcorrespondence.length.toString(),
                            MessageTo: "",
                            ReferenceTxt: tempSubject,
                            Ref_Date: moment().format('YYYY-MM-DD'),
                            Status: ""
                        }
                        let objDetails = {
                            type: 'TCorrespondence',
                            fields: temp
                        }

                        let array = [];
                        array.push(objDetails)

                        sideBarService.saveCorrespondence(objDetails).then(data => {
                            sideBarService.getCorrespondences().then(function(dataUpdate) {
                                addVS1Data('TCorrespondence', JSON.stringify(dataUpdate)).then(function() {
                                    $('.fullScreenSpin').css('display', 'none');
                                    swal({
                                        title: 'Success',
                                        text: 'Template has been saved successfully ',
                                        type: 'success',
                                        showCancelButton: false,
                                        confirmButtonText: 'Continue'
                                    }).then((result) => {
                                        if (result.value) {
                                            $('#addLetterTemplateModal').modal('toggle')
                                            templateObject.getReferenceLetters();

                                        } else if (result.dismiss === 'cancel') {}
                                    });
                                }).catch(function(err) {
                                    $('.fullScreenSpin').css('display', 'none');
                                    swal({
                                        title: 'Oooops...',
                                        text: 'Something went wrong',
                                        type: 'error',
                                        showCancelButton: false,
                                        confirmButtonText: 'Try Again'
                                    }).then((result) => {
                                        if (result.value) {
                                            $('#addLetterTemplateModal').modal('toggle')
                                        } else if (result.dismiss === 'cancel') {}
                                    });
                                })
                            })
                        }).catch(function() {
                            swal({
                                title: 'Oooops...',
                                text: 'Something went wrong',
                                type: 'error',
                                showCancelButton: false,
                                confirmButtonText: 'Try Again'
                            }).then((result) => {
                                if (result.value) {
                                    $('#addLetterTemplateModal').modal('toggle')
                                } else if (result.dismiss === 'cancel') {}
                            });
                        })
                    })

                }
                // localStorage.setItem('correspondence', JSON.stringify(correspondenceTemp));
                // templateObject.correspondences.set(correspondenceTemp);
                // $('#addLetterTemplateModal').modal('toggle');
            })

            $(document).on("click", "#termsList tbody tr", function(e) {
                $('#sltTerms').val($(this).find(".colTermName").text());
                $('#termsListModal').modal('toggle');
            });

            $(document).on("click", "#tblTitleList tbody tr", function (e) {
                $('#editSupplierTitle').val($(this).find(".colTypeName").text());
                $('#supplierTitlePopModal').modal('toggle');
            });

        }, 1000);
    });
});

Template.supplierscard.events({
    'keyup .txtSearchSupplier': function(event) {
        if ($(event.target).val() != '') {
            $(".btnRefreshSuppliers").addClass('btnSearchAlert');
        } else {
            $(".btnRefreshSuppliers").removeClass('btnSearchAlert');
        }
        if (event.keyCode == 13) {
            $(".btnRefreshSuppliers").trigger("click");
        }
    },
  
    'click .btnRefreshSuppliers': async function(event) {
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
        $('.fullScreenSpin').css('display', 'inline-block');
        let dataSearchName = $('.txtSearchSupplier').val() || '';
        if (dataSearchName.replace(/\s/g, '') != '') {
            sideBarService.getNewSupplierByNameOrID(dataSearchName).then(async function(data) {
                $(".btnRefreshSuppliers").removeClass('btnSearchAlert');
                let lineItems = [];
                let lineItemObj = {};
                if (data.tsuppliervs1.length > 0) {
                    $("#tblSupplierSideList > tbody").empty();
                    for (let i = 0; i < data.tsuppliervs1.length; i++) {
                        let classname = '';
                        if (!isNaN(currentId.id)) {
                            if (data.tsuppliervs1[i].fields.ID == parseInt(currentId.id)) {
                                classname = 'currentSelect';
                            }
                        }
                        const dataList = {
                            id: data.tsuppliervs1[i].fields.ID || '',
                            company: data.tsuppliervs1[i].fields.ClientName || '',
                            classname: classname
                        };
                        $(".tblSupplierSideList > tbody").append(
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
    'click #supplierShipping-1': function(event) {
        if ($(event.target).is(':checked')) {
            $('.supplierShipping-2').css('display', 'none');

        } else {
            $('.supplierShipping-2').css('display', 'block');
        }
    },
    'click .openBalance': function(event) {
        let currentId = FlowRouter.current().queryParams.id || '';
        let supplierName = $('#edtSupplierCompany').val() || '';
        if (supplierName !== "") {
            window.open('/agedpayables?contact=' + supplierName + '&contactid=' + currentId, '_self');
        } else {
            window.open('/agedpayables', '_self');
        }
    },
    'click .btnMakeSupplierPayment': async function(event) {
        let currentId = FlowRouter.current().queryParams.id || '';
        let supplierName = $('#edtSupplierCompany').val() || '';
        if (supplierName !== "") {
            await clearData('TAwaitingSupplierPayment');
            FlowRouter.go('/supplierawaitingpurchaseorder?contact=' + supplierName + '&contactid=' + currentId);
        }
    },
    'click .openBalancesummary': function(event) {
        let currentId = FlowRouter.current().queryParams.id || '';
        let supplierName = $('#edtSupplierCompany').val() || '';
        if (supplierName !== "") {
            window.open('/agedpayablessummary?contact=' + supplierName + '&contactid=' + currentId, '_self');
        } else {
            window.open('/agedpayablessummary', '_self');
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
        if ($(event.target).is(':checked')) {

            // let streetAddress = $('#edtSupplierShippingAddress').val();
            // let city = $('#edtSupplierShippingCity').val();
            // let state =  $('#edtSupplierShippingState').val();
            // let zipcode =  $('#edtSupplierShippingZIP').val();
            //
            // let country =  $('#sedtCountry').val();
            //  $('#edtSupplierBillingAddress').val(streetAddress);
            //  $('#edtSupplierBillingCity').val(city);
            //  $('#edtSupplierBillingState').val(state);
            //  $('#edtSupplierBillingZIP').val(zipcode);
            //  $('#bcountry').val(country);
        } else {
            // $('#edtSupplierBillingAddress').val('');
            // $('#edtSupplierBillingCity').val('');
            // $('#edtSupplierBillingState').val('');
            // $('#edtSupplierBillingZIP').val('');
            // $('#bcountry').val('');
        }
    },
    'click .btnSave': async function(event) {
        playSaveAudio();
        let templateObject = Template.instance();
        let contactService = new ContactService();
        setTimeout(async function() {
            if ($('#edtSupplierCompany').val() === '') {
                swal('Supplier Name should not be blank!', '', 'warning');
                e.preventDefault();
                return false;
            }
            $('.fullScreenSpin').css('display', 'inline-block');

            let company = $('#edtSupplierCompany').val() || '';
            let email = $('#edtSupplierCompanyEmail').val() || '';
            let title = $('#editSupplierTitle').val() || '';
            let firstname = $('#edtSupplierFirstName').val() || '';
            let middlename = $('#edtSupplierMiddleName').val() || '';
            let lastname = $('#edtSupplierLastName').val() || '';
            let suffix = $('#suffix').val() || '';
            let phone = $('#edtSupplierPhone').val() || '';
            let mobile = $('#edtSupplierMobile').val() || '';
            if (mobile && mobile !== '') {
                mobile = contactService.changeMobileFormat(mobile);
            }
            let fax = $('#edtSupplierFax').val() || '';
            let accountno = $('#edtSupplierAccountNo').val() || '';
            let skype = $('#edtSupplierSkypeID').val() || '';
            let website = $('#edtSupplierWebsite').val() || '';
            let streetAddress = $('#edtSupplierShippingAddress').val() || '';
            let city = $('#edtSupplierShippingCity').val() || '';
            let state = $('#edtSupplierShippingState').val() || '';
            let postalcode = $('#edtSupplierShippingZIP').val() || '';
            let country = $('#sedtCountry').val() || '';
            let bstreetAddress = '';
            let bcity = '';
            let bstate = '';
            let bpostalcode = '';
            let bcountry = '';
            let isContractor = false;
            let isCustomer = false;
            isCustomer = !!$('#chkSameAsCustomer').is(':checked');
            if ($('#isformcontractor').is(':checked')) {
                isContractor = true;
            }
            if ($('#chkSameAsShipping').is(':checked')) {
                bstreetAddress = streetAddress;
                bcity = city;
                bstate = state;
                bpostalcode = postalcode;
                bcountry = country;
            } else {
                bstreetAddress = $('#edtSupplierBillingAddress').val() || '';
                bcity = $('#edtSupplierBillingCity').val() || '';
                bstate = $('#edtSupplierBillingState').val() || '';
                bpostalcode = $('#edtSupplierBillingZIP').val() || '';
                bcountry = $('#bcountry').val() || '';
            }
            // Billing tab fields
            let sltPaymentMethodName = $('#sltPreferredPayment').val() || '';
            let sltTermsName = $('#sltTerms').val() || '';
            let sltShippingMethodName = '';
            let notes = $('#txaNotes').val() || '';
            let suppaccountno = $('#suppAccountNo').val() || '';
            let BankAccountName = $('#edtBankAccountName').val();
            let BSB = $('#edtBsb').val();
            let BankName = $('#edtBankName').val();
            let BankAccountNo = $('#edtBankAccountNumber').val();
            let SwiftCode = $('#edtSwiftCode').val();
            let RoutingNumber = $('#edtRoutingNumber').val();

            // add to custom field
            let custField1 = $('#edtSaleCustField1').val() || '';
            let custField2 = $('#edtSaleCustField2').val() || '';
            let custField3 = $('#edtSaleCustField3').val() || '';
            let custField4 = $('#edtCustomeField4').val() || '';

            const url = FlowRouter.current().path;
            const getemp_id = url.split('?id=');
            let currentEmployee = getemp_id[getemp_id.length - 1];
            let objDetails = '';
            let uploadedItems = templateObject.uploadedFiles.get();

            if (company == '') {
                swal('Please provide the compamy name !', '', 'warning');
                $('.fullScreenSpin').css('display', 'none');
                e.preventDefault();
                return false;
            }

            if (firstname == '') {
                //swal('Please provide the first name !', '', 'warning');
                swal({
                    title: "Please provide the first name !",
                    text: '',
                    type: 'warning',
                }).then((result) => {
                    if (result.value) {
                        $('#edtSupplierFirstName').focus();
                    } else if (result.dismiss == 'cancel') {

                    }
                });
                $('.fullScreenSpin').css('display', 'none');
                e.preventDefault();
                return false;
            }


            if (lastname == '') {
                //swal('Please provide the last name !', '', 'warning');
                swal({
                    title: "Please provide the last name !",
                    text: '',
                    type: 'warning',
                }).then((result) => {
                    if (result.value) {
                        $('#edtSupplierLastName').focus();
                    } else if (result.dismiss == 'cancel') {

                    }
                });
                $('.fullScreenSpin').css('display', 'none');
                e.preventDefault();
                return false;
            }

            if (sltTermsName == '') {
                //swal("Terms has not been selected!", "", "warning");
                swal({
                    title: "Terms has not been selected!",
                    text: '',
                    type: 'warning',
                }).then((result) => {
                    if (result.value) {
                        $('.bilingTab').trigger('click');
                        $('#sltTerms').focus();
                    } else if (result.dismiss == 'cancel') {

                    }
                });
                $('.fullScreenSpin').css('display', 'none');
                e.preventDefault();
                return false;
            }

            if (getemp_id[1]) {
                currentEmployee = parseInt(currentEmployee);
                objDetails = {
                    type: "TSupplierEx",
                    fields: {
                        ID: currentEmployee,
                        Title: title,
                        ClientName: company,
                        FirstName: firstname,
                        CUSTFLD10: middlename,
                        LastName: lastname,
                        IsCustomer: isCustomer,
                        // TFN:suffix,
                        Email: email,
                        Phone: phone,
                        Mobile: mobile,
                        SkypeName: skype,
                        Faxnumber: fax,
                        // Sex: gender,
                        // Position: position,
                        Street: streetAddress,
                        Street2: city,
                        State: state,
                        PostCode: postalcode,
                        Country: country,
                        Contractor: isContractor,
                        BillStreet: bstreetAddress,
                        BillStreet2: bcity,
                        BillState: bstate,
                        BillPostCode: bpostalcode,
                        Billcountry: bcountry,
                        // CustFld1: custfield1,
                        // CustFld2: custfield2,
                        Notes: notes,
                        PaymentMethodName: sltPaymentMethodName,
                        TermsName: sltTermsName,
                        ShippingMethodName: sltShippingMethodName,
                        ClientNo: suppaccountno,
                        URL: website,
                        Attachments: uploadedItems,
                        CUSTFLD1: custField1,
                        CUSTFLD2: custField2,
                        CUSTFLD3: custField3,
                        // CUSTFLD4: custField4,
                        PublishOnVS1: true,
                        BankAccountName: BankAccountName,
                        BankAccountBSB: BSB,
                        BankAccountNo: BankAccountNo,
                        BankName: BankName,
                        SwiftCode: SwiftCode,
                        RoutingNumber: RoutingNumber,
                        ForeignExchangeCode: $("#sltCurrency").val(),

                    }
                };
            } else {
                let suppdupID = 0;
                let checkSuppData = await contactService.getCheckSuppliersData(company);
                if (checkSuppData.tsupplier.length) {
                    suppdupID = checkSuppData.tsupplier[0].Id;
                    objDetails = {
                        type: "TSupplierEx",
                        fields: {
                            ID: suppdupID || 0,
                            Title: title,
                            ClientName: company,
                            FirstName: firstname,
                            CUSTFLD10: middlename,
                            LastName: lastname,
                            IsCustomer: isCustomer,
                            // TFN:suffix,
                            Email: email,
                            Phone: phone,
                            Mobile: mobile,
                            SkypeName: skype,
                            Faxnumber: fax,
                            // Sex: gender,
                            // Position: position,
                            Street: streetAddress,
                            Street2: city,
                            State: state,
                            PostCode: postalcode,
                            Country: country,
                            Contractor: isContractor,
                            BillStreet: bstreetAddress,
                            BillStreet2: bcity,
                            BillState: bstate,
                            BillPostCode: bpostalcode,
                            Billcountry: bcountry,
                            // CustFld1: custfield1,
                            // CustFld2: custfield2,
                            Notes: notes,
                            PaymentMethodName: sltPaymentMethodName,
                            TermsName: sltTermsName,
                            ShippingMethodName: sltShippingMethodName,
                            ClientNo: suppaccountno,
                            URL: website,
                            Attachments: uploadedItems,
                            CUSTFLD1: custField1,
                            CUSTFLD2: custField2,
                            CUSTFLD3: custField3,
                            // CUSTFLD4: custField4,
                            PublishOnVS1: true,
                            BankAccountName: BankAccountName,
                            BankAccountBSB: BSB,
                            BankAccountNo: BankAccountNo,
                            BankName: BankName,
                            SwiftCode: SwiftCode,
                            RoutingNumber: RoutingNumber,
                            ForeignExchangeCode: $("#sltCurrency").val(),
                        }
                    };
                } else {
                    objDetails = {
                        type: "TSupplierEx",
                        fields: {
                            Title: title,
                            ClientName: company,
                            FirstName: firstname,
                            CUSTFLD10: middlename,
                            LastName: lastname,
                            IsCustomer: isCustomer,
                            // TFN:suffix,
                            Email: email,
                            Phone: phone,
                            Mobile: mobile,
                            SkypeName: skype,
                            Faxnumber: fax,
                            // Sex: gender,
                            // Position: position,
                            Street: streetAddress,
                            Street2: city,
                            State: state,
                            PostCode: postalcode,
                            Country: country,
                            Contractor: isContractor,
                            BillStreet: bstreetAddress,
                            BillStreet2: bcity,
                            BillState: bstate,
                            BillPostCode: bpostalcode,
                            Billcountry: bcountry,
                            // CustFld1: custfield1,
                            // CustFld2: custfield2,
                            Notes: notes,
                            PaymentMethodName: sltPaymentMethodName,
                            TermsName: sltTermsName,
                            ShippingMethodName: sltShippingMethodName,
                            ClientNo: suppaccountno,
                            URL: website,
                            Attachments: uploadedItems,
                            CUSTFLD1: custField1,
                            CUSTFLD2: custField2,
                            CUSTFLD3: custField3,
                            // CUSTFLD4: custField4,
                            PublishOnVS1: true,
                            BankAccountName: BankAccountName,
                            BankAccountBSB: BSB,
                            BankAccountNo: BankAccountNo,
                            BankName: BankName,
                            SwiftCode: SwiftCode,
                            RoutingNumber: RoutingNumber,
                            ForeignExchangeCode: $("#sltCurrency").val(),
                        }
                    };
                }
            }

            contactService.saveSupplierEx(objDetails).then(function(objDetails) {
                let supplierSaveID = objDetails.fields.ID;
                if (supplierSaveID) {
                    //window.open('/supplierscard?id=' + supplierSaveID,'_self');
                    //window.open('/supplierlist','_self');
                    sideBarService.getAllSuppliersDataVS1(initialBaseDataLoad, 0).then(function(dataReload) {
                        addVS1Data('TSupplierVS1', JSON.stringify(dataReload)).then(function(datareturn) {
                            window.open('/supplierlist', '_self');
                        }).catch(function(err) {
                            window.open('/supplierlist', '_self');
                        });
                    }).catch(function(err) {
                        window.open('/supplierlist', '_self');
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
                        // Meteor._reload.reload();
                    } else if (result.dismiss === 'cancel') {

                    }
                });
                $('.fullScreenSpin').css('display', 'none');
            });
        }, delayTimeAfterSound);
    },
    'keyup .search': function(event) {
        var searchTerm = $(".search").val();
        var listItem = $('.results tbody').children('tr');
        var searchSplit = searchTerm.replace(/ /g, "'):containsi('");

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

        var jobCount = $('.results tbody tr[visible="true"]').length;
        $('.counter').text(jobCount + ' items');

        if (jobCount == '0') { $('.no-result').show(); } else {
            $('.no-result').hide();
        }
        if (searchTerm === "") {
            $(".results tbody tr").each(function(e) {
                $(this).attr('visible', 'true');
                $('.no-result').hide();
            });

            //setTimeout(function () {
            var rowCount = $('.results tbody tr').length;
            $('.counter').text(rowCount + ' items');
            //}, 500);
        }

    },
    'click .tblSupplierSideList tbody tr': function(event) {
        const suppLineID = $(event.target).attr('id');
        if (suppLineID) {
            window.open('/supplierscard?id=' + suppLineID, '_self');
        }
    },

    'click .tblCrmList tbody tr': function(event) {
        const taskID = $(event.target).parent().attr('id');
        // const taskCategory = $(event.target).parent().attr('category');
        let crmRecords = Template.instance().crmRecords.get();
        const currentRecordIndex = crmRecords.findIndex(item => item.id == taskID);
        let taskCategory = "";
        if (currentRecordIndex > -1) {
            taskCategory = crmRecords[currentRecordIndex].category;
        }
        if (taskID !== undefined) {
            if (taskCategory == 'task') {
                // FlowRouter.go('/crmoverview?taskid=' + taskID);
                openEditTaskModals(taskID, "");
            } else if (taskCategory == 'appointment') {
                // FlowRouter.go('/appointments?id=' + taskID);
                document.getElementById("updateID").value = taskID || 0;
                $("#event-modal").modal("toggle");
            }
        }
    },
    'click .chkDatatable': function(event) {
        const columns = $('#tblTransactionlist th');
        let columnDataValue = $(event.target).closest("div").find(".divcolumn").text();
        $.each(columns, function(i, v) {
            let className = v.classList;
            let replaceClass = className[1];
            if (v.innerText === columnDataValue) {
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
        let checkPrefDetails = getCheckPrefDetails('tblTransactionlist');
        if (checkPrefDetails) {
            CloudPreference.remove({ _id: checkPrefDetails._id }, function(err, idTag) {
                if (err) {

                } else {
                    Meteor._reload.reload();
                }
            });

        }
    },
    'click .saveTable': function(event) {
        let lineItems = [];
        //let datatable =$('#tblTransactionlist').DataTable();
        $('.columnSettings').each(function(index) {
            const $tblrow = $(this);
            const colTitle = $tblrow.find(".divcolumn").text() || '';
            const colWidth = $tblrow.find(".custom-range").val() || 0;
            const colthClass = $tblrow.find(".divcolumn").attr("valueupdate") || '';
            let colHidden = !$tblrow.find(".custom-control-input").is(':checked');
            let lineItemObj = {
                index: index,
                label: colTitle,
                hidden: colHidden,
                width: colWidth,
                thclass: colthClass
            };
            lineItems.push(lineItemObj);
        });
        //datatable.state.save();
        let checkPrefDetails = getCheckPrefDetails('tblTransactionlist');
        if (checkPrefDetails) {
            CloudPreference.update({ _id: checkPrefDetails._id }, {
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
        $('#myModal2').modal('toggle');
        //Meteor._reload.reload();
    },
    'blur .divcolumn': function(event) {
        let columData = $(event.target).text();

        let columnDatanIndex = $(event.target).closest("div.columnSettings").attr('id');

        var datable = $('#tblTransactionlist').DataTable();
        var title = datable.column(columnDatanIndex).header();
        $(title).html(columData);

    },
    'change .rngRange': function(event) {
        let range = $(event.target).val();
        // $(event.target).closest("div.divColWidth").find(".spWidth").html(range+'px');

        // let columData = $(event.target).closest("div.divColWidth").find(".spWidth").attr("value");
        let columnDataValue = $(event.target).closest("div").prev().find(".divcolumn").text();
        var datable = $('#tblTransactionlist th');
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
        $('.fullScreenSpin').css('display', 'inline-block');
        jQuery('#tblTransactionlist_wrapper .dt-buttons .btntabletocsv').click();
        $('.fullScreenSpin').css('display', 'none');

    },
    'click .printConfirm': function(event) {
        playPrintAudio();
        setTimeout(function() {
            $('.fullScreenSpin').css('display', 'inline-block');
            jQuery('#tblTransactionlist_wrapper .dt-buttons .btntabletopdf').click();
            $('.fullScreenSpin').css('display', 'none');
        }, delayTimeAfterSound);
    },
    'click .btnRefresh': function() {
        Meteor._reload.reload();
    },

    'click .btnRefreshCrm': function() {
        let currentId = FlowRouter.current().queryParams;
        $('.fullScreenSpin').css('display', 'inline-block');
        sideBarService.getTProjectTasks().then(function(data) {
            addVS1Data('TProjectTasks', JSON.stringify(data)).then(function(datareturn) {
                if (!isNaN(currentId.id)) {
                    window.open('/supplierscard?id=' + currentId.id + '&crmTab=active', '_self');
                }
            }).catch(function(err) {
                if (!isNaN(currentId.id)) {
                    window.open('/supplierscard?id=' + currentId.id + '&crmTab=active', '_self');
                }
            });
        }).catch(function(err) {
            if (!isNaN(currentId.id)) {
                window.open('/supplierscard?id=' + currentId.id + '&crmTab=active', '_self');
            }
        });
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
        let checkPrefDetails = getCheckPrefDetails('supplierscard');
        if (checkPrefDetails) {
            CloudPreference.remove({ _id: checkPrefDetails._id }, function(err, idTag) {
                if (err) {

                } else {
                    Meteor._reload.reload();
                }
            });
        }
    },
    'click .new_attachment_btn': function(event) {
        $('#attachment-upload').trigger('click');
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

        if (type.split('/')[0] === 'image') {
            previewFile.image = true
        } else {
            previewFile.image = false
        }
        templateObj.uploadedFile.set(previewFile);

        $('#files_view').modal('show');

        return;
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
    'click .transTab': function(event) {
        let templateObject = Template.instance();
        let supplierName = $('#edtSupplierCompany').val();
        templateObject.getAllProductRecentTransactions(supplierName);
    },
    'click .btnDeleteSupplier': function(event) {
        playDeleteAudio();
        let templateObject = Template.instance();
        let contactService2 = new ContactService();
        setTimeout(function() {
            $('.fullScreenSpin').css('display', 'inline-block');

            let currentId = FlowRouter.current().queryParams;
            let objDetails = '';

            if (!isNaN(currentId.id)) {
                let currentSupplier = parseInt(currentId.id);
                objDetails = {
                    type: "TSupplierEx",
                    fields: {
                        ID: currentSupplier,
                        Active: false
                    }
                };
                contactService2.saveSupplierEx(objDetails).then(function(objDetails) {
                    FlowRouter.go('/supplierlist?success=true');
                }).catch(function(err) {
                    swal({
                        title: 'Oooops...',
                        text: err,
                        type: 'error',
                        showCancelButton: false,
                        confirmButtonText: 'Try Again'
                    }).then((result) => {
                        if (result.value) {} else if (result.dismiss === 'cancel') {

                        }
                    });
                    $('.fullScreenSpin').css('display', 'none');
                });
            } else {
                FlowRouter.go('/supplierlist?success=true');
            }
            $('#deleteSupplierModal').modal('toggle');
        }, delayTimeAfterSound);
    },
    'click .btnTask': function(event) {
        $('.fullScreenSpin').css('display', 'inline-block');
        let currentId = FlowRouter.current().queryParams;
        if (!isNaN(currentId.id)) {
            let supplierID = parseInt(currentId.id);
            FlowRouter.go('/crmoverview?supplierid=' + supplierID);
        } else {

        }
    },
    'click .btnEmail': function(event) {
        playEmailAudio();
        setTimeout(function() {
            $('.fullScreenSpin').css('display', 'inline-block');
            let currentId = FlowRouter.current().queryParams;
            if (!isNaN(currentId.id)) {
                let supplierID = parseInt(currentId.id);
                // FlowRouter.go('/crmoverview?supplierid=' + supplierID);
                $('#referenceLetterModal').modal('toggle');
                $('.fullScreenSpin').css('display', 'none');
            } else {

            }
        }, delayTimeAfterSound);
    },
    'click .btnAppointment': function(event) {
        $('.fullScreenSpin').css('display', 'inline-block');
        let currentId = FlowRouter.current().queryParams;
        if (!isNaN(currentId.id)) {
            let supplierID = parseInt(currentId.id);
            FlowRouter.go('/appointments?supplierid=' + supplierID);
        } else {

        }
    },
    'click .btnBill': function(event) {
        $('.fullScreenSpin').css('display', 'inline-block');
        let currentId = FlowRouter.current().queryParams;
        if (!isNaN(currentId.id)) {
            let supplierID = parseInt(currentId.id);
            FlowRouter.go('/billcard?supplierid=' + supplierID);
        } else {

        }
    },
    'click .btnCredit': function(event) {
        $('.fullScreenSpin').css('display', 'inline-block');
        let currentId = FlowRouter.current().queryParams;
        if (!isNaN(currentId.id)) {
            let supplierID = parseInt(currentId.id);
            FlowRouter.go('/creditcard?supplierid=' + supplierID);
        } else {

        }
    },
    'click .btnPurchaseOrder': function(event) {
        $('.fullScreenSpin').css('display', 'inline-block');
        let currentId = FlowRouter.current().queryParams;
        if (!isNaN(currentId.id)) {
            let supplierID = parseInt(currentId.id);
            FlowRouter.go('/purchaseordercard?supplierid=' + supplierID);
        } else {

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

});

Template.supplierscard.helpers({
    record: () => {
        let parentRecord = Template.parentData(0).record;
        if (parentRecord) {
            return parentRecord;
        } else {
            let temp = Template.instance().records.get();
            if (temp && temp.mobile) {
                temp.mobile = temp.mobile.replace('+61', '0')
            }
            return temp;
        }
    },
    countryList: () => {
        return Template.instance().countryData.get();
    },
    supplierrecords: () => {
        return Template.instance().supplierrecords.get().sort(function(a, b) {
            if (a.company === 'NA') {
                return 1;
            } else if (b.company === 'NA') {
                return -1;
            }
            return (a.company.toUpperCase() > b.company.toUpperCase()) ? 1 : -1;
        });
    },

    crmRecords: () => {
        return Template.instance().crmRecords.get().sort(function(a, b) {
            if (a.id === 'NA') {
                return 1;
            } else if (b.id === 'NA') {
                return -1;
            }
            return (a.id > b.id) ? 1 : -1;
        });
    },
    crmTableheaderRecords: () => {
        return Template.instance().crmTableheaderRecords.get();
    },

    correspondences: () => {
        return Template.instance().correspondences.get();
    },
    datatablerecords: () => {
        return Template.instance().datatablerecords.get().sort(function(a, b) {
            if (a.orderdate === 'NA') {
                return 1;
            } else if (b.orderdate === 'NA') {
                return -1;
            }
            return (a.orderdate.toUpperCase() > b.orderdate.toUpperCase()) ? 1 : -1;
        });
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    salesCloudPreferenceRec: () => {
        return CloudPreference.findOne({ userid: Session.get('mycloudLogonID'), PrefName: 'tblSalesOverview' });
    },
    currentdate: () => {
        const currentDate = new Date();
        return moment(currentDate).format("DD/MM/YYYY");
    },
    preferredPaymentList: () => {
        return Template.instance().preferredPaymentList.get();
    },
    termsList: () => {
        return Template.instance().termsList.get();
    },
    deliveryMethodList: () => {
        return Template.instance().deliveryMethodList.get();
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
        return CloudPreference.findOne({ userid: Session.get('mycloudLogonID'), PrefName: 'supplierscard' });
    },
    isSameAddress: () => {
        return Template.instance().isSameAddress.get();
    },
    isMobileDevices: () => {
        let isMobile = false; //initiate as false
        // device detection
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) ||
            /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
            isMobile = true;
        }
        return isMobile;
    }
});

function getCheckPrefDetails(prefName) {
    const getcurrentCloudDetails = CloudUser.findOne({
        _id: Session.get('mycloudLogonID'),
        clouddatabaseID: Session.get('mycloudLogonDBID')
    });
    let checkPrefDetails = null;
    if (getcurrentCloudDetails) {
        if (getcurrentCloudDetails._id.length > 0) {
            const clientID = getcurrentCloudDetails._id;
            const clientUsername = getcurrentCloudDetails.cloudUsername;
            const clientEmail = getcurrentCloudDetails.cloudEmail;
            checkPrefDetails = CloudPreference.findOne({ userid: clientID, PrefName: prefName });
        }
    }
    return checkPrefDetails;
}

function openEditTaskModals(id, type) {
    const crmService = new CRMService();
    // let catg = e.target.dataset.catg;
    let templateObject = Template.instance();
    // $("#editProjectID").val("");

    $("#txtCrmSubTaskID").val(id);

    $(".fullScreenSpin").css("display", "inline-block");
    // get selected task detail via api
    crmService.getTaskDetail(id).then(function(data) {
        $(".fullScreenSpin").css("display", "none");
        if (data.fields.ID == id) {
            let selected_record = data.fields;

            $("#txtCrmTaskID").val(selected_record.ID);
            $("#txtCrmProjectID").val(selected_record.ProjectID);
            $("#txtCommentsDescription").val("");

            $(".editTaskDetailName").val(selected_record.TaskName);
            $(".editTaskDetailDescription").val(selected_record.TaskDescription);

            // tempcode check if AssignedName is set in selected_record
            let employeeName = selected_record.AssignName ? selected_record.AssignName : Session.get("mySessionEmployee");
            let assignId = selected_record.AssignID ? selected_record.AssignID : Session.get("mySessionEmployeeLoggedID");
            $('#crmEditSelectEmployeeList').val(employeeName);
            $('#assignedID').val(assignId)

            contactService.getOneEmployeeDataEx(assignId).then(function(empDetailInfo) {
                $('#contactEmailUser').val(empDetailInfo.fields.Email);
                $('#contactPhoneUser').val(empDetailInfo.fields.Phone);
            }).catch(function(err) {

            });

            // $('#contactEmailClient').val(selected_record.ClientEmail);
            // $('#contactPhoneClient').val(selected_record.ClientPhone);

            $("#contactEmailClient").val(selected_record.ContactEmail);
            $("#contactPhoneClient").val(selected_record.ContactPhone);
            $("#contactEmailUser").val(selected_record.AssignEmail);
            $("#contactPhoneUser").val(selected_record.AssignPhone);

            let colClientName = selected_record.ContactName;
            $('#crmEditSelectLeadList').val(colClientName);
            if (selected_record.CustomerID) {
                $('#contactID').val(selected_record.CustomerID)
                $('#contactType').val('Customer')

                if (selected_record.ContactEmail == "" && selected_record.ContactPhone == "") {
                    contactService.getOneEmployeeDataEx(selected_record.CustomerID).then(function(empDetailInfo) {
                        $('#contactEmailClient').val(empDetailInfo.fields.Email);
                        $('#contactPhoneClient').val(empDetailInfo.fields.Phone);
                    }).catch(function(err) {

                    });
                }
            } else if (selected_record.LeadID) {
                $('#contactID').val(selected_record.LeadID)
                $('#contactType').val('Lead')

                if (selected_record.ContactEmail == "" && selected_record.ContactPhone == "") {
                    contactService.getOneLeadDataEx(selected_record.LeadID).then(function(empDetailInfo) {
                        $('#contactEmailClient').val(empDetailInfo.fields.Email);
                        $('#contactPhoneClient').val(empDetailInfo.fields.Phone);
                    }).catch(function(err) {

                    });
                }
            } else {
                $('#contactID').val(selected_record.SupplierID)
                $('#contactType').val('Supplier')
                if (selected_record.SupplierID) {
                    if (selected_record.ContactEmail == "" && selected_record.ContactPhone == "") {
                        contactService.getOneSupplierDataEx(selected_record.SupplierID).then(function(empDetailInfo) {
                            $('#contactEmailClient').val(empDetailInfo.fields.Email);
                            $('#contactPhoneClient').val(empDetailInfo.fields.Phone);
                        }).catch(function(err) {

                        });
                    }
                }
            }

            let projectName = selected_record.ProjectName == "Default" ? "All Tasks" : selected_record.ProjectName;

            if (selected_record.Completed) {
                // $('#lblComplete_taskEditLabel').removeClass('chk_complete');
                // $('#lblComplete_taskEditLabel').addClass('chk_uncomplete');
                // $('#chkComplete_taskEdit').removeClass('chk_complete');
                // $('#chkComplete_taskEdit').addClass('chk_uncomplete');
                $('#chkComplete_taskEdit').prop("checked", true);
            } else {
                // $('#lblComplete_taskEditLabel').removeClass('chk_uncomplete');
                // $('#lblComplete_taskEditLabel').addClass('chk_complete');
                // $('#chkComplete_taskEdit').removeClass('chk_uncomplete');
                // $('#chkComplete_taskEdit').addClass('chk_complete');
                $('#chkComplete_taskEdit').prop("checked", false);
            }

            let all_projects = templateObject.all_projects.get();
            let projectColorStyle = '';
            if (selected_record.ProjectID != 0) {
                let projects = all_projects.filter(project => project.fields.ID == selected_record.ProjectID);
                if (projects.length && projects[0].fields.ProjectColour) {
                    projectColorStyle = 'color: ' + projects[0].fields.ProjectColour + ' !important';
                }
            }

            let catg = "";
            let today = moment().format("YYYY-MM-DD");
            // if (selected_record.due_date) {
            //     if (selected_record.due_date.substring(0, 10) == today) {
            //         catg =
            //             `<i class="fas fa-calendar-day text-primary" style="margin-right: 5px; ${projectColorStyle}"></i>` +
            //             "<span class='text-primary' style='" + projectColorStyle + "'>" +
            //             projectName +
            //             "</span>";
            //         $(".taskDueDate").css("color", "#00a3d3");
            //     } else if (selected_record.due_date.substring(0, 10) > today) {
            //         catg =
            //             `<i class="fas fa-calendar-alt text-danger" style="margin-right: 5px; ${projectColorStyle}"></i>` +
            //             "<span class='text-danger' style='" + projectColorStyle + "'>" +
            //             projectName +
            //             "</span>";
            //         $(".taskDueDate").css("color", "#1cc88a");
            //     } else if (selected_record.due_date.substring(0, 10) < today) {
            //         // catg =
            //         //   `<i class="fas fa-inbox text-warning" style="margin-right: 5px;"></i>` +
            //         //   "<span class='text-warning'>Overdue</span>";
            //         // $(".taskDueDate").css("color", "#e74a3b");
            //         catg =
            //             `<i class="fas fa-inbox text-success" style="margin-right: 5px; ${projectColorStyle}"></i>` +
            //             "<span class='text-success' style='" + projectColorStyle + "'>" +
            //             projectName +
            //             "</span>";
            //         $(".taskDueDate").css("color", "#1cc88a");
            //     } else {
            //         catg =
            //             `<i class="fas fa-inbox text-success" style="margin-right: 5px; ${projectColorStyle}"></i>` +
            //             "<span class='text-success' style='" + projectColorStyle + "'>" +
            //             projectName +
            //             "</span>";
            //         $(".taskDueDate").css("color", "#1cc88a");
            //     }
            // } else {
            //     catg =
            //         `<i class="fas fa-inbox text-success" style="margin-right: 5px; ${projectColorStyle}"></i>` +
            //         "<span class='text-success' style='" + projectColorStyle + "'>" +
            //         projectName +
            //         "</span>";
            //     $(".taskDueDate").css("color", "#1cc88a");
            // }

            // $(".taskLocation").html(
            //     `<a class="taganchor">
            //     ${catg}
            //   </a>`
            // );

            // if (projectName) {
            //     $('.taskDetailProjectName').show();
            // } else {
            //     $('.taskDetailProjectName').hide();
            // }

            $("#addProjectID").val(selected_record.ProjectID);
            $("#taskDetailModalCategoryLabel").val(projectName);

            $("#taskmodalNameLabel").html(selected_record.TaskName);
            $(".activityAdded").html("Added on " + moment(selected_record.MsTimeStamp).format("MMM D h:mm A"));
            // let due_date = selected_record.due_date ? moment(selected_record.due_date).format("D MMM") : "No Date";
            let due_date = selected_record.due_date ? moment(selected_record.due_date).format("YYYY-MM-DD") : "";


            let todayDate = moment().format("ddd");
            let tomorrowDay = moment().add(1, "day").format("ddd");
            let nextMonday = moment(moment()).day(1 + 7).format("ddd MMM D");
            let date_component = due_date;
            // let date_component = ` <div class="dropdown btnTaskTableAction">
            //   <div data-toggle="dropdown" title="Reschedule Task" style="cursor:pointer;">
            //     <i class="far fa-calendar-plus" style="margin-right: 5px;"></i>
            //     <span id="edit_task_modal_due_date">${due_date}</span>
            //   </div>
            //   <div class="dropdown-menu dropdown-menu-right reschedule-dropdown-menu  no-modal"
            //     aria-labelledby="dropdownMenuButton" style="width: 275px;">
            //     <a class="dropdown-item no-modal setScheduleToday" href="#" data-id="${selected_record.ID}">
            //       <i class="fas fa-calendar-day text-success no-modal"
            //         style="margin-right: 8px;"></i>Today
            //       <div class="float-right no-modal" style="width: 40%; text-align: end; color: #858796;">
            //         ${todayDate}</div>
            //     </a>
            //     <a class="dropdown-item no-modal setScheduleTomorrow" href="#"
            //       data-id="${selected_record.ID}">
            //       <i class="fas fa-sun text-warning no-modal" style="margin-right: 8px;"></i>Tomorrow
            //       <div class="float-right no-modal" style="width: 40%; text-align: end; color: #858796;">
            //         ${tomorrowDay}</div>
            //     </a>
            //     <a class="dropdown-item no-modal setScheduleWeekend" href="#"
            //       data-id="${selected_record.ID}">
            //       <i class="fas fa-couch text-primary no-modal" style="margin-right: 8px;"></i>This Weekend
            //       <div class="float-right no-modal" style="width: 40%; text-align: end; color: #858796;">
            //         Sat</div>
            //     </a>
            //     <a class="dropdown-item no-modal setScheduleNexweek" href="#"
            //       data-id="${selected_record.ID}">
            //       <i class="fas fa-calendar-alt text-danger no-modal" style="margin-right: 8px;"></i>Next Week
            //       <div class="float-right no-modal" style="width: 40%; text-align: end; color: #858796;">
            //         ${nextMonday}
            //       </div>
            //     </a>
            //     <a class="dropdown-item no-modal setScheduleNodate" href="#" data-id="${selected_record.ID}">
            //       <i class="fas fa-ban text-secondary no-modal" style="margin-right: 8px;"></i>
            //       No Date</a>
            //     <div class="dropdown-divider no-modal"></div>
            //     <div class="form-group no-modal" data-toggle="tooltip" data-placement="bottom"
            //       title="Date format: DD/MM/YYYY" style="display:flex; margin: 6px 20px; margin-top: 0px; z-index: 99999;">
            //       <label style="margin-top: 6px; margin-right: 16px; width: 146px;">Select Date</label>
            //       <div class="input-group date no-modal" style="cursor: pointer;">
            //         <input type="text" id="${selected_record.ID}" class="form-control crmDatepicker no-modal"
            //           autocomplete="off">
            //         <div class="input-group-addon no-modal">
            //           <span class="glyphicon glyphicon-th no-modal" style="cursor: pointer;"></span>
            //         </div>
            //       </div>
            //     </div>
            //   </div>
            // </div>`;

            // $("#taskmodalDuedate").html(due_date);
            $("#taskmodalDuedate").html(date_component);
            $("#taskmodalDescription").html(selected_record.TaskDescription);

            $("#chkComplete_taskEditLabel").removeClass("task_priority_0");
            $("#chkComplete_taskEditLabel").removeClass("task_priority_1");
            $("#chkComplete_taskEditLabel").removeClass("task_priority_2");
            $("#chkComplete_taskEditLabel").removeClass("task_priority_3");
            $("#chkComplete_taskEditLabel").addClass("task_priority_" + selected_record.priority);

            let taskmodalLabels = "";
            $(".chkDetailLabel").prop("checked", false);
            if (selected_record.TaskLabel) {
                if (selected_record.TaskLabel.fields != undefined) {
                    taskmodalLabels =
                        `<span class="taskTag"><i class="fas fa-tag" style="color:${selected_record.TaskLabel.fields.Color};"></i><a class="taganchor filterByLabel" href="" data-id="${selected_record.TaskLabel.fields.ID}">` +
                        selected_record.TaskLabel.fields.TaskLabelName +
                        "</a></span>";
                    $("#detail_label_" + selected_record.TaskLabel.fields.ID).prop(
                        "checked",
                        true
                    );
                } else {
                    selected_record.TaskLabel.forEach((lbl) => {
                        taskmodalLabels +=
                            `<span class="taskTag"><i class="fas fa-tag" style="color:${lbl.fields.Color};"></i><a class="taganchor filterByLabel" href="" data-id="${lbl.fields.ID}">` +
                            lbl.fields.TaskLabelName +
                            "</a></span> ";
                        $("#detail_label_" + lbl.fields.ID).prop("checked", true);
                    });
                    taskmodalLabels = taskmodalLabels.slice(0, -2);
                }
            }
            // if (taskmodalLabels != "") {
            //   taskmodalLabels =
            //     '<span class="taskTag"><i class="fas fa-tag"></i>' +
            //     taskmodalLabels +
            //     "</span>";
            // }
            $("#taskmodalLabels").html(taskmodalLabels);
            let subtasks = "";
            if (selected_record.subtasks) {
                if (Array.isArray(selected_record.subtasks)) {
                    templateObject.subTasks.set(selected_record.subtasks)
                    templateObject.initSubtaskDatatable();
                }

                if (typeof selected_record.subtasks == 'object') {
                    let arr = [];
                    arr.push(selected_record.subtasks)
                    templateObject.subTasks.set(arr)
                    templateObject.initSubtaskDatatable();
                }
            } else {
                let sutTaskTable = $('#tblSubtaskDatatable').DataTable();
                sutTaskTable.clear().draw();
            }

            let comments = "";
            if (selected_record.comments) {
                if (selected_record.comments.fields != undefined) {
                    let comment = selected_record.comments.fields;
                    let comment_date = comment.CommentsDate ? moment(comment.CommentsDate).format("MMM D h:mm A") : "";
                    let commentUserArry = comment.EnteredBy.toUpperCase().split(" ");
                    let commentUser = commentUserArry.length > 1 ? commentUserArry[0].charAt(0) + commentUserArry[1].charAt(0) : commentUserArry[0].charAt(0);
                    comments = `
                <div class="col-12 taskComment" style="padding: 16px 32px;" id="taskComment_${comment.ID}">
                  <div class="row commentRow">
                    <div class="col-1">
                      <div class="commentUser">${commentUser}</div>
                    </div>
                    <div class="col-11" style="padding-top:4px; padding-left: 24px;">
                      <div class="row">
                        <div>
                          <span class="commenterName">${comment.EnteredBy}</span>
                          <span class="commentDateTime">${comment_date}</span>
                        </div>
                      </div>
                      <div class="row">
                        <span class="commentText">${comment.CommentsDescription}</span>
                      </div>
                    </div>
                  </div>
                </div>
                `;
                } else {
                    selected_record.comments.forEach((item) => {
                        let comment = item.fields;
                        let comment_date = comment.CommentsDate ? moment(comment.CommentsDate).format("MMM D h:mm A") : "";
                        let commentUserArry = comment.EnteredBy.toUpperCase().split(" ");
                        let commentUser = commentUserArry.length > 1 ? commentUserArry[0].charAt(0) + commentUserArry[1].charAt(0) : commentUserArry[0].charAt(0);
                        comments += `
                  <div class="col-12 taskComment" style="padding: 16px 32px;" id="taskComment_${comment.ID}">
                    <div class="row commentRow">
                      <div class="col-1">
                        <div class="commentUser">${commentUser}</div>
                      </div>
                      <div class="col-11" style="padding-top:4px; padding-left: 24px;">
                        <div class="row">
                          <div>
                            <span class="commenterName">${comment.EnteredBy}</span>
                            <span class="commentDateTime">${comment_date}</span>
                          </div>
                        </div>
                        <div class="row">
                          <span class="commentText">${comment.CommentsDescription}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  `;
                    });
                }
            }
            $(".task-comment-row").html(comments);

            let activities = "";
            if (selected_record.activity) {
                if (selected_record.activity.fields != undefined) {
                    let activity = selected_record.activity.fields;
                    let day = "";
                    if (moment().format("YYYY-MM-DD") == moment(activity.ActivityDateStartd).format("YYYY-MM-DD")) {
                        day = " ‧ Today";
                    } else if (moment().add(-1, "day").format("YYYY-MM-DD") == moment(activity.ActivityDateStartd).format("YYYY-MM-DD")) {
                        day = " . Yesterday";
                    }
                    let activityDate = moment(activity.ActivityDateStartd).format("MMM D") + day + " . " + moment(activity.ActivityDateStartd).format("ddd");

                    let commentUserArry = activity.EnteredBy.toUpperCase().split(" ");
                    let commentUser = commentUserArry.length > 1 ? commentUserArry[0].charAt(0) + commentUserArry[1].charAt(0) : commentUserArry[0].charAt(0);

                    activities = `
                <div class="row" style="padding: 16px;">
                  <div class="col-12">
                    <span class="activityDate">${activityDate}</span>
                  </div>
                  <hr style="width: 100%; margin: 8px 16px;" />
                  <div class="col-1">
                    <div class="commentUser">${commentUser}</div>
                  </div>
                  <div class="col-11" style="padding-top: 4px; padding-left: 24px;">
                    <div class="row">
                      <span class="activityName">${activity.EnteredBy
            } </span> <span class="activityAction">${activity.ActivityName
            } </span>
                    </div>
                    <div class="row">
                      <span class="activityComment">${activity.ActivityDescription
            }</span>
                    </div>
                    <div class="row">
                      <span class="activityTime">${moment(
              activity.ActivityDateStartd
            ).format("h:mm A")}</span>
                    </div>
                  </div>
                  <hr style="width: 100%; margin: 16px;" />
                </div>
                `;
                } else {
                    selected_record.activity.forEach((item) => {
                        let activity = item.fields;
                        let day = "";
                        if (moment().format("YYYY-MM-DD") == moment(activity.ActivityDateStartd).format("YYYY-MM-DD")) {
                            day = " ‧ Today";
                        } else if (moment().add(-1, "day").format("YYYY-MM-DD") == moment(activity.ActivityDateStartd).format("YYYY-MM-DD")) {
                            day = " . Yesterday";
                        }
                        let activityDate = moment(activity.ActivityDateStartd).format("MMM D") + day + " . " + moment(activity.ActivityDateStartd).format("ddd");

                        let commentUserArry = activity.EnteredBy.toUpperCase().split(" ");
                        let commentUser = commentUserArry.length > 1 ? commentUserArry[0].charAt(0) + commentUserArry[1].charAt(0) : commentUserArry[0].charAt(0);

                        activities = `
                  <div class="row" style="padding: 16px;">
                    <div class="col-12">
                      <span class="activityDate">${activityDate}</span>
                    </div>
                    <hr style="width: 100%; margin: 8px 16px;" />
                    <div class="col-1">
                      <div class="commentUser">${commentUser}</div>
                    </div>
                    <div class="col-11" style="padding-top: 4px; padding-left: 24px;">
                      <div class="row">
                        <span class="activityName">${activity.EnteredBy
              } </span> <span class="activityAction">${activity.ActivityName
              } </span>
                      </div>
                      <div class="row">
                        <span class="activityComment">${activity.ActivityDescription
              }</span>
                      </div>
                      <div class="row">
                        <span class="activityTime">${moment(
                activity.ActivityDateStartd
              ).format("h:mm A")}</span>
                      </div>
                    </div>
                    <hr style="width: 100%; margin: 16px;" />
                  </div>
                  `;
                    });
                }
            }
            $(".task-activity-row").html(activities);

            if (type == "comment") {
                $("#nav-comments-tab").click();
            } else {
                $("#nav-subtasks-tab").click();
            }

            $("#chkPriority0").prop("checked", false);
            $("#chkPriority1").prop("checked", false);
            $("#chkPriority2").prop("checked", false);
            $("#chkPriority3").prop("checked", false);
            $("#chkPriority" + selected_record.priority).prop("checked", true);

            $(".taskModalActionFlagDropdown").removeClass(
                "task_modal_priority_3"
            );
            $(".taskModalActionFlagDropdown").removeClass(
                "task_modal_priority_2"
            );
            $(".taskModalActionFlagDropdown").removeClass(
                "task_modal_priority_1"
            );
            $(".taskModalActionFlagDropdown").removeClass(
                "task_modal_priority_0"
            );
            $(".taskModalActionFlagDropdown").addClass(
                "task_modal_priority_" + selected_record.priority
            );

            $("#taskDetailModal").modal("toggle");

            $(".crmDatepicker").datepicker({
                showOn: "button",
                buttonText: "Show Date",
                buttonImageOnly: true,
                buttonImage: "/img/imgCal2.png",
                constrainInput: false,
                dateFormat: "dd/mm/yy",
                showOtherMonths: true,
                selectOtherMonths: true,
                changeMonth: true,
                changeYear: true,
                yearRange: "-90:+10",
                onSelect: function(dateText, inst) {
                    let task_id = inst.id;
                    $(".crmDatepicker").val(dateText);

                    templateObject.updateTaskSchedule(task_id, new Date(inst.selectedYear, inst.selectedMonth, inst.selectedDay));
                },
                onChangeMonthYear: function(year, month, inst) {
                    // Set date to picker
                    $(this).datepicker('setDate', new Date(year, inst.selectedMonth, inst.selectedDay));
                }
            });
            let currentDate = selected_record.due_date ? new Date(selected_record.due_date) : new Date();
            let begunDate = moment(currentDate).format("DD/MM/YYYY");
            $(".crmDatepicker").val(begunDate);

        } else {
            swal("Cannot edit this task", "", "warning");
            return;
        }
    }).catch(function(err) {
        $(".fullScreenSpin").css("display", "none");

        swal(err, "", "error");
        return;
    });
}

