import { SideBarService } from '../../js/sidebar-service';
import '../../lib/global/indexdbstorage.js';
import '../../lib/global/colResizable.js';
import TableHandler from '../../js/Table/TableHandler';
let sideBarService = new SideBarService();
modalDraggable = function () {
    $('.modal-dialog').draggable({
        containment: "body",
        "handle":".modal-header, .modal-footer"
    });
$(document).ready(function(){
  $(document).on('click', '.highlightInput', function () {
    $(this).select();
  });

  $(document).on('click', '.close', function () {
    var vid = document.getElementById("myVideo");
    vid.pause();
  });

  // $(document).on('click', '.highlightSelect', function () {
  //   $(this).select();
  // });

  $(document).on('click', "input[type='text']", function () {
    $(this).select();
  });

  $(document).on('click', "input[type='email']", function () {
    $(this).select();
  });

  $(document).on('click', "input[type='number']", function () {
    $(this).select();
  });

  $(document).on('click', "input[type='password']", function () {
    $(this).select();
  });
  $("input[type='text']").on("click", function () {
   $(this).select();
 });

 $(".highlightInput").on("click", function () {
  $(this).select();
});

 $("input[type='number']").on("click", function () {
  $(this).select();
});

$("input[type='text']").click(function () {
   $(this).select();
});

$("input[type='number']").click(function () {
   $(this).select();
});

setTimeout(function () {
var usedNames = {};
$("select[name='edtBankAccountName'] > option").each(function () {
    if(usedNames[this.text]) {
        $(this).remove();
    } else {
        usedNames[this.text] = this.value;
    }
});
}, 3000);

// $(".hasDatepicker").on("blur", function () {

  $(document).on('blur', '.hasDatepicker', function () {
         let dateEntered = $(event.target).val();
         let parts = [];
         if(dateEntered.length > 6){

             let isReceiptDateValid = moment($(event.target).val()).isValid();
             let symbolArr = ['/', '-', '.', ' ',','];
             symbolArr.forEach(function (e, i) {
                 if ($(event.target).val().indexOf(symbolArr[i]) > -1) {
                     parts = $(event.target).val().split(symbolArr[i]);
                 }
             });
             if(parts.length){
                 if(!isReceiptDateValid) {
                     if (!(parts[0] && (parts[1] < 13) && (parts[2] > 999 && parts[2] < 9999 ))) {
                       //let parts = dateEntered.match(/.{1,2}/g);
                       tempDay = parseInt(parts[0]);
                       tempMonth = parseInt(parts[1])-1;
                       tempYear = parseInt(parts[2])+2000;
                       if(!((tempDay < 31) && (tempMonth <12) && tempDay && tempMonth && tempYear)){
                           $(event.target).val(moment().format('DD/MM/YYYY'));
                       }else {
                           let tempDate = moment(new Date(tempYear,tempMonth,tempDay)).format('DD/MM/YYYY');
                           $(event.target).val(tempDate);
                       }
                     } else {
                         let myDate = moment(new Date(parts[2], parts[1] - 1, parts[0])).format("DD/MM/YYYY");
                         $(event.target).val(myDate);
                     }
                 }else{
                     if (!(parts[0] && (parts[1] < 13) && (parts[2] > 999 && parts[2] < 9999 ))) {
                       //let parts = dateEntered.match(/.{1,2}/g);
                       tempDay = parseInt(parts[0]);
                       tempMonth = parseInt(parts[1])-1;
                       tempYear = parseInt(parts[2])+2000;
                       if(!((tempDay < 31) && (tempMonth <12) && tempDay && tempMonth && tempYear)){
                           $(event.target).val(moment().format('DD/MM/YYYY'));
                       }else {
                           let tempDate = moment(new Date(tempYear,tempMonth,tempDay)).format('DD/MM/YYYY');
                           $(event.target).val(tempDate);
                       }
                     } else {
                         let myDate = moment(new Date(parts[2], parts[1] - 1, parts[0])).format("DD/MM/YYYY");
                         $(event.target).val(myDate);
                     }
                 }
             }else{
                 $(event.target).val(moment().format('DD/MM/YYYY'));

             }

         }else if(dateEntered.length === 6){
             let parts = dateEntered.match(/.{1,2}/g);
             tempDay = parseInt(parts[0]);
             tempMonth = parseInt(parts[1])-1;
             tempYear = parseInt(parts[2])+2000;
             if(!((tempDay < 31) && (tempMonth <12) && tempDay && tempMonth && tempYear)){
                 $(event.target).val(moment().format('DD/MM/YYYY'));
             }else {
                 let tempDate = moment(new Date(tempYear,tempMonth,tempDay)).format('DD/MM/YYYY');
                 $(event.target).val(tempDate);
             }
         }else {
           let symbolArr = ['/', '-', '.', ' ',','];
           symbolArr.forEach(function (e, i) {
               if ($(event.target).val().indexOf(symbolArr[i]) > -1) {
                   parts = $(event.target).val().split(symbolArr[i]);
               }
           });
           if(parts.length > 1){
             tempDay = parseInt(parts[0]);
             tempMonth = parseInt(parts[1])-1;
             tempYear = new Date().getFullYear();  // returns the current year
             if(!((tempDay < 31) && (tempMonth <12) && tempDay && tempMonth && tempYear)){
                 $(event.target).val(moment().format('DD/MM/YYYY'));
             }else {
                 let tempDate = moment(new Date(tempYear,tempMonth,tempDay)).format('DD/MM/YYYY');
                 $(event.target).val(tempDate);
             }
           }else{
             $(event.target).val(moment().format('DD/MM/YYYY'));
           }
         }
});

$(document).on('keypress', '.hasDatepicker', function (e) {
    if(e.which == 13) {
       let dateEntered = $(event.target).val();
       let parts = [];
       if(dateEntered.length > 6){

           let isReceiptDateValid = moment($(event.target).val()).isValid();
           let symbolArr = ['/', '-', '.', ' ',','];
           symbolArr.forEach(function (e, i) {
               if ($(event.target).val().indexOf(symbolArr[i]) > -1) {
                   parts = $(event.target).val().split(symbolArr[i]);
               }
           });
           if(parts.length){
               if(!isReceiptDateValid) {

                   if (!(parts[0] && (parts[1] < 13) && (parts[2] > 999 && parts[2] < 9999 ))) {

                     tempDay = parseInt(parts[0]);
                     tempMonth = parseInt(parts[1])-1;
                     tempYear = parseInt(parts[2])+2000;

                     if(!((tempDay < 31) && (tempMonth <12) && tempDay && tempMonth && tempYear)){

                         $(event.target).val(moment().format('DD/MM/YYYY'));
                     }else {

                         let tempDate = moment(new Date(tempYear,tempMonth,tempDay)).format('DD/MM/YYYY');
                         $(event.target).val(tempDate);
                     }
                   } else {

                       let myDate = moment(new Date(parts[2], parts[1] - 1, parts[0])).format("DD/MM/YYYY");
                       $(event.target).val(myDate);
                   }
               }else{

                   if (!(parts[0] && (parts[1] < 13) && (parts[2] > 999 && parts[2] < 9999 ))) {

                     tempDay = parseInt(parts[0]);
                     tempMonth = parseInt(parts[1])-1;
                     tempYear = parseInt(parts[2])+2000;
                     if(!((tempDay < 31) && (tempMonth <12) && tempDay && tempMonth && tempYear)){
                         $(event.target).val(moment().format('DD/MM/YYYY'));
                     }else {
                         let tempDate = moment(new Date(tempYear,tempMonth,tempDay)).format('DD/MM/YYYY');
                         $(event.target).val(tempDate);
                     }
                   } else {
                       let myDate = moment(new Date(parts[2], parts[1] - 1, parts[0])).format("DD/MM/YYYY");
                       $(event.target).val(myDate);
                   }
               }
           }else{
               $(event.target).val(moment().format('DD/MM/YYYY'));

           }

       }else if(dateEntered.length === 6){
           let parts = dateEntered.match(/.{1,2}/g);
           tempDay = parseInt(parts[0]);
           tempMonth = parseInt(parts[1])-1;
           tempYear = parseInt(parts[2])+2000;
           if(!((tempDay < 31) && (tempMonth <12) && tempDay && tempMonth && tempYear)){
               $(event.target).val(moment().format('DD/MM/YYYY'));
           }else {
               let tempDate = moment(new Date(tempYear,tempMonth,tempDay)).format('DD/MM/YYYY');
               $(event.target).val(tempDate);
           }
       }else {
         let symbolArr = ['/', '-', '.', ' ',','];
         symbolArr.forEach(function (e, i) {
             if ($(event.target).val().indexOf(symbolArr[i]) > -1) {
                 parts = $(event.target).val().split(symbolArr[i]);
             }
         });
         if(parts.length > 1){
           tempDay = parseInt(parts[0]);
           tempMonth = parseInt(parts[1])-1;
           tempYear = new Date().getFullYear();  // returns the current year
           if(!((tempDay < 31) && (tempMonth <12) && tempDay && tempMonth && tempYear)){
               $(event.target).val(moment().format('DD/MM/YYYY'));
           }else {
               let tempDate = moment(new Date(tempYear,tempMonth,tempDay)).format('DD/MM/YYYY');
               $(event.target).val(tempDate);
           }
         }else{
           $(event.target).val(moment().format('DD/MM/YYYY'));
         }
       }
     }
});

$('.dropdown-toggle').on("click",function(event){

    //event.stopPropagation();
});
// $('.dropdown-toggle').click(e => e.stopPropagation());
  });


    /*
      Bert.defaults = {
      hideDelay: 5000,
      style: 'fixed-top',
      type: 'default'
        };
        */
};


  makeNegativeGlobal = function () {
    $('td').each(function() {
        if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
    });
    $('td.colStatus').each(function(){
        if($(this).text() == "Deleted") $(this).addClass('text-deleted');
        if ($(this).text() == "Full") $(this).addClass('text-fullyPaid');
        if ($(this).text() == "Part") $(this).addClass('text-partialPaid');
        if ($(this).text() == "Rec") $(this).addClass('text-reconciled');
    });
  };

