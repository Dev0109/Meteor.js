import { ContactService } from "../contacts/contact-service";
import { ReactiveVar } from "meteor/reactive-var";
import { CoreService } from "../js/core-service";
import { AccountService } from "../accounts/account-service";
import { UtilityService } from "../utility-service";
import { SalesBoardService } from "../js/sales-service";
import { SideBarService } from "../js/sidebar-service";
import "../lib/global/indexdbstorage.js";
import XLSX from 'xlsx';
let sideBarService = new SideBarService();
let utilityService = new UtilityService();
// Template.contactoverview.inheritsHelpersFrom('non_transactional_list');
// Template.contactoverview.inheritsEventsFrom('alltaskdatatable');
Template.contactoverview.inheritsHooksFrom('non_transactional_list');

Template.contactoverview.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    //templateObject.topTenData = new ReactiveVar([]);
    //templateObject.loggeduserdata = new ReactiveVar([]);
    templateObject.displayfields = new ReactiveVar([]);
    templateObject.reset_data = new ReactiveVar([]);
    templateObject.setupFinished = new ReactiveVar();
});

Template.contactoverview.onRendered(function() {
    $("#tblcontactoverview tbody").on("click", "tr", function() {
        var listData = $(this).closest("tr").attr("id");
        var transactiontype = $(event.target).closest("tr").find(".colType").text() || '';
        if (listData && transactiontype) {
            if (transactiontype === "Customer / Employee / Supplier") {
                FlowRouter.go("/customerscard?id=" + listData);
            } else if (transactiontype === "Customer / Supplier") {
                FlowRouter.go("/customerscard?id=" + listData);
            } else if (transactiontype === "Customer") {
                FlowRouter.go("/customerscard?id=" + listData);
            } else if (transactiontype === "Supplier") {
                FlowRouter.go("/supplierscard?id=" + listData);
            } else if (transactiontype === "Employee") {
                FlowRouter.go("/employeescard?id=" + listData);
            } else if (transactiontype === "Lead") {
                FlowRouter.go("/leadscard?id=" + listData);
            } else if (transactiontype === "Job") {
                FlowRouter.go("/customerscard?jobid=" + listData);
            } else {
                FlowRouter.go("/customerscard?id=" + listData);
            }
        }
    });
    //tableResize();
});

