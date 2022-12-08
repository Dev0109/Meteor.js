import "../../../lib/global/indexdbstorage.js";
import { SideBarService } from '../../../js/sidebar-service';

Template.crm_top_menu.onCreated(function () {
  let templateObject = Template.instance();
  templateObject.displayfields = new ReactiveVar([]);
  templateObject.reset_data = new ReactiveVar([]);
});

Template.crm_top_menu.onRendered(function () {
  const templateObject = Template.instance();
  let sideBarService = new SideBarService();

  // set initial table rest_data
  templateObject.init_reset_data = function () {
    let reset_data = [
      // { index: 0, label: '#ID', class: 'ID', active: false, display: true, width: "" },
      { index: 0, label: 'Priority', class: 'colPriority', active: true, display: true, width: "35" },
      { index: 1, label: 'Contact', class: 'colContact', active: true, display: true, width: "126" },
      { index: 2, label: 'Date', class: 'colDate', active: true, display: true, width: "100" },
      { index: 3, label: 'Task', class: 'colTaskName', active: true, display: true, width: "200" },
      { index: 4, label: 'Description', class: 'colTaskDesc', active: true, display: true, width: "" },
      { index: 5, label: 'Labels', class: 'colTaskLabels', active: true, display: true, width: "100" },
      { index: 6, label: 'Project', class: 'colTaskProjects', active: true, display: true, width: "200" },
      { index: 7, label: 'Status', class: 'colStatus', active: true, display: true, width: "100" },
    ];

    let templateObject = Template.instance();
    templateObject.reset_data.set(reset_data);
  }
  templateObject.init_reset_data();
  // set initial table rest_data

  // custom field displaysettings
  templateObject.initCustomFieldDisplaySettings = function (listType) {
    let reset_data = templateObject.reset_data.get();
    templateObject.showCustomFieldDisplaySettings(reset_data, listType);

    try {
      getVS1Data("VS1_Customize").then(function (dataObject) {
        if (dataObject.length == 0) {
          sideBarService.getNewCustomFieldsWithQuery(parseInt(Session.get('mySessionEmployeeLoggedID')), listType).then(function (data) {
            reset_data = data.ProcessLog.Obj.CustomLayout[0].Columns;
            templateObject.showCustomFieldDisplaySettings(reset_data, listType);
          }).catch(function (err) {
          });
        } else {
          let data = JSON.parse(dataObject[0].data);
          if(data.ProcessLog.Obj.CustomLayout.length > 0){
           for (let i = 0; i < data.ProcessLog.Obj.CustomLayout.length; i++) {
             if(data.ProcessLog.Obj.CustomLayout[i].TableName == listType){
               reset_data = data.ProcessLog.Obj.CustomLayout[i].Columns;
               templateObject.showCustomFieldDisplaySettings(reset_data, listType);
             }
           }
         };
          // handle process here
        }
      });
    } catch (error) {
    }
    return;
  }

  templateObject.showCustomFieldDisplaySettings = async function(reset_data, currenttablename){
    let custFields = [];
    let customData = {};
    let customFieldCount = reset_data.length;

    for (let r = 0; r < customFieldCount; r++) {
      customData = {
        active: reset_data[r].active,
        id: reset_data[r].index,
        custfieldlabel: reset_data[r].label,
        class: reset_data[r].class,
        display: reset_data[r].display,
        width: reset_data[r].width ? reset_data[r].width : ''
      };
      if(reset_data[r].active == true){
        $('#'+currenttablename+' .'+reset_data[r].class).removeClass('hiddenColumn');
      }else if(reset_data[r].active == false){
        $('#'+currenttablename+' .'+reset_data[r].class).addClass('hiddenColumn');
      };
      custFields.push(customData);
    }
    templateObject.displayfields.set(custFields);
  }

  templateObject.initCustomFieldDisplaySettings("tblAllTaskDatatable");
  // set initial table rest_data  //
});

