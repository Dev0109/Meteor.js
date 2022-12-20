import "../lib/global/indexdbstorage.js";
import { CRMService } from "./crm-service";
import { ContactService } from "../contacts/contact-service";
import { TaxRateService } from "../../client/settings/settings-service"
import { UtilityService } from "../utility-service";
import XLSX from 'xlsx';
import { SideBarService } from '../js/sidebar-service';

let crmService = new CRMService();
const contactService = new ContactService();
const settingService = new TaxRateService();

Template.crmoverview.onCreated(function() {
    let templateObject = Template.instance();
    templateObject.crmtaskmitem = new ReactiveVar("all");
    templateObject.currentTabID = new ReactiveVar("allTasks-tab");
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.tprojectlist = new ReactiveVar([]);
    templateObject.all_projects = new ReactiveVar([]);
    templateObject.subTasks = new ReactiveVar([]);
    templateObject.settingDetails = new ReactiveVar([]);
    templateObject.setupFinished = new ReactiveVar();
    templateObject.selectedFile = new ReactiveVar();
});

Template.crmoverview.onRendered(function() {
    const templateObject = Template.instance();
    let currentId = FlowRouter.current().queryParams.id;
    currentId = currentId ? currentId : "all";
    templateObject.crmtaskmitem.set(currentId);
    templateObject.currentTabID.set("allTasks-tab");

    function getCustomerData(customerID) {
        getVS1Data("TCustomerVS1").then(function(dataObject) {
            if (dataObject.length === 0) {
                contactService.getOneCustomerDataEx(customerID).then(function(data) {
                    setCustomerByID(data, 'Customer');
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tcustomervs1;
                let added = false;
                for (let i = 0; i < useData.length; i++) {
                    if (parseInt(useData[i].fields.ID) === parseInt(customerID)) {
                        added = true;
                        setCustomerByID(useData[i], 'Customer');
                    }
                }
                if (!added) {
                    contactService
                        .getOneCustomerDataEx(customerID)
                        .then(function(data) {
                            setCustomerByID(data, 'Customer');
                        });
                }
            }
        }).catch(function(err) {
            contactService.getOneCustomerDataEx(customerID).then(function(data) {
                $(".fullScreenSpin").css("display", "none");
                setCustomerByID(data, 'Customer');
            });
        });
    }

    function getSupplierData(customerID) {
        getVS1Data("TSupplierVS1").then(function(dataObject) {
            if (dataObject.length === 0) {
                contactService.getOneSupplierDataEx(customerID).then(function(data) {
                    setCustomerByID(data, 'Supplier');
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tsuppliervs1;
                let added = false;
                for (let i = 0; i < useData.length; i++) {
                    if (parseInt(useData[i].fields.ID) === parseInt(customerID)) {
                        added = true;
                        setCustomerByID(useData[i], 'Supplier');
                    }
                }
                if (!added) {
                    contactService
                        .getOneSupplierDataEx(customerID)
                        .then(function(data) {
                            setCustomerByID(data, 'Supplier');
                        });
                }
            }
        }).catch(function(err) {
            contactService.getOneSupplierDataEx(customerID).then(function(data) {
                $(".fullScreenSpin").css("display", "none");
                setCustomerByID(data, 'Supplier');
            });
        });
    }

    function getLeadData(leadID) {
        getVS1Data("TProspectEx").then(function(dataObject) {
            if (dataObject.length === 0) {
                contactService.getOneLeadDataEx(leadID).then(function(data) {
                    setCustomerByID(data, 'Lead');
                });

            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tprospectvs1;
                let added = false;
                for (let i = 0; i < useData.length; i++) {
                    if (parseInt(useData[i].fields.ID) === parseInt(leadID)) {
                        added = true;
                        setCustomerByID(useData[i], 'Lead');
                    }
                }
                if (!added) {
                    contactService.getOneLeadDataEx(leadID).then(function(data) {
                        setCustomerByID(data, 'Lead');
                    });
                }
            }
        }).catch(function(err) {
            contactService.getOneLeadDataEx(leadID).then(function(data) {
                $(".fullScreenSpin").css("display", "none");
                setCustomerByID(data, 'Lead');
            });
        });
    }

    function setCustomerByID(data, type) {
        // $("#add_task_name").val(data.fields.ClientName);
        const $select = document.querySelector('#add_contact_name');
        $select.value = data.fields.ClientName
        $('#contactID').val(data.fields.ID)
        $('#contactType').val(type)

        $("#editProjectID").val("");
        $("#txtCrmSubTaskID").val("");

        $(".addTaskModalProjectName").html("All Tasks");
        $(".lblAddTaskSchedule").html("Schedule");

        $(".taskModalActionFlagDropdown").removeClass("task_modal_priority_3");
        $(".taskModalActionFlagDropdown").removeClass("task_modal_priority_2");
        $(".taskModalActionFlagDropdown").removeClass("task_modal_priority_1");
        $(".taskModalActionFlagDropdown").removeClass("task_modal_priority_0");

        // uncheck all labels
        $(".chkAddLabel").prop("checked", false);

        $("#newTaskModal").modal("toggle");
    }

    if (FlowRouter.current().queryParams.customerid) {
        getCustomerData(FlowRouter.current().queryParams.customerid);
    }
    if (FlowRouter.current().queryParams.leadid) {
        getLeadData(FlowRouter.current().queryParams.leadid);
    }
    if (FlowRouter.current().queryParams.supplierid) {
        getSupplierData(FlowRouter.current().queryParams.supplierid);
    }
    if (FlowRouter.current().queryParams.taskid && FlowRouter.current().queryParams.taskid !== "undefined") {
        let type = "";
        $(".fullScreenSpin").css("display", "inline-block");
        openEditTaskModal(FlowRouter.current().queryParams.taskid, type);
    }
    templateObject.initSubtaskDatatable = function() {
        let splashArrayTaskList = templateObject.makeTaskTableRows(templateObject.subTasks.get());
        try {
            $("#tblSubtaskDatatable").DataTable({
                data: splashArrayTaskList,
                columnDefs: [{
                        orderable: false,
                        targets: 0,
                        className: "colCompleteTask colSubComplete",
                        createdCell: function(td, cellData, rowData, row, col) {
                            $(td).closest("tr").attr("data-id", rowData[8]);
                            $(td).attr("data-id", rowData[8]);
                            $(td).addClass("task_priority_" + rowData[9]);
                            if (rowData[11]) {
                                $(td).addClass("taskCompleted");
                            }
                        },
                        width: "18px",
                    },
                    {
                        orderable: false,
                        targets: 1,
                        className: "colPriority openEditSubTaskModal hiddenColumn",
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
                            $(td).attr("data-id", rowData[8]);
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
                        className: "colTaskActions",
                        createdCell: function(td, cellData, rowData, row, col) {
                            $(td).attr("data-id", rowData[8]);
                        },
                        width: "150px",
                    },
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
    templateObject.makeTaskTableRows = function(task_array) {
        let taskRows = [];
        let td0, td1, tflag, td11, td2, td3, td4, td5 = "";
        let projectName = "";
        let labelsForExcel = "";
        let color_num = '100'

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
        </div>`;

            taskRows.push([
                td0,
                tflag,
                td1,
                td2,
                td3,
                td4,
                projectName,
                td5,
                item.fields.ID,
                color_num,
                labelsForExcel,
                item.fields.Completed,
                projectColor
            ]);
        });
        return taskRows;
    };
    templateObject.updateTaskSchedule = function(id, date) {
        let due_date = "";
        let due_date_display = "No Date";
        if (date) {
            due_date = moment(date).format("YYYY-MM-DD hh:mm:ss");
            due_date_display = moment(due_date).format("D MMM");
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
    ///////////////////////////////////////////////////
    $(".crmSelectLeadList").editableSelect();
    $(".crmSelectLeadList").editableSelect().on("click.editable-select", function(e, li) {
        $("#customerListModal").modal();
    });
    $(".crmSelectEmployeeList").editableSelect();
    $(".crmSelectEmployeeList").editableSelect().on("click.editable-select", function(e, li) {
        $("#employeeListModal").modal();
    });
    $("#taskDetailModalCategoryLabel").editableSelect();
    $("#taskDetailModalCategoryLabel").editableSelect().on("click.editable-select", function(e, li) {
        $("#projectListModal").modal();
    });
    $(document).on("click", "#tblContactlist tbody tr", function(e) {
        var table = $(this);
        let colClientName = table.find(".colClientName").text();
        let colID = table.find(".colID").text();
        let colType = table.find(".colType").text();

        let colPhone = table.find(".colPhone").text();
        let colEmail = table.find(".colEmail").text();

        //if (colType != 'Prospect' && colType != 'Customer') {
        colType = colType == 'Customer / Supplier' ? 'Supplier' : colType;
        colType = colType == 'Customer / Prospect / Supplier' ? 'Supplier' : colType;
        $('#customerListModal').modal('toggle');

        // for add modal
        $('#add_contact_name').val(colClientName);
        // for edit modal
        $('#crmEditSelectLeadList').val(colClientName);

        $('#contactID').val(colID)
        $('#contactType').val(colType)

        $('#contactEmailClient').val(colEmail);
        $('#contactPhoneClient').val(colPhone);
        //} else {
        //  swal("Please select valid type of contact", "", "error");
        //  return false;
        //}

    });
    $(document).on("click", "#tblEmployeelist tbody tr", function(e) {
        var table = $(this);
        let colEmployeeName = table.find(".colEmployeeName").text();
        let colID = table.find(".colID").text();

        let colPhone = table.find(".colPhone").text();
        let colEmail = table.find(".colEmail").text();

        $('#employeeListModal').modal('toggle');

        // for add modal
        $('#add_assigned_name').val(colEmployeeName);
        // for edit modal
        $('#crmEditSelectEmployeeList').val(colEmployeeName);

        $('#assignedID').val(colID)

        $('#contactEmailUser').val(colEmail);
        $('#contactPhoneUser').val(colPhone);
    });
    $(document).on("click", "#tblProjectsDatatablePop tbody tr", function(e) {
        var table = $(this);
        let colProjectName = table.find(".colProjectName").text();
        let colID = parseInt(table.attr("data-id"));

        $('#projectListModal').modal('toggle');

        $("#addProjectID").val(colID);
        $("#taskDetailModalCategoryLabel").val(colProjectName);
    });
    ///////////////////////////////////////////////////

    templateObject.getSettingsList = async function() {
        let data = [];
        let details = [];
        const settingFields = ['VS1MailchimpApiKey', 'VS1MailchimpAudienceID', 'VS1MailchimpCampaignID'];
        let dataObject = await getVS1Data('TERPPreference')
        if (dataObject.length > 0) {
            data = JSON.parse(dataObject[0].data);
            details = data.terppreference.filter(function(item) {
                if (settingFields.includes(item.PrefName)) {
                    return item;
                }
            });
        }
        if (details.length == 0) {
            prefSettings = await settingService.getPreferenceSettings(settingFields);
            details = prefSettings.terppreference;
            data.terppreference.push(...details);
            await addVS1Data('TERPPreference', JSON.stringify(data))
        }

        if (details.length > 0) {
            templateObject.settingDetails.set(details);
        }
        $('.fullScreenSpin').css('display', 'none');

    };

    templateObject.getSettingsList();
});

Template.crmoverview.events({
    "click .menuTasklist": function(e) {
        Template.instance().crmtaskmitem.set("all");
    },

    "click .menuTasktoday": function(e) {
        Template.instance().crmtaskmitem.set("today");
    },

    "click .menuTaskupcoming": function(e) {
        Template.instance().crmtaskmitem.set("upcoming");
    },

    // open new task modal
    "click .btnNewTask": function(e) {
        $("#editProjectID").val("");
        $("#txtCrmSubTaskID").val("");

        $(".addTaskModalProjectName").html("All Tasks");
        $(".lblAddTaskSchedule").html("Schedule");

        $(".taskModalActionFlagDropdown").removeClass("task_modal_priority_3");
        $(".taskModalActionFlagDropdown").removeClass("task_modal_priority_2");
        $(".taskModalActionFlagDropdown").removeClass("task_modal_priority_1");
        $(".taskModalActionFlagDropdown").removeClass("task_modal_priority_0");

        // uncheck all labels
        $(".chkAddLabel").prop("checked", false);

        // for add modal
        let employeeID = Session.get("mySessionEmployeeLoggedID");
        let employeeName = Session.get("mySessionEmployee");
        $('#add_assigned_name').val(employeeName);
        $('#assignedID').val(employeeID)

        $('#contactID').val('');
        $('#contactType').val('')
        $('#add_contact_name').val('')

        $("#newTaskModal").modal("toggle");
    },

    "click .detail_label": function(e) {
        e.stopPropagation();
    },

    "click .add_label": function(e) {
        e.stopPropagation();
    },

    // add comment
    "click .btnCrmAddComment": function(e) {
        let taskID = $("#txtCrmTaskID").val();
        let projectID = $("#txtCrmProjectID").val();
        let comment = $("#txtCommentsDescription").val();

        let employeeID = Session.get("mySessionEmployeeLoggedID");
        let employeeName = Session.get("mySessionEmployee");

        var objDetails = {
            type: "Tprojecttask_comments",
            fields: {
                TaskID: taskID,
                ProjectID: projectID,
                EnteredByID: employeeID,
                EnteredBy: employeeName,
                CommentsDescription: comment,
            },
        };

        if (taskID != "" && projectID != "" && comment != "") {
            $(".fullScreenSpin").css("display", "inline-block");
            crmService.saveComment(objDetails).then(function(objDetails) {
                if (objDetails.fields.ID) {
                    $("#txtCommentsDescription").val("");

                    let commentUserArry = employeeName.toUpperCase().split(" ");
                    let commentUser =
                        commentUserArry.length > 1 ?
                        commentUserArry[0].charAt(0) + commentUserArry[1].charAt(0) :
                        commentUserArry[0].charAt(0);

                    let comment_date = moment().format("MMM D h:mm A");

                    let new_comment = `
            <div class="col-12 taskComment" style="padding: 16px 32px;" id="taskComment_${objDetails.fields.ID}">
              <div class="row commentRow">
                <div class="col-1">
                  <div class="commentUser">${commentUser}</div>
                </div>
                <div class="col-11" style="padding-top:4px; padding-left: 24px;">
                  <div class="row">
                    <div>
                      <span class="commenterName">${employeeName}</span>
                      <span class="commentDateTime">${comment_date}</span>
                    </div>
                  </div>
                  <div class="row">
                    <span class="commentText">${comment}</span>
                  </div>
                </div>
              </div>
            </div>
            `;
                    $(".task-comment-row").append(new_comment);
                }

                $(".fullScreenSpin").css("display", "none");
            }).catch(function(err) {
                swal({
                    title: "Oooops...",
                    text: err,
                    type: "error",
                    showCancelButton: false,
                    confirmButtonText: "Try Again",
                }).then((result) => {});
                $(".fullScreenSpin").css("display", "none");
            });
        }
    },

    "click .btnRefresh": function() {
        $(".fullScreenSpin").css("display", "inline-block");

        crmService.getAllTaskList().then(function(data) {
            addVS1Data("TCRMTaskList", JSON.stringify(data));
            crmService.getTProjectList().then(function(data) {
                addVS1Data("TCRMProjectList", JSON.stringify(data));
                crmService.getAllLabels().then(function(data) {
                    addVS1Data("TCRMLabelList", JSON.stringify(data));

                    crmService.getAllLeads(dateFrom).then(function(data) {
                        let bar_records = [];
                        let pie_records = [];
                        if (data.tprospect.length) {

                            let accountData = data.tprospect;
                            for (let i = 0; i < accountData.length; i++) {
                                let recordObj = {};
                                recordObj.Id = data.tprospect[i].fields.ID;
                                let CreationDate = data.tprospect[i].fields.CreationDate ? data.tprospect[i].fields.CreationDate.substr(0, 10) : "";

                                recordObj.CreationDateSort = CreationDate ? CreationDate : "-";
                                recordObj.CreationDate = CreationDate ? getModdayOfCurrentWeek(CreationDate) + "~" : "-";
                                bar_records.push(recordObj);

                                let pieRecordObj = {};
                                pieRecordObj.Id = data.tprospect[i].fields.ID;
                                pieRecordObj.SourceName = data.tprospect[i].fields.SourceName ? data.tprospect[i].fields.SourceName : "-";
                                pie_records.push(pieRecordObj);
                            }

                            bar_records = _.sortBy(bar_records, 'CreationDateSort');
                            bar_records = _.groupBy(bar_records, 'CreationDate');

                            pie_records = _.sortBy(pie_records, 'SourceName');
                            pie_records = _.groupBy(pie_records, 'SourceName');

                        } else {
                            let recordObj = {};
                            recordObj.Id = '';
                            recordObj.CreationDate = '-';

                            let pieRecordObj = {};
                            pieRecordObj.Id = '';
                            pieRecordObj.SourceName = '-';

                            bar_records.push(recordObj);
                            pie_records.push(pieRecordObj);
                        }

                        addVS1Data("TCRMLeadBarChart", JSON.stringify(bar_records));
                        addVS1Data("TCRMLeadPieChart", JSON.stringify(pie_records));
                        window.history.pushState('name', '', 'crmoverview');
                        Meteor._reload.reload();
                    }).catch(function(err) {
                        window.history.pushState('name', '', 'crmoverview');
                        Meteor._reload.reload();
                    });

                }).catch(function(err) {
                    window.history.pushState('name', '', 'crmoverview');
                    Meteor._reload.reload();
                });
            }).catch(function(err) {
                window.history.pushState('name', '', 'crmoverview');
                Meteor._reload.reload();
            });
        }).catch(function(err) {
            window.history.pushState('name', '', 'crmoverview');
            Meteor._reload.reload();
        });
    },

    "click #exportbtn": function() {
        $(".fullScreenSpin").css("display", "inline-block");
        let currentTabID = Template.instance().currentTabID.get();

        switch (currentTabID) {
            case "todayTab-tab":
                jQuery("#tblTodayTaskDatatable_wrapper .dt-buttons .btntabletocsv").click();
                break;
            case "upcomingTab-tab":
                jQuery("#tblUpcomingTaskDatatable_wrapper .dt-buttons .btntabletocsv").click();
                break;
            case "projectsTab-tab":
                jQuery("#tblNewProjectsDatatable_wrapper .dt-buttons .btntabletocsv").click();
                break;
            case "filterLabelsTab-tab":
                jQuery("#tblLabels_wrapper .dt-buttons .btntabletocsv").click();
                break;
            default:
                jQuery("#tblAllTaskDatatable_wrapper .dt-buttons .btntabletocsv").click();
                break;
        }

        $(".fullScreenSpin").css("display", "none");
    },

    "click .printConfirm": function(event) {
        playPrintAudio();
        const instance = Template.instance();
        setTimeout(() => {
            let currentTabID = instance.currentTabID.get();

            $(".fullScreenSpin").css("display", "inline-block");
            switch (currentTabID) {
                case "todayTab-tab":
                    jQuery("#tblTodayTaskDatatable_wrapper .dt-buttons .btntabletopdf").click();
                    break;
                case "upcomingTab-tab":
                    jQuery("#tblUpcomingTaskDatatable_wrapper .dt-buttons .btntabletopdf").click();
                    break;
                case "projectsTab-tab":
                    jQuery("#tblNewProjectsDatatable_wrapper .dt-buttons .btntabletopdf").click();
                    break;
                case "filterLabelsTab-tab":
                    jQuery("#tblLabels_wrapper .dt-buttons .btntabletopdf").click();
                    break;
                default:
                    jQuery("#tblAllTaskDatatable_wrapper .dt-buttons .btntabletopdf").click();
                    break;
            }

            $(".fullScreenSpin").css("display", "none");
        }, delayTimeAfterSound);
    },

    "click #myAllTablesTab": function(e) {
        Template.instance().currentTabID.set(e.target.id);
    },

    "click #btn_send_to_mailchimp": async function(e) {
        let isCustomer = "off";
        let isSupplier = "off";
        let isEmployee = "off";
        if ($('#chk_customer').is(":checked")) {
            isCustomer = "on";
        }
        if ($('#chk_supplier').is(":checked")) {
            isSupplier = "on";
        }
        if ($('#chk_employee').is(":checked")) {
            isEmployee = "on";
        }

        $(".fullScreenSpin").css("display", "inline-block");

        try {

            let templateObject = Template.instance();
            let settingDetails = templateObject.settingDetails.get();

            if (!settingDetails) {
                swal("Mail Chimp Account not setup yet, do you wish to create the account now", "", "info");
                $(".fullScreenSpin").css("display", "none");
                return;
            }

            var erpGet = erpDb();
            Meteor.call('createListMembers', erpGet, isSupplier, isCustomer, isEmployee, function(error, result) {
                if (error !== undefined) {
                    swal("Something went wrong!", "", "error");
                } else {
                    swal("Contacts are added to Mail Chimp successfully", "", "success");
                }
                $(".fullScreenSpin").css("display", "none");
            });
        } catch (error) {
            swal("Something went wrong!", "", "error");
            $(".fullScreenSpin").css("display", "none");
        }
    },

    "click #btnAddCampaign": function(e) {
        $('#crmMailchimpAddCampaignModal').modal();
        return;
    },

    "click .btnMailchimp": function(e) {
        $('#crmMailchimpModal').modal();
        return;
    },

    "click #btnCorrespondence": function(e) {
        FlowRouter.go("/correspondence-list");
        return;
    },

    "click #btnCampaign": function(e) {
        $('#crmMailchimpModal').modal();
        return;
    },

    "click #btnCampaignList": function(e) {
        FlowRouter.go("/campaign-list");
        return;
    },

    "click .menu_all_task": function(e) {
        $('#allTasks-tab').click();
        $('#crm_header_title').html('All Tasks');
    },

    "click .menu_today": function(e) {
        $('#todayTab-tab').click();
        $('#crm_header_title').html('Today Tasks');
    },

    "click .menu_upcoming": function(e) {
        $('#upcomingTab-tab').click();
        $('#crm_header_title').html('Upcoming Tasks');
    },

    "click .menu_project": function(e) {
        $('#projectsTab-tab').click();
        $('#crm_header_title').html('Projects');
    },

    "click .menu_label": function(e) {
        $('#filterLabelsTab-tab').click();
        $('#crm_header_title').html('Labels');
    },

    "click #sidenavcrm": function(e) {
        FlowRouter.go("/crmoverview");
        Meteor._reload.reload();
    },

    //Export_Import
    'click .templateDownload': function() {
        let utilityService = new UtilityService();
        let rows = [];
        const filename = 'SampleTaskLists' + '.csv';
        rows[0] = ['Contact', 'Date', 'Task', 'Description', 'Labels', 'Project'];
        rows[1] = ['Contact1', 'DD/MM/YYYY', 'Task1', 'Description1', 'Label1', 'Project1'];
        utilityService.exportToCsv(rows, filename, 'csv');
    },
    'click .btnUploadFile': function(event) {
        $('#attachment-upload').val('');
        $('.file-name').text('');
        //$(".btnImport").removeAttr("disabled");
        $('#attachment-upload').trigger('click');

    },
    'click .templateDownloadXLSX': function(e) {
        e.preventDefault(); //stop the browser from following
        window.location.href = 'sample_imports/SampleTaskLists.xlsx';
    },
    'change #attachment-upload': function(e) {
        let templateObj = Template.instance();
        var filename = $('#attachment-upload')[0].files[0]['name'];
        var fileExtension = filename.split('.').pop().toLowerCase();
        var validExtensions = ["csv", "txt", "xlsx"];
        var validCSVExtensions = ["csv", "txt"];
        var validExcelExtensions = ["xlsx", "xls"];

        if (validExtensions.indexOf(fileExtension) == -1) {
            // Bert.alert('<strong>formats allowed are : '+ validExtensions.join(', ')+'</strong>!', 'danger');
            swal('Invalid Format', 'formats allowed are :' + validExtensions.join(', '), 'error');
            $('.file-name').text('');
            $(".btnImport").Attr("disabled");
        } else if (validCSVExtensions.indexOf(fileExtension) != -1) {
            $('.file-name').text(filename);
            let selectedFile = event.target.files[0];
            templateObj.selectedFile.set(selectedFile);
            if ($('.file-name').text() != "") {
                $(".btnImport").removeAttr("disabled");
            } else {
                $(".btnImport").Attr("disabled");
            }
        } else if (fileExtension == 'xlsx') {
            $('.file-name').text(filename);
            let selectedFile = event.target.files[0];
            var oFileIn;
            var oFile = selectedFile;
            var sFilename = oFile.name;
            // Create A File Reader HTML5
            var reader = new FileReader();

            // Ready The Event For When A File Gets Selected
            reader.onload = function(e) {
                var data = e.target.result;
                data = new Uint8Array(data);
                var workbook = XLSX.read(data, { type: 'array' });

                var result = {};
                workbook.SheetNames.forEach(function(sheetName) {
                    var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
                    var sCSV = XLSX.utils.make_csv(workbook.Sheets[sheetName]);
                    templateObj.selectedFile.set(sCSV);

                    if (roa.length) result[sheetName] = roa;
                });
                // see the result, caution: it works after reader event is done.
            };
            reader.readAsArrayBuffer(oFile);

            if ($('.file-name').text() != "") {
                $(".btnImport").removeAttr("disabled");
            } else {
                $(".btnImport").Attr("disabled");
            }
        }
    },
    'click .btnImport': function() {
        $('.fullScreenSpin').css('display', 'inline-block');
        let templateObject = Template.instance();
        let contactService = new ContactService();
        let objDetails;
        let contact;
        let now_date;
        Papa.parse(templateObject.selectedFile.get(), {
            complete: function(results) {
                if (results.data.length > 0) {
                    if ((results.data[0][0] == "Contact") && (results.data[0][1] == "Date") && (results.data[0][2] == "Task") && (results.data[0][3] == "Description") && (results.data[0][4] == "Labels") && (results.data[0][5] == "Project")) {

                        let dataLength = results.data.length * 500;
                        setTimeout(function() {
                            window.open('/crmoverview?success=true', '_self');
                            $('.fullScreenSpin').css('display', 'none');
                        }, parseInt(dataLength));

                        for (let i = 0; i < results.data.length - 1; i++) {
                            contact = results.data[i + 1][0] || '';
                            now_date = results.data[i + 1][1] || moment().format("DD/MM/YYYY");
                            objDetails = {

                                type: "TCRMTaskList",
                                fields: {
                                    ClientName: contact,
                                    due_date: now_date,
                                    TaskName: results.data[i + 1][2] || '',
                                    TaskDescription: results.data[i + 1][3] || '',
                                    TaskLabel: results.data[i + 1][4] || '',
                                    ProjectName: results.data[i + 1][5] || '',
                                    Active: true
                                }
                            };
                            if (results.data[i + 1][0]) {
                                if (results.data[i + 1][0] !== "") {
                                    contactService.saveNewTask(objDetails).then(function(data) {
                                        //$('.fullScreenSpin').css('display','none');
                                        //Meteor._reload.reload();
                                    }).catch(function(err) {
                                        //$('.fullScreenSpin').css('display','none');
                                        swal({
                                            title: 'Oooops...',
                                            text: err,
                                            type: 'error',
                                            showCancelButton: false,
                                            confirmButtonText: 'Try Again'
                                        }).then((result) => {
                                            if (result.value) {
                                                window.open('/crmoverview?success=true', '_self');
                                            } else if (result.dismiss === 'cancel') {
                                                window.open('/crmoverview?success=true', '_self');
                                            }
                                        });
                                    });
                                }
                            }
                        }

                    } else {
                        $('.fullScreenSpin').css('display', 'none');
                        // Bert.alert('<strong> Data Mapping fields invalid. </strong> Please check that you are importing the correct file with the correct column headers.', 'danger');
                        swal('Invalid Data Mapping fields ', 'Please check that you are importing the correct file with the correct column headers.', 'error');
                    }
                } else {
                    $('.fullScreenSpin').css('display', 'none');
                    // Bert.alert('<strong> Data Mapping fields invalid. </strong> Please check that you are importing the correct file with the correct column headers.', 'danger');
                    swal('Invalid Data Mapping fields ', 'Please check that you are importing the correct file with the correct column headers.', 'error');
                }

            }
        });
    }

});

Template.crmoverview.helpers({
    crmtaskmitem: () => {
        return Template.instance().crmtaskmitem.get();
    },
    // isAllTasks: () => {
    //   return Template.instance().crmtaskmitem.get() === "all";
    // },
    // isTaskToday: () => {
    //   return Template.instance().crmtaskmitem.get() === "today";
    // },
    // isTaskUpcoming: () => {
    //   return Template.instance().crmtaskmitem.get() === "upcoming";
    // },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    currentTabID: () => {
        return Template.instance().currentTabID.get();
    },
});

// function openEditTaskModal(id, type) {
//   // let catg = e.target.dataset.catg;
//   let templateObject = Template.instance();
//   // $("#editProjectID").val("");

//   $("#txtCrmSubTaskID").val(id);

//   $(".fullScreenSpin").css("display", "inline-block");
//   // get selected task detail via api
//   crmService.getTaskDetail(id).then(function (data) {
//     if (data.fields.ID == id) {
//       let selected_record = data.fields;

//       $("#txtCrmTaskID").val(selected_record.ID);
//       $("#txtCrmProjectID").val(selected_record.ProjectID);
//       $("#txtCommentsDescription").val("");

//       $(".editTaskDetailName").val(selected_record.TaskName);
//       $(".editTaskDetailDescription").val(selected_record.TaskDescription);

//       let projectName = selected_record.ProjectName == "Default" ? "All Tasks" : selected_record.ProjectName;

//       if (selected_record.Completed) {
//         $('#lblComplete_taskEditLabel').removeClass('chk_complete');
//         $('#lblComplete_taskEditLabel').addClass('chk_uncomplete');
//         $('#chkComplete_taskEdit').removeClass('chk_complete');
//         $('#chkComplete_taskEdit').addClass('chk_uncomplete');
//         $('#chkComplete_taskEdit').prop("checked", true);
//       } else {
//         $('#lblComplete_taskEditLabel').removeClass('chk_uncomplete');
//         $('#lblComplete_taskEditLabel').addClass('chk_complete');
//         $('#chkComplete_taskEdit').removeClass('chk_uncomplete');
//         $('#chkComplete_taskEdit').addClass('chk_complete');
//         $('#chkComplete_taskEdit').prop("checked", false);
//       }

//       let all_projects = templateObject.all_projects.get();
//       let projectColorStyle = '';
//       if (selected_record.ProjectID != 0) {
//         let projects = all_projects.filter(project => project.fields.ID == selected_record.ProjectID);
//         if (projects.length && projects[0].fields.ProjectColour) {
//           projectColorStyle = 'color: ' + projects[0].fields.ProjectColour + ' !important';
//         }
//       }

//       let catg = "";
//       let today = moment().format("YYYY-MM-DD");
//       if (selected_record.due_date) {
//         if (selected_record.due_date.substring(0, 10) == today) {
//           catg =
//             `<i class="fas fa-calendar-day text-primary" style="margin-right: 5px; ${projectColorStyle}"></i>` +
//             "<span class='text-primary' style='" + projectColorStyle + "'>" +
//             projectName +
//             "</span>";
//           $(".taskDueDate").css("color", "#00a3d3");
//         } else if (selected_record.due_date.substring(0, 10) > today) {
//           catg =
//             `<i class="fas fa-calendar-alt text-danger" style="margin-right: 5px; ${projectColorStyle}"></i>` +
//             "<span class='text-danger' style='" + projectColorStyle + "'>" +
//             projectName +
//             "</span>";
//           $(".taskDueDate").css("color", "#1cc88a");
//         } else if (selected_record.due_date.substring(0, 10) < today) {
//           // catg =
//           //   `<i class="fas fa-inbox text-warning" style="margin-right: 5px;"></i>` +
//           //   "<span class='text-warning'>Overdue</span>";
//           // $(".taskDueDate").css("color", "#e74a3b");
//           catg =
//             `<i class="fas fa-inbox text-success" style="margin-right: 5px; ${projectColorStyle}"></i>` +
//             "<span class='text-success' style='" + projectColorStyle + "'>" +
//             projectName +
//             "</span>";
//           $(".taskDueDate").css("color", "#1cc88a");
//         } else {
//           catg =
//             `<i class="fas fa-inbox text-success" style="margin-right: 5px; ${projectColorStyle}"></i>` +
//             "<span class='text-success' style='" + projectColorStyle + "'>" +
//             projectName +
//             "</span>";
//           $(".taskDueDate").css("color", "#1cc88a");
//         }
//       } else {
//         catg =
//           `<i class="fas fa-inbox text-success" style="margin-right: 5px; ${projectColorStyle}"></i>` +
//           "<span class='text-success' style='" + projectColorStyle + "'>" +
//           projectName +
//           "</span>";
//         $(".taskDueDate").css("color", "#1cc88a");
//       }

//       $(".taskLocation").html(
//         `<a class="taganchor">
//                 ${catg}
//               </a>`
//       );

//       if (projectName) {
//         $('.taskDetailProjectName').show();
//       } else {
//         $('.taskDetailProjectName').hide();
//       }

//       $("#taskmodalNameLabel").html(selected_record.TaskName);
//       $(".activityAdded").html("Added on " + moment(selected_record.MsTimeStamp).format("MMM D h:mm A"));
//       // let due_date = selected_record.due_date ? moment(selected_record.due_date).format("D MMM") : "No Date";
//       let due_date = selected_record.due_date ? moment(selected_record.due_date).format("dddd, Do MMMM") : "No Date";


//       let todayDate = moment().format("ddd");
//       let tomorrowDay = moment().add(1, "day").format("ddd");
//       let nextMonday = moment(moment()).day(1 + 7).format("ddd MMM D");
//       let date_component = ` <div class="dropdown btnTaskTableAction">
//         <div data-toggle="dropdown" title="Reschedule Task" style="cursor:pointer;">
//           <i class="far fa-calendar-plus" style="margin-right: 5px;"></i>
//           <span id="edit_task_modal_due_date">${due_date}</span>
//         </div>
//         <div class="dropdown-menu dropdown-menu-right reschedule-dropdown-menu  no-modal"
//           aria-labelledby="dropdownMenuButton" style="width: 275px;">
//           <a class="dropdown-item no-modal setScheduleToday" href="#" data-id="${selected_record.ID}">
//             <i class="fas fa-calendar-day text-success no-modal"
//               style="margin-right: 8px;"></i>Today
//             <div class="float-right no-modal" style="width: 40%; text-align: end; color: #858796;">
//               ${todayDate}</div>
//           </a>
//           <a class="dropdown-item no-modal setScheduleTomorrow" href="#"
//             data-id="${selected_record.ID}">
//             <i class="fas fa-sun text-warning no-modal" style="margin-right: 8px;"></i>Tomorrow
//             <div class="float-right no-modal" style="width: 40%; text-align: end; color: #858796;">
//               ${tomorrowDay}</div>
//           </a>
//           <a class="dropdown-item no-modal setScheduleWeekend" href="#"
//             data-id="${selected_record.ID}">
//             <i class="fas fa-couch text-primary no-modal" style="margin-right: 8px;"></i>This Weekend
//             <div class="float-right no-modal" style="width: 40%; text-align: end; color: #858796;">
//               Sat</div>
//           </a>
//           <a class="dropdown-item no-modal setScheduleNexweek" href="#"
//             data-id="${selected_record.ID}">
//             <i class="fas fa-calendar-alt text-danger no-modal" style="margin-right: 8px;"></i>Next Week
//             <div class="float-right no-modal" style="width: 40%; text-align: end; color: #858796;">
//               ${nextMonday}
//             </div>
//           </a>
//           <a class="dropdown-item no-modal setScheduleNodate" href="#" data-id="${selected_record.ID}">
//             <i class="fas fa-ban text-secondary no-modal" style="margin-right: 8px;"></i>
//             No Date</a>
//           <div class="dropdown-divider no-modal"></div>
//           <div class="form-group no-modal" data-toggle="tooltip" data-placement="bottom"
//             title="Date format: DD/MM/YYYY" style="display:flex; margin: 6px 20px; margin-top: 0px; z-index: 99999;">
//             <label style="margin-top: 6px; margin-right: 16px; width: 146px;">Select Date</label>
//             <div class="input-group date no-modal" style="cursor: pointer;">
//               <input type="text" id="${selected_record.ID}" class="form-control crmDatepicker no-modal"
//                 autocomplete="off">
//               <div class="input-group-addon no-modal">
//                 <span class="glyphicon glyphicon-th no-modal" style="cursor: pointer;"></span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>`;

//       // $("#taskmodalDuedate").html(due_date);
//       $("#taskmodalDuedate").html(date_component);
//       $("#taskmodalDescription").html(selected_record.TaskDescription);

//       $("#chkComplete_taskEditLabel").removeClass("task_priority_0");
//       $("#chkComplete_taskEditLabel").removeClass("task_priority_1");
//       $("#chkComplete_taskEditLabel").removeClass("task_priority_2");
//       $("#chkComplete_taskEditLabel").removeClass("task_priority_3");
//       $("#chkComplete_taskEditLabel").addClass("task_priority_" + selected_record.priority);

//       let taskmodalLabels = "";
//       $(".chkDetailLabel").prop("checked", false);
//       if (selected_record.TaskLabel) {
//         if (selected_record.TaskLabel.fields != undefined) {
//           taskmodalLabels =
//             `<span class="taskTag"><i class="fas fa-tag" style="color:${selected_record.TaskLabel.fields.Color};"></i><a class="taganchor filterByLabel" href="" data-id="${selected_record.TaskLabel.fields.ID}">` +
//             selected_record.TaskLabel.fields.TaskLabelName +
//             "</a></span>";
//           $("#detail_label_" + selected_record.TaskLabel.fields.ID).prop(
//             "checked",
//             true
//           );
//         } else {
//           selected_record.TaskLabel.forEach((lbl) => {
//             taskmodalLabels +=
//               `<span class="taskTag"><i class="fas fa-tag" style="color:${lbl.fields.Color};"></i><a class="taganchor filterByLabel" href="" data-id="${lbl.fields.ID}">` +
//               lbl.fields.TaskLabelName +
//               "</a></span> ";
//             $("#detail_label_" + lbl.fields.ID).prop("checked", true);
//           });
//           taskmodalLabels = taskmodalLabels.slice(0, -2);
//         }
//       }
//       // if (taskmodalLabels != "") {
//       //   taskmodalLabels =
//       //     '<span class="taskTag"><i class="fas fa-tag"></i>' +
//       //     taskmodalLabels +
//       //     "</span>";
//       // }
//       $("#taskmodalLabels").html(taskmodalLabels);
//       let subtasks = "";
//       if (selected_record.subtasks) {
//         if (Array.isArray(selected_record.subtasks)) {
//           templateObject.subTasks.set(selected_record.subtasks)
//           templateObject.initSubtaskDatatable();
//         }

//         if (typeof selected_record.subtasks == 'object') {
//           let arr = [];
//           arr.push(selected_record.subtasks)
//           templateObject.subTasks.set(arr)
//           templateObject.initSubtaskDatatable();
//         }
//       } else {
//         let sutTaskTable = $('#tblSubtaskDatatable').DataTable();
//         sutTaskTable.clear().draw();
//       }

//       let comments = "";
//       if (selected_record.comments) {
//         if (selected_record.comments.fields != undefined) {
//           let comment = selected_record.comments.fields;
//           let comment_date = comment.CommentsDate ? moment(comment.CommentsDate).format("MMM D h:mm A") : "";
//           let commentUserArry = comment.EnteredBy.toUpperCase().split(" ");
//           let commentUser = commentUserArry.length > 1 ? commentUserArry[0].charAt(0) + commentUserArry[1].charAt(0) : commentUserArry[0].charAt(0);
//           comments = `
//                 <div class="col-12 taskComment" style="padding: 16px 32px;" id="taskComment_${comment.ID}">
//                   <div class="row commentRow">
//                     <div class="col-1">
//                       <div class="commentUser">${commentUser}</div>
//                     </div>
//                     <div class="col-11" style="padding-top:4px; padding-left: 24px;">
//                       <div class="row">
//                         <div>
//                           <span class="commenterName">${comment.EnteredBy}</span>
//                           <span class="commentDateTime">${comment_date}</span>
//                         </div>
//                       </div>
//                       <div class="row">
//                         <span class="commentText">${comment.CommentsDescription}</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//                 `;
//         } else {
//           selected_record.comments.forEach((item) => {
//             let comment = item.fields;
//             let comment_date = comment.CommentsDate ? moment(comment.CommentsDate).format("MMM D h:mm A") : "";
//             let commentUserArry = comment.EnteredBy.toUpperCase().split(" ");
//             let commentUser = commentUserArry.length > 1 ? commentUserArry[0].charAt(0) + commentUserArry[1].charAt(0) : commentUserArry[0].charAt(0);
//             comments += `
//                   <div class="col-12 taskComment" style="padding: 16px 32px;" id="taskComment_${comment.ID}">
//                     <div class="row commentRow">
//                       <div class="col-1">
//                         <div class="commentUser">${commentUser}</div>
//                       </div>
//                       <div class="col-11" style="padding-top:4px; padding-left: 24px;">
//                         <div class="row">
//                           <div>
//                             <span class="commenterName">${comment.EnteredBy}</span>
//                             <span class="commentDateTime">${comment_date}</span>
//                           </div>
//                         </div>
//                         <div class="row">
//                           <span class="commentText">${comment.CommentsDescription}</span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                   `;
//           });
//         }
//       }
//       $(".task-comment-row").html(comments);

//       let activities = "";
//       if (selected_record.activity) {
//         if (selected_record.activity.fields != undefined) {
//           let activity = selected_record.activity.fields;
//           let day = "";
//           if (moment().format("YYYY-MM-DD") == moment(activity.ActivityDateStartd).format("YYYY-MM-DD")) {
//             day = " ‧ Today";
//           } else if (moment().add(-1, "day").format("YYYY-MM-DD") == moment(activity.ActivityDateStartd).format("YYYY-MM-DD")) {
//             day = " . Yesterday";
//           }
//           let activityDate = moment(activity.ActivityDateStartd).format("MMM D") + day + " . " + moment(activity.ActivityDateStartd).format("ddd");

//           let commentUserArry = activity.EnteredBy.toUpperCase().split(" ");
//           let commentUser = commentUserArry.length > 1 ? commentUserArry[0].charAt(0) + commentUserArry[1].charAt(0) : commentUserArry[0].charAt(0);

//           activities = `
//                 <div class="row" style="padding: 16px;">
//                   <div class="col-12">
//                     <span class="activityDate">${activityDate}</span>
//                   </div>
//                   <hr style="width: 100%; margin: 8px 16px;" />
//                   <div class="col-1">
//                     <div class="commentUser">${commentUser}</div>
//                   </div>
//                   <div class="col-11" style="padding-top: 4px; padding-left: 24px;">
//                     <div class="row">
//                       <span class="activityName">${activity.EnteredBy
//             } </span> <span class="activityAction">${activity.ActivityName
//             } </span>
//                     </div>
//                     <div class="row">
//                       <span class="activityComment">${activity.ActivityDescription
//             }</span>
//                     </div>
//                     <div class="row">
//                       <span class="activityTime">${moment(
//               activity.ActivityDateStartd
//             ).format("h:mm A")}</span>
//                     </div>
//                   </div>
//                   <hr style="width: 100%; margin: 16px;" />
//                 </div>
//                 `;
//         } else {
//           selected_record.activity.forEach((item) => {
//             let activity = item.fields;
//             let day = "";
//             if (moment().format("YYYY-MM-DD") == moment(activity.ActivityDateStartd).format("YYYY-MM-DD")) {
//               day = " ‧ Today";
//             } else if (moment().add(-1, "day").format("YYYY-MM-DD") == moment(activity.ActivityDateStartd).format("YYYY-MM-DD")) {
//               day = " . Yesterday";
//             }
//             let activityDate = moment(activity.ActivityDateStartd).format("MMM D") + day + " . " + moment(activity.ActivityDateStartd).format("ddd");

//             let commentUserArry = activity.EnteredBy.toUpperCase().split(" ");
//             let commentUser = commentUserArry.length > 1 ? commentUserArry[0].charAt(0) + commentUserArry[1].charAt(0) : commentUserArry[0].charAt(0);

//             activities = `
//                   <div class="row" style="padding: 16px;">
//                     <div class="col-12">
//                       <span class="activityDate">${activityDate}</span>
//                     </div>
//                     <hr style="width: 100%; margin: 8px 16px;" />
//                     <div class="col-1">
//                       <div class="commentUser">${commentUser}</div>
//                     </div>
//                     <div class="col-11" style="padding-top: 4px; padding-left: 24px;">
//                       <div class="row">
//                         <span class="activityName">${activity.EnteredBy
//               } </span> <span class="activityAction">${activity.ActivityName
//               } </span>
//                       </div>
//                       <div class="row">
//                         <span class="activityComment">${activity.ActivityDescription
//               }</span>
//                       </div>
//                       <div class="row">
//                         <span class="activityTime">${moment(
//                 activity.ActivityDateStartd
//               ).format("h:mm A")}</span>
//                       </div>
//                     </div>
//                     <hr style="width: 100%; margin: 16px;" />
//                   </div>
//                   `;
//           });
//         }
//       }
//       $(".task-activity-row").html(activities);

//       if (type == "comment") {
//         $("#nav-comments-tab").click();
//       } else {
//         $("#nav-subtasks-tab").click();
//       }

//       $("#chkPriority0").prop("checked", false);
//       $("#chkPriority1").prop("checked", false);
//       $("#chkPriority2").prop("checked", false);
//       $("#chkPriority3").prop("checked", false);
//       $("#chkPriority" + selected_record.priority).prop("checked", true);

//       $(".taskModalActionFlagDropdown").removeClass(
//         "task_modal_priority_3"
//       );
//       $(".taskModalActionFlagDropdown").removeClass(
//         "task_modal_priority_2"
//       );
//       $(".taskModalActionFlagDropdown").removeClass(
//         "task_modal_priority_1"
//       );
//       $(".taskModalActionFlagDropdown").removeClass(
//         "task_modal_priority_0"
//       );
//       $(".taskModalActionFlagDropdown").addClass(
//         "task_modal_priority_" + selected_record.priority
//       );

//       $("#taskDetailModal").modal("toggle");

//       $(".crmDatepicker").datepicker({
//         showOn: "button",
//         buttonText: "Show Date",
//         buttonImageOnly: true,
//         buttonImage: "/img/imgCal2.png",
//         constrainInput: false,
//         dateFormat: "yy/mm/dd",
//         showOtherMonths: true,
//         selectOtherMonths: true,
//         changeMonth: true,
//         changeYear: true,
//         yearRange: "-90:+10",
//         onSelect: function (dateText, inst) {
//           let task_id = inst.id;
//           templateObject.updateTaskSchedule(task_id, new Date(inst.selectedYear, inst.selectedMonth, inst.selectedDay));
//         },
//       });
//       let currentDate = selected_record.due_date ? new Date(selected_record.due_date) : new Date();
//       let begunDate = moment(currentDate).format("DD/MM/YYYY");
//       $(".crmDatepicker").val(begunDate);


//       let contactID = 0;
//       let contactType = '';
//       // tempcode need all contact type in api
//       if (selected_record.CustomerID) {
//         contactID = selected_record.CustomerID;
//         contactType = 'Customer';
//       } else if (selected_record.SupplierID) {
//         contactID = selected_record.SupplierID;
//         contactType = 'Supplier';
//       } else if (selected_record.LeadID) {
//         contactID = selected_record.LeadID;
//         contactType = 'Lead';
//       }
//       getContactData(contactID, contactType);
//       $(".fullScreenSpin").css("display", "none");

//     } else {
//       swal("Cannot edit this task", "", "warning");
//       return;
//     }
//   }).catch(function (err) {
//     $(".fullScreenSpin").css("display", "none");

//     swal(err, "", "error");
//     return;
//   });
// }
// tempcode need all contact type in api
function getContactData(contactID, contactType) {
    if (contactType == 'Customer') {
        getVS1Data("TCustomerVS1").then(function(dataObject) {
            if (dataObject.length === 0) {
                contactService.getOneCustomerDataEx(contactID).then(function(data) {
                    setContactDataToDetail(data, contactType);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tcustomervs1;
                for (let i = 0; i < useData.length; i++) {
                    if (parseInt(useData[i].fields.ID) === parseInt(contactID)) {
                        setContactDataToDetail(useData[i], contactType);
                    }
                }
            }
        }).catch(function(err) {
            contactService.getOneCustomerDataEx(contactID).then(function(data) {
                setContactDataToDetail(data, contactType);
            });
        });
    } else if (contactType == 'Supplier') {
        getVS1Data("TSupplierVS1").then(function(dataObject) {
            if (dataObject.length === 0) {
                contactService.getOneSupplierDataEx(contactID).then(function(data) {
                    setContactDataToDetail(data, contactType);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tsuppliervs1;
                for (let i = 0; i < useData.length; i++) {
                    if (parseInt(useData[i].fields.ID) === parseInt(contactID)) {
                        setContactDataToDetail(useData[i], contactType);
                    }
                }
            }
        }).catch(function(err) {
            contactService.getOneSupplierDataEx(contactID).then(function(data) {
                setContactDataToDetail(data, contactType);
            });
        });
    } else if (contactType == 'Lead') {
        getVS1Data("TProspectEx").then(function(dataObject) {
            if (dataObject.length === 0) {
                contactService.getOneLeadDataEx(contactID).then(function(data) {
                    setContactDataToDetail(data, contactType);
                });

            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tprospectvs1;
                for (let i = 0; i < useData.length; i++) {
                    if (parseInt(useData[i].fields.ID) === parseInt(contactID)) {
                        setContactDataToDetail(useData[i], contactType);
                    }
                }
            }
        }).catch(function(err) {
            contactService.getOneLeadDataEx(contactID).then(function(data) {
                setContactDataToDetail(data, contactType);
            });
        });
    } else {
        getVS1Data("TCustomerVS1").then(function(dataObject) {
            if (dataObject.length === 0) {
                contactService.getOneCustomerDataEx(contactID).then(function(data) {
                    setContactDataToDetail(data, contactType);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tcustomervs1;
                for (let i = 0; i < useData.length; i++) {
                    if (parseInt(useData[i].fields.ID) === parseInt(contactID)) {
                        setContactDataToDetail(useData[i], contactType);
                    }
                }
            }
        }).catch(function(err) {
            contactService.getOneCustomerDataEx(contactID).then(function(data) {
                setContactDataToDetail(data, contactType);
            });
        });
    }
    return;
}

function setContactDataToDetail(data, contactType) {
    if (data.fields == undefined) {
        $('#crmEditSelectLeadList').val('');
        $('#contactID').val('')
        $('#contactType').val('')
        $('#contactEmailClient').val('');
        $('#contactPhoneClient').val('');
    } else {
        $('#crmEditSelectLeadList').val(data.fields.ClientName);
        $('#contactID').val(data.fields.ID)
        $('#contactType').val(contactType)
        $('#contactEmailClient').val(data.fields.colEmail);
        $('#contactPhoneClient').val(data.fields.colPhone);
    }
}
