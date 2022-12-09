import {TaxRateService} from "../settings-service";
import { ReactiveVar } from 'meteor/reactive-var';
import { SideBarService } from '../../js/sidebar-service';
import { ContactService } from "../../contacts/contact-service";
import {UtilityService} from "../../utility-service";
import '../../lib/global/indexdbstorage.js';
import XLSX from 'xlsx';
let sideBarService = new SideBarService();

Template.uomSettings.inheritsHooksFrom('non_transactional_list');
Template.uomSettings.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);

    templateObject.deptrecords = new ReactiveVar();

    templateObject.includeSalesDefault = new ReactiveVar();
    templateObject.includeSalesDefault.set(false);
    templateObject.includePurchaseDefault = new ReactiveVar();
    templateObject.includePurchaseDefault.set(false);
    templateObject.selectedFile = new ReactiveVar();
});

Template.uomSettings.onRendered(function() {
    $('.fullScreenSpin').css('display','inline-block');
    let templateObject = Template.instance();
    let taxRateService = new TaxRateService();
    const dataTableList = [];
    const tableHeaderList = [];
    const deptrecords = [];
    let deptprodlineItems = [];


    $('#tblUOMList tbody').on( 'click', 'tr', function () {
        var isSalesDefault = false;
        var isPurchaseDefault = false;
      $('#add-uom-title').text('Edit UOM');
       var uomID = $(this).closest('tr').attr('id');
       var uomName = $(event.target).closest("tr").find(".colUOMName").text() || '';
       var uomDescription = $(event.target).closest("tr").find(".colUOMDesc").text() || '';
       var uomProduct = $(event.target).closest("tr").find(".colUOMProduct").text() || '';
       var unitMultiplier =  $(event.target).closest("tr").find(".colUOMMultiplier").text() || 0;
       var uomWeight =  $(event.target).closest("tr").find(".colUOMWeight").text() || 0;
       var uomNoOfBoxes =  $(event.target).closest("tr").find(".colUOMNoOfBoxes").text() || 0;
       var uomLength =  $(event.target).closest("tr").find(".colUOMHeight").text() || 0;
       var uomWidth =  $(event.target).closest("tr").find(".colUOMWidth").text() || 0;
       var uomLength =  $(event.target).closest("tr").find(".colUOMLength").text() || 0;
       var uomVolume =  $(event.target).closest("tr").find(".colUOMVolume").text() || 0;

       if($(event.target).closest("tr").find(".colUOMSalesDefault .chkBox").is(':checked')){
         isSalesDefault = true;
       }
       if($(event.target).closest("tr").find(".colUOMPurchaseDefault .chkBox").is(':checked')){
         isPurchaseDefault = true;
       }

       if(isSalesDefault == true){
         templateObject.includeSalesDefault.set(true);
       }else{
         templateObject.includeSalesDefault.set(false);
       }

       if(isPurchaseDefault == true){
         templateObject.includePurchaseDefault.set(true);
       }else{
         templateObject.includePurchaseDefault.set(false);
       }

       $('#edtUOMID').val(uomID);
       $('#edtUnitName').val(uomName);
       $('#edtUnitName').prop('readonly', true);
       $('#txaUnitDescription').val(uomDescription);
       $('#sltProduct').val(uomProduct);
       $('#edtUnitMultiplier').val(unitMultiplier);
       $('#edtUnitWeight').val(uomWeight);
       $('#edtNoOfBoxes').val(uomNoOfBoxes);
       $('#edtHeight').val(uomNoOfBoxes);
       $('#edtWidth').val(uomNoOfBoxes);
       $('#edtLength').val(uomNoOfBoxes);
       $('#edtVolume').val(uomNoOfBoxes);
       $('#newUomModal').modal('show');

       //Make btnDelete "Make Active or In-Active"
       if(status == "In-Active"){
           $('#view-in-active').html("<button class='btn btn-success btnActivateUOM vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make Active</button>");
       }else{
           $('#view-in-active').html("<button class='btn btn-danger btnDeleteUOM vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make In-Active</button>");
       }
    });

});

