import { ContactService } from "../../contacts/contact-service";
import { ReportService } from "../report-service";

import { UtilityService } from "../../utility-service";
import 'jquery-ui-dist/external/jquery/jquery';
import 'jquery-ui-dist/jquery-ui';
import 'jQuery.print/jQuery.print.js';
import { CountryService } from "../../js/country-service";
import { ReactiveVar } from "meteor/reactive-var";
import { AccountService } from "../../accounts/account-service";
import { SideBarService } from "../../js/sidebar-service";
import { OrganisationService } from '../../js/organisation-service';
import "../../lib/global/indexdbstorage.js";
import LoadingOverlay from "../../LoadingOverlay";

let sideBarService = new SideBarService();
let reportService = new ReportService();
let utilityService = new UtilityService();
let organisationService = new OrganisationService();

Template.accountant_trust.onCreated(() => {
    const templateObject = Template.instance();
    templateObject.countryList = new ReactiveVar([]);
    templateObject.countryData = new ReactiveVar();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.accountPanList = new ReactiveVar([]);
    templateObject.accountPanList1 = new ReactiveVar([]);
    templateObject.dateAsAt = new ReactiveVar();
    templateObject.fiscalYearEnding = new ReactiveVar();
    templateObject.currentYear = new ReactiveVar();
    templateObject.currentMonth = new ReactiveVar();
    templateObject.currentDate = new ReactiveVar();
    templateObject.endMonth = new ReactiveVar();
    templateObject.fromDate = new ReactiveVar();
    templateObject.endDate = new ReactiveVar();

    templateObject.balancesheetList = new ReactiveVar([]);
    templateObject.profitList = new ReactiveVar([]);
    templateObject.reportOptions = new ReactiveVar();

    templateObject.availableCategories = new ReactiveVar([]);
    templateObject.isBankAccount = new ReactiveVar();
    templateObject.totalEquity = new ReactiveVar();
    templateObject.isBankAccount.set(false);
});

