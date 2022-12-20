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
          { index: 2, label: "Account Name", class: "AccountName", width: "300", active: true, display: true },
          { index: 3, label: "Memo", class: "Memo", width: "", active: true, display: true },
          { index: 4, label: "Qty", class: "Qty", width: "50", active: true, display: true },
          { index: 5, label: "Ordered", class: "Ordered", width: "75", active: true, display: true },
          { index: 6, label: "Shipped", class: "Shipped", width: "75", active: true, display: true },
          { index: 7, label: "BO", class: "BackOrder", width: "75", active: true, display: true },
          { index: 8, label: "Serial/Lot No", class: "SerialNo", width: "100", active: true, display: true },
          { index: 9, label: "Fixed Asset", class: "FixedAsset", width: "100", active: true, display: true },
          { index: 10, label: "Customer/Job", class: "CustomerJob", width: "110", active: true, display: true },
          { index: 11, label: "Unit Price (Ex)", class: "UnitPriceEx", width: "152", active: true, display: true },
          { index: 12, label: "Unit Price (Inc)", class: "UnitPriceInc", width: "152", active: false, display: true },
          { index: 13, label: "Cost Price", class: "CostPrice", width: "110", active: true, display: true },
          { index: 14, label: "Disc %", class: "Discount", width: "75", active: true, display: true },
          { index: 15, label: "CustField1", class: "SalesLinesCustField1", width: "110", active: true, display: true },
          { index: 16, label: "Tax Rate", class: "TaxRate", width: "91", active: true, display: true },
          { index: 17, label: "Tax Code", class: "TaxCode", width: "95", active: true, display: true },
          { index: 18, label: "Tax Amt", class: "TaxAmount", width: "75", active: true, display: true },
          { index: 19, label: "Amount (Ex)", class: "AmountEx", width: "152", active: true, display: true },
          { index: 20, label: "Amount (Inc)", class: "AmountInc", width: "152", active: false, display: true },
          { index: 21, label: "Units", class: "cc", width: "95", active: true, display: true },
          { index: 22, label: "Custom Field 1", class: "CustomField1", width: "124", active: false, display: false },
          { index: 23, label: "Custom Field 2", class: "CustomField2", width: "124", active: false, display: false },
      ];
      let isBatchSerialNoTracking = Session.get("CloudShowSerial") || false;
      let isBOnShippedQty = Session.get("CloudSalesQtyOnly");
      if (isBOnShippedQty) {
         let x;
         x = reset_data.find(x => x.class === 'Qty'); if(x != undefined) x.display = true;
         x = reset_data.find(x => x.class === 'Ordered'); if(x != undefined) x.display = false;
         x = reset_data.find(x => x.class === 'Shipped'); if(x != undefined) x.display = false;
         x = reset_data.find(x => x.class === 'BackOrder'); if(x != undefined) x.display = false;
      } else {
        let x;
        x = reset_data.find(x => x.class === 'Qty'); if(x != undefined) x.display = false;
        x = reset_data.find(x => x.class === 'Ordered'); if(x != undefined) x.display = true;
        x = reset_data.find(x => x.class === 'Shipped'); if(x != undefined) x.display = true;
        x = reset_data.find(x => x.class === 'BackOrder'); if(x != undefined) x.display = true;
      }
      if (isBatchSerialNoTracking) {
        let x = reset_data.find(x => x.class === 'TaxAmount');
        if(x != undefined) x.display = true;
      } else {
        let x = reset_data.find(x => x.class === 'TaxAmount');
        if(x != undefined) x.display = false;
      }
      let templateObject = Template.instance();
      templateObject.reset_data.set(reset_data);
  }
  templateObject.init_reset_data();
  // custom field displaysettings
  templateObject.initCustomFieldDisplaySettings = function(data, listType) {

      let templateObject = Template.instance();
      let reset_data = templateObject.reset_data.get();
      if(listType == "tblSalesOrderLine" || listType == "tblQuoteLine") {
        let reset_data_salesorder = [
            { index: 0, label: "Product Name", class: "ProductName", width: "300", active: true, display: true },
            { index: 1, label: "Description", class: "Description", width: "", active: true, display: true },
            { index: 2, label: "Qty", class: "Qty", width: "55", active: true, display: true },
            { index: 3, label: "Unit Price (Ex)", class: "UnitPriceEx", width: "152", active: true, display: true },
            { index: 4, label: "Unit Price (Inc)", class: "UnitPriceInc", width: "152", active: false, display: true },
            { index: 5, label: "Disc %", class: "Discount", width: "95", active: true, display: true },
            { index: 6, label: "Cost Price", class: "CostPrice", width: "110", active: false, display: true },
            { index: 7, label: "SalesLines CustField1", class: "SalesLinesCustField1", width: "110", active: false, display: true },
            { index: 8, label: "Tax Rate", class: "TaxRate", width: "95", active: false, display: true },
            { index: 9, label: "Tax Code", class: "TaxCode", width: "95", active: true, display: true },
            { index: 10, label: "Tax Amt", class: "TaxAmount", width: "95", active: true, display: true },
            { index: 11, label: "Serial/Lot No", class: "SerialNo", width: "124", active: true, display: true },
            { index: 12, label: "Amount (Ex)", class: "AmountEx", width: "152", active: true, display: true },
            { index: 13, label: "Amount (Inc)", class: "AmountInc", width: "152", active: false, display: true },
          ];
            reset_data = reset_data.map( data => {
            x = reset_data_salesorder.find( x => x.class === data.class);
            if(x != undefined) {
                x.index = data.index;
                x.width = data.width;
                return x;
            } else {
                data.active = false;
                data.display = false;
                return data;
            }
            });
      }
      if(listType == 'tblCreditLine' || listType == 'tblBillLine') {
        let reset_data_credit = [
            { index: 0, label: "Account Name", class: "AccountName", width: "300", active: true, display: true },
            { index: 1, label: "Memo", class: "Memo", width: "", active: true, display: true },
            { index: 2, label: "Amount (Ex)", class: "AmountEx", width: "140", active: true, display: true },
            { index: 3, label: "Amount (Inc)", class: "AmountInc", width: "140", active: false, display: true },
            { index: 4, label: "Fixed Asset", class: "FixedAsset", width: "140", active: true, display: true },
            { index: 5, label: "Tax Rate", class: "TaxRate", width: "95", active: false, display: true },
            { index: 6, label: "Tax Code", class: "TaxCode", width: "95", active: true, display: true },
            { index: 7, label: "Tax Amt", class: "TaxAmount", width: "95", active: true, display: true },
            { index: 8, label: "Serial/Lot No", class: "SerialNo", width: "124", active: true, display: true },
            { index: 9, label: "Custom Field 1", class: "CustomField1", width: "124", active: false, display: true },
            { index: 10, label: "Custom Field 2", class: "CustomField2", width: "124", active: false, display: true },
          ];
          reset_data = reset_data.map( data => {
            x = reset_data_credit.find( x => x.class === data.class);
            if(x != undefined) {
                x.index = data.index;
                x.width = data.width;
                return x;
            } else {
                data.active = false;
                data.display = false;
                return data;
            }
            });
      }
      templateObject.showCustomFieldDisplaySettings(reset_data);
      try {

          getVS1Data("VS1_Customize").then(function(dataObject) {
              if (dataObject.length == 0) {
                  sideBarService.getNewCustomFieldsWithQuery(parseInt(Session.get('mySessionEmployeeLoggedID')), listType).then(function(data) {
                      reset_data = data.ProcessLog.Obj.CustomLayout[0].Columns;
                      reset_data = templateObject.reset_data.get().map( data => {
                        x = reset_data.find( x => x.class === data.class);
                        if(x != undefined) {
                            x.index = data.index;
                            x.width = data.width;
                            return x;
                        } else {
                            data.active = false;
                            data.display = false;
                            return data;
                        }
                      })
                      templateObject.showCustomFieldDisplaySettings(reset_data);
                  }).catch(function(err) {});
              } else {
                  let data = JSON.parse(dataObject[0].data);
                  if (data.ProcessLog.Obj.CustomLayout.length > 0) {
                      for (let i = 0; i < data.ProcessLog.Obj.CustomLayout.length; i++) {
                          if (data.ProcessLog.Obj.CustomLayout[i].TableName == listType) {
                              reset_data = data.ProcessLog.Obj.CustomLayout[i].Columns;
                              reset_data = templateObject.reset_data.get().map( data => {
                                x = reset_data.find( x => x.class === data.class);
                                if(x != undefined) {
                                    x.index = data.index;
                                    x.width = data.width;
                                    return x;
                                } else {
                                    data.active = false;
                                    data.display = false;
                                    return data;
                                }
                              });
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
              width: reset_data[r].width ? reset_data[r].width : '',
              label: reset_data[r].label
          };

          if(reset_data[r].active == true){
            $('#'+currenttranstablename+' .'+reset_data[r].class).removeClass('hiddenColumn');
          }else if(reset_data[r].active == false){
            $('#'+currenttranstablename+' .'+reset_data[r].class).addClass('hiddenColumn');
          };
          custFields.push(customData);
      }
      await templateObject.displayfields.set(custFields);
      await templateObject.reset_data.set(custFields);
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
        reset_data.find((x) => x.class === 'TaxRate').display = true;
      } else {
        reset_data.find((x) => x.class === 'TaxRate').display = false;
      }
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
  'click .btnSaveGridSettings': async function(event) {
    playSaveAudio();
    let templateObject = Template.instance();
    setTimeout(async function(){
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
    let reset_data = templateObject.reset_data.get();
    reset_data = reset_data.filter(redata => redata.display == false);
    lineItems.push(...reset_data);
    lineItems.sort((a,b) => a.index - b.index);

    try {
        let erpGet = erpDb();
        let tableName = templateObject.data.tablename||"";
        let employeeId = parseInt(Session.get('mySessionEmployeeLoggedID'))||0;
        let added = await sideBarService.saveNewCustomFields(erpGet, tableName, employeeId, lineItems);

        $(".fullScreenSpin").css("display", "none");
        if(added) {
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
                $('#myModal2').modal('hide');
                }
            });
        } else {
        swal("Something went wrong!", "", "error");
        }
    } catch (error) {
        $(".fullScreenSpin").css("display", "none");
        swal("Something went wrong!", "", "error");
    }
    }, delayTimeAfterSound);
    },
});