Template.contactoverview.events({
    "click .btnRefresh": function() {
        $(".fullScreenSpin").css("display", "inline-block");
        let templateObject = Template.instance();
        sideBarService.getAllContactCombineVS1(initialDataLoad, 0).then(function(data) {
            addVS1Data("TERPCombinedContactsVS1", JSON.stringify(data)).then(function(datareturn) {
                sideBarService.getCurrentLoggedUser().then(function(dataUsers) {
                    addVS1Data('TAppUser', JSON.stringify(dataUsers)).then(function(datareturn) {
                        window.open("/contactoverview", "_self");
                    }).catch(function(err) {
                        window.open("/contactoverview", "_self");
                    });
                });
            }).catch(function(err) {
                window.open("/contactoverview", "_self");
            });
        }).catch(function(err) {
            sideBarService.getCurrentLoggedUser().then(function(dataUsers) {
                addVS1Data('TAppUser', JSON.stringify(dataUsers)).then(function(datareturn) {
                    window.open("/contactoverview", "_self");
                }).catch(function(err) {
                    window.open("/contactoverview", "_self");
                });
            });
        });
    },
    "click .allList": function(event) {
        let templateObject = Template.instance();
        $(".fullScreenSpin").css("display", "inline-block");
        sideBarService
            .getAllContactCombineVS1(initialDataLoad, 0)
            .then(function(data) {
                addVS1Data("TERPCombinedContactsVS1", JSON.stringify(data))
                    .then(function(datareturn) {
                        window.open("/contactoverview?ignoredate=true", "_self");
                    })
                    .catch(function(err) {
                        location.reload();
                    });
            })
            .catch(function(err) {
                $(".fullScreenSpin").css("display", "none");
                // Meteor._reload.reload();
            });
    },
    "keyup #tblcontactoverview_filter input": function(event) {
        if ($(event.target).val() != "") {
            $(".btnRefreshContactOverview").addClass("btnSearchAlert");
        } else {
            $(".btnRefreshContactOverview").removeClass("btnSearchAlert");
        }
        if (event.keyCode == 13) {
            $(".btnRefreshContactOverview").trigger("click");
        }
    },
    "click .btnRefreshContactOverview": function(event) {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        const contactList = [];
        const clientList = [];
        let salesOrderTable;
        var splashArray = new Array();
        var splashArrayContactOverviewSearch = new Array();
        var splashArrayContactOverview = new Array();
        const dataTableList = [];
        const tableHeaderList = [];
        let dataSearchName = $('#tblcontactoverview_filter input').val() || '';
        if (dataSearchName.replace(/\s/g, '') != '') {
            sideBarService.getAllContactOverviewVS1ByName(dataSearchName.toLowerCase()).then(function(data) {
                let lineItems = [];
                let lineItemObj = {};
                let clienttype = '';
                let isprospect = false;
                let iscustomer = false;
                let isEmployee = false;
                let issupplier = false;
                $(".btnRefreshContactOverview").removeClass('btnSearchAlert');
                if (data.terpcombinedcontactsvs1.length > 0) {
                    $("#tblcontactoverview > tbody").empty();

                    for (let i = 0; i < data.terpcombinedcontactsvs1.length; i++) {

                        isprospect = data.terpcombinedcontactsvs1[i].isprospect;
                        iscustomer = data.terpcombinedcontactsvs1[i].iscustomer;
                        isEmployee = data.terpcombinedcontactsvs1[i].isEmployee;
                        issupplier = data.terpcombinedcontactsvs1[i].issupplier;

                        if ((isprospect == true) && (iscustomer == true) && (isEmployee == true) && (issupplier == true)) {
                            clienttype = "Customer / Employee / Supplier";
                        } else if ((isprospect == true) && (iscustomer == true) && (issupplier == true)) {
                            clienttype = "Customer / Supplier";
                        } else if ((iscustomer == true) && (issupplier == true)) {
                            clienttype = "Customer / Supplier";
                        } else if ((iscustomer == true)) {

                            if (data.terpcombinedcontactsvs1[i].name.toLowerCase().indexOf("^") >= 0) {
                                clienttype = "Job";
                            } else {
                                clienttype = "Customer";
                            }
                            // clienttype = "Customer";
                        } else if ((isEmployee == true)) {
                            clienttype = "Employee";
                        } else if ((issupplier == true)) {
                            clienttype = "Supplier";
                        } else if ((isprospect == true)) {
                            clienttype = "Lead";
                        } else {
                            clienttype = " ";
                        }

                        let arBalance = utilityService.modifynegativeCurrencyFormat(data.terpcombinedcontactsvs1[i].ARBalance) || 0.00;
                        let creditBalance = utilityService.modifynegativeCurrencyFormat(data.terpcombinedcontactsvs1[i].CreditBalance) || 0.00;
                        let balance = utilityService.modifynegativeCurrencyFormat(data.terpcombinedcontactsvs1[i].Balance) || 0.00;
                        let creditLimit = utilityService.modifynegativeCurrencyFormat(data.terpcombinedcontactsvs1[i].CreditLimit) || 0.00;
                        let salesOrderBalance = utilityService.modifynegativeCurrencyFormat(data.terpcombinedcontactsvs1[i].SalesOrderBalance) || 0.00;
                        if (isNaN(data.terpcombinedcontactsvs1[i].ARBalance)) {
                            arBalance = Currency + "0.00";
                        }

                        if (isNaN(data.terpcombinedcontactsvs1[i].CreditBalance)) {
                            creditBalance = Currency + "0.00";
                        }
                        if (isNaN(data.terpcombinedcontactsvs1[i].Balance)) {
                            balance = Currency + "0.00";
                        }
                        if (isNaN(data.terpcombinedcontactsvs1[i].CreditLimit)) {
                            creditLimit = Currency + "0.00";
                        }

                        if (isNaN(data.terpcombinedcontactsvs1[i].SalesOrderBalance)) {
                            salesOrderBalance = Currency + "0.00";
                        }


                        var dataList = [
                            data.terpcombinedcontactsvs1[i].ID || "",
                            data.terpcombinedcontactsvs1[i].name || "",
                            clienttype || "",
                            data.terpcombinedcontactsvs1[i].phone || "",
                            data.terpcombinedcontactsvs1[i].mobile || "",
                            arBalance || 0.0,
                            creditBalance || 0.0,
                            balance || 0.0,
                            creditLimit || 0.0,
                            salesOrderBalance || 0.0,
                            data.terpcombinedcontactsvs1[i].email || "",
                            data.terpcombinedcontactsvs1[i].CUSTFLD1 || "",
                            data.terpcombinedcontactsvs1[i].CUSTFLD2 || "",
                            data.terpcombinedcontactsvs1[i].street || "",
                            data.terpcombinedcontactsvs1[i].suburb || "",
                            data.terpcombinedcontactsvs1[i].state || "",
                            data.terpcombinedcontactsvs1[i].postcode || "",
                            "",
                        ];



                        if (data.terpcombinedcontactsvs1[i].name.replace(/\s/g, "") !== "") {
                            splashArrayContactOverviewSearch.push(dataList);
                        }
                    }
                    var datatable = $('#tblcontactoverview').DataTable();
                    datatable.clear();
                    datatable.rows.add(splashArrayContactOverviewSearch);
                    datatable.draw(false);
                    $('#tblcontactoverview_wrapper .dataTables_info').html('Showing 1 to ' + data.terpcombinedcontactsvs1.length + ' of ' + data.terpcombinedcontactsvs1.length + ' entries');
                    let reset_data = templateObject.reset_data.get();
                    let customFieldCount = reset_data.length;

                    for (let r = 0; r < customFieldCount; r++) {
                        if (reset_data[r].active == true) {
                            $('#tblcontactoverview_wrapper .' + reset_data[r].class).removeClass('hiddenColumn');
                        } else if (reset_data[r].active == false) {
                            $('#tblcontactoverview_wrapper .' + reset_data[r].class).addClass('hiddenColumn');
                        };
                    };
                    $('.fullScreenSpin').css('display', 'none');
                } else {

                    $('.fullScreenSpin').css('display', 'none');
                    $('#contactListModal').modal('toggle');
                    swal({
                        title: 'Question',
                        text: "Contact does not exist, would you like to create it?",
                        type: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Yes',
                        cancelButtonText: 'No'
                    }).then((result) => {
                        if (result.value) {

                        } else if (result.dismiss === 'cancel') {
                            $('#contactListModal').modal('toggle');
                        }
                    });

                }

            }).catch(function(err) {
                $('.fullScreenSpin').css('display', 'none');
            });
        } else {
            $('.fullScreenSpin').css('display', 'none');
            getVS1Data("TERPCombinedContactsVS1").then(function(dataObjectold) {
                if (dataObjectold.length == 0) {} else {
                    let dataOld = JSON.parse(dataObjectold[0].data);
                    let dataNew = templateObject.transactiondatatablerecords.get() || '';

                    var datatable = $('#tblcontactoverview').DataTable();
                    datatable.clear();
                    datatable.rows.add(dataNew);
                    datatable.draw(false);
                    if (dataNew.length < 25) {
                        $('#tblcontactoverview_wrapper .dataTables_info').html('Showing 1 to ' + dataNew.length + ' of ' + dataOld.Params.Count + ' entries');
                    } else {
                        $('#tblcontactoverview_wrapper .dataTables_info').html('Showing 1 to ' + '25' + ' of ' + dataOld.Params.Count + ' entries');
                    }

                    let reset_data = templateObject.reset_data.get();
                    let customFieldCount = reset_data.length;

                    for (let r = 0; r < customFieldCount; r++) {
                        if (reset_data[r].active == true) {
                            $('#tblcontactoverview_wrapper .' + reset_data[r].class).removeClass('hiddenColumn');
                        } else if (reset_data[r].active == false) {
                            $('#tblcontactoverview_wrapper .' + reset_data[r].class).addClass('hiddenColumn');
                        };
                    };


                }
            }).catch(function(err) {

            });
        }
    },
    "click #exportbtn": function() {
        $(".fullScreenSpin").css("display", "inline-block");
        jQuery("#tblcontactoverview_wrapper .dt-buttons .btntabletocsv").click();
        $(".fullScreenSpin").css("display", "none");
    },
    "click .printConfirm": function(event) {
        $(".fullScreenSpin").css("display", "inline-block");
        jQuery("#tblcontactoverview_wrapper .dt-buttons .btntabletopdf").click();
        $(".fullScreenSpin").css("display", "none");
    },
    'click .templateDownload': function() {
        let utilityService = new UtilityService();
        let rows = [];
        const filename = 'SampleContactOverview' + '.csv';
        rows[0] = ['Company', 'Type', 'First Name', 'Last Name', 'Phone', 'Mobile', 'Email', 'Skype', 'Street', 'City/Suburb', 'State', 'Post Code', 'Country', 'Gender'];
        rows[1] = ['ABC', 'Customer', 'John', 'Smith', '9995551213', '9995551213', 'johnsmith@email.com', 'johnsmith', '123 Main Street', 'Brooklyn', 'New York', '1234', 'United States', 'M'];
        rows[2] = ['ABC', 'Employee', 'John', 'Smith', '9995551213', '9995551213', 'johnsmith@email.com', 'johnsmith', '123 Main Street', 'Brooklyn', 'New York', '1234', 'United States', 'M'];
        rows[3] = ['ABC', 'Lead', 'John', 'Smith', '9995551213', '9995551213', 'johnsmith@email.com', 'johnsmith', '123 Main Street', 'Brooklyn', 'New York', '1234', 'United States', 'M'];
        rows[4] = ['ABC', 'Supplier', 'John', 'Smith', '9995551213', '9995551213', 'johnsmith@email.com', 'johnsmith', '123 Main Street', 'Brooklyn', 'New York', '1234', 'United States', 'M'];
        utilityService.exportToCsv(rows, filename, 'csv');
    },
    'click .templateDownloadXLSX': function(e) {
        e.preventDefault(); //stop the browser from following
        window.location.href = 'sample_imports/SampleContactOverview.xlsx';
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
                var workbook = XLSX.read(data, {
                    type: 'array'
                });

                var result = {};
                workbook.SheetNames.forEach(function(sheetName) {
                    var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
                        header: 1
                    });
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
        let firstName = '';
        let lastName = '';
        let taxCode = '';
        let type = '';
        var saledateTime = new Date();
        //let empStartDate = new Date().format("YYYY-MM-DD");
        var empStartDate = moment(saledateTime).format("YYYY-MM-DD");
        Papa.parse(templateObject.selectedFile.get(), {
            complete: function(results) {

                if (results.data.length > 0) {
                    if ((results.data[0][0] == "Company") && (results.data[0][1] == "Type") && (results.data[0][2] == "First Name") && (results.data[0][3] == "Last Name") && (results.data[0][4] == "Phone") && (results.data[0][5] == "Mobile") && (results.data[0][6] == "Email") && (results.data[0][7] == "Skype") && (results.data[0][8] == "Street") && ((results.data[0][9] == "Street2") || (results.data[0][9] == "City/Suburb")) && (results.data[0][10] == "State") && (results.data[0][11] == "Post Code") && (results.data[0][12] == "Country") && (results.data[0][13] == "Gender")) {

                        let dataLength = results.data.length * 500;
                        setTimeout(function() {
                            // $('#importModal').modal('toggle');
                            //Meteor._reload.reload();
                            window.open('/contactoverview?success=true', '_self');
                        }, parseInt(dataLength));

                        for (let i = 0; i < results.data.length - 1; i++) {
                            type = results.data[i + 1][1] || '';
                            if (type == "Customer") { //Customers List
                                firstName = results.data[i + 1][2] !== undefined ? results.data[i + 1][2] : '';
                                lastName = results.data[i + 1][3] !== undefined ? results.data[i + 1][3] : '';
                                objDetails = {
                                    type: "TCustomer",
                                    fields: {
                                        ClientName: results.data[i + 1][0],
                                        FirstName: firstName || '',
                                        LastName: lastName || '',
                                        Phone: results.data[i + 1][4],
                                        Mobile: results.data[i + 1][5],
                                        Email: results.data[i + 1][6],
                                        SkypeName: results.data[i + 1][7],
                                        Street: results.data[i + 1][8],
                                        Street2: results.data[i + 1][9],
                                        Suburb: results.data[i + 1][9] || '',
                                        State: results.data[i + 1][10],
                                        PostCode: results.data[i + 1][11],
                                        Country: results.data[i + 1][12],

                                        BillStreet: results.data[i + 1][8],
                                        BillStreet2: results.data[i + 1][9],
                                        BillState: results.data[i + 1][10],
                                        BillPostCode: results.data[i + 1][11],
                                        Billcountry: results.data[i + 1][12],

                                        PublishOnVS1: true
                                    }
                                };
                                if (results.data[i + 1][1]) {
                                    if (results.data[i + 1][1] !== "") {
                                        contactService.saveCustomer(objDetails).then(function(data) {
                                            ///$('.fullScreenSpin').css('display','none');
                                            //Meteor._reload.reload();
                                        }).catch(function(err) {
                                            //$('.fullScreenSpin').css('display','none');
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
                                        });
                                    }
                                }
                            } else if (type == "Employee") { //Employees List
                                firstName = results.data[i + 1][2].trim() !== undefined ? results.data[i + 1][2] : '';
                                lastName = results.data[i + 1][3].trim() !== undefined ? results.data[i + 1][3] : '';
                                objDetails = {
                                    type: "TEmployee",
                                    fields: {
                                        FirstName: firstName,
                                        LastName: lastName,
                                        Phone: results.data[i + 1][4],
                                        Mobile: results.data[i + 1][5],
                                        DateStarted: empStartDate,
                                        DOB: empStartDate,
                                        Email: results.data[i + 1][6],
                                        SkypeName: results.data[i + 1][7],
                                        Street: results.data[i + 1][8],
                                        Street2: results.data[i + 1][9],
                                        Suburb: results.data[i + 1][9],
                                        State: results.data[i + 1][10],
                                        PostCode: results.data[i + 1][11],
                                        Country: results.data[i + 1][12],
                                        Sex: results.data[i + 1][13] || "F",
                                        Active: true
                                    }
                                };
                                if (results.data[i + 1][1]) {
                                    if (results.data[i + 1][1] !== "") {
                                        contactService.saveEmployee(objDetails).then(function(data) {
                                            ///$('.fullScreenSpin').css('display','none');
                                            //Meteor._reload.reload();
                                        }).catch(function(err) {
                                            //$('.fullScreenSpin').css('display','none');
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
                                        });
                                    }
                                }
                            } else if (type == "Lead") { //leads List
                                firstName = results.data[i + 1][2] !== undefined ? results.data[i + 1][2] : '';
                                lastName = results.data[i + 1][3] !== undefined ? results.data[i + 1][3] : '';
                                objDetails = {
                                    type: "TProspectList",
                                    fields: {
                                        ClientName: results.data[i + 1][0],
                                        FirstName: firstName || '',
                                        LastName: lastName || '',
                                        Phone: results.data[i + 1][4],
                                        Mobile: results.data[i + 1][5],
                                        Email: results.data[i + 1][6],
                                        SkypeName: results.data[i + 1][7],
                                        Street: results.data[i + 1][8],
                                        Street2: results.data[i + 1][9],
                                        Suburb: results.data[i + 1][9] || '',
                                        State: results.data[i + 1][10],
                                        PostCode: results.data[i + 1][11],
                                        Country: results.data[i + 1][12],

                                        BillStreet: results.data[i + 1][8],
                                        BillStreet2: results.data[i + 1][9],
                                        BillState: results.data[i + 1][10],
                                        BillPostCode: results.data[i + 1][11],
                                        Billcountry: results.data[i + 1][12],

                                        Active: true
                                    }
                                };
                                if (results.data[i + 1][1]) {
                                    if (results.data[i + 1][1] !== "") {
                                        contactService.saveProspect(objDetails).then(function(data) {
                                            ///$('.fullScreenSpin').css('display','none');
                                            //Meteor._reload.reload();
                                        }).catch(function(err) {
                                            //$('.fullScreenSpin').css('display','none');
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
                                        });
                                    }
                                }
                            } else if (type == "Supplier") { //Suppliers List
                                firstName = results.data[i + 1][2] !== undefined ? results.data[i + 1][2] : '';
                                lastName = results.data[i + 1][3] !== undefined ? results.data[i + 1][3] : '';
                                objDetails = {
                                    type: "TSupplier",
                                    fields: {
                                        ClientName: results.data[i + 1][0],
                                        FirstName: firstName || '',
                                        LastName: lastName || '',
                                        Phone: results.data[i + 1][4],
                                        Mobile: results.data[i + 1][5],
                                        Email: results.data[i + 1][6],
                                        SkypeName: results.data[i + 1][7],
                                        Street: results.data[i + 1][8],
                                        Street2: results.data[i + 1][9],
                                        Suburb: results.data[i + 1][9] || '',
                                        State: results.data[i + 1][10],
                                        PostCode: results.data[i + 1][11],
                                        Country: results.data[i + 1][12],

                                        BillStreet: results.data[i + 1][8],
                                        BillStreet2: results.data[i + 1][9],
                                        BillState: results.data[i + 1][10],
                                        BillPostCode: results.data[i + 1][11],
                                        Billcountry: results.data[i + 1][12],

                                        Active: true
                                    }
                                };
                                if (results.data[i + 1][1]) {
                                    if (results.data[i + 1][1] !== "") {
                                        contactService.saveSupplier(objDetails).then(function(data) {
                                            ///$('.fullScreenSpin').css('display','none');
                                            //Meteor._reload.reload();
                                        }).catch(function(err) {
                                            //$('.fullScreenSpin').css('display','none');
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
                                        });
                                    }
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

Template.contactoverview.helpers({
    datatablerecords: () => {
        return Template.instance()
            .datatablerecords.get()
            .sort(function(a, b) {
                if (a.clientname == "NA") {
                    return 1;
                } else if (b.clientname == "NA") {
                    return -1;
                }
                return a.clientname.toUpperCase() > b.clientname.toUpperCase() ? 1 : -1;
            });
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    purchasesCloudPreferenceRec: () => {
        return CloudPreference.findOne({
            userid: Session.get("mycloudLogonID"),
            PrefName: "tblcontactoverview",
        });
    },

    Currency: () => {
        return Currency;
    },

    loggedCompany: () => {
        return localStorage.getItem("mySession") || "";
    },

    // custom fields displaysettings
    displayfields: () => {
        return Template.instance().displayfields.get();
    },
});