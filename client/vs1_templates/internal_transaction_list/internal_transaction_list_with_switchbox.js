import {ContactService} from "../../contacts/contact-service";
import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../../js/core-service';
import {UtilityService} from "../../utility-service";
import XLSX from 'xlsx';
import { SideBarService } from '../../js/sidebar-service';
import {ProductService} from '../../product/product-service';
import '../../lib/global/indexdbstorage.js';
import TableHandler from '../../js/Table/TableHandler';
let sideBarService = new SideBarService();
let utilityService = new UtilityService();
let contactService = new ContactService();
let productService = new ProductService();
// Template.internal_transaction_list_with_switchbox.inheritsHooksFrom('export_import_print_display_button');

Template.internal_transaction_list_with_switchbox.onCreated(function(){
    const templateObject = Template.instance();
    templateObject.transactiondatatablerecords = new ReactiveVar([]);
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.selectedFile = new ReactiveVar();
    templateObject.int_trans_with_switchbox_displayfields = new ReactiveVar([]);
    templateObject.reset_data = new ReactiveVar([]);
    templateObject.tablename = new ReactiveVar();
    templateObject.selectedAwaitingProduct = new ReactiveVar([]);
});

Template.internal_transaction_list_with_switchbox.onRendered(function() {
  let templateObject = Template.instance();
  const customerList = [];
  let usedCategories = [];
  let salesOrderTable;
  let tableProductList;
  var splashArrayProductList = new Array();
  var splashArrayTaxRateList = new Array();
  const taxCodesList = [];
  const lineExtaSellItems = [];
  const lineCustomerItems = [];
  const dataTableList = [];
  const tableHeaderList = [];

  if(FlowRouter.current().queryParams.success){
      $('.btnRefresh').addClass('btnRefreshAlert');
  };
  function MakeNegative() {
      $('td').each(function () {
          if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
      });

      $("td.colStatus").each(function () {
        if ($(this).text() == "In-Active") $(this).addClass("text-deleted");
        if ($(this).text() == "Deleted") $(this).addClass("text-deleted");
        if ($(this).text() == "Full") $(this).addClass("text-fullyPaid");
        if ($(this).text() == "Part") $(this).addClass("text-partialPaid");
        if ($(this).text() == "Rec") $(this).addClass("text-reconciled");

      });
  };

    let currenttablename = templateObject.data.tablename||"";

    templateObject.tablename.set(currenttablename);

      // set initial table rest_data
      templateObject.init_reset_data = function(){
          let reset_data = [];
          if(currenttablename == "tblInventoryCheckbox") {
              reset_data = [
                { index: 1, label: '#ID', class: 'colID', active: false, display: true, width: "10" },
                { index: 2, label: 'Product Name', class: 'colProductName', active: true, display: true, width: "200" },
                { index: 3, label: 'Sales Description', class: 'colSalesDescription', active: true, display: true, width: "" },
                { index: 4, label: 'Barcode', class: 'colBarcode', active: true, display: true, width: "100" },
                { index: 5, label: 'Cost Price', class: 'colCostPrice', active: true, display: true, width: "100" },
                { index: 6, label: 'Sales Price', class: 'colSalesPrice', active: true, display: true, width: "100" },
                { index: 7, label: 'Quantity', class: 'colQty', active: true, display: true, width: "100" },
                { index: 8, label: 'Tax Rate', class: 'colTax', active: true, display: true, width: "100" },
                { index: 9, label: 'Product Pop ID', class: 'colProuctPOPID', active: false, display: true, width: "100" },
                { index: 10, label: 'Extra Sell Price', class: 'colExtraSellPrice', active: false, display: true, width: "100" },
                { index: 11, label: 'Status', class: 'colStatus', active: true, display: true, width: "100" },
              ];
          }
        templateObject.reset_data.set(reset_data);
      }
      templateObject.init_reset_data();

      // set initial table rest_data
        templateObject.initCustomFieldDisplaySettings = function(data, listType){
  //function initCustomFieldDisplaySettings(data, listType) {
    let templateObject = Template.instance();
    let reset_data = templateObject.reset_data.get();
    templateObject.showCustomFieldDisplaySettings(reset_data);

    try {
        /*
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
        }
    });*/

    } catch (error) {

    }
    return;
  }
        templateObject.showCustomFieldDisplaySettings = async function(reset_data){
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
            $('#'+currenttablename+' .'+reset_data[r].class).removeClass('hiddenColumn');
          }else if(reset_data[r].active == false){
            $('#'+currenttablename+' .'+reset_data[r].class).addClass('hiddenColumn');
          };
          custFields.push(customData);
        }
        await templateObject.int_trans_with_switchbox_displayfields.set(custFields);
        $('.dataTable').resizable();
      }
        templateObject.initCustomFieldDisplaySettings("", currenttablename);

        templateObject.resetData = function (dataVal) {
          location.reload();
        };

      //Products Data
      templateObject.getProductsData = async function (deleteFilter = false) { //GET Data here from Web API or IndexDB
        var customerpage = 0;
        getVS1Data('TProductVS1').then(function (dataObject) {
            if (dataObject.length == 0) {
                sideBarService.getNewProductListVS1(initialBaseDataLoad, 0,deleteFilter).then(async function (data) {
                    await addVS1Data('TProductVS1', JSON.stringify(data));
                    templateObject.displayProductsData(data); //Call this function to display data on the table
                }).catch(function (err) {

                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                templateObject.displayProductsData(data); //Call this function to display data on the table
            }
        }).catch(function (err) {
          sideBarService.getNewProductListVS1(initialBaseDataLoad, 0,deleteFilter).then(async function (data) {
              await addVS1Data('TProductVS1', JSON.stringify(data));
              templateObject.displayProductsData(data); //Call this function to display data on the table
          }).catch(function (err) {

          });
        });
      }
      templateObject.displayProductsData = async function (data) {
        var splashArrayProductList = new Array();
        let lineItems = [];
        let lineItemObj = {};
        let deleteFilter = false;
        let chkBox;
        let costprice = 0.00;
        let sellrate = 0.00;
        let linestatus = '';
        // if(data.Params.Search.replace(/\s/g, "") == ""){
        //   deleteFilter = true;
        // }else{
        //   deleteFilter = false;
        // };

        for (let i = 0; i < data.tproductvs1.length; i++) {
          if (data.tproductvs1[i].fields.Active == true) {
              linestatus = "";
          } else if (data.tproductvs1[i].fields.Active == false) {
              linestatus = "In-Active";
          };
          chkBox = '<div class="custom-control custom-switch chkBox pointer" style="width:15px;"><input name="pointer" class="custom-control-input chkBox pointer" type="checkbox" id="formCheck-' + data.tproductvs1[i].fields.ID + "x" + data.tproductvs1[i].fields.ProductName +
          '"><label class="custom-control-label chkBox pointer" for="formCheck-' + data.tproductvs1[i].fields.ID +
          "x" + data.tproductvs1[i].fields.ProductName +
          '"></label></div>'; //switchbox

          costprice = utilityService.modifynegativeCurrencyFormat(
              Math.floor(data.tproductvs1[i].fields.BuyQty1Cost * 100) / 100); //Cost Price
          sellprice = utilityService.modifynegativeCurrencyFormat(
              Math.floor(data.tproductvs1[i].fields.SellQty1Price* 100) / 100); //Sell Price

          var dataList = [
              chkBox,
              data.tproductvs1[i].fields.ID || "",
              data.tproductvs1[i].fields.ProductName || "",
              data.tproductvs1[i].fields.SalesDescription || "",
              data.tproductvs1[i].fields.BARCODE || "",
              costprice,
              sellprice,
              data.tproductvs1[i].fields.TotalQtyInStock,
              data.tproductvs1[i].fields.TaxCodePurchase || "",
              data.tproductvs1[i].fields.ID || "",
              data.tproductvs1[i].fields.ExtraSellPrice || null,
              linestatus,
          ];

            splashArrayProductList.push(dataList);
            templateObject.transactiondatatablerecords.set(splashArrayProductList);

        }

        if (templateObject.transactiondatatablerecords.get()) {
            setTimeout(function () {
                MakeNegative();
            }, 100);
        }
        //$('.fullScreenSpin').css('display','none');
        setTimeout(function () {
            //$('#'+currenttablename).removeClass('hiddenColumn');
            $('#'+currenttablename).DataTable({
                data: splashArrayProductList,
                "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                columnDefs: [{
                      targets: 0,
                      className: "colChkBox pointer",
                      orderable: false,
                      width: "15px",
                    },
                    {
                        targets: 1,
                        className: "colID colID hiddenColumn",
                        width: "10px",
                        createdCell: function (td, cellData, rowData, row, col) {
                          $(td).closest("tr").attr("id", rowData[1]);
                        }},
                    {
                      targets: 2,
                      className: "colProductName",
                      width: "200px",
                    },
                    {
                      targets: 3,
                      className: "colSalesDescription",
                    },
                    {
                      targets: 4,
                      className: "colBarcode",
                      width: "100px",
                    },
                    {
                      targets: 5,
                      className: "colCostPrice text-right",
                      width: "100px",
                    },
                    {
                      targets: 6,
                      className: "colSalesPrice text-right",
                      width: "100px",
                    },
                    {
                      targets: 7,
                      className: "colQty",
                      width: "100px",
                    },
                    {
                      targets: 8,
                      className: "colTax",
                      width: "100px",
                    },
                    {
                      targets: 9,
                      className: "colProuctPOPID hiddenColumn",
                      width: "100px",
                    },
                    {
                      targets: 10,
                      className: "colExtraSellPrice hiddenColumn",
                      width: "100px",
                    },
                    {
                      targets: 11,
                      className: "colStatus",
                      width: "100px",
                    }
                ],
                // buttons: [
                //     {
                //         extend: 'csvHtml5',
                //         text: '',
                //         download: 'open',
                //         className: "btntabletocsv hiddenColumn",
                //         filename: "Products List",
                //         orientation:'portrait',
                //         exportOptions: {
                //             columns: ':visible'
                //         }
                //     },{
                //         extend: 'print',
                //         download: 'open',
                //         className: "btntabletopdf hiddenColumn",
                //         text: '',
                //         title: 'Lead Status Settings',
                //         filename: "Products List",
                //         exportOptions: {
                //             columns: ':visible',
                //             stripHtml: false
                //         }
                //     },
                //     {
                //         extend: 'excelHtml5',
                //         title: '',
                //         download: 'open',
                //         className: "btntabletoexcel hiddenColumn",
                //         filename: "Products List",
                //         orientation:'portrait',
                //         exportOptions: {
                //             columns: ':visible'
                //         }
                //
                //     }
                // ],
                select: true,
                destroy: true,
                colReorder: true,
                pageLength: initialDatatableLoad,
                lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                info: true,
                responsive: true,
                "order": [[1, "asc"]],
                action: function () {
                    $('#'+currenttablename).DataTable().ajax.reload();
                },

                "fnDrawCallback": function (oSettings) {
                    $('.paginate_button.page-item').removeClass('disabled');
                    $('#'+currenttablename+'_ellipsis').addClass('disabled');
                    if (oSettings._iDisplayLength == -1) {
                        if (oSettings.fnRecordsDisplay() > 150) {

                        }
                    } else {

                    }
                    if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                        $('.paginate_button.page-item.next').addClass('disabled');
                    }

                    $('.paginate_button.next:not(.disabled)', this.api().table().container()).on('click', function () {
                  $('.fullScreenSpin').css('display', 'inline-block');
                  //var splashArrayCustomerListDupp = new Array();
                  let dataLenght = oSettings._iDisplayLength;
                  let customerSearch = $('#'+currenttablename+'_filter input').val();

                    sideBarService.getNewProductListVS1(initialDatatableLoad, oSettings.fnRecordsDisplay(),deleteFilter).then(function (dataObjectnew) {
                    for (let j = 0; j < dataObjectnew.tproductvs1.length; j++) {
                        let chkBox;
                        let costprice = 0.00;
                        let sellrate = 0.00;
                        let linestatus = '';
                        if (dataObjectnew.tproductvs1[j].fields.Active == true) {
                            linestatus = "";
                        } else if (dataObjectnew.tproductvs1[j].fields.Active == false) {
                            linestatus = "In-Active";
                        };
                        chkBox = '<div class="custom-control custom-switch chkBox pointer" style="width:15px;"><input name="pointer" class="custom-control-input chkBox pointer" type="checkbox" id="formCheck-' + dataObjectnew.tproductvs1[j].fields.ID + "x" + dataObjectnew.tproductvs1[j].fields.ProductName +
                        '"><label class="custom-control-label chkBox pointer" for="formCheck-' + dataObjectnew.tproductvs1[j].fields.ID +
                        "x" + dataObjectnew.tproductvs1[j].fields.ProductName +
                        '"></label></div>'; //switchbox

                        costprice = utilityService.modifynegativeCurrencyFormat(
                            Math.floor(dataObjectnew.tproductvs1[j].fields.BuyQty1Cost * 100) / 100); //Cost Price
                        sellprice = utilityService.modifynegativeCurrencyFormat(
                            Math.floor(dataObjectnew.tproductvs1[j].fields.SellQty1Price* 100) / 100); //Sell Price

                        var dataListDupp = [
                            chkBox,
                            dataObjectnew.tproductvs1[j].fields.ID || "",
                            dataObjectnew.tproductvs1[j].fields.ProductName || "",
                            dataObjectnew.tproductvs1[j].fields.SalesDescription || "",
                            dataObjectnew.tproductvs1[j].fields.BARCODE || "",
                            costprice,
                            sellprice,
                            dataObjectnew.tproductvs1[j].fields.TotalQtyInStock,
                            dataObjectnew.tproductvs1[j].fields.TaxCodePurchase || "",
                            dataObjectnew.tproductvs1[j].fields.ID || "",
                            dataObjectnew.tproductvs1[j].fields.ExtraSellPrice || null,
                            linestatus,
                        ];

                        splashArrayProductList.push(dataListDupp);
                    }
                    let uniqueChars = [...new Set(splashArrayProductList)];
                    templateObject.transactiondatatablerecords.set(uniqueChars);
                    var datatable = $('#'+currenttablename).DataTable();
                    datatable.clear();
                    datatable.rows.add(uniqueChars);
                    datatable.draw(false);
                    setTimeout(function () {
                      $('#'+currenttablename).dataTable().fnPageChange('last');
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
                        $("<a class='btn btn-primary scanProdBarcodePOP' href='' id='scanProdBarcodePOP' role='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-camera'></i></a>").insertAfter("#tblInventoryCheckbox_filter");
                        $("<button class='btn btn-primary' data-dismiss='modal' data-toggle='modal' data-target='#newProductModal' type='button' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblInventoryCheckbox_filter");
                        if(deleteFilter){
                          $("<button class='btn btn-danger btnHideDeleted' type='button' id='btnHideDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='far fa-check-circle' style='margin-right: 5px'></i>Hide In-Active</button>").insertAfter('#'+currenttablename+'_filter');

                        }else{
                          $("<button class='btn btn-primary btnViewDeleted' type='button' id='btnViewDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fa fa-trash' style='margin-right: 5px'></i>View In-Active</button>").insertAfter('#'+currenttablename+'_filter');
                        }
                        $("<button class='btn btn-primary btnRefreshList' type='button' id='btnRefreshList' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter('#'+currenttablename+'_filter');
                },
                "fnInfoCallback": function(oSettings, iStart, iEnd, iMax, iTotal, sPre) {
                    // let countTableData = data.Params.Count || 0; //get count from API data
                    //
                    // return 'Showing ' + iStart + " to " + iEnd + " of " + countTableData;
                }

            }).on('page', function () {
                setTimeout(function () {
                    MakeNegative();
                }, 100);
            }).on('column-reorder', function () {

            }).on('length.dt', function (e, settings, len) {

              $(".fullScreenSpin").css("display", "inline-block");
              let dataLenght = settings._iDisplayLength;
              if (dataLenght == -1) {
                if (settings.fnRecordsDisplay() > initialDatatableLoad) {
                  $(".fullScreenSpin").css("display", "none");
                } else {
                  $(".fullScreenSpin").css("display", "none");
                }
              } else {
                $(".fullScreenSpin").css("display", "none");
              }
                setTimeout(function () {
                    MakeNegative();
                }, 100);
            });
            $(".fullScreenSpin").css("display", "none");

        }, 0);

        $('div.dataTables_filter input').addClass('form-control form-control-sm');
      }

        //Check URL to make right call.
        if(currenttablename == "tblInventoryCheckbox"){
            templateObject.getProductsData();
        }
      tableResize();
    });

Template.internal_transaction_list_with_switchbox.events({
    //Check all and add bgcolor on data switchboxes when switched header
    'click .colChkBoxAll': async function (event) {
        const templateObject = Template.instance();
        let currenttablename = await templateObject.tablename.get()||'';
        if ($(event.target).is(':checked')) {
            $(".chkBox").prop("checked", true);
            $(`.${currenttablename} .colChkBox`).closest('tr').addClass('checkRowSelected');
        } else {
            $(".chkBox").prop("checked", false);
            $(`.${currenttablename} .colChkBox`).closest('tr').removeClass('checkRowSelected');
        }

    },
    'click .chkBox': async function (event) {
        const templateObject = Template.instance();
        let currenttablename = await templateObject.tablename.get()||'';
        if($(event.target).is(':checked')){
            $(event.target).closest('tr').addClass('checkRowSelected');
            var chkID = $('.chkBox').prop("checked") ? 1 : 0;
              dataTableList = dataTableList.filter((value, index) => {
                if (chkID == 1) {
                  return true;
                }
                return false;
              });

            // Sort by created at
            dataTableList = dataTableList.sort(chkID);
            dataTableList.reverse();

            await templateInstance.datatablerecords.set(dataTableList);
        } else {
            $(event.target).closest('tr').removeClass('checkRowSelected');
            var chkID = $('.chkBox').prop("checked") ? 0 : 1;
            dataTableList = dataTableList.filter((value, index) => {
              if (chkID == 1) {
                return true;
              }
              return false;
            });

          // Sort by created at
          dataTableList = dataTableList.sort(chkID);
          dataTableList.reverse();

          await templateInstance.datatablerecords.set(dataTableList);
        }
    },
    "click .btnViewDeleted": async function (e) {
      $(".fullScreenSpin").css("display", "inline-block");
      e.stopImmediatePropagation();
      const templateObject = Template.instance();
      let currenttablename = await templateObject.tablename.get()||'';
      $('.btnViewDeleted').css('display','none');
      $('.btnHideDeleted').css('display','inline-block');

      if(currenttablename == "tblInventoryCheckbox"){
        await clearData('TProductVS1');
        templateObject.getProductsData(true);
      }

    },
    "click .btnHideDeleted": async function (e) {
      $(".fullScreenSpin").css("display", "inline-block");
      e.stopImmediatePropagation();
      let templateObject = Template.instance();
      let currenttablename = await templateObject.tablename.get()||'';

      // var datatable = $(`#${currenttablename}`).DataTable();
      // datatable.clear();
      // datatable.draw(false);
      $('.btnHideDeleted').css('display','none');
      $('.btnViewDeleted').css('display','inline-block');

      if(currenttablename == "tblInventoryCheckbox"){
        await clearData('TProductVS1');
        templateObject.getProductsData(false);
      }

    },
    'change .custom-range': async function(event) {
    const tableHandler = new TableHandler();
    let range = $(event.target).val()||0;
    let colClassName = $(event.target).attr("valueclass");
    await $('.' + colClassName).css('width', range);
    $('.dataTable').resizable();
  },
    'click .chkDatatable': function(event) {
      let columnDataValue = $(event.target).closest("div").find(".divcolumn").attr('valueupdate');
      if ($(event.target).is(':checked')) {
        $('.'+columnDataValue).addClass('showColumn');
        $('.'+columnDataValue).removeClass('hiddenColumn');
      } else {
        $('.'+columnDataValue).addClass('hiddenColumn');
        $('.'+columnDataValue).removeClass('showColumn');
      }
  },
    "blur .divcolumn": async function (event) {
    const templateObject = Template.instance();
    let columData = $(event.target).text();
    let columnDatanIndex = $(event.target).closest("div.columnSettings").attr("custid");
    let currenttablename = await templateObject.tablename.get()||'';
    var datable = $('#'+currenttablename).DataTable();
    var title = datable.column(columnDatanIndex).header();
    $(title).html(columData);
  },
    'click .resetTable' : async function(event){
    let templateObject = Template.instance();
    let reset_data = templateObject.reset_data.get();
    let currenttablename = await templateObject.tablename.get()||'';
      //reset_data[9].display = false;
      reset_data = reset_data.filter(redata => redata.display);
    $(".displaySettings").each(function (index) {
      let $tblrow = $(this);
      $tblrow.find(".divcolumn").text(reset_data[index].label);
      $tblrow.find(".custom-control-input").prop("checked", reset_data[index].active);

      let title = $('#'+currenttablename).find("th").eq(index);
        $(title).html(reset_data[index].label);

      if (reset_data[index].active) {
        $('.' + reset_data[index].class).addClass('showColumn');
        $('.' + reset_data[index].class).removeClass('hiddenColumn');
      } else {
        $('.' + reset_data[index].class).addClass('hiddenColumn');
        $('.' + reset_data[index].class).removeClass('showColumn');
      }
      $(".rngRange" + reset_data[index].class).val(reset_data[index].width);
      $("." + reset_data[index].class).css('width', reset_data[index].width);
    });
  },
    "click .saveTable": async function(event) {
    let lineItems = [];
    $(".fullScreenSpin").css("display", "inline-block");

    $(".displaySettings").each(function (index) {
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
      let tableName = await templateObject.tablename.get()||'';
      let employeeId = parseInt(Session.get('mySessionEmployeeLoggedID'))||0;
      let added = await sideBarService.saveNewCustomFields(erpGet, tableName, employeeId, lineItems);

      if(added){
        sideBarService.getNewCustomFieldsWithQuery(parseInt(Session.get('mySessionEmployeeLoggedID')),'').then(function (dataCustomize) {
            addVS1Data('VS1_Customize', JSON.stringify(dataCustomize));
        }).catch(function (err) {
        });
        $(".fullScreenSpin").css("display", "none");
        swal({
          title: 'SUCCESS',
          text: "Display settings is updated!",
          type: 'success',
          showCancelButton: false,
          confirmButtonText: 'OK'
        }).then((result) => {
            if (result.value) {
                $('#'+tableName+'_Modal').modal('hide');
            }
        });
      }else{
        $(".fullScreenSpin").css("display", "none");
      }

    },
      // "click .exportbtn": async function () {
      //     $(".fullScreenSpin").css("display", "inline-block");
      //     let currenttablename = await templateObject.tablename.get()||'';
      //     jQuery('#'+currenttablename+'_wrapper .dt-buttons .btntabletocsv').click();
      //     $(".fullScreenSpin").css("display", "none");
      //   },
      // "click .printConfirm": async function (event) {
      //     $(".fullScreenSpin").css("display", "inline-block");
      //     let currenttablename = await templateObject.tablename.get()||'';
      //     jQuery('#'+currenttablename+'_wrapper .dt-buttons .btntabletopdf').click();
      //     $(".fullScreenSpin").css("display", "none");
      //   },
});

Template.internal_transaction_list_with_switchbox.helpers({
  transactiondatatablerecords: () => {
      return Template.instance().transactiondatatablerecords.get();
  },
  tableheaderrecords: () => {
      return Template.instance().tableheaderrecords.get();
  },
  salesCloudPreferenceRec: () => {
      return CloudPreference.findOne({
          userid: Session.get('mycloudLogonID'),
          PrefName: Template.instance().tablename.get()
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
  int_trans_with_switchbox_displayfields: () => {
    return Template.instance().int_trans_with_switchbox_displayfields.get();
  },
  tablename: () => {
      return Template.instance().tablename.get();
  }
});
