const publicRedirect = () => {

};

const publicRoutes = FlowRouter.group({
    name: 'public',
    triggersEnter: [publicRedirect]
});

FlowRouter.notFound = {
    action() {
        BlazeLayout.render('layoutlogin', {
            yield: 'notFound'
        });
    }
};

publicRoutes.route('/', {
    name: 'vs1login',
    action() {
        BlazeLayout.render('layoutlogin', {
            yield: 'vs1login'
        });
    }
});

publicRoutes.route('/vs1greentracklogin', {
    name: 'vs1greentracklogin',
    action() {
        BlazeLayout.render('layoutlogin', {
            yield: 'vs1greentracklogin'
        });
    }
});

publicRoutes.route('/vs1check', {
    name: 'vs1check',
    action() {
        BlazeLayout.render('layoutlogin', {
            yield: 'vs1check'
        });
    }
});

publicRoutes.route('/testlogin', {
    name: 'testlogin',
    action() {
        BlazeLayout.render('layoutlogin', {
            yield: 'testlogin'
        });
    }
});

publicRoutes.route('/forgot', {
    name: 'forgotforgot',
    action() {
        BlazeLayout.render('layoutlogin', {
            yield: 'forgotforgot'
        });
    }
});

publicRoutes.route('/register', {
    name: 'register',
    action() {
        BlazeLayout.render('layoutlogin', {
            yield: 'register'
        });
    }
});

publicRoutes.route('/registerdb', {
    name: 'registerdb',
    action() {
        BlazeLayout.render('layoutlogin', {
            yield: 'registerdb'
        });
    }
});

publicRoutes.route('/binnypurchasedb', {
    name: 'binnypurchasedb',
    action() {
        BlazeLayout.render('layoutlogin', {
            yield: 'binnypurchasedb'
        });
    }
});

publicRoutes.route('/packagerenewal', {
    name: 'packagerenewal',
    action() {
        BlazeLayout.render('layoutlogin', {
            yield: 'packagerenewal'
        });
    }
});

publicRoutes.route('/simonpurchasedb', {
    name: 'simonpurchasedb',
    action() {
        BlazeLayout.render('layoutlogin', {
            yield: 'simonpurchasedb'
        });
    }
});

publicRoutes.route('/forgotpassword', {
    name: 'forgotpassword',
    action() {
        BlazeLayout.render('layoutlogin', {
            yield: 'forgotpassword'
        });
    }
});

publicRoutes.route('/resetpassword', {
    name: 'resetpassword',
    action() {
        BlazeLayout.render('layoutlogin', {
            yield: 'resetpassword'
        });
    }
});


const authenticatedRedirect = () => {
    $(window).on('resize', function() {
        var win = $(this); //this = window
        if (win.height() <= 450 && win.width() <= 950) {
            document.getElementById("sidebar").style.display = "block";
        } else if (win.width() <= 450) {
            document.getElementById("sidebar").style.display = "none";
        } else {
            let sidePanelToggle = Session.get('sidePanelToggle');
            if ((sidePanelToggle === 'undefined') || (sidePanelToggle === undefined)) {
                document.getElementById("sidebar").style.display = "block";
                Session.setPersistent('sidePanelToggle', "toggled");
                sidePanelToggle = Session.get('sidePanelToggle');
            }
            if (sidePanelToggle) {
                if (sidePanelToggle === "toggled") {
                    document.getElementById("sidebar").style.display = "block";
                } else {
                    document.getElementById("sidebar").style.display = "none";
                }
            }
        }

    });

    if (Session.get('CloudSidePanelMenu')) {
        $("html").addClass("hasSideBar");
        $("body").addClass("hasSideBar");
    }

    if (Session.get('sidePanelSettings') === "openNav") {
        $(".active_page_content").css("text-align", "right");
    } else {
        $(".active_page_content").css("text-align", "inherit");
    }

    if (Session.get('lastUrl') == undefined) {
        Session.setPersistent('lastUrl', window.location.pathname);
    } else {
        let lastUrl = Session.get('lastUrl');
    }
    Session.setPersistent('lastUrl', window.location.pathname);

    let lastPageVisitUrl = window.location.pathname;
    if(FlowRouter.current().oldRoute != undefined){
      lastPageVisitUrl= FlowRouter.current().oldRoute.path;
      if (lastPageVisitUrl.indexOf(FlowRouter.current().context.pathname) > -1){

      }else{
        localStorage.setItem('vs1lastvisiturl', lastPageVisitUrl);
      }

    }else{
      lastPageVisitUrl = window.location.pathname;
    }

    localStorage.setItem('lastvisiturl', lastPageVisitUrl);

};

const authenticatedRoutes = FlowRouter.group({
    name: 'authenticated',
    triggersEnter: [authenticatedRedirect]
});

let previous_url = "";

FlowRouter.triggers.enter([
    function (context, redirect, stop) {
        if (previous_url !== "" && previous_url !== context.path && JSON.parse(localStorage.getItem("isFormUpdated"))) {
            stop();
            swal({
                title: 'WARNING!',
                text: 'Do you wish to save your changes?',
                type: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No'
            }).then((result) => {
                if (result.value) {
                    FlowRouter.go(previous_url);
                } else if (result.dismiss === 'cancel') {
                    FlowRouter.go(context.path);
                    //TODO need to url async
                    previous_url = "";
                    localStorage.setItem("isFormUpdated", false);
                }
            });
        }
    }
]);

FlowRouter.triggers.exit([
    function (context, redirect) {
        if (JSON.parse(localStorage.getItem("isFormUpdated"))) {
            previous_url = context.path;
        }
    }
], {only: ["basreturn", "depositcard", "chequecard", "newbankrule", "customerscard", "workordercard",
        "employeescard", "leadscard", "supplierscard", "journalentrycard", "fixedassetcard", "bom_setup",
        "servicelogcard", "new_process", "stockadjustmentcard", "paymentcard", "supplierpaymentcard",
        "purchaseordercard", "billcard", "creditcard", "allreports", "new_quote", "new_salesorder",
        "new_invoice", "refundcard"
    ]});

authenticatedRoutes.route('/accounttransactions', {
    name: 'accounttransactions',
    action() {
        BlazeLayout.render('layout', {
            yield: 'accounttransactions'
        });
    }
});


authenticatedRoutes.route('/dashboard', {
    name: 'dashboard',
    action() {
        BlazeLayout.render('layout', {
            yield: 'dashboard'
        });
    }
});

