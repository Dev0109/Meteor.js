// @ts-nocheck
import {Session} from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../../js/core-service';
import {UtilityService} from "../../utility-service";
import '../../lib/global/indexdbstorage.js';
import { SideBarService } from '../../js/sidebar-service';
import TableHandler from '../../js/Table/TableHandler';
import FxGlobalFunctions from '../../packages/currency/FxGlobalFunctions';
import { template } from 'lodash';
let sideBarService = new SideBarService();
let utilityService = new UtilityService();

export const foreignCols = ["Unit Price (Ex)", "Tax Amt", "Amount (Ex)", "Amount (Inc)", "Unit Price (Inc)", "Cost Price"];

//Template.transaction_line.inheritsHelpersFrom('new_invoice');
// Template.new_invoice.inheritsEventsFrom('transaction_line');
// Template.new_invoice.inheritsHooksFrom('transaction_line');

Template.transaction_line.onCreated(function(){
  const templateObject = Template.instance();
  templateObject.isForeignEnabled = new ReactiveVar(false);
  templateObject.displayfields = new ReactiveVar([]);
  templateObject.reset_data = new ReactiveVar([]);
  templateObject.initialTableWidth = new ReactiveVar('');
  templateObject.monthArr = new ReactiveVar();
  templateObject.plusArr = new ReactiveVar();
});
Template.transaction_line.onRendered(function() {
  const plusArr = [];
  const monthArr = [];
  let isGreenTrack = Session.get('isGreenTrack');
  let regionData = Session.get('ERPLoggedCountry');
  let recordObj = null;
  if(isGreenTrack) {
    $.get("/GreentrackModules.json").success(function (data) {
        for (let i = 0; i < data.tvs1licenselevelsnmodules.length; i++) {

            if (data.tvs1licenselevelsnmodules[i].Region == regionData) {
                recordObj = {
                    type: data.tvs1licenselevelsnmodules[i].TYPE,
                    region: data.tvs1licenselevelsnmodules[i].Region,
                    licenselevel: data.tvs1licenselevelsnmodules[i].LicenseLevel,
                    licenseLeveldescprion: data.tvs1licenselevelsnmodules[i].LicenseLevelDescprion,
                    moduleId: data.tvs1licenselevelsnmodules[i].ModuleId,
                    moduleName: data.tvs1licenselevelsnmodules[i].ModuleName,
                    moduledescription: data.tvs1licenselevelsnmodules[i].moduledescription,
                    isExtra: data.tvs1licenselevelsnmodules[i].IsExtra,
                    discountfrom: data.tvs1licenselevelsnmodules[i].Discountfrom,
                    discountto: data.tvs1licenselevelsnmodules[i].Discountto,
                    pricenocurrency: data.tvs1licenselevelsnmodules[i].Price || 0,
                    price: utilityService.modifynegativeCurrencyFormat(data.tvs1licenselevelsnmodules[i].Price) || 0,
                    discount: data.tvs1licenselevelsnmodules[i].discount,
                };
                if (data.tvs1licenselevelsnmodules[i].LicenseLevelDescprion == "Xero") {
                    if (data.tvs1licenselevelsnmodules[i].ModuleName != "" && data.tvs1licenselevelsnmodules[i].IsExtra == false) {
                        plusArr.push(recordObj);
                    }
                }
               
            }

        };
        templateObject.plusArr.set(plusArr);
    });
  } else { 
    $.get("MasterVS1Pricing.json").success(async function (data) {
        for (let i = 0; i < data.tvs1licenselevelsnmodules.length; i++) {

            if (data.tvs1licenselevelsnmodules[i].Region == regionData) {
                recordObj = {
                    type: data.tvs1licenselevelsnmodules[i].TYPE,
                    region: data.tvs1licenselevelsnmodules[i].Region,
                    licenselevel: data.tvs1licenselevelsnmodules[i].LicenseLevel,
                    licenseLeveldescprion: data.tvs1licenselevelsnmodules[i].LicenseLevelDescprion,
                    moduleId: data.tvs1licenselevelsnmodules[i].ModuleId,
                    moduleName: data.tvs1licenselevelsnmodules[i].ModuleName,
                    moduledescription: data.tvs1licenselevelsnmodules[i].moduledescription,
                    isExtra: data.tvs1licenselevelsnmodules[i].IsExtra,
                    discountfrom: data.tvs1licenselevelsnmodules[i].Discountfrom,
                    discountto: data.tvs1licenselevelsnmodules[i].Discountto,
                    discount: data.tvs1licenselevelsnmodules[i].discount,
                };
                if ((data.tvs1licenselevelsnmodules[i].ModuleName != "") && (data.tvs1licenselevelsnmodules[i].IsExtra == true) && (data.tvs1licenselevelsnmodules[i].IsMonthly == true)) {
                    monthArr.push(recordObj);
                }

                if (data.tvs1licenselevelsnmodules[i].LicenseLevelDescprion == "PLUS") {
                    if (data.tvs1licenselevelsnmodules[i].ModuleName != "" && data.tvs1licenselevelsnmodules[i].IsExtra == false) {
                        plusArr.push(recordObj);
                    }
                }
            }
        };
        let purchaedAdModuleList = [];
            let additionModuleSettings = await getVS1Data('vscloudlogininfo');
            if( additionModuleSettings.length > 0 ){
                let additionModules = additionModuleSettings[0].data.ProcessLog.Modules.Modules;
                if( additionModules.length > 0 ){
                    let adModulesList = additionModules.filter((item) => {
                        if( item.ExtraModules == true && item.ModuleActive == true ){
                            return item;
                        }
                    });
                    if( adModulesList.length > 0 ){
                        for (const item of adModulesList) {
                            purchaedAdModuleList.push(item.ModuleName)
                        }
                    }
                }
            }
        templateObject.plusArr.set(plusArr);
        var monthResult = [];
        $.each(monthArr, function (i, e) {
            var matchingItemsMonth = $.grep(monthResult, function (itemMonth) {
                return itemMonth.moduleName === e.moduleName;
            });
            e.isPurchased = false
            if (matchingItemsMonth.length === 0) {
                if( purchaedAdModuleList.includes(monthArr[i].moduleName) == true ){
                    e.isPurchased = true
                }
                monthResult.push(e);
            }
        });
        templateObject.monthArr.set(monthResult);
    });
  };
  let templateObject = Template.instance();
  let currenttranstablename = templateObject.data.tablename||"";
  // set initial table rest_data
  templateObject.init_reset_data = function() {
      let reset_data = [
          { index: 0, label: "Product Name", class: "ProductName", width: "300", active: true, display: true },
          { index: 1, label: "Description", class: "Description", width: "", active: true, display: true },
          { index: 2, label: "Qty", class: "Qty", width: "50", active: true, display: true },
          { index: 3, label: "Ordered", class: "Ordered", width: "75", active: true, display: true },
          { index: 4, label: "Shipped", class: "Shipped", width: "75", active: true, display: true },
          { index: 5, label: "BO", class: "BackOrder", width: "75", active: true, display: true },
          { index: 6, label: "Unit Price (Ex)", class: "UnitPriceEx", width: "125", active: true, display: true },
          { index: 7, label: "Unit Price (Inc)", class: "UnitPriceInc", width: "130", active: false, display: true },
          { index: 8, label: "Disc %", class: "Discount", width: "75", active: true, display: true },
          { index: 9, label: "Cost Price", class: "CostPrice", width: "110", active: false, display: true },
          { index: 10, label: "SalesLines CustField1", class: "SalesLinesCustField1", width: "110", active: false, display: true },
          { index: 11, label: "Tax Rate", class: "TaxRate", width: "91", active: false, display: true },
          { index: 12, label: "Tax Code", class: "TaxCode", width: "95", active: true, display: true },
          { index: 13, label: "Tax Amt", class: "TaxAmount", width: "75", active: true, display: true },
          { index: 14, label: "Serial/Lot No", class: "SerialNo", width: "100", active: true, display: true },
          { index: 15, label: "Amount (Ex)", class: "AmountEx", width: "120", active: true, display: true },
          { index: 16, label: "Amount (Inc)", class: "AmountInc", width: "120", active: false, display: true },
          { index: 17, label: "Units", class: "Units", width: "95", active: false, display: true },
      ];

      let isBatchSerialNoTracking = Session.get("CloudShowSerial") || false;
      let isBOnShippedQty = Session.get("CloudSalesQtyOnly");
      if (isBOnShippedQty) {
          reset_data[2].display = true;
          reset_data[3].display = false;
          reset_data[4].display = false;
          reset_data[5].display = false;
      } else {
          reset_data[2].display = false;
          reset_data[3].display = true;
          reset_data[4].display = true;
          reset_data[5].display = true;
      }
      if (isBatchSerialNoTracking) {
          reset_data[14].display = true;
      } else {
          reset_data[14].display = false;
      }
      let templateObject = Template.instance();
      templateObject.reset_data.set(reset_data);
  }
  templateObject.init_reset_data();
  // set initial table rest_data        let data = reset_data.slice();
  templateObject.insertItemWithLabel = (x, a, b) => {
    var data = [...x];
    var aPos = data.findIndex((x) => x.label === a);
    var bPos = data.findIndex(x => x.label === b);
    if(aPos === -1 || bPos === -1) return data;
    data[bPos] = {...data[bPos], index: aPos + 1};
    for(var i = aPos + 1; i < bPos; i++) data[i] = {...data[i], index:data[i].index + 1}
    return data.sort((a,b) => a.index - b.index);
    }
  // custom field displaysettings
  templateObject.initCustomFieldDisplaySettings = function(data, listType) {
     
      let templateObject = Template.instance();
      let reset_data = templateObject.reset_data.get();
      reset_data = templateObject.insertItemWithLabel(reset_data, 'BO','Serial/Lot No');
      templateObject.showCustomFieldDisplaySettings(reset_data);
      try {

          getVS1Data("VS1_Customize").then(function(dataObject) {
              if (dataObject.length == 0) {
                  sideBarService.getNewCustomFieldsWithQuery(parseInt(Session.get('mySessionEmployeeLoggedID')), listType).then(function(data) {
                      reset_data = data.ProcessLog.Obj.CustomLayout[0].Columns;
                      reset_data = templateObject.insertItemWithLabel(reset_data, 'BO','Serial/Lot No');
                      templateObject.showCustomFieldDisplaySettings(reset_data);
                  }).catch(function(err) {});
              } else {
                  let data = JSON.parse(dataObject[0].data);
                  if (data.ProcessLog.Obj.CustomLayout.length > 0) {
                      for (let i = 0; i < data.ProcessLog.Obj.CustomLayout.length; i++) {
                          if (data.ProcessLog.Obj.CustomLayout[i].TableName == listType) {
                              reset_data = data.ProcessLog.Obj.CustomLayout[i].Columns;
                              reset_data = templateObject.insertItemWithLabel(reset_data, 'BO','Serial/Lot No');
                              templateObject.showCustomFieldDisplaySettings(reset_data);
                          }
                      }
                  };
                  // handle process here
              }
          });

      } catch (error) {}
      return;
  }

  templateObject.showCustomFieldDisplaySettings = async function(reset_data) {
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
            $('#'+currenttranstablename+' .'+reset_data[r].class).removeClass('hiddenColumn');
          }else if(reset_data[r].active == false){
            $('#'+currenttranstablename+' .'+reset_data[r].class).addClass('hiddenColumn');
          };
          custFields.push(customData);
      }
      await templateObject.displayfields.set(custFields);
      $('.dataTable').resizable();
  }

  templateObject.initCustomFieldDisplaySettings("", currenttranstablename);
  
});