batchUpdateCall = function (url) {
    var erpGet = erpDb();
    let dashboardArray = [];
    var oReq = new XMLHttpRequest();
    var oReq2 = new XMLHttpRequest();
    var oReq3 = new XMLHttpRequest();
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

    oReq.open("GET",URLRequest + erpGet.ERPIPAddress + ':' + erpGet.ERPPort + '/' + 'erpapi/VS1_Cloud_Task/VS1_BatchUpdate', true);
    oReq.setRequestHeader("database",erpGet.ERPDatabase);
    oReq.setRequestHeader("username",erpGet.ERPUsername);
    oReq.setRequestHeader("password",erpGet.ERPPassword);
    oReq.send();
    oReq.onreadystatechange = function() {
        if(oReq.readyState == 4 && oReq.status == 200) {
          var myArrResponse = JSON.parse(oReq.responseText);
          let responseBack = myArrResponse.ProcessLog.ResponseStatus;

          if (~responseBack.indexOf("Finished Batch Update")){

            // sideBarService.getTTransactionListReport('').then(function(data) {
            //     addVS1Data('TTransactionListReport',JSON.stringify(data));
            // }).catch(function(err) {
            //
            // });
            // sideBarService.getTAPReport(prevMonth11Date,toDate, false).then(function(data) {
            //   addVS1Data('TAPReport',JSON.stringify(data));
            // }).catch(function(err) {
            // });
            // sideBarService.getTARReport(prevMonth11Date,toDate, false).then(function(data) {
            //   addVS1Data('TARReport',JSON.stringify(data));
            //
            // }).catch(function(err) {
            //
            // });
            //Meteor._reload.reload();
            oReq2.open("GET",URLRequest + erpGet.ERPIPAddress + ':' + erpGet.ERPPort + '/' + 'erpapi/Vs1_Dashboard', true);
            oReq2.setRequestHeader("database",erpGet.ERPDatabase);
            oReq2.setRequestHeader("username",erpGet.ERPUsername);
            oReq2.setRequestHeader("password",erpGet.ERPPassword);
            oReq2.send();
            oReq2.onreadystatechange = function() {
                if(oReq2.readyState == 4 && oReq2.status == 200) {
                  // var myArrResponse2 = JSON.parse(oReq2.responseText);
                  var dataReturnRes = JSON.parse(oReq2.responseText);

                  //Dashboard API:
                  if(dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_summary.fields){
                  Session.setPersistent('vs1companyName', dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_summary.fields.Companyinfo_CompanyName||'');
                  Session.setPersistent('vs1companyaddress1', dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_summary.fields.Companyinfo_Address||'');
                  Session.setPersistent('vs1companyaddress2', dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_summary.fields.Companyinfo_Address2||'');
                  Session.setPersistent('vs1companyABN', dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_summary.fields.Companyinfo_ABN||'');
                  Session.setPersistent('vs1companyPhone', dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_summary.fields.Companyinfo_PhoneNumber||'');
                  Session.setPersistent('vs1companyURL', dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_summary.fields.Companyinfo_URL||'');

                  Session.setPersistent('ERPDefaultDepartment', dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_summary.fields.ColumnHeadings_DefaultClass||'');
                  Session.setPersistent('ERPDefaultUOM', dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_summary.fields.ColumnHeadings_DefaultUOM||'');


                  // Session.setPersistent('ERPCurrency', dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_summary.fields.RegionalOptions_CurrencySymbol||'');
                  Session.setPersistent('ERPCountryAbbr', dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_summary.fields.RegionalOptions_ForeignExDefault||'');
                  Session.setPersistent('ERPTaxCodePurchaseInc', dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_summary.fields.RegionalOptions_TaxCodePurchaseInc||'');
                  Session.setPersistent('ERPTaxCodeSalesInc', dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_summary.fields.RegionalOptions_TaxCodeSalesInc||'');


                  localStorage.setItem('VS1OverDueInvoiceAmt_dash', dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_summary.fields.OVERDUE_INVOICES_AMOUNT||Currency+'0');
                  localStorage.setItem('VS1OverDueInvoiceQty_dash', dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_summary.fields.OVERDUE_INVOICES_QUANTITY||0);
                  localStorage.setItem('VS1OutstandingPayablesAmt_dash', dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_summary.fields.OUTSTANDING_PAYABLES_AMOUNT||Currency+'0');
                  localStorage.setItem('VS1OutstandingPayablesQty_dash', dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_summary.fields.OUTSTANDING_PAYABLES_QUANTITY||0);

                  localStorage.setItem('VS1OutstandingInvoiceAmt_dash', dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_summary.fields.OUTSTANDING_INVOICES_AMOUNT || Currency + '0');
                  localStorage.setItem('VS1OutstandingInvoiceQty_dash', dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_summary.fields.OUTSTANDING_INVOICES_QUANTITY || 0);
                  localStorage.setItem('VS1OverDuePayablesAmt_dash', dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_summary.fields.OVERDUE_PAYABLES_AMOUNT || Currency + '0');
                  localStorage.setItem('VS1OverDuePayablesQty_dash', dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_summary.fields.OVERDUE_PAYABLES_QUANTITY || 0);

                  localStorage.setItem('VS1MonthlyProfitandLoss_dash', '');

                  //Profit & Loss
                  localStorage.setItem('VS1ProfitandLoss_netIncomeEx_dash', dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_summary.fields.PnL_NetIncomeEx||0);
                  localStorage.setItem('VS1ProfitandLoss_IncomeEx_dash', dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_summary.fields.PnL_TotalIncomeEx||0);
                  localStorage.setItem('VS1ProfitandLoss_ExpEx_dash', dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_summary.fields.PnL_TotalExpenseEx||0);
                  localStorage.setItem('VS1ProfitandLoss_COGSEx_dash', dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_summary.fields.PnL_TotalCOGSEx||0);

                   //Income
                  localStorage.setItem('VS1ReportsDateFrom_dash', dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_summary.fields.ReportsDateFrom||"");
                  localStorage.setItem('VS1ReportsDateTo_dash', dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_summary.fields.ReportsDateTo||"");
                  localStorage.setItem('VS1TransTableUpdate', dataReturnRes.ProcessLog.TUser.TransactionTableLastUpdated);

                  if(dataReturnRes.ProcessLog.TUser.TEmployeePicture.ResponseNo == 401){
                    localStorage.setItem('vs1LoggedEmployeeImages_dash','');
                  }else{
                    if(dataReturnRes.ProcessLog.TUser.TEmployeePicture.fields){
                    localStorage.setItem('vs1LoggedEmployeeImages_dash', dataReturnRes.ProcessLog.TUser.TEmployeePicture.fields.EncodedPic|| '');
                    }else{
                      localStorage.setItem('vs1LoggedEmployeeImages_dash','');
                    }
                  }
                  }
                  localStorage.setItem('VS1APReport_dash', JSON.stringify(dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_ap_report.items)||'');
                  localStorage.setItem('VS1PNLPeriodReport_dash', JSON.stringify(dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_pnl_period.items)||'');
                  localStorage.setItem('VS1SalesListReport_dash', JSON.stringify(dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_saleslist.items)||'');
                  localStorage.setItem('VS1SalesEmpReport_dash', JSON.stringify(dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_salesperemployee.items)||'');
                  getVS1Data('vscloudlogininfo').then(function (dataObject) {
                    if(dataObject.length == 0){
                      setTimeout(function () {
                        if(url){
                          window.open(url,'_self');
                        }else{
                          location.reload(true);
                        }
                      }, 10000);
                    }else{
                      //let userData = dataObject[0].data;
                      dashboardArray = dataObject[0].data;



                      dashboardArray.ProcessLog.ClientDetails.ProcessLog.TUser.TEmployeePicture = dataReturnRes.ProcessLog.TUser.TEmployeePicture;
                      dashboardArray.ProcessLog.ClientDetails.ProcessLog.TUser.TVS1_Dashboard_ap_report = dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_ap_report;
                      dashboardArray.ProcessLog.ClientDetails.ProcessLog.TUser.TVS1_Dashboard_pnl_period = dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_pnl_period;
                      dashboardArray.ProcessLog.ClientDetails.ProcessLog.TUser.TVS1_Dashboard_saleslist = dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_saleslist;
                      dashboardArray.ProcessLog.ClientDetails.ProcessLog.TUser.TVS1_Dashboard_salesperemployee = dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_salesperemployee;
                      dashboardArray.ProcessLog.ClientDetails.ProcessLog.TUser.TVS1_Dashboard_summary = dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_summary;
                      dashboardArray.ProcessLog.ClientDetails.ProcessLog.TUser.TransactionTableLastUpdated = dataReturnRes.ProcessLog.TUser.TransactionTableLastUpdated;

                      dashboardArray.ProcessLog.ClientDetails.ProcessLog.TEmployeePicture = dataReturnRes.ProcessLog.TUser.TEmployeePicture;
                      dashboardArray.ProcessLog.ClientDetails.ProcessLog.TVS1_Dashboard_ap_report = dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_ap_report;
                      dashboardArray.ProcessLog.ClientDetails.ProcessLog.TVS1_Dashboard_pnl_period = dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_pnl_period;
                      dashboardArray.ProcessLog.ClientDetails.ProcessLog.TVS1_Dashboard_saleslist = dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_saleslist;
                      dashboardArray.ProcessLog.ClientDetails.ProcessLog.TVS1_Dashboard_salesperemployee = dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_salesperemployee;
                      dashboardArray.ProcessLog.ClientDetails.ProcessLog.TVS1_Dashboard_summary = dataReturnRes.ProcessLog.TUser.TVS1_Dashboard_summary;
                      dashboardArray.ProcessLog.ClientDetails.ProcessLog.TransactionTableLastUpdated = dataReturnRes.ProcessLog.TUser.TransactionTableLastUpdated;

                      addLoginData(dashboardArray).then(function (datareturnCheck) {
                        setTimeout(function () {
                        if(url){
                          window.open(url,'_self');
                        }else{
                          location.reload(true);
                        }
                      }, 500);
                      }).catch(function (err) {
                          if(url){
                            window.open(url,'_self');
                          }else{
                            location.reload(true);
                          }
                      });
                    }


                  }).catch(function (err) {

                  });

                }else if (oReq2.status != 200){

                  setTimeout(function () {
                    if(url){
                      window.open(url,'_self');
                    }else{
                      location.reload(true);
                    }
                  }, 10000);
                }
            }
            oReq3.open("GET",URLRequest + erpGet.ERPIPAddress + ':' + erpGet.ERPPort + '/' + 'erpapi/TAccountVS1?ListType="Detail"&select=[AccountTypeName]="BANK"', true);
            oReq3.setRequestHeader("database",erpGet.ERPDatabase);
            oReq3.setRequestHeader("username",erpGet.ERPUsername);
            oReq3.setRequestHeader("password",erpGet.ERPPassword);
            oReq3.send();
            oReq3.onreadystatechange = function() {
                if(oReq3.readyState == 4 && oReq3.status == 200) {
                  var dataReturnRes3 = JSON.parse(oReq3.responseText);
                  if (dataReturnRes3.taccountvs1.length > 0) {
                    localStorage.setItem('VS1TAccount_Bank_dash', dataReturnRes3.taccountvs1[0].fields.Balance||0);
                    localStorage.setItem('VS1TAccount_Bank_Payroll_Clearing_dash', dataReturnRes3.taccountvs1[1].fields.Balance||0);
                    localStorage.setItem('VS1TAccount_Petty_Cash_dash', dataReturnRes3.taccountvs1[2].fields.Balance||0);
                    localStorage.setItem('VS1TAccount_Payroll_Bank_dash', dataReturnRes3.taccountvs1[3].fields.Balance||0);
                    localStorage.setItem('VS1TAccount_Offset_Account_dash', dataReturnRes3.taccountvs1[4].fields.Balance||0);
                  }
                }else if (oReq3.status != 200){

                  setTimeout(function () {
                    if(url){
                      window.open(url,'_self');
                    }else{
                      location.reload(true);
                    }
                  }, 10000);
                }
            }
          }else{
            setTimeout(function () {
              if(url){
                window.open(url,'_self');
              }else{
                location.reload(true);
              }
            }, 10000);
          }
          //if(responseBack.ResponseStatus == )
            //Meteor._reload.reload();
        }else if (oReq.status != 200){
          setTimeout(function () {
            if(url){
              window.open(url,'_self');
            }else{
              location.reload(true);
            }
          }, 10000);
        }
    }


    sideBarService.getCurrentLoggedUser().then(function (data) {
      addVS1Data('TAppUser', JSON.stringify(data));
    });
};

