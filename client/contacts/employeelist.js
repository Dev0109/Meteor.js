import {ContactService} from "./contact-service";
import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../js/core-service';
import {UtilityService} from "../utility-service";
import XLSX from 'xlsx';
import { SideBarService } from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
import CachedHttp from "../lib/global/CachedHttp";
import erpObject from "../lib/global/erp-objects";
import LoadingOverlay from "../LoadingOverlay";
import { OrganisationService } from "../js/organisation-service";

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
let organisationService = new OrganisationService();
Template.employeelist.inheritsHooksFrom('non_transactional_list');
Template.employeelist.onCreated(function(){
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.selectedFile = new ReactiveVar();
    templateObject.displayfields = new ReactiveVar([]);
    templateObject.reset_data = new ReactiveVar([]);
    templateObject.setupFinished = new ReactiveVar();


    templateObject.employees = new ReactiveVar([]);
});

Template.employeelist.onRendered(function() {
   // $('.fullScreenSpin').css('display','inline-block');
    let templateObject = Template.instance();
    let contactService = new ContactService();
    const customerList = [];
    let salesOrderTable;
    const splashArray = [];
    const dataTableList = [];
    const tableHeaderList = [];
    if(FlowRouter.current().queryParams.success){
        $('.btnRefresh').addClass('btnRefreshAlert');
    }
    /*
    templateObject.getEmployees = function () {
        getVS1Data('TEmployee').then(function (dataObject) {
            if(dataObject.length == 0){
                sideBarService.getAllEmployees(initialBaseDataLoad,0).then(function (data) {
                    setAllEmployees(data);
                }).catch(function (err) {
                    // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                    $('.fullScreenSpin').css('display','none');
                    // Meteor._reload.reload();
                });
            }else{
                let data = JSON.parse(dataObject[0].data);
                setAllEmployees(data);
            }
        }).catch(function (err) {
            sideBarService.getAllEmployees(initialBaseDataLoad,0).then(function (data) {
                setAllEmployees(data);
            }).catch(function (err) {
                // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                $('.fullScreenSpin').css('display','none');
                // Meteor._reload.reload();
            });
        });
    }
    function setAllEmployees(data) {
        addVS1Data('TEmployee',JSON.stringify(data));
        let lineItems = [];
        let lineItemObj = {};
        for(let i=0; i<data.temployee.length; i++){
            let mobile = contactService.changeDialFormat(data.temployee[i].fields.Mobile, data.temployee[i].fields.Country)
            const dataList = {
                id: data.temployee[i].fields.ID || '',
                employeeno: data.temployee[i].fields.EmployeeNo || '',
                employeename: data.temployee[i].fields.EmployeeName || '',
                firstname: data.temployee[i].fields.FirstName || '',
                lastname: data.temployee[i].fields.LastName || '',
                phone: data.temployee[i].fields.Phone || '',
                mobile: mobile || '',
                email: data.temployee[i].fields.Email || '',
                address: data.temployee[i].fields.Street || '',
                country: data.temployee[i].fields.Country || '',
                department: data.temployee[i].fields.DefaultClassName || '',
                custFld1: data.temployee[i].fields.CustFld1 || '',
                custFld2: data.temployee[i].fields.CustFld2 || '',
                custFld3: data.temployee[i].fields.CustFld3 || '',
                custFld4: data.temployee[i].fields.CustFld4 || ''
            };
            if(data.temployee[i].fields.EmployeeName.replace(/\s/g, '') != ''){
                dataTableList.push(dataList);
            }
            //}
        }
        templateObject.datatablerecords.set(dataTableList);

        setTimeout(function () {
            $('#tblEmployeelist').DataTable({
                "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                buttons: [
                    {
                        extend: 'csvHtml5',
                        text: '',
                        download: 'open',
                        className: "btntabletocsv hiddenColumn",
                        filename: "Employee List - "+ moment().format(),
                        orientation:'portrait',
                        exportOptions: {
                            columns: ':visible'
                        }
                    },{
                        extend: 'print',
                        download: 'open',
                        className: "btntabletopdf hiddenColumn",
                        text: '',
                        title: 'Employee List',
                        filename: "Employee List - "+ moment().format(),
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
                        filename: "Employee List - "+ moment().format(),
                        orientation:'portrait',
                        exportOptions: {
                            columns: ':visible'
                        }

                    }],
                select: true,
                destroy: true,
                colReorder: true,
                // bStateSave: true,
                // rowId: 0,
                pageLength: initialDatatableLoad,
                lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                info: true,
                responsive: true,
                "order": [[ 1, "asc" ]],
                action: function () {
                    $('#tblEmployeelist').DataTable().ajax.reload();
                },
                language: { search: "",searchPlaceholder: "Search List..." },
                "fnInitComplete": function () {
                    $("<button class='btn btn-primary btnRefreshEmployees ' type='button' id='btnRefreshEmployees' style='padding: 4px 10px; font-size: 16px; margin-left: 14px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblEmployeelist_filter");
                }
            }).on('page', function () {
                let draftRecord = templateObject.datatablerecords.get();
                templateObject.datatablerecords.set(draftRecord);
            }).on('column-reorder', function () {

            });
            // $('#tblEmployeelist').DataTable().column( 0 ).visible( true );
            $('.fullScreenSpin').css('display','none');
        }, 0);

        const columns = $('#tblEmployeelist th');
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
        $('div.dataTables_filter input').addClass('form-control form-control-sm');
        $('#tblEmployeelist tbody').on( 'click', 'tr', function () {
            const listData = $(this).closest('tr').attr('id');
            if(listData){
                FlowRouter.go('/employeescard?id=' + listData);
            }
        });
    }
    // templateObject.getEmployees();

    // set initial table rest_data
    function init_reset_data() {
        let bsbname = "Branch Code";
        if (Session.get("ERPLoggedCountry") === "Australia") {
            bsbname = "BSB";
        }

        let reset_data = [
          { index: 0, label: 'Emp #', class: 'EmployeeNo', active: false, display: true, width: "" },
          { index: 1, label: 'Employee Name', class: 'EmployeeName', active: true, display: true, width: "150" },
          { index: 2, label: 'First Name', class: 'FirstName', active: true, display: true, width: "85" },
          { index: 3, label: 'Last Name', class: 'LastName', active: false, display: true, width: "95" },
          { index: 4, label: 'Phone', class: 'Phone', active: true, display: true, width: "95" },
          { index: 5, label: 'Mobile', class: 'Mobile', active: true, display: true, width: "95" },
          { index: 6, label: 'Email', class: 'Email', active: true, display: true, width: "100" },
          { index: 7, label: 'Department', class: 'Department', active: false, display: true, width: "100" },
          { index: 8, label: 'Country', class: 'Country', active: false, display: true, width: "120" },
          { index: 9, label: 'Custom Field 1', class: 'CustFld1', active: false, display: true, width: "" },
          { index: 10, label: 'Custom Field 2', class: 'CustFld2', active: false, display: true, width: "" },
          { index: 11, label: 'Address', class: 'Address', active: true, display: true, width: "" },
        ];

        let templateObject = Template.instance();
        templateObject.reset_data.set(reset_data);
      }
      init_reset_data();
      // set initial table rest_data


      // custom field displaysettings
    //   templateObject.initCustomFieldDisplaySettings = function(data, listType) {
    //     let templateObject = Template.instance();
    //     let reset_data = templateObject.reset_data.get();
    //     showCustomFieldDisplaySettings(reset_data);

    //     try {
    //       getVS1Data("VS1_Customize").then(function (dataObject) {
    //         if (dataObject.length == 0) {
    //           sideBarService.getNewCustomFieldsWithQuery(parseInt(Session.get('mySessionEmployeeLoggedID')), listType).then(function (data) {
    //               // reset_data = data.ProcessLog.CustomLayout.Columns;
    //               reset_data = data.ProcessLog.Obj.CustomLayout[0].Columns;
    //               showCustomFieldDisplaySettings(reset_data);
    //           }).catch(function (err) {
    //           });
    //         } else {
    //           let data = JSON.parse(dataObject[0].data);
    //           // handle process here
    //         }
    //       });
    //     } catch (error) {
    //     }
    //     return;
    //   }

      templateObject.initCustomFieldDisplaySettings = async (data, listType) => {
        let reset_data = await templateObject.reset_data.get();
        showCustomFieldDisplaySettings(reset_data);

        try {
          let dataObject = await getVS1Data("VS1_Customize");

            if (dataObject.length == 0) {
              let data = await sideBarService.getNewCustomFieldsWithQuery(parseInt(Session.get('mySessionEmployeeLoggedID')), listType);
                // reset_data = data.ProcessLog.CustomLayout.Columns;
                reset_data = data.ProcessLog.Obj.CustomLayout[0].Columns;
                showCustomFieldDisplaySettings(reset_data);
            } else {
              let data = JSON.parse(dataObject[0].data);
              if(data.ProcessLog.Obj.CustomLayout.length > 0){
               for (let i = 0; i < data.ProcessLog.Obj.CustomLayout.length; i++) {
                 if(data.ProcessLog.Obj.CustomLayout[i].TableName == listType){
                   reset_data = data.ProcessLog.Obj.CustomLayout[i].Columns;
                   showCustomFieldDisplaySettings(reset_data);
                 }
               }
             };
              // handle process here
            }

        } catch (error) {
        }
        return;
      };


      function showCustomFieldDisplaySettings(reset_data) {

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
          custFields.push(customData);
        }
        templateObject.displayfields.set(custFields);
      }

    //   templateObject.initCustomFieldDisplaySettings("", "tblEmployeelist");
      // set initial table rest_data  //
      */

    $('#tblEmployeelist tbody').on( 'click', 'tr', function () {
        const listData = $(this).closest('tr').attr('id');
        if(listData){
          let params = ''
          var queryParams = FlowRouter.current().queryParams;
          if(queryParams.bank) {
            let edtBankName = queryParams.edtBankName;
            let edtBankAccountName = queryParams.edtBankAccountName;
            let edtBSB = queryParams.edtBSB;
            let edtBankAccountNo = queryParams.edtBankAccountNo;
            let swiftCode = queryParams.swiftCode;
            let apcaNo = queryParams.apcaNo;
            let routingNo = queryParams.routingNo;
            let sltBankCodes = queryParams.sltBankCodes;
            params = '&bank=true&edtBankName='+edtBankName+'&edtBankAccountName='+edtBankAccountName+'&edtBSB='+edtBSB+'&edtBankAccountNo='+edtBankAccountNo+'&swiftCode='+swiftCode+'&apcaNo='+apcaNo+'&routingNo='+routingNo+'&sltBankCodes='+sltBankCodes;
          }
          FlowRouter.go('/employeescard?id=' + listData + params);
        }
    });
    // templateObject.checkSetupWizardFinished = async function () {
    //     let setupFinished = localStorage.getItem("IS_SETUP_FINISHED") || "";
    //     if( setupFinished === null || setupFinished ===  "" ){
    //         let setupInfo = await organisationService.getSetupInfo();
    //         if( setupInfo.tcompanyinfo.length > 0 ){
    //             let data = setupInfo.tcompanyinfo[0];
    //             localStorage.setItem("IS_SETUP_FINISHED", data.IsSetUpWizard)
    //             templateObject.setupFinished.set(data.IsSetUpWizard)
    //         }
    //     }else{
    //         templateObject.setupFinished.set(setupFinished)
    //     }
    // }
    // templateObject.checkSetupWizardFinished();
    checkSetupFinished();
});

