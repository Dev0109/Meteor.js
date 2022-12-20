import {UtilityService} from "../../utility-service";

Template.reconImportModal.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.selectedFile = new ReactiveVar();
});

Template.reconImportModal.onRendered(function () {
  const templateObject = Template.instance();
});

Template.reconImportModal.events({
  'click .templateDownload': function (e) {
    e.preventDefault();  //stop the browser from following
    window.location.href = 'sample_imports/SampleBankRecon.csv';
  },
  'click .btnUploadFile':function(event){
    $('#attachment-upload').val('');
    $('.file-name').text('');
    //$(".btnImport").removeAttr("disabled");
    $('#attachment-upload').trigger('click');

  },
  'click .templateDownloadXLSX': function (e) {
    e.preventDefault();  //stop the browser from following
    window.location.href = 'sample_imports/SampleBankRecon.xlsx';
  },
  'change #attachment-upload': function (e) {
    let templateObj = Template.instance();
    var filename = $('#attachment-upload')[0].files[0]['name'];
    var fileExtension = filename.split('.').pop().toLowerCase();
    var validExtensions = ["csv","txt","xlsx"];
    var validCSVExtensions = ["csv","txt"];
    var validExcelExtensions = ["xlsx","xls"];
    if (validExtensions.indexOf(fileExtension) == -1) {
      // Bert.alert('<strong>formats allowed are : '+ validExtensions.join(', ')+'</strong>!', 'danger');
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

    Papa.parse(templateObject.selectedFile.get(), {
        complete: function(results) {
          if (FlowRouter.current().route.path === "/bankrecon")
            if(results.data.length > 0){
                localStorage.setItem('BankStatement', JSON.stringify(results.data))
                FlowRouter.go('/newbankrule', {}, {preview: 1, bankaccountid: $('#bankAccountID').val(), bankaccountname: $('#bankAccountName').val()})
            }else{
                $('.fullScreenSpin').css('display','none');
                // Bert.alert('<strong> Data Mapping fields invalid. </strong> Please check that you are importing the correct file with the correct column headers.', 'danger');
                swal('Invalid Data Mapping fields ', 'Please check that you are importing the correct file with the correct column headers.', 'error');
            }
        }
    });
  }
});

Template.reconImportModal.helpers({

});