getHour24 = function (timeString) {
  let time = null;
  let timeSplit = timeString.split(':'),
      hours,
      minutes,
      meridian;
    hours = timeSplit[0];
    minutes = timeSplit[1];
    if (hours > 12) {
      meridian = 'PM';
      hours -= 12;
    } else if (hours < 12) {
      meridian = 'AM';
      if (hours == 0) {
        hours = 12;
      }
    } else {
      meridian = 'PM';
    }

let getTimeString = hours + ':' + minutes + ' ' + meridian;
var matches = getTimeString.match(/^(0?[1-9]|1[012])(:[0-5]\d) [APap][mM]$/);

 if (matches != null && matches.length == 3){

     time = parseInt(matches[1]);
     if (meridian == 'PM'){
       if(time >= 1 && time < 12){
         time += 12;
       }else if(time == 12){
         time = 12;
       }
     }
 }
return time + ':' + minutes;
};


vs1GlobalBackButton = async function () {
  jQuery(document).ready(async function($) {
     window.onpopstate = async function(event) {
      if(JSON.stringify(event.state) == "forward"){
        let lastPageVisitUrl = "";
        if(localStorage.getItem('vs1lastvisiturl') !== undefined){
          lastPageVisitUrl = localStorage.getItem('vs1lastvisiturl');
          await window.open(lastPageVisitUrl, '_self');
        }
      }
    }
 });
};

