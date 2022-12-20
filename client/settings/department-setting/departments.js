import {TaxRateService} from "../settings-service";
import { ReactiveVar } from 'meteor/reactive-var';
import { SideBarService } from '../../js/sidebar-service';
import { ContactService } from "../../contacts/contact-service";
import {UtilityService} from "../../utility-service";
import '../../lib/global/indexdbstorage.js';
import XLSX from 'xlsx';
let sideBarService = new SideBarService();
Template.departmentSettings.inheritsHooksFrom('non_transactional_list');

Template.departmentSettings.onCreated(function(){
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.employeerecords = new ReactiveVar([]);
    templateObject.deptrecords = new ReactiveVar();
    templateObject.roomrecords = new ReactiveVar([]);

    templateObject.departlist = new ReactiveVar([]);
    templateObject.selectedFile = new ReactiveVar();
});

Template.departmentSettings.onRendered(function() {
    //$('.fullScreenSpin').css('display','inline-block');
    let templateObject = Template.instance();
    let taxRateService = new TaxRateService();
    const dataTableList = [];
    const tableHeaderList = [];
    const deptrecords = [];
    let deptprodlineItems = [];


    function MakeNegative() {
        $('td').each(function(){
            if($(this).text().indexOf('-'+Currency) >= 0) $(this).addClass('text-danger')
        });
    };

    $('#tblDepartmentList tbody').on("click", "tr", function () {
        $('#add-dept-title').text('Edit Department');
        let deptID = $(event.target).closest('tr').attr('id');
        let deptName = $(event.target).closest('tr').find('.colDeptName').text();
        let deptDesc = $(event.target).closest('tr').find('.colDescription').text();
        let siteCode = $(event.target).closest('tr').find('.colSiteCode').text();
        let status = $(event.target).closest('tr').find('.colStatus').text();
        $('#edtDepartmentID').val(deptID);
        $('#edtDeptName').val(deptName);
        $('#txaDescription').val(deptDesc);
        $('#edtSiteCode').val(deptDesc);
        $('#myModalDepartment').modal('show');
        //Make btnDelete "Make Active or In-Active"
        if(status == "In-Active"){
            $('#view-in-active').html("<button class='btn btn-success btnActivateDept vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make Active</button>");
        }else{
            $('#view-in-active').html("<button class='btn btn-danger btnDeleteDept vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make In-Active</button>");
        }

    });
});