authenticatedRoutes.route('/dashboardexe', {
    name: 'dashboardexe',
    action() {
        BlazeLayout.render('layout', {
            yield: 'dashboardexe'
        });
    }
});

authenticatedRoutes.route('/dashboardsales', {
    name: 'dashboardsales',
    action() {
        BlazeLayout.render('layout', {
            yield: 'dashboardsales'
        });
    }
});

authenticatedRoutes.route('/dashboardsalesmanager', {
    name: 'dashboardsalesmanager',
    action() {
        BlazeLayout.render('layout', {
            yield: 'dashboardsalesmanager'
        });
    }
});

authenticatedRoutes.route('/dashboardmy', {
    name: 'dashboardmy',
    action() {
        BlazeLayout.render('layout', {
            yield: 'dashboardmy'
        });
    }
});

authenticatedRoutes.route('/appointments', {
    name: 'appointments',
    action() {
        BlazeLayout.render('layout', {
            yield: 'appointments'
        });
    }
});

authenticatedRoutes.route('/appointmenttimelist', {
    name: 'appointmenttimelist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'appointmenttimelist'
        });
    }
});

authenticatedRoutes.route('/newappointments', {
    name: 'newappointments',
    action() {
        BlazeLayout.render('layout', {
            yield: 'newappointments'
        });
    }
});

/* Sales */
authenticatedRoutes.route('/salesordercard', {
    name: 'new_salesorder',
    action() {
        BlazeLayout.render('layout', {
            yield: 'new_salesorder'
        });
    }
});

authenticatedRoutes.route('/invoicecard', {
    name: 'new_invoice',
    action() {
        BlazeLayout.render('layout', {
            yield: 'new_invoice'
        });
    }
});

authenticatedRoutes.route('/refundcard', {
    name: 'refundcard',
    action() {
        BlazeLayout.render('layout', {
            yield: 'refundcard'
        });
    }
});

authenticatedRoutes.route('/quotecard', {
    name: 'new_quote',
    action() {
        BlazeLayout.render('layout', {
            yield: 'new_quote'
        });
    }
});

authenticatedRoutes.route('/salesorderslist', {
    name: 'salesorderslist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'salesorderslist'
        });
    }
});

authenticatedRoutes.route('/invoicelist', {
    name: 'invoicelist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'invoicelist'
        });
    }
});

authenticatedRoutes.route('/invoicelistBO', {
    name: 'invoicelistBO',
    action() {
        BlazeLayout.render('layout', {
            yield: 'invoicelistBO'
        });
    }
});
authenticatedRoutes.route('/quoteslist', {
    name: 'quoteslist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'quoteslist'
        });
    }
});

authenticatedRoutes.route('/refundlist', {
    name: 'refundlist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'refundlist'
        });
    }
});

authenticatedRoutes.route('/accountsoverview', {
    name: 'accountsoverview',
    action() {
        BlazeLayout.render('layout', {
            yield: 'accountsoverview'
        });
    }
});

authenticatedRoutes.route('/payrolloverview', {
    name: 'payrolloverview',
    action() {
        BlazeLayout.render('layout', {
            yield: 'payrolloverview'
        });
    }
});
authenticatedRoutes.route('/payrollleave', {
    name: 'payrollleave',
    action() {
        BlazeLayout.render('layout', {
            yield: 'payrollleave'
        });
    }
});

authenticatedRoutes.route('/timesheetdetail', {
    name: 'timesheetdetail',
    action() {
        BlazeLayout.render('layout', {
            yield: 'timesheetdetail'
        });
    }
});

authenticatedRoutes.route('/payrun', {
    name: 'payrun',
    action() {
        BlazeLayout.render('layout', {
            yield: 'payrun'
        });
    }
});

authenticatedRoutes.route('/singletouch', {
    name: 'singletouch',
    action() {
        BlazeLayout.render('layout', {
            yield: 'singletouch'
        });
    }
});

authenticatedRoutes.route('/payrundetails', {
    name: 'payrundetails',
    action() {
        BlazeLayout.render('layout', {
            yield: 'payrundetails'
        });
    }
});

authenticatedRoutes.route('/payslip', {
    name: 'payslip',
    action() {
        BlazeLayout.render('layout', {
            yield: 'payslip'
        });
    }
});

authenticatedRoutes.route('/singletouchpayroll', {
    name: 'singletouchpayroll',
    action() {
        BlazeLayout.render('layout', {
            yield: 'singletouchpayroll'
        });
    }
});

authenticatedRoutes.route('/purchasesoverview', {
    name: 'purchasesoverview',
    action() {
        BlazeLayout.render('layout', {
            yield: 'purchasesoverview'
        });
    }
});

authenticatedRoutes.route('/salesoverview', {
    name: 'salesoverview',
    action() {
        BlazeLayout.render('layout', {
            yield: 'salesoverview'
        });
    }
});

authenticatedRoutes.route('/contactoverview', {
    name: 'contactoverview',
    action() {
        BlazeLayout.render('layout', {
            yield: 'contactoverview'
        });
    }
});

authenticatedRoutes.route('/billcard', {
    name: 'billcard',
    action() {
        BlazeLayout.render('layout', {
            yield: 'billcard'
        });
    }
});

authenticatedRoutes.route('/chequecard', {
    name: 'chequecard',
    action() {
        BlazeLayout.render('layout', {
            yield: 'chequecard'
        });
    }
});

authenticatedRoutes.route('/customerscard', {
    name: 'customerscard',
    action() {
        BlazeLayout.render('layout', {
            yield: 'customerscard'
        });
    }
});

authenticatedRoutes.route('/employeescard', {
    name: 'employeescard',
    action() {
        BlazeLayout.render('layout', {
            yield: 'employeescard'
        });
    }
});

authenticatedRoutes.route('/leadscard', {
    name: 'leadscard',
    action() {
        BlazeLayout.render('layout', {
            yield: 'leadscard'
        });
    }
});


authenticatedRoutes.route('/supplierscard', {
    name: 'supplierscard',
    action() {
        BlazeLayout.render('layout', {
            yield: 'supplierscard'
        });
    }
});

authenticatedRoutes.route('/customerlist', {
    name: 'customerlist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'customerlist'
        });
    }
});

authenticatedRoutes.route('/invoiceemail', {
    name: 'invoiceemail',
    action() {
        BlazeLayout.render('layout', {
            yield: 'invoiceemail'
        });
    }
});

authenticatedRoutes.route('/joblist', {
    name: 'joblist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'joblist'
        });
    }
});