tableResize = function() {
  setTimeout(function() {
    const tableHandler = new TableHandler();
    $('.dataTables_filter input[type="search"]').attr("placeholder", "Search List...");
    $('.dataTables_filter label:contains("Search:")').each(function(){
      $(this).html($(this).html().split("Search:").join(""));
    });
  }, 2500);
  setTimeout(function() {
    $('.dataTables_filter input[type="search"]').attr("placeholder", "Search List...");
    $('.dataTables_filter label:contains("Search:")').each(function(){
      $(this).html($(this).html().split("Search:").join(""));
    });
  }, 1000);
};

// $(window).load(function() {
//
// });

//$(document).ready(function(){
// $(window).unload(function(){
//   if(Session.get('mycloudLogonID')){
//     CloudUser.update({_id: Session.get('mycloudLogonID')},{ $set: {userMultiLogon: false}});
//   }
// });
//});

cleanPrice = async function( amount ){
  if( isNaN(amount) || !amount){
      amount = ( amount === undefined || amount === null || amount.length === 0 ) ? 0 : amount;
      amount = ( amount )? Number(amount.replace(/[^0-9.-]+/g,"")): 0;
  }
  return amount;
}

isAdditionalModulePurchased = async function( moduleName ){
  let purchaedAdModuleList = []
  let additionModuleSettings = await getVS1Data('vscloudlogininfo');
  if( additionModuleSettings.length > 0 ){
      let additionModules = additionModuleSettings[0].data.ProcessLog.Modules.Modules;
      if( additionModules.length > 0 ){
          let adModulesList = additionModules.filter((item) => {
              if( item.ModuleActive == true && item.ModuleName == moduleName ){
                  return item;
              }
          });

          if( adModulesList.length > 0 ){
              return true
          }
          return false
      }
  }
  return false
}




