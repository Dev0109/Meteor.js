import { ProductService } from "../product/product-service";
import { ReactiveVar } from "meteor/reactive-var";
import { CoreService } from "../js/core-service";
import { AccountService } from "../accounts/account-service";
import { UtilityService } from "../utility-service";
import "jquery-editable-select";
import Chart from "chart.js";
import XLSX from "xlsx";
import { SideBarService } from "../js/sidebar-service";
import "../lib/global/indexdbstorage.js";
import { OrganisationService } from "../js/organisation-service";
let sideBarService = new SideBarService();
let utilityService = new UtilityService();
let organisationService = new OrganisationService;


Template.inventorylist.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.deptrecords = new ReactiveVar();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.datatablebackuprecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);

    templateObject.taxraterecords = new ReactiveVar([]);
    templateObject.deptrecords = new ReactiveVar();
    templateObject.recentTrasactions = new ReactiveVar([]);

    templateObject.coggsaccountrecords = new ReactiveVar();
    templateObject.salesaccountrecords = new ReactiveVar();

    templateObject.productdeptrecords = new ReactiveVar();
    templateObject.proddeptIDrecords = new ReactiveVar();
    templateObject.selectedFile = new ReactiveVar();

    templateObject.includeStockTransfer = new ReactiveVar();
    templateObject.includeStockTransfer.set(false);

    templateObject.includeStockAdjustment = new ReactiveVar();
    templateObject.includeStockAdjustment.set(false);

    templateObject.isSNTrackchecked = new ReactiveVar();
    templateObject.isSNTrackchecked.set(false);

    templateObject.isProductList = new ReactiveVar();
    templateObject.isProductList.set(false);
    templateObject.isNewProduct = new ReactiveVar();
    templateObject.isNewProduct.set(false);
    templateObject.isNewStockTransfer = new ReactiveVar();
    templateObject.isNewStockTransfer.set(false);
    templateObject.isExportProduct = new ReactiveVar();
    templateObject.isExportProduct.set(false);
    templateObject.isImportProduct = new ReactiveVar();
    templateObject.isImportProduct.set(false);
    templateObject.isStockonHandDemandChart = new ReactiveVar();
    templateObject.isStockonHandDemandChart.set(false);

    templateObject.displayfields = new ReactiveVar([]);
    templateObject.reset_data = new ReactiveVar([]);
    templateObject.setupFinished = new ReactiveVar();
});