authenticatedRoutes.route('/statementlist', {
    name: 'statementlist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'statementlist'
        });
    }
});



authenticatedRoutes.route('/employeelist', {
    name: 'employeelist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'employeelist'
        });
    }
});

authenticatedRoutes.route('/leadlist', {
    name: 'leadlist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'leadlist'
        });
    }
});

authenticatedRoutes.route('/supplierlist', {
    name: 'supplierlist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'supplierlist'
        });
    }
});

authenticatedRoutes.route('/chartofaccounts', {
    name: 'chartofaccounts',
    action() {
        BlazeLayout.render('layout', {
            yield: 'chartofaccounts'
        });
    }
});

authenticatedRoutes.route('/expenseclaims', {
    name: 'expenseclaims',
    action() {
        BlazeLayout.render('layout', {
            yield: 'expenseclaims'
        });
    }
});

authenticatedRoutes.route('/purchaseorderlist', {
    name: 'purchaseorderlist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'purchaseorderlist'
        });
    }
});

authenticatedRoutes.route('/purchaseorderlistBO', {
    name: 'purchaseorderlistBO',
    action() {
        BlazeLayout.render('layout', {
            yield: 'purchaseorderlistBO'
        });
    }
});

authenticatedRoutes.route('/purchaseordercard', {
    name: 'purchaseordercard',
    action() {
        BlazeLayout.render('layout', {
            yield: 'purchaseordercard'
        });
    }
});

authenticatedRoutes.route('/billlist', {
    name: 'billlist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'billlist'
        });
    }
});

authenticatedRoutes.route('/chequelist', {
    name: 'chequelist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'chequelist'
        });
    }
});

authenticatedRoutes.route('/creditlist', {
    name: 'creditlist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'creditlist'
        });
    }
});

authenticatedRoutes.route('/inventorylist', {
    name: 'inventorylist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'inventorylist'
        });
    }
});

authenticatedRoutes.route('/productlist', {
    name: 'productlist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'productlist'
        });
    }
});

authenticatedRoutes.route('/serialnumberlist', {
    name: 'serialnumberlist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'serialnumberlist'
        });
    }
});

authenticatedRoutes.route('/serialnumberview', {
    name: 'serialnumberview',
    action() {
        BlazeLayout.render('layout', {
            yield: 'serialnumberview'
        });
    }
});

authenticatedRoutes.route('/lotnumberlist', {
    name: 'lotnumberlist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'lotnumberlist'
        });
    }
});

authenticatedRoutes.route('/lotnumberview', {
    name: 'lotnumberview',
    action() {
        BlazeLayout.render('layout', {
            yield: 'lotnumberview'
        });
    }
});

authenticatedRoutes.route('/paymentcard', {
    name: 'paymentcard',
    action() {
        BlazeLayout.render('layout', {
            yield: 'paymentcard'
        });
    }
});

authenticatedRoutes.route('/supplierpaymentcard', {
    name: 'supplierpaymentcard',
    action() {
        BlazeLayout.render('layout', {
            yield: 'supplierpaymentcard'
        });
    }
});


authenticatedRoutes.route('/settings', {
    name: 'settings',
    action() {
        BlazeLayout.render('layout', {
            yield: 'settings'
        });
    }
});

authenticatedRoutes.route('/organisationsettings', {
    name: 'organisationsettings',
    action() {
        BlazeLayout.render('layout', {
            yield: 'organisationsettings'
        });
    }
});

authenticatedRoutes.route('/accesslevel', {
    name: 'accesslevel',
    action() {
        BlazeLayout.render('layout', {
            yield: 'accesslevel'
        });
    }
});

authenticatedRoutes.route('/companyappsettings', {
    name: 'companyappsettings',
    action() {
        BlazeLayout.render('layout', {
            yield: 'companyappsettings'
        });
    }
});

authenticatedRoutes.route('/balancesheetreport', {
    name: 'balancesheetreport',
    action() {
        BlazeLayout.render('layout', {
            yield: 'balancesheetreport'
        });
    }
});

authenticatedRoutes.route('/balancetransactionlist', {
    name: 'balancetransactionlist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'balancetransactionlist'
        });
    }
});

authenticatedRoutes.route('/basreturntransactionlist', {
    name: 'basreturntransactionlist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'basreturntransactionlist'
        });
    }
});

authenticatedRoutes.route('/vatreturntransactionlist', {
    name: 'vatreturntransactionlist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'vatreturntransactionlist'
        });
    }
});

authenticatedRoutes.route('/allreports', {
    name: 'allreports',
    action() {
        BlazeLayout.render('layout', {
            yield: 'allreports'
        });
    }
});

authenticatedRoutes.route('/accountant_company', {
    name: 'accountant_company',
    action() {
        BlazeLayout.render('layout', {
            yield: 'accountant_company'
        });
    }
});

authenticatedRoutes.route('/accountant_companyastrustee', {
    name: 'accountant_companyastrustee',
    action() {
        BlazeLayout.render('layout', {
            yield: 'accountant_companyastrustee'
        });
    }
});

authenticatedRoutes.route('/accountant_financialstatement', {
    name: 'accountant_financialstatement',
    action() {
        BlazeLayout.render('layout', {
            yield: 'accountant_financialstatement'
        });
    }
});

authenticatedRoutes.route('/accountant_individual', {
    name: 'accountant_individual',
    action() {
        BlazeLayout.render('layout', {
            yield: 'accountant_individual'
        });
    }
});

authenticatedRoutes.route('/accountant_partnershipnontrading', {
    name: 'accountant_partnershipnontrading',
    action() {
        BlazeLayout.render('layout', {
            yield: 'accountant_partnershipnontrading'
        });
    }
});

authenticatedRoutes.route('/accountant_trustnontrading', {
    name: 'accountant_trustnontrading',
    action() {
        BlazeLayout.render('layout', {
            yield: 'accountant_trustnontrading'
        });
    }
});

authenticatedRoutes.route('/accountant_selfmanagedsuperfund', {
    name: 'accountant_selfmanagedsuperfund',
    action() {
        BlazeLayout.render('layout', {
            yield: 'accountant_selfmanagedsuperfund'
        });
    }
});

authenticatedRoutes.route('/accountant_singledirector', {
    name: 'accountant_singledirector',
    action() {
        BlazeLayout.render('layout', {
            yield: 'accountant_singledirector'
        });
    }
});

