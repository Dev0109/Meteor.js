import {SalesBoardService} from '../js/sales-service';
import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../js/core-service';
import {EmployeeProfileService} from "../js/profile-service";
import {AccountService} from "../accounts/account-service";
import {InvoiceService} from "../invoice/invoice-service";
import {UtilityService} from "../utility-service";
import { SideBarService } from '../js/sidebar-service';
import {OrganisationService} from '../js/organisation-service';

import '../lib/global/indexdbstorage.js';
let sideBarService = new SideBarService();
let utilityService = new UtilityService();

Template.salesorderslistpop.onCreated(()=>{
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
})

Template.salesorderslistpop.onRendered(()=>{
    const templateObject = Template.instance();

    function MakeNegative() {
        $('td').each(function(){
            if($(this).text().indexOf('-'+Currency) >= 0) $(this).addClass('text-danger')
        });

        $('td.colStatus').each(function(){
            if($(this).text() == "Deleted") $(this).addClass('text-deleted');
            if ($(this).text() == "Full") $(this).addClass('text-fullyPaid');
            if ($(this).text() == "Part") $(this).addClass('text-partialPaid');
            if ($(this).text() == "Rec") $(this).addClass('text-reconciled');
        });
    };
    templateObject.getAllSalesOrderData = function () {
        const dataTableList = [];
        const tableHeaderList = [];
        var currentBeginDate = new Date();
        var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
        let fromDateMonth = (currentBeginDate.getMonth() + 1);
        let fromDateDay = currentBeginDate.getDate();
        if ((currentBeginDate.getMonth() + 1) < 10) {
            fromDateMonth = "0" + (currentBeginDate.getMonth() + 1);
        } else {
            fromDateMonth = (currentBeginDate.getMonth() + 1);
        }

        if (currentBeginDate.getDate() < 10) {
            fromDateDay = "0" + currentBeginDate.getDate();
        }
        var toDate = currentBeginDate.getFullYear() + "-" + (fromDateMonth) + "-" + (fromDateDay);
        let prevMonth11Date = (moment().subtract(reportsloadMonths, 'months')).format("YYYY-MM-DD");

          getVS1Data('TSalesOrderList').then(function (dataObject) {
              if(dataObject.length == 0){
                  sideBarService.getAllTSalesOrderListData(prevMonth11Date,toDate, true,initialReportLoad,0).then(function (data) {
                      let lineItems = [];
                      let lineItemObj = {};
                      addVS1Data('TSalesOrderList',JSON.stringify(data));

                      for(let i=0; i<data.tsalesorderlist.length; i++){
                          let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.tsalesorderlist[i].TotalAmount)|| 0.00;
                          let totalTax = utilityService.modifynegativeCurrencyFormat(data.tsalesorderlist[i].TotalTax) || 0.00;
                          // Currency+''+data.tinvoice[i].TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
                          let totalAmount = utilityService.modifynegativeCurrencyFormat(data.tsalesorderlist[i].TotalAmountInc)|| 0.00;
                          let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tsalesorderlist[i].Payment)|| 0.00;
                          let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tsalesorderlist[i].Balance)|| 0.00;
                          let salestatus = data.tsalesorderlist[i].QuoteStatus || '';
                          if(data.tsalesorderlist[i].Deleted == true){
                            salestatus = "Deleted";
                          }else if(data.tsalesorderlist[i].CustomerName == ''){
                            salestatus = "Deleted";
                          };
                          var dataList = {
                              id: data.tsalesorderlist[i].SaleID || '',
                              employee:data.tsalesorderlist[i].EmployeeName || '',
                              sortdate: data.tsalesorderlist[i].SaleDate !=''? moment(data.tsalesorderlist[i].SaleDate).format("YYYY/MM/DD"): data.tsalesorderlist[i].SaleDate,
                              saledate: data.tsalesorderlist[i].SaleDate !=''? moment(data.tsalesorderlist[i].SaleDate).format("DD/MM/YYYY"): data.tsalesorderlist[i].SaleDate,
                              duedate: data.tsalesorderlist[i].DueDate !=''? moment(data.tsalesorderlist[i].DueDate).format("DD/MM/YYYY"): data.tsalesorderlist[i].DueDate,
                              customername: data.tsalesorderlist[i].CustomerName || '',
                              totalamountex: totalAmountEx || 0.00,
                              totaltax: totalTax || 0.00,
                              totalamount: totalAmount || 0.00,
                              totalpaid: totalPaid || 0.00,
                              totaloustanding: totalOutstanding || 0.00,
                              salestatus: salestatus || '',
                              custfield1: data.tsalesorderlist[i].SaleCustField1 || '',
                              custfield2: data.tsalesorderlist[i].SaleCustField2 || '',
                              custfield3: data.tsalesorderlist[i].SaleCustField3 || '',
                              comments: data.tsalesorderlist[i].Comments || '',
                              isConverted: data.tsalesorderlist[i].Converted
                          };

                          //if(data.tsalesorderex[i].fields.Deleted == false && data.tsalesorderex[i].fields.CustomerName.replace(/\s/g, '') != ''){
                              dataTableList.push(dataList);
                          //}

                          //}
                      }

                      templateObject.datatablerecords.set(dataTableList);

                      if(templateObject.datatablerecords.get()){


                          setTimeout(function () {
                              MakeNegative();
                          }, 100);
                      }

                      $('.fullScreenSpin').css('display','none');
                      setTimeout(function () {
                          $('#tblSalesOrderlist').DataTable({
                              columnDefs: [
                                  {type: 'date', targets: 0}
                              ],
                              select: true,
                              destroy: true,
                              colReorder: true,
                              "sDom": "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                              buttons: [
                                  {
                                      extend: 'excelHtml5',
                                      text: '',
                                      download: 'open',
                                      className: "btntabletocsv hiddenColumn",
                                      filename: "Sales Order List - "+ moment().format(),
                                      orientation:'portrait',
                                      exportOptions: {
                                          columns: ':visible',
                                          format: {
                                              body: function ( data, row, column ) {
                                                  if(data.includes("</span>")){
                                                      var res = data.split("</span>");
                                                      data = res[1];
                                                  }

                                                  return column === 1 ? data.replace(/<.*?>/ig, ""): data;

                                              }
                                          }
                                      }
                                  },{
                                      extend: 'print',
                                      download: 'open',
                                      className: "btntabletopdf hiddenColumn",
                                      text: '',
                                      title: 'Sales Order List',
                                      filename: "Sales Order List - "+ moment().format(),
                                      exportOptions: {
                                          columns: ':visible',
                                          stripHtml: false
                                      }
                                  }],
                              //bStateSave: true,
                              //rowId: 0,
                              pageLength: initialDatatableLoad,
                              "bLengthChange": false,
                              info: true,
                              "order": [[ 0, "desc" ],[ 2, "desc" ]],
                              responsive: true,
                              action: function () {
                                  $('#tblSalesOrderlist').DataTable().ajax.reload();
                              },
                              "fnDrawCallback": function (oSettings) {
                                let checkurlIgnoreDate = FlowRouter.current().queryParams.ignoredate;

                                $('.paginate_button.page-item').removeClass('disabled');
                                $('#tblquotelist_ellipsis').addClass('disabled');

                                if(oSettings._iDisplayLength == -1){
                                  if(oSettings.fnRecordsDisplay() > 150){
                                    $('.paginate_button.page-item.previous').addClass('disabled');
                                    $('.paginate_button.page-item.next').addClass('disabled');
                                  }
                                }else{

                                }
                                if(oSettings.fnRecordsDisplay() < initialDatatableLoad){
                                    $('.paginate_button.page-item.next').addClass('disabled');
                                }

                                $('.paginate_button.next:not(.disabled)', this.api().table().container())
                                 .on('click', function(){
                                   $('.fullScreenSpin').css('display','inline-block');
                                   let dataLenght = oSettings._iDisplayLength;
                                   var dateFrom = new Date();
                                   var dateTo = new Date();

                                   let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
                                   let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();
                                     sideBarService.getAllTSalesOrderListData(formatDateFrom, formatDateTo, true, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
                                       getVS1Data('TSalesOrderList').then(function (dataObjectold) {
                                         if(dataObjectold.length == 0){

                                         }else{
                                           let dataOld = JSON.parse(dataObjectold[0].data);

                                           var thirdaryData = $.merge($.merge([], dataObjectnew.tsalesorderlist), dataOld.tsalesorderlist);
                                           let objCombineData = {
                                             Params: dataOld.Params,
                                             tsalesorderlist:thirdaryData
                                           }


                                             addVS1Data('TSalesOrderList',JSON.stringify(objCombineData)).then(function (datareturn) {
                                            //    templateObject.resetData(objCombineData);
                                            templateObject.getAllSalesOrderData();
                                             $('.fullScreenSpin').css('display','none');
                                             }).catch(function (err) {
                                             $('.fullScreenSpin').css('display','none');
                                             });

                                         }
                                        }).catch(function (err) {

                                        });

                                     }).catch(function(err) {
                                       $('.fullScreenSpin').css('display','none');
                                     });


                                 });

                                  setTimeout(function () {
                                      MakeNegative();
                                  }, 100);
                              },
                              "fnInitComplete": function () {
                                this.fnPageChange('last');
                                if(data.Params.Search.replace(/\s/g, "") == ""){
                                  $("<button class='btn btn-danger btnHideDeleted' type='button' id='btnHideDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='far fa-check-circle' style='margin-right: 5px'></i>Hide Deleted</button>").insertAfter("#tblSalesOrderlist_filter");
                                }else{
                                  $("<button class='btn btn-primary btnViewDeleted' type='button' id='btnViewDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fa fa-trash' style='margin-right: 5px'></i>View Deleted</button>").insertAfter("#tblSalesOrderlist_filter");
                                };
                               $("<button class='btn btn-primary btnRefreshSOList' type='button' id='btnRefreshSOList' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblSalesOrderlist_filter");
                               $('.myvarFilterForm').appendTo(".colDateFilter");
                           },
                           "fnInfoCallback": function (oSettings, iStart, iEnd, iMax, iTotal, sPre) {
                             let countTableData = data.Params.Count || 0; //get count from API data

                               return 'Showing '+ iStart + " to " + iEnd + " of " + countTableData;
                           }

                          }).on('page', function () {
                              setTimeout(function () {
                                  MakeNegative();
                              }, 100);
                              let draftRecord = templateObject.datatablerecords.get();
                              templateObject.datatablerecords.set(draftRecord);
                          }).on('column-reorder', function () {

                          }).on( 'length.dt', function ( e, settings, len ) {
                              setTimeout(function () {
                                  MakeNegative();
                              }, 100);
                          });

                          // $('#tblSalesOrderlist').DataTable().column( 0 ).visible( true );
                          $('.fullScreenSpin').css('display','none');

                      }, 0);

                      var columns = $('#tblSalesOrderlist th');
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
                              sIndex: v.cellIndex || 0,
                              sVisible: columVisible || false,
                              sClass: v.className || ''
                          };
                          tableHeaderList.push(datatablerecordObj);
                      });
                      templateObject.tableheaderrecords.set(tableHeaderList);
                      $('div.dataTables_filter input').addClass('form-control form-control-sm');
                    //   $('#tblSalesOrderlist tbody').on( 'click', 'tr', function () {
                    //       var listData = $(this).closest('tr').attr('id');
                    //       var checkDeleted = $(this).closest('tr').find('.colStatus').text() || '';
                    //       if(listData){
                    //         if(checkDeleted == "Deleted"){
                    //           swal('You Cannot View This Transaction', 'Because It Has Been Deleted', 'info');
                    //         }else{
                    //           FlowRouter.go('/salesordercard?id=' + listData);
                    //         }
                    //       }
                    //   });

                  }).catch(function (err) {
                      // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                      $('.fullScreenSpin').css('display','none');
                      // Meteor._reload.reload();
                  });
                //   templateObject.getCustomFieldData();
              }else{
                  let data = JSON.parse(dataObject[0].data);
                  let useData = data.tsalesorderlist;
                  let lineItems = [];
                  let lineItemObj = {};

                  for(let i=0; i<data.tsalesorderlist.length; i++){
                      let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.tsalesorderlist[i].TotalAmount)|| 0.00;
                      let totalTax = utilityService.modifynegativeCurrencyFormat(data.tsalesorderlist[i].TotalTax) || 0.00;
                      // Currency+''+data.tinvoice[i].TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
                      let totalAmount = utilityService.modifynegativeCurrencyFormat(data.tsalesorderlist[i].TotalAmountInc)|| 0.00;
                      let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tsalesorderlist[i].Payment)|| 0.00;
                      let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tsalesorderlist[i].Balance)|| 0.00;
                      let salestatus = data.tsalesorderlist[i].QuoteStatus || '';
                      if(data.tsalesorderlist[i].Deleted == true){
                        salestatus = "Deleted";
                      }else if(data.tsalesorderlist[i].CustomerName == ''){
                        salestatus = "Deleted";
                      };
                      var dataList = {
                          id: data.tsalesorderlist[i].SaleID || '',
                          employee:data.tsalesorderlist[i].EmployeeName || '',
                          sortdate: data.tsalesorderlist[i].SaleDate !=''? moment(data.tsalesorderlist[i].SaleDate).format("YYYY/MM/DD"): data.tsalesorderlist[i].SaleDate,
                          saledate: data.tsalesorderlist[i].SaleDate !=''? moment(data.tsalesorderlist[i].SaleDate).format("DD/MM/YYYY"): data.tsalesorderlist[i].SaleDate,
                          duedate: data.tsalesorderlist[i].DueDate !=''? moment(data.tsalesorderlist[i].DueDate).format("DD/MM/YYYY"): data.tsalesorderlist[i].DueDate,
                          customername: data.tsalesorderlist[i].CustomerName || '',
                          totalamountex: totalAmountEx || 0.00,
                          totaltax: totalTax || 0.00,
                          totalamount: totalAmount || 0.00,
                          totalpaid: totalPaid || 0.00,
                          totaloustanding: totalOutstanding || 0.00,
                          salestatus: salestatus || '',
                          custfield1: data.tsalesorderlist[i].SaleCustField1 || '',
                          custfield2: data.tsalesorderlist[i].SaleCustField2 || '',
                          custfield3: data.tsalesorderlist[i].SaleCustField3 || '',
                          comments: data.tsalesorderlist[i].Comments || '',
                          isConverted: data.tsalesorderlist[i].Converted
                      };

                      //if(data.tsalesorderex[i].fields.Deleted == false && data.tsalesorderex[i].fields.CustomerName.replace(/\s/g, '') != ''){
                          dataTableList.push(dataList);
                      //}

                      //}
                  }

                  templateObject.datatablerecords.set(dataTableList);

                  if(templateObject.datatablerecords.get()){

                      setTimeout(function () {
                          MakeNegative();
                      }, 100);
                  }

                  $('.fullScreenSpin').css('display','none');
                  setTimeout(function () {
                      $('#tblSalesOrderlist').DataTable({
                          columnDefs: [
                              {type: 'date', targets: 0}
                          ],
                          select: true,
                          destroy: true,
                          colReorder: true,
                          "sDom": "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                          buttons: [
                              {
                                  extend: 'excelHtml5',
                                  text: '',
                                  download: 'open',
                                  className: "btntabletocsv hiddenColumn",
                                  filename: "Sales Order List - "+ moment().format(),
                                  orientation:'portrait',
                                  exportOptions: {
                                      columns: ':visible',
                                      format: {
                                          body: function ( data, row, column ) {
                                              if(data.includes("</span>")){
                                                  var res = data.split("</span>");
                                                  data = res[1];
                                              }

                                              return column === 1 ? data.replace(/<.*?>/ig, ""): data;

                                          }
                                      }
                                  }
                              },{
                                  extend: 'print',
                                  download: 'open',
                                  className: "btntabletopdf hiddenColumn",
                                  text: '',
                                  title: 'Sales Order List',
                                  filename: "Sales Order List - "+ moment().format(),
                                  exportOptions: {
                                      columns: ':visible',
                                      stripHtml: false
                                  }
                              }],
                          //bStateSave: true,
                          //rowId: 0,
                          pageLength: initialDatatableLoad,
                          "bLengthChange": false,
                          info: true,
                          "order": [[ 0, "desc" ],[ 2, "desc" ]],
                          responsive: true,
                          action: function () {
                              $('#tblSalesOrderlist').DataTable().ajax.reload();
                          },
                          "fnDrawCallback": function (oSettings) {
                            let checkurlIgnoreDate = FlowRouter.current().queryParams.ignoredate;

                            $('.paginate_button.page-item').removeClass('disabled');
                            $('#tblquotelist_ellipsis').addClass('disabled');


                            if(oSettings._iDisplayLength == -1){
                              if(oSettings.fnRecordsDisplay() > 150){
                                $('.paginate_button.page-item.previous').addClass('disabled');
                                $('.paginate_button.page-item.next').addClass('disabled');
                              }
                            }else{

                            }
                            if(oSettings.fnRecordsDisplay() < initialDatatableLoad){
                                $('.paginate_button.page-item.next').addClass('disabled');
                            }

                            $('.paginate_button.next:not(.disabled)', this.api().table().container())
                             .on('click', function(){
                               $('.fullScreenSpin').css('display','inline-block');
                               let dataLenght = oSettings._iDisplayLength;
                               var dateFrom = new Date();
                               var dateTo = new Date();

                               let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
                               let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();
                                 sideBarService.getAllTSalesOrderListData(formatDateFrom, formatDateTo, true, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
                                   getVS1Data('TSalesOrderList').then(function (dataObjectold) {
                                     if(dataObjectold.length == 0){

                                     }else{
                                       let dataOld = JSON.parse(dataObjectold[0].data);

                                       var thirdaryData = $.merge($.merge([], dataObjectnew.tsalesorderlist), dataOld.tsalesorderlist);
                                       let objCombineData = {
                                         Params: dataOld.Params,
                                         tsalesorderlist:thirdaryData
                                       }


                                         addVS1Data('TSalesOrderList',JSON.stringify(objCombineData)).then(function (datareturn) {
                                        //    templateObject.resetData(objCombineData);
                                            templateObject.getAllSalesOrderData()
                                         $('.fullScreenSpin').css('display','none');
                                         }).catch(function (err) {
                                         $('.fullScreenSpin').css('display','none');
                                         });

                                     }
                                    }).catch(function (err) {

                                    });

                                 }).catch(function(err) {
                                   $('.fullScreenSpin').css('display','none');
                                 });


                             });

                              setTimeout(function () {
                                  MakeNegative();
                              }, 100);
                          },
                          "fnInitComplete": function () {
                            this.fnPageChange('last');
                            if(data.Params.Search.replace(/\s/g, "") == ""){
                              $("<button class='btn btn-danger btnHideDeleted' type='button' id='btnHideDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='far fa-check-circle' style='margin-right: 5px'></i>Hide Deleted</button>").insertAfter("#tblSalesOrderlist_filter");
                            }else{
                              $("<button class='btn btn-primary btnViewDeleted' type='button' id='btnViewDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fa fa-trash' style='margin-right: 5px'></i>View Deleted</button>").insertAfter("#tblSalesOrderlist_filter");
                            };
                           $("<button class='btn btn-primary btnRefreshSOList' type='button' id='btnRefreshSOList' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblSalesOrderlist_filter");
                           $('.myvarFilterForm').appendTo(".colDateFilter");
                       },
                       "fnInfoCallback": function (oSettings, iStart, iEnd, iMax, iTotal, sPre) {
                         let countTableData = data.Params.Count || 0; //get count from API data

                           return 'Showing '+ iStart + " to " + iEnd + " of " + countTableData;
                       }

                      }).on('page', function () {
                          setTimeout(function () {
                              MakeNegative();
                          }, 100);
                          let draftRecord = templateObject.datatablerecords.get();
                          templateObject.datatablerecords.set(draftRecord);
                      }).on('column-reorder', function () {

                      }).on( 'length.dt', function ( e, settings, len ) {
                          setTimeout(function () {
                              MakeNegative();
                          }, 100);
                      });

                      // $('#tblSalesOrderlist').DataTable().column( 0 ).visible( true );
                      $('.fullScreenSpin').css('display','none');

                  }, 0);

                  var columns = $('#tblSalesOrderlist th');
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
                          sIndex: v.cellIndex || 0,
                          sVisible: columVisible || false,
                          sClass: v.className || ''
                      };
                      tableHeaderList.push(datatablerecordObj);
                  });

                  templateObject.tableheaderrecords.set(tableHeaderList);
                  $('div.dataTables_filter input').addClass('form-control form-control-sm');
                //   $('#tblSalesOrderlist tbody').on( 'click', 'tr', function () {
                //       var listData = $(this).closest('tr').attr('id');
                //       var checkDeleted = $(this).closest('tr').find('.colStatus').text() || '';
                //       if(listData){
                //         if(checkDeleted == "Deleted"){
                //           swal('You Cannot View This Transaction', 'Because It Has Been Deleted', 'info');
                //         }else{
                //           FlowRouter.go('/salesordercard?id=' + listData);
                //         }
                //       }
                //   });

                //   templateObject.getCustomFieldData();

              }
          }).catch(function (err) {
            sideBarService.getAllTSalesOrderListData(prevMonth11Date,toDate, true,initialReportLoad,0).then(function (data) {
                let lineItems = [];
                let lineItemObj = {};
                addVS1Data('TSalesOrderList',JSON.stringify(data));
                if (data.Params.IgnoreDates == true) {
                    $('#dateFrom').attr('readonly', true);
                    $('#dateTo').attr('readonly', true);
                } else {
                  $('#dateFrom').attr('readonly', false);
                  $('#dateTo').attr('readonly', false);
                    $("#dateFrom").val(data.Params.DateFrom != '' ? moment(data.Params.DateFrom).format("DD/MM/YYYY") : data.Params.DateFrom);
                    $("#dateTo").val(data.Params.DateTo != '' ? moment(data.Params.DateTo).format("DD/MM/YYYY") : data.Params.DateTo);
                }
                for(let i=0; i<data.tsalesorderlist.length; i++){
                    let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.tsalesorderlist[i].TotalAmount)|| 0.00;
                    let totalTax = utilityService.modifynegativeCurrencyFormat(data.tsalesorderlist[i].TotalTax) || 0.00;
                    // Currency+''+data.tinvoice[i].TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
                    let totalAmount = utilityService.modifynegativeCurrencyFormat(data.tsalesorderlist[i].TotalAmountInc)|| 0.00;
                    let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tsalesorderlist[i].Payment)|| 0.00;
                    let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tsalesorderlist[i].Balance)|| 0.00;
                    let salestatus = data.tsalesorderlist[i].QuoteStatus || '';
                    if(data.tsalesorderlist[i].Deleted == true){
                      salestatus = "Deleted";
                    }else if(data.tsalesorderlist[i].CustomerName == ''){
                      salestatus = "Deleted";
                    };
                    var dataList = {
                        id: data.tsalesorderlist[i].SaleID || '',
                        employee:data.tsalesorderlist[i].EmployeeName || '',
                        sortdate: data.tsalesorderlist[i].SaleDate !=''? moment(data.tsalesorderlist[i].SaleDate).format("YYYY/MM/DD"): data.tsalesorderlist[i].SaleDate,
                        saledate: data.tsalesorderlist[i].SaleDate !=''? moment(data.tsalesorderlist[i].SaleDate).format("DD/MM/YYYY"): data.tsalesorderlist[i].SaleDate,
                        duedate: data.tsalesorderlist[i].DueDate !=''? moment(data.tsalesorderlist[i].DueDate).format("DD/MM/YYYY"): data.tsalesorderlist[i].DueDate,
                        customername: data.tsalesorderlist[i].CustomerName || '',
                        totalamountex: totalAmountEx || 0.00,
                        totaltax: totalTax || 0.00,
                        totalamount: totalAmount || 0.00,
                        totalpaid: totalPaid || 0.00,
                        totaloustanding: totalOutstanding || 0.00,
                        salestatus: salestatus || '',
                        custfield1: data.tsalesorderlist[i].SaleCustField1 || '',
                        custfield2: data.tsalesorderlist[i].SaleCustField2 || '',
                        custfield3: data.tsalesorderlist[i].SaleCustField3|| '',
                        comments: data.tsalesorderlist[i].Comments || '',
                        isConverted: data.tsalesorderlist[i].Converted
                    };

                    //if(data.tsalesorderex[i].fields.Deleted == false && data.tsalesorderex[i].fields.CustomerName.replace(/\s/g, '') != ''){
                        dataTableList.push(dataList);
                    //}

                    //}
                }
                templateObject.datatablerecords.set(dataTableList);

                if(templateObject.datatablerecords.get()){

                    setTimeout(function () {
                        MakeNegative();
                    }, 100);
                }

                $('.fullScreenSpin').css('display','none');
                setTimeout(function () {
                    $('#tblSalesOrderlist').DataTable({
                        columnDefs: [
                            {type: 'date', targets: 0}
                        ],
                        select: true,
                        destroy: true,
                        colReorder: true,
                        "sDom": "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        buttons: [
                            {
                                extend: 'excelHtml5',
                                text: '',
                                download: 'open',
                                className: "btntabletocsv hiddenColumn",
                                filename: "Sales Order List - "+ moment().format(),
                                orientation:'portrait',
                                exportOptions: {
                                    columns: ':visible',
                                    format: {
                                        body: function ( data, row, column ) {
                                            if(data.includes("</span>")){
                                                var res = data.split("</span>");
                                                data = res[1];
                                            }

                                            return column === 1 ? data.replace(/<.*?>/ig, ""): data;

                                        }
                                    }
                                }
                            },{
                                extend: 'print',
                                download: 'open',
                                className: "btntabletopdf hiddenColumn",
                                text: '',
                                title: 'Sales Order List',
                                filename: "Sales Order List - "+ moment().format(),
                                exportOptions: {
                                    columns: ':visible',
                                    stripHtml: false
                                }
                            }],
                        //bStateSave: true,
                        //rowId: 0,
                        pageLength: initialDatatableLoad,
                        "bLengthChange": false,
                        info: true,
                        "order": [[ 0, "desc" ],[ 2, "desc" ]],
                        responsive: true,
                        action: function () {
                            $('#tblSalesOrderlist').DataTable().ajax.reload();
                        },
                        "fnDrawCallback": function (oSettings) {
                          let checkurlIgnoreDate = FlowRouter.current().queryParams.ignoredate;

                          $('.paginate_button.page-item').removeClass('disabled');
                          $('#tblquotelist_ellipsis').addClass('disabled');

                          if(oSettings._iDisplayLength == -1){
                            if(oSettings.fnRecordsDisplay() > 150){
                              $('.paginate_button.page-item.previous').addClass('disabled');
                              $('.paginate_button.page-item.next').addClass('disabled');
                            }
                          }else{

                          }
                          if(oSettings.fnRecordsDisplay() < initialDatatableLoad){
                              $('.paginate_button.page-item.next').addClass('disabled');
                          }

                          $('.paginate_button.next:not(.disabled)', this.api().table().container())
                           .on('click', function(){
                             $('.fullScreenSpin').css('display','inline-block');
                             let dataLenght = oSettings._iDisplayLength;
                             var dateFrom = new Date();
                             var dateTo = new Date();

                             let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
                             let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();
                               sideBarService.getAllTSalesOrderListData(formatDateFrom, formatDateTo, true, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
                                 getVS1Data('TSalesOrderList').then(function (dataObjectold) {
                                   if(dataObjectold.length == 0){

                                   }else{
                                     let dataOld = JSON.parse(dataObjectold[0].data);

                                     var thirdaryData = $.merge($.merge([], dataObjectnew.tsalesorderlist), dataOld.tsalesorderlist);
                                     let objCombineData = {
                                       Params: dataOld.Params,
                                       tsalesorderlist:thirdaryData
                                     }


                                       addVS1Data('TSalesOrderList',JSON.stringify(objCombineData)).then(function (datareturn) {
                                        //  templateObject.resetData(objCombineData);
                                        templateObject.getAllSalesOrderData()
                                       $('.fullScreenSpin').css('display','none');
                                       }).catch(function (err) {
                                       $('.fullScreenSpin').css('display','none');
                                       });

                                   }
                                  }).catch(function (err) {

                                  });

                               }).catch(function(err) {
                                 $('.fullScreenSpin').css('display','none');
                               });


                           });

                            setTimeout(function () {
                                MakeNegative();
                            }, 100);
                        },
                        "fnInitComplete": function () {
                          this.fnPageChange('last');
                          if(data.Params.Search.replace(/\s/g, "") == ""){
                            $("<button class='btn btn-danger btnHideDeleted' type='button' id='btnHideDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='far fa-check-circle' style='margin-right: 5px'></i>Hide Deleted</button>").insertAfter("#tblSalesOrderlist_filter");
                          }else{
                            $("<button class='btn btn-primary btnViewDeleted' type='button' id='btnViewDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fa fa-trash' style='margin-right: 5px'></i>View Deleted</button>").insertAfter("#tblSalesOrderlist_filter");
                          };
                         $("<button class='btn btn-primary btnRefreshSOList' type='button' id='btnRefreshSOList' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblSalesOrderlist_filter");
                         $('.myvarFilterForm').appendTo(".colDateFilter");
                     },
                     "fnInfoCallback": function (oSettings, iStart, iEnd, iMax, iTotal, sPre) {
                       let countTableData = data.Params.Count || 0; //get count from API data

                         return 'Showing '+ iStart + " to " + iEnd + " of " + countTableData;
                     }

                    }).on('page', function () {
                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                        let draftRecord = templateObject.datatablerecords.get();
                        templateObject.datatablerecords.set(draftRecord);
                    }).on('column-reorder', function () {

                    }).on( 'length.dt', function ( e, settings, len ) {
                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                    });

                    // $('#tblSalesOrderlist').DataTable().column( 0 ).visible( true );
                    $('.fullScreenSpin').css('display','none');

                }, 0);

                var columns = $('#tblSalesOrderlist th');
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
                        sIndex: v.cellIndex || 0,
                        sVisible: columVisible || false,
                        sClass: v.className || ''
                    };
                    tableHeaderList.push(datatablerecordObj);
                });
                templateObject.tableheaderrecords.set(tableHeaderList);
                $('div.dataTables_filter input').addClass('form-control form-control-sm');
                // $('#tblSalesOrderlist tbody').on( 'click', 'tr', function () {
                //     var listData = $(this).closest('tr').attr('id');
                //     var checkDeleted = $(this).closest('tr').find('.colStatus').text() || '';
                //     if(listData){
                //       if(checkDeleted == "Deleted"){
                //         swal('You Cannot View This Transaction', 'Because It Has Been Deleted', 'info');
                //       }else{
                //         FlowRouter.go('/salesordercard?id=' + listData);
                //       }
                //     }
                // });
                // templateObject.getCustomFieldData();
            }).catch(function (err) {
                // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                $('.fullScreenSpin').css('display','none');
                // Meteor._reload.reload();
            });
          });

    }

    templateObject.getAllSalesOrderData();

    templateObject.resetData = function (dataVal) {
        if(FlowRouter.current().queryParams.converted){
          if(FlowRouter.current().queryParams.converted === true) {
            location.reload();
          }else{
            location.reload();
          }
        }else {
          location.reload();
        }
      }

})

Template.salesorderslistpop.events({

})

Template.salesorderslistpop.helpers({
    datatablerecords: () => {
        return Template.instance().datatablerecords.get()
    },

    tableheaderrecords:()=> {
        return Template.instance().tableheaderrecords.get()
    }
})
