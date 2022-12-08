import {VS1ChartService} from "../vs1charts-service";
import 'jQuery.print/jQuery.print.js';
import {UtilityService} from "../../utility-service";
import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../../js/core-service';
import { SideBarService } from "../../js/sidebar-service";
let _ = require('lodash');
let vs1chartService = new VS1ChartService();
let utilityService = new UtilityService();
let sideBarService = new SideBarService();
Template.accountsoverview.inheritsHooksFrom('non_transactional_list');
Template.bankaccountschart.onCreated(() => {
    const templateObject = Template.instance();
    templateObject.records = new ReactiveVar([]);
    templateObject.dateAsAt = new ReactiveVar();
    templateObject.deptrecords = new ReactiveVar();

    templateObject.salesperc = new ReactiveVar();
    templateObject.expenseperc = new ReactiveVar();
    templateObject.salespercTotal = new ReactiveVar();
    templateObject.expensepercTotal = new ReactiveVar();
    templateObject.topTenData = new ReactiveVar([]);
});

Template.bankaccountschart.onRendered(() => {

    const templateObject = Template.instance();

    let topTenData1 = [];
    let topTenSuppData1 = [];
    let topData = this;
  setTimeout(function() {
    $(".bankaccountschart .portlet").removeClass("ui-widget ui-widget-content");
  }, 500);


    templateObject.setReconciliationListData = function(data) {

      setTimeout(function() {
      $(".tblBankAccountChartList").DataTable({
          sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
          pageLength: initialDatatableLoad,
          lengthMenu: [
              [initialDatatableLoad, -1],
              [initialDatatableLoad, "All"],
          ],
          select: true,
          destroy: true,
          colReorder: true,
          info: true,
          responsive: true,
          fnDrawCallback: function(oSettings) {
              // $('.dataTables_paginate').css('display', 'none');
          },
          language: { search: "",searchPlaceholder: "Search List..." },
          fnInitComplete: function() {
              $(
                  "<button class='btn btn-primary btnAddNewTaxRate' data-dismiss='modal' data-toggle='modal' data-target='#newTaxRateModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>"
              ).insertAfter(".tblDashboardTaxRate_filter");
              $(
                  "<button class='btn btn-primary btnRefreshTax' type='button' id='btnRefreshTax' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>"
              ).insertAfter(".tblDashboardTaxRate_filter");
          },
      });
      $('div.dataTables_filter input').addClass('form-control form-control-sm');
      }, 10);
    }

    templateObject.getAllReconData = function () {
      var currentBeginDate = new Date();
      var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
      let fromDateMonth = (currentBeginDate.getMonth() + 1);
      let fromDateDay = currentBeginDate.getDate();
      if((currentBeginDate.getMonth()+1) < 10){
          fromDateMonth = "0" + (currentBeginDate.getMonth()+1);
      }else{
        fromDateMonth = (currentBeginDate.getMonth()+1);
      }

      if(currentBeginDate.getDate() < 10){
          fromDateDay = "0" + currentBeginDate.getDate();
      }
      var toDate = currentBeginDate.getFullYear()+ "-" +(fromDateMonth) + "-"+(fromDateDay);
      let prevMonth11Date = (moment().subtract(reportsloadMonths, 'months')).format("YYYY-MM-DD");

        getVS1Data('TReconciliationList').then(function (dataObject) {
            if(dataObject.length == 0){

              sideBarService.getAllTReconcilationListData(prevMonth11Date,toDate, true,initialReportLoad,0).then(function (data) {
                //addVS1Data('TReconciliationList',JSON.stringify(data));
                  templateObject.setReconciliationListData(data);
              }).catch(function (err) {
                  $('.fullScreenSpin').css('display','none');
              });
            }else{
                let data = JSON.parse(dataObject[0].data);
                templateObject.setReconciliationListData(data);

            }
        }).catch(function (err) {

          sideBarService.getAllTReconcilationListData(prevMonth11Date,toDate, true,initialReportLoad,0).then(function (data) {
            //addVS1Data('TReconciliationList',JSON.stringify(data));
              templateObject.setReconciliationListData(data);
          }).catch(function (err) {
              $('.fullScreenSpin').css('display','none');
          });
        });
    }
    templateObject.getAllReconData();


});

Template.bankaccountschart.events({
  // 'click #hideearnings': function () {
  //  let check = localStorage.getItem("earningschat") || true;
  //   if(check == "true" || check == true) {
  //      // localStorage.setItem("earningschat",false);
  //      $("#hideearnings").text("Show");
  //   } else if($("#showearningschat").hasClass('hideearningschat')) {
  //      $("#hideearnings").text("Hide");
  //   }
  // }

})

Template.bankaccountschart.helpers({
    dateAsAt: () => {
        return Template.instance().dateAsAt.get() || '-';
    },
    topTenData: () => {
        return Template.instance().topTenData.get();
    },
    Currency: () => {
        return Currency;
    },
    companyname: () => {
        return loggedCompany;
    },
    salesperc: () => {
        return Template.instance().salesperc.get() || 0;
    },
    expenseperc: () => {
        return Template.instance().expenseperc.get() || 0;
    },
    salespercTotal: () => {
        return Template.instance().salespercTotal.get() || 0;
    },
    expensepercTotal: () => {
        return Template.instance().expensepercTotal.get() || 0;
    }
});
Template.registerHelper('equals', function (a, b) {
    return a === b;
});

Template.registerHelper('notEquals', function (a, b) {
    return a != b;
});

Template.registerHelper('containsequals', function (a, b) {
    return (a.indexOf(b) >= 0);
});
