import {SalesBoardService} from './sales-service';
import {PurchaseBoardService} from './purchase-service';
import {ReactiveVar} from 'meteor/reactive-var';
import {UtilityService} from "../utility-service";
import {ProductService} from "../product/product-service";
import {OrganisationService} from '../js/organisation-service';
import '../lib/global/erp-objects';
import 'jquery-ui-dist/external/jquery/jquery';
import 'jquery-ui-dist/jquery-ui';
import {Random} from 'meteor/random';
import {jsPDF} from 'jspdf';
import 'jQuery.print/jQuery.print.js';
import 'jquery-editable-select';
import {SideBarService} from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
import {ContactService} from "../contacts/contact-service";
import { TaxRateService } from "../settings/settings-service";

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
let accountService = new SalesBoardService();
let productService = new ProductService();
let contactService = new ContactService();
let times = 0;
let clickedInput = "";
let isDropDown = false;
let salesDefaultTerms = "";

var template_list = [
    "Sales Order",
    "Delivery Docket",
];

Template.new_workorder.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.workorderrecord = new ReactiveVar();
    templateObject.uploadedFile = new ReactiveVar();
    templateObject.salesOrderId = new ReactiveVar();
    templateObject.workOrderRecords = new ReactiveVar([]);
    templateObject.workOrderLineId = new ReactiveVar(-1);
    templateObject.selectedInputElement = new ReactiveVar();
    templateObject.selectedProcessField = new ReactiveVar();
    templateObject.selectedProductField = new ReactiveVar();
    templateObject.isMobileDevices = new ReactiveVar(false);
    templateObject.bomStructure = new ReactiveVar();
    templateObject.quantityBuild = new ReactiveVar(true);
    templateObject.showBOMModal = new ReactiveVar(false);
})

Template.new_workorder.onRendered(function(){
    const templateObject = Template.instance();
    let salesorderid = FlowRouter.current().queryParams.salesorderid;
    let lineId = FlowRouter.current().queryParams.lineId;



    if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) ||
    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))){
        templateObject.isMobileDevices.set(true);
    }


    //get all work orders
    let temp = localStorage.getItem('TWorkorders');
    templateObject.workOrderRecords.set(temp?JSON.parse(temp):[]);

    templateObject.getWorkorderRecord = function() {


        if(FlowRouter.current().queryParams.id) {
            $('.fullScreenSpin').css('display', 'inline-block')
            let orderid = FlowRouter.current().queryParams.id
            let workorderIndex = templateObject.workOrderRecords.get().findIndex(order => {
                return order.ID == orderid
            })
            let workorder = templateObject.workOrderRecords.get()[workorderIndex]
            templateObject.salesOrderId.set(workorder.SalesOrderID)
            let record = {
                id: orderid,
                salesorderid: workorder.SalesOrderID,
                lid: 'Edit Work Order ' + orderid,
                customer: workorder.Customer || '',
                orderTo: workorder.OrderTo || '',
                ponumber: workorder.PONumber  || '',
                saledate: workorder.SaleDate || "",
                duedate: workorder.DueDate || "",
                line: workorder.Line,
                quantity: workorder.Quantity || 1,
                isStarted: workorder.InProgress,

            }
            templateObject.workorderrecord.set(record);
            templateObject.bomStructure.set(workorder.BOM);
            templateObject.showBOMModal.set(true)
            $('#edtCustomerName').val(record.customer)
            $('.fullScreenSpin').css('display', 'none');

        }else {
                $('.fullScreenSpin').css('display', 'inline-block')

            //check if there is any workorder which order number is matched to salesorderid.
            let workordersCount = 0;
            let workorders = [];
            let tempArray = templateObject.workOrderRecords.get();
            if (tempArray.length > 0) {
                workorders = templateObject.workOrderRecords.get().filter(order=>{
                    return order.SalesOrderID == templateObject.salesOrderId.get();
                })
            }
            workordersCount = workorders.length
            //end checking

            if(templateObject.salesOrderId.get()) {
                getVS1Data('TSalesOrderEx').then(function(dataObject){
                    if(dataObject.length == 0) {
                        accountService.getOneSalesOrderdataEx(templateObject.salesOrderId.get()).then(function(data){
                            let currencySymbol = Currency;
                            let record = {
                                id: data.fields.ID + "_"+(workordersCount + 1).toString(),
                                salesorderid: data.fields.ID,
                                lid: 'Edit Work Order' + ' ' + data.fields.ID + ' - ' + (workordersCount+1).toString(),
                                customer: data.fields.CustomerName,
                                orderTo: data.fields.InvoiceToDesc,
                                ponumber: data.fields.CustPONumber,
                                saledate: data.fields.SaleDate ? moment(data.fields.SaleDate).format('DD/MM/YYYY') : "",
                                duedate: data.fields.DueDate ? moment(data.fields.DueDate).format('DD/MM/YYYY') : "",
                                line: data.fields.Lines[templateObject.workOrderLineId.get()]
                            }
                            record.line.fields.ShipDate = record.line.fields.ShipDate?moment(record.line.fields.ShipDate).format('DD/MM/YYYY'):''
                            templateObject.workorderrecord.set(record);
                            templateObject.showBOMModal.set(true)
                            let name = record.line.fields.ProductName;
                                let bomProductsTemp = localStorage.getItem('TProcTree')?JSON.parse(localStorage.getItem('TProcTree')) : [];
                                let index = bomProductsTemp.findIndex(product=>{
                                    return product.fields.productName == name;
                                })
                            templateObject.bomStructure.set(bomProductsTemp[index].fields)
                            $('#edtCustomerName').val(record.customer)
                            $('.fullScreenSpin').css('display', 'none');

                        })
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        let useData = data.tsalesorderex;
                        for(let d = 0; d< useData.length; d++) {
                            if(parseInt(useData[d].fields.ID) == templateObject.salesOrderId.get()) {
                                let record = {
                                    id: useData[d].fields.ID + "_"+(workordersCount + 1).toString(),
                                    salesorderid: useData[d].fields.ID,
                                    lid: 'Edit Work Order' + ' ' + useData[d].fields.ID + ' - ' + (workordersCount+1).toString(),
                                    customer: useData[d].fields.CustomerName,
                                    orderTo: useData[d].fields.InvoiceToDesc,
                                    ponumber: useData[d].fields.CustPONumber,
                                    saledate: useData[d].fields.SaleDate ? moment(useData[d].fields.SaleDate).format('DD/MM/YYYY') : "",
                                    duedate: useData[d].fields.DueDate ? moment(useData[d].fields.DueDate).format('DD/MM/YYYY') : "",
                                    line: useData[d].fields.Lines[templateObject.workOrderLineId.get()]
                                }
                                record.line.fields.ShipDate = record.line.fields.ShipDate?moment(record.line.fields.ShipDate).format('DD/MM/YYYY'):''

                                templateObject.workorderrecord.set(record);
                                templateObject.showBOMModal.set(true)
                                let name = record.line.fields.ProductName;
                                let bomProductsTemp = localStorage.getItem('TProcTree')?JSON.parse(localStorage.getItem('TProcTree')) : [];
                                let index = bomProductsTemp.findIndex(product=>{
                                    return product.fields.productName == name;
                                })
                                templateObject.bomStructure.set(bomProductsTemp[index].fields)
                                $('#edtCustomerName').val(record.customer)
                                setTimeout(()=>{
                                    $('.fullScreenSpin').css('display', 'none');
                                }, 15000)
                            }
                        }
                    }
                }).catch(function() {
                    accountService.getOneSalesOrderdataEx(templateObject.salesOrderId.get()).then(function(data){
                        let currencySymbol = Currency;
                        let record = {
                            id: data.fields.ID + "_"+(workordersCount + 1).toString(),
                            salesorderid: data.fields.ID,
                            lid: 'Edit Work Order' + ' ' + data.fields.ID + ' - ' + (workordersCount+1).toString(),
                            customer: data.fields.CustomerName,
                            orderTo: data.fields.InvoiceToDesc,
                            ponumber: data.fields.CustPONumber,
                            saledate: data.fields.SaleDate ? moment(data.fields.SaleDate).format('DD/MM/YYYY') : "",
                            duedate: data.fields.DueDate ? moment(data.fields.DueDate).format('DD/MM/YYYY') : "",
                            line: data.fields.Lines[templateObject.workOrderLineId.get()]
                        }
                        record.line.fields.ShipDate = record.line.fields.ShipDate?moment(record.line.fields.ShipDate).format('DD/MM/YYYY'):''
                        templateObject.workorderrecord.set(record);
                        templateObject.showBOMModal.set(true)
                        let name = record.line.fields.ProductName;
                        let bomProductsTemp = localStorage.getItem('TProcTree')?JSON.parse(localStorage.getItem('TProcTree')) : [];
                        let index = bomProductsTemp.findIndex(product=>{
                            return product.fields.productName == name;
                        })
                        templateObject.bomStructure.set(bomProductsTemp[index].fields)
                        $('#edtCustomerName').val(record.customer)
                        $('.fullScreenSpin').css('display', 'none');
                    })
                })
            }
        }
    }
    if(lineId) {
        templateObject.workOrderLineId.set(lineId);
    }
    if(salesorderid){
        templateObject.salesOrderId.set(salesorderid);
    }
    if(!salesorderid) {
        if(FlowRouter.current().queryParams.id) {
            templateObject.getWorkorderRecord();
        }else {
            setTimeout(()=>{
                $('#salesOrderListModal').modal('toggle')
            }, 1000)
        }
    } else {
        templateObject.getWorkorderRecord();
    }



    setTimeout(()=>{
        $("#edtCustomerName").editableSelect();
    }, 500)




    //end getting work orders



})

