import { ContactService } from "../../contacts/contact-service";
import { SideBarService } from '../../js/sidebar-service';
import { ReactiveVar } from 'meteor/reactive-var';
import { UtilityService } from "../../utility-service";
import '../../lib/global/indexdbstorage.js';
import XLSX from 'xlsx';
let sideBarService = new SideBarService();
let utilityService = new UtilityService();
let contactService = new ContactService();
Template.leadstatussettings.inheritsHooksFrom('non_transactional_list');
Template.leadstatussettings.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.leadStatusList = new ReactiveVar();
    templateObject.selectedFile = new ReactiveVar();
});

Template.leadstatussettings.onRendered(function() {
    $('.fullScreenSpin').css('display', 'inline-block');
    let templateObject = Template.instance();
    const dataTableList = [];
    const tableHeaderList = [];
    let needAddUnqualified = true;
    let needAddOpportunity = true;
    let needAddQuoted = true;
    let needAddInvoiced = true;


    function MakeNegative() {
        $('td').each(function() {
            if ($(this).text().indexOf('-' + Currency) >= 0)
                $(this).addClass('text-danger')
        });
    }

    templateObject.getLeadStatusData = function() {
        getVS1Data('TLeadStatusTypeList').then(function(dataObject) {
            if (dataObject.length == 0) {
                sideBarService.getAllLeadStatus().then(function(data) {
                    setLeadStatusList(data);
                })
            } else {
                let data = JSON.parse(dataObject[0].data);
                setLeadStatusList(data);
            }
        }).catch(function(err) {
            sideBarService.getAllLeadStatus().then(function(data) {
                setLeadStatusList(data);
            })
        });
    }

    function setLeadStatusList(data) {
        let isDefault = false;
        let linestatus = '';

        for (let i = 0; i < data.tleadstatustypelist.length; i++) {
            let eqpm = Number(data.tleadstatustypelist[i].EQPM);
            if(data.tleadstatustypelist[i].IsDefault == true){
                isDefault = '<div class="custom-control custom-switch chkBox text-center"><input class="custom-control-input chkBox" type="checkbox" id="iseomplus-'+data.tleadstatustypelist[i].ID+'" checked><label class="custom-control-label chkBox" for="iseomplus-'+data.tleadstatustypelist[i].ID+'"></label></div>';
            }else{
                isDefault = '<div class="custom-control custom-switch chkBox text-center"><input class="custom-control-input chkBox" type="checkbox" id="iseomplus-'+data.tleadstatustypelist[i].ID+'"><label class="custom-control-label chkBox" for="iseomplus-'+data.tleadstatustypelist[i].ID+'"></label></div>';
            };
            if (data.tleadstatustypelist[i].Active == true) {
                linestatus = "";
            } else if (data.tleadstatustypelist[i].Active == false) {
                linestatus = "In-Active";
            };
            const dataList = {
                id: data.tleadstatustypelist[i].ID || '',
                typeName: data.tleadstatustypelist[i].TypeCode || '',
                typeName: data.tleadstatustypelist[i].Name || '',
                description: data.tleadstatustypelist[i].Description || data.tleadstatustypelist[i].Name,
                isDefault: isDefault,
                eqpm: utilityService.negativeNumberFormat(eqpm),
                status: linestatus
            };
            if (data.tleadstatustypelist[i].Name == "Unqualified") {
                needAddUnqualified = false;
            }
            if (data.tleadstatustypelist[i].Name == "Opportunity") {
                needAddOpportunity = false;
            }
            if (data.tleadstatustypelist[i].Name == "Quoted") {
                needAddQuoted = false;
            }
            if (data.tleadstatustypelist[i].Name == "Invoiced") {
                needAddInvoiced = false;
            }
            dataTableList.push(dataList);
        }
        addDefaultValue();
        templateObject.datatablerecords.set(dataTableList);
        if (templateObject.datatablerecords.get()) {
            Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblLeadStatusList', function(error, result) {
                if (error) {

                } else {
                    if (result) {
                        for (let i = 0; i < result.customFields.length; i++) {
                            let customcolumn = result.customFields;
                            let columData = customcolumn[i].label;
                            let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                            let hiddenColumn = customcolumn[i].hidden;
                            let columnClass = columHeaderUpdate.split('.')[1];
                            let columnWidth = customcolumn[i].width;
                            let columnindex = customcolumn[i].index + 1;
                            if (hiddenColumn == true) {
                                $("." + columnClass + "").addClass('hiddenColumn');
                                $("." + columnClass + "").removeClass('showColumn');
                            } else if (hiddenColumn == false) {
                                $("." + columnClass + "").removeClass('hiddenColumn');
                                $("." + columnClass + "").addClass('showColumn');
                            }
                        }
                    }
                }
            });
            setTimeout(function() {
                MakeNegative();
            }, 100);
        }
        $('.fullScreenSpin').css('display', 'none');
        setTimeout(function() {
            $('#tblLeadStatusList').DataTable({
                columnDefs: [{
                    type: 'date',
                    targets: 0
                }, {
                    "orderable": false,
                    "targets": -1
                }],
                "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                buttons: [{
                    extend: 'excelHtml5',
                    text: '',
                    download: 'open',
                    className: "btntabletocsv hiddenColumn",
                    filename: "leadstatuslist_" + moment().format(),
                    orientation: 'portrait',
                    exportOptions: {
                        columns: ':visible'
                    }
                }, {
                    extend: 'print',
                    download: 'open',
                    className: "btntabletopdf hiddenColumn",
                    text: '',
                    title: 'Lead Status List',
                    filename: "leadstatuslist_" + moment().format(),
                    exportOptions: {
                        columns: ':visible'
                    }
                }],
                select: true,
                destroy: true,
                // colReorder: true,
                colReorder: {
                    fixedColumnsRight: 1
                },
                // bStateSave: true,
                // rowId: 0,
                pageLength: initialDatatableLoad,
                lengthMenu: [
                    [initialDatatableLoad, -1],
                    [initialDatatableLoad, "All"]
                ],
                info: true,
                responsive: true,
                "order": [
                    [0, "asc"]
                ],
                action: function() {
                    $('#tblLeadStatusList').DataTable().ajax.reload();
                },
                "fnDrawCallback": function(oSettings) {
                    setTimeout(function() {
                        MakeNegative();
                    }, 100);
                },
                language: { search: "", searchPlaceholder: "Search List..." },
                "fnInitComplete": function() {
                    this.fnPageChange('last');
                    $("<button class='btn btn-primary btnViewDeleted' type='button' id='btnViewDeleted' style='padding: 4px 10px; font-size: 16px; margin-left: 14px !important;'><i class='fa fa-trash' style='margin-right: 5px'></i>View In-Active</button>").insertAfter("#tblLeadStatusList_filter");

                    $("<button class='btn btn-primary btnRefreshleadStatusList' type='button' id='btnRefreshleadStatusList' style='padding: 4px 10px; font-size: 16px; margin-left: 14px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblLeadStatusList_filter");
                },
            }).on('page', function() {
                setTimeout(function() {
                    MakeNegative();
                }, 100);
                let draftRecord = templateObject.datatablerecords.get();
                templateObject.datatablerecords.set(draftRecord);
            }).on('column-reorder', function() {}).on('length.dt', function(e, settings, len) {
                setTimeout(function() {
                    MakeNegative();
                }, 100);
            });
            // $('#leadStatusList').DataTable().column( 0 ).visible( true );
            $('.fullScreenSpin').css('display', 'none');
        }, 0);

        const columns = $('#tblLeadStatusList th');
        let sWidth = "";
        let columnVisible = false;
        $.each(columns, function(i, v) {
            if (v.hidden == false) {
                columnVisible = true;
            }
            if ((v.className.includes("hiddenColumn"))) {
                columnVisible = false;
            }
            sWidth = v.style.width.replace('px', "");
            let datatablerecordObj = {
                sTitle: v.innerText || '',
                sWidth: sWidth || '',
                sIndex: v.cellIndex || '',
                sVisible: columnVisible || false,
                sClass: v.className || ''
            };
            tableHeaderList.push(datatablerecordObj);
        });
        templateObject.tableheaderrecords.set(tableHeaderList);
        $('div.dataTables_filter input').addClass('form-control form-control-sm');
    }

    function addDefaultValue() {
        let needAddDefault = true;
        if (!needAddUnqualified && !needAddOpportunity && !needAddQuoted && !needAddInvoiced) {
            needAddDefault = false;
        }
        if (needAddDefault) {
            let isSaved = false;
            if (needAddUnqualified) {
                contactService.getOneLeadStatusExByName("Quoted").then(function(leadStatus) {
                    let objUnqualified;
                    if (leadStatus.tleadstatustypelist.length == 0) {
                        objUnqualified = {
                            type: "TLeadStatusType",
                            fields: {
                                Name: "Unqualified",
                                Description: "Default Value",
                                EQPM: 10,
                                Active: true
                            }
                        }
                    } else {
                        let statusID = leadStatus.tleadstatustypelist[0].ID;
                        objUnqualified = {
                            type: "TLeadStatusType",
                            fields: {
                                Id: statusID,
                                Active: true
                            }
                        }
                    }
                    contactService.saveLeadStatusData(objUnqualified).then(function(result) {
                        isSaved = true;
                    }).catch(function(err) {});
                })
            }
            if (needAddOpportunity) {
                contactService.getOneLeadStatusExByName("Quoted").then(function(leadStatus) {
                    let objOpportunity;
                    if (leadStatus.tleadstatustypelist.length == 0) {
                        objOpportunity = {
                            type: "TLeadStatusType",
                            fields: {
                                Name: "Opportunity",
                                Description: "Default Value",
                                EQPM: 10,
                                Active: true
                            }
                        }
                    } else {
                        let statusID = leadStatus.tleadstatustypelist[0].ID;
                        objOpportunity = {
                            type: "TLeadStatusType",
                            fields: {
                                Id: statusID,
                                Active: true
                            }
                        }
                    }
                    contactService.saveLeadStatusData(objOpportunity).then(function(result) {
                        isSaved = true;
                    }).catch(function(err) {});
                })
            }
            if (needAddQuoted) {
                contactService.getOneLeadStatusExByName("Quoted").then(function(leadStatus) {
                    let objQuoted;
                    if (leadStatus.tleadstatustypelist.length == 0) {
                        objQuoted = {
                            type: "TLeadStatusType",
                            fields: {
                                Name: "Quoted",
                                Description: "Default Value",
                                EQPM: 10,
                                Active: true
                            }
                        }
                    } else {
                        let statusID = leadStatus.tleadstatustypelist[0].ID;
                        objQuoted = {
                            type: "TLeadStatusType",
                            fields: {
                                Id: statusID,
                                Active: true
                            }
                        }
                    }
                    contactService.saveLeadStatusData(objQuoted).then(function(result) {
                        isSaved = true;
                    }).catch(function(err) {});
                })
            }
            if (needAddInvoiced) {
                contactService.getOneLeadStatusExByName("Invoiced").then(function(leadStatus) {
                    let objInvoiced;
                    if (leadStatus.tleadstatustypelist.length == 0) {
                        objInvoiced = {
                            type: "TLeadStatusType",
                            fields: {
                                Name: "Invoiced",
                                Description: "Default Value",
                                EQPM: 10,
                                Active: true
                            }
                        }
                    } else {
                        let statusID = leadStatus.tleadstatustypelist[0].ID;
                        objInvoiced = {
                            type: "TLeadStatusType",
                            fields: {
                                Id: statusID,
                                Active: true
                            }
                        }
                    }
                    contactService.saveLeadStatusData(objInvoiced).then(function(result) {
                        isSaved = true;
                    }).catch(function(err) {});
                })
            }
            setTimeout(function() {
                if (isSaved) {
                    sideBarService.getAllLeadStatus().then(function(dataReload) {
                        addVS1Data('TLeadStatusTypeList', JSON.stringify(dataReload)).then(function(datareturn) {
                            Meteor._reload.reload();
                        }).catch(function(err) {
                            Meteor._reload.reload();
                        });
                    }).catch(function(err) {
                        Meteor._reload.reload();
                    });
                }
            }, 5000);
        }
    }
    templateObject.getLeadStatusData();

    $(document).on('click', '.table-remove', function(event) {
        const targetID = $(event.target).closest('tr').attr('id'); // table row ID
        $('#selectDeleteLineID').val(targetID);
        $('#deleteLineModal').modal('toggle');
    });

    $('#tblLeadStatusList tbody').on('click', 'tr', function(event) {
        $('#add-leadstatus-title').text('Edit Lead Status');
        let targetID = $(event.target).closest('tr').attr('id');
        let description = $(event.target).closest('tr').find('.colDescription').text();
        let statusName = $(event.target).closest('tr').find('.colStatusName').text();
        let quantity = $(event.target).closest('tr').find('.colQuantity').text();
        let status = $(event.target).closest('tr').find('.colStatus').text();
        $('#statusID').val(targetID);
        $('#edtLeadStatusName').val(statusName);
        $('#statusDescription').val(description);
        $('#statusQuantity').val(quantity);
        $('#myModalLeadStatus').modal('show');
        //Make btnDelete "Make Active or In-Active"
        if(status == "In-Active"){
            $('#view-in-active').html("<button class='btn btn-success btnActivateLeadStatus vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make Active</button>");
        }else{
            $('#view-in-active').html("<button class='btn btn-danger btnDeleteLeadStatus vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make In-Active</button>");
        }
    });
});

