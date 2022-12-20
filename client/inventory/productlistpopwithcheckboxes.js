import { ReactiveVar } from "meteor/reactive-var";
import { CoreService } from "../js/core-service";
import { DashBoardService } from "../Dashboard/dashboard-service";
import { UtilityService } from "../utility-service";
import { ProductService } from "../product/product-service";
import "../lib/global/erp-objects";
import "jquery-ui-dist/external/jquery/jquery";
import "jquery-ui-dist/jquery-ui";
import { Random } from "meteor/random";
import { jsPDF } from "jspdf";
import "jQuery.print/jQuery.print.js";
import { autoTable } from "jspdf-autotable";
import "jquery-editable-select";
import { SideBarService } from "../js/sidebar-service";
import "../lib/global/indexdbstorage.js";
let sideBarService = new SideBarService();
let utilityService = new UtilityService();
var times = 0;
Template.productlistpopwithcheckboxes.onCreated(() => {
    const templateObject = Template.instance();
    templateObject.records = new ReactiveVar();
    templateObject.CleintName = new ReactiveVar();
    templateObject.Department = new ReactiveVar();
    templateObject.Date = new ReactiveVar();
    templateObject.DueDate = new ReactiveVar();
    templateObject.InvoiceNo = new ReactiveVar();
    templateObject.RefNo = new ReactiveVar();
    templateObject.Branding = new ReactiveVar();
    templateObject.Currency = new ReactiveVar();
    templateObject.Total = new ReactiveVar();
    templateObject.Subtotal = new ReactiveVar();
    templateObject.TotalTax = new ReactiveVar();
    templateObject.invoicerecord = new ReactiveVar({});
    templateObject.taxrateobj = new ReactiveVar();
    templateObject.Accounts = new ReactiveVar([]);
    templateObject.InvoiceId = new ReactiveVar();
    templateObject.selectedCurrency = new ReactiveVar([]);
    templateObject.inputSelectedCurrency = new ReactiveVar([]);
    templateObject.currencySymbol = new ReactiveVar([]);
    templateObject.deptrecords = new ReactiveVar();
    templateObject.termrecords = new ReactiveVar();
    templateObject.clientrecords = new ReactiveVar([]);
    templateObject.taxraterecords = new ReactiveVar([]);
    templateObject.record = new ReactiveVar({});
    templateObject.accountID = new ReactiveVar();
    templateObject.stripe_fee_method = new ReactiveVar();
    /* Attachments */
    templateObject.uploadedFile = new ReactiveVar();
    templateObject.uploadedFiles = new ReactiveVar([]);
    templateObject.attachmentCount = new ReactiveVar();

    templateObject.address = new ReactiveVar();
    templateObject.abn = new ReactiveVar();
    templateObject.referenceNumber = new ReactiveVar();
    templateObject.statusrecords = new ReactiveVar([]);

    templateObject.includeBOnShippedQty = new ReactiveVar();
    templateObject.includeBOnShippedQty.set(true);
    templateObject.productextrasellrecords = new ReactiveVar([]);
});

