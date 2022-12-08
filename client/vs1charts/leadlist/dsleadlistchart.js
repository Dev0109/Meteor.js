import { ReactiveVar } from 'meteor/reactive-var';
import XLSX from 'xlsx';
import '../../lib/global/indexdbstorage.js';
import { ContactService } from "../../contacts/contact-service";
import { SideBarService } from "../../js/sidebar-service";
import { UtilityService } from "../../utility-service";

let sideBarService = new SideBarService();

Template.dsleadlistchart.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.selectedFile = new ReactiveVar();
});

Template.dsleadlistchart.onRendered(function() {
    let contactService = new ContactService();
    let templateObject = Template.instance();
    let splashArrayLeadList = [];
    const tableHeaderList = [];
    if (FlowRouter.current().queryParams.success) {
        $('.btnRefresh').addClass('btnRefreshAlert');
    }

    templateObject.getLeads = function() {
        // use API TProspectEx instead of TLeads
        getVS1Data('TProspectEx').then(function(dataObject) {
            if (dataObject.length === 0) {
                sideBarService.getAllLeads(initialBaseDataLoad, 0).then(function(data) {
                    addVS1Data('TProspectEx', JSON.stringify(data));
                    setAllLeads(data);
                }).catch(function(err) {
                    $('.fullScreenSpin').css('display', 'none');
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                setAllLeads(data);
            }
        }).catch(function(err) {
            sideBarService.getAllLeads(initialBaseDataLoad, 0).then(function(data) {
                addVS1Data('TProspectEx', JSON.stringify(data));
                setAllLeads(data);
            }).catch(function(err) {
                $('.fullScreenSpin').css('display', 'none');
            });
        });
    };

    function setAllLeads(data) {
        let lineItems = [];
        let lineItemObj = {};
        const dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        const dateTo = new Date($("#dateTo").datepicker("getDate"));
        for (let i = 0; i < data.tprospect.length; i++) {
            // const contactContacts = data.tprospect[i].fields.Contacts?data.tprospect[i].fields.Contacts[0]:null;
            // const city = contactContacts?contactContacts.fields.ContactCity:'';
            let mobile = contactService.changeMobileFormat(data.tprospect[i].fields.Mobile);
            let creationDate = new Date(data.tprospect[i].fields.CreationDate);
            const dataList = {
                id: data.tprospect[i].fields.ID || '',
                employeeName: data.tprospect[i].fields.ClientName || '',
                firstName: data.tprospect[i].fields.FirstName || '',
                lastName: data.tprospect[i].fields.LastName || '',
                phone: data.tprospect[i].fields.Phone || '',
                mobile: mobile || '',
                email: data.tprospect[i].fields.Email || '',
                department: data.tprospect[i].fields.CompanyName || '',
                address: data.tprospect[i].fields.Street || '',
                surburb: data.tprospect[i].fields.Suburb || '',
                // country: data.tprospect[i].fields.MarketingContacts.fields.Country || '',
                city: data.tprospect[i].fields.Street2 || '',
            };
            if (data.tprospect[i].fields.ClientName.replace(/\s/g, '') !== '' && dateFrom <= creationDate && dateTo >= creationDate) {
                splashArrayLeadList.push(dataList);
            }
        }
        templateObject.datatablerecords.set(splashArrayLeadList);
        if (templateObject.datatablerecords.get()) {
            Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblDSLeadChartList', function(error, result) {
                if (error) {

                } else {
                    if (result) {
                        for (let i = 0; i < result.customFields.length; i++) {
                            let customcolumn = result.customFields;
                            let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                            let hiddenColumn = customcolumn[i].hidden;
                            let columnClass = columHeaderUpdate.split('.')[1];
                            if (hiddenColumn === true) {
                                $("." + columnClass + "").addClass('hiddenColumn');
                                $("." + columnClass + "").removeClass('showColumn');
                            } else if (hiddenColumn === false) {
                                $("." + columnClass + "").removeClass('hiddenColumn');
                                $("." + columnClass + "").addClass('showColumn');
                            }
                        }
                    }
                }
            });
        }
        setTimeout(function() {
            $('#tblDSLeadChartList').DataTable({
                "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                buttons: [{
                        extend: 'csvHtml5',
                        text: '',
                        download: 'open',
                        className: "btntabletocsv hiddenColumn",
                        filename: "Lead List - " + moment().format(),
                        orientation: 'portrait',
                        exportOptions: {
                            columns: ':visible'
                        }
                    }, {
                        extend: 'print',
                        download: 'open',
                        className: "btntabletopdf hiddenColumn",
                        text: '',
                        title: 'Lead List',
                        filename: "Lead List - " + moment().format(),
                        exportOptions: {
                            columns: ':visible',
                            stripHtml: false
                        }
                    },
                    {
                        extend: 'excelHtml5',
                        title: '',
                        download: 'open',
                        className: "btntabletoexcel hiddenColumn",
                        filename: "Lead List - " + moment().format(),
                        orientation: 'portrait',
                        exportOptions: {
                            columns: ':visible'
                        }

                    }
                ],
                select: true,
                destroy: true,
                colReorder: true,
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
                    [1, "asc"]
                ],
                action: function() {
                    $('#tblDSLeadChartList').DataTable().ajax.reload();
                },
                language: { search: "", searchPlaceholder: "Search List..." },
                "fnInitComplete": function() {
                    $("<button class='btn btn-primary btnRefreshLeads' type='button' id='btnRefreshLeads' style='padding: 4px 10px; font-size: 16px; margin-left: 12px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblDSLeadChartList_filter");
                }

            }).on('page', function() {

                let draftRecord = templateObject.datatablerecords.get();
                templateObject.datatablerecords.set(draftRecord);
            }).on('column-reorder', function() {

            });
        }, 0);
        const columns = $('#tblDSLeadChartList th');
        let sWidth = "";
        let columVisible = false;
        $.each(columns, function(i, v) {
            if (v.hidden === false) {
                columVisible = true;
            }
            if ((v.className.includes("hiddenColumn"))) {
                columVisible = false;
            }
            sWidth = v.style.width.replace('px', "");
            let datatablerecordObj = {
                sTitle: v.innerText || '',
                sWidth: sWidth || '',
                sIndex: v.cellIndex || '',
                sVisible: columVisible || false,
                sClass: v.className || ''
            };
            tableHeaderList.push(datatablerecordObj);
        });
        templateObject.tableheaderrecords.set(tableHeaderList);
        $('div.dataTables_filter input').addClass('form-control form-control-sm');
        $('.fullScreenSpin').css('display', 'none');
    }
    setTimeout(() => {
        templateObject.getLeads();
    }, 500);
    $('#tblDSLeadChartList tbody').on('click', 'tr', function() {
        const listData = $(this).closest('tr').attr('id');
        if (listData) {
            $('.fullScreenSpin').css('display', 'inline-block');
            contactService.getOneLeadDataEx(listData).then(leadDetail => {
                if (leadDetail.fields.IsCustomer == true) {
                    $('.fullScreenSpin').css('display', 'none');
                    swal({ title: 'Notice', text: 'This lead has been converted to customer. Will open customer card', type: 'info', showCancelButton: false, confirmButtonText: 'OK' }).then((result) => {
                        FlowRouter.go('/customerscard?id=' + listData);
                        $('.fullScreenSpin').css('display', 'none');
                    });
                } else {
                    FlowRouter.go('/leadscard?id=' + listData);
                    $('.fullScreenSpin').css('display', 'none');
                }
            })
        }
    });
    tableResize();
});

