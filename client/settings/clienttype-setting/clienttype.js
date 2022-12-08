import { ContactService } from "../../contacts/contact-service";
import { SideBarService } from '../../js/sidebar-service';
import {TaxRateService} from "../settings-service";
import { ReactiveVar } from 'meteor/reactive-var';
import XLSX from 'xlsx';
let sideBarService = new SideBarService();
Template.clienttypesettings.inheritsHooksFrom('non_transactional_list');
Template.clienttypesettings.onCreated(function () {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.employeerecords = new ReactiveVar([]);
    templateObject.deptrecords = new ReactiveVar();
    templateObject.roomrecords = new ReactiveVar([]);
    templateObject.clienttypeList = new ReactiveVar();

    templateObject.departlist = new ReactiveVar([]);
    templateObject.selectedFile = new ReactiveVar();
});

Template.clienttypesettings.onRendered(function () {
    //$('.fullScreenSpin').css('display', 'inline-block');
    let templateObject = Template.instance();
    let taxRateService = new TaxRateService();
    let contactService = new ContactService();
    let clientType = [];
    const dataTableList = [];
    const tableHeaderList = [];
    const deptrecords = [];
    let deptprodlineItems = [];


    // $(document).on('click', '.table-remove', function (event) {
    //     var targetID = $(event.target).closest('tr').attr('id'); // table row ID
    //     $('#selectDeleteLineID').val(targetID);
    //     $('#deleteLineModal').modal('toggle');
    // });

    $('#tblClienttypeList tbody').on("click", "tr", function () {
        $('#add-clienttype-title').text('Edit Customer Type');
        let targetID = $(event.target).closest('tr').attr('id');
        let typeDescription = $(event.target).closest('tr').find('.colDescription').text();
        let typeName = $(event.target).closest('tr').find('.colTypeName').text();
        $('#edtClientTypeID').val(targetID);
        $('#edtClientTypeName').val(typeName);
        $('#txaDescription').val(typeDescription);
        $('#myModalClientType').modal('show');

    });
});

