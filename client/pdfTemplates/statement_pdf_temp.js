import { ContactService } from "../contacts/contact-service";
import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../js/core-service';
import { UtilityService } from "../utility-service";
import { Random } from 'meteor/random';
import { SideBarService } from '../js/sidebar-service';
import {OrganisationService} from '../js/organisation-service';
import '../lib/global/indexdbstorage.js';
import { jsPDF } from 'jspdf';
import 'jQuery.print/jQuery.print.js';
import { autoTable } from 'jspdf-autotable';
let sideBarService = new SideBarService();
let utilityService = new UtilityService();

Template.statementPrintTemp.onCreated(()=>{
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.statementrecords = new ReactiveVar([]);
    templateObject.accountID = new ReactiveVar();
    templateObject.stripe_fee_method = new ReactiveVar();

})

Template.statementPrintTemp.onRendered(()=>{
    const templateObject = Template.instance();
    let dataTableList = [];
    let contactService = new ContactService();
    templateObject.getOrganisationDetails = function () {

        let account_id = Session.get('vs1companyStripeID') || '';
        let stripe_fee = Session.get('vs1companyStripeFeeMethod') || 'apply';
        templateObject.accountID.set(account_id);
        templateObject.stripe_fee_method.set(stripe_fee);
    }

    templateObject.getOrganisationDetails();



    templateObject.getStatements = async ()=> {
        return new Promise((resolve, reject)=>{
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
            let getURL = location.href;
      
        
            getVS1Data('TStatementList').then((dataObject)=> {
                if (dataObject.length == 0) {
                    sideBarService.getAllCustomerStatementData(prevMonth11Date,toDate, false).then((data)=> {
                        let lineItems = [];
                        let lineItemObj = {};
                        addVS1Data('TStatementList', JSON.stringify(data));
                        for (let i = 0; i < data.tstatementlist.length; i++) {
                            let balance = utilityService.modifynegativeCurrencyFormat(data.tstatementlist[i].amount) || 0.00;
                            var dataList = {
                                id: data.tstatementlist[i].ClientID || '',
                                lineid: Random.id() || '',
                                company: data.tstatementlist[i].Customername || '',
                                contactname: data.tstatementlist[i].Customername || '',
                                phone: '' || '',
                                dateFrom: data.Params.DateFrom,
                                dateTo: data.Params.DateTo.split(' ')[0],
                                balance: balance || 0.00,
                                jobname: data.tstatementlist[i].Jobname || '',
                                notes: ''
                            };
                            dataTableList.push(dataList);
                        }
    
                        function MakeNegative() {
                            $('td').each(function () {
                                if ($(this).text().indexOf('-' + Currency) >= 0)
                                    $(this).addClass('text-danger')
                            });
                        };
                        templateObject.datatablerecords.set(dataTableList);
                        resolve();
                        // templateObject.datatablerecords1.set(dataTableList);
    
                    }).catch(function (err) {
                    });
                } else {
                    let data = JSON.parse(dataObject[0].data);
                    let useData = data.tstatementlist;
                    if(data.Params.IgnoreDates == true){
                    }else{
    
                    }
    
                    for (let i = 0; i < useData.length; i++) {
                        let balance = utilityService.modifynegativeCurrencyFormat(useData[i].amount) || 0.00;
                        var dataList = {
                            id: useData[i].ClientID || '',
                            lineid: Random.id() || '',
                            company: useData[i].Customername || '',
                            contactname: useData[i].Customername || '',
                            phone: '' || '',
                            dateFrom: data.Params.DateFrom,
                            dateTo: data.Params.DateTo.split('')[0],
                            balance: balance || 0.00,
                            jobname: useData[i].Jobname || '',
                            notes: ''
                        };
                        dataTableList.push(dataList);
                    }
    
                    templateObject.datatablerecords.set(dataTableList);
                    resolve();
                    // templateObject.datatablerecords1.set(dataTableList);
    
                }
            }).catch(function (err) {
                sideBarService.getAllCustomerStatementData(prevMonth11Date,toDate, false).then(function (data) {
                    addVS1Data('TStatementList', JSON.stringify(data));
                    for (let i = 0; i < data.tstatementlist.length; i++) {
                        let balance = utilityService.modifynegativeCurrencyFormat(data.tstatementlist[i].amount) || 0.00;
                        var dataList = {
                            id: data.tstatementlist[i].ClientID || '',
                            lineid: Random.id() || '',
                            company: data.tstatementlist[i].Customername || '',
                            contactname: data.tstatementlist[i].Customername || '',
                            phone: '' || '',
                            balance: balance || 0.00,
                            jobname: data.tstatementlist[i].Jobname || '',
                            notes: ''
                        };
    
                        dataTableList.push(dataList);
                    }
    
                    templateObject.datatablerecords.set(dataTableList);
                    resolve();
                }).catch(function (err) {
                });
            });
    
    
            templateObject.getStatePrintData = async function (clientID) {
                let data = await contactService.getCustomerStatementPrintData(clientID);
                let lineItems = [];
                let lineItemObj = {};
                let lineItemsTable = [];
                let lineItemTableObj = {};
                if (data.tstatementforcustomer.length) {
                    let lineItems = [];
                    let balance = data.tstatementforcustomer[0].closingBalance;
                    let stripe_id = templateObject.accountID.get();
                    let stripe_fee_method = templateObject.stripe_fee_method.get();
                    var erpGet = erpDb();
                    let company = Session.get('vs1companyName');
                    let vs1User = localStorage.getItem('mySession');
                    let dept = "Head Office";
                    let customerName = data.tstatementforcustomer[0].CustomerName;
                    let openingbalance = utilityService.modifynegativeCurrencyFormat(data.tstatementforcustomer[0].OpeningBalance);
                    let closingbalance = utilityService.modifynegativeCurrencyFormat(data.tstatementforcustomer[0].closingBalance);
                    let customerphone = data.tstatementforcustomer[0].Phone || '';
                    let customername = data.tstatementforcustomer[0].ClientName || '';
                    let billaddress = data.tstatementforcustomer[0].BillStreet || '';
                    let billstate = data.tstatementforcustomer[0].BillState || '';
                    let billcountry = data.tstatementforcustomer[0].BillCountry || '';
                    let statementId = data.tstatementforcustomer[0].TranstypeNo || '';
                    let email = data.tstatementforcustomer[0].Email || '';
                    let invoiceId = data.tstatementforcustomer[0].SaleID || '';
                    let date = moment(data.tstatementforcustomer[0].transdate).format('DD/MM/YYYY') || '';
                    let datedue = moment(data.tstatementforcustomer[0].Duedate).format('DD/MM/YYYY') || '';
                    let paidAmt = utilityService.modifynegativeCurrencyFormat(data.tstatementforcustomer[0].Paidamt).toLocaleString(undefined, {
                            minimumFractionDigits: 2
                        });
                    let stringQuery = "?";
                    for (let i = 0; i < data.tstatementforcustomer.length; i++) {
                        let id = data.tstatementforcustomer[i].SaleID;
                        let transdate =  moment(data.tstatementforcustomer[i].transdate).format('DD/MM/YYYY') ? moment(data.tstatementforcustomer[i].transdate).format('DD/MM/YYYY') : "";
                        let type = data.tstatementforcustomer[i].Transtype;
                        let status = '';
                        // let type = data.tstatementforcustomer[i].Transtype;
                        let total = utilityService.modifynegativeCurrencyFormat(data.tstatementforcustomer[i].Amount).toLocaleString(undefined, {
                            minimumFractionDigits: 2
                        });
                        let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tstatementforcustomer[i].Amount).toLocaleString(undefined, {
                            minimumFractionDigits: 2
                        });
                        let balance = utilityService.modifynegativeCurrencyFormat(data.tstatementforcustomer[i].Amount).toLocaleString(undefined, {
                            minimumFractionDigits: 2
                        });
        
                        lineItemObj = {
                            lineID: id,
                            id: id || '',
                            date: transdate || '',
                            duedate: datedue,
                            type: type || '',
                            total: total || 0,
                            paidamt:paidAmt || 0,
                            totalPaid: totalPaid || 0,
                            balance: balance || 0
                        };
                        lineItems.push(lineItemObj);
                    }
        
                    if (balance > 0) {
                        for (let l = 0; l < lineItems.length; l++) {
                            stringQuery = stringQuery + "product" + l + "=" + lineItems[l].type + "&price" + l + "=" + lineItems[l].balance + "&qty" + l + "=" + 1 + "&"; ;
                        }
                        stringQuery = stringQuery + "tax=0" + "&total=" + closingbalance + "&customer=" + customerName + "&name=" + customerName + "&surname=" + customerName + "&quoteid=" + invoiceId + "&transid=" + stripe_id + "&feemethod=" + stripe_fee_method + "&company=" + company + "&vs1email=" + vs1User + "&customeremail=" + email + "&type=Statement&url=" + window.location.href + "&server=" + erpGet.ERPIPAddress + "&username=" + erpGet.ERPUsername + "&token=" + erpGet.ERPPassword + "&session=" + erpGet.ERPDatabase + "&port=" + erpGet.ERPPort + "&dept=" + dept;
                    }
        
                    var currentDate = new Date();
                    var begunDate = moment(currentDate).format("DD/MM/YYYY");
                    let statmentrecord = {
                        id: '',
                        printdate: begunDate,
                        customername: customerName,
                        LineItems: lineItems,
                        phone: customerphone,
                        customername: customername,
                        billaddress: billaddress,
                        billstate: billstate,
                        billcountry: billcountry,
                        email: email,
                        openingBalance: openingbalance,
                        closingBalance: closingbalance
                    };
        
                    // templateObject.statmentprintrecords.set(statmentrecord);
                    let statememtsArray = templateObject.statementrecords.get();
                    statememtsArray = [...statememtsArray, statmentrecord];
                    templateObject.statementrecords.set(statememtsArray); 
                  
                }
        
                //});
            };
        })
       
      }
      templateObject.getStatements().then(async ()=>{
        let statements = templateObject.datatablerecords.get();
        statements.map((statement)=>{
            templateObject.getStatePrintData(statement.id)
        })
      });
})

Template.statementPrintTemp.helpers({
    datatablerecords: () => {
        return Template.instance().datatablerecords.get().sort(function (a, b) {
            if (a.company == 'NA') {
                return 1;
            } else if (b.company == 'NA') {
                return -1;
            }
            return (a.company.toUpperCase() > b.company.toUpperCase()) ? 1 : -1;
        });
    },

    statementrecords: () =>{
        return Template.instance().statementrecords.get();
    },

    companyname: () => {
        return loggedCompany;
    },
    companyaddress1: () => {
        return Session.get('vs1companyaddress1');
    },
    companyaddress2: () => {
        return Session.get('vs1companyaddress2');
    },
    companyphone: () => {
        return Session.get('vs1companyPhone');
    },
    companyabn: () => {
        return Session.get('vs1companyABN');
    },
    organizationname: () => {
        return Session.get('vs1companyName');
    },
    organizationurl: () => {
        return Session.get('vs1companyURL');
    },

});