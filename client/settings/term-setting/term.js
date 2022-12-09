import {TaxRateService} from "../settings-service";
import { ReactiveVar } from 'meteor/reactive-var';
import { SideBarService } from '../../js/sidebar-service';
import {UtilityService} from "../../utility-service";
import '../../lib/global/indexdbstorage.js';
import XLSX from 'xlsx';
let sideBarService = new SideBarService();
Template.termsettings.inheritsHooksFrom('non_transactional_list');

Template.termsettings.onCreated(function(){
  const templateObject = Template.instance();
  templateObject.datatablerecords = new ReactiveVar([]);
  templateObject.tableheaderrecords = new ReactiveVar([]);

  templateObject.deptrecords = new ReactiveVar();

  templateObject.include7Days = new ReactiveVar();
  templateObject.include7Days.set(false);
  templateObject.include30Days = new ReactiveVar();
  templateObject.include30Days.set(false);
  templateObject.includeCOD = new ReactiveVar();
  templateObject.includeCOD.set(false);
  templateObject.includeEOM = new ReactiveVar();
  templateObject.includeEOM.set(false);
  templateObject.includeEOMPlus = new ReactiveVar();
  templateObject.includeEOMPlus.set(false);

  templateObject.includeSalesDefault = new ReactiveVar();
  templateObject.includeSalesDefault.set(false);
  templateObject.includePurchaseDefault = new ReactiveVar();
  templateObject.includePurchaseDefault.set(false);
  templateObject.selectedFile = new ReactiveVar();

});

Template.termsettings.onRendered(function() {
    //$('.fullScreenSpin').css('display','inline-block');
    let templateObject = Template.instance();
    let taxRateService = new TaxRateService();
    const dataTableList = [];
    const tableHeaderList = [];
    const deptrecords = [];
    let deptprodlineItems = [];


$('#tblTermsList tbody').on( 'click', 'tr', function () {
    //var listData = $(this).closest('tr').attr('id');
    var is7days = false;
    var is30days = false;
    var isEOM = false;
    var isEOMPlus = false;
    var isSalesDefault = false;
    var isPurchaseDefault = false;


        $('#add-terms-title').text('Edit Term Settings');
       let termsID = $(this).closest('tr').attr('id') || 0;
       let termsName = $(event.target).closest("tr").find(".colName").text() || '';
       let description = $(event.target).closest("tr").find(".colDescription").text() || '';
       let days =  $(event.target).closest("tr").find(".colIsDays").text() || 0;
       if($(event.target).closest("tr").find(".colIsEOM .chkBox").is(':checked')){
         isEOM = true;
       }
       if($(event.target).closest("tr").find(".colIsEOMPlus .chkBox").is(':checked')){
         isEOMPlus = true;
       }
       if($(event.target).closest("tr").find(".colCustomerDef .chkBox").is(':checked')){
         isSalesDefault = true;
       }
       if($(event.target).closest("tr").find(".colSupplierDef .chkBox").is(':checked')){
         isPurchaseDefault = true;
       }
       if(isEOM == true || isEOMPlus ==  true){
         isDays = false;
       }else{
         isDays = true;
       }
       //Call on switch templates (include...)
       if((isDays == true) && (days == 0)){
         templateObject.includeCOD.set(true);
       }else{
         templateObject.includeCOD.set(false);
       }
       if((isDays == true) && (days == 30)){
         templateObject.include30Days.set(true);
       }else{
         templateObject.include30Days.set(false);
       }
       if(isEOM == true){
         templateObject.includeEOM.set(true);
       }else{
         templateObject.includeEOM.set(false);
       }
       if(isEOMPlus == true){
         templateObject.includeEOMPlus.set(true);
       }else{
         templateObject.includeEOMPlus.set(false);
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

       $('#edtTermsID').val(termsID);
       $('#edtName').val(termsName);
       $('#edtName').prop('readonly', true);
       $('#edtDesc').val(description);
       $('#edtDays').val(days);
       $('#myModalTerms').modal('show');

       //Make btnDelete "Make Active or In-Active"
       if(status == "In-Active"){
           $('#view-in-active').html("<button class='btn btn-success btnActivateTerms vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make Active</button>");
       }else{
           $('#view-in-active').html("<button class='btn btn-danger btnDeleteTerms vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make In-Active</button>");
       }

    });
});


Template.termsettings.events({
    'click #btnNewInvoice':function(event){
        // FlowRouter.go('/invoicecard');
    },
  'click #exportbtn': function () {
    $('.fullScreenSpin').css('display','inline-block');
    jQuery('#tblTermsList_wrapper .dt-buttons .btntabletoexcel').click();
     $('.fullScreenSpin').css('display','none');

  },
  "click .printConfirm": function (event) {
    $(".fullScreenSpin").css("display", "inline-block");
    jQuery("#tblTermsList_wrapper .dt-buttons .btntabletopdf").click();
    $(".fullScreenSpin").css("display", "none");
  },
  'click .btnRefresh': function () {
      let taxRateService = new TaxRateService();
      sideBarService.getTermsDataList().then(function (dataTermsList) {
          addVS1Data('TTermsVS1List', JSON.stringify(dataTermsList)).then(function (datareturn) {
            sideBarService.getTermsVS1().then(function (dataReload) {
                addVS1Data('TTermsVS1List', JSON.stringify(dataReload)).then(function (datareturn) {
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
  },
  'click .btnDeleteTerms': function () {
    playDeleteAudio();
    let taxRateService = new TaxRateService();
    setTimeout(function(){
    //$('.fullScreenSpin').css('display', 'inline-block');
    let termsId = $('#edtTermsID').val();
    let objDetails = {
        type: "TTermsVS1",
        fields: {
            Id: parseInt(termsId),
            Active: false
        }
    };

    taxRateService.saveTerms(objDetails).then(function (objDetails) {
      sideBarService.getTermsVS1().then(function(dataReload) {
            addVS1Data('TTermsVS1List',JSON.stringify(dataReload)).then(function (datareturn) {
              Meteor._reload.reload();
            }).catch(function (err) {
              Meteor._reload.reload();
            });
          }).catch(function(err) {
            Meteor._reload.reload();
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
  'click .btnActivateTerms': function() {
      playSaveAudio();
      let contactService = new ContactService();
      setTimeout(function() {
          $('.fullScreenSpin').css('display', 'inline-block');
          let termsID = $('#edtTermsID').val();
          let termsName = $('#edtName').val();
          let description = $('#edtDesc').val();
          let termdays = $('#edtDays').val();

          let isDays = false;
          let is30days = false;
          let isEOM = false;
          let isEOMPlus = false;
          let days = 0;

          let isSalesdefault = false;
          let isPurchasedefault = false;
          if(termdays.replace(/\s/g, '') != ""){
            isDays = true;
          }else{
            isDays = false;
          }

          if($('#isEOM').is(':checked')){
            isEOM = true;
          }else{
            isEOM = false;
          }

          if($('#isEOMPlus').is(':checked')){
            isEOMPlus = true;
          }else{
            isEOMPlus = false;
          }

          if($('#chkCustomerDef').is(':checked')){
            isSalesdefault = true;
          }else{
            isSalesdefault = false;
          }

          if($('#chkSupplierDef').is(':checked')){
            isPurchasedefault = true;
          }else{
            isPurchasedefault = false;
          }
          termsID = data.tterms[0].Id;
          let objDetails = {
             type: "TTermsVS1",
             fields: {
                 ID: parseInt(termsID),
                 TermsName: termsName,
                 Description: description,
                 IsDays: isDays,
                 IsEOM: isEOM,
                 IsEOMPlus: isEOMPlus,
                 isPurchasedefault: isPurchasedefault,
                 isSalesdefault: isSalesdefault,
                 Days: termdays||0,
                 Active: true
             }
         };

         taxRateService.saveTerms(objDetails).then(function (objDetails) {
           sideBarService.getTermsVS1().then(function(dataReload) {
              addVS1Data('TTermsVS1List',JSON.stringify(dataReload)).then(function (datareturn) {
                Meteor._reload.reload();
              }).catch(function (err) {
                Meteor._reload.reload();
              });
            }).catch(function(err) {
              Meteor._reload.reload();
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
  'click .btnSaveTerms': function () {
    playSaveAudio();
    let taxRateService = new TaxRateService();
    setTimeout(function(){
    $('.fullScreenSpin').css('display','inline-block');

    let termsID = $('#edtTermsID').val();
    let termsName = $('#edtName').val();
    let description = $('#edtDesc').val();
    let termdays = $('#edtDays').val();

    let isDays = false;
    let is30days = false;
    let isEOM = false;
    let isEOMPlus = false;
    let days = 0;

    let isSalesdefault = false;
    let isPurchasedefault = false;
    if(termdays.replace(/\s/g, '') != ""){
      isDays = true;
    }else{
      isDays = false;
    }

    if($('#isEOM').is(':checked')){
      isEOM = true;
    }else{
      isEOM = false;
    }

    if($('#isEOMPlus').is(':checked')){
      isEOMPlus = true;
    }else{
      isEOMPlus = false;
    }

    if($('#chkCustomerDef').is(':checked')){
      isSalesdefault = true;
    }else{
      isSalesdefault = false;
    }

    if($('#chkSupplierDef').is(':checked')){
      isPurchasedefault = true;
    }else{
      isPurchasedefault = false;
    }

    let objDetails = '';
    if (termsName === ''){
    $('.fullScreenSpin').css('display','none');
    Bert.alert('<strong>WARNING:</strong> Term Name cannot be blank!', 'warning');
    e.preventDefault();
    }

    if(termsID == ""){
      taxRateService.checkTermByName(termsName).then(function (data) {
        termsID = data.tterms[0].Id;
        objDetails = {
           type: "TTermsVS1",
           fields: {
               ID: parseInt(termsID),
               TermsName: termsName,
               Description: description,
               IsDays: isDays,
               IsEOM: isEOM,
               IsEOMPlus: isEOMPlus,
               isPurchasedefault: isPurchasedefault,
               isSalesdefault: isSalesdefault,
               Days: termdays||0,
               Active: true
           }
       };

       taxRateService.saveTerms(objDetails).then(function (objDetails) {
         sideBarService.getTermsVS1().then(function(dataReload) {
            addVS1Data('TTermsVS1List',JSON.stringify(dataReload)).then(function (datareturn) {
              Meteor._reload.reload();
            }).catch(function (err) {
              Meteor._reload.reload();
            });
          }).catch(function(err) {
            Meteor._reload.reload();
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
           type: "TTermsVS1",
           fields: {
               TermsName: termsName,
               Description: description,
               IsDays: isDays,
               IsEOM: isEOM,
               IsEOMPlus: isEOMPlus,
               Days: termdays||0,
               Active: true
           }
       };

       taxRateService.saveTerms(objDetails).then(function (objDetails) {
         sideBarService.getTermsVS1().then(function(dataReload) {
            addVS1Data('TTermsVS1List',JSON.stringify(dataReload)).then(function (datareturn) {
              Meteor._reload.reload();
            }).catch(function (err) {
              Meteor._reload.reload();
            });
          }).catch(function(err) {
            Meteor._reload.reload();
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
        type: "TTermsVS1",
        fields: {
            ID: parseInt(termsID),
            TermsName: termsName,
            Description: description,
            IsDays: isDays,
            IsEOM: isEOM,
            isPurchasedefault: isPurchasedefault,
            isSalesdefault: isSalesdefault,
            IsEOMPlus: isEOMPlus,
            Days: termdays||0,
            Active: true
        }
    };

    taxRateService.saveTerms(objDetails).then(function (objDetails) {
      sideBarService.getTermsVS1().then(function(dataReload) {
            addVS1Data('TTermsVS1List',JSON.stringify(dataReload)).then(function (datareturn) {
              Meteor._reload.reload();
            }).catch(function (err) {
              Meteor._reload.reload();
            });
          }).catch(function(err) {
            Meteor._reload.reload();
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
  'click .btnAddTerms': function () {
    let templateObject = Template.instance();
      $('#add-terms-title').text('Add New Term');
      $('#edtTermsID').val('');
      $('#edtName').val('');
      $('#edtName').prop('readonly', false);
      $('#edtDesc').val('');
      $('#edtDays').val('');
      $('#view-in-active').html("<button class='btn btn-danger btnDeleteTerms vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make In-Active</button>");

      templateObject.include7Days.set(false);
      templateObject.includeCOD.set(false);
      templateObject.include30Days.set(false);
      templateObject.includeEOM.set(false);
      templateObject.includeEOMPlus.set(false);
  },
  'click .btnBack':function(event){
    playCancelAudio();
    event.preventDefault();
    setTimeout(function(){
    history.back(1);
    }, delayTimeAfterSound);
  },
  'click .chkTerms':function(event){
    var $box =$(event.target);

 if ($box.is(":checked")) {
   var group = "input:checkbox[name='" + $box.attr("name") + "']";
   $(group).prop("checked", false);
   $box.prop("checked", true);
 } else {
   $box.prop("checked", false);
 }
  },
  'keydown #edtDays': function(event){
      if ($.inArray(event.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||
              // Allow: Ctrl+A, Command+A
             (event.keyCode === 65 && (event.ctrlKey === true || event.metaKey === true)) ||
              // Allow: home, end, left, right, down, up
             (event.keyCode >= 35 && event.keyCode <= 40)) {
                  // let it happen, don't do anything
                  return;
         }

        if (event.shiftKey == true) {
            event.preventDefault();
        }

        if ((event.keyCode >= 48 && event.keyCode <= 57) ||
        (event.keyCode >= 96 && event.keyCode <= 105) ||
        event.keyCode == 8 || event.keyCode == 9 ||
        event.keyCode == 37 || event.keyCode == 39 ||
        event.keyCode == 46 || event.keyCode == 190) {
        } else {
            event.preventDefault();
        }
    },
    // Import here
    'click .templateDownload': function() {
        let utilityService = new UtilityService();
        let rows = [];
        const filename = 'SampleTermsSetting' + '.csv';
        rows[0] = ['Term', 'Days', 'EOM', 'EOM+', 'Description', 'Customer', 'Supplier'];
        rows[1] = ['ABC','7', 'false', 'false', 'description', 'false', 'false'];
        utilityService.exportToCsv(rows, filename, 'csv');
    },
    'click .templateDownloadXLSX': function(e) {
        e.preventDefault(); //stop the browser from following
        window.location.href = 'sample_imports/SampleTermsSetting.xlsx';
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
        let termDesc = '';
        let isEOM = false;
        let isEOMPlus = false;
        let days = 0;
        let isSalesdefault = false;
        let isPurchasedefault = false;

        Papa.parse(templateObject.selectedFile.get(), {
            complete: function(results) {

                if (results.data.length > 0) {
                    if ((results.data[0][0] == "Terms Name") && (results.data[0][1] == "Description")) {

                        let dataLength = results.data.length * 500;
                        setTimeout(function() {
                            $('.importTemplateModal').hide();
                            $('.modal-backdrop').hide();
                            FlowRouter.go('/departmentSettings?success=true');
                            $('.fullScreenSpin').css('display', 'none');
                        }, parseInt(dataLength));

                        for (let i = 0; i < results.data.length - 1; i++) {
                            days = results.data[i + 1][1] !== undefined ? results.data[i + 1][1] : 0;
                            isEOM = results.data[i + 1][2] !== undefined ? results.data[i + 1][2] : false;
                            isEOMPlus = results.data[i + 1][3] !== undefined ? results.data[i + 1][3] : false;
                            termDesc = results.data[i + 1][4] !== undefined ? results.data[i + 1][4] : '';
                            isPurchasedefault = results.data[i + 1][5] !== undefined ? results.data[i + 1][5] : false;
                            isSalesdefault = results.data[i + 1][6] !== undefined ? results.data[i + 1][6] : false;
                            objDetails = {
                                type: "TTermsVS1",
                                fields: {
                                    TermsName: results.data[i + 1][0],
                                    Days: days,
                                    IsEOM: isEOM,
                                    IsEOMPlus: isEOMPlus,
                                    Description: termDesc,
                                    isPurchasedefault: isPurchasedefault,
                                    isSalesdefault: isSalesdefault,
                                    Active: true
                                }
                            };
                            if (results.data[i + 1][1]) {
                                if (results.data[i + 1][1] !== "") {
                                    taxRateService.saveTerms(objDetails).then(function(data) {
                                        //$('.fullScreenSpin').css('display','none');
                                        //  Meteor._reload.reload();
                                    }).catch(function(err) {
                                        //$('.fullScreenSpin').css('display','none');
                                        swal({ title: 'Oooops...', text: err, type: 'error', showCancelButton: false, confirmButtonText: 'Try Again' }).then((result) => {
                                            if (result.value) {
                                                window.open('/departmentSettings?success=true', '_self');
                                            } else if (result.dismiss === 'cancel') {
                                                window.open('/departmentSettings?success=false', '_self');
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

Template.termsettings.helpers({
  datatablerecords : () => {
     return Template.instance().datatablerecords.get().sort(function(a, b){
       if (a.termname == 'NA') {
     return 1;
         }
     else if (b.termname == 'NA') {
       return -1;
     }
   return (a.termname.toUpperCase() > b.termname.toUpperCase()) ? 1 : -1;
   });
  },
  tableheaderrecords: () => {
     return Template.instance().tableheaderrecords.get();
  },
  salesCloudPreferenceRec: () => {
  return CloudPreference.findOne({userid:Session.get('mycloudLogonID'),PrefName:'tblTermsList'});
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
include7Days: () => {
    return Template.instance().include7Days.get();
},
include30Days: () => {
    return Template.instance().include30Days.get();
},
includeCOD: () => {
    return Template.instance().includeCOD.get();
},
includeEOM: () => {
    return Template.instance().includeEOM.get();
},
includeEOMPlus: () => {
    return Template.instance().includeEOMPlus.get();
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

Template.registerHelper('equals', function (a, b) {
    return a === b;
});
