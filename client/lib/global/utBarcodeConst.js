  Barcode_SepChar = '-';

  Barcode_Prefix_Employee     = 'EMP';
  Barcode_Prefix_Sale         = 'S';
  Barcode_Prefix_SalesLine    = 'SL';
  Barcode_Prefix_UOMSalesLine = 'USL';
  Barcode_Prefix_DisPatch     = 'DIS';
  Barcode_StartNew            = 'START-NEW';
  Barcode_Prefix_PQABATCH     = 'PBA';
  Barcode_Prefix_PQASN        = 'PSN';
  Barcode_Prefix_PQACOMB      = 'PCOMB';
  Barcode_Prefix_BXR          = 'BXR'; //Barcode x ref -> tblBarcodexRef
  Barcode_Prefix_SLBatch      = 'SLB';
  Barcode_Prefix_Customer     = 'CUS';
  Barcode_Prefix_PurchaseOrder = 'PO';
  Barcode_Prefix_PurchaseLine = 'PL';
  Barcode_Prefix_Proctree     = 'PT';
  Barcode_Prefix_DeptClass    = 'DEPT';
  Barcode_Prefix_StockTransfer    = 'ST';
  Barcode_Prefix_StockAdjust  = 'SA';
  Barcode_Prefix_Invoice = 'IN';
  Barcode_Prefix_Invoice2 = 'INV';
  Barcode_Prefix_SalesOrder = 'SO';
  Barcode_Prefix_Quote = 'QU';
  Barcode_Prefix_Refund = 'RE';
  Barcode_Prefix_Payment = 'PA';
  Barcode_Prefix_Bill = 'BI';
  Barcode_Prefix_Journal = 'JO';
  Barcode_Prefix_TimeSheet = 'TS';
  Barcode_Prefix_Supplier = 'SUP';
  Barcode_Prefix_Product = 'PRO';
  Barcode_Prefix_Account = 'ACC';
  Barcode_Prefix_Check = 'CH';
  Barcode_Prefix_Shipping = 'SH';
  Barcode_Prefix_Serial     = 'SER';
  Barcode_Prefix_LOT     = 'LOT';
  Barcode_Prefix_Lead = 'LED';

  Barcode_Prefix_Appointment = 'APP';
  Barcode_Prefix_Credit = 'CR';
  Barcode_Prefix_CRM = 'CRM';
  Barcode_Prefix_Deposit = 'DEP';
  Barcode_Prefix_FixedAsset = 'FA';
  Barcode_Prefix_ReceiptClaim = 'RC';
  Barcode_Prefix_Task = 'TSK';
  Barcode_Prefix_WorkOrder = 'WO';

  
 licenceIPAddress = "login.vs1cloud.com"; //165.228.147.127
 //licenceIPAddress = "sandboxcoreedi.vs1cloud.com"; //192.168.15.124
  //Global Declaration
  /* VS1 SandBox Details */
  URLRequest = 'https://'; //non ssl server
  //checkSSLPorts = '4433'; //Production
  checkSSLPorts = '8453'; //Sandbox
  vs1loggedDatatbase = 'vs1_sandbox_license'; //SandBox databaseName

  ERPDatabaseIPAdderess = "login.vs1cloud.com"; //www.login.vs1cloud.com
  ReplicaERPDatabaseIPAdderess = "replica.vs1cloud.com"+ ':' + '4434' + '/' + 'erpapi' + '/'; //www.login.vs1cloud.com

  //stripeGlobalURL= "https://www.depot.vs1cloud.com/stripe/";
  stripeGlobalURL= "https://www.depot.vs1cloud.com/stripe-sandbox/";
  //vs1loggedDatatbase = 'vs1_sandbox_license'; //Normal databaseName

  /* VS1 Production Details */
  //vs1loggedDatatbase = 'vs1_production_license'; //Production databaseName
  //checkSSLPorts = '4433'; //Use SSL Port
  //URLRequest = 'https://'; //ssl server

