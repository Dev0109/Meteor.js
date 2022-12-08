import {ContactService} from "./contact-service";
import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../js/core-service';
import {UtilityService} from "../utility-service";
import XLSX from 'xlsx';
import { SideBarService } from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
let contactService = new ContactService();
Template.global_customerlist.onCreated(function(){
    const templateObject = Template.instance();
    templateObject.custdatatablerecords = new ReactiveVar([]);
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.selectedFile = new ReactiveVar();
    templateObject.custdisplayfields = new ReactiveVar([]);
    templateObject.reset_data = new ReactiveVar([]);
});

Template.global_customerlist.onRendered(function() {
  let templateObject = Template.instance();
  let contactService = new ContactService();
  const customerList = [];
  let salesOrderTable;
  var splashArray = new Array();
  var splashArrayCustomerList = new Array();

  const lineCustomerItems = [];
  const dataTableList = [];
  const tableHeaderList = [];

  if(FlowRouter.current().queryParams.success){
      $('.btnRefresh').addClass('btnRefreshAlert');
  }

  // set initial table rest_data
  templateObject.init_reset_data = function(){
  //function init_reset_data() {
    let reset_data = [
      { index: 0, label: '#ID', class:'colCustomerID', active: false, display: true, width: "0" },
      { index: 1, label: "Company", class: "colCompany", active: true, display: true, width: "200" },
      { index: 2, label: "Job", class: "colJob", active: true, display: true, width: "200" },
      { index: 3, label: "Phone", class: "colPhone", active: true, display: true, width: "95" },
      { index: 4, label: "Mobile", class: "colMobile", active: false, display: true, width: "95" },
      { index: 5, label: "AR Balance", class: "colARBalance", active: true, display: true, width: "80" },
      { index: 6, label: "Credit Balance", class: "colCreditBalance", active: true, display: true, width: "80" },
      { index: 7, label: "Balance", class: "colBalance", active: true, display: true, width: "80" },
      { index: 8, label: "Credit Limit", class: "colCreditLimit", active: true, display: true, width: "80" },
      { index: 9, label: "Order Balance", class: "colSalesOrderBalance", active: true, display: true, width: "80" },
      { index: 10, label: "Street Address", class: "colStreetAddress", active: false, display: true, width: "0" },
      { index: 11, label: "City/Suburb", class: "colSuburb", active: true, display: true, width: "100" },
      { index: 12, label: "State", class: "colState", active: false, display: true, width: "100" },
      { index: 13, label: "Zip Code", class: "colZipCode", active: false, display: true, width: "95" },
      { index: 14, label: "Country", class: "colCountry", active: true, display: true, width: "95" },
      { index: 15, label: "Email", class: "colEmail", active: false, display: true, width: "100" },
      { index: 16, label: "Account No", class: "colAccountNo", active: false, display: true, width: "100" },
      { index: 17, label: "Customer Type", class: "colCustomerType", active: false, display: true, width: "80" },
      { index: 18, label: "Discount", class: "colCustomerDiscount", active: false, display: true, width: "80" },
      { index: 19, label: "Term Name", class: "colCustomerTermName", active: false, display: true, width: "80" },
      { index: 20, label: "First Name", class: "colCustomerFirstName", active: false, display: true, width: "80" },
      { index: 21, label: "Last Name", class: "colCustomerLastName", active: false, display: true, width: "80" },
      { index: 22, label: "Tax Code", class: "colCustomerTaxCode", active: false, display: true, width: "80" },
      { index: 23, label: "Custom Field 1", class: "colClientNo", active: false, display: true, width: "80" },
      { index: 24, label: "Custom Field 2", class: "colJobTitle", active: false, display: true, width: "80" },
      { index: 25, label: "Notes", class: "colNotes", active: true, display: true, width: "" },
    ];

    let templateObject = Template.instance();
    templateObject.reset_data.set(reset_data);
  }
  templateObject.init_reset_data();
  // set initial table rest_data


  // custom field displaysettings
  templateObject.initCustomFieldDisplaySettings = function(data, listType){
  //function initCustomFieldDisplaySettings(data, listType) {
    let templateObject = Template.instance();
    let reset_data = templateObject.reset_data.get();
    templateObject.showCustomFieldDisplaySettings(reset_data);

    try {
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
          // handle process here
        }
      });
    } catch (error) {
    }
    return;
  }
  templateObject.showCustomFieldDisplaySettings = function(reset_data){
  //function showCustomFieldDisplaySettings(reset_data) {

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
        $('#tblCustomerlist_wrapper .'+reset_data[r].class).removeClass('hiddenColumn');
      }else if(reset_data[r].active == false){
        $('#tblCustomerlist_wrapper .'+reset_data[r].class).addClass('hiddenColumn');
      };
      custFields.push(customData);
    }
    templateObject.custdisplayfields.set(custFields);
  }
  templateObject.initCustomFieldDisplaySettings("", "tblCustomerlist");

  templateObject.resetData = function (dataVal) {
      location.reload();
  };

  templateObject.getCustomersData = async function () {
    let contactService = new ContactService();
    var customerpage = 0;
    getVS1Data('TCustomerVS1').then(function (dataObject) {
        if (dataObject.length == 0) {
            sideBarService.getAllCustomersDataVS1(initialBaseDataLoad, 0).then(async function (data) {
                await addVS1Data('TCustomerVS1', JSON.stringify(data));
                templateObject.displayCustomerData(data);
            }).catch(function (err) {

            });
        } else {
            let data = JSON.parse(dataObject[0].data);
            templateObject.displayCustomerData(data);
        }
    }).catch(function (err) {
      sideBarService.getAllCustomersDataVS1(initialBaseDataLoad, 0).then(async function (data) {
          await addVS1Data('TCustomerVS1', JSON.stringify(data));
          templateObject.displayCustomerData(data);
      }).catch(function (err) {

      });
    });
  }

  templateObject.displayCustomerData = async function (data) {
    if (FlowRouter.current().route.path == "/customerlist") {
    $('.fullScreenSpin').css('display','none');
    };

    let lineItems = [];
    let lineItemObj = {};
    for (let i = 0; i < data.tcustomervs1.length; i++) {
      let arBalance = utilityService.modifynegativeCurrencyFormat(data.tcustomervs1[i].fields.ARBalance)|| 0.00;
      let creditBalance = utilityService.modifynegativeCurrencyFormat(data.tcustomervs1[i].fields.CreditBalance) || 0.00;
      let balance = utilityService.modifynegativeCurrencyFormat(data.tcustomervs1[i].fields.Balance)|| 0.00;
      let creditLimit = utilityService.modifynegativeCurrencyFormat(data.tcustomervs1[i].fields.CreditLimit)|| 0.00;
      let salesOrderBalance = utilityService.modifynegativeCurrencyFormat(data.tcustomervs1[i].fields.SalesOrderBalance)|| 0.00;
        var dataList = {
            id: data.tcustomervs1[i].ID || '',
            clientName: data.tcustomervs1[i].ClientName || '',
            company: data.tcustomervs1[i].Companyname || '',
            contactname: data.tcustomervs1[i].ContactName || '',
            phone: data.tcustomervs1[i].Phone || '',
            arbalance: arBalance || 0.00,
            creditbalance: creditBalance || 0.00,
            balance: balance || 0.00,
            creditlimit: creditLimit || 0.00,
            salesorderbalance: salesOrderBalance || 0.00,
            email: data.tcustomervs1[i].Email || '',
            job: data.tcustomervs1[i].JobName || '',
            accountno: data.tcustomervs1[i].AccountNo || '',
            clientno: data.tcustomervs1[i].ClientNo || '',
            jobtitle: data.tcustomervs1[i].JobTitle || '',
            notes: data.tcustomervs1[i].Notes || '',
            state: data.tcustomervs1[i].State || '',
            country: data.tcustomervs1[i].Country || '',
            street: data.tcustomervs1[i].Street || ' ',
            street2: data.tcustomervs1[i].Street2 || ' ',
            street3: data.tcustomervs1[i].Street3 || ' ',
            suburb: data.tcustomervs1[i].Suburb || ' ',
            postcode: data.tcustomervs1[i].Postcode || ' ',
            clienttype: data.tcustomervs1[i].fields.ClientTypeName || 'Default',
            discount: data.tcustomervs1[i].fields.Discount || 0
        };

        dataTableList.push(dataList);
        let mobile = contactService.changeMobileFormat(data.tcustomervs1[i].fields.Mobile);

        var dataListCustomer = [
            data.tcustomervs1[i].fields.ID || '',
            data.tcustomervs1[i].fields.ClientName || '-',
            data.tcustomervs1[i].fields.JobName || '',
            data.tcustomervs1[i].fields.Phone || '',
            mobile || '',
            arBalance || 0.00,
            creditBalance || 0.00,
            balance || 0.00,
            creditLimit || 0.00,
            salesOrderBalance || 0.00,
            data.tcustomervs1[i].fields.Street || '',
            data.tcustomervs1[i].fields.Street2 || data.tcustomervs1[i].fields.Suburb || '',
            data.tcustomervs1[i].fields.State || '',
            data.tcustomervs1[i].fields.Postcode || '',
            data.tcustomervs1[i].fields.Country || '',
            data.tcustomervs1[i].fields.Email || '',
            data.tcustomervs1[i].fields.AccountNo || '',
            data.tcustomervs1[i].fields.ClientTypeName || 'Default',
            data.tcustomervs1[i].fields.Discount || 0,
            data.tcustomervs1[i].fields.TermsName || loggedTermsSales || 'COD',
            data.tcustomervs1[i].fields.FirstName || '',
            data.tcustomervs1[i].fields.LastName || '',
            data.tcustomervs1[i].fields.TaxCodeName || 'E',
            data.tcustomervs1[i].fields.ClientNo || '',
            data.tcustomervs1[i].fields.JobTitle || '',
            data.tcustomervs1[i].fields.Notes || ''
        ];

        splashArrayCustomerList.push(dataListCustomer);
        //}
    }

    function MakeNegative() {
        $('td').each(function () {
            if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
        });
    };

    templateObject.custdatatablerecords.set(dataTableList);

    if (templateObject.custdatatablerecords.get()) {
        setTimeout(function () {
            MakeNegative();
        }, 100);
    }
    //$('.fullScreenSpin').css('display','none');
    setTimeout(function () {
        $('#tblCustomerlist').DataTable({
            data: splashArrayCustomerList,
            "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
            columnDefs: [
                {className: "colCustomerID colID hiddenColumn", "targets": [0],
                createdCell: function (td, cellData, rowData, row, col) {
                  $(td).closest("tr").attr("id", rowData[0]);
                  $(td).closest("tr").attr("isjob", rowData[2]);
                }},
                {className: "colCompany", "targets": [1]},
                {className: "colJob","targets": [2]},
                {className: "colPhone","targets": [3]},
                {className: "colMobile hiddenColumn","targets": [4]},
                {className: "colARBalance hiddenColumn text-right","targets": [5]},
                {className: "colCreditBalance hiddenColumn text-right","targets": [6]},
                {className: "colBalance text-right","targets": [7]},
                {className: "colCreditLimit text-right","targets": [8]},
                {className: "colSalesOrderBalance text-right","targets": [9]},
                {className: "colStreetAddress hiddenColumn","targets": [10]},
                {className: "colSuburb colCity","targets": [11]},
                {className: "colState hiddenColumn","targets": [12]},
                {className: "colZipCode hiddenColumn","targets": [13]},
                {className: "colCountry","targets": [14]},
                {className: "colEmail hiddenColumn","targets": [15]},
                {className: "colAccountNo hiddenColumn","targets": [16]},
                {className: "colCustomerType hiddenColumn","targets": [17]},
                {className: "colCustomerDiscount hiddenColumn","targets": [18]},
                {className: "colCustomerTermName hiddenColumn","targets": [19]},
                {className: "colCustomerFirstName hiddenColumn","targets": [20]},
                {className: "colCustomerLastName hiddenColumn","targets": [21]},
                {className: "colCustomerTaxCode hiddenColumn","targets": [22]},
                {className: "colClientNo hiddenColumn","targets": [23]},
                {className: "colJobTitle hiddenColumn","targets": [24]},
                {className: "colNotes","targets": [25]},
            ],
            buttons: [
                {
                    extend: 'csvHtml5',
                    text: '',
                    download: 'open',
                    className: "btntabletocsv hiddenColumn",
                    filename: "customeroverview_"+ moment().format(),
                    orientation:'portrait',
                    exportOptions: {
                        columns: ':visible'
                    }
                },{
                    extend: 'print',
                    download: 'open',
                    className: "btntabletopdf hiddenColumn",
                    text: '',
                    title: 'Customer List',
                    filename: "Customer List - "+ moment().format(),
                    exportOptions: {
                        columns: ':visible',
                        stripHtml: false
                    }
                },
                {
                    extend: 'excelHtml5',
                    title: '',
                    download: 'open',
                    className: "btntabletoexcel hiddenColumn",
                    filename: "Customer List - "+ moment().format(),
                    orientation:'portrait',
                    exportOptions: {
                        columns: ':visible'
                    }

                }],
            select: true,
            destroy: true,
            colReorder: true,
            pageLength: initialDatatableLoad,
            lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
            info: true,
            responsive: true,
            "order": [[0, "asc"]],
            action: function () {
                $('#tblCustomerlist').DataTable().ajax.reload();
            },
            "fnDrawCallback": function (oSettings) {
                $('.paginate_button.page-item').removeClass('disabled');
                $('#tblCustomerlist_ellipsis').addClass('disabled');
                if (oSettings._iDisplayLength == -1) {
                    if (oSettings.fnRecordsDisplay() > 150) {

                    }
                } else {

                }
                if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                    $('.paginate_button.page-item.next').addClass('disabled');
                }

                $('.paginate_button.next:not(.disabled)', this.api().table().container())
                    .on('click', function () {
                        $('.fullScreenSpin').css('display', 'inline-block');
                        var splashArrayCustomerListDupp = new Array();
                        let dataLenght = oSettings._iDisplayLength;
                        let customerSearch = $('#tblCustomerlist_filter input').val();

                        sideBarService.getAllCustomersDataVS1(initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (dataObjectnew) {

                                    for (let j = 0; j < dataObjectnew.tcustomervs1.length; j++) {

                                        let arBalance = utilityService.modifynegativeCurrencyFormat(dataObjectnew.tcustomervs1[j].fields.ARBalance) || 0.00;
                                        let creditBalance = utilityService.modifynegativeCurrencyFormat(dataObjectnew.tcustomervs1[j].fields.CreditBalance) || 0.00;
                                        let balance = utilityService.modifynegativeCurrencyFormat(dataObjectnew.tcustomervs1[j].fields.Balance) || 0.00;
                                        let creditLimit = utilityService.modifynegativeCurrencyFormat(dataObjectnew.tcustomervs1[j].fields.CreditLimit) || 0.00;
                                        let salesOrderBalance = utilityService.modifynegativeCurrencyFormat(dataObjectnew.tcustomervs1[j].fields.SalesOrderBalance) || 0.00;
                                        var dataList = {
                                            id: dataObjectnew.tcustomervs1[j].fields.ID || '',
                                            clientName: dataObjectnew.tcustomervs1[j].fields.ClientName || '',
                                            company: dataObjectnew.tcustomervs1[j].fields.Companyname || '',
                                            contactname: dataObjectnew.tcustomervs1[j].fields.ContactName || '',
                                            phone: dataObjectnew.tcustomervs1[j].fields.Phone || '',
                                            arbalance: arBalance || 0.00,
                                            creditbalance: creditBalance || 0.00,
                                            balance: balance || 0.00,
                                            creditlimit: creditLimit || 0.00,
                                            salesorderbalance: salesOrderBalance || 0.00,
                                            email: dataObjectnew.tcustomervs1[j].fields.Email || '',
                                            job: dataObjectnew.tcustomervs1[j].fields.JobName || '',
                                            accountno: dataObjectnew.tcustomervs1[j].fields.AccountNo || '',
                                            clientno: dataObjectnew.tcustomervs1[j].fields.ClientNo || '',
                                            jobtitle: dataObjectnew.tcustomervs1[j].fields.JobTitle || '',
                                            notes: dataObjectnew.tcustomervs1[j].fields.Notes || '',
                                            state: dataObjectnew.tcustomervs1[j].fields.State || '',
                                            country: dataObjectnew.tcustomervs1[j].fields.Country || '',
                                            street: dataObjectnew.tcustomervs1[j].fields.Street || ' ',
                                            street2: dataObjectnew.tcustomervs1[j].fields.Street2 || ' ',
                                            street3: dataObjectnew.tcustomervs1[j].fields.Street3 || ' ',
                                            suburb: dataObjectnew.tcustomervs1[j].fields.Suburb || ' ',
                                            postcode: dataObjectnew.tcustomervs1[j].fields.Postcode || ' ',
                                            clienttype: dataObjectnew.tcustomervs1[j].fields.ClientTypeName || 'Default',
                                            discount: dataObjectnew.tcustomervs1[j].fields.Discount || 0
                                        };

                                        dataTableList.push(dataList);
                                        let mobile = contactService.changeMobileFormat(dataObjectnew.tcustomervs1[j].fields.Mobile);
                                        var dataListCustomerDupp = [
                                          dataObjectnew.tcustomervs1[j].fields.ID || '',
                                          dataObjectnew.tcustomervs1[j].fields.ClientName || '-',
                                          dataObjectnew.tcustomervs1[j].fields.JobName || '',
                                          dataObjectnew.tcustomervs1[j].fields.Phone || '',
                                          mobile || '',
                                          arBalance || 0.00,
                                          creditBalance || 0.00,
                                          balance || 0.00,
                                          creditLimit || 0.00,
                                          salesOrderBalance || 0.00,
                                          dataObjectnew.tcustomervs1[j].fields.Street || '',
                                          dataObjectnew.tcustomervs1[j].fields.Street2 || dataObjectnew.tcustomervs1[j].fields.Suburb || '',
                                          dataObjectnew.tcustomervs1[j].fields.State || '',
                                          dataObjectnew.tcustomervs1[j].fields.Postcode || '',
                                          dataObjectnew.tcustomervs1[j].fields.Country || '',
                                          dataObjectnew.tcustomervs1[j].fields.Email || '',
                                          dataObjectnew.tcustomervs1[j].fields.AccountNo || '',
                                          dataObjectnew.tcustomervs1[j].fields.ClientTypeName || 'Default',
                                          dataObjectnew.tcustomervs1[j].fields.Discount || 0,
                                          dataObjectnew.tcustomervs1[j].fields.TermsName || loggedTermsSales || 'COD',
                                          dataObjectnew.tcustomervs1[j].fields.FirstName || '',
                                          dataObjectnew.tcustomervs1[j].fields.LastName || '',
                                          dataObjectnew.tcustomervs1[j].fields.TaxCodeName || 'E',
                                          dataObjectnew.tcustomervs1[j].fields.ClientNo || '',
                                          dataObjectnew.tcustomervs1[j].fields.JobTitle || '',
                                          dataObjectnew.tcustomervs1[j].fields.Notes || '',
                                        ];

                                        splashArrayCustomerList.push(dataListCustomerDupp);
                                        //}
                                    }

                                    let uniqueChars = [...new Set(splashArrayCustomerList)];
                                    var datatable = $('#tblCustomerlist').DataTable();
                                    datatable.clear();
                                    datatable.rows.add(uniqueChars);
                                    datatable.draw(false);
                                    setTimeout(function () {
                                      $("#tblCustomerlist").dataTable().fnPageChange('last');
                                    }, 400);

                                    $('.fullScreenSpin').css('display', 'none');


                        }).catch(function (err) {
                            $('.fullScreenSpin').css('display', 'none');
                        });

                    });
                setTimeout(function () {
                    MakeNegative();
                }, 100);
            },
            language: { search: "",searchPlaceholder: "Search List..." },
            "fnInitComplete": function (oSettings) {
                if (FlowRouter.current().route.path == "/customerlist") {
                  $("<button class='btn btn-primary btnRefreshCustomer' type='button' id='btnRefreshCustomer' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblCustomerlist_filter");
                }else{
                  $("<button class='btn btn-primary btnAddNewCustomer' data-dismiss='modal' data-toggle='modal' data-target='#addCustomerModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblCustomerlist_filter");
                  $("<button class='btn btn-primary btnRefreshCustomer' type='button' id='btnRefreshCustomer' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblCustomerlist_filter");
                }


                let urlParametersPage = FlowRouter.current().queryParams.page;
                if (urlParametersPage) {
                    this.fnPageChange('last');
                }

            }

        }).on('page', function () {
            setTimeout(function () {
                MakeNegative();
            }, 100);
            let draftRecord = templateObject.custdatatablerecords.get();
            templateObject.custdatatablerecords.set(draftRecord);
        }).on('column-reorder', function () {

        }).on('length.dt', function (e, settings, len) {

            let dataLenght = settings._iDisplayLength;
            let customerSearch = $('#tblCustomerlist_filter input').val();
            splashArrayCustomerList = [];
            if (dataLenght == -1) {
              if(settings.fnRecordsDisplay() > initialDatatableLoad){

              }else{
                if (customerSearch.replace(/\s/g, '') != '') {
                  $('.fullScreenSpin').css('display', 'inline-block');
                  sideBarService.getAllCustomersDataVS1ByName(customerSearch).then(function (data) {
                      let lineItems = [];
                      let lineItemObj = {};
                      if (data.tcustomervs1.length > 0) {
                          for (let i = 0; i < data.tcustomervs1.length; i++) {
                              let arBalance = utilityService.modifynegativeCurrencyFormat(data.tcustomervs1[i].fields.ARBalance) || 0.00;
                              let creditBalance = utilityService.modifynegativeCurrencyFormat(data.tcustomervs1[i].fields.CreditBalance) || 0.00;
                              let balance = utilityService.modifynegativeCurrencyFormat(data.tcustomervs1[i].fields.Balance) || 0.00;
                              let creditLimit = utilityService.modifynegativeCurrencyFormat(data.tcustomervs1[i].fields.CreditLimit) || 0.00;
                              let salesOrderBalance = utilityService.modifynegativeCurrencyFormat(data.tcustomervs1[i].fields.SalesOrderBalance) || 0.00;
                              var dataList = {
                                  id: data.tcustomervs1[i].fields.ID || '',
                                  clientName: data.tcustomervs1[i].fields.ClientName || '',
                                  company: data.tcustomervs1[i].fields.Companyname || '',
                                  contactname: data.tcustomervs1[i].fields.ContactName || '',
                                  phone: data.tcustomervs1[i].fields.Phone || '',
                                  arbalance: arBalance || 0.00,
                                  creditbalance: creditBalance || 0.00,
                                  balance: balance || 0.00,
                                  creditlimit: creditLimit || 0.00,
                                  salesorderbalance: salesOrderBalance || 0.00,
                                  email: data.tcustomervs1[i].fields.Email || '',
                                  job: data.tcustomervs1[i].fields.JobName || '',
                                  accountno: data.tcustomervs1[i].fields.AccountNo || '',
                                  clientno: data.tcustomervs1[i].fields.ClientNo || '',
                                  jobtitle: data.tcustomervs1[i].fields.JobTitle || '',
                                  notes: data.tcustomervs1[i].fields.Notes || '',
                                  state: data.tcustomervs1[i].fields.State || '',
                                  country: data.tcustomervs1[i].fields.Country || '',
                                  street: data.tcustomervs1[i].fields.Street || ' ',
                                  street2: data.tcustomervs1[i].fields.Street2 || ' ',
                                  street3: data.tcustomervs1[i].fields.Street3 || ' ',
                                  suburb: data.tcustomervs1[i].fields.Suburb || ' ',
                                  postcode: data.tcustomervs1[i].fields.Postcode || ' '
                              };

                              dataTableList.push(dataList);

                              let mobile = contactService.changeMobileFormat(data.tcustomervs1[i].fields.Mobile);
                              var dataListCustomer = [
                                data.tcustomervs1[i].fields.ID || '',
                                data.tcustomervs1[i].fields.ClientName || '-',
                                data.tcustomervs1[i].fields.JobName || '',
                                data.tcustomervs1[i].fields.Phone || '',
                                mobile || '',
                                arBalance || 0.00,
                                creditBalance || 0.00,
                                balance || 0.00,
                                creditLimit || 0.00,
                                salesOrderBalance || 0.00,
                                data.tcustomervs1[i].fields.Street || '',
                                data.tcustomervs1[i].fields.Street2 || data.tcustomervs1[i].fields.Suburb || '',
                                data.tcustomervs1[i].fields.State || '',
                                data.tcustomervs1[i].fields.Postcode || '',
                                data.tcustomervs1[i].fields.Country || '',
                                data.tcustomervs1[i].fields.Email || '',
                                data.tcustomervs1[i].fields.AccountNo || '',
                                data.tcustomervs1[i].fields.ClientTypeName || 'Default',
                                data.tcustomervs1[i].fields.Discount || 0,
                                data.tcustomervs1[i].fields.TermsName || loggedTermsSales || 'COD',
                                data.tcustomervs1[i].fields.FirstName || '',
                                data.tcustomervs1[i].fields.LastName || '',
                                data.tcustomervs1[i].fields.TaxCodeName || 'E',
                                data.tcustomervs1[i].fields.ClientNo || '',
                                data.tcustomervs1[i].fields.JobTitle || '',
                                data.tcustomervs1[i].fields.Notes || '',
                              ];

                              splashArrayCustomerList.push(dataListCustomer);
                              //}
                          }
                          var datatable = $('#tblCustomerlist').DataTable();
                          datatable.clear();
                          datatable.rows.add(splashArrayCustomerList);
                          datatable.draw(false);

                          $('.fullScreenSpin').css('display', 'none');
                      } else {

                          $('.fullScreenSpin').css('display', 'none');
                          $('#customerListModal').modal('toggle');
                          swal({
                              title: 'Question',
                              text: "Customer does not exist, would you like to create it?",
                              type: 'question',
                              showCancelButton: true,
                              confirmButtonText: 'Yes',
                              cancelButtonText: 'No'
                          }).then((result) => {
                              if (result.value) {
                                  $('#addCustomerModal').modal('toggle');
                                  $('#edtCustomerCompany').val(dataSearchName);
                              } else if (result.dismiss === 'cancel') {
                                  $('#customerListModal').modal('toggle');
                              }
                          });

                      }

                  }).catch(function (err) {
                      $('.fullScreenSpin').css('display', 'none');
                  });
                }else{
                  $('.fullScreenSpin').css('display', 'none');
                }

              }

            } else {
                if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
                    $('.fullScreenSpin').css('display', 'none');
                } else {
                    sideBarService.getAllCustomersDataVS1(dataLenght, 0).then(function (dataNonBo) {
                        addVS1Data('TCustomerVS1', JSON.stringify(dataNonBo)).then(function (datareturn) {
                            templateObject.resetData(dataNonBo);
                            $('.fullScreenSpin').css('display', 'none');
                        }).catch(function (err) {
                            $('.fullScreenSpin').css('display', 'none');
                        });
                    }).catch(function (err) {
                        $('.fullScreenSpin').css('display', 'none');
                    });
                }
            }
            setTimeout(function () {
                MakeNegative();
            }, 100);
        });
        //$($.fn.dataTable.tables(true)).DataTable().columns.adjust();
    }, 0);

    var columns = $('#tblCustomerlist th');
    let sTible = "";
    let sWidth = "";
    let sIndex = "";
    let sVisible = "";
    let columVisible = false;
    let sClass = "";
    $.each(columns, function (i, v) {
        if (v.hidden == false) {
            columVisible = true;
        }
        if ((v.className.includes("hiddenColumn"))) {
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
    $('div.dataTables_filter input').addClass('form-control form-control-sm');
  }

  templateObject.getCustomersData();
  tableResize();
});