Template.productlistpopwithcheckboxes.onRendered(function() {
    let tempObj = Template.instance();
    let utilityService = new UtilityService();
    let productService = new ProductService();
    let tableProductList;
    var splashArrayProductList = new Array();
    var splashArrayTaxRateList = new Array();
    const taxCodesList = [];
    const lineExtaSellItems = [];
    var currentLoc = FlowRouter.current().route.path;
    tempObj.getAllProducts = function() {
        getVS1Data("TProductList")
            .then(function(dataObject) {
                if (dataObject.length == 0) {
                    sideBarService
                        .getNewProductListVS1(initialBaseDataLoad, 0)
                        .then(function(data) {
                            addVS1Data("TProductList", JSON.stringify(data));
                            let records = [];
                            let inventoryData = [];

                            for (let i = 0; i < data.tproductlist.length; i++) {
                                if (data.tproductlist[i].Active == true) {
                                    linestatus = "";
                                } else if (data.tproductlist[i].Active == false) {
                                    linestatus = "In-Active";
                                };
                                costprice = utilityService.modifynegativeCurrencyFormat(
                                    Math.floor(data.tproductlist[i].BuyQTY1 * 100) / 100); //Cost Price
                                sellprice = utilityService.modifynegativeCurrencyFormat(
                                    Math.floor(data.tproductlist[i].SellQTY1 * 100) / 100); //Sell Price
                                if (data.tproductlist[i].ExtraSellPrice != null) {
                                    for (
                                        let e = 0; e < data.tproductlist[i].ExtraSellPrice.length; e++
                                    ) {
                                        let lineExtaSellObj = {
                                            clienttype: data.tproductlist[i].ExtraSellPrice[e]
                                                .ClientTypeName || "",
                                            productname: data.tproductlist[i].ExtraSellPrice[e]
                                                .ProductName ||
                                                data.tproductlist[i].ProductName,
                                            price: utilityService.modifynegativeCurrencyFormat(
                                                data.tproductlist[i].ExtraSellPrice[e]
                                                .Price1
                                            ) || 0,
                                            qtypercent: data.tproductlist[i].QtyPercent1 || 0,
                                        };
                                        lineExtaSellItems.push(lineExtaSellObj);
                                    }
                                }
                                var dataList = "";
                                if (currentLoc == "/purchaseordercard") {
                                    dataList = [
                                        '<div class="custom-control custom-switch chkBox pointer" style="width:15px;"><input name="appointment-products-checks" class="custom-control-input chkBox chkServiceCard pointer" type="checkbox" id="formCheck-' +
                                        data.tproductlist[i].PARTSID +
                                        "x" +
                                        data.tproductlist[i].ProductName +
                                        '"><label class="custom-control-label chkBox pointer" for="formCheck-' +
                                        data.tproductlist[i].PARTSID +
                                        "x" +
                                        data.tproductlist[i].ProductName +
                                        '"></label></div>',
                                        data.tproductlist[i].PARTSID || "",
                                        data.tproductlist[i].PARTNAM || "",
                                        data.tproductlist[i].PARTSDESCRIPTION || "",
                                        data.tproductlist[i].BARCODE || "",
                                        costprice,
                                        sellprice,
                                        data.tproductlist[i].InstockQty,
                                        data.tproductlist[i].PURCHTAXCODE || "",
                                        data.tproductlist[i].PRODUCTCODE || "",
                                        data.tproductlist[i].Ex_Works || null,
                                        linestatus
                                    ];
                                } else {
                                    dataList = [
                                        '<div class="custom-control custom-switch chkBox pointer" style="width:15px;"><input name="appointment-products-checks" class="custom-control-input chkBox chkServiceCard pointer" type="checkbox" id="productCheck-' +
                                        data.tproductlist[i].PARTSID +
                                        '"><label class="custom-control-label chkBox pointer" for="productCheck-' +
                                        data.tproductlist[i].PARTSID +
                                        '"></label></div>',
                                        data.tproductlist[i].PARTSID || "",
                                        data.tproductlist[i].PARTNAM || "",
                                        data.tproductlist[i].PARTSDESCRIPTION || "",
                                        data.tproductlist[i].BARCODE || "",
                                        costprice,
                                        sellprice,
                                        data.tproductlist[i].InstockQty,
                                        data.tproductlist[i].PURCHTAXCODE || "",
                                        data.tproductlist[i].PRODUCTCODE || "",
                                        data.tproductlist[i].Ex_Works || null,
                                        linestatus
                                    ];
                                }

                                if (currentLoc == "/stockadjustmentcard") {
                                    if (data.tproductlist[i].PRODUCTGROUP == "INV") {
                                        splashArrayProductList.push(dataList);
                                    }
                                } else {
                                    splashArrayProductList.push(dataList);
                                }
                            }

                        });
                } else {
                    let data = JSON.parse(dataObject[0].data);
                    let useData = data.tproductlist;
                    let records = [];
                    let inventoryData = [];
                    for (let i = 0; i < data.tproductlist.length; i++) {
                        if (data.tproductlist[i].Active == true) {
                            linestatus = "";
                        } else if (data.tproductlist[i].Active == false) {
                            linestatus = "In-Active";
                        };
                        costprice = utilityService.modifynegativeCurrencyFormat(
                            Math.floor(data.tproductlist[i].BuyQty1Cost * 100) / 100); //Cost Price
                        sellprice = utilityService.modifynegativeCurrencyFormat(
                            Math.floor(data.tproductlist[i].SellQty1Price* 100) / 100); //Sell Price
                        if (data.tproductlist[i].ExtraSellPrice != null) {
                            for (
                                let e = 0; e < data.tproductlist[i].ExtraSellPrice.length; e++
                            ) {
                                let lineExtaSellObj = {
                                    clienttype: data.tproductlist[i].ExtraSellPrice[e]
                                        .ClientTypeName || "",
                                    productname: data.tproductlist[i].ExtraSellPrice[e]
                                        .ProductName || data.tproductlist[i].ProductName,
                                    price: utilityService.modifynegativeCurrencyFormat(
                                        data.tproductlist[i].ExtraSellPrice[e].Price1
                                    ) || 0,
                                    qtypercent: data.tproductlist[i].QtyPercent1 || 0,
                                };
                                lineExtaSellItems.push(lineExtaSellObj);
                            }
                        }

                        var dataList = "";
                        if (currentLoc == "/purchaseordercard") {
                            dataList = [
                                '<div class="custom-control custom-switch chkBox pointer" style="width:15px;"><input name="appointment-products-checks" class="custom-control-input chkBox chkServiceCard pointer" type="checkbox" id="formCheck-' +
                                data.tproductlist[i].PARTSID +
                                "x" +
                                data.tproductlist[i].ProductName +
                                '"><label class="custom-control-label chkBox pointer" for="formCheck-' +
                                data.tproductlist[i].PARTSID +
                                "x" +
                                data.tproductlist[i].ProductName +
                                '"></label></div>',
                                data.tproductlist[i].PARTSID || "",
                                data.tproductlist[i].PARTNAM || "",
                                data.tproductlist[i].PARTSDESCRIPTION || "",
                                data.tproductlist[i].BARCODE || "",
                                costprice,
                                sellprice,
                                data.tproductlist[i].InstockQty,
                                data.tproductlist[i].PURCHTAXCODE || "",
                                data.tproductlist[i].PRODUCTCODE || "",
                                data.tproductlist[i].Ex_Works || null,
                                linestatus
                            ];
                        } else {
                            dataList = [
                                '<div class="custom-control custom-switch chkBox pointer" style="width:15px;"><input name="appointment-products-checks" class="custom-control-input chkBox chkServiceCard pointer" type="checkbox" id="productCheck-' +
                                data.tproductlist[i].PARTSID +
                                '"><label class="custom-control-label chkBox pointer" for="productCheck-' +
                                data.tproductlist[i].PARTSID +
                                '"></label></div>',
                                data.tproductlist[i].PARTSID || "",
                                data.tproductlist[i].PARTNAM || "",
                                data.tproductlist[i].PARTSDESCRIPTION || "",
                                data.tproductlist[i].BARCODE || "",
                                costprice,
                                sellprice,
                                data.tproductlist[i].InstockQty,
                                data.tproductlist[i].PURCHTAXCODE || "",
                                data.tproductlist[i].PRODUCTCODE || "",
                                data.tproductlist[i].Ex_Works || null,
                                linestatus
                            ];
                        }

                        // splashArrayProductList.push(dataList);
                        if (currentLoc == "/stockadjustmentcard") {
                            if (data.tproductlist[i].PRODUCTGROUP == "INV") {
                                splashArrayProductList.push(dataList);
                            }
                        } else {
                            splashArrayProductList.push(dataList);
                        }
                    }

                    tempObj.productextrasellrecords.set(lineExtaSellItems);

                }
            })
            .catch(function(err) {
                sideBarService
                    .getNewProductListVS1(initialBaseDataLoad, 0)
                    .then(function(data) {
                        addVS1Data("TProductList", JSON.stringify(data));
                        let records = [];
                        let inventoryData = [];
                        let buyrate = 0.00;
                        let sellrate = 0.00;
                        let linestatus = '';



                        for (let i = 0; i < data.tproductlist.length; i++) {
                            if (data.tproductlist[i].Active == true) {
                                linestatus = "";
                            } else if (data.tproductlist[i].Active == false) {
                                linestatus = "In-Active";
                            };
                            chkBox = '<div class="custom-control custom-switch chkBox pointer" style="width:15px;"><input name="pointer" class="custom-control-input chkBox pointer" type="checkbox" id="formCheck-' + data.tproductlist[i].PARTSID + "x" + data.tproductlist[i].ProductName +
                            '"><label class="custom-control-label chkBox pointer" for="formCheck-' + data.tproductlist[i].PARTSID +
                            "x" + data.tproductlist[i].ProductName +
                            '"></label></div>'; //switchbox

                            costprice = utilityService.modifynegativeCurrencyFormat(
                                Math.floor(data.tproductlist[i].BuyQty1Cost * 100) / 100); //Cost Price
                            sellprice = utilityService.modifynegativeCurrencyFormat(
                                Math.floor(data.tproductlist[i].SellQty1Price* 100) / 100); //Sell Price

                            if (data.tproductlist[i].ExtraSellPrice != null) {
                                for (
                                    let e = 0; e < data.tproductlist[i].ExtraSellPrice.length; e++
                                ) {
                                    let lineExtaSellObj = {
                                        clienttype: data.tproductlist[i].ExtraSellPrice[e]
                                            .ClientTypeName || "",
                                        productname: data.tproductlist[i].ExtraSellPrice[e]
                                            .ProductName || data.tproductlist[i].ProductName,
                                        price: utilityService.modifynegativeCurrencyFormat(
                                            data.tproductlist[i].ExtraSellPrice[e]
                                            .Price1
                                        ) || 0,
                                        qtypercent: data.tproductlist[i].QtyPercent1 || 0,
                                    };
                                    lineExtaSellItems.push(lineExtaSellObj);
                                }
                            }
                            var dataList = "";

                            if (currentLoc == "/purchaseordercard") {
                                dataList = [
                                    chkBox,
                                    data.tproductlist[i].PARTSID || "",
                                    data.tproductlist[i].PARTNAM || "",
                                    data.tproductlist[i].PARTSDESCRIPTION || "",
                                    data.tproductlist[i].BARCODE || "",
                                    costprice,
                                    sellprice,
                                    data.tproductlist[i].InstockQty,
                                    data.tproductlist[i].PURCHTAXCODE || "",
                                    data.tproductlist[i].PRODUCTCODE || "",
                                    data.tproductlist[i].Ex_Works || null,
                                    linestatus
                                ];
                            } else {
                                dataList = [
                                    chkBox,
                                    data.tproductlist[i].PARTSID || "",
                                    data.tproductlist[i].PARTNAM || "",
                                    data.tproductlist[i].PARTSDESCRIPTION || "",
                                    data.tproductlist[i].BARCODE || "",
                                    costprice,
                                    sellprice,
                                    data.tproductlist[i].InstockQty,
                                    data.tproductlist[i].PURCHTAXCODE || "",
                                    data.tproductlist[i].PRODUCTCODE || "",
                                    data.tproductlist[i].Ex_Works || null,
                                    linestatus
                                ];
                            }

                            if (currentLoc == "/stockadjustmentcard") {
                                if (data.tproductlist[i].PRODUCTGROUP == "INV") {
                                    splashArrayProductList.push(dataList);
                                }
                            } else {
                                splashArrayProductList.push(dataList);
                            }
                        }

                    });
            });
    };

    //tempObj.getAllProducts();

    function onScanSuccessProdModal(decodedText, decodedResult) {
        var barcodeScannerProdModal = decodedText.toUpperCase();
        $("#scanBarcodeModalProduct").modal("toggle");
        if (barcodeScannerProdModal != "") {
            setTimeout(function() {
                $("#tblInventoryCheckbox_filter .form-control-sm").val(barcodeScannerProdModal);
                $("#tblInventoryCheckbox_filter .form-control-sm").trigger("input");
            }, 200);
        }
    }

    var html5QrcodeScannerProdModal = new Html5QrcodeScanner(
        "qr-reader-productmodal", {
            fps: 10,
            qrbox: 250,
            rememberLastUsedCamera: true,
        }
    );
    html5QrcodeScannerProdModal.render(onScanSuccessProdModal);
});