authenticatedRoutes.route('/accountant_soletradernontrading', {
    name: 'accountant_soletradernontrading',
    action() {
        BlazeLayout.render('layout', {
            yield: 'accountant_soletradernontrading'
        });
    }
});

authenticatedRoutes.route('/accountant_trust', {
    name: 'accountant_trust',
    action() {
        BlazeLayout.render('layout', {
            yield: 'accountant_trust'
        });
    }
});

authenticatedRoutes.route('/productsalesreport', {
    name: 'productsalesreport',
    action() {
        BlazeLayout.render('layout', {
            yield: 'productsalesreport'
        });
    }
});

authenticatedRoutes.route('/salesreport', {
    name: 'salesreport',
    action() {
        BlazeLayout.render('layout', {
            yield: 'salesreport'
        });
    }
});


authenticatedRoutes.route('/salessummaryreport', {
    name: 'salessummaryreport',
    action() {
        BlazeLayout.render('layout', {
            yield: 'salessummaryreport'
        });
    }
});


authenticatedRoutes.route('/profitlossreport', {
    name: 'profitlossreport',
    action() {
        BlazeLayout.render('layout', {
            yield: 'profitlossreport'
        });
    }
});

authenticatedRoutes.route('/newprofitandloss', {
    name: 'newprofitandloss',
    action() {
        BlazeLayout.render('layout', {
            yield: 'newprofitandloss'
        });
    }
});

authenticatedRoutes.route('/taxsummaryreport', {
    name: 'taxsummaryreport',
    action() {
        BlazeLayout.render('layout', {
            yield: 'taxsummaryreport'
        });
    }
});

authenticatedRoutes.route('/productview', {
    name: 'productview',
    action() {
        BlazeLayout.render('layout', {
            yield: 'productview'
        });
    }
});

authenticatedRoutes.route('/paymentoverview', {
    name: 'paymentoverview',
    action() {
        BlazeLayout.render('layout', {
            yield: 'paymentoverview'
        });
    }
});

authenticatedRoutes.route('/bankingoverview', {
    name: 'bankingoverview',
    action() {
        BlazeLayout.render('layout', {
            yield: 'bankingoverview'
        });
    }
});
authenticatedRoutes.route('/supplierdetail', {
    name: 'supplierdetail',
    action() {
        BlazeLayout.render('layout', {
            yield: 'supplierdetail'
        });
    }
});
authenticatedRoutes.route('/suppliersummary', {
    name: 'suppliersummary',
    action() {
        BlazeLayout.render('layout', {
            yield: 'suppliersummary'
        });
    }
});
authenticatedRoutes.route('/supplierreport', {
    name: 'supplierreport',
    action() {
        BlazeLayout.render('layout', {
            yield: 'supplierreport'
        });
    }
});

authenticatedRoutes.route('/reconciliation', {
    name: 'reconciliation',
    action() {
        BlazeLayout.render('layout', {
            yield: 'reconciliation'
        });
    }
});

authenticatedRoutes.route('/reconciliationlist', {
    name: 'reconciliationlist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'reconciliationlist'
        });
    }
});

authenticatedRoutes.route('/appointmentlist', {
    name: 'appointmentlist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'appointmentlist'
        });
    }
});

authenticatedRoutes.route('/customerawaitingpayments', {
    name: 'customerawaitingpayments',
    action() {
        BlazeLayout.render('layout', {
            yield: 'customerawaitingpayments'
        });
    }
});

authenticatedRoutes.route('/overduecustomerawaitingpayments', {
    name: 'overduecustomerawaitingpayments',
    action() {
        BlazeLayout.render('layout', {
            yield: 'overduecustomerawaitingpayments'
        });
    }
});

authenticatedRoutes.route('/customerpayment', {
    name: 'customerpayment',
    action() {
        BlazeLayout.render('layout', {
            yield: 'customerpayment'
        });
    }
});

authenticatedRoutes.route('/supplierawaitingpurchaseorder', {
    name: 'supplierawaitingpurchaseorder',
    action() {
        BlazeLayout.render('layout', {
            yield: 'supplierawaitingpurchaseorder'
        });
    }
});

authenticatedRoutes.route('/overduesupplierawaiting', {
    name: 'overduesupplierawaiting',
    action() {
        BlazeLayout.render('layout', {
            yield: 'overduesupplierawaiting'
        });
    }
});

authenticatedRoutes.route('/supplierawaitingbills', {
    name: 'supplierawaitingbills',
    action() {
        BlazeLayout.render('layout', {
            yield: 'supplierawaitingbills'
        });
    }
});

authenticatedRoutes.route('/supplierbills', {
    name: 'supplierbills',
    action() {
        BlazeLayout.render('layout', {
            yield: 'supplierbills'
        });
    }
});

authenticatedRoutes.route('/supplierpayment', {
    name: 'supplierpayment',
    action() {
        BlazeLayout.render('layout', {
            yield: 'supplierpayment'
        });
    }
});

authenticatedRoutes.route('/formnewbill', {
    name: 'formnewbill',
    action() {
        BlazeLayout.render('layout', {
            yield: 'formnewbill'
        });
    }
});

authenticatedRoutes.route('/creditcard', {
    name: 'creditcard',
    action() {
        BlazeLayout.render('layout', {
            yield: 'creditcard'
        });
    }
});

authenticatedRoutes.route('/agedpayables', {
    name: 'agedpayables',
    action() {
        BlazeLayout.render('layout', {
            yield: 'agedpayables'
        });
    }
});

authenticatedRoutes.route('/agedpayablessummary', {
    name: 'agedpayablessummary',
    action() {
        BlazeLayout.render('layout', {
            yield: 'agedpayablessummary'
        });
    }
});

authenticatedRoutes.route('/agedreceivables', {
    name: 'agedreceivables',
    action() {
        BlazeLayout.render('layout', {
            yield: 'agedreceivables'
        });
    }
});

authenticatedRoutes.route('/agedreceivablessummary', {
    name: 'agedreceivablessummary',
    action() {
        BlazeLayout.render('layout', {
            yield: 'agedreceivablessummary'
        });
    }
});
// Here
authenticatedRoutes.route('/trialbalance', {
    name: 'trialbalance',
    action() {
        BlazeLayout.render('layout', {
            yield: 'trialbalance'
        });
    }
});

authenticatedRoutes.route('/executivesummaryreport', {
    name: 'executivesummaryreport',
    action() {
        BlazeLayout.render('layout', {
            yield: 'executivesummaryreport'
        });
    }
});

