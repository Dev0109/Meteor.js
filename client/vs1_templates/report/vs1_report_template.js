import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../../js/core-service';
import {UtilityService} from "../../utility-service";
import { SideBarService } from '../../js/sidebar-service';
import '../../lib/global/indexdbstorage.js';
import { ReportService } from "../../reports/report-service";
import TableHandler from '../../js/Table/TableHandler';
import moment from 'moment';
let sideBarService = new SideBarService();
let reportService = new ReportService();
let utilityService = new UtilityService();
Template.vs1_report_template.inheritsHooksFrom('export_import_print_display_button');

// Template.vs1_report_template.inheritsHelpersFrom('generalledger');
// Template.vs1_report_template.inheritsEventsFrom('generalledger');
// Template.vs1_report_template.inheritsHooksFrom('generalledger');

Template.vs1_report_template.onCreated(function(){
    const templateObject = Template.instance();
    templateObject.tablename = new ReactiveVar();
    templateObject.tabledisplayname = new ReactiveVar();
    templateObject.transactiondatatablerecords = new ReactiveVar([]);
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.selectedFile = new ReactiveVar();
    templateObject.report_displayfields = new ReactiveVar([]);
    templateObject.reset_data = new ReactiveVar([]);
    templateObject.isAccountingMoreOption = new ReactiveVar();
    templateObject.isTaxCodeOption = new ReactiveVar();
    // templateObject.dateAsAt = new ReactiveVar();
});

