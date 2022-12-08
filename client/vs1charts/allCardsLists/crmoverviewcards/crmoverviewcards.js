import "../../../lib/global/indexdbstorage";
import { CRMService } from "../../../crm/crm-service";
let crmService = new CRMService();

Template.crmoverviewcards.onCreated(function () {
  let templateObject = Template.instance();
});

Template.crmoverviewcards.onRendered(function () {
  let templateObject = Template.instance();

  templateObject.getInitialAllTaskList = function () {
    getVS1Data("TCRMTaskList").then(function (dataObject) {
      if (dataObject.length == 0) {
        templateObject.getAllTaskList();
      } else {
        let data = JSON.parse(dataObject[0].data);
        let today = moment().format("YYYY-MM-DD");
        let all_records = data.tprojecttasks;

        var url = FlowRouter.current().path;
        var new_url = new URL(window.location.href);
        let employeeID = new_url.searchParams.get("id") ? new_url.searchParams.get("id") : '';
        if (url.includes("/employeescard")) {
          employeeID = $('#edtCustomerCompany').val() ? $('#edtCustomerCompany').val() : '';
        }

        if (employeeID) {
          all_records = all_records.filter((item) => item.fields.Completed == false && item.fields.EnteredBy == employeeID);
        } else {
          all_records = all_records.filter((item) => item.fields.Completed == false);
        }

        let today_records = all_records.filter((item) => item.fields.due_date.substring(0, 10) == today);
        let upcoming_records = all_records.filter((item) => item.fields.due_date.substring(0, 10) > today);
        // let overdue_records = all_records.filter((item) => !item.fields.due_date || item.fields.due_date.substring(0, 10) < today);

        $(".crm_all_count").text(all_records.length);
        $(".crm_today_count").text(today_records.length);
        $(".crm_upcoming_count").text(upcoming_records.length);

      }
    }).catch(function (err) {
      templateObject.getAllTaskList();
    });
  };

  templateObject.getAllTaskList = function () {

    var url = FlowRouter.current().path;
    var new_url = new URL(window.location.href);
    let employeeID = new_url.searchParams.get("id") ? new_url.searchParams.get("id") : '';
    if (url.includes("/employeescard")) {
      employeeID = $('#edtCustomerCompany').val() ? $('#edtCustomerCompany').val() : '';
    }

    crmService.getAllTaskList(employeeID).then(function (data) {
      if (data.tprojecttasks && data.tprojecttasks.length > 0) {
        let today = moment().format("YYYY-MM-DD");
        let all_records = data.tprojecttasks;
        all_records = all_records.filter((item) => item.fields.Completed == false);

        let today_records = all_records.filter((item) => item.fields.due_date.substring(0, 10) == today);
        let upcoming_records = all_records.filter((item) => item.fields.due_date.substring(0, 10) > today);

        $(".crm_all_count").text(all_records.length);
        $(".crm_today_count").text(today_records.length);
        $(".crm_upcoming_count").text(upcoming_records.length);

        addVS1Data("TCRMTaskList", JSON.stringify(data));
      } else {
        $(".crm_all_count").text(0);
        $(".crm_today_count").text(0);
        $(".crm_upcoming_count").text(0);
      }
    }).catch(function (err) {
      $(".fullScreenSpin").css("display", "none");
    });
  };

  templateObject.getInitialAllTaskList();

  // labels tab ----------------- //

  // projects tab -------------------
  templateObject.getInitTProjectList = function () {
    getVS1Data("TCRMProjectList").then(function (dataObject) {
      if (dataObject.length == 0) {
        templateObject.getTProjectList();
      } else {
        let data = JSON.parse(dataObject[0].data);
        if (data.tprojectlist && data.tprojectlist.length > 0) {
          let all_projects = data.tprojectlist;

          var url = FlowRouter.current().path;
          var new_url = new URL(window.location.href);
          let employeeID = new_url.searchParams.get("id") ? new_url.searchParams.get("id").trim() : '';
          if (url.includes("/employeescard")) {
            employeeID = $('#edtCustomerCompany').val() ? $('#edtCustomerCompany').val().trim() : '';
          }

          if (employeeID) {
            all_projects = all_projects.filter((proj) => proj.fields.ID != 11 && proj.fields.EnteredBy == employeeID);
          } else {
            all_projects = all_projects.filter((proj) => proj.fields.ID != 11);
          }

          let active_projects = all_projects.filter((project) => project.fields.Active == true);
          $(".crm_project_count").html(active_projects.length);
        } else {
          $(".crm_project_count").html(0);
        }
      }
    }).catch(function (err) {
      templateObject.getTProjectList();
    });
  };

  templateObject.getTProjectList = function () {
    var url = FlowRouter.current().path;
    var new_url = new URL(window.location.href);
    let employeeID = new_url.searchParams.get("id") ? new_url.searchParams.get("id") : '';
    if (url.includes("/employeescard")) {
      employeeID = $('#edtCustomerCompany').val() ? $('#edtCustomerCompany').val() : '';
    }

    crmService.getTProjectList(employeeID).then(function (data) {
      if (data.tprojectlist && data.tprojectlist.length > 0) {
        let all_projects = data.tprojectlist;

        all_projects = all_projects.filter((proj) => proj.fields.ID != 11);
        let active_projects = all_projects.filter((project) => project.fields.Active == true);

        $(".crm_project_count").html(active_projects.length);
      } else {
        $(".crm_project_count").html(0);
      }
      addVS1Data("TCRMProjectList", JSON.stringify(data));
    }).catch(function (err) {

    });
  };

  templateObject.getInitTProjectList();

})