// authenticatedRoutes.route('/settings/currencies', {
//     name: 'currenciesSettings',
//     action() {
//         BlazeLayout.render('layout', {
//             yield: 'currenciesSettings'
//         });
//     }
// });

authenticatedRoutes.route('/currenciessettings', {
    name: 'currenciessettings',
    action() {
        BlazeLayout.render('layout', {
            yield: 'currenciessettings'
        });
    }
});

authenticatedRoutes.route('/taxratesettings', {
    name: 'taxRatesSettings',
    action() {
        BlazeLayout.render('layout', {
            yield: 'taxRatesSettings'
        });
    }
});

authenticatedRoutes.route('/subtaxsettings', {
    name: 'subTaxesSettings',
    action() {
        BlazeLayout.render('layout', {
            yield: 'subTaxesSettings'
        });
    }
});

authenticatedRoutes.route('/generalledger', {
    name: 'generalledger',
    action() {
        BlazeLayout.render('layout', {
            yield: 'generalledger'
        });
    }
});

authenticatedRoutes.route('/1099report', {
    name: 'report1099',
    action() {
        BlazeLayout.render('layout', {
            yield: 'report1099'
        });
    }
});

authenticatedRoutes.route('/printstatement', {
    name: 'printstatement',
    action() {
        BlazeLayout.render('layout', {
            yield: 'printstatement'
        });
    }
});

authenticatedRoutes.route('/purchasesreport', {
    name: 'purchasesreport',
    action() {
        BlazeLayout.render('layout', {
            yield: 'purchasesreport'
        });
    }
});

authenticatedRoutes.route('/purchasesummaryreport', {
    name: 'purchasesummaryreport',
    action() {
        BlazeLayout.render('layout', {
            yield: 'purchasesummaryreport'
        });
    }
});

authenticatedRoutes.route('/departmentSettings', {
    name: 'departmentSettings',
    action() {
        BlazeLayout.render('layout', {
            yield: 'departmentSettings'
        });
    }
});

authenticatedRoutes.route('/reportsAccountantSettings', {
    name: 'reportsAccountantSettings',
    action() {
        BlazeLayout.render('layout', {
            yield: 'reportsAccountantSettings'
        });
    }
});

authenticatedRoutes.route('/clienttypesettings', {
    name: 'clienttypesettings',
    action() {
        BlazeLayout.render('layout', {
            yield: 'clienttypesettings'
        });
    }
});

authenticatedRoutes.route('/leadstatussettings', {
    name: 'leadstatussettings',
    action() {
        BlazeLayout.render('layout', {
            yield: 'leadstatussettings'
        });
    }
});

authenticatedRoutes.route('/paymentmethodSettings', {
    name: 'paymentmethodSettings',
    action() {
        BlazeLayout.render('layout', {
            yield: 'paymentmethodSettings'
        });
    }
});

authenticatedRoutes.route('/termsettings', {
    name: 'termsettings',
    action() {
        BlazeLayout.render('layout', {
            yield: 'termsettings'
        });
    }
});

authenticatedRoutes.route('/stockAdjustmentOverview', {
    name: 'stockadjustmentoverview',
    action() {
        BlazeLayout.render('layout', {
            yield: 'stockadjustmentoverview'
        });
    }
});
authenticatedRoutes.route('/stockadjustmentcard', {
    name: 'stockadjustmentcard',
    action() {
        BlazeLayout.render('layout', {
            yield: 'stockadjustmentcard'
        });
    }
});

authenticatedRoutes.route('/stocktransferlist', {
    name: 'stocktransferlist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'stocktransferlist'
        });
    }
});
authenticatedRoutes.route('/stocktransfercard', {
    name: 'stocktransfercard',
    action() {
        BlazeLayout.render('layout', {
            yield: 'stocktransfercard'
        });
    }
});

authenticatedRoutes.route('/journalentrycard', {
    name: 'journalentrycard',
    action() {
        BlazeLayout.render('layout', {
            yield: 'journalentrycard'
        });
    }
});
authenticatedRoutes.route('/journalentrylist', {
    name: 'journalentrylist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'journalentrylist'
        });
    }
});

authenticatedRoutes.route('/basreturn', {
  name: 'basreturn',
  action() {
      BlazeLayout.render('layout', {
          yield: 'basreturn'
      });
  }
});
authenticatedRoutes.route('/basreturnlist', {
  name: 'basreturnlist',
  action() {
      BlazeLayout.render('layout', {
          yield: 'basreturnlist'
      });
  }
});

authenticatedRoutes.route('/vatreturn', {
    name: 'vatreturn',
    action() {
        BlazeLayout.render('layout', {
            yield: 'vatreturn'
        });
    }
});
authenticatedRoutes.route('/vatreturnlist', {
    name: 'vatreturnlist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'vatreturnlist'
        });
    }
});

authenticatedRoutes.route('/timesheet', {
    name: 'timesheet',
    action() {
        BlazeLayout.render('layout', {
            yield: 'timesheet'
        });
    }
});

authenticatedRoutes.route('/timesheettimelog', {
    name: 'timesheettimelog',
    action() {
        BlazeLayout.render('layout', {
            yield: 'timesheettimelog'
        });
    }
});

authenticatedRoutes.route('/squareapi', {
    name: 'squareapi',
    action() {
        BlazeLayout.render('layout', {
            yield: 'squareapi'
        });
    }
});

authenticatedRoutes.route('/paychexapi', {
    name: 'paychexapi',
    action() {
        BlazeLayout.render('layout', {
            yield: 'paychexapi'
        });
    }
});

authenticatedRoutes.route('/adpapi', {
    name: 'adpapi',
    action() {
        BlazeLayout.render('layout', {
            yield: 'adpapi'
        });
    }
});

authenticatedRoutes.route('/stsdashboard', {
    name: 'stsdashboard',
    action() {
        BlazeLayout.render('layout', {
            yield: 'stsdashboard'
        });
    }
});

authenticatedRoutes.route('/stsplants', {
    name: 'stsplants',
    action() {
        BlazeLayout.render('layout', {
            yield: 'stsplants'
        });
    }
});

authenticatedRoutes.route('/stsharvests', {
    name: 'stsharvests',
    action() {
        BlazeLayout.render('layout', {
            yield: 'stsharvests'
        });
    }
});

authenticatedRoutes.route('/stspackages', {
    name: 'stspackages',
    action() {
        BlazeLayout.render('layout', {
            yield: 'stspackages'
        });
    }
});