handleValidationError = async function ( errorMessage, fieldID ) {
  swal({
      title: errorMessage,
      type: 'warning',
      showCancelButton: false,
      confirmButtonText: 'OK'
  }).then((result) => {
      if (result.value) {
          if (result.value) {
              $(`#${fieldID}`).focus();
          }
      }
  });
}

playCancelAudio = function () {
  var audioElement = document.createElement('audio');
  audioElement.setAttribute('src', 'sounds/Cancel.mp3');
  audioElement.play();
}

playCopyAudio = function () {
  var audioElement = document.createElement('audio');
  audioElement.setAttribute('src', 'sounds/Copy.mp3');
  audioElement.play();
}

playDeleteAudio = function () {
  var audioElement = document.createElement('audio');
  audioElement.setAttribute('src', 'sounds/Delete.mp3');
  audioElement.play();
}

playEmailAudio = function () {
  var audioElement = document.createElement('audio');
  audioElement.setAttribute('src', 'sounds/Email.mp3');
  audioElement.play();
}

playPrintAudio = function () {
  var audioElement = document.createElement('audio');
  audioElement.setAttribute('src', 'sounds/Print.mp3');
  audioElement.play();
}

playSaveAudio = function () {
  var audioElement = document.createElement('audio');
  audioElement.setAttribute('src', 'sounds/Save.mp3');
  audioElement.play();
}
checkSetupFinished = function () {
  let setupFinished = localStorage.getItem("IS_SETUP_FINISHED") || "";
  if( setupFinished === null || setupFinished ===  "" ){
    let ERPIPAddress = localStorage.getItem('EIPAddress');
    let ERPUsername = localStorage.getItem('EUserName');
    let ERPPassword = localStorage.getItem('EPassword');
    let ERPDatabase = localStorage.getItem('EDatabase');
    let ERPPort = localStorage.getItem('EPort');
    const apiUrl = `${URLRequest}${ERPIPAddress}:${ERPPort}/erpapi/TCompanyInfo?PropertyList=ID,IsSetUpWizard`;
    const _headers = {
        database: ERPDatabase,
        username: ERPUsername,
        password: ERPPassword
    };
    Meteor.http.call("GET", apiUrl, { headers: _headers }, (error, result) => {
        if (error) {
          // handle error here
        } else {
          if(result.data != undefined) {
            if( result.data.tcompanyinfo.length > 0 ){
              let data = result.data.tcompanyinfo[0];
              localStorage.setItem("IS_SETUP_FINISHED", data.IsSetUpWizard)
              return data.IsSetUpWizard;
            }
          }     
        }
    });
  }else{
    return setupFinished;
  }
}

convertStrMonthToNum = function (strMonths) {
  let arrMonths = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  let ret = [];
  let arrStrMonths = strMonths.split(",");
  let i = 0, idx = -1;
  let mm = "";
  for (i=0; i<arrStrMonths.length; i++) {
      idx = arrMonths.indexOf(arrStrMonths[i]) + 1;
      mm = ("0" + idx).toString().slice(-2);
      ret.push(mm);
  }
  return ret;
}

getRepeatDates = function(startFrom, endBy, months, repdate) {
  let ret = [];
  let arrStartFrom = startFrom.split("-");
  let arrEndBy = endBy.split("-");
  let startYear = arrStartFrom[0];
  let startMonth = arrStartFrom[1];
  let startDate = arrStartFrom[2];
  let endYear = arrEndBy[0];
  let endMonth = arrEndBy[1];
  let endDate = arrEndBy[2];
  let i=0, j=0, k=0;
  let mm = "";
  for (j=parseInt(startMonth); j<=12; j++) {
      mm = ("0" + j).toString().slice(-2);
      if (months.includes(mm) && parseInt(repdate) >= parseInt(startDate)) {
          ret.push({
              "Dates": startYear + "-" + mm + "-" + repdate
          });
      }
  }
  for (i=parseInt(startYear)+1; i<parseInt(endYear); i++) {
      for (j=0; j<months.length; j++) {
          ret.push({
              "Dates": i + "-" + months[j] + "-" + repdate
          });
      }
  }
  for (j=1; j<=parseInt(endMonth); j++) {
      mm = ("0" + j).toString().slice(-2);
      if (j < parseInt(endMonth)) {
          if (months.includes(mm)) {
              ret.push({
                  "Dates": endYear + "-" + mm + "-" + repdate
              });
          }
      } else {
          if (months.includes(mm) && parseInt(repdate) <= parseInt(endDate)) {
              ret.push({
                  "Dates": endYear + "-" + mm + "-" + repdate
              });
          }
      }
  }
  return ret;
};

