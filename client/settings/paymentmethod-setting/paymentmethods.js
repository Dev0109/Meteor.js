import {TaxRateService} from "../settings-service";
import { ReactiveVar } from 'meteor/reactive-var';
import {OrganisationService} from '../../js/organisation-service';
import { SideBarService } from '../../js/sidebar-service';
import {UtilityService} from "../../utility-service";
import '../../lib/global/indexdbstorage.js';
import XLSX from 'xlsx';
let taxRateService = new TaxRateService();
let sideBarService = new SideBarService();
let organisationService = new OrganisationService();

Template.paymentmethodSettings.inheritsHooksFrom('non_transactional_list');

Template.paymentmethodSettings.onCreated(function(){
  const templateObject = Template.instance();
  templateObject.datatablerecords = new ReactiveVar([]);
  templateObject.tableheaderrecords = new ReactiveVar([]);

  templateObject.deptrecords = new ReactiveVar();

  templateObject.includeCreditCard = new ReactiveVar();
  templateObject.includeCreditCard.set(false);

  templateObject.includeAccountID = new ReactiveVar();
  templateObject.includeAccountID.set(false);

  templateObject.accountID = new ReactiveVar();
  templateObject.selectedFile = new ReactiveVar();
});

Template.paymentmethodSettings.onRendered(function() {
    //$('.fullScreenSpin').css('display','inline-block');
    let templateObject = Template.instance();
    const dataTableList = [];
    const tableHeaderList = [];
    const deptrecords = [];
    let deptprodlineItems = [];
  Meteor.call('readPrefMethod',Session.get('mycloudLogonID'),'tblPaymentMethodList', function(error, result){
    if(error){

    }else{
      if(result){
        for (let i = 0; i < result.customFields.length; i++) {
          let customcolumn = result.customFields;
          let columData = customcolumn[i].label;
          let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
          let hiddenColumn = customcolumn[i].hidden;
          let columnClass = columHeaderUpdate.split('.')[1];
          let columnWidth = customcolumn[i].width;

           $("th."+columnClass+"").html(columData);
            $("th."+columnClass+"").css('width',""+columnWidth+"px");

        }
      }

    }
    });

    function MakeNegative() {
      $('td').each(function(){
        if($(this).text().indexOf('-'+Currency) >= 0) $(this).addClass('text-danger')
       });
    };


        templateObject.getOrganisationDetails = function () {
        organisationService.getOrganisationDetail().then((dataListRet) => {
            let account_id = dataListRet.tcompanyinfo[0].Apcano || '';
            let feeMethod = dataListRet.tcompanyinfo[0].DvaABN || ''
            if(feeMethod == "apply") {
              $("#feeOnTopInput").prop("checked", true);
              $("#feeInPriceInput").prop("checked", false);
            } else if(feeMethod == "include") {
              $("#feeOnTopInput").prop("checked", false);
              $("#feeInPriceInput").prop("checked", true);
            } else {
              $("#feeOnTopInput").prop("checked", true);
              $("#feeInPriceInput").prop("checked", false);
            }
            if(dataListRet.tcompanyinfo[0].Apcano == ''){
                templateObject.includeAccountID.set(false);
            }else{
              templateObject.includeAccountID.set(true);
            }

            templateObject.accountID.set(account_id);
        });

    }
    templateObject.getOrganisationDetails();

    $(document).ready(function() {
      let url = window.location.href;
      if(url.indexOf("?code") > 0){
        $('.fullScreenSpin').css('display','inline-block');
         url = url.split('?code=');
         var id = url[url.length - 1];

         $.ajax({
                url: 'https://depot.vs1cloud.com/stripe/connect-to-stripe.php',
                data: {
                    'code': id,
                },
                method: 'post',
                success: function(response) {
                  var dataReturnRes = JSON.parse(response);
                  if(dataReturnRes.stripe_user_id){
                    const templateObject = Template.instance();
                    let stripe_acc_id = dataReturnRes.stripe_user_id;
                    let companyID = 1;

                    var objDetails = {
                        type: "TCompanyInfo",
                        fields: {
                            Id: companyID,
                            Apcano:stripe_acc_id
                        }
                    };
                  organisationService.saveOrganisationSetting(objDetails).then(function (data){
                    $('.fullScreenSpin').css('display','none');
                    swal({
                    title: 'Stripe Connection Successful',
                    text: "Your stripe account connection is successful",
                    type: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'Ok'
                    }).then((result) => {
                    if (result.value) {
                      window.open('/paymentmethodSettings','_self');
                    } else if (result.dismiss === 'cancel') {
                      window.open('/paymentmethodSettings','_self');
                    }else{
                        window.open('/paymentmethodSettings','_self');
                    }
                    });
                 }).catch(function (err) {
                        $('.fullScreenSpin').css('display','none');
                          swal({
                            title: 'Stripe Connection Successful',
                            text: err,
                            type: 'error',
                            showCancelButton: false,
                            confirmButtonText: 'Try Again'
                          }).then((result) => {
                            if (result.value) {
                              // Meteor._reload.reload();
                            } else if (result.dismiss === 'cancel') {

                            }
                          });
                      })

                  } else{
                    $('.fullScreenSpin').css('display','none');
                     swal({
                    title: 'Oooops...',
                    text: response,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                    }).then((result) => {
                    if (result.value) {

                    } else if (result.dismiss === 'cancel') {

                    }
                    });
                  }
                 }
            });

        }


        $("#saveStripeID").click(function(){
          playSaveAudio();
          setTimeout(function(){
          $('.fullScreenSpin').css('display','inline-block');
          let companyID = 1;
          let feeMethod  = "apply";

          if($('#feeInPriceInput').is(':checked')){
            feeMethod = "include";
          }

          var objDetails = {
          type: "TCompanyInfo",
          fields: {
              Id: companyID,
              DvaABN:feeMethod,
          }
        };
        organisationService.saveOrganisationSetting(objDetails).then(function (data){
          Session.setPersistent('vs1companyStripeFeeMethod', feeMethod);
          window.open('/paymentmethodSettings','_self');
        }).catch(function (err) {
          window.open('/paymentmethodSettings','_self');
        });
      }, delayTimeAfterSound);
        });

    })


$('#tblPaymentMethodList tbody').on("click", "tr", function () {
    var listData = $(this).closest('tr').attr('id');
    var isCreditcard = false;
    if(listData){
      $('#add-paymentmethod-title').text('Edit Payment Method');
      //$('#isformcreditcard').removeAttr('checked');
      if (listData !== '') {
        listData = Number(listData);
     //taxRateService.getOnePaymentMethod(listData).then(function (data) {

       var paymentMethodID = listData || '';
       var paymentMethodName = $(event.target).closest("tr").find(".colName").text() || '';
       var isCheckBoxChched = $(event.target).closest("tr").find(".chkBox").is(':checked');
        // isCreditcard = $(event.target).closest("tr").find(".colName").text() || '';
       if(isCheckBoxChched){
         isCreditcard = true;
       }

       $('#edtPaymentMethodID').val(paymentMethodID);
       $('#edtPaymentMethodName').val(paymentMethodName);

       if(isCreditcard == true){
         templateObject.includeCreditCard.set(true);
         //$('#iscreditcard').prop('checked');
       }else{
         templateObject.includeCreditCard.set(false);
       }

      //});


      $(this).closest('tr').attr('data-target', '#myModalPaymentMethod');
      $(this).closest('tr').attr('data-toggle', 'modal');

    }

    }

    });
});


Template.paymentmethodSettings.events({
    'click #btnNewInvoice':function(event){
        // FlowRouter.go('/invoicecard');
    },
    'click .feeOnTopInput':function(event){
      if($(event.target).is(':checked')){
        $('.feeInPriceInput').attr('checked', false);
      }
    },
    'click .feeInPriceInput':function(event){
      if($(event.target).is(':checked')){
        $('.feeOnTopInput').attr('checked', false);
      }
    },
  'click #exportbtn': function () {
    $('.fullScreenSpin').css('display','inline-block');
    jQuery('#tblPaymentMethodList_wrapper .dt-buttons .btntabletoexcel').click();
     $('.fullScreenSpin').css('display','none');
  },
  "click .printConfirm": function (event) {
    $(".fullScreenSpin").css("display", "inline-block");
    jQuery("#tblPaymentMethodList_wrapper .dt-buttons .btntabletopdf").click();
    $(".fullScreenSpin").css("display", "none");
  },
  'click .btnRefresh': function () {
      sideBarService.getPaymentMethodDataList(initialBaseDataLoad, 0, false).then(function (dataReload) {
          addVS1Data('TPaymentMethodList', JSON.stringify(dataReload)).then(function (datareturn) {
            sideBarService.getPaymentMethodDataVS1().then(function (dataPayment) {
                addVS1Data('TPaymentMethod', JSON.stringify(dataPayment)).then(function (datareturn) {
                    Meteor._reload.reload();
                }).catch(function (err) {
                    Meteor._reload.reload();
                });
            }).catch(function (err) {
                Meteor._reload.reload();
            });
          }).catch(function (err) {
              Meteor._reload.reload();
          });
      }).catch(function (err) {
          Meteor._reload.reload();
      });
      // Meteor._reload.reload();
  },
  'click .btnDeletePaymentMethod': function () {
    playDeleteAudio();
    setTimeout(function(){

    let paymentMethodId = $('#edtPaymentMethodID').val();
    let objDetails = {
        type: "TPaymentMethod",
        fields: {
            Id: parseInt(paymentMethodId),
            Active: false
        }
    };

    taxRateService.savePaymentMethod(objDetails).then(function (objDetails) {
      sideBarService.getPaymentMethodDataVS1().then(function(dataReload) {
          addVS1Data('TPaymentMethod',JSON.stringify(dataReload)).then(function (datareturn) {
          location.reload(true);
          }).catch(function (err) {
            location.reload(true);
          });
      }).catch(function(err) {
          location.reload(true);
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
  }, delayTimeAfterSound);
  },
  'click .btnSavePaymentMethod': function () {
    playSaveAudio();
    setTimeout(function(){
    $('.fullScreenSpin').css('display','inline-block');

    let paymentMethodID = $('#edtPaymentMethodID').val();
    //let headerDept = $('#sltDepartment').val();
    let paymentName = $('#edtPaymentMethodName').val();
    let isCreditCard = false;
    let siteCode = $('#edtSiteCode').val();

    if($('#isformcreditcard').is(':checked')){
      isCreditCard = true;
    }else{
      isCreditCard = false;
    }

    let objDetails = '';
    if (paymentName === ''){
      $('.fullScreenSpin').css('display','none');
    Bert.alert('<strong>WARNING:</strong> Payment Method Name cannot be blank!', 'warning');
    e.preventDefault();
    }

    if(paymentMethodID == ""){
      taxRateService.checkPaymentMethodByName(paymentName).then(function (data) {
        paymentMethodID = data.tpaymentmethod[0].Id;
        objDetails = {
           type: "TPaymentMethod",
           fields: {
               ID: parseInt(paymentMethodID),
               Active: true,
               //PaymentMethodName: paymentName,
               IsCreditCard: isCreditCard,
               PublishOnVS1:true
           }
       };

       taxRateService.savePaymentMethod(objDetails).then(function (objDetails) {
         sideBarService.getPaymentMethodDataVS1().then(function(dataReload) {
             addVS1Data('TPaymentMethod',JSON.stringify(dataReload)).then(function (datareturn) {
             location.reload(true);
             }).catch(function (err) {
               location.reload(true);
             });
         }).catch(function(err) {
             location.reload(true);
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
           type: "TPaymentMethod",
           fields: {
               Active: true,
               PaymentMethodName: paymentName,
               IsCreditCard: isCreditCard,
               PublishOnVS1:true
           }
       };

       taxRateService.savePaymentMethod(objDetails).then(function (objDetails) {
         sideBarService.getPaymentMethodDataVS1().then(function(dataReload) {
             addVS1Data('TPaymentMethodList',JSON.stringify(dataReload)).then(function (datareturn) {
             location.reload(true);
             }).catch(function (err) {
               location.reload(true);
             });
         }).catch(function(err) {
             location.reload(true);
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
        type: "TPaymentMethod",
        fields: {
            ID: parseInt(paymentMethodID),
            Active: true,
            PaymentMethodName: paymentName,
            IsCreditCard: isCreditCard,
            PublishOnVS1:true
        }
    };

    taxRateService.savePaymentMethod(objDetails).then(function (objDetails) {
      sideBarService.getPaymentMethodDataVS1().then(function(dataReload) {
          addVS1Data('TPaymentMethod',JSON.stringify(dataReload)).then(function (datareturn) {
          location.reload(true);
          }).catch(function (err) {
            location.reload(true);
          });
      }).catch(function(err) {
          location.reload(true);
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
  'click .btnAddPaymentMethod': function () {
    let templateObject = Template.instance();
      $('#add-paymentmethod-title').text('Add New Payment Method');
      $('#edtPaymentMethodID').val('');
      $('#edtPaymentMethodName').val('');
      templateObject.includeCreditCard.set(false);
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
      const filename = 'SamplePaymentMethodSettings' + '.csv';
      rows[0] = ['Payment Method Name', 'Is Credit Card'];
      rows[1] = ['ABC', 'false'];
      utilityService.exportToCsv(rows, filename, 'csv');
  },
  'click .templateDownloadXLSX': function(e) {

      e.preventDefault(); //stop the browser from following
      window.location.href = 'sample_imports/SamplePaymentMethodSettings.xlsx';
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
      let utilityService = new UtilityService();
      let objDetails;
      let isCreditCard = false;
      Papa.parse(templateObject.selectedFile.get(), {
          complete: function(results) {

              if (results.data.length > 0) {
                  if ((results.data[0][0] == "Payment Method Name") && (results.data[0][1] == "Is Credit Card")) {

                      let dataLength = results.data.length * 500;
                      setTimeout(function() {
                          $('.importTemplateModal').hide();
                          $('.modal-backdrop').hide();
                          FlowRouter.go('/paymentmethodSettings?success=true');
                          $('.fullScreenSpin').css('display', 'none');
                      }, parseInt(dataLength));
                      for (let i = 0; i < results.data.length - 1; i++) {
                          isCreditCard = results.data[i + 1][1] !== undefined ? results.data[i + 1][1] : '';
                          objDetails = {
                              type: "TPaymentMethod",
                              fields: {
                                  PaymentMethodName: results.data[i + 1][0],
                                  IsCreditCard: isCreditCard || false,
                                  Active: true
                              }
                          };
                          if (results.data[i + 1][1]) {
                              if (results.data[i + 1][1] !== "") {
                                  taxRateService.savePaymentMethod(objDetails).then(function(data) {
                                      //$('.fullScreenSpin').css('display','none');
                                      //  Meteor._reload.reload();
                                  }).catch(function(err) {
                                      //$('.fullScreenSpin').css('display','none');
                                      swal({ title: 'Oooops...', text: err, type: 'error', showCancelButton: false, confirmButtonText: 'Try Again' }).then((result) => {
                                          if (result.value) {
                                              // window.open('/clienttypesettings?success=true', '_self');
                                              FlowRouter.go('/paymentmethodSettings?success=true');
                                          } else if (result.dismiss === 'cancel') {
                                              FlowRouter.go('/paymentmethodSettings?success=false');
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

Template.paymentmethodSettings.helpers({
  datatablerecords : () => {
     return Template.instance().datatablerecords.get().sort(function(a, b){
       if (a.paymentmethodname == 'NA') {
     return 1;
         }
     else if (b.paymentmethodname == 'NA') {
       return -1;
     }
   return (a.paymentmethodname.toUpperCase() > b.paymentmethodname.toUpperCase()) ? 1 : -1;
   });
  },
 accountID: () => {
    return Template.instance().accountID.get();
 },
  tableheaderrecords: () => {
     return Template.instance().tableheaderrecords.get();
  },
  salesCloudPreferenceRec: () => {
  return CloudPreference.findOne({userid:Session.get('mycloudLogonID'),PrefName:'tblPaymentMethodList'});
},
deptrecords: () => {
    return Template.instance().deptrecords.get().sort(function(a, b){
      if (a.department == 'NA') {
    return 1;
        }
    else if (b.department == 'NA') {
      return -1;
    }
  return (a.department.toUpperCase() > b.department.toUpperCase()) ? 1 : -1;
  });
},
includeAccountID: () => {
    return Template.instance().includeAccountID.get();
},
includeCreditCard: () => {
    return Template.instance().includeCreditCard.get();
},
loggedCompany: () => {
  return localStorage.getItem('mySession') || '';
}
});

Template.registerHelper('equals', function (a, b) {
    return a === b;
});