authenticatedRoutes.route('/stsoverviews', {
    name: 'stsoverviews',
    action() {
        BlazeLayout.render('layout', {
            yield: 'stsoverviews'
        });
    }
});

authenticatedRoutes.route('/stscreateplantings', {
    name: 'stscreateplantings',
    action() {
        BlazeLayout.render('layout', {
            yield: 'stscreateplantings'
        });
    }
});

authenticatedRoutes.route('/stschangegrowthphase', {
    name: 'stschangegrowthphase',
    action() {
        BlazeLayout.render('layout', {
            yield: 'stschangegrowthphase'
        });
    }
});

authenticatedRoutes.route('/stsrecordadditives', {
    name: 'stsrecordadditives',
    action() {
        BlazeLayout.render('layout', {
            yield: 'stsrecordadditives'
        });
    }
});

authenticatedRoutes.route('/stschangeroom', {
    name: 'stschangeroom',
    action() {
        BlazeLayout.render('layout', {
            yield: 'stschangeroom'
        });
    }
});

authenticatedRoutes.route('/stsmanicureplants', {
    name: 'stsmanicureplants',
    action() {
        BlazeLayout.render('layout', {
            yield: 'stsmanicureplants'
        });
    }
});

authenticatedRoutes.route('/stsdestroyplants', {
    name: 'stsdestroyplants',
    action() {
        BlazeLayout.render('layout', {
            yield: 'stsdestroyplants'
        });
    }
});

authenticatedRoutes.route('/ststaghistory', {
    name: 'ststaghistory',
    action() {
        BlazeLayout.render('layout', {
            yield: 'ststaghistory'
        });
    }
});

authenticatedRoutes.route('/stscreateharvests', {
    name: 'stscreateharvests',
    action() {
        BlazeLayout.render('layout', {
            yield: 'stscreateharvests'
        });
    }
});

authenticatedRoutes.route('/stsharvestlist', {
    name: 'stsharvestlist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'stsharvestlist'
        });
    }
});

authenticatedRoutes.route('/stscreatepackagefromharvest', {
    name: 'stscreatepackagefromharvest',
    action() {
        BlazeLayout.render('layout', {
            yield: 'stscreatepackagefromharvest'
        });
    }
});

authenticatedRoutes.route('/stscreatepackagefrompackages', {
    name: 'stscreatepackagefrompackages',
    action() {
        BlazeLayout.render('layout', {
            yield: 'stscreatepackagefrompackages'
        });
    }
});

authenticatedRoutes.route('/stscreatepackagesfromharvest', {
    name: 'stscreatepackagesfromharvest',
    action() {
        BlazeLayout.render('layout', {
            yield: 'stscreatepackagesfromharvest'
        });
    }
});

authenticatedRoutes.route('/stspackagelist', {
    name: 'stspackagelist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'stspackagelist'
        });
    }
});

authenticatedRoutes.route('/stsactivitylog', {
    name: 'stsactivitylog',
    action() {
        BlazeLayout.render('layout', {
            yield: 'stsactivitylog'
        });
    }
});

authenticatedRoutes.route('/ststagorderlist', {
    name: 'ststagorderlist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'ststagorderlist'
        });
    }
});

authenticatedRoutes.route('/stsactiveinventory', {
    name: 'stsactiveinventory',
    action() {
        BlazeLayout.render('layout', {
            yield: 'stsactiveinventory'
        });
    }
});

authenticatedRoutes.route('/stssettings', {
    name: 'stssettings',
    action() {
        BlazeLayout.render('layout', {
            yield: 'stssettings'
        });
    }
});

authenticatedRoutes.route('/ststransfers', {
    name: 'ststransfers',
    action() {
        BlazeLayout.render('layout', {
            yield: 'ststransfers'
        });
    }
});

authenticatedRoutes.route('/stscreatetransfer', {
    name: 'stscreatetransfer',
    action() {
        BlazeLayout.render('layout', {
            yield: 'stscreatetransfer'
        });
    }
});

authenticatedRoutes.route('/stsaddtransfercontent', {
    name: 'stsaddtransfercontent',
    action() {
        BlazeLayout.render('layout', {
            yield: 'stsaddtransfercontent'
        });
    }
});

authenticatedRoutes.route('/ststransferhistory', {
    name: 'ststransferhistory',
    action() {
        BlazeLayout.render('layout', {
            yield: 'ststransferhistory'
        });
    }
});

authenticatedRoutes.route('/stsprintlabels', {
    name: 'stsprintlabels',
    action() {
        BlazeLayout.render('layout', {
            yield: 'stsprintlabels'
        });
    }
});

authenticatedRoutes.route('/stslocationoverview', {
    name: 'stslocationoverview',
    action() {
        BlazeLayout.render('layout', {
            yield: 'stslocationoverview'
        });
    }
});

authenticatedRoutes.route('/stsoutgoingorders', {
    name: 'stsoutgoingorders',
    action() {
        BlazeLayout.render('layout', {
            yield: 'stsoutgoingorders'
        });
    }
});

authenticatedRoutes.route('/featureallocation', {
    name: 'featureallocation',
    action() {
        BlazeLayout.render('layout', {
            yield: 'featureallocation'
        });
    }
});

authenticatedRoutes.route('/registersts', {
    name: 'registersts',
    action() {
        BlazeLayout.render('layout', {
            yield: 'registersts'
        });
    }
});

authenticatedRoutes.route('/bankrecon', {
    name: 'bankrecon',
    action() {
        BlazeLayout.render('layout', {
            yield: 'bankrecon'
        });
    }
});

authenticatedRoutes.route('/newbankrecon', {
    name: 'newbankrecon',
    action() {
        BlazeLayout.render('layout', {
            yield: 'newbankrecon'
        });
    }
});

authenticatedRoutes.route('/newreconrule', {
    name: 'newreconrule',
    action() {
        BlazeLayout.render('layout', {
            yield: 'newreconrule'
        });
    }
});

authenticatedRoutes.route('/reconrulelist', {
    name: 'reconrulelist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'reconrulelist'
        });
    }
});

authenticatedRoutes.route('/newbankrule', {
    name: 'newbankrule',
    action() {
        BlazeLayout.render('layout', {
            yield: 'newbankrule'
        });
    }
});

authenticatedRoutes.route('/bankrulelist', {
    name: 'bankrulelist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'bankrulelist'
        });
    }
});

authenticatedRoutes.route('/depositcard', {
    name: 'depositcard',
    action() {
        BlazeLayout.render('layout', {
            yield: 'depositcard'
        });
    }
});