Template.transaction_line.helpers({
  // custom field displaysettings
  displayfields: () => {
    let currenttranstablename = Template.instance().data.tablename||"";
    let data = Template.instance().displayfields.get();

    let isBatchSerialNoTracking = Session.get("CloudShowSerial") || false;
    if (!isBatchSerialNoTracking) {
        let serialNo = data.find((x) => x.class === 'SerialNo');
        if( serialNo != undefined) {
            serialNo.display = false;
            serialNo.active = false;
        }
    }
    let monthArr = Template.instance().monthArr.get();
    let fixedAsset = data.find((x) => x.class === 'FixedAsset');
    let month = monthArr.find((x) => x.moduleName === 'Fixed Assets');
    if(fixedAsset != undefined && month != undefined){
        fixedAsset.display = month.isPurchased;
        fixedAsset.active = fixedAsset.display;
        if(currenttranstablename == 'tblSalesOrderLine' || currenttranstablename == "tblQuoteLine"){
            fixedAsset.display = false;
            fixedAsset.active = false;
        }
    }
    let canShowUOM = Template.instance().data.canShowUOM;
    let isSerialNoTracking = Template.instance().data.isBatchSerialNoTracking;
    if(!canShowUOM) {
        let units = data.find((x) => x.class === 'Units');
        if( units != undefined) {
            units.display = false;
            units.active = false;
        }
    }
    if(!isSerialNoTracking) {
        let serialNo = data.find((x) => x.class === 'SerialNo');
        if( serialNo != undefined) {
            serialNo.display = false;
            serialNo.active = false;
        }
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