Template.employeelist.events({
    "click #tblEmployeelist tbody tr": (e, ui) => {
        const id = $(e.currentTarget).attr('id');
        if(id){
            FlowRouter.go(`/employeescard?id=${id}`);
        }
    },
    'click #btnNewEmployee':function(event){
        FlowRouter.go('/employeescard');
    },
    'click .btnAddVS1User':function(event){
        swal({
            title: 'Is this an existing Employee?',
            text: '',
            type: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.value) {
                swal("Please select the employee from the list below.", "", "info");
                $('#employeeListModal').modal('toggle');
                // result.dismiss can be 'overlay', 'cancel', 'close', 'esc', 'timer'
            } else if (result.dismiss === 'cancel') {
                FlowRouter.go('/employeescard?addvs1user=true');
            }
        })
    },
    'keyup #tblEmployeelist_filter input': function (event) {
          if($(event.target).val() != ''){
            $(".btnRefreshEmployees").addClass('btnSearchAlert');
          }else{
            $(".btnRefreshEmployees").removeClass('btnSearchAlert');
          }
          if (event.keyCode == 13) {
             $(".btnRefreshEmployees").trigger("click");
          }
      },

    'click .btnRefreshEmployees': async (event, ui) => {
        await ui.loadEmployees(true);
        //  let templateObject = Template.instance();
        // let utilityService = new UtilityService();
        // let contactService = new ContactService();
        // let tableProductList;
        // const dataTableList = [];
        // var splashArrayInvoiceList = new Array();
        // const lineExtaSellItems = [];
        // $('.fullScreenSpin').css('display', 'inline-block');
        // let dataSearchName = $('#tblEmployeelist_filter input').val();
        // if (dataSearchName.replace(/\s/g, '') != '') {
        //     sideBarService.getNewEmployeeByNameOrID(dataSearchName).then(function (data) {
        //         $(".btnRefreshEmployees").removeClass('btnSearchAlert');
        //         let lineItems = [];
        //         let lineItemObj = {};
        //         if (data.temployee.length > 0) {
        //             for(let i=0; i<data.temployee.length; i++){
        //                 let mobile = contactService.changeDialFormat(data.temployee[i].fields.Mobile, data.temployee[i].fields.Country);
        //                 var dataList = {
        //                     id: data.temployee[i].fields.ID || '',
        //                     employeeno: data.temployee[i].fields.EmployeeNo || '',
        //                     employeename:data.temployee[i].fields.EmployeeName || '',
        //                     firstname: data.temployee[i].fields.FirstName || '',
        //                     lastname: data.temployee[i].fields.LastName || '',
        //                     phone: data.temployee[i].fields.Phone || '',
        //                     mobile: mobile || '',
        //                     email: data.temployee[i].fields.Email || '',
        //                     address: data.temployee[i].fields.Street || '',
        //                     country: data.temployee[i].fields.Country || '',
        //                     department: data.temployee[i].fields.DefaultClassName || '',
        //                     custFld1: data.temployee[i].fields.CustFld1 || '',
        //                     custFld2: data.temployee[i].fields.CustFld2 || '',
        //                     custFld3: data.temployee[i].fields.CustFld3 || '',
        //                     custFld4: data.temployee[i].fields.CustFld4 || ''
        //                 };

        //                 if(data.temployee[i].fields.EmployeeName.replace(/\s/g, '') != ''){
        //                     dataTableList.push(dataList);
        //                 }
        //             //}
        //             }

        //             templateObject.datatablerecords.set(dataTableList);

        //             let item = templateObject.datatablerecords.get();
        //             $('.fullScreenSpin').css('display', 'none');
        //             if (dataTableList) {
        //                 var datatable = $('#tblEmployeelist').DataTable();
        //                 $("#tblEmployeelist > tbody").empty();
        //                 for (let x = 0; x < item.length; x++) {
        //                     $("#tblEmployeelist > tbody").append(
        //                         ' <tr class="dnd-moved" id="' + item[x].id + '" style="cursor: pointer;">' +
        //                         '<td contenteditable="false" class="colEmployeeID">' + item[x].id + '</td>' +
        //                         '<td contenteditable="false" class="colEmployeeName" >' + item[x].employeename + '</td>' +
        //                         '<td contenteditable="false" class="colFirstName">' + item[x].firstname + '</td>' +
        //                         '<td contenteditable="false" class="colLastName" >' + item[x].lastname + '</td>' +
        //                         '<td contenteditable="false" class="colPhone">' + item[x].phone + '</td>' +
        //                         '<td contenteditable="false" class="colMobile">' + item[x].mobile + '</td>' +
        //                         '<td contenteditable="false" class="colEmail">' + item[x].email + '</td>' +
        //                         '<td contenteditable="false" class="colDepartment">' + item[x].department + '</td>' +
        //                         '<td contenteditable="false" class="colCountry hiddenColumn">' + item[x].country + '</td>' +
        //                         '<td contenteditable="false" class="colCustFld1 hiddenColumn">' + item[x].custFld1 + '</td>' +
        //                         '<td contenteditable="false" class="colCustFld2 hiddenColumn">' + item[x].custFld2 + '</td>' +
        //                         '<td contenteditable="false" class="colAddress">' + item[x].address + '</td>' +
        //                         '</tr>');

        //                 }
        //                 $('.dataTables_info').html('Showing 1 to ' + data.temployee.length + ' of ' + data.temployee.length + ' entries');

        //             }
        //         } else {
        //             $('.fullScreenSpin').css('display', 'none');
        //             swal({
        //                 title: 'Question',
        //                 text: "Employee does not exist, would you like to create it?",
        //                 type: 'question',
        //                 showCancelButton: true,
        //                 confirmButtonText: 'Yes',
        //                 cancelButtonText: 'No'
        //             }).then((result) => {
        //                 if (result.value) {
        //                     FlowRouter.go('/employeescard');
        //                 } else if (result.dismiss === 'cancel') {
        //                     //$('#productListModal').modal('toggle');
        //                 }
        //             });
        //         }

        //     }).catch(function (err) {
        //         $('.fullScreenSpin').css('display', 'none');
        //     });
        // } else {
        //   $(".btnRefresh").trigger("click");
        // }
    },
    'click .exportbtn': function () {
        $('.fullScreenSpin').css('display','inline-block');
        jQuery('#tblEmployeelist_wrapper .dt-buttons .btntabletocsv').click();
        $('.fullScreenSpin').css('display','none');

    },
    'click .exportbtnExcel': function () {
        $('.fullScreenSpin').css('display','inline-block');
        jQuery('#tblEmployeelist_wrapper .dt-buttons .btntabletoexcel').click();
        $('.fullScreenSpin').css('display','none');
    },
    'click .btnRefresh':  (e, ui) => {
        // ui.initPage(true);
        $('.fullScreenSpin').css('display','inline-block');
        let templateObject = Template.instance();

        sideBarService.getAllEmployees(initialBaseDataLoad,0).then(function(dataEmployee) {
            addVS1Data('TEmployee',JSON.stringify(dataEmployee));
        });

        sideBarService.getAllAppointmentPredList().then(function (dataPred) {
            addVS1Data('TAppointmentPreferences', JSON.stringify(dataPred)).then(function (datareturnPred) {
              sideBarService.getAllTEmployeeList(initialBaseDataLoad,0,false).then(function(data) {
                  addVS1Data('TEmployeeList',JSON.stringify(data)).then(function (datareturn) {
                      window.open('/employeelist','_self');
                  }).catch(function (err) {
                      window.open('/employeelist','_self');
                  });
              }).catch(function(err) {
                  window.open('/employeelist','_self');
              });
            }).catch(function (err) {
              window.open('/employeelist','_self');
            });
        }).catch(function (err) {
          window.open('/employeelist','_self');
        });

    },
    'click .printConfirm' : function(event){
        playPrintAudio();
        setTimeout(function(){
        $('.fullScreenSpin').css('display','inline-block');
        jQuery('#tblEmployeelist_wrapper .dt-buttons .btntabletopdf').click();
        $('.fullScreenSpin').css('display','none');
    }, delayTimeAfterSound);
    },
    'click .templateDownload': function () {
        let utilityService = new UtilityService();
        let rows =[];
        const filename = 'SampleEmployee'+'.csv';
        rows[0]= ['First Name', 'Last Name', 'Phone','Mobile', 'Email','Skype', 'Street', 'City/Suburb', 'State', 'Post Code', 'Country', 'Gender'];
        rows[1]= ['John', 'Smith', '9995551213','9995551213', 'johnsmith@email.com','johnsmith', '123 Main Street', 'Brooklyn', 'New York', '1234', 'United States', 'M'];
        rows[1]= ['Jane', 'Smith', '9995551213','9995551213', 'janesmith@email.com','janesmith', '123 Main Street', 'Brooklyn', 'New York', '1234', 'United States', 'F'];
        utilityService.exportToCsv(rows, filename, 'csv');
    },
    'click .templateDownloadXLSX': function (e) {

        e.preventDefault();  //stop the browser from following
        window.location.href = 'sample_imports/SampleEmployee.xlsx';
    },
    'click .btnUploadFile':function(event){
        $('#attachment-upload').val('');
        $('.file-name').text('');
        //$(".btnImport").removeAttr("disabled");
        $('#attachment-upload').trigger('click');

    },
    'change #attachment-upload': function (e) {
        let templateObj = Template.instance();
        var filename = $('#attachment-upload')[0].files[0]['name'];
        var fileExtension = filename.split('.').pop().toLowerCase();
        var validExtensions = ["csv","txt","xlsx"];
        var validCSVExtensions = ["csv","txt"];
        var validExcelExtensions = ["xlsx","xls"];

        if (validExtensions.indexOf(fileExtension) == -1) {
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
        var saledateTime = new Date();
        //let empStartDate = new Date().format("YYYY-MM-DD");
        var empStartDate = moment(saledateTime).format("YYYY-MM-DD");
        Papa.parse(templateObject.selectedFile.get(), {
            complete: function(results) {

                if(results.data.length > 0){
                    if( (results.data[0][0] == "First Name")
                       && (results.data[0][1] == "Last Name") && (results.data[0][2] == "Phone")
                       && (results.data[0][3] == "Mobile") && (results.data[0][4] == "Email")
                       && (results.data[0][5] == "Skype") && (results.data[0][6] == "Street")
                       && ((results.data[0][7] == "Street2")|| (results.data[0][7] == "City/Suburb")) && (results.data[0][8] == "State")
                       && (results.data[0][9] == "Post Code") && (results.data[0][10] == "Country")
                       && (results.data[0][11] == "Gender")) {

                        let dataLength = results.data.length * 500;
                        setTimeout(function(){
                            // $('#importModal').modal('toggle');
                            //Meteor._reload.reload();
                            window.open('/employeelist?success=true','_self');
                        },parseInt(dataLength));

                        for (let i = 0; i < results.data.length -1; i++) {
                            objDetails = {
                                type: "TEmployee",
                                fields:
                                {
                                    FirstName: results.data[i+1][0].trim(),
                                    LastName: results.data[i+1][1].trim(),
                                    Phone: results.data[i+1][2],
                                    Mobile: results.data[i+1][3],
                                    DateStarted: empStartDate,
                                    DOB: empStartDate,
                                    Sex: results.data[i+1][11]||"F",
                                    Email: results.data[i+1][4],
                                    SkypeName: results.data[i+1][5],
                                    Street: results.data[i+1][6],
                                    Street2: results.data[i+1][7],
                                    Suburb: results.data[i+1][7],
                                    State: results.data[i+1][8],
                                    PostCode:results.data[i+1][9],
                                    Country:results.data[i+1][10]

                                    // BillStreet: results.data[i+1][6],
                                    // BillStreet2: results.data[i+1][7],
                                    // BillState: results.data[i+1][8],
                                    // BillPostCode:results.data[i+1][9],
                                    // Billcountry:results.data[i+1][10]
                                }
                            };
                            if(results.data[i+1][1]){
                                if(results.data[i+1][1] !== "") {
                                    contactService.saveEmployee(objDetails).then(function (data) {
                                        ///$('.fullScreenSpin').css('display','none');
                                        //Meteor._reload.reload();
                                    }).catch(function (err) {
                                        //$('.fullScreenSpin').css('display','none');
                                        swal({ title: 'Oooops...', text: err, type: 'error', showCancelButton: false, confirmButtonText: 'Try Again' }).then((result) => { if (result.value) { Meteor._reload.reload(); } else if (result.dismiss === 'cancel') {}});
                                    });
                                }
                            }
                        }
                    }else{
                        $('.fullScreenSpin').css('display','none');
                        swal('Invalid Data Mapping fields ', 'Please check that you are importing the correct file with the correct column headers.', 'error');
                    }
                }else{
                    $('.fullScreenSpin').css('display','none');
                    swal('Invalid Data Mapping fields ', 'Please check that you are importing the correct file with the correct column headers.', 'error');
                }

            }
        });
    }


});

Template.employeelist.helpers({
    datatablerecords : () => {
        return Template.instance().datatablerecords.get().sort(function(a, b){
            if (a.employeename == 'NA') {
                return 1;
            }
            else if (b.employeename == 'NA') {
                return -1;
            }
            return (a.employeename.toUpperCase() > b.employeename.toUpperCase()) ? 1 : -1;
        });
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    salesCloudPreferenceRec: () => {
        return CloudPreference.findOne({userid:Session.get('mycloudLogonID'),PrefName:'tblEmployeelist'});
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
    },
    // custom fields displaysettings
    displayfields: () => {
    return Template.instance().displayfields.get();
    },
    employees: () => Template.instance().employees.get()
});
