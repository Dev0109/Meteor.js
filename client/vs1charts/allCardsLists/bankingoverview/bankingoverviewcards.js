import { PaymentsService } from '../../../payments/payments-service';
import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../../../js/core-service';
import { EmployeeProfileService } from "../../../js/profile-service";
import { AccountService } from "../../../accounts/account-service";
import { UtilityService } from "../../../utility-service";
import { SideBarService } from '../../../js/sidebar-service';
const _tabGroup = 12;
let sideBarService = new SideBarService();
let utilityService = new UtilityService();
Template.bankingoverviewcards.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.bankaccountdatarecord = new ReactiveVar([]);
});

Template.bankingoverviewcards.onRendered(function() {
    let templateObject = Template.instance();
    let paymentService = new PaymentsService();
    let accountService = new AccountService();
    const customerList = [];
    let salesOrderTable;
    var splashArray = new Array();
    const dataTableList = [];
    const tableHeaderList = [];

    var today = moment().format('DD/MM/YYYY');
    var currentDate = new Date();
    var begunDate = moment(currentDate).format("DD/MM/YYYY");
    let fromDateMonth = (currentDate.getMonth() + 1);
    let fromDateDay = currentDate.getDate();
    if ((currentDate.getMonth()+1) < 10) {
        fromDateMonth = "0" + (currentDate.getMonth()+1);
    }

    if (currentDate.getDate() < 10) {
        fromDateDay = "0" + currentDate.getDate();
    }
    var fromDate = fromDateDay + "/" + (fromDateMonth) + "/" + currentDate.getFullYear();

    $("#date-input,#dateTo,#dateFrom").datepicker({
        showOn: 'button',
        buttonText: 'Show Date',
        buttonImageOnly: true,
        buttonImage: '/img/imgCal2.png',
        dateFormat: 'dd/mm/yy',
        showOtherMonths: true,
        selectOtherMonths: true,
        changeMonth: true,
        changeYear: true,
        yearRange: "-90:+10",
        onChangeMonthYear: function(year, month, inst){
        // Set date to picker
        $(this).datepicker('setDate', new Date(year, inst.selectedMonth, inst.selectedDay));
        // Hide (close) the picker
        // $(this).datepicker('hide');
        // // Change ttrigger the on change function
        // $(this).trigger('change');
       }
    });

    $("#dateFrom").val(fromDate);
    $("#dateTo").val(begunDate);

    function MakeNegative() {
        $('td').each(function() {
            if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
        });
    };

    getVS1Data('TAccountVS1').then(function(dataObject) {
        if (dataObject.length == 0) {
          sideBarService.getAccountListVS1().then(async function(data) {
            addVS1Data('TAccountVS1',JSON.stringify(data));
              let arrayDataUse = [];
              let totalAmountCalculation = '';
              for (let i = 0; i < data.taccountvs1.length; i++) {
                if ((data.taccountvs1[i].fields.AccountTypeName == 'CCARD') && (data.taccountvs1[i].fields.Balance != 0) || (data.taccountvs1[i].fields.AccountTypeName == 'BANK') && (data.taccountvs1[i].fields.Balance != 0)) {
                    arrayDataUse.push(data.taccountvs1[i].fields);
                      arrayDataUse.push(data.taccountvs1[i]);
                      let filterDueDateData = _.filter(arrayDataUse, function(data) {
                          return data.AccountName
                      });

                      let groupData = _.omit(_.groupBy(filterDueDateData, 'AccountName'), ['']);
                      totalAmountCalculation = _.map(groupData, function(value, key) {
                          let totalBalance = 0;
                          let creditcard = 'fas fa-credit-card';
                          for (let i = 0; i < value.length; i++) {
                              totalBalance += value[i].Balance;
                              let accountName = value[i].AccountName.toLowerCase();
                              if (accountName.includes("credit")) {
                                  creditcard = 'fas fa-credit-card';
                              } else if (accountName.includes("mastercard")) {
                                  creditcard = 'fab fa-cc-mastercard'
                              } else if (accountName.includes("bank")) {
                                  creditcard = 'fab fa-cc-visa'
                              }
                          }
                          let userObject = {};
                          userObject.name = key;
                          userObject.totalbalance = utilityService.modifynegativeCurrencyFormat(totalBalance);
                          userObject.card = creditcard;
                          userObject.cardAccountID = 'banking-' + key.replaceAll(' ', '').toLowerCase();
                          return userObject;

                      });

                  }
              }
              let sortedArray = [];
              sortedArray = await totalAmountCalculation.sort(function(a, b) {
                  return b.totalbalance - a.totalbalance;
              });
              let getTop4Data = _.take(sortedArray, 4);
              let newObjData = '';
              let newObjDataArr = [];

              templateObject.bankaccountdatarecord.set(getTop4Data);
          }).catch(function(err) {
          });
        } else {
            let data = JSON.parse(dataObject[0].data);
            let useData = data.taccountvs1;
            let itemsAwaitingPaymentcount = [];
            let itemsOverduePaymentcount = [];
            let dataListAwaitingCust = {};
            let totAmount = 0;
            let totAmountOverDue = 0;
            let customerawaitingpaymentCount = '';
            var groups = {};
            let arrayDataUse = [];
            let totalAmountCalculation = '';
            for (let i = 0; i < useData.length; i++) {
                if ((useData[i].fields.AccountTypeName == 'CCARD') && (useData[i].fields.Balance != 0) || (useData[i].fields.AccountTypeName == 'BANK') && (useData[i].fields.Balance != 0)) {
                    arrayDataUse.push(useData[i].fields);
                    let filterDueDateData = _.filter(arrayDataUse, function(data) {
                        return data.AccountName
                    });
                    let groupData = _.omit(_.groupBy(filterDueDateData, 'AccountName'), ['']);
                    totalAmountCalculation = _.map(groupData, function(value, key) {
                        let totalBalance = 0;
                        let creditcard = 'fas fa-credit-card';
                        let id = 0;
                        for (let i = 0; i < value.length; i++) {
                            id = value[i].ID;
                            totalBalance += value[i].Balance;
                            let accountName = value[i].AccountName.toLowerCase();
                            if (accountName.includes("credit")) {
                                creditcard = 'fas fa-credit-card';
                            } else if (accountName.includes("mastercard")) {
                                creditcard = 'fab fa-cc-mastercard'
                            } else if (accountName.includes("bank")) {
                                creditcard = 'fab fa-cc-visa'
                            }
                        }
                        let userObject = {};
                        userObject.id = id;
                        userObject.name = key;
                        userObject.totalbalance = utilityService.modifynegativeCurrencyFormat(totalBalance);
                        userObject.card = creditcard;
                        userObject.cardAccountID = 'banking-' + key.replaceAll(' ', '').toLowerCase();
                        return userObject;

                    });

                }
            }
            let sortedArray = [];
            sortedArray = totalAmountCalculation.sort(function(a, b) {
                return b.totalbalance - a.totalbalance;
            });
            let getTop4Data = sortedArray;
            let newObjData = '';
            let newObjDataArr = [];
            templateObject.bankaccountdatarecord.set(getTop4Data);

        }
    }).catch(function(err) {
      sideBarService.getAccountListVS1().then(async function(data) {
        addVS1Data('TAccountVS1',JSON.stringify(data));
          let arrayDataUse = [];
          let totalAmountCalculation = '';
          for (let i = 0; i < data.taccountvs1.length; i++) {
            if ((data.taccountvs1[i].fields.AccountTypeName == 'CCARD') && (data.taccountvs1[i].fields.Balance != 0) || (data.taccountvs1[i].fields.AccountTypeName == 'BANK') && (data.taccountvs1[i].fields.Balance != 0)) {
                arrayDataUse.push(data.taccountvs1[i].fields);
                  arrayDataUse.push(data.taccountvs1[i]);
                  let filterDueDateData = _.filter(arrayDataUse, function(data) {
                      return data.AccountName
                  });

                  let groupData = _.omit(_.groupBy(filterDueDateData, 'AccountName'), ['']);
                  totalAmountCalculation = _.map(groupData, function(value, key) {
                      let totalBalance = 0;
                      let creditcard = 'fas fa-credit-card';
                      for (let i = 0; i < value.length; i++) {
                          totalBalance += value[i].Balance;
                          let accountName = value[i].AccountName.toLowerCase();
                          if (accountName.includes("credit")) {
                              creditcard = 'fas fa-credit-card';
                          } else if (accountName.includes("mastercard")) {
                              creditcard = 'fab fa-cc-mastercard'
                          } else if (accountName.includes("bank")) {
                              creditcard = 'fab fa-cc-visa'
                          }
                      }
                      let userObject = {};
                      userObject.name = key;
                      userObject.totalbalance = utilityService.modifynegativeCurrencyFormat(totalBalance);
                      userObject.card = creditcard;
                      userObject.cardAccountID = 'banking-' + key.replaceAll(' ', '').toLowerCase();
                      return userObject;

                  });

              }
          }
          let sortedArray = [];
          sortedArray = await totalAmountCalculation.sort(function(a, b) {
              return b.totalbalance - a.totalbalance;
          });
          let getTop4Data = _.take(sortedArray, 4);
          let newObjData = '';
          let newObjDataArr = [];

          templateObject.bankaccountdatarecord.set(getTop4Data);
      }).catch(function(err) {
      });
    });
});

Template.bankingoverviewcards.events({
  'click .opentransBank': async function(event) {
      let bankAccountName = $(event.target).closest('.openaccountreceivable').attr('id');
      // FlowRouter.go('/accounttransactions?id=' + id);
      await clearData('TAccountRunningBalanceReport');
      FlowRouter.go("/balancetransactionlist?accountName=" +bankAccountName +"&isTabItem=" +false);
  }
});
Template.bankingoverviewcards.helpers({
    bankaccountdatarecord: () => {
        return Template.instance().bankaccountdatarecord.get();
    }
});