Template.new_workorder.events({
    'click #salesOrderListModal table tbody tr': function(event) {
        let workorderRecords = [];
        let templateObject = Template.instance();
        let salesorderid = $(event.target).closest('tr').find('.colSalesNo').text();
        templateObject.salesOrderId.set(salesorderid);
        workorderRecords = templateObject.workOrderRecords.get();
        getVS1Data('TSalesOrderEx').then(function(dataObject){
            if(dataObject.length == 0) {
                accountService.getOneSalesOrderdataEx(salesorderid).then(function(data) {
                  let lineItems = data.fields.Lines;
                  for(let i = 0; i< lineItems.length; i ++ ) {
                    let isExisting = false;
                    workorderRecords.map(order => {
                      if(order.Line.fields.ProductName == lineItems[i].fields.ProductName) {
                          isExisting = true
                      }
                    })
                  //   if(lineItems[i].fields.isManufactured == true && isExisting == false) {
                    if(isExisting == false) {
                        let bomProducts = localStorage.getItem('TProcTree')?JSON.parse(localStorage.getItem('TProcTree')):[]
                        let index = bomProducts.findIndex(product => {
                          return product.fields.productName == lineItems[i].fields.ProductName;
                        })
                      if(index > -1) {
                          templateObject.workOrderLineId.set(i);
                          templateObject.getWorkorderRecord()
                          $('#salesOrderListModal').modal('toggle');
                          break;
                      }
                    }
                  }

                  if(templateObject.workOrderLineId.get() == -1) {
                      swal({
                          title: 'Oooops...',
                          text: 'This record is not available to create work order.',
                          type: 'error',
                          showCancelButton: false,
                          confirmButtonText: 'Ok'
                      }).then((result) => {
                          if (result.value) {}
                          else if (result.dismiss === 'cancel') {

                          }
                      });
                  } else {
                    $('#salesOrderListModal').modal('toggle');
                  }
                })
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tsalesorderex;
                for(let d = 0; d< useData.length; d++) {
                    if(parseInt(useData[d].fields.ID) == salesorderid) {
                       let lineItems = useData[d].fields.Lines;
                        for(let i = 0; i< lineItems.length; i ++ ) {
                            let isExisting = false;
                            if(workorderRecords.length> 0) {
                                    for(let j = 0; j< workorderRecords.length; j ++) {
                                        if(workorderRecords[j].Line.fields.ProductName == lineItems[i].fields.ProductName) {
                                            isExisting = true
                                        }
                                    }
                            }
                          //   if(lineItems[i].fields.isManufactured == true && isExisting == false) {
                            if(isExisting == false) {
                                let bomProducts = localStorage.getItem('TProcTree')?JSON.parse(localStorage.getItem('TProcTree')):[];
                                let index = bomProducts.findIndex(product => {
                                    return product.fields.productName == lineItems[i].fields.ProductName;
                                })
                                if(index > -1) {
                                    templateObject.workOrderLineId.set(i);
                                    templateObject.getWorkorderRecord()
                                    $('#salesOrderListModal').modal('toggle');
                                    break
                                }
                            }
                          }

                          if(templateObject.workOrderLineId.get() == -1) {
                              swal({
                                  title: 'Oooops...',
                                  text: 'This record is not available to create work order.',
                                  type: 'error',
                                  showCancelButton: false,
                                  confirmButtonText: 'Cancel'
                              }).then((result) => {
                                  if (result.value) {}
                                  else if (result.dismiss === 'cancel') {

                                  }
                              });
                          }else{
                            $('#salesOrderListModal').modal('toggle');
                          }
                    }
                }
            }
        }).catch(function(err){
            accountService.getOneSalesOrderdataEx(salesorderid).then(function(data) {
               let lineItems = data.fields.Lines;
               for(let i = 0; i< lineItems.length; i ++ ) {
                let isExisting = false;
                workorderRecords.map(order => {
                      if(order.Line.fields.ProductName == lineItems[i].fields.ProductName) {
                      isExisting = true
                  }
                })
              //   if(lineItems[i].fields.isManufactured == true && isExisting == false) {
                if(isExisting == false) {
                    let bomProducts = localStorage.getItem('TProcTree')?JSON.parse(localStorage.getItem('TProcTree')):[]
                    let index = bomProducts.findIndex(product => {
                        return product.fields.productName == lineItems[i].fields.ProductName;
                    })
                    if(index > -1) {
                        templateObject.workOrderLineId.set(i);
                        templateObject.getWorkorderRecord()
                        $('#salesOrderListModal').modal('toggle');
                        break
                    }
                }
              }

              if(templateObject.workOrderLineId.get() == -1) {
                  swal({
                      title: 'Oooops...',
                      text: err,
                      type: 'error',
                      showCancelButton: false,
                      confirmButtonText: 'This record is not available to create work order.'
                  }).then((result) => {
                      if (result.value) {}
                      else if (result.dismiss === 'cancel') {

                      }
                  });
              }else{
                $('#salesOrderListModal').modal('toggle');
              }
            })
        })

        // consider the api for product has field named 'isManufactured'

    },

    'click .btnSave': function(event) {
        let templateObject = Template.instance();
        playSaveAudio();
        setTimeout(async function(){
        $('.fullScreenSpin').css('display', 'inline-block');
        let mainOrderStart = new Date();

        async function getStockCount(productName) {
            return new Promise(async(resolve, reject)=>{
                getVS1Data('TProductVS1').then(function(dataObject) {
                    if(dataObject.length == 0) {
                        productService.getOneProductdatavs1byname(productName).then(function(data) {
                            resolve(data.tproduct[0].fields.TotalQtyInStock)                            
                        })
                    }else {
                        let data = JSON.parse(dataObject[0].data);
                        let useData = data.tproductvs1;
                        for(let o=0; o<useData.length; o++) {
                            if(useData[o].fields.ProductName == productName) {
                                resolve(useData[o].fields.TotalQtyInStock)
                            }
                        }
                    }
                }).catch(function(e) {
                    productService.getOneProductdatavs1byname(productName).then(function(data) {
                        resolve(data.tproduct[0].fields.TotalQtyInStock)                            
                    })
                })
            })
        }

        async function getSupplierDetail ()  {
            return new Promise(async(resolve, reject)=>{
                let supplierName = 'Misc Supplier';
                
                contactService.getOneSupplierDataExByName(supplierName).then(function(dataObject) {
                    let data = dataObject.tsupplier;
                    if(data.length > 0) {
                        let clientName = data[0].fields.ClientName;
                        let street = data[0].fields.Street || '';
                        let city = data[0].fields.Street2 || '';
                        let state = data[0].fields.State || '';
                        let zipCode = data[0].fields.Postcode || '';
                        let country = data[0].fields.Country || '';
                        
                        let postalAddress = data[0].fields.ClientName + '\n' + street + '\n' + city + ' ' + state + ' ' + zipCode + '\n' + country;
                        resolve(postalAddress)
                    }else {
                        resolve('')
                    }
                }).catch(function(e) {
                    resolve('')
                })
            })


        }

        async function createPurchaseOrder(productName, neededQty) {
            return new Promise(async(resolve, reject)=>{
                let foreignCurrencyFields = {
                    ForeignExchangeCode: CountryAbbr,
                    ForeignExchangeRate: 0.00,
                }
                let purchaseService = new PurchaseBoardService();
                getVS1Data('TProductVS1').then(async function(dataObject){
                    if(dataObject.length == 0) {
                        productService.getOneProductdatavs1byname(productName).then(async function(data) {
                            let stockQty = data.tproduct[0].fields.TotalQtyInStock;
                            if(stockQty < neededQty) {
                                let splashLineArray = [];

                                let tdunitprice = utilityService.modifynegativeCurrencyFormat(Math.floor(data.tproduct[0].fields.BuyQty1Cost * 100) / 100);
                                let lineItemObjForm = {
                                    type: "TPurchaseOrderLine",
                                    fields: {
                                        ProductName: productName || '',
                                        ProductDescription: data.tproduct[0].fields.ProductDescription || '',
                                        UOMQtySold: parseFloat(neededQty - stockQty),
                                        UOMQtyShipped: 0,
                                        LineCost: Number(tdunitprice.replace(/[^0-9.-]+/g, "")) || 0,
                                        CustomerJob: '',
                                        LineTaxCode: data.tproduct[0].fields.TaxCodeSales || '',
                                        LineClassName: defaultDept
                                    }
                                };

                                splashLineArray.push(lineItemObjForm);
                                let billingAddress = await getSupplierDetail();
                                let saledateTime = new Date();
                                let date =  saledateTime.getFullYear() + "-" + (saledateTime.getMonth() + 1) + "-" + saledateTime.getDate()

                                let objDetails = {
                                    type: "TPurchaseOrderEx",
                                    fields: {
                                        SupplierName: 'Misc Supplier',
                                        ...foreignCurrencyFields,
                                        SupplierInvoiceNumber: ' ',
                                        Lines: splashLineArray,
                                        OrderTo: billingAddress,
                                        OrderDate: date,
            
                                        SupplierInvoiceDate: date,
            
                                        SaleLineRef: '',
                                        TermsName: 'COD',
                                        Shipping: '',
                                        ShipTo: billingAddress,
                                        Comments: '',
                                        SalesComments: '',
                                        Attachments: [],
                                        OrderStatus: ''
                                    }
                                };
                                purchaseService.savePurchaseOrderEx(objDetails).then(function(dataReturn) {
                                    sideBarService.getAllTPurchasesBackOrderReportData('', '', true, initialReportLoad, 0).then(function(data)  {
                                        addVS1Data('TPurchasesBackOrderReport', JSON.stringify(data)).then(function (dataUpdate) {
                                            resolve()
                                        })
                                    })
                                }).catch(function(err) {
                                    resolve()
                                })
                            }else {
                                resolve()
                            }
                        })
                    }else {
                        let data = JSON.parse(dataObject[0].data);
                        let useData = data.tproductvs1;
                        for(let i = 0; i< useData.length; i++) {
                            if(useData[i].fields.ProductName == productName) {
                                let stockQty = useData[i].fields.TotalQtyInStock;
                                if(stockQty < neededQty) {
                                    let splashLineArray = [];
            
                                    let tdunitprice = utilityService.modifynegativeCurrencyFormat(Math.floor(useData[i].fields.BuyQty1Cost * 100) / 100);
                                    let lineItemObjForm = {
                                        type: "TPurchaseOrderLine",
                                        fields: {
                                            ProductName: productName || '',
                                            ProductDescription: useData[i].fields.ProductDescription || '',
                                            UOMQtySold: parseFloat(neededQty - stockQty),
                                            UOMQtyShipped: 0,
                                            LineCost: Number(tdunitprice.replace(/[^0-9.-]+/g, "")) || 0,
                                            CustomerJob: '',
                                            LineTaxCode: data.tproduct[0].fields.TaxCodeSales || '',
                                            LineClassName: defaultDept
                                        }
                                    };
            
                                    splashLineArray.push(lineItemObjForm);
                                    let billingAddress = await getSupplierDetail();
                                    let saledateTime = new Date();
                                    let date =  saledateTime.getFullYear() + "-" + (saledateTime.getMonth() + 1) + "-" + saledateTime.getDate()
            
                                    let objDetails = {
                                        type: "TPurchaseOrderEx",
                                        fields: {
                                            SupplierName: 'Misc Supplier',
                                            ...foreignCurrencyFields,
                                            SupplierInvoiceNumber: ' ',
                                            Lines: splashLineArray,
                                            OrderTo: billingAddress,
                                            OrderDate: date,
                
                                            SupplierInvoiceDate: date,
                
                                            SaleLineRef: '',
                                            TermsName: 'COD',
                                            Shipping: '',
                                            ShipTo: billingAddress,
                                            Comments: '',
                                            SalesComments: '',
                                            Attachments: [],
                                            OrderStatus: ''
                                        }
                                    };
                                    purchaseService.savePurchaseOrderEx(objDetails).then(function(dataReturn) {
                                        sideBarService.getAllTPurchasesBackOrderReportData('', '', true, initialReportLoad, 0).then(function(data)  {
                                            addVS1Data('TPurchasesBackOrderReport', JSON.stringify(data)).then(function (dataUpdate) {
                                                resolve()
                                            })
                                        })
                                    }).catch(function(err) {
                                        resolve()
                                    })
                                }else {
                                    resolve()
                                }
                            }
                        }
                    }
                }).catch(async function(error) {
                    productService.getOneProductdatavs1byname(productName).then(async function(data) {
                        let stockQty = data.tproduct[0].fields.TotalQtyInStock;
                        if(stockQty < neededQty) {
                            let splashLineArray = [];

                            let tdunitprice = utilityService.modifynegativeCurrencyFormat(Math.floor(data.tproduct[0].fields.BuyQty1Cost * 100) / 100);
                            let lineItemObjForm = {
                                type: "TPurchaseOrderLine",
                                fields: {
                                    ProductName: productName || '',
                                    ProductDescription: data.tproduct[0].fields.ProductDescription || '',
                                    UOMQtySold: parseFloat(neededQty - stockQty),
                                    UOMQtyShipped: 0,
                                    LineCost: Number(tdunitprice.replace(/[^0-9.-]+/g, "")) || 0,
                                    CustomerJob: '',
                                    LineTaxCode: data.tproduct[0].fields.TaxCodeSales || '',
                                    LineClassName: defaultDept
                                }
                            };

                            splashLineArray.push(lineItemObjForm);
                            let billingAddress = await getSupplierDetail();
                            let saledateTime = new Date();
                            let date =  saledateTime.getFullYear() + "-" + (saledateTime.getMonth() + 1) + "-" + saledateTime.getDate()

                            let objDetails = {
                                type: "TPurchaseOrderEx",
                                fields: {
                                    SupplierName: 'Misc Supplier',
                                    ...foreignCurrencyFields,
                                    SupplierInvoiceNumber: ' ',
                                    Lines: splashLineArray,
                                    OrderTo: billingAddress,
                                    OrderDate: date,
        
                                    SupplierInvoiceDate: date,
        
                                    SaleLineRef: '',
                                    TermsName: 'COD',
                                    Shipping: '',
                                    ShipTo: billingAddress,
                                    Comments: '',
                                    SalesComments: '',
                                    Attachments: [],
                                    OrderStatus: ''
                                }
                            };
                            purchaseService.savePurchaseOrderEx(objDetails).then(function(dataReturn) {
                                sideBarService.getAllTPurchasesBackOrderReportData('', '', true, initialReportLoad, 0).then(function(data)  {
                                    addVS1Data('TPurchasesBackOrderReport', JSON.stringify(data)).then(function (dataUpdate) {
                                        resolve()
                                    })
                                })
                            }).catch(function(err) {
                                resolve()
                            })
                        }else {
                            resolve()
                        }
                    })
                })
            })
        }

        async function saveSubOrders () {
            let record = templateObject.workorderrecord.get();
            let bomStructure = templateObject.bomStructure.get();
    
            let totalWorkOrders = localStorage.getItem('TWorkorders')?JSON.parse(localStorage.getItem('TWorkorders')): []
            let savedworkorders = totalWorkOrders.filter(order => {
                return order.SalesOrderID == templateObject.salesOrderId.get();
            })
            let count = savedworkorders.length;
            if(bomStructure.subs && bomStructure.subs.length > 0) {
                for(let k = 0; k< bomStructure.subs.length; k++) {
                    let subs = bomStructure.subs[k];
                    if(subs.isBuild == true) {
                        async function getProductionPlanData() {
                            return new Promise(async(resolve, reject)=>{
                                let returnVal = [];
                                getVS1Data('TProductionPlanData').then(function(dataObject) {
                                    if(dataObject.length == 0) {
                                        resolve(returnVal)
                                    }else {
                                        returnVal = JSON.parse(dataObject[0].data.tproductionplandata[0].fields.events);
                                        if(returnVal == undefined) {
                                            returnVal = [];
                                        }
                                        resolve(returnVal)
                                    }
                                }).catch(function(e) {
                                    resolve(returnVal)
                                })
                            }) 
                        }
                        async function saveOneSubOrder() {
                            return new Promise(async(resolve, reject)=>{
                                let subProductName = subs.productName;
                                let plans = await getProductionPlanData();
                                let tempPlans = JSON.parse(JSON.stringify(plans));
                                tempPlans = tempPlans.filter(plan=>plan.resourceName == subs.process);
                                let subStart = new Date();
                                if (tempPlans.length > 0) {
                                    subStart = new Date(Math.max.apply(null, tempPlans.map(function(e) {
                                        return new Date(e.end);
                                    })));
                                }

                                let subDetail = {
                                    ID: templateObject.salesOrderId.get() + "_" + (count + k + 1).toString(),
                                    Customer: $('#edtCustomerName').val() || '',
                                    OrderTo: $('#txabillingAddress').val() || '',
                                    PONumber: $('#ponumber').val()||'',
                                    SaleDate: $('#dtSODate').val() || '',
                                    DueDate: record.duedate,
                                    BOM: subs,
                                    SalesOrderID: templateObject.salesOrderId.get(),
                                    OrderDate: new Date().toLocaleString(),
                                    StartTime: subStart.toLocaleString(),
                                    InProgress: record.isStarted,
                                    Quantity: record.line.fields.Qty? record.line.fields.Qty* parseFloat(subs.qty) : subs.qty
                                }

                                if(subs.subs&&subs.subs.length > 0) {
                                    for(let n=0; n<subs.subs.length; n++) {
                                        let rawName = subs.subs[n].productName;
                                        let neededQty = subs.subs[n].qty * subDetail.Quantity;
                                        await createPurchaseOrder(rawName, neededQty)
                                    }
                                }
                                let subEnd = new Date();
                                subEnd.setTime(subStart.getTime() + subDetail.Quantity * subs.duration * 3600000);
                                if(subEnd.getTime() > mainOrderStart.getTime()) {
                                    mainOrderStart = subEnd;
                                }

            
                                getVS1Data('TProductVS1').then(function(dataObject) {
                                    if(dataObject.length == 0) {
                                        productService.getOneProductdatavs1byname(subProductName).then(function(data){
            
                                            let line = JSON.parse(JSON.stringify(record.line));
                                            line.fields.ProductName = subProductName;
                                            line.fields.Product_Description = data.tproduct[0].fields.ProductDescription;
                                            line.fields.ProductID = data.tproduct[0].fields.ID;
                                            line.fields.Qty = record.line.fields.Qty * parseFloat(subs.qty)
                                            subDetail = {...subDetail, Line: line};
            
                                            let tempArray = localStorage.getItem('TWorkorders');
                                            let workorders = tempArray?JSON.parse(tempArray): [];
                                            workorders = [...workorders, subDetail];
                                            localStorage.setItem('TWorkorders', JSON.stringify(workorders));
                                            resolve();
                                        })
                                    }else {
                                        let data = JSON.parse(dataObject[0].data);
                                        let useData = data.tproductvs1;
                                        for(let i=0 ; i< useData.length; i++) {
                                            if(useData[i].fields.ProductName == subProductName) {
                                                    let line = JSON.parse(JSON.stringify(record.line));
                                                    line.fields.ProductName = subProductName;
                                                    line.fields.Product_Description = useData[i].fields.ProductDescription;
                                                    line.fields.ProductID = useData[i].fields.ID;
                                                    line.fields.Qty = record.line.fields.Qty * parseFloat(subs.qty)
                                                    subDetail = {...subDetail, Line: line};
                                                    let tempArray = localStorage.getItem('TWorkorders');
                                                    let workorders = tempArray?JSON.parse(tempArray): [];
                                                    workorders = [...workorders, subDetail];
                                                    localStorage.setItem('TWorkorders', JSON.stringify(workorders));
                                                    resolve();
                                            } else if (i == useData.length -1) {
                                                resolve();
                                            }
                                        }
                                    }
                                }).catch(function(err){
                                    productService.getOneProductdatavs1byname(subProductName).then(function(data){
                                        let line = JSON.parse(JSON.stringify(record.line));
                                        line.fields.ProductName = subProductName;
                                        line.fields.Product_Description = data.tproduct[0].fields.ProductDescription;
                                        line.fields.ProductID = data.tproduct[0].fields.ID;
                                        line.fields.Qty = record.line.fields.Qty * parseFloat(subs.qty)
                                        subDetail = {...subDetail, Line: line};
                                        let tempArray = localStorage.getItem('TWorkorders');
                                        let workorders = tempArray?JSON.parse(tempArray): [];
                                        workorders = [...workorders, subDetail];
                                        localStorage.setItem('TWorkorders', JSON.stringify(workorders));
                                        resolve();
                                    }).catch(function(error){
                                        resolve();
                                    })
                                })
                            })
                        }
                        await saveOneSubOrder();
                    }
    
                }
            }
        }

        await saveSubOrders();

        async function saveMainOrders() {

            let record = templateObject.workorderrecord.get();
            let temp = JSON.parse(JSON.stringify(record));
            temp = {...temp, isStarted: true}
            templateObject.workorderrecord.set(temp);
            record = templateObject.workorderrecord.get();
            
            let objDetail = {
                ID: record.id,
                Customer: $('#edtCustomerName').val() || '',
                OrderTo: $('#txabillingAddress').val() || '',
                PONumber: $('#ponumber').val()||'',
                SaleDate: $('#dtSODate').val() || '',
                DueDate: record.duedate,
                Line: record.line,
                BOM: templateObject.bomStructure.get(),
                SalesOrderID: templateObject.salesOrderId.get(),
                OrderDate: new Date().toLocaleString(),
                StartTime: mainOrderStart.toLocaleString(),
                Quantity: record.line.fields.Qty || 1,
                InProgress: record.isStarted,
            }
            let tempArray = localStorage.getItem('TWorkorders');
            let workorders = tempArray?JSON.parse(tempArray): [];
            objDetail.ID = objDetail.SalesOrderID+ "_" + (workorders.length + 1).toString();
            workorders = [...workorders, objDetail];
            localStorage.setItem('TWorkorders', JSON.stringify(workorders));
        }

        await saveMainOrders();

        

        $('.fullScreenSpin').css('display', 'none');
        swal({
            title: 'Success',
            text: 'Work Order has been saved successfully',
            type: 'success',
            showCancelButton: false,
            confirmButtonText: 'Continue',
        }).then ((result)=>{
            FlowRouter.go('/workorderlist')
        });


    }, delayTimeAfterSound);
    },

    'click #tblWorkOrderLine tbody tr': function(event) {
        event.preventDefault();
        event.stopPropagation();
        let templateObject = Template.instance();
        let productName = $(event.target).closest('tr').find('input.lineProductName').val()
        let tempBOMs = localStorage.getItem('TProcTree');
        // let bomProducts = tempBOMs?JSON.parse(tempBOMs):[];
        // // let workorders = localStorage.getItem('TWorkorders')? JSON.parse(localStorage.getItem('TWorkorders')): []
        // let bomIndex = bomProducts.findIndex(product=>{
        //     return product.fields.productName == productName
        // })
        // let product;
        // let bomstructure = templateObject.bomStructure.get();
        // if( !bomstructure || bomstructure == null) {
        //     $('#edtMainProductName').val(productName);
        //     $('#BOMSetupModal').modal('toggle')
        //     $('#edtProcess').editableSelect();
        //     $('#BOMSetupModal .edtProductName').editableSelect();
        //     if(bomIndex > -1) {
        //         product = bomProducts[bomIndex].fields
        //     }
        // }else {
        //     $('#edtMainProductName').val(productName);
        //     $('#BOMSetupModal').modal('toggle')
        //     $('#edtProcess').editableSelect();
        //     $('#BOMSetupModal .edtProductName').editableSelect();
        //     product = templateObject.bomStructure.get()
        // }
        // $('.edtProcess').val(product.process)
        // $('.edtProcessNote').val(product.processNote)
        // let subs = product.subs;
        // if(!subs || subs.length == 0) {
        //     return
        // }
        // for(let i = 0; i< subs.length; i++) {
        //     let rows = $('#BOMSetupModal .modal-body').find('.product-content');
        //     let lastrow = rows[rows.length-1]
        //     let addedRow = "<div class='product-content'>"+
        //     "<div class='d-flex productRow'>"+
        //     "<div class='colProduct form-group d-flex'>";
        //     if(subs[i].subs && subs[i].subs.length > 0) {
        //         //check if this sub has already been built
        //         let isBuilt = false;
        //         let workorders = localStorage.getItem('TWorkorders')?JSON.parse(localStorage.getItem('TWorkorders')): []
        //         let workorderindex = workorders.findIndex(order => {
        //             return order.SalesOrderID == templateObject.salesOrderId.get() && order.Line.fields.ProductName == subs[i].productName;
        //         })
        //         if(workorderindex > -1) {
        //             isBuilt = true;
        //         }
        //         if(isBuilt == false) {
        //             addedRow += "<div style='width: 29%'><button class='btn btn-danger btn-from-stock w-100 px-0'>FROM STOCK</button></div>" +
        //                 "<select type='search' class='edtProductName form-control' style='width: 70%'></select>"+
        //                 "</div>"+
        //                 "<div class='colQty form-group'><input type='text' class='form-control edtQuantity w-100'/></div>"+
        //                 "<div class='colProcess form-group'><select type='search' class='edtProcessName form-control w-100' disabled style='background-color: #ddd'></select></div>"+
        //                 "<div class='colNote form-group'><input type='text' class='edtProcessNote form-control w-100' disabled style='background-color: #ddd'/></div>"+
        //                 "<div class='colAttachment form-group'><a class='btn btn-primary btnAddAttachment' role='button' data-toggle='modal' href='#myModalAttachment-MemoOnly' id='btn_Attachment' name='btn_Attachment'><i class='fa fa-paperclip' style='padding-right: 8px;'></i>Add Attachments</a><div class='d-none attachedFiles'></div></div>" +
        //                 "<div class='colDelete d-flex align-items-center justify-content-center'><button class='btn btn-danger btn-rounded btn-sm my-0 btn-remove-raw'><i class='fa fa-remove'></i></button></div>" +
        //                 "</div>"+
        //                 "</div>";
        //         }else {
        //             addedRow += "<div style='width: 29%'><button class='btn btn-success btn-product-build w-100 px-0'>Build</button></div>" +
        //                 "<select type='search' class='edtProductName form-control' style='width: 70%'></select>"+
        //                 "</div>"+
        //                 "<div class='colQty form-group'><input type='text' class='form-control edtQuantity w-100'/></div>"+
        //                 "<div class='colProcess form-group'><select type='search' class='edtProcessName form-control w-100' disabled style='background-color: #ddd'></select></div>"+
        //                 "<div class='colNote form-group'><input type='text' class='edtProcessNote form-control w-100' disabled style='background-color: #ddd'/></div>"+
        //                 "<div class='colAttachment form-group'><a class='btn btn-primary btnAddAttachment' role='button' data-toggle='modal' href='#myModalAttachment-MemoOnly' id='btn_Attachment' name='btn_Attachment'><i class='fa fa-paperclip' style='padding-right: 8px;'></i>Add Attachments</a><div class='d-none attachedFiles'></div></div>" +
        //                 "<div class='colDelete d-flex align-items-center justify-content-center'><button class='btn btn-danger btn-rounded btn-sm my-0 btn-remove-raw'><i class='fa fa-remove'></i></button></div>" +
        //                 "</div>";


        //             for(let j = 0; j< subs[i].subs.length; j++) {
        //                 let addRowHtml = "<div class='d-flex productRow'>" +
        //                 "<div class= 'd-flex colProduct form-group'>" +
        //                 "<div style='width: 60%'></div>" +
        //                 "<input class='edtProductName edtRaw form-control es-input' autocomplete='false' type='search' style='width: 70%' value ='"+subs[i].subs[j].productName+"'/>" +
        //                 "</div>" +
        //                 "<div class='colQty form-group'>" +
        //                 "<input type='text' class='edtQuantity w-100 form-control' value='" + subs[i].subs[j].qty + "'/>" +
        //                 "</div>" +
        //                 "<div class='colProcess form-group'>"+
        //                 "<input type='search' autocomplete='off' class='edtProcessName form-control w-100 es-input' autocomplete = 'false' value='"+subs[i].subs[j].process+"'/>"+
        //                 "</div>" +
        //                 "<div class='colNote form-group'></div>" +
        //                 "<div class='colAttachment'></div>" +
        //                 "<div class='d-flex colDelete align-items-center justify-content-center'><button class='btn btn-danger btn-rounded btn-sm my-0 btn-remove-raw'><i class='fa fa-remove'></i></button></div>" +
        //                 "</div>";

        //                 // $(lastrow).append(addRowHtml);
        //                 // let elements = $(lastrow).find('.edtProductName')
        //                 // $(elements[elements.length - 1]).editableSelect();
        //                 // let inputElements = $(lastrow).find('input.edtProductName');
        //                 // $(inputElements[inputElements.length - 1]).val(subs[i].subs[j].productName)
        //                 // let processes = $(lastrow).find('.edtProcessName');
        //                 // $(processes[processes.length - 1]).editableSelect();
        //                 // let processElements = $(lastrow).find('input.edtProcessName');
        //                 // $(processElements[processElements.length-1]).val(subs[i].subs[j].process);
        //                 addedRow += addRowHtml;
        //             }

        //             addedRow += "</div>";
        //         }
        //     //end check
        //     }else {
        //         addedRow += "<div style='width: 29%'></div>" +
        //         "<select type='search' class='edtProductName form-control' style='width: 70%'></select>"+
        //         "</div>"+
        //         "<div class='colQty form-group'><input type='text' class='form-control edtQuantity w-100'/></div>"+
        //         "<div class='colProcess form-group'></div><div class='colNote form-group'></div><div class='colAttachment form-group'></div><div class='colDelete d-flex align-items-center justify-content-center'><button class='btn btn-danger btn-rounded btn-sm my-0 btn-remove-raw'><i class='fa fa-remove'></i></button></div>"+
        //         "</div>"+
        //         "</div>";
        //     }
        //     $(lastrow).before(addedRow)
        //     let productContents = $('#BOMSetupModal .modal-body').find('.product-content');
        //     $(productContents[productContents.length-2]).find('.edtProductName').editableSelect();
        //     $(productContents[productContents.length-2]).find('.edtProcessName').editableSelect();

        //     let productNameElements = $(productContents[productContents.length-2]).find('input.edtProductName');
        //     $(productNameElements[0]).val(subs[i].productName)
        //     let productQuantityElements =  $(productContents[productContents.length-2]).find('input.edtQuantity');
        //     $(productQuantityElements[0]).val(subs[i].qty);
        //     let processNameElements = $(productContents[productContents.length-2]).find('input.edtProcessName');
        //     $(processNameElements[0]).val(subs[i].process);
        //     let processNoteElements = $(productContents[productContents.length-2]).find('input.edtProcessNote');
        //     $(processNoteElements[0]).val(subs[i].processNote)
        //     // $(productContents[productContents.length-2]).find('input.edtProductName').val(subs[i].productName)
        //     // $(productContents[productContents.length-2]).find('input.edtQuantity').val(subs[i].qty)
        //     // $(productContents[productContents.length-2]).find('input.edtProcessName').val(subs[i].process)
        //     // $(productContents[productContents.length-2]).find('input.edtProcessNote').val(subs[i].processNote)

        // }
        $('#BOMSetupModal').modal('toggle')
    },
    'change .edtQuantity' : function(event) {
        let value = $(event.target).val();
        value = parseFloat(value).toFixed(5);
        $(event.target).val(value);
    },

})