Template.accountant_trust.onRendered(() => {

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const templateObject = Template.instance();
    let accountService = new AccountService();
    let contactService = new ContactService();
    let countries = [];
    const accountTypeList = [];
    const dataTableList = [];
    let categories = [];
    let categoryAccountList = [];

    tinymce.init({
        selector: 'textarea#editor',
    });

    $("#date-input,#dateTo,#dateFrom").datepicker({
        showOn: "button",
        buttonText: "Show Date",
        buttonImageOnly: true,
        buttonImage: "/img/imgCal2.png",
        dateFormat: "dd/mm/yy",
        showOtherMonths: true,
        selectOtherMonths: true,
        changeMonth: true,
        changeYear: true,
        yearRange: "-90:+10",
    });

    let currMonth = moment().format("MMM") + " " + moment().format("YYYY");
    $("#dispCurrMonth").append(currMonth);

    // get 'this month' to appear in date range selector dropdown end

    // get 'last quarter' to appear in date range selector dropdown
    let lastQStartDispaly = moment()
        .subtract(1, "Q")
        .startOf("Q")
        .format("D" + " " + "MMM" + " " + "YYYY");
    let lastQEndDispaly = moment()
        .subtract(1, "Q")
        .endOf("Q")
        .format("D" + " " + "MMM" + " " + "YYYY");
    $("#dispLastQuarter").append(lastQStartDispaly + " - " + lastQEndDispaly);

    // get 'last quarter' to appear in date range selector dropdown end

    // get 'this quarter' to appear in date range selector dropdown

    let thisQStartDispaly = moment()
        .startOf("Q")
        .format("D" + " " + "MMM" + " " + "YYYY");
    let thisQEndDispaly = moment()
        .endOf("Q")
        .format("D" + " " + "MMM" + " " + "YYYY");
    $("#dispCurrQuarter").append(thisQStartDispaly + " - " + thisQEndDispaly);

    // get 'this quarter' to appear in date range selector dropdown end

    // get 'last month' to appear in date range selector dropdown

    let prevMonth = moment()
        .subtract(1, "M")
        .format("MMM" + " " + "YYYY");
    $("#dispPrevMonth").append(prevMonth);

    // get 'last month' to appear in date range selector dropdown end

    // get 'month to date' to appear in date range selector dropdown

    let monthStart = moment()
        .startOf("M")
        .format("D" + " " + "MMM");
    let monthCurr = moment().format("D" + " " + "MMM" + " " + "YYYY");
    $("#monthStartDisp").append(monthStart + " - " + monthCurr);

    // get 'month to date' to appear in date range selector dropdown end

    // get 'quarter to date' to appear in date range selector dropdown

    let currQStartDispaly = moment()
        .startOf("Q")
        .format("D" + " " + "MMM");
    $("#quarterToDateDisp").append(currQStartDispaly + " - " + monthCurr);

    // get 'quarter to date' to appear in date range selector dropdown
    // get 'financial year' to appear
    if (moment().quarter() == 4) {
        var current_fiscal_year_start = moment()
            .month("July")
            .startOf("month")
            .format("D" + " " + "MMM" + " " + "YYYY");
        var current_fiscal_year_end = moment()
            .add(1, "year")
            .month("June")
            .endOf("month")
            .format("D" + " " + "MMM" + " " + "YYYY");
        var last_fiscal_year_start = moment()
            .subtract(1, "year")
            .month("July")
            .startOf("month")
            .format("D" + " " + "MMM" + " " + "YYYY");
        var last_fiscal_year_end = moment()
            .month("June")
            .endOf("month")
            .format("D" + " " + "MMM" + " " + "YYYY");
    } else {
        var current_fiscal_year_start = moment()
            .subtract(1, "year")
            .month("July")
            .startOf("month")
            .format("D" + " " + "MMM" + " " + "YYYY");
        var current_fiscal_year_end = moment()
            .month("June")
            .endOf("month")
            .format("D" + " " + "MMM" + " " + "YYYY");

        var last_fiscal_year_start = moment()
            .subtract(2, "year")
            .month("July")
            .startOf("month")
            .format("D" + " " + "MMM" + " " + "YYYY");
        var last_fiscal_year_end = moment()
            .subtract(1, "year")
            .month("June")
            .endOf("month")
            .format("D" + " " + "MMM" + " " + "YYYY");
    }
    //display current financial year
    $("#dispCurrFiscYear").append(
        current_fiscal_year_start + " - " + current_fiscal_year_end
    );
    //display last financial year
    $("#dispPrevFiscYear").append(
        last_fiscal_year_start + " - " + last_fiscal_year_end
    );
    //display current financial year to current date;
    let yeartodate = moment()
        .month("january")
        .startOf("month")
        .format("D" + " " + "MMM" + " " + "YYYY");
    $("#dispCurrFiscYearToDate").append(yeartodate + " - " + monthCurr);
    // get 'financial year' to appear end

    templateObject.getReceiptCategoryList = function() {
        getVS1Data('TReceiptCategory').then(function(dataObject) {
            if (dataObject.length == 0) {
                sideBarService.getReceiptCategory().then(function(data) {
                    setReceiptCategory(data);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                setReceiptCategory(data);
            }
        }).catch(function(err) {
            sideBarService.getReceiptCategory().then(function(data) {
                setReceiptCategory(data);
            });
        });
    };

    function setReceiptCategory(data) {
        for (let i in data.treceiptcategory) {
            if (data.treceiptcategory.hasOwnProperty(i)) {
                if (data.treceiptcategory[i].CategoryName != "") {
                    categories.push(data.treceiptcategory[i].CategoryName);
                }
            }
        }

        $('.fullScreenSpin').css('display', 'none');
        // templateObject.getAccountLists();
    }
    templateObject.getReceiptCategoryList();

    organisationService.getOrganisationDetail().then(function(data) {
        let mainData = data.tcompanyinfo[0];
        $("#pageTitle").html(mainData.CompanyName + " trading as " + mainData.TradingName);
    });

    templateObject.accountPanList.set([{
        no: 2,
        name: "Cash and Cash Equivalents",
    }, {
        no: 3,
        name: "Receivables",
    }, {
        no: 4,
        name: "Inventory",
    }, {
        no: 5,
        name: "Property Plant and Equipment",
    }, {
        no: 6,
        name: "Financial Assets",
    }, {
        no: 7,
        name: "Intangibles",
    }, {
        no: 8,
        name: "Provisions",
    }, {
        no: 9,
        name: "Payables",
    }]);

    templateObject.accountPanList1.set([{
        no: 11,
        name: "Current Year Earnings",
    }, {
        no: 12,
        name: "Net Trust Income for Distribution",
    }, {
        no: 13,
        name: "Undistributed Trust Income",
    }]);


    let imageData = (localStorage.getItem("Image"));
    if (imageData) {
        $('#uploadedImage').attr('src', imageData);
        $('#uploadedImage').attr('width', '50%');
    }

    function MakeNegative() {
        var TDs = document.getElementsByTagName("td");
        for (var i = 0; i < TDs.length; i++) {
            var temp = TDs[i];
            if (temp.firstChild.nodeValue.indexOf("-" + Currency) === 0) {
                temp.className = "colBalance text-danger";
            }
        }
    }

    let usedCategories = [];
    let currentId = FlowRouter.current().context.hash;
    if (currentId === "addNewAccount" || currentId === "newaccount") {
        setTimeout(function() {
            $(".isBankAccount").addClass("isNotBankAccount");
            $(".isCreditAccount").addClass("isNotCreditAccount");
            $("#addNewAccount").modal("show");
            //$('#btnAddNewAccounts').click();
        }, 500);
    }

    var countryService = new CountryService();
    templateObject.getCountryData = function() {
        getVS1Data("TCountries")
            .then(function(dataObject) {
                if (dataObject.length == 0) {
                    countryService.getCountry().then((data) => {
                        for (let i = 0; i < data.tcountries.length; i++) {
                            countries.push(data.tcountries[i].Country);
                        }
                        countries = _.sortBy(countries);
                        templateObject.countryData.set(countries);
                    });
                } else {
                    let data = JSON.parse(dataObject[0].data);
                    let useData = data.tcountries;
                    for (let i = 0; i < useData.length; i++) {
                        countries.push(useData[i].Country);
                    }
                    countries = _.sortBy(countries);
                    templateObject.countryData.set(countries);
                }
            })
            .catch(function(err) {
                countryService.getCountry().then((data) => {
                    for (let i = 0; i < data.tcountries.length; i++) {
                        countries.push(data.tcountries[i].Country);
                    }
                    countries = _.sortBy(countries);
                    templateObject.countryData.set(countries);
                });
            });
    };
    templateObject.getCountryData();

    templateObject.getAccountLists = function() {
        getVS1Data("TAccountVS1")
            .then(function(dataObject) {
                if (dataObject.length == 0) {
                    accountService
                        .getAccountListVS1()
                        .then(function(data) {
                            setAccountListVS1(data);
                        })
                        .catch(function(err) {
                            // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                            $(".fullScreenSpin").css("display", "none");
                            // Meteor._reload.reload();
                        });
                } else {
                    let data = JSON.parse(dataObject[0].data);
                    setAccountListVS1(data, true);
                }
            })
            .catch(function(err) {
                accountService
                    .getAccountListVS1()
                    .then(function(data) {
                        setAccountListVS1(data);
                    })
                    .catch(function(err) {
                        // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                        $(".fullScreenSpin").css("display", "none");
                        // Meteor._reload.reload();
                    });
            });
    };

    function setAccountListVS1(data, isField = false) {

        //addVS1Data('TAccountVS1', JSON.stringify(data));
        let lineItems = [];
        let lineItemObj = {};
        let fullAccountTypeName = "";
        let accBalance = "";
        dataTableList = [];

        for (let i = 0; i < data.taccountvs1.length; i++) {
            let lineData = data.taccountvs1[i];
            if (isField) {
                lineData = data.taccountvs1[i].fields;
            }
            if (accountTypeList) {
                for (var j = 0; j < accountTypeList.length; j++) {
                    if (
                        lineData.AccountTypeName ===
                        accountTypeList[j].accounttypename
                    ) {
                        fullAccountTypeName = accountTypeList[j].description || "";
                    }
                }
            }

            if (!isNaN(lineData.Balance)) {
                accBalance = utilityService.modifynegativeCurrencyFormat(lineData.Balance) || 0.0;
            } else {
                accBalance = Currency + "0.00";
            }
            if (data.taccountvs1[i].fields.ReceiptCategory && data.taccountvs1[i].fields.ReceiptCategory != '') {
                usedCategories.push(data.taccountvs1[i].fields);
            }

            var dataList = {
                id: lineData.ID || lineData.Id || "",
                accountname: lineData.AccountName || "",
                description: lineData.Description || "",
                accountnumber: lineData.AccountNumber || "",
                accounttypename: fullAccountTypeName || lineData.AccountTypeName,
                accounttypeshort: lineData.AccountTypeName || "",
                taxcode: lineData.TaxCode || "",
                bankaccountname: lineData.BankAccountName || "",
                bankname: lineData.BankName || "",
                bsb: lineData.BSB || "",
                bankaccountnumber: lineData.BankAccountNumber || "",
                swiftcode: lineData.Extra || "",
                routingNo: lineData.BankCode || "",
                apcanumber: lineData.BankNumber || "",
                balanceNumber: lineData.Balance || 0.0,
                balance: accBalance || 0.0,
                isheader: lineData.IsHeader || false,
                cardnumber: lineData.CarNumber || "",
                expirydate: lineData.ExpiryDate || "",
                cvc: lineData.CVC || "",
                useReceiptClaim: lineData.AllowExpenseClaim || false,
                expenseCategory: lineData.AccountGroup || ""
            };
            dataTableList.push(dataList);
        }

        usedCategories = [...new Set(usedCategories)];
        let availableCategories = categories.filter((item) => !usedCategories.includes(item));
        templateObject.availableCategories.set(availableCategories);
        templateObject.datatablerecords.set(dataTableList);

        categories.forEach((citem, j) => {
            let cdataList = null;
            let match = usedCategories.filter((item) => (item.ReceiptCategory == citem));
            if (match.length > 0) {
                let temp = match[0];
                cdataList = [
                    citem,
                    temp.AccountName || '',
                    temp.Description || '',
                    temp.AccountNumber || '',
                    temp.TaxCode || '',
                    temp.ID || ''
                ];
            } else {
                cdataList = [
                    citem,
                    '',
                    '',
                    '',
                    '',
                    ''
                ];
            }
            categoryAccountList.push(cdataList);
        });

        if (templateObject.datatablerecords.get()) {
            setTimeout(function() {
                MakeNegative();
            }, 100);
        }

        $(".fullScreenSpin").css("display", "none");
        setTimeout(function() {
            if (categoryAccountList.length > 0 && !$.fn.DataTable.isDataTable('#tblCategory')) {
                $('#tblCategory').dataTable({
                    data: categoryAccountList,
                    "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                    paging: true,
                    "aaSorting": [],
                    "orderMulti": true,
                    columnDefs: [
                        { className: "colReceiptCategory", "targets": [0] },
                        { className: "colAccountName", "targets": [1] },
                        { className: "colAccountDesc", "targets": [2] },
                        { className: "colAccountNumber", "targets": [3] },
                        { className: "colTaxCode", "targets": [4] },
                        { className: "colAccountID hiddenColumn", "targets": [5] }
                    ],
                    // select: true,
                    // destroy: true,
                    colReorder: true,
                    "order": [
                        [0, "asc"]
                    ],
                    pageLength: initialDatatableLoad,
                    lengthMenu: [
                        [initialDatatableLoad, -1],
                        [initialDatatableLoad, "All"]
                    ],
                    info: true,
                    responsive: true,
                    "fnInitComplete": function() {
                        $("<button class='btn btn-primary btnAddNewReceiptCategory' data-dismiss='modal' data-toggle='modal' data-target='#addReceiptCategoryModal' type='button' style='padding: 4px 10px; font-size: 14px; margin-left: 8px !important;'><i class='fas fa-plus'></i></button>").insertAfter("#tblCategory_filter");
                        $("<button class='btn btn-primary btnRefreshCategoryAccount' type='button' id='btnRefreshCategoryAccount' style='padding: 4px 10px; font-size: 14px; margin-left: 8px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblCategory_filter");
                    }
                });
            }

            $(".tblAccountOverview")
                .DataTable({
                    columnDefs: [
                        // { type: 'currency', targets: 4 }
                    ],
                    select: true,
                    destroy: true,
                    colReorder: true,
                    sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                    buttons: [{
                            extend: "csvHtml5",
                            text: "",
                            download: "open",
                            className: "btntabletocsv hiddenColumn",
                            filename: "accountoverview_" + moment().format(),
                            orientation: "portrait",
                            exportOptions: {
                                columns: ":visible",
                            },
                        },
                        {
                            extend: "print",
                            download: "open",
                            className: "btntabletopdf hiddenColumn",
                            text: "",
                            title: "Accounts Overview",
                            filename: "Accounts Overview_" + moment().format(),
                            exportOptions: {
                                columns: ":visible",
                            },
                        },
                        {
                            extend: "excelHtml5",
                            title: "",
                            download: "open",
                            className: "btntabletoexcel hiddenColumn",
                            filename: "accountoverview_" + moment().format(),
                            orientation: "portrait",
                            exportOptions: {
                                columns: ":visible",
                            },
                        },
                    ],
                    pageLength: initialDatatableLoad,
                    lengthMenu: [
                        [initialDatatableLoad, -1],
                        [initialDatatableLoad, "All"],
                    ],
                    info: true,
                    responsive: true,
                    order: [
                        [0, "asc"]
                    ],
                    action: function() {
                        $(".tblAccountOverview").DataTable().ajax.reload();
                    },
                    fnDrawCallback: function(oSettings) {
                        // setTimeout(function() {
                        //     MakeNegative();
                        // }, 100);
                    },
                    fnInitComplete: function() {},
                })
                .on("page", function() {
                    // setTimeout(function() {
                    //     MakeNegative();
                    // }, 100);
                    let draftRecord = templateObject.datatablerecords.get();
                    templateObject.datatablerecords.set(draftRecord);
                })
                .on("column-reorder", function() {})
                .on("length.dt", function(e, settings, len) {
                    // setTimeout(function() {
                    //     MakeNegative();
                    // }, 100);
                });

            $("<button class='btn btn-primary btnRefreshAccount' type='button' id='btnRefreshAccount' style='padding: 4px 10px; font-size: 14px; margin-left: 8px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblAccountOverview_wrapper .dataTables_filter");
            // $('.fullScreenSpin').css('display','none');
        }, 10);

        var columns = $("#tblAccountOverview th");
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
            if (v.className.includes("hiddenColumn")) {
                columVisible = false;
            }
            sWidth = v.style.width.replace("px", "");

            let datatablerecordObj = {
                sTitle: v.innerText || "",
                sWidth: sWidth || "",
                sIndex: v.cellIndex || "",
                sVisible: columVisible || false,
                sClass: v.className || "",
            };
            tableHeaderList.push(datatablerecordObj);
        });
        templateObject.tableheaderrecords.set(tableHeaderList);
        $("div.dataTables_filter input").addClass(
            "form-control form-control-sm"
        );
    }

    templateObject.getAccountLists();

    $(document).ready(function() {
        let imageData = localStorage.getItem("Image");
        if (imageData) {
            $("#uploadedImage").attr("src", imageData);
            $("#uploadedImage").attr("width", "50%");
        }

        var today = moment().format("DD/MM/YYYY");
        var currentDate = new Date();
        var begunDate = moment(currentDate).format("DD/MM/YYYY");
        templateObject.dateAsAt.set(begunDate);
        let supplierID = 367;

        let endMonth = localStorage.getItem("yearEnd") || 6;
        templateObject.endMonth.set(endMonth);
        templateObject.currentYear.set(new Date().getFullYear());
        templateObject.currentMonth.set(new Date().getMonth());
        templateObject.currentDate.set(new Date().getDate() + " " + months[new Date().getMonth()] + " " + new Date().getFullYear());

        var currentDate2 = new Date(new Date().getFullYear(), (parseInt(endMonth)), 0);
        templateObject.fiscalYearEnding.set(currentDate2.getDate() + " " + months[parseInt(endMonth) - 1] + " " + new Date().getFullYear());
        var getLoadDate = moment(currentDate2).format("YYYY-MM-DD");

        getVS1Data('TSupplierVS1').then(function(dataObject) {

            if (dataObject.length === 0) {
                contactService.getOneSupplierDataExByName(supplierID).then(function(data) {
                    setOneSupplierDataEx(data.tsupplier[0]);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);

                let useData = data.tsuppliervs1;
                let added = false;
                for (let i = 0; i < useData.length; i++) {
                    if (useData[i].fields.ClientName === supplierID) {
                        added = true;
                        setOneSupplierDataEx(useData[i]);
                    }
                }
                if (!added) {
                    contactService.getOneSupplierDataExByName(supplierID).then(function(data) {
                        setOneSupplierDataEx(data.tsupplier[0]);
                    });
                }
            }
        }).catch(function(err) {
            contactService.getOneSupplierDataExByName(supplierID).then(function(data) {
                setOneSupplierDataEx(data.tsupplier[0]);
            });
        });

        function setOneSupplierDataEx(data) {
            let lineItemObj = {
                id: data.fields.ID,
                lid: 'Edit Supplier',
                company: data.fields.ClientName || '',
                email: data.fields.Email || '',
                title: data.fields.Title || '',
                firstname: data.fields.FirstName || '',
                middlename: data.fields.CUSTFLD10 || '',
                lastname: data.fields.LastName || '',
                tfn: '' || '',
                phone: data.fields.Phone || '',
                mobile: data.fields.Mobile || '',
                fax: data.fields.Faxnumber || '',
                skype: data.fields.SkypeName || '',
                website: data.fields.URL || '',
                shippingaddress: data.fields.Street || '',
                scity: data.fields.Street2 || '',
                sstate: data.fields.State || '',
                spostalcode: data.fields.Postcode || '',
                scountry: data.fields.Country || LoggedCountry,
                billingaddress: data.fields.BillStreet || '',
                bcity: data.fields.BillStreet2 || '',
                bstate: data.fields.BillState || '',
                bpostalcode: data.fields.BillPostcode || '',
                bcountry: data.fields.Billcountry || '',
                custfield1: data.fields.CUSTFLD1 || '',
                custfield2: data.fields.CUSTFLD2 || '',
                custfield3: data.fields.CUSTFLD3 || '',
                custfield4: data.fields.CUSTFLD4 || '',
                notes: data.fields.Notes || '',
                preferedpayment: data.fields.PaymentMethodName || '',
                terms: data.fields.TermsName || '',
                deliverymethod: data.fields.ShippingMethodName || '',
                accountnumber: data.fields.ClientNo || 0.00,
                isContractor: data.fields.Contractor || false,
                issupplier: data.fields.IsSupplier || false,
                iscustomer: data.fields.IsCustomer || false,
            };

            let headerHtml = "<div style='border-top:1px solid #858796; width:172px; margin-bottom:12px'></div>";
            headerHtml += "<span style='float:left; padding-bottom:8px'>" + lineItemObj.firstname + " " + lineItemObj.lastname + ", CPA</span>";
            headerHtml += "<span style='float:left; padding-bottom:8px; clear:both'><b>" + lineItemObj.company + "</b></span>";
            var address = "";
            if (lineItemObj.scity != "") {
                address += lineItemObj.scity + ", ";
            }
            if (lineItemObj.spostalcode != "") {
                address += lineItemObj.spostalcode + ", ";
            }
            if (lineItemObj.sstate != "") {
                address += lineItemObj.sstate + ", ";
            }
            if (lineItemObj.scountry != "") {
                address += lineItemObj.scountry + ", ";
            }

            let endDate = $("#dateTo").val().split("/");
            endDate = endDate[0] + " " + months[parseInt(endDate[1] - 1)] + " " + endDate[2];
            templateObject.endDate.set(endDate);

            headerHtml += "<span style='float:left; padding-bottom:20px; clear:both'>" + lineItemObj.shippingaddress + "<br/>" + address.slice(0, -2) + "</span>";
            headerHtml += "<span style='float:left; clear:both' id='dispEndDate'>Dated: " + templateObject.endDate.get() + "</span>";

            $("#reportsAccountantHeader, #reportsAccountantHeaderPrt").html(headerHtml);
        }

    });

    $('#expenseCategory').on('click', function(e, li) {
        templateObject.setCategoryAccountList(e);
        $(".dt-buttons").hide();
    });
    templateObject.setCategoryAccountList = function(e) {
        const $each = $(e.target);
        const offset = $each.offset();
        $('#edtReceiptCategoryID').val('');
        const searchDataName = e.target.value || '';
        if (e.pageX > offset.left + $each.width() - 8) { // X button 16px wide?
            $each.attr('data-id', '');
            $('#categoryListModal').modal('toggle');
            setTimeout(function() {
                $('#tblCategory_filter .form-control-sm').focus();
                $('#tblCategory_filter .form-control-sm').val('');
                $('#tblCategory_filter .form-control-sm').trigger("input");
                const datatable = $('#tblCategory').DataTable();
                datatable.draw();
                $('#tblCategory_filter .form-control-sm').trigger("input");
            }, 200);
        } else {
            if (searchDataName.replace(/\s/g, '') != '') {
                getVS1Data('TReceiptCategory').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        $('.fullScreenSpin').css('display', 'inline-block');
                        sideBarService.getReceiptCategoryByName(searchDataName).then(function(data) {
                            showEditReceiptCategoryView(data.treceiptcategory[0]);
                        }).catch(function(err) {
                            $('.fullScreenSpin').css('display', 'none');
                        });
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        let added = false;
                        for (let i = 0; i < data.treceiptcategory.length; i++) {
                            if ((data.treceiptcategory[i].CategoryName) === searchDataName) {
                                added = true;
                                showEditReceiptCategoryView(data.treceiptcategory[i]);
                            }
                        }
                        if (!added) {
                            $('.fullScreenSpin').css('display', 'inline-block');
                            sideBarService.getReceiptCategoryByName(searchDataName).then(function(data) {
                                showEditReceiptCategoryView(data.treceiptcategory[0]);
                            }).catch(function(err) {
                                $('.fullScreenSpin').css('display', 'none');
                            });
                        }
                    }
                }).catch(function(err) {
                    sideBarService.getReceiptCategoryByName(searchDataName).then(function(data) {
                        showEditReceiptCategoryView(data.treceiptcategory[0]);
                    }).catch(function(err) {
                        $('.fullScreenSpin').css('display', 'none');
                    });
                });
            } else {
                $('#categoryListModal').modal('toggle');
                setTimeout(function() {
                    $('#tblCategory_filter .form-control-sm').focus();
                    $('#tblCategory_filter .form-control-sm').val('');
                    $('#tblCategory_filter .form-control-sm').trigger("input");
                    const datatable = $('#tblCategory').DataTable();
                    datatable.draw();
                    $('#tblCategory_filter .form-control-sm').trigger("input");
                }, 200);
            }
        }
    };

    function showEditReceiptCategoryView(data) {
        $("#add-receiptcategory-title").text("Edit Receipt Category");
        $('#edtReceiptCategoryID').val(data.Id);
        $('#edtReceiptCategoryName').val(data.CategoryName);
        $('#edtReceiptCategoryDesc').val(data.CategoryDesc);
        setTimeout(function() {
            $('#addReceiptCategoryModal').modal('show');
        }, 200);
    }

    templateObject.getBalanceSheetReports = async(dateAsOf) => {
        LoadingOverlay.show();

        let data = !localStorage.getItem("VS1BalanceSheet_Report1") ?
            await reportService.getBalanceSheetReport(dateAsOf) :
            JSON.parse(localStorage.getItem("VS1BalanceSheet_Report"));

        let records = [];
        if (data.balancesheetreport) {
            let date = new Date(dateAsOf);
            let Balancedatedisplay = moment(dateAsOf).format("DD/MM/YYYY");
            templateObject.dateAsAt.set(Balancedatedisplay);
            setTimeout(function() {
                $("#balanceData tbody tr:first td .SubHeading").html(
                    "As at " + moment(dateAsOf).format("DD/MM/YYYY")
                );
            }, 0);

            let sort = templateObject.$("#sort").val();
            let flag = false;
            if (sort == "Account Code") {
                flag = true;
            }

            let totalNetAssets = 0;
            let GrandTotalLiability = 0;
            let GrandTotalAsset = 0;
            for (let i = 0, len = data.balancesheetreport.length; i < len; i++) {
                let recordObj = {};
                recordObj.id = data.balancesheetreport[i].ID;
                recordObj.name = $.trim(data.balancesheetreport[i]["Account Tree"])
                    .split(" ")
                    .join("_");
                recordObj.dispName = $.trim(data.balancesheetreport[i]["Account Tree"]);

                let SubAccountTotal = data.balancesheetreport[i]["Sub Account Total"];
                if (SubAccountTotal !== 0) {
                    SubAccountTotal = utilityService.modifynegativeCurrencyFormat(SubAccountTotal);
                } else {
                    SubAccountTotal = " ";
                }

                let HeaderAccountTotal = data.balancesheetreport[i]["Header Account Total"];
                if (HeaderAccountTotal !== 0) {
                    HeaderAccountTotal = utilityService.modifynegativeCurrencyFormat(HeaderAccountTotal);
                } else {
                    HeaderAccountTotal = " ";
                }

                let TotalCurrentAsset_Liability = data.balancesheetreport[i]["Total Current Asset & Liability"];
                if (TotalCurrentAsset_Liability !== 0) {
                    TotalCurrentAsset_Liability = utilityService.modifynegativeCurrencyFormat(TotalCurrentAsset_Liability);
                } else {
                    TotalCurrentAsset_Liability = " ";
                }

                let TotalAsset_Liability = data.balancesheetreport[i]["Total Asset & Liability"];
                if (TotalAsset_Liability !== 0) {
                    TotalAsset_Liability = utilityService.modifynegativeCurrencyFormat(TotalAsset_Liability);
                } else {
                    TotalAsset_Liability = " ";
                }

                let AccountTree = data.balancesheetreport[i]["Account Tree"];
                recordObj.selected = false;

                if (
                    (i == 0 && AccountTree == "ASSETS") ||
                    AccountTree.replace(/\s/g, "") == "LIABILITIES&EQUITY"
                ) {
                    recordObj.dataArrHeader = [
                        data.balancesheetreport[i]["Account Tree"] || " ",
                    ];

                } else if (i == 1 || i == 2 || AccountTree == "") {
                    recordObj.dataArrAsset = [
                        data.balancesheetreport[i]["Account Tree"] || " ",
                    ];
                } else if (AccountTree.replace(/\s/g, "") == "TotalChequeorSaving") {
                    recordObj.value = HeaderAccountTotal || "";
                    recordObj.amount = utilityService.convertSubstringParseFloat(HeaderAccountTotal) || "";
                    recordObj.dataArrTotal = [
                        data.balancesheetreport[i]["Account Tree"] || "-",
                        {
                            type: "amount",
                            value: SubAccountTotal || "",
                            amount: utilityService.convertSubstringParseFloat(SubAccountTotal) ||
                                "",
                        },
                        {
                            type: "amount",
                            value: HeaderAccountTotal || "",
                            amount: utilityService.convertSubstringParseFloat(HeaderAccountTotal) || "",
                        },
                    ];

                } else if (
                    AccountTree.replace(/\s/g, "") == "TotalAccountsReceivable"
                ) {
                    recordObj.value = HeaderAccountTotal || "";
                    recordObj.amount = utilityService.convertSubstringParseFloat(HeaderAccountTotal) || "";
                    recordObj.dataArrTotal = [
                        data.balancesheetreport[i]["Account Tree"] || "-",
                        {
                            type: "amount",
                            value: SubAccountTotal || "",
                            amount: utilityService.convertSubstringParseFloat(SubAccountTotal) ||
                                "",
                        },
                        {
                            type: "amount",
                            value: HeaderAccountTotal || "",
                            amount: utilityService.convertSubstringParseFloat(HeaderAccountTotal) || "",
                        }, ,
                    ];

                } else if (AccountTree.replace(/\s/g, "") == "TotalOtherCurrentAsset") {
                    recordObj.value = HeaderAccountTotal || "";
                    recordObj.amount = utilityService.convertSubstringParseFloat(HeaderAccountTotal) || "";
                    recordObj.dataArrTotal = [
                        data.balancesheetreport[i]["Account Tree"] || "-",
                        {
                            type: "amount",
                            value: SubAccountTotal || "",
                            amount: utilityService.convertSubstringParseFloat(SubAccountTotal) ||
                                "",
                        },
                        {
                            type: "amount",
                            value: HeaderAccountTotal || "",
                            amount: utilityService.convertSubstringParseFloat(HeaderAccountTotal) || "",
                        },
                    ];

                } else if (AccountTree.replace(/\s/g, "") == "TotalCurrentAssets") {
                    recordObj.value = TotalCurrentAsset_Liability || "";
                    recordObj.amount = utilityService.convertSubstringParseFloat(TotalCurrentAsset_Liability) || "";
                    recordObj.dataArrTotal1 = [
                        data.balancesheetreport[i]["Account Tree"] || "-",
                        {
                            type: "amount",
                            value: SubAccountTotal || "",
                            amount: utilityService.convertSubstringParseFloat(SubAccountTotal) ||
                                "",
                        },
                        {
                            type: "amount",
                            value: TotalCurrentAsset_Liability || "",
                            amount: utilityService.convertSubstringParseFloat(TotalCurrentAsset_Liability) || "",
                        },
                    ];
                } else if (AccountTree.replace(/\s/g, "") == "FixedAsset") {
                    recordObj.dataArrAsset = [
                        data.balancesheetreport[i]["Account Tree"] || " ",
                    ];

                } else if (AccountTree.replace(/\s/g, "") == "TotalFixedAsset") {
                    recordObj.value = TotalCurrentAsset_Liability || "";
                    recordObj.amount = utilityService.convertSubstringParseFloat(TotalCurrentAsset_Liability) || "";
                    recordObj.dataArrTotal1 = [
                        data.balancesheetreport[i]["Account Tree"] || "-",
                        {
                            type: "amount",
                            value: SubAccountTotal || "",
                            amount: utilityService.convertSubstringParseFloat(SubAccountTotal) ||
                                "",
                        },
                        {
                            type: "amount",
                            value: TotalCurrentAsset_Liability || "",
                            amount: utilityService.convertSubstringParseFloat(TotalCurrentAsset_Liability) || "",
                        },
                    ];
                } else if (AccountTree.replace(/\s/g, "") == "TOTALASSETS") {
                    recordObj.value = TotalAsset_Liability || "";
                    recordObj.amount = utilityService.convertSubstringParseFloat(TotalAsset_Liability) || "";
                    recordObj.dataArrTotal1 = [
                        data.balancesheetreport[i]["Account Tree"] || "-",
                        {
                            type: "amount",
                            value: SubAccountTotal || "",
                            amount: utilityService.convertSubstringParseFloat(SubAccountTotal) ||
                                "",
                        },
                        {
                            type: "amount",
                            value: TotalAsset_Liability || "",
                            amount: utilityService.convertSubstringParseFloat(TotalAsset_Liability) || "",
                        },
                    ];

                    GrandTotalAsset = TotalAsset_Liability;
                } else if (
                    AccountTree.replace(/\s/g, "") == "Liabilities" ||
                    AccountTree.replace(/\s/g, "") == "CurrentLiabilities"
                ) {
                    recordObj.dataArrAsset = [
                        data.balancesheetreport[i]["Account Tree"] || " ",
                    ];
                } else if (AccountTree.replace(/\s/g, "") == "TotalCreditCardAccount") {
                    recordObj.value = HeaderAccountTotal || "";
                    recordObj.amount = utilityService.convertSubstringParseFloat(HeaderAccountTotal) || "";
                    recordObj.dataArrTotal = [
                        data.balancesheetreport[i]["Account Tree"] || "-",
                        {
                            type: "amount",
                            value: SubAccountTotal || "",
                            amount: utilityService.convertSubstringParseFloat(SubAccountTotal) ||
                                "",
                        },
                        {
                            type: "amount",
                            value: HeaderAccountTotal || "",
                            amount: utilityService.convertSubstringParseFloat(HeaderAccountTotal) || "",
                        },
                    ];
                } else if (AccountTree.replace(/\s/g, "") == "TotalAccountsPayable") {
                    recordObj.value = HeaderAccountTotal || "";
                    recordObj.amount = utilityService.convertSubstringParseFloat(HeaderAccountTotal) || "";
                    recordObj.dataArrTotal = [
                        data.balancesheetreport[i]["Account Tree"] || "-",
                        {
                            type: "amount",
                            value: SubAccountTotal || "",
                            amount: utilityService.convertSubstringParseFloat(SubAccountTotal) ||
                                "",
                        },
                        {
                            type: "amount",
                            value: HeaderAccountTotal || "",
                            amount: utilityService.convertSubstringParseFloat(HeaderAccountTotal) || "",
                        },
                    ];
                } else if (
                    AccountTree.replace(/\s/g, "") == "TotalOtherCurrentLiability"
                ) {
                    recordObj.value = HeaderAccountTotal || "";
                    recordObj.amount = utilityService.convertSubstringParseFloat(HeaderAccountTotal) || "";
                    recordObj.dataArrTotal = [
                        data.balancesheetreport[i]["Account Tree"] || "-",
                        {
                            type: "amount",
                            value: SubAccountTotal || "",
                            amount: utilityService.convertSubstringParseFloat(SubAccountTotal) ||
                                "",
                        },
                        {
                            type: "amount",
                            value: HeaderAccountTotal || "",
                            amount: utilityService.convertSubstringParseFloat(HeaderAccountTotal) || "",
                        },
                    ];
                } else if (
                    AccountTree.replace(/\s/g, "") == "TotalCurrentLiabilities"
                ) {
                    recordObj.value = TotalCurrentAsset_Liability || "";
                    recordObj.amount = utilityService.convertSubstringParseFloat(TotalCurrentAsset_Liability) || "";
                    recordObj.dataArrTotal1 = [
                        data.balancesheetreport[i]["Account Tree"] || "-",
                        {
                            type: "amount",
                            value: SubAccountTotal || "",
                            amount: utilityService.convertSubstringParseFloat(SubAccountTotal) ||
                                "",
                        },
                        {
                            type: "amount",
                            value: TotalCurrentAsset_Liability || "",
                            amount: utilityService.convertSubstringParseFloat(TotalCurrentAsset_Liability) || "",
                        },
                    ];
                } else if (AccountTree.replace(/\s/g, "") == "TotalCapital/Equity") {

                    templateObject.totalEquity.set(data.balancesheetreport[i]["Total Current Asset & Liability"]);

                    recordObj.value = TotalCurrentAsset_Liability || "";
                    recordObj.amount = utilityService.convertSubstringParseFloat(TotalCurrentAsset_Liability) || "";
                    recordObj.dataArrTotal1 = [
                        data.balancesheetreport[i]["Account Tree"] || "-",
                        {
                            type: "amount",
                            value: SubAccountTotal || "",
                            amount: utilityService.convertSubstringParseFloat(SubAccountTotal) || "",
                        },
                        {
                            type: "amount",
                            value: TotalCurrentAsset_Liability || "",
                            amount: utilityService.convertSubstringParseFloat(TotalCurrentAsset_Liability) || "",
                        },
                    ];
                } else if (
                    AccountTree.replace(/\s/g, "") == "TOTALLIABILITIES&EQUITY"
                ) {
                    recordObj.value = TotalAsset_Liability || "";
                    recordObj.amount = utilityService.convertSubstringParseFloat(TotalAsset_Liability) || "";
                    recordObj.dataArrTotal1 = [
                        data.balancesheetreport[i]["Account Tree"] || "-",
                        {
                            type: "amount",
                            value: SubAccountTotal || "",
                            amount: utilityService.convertSubstringParseFloat(SubAccountTotal) ||
                                "",
                        },
                        {
                            type: "amount",
                            value: TotalAsset_Liability || "",
                            amount: utilityService.convertSubstringParseFloat(TotalAsset_Liability) || "",
                        },
                    ];

                    GrandTotalLiability = TotalAsset_Liability;
                } else if (
                    AccountTree.replace(/\s/g, "") == "Capital/Equity" ||
                    AccountTree.replace(/\s/g, "") == "OtherCurrentLiability" ||
                    AccountTree.replace(/\s/g, "") == "OtherCurrentAsset" ||
                    AccountTree.replace(/\s/g, "") == "CreditCardAccount"
                ) {
                    recordObj.dataArrAsset = [
                        data.balancesheetreport[i]["Account Tree"] || " ",
                    ];
                } else {
                    if (flag) {
                        let accountCode = "";
                        if (data.balancesheetreport[i].AccountNumber) {
                            accountCode = data.balancesheetreport[i].AccountNumber + "-";
                        }
                        recordObj.value = SubAccountTotal || "";
                        recordObj.amount = utilityService.convertSubstringParseFloat(SubAccountTotal) || "";
                        if (recordObj.amount == "") {
                            recordObj.value = HeaderAccountTotal || "";
                            recordObj.amount = utilityService.convertSubstringParseFloat(HeaderAccountTotal) || "";
                        }

                        recordObj.dataArr2 = [
                            accountCode + data.balancesheetreport[i]["Account Tree"] || "-",
                            {
                                type: "amount",
                                value: SubAccountTotal || "",
                                amount: utilityService.convertSubstringParseFloat(SubAccountTotal) ||
                                    "",
                            },
                            {
                                type: "amount",
                                value: HeaderAccountTotal || "",
                                amount: utilityService.convertSubstringParseFloat(HeaderAccountTotal) || "",
                            },
                        ];
                    } else {
                        recordObj.value = SubAccountTotal || "";
                        recordObj.amount = utilityService.convertSubstringParseFloat(SubAccountTotal) || "";
                        if (recordObj.amount == "") {
                            recordObj.value = HeaderAccountTotal || "";
                            recordObj.amount = utilityService.convertSubstringParseFloat(HeaderAccountTotal) || "";
                        }
                        recordObj.dataArr2 = [
                            data.balancesheetreport[i]["Account Tree"] || "-",
                            {
                                type: "amount",
                                value: SubAccountTotal || "",
                                amount: utilityService.convertSubstringParseFloat(SubAccountTotal) ||
                                    "",
                            },
                            {
                                type: "amount",
                                value: HeaderAccountTotal || "",
                                amount: utilityService.convertSubstringParseFloat(HeaderAccountTotal) || "",
                            },
                        ];
                    }
                }
                if (recordObj.dataArr2) {
                    if (HeaderAccountTotal.replace(/\s/g, "") || SubAccountTotal.replace(/\s/g, "")) {
                        records.push(recordObj);
                    }
                } else {
                    records.push(recordObj);
                }
            }
        }

        templateObject.balancesheetList.set(records);

        if (templateObject.balancesheetList.get()) {
            setTimeout(function() {
                function MakeNegative() {
                    $("td").each(function() {
                        if (
                            $(this)
                            .text()
                            .indexOf("-" + Currency) >= 0
                        )
                            $(this).addClass("text-danger");
                    });
                }
                MakeNegative();
                $("td a").each(function() {
                    if (
                        $(this)
                        .text()
                        .indexOf("-" + Currency) >= 0
                    )
                        $(this).addClass("text-danger");
                });
            }, 500);
        }

        LoadingOverlay.hide();
    };

    // templateObject.getBalanceSheetReports(getLoadDate);

    templateObject.setReportOptions = async function(
        compPeriod = 0,
        formatDateFrom = new Date(),
        formatDateTo = new Date()
    ) {
        // New Code Start here
        let dateRange = [];
        dateRange.push(
            moment(formatDateFrom).format("DD MMM YYYY") +
            "-" +
            moment(formatDateTo).format("DD MMM YYYY")
        );

        let defaultOptions = templateObject.reportOptions.get();
        if (defaultOptions) {
            defaultOptions.fromDate = formatDateFrom;
            defaultOptions.toDate = formatDateTo;
            defaultOptions.threcords = dateRange;
        } else {
            defaultOptions = {
                compPeriod: compPeriod,
                fromDate: formatDateFrom,
                toDate: formatDateTo,
                threcords: dateRange,
                departments: [],
                showDecimal: true,
                showtotal: true,
            };
        }
        await templateObject.reportOptions.set(defaultOptions);

        await templateObject.getProfitandLossReports();
    };

    templateObject.getProfitandLossReports = async function() {
        const options = await templateObject.reportOptions.get();
        let dateFrom =
            moment(options.fromDate).format("YYYY-MM-DD") ||
            moment().format("YYYY-MM-DD");
        let dateTo =
            moment(options.toDate).format("YYYY-MM-DD") ||
            moment().format("YYYY-MM-DD");
        // Compare period
        if (options.compPeriod) {
            try {
                let periodMonths = `${options.compPeriod} Month`;
                let data = await reportService.getProfitandLossCompare(
                    dateFrom,
                    dateTo,
                    false,
                    periodMonths
                );
                let records = [];
                options.threcords = [];
                if (data.tprofitandlossperiodcomparereport) {
                    let accountData = data.tprofitandlossperiodcomparereport;

                    let accountType = "";
                    var dataList = "";
                    for (let i = 0; i < accountData.length; i++) {
                        if (accountData[i]["AccountTypeDesc"].replace(/\s/g, "") == "") {
                            accountType = "";
                        } else {
                            accountType = accountData[i]["AccountTypeDesc"];
                        }
                        let compPeriod = options.compPeriod + 1;
                        let periodAmounts = [];
                        let totalAmount = 0;
                        for (let counter = 1; counter <= compPeriod; counter++) {
                            if (i == 0) {
                                options.threcords.push(accountData[i]["DateDesc_" + counter]);
                            }
                            totalAmount += accountData[i]["Amount_" + counter];
                            let AmountEx =
                                utilityService.modifynegativeCurrencyFormat(
                                    accountData[i]["Amount_" + counter]
                                ) || 0.0;
                            let RoundAmount =
                                Math.round(accountData[i]["Amount_" + counter]) || 0;
                            periodAmounts.push({
                                decimalAmt: AmountEx,
                                roundAmt: RoundAmount,
                            });
                        }
                        let totalAmountEx = utilityService.modifynegativeCurrencyFormat(totalAmount) || 0.0;
                        let totalRoundAmount = Math.round(totalAmount) || 0;
                        if (accountData[i]["AccountHeaderOrder"].replace(/\s/g, "") == "" && accountType != "") {
                            dataList = {
                                id: accountData[i]["AccountID"] || "",
                                accounttype: accountType || "",
                                accounttypeshort: accountData[i]["AccountType"] || "",
                                accountname: accountData[i]["AccountName"] || "",
                                accountheaderorder: accountData[i]["AccountHeaderOrder"] || "",
                                accountno: accountData[i]["AccountNo"] || "",
                                totalamountex: "",
                                totalroundamountex: "",
                                periodAmounts: "",
                                name: $.trim(accountData[i]["AccountName"])
                                    .split(" ")
                                    .join("_"),
                            };
                        } else {
                            dataList = {
                                id: accountData[i]["AccountID"] || "",
                                accounttype: accountType || "",
                                accounttypeshort: accountData[i]["AccountType"] || "",
                                accountname: accountData[i]["AccountName"] || "",
                                accountheaderorder: accountData[i]["AccountHeaderOrder"] || "",
                                accountno: accountData[i]["AccountNo"] || "",
                                totalamountex: totalAmountEx || 0.0,
                                periodAmounts: periodAmounts,
                                totalroundamountex: totalRoundAmount,
                                name: $.trim(accountData[i]["AccountName"])
                                    .split(" ")
                                    .join("_"),
                                // totaltax: totalTax || 0.00
                            };
                        }

                        if (accountData[i]["AccountType"].replace(/\s/g, "") == "" && accountType == "") {} else {
                            if (dataList.totalroundamountex !== 0) {
                                records.push(dataList);
                            }
                        }
                    }

                    // Set Table Data
                    templateObject.reportOptions.set(options);
                    templateObject.profitList.set(records);

                    $(".fullScreenSpin").css("display", "none");
                }
            } catch (err) {
                $(".fullScreenSpin").css("display", "none");
            }
        } else {
            try {
                options.threcords = [];
                let fromYear = moment(dateFrom).format("YYYY");
                let toYear = moment(dateTo).format("YYYY");
                let dateRange = [];
                if (toYear === fromYear) {
                    dateRange.push(
                        moment(dateFrom).format("DD MMM") +
                        "-" +
                        moment(dateTo).format("DD MMM") +
                        " " +
                        toYear
                    );
                } else {
                    dateRange.push(
                        moment(dateFrom).format("DD MMM YYYY") +
                        "-" +
                        moment(dateTo).format("DD MMM YYYY")
                    );
                }
                options.threcords = dateRange;
                let departments = options.departments.length ?
                    options.departments.join(",") :
                    "";
                let data = await reportService.getProfitandLoss(
                    dateFrom,
                    dateTo,
                    false,
                    departments
                );
                let records = [];
                if (data.profitandlossreport) {
                    let accountData = data.profitandlossreport;
                    let accountType = "";
                    var dataList = "";
                    for (let i = 0; i < accountData.length; i++) {
                        if (accountData[i]["Account Type"].replace(/\s/g, "") == "") {
                            accountType = "";
                        } else {
                            accountType = accountData[i]["Account Type"];
                        }
                        let periodAmounts = []
                        var totalAmount = accountData[i]["TotalAmountEx"];
                        let totalAmountEx = utilityService.modifynegativeCurrencyFormat(accountData[i]["TotalAmountEx"]) || 0.0;
                        let totalRoundAmount = Math.round(accountData[i]["TotalAmountEx"]) || 0;
                        periodAmounts.push({
                            decimalAmt: totalAmountEx,
                            roundAmt: totalRoundAmount,
                        });
                        if (options.departments.length) {
                            options.departments.forEach(dept => {
                                totalAmount += accountData[i][dept + "_AmountColumnInc"];
                                let deptAmountEx = utilityService.modifynegativeCurrencyFormat(accountData[i][dept + "_AmountColumnInc"]) || 0.0;
                                let deptRoundAmount = Math.round(accountData[i][dept + "_AmountColumnInc"]) || 0;
                                if (i == 0) {
                                    options.threcords.push(dept);
                                }
                                periodAmounts.push({
                                    decimalAmt: deptAmountEx,
                                    roundAmt: deptRoundAmount,
                                });
                            });
                        }
                        if (
                            accountData[i]["AccountHeaderOrder"].replace(/\s/g, "") == "" &&
                            accountType != ""
                        ) {
                            dataList = {
                                id: accountData[i]["AccountID"] || "",
                                accounttype: accountType || "",
                                accounttypeshort: accountData[i]["AccountType"] || "",
                                accountname: accountData[i]["AccountName"] || "",
                                accountheaderorder: accountData[i]["AccountHeaderOrder"] || "",
                                accountno: accountData[i]["AccountNo"] || "",
                                totalamountex: "",
                                periodAmounts: "",
                                totalroundamountex: "",
                                name: $.trim(accountData[i]["AccountName"])
                                    .split(" ")
                                    .join("_"),
                            };
                        } else {
                            dataList = {
                                id: accountData[i]["AccountID"] || "",
                                accounttype: accountType || "",
                                accounttypeshort: accountData[i]["AccountType"] || "",
                                accountname: accountData[i]["AccountName"] || "",
                                accountheaderorder: accountData[i]["AccountHeaderOrder"] || "",
                                accountno: accountData[i]["AccountNo"] || "",
                                totalamountex: totalAmountEx || 0.0,
                                totalroundamountex: totalRoundAmount,
                                periodAmounts: periodAmounts,
                                name: $.trim(accountData[i]["AccountName"])
                                    .split(" ")
                                    .join("_"),
                                // totaltax: totalTax || 0.00
                            };
                        }

                        if (
                            accountData[i]["AccountType"].replace(/\s/g, "") == "" &&
                            accountType == ""
                        ) {} else {
                            if (dataList.totalroundamountex !== 0) {
                                records.push(dataList);
                            }
                        }
                    }

                    // Set Table Data

                    templateObject.reportOptions.set(options);
                    templateObject.profitList.set(records);

                    $(".fullScreenSpin").css("display", "none");
                }
            } catch (error) {
                $(".fullScreenSpin").css("display", "none");
            }
        }
    };

    var getDateFrom = $("#dateFrom").val().split('/');
    var getLoadDate = $("#dateTo").val().split('/');
    getDateFrom = getDateFrom[2] + "-" + getDateFrom[1] + "-" + getDateFrom[0];
    getLoadDate = getLoadDate[2] + "-" + getLoadDate[1] + "-" + getLoadDate[0];
    templateObject.setReportOptions(0, getDateFrom, getLoadDate);
    templateObject.getBalanceSheetReports(getLoadDate);
});