Template.clienttypesettings.events({
    'click #btnNewInvoice': function (event) {
        // FlowRouter.go('/invoicecard');
    },
    'click #exportbtn': function () {
        $('.fullScreenSpin').css('display', 'inline-block');
        jQuery('#tblClienttypeList_wrapper .dt-buttons .btntabletocsv').click();
        $('.fullScreenSpin').css('display', 'none');

    },
    "click .printConfirm": function (event) {
      $(".fullScreenSpin").css("display", "inline-block");
      jQuery("#tblClienttypeList_wrapper .dt-buttons .btntabletopdf").click();
      $(".fullScreenSpin").css("display", "none");
    },
    'click .btnRefresh': function () {
        $(".fullScreenSpin").css("display", "inline-block");
        sideBarService.getClientTypeData().then(function (dataReload) {
            addVS1Data('TClientTypeList', JSON.stringify(dataReload)).then(function (datareturn) {
                sideBarService.getClientTypeDataList(initialBaseDataLoad, 0,false).then(async function (dataList) {
                    await addVS1Data('TClientTypeList', JSON.stringify(dataList));
                    window.open("/clienttypesettings", "_self");
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
    'click .btnAddClientType': async function () {
        await $('#add-clienttype-title').text('Add New Customer Type');
        $('#edtClientTypeName').val("");
        $('#txaDescription').val("");
        //$('.btnDeleteClientType').hide();

    },
     'click .btnAddNewClientType': function () {
        $('#newClientType').css('display', 'block');

    },
    'click .btnClose': function () {
        playCancelAudio();
        setTimeout(function(){
        $('#newClientType').css('display', 'none');
        }, delayTimeAfterSound);
    },
    'click .btnDeleteClientType': function () {
        playDeleteAudio();
        let contactService = new ContactService();
        setTimeout(function(){
        //$('.fullScreenSpin').css('display', 'inline-block');
        let clientTypeId = $('#edtClientTypeID').val();

        let objDetails = {
            type: "TClientType",
            fields: {
                Id: clientTypeId,
                Active: false
            }
        };

        contactService.saveClientTypeData(objDetails).then(function (objDetails) {
            sideBarService.getClientTypeData().then(function (dataReload) {
                addVS1Data('TClientTypeList', JSON.stringify(dataReload)).then(function (datareturn) {
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
    'click .btnSaveDept': function () {
        playSaveAudio();
        let contactService = new ContactService();
        setTimeout(function(){
        $('.fullScreenSpin').css('display', 'inline-block');

        let objDetails ={};
        //let headerDept = $('#sltDepartment').val();
        let custType = $('#edtClientTypeName').val();
        let typeDesc = $('#txaDescription').val() || '';
        let id = $('#typeID').val() || '';
        if (custType === '') {
            swal('Client Type name cannot be blank!', '', 'warning');
            $('.fullScreenSpin').css('display', 'none');
            e.preventDefault();
        } else {
            if(id == "") {
            objDetails = {
                type: "TClientType",
                fields: {
                    TypeName: custType,
                    TypeDescription: typeDesc,
                    Active: true
                }
            }
        } else {
                objDetails = {
                type: "TClientType",
                fields: {
                    Id: id,
                    TypeName: custType,
                    TypeDescription: typeDesc,
                    Active: true
                }

            }
            }
            objDetails = {
                type: "TClientType",
                fields: {
                    TypeName: custType,
                    TypeDescription: typeDesc,
                    Active: true
                }
            }
            contactService.saveClientTypeData(objDetails).then(function (objDetails) {
                sideBarService.getClientTypeData().then(function (dataReload) {
                    addVS1Data('TClientTypeList', JSON.stringify(dataReload)).then(function (datareturn) {
                        Meteor._reload.reload();
                    }).catch(function (err) {
                        Meteor._reload.reload();
                    });
                }).catch(function (err) {
                    Meteor._reload.reload();
                });
                // Meteor._reload.reload();
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
                    } else if (result.dismiss === 'cancel') {}
                });
                $('.fullScreenSpin').css('display', 'none');
            });
        }
    }, delayTimeAfterSound);
    },

    'click .btnBack': function (event) {
        playCancelAudio();
        event.preventDefault();
        setTimeout(function(){
        history.back(1);
        }, delayTimeAfterSound);
    },
    'keydown #edtSiteCode, keyup #edtSiteCode': function (event) {
        if ($.inArray(event.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||
            // Allow: Ctrl+A, Command+A
            (event.keyCode === 65 && (event.ctrlKey === true || event.metaKey === true)) ||
            // Allow: home, end, left, right, down, up
            (event.keyCode >= 35 && event.keyCode <= 40)) {
            // let it happen, don't do anything
            return;
        }

        if (event.shiftKey == true) {}

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
    'blur #edtSiteCode': function (event) {
        $(event.target).val($(event.target).val().toUpperCase());

    },
    'click .btnSaveRoom': function () {
        playSaveAudio();
        let taxRateService = new TaxRateService();
        setTimeout(function(){
        $('.fullScreenSpin').css('display', 'inline-block');

        var parentdept = $('#sltDepartmentList').val();
        var newroomname = $('#newRoomName').val();
        var newroomnum = $('#newRoomNum').val();

        let data = '';

        data = {
            type: "TProductBin",
            fields: {
                BinClassName: parentdept || '',
                BinLocation: newroomname || '',
                BinNumber: newroomnum || ''
            }
        };

        taxRateService.saveRoom(data).then(function (data) {
            window.open('/clienttypesettings', '_self');
        }).catch(function (err) {

            $('.fullScreenSpin').css('display', 'none');
        });
    }, delayTimeAfterSound);
    },
    // Import here
    'click .templateDownload': function() {
        let utilityService = new UtilityService();
        let rows = [];
        const filename = 'SampleCustomerTypeSettings' + '.csv';
        rows[0] = ['Type Name', 'Description'];
        rows[1] = ['ABC', 'Comments'];
        utilityService.exportToCsv(rows, filename, 'csv');
    },
    'click .templateDownloadXLSX': function(e) {

        e.preventDefault(); //stop the browser from following
        window.location.href = 'sample_imports/SampleCustomerTypeSettings.xlsx';
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
        let contactService = new ContactService();
        let objDetails;
        let typeDesc = '';
        Papa.parse(templateObject.selectedFile.get(), {
            complete: function(results) {

                if (results.data.length > 0) {
                    if ((results.data[0][0] == "Type Name") && (results.data[0][1] == "Description")) {

                        let dataLength = results.data.length * 500;
                        setTimeout(function() {
                            $('.importTemplateModal').hide();
                            $('.modal-backdrop').hide();
                            FlowRouter.go('/clienttypesettings?success=true');
                            $('.fullScreenSpin').css('display', 'none');
                        }, parseInt(dataLength));
                        for (let i = 0; i < results.data.length - 1; i++) {
                            typeDesc = results.data[i + 1][1] !== undefined ? results.data[i + 1][1] : '';
                            objDetails = {
                                type: "TClientType",
                                fields: {
                                    TypeName: results.data[i + 1][0],
                                    TypeDescription: typeDesc || '',
                                    Active: true
                                }
                            };
                            if (results.data[i + 1][1]) {
                                if (results.data[i + 1][1] !== "") {
                                    contactService.saveClientTypeData(objDetails).then(function(data) {
                                        //$('.fullScreenSpin').css('display','none');
                                        //  Meteor._reload.reload();
                                    }).catch(function(err) {
                                        //$('.fullScreenSpin').css('display','none');
                                        swal({ title: 'Oooops...', text: err, type: 'error', showCancelButton: false, confirmButtonText: 'Try Again' }).then((result) => {
                                            if (result.value) {
                                                // window.open('/clienttypesettings?success=true', '_self');
                                                FlowRouter.go('/clienttypesettings?success=true');
                                            } else if (result.dismiss === 'cancel') {
                                                FlowRouter.go('/clienttypesettings?success=false');
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

Template.clienttypesettings.helpers({
    datatablerecords: () => {
        return Template.instance().datatablerecords.get().sort(function (a, b) {
            if (a.typeName == 'NA') {
                return 1;
            } else if (b.typeName == 'NA') {
                return -1;
            }
            return (a.typeName.toUpperCase() > b.typeName.toUpperCase()) ? 1 : -1;
            // return (a.saledate.toUpperCase() < b.saledate.toUpperCase()) ? 1 : -1;
        });
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    salesCloudPreferenceRec: () => {
        return CloudPreference.findOne({
            userid: Session.get('mycloudLogonID'),
            PrefName: 'clienttypeList'
        });
    },
    deptrecords: () => {
        return Template.instance().deptrecords.get().sort(function (a, b) {
            if (a.department == 'NA') {
                return 1;
            } else if (b.department == 'NA') {
                return -1;
            }
            return (a.department.toUpperCase() > b.department.toUpperCase()) ? 1 : -1;
        });
    },
    isModuleGreenTrack: () => {
        return isModuleGreenTrack;
    },
    listEmployees: () => {
        return Template.instance().employeerecords.get().sort(function (a, b) {
            if (a.employeename == 'NA') {
                return 1;
            } else if (b.employeename == 'NA') {
                return -1;
            }
            return (a.employeename.toUpperCase() > b.employeename.toUpperCase()) ? 1 : -1;
        });
    },
    listBins: () => {
        return Template.instance().roomrecords.get().sort(function (a, b) {
            if (a.roomname == 'NA') {
                return 1;
            } else if (b.roomname == 'NA') {
                return -1;
            }
            return (a.roomname.toUpperCase() > b.roomname.toUpperCase()) ? 1 : -1;
        });
    },
    listDept: () => {
        return Template.instance().departlist.get().sort(function (a, b) {
            if (a.deptname == 'NA') {
                return 1;
            } else if (b.deptname == 'NA') {
                return -1;
            }
            return (a.deptname.toUpperCase() > b.deptname.toUpperCase()) ? 1 : -1;
        });
    },
    loggedCompany: () => {
        return localStorage.getItem('mySession') || '';
    }
});
