import {ReportService} from "../report-service";
import 'jQuery.print/jQuery.print.js';
import {UtilityService} from "../../utility-service";
import { TaxRateService } from "../../settings/settings-service";
import GlobalFunctions from "../../GlobalFunctions";
import LoadingOverlay from "../../LoadingOverlay";
import CachedHttp from "../../lib/global/CachedHttp";
import FxGlobalFunctions from "../../packages/currency/FxGlobalFunctions";
import Datehandler from "../../DateHandler";


const reportService = new ReportService();
const utilityService = new UtilityService();
const taxRateService = new TaxRateService();
let defaultCurrencyCode = CountryAbbr;

const currentDate = new Date();

Template.productsalesreport.onCreated(()=>{
  const templateObject = Template.instance();
  templateObject.records = new ReactiveVar([]);
  templateObject.grandRecords = new ReactiveVar();
  templateObject.dateAsAt = new ReactiveVar();
  templateObject.deptrecords = new ReactiveVar();


  FxGlobalFunctions.initVars(templateObject);
});

Template.productsalesreport.onRendered(()=>{
  LoadingOverlay.show();
  const templateObject = Template.instance();

  templateObject.initDate = () => {
    Datehandler.initOneMonth();
  };

  templateObject.setDateAs = ( dateFrom = null ) => {
    templateObject.dateAsAt.set( ( dateFrom )? moment(dateFrom).format("DD/MM/YYYY") : moment().format("DD/MM/YYYY") )
  };

  templateObject.initUploadedImage = () => {
    let imageData = localStorage.getItem("Image");
    if (imageData) {
      $("#uploadedImage").attr("src", imageData);
      $("#uploadedImage").attr("width", "50%");
    }
  };


    templateObject.loadReport = async (dateFrom = null, dateTo = null, ignoreDate = false) => {
      LoadingOverlay.show();
      const _data = await CachedHttp.get("TProductSalesDetailsReport", async () => {
        return await reportService.getAllProductSalesDetails(dateFrom, dateTo, ignoreDate);
      }, {
        useIndexDb: true,
        useLocalStorage: false,
        requestParams: {
          DateFrom: dateFrom,
          DateTo: dateTo,
          IgnoreDates: ignoreDate
        },
        validate: cachedResponse => {
          if (GlobalFunctions.isSameDay(cachedResponse.response.Params.DateFrom, dateFrom)
          && GlobalFunctions.isSameDay(cachedResponse.response.Params.DateTo, dateTo)
          && cachedResponse.response.Params.IgnoreDates == ignoreDate) {
            return true;
          }
          return false;
        }
      });
      const data = _data.response;

      if (data.tproductsalesdetailsreport.length) {
        // localStorage.setItem("VS1ProductSales_Report", JSON.stringify(data) || "");
        let records = [];
        let allRecords = [];

        let accountData = data.tproductsalesdetailsreport;

        accountData.forEach(account => {
          let recordObj = {
            Id: account.TransactionNo,
            type: account.TransactionType,
            Company: account.ProductName,
            entries: account
          };

          if (account.TransactionType != "Sales Order" && account.TransactionType != "Quote") {
            records.push(recordObj);
          }
        });

        records = _.sortBy(records, "Company");
        records = _.groupBy(records, "Company");

        /**
             * This will calculate total of a record
             * @param {Array} entries
             * @param {string} title
             * @returns
             */
        const calculateRecordTotal = (entries = [], title) => {
          let totalAmountEx = 0;
          let totalTax = 0;
          let amountInc = 0;
          let balance = 0;
          let twoMonth = 0;
          let threeMonth = 0;
          let Older = 0;
          let totalQty = 0;
          const currencyLength = Currency.length;

          entries.forEach(entry => {
            entry.entries.LineCostEx = entry.entries["Line Cost (Ex)"];
            entry.entries.TotalAmountEx = entry.entries["Total Amount (Ex)"];
            entry.entries.TotalProfitEx = entry.entries["Total Profit (Ex)"];

            totalQty = totalQty + entry.entries.Qty;
            totalTax = totalTax + parseFloat(entry.entries["Line Cost (Ex)"]);
            amountInc = amountInc + parseFloat(entry.entries["Total Amount (Ex)"]);
            balance = balance + parseFloat(entry.entries["Total Profit (Ex)"]);
          });

          return {
            title: "Total " + title,
            Qty: totalQty,
            Tax: totalTax,
            AmountInc: amountInc,
            Balance: balance
          };
        };

        for (let key in records) {
          allRecords.push({
            title: key,
            entries: records[key],
            total: calculateRecordTotal(records[key], key)
          });
        }

        /**
             * This will calculate grand total
             * @param {array} records
             * @returns
             */
        const calculateGrandAmount = (records = []) => {
          //grandtotalRecord
          let grandamountduetotal = 0;
          let grandtotalAmountEx = 0;
          let grandtotalTax = 0;
          let grandamountInc = 0;
          let grandbalance = 0;
          let grandtotalqty = 0;

          records.forEach(record => {
            const grandcurrencyLength = Currency.length;

            grandtotalqty = grandtotalqty + Number(record.total.Qty) || 0;
            // grandtotalAmountEx = grandtotalAmountEx + parseFloat(current[n][5]);
            grandtotalTax = grandtotalTax + parseFloat(record.total.Tax);
            grandamountInc = grandamountInc + parseFloat(record.total.AmountInc);
            grandbalance = grandbalance + parseFloat(record.total.Balance);
          });

          let grandVal = {
            title: "Grand Total ",
            Qty: grandtotalqty,
            Tax: grandtotalTax,
            AmountInc: grandamountInc,
            Balance: grandbalance
          };
          return grandVal;
        };

        const globalTotal = calculateGrandAmount(allRecords);

        templateObject.records.set(allRecords);
        templateObject.grandRecords.set(globalTotal);

        if (templateObject.records.get()) {
          setTimeout(function () {
            $("td a").each(function () {
              if ($(this).text().indexOf("-" + Currency) >= 0)
                $(this).addClass("text-danger");
              }
            );
            $("td").each(function () {
              if ($(this).text().indexOf("-" + Currency) >= 0)
                $(this).addClass("text-danger");
              }
            );

            $("td").each(function () {
              let lineValue = $(this).first().text()[0];
              if (lineValue != undefined) {
                if (lineValue.indexOf(Currency) >= 0)
                  $(this).addClass("text-right");
                }
              });

            $("td").each(function () {
              if ($(this).first().text().indexOf("-" + Currency) >= 0)
                $(this).addClass("text-right");
              }
            );

            $("td:nth-child(7)").each(function () {
              $(this).addClass("text-right");
            });

            LoadingOverlay.hide();
          }, 100);
        }
      }

      LoadingOverlay.hide();
    };


    templateObject.getSalesReports = function (dateFrom, dateTo, ignoreDate) {
      LoadingOverlay.show();
      templateObject.records.set('');
      templateObject.grandRecords.set('');
      if(!localStorage.getItem('VS1ProductSales_Report')){
        reportService.getAllProductSalesDetails(dateFrom, dateTo,ignoreDate).then(function (data) {
          let totalRecord = [];
          let grandtotalRecord = [];

        if(data.tproductsalesdetailsreport.length){
          localStorage.setItem('VS1ProductSales_Report', JSON.stringify(data)||'');
          let records = [];
          let allRecords = [];
          let current = [];

          let totalNetAssets = 0;
          let GrandTotalLiability = 0;
          let GrandTotalAsset = 0;
          let incArr = [];
          let cogsArr = [];
          let expArr = [];
          let accountData = data.tproductsalesdetailsreport;
          let accountType = '';
          let purchaseID = '';
          for (let i = 0; i < accountData.length; i++) {
            // if(data.tproductsalesdetailsreport[i].Type == "Bill"){
            //   purchaseID = data.tproductsalesdetailsreport[i].PurchaseOrderID;
            // }
            let recordObj = {};
          recordObj.Id = data.tproductsalesdetailsreport[i].TransactionNo;
          recordObj.type = data.tproductsalesdetailsreport[i].TransactionType;
          recordObj.Company = data.tproductsalesdetailsreport[i].ProductName;
          recordObj.dataArr = [
              '',
              data.tproductsalesdetailsreport[i].TransactionType,
              data.tproductsalesdetailsreport[i].TransactionNo,
              // moment(data.tproductsalesdetailsreport[i].InvoiceDate).format("DD MMM YYYY") || '-',
              data.tproductsalesdetailsreport[i].SaleDate !=''? moment(data.tproductsalesdetailsreport[i].SaleDate).format("DD/MM/YYYY"): data.tproductsalesdetailsreport[i].SaleDate,
              data.tproductsalesdetailsreport[i].CustomerName || '-',
              data.tproductsalesdetailsreport[i].Qty || 0,
              utilityService.modifynegativeCurrencyFormat(data.tproductsalesdetailsreport[i]['Line Cost (Ex)']) || '0.00',
              utilityService.modifynegativeCurrencyFormat(data.tproductsalesdetailsreport[i]['Total Amount (Ex)']) || '0.00',
              utilityService.modifynegativeCurrencyFormat(data.tproductsalesdetailsreport[i]['Total Profit (Ex)']) || '0.00'


              //
          ];

          // if((data.tproductsalesdetailsreport[i].TotalAmount != 0) || (data.tproductsalesdetailsreport[i].TotalTax != 0)
          // || (data.tproductsalesdetailsreport[i].TotalAmountinc != 0) || (data.tproductsalesdetailsreport[i].Balance != 0)){
          //
          // }
          if((data.tproductsalesdetailsreport[i].TransactionType != "Sales Order") && (data.tproductsalesdetailsreport[i].TransactionType != "Quote")){
            records.push(recordObj);
          }




        }


          records = _.sortBy(records, 'Company');
        records = _.groupBy(records, 'Company');
        for (let key in records) {
            let obj = [{key: key}, {data: records[key]}];
            allRecords.push(obj);
        }

        let iterator = 0;
      for (let i = 0; i < allRecords.length; i++) {
          let totalAmountEx = 0;
          let totalTax = 0;
          let amountInc = 0;
          let balance = 0;
          let twoMonth = 0;
          let threeMonth = 0;
          let Older = 0;
          let totalQty = 0;
          const currencyLength = Currency.length;
          for (let k = 0; k < allRecords[i][1].data.length; k++) {

              // totalAmountEx = totalAmountEx + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[5]);
              totalQty = totalQty + allRecords[i][1].data[k].dataArr[5];
              totalTax = totalTax + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[6]);
              amountInc = amountInc + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[7]);
              balance = balance + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[8]);

          }

          let val = ['Total ' + allRecords[i][0].key+'', '', '', '','',''+totalQty+'',
               utilityService.modifynegativeCurrencyFormat(totalTax), utilityService.modifynegativeCurrencyFormat(amountInc), utilityService.modifynegativeCurrencyFormat(balance)];
          current.push(val);

      }

//grandtotalRecord
let grandamountduetotal = 0;
let grandtotalAmountEx = 0;
let grandtotalTax = 0;
let grandamountInc = 0;
let grandbalance = 0;
let grandtotalqty = 0;

    for (let n = 0; n < current.length; n++) {

        const grandcurrencyLength = Currency.length;

             grandtotalqty = grandtotalqty + Number(current[n][5].replace(/[^0-9.-]+/g,"")) || 0;

             // grandtotalAmountEx = grandtotalAmountEx + utilityService.convertSubstringParseFloat(current[n][5]);
             grandtotalTax = grandtotalTax + utilityService.convertSubstringParseFloat(current[n][6]);
             grandamountInc = grandamountInc + utilityService.convertSubstringParseFloat(current[n][7]);
             grandbalance = grandbalance + utilityService.convertSubstringParseFloat(current[n][8]);


    }


    let grandval = ['Grand Total ' +  '', '', '','','',''+grandtotalqty+'',
    //utilityService.modifynegativeCurrencyFormat(grandtotalAmountEx),
        utilityService.modifynegativeCurrencyFormat(grandtotalTax),
        utilityService.modifynegativeCurrencyFormat(grandamountInc),
        utilityService.modifynegativeCurrencyFormat(grandbalance)];


      for (let key in records) {
          let dataArr = current[iterator]
          let obj = [{key: key}, {data: records[key]},{total:[{dataArr:dataArr}]}];
          totalRecord.push(obj);
          iterator += 1;
      }

        templateObject.records.set(totalRecord);
        templateObject.grandRecords.set(grandval);


        if(templateObject.records.get()){
          setTimeout(function () {
            $('td a').each(function(){
              if($(this).text().indexOf('-'+Currency) >= 0) $(this).addClass('text-danger')
               });
           $('td').each(function(){
             if($(this).text().indexOf('-'+Currency) >= 0) $(this).addClass('text-danger')
            });

            $('td').each(function(){

              let lineValue = $(this).first().text()[0];
              if(lineValue != undefined){
                if(lineValue.indexOf(Currency) >= 0) $(this).addClass('text-right')
              }

             });

             $('td').each(function(){
               if($(this).first().text().indexOf('-'+Currency) >= 0) $(this).addClass('text-right')
              });

              $('td:nth-child(7)').each(function(){
                $(this).addClass('text-right');
              });


              $('.fullScreenSpin').css('display','none');
          }, 100);
        }

      }else{
        let records = [];
        let recordObj = {};
        recordObj.Id = '';
        recordObj.type = '';
        recordObj.SupplierName = ' ';
        recordObj.dataArr = [
            '-',
            '-',
            '-',
            '-',
            '-',
            '-',
            '-',
            '-',
            '-',
           '-'
        ];

        records.push(recordObj);
        templateObject.records.set(records);
        templateObject.grandRecords.set('');
          $('.fullScreenSpin').css('display','none');
      }

        }).catch(function (err) {
          //Bert.alert('<strong>' + err + '</strong>!', 'danger');
            $('.fullScreenSpin').css('display','none');
        });
      }else{
        let data = JSON.parse(localStorage.getItem('VS1ProductSales_Report'));
        let totalRecord = [];
        let grandtotalRecord = [];
      if(data.tproductsalesdetailsreport.length){
        let records = [];
        let allRecords = [];
        let current = [];

        let totalNetAssets = 0;
        let GrandTotalLiability = 0;
        let GrandTotalAsset = 0;
        let incArr = [];
        let cogsArr = [];
        let expArr = [];
        let accountData = data.tproductsalesdetailsreport;
        let accountType = '';
        let purchaseID = '';
        for (let i = 0; i < accountData.length; i++) {
          // if(data.tproductsalesdetailsreport[i].Type == "Bill"){
          //   purchaseID = data.tproductsalesdetailsreport[i].PurchaseOrderID;
          // }
          let recordObj = {};
        recordObj.Id = data.tproductsalesdetailsreport[i].TransactionNo;
        recordObj.type = data.tproductsalesdetailsreport[i].TransactionType;
        recordObj.Company = data.tproductsalesdetailsreport[i].ProductName;
        recordObj.dataArr = [
            '',
            data.tproductsalesdetailsreport[i].TransactionType,
            data.tproductsalesdetailsreport[i].TransactionNo,
            // moment(data.tproductsalesdetailsreport[i].InvoiceDate).format("DD MMM YYYY") || '-',
            data.tproductsalesdetailsreport[i].SaleDate !=''? moment(data.tproductsalesdetailsreport[i].SaleDate).format("DD/MM/YYYY"): data.tproductsalesdetailsreport[i].SaleDate,
            data.tproductsalesdetailsreport[i].CustomerName || '-',
            data.tproductsalesdetailsreport[i].Qty || 0,
            utilityService.modifynegativeCurrencyFormat(data.tproductsalesdetailsreport[i]['Line Cost (Ex)']) || '0.00',
            utilityService.modifynegativeCurrencyFormat(data.tproductsalesdetailsreport[i]['Total Amount (Ex)']) || '0.00',
            utilityService.modifynegativeCurrencyFormat(data.tproductsalesdetailsreport[i]['Total Profit (Ex)']) || '0.00'


            //
        ];

        // if((data.tproductsalesdetailsreport[i].TotalAmount != 0) || (data.tproductsalesdetailsreport[i].TotalTax != 0)
        // || (data.tproductsalesdetailsreport[i].TotalAmountinc != 0) || (data.tproductsalesdetailsreport[i].Balance != 0)){
        //
        // }
        if((data.tproductsalesdetailsreport[i].TransactionType != "Sales Order") && (data.tproductsalesdetailsreport[i].TransactionType != "Quote")){
          records.push(recordObj);
        }




      }


        records = _.sortBy(records, 'Company');
      records = _.groupBy(records, 'Company');
      for (let key in records) {
          let obj = [{key: key}, {data: records[key]}];
          allRecords.push(obj);
      }

      let iterator = 0;
    for (let i = 0; i < allRecords.length; i++) {
        let totalAmountEx = 0;
        let totalTax = 0;
        let amountInc = 0;
        let balance = 0;
        let twoMonth = 0;
        let threeMonth = 0;
        let Older = 0;
        let totalQty = 0;
        const currencyLength = Currency.length;
        for (let k = 0; k < allRecords[i][1].data.length; k++) {

            // totalAmountEx = totalAmountEx + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[5]);
            totalQty = totalQty + allRecords[i][1].data[k].dataArr[5];
            totalTax = totalTax + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[6]);
            amountInc = amountInc + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[7]);
            balance = balance + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[8]);

        }

        let val = ['Total ' + allRecords[i][0].key+'', '', '', '','',''+totalQty+'',
             utilityService.modifynegativeCurrencyFormat(totalTax), utilityService.modifynegativeCurrencyFormat(amountInc), utilityService.modifynegativeCurrencyFormat(balance)];
        current.push(val);

    }