Template.uomSettings.events({
    'click #exportbtn': function () {
      $('.fullScreenSpin').css('display','inline-block');
      jQuery('#tblUOMList_wrapper .dt-buttons .btntabletoexcel').click();
       $('.fullScreenSpin').css('display','none');

    },
    "click .printConfirm": function (event) {
      $(".fullScreenSpin").css("display", "inline-block");
      jQuery("#tblUOMList_wrapper .dt-buttons .btntabletopdf").click();
      $(".fullScreenSpin").css("display", "none");
    },
    'click .btnRefresh': function () {
      $('.fullScreenSpin').css('display','inline-block');
      sideBarService.getUOMDataList().then(function(dataReload) {
        addVS1Data('TUnitOfMeasureList', JSON.stringify(dataReload)).then(function(datareturn) {
          sideBarService.getLeadStatusDataList(initialBaseDataLoad, 0, false).then(async function(dataUOMList) {
              await addVS1Data('TUnitOfMeasureList', JSON.stringify(dataUOMList)).then(function(datareturn) {
                  Meteor._reload.reload();
              }).catch(function(err) {
                  Meteor._reload.reload();
              });
          }).catch(function(err) {
              Meteor._reload.reload();
          });
        }).catch(function(err) {
            Meteor._reload.reload();
        });
    }).catch(function(err) {
        Meteor._reload.reload();
    });
    },
    'click .btnDeleteUOM': function () {
          playDeleteAudio();
          let taxRateService = new TaxRateService();
          setTimeout(function(){
          let uomId = $('#edtUOMID').val();
          let objDetails = {
              type: "TUnitOfMeasureList",
              fields: {
                  Id: parseInt(uomId),
                  Active: false
              }
          };

            taxRateService.saveUOM(objDetails).then(function (objDetails) {
            sideBarService.getUOMDataList(initialBaseDataLoad, 0, false).then(function(dataReload) {
              addVS1Data('TUnitOfMeasureList',  JSON.stringify(dataReload)).then(function (datareturn) {
                 Meteor._reload.reload();
              }).catch(function (err) {
                 Meteor._reload.reload();
              });
      });

      }).catch(function (err) {
          swal({
              title: 'Oooops...',
              text: err,
              type: 'error',
              showCancelButton: false,
              confirmButtonText: 'Try Again'
          }).then((result) => {
              if (result.value) {
                  Meteor._reload.reload();
              } else if (result.dismiss === 'cancel') {}
          });
          $('.fullScreenSpin').css('display', 'none');
      });
  }, delayTimeAfterSound);
  },
  'click .btnActivateUOM': function() {
      playSaveAudio();
      let contactService = new ContactService();
      setTimeout(function() {
          $('.fullScreenSpin').css('display', 'inline-block');
          let objDetails = '';
          let uomID = $('#edtUOMID').val();
          let uomName = $('#edtUnitName').val() || '';
          let uomDescription = $('#txaUnitDescription').val() || '';
          let uomProduct = $('#sltProduct').val() || '';
          let uomMultiplier = $('#edtUnitMultiplier').val() || 0;
          let uomWeight = $('#edtUnitWeight').val() || 0;
          let uomNonOfBoxes = $('#edtNoOfBoxes').val() || 0;
          let uomHeight = $('#edtHeight').val() || 0;
          let uomWidth = $('#edtWidth').val() || 0;
          let uomLength = $('#edtLength').val() || 0;
          let uomVolume = $('#edtVolume').val() || 0;

          let isSalesdefault = false;
          let isPurchasedefault = false;

          if($('#swtSalesDefault').is(':checked')){
            isSalesdefault = true;
          }else{
            isSalesdefault = false;
          }

          if($('#swtPurchaseDefault').is(':checked')){
            isPurchasedefault = true;
          }else{
            isPurchasedefault = false;
          }

          objDetails = {
             type: "TUnitOfMeasureList",
             fields: {
                 ID: parseInt(uomID),
                 UOMName: uomName,
                 UnitDescription: uomDescription,
                 ProductName: uomProduct,
                 Multiplier: parseFloat(uomMultiplier)||0,
                 PurchasesDefault: isPurchasedefault,
                 SalesDefault: isSalesdefault,
                 Weight: parseFloat(uomWeight)||0,
                 NoOfBoxes: parseFloat(uomNonOfBoxes)||0,
                 Height: parseFloat(uomHeight)||0,
                 Length: parseFloat(uomLength)||0,
                 Width: parseFloat(uomWidth)||0,
                 Volume: parseFloat(uomVolume)||0,
                 Active: true
             }
         };
          contactService.saveUOM(objDetails).then(function(result) {
              sideBarService.getUOMVS1().then(function(dataReload) {
                  addVS1Data('TUnitOfMeasureList', JSON.stringify(dataReload)).then(function(datareturn) {
                    sideBarService.getUOMDataList(initialBaseDataLoad, 0, false).then(async function(dataUOMList) {
                        await addVS1Data('TUnitOfMeasureList', JSON.stringify(dataUOMList)).then(function(datareturn) {
                            Meteor._reload.reload();
                        }).catch(function(err) {
                            Meteor._reload.reload();
                        });
                    }).catch(function(err) {
                        Meteor._reload.reload();
                    });
                  }).catch(function(err) {
                      Meteor._reload.reload();
                  });
              }).catch(function(err) {
                  Meteor._reload.reload();
              });
          }).catch(function(err) {
              swal({
                  title: 'Oooops...',
                  text: err,
                  type: 'error',
                  showCancelButton: false,
                  confirmButtonText: 'Try Again'
              }).then((result) => {
                  if (result.value) {
                      Meteor._reload.reload();
                  } else if (result.dismiss === 'cancel') {}
              });
              $('.fullScreenSpin').css('display', 'none');
          });
      }, delayTimeAfterSound);
  },
    'click .btnSaveUOM': function () {
      playSaveAudio();
      let taxRateService = new TaxRateService();
      setTimeout(function(){
      //$('.fullScreenSpin').css('display','inline-block');
      let objDetails = '';
      let uomID = $('#edtUOMID').val();
      let uomName = $('#edtUnitName').val() || '';
      let uomDescription = $('#txaUnitDescription').val() || '';
      let uomProduct = $('#sltProduct').val() || '';
      let uomMultiplier = $('#edtUnitMultiplier').val() || 0;
      let uomWeight = $('#edtUnitWeight').val() || 0;
      let uomNonOfBoxes = $('#edtNoOfBoxes').val() || 0;
      let uomHeight = $('#edtHeight').val() || 0;
      let uomWidth = $('#edtWidth').val() || 0;
      let uomLength = $('#edtLength').val() || 0;
      let uomVolume = $('#edtVolume').val() || 0;

      let isSalesdefault = false;
      let isPurchasedefault = false;

      if($('#swtSalesDefault').is(':checked')){
        isSalesdefault = true;
      }else{
        isSalesdefault = false;
      }

      if($('#swtPurchaseDefault').is(':checked')){
        isPurchasedefault = true;
      }else{
        isPurchasedefault = false;
      }

      if (uomName === ''){
      $('.fullScreenSpin').css('display','none');
      Bert.alert('<strong>WARNING:</strong> Unit Name cannot be blank!', 'warning');
      e.preventDefault();
      }

      if(uomID == ""){
        taxRateService.checkTermByName(uomName).then(function (data) {
          uomID = data.tunitofmeasure[0].Id;
          objDetails = {
             type: "TUnitOfMeasureList",
             fields: {
                 ID: parseInt(uomID),
                 UOMName: uomName,
                 UnitDescription: uomDescription,
                 ProductName: uomProduct,
                 Multiplier: parseFloat(uomMultiplier)||0,
                 PurchasesDefault: isPurchasedefault,
                 SalesDefault: isSalesdefault,
                 Weight: parseFloat(uomWeight)||0,
                 NoOfBoxes: parseFloat(uomNonOfBoxes)||0,
                 Height: parseFloat(uomHeight)||0,
                 Length: parseFloat(uomLength)||0,
                 Width: parseFloat(uomWidth)||0,
                 Volume: parseFloat(uomVolume)||0,
                 Active: true
             }
         };

         taxRateService.saveUOM(objDetails).then(function (objDetails) {
           sideBarService.getUOMVS1().then(function(dataReload) {
              addVS1Data('TUnitOfMeasureList', JSON.stringify(dataReload)).then(function (datareturn) {
                 Meteor._reload.reload();
              }).catch(function (err) {
                 Meteor._reload.reload();
              });
      });

      }).catch(function (err) {
           swal({
           title: 'Oooops...',
           text: err,
           type: 'error',
           showCancelButton: false,
           confirmButtonText: 'Try Again'
           }).then((result) => {
           if (result.value) {
            Meteor._reload.reload();
           } else if (result.dismiss === 'cancel') {

           }
           });
             $('.fullScreenSpin').css('display','none');
         });
        }).catch(function (err) {
          objDetails = {
             type: "TUnitOfMeasureList",
             fields: {
                 UOMName: uomName,
                 UnitDescription: uomDescription,
                 ProductName: uomProduct,
                 Multiplier: parseFloat(uomMultiplier)||0,
                 PurchasesDefault: isPurchasedefault,
                 SalesDefault: isSalesdefault,
                 Weight: parseFloat(uomWeight)||0,
                 NoOfBoxes: parseFloat(uomNonOfBoxes)||0,
                 Height: parseFloat(uomHeight)||0,
                 Length: parseFloat(uomLength)||0,
                 Width: parseFloat(uomWidth)||0,
                 Volume: parseFloat(uomVolume)||0,
                 Active: true
             }
         };

         taxRateService.saveUOM(objDetails).then(function (objDetails) {
           sideBarService.getUOMVS1().then(function(dataReload) {
              addVS1Data('TUnitOfMeasureList', JSON.stringify(dataReload)).then(function (datareturn) {
                 Meteor._reload.reload();
              }).catch(function (err) {
                 Meteor._reload.reload();
              });
      });

      }).catch(function (err) {
           swal({
           title: 'Oooops...',
           text: err,
           type: 'error',
           showCancelButton: false,
           confirmButtonText: 'Try Again'
           }).then((result) => {
           if (result.value) {
            Meteor._reload.reload();
           } else if (result.dismiss === 'cancel') {

           }
           });
             $('.fullScreenSpin').css('display','none');
         });
        });

     }else{
       objDetails = {
          type: "TUnitOfMeasureList",
          fields: {
              ID: parseInt(uomID),
              UOMName: uomName,
              UnitDescription: uomDescription,
              ProductName: uomProduct,
              Multiplier: parseFloat(uomMultiplier)||0,
              PurchasesDefault: isPurchasedefault,
              SalesDefault: isSalesdefault,
              Weight: parseFloat(uomWeight)||0,
              NoOfBoxes: parseFloat(uomNonOfBoxes)||0,
              Height: parseFloat(uomHeight)||0,
              Length: parseFloat(uomLength)||0,
              Width: parseFloat(uomWidth)||0,
              Volume: parseFloat(uomVolume)||0,
              Active: true
          }
      };

      taxRateService.saveUOM(objDetails).then(function (objDetails) {
        sideBarService.getUOMVS1().then(function(dataReload) {
              addVS1Data('TUnitOfMeasureList', JSON.stringify(dataReload)).then(function (datareturn) {
                 Meteor._reload.reload();
              }).catch(function (err) {
                 Meteor._reload.reload();
              });
      });

      }).catch(function (err) {
        swal({
        title: 'Oooops...',
        text: err,
        type: 'error',
        showCancelButton: false,
        confirmButtonText: 'Try Again'
        }).then((result) => {
        if (result.value) {
         Meteor._reload.reload();
        } else if (result.dismiss === 'cancel') {

        }
        });
          $('.fullScreenSpin').css('display','none');
      });
     }
    }, delayTimeAfterSound);
    },
    'click .btnAddUOM': function () {
      let templateObject = Template.instance();
        $('#add-uom-title').text('Add New UOM');
        $('#edtUOMID').val('');
        $('#edtUnitName').val('');
        $('#edtUnitName').prop('readonly', false);
        $('#txaUnitDescription').val('');
        $('#sltProduct').val('');
        $('#edtUnitMultiplier').val('');
        $('#swtSalesDefault').val('');
        $('#swtPurchaseDefault').val('');
        $('#edtUnitWeight').val('');
        $('#edtNoOfBoxes').val('');
        $('#edtHeight').val('');
        $('#edtWidth').val('');
        $('#edtLength').val('');
        $('#edtVolume').val('');
        $('#view-in-active').html("<button class='btn btn-danger btnDeleteUOM vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make In-Active</button>");

        templateObject.includePurchaseDefault.set(false);
        templateObject.includeSalesDefault.set(false);
    },
    'click .btnBack':function(event){
      playCancelAudio();
      event.preventDefault();
      setTimeout(function(){
      history.back(1);
      }, delayTimeAfterSound);
    },
    // Import here
    'click .templateDownload': function() {
        let utilityService = new UtilityService();
        let rows = [];
        const filename = 'SampleUOMSettings' + '.csv';
        rows[0] = ['Unit', 'Description', 'Product', 'Unit Multiplier', 'Sales', 'Purchases', 'Weight', 'No.OfBoxes', 'Height', 'Width', 'Volume'];
        rows[1] = ['ABC', 'ABC123', 'DEF', '0', 'false', 'false', '0', '0', '0', '0', '0'];
        utilityService.exportToCsv(rows, filename, 'csv');
    },
    'click .templateDownloadXLSX': function(e) {

        e.preventDefault(); //stop the browser from following
        window.location.href = 'sample_imports/SampleUOMSettings.xlsx';
    },
    'click .btnUploadFile': function(event) {
        $('#attachment-upload').val('');
        $('.file-name').text('');
        //$(".btnImport").removeAttr("disabled");
        $('#attachment-upload').trigger('click');

    },
    'change #attachment-upload': function(e) {
        let templateObj = Template.instance();
        var filename = $('#attachment-upload')[0].files[0]['name'];
        var fileExtension = filename.split('.').pop().toLowerCase();
        var validExtensions = ["csv", "txt", "xlsx"];
        var validCSVExtensions = ["csv", "txt"];
        var validExcelExtensions = ["xlsx", "xls"];

        if (validExtensions.indexOf(fileExtension) == -1) {
            swal('Invalid Format', 'formats allowed are :' + validExtensions.join(', '), 'error');
            $('.file-name').text('');
            $(".btnImport").Attr("disabled");
        } else if (validCSVExtensions.indexOf(fileExtension) != -1) {

            $('.file-name').text(filename);
            let selectedFile = event.target.files[0];

            templateObj.selectedFile.set(selectedFile);
            if ($('.file-name').text() != "") {
                $(".btnImport").removeAttr("disabled");
            } else {
                $(".btnImport").Attr("disabled");
            }
        } else if (fileExtension == 'xlsx') {
            $('.file-name').text(filename);
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
                var workbook = XLSX.read(data, { type: 'array' });

                var result = {};
                workbook.SheetNames.forEach(function(sheetName) {
                    var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
                    var sCSV = XLSX.utils.make_csv(workbook.Sheets[sheetName]);
                    templateObj.selectedFile.set(sCSV);

                    if (roa.length) result[sheetName] = roa;
                });
                // see the result, caution: it works after reader event is done.

            };
            reader.readAsArrayBuffer(oFile);

            if ($('.file-name').text() != "") {
                $(".btnImport").removeAttr("disabled");
            } else {
                $(".btnImport").Attr("disabled");
            }

        }
    },
    'click .btnImport': function() {
        $('.fullScreenSpin').css('display', 'inline-block');
        let templateObject = Template.instance();
        let taxRateService = new TaxRateService();
        let objDetails;
        let uomDescription = '';
        let uomProduct = '';
        let uomMultiplier = 1;
        let uomSales = false;
        let uomPurchases = false;
        let uomWeight = 0;
        let uomNonOfBoxes = 0;
        let uomHeight = 0;
        let uomWidth = 0;
        let uomLength = 0;
        let uomVolume = 0;

        Papa.parse(templateObject.selectedFile.get(), {
            complete: function(results) {

                if (results.data.length > 0) {
                    if ((results.data[0][0] == "Unit") && (results.data[0][1] == "Description") && (results.data[0][2] == "Product Name") && (results.data[0][3] == "Unit Multiplier") && (results.data[0][4] == "Sales Default") && (results.data[0][5] == "Purchases Default") && (results.data[0][6] == "Weight") && (results.data[0][7] == "No. of Boxes") && (results.data[0][8] == "Height") && (results.data[0][9] == "Width") && (results.data[0][10] == "Volume")) {

                        let dataLength = results.data.length * 500;
                        setTimeout(function() {
                            $('.importTemplateModal').hide();
                            $('.modal-backdrop').hide();
                            FlowRouter.go('/uomSettings?success=true');
                            $('.fullScreenSpin').css('display', 'none');
                        }, parseInt(dataLength));
                        for (let i = 0; i < results.data.length - 1; i++) {
                            uomDescription = results.data[i + 1][1] !== undefined ? results.data[i + 1][1] : '';
                            uomProduct = results.data[i + 1][2] !== undefined ? results.data[i + 1][2] : '';
                            uomMultiplier = results.data[i + 1][3] !== undefined ? results.data[i + 1][3] : 1;
                            uomSales = results.data[i + 1][4] !== undefined ? results.data[i + 1][4] : false;
                            uomPurchases = results.data[i + 1][5] !== undefined ? results.data[i + 1][5] : false;
                            uomWeight = results.data[i + 1][6] !== undefined ? results.data[i + 1][6] : 0;
                            uomNonOfBoxes = results.data[i + 1][7] !== undefined ? results.data[i + 1][7] : 0;
                            uomHeight = results.data[i + 1][8] !== undefined ? results.data[i + 1][8] : 0;
                            uomWidth = results.data[i + 1][9] !== undefined ? results.data[i + 1][9] : 0;
                            uomLength = results.data[i + 1][10] !== undefined ? results.data[i + 1][10] : 0;
                            uomVolume = results.data[i + 1][11] !== undefined ? results.data[i + 1][11] : 0;

                            objDetails = {
                                type: "TUnitOfMeasureList",
                                fields: {
                                    UOMName: results.data[i + 1][0],
                                    UnitDescription: uomDescription || '',
                                    ProductName: uomProduct || '',
                                    Multiplier: parseFloat(uomMultiplier)|| 1,
                                    SalesDefault: uomSales || false,
                                    PurchasesDefault: uomPurchases || false,
                                    Weight: parseFloat(uomWeight) || 0,
                                    NoOfBoxes: parseFloat(uomNonOfBoxes) || 0,
                                    Height: parseFloat(uomHeight) || 0,
                                    Length: parseFloat(uomLength) || 0,
                                    Width: parseFloat(uomWidth) || 0,
                                    Volume: parseFloat(uomVolume) || 0,
                                    Active: true
                                }
                            };
                            if (results.data[i + 1][1]) {
                                if (results.data[i + 1][1] !== "") {
                                    taxRateService.saveUOM(objDetails).then(function(data) {
                                        //$('.fullScreenSpin').css('display','none');
                                        //  Meteor._reload.reload();
                                    }).catch(function(err) {
                                        //$('.fullScreenSpin').css('display','none');
                                        swal({ title: 'Oooops...', text: err, type: 'error', showCancelButton: false, confirmButtonText: 'Try Again' }).then((result) => {
                                            if (result.value) {
                                                // window.open('/clienttypesettings?success=true', '_self');
                                                FlowRouter.go('/uomSettings?success=true');
                                            } else if (result.dismiss === 'cancel') {
                                                FlowRouter.go('/uomSettings?success=false');
                                            }
                                        });
                                    });
                                }
                            }
                        }

                    } else {
                        $('.fullScreenSpin').css('display', 'none');
                        swal('Invalid Data Mapping fields ', 'Please check that you are importing the correct file with the correct column headers.', 'error');
                    }
                } else {
                    $('.fullScreenSpin').css('display', 'none');
                    swal('Invalid Data Mapping fields ', 'Please check that you are importing the correct file with the correct column headers.', 'error');
                }


            }
        });
    }
});

Template.uomSettings.helpers({
    datatablerecords : () => {
       return Template.instance().datatablerecords.get().sort(function(a, b){
         if (a.uomname == 'NA') {
       return 1;
           }
       else if (b.uomname == 'NA') {
         return -1;
       }
     return (a.uomname.toUpperCase() > b.uomname.toUpperCase()) ? 1 : -1;
     });
    },
    tableheaderrecords: () => {
       return Template.instance().tableheaderrecords.get();
    },
    salesCloudPreferenceRec: () => {
    return CloudPreference.findOne({userid:Session.get('mycloudLogonID'),PrefName:'tblUOMList'});
    },
    includeSalesDefault: () => {
      return Template.instance().includeSalesDefault.get();
    },
    includePurchaseDefault: () => {
      return Template.instance().includePurchaseDefault.get();
    },
    loggedCompany: () => {
    return localStorage.getItem('mySession') || '';
    }
});

Template.registerHelper('equals', function(a, b) {
    return a === b;
});