Template.global_customerlist.events({
  'click .resetTable' : function(event){
    let templateObject = Template.instance();
    let reset_data = templateObject.reset_data.get();
      //reset_data[9].display = false;
      reset_data = reset_data.filter(redata => redata.display);

    $(".custdisplaySettings").each(function (index) {
      let $tblrow = $(this);
      $tblrow.find(".divcolumn").text(reset_data[index].label);
      $tblrow.find(".custom-control-input").prop("checked", reset_data[index].active);

      let title = $("#tblCustomerlist").find("th").eq(index);
        $(title).html(reset_data[index].label);

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
  "click .saveTable": async function(event) {
    let lineItems = [];
    $(".fullScreenSpin").css("display", "inline-block");

    $(".custdisplaySettings").each(function (index) {
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
      let tableName = "tblCustomerlist";
      let employeeId = parseInt(Session.get('mySessionEmployeeLoggedID'))||0;
      let added = await sideBarService.saveNewCustomFields(erpGet, tableName, employeeId, lineItems);
      $(".fullScreenSpin").css("display", "none");
      if(added){
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
      }

    }
});

Template.global_customerlist.helpers({
  custdatatablerecords: () => {
      return Template.instance().custdatatablerecords.get().sort(function (a, b) {
          if (a.company == 'NA') {
              return 1;
          } else if (b.company == 'NA') {
              return -1;
          }
          return (a.company.toUpperCase() > b.company.toUpperCase()) ? 1 : -1;
      });
  },
  tableheaderrecords: () => {
      return Template.instance().tableheaderrecords.get();
  },
  salesCloudPreferenceRec: () => {
      return CloudPreference.findOne({
          userid: Session.get('mycloudLogonID'),
          PrefName: 'tblCustomerlist'
      });
  },
  loggedCompany: () => {
      return localStorage.getItem('mySession') || '';
  },
  showSetupFinishedAlert: () => {
      let setupFinished = localStorage.getItem("IS_SETUP_FINISHED") || false;
      if (setupFinished == true || setupFinished == "true") {
          return false;
      } else {
          return true;
      }
  },
  custdisplayfields: () => {
    return Template.instance().custdisplayfields.get();
  }
});