Template.dsleadlistchart.events({
    'click #btnNewLead': function(event) {
        FlowRouter.go('/leadscard');
    },
    'keyup #tblDSLeadChartList_filter input': function(event) {
        if ($(event.target).val() !== '') {
            $(".btnRefreshLeads").addClass('btnSearchAlert');
        } else {
            $(".btnRefreshLeads").removeClass('btnSearchAlert');
        }
        if (event.keyCode === 13) {
            $(".btnRefreshLeads").trigger("click");
        }
    },
    'click .btnRefreshLeads': function(event) {
        let contactService = new ContactService();
        let templateObject = Template.instance();
        const dataTableList = [];
        $('.fullScreenSpin').css('display', 'inline-block');
        let dataSearchName = $('#tblDSLeadChartList_filter input').val();
        if (dataSearchName.replace(/\s/g, '') !== '') {
            sideBarService.getLeadByNameOrID(dataSearchName).then(function(data) {
                $(".btnRefreshLeads").removeClass('btnSearchAlert');
                if (data.tprospect.length > 0) {
                    for (let i = 0; i < data.tprospect.length; i++) {
                        // const contactContacts = data.tprospect[i].fields.Contacts?data.tprospect[i].fields.Contacts[0]:null;
                        // const city = contactContacts?contactContacts.fields.ContactCity:'';
                        let mobile = contactService.changeMobileFormat(data.tprospect[i].fields.Mobile)
                        const dataList = {
                            id: data.tprospect[i].fields.ID || '',
                            employeeName: data.tprospect[i].fields.ClientName || '',
                            firstName: data.tprospect[i].fields.FirstName || '',
                            lastName: data.tprospect[i].fields.LastName || '',
                            phone: data.tprospect[i].fields.Phone || '',
                            mobile: mobile || '',
                            email: data.tprospect[i].fields.Email || '',
                            department: data.tprospect[i].fields.CompanyName || '',
                            address: data.tprospect[i].fields.Street || '',
                            surburb: data.tprospect[i].fields.Suburb || '',
                            // country: data.tprospect[i].fields.MarketingContacts.fields.Country || '',
                            city: data.tprospect[i].fields.Street2 || '',
                        };
                        if (data.tprospect[i].fields.ClientName.replace(/\s/g, '') !== '') {
                            dataTableList.push(dataList);
                        }
                    }
                    templateObject.datatablerecords.set(dataTableList);
                    let item = templateObject.datatablerecords.get();
                    $('.fullScreenSpin').css('display', 'none');
                    if (dataTableList) {
                        const datatable = $('#tblDSLeadChartList').DataTable();
                        $("#tblDSLeadChartList > tbody").empty();
                        for (let x = 0; x < item.length; x++) {
                            $("#tblDSLeadChartList > tbody").append(
                                ' <tr class="dnd-moved" id="' + item[x].id + '" style="cursor: pointer;">' +
                                '<td contenteditable="false" class="colLeadId hiddenColumn">' + item[x].id + '</td>' +
                                '<td contenteditable="false" class="colLeadName" >' + item[x].employeeName + '</td>' +
                                '<td contenteditable="false" class="colFirstName" >' + item[x].firstName + '</td>' +
                                '<td contenteditable="false" class="colLastName">' + item[x].lastName + '</td>' +
                                '<td contenteditable="false" class="colPhone">' + item[x].phone + '</td>' +
                                '<td contenteditable="false" class="colMobile">' + item[x].mobile + '</td>' +
                                '<td contenteditable="false" class="colEmail">' + item[x].email + '</td>' +
                                '<td contenteditable="false" class="colDepartment">' + item[x].department + '</td>' +
                                '<td contenteditable="false" class="colAddress">' + item[x].address + '</td>' +
                                '<td contenteditable="false" class="colSuburb">' + item[x].surburb + '</td>' +
                                '<td contenteditable="false" class="colCity">' + item[x].city + '</td>' +
                                '</tr>');
                        }
                        $('.dataTables_info').html('Showing 1 to ' + data.tprospect.length + ' of ' + data.tprospect.length + ' entries');

                    }
                } else {
                    $('.fullScreenSpin').css('display', 'none');
                    swal({
                        title: 'Question',
                        text: "Leads does not exist, would you like to create it?",
                        type: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Yes',
                        cancelButtonText: 'No'
                    }).then((result) => {
                        if (result.value) {
                            FlowRouter.go('/leadscard');
                        } else if (result.dismiss === 'cancel') {
                            //$('#productListModal').modal('toggle');
                        }
                    });
                }
            }).catch(function(err) {
                $('.fullScreenSpin').css('display', 'none');
            });
        } else {
            $(".btnRefresh").trigger("click");
        }
    },
    'click .resetTable': function(event) {
        let checkPrefDetails = getCheckPrefDetails();
        if (checkPrefDetails) {
            CloudPreference.remove({ _id: checkPrefDetails._id }, function(err, idTag) {
                if (err) {

                } else {
                    Meteor._reload.reload();
                }
            });
        }
    },
    'click .saveTable': function(event) {
        let lineItems = [];
        $('.columnSettings').each(function(index) {
            const $tblrow = $(this);
            const colTitle = $tblrow.find(".divcolumn").text() || '';
            const colWidth = $tblrow.find(".custom-range").val() || 0;
            const colthClass = $tblrow.find(".divcolumn").attr("valueupdate") || '';
            const colHidden = !$tblrow.find(".custom-control-input").is(':checked');
            let lineItemObj = {
                index: index,
                label: colTitle,
                hidden: colHidden,
                width: colWidth,
                thclass: colthClass
            };
            lineItems.push(lineItemObj);
        });
        let checkPrefDetails = getCheckPrefDetails();
        if (checkPrefDetails) {
            CloudPreference.update({ _id: checkPrefDetails._id }, {
                $set: {
                    userid: clientID,
                    username: clientUsername,
                    useremail: clientEmail,
                    PrefGroup: 'salesform',
                    PrefName: 'tblDSLeadChartList',
                    published: true,
                    customFields: lineItems,
                    updatedAt: new Date()
                }
            }, function(err, idTag) {
                if (err) {
                    $('#myLeadChartModal').modal('toggle');
                } else {
                    $('#myLeadChartModal').modal('toggle');
                }
            });
        } else {
            CloudPreference.insert({
                userid: clientID,
                username: clientUsername,
                useremail: clientEmail,
                PrefGroup: 'salesform',
                PrefName: 'tblEmployeelist',
                published: true,
                customFields: lineItems,
                createdAt: new Date()
            }, function(err, idTag) {
                if (err) {
                    $('#myLeadChartModal').modal('toggle');
                } else {
                    $('#myLeadChartModal').modal('toggle');
                }
            });
        }
        $('#myLeadChartModal').modal('toggle');
    },
    'blur .divcolumn': function(event) {
        let columData = $(event.target).text();
        let columnDatanIndex = $(event.target).closest("div.columnSettings").attr('id');
        const datable = $('#tblDSLeadChartList').DataTable();
        const title = datable.column(columnDatanIndex).header();
        $(title).html(columData);
    },
    'change .rngRange': function(event) {
        let range = $(event.target).val();
        $(event.target).closest("div.divColWidth").find(".spWidth").html(range + 'px');
        let columData = $(event.target).closest("div.divColWidth").find(".spWidth").attr("value");
        let columnDataValue = $(event.target).closest("div").prev().find(".divcolumn").text();
        const datable = $('#tblDSLeadChartList th');
        $.each(datable, function(i, v) {
            if (v.innerText === columnDataValue) {
                let className = v.className;
                let replaceClass = className.replace(/ /g, ".");
                $("." + replaceClass + "").css('width', range + 'px');

            }
        });
    },
    'click .btnOpenSettings': function(event) {
        let templateObject = Template.instance();
        const columns = $('#tblDSLeadChartList th');
        const tableHeaderList = [];
        let sTible = "";
        let sWidth = "";
        let sIndex = "";
        let sVisible = "";
        let columVisible = false;
        let sClass = "";
        $.each(columns, function(i, v) {
            if (v.hidden === false) {
                columVisible = true;
            }
            if ((v.className.includes("hiddenColumn"))) {
                columVisible = false;
            }
            sWidth = v.style.width.replace('px', "");
            let datatablerecordObj = {
                sTitle: v.innerText || '',
                sWidth: sWidth || '',
                sIndex: v.cellIndex || '',
                sVisible: columVisible || false,
                sClass: v.className || ''
            };
            tableHeaderList.push(datatablerecordObj);
        });
        templateObject.tableheaderrecords.set(tableHeaderList);
    },
    'click .exportbtn': function() {
        $('.fullScreenSpin').css('display', 'inline-block');
        jQuery('#tblDSLeadChartList_wrapper .dt-buttons .btntabletocsv').click();
        $('.fullScreenSpin').css('display', 'none');
    },
    'click .exportbtnExcel': function() {
        $('.fullScreenSpin').css('display', 'inline-block');
        jQuery('#tblDSLeadChartList_wrapper .dt-buttons .btntabletoexcel').click();
        $('.fullScreenSpin').css('display', 'none');
    },
    'click .btnRefresh': function() {
        $('.fullScreenSpin').css('display', 'inline-block');
        sideBarService.getAllLeads(initialBaseDataLoad, 0).then(function(data) {
            addVS1Data('TProspectEx', JSON.stringify(data)).then(function(datareturn) {
                setTimeout(function() {
                    window.open('/leadlist', '_self');
                }, 2000);
            }).catch(function(err) {
                setTimeout(function() {
                    window.open('/leadlist', '_self');
                }, 2000);
            });
        }).catch(function(err) {
            setTimeout(function() {
                window.open('/leadlist', '_self');
            }, 2000);
        });
    },
    'click .printConfirm': function(event) {
        playPrintAudio();
        setTimeout(function() {
            $('.fullScreenSpin').css('display', 'inline-block');
            jQuery('#tblDSLeadChartList_wrapper .dt-buttons .btntabletopdf').click();
            $('.fullScreenSpin').css('display', 'none');
        }, delayTimeAfterSound);
    },
    'click .templateDownload': function() {
        let utilityService = new UtilityService();
        let rows = [];
        const filename = 'SampleLeads' + '.csv';
        rows[0] = ['Employee Name', 'First Name', 'Last Name', 'Phone', 'Mobile', 'Email', 'Department', 'Address', 'Suburb', 'City'];
        rows[1] = ['John Smith', 'John', 'Smith', '9995551213', '9995551213', 'johnsmith@email.com', 'johnsmith', '123 Main Street', 'Brooklyn', 'New York'];
        utilityService.exportToCsv(rows, filename, 'csv');
    },
    'click .templateDownloadXLSX': function(e) {
        e.preventDefault(); //stop the browser from following
        window.location.href = 'sample_imports/SampleLead.xlsx';
    },
    'click .btnUploadFile': function(event) {
        $('#attachment-upload').val('');
        $('.file-name').text('');
        //$(".btnImport").removeAttr("disabled");
        $('#attachment-upload').trigger('click');
    },
    'change #attachment-upload': function(e) {
        let templateObj = Template.instance();
        const filename = $('#attachment-upload')[0].files[0]['name'];
        const fileExtension = filename.split('.').pop().toLowerCase();
        const validExtensions = ["csv", "txt", "xlsx"];
        const validCSVExtensions = ["csv", "txt"];
        const validExcelExtensions = ["xlsx", "xls"];

        if (validExtensions.indexOf(fileExtension) === -1) {
            swal('Invalid Format', 'formats allowed are :' + validExtensions.join(', '), 'error');
            $('.file-name').text('');
            $(".btnImport").Attr("disabled");
        } else if (validCSVExtensions.indexOf(fileExtension) !== -1) {
            $('.file-name').text(filename);
            let selectedFile = event.target.files[0];
            templateObj.selectedFile.set(selectedFile);
            if ($('.file-name').text() !== "") {
                $(".btnImport").removeAttr("disabled");
            } else {
                $(".btnImport").Attr("disabled");
            }
        } else if (fileExtension === 'xlsx') {
            $('.file-name').text(filename);
            let selectedFile = event.target.files[0];
            let oFileIn;
            const oFile = selectedFile;
            const sFilename = oFile.name;
            // Create A File Reader HTML5
            const reader = new FileReader();

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

            if ($('.file-name').text() !== "") {
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
        Papa.parse(templateObject.selectedFile.get(), {
            complete: function(results) {
                if (results.data.length > 0) {
                    if ((results.data[0][0] === "Employee Name") &&
                        (results.data[0][1] === "First Name") && (results.data[0][2] === "Last Name") &&
                        (results.data[0][3] === "Phone") && (results.data[0][4] === "Mobile") &&
                        (results.data[0][5] === "Email") && (results.data[0][6] === "Department") &&
                        (results.data[0][7] === "Address") && (results.data[0][8] === "Suburb") &&
                        (results.data[0][9] === "City")) {

                        let dataLength = results.data.length * 500;
                        setTimeout(function() {
                            // $('#importModal').modal('toggle');
                            //Meteor._reload.reload();
                            window.open('/leadlist?success=true', '_self');
                        }, parseInt(dataLength));

                        for (let i = 0; i < results.data.length - 1; i++) {
                            objDetails = {
                                type: "TProspect",
                                fields: {
                                    EmployeeName: results.data[i + 1][0],
                                    FirstName: results.data[i + 1][1],
                                    LastName: results.data[i + 1][2],
                                    Phone: results.data[i + 1][3],
                                    Mobile: results.data[i + 1][4],
                                    Email: results.data[i + 1][5],
                                    Department: results.data[i + 1][6],
                                    Address: results.data[i + 1][7],
                                    Suburb: results.data[i + 1][8],
                                    City: results.data[i + 1][9]
                                }
                            };
                            if (results.data[i + 1][1]) {
                                if (results.data[i + 1][1] !== "") {
                                    contactService.saveProspect(objDetails).then(function(data) {
                                        ///$('.fullScreenSpin').css('display','none');
                                        //Meteor._reload.reload();
                                    }).catch(function(err) {
                                        //$('.fullScreenSpin').css('display','none');
                                        swal({ title: 'Oooops...', text: err, type: 'error', showCancelButton: false, confirmButtonText: 'Try Again' }).then((result) => { if (result.value) { Meteor._reload.reload(); } else if (result.dismiss === 'cancel') {} });
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

Template.dsleadlistchart.helpers({
    datatablerecords: () => {
        return Template.instance().datatablerecords.get().sort(function(a, b) {
            if (a.employeeName === 'NA') {
                return 1;
            } else if (b.employeeName === 'NA') {
                return -1;
            }
            return (a.employeeName.toUpperCase() > b.employeeName.toUpperCase()) ? 1 : -1;
        });
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    salesCloudPreferenceRec: () => {
        return CloudPreference.findOne({ userid: Session.get('mycloudLogonID'), PrefName: 'tblDSLeadChartList' });
    },
    loggedCompany: () => {
        return localStorage.getItem('mySession') || '';
    }
});

function getCheckPrefDetails() {
    const getcurrentCloudDetails = CloudUser.findOne({
        _id: Session.get('mycloudLogonID'),
        clouddatabaseID: Session.get('mycloudLogonDBID')
    });
    let checkPrefDetails = null;
    if (getcurrentCloudDetails) {
        if (getcurrentCloudDetails._id.length > 0) {
            const clientID = getcurrentCloudDetails._id;
            const clientUsername = getcurrentCloudDetails.cloudUsername;
            const clientEmail = getcurrentCloudDetails.cloudEmail;
            checkPrefDetails = CloudPreference.findOne({ userid: clientID, PrefName: 'tblDSLeadChartList' });
        }
    }
    return checkPrefDetails;
}