Template.inventorylist.onRendered(function() {
    $(".fullScreenSpin").css("display", "inline-block");

    if (FlowRouter.current().queryParams.success) {
        $(".btnRefresh").addClass("btnRefreshAlertOverview");
    }

    function MakeNegative() {
        $('td').each(function () {
            if ($(this).text().indexOf('-' + Currency) >= 0)
                $(this).addClass('text-danger')
        });

        $('td.colAvailable, td.colOnSO, td.colOnBO, td.colInStock, td.colOnOrder').each(function(){
            // if(parseInt($(this).text()) == 0) $(this).addClass('neutralVolume');
            if (parseInt($(this).text()) > 0) $(this).addClass('positiveVolume');
            if (parseInt($(this).text()) < 0) $(this).addClass('negativeVolume');
        });
    };

    let templateObject = Template.instance();


    // set initial table rest_data
    function init_reset_data() {
      let reset_data = [
        { index: 0, label: "#ID", class: "ProductID", width: "30", active: false, display: true },
        { index: 1, label: "Product Name", class: "ProductName", width: "200", active: true, display: true },
        { index: 2, label: "Sales Description", class: "SalesDescription", width: "", active: true, display: true },
        { index: 3, label: "Available", class: "Available", width: "70", active: true, display: true },
        { index: 4, label: "On SO", class: "OnSO", width: "60", active: true, display: true },
        { index: 5, label: "On BO", class: "OnBO", width: "60", active: true, display: true },
        { index: 6, label: "In Stock", class: "InStock", width: "65", active: true, display: true },
        { index: 7, label: "On Order", class: "OnOrder", width: "72", active: true, display: true },
        { index: 8, label: "Cost Price (Ex)", class: "CostPrice", width: "135", active: false, display: true },
        { index: 9, label: "Cost Price (Inc)", class: "CostPriceInc", width: "135", active: true, display: true },
        { index: 10, label: "Sale Price (Ex)", class: "SalePrice", width: "135", active: false, display: true },
        { index: 11, label: "Sale Price (Inc)", class: "SalePriceInc", width: "135", active: true, display: true },
        { index: 12, label: "Serial/Lot No", class: "SerialNo", width: "124", active: false, display: true },
        { index: 13, label: "Barcode", class: "Barcode", width: "80", active: false, display: true },
        { index: 14, label: "Department", class: "Departmentth", width: "100", active: false, display: true },
        { index: 15, label: "Purchase Description", class: "PurchaseDescription", width: "", active: false, display: true },
        { index: 16, label: "Custom Field 1", class: "ProdCustField1", width: "", active: false, display: true },
        { index: 17, label: "Custom Field 2", class: "ProdCustField2", width: "", active: false, display: true },
      ];

      let isSNTrackchecked = localStorage.getItem('vs1cloudlicenselevel') == 'PLUS' || false;
      if(isSNTrackchecked) {
        reset_data[12].display = true;
      } else {
        reset_data[12].display = false;
      }

      let templateObject = Template.instance();
      templateObject.reset_data.set(reset_data);
    }
    init_reset_data();
    // set initial table rest_data

  // custom field displaysettings
  templateObject.initCustomFieldDisplaySettings = function(data, listType) {
    $(".fullScreenSpin").css("display", "inline-block");
    let templateObject = Template.instance();
    let reset_data = templateObject.reset_data.get();
    showCustomFieldDisplaySettings(reset_data);

    try {
      getVS1Data("VS1_Customize").then( function (dataObject) {
        if (dataObject.length == 0) {
          sideBarService.getNewCustomFieldsWithQuery(parseInt(Session.get('mySessionEmployeeLoggedID')), listType).then(function (data) {
            reset_data = data.ProcessLog.Obj.CustomLayout[0].Columns;
            showCustomFieldDisplaySettings(reset_data);
            $(".fullScreenSpin").css("display", "none");
          }).catch(function (err) {
          });
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
          $(".fullScreenSpin").css("display", "none");
          // handle process here
        }
      });
    } catch (error) {
    }
    return;
  }

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
      if(reset_data[r].active == true){
        $('#tblInventoryOverview_wrapper .col'+reset_data[r].class).removeClass('hiddenColumn');
      }else if(reset_data[r].active == false){
        $('#tblInventoryOverview_wrapper .col'+reset_data[r].class).addClass('hiddenColumn');
      };
      custFields.push(customData);
    }
    templateObject.displayfields.set(custFields);
  }

  // custom field displaysettings


    let productService = new ProductService();
    const deptrecords = [];
    const dataTableList = [];
    const tableHeaderList = [];

    const taxCodesList = [];

    const coggsaccountrecords = [];
    const salesaccountrecords = [];
    let deptprodlineItems = [];
    var tableInventory = "";
    var splashArrayProductList = new Array();
    //   $(document).ready(function() {
    //   $('#edtassetaccount').editableSelect();
    //   $('#sltcogsaccount').editableSelect();
    // });

    let productTable;
    var splashArray = new Array();
    var splashArrayProd = new Array();
    var splashArrayProdDept = new Array();

    let isStockTransfer = Session.get("CloudStockTransferModule");
    let isStockAdjustment = Session.get("CloudStockAdjustmentModule");

    let isProductList = Session.get('CloudProdList');
    let isNewProduct = Session.get('CloudNewProd');
    let isNewStockTransfer = Session.get('CloudNewStockTransfer');
    let isExportProduct = Session.get('CloudExportProd');
    let isImportProduct = Session.get('CloudImportProd');
    let isStockonHandDemandChart = Session.get('CloudStockOnHand');

    if (isStockTransfer) {
        templateObject.includeStockTransfer.set(true);
    }

    if (isStockAdjustment) {
        templateObject.includeStockAdjustment.set(true);
    }

    if (isNewProduct) {
        templateObject.isNewProduct.set(true);
    }
    if (isNewStockTransfer) {
        templateObject.isNewStockTransfer.set(true);
    }
    if (isExportProduct) {
        templateObject.isExportProduct.set(true);
    }
    if (isImportProduct) {
        templateObject.isImportProduct.set(true);
    }
    if (isStockonHandDemandChart) {
        templateObject.isStockonHandDemandChart.set(true);
    }

    if(localStorage.getItem('vs1cloudlicenselevel')=='PLUS'){
        templateObject.isSNTrackchecked.set(true);
    }


    templateObject.getAllProductClassDeptData = function() {
        productService.getProductClassQtyData().then(function(data) {
                let deptprodlineItemObj = {};
                for (let j in data.tproductclassquantity) {
                    deptprodlineItemObj = {
                        department: data.tproductclassquantity[j].DepartmentName || "",
                        productid: data.tproductclassquantity[j].ProductID || 0,
                        productqty: data.tproductclassquantity[j].InStockQty || 0,
                    };
                    // totaldeptquantity += data.tproductvs1class[j].InStockQty;
                    //splashArrayProdDept.push(deptprodlineItemObj);
                }

                let groupData = _.omit(_.groupBy(deptprodlineItems, "productid"), [""]);

                templateObject.productdeptrecords.set(groupData);
                let totalAmountCalculation = _.map(groupData, function(value, key) {
                    let totalPayment = 0;
                    let departmentname = "";
                    for (let i = 0; i < value.length; i++) {
                        totalPayment += value[i].productqty;
                        departmentname = value[i].department;
                    }
                    let userObject = {};
                    userObject.productid = key;
                    userObject.department = departmentname;
                    userObject.productqty = totalPayment;
                    return userObject;
                });

                // $('#edttotalqtyinstock').val(totaldeptquantity);

                // templateObject.totaldeptquantity.set(totaldeptquantity);
                //templateObject.getAllProductData('All');
        }).catch(function(err) {
            $(".fullScreenSpin").css("display", "none");
        });
    };

    templateObject.resetData = function (dataVal) {
      window.open("/inventorylist?page=last", "_self");
    };

    templateObject.getAllProductData = async function(deptname) {
        await templateObject.initCustomFieldDisplaySettings("", "tblInventoryOverview");
        getVS1Data("TProductList").then(function(dataObject) {
                if (dataObject.length == 0) {
                    sideBarService.getProductListVS1(initialBaseDataLoad, 0).then(function(data) {
                            addVS1Data("TProductList", JSON.stringify(data));
                            // addVS1Data('TProductVS1',JSON.stringify(data));
                            //localStorage.setItem('VS1ProductList', JSON.stringify(data)||'');
                            let lineItems = [];
                            let lineItemObj = {};
                            let departmentData = "";
                            let departmentDataLoad = "";
                            let prodQtyData = 0;
                            let prodQtyDataLoad = 0;
                            let deptStatus = "";
                            let checkIfSerialorLot = '';
                            //let getDepartmentData = templateObject.productdeptrecords.get();
                            var dataList = {};
                            //if((deptname == 'undefined') || (deptname == 'All')){
                            departmentData = "All";
                            for (let i = 0; i < data.tproductlist.length; i++) {
                              let availableQty = data.tproductlist[i].AvailableQty||0;
                              let onBOOrder = 0;
                              if(data.tproductlist[i].SNTracking == true){
                                checkIfSerialorLot = '<i class="fas fa-plus-square text-success btnSNTracking"  style="font-size: 22px;" ></i>';
                              }else if(data.tproductlist[i].batch == true){
                                checkIfSerialorLot = '<i class="fas fa-plus-square text-success btnBatch"  style="font-size: 22px;" ></i>';
                              }else{
                                checkIfSerialorLot = '<i class="fas fa-plus-square text-success btnNoBatchorSerial"  style="font-size: 22px;" ></i>';
                              }

                               onBOOrder = data.tproductlist[i].TotalQtyInStock - availableQty;
                                var dataList = [
                                    data.tproductlist[i].PARTSID || "",
                                    data.tproductlist[i].PARTNAME || "-",
                                    data.tproductlist[i].PARTSDESCRIPTION || "",
                                    availableQty,
                                    data.tproductlist[i].SOBOQty||0,
                                    data.tproductlist[i].POBOQty||0,
                                    data.tproductlist[i].InstockQty,
                                    data.tproductlist[i].AllocatedBOQty,
                                    utilityService.modifynegativeCurrencyFormat(Math.floor(data.tproductlist[i].COST1 * 100) / 100),
                                    utilityService.modifynegativeCurrencyFormat(Math.floor(data.tproductlist[i].COSTINC1 * 100) /100),
                                    utilityService.modifynegativeCurrencyFormat(Math.floor(data.tproductlist[i].PRICE1 * 100) / 100),
                                    utilityService.modifynegativeCurrencyFormat(Math.floor(data.tproductlist[i].PRICEINC1 * 100) /100),
                                    checkIfSerialorLot||'',
                                    data.tproductlist[i].BARCODE || "",
                                    departmentData,
                                    data.tproductlist[i].PURCHASEDESC || "",
                                    data.tproductlist[i].CUSTFLD1 || "",
                                    data.tproductlist[i].CUSTFLD2 || "",
                                ];
                                splashArrayProductList.push(dataList);
                                dataTableList.push(dataList);
                            }

                            templateObject.datatablerecords.set(dataTableList);
                            templateObject.datatablebackuprecords.set(dataTableList);


                            // Session.set('VS1ProductList', splashArrayProd);

                            if (templateObject.datatablerecords.get()) {

                                setTimeout(function() {
                                    MakeNegative();
                                }, 100);
                            }

                            $(".fullScreenSpin").css("display", "none");
                            setTimeout(function() {
                                let columnData = [];
                                let displayfields = templateObject.displayfields.get();
                                if( displayfields.length > 0 ){
                                    displayfields.forEach(function( item ){
                                        columnData.push({
                                            className: ( item.active )? item.class : `col${item.class} hiddenColumn`,
                                            targets: [item.id],
                                        })
                                    });
                                }
                                $("#tblInventoryOverview").dataTable({
                                    data: splashArrayProductList,
                                    sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                                    columnDefs: columnData,
                                      select: true,
                                      destroy: true,
                                      colReorder: true,
                                      buttons: [{
                                              extend: "excelHtml5",
                                              text: "",
                                              download: "open",
                                              className: "btntabletocsv hiddenColumn",
                                              filename: "inventory_" + moment().format(),
                                              orientation: "portrait",
                                              exportOptions: {
                                                  columns: ":visible",
                                              },
                                          },
                                          {
                                              extend: "print",
                                              download: "open",
                                              className: "btntabletopdf hiddenColumn",
                                              text: "",
                                              title: "Inventory List",
                                              filename: "inventory_" + moment().format(),
                                              exportOptions: {
                                                  columns: ":visible",
                                              },
                                          },
                                      ],
                                      // bStateSave: true,
                                      // rowId: 0,
                                      // paging: false,
                                      // "scrollY": "800px",
                                      // "scrollCollapse": true,
                                      pageLength: initialBaseDataLoad,
                                      lengthMenu: [
                                          [initialBaseDataLoad, -1],
                                          [initialBaseDataLoad, "All"],
                                      ],
                                      info: true,
                                      responsive: true,
                                      order: [
                                          [0, "asc"]
                                      ],
                                      action: function() {
                                          $("#tblInventoryOverview").DataTable().ajax.reload();
                                      },
                                      fnDrawCallback: function(oSettings) {
                                          $(".paginate_button.page-item").removeClass("disabled");
                                          $("#tblInventoryOverview_ellipsis").addClass("disabled");
                                          if (oSettings._iDisplayLength == -1) {
                                              if (oSettings.fnRecordsDisplay() > 150) {}
                                              $(".fullScreenSpin").css("display", "inline-block");
                                              setTimeout(function() {
                                                  $(".fullScreenSpin").css("display", "none");
                                              }, 100);
                                          } else {}
                                          if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                                              $(".paginate_button.page-item.next").addClass("disabled");
                                          }

                                          $(".paginate_button.next:not(.disabled)",this.api().table().container()).on("click", function() {
                                              $(".fullScreenSpin").css("display", "inline-block");
                                              let dataLenght = oSettings._iDisplayLength;
                                              let customerSearch = $("#tblInventoryOverview_filter input").val();
                                              sideBarService.getProductListVS1(initialDatatableLoad,oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
                                                getVS1Data("TProductList").then(function (dataObjectold) {
                                                    if (dataObjectold.length == 0) {
                                                    } else {
                                                      let dataOld = JSON.parse(dataObjectold[0].data);

                                                      var thirdaryData = $.merge($.merge([],dataObjectnew.tproductlist),dataOld.tproductlist);
                                                      let objCombineData = {
                                                        Params: dataOld.Params,
                                                        tproductlist: thirdaryData,
                                                      };

                                                      addVS1Data("TProductList",JSON.stringify(objCombineData)).then(function (datareturn) {
                                                          templateObject.resetData(objCombineData);
                                                          $(".fullScreenSpin").css("display", "none");
                                                        }).catch(function (err) {
                                                          $(".fullScreenSpin").css("display", "none");
                                                        });
                                                    }
                                                }).catch(function (err) {});

                                              }).catch(function(err) {
                                                  $(".fullScreenSpin").css("display", "none");
                                              });
                                             });
                                          setTimeout(function() {
                                              MakeNegative();
                                          }, 100);
                                      },
                                      language: { search: "",searchPlaceholder: "Search List..." },
                                      fnInitComplete: function() {
                                        let urlParametersPage = FlowRouter.current().queryParams.page;
                                        if (urlParametersPage) {
                                          this.fnPageChange("last");
                                        };
                                          $("<button class='btn btn-primary btnRefreshProduct' type='button' id='btnRefreshProduct' style='padding: 4px 10px; font-size: 16px; margin-left: 14px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>"
                                          ).insertAfter("#tblInventoryOverview_filter");
                                      },
                                      "fnInfoCallback": function (oSettings, iStart, iEnd, iMax, iTotal, sPre) {
                                        let countTableData = data.Params.Count || 0; //get count from API data

                                          return 'Showing '+ iStart + " to " + iEnd + " of " + countTableData;
                                      },
                                  }).on("length.dt", function(e, settings, len) {
                                      $(".fullScreenSpin").css("display", "inline-block");
                                      let dataLenght = settings._iDisplayLength;
                                      // splashArrayProductList = [];
                                      if (dataLenght == -1) {
                                          $(".fullScreenSpin").css("display", "none");
                                      } else {
                                          if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
                                              $(".fullScreenSpin").css("display", "none");
                                          } else {
                                              $(".fullScreenSpin").css("display", "none");
                                          }
                                      }
                                  });

                                $(".fullScreenSpin").css("display", "none");
                                $("div.dataTables_filter input").addClass(
                                    "form-control form-control-sm"
                                );
                            }, 0);
                        }).catch(function(err) {
                            // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                            $(".fullScreenSpin").css("display", "none");
                            // Meteor._reload.reload();
                        });
                } else {
                    let data = JSON.parse(dataObject[0].data);
                    let useData = data.tproductlist;
                    let lineItems = [];
                    let lineItemObj = {};
                    let departmentData = "";
                    let departmentDataLoad = "";
                    let prodQtyData = 0;
                    let prodQtyDataLoad = 0;
                    let deptStatus = "";
                    let checkIfSerialorLot = '';


                    //let getDepartmentData = templateObject.productdeptrecords.get();
                    // var dataList = {};
                    //if((deptname == 'undefined') || (deptname == 'All')){
                    departmentData = "All";
                for (let i = 0; i < data.tproductlist.length; i++) {
                  let availableQty = data.tproductlist[i].AvailableQty||0;
                  let onBOOrder = 0;
                  if(data.tproductlist[i].SNTracking == true){
                    checkIfSerialorLot = '<i class="fas fa-plus-square text-success btnSNTracking"  style="font-size: 22px;" ></i>';
                  }else if(data.tproductlist[i].batch == true){
                    checkIfSerialorLot = '<i class="fas fa-plus-square text-success btnBatch"  style="font-size: 22px;" ></i>';
                  }else{
                    checkIfSerialorLot = '<i class="fas fa-plus-square text-success btnNoBatchorSerial"  style="font-size: 22px;" ></i>';
                  }

                   onBOOrder = data.tproductlist[i].TotalQtyInStock - availableQty;
                    var dataList = [
                        data.tproductlist[i].PARTSID || "",
                        data.tproductlist[i].PARTNAME || "-",
                        data.tproductlist[i].PARTSDESCRIPTION || "",
                        availableQty,
                        data.tproductlist[i].SOBOQty||0,
                        data.tproductlist[i].POBOQty||0,
                        data.tproductlist[i].InstockQty,
                        data.tproductlist[i].AllocatedBOQty,
                        utilityService.modifynegativeCurrencyFormat(Math.floor(data.tproductlist[i].COST1 * 100) / 100),
                        utilityService.modifynegativeCurrencyFormat(Math.floor(data.tproductlist[i].COSTINC1 * 100) /100),
                        utilityService.modifynegativeCurrencyFormat(Math.floor(data.tproductlist[i].PRICE1 * 100) / 100),
                        utilityService.modifynegativeCurrencyFormat(Math.floor(data.tproductlist[i].PRICEINC1 * 100) /100),
                        checkIfSerialorLot||'',
                        data.tproductlist[i].BARCODE || "",
                        departmentData,
                        data.tproductlist[i].PURCHASEDESC || "",
                        data.tproductlist[i].CUSTFLD1 || "",
                        data.tproductlist[i].CUSTFLD2 || "",
                    ];
                    splashArrayProductList.push(dataList);
                    dataTableList.push(dataList);
                }

                    templateObject.datatablerecords.set(dataTableList);
                    // templateObject.datatablebackuprecords.set(dataTableList);

                    // Session.set('VS1ProductList', splashArrayProd);

                    if (templateObject.datatablerecords.get()) {

                        setTimeout(function() {
                            MakeNegative();
                        }, 100);
                    }

                    $(".fullScreenSpin").css("display", "none");
                    setTimeout(function() {
                        let columnData = [];
                        let displayfields = templateObject.displayfields.get();
                        if( displayfields.length > 0 ){
                            displayfields.forEach(function( item ){
                                columnData.push({
                                    className: ( item.active )? item.class : `col${item.class} hiddenColumn`,
                                    targets: [item.id],
                                })
                            });
                        }
                        $("#tblInventoryOverview").dataTable({
                                data: splashArrayProductList,
                                sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                                columnDefs: columnData,
                                select: true,
                                destroy: true,
                                colReorder: true,
                                buttons: [{
                                        extend: "excelHtml5",
                                        text: "",
                                        download: "open",
                                        className: "btntabletocsv hiddenColumn",
                                        filename: "inventory_" + moment().format(),
                                        orientation: "portrait",
                                        exportOptions: {
                                            columns: ":visible",
                                        },
                                    },
                                    {
                                        extend: "print",
                                        download: "open",
                                        className: "btntabletopdf hiddenColumn",
                                        text: "",
                                        title: "Inventory List",
                                        filename: "inventory_" + moment().format(),
                                        exportOptions: {
                                            columns: ":visible",
                                        },
                                    },
                                ],
                                // bStateSave: true,
                                // rowId: 0,
                                // paging: false,
                                // "scrollY": "800px",
                                // "scrollCollapse": true,
                                pageLength: initialBaseDataLoad,
                                lengthMenu: [
                                    [initialBaseDataLoad, -1],
                                    [initialBaseDataLoad, "All"],
                                ],
                                info: true,
                                responsive: true,
                                order: [
                                    [0, "asc"]
                                ],
                                action: function() {
                                    $("#tblInventoryOverview").DataTable().ajax.reload();
                                },
                                fnDrawCallback: function(oSettings) {
                                    $(".paginate_button.page-item").removeClass("disabled");
                                    $("#tblInventoryOverview_ellipsis").addClass("disabled");
                                    if (oSettings._iDisplayLength == -1) {
                                        if (oSettings.fnRecordsDisplay() > 150) {}
                                        $(".fullScreenSpin").css("display", "inline-block");
                                        setTimeout(function() {
                                            $(".fullScreenSpin").css("display", "none");
                                        }, 100);
                                    } else {}
                                    if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                                        $(".paginate_button.page-item.next").addClass("disabled");
                                    }

                                    $(".paginate_button.next:not(.disabled)",this.api().table().container()).on("click", function() {
                                        $(".fullScreenSpin").css("display", "inline-block");
                                        let dataLenght = oSettings._iDisplayLength;
                                        let customerSearch = $("#tblInventoryOverview_filter input").val();
                                        sideBarService.getProductListVS1(initialDatatableLoad,oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
                                          getVS1Data("TProductList").then(function (dataObjectold) {
                                              if (dataObjectold.length == 0) {
                                              } else {
                                                let dataOld = JSON.parse(dataObjectold[0].data);

                                                var thirdaryData = $.merge($.merge([],dataObjectnew.tproductlist),dataOld.tproductlist);
                                                let objCombineData = {
                                                  Params: dataOld.Params,
                                                  tproductlist: thirdaryData,
                                                };

                                                addVS1Data("TProductList",JSON.stringify(objCombineData)).then(function (datareturn) {
                                                    templateObject.resetData(objCombineData);
                                                    $(".fullScreenSpin").css("display", "none");
                                                  }).catch(function (err) {
                                                    $(".fullScreenSpin").css("display", "none");
                                                  });
                                              }
                                          }).catch(function (err) {});

                                        }).catch(function(err) {
                                            $(".fullScreenSpin").css("display", "none");
                                        });
                                    });
                                    setTimeout(function() {
                                        MakeNegative();
                                    }, 100);
                                },
                                language: { search: "",searchPlaceholder: "Search List..." },
                                fnInitComplete: function() {
                                  let urlParametersPage = FlowRouter.current().queryParams.page;
                                  if (urlParametersPage) {
                                    this.fnPageChange("last");
                                  };
                                    $("<button class='btn btn-primary btnRefreshProduct' type='button' id='btnRefreshProduct' style='padding: 4px 10px; font-size: 16px; margin-left: 14px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>"
                                    ).insertAfter("#tblInventoryOverview_filter");
                                },
                                "fnInfoCallback": function (oSettings, iStart, iEnd, iMax, iTotal, sPre) {
                                  let countTableData = data.Params.Count || 0; //get count from API data

                                    return 'Showing '+ iStart + " to " + iEnd + " of " + countTableData;
                                },
                            }).on("length.dt", function(e, settings, len) {
                                $(".fullScreenSpin").css("display", "inline-block");
                                let dataLenght = settings._iDisplayLength;
                                // splashArrayProductList = [];
                                if (dataLenght == -1) {
                                    $(".fullScreenSpin").css("display", "none");
                                } else {
                                    if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
                                        $(".fullScreenSpin").css("display", "none");
                                    } else {
                                        $(".fullScreenSpin").css("display", "none");
                                    }
                                }
                            });

                        $(".fullScreenSpin").css("display", "none");
                        $("div.dataTables_filter input").addClass(
                            "form-control form-control-sm"
                        );
                    }, 0);
                }
            }).catch(function(err) {
                sideBarService.getProductListVS1(initialBaseDataLoad, 0).then(function(data) {
                        addVS1Data("TProductList", JSON.stringify(data));
                        // addVS1Data('TProductVS1',JSON.stringify(data));
                        //localStorage.setItem('VS1ProductList', JSON.stringify(data)||'');
                        let lineItems = [];
                        let lineItemObj = {};
                        let departmentData = "";
                        let departmentDataLoad = "";
                        let prodQtyData = 0;
                        let prodQtyDataLoad = 0;
                        let deptStatus = "";
                        let checkIfSerialorLot = '';
                        //let getDepartmentData = templateObject.productdeptrecords.get();
                        var dataList = {};
                        //if((deptname == 'undefined') || (deptname == 'All')){
                        departmentData = "All";
                        for (let i = 0; i < data.tproductlist.length; i++) {
                      let availableQty = data.tproductlist[i].AvailableQty||0;
                      let onBOOrder = 0;
                      if(data.tproductlist[i].SNTracking == true){
                        checkIfSerialorLot = '<i class="fas fa-plus-square text-success btnSNTracking"  style="font-size: 22px;" ></i>';
                      }else if(data.tproductlist[i].batch == true){
                        checkIfSerialorLot = '<i class="fas fa-plus-square text-success btnBatch"  style="font-size: 22px;" ></i>';
                      }else{
                        checkIfSerialorLot = '<i class="fas fa-plus-square text-success btnNoBatchorSerial"  style="font-size: 22px;" ></i>';
                      }

                       onBOOrder = data.tproductlist[i].TotalQtyInStock - availableQty;
                        var dataList = [
                            data.tproductlist[i].PARTSID || "",
                            data.tproductlist[i].PARTNAME || "-",
                            data.tproductlist[i].PARTSDESCRIPTION || "",
                            availableQty,
                            data.tproductlist[i].SOBOQty||0,
                            data.tproductlist[i].POBOQty||0,
                            data.tproductlist[i].InstockQty,
                            data.tproductlist[i].AllocatedBOQty,
                            utilityService.modifynegativeCurrencyFormat(Math.floor(data.tproductlist[i].COST1 * 100) / 100),
                            utilityService.modifynegativeCurrencyFormat(Math.floor(data.tproductlist[i].COSTINC1 * 100) /100),
                            utilityService.modifynegativeCurrencyFormat(Math.floor(data.tproductlist[i].PRICE1 * 100) / 100),
                            utilityService.modifynegativeCurrencyFormat(Math.floor(data.tproductlist[i].PRICEINC1 * 100) /100),
                            checkIfSerialorLot||'',
                            data.tproductlist[i].BARCODE || "",
                            departmentData,
                            data.tproductlist[i].PURCHASEDESC || "",
                            data.tproductlist[i].CUSTFLD1 || "",
                            data.tproductlist[i].CUSTFLD2 || "",
                        ];
                        splashArrayProductList.push(dataList);
                        dataTableList.push(dataList);
                    }

                        templateObject.datatablerecords.set(dataTableList);
                        templateObject.datatablebackuprecords.set(dataTableList);


                        // Session.set('VS1ProductList', splashArrayProd);

                        if (templateObject.datatablerecords.get()) {
                            setTimeout(function() {
                                MakeNegative();
                            }, 100);
                        }

                        $(".fullScreenSpin").css("display", "none");
                        setTimeout(function() {
                            let columnData = [];
                            let displayfields = templateObject.displayfields.get();
                            if( displayfields.length > 0 ){
                                displayfields.forEach(function( item ){
                                    columnData.push({
                                        className: ( item.active )? item.class : `col${item.class} hiddenColumn`,
                                        targets: [item.id],
                                    })
                                });
                            }
                            $("#tblInventoryOverview").dataTable({
                                  data: splashArrayProductList,
                                  sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                                  columnDefs: columnData,
                                  select: true,
                                  destroy: true,
                                  colReorder: true,
                                  buttons: [{
                                          extend: "excelHtml5",
                                          text: "",
                                          download: "open",
                                          className: "btntabletocsv hiddenColumn",
                                          filename: "inventory_" + moment().format(),
                                          orientation: "portrait",
                                          exportOptions: {
                                              columns: ":visible",
                                          },
                                      },
                                      {
                                          extend: "print",
                                          download: "open",
                                          className: "btntabletopdf hiddenColumn",
                                          text: "",
                                          title: "Inventory List",
                                          filename: "inventory_" + moment().format(),
                                          exportOptions: {
                                              columns: ":visible",
                                          },
                                      },
                                  ],
                                  // bStateSave: true,
                                  // rowId: 0,
                                  // paging: false,
                                  // "scrollY": "800px",
                                  // "scrollCollapse": true,
                                  pageLength: initialBaseDataLoad,
                                  lengthMenu: [
                                      [initialBaseDataLoad, -1],
                                      [initialBaseDataLoad, "All"],
                                  ],
                                  info: true,
                                  responsive: true,
                                  order: [
                                      [0, "asc"]
                                  ],
                                  action: function() {
                                      $("#tblInventoryOverview").DataTable().ajax.reload();
                                  },
                                  fnDrawCallback: function(oSettings) {
                                      $(".paginate_button.page-item").removeClass("disabled");
                                      $("#tblInventoryOverview_ellipsis").addClass("disabled");
                                      if (oSettings._iDisplayLength == -1) {
                                          if (oSettings.fnRecordsDisplay() > 150) {}
                                          $(".fullScreenSpin").css("display", "inline-block");
                                          setTimeout(function() {
                                              $(".fullScreenSpin").css("display", "none");
                                          }, 100);
                                      } else {}
                                      if (oSettings.fnRecordsDisplay() < initialDatatableLoad) {
                                          $(".paginate_button.page-item.next").addClass("disabled");
                                      }

                                      $(".paginate_button.next:not(.disabled)",this.api().table().container()).on("click", function() {
                                          $(".fullScreenSpin").css("display", "inline-block");
                                          let dataLenght = oSettings._iDisplayLength;
                                          let customerSearch = $("#tblInventoryOverview_filter input").val();
                                          sideBarService.getProductListVS1(initialDatatableLoad,oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
                                            getVS1Data("TProductList").then(function (dataObjectold) {
                                                if (dataObjectold.length == 0) {
                                                } else {
                                                  let dataOld = JSON.parse(dataObjectold[0].data);

                                                  var thirdaryData = $.merge($.merge([],dataObjectnew.tproductlist),dataOld.tproductlist);
                                                  let objCombineData = {
                                                    Params: dataOld.Params,
                                                    tproductlist: thirdaryData,
                                                  };

                                                  addVS1Data("TProductList",JSON.stringify(objCombineData)).then(function (datareturn) {
                                                      templateObject.resetData(objCombineData);
                                                      $(".fullScreenSpin").css("display", "none");
                                                    }).catch(function (err) {
                                                      $(".fullScreenSpin").css("display", "none");
                                                    });
                                                }
                                            }).catch(function (err) {});

                                          }).catch(function(err) {
                                              $(".fullScreenSpin").css("display", "none");
                                          });
                                      });
                                      setTimeout(function() {
                                          MakeNegative();
                                      }, 100);
                                  },
                                  language: { search: "",searchPlaceholder: "Search List..." },
                                  fnInitComplete: function() {
                                    let urlParametersPage = FlowRouter.current().queryParams.page;
                                    if (urlParametersPage) {
                                      this.fnPageChange("last");
                                    };
                                      $("<button class='btn btn-primary btnRefreshProduct' type='button' id='btnRefreshProduct' style='padding: 4px 10px; font-size: 16px; margin-left: 14px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblInventoryOverview_filter");
                                  },
                                  "fnInfoCallback": function (oSettings, iStart, iEnd, iMax, iTotal, sPre) {
                                    let countTableData = data.Params.Count || 0; //get count from API data

                                      return 'Showing '+ iStart + " to " + iEnd + " of " + countTableData;
                                  },
                              }).on("length.dt", function(e, settings, len) {
                                  $(".fullScreenSpin").css("display", "inline-block");
                                  let dataLenght = settings._iDisplayLength;
                                  // splashArrayProductList = [];
                                  if (dataLenght == -1) {
                                      $(".fullScreenSpin").css("display", "none");
                                  } else {
                                      if (settings.fnRecordsDisplay() >= settings._iDisplayLength) {
                                          $(".fullScreenSpin").css("display", "none");
                                      } else {
                                          $(".fullScreenSpin").css("display", "none");
                                      }
                                  }
                              });

                            $(".fullScreenSpin").css("display", "none");
                            $("div.dataTables_filter input").addClass(
                                "form-control form-control-sm"
                            );
                        }, 0);
                }).catch(function(err) {
                    // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                    $(".fullScreenSpin").css("display", "none");
                    // Meteor._reload.reload();
                });
            });
    };

    $("#tblInventoryOverview tbody").on("click", "td:not(.colAvailable, .colOnSO, .colOnBO, .colInStock, .colOnOrder, .colQuantity, .colSerialNo)", function() {
        var listData = $(this).closest("tr").find(".colProductID").text();
        if (listData) {
            //FlowRouter.go('/productview?id=' + listData);
            FlowRouter.go("/productview?id=" + listData);
        }
    });

    $("#tblInventoryOverview tbody").on("click", "td.colAvailable", function() {
        var listData = $(this).closest("tr").find(".colProductID").text();
        if (listData) {
            FlowRouter.go("/stockmovementreport?id=" + listData);
            // Filter the stock movement report based on product ID
        }
    });

    $("#tblInventoryOverview tbody").on("click", "td.colInStock", function() {
        var listData = $(this).closest("tr").find(".colProductID").text();
        if (listData) {
            FlowRouter.go("/stockmovementreport?id=" + listData);
            // Filter the stock movement report based on product ID
        }
    });

    $("#tblInventoryOverview tbody").on("click", "td.colOnBO", function() {
        var listData = $(this).closest("tr").find(".colProductID").text();
        var listProductName = $(this).closest("tr").find(".colProductName").text();
        if (listData) {
            $('#onBackOrderPopUp').modal("show");
            $(".productNameOnBo").text(listProductName);
        }
    });

    $("#tblInventoryOverview tbody").on("click", "td.colOnSO", function() {
        var listData = $(this).closest("tr").find(".colProductID").text();
        var listProductName = $(this).closest("tr").find(".colProductName").text();
        if (listData) {
            $('#onSalesOrderPopUp').modal("show");
            $(".productNameOnSO").text(listProductName);
        }
    });

    $("#tblInventoryOverview tbody").on("click", "td.colOnOrder", function() {
        var listData = $(this).closest("tr").find(".colProductID").text();
        var listProductName = $(this).closest("tr").find(".colProductName").text();
        if (listData) {
            $('#onOrderPopUp').modal("show");
            $(".productNameOnOrder").text(listProductName);
        }
    });

    $("#tblInventoryOverview tbody").on("click", "td.colQuantity", function() {
        var listData = $(this).closest("tr").find(".colProductID").text();
        if (listData) {
            FlowRouter.go("/productview?id=" + listData + "&instock=true");
        }
    });

    $("#tblInventoryOverview tbody").on("click", "td.colSerialNo .btnNoBatchorSerial", function() {
        var listData = $(this).closest("tr").find(".colProductID").text();
        var selectedProductName = $(this).closest("tr").find(".colProductName").text();
        if (listData) {
           swal('', 'The product ' + selectedProductName + ' does not track Lot Number, Bin Location or Serial Number', 'info');
        }
    });

    $("#tblInventoryOverview tbody").on("click", "td.colSerialNo .btnBatch", function() {
        var listData = $(this).closest("tr").find(".colProductID").text();
        if (listData) {
            FlowRouter.go("/lotnumberlist?id=" + listData);
        }
    });

    $("#tblInventoryOverview tbody").on("click", "td.colSerialNo .btnSNTracking", function() {
        var listData = $(this).closest("tr").find(".colProductID").text();
        if (listData) {
            FlowRouter.go("/serialnumberlist?id=" + listData);
        }
    });

    templateObject.getDepartments = function() {
        getVS1Data("TDeptClass")
            .then(function(dataObject) {
                if (dataObject.length == 0) {
                    productService.getDepartment().then(function(data) {
                        //let deptArr = [];
                        for (let i in data.tdeptclass) {
                            let deptrecordObj = {
                                id: data.tdeptclass[i].Id || " ",
                                department: data.tdeptclass[i].DeptClassName || " ",
                            };
                            //deptArr.push(data.tdeptclass[i].DeptClassName);
                            deptrecords.push(deptrecordObj);
                            templateObject.deptrecords.set(deptrecords);
                        }
                    });
                } else {
                    let data = JSON.parse(dataObject[0].data);
                    let useData = data.tdeptclass;
                    for (let i in useData) {
                        let deptrecordObj = {
                            id: useData[i].Id || " ",
                            department: useData[i].DeptClassName || " ",
                        };
                        //deptArr.push(data.tdeptclass[i].DeptClassName);
                        deptrecords.push(deptrecordObj);
                        templateObject.deptrecords.set(deptrecords);
                    }
                }
            })
            .catch(function(err) {
                productService.getDepartment().then(function(data) {
                    //let deptArr = [];
                    for (let i in data.tdeptclass) {
                        let deptrecordObj = {
                            id: data.tdeptclass[i].Id || " ",
                            department: data.tdeptclass[i].DeptClassName || " ",
                        };
                        //deptArr.push(data.tdeptclass[i].DeptClassName);
                        deptrecords.push(deptrecordObj);
                        templateObject.deptrecords.set(deptrecords);
                    }
                });
            });
    };
    // templateObject.getAllProductData();
    templateObject.getDepartments();
    templateObject.getAllProductData("All");
    //templateObject.getAllProductClassDeptData();

    templateObject.getProductClassDeptData = function(deptname) {
        productService
            .getProductClassDataByDeptName(deptname)
            .then(function(data) {
                // $('.fullScreenSpin').css('display','none');
                let deptprodlineItems = [];
                let deptprodlineItemObj = {};

                for (let j in data.tproductvs1class) {
                    deptprodlineItemObj = {
                        department: data.tproductvs1class[j].DeptName || "",
                        productid: data.tproductvs1class[j].ProductID || 0,
                    };
                    // totaldeptquantity += data.tproductvs1class[j].InStockQty;
                    deptprodlineItems.push(deptprodlineItemObj);
                    splashArrayProdDept.push(deptprodlineItemObj);
                }
                // $('#edttotalqtyinstock').val(totaldeptquantity);
                // templateObject.productdeptrecords.set(deptprodlineItems);

                // templateObject.totaldeptquantity.set(totaldeptquantity);
            })
            .catch(function(err) {
                swal({
                    title: "Oooops...",
                    text: err,
                    type: "error",
                    showCancelButton: false,
                    confirmButtonText: "Try Again",
                }).then((result) => {
                    if (result.value) {
                        Meteor._reload.reload();
                    } else if (result.dismiss === "cancel") {}
                });
                $(".fullScreenSpin").css("display", "none");
            });
    };

    templateObject.getAccountNames = function() {
        productService.getAccountName().then(function(data) {
            // let productData = templateObject.records.get();
            for (let i in data.taccount) {
                let accountnamerecordObj = {
                    accountname: data.taccount[i].AccountName || " ",
                };

                if (data.taccount[i].AccountTypeName == "COGS") {
                    coggsaccountrecords.push(accountnamerecordObj);
                    templateObject.coggsaccountrecords.set(coggsaccountrecords);
                }
                if (data.taccount[i].AccountTypeName == "INC") {
                    salesaccountrecords.push(accountnamerecordObj);
                    templateObject.salesaccountrecords.set(salesaccountrecords);
                }
            }
        });
    };

    templateObject.getAllTaxCodes = function() {
        productService.getTaxCodes().then(function(data) {
            for (let i = 0; i < data.ttaxcodevs1.length; i++) {
                let taxcoderecordObj = {
                    codename: data.ttaxcodevs1[i].CodeName || " ",
                    coderate: data.ttaxcodevs1[i].Rate || " ",
                };

                taxCodesList.push(taxcoderecordObj);
            }
            templateObject.taxraterecords.set(taxCodesList);
        });
    };
    templateObject.checkSetupWizardFinished = async function () {
        let setupFinished = localStorage.getItem("IS_SETUP_FINISHED") || "";
        if( setupFinished === null || setupFinished ===  "" ){
            let setupInfo = await organisationService.getSetupInfo();
            if( setupInfo.tcompanyinfo.length > 0 ){
                let data = setupInfo.tcompanyinfo[0];
                localStorage.setItem("IS_SETUP_FINISHED", data.IsSetUpWizard)
                templateObject.setupFinished.set(data.IsSetUpWizard)
            }
        }else{
            templateObject.setupFinished.set(setupFinished)
        }
    }
    templateObject.checkSetupWizardFinished();
    // templateObject.getAccountNames();
    // templateObject.getAllTaxCodes();
    tableResize();
});