Template.crm_top_menu.events({
  "click .btnOpenSettings": function (event) {
    // let currentTabID = Template.instance().currentTabID.get();
    // let tableName = "";

    // switch (currentTabID) {
    //   case "todayTab-tab":
    //     tableName = "tblTodayTaskDatatable";
    //     break;
    //   case "upcomingTab-tab":
    //     tableName = "tblUpcomingTaskDatatable";
    //     break;
    //   case "projectsTab-tab":
    //     tableName = "tblNewProjectsDatatable";
    //     break;
    //   case "filterLabelsTab-tab":
    //     tableName = "tblLabels";
    //     break;
    //   default:
    //     tableName = "tblAllTaskDatatable";
    //     break;
    // }
  },

  // custom field displaysettings
  "click .resetDisplaySetting": async function (event) {
    let templateObject = Template.instance();
    let reset_data = templateObject.reset_data.get();
    reset_data = reset_data.filter(redata => redata.display);

    $(".customDisplaySettings").each(function (index) {
      let $tblrow = $(this);
      $tblrow.find(".divcolumn").text(reset_data[index].label);
      $tblrow
        .find(".custom-display-input")
        .prop("checked", reset_data[index].active);

      if (reset_data[index].active) {
        $('.col' + reset_data[index].class).addClass('showColumn');
        $('.col' + reset_data[index].class).removeClass('hiddenColumn');
      } else {
        $('.col' + reset_data[index].class).addClass('hiddenColumn');
        $('.col' + reset_data[index].class).removeClass('showColumn');
      }
      $(".rngRange" + reset_data[index].class).val(reset_data[index].width);
    });
  },
  "click .saveDisplaySetting": async function (event) {
    let lineItems = [];
    $(".fullScreenSpin").css("display", "inline-block");

    $(".customDisplaySettings").each(function (index) {
      var $tblrow = $(this);
      var fieldID = $tblrow.attr("custid") || 0;
      var colTitle = $tblrow.find(".divcolumn").text() || "";
      var colWidth = $tblrow.find(".custom-range").val() || 0;
      var colthClass = $tblrow.find(".divcolumn").attr("valueupdate") || "";
      var colHidden = false;
      if ($tblrow.find(".custom-display-input").is(":checked")) {
        colHidden = true;
      } else {
        colHidden = false;
      }
      let lineItemObj = {
        index: parseInt(fieldID),
        label: colTitle,
        active: colHidden,
        width: parseInt(colWidth),
        class: colthClass,
        display: true
      };

      lineItems.push(lineItemObj);
    });

    let templateObject = Template.instance();
    let reset_data = templateObject.reset_data.get();
    reset_data = reset_data.filter(redata => redata.display == false);
    lineItems.push(...reset_data);
    lineItems.sort((a, b) => a.index - b.index);

    try {
      let erpGet = erpDb();
      let tableName = "tblAllTaskDatatable";
      let employeeId = parseInt(Session.get('mySessionEmployeeLoggedID')) || 0;

      let sideBarService = new SideBarService();
      let added = await sideBarService.saveNewCustomFields(erpGet, tableName, employeeId, lineItems);
      $(".fullScreenSpin").css("display", "none");
      if (added) {
        sideBarService.getNewCustomFieldsWithQuery(parseInt(Session.get('mySessionEmployeeLoggedID')),'').then(function (dataCustomize) {
            addVS1Data('VS1_Customize', JSON.stringify(dataCustomize));
        });
        swal({
          title: 'SUCCESS',
          text: "Display settings is updated!",
          type: 'success',
          showCancelButton: false,
          confirmButtonText: 'OK'
        }).then((result) => {
          if (result.value) {
            $('#displaySettingsModal2').modal('hide');
          }
        });
      } else {
        swal("Something went wrong!", "", "error");
      }
    } catch (error) {
      $(".fullScreenSpin").css("display", "none");
      swal("Something went wrong!", "", "error");
    }
  },

  'change .custom-range': function (event) {
    let range = $(event.target).val();
    let colClassName = $(event.target).attr("valueclass");
    $('.col' + colClassName).css('width', range);
  },

  'click .custom-display-input': function (event) {
    let colClassName = $(event.target).attr("id");
    if ($(event.target).is(':checked')) {
      $('.col' + colClassName).addClass('showColumn');
      $('.col' + colClassName).removeClass('hiddenColumn');
    } else {
      $('.col' + colClassName).addClass('hiddenColumn');
      $('.col' + colClassName).removeClass('showColumn');
    }
  },

});

Template.crm_top_menu.helpers({
  // custom fields displaysettings
  displayfields: () => {
    return Template.instance().displayfields.get();
  },
});