Template.crmoverviewcards.events({

  "click .menu_all_task": function (e) {
    var url = FlowRouter.current().path;
    var new_url = new URL(window.location.href);

    if (url.includes("/employeescard")) {
      let employeeID = $('#edtCustomerCompany').val() ? $('#edtCustomerCompany').val() : '';
      FlowRouter.go("/crmoverview?id=" + employeeID);
    } else {
      if (new_url.searchParams.get("id")) {
        let employeeID = new_url.searchParams.get("id");
        FlowRouter.go("/crmoverview?id=" + employeeID);
      } else {
        FlowRouter.go("/crmoverview");
      }
    }
  },

  "click .menu_today": function (e) {
    // let employeeID = Session.get("mySessionEmployeeLoggedID");
    // var url = FlowRouter.current().path;
    // url = new URL(window.location.href);
    // employeeID = url.searchParams.get("id") ? url.searchParams.get("id") : employeeID;
    // FlowRouter.go("/crmoverview?tabview=today&id=" + employeeID);

    var url = FlowRouter.current().path;
    var new_url = new URL(window.location.href);

    if (url.includes("/employeescard")) {
      let employeeID = $('#edtCustomerCompany').val() ? $('#edtCustomerCompany').val() : '';
      FlowRouter.go("/crmoverview?tabview=today&id=" + employeeID);
    } else {
      if (new_url.searchParams.get("id")) {
        let employeeID = new_url.searchParams.get("id");
        FlowRouter.go("/crmoverview?tabview=today&id=" + employeeID);
      } else {
        FlowRouter.go("/crmoverview?tabview=today");
      }
    }
  },

  "click .menu_upcoming": function (e) {
    // let employeeID = Session.get("mySessionEmployeeLoggedID");
    // var url = FlowRouter.current().path;
    // url = new URL(window.location.href);
    // employeeID = url.searchParams.get("id") ? url.searchParams.get("id") : employeeID;
    // FlowRouter.go("/crmoverview?tabview=upcoming&id=" + employeeID);

    var url = FlowRouter.current().path;
    var new_url = new URL(window.location.href);

    if (url.includes("/employeescard")) {
      let employeeID = $('#edtCustomerCompany').val() ? $('#edtCustomerCompany').val() : '';
      FlowRouter.go("/crmoverview?tabview=upcoming&id=" + employeeID);
    } else {
      if (new_url.searchParams.get("id")) {
        let employeeID = new_url.searchParams.get("id");
        FlowRouter.go("/crmoverview?tabview=upcoming&id=" + employeeID);
      } else {
        FlowRouter.go("/crmoverview?tabview=upcoming");
      }
    }
  },

  "click .menu_project": function (e) {
    // let employeeID = Session.get("mySessionEmployeeLoggedID");
    // var url = FlowRouter.current().path;
    // url = new URL(window.location.href);
    // employeeID = url.searchParams.get("id") ? url.searchParams.get("id") : employeeID;
    // FlowRouter.go("/crmoverview?tabview=projects&id=" + employeeID);

    var url = FlowRouter.current().path;
    var new_url = new URL(window.location.href);

    if (url.includes("/employeescard")) {
      let employeeID = $('#edtCustomerCompany').val() ? $('#edtCustomerCompany').val() : '';
      FlowRouter.go("/crmoverview?tabview=projects&id=" + employeeID);
    } else {
      if (new_url.searchParams.get("id")) {
        let employeeID = new_url.searchParams.get("id");
        FlowRouter.go("/crmoverview?tabview=projects&id=" + employeeID);
      } else {
        FlowRouter.go("/crmoverview?tabview=projects");
      }
    }
  },

});