Template.inventorylist.helpers({
    deptrecords: () => {
        return Template.instance()
            .deptrecords.get()
            .sort(function(a, b) {
                if (a.department == "NA") {
                    return 1;
                } else if (b.department == "NA") {
                    return -1;
                }
                return a.department.toUpperCase() > b.department.toUpperCase() ? 1 : -1;
            });
    },
    datatablerecords: () => {
      return Template.instance().datatablerecords.get();

        return Template.instance()
            .datatablerecords.get()
            .sort(function(a, b) {
                if (a.productname == "NA") {
                    return 1;
                } else if (b.productname == "NA") {
                    return -1;
                }
                return a.productname.toUpperCase() > b.productname.toUpperCase() ?
                    1 :
                    -1;
            });
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    salesCloudPreferenceRec: () => {
        return CloudPreference.findOne({
            userid: Session.get("mycloudLogonID"),
            PrefName: "tblInventoryOverview",
        });
    },
    productsCloudPreferenceRec: () => {
        return CloudPreference.findOne({
            userid: Session.get("mycloudLogonID"),
            PrefName: "productview",
        });
    },
    taxraterecords: () => {
        return Template.instance().taxraterecords.get();
    },
    coggsaccountrecords: () => {
        return Template.instance().coggsaccountrecords.get();
    },
    salesaccountrecords: () => {
        return Template.instance().salesaccountrecords.get();
    },
    loggedCompany: () => {
        return localStorage.getItem("mySession") || "";
    },
    includeStockTransfer: () => {
        return Template.instance().includeStockTransfer.get();
    },
    includeStockAdjustment: () => {
        return Template.instance().includeStockAdjustment.get();
    },
    isSNTrackchecked: () => {
        return Template.instance().isSNTrackchecked.get();
    },
    isProductList: () => {
      return Template.instance().isProductList.get();
    },
    isNewProduct: () => {
      return Template.instance().isNewProduct.get();
    },
    isNewStockTransfer: () => {
      return Template.instance().isNewStockTransfer.get();
    },
    isExportProduct: () => {
      return Template.instance().isExportProduct.get();
    },
    isImportProduct: () => {
      return Template.instance().isImportProduct.get();
    },
    isStockonHandDemandChart: () => {
      return Template.instance().isStockonHandDemandChart.get();
    },

    // custom field displaysettings
    displayfields: () => {
      return Template.instance().displayfields.get();
    },
    isSetupFinished: () => {
        return Template.instance().setupFinished.get();
    },
    getSkippedSteps() {
        let setupUrl = localStorage.getItem("VS1Cloud_SETUP_SKIPPED_STEP") || JSON.stringify().split();
        return setupUrl[1];
    }
});

Template.inventorylist.events({
    "click .chkDatatable": function(event) {
        var columns = $("#tblInventoryOverview th");
        let columnDataValue = $(event.target)
            .closest("div")
            .find(".divcolumn")
            .text();

        $.each(columns, function(i, v) {
            let className = v.classList;
            let replaceClass = className[1];

            if (v.innerText == columnDataValue) {
                if ($(event.target).is(":checked")) {
                    $("." + replaceClass + "").css("display", "table-cell");
                    $("." + replaceClass + "").css("padding", ".75rem");
                    $("." + replaceClass + "").css("vertical-align", "top");
                } else {
                    $("." + replaceClass + "").css("display", "none");
                }
            }
        });
    },
    "click .resetTable": function(event) {
      let templateObject = Template.instance();
      let reset_data = templateObject.reset_data.get();
      let isSNTrackchecked = localStorage.getItem('vs1cloudlicenselevel') == 'PLUS' || false;
      if(isSNTrackchecked) {
        reset_data[12].display = true;
      } else {
        reset_data[12].display = false;
      }
      reset_data = reset_data.filter(redata => redata.display);

      $(".displaySettings").each(function (index) {
        let $tblrow = $(this);
        $tblrow.find(".divcolumn").text(reset_data[index].label);
        $tblrow
          .find(".custom-control-input")
          .prop("checked", reset_data[index].active);

        let title = $("#tblInventoryOverview").find("th").eq(index);
        if(reset_data[index].class === 'CostPrice' || reset_data[index].class === 'SalePrice') {
          $(title).html(reset_data[index].label + `<i class="fas fa-random fa-trans"></i>`);
        } else if( reset_data[index].class === 'CostPriceInc' || reset_data[index].class === 'SalePriceInc') {
          $(title).html(reset_data[index].label + `<i class="fas fa-random"></i>`);
        } else {
          $(title).html(reset_data[index].label);
        }

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

      try {
        let erpGet = erpDb();
        let tableName = "tblInventoryOverview";
        let employeeId = parseInt(Session.get('mySessionEmployeeLoggedID'))||0;
        let added = await sideBarService.saveNewCustomFields(erpGet, tableName, employeeId, lineItems);
        if(added) {
          sideBarService.getNewCustomFieldsWithQuery(parseInt(Session.get('mySessionEmployeeLoggedID')),'').then(function (dataCustomize) {
              $(".fullScreenSpin").css("display", "none");
              addVS1Data('VS1_Customize', JSON.stringify(dataCustomize));
              swal({
                title: 'SUCCESS',
                text: "Display settings is updated!",
                type: 'success',
                showCancelButton: false,
                confirmButtonText: 'OK'
              }).then((result) => {
                  if (result.value) {
                     $('#myInventoryModal').modal('hide');
                     Meteor._reload.reload();
                  }
              });
          });
        } else {
          swal("Something went wrong!", "", "error");
        }
      } catch (error) {
        $(".fullScreenSpin").css("display", "none");
        swal("Something went wrong!", "", "error");
      }
    },
    "blur .divcolumn": function(event) {
        let columData = $(event.target).html();
        let columHeaderUpdate = $(event.target).attr("valueupdate");
        $("th.col" + columHeaderUpdate + "").html(columData);
    },


    'click .chkProductID': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colProductID').addClass('showColumn');
        $('.colProductID').removeClass('hiddenColumn');
      } else {
        $('.colProductID').addClass('hiddenColumn');
        $('.colProductID').removeClass('showColumn');
      }
    },
    'click .chkProductName': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colProductName').addClass('showColumn');
        $('.colProductName').removeClass('hiddenColumn');
      } else {
        $('.colProductName').addClass('hiddenColumn');
        $('.colProductName').removeClass('showColumn');
      }
    },
    'click .chkSalesDescription': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colSalesDescription').addClass('showColumn');
        $('.colSalesDescription').removeClass('hiddenColumn');
      } else {
        $('.colSalesDescription').addClass('hiddenColumn');
        $('.colSalesDescription').removeClass('showColumn');
      }
    },
    'click .chkAvailable': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colAvailable').addClass('showColumn');
        $('.colAvailable').removeClass('hiddenColumn');
      } else {
        $('.colAvailable').addClass('hiddenColumn');
        $('.colAvailable').removeClass('showColumn');
      }
    },
    'click .chkOnSO': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colOnSO').addClass('showColumn');
        $('.colOnSO').removeClass('hiddenColumn');
      } else {
        $('.colOnSO').addClass('hiddenColumn');
        $('.colOnSO').removeClass('showColumn');
      }
    },
    'click .chkOnBO': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colOnBO').addClass('showColumn');
        $('.colOnBO').removeClass('hiddenColumn');
      } else {
        $('.colOnBO').addClass('hiddenColumn');
        $('.colOnBO').removeClass('showColumn');
      }
    },
    'click .chkInStock': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colInStock').addClass('showColumn');
        $('.colInStock').removeClass('hiddenColumn');
      } else {
        $('.colInStock').addClass('hiddenColumn');
        $('.colInStock').removeClass('showColumn');
      }
    },
    'click .chkOnOrder': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colOnOrder').addClass('showColumn');
        $('.colOnOrder').removeClass('hiddenColumn');
      } else {
        $('.colOnOrder').addClass('hiddenColumn');
        $('.colOnOrder').removeClass('showColumn');
      }
    },
    'click .chkSerialNo': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colSerialNo').addClass('showColumn');
        $('.colSerialNo').removeClass('hiddenColumn');
      } else {
        $('.colSerialNo').addClass('hiddenColumn');
        $('.colSerialNo').removeClass('showColumn');
      }
    },
    'click .chkBarcode': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colBarcode').addClass('showColumn');
        $('.colBarcode').removeClass('hiddenColumn');
      } else {
        $('.colBarcode').addClass('hiddenColumn');
        $('.colBarcode').removeClass('showColumn');
      }
    },
    'click .chkDepartmentth': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colDepartmentth').addClass('showColumn');
        $('.colDepartmentth').removeClass('hiddenColumn');
      } else {
        $('.colDepartmentth').addClass('hiddenColumn');
        $('.colDepartmentth').removeClass('showColumn');
      }
    },
    'click .chkPurchaseDescription': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colPurchaseDescription').addClass('showColumn');
        $('.colPurchaseDescription').removeClass('hiddenColumn');
      } else {
        $('.colPurchaseDescription').addClass('hiddenColumn');
        $('.colPurchaseDescription').removeClass('showColumn');
      }
    },
    'click .chkProdCustField1': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colProdCustField1').addClass('showColumn');
        $('.colProdCustField1').removeClass('hiddenColumn');
      } else {
        $('.colProdCustField1').addClass('hiddenColumn');
        $('.colProdCustField1').removeClass('showColumn');
      }
    },
    'click .chkProdCustField2': function(event) {
      if ($(event.target).is(':checked')) {
        $('.colProdCustField2').addClass('showColumn');
        $('.colProdCustField2').removeClass('hiddenColumn');
      } else {
        $('.colProdCustField2').addClass('hiddenColumn');
        $('.colProdCustField2').removeClass('showColumn');
      }
    },