Template.vs1_report_template.onRendered(function() {
  let templateObject = Template.instance();

  templateObject.initUploadedImage = () => {
    let imageData = localStorage.getItem("Image");
    if (imageData) {
      $("#uploadedImage").attr("src", imageData);
      $("#uploadedImage").attr("width", "50%");
      $("#uploadedImage2").attr("src", imageData);
      $("#uploadedImage2").attr("width", "50%");
    }
  };

  templateObject.initUploadedImage();

  var url = FlowRouter.current().path;
  let currenttablename = "";
  let displaytablename = "";
  templateObject.isAccountingMoreOption.set(false);
  templateObject.isTaxCodeOption.set(false);
  if (url.includes("/taxsummaryreport")) {
    templateObject.isAccountingMoreOption.set(true);
    templateObject.isTaxCodeOption.set(true);
  };

  currenttablename = templateObject.data.tablename||"";
  displaytablename = templateObject.data.tabledisplayname||"";

  templateObject.tablename.set(currenttablename);
  templateObject.tabledisplayname.set(displaytablename);

  // set initial table rest_data
  templateObject.init_reset_data = function(){
    let reset_data = [];
    switch (currenttablename) {
      case "tblgeneralledger":
        reset_data = [
          { index: 1, label: 'Date', class:'colAccountNo', active: true, display: true, width: "" },
          { index: 2, label: 'Account Name', class:'colDate', active: true, display: true, width: "" },
          { index: 3, label: 'Type', class:'colClientName', active: true, display: true, width: "" },
          { index: 4, label: 'Department', class:'colType', active: false, display: true, width: "" },
          { index: 5, label: 'Debits (Ex)', class:'colDebits', active: false, display: true, width: "" },
          { index: 6, label: 'Credits (Ex)', class:'colCredit', active: false, display: true, width: "" },
          { index: 7, label: 'Debits (Inc)', class:'colDebits', active: true, display: true, width: "" },
          { index: 8, label: 'Credits (Inc)', class:'colCredit', active: true, display: true, width: "" },
          { index: 9, label: 'Amount (Ex)', class:'colDebits', active: true, display: true, width: "" },
          { index: 10, label: 'Amount (Inc)', class:'colCredit', active: true, display: true, width: "" },
          { index: 11, label: 'Product ID', class:'colCredit', active: false, display: true, width: "" },
          { index: 12, label: 'Product Description', class:'colCredit', active: false, display: true, width: "" },
          { index: 13, label: 'Client Name', class:'colCredit', active: true, display: true, width: "" },
          { index: 14, label: 'Rep Name', class:'colCredit', active: false, display: true, width: "" },
          { index: 15, label: 'Accounts', class:'colCredit', active: false, display: true, width: "" },
          { index: 16, label: 'Global Ref', class:'colCredit', active: false, display: true, width: "" },
          { index: 17, label: 'Account Number', class:'colCredit', active: true, display: true, width: "" },
          { index: 18, label: 'Tax Code', class:'colCredit', active: false, display: true, width: "150" },
          { index: 19, label: 'Tax Rate', class:'colCredit', active: false, display: true, width: "" },
          { index: 20, label: 'Class ID', class:'colCredit', active: false, display: true, width: "" },
          { index: 21, label: 'Sale ID', class:'colCredit', active: false, display: true, width: "" },
          { index: 22, label: 'Purchase Order ID', class:'colCredit', active: false, display: true, width: "" },
          { index: 23, label: 'Payment ID', class:'colCredit', active: false, display: true, width: "" },
          { index: 24, label: 'Details', class:'colCredit', active: false, display: true, width: "" },
          { index: 25, label: 'Account ID', class:'colCredit', active: false, display: true, width: "" },
          { index: 26, label: 'FixedAsset ID', class:'colCredit', active: false, display: true, width: "" },
          { index: 27, label: 'Check Number', class:'colCredit', active: false, display: true, width: "" },
          { index: 28, label: 'Memo', class:'colCredit', active: false, display: true, width: "" },
          { index: 29, label: 'Ref No', class:'colCredit', active: false, display: true, width: "" },
          { index: 30, label: 'PrepaymentID', class:'colCredit', active: false, display: true, width: "" },
        ];
        break;
      case "taxSummary":
        reset_data = [
          { index: 1, label: 'TaxCode', class:'colAccountName', active: true, display: true, width: "" },
          { index: 2, label: 'INPUTS Ex (Purchases)', class:'colAccountName', active: true, display: true, width: "" },
          { index: 3, label: 'INPUTS Inc (Purchases)', class:'colAccountName', active: true, display: true, width: "" },
          { index: 4, label: 'OUTPUTS Ex  (Sales)', class:'colAccountName', active: true, display: true, width: "" },
          { index: 5, label: 'OUTPUTS Inc (Sales)', class:'colAccountName', active: true, display: true, width: "" },
          { index: 6, label: 'Total Net', class:'colAccountName', active: true, display: true, width: "" },
          { index: 7, label: 'Total Tax', class:'colAccountName', active: true, display: true, width: "" },
          { index: 8, label: 'TaxRate', class:'colAccountName', active: true, display: true, width: "" },
          { index: 9, label: 'Total Tax1', class:'colAccountName', active: false, display: true, width: "" },
          { index: 10, label: 'ID', class:'colAccountName', active: false, display: true, width: "" },
        ]
        break;
      default:
        break;
    }
    templateObject.reset_data.set(reset_data);
  }
   templateObject.init_reset_data();

  // custom field displaysettings

  templateObject.initCustomFieldDisplaySettings = function(data, listType){
    //function initCustomFieldDisplaySettings(data, listType) {
      let templateObject = Template.instance();
      let reset_data = templateObject.reset_data.get();
      templateObject.showCustomFieldDisplaySettings(reset_data);

      try {
        /*
        getVS1Data("VS1_Customize").then(function (dataObject) {
          if (dataObject.length == 0) {
            sideBarService.getNewCustomFieldsWithQuery(parseInt(Session.get('mySessionEmployeeLoggedID')), listType).then(function (data) {
                reset_data = data.ProcessLog.Obj.CustomLayout[0].Columns;
                templateObject.showCustomFieldDisplaySettings(reset_data);
            }).catch(function (err) {
            });
          } else {
            let data = JSON.parse(dataObject[0].data);
            if(data.ProcessLog.Obj.CustomLayout.length > 0){
             for (let i = 0; i < data.ProcessLog.Obj.CustomLayout.length; i++) {
               if(data.ProcessLog.Obj.CustomLayout[i].TableName == listType){
                 reset_data = data.ProcessLog.Obj.CustomLayout[i].Columns;
                 templateObject.showCustomFieldDisplaySettings(reset_data);
               }
             }
           };
          }
        });
        */
      } catch (error) {
      }
      return;
    }
    templateObject.showCustomFieldDisplaySettings = async function(reset_data){
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

        // if(reset_data[r].active == true){
        //   $('#'+currenttablename+' .'+reset_data[r].class).removeClass('hiddenColumn');
        // }else if(reset_data[r].active == false){
        //   $('#'+currenttablename+' .'+reset_data[r].class).addClass('hiddenColumn');
        // };
        custFields.push(customData);
      }
      await templateObject.report_displayfields.set(custFields);
      $('.dataTable').resizable();
    }
    templateObject.initCustomFieldDisplaySettings("", currenttablename);

    templateObject.resetData = function (dataVal) {
        location.reload();
    };

  tableResize();
});