convertDateFormatForPrint = function(pDate) {
  let ret = "";
  let sMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let arrDate = pDate.split("/");
  ret = arrDate[0] + "-" + sMonths[parseInt(arrDate[1]) - 1] + "-" + arrDate[2].substring(2, 4);
  return ret;
}

convertDateFormatForPrint2 = function(pDate) {
  let ret = "";
  let sMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let arrDate = pDate.split("/");
  ret = arrDate[0] + " " + sMonths[parseInt(arrDate[1]) - 1] + " " + arrDate[2];
  return ret;
}

convertDateFormatForPrint3 = function(pDate) {
  let ret = "";
  let sMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  let arrDate = pDate.split("/");
  ret = arrDate[0] + " " + sMonths[parseInt(arrDate[1]) - 1] + " " + arrDate[2];
  return ret;
}

initTemplateHeaderFooter1 = function() {
  $("#templatePreviewModal #printcomment").text("");
  $("#templatePreviewModal .o_abn_label").text("");
  $("#templatePreviewModal .o_abn").text("");
  $("#templatePreviewModal .pdfCustomerAddress").empty();
  $("#templatePreviewModal .employeeName").text("");
  $("#templatePreviewModal .print-header").text("");
  $("#templatePreviewModal .modal-title").text("");
  $("#templatePreviewModal .print-header-value").text("");
  $("#templatePreviewModal .bankname").text("");
  $("#templatePreviewModal .bankdesc").text("");
  $("#templatePreviewModal .ban").text("");
  $("#templatePreviewModal .bsb").text("");
  $("#templatePreviewModal .account_number").text("");
  $("#templatePreviewModal .swift").text("");
  $("#templatePreviewModal .dateNumber").text("");
  $("#templatePreviewModal .companyInfo1").text("");
  $("#templatePreviewModal .companyInfo2").text("");
  $("#templatePreviewModal .companyInfo3").text("");
  $("#templatePreviewModal .date").text("");
  $("#templatePreviewModal .po").text("");
  $("#templatePreviewModal .io").text("");
  $("#templatePreviewModal .ro").text("");
  $("#templatePreviewModal .due").text("");
}

initTemplateHeaderFooter2 = function() {
  $("#templatePreviewModal #printcomment2").text("");
  $("#templatePreviewModal .pdfCustomerAddress2").empty();
  $("#templatePreviewModal .print-header2").text("");
  $("#templatePreviewModal .modal-title").text("");
  $("#templatePreviewModal .bankname2").text("");
  $("#templatePreviewModal .ban2").text("");
  $("#templatePreviewModal .bsb2").text("");
  $("#templatePreviewModal .account_number2").text("");
  $("#templatePreviewModal .o_name2").text("");
  $("#templatePreviewModal .o_address2").text("");
  $("#templatePreviewModal .o_city2").text("");
  $("#templatePreviewModal .o_state2").text("");
  $("#templatePreviewModal .o_phone2").text("");
  $("#templatePreviewModal .o_email2").text("");
  $("#templatePreviewModal .o_abn_label2").text("");
  $("#templatePreviewModal .o_abn2").text("");
  $("#templatePreviewModal .date2").text("");
  $("#templatePreviewModal .io2").text("");
  $("#templatePreviewModal .ro2").text("");
  $("#templatePreviewModal .due2").text("");
}

initTemplateHeaderFooter3 = function() {
  $("#templatePreviewModal .pdfCustomerAddress3").empty();
  $("#templatePreviewModal .print-header3").text("");
  $("#templatePreviewModal .toLabel3").text("");
  $("#templatePreviewModal .dateLabel3").text("");
  $("#templatePreviewModal .modal-title").text("");
  $("#templatePreviewModal .bankname3").text("");
  $("#templatePreviewModal .ban3").text("");
  $("#templatePreviewModal .swift3").text("");
  $("#templatePreviewModal .account_number3").text("");
  $("#templatePreviewModal .o_name3").text("");
  $("#templatePreviewModal .o_address3").text("");
  $("#templatePreviewModal .o_city3").text("");
  $("#templatePreviewModal .o_state3").text("");
  $("#templatePreviewModal .o_phone3").text("");
  $("#templatePreviewModal .o_email3").text("");
  $("#templatePreviewModal .o_url3").text("");
  $("#templatePreviewModal .o_abn_label3").text("");
  $("#templatePreviewModal .o_abn3").text("");
  $("#templatePreviewModal .date3").text("");
  $("#templatePreviewModal .io3").text("");
  $("#templatePreviewModal .ro3").text("");
  $("#templatePreviewModal .po3").text("");
  $("#templatePreviewModal .amountdue3").text("");
  $("#templatePreviewModal .due3").text("");
  $("#templatePreviewModal .termdays").text("");
  $("#templatePreviewModal .termdesc").text("");
}

