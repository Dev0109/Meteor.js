import { ReactiveVar } from 'meteor/reactive-var';
import { PurchaseBoardService } from '../js/purchase-service';
import { SalesBoardService } from '../js/sales-service';
import { StockTransferService } from './stockadjust-service';
import { UtilityService } from "../utility-service";
import 'jquery-editable-select';
import { Random } from 'meteor/random';
import { SideBarService } from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
let sideBarService = new SideBarService();
let utilityService = new UtilityService();

Template.serialnumberview.onCreated(() => {
    const templateObject = Template.instance();
    templateObject.currentSerialNumber = new ReactiveVar();
    templateObject.serialNumberData = new ReactiveVar();
    templateObject.purchaseOrderData = new ReactiveVar();
    templateObject.salesOrderData = new ReactiveVar();
    templateObject.stockAdjustmentData = new ReactiveVar();
    templateObject.stockTransferData = new ReactiveVar();
    templateObject.invoiceData = new ReactiveVar();
    templateObject.refundData = new ReactiveVar();
});

Template.serialnumberview.onRendered(function() {
    // $('.fullScreenSpin').css('display', 'inline-block');
    let templateObject = Template.instance();

    // Define services
    const purchaseService = new PurchaseBoardService();
    const salesService = new SalesBoardService();
    const stockTransferService = new StockTransferService();

    var currentSerialNumber = FlowRouter.current().queryParams.serialnumber;
    if (currentSerialNumber) {
        templateObject.currentSerialNumber.set(currentSerialNumber);
    }

    // Getting data for serial number history
    templateObject.getAllSerialNumberData = function() {
        getVS1Data('TSerialNumberListCurrentReport').then(async function(dataObject) {
            if (dataObject.length === 0) {
                const serialnumbers = await sideBarService.getAllSerialNumber();
                addVS1Data('TSerialNumberListCurrentReport', JSON.stringify(data));
            } else {
                const data = JSON.parse(dataObject[0].data);
            }
        });
    }
    templateObject.getAllSerialNumberData();

    templateObject.getAllPurchaseOrderData = function() {
        getVS1Data('TPurchaseOrderEx').then(function(dataObject) {
            if (dataObject.length === 0) {
                purchaseService.getAllPurchaseOrderList().then(function(data) {
                });
            } else {
                const data = JSON.parse(dataObject[0].data);

            }
        });
    }
    templateObject.getAllPurchaseOrderData();

    templateObject.getAllSalesOrderData = function() {
        getVS1Data('TSalesOrderEx').then(function(dataObject) {
            if (dataObject.length === 0) {
                salesService.getAllSalesOrderList().then(function(data) {
                });
            } else {
                const data = JSON.parse(dataObject[0].data);
            }
        });
    }
    templateObject.getAllSalesOrderData();


    templateObject.getAllStockAdjustmentData = function() {
        getVS1Data('TStockAdjustmentEX').then(function(dataObject) {
            if (dataObject.length === 0) {
                stockTransferService.getAllStockAdjustmentData(currentPurchaseOrder).then(function(data) {
                });
            } else {
                const data = JSON.parse(dataObject.data);

            }
        });
    }
    templateObject.getAllStockAdjustmentData();
});

Template.serialnumberview.helpers({
    currentSerialNumber: () => {
        return Template.instance().currentSerialNumber.get();
    }
});

Template.serialnumberview.events({
});