//   'click .chkCostPrice': function (event) {
//     if ($(event.target).is(':checked')) {
//         $('.chkCostPriceInc').prop("checked", false);

//         $('.colCostPriceInc').addClass('hiddenColumn');
//         $('.colCostPriceInc').removeClass('showColumn');

//         $('.colCostPrice').addClass('showColumn');
//         $('.colCostPrice').removeClass('hiddenColumn');
//       } else {
//         $('.chkCostPriceInc').prop("checked", true);

//         $('.colCostPrice').addClass('hiddenColumn');
//         $('.colCostPrice').removeClass('showColumn');

//         $('.colCostPriceInc').addClass('showColumn');
//         $('.colCostPriceInc').removeClass('hiddenColumn');
//     }
//   },
//   'click .chkCostPriceInc': function(event) {
//     if ($(event.target).is(':checked')) {
//         $('.chkCostPrice').prop("checked", false);

//         $('.colCostPrice').addClass('hiddenColumn');
//         $('.colCostPrice').removeClass('showColumn');

//         $('.colCostPriceInc').addClass('showColumn');
//         $('.colCostPriceInc').removeClass('hiddenColumn');
//     } else {
//         $('.chkCostPrice').prop("checked", true);

//         $('.colCostPriceInc').addClass('hiddenColumn');
//         $('.colCostPriceInc').removeClass('showColumn');