Template.transaction_line.events({
  // custom field displaysettings
  "click .btnResetGridSettings": async function(event) {
      let templateObject = Template.instance();
      let currenttranstablename = templateObject.data.tablename||"";
      let reset_data = templateObject.reset_data.get();
      let isBatchSerialNoTracking = Session.get("CloudShowSerial") || false;
      if (isBatchSerialNoTracking) {
          reset_data[11].display = true;
      } else {
          reset_data[11].display = false;
      }
      reset_data = templateObject.insertItemWithLabel(reset_data, 'BO','Serial/Lot No');
      reset_data = reset_data.filter(redata => redata.display);
      $(".displaySettings").each(function(index) {
          let $tblrow = $(this);
          $tblrow.find(".divcolumn").text(reset_data[index].label);
          $tblrow.find(".custom-control-input").prop("checked", reset_data[index].active);
          let title = $(`#${currenttranstablename}`).find("th").eq(index);
          if (reset_data[index].class === 'AmountEx' || reset_data[index].class === 'UnitPriceEx') {
              $(title).html(reset_data[index].label + `<i class="fas fa-random fa-trans"></i>`);
          } else if (reset_data[index].class === 'AmountInc' || reset_data[index].class === 'UnitPriceInc') {
              $(title).html(reset_data[index].label + `<i class="fas fa-random"></i>`);
          } else {
              $(title).html(reset_data[index].label);
          }

          if (reset_data[index].active) {
              $('.col' + reset_data[index].class).addClass('showColumn');
              $('.col' + reset_data[index].class).removeClass('hiddenColumn');
          } else {
              $('.col' + reset_data[index].class).addClass('hiddenColumn');
              $('.col' + reset_data[index].class).removeClass('showColumn');
          }
          $(".rngRange" + reset_data[index].class).val(reset_data[index].width);
          $(".col" + reset_data[index].class).css('width', reset_data[index].width);
      });
  },
  'click .btnOpenTranSettings': async function (event, template) {
      let templateObject = Template.instance();
      let currenttranstablename = templateObject.data.tablename||"";
      $(`#${currenttranstablename} thead tr th`).each(function (index) {
        var $tblrow = $(this);
        var colWidth = $tblrow.width() || 0;
        var colthClass = $tblrow.attr('data-class') || "";
        $('.rngRange' + colthClass).val(colWidth);
      });
     $('.'+currenttranstablename+'_Modal').modal('toggle');
  },
  'mouseenter .transTable .dataTable': async function (event, template) {
      let templateObject = Template.instance();
      let currenttranstablename = templateObject.data.tablename||"";

  },
  'mouseleave .transTable .dataTable': async function (event, template) {
      let templateObject = Template.instance();
      let currenttranstablename = templateObject.data.tablename||"";
  },
});

Template.transaction_line.helpers({
  // custom field displaysettings
  displayfields: () => {
      let data = Template.instance().displayfields.get();
      let isBatchSerialNoTracking = Session.get("CloudShowSerial") || false;
      if (!isBatchSerialNoTracking) {
        data.find((x) => x.class === 'SerialNo').display = false;
        data.find((x) => x.class === 'SerialNo').active = false;
      }
      return data;
  },

  displayFieldColspan: (displayfield, isForeignEnabled) => {
      if (foreignCols.includes(displayfield.custfieldlabel)) {
          if (isForeignEnabled == true) {
              return 2
          }
          return 1;
      }
      return 1;
  },

  subHeaderForeign: (displayfield) => {

      if (foreignCols.includes(displayfield.custfieldlabel)) {
          return true;
      }
      return false;
  },
  convertToForeignAmount: (amount) => {
      return FxGlobalFunctions.convertToForeignAmount(amount, $('#exchange_rate').val(), FxGlobalFunctions.getCurrentCurrencySymbol());
  }
});

Template.registerHelper("equals", function (a, b) {
  return a === b;
});
