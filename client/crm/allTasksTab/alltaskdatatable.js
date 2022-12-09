import "../../lib/global/indexdbstorage.js";
import { CRMService } from "../crm-service";
import { SideBarService } from '../../js/sidebar-service';
import { ContactService } from "../../contacts/contact-service";
let crmService = new CRMService();
let sideBarService = new SideBarService();
let contactService = new ContactService();
let templateObject = Template.instance();
var clickCount = 0;

Template.alltaskdatatable.onCreated(function () {
  let templateObject = Template.instance();
  // templateObject.tprojectlist = new ReactiveVar([]);
  templateObject.allRecords = new ReactiveVar([]);
  templateObject.allWithCompletedRecords = new ReactiveVar([]);
  templateObject.todayRecords = new ReactiveVar([]);
  templateObject.upcomingRecords = new ReactiveVar([]);

  templateObject.allRecordsArray = new ReactiveVar([]);
  templateObject.todayRecordsArray = new ReactiveVar([]);
  templateObject.upcomingRecordsArray = new ReactiveVar([]);

  templateObject.overdueRecords = new ReactiveVar([]);
  templateObject.selected_id = new ReactiveVar(0);
  templateObject.task_id = new ReactiveVar(0);
  templateObject.project_id = new ReactiveVar(0);
  templateObject.selected_ttodo = new ReactiveVar("");
  templateObject.due_date = new ReactiveVar(null);

  templateObject.view_all_task_completed = new ReactiveVar("NO");
  templateObject.view_today_task_completed = new ReactiveVar("NO");
  templateObject.view_uncoming_task_completed = new ReactiveVar("NO");
  templateObject.view_project_completed = new ReactiveVar("NO");

  // projects tab
  templateObject.tprojectlist = new ReactiveVar([]);
  templateObject.all_projects = new ReactiveVar([]);
  templateObject.active_projects = new ReactiveVar([]);
  templateObject.deleted_projects = new ReactiveVar([]);
  templateObject.favorite_projects = new ReactiveVar([]);
  templateObject.projecttasks = new ReactiveVar([]);
  templateObject.active_projecttasks = new ReactiveVar([]);
  templateObject.view_projecttasks_completed = new ReactiveVar("NO");
  // projects tab

  templateObject.subTasks = new ReactiveVar([]);

  // labels tab
  templateObject.alllabels = new ReactiveVar([]);
  templateObject.allfilters = new ReactiveVar([]);
  // labels tab
  templateObject.allLeads = new ReactiveVar([]);

});