loggedserverIP = localStorage.getItem('mainEIPAddress');
loggedserverPort = localStorage.getItem('mainEPort');
Currency = Session.get('ERPCurrency') || '$';
CountryAbbr = Session.get('ERPCountryAbbr');
addExtraUserPrice = 0;
// loggedCompany = Session.get('EDatabase');
loggedCompany = Session.get('vs1companyName');
defaultDept = Session.get('ERPDefaultDepartment');
defaultUOM = Session.get('ERPDefaultUOM')||"Units";
isModuleGreenTrack = Session.get('CloudSeedToSaleLicence');
isPurchasedTrueERPModule = localStorage.getItem('isPurchasedTrueERPModule') || false;
bsbCodeName = "Branch Code";
reportsloadMonths = 1; //This load for 1 months
initialDataLoad = 25; //This load 25 for transaction list data
initialBaseDataLoad = 25; //This load for 25 data base lists
initialReportLoad = 25; //This load for 100 reports data
initialReportDatatableLoad = 25; //This load for 100 Datatables
initialDatatableLoad = 25; //This load for 100 Datatables
delayTimeAfterSound = 1000;
copyStartTime = '05:00';
// optDates = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th", "13th", "14th", "15th", "16th", "17th", "18th", "19th", "20th", "21st", "22nd", "23rd", "24th", "25th", "26th", "27th", "28th", "29th", "30th", "31st"];
bOrderInvoice = 1;
confirmStepCount = 10;

loggedTermsPurchase = Session.get('ERPTermsPurchase') || "COD";
loggedTermsSales = Session.get('ERPTermsSales') || "COD";
if(Session.get('ERPLoggedCountry') == "Australia"){
  // Session.setPersistent('ERPTaxCodePurchaseInc', "NCG");
  // Session.setPersistent('ERPTaxCodeSalesInc', "GST");
  loggedTaxCodePurchaseInc = Session.get('ERPTaxCodePurchaseInc') || "NCG";
  loggedTaxCodeSalesInc = Session.get('ERPTaxCodeSalesInc') || "GST";
  LoggedCountry = Session.get('ERPLoggedCountry');
  chequeSpelling = "Cheque";
  if(isPurchasedTrueERPModule === 'true'){
    addExtraUserPrice = Currency+65; //152

    if(localStorage.getItem('EDatabase')){
    if(localStorage.getItem('EDatabase') == 'rapp_australia_pty_ltd'){
      addExtraUserPrice = Currency+65;
      Session.setPersistent('VS1AdminUserName', 'roger@rappaustralia.com.au');
    }
   }

  }else{
    addExtraUserPrice = Currency+45;
  }

  bsbCodeName = "BSB (Branch Number)";
}else if(Session.get('ERPLoggedCountry') == "United States of America"){
  // Session.setPersistent('ERPTaxCodePurchaseInc', "NT");
  // Session.setPersistent('ERPTaxCodeSalesInc', "NT");
  LoggedCountry = "United States";
  loggedTaxCodePurchaseInc = Session.get('ERPTaxCodePurchaseInc') || "NT";
  loggedTaxCodeSalesInc = Session.get('ERPTaxCodeSalesInc') || "NT";
  chequeSpelling = "Check";
  if(isPurchasedTrueERPModule === 'true'){
    addExtraUserPrice = Currency+110;
  }else{
  addExtraUserPrice = Currency+35;
   }
}else{
  loggedTaxCodePurchaseInc = Session.get('ERPTaxCodePurchaseInc') || "NT";
  loggedTaxCodeSalesInc = Session.get('ERPTaxCodeSalesInc') || "NT";
  chequeSpelling = "Cheque";
  LoggedCountry = Session.get('ERPLoggedCountry');
}

if(Session.get('ERPLoggedCountry') == "South Africa"){
  if(isPurchasedTrueERPModule === 'true'){
    addExtraUserPrice = Currency+1660;
  }else{
  addExtraUserPrice = Currency+480;
  }
}else if((Session.get('ERPLoggedCountry') == "Canada")){
  if(isPurchasedTrueERPModule === 'true'){
    addExtraUserPrice = Currency+140;
  }else{
  addExtraUserPrice = Currency+40;
  }
}else if((Session.get('ERPLoggedCountry') == "New Zealand")){
  if(isPurchasedTrueERPModule === 'true'){
    addExtraUserPrice = Currency+160;
  }else{
  addExtraUserPrice = Currency+40;
   }
}else if(Session.get('ERPLoggedCountry') == "United Arab Emirates"){
  if(isPurchasedTrueERPModule === 'true'){
    addExtraUserPrice = '$'+110;
  }else{
  addExtraUserPrice = '$'+35;
    }
}else if(Session.get('ERPLoggedCountry') == "United Kingdom"){
  if(isPurchasedTrueERPModule === 'true'){
    addExtraUserPrice = Currency+80;
  }else{
  addExtraUserPrice = Currency+25;
   }
}

checkResponseError ="You have lost internet connection, please log out and log back in.";

//loggedTaxCodePurchaseInc = Session.get('ERPTaxCodePurchaseInc');
//loggedTaxCodeSalesInc = Session.get('ERPTaxCodeSalesInc');