//         $('.colCostPrice').addClass('showColumn');
//         $('.colCostPrice').removeClass('hiddenColumn');
//     }
//   },

//   'click .chkSalePrice': function (event) {
//     if ($(event.target).is(':checked')) {
//         $('.chkSalePriceInc').prop("checked", false);

//         $('.colSalePriceInc').addClass('hiddenColumn');
//         $('.colSalePriceInc').removeClass('showColumn');

//         $('.colSalePrice').addClass('showColumn');
//         $('.colSalePrice').removeClass('hiddenColumn');

//     } else {
//         $('.chkSalePriceInc').prop("checked", true);

//         $('.colSalePrice').addClass('hiddenColumn');
//         $('.colSalePrice').removeClass('showColumn');

//         $('.colSalePriceInc').addClass('showColumn');
//         $('.colSalePriceInc').removeClass('hiddenColumn');
//     }
//   },
//   'click .chkSalePriceInc': function(event) {
//       if ($(event.target).is(':checked')) {
//         $('.chkSalePrice').prop("checked", false);

//         $('.colSalePrice').addClass('hiddenColumn');
//         $('.colSalePrice').removeClass('showColumn');

//         $('.colSalePriceInc').addClass('showColumn');
//         $('.colSalePriceInc').removeClass('hiddenColumn');
//       } else {
//         $('.chkSalePrice').prop("checked", true);

//         $('.colSalePriceInc').addClass('hiddenColumn');
//         $('.colSalePriceInc').removeClass('showColumn');