Template.alltaskdatatable.onRendered(function () {

  let templateObject = Template.instance();
  templateObject.selected_id.set(0);
  templateObject.selected_ttodo.set(null);

  templateObject.updateTaskSchedule = function (id, date) {
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
      crmService.saveNewTask(objDetails).then(function (data) {
        templateObject.getAllTaskList();
        $(".fullScreenSpin").css("display", "none");
        $(".btnRefresh").addClass('btnSearchAlert');
      });
    }
  };

  templateObject.initDatepicker = function () {
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
      onSelect: function (dateText, inst) {
        let task_id = inst.id;
        templateObject.updateTaskSchedule(task_id, new Date(inst.selectedYear, inst.selectedMonth, inst.selectedDay));
      },
      onChangeMonthYear: function (year, month, inst) {
        // Set date to picker
        $(this).datepicker('setDate', new Date(year, inst.selectedMonth, inst.selectedDay));
      }
    });
    let currentDate = new Date();
    let begunDate = moment(currentDate).format("DD/MM/YYYY");
    $(".crmDatepicker").val(begunDate);
  };

  templateObject.initSubtaskDatatable = function () {

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
          //     $(td).closest("tr").attr("data-id", rowData[9]);
          //     $(td).attr("data-id", rowData[9]);
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
            createdCell: function (td, cellData, rowData, row, col) {
                $(td).closest("tr").attr("data-id", rowData[9]);
                $(td).attr("data-id", rowData[9]);
            },
            width: "100px",
          },
          {
            orderable: false,
            targets: 1,
            className: "colContact openEditSubTaskModal hiddenColumn",
            createdCell: function (td, cellData, rowData, row, col) {
              $(td).attr("data-id", rowData[9]);
            },
            width: "100px",
          },
          {
            targets: 2,
            className: "colSubDate openEditSubTaskModal",
            createdCell: function (td, cellData, rowData, row, col) {
              $(td).attr("data-id", rowData[9]);
            },
            width: "120px",
          },
          {
            targets: 3,
            className: "colSubTaskName openEditSubTaskModal",
            createdCell: function (td, cellData, rowData, row, col) {
              $(td).attr("data-id", rowData[9]);
            },
          },
          {
            targets: 4,
            className: "colTaskDesc openEditSubTaskModal hiddenColumn",
            createdCell: function (td, cellData, rowData, row, col) {
              $(td).attr("data-id", rowData[9]);
            },
          },
          {
            targets: 5,
            className: "colTaskLabels openEditSubTaskModal hiddenColumn",
            createdCell: function (td, cellData, rowData, row, col) {
              $(td).attr("data-id", rowData[9]);
            },
          },
          {
            targets: 6,
            className: "colTaskProjects openEditSubTaskModal hiddenColumn",
            createdCell: function (td, cellData, rowData, row, col) {
              $(td).attr("data-id", rowData[9]);
            },
          },
          {
            orderable: false,
            targets: 7,
            className: "colStatus openEditSubTaskModal",
            createdCell: function (td, cellData, rowData, row, col) {
              $(td).attr("data-id", rowData[9]);
            },
          },
          // {
          //   orderable: false,
          //   targets: 8,
          //   className: "colTaskActions",
          //   createdCell: function (td, cellData, rowData, row, col) {
          //     $(td).attr("data-id", rowData[9]);
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
        action: function () {
          $("#tblSubtaskDatatable").DataTable().ajax.reload();
        },
      });

    } catch (error) {
    }
  }

  // initialize 3 tasks datatable
  templateObject.initAllTasksTable = function (search = null) {
    let splashArrayTaskList = templateObject.makeTaskTableRows(templateObject.allRecords.get());
    let view_all_task_completed = templateObject.view_all_task_completed.get();
    let btnFilterName = view_all_task_completed == "NO" ? "View Completed" : "Hide Completed";

    $("#tblAllTaskDatatable").DataTable({
      data: splashArrayTaskList,
      columnDefs: [
        // {
        //   orderable: false,
        //   targets: 0,
        //   className: "colCompleteTask",
        //   createdCell: function (td, cellData, rowData, row, col) {
        //     $(td).closest("tr").attr("data-id", rowData[9]);
        //     $(td).attr("data-id", rowData[9]);
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
          className: "colPriority openEditTaskModal",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).closest("tr").attr("data-id", rowData[9]);
            $(td).attr("data-id", rowData[9]);
            $(td).css('background-color', rowData[13]);
            // if (rowData[13] != 'transparent') {
            //   $(td).css('background-color', rowData[13]);
            //   $(td).css('background', `radial-gradient(circle, transparent 20%, ${rowData[13]} 20%, ${rowData[13]} 80%, transparent 80%, transparent), radial-gradient(circle, transparent 20%, ${rowData[13]} 20%, ${rowData[13]} 80%, transparent 80%, transparent) 8px 10px, linear-gradient(#8f93f7 0.8px, transparent 0.8px) 0 -0.4px, linear-gradient(116deg, #8f93f7 0.8px, ${rowData[13]} 0.8px) -0.4px 0`);
            //   $(td).css('background-size', '20px 20px, 20px 20px, 10px 10px, 10px 10px');
            // }
          },
          width: "100px",
        },
        {
          orderable: false,
          targets: 1,
          className: "colContact openEditTaskModal",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).attr("data-id", rowData[9]);
            $(td).css('background-color', rowData[13]);
            // if (rowData[13] != 'transparent') {
            //   $(td).css('background-color', rowData[13]);
            //   $(td).css('background', `radial-gradient(circle, transparent 20%, ${rowData[13]} 20%, ${rowData[13]} 80%, transparent 80%, transparent), radial-gradient(circle, transparent 20%, ${rowData[13]} 20%, ${rowData[13]} 80%, transparent 80%, transparent) 8px 10px, linear-gradient(#8f93f7 0.8px, transparent 0.8px) 0 -0.4px, linear-gradient(116deg, #8f93f7 0.8px, ${rowData[13]} 0.8px) -0.4px 0`);
            //   $(td).css('background-size', '20px 20px, 20px 20px, 10px 10px, 10px 10px');
            // }
          },
          width: "200px",
        },
        {
          targets: 2,
          className: "colDate openEditTaskModal",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).attr("data-id", rowData[9]);
            $(td).css('background-color', rowData[13]);
            // if (rowData[13] != 'transparent') {
            //   $(td).css('background-color', rowData[13]);
            //   $(td).css('background', `radial-gradient(circle, transparent 20%, ${rowData[13]} 20%, ${rowData[13]} 80%, transparent 80%, transparent), radial-gradient(circle, transparent 20%, ${rowData[13]} 20%, ${rowData[13]} 80%, transparent 80%, transparent) 8px 10px, linear-gradient(#8f93f7 0.8px, transparent 0.8px) 0 -0.4px, linear-gradient(116deg, #8f93f7 0.8px, ${rowData[13]} 0.8px) -0.4px 0`);
            //   $(td).css('background-size', '20px 20px, 20px 20px, 10px 10px, 10px 10px');
            // }
          },
          width: "120px",
        },
        {
          targets: 3,
          className: "colTaskName openEditTaskModal",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).attr("data-id", rowData[9]);
            $(td).css('background-color', rowData[13]);
            // if (rowData[13] != 'transparent') {
            //   $(td).css('background-color', rowData[13]);
            //   $(td).css('background', `radial-gradient(circle, transparent 20%, ${rowData[13]} 20%, ${rowData[13]} 80%, transparent 80%, transparent), radial-gradient(circle, transparent 20%, ${rowData[13]} 20%, ${rowData[13]} 80%, transparent 80%, transparent) 8px 10px, linear-gradient(#8f93f7 0.8px, transparent 0.8px) 0 -0.4px, linear-gradient(116deg, #8f93f7 0.8px, ${rowData[13]} 0.8px) -0.4px 0`);
            //   $(td).css('background-size', '20px 20px, 20px 20px, 10px 10px, 10px 10px');
            // }
          },
        },
        {
          targets: 4,
          className: "colTaskDesc openEditTaskModal",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).attr("data-id", rowData[9]);
            $(td).css('background-color', rowData[13]);
            // if (rowData[13] != 'transparent') {
            //   $(td).css('background-color', rowData[13]);
            //   $(td).css('background', `radial-gradient(circle, transparent 20%, ${rowData[13]} 20%, ${rowData[13]} 80%, transparent 80%, transparent), radial-gradient(circle, transparent 20%, ${rowData[13]} 20%, ${rowData[13]} 80%, transparent 80%, transparent) 8px 10px, linear-gradient(#8f93f7 0.8px, transparent 0.8px) 0 -0.4px, linear-gradient(116deg, #8f93f7 0.8px, ${rowData[13]} 0.8px) -0.4px 0`);
            //   $(td).css('background-size', '20px 20px, 20px 20px, 10px 10px, 10px 10px');
            // }
          },
        },
        {
          targets: 5,
          className: "colTaskLabels openEditTaskModal",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).attr("data-id", rowData[9]);
            $(td).css('background-color', rowData[13]);
            // if (rowData[13] != 'transparent') {
            //   $(td).css('background-color', rowData[13]);
            //   $(td).css('background', `radial-gradient(circle, transparent 20%, ${rowData[13]} 20%, ${rowData[13]} 80%, transparent 80%, transparent), radial-gradient(circle, transparent 20%, ${rowData[13]} 20%, ${rowData[13]} 80%, transparent 80%, transparent) 8px 10px, linear-gradient(#8f93f7 0.8px, transparent 0.8px) 0 -0.4px, linear-gradient(116deg, #8f93f7 0.8px, ${rowData[13]} 0.8px) -0.4px 0`);
            //   $(td).css('background-size', '20px 20px, 20px 20px, 10px 10px, 10px 10px');
            // }
          },
        },
        {
          targets: 6,
          className: "colTaskProjects openEditTaskModal",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).attr("data-id", rowData[9]);
            $(td).css('background', rowData[13]);
            // $(td).css('color', '#ffffff');
            // if (rowData[13] != 'transparent') {
            //   $(td).css('background-color', rowData[13]);
            //   $(td).css('background', `radial-gradient(circle, transparent 20%, ${rowData[13]} 20%, ${rowData[13]} 80%, transparent 80%, transparent), radial-gradient(circle, transparent 20%, ${rowData[13]} 20%, ${rowData[13]} 80%, transparent 80%, transparent) 8px 10px, linear-gradient(#8f93f7 0.8px, transparent 0.8px) 0 -0.4px, linear-gradient(116deg, #8f93f7 0.8px, ${rowData[13]} 0.8px) -0.4px 0`);
            //   $(td).css('background-size', '20px 20px, 20px 20px, 10px 10px, 10px 10px');
            // }
          },
        },
        {
          orderable: false,
          targets: 7,
          className: "colStatus openEditSubTaskModal",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).attr("data-id", rowData[9]);
          },
        },
        // {
          // orderable: false,
          // targets: 8,
          // className: "colTaskActions",
          // createdCell: function (td, cellData, rowData, row, col) {
          //   $(td).attr("data-id", rowData[9]);
          //   $(td).css('background-color', rowData[13]);
            // if (rowData[13] != 'transparent') {
            //   $(td).css('background-color', rowData[13]);
            //   $(td).css('background', `radial-gradient(circle, transparent 20%, ${rowData[13]} 20%, ${rowData[13]} 80%, transparent 80%, transparent), radial-gradient(circle, transparent 20%, ${rowData[13]} 20%, ${rowData[13]} 80%, transparent 80%, transparent) 8px 10px, linear-gradient(#8f93f7 0.8px, transparent 0.8px) 0 -0.4px, linear-gradient(116deg, #8f93f7 0.8px, ${rowData[13]} 0.8px) -0.4px 0`);
            //   $(td).css('background-size', '20px 20px, 20px 20px, 10px 10px, 10px 10px');
            // }
          // },
          // width: "150px",
        // },
      ],
      colReorder: {
        fixedColumnsLeft: 0,
      },
      sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
      buttons: [
        {
          extend: "excelHtml5",
          text: "",
          download: "open",
          className: "btntabletocsv hiddenColumn",
          filename: "All Tasks List" + moment().format(),
          title: "All Tasks",
          orientation: "portrait",
          exportOptions: {
            // columns: ":visible",
            columns: function (idx, data, node) {
              if (idx == 0 || idx == 1 || idx == 7) {
                return false;
              }
              return true;
            },
            format: {
              body: function (data, row, column) {
                let col_lbl = "";
                let lbl = "";
                if (data.includes("</span>")) {
                  var res = data.split("</span>");
                  res.forEach((element) => {
                    lbl = element.split("</i>");
                    if (lbl[1] != undefined) {
                      col_lbl += lbl[1].replace("</a>", "") + ", ";
                    }
                  });
                } else {
                  col_lbl = data;
                }

                if (Number.isInteger(col_lbl)) {
                  col_lbl = col_lbl.toString();
                }
                if (col_lbl.includes("</label>")) {
                  var res = col_lbl.split("</label>");
                  col_lbl = res[1];
                }
                // return col_lbl;
                return column === 4
                  ? col_lbl.replace(/<.*?>/gi, "").slice(0, -1)
                  : col_lbl;
              },
            },
            stripHtml: false,
          },
        },
        {
          extend: "print",
          download: "open",
          className: "btntabletopdf hiddenColumn",
          text: "",
          title: "All Tasks List",
          filename: "All Tasks List" + moment().format(),
          exportOptions: {
            // columns: ":visible",
            columns: function (idx, data, node) {
              if (idx == 0 || idx == 7) {
                return false;
              }
              return true;
            },
            stripHtml: false,
          },
        },
      ],
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
        [3, "desc"],
      ],
      action: function () {
        $("#tblAllTaskDatatable").DataTable().ajax.reload();
      },
      fnDrawCallback: function (oSettings) {
        setTimeout(function () {
          // MakeNegative();
        }, 100);
      },
      language: { search: "", searchPlaceholder: "Search List..." },
      fnInitComplete: function () {
        $(
          "<button class='btn btn-primary btnSearchCrm btnSearchAllTaskDatatable' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button><button class='btn btn-primary btnViewAllCompleted' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='far fa-check-circle' style='margin-right: 5px'></i><span id='lblViewAllCompleted'>" +
          btnFilterName +
          "</span></button>"
        ).insertAfter("#tblAllTaskDatatable_filter");
        //
      },
    });

    $("#tblAllTaskDatatable_filter input").val(search);

    // if project task modal is opened,
    // initialize projecttask table
    let id = $("#editProjectID").val();
    if (id) {
      crmService.getTProjectDetail(id).then(function (data) {
        $(".fullScreenSpin").css("display", "none");
        if (data.fields.ID == id) {
          let selected_record = data.fields;

          // set task list
          let active_projecttasks = [];
          let projecttasks = [];
          if (selected_record.projecttasks) {
            if (selected_record.projecttasks.fields == undefined) {
              projecttasks = selected_record.projecttasks;
            } else {
              projecttasks.push(selected_record.projecttasks);
            }

            active_projecttasks = projecttasks.filter(
              (item) =>
                item.fields.Active == true && item.fields.Completed == false
            );
          }
          templateObject.projecttasks.set(projecttasks);
          templateObject.active_projecttasks.set(active_projecttasks);

          templateObject.initProjectTasksTable();
        } else {
          return;
        }
      }).catch(function (err) {
        swal(err, "", "error");
        return;
      });
    }

    // setTimeout(() => {
    //   templateObject.initDatepicker();
    // }, 500);
  };

  templateObject.initTodayTasksTable = function (search = null) {
    let todayTaskArray = templateObject.makeTaskTableRows(templateObject.todayRecords.get());
    let view_today_task_completed = templateObject.view_today_task_completed.get();
    let btnFilterName = view_today_task_completed == "NO" ? "View Completed" : "Hide Completed";

    $("#tblTodayTaskDatatable").DataTable({
      data: todayTaskArray,
      columnDefs: [
        // {
        //   orderable: false,
        //   targets: 0,
        //   className: "colCompleteTask",
        //   createdCell: function (td, cellData, rowData, row, col) {
        //     $(td).closest("tr").attr("data-id", rowData[9]);
        //     $(td).attr("data-id", rowData[9]);
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
          className: "colPriority openEditTaskModal",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).closest("tr").attr("data-id", rowData[9]);
            $(td).attr("data-id", rowData[9]);
          },
          width: "100px",
        },
        {
          orderable: false,
          targets: 1,
          className: "colContact openEditTaskModal",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).attr("data-id", rowData[9]);
          },
          width: "100px",
        },
        {
          targets: 2,
          className: "colDate openEditTaskModal",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).attr("data-id", rowData[9]);
          },
          width: "120px",
        },
        {
          targets: 3,
          className: "colTaskName openEditTaskModal",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).attr("data-id", rowData[9]);
          },
        },
        {
          targets: 4,
          className: "colTaskDesc openEditTaskModal",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).attr("data-id", rowData[9]);
          },
        },
        {
          targets: 5,
          className: "colTaskLabels openEditTaskModal",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).attr("data-id", rowData[9]);
          },
        },
        {
          targets: 6,
          className: "colTaskProjects openEditTaskModal",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).attr("data-id", rowData[9]);
          },
        },
        {
          orderable: false,
          targets: 7,
          className: "colStatus openEditTaskModal",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).attr("data-id", rowData[9]);
          },
        },
        // {
        //   orderable: false,
        //   targets: 7,
        //   className: "colTaskActions",
        //   createdCell: function (td, cellData, rowData, row, col) {
        //     $(td).attr("data-id", rowData[9]);
        //   },
        //   width: "150px",
        // },
      ],
      colReorder: {
        fixedColumnsLeft: 0,
      },
      sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
      buttons: [
        {
          extend: "excelHtml5",
          text: "",
          download: "open",
          className: "btntabletocsv hiddenColumn",
          filename: "Today Tasks List" + moment().format(),
          title: "Today Tasks",
          orientation: "portrait",
          exportOptions: {
            // columns: ":visible",
            columns: function (idx, data, node) {
              if (idx == 0 || idx == 1 || idx == 7) {
                return false;
              }
              return true;
            },
            format: {
              body: function (data, row, column) {
                let col_lbl = "";
                let lbl = "";
                if (data.includes("</span>")) {
                  var res = data.split("</span>");
                  res.forEach((element) => {
                    lbl = element.split("</i>");
                    if (lbl[1] != undefined) {
                      col_lbl += lbl[1].replace("</a>", "") + ", ";
                    }
                  });
                } else {
                  col_lbl = data;
                }

                if (Number.isInteger(col_lbl)) {
                  col_lbl = col_lbl.toString();
                }
                if (col_lbl.includes("</label>")) {
                  var res = col_lbl.split("</label>");
                  col_lbl = res[1];
                }

                return column === 4
                  ? col_lbl.replace(/<.*?>/gi, "").slice(0, -1)
                  : col_lbl.slice(0, -1);
              },
            },
          },
        },
        {
          extend: "print",
          download: "open",
          className: "btntabletopdf hiddenColumn",
          text: "",
          title: "Today Tasks List",
          filename: "Today Tasks List" + moment().format(),
          exportOptions: {
            // columns: ":visible",
            columns: function (idx, data, node) {
              if (idx == 0 || idx == 7) {
                return false;
              }
              return true;
            },
            stripHtml: false,
          },
        },
      ],
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
        [2, "desc"],
      ],
      action: function () {
        $("#tblTodayTaskDatatable").DataTable().ajax.reload();
      },
      fnDrawCallback: function (oSettings) {
        setTimeout(function () {
          // MakeNegative();
        }, 100);
      },
      language: { search: "", searchPlaceholder: "Search List..." },
      fnInitComplete: function () {
        $(
          "<button class='btn btn-primary btnSearchCrm btnSearchTodayTaskDatatable' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button><button class='btn btn-primary btnViewTodayCompleted' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='far fa-check-circle' style='margin-right: 5px'></i><span id='lblViewTodayCompleted'>" +
          btnFilterName +
          "</span></button>"
        ).insertAfter("#tblTodayTaskDatatable_filter");
        //Open Detail Modal
        const id = FlowRouter.current().queryParams.id;
        openEditTaskModal(id,"")
      },
    });
    $("#tblTodayTaskDatatable_filter input").val(search);
  };

  templateObject.initUpcomingTasksTable = function (search = null) {
    let upcomingTaskArray = templateObject.makeTaskTableRows(templateObject.upcomingRecords.get());
    let view_uncoming_task_completed = templateObject.view_uncoming_task_completed.get();
    let btnFilterName = view_uncoming_task_completed == "NO" ? "View Completed" : "Hide Completed";

    $("#tblUpcomingTaskDatatable").DataTable({
      data: upcomingTaskArray,
      columnDefs: [
        // {
        //   orderable: false,
        //   targets: 0,
        //   className: "colCompleteTask",
        //   createdCell: function (td, cellData, rowData, row, col) {
        //     $(td).closest("tr").attr("data-id", rowData[9]);
        //     $(td).attr("data-id", rowData[9]);
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
          className: "colPriority openEditTaskModal",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).closest("tr").attr("data-id", rowData[9]);
            $(td).attr("data-id", rowData[9]);
          },
          width: "100px",
        },
        {
          orderable: false,
          targets: 1,
          className: "colContact openEditTaskModal",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).attr("data-id", rowData[9]);
          },
          width: "100px",
        },
        {
          targets: 2,
          className: "colDate openEditTaskModal",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).attr("data-id", rowData[9]);
          },
          width: "120px",
        },
        {
          targets: 3,
          className: "colTaskName openEditTaskModal",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).attr("data-id", rowData[9]);
          },
        },
        {
          targets: 4,
          className: "colTaskDesc openEditTaskModal",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).attr("data-id", rowData[9]);
          },
        },
        {
          targets: 5,
          className: "colTaskLabels openEditTaskModal",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).attr("data-id", rowData[9]);
          },
        },
        {
          targets: 6,
          className: "colTaskProjects openEditTaskModal",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).attr("data-id", rowData[9]);
          },
        },
        {
          orderable: false,
          targets: 7,
          className: "colStatus openEditTaskModal",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).attr("data-id", rowData[9]);
          },
        },
        // {
        //   orderable: false,
        //   targets: 7,
        //   className: "colTaskActions",
        //   createdCell: function (td, cellData, rowData, row, col) {
        //     $(td).attr("data-id", rowData[9]);
        //   },
        //   width: "150px",
        // },
      ],
      colReorder: {
        fixedColumnsLeft: 0,
      },
      sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
      buttons: [
        {
          extend: "excelHtml5",
          text: "",
          download: "open",
          className: "btntabletocsv hiddenColumn",
          filename: "Upcoming Tasks List" + moment().format(),
          title: "Upcoming Tasks",
          orientation: "portrait",
          exportOptions: {
            // columns: ":visible",
            columns: function (idx, data, node) {
              if (idx == 0 || idx == 1 || idx == 7) {
                return false;
              }
              return true;
            },
            format: {
              body: function (data, row, column) {
                let col_lbl = "";
                let lbl = "";
                if (data.includes("</span>")) {
                  var res = data.split("</span>");
                  res.forEach((element) => {
                    lbl = element.split("</i>");
                    if (lbl[1] != undefined) {
                      col_lbl += lbl[1].replace("</a>", "") + ", ";
                    }
                  });
                } else {
                  col_lbl = data;
                }
                if (Number.isInteger(col_lbl)) {
                  col_lbl = col_lbl.toString();
                }
                if (col_lbl.includes("</label>")) {
                  var res = col_lbl.split("</label>");
                  col_lbl = res[1];
                }

                // return column === 1 ? data.replace(/<.*?>/gi, "") : data;

                return column === 4
                  ? col_lbl.replace(/<.*?>/gi, "").slice(0, -1)
                  : col_lbl.slice(0, -1);
              },
            },
          },
        },
        {
          extend: "print",
          download: "open",
          className: "btntabletopdf hiddenColumn",
          text: "",
          title: "Upcoming Tasks List",
          filename: "Upcoming Tasks List" + moment().format(),
          exportOptions: {
            // columns: ":visible",
            columns: function (idx, data, node) {
              if (idx == 0 || idx == 7) {
                return false;
              }
              return true;
            },
            stripHtml: false,
          },
        },
      ],
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
        [2, "desc"],
      ],
      action: function () {
        $("#tblUpcomingTaskDatatable").DataTable().ajax.reload();
      },
      fnDrawCallback: function (oSettings) {
        setTimeout(function () {
          // MakeNegative();
        }, 100);
      },
      language: { search: "", searchPlaceholder: "Search List..." },
      fnInitComplete: function () {
        $(
          "<button class='btn btn-primary btnSearchCrm btnSearchUpcomingTaskDatatable' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button><button class='btn btn-primary btnViewUpcomingCompleted' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='far fa-check-circle' style='margin-right: 5px'></i><span id='lblViewUpcomingCompleted'>" +
          btnFilterName +
          "</span></button>"
        ).insertAfter("#tblUpcomingTaskDatatable_filter");
      },
    });
    $("#tblUpcomingTaskDatatable_filter input").val(search);
  };

  templateObject.getInitialAllTaskList = function () {
    $(".fullScreenSpin").css("display", "inline-block");
    getVS1Data("TCRMTaskList").then(function (dataObject) {
      if (dataObject.length == 0) {
        templateObject.getAllTaskList();
      } else {
        let data = JSON.parse(dataObject[0].data);
        let today = moment().format("YYYY-MM-DD");
        let all_records = data.tprojecttasks;

        var url = FlowRouter.current().path;
        url = new URL(window.location.href);
        let employeeID = url.searchParams.get("id") ? url.searchParams.get("id") : '';
        if (employeeID) {
          all_records = all_records.filter(item => item.fields.EnteredBy == employeeID);
        }
        templateObject.allWithCompletedRecords.set(all_records);

        all_records = all_records.filter((item) => item.fields.Completed == false);

        let today_records = all_records.filter((item) => item.fields.due_date.substring(0, 10) == today);
        let upcoming_records = all_records.filter((item) => item.fields.due_date.substring(0, 10) > today);
        let overdue_records = all_records.filter((item) => !item.fields.due_date || item.fields.due_date.substring(0, 10) < today);

        $(".crm_all_count").text(all_records.length);
        $(".crm_today_count").text(today_records.length);
        $(".crm_upcoming_count").text(upcoming_records.length);

        templateObject.allRecords.set(all_records);
        templateObject.todayRecords.set(today_records);
        templateObject.upcomingRecords.set(upcoming_records);
        templateObject.overdueRecords.set(overdue_records);

        setTimeout(() => {
          templateObject.initTodayTasksTable();
          templateObject.initUpcomingTasksTable();
          templateObject.initAllTasksTable();
        }, 1000);

        $(".fullScreenSpin").css("display", "none");
      }
    }).catch(function (err) {
      templateObject.getAllTaskList();
    });
  };

  templateObject.getAllTaskList = function () {
    var url = FlowRouter.current().path;
    url = new URL(window.location.href);
    let employeeID = url.searchParams.get("id") ? url.searchParams.get("id") : '';

    crmService.getAllTaskList(employeeID).then(function (data) {
      if (data.tprojecttasks && data.tprojecttasks.length > 0) {
        let today = moment().format("YYYY-MM-DD");
        let all_records = data.tprojecttasks;
        // all_records = all_records.filter(item => item.fields.ProjectID == 11);
        templateObject.allWithCompletedRecords.set(all_records);

        all_records = all_records.filter((item) => item.fields.Completed == false);

        let today_records = all_records.filter((item) => item.fields.due_date.substring(0, 10) == today);
        let upcoming_records = all_records.filter((item) => item.fields.due_date.substring(0, 10) > today);
        let overdue_records = all_records.filter((item) => !item.fields.due_date || item.fields.due_date.substring(0, 10) < today);

        $(".crm_all_count").text(all_records.length);
        $(".crm_today_count").text(today_records.length);
        $(".crm_upcoming_count").text(upcoming_records.length);

        templateObject.allRecords.set(all_records);
        templateObject.todayRecords.set(today_records);
        templateObject.upcomingRecords.set(upcoming_records);
        templateObject.overdueRecords.set(overdue_records);

        setTimeout(() => {
          templateObject.initTodayTasksTable();
          templateObject.initUpcomingTasksTable();
          templateObject.initAllTasksTable();
        }, 500);

        // addVS1Data("TCRMTaskList", JSON.stringify(data));
      } else {
        $(".crm_all_count").text(0);
        $(".crm_today_count").text(0);
        $(".crm_upcoming_count").text(0);
      }
      $(".fullScreenSpin").css("display", "none");
    }).catch(function (err) {
      $(".fullScreenSpin").css("display", "none");
    });
  };

  templateObject.getInitialAllTaskList();

  function getContactDetailById(contactID, contactType) {
    if (contactType == 'Customer') {
      getVS1Data("TCustomerVS1").then(function (dataObject) {
        if (dataObject.length === 0) {
          contactService.getOneCustomerDataEx(contactID).then(function (data) {
            return data;
          });
        } else {
          let data = JSON.parse(dataObject[0].data);
          let useData = data.tcustomervs1;
          for (let i = 0; i < useData.length; i++) {
            if (parseInt(useData[i].fields.ID) === parseInt(contactID)) {
              return useData[i];
            }
          }
        }
      }).catch(function (err) {
        contactService.getOneCustomerDataEx(contactID).then(function (data) {
          return data;
        });
      });
    } else if (contactType == 'Supplier') {
      getVS1Data("TSupplierVS1").then(function (dataObject) {
        if (dataObject.length === 0) {
          contactService.getOneSupplierDataEx(contactID).then(function (data) {
            return data;
          });
        } else {
          let data = JSON.parse(dataObject[0].data);
          let useData = data.tsuppliervs1;
          for (let i = 0; i < useData.length; i++) {
            if (parseInt(useData[i].fields.ID) === parseInt(contactID)) {
              return data;
            }
          }
        }
      }).catch(function (err) {
        contactService.getOneSupplierDataEx(contactID).then(function (data) {
          return data;
        });
      });
    } else if (contactType == 'Lead') {
      getVS1Data("TProspectEx").then(function (dataObject) {
        if (dataObject.length === 0) {
          contactService.getOneLeadDataEx(contactID).then(function (data) {
            return data;
          });

        } else {
          let data = JSON.parse(dataObject[0].data);
          let useData = data.tprospectvs1;
          for (let i = 0; i < useData.length; i++) {
            if (parseInt(useData[i].fields.ID) === parseInt(contactID)) {
              return data;
            }
          }
        }
      }).catch(function (err) {
        contactService.getOneLeadDataEx(contactID).then(function (data) {
          return data;
        });
      });
    } else {
    }
    return null;
  }

  templateObject.makeTaskTableRows = function (task_array) {
    let taskRows = new Array();
    let td0, td1, tflag, td11, td2, td3, td4, td5, td6 = "", tcontact = "";
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
          color_num = 3;  // Red
        } else if (tdue_date > moment().format("YYYY-MM-DD") && tdue_date <= moment().add(2, "day").format("YYYY-MM-DD")) {
          color_num = 2;  // Orange
        } else if (tdue_date > moment().add(2, "day").format("YYYY-MM-DD") && tdue_date <= moment().add(7, "day").format("YYYY-MM-DD")) {
          color_num = 0;  // Green
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

  // labels tab --------------
  templateObject.getInitAllLabels = function () {
    getVS1Data("TCRMLabelList").then(function (dataObject) {
      if (dataObject.length == 0) {
        templateObject.getAllLabels();
      } else {
        let data = JSON.parse(dataObject[0].data);
        if (
          data.tprojecttask_tasklabel &&
          data.tprojecttask_tasklabel.length > 0
        ) {
          let alllabels = data.tprojecttask_tasklabel;
          templateObject.alllabels.set(alllabels);

          let label_dropdowns = "";
          let detail_label_dropdowns = "";
          let labelName = "";
          alllabels.forEach((lbl) => {
            labelName =
              lbl.fields.TaskLabelName.length < 20
                ? lbl.fields.TaskLabelName
                : lbl.fields.TaskLabelName.substring(0, 19) + "...";

            label_dropdowns += `<a class="dropdown-item add_label" data-id="${lbl.fields.ID}">
              <i class="fas fa-tag" style="margin-right: 8px; color:${lbl.fields.Color};" data-id="${lbl.fields.ID}"></i>${labelName}
                <div style="width: 20%; float: right;" data-id="${lbl.fields.ID}">
                  <div class="custom-control custom-checkbox chkBox pointer"
                    style="width: 15px; float: right;" data-id="${lbl.fields.ID}">
                    <input class="custom-control-input chkBox chkAddLabel pointer" type="checkbox"
                      id="add_label_${lbl.fields.ID}" name="${lbl.fields.ID}" value="" data-id="${lbl.fields.ID}">
                    <label class="custom-control-label chkBox pointer" for="add_label_${lbl.fields.ID}" data-id="${lbl.fields.ID}"></label>
                  </div>
                </div>
              </a>`;
            detail_label_dropdowns += `<a class="dropdown-item detail_label" data-id="${lbl.fields.ID}">
              <i class="fas fa-tag" style="margin-right: 8px; color:${lbl.fields.Color};" data-id="${lbl.fields.ID}"></i>${labelName}
                <div style="width: 20%; float: right;" data-id="${lbl.fields.ID}">
                  <div class="custom-control custom-checkbox chkBox pointer"
                    style="width: 15px; float: right;" data-id="${lbl.fields.ID}">
                    <input class="custom-control-input chkBox chkDetailLabel pointer" type="checkbox"
                      id="detail_label_${lbl.fields.ID}" name="${lbl.fields.ID}" value="" data-id="${lbl.fields.ID}">
                    <label class="custom-control-label chkBox pointer" for="detail_label_${lbl.fields.ID}" data-id="${lbl.fields.ID}"></label>
                  </div>
                </div>
              </a>`;
          });
          $("#addTaskLabelWrapper").html(label_dropdowns);
          $(".detailTaskLabelWrapper").html(detail_label_dropdowns);
          templateObject.initLabelsTable();
        } else {
          templateObject.initLabelsTable();
          templateObject.alllabels.set([]);
        }
      }
    }).catch(function (err) {
      templateObject.getAllLabels();
    });
  };

  templateObject.getAllLabels = function () {
    var url = FlowRouter.current().path;
    url = new URL(window.location.href);
    let employeeID = url.searchParams.get("id") ? url.searchParams.get("id") : '';

    crmService.getAllLabels(employeeID).then(function (data) {
      if (
        data.tprojecttask_tasklabel &&
        data.tprojecttask_tasklabel.length > 0
      ) {
        let alllabels = data.tprojecttask_tasklabel;
        templateObject.alllabels.set(alllabels);

        let label_dropdowns = "";
        let detail_label_dropdowns = "";
        let labelName = "";
        alllabels.forEach((lbl) => {
          labelName =
            lbl.fields.TaskLabelName.length < 20
              ? lbl.fields.TaskLabelName
              : lbl.fields.TaskLabelName.substring(0, 19) + "...";

          label_dropdowns += `<a class="dropdown-item add_label" data-id="${lbl.fields.ID}">
            <i class="fas fa-tag" style="margin-right: 8px; color:${lbl.fields.Color};" data-id="${lbl.fields.ID}"></i>${labelName}
              <div style="width: 20%; float: right;" data-id="${lbl.fields.ID}">
                <div class="custom-control custom-checkbox chkBox pointer"
                  style="width: 15px; float: right;" data-id="${lbl.fields.ID}">
                  <input class="custom-control-input chkBox chkAddLabel pointer" type="checkbox"
                    id="add_label_${lbl.fields.ID}" name="${lbl.fields.ID}" value="" data-id="${lbl.fields.ID}">
                  <label class="custom-control-label chkBox pointer" for="add_label_${lbl.fields.ID}" data-id="${lbl.fields.ID}"></label>
                </div>
              </div>
            </a>`;
          detail_label_dropdowns += `<a class="dropdown-item detail_label" data-id="${lbl.fields.ID}">
            <i class="fas fa-tag" style="margin-right: 8px; color:${lbl.fields.Color};" data-id="${lbl.fields.ID}"></i>${labelName}
              <div style="width: 20%; float: right;" data-id="${lbl.fields.ID}">
                <div class="custom-control custom-checkbox chkBox pointer"
                  style="width: 15px; float: right;" data-id="${lbl.fields.ID}">
                  <input class="custom-control-input chkBox chkDetailLabel pointer" type="checkbox"
                    id="detail_label_${lbl.fields.ID}" name="${lbl.fields.ID}" value="" data-id="${lbl.fields.ID}">
                  <label class="custom-control-label chkBox pointer" for="detail_label_${lbl.fields.ID}" data-id="${lbl.fields.ID}"></label>
                </div>
              </div>
            </a>`;
        });
        $("#addTaskLabelWrapper").html(label_dropdowns);
        $(".detailTaskLabelWrapper").html(detail_label_dropdowns);
        templateObject.initLabelsTable();
      } else {
        templateObject.initLabelsTable();
        templateObject.alllabels.set([]);
      }
      addVS1Data("TCRMLabelList", JSON.stringify(data));
    }).catch(function (err) { });
  };

  templateObject.initLabelsTable = function (search = null) {
    let labelArray = templateObject.makeLabelTableRows(
      templateObject.alllabels.get()
    );

    $("#tblLabels").DataTable({
      data: labelArray,
      columnDefs: [
        {
          targets: 0,
          className: "colLabelCreatedDate",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).closest("tr").attr("data-id", rowData[3]);
            $(td).attr("data-id", rowData[3]);
          },
        },
        {
          targets: 1,
          className: "colLabel",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).attr("data-id", rowData[3]);
          },
          width: "100%",
        },
        // {
        //   orderable: false,
        //   targets: 2,
        //   className: "colLabelActions",
        //   createdCell: function (td, cellData, rowData, row, col) {
        //     $(td).attr("data-id", rowData[3]);
        //   },
        //   width: "50px",
        // },
      ],
      sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
      buttons: [
        {
          extend: "excelHtml5",
          text: "",
          download: "open",
          className: "btntabletocsv hiddenColumn",
          filename: "Label List" + moment().format(),
          title: "Labels",
          orientation: "portrait",
          exportOptions: {
            // columns: ":visible",
            columns: function (idx, data, node) {
              if (idx == 2) {
                return false;
              }
              return true;
            },
          },
        },
        {
          extend: "print",
          download: "open",
          className: "btntabletopdf hiddenColumn",
          text: "",
          title: "Label List",
          filename: "Label List" + moment().format(),
          exportOptions: {
            // columns: ":visible",
            columns: function (idx, data, node) {
              if (idx == 2) {
                return false;
              }
              return true;
            },
            stripHtml: false,
          },
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
      order: [[1, "desc"]],
      action: function () {
        $("#tblLabels").DataTable().ajax.reload();
      },
      language: { search: "", searchPlaceholder: "Search List..." },
      fnInitComplete: function () {
        $(
          "<button class='btn btn-primary btnNewLabel' type='button' id='btnNewLabel' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus' style='margin-right: 5px'></i>New Label</button>"
        ).insertAfter("#tblLabels_filter");
        $(
          "<button class='btn btn-primary btnSearchCrm btnSearchLabelsDatatable' type='button' id='btnRefreshLabels' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>"
        ).insertAfter("#tblLabels_filter");
      },
    });
    $("#tblLabels_filter input").val(search);
  };

  templateObject.getInitAllLabels();

  templateObject.makeLabelTableRows = function (task_array) {
    let taskRows = new Array();
    let td0, td1, td2 = "";

    task_array.forEach((item) => {
      td0 = moment(item.fields.MsTimeStamp).format("DD/MM/YYYY");
      td1 = `<span class="taskTag"><a class="taganchor"><i class="fas fa-tag" style="margin-right: 5px; color:${item.fields.Color};"></i>${item.fields.TaskLabelName}</a></span>`;

      td2 = `
          <div class="dropdown btnLabelActions" title="Delete Label">
            <button type="button" class="btn btn-danger btnDeleteLabel" data-id="${item.fields.ID}"><i
                class="far fa-trash-alt" style="width: 16px;" data-id="${item.fields.ID}"></i>
            </button>
        </div>`;
      taskRows.push([td0, td1, td2, item.fields.ID]);
    });
    return taskRows;
  };
  // labels tab ----------------- //

  // projects tab -------------------
  templateObject.getInitTProjectList = function () {
    getVS1Data("TCRMProjectList").then(function (dataObject) {
      if (dataObject.length == 0) {
        templateObject.getTProjectList();
      } else {
        let data = JSON.parse(dataObject[0].data);
        if (data.tprojectlist && data.tprojectlist.length > 0) {
          let tprojectlist = data.tprojectlist;
          let all_projects = data.tprojectlist;

          var url = new URL(window.location.href);
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
    }).catch(function (err) {
      templateObject.getTProjectList();
    });
  };

  templateObject.getTProjectList = function () {
    var url = FlowRouter.current().path;
    url = new URL(window.location.href);
    let employeeID = url.searchParams.get("id") ? url.searchParams.get("id") : '';

    crmService.getTProjectList(employeeID).then(function (data) {
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
    }).catch(function (err) { });
  };

  templateObject.initProjectsTable = function (search = null) {
    let projectArray = templateObject.makeProjectTableRows(
      templateObject.active_projects.get()
    );
    let view_project_completed = templateObject.view_project_completed.get();
    let btnFilterName = view_project_completed == "NO" ? "View All" : "Hide Deleted";

    $("#tblNewProjectsDatatable").DataTable({
      data: projectArray,
      columnDefs: [
        {
          targets: 0,
          className: "colPrjectDate",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).closest("tr").attr("data-id", rowData[5]);
            $(td).attr("data-id", rowData[5]);
          },
        },
        {
          targets: 1,
          className: "colProjectName",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).attr("data-id", rowData[5]);
          },
        },
        {
          targets: 2,
          className: "colProjectDesc",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).attr("data-id", rowData[5]);
          },
        },
        {
          targets: 3,
          className: "colProjectStatus",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).attr("data-id", rowData[5]);
            if (!rowData[6]) {
              $(td).addClass("task_priority_3");
              $(td).css("color", "white");
            }
          },
        },
        {
          targets: 4,
          className: "colProjectTasks",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).attr("data-id", rowData[5]);
          },
        },
      ],
      sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
      buttons: [
        {
          extend: "excelHtml5",
          text: "",
          download: "open",
          className: "btntabletocsv hiddenColumn",
          filename: "Project List" + moment().format(),
          title: "Projects",
          orientation: "portrait",
          exportOptions: {
            columns: ":visible",
            format: {
              body: function (data, row, column) {
                if (Number.isInteger(data)) {
                  data = data.toString();
                }
                if (data.includes("</span>")) {
                  var res = data.split("</span>");
                  data = res[1];
                }

                return column === 1 ? data.replace(/<.*?>/gi, "") : data;
              },
            },
          },
        },
        {
          extend: "print",
          download: "open",
          className: "btntabletopdf hiddenColumn",
          text: "",
          title: "Project List",
          filename: "Project List" + moment().format(),
          exportOptions: {
            columns: ":visible",
            stripHtml: false,
          },
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
      order: [[0, "desc"]],
      action: function () {
        $("#tblProjectsDatatable").DataTable().ajax.reload();
      },
      language: { search: "", searchPlaceholder: "Search List..." },
      fnInitComplete: function () {
        $(
          "<button class='btn btn-primary btnSearchCrm btnSearchProjectsDatatable' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button><button class='btn btn-primary btnViewProjectCompleted' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='far fa-check-circle' style='margin-right: 5px'></i><span id='lblViewProjectCompleted'>" +
          btnFilterName +
          "</span></button>"
        ).insertAfter("#tblNewProjectsDatatable_filter");
      },
    });
    $("#tblNewProjectsDatatable_filter input").val(search);
  };

  templateObject.getInitTProjectList();

  templateObject.makeProjectTableRows = function (task_array) {
    let taskRows = new Array();
    let td0, td1, td2, td3, td4 = "";
    let projectStatus = "";
    let taskCount = "";

    task_array.forEach((item) => {
      if (item.fields.Active) {
        projectStatus = "";
      } else {
        projectStatus = "In-Active";
      }
      if (item.fields.projecttasks == null) {
        taskCount = "";
      } else if (Array.isArray(item.fields.projecttasks) == true) {
        taskCount = item.fields.projecttasks.filter(
          (tk) => tk.fields.Active == true && tk.fields.Completed == false
        ).length;
      } else {
        taskCount = item.fields.projecttasks.fields.Active == true ? 1 : 0;
      }

      td0 = `<span style="display: none;">${item.fields.MsTimeStamp}</span>` + moment(item.fields.MsTimeStamp).format("DD/MM/YYYY");
      td1 = item.fields.ProjectName;
      td2 = item.fields.Description;
      td3 = projectStatus;
      td4 = taskCount;
      taskRows.push([
        td0,
        td1,
        td2,
        td3,
        td4,
        item.fields.ID,
        item.fields.Active,
      ]);
    });
    return taskRows;
  };

  templateObject.initProjectTasksTable = function () {
    let splashArrayTaskList = templateObject.makeTaskTableRows(templateObject.active_projecttasks.get());
    let view_projecttasks_completed = templateObject.view_projecttasks_completed.get();
    let btnFilterName = view_projecttasks_completed == "NO" ? "Show Completed Tasks" : "Hide Completed Tasks";

    $(".lblShowCompletedTaskOnProject").html(btnFilterName);

    $("#tblProjectTasks").DataTable({
      data: splashArrayTaskList,
      columnDefs: [
        {
          orderable: false,
          targets: 0,
          className: "colCompleteTask",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).closest("tr").attr("data-id", rowData[9]);
            $(td).attr("data-id", rowData[9]);
            $(td).addClass("task_priority_" + rowData[10]);
            if (rowData[12]) {
              $(td).addClass("taskCompleted");
            }
          },
          width: "18px",
        },
        {
          orderable: false,
          targets: 1,
          className: "colPriority openEditTaskModal hiddenColumn",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).attr("data-id", rowData[9]);
          },
          width: "100px",
        },
        {
          orderable: false,
          targets: 2,
          className: "colContact openEditTaskModal hiddenColumn",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).attr("data-id", rowData[9]);
          },
          width: "200px",
        },
        {
          targets: 3,
          className: "colTaskDate openEditTaskModal hiddenColumn",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).attr("data-id", rowData[9]);
          },
          width: "120px",
        },
        {
          targets: 4,
          className: "colTaskName openEditTaskModal",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).attr("data-id", rowData[9]);
          },
        },
        {
          targets: 5,
          className: "colProjectTaskDesc openEditTaskModal",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).attr("data-id", rowData[9]);
          },
        },
        {
          targets: 6,
          className: "colProjectTaskLabels openEditTaskModal",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).attr("data-id", rowData[9]);
          },
        },
        {
          targets: 7,
          className: "colTaskProjects openEditTaskModal hiddenColumn",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).attr("data-id", rowData[9]);
          },
        },
        {
          orderable: false,
          targets: 8,
          className: "colTaskActions hiddenColumn",
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).attr("data-id", rowData[9]);
          },
          width: "150px",
        },
      ],
      colReorder: {
        fixedColumnsLeft: 0,
      },
      sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
      buttons: [
        {
          extend: "excelHtml5",
          text: "",
          download: "open",
          className: "btntabletocsv hiddenColumn",
          filename: "Project Tasks List" + moment().format(),
          title: "Project Tasks",
          orientation: "portrait",
          exportOptions: {
            // columns: ":visible",
            columns: function (idx, data, node) {
              if (idx == 0 || idx == 1 || idx == 8) {
                return false;
              }
              return true;
            },
          },
        },
        {
          extend: "print",
          download: "open",
          className: "btntabletopdf hiddenColumn",
          text: "",
          title: "Project Tasks List",
          filename: "Project Tasks List" + moment().format(),
          exportOptions: {
            // columns: ":visible",
            columns: function (idx, data, node) {
              if (idx == 0 || idx == 8) {
                return false;
              }
              return true;
            },
            stripHtml: false,
          },
        },
      ],
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
        [3, "desc"],
      ],
      action: function () {
        $("#tblProjectTasks").DataTable().ajax.reload();
      },
      language: { search: "", searchPlaceholder: "Search List..." },
      fnInitComplete: function () {
        $(
          "<button class='btn btn-primary btnSearchCrm btnSearchProjectTasksDatatable' type='button' id='btnRefreshProjectTasks' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>"
        ).insertAfter("#tblProjectTasks_filter");
      },
    });
  };
  // projects tab ------------------- //

  // templateObject.getLeads = function () {
  //   // use API TProspectEx instead of TLeads
  //   getVS1Data('TProspectEx').then(function (dataObject) {
  //     if (dataObject.length === 0) {
  //       sideBarService.getAllLeads(initialBaseDataLoad, 0).then(function (data) {
  //         addVS1Data('TProspectEx', JSON.stringify(data));
  //         // setAllLeads(data);
  //         templateObject.allLeads.set(data);
  //         initLeadOptions(data)
  //       }).catch(function (err) {
  //         $('.fullScreenSpin').css('display', 'none');
  //       });
  //     } else {
  //       let data = JSON.parse(dataObject[0].data);
  //       // setAllLeads(data);
  //       templateObject.allLeads.set(data);
  //       initLeadOptions(data)
  //     }
  //   }).catch(function (err) {
  //     sideBarService.getAllLeads(initialBaseDataLoad, 0).then(function (data) {
  //       addVS1Data('TProspectEx', JSON.stringify(data));
  //       // setAllLeads(data);
  //       templateObject.allLeads.set(data);
  //       initLeadOptions(data)
  //     }).catch(function (err) {
  //       $('.fullScreenSpin').css('display', 'none');
  //     });
  //   });
  // };
  // templateObject.getLeads();

  // function initLeadOptions(data) {
  //   let leadId = FlowRouter.current().queryParams.leadid;
  //   let options = '<option></option>';
  //   let selected = '';
  //   let tprospect = data.tprospect ? data.tprospect : [];
  //   tprospect.forEach(lead => {
  //     selected = leadId === lead.fields.ID ? 'selected' : '';
  //     options += `<option value="${lead.fields.ID}" ${selected}>${lead.fields.ClientName}</option>`;
  //   });

  //   // $('.crmSelectLeadList').html(options)
  // }

  setTimeout(() => {
    $(".crmEditDatepicker").datepicker({
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
      onSelect: function (dateText, inst) {
        $(".lblAddTaskSchedule").html(moment(new Date(inst.selectedYear, inst.selectedMonth, inst.selectedDay)).format("DD/MM/YYYY"));
      },
      onChangeMonthYear: function (year, month, inst) {
        // Set date to picker
        $(this).datepicker('setDate', new Date(year, inst.selectedMonth, inst.selectedDay));
      }
    });
  }, 1000);
  $(".crmEditDatepicker").val(moment().format("DD/MM/YYYY"));

  tableResize();
});

