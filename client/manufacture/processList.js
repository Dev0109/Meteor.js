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

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
let manufacturingService = new ManufacturingService();
Template.processList.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    // templateObject.selectedInventoryAssetAccount = new ReactiveVar('');
})

Template.processList.onRendered (function() {
    const templateObject = Template.instance();


    // function MakeNegative() {
    //     $('td').each(function () {
    //         if ($(this).text().indexOf('-' + Currency) >= 0)
    //             $(this).addClass('text-danger')
    //     });

    //     $('td.colStatus').each(function(){
    //         if($(this).text() == "Deleted") $(this).addClass('text-deleted');
    //         if ($(this).text() == "Full") $(this).addClass('text-fullyPaid');
    //         if ($(this).text() == "Part") $(this).addClass('text-partialPaid');
    //         if ($(this).text() == "Rec") $(this).addClass('text-reconciled');
    //     });
    // };
    // templateObject.getProcessRecords  = function(e) {
    //     $('.fullScreenSpin').css('display', 'inline-block');

    //     getVS1Data('TProcessStep').then(function(dataObject){
    //         if(dataObject.length == 0) {
    //             manufacturingService.getAllProcessData().then(function(data){
    //                 addVS1Data('TProcessStep', JSON.stringify(data)).then(function(datareturn){}).catch(function(err){})
    //                 templateObject.datatablerecords.set(data.tprocessstep)
    //                 if (templateObject.datatablerecords.get()) {
    //                     Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblProcessList', function (error, result) {
    //                         if (error) {
    //                         }
    //                         else {
    //                             if (result) {
    //                                 for (let i = 0; i < result.customFields.length; i++) {
    //                                     let customcolumn = result.customFields;
    //                                     let columData = customcolumn[i].label;
    //                                     let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
    //                                     let hiddenColumn = customcolumn[i].hidden;
    //                                     let columnClass = columHeaderUpdate.split('.')[1];
    //                                     let columnWidth = customcolumn[i].width;
    //                                     let columnindex = customcolumn[i].index + 1;
            
    //                                     if (hiddenColumn == true) {
            
    //                                         $("." + columnClass + "").addClass('hiddenColumn');
    //                                         $("." + columnClass + "").removeClass('showColumn');
    //                                     } else if (hiddenColumn == false) {
    //                                         $("." + columnClass + "").removeClass('hiddenColumn');
    //                                         $("." + columnClass + "").addClass('showColumn');
    //                                     }
            
    //                                 }
    //                             }
            
    //                         }
    //                     });
            
    //                     // setTimeout(function () {
    //                     //     MakeNegative();
    //                     // }, 100);
            
    //                 }
            
    //                 $('.fullScreenSpin').css('display', 'none');
    //                 setTimeout(function () {
    //                     $('#tblProcessList').DataTable({
    //                         columnDefs: [{
    //                                 type: 'date',
    //                                 targets: 0
    //                             }
    //                         ],
    //                         "sDom": "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
    //                         buttons: [{
    //                                 extend: 'excelHtml5',
    //                                 text: '',
    //                                 download: 'open',
    //                                 className: "btntabletocsv hiddenColumn",
    //                                 filename: "Process List excel - " + moment().format(),
    //                                 orientation: 'portrait',
    //                                 exportOptions: {
    //                                     columns: ':visible',
    //                                     format: {
    //                                         body: function (data, row, column) {
    //                                             if (data.includes("</span>")) {
    //                                                 var res = data.split("</span>");
    //                                                 data = res[1];
    //                                             }
            
    //                                             return column === 1 ? data.replace(/<.*?>/ig, "") : data;
            
    //                                         }
    //                                     }
    //                                 }
    //                             }, {
    //                                 extend: 'print',
    //                                 download: 'open',
    //                                 className: "btntabletopdf hiddenColumn",
    //                                 text: '',
    //                                 title: 'Process List',
    //                                 filename: "Process List - " + moment().format(),
    //                                 exportOptions: {
    //                                     columns: ':visible',
    //                                     stripHtml: false
    //                                 }
    //                             }
    //                         ],
    //                         select: true,
    //                         destroy: true,
    //                         colReorder: true,
    //                         // bStateSave: true,
    //                         // rowId: 0,
    //                         pageLength: initialDatatableLoad,
    //                         "bLengthChange": false,
    //                         info: true,
    //                         responsive: true,
    //                         "order": [[ 0, "desc" ],[ 2, "desc" ]],
    //                         action: function () {
    //                             $('#tblProcessOList').DataTable().ajax.reload();
    //                         },
    //                         "fnDrawCallback": function (oSettings) {
    //                             let checkurlIgnoreDate = FlowRouter.current().queryParams.ignoredate;
            
    //                             $('.paginate_button.page-item').removeClass('disabled');
    //                             $('#tblProcessList_ellipsis').addClass('disabled');
            
    //                             if(oSettings._iDisplayLength == -1){
    //                             if(oSettings.fnRecordsDisplay() > 150){
    //                                 $('.paginate_button.page-item.previous').addClass('disabled');
    //                                 $('.paginate_button.page-item.next').addClass('disabled');
    //                             }
    //                             }else{
            
    //                             }
    //                             if(oSettings.fnRecordsDisplay() < initialDatatableLoad){
    //                                 $('.paginate_button.page-item.next').addClass('disabled');
    //                             }
            
    //                             $('.paginate_button.next:not(.disabled)', this.api().table().container())
    //                             .on('click', function(){
    //                                 $('.fullScreenSpin').css('display','inline-block');
    //                                 let dataLenght = oSettings._iDisplayLength;
                                  
    //                             });
            
    //                             // setTimeout(function () {
    //                             //     MakeNegative();
    //                             // }, 100);
    //                         },
    //                         "fnInitComplete": function () {
    //                             this.fnPageChange('last');
    //                             $("<button class='btn btn-primary btnRefreshProcessList' type='button' id='btnRefreshProcessList' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblInvoicelist_filter");
    //                             $('.myvarFilterForm').appendTo(".colDateFilter");
    //                         },
    //                         // "fnInfoCallback": function (oSettings, iStart, iEnd, iMax, iTotal, sPre) {
    //                         //     let countTableData = data.Params.Count || 0; //get count from API data
            
    //                         //     return 'Showing '+ iStart + " to " + iEnd + " of " + countTableData;
    //                         // }
            
    //                     }).on('page', function () {
    //                         // setTimeout(function () {
    //                         //     MakeNegative();
    //                         // }, 100);
    //                         let draftRecord = templateObject.datatablerecords.get();
    //                         templateObject.datatablerecords.set(draftRecord);
    //                     }).on('column-reorder', function () {}).on('length.dt', function (e, settings, len) {
    //                         // setTimeout(function () {
    //                         //     MakeNegative();
    //                         // }, 100);
    //                     });
            
    //                     // $('#tblInvoicelist').DataTable().column( 0 ).visible( true );
    //                     $('.fullScreenSpin').css('display', 'none');
            
    //                 }, 0);
            
    //                 var columns = $('#tblProcessList th');
    //                 let sTible = "";
    //                 let sWidth = "";
    //                 let sIndex = "";
    //                 let sVisible = "";
    //                 let columVisible = false;
    //                 let isCustomField = false;
    //                 let sClass = "";
    //                 $.each(columns, function (i, v) {
    //                     if (v.hidden == false) {
    //                         columVisible = true;
    //                     }
    //                     if ((v.className.includes("hiddenColumn"))) {
    //                         columVisible = false;
    //                     }
            
    //                     if ((v.className.includes("customFieldColumn"))) {
    //                         isCustomField = true;
    //                     } else {
    //                         isCustomField = false;
    //                     }
            
    //                     sWidth = v.style.width.replace('px', "");
            
    //                     let datatablerecordObj = {
    //                         custid: $(this).attr("custid") || 0,
    //                         sTitle: v.innerText || '',
    //                         sWidth: sWidth || '9',
    //                         sIndex: v.cellIndex || '',
    //                         sVisible: columVisible || false,
    //                         sCustomField: isCustomField || false,
    //                         sClass: v.className || ''
    //                     };
    //                     // tableHeaderList.push(datatablerecordObj);
    //                 });
    //                 // templateObject.tableheaderrecords.set(tableHeaderList);
    //                 $('div.dataTables_filter input').addClass('form-control form-control-sm');
    //             })
    //         }else {
    //             let data = JSON.parse(dataObject[0].data);
    //             templateObject.datatablerecords.set(data.tprocessstep);

    //             if (templateObject.datatablerecords.get()) {
    //                 Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblProcessList', function (error, result) {
    //                     if (error) {
    //                     }
    //                     else {
    //                         if (result) {
    //                             for (let i = 0; i < result.customFields.length; i++) {
    //                                 let customcolumn = result.customFields;
    //                                 let columData = customcolumn[i].label;
    //                                 let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
    //                                 let hiddenColumn = customcolumn[i].hidden;
    //                                 let columnClass = columHeaderUpdate.split('.')[1];
    //                                 let columnWidth = customcolumn[i].width;
    //                                 let columnindex = customcolumn[i].index + 1;
        
    //                                 if (hiddenColumn == true) {
        
    //                                     $("." + columnClass + "").addClass('hiddenColumn');
    //                                     $("." + columnClass + "").removeClass('showColumn');
    //                                 } else if (hiddenColumn == false) {
    //                                     $("." + columnClass + "").removeClass('hiddenColumn');
    //                                     $("." + columnClass + "").addClass('showColumn');
    //                                 }
        
    //                             }
    //                         }
        
    //                     }
    //                 });
        
    //                 // setTimeout(function () {
    //                 //     MakeNegative();
    //                 // }, 100);
        
    //             }
        
    //             $('.fullScreenSpin').css('display', 'none');
    //             setTimeout(function () {
    //                 $('#tblProcessList').DataTable({
    //                     columnDefs: [{
    //                             type: 'date',
    //                             targets: 0
    //                         }
    //                     ],
    //                     "sDom": "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
    //                     buttons: [{
    //                             extend: 'excelHtml5',
    //                             text: '',
    //                             download: 'open',
    //                             className: "btntabletocsv hiddenColumn",
    //                             filename: "Process List excel - " + moment().format(),
    //                             orientation: 'portrait',
    //                             exportOptions: {
    //                                 columns: ':visible',
    //                                 format: {
    //                                     body: function (data, row, column) {
    //                                         if (data.includes("</span>")) {
    //                                             var res = data.split("</span>");
    //                                             data = res[1];
    //                                         }
        
    //                                         return column === 1 ? data.replace(/<.*?>/ig, "") : data;
        
    //                                     }
    //                                 }
    //                             }
    //                         }, {
    //                             extend: 'print',
    //                             download: 'open',
    //                             className: "btntabletopdf hiddenColumn",
    //                             text: '',
    //                             title: 'Process List',
    //                             filename: "Process List - " + moment().format(),
    //                             exportOptions: {
    //                                 columns: ':visible',
    //                                 stripHtml: false
    //                             }
    //                         }
    //                     ],
    //                     select: true,
    //                     destroy: true,
    //                     colReorder: true,
    //                     // bStateSave: true,
    //                     // rowId: 0,
    //                     pageLength: initialDatatableLoad,
    //                     "bLengthChange": false,
    //                     info: true,
    //                     responsive: true,
    //                     "order": [[ 0, "desc" ],[ 2, "desc" ]],
    //                     action: function () {
    //                         $('#tblProcessOList').DataTable().ajax.reload();
    //                     },
    //                     "fnDrawCallback": function (oSettings) {
    //                         let checkurlIgnoreDate = FlowRouter.current().queryParams.ignoredate;
        
    //                         $('.paginate_button.page-item').removeClass('disabled');
    //                         $('#tblProcessList_ellipsis').addClass('disabled');
        
    //                         if(oSettings._iDisplayLength == -1){
    //                         if(oSettings.fnRecordsDisplay() > 150){
    //                             $('.paginate_button.page-item.previous').addClass('disabled');
    //                             $('.paginate_button.page-item.next').addClass('disabled');
    //                         }
    //                         }else{
        
    //                         }
    //                         if(oSettings.fnRecordsDisplay() < initialDatatableLoad){
    //                             $('.paginate_button.page-item.next').addClass('disabled');
    //                         }
        
    //                         $('.paginate_button.next:not(.disabled)', this.api().table().container())
    //                         .on('click', function(){
    //                             $('.fullScreenSpin').css('display','inline-block');
    //                             let dataLenght = oSettings._iDisplayLength;
                                
    //                         });
        
    //                         // setTimeout(function () {
    //                         //     MakeNegative();
    //                         // }, 100);
    //                     },
    //                     "fnInitComplete": function () {
    //                         this.fnPageChange('last');
    //                         $("<button class='btn btn-primary btnRefreshProcessList' type='button' id='btnRefreshProcessList' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblInvoicelist_filter");
    //                         $('.myvarFilterForm').appendTo(".colDateFilter");
    //                     },
    //                     // "fnInfoCallback": function (oSettings, iStart, iEnd, iMax, iTotal, sPre) {
    //                     //     let countTableData = data.Params.Count || 0; //get count from API data
        
    //                     //     return 'Showing '+ iStart + " to " + iEnd + " of " + countTableData;
    //                     // }
        
    //                 }).on('page', function () {
    //                     // setTimeout(function () {
    //                     //     MakeNegative();
    //                     // }, 100);
    //                     let draftRecord = templateObject.datatablerecords.get();
    //                     templateObject.datatablerecords.set(draftRecord);
    //                 }).on('column-reorder', function () {}).on('length.dt', function (e, settings, len) {
    //                     // setTimeout(function () {
    //                     //     MakeNegative();
    //                     // }, 100);
    //                 });
        
    //                 // $('#tblInvoicelist').DataTable().column( 0 ).visible( true );
    //                 $('.fullScreenSpin').css('display', 'none');
        
    //             }, 0);
        
    //             var columns = $('#tblProcessList th');
    //             let sTible = "";
    //             let sWidth = "";
    //             let sIndex = "";
    //             let sVisible = "";
    //             let columVisible = false;
    //             let isCustomField = false;
    //             let sClass = "";
    //             $.each(columns, function (i, v) {
    //                 if (v.hidden == false) {
    //                     columVisible = true;
    //                 }
    //                 if ((v.className.includes("hiddenColumn"))) {
    //                     columVisible = false;
    //                 }
        
    //                 if ((v.className.includes("customFieldColumn"))) {
    //                     isCustomField = true;
    //                 } else {
    //                     isCustomField = false;
    //                 }
        
    //                 sWidth = v.style.width.replace('px', "");
        
    //                 let datatablerecordObj = {
    //                     custid: $(this).attr("custid") || 0,
    //                     sTitle: v.innerText || '',
    //                     sWidth: sWidth || '9',
    //                     sIndex: v.cellIndex || '',
    //                     sVisible: columVisible || false,
    //                     sCustomField: isCustomField || false,
    //                     sClass: v.className || ''
    //                 };
    //                 // tableHeaderList.push(datatablerecordObj);
    //             });
    //             // templateObject.tableheaderrecords.set(tableHeaderList);
    //             $('div.dataTables_filter input').addClass('form-control form-control-sm');

    //         }

    //     }).catch(function(err) {
    //         manufacturingService.getAllProcessData().then(function(data) {
    //             addVS1Data('TProcessStep', JSON.stringify(data)).then(function(datareturn){}).catch(function(err){})
    //             templateObject.datatablerecords.set(data.tprocessstep);
    //             if (templateObject.datatablerecords.get()) {
    //                 Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblProcessList', function (error, result) {
    //                     if (error) {
    //                     }
    //                     else {
    //                         if (result) {
    //                             for (let i = 0; i < result.customFields.length; i++) {
    //                                 let customcolumn = result.customFields;
    //                                 let columData = customcolumn[i].label;
    //                                 let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
    //                                 let hiddenColumn = customcolumn[i].hidden;
    //                                 let columnClass = columHeaderUpdate.split('.')[1];
    //                                 let columnWidth = customcolumn[i].width;
    //                                 let columnindex = customcolumn[i].index + 1;
        
    //                                 if (hiddenColumn == true) {
        
    //                                     $("." + columnClass + "").addClass('hiddenColumn');
    //                                     $("." + columnClass + "").removeClass('showColumn');
    //                                 } else if (hiddenColumn == false) {
    //                                     $("." + columnClass + "").removeClass('hiddenColumn');
    //                                     $("." + columnClass + "").addClass('showColumn');
    //                                 }
        
    //                             }
    //                         }
        
    //                     }
    //                 });
        
    //                 // setTimeout(function () {
    //                 //     MakeNegative();
    //                 // }, 100);
        
    //             }
        
    //             $('.fullScreenSpin').css('display', 'none');
    //             setTimeout(function () {
    //                 $('#tblProcessList').DataTable({
    //                     columnDefs: [{
    //                             type: 'date',
    //                             targets: 0
    //                         }
    //                     ],
    //                     "sDom": "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
    //                     buttons: [{
    //                             extend: 'excelHtml5',
    //                             text: '',
    //                             download: 'open',
    //                             className: "btntabletocsv hiddenColumn",
    //                             filename: "Process List excel - " + moment().format(),
    //                             orientation: 'portrait',
    //                             exportOptions: {
    //                                 columns: ':visible',
    //                                 format: {
    //                                     body: function (data, row, column) {
    //                                         if (data.includes("</span>")) {
    //                                             var res = data.split("</span>");
    //                                             data = res[1];
    //                                         }
        
    //                                         return column === 1 ? data.replace(/<.*?>/ig, "") : data;
        
    //                                     }
    //                                 }
    //                             }
    //                         }, {
    //                             extend: 'print',
    //                             download: 'open',
    //                             className: "btntabletopdf hiddenColumn",
    //                             text: '',
    //                             title: 'Process List',
    //                             filename: "Process List - " + moment().format(),
    //                             exportOptions: {
    //                                 columns: ':visible',
    //                                 stripHtml: false
    //                             }
    //                         }
    //                     ],
    //                     select: true,
    //                     destroy: true,
    //                     colReorder: true,
    //                     // bStateSave: true,
    //                     // rowId: 0,
    //                     pageLength: initialDatatableLoad,
    //                     "bLengthChange": false,
    //                     info: true,
    //                     responsive: true,
    //                     "order": [[ 0, "desc" ],[ 2, "desc" ]],
    //                     action: function () {
    //                         $('#tblProcessOList').DataTable().ajax.reload();
    //                     },
    //                     "fnDrawCallback": function (oSettings) {
    //                         let checkurlIgnoreDate = FlowRouter.current().queryParams.ignoredate;
        
    //                         $('.paginate_button.page-item').removeClass('disabled');
    //                         $('#tblProcessList_ellipsis').addClass('disabled');
        
    //                         if(oSettings._iDisplayLength == -1){
    //                         if(oSettings.fnRecordsDisplay() > 150){
    //                             $('.paginate_button.page-item.previous').addClass('disabled');
    //                             $('.paginate_button.page-item.next').addClass('disabled');
    //                         }
    //                         }else{
        
    //                         }
    //                         if(oSettings.fnRecordsDisplay() < initialDatatableLoad){
    //                             $('.paginate_button.page-item.next').addClass('disabled');
    //                         }
        
    //                         $('.paginate_button.next:not(.disabled)', this.api().table().container())
    //                         .on('click', function(){
    //                             $('.fullScreenSpin').css('display','inline-block');
    //                             let dataLenght = oSettings._iDisplayLength;
                                
    //                         });
        
    //                         // setTimeout(function () {
    //                         //     MakeNegative();
    //                         // }, 100);
    //                     },
    //                     "fnInitComplete": function () {
    //                         this.fnPageChange('last');
    //                         $("<button class='btn btn-primary btnRefreshProcessList' type='button' id='btnRefreshProcessList' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblInvoicelist_filter");
    //                         $('.myvarFilterForm').appendTo(".colDateFilter");
    //                     },
    //                     // "fnInfoCallback": function (oSettings, iStart, iEnd, iMax, iTotal, sPre) {
    //                     //     let countTableData = data.Params.Count || 0; //get count from API data
        
    //                     //     return 'Showing '+ iStart + " to " + iEnd + " of " + countTableData;
    //                     // }
        
    //                 }).on('page', function () {
    //                     // setTimeout(function () {
    //                     //     MakeNegative();
    //                     // }, 100);
    //                     let draftRecord = templateObject.datatablerecords.get();
    //                     templateObject.datatablerecords.set(draftRecord);
    //                 }).on('column-reorder', function () {}).on('length.dt', function (e, settings, len) {
    //                     // setTimeout(function () {
    //                     //     MakeNegative();
    //                     // }, 100);
    //                 });
        
    //                 // $('#tblInvoicelist').DataTable().column( 0 ).visible( true );
    //                 $('.fullScreenSpin').css('display', 'none');
        
    //             }, 0);
        
    //             var columns = $('#tblProcessList th');
    //             let sTible = "";
    //             let sWidth = "";
    //             let sIndex = "";
    //             let sVisible = "";
    //             let columVisible = false;
    //             let isCustomField = false;
    //             let sClass = "";
    //             $.each(columns, function (i, v) {
    //                 if (v.hidden == false) {
    //                     columVisible = true;
    //                 }
    //                 if ((v.className.includes("hiddenColumn"))) {
    //                     columVisible = false;
    //                 }
        
    //                 if ((v.className.includes("customFieldColumn"))) {
    //                     isCustomField = true;
    //                 } else {
    //                     isCustomField = false;
    //                 }
        
    //                 sWidth = v.style.width.replace('px', "");
        
    //                 let datatablerecordObj = {
    //                     custid: $(this).attr("custid") || 0,
    //                     sTitle: v.innerText || '',
    //                     sWidth: sWidth || '9',
    //                     sIndex: v.cellIndex || '',
    //                     sVisible: columVisible || false,
    //                     sCustomField: isCustomField || false,
    //                     sClass: v.className || ''
    //                 };
    //                 // tableHeaderList.push(datatablerecordObj);
    //             });
    //             // templateObject.tableheaderrecords.set(tableHeaderList);
    //             $('div.dataTables_filter input').addClass('form-control form-control-sm');

    //         }).catch(function(error){
    //             swal("Something went wrong!", "", "error");
    //         })
    //     })


    //     // templateObject.getCustomFieldData();
    // }
    // templateObject.getProcessRecords();

    // custom field displaysettings
    // templateObject.getCustomFieldData = function() {

    //     let custFields = [];
    //     let dispFields = [];
    //     let customData = {};
    //     let customFieldCount = 11;
    //     let listType = "ltProcessList";
  
    //     let reset_data = [
    //       { label: 'Name', class: 'colName', active: true },
    //       { label: 'Description', class: 'colDescription', active: true },
    //       { label: 'Daily Hours', class: 'colDailyHours', active: true },
    //       { label: 'Hourly Labour Cost', class: 'colHourlyLabourCost', active: true },
    //       { label: 'Cost of Goods Sold', class: 'colCOGS', active: true },
    //       { label: 'Expense Account', class: 'colExpense', active: true },
    //       { label: 'Hourly Overhead Cost', class: 'colHourlyOverheadCost', active: true },
    //       { label: 'Cost of Goods Sold(Overhead)', class: 'colOverCOGS', active: true },
    //       { label: 'Expense Account(Overhead)', class: 'colOverExpense', active: false },
    //       { label: 'Total Hourly Costs', class: 'colTotalHourlyCosts', active: true },
    //       { label: 'Inventory Asset Wastage', class: 'colWastage', active: true },
    //     ];
  
    //     sideBarService.getAllCustomFieldsWithQuery(listType).then(function (data) {
    //       for (let x = 0; x < data.tcustomfieldlist.length; x++) {
    //         if (data.tcustomfieldlist[x].fields.ListType == 'ltSales') {
    //           customData = {
    //             active: data.tcustomfieldlist[x].fields.Active || false,
    //             id: parseInt(data.tcustomfieldlist[x].fields.ID) || 0,
    //             custfieldlabel: data.tcustomfieldlist[x].fields.Description || "",
    //             datatype: data.tcustomfieldlist[x].fields.DataType || "",
    //             isempty: data.tcustomfieldlist[x].fields.ISEmpty || false,
    //             iscombo: data.tcustomfieldlist[x].fields.IsCombo || false,
    //             dropdown: data.tcustomfieldlist[x].fields.Dropdown || null,
    //           };
    //           custFields.push(customData);
    //         } else if (data.tcustomfieldlist[x].fields.ListType == listType) {
    //           customData = {
    //             active: data.tcustomfieldlist[x].fields.Active || false,
    //             id: parseInt(data.tcustomfieldlist[x].fields.ID) || 0,
    //             custfieldlabel: data.tcustomfieldlist[x].fields.Description || "",
    //             datatype: data.tcustomfieldlist[x].fields.DataType || "",
    //             isempty: data.tcustomfieldlist[x].fields.ISEmpty || false,
    //             iscombo: data.tcustomfieldlist[x].fields.IsCombo || false,
    //             dropdown: data.tcustomfieldlist[x].fields.Dropdown || null,
    //           };
    //           dispFields.push(customData);
    //         }
    //       }
  
    //       if (custFields.length < 3) {
    //         let remainder = 3 - custFields.length;
    //         let getRemCustomFields = parseInt(custFields.length);
    //         for (let r = 0; r < remainder; r++) {
    //           getRemCustomFields++;
    //           customData = {
    //             active: false,
    //             id: "",
    //             custfieldlabel: "Custom Field " + getRemCustomFields,
    //             datatype: "",
    //             isempty: true,
    //             iscombo: false,
    //           };
    //           // count++;
    //           custFields.push(customData);
    //         }
    //       }
  
    //       if (dispFields.length < customFieldCount) {
    //         let remainder = customFieldCount - dispFields.length;
    //         let getRemCustomFields = parseInt(dispFields.length);
    //         for (let r = 0; r < remainder; r++) {
    //           customData = {
    //             active: reset_data[getRemCustomFields].active,
    //             id: "",
    //             custfieldlabel: reset_data[getRemCustomFields].label,
    //             datatype: "",
    //             isempty: true,
    //             iscombo: false,
    //           };
    //           getRemCustomFields++;
    //           // count++;
    //           dispFields.push(customData);
    //         }
    //       }
  
    //       for (let index = 0; index < custFields.length; index++) {
    //         const element = custFields[index];
    //         dispFields.push(element);
  
    //       }
  
    //       templateObject.custfields.set(custFields);
    //       templateObject.displayfields.set(dispFields);
  
    //     })
    //   }

    
});

