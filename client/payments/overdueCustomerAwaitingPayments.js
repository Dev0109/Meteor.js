import {PaymentsService} from '../payments/payments-service';
import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../js/core-service';
import {EmployeeProfileService} from "../js/profile-service";
import {AccountService} from "../accounts/account-service";
import {UtilityService} from "../utility-service";
import { SideBarService } from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
let sideBarService = new SideBarService();
let utilityService = new UtilityService();
Template.overduecustomerawaitingpayments.onCreated(function () {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);

    templateObject.selectedAwaitingPayment = new ReactiveVar([]);


});

Template.overduecustomerawaitingpayments.onRendered(function () {
    // $('.fullScreenSpin').css('display', 'inline-block');
    let templateObject = Template.instance();
    let paymentService = new PaymentsService();
    const customerList = [];
    let salesOrderTable;
    var splashArray = new Array();
    const dataTableList = [];
    const tableHeaderList = [];

    var today = moment().format('DD/MM/YYYY');
    var currentDate = new Date();
    var begunDate = moment(currentDate).format("DD/MM/YYYY");
    let fromDateMonth = (currentDate.getMonth() + 1);
    let fromDateDay = currentDate.getDate();
    if ((currentDate.getMonth() + 1) < 10) {
        fromDateMonth = "0" + (currentDate.getMonth() + 1);
    }

    var url = window.location.href;
    let customerID = 0;
    if (url.indexOf("overduecustomerawaitingpayments?id=") > 0) {
        newurl = new URL(window.location.href);
        customerID = ( !isNaN(newurl.searchParams.get("id")) )? newurl.searchParams.get("id") : 0;
    }

    if (currentDate.getDate() < 10) {
        fromDateDay = "0" + currentDate.getDate();
    }
    var fromDate = fromDateDay + "/" + (fromDateMonth) + "/" + currentDate.getFullYear();

    $("#date-input,#dateTo,#dateFrom").datepicker({
        showOn: 'button',
        buttonText: 'Show Date',
        buttonImageOnly: true,
        buttonImage: '/img/imgCal2.png',
        dateFormat: 'dd/mm/yy',
        showOtherMonths: true,
        selectOtherMonths: true,
        changeMonth: true,
        changeYear: true,
        yearRange: "-90:+10",
        onChangeMonthYear: function(year, month, inst){
        // Set date to picker
        $(this).datepicker('setDate', new Date(year, inst.selectedMonth, inst.selectedDay));
        // Hide (close) the picker
        // $(this).datepicker('hide');
        // // Change ttrigger the on change function
        // $(this).trigger('change');
       }
    });

    $("#dateFrom").val(fromDate);
    $("#dateTo").val(begunDate);

    function MakeNegative() {
        $('td').each(function () {
            if ($(this).text().indexOf('-' + Currency) >= 0)
                $(this).addClass('text-danger')
        });

        $('td.colStatus').each(function(){
            if($(this).text() == "Deleted") $(this).addClass('text-deleted');
            if ($(this).text() == "Full") $(this).addClass('text-fullyPaid');
            if ($(this).text() == "Part") $(this).addClass('text-partialPaid');
            if ($(this).text() == "Rec") $(this).addClass('text-reconciled');
        });
    };

    templateObject.resetData = function (dataVal) {
        location.reload();
    }
    // $('#tblcustomerAwaitingPayment').DataTable();
    templateObject.getAllCustomerPaymentData = function () {
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

        getVS1Data('TOverdueAwaitingCustomerPayment').then(function (dataObject) {
            if (dataObject.length == 0) {
              sideBarService.getAllOverDueAwaitingCustomerPayment(prevMonth11Date,toDate, true,initialReportLoad,0).then(function (data) {
                  let lineItems = [];
                  let lineItemObj = {};
                  addVS1Data('TOverdueAwaitingCustomerPayment', JSON.stringify(data));
                  if (data.Params.IgnoreDates == true) {
                      $('#dateFrom').attr('readonly', true);
                      $('#dateTo').attr('readonly', true);
                      //FlowRouter.go('/overduecustomerawaitingpayments?ignoredate=true');
                  } else {
                    $('#dateFrom').attr('readonly', false);
                    $('#dateTo').attr('readonly', false);
                      $("#dateFrom").val(data.Params.DateFrom != '' ? moment(data.Params.DateFrom).format("DD/MM/YYYY") : data.Params.DateFrom);
                      $("#dateTo").val(data.Params.DateTo != '' ? moment(data.Params.DateTo).format("DD/MM/YYYY") : data.Params.DateTo);
                  }

                  for (let i = 0; i < data.tsaleslist.length; i++) {
                      let amount = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].TotalAmountinc) || 0.00;
                      let applied = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Payment) || 0.00;
                      // Currency+''+data.tsaleslist[i].TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
                      let balance = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Balance) || 0.00;
                      let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Balance) || 0.00;
                      let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Balance) || 0.00;
                      let totalOrginialAmount = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].TotalAmountinc) || 0.00;

                      var dueDateCal = new Date(data.tsaleslist[i].dueDate);
                      var currentDateCal = new Date();
                      let overDueDays = 0;
                      let overDueDaysText = '';
                      let overDueType = 'text-Green';

                      if (dueDateCal < currentDateCal) {
                          overDueDays = Math.round((currentDateCal-dueDateCal)/(1000*60*60*24));
                          if(overDueDays > 0){
                          if(overDueDays == 1){
                            overDueDaysText = overDueDays + ' Day';
                          }else{
                            overDueDaysText = overDueDays + ' Days';
                          }
                          if(overDueDays <= 30){
                            overDueType = 'text-Yellow';
                          }else if(overDueDays <= 60){
                            overDueType = 'text-Orange';
                          }else{
                            overDueType = 'text-deleted';
                          }
                        }
                      }

                      var dataList = {
                          id: data.tsaleslist[i].SaleId || '',
                          sortdate: data.tsaleslist[i].SaleDate != '' ? moment(data.tsaleslist[i].SaleDate).format("YYYY/MM/DD") : data.tsaleslist[i].SaleDate,
                          paymentdate: data.tsaleslist[i].SaleDate != '' ? moment(data.tsaleslist[i].SaleDate).format("DD/MM/YYYY") : data.tsaleslist[i].SaleDate,
                          customername: data.tsaleslist[i].CustomerName || '',
                          paymentamount: amount || 0.00,
                          applied: applied || 0.00,
                          balance: balance || 0.00,
                          originalamount: totalOrginialAmount || 0.00,
                          outsandingamount: totalOutstanding || 0.00,
                          // bankaccount: data.tsaleslist[i].GLAccountName || '',
                          department: data.tsaleslist[i].ClassName || '',
                          refno: data.tsaleslist[i].BORef || '',
                          paymentmethod: data.tsaleslist[i].PaymentMethodName || '',
                          notes: data.tsaleslist[i].Comments || '',
                          overduedays:overDueDaysText,
                          overduetype:overDueType,
                      };
                      //if (data.tsaleslist[i].Balance != 0) {
                        if( customerID != 0 ){
                            if (data.tsaleslist[i].Balance != 0 && data.tsaleslist[i].ClientId == customerID ) {
                                dataTableList.push(dataList);
                            }
                        }else{
                          dataTableList.push(dataList);
                        }
                    //  }

                  }
                  templateObject.datatablerecords.set(dataTableList);
                  if (templateObject.datatablerecords.get()) {

                      Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblcustomerAwaitingPayment', function (error, result) {
                          if (error) {}
                          else {
                              if (result) {
                                  for (let i = 0; i < result.customFields.length; i++) {
                                      let customcolumn = result.customFields;
                                      let columData = customcolumn[i].label;
                                      let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                                      let hiddenColumn = customcolumn[i].hidden;
                                      let columnClass = columHeaderUpdate.split('.')[1];
                                      let columnWidth = customcolumn[i].width;
                                      let columnindex = customcolumn[i].index + 1;

                                      if (hiddenColumn == true) {

                                          $("." + columnClass + "").addClass('hiddenColumn');
                                          $("." + columnClass + "").removeClass('showColumn');
                                      } else if (hiddenColumn == false) {
                                          $("." + columnClass + "").removeClass('hiddenColumn');
                                          $("." + columnClass + "").addClass('showColumn');
                                      }

                                  }
                              }

                          }
                      });

                      setTimeout(function () {
                          MakeNegative();
                      }, 100);
                  }

                  $('.fullScreenSpin').css('display', 'none');
                  setTimeout(function () {
                      //$.fn.dataTable.moment('DD/MM/YY');
                      $('#tblcustomerAwaitingPayment').DataTable({
                          columnDefs: [{
                                  "orderable": false,
                                  "targets": 0
                              }, {
                                  type: 'date',
                                  targets: 1
                              }
                          ],
                          "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                          buttons: [{
                                  extend: 'excelHtml5',
                                  text: '',
                                  download: 'open',
                                  className: "btntabletocsv hiddenColumn",
                                  filename: "Outstanding Invoices - " + moment().format(),
                                  orientation: 'portrait',
                                  exportOptions: {
                                      columns: ':visible:not(.chkBox)',
                                      format: {
                                          body: function (data, row, column) {
                                              if (data.includes("</span>")) {
                                                  var res = data.split("</span>");
                                                  data = res[1];
                                              }

                                              return column === 1 ? data.replace(/<.*?>/ig, "") : data;

                                          }
                                      }
                                  }
                              }, {
                                  extend: 'print',
                                  download: 'open',
                                  className: "btntabletopdf hiddenColumn",
                                  text: '',
                                  title: 'Supplier Payment',
                                  filename: "Outstanding Invoices - " + moment().format(),
                                  exportOptions: {
                                      columns: ':visible:not(.chkBox)',
                                      stripHtml: false
                                  }
                              }
                          ],
                          select: true,
                          destroy: true,
                          colReorder: true,
                          colReorder: {
                              fixedColumnsLeft: 1
                          },
                          // bStateSave: true,
                          // rowId: 0,
                          pageLength: initialReportDatatableLoad,
                          "bLengthChange": false,


                          // pageLength: 25,
                          // lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                          info: true,
                          responsive: true,
                          "order": [[ 2, "desc" ],[ 4, "desc" ]],
                          // "aaSorting": [[1,'desc']],
                          action: function () {
                              $('#tblcustomerAwaitingPayment').DataTable().ajax.reload();
                          },
                          "fnDrawCallback": function (oSettings) {
                            let checkurlIgnoreDate = FlowRouter.current().queryParams.ignoredate;

                              $('.paginate_button.page-item').removeClass('disabled');
                              $('#tblcustomerAwaitingPayment_ellipsis').addClass('disabled');

                              if (oSettings._iDisplayLength == -1) {
                                  if (oSettings.fnRecordsDisplay() > 150) {
                                      $('.paginate_button.page-item.previous').addClass('disabled');
                                      $('.paginate_button.page-item.next').addClass('disabled');
                                  }
                              } else {}
                              if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                                  $('.paginate_button.page-item.next').addClass('disabled');
                              }
                              $('.paginate_button.next:not(.disabled)', this.api().table().container())
                              .on('click', function () {
                                  $('.fullScreenSpin').css('display', 'inline-block');
                                  let dataLenght = oSettings._iDisplayLength;

                                  var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
                                  var dateTo = new Date($("#dateTo").datepicker("getDate"));

                                  let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
                                  let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();
                                  if(data.Params.IgnoreDates == true){
                                    sideBarService.getAllOverDueAwaitingCustomerPayment(formatDateFrom, formatDateTo, true, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (dataObjectnew) {
                                        getVS1Data('TOverdueAwaitingCustomerPayment').then(function (dataObjectold) {
                                            if (dataObjectold.length == 0) {}
                                            else {
                                                let dataOld = JSON.parse(dataObjectold[0].data);
                                                var thirdaryData = $.merge($.merge([], dataObjectnew.tsaleslist), dataOld.tsaleslist);
                                                let objCombineData = {
                                                    Params: dataOld.Params,
                                                    tsaleslist: thirdaryData
                                                }

                                                addVS1Data('TOverdueAwaitingCustomerPayment', JSON.stringify(objCombineData)).then(function (datareturn) {
                                                    templateObject.resetData(objCombineData);
                                                    $('.fullScreenSpin').css('display', 'none');
                                                }).catch(function (err) {
                                                    $('.fullScreenSpin').css('display', 'none');
                                                });

                                            }
                                        }).catch(function (err) {});

                                    }).catch(function (err) {
                                        $('.fullScreenSpin').css('display', 'none');
                                    });
                                  }else{
                                  sideBarService.getAllOverDueAwaitingCustomerPayment(formatDateFrom, formatDateTo, false, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (dataObjectnew) {
                                      getVS1Data('TOverdueAwaitingCustomerPayment').then(function (dataObjectold) {
                                          if (dataObjectold.length == 0) {}
                                          else {
                                              let dataOld = JSON.parse(dataObjectold[0].data);
                                              var thirdaryData = $.merge($.merge([], dataObjectnew.tsaleslist), dataOld.tsaleslist);
                                              let objCombineData = {
                                                  Params: dataOld.Params,
                                                  tsaleslist: thirdaryData
                                              }

                                              addVS1Data('TOverdueAwaitingCustomerPayment', JSON.stringify(objCombineData)).then(function (datareturn) {
                                                  templateObject.resetData(objCombineData);
                                                  $('.fullScreenSpin').css('display', 'none');
                                              }).catch(function (err) {
                                                  $('.fullScreenSpin').css('display', 'none');
                                              });

                                          }
                                      }).catch(function (err) {});

                                  }).catch(function (err) {
                                      $('.fullScreenSpin').css('display', 'none');
                                  });
                                }
                              });

                              setTimeout(function () {
                                  MakeNegative();
                              }, 100);
                          },
                          language: { search: "",searchPlaceholder: "Search List..." },
                          "fnInitComplete": function () {
                            let urlParametersPage = FlowRouter.current().queryParams.page;
                            //if (urlParametersPage || FlowRouter.current().queryParams.ignoredate) {
                                this.fnPageChange('last');
                            //}
                               $("<button class='btn btn-primary btnRefreshCustomerAwaiting' type='button' id='btnRefreshCustomerAwaiting' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblcustomerAwaitingPayment_filter");
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
                      }).on('column-reorder', function () {}).on('length.dt', function (e, settings, len) {
                          setTimeout(function () {
                              MakeNegative();
                          }, 100);
                      });
                      $('.fullScreenSpin').css('display', 'none');

                  }, 0);

                  var columns = $('#tblcustomerAwaitingPayment th');
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


              }).catch(function (err) {
                  // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                  $('.fullScreenSpin').css('display', 'none');
                  // Meteor._reload.reload();
              });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tsaleslist;
                let lineItems = [];
                let lineItemObj = {};
                if (data.Params.IgnoreDates == true) {
                    $('#dateFrom').attr('readonly', true);
                    $('#dateTo').attr('readonly', true);
                    //FlowRouter.go('/overduecustomerawaitingpayments?ignoredate=true');
                } else {
                  $('#dateFrom').attr('readonly', false);
                  $('#dateTo').attr('readonly', false);
                    $("#dateFrom").val(data.Params.DateFrom != '' ? moment(data.Params.DateFrom).format("DD/MM/YYYY") : data.Params.DateFrom);
                    $("#dateTo").val(data.Params.DateTo != '' ? moment(data.Params.DateTo).format("DD/MM/YYYY") : data.Params.DateTo);
                }

                for (let i = 0; i < data.tsaleslist.length; i++) {
                    let amount = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].TotalAmountinc) || 0.00;
                    let applied = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Payment) || 0.00;
                    // Currency+''+data.tsaleslist[i].TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
                    let balance = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Balance) || 0.00;
                    let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Balance) || 0.00;
                    let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Balance) || 0.00;
                    let totalOrginialAmount = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].TotalAmountinc) || 0.00;

                    var dueDateCal = new Date(data.tsaleslist[i].dueDate);
                    var currentDateCal = new Date();
                    let overDueDays = 0;
                    let overDueDaysText = '';
                    let overDueType = 'text-Green';

                    if (dueDateCal < currentDateCal) {
                        overDueDays = Math.round((currentDateCal-dueDateCal)/(1000*60*60*24));
                        if(overDueDays > 0){
                        if(overDueDays == 1){
                          overDueDaysText = overDueDays + ' Day';
                        }else{
                          overDueDaysText = overDueDays + ' Days';
                        }
                        if(overDueDays <= 30){
                          overDueType = 'text-Yellow';
                        }else if(overDueDays <= 60){
                          overDueType = 'text-Orange';
                        }else{
                          overDueType = 'text-deleted';
                        }
                      }
                    }

                    var dataList = {
                        id: data.tsaleslist[i].SaleId || '',
                        sortdate: data.tsaleslist[i].SaleDate != '' ? moment(data.tsaleslist[i].SaleDate).format("YYYY/MM/DD") : data.tsaleslist[i].SaleDate,
                        paymentdate: data.tsaleslist[i].SaleDate != '' ? moment(data.tsaleslist[i].SaleDate).format("DD/MM/YYYY") : data.tsaleslist[i].SaleDate,
                        customername: data.tsaleslist[i].CustomerName || '',
                        paymentamount: amount || 0.00,
                        applied: applied || 0.00,
                        balance: balance || 0.00,
                        originalamount: totalOrginialAmount || 0.00,
                        outsandingamount: totalOutstanding || 0.00,
                        // bankaccount: data.tsaleslist[i].GLAccountName || '',
                        department: data.tsaleslist[i].ClassName || '',
                        refno: data.tsaleslist[i].BORef || '',
                        paymentmethod: data.tsaleslist[i].PaymentMethodName || '',
                        notes: data.tsaleslist[i].Comments || '',
                        overduedays:overDueDaysText,
                        overduetype:overDueType,
                    };
                    //if (data.tsaleslist[i].Balance != 0) {
                        if( customerID != 0 ){
                            if (data.tsaleslist[i].Balance != 0 && data.tsaleslist[i].ClientId == customerID ) {
                                dataTableList.push(dataList);
                            }
                        }else{
                          dataTableList.push(dataList);
                        }
                    //}

                }
                templateObject.datatablerecords.set(dataTableList);
                if (templateObject.datatablerecords.get()) {

                    setTimeout(function () {
                        MakeNegative();
                    }, 100);
                }

                $('.fullScreenSpin').css('display', 'none');
                setTimeout(function () {
                    //$.fn.dataTable.moment('DD/MM/YY');
                    $('#tblcustomerAwaitingPayment').DataTable({
                        columnDefs: [{
                                "orderable": false,
                                "targets": 0
                            }, {
                                type: 'date',
                                targets: 1
                            }
                        ],
                        "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        buttons: [{
                                extend: 'excelHtml5',
                                text: '',
                                download: 'open',
                                className: "btntabletocsv hiddenColumn",
                                filename: "Outstanding Invoices - " + moment().format(),
                                orientation: 'portrait',
                                exportOptions: {
                                    columns: ':visible:not(.chkBox)',
                                    format: {
                                        body: function (data, row, column) {
                                            if (data.includes("</span>")) {
                                                var res = data.split("</span>");
                                                data = res[1];
                                            }

                                            return column === 1 ? data.replace(/<.*?>/ig, "") : data;

                                        }
                                    }
                                }
                            }, {
                                extend: 'print',
                                download: 'open',
                                className: "btntabletopdf hiddenColumn",
                                text: '',
                                title: 'Supplier Payment',
                                filename: "Outstanding Invoices - " + moment().format(),
                                exportOptions: {
                                    columns: ':visible:not(.chkBox)',
                                    stripHtml: false
                                }
                            }
                        ],
                        select: true,
                        destroy: true,
                        colReorder: true,
                        colReorder: {
                            fixedColumnsLeft: 1
                        },
                        // bStateSave: true,
                        // rowId: 0,
                        pageLength: initialReportDatatableLoad,
                        "bLengthChange": false,


                        // pageLength: 25,
                        // lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                        info: true,
                        responsive: true,
                        "order": [[ 2, "desc" ],[ 4, "desc" ]],
                        // "aaSorting": [[1,'desc']],
                        action: function () {
                            $('#tblcustomerAwaitingPayment').DataTable().ajax.reload();
                        },
                        "fnDrawCallback": function (oSettings) {
                          let checkurlIgnoreDate = FlowRouter.current().queryParams.ignoredate;

                            $('.paginate_button.page-item').removeClass('disabled');
                            $('#tblcustomerAwaitingPayment_ellipsis').addClass('disabled');

                            if (oSettings._iDisplayLength == -1) {
                                if (oSettings.fnRecordsDisplay() > 150) {
                                    $('.paginate_button.page-item.previous').addClass('disabled');
                                    $('.paginate_button.page-item.next').addClass('disabled');
                                }
                            } else {}
                            if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                                $('.paginate_button.page-item.next').addClass('disabled');
                            }
                            $('.paginate_button.next:not(.disabled)', this.api().table().container())
                            .on('click', function () {
                                $('.fullScreenSpin').css('display', 'inline-block');
                                let dataLenght = oSettings._iDisplayLength;

                                var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
                                var dateTo = new Date($("#dateTo").datepicker("getDate"));

                                let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
                                let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();
                                if(data.Params.IgnoreDates == true){
                                  sideBarService.getAllOverDueAwaitingCustomerPayment(formatDateFrom, formatDateTo, true, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (dataObjectnew) {
                                      getVS1Data('TOverdueAwaitingCustomerPayment').then(function (dataObjectold) {
                                          if (dataObjectold.length == 0) {}
                                          else {
                                              let dataOld = JSON.parse(dataObjectold[0].data);
                                              var thirdaryData = $.merge($.merge([], dataObjectnew.tsaleslist), dataOld.tsaleslist);
                                              let objCombineData = {
                                                  Params: dataOld.Params,
                                                  tsaleslist: thirdaryData
                                              }

                                              addVS1Data('TOverdueAwaitingCustomerPayment', JSON.stringify(objCombineData)).then(function (datareturn) {
                                                  templateObject.resetData(objCombineData);
                                                  $('.fullScreenSpin').css('display', 'none');
                                              }).catch(function (err) {
                                                  $('.fullScreenSpin').css('display', 'none');
                                              });

                                          }
                                      }).catch(function (err) {});

                                  }).catch(function (err) {
                                      $('.fullScreenSpin').css('display', 'none');
                                  });
                                }else{
                                sideBarService.getAllOverDueAwaitingCustomerPayment(formatDateFrom, formatDateTo, false, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (dataObjectnew) {
                                    getVS1Data('TOverdueAwaitingCustomerPayment').then(function (dataObjectold) {
                                        if (dataObjectold.length == 0) {}
                                        else {
                                            let dataOld = JSON.parse(dataObjectold[0].data);
                                            var thirdaryData = $.merge($.merge([], dataObjectnew.tsaleslist), dataOld.tsaleslist);
                                            let objCombineData = {
                                                Params: dataOld.Params,
                                                tsaleslist: thirdaryData
                                            }

                                            addVS1Data('TOverdueAwaitingCustomerPayment', JSON.stringify(objCombineData)).then(function (datareturn) {
                                                templateObject.resetData(objCombineData);
                                                $('.fullScreenSpin').css('display', 'none');
                                            }).catch(function (err) {
                                                $('.fullScreenSpin').css('display', 'none');
                                            });

                                        }
                                    }).catch(function (err) {});

                                }).catch(function (err) {
                                    $('.fullScreenSpin').css('display', 'none');
                                });
                              }
                            });

                            setTimeout(function () {
                                MakeNegative();
                            }, 100);
                        },
                        language: { search: "",searchPlaceholder: "Search List..." },
                        "fnInitComplete": function () {
                          let urlParametersPage = FlowRouter.current().queryParams.page;
                          //if (urlParametersPage || FlowRouter.current().queryParams.ignoredate) {
                              this.fnPageChange('last');
                          //}
                             $("<button class='btn btn-primary btnRefreshCustomerAwaiting' type='button' id='btnRefreshCustomerAwaiting' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblcustomerAwaitingPayment_filter");
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
                    }).on('column-reorder', function () {}).on('length.dt', function (e, settings, len) {
                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                    });
                    $('.fullScreenSpin').css('display', 'none');

                }, 0);

                var columns = $('#tblcustomerAwaitingPayment th');
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
        }).catch(function (err) {
            sideBarService.getAllOverDueAwaitingCustomerPayment(prevMonth11Date,toDate, true,initialReportLoad,0).then(function (data) {
                let lineItems = [];
                let lineItemObj = {};
                addVS1Data('TOverdueAwaitingCustomerPayment', JSON.stringify(data));
                if (data.Params.IgnoreDates == true) {
                    $('#dateFrom').attr('readonly', true);
                    $('#dateTo').attr('readonly', true);
                    //FlowRouter.go('/overduecustomerawaitingpayments?ignoredate=true');
                } else {
                  $('#dateFrom').attr('readonly', false);
                  $('#dateTo').attr('readonly', false);
                    $("#dateFrom").val(data.Params.DateFrom != '' ? moment(data.Params.DateFrom).format("DD/MM/YYYY") : data.Params.DateFrom);
                    $("#dateTo").val(data.Params.DateTo != '' ? moment(data.Params.DateTo).format("DD/MM/YYYY") : data.Params.DateTo);
                }

                for (let i = 0; i < data.tsaleslist.length; i++) {
                    let amount = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].TotalAmountinc) || 0.00;
                    let applied = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Payment) || 0.00;
                    // Currency+''+data.tsaleslist[i].TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
                    let balance = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Balance) || 0.00;
                    let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Balance) || 0.00;
                    let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Balance) || 0.00;
                    let totalOrginialAmount = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].TotalAmountinc) || 0.00;

                    var dueDateCal = new Date(data.tsaleslist[i].dueDate);
                    var currentDateCal = new Date();
                    let overDueDays = 0;
                    let overDueDaysText = '';
                    let overDueType = 'text-Green';

                    if (dueDateCal < currentDateCal) {
                        overDueDays = Math.round((currentDateCal-dueDateCal)/(1000*60*60*24));
                        if(overDueDays > 0){
                        if(overDueDays == 1){
                          overDueDaysText = overDueDays + ' Day';
                        }else{
                          overDueDaysText = overDueDays + ' Days';
                        }
                        if(overDueDays <= 30){
                          overDueType = 'text-Yellow';
                        }else if(overDueDays <= 60){
                          overDueType = 'text-Orange';
                        }else{
                          overDueType = 'text-deleted';
                        }
                      }
                    }

                    var dataList = {
                        id: data.tsaleslist[i].SaleId || '',
                        sortdate: data.tsaleslist[i].SaleDate != '' ? moment(data.tsaleslist[i].SaleDate).format("YYYY/MM/DD") : data.tsaleslist[i].SaleDate,
                        paymentdate: data.tsaleslist[i].SaleDate != '' ? moment(data.tsaleslist[i].SaleDate).format("DD/MM/YYYY") : data.tsaleslist[i].SaleDate,
                        customername: data.tsaleslist[i].CustomerName || '',
                        paymentamount: amount || 0.00,
                        applied: applied || 0.00,
                        balance: balance || 0.00,
                        originalamount: totalOrginialAmount || 0.00,
                        outsandingamount: totalOutstanding || 0.00,
                        // bankaccount: data.tsaleslist[i].GLAccountName || '',
                        department: data.tsaleslist[i].ClassName || '',
                        refno: data.tsaleslist[i].BORef || '',
                        paymentmethod: data.tsaleslist[i].PaymentMethodName || '',
                        notes: data.tsaleslist[i].Comments || '',
                        overduedays:overDueDaysText,
                        overduetype:overDueType,
                    };
                    //if (data.tsaleslist[i].Balance != 0) {
                        if( customerID != 0 ){
                            if (data.tsaleslist[i].Balance != 0 && data.tsaleslist[i].ClientId == customerID ) {
                                dataTableList.push(dataList);
                            }
                        }else{
                          dataTableList.push(dataList);
                        }
                    //}

                }
                templateObject.datatablerecords.set(dataTableList);
                if (templateObject.datatablerecords.get()) {

                    Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblcustomerAwaitingPayment', function (error, result) {
                        if (error) {}
                        else {
                            if (result) {
                                for (let i = 0; i < result.customFields.length; i++) {
                                    let customcolumn = result.customFields;
                                    let columData = customcolumn[i].label;
                                    let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                                    let hiddenColumn = customcolumn[i].hidden;
                                    let columnClass = columHeaderUpdate.split('.')[1];
                                    let columnWidth = customcolumn[i].width;
                                    let columnindex = customcolumn[i].index + 1;

                                    if (hiddenColumn == true) {

                                        $("." + columnClass + "").addClass('hiddenColumn');
                                        $("." + columnClass + "").removeClass('showColumn');
                                    } else if (hiddenColumn == false) {
                                        $("." + columnClass + "").removeClass('hiddenColumn');
                                        $("." + columnClass + "").addClass('showColumn');
                                    }

                                }
                            }

                        }
                    });

                    setTimeout(function () {
                        MakeNegative();
                    }, 100);
                }

                $('.fullScreenSpin').css('display', 'none');
                setTimeout(function () {
                    //$.fn.dataTable.moment('DD/MM/YY');
                    $('#tblcustomerAwaitingPayment').DataTable({
                        columnDefs: [{
                                "orderable": false,
                                "targets": 0
                            }, {
                                type: 'date',
                                targets: 1
                            }
                        ],
                        "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        buttons: [{
                                extend: 'excelHtml5',
                                text: '',
                                download: 'open',
                                className: "btntabletocsv hiddenColumn",
                                filename: "Outstanding Invoices - " + moment().format(),
                                orientation: 'portrait',
                                exportOptions: {
                                    columns: ':visible:not(.chkBox)',
                                    format: {
                                        body: function (data, row, column) {
                                            if (data.includes("</span>")) {
                                                var res = data.split("</span>");
                                                data = res[1];
                                            }

                                            return column === 1 ? data.replace(/<.*?>/ig, "") : data;

                                        }
                                    }
                                }
                            }, {
                                extend: 'print',
                                download: 'open',
                                className: "btntabletopdf hiddenColumn",
                                text: '',
                                title: 'Supplier Payment',
                                filename: "Outstanding Invoices - " + moment().format(),
                                exportOptions: {
                                    columns: ':visible:not(.chkBox)',
                                    stripHtml: false
                                }
                            }
                        ],
                        select: true,
                        destroy: true,
                        colReorder: true,
                        colReorder: {
                            fixedColumnsLeft: 1
                        },
                        // bStateSave: true,
                        // rowId: 0,
                        pageLength: initialReportDatatableLoad,
                        "bLengthChange": false,


                        // pageLength: 25,
                        // lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                        info: true,
                        responsive: true,
                        "order": [[ 2, "desc" ],[ 4, "desc" ]],
                        // "aaSorting": [[1,'desc']],
                        action: function () {
                            $('#tblcustomerAwaitingPayment').DataTable().ajax.reload();
                        },
                        "fnDrawCallback": function (oSettings) {
                          let checkurlIgnoreDate = FlowRouter.current().queryParams.ignoredate;

                            $('.paginate_button.page-item').removeClass('disabled');
                            $('#tblcustomerAwaitingPayment_ellipsis').addClass('disabled');

                            if (oSettings._iDisplayLength == -1) {
                                if (oSettings.fnRecordsDisplay() > 150) {
                                    $('.paginate_button.page-item.previous').addClass('disabled');
                                    $('.paginate_button.page-item.next').addClass('disabled');
                                }
                            } else {}
                            if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                                $('.paginate_button.page-item.next').addClass('disabled');
                            }
                            $('.paginate_button.next:not(.disabled)', this.api().table().container())
                            .on('click', function () {
                                $('.fullScreenSpin').css('display', 'inline-block');
                                let dataLenght = oSettings._iDisplayLength;

                                var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
                                var dateTo = new Date($("#dateTo").datepicker("getDate"));

                                let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
                                let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();
                                if(data.Params.IgnoreDates == true){
                                  sideBarService.getAllOverDueAwaitingCustomerPayment(formatDateFrom, formatDateTo, true, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (dataObjectnew) {
                                      getVS1Data('TOverdueAwaitingCustomerPayment').then(function (dataObjectold) {
                                          if (dataObjectold.length == 0) {}
                                          else {
                                              let dataOld = JSON.parse(dataObjectold[0].data);
                                              var thirdaryData = $.merge($.merge([], dataObjectnew.tsaleslist), dataOld.tsaleslist);
                                              let objCombineData = {
                                                  Params: dataOld.Params,
                                                  tsaleslist: thirdaryData
                                              }

                                              addVS1Data('TOverdueAwaitingCustomerPayment', JSON.stringify(objCombineData)).then(function (datareturn) {
                                                  templateObject.resetData(objCombineData);
                                                  $('.fullScreenSpin').css('display', 'none');
                                              }).catch(function (err) {
                                                  $('.fullScreenSpin').css('display', 'none');
                                              });

                                          }
                                      }).catch(function (err) {});

                                  }).catch(function (err) {
                                      $('.fullScreenSpin').css('display', 'none');
                                  });
                                }else{
                                sideBarService.getAllOverDueAwaitingCustomerPayment(formatDateFrom, formatDateTo, false, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function (dataObjectnew) {
                                    getVS1Data('TOverdueAwaitingCustomerPayment').then(function (dataObjectold) {
                                        if (dataObjectold.length == 0) {}
                                        else {
                                            let dataOld = JSON.parse(dataObjectold[0].data);
                                            var thirdaryData = $.merge($.merge([], dataObjectnew.tsaleslist), dataOld.tsaleslist);
                                            let objCombineData = {
                                                Params: dataOld.Params,
                                                tsaleslist: thirdaryData
                                            }

                                            addVS1Data('TOverdueAwaitingCustomerPayment', JSON.stringify(objCombineData)).then(function (datareturn) {
                                                templateObject.resetData(objCombineData);
                                                $('.fullScreenSpin').css('display', 'none');
                                            }).catch(function (err) {
                                                $('.fullScreenSpin').css('display', 'none');
                                            });

                                        }
                                    }).catch(function (err) {});

                                }).catch(function (err) {
                                    $('.fullScreenSpin').css('display', 'none');
                                });
                              }
                            });

                            setTimeout(function () {
                                MakeNegative();
                            }, 100);
                        },
                        language: { search: "",searchPlaceholder: "Search List..." },
                        "fnInitComplete": function () {
                          let urlParametersPage = FlowRouter.current().queryParams.page;
                          //if (urlParametersPage || FlowRouter.current().queryParams.ignoredate) {
                              this.fnPageChange('last');
                          //}
                             $("<button class='btn btn-primary btnRefreshCustomerAwaiting' type='button' id='btnRefreshCustomerAwaiting' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblcustomerAwaitingPayment_filter");
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
                    }).on('column-reorder', function () {}).on('length.dt', function (e, settings, len) {
                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                    });
                    $('.fullScreenSpin').css('display', 'none');

                }, 0);

                var columns = $('#tblcustomerAwaitingPayment th');
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

            }).catch(function (err) {
                // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                $('.fullScreenSpin').css('display', 'none');
                // Meteor._reload.reload();
            });
        });
    };

    templateObject.getAllCustomerPaymentData();

    $('#tblcustomerAwaitingPayment tbody').on('click', 'tr .colOverdueDays, tr .colPaymentDate, tr .colReceiptNo, tr .colPaymentAmount, tr .colApplied, tr .colBalance, tr .colCustomerName, tr .colPaymentId, tr .colDepartment, tr .colRefNo, tr .colPaymentMethod, tr .colNotes', function () {
        var listData = $(this).closest('tr').attr('id');
        if (listData) {
            FlowRouter.go('/invoicecard?id=' + listData);
        }
    });

    templateObject.getAllFilterAwaitingCustData = function(fromDate, toDate, ignoreDate) {
        sideBarService.getAllOverDueAwaitingCustomerPayment(fromDate, toDate, ignoreDate,initialReportLoad,0).then(function(data) {
            addVS1Data('TOverdueAwaitingCustomerPayment', JSON.stringify(data)).then(function(datareturn) {
                location.reload();
            }).catch(function(err) {
                location.reload();
            });
        }).catch(function(err) {
            $('.fullScreenSpin').css('display', 'none');
        });
    }

    let urlParametersDateFrom = FlowRouter.current().queryParams.fromDate;
    let urlParametersDateTo = FlowRouter.current().queryParams.toDate;
    let urlParametersIgnoreDate = FlowRouter.current().queryParams.ignoredate;
    if (urlParametersDateFrom) {
        if (urlParametersIgnoreDate == true) {
            $('#dateFrom').attr('readonly', true);
            $('#dateTo').attr('readonly', true);
        } else {

            $("#dateFrom").val(urlParametersDateFrom != '' ? moment(urlParametersDateFrom).format("DD/MM/YYYY") : urlParametersDateFrom);
            $("#dateTo").val(urlParametersDateTo != '' ? moment(urlParametersDateTo).format("DD/MM/YYYY") : urlParametersDateTo);
        }
    }
});