authenticatedRoutes.route('/depositlist', {
    name: 'depositlist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'depositlist'
        });
    }
});

authenticatedRoutes.route('/linktrueerp', {
    name: 'linktrueerp',
    action() {
        BlazeLayout.render('layout', {
            yield: 'linktrueerp'
        });
    }
});

authenticatedRoutes.route('/payrollrules', {
    name: 'payrollrules',
    action() {
        BlazeLayout.render('layout', {
            yield: 'payrollrules'
        });
    }
});

authenticatedRoutes.route('/emailsettings', {
    name: 'emailsettings',
    action() {
        BlazeLayout.render('layout', {
            yield: 'emailsettings'
        });
    }
});

authenticatedRoutes.route('/emailtemplate', {
    name: 'emailtemplate',
    action() {
        BlazeLayout.render('layout', {
            yield: 'emailtemplate'
        });
    }
});

authenticatedRoutes.route('/subscriptionSettings', {
    name: 'subscriptionSettings',
    action() {
        BlazeLayout.render('layout', {
            yield: 'subscriptionSettings'
        });
    }
});

authenticatedRoutes.route('/employeetimeclock', {
    name: 'employeetimeclock',
    action() {
        BlazeLayout.render('layout', {
            yield: 'employeetimeclock'
        });
    }
});

authenticatedRoutes.route('/vs1shipping', {
    name: 'vs1shipping',
    action() {
        BlazeLayout.render('layout', {
            yield: 'vs1shipping'
        });
    }
});

authenticatedRoutes.route('/shippingdocket', {
    name: 'shippingdocket',
    action() {
        BlazeLayout.render('layout', {
            yield: 'shippingdocket'
        });
    }
});

authenticatedRoutes.route('/backuprestore', {
    name: 'backuprestore',
    action() {
        BlazeLayout.render('layout', {
            yield: 'backuprestore'
        });
    }
});

authenticatedRoutes.route('/receiptsoverview', {
    name: 'receiptsoverview',
    action() {
        BlazeLayout.render('layout', {
            yield: 'receiptsoverview'
        });
    }
});

authenticatedRoutes.route('/tasklist', {
  name: 'tasklist',
  action() {
      BlazeLayout.render('layout', {
          yield: 'tasklist'
      });
  }
});

authenticatedRoutes.route('/tasktoday', {
    name: 'tasktoday',
    action() {
        BlazeLayout.render('layout', {
            yield: 'tasktoday'
        });
    }
});

authenticatedRoutes.route('/taskupcoming', {
    name: 'taskupcoming',
    action() {
        BlazeLayout.render('layout', {
            yield: 'taskupcoming'
        });
    }
});

authenticatedRoutes.route('/filterslabels', {
    name: 'filterslabels',
    action() {
        BlazeLayout.render('layout', {
            yield: 'filterslabels'
        });
    }
});

authenticatedRoutes.route('/projects', {
    name: 'projects',
    action() {
        BlazeLayout.render('layout', {
            yield: 'projects'
        });
    }
});

authenticatedRoutes.route('/crmoverview', {
    name: 'crmoverview',
    action() {
        BlazeLayout.render('layout', {
            yield: 'crmoverview'
        });
    }
});

authenticatedRoutes.route('/smssettings', {
    name: 'smssettings',
    action() {
        BlazeLayout.render('layout', {
            yield: 'smssettings'
        });
    }
});

authenticatedRoutes.route('/edi-integrations', {
    name: 'ediintegrations',
    action() {
        BlazeLayout.render('layout', {
            yield: 'ediintegrations'
        });
    }
});

authenticatedRoutes.route('/settings/fx-update', {
    name: 'fixUpdates',
    action() {
        BlazeLayout.render('layout', {
            yield: 'fixUpdates'
        });
    }
});

authenticatedRoutes.route('/templatesettings', {
    name: 'templatesettings',
    action() {
        BlazeLayout.render('layout', {
            yield: 'templatesettings'
        });
    }
});

authenticatedRoutes.route('/setup', {
    name: 'setup',
    action() {
        BlazeLayout.render('layoutlogin', {
            yield: 'setup'
        });
    }
});

authenticatedRoutes.route('/serialnumberreport', {
    name: 'serialnumberreport',
    action() {
        BlazeLayout.render('layout', {
            yield: 'serialnumberreport'
        });
    }
});

authenticatedRoutes.route('/leaveaccruedreport', {
    name: 'leaveaccruedreport',
    action() {
        BlazeLayout.render('layout', {
            yield: 'leaveaccruedreport'
        });
    }
});

authenticatedRoutes.route('/fxhistorylist', {
    name: 'fxhistorylist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'fxhistorylist'
        });
    }
});

authenticatedRoutes.route('/binlocationslist', {
    name: 'binlocationslist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'binlocationslist'
        });
    }
});

authenticatedRoutes.route('/timesheetsummary', {
    name: 'timesheetsummary',
    action() {
        BlazeLayout.render('layout', {
            yield: 'timesheetsummary'
        });
    }
});

authenticatedRoutes.route('/payrollhistoryreport', {
    name: 'payrollhistoryreport',
    action() {
        BlazeLayout.render('layout', {
            yield: 'payrollhistoryreport'
        });
    }
});

authenticatedRoutes.route('/stockvaluereport', {
    name: 'stockvaluereport',
    action() {
        BlazeLayout.render('layout', {
            yield: 'stockvaluereport'
        });
    }
});

authenticatedRoutes.route('/stockmovementreport', {
    name: 'stockmovementreport',
    action() {
        BlazeLayout.render('layout', {
            yield: 'stockmovementreport'
        });
    }
});

authenticatedRoutes.route('/stockquantitybylocation', {
    name: 'stockquantitybylocation',
    action() {
        BlazeLayout.render('layout', {
            yield: 'stockquantitybylocation'
        });
    }
});

authenticatedRoutes.route('/customerdetailsreport', {
    name: 'customerdetailsreport',
    action() {
        BlazeLayout.render('layout', {
            yield: 'customerdetailsreport'
        });
    }
});
authenticatedRoutes.route('/transactionjournal', {
    name: 'transactionjournallist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'transactionjournallist'
        });
    }
});

authenticatedRoutes.route('/customersummaryreport', {
    name: 'customersummaryreport',
    action() {
        BlazeLayout.render('layout', {
            yield: 'customersummaryreport'
        });
    }
});

