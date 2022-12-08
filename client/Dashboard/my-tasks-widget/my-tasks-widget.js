import { ReactiveVar } from "meteor/reactive-var";
import { CRMService } from "../../crm/crm-service";
import { ContactService } from "../../contacts/contact-service";
const highCharts = require('highcharts');
require('highcharts/modules/exporting')(highCharts);
require('highcharts/highcharts-more')(highCharts);

let crmService = new CRMService();
const contactService = new ContactService();

Template.myTasksWidget.onCreated(function() {
    this.loggedDb = new ReactiveVar("");
    const templateObject = Template.instance();
    templateObject.todayTasks = new ReactiveVar([]);
    templateObject.tprojectlist = new ReactiveVar([]);
    templateObject.all_projects = new ReactiveVar([]);
    templateObject.subTasks = new ReactiveVar([]);
});

Template.myTasksWidget.onRendered(function() {
    let templateObject = Template.instance();

    templateObject.getInitialAllTaskList = function() {
        getVS1Data("TCRMTaskList").then(function(dataObject) {
            if (dataObject.length == 0) {
                templateObject.getAllTaskList();
            } else {
                let data = JSON.parse(dataObject[0].data);
                let today = moment().format("YYYY-MM-DD");
                let all_records = data.tprojecttasks;
                let url = FlowRouter.current().path;
                url = new URL(window.location.href);
                let employeeID = url.searchParams.get("id") ? url.searchParams.get("id") : '';
                if (employeeID) {
                    all_records = all_records.filter(item => item.fields.EnteredBy == employeeID);
                }
                all_records = all_records.filter((item) => item.fields.Completed == false);
                let today_records = all_records.filter((item) => item.fields.due_date.substring(0, 10) == today);
                templateObject.todayTasks.set(today_records);
            }
        }).catch(function(err) {
            templateObject.getAllTaskList();
        });
    };

    templateObject.getAllTaskListData = function(data) {
        let url = FlowRouter.current().path;
        url = new URL(window.location.href);
        let employeeID = url.searchParams.get("id") ? url.searchParams.get("id") : '';
        if (employeeID == '') {
            // employeeID = Session.get('mySessionEmployeeLoggedID');
            employeeID = Session.get('mySessionEmployee');
        }
        let task_list = [];

        if (data.tprojecttasks && data.tprojecttasks.length > 0) {
            let all_records = data.tprojecttasks;
            all_records = all_records.filter((item) => item.fields.Completed == false && item.fields.EnteredBy == employeeID);
            const fromDate = new Date($("#dateFrom").datepicker("getDate"));
            const toDate = new Date($("#dateTo").datepicker("getDate"));
            for (let i = 0; i < all_records.length; i++) {
                let strPriority = "";
                let priority = all_records[i].fields.priority;
                if (priority === 3) {
                    strPriority = "Urgent";
                } else if (priority === 2) {
                    strPriority = "High";
                } else if (priority === 1) {
                    strPriority = "Normal";
                } else {
                    strPriority = "Low";
                }
                let dueDate = all_records[i].fields.due_date.substring(0, 10);
                dueDate = new Date(dueDate);
                if (fromDate != "Invalid Date") {
                    if (fromDate <= dueDate && toDate >= dueDate) {
                        dueDate = moment(dueDate).format('DD/MM/YYYY');
                        const pdata = {
                            id: all_records[i].fields.ID,
                            taskName: all_records[i].fields.TaskName,
                            description: all_records[i].fields.TaskDescription,
                            dueDate: dueDate,
                            priority: strPriority,
                        }
                        task_list.push(pdata);
                    }
                } else {
                    dueDate = moment(dueDate).format('DD/MM/YYYY');
                    const pdata = {
                        id: all_records[i].fields.ID,
                        taskName: all_records[i].fields.TaskName,
                        description: all_records[i].fields.TaskDescription,
                        dueDate: dueDate,
                        priority: strPriority,
                    }
                    task_list.push(pdata);
                }
            }
            task_list = sortArray(task_list, 'dueDate');
            templateObject.todayTasks.set(task_list.slice(0, 5));
        }
    }
    templateObject.getAllTaskList = function() {
        let url = FlowRouter.current().path;
        url = new URL(window.location.href);
        let employeeID = url.searchParams.get("id") ? url.searchParams.get("id") : '';
        if (employeeID == '') {
            // employeeID = Session.get('mySessionEmployeeLoggedID');
            employeeID = Session.get('mySessionEmployee');
        }
        let task_list = [];
        getVS1Data("TCRMTaskList").then(function(dataObject) {
            if (dataObject.length == 0) {
                crmService.getAllTaskList(employeeID).then(function(data) {
                    templateObject.getAllTaskListData(data);
                }).catch(function(err) {

                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                templateObject.getAllTaskListData(data);
            }
        }).catch(function(err) {
            crmService.getAllTaskList(employeeID).then(function(data) {
                templateObject.getAllTaskListData(data);
            }).catch(function(err) {

            });
        });

    };
    // templateObject.getInitialAllTaskList();
    templateObject.getAllTaskList();
    templateObject.getInitTProjectList = function() {
        getVS1Data("TCRMProjectList").then(function(dataObject) {
            if (dataObject.length == 0) {
                templateObject.getTProjectList();
            } else {
                let data = JSON.parse(dataObject[0].data);
                if (data.tprojectlist && data.tprojectlist.length > 0) {
                    let tprojectlist = data.tprojectlist;
                    let all_projects = data.tprojectlist;

                    const url = new URL(window.location.href);
                    let employeeID = url.searchParams.get("id") ? url.searchParams.get("id") : '';

                    if (employeeID) {
                        all_projects = all_projects.filter((proj) => proj.fields.ID != 11 && proj.fields.EnteredBy == employeeID);
                        tprojectlist = tprojectlist.filter((proj) => proj.fields.Active == true && proj.fields.ID != 11 && proj.fields.EnteredBy == employeeID);
                    } else {
                        all_projects = all_projects.filter((proj) => proj.fields.ID != 11);
                        tprojectlist = tprojectlist.filter((proj) => proj.fields.Active == true && proj.fields.ID != 11);
                    }
                    templateObject.all_projects.set(all_projects);

                    let add_projectlist = `<a class="dropdown-item setProjectIDAdd no-modal" data-projectid="11" data-projectname="All Tasks"><i class="fas fa-inbox text-primary no-modal"
            style="margin-right: 8px;"></i>All Tasks</a>`;
                    let ProjectName = "";
                    tprojectlist.forEach((proj) => {
                        ProjectName = proj.fields.ProjectName.length > 26 ? proj.fields.ProjectName.substring(0, 26) + "..." : proj.fields.ProjectName;
                        add_projectlist += `<a class="dropdown-item setProjectIDAdd no-modal" data-projectid="${proj.fields.ID}" data-projectname="${proj.fields.ProjectName}"><i class="fas fa-circle no-modal" style="margin-right: 8px; color: ${proj.fields.ProjectColour};"></i>${ProjectName}</a>`;
                    });
                    $("#goProjectWrapper").html(add_projectlist);
                    $(".goProjectWrapper").html(add_projectlist);

                    let active_projects = all_projects.filter((project) => project.fields.Active == true);
                    let deleted_projects = all_projects.filter((project) => project.fields.Active == false);
                    let favorite_projects = active_projects.filter((project) => project.fields.AddToFavourite == true);

                    templateObject.active_projects.set(active_projects);
                    templateObject.deleted_projects.set(deleted_projects);
                    templateObject.favorite_projects.set(favorite_projects);

                    $(".crm_project_count").html(active_projects.length);

                    setTimeout(() => {
                        templateObject.initProjectsTable();
                    }, 100);
                } else {
                    templateObject.tprojectlist.set([]);
                    $(".crm_project_count").html(0);
                }
            }
        }).catch(function(err) {
            templateObject.getTProjectList();
        });
    };
    templateObject.getTProjectList = function() {
        let url = FlowRouter.current().path;
        url = new URL(window.location.href);
        let employeeID = url.searchParams.get("id") ? url.searchParams.get("id") : '';

        crmService.getTProjectList(employeeID).then(function(data) {
            if (data.tprojectlist && data.tprojectlist.length > 0) {
                let tprojectlist = data.tprojectlist;
                let all_projects = data.tprojectlist;

                tprojectlist = tprojectlist.filter((proj) => proj.fields.Active == true && proj.fields.ID != 11);
                all_projects = all_projects.filter((proj) => proj.fields.ID != 11);
                templateObject.all_projects.set(all_projects);

                let add_projectlist = `<a class="dropdown-item setProjectIDAdd no-modal" data-projectid="11" data-projectname="All Tasks"><i class="fas fa-inbox text-primary no-modal"
          style="margin-right: 8px;"></i>All Tasks</a>`;
                let ProjectName = "";
                tprojectlist.forEach((proj) => {
                    ProjectName = proj.fields.ProjectName.length > 26 ? proj.fields.ProjectName.substring(0, 26) + "..." : proj.fields.ProjectName;
                    add_projectlist += `<a class="dropdown-item setProjectIDAdd no-modal" data-projectid="${proj.fields.ID}" data-projectname="${proj.fields.ProjectName}"><i class="fas fa-circle no-modal" style="margin-right: 8px; color: ${proj.fields.ProjectColour};"></i>${ProjectName}</a>`;
                });
                $("#goProjectWrapper").html(add_projectlist);
                $(".goProjectWrapper").html(add_projectlist);

                let active_projects = all_projects.filter((project) => project.fields.Active == true);
                let deleted_projects = all_projects.filter((project) => project.fields.Active == false);
                let favorite_projects = active_projects.filter((project) => project.fields.AddToFavourite == true);

                templateObject.active_projects.set(active_projects);
                templateObject.deleted_projects.set(deleted_projects);
                templateObject.favorite_projects.set(favorite_projects);

                $(".crm_project_count").html(active_projects.length);

                setTimeout(() => {
                    templateObject.initProjectsTable();
                }, 100);
            } else {
                templateObject.tprojectlist.set([]);
                $(".crm_project_count").html(0);
            }
            addVS1Data("TCRMProjectList", JSON.stringify(data));
        }).catch(function(err) {});
    };

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
              title="Date format: DD/MM/YYYY" style="margin: 6px 20px; margin-top: 14px;">
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
        $('#edit_task_modal_due_date').html(due_date_display);
        const objDetails = {
            type: "Tprojecttasks",
            fields: {
                ID: id,
                due_date: due_date,
            },
        };
        if (id) {
            crmService.saveNewTask(objDetails).then(function(data) {
                templateObject.getAllTaskList();
                $(".fullScreenSpin").css("display", "none");
                $(".btnRefresh").addClass('btnSearchAlert');
            });
        }
    };

    $(".crmSelectLeadList").editableSelect();
    $(".crmSelectLeadList").editableSelect().on("click.editable-select", function(e, li) {
        $("#customerListModal").modal();
    });
    $(".crmSelectEmployeeList").editableSelect();
    $(".crmSelectEmployeeList").editableSelect().on("click.editable-select", function(e, li) {
        $("#employeeListModal").modal();
    });
    $(document).on("click", "#tblContactlist tbody tr", function(e) {
        var table = $(this);
        let colClientName = table.find(".colClientName").text();
        let colID = table.find(".colID").text();
        let colType = table.find(".colType").text();

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
            //} else {
            //  swal("Please select valid type of contact", "", "error");
            //  return false;
            //}

    });

    $(document).on("click", "#tblEmployeelist tbody tr", function(e) {
        const table = $(this);
        let colEmployeeName = table.find(".colEmployeeName").text();
        let colID = table.find(".colID").text();

        $('#employeeListModal').modal('toggle');

        // for add modal
        $('#add_assigned_name').val(colEmployeeName);
        // for edit modal
        $('#crmSelectEmployeeList').val(colEmployeeName);

        $('#assignedID').val(colID)
    });
});

Template.myTasksWidget.helpers({
    todayTasks: () => Template.instance().todayTasks.get()
});

// Listen to event to update reactive variable
Template.myTasksWidget.events({
    "click .taskline": (e) => {
        let task_id = $(e.currentTarget).attr("taskid");
        // FlowRouter.go('/crmoverview?taskid='+task_id);
        openEditTaskModal(task_id);
    },
    "click .btnAddSubTask": function(event) {
        $("#newTaskModal").modal("toggle");
    },
    // update task rename task
    "click .btnSaveEditTask": function(e) {
        playSaveAudio();
        let templateObject = Template.instance();
        setTimeout(function() {
            let taskID = $("#txtCrmTaskID").val();
            if (taskID) {
                let selected_lbls = [];
                let unselected_lbls = [];
                $("#detailTaskLabelWrapper input:checked").each(function() {
                    selected_lbls.push($(this).attr("name"));
                });
                $("#detailTaskLabelWrapper input:unchecked").each(function() {
                    unselected_lbls.push($(this).attr("name"));
                });

                let editTaskDetailName = $(".editTaskDetailName").val();
                let editTaskDetailDescription = $(".editTaskDetailDescription").val();
                if (editTaskDetailName == "") {
                    swal("Please endter the task name", "", "warning");
                    return;
                }
                let contactID = $('#contactID').val();
                let contactType = $('#contactType').val();
                let customerID = 0;
                let leadID = 0;
                let supplierID = 0;
                if (contactType == 'Customer') {
                    customerID = contactID
                } else if (contactType == 'Lead') {
                    leadID = contactID
                } else if (contactType == 'Supplier') {
                    supplierID = contactID
                }


                const objDetails = {
                    type: "Tprojecttasks",
                    fields: {
                        ID: taskID,
                        TaskName: editTaskDetailName,
                        TaskDescription: editTaskDetailDescription,
                        CustomerID: customerID,
                        LeadID: leadID,
                        SupplierID: supplierID,
                    },
                };
                $(".fullScreenSpin").css("display", "inline-block");
                crmService.saveNewTask(objDetails).then(function(data) {
                    $(".fullScreenSpin").css("display", "none");
                    $(".btnRefresh").addClass('btnSearchAlert');

                    setTimeout(() => {
                        templateObject.getAllTaskList();
                    }, 400);
                });
                selected_lbls.forEach((lbl) => {
                    crmService
                        .updateLabel({
                            type: "Tprojecttask_TaskLabel",
                            fields: {
                                ID: lbl,
                                TaskID: taskID,
                            },
                        })
                        .then(function(data) {});
                });
            }
        }, delayTimeAfterSound);
    },
    // submit save new task add task
    "click .btnSaveAddTask": function(e) {
        playSaveAudio();
        let templateObject = Template.instance();
        setTimeout(function() {
            let objDetails;
            let task_name = $("#add_task_name").val();
            let task_description = $("#add_task_description").val();
            let subTaskID = $("#txtCrmSubTaskID").val();

            let due_date = $(".crmEditDatepicker").val();
            due_date = due_date ? moment(due_date).format("YYYY-MM-DD hh:mm:ss") : moment().format("YYYY-MM-DD hh:mm:ss");
            let priority = 0;
            priority = $("#chkPriorityAdd1").prop("checked") ? 1 : $("#chkPriorityAdd2").prop("checked") ? 2 : $("#chkPriorityAdd3").prop("checked") ? 3 : 0;

            if (task_name === "") {
                swal("Task name is not entered!", "", "warning");
                return;
            }
            $(".fullScreenSpin").css("display", "inline-block");
            let projectID = $("#addProjectID").val() ? $("#addProjectID").val() : 11;
            projectID = $("#editProjectID").val() ? $("#editProjectID").val() : projectID;
            let selected_lbls = [];
            $("#addTaskLabelWrapper input:checked").each(function() {
                selected_lbls.push($(this).attr("name"));
            });
            let employeeID = Session.get("mySessionEmployeeLoggedID");
            let employeeName = Session.get("mySessionEmployee");

            let contactID = $('#contactID').val();
            let contactType = $('#contactType').val();
            let customerID = 0;
            let leadID = 0;
            let supplierID = 0;
            if (contactType == 'Customer') {
                customerID = contactID
            } else if (contactType == 'Lead') {
                leadID = contactID
            } else if (contactType == 'Supplier') {
                supplierID = contactID
            }
            if (subTaskID) {
                objDetails = {
                    type: "Tprojecttasks",
                    fields: {
                        ID: subTaskID,
                        subtasks: [{
                            type: "Tprojecttask_subtasks",
                            fields: {
                                TaskName: task_name,
                                TaskDescription: task_description,
                                Completed: false,
                                ProjectID: projectID,
                                due_date: due_date,
                                priority: priority,
                                EnteredByID: parseInt(employeeID),
                                EnteredBy: employeeName,
                                CustomerID: customerID,
                                LeadID: leadID,
                                SupplierID: supplierID,
                            },
                        }]
                    },
                };
            } else {
                objDetails = {
                    type: "Tprojecttasks",
                    fields: {
                        TaskName: task_name,
                        TaskDescription: task_description,
                        Completed: false,
                        ProjectID: projectID,
                        due_date: due_date,
                        priority: priority,
                        EnteredByID: parseInt(employeeID),
                        EnteredBy: employeeName,
                        CustomerID: customerID,
                        LeadID: leadID,
                        SupplierID: supplierID,
                    },
                };
            }

            crmService.saveNewTask(objDetails).then(function(res) {
                if (res.fields.ID) {
                    if (moment(due_date).format("YYYY-MM-DD") == moment().format("YYYY-MM-DD")) {}
                    $(".btnAddSubTask").css("display", "block");
                    $(".newTaskRow").css("display", "none");
                    $(".addTaskModal").css("display", "none");
                    $("#chkPriorityAdd0").prop("checked", false);
                    $("#chkPriorityAdd1").prop("checked", false);
                    $("#chkPriorityAdd2").prop("checked", false);
                    $("#chkPriorityAdd3").prop("checked", false);
                    //////////////////////////////
                    // setTimeout(() => {
                    //   templateObject.getAllTaskList();
                    //   templateObject.getTProjectList();
                    // }, 500);
                    $("#newTaskModal").modal("hide");
                    // $("#newProjectTasksModal").modal("hide");
                    if (subTaskID) {
                        crmService.getTaskDetail(subTaskID).then(function(data) {
                            $(".fullScreenSpin").css("display", "none");
                            if (data.fields.ID == subTaskID) {
                                let selected_record = data.fields;
                                if (selected_record.subtasks) {
                                    let newSubTaskID = 0;
                                    if (Array.isArray(selected_record.subtasks)) {
                                        templateObject.subTasks.set(selected_record.subtasks);
                                        templateObject.initSubtaskDatatable();
                                        newSubTaskID = selected_record.subtasks[selected_record.subtasks.length - 1].fields.ID;
                                    }
                                    if (typeof selected_record.subtasks == 'object') {
                                        let arr = [];
                                        arr.push(selected_record.subtasks);
                                        templateObject.subTasks.set(arr);
                                        templateObject.initSubtaskDatatable();
                                        newSubTaskID = selected_record.subtasks.fields.ID;
                                    }
                                    try {
                                        // add labels to New task
                                        // tempcode until api is updated
                                        // current label and task is 1:1 relationship
                                        selected_lbls.forEach((lbl) => {
                                            crmService.updateLabel({
                                                type: "Tprojecttask_TaskLabel",
                                                fields: {
                                                    ID: lbl,
                                                    TaskID: newSubTaskID,
                                                },
                                            }).then(function(data) {
                                                templateObject.getAllTaskList();
                                                templateObject.getTProjectList();
                                            });
                                        });
                                        // tempcode until api is updated
                                    } catch (error) {
                                        swal(error, "", "error");
                                        templateObject.getAllTaskList();
                                        templateObject.getTProjectList();
                                    }
                                } else {
                                    let sutTaskTable = $('#tblSubtaskDatatable').DataTable();
                                    sutTaskTable.clear().draw();
                                }
                            }
                        }).catch(function(err) {
                            $(".fullScreenSpin").css("display", "none");
                            swal(err, "", "error");
                        });
                    }
                }
                templateObject.getAllTaskList();
                templateObject.getTProjectList();
                $(".btnRefresh").addClass('btnSearchAlert');
                $(".fullScreenSpin").css("display", "none");
                $("#add_task_name").val("");
                $("#add_task_description").val("");
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
        }, delayTimeAfterSound);
    },
});

function sortArray(array, key, desc = true) {
    return array.sort(function(a, b) {
        let x = a[key];
        let y = b[key];
        if (key == 'dueDate') {
            x = new Date(x);
            y = new Date(y);
        }
        if (!desc)
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        else
            return ((x > y) ? -1 : ((x < y) ? 1 : 0));
    });
}

function openEditTaskModal(id, type = "") {
    FlowRouter.go('/crmoverview?');

    setTimeout(() => {
        $(".openEditTaskModal").find("[data-id='" + id + "']").trigger("click");

        $('#taskDetailModal').on('hidden.bs.modal', function(e) {
            history.back(1);
        });
    }, 2000);

    // let catg = e.target.dataset.catg;
    // let templateObject = Template.instance();
    // $("#editProjectID").val("");
    // $("#txtCrmSubTaskID").val(id);
    // $(".fullScreenSpin").css("display", "inline-block");
    // get selected task detail via api
    // crmService.getTaskDetail(id).then(function(data) {
    //     if (data.fields.ID == id) {
    //         let selected_record = data.fields;
    //         $("#txtCrmTaskID").val(selected_record.ID);
    //         $("#txtCrmProjectID").val(selected_record.ProjectID);
    //         $("#txtCommentsDescription").val("");
    //         $(".editTaskDetailName").val(selected_record.TaskName);
    //         $(".editTaskDetailDescription").val(selected_record.TaskDescription);

    //         let projectName = selected_record.ProjectName == "Default" ? "All Tasks" : selected_record.ProjectName;
    //         if (selected_record.Completed) {
    //             $('#lblComplete_taskEditLabel').removeClass('chk_complete');
    //             $('#lblComplete_taskEditLabel').addClass('chk_uncomplete');
    //             $('#chkComplete_taskEdit').removeClass('chk_complete');
    //             $('#chkComplete_taskEdit').addClass('chk_uncomplete');
    //             $('#chkComplete_taskEdit').prop("checked", true);
    //         } else {
    //             $('#lblComplete_taskEditLabel').removeClass('chk_uncomplete');
    //             $('#lblComplete_taskEditLabel').addClass('chk_complete');
    //             $('#chkComplete_taskEdit').removeClass('chk_uncomplete');
    //             $('#chkComplete_taskEdit').addClass('chk_complete');
    //             $('#chkComplete_taskEdit').prop("checked", false);
    //         }
    //         let all_projects = templateObject.all_projects.get();
    //         let projectColorStyle = '';
    //         if (selected_record.ProjectID != 0) {
    //             let projects = all_projects.filter(project => project.fields.ID == selected_record.ProjectID);
    //             if (projects.length && projects[0].fields.ProjectColour) {
    //                 projectColorStyle = 'color: ' + projects[0].fields.ProjectColour + ' !important';
    //             }
    //         }
    //         let catg = "";
    //         let today = moment().format("YYYY-MM-DD");
    //         if (selected_record.due_date) {
    //             if (selected_record.due_date.substring(0, 10) == today) {
    //                 catg =
    //                     `<i class="fas fa-calendar-day text-primary" style="margin-right: 5px; ${projectColorStyle}"></i>` +
    //                     "<span class='text-primary' style='" + projectColorStyle + "'>" +
    //                     projectName +
    //                     "</span>";
    //                 $(".taskDueDate").css("color", "#00a3d3");
    //             } else if (selected_record.due_date.substring(0, 10) > today) {
    //                 catg =
    //                     `<i class="fas fa-calendar-alt text-danger" style="margin-right: 5px; ${projectColorStyle}"></i>` +
    //                     "<span class='text-danger' style='" + projectColorStyle + "'>" +
    //                     projectName +
    //                     "</span>";
    //                 $(".taskDueDate").css("color", "#1cc88a");
    //             } else if (selected_record.due_date.substring(0, 10) < today) {
    //                 // catg =
    //                 //   `<i class="fas fa-inbox text-warning" style="margin-right: 5px;"></i>` +
    //                 //   "<span class='text-warning'>Overdue</span>";
    //                 // $(".taskDueDate").css("color", "#e74a3b");
    //                 catg =
    //                     `<i class="fas fa-inbox text-success" style="margin-right: 5px; ${projectColorStyle}"></i>` +
    //                     "<span class='text-success' style='" + projectColorStyle + "'>" +
    //                     projectName +
    //                     "</span>";
    //                 $(".taskDueDate").css("color", "#1cc88a");
    //             } else {
    //                 catg =
    //                     `<i class="fas fa-inbox text-success" style="margin-right: 5px; ${projectColorStyle}"></i>` +
    //                     "<span class='text-success' style='" + projectColorStyle + "'>" +
    //                     projectName +
    //                     "</span>";
    //                 $(".taskDueDate").css("color", "#1cc88a");
    //             }
    //         } else {
    //             catg =
    //                 `<i class="fas fa-inbox text-success" style="margin-right: 5px; ${projectColorStyle}"></i>` +
    //                 "<span class='text-success' style='" + projectColorStyle + "'>" +
    //                 projectName +
    //                 "</span>";
    //             $(".taskDueDate").css("color", "#1cc88a");
    //         }

    //         $(".taskLocation").html(
    //             `<a class="taganchor">
    //             ${catg}
    //           </a>`
    //         );
    //         if (projectName) {
    //             $('.taskDetailProjectName').show();
    //         } else {
    //             $('.taskDetailProjectName').hide();
    //         }
    //         $("#taskmodalNameLabel").html(selected_record.TaskName);
    //         $(".activityAdded").html("Added on " + moment(selected_record.MsTimeStamp).format("MMM D h:mm A"));
    //         let due_date = selected_record.due_date ? moment(selected_record.due_date).format("D MMM") : "No Date";
    //         let todayDate = moment().format("ddd");
    //         let tomorrowDay = moment().add(1, "day").format("ddd");
    //         let nextMonday = moment(moment()).day(1 + 7).format("ddd MMM D");
    //         let date_component = ` <div class="dropdown btnTaskTableAction">
    //     <div data-toggle="dropdown" title="Reschedule Task" style="cursor:pointer;">
    //       <i class="far fa-calendar-plus" style="margin-right: 5px;"></i>
    //       <span id="edit_task_modal_due_date">${due_date}</span>
    //     </div>
    //     <div class="dropdown-menu dropdown-menu-right reschedule-dropdown-menu  no-modal"
    //       aria-labelledby="dropdownMenuButton" style="width: 275px;">
    //       <a class="dropdown-item no-modal setScheduleToday" href="#" data-id="${selected_record.ID}">
    //         <i class="fas fa-calendar-day text-success no-modal"
    //           style="margin-right: 8px;"></i>Today
    //         <div class="float-right no-modal" style="width: 40%; text-align: end; color: #858796;">
    //           ${todayDate}</div>
    //       </a>
    //       <a class="dropdown-item no-modal setScheduleTomorrow" href="#"
    //         data-id="${selected_record.ID}">
    //         <i class="fas fa-sun text-warning no-modal" style="margin-right: 8px;"></i>Tomorrow
    //         <div class="float-right no-modal" style="width: 40%; text-align: end; color: #858796;">
    //           ${tomorrowDay}</div>
    //       </a>
    //       <a class="dropdown-item no-modal setScheduleWeekend" href="#"
    //         data-id="${selected_record.ID}">
    //         <i class="fas fa-couch text-primary no-modal" style="margin-right: 8px;"></i>This Weekend
    //         <div class="float-right no-modal" style="width: 40%; text-align: end; color: #858796;">
    //           Sat</div>
    //       </a>
    //       <a class="dropdown-item no-modal setScheduleNexweek" href="#"
    //         data-id="${selected_record.ID}">
    //         <i class="fas fa-calendar-alt text-danger no-modal" style="margin-right: 8px;"></i>Next Week
    //         <div class="float-right no-modal" style="width: 40%; text-align: end; color: #858796;">
    //           ${nextMonday}
    //         </div>
    //       </a>
    //       <a class="dropdown-item no-modal setScheduleNodate" href="#" data-id="${selected_record.ID}">
    //         <i class="fas fa-ban text-secondary no-modal" style="margin-right: 8px;"></i>
    //         No Date</a>
    //       <div class="dropdown-divider no-modal"></div>
    //       <div class="form-group no-modal" data-toggle="tooltip" data-placement="bottom"
    //         title="Date format: DD/MM/YYYY" style="margin: 6px 20px; margin-top: 14px;">
    //         <div class="input-group date no-modal" style="cursor: pointer;">
    //           <input type="text" id="${selected_record.ID}" class="form-control crmDatepicker no-modal"
    //             autocomplete="off">
    //           <div class="input-group-addon no-modal">
    //             <span class="glyphicon glyphicon-th no-modal" style="cursor: pointer;"></span>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </div>`;
    //         // $("#taskmodalDuedate").html(due_date);
    //         $("#taskmodalDuedate").html(date_component);
    //         $("#taskmodalDescription").html(selected_record.TaskDescription);

    //         $("#chkComplete_taskEditLabel").removeClass("task_priority_0");
    //         $("#chkComplete_taskEditLabel").removeClass("task_priority_1");
    //         $("#chkComplete_taskEditLabel").removeClass("task_priority_2");
    //         $("#chkComplete_taskEditLabel").removeClass("task_priority_3");
    //         $("#chkComplete_taskEditLabel").addClass("task_priority_" + selected_record.priority);

    //         let taskmodalLabels = "";
    //         $(".chkDetailLabel").prop("checked", false);
    //         if (selected_record.TaskLabel) {
    //             if (selected_record.TaskLabel.fields != undefined) {
    //                 taskmodalLabels =
    //                     `<span class="taskTag"><i class="fas fa-tag" style="color:${selected_record.TaskLabel.fields.Color};"></i><a class="taganchor filterByLabel" href="" data-id="${selected_record.TaskLabel.fields.ID}">` +
    //                     selected_record.TaskLabel.fields.TaskLabelName +
    //                     "</a></span>";
    //                 $("#detail_label_" + selected_record.TaskLabel.fields.ID).prop(
    //                     "checked",
    //                     true
    //                 );
    //             } else {
    //                 selected_record.TaskLabel.forEach((lbl) => {
    //                     taskmodalLabels +=
    //                         `<span class="taskTag"><i class="fas fa-tag" style="color:${lbl.fields.Color};"></i><a class="taganchor filterByLabel" href="" data-id="${lbl.fields.ID}">` +
    //                         lbl.fields.TaskLabelName +
    //                         "</a></span> ";
    //                     $("#detail_label_" + lbl.fields.ID).prop("checked", true);
    //                 });
    //                 taskmodalLabels = taskmodalLabels.slice(0, -2);
    //             }
    //         }
    //         // if (taskmodalLabels != "") {
    //         //   taskmodalLabels =
    //         //     '<span class="taskTag"><i class="fas fa-tag"></i>' +
    //         //     taskmodalLabels +
    //         //     "</span>";
    //         // }
    //         $("#taskmodalLabels").html(taskmodalLabels);
    //         let subtasks = "";
    //         if (selected_record.subtasks) {
    //             if (Array.isArray(selected_record.subtasks)) {
    //                 templateObject.subTasks.set(selected_record.subtasks)
    //                 templateObject.initSubtaskDatatable();
    //             }
    //             if (typeof selected_record.subtasks == 'object') {
    //                 let arr = [];
    //                 arr.push(selected_record.subtasks)
    //                 templateObject.subTasks.set(arr)
    //                 templateObject.initSubtaskDatatable();
    //             }
    //         } else {
    //             let sutTaskTable = $('#tblSubtaskDatatable').DataTable();
    //             sutTaskTable.clear().draw();
    //         }
    //         let comments = "";
    //         if (selected_record.comments) {
    //             if (selected_record.comments.fields != undefined) {
    //                 let comment = selected_record.comments.fields;
    //                 let comment_date = comment.CommentsDate ? moment(comment.CommentsDate).format("MMM D h:mm A") : "";
    //                 let commentUserArry = comment.EnteredBy.toUpperCase().split(" ");
    //                 let commentUser = commentUserArry.length > 1 ? commentUserArry[0].charAt(0) + commentUserArry[1].charAt(0) : commentUserArry[0].charAt(0);
    //                 comments = `
    //             <div class="col-12 taskComment" style="padding: 16px 32px;" id="taskComment_${comment.ID}">
    //               <div class="row commentRow">
    //                 <div class="col-1">
    //                   <div class="commentUser">${commentUser}</div>
    //                 </div>
    //                 <div class="col-11" style="padding-top:4px; padding-left: 24px;">
    //                   <div class="row">
    //                     <div>
    //                       <span class="commenterName">${comment.EnteredBy}</span>
    //                       <span class="commentDateTime">${comment_date}</span>
    //                     </div>
    //                   </div>
    //                   <div class="row">
    //                     <span class="commentText">${comment.CommentsDescription}</span>
    //                   </div>
    //                 </div>
    //               </div>
    //             </div>
    //             `;
    //             } else {
    //                 selected_record.comments.forEach((item) => {
    //                     let comment = item.fields;
    //                     let comment_date = comment.CommentsDate ? moment(comment.CommentsDate).format("MMM D h:mm A") : "";
    //                     let commentUserArry = comment.EnteredBy.toUpperCase().split(" ");
    //                     let commentUser = commentUserArry.length > 1 ? commentUserArry[0].charAt(0) + commentUserArry[1].charAt(0) : commentUserArry[0].charAt(0);
    //                     comments += `
    //               <div class="col-12 taskComment" style="padding: 16px 32px;" id="taskComment_${comment.ID}">
    //                 <div class="row commentRow">
    //                   <div class="col-1">
    //                     <div class="commentUser">${commentUser}</div>
    //                   </div>
    //                   <div class="col-11" style="padding-top:4px; padding-left: 24px;">
    //                     <div class="row">
    //                       <div>
    //                         <span class="commenterName">${comment.EnteredBy}</span>
    //                         <span class="commentDateTime">${comment_date}</span>
    //                       </div>
    //                     </div>
    //                     <div class="row">
    //                       <span class="commentText">${comment.CommentsDescription}</span>
    //                     </div>
    //                   </div>
    //                 </div>
    //               </div>
    //               `;
    //                 });
    //             }
    //         }
    //         $(".task-comment-row").html(comments);

    //         let activities = "";
    //         if (selected_record.activity) {
    //             if (selected_record.activity.fields != undefined) {
    //                 let activity = selected_record.activity.fields;
    //                 let day = "";
    //                 if (moment().format("YYYY-MM-DD") == moment(activity.ActivityDateStartd).format("YYYY-MM-DD")) {
    //                     day = " ‧ Today";
    //                 } else if (moment().add(-1, "day").format("YYYY-MM-DD") == moment(activity.ActivityDateStartd).format("YYYY-MM-DD")) {
    //                     day = " . Yesterday";
    //                 }
    //                 let activityDate = moment(activity.ActivityDateStartd).format("MMM D") + day + " . " + moment(activity.ActivityDateStartd).format("ddd");
    //                 let commentUserArry = activity.EnteredBy.toUpperCase().split(" ");
    //                 let commentUser = commentUserArry.length > 1 ? commentUserArry[0].charAt(0) + commentUserArry[1].charAt(0) : commentUserArry[0].charAt(0);

    //                 activities = `
    //             <div class="row" style="padding: 16px;">
    //               <div class="col-12">
    //                 <span class="activityDate">${activityDate}</span>
    //               </div>
    //               <hr style="width: 100%; margin: 8px 16px;" />
    //               <div class="col-1">
    //                 <div class="commentUser">${commentUser}</div>
    //               </div>
    //               <div class="col-11" style="padding-top: 4px; padding-left: 24px;">
    //                 <div class="row">
    //                   <span class="activityName">${activity.EnteredBy
    //                 } </span> <span class="activityAction">${activity.ActivityName
    //                 } </span>
    //                 </div>
    //                 <div class="row">
    //                   <span class="activityComment">${activity.ActivityDescription
    //                 }</span>
    //                 </div>
    //                 <div class="row">
    //                   <span class="activityTime">${moment(
    //                     activity.ActivityDateStartd
    //                 ).format("h:mm A")}</span>
    //                 </div>
    //               </div>
    //               <hr style="width: 100%; margin: 16px;" />
    //             </div>
    //             `;
    //             } else {
    //                 selected_record.activity.forEach((item) => {
    //                     let activity = item.fields;
    //                     let day = "";
    //                     if (moment().format("YYYY-MM-DD") == moment(activity.ActivityDateStartd).format("YYYY-MM-DD")) {
    //                         day = " ‧ Today";
    //                     } else if (moment().add(-1, "day").format("YYYY-MM-DD") == moment(activity.ActivityDateStartd).format("YYYY-MM-DD")) {
    //                         day = " . Yesterday";
    //                     }
    //                     let activityDate = moment(activity.ActivityDateStartd).format("MMM D") + day + " . " + moment(activity.ActivityDateStartd).format("ddd");
    //                     let commentUserArry = activity.EnteredBy.toUpperCase().split(" ");
    //                     let commentUser = commentUserArry.length > 1 ? commentUserArry[0].charAt(0) + commentUserArry[1].charAt(0) : commentUserArry[0].charAt(0);
    //                     activities = `
    //               <div class="row" style="padding: 16px;">
    //                 <div class="col-12">
    //                   <span class="activityDate">${activityDate}</span>
    //                 </div>
    //                 <hr style="width: 100%; margin: 8px 16px;" />
    //                 <div class="col-1">
    //                   <div class="commentUser">${commentUser}</div>
    //                 </div>
    //                 <div class="col-11" style="padding-top: 4px; padding-left: 24px;">
    //                   <div class="row">
    //                     <span class="activityName">${activity.EnteredBy
    //                     } </span> <span class="activityAction">${activity.ActivityName
    //                     } </span>
    //                   </div>
    //                   <div class="row">
    //                     <span class="activityComment">${activity.ActivityDescription
    //                     }</span>
    //                   </div>
    //                   <div class="row">
    //                     <span class="activityTime">${moment(
    //                         activity.ActivityDateStartd
    //                     ).format("h:mm A")}</span>
    //                   </div>
    //                 </div>
    //                 <hr style="width: 100%; margin: 16px;" />
    //               </div>
    //               `;
    //                 });
    //             }
    //         }
    //         $(".task-activity-row").html(activities);
    //         if (type == "comment") {
    //             $("#nav-comments-tab").click();
    //         } else {
    //             $("#nav-subtasks-tab").click();
    //         }
    //         $("#chkPriority0").prop("checked", false);
    //         $("#chkPriority1").prop("checked", false);
    //         $("#chkPriority2").prop("checked", false);
    //         $("#chkPriority3").prop("checked", false);
    //         $("#chkPriority" + selected_record.priority).prop("checked", true);

    //         $(".taskModalActionFlagDropdown").removeClass(
    //             "task_modal_priority_3"
    //         );
    //         $(".taskModalActionFlagDropdown").removeClass(
    //             "task_modal_priority_2"
    //         );
    //         $(".taskModalActionFlagDropdown").removeClass(
    //             "task_modal_priority_1"
    //         );
    //         $(".taskModalActionFlagDropdown").removeClass(
    //             "task_modal_priority_0"
    //         );
    //         $(".taskModalActionFlagDropdown").addClass(
    //             "task_modal_priority_" + selected_record.priority
    //         );
    //         $("#taskDetailModal").modal("toggle");

    //         $(".crmDatepicker").datepicker({
    //             showOn: "button",
    //             buttonText: "Show Date",
    //             buttonImageOnly: true,
    //             buttonImage: "/img/imgCal2.png",
    //             constrainInput: false,
    //             dateFormat: "yy/mm/dd",
    //             showOtherMonths: true,
    //             selectOtherMonths: true,
    //             changeMonth: true,
    //             changeYear: true,
    //             yearRange: "-90:+10",
    //             onSelect: function(dateText, inst) {
    //                 let task_id = inst.id;
    //                 templateObject.updateTaskSchedule(task_id, dateText);
    //             },
    //         });
    //         let currentDate = new Date();
    //         let begunDate = moment(currentDate).format("DD/MM/YYYY");
    //         $(".crmDatepicker").val(begunDate);


    //         let contactID = 0;
    //         let contactType = '';
    //         if (selected_record.CustomerID) {
    //             contactID = selected_record.CustomerID;
    //             contactType = 'Customer';
    //         } else if (selected_record.SupplierID) {
    //             contactID = selected_record.SupplierID;
    //             contactType = 'Supplier';
    //         } else if (selected_record.LeadID) {
    //             contactID = selected_record.LeadID;
    //             contactType = 'Lead';
    //         }
    //         getContactData(contactID, contactType);
    //         $(".fullScreenSpin").css("display", "none");

    //     } else {
    //         swal("Cannot edit this task", "", "warning");
    //         return;
    //     }
    // }).catch(function(err) {
    //     $(".fullScreenSpin").css("display", "none");
    //     swal(err, "", "error");
    // });
}

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
        $('#crmSelectLeadList').val('');
        $('#contactID').val('')
        $('#contactType').val('')
    }
    return;
}

function setContactDataToDetail(data, contactType) {
    $('#crmSelectLeadList').val(data.fields.ClientName);
    $('#contactID').val(data.fields.ID)
    $('#contactType').val(contactType)
}