Template.alltaskdatatable.events({

  "click .btnAddSubTask": function (event) {
    $("#newTaskModal").modal("toggle");
  },

  "click .btnCancelAddTask": function (event) {
    playCancelAudio();
    setTimeout(function () {
      $(".btnAddSubTask").css("display", "block");
      $(".newTaskRow").css("display", "none");
      $(".addTaskModal").css("display", "none");
    }, delayTimeAfterSound);
  },

  // open task detail modal
  "click .openEditTaskModal": function (e) {

    if (!e.target.classList.contains("no-modal")) {

      let id = e.target.dataset.id;
      let type = e.target.dataset.ttype;
      openEditTaskModal(id, type);
    }
  },
  // open sub task detail modal
  "click .openEditSubTaskModal": function (e) {

    if (!e.target.classList.contains("no-modal")) {

      let id = e.target.dataset.id;
      let type = e.target.dataset.ttype;

      $("#taskDetailModal").modal("hide");

      openEditTaskModal(id, type);
    }
  },


  // show edit name & description fields
  "click .rename-task": function (e) {
    $(".displayTaskNameDescription").css("display", "none");
    $(".editTaskNameDescription").css("display", "inline-block");

    $(".editTaskDetailName").val($("#taskmodalNameLabel").html());
    $(".editTaskDetailDescription").val($("#taskmodalDescription").html());
  },

  // complete task
  "click .chk_complete": function (e) {
    let id = e.target.dataset.id;
    if (id == "edit") id = $("#txtCrmTaskID").val();

    // handle complete process via api
    var objDetails = {
      type: "Tprojecttasks",
      fields: {
        ID: id,
        Completed: true,
      },
    };

    if (id) {
      $(".fullScreenSpin").css("display", "inline-block");
      let templateObject = Template.instance();
      crmService.saveNewTask(objDetails).then(function (objDetails) {
        $(".chkComplete").prop("checked", false);
        // recalculate count here
        templateObject.getAllTaskList();
        templateObject.getTProjectList();

        $(".fullScreenSpin").css("display", "none");
        $(".btnRefresh").addClass('btnSearchAlert');

        $('#taskDetailModal').modal('toggle');

      });
    }
  },

  // complete task
  "click .chk_uncomplete": function (e) {
    let id = e.target.dataset.id;
    if (id == "edit") id = $("#txtCrmTaskID").val();

    // handle complete process via api
    var objDetails = {
      type: "Tprojecttasks",
      fields: {
        ID: id,
        Completed: false,
      },
    };

    if (id) {
      $(".fullScreenSpin").css("display", "inline-block");
      let templateObject = Template.instance();
      crmService.saveNewTask(objDetails).then(function (objDetails) {
        templateObject.getAllTaskList();
        templateObject.getTProjectList();
        templateObject.view_all_task_completed.set("NO");

        $(".fullScreenSpin").css("display", "none");
        $(".btnRefresh").addClass('btnSearchAlert');
      });
    }
  },

  // delete task
  "click .delete-task": function (e) {
    let id = e.target.dataset.id;
    if (id == "edit") id = $("#txtCrmTaskID").val();
    var objDetails = {
      type: "Tprojecttasks",
      fields: {
        ID: id,
        Active: false,
      },
    };

    let templateObject = Template.instance();
    if (id) {
      swal({
        title: "Delete Task",
        text: "Are you sure want to delete this task?",
        type: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
      }).then((result) => {
        if (result.value) {
          $(".fullScreenSpin").css("display", "inline-block");
          crmService.saveNewTask(objDetails).then(function (objDetails) {
            // recalculate count here
            templateObject.getAllTaskList();
            templateObject.getTProjectList();
            $(".fullScreenSpin").css("display", "none");
            $("#taskDetailModal").modal("hide");
            // $("#newProjectTasksModal").modal("hide");
          });
        } else if (result.dismiss === "cancel") {
        } else {
        }
      });
    }
  },

  // duplicate task
  "click .duplicate-task": function (e) {
    let templateObject = Template.instance();
    let id = e.target.dataset.id;
    let projectID = $("#editProjectID").val() ? $("#editProjectID").val() : 11;

    if (id) {
      $(".fullScreenSpin").css("display", "inline-block");
      crmService.getTaskDetail(id).then(function (data) {
        $(".fullScreenSpin").css("display", "none");
        if (data.fields.ID == id) {
          let selected_record = data.fields;
          let employeeID = Session.get("mySessionEmployeeLoggedID");
          let employeeName = Session.get("mySessionEmployee");
          // handle complete process via api
          var objDetails = {
            type: "Tprojecttasks",
            fields: {
              TaskName: "Copy of " + selected_record.TaskName,
              TaskDescription: selected_record.TaskDescription,
              due_date: selected_record.due_date,
              priority: selected_record.priority,
              ProjectID: projectID,
              // TaskLabel: selected_record.TaskLabel,
              Completed: false,
              EnteredByID: parseInt(employeeID),
              EnteredBy: employeeName,
            },
          };

          crmService.saveNewTask(objDetails).then(function (data) {
            // recalculate count here
            templateObject.getAllTaskList();
            templateObject.getTProjectList();
            $(".fullScreenSpin").css("display", "none");
          }).catch(function (err) {
            $(".fullScreenSpin").css("display", "none");
            swal(err, "", "error");
            return;
          });
        } else {
          swal("Cannot duplicate this task", "", "warning");
          return;
        }
      }).catch(function (err) {
        $(".fullScreenSpin").css("display", "none");
        swal(err, "", "error");
        return;
      });
    }
  },

  // set projectID in edit
  "click .setProjectIDEdit": function (e) {
    let projectID = e.target.dataset.projectid;
    $("#editProjectID").val(projectID);
  },

  // set projectID in add
  "click .setProjectIDAdd": function (e) {
    let projectid = e.target.dataset.projectid;
    let projectName = e.target.dataset.projectname;
    projectName = projectName.length > 26 ? projectName.substring(0, 26) + "..." : projectName;

    $("#addProjectID").val(projectid);
    $(".addTaskModalProjectName").html(projectName);
    $("#taskDetailModalCategoryLabel").html(
      `<i class="fas fa-inbox text-primary" style="margin-right: 5px;"></i>${projectName}`
    );

    catg = `<i class="fas fa-inbox text-success" style="margin-right: 5px;"></i>` +
      "<span class='text-success'>" +
      projectName +
      "</span>";

    $(".taskLocation").html(
      `<a class="taganchor">
                ${catg}
              </a>`
    );


    let templateObject = Template.instance();
    let taskid = $("#txtCrmTaskID").val();

    if (taskid && projectid) {
      var objDetails = {
        type: "Tprojecttasks",
        fields: {
          ID: taskid,
          ProjectID: projectid,
        },
      };

      $(".fullScreenSpin").css("display", "inline-block");
      crmService.saveNewTask(objDetails).then(function (data) {
        templateObject.getAllTaskList();

        $(".fullScreenSpin").css("display", "none");
      });
    }
  },

  // set priority in add
  "click .chkPriorityAdd": function (e) {
    let value = e.target.value;
    value = value == undefined ? 3 : value;

    $("#chkPriorityAdd0").prop("checked", false);
    $("#chkPriorityAdd1").prop("checked", false);
    $("#chkPriorityAdd2").prop("checked", false);
    $("#chkPriorityAdd3").prop("checked", false);
    $("#chkPriorityAdd" + value).prop("checked", true);

    $("#newTaskModal .taskModalActionFlagDropdown").removeClass("task_modal_priority_3");
    $("#newTaskModal .taskModalActionFlagDropdown").removeClass("task_modal_priority_2");
    $("#newTaskModal .taskModalActionFlagDropdown").removeClass("task_modal_priority_1");
    $("#newTaskModal .taskModalActionFlagDropdown").removeClass("task_modal_priority_0");
    $("#newTaskModal .taskModalActionFlagDropdown").addClass("task_modal_priority_" + value);
  },

  // update task rename task
  "click .btnSaveEditTask": function (e) {
    playSaveAudio();
    let templateObject = Template.instance();
    setTimeout(function () {
      let taskID = $("#txtCrmTaskID").val();
      if (taskID) {
        let selected_lbls = [];
        let unselected_lbls = [];
        $("#detailTaskLabelWrapper input:checked").each(function () {
          selected_lbls.push($(this).attr("name"));
        });
        $("#detailTaskLabelWrapper input:unchecked").each(function () {
          unselected_lbls.push($(this).attr("name"));
        });

        let editTaskDetailName = $(".editTaskDetailName").val();
        let editTaskDetailDescription = $(".editTaskDetailDescription").val();
        if (editTaskDetailName == "") {
          swal("Please endter the task name", "", "warning");
          return;
        }

        let assignId = $('#assignedID').val();
        let assignName = $('#crmEditSelectEmployeeList').val();
        let contactID = $('#contactID').val();
        let contactName = $('#crmEditSelectLeadList').val();

        let contactType = $('#contactType').val();
        let customerID = 0;
        let leadID = 0;
        let supplierID = 0;
        if (contactType == 'Customer') {
          customerID = contactID;
        } else if (contactType == 'Lead') {
          leadID = contactID;
        } else if (contactType == 'Supplier') {
          supplierID = contactID;
        }

        let completed = $('#chkComplete_taskEdit').prop("checked");

        var objDetails = {
          type: "Tprojecttasks",
          fields: {
            ID: taskID,
            TaskName: editTaskDetailName,
            TaskDescription: editTaskDetailDescription,
            CustomerID: customerID,
            LeadID: leadID,
            SupplierID: supplierID,
            AssignID: assignId,
            AssignName: assignName,
            ContactName: contactName,
            Completed: completed
          },
        };
        $(".fullScreenSpin").css("display", "inline-block");

        crmService.saveNewTask(objDetails).then(function (data) {
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
            .then(function (data) { });
        });
      }
    }, delayTimeAfterSound);
  },
  // submit save new task add task
  "click .btnSaveAddTask": function (e) {
    playSaveAudio();
    let templateObject = Template.instance();
    setTimeout(function () {
      let task_name = $("#add_task_name").val();
      let task_description = $("#add_task_description").val();
      let subTaskID = $("#txtCrmSubTaskID").val();

      let due_date = $(".crmEditDatepicker").val();
      due_date = due_date ? moment(due_date.split('/')[2] + '-' + due_date.split('/')[1] + '-' + due_date.split('/')[0]).format("YYYY-MM-DD hh:mm:ss") : moment().format("YYYY-MM-DD hh:mm:ss");

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
      $("#addTaskLabelWrapper input:checked").each(function () {
        selected_lbls.push($(this).attr("name"));
      });

      let employeeID = Session.get("mySessionEmployeeLoggedID");
      let employeeName = Session.get("mySessionEmployee");

      let assignId = $('#assignedID').val();
      let assignName = $('#add_assigned_name').val();

      let contactID = $('#contactID').val();
      let contactName = $('#add_contact_name').val();
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

      let addObject = {
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
        AssignID: assignId,
        AssignName: assignName,
        ContactName: contactName
      }

      if (subTaskID) {
        var objDetails = {
          type: "Tprojecttasks",
          fields: {
            ID: subTaskID,
            subtasks: [
              {
                type: "Tprojecttask_subtasks",
                fields: addObject,
              }
            ]
          },
        };
      } else {
        var objDetails = {
          type: "Tprojecttasks",
          fields: addObject,
        };
      }

      crmService.saveNewTask(objDetails).then(function (res) {
        if (res.fields.ID) {
          if (moment(due_date).format("YYYY-MM-DD") == moment().format("YYYY-MM-DD")) {
          }

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
            crmService.getTaskDetail(subTaskID).then(function (data) {
              $(".fullScreenSpin").css("display", "none");
              if (data.fields.ID == subTaskID) {
                let selected_record = data.fields;

                if (selected_record.subtasks) {

                  let newSubTaskID = 0;
                  if (Array.isArray(selected_record.subtasks)) {
                    templateObject.subTasks.set(selected_record.subtasks)
                    templateObject.initSubtaskDatatable();
                    newSubTaskID = selected_record.subtasks[selected_record.subtasks.length - 1].fields.ID
                  }

                  if (typeof selected_record.subtasks == 'object') {
                    let arr = [];
                    arr.push(selected_record.subtasks)
                    templateObject.subTasks.set(arr)
                    templateObject.initSubtaskDatatable();
                    newSubTaskID = selected_record.subtasks.fields.ID

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
                      }).then(function (data) {
                        templateObject.getAllTaskList();
                        templateObject.getTProjectList();
                      });
                    });
                    // tempcode until api is updated
                  } catch (error) {
                    swal(error, "", "error");
                  }
                } else {
                  let sutTaskTable = $('#tblSubtaskDatatable').DataTable();
                  sutTaskTable.clear().draw();
                }

              }

            }).catch(function (err) {
              $(".fullScreenSpin").css("display", "none");
              swal(err, "", "error");
              return;
            });
          }

        }

        templateObject.getAllTaskList();
        templateObject.getTProjectList();

        $(".btnRefresh").addClass('btnSearchAlert');

        $(".fullScreenSpin").css("display", "none");

        $("#add_task_name").val("");
        $("#add_task_description").val("");

        $('#assignedID').val("");
        $('#add_assigned_name').val("");

        $('#contactID').val("");
        $('#add_contact_name').val("");

      }).catch(function (err) {
        swal({
          title: "Oooops...",
          text: err,
          type: "error",
          showCancelButton: false,
          confirmButtonText: "Try Again",
        }).then((result) => { });
        $(".fullScreenSpin").css("display", "none");
      });
    }, delayTimeAfterSound);
  },

  // submit set schedule as today
  "click .setScheduleToday": function (e) {
    let id = e.target.dataset.id;

    let currentDate = new Date();
    let due_date = moment(currentDate).format("YYYY-MM-DD hh:mm:ss");
    let due_date_display = moment(currentDate).format("dddd, Do MMMM");
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
      let templateObject = Template.instance();
      crmService.saveNewTask(objDetails).then(function (data) {
        templateObject.getAllTaskList();
        $(".fullScreenSpin").css("display", "none");
        $(".btnRefresh").addClass('btnSearchAlert');
      }).catch(function (err) {
        $(".fullScreenSpin").css("display", "none");
      });
    }
  },

  // submit set schedule as tomorrow
  "click .setScheduleTomorrow": function (e) {
    let id = e.target.dataset.id;
    let tomorrow = moment().add(1, "day").format("YYYY-MM-DD hh:mm:ss");
    let due_date_display = moment(tomorrow).format("dddd, Do MMMM");
    $('#edit_task_modal_due_date').html(due_date_display)

    var objDetails = {
      type: "Tprojecttasks",
      fields: {
        ID: id,
        due_date: tomorrow,
      },
    };

    if (id) {
      $(".fullScreenSpin").css("display", "inline-block");
      let templateObject = Template.instance();
      crmService.saveNewTask(objDetails).then(function (data) {
        templateObject.getAllTaskList();
        $(".fullScreenSpin").css("display", "none");
        $(".btnRefresh").addClass('btnSearchAlert');
      }).catch(function (err) {
        $(".fullScreenSpin").css("display", "none");
      });
    }
  },

  // submit set schedule as weekend
  "click .setScheduleWeekend": function (e) {
    let id = e.target.dataset.id;
    let weekend = moment().endOf("week").format("YYYY-MM-DD hh:mm:ss");
    let due_date_display = moment(weekend).format("dddd, Do MMMM");
    $('#edit_task_modal_due_date').html(due_date_display)

    var objDetails = {
      type: "Tprojecttasks",
      fields: {
        ID: id,
        due_date: weekend,
      },
    };

    if (id) {
      $(".fullScreenSpin").css("display", "inline-block");
      let templateObject = Template.instance();
      crmService.saveNewTask(objDetails).then(function (data) {
        templateObject.getAllTaskList();
        $(".fullScreenSpin").css("display", "none");
        $(".btnRefresh").addClass('btnSearchAlert');
      }).catch(function (err) {
        $(".fullScreenSpin").css("display", "none");
      });
    }
  },

  // submit set schedule as next week
  "click .setScheduleNexweek": function (e) {
    let id = e.target.dataset.id;

    var startDate = moment();
    let next_monday = moment(startDate).day(1 + 7).format("YYYY-MM-DD hh:mm:ss");
    let due_date_display = moment(next_monday).format("dddd, Do MMMM");
    $('#edit_task_modal_due_date').html(due_date_display)

    var objDetails = {
      type: "Tprojecttasks",
      fields: {
        ID: id,
        due_date: next_monday,
      },
    };

    if (id) {
      $(".fullScreenSpin").css("display", "inline-block");
      let templateObject = Template.instance();
      crmService.saveNewTask(objDetails).then(function (data) {
        templateObject.getAllTaskList();
        $(".fullScreenSpin").css("display", "none");
        $(".btnRefresh").addClass('btnSearchAlert');
      }).catch(function (err) {
        $(".fullScreenSpin").css("display", "none");
      });
    }
  },

  // submit set schedule as no-date
  "click .setScheduleNodate": function (e) {
    let id = e.target.dataset.id;
    $('#edit_task_modal_due_date').html('No Date')

    var objDetails = {
      type: "Tprojecttasks",
      fields: {
        ID: id,
        due_date: "",
      },
    };

    if (id) {
      $(".fullScreenSpin").css("display", "inline-block");
      let templateObject = Template.instance();
      crmService.saveNewTask(objDetails).then(function (data) {
        templateObject.getAllTaskList();
        $(".fullScreenSpin").css("display", "none");
        $(".btnRefresh").addClass('btnSearchAlert');
      }).catch(function (err) {
        $(".fullScreenSpin").css("display", "none");
      });
    }
  },

  // set due_date
  "click .setScheduleTodayAdd": function (e) {
    let due_date = moment().format("YYYY-MM-DD hh:mm:ss");
    $(".crmEditDatepicker").val(due_date);
    $(".lblAddTaskSchedule").html("Today");
  },

  // set due_date
  "click .setScheduleTomorrowAdd": function (e) {
    let due_date = moment().add(1, "day").format("YYYY-MM-DD hh:mm:ss");
    $(".crmEditDatepicker").val(due_date);
    $(".lblAddTaskSchedule").html("Tomorrow");
  },

  // set due_date
  "click .setScheduleWeekendAdd": function (e) {
    let due_date = moment().endOf("week").format("YYYY-MM-DD hh:mm:ss");
    $(".crmEditDatepicker").val(due_date);
    $(".lblAddTaskSchedule").html(moment(due_date).format("YYYY-MM-DD"));
  },

  // set due_date
  "click .setScheduleNexweekAdd": function (e) {
    var startDate = moment();
    let due_date = moment(startDate).day(1 + 7).format("YYYY-MM-DD hh:mm:ss");

    $(".crmEditDatepicker").val(due_date);
    $(".lblAddTaskSchedule").html(moment(due_date).format("YYYY-MM-DD"));
  },

  // set due_date
  "click .setScheduleNodateAdd": function (e) {
    $(".crmEditDatepicker").val(null);
    $(".lblAddTaskSchedule").html("No Date");
  },

  // update priority
  "click .taskDropSecondFlag": function (e) {
    let id = e.target.dataset.id;
    let priority = e.target.dataset.priority;

    if (id && priority) {
      if (id == "edit") {
        id = $("#txtCrmTaskID").val();

        $("#chkPriority0").prop("checked", false);
        $("#chkPriority1").prop("checked", false);
        $("#chkPriority2").prop("checked", false);
        $("#chkPriority3").prop("checked", false);
        $("#chkPriority" + priority).prop("checked", true);

        $(".taskModalActionFlagDropdown").removeClass("task_modal_priority_3");
        $(".taskModalActionFlagDropdown").removeClass("task_modal_priority_2");
        $(".taskModalActionFlagDropdown").removeClass("task_modal_priority_1");
        $(".taskModalActionFlagDropdown").removeClass("task_modal_priority_0");
        $(".taskModalActionFlagDropdown").addClass("task_modal_priority_" + priority);
      }
      var objDetails = {
        type: "Tprojecttasks",
        fields: {
          ID: id,
          priority: priority,
        },
      };

      $(".fullScreenSpin").css("display", "inline-block");
      let templateObject = Template.instance();
      crmService.saveNewTask(objDetails).then(function (data) {
        templateObject.getAllTaskList();

        $(".fullScreenSpin").css("display", "none");
      });
    }
  },

  "click .sectionOpened": function (event) {
    $(".sectionOpened").css("display", "none");
    $(".sectionClosed").css("display", "inline-flex");
    $(".sectionCol1").css("display", "none");
  },

  "click .sectionClosed": function (event) {
    $(".sectionOpened").css("display", "inline-flex");
    $(".sectionClosed").css("display", "none");
    $(".sectionCol1").css("display", "inline");
  },

  "click .btnNewFilter": function (event) {
    $("#newFilterModal").modal("toggle");
  },

  "click .btnNewLabel": function (event) {
    $("#newLabelModal").modal("toggle");
  },

  // view all completed task
  "click .btnViewAllCompleted": function (e) {
    let templateObject = Template.instance();
    let allCompletedRecords = templateObject.allWithCompletedRecords.get();
    let view_all_task_completed = templateObject.view_all_task_completed.get();

    if (view_all_task_completed == "NO") {
      allCompletedRecords = allCompletedRecords.filter((item) => item.fields.Completed == true);
      templateObject.view_all_task_completed.set("YES");
    } else {
      allCompletedRecords = allCompletedRecords.filter((item) => item.fields.Completed == false);
      templateObject.view_all_task_completed.set("NO");
    }

    templateObject.allRecords.set(allCompletedRecords);

    templateObject.initTodayTasksTable();
    templateObject.initUpcomingTasksTable();
    templateObject.initAllTasksTable();
  },

  // view today completed task
  "click .btnViewTodayCompleted": function (e) {
    e.stopImmediatePropagation();

    let templateObject = Template.instance();
    let allCompletedRecords = templateObject.allWithCompletedRecords.get();
    let view_today_task_completed = templateObject.view_today_task_completed.get();

    let today = moment().format("YYYY-MM-DD");
    allCompletedRecords = allCompletedRecords.filter((item) => item.fields.due_date.substring(0, 10) == today);

    if (view_today_task_completed == "NO") {
      allCompletedRecords = allCompletedRecords.filter((item) => item.fields.Completed == true);
      templateObject.view_today_task_completed.set("YES");
    } else {
      allCompletedRecords = allCompletedRecords.filter((item) => item.fields.Completed == false);
      templateObject.view_today_task_completed.set("NO");
    }

    templateObject.todayRecords.set(allCompletedRecords);

    templateObject.initTodayTasksTable();
    templateObject.initAllTasksTable();
  },

  // view upcoming completed task
  "click .btnViewUpcomingCompleted": function (e) {
    e.stopImmediatePropagation();

    let templateObject = Template.instance();
    let allCompletedRecords = templateObject.allWithCompletedRecords.get();
    let view_uncoming_task_completed = templateObject.view_uncoming_task_completed.get();

    let today = moment().format("YYYY-MM-DD");
    allCompletedRecords = allCompletedRecords.filter((item) => item.fields.due_date.substring(0, 10) > today);

    if (view_uncoming_task_completed == "NO") {
      allCompletedRecords = allCompletedRecords.filter((item) => item.fields.Completed == true);
      templateObject.view_uncoming_task_completed.set("YES");
    } else {
      allCompletedRecords = allCompletedRecords.filter((item) => item.fields.Completed == false);
      templateObject.view_uncoming_task_completed.set("NO");
    }

    templateObject.upcomingRecords.set(allCompletedRecords);

    templateObject.initUpcomingTasksTable();
    templateObject.initAllTasksTable();
  },

  // submit save new project
  "click .btnSaveNewCrmProject": function (e) {
    playSaveAudio();
    let templateObject = Template.instance();
    setTimeout(function () {
      let projectName = $("#crmProjectName").val();
      let projectColor = $("#crmProjectColor").val();
      let projectDescription = $("#crmProjectDescription").val();

      // let swtNewCrmProjectFavorite = $("#swtNewCrmProjectFavorite").prop(
      //   "checked"
      // );

      if (projectName === "" || projectName === null) {
        swal("Project name is not entered!", "", "warning");
        return;
      }

      $(".fullScreenSpin").css("display", "inline-block");

      var objDetails = {
        type: "Tprojectlist",
        fields: {
          Active: true,
          ProjectName: projectName,
          ProjectColour: projectColor,
          Description: projectDescription,
          // AddToFavourite: swtNewCrmProjectFavorite,
        },
      };

      crmService.updateProject(objDetails).then(function (data) {
        templateObject.getTProjectList();

        $("#crmProjectName").val("");
        $("#crmProjectDescription").val("");
        $("#crmProjectColor").val("#000000");
        $("#swtNewCrmProjectFavorite").prop("checked", false);

        $("#newCrmProject").modal("hide");
        $(".fullScreenSpin").css("display", "none");

        $("#projectsTab-tab").click();
        // Meteor._reload.reload();
      }).catch(function (err) {
        swal({
          title: "Oooops...",
          text: err,
          type: "error",
          showCancelButton: false,
          confirmButtonText: "Try Again",
        }).then((result) => { });
        $(".fullScreenSpin").css("display", "none");
      });
    }, delayTimeAfterSound);
  },

  "click .movetoproject": function (e) {
    let taskid = e.target.dataset.id;
    let projectid = e.target.dataset.projectid;
    // $("#txtCrmTaskID").val(taskid);
    // $("#txtCrmProjectID").val(projectid);
    let templateObject = Template.instance();
    templateObject.task_id.set(taskid);
    templateObject.project_id.set(projectid);

    $(".fullScreenSpin").css("display", "inline-block");

    var url = FlowRouter.current().path;
    url = new URL(window.location.href);
    let employeeID = url.searchParams.get("id") ? url.searchParams.get("id") : '';

    crmService.getTProjectList(employeeID).then(function (data) {
      if (data.tprojectlist && data.tprojectlist.length > 0) {
        let all_projects = data.tprojectlist;
        all_projects = all_projects.filter((proj) => proj.fields.Active == true && proj.fields.ID != 11);

        let checked = projectid == "11" ? "checked" : "";

        let tbodyMovetoProjectTable = `
        <tr class="trMovetoproject" data-id="11">
          <td style="width:30px;" data-id="11">
            <div class="custom-control custom-checkbox chkBox pointer chkMovetoproject"
              style="width:15px;margin-right: -6px;" data-id="11">
              <input class="custom-control-input chkBox pointer chkMovetoproject" type="checkbox"
                id="chkMovetoproject-11" ${checked} data-id="11">
              <label class="custom-control-label chkBox pointer" data-id="11"
                for="chkMovetoproject-11"></label>
            </div>
          </td>
          <td style="width:auto" data-id="11">All Tasks</td>
        </tr>`;

        let ProjectName = "";
        all_projects.forEach((proj) => {
          if (projectid == proj.fields.ID) {
            checked = "checked";
          } else {
            checked = "";
          }
          ProjectName = proj.fields.ProjectName.length > 40 ? proj.fields.ProjectName.substring(0, 40) + "..." : proj.fields.ProjectName;

          tbodyMovetoProjectTable += `
          <tr class="trMovetoproject" data-id="${proj.fields.ID}">
            <td data-id="${proj.fields.ID}">
              <div class="custom-control custom-checkbox chkBox pointer chkMovetoproject"
                style="width:15px;margin-right: -6px;" data-id="${proj.fields.ID}">
                <input class="custom-control-input chkBox pointer chkMovetoproject" type="checkbox"
                  id="chkMovetoproject-${proj.fields.ID}" ${checked} data-id="${proj.fields.ID}">
                <label class="custom-control-label chkBox pointer" data-id="${proj.fields.ID}"
                  for="chkMovetoproject-${proj.fields.ID}"></label>
              </div>
            </td>
            <td data-id="${proj.fields.ID}">${ProjectName}</td>
          </tr>`;
        });
        $("#tbodyMovetoProjectTable").html(tbodyMovetoProjectTable);
        $(".fullScreenSpin").css("display", "none");
      }
    });

    $("#movetoprojectsmodal").modal();
  },

  "click .trMovetoproject": function (e) {
    let projectid = e.target.dataset.id;
    $(".chkMovetoproject").prop("checked", false);
    $("#chkMovetoproject-" + projectid).prop("checked", true);
    let templateObject = Template.instance();
    templateObject.project_id.set(projectid);
  },

  // submit move to project
  "click .btnMovetoproject": function (e) {
    let templateObject = Template.instance();
    let taskid = templateObject.task_id.get();
    let projectid = templateObject.project_id.get();

    if (taskid && projectid) {
      var objDetails = {
        type: "Tprojecttasks",
        fields: {
          ID: taskid,
          ProjectID: projectid,
        },
      };

      $(".fullScreenSpin").css("display", "inline-block");
      crmService.saveNewTask(objDetails).then(function (data) {
        templateObject.getAllTaskList();
        templateObject.getTProjectList();

        $(".fullScreenSpin").css("display", "none");
      });
    }
  },

  "click .filterByLabel": function (e) {
    let labelid = e.target.dataset.id;
    let templateObject = Template.instance();
    let allCompletedRecords = templateObject.allWithCompletedRecords.get();

    if (labelid) {
      $("#taskDetailModal").modal("hide");

      allCompletedRecords = allCompletedRecords.filter((item) => item.fields.TaskLabel != null);

      let filterRecord1 = allCompletedRecords.filter((item) => Array.isArray(item.fields.TaskLabel) == false && item.fields.TaskLabel.fields.ID == labelid);

      let filterRecord2 = allCompletedRecords.filter((item) => Array.isArray(item.fields.TaskLabel) == true);
      filterRecord2 = filterRecord2.filter((item) => {
        let lbls = item.fields.TaskLabel;
        return lbls.filter((lbl) => lbl.fields.ID == 14).length > 0;
      });

      let filterRecord = filterRecord1.concat(filterRecord2);

      $("#allTasks-tab").click();
      templateObject.allRecords.set(filterRecord);

      templateObject.initTodayTasksTable();
      templateObject.initUpcomingTasksTable();
      templateObject.initAllTasksTable();
    }
  },

  // projects tab ------------
  "click .projectName": function (e) {
    let id = e.target.dataset.id;
    if (id) {
      FlowRouter.go("/projects?id=" + id);
      Meteor._reload.reload();
    }
  },

  "click .menuFilterslabels": function (e) {
    FlowRouter.go("/filterslabels");
  },

  // delete project
  "click .delete-project": function (e) {
    let id = $("#editProjectID").val();
    // let id = e.target.dataset.id;
    if (id) {
      let templateObject = Template.instance();
      swal({
        title: "Delete Project",
        text: "Are you sure want to delete this project?",
        type: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
      }).then((result) => {
        if (result.value) {
          $(".fullScreenSpin").css("display", "inline-block");
          var objDetails = {
            type: "Tprojectlist",
            fields: {
              ID: id,
              Active: false,
            },
          };
          crmService.updateProject(objDetails).then(function (data) {
            // $(".projectRow" + id).remove();
            templateObject.getTProjectList();
            $("#editProjectID").val("");

            $("#editCrmProject").modal("hide");
            $("#newProjectTasksModal").modal("hide");
            $(".fullScreenSpin").css("display", "none");
          }).catch(function (err) {
            swal({
              title: "Oooops...",
              text: err,
              type: "error",
              showCancelButton: false,
              confirmButtonText: "Try Again",
            }).then((result) => { });
            $("#editCrmProject").modal("hide");
            $("#newProjectTasksModal").modal("hide");
            $(".fullScreenSpin").css("display", "none");
          });
        } else if (result.dismiss === "cancel") {
        } else {
        }
      });
    }
  },

  // "click #editCrmProjectColor": function (e) {
  //   $('button').each(function () {
  //     var target = $(this);
  //     if (target.text() == 'Other...' || target.val() == 'Other...') {
  //       target.remove();
  //     }
  //   });
  // },

  // submit edit project
  "click .btnEditCrmProject": function (e) {
    let id = $("#editProjectID").val();
    let projectName = $("#editCrmProjectName").val();
    let projectColor = $("#editCrmProjectColor").val();
    let projectDescription = $("#editCrmProjectDescription").val();
    // let swtNewCrmProjectFavorite = $("#swteditCrmProjectFavorite").prop(
    //   "checked"
    // );

    if (id === "" || id === null) {
      swal("Project is not selected correctly", "", "warning");
      return;
    }

    if (projectName === "" || projectName === null) {
      swal("Project name is not entered!", "", "warning");
      return;
    }

    $(".fullScreenSpin").css("display", "inline-block");

    var objDetails = {
      type: "Tprojectlist",
      fields: {
        ID: id,
        Active: true,
        ProjectName: projectName,
        ProjectColour: projectColor,
        Description: projectDescription,
        // AddToFavourite: swtNewCrmProjectFavorite,
      },
    };
    let templateObject = Template.instance();

    crmService.updateProject(objDetails).then(function (data) {
      templateObject.getTProjectList();

      $(".fullScreenSpin").css("display", "none");
      $("#editCrmProject").modal("hide");
      $("#newProjectTasksModal").modal("hide");
      // Meteor._reload.reload();
    }).catch(function (err) {
      swal({
        title: "Oooops...",
        text: err,
        type: "error",
        showCancelButton: false,
        confirmButtonText: "Try Again",
      }).then((result) => { });
      $(".fullScreenSpin").css("display", "none");
      $("#editCrmProject").modal("hide");
      $("#newProjectTasksModal").modal("hide");
    });
  },

  // submit duplicate project
  "click .duplicate-project": function (e) {
    let projectName = "Copy of " + e.target.dataset.name;
    let projectColor = e.target.dataset.color;
    let projecttasks = e.target.dataset.projecttasks;
    let projecttasks_count = "";
    if (
      projecttasks != null &&
      projecttasks != undefined &&
      projecttasks != "undefined"
    ) {
      projecttasks_count = projecttasks.lentgh;
    }

    $(".fullScreenSpin").css("display", "inline-block");

    var objDetails = {
      type: "Tprojectlist",
      fields: {
        Active: true,
        ProjectName: projectName,
        ProjectColour: projectColor,
      },
    };
    projectColor = projectColor == 0 ? "gray" : projectColor;
    let templateObject = Template.instance();

    crmService.updateProject(objDetails).then(function (data) {
      templateObject.getTProjectList();

      $("#editCrmProject").modal("hide");
      $(".fullScreenSpin").css("display", "none");
      // Meteor._reload.reload();
    }).catch(function (err) {
      swal({
        title: "Oooops...",
        text: err,
        type: "error",
        showCancelButton: false,
        confirmButtonText: "Try Again",
      }).then((result) => { });
      $("#editCrmProject").modal("hide");
      $(".fullScreenSpin").css("display", "none");
    });
  },

  // open task-project modal in projects table
  "click #tblNewProjectsDatatable tbody tr": function (e) {
    if (e.target.classList.contains("no-modal")) {
      e.preventDefault();
      return
    }
    let templateObject = Template.instance();

    clickCount++;
    if (clickCount == 1) {
      setTimeout(function () {
        if (clickCount == 1) {

          // this modal is for displaying task list of the project
          // $("#newProjectTasksModal").modal("toggle");
          $("#editCrmProject").modal("toggle");

          let id = e.target.dataset.id;
          $("#editProjectID").val(id);

          if (id) {
            $(".fullScreenSpin").css("display", "inline-block");
            let active_projecttasks = [];
            templateObject.view_projecttasks_completed.set("NO");

            crmService.getTProjectDetail(id).then(function (data) {
              $(".fullScreenSpin").css("display", "none");
              if (data.fields.ID == id) {
                let selected_record = data.fields;

                let projectName = data.fields.ProjectName;
                let ProjectColour = data.fields.ProjectColour;
                let ProjectDescription = data.fields.Description;

                $("#editProjectID").val(id);
                $("#editCrmProjectName").val(projectName);
                $(".editCrmProjectName").html(projectName);
                $("#editCrmProjectColor").val(ProjectColour);
                $("#editCrmProjectDescription").val(ProjectDescription);

                // set task list
                let projecttasks = [];
                if (selected_record.projecttasks) {
                  if (selected_record.projecttasks.fields == undefined) {
                    projecttasks = selected_record.projecttasks;
                  } else {
                    projecttasks.push(selected_record.projecttasks);
                  }

                  active_projecttasks = projecttasks.filter(
                    (item) =>
                      item.fields.Active == true && item.fields.Completed == false
                  );
                }
                templateObject.projecttasks.set(projecttasks);
                templateObject.active_projecttasks.set(active_projecttasks);

                // $("#tblProjectTasksBody").html(tr);
                templateObject.initProjectTasksTable();
              } else {
                swal("Cannot edit this project", "", "warning");
                return;
              }
            }).catch(function (err) {
              $(".fullScreenSpin").css("display", "none");
              swal(err, "", "error");
              return;
            });
          }
        } else {
          let id = e.target.dataset.id;
          $("#editProjectID").val(id);

          if (id) {
            $(".fullScreenSpin").css("display", "inline-block");
            templateObject.view_projecttasks_completed.set("NO");

            crmService.getTProjectDetail(id).then(function (data) {
              $(".fullScreenSpin").css("display", "none");
              if (data.fields.ID == id) {

                let projectName = data.fields.ProjectName;
                let ProjectColour = data.fields.ProjectColour;
                let ProjectDescription = data.fields.Description;

                $("#editProjectID").val(id);
                $("#editCrmProjectName").val(projectName);
                $(".editCrmProjectName").html(projectName);
                $("#editCrmProjectColor").val(ProjectColour);
                $("#editCrmProjectDescription").val(ProjectDescription);

                $("#editCrmProject").modal();

              } else {
                swal("Cannot edit this project", "", "warning");
                return;
              }
            }).catch(function (err) {
              $(".fullScreenSpin").css("display", "none");
              swal("Cannot edit this project", "", "error");
              return;
            });
          }
        }
        clickCount = 0;
      }, 300);
    }
  },

  // open new task modal
  "click .addTaskOnProject": function (e) {
    // $("#editProjectID").val("");
    $("#txtCrmSubTaskID").val("");
    $(".lblAddTaskSchedule").html("Schedule");

    // uncheck all labels
    $(".chkAddLabel").prop("checked", false);

    $("#newTaskModal").modal("toggle");

    let projectName = $(".editCrmProjectName").html() ? $(".editCrmProjectName").html().length > 26 ? $(".editCrmProjectName").html().substring(0, 26) + "..." : $(".editCrmProjectName").html() : "All Task";
    $(".addTaskModalProjectName").html(projectName);

    $(".taskModalActionFlagDropdown").removeClass("task_modal_priority_3");
    $(".taskModalActionFlagDropdown").removeClass("task_modal_priority_2");
    $(".taskModalActionFlagDropdown").removeClass("task_modal_priority_1");
    $(".taskModalActionFlagDropdown").removeClass("task_modal_priority_0");
  },

  // view all project including delete
  "click .btnViewProjectCompleted": function (e) {
    let templateObject = Template.instance();
    let all_projects = templateObject.all_projects.get();
    let view_project_completed = templateObject.view_project_completed.get();

    if (view_project_completed == "NO") {
      templateObject.view_project_completed.set("YES");
    } else {
      all_projects = all_projects.filter(
        (project) => project.fields.Active == true
      );
      templateObject.view_project_completed.set("NO");
    }

    templateObject.active_projects.set(all_projects);
    templateObject.initProjectsTable();
  },

  // show completed tasks on project task modal
  "click .showCompletedTaskOnProject": function (e) {
    let templateObject = Template.instance();
    let allCompletedRecords = templateObject.projecttasks.get();
    let view_projecttasks_completed = templateObject.view_projecttasks_completed.get();

    // show completed task
    if (view_projecttasks_completed == "NO") {
      allCompletedRecords = allCompletedRecords.filter((item) => item.fields.Active == true && item.fields.Completed == true);
      templateObject.view_projecttasks_completed.set("YES");
    } else {
      allCompletedRecords = allCompletedRecords.filter((item) => item.fields.Active == true && item.fields.Completed == false);
      templateObject.view_projecttasks_completed.set("NO");
    }

    templateObject.active_projecttasks.set(allCompletedRecords);
    templateObject.initProjectTasksTable();
  },
  // projects tab--------------- //

  // labels tab ---------------
  "click .btnEditLabel": function (e) {
    let id = e.target.dataset.id;
    if (id) {
      $("#editLabelID").val(id);

      $(".fullScreenSpin").css("display", "inline-block");
      let templateObject = Template.instance();
      crmService.getOneLabel(id).then(function (obj) {
        $("#editLabelName").val(obj.fields.TaskLabelName);
        $('#editLabelColor').val(obj.fields.Color);

        $("#editLabelModal").modal("toggle");

        $(".fullScreenSpin").css("display", "none");
      });
    }
  },

  "click #tblLabels tbody tr": function (e) {
    let id = e.target.dataset.id;
    if (id) {
      $("#editLabelID").val(id);

      $(".fullScreenSpin").css("display", "inline-block");
      let templateObject = Template.instance();
      crmService.getOneLabel(id).then(function (obj) {
        $("#editLabelName").val(obj.fields.TaskLabelName);
        $('#editLabelColor').val(obj.fields.Color);

        $("#editLabelModal").modal("toggle");

        $(".fullScreenSpin").css("display", "none");
      });
    }
  },

  "click .btnAddNewLabel": function (e) {
    let labelName = $("#newLabelName").val();
    let labelColor = $("#newLabelColor").val();

    if (labelName == "") {
      swal("Please put the Label Name", "", "warning");
      return;
    }
    let employeeID = parseInt(Session.get("mySessionEmployeeLoggedID"));
    let employeeName = Session.get("mySessionEmployee");

    var objDetails = {
      type: "Tprojecttask_TaskLabel",
      fields: {
        TaskLabelName: labelName,
        // TaskID: 1, // tempcode. it should be removed after api is updated
        Color: labelColor,
        EnteredByID: employeeID,
        EnteredBy: employeeName,
      },
    };

    $(".fullScreenSpin").css("display", "inline-block");
    let templateObject = Template.instance();
    crmService.updateLabel(objDetails).then(function (objDetails) {
      templateObject.getAllLabels();
      $("#newLabelModal").modal("hide");

      $("#newLabelName").val("");
      $("#newLabelColor").val("#000000");
      $(".fullScreenSpin").css("display", "none");
      $("#filterLabelsTab-tab").click();

    });
  },

  "click .btnSaveEditLabel": function (e) {
    playSaveAudio();
    let templateObject = Template.instance();
    setTimeout(function () {
      let id = $("#editLabelID").val();
      let labelName = $("#editLabelName").val();
      let labelColor = $("#editLabelColor").val();

      if (labelName == "") {
        swal("Please put the Label Name", "", "warning");
        return;
      }

      if (id) {
        var objDetails = {
          type: "Tprojecttask_TaskLabel",
          fields: {
            ID: id,
            TaskLabelName: labelName,
            Color: labelColor
          },
        };

        $(".fullScreenSpin").css("display", "inline-block");
        crmService.updateLabel(objDetails).then(function (objDetails) {
          templateObject.getAllLabels();
          $("#editLabelModal").modal("hide");
          $(".fullScreenSpin").css("display", "none");
        });
      }
    }, delayTimeAfterSound);
  },

  "click .btnDeleteLabel": function (e) {
    playDeleteAudio();
    let templateObject = Template.instance();
    setTimeout(function(){
    let id = e.target.dataset.id;

    if (id) {
      var objDetails = {
        type: "Tprojecttask_TaskLabel",
        fields: {
          ID: id,
          Active: false,
        },
      };

      $(".fullScreenSpin").css("display", "inline-block");

      crmService.updateLabel(objDetails).then(function (objDetails) {
        templateObject.getAllLabels();
        $(".fullScreenSpin").css("display", "none");
      });
    }
  }, delayTimeAfterSound);
  },
  // labels tab ---------------

  // search table
  "keyup #tblAllTaskDatatable_filter input": function (event) {
    if ($(event.target).val() != "") {
      $(".btnSearchAllTaskDatatable").addClass("btnSearchAlert");
    } else {
      $(".btnSearchAllTaskDatatable").removeClass("btnSearchAlert");
    }
    if (event.keyCode == 13) {
      $(".btnSearchAllTaskDatatable").trigger("click");
    }
  },

  "click .btnSearchAllTaskDatatable": function (event) {
    let templateObject = Template.instance();
    $(".fullScreenSpin").css("display", "inline-block");

    let dataSearchName = $("#tblAllTaskDatatable_filter input").val();

    if (dataSearchName.replace(/\s/g, "") != "") {
      crmService.getTasksByNameOrID(dataSearchName).then(function (data) {
        $(".btnSearchAllTaskDatatable").removeClass("btnSearchAlert");

        let all_records = data.tprojecttasks;
        templateObject.allWithCompletedRecords.set(all_records);

        all_records = all_records.filter(
          (item) => item.fields.Completed == false
        );

        templateObject.allRecords.set(all_records);

        templateObject.initAllTasksTable(dataSearchName);
        $(".fullScreenSpin").css("display", "none");
      }).catch(function (err) {
        $(".fullScreenSpin").css("display", "none");
      });
    } else {
      $(".btnRefresh").trigger("click");
    }
  },

  // search table
  "keyup #tblTodayTaskDatatable_filter input": function (event) {
    if ($(event.target).val() != "") {
      $(".btnSearchTodayTaskDatatable").addClass("btnSearchAlert");
    } else {
      $(".btnSearchTodayTaskDatatable").removeClass("btnSearchAlert");
    }
    if (event.keyCode == 13) {
      $(".btnSearchTodayTaskDatatable").trigger("click");
    }
  },

  "click .btnSearchTodayTaskDatatable": function (event) {
    let templateObject = Template.instance();
    $(".fullScreenSpin").css("display", "inline-block");

    let dataSearchName = $("#tblTodayTaskDatatable_filter input").val();

    if (dataSearchName.replace(/\s/g, "") != "") {
      crmService.getTasksByNameOrID(dataSearchName).then(function (data) {
        $(".btnSearchTodayTaskDatatable").removeClass("btnSearchAlert");

        let all_records = data.tprojecttasks;
        templateObject.allWithCompletedRecords.set(all_records);

        all_records = all_records.filter(
          (item) => item.fields.Completed == false
        );

        let today = moment().format("YYYY-MM-DD");
        let today_records = all_records.filter(
          (item) => item.fields.due_date.substring(0, 10) == today
        );

        templateObject.todayRecords.set(today_records);
        templateObject.initTodayTasksTable(dataSearchName);
        $(".fullScreenSpin").css("display", "none");
      }).catch(function (err) {
        $(".fullScreenSpin").css("display", "none");
      });
    } else {
      $(".btnRefresh").trigger("click");
    }
  },

  // search table
  "keyup #tblUpcomingTaskDatatable_filter input": function (event) {
    if ($(event.target).val() != "") {
      $(".btnSearchUpcomingTaskDatatable").addClass("btnSearchAlert");
    } else {
      $(".btnSearchUpcomingTaskDatatable").removeClass("btnSearchAlert");
    }
    if (event.keyCode == 13) {
      $(".btnSearchUpcomingTaskDatatable").trigger("click");
    }
  },

  "click .btnSearchUpcomingTaskDatatable": function (event) {
    let templateObject = Template.instance();
    $(".fullScreenSpin").css("display", "inline-block");

    let dataSearchName = $("#tblUpcomingTaskDatatable_filter input").val();

    if (dataSearchName.replace(/\s/g, "") != "") {
      crmService.getTasksByNameOrID(dataSearchName).then(function (data) {
        $(".btnSearchUpcomingTaskDatatable").removeClass("btnSearchAlert");

        let all_records = data.tprojecttasks;
        templateObject.allWithCompletedRecords.set(all_records);

        all_records = all_records.filter((item) => item.fields.Completed == false);

        let today = moment().format("YYYY-MM-DD");
        let upcoming_records = all_records.filter((item) => item.fields.due_date.substring(0, 10) > today);
        templateObject.upcomingRecords.set(upcoming_records);

        templateObject.initUpcomingTasksTable(dataSearchName);
        $(".fullScreenSpin").css("display", "none");
      }).catch(function (err) {
        $(".fullScreenSpin").css("display", "none");
      });
    } else {
      $(".btnRefresh").trigger("click");
    }
  },

  // search projects table
  "keyup #tblNewProjectsDatatable_filter input": function (event) {
    if ($(event.target).val() != "") {
      $(".btnSearchProjectsDatatable").addClass("btnSearchAlert");
    } else {
      $(".btnSearchProjectsDatatable").removeClass("btnSearchAlert");
    }
    if (event.keyCode == 13) {
      $(".btnSearchProjectsDatatable").trigger("click");
    }
  },

  "click .btnSearchProjectsDatatable": function (event) {
    let templateObject = Template.instance();
    $(".fullScreenSpin").css("display", "inline-block");

    let dataSearchName = $("#tblNewProjectsDatatable_filter input").val();

    if (dataSearchName.replace(/\s/g, "") != "") {
      crmService.getProjectsByNameOrID(dataSearchName).then(function (data) {
        $(".btnSearchProjectsDatatable").removeClass("btnSearchAlert");

        let all_projects = data.tprojectlist;
        all_projects = all_projects.filter((proj) => proj.fields.ID != 11);
        let active_projects = all_projects.filter(
          (project) => project.fields.Active == true
        );
        templateObject.active_projects.set(active_projects);

        templateObject.initProjectsTable(dataSearchName);
        $(".fullScreenSpin").css("display", "none");
      }).catch(function (err) {
        $(".fullScreenSpin").css("display", "none");
      });
    } else {
      $(".btnRefresh").trigger("click");
    }
  },

  // search labels table
  "keyup #tblLabels_filter input": function (event) {
    if ($(event.target).val() != "") {
      $(".btnSearchLabelsDatatable").addClass("btnSearchAlert");
    } else {
      $(".btnSearchLabelsDatatable").removeClass("btnSearchAlert");
    }
    if (event.keyCode == 13) {
      $(".btnSearchLabelsDatatable").trigger("click");
    }
  },

  "click .btnSearchLabelsDatatable": function (event) {
    let templateObject = Template.instance();
    $(".fullScreenSpin").css("display", "inline-block");

    let dataSearchName = $("#tblLabels_filter input").val();

    if (dataSearchName.replace(/\s/g, "") != "") {
      crmService.getLabelsByNameOrID(dataSearchName).then(function (data) {
        $(".btnSearchLabelsDatatable").removeClass("btnSearchAlert");

        let alllabels = data.tprojecttask_tasklabel;
        templateObject.alllabels.set(alllabels);

        templateObject.initLabelsTable(dataSearchName);
        $(".fullScreenSpin").css("display", "none");
      }).catch(function (err) {
        $(".fullScreenSpin").css("display", "none");
      });
    } else {
      $(".btnRefresh").trigger("click");
    }
  },
});

Template.alltaskdatatable.helpers({
  alllabels: () => {
    return Template.instance().alllabels.get();
  },
  allRecords: () => {
    return Template.instance().allRecords.get();
  },

  overdueRecords: () => {
    return Template.instance().overdueRecords.get();
  },

  todayRecords: () => {
    return Template.instance().todayRecords.get();
  },

  upcomingRecords: () => {
    return Template.instance().upcomingRecords.get();
  },

  getTodoDate: (date, format) => {
    if (date == "" || date == null) return "";
    return moment(date).format(format);
  },

  getTaskStyleClass: (date) => {
    if (date == "" || date == null) return "taskNodate";
    if (moment().format("YYYY-MM-DD") == moment(date).format("YYYY-MM-DD")) {
      return "taskToday";
    } else if (moment().add(1, "day").format("YYYY-MM-DD") == moment(date).format("YYYY-MM-DD")) {
      return "taskTomorrow";
    } else if (moment().format("YYYY-MM-DD") > moment(date).format("YYYY-MM-DD")) {
      return "taskOverdue";
    } else {
      return "taskUpcoming";
    }
  },

  getTodayDate: (format) => {
    return moment().format(format);
  },

  getTomorrowDay: () => {
    return moment().add(1, "day").format("ddd");
  },

  getNextMonday: () => {
    var startDate = moment();
    return moment(startDate).day(1 + 7).format("ddd MMM D");
  },

  getDescription: (description) => {
    return description.length < 80 ? description : description.substring(0, 79) + "...";
  },

  getProjectName: (projectName) => {
    if (projectName == "" || projectName == "Default") {
      return "All Tasks";
    }
    return projectName;
  },

  getTaskLabel: (labels) => {
    if (labels == "" || labels == null) {
      return "";
    } else if (labels.type == undefined) {
      let label_string = "";
      labels.forEach((label) => {
        label_string += label.fields.TaskLabelName + ", ";
      });
      return label_string.slice(0, -2);
    } else {
      return labels.fields.TaskLabelName;
    }
  },

  active_projects: () => {
    return Template.instance().active_projects.get();
  },

  deleted_projects: () => {
    return Template.instance().deleted_projects.get();
  },

  favorite_projects: () => {
    return Template.instance().favorite_projects.get();
  },

  // projects tab ------------------

  // getProjectColor: (color) => {
  //   if (color == 0) {
  //     return "gray";
  //   }
  //   return color;
  // },

  // getProjectCount: (tasks) => {
  //   if (tasks == null) {
  //     return "";
  //   } else if (Array.isArray(tasks) == true) {
  //     return tasks.length;
  //   } else {
  //     return 1;
  //   }
  // },

  // getProjectStatus: (status) => {
  //   if (status) {
  //     return "Active";
  //   } else {
  //     return "Deleted";
  //   }
  // },
  // projects tab ------------------
});

function getContactData(contactID, contactType) {
  if (contactType == 'Customer') {
    getVS1Data("TCustomerVS1").then(function (dataObject) {
      if (dataObject.length === 0) {
        contactService.getOneCustomerDataEx(contactID).then(function (data) {
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
    }).catch(function (err) {
      contactService.getOneCustomerDataEx(contactID).then(function (data) {
        setContactDataToDetail(data, contactType);
      });
    });
  } else if (contactType == 'Supplier') {
    getVS1Data("TSupplierVS1").then(function (dataObject) {
      if (dataObject.length === 0) {
        contactService.getOneSupplierDataEx(contactID).then(function (data) {
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
    }).catch(function (err) {
      contactService.getOneSupplierDataEx(contactID).then(function (data) {
        setContactDataToDetail(data, contactType);
      });
    });
  } else if (contactType == 'Lead') {
    getVS1Data("TProspectEx").then(function (dataObject) {
      if (dataObject.length === 0) {
        contactService.getOneLeadDataEx(contactID).then(function (data) {
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
    }).catch(function (err) {
      contactService.getOneLeadDataEx(contactID).then(function (data) {
        setContactDataToDetail(data, contactType);
      });
    });
  } else {
    $('#crmEditSelectLeadList').val('');
    $('#contactID').val('')
    $('#contactType').val('')
  }
  return;
}

function setContactDataToDetail(data, contactType) {
  $('#crmEditSelectLeadList').val(data.fields.ClientName);
  $('#contactID').val(data.fields.ID)
  $('#contactType').val(contactType)
}

function openEditTaskModal(id, type) {
  // let catg = e.target.dataset.catg;
  let templateObject = Template.instance();
  // $("#editProjectID").val("");

  $("#txtCrmSubTaskID").val(id);

  $(".fullScreenSpin").css("display", "inline-block");
  // get selected task detail via api
  crmService.getTaskDetail(id).then(function (data) {
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

      let colClientName = selected_record.ContactName;
      $('#crmEditSelectLeadList').val(colClientName);
      if (selected_record.CustomerID) {
        $('#contactID').val(selected_record.CustomerID)
        $('#contactType').val('Customer')
      } else if (selected_record.LeadID) {
        $('#contactID').val(selected_record.LeadID)
        $('#contactType').val('Lead')
      } else {
        $('#contactID').val(selected_record.SupplierID)
        $('#contactType').val('Supplier')
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
      if (selected_record.due_date) {
        if (selected_record.due_date.substring(0, 10) == today) {
          catg =
            `<i class="fas fa-calendar-day text-primary" style="margin-right: 5px; ${projectColorStyle}"></i>` +
            "<span class='text-primary' style='" + projectColorStyle + "'>" +
            projectName +
            "</span>";
          $(".taskDueDate").css("color", "#00a3d3");
        } else if (selected_record.due_date.substring(0, 10) > today) {
          catg =
            `<i class="fas fa-calendar-alt text-danger" style="margin-right: 5px; ${projectColorStyle}"></i>` +
            "<span class='text-danger' style='" + projectColorStyle + "'>" +
            projectName +
            "</span>";
          $(".taskDueDate").css("color", "#1cc88a");
        } else if (selected_record.due_date.substring(0, 10) < today) {
          // catg =
          //   `<i class="fas fa-inbox text-warning" style="margin-right: 5px;"></i>` +
          //   "<span class='text-warning'>Overdue</span>";
          // $(".taskDueDate").css("color", "#e74a3b");
          catg =
            `<i class="fas fa-inbox text-success" style="margin-right: 5px; ${projectColorStyle}"></i>` +
            "<span class='text-success' style='" + projectColorStyle + "'>" +
            projectName +
            "</span>";
          $(".taskDueDate").css("color", "#1cc88a");
        } else {
          catg =
            `<i class="fas fa-inbox text-success" style="margin-right: 5px; ${projectColorStyle}"></i>` +
            "<span class='text-success' style='" + projectColorStyle + "'>" +
            projectName +
            "</span>";
          $(".taskDueDate").css("color", "#1cc88a");
        }
      } else {
        catg =
          `<i class="fas fa-inbox text-success" style="margin-right: 5px; ${projectColorStyle}"></i>` +
          "<span class='text-success' style='" + projectColorStyle + "'>" +
          projectName +
          "</span>";
        $(".taskDueDate").css("color", "#1cc88a");
      }

      $(".taskLocation").html(
        `<a class="taganchor">
                ${catg}
              </a>`
      );

      if (projectName) {
        $('.taskDetailProjectName').show();
      } else {
        $('.taskDetailProjectName').hide();
      }

      $("#taskmodalNameLabel").html(selected_record.TaskName);
      $(".activityAdded").html("Added on " + moment(selected_record.MsTimeStamp).format("MMM D h:mm A"));
      // let due_date = selected_record.due_date ? moment(selected_record.due_date).format("D MMM") : "No Date";
      let due_date = selected_record.due_date ? moment(selected_record.due_date).format("dddd, Do MMMM") : "No Date";


      let todayDate = moment().format("ddd");
      let tomorrowDay = moment().add(1, "day").format("ddd");
      let nextMonday = moment(moment()).day(1 + 7).format("ddd MMM D");
      let date_component = ` <div class="dropdown btnTaskTableAction">
        <div data-toggle="dropdown" title="Reschedule Task" style="cursor:pointer;">
          <i class="far fa-calendar-plus" style="margin-right: 5px;"></i>
          <span id="edit_task_modal_due_date">${due_date}</span>
        </div>
        <div class="dropdown-menu dropdown-menu-right reschedule-dropdown-menu  no-modal"
          aria-labelledby="dropdownMenuButton" style="width: 275px;">
          <a class="dropdown-item no-modal setScheduleToday" href="#" data-id="${selected_record.ID}">
            <i class="fas fa-calendar-day text-success no-modal"
              style="margin-right: 8px;"></i>Today
            <div class="float-right no-modal" style="width: 40%; text-align: end; color: #858796;">
              ${todayDate}</div>
          </a>
          <a class="dropdown-item no-modal setScheduleTomorrow" href="#"
            data-id="${selected_record.ID}">
            <i class="fas fa-sun text-warning no-modal" style="margin-right: 8px;"></i>Tomorrow
            <div class="float-right no-modal" style="width: 40%; text-align: end; color: #858796;">
              ${tomorrowDay}</div>
          </a>
          <a class="dropdown-item no-modal setScheduleWeekend" href="#"
            data-id="${selected_record.ID}">
            <i class="fas fa-couch text-primary no-modal" style="margin-right: 8px;"></i>This Weekend
            <div class="float-right no-modal" style="width: 40%; text-align: end; color: #858796;">
              Sat</div>
          </a>
          <a class="dropdown-item no-modal setScheduleNexweek" href="#"
            data-id="${selected_record.ID}">
            <i class="fas fa-calendar-alt text-danger no-modal" style="margin-right: 8px;"></i>Next Week
            <div class="float-right no-modal" style="width: 40%; text-align: end; color: #858796;">
              ${nextMonday}
            </div>
          </a>
          <a class="dropdown-item no-modal setScheduleNodate" href="#" data-id="${selected_record.ID}">
            <i class="fas fa-ban text-secondary no-modal" style="margin-right: 8px;"></i>
            No Date</a>
          <div class="dropdown-divider no-modal"></div>
          <div class="form-group no-modal" data-toggle="tooltip" data-placement="bottom"
            title="Date format: DD/MM/YYYY" style="display:flex; margin: 6px 20px; margin-top: 0px; z-index: 99999;">
            <label style="margin-top: 6px; margin-right: 16px; width: 146px;">Select Date</label>
            <div class="input-group date no-modal" style="cursor: pointer;">
              <input type="text" id="${selected_record.ID}" class="form-control crmDatepicker no-modal"
                autocomplete="off">
              <div class="input-group-addon no-modal">
                <span class="glyphicon glyphicon-th no-modal" style="cursor: pointer;"></span>
              </div>
            </div>
          </div>
        </div>
      </div>`;

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
        onSelect: function (dateText, inst) {
          let task_id = inst.id;
          $(".crmDatepicker").val(dateText);

          templateObject.updateTaskSchedule(task_id, new Date(inst.selectedYear, inst.selectedMonth, inst.selectedDay));
        },
        onChangeMonthYear: function (year, month, inst) {
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
  }).catch(function (err) {
    $(".fullScreenSpin").css("display", "none");

    swal(err, "", "error");
    return;
  });
}