loadTemplateHeaderFooter1 = function(object_invoce) {
  if (object_invoce.length > 0) {
      let pcomment = object_invoce[0]["comment"];
      if (pcomment != "" && pcomment != null && pcomment != undefined)
        pcomment = pcomment.replace(/[\r\n]/g, "<br/>");
      $("#templatePreviewModal #printcomment").text(pcomment);
      
      if (LoggedCountry == "South Africa")
          $("#templatePreviewModal .o_abn_label").text("VAT No");
      else
          $("#templatePreviewModal .o_abn_label").text("ABN");
      let companyABN = object_invoce[0]["o_abn"];
      $("#templatePreviewModal .o_abn").text(companyABN.substring(0, 2) + "-" + companyABN.substring(2, 5) + "-" + companyABN.substring(5, 8) + "-" + companyABN.substring(8, companyABN.length));
      
      let txabillingAddress = object_invoce[0]["supplier_addr"];
      if (txabillingAddress != "" && txabillingAddress != null && txabillingAddress != undefined)
          txabillingAddress = txabillingAddress.replace(/[\r\n]/g, "<br/>");
      $("#templatePreviewModal .pdfCustomerAddress").html(txabillingAddress);
      $("#templatePreviewModal .employeeName").text(object_invoce[0]["employee_name"]);
      $("#templatePreviewModal .print-header").text(object_invoce[0]["title"]);
      $("#templatePreviewModal .modal-title").text(object_invoce[0]["title"] + " " + " Template");
      $("#templatePreviewModal .print-header-value").text(object_invoce[0]["value"]);
      
      $("#templatePreviewModal .bankname").text(localStorage.getItem("vs1companyBankName"));
      $("#templatePreviewModal .bankdesc").text(localStorage.getItem("vs1companyBankDesc"));
      $("#templatePreviewModal .ban").text("Name : " + localStorage.getItem('vs1companyBankAccountName'));
      $("#templatePreviewModal .bsb").text("BSB (Branch Number) : " + object_invoce[0]["bsb"]);
      $("#templatePreviewModal .account_number").text("Account Number : " + object_invoce[0]["account"]);
      $("#templatePreviewModal .swift").text("Swift Code : " + object_invoce[0]["swift"]);
  
      let companyName = Session.get("vs1companyName");
      let companyReg = Session.get("vs1companyReg");
      if (companyReg != "")
          $("#templatePreviewModal .companyInfo1").text(companyName + " - ACN " + companyReg.substring(0, 3) + " " + companyReg.substring(3, 6) + " " + companyReg.substring(6, companyReg.length));
      else
          $("#templatePreviewModal .companyInfo1").text(companyName + " - ACN ");
      let companyAddr = Session.get("vs1companyaddress1");
      if (companyAddr == "")
          companyAddr = Session.get("vs1companyaddress2");
      let companyCity = Session.get("vs1companyCity");
      let companyState = Session.get("companyState");
      let companyPostcode = Session.get("vs1companyPOBox");
      let companyCountry = Session.get("vs1companyCountry");
      $("#templatePreviewModal .companyInfo2").text(companyAddr + ", " + companyCity + ", " + companyState + " " + companyPostcode + ", " + companyCountry);
      let companyPhone = Session.get("vs1companyPhone");
      if (companyPhone != "")
          $("#templatePreviewModal .companyInfo3").text("Ph: " + companyPhone.substring(0, 2) + " " + companyPhone.substring(2, 6) + " " + companyPhone.substring(6, companyPhone.length));
  
      if (object_invoce[0]["date"] != "")
          $("#templatePreviewModal .date").text(convertDateFormatForPrint(object_invoce[0]["date"]));
      $("#templatePreviewModal .po").text(object_invoce[0]["pqnumber"]);
      $("#templatePreviewModal .io").text(object_invoce[0]["invoicenumber"]);
      $("#templatePreviewModal .ro").text(object_invoce[0]["refnumber"]);
      if (object_invoce[0]["duedate"] != "")
          $("#templatePreviewModal .due").text(convertDateFormatForPrint(object_invoce[0]["duedate"]));

      //   table header
      var tbl_header = $("#templatePreviewModal .tbl_header");
      tbl_header.empty();
      for (const [key, value] of Object.entries(object_invoce[0]["fields"])) {
          tbl_header.append(
          "<th style='width: " + value[0] + "%; color: rgb(0 0 0); text-align: " + value[1] + ";'>" + key + "</th>"
          );
      }
  }
}

loadTemplateHeaderFooter2 = function(object_invoce) {
  if (object_invoce.length > 0) {
      let pcomment = object_invoce[0]["comment"];
      if (pcomment != "" && pcomment != null && pcomment != undefined)
        pcomment = pcomment.replace(/[\r\n]/g, "<br/>");
      $("#templatePreviewModal #printcomment2").text(pcomment);
      
      $("#templatePreviewModal .pdfCustomerAddress2").empty();
      let txabillingAddress = object_invoce[0]["supplier_addr"];
      if (txabillingAddress != "" && txabillingAddress != null && txabillingAddress != undefined)
          txabillingAddress = txabillingAddress.replace(/[\r\n]/g, "<br/>");
      $("#templatePreviewModal .pdfCustomerAddress2").html(txabillingAddress);
      $("#templatePreviewModal .print-header2").text(object_invoce[0]["title"]);
      $("#templatePreviewModal .modal-title").text(object_invoce[0]["title"] + " " + " Template");
  
      $("#templatePreviewModal .bankname2").text("BANK : " + localStorage.getItem("vs1companyBankName"));
      $("#templatePreviewModal .ban2").text("Name : " + localStorage.getItem('vs1companyBankAccountName'));
      $("#templatePreviewModal .bsb2").text("BSB : " + object_invoce[0]["bsb"]);
      $("#templatePreviewModal .account_number2").text("ACC : " + object_invoce[0]["account"]);
      
      let companyName = Session.get("vs1companyName");
      let companyReg = Session.get("vs1companyReg");
      let companyAddr = Session.get("vs1companyaddress1");
      if (companyAddr == "")
          companyAddr = Session.get("vs1companyaddress2");
      let companyCity = Session.get("vs1companyCity");
      let companyState = Session.get("companyState");
      let companyPostcode = Session.get("vs1companyPOBox");
      let companyCountry = Session.get("vs1companyCountry");
      let companyPhone = Session.get("vs1companyPhone");

      $("#templatePreviewModal .o_name2").text(companyName);
      $("#templatePreviewModal .o_address2").text(companyAddr);
      $("#templatePreviewModal .o_city2").text(companyCity);
      $("#templatePreviewModal .o_state2").text(companyState + " " + companyPostcode);
      if (companyPhone != "")
          $("#templatePreviewModal .o_phone2").text(companyPhone.substring(0, 4) + " " + companyPhone.substring(4, 7) + " " + companyPhone.substring(7, companyPhone.length));
      $("#templatePreviewModal .o_email2").text(localStorage.getItem("VS1Accountant"));
  
      if (LoggedCountry == "South Africa")
          $("#templatePreviewModal .o_abn_label2").text("VAT No");
      else
          $("#templatePreviewModal .o_abn_label2").text("ABN");
      
      let companyABN = object_invoce[0]["o_abn"];
      if (companyABN != "")
          $("#templatePreviewModal .o_abn2").text(companyABN.substring(0, 2) + " " + companyABN.substring(2, 5) + " " + companyABN.substring(5, 8) + " " + companyABN.substring(8, companyABN.length));
      
      if (object_invoce[0]["date"] != "")
          $("#templatePreviewModal .date2").text(convertDateFormatForPrint2(object_invoce[0]["date"]));
  
      $("#templatePreviewModal .io2").text(object_invoce[0]["invoicenumber"]);
      $("#templatePreviewModal .ro2").text(object_invoce[0]["refnumber"]);
      if (object_invoce[0]["duedate"] != "")
          $("#templatePreviewModal .due2").text(convertDateFormatForPrint2(object_invoce[0]["duedate"]));
  
      //   table header
      var tbl_header = $("#templatePreviewModal .tbl_header");
      tbl_header.empty();
      for (const [key, value] of Object.entries(object_invoce[0]["fields"])) {
          tbl_header.append(
              "<th style='width: " + value[0] + "%; color: #000000; text-align: " + value[1] + ";'>" + key + "</th>"
          );
      }
  }
}