Template.productlistpopwithcheckboxes.events({
    "keyup #tblInventoryCheckbox_filter input": function(event) {
        if (event.keyCode == 13) {
            $(".btnRefreshProduct").trigger("click");
        }
    },
    "click .btnRefreshProduct": function(event) {
        let templateObject = Template.instance();
        let utilityService = new UtilityService();
        let productService = new ProductService();
        var currentLoc = FlowRouter.current().route.path;
        //let salesService = new SalesBoardService();
        let tableProductList;
        var splashArrayProductList = new Array();
        var splashArrayTaxRateList = new Array();
        const taxCodesList = [];
        const lineExtaSellItems = [];
        $(".fullScreenSpin").css("display", "inline-block");
        let dataSearchName = $("#tblInventoryCheckbox_filter input").val();
        if (dataSearchName.replace(/\s/g, "") != "") {
            sideBarService
                .getNewProductListVS1ByName(dataSearchName)
                .then(function(data) {
                    let records = [];

                    let inventoryData = [];
                    if (data.tproductlist.length > 0) {
                        for (let i = 0; i < data.tproductlist.length; i++) {
                            var dataList = "";
                            chkBox = '<div class="custom-control custom-switch chkBox pointer" style="width:15px;"><input name="pointer" class="custom-control-input chkBox pointer" type="checkbox" id="formCheck-' + data.tproductlist[i].PARTSID + "x" + data.tproductlist[i].PARTNAM +
                            '"><label class="custom-control-label chkBox pointer" for="formCheck-' + data.tproductlist[i].PARTSID +
                            "x" + data.tproductlist[i].PARTNAM +
                            '"></label></div>'; //switchbox

                            costprice = utilityService.modifynegativeCurrencyFormat(
                                Math.floor(data.tproductlist[i].BuyQTY1 * 100) / 100); //Cost Price
                            sellprice = utilityService.modifynegativeCurrencyFormat(
                                Math.floor(data.tproductlist[i].SellQTY1 * 100) / 100); //Sell Price
                            if (currentLoc == "/purchaseordercard") {
                                dataList = [
                                    '<div class="custom-control custom-switch chkBox pointer" style="width:15px;"><input name="appointment-products-checks" class="custom-control-input chkBox chkServiceCard pointer" type="checkbox" id="productCheck-' +
                                    data.tproductlist[i].PARTSID +
                                    '"><label class="custom-control-label chkBox pointer" for="productCheck-' +
                                    data.tproductlist[i].PARTSID +
                                    '"></label></div>',
                                    data.tproductlist[i].PARTSID || "",
                                    data.tproductlist[i].PARTNAM || "",
                                    data.tproductlist[i].PARTSDESCRIPTION || "",
                                    data.tproductlist[i].BARCODE || "",
                                    costprice,
                                    sellprice,
                                    data.tproductlist[i].InstockQty,
                                    data.tproductlist[i].PURCHTAXCODE || "",
                                    data.tproductlist[i].PRODUCTCODE || "",
                                    data.tproductlist[i].Ex_Works || null,
                                    linestatus
                                ];
                            } else {
                                dataList = [
                                    '<div class="custom-control custom-switch chkBox pointer" style="width:15px;"><input name="appointment-products-checks" class="custom-control-input chkBox chkServiceCard pointer" type="checkbox" id="productCheck-' +
                                    data.tproductlist[i].PARTSID +
                                    '"><label class="custom-control-label chkBox pointer" for="productCheck-' +
                                    data.tproductlist[i].PARTSID +
                                    '"></label></div>',
                                    data.tproductlist[i].PARTSID || "",
                                    data.tproductlist[i].PARTNAM || "",
                                    data.tproductlist[i].PARTSDESCRIPTION || "",
                                    data.tproductlist[i].BARCODE || "",
                                    costprice,
                                    sellprice,
                                    data.tproductlist[i].InstockQty,
                                    data.tproductlist[i].PURCHTAXCODE || "",
                                    data.tproductlist[i].PRODUCTCODE || "",
                                    data.tproductlist[i].Ex_Works || null,
                                    linestatus
                                ];
                            }

                            if (data.tproductlist[i].ExtraSellPrice != null) {
                                for (
                                    let e = 0; e < data.tproductlist[i].ExtraSellPrice.length; e++
                                ) {
                                    let lineExtaSellObj = {
                                        clienttype: data.tproductlist[i].ExtraSellPrice[e].ClientTypeName || "",
                                        productname: data.tproductlist[i].ExtraSellPrice[e].ProductName || data.tproductlist[i].ProductName,
                                        price: utilityService.modifynegativeCurrencyFormat(data.tproductlist[i].ExtraSellPrice[e].Price1) || 0,
                                    };
                                    lineExtaSellItems.push(lineExtaSellObj);
                                }
                            }
                            if (currentLoc == "/stockadjustmentcard") {
                                if (data.tproductlist[i].PRODUCTGROUP == "INV") {
                                    splashArrayProductList.push(dataList);
                                }
                            } else {
                                splashArrayProductList.push(dataList);
                            }
                        }
                        //localStorage.setItem('VS1SalesProductList', JSON.stringify(splashArrayProductList));
                        $(".fullScreenSpin").css("display", "none");
                        if (splashArrayProductList) {
                            var datatable = $("#tblInventoryCheckbox").DataTable();
                            datatable.clear();
                            datatable.rows.add(splashArrayProductList);
                            datatable.draw(false);
                        }
                    } else {
                        $(".fullScreenSpin").css("display", "none");
                        $("#productListModal").modal("toggle");
                        swal({
                            title: "Question",
                            text: "Product does not exist, would you like to create it?",
                            type: "question",
                            showCancelButton: true,
                            confirmButtonText: "Yes",
                            cancelButtonText: "No",
                        }).then((result) => {
                            if (result.value) {
                                $("#newProductModal").modal("toggle");
                                $("#edtproductname").val(dataSearchName);
                            } else if (result.dismiss === "cancel") {
                                $("#productListModal").modal("toggle");
                            }
                        });
                    }
                })
                .catch(function(err) {
                    $(".fullScreenSpin").css("display", "none");
                });
        } else {
            sideBarService.getNewProductListVS1(initialBaseDataLoad, 0).then(function(data) { addVS1Data("TProductList", JSON.stringify(data));
                    let records = [];
                    let inventoryData = [];
                    let chkBox;
                    let costprice = 0.00;
                    let sellrate = 0.00;
                    let linestatus = '';
                    if(data.Params.Search.replace(/\s/g, "") == ""){
                      deleteFilter = true;
                    }else{
                      deleteFilter = false;
                    };

                    for (let i = 0; i < data.tproductlist.length; i++) {
                        var dataList = "";
                        if (data.tproductlist[i].Active == true) {
                            linestatus = "";
                        } else if (data.tproductlist[i].Active == false) {
                            linestatus = "In-Active";
                        };
                        chkBox = '<div class="custom-control custom-switch chkBox pointer" style="width:15px;"><input name="pointer" class="custom-control-input chkBox pointer" type="checkbox" id="formCheck-' + data.tproductlist[i].PARTSID + "x" + data.tproductlist[i].PARTNAM +
                        '"><label class="custom-control-label chkBox pointer" for="formCheck-' + data.tproductlist[i].PARTSID +
                        "x" + data.tproductlist[i].PARTNAM +
                        '"></label></div>'; //switchbox

                        costprice = utilityService.modifynegativeCurrencyFormat(
                            Math.floor(data.tproductlist[i].BuyQTY1 * 100) / 100); //Cost Price
                        sellprice = utilityService.modifynegativeCurrencyFormat(
                            Math.floor(data.tproductlist[i].SellQTY1 * 100) / 100); //Sell Price
                        if (currentLoc == "/purchaseordercard") {
                            dataList = [
                                chkBox,
                                data.tproductlist[i].PARTSID || "",
                                data.tproductlist[i].PARTNAM || "",
                                data.tproductlist[i].PARTSDESCRIPTION || "",
                                data.tproductlist[i].BARCODE || "",
                                costprice,
                                sellprice,
                                data.tproductlist[i].InstockQty,
                                data.tproductlist[i].PURCHTAXCODE || "",
                                data.tproductlist[i].PRODUCTCODE || "",
                                data.tproductlist[i].Ex_Works || null,
                                linestatus
                            ];
                        } else {
                            dataList = [
                                chkBox,
                                data.tproductlist[i].PARTSID || "",
                                data.tproductlist[i].PARTNAM || "",
                                data.tproductlist[i].PARTSDESCRIPTION || "",
                                data.tproductlist[i].BARCODE || "",
                                costprice,
                                sellprice,
                                data.tproductlist[i].InstockQty,
                                data.tproductlist[i].PURCHTAXCODE || "",
                                data.tproductlist[i].PRODUCTCODE || "",
                                data.tproductlist[i].Ex_Works || null,
                                linestatus
                            ];
                        }
                        if (data.tproductlist[i].ExtraSellPrice != null) {
                            for (
                                let e = 0; e < data.tproductlist[i].ExtraSellPrice.length; e++
                            ) {
                                let lineExtaSellObj = {
                                    clienttype: data.tproductlist[i].ExtraSellPrice[e].ClientTypeName || "",
                                    productname: data.tproductlist[i].ExtraSellPrice[e].ProductName || data.tproductlist[i].ProductName,
                                    price: utilityService.modifynegativeCurrencyFormat(data.tproductlist[i].ExtraSellPrice[e].Price1) || 0,
                                };
                                lineExtaSellItems.push(lineExtaSellObj);
                            }
                        }
                        if (currentLoc == "/stockadjustmentcard") {
                            if (data.tproductlist[i].PRODUCTGROUP == "INV") {
                                splashArrayProductList.push(dataList);
                            }
                        } else {
                            splashArrayProductList.push(dataList);
                        }
                    }
                    //localStorage.setItem('VS1SalesProductList', JSON.stringify(splashArrayProductList));
                    $(".fullScreenSpin").css("display", "none");
                    if (splashArrayProductList) {
                        var datatable = $("#tblInventoryCheckbox").DataTable();
                        datatable.clear();
                        datatable.rows.add(splashArrayProductList);
                        datatable.draw(false);
                    }
                })
                .catch(function(err) {
                    $(".fullScreenSpin").css("display", "none");
                });
        }
    },
    "click #productListModal #refreshpagelist": function() {
        $(".fullScreenSpin").css("display", "inline-block");
        localStorage.setItem("VS1SalesProductList", "");
        let templateObject = Template.instance();
        Meteor._reload.reload();
        templateObject.getAllProducts();
    },
    "click .scanProdBarcodePOP": function(event) {
        if (
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                navigator.userAgent
            )
        ) {
            $("#scanBarcodeModalProduct").modal("toggle");
        } else {
            Bert.alert(
                "<strong>Please Note:</strong> This function is only available on mobile devices!",
                "now-dangerorange"
            );
        }
    },
    "click .btnCloseProdModal": function(event) {
        $("#scanBarcodeModalProduct").modal("toggle");
    },
});