Template.overduecustomerawaitingpayments.events({

    'click .chkDatatable': function (event) {
        var columns = $('#tblcustomerAwaitingPayment th');
        let columnDataValue = $(event.target).closest("div").find(".divcolumn").text();

        $.each(columns, function (i, v) {
            let className = v.classList;
            let replaceClass = className[1];

            if (v.innerText == columnDataValue) {
                if ($(event.target).is(':checked')) {
                    $("." + replaceClass + "").css('display', 'table-cell');
                    $("." + replaceClass + "").css('padding', '.75rem');
                    $("." + replaceClass + "").css('vertical-align', 'top');
                } else {
                    $("." + replaceClass + "").css('display', 'none');
                }
            }
        });
    },
    'keyup #tblcustomerAwaitingPayment_filter input': function (event) {
          if($(event.target).val() != ''){
            $(".btnRefreshCustomerAwaiting").addClass('btnSearchAlert');
          }else{
            $(".btnRefreshCustomerAwaiting").removeClass('btnSearchAlert');
          }
          if (event.keyCode == 13) {
             $(".btnRefreshCustomerAwaiting").trigger("click");
          }
        },
    'click .btnRefreshCustomerAwaiting':function(event){
      let templateObject = Template.instance();
      let utilityService = new UtilityService();
      let tableProductList;
      const dataTableList = [];
      var splashArrayInvoiceList = new Array();
      const lineExtaSellItems = [];
      $('.fullScreenSpin').css('display', 'inline-block');
      let dataSearchName = $('#tblcustomerAwaitingPayment_filter input').val();

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

      if (dataSearchName.replace(/\s/g, '') != '') {
          sideBarService.getAllOverDueAwaitingCustomerPaymentByCustomerNameOrID(toDate,dataSearchName).then(function (data) {
              $(".btnRefreshCustomerAwaiting").removeClass('btnSearchAlert');
              let lineItems = [];
              let lineItemObj = {};
              if (data.tsaleslist.length > 0) {
                  for (let i = 0; i < data.tsaleslist.length; i++) {
                    let amount = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].TotalAmountinc) || 0.00;
                          let applied = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Payment) || 0.00;
                          // Currency+''+data.tsaleslist[i].TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
                          let balance = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Balance) || 0.00;
                          let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Balance) || 0.00;
                          let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Balance) || 0.00;
                          let totalOrginialAmount = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].TotalAmountinc) || 0.00;

                          var dueDateCal = new Date(data.tsaleslist[i].dueDate);
                          var currentDateCal = new Date();
                          let overDueDays = 0;
                          let overDueDaysText = '';
                          let overDueType = 'text-Green';

                          if (dueDateCal < currentDateCal) {
                              overDueDays = Math.round((currentDateCal-dueDateCal)/(1000*60*60*24));
                              if(overDueDays > 0){
                              if(overDueDays == 1){
                                overDueDaysText = overDueDays + ' Day';
                              }else{
                                overDueDaysText = overDueDays + ' Days';
                              }
                              if(overDueDays <= 30){
                                overDueType = 'text-Yellow';
                              }else if(overDueDays <= 60){
                                overDueType = 'text-Orange';
                              }else{
                                overDueType = 'text-deleted';
                              }
                            }
                          }

                          var dataList = {
                           id: data.tsaleslist[i].SaleId || '',
                           sortdate: data.tsaleslist[i].SaleDate != '' ? moment(data.tsaleslist[i].SaleDate).format("YYYY/MM/DD") : data.tsaleslist[i].SaleDate,
                           paymentdate: data.tsaleslist[i].SaleDate != '' ? moment(data.tsaleslist[i].SaleDate).format("DD/MM/YYYY") : data.tsaleslist[i].SaleDate,
                           customername: data.tsaleslist[i].CustomerName || '',
                           paymentamount: amount || 0.00,
                           applied: applied || 0.00,
                           balance: balance || 0.00,
                           originalamount: totalOrginialAmount || 0.00,
                           outsandingamount: totalOutstanding || 0.00,
                           department: data.tsaleslist[i].ClassName || '',
                           refno: data.tsaleslist[i].BORef || '',
                           paymentmethod: data.tsaleslist[i].PaymentMethodName || '',
                           notes: data.tsaleslist[i].Comments || '',
                           overduedays:overDueDaysText,
                           overduetype:overDueType,
                       };

                      //if(data.tinvoiceex[i].fields.Deleted == false){
                      //splashArrayInvoiceList.push(dataList);
                      dataTableList.push(dataList);
                      //}


                      //}
                  }
                  templateObject.datatablerecords.set(dataTableList);

                  let item = templateObject.datatablerecords.get();
                  $('.fullScreenSpin').css('display', 'none');
                  if (dataTableList) {
                      var datatable = $('#tblcustomerAwaitingPayment').DataTable();
                      $("#tblcustomerAwaitingPayment > tbody").empty();
                      for (let x = 0; x < item.length; x++) {
                          $("#tblcustomerAwaitingPayment > tbody").append(
                              ' <tr class="dnd-moved" id="' + item[x].id + '" style="cursor: pointer;">' +
                              '<td contenteditable="false" class="chkBox pointer" style="width:15px;"><div class="custom-control custom-checkbox chkBox pointer" style="width:15px;"><input class="custom-control-input chkBox chkPaymentCard pointer" type="checkbox" id="formCheck-' + item[x].id + '" value="' + item[x].outsandingamount + '"><label class="custom-control-label chkBox pointer" for="formCheck-' + item[x].id + '"></label></div></td>' +
                              '<td contenteditable="false" class="colSortDate hiddenColumn">' + item[x].sortdate + '</td>' +
                              '<td contenteditable="false" class="colPaymentDate" ><span style="display:none;">' + item[x].sortdate + '</span>' + item[x].paymentdate + '</td>' +
                              '<td contenteditable="false" class="colPaymentId">' + item[x].id + '</td>' +
                              '<td contenteditable="false" class="colReceiptNo">' + item[x].refno + '</td>' +
                              '<td contenteditable="false" class="colPaymentAmount" style="text-align: right!important;">' + item[x].applied + '</td>' +
                              '<td contenteditable="false" class="colApplied" style="text-align: right!important;">' + item[x].originalamount + '</td>' +
                              '<td contenteditable="false" class="colBalance" style="text-align: right!important;">' + item[x].outsandingamount + '</td>' +
                              '<td contenteditable="false" class="colCustomerName" id="colCustomerName' + item[x].id + '">' + item[x].customername + '</td>' +
                              '<td contenteditable="false" class="colDepartment">' + item[x].department + '</td>' +
                              '<td contenteditable="false" class="colRefNo hiddenColumn">' + item[x].refno + '</td>' +
                              '<td contenteditable="false" class="colPaymentMethod hiddenColumn">' + item[x].paymentmethod + '</td>' +
                              '<td contenteditable="false" class="colNotes">' + item[x].notes + '</td>' +
                              '</tr>');

                      }
                      $('.dataTables_info').html('Showing 1 to ' + data.tsaleslist.length + ' of ' + data.tsaleslist.length + ' entries');
                      setTimeout(function() {
                        makeNegativeGlobal();
                      }, 100);
                  }

              } else {
                  $('.fullScreenSpin').css('display', 'none');

                  swal({
                      title: 'Question',
                      text: "Invoice does not exist, would you like to create it?",
                      type: 'question',
                      showCancelButton: true,
                      confirmButtonText: 'Yes',
                      cancelButtonText: 'No'
                  }).then((result) => {
                      if (result.value) {
                          FlowRouter.go('/invoicecard');
                      } else if (result.dismiss === 'cancel') {
                          //$('#productListModal').modal('toggle');
                      }
                  });
              }
          }).catch(function (err) {
              $('.fullScreenSpin').css('display', 'none');
          });
      } else {

        $(".btnRefresh").trigger("click");
      }
    },
    'click .btnPaymentList': function () {
        FlowRouter.go('/customerpayment');
    },
    'click .resetTable': function (event) {
        var getcurrentCloudDetails = CloudUser.findOne({
            _id: Session.get('mycloudLogonID'),
            clouddatabaseID: Session.get('mycloudLogonDBID')
        });
        if (getcurrentCloudDetails) {
            if (getcurrentCloudDetails._id.length > 0) {
                var clientID = getcurrentCloudDetails._id;
                var clientUsername = getcurrentCloudDetails.cloudUsername;
                var clientEmail = getcurrentCloudDetails.cloudEmail;
                var checkPrefDetails = CloudPreference.findOne({
                    userid: clientID,
                    PrefName: 'tblcustomerAwaitingPayment'
                });
                if (checkPrefDetails) {
                    CloudPreference.remove({
                        _id: checkPrefDetails._id
                    }, function (err, idTag) {
                        if (err) {}
                        else {
                            Meteor._reload.reload();
                        }
                    });

                }
            }
        }
    },
    'click .saveTable': function (event) {
        let lineItems = [];
        //let datatable =$('#tblcustomerAwaitingPayment').DataTable();
        $('.columnSettings').each(function (index) {
            var $tblrow = $(this);
            var colTitle = $tblrow.find(".divcolumn").text() || '';
            var colWidth = $tblrow.find(".custom-range").val() || 0;
            var colthClass = $tblrow.find(".divcolumn").attr("valueupdate") || '';
            var colHidden = false;
            if ($tblrow.find(".custom-control-input").is(':checked')) {
                colHidden = false;
            } else {
                colHidden = true;
            }
            let lineItemObj = {
                index: index,
                label: colTitle,
                hidden: colHidden,
                width: colWidth,
                thclass: colthClass
            }

            lineItems.push(lineItemObj);
        });
        //datatable.state.save();
        var getcurrentCloudDetails = CloudUser.findOne({
            _id: Session.get('mycloudLogonID'),
            clouddatabaseID: Session.get('mycloudLogonDBID')
        });
        if (getcurrentCloudDetails) {
            if (getcurrentCloudDetails._id.length > 0) {
                var clientID = getcurrentCloudDetails._id;
                var clientUsername = getcurrentCloudDetails.cloudUsername;
                var clientEmail = getcurrentCloudDetails.cloudEmail;
                var checkPrefDetails = CloudPreference.findOne({
                    userid: clientID,
                    PrefName: 'tblcustomerAwaitingPayment'
                });
                if (checkPrefDetails) {
                    CloudPreference.update({
                        _id: checkPrefDetails._id
                    }, {
                        $set: {
                            userid: clientID,
                            username: clientUsername,
                            useremail: clientEmail,
                            PrefGroup: 'salesform',
                            PrefName: 'tblcustomerAwaitingPayment',
                            published: true,
                            customFields: lineItems,
                            updatedAt: new Date()
                        }
                    }, function (err, idTag) {
                        if (err) {
                            $('#myModal2').modal('toggle');
                        } else {
                            $('#myModal2').modal('toggle');
                        }
                    });

                } else {
                    CloudPreference.insert({
                        userid: clientID,
                        username: clientUsername,
                        useremail: clientEmail,
                        PrefGroup: 'salesform',
                        PrefName: 'tblcustomerAwaitingPayment',
                        published: true,
                        customFields: lineItems,
                        createdAt: new Date()
                    }, function (err, idTag) {
                        if (err) {
                            $('#myModal2').modal('toggle');
                        } else {
                            $('#myModal2').modal('toggle');

                        }
                    });

                }
            }
        }
        $('#myModal2').modal('toggle');
        //Meteor._reload.reload();
    },
    'blur .divcolumn': function (event) {
        let columData = $(event.target).text();

        let columnDatanIndex = $(event.target).closest("div.columnSettings").attr('id');

        var datable = $('#tblcustomerAwaitingPayment').DataTable();
        var title = datable.column(columnDatanIndex).header();
        $(title).html(columData);

    },
    'change .rngRange': function (event) {
        let range = $(event.target).val();
        // $(event.target).closest("div.divColWidth").find(".spWidth").html(range+'px');

        // let columData = $(event.target).closest("div.divColWidth").find(".spWidth").attr("value");
        let columnDataValue = $(event.target).closest("div").prev().find(".divcolumn").text();
        var datable = $('#tblcustomerAwaitingPayment th');
        $.each(datable, function (i, v) {
            if (v.innerText == columnDataValue) {
                let className = v.className;
                let replaceClass = className.replace(/ /g, ".");
                $("." + replaceClass + "").css('width', range + 'px');

            }
        });

    },
    'click .btnOpenSettings': function (event) {
        let templateObject = Template.instance();
        var columns = $('#tblcustomerAwaitingPayment th');

        const tableHeaderList = [];
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
    },
    'click #exportbtn': function () {

        $('.fullScreenSpin').css('display', 'inline-block');
        jQuery('#tblcustomerAwaitingPayment_wrapper .dt-buttons .btntabletocsv').click();
        $('.fullScreenSpin').css('display', 'none');

    },
    'click .btnRefresh': function () {

        $('.fullScreenSpin').css('display', 'inline-block');
        let templateObject = Template.instance();

        var currentBeginDate = new Date();
        var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
        let fromDateMonth = (currentBeginDate.getMonth() + 1);

        let fromDateDay = currentBeginDate.getDate();
        if ((currentBeginDate.getMonth()+1) < 10) {
            fromDateMonth = "0" + (currentBeginDate.getMonth() + 1);
        } else {
            fromDateMonth = (currentBeginDate.getMonth() + 1);
        }


        if (currentBeginDate.getDate() < 10) {
            fromDateDay = "0" + currentBeginDate.getDate();
        }
        var toDate = currentBeginDate.getFullYear() + "-" + (fromDateMonth) + "-" + (fromDateDay);
        let prevMonth11Date = (moment().subtract(reportsloadMonths, 'months')).format("YYYY-MM-DD");

        sideBarService.getAllOverDueAwaitingCustomerPayment(prevMonth11Date,toDate, true,initialReportLoad,0).then(function (data) {
            addVS1Data('TOverdueAwaitingCustomerPayment', JSON.stringify(data)).then(function (datareturn) {

            }).catch(function (err) {

            });
        }).catch(function (err) {

        });


        sideBarService.getTPaymentList(prevMonth11Date, toDate, true, initialReportLoad, 0,'').then(function(dataPaymentList) {
            addVS1Data('TPaymentList', JSON.stringify(dataPaymentList)).then(function(datareturn) {
                sideBarService.getAllTSupplierPaymentListData(prevMonth11Date, toDate, true, initialReportLoad, 0).then(function(dataSuppPay) {
                    addVS1Data('TSupplierPaymentList', JSON.stringify(dataSuppPay)).then(function(datareturn) {
                        sideBarService.getAllTCustomerPaymentListData(prevMonth11Date, toDate, true, initialReportLoad, 0).then(function(dataCustPay) {
                            addVS1Data('TCustomerPaymentList', JSON.stringify(dataCustPay)).then(function(datareturn) {
                              setTimeout(function () {
                                window.open("/overduecustomerawaitingpayments", "_self");
                              }, 2000);
                            }).catch(function(err) {
                              setTimeout(function () {
                                window.open("/overduecustomerawaitingpayments", "_self");
                              }, 2000);
                            });
                        }).catch(function(err) {
                          setTimeout(function () {
                            window.open("/overduecustomerawaitingpayments", "_self");
                          }, 2000);
                        });
                    }).catch(function(err) {
                        setTimeout(function () {
                            window.open("/overduecustomerawaitingpayments", "_self");
                         }, 2000);
                    });
                }).catch(function(err) {
                  setTimeout(function () {
                    window.open("/overduecustomerawaitingpayments", "_self");
                  }, 2000);
                });
            }).catch(function(err) {
              setTimeout(function () {
                window.open("/overduecustomerawaitingpayments", "_self");
              }, 2000);
            });
        }).catch(function(err) {
          setTimeout(function () {
            window.open("/overduecustomerawaitingpayments", "_self");
          }, 2000);

        });

    },
    'change #dateTo': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        setTimeout(function(){
        var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        var dateTo = new Date($("#dateTo").datepicker("getDate"));

        let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
        let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();

        //  templateObject.getAgedPayableReports(formatDateFrom,formatDateTo,false);
        var formatDate = dateTo.getDate() + "/" + (dateTo.getMonth() + 1) + "/" + dateTo.getFullYear();
        //templateObject.dateAsAt.set(formatDate);
        if (($("#dateFrom").val().replace(/\s/g, '') == "") && ($("#dateFrom").val().replace(/\s/g, '') == "")) {

        } else {
            templateObject.getAllFilterAwaitingCustData(formatDateFrom, formatDateTo, false);
        }
        },500);
    },
    'change #dateFrom': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        setTimeout(function(){
        var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        var dateTo = new Date($("#dateTo").datepicker("getDate"));

        let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
        let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();

        //  templateObject.getAgedPayableReports(formatDateFrom,formatDateTo,false);
        var formatDate = dateTo.getDate() + "/" + (dateTo.getMonth() + 1) + "/" + dateTo.getFullYear();
        //templateObject.dateAsAt.set(formatDate);
        if (($("#dateFrom").val().replace(/\s/g, '') == "") && ($("#dateFrom").val().replace(/\s/g, '') == "")) {

        } else {
            templateObject.getAllFilterAwaitingCustData(formatDateFrom, formatDateTo, false);
        }
        },500);
    },
    'click #today': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
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
        var toDateERPFrom = currentBeginDate.getFullYear()+ "-" +(fromDateMonth) + "-"+(fromDateDay);
        var toDateERPTo = currentBeginDate.getFullYear()+ "-" +(fromDateMonth) + "-"+(fromDateDay);

        var toDateDisplayFrom = (fromDateDay)+ "/" +(fromDateMonth) + "/"+currentBeginDate.getFullYear();
        var toDateDisplayTo = (fromDateDay)+ "/" +(fromDateMonth) + "/"+currentBeginDate.getFullYear();

        $("#dateFrom").val(toDateDisplayFrom);
        $("#dateTo").val(toDateDisplayTo);
        templateObject.getAllFilterAwaitingCustData(toDateERPFrom,toDateERPTo, false);
    },
    'click #lastweek': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
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
        var toDateERPFrom = currentBeginDate.getFullYear()+ "-" +(fromDateMonth) + "-"+(fromDateDay - 7);
        var toDateERPTo = currentBeginDate.getFullYear()+ "-" +(fromDateMonth) + "-"+(fromDateDay);

        var toDateDisplayFrom = (fromDateDay -7)+ "/" +(fromDateMonth) + "/"+currentBeginDate.getFullYear();
        var toDateDisplayTo = (fromDateDay)+ "/" +(fromDateMonth) + "/"+currentBeginDate.getFullYear();

        $("#dateFrom").val(toDateDisplayFrom);
        $("#dateTo").val(toDateDisplayTo);
        templateObject.getAllFilterAwaitingCustData(toDateERPFrom,toDateERPTo, false);
    },
    'click #lastMonth': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var currentDate = new Date();

        var prevMonthLastDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        var prevMonthFirstDate = new Date(currentDate.getFullYear() - (currentDate.getMonth() > 0 ? 0 : 1), (currentDate.getMonth() - 1 + 12) % 12, 1);

        var formatDateComponent = function(dateComponent) {
          return (dateComponent < 10 ? '0' : '') + dateComponent;
        };

        var formatDate = function(date) {
          return  formatDateComponent(date.getDate()) + '/' + formatDateComponent(date.getMonth() + 1) + '/' + date.getFullYear();
        };

        var formatDateERP = function(date) {
          return  date.getFullYear() + '-' + formatDateComponent(date.getMonth() + 1) + '-' + formatDateComponent(date.getDate());
        };


        var fromDate = formatDate(prevMonthFirstDate);
        var toDate = formatDate(prevMonthLastDate);

        $("#dateFrom").val(fromDate);
        $("#dateTo").val(toDate);

        var getLoadDate = formatDateERP(prevMonthLastDate);
        let getDateFrom = formatDateERP(prevMonthFirstDate);
        templateObject.getAllFilterAwaitingCustData(getDateFrom, getLoadDate, false);
    },
    'click #lastQuarter': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var currentDate = new Date();
        var begunDate = moment(currentDate).format("DD/MM/YYYY");

        var begunDate = moment(currentDate).format("DD/MM/YYYY");

        function getQuarter(d) {
            d = d || new Date();
            var m = Math.floor(d.getMonth() / 3) + 2;
            return m > 4 ? m - 4 : m;
        }

        var quarterAdjustment = (moment().month() % 3) + 1;
        var lastQuarterEndDate = moment().subtract({
            months: quarterAdjustment
        }).endOf('month');
        var lastQuarterStartDate = lastQuarterEndDate.clone().subtract({
            months: 2
        }).startOf('month');

        var lastQuarterStartDateFormat = moment(lastQuarterStartDate).format("DD/MM/YYYY");
        var lastQuarterEndDateFormat = moment(lastQuarterEndDate).format("DD/MM/YYYY");


        $("#dateFrom").val(lastQuarterStartDateFormat);
        $("#dateTo").val(lastQuarterEndDateFormat);

        let fromDateMonth = getQuarter(currentDate);
        var quarterMonth = getQuarter(currentDate);
        let fromDateDay = currentDate.getDate();

        var getLoadDate = moment(lastQuarterEndDate).format("YYYY-MM-DD");
        let getDateFrom = moment(lastQuarterStartDateFormat).format("YYYY-MM-DD");
        templateObject.getAllFilterAwaitingCustData(getDateFrom, getLoadDate, false);
    },
    'click #last12Months': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var currentDate = new Date();
        var begunDate = moment(currentDate).format("DD/MM/YYYY");

        let fromDateMonth = Math.floor(currentDate.getMonth() + 1);
        let fromDateDay = currentDate.getDate();
        if ((currentDate.getMonth() + 1) < 10) {
            fromDateMonth = "0" + (currentDate.getMonth() + 1);
        }
        if (currentDate.getDate() < 10) {
            fromDateDay = "0" + currentDate.getDate();
        }

        var fromDate = fromDateDay + "/" + (fromDateMonth) + "/" + Math.floor(currentDate.getFullYear() - 1);
        $("#dateFrom").val(fromDate);
        $("#dateTo").val(begunDate);

        var currentDate2 = new Date();
        if ((currentDate2.getMonth() + 1) < 10) {
            fromDateMonth2 = "0" + Math.floor(currentDate2.getMonth() + 1);
        }
        if (currentDate2.getDate() < 10) {
            fromDateDay2 = "0" + currentDate2.getDate();
        }
        var getLoadDate = moment(currentDate2).format("YYYY-MM-DD");
        let getDateFrom = Math.floor(currentDate2.getFullYear() - 1) + "-" + fromDateMonth2 + "-" + currentDate2.getDate();
        templateObject.getAllFilterAwaitingCustData(getDateFrom, getLoadDate, false);

    },
    'click #ignoreDate': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', true);
        $('#dateTo').attr('readonly', true);
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
        templateObject.getAllFilterAwaitingCustData('', toDate, true);
    },
    'click .printConfirm': function (event) {
        playPrintAudio();
        setTimeout(function(){
        let values = [];
        let basedOnTypeStorages = Object.keys(localStorage);
        basedOnTypeStorages = basedOnTypeStorages.filter((storage) => {
            let employeeId = storage.split('_')[2];
            return storage.includes('BasedOnType_') && employeeId == Session.get('mySessionEmployeeLoggedID')
        });
        let i = basedOnTypeStorages.length;
        if (i > 0) {
            while (i--) {
                values.push(localStorage.getItem(basedOnTypeStorages[i]));
            }
        }
        values.forEach(value => {
            let reportData = JSON.parse(value);
            reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
            if (reportData.BasedOnType.includes("P")) {
                if (reportData.FormID == 1) {
                    let formIds = reportData.FormIDs.split(',');
                    if (formIds.includes("54")) {
                        reportData.FormID = 54;
                        Meteor.call('sendNormalEmail', reportData);
                    }
                } else {
                    if (reportData.FormID == 54)
                        Meteor.call('sendNormalEmail', reportData);
                }
            }
        });

        $('.fullScreenSpin').css('display', 'inline-block');
        jQuery('#tblcustomerAwaitingPayment_wrapper .dt-buttons .btntabletopdf').click();
        $('.fullScreenSpin').css('display', 'none');
    }, delayTimeAfterSound);
    },
    'click .chkBoxAll': function () {
        if ($(event.target).is(':checked')) {
            $(".chkBox").prop("checked", true);
            $(".btnCustPayment").addClass('btnSearchAlert');
        } else {
            $(".chkBox").prop("checked", false);
            $(".btnCustPayment").removeClass('btnSearchAlert');
        }
    },
    'click .chkPaymentCard': function () {
        var listData = $(this).closest('tr').attr('id');
        var selectedClient = $(event.target).closest("tr").find(".colCustomerName").text();
        const templateObject = Template.instance();
        const selectedAwaitingPayment = [];
        const selectedAwaitingPayment2 = [];
        $('.chkPaymentCard:checkbox:checked').each(function () {
            var chkIdLine = $(this).closest('tr').attr('id');
            var customername = $(this).closest('.colCustomerName');
            let paymentTransObj = {
                awaitingId: chkIdLine,
                type: "inv",
                clientname: $('#colCustomerName' + chkIdLine).text()
            };
            if (selectedAwaitingPayment.length > 0) {
                // var checkClient = selectedAwaitingPayment.filter(slctdAwtngPyment => {
                //     return slctdAwtngPyment.clientname == $('#colCustomerName' + chkIdLine).text();
                // });

                // if (checkClient.length > 0) {
                selectedAwaitingPayment.push(paymentTransObj);
                // } else {
                //     swal('','You have selected multiple Customers,  a separate payment will be created for each', 'info');
                //     $(this).prop("checked", false);
                // }
            } else {
                selectedAwaitingPayment.push(paymentTransObj);
            }
        });
        Session.setPersistent('paymentsArray',JSON.stringify(selectedAwaitingPayment));
        templateObject.selectedAwaitingPayment.set(selectedAwaitingPayment);

        setTimeout(function () {
          let selectClient = templateObject.selectedAwaitingPayment.get();
          if (selectClient.length === 0) {
            $(".btnCustPayment").removeClass('btnSearchAlert');
          } else {
            $(".btnCustPayment").addClass('btnSearchAlert');
          };
        }, 100);


    },
    'click .btnCustPayment': function (e) {
        event.preventDefault();
        const templateObject = Template.instance();
        var datacomb = '';
        let allData = [];
        let allDataObj = {};
        let selectClient = templateObject.selectedAwaitingPayment.get();
        if (selectClient.length === 0) {
            window.open('/paymentcard','_self');
            //swal('Please select Customer to pay for!', '', 'info');
        } else {
            let custName = selectClient[0].clientname;
            if (selectClient.every(v => v.clientname === custName) == true) {
                var result = [];
                $.each(selectClient, function (k, v) {
                    result.push(v.awaitingId);
                });
                FlowRouter.go('/paymentcard?selectcust=' + result);

            } else {
                var final_result = [];
                var groups = {};
                var groupName = '';

                for (let x = 0; x < selectClient.length; x++) {
                    var result = [];

                    let lineItemObjlevel = {
                        ids: selectClient[x].awaitingId || '',
                        customername: selectClient[x].clientname || '',
                        description: selectClient[x].clientname || ''
                    };


                    groupName = selectClient[x].clientname;
                            if (!groups[groupName]) {
                                groups[groupName] = [];
                            }

                            groups[groupName].sort(function(a, b){
                                if (a.description == 'NA') {
                                    return 1;
                                }
                                else if (b.description == 'NA') {
                                    return -1;
                                }
                                return (a.description.toUpperCase() > b.description.toUpperCase()) ? 1 : -1;
                            });


                            groups[groupName].push(lineItemObjlevel);
                    /*
                    datacomb = selectClient.filter(client => {
                        return client.clientname == selectClient[x].clientname
                    })
                        if (datacomb.length > 0) {
                            for (let y = 0; y < datacomb.length; y++) {
                                result.push(datacomb[y].awaitingId)
                            }

                            //window.open('/paymentcard?selectcust=' + result.toString());
                            //final_result.push(result.toString())
                        }
                        */

                }
                 _.map(groups, function (datacomb, key) {

                    var result = [];

                    if (datacomb.length > 1) {

                    var resultSelect = [];

                     for (let y = 0; y < datacomb.length; y++) {

                        if(datacomb[y].customername == key){
                            resultSelect.push(datacomb[y].ids.toString())
                        }
                     }

                      allDataObj = {
                        selectCust:resultSelect.toString(),
                     }

                     allData.push(allDataObj);
                   // window.open('/paymentcard?selectcust=' + resultSelect.toString());

                    }else{
                        if(datacomb[0].customername == key){
                             allDataObj = {
                                selectCust:datacomb[0].ids.toString(),
                          }
                            allData.push(allDataObj);
                       // window.open('/paymentcard?selectcust=' + datacomb[0].ids);
                        }
                    }


                 });
                let url = '/paymentcard?selectcust=' + allData[0].selectCust
                allData.shift();
                Session.setPersistent('customerpayments', JSON.stringify(allData));
                window.open(url,'_self');
            }
        }

    },
    'click .chkBox': function () {
        var totalAmount = 0,
        selectedvalues = [];
        $('.chkBox:checkbox:checked').each(function () {
            if ($(this).prop("checked") == true) {
                selectedAmount = $(this).val().replace(/[^0-9.-]+/g, "");
                selectedvalues.push(selectedAmount);
                totalAmount += parseFloat(selectedAmount);
            } else if ($(this).prop("checked") == false) {}
        });
        $("#selectedTot").val(utilityService.modifynegativeCurrencyFormat(totalAmount));
    }

});
Template.overduecustomerawaitingpayments.helpers({
    datatablerecords: () => {
        return Template.instance().datatablerecords.get().sort(function (a, b) {
            if (a.paymentdate == 'NA') {
                return 1;
            } else if (b.paymentdate == 'NA') {
                return -1;
            }
            return (a.paymentdate.toUpperCase() > b.paymentdate.toUpperCase()) ? 1 : -1;
        });
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    salesCloudPreferenceRec: () => {
        return CloudPreference.findOne({
            userid: Session.get('mycloudLogonID'),
            PrefName: 'tblcustomerAwaitingPayment'
        });
    }
});