Template.new_workorder.helpers({
    workorderrecord: ()=>{
        return Template.instance().workorderrecord.get()
    },

    uploadedFile : () => {
        return Template.instance().uploadedFile.get()
    },
    quantityBuild: ()=> {
        return Template.instance().quantityBuild.get()
    },

    showBOMModal: ()=> {
        return Template.instance().showBOMModal.get()
    },

    isMobileDevices: ()=> {
        return Template.instance().isMobileDevices.get()
    }

})

Template.new_workorder.events({
    // 'click #BOMSetupModal .edtProductName': function(event) {
    //     // let targetElement = $(event.target);
    //     // let templateObject = Template.instance();
    //     // templateObject.selectedInputElement.set(targetElement);
    //     // $('#productListModal').modal('toggle');


    //     let templateObject = Template.instance();
    //     let colProduct = $(event.target).closest('div.colProduct');
    //     $(event.target).editableSelect()
    //     templateObject.selectedProductField.set($(colProduct).children('.edtProductName'))
    //     // templateObject.selectedProductField.set($(event.target))
    //     $('#productListModal').modal('toggle');
    // },

    // 'click #BOMSetupModal .edtProcessName': function(event) {
    //     let targetElement = $(event.target);
    //     let colProcess = $(event.target).closest('div.colProcess');
    //     let templateObject = Template.instance();
    //     $(event.target).editableSelect();
    //     templateObject.selectedProcessField.set($(colProcess).children('.edtProcessName'));
    //     $('#processListModal').modal('toggle');
    // },

    // 'click #productListModal table tbody tr': function(event) {
    //     let name = $(event.target).closest('tr').find('.productName').text();
    //     let templateObject = Template.instance();
    //     let targetElement = templateObject.selectedProductField.get();
    //     $(targetElement).val(name)
    //     let temp = localStorage.getItem('TProcTree');
    //     let bomProducts  = temp?JSON.parse(temp):[];
    //     let index = bomProducts.findIndex(product => {
    //         return product.fields.productName == name;
    //     })
    //     let removeDiv = $(targetElement).parent().find('div');
    //     $(removeDiv).remove();
    //     if(index > -1) {
    //         $(targetElement).before("<div style='width: 29%'><button class='btn btn-danger btn-from-stock w-100 px-0'>FROM STOCK</button></div>")

    //         let row = $(targetElement).closest('div.productRow');
    //         $(row).find('.colProcess').empty();
    //         $(row).find('.colProcess').append("<select type='search' class='form-control edtProcessName'></select>")
    //         $(row).find('.colNote').empty()
    //         $(row).find('.colNote').append("<input type='text' class='form-control edtProcessNote'/>")
    //         $(row).find('.edtProcessName').editableSelect();
    //         $(row).find('.edtProcessName').val(bomProducts[index].fields.process)
    //         $(row).find('.edtProcessName').prop('disabled', true)
    //         $(row).find('.edtProcessName').css('background', '#ddd')
    //         $(row).find('.edtProcessNote').val(bomProducts[index].fields.processNote);
    //         $(row).find('.edtProcessNote').prop('disabled', true)
    //         $(row).find('.edtProcessNote').css('background', '#ddd');

    //         let parent = row.parent();


    //         let grandParent = parent.parent();
    //         let modalElement = $(row).closest('.modal#BOMSetupModal');
    //         let topParent = modalElement.parent();

    //         let colAttachment = $(row).find('.colAttachment')


    //         let productContentCount = $(grandParent).find('.product-content').length;
    //         $(colAttachment).append("<a class='btn btn-primary btnAddAttachment' role='button' data-toggle='modal' href='#myModalAttachment-"+productContentCount+"' id='btn_Attachment' name='btn_Attachment'>"+
    //                     "<i class='fa fa-paperclip' style='padding-right: 8px;'></i>Add Attachments</a><div class='d-none attachedFiles'></div>")

    //         let attachModalHtml = "<div class='modal fade' role='dialog' tabindex='-1' id='myModalAttachment-"+productContentCount+"'>" +
    //         "<div class='modal-dialog modal-dialog-centered' role='document'>" +
    //             "<div class='modal-content'>" +
    //                 "<div class='modal-header'>" +
    //                     "<h4>Upload Attachments</h4><button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>×</span></button>" +
    //                 "</div>" +
    //                 "<div class='modal-body' style='padding: 0px;'>" +
    //                     "<div class='divTable file-display'>" +
    //                         "<div class='col inboxcol1'>" +
    //                             "<img src='/icons/nofiles_icon.jpg' class=' style='width:100%;'>" +
    //                         "</div>" +
    //                         "<div class='col inboxcol2' style='text-align: center;'>" +
    //                             "<div>Upload files or add files from the file library.</div>"
    //                             if(templateObject.isMobileDevices.get() == true) {
    //                                 attachModalHtml = attachModalHtml +"<div>Capture copies of receipt's or take photo's of completed jobs.</div>"
    //                             }


    //                                         attachModalHtml = attachModalHtml + "<p style='color: #ababab;'>Only users with access to your company can view these files</p>" +
    //                                     "</div>" +
    //                                 "</div>" +
    //                             "</div>"+
    //                             "<div class='modal-footer'>";
    //                             if(templateObject.isMobileDevices.get() == true) {
    //                                 attachModalHtml = attachModalHtml +"<input type='file' class='img-attachment-upload' id='img-attachment-upload' style='display:none' accept='image/*' capture='camera'>" +
    //                                 "<button class='btn btn-primary btnUploadFile img_new_attachment_btn' type='button'><i class='fas fa-camera' style='margin-right: 5px;'></i>Capture</button>" +

    //                                 "<input type='file' class='attachment-upload' id='attachment-upload' style='display:none' multiple accept='.jpg,.gif,.png'>"
    //                             }else {
    //                                 attachModalHtml = attachModalHtml + "<input type='file' class='attachment-upload' id='attachment-upload' style='display:none' multiple accept='.jpg,.gif,.png,.bmp,.tiff,.pdf,.doc,.docx,.xls,.xlsx,.ppt," +
    //                                 ".pptx,.odf,.csv,.txt,.rtf,.eml,.msg,.ods,.odt,.keynote,.key,.pages-tef," +
    //                                 ".pages,.numbers-tef,.numbers,.zip,.rar,.zipx,.xzip,.7z,image/jpeg," +
    //                                 "image/gif,image/png,image/bmp,image/tiff,application/pdf," +
    //                                 "application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document," +
    //                                 "application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet," +
    //                                 "application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation," +
    //                                 "application/vnd.oasis.opendocument.formula,text/csv,text/plain,text/rtf,message/rfc822," +
    //                                 "application/vnd.ms-outlook,application/vnd.oasis.opendocument.spreadsheet," +
    //                                 "application/vnd.oasis.opendocument.text,application/x-iwork-keynote-sffkey," +
    //                                 "application/vnd.apple.keynote,application/x-iwork-pages-sffpages," +
    //                                 "application/vnd.apple.pages,application/x-iwork-numbers-sffnumbers," +
    //                                 "application/vnd.apple.numbers,application/zip,application/rar," +
    //                                 "application/x-zip-compressed,application/x-zip,application/x-7z-compressed'>"
    //                             }
    //                             attachModalHtml = attachModalHtml +
    //                                 "<button class='btn btn-primary btnUploadFile new_attachment_btn' type='button'><i class='fa fa-cloud-upload' style='margin-right: 5px;'></i>Upload</button>" +
    //                                 "<button class='btn btn-success closeModal' data-dismiss='modal' type='button' style='margin-right: 5px;' autocomplete='off'>" +
    //                                     "<i class='fa fa-save' style='padding-right: 8px;'></i>Save" +
    //                                 "</button>" +
    //                                 "<button class='btn btn-secondary' data-dismiss='modal' type='button'><i class='fa fa-remove' style='margin-right: 5px;'></i>Close</button>" +
    //                             "</div>"+
    //                         "</div>"+
    //                     "</div>"+
    //                 "</div>"
    //                     topParent.append(attachModalHtml);

    //             }else {
    //                 $(targetElement).before("<div style='width: 29%'></div>")
    //             }
    //     $('#productListModal').modal('toggle')
    // },

    // 'click #processListModal table tr': function(event) {
    //     let templateObject = Template.instance()
    //     let processName = $(event.target).closest('tr').find('.colProcessName').text();
    //     let selEle = templateObject.selectedProcessField.get();
    //     selEle.val(processName);
    //     $('#processListModal').modal('toggle')
    // },


    // 'click .btn-remove-raw': function(event) {
    //     let row = $(event.target).closest('div.productRow');
    //     let productName = $(row).find('.edtProductName').val();
    //     let content = $(event.target).closest('div.product-content');
    //     let rowCount = $(content).find('.productRow').length;
    //     if (rowCount == 1 || $(content).first().find('.edtProductName').val() == productName) {
    //         $(content).remove();
    //     } else {
    //         $(row).remove();
    //     }
    // },

    // 'click #BOMSetupModal .btnAddProduct': function (event) {
    //     let row = $(event.target).closest('.productRow');
    //     let tempObject = Template.instance();
    //     let parent = row.parent();


    //     let grandParent = parent.parent();
    //     let modalElement = $(row).closest('.modal#BOMSetupModal');
    //     let topParent = modalElement.parent();

    //     let count = $(grandParent).find('.product-content').length;
    //     if(count > 1) {
    //         let lastRow = $(grandParent).find('.product-content')[count-2];
    //         if(lastRow && lastRow != null) {
    //             if ($(lastRow).find('.edtProductName').val() == '' || $(lastRow).find('.edtProcessName').val()== '' || $(lastRow).find('.edtQuantity').val() == '') {
    //                 return
    //             }
    //         }
    //     }


    //     let colProduct = row.find('.colProduct');
    //     let colQty = row.find('.colQty');
    //     let colProcess = row.find('.colProcess');
    //     let colNote = row.find('.colNote');
    //     let colAttachment = row.find('.colAttachment');
    //     let colDelete = row.find('.colDelete');
    //     $(colProduct).prepend("<div style='width: 29%'></div><select class='edtProductName edtRaw form-control' id='edtRaw' type='search' style='width: 70%'></select>")
    //     $(event.target).remove()
    //     $(colProduct).find('.edtProductName').editableSelect()
    //     $(colQty).append("<input type='text' class='form-control edtQuantity w-100'/>");
    //     // $(colProduct).append("<button type='button' class='btnShowSub btn btn-primary'>Show Sub</button>");
    //     // $(colProcess).append("<select class='edtProcessName form-control w-100' type='search' ></select>")
    //     $(colProcess).find('.edtProcessName').editableSelect();
    //     // $(colNote).append("<input class='w-100 form-control edtProcessNote' type='text'/>");
    //     $(colDelete).addClass('d-flex align-items-center justify-content-center')
    //     $(colDelete).append("<button class='btn btn-danger btn-rounded btn-sm my-0 btn-remove-raw'><i class='fa fa-remove'></i></button>")



    //     grandParent.append("<div class='product-content'><div class='d-flex productRow'>" +
    //                     "<div class='colProduct  d-flex form-group'>" +
    //                     "<button class='btn btn-primary btnAddProduct' style='width: 29%;'>Product+</button>" +
    //                     "</div>" +
    //                     "<div class='colQty form-group'>" +
    //                     "</div>" +
    //                     "<div class='colProcess form-group'>" +
    //                     "</div>" +
    //                     "<div class='colNote form-group'>" +
    //                     "</div>" +
    //                     "<div class='colAttachment form-group'></div>" +
    //                     "<div class='colDelete'>" +
    //                     "</div>" +
    //                     "</div></div>")

    // },

   
    // 'click #BOMSetupModal .btnAddSubProduct': function(event) {
    //     let button  = $(event.target).closest('button.btnAddSubProduct');
    //     let tempObject = Template.instance();
    //     let row = $(event.target).closest('.productRow');
    //     let colProduct = row.find('.colProduct');
    //     let colQty = row.find('.colQty');
    //     let colProcess = row.find('.colProcess');
    //     let colNote = row.find('.colNote');
    //     let colAttachment = row.find('.colAttachment');
    //     let colDelete = row.find('.colDelete');

    //     if($(colProduct).find('.edtProductName').val() != '') {
    //         if($(colQty).find('.edtQuantity').val() != '') {
    //             let quantity = $(colQty).find('.edtQuantity').val();
    //             let edtRaw = colProduct.find('.edtProductName')
    //             $(event.target).remove();
    //             $(button).remove();
    //             $(colDelete).addClass('d-flex align-items-center justify-content-center')
    //             $(colDelete).append("<button class='btn btn-danger btn-rounded btn-sm my-0 btn-remove-raw'><i class='fa fa-remove'></i></button>")
    //             let parent = row.parent();

    //             $(parent).append("<div class='d-flex productRow'>"+
    //             "<div class='d-flex colProduct form-group'>"+
    //             "<div class='d-flex align-items-center justify-content-end form-group' style='width: 60%'>"+
    //             "<button class='btn btn-primary w-25 d-flex align-items-center justify-content-center form-control btnAddSubProduct'><span class='fas fa-plus'></span></button>" +
    //             "</div>"+
    //             "<select class='edtProductName edtRaw form-control' type='search' style='width: 40%'></select>" +
    //             "</div>"+
    //             "<div class='colQty'>" +
    //             "<input type='text' class='edtQuantity w-100 form-control' />" +
    //             "</div>"+
    //             "<div class='colProcess form-group'>"+
    //             "<select type='search' autocomplete='off' class='edtProcessName form-control w-100 es-input' ></select>"+
    //             "</div>" +
    //             "<div class='colNote form-group'></div>" +
    //             "<div class='colAttachment'></div>" +
    //             "<div class='colDelete'></div>"+
    //             "</div>")
    //             let eles = $(parent).find('.edtProductName')
    //             $(eles[eles.length - 1]).editableSelect();
    //             let procElements = $(parent).find('.edtProcessName')
    //             $(procElements[procElements.length -1]).editableSelect()
    //         }
    //     }
    // },

    'click #BOMSetupModal .btn-save-bom': function(event) {
        let templateObject = Template.instance();
        playSaveAudio();
        setTimeout(function(){
        let finalStructure = {};
        let bomProduct = localStorage.getItem('TProcTree')?JSON.parse(localStorage.getItem('TProcTree')): [];
        let mainProductName = $('#tblWorkOrderLine tbody tr .lineProductName').val();

        let currentBOMIndex = bomProduct.findIndex(product => {
            return product.fields.productName == mainProductName
        })
        let mainOrderSaved = false;
        let currentBOMStructure = bomProduct[currentBOMIndex].fields;

        let builtCount = $('.btn-product-build').length;
        let tempRecord = templateObject.workorderrecord.get();
        let currentRecord = {... tempRecord}
        let totalWorkOrders = localStorage.getItem('TWorkorders')?JSON.parse(localStorage.getItem('TWorkorders')): []
        let savedworkorders = totalWorkOrders.filter(order => {
            return order.SalesOrderID == templateObject.salesOrderId.get();
        })
        let count = savedworkorders.length;
        let mainOrderId = currentRecord.id.split('_')[1];
        if(mainOrderId <= count) {
            mainOrderSaved = true;
        }else {
            mainOrderSaved = false;
        }

       
                saveMainBOMStructure();
           
    }, delayTimeAfterSound);
    async function saveMainBOMStructure() {
        let mainProductName = $('#edtMainProductName').val();
        let mainProcessName = $('#edtProcess').val();
        let mainQuantity = $('#edtMainQty').val();
        let bomProducts = localStorage.getItem('TProcTree')? JSON.parse(localStorage.getItem('TProcTree')) : []

        if(mainProcessName == '') {
            swal('Please provide the process !', '', 'warning');
            $('.fullScreenSpin').css('display', 'none');
            return false;
        }

        let products = $('.product-content');
        if(products.length < 3) {
            swal('Must have sub builds or raws !', '', 'warning');
            $('.fullScreenSpin').css('display', 'none');
            return false;
        }

        async function getDetailInfoFromName (prodName) {
            return new Promise(async(resolve, reject) => {
                getVS1Data('TProductVS1').then(dataObject => {
                    if(dataObject.length == 0) {
                        productService.getOneProductdatavs1byname(prodName).then(function(data){
                            resolve({
                                totalQtyInStock: data.tproduct[0].fields.TotalQtyInStock,
                                productDescription: data.tproduct[0].fields.SalesDescription
                            })
                        })
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        let useData = data.tproductvs1;
                        for(let i = 0; i< useData.length; i ++ ) {
                            if(useData[i].fields.ProductName == prodName) {
                                resolve({
                                    totalQtyInStock: useData[i].fields.TotalQtyInStock,
                                    productDescription: useData[i].fields.SalesDescription
                                })
                            }
                        }
                    }
                }).catch(function(err) {
                    productService.getOneProductdatavs1byname(prodName).then(function(data){
                        resolve({
                            totalQtyInStock: data.tproduct[0].fields.TotalQtyInStock,
                            productDescription: data.tproduct[0].fields.SalesDescription
                        })
                    })
                })
            })
        }

        let productInfo = await getDetailInfoFromName(mainProductName);
        let objDetails  = {
            productName: mainProductName,
            qty: mainQuantity,
            process: mainProcessName,
            processNote: $(products[0]).find('.edtProcessNote').val() || '',
            attachments: JSON.parse($(products[0]).find('.attachedFiles').text() != ''?$(products[0]).find('.attachedFiles').text(): '[]').uploadedFilesArray || [],
            subs: [],
            totalQtyInStock: productInfo.totalQtyInStock,
            productDescription: productInfo.productDescription,
            duration: $('.edtDuration').val() || ''

        }


        for(let i = 1; i< products.length - 1; i ++) {
            let productRows = products[i].querySelectorAll('.productRow')
            let objectDetail;
                let _name = $(productRows[0]).find('.edtProductName').val();
                let _qty = $(productRows[0]).find('.edtQuantity').val();
                let _process = $(productRows[0]).find('.edtProcessName').val();
                let _note = $(productRows[0]).find('.edtProcessNote').val();
                let _attachments = JSON.parse($(productRows[0]).find('.attachedFiles').text()!= ''?$(productRows[0]).find('.attachedFiles').text(): '[]').uploadedFilesArray || [];
                let _subInfo = await getDetailInfoFromName(_name);
                objectDetail = {
                    productName: _name,
                    qty: _qty,
                    process: _process,
                    processNote: _note,
                    attachments: _attachments,
                    subs:[],
                    isBuild: false
                }
                if(productRows.length > 1) {
                    let boms = localStorage.getItem('TProcTree')?JSON.parse(localStorage.getItem('TProcTree')):[];
                    let index = boms.findIndex(bom=>{
                        return bom.fields.productName == _name;
                    })
                    objectDetail.duration = boms[index].fields.duration
                    for(let j = 1; j<productRows.length; j++) {
                        let _productName = $(productRows[j]).find('.edtProductName').val();
                        let _productQty = $(productRows[j]).find('.edtQuantity').val();
                        let _rawProcess = $(productRows[j]).find('.edtProcessName').val();
                        if(_productName != '' && _productQty != '' && _rawProcess != '') {
                            objectDetail.subs.push ({
                                productName: _productName || '',
                                qty: _productQty || 1,
                                process: _rawProcess || '',
                                processNote: '',
                                attachments: [],
                                subs: []
                            })
                        }
                    }
                } else {
                    let bomProductIndex = bomProducts.findIndex(product => {
                        return product.fields.productName == _name;
                    })
                    if(bomProductIndex > -1) {
                        let subProduct = bomProducts[bomProductIndex];
                        if(subProduct && subProduct.fields.subs && subProduct.fields.subs.length> 0) {
                            for(let j=0; j< subProduct.fields.subs.length; j++) {
                                let sub = subProduct.fields.subs[j];
                                objectDetail.subs.push({
                                    productName: sub.product || '',
                                    qty: sub.quantity || 1,
                                    process: sub.process || '',
                                    processNote: '',
                                    attachments: [],
                                    subs: []
                                })
                            }
                        }
                    }
                }
                if($(productRows[0]).find('.btn-product-build').length > 0) {
                    objectDetail.isBuild = true;
                }

            // }
            objDetails.subs.push(objectDetail);
        }
        finalStructure = objDetails;

        //global save action
        templateObject.bomStructure.set(finalStructure);
        swal('BOM Settings Successfully Saved', '', 'success');
        // let productContents = $('#BOMSetupModal').find('.product-content');
        // for (let l = 1; l < productContents.length -1; l++) {
        //     $(productContents[l]).remove()
        // }
        $('#BOMSetupModal').modal('toggle');
    }
    },

    'click #BOMSetupModal .btn-cancel-bom': function(event) {
        playCancelAudio();
        setTimeout(function(){
        // let productContents = $('#BOMSetupModal').find('.product-content');
        // for (let l = 1; l < productContents.length -1; l++) {
        //     $(productContents[l]).remove();
        // }
        $('#BOMSetupModal').modal('toggle');
        }, delayTimeAfterSound);
    },

    'click #btn-save-close': function(event) {
        $('.btnSave').trigger('click')
    },

    'click #btnBuildQty': function(event) {
        event.preventDefault();
        let templateObject = Template.instance();
        templateObject.quantityBuild.set(true);
    },

    'keyup #edtTotalQuantity': function(event) {
        event.preventDefault();
        let templateObject = Template.instance();
        let record = JSON.parse(JSON.stringify(templateObject.workorderrecord.get()))
        record.line.fields.Qty = parseInt($(event.target).val())
        templateObject.workorderrecord.set(record);
    },

    'click #btnCompleteProcess': function(event) {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block')
        let workorders = localStorage.getItem('TWorkorders')?JSON.parse(localStorage.getItem('TWorkorders')): [];
        let currentworkorder;

        let workorderindex = workorders.findIndex(order => {
            return order.SalesOrderID == templateObject.salesOrderId.get() && order.Line.fields.ProductName == templateObject.workorderrecord.get().line.fields.ProductName;
        })
        if(workorderindex > -1) {
            currentworkorder = workorders[workorderindex];
            let productName = currentworkorder.Line.fields.ProductName;
            getVS1Data('TProductVS1').then(function(dataObject) {
                if(dataObject.length == 0) {
                    productService.getOneProductdatavs1byname(productName).then(function(dataDetail)  {
                        let data = dataDetail.tproduct[0];
                        productService.saveProduct({
                            type: 'TProduct',
                            fields: {
                                ...data.fields,
                                TotalQtyInStock: currentworkorder.Line.fields.Qty + data.fields.TotalQtyInStock
                            }
                            // ID: data.fields.ID,
                        }).then(function(){
                            sideBarService.getNewProductListVS1(initialBaseDataLoad,0).then(function (data) {
                                addVS1Data('TProductVS1',JSON.stringify(data));
                            })
                        })
                    })
                } else {
                    let data = JSON.parse(dataObject[0].data)
                    let useData = data.tproductvs1;
                    for(let i = 0; i< useData.length; i++) {
                        if(useData[i].fields.ProductName == productName ) {
                            productService.saveProductVS1({
                                type: 'TProductVS1',
                                fields: {
                                    // ...useData[i].fields,
                                    ID: useData[i].fields.ID,
                                    TotalQtyInStock: currentworkorder.Line.fields.Qty + useData[i].fields.TotalQtyInStock
                                }
                            }).then(function(){
                                sideBarService.getNewProductListVS1(initialBaseDataLoad,0).then(function (data) {
                                    addVS1Data('TProductVS1',JSON.stringify(data)).then(()=>{
                                    });
                                })
                            })
                        }
                    }
                }
            }).catch(function(err){
                productService.getOneProductdatavs1byname(productName).then(function(dataDetail)  {
                    let data = dataDetail.tproduct[0];
                    productService.saveProduct({
                        type: 'TProduct',
                        fields: {
                            ...data.fields,
                            TotalQtyInStock: currentworkorder.Line.fields.Qty + data.fields.TotalQtyInStock
                        }
                    }).then(function(){
                        sideBarService.getNewProductListVS1(initialBaseDataLoad,0).then(function (data) {
                            addVS1Data('TProductVS1',JSON.stringify(data));
                        })
                    })
                })
            })

            let subs = currentworkorder.BOM.subs;
            for(let j = 0; j< subs.length; j++) {
                let name = subs[j].productName;
                getVS1Data('TProductVS1').then(function(dataObject) {
                    if(dataObject.length == 0) {
                        productService.getOneProductdatavs1byname(name).then(function(dataDetail)  {
                            let data = dataDetail.tproduct[0];
                            productService,saveProduct({
                                type: 'TProduct',
                                fields: {
                                    ...data.fields,
                                    TotalQtyInStock: data.fields.TotalQtyInStock - parseFloat(currentworkorder.Line.fields.Qty * subs[j].qty)
                                }
                            }).then(function(){
                                $('.fullScreenSpin').css('display', 'none')
                                sideBarService.getNewProductListVS1(initialBaseDataLoad,0).then(function (data) {
                                    addVS1Data('TProductVS1',JSON.stringify(data)).then(function() {
                                        swal('Process Completed', '', 'success');
                                    });
                                })
                            })
                        })
                    } else {
                        let data = JSON.parse(dataObject[0].data)
                        let useData = data.tproductvs1;
                        for(let i = 0; i< useData.length; i++) {
                            if(useData[i].fields.ProductName == name ) {
                                productService.saveProductVS1({
                                    type: 'TProductVS1',
                                    fields: {
                                        ...useData[i].fields,
                                        // ID: useData[i].fields.ID,
                                        TotalQtyInStock: useData[i].fields.TotalQtyInStock - parseFloat(currentworkorder.Line.fields.Qty * subs[j].qty)
                                    }
                                }).then(function(){
                                    $('.fullScreenSpin').css('display', 'none')
                                    sideBarService.getNewProductListVS1(initialBaseDataLoad,0).then(function (data) {
                                        addVS1Data('TProductVS1',JSON.stringify(data)).then(function(){
                                            swal('Process Completed', '', 'success');
                                        });
                                    })
                                })
                            }
                        }
                    }
                }).catch(function(err){
                    productService.getOneProductdatavs1byname(name).then(function(dataDetail)  {
                        let data = dataDetail.tproduct[0];
                        productService,saveProduct({
                            type: 'TProduct',
                            fields:{
                                ...data.fields,
                                TotalQtyInStock: data.fields.TotalQtyInStock - parseFloat(currentworkorder.Line.fields.Qty * subs[j].qty)
                            }
                            // ID: data.fields.ID,
                        }).then(function(){
                            $('.fullScreenSpin').css('display', 'none')
                            sideBarService.getNewProductListVS1(initialBaseDataLoad,0).then(function (data) {
                                addVS1Data('TProductVS1',JSON.stringify(data)).then(function() {
                                    swal('Process Completed', '', 'success');
                                });
                            })
                        })
                    })
                })
            }
            let tempworkorder = JSON.parse(JSON.stringify(currentworkorder));
            tempworkorder = {...tempworkorder, EndTime: new Date()}
            workorders.splice(workorderindex, 1, tempworkorder)

            productService.getOneProductdatavs1byname(productName).then(function(data){

            })



        }else {
            $('.fullScreenSpin').css('display', 'none')
        }
    },

    'click .btnBack': function(event) {
        if(FlowRouter.current().queryParams.salesorderid) {
            FlowRouter.go('/salesordercard?id='+FlowRouter.current().queryParams.salesorderid)
        }else{
            FlowRouter.go('/workorderlist')
        }
    }
})
