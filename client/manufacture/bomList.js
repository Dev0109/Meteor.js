import { ReactiveVar } from "meteor/reactive-var";
import { ProductService } from "../product/product-service";
import { OrganisationService } from "../js/organisation-service";

let organisationService = new OrganisationService();
Template.bom_list.inheritsHooksFrom('non_transactional_list');
Template.bom_list.onCreated(function(){
    const templateObject = Template.instance()
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.displayfields = new ReactiveVar([]);
    templateObject.reset_data = new ReactiveVar([]);
    templateObject.setupFinished = new ReactiveVar()
      
})
Template.bom_list.onRendered(function(){
  const templateObject  = Template.instance();
  if(FlowRouter.current().queryParams.success){
    $('.btnRefresh').addClass('btnRefreshAlert');
  }

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
})
Template.bom_list.events({
  'click #tblBOMList tbody tr': function(event) {
    let productName = $(event.target).closest('tr').find('td.colProductName').text();
    let bomProducts = localStorage.getItem('TProcTree')?JSON.parse(localStorage.getItem('TProcTree')): []
    let index = bomProducts.findIndex(product => {
      return product.fields.productName == productName;
    })
    if(index > -1) {
      FlowRouter.go('/bomsetupcard?id='+ index)
    }
  },

  'click #btnNewBOM': function(event) {
    FlowRouter.go('/bomsetupcard')
  },

  'keyup #tblBOMList_filter input': function (event) {
    if($(event.target).val() != ''){
      $(".btnRefreshList").addClass('btnSearchAlert');
    }else{
      $(".btnRefreshList").removeClass('btnSearchAlert');
    }
    if (event.keyCode == 13) {
       $(".btnRefreshList").trigger("click");
    }
  },

  'click .exportbtn': function () {
    $('.fullScreenSpin').css('display','inline-block');
    jQuery('#tblBOMList_wrapper .dt-buttons .btntabletocsv').click();
    $('.fullScreenSpin').css('display','none');

  },
  'click .exportbtnExcel': function () {
      $('.fullScreenSpin').css('display','inline-block');
      jQuery('#tblBOMList_wrapper .dt-buttons .btntabletoexcel').click();
      $('.fullScreenSpin').css('display','none');
  },

  'click .btnRefresh':  (e, ui) => {
    // ui.initPage(true);
    $('.fullScreenSpin').css('display','inline-block');
    let templateObject = Template.instance();
    setTimeout(()=>{
      window.open('/bomlist','_self');
    }, 3000)

  },
'click .printConfirm' : function(event){
    playPrintAudio();
    setTimeout(function(){
    $('.fullScreenSpin').css('display','inline-block');
    jQuery('#tblBOMList_wrapper .dt-buttons .btntabletopdf').click();
    $('.fullScreenSpin').css('display','none');
}, delayTimeAfterSound);
},
'click .templateDownload': function () {
    let utilityService = new UtilityService();
    let rows =[];
    const filename = 'SampleBOM'+'.csv';
    rows[0]= ['Product Name', 'Product Description', 'Process Name','Stock Count', 'Sub products & raws','Attachments'];
    rows[1]= ['Bicycle', 'a toy', 'Assembly','1', 'handler, wheel','No attachment'];
    utilityService.exportToCsv(rows, filename, 'csv');
},
'click .templateDownloadXLSX': function (e) {

    e.preventDefault();  //stop the browser from following
    window.location.href = 'sample_imports/SampleBOM.xlsx';
},
'click .btnUploadFile':function(event){
    $('#attachment-upload').val('');
    $('.file-name').text('');
    //$(".btnImport").removeAttr("disabled");
    $('#attachment-upload').trigger('click');

},
'change #attachment-upload': function (e) {
    let templateObj = Template.instance();
    var filename = $('#attachment-upload')[0].files[0]['name'];
    var fileExtension = filename.split('.').pop().toLowerCase();
    var validExtensions = ["csv","txt","xlsx"];
    var validCSVExtensions = ["csv","txt"];
    var validExcelExtensions = ["xlsx","xls"];

    if (validExtensions.indexOf(fileExtension) == -1) {
        swal('Invalid Format', 'formats allowed are :' + validExtensions.join(', '), 'error');
        $('.file-name').text('');
        $(".btnImport").Attr("disabled");
    }else if(validCSVExtensions.indexOf(fileExtension) != -1){

        $('.file-name').text(filename);
        let selectedFile = event.target.files[0];
        templateObj.selectedFile.set(selectedFile);
        if($('.file-name').text() != ""){
            $(".btnImport").removeAttr("disabled");
        }else{
            $(".btnImport").Attr("disabled");
        }
    }else if(fileExtension == 'xlsx'){
        $('.file-name').text(filename);
        let selectedFile = event.target.files[0];
        var oFileIn;
        var oFile = selectedFile;
        var sFilename = oFile.name;
        // Create A File Reader HTML5
        var reader = new FileReader();

        // Ready The Event For When A File Gets Selected
        reader.onload = function (e) {
            var data = e.target.result;
            data = new Uint8Array(data);
            var workbook = XLSX.read(data, {type: 'array'});

            var result = {};
            workbook.SheetNames.forEach(function (sheetName) {
                var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {header: 1});
                var sCSV = XLSX.utils.make_csv(workbook.Sheets[sheetName]);
                templateObj.selectedFile.set(sCSV);

                if (roa.length) result[sheetName] = roa;
            });
            // see the result, caution: it works after reader event is done.

        };
        reader.readAsArrayBuffer(oFile);

        if($('.file-name').text() != ""){
            $(".btnImport").removeAttr("disabled");
        }else{
            $(".btnImport").Attr("disabled");
        }

    }



},
'click .btnImport' : function () {
    $('.fullScreenSpin').css('display','inline-block');
    let templateObject = Template.instance();
    let contactService = new ContactService();
    let objDetails;
    var saledateTime = new Date();
    //let empStartDate = new Date().format("YYYY-MM-DD");
    Papa.parse(templateObject.selectedFile.get(), {
        complete: function(results) {

            if(results.data.length > 0){
                if( (results.data[0][0] == "Product Name")
                   && (results.data[0][1] == "Product Description") && (results.data[0][2] == "Process Name")
                   && (results.data[0][3] == "Stock Count") && (results.data[0][4] == "Sub products & raws")
                   && (results.data[0][5] == "Attachments") ) {

                    let dataLength = results.data.length * 500;
                    setTimeout(function(){
                        // $('#importModal').modal('toggle');
                        //Meteor._reload.reload();
                        window.open('/bomlist?success=true','_self');
                    },parseInt(dataLength));

                    for (let i = 0; i < results.data.length -1; i++) {
                        let subs = [];  
                      let subTitles = results.data[i+1][4].split(',');
                        for(let j = 0; j < subTitles.length; j++) {
                          subs.push({
                            productName: subTitles[j],
                            process: '',
                            qty: 1,
                            attachments: []
                          })
                        }
                        objDetails = {
                            type: "TProcTree",
                            fields:
                            {
                                productName: results.data[i+1][0].trim(),
                                productDescription: results.data[i+1][1].trim(),
                                process: results.data[i+1][2],
                                processNote: '',
                                totalQtyInStock: results.data[i+1][3],
                                subs: subs,
                                attachments: []
                                

                                // BillStreet: results.data[i+1][6],
                                // BillStreet2: results.data[i+1][7],
                                // BillState: results.data[i+1][8],
                                // BillPostCode:results.data[i+1][9],
                                // Billcountry:results.data[i+1][10]
                            }
                        };
                        if(results.data[i+1][0]){
                            if(results.data[i+1][0] !== "") {
                                // contactService.saveEmployee(objDetails).then(function (data) {
                                //     ///$('.fullScreenSpin').css('display','none');
                                //     //Meteor._reload.reload();
                                // }).catch(function (err) {
                                //     //$('.fullScreenSpin').css('display','none');
                                //     swal({ title: 'Oooops...', text: err, type: 'error', showCancelButton: false, confirmButtonText: 'Try Again' }).then((result) => { if (result.value) { Meteor._reload.reload(); } else if (result.dismiss === 'cancel') {}});
                                // });
                                $('.fullScreenSpin').css('display','none');
                                let bomProducts = localStorage.getItem('TProcTree')?JSON.parse(localStorage.getItem('TProcTree')): [];
                                let index = bomProducts.findIndex(product => {
                                  return product.fields.productName == results.data[i+1][0];
                                })
                                if(index == -1) {
                                  bomProducts.push(objDetails)
                                } else {
                                  bomProducts.splice(index, 1, objDetails)
                                } 
                                localStorage.setItem('TProcTree', bomProducts);
                                Meteor._reload.reload();
                            }
                        }
                    }
                }else{
                    $('.fullScreenSpin').css('display','none');
                    swal('Invalid Data Mapping fields ', 'Please check that you are importing the correct file with the correct column headers.', 'error');
                }
            }else{
                $('.fullScreenSpin').css('display','none');
                swal('Invalid Data Mapping fields ', 'Please check that you are importing the correct file with the correct column headers.', 'error');
            }

        }
    });
}
  
})
Template.bom_list.helpers({
  salesCloudPreferenceRec: () => {
    return CloudPreference.findOne({userid:Session.get('mycloudLogonID'),PrefName:'tblEmployeelist'});
  },
  loggedCompany: () => {
      return localStorage.getItem('mySession') || '';
  },
  isSetupFinished: () => {
      return Template.instance().setupFinished.get();
  },
  getSkippedSteps() {
    let setupUrl = localStorage.getItem("VS1Cloud_SETUP_SKIPPED_STEP") || JSON.stringify().split();
    return setupUrl[1];
},
})