//         $('.colSalePrice').addClass('showColumn');
//         $('.colSalePrice').removeClass('hiddenColumn');
//       }
//   },
    // display settings


    'change .rngRangeProductID': function(event) {
        let range = $(event.target).val();
        $('.colProductID').css('width', range);
    },
    'change .rngRangeProductName': function(event) {
      let range = $(event.target).val();
      $('.colProductName').css('width', range);
    },
    'change .rngRangeSalesDescription': function(event) {
      let range = $(event.target).val();
      $('.colSalesDescription').css('width', range);
    },
    'change .rngRangeAvailable': function(event) {
      let range = $(event.target).val();
      $('.colAvailable').css('width', range);
    },
    'change .rngRangeOnSO': function(event) {
      let range = $(event.target).val();
      $('.colOnSO').css('width', range);
    },
    'change .rngRangeOnBO': function(event) {
      let range = $(event.target).val();
      $('.colOnBO').css('width', range);
    },
    'change .rngRangeInStock': function(event) {
      let range = $(event.target).val();
      $('.colInStock').css('width', range);
    },
    'change .rngRangeOnOrder': function(event) {
      let range = $(event.target).val();
      $('.colOnOrder').css('width', range);
    },
    'change .rngRangeSerialNo': function(event) {
      let range = $(event.target).val();
      $('.colSerialNo').css('width', range);
    },
    'change .rngRangeBarcode': function(event) {
      let range = $(event.target).val();
      $('.colBarcode').css('width', range);
    },
    'change .rngRangeDepartment': function(event) {
      let range = $(event.target).val();
      $('.colDepartment').css('width', range);
    },
    'change .rngRangePurchaseDescription': function(event) {
      let range = $(event.target).val();
      $('.colPurchaseDescription').css('width', range);
    },
    'change .rngRangeCostPrice': function(event) {
      let range = $(event.target).val();
      $('.colCostPrice').css('width', range);
    },
    'change .rngRangeCostPriceInc': function(event) {
      let range = $(event.target).val();
      $('.colCostPriceInc').css('width', range);
    },
    'change .rngRangeSalePrice': function(event) {
      let range = $(event.target).val();
      $('.colSalePrice').css('width', range);
    },
    'change .rngRangeSalePriceInc': function(event) {
      let range = $(event.target).val();
      $('.colSalePriceInc').css('width', range);
    },

    'click .th.colCostPrice': function(event) {
      $('.colCostPrice').addClass('hiddenColumn');
      $('.colCostPrice').removeClass('showColumn');

      $('.colCostPriceInc').addClass('showColumn');
      $('.colCostPriceInc').removeClass('hiddenColumn');

      $('.chkCostPrice').prop("checked", false);
      $('.chkCostPriceInc').prop("checked", true);
  },
  'click .th.colCostPriceInc': function(event) {
      $('.colCostPriceInc').addClass('hiddenColumn');
      $('.colCostPriceInc').removeClass('showColumn');

      $('.colCostPrice').addClass('showColumn');
      $('.colCostPrice').removeClass('hiddenColumn');

      $('.chkCostPrice').prop("checked", true);
      $('.chkCostPriceInc').prop("checked", false);
  },
  'click .th.colSalePrice': function(event) {
      $('.colSalePrice').addClass('hiddenColumn');
      $('.colSalePrice').removeClass('showColumn');

      $('.colSalePriceInc').addClass('showColumn');
      $('.colSalePriceInc').removeClass('hiddenColumn');

      $('.chkSalePrice').prop("checked", false);
      $('.chkSalePriceInc').prop("checked", true);
  },
  'click .th.colSalePriceInc': function(event) {
      $('.colSalePriceInc').addClass('hiddenColumn');
      $('.colSalePriceInc').removeClass('showColumn');

      $('.colSalePrice').addClass('showColumn');
      $('.colSalePrice').removeClass('hiddenColumn');

      $('.chkSalePrice').prop("checked", true);
      $('.chkSalePriceInc').prop("checked", false);

  },


    "change .rngRange": function(event) {
        let range = $(event.target).val();
        $(event.target)
            .closest("div.divColWidth")
            .find(".spWidth")
            .html(range + "px");

        let columData = $(event.target)
            .closest("div.divColWidth")
            .find(".spWidth")
            .attr("value");
        let columnDataValue = $(event.target)
            .closest("div")
            .prev()
            .find(".divcolumn")
            .text();
        var datable = $("#tblInventoryOverview th");
        $.each(datable, function(i, v) {
            if (v.innerText == columnDataValue) {
                let className = v.className;
                let replaceClass = className.replace(/ /g, ".");
                $("." + replaceClass + "").css("width", range + "px");
            }
        });
    },
    "click .btnOpenSettings": function(event) {
        let templateObject = Template.instance();
        var columns = $("#tblInventoryOverview th");

        const tableHeaderList = [];
        let sTible = "";
        let sWidth = "";
        let sIndex = "";
        let sVisible = "";
        let columVisible = false;
        let sClass = "";
        $.each(columns, function(i, v) {
            if (v.hidden == false) {
                columVisible = true;
            }
            if (v.className.includes("hiddenColumn")) {
                columVisible = false;
            }
            sWidth = v.style.width.replace("px", "");

            let datatablerecordObj = {
                sTitle: v.innerText || "",
                sWidth: sWidth || "",
                sIndex: v.cellIndex || "",
                sVisible: columVisible || false,
                sClass: v.className || "",
            };
            tableHeaderList.push(datatablerecordObj);
        });
        templateObject.tableheaderrecords.set(tableHeaderList);
    },
    "keyup #tblInventoryOverview_filter input": function(event) {
        if ($(event.target).val() != "") {
            $(".btnRefreshProduct").addClass("btnSearchAlert");
        } else {
            $(".btnRefreshProduct").removeClass("btnSearchAlert");
        }
        if (event.keyCode == 13) {
            $(".btnRefreshProduct").trigger("click");
        }
    },
    "blur #tblInventoryOverview_filter input": function(event) {
        if ($(event.target).val() != "") {
            $(".btnRefreshProduct").addClass("btnSearchAlert");
        } else {
            $(".btnRefreshProduct").removeClass("btnSearchAlert");
        }
    },
    "click .btnRefreshProduct": function(event) {
        let templateObject = Template.instance();
        let utilityService = new UtilityService();
        let tableProductList;
        var splashArrayProductList = new Array();
        const lineExtaSellItems = [];
        let checkIfSerialorLot = '';
        const dataTableList = [];
        let tableHeaders = templateObject.displayfields.get();
        $(".fullScreenSpin").css("display", "inline-block");
        let dataSearchName = $("#tblInventoryOverview_filter input").val();
        if (dataSearchName.replace(/\s/g, "") != "") {
            sideBarService.getProductListVS1BySearch(dataSearchName).then(function(data) {
                    let records = [];

                    let inventoryData = [];
              if (data.tproductlist.length > 0) {
              for (let i = 0; i < data.tproductlist.length; i++) {
                let availableQty = data.tproductlist[i].AvailableQty||0;
                let onBOOrder = 0;
                if(data.tproductlist[i].SNTracking == true){
                  checkIfSerialorLot = '<i class="fas fa-plus-square text-success btnSNTracking"  style="font-size: 22px;" ></i>';
                }else if(data.tproductlist[i].batch == true){
                  checkIfSerialorLot = '<i class="fas fa-plus-square text-success btnBatch"  style="font-size: 22px;" ></i>';
                }else{
                  checkIfSerialorLot = '<i class="fas fa-plus-square text-success btnNoBatchorSerial"  style="font-size: 22px;" ></i>';
                }

                 onBOOrder = data.tproductlist[i].TotalQtyInStock - availableQty;
                  var dataList = [
                      data.tproductlist[i].PARTSID || "",
                      data.tproductlist[i].PARTNAME || "-",
                      data.tproductlist[i].PARTSDESCRIPTION || "",
                      availableQty,
                      data.tproductlist[i].SOBOQty||0,
                      data.tproductlist[i].POBOQty||0,
                      data.tproductlist[i].InstockQty,
                      data.tproductlist[i].AllocatedBOQty,
                      utilityService.modifynegativeCurrencyFormat(Math.floor(data.tproductlist[i].COST1 * 100) / 100),
                      utilityService.modifynegativeCurrencyFormat(Math.floor(data.tproductlist[i].COSTINC1 * 100) /100),
                      utilityService.modifynegativeCurrencyFormat(Math.floor(data.tproductlist[i].PRICE1 * 100) / 100),
                      utilityService.modifynegativeCurrencyFormat(Math.floor(data.tproductlist[i].PRICEINC1 * 100) /100),
                      checkIfSerialorLot||'',
                      data.tproductlist[i].BARCODE || "",
                      departmentData,
                      data.tproductlist[i].PURCHASEDESC || "",
                      data.tproductlist[i].CUSTFLD1 || "",
                      data.tproductlist[i].CUSTFLD2 || "",
                  ];
                  splashArrayProductList.push(dataList);
                  dataTableList.push(dataList);
              }
                        templateObject.datatablerecords.set(dataTableList);
                        //localStorage.setItem('VS1SalesProductList', JSON.stringify(splashArrayProductList));
                        $(".fullScreenSpin").css("display", "none");
                        if (splashArrayProductList) {
                          $('.resetTable').trigger('click');
                            var datatable = $("#tblInventoryOverview").DataTable();
                            datatable.clear();
                            datatable.rows.add(splashArrayProductList);
                            datatable.draw(false);
                        }
                    } else {
                        $(".fullScreenSpin").css("display", "none");

                        swal({
                            title: "Question",
                            text: "Product does not exist, would you like to create it?",
                            type: "question",
                            showCancelButton: true,
                            confirmButtonText: "Yes",
                            cancelButtonText: "No",
                        }).then((result) => {
                            if (result.value) {
                                FlowRouter.go("/productview");
                            } else if (result.dismiss === "cancel") {
                                //$('#productListModal').modal('toggle');
                            }
                        });
                    }
                }).catch(function(err) {
                    $(".fullScreenSpin").css("display", "none");
                });
        } else {
            $('.btnRefresh').trigger('click');
            // sideBarService.getProductListVS1(initialBaseDataLoad, 0).then(function(data) {
            //         let records = [];
            //         let inventoryData = [];
            //         for (let i = 0; i < data.tproductlist.length; i++) {
            //       let availableQty = data.tproductlist[i].AvailableQty||0;
            //       let onBOOrder = 0;
            //       if(data.tproductlist[i].SNTracking == true){
            //         checkIfSerialorLot = '<i class="fas fa-plus-square text-success btnSNTracking"  style="font-size: 22px;" ></i>';
            //       }else if(data.tproductlist[i].batch == true){
            //         checkIfSerialorLot = '<i class="fas fa-plus-square text-success btnBatch"  style="font-size: 22px;" ></i>';
            //       }else{
            //         checkIfSerialorLot = '<i class="fas fa-plus-square text-success btnNoBatchorSerial"  style="font-size: 22px;" ></i>';
            //       }
            //
            //        onBOOrder = data.tproductlist[i].TotalQtyInStock - availableQty;
            //         var dataList = [
            //             data.tproductlist[i].PARTSID || "",
            //             data.tproductlist[i].PARTNAME || "-",
            //             data.tproductlist[i].PARTSDESCRIPTION || "",
            //             availableQty,
            //             data.tproductlist[i].SOBOQty||0,
            //             data.tproductlist[i].POBOQty||0,
            //             data.tproductlist[i].InstockQty,
            //             data.tproductlist[i].AllocatedBOQty,
            //             utilityService.modifynegativeCurrencyFormat(Math.floor(data.tproductlist[i].COST1 * 100) / 100),
            //             utilityService.modifynegativeCurrencyFormat(Math.floor(data.tproductlist[i].COSTINC1 * 100) /100),
            //             utilityService.modifynegativeCurrencyFormat(Math.floor(data.tproductlist[i].PRICE1 * 100) / 100),
            //             utilityService.modifynegativeCurrencyFormat(Math.floor(data.tproductlist[i].PRICEINC1 * 100) /100),
            //             checkIfSerialorLot||'',
            //             data.tproductlist[i].BARCODE || "",
            //             "All",,
            //             data.tproductlist[i].PURCHASEDESC || "",
            //             data.tproductlist[i].CUSTFLD1 || "",
            //             data.tproductlist[i].CUSTFLD2 || "",
            //         ];
            //         splashArrayProductList.push(dataList);
            //         dataTableList.push(dataList);
            //     }
            //         //localStorage.setItem('VS1SalesProductList', JSON.stringify(splashArrayProductList));
            //         $(".fullScreenSpin").css("display", "none");
            //         if (splashArrayProductList) {
            //             var datatable = $("#tblInventoryOverview").DataTable();
            //             datatable.clear();
            //             datatable.rows.add(splashArrayProductList);
            //             datatable.draw(false);
            //         }
            //     }).catch(function(err) {
            //         $(".fullScreenSpin").css("display", "none");
            //     });
        }
    },
    "click .btnRefresh": function() {
        // localStorage.removeItem("VS1ProductList");
        // localStorage.setItem("VS1ProductList", '');
        //   Meteor._reload.reload();
        $(".fullScreenSpin").css("display", "inline-block");
        let templateObject = Template.instance();
        var currentBeginDate = new Date();
        var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
        let fromDateMonth = currentBeginDate.getMonth() + 1;
        let fromDateDay = currentBeginDate.getDate();
        if (currentBeginDate.getMonth() + 1 < 10) {
            fromDateMonth = "0" + (currentBeginDate.getMonth() + 1);
        } else {
            fromDateMonth = currentBeginDate.getMonth() + 1;
        }

        if (currentBeginDate.getDate() < 10) {
            fromDateDay = "0" + currentBeginDate.getDate();
        }
        var fromDate =
            currentBeginDate.getFullYear() + "-" + fromDateMonth + "-" + fromDateDay;
        let prevMonth11Date = moment().subtract(6, "months").format("YYYY-MM-DD");
        sideBarService.getProductStocknSaleReportData(prevMonth11Date, fromDate).then(function(data) {
                addVS1Data("TProductStocknSalePeriodReport", JSON.stringify(data));
        }).catch(function(err) {});

        sideBarService.getNewProductListVS1(initialBaseDataLoad, 0).then(function(dataProd) {
            addVS1Data("TProductVS1", JSON.stringify(dataProd)).then(function(datareturn) {
                }).catch(function(err) {
                });
        }).catch(function(err) {

        });

        sideBarService.getProductServiceListVS1(initialBaseDataLoad, 0).then(function(data) {
                addVS1Data("TProductWeb", JSON.stringify(data));
                sideBarService.getProductListVS1(initialBaseDataLoad, 0).then(function(dataProdList) {
                        addVS1Data("TProductList", JSON.stringify(dataProdList))
                            .then(function(datareturn) {
                                window.open("/inventorylist", "_self");
                            })
                            .catch(function(err) {
                                window.open("/inventorylist", "_self");
                            });
                    }).catch(function(err) {
                        window.open("/inventorylist", "_self");
                    });
            }).catch(function(err) {
                sideBarService.getProductListVS1(initialBaseDataLoad, 0).then(function(dataProdList) {
                    addVS1Data("TProductList", JSON.stringify(dataProdList)).then(function(datareturn) {
                            window.open("/inventorylist", "_self");
                        }).catch(function(err) {
                            window.open("/inventorylist", "_self");
                        });
                }).catch(function(err) {
                    window.open("/inventorylist", "_self");
                });
            });
    },
    "click #exportinv_pdf": async function() {
        $(".fullScreenSpin").css("display", "inline-block");
        exportInventoryToPdf();
    },
    "click #exportinv_csv": async function() {
        $(".fullScreenSpin").css("display", "inline-block");
        jQuery("#tblInventoryOverview_wrapper .dt-buttons .btntabletocsv").click();
        $(".fullScreenSpin").css("display", "none");
    },
    "click #btnSave": async function() {
        playSaveAudio();
        let productService = new ProductService();
        setTimeout(function(){

        let productCode = $("#edtproductvs1code").val();
        let productName = $("#edtproductvs1name").val();
        if (productName == "") {
            // Bert.alert('<strong>Please provide product Name !</strong>', 'danger');
            swal("Please provide the product name !", "", "info");
            e.preventDefault();
            return false;
        }

        let TaxCodePurchase = $("#slttaxcodepurchase").val();
        let TaxCodeSales = $("#slttaxcodesales").val();
        if (TaxCodePurchase == "" || TaxCodeSales == "") {
            // Bert.alert('<strong>Please fill Tax rate !</strong>', 'danger');
            swal("Please fill Tax rate !", "", "warning");
            e.preventDefault();
            return false;
        }

        var objDetails = {
            type: "TProduct",
            fields: {
                Active: true,
                ProductType: "INV",
                PRODUCTCODE: productCode,
                ProductPrintName: productName,
                ProductName: productName,
                PurchaseDescription: $("#txapurchasedescription").val(),
                SalesDescription: $("#txasalesdescription").val(),
                // AssetAccount:($("#sltcogsaccount").val()).includes(" - ") ? ($("#sltcogsaccount").val()).split(' - ')[1] : $("#inventoryAssetAccount").val(),
                CogsAccount: $("#edtassetaccount").val(),
                IncomeAccount: $("#sltcogsaccount").val(),
                BuyQty1: 1,
                BuyQty1Cost: Number(
                    $("#edtbuyqty1cost")
                    .val()
                    .replace(/[^0-9.-]+/g, "")
                ) || 0,
                BuyQty2: 1,
                BuyQty2Cost: Number(
                    $("#edtbuyqty1cost")
                    .val()
                    .replace(/[^0-9.-]+/g, "")
                ) || 0,
                BuyQty3: 1,
                BuyQty3Cost: Number(
                    $("#edtbuyqty1cost")
                    .val()
                    .replace(/[^0-9.-]+/g, "")
                ) || 0,
                SellQty1: 1,
                SellQty1Price: Number(
                    $("#edtsellqty1price")
                    .val()
                    .replace(/[^0-9.-]+/g, "")
                ) || 0,
                SellQty2: 1,
                SellQty2Price: Number(
                    $("#edtsellqty1price")
                    .val()
                    .replace(/[^0-9.-]+/g, "")
                ) || 0,
                SellQty3: 1,
                SellQty3Price: Number(
                    $("#edtsellqty1price")
                    .val()
                    .replace(/[^0-9.-]+/g, "")
                ) || 0,
                TaxCodePurchase: $("#slttaxcodepurchase").val(),
                TaxCodeSales: $("#slttaxcodesales").val(),
                UOMPurchases: defaultUOM,
                UOMSales: defaultUOM,
                TotalQtyInStock: $("#edttotalqtyinstock").val(),
                TotalQtyOnOrder: $("#edttotalqtyonorder").val(),
                /*Barcode:$("#NProdBar").val(),*/
            },
        };

        productService
            .saveProduct(objDetails)
            .then(function(objDetails) {
                FlowRouter.go("/inventorylist");
            })
            .catch(function(err) {
                swal({
                    title: "Oooops...",
                    text: err,
                    type: "error",
                    showCancelButton: false,
                    confirmButtonText: "Try Again",
                }).then((result) => {
                    if (result.value) {
                        Meteor._reload.reload();
                    } else if (result.dismiss === "cancel") {}
                });
                //$('.loginSpinner').css('display','none');
                $(".fullScreenSpin").css("display", "none");
            });
        }, delayTimeAfterSound);
    },
    "click .chkDepartment": function(event) {
        $(".fullScreenSpin").css("display", "inline-block");
        let templateObject = Template.instance();
        var splashArrayProductListDept = new Array();
        //let dataValue = $(event.target).val();
        let productService = new ProductService();
        // var dataList = {};
        let checkIfSerialorLot = '';
        const dataTableList = [];
        var dataList = {};
        var favorite = [];
        let favoriteproddeptIDrecords = [];
        let departmetn = "";
        $.each($("input[name='chkDepartment']:checked"), function() {
            favorite.push($(this).val());
        });

        let totalSummary = 0;
        if (favorite.length == 0) {
            $(".fullScreenSpin").css("display", "none");
        } else {
            // if ($('.chkDepartment:checked').length == $('.chkDepartment').length) {
            //   var datatable = $('#tblInventoryOverview').DataTable();
            //   datatable.clear();
            //   datatable.rows.add(splashArrayProductList);
            //   datatable.draw(false);
            //
            //    $('.fullScreenSpin').css('display','none');
            // }else{
            function MakeNegative() {
                $('td').each(function () {
                    if ($(this).text().indexOf('-' + Currency) >= 0)
                        $(this).addClass('text-danger')
                });

                $('td.colAvailable, td.colOnSO, td.colOnBO, td.colInStock, td.colOnOrder').each(function(){
                    // if(parseInt($(this).text()) == 0) $(this).addClass('neutralVolume');
                    if (parseInt($(this).text()) > 0) $(this).addClass('positiveVolume');
                    if (parseInt($(this).text()) < 0) $(this).addClass('negativeVolume');
                });
            };

            productService.getProductListDeptQtyList(favorite.join(",")).then(function(data) {
                    $(".fullScreenSpin").css("display", "none");
                    checkIfSerialorLot = '<i class="fas fa-plus-square text-success btnSNTracking"  style="font-size: 22px;" ></i>';
                    for (let i = 0; i < data.tproductlocationqty.length; i++) {
                        var dataList = [
                            data.tproductlocationqty[i].ProductID || "",
                            data.tproductlocationqty[i].ProductName || "-",
                            data.tproductlocationqty[i].ProductName || "",
                            data.tproductlocationqty[i].Available || 0,
                            data.tproductlocationqty[i].so || 0,
                            data.tproductlocationqty[i].pobo || 0,
                            data.tproductlocationqty[i].TotalQtyInStock || 0,
                            data.tproductlocationqty[i].TotalQtyOnOrder || 0,
                            utilityService.modifynegativeCurrencyFormat(Math.floor(data.tproductlocationqty[i].Cost * 100) / 100),
                            utilityService.modifynegativeCurrencyFormat(Math.floor(data.tproductlocationqty[i].Cost * 100) /100),
                            utilityService.modifynegativeCurrencyFormat(Math.floor(data.tproductlocationqty[i].Cost * 100) / 100),
                            utilityService.modifynegativeCurrencyFormat(Math.floor(data.tproductlocationqty[i].Cost * 100) /100),
                            checkIfSerialorLot||'',
                            data.tproductlocationqty[i].BARCODE || "",
                            data.tproductlocationqty[i].Deptname,
                            data.tproductlocationqty[i].ProductName || "",
                            "",
                            "",
                        ];

                        splashArrayProductListDept.push(dataList);

                        dataTableList.push(dataList);
                    }
                    if (splashArrayProductListDept) {
                        var datatable = $("#tblInventoryOverview").DataTable();
                        datatable.clear();
                        datatable.rows.add(splashArrayProductListDept);
                        datatable.draw(false);
                    }

                    templateObject.datatablerecords.set(dataTableList);
                    // templateObject.datatablerecords.set(dataTableList);

                    if (templateObject.datatablerecords.get()) {
                      setTimeout(function() {
                          MakeNegative();
                      }, 100);
                    }
            }).catch(function(err) {
                $(".fullScreenSpin").css("display", "none");
            });
            //}
        }
    },
    "click .btnSaveSelect": async function() {
        playSaveAudio();
        setTimeout(function(){
        $("#myModalDepartment").modal("toggle");
        $(".fullScreenSpin").css("display", "none");
        $(".modal-backdrop").css("display", "none");
        }, delayTimeAfterSound);
    },
    "click .btnNewProduct": function() {
        FlowRouter.go("/productview");
    },
    "click .printConfirm": function(event) {
        playPrintAudio();
        setTimeout(function(){
        $(".fullScreenSpin").css("display", "inline-block");
        jQuery("#tblInventoryOverview_wrapper .dt-buttons .btntabletopdf").click();
        $(".fullScreenSpin").css("display", "none");
    }, delayTimeAfterSound);
    },
    "click .btnStockAdjustment": function(event) {
        FlowRouter.go("/stockadjustmentoverview");
    },

    "click .btnStockTrans": function(event) {
        FlowRouter.go("/stocktransferlist");
    },
    "click .btnSNTrack": function(event) {
        FlowRouter.go("/serialnumberlist");
    },
    "click .btnLotTrack": function(event) {
        FlowRouter.go("/lotnumberlist");
    },
    "click .newProduct": function(event) {
        FlowRouter.go("/productview");
    },
    "click .newProduct": function(event) {
        FlowRouter.go("/productview");
    },
    "click .productList": function(event) {
        FlowRouter.go("/productlist");
    },
    "click .templateDownload": function() {
        let utilityService = new UtilityService();
        let rows = [];
        const filename = "SampleProduct" + ".csv";
        rows[0] = [
            "Product Name",
            "Sales Description",
            "Sale Price",
            "Sales Account",
            "Tax Code",
            "Barcode",
            "Purchase Description",
            "COGGS Account",
            "Purchase Tax Code",
            "Cost",
            "Product Type",
        ];
        rows[1] = [
            "TSL - Black",
            "T-Shirt Large Black",
            "600",
            "Sales",
            "NT",
            "",
            "T-Shirt Large Black",
            "Cost of Goods Sold",
            "NT",
            "700",
            "NONINV",
        ];
        rows[2] = [
            "TSL - Blue",
            "T-Shirt Large Blue",
            "600",
            "Sales",
            "NT",
            "",
            "T-Shirt Large Blue",
            "Cost of Goods Sold",
            "NT",
            "700",
            "INV",
        ];
        rows[3] = [
            "TSL - Yellow",
            "T-Shirt Large Yellow",
            "600",
            "Sales",
            "NT",
            "",
            "T-Shirt Large Yellow",
            "Cost of Goods Sold",
            "NT",
            "700",
            "OTHER",
        ];
        utilityService.exportToCsv(rows, filename, "csv");
    },
    "click .btnUploadFile": function(event) {
        $("#attachment-upload").val("");
        $(".file-name").text("");
        //$(".btnImport").removeAttr("disabled");
        $("#attachment-upload").trigger("click");
    },
    "click .templateDownloadXLSX": function(e) {
        e.preventDefault(); //stop the browser from following
        window.location.href = "sample_imports/SampleProduct.xlsx";
    },
    "change #attachment-upload": function(e) {
        let templateObj = Template.instance();
        var filename = $("#attachment-upload")[0].files[0]["name"];
        var fileExtension = filename.split(".").pop().toLowerCase();
        var validExtensions = ["csv", "txt", "xlsx"];
        var validCSVExtensions = ["csv", "txt"];
        var validExcelExtensions = ["xlsx", "xls"];

        if (validExtensions.indexOf(fileExtension) == -1) {
            // Bert.alert('<strong>formats allowed are : '+ validExtensions.join(', ')+'</strong>!', 'danger');
            swal(
                "Invalid Format",
                "formats allowed are :" + validExtensions.join(", "),
                "error"
            );
            $(".file-name").text("");
            $(".btnImport").Attr("disabled");
        } else if (validCSVExtensions.indexOf(fileExtension) != -1) {
            $(".file-name").text(filename);
            let selectedFile = event.target.files[0];

            templateObj.selectedFile.set(selectedFile);
            if ($(".file-name").text() != "") {
                $(".btnImport").removeAttr("disabled");
            } else {
                $(".btnImport").Attr("disabled");
            }
        } else if (fileExtension == "xlsx") {
            $(".file-name").text(filename);
            let selectedFile = event.target.files[0];
            var oFileIn;
            var oFile = selectedFile;
            var sFilename = oFile.name;
            // Create A File Reader HTML5
            var reader = new FileReader();

            // Ready The Event For When A File Gets Selected
            reader.onload = function(e) {
                var data = e.target.result;
                data = new Uint8Array(data);
                var workbook = XLSX.read(data, { type: "array" });

                var result = {};
                workbook.SheetNames.forEach(function(sheetName) {
                    var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
                        header: 1,
                    });
                    var sCSV = XLSX.utils.make_csv(workbook.Sheets[sheetName]);
                    templateObj.selectedFile.set(sCSV);

                    if (roa.length) result[sheetName] = roa;
                });
                // see the result, caution: it works after reader event is done.
            };
            reader.readAsArrayBuffer(oFile);

            if ($(".file-name").text() != "") {
                $(".btnImport").removeAttr("disabled");
            } else {
                $(".btnImport").Attr("disabled");
            }
        }
    },
    "click .btnImport": function() {
        $(".fullScreenSpin").css("display", "inline-block");
        let templateObject = Template.instance();
        let productService = new ProductService();
        let objDetails;

        Papa.parse(templateObject.selectedFile.get(), {
            complete: function(results) {
                if (results.data.length > 0) {
                    if (
                        results.data[0][0] == "Product Name" &&
                        results.data[0][1] == "Sales Description" &&
                        results.data[0][2] == "Sale Price" &&
                        results.data[0][3] == "Sales Account" &&
                        results.data[0][4] == "Tax Code" &&
                        results.data[0][5] == "Barcode" &&
                        results.data[0][6] == "Purchase Description" &&
                        results.data[0][7] == "COGGS Account" &&
                        results.data[0][8] == "Purchase Tax Code" &&
                        results.data[0][9] == "Cost" &&
                        results.data[0][10] == "Product Type"
                    ) {
                        let dataLength = results.data.length * 3000;
                        setTimeout(function() {
                            // $('#importModal').modal('toggle');
                            window.open("/inventorylist?success=true", "_self");
                            $(".fullScreenSpin").css("display", "none");
                        }, parseInt(dataLength));

                        for (let i = 0; i < results.data.length - 1; i++) {
                            objDetails = {
                                type: "TProductVS1",
                                fields: {
                                    Active: true,
                                    ProductType: results.data[i + 1][10] || "INV",

                                    ProductPrintName: results.data[i + 1][0],
                                    ProductName: results.data[i + 1][0],
                                    SalesDescription: results.data[i + 1][1],
                                    SellQty1Price: parseFloat(
                                        results.data[i + 1][2].replace(/[^0-9.-]+/g, "")
                                    ) || 0,
                                    IncomeAccount: results.data[i + 1][3],
                                    TaxCodeSales: results.data[i + 1][4],
                                    Barcode: results.data[i + 1][5],
                                    PurchaseDescription: results.data[i + 1][6],

                                    // AssetAccount:results.data[i+1][0],
                                    CogsAccount: results.data[i + 1][7],

                                    TaxCodePurchase: results.data[i + 1][8],

                                    BuyQty1Cost: parseFloat(
                                        results.data[i + 1][9].replace(/[^0-9.-]+/g, "")
                                    ) || 0,

                                    PublishOnVS1: true,
                                },
                            };
                            if (results.data[i + 1][1]) {
                                if (results.data[i + 1][1] !== "") {
                                    productService
                                        .saveProductVS1(objDetails)
                                        .then(function(data) {
                                            //$('.fullScreenSpin').css('display','none');
                                            FlowRouter.go("/inventorylist?success=true");
                                        })
                                        .catch(function(err) {
                                            //$('.fullScreenSpin').css('display','none');
                                            swal({
                                                title: "Oooops...",
                                                text: err,
                                                type: "error",
                                                showCancelButton: false,
                                                confirmButtonText: "Try Again",
                                            }).then((result) => {
                                                if (result.value) {
                                                    window.open("/inventorylist?success=true", "_self");
                                                } else if (result.dismiss === "cancel") {
                                                    window.open("/inventorylist?success=true", "_self");
                                                }
                                            });
                                        });
                                }
                            }
                        }
                    } else {
                        $(".fullScreenSpin").css("display", "none");
                        // Bert.alert('<strong> Data Mapping fields invalid. </strong> Please check that you are importing the correct file with the correct column headers.', 'danger');
                        swal(
                            "Invalid Data Mapping fields ",
                            "Please check that you are importing the correct file with the correct column headers.",
                            "error"
                        );
                    }
                } else {
                    $(".fullScreenSpin").css("display", "none");
                    // Bert.alert('<strong> Data Mapping fields invalid. </strong> Please check that you are importing the correct file with the correct column headers.', 'danger');
                    swal(
                        "Invalid Data Mapping fields ",
                        "Please check that you are importing the correct file with the correct column headers.",
                        "error"
                    );
                }
            },
        });
    },
    "keyup #myInputSearch, change #myInputSearch, search #myInputSearch": function(event) {
        $(".tblInventoryOverview tbody tr").show();
        let searchItem = $(event.target).val();
        if (searchItem != "") {
            var value = searchItem.toLowerCase();
            $(".tblInventoryOverview tbody tr").each(function() {
                var found = "false";
                $(this).each(function() {
                    if (
                        $(this).text().toLowerCase().indexOf(value.toLowerCase()) >= 0
                    ) {
                        found = "true";
                    }

                    if (
                        $(this)
                        .text()
                        .replace(/[^0-9.-]+/g, "")
                        .indexOf(value.toLowerCase()) >= 0
                    ) {
                        found = "true";
                    }
                });
                if (found == "true") {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
        } else {
            $(".tblInventoryOverview tbody tr").show();
        }
    },
    "click .lblCostEx": function(event) {
        var $earch = $(event.currentTarget);
        var offset = $earch.offset();
        if (event.pageX > offset.left + $earch.width() - 10) {} else {
            $(".lblCostEx").addClass("hiddenColumn");
            $(".lblCostInc").removeClass("hiddenColumn");

            $(".colCostPriceInc").removeClass("hiddenColumn");

            $(".colCostPrice").addClass("hiddenColumn");

            //$('.lblCostInc').css('width','10.1%');
        }
    },
    "click .lblCostInc": function(event) {
        var $earch = $(event.currentTarget);
        var offset = $earch.offset();
        if (event.pageX > offset.left + $earch.width() - 10) {} else {
            $(".lblCostInc").addClass("hiddenColumn");

            $(".lblCostEx").removeClass("hiddenColumn");

            $(".colCostPrice").removeClass("hiddenColumn");

            $(".colCostPriceInc").addClass("hiddenColumn");
            //$('.lblCostEx').css('width','10%');
        }
    },
    "click .lblPriceEx": function(event) {
        var $earch = $(event.currentTarget);
        var offset = $earch.offset();
        if (event.pageX > offset.left + $earch.width() - 10) {} else {
            $(".lblPriceEx").addClass("hiddenColumn");
            $(".lblPriceInc").removeClass("hiddenColumn");

            $(".colSalePriceInc").removeClass("hiddenColumn");
            $(".colSalePrice").addClass("hiddenColumn");

            //$('.lblPriceInc').css('width','10.1%');
        }
    },
    "click .lblPriceInc": function(event) {
        var $earch = $(event.currentTarget);
        var offset = $earch.offset();
        if (event.pageX > offset.left + $earch.width() - 10) {} else {
            $(".lblPriceInc").addClass("hiddenColumn");
            $(".lblPriceEx").removeClass("hiddenColumn");

            $(".colSalePrice").removeClass("hiddenColumn");
            $(".colSalePriceInc").addClass("hiddenColumn");

            //$('.lblPriceEx').css('width','10%');
        }
    },


});

Template.registerHelper("equals", function(a, b) {
    return a === b;
});
