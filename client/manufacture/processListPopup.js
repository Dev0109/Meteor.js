import {SalesBoardService} from '../js/sales-service';
import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../js/core-service';
import {EmployeeProfileService} from "../js/profile-service";
import {AccountService} from "../accounts/account-service";
import {InvoiceService} from "../invoice/invoice-service";
import {UtilityService} from "../utility-service";
import { SideBarService } from '../js/sidebar-service';
import {OrganisationService} from '../js/organisation-service';
import { ManufacturingService } from './manufacturing-service';
import 'jquery-ui-dist/external/jquery/jquery';
import 'jquery-ui-dist/jquery-ui';
import 'jquery-editable-select';

let manufacturingService = new ManufacturingService();

Template.processlistpopup.onCreated(function(e){
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
})

Template.processlistpopup.onRendered(function(e){
    const templateObject = Template.instance();
    let splashArrayProcessList = [];
    templateObject.getProcessList = function(e) {
        // let tempArray = localStorage.getItem('TProcesses');
        // templateObject.datatablerecords.set(tempArray?JSON.parse(tempArray): []);
        $('.fullScreenSpin').css('display', 'inline-block');


        // getVS1Data('TProcessStep').then(function(dataObject){
        //     if(dataObject.length == 0) {
        //         manufacturingService.getAllProcessData().then(function(data){
        //             addVS1Data('TProcessStep', JSON.stringify(data)).then(function(datareturn){}).catch(function(err){})
        //             templateObject.datatablerecords.set(data.tprocessstep);
        //             if(templateObject.datatablerecords.get()) {
        //                 let temp = templateObject.datatablerecords.get();
        //                 temp.map(process => {
        //                     let dataListProcess = [
        //                         process.fields.KeyValue || '',
        //                         process.fields.Description || '',
        //                         process.fields.DailyHours || 0,
        //                         process.fields.TotalHourlyCost || 0.00,
        //                         process.fields.Wastage || '',
        //                     ];
        //                     splashArrayProcessList.push(dataListProcess);
        //                 })

                         
        //                 setTimeout(function () {
        //                     $('#tblProcessPopList').DataTable({
        //                         data: splashArrayProcessList,
        //                         "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
        //                         columnDefs: [
        //                             {
        //                                 className: "colProcessName",
        //                                 "targets": [0]
        //                             },
        //                             {
        //                                 className: "colDescription",
        //                                 "targets": [1]
        //                             }, {
        //                                 className: "colDailyHours",
        //                                 "targets": [2]
        //                             }, {
        //                                 className: "colTotalHourlyCosts",
        //                                 "targets": [3]
        //                             }, {
        //                                 className: "colWastage",
        //                                 "targets": [4]
        //                             }
        //                         ],
        //                         select: true,
        //                         destroy: true,
        //                         colReorder: true,
        //                         pageLength: initialDatatableLoad,
        //                         lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
        //                         info: true,
        //                         responsive: true,
        //                         "order": [[1, "asc"]],
        //                         action: function () {
        //                             $('#tblProcessPopList').DataTable().ajax.reload();
        //                         },
        //                         "fnDrawCallback": function (oSettings) {
        //                             $('.paginate_button.page-item').removeClass('disabled');
        //                             $('#tblProcessPopList_ellipsis').addClass('disabled');
        //                             if (oSettings._iDisplayLength == -1) {
        //                                 if (oSettings.fnRecordsDisplay() > 150) {
                    
        //                                 }
        //                             } else {
                    
        //                             }
        //                             if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
        //                                 $('.paginate_button.page-item.next').addClass('disabled');
        //                             }
        //                             setTimeout(function () {
        //                                 // MakeNegative();
        //                             }, 100);
        //                         },
        //                         "fnInitComplete": function (oSettings) {
        //                             $("<button class='btn btn-primary btnAddNewProcess' data-dismiss='modal' data-toggle='modal' data-target='#addCustomerModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i>New Process</button>").insertAfter("#tblProcessPopList_filter");
        //                             $("<button class='btn btn-primary btnRefreshProcess' type='button' id='btnRefreshProcess' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblProcessPopList_filter");
                    
        //                             // let urlParametersPage = FlowRouter.current().queryParams.page;
        //                             // if (urlParametersPage) {
        //                             //     this.fnPageChange('last');
        //                             // }
                    
        //                         }
                    
        //                     }).on('page', function () {
        //                         setTimeout(function () {
        //                             // MakeNegative();
        //                         }, 100);
        //                         let draftRecord = templateObject.custdatatablerecords.get();
        //                         templateObject.custdatatablerecords.set(draftRecord);
        //                         $('.fullScreenSpin').css('display', 'none')
        //                     }).on('column-reorder', function () {
                    
        //                     }).on('length.dt', function (e, settings, len) {
        //                     $('.fullScreenSpin').css('display', 'inline-block');
        //                     let dataLenght = settings._iDisplayLength;
        //                     if (dataLenght == -1) {
        //                         $('.fullScreenSpin').css('display', 'none');
        //                     }else{
        //                         if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
        //                             $('.fullScreenSpin').css('display', 'none');
        //                         } else {
                    
        //                             $('.fullScreenSpin').css('display', 'none');
        //                         }
                    
        //                     }
                    
        //                     });
        //                     $('.fullScreenSpin').css('display', 'none')
        //                 }, 1000);
        //             }
        //         })
        //     }else {
        //         let data = JSON.parse(dataObject[0].data);
        //         templateObject.datatablerecords.set(data.tprocessstep);
        //         if(templateObject.datatablerecords.get()) {
        //             let temp = templateObject.datatablerecords.get();
        //             temp.map(process => {
        //                 let dataListProcess = [
        //                     process.fields.KeyValue || '',
        //                     process.fields.Description || '',
        //                     process.fields.DailyHours || 0,
        //                     process.fields.TotalHourlyCost || 0.00,
        //                     process.fields.Wastage || '',
        //                 ];
        //                 splashArrayProcessList.push(dataListProcess);
        //             })

        //             setTimeout(function () {
        //                 $('#tblProcessPopList').DataTable({
        //                     data: splashArrayProcessList,
        //                     "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
        //                     columnDefs: [
        //                         {
        //                             className: "colProcessName",
        //                             "targets": [0]
        //                         },
        //                         {
        //                             className: "colDescription",
        //                             "targets": [1]
        //                         }, {
        //                             className: "colDailyHours",
        //                             "targets": [2]
        //                         }, {
        //                             className: "colTotalHourlyCosts",
        //                             "targets": [3]
        //                         }, {
        //                             className: "colWastage",
        //                             "targets": [4]
        //                         }
        //                     ],
        //                     select: true,
        //                     destroy: true,
        //                     colReorder: true,
        //                     pageLength: initialDatatableLoad,
        //                     lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
        //                     info: true,
        //                     responsive: true,
        //                     "order": [[1, "asc"]],
        //                     action: function () {
        //                         $('#tblProcessPopList').DataTable().ajax.reload();
        //                     },
        //                     "fnDrawCallback": function (oSettings) {
        //                         $('.paginate_button.page-item').removeClass('disabled');
        //                         $('#tblProcessPopList_ellipsis').addClass('disabled');
        //                         if (oSettings._iDisplayLength == -1) {
        //                             if (oSettings.fnRecordsDisplay() > 150) {
                
        //                             }
        //                         } else {
                
        //                         }
        //                         if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
        //                             $('.paginate_button.page-item.next').addClass('disabled');
        //                         }
        //                         setTimeout(function () {
        //                             // MakeNegative();
                                    
        //                         }, 100);
        //                     },
        //                     "fnInitComplete": function (oSettings) {
        //                         $("<button class='btn btn-primary btnAddNewProcess' data-dismiss='modal' data-toggle='modal' data-target='#addCustomerModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i>New Process</button>").insertAfter("#tblProcessPopList_filter");
        //                         $("<button class='btn btn-primary btnRefreshProcess' type='button' id='btnRefreshProcess' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblProcessPopList_filter");
        //                         // let urlParametersPage = FlowRouter.current().queryParams.page;
        //                         // if (urlParametersPage) {
        //                         //     this.fnPageChange('last');
        //                         // }
                
        //                     }
                
        //                 }).on('page', function () {
        //                     setTimeout(function () {
        //                         // MakeNegative();
        //                     }, 100);
        //                     let draftRecord = templateObject.custdatatablerecords.get();
        //                     templateObject.custdatatablerecords.set(draftRecord);
        //                     $('.fullScreenSpin').css('display', 'none')
        //                 }).on('column-reorder', function () {
                
        //                 }).on('length.dt', function (e, settings, len) {
        //                 $('.fullScreenSpin').css('display', 'inline-block');
        //                 let dataLenght = settings._iDisplayLength;
        //                 if (dataLenght == -1) {
        //                     $('.fullScreenSpin').css('display', 'none');
        //                 }else{
        //                     if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
        //                         $('.fullScreenSpin').css('display', 'none');
        //                     } else {
                
        //                         $('.fullScreenSpin').css('display', 'none');
        //                     }
                
        //                 }
                
        //                 });
        //                 $('.fullScreenSpin').css('display', 'none')
        //             }, 1000);
        //         }
        //     }
        // }).catch(function(error) {
        //     manufacturingService.getAllProcessData().then(function(data){
        //         addVS1Data('TProcessStep', JSON.stringify(data)).then(function(datareturn){}).catch(function(err){})
        //         templateObject.datatablerecords.set(data.tprocessstep);
        //         if(templateObject.datatablerecords.get()) {
        //             let temp = templateObject.datatablerecords.get();
        //             temp.map(process => {
        //                 let dataListProcess = [
        //                     process.fields.KeyValue || '',
        //                     process.fields.Description || '',
        //                     process.fields.DailyHours || 0,
        //                     process.fields.TotalHourlyCost || 0.00,
        //                     process.fields.Wastage || '',
        //                 ];
        //                 splashArrayProcessList.push(dataListProcess);
        //             })
                     
        //             setTimeout(function () {
        //                 $('#tblProcessPopList').DataTable({
        //                     data: splashArrayProcessList,
        //                     "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
        //                     columnDefs: [
        //                         {
        //                             className: "colProcessName",
        //                             "targets": [0]
        //                         },
        //                         {
        //                             className: "colDescription",
        //                             "targets": [1]
        //                         }, {
        //                             className: "colDailyHours",
        //                             "targets": [2]
        //                         }, {
        //                             className: "colTotalHourlyCosts",
        //                             "targets": [3]
        //                         }, {
        //                             className: "colWastage",
        //                             "targets": [4]
        //                         }
        //                     ],
        //                     select: true,
        //                     destroy: true,
        //                     colReorder: true,
        //                     pageLength: initialDatatableLoad,
        //                     lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
        //                     info: true,
        //                     responsive: true,
        //                     "order": [[1, "asc"]],
        //                     action: function () {
        //                         $('#tblProcessPopList').DataTable().ajax.reload();
        //                     },
        //                     "fnDrawCallback": function (oSettings) {
        //                         $('.paginate_button.page-item').removeClass('disabled');
        //                         $('#tblProcessPopList_ellipsis').addClass('disabled');
        //                         if (oSettings._iDisplayLength == -1) {
        //                             if (oSettings.fnRecordsDisplay() > 150) {
                
        //                             }
        //                         } else {
                
        //                         }
        //                         if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
        //                             $('.paginate_button.page-item.next').addClass('disabled');
        //                         }
        //                         setTimeout(function () {
        //                             // MakeNegative();
        //                         }, 100);
        //                     },
        //                     "fnInitComplete": function (oSettings) {
        //                         $("<button class='btn btn-primary btnAddNewProcess' data-dismiss='modal' data-toggle='modal' data-target='#addCustomerModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i>New Process</button>").insertAfter("#tblProcessPopList_filter");
        //                         $("<button class='btn btn-primary btnRefreshProcess' type='button' id='btnRefreshProcess' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblProcessPopList_filter");
                
        //                         // let urlParametersPage = FlowRouter.current().queryParams.page;
        //                         // if (urlParametersPage) {
        //                         //     this.fnPageChange('last');
        //                         // }
                
        //                     }
                
        //                 }).on('page', function () {
        //                     setTimeout(function () {
        //                         // MakeNegative();
        //                     }, 100);
        //                     let draftRecord = templateObject.custdatatablerecords.get();
        //                     templateObject.custdatatablerecords.set(draftRecord);
        //                     $('.fullScreenSpin').css('display', 'none')
        //                 }).on('column-reorder', function () {
                
        //                 }).on('length.dt', function (e, settings, len) {
        //                 $('.fullScreenSpin').css('display', 'inline-block');
        //                 let dataLenght = settings._iDisplayLength;
        //                 if (dataLenght == -1) {
        //                     $('.fullScreenSpin').css('display', 'none');
        //                 }else{
        //                     if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
        //                         $('.fullScreenSpin').css('display', 'none');
        //                     } else {
                
        //                         $('.fullScreenSpin').css('display', 'none');
        //                     }
                
        //                 }
                
        //                 });
        //                 $('.fullScreenSpin').css('display', 'none')
        //             }, 1000);
        //         }
        //     }).catch(function(err){
        //         swal("Something went wrong!", "", "error");
        //     })
        // })


       
    }
    // templateObject.getProcessList();

    
})

Template.processlistpopup.helpers({
    datatablerecords:()=>{
        return Template.instance().datatablerecords.get();
    }
})

Template.processlistpopup.events({
    'click .btnAddNewProcess':function(event) {
        $('#processListModal').modal('toggle');
        $('#newProcessModal').modal('toggle')
    }
})