loadTemplateHeaderFooter3 = function(object_invoce) {
  if (object_invoce.length > 0) {
      $("#templatePreviewModal .pdfCustomerAddress3").empty();
      let txabillingAddress = object_invoce[0]["supplier_addr"];
      if (txabillingAddress != "" && txabillingAddress != null && txabillingAddress != undefined)
          txabillingAddress = txabillingAddress.replace(/[\r\n]/g, "<br/>");
      $("#templatePreviewModal .pdfCustomerAddress3").html(txabillingAddress);
      $("#templatePreviewModal .print-header3").text(object_invoce[0]["title"].toUpperCase());
      $("#templatePreviewModal .toLabel3").text(object_invoce[0]["title"].toUpperCase() + " TO: ");
      $("#templatePreviewModal .dateLabel3").text(object_invoce[0]["title"].toUpperCase() + " DATE: ");
      //   $("#templatePreviewModal .invNumber3").text(object_invoce[0]["title"].toUpperCase() + " NUMBER");
      $("#templatePreviewModal .modal-title").text(
          object_invoce[0]["title"] + " " + " Template"
      );
      $("#templatePreviewModal .bankname3").text(localStorage.getItem("vs1companyBankName"));
      $("#templatePreviewModal .ban3").text(localStorage.getItem('vs1companyBankAccountName'));
      $("#templatePreviewModal .swift3").text(object_invoce[0]["swift"]);
      $("#templatePreviewModal .account_number3").text(object_invoce[0]["account"]);
      
      let companyName = Session.get("vs1companyName");
      let companyReg = Session.get("vs1companyReg");
      let companyAddr = Session.get("vs1companyaddress1");
      if (companyAddr == "")
          companyAddr = Session.get("vs1companyaddress2");
      let companyCity = Session.get("vs1companyCity");
      let companyState = Session.get("companyState");
      let companyPostcode = Session.get("vs1companyPOBox");
      let companyCountry = Session.get("vs1companyCountry");
      let companyPhone = Session.get("vs1companyPhone");
      let companyURL = Session.get("vs1companyURL");

      $("#templatePreviewModal .o_name3").text(companyName);
      $("#templatePreviewModal .o_address3").text(companyAddr);
      $("#templatePreviewModal .o_city3").text(companyCity);
      $("#templatePreviewModal .o_state3").text(companyState + " " + companyPostcode);
      if (companyPhone != "")
          $("#templatePreviewModal .o_phone3").text(companyPhone.substring(0, 4) + " " + companyPhone.substring(4, 7) + " " + companyPhone.substring(7, companyPhone.length));
      $("#templatePreviewModal .o_email3").text(localStorage.getItem("VS1Accountant"));
      $("#templatePreviewModal .o_url3").text(companyURL);
  
      if (LoggedCountry == "South Africa")
          $("#templatePreviewModal .o_abn_label3").text("VAT No:");
      else
          $("#templatePreviewModal .o_abn_label3").text("ABN:");
      
      let companyABN = object_invoce[0]["o_abn"];
      if (companyABN != "")
          $("#templatePreviewModal .o_abn3").text(companyABN.substring(0, 2) + " " + companyABN.substring(2, 5) + " " + companyABN.substring(5, 8) + " " + companyABN.substring(8, companyABN.length));
      
      if (object_invoce[0]["date"] != "")
          $("#templatePreviewModal .date3").text(convertDateFormatForPrint3(object_invoce[0]["date"]));
      $("#templatePreviewModal .io3").text(object_invoce[0]["invoicenumber"]);
      $("#templatePreviewModal .ro3").text(object_invoce[0]["refnumber"]);
      $("#templatePreviewModal .po3").text(object_invoce[0]["pqnumber"]);
      $("#templatePreviewModal .amountdue3").text(object_invoce[0]["bal_due"]);
  
      if (object_invoce[0]["duedate"] != "")
          $("#templatePreviewModal .due3").text(convertDateFormatForPrint2(object_invoce[0]["duedate"]));
      $("#templatePreviewModal .termdays").text($("#sltTerms").val());
      $("#templatePreviewModal .termdesc").text(Session.get("ERPTermDesc") || "-");
  
      //   table header
      var tbl_header = $("#templatePreviewModal .tbl_header");
      tbl_header.empty();
      for (const [key, value] of Object.entries(object_invoce[0]["fields"])) {
          tbl_header.append(
              "<th style='width: " + value[0] + "%; background-color: #00949E; color: white; text-align: " + value[1] + ";'>" + key + "</th>"
          );
      }
  }  
}