//grandtotalRecord
let grandamountduetotal = 0;
let grandtotalAmountEx = 0;
let grandtotalTax = 0;
let grandamountInc = 0;
let grandbalance = 0;
let grandtotalqty = 0;

  for (let n = 0; n < current.length; n++) {

      const grandcurrencyLength = Currency.length;

           grandtotalqty = grandtotalqty + Number(current[n][5].replace(/[^0-9.-]+/g,"")) || 0;

           // grandtotalAmountEx = grandtotalAmountEx + utilityService.convertSubstringParseFloat(current[n][5]);
           grandtotalTax = grandtotalTax + utilityService.convertSubstringParseFloat(current[n][6]);
           grandamountInc = grandamountInc + utilityService.convertSubstringParseFloat(current[n][7]);
           grandbalance = grandbalance + utilityService.convertSubstringParseFloat(current[n][8]);


  }


  let grandval = ['Grand Total ' +  '', '', '','','',''+grandtotalqty+'',
  //utilityService.modifynegativeCurrencyFormat(grandtotalAmountEx),
      utilityService.modifynegativeCurrencyFormat(grandtotalTax),
      utilityService.modifynegativeCurrencyFormat(grandamountInc),
      utilityService.modifynegativeCurrencyFormat(grandbalance)];


    for (let key in records) {
        let dataArr = current[iterator]
        let obj = [{key: key}, {data: records[key]},{total:[{dataArr:dataArr}]}];
        totalRecord.push(obj);
        iterator += 1;
    }

      templateObject.records.set(totalRecord);
      templateObject.grandRecords.set(grandval);


      if(templateObject.records.get()){
        setTimeout(function () {
          $('td a').each(function(){
            if($(this).text().indexOf('-'+Currency) >= 0) $(this).addClass('text-danger')
             });
         $('td').each(function(){
           if($(this).text().indexOf('-'+Currency) >= 0) $(this).addClass('text-danger')
          });

          $('td').each(function(){

            let lineValue = $(this).first().text()[0];
            if(lineValue != undefined){
              if(lineValue.indexOf(Currency) >= 0) $(this).addClass('text-right')
            }

           });

           $('td').each(function(){
             if($(this).first().text().indexOf('-'+Currency) >= 0) $(this).addClass('text-right')
            });

            $('td:nth-child(7)').each(function(){
              $(this).addClass('text-right');
            });


            $('.fullScreenSpin').css('display','none');
        }, 100);
      }

    }else{
      let records = [];
      let recordObj = {};
      recordObj.Id = '';
      recordObj.type = '';
      recordObj.SupplierName = ' ';
      recordObj.dataArr = [
          '-',
          '-',
          '-',
          '-',
          '-',
          '-',
          '-',
          '-',
          '-',
         '-'
      ];

      records.push(recordObj);
      templateObject.records.set(records);

      templateObject.grandRecords.set('');
        $('.fullScreenSpin').css('display','none');
    }

      }
    };



    templateObject.getDepartments = function(){
      reportService.getDepartment().then(function(data){
        let deptrecords = [];
        for(let i in data.tdeptclass){

          let deptrecordObj = {
            id: data.tdeptclass[i].Id || ' ',
            department: data.tdeptclass[i].DeptClassName || ' ',
          };

          deptrecords.push(deptrecordObj);
          templateObject.deptrecords.set(deptrecords);

        }

    });

    }
    // templateObject.getAllProductData();


    templateObject.initDate();
    templateObject.getDepartments();
    templateObject.initUploadedImage();
    templateObject.loadReport(
      GlobalFunctions.convertYearMonthDay($('#dateFrom').val()),
      GlobalFunctions.convertYearMonthDay($('#dateTo').val()),
    false);
    templateObject.setDateAs( GlobalFunctions.convertYearMonthDay($('#dateFrom').val()) )
    LoadingOverlay.hide();
  });

  Template.productsalesreport.events({
    'click .btnRefresh': function () {
      LoadingOverlay.show();
      localStorage.setItem('VS1ProductSales_Report', '');
      Meteor._reload.reload();
    },
    'click td a':function (event) {
        let redirectid = $(event.target).closest('tr').attr('id');

        let transactiontype = $(event.target).closest('tr').attr('class');;

        if(redirectid && transactiontype){
          if(transactiontype === 'Quote' ){
            window.open('/quotecard?id=' + redirectid,'_self');
          }else if(transactiontype === 'Sales Order'){
            window.open('/salesordercard?id=' + redirectid,'_self');
          }else if(transactiontype === 'Invoice'){
            window.open('/invoicecard?id=' + redirectid,'_self');
          }else if(transactiontype === 'Customer Payment'){
            // window.open('/paymentcard?id=' + redirectid,'_self');
          }
        }
        // window.open('/balancetransactionlist?accountName=' + accountName+ '&toDate=' + toDate + '&fromDate=' + fromDate + '&isTabItem='+false,'_self');
    },
    'click .btnPrintReport':function (event) {
      $('.fullScreenSpin').css('display', 'inline-block')
      playPrintAudio();
      setTimeout(async function(){
        let targetElement = document.getElementsByClassName('printReport')[0];
        targetElement.style.width = "210mm";
        targetElement.style.backgroundColor = "#ffffff";
        targetElement.style.padding = "20px";
        targetElement.style.height = "fit-content";
        targetElement.style.fontSize = "13.33px";
        targetElement.style.color = "#000000";
        targetElement.style.overflowX = "visible";
        let targetTds = $(targetElement).find('.table-responsive #tableExport.table td');
        let targetThs = $(targetElement).find('.table-responsive #tableExport.table th');
        for (let k = 0; k< targetTds.length; k++) {
            $(targetTds[k]).attr('style', 'min-width: 0px !important')
            $(targetTds[k]).attr('style', 'max-width: 120px !important')
        }
        for (let j = 0; j< targetThs.length; j++) {
            $(targetThs[j]).attr('style', 'min-width: 0px !important')
            $(targetThs[j]).attr('style', 'max-width: 120px !important')
        }
        

        let docTitle = "Product Sales Report.pdf";


        var opt = {
            margin: 0,
            filename: docTitle,
            image: {
                type: 'jpeg',
                quality: 0.98
            },
            html2canvas: {
                scale: 2
            },
            jsPDF: {
                unit: 'in',
                format: 'a4',
                orientation: 'portrait'
            }
        };
        let source = targetElement;

        async function getAttachments () {
          return new Promise(async(resolve, reject)=> {
            html2pdf().set(opt).from(source).toPdf().output('datauristring').then(function(dataObject){
              let pdfObject = "";
              let base64data = dataObject.split(',')[1];
              pdfObject = {
                filename: docTitle,
                content: base64data,
                encoding: 'base64'
              }
              let attachments = [];
              attachments.push(pdfObject);
              resolve(attachments)
            })
          })
        }

        async function checkBasedOnType() {
          return new Promise(async(resolve, reject)=>{
            let values = [];
            let basedOnTypeStorages = Object.keys(localStorage);
            basedOnTypeStorages = basedOnTypeStorages.filter((storage) => {
                let employeeId = storage.split('_')[2];
                return storage.includes('BasedOnType_');
                // return storage.includes('BasedOnType_') && employeeId == Session.get('mySessionEmployeeLoggedID')
            });
    
            let i = basedOnTypeStorages.length;
            if (i > 0) {
                while (i--) {
                    values.push(localStorage.getItem(basedOnTypeStorages[i]));
                }
            }
            for(let j = 0; j<values.length; j++) {
              let value = values[j];
              let reportData = JSON.parse(value);
              reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
              if (reportData.BasedOnType.includes("P")) {
                  if (reportData.FormID == 1) {
                      let formIds = reportData.FormIDs.split(',');
                      if (formIds.includes("1464")) {
                          reportData.FormID = 1464;
                          reportData.attachments = await getAttachments()
                          Meteor.call('sendNormalEmail', reportData);
                          resolve()
                      }
                  } else {
                      if (reportData.FormID == 1464) {
                        reportData.attachments = await getAttachments()
                        Meteor.call('sendNormalEmail', reportData);
                        resolve()
                      }
                  }
              }
              if(j== values.length-1) {resolve()}
            }
          })
        }

        await checkBasedOnType()
        $('.fullScreenSpin').css('display', 'none')

        document.title = 'Product Sales Report';
        $(".printReport").print({
            title   :  document.title +" | Product Sales Report | "+loggedCompany,
            noPrintSelector : ".addSummaryEditor",
        });
        targetElement.style.width = "100%";
          targetElement.style.backgroundColor = "#ffffff";
          targetElement.style.padding = "0px";
          targetElement.style.fontSize = "1rem";
      }, delayTimeAfterSound);
    },'click .btnExportReport':function() {
      LoadingOverlay.show();
        let utilityService = new UtilityService();
        let templateObject = Template.instance();
        var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        var dateTo = new Date($("#dateTo").datepicker("getDate"));

        let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth()+1) + "-" + dateFrom.getDate();
        let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth()+1) + "-" + dateTo.getDate();

        const filename = loggedCompany + '-Product Sales' + '.csv';
        utilityService.exportReportToCsvTable('tableExport', filename, 'csv');
        let rows = [];
        // reportService.getAllProductSalesDetails(formatDateFrom,formatDateTo,false).then(function (data) {
        //     if(data.tproductsalesdetailsreport){
        //         rows[0] = ['Product Name','Trans Type', 'Trans No.', 'Sales Date', 'Customer', 'Qty', 'Line Cost', 'Total Amount', 'Total Profit'];
        //         data.tproductsalesdetailsreport.forEach(function (e, i) {
        //             rows.push([
        //               data.tproductsalesdetailsreport[i].ProductName,
        //               data.tproductsalesdetailsreport[i].TransactionType,
        //               data.tproductsalesdetailsreport[i].TransactionNo,
        //               data.tproductsalesdetailsreport[i].SaleDate !=''? moment(data.tproductsalesdetailsreport[i].SaleDate).format("DD/MM/YYYY"): data.tproductsalesdetailsreport[i].SaleDate,
        //               data.tproductsalesdetailsreport[i].CustomerName ||'-',
        //               data.tproductsalesdetailsreport[i].Qty || 0,
        //               utilityService.modifynegativeCurrencyFormat(data.tproductsalesdetailsreport[i]['Line Cost (Ex)']) || '0.00',
        //               utilityService.modifynegativeCurrencyFormat(data.tproductsalesdetailsreport[i]['Total Amount (Ex)']) || '0.00',
        //               utilityService.modifynegativeCurrencyFormat(data.tproductsalesdetailsreport[i]['Total Profit (Ex)']) || '0.00']);
        //
        //         });
        //         setTimeout(function () {
        //             utilityService.exportReportToCsv(rows, filename, 'xls');
        //             $('.fullScreenSpin').css('display','none');
        //         }, 1000);
        //     }
        //
        // });
    },
    
    'click #ignoreDate': (e, ui) => {

      $('#dateFrom').attr('readonly', true);
      $('#dateTo').attr('readonly', true);
      ui.dateAsAt.set('Current Date');
      ui.loadReport(null, null,true);

    },
    "click #ignoreDate": function () {
      let templateObject = Template.instance();
      LoadingOverlay.show();
      $("#dateFrom").attr("readonly", true);
      $("#dateTo").attr("readonly", true);
      templateObject.loadReport(null, null, true);
    },
    "change #dateTo, change #dateFrom": (e) => {
      let templateObject = Template.instance();
      LoadingOverlay.show();
      templateObject.loadReport(
        GlobalFunctions.convertYearMonthDay($('#dateFrom').val()), 
        GlobalFunctions.convertYearMonthDay($('#dateTo').val()),
        false
      )
    },
    ...Datehandler.getDateRangeEvents(),
    'keyup #myInputSearch':function(event){
      $('.table tbody tr').show();
      let searchItem = $(event.target).val();
      if(searchItem != ''){
        var value = searchItem.toLowerCase();
        $('.table tbody tr').each(function(){
         var found = 'false';
         $(this).each(function(){
              if($(this).text().toLowerCase().indexOf(value.toLowerCase()) >= 0)
              {
                   found = 'true';
              }
         });
         if(found == 'true')
         {
              $(this).show();
         }
         else
         {
              $(this).hide();
         }
    });
      }else{
        $('.table tbody tr').show();
      }
    },
    'blur #myInputSearch':function(event){
      $('.table tbody tr').show();
      let searchItem = $(event.target).val();
      if(searchItem != ''){
        var value = searchItem.toLowerCase();
        $('.table tbody tr').each(function(){
         var found = 'false';
         $(this).each(function(){
              if($(this).text().toLowerCase().indexOf(value.toLowerCase()) >= 0)
              {
                   found = 'true';
              }
         });
         if(found == 'true')
         {
              $(this).show();
         }
         else
         {
              $(this).hide();
         }
    });
      }else{
        $('.table tbody tr').show();
      }
    },


     // CURRENCY MODULE //
     ...FxGlobalFunctions.getEvents(),
    "click .currency-modal-save": (e) => {
      //$(e.currentTarget).parentsUntil(".modal").modal("hide");
      LoadingOverlay.show();

      let templateObject = Template.instance();

      // Get all currency list
      let _currencyList = templateObject.currencyList.get();

      // Get all selected currencies
      const currencySelected = $(".currency-selector-js:checked");
      let _currencySelectedList = [];
      if (currencySelected.length > 0) {
        $.each(currencySelected, (index, e) => {
          const sellRate = $(e).attr("sell-rate");
          const buyRate = $(e).attr("buy-rate");
          const currencyCode = $(e).attr("currency");
          const currencyId = $(e).attr("currency-id");
          let _currency = _currencyList.find((c) => c.id == currencyId);
          _currency.active = true;
          _currencySelectedList.push(_currency);
        });
      } else {
        let _currency = _currencyList.find((c) => c.code == defaultCurrencyCode);
        _currency.active = true;
        _currencySelectedList.push(_currency);
      }

      _currencyList.forEach((value, index) => {
        if (_currencySelectedList.some((c) => c.id == _currencyList[index].id)) {
          _currencyList[index].active = _currencySelectedList.find(
            (c) => c.id == _currencyList[index].id
          ).active;
        } else {
          _currencyList[index].active = false;
        }
      });

      _currencyList = _currencyList.sort((a, b) => {
        if (a.code == defaultCurrencyCode) {
          return -1;
        }
        return 1;
      });

      // templateObject.activeCurrencyList.set(_activeCurrencyList);
      templateObject.currencyList.set(_currencyList);

      LoadingOverlay.hide();
    },

    "click [href='#noInfoFound']": function () {
      swal({
          title: 'Information',
          text: "No further information available on this column",
          type: 'warning',
          confirmButtonText: 'Ok'
        })
    }
  });
  Template.productsalesreport.helpers({
    records : () => {
       return Template.instance().records.get();
     //   .sort(function(a, b){
     //     if (a.accounttype == 'NA') {
     //   return 1;
     //       }
     //   else if (b.accounttype == 'NA') {
     //     return -1;
     //   }
     // return (a.accounttype.toUpperCase() > b.accounttype.toUpperCase()) ? 1 : -1;
     // return (a.saledate.toUpperCase() < b.saledate.toUpperCase()) ? 1 : -1;
     // });
    },

    redirectionType(entry) {
      if (entry.type === 'Invoice') {
        return '/invoicecard?id=' + entry.Id;
      } else {
        return '#noInfoFound';
      }
    },
    grandRecords: () => {
       return Template.instance().grandRecords.get();
   },
    dateAsAt: () =>{
        return Template.instance().dateAsAt.get() || '-';
    },
    companyname: () =>{
        return loggedCompany;
    },
    deptrecords: () => {
        return Template.instance().deptrecords.get().sort(function(a, b){
          if (a.department == 'NA') {
        return 1;
            }
        else if (b.department == 'NA') {
          return -1;
        }
      return (a.department.toUpperCase() > b.department.toUpperCase()) ? 1 : -1;
      });
    },


    formatPrice( amount ){
      let utilityService = new UtilityService();
      if( isNaN( amount ) ){
          amount = ( amount === undefined || amount === null || amount.length === 0 ) ? 0 : amount;
          amount = ( amount )? Number(amount.replace(/[^0-9.-]+/g,"")): 0;
      }
      return utilityService.modifynegativeCurrencyFormat(amount)|| 0.00;
    },
    formatDate: ( date ) => {
        return ( date )? moment(date).format("DD/MM/YYYY") : '';
    },

     // FX Module //
  convertAmount: (amount, currencyData) => {
    let currencyList = Template.instance().tcurrencyratehistory.get(); // Get tCurrencyHistory

    if(isNaN(amount)) {
      if (!amount || amount.trim() == "") {
        return "";
      }
      amount = utilityService.convertSubstringParseFloat(amount); // This will remove all currency symbol
    }
    // if (currencyData.code == defaultCurrencyCode) {
    //   // default currency
    //   return amount;
    // }


    // Lets remove the minus character
    const isMinus = amount < 0;
    if (isMinus == true) amount = amount * -1; // make it positive for now

    // // get default currency symbol
    // let _defaultCurrency = currencyList.filter(
    //   (a) => a.Code == defaultCurrencyCode
    // )[0];

    // amount = amount.replace(_defaultCurrency.symbol, "");


    // amount =
    //   isNaN(amount) == true
    //     ? parseFloat(amount.substring(1))
    //     : parseFloat(amount);



    // Get the selected date
    let dateTo = $("#dateTo").val();
    const day = dateTo.split("/")[0];
    const m = dateTo.split("/")[1];
    const y = dateTo.split("/")[2];
    dateTo = new Date(y, m, day);
    dateTo.setMonth(dateTo.getMonth() - 1); // remove one month (because we added one before)


    // Filter by currency code
    currencyList = currencyList.filter((a) => a.Code == currencyData.code);

    // Sort by the closest date
    currencyList = currencyList.sort((a, b) => {
      a = GlobalFunctions.timestampToDate(a.MsTimeStamp);
      a.setHours(0);
      a.setMinutes(0);
      a.setSeconds(0);

      b = GlobalFunctions.timestampToDate(b.MsTimeStamp);
      b.setHours(0);
      b.setMinutes(0);
      b.setSeconds(0);

      var distancea = Math.abs(dateTo - a);
      var distanceb = Math.abs(dateTo - b);
      return distancea - distanceb; // sort a before b when the distance is smaller

      // const adate= new Date(a.MsTimeStamp);
      // const bdate = new Date(b.MsTimeStamp);

      // if(adate < bdate) {
      //   return 1;
      // }
      // return -1;
    });

    const [firstElem] = currencyList; // Get the firest element of the array which is the closest to that date



    let rate = currencyData.code == defaultCurrencyCode ? 1 : firstElem.BuyRate; // Must used from tcurrecyhistory




    amount = parseFloat(amount * rate); // Multiply by the rate
    amount = Number(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }); // Add commas

    let convertedAmount =
      isMinus == true
        ? `- ${currencyData.symbol} ${amount}`
        : `${currencyData.symbol} ${amount}`;


    return convertedAmount;
  },
  count: (array) => {
    return array.length;
  },
  countActive: (array) => {
    if (array.length == 0) {
      return 0;
    }
    let activeArray = array.filter((c) => c.active == true);
    return activeArray.length;
  },
  currencyList: () => {
    return Template.instance().currencyList.get();
  },
  isNegativeAmount(amount) {
    if (Math.sign(amount) === -1) {

      return true;
    }
    return false;
  },
  isOnlyDefaultActive() {
    const array = Template.instance().currencyList.get();
    if (array.length == 0) {
      return false;
    }
    let activeArray = array.filter((c) => c.active == true);

    if (activeArray.length == 1) {

      if (activeArray[0].code == defaultCurrencyCode) {
        return !true;
      } else {
        return !false;
      }
    } else {
      return !false;
    }
  },
  isCurrencyListActive() {
    const array = Template.instance().currencyList.get();
    let activeArray = array.filter((c) => c.active == true);

    return activeArray.length > 0;
  },
  isObject(variable) {
    return typeof variable === "object" && variable !== null;
  },
  currency: () => {
    return Currency;
  },
  });
  Template.registerHelper('equals', function (a, b) {
      return a === b;
  });

  Template.registerHelper('notEquals', function (a, b) {
      return a != b;
  });

  Template.registerHelper('containsequals', function (a, b) {
      return (a.indexOf(b) >= 0 );
  });