Template.leadstatussettings.events({
    'click #exportbtn': function() {
        $('.fullScreenSpin').css('display', 'inline-block');
        jQuery('#tblLeadStatusList_wrapper .dt-buttons .btntabletocsv').click();
        $('.fullScreenSpin').css('display', 'none');
    },
    "click .printConfirm": function(event) {
        $(".fullScreenSpin").css("display", "inline-block");
        jQuery("#tblLeadStatusList_wrapper .dt-buttons .btntabletopdf").click();
        $(".fullScreenSpin").css("display", "none");
    },
    'click .btnRefresh': function() {
        $(".fullScreenSpin").css("display", "inline-block");
        sideBarService.getAllLeadStatus().then(function(dataReload) {
            addVS1Data('TLeadStatusTypeList', JSON.stringify(dataReload)).then(function(datareturn) {
              sideBarService.getLeadStatusDataList(initialBaseDataLoad, 0, false).then(async function(dataLeadList) {
                  await addVS1Data('TLeadStatusTypeList', JSON.stringify(dataLeadList)).then(function(datareturn) {
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
    'click .btnAddLeadStatus': function() {
        $('#add-leadstatus-title').text('Add New Lead Status');
        $('#statusID').val('');
        $('#edtLeadStatusName').val('');
        $('#statusDescription').val('');
        $('#statusQuantity').val(1.0);
        $('#myModalLeadStatus').modal('show');
        $('#view-in-active').html("<button class='btn btn-danger btnDeleteLeadStatus vs1ButtonMargin' id='view-in-active' type='button'><i class='fa fa-trash' style='padding-right: 8px;'></i>Make In-Active</button>");
    },
    'click .btnClose': function () {
        playCancelAudio();
        setTimeout(function(){
        $('#myModalLeadStatus').css('display', 'none');
        }, delayTimeAfterSound);
    },
    'click .btnDeleteLeadStatus': function() {
        playDeleteAudio();
        let contactService = new ContactService();
        setTimeout(function() {
            $('.fullScreenSpin').css('display', 'inline-block');
            let statusId = $('#statusID').val()||0;
            let statusName = $('#edtLeadStatusName').val() || '';
            let statusDesc = $('#statusDescription').val() || '';
            let statusEQPM = $('#statusQuantity').val() || '';
            statusEQPM = Number(statusEQPM.replace(/[^0-9.-]+/g, "")) || 1.0
            statusEQPM = statusEQPM.toString();
            let objDetails = {
                type: "TLeadStatusType",
                fields: {
                    Id: statusId,
                    TypeName: statusName,
                    Description: statusDesc,
                    EQPM: statusEQPM,
                    Active: false
                }
            };
            contactService.saveLeadStatusData(objDetails).then(function(result) {
                sideBarService.getAllLeadStatus().then(function(dataReload) {
                    addVS1Data('TLeadStatusType', JSON.stringify(dataReload)).then(function(datareturn) {
                      sideBarService.getLeadStatusDataList(initialBaseDataLoad, 0, false).then(async function(dataLeadList) {
                          await addVS1Data('TLeadStatusTypeList', JSON.stringify(dataLeadList)).then(function(datareturn) {
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
    'click .btnActivateLeadStatus': function() {
        playSaveAudio();
        let contactService = new ContactService();
        setTimeout(function() {
            $('.fullScreenSpin').css('display', 'inline-block');
            let statusId = $('#statusID').val()||0;
            let statusName = $('#edtLeadStatusName').val() || '';
            let statusDesc = $('#statusDescription').val() || '';
            let statusEQPM = $('#statusQuantity').val() || '';
            statusEQPM = Number(statusEQPM.replace(/[^0-9.-]+/g, "")) || 1.0
            statusEQPM = statusEQPM.toString();
            let objDetails = {
                type: "TLeadStatusType",
                fields: {
                    Id: statusId,
                    TypeName: statusName,
                    Description: statusDesc,
                    EQPM: statusEQPM,
                    Active: true
                }
            };
            contactService.saveLeadStatusData(objDetails).then(function(result) {
                sideBarService.getAllLeadStatus().then(function(dataReload) {
                    addVS1Data('TLeadStatusType', JSON.stringify(dataReload)).then(function(datareturn) {
                      sideBarService.getLeadStatusDataList(initialBaseDataLoad, 0, false).then(async function(dataLeadList) {
                          await addVS1Data('TLeadStatusTypeList', JSON.stringify(dataLeadList)).then(function(datareturn) {
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
    'click .btnSaveLeadStatus': function() {
        playSaveAudio();
        setTimeout(function() {
            $('.fullScreenSpin').css('display', 'inline-block');
            let objDetails = {};
            let statusName = $('#edtLeadStatusName').val() || '';
            let statusDesc = $('#statusDescription').val() || '';
            let statusEQPM = $('#statusQuantity').val() || '';
            statusEQPM = Number(statusEQPM.replace(/[^0-9.-]+/g, "")) || 1.0
            statusEQPM = statusEQPM.toString();
            let id = $('#statusID').val() || '';
            if (statusName === '') {
                swal('Lead Status name cannot be blank!', '', 'warning');
                $('.fullScreenSpin').css('display', 'none');
                e.preventDefault();
            } else {
                if (id == "") {
                    objDetails = {
                        type: "TLeadStatusType",
                        fields: {
                            TypeName: statusName,
                            Description: statusDesc,
                            EQPM: statusEQPM,
                            Active: true
                        }
                    }
                } else {
                    objDetails = {
                        type: "TLeadStatusType",
                        fields: {
                            Id: id,
                            TypeName: statusName,
                            Description: statusDesc,
                            EQPM: statusEQPM,
                            Active: true
                        }
                    }
                }

                contactService.saveLeadStatusData(objDetails).then(function(result) {
                    sideBarService.getAllLeadStatus().then(function(dataReload) {
                        addVS1Data('TLeadStatusType', JSON.stringify(dataReload)).then(function(datareturn) {
                          sideBarService.getLeadStatusDataList(initialBaseDataLoad, 0, false).then(async function(dataLeadList) {
                              await addVS1Data('TLeadStatusTypeList', JSON.stringify(dataLeadList)).then(function(datareturn) {
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
            }
        }, delayTimeAfterSound);
    },
    'click .btnBack': function(event) {
        playCancelAudio();
        event.preventDefault();
        setTimeout(function() {
            history.back(1);
        }, delayTimeAfterSound);
    },
    // Import here
    'click .templateDownload': function() {
        let utilityService = new UtilityService();
        let rows = [];
        const filename = 'SampleLeadStatusSettings' + '.csv';
        rows[0] = ['Lead Status Name', 'Description', 'EQPM'];
        rows[1] = ['ABC', 'Description', '0.00'];
        utilityService.exportToCsv(rows, filename, 'csv');
    },
    'click .templateDownloadXLSX': function(e) {

        e.preventDefault(); //stop the browser from following
        window.location.href = 'sample_imports/SampleLeadStatusSettings.xlsx';
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
        let leadDescription = '';
        let leadEQPM = 0.00;
        Papa.parse(templateObject.selectedFile.get(), {
            complete: function(results) {

                if (results.data.length > 0) {
                    if ((results.data[0][0] == "Lead Status Name") && (results.data[0][1] == "Description") && (results.data[0][2] == "EQPM")) {

                        let dataLength = results.data.length * 500;
                        setTimeout(function() {
                            $('.importTemplateModal').hide();
                            $('.modal-backdrop').hide();
                            FlowRouter.go('/leadstatussettings?success=true');
                            $('.fullScreenSpin').css('display', 'none');
                        }, parseInt(dataLength));
                        for (let i = 0; i < results.data.length - 1; i++) {
                            leadDescription = results.data[i + 1][2] !== undefined ? results.data[i + 1][2] : '';
                            leadEQPM = results.data[i + 1][4] !== undefined ? results.data[i + 1][4] : '';
                            objDetails = {
                                type: "TLeadStatusType",
                                fields: {
                                    TypeCode: results.data[i + 1][0],
                                    Name: results.data[i + 1][1],
                                    Description: leadDescription || '',
                                    IsDefault: results.data[i + 1][3],
                                    EQPM: leadEQPM || 0.00,
                                    Active: true
                                }
                            };
                            if (results.data[i + 1][1]) {
                                if (results.data[i + 1][1] !== "") {
                                    contactService.contactService.saveLeadStatusData(objDetails).then(function(data) {
                                        //$('.fullScreenSpin').css('display','none');
                                        //  Meteor._reload.reload();
                                    }).catch(function(err) {
                                        //$('.fullScreenSpin').css('display','none');
                                        swal({ title: 'Oooops...', text: err, type: 'error', showCancelButton: false, confirmButtonText: 'Try Again' }).then((result) => {
                                            if (result.value) {
                                                // window.open('/clienttypesettings?success=true', '_self');
                                                FlowRouter.go('/leadstatussettings?success=true');
                                            } else if (result.dismiss === 'cancel') {
                                                FlowRouter.go('/leadstatussettings?success=false');
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

Template.leadstatussettings.helpers({
    datatablerecords: () => {
        return Template.instance().datatablerecords.get().sort(function(a, b) {
            if (a.typeName == 'NA') {
                return 1;
            } else if (b.typeName == 'NA') {
                return -1;
            }
            return (a.typeName.toUpperCase() > b.typeName.toUpperCase()) ? 1 : -1;
        });
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    salesCloudPreferenceRec: () => {
        return CloudPreference.findOne({
            userid: Session.get('mycloudLogonID'),
            PrefName: 'tblLeadStatusList'
        });
    },
    loggedCompany: () => {
        return localStorage.getItem('mySession') || '';
    }
});