authenticatedRoutes.route('/jobprofitabilityreport', {
    name: 'jobprofitabilityreport',
    action() {
        BlazeLayout.render('layout', {
            yield: 'jobprofitabilityreport'
        });
    }
});

authenticatedRoutes.route('/jobsalessummary', {
    name: 'jobsalessummary',
    action() {
        BlazeLayout.render('layout', {
            yield: 'jobsalessummary'
        });
    }
});

authenticatedRoutes.route('/supplierproductreport', {
    name: 'supplierproductreport',
    action() {
        BlazeLayout.render('layout', {
            yield: 'supplierproductreport'
        });
    }
});

authenticatedRoutes.route('/fx-currency-history', {
    name: 'FxCurrencyHistory',
    action() {
        BlazeLayout.render('layout', {
            yield: 'FxCurrencyHistory'
        });
    }
});

authenticatedRoutes.route('/payrollleavetaken', {
    name: 'payrollleavetaken',
    action() {
        BlazeLayout.render('layout', {
            yield: 'payrollleavetaken'
        });
    }
});


publicRoutes.route('/cron/currency-update/:_userId', {
    name: 'updateCurrencies',
    action() {
        BlazeLayout.render('updateCurrencies', {
            yield: 'updateCurrencies'
        });
    }
});
authenticatedRoutes.route('/uomSettings', {
    name: 'uomSettings',
    action() {
        BlazeLayout.render('layout', {
            yield: 'uomSettings'
        });
    }
});

authenticatedRoutes.route('/mailchimpsettings', {
  name: 'mailchimpSettings',
  action() {
      BlazeLayout.render('layout', {
          yield: 'mailchimpSettings'
      });
  }
});

authenticatedRoutes.route('/correspondence-list', {
  name: 'mailchimpList',
  action() {
      BlazeLayout.render('layout', {
          yield: 'mailchimpList'
      });
  }
});

authenticatedRoutes.route('/campaign-list', {
  name: 'mailchimpCampaignList',
  action() {
      BlazeLayout.render('layout', {
          yield: 'mailchimpCampaignList'
      });
  }
});

authenticatedRoutes.route('/tripgroup', {
    name: 'tripgroup',
    action() {
        BlazeLayout.render('layout', {
            yield: 'tripgroup'
        });
    }
});

authenticatedRoutes.route('/receiptcategory', {
    name: 'receiptcategory',
    action() {
        BlazeLayout.render('layout', {
            yield: 'receiptcategory'
        });
    }
});

authenticatedRoutes.route('/processlist', {
    name: 'processList',
    action() {
        BlazeLayout.render('layout', {
            yield: 'processList'
        });
    }
});

authenticatedRoutes.route('/processcard', {
  name: 'new_process',
  action() {
      BlazeLayout.render('layout', {
          yield: 'new_process'
      })
  }
})

authenticatedRoutes.route('/eft', {
  name: 'eft_export',
  action() {
      BlazeLayout.render('layout', {
          yield: 'eft_export'
      })
  }
})

authenticatedRoutes.route('/workordercard', {
    name: 'new_workorder',
    action() {
        BlazeLayout.render('layout', {
            yield: 'new_workorder'
        })
    }
})

authenticatedRoutes.route('/workorderlist', {
    name: 'workorderlist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'workorderlist'
        })
    }
})

authenticatedRoutes.route('/exebalancesheetreport', {
    name: 'exebalancesheetreport',
    action() {
        BlazeLayout.render('layout', {
            yield: 'exebalancesheetreport'
        });
    }
});

authenticatedRoutes.route('/execashreport', {
    name: 'execashreport',
    action() {
        BlazeLayout.render('layout', {
            yield: 'execashreport'
        });
    }
});

authenticatedRoutes.route('/exeincomereport', {
    name: 'exeincomereport',
    action() {
        BlazeLayout.render('layout', {
            yield: 'exeincomereport'
        });
    }
});

authenticatedRoutes.route('/exeperformancereport', {
    name: 'exeperformancereport',
    action() {
        BlazeLayout.render('layout', {
            yield: 'exeperformancereport'
        });
    }
});

authenticatedRoutes.route('/exepositionreport', {
    name: 'exepositionreport',
    action() {
        BlazeLayout.render('layout', {
            yield: 'exepositionreport'
        });
    }
});

authenticatedRoutes.route('/exeprofitabilityreport', {
    name: 'exeprofitabilityreport',
    action() {
        BlazeLayout.render('layout', {
            yield: 'exeprofitabilityreport'
        });
    }
});

authenticatedRoutes.route('/fixedassetsoverview', {
  name: 'fixedassetsoverview',
  action() {
      BlazeLayout.render('layout', {
          yield: 'fixedassetsoverview'
      });
  }
});

authenticatedRoutes.route('/fixedassetlist', {
  name: 'fixedassetlist',
  action() {
      BlazeLayout.render('layout', {
          yield: 'fixedassetlist'
      });
  }
});

authenticatedRoutes.route('/fixedassetcard', {
  name: 'fixedassetcard',
  action() {
      BlazeLayout.render('layout', {
          yield: 'fixedassetcard'
      });
  }
});

authenticatedRoutes.route('/assetcostreport', {
  name: 'assetcostreport',
  action() {
      BlazeLayout.render('layout', {
          yield: 'assetcostreport'
      });
  }
});

authenticatedRoutes.route('/assetregisteroverview', {
  name: 'assetregisteroverview',
  action() {
      BlazeLayout.render('layout', {
          yield: 'assetregisteroverview'
      });
  }
});

authenticatedRoutes.route('/servicelogcard', {
  name: 'servicelogcard',
  action() {
      BlazeLayout.render('layout', {
          yield: 'servicelogcard'
      });
  }
});

authenticatedRoutes.route('/serviceloglist', {
    name: 'serviceloglist',
    action() {
        BlazeLayout.render('layout', {
            yield: 'serviceloglist'
        });
    }
});

authenticatedRoutes.route('/bomlist', {
    name: 'bom_list',
    action(){
        BlazeLayout.render('layout', {
            yield: 'bom_list'
        })
    }
});

authenticatedRoutes.route('/bomsetupcard', {
    name: 'bom_setup',
    action() {
        BlazeLayout.render('layout', {
            yield: 'bom_setup'
        })
    }
});

authenticatedRoutes.route('/productionplanner', {
    name: 'production_planner',
    action() {
        BlazeLayout.render('layout',{
            yield: 'production_planner'
        })
    }
})