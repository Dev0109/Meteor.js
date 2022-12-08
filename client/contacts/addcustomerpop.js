import { ContactService } from "./contact-service";
import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../js/core-service';
import { UtilityService } from "../utility-service";
import { CountryService } from '../js/country-service';
import { PaymentsService } from '../payments/payments-service';
import { SideBarService } from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
import LoadingOverlay from "../LoadingOverlay";
let sideBarService = new SideBarService();
let utilityService = new UtilityService();

Template.addcustomerpop.onCreated(function () {
    const templateObject = Template.instance();
    templateObject.records = new ReactiveVar();
    templateObject.countryData = new ReactiveVar();
    templateObject.customerrecords = new ReactiveVar([]);
    templateObject.recentTrasactions = new ReactiveVar([]);
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.datatablerecordsjob = new ReactiveVar([]);
    templateObject.tableheaderrecordsjob = new ReactiveVar([]);
    templateObject.preferedPaymentList = new ReactiveVar();
    templateObject.termsList = new ReactiveVar();
    templateObject.deliveryMethodList = new ReactiveVar();
    templateObject.clienttypeList = new ReactiveVar();
    templateObject.taxCodeList = new ReactiveVar();
    templateObject.defaultsaletaxcode = new ReactiveVar();
    templateObject.defaultsaleterm = new ReactiveVar();
    templateObject.isJob = new ReactiveVar();
    templateObject.isJob.set(false);
    templateObject.isSameAddress = new ReactiveVar();
    templateObject.isSameAddress.set(false);
    templateObject.isJobSameAddress = new ReactiveVar();
    templateObject.isJobSameAddress.set(false);
    /* Attachments */
    templateObject.uploadedFile = new ReactiveVar();
    templateObject.uploadedFiles = new ReactiveVar([]);
    templateObject.attachmentCount = new ReactiveVar();
    templateObject.currentAttachLineID = new ReactiveVar();
    templateObject.uploadedFileJob = new ReactiveVar();
    templateObject.uploadedFilesJob = new ReactiveVar([]);
    templateObject.attachmentCountJob = new ReactiveVar();
    templateObject.uploadedFileJobNoPOP = new ReactiveVar();
    templateObject.uploadedFilesJobNoPOP = new ReactiveVar([]);
    templateObject.attachmentCountJobNoPOP = new ReactiveVar();
    templateObject.currentAttachLineIDJob = new ReactiveVar();
});

Template.addcustomerpop.onRendered(function () {
    let templateObject = Template.instance();
    let contactService = new ContactService();
    const countryService = new CountryService();
    let paymentService = new PaymentsService();
    const records = [];
    let countries = [];
    let preferedPayments = [];
    let terms = [];
    let deliveryMethods = [];
    let clientType = [];
    let taxCodes = [];

    let currentId = FlowRouter.current().queryParams;
    let customerID = '';
    let totAmount = 0;
    let totAmountOverDue = 0;

    const dataTableList = [];
    const dataTableListJob = [];
    const tableHeaderList = [];
    const tableHeaderListJob = [];

    let salestaxcode = '';
    setTimeout(function () {
        $(".addcustomerpop #dtAsOf").datepicker({
            showOn: 'button',
            buttonText: 'Show Date',
            buttonImageOnly: true,
            buttonImage: '/img/imgCal2.png',
            dateFormat: 'dd/mm/yy',
            showOtherMonths: true,
            selectOtherMonths: true,
            changeMonth: true,
            changeYear: true,
            yearRange: "-90:+10",
        });
    }, 100);

    Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblTransactionlist', function (error, result) {
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
                    // let columnindex = customcolumn[i].index + 1;
                    $("th." + columnClass + "").html(columData);
                    $("th." + columnClass + "").css('width', "" + columnWidth + "px");

                }
            }

        }
    });

    function MakeNegative() {
        $('td').each(function () {
            if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
        });
    }

    templateObject.getCountryData = function () {
        getVS1Data('TCountries').then(function (dataObject) {
            if (dataObject.length == 0) {
                countryService.getCountry().then((data) => {
                    for (let i = 0; i < data.tcountries.length; i++) {
                        countries.push(data.tcountries[i].Country)
                    }
                    countries.sort((a, b) => a.localeCompare(b));
                    templateObject.countryData.set(countries);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tcountries;
                for (let i = 0; i < useData.length; i++) {
                    countries.push(useData[i].Country)
                }
                countries.sort((a, b) => a.localeCompare(b));
                templateObject.countryData.set(countries);

            }
        }).catch(function (err) {
            countryService.getCountry().then((data) => {
                for (let i = 0; i < data.tcountries.length; i++) {
                    countries.push(data.tcountries[i].Country)
                }
                countries.sort((a, b) => a.localeCompare(b));
                templateObject.countryData.set(countries);
            });
        });
    };
    templateObject.getCountryData();

    templateObject.getPreferedPaymentList = function () {
        getVS1Data('TPaymentMethod').then(function (dataObject) {
            if (dataObject.length == 0) {
                contactService.getPaymentMethodDataVS1().then((data) => {
                    for (let i = 0; i < data.tpaymentmethodvs1.length; i++) {
                        preferedPayments.push(data.tpaymentmethodvs1[i].fields.PaymentMethodName)
                    }
                    preferedPayments = _.sortBy(preferedPayments);

                    templateObject.preferedPaymentList.set(preferedPayments);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tpaymentmethodvs1;
                for (let i = 0; i < useData.length; i++) {
                    preferedPayments.push(useData[i].fields.PaymentMethodName)
                }
                preferedPayments = _.sortBy(preferedPayments);
                templateObject.preferedPaymentList.set(preferedPayments);
            }
        }).catch(function (err) {
            contactService.getPaymentMethodDataVS1().then((data) => {
                for (let i = 0; i < data.tpaymentmethodvs1.length; i++) {
                    preferedPayments.push(data.tpaymentmethodvs1[i].fields.PaymentMethodName)
                }
                preferedPayments = _.sortBy(preferedPayments);

                templateObject.preferedPaymentList.set(preferedPayments);
            });
        });
    };
    templateObject.getTermsList = function () {
        getVS1Data('TTermsVS1').then(function (dataObject) {
            if (dataObject.length == 0) {
                contactService.getTermDataVS1().then((data) => {
                    for (let i = 0; i < data.ttermsvs1.length; i++) {
                        terms.push(data.ttermsvs1[i].TermsName);
                        if(data.ttermsvs1[i].isSalesdefault == true){
                            templateObject.defaultsaleterm.set(data.ttermsvs1[i].TermsName);
                            // $('.termsSelect').val(data.ttermsvs1[i].TermsName);
                        }
                    }
                    terms = _.sortBy(terms);
                    templateObject.termsList.set(terms);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.ttermsvs1;
                for (let i = 0; i < useData.length; i++) {
                    terms.push(useData[i].TermsName);
                    if(useData[i].isSalesdefault == true){
                        templateObject.defaultsaleterm.set(useData[i].TermsName);
                        //$('.termsSelect').val(useData[i].TermsName);
                    }
                }
                terms = _.sortBy(terms);
                templateObject.termsList.set(terms);

            }
        }).catch(function (err) {
            contactService.getTermDataVS1().then((data) => {
                for (let i = 0; i < data.ttermsvs1.length; i++) {
                    terms.push(data.ttermsvs1[i].TermsName);
                    if(data.ttermsvs1[i].isSalesdefault == true){
                        templateObject.defaultsaleterm.set(data.ttermsvs1[i].TermsName);
                    }
                }
                terms = _.sortBy(terms);
                templateObject.termsList.set(terms);
            });
        });
    };
    templateObject.getDeliveryMethodList = function () {
        getVS1Data('TShippingMethod').then(function (dataObject) {
            if (dataObject.length == 0) {
                contactService.getShippingMethodData().then((data) => {
                    for (let i = 0; i < data.tshippingmethod.length; i++) {
                        deliveryMethods.push(data.tshippingmethod[i].ShippingMethod)
                    }
                    deliveryMethods = _.sortBy(deliveryMethods);
                    templateObject.deliveryMethodList.set(deliveryMethods);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tshippingmethod;
                for (let i = 0; i < useData.length; i++) {
                    deliveryMethods.push(useData[i].ShippingMethod)
                }
                deliveryMethods = _.sortBy(deliveryMethods);
                templateObject.deliveryMethodList.set(deliveryMethods);

            }
        }).catch(function (err) {
            contactService.getShippingMethodData().then((data) => {
                for (let i = 0; i < data.tshippingmethod.length; i++) {
                    deliveryMethods.push(data.tshippingmethod[i].ShippingMethod)
                }
                deliveryMethods = _.sortBy(deliveryMethods);
                templateObject.deliveryMethodList.set(deliveryMethods);
            });
        });
    };
    templateObject.getClientTypeData = function () {
        getVS1Data('TClientType').then(function (dataObject) {
            if (dataObject.length == 0) {
                sideBarService.getClientTypeData().then((data) => {
                    for (let i = 0; i < data.tclienttype.length; i++) {
                        clientType.push(data.tclienttype[i].fields.TypeName)
                    }
                    clientType = _.sortBy(clientType);
                    templateObject.clienttypeList.set(clientType);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tclienttype;
                for (let i = 0; i < useData.length; i++) {
                    clientType.push(useData[i].fields.TypeName)
                }
                clientType = _.sortBy(clientType);
                templateObject.clienttypeList.set(clientType);
                //$('.customerTypeSelect option:first').prop('selected', false);
                $(".customerTypeSelect").attr('selectedIndex', 0);

            }
        }).catch(function (err) {
            sideBarService.getClientTypeData().then((data) => {
                for (let i = 0; i < data.tclienttype.length; i++) {
                    clientType.push(data.tclienttype[i].fields.TypeName)
                }
                clientType = _.sortBy(clientType);
                templateObject.clienttypeList.set(clientType);
            });
        });

    };
    templateObject.getTaxCodesList = function () {
        getVS1Data('TTaxcodeVS1').then(function (dataObject) {
            if (dataObject.length == 0) {
                contactService.getTaxCodesVS1().then((data) => {
                    for (let i = 0; i < data.ttaxcodevs1.length; i++) {
                        taxCodes.push(data.ttaxcodevs1[i].CodeName)
                    }
                    taxCodes = _.sortBy(taxCodes);
                    templateObject.taxCodeList.set(taxCodes);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.ttaxcodevs1;
                for (let i = 0; i < useData.length; i++) {
                    taxCodes.push(useData[i].CodeName)
                }
                taxCodes = _.sortBy(taxCodes);
                templateObject.taxCodeList.set(taxCodes);

            }
        }).catch(function (err) {
            contactService.getTaxCodesVS1().then((data) => {
                for (let i = 0; i < data.ttaxcodevs1.length; i++) {
                    taxCodes.push(data.ttaxcodevs1[i].CodeName)
                }
                taxCodes = _.sortBy(taxCodes);
                templateObject.taxCodeList.set(taxCodes);
            });
        });
    };
    templateObject.getPreferedPaymentList();
    templateObject.getTermsList();
    templateObject.getDeliveryMethodList();
    templateObject.getTaxCodesList();
    templateObject.getClientTypeData();

    //$('.addcustomerpop #sltCustomerType').append('<option value="' + lineItemObj.custometype + '">' + lineItemObj.custometype + '</option>');
    //if (currentId.id == "undefined") {
        let lineItemObj = {
            id: '',
            lid: 'Add Customer',
            company: '',
            email: '',
            title: '',
            firstname: '',
            middlename: '',
            lastname: '',
            tfn: '',
            phone: '',
            mobile: '',
            fax: '',
            shippingaddress: '',
            scity: '',
            sstate: '',
            terms: loggedTermsSales||templateObject.defaultsaleterm.get() || '',
            spostalcode: '',
            scountry: LoggedCountry || '',
            billingaddress: '',
            bcity: '',
            bstate: '',
            bpostalcode: '',
            bcountry: LoggedCountry || '',
            custFld1: '',
            custFld2: '',
            jobbcountry: LoggedCountry || '',
            jobscountry: LoggedCountry || '',
            discount:0
        }
        setTimeout(function () {
            $('.customerTypeSelect').append('<option value="newCust">Add Customer Type</option>');
        },500)
        templateObject.isSameAddress.set(true);
        templateObject.records.set(lineItemObj);
        setTimeout(function () {
            $('.addcustomerpop #tblTransactionlist').DataTable();
            if (currentId.transTab == 'active') {
                $('.customerTab').removeClass('active');
                $('.transactionTab').trigger('click');
            }else if (currentId.transTab == 'job') {
                $('.customerTab').removeClass('active');
                $('.jobTab').trigger('click');
            }else{
                $('.customerTab').addClass('active');
                $('.customerTab').trigger('click');
            }

        }, 500);

    templateObject.getCustomersList = function () {
        getVS1Data('TCustomerVS1').then(function (dataObject) {
            if (dataObject.length == 0) {
                contactService.getAllCustomerSideDataVS1().then(function (data) {
                    let lineItems = [];
                    let lineItemObj = {};
                    for (let i = 0; i < data.tcustomervs1.length; i++) {
                        let classname = '';
                        if (!isNaN(currentId.id)) {
                            if (data.tcustomervs1.Id == parseInt(currentId.id)) {
                                classname = 'currentSelect';
                            }
                        }
                        if (!isNaN(currentId.jobid)) {
                            if (data.tcustomervs1.Id == parseInt(currentId.jobid)) {
                                classname = 'currentSelect';
                            }
                        }
                        var dataList = {
                            id: data.tcustomervs1[i].Id || '',
                            company: data.tcustomervs1[i].ClientName || '',
                            isslectJob: data.tcustomervs1[i].IsJob || false,
                            classname: classname
                        };
                        lineItems.push(dataList);
                    }
                    templateObject.customerrecords.set(lineItems);
                    if (templateObject.customerrecords.get()) {
                        setTimeout(function () {
                            $('.counter').text(lineItems.length + ' items');
                        }, 100);
                    }
                }).catch(function (err) {
                    //Bert.alert('<strong>' + err + '</strong>!', 'danger');

                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tcustomervs1;
                let lineItems = [];
                let lineItemObj = {};

                for (let i = 0; i < useData.length; i++) {
                    let classname = '';
                    if (!isNaN(currentId.id)) {
                        if (useData[i].fields.ID == parseInt(currentId.id)) {
                            classname = 'currentSelect';
                        }
                    }
                    if (!isNaN(currentId.jobid)) {
                        if (useData[i].fields.ID == parseInt(currentId.jobid)) {
                            classname = 'currentSelect';
                        }
                    }
                    const dataList = {
                        id: useData[i].fields.ID || '',
                        company: useData[i].fields.ClientName || '',
                        isslectJob: useData[i].fields.IsJob || false,
                        classname: classname
                    };
                    lineItems.push(dataList);
                }
                templateObject.customerrecords.set(lineItems);
                if (templateObject.customerrecords.get()) {
                    setTimeout(function () {
                        $('.counter').text(lineItems.length + ' items');
                    }, 100);
                }
            }
        }).catch(function (err) {
            contactService.getAllCustomerSideDataVS1().then(function (data) {
                let lineItems = [];
                let lineItemObj = {};
                for (let i = 0; i < data.tcustomervs1.length; i++) {
                    let classname = '';
                    if (!isNaN(currentId.id)) {
                        if (data.tcustomervs1.Id == parseInt(currentId.id)) {
                            classname = 'currentSelect';
                        }
                    }
                    if (!isNaN(currentId.jobid)) {
                        if (data.tcustomervs1.Id == parseInt(currentId.jobid)) {
                            classname = 'currentSelect';
                        }
                    }
                    const dataList = {
                        id: data.tcustomervs1[i].Id || '',
                        company: data.tcustomervs1[i].ClientName || '',
                        isslectJob: data.tcustomervs1[i].IsJob || false,
                        classname: classname
                    };
                    lineItems.push(dataList);
                }
                templateObject.customerrecords.set(lineItems);
                if (templateObject.customerrecords.get()) {
                    setTimeout(function () {
                        $('.counter').text(lineItems.length + ' items');
                    }, 100);
                }
            }).catch(function (err) {
                //Bert.alert('<strong>' + err + '</strong>!', 'danger');
            });
        });
    }
    templateObject.getCustomersList();

    setTimeout(function () {
        const x = window.matchMedia("(max-width: 1024px)");
        function mediaQuery(x) {
            if (x.matches) {
                $(".addcustomerpop #displayList").removeClass("col-2");
                $(".addcustomerpop #displayList").addClass("col-3");
                $(".addcustomerpop #displayInfo").removeClass("col-10");
                $(".addcustomerpop #displayInfo").addClass("col-9");
            }
        }
        mediaQuery(x)
        x.addListener(mediaQuery)
    }, 500);
    setTimeout(function () {

        var x = window.matchMedia("(max-width: 420px)");
        // var btnView = document.getElementById("btnsViewHide");


        function mediaQuery(x) {
            if (x.matches) {

                $(".addcustomerpop #displayList").removeClass("col-3");
                $(".addcustomerpop #displayList").addClass("col-12");
                $(".addcustomerpop #customerListCard").removeClass("cardB");
                $(".addcustomerpop #customerListCard").addClass("cardB420");
                // btnsViewHide.style.display = "none";

                $(".addcustomerpop #displayInfo").removeClass("col-9");
                $(".addcustomerpop #displayInfo").addClass("col-12");
            }
        }
        mediaQuery(x)
        x.addListener(mediaQuery)

    }, 500);

});

Template.addcustomerpop.events({
    'click .tblJoblist tbody tr': function (event) {
        const listData = $(event.target).closest('tr').attr('id');
        if (listData) {
            window.open('/customerscard?jobid=' + listData, '_self');
        }
    },
    'click #customerShipping-1': function (event) {
        if ($(event.target).is(':checked')) {
            $('.customerShipping-2').css('display', 'none');
        } else {
            $('.customerShipping-2').css('display', 'block');
        }
    },
    'click .btnBack': function (event) {
        playCancelAudio();
        // event.preventDefault();
        setTimeout(function(){
            history.back(1);
        }, delayTimeAfterSound);
        //FlowRouter.go('/customerlist');
    },
    'click .btnSaveDept': function (e) {
        playSaveAudio();
        LoadingOverlay.show();
        let contactService = new ContactService();
        setTimeout(function(){

        //let headerDept = $('.addcustomerpop #sltDepartment').val();
        let custType = $('.addcustomerpop #edtDeptName').val();
        let typeDesc = $('.addcustomerpop #txaDescription').val() || '';
        if (custType === '') {
            swal('Client Type name cannot be blank!', '', 'warning');
            e.preventDefault();
        } else {
            let objDetails = {
                type: "TClientType",
                fields: {
                    TypeName: custType,
                    TypeDescription: typeDesc,
                }
            }
            contactService.saveClientTypeData(objDetails).then(function (objDetails) {
                sideBarService.getClientTypeData().then(function(dataReload) {
                    addVS1Data('TClientType', JSON.stringify(dataReload)).then(function (datareturn) {
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
                    } else if (result.dismiss === 'cancel') {

                    }
                });
            });
        }
        // if(deptID == ""){

        //     taxRateService.checkDepartmentByName(deptName).then(function (data) {
        //         deptID = data.tdeptclass[0].Id;
        //         objDetails = {
        //             type: "TDeptClass",
        //             fields: {
        //                 ID: deptID||0,
        //                 Active: true,
        //                 //DeptClassGroup: headerDept,
        //                 //DeptClassName: deptName,
        //                 Description: deptDesc,
        //                 SiteCode: siteCode,
        //                 StSClass: objStSDetails
        //             }
        //         };

        //         taxRateService.saveDepartment(objDetails).then(function (objDetails) {
        //             Meteor._reload.reload();
        //         }).catch(function (err) {
        //             swal({
        //                 title: 'Oooops...',
        //                 text: err,
        //                 type: 'error',
        //                 showCancelButton: false,
        //                 confirmButtonText: 'Try Again'
        //             }).then((result) => {
        //                 if (result.value) {
        //                     // Meteor._reload.reload();
        //                 } else if (result.dismiss === 'cancel') {

        //                 }
        //             });
        //
        //         });

        //     }).catch(function (err) {
        //         objDetails = {
        //             type: "TDeptClass",
        //             fields: {
        //                 Active: true,
        //                 DeptClassName: deptName,
        //                 Description: deptDesc,
        //                 SiteCode: siteCode,
        //                 StSClass: objStSDetails
        //             }
        //         };

        //         taxRateService.saveDepartment(objDetails).then(function (objDetails) {
        //             Meteor._reload.reload();
        //         }).catch(function (err) {
        //             swal({
        //                 title: 'Oooops...',
        //                 text: err,
        //                 type: 'error',
        //                 showCancelButton: false,
        //                 confirmButtonText: 'Try Again'
        //             }).then((result) => {
        //                 if (result.value) {
        //                     // Meteor._reload.reload();
        //                 } else if (result.dismiss === 'cancel') {

        //                 }
        //             });
        //
        //         });
        //     });

        // }else{
        //     objDetails = {
        //         type: "TDeptClass",
        //         fields: {
        //             ID: deptID,
        //             Active: true,
        //             //  DeptClassGroup: headerDept,
        //             DeptClassName: deptName,
        //             Description: deptDesc,
        //             SiteCode: siteCode,
        //             StSClass: objStSDetails
        //         }
        //     };

        //     taxRateService.saveDepartment(objDetails).then(function (objDetails) {
        //         Meteor._reload.reload();
        //     }).catch(function (err) {
        //         swal({
        //             title: 'Oooops...',
        //             text: err,
        //             type: 'error',
        //             showCancelButton: false,
        //             confirmButtonText: 'Try Again'
        //         }).then((result) => {
        //             if (result.value) {
        //                 // Meteor._reload.reload();
        //             } else if (result.dismiss === 'cancel') {

        //             }
        //         });
        //
        //     });
        // }
    }, delayTimeAfterSound);
    },
    'click .addcustomerpop #chkCustomerSameAsShipping': function (event) {
        if($(event.target).is(':checked')){
            $('.addcustomerpop .billingaddress').removeClass('show');
            let streetAddress = $('.addcustomerpop #edtCustomerShippingAddress').val();
            let city = $('.addcustomerpop #edtCustomerShippingCity').val();
            let state =  $('.addcustomerpop #edtCustomerShippingState').val();
            let zipcode =  $('.addcustomerpop #edtCustomerShippingZIP').val();
            let country =  $('.addcustomerpop #sedtCountry').val();

            $('.addcustomerpop #edtCustomerBillingAddress').val(streetAddress);
            $('.addcustomerpop #edtCustomerBillingCity').val(city);
            $('.addcustomerpop #edtCustomerBillingState').val(state);
            $('.addcustomerpop #edtCustomerBillingZIP').val(zipcode);
            $('.addcustomerpop #bedtCountry').val(country);
        }else{
            $('.addcustomerpop .billingaddress').addClass('show');

            $('.addcustomerpop #edtCustomerBillingAddress').val('');
            $('.addcustomerpop #edtCustomerBillingCity').val('');
            $('.addcustomerpop #edtCustomerBillingState').val('');
            $('.addcustomerpop #edtCustomerBillingZIP').val('');
            $('.addcustomerpop #bedtCountry').val('');
        }

    },
    'click .addcustomerpop .btnSaveCustPOP': async function (event) {
        playSaveAudio();
        let templateObject = Template.instance();
        let contactService = new ContactService();
        setTimeout(async function(){

        LoadingOverlay.show();
        let customerPOPID = $('.addcustomerpop #edtCustomerPOPID').val();
        let company = $('.addcustomerpop #edtCustomerCompany').val();
        let email = $('.addcustomerpop #edtCustomerPOPEmail').val();
        let title = $('.addcustomerpop #edtTitle').val();
        let firstname = $('.addcustomerpop #edtFirstName').val();
        let middlename = $('.addcustomerpop #edtMiddleName').val();
        let lastname = $('.addcustomerpop #edtLastName').val();
        // let suffix = $('.addcustomerpop #edtSuffix').val();
        let phone = $('.addcustomerpop #edtCustomerPhone').val();
        let mobile = $('.addcustomerpop #edtCustomerMobile').val();
        if(mobile && mobile !== '') {
            mobile = contactService.changeMobileFormat(mobile)
         }
        let fax = $('.addcustomerpop #edtCustomerFax').val();
        let accountno = $('.addcustomerpop #edtClientNo').val();
        let skype = $('.addcustomerpop #edtCustomerSkypeID').val();
        let website = $('.addcustomerpop #edtCustomerWebsite').val();

        let streetAddress = $('.addcustomerpop #edtCustomerShippingAddress').val();
        let city = $('.addcustomerpop #edtCustomerShippingCity').val();
        let state = $('.addcustomerpop #edtCustomerShippingState').val();
        let postalcode = $('.addcustomerpop #edtCustomerShippingZIP').val();
        let country = $('.addcustomerpop #sedtCountry').val();
        let bstreetAddress = '';
        let bcity = '';
        let bstate = '';
        let bzipcode = '';
        let bcountry = '';
        let isSupplier = false;
        isSupplier = !!$('.addcustomerpop #chkCustomerSameAsShipping').is(':checked');
        if ($('.addcustomerpop #chkCustomerSameAsShipping').is(':checked')) {
            bstreetAddress = streetAddress;
            bcity = city;
            bstate = state;
            bzipcode = postalcode;
            bcountry = country;
        } else {
            bstreetAddress = $('.addcustomerpop #edtCustomerBillingAddress').val();
            bcity = $('.addcustomerpop #edtCustomerBillingCity').val();
            bstate = $('.addcustomerpop #edtCustomerBillingState').val();
            bzipcode = $('.addcustomerpop #edtCustomerBillingZIP').val();
            bcountry = $('.addcustomerpop #bedtCountry').val();
        }

        let sltPaymentMethodName = $('.addcustomerpop #sltPreferedPayment').val();
        let sltTermsName = $('.addcustomerpop #sltTermsPOP').val();
        let sltShippingMethodName = '';
        let rewardPointsOpeningBalance = $('.addcustomerpop #custOpeningBalance').val();
        // let sltRewardPointsOpeningDate =  $('.addcustomerpop #dtAsOf').val();
        const sltRewardPointsOpeningDate = new Date($(".addcustomerpop #dtAsOf").datepicker("getDate"));
        let openingDate = sltRewardPointsOpeningDate.getFullYear() + "-" + (sltRewardPointsOpeningDate.getMonth() + 1) + "-" + sltRewardPointsOpeningDate.getDate();
        let sltTaxCodeName = "";
        let isChecked = $(".addcustomerpop .chkTaxExempt").is(":checked");
        if (isChecked) {
            sltTaxCodeName = "NT";
        } else {
            sltTaxCodeName = $('.addcustomerpop #sltTaxCode').val();
        }

        let permanentDiscount = $('.addcustomerpop #edtCustomerCardDiscount').val()||0;
        let notes = $('.addcustomerpop #txaNotes').val();
        let custField1 = $('.addcustomerpop #edtCustomeField1').val();
        let custField2 = $('.addcustomerpop #edtCustomeField2').val();
        let custField3 = $('.addcustomerpop #edtCustomeField3').val();
        let custField4 = $('.addcustomerpop #edtCustomeField4').val();
        let customerType = $('.addcustomerpop #sltCustomerType').val()||'';
        let uploadedItems = templateObject.uploadedFiles.get();

        const url = FlowRouter.current().path;
        const getemp_id = url.split('?id=');
        const currentEmployee = getemp_id[getemp_id.length - 1];
        let objDetails = '';

        let custdupID = 0;
            if(customerPOPID != ''){
              objDetails = {
                  type: "TCustomerEx",
                  fields: {
                      ID: parseInt(customerPOPID) || 0,
                      Title: title,
                      ClientName: company,
                      FirstName: firstname,
                      CUSTFLD10: middlename,
                      LastName: lastname,
                      PublishOnVS1: true,
                      Email: email,
                      Phone: phone,
                      Mobile: mobile,
                      SkypeName: skype,
                      Faxnumber: fax,
                      ClientTypeName: customerType,
                      Street: streetAddress,
                      Street2: city,
                      Suburb: city,
                      State: state,
                      PostCode: postalcode,
                      Country: country,
                      BillStreet: bstreetAddress,
                      BillStreet2: bcity,
                      BillState: bstate,
                      BillPostCode: bzipcode,
                      Billcountry: bcountry,
                      IsSupplier:isSupplier,
                      Notes: notes,
                      URL: website,
                      PaymentMethodName: sltPaymentMethodName || "",
                      TermsName: sltTermsName,
                      ShippingMethodName: sltShippingMethodName,
                      TaxCodeName: sltTaxCodeName,
                      Attachments: uploadedItems,
                      CUSTFLD1: custField1,
                      CUSTFLD2: custField2,
                      CUSTFLD3: custField3,
                      CUSTFLD4: custField4,
                      Discount:parseFloat(permanentDiscount)||0
                  }
              };
            }else{
            let checkCustData = await contactService.getCheckCustomersData(company);
            if (checkCustData.tcustomer.length) {
                custdupID = checkCustData.tcustomer[0].Id;
                objDetails = {
                    type: "TCustomerEx",
                    fields: {
                        ID: custdupID || 0,
                        Title: title,
                        ClientName: company,
                        FirstName: firstname,
                        CUSTFLD10: middlename,
                        LastName: lastname,
                        PublishOnVS1: true,
                        Email: email,
                        Phone: phone,
                        Mobile: mobile,
                        SkypeName: skype,
                        Faxnumber: fax,
                        ClientTypeName: customerType,
                        Street: streetAddress,
                        Street2: city,
                        Suburb: city,
                        State: state,
                        PostCode: postalcode,
                        Country: country,
                        BillStreet: bstreetAddress,
                        BillStreet2: bcity,
                        BillState: bstate,
                        BillPostCode: bzipcode,
                        Billcountry: bcountry,
                        IsSupplier:isSupplier,
                        Notes: notes,
                        URL: website,
                        PaymentMethodName: sltPaymentMethodName || "",
                        TermsName: sltTermsName,
                        ShippingMethodName: sltShippingMethodName,
                        TaxCodeName: sltTaxCodeName,
                        Attachments: uploadedItems,
                        CUSTFLD1: custField1,
                        CUSTFLD2: custField2,
                        CUSTFLD3: custField3,
                        CUSTFLD4: custField4,
                        Discount:parseFloat(permanentDiscount)||0
                    }
                };
            } else {
                objDetails = {
                    type: "TCustomerEx",
                    fields: {
                        Title: title,
                        ClientName: company,
                        FirstName: firstname,
                        CUSTFLD10: middlename,
                        LastName: lastname,
                        PublishOnVS1: true,
                        Email: email,
                        Phone: phone,
                        Mobile: mobile,
                        SkypeName: skype,
                        Faxnumber: fax,
                        ClientTypeName: customerType,
                        Street: streetAddress,
                        Street2: city,
                        Suburb: city,
                        State: state,
                        PostCode: postalcode,
                        Country: country,
                        BillStreet: bstreetAddress,
                        BillStreet2: bcity,
                        BillState: bstate,
                        BillPostCode: bzipcode,
                        Billcountry: bcountry,
                        IsSupplier:isSupplier,
                        Notes: notes,
                        URL: website,
                        PaymentMethodName: sltPaymentMethodName || "",
                        TermsName: sltTermsName,
                        ShippingMethodName: sltShippingMethodName,
                        TaxCodeName: sltTaxCodeName,
                        Attachments: uploadedItems,
                        CUSTFLD1: custField1,
                        CUSTFLD2: custField2,
                        CUSTFLD3: custField3,
                        CUSTFLD4: custField4,
                        Discount:parseFloat(permanentDiscount)||0
                    }
                };
            };

          }


        contactService.saveCustomerEx(objDetails).then(function (objDetails) {
            let customerSaveID = objDetails.fields.ID;
            $('.fullScreenSpin').css('display', 'none');
            if (customerSaveID) {
                var currentLoc = FlowRouter.current().route.path;
                if (currentLoc == "/invoicecard" || currentLoc == "/quotecard" || currentLoc == "/salesordercard"|| currentLoc == "/refundcard") {
                    $('.salesmodule #edtCustomerName').val(company);
                    $('.salesmodule #edtCustomerEmail').val(email);
                    $('.salesmodule #edtCustomerEmail').attr('customerid', customerSaveID);
                    $('.salesmodule #edtCustomerEmail').attr('customerfirstname', firstname);
                    $('.salesmodule #edtCustomerEmail').attr('customerlastname', lastname);
                    $('.salesmodule #edtCustomerName').attr("custid", customerSaveID);
                    var postalAddress = company + '\n' + streetAddress + '\n' + city + ' ' + state + '\n' + country;
                    $('.salesmodule #txabillingAddress').val(postalAddress);
                    $('.salesmodule #pdfCustomerAddress').html(postalAddress);
                    $('.salesmodule .pdfCustomerAddress').text(postalAddress);
                    $('.salesmodule #txaShipingInfo').val(postalAddress);
                    $('.salesmodule #sltTerms').val(sltTermsName);
                }else if (currentLoc == "/billcard" || currentLoc == "/purchaseordercard") {
                    var selectLineID = $('.addcustomerpop #customerSelectLineID').val();
                    $('.addcustomerpop #' + selectLineID + " .lineCustomerJob").val(company);

                }else if (currentLoc == "/payrolloverview" ) {
                      $(".addcustomerpop #sltJob").text(company);
                }else if (currentLoc == "/timesheet") {
                    var selectLineID = $('.addcustomerpop #selectLineID').val();
                    if(selectLineID != ''){
                      $('.addcustomerpop #' + selectLineID + " .sltJobOne").text(company);
                    }else{
                      $(".addcustomerpop #sltJob").text(company);
                    }


                }else if (currentLoc == "/depositcard" ) {
                  var selectLineID = $('.addcustomerpop #customerSelectLineID').val();
                  $('.addcustomerpop #' + selectLineID + " .lineCompany").val(company);
                }else {
                    sideBarService.getAllCustomersDataVS1(initialBaseDataLoad, 0).then(function (dataReload) {
                        addVS1Data('TCustomerVS1', JSON.stringify(dataReload)).then(function (datareturn) {
                            $('.setup-wizard') ? $('.setup-wizard .setup-step-7 .btnRefresh').click() : location.reload();
                        }).catch(function (err) {
                            $('.setup-wizard') ? $('.setup-wizard .setup-step-7 .btnRefresh').click() : location.reload();
                        });
                    }).catch(function (err) {
                        $('.setup-wizard') ? $('.setup-wizard .setup-step-7 .btnRefresh').click() : location.reload();
                    });
                }

                $('.addcustomerpop #addCustomerModal').modal('toggle');
                sideBarService.getAllCustomersDataVS1(initialBaseDataLoad, 0).then(function (dataReload) {
                    addVS1Data('TCustomerVS1', JSON.stringify(dataReload)).then(function (datareturn) {

                    }).catch(function (err) {
                    });
                }).catch(function (err) {
                });
            }

            $('.modal.show').modal('hide');
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
            LoadingOverlay.hide();
        });
    }, delayTimeAfterSound);
    },
    'click .addcustomerpop .btnSaveJob': function (event) {
        playSaveAudio();
        let templateObject = Template.instance();
        let contactService = new ContactService();

        setTimeout(function(){
        LoadingOverlay.show();
        let companyJob = $('.addcustomerpop #edtJobCustomerCompany').val();
        let companyParent = $('.addcustomerpop #edtParentJobCustomerCompany').val();

        let addressValid = false;
        let emailJob = $('.addcustomerpop #edtJobCustomerEmail').val();
        let titleJob = $('.addcustomerpop #edtJobTitle').val();
        let firstnameJob = $('.addcustomerpop #edtJobFirstName').val();
        let middlenameJob = $('.addcustomerpop #edtJobMiddleName').val();
        let lastnameJob = $('.addcustomerpop #edtJobLastName').val();
        // let suffixJob = $('.addcustomerpop #edtSuffix').val();
        let phoneJob = $('.addcustomerpop #edtJobCustomerPhone').val();
        let mobileJob = $('.addcustomerpop #edtJobCustomerMobile').val();
        let faxJob = $('.addcustomerpop #edtJobCustomerFax').val();
        // let accountnoJob = $('.addcustomerpop #edtClientNo').val();
        let skypeJob = $('.addcustomerpop #edtJobCustomerSkypeID').val();
        let websiteJob = $('.addcustomerpop #edtJobCustomerWebsite').val();

        let jobTitle = $('.addcustomerpop #edtJob_Title').val();
        let jobName = $('.addcustomerpop #edtJobName').val();
        let jobNumber = $('.addcustomerpop #edtJobNumber').val();
        let jobReg = $('.addcustomerpop #edtJobReg').val();



        let bstreetAddressJob = '';
        let bcityJob = '';
        let bstateJob = '';
        let bzipcodeJob = '';
        let bcountryJob = '';

        let streetAddressJob = '';
        let cityJob = '';
        let stateJob = '';
        let postalcodeJob = '';
        let countryJob = '';

        if ($('.addcustomerpop #chkJobSameAsShipping2').is(':checked')) {


            streetAddressJob = $('.tab-Job4 #edtJobCustomerShippingAddress').val();
            cityJob = $('.tab-Job4 #edtJobCustomerShippingCity').val();
            stateJob = $('.tab-Job4 #edtJobCustomerShippingState').val();
            postalcodeJob = $('.tab-Job4 #edtJobCustomerShippingZIP').val();
            countryJob = $('.tab-Job4 #sedtJobCountry').val();

            bstreetAddressJob = streetAddressJob;
            bcityJob = cityJob;
            bstateJob = stateJob;
            bzipcodeJob = postalcodeJob;
            bcountryJob = countryJob;
            addressValid = true;
        } else if ($('.addcustomerpop #chkJobSameAsShipping2NoPOP').is(':checked')) {
            streetAddressJob = $('.addcustomerpop #edtJobCustomerShippingAddress').val();
            cityJob = $('.addcustomerpop #edtJobCustomerShippingCity').val();
            stateJob = $('.addcustomerpop #edtJobCustomerShippingState').val();
            postalcodeJob = $('.addcustomerpop #edtJobCustomerShippingZIP').val();
            countryJob = $('.addcustomerpop #sedtJobCountry').val();

            bstreetAddressJob = streetAddressJob;
            bcityJob = cityJob;
            bstateJob = stateJob;
            bzipcodeJob = postalcodeJob;
            bcountryJob = countryJob;
        } else {
            bstreetAddressJob = $('.addcustomerpop #edtCustomerBillingAddress').val();
            bcityJob = $('.addcustomerpop #edtJobCustomerBillingCity').val();
            bstateJob = $('.addcustomerpop #edtJobCustomerBillingState').val();
            bzipcodeJob = $('.addcustomerpop #edtJobCustomerBillingZIP').val();
            bcountryJob = $('.addcustomerpop #sJobedtCountry').val();
        }



        let sltPaymentMethodNameJob = $('.addcustomerpop #sltJobPreferedPayment').val() || 'Cash';
        let sltTermsNameJob = $('.addcustomerpop #sltJobTerms').val();
        let sltShippingMethodNameJob = $('.addcustomerpop #sltJobDeliveryMethod').val();
        let rewardPointsOpeningBalanceJob = $('.addcustomerpop #custJobOpeningBalance').val();

        var sltRewardPointsOpeningDateJob = new Date($(".addcustomerpop #dtJobAsOf").datepicker("getDate"));

        let openingDateJob = sltRewardPointsOpeningDateJob.getFullYear() + "-" + (sltRewardPointsOpeningDateJob.getMonth() + 1) + "-" + sltRewardPointsOpeningDateJob.getDate();

        // let sltTaxCodeNameJob =  $('.addcustomerpop #sltJobTaxCode').val();
        let uploadedItemsJob = templateObject.uploadedFilesJob.get();
        let uploadedItemsJobNoPOP = templateObject.uploadedFilesJobNoPOP.get();


        let sltTaxCodeNameJob = "";

        let isChecked = $(".chkJobTaxExempt").is(":checked");
        if (isChecked) {
            sltTaxCodeNameJob = "NT";
        } else {
            sltTaxCodeNameJob = $('.addcustomerpop #sltJobTaxCode').val();
        }


        let notesJob = $('.addcustomerpop #txaJobNotes').val();

        var objDetails = '';
        var url = FlowRouter.current().path;
        var getemp_id = url.split('?jobid=');
        var currentEmployeeJob = getemp_id[getemp_id.length - 1];
        var objDetails = '';
        if (getemp_id[1]) {

            objDetails = {
                type: "TJobEx",
                fields: {
                    ID: currentEmployeeJob,
                    Title: $('.jobTabEdit #edtJobTitle').val() || '',
                    //clientName:companyJob,
                    ParentClientName: $('.jobTabEdit #edtParentJobCustomerCompany').val() || '',
                    ParentCustomerName: $('.jobTabEdit #edtParentJobCustomerCompany').val() || '',
                    FirstName: $('.jobTabEdit #edtJobFirstName').val() || '',
                    MiddleName: $('.jobTabEdit #edtJobMiddleName').val() || '',
                    LastName: $('.jobTabEdit #edtJobLastName').val() || '',
                    Email: $('.jobTabEdit #edtJobCustomerEmail').val() || '',
                    Phone: $('.jobTabEdit #edtJobCustomerPhone').val() || '',
                    Mobile: $('.jobTabEdit #edtJobCustomerMobile').val() || '',
                    SkypeName: $('.jobTabEdit #edtJobCustomerSkypeID').val() || '',
                    Street: streetAddressJob,
                    Street2: cityJob,
                    State: stateJob,
                    PostCode: postalcodeJob,
                    Country: $('.tab-Job4 #sedtJobCountry').val(),
                    BillStreet: bstreetAddressJob,
                    BillStreet2: bcityJob,
                    BillState: bstateJob,
                    BillPostCode: bzipcodeJob,
                    Billcountry: bcountryJob,
                    Notes: $('.tab-Job5 #txaJobNotes').val(),
                    CUSTFLD9: $('.jobTabEdit #edtJobCustomerWebsite').val() || '',
                    PaymentMethodName: sltPaymentMethodNameJob,
                    TermsName: sltTermsNameJob,
                    ShippingMethodName: sltShippingMethodNameJob,
                    // RewardPointsOpeningBalance:parseInt(rewardPointsOpeningBalanceJob),
                    // RewardPointsOpeningDate:openingDateJob,
                    TaxCodeName: sltTaxCodeNameJob,
                    // JobName:$('.jobTabEdit #edtJobName').val() || '',
                    Faxnumber: $('.jobTabEdit #edtJobCustomerFax').val() || '',
                    JobNumber: parseInt($('.jobTabEdit #edtJobNumber').val()) || 0,
                    // JobRegistration:$('.jobTabEdit #edtJobReg').val() || '',
                    // JobTitle:$('.jobTabEdit #edtJob_Title').val() || '',
                    Attachments: uploadedItemsJobNoPOP

                }
            };
        } else {
            objDetails = {
                type: "TJobEx",
                fields: {
                    Title: titleJob,
                    //clientName:companyJob,
                    ParentClientName: companyParent,
                    ParentCustomerName: companyParent,
                    FirstName: firstnameJob,
                    MiddleName: middlenameJob,
                    LastName: lastnameJob,
                    Email: emailJob,
                    Phone: phoneJob,
                    Mobile: mobileJob,
                    SkypeName: skypeJob,
                    Street: streetAddressJob,
                    Street2: cityJob,
                    State: stateJob,
                    PostCode: postalcodeJob,
                    Country: countryJob,
                    BillStreet: bstreetAddressJob,
                    BillStreet2: bcityJob,
                    BillState: bstateJob,
                    BillPostCode: bzipcodeJob,
                    Billcountry: bcountryJob,
                    Notes: notesJob,
                    CUSTFLD9: websiteJob,
                    PaymentMethodName: sltPaymentMethodNameJob,
                    TermsName: sltTermsNameJob,
                    ShippingMethodName: sltShippingMethodNameJob,
                    // RewardPointsOpeningBalance:parseInt(rewardPointsOpeningBalanceJob),
                    // RewardPointsOpeningDate:openingDateJob,
                    TaxCodeName: sltTaxCodeNameJob,
                    Faxnumber: faxJob,
                    JobName: jobName,
                    JobNumber: parseFloat(jobNumber) || 0,
                    // JobRegistration:jobReg,
                    // JobTitle:jobTitle,
                    Attachments: uploadedItemsJob

                }
            };
        }

        contactService.saveJobEx(objDetails).then(function (objDetails) {
            sideBarService.getAllJobssDataVS1(initialBaseDataLoad,0).then(function (dataReload) {
                addVS1Data('TJobVS1', JSON.stringify(dataReload)).then(function (datareturn) {
                    FlowRouter.go('/joblist?success=true');
                }).catch(function (err) {
                    FlowRouter.go('/joblist?success=true');
                });
            }).catch(function (err) {
                FlowRouter.go('/joblist?success=true');
            });

            sideBarService.getAllCustomersDataVS1(initialBaseDataLoad,0).then(function (dataReload) {
                addVS1Data('TCustomerVS1', JSON.stringify(dataReload)).then(function (datareturn) {

                }).catch(function (err) {

                });
            }).catch(function (err) {

            });
            // let customerSaveID = FlowRouter.current().queryParams;
            //   if(!isNaN(customerSaveID.id)){
            //         window.open('/customerscard?id=' + customerSaveID,'_self');
            //    }else if(!isNaN(customerSaveID.jobid)){
            //      window.open('/customerscard?jobid=' + customerSaveID,'_self');
            //    }else{
            //
            //    }
        }).catch(function (err) {
            swal({
                title: 'Oooops...',
                text: err,
                type: 'error',
                showCancelButton: false,
                confirmButtonText: 'Try Again'
            }).then((result) => {
                if (result.value) {
                    //Meteor._reload.reload();
                } else if (result.dismiss === 'cancel') {

                }
            });

        });
    }, delayTimeAfterSound);

    },
    'keyup .addcustomerpop .search': function (event) {
        var searchTerm = $(".search").val();
        var listItem = $('.results tbody').children('tr');
        var searchSplit = searchTerm.replace(/ /g, "'):containsi('");

        $.extend($.expr[':'], {
            'containsi': function (elem, i, match, array) {
                return (elem.textContent || elem.innerText || '').toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
            }
        });

        $(".results tbody tr").not(":containsi('" + searchSplit + "')").each(function (e) {
            $(this).attr('visible', 'false');
        });

        $(".results tbody tr:containsi('" + searchSplit + "')").each(function (e) {
            $(this).attr('visible', 'true');
        });

        var jobCount = $('.results tbody tr[visible="true"]').length;
        $('.counter').text(jobCount + ' items');

        if (jobCount == '0') { $('.no-result').show(); }
        else {
            $('.no-result').hide();
        }
        if (searchTerm === "") {
            $(".results tbody tr").each(function (e) {
                $(this).attr('visible', 'true');
                $('.no-result').hide();
            });

            //setTimeout(function () {
            var rowCount = $('.results tbody tr').length;
            $('.counter').text(rowCount + ' items');
            //}, 500);
        }

    },
    'click .addcustomerpop .tblCustomerSideList tbody tr': function (event) {

        var custLineID = $(event.target).attr('id');
        var custLineClass = $(event.target).attr('class');

        if (custLineID) {
            if (custLineClass == 'true') {
                window.open('/customerscard?jobid=' + custLineID, '_self');
            } else {
                window.open('/customerscard?id=' + custLineID, '_self');
            }

        }
    },
    'click .addcustomerpop .chkDatatable': function (event) {
        var columns = $('.addcustomerpop #tblTransactionlist th');
        let columnDataValue = $(event.target).closest("div").find(".divcolumn").text();

        $.each(columns, function (i, v) {
            let className = v.classList;
            let replaceClass = className[1];

            if (v.innerText == columnDataValue) {
                if ($(event.target).is(':checked')) {
                    $("." + replaceClass + "").css('display', 'table-cell');
                    $("." + replaceClass + "").css('padding', '.75rem');
                    $("." + replaceClass + "").css('vertical-align', 'top');
                } else {
                    $("." + replaceClass + "").css('display', 'none');
                }
            }
        });
    },
    'click .addcustomerpop .resetTable': function (event) {
        var getcurrentCloudDetails = CloudUser.findOne({ _id: Session.get('mycloudLogonID'), clouddatabaseID: Session.get('mycloudLogonDBID') });
        if (getcurrentCloudDetails) {
            if (getcurrentCloudDetails._id.length > 0) {
                var clientID = getcurrentCloudDetails._id;
                var clientUsername = getcurrentCloudDetails.cloudUsername;
                var clientEmail = getcurrentCloudDetails.cloudEmail;
                var checkPrefDetails = CloudPreference.findOne({ userid: clientID, PrefName: 'tblTransactionlist' });
                if (checkPrefDetails) {
                    CloudPreference.remove({ _id: checkPrefDetails._id }, function (err, idTag) {
                        if (err) {

                        } else {
                            Meteor._reload.reload();
                        }
                    });
                }
            }
        }
    },
    'click .addcustomerpop .saveTable': function (event) {
        let lineItems = [];
        //let datatable =$('.addcustomerpop #tblTransactionlist').DataTable();
        $('.columnSettings').each(function (index) {
            var $tblrow = $(this);
            var colTitle = $tblrow.find(".divcolumn").text() || '';
            var colWidth = $tblrow.find(".custom-range").val() || 0;
            var colthClass = $tblrow.find(".divcolumn").attr("valueupdate") || '';
            var colHidden = false;
            if ($tblrow.find(".custom-control-input").is(':checked')) {
                colHidden = false;
            } else {
                colHidden = true;
            }
            let lineItemObj = {
                index: index,
                label: colTitle,
                hidden: colHidden,
                width: colWidth,
                thclass: colthClass
            }

            lineItems.push(lineItemObj);
        });
        //datatable.state.save();

        var getcurrentCloudDetails = CloudUser.findOne({ _id: Session.get('mycloudLogonID'), clouddatabaseID: Session.get('mycloudLogonDBID') });
        if (getcurrentCloudDetails) {
            if (getcurrentCloudDetails._id.length > 0) {
                var clientID = getcurrentCloudDetails._id;
                var clientUsername = getcurrentCloudDetails.cloudUsername;
                var clientEmail = getcurrentCloudDetails.cloudEmail;
                var checkPrefDetails = CloudPreference.findOne({ userid: clientID, PrefName: 'tblTransactionlist' });
                if (checkPrefDetails) {
                    CloudPreference.update({ _id: checkPrefDetails._id }, {
                        $set: {
                            userid: clientID, username: clientUsername, useremail: clientEmail,
                            PrefGroup: 'salesform', PrefName: 'tblTransactionlist', published: true,
                            customFields: lineItems,
                            updatedAt: new Date()
                        }
                    }, function (err, idTag) {
                        if (err) {
                            $('.addcustomerpop #myModal2').modal('toggle');
                        } else {
                            $('.addcustomerpop #myModal2').modal('toggle');
                        }
                    });

                } else {
                    CloudPreference.insert({
                        userid: clientID, username: clientUsername, useremail: clientEmail,
                        PrefGroup: 'salesform', PrefName: 'tblTransactionlist', published: true,
                        customFields: lineItems,
                        createdAt: new Date()
                    }, function (err, idTag) {
                        if (err) {
                            $('.addcustomerpop #myModal2').modal('toggle');
                        } else {
                            $('.addcustomerpop #myModal2').modal('toggle');

                        }
                    });

                }
            }
        }
        $('.addcustomerpop #myModal2').modal('toggle');
        //Meteor._reload.reload();
    },
    'blur .addcustomerpop .divcolumn': function (event) {
        let columData = $(event.target).text();
        let columnDatanIndex = $(event.target).closest("div.columnSettings").attr('id');
        const datable = $('.addcustomerpop #tblTransactionlist').DataTable();
        const title = datable.column(columnDatanIndex).header();
        $(title).html(columData);
    },
    'change .addcustomerpop .rngRange': function (event) {
        let range = $(event.target).val();
        // $(event.target).closest("div.divColWidth").find(".spWidth").html(range+'px');

        // let columData = $(event.target).closest("div.divColWidth").find(".spWidth").attr("value");
        let columnDataValue = $(event.target).closest("div").prev().find(".divcolumn").text();
        const datable = $('.addcustomerpop #tblTransactionlist th');
        $.each(datable, function (i, v) {
            if (v.innerText == columnDataValue) {
                let className = v.className;
                let replaceClass = className.replace(/ /g, ".");
                $("." + replaceClass + "").css('width', range + 'px');

            }
        });

    },
    'click .addcustomerpop .btnOpenSettingsCustomer': function (event) {
        let templateObject = Template.instance();
        const columns = $('.addcustomerpop #tblTransactionlist th');

        const tableHeaderList = [];
        let sTible = "";
        let sWidth = "";
        let sIndex = "";
        let sVisible = "";
        let columVisible = false;
        let sClass = "";
        $.each(columns, function (i, v) {
            if (v.hidden == false) {
                columVisible = true;
            }
            if ((v.className.includes("hiddenColumn"))) {
                columVisible = false;
            }
            sWidth = v.style.width.replace('px', "");

            let datatablerecordObj = {
                sTitle: v.innerText || '',
                sWidth: sWidth || '',
                sIndex: v.cellIndex || 0,
                sVisible: columVisible || false,
                sClass: v.className || ''
            };
            tableHeaderList.push(datatablerecordObj);
        });

        templateObject.tableheaderrecords.set(tableHeaderList);
    },
    'click .addcustomerpop #exportbtn': function () {
        LoadingOverlay.show();
        jQuery('#tblTransactionlist_wrapper .dt-buttons .btntabletocsv').click();
    },
    'click .addcustomerpop .printConfirm': function (event) {
        playPrintAudio();
        setTimeout(function(){
        LoadingOverlay.show();
        jQuery('#tblTransactionlist_wrapper .dt-buttons .btntabletopdf').click();
    }, delayTimeAfterSound);
    },
    'click .addcustomerpop #exportbtnJob': function () {
        LoadingOverlay.show();
        jQuery('#tblJoblist_wrapper .dt-buttons .btntabletocsv').click();
    },
    'click .addcustomerpop .printConfirmJob': function (event) {
        playPrintAudio();
        LoadingOverlay.show();
        setTimeout(function(){
        jQuery('#tblJoblist_wrapper .dt-buttons .btntabletopdf').click();
    }, delayTimeAfterSound);
    },
    'click .addcustomerpop .btnRefresh': function () {
        Meteor._reload.reload();
    },
    'click .addcustomerpop .btnRefreshTransaction': function () {
        let currentId = FlowRouter.current().queryParams;
        LoadingOverlay.show();
        sideBarService.getTTransactionListReport().then(function (data) {
            addVS1Data('TTransactionListReport', JSON.stringify(data)).then(function (datareturn) {
                if (!isNaN(currentId.jobid)) {
                    window.open('/customerscard?jobid=' + currentId.jobid +'&transTab=active', '_self');
                }

                if (!isNaN(currentId.id)) {
                    window.open('/customerscard?id=' + currentId.id +'&transTab=active', '_self');
                }

            }).catch(function (err) {
                if (!isNaN(currentId.jobid)) {
                    window.open('/customerscard?jobid=' + currentId.jobid +'&transTab=active', '_self');
                }

                if (!isNaN(currentId.id)) {
                    window.open('/customerscard?id=' + currentId.id +'&transTab=active', '_self');
                }
            });
        }).catch(function (err) {
            if (!isNaN(currentId.jobid)) {
                window.open('/customerscard?jobid=' + currentId.jobid +'&transTab=active', '_self');
            }

            if (!isNaN(currentId.id)) {
                window.open('/customerscard?id=' + currentId.id +'&transTab=active', '_self');
            }
        });
    },
    'click .addcustomerpop .btnRefreshJobDetails': function () {
        let currentId = FlowRouter.current().queryParams;
        LoadingOverlay.show();
        sideBarService.getAllJobssDataVS1(initialBaseDataLoad,0).then(function (data) {
            addVS1Data('TJobVS1', JSON.stringify(data)).then(function (datareturn) {
                if (!isNaN(currentId.jobid)) {
                    window.open('/customerscard?jobid=' + currentId.jobid +'&transTab=job', '_self');
                }

                if (!isNaN(currentId.id)) {
                    window.open('/customerscard?id=' + currentId.id +'&transTab=job', '_self');
                }

            }).catch(function (err) {
                if (!isNaN(currentId.jobid)) {
                    window.open('/customerscard?jobid=' + currentId.jobid +'&transTab=job', '_self');
                }

                if (!isNaN(currentId.id)) {
                    window.open('/customerscard?id=' + currentId.id +'&transTab=job', '_self');
                }
            });
        }).catch(function (err) {
            if (!isNaN(currentId.jobid)) {
                window.open('/customerscard?jobid=' + currentId.jobid +'&transTab=job', '_self');
            }

            if (!isNaN(currentId.id)) {
                window.open('/customerscard?id=' + currentId.id +'&transTab=job', '_self');
            }
        });
    },
    'click .addcustomerpop #formCheck-TaxCode': function (event) {
        if ($(event.target).is(':checked')) {
            $('.addcustomerpop #autoUpdate').css('display', 'none');
        } else {
            $('.addcustomerpop #autoUpdate').css('display', 'block');
        }
    },
    'click .addcustomerpop #formCheckJob-2': function (event) {
        if ($(event.target).is(':checked')) {
            $('.addcustomerpop #autoUpdateJob').css('display', 'none');
        } else {
            $('.addcustomerpop #autoUpdateJob').css('display', 'block');
        }
    },
    'click .addcustomerpop #activeChk': function () {
        if ($(event.target).is(':checked')) {
            $('.addcustomerpop #customerInfo').css('color', '#00A3D3');
        } else {
            $('.addcustomerpop #customerInfo').css('color', '#b7b9cc !important');
        }
    },
    'click .addcustomerpop #btnNewProject': function (event) {
        const x2 = document.getElementById("newProject");
        if (x2.style.display === "none") {
            x2.style.display = "block";
        } else {
            x2.style.display = "none";
        }
    },
    'keydown .addcustomerpop #custOpeningBalance, keydown .addcustomerpop #edtJobNumber, keydown .addcustomerpop #edtCustomerCardDiscount': function (event) {
        if ($.inArray(event.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 || 333
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
            event.keyCode == 46 || event.keyCode == 190 || event.keyCode == 189) {
        } else {
            event.preventDefault();
        }
    },
    'click .addcustomerpop #formCheck-one': function (event) {
        if ($(event.target).is(':checked')) {
            $('.addcustomerpop .checkbox1div').css('display', 'block');

        } else {
            $('.addcustomerpop .checkbox1div').css('display', 'none');
        }
    },
    'click .addcustomerpop #formCheck-two': function (event) {
        if ($(event.target).is(':checked')) {
            $('.checkbox2div').css('display', 'block');

        } else {
            $('.checkbox2div').css('display', 'none');
        }
    },
    'click .addcustomerpop #formCheck-three': function (event) {
        if ($(event.target).is(':checked')) {
            $('.addcustomerpop .checkbox3div').css('display', 'block');
        } else {
            $('.addcustomerpop .checkbox3div').css('display', 'none');
        }
    },
    'click .addcustomerpop #formCheck-four': function (event) {
        if ($(event.target).is(':checked')) {
            $('.addcustomerpop .checkbox4div').css('display', 'block');
        } else {
            $('.addcustomerpop .checkbox4div').css('display', 'none');
        }
    },
    'blur .addcustomerpop .customField1Text': function (event) {
        var inputValue1 = $('.customField1Text').text();
        $('.lblCustomField1').text(inputValue1);
    },
    'blur .addcustomerpop .customField2Text': function (event) {
        var inputValue2 = $('.customField2Text').text();
        $('.lblCustomField2').text(inputValue2);
    },
    'blur .addcustomerpop .customField3Text': function (event) {
        var inputValue3 = $('.customField3Text').text();
        $('.lblCustomField3').text(inputValue3);
    },
    'blur .addcustomerpop .customField4Text': function (event) {
        var inputValue4 = $('.customField4Text').text();
        $('.lblCustomField4').text(inputValue4);
    },
    'click .addcustomerpop .btnSaveSettings': function (event) {
        playSaveAudio();
        let templateObject = Template.instance();
        setTimeout(function(){

        $('.addcustomerpop .lblCustomField1').html('');
        $('.addcustomerpop .lblCustomField2').html('');
        $('.addcustomerpop .lblCustomField3').html('');
        $('.addcustomerpop .lblCustomField4').html('');
        let getchkcustomField1 = true;
        let getchkcustomField2 = true;
        let getchkcustomField3 = true;
        let getchkcustomField4 = true;
        let getcustomField1 = $('.addcustomerpop .customField1Text').html();
        let getcustomField2 = $('.addcustomerpop .customField2Text').html();
        let getcustomField3 = $('.addcustomerpop .customField3Text').html();
        let getcustomField4 = $('.addcustomerpop .customField4Text').html();
        if ($('.addcustomerpop #formCheck-one').is(':checked')) {
            getchkcustomField1 = false;
        }
        if ($('.addcustomerpop #formCheck-two').is(':checked')) {
            getchkcustomField2 = false;
        }
        if ($('.addcustomerpop #formCheck-three').is(':checked')) {
            getchkcustomField3 = false;
        }
        if ($('.addcustomerpop #formCheck-four').is(':checked')) {
            getchkcustomField4 = false;
        }
        $('.addcustomerpop #customfieldModal').modal('toggle');
    }, delayTimeAfterSound);
    },
    'click .addcustomerpop .btnResetSettings': function (event) {
        var getcurrentCloudDetails = CloudUser.findOne({ _id: Session.get('mycloudLogonID'), clouddatabaseID: Session.get('mycloudLogonDBID') });
        if (getcurrentCloudDetails) {
            if (getcurrentCloudDetails._id.length > 0) {
                var clientID = getcurrentCloudDetails._id;
                var clientUsername = getcurrentCloudDetails.cloudUsername;
                var clientEmail = getcurrentCloudDetails.cloudEmail;
                var checkPrefDetails = CloudPreference.findOne({ userid: clientID, PrefName: 'customerscard' });

                if (checkPrefDetails) {
                    CloudPreference.remove({ _id: checkPrefDetails._id }, function (err, idTag) {
                        if (err) {

                        } else {
                            let customerSaveID = FlowRouter.current().queryParams;
                            if (!isNaN(customerSaveID.id)) {
                                window.open('/customerscard?id=' + customerSaveID, '_self');
                            } else if (!isNaN(customerSaveID.jobid)) {
                                window.open('/customerscard?jobid=' + customerSaveID, '_self');
                            } else {
                                window.open('/customerscard', '_self');
                            }
                            //Meteor._reload.reload();
                        }
                    });

                }
            }
        }
    },
    'click .addcustomerpop .new_attachment_btn': function (event) {
        $('.addcustomerpop #attachment-upload').trigger('click');

    },
    'change .addcustomerpop #attachment-upload': function (e) {
        let templateObj = Template.instance();
        let saveToTAttachment = false;
        let lineIDForAttachment = false;
        let uploadedFilesArray = templateObj.uploadedFiles.get();

        let myFiles = $('.addcustomerpop #attachment-upload')[0].files;
        let uploadData = utilityService.attachmentUploadTabs(uploadedFilesArray, myFiles, saveToTAttachment, lineIDForAttachment);
        templateObj.uploadedFiles.set(uploadData.uploadedFilesArray);
        templateObj.attachmentCount.set(uploadData.totalAttachments);
    },
    'click .addcustomerpop .img_new_attachment_btn': function (event) {
        $('.addcustomerpop #img-attachment-upload').trigger('click');

    },
    'change .addcustomerpop #img-attachment-upload': function (e) {
        let templateObj = Template.instance();
        let saveToTAttachment = false;
        let lineIDForAttachment = false;
        let uploadedFilesArray = templateObj.uploadedFiles.get();

        let myFiles = $('.addcustomerpop #img-attachment-upload')[0].files;
        let uploadData = utilityService.attachmentUpload(uploadedFilesArray, myFiles, saveToTAttachment, lineIDForAttachment);
        templateObj.uploadedFiles.set(uploadData.uploadedFilesArray);
        templateObj.attachmentCount.set(uploadData.totalAttachments);
    },
    'click .addcustomerpop .remove-attachment': function (event, ui) {
        let tempObj = Template.instance();
        let attachmentID = parseInt(event.target.id.split('remove-attachment-')[1]);
        if (tempObj.$(".addcustomerpop #confirm-action-" + attachmentID).length) {
            tempObj.$(".addcustomerpop #confirm-action-" + attachmentID).remove();
        } else {
            let actionElement = '<div class="confirm-action" id="confirm-action-' + attachmentID + '"><a class="confirm-delete-attachment btn btn-default" id="delete-attachment-' + attachmentID + '">'
            + 'Delete</a><button class="save-to-library btn btn-default">Remove & save to File Library</button></div>';
            tempObj.$('.addcustomerpop #attachment-name-' + attachmentID).append(actionElement);
        }
        tempObj.$(".addcustomerpop #new-attachment2-tooltip").show();

    },
    'click .addcustomerpop .file-name': function (event) {
        let attachmentID = parseInt(event.currentTarget.parentNode.id.split('attachment-name-')[1]);
        let templateObj = Template.instance();
        let uploadedFiles = templateObj.uploadedFiles.get();

        $('.addcustomerpop #myModalAttachment').modal('hide');
        let previewFile = {};
        let input = uploadedFiles[attachmentID].fields.Description;
        previewFile.link = 'data:' + input + ';base64,' + uploadedFiles[attachmentID].fields.Attachment;
        previewFile.name = uploadedFiles[attachmentID].fields.AttachmentName;
        let type = uploadedFiles[attachmentID].fields.Description;
        if (type === 'application/pdf') {
            previewFile.class = 'pdf-class';
        } else if (type === 'application/msword' || type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            previewFile.class = 'docx-class';
        }
        else if (type === 'application/vnd.ms-excel' || type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            previewFile.class = 'excel-class';
        }
        else if (type === 'application/vnd.ms-powerpoint' || type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
            previewFile.class = 'ppt-class';
        }
        else if (type === 'application/vnd.oasis.opendocument.formula' || type === 'text/csv' || type === 'text/plain' || type === 'text/rtf') {
            previewFile.class = 'txt-class';
        }
        else if (type === 'application/zip' || type === 'application/rar' || type === 'application/x-zip-compressed' || type === 'application/x-zip,application/x-7z-compressed') {
            previewFile.class = 'zip-class';
        }
        else {
            previewFile.class = 'default-class';
        }

        if (type.split('/')[0] === 'image') {
            previewFile.image = true
        } else {
            previewFile.image = false
        }
        templateObj.uploadedFile.set(previewFile);

        $('.addcustomerpop #files_view').modal('show');

        return;
    },
    'click .addcustomerpop .confirm-delete-attachment': function (event, ui) {
        let tempObj = Template.instance();
        tempObj.$(".addcustomerpop #new-attachment2-tooltip").show();
        let attachmentID = parseInt(event.target.id.split('delete-attachment-')[1]);
        let uploadedArray = tempObj.uploadedFiles.get();
        let attachmentCount = tempObj.attachmentCount.get();
        $('.addcustomerpop #attachment-upload').val('');
        uploadedArray.splice(attachmentID, 1);
        tempObj.uploadedFiles.set(uploadedArray);
        attachmentCount--;
        if (attachmentCount === 0) {
            let elementToAdd = '<div class="col inboxcol1"><img src="/icons/nofiles_icon.jpg" class=""></div> <div class="col inboxcol2"> <div>Upload  files or add files from the file library</div> <p style="color: #ababab;">Only users with access to your company can view these files</p></div>';
            $('.addcustomerpop #file-display').html(elementToAdd);
        }
        tempObj.attachmentCount.set(attachmentCount);
        if (uploadedArray.length > 0) {
            let utilityService = new UtilityService();
            utilityService.showUploadedAttachmentTabs(uploadedArray);
        } else {
            $(".attchment-tooltip").show();
        }
    },
    'click .addcustomerpop .attachmentTab': function () {
        let templateInstance = Template.instance();
        let uploadedFileArray = templateInstance.uploadedFiles.get();
        if (uploadedFileArray.length > 0) {
            let utilityService = new UtilityService();
            utilityService.showUploadedAttachmentTabs(uploadedFileArray);
        } else {
            $(".attchment-tooltip").show();
        }
    },
    'click .addcustomerpop .new_attachment_btnJobPOP': function (event) {
        $('.addcustomerpop #attachment-uploadJobPOP').trigger('click');
    },
    'change .addcustomerpop #attachment-uploadJobPOP': function (e) {
        let templateObj = Template.instance();
        let saveToTAttachment = false;
        let lineIDForAttachment = false;
        let uploadedFilesArray = templateObj.uploadedFilesJob.get();
        let myFiles = $('.addcustomerpop #attachment-uploadJobPOP')[0].files;
        let uploadData = utilityService.attachmentUploadJob(uploadedFilesArray, myFiles, saveToTAttachment, lineIDForAttachment);
        templateObj.uploadedFilesJob.set(uploadData.uploadedFilesArray);
        templateObj.attachmentCountJob.set(uploadData.totalAttachments);
    },
    'click .addcustomerpop .remove-attachmentJobPOP': function (event, ui) {
        let tempObj = Template.instance();
        let attachmentID = parseInt(event.target.id.split('remove-attachmentJobPOP-')[1]);
        if (tempObj.$(".addcustomerpop #confirm-actionJobPOP-" + attachmentID).length) {
            tempObj.$(".addcustomerpop #confirm-actionJobPOP-" + attachmentID).remove();
        } else {
            let actionElement = '<div class="confirm-actionJobPOP" id="confirm-actionJobPOP-' + attachmentID + '"><a class="confirm-delete-attachmentJobPOP btn btn-default" id="delete-attachmentJobPOP-' + attachmentID + '">'
            + 'Delete</a><button class="save-to-libraryJobPOP btn btn-default">Remove & save to File Library</button></div>';
            tempObj.$('.addcustomerpop #attachment-nameJobPOP-' + attachmentID).append(actionElement);
        }
        tempObj.$(".addcustomerpop #new-attachment2-tooltipJobPOP").show();
    },
    'click .addcustomerpop .file-nameJobPOP': function (event) {
        let attachmentID = parseInt(event.currentTarget.parentNode.id.split('attachment-nameJobPOP-')[1]);
        let templateObj = Template.instance();
        let uploadedFiles = templateObj.uploadedFilesJob.get();

        $('.addcustomerpop #myModalAttachmentJobPOP').modal('hide');
        let previewFile = {};
        let input = uploadedFiles[attachmentID].fields.Description;
        previewFile.link = 'data:' + input + ';base64,' + uploadedFiles[attachmentID].fields.Attachment;
        previewFile.name = uploadedFiles[attachmentID].fields.AttachmentName;
        let type = uploadedFiles[attachmentID].fields.Description;
        if (type === 'application/pdf') {
            previewFile.class = 'pdf-class';
        } else if (type === 'application/msword' || type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            previewFile.class = 'docx-class';
        }
        else if (type === 'application/vnd.ms-excel' || type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            previewFile.class = 'excel-class';
        }
        else if (type === 'application/vnd.ms-powerpoint' || type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
            previewFile.class = 'ppt-class';
        }
        else if (type === 'application/vnd.oasis.opendocument.formula' || type === 'text/csv' || type === 'text/plain' || type === 'text/rtf') {
            previewFile.class = 'txt-class';
        }
        else if (type === 'application/zip' || type === 'application/rar' || type === 'application/x-zip-compressed' || type === 'application/x-zip,application/x-7z-compressed') {
            previewFile.class = 'zip-class';
        }
        else {
            previewFile.class = 'default-class';
        }

        if (type.split('/')[0] === 'image') {
            previewFile.image = true
        } else {
            previewFile.image = false
        }
        templateObj.uploadedFileJob.set(previewFile);

        $('.addcustomerpop #files_viewJobPOP').modal('show');

        return;
    },
    'click .addcustomerpop .confirm-delete-attachmentJobPOP': function (event, ui) {
        let tempObj = Template.instance();
        tempObj.$(".addcustomerpop #new-attachment2-tooltipJobPOP").show();
        let attachmentID = parseInt(event.target.id.split('delete-attachmentJobPOP-')[1]);
        let uploadedArray = tempObj.uploadedFilesJob.get();
        let attachmentCount = tempObj.attachmentCountJob.get();
        $('.addcustomerpop #attachment-uploadJobPOP').val('');
        uploadedArray.splice(attachmentID, 1);
        tempObj.uploadedFilesJob.set(uploadedArray);
        attachmentCount--;
        if (attachmentCount === 0) {
            let elementToAdd = '<div class="col inboxcol1"><img src="/icons/nofiles_icon.jpg" class=""></div> <div class="col inboxcol2"> <div>Upload  files or add files from the file library</div> <p style="color: #ababab;">Only users with access to your company can view these files</p></div>';
            $('.addcustomerpop #file-displayJobPOP').html(elementToAdd);
        }
        tempObj.attachmentCountJob.set(attachmentCount);
        if (uploadedArray.length > 0) {
            let utilityService = new UtilityService();
            utilityService.showUploadedAttachmentJob(uploadedArray);
        } else {
            $(".attchment-tooltipJobPOP").show();
        }
    },
    'click .addcustomerpop .attachmentTabJobPOP': function () {
        let templateInstance = Template.instance();
        let uploadedFileArray = templateInstance.uploadedFilesJob.get();
        if (uploadedFileArray.length > 0) {
            let utilityService = new UtilityService();
            utilityService.showUploadedAttachmentJob(uploadedFileArray);
        } else {
            $(".attchment-tooltipJobPOP").show();
        }
    },
    'click .addcustomerpop .new_attachment_btnJobNoPOP': function (event) {
        $('.addcustomerpop #attachment-uploadJobNoPOP').trigger('click');
    },
    'change .addcustomerpop #attachment-uploadJobNoPOP': function (e) {
        let templateObj = Template.instance();
        let saveToTAttachment = false;
        let lineIDForAttachment = false;
        let uploadedFilesArrayJob = templateObj.uploadedFilesJobNoPOP.get();
        let myFiles = $('.addcustomerpop #attachment-uploadJobNoPOP')[0].files;
        let uploadData = utilityService.attachmentUploadJobNoPOP(uploadedFilesArrayJob, myFiles, saveToTAttachment, lineIDForAttachment);
        templateObj.uploadedFilesJobNoPOP.set(uploadData.uploadedFilesArray);
        templateObj.attachmentCountJobNoPOP.set(uploadData.totalAttachments);
    },
    'click .addcustomerpop .remove-attachmentJobNoPOP': function (event, ui) {
        let tempObj = Template.instance();
        let attachmentID = parseInt(event.target.id.split('remove-attachmentJobNoPOP-')[1]);
        if (tempObj.$(".addcustomerpop #confirm-actionJobNoPOP-" + attachmentID).length) {
            tempObj.$(".addcustomerpop #confirm-actionJobNoPOP-" + attachmentID).remove();
        } else {
            let actionElement = '<div class="confirm-actionJobNoPOP" id="confirm-actionJobNoPOP-' + attachmentID + '"><a class="confirm-delete-attachmentJobNoPOP btn btn-default" id="delete-attachmentJobNoPOP-' + attachmentID + '">'
            + 'Delete</a><button class="save-to-libraryJobNoPOP btn btn-default">Remove & save to File Library</button></div>';
            tempObj.$('.addcustomerpop #attachment-nameJobNoPOP-' + attachmentID).append(actionElement);
        }
        tempObj.$(".addcustomerpop #new-attachment2-tooltipJobNoPOP").show();
    },
    'click .addcustomerpop .file-nameJobNoPOP': function (event) {
        let attachmentID = parseInt(event.currentTarget.parentNode.id.split('attachment-nameJobNoPOP-')[1]);
        let templateObj = Template.instance();
        let uploadedFiles = templateObj.uploadedFilesJobNoPOP.get();

        //$('.addcustomerpop #myModalAttachmentJobNoPOP').modal('hide');
        let previewFile = {};
        let input = uploadedFiles[attachmentID].fields.Description;
        previewFile.link = 'data:' + input + ';base64,' + uploadedFiles[attachmentID].fields.Attachment;
        previewFile.name = uploadedFiles[attachmentID].fields.AttachmentName;
        let type = uploadedFiles[attachmentID].fields.Description;
        if (type === 'application/pdf') {
            previewFile.class = 'pdf-class';
        } else if (type === 'application/msword' || type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            previewFile.class = 'docx-class';
        }
        else if (type === 'application/vnd.ms-excel' || type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            previewFile.class = 'excel-class';
        }
        else if (type === 'application/vnd.ms-powerpoint' || type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
            previewFile.class = 'ppt-class';
        }
        else if (type === 'application/vnd.oasis.opendocument.formula' || type === 'text/csv' || type === 'text/plain' || type === 'text/rtf') {
            previewFile.class = 'txt-class';
        }
        else if (type === 'application/zip' || type === 'application/rar' || type === 'application/x-zip-compressed' || type === 'application/x-zip,application/x-7z-compressed') {
            previewFile.class = 'zip-class';
        }
        else {
            previewFile.class = 'default-class';
        }

        if (type.split('/')[0] === 'image') {
            previewFile.image = true
        } else {
            previewFile.image = false
        }
        templateObj.uploadedFileJobNoPOP.set(previewFile);

        $('.addcustomerpop #files_viewJobNoPOP').modal('show');

        return;
    },
    'click .addcustomerpop .confirm-delete-attachmentJobNoPOP': function (event, ui) {
        let tempObj = Template.instance();
        tempObj.$(".addcustomerpop #new-attachment2-tooltipJobNoPOP").show();
        let attachmentID = parseInt(event.target.id.split('delete-attachmentJobNoPOP-')[1]);
        let uploadedArray = tempObj.uploadedFilesJobNoPOP.get();
        let attachmentCount = tempObj.attachmentCountJobNoPOP.get();
        $('.addcustomerpop #attachment-uploadJobNoPOP').val('');
        uploadedArray.splice(attachmentID, 1);
        tempObj.uploadedFilesJobNoPOP.set(uploadedArray);
        attachmentCount--;
        if (attachmentCount === 0) {
            let elementToAdd = '<div class="col inboxcol1"><img src="/icons/nofiles_icon.jpg" class=""></div> <div class="col inboxcol2"> <div>Upload  files or add files from the file library</div> <p style="color: #ababab;">Only users with access to your company can view these files</p></div>';
            $('.addcustomerpop #file-displayJobNoPOP').html(elementToAdd);
        }
        tempObj.attachmentCountJobNoPOP.set(attachmentCount);
        if (uploadedArray.length > 0) {
            let utilityService = new UtilityService();
            utilityService.showUploadedAttachmentJobNoPOP(uploadedArray);
        } else {
            $(".attchment-tooltipJobNoPOP").show();
        }
    },
    'click .addcustomerpop .attachmentTabJobNoPOP': function () {
        let templateInstance = Template.instance();
        let uploadedFileArray = templateInstance.uploadedFilesJobNoPOP.get();
        if (uploadedFileArray.length > 0) {
            let utilityService = new UtilityService();
            utilityService.showUploadedAttachmentJobNoPOP(uploadedFileArray);
        } else {
            $(".addcustomerpop .attchment-tooltipJobNoPOP").show();
        }
    },
    'change .addcustomerpop .customerTypeSelect': function (event) {
        const custName = $('.addcustomerpop .customerTypeSelect').children("option:selected").val();
        if (custName == "newCust") {
            $('.addcustomerpop #myModalClientType').modal();
            $(this).prop("selected", false);
        }
    },
    'click .addcustomerpop #btnNewJob': function (event) {
        let templateObject = Template.instance();
    },
    'click .addcustomerpop .btnNewCustomer': function (event) {
        window.open('/customerscard', '_self');
    },
    'click .addcustomerpop .btnView': function (e) {
        const btnView = document.getElementById("btnView");
        const btnHide = document.getElementById("btnHide");

        const displayList = document.getElementById("displayList");
        const displayInfo = document.getElementById("displayInfo");
        if (displayList.style.display === "none") {
            displayList.style.display = "flex";
            $(".addcustomerpop #displayInfo").removeClass("col-12");
            $(".addcustomerpop #displayInfo").addClass("col-9");
            btnView.style.display = "none";
            btnHide.style.display = "flex";
        } else {
            displayList.style.display = "none";
            $(".addcustomerpop #displayInfo").removeClass("col-9");
            $(".addcustomerpop #displayInfo").addClass("col-12");
            btnView.style.display = "flex";
            btnHide.style.display = "none";
        }
    },
    'click .addcustomerpop .btnDeleteCustomer': function (event) {
        playDeleteAudio();
        let templateObject = Template.instance();
        let contactService2 = new ContactService();
        LoadingOverlay.show();
        setTimeout(function(){

        let currentId = FlowRouter.current().queryParams;
        let objDetails = '';

        if (!isNaN(currentId.id)) {
            const currentCustomer = parseInt(currentId.id);
            objDetails = {
                type: "TCustomerEx",
                fields: {
                    ID: currentCustomer,
                    Active: false
                }
            };
            contactService2.saveCustomerEx(objDetails).then(function (objDetails) {
                FlowRouter.go('/customerlist?success=true');
            }).catch(function (err) {
                swal({
                    title: 'Oooops...',
                    text: err,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {
                    } else if (result.dismiss === 'cancel') {

                    }
                });
            });
        } else {
            FlowRouter.go('/customerlist?success=true');
        }
        $('.addcustomerpop #deleteCustomerModal').modal('toggle');
    }, delayTimeAfterSound);
    }
});

Template.addcustomerpop.helpers({
    record: () => {
        let temp =  Template.instance().records.get();
        if(temp && temp.mobile) {
            temp.mobile = temp.mobile.replace('+61', '0')
        }
        return temp;
    },
    countryList: () => {
        return Template.instance().countryData.get();
    },
    customerrecords: () => {
        return Template.instance().customerrecords.get().sort(function (a, b) {
            if (a.company == 'NA') {
                return 1;
            }
            else if (b.company == 'NA') {
                return -1;
            }
            return (a.company.toUpperCase() > b.company.toUpperCase()) ? 1 : -1;
        });
    },
    datatablerecords: () => {
        return Template.instance().datatablerecords.get().sort(function (a, b) {
            if (a.saledate == 'NA') {
                return 1;
            }
            else if (b.saledate == 'NA') {
                return -1;
            }
            return (a.saledate.toUpperCase() > b.saledate.toUpperCase()) ? 1 : -1;
        });
    },
    datatablerecordsjob: () => {
        return Template.instance().datatablerecordsjob.get().sort(function (a, b) {
            if (a.company == 'NA') {
                return 1;
            }
            else if (b.company == 'NA') {
                return -1;
            }
            return (a.company.toUpperCase() > b.company.toUpperCase()) ? 1 : -1;
        });
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    tableheaderrecordsjob: () => {
        return Template.instance().tableheaderrecordsjob.get();
    },
    salesCloudPreferenceRec: () => {
        return CloudPreference.findOne({ userid: Session.get('mycloudLogonID'), PrefName: 'tblSalesOverview' });
    },
    currentdate: () => {
        var currentDate = new Date();
        var begunDate = moment(currentDate).format("DD/MM/YYYY");
        return begunDate;
    },
    isJob: () => {
        return Template.instance().isJob.get();
    },
    preferedPaymentList: () => {
        return Template.instance().preferedPaymentList.get();
    },
    termsList: () => {
        return Template.instance().termsList.get();
    },
    deliveryMethodList: () => {
        return Template.instance().deliveryMethodList.get();
    },
    clienttypeList: () => {
        if (Template.instance().clienttypeList.get()) {
            return Template.instance().clienttypeList.get().sort(function (a, b) {
                if (a == 'NA') {
                    return 1;
                } else if (b == 'NA') {
                    return -1;
                }
                return (a.toUpperCase() > b.toUpperCase()) ? 1 : -1;
            });
        } else {
            return null;
        }
    },
    taxCodeList: () => {
        return Template.instance().taxCodeList.get();
    },
    uploadedFiles: () => {
        return Template.instance().uploadedFiles.get();
    },
    attachmentCount: () => {
        return Template.instance().attachmentCount.get();
    },
    uploadedFile: () => {
        return Template.instance().uploadedFile.get();
    },
    uploadedFilesJob: () => {
        return Template.instance().uploadedFilesJob.get();
    },
    attachmentCountJob: () => {
        return Template.instance().attachmentCountJob.get();
    },
    uploadedFileJob: () => {
        return Template.instance().uploadedFileJob.get();
    },
    uploadedFilesJobNoPOP: () => {
        return Template.instance().uploadedFilesJobNoPOP.get();
    },
    attachmentCountJobNoPOP: () => {
        return Template.instance().attachmentCountJobNoPOP.get();
    },
    uploadedFileJobNoPOP: () => {
        return Template.instance().uploadedFileJobNoPOP.get();
    },
    currentAttachLineID: () => {
        return Template.instance().currentAttachLineID.get();
    },
    contactCloudPreferenceRec: () => {
        return CloudPreference.findOne({ userid: Session.get('mycloudLogonID'), PrefName: 'customerscard' });
    },
    isSameAddress: () => {
        return Template.instance().isSameAddress.get();
    },
    isJobSameAddress: () => {
        return Template.instance().isJobSameAddress.get();
    },
    isMobileDevices: () => {
        var isMobile = false; //initiate as false
        // device detection
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
            || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
            isMobile = true;
        }

        return isMobile;
    }
});