Template.departmentSettings.events({
    'click #btnNewInvoice':function(event){
        // FlowRouter.go('/invoicecard');
    },
    'click #exportbtn': function () {
        $('.fullScreenSpin').css('display','inline-block');
        jQuery('#tblDepartmentList_wrapper .dt-buttons .btntabletocsv').click();
        $('.fullScreenSpin').css('display','none');

    },
    "click .printConfirm": function (event) {
      $(".fullScreenSpin").css("display", "inline-block");
      jQuery("#tblDepartmentList_wrapper .dt-buttons .btntabletopdf").click();
      $(".fullScreenSpin").css("display", "none");
    },
    'click .btnRefresh': function () {
        $(".fullScreenSpin").css("display", "inline-block");
        sideBarService.getDepartment().then(function(dataReload) {
            addVS1Data('TDeptClassList', JSON.stringify(dataReload)).then(function(datareturn) {
              sideBarService.getDepartmentDataList(initialBaseDataLoad, 0, false).then(async function(dataDeptList) {
                  await addVS1Data('TDeptClassList', JSON.stringify(dataDeptList)).then(function(datareturn) {
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
    'click .btnCloseAddNewDept': function () {
        playCancelAudio();
        setTimeout(function(){
        $('#newdepartment').css('display','none');
        }, delayTimeAfterSound);
    },
    'click .btnDeleteDept': function () {
        playDeleteAudio();
        let taxRateService = new TaxRateService();
        setTimeout(function(){
        $('.fullScreenSpin').css('display', 'inline-block');
        let deptID = $('#edtDepartmentID').val() || '';
        let deptName = $('#edtDeptName').val() || '';
        let deptDesc = $('#txaDescription').val() || '';
        let siteCode = $('#edtSiteCode').val() || '';
        let objDetails = {
            type: "TDeptClass",
            fields: {
                Id: deptID,
                DeptClassName: deptName,
                Description: deptDesc,
                SiteCode: siteCode,
                Active: false
            }
        };

        taxRateService.saveDepartment(objDetails).then(function (objDetails) {
            sideBarService.getDepartment().then(function(dataReload) {
                addVS1Data('TDeptClass', JSON.stringify(dataReload)).then(function(datareturn) {
                  sideBarService.getDepartmentDataList(initialBaseDataLoad, 0, false).then(async function(dataDeptList) {
                      await addVS1Data('TDeptClassList', JSON.stringify(dataDeptList)).then(function(datareturn) {
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
    'click .btnActivateDept': function() {
        playSaveAudio();
        let contactService = new ContactService();
        setTimeout(function() {
            $('.fullScreenSpin').css('display', 'inline-block');
            let deptID = $('#edtDepartmentID').val() || '';
            let deptName = $('#edtDeptName').val() || '';
            let deptDesc = $('#txaDescription').val() || '';
            let siteCode = $('#edtSiteCode').val() || '';
            let objDetails = {
                type: "TDeptClass",
                fields: {
                    Id: deptID,
                    DeptClassName: deptName,
                    Description: deptDesc,
                    SiteCode: siteCode,
                    Active: false
                }
            };
            contactService.saveDepartment(objDetails).then(function(result) {
                sideBarService.getDepartment().then(function(dataReload) {
                    addVS1Data('TDeptClass', JSON.stringify(dataReload)).then(function(datareturn) {
                      sideBarService.getDepartmentDataList(initialBaseDataLoad, 0, false).then(async function(dataDeptList) {
                          await addVS1Data('TDeptClassList', JSON.stringify(dataDeptList)).then(function(datareturn) {
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
                            // Meteor._reload.reload();
                        } else if (result.dismiss === 'cancel') {}
                    });
                    $('.fullScreenSpin').css('display', 'none');
                });
        }, delayTimeAfterSound);
    },
    'click .btnSaveDept': function () {
        playSaveAudio();
        let taxRateService = new TaxRateService();
        setTimeout(function(){
        $('.fullScreenSpin').css('display','inline-block');
        let objDetails = {};
        let deptID = $('#edtDepartmentID').val()||0;
        //let headerDept = $('#sltDepartment').val();
        let deptName = $('#edtDeptName').val()||'';
        let deptDesc = $('#txaDescription').val()||'';
        let siteCode = $('#edtSiteCode').val()||'';
        let checkDeptID ='';
        let objStSDetails = null;
        if (deptName === ''){
            swal('Department name cannot be blank!', '', 'warning');
            $('.fullScreenSpin').css('display','none');
            e.preventDefault();
        }else{
            if(deptID == ""){
                objDetails = {
                    type: "TDeptClass",
                    fields: {
                        //DeptClassGroup: headerDept,
                        DeptClassName: deptName,
                        Description: deptDesc,
                        SiteCode: siteCode,
                        StSClass: objStSDetails,
                        Active: true
                    }
                }
            }else{
                objDetails = {
                    type: "TDeptClass",
                    fields: {
                        ID: parseInt(deptID)||0,
                        //DeptClassGroup: headerDept,
                        DeptClassName: deptName,
                        Description: deptDesc,
                        SiteCode: siteCode,
                        StSClass: objStSDetails,
                        Active: true
                    }
                }
            }

            taxRateService.saveDepartment(objDetails).then(function (objDetails) {
              sideBarService.getDepartment().then(function(dataReload) {
                  addVS1Data('TDeptClass',JSON.stringify(dataReload)).then(function (datareturn) {
                    sideBarService.getDepartmentDataList(initialBaseDataLoad, 0, false).then(async function(dataDeptList) {
                        await addVS1Data('TDeptClassList', JSON.stringify(dataDeptList)).then(function(datareturn) {
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
            }).catch(function (err) {
                swal({
                    title: 'Oooops...',
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
                $('.fullScreenSpin').css('display','none');
            });

        }
        if (isModuleGreenTrack) {

            let sltMainContact = $('#sltMainContact').val();
            let stsMainContactNo = $('#stsMainContactNo').val();
            let stsLicenseNo = $('#stsLicenseNo').val();
            let sltDefaultRoomName = $('#sltDefaultRoom').val();
            var newbinnum = $("#sltDefaultRoom").find('option:selected').attr('mytagroom');
            objStSDetails = {
                type: "TStSClass",
                fields: {
                    DefaultBinLocation: sltDefaultRoomName || '',
                    DefaultBinNumber: newbinnum || '',
                    LicenseNumber: stsLicenseNo || '',
                    PrincipleContactName: sltMainContact || '',
                    PrincipleContactPhone: stsMainContactNo || ''
                }
            }
        }
        }, delayTimeAfterSound);
    },
    'click .btnAddDept': function () {
        $('#add-dept-title').text('Add New Department');
        $('#edtDepartmentID').val('');
        $('#edtSiteCode').val('');
        $('#edtDeptName').val('');
        $('#edtDeptName').prop('readonly', false);
        $('#edtDeptDesc').val('');
        $('#myModalDepartment').modal('show');
        $('#view-in-active').html("<button class='btn btn-danger btnDeleteDept vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make In-Active</button>");
    },
    'click .btnBack':function(event){
        playCancelAudio();
        event.preventDefault();
        setTimeout(function(){
        history.back(1);
        }, delayTimeAfterSound);
    },
    'keydown #edtSiteCode, keyup #edtSiteCode': function(event){
        if ($.inArray(event.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||
            // Allow: Ctrl+A, Command+A
            (event.keyCode === 65 && (event.ctrlKey === true || event.metaKey === true)) ||
            // Allow: home, end, left, right, down, up
            (event.keyCode >= 35 && event.keyCode <= 40)) {
            // let it happen, don't do anything
            return;
        }

        if (event.shiftKey == true) {

        }

        if ((event.keyCode >= 48 && event.keyCode <= 57) ||
            (event.keyCode >= 96 && event.keyCode <= 105) ||
            event.keyCode == 8 || event.keyCode == 9 ||
            event.keyCode == 37 || event.keyCode == 39 ||
            event.keyCode == 46 || event.keyCode == 190) {
            event.preventDefault();
        } else {
            //event.preventDefault();
        }

    },
    'blur #edtSiteCode': function(event){
        $(event.target).val($(event.target).val().toUpperCase());

    },
    'click .btnSaveRoom': function () {
        playSaveAudio();
        let taxRateService = new TaxRateService();
        setTimeout(function(){
        $('.fullScreenSpin').css('display','inline-block');

        var parentdept = $('#sltDepartmentList').val();
        var newroomname = $('#newRoomName').val();
        var newroomnum = $('#newRoomNum').val();


        let data = '';

        data = {
            type: "TProductBin",
            fields: {
                BinClassName: parentdept|| '',
                BinLocation: newroomname|| '',
                BinNumber: newroomnum|| ''
            }
        };


        taxRateService.saveRoom(data).then(function (data) {
            window.open('/departmentSettings','_self');
        }).catch(function (err) {

            $('.fullScreenSpin').css('display','none');
        });
    }, delayTimeAfterSound);
    },
    // Import here
    'click .templateDownload': function() {
        let utilityService = new UtilityService();
        let rows = [];
        const filename = 'SampleDepartmentSettings' + '.csv';
        rows[0] = ['Department Name', 'Description', 'Site Code'];
        rows[1] = ['ABC Department','Enter description', 'ABC'];
        utilityService.exportToCsv(rows, filename, 'csv');
    },
    'click .templateDownloadXLSX': function(e) {
        e.preventDefault(); //stop the browser from following
        window.location.href = 'sample_imports/SampleDepartmentSettings.xlsx';
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
        let typeDesc = '';
        let siteCode = '';
        Papa.parse(templateObject.selectedFile.get(), {
            complete: function(results) {

                if (results.data.length > 0) {
                    if ((results.data[0][0] == "Department Name") && (results.data[0][1] == "Description") && (results.data[0][2] == "Site Code")) {

                        let dataLength = results.data.length * 500;
                        setTimeout(function() {
                            $('.importTemplateModal').hide();
                            $('.modal-backdrop').hide();
                            FlowRouter.go('/departmentSettings?success=true');
                            $('.fullScreenSpin').css('display', 'none');
                        }, parseInt(dataLength));

                        for (let i = 0; i < results.data.length - 1; i++) {
                            deptDesc = results.data[i + 1][1] !== undefined ? results.data[i + 1][1] : '';
                            siteCode = results.data[i + 1][2] !== undefined ? results.data[i + 1][2] : '';
                            objDetails = {
                                type: "TDeptClass",
                                fields: {
                                    DeptClassName: results.data[i + 1][0],
                                    Description: deptDesc,
                                    SiteCode: siteCode,
                                    Active: true
                                }
                            };
                            if (results.data[i + 1][1]) {
                                if (results.data[i + 1][1] !== "") {
                                    taxRateService.saveDepartment(objDetails).then(function(data) {
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

Template.departmentSettings.helpers({
    datatablerecords : () => {
        return Template.instance().datatablerecords.get().sort(function(a, b){
            if (a.headDept == 'NA') {
                return 1;
            }
            else if (b.headDept == 'NA') {
                return -1;
            }
            return (a.headDept.toUpperCase() > b.headDept.toUpperCase()) ? 1 : -1;
            // return (a.saledate.toUpperCase() < b.saledate.toUpperCase()) ? 1 : -1;
        });
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    salesCloudPreferenceRec: () => {
        return CloudPreference.findOne({userid:Session.get('mycloudLogonID'),PrefName:'tblDepartmentList'});
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
    isModuleGreenTrack: () => {
        return isModuleGreenTrack;
    },
    listEmployees: () => {
        return Template.instance().employeerecords.get().sort(function(a, b){
            if (a.employeename == 'NA') {
                return 1;
            }
            else if (b.employeename == 'NA') {
                return -1;
            }
            return (a.employeename.toUpperCase() > b.employeename.toUpperCase()) ? 1 : -1;
        });
    },
    listBins: () => {
        return Template.instance().roomrecords.get().sort(function(a, b){
            if (a.roomname == 'NA') {
                return 1;
            }
            else if (b.roomname == 'NA') {
                return -1;
            }
            return (a.roomname.toUpperCase() > b.roomname.toUpperCase()) ? 1 : -1;
        });
    },
    listDept: () => {
        return Template.instance().departlist.get().sort(function(a, b){
            if (a.deptname == 'NA') {
                return 1;
            }
            else if (b.deptname == 'NA') {
                return -1;
            }
            return (a.deptname.toUpperCase() > b.deptname.toUpperCase()) ? 1 : -1;
        });
    },
    loggedCompany: () => {
        return localStorage.getItem('mySession') || '';
    }
});