Template.accountant_trust.events({

    "change #dateTo, change #dateFrom": function() {
        $(".fullScreenSpin").css("display", "inline-block");
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        let templateObject = Template.instance();

        let fromDate = $("#dateFrom").val().split("/");
        let endDate = $("#dateTo").val().split("/");

        templateObject.setReportOptions(0, (fromDate[2] + "-" + fromDate[1] + "-" + fromDate[0]), (endDate[2] + "-" + endDate[1] + "-" + endDate[0]));
        templateObject.getBalanceSheetReports((endDate[2] + "-" + endDate[1] + "-" + endDate[0]));

        fromDate = fromDate[2] + " " + months[parseInt(fromDate[1]) - 1] + " " + fromDate[0];
        endDate = endDate[2] + " " + months[parseInt(endDate[1]) - 1] + " " + endDate[0];

        Template.instance().fromDate.set(fromDate);
        Template.instance().endDate.set(endDate);
        templateObject.fiscalYearEnding.set(endDate);

        $("#dispEndDate").html("Dated: " + templateObject.endDate.get());
    },

    "click #dropdownDateRang": function(e) {
        let dateRangeID = e.target.id;
        $("#btnSltDateRange").addClass("selectedDateRangeBtnMod");
        $("#selectedDateRange").show();
        if (dateRangeID == "thisMonth") {
            document.getElementById("selectedDateRange").value = "This Month";
        } else if (dateRangeID == "thisQuarter") {
            document.getElementById("selectedDateRange").value = "This Quarter";
        } else if (dateRangeID == "thisFinYear") {
            document.getElementById("selectedDateRange").value =
                "This Financial Year";
        } else if (dateRangeID == "lastMonth") {
            document.getElementById("selectedDateRange").value = "Last Month";
        } else if (dateRangeID == "lastQuarter") {
            document.getElementById("selectedDateRange").value = "Last Quarter";
        } else if (dateRangeID == "lastFinYear") {
            document.getElementById("selectedDateRange").value =
                "Last Financial Year";
        } else if (dateRangeID == "monthToDate") {
            document.getElementById("selectedDateRange").value = "Month to Date";
        } else if (dateRangeID == "quarterToDate") {
            document.getElementById("selectedDateRange").value = "Quarter to Date";
        } else if (dateRangeID == "finYearToDate") {
            document.getElementById("selectedDateRange").value = "Year to Date";
        }
    },

    "click #thisMonth": function() {
        $(".fullScreenSpin").css("display", "inline-block");
        let templateObject = Template.instance();
        let fromDate = moment().startOf("month").format("YYYY-MM-DD");
        let endDate = moment().endOf("month").format("YYYY-MM-DD");

        templateObject.setReportOptions(0, fromDate, endDate);
        templateObject.getBalanceSheetReports(endDate);

        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        fromDate = fromDate.split("-");
        endDate = endDate.split("-");
        fromDate = fromDate[0] + " " + months[parseInt(fromDate[1]) - 1] + " " + fromDate[2];
        endDate = endDate[0] + " " + months[parseInt(endDate[1]) - 1] + " " + endDate[2];

        Template.instance().fromDate.set(fromDate);
        Template.instance().endDate.set(endDate);
        templateObject.fiscalYearEnding.set(endDate);
        $("#dispEndDate").html("Dated: " + endDate);
    },

    "click #thisQuarter": function() {
        $(".fullScreenSpin").css("display", "inline-block");
        let templateObject = Template.instance();
        let fromDate = moment().startOf("Q").format("YYYY-MM-DD");
        let endDate = moment().endOf("Q").format("YYYY-MM-DD");
        templateObject.setReportOptions(0, fromDate, endDate);
        templateObject.getBalanceSheetReports(endDate);

        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        fromDate = fromDate.split("-");
        endDate = endDate.split("-");
        fromDate = fromDate[0] + " " + months[parseInt(fromDate[1]) - 1] + " " + fromDate[2];
        endDate = endDate[0] + " " + months[parseInt(endDate[1]) - 1] + " " + endDate[2];

        Template.instance().fromDate.set(fromDate);
        Template.instance().endDate.set(endDate);
        templateObject.fiscalYearEnding.set(endDate);
        $("#dispEndDate").html("Dated: " + endDate);
    },

    "click #thisFinYear": function() {
        $(".fullScreenSpin").css("display", "inline-block");
        let templateObject = Template.instance();
        let fromDate = null;
        let endDate = null;
        if (moment().quarter() == 4) {
            fromDate = moment().month("July").startOf("month").format("YYYY-MM-DD");
            endDate = moment()
                .add(1, "year")
                .month("June")
                .endOf("month")
                .format("YYYY-MM-DD");
        } else {
            fromDate = moment()
                .subtract(1, "year")
                .month("July")
                .startOf("month")
                .format("YYYY-MM-DD");
            endDate = moment().month("June").endOf("month").format("YYYY-MM-DD");
        }
        templateObject.setReportOptions(0, fromDate, endDate);
        templateObject.getBalanceSheetReports(endDate);

        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        fromDate = fromDate.split("-");
        endDate = endDate.split("-");
        fromDate = fromDate[0] + " " + months[parseInt(fromDate[1]) - 1] + " " + fromDate[2];
        endDate = endDate[0] + " " + months[parseInt(endDate[1]) - 1] + " " + endDate[2];

        Template.instance().fromDate.set(fromDate);
        Template.instance().endDate.set(endDate);
        templateObject.fiscalYearEnding.set(endDate);
        $("#dispEndDate").html("Dated: " + endDate);
    },

    "click #lastMonth": function() {
        $(".fullScreenSpin").css("display", "inline-block");
        let templateObject = Template.instance();
        let fromDate = moment()
            .subtract(1, "months")
            .startOf("month")
            .format("YYYY-MM-DD");
        let endDate = moment()
            .subtract(1, "months")
            .endOf("month")
            .format("YYYY-MM-DD");
        templateObject.setReportOptions(0, fromDate, endDate);
        templateObject.getBalanceSheetReports(endDate);

        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        fromDate = fromDate.split("-");
        endDate = endDate.split("-");
        fromDate = fromDate[0] + " " + months[parseInt(fromDate[1]) - 1] + " " + fromDate[2];
        endDate = endDate[0] + " " + months[parseInt(endDate[1]) - 1] + " " + endDate[2];

        Template.instance().fromDate.set(fromDate);
        Template.instance().endDate.set(endDate);
        templateObject.fiscalYearEnding.set(endDate);
        $("#dispEndDate").html("Dated: " + endDate);
    },

    "click #lastQuarter": function() {
        $(".fullScreenSpin").css("display", "inline-block");
        let templateObject = Template.instance();
        let fromDate = moment().subtract(1, "Q").startOf("Q").format("YYYY-MM-DD");
        let endDate = moment().subtract(1, "Q").endOf("Q").format("YYYY-MM-DD");
        templateObject.setReportOptions(0, fromDate, endDate);
        templateObject.getBalanceSheetReports(endDate);

        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        fromDate = fromDate.split("-");
        endDate = endDate.split("-");
        fromDate = fromDate[0] + " " + months[parseInt(fromDate[1]) - 1] + " " + fromDate[2];
        endDate = endDate[0] + " " + months[parseInt(endDate[1]) - 1] + " " + endDate[2];

        Template.instance().fromDate.set(fromDate);
        Template.instance().endDate.set(endDate);
        templateObject.fiscalYearEnding.set(endDate);
        $("#dispEndDate").html("Dated: " + endDate);
    },

    "click #lastFinYear": function() {
        $(".fullScreenSpin").css("display", "inline-block");
        let templateObject = Template.instance();
        let fromDate = null;
        let endDate = null;
        if (moment().quarter() == 4) {
            fromDate = moment()
                .subtract(1, "year")
                .month("July")
                .startOf("month")
                .format("YYYY-MM-DD");
            endDate = moment().month("June").endOf("month").format("YYYY-MM-DD");
        } else {
            fromDate = moment()
                .subtract(2, "year")
                .month("July")
                .startOf("month")
                .format("YYYY-MM-DD");
            endDate = moment()
                .subtract(1, "year")
                .month("June")
                .endOf("month")
                .format("YYYY-MM-DD");
        }
        templateObject.setReportOptions(0, fromDate, endDate);
        templateObject.getBalanceSheetReports(endDate);

        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        fromDate = fromDate.split("-");
        endDate = endDate.split("-");
        fromDate = fromDate[0] + " " + months[parseInt(fromDate[1]) - 1] + " " + fromDate[2];
        endDate = endDate[0] + " " + months[parseInt(endDate[1]) - 1] + " " + endDate[2];

        Template.instance().fromDate.set(fromDate);
        Template.instance().endDate.set(endDate);
        templateObject.fiscalYearEnding.set(endDate);
        $("#dispEndDate").html("Dated: " + endDate);
    },

    "click #monthToDate": function() {
        $(".fullScreenSpin").css("display", "inline-block");
        let templateObject = Template.instance();
        let fromDate = moment().startOf("M").format("YYYY-MM-DD");
        let endDate = moment().format("YYYY-MM-DD");
        templateObject.setReportOptions(0, fromDate, endDate);
        templateObject.getBalanceSheetReports(endDate);

        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        fromDate = fromDate.split("-");
        endDate = endDate.split("-");
        fromDate = fromDate[0] + " " + months[parseInt(fromDate[1]) - 1] + " " + fromDate[2];
        endDate = endDate[0] + " " + months[parseInt(endDate[1]) - 1] + " " + endDate[2];

        Template.instance().fromDate.set(fromDate);
        Template.instance().endDate.set(endDate);
        templateObject.fiscalYearEnding.set(endDate);
        $("#dispEndDate").html("Dated: " + endDate);
    },

    "click #quarterToDate": function() {
        $(".fullScreenSpin").css("display", "inline-block");
        let templateObject = Template.instance();
        let fromDate = moment().startOf("Q").format("YYYY-MM-DD");
        let endDate = moment().format("YYYY-MM-DD");
        templateObject.setReportOptions(0, fromDate, endDate);
        templateObject.getBalanceSheetReports(endDate);

        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        fromDate = fromDate.split("-");
        endDate = endDate.split("-");
        fromDate = fromDate[0] + " " + months[parseInt(fromDate[1]) - 1] + " " + fromDate[2];
        endDate = endDate[0] + " " + months[parseInt(endDate[1]) - 1] + " " + endDate[2];

        Template.instance().fromDate.set(fromDate);
        Template.instance().endDate.set(endDate);
        templateObject.fiscalYearEnding.set(endDate);
        $("#dispEndDate").html("Dated: " + endDate);
    },

    "click #finYearToDate": function() {
        $(".fullScreenSpin").css("display", "inline-block");
        let templateObject = Template.instance();
        let fromDate = moment()
            .month("january")
            .startOf("month")
            .format("YYYY-MM-DD");
        let endDate = moment().format("YYYY-MM-DD");
        templateObject.setReportOptions(0, fromDate, endDate);
        templateObject.getBalanceSheetReports(endDate);

        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        fromDate = fromDate.split("-");
        endDate = endDate.split("-");
        fromDate = fromDate[0] + " " + months[parseInt(fromDate[1]) - 1] + " " + fromDate[2];
        endDate = endDate[0] + " " + months[parseInt(endDate[1]) - 1] + " " + endDate[2];

        Template.instance().fromDate.set(fromDate);
        Template.instance().endDate.set(endDate);
        templateObject.fiscalYearEnding.set(endDate);
        $("#dispEndDate").html("Dated: " + endDate);
    },

    "click .accountingBasisDropdown": function(e) {
        e.stopPropagation();
    },

    // "change .edtReportDates": function() {
    //     $(".fullScreenSpin").css("display", "inline-block");
    //     let templateObject = Template.instance();
    //     var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
    //     var dateTo = new Date($("#dateTo").datepicker("getDate"));
    //     templateObject.setReportOptions(0, dateFrom, dateTo);
    // },

    "click #btnaddAccountant": function() {
        FlowRouter.go("/reportsAccountantSettings");
    },

    "click .btnAddNewAccounts": function() {
        $("#add-account-title").text("Add New Account");
        $("#edtAccountID").val("");
        $("#sltAccountType").val("");
        $("#sltAccountType").removeAttr("readonly", true);
        $("#sltAccountType").removeAttr("disabled", "disabled");
        $("#edtAccountName").val("");
        $("#edtAccountName").attr("readonly", false);
        $("#edtAccountNo").val("");
        $("#sltTaxCode").val("NT" || "");
        $("#txaAccountDescription").val("");
        $("#edtBankAccountName").val("");
        $("#edtBSB").val("");
        $("#edtBankAccountNo").val("");
        $("#routingNo").val("");
        $("#edtBankName").val("");
        $("#swiftCode").val("");
        $(".showOnTransactions").prop("checked", false);
        $(".useReceiptClaim").prop("checked", false);
        $("#expenseCategory").val("");
        let availableCategories = Template.instance().availableCategories.get();
        let cateogoryHtml = "";
        availableCategories.forEach(function(item) {
            cateogoryHtml += '<option value="' + item + '">' + item + '</option>';
        });
        $("#expenseCategory").empty();
        $("#expenseCategory").append(cateogoryHtml);
        if (cateogoryHtml == "") {
            $("#expenseCategory").attr("readonly", true);
            $("#expenseCategory").attr("disabled", "disabled");
        } else {
            $("#expenseCategory").removeAttr("readonly", true);
            $("#expenseCategory").removeAttr("disabled", "disabled");
        }
        $(".isBankAccount").addClass("isNotBankAccount");
        $(".isCreditAccount").addClass("isNotCreditAccount");
    },

    "click .btnSaveAccount": function() {
        playSaveAudio();
        let templateObject = Template.instance();
        let accountService = new AccountService();
        let organisationService = new OrganisationService();
        setTimeout(function(){
        $(".fullScreenSpin").css("display", "inline-block");
        
        let forTransaction = false;
        let isHeader = false;
        let useReceiptClaim = false;

        if ($("#showOnTransactions").is(":checked")) {
            forTransaction = true;
        }
        if ($("#useReceiptClaim").is(":checked")) {
            useReceiptClaim = true;
        }

        if ($("#accountIsHeader").is(":checked")) {
            isHeader = true;
        }

        let accountID = $("#edtAccountID").val();
        var accounttype = $("#sltAccountType").val();
        var accountname = $("#edtAccountName").val();
        var accountno = $("#edtAccountNo").val();
        var taxcode = $("#sltTaxCode").val();
        var accountdesc = $("#txaAccountDescription").val();
        var swiftCode = $("#swiftCode").val();
        var routingNo = $("#routingNo").val();
        // var comments = $('#txaAccountComments').val();
        var bankname = $("#edtBankName").val();
        var bankaccountname = $("#edtBankAccountName").val();
        var bankbsb = $("#edtBSB").val();
        var bankacountno = $("#edtBankAccountNo").val();
        let isBankAccount = templateObject.isBankAccount.get();
        let expenseCategory = $("#expenseCategory").val();

        var expirydateTime = new Date($("#edtExpiryDate").datepicker("getDate"));
        let cardnumber = $("#edtCardNumber").val();
        let cardcvc = $("#edtCvc").val();
        let expiryDate =
            expirydateTime.getFullYear() +
            "-" +
            (expirydateTime.getMonth() + 1) +
            "-" +
            expirydateTime.getDate();

        let companyID = 1;
        let data = "";
        if (accountID == "") {
            accountService
                .getCheckAccountData(accountname)
                .then(function(data) {
                    accountID = parseInt(data.taccount[0].Id) || 0;
                    data = {
                        type: "TAccount",
                        fields: {
                            ID: accountID,
                            // AccountName: accountname|| '',
                            AccountNumber: accountno || "",
                            // AccountTypeName: accounttype|| '',
                            AccountGroup: expenseCategory || "", // Need to check if the field is right later
                            Active: true,
                            BankAccountName: bankaccountname || "",
                            BankAccountNumber: bankacountno || "",
                            BSB: bankbsb || "",
                            Description: accountdesc || "",
                            TaxCode: taxcode || "",
                            PublishOnVS1: true,
                            Extra: swiftCode,
                            BankNumber: routingNo,
                            IsHeader: isHeader,
                            AllowExpenseClaim: useReceiptClaim,
                            Required: forTransaction,
                            CarNumber: cardnumber || "",
                            CVC: cardcvc || "",
                            ExpiryDate: expiryDate || "",
                        },
                    };

                    accountService
                        .saveAccount(data)
                        .then(function(data) {
                            if ($("#showOnTransactions").is(":checked")) {
                                var objDetails = {
                                    type: "TCompanyInfo",
                                    fields: {
                                        Id: companyID,
                                        AccountNo: bankacountno,
                                        BankBranch: swiftCode,
                                        BankAccountName: bankaccountname,
                                        BankName: bankname,
                                        Bsb: bankbsb,
                                        SiteCode: routingNo,
                                        FileReference: accountname,
                                    },
                                };
                                organisationService
                                    .saveOrganisationSetting(objDetails)
                                    .then(function(data) {
                                        var accNo = bankacountno || "";
                                        var swiftCode1 = swiftCode || "";
                                        var bankAccName = bankaccountname || "";
                                        var accountName = accountname || "";
                                        var bsb = bankbsb || "";
                                        var routingNo = routingNo || "";

                                        localStorage.setItem("vs1companyBankName", bankname);
                                        localStorage.setItem(
                                            "vs1companyBankAccountName",
                                            bankAccName
                                        );
                                        localStorage.setItem("vs1companyBankAccountNo", accNo);
                                        localStorage.setItem("vs1companyBankBSB", bsb);
                                        localStorage.setItem("vs1companyBankSwiftCode", swiftCode1);
                                        localStorage.setItem("vs1companyBankRoutingNo", routingNo);
                                        sideBarService.getAccountListVS1().then(function(dataReload) {
                                            addVS1Data("TAccountVS1", JSON.stringify(dataReload)).then(function(datareturn) {
                                                window.open("/accountant_trust", "_self");
                                            }).catch(function(err) {
                                                window.open("/accountant_trust", "_self");
                                            });
                                        }).catch(function(err) {
                                            window.open("/accountant_trust", "_self");
                                        });
                                    })
                                    .catch(function(err) {
                                        sideBarService
                                            .getAccountListVS1()
                                            .then(function(dataReload) {
                                                addVS1Data("TAccountVS1", JSON.stringify(dataReload))
                                                    .then(function(datareturn) {
                                                        window.open("/accountant_trust", "_self");
                                                    })
                                                    .catch(function(err) {
                                                        window.open("/accountant_trust", "_self");
                                                    });
                                            })
                                            .catch(function(err) {
                                                window.open("/accountant_trust", "_self");
                                            });
                                    });
                            } else {
                                sideBarService
                                    .getAccountListVS1()
                                    .then(function(dataReload) {
                                        addVS1Data("TAccountVS1", JSON.stringify(dataReload))
                                            .then(function(datareturn) {
                                                window.open("/accountant_trust", "_self");
                                            })
                                            .catch(function(err) {
                                                window.open("/accountant_trust", "_self");
                                            });
                                    })
                                    .catch(function(err) {
                                        window.open("/accountant_trust", "_self");
                                    });
                            }
                        })
                        .catch(function(err) {
                            swal({
                                title: "Oooops...",
                                text: err,
                                type: "error",
                                showCancelButton: false,
                                confirmButtonText: "Try Again",
                            }).then((result) => {
                                if (result.value) {
                                    // Meteor._reload.reload();
                                } else if (result.dismiss === "cancel") {}
                            });
                            $(".fullScreenSpin").css("display", "none");
                        });
                })
                .catch(function(err) {
                    data = {
                        type: "TAccount",
                        fields: {
                            AccountName: accountname || "",
                            AccountNumber: accountno || "",
                            AccountTypeName: accounttype || "",
                            AccountGroup: expenseCategory || "", // Need to check if the field is right later
                            Active: true,
                            BankAccountName: bankaccountname || "",
                            BankAccountNumber: bankacountno || "",
                            BSB: bankbsb || "",
                            Description: accountdesc || "",
                            TaxCode: taxcode || "",
                            Extra: swiftCode,
                            BankNumber: routingNo,
                            PublishOnVS1: true,
                            IsHeader: isHeader,
                            AllowExpenseClaim: useReceiptClaim,
                            Required: forTransaction,
                            CarNumber: cardnumber || "",
                            CVC: cardcvc || "",
                            ExpiryDate: expiryDate || "",
                        },
                    };

                    accountService
                        .saveAccount(data)
                        .then(function(data) {
                            if ($("#showOnTransactions").is(":checked")) {
                                var objDetails = {
                                    type: "TCompanyInfo",
                                    fields: {
                                        Id: companyID,
                                        AccountNo: bankacountno,
                                        BankBranch: swiftCode,
                                        BankAccountName: bankaccountname,
                                        BankName: bankname,
                                        Bsb: bankbsb,
                                        SiteCode: routingNo,
                                        FileReference: accountname,
                                    },
                                };
                                organisationService
                                    .saveOrganisationSetting(objDetails)
                                    .then(function(data) {
                                        var accNo = bankacountno || "";
                                        var swiftCode1 = swiftCode || "";
                                        var bankName = bankaccountname || "";
                                        var accountName = accountname || "";
                                        var bsb = bankbsb || "";
                                        var routingNo = routingNo || "";
                                        localStorage.setItem("vs1companyBankName", bankname);
                                        localStorage.setItem(
                                            "vs1companyBankAccountName",
                                            bankAccName
                                        );
                                        localStorage.setItem("vs1companyBankAccountNo", accNo);
                                        localStorage.setItem("vs1companyBankBSB", bsb);
                                        localStorage.setItem("vs1companyBankSwiftCode", swiftCode1);
                                        localStorage.setItem("vs1companyBankRoutingNo", routingNo);
                                        sideBarService
                                            .getAccountListVS1()
                                            .then(function(dataReload) {
                                                addVS1Data("TAccountVS1", JSON.stringify(dataReload))
                                                    .then(function(datareturn) {
                                                        window.open("/accountant_trust", "_self");
                                                    })
                                                    .catch(function(err) {
                                                        window.open("/accountant_trust", "_self");
                                                    });
                                            })
                                            .catch(function(err) {
                                                window.open("/accountant_trust", "_self");
                                            });
                                    })
                                    .catch(function(err) {
                                        sideBarService
                                            .getAccountListVS1()
                                            .then(function(dataReload) {
                                                addVS1Data("TAccountVS1", JSON.stringify(dataReload))
                                                    .then(function(datareturn) {
                                                        //window.open('/accountant_trust', '_self');
                                                    })
                                                    .catch(function(err) {
                                                        window.open("/accountant_trust", "_self");
                                                    });
                                            })
                                            .catch(function(err) {
                                                window.open("/accountant_trust", "_self");
                                            });
                                    });
                            } else {
                                sideBarService
                                    .getAccountListVS1()
                                    .then(function(dataReload) {
                                        addVS1Data("TAccountVS1", JSON.stringify(dataReload))
                                            .then(function(datareturn) {
                                                window.open("/accountant_trust", "_self");
                                            })
                                            .catch(function(err) {
                                                window.open("/accountant_trust", "_self");
                                            });
                                    })
                                    .catch(function(err) {
                                        window.open("/accountant_trust", "_self");
                                    });
                            }
                        })
                        .catch(function(err) {
                            swal({
                                title: "Oooops...",
                                text: err,
                                type: "error",
                                showCancelButton: false,
                                confirmButtonText: "Try Again",
                            }).then((result) => {
                                if (result.value) {
                                    Meteor._reload.reload();
                                } else if (result.dismiss === "cancel") {}
                            });
                            $(".fullScreenSpin").css("display", "none");
                        });
                });
        } else {
            data = {
                type: "TAccount",
                fields: {
                    ID: accountID,
                    AccountName: accountname || "",
                    AccountNumber: accountno || "",
                    // AccountTypeName: accounttype || '',
                    AccountGroup: expenseCategory || "", // Need to check if the field is right later
                    Active: true,
                    BankAccountName: bankaccountname || "",
                    BankAccountNumber: bankacountno || "",
                    BSB: bankbsb || "",
                    Description: accountdesc || "",
                    TaxCode: taxcode || "",
                    Extra: swiftCode,
                    BankNumber: routingNo,
                    //Level4: bankname,
                    PublishOnVS1: true,
                    IsHeader: isHeader,
                    AllowExpenseClaim: useReceiptClaim,
                    Required: forTransaction,
                    CarNumber: cardnumber || "",
                    CVC: cardcvc || "",
                    ExpiryDate: expiryDate || "",
                },
            };

            accountService
                .saveAccount(data)
                .then(function(data) {
                    if ($("#showOnTransactions").is(":checked")) {
                        var objDetails = {
                            type: "TCompanyInfo",
                            fields: {
                                Id: companyID,
                                AccountNo: bankacountno,
                                BankBranch: swiftCode,
                                BankAccountName: bankaccountname,
                                BankName: bankname,
                                Bsb: bankbsb,
                                SiteCode: routingNo,
                                FileReference: accountname,
                            },
                        };
                        organisationService
                            .saveOrganisationSetting(objDetails)
                            .then(function(data) {
                                var accNo = bankacountno || "";
                                var swiftCode1 = swiftCode || "";
                                var bankAccName = bankaccountname || "";
                                var accountName = accountname || "";
                                var bsb = bankbsb || "";
                                var routingNo = routingNo || "";
                                localStorage.setItem("vs1companyBankName", bankname);
                                localStorage.setItem("vs1companyBankAccountName", bankAccName);
                                localStorage.setItem("vs1companyBankAccountNo", accNo);
                                localStorage.setItem("vs1companyBankBSB", bsb);
                                localStorage.setItem("vs1companyBankSwiftCode", swiftCode1);
                                localStorage.setItem("vs1companyBankRoutingNo", routingNo);
                                sideBarService
                                    .getAccountListVS1()
                                    .then(function(dataReload) {
                                        addVS1Data("TAccountVS1", JSON.stringify(dataReload))
                                            .then(function(datareturn) {
                                                window.open("/accountant_trust", "_self");
                                            })
                                            .catch(function(err) {
                                                window.open("/accountant_trust", "_self");
                                            });
                                    })
                                    .catch(function(err) {
                                        window.open("/accountant_trust", "_self");
                                    });
                            })
                            .catch(function(err) {
                                sideBarService
                                    .getAccountListVS1()
                                    .then(function(dataReload) {
                                        addVS1Data("TAccountVS1", JSON.stringify(dataReload))
                                            .then(function(datareturn) {
                                                window.open("/accountant_trust", "_self");
                                            })
                                            .catch(function(err) {
                                                window.open("/accountant_trust", "_self");
                                            });
                                    })
                                    .catch(function(err) {
                                        window.open("/accountant_trust", "_self");
                                    });
                            });
                    } else {
                        sideBarService
                            .getAccountListVS1()
                            .then(function(dataReload) {
                                addVS1Data("TAccountVS1", JSON.stringify(dataReload))
                                    .then(function(datareturn) {
                                        window.open("/accountant_trust", "_self");
                                    })
                                    .catch(function(err) {
                                        window.open("/accountant_trust", "_self");
                                    });
                            })
                            .catch(function(err) {
                                window.open("/accountant_trust", "_self");
                            });
                    }
                })
                .catch(function(err) {
                    swal({
                        title: "Oooops...",
                        text: err,
                        type: "error",
                        showCancelButton: false,
                        confirmButtonText: "Try Again",
                    }).then((result) => {
                        if (result.value) {
                            Meteor._reload.reload();
                        } else if (result.dismiss === "cancel") {}
                    });
                    $(".fullScreenSpin").css("display", "none");
                });
        }
    }, delayTimeAfterSound);
    },

    "change #sltAccountType": function(e) {
        let templateObject = Template.instance();
        var accountTypeName = $("#sltAccountType").val();

        if (accountTypeName === "BANK") {
            $(".isBankAccount").removeClass("isNotBankAccount");
            $(".isCreditAccount").addClass("isNotCreditAccount");
        } else if (accountTypeName === "CCARD") {
            $(".isCreditAccount").removeClass("isNotCreditAccount");
            $(".isBankAccount").addClass("isNotBankAccount");
        } else {
            $(".isBankAccount").addClass("isNotBankAccount");
            $(".isCreditAccount").addClass("isNotCreditAccount");
        }
        // $('.file-name').text(filename);
        // let selectedFile = event.target.files[0];
        // templateObj.selectedFile.set(selectedFile);
        // if($('.file-name').text() != ""){
        //   $(".btnImport").removeAttr("disabled");
        // }else{
        //   $(".btnImport").Attr("disabled");
        // }
    },

    'click .btnselAccountant': function(event) {
        const templateObject = Template.instance();
        let accountantList = templateObject.datatablerecords.get();

        let innerHtml = "";
        let accountantPanID = $(event.target).attr('id').split("-")[1];

        var total_balance = 0;
        for (var i = 0; i < accountantList.length; i++) {
            if ($("#f-" + accountantPanID + "-" + accountantList[i].id).prop('checked') == true) {
                innerHtml += "<div style='width: calc(100% - 12px); border-bottom: 1px solid #ccc; padding:0' id='row-" + accountantPanID + "-" + accountantList[i].id + "'>";
                innerHtml += "<div style='width:calc(100% - 100px); float:left; padding-top:4px'>" + accountantList[i].accountname + "</div>";
                innerHtml += "<div style='float:left; padding-top:4px; width:100px'>" + accountantList[i].balance + "</div>";
                innerHtml += "</div>";

                total_balance += accountantList[i].balanceNumber;
            }
        }

        if (accountantPanID == 13) {
            let beneficiaryPercent = total_balance / parseFloat(templateObject.totalEquity.get()) * 100;
            $("#beneficiaryPercent").html("<b>" + beneficiaryPercent.toFixed(2) + "%</b>");
            $("#beneficiaryPercentPrt").html("<b>" + beneficiaryPercent.toFixed(2) + "%</b>");
        }

        total_balance = utilityService.modifynegativeCurrencyFormat(total_balance) || 0.0;
        $("#reportAccPan" + accountantPanID).html(innerHtml);
        $("#reportAccPanPrt" + accountantPanID).html(innerHtml);
        $("#total" + accountantPanID + "_balance").html("<b>" + total_balance + "</b>");
        $("#total" + accountantPanID + "_prt_balance").html("<b>" + total_balance + "</b>");
        $("#accountList_" + accountantPanID).modal('toggle');
    },

    "click .btnPrintReport": function(event) {
        playPrintAudio();
        setTimeout(function(){
        $(".printReport").show();
        $("a").attr("href", "/");
        document.title = "Trust";
        $(".printReport").print({
            title: document.title + " | " + loggedCompany,
            noPrintSelector: ".addSummaryEditor",
            mediaPrint: false,
        });

        setTimeout(function() {
            $("a").attr("href", "#");
            $(".printReport").hide();
        }, 100);
    }, delayTimeAfterSound);
    },

    "click .btnExportReport": function() {
        $(".printReport").show();
        $('.fullScreenSpin').css('display', 'inline-block');
        var opt = {
            margin: 0.8,
            filename: 'accountant-trust.pdf',
            image: {
                type: 'jpeg',
                quality: 0.98
            },
            html2canvas: {
                scale: 2
            },
            jsPDF: {
                unit: 'in',
                format: 'a4',
                orientation: 'portrait'
            },
            pagebreak: {
                after: [".pagebreak"]
            }
        };
        var element = document.getElementById('printReport');

        // html2pdf(element);

        html2pdf().set(opt).from(element).save()
            .then(dataObject => {
                $(".printReport").hide();
                $('.fullScreenSpin').css('display', 'none');
            })
    },

    'click #tblCategory tbody tr': function(e) {
        let category = $(e.target).closest('tr').find(".colReceiptCategory").text() || '';
        let accountName = $(e.target).closest('tr').find(".colAccountName").text() || '';
        let accountID = $(e.target).closest('tr').find(".colAccountID").text() || '';

        $('#expenseCategory').val(category);
        $('#categoryAccountID').val(accountID);
        $('#categoryAccountName').val(accountName);

        $('#categoryListModal').modal('toggle');
    },

    "click #editTitle": function(event) {
        let iframe = document.getElementById("editor_ifr");
        $(iframe.contentWindow.document.getElementsByTagName("body")[0]).html($("#page-1-content").html());
        $("#editorType").val("title");
    },

    "click #editOrder": function(event) {
        let iframe = document.getElementById("editor_ifr");
        $(iframe.contentWindow.document.getElementsByTagName("body")[0]).html($("#page-2-content").html());
        $("#editorType").val("order");
    },

    "click #editSummary": function(event) {
        let iframe = document.getElementById("editor_ifr");
        $(iframe.contentWindow.document.getElementsByTagName("body")[0]).html($("#page-3-content").html());
        $("#editorType").val("summary");
    },

    "click #editDeclaration": function(event) {
        let iframe = document.getElementById("editor_ifr");
        $(iframe.contentWindow.document.getElementsByTagName("body")[0]).html($("#page-4-content").html());
        $("#editorType").val("declaration");
    },

    "click #editDescription-1": function(event) {
        let iframe = document.getElementById("editor_ifr");
        $(iframe.contentWindow.document.getElementsByTagName("body")[0]).html($("#page-9-content").html());
        $("#editorType").val("description-1");
    },

    "click #editDescription-2": function(event) {
        let iframe = document.getElementById("editor_ifr");
        $(iframe.contentWindow.document.getElementsByTagName("body")[0]).html($("#page-10-content").html());
        $("#editorType").val("description-2");
    },

    "click #btnSaveEditor": function(event) {
        playSaveAudio();
        setTimeout(function(){
        // $('#editor').wysiwyg();
        let iframe = document.getElementById("editor_ifr");
        var elmnt = $(iframe.contentWindow.document.getElementsByTagName("body")[0]).html();

        if ($("#editorType").val() == "title") {
            $("#page-1-content").html(elmnt);
            $("#page-1-content-prt").html(elmnt);
        } else if ($("#editorType").val() == "order") {
            $("#page-2-content").html(elmnt);
            $("#page-2-content-prt").html(elmnt);
        } else if ($("#editorType").val() == "summary") {
            $("#page-3-content").html(elmnt);
            $("#page-3-content-prt").html(elmnt);
        } else if ($("#editorType").val() == "declaration") {
            $("#page-4-content").html(elmnt);
            $("#page-4-content-prt").html(elmnt);
        } else if ($("#editorType").val() == "description-1") {
            $("#page-9-content").html(elmnt);
            $("#page-9-content-prt").html(elmnt + $("#page-10-content").html());
        } else {
            $("#page-10-content").html(elmnt);
            $("#page-9-content-prt").html($("#page-9-content").html() + elmnt);
        }
        $('#editReportModal').modal('toggle');
    }, delayTimeAfterSound);
    },
});

Template.accountant_trust.helpers({

    reportOptions: () => {
        return Template.instance().reportOptions.get();
    },

    formatDate(currentDate) {
        return moment(currentDate).format("DD/MM/YYYY");
    },

    tradingname: () => {
        let tradingname = (localStorage.getItem("tradingName"));
        return tradingname;
    },

    countryList: () => {
        return Template.instance().countryData.get();
    },
    datatablerecords: () => {
        return Template.instance()
            .datatablerecords.get()
            .sort(function(a, b) {
                if (a.accountname === "NA") {
                    return 1;
                } else if (b.accountname === "NA") {
                    return -1;
                }
                return a.accountname.toUpperCase() > b.accountname.toUpperCase() ?
                    1 :
                    -1;
            });
    },

    accountPanList: () => {
        return Template.instance().accountPanList.get();
    },

    accountPanList1: () => {
        return Template.instance().accountPanList1.get();
    },

    companyname: () => {
        let tradingname = localStorage.getItem("tradingName") || "";
        return loggedCompany + " trading as " + tradingname;
    },

    fiscalYearEnding: () => {
        return Template.instance().fiscalYearEnding.get();
    },

    dateAsAt: () => {
        return Template.instance().dateAsAt.get() || "-";
    },

    balancesheetList: () => {
        return Template.instance().balancesheetList.get();
    },

    profitList: () => {
        return Template.instance().profitList.get();
    },

    currentYear: () => {
        return Template.instance().currentYear.get();
    },

    currentMonth: () => {
        return Template.instance().currentMonth.get();
    },

    currentDate: () => {
        return Template.instance().currentDate.get();
    },

    fromDate: () => {
        return Template.instance().fromDate.get();
    },
    endDate: () => {
        return Template.instance().endDate.get();
    },
    convertAmount: (amount, currencyData) => {
        let currencyList = Template.instance().tcurrencyratehistory.get(); // Get tCurrencyHistory

        if (!amount || amount.trim() == "") {
            return "";
        }
        if (currencyData.code == defaultCurrencyCode) {
            // default currency
            return amount;
        }

        amount = utilityService.convertSubstringParseFloat(amount); // This will remove all currency symbol

        // Lets remove the minus character
        const isMinus = amount < 0;
        if (isMinus == true) amount = amount * -1; // Make it positive

        // Get the selected date
        let dateTo = $("#balancedate").val();
        const day = dateTo.split("/")[0];
        const m = dateTo.split("/")[1];
        const y = dateTo.split("/")[2];
        dateTo = new Date(y, m, day);
        dateTo.setMonth(dateTo.getMonth() - 1); // remove one month (because we added one before)

        // Filter by currency code
        currencyList = currencyList.filter((a) => a.Code == currencyData.code);

        // Sort by the closest date
        currencyList = currencyList.sort((a, b) => {
            a = GlobalFunctions.timestampToDate(a.MsTimeStamp);
            a.setHours(0);
            a.setMinutes(0);
            a.setSeconds(0);

            b = GlobalFunctions.timestampToDate(b.MsTimeStamp);
            b.setHours(0);
            b.setMinutes(0);
            b.setSeconds(0);

            var distancea = Math.abs(dateTo - a);
            var distanceb = Math.abs(dateTo - b);
            return distancea - distanceb; // sort a before b when the distance is smaller
        });

        const [firstElem] = currencyList; // Get the firest element of the array which is the closest to that date

        let rate = currencyData.code == defaultCurrencyCode ? 1 : firstElem.BuyRate; // Must used from tcurrecyhistory
        //amount = amount + 0.36;
        amount = parseFloat(amount * rate); // Multiply by the rate
        amount = Number(amount).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }); // Add commas

        let convertedAmount =
            isMinus == true ?
            `- ${currencyData.symbol} ${amount}` :
            `${currencyData.symbol} ${amount}`;

        return convertedAmount;
    },
    isBankAccount: () => {
        return Template.instance().isBankAccount.get();
    },
});