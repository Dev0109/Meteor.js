import { CRMService } from '../../crm-service';
let crmService = new CRMService();

Template.projectListPop.onCreated(function() {
    let templateObject = Template.instance();
    templateObject.view_project_completed = new ReactiveVar("NO");
    templateObject.tprojectlist = new ReactiveVar([]);
    templateObject.all_projects = new ReactiveVar([]);
    templateObject.active_projects = new ReactiveVar([]);
    templateObject.deleted_projects = new ReactiveVar([]);
    templateObject.favorite_projects = new ReactiveVar([]);
    templateObject.projecttasks = new ReactiveVar([]);
});

Template.projectListPop.onRendered(function() {
    let templateObject = Template.instance();
    // projects tab -------------------
    templateObject.getInitTProjectList = function() {
        getVS1Data("TCRMProjectList").then(function(dataObject) {
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
        }).catch(function(err) {
            templateObject.getTProjectList();
        });
    };

    templateObject.getTProjectList = function() {
        var url = FlowRouter.current().path;
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

    templateObject.initProjectsTable = function(search = null) {
        let projectArray = templateObject.makeProjectTableRows(
            templateObject.active_projects.get()
        );
        let view_project_completed = templateObject.view_project_completed.get();
        let btnFilterName = view_project_completed == "NO" ? "View All" : "Hide Deleted";

        $("#tblProjectsDatatablePop").DataTable({
            data: projectArray,
            columnDefs: [{
                    targets: 0,
                    className: "colPrjectDate",
                    createdCell: function(td, cellData, rowData, row, col) {
                        $(td).closest("tr").attr("data-id", rowData[5]);
                        $(td).attr("data-id", rowData[5]);
                    },
                },
                {
                    targets: 1,
                    className: "colProjectName",
                    createdCell: function(td, cellData, rowData, row, col) {
                        $(td).attr("data-id", rowData[5]);
                    },
                },
                {
                    targets: 2,
                    className: "colProjectDesc",
                    createdCell: function(td, cellData, rowData, row, col) {
                        $(td).attr("data-id", rowData[5]);
                    },
                },
                {
                    targets: 3,
                    className: "colProjectStatus",
                    createdCell: function(td, cellData, rowData, row, col) {
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
                    createdCell: function(td, cellData, rowData, row, col) {
                        $(td).attr("data-id", rowData[5]);
                    },
                },
            ],
            sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
            buttons: [{
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
                            body: function(data, row, column) {
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
            order: [
                [0, "desc"]
            ],
            action: function() {
                $("#tblProjectsDatatablePop").DataTable().ajax.reload();
            },
            language: { search: "", searchPlaceholder: "Search List..." },
            fnInitComplete: function() {
                $(
                    "<button class='btn btn-primary btnSearchCrm btnSearchProjectsDatatable' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button><button class='btn btn-primary btnViewProjectCompleted' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='far fa-check-circle' style='margin-right: 5px'></i><span id='lblViewProjectCompleted'>" +
                    btnFilterName +
                    "</span></button>"
                ).insertAfter("#tblProjectsDatatablePop_filter");
            },
        });
        $("#tblProjectsDatatablePop_filter input").val(search);
    };

    templateObject.getInitTProjectList();

    templateObject.makeProjectTableRows = function(task_array) {
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
});

Template.projectListPop.events({

});

Template.projectListPop.helpers({});