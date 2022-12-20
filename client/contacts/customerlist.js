import {ContactService} from "./contact-service";
import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../js/core-service';
import {UtilityService} from "../utility-service";
import XLSX from 'xlsx';
import { SideBarService } from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
import { OrganisationService } from "../js/organisation-service";

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
let contactService = new ContactService();
let organisationService = new OrganisationService();
Template.customerlist.onCreated(function(){
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.selectedFile = new ReactiveVar();
    templateObject.setupFinished = new ReactiveVar();
});

Template.customerlist.onRendered(function() {
    $('.fullScreenSpin').css('display','inline-block');
    let templateObject = Template.instance();
    let contactService = new ContactService();
    const customerList = [];
    let salesOrderTable;
    var splashArray = [];
    const dataTableList = [];
    const tableHeaderList = [];

    if(FlowRouter.current().queryParams.success){
        $('.btnRefresh').addClass('btnRefreshAlert');
    }

    $('#tblCustomerlist tbody').on( 'click', 'tr', function () {
        var listData = $(this).closest('tr').attr('id');
        var transactiontype = $(this).closest('tr').attr('isjob');
        if(listData){
            if(transactiontype != ""){
                FlowRouter.go('/customerscard?jobid=' + listData);
            }else{
                FlowRouter.go('/customerscard?id=' + listData);
            }

        }

    });

    // templateObject.checkSetupWizardFinished = async function () {
    //     let setupFinished = localStorage.getItem("IS_SETUP_FINISHED") || false;
    //     if( setupFinished === null || setupFinished ===  "" ){
    //         let setupInfo = await organisationService.getSetupInfo();
    //         if( setupInfo.tcompanyinfo.length > 0 ){
    //             let data = setupInfo.tcompanyinfo[0];
    //             let cntConfirmedSteps = data.Address3 == "" ? 0 : parseInt(data.Address3);
    //             setupFinished = cntConfirmedSteps == confirmStepCount ? true : false;
    //             localStorage.setItem("IS_SETUP_FINISHED", setupFinished); //data.IsSetUpWizard
    //             templateObject.setupFinished.set(setupFinished); //data.IsSetUpWizard
    //             if (setupFinished) {
    //                 $('.setupIncompleatedMsg').hide();
    //             } else {
    //                 $('.setupIncompleatedMsg').show();
    //             }
    //         }
    //     }else{
    //         templateObject.setupFinished.set(setupFinished);
    //     }
    // }
    // templateObject.checkSetupWizardFinished();
    checkSetupFinished();
});


Template.customerlist.events({
  'click #btnNewCustomer': function (event) {
      FlowRouter.go('/customerscard');
  },
  'click .btnAddNewCustomer': function (event) {
      setTimeout(function () {
        $('#edtCustomerCompany').focus();
      }, 1000);
  },
  'click .chkDatatable' : function(event){
      var columns = $('#tblCustomerlist th');
      let columnDataValue = $(event.target).closest("div").find(".divcolumn").text();

      $.each(columns, function(i,v) {
          let className = v.classList;
          let replaceClass = className[1];

          if(v.innerText == columnDataValue){
              if($(event.target).is(':checked')){
                  $("."+replaceClass+"").css('display','table-cell');
                  $("."+replaceClass+"").css('padding','.75rem');
                  $("."+replaceClass+"").css('vertical-align','top');
              }else{
                  $("."+replaceClass+"").css('display','none');
              }
          }
      });
  },
  'click .btnCloseCustomerPOPList': function (event) {
      setTimeout(function () {
        $('#tblCustomerlist_filter .form-control-sm').val('');
      }, 1000);
  },
  'keyup #tblCustomerlist_filter input': function (event) {
        if($(event.target).val() != ''){
          $(".btnRefreshCustomer").addClass('btnSearchAlert');
        }else{
          $(".btnRefreshCustomer").removeClass('btnSearchAlert');
        }
        if (event.keyCode == 13) {
           $(".btnRefreshCustomer").trigger("click");
        }
      },
  'click .btnRefreshCustomer': function (event) {
      let templateObject = Template.instance();
      $('.fullScreenSpin').css('display', 'inline-block');
      const customerList = [];
      const clientList = [];
      let salesOrderTable;
      var splashArray = new Array();
      var splashArrayCustomerList = new Array();
      const dataTableList = [];
      const tableHeaderList = [];
      let dataSearchName = $('#tblCustomerlist_filter input').val();

      if (dataSearchName.replace(/\s/g, '') != '') {
          sideBarService.getNewCustomerByNameOrID(dataSearchName).then(function (data) {
              let lineItems = [];
              let lineItemObj = {};
              let linestatus = "";
              if (data.tcustomervs1list.length > 0) {
                  for (let i = 0; i < data.tcustomervs1list.length; i++) {
                      let arBalance = utilityService.modifynegativeCurrencyFormat(data.tcustomervs1list[i].ARBalance) || 0.00;
                      let creditBalance = utilityService.modifynegativeCurrencyFormat(data.tcustomervs1list[i].APBalance) || 0.00;
                      let balance = utilityService.modifynegativeCurrencyFormat(data.tcustomervs1list[i].Balance) || 0.00;
                      let creditLimit = utilityService.modifynegativeCurrencyFormat(data.tcustomervs1list[i].CreditLimit) || 0.00;
                      let salesOrderBalance = utilityService.modifynegativeCurrencyFormat(data.tcustomervs1list[i].SOBalance) || 0.00;
                      var dataList = {
                          id: data.tcustomervs1list[i].ClientID || '',
                          clientName: data.tcustomervs1list[i].FirstName || '',
                          company: data.tcustomervs1list[i].Company || '',
                          contactname: data.tcustomervs1list[i].ContactName || '',
                          phone: data.tcustomervs1list[i].Phone || '',
                          arbalance: arBalance || 0.00,
                          creditbalance: creditBalance || 0.00,
                          balance: balance || 0.00,
                          creditlimit: creditLimit || 0.00,
                          salesorderbalance: salesOrderBalance || 0.00,
                          email: data.tcustomervs1list[i].Email || '',
                          job: data.tcustomervs1list[i].JobName || '',
                          accountno: data.tcustomervs1list[i].AccountNo || '',
                          clientno: data.tcustomervs1list[i].ClientNo || '',
                          jobtitle: data.tcustomervs1list[i].JobTitle || '',
                          notes: data.tcustomervs1list[i].Notes || '',
                          state: data.tcustomervs1list[i].State || '',
                          country: data.tcustomervs1list[i].Country || '',
                          street: data.tcustomervs1list[i].Street || '',
                          street2: data.tcustomervs1list[i].Street2 || '',
                          street3: data.tcustomervs1list[i].Street3 || '',
                          suburb: data.tcustomervs1list[i].Suburb || '',
                          status: linestatus,
                          postcode: data.tcustomervs1list[i].Postcode || ''
                      };

                      dataTableList.push(dataList);
                      let mobile = contactService.changeMobileFormat(data.tcustomervs1list[i].Mobile);
                      var dataListCustomer = [
                        data.tcustomervs1list[i].ClientID || '',
                        data.tcustomervs1list[i].ClientName || '-',
                        data.tcustomervs1list[i].JobName || '',
                        data.tcustomervs1list[i].Phone || '',
                        mobile || '',
                        arBalance || 0.00,
                        creditBalance || 0.00,
                        balance || 0.00,
                        creditLimit || 0.00,
                        salesOrderBalance || 0.00,
                        data.tcustomervs1list[i].Street || '',
                        data.tcustomervs1list[i].Street2 || data.tcustomervs1list[i].Suburb || '',
                        data.tcustomervs1list[i].State || '',
                        data.tcustomervs1list[i].Postcode || '',
                        data.tcustomervs1list[i].Country || '',
                        data.tcustomervs1list[i].Email || '',
                        data.tcustomervs1list[i].AccountNo || '',
                        data.tcustomervs1list[i].ClientTypeName || 'Default',
                        data.tcustomervs1list[i].Discount || 0,
                        data.tcustomervs1list[i].TermsName || loggedTermsSales || 'COD',
                        data.tcustomervs1list[i].FirstName || '',
                        data.tcustomervs1list[i].LastName || '',
                        data.tcustomervs1list[i].TaxCodeName || 'E',
                        data.tcustomervs1list[i].ClientNo || '',
                        data.tcustomervs1list[i].JobTitle || '',
                        linestatus,
                        data.tcustomervs1list[i].Notes || ''
                      ];

                      splashArrayCustomerList.push(dataListCustomer);
                  }
                  var datatable = $('#tblCustomerlist').DataTable({
                    "order": [1, 'asc' ],
                    columnDefs: [
                        {
                          type: "date",
                          targets: 0,
                        },
                        {
                          orderable: false,
                          targets: -1,
                        },
                      ],
                    });
                  datatable.clear();
                  datatable.rows.add(splashArrayCustomerList);
                  datatable.draw(false);

                  $('.fullScreenSpin').css('display', 'none');
              } else {

                  $('.fullScreenSpin').css('display', 'none');
                  swal({
                      title: 'Question',
                      text: "Customer does not exist, would you like to create it?",
                      type: 'question',
                      showCancelButton: true,
                      confirmButtonText: 'Yes',
                      cancelButtonText: 'No'
                  }).then((result) => {
                      if (result.value) {
                          FlowRouter.go('/customerscard');
                          //$('#edtCustomerCompany').val(dataSearchName);
                      } else if (result.dismiss === 'cancel') {

                      }
                  });

              }

          }).catch(function (err) {
              $('.fullScreenSpin').css('display', 'none');
          });
      } else {
          sideBarService.getAllCustomersDataVS1(initialBaseDataLoad, 0).then(function (data) {
              let lineItems = [];
              let lineItemObj = {};
              for (let i = 0; i < data.tcustomervs1list.length; i++) {
                  let arBalance = utilityService.modifynegativeCurrencyFormat(data.tcustomervs1list[i].ARBalance) || 0.00;
                  let creditBalance = utilityService.modifynegativeCurrencyFormat(data.tcustomervs1list[i].CreditBalance) || 0.00;
                  let balance = utilityService.modifynegativeCurrencyFormat(data.tcustomervs1list[i].Balance) || 0.00;
                  let creditLimit = utilityService.modifynegativeCurrencyFormat(data.tcustomervs1list[i].CreditLimit) || 0.00;
                  let salesOrderBalance = utilityService.modifynegativeCurrencyFormat(data.tcustomervs1list[i].SalesOrderBalance) || 0.00;
                  var dataList = {
                      id: data.tcustomervs1list[i].ClientID || '',
                      clientName: data.tcustomervs1list[i].FirstName || '',
                      company: data.tcustomervs1list[i].Company || '',
                      contactname: data.tcustomervs1list[i].ContactName || '',
                      phone: data.tcustomervs1list[i].Phone || '',
                      arbalance: arBalance || 0.00,
                      creditbalance: creditBalance || 0.00,
                      balance: balance || 0.00,
                      creditlimit: creditLimit || 0.00,
                      salesorderbalance: salesOrderBalance || 0.00,
                      email: data.tcustomervs1list[i].Email || '',
                      job: data.tcustomervs1list[i].JobName || '',
                      accountno: data.tcustomervs1list[i].AccountNo || '',
                      clientno: data.tcustomervs1list[i].ClientNo || '',
                      jobtitle: data.tcustomervs1list[i].JobTitle || '',
                      notes: data.tcustomervs1list[i].Notes || '',
                      state: data.tcustomervs1list[i].State || '',
                      country: data.tcustomervs1list[i].Country || '',
                      street: data.tcustomervs1list[i].Street || '',
                      street2: data.tcustomervs1list[i].Street2 || '',
                      street3: data.tcustomervs1list[i].Street3 || '',
                      suburb: data.tcustomervs1list[i].Suburb || '',
                      status: linestatus,
                      postcode: data.tcustomervs1list[i].Postcode || ''
                  };

                  dataTableList.push(dataList);
                  let mobile = contactService.changeMobileFormat(data.tcustomervs1list[i].Mobile)
                  var dataListCustomer = [
                      data.tcustomervs1list[i].ClientID || '',
                      data.tcustomervs1list[i].ClientName || '-',
                      data.tcustomervs1list[i].JobName || '',
                      data.tcustomervs1list[i].Phone || '',
                      mobile || '',
                      arBalance || 0.00,
                      creditBalance || 0.00,
                      balance || 0.00,
                      creditLimit || 0.00,
                      salesOrderBalance || 0.00,
                      data.tcustomervs1list[i].Street || '',
                      data.tcustomervs1list[i].Street2 || data.tcustomervs1list[i].Suburb || '',
                      data.tcustomervs1list[i].State || '',
                      data.tcustomervs1list[i].Postcode || '',
                      data.tcustomervs1list[i].Country || '',
                      data.tcustomervs1list[i].Email || '',
                      data.tcustomervs1list[i].AccountNo || '',
                      data.tcustomervs1list[i].ClientTypeName || 'Default',
                      data.tcustomervs1list[i].Discount || 0,
                      data.tcustomervs1list[i].TermsName || loggedTermsSales || 'COD',
                      data.tcustomervs1list[i].FirstName || '',
                      data.tcustomervs1list[i].LastName || '',
                      data.tcustomervs1list[i].TaxCodeName || 'E',
                      data.tcustomervs1list[i].ClientNo || '',
                      data.tcustomervs1list[i].JobTitle || '',
                      linestatus,
                      data.tcustomervs1list[i].Notes || ''
                  ];

                  splashArrayCustomerList.push(dataListCustomer);
              }
              var datatable = $('#tblCustomerlist').DataTable();
              datatable.clear();
              datatable.rows.add(splashArrayCustomerList);
              datatable.draw(false);

              $('.fullScreenSpin').css('display', 'none');


          }).catch(function (err) {
              $('.fullScreenSpin').css('display', 'none');
          });
      }
  },
  'blur .divcolumn' : function(event){
      let columData = $(event.target).text();

      let columnDatanIndex = $(event.target).closest("div.columnSettings").attr('id');
      var datable = $('#tblCustomerlist').DataTable();
      var title = datable.column( columnDatanIndex ).header();
      $(title).html(columData);

  },
  'change .rngRange' : function(event){
      let range = $(event.target).val();
      $(event.target).closest("div.divColWidth").find(".spWidth").html(range+'px');

      let columData = $(event.target).closest("div.divColWidth").find(".spWidth").attr("value");
      let columnDataValue = $(event.target).closest("div").prev().find(".divcolumn").text();
      var datable = $('#tblCustomerlist th');
      $.each(datable, function(i,v) {
          if(v.innerText == columnDataValue){
              let className = v.className;
              let replaceClass = className.replace(/ /g, ".");
              $("."+replaceClass+"").css('width',range+'px');

          }
      });

  },
  'click .btnOpenSettings' : function(event){
      let templateObject = Template.instance();
      var columns = $('#tblCustomerlist th');

      const tableHeaderList = [];
      let sTible = "";
      let sWidth = "";
      let sIndex = "";
      let sVisible = "";
      let columVisible = false;
      let sClass = "";
      $.each(columns, function(i,v) {
          if(v.hidden == false){
              columVisible =  true;
          }
          if((v.className.includes("hiddenColumn"))){
              columVisible = false;
          }
          sWidth = v.style.width.replace('px', "");
          let datatablerecordObj = {
              sTitle: v.innerText || '',
              sWidth: sWidth || '',
              sIndex: v.cellIndex || 0,
              sVisible: columVisible || false,
              sClass: v.className || ''
          };
          tableHeaderList.push(datatablerecordObj);
      });
      templateObject.tableheaderrecords.set(tableHeaderList);
  },
  'click .exportbtn': function () {
      $('.fullScreenSpin').css('display','inline-block');
      jQuery('#tblCustomerlist_wrapper .dt-buttons .btntabletocsv').click();
      $('.fullScreenSpin').css('display','none');

  },
  'click .exportbtnExcel': function () {
      $('.fullScreenSpin').css('display','inline-block');
      jQuery('#tblCustomerlist_wrapper .dt-buttons .btntabletoexcel').click();
      $('.fullScreenSpin').css('display','none');
  },
  'click .printConfirm' : function(event){
        playPrintAudio();
        setTimeout(function(){
      $('.fullScreenSpin').css('display','inline-block');
      jQuery('#tblCustomerlist_wrapper .dt-buttons .btntabletopdf').click();
      $('.fullScreenSpin').css('display','none');
    }, delayTimeAfterSound);
  },
  'click .btnRefresh': function () {
      $('.fullScreenSpin').css('display','inline-block');
      let templateObject = Template.instance();
      sideBarService.getAllCustomersDataVS1(initialBaseDataLoad,0).then(function(data) {
          addVS1Data('TCustomerVS1',JSON.stringify(data)).then(function (datareturn) {
              setTimeout(function () {
                  window.open('/customerlist','_self');
              }, 2000);
          }).catch(function (err) {
              setTimeout(function () {
                  window.open('/customerlist','_self');
              }, 2000);
          });
      }).catch(function(err) {
          setTimeout(function () {
              window.open('/customerlist','_self');
          }, 2000);
      });

      sideBarService.getAllJobssDataVS1(initialBaseDataLoad,0).then(function(data) {
          addVS1Data('TJobVS1',JSON.stringify(data)).then(function (datareturn) {

          }).catch(function (err) {

          });
      }).catch(function(err) {

      });

      sideBarService.getClientTypeData().then(function(data) {
          addVS1Data('TClientType',JSON.stringify(data));
      }).catch(function(err) {

      });
  },
  'click .templateDownload': function () {
      let utilityService = new UtilityService();
      let rows =[];
      const filename = 'SampleCustomer'+'.csv';
      rows[0]= ['Company','First Name', 'Last Name', 'Phone','Mobile', 'Email','Skype', 'Street', 'City/Suburb', 'State', 'Post Code', 'Country', 'Tax Code'];
      rows[1]= ['ABC Company','John', 'Smith', '9995551213','9995551213', 'johnsmith@email.com','johnsmith', '123 Main Street', 'Brooklyn', 'New York', '1234', 'United States', 'NT'];
      utilityService.exportToCsv(rows, filename, 'csv');
  },
  'click .btnUploadFile':function(event){
      $('#attachment-upload').val('');
      $('.file-name').text('');
      //$(".btnImport").removeAttr("disabled");
      $('#attachment-upload').trigger('click');

  },
  'click .templateDownloadXLSX': function (e) {

      e.preventDefault();  //stop the browser from following
      window.location.href = 'sample_imports/SampleCustomer.xlsx';
  },
  'change #attachment-upload': function (e) {
      let templateObj = Template.instance();
      var filename = $('#attachment-upload')[0].files[0]['name'];
      var fileExtension = filename.split('.').pop().toLowerCase();
      var validExtensions = ["csv","txt","xlsx"];
      var validCSVExtensions = ["csv","txt"];
      var validExcelExtensions = ["xlsx","xls"];

      if (validExtensions.indexOf(fileExtension) == -1) {
          // Bert.alert('<strong>formats allowed are : '+ validExtensions.join(', ')+'</strong>!', 'danger');
          swal('Invalid Format', 'formats allowed are :' + validExtensions.join(', '), 'error');
          $('.file-name').text('');
          $(".btnImport").Attr("disabled");
      }else if(validCSVExtensions.indexOf(fileExtension) != -1){

          $('.file-name').text(filename);
          let selectedFile = event.target.files[0];
          templateObj.selectedFile.set(selectedFile);
          if($('.file-name').text() != ""){
              $(".btnImport").removeAttr("disabled");
          }else{
              $(".btnImport").Attr("disabled");
          }
      }else if(fileExtension == 'xlsx'){
          $('.file-name').text(filename);
          let selectedFile = event.target.files[0];
          var oFileIn;
          var oFile = selectedFile;
          var sFilename = oFile.name;
          // Create A File Reader HTML5
          var reader = new FileReader();

          // Ready The Event For When A File Gets Selected
          reader.onload = function (e) {
              var data = e.target.result;
              data = new Uint8Array(data);
              var workbook = XLSX.read(data, {type: 'array'});

              var result = {};
              workbook.SheetNames.forEach(function (sheetName) {
                  var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {header: 1});
                  var sCSV = XLSX.utils.make_csv(workbook.Sheets[sheetName]);
                  templateObj.selectedFile.set(sCSV);

                  if (roa.length) result[sheetName] = roa;
              });
              // see the result, caution: it works after reader event is done.

          };
          reader.readAsArrayBuffer(oFile);

          if($('.file-name').text() != ""){
              $(".btnImport").removeAttr("disabled");
          }else{
              $(".btnImport").Attr("disabled");
          }

      }



  },
  'click .btnImport' : function () {
      $('.fullScreenSpin').css('display','inline-block');
      let templateObject = Template.instance();
      let contactService = new ContactService();
      let objDetails;
      let firstName= '';
      let lastName = '';
      let taxCode = '';

      Papa.parse(templateObject.selectedFile.get(), {
          complete: function(results) {

              if(results.data.length > 0){
                  if((results.data[0][0] == "Company") && (results.data[0][1] == "First Name")
                     && (results.data[0][2] == "Last Name") && (results.data[0][3] == "Phone")
                     && (results.data[0][4] == "Mobile") && (results.data[0][5] == "Email")
                     && (results.data[0][6] == "Skype") && (results.data[0][7] == "Street")
                     && (results.data[0][8] == "Street2" || results.data[0][8] == "City/Suburb") && (results.data[0][9] == "State")
                     && (results.data[0][10] == "Post Code") && (results.data[0][11] == "Country")) {

                      let dataLength = results.data.length * 500;
                      setTimeout(function(){
                        window.open('/customerlist?success=true','_self');
                        $('.fullScreenSpin').css('display','none');
                      },parseInt(dataLength));

                      for (let i = 0; i < results.data.length -1; i++) {
                        firstName = results.data[i+1][1] !== undefined? results.data[i+1][1] :'';
                        lastName = results.data[i+1][2]!== undefined? results.data[i+1][2] :'';
                        taxCode = results.data[i+1][12]!== undefined? results.data[i+1][12] :'NT';
                          objDetails = {
                              type: "TCustomer",
                              fields:
                              {
                                  ClientName: results.data[i+1][0]||'',
                                  FirstName: firstName || '',
                                  LastName: lastName|| '',
                                  Phone: results.data[i+1][3]||'',
                                  Mobile: results.data[i+1][4]||'',
                                  Email: results.data[i+1][5]||'',
                                  SkypeName: results.data[i+1][6]||'',
                                  Street: results.data[i+1][7]||'',
                                  Street2: results.data[i+1][8]||'',
                                  Suburb: results.data[i+1][8]||'',
                                  State: results.data[i+1][9]||'',
                                  PostCode:results.data[i+1][10]||'',
                                  Country:results.data[i+1][11]||'',

                                  BillStreet: results.data[i+1][7]||'',
                                  BillStreet2: results.data[i+1][8]||'',
                                  BillState: results.data[i+1][9]||'',
                                  BillPostCode:results.data[i+1][10]||'',
                                  Billcountry:results.data[i+1][11]||'',
                                  TaxCodeName:taxCode||'NT',
                                  Active: true
                              }
                          };
                          if(results.data[i+1][0]){
                              if(results.data[i+1][0] !== "") {
                                  contactService.saveCustomer(objDetails).then(function (data) {
                                      //$('.fullScreenSpin').css('display','none');
                                      //Meteor._reload.reload();
                                  }).catch(function (err) {
                                      //$('.fullScreenSpin').css('display','none');
                                      swal({
                                          title: 'Oooops...',
                                          text: err,
                                          type: 'error',
                                          showCancelButton: false,
                                          confirmButtonText: 'Try Again'
                                      }).then((result) => {
                                          if (result.value) {
                                              window.open('/customerlist?success=true','_self');
                                          } else if (result.dismiss === 'cancel') {
                                            window.open('/customerlist?success=true','_self');
                                          }
                                      });
                                  });
                              }
                          }
                      }

                  }else{
                      $('.fullScreenSpin').css('display','none');
                      // Bert.alert('<strong> Data Mapping fields invalid. </strong> Please check that you are importing the correct file with the correct column headers.', 'danger');
                      swal('Invalid Data Mapping fields ', 'Please check that you are importing the correct file with the correct column headers.', 'error');
                  }
              }else{
                  $('.fullScreenSpin').css('display','none');
                  // Bert.alert('<strong> Data Mapping fields invalid. </strong> Please check that you are importing the correct file with the correct column headers.', 'danger');
                  swal('Invalid Data Mapping fields ', 'Please check that you are importing the correct file with the correct column headers.', 'error');
              }

          }
      });
  }
});

Template.customerlist.helpers({
    datatablerecords : () => {
        return Template.instance().datatablerecords.get().sort(function(a, b){
            if (a.company == 'NA') {
                return 1;
            }
            else if (b.company == 'NA') {
                return -1;
            }
            return (a.company.toUpperCase() > b.company.toUpperCase()) ? 1 : -1;
        });
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    salesCloudPreferenceRec: () => {
        return CloudPreference.findOne({userid:Session.get('mycloudLogonID'),PrefName:'tblCustomerlist'});
    },
    loggedCompany: () => {
        return localStorage.getItem('mySession') || '';
    },
    isSetupFinished: () => {
        return Template.instance().setupFinished.get();
    },
    getSkippedSteps() {
        let setupUrl = localStorage.getItem("VS1Cloud_SETUP_SKIPPED_STEP") || JSON.stringify().split();
        return setupUrl[1];
    }
});