Template.vs1_report_template.events({
  'click .btnOpenReportSettings': async function (event, template) {
      let templateObject = Template.instance();
      let currenttranstablename = templateObject.data.tablename||"";
      $(`#${currenttranstablename} thead tr th`).each(function (index) {
        var $tblrow = $(this);
        var colWidth = $tblrow.width() || 0;
        var colthClass = $tblrow.attr('data-class') || "";
        $('.rngRange' + colthClass).val(colWidth);
      });
     $('.'+templateObject.data.tablename+'_Modal').modal('toggle');
  },
  'change .custom-range': async function(event) {
    const tableHandler = new TableHandler();
    let range = $(event.target).val()||0;
    let colClassName = $(event.target).attr("valueclass");
    await $('.' + colClassName).css('width', range);
    $('.dataTable').resizable();
  },
  'click .chkDatatable': function(event) {
      let columnDataValue = $(event.target).closest("div").find(".divcolumn").attr('valueupdate');
      if ($(event.target).is(':checked')) {
        $('.'+columnDataValue).addClass('showColumn');
        $('.'+columnDataValue).removeClass('hiddenColumn');
      } else {
        $('.'+columnDataValue).addClass('hiddenColumn');
        $('.'+columnDataValue).removeClass('showColumn');
      }
  },
  "blur .divcolumn": async function (event) {
    const templateObject = Template.instance();
    let columData = $(event.target).text();
    let columnDatanIndex = $(event.target).closest("div.columnSettings").attr("custid");
    let currenttablename = await templateObject.tablename.get()||'';
    var datable = $('#'+currenttablename).DataTable();
    var title = datable.column(columnDatanIndex).header();
    $(title).html(columData);
  },
  'click .resetTable' : async function(event){
    let templateObject = Template.instance();
    let reset_data = templateObject.reset_data.get();
    let currenttablename = await templateObject.tablename.get()||'';
      //reset_data[9].display = false;
      reset_data = reset_data.filter(redata => redata.display);
    $(".displaySettings").each(function (index) {
      let $tblrow = $(this);
      $tblrow.find(".divcolumn").text(reset_data[index].label);
      $tblrow.find(".custom-control-input").prop("checked", reset_data[index].active);

      let title = $('#'+currenttablename).find("th").eq(index);
        $(title).html(reset_data[index].label);

      if (reset_data[index].active) {
        $('.' + reset_data[index].class).addClass('showColumn');
        $('.' + reset_data[index].class).removeClass('hiddenColumn');
      } else {
        $('.' + reset_data[index].class).addClass('hiddenColumn');
        $('.' + reset_data[index].class).removeClass('showColumn');
      }
      $(".rngRange" + reset_data[index].class).val(reset_data[index].width);
      $("." + reset_data[index].class).css('width', reset_data[index].width);
    });
  },
  "click .saveTable": async function(event) {
    let lineItems = [];
    $(".fullScreenSpin").css("display", "inline-block");

    $(".displaySettings").each(function (index) {
      var $tblrow = $(this);
      var fieldID = $tblrow.attr("custid") || 0;
      var colTitle = $tblrow.find(".divcolumn").text() || "";
      var colWidth = $tblrow.find(".custom-range").val() || 0;
      var colthClass = $tblrow.find(".divcolumn").attr("valueupdate") || "";
      var colHidden = false;
      if ($tblrow.find(".custom-control-input").is(":checked")) {
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
    lineItems.sort((a,b) => a.index - b.index);
      let erpGet = erpDb();
      let tableName = await templateObject.tablename.get()||'';
      let employeeId = parseInt(Session.get('mySessionEmployeeLoggedID'))||0;
      let added = await sideBarService.saveNewCustomFields(erpGet, tableName, employeeId, lineItems);

      if(added){
        sideBarService.getNewCustomFieldsWithQuery(parseInt(Session.get('mySessionEmployeeLoggedID')),'').then(function (dataCustomize) {
            addVS1Data('VS1_Customize', JSON.stringify(dataCustomize));
        }).catch(function (err) {
        });
        $(".fullScreenSpin").css("display", "none");
        swal({
          title: 'SUCCESS',
          text: "Display settings is updated!",
          type: 'success',
          showCancelButton: false,
          confirmButtonText: 'OK'
        }).then((result) => {
            if (result.value) {
                $('#'+tableName+'_Modal').modal('hide');
            }
        });
      }else{
        $(".fullScreenSpin").css("display", "none");
      }

    },
});

Template.vs1_report_template.helpers({
  loggedCompany: () => {
      return localStorage.getItem('mySession') || '';
  },
  isAccountingMoreOption: () => {
    return Template.instance().isAccountingMoreOption.get();;
  },
  companyname: () =>{
    return loggedCompany;
  },
  isTaxCodeOption: () => {
    return Template.instance().isTaxCodeOption.get();;
  },

  // tablename: () => {
  //     return Template.instance().tablename.get();
  // },
  // tabledisplayname: () => {
  //     return Template.instance().tabledisplayname.get();
  // },
  report_displayfields: () => {
    return Template.instance().report_displayfields.get();
  },
  // dateAsAt: () => {
  //   return Template.instance().dateAsAt.get() || "-";
  // },
});