Template.processList.helpers ({
    datatablerecords : () => {
        return Template.instance().datatablerecords.get();
    },
    selectedInventoryAssetAccount: () => {
        return Template.instance().selectedInventoryAssetAccount.get();
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    }
    
})


Template.processList.events({
    'click .chkDatatable' : function(event){
        var columns = $('#tblProcessList th');
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
    'click .btnOpenSettings' : function(event){
        let templateObject = Template.instance();
        var columns = $('#tblProcessList th');

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
                custid: $(this).attr("custid") || 0,
                sTitle: v.innerText || '',
                sWidth: sWidth || '',
                sIndex: v.cellIndex || '',
                sVisible: columVisible || false,
                sClass: v.className || ''
            };
            tableHeaderList.push(datatablerecordObj);
        });
        templateObject.tableheaderrecords.set(tableHeaderList);
    },

    'click .saveTable' : function(event) {
        let lineItems = [];
        let organisationService = new OrganisationService();
        let listType = 'ltProcessList';

        $(".fullScreenSpin").css("display", "inline-block");
        setTimeout(function() {
            $(".fullScreenSpin").css("display", "none");
            $("#myModal2").modal('toggle')
        }, 2000)
        // $('.displaySettings').each(function(index) {
        //     var $tblrow = $(this);
        //     var fieldID = $tblrow.attr("custid") || 0;
        //     var colTitle = $tblrow.find(".divcolumn").text() || '';
        //     var colWidth = $tblrow.find(".custom-range").val() || 0;
        //     var colthClass = $tblrow.find(".divcolumn").attr("valueupdate") || '';
        //     var colHidden = false;
        //     if ($tblrow.find(".custom-control-input").is(':checked')) {
        //         colHidden = true;
        //     } else {
        //         colHidden = false;
        //     }
        //     let lineItemObj = {
        //         index: index,
        //         label: colTitle,
        //         hidden: colHidden,
        //         width: colWidth,
        //         thclass: colthClass
        //     }
    
        //     lineItems.push(lineItemObj);

        //     if(fieldID && parseInt(fieldID) != 0){
        //         objDetails1 = {
        //             type: "TCustomFieldList",
        //             fields: {
        //                 Active: colHidden,
        //                 ID: parseInt(fieldID),
        //                 Description: colTitle,
        //                 Width: colWidth
        //             },
        //         };
        //     } else {
        //         objDetails1 = {
        //             type: "TCustomFieldList",
        //             fields: {
        //                 Active: colHidden,
        //                 DataType: "ftString",
        //                 Description: colTitle,
        //                 ListType: listType,
        //                 Width: colWidth
        //             },
        //         };
        //     }

        //     organisationService.saveCustomField(objDetails1).then(function (objDetails) {
        //         $(".fullScreenSpin").css("display", "none");
        //         $('#myModal2').modal('hide');
        //       })
        //       .catch(function (err) {
        //         swal({
        //           title: "Oooops...",
        //           text: err,
        //           type: "error",
        //           showCancelButton: false,
        //           confirmButtonText: "Try Again",
        //         }).then((result) => {
        //           if (result.value) {
        //             $(".fullScreenSpin").css("display", "none");
        //           } else if (result.dismiss === "cancel") {
        //           }
        //           $('#myModal2').modal('hide');
        //         });
        //         $(".fullScreenSpin").css("display", "none");
        //         $('#myModal2').modal('hide');
        //       });
        // })
    },

     // custom field displaysettings
     'click .resetTable' : function(event) {
        let templateObject = Template.instance();
        // let custFields = templateObject.custfields.get();
        // var datable = $('#tblquotelist').DataTable();
        let reset_data = [
            { label: 'Name', class: 'colName', active: true },
            { label: 'Description', class: 'colDescription', active: true },
            { label: 'Daily Hours', class: 'colDailyHours', active: true },
            { label: 'Hourly Labour Cost', class: 'colHourlyLabourCost', active: true },
            { label: 'Cost of Goods Sold', class: 'colCOGS', active: true },
            { label: 'Expense Account', class: 'colExpense', active: true },
            { label: 'Hourly Overhead Cost', class: 'colHourlyOverheadCost', active: true },
            { label: 'Cost of Goods Sold(Overhead)', class: 'colOverCOGS', active: true },
            { label: 'Expense Account(Overhead)', class: 'colOverExpense', active: false },
            { label: 'Total Hourly Costs', class: 'colTotalHourlyCosts', active: true },
            { label: 'Inventory Asset Wastage', class: 'colWastage', active: true },
        ];
  
        $('.displaySettings').each(function(index) {
          var $tblrow = $(this);
          $tblrow.find(".divcolumn").text(reset_data[index].label);
          $tblrow.find(".custom-control-input").prop('checked', reset_data[index].active);
  
          // var title = datable.column( index+1 ).header();
          var title = $('#tblProcessList').find('th').eq(index + 1);
          $(title).html(reset_data[index].label);
  
          if (reset_data[index].active) {
            $('.' + reset_data[index].class).css('display', 'table-cell');
            $('.' + reset_data[index].class).css('padding', '.75rem');
            $('.' + reset_data[index].class).css('vertical-align', 'top');
          } else {
            $('.' + reset_data[index].class).css('display', 'none');
          }
  
        });
  
      },


      
    'click .processList .btnRefresh': function(e) {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        setTimeout(function () {
            templateObject.getProcessRecords();
            window.open('/processlist', '_self');
        }, 3000);
    },

    'click .processList #exportbtn': function() {
        $('.fullScreenSpin').css('display', 'inline-block');
        jQuery('#tblProcessList_wrapper .dt-buttons .btntabletocsv').click();
        $('.fullScreenSpin').css('display', 'none');
    },

    'click .processList .printConfirm': function() {
        playPrintAudio();
        setTimeout(function(){
        $('.fullScreenSpin').css('display', 'inline-block');
        jQuery('#tblProcessList_wrapper .dt-buttons .btntabletopdf').click();
        $('.fullScreenSpin').css('display', 'none');
    }, delayTimeAfterSound);
    },

    'click .processList #btnNewProcess': function (e) {
        FlowRouter.go('/processcard');
    },


    'click #tblProcessList tbody tr': function (e) {
        var listData = $(e.target).closest('tr').find('.colProcessId').text();
        FlowRouter.go('/processcard?id=' + listData)
    }

})
