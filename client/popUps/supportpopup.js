import {
    TaxRateService
} from "../settings/settings-service";
import {
    ReactiveVar
} from 'meteor/reactive-var';
import {
    SideBarService
} from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
let sideBarService = new SideBarService();

Template.supportmodalpop.onCreated(function() {

});

Template.supportmodalpop.onRendered(function() {

    if (Session.get('ERPLoggedCountry') == "Australia") {
        //document.getElementById("phoneAUS").style.display = "block";
        document.getElementById("iconAUS").style.display = "block";

        var dt = new Date();
        var time = dt.getHours() + ":" + dt.getMinutes();

        // if (time >= "8:00" || time <= "16:00") {
        //     $("#phoneParentAUS").addClass("phoneOpen");
        //     $("#phoneChildAUS").addClass("phoneOpen");
        //     $("#phoneParentAUS").removeClass("phoneClosed");
        //     $("#phoneChildAUS").removeClass("phoneClosed");
        // } else {
        //     $("#phoneParentAUS").addClass("phoneClosed");
        //     $("#phoneChildAUS").addClass("phoneClosed");
        //     $("#phoneParentAUS").removeClass("phoneOpen");
        //     $("#phoneChildAUS").removeClass("phoneOpen");
        // }
    } else if (Session.get('ERPLoggedCountry') == "United States of America") {
        //document.getElementById("phoneUSA").style.display = "block";
        document.getElementById("iconUSA").style.display = "block";

        var dt = new Date();
        var time = dt.getHours() + ":" + dt.getMinutes();

        // if (time >= "8:00" || time <= "16:00") {
        //     $("#phoneParentUSA").addClass("phoneOpen");
        //     $("#phoneChildUSA").addClass("phoneOpen");
        //     $("#phoneParentUSA").removeClass("phoneClosed");
        //     $("#phoneChildUSA").removeClass("phoneClosed");
        // } else {
        //     $("#phoneParentUSA").addClass("phoneClosed");
        //     $("#phoneChildUSA").addClass("phoneClosed");
        //     $("#phoneParentUSA").removeClass("phoneOpen");
        //     $("#phoneChildUSA").removeClass("phoneOpen");
        // }
    } else if (Session.get('ERPLoggedCountry') == "South Africa") {
        //document.getElementById("phoneSA").style.display = "block";
        document.getElementById("iconSA").style.display = "block";

        var dt = new Date();
        var time = dt.getHours() + ":" + dt.getMinutes();

        // if (time >= "8:00" || time <= "16:00") {
        //     $("#phoneParentSA").addClass("phoneOpen");
        //     $("#phoneChildSA").addClass("phoneOpen");
        //     $("#phoneParentSA").removeClass("phoneClosed");
        //     $("#phoneChildSA").removeClass("phoneClosed");
        // } else {
        //     $("#phoneParentSA").addClass("phoneClosed");
        //     $("#phoneChildSA").addClass("phoneClosed");
        //     $("#phoneParentSA").removeClass("phoneOpen");
        //     $("#phoneChildSA").removeClass("phoneOpen");
        // }
    } else {
        //document.getElementById("phoneUSA").style.display = "block";
        document.getElementById("iconUSA").style.display = "block";

        var dt = new Date();
        var time = dt.getHours() + ":" + dt.getMinutes();

        // if (time >= "8:00" || time <= "16:00") {
        //     $("#phoneParentUSA").addClass("phoneOpen");
        // } else {
        //     $("#phoneParentUSA").addClass("phoneClosed");
        // }
    }

    function updateTime() {
            var currentTime = new Date();
            var officeOpenTime = '08:00 AM';
            var officeCloseTime = '04:00 PM';
            let joburgTime = new Intl.DateTimeFormat('en-za', {
                //weekday: 'long',
                hour: 'numeric',
                minute: 'numeric',
                // second: 'numeric',
                hour12: false,
                timeZone: 'Africa/Johannesburg',
                //timeZoneName: 'long'
            }).format(currentTime);
            let australiaTime = new Intl.DateTimeFormat('en-au', {
                //weekday: 'long',
                hour: 'numeric',
                minute: 'numeric',
                // second: 'numeric',
                hour12: false,
                timeZone: 'Australia/Queensland',
                //timeZoneName: 'long'
            }).format(currentTime);
            let unitedstateTime = new Intl.DateTimeFormat('en', {
                //weekday: 'long',
                hour: 'numeric',
                minute: 'numeric',
                // second: 'numeric',
                hour12: false,
                timeZone: 'America/New_York',
                //timeZoneName: 'long'
            }).format(currentTime);


            // document.getElementById("phoneSA").style.display = "block";
            // document.getElementById("phoneUSA").style.display = "block";
            // document.getElementById("phoneAUS").style.display = "block";
            // document.getElementById("iconSA").style.display = "block";
            let joburgTimeSplit = joburgTime.split(':')[0];
            joburgTime = parseInt(joburgTimeSplit) +':'+joburgTimeSplit.split(':')[1];

            if (joburgTime >= "8:00" || joburgTime <= "16:00") {
                $("#phoneParentSA").addClass("phoneOpen");
                $("#phoneChildSA").addClass("phoneOpen");
                $("#phoneParentSA").removeClass("phoneClosed");
                $("#phoneChildSA").removeClass("phoneClosed");
            } else {
                $("#phoneParentSA").addClass("phoneClosed");
                $("#phoneChildSA").addClass("phoneClosed");
                $("#phoneParentSA").removeClass("phoneOpen");
                $("#phoneChildSA").removeClass("phoneOpen");
            }

            let australiaTimeSplit = australiaTime.split(':')[0];
            australiaTime = parseInt(australiaTimeSplit) +':'+australiaTimeSplit.split(':')[1];
            if (australiaTime >= "8:00" || australiaTime <= "16:00") {
                $("#phoneParentAUS").addClass("phoneOpen");
                $("#phoneChildAUS").addClass("phoneOpen");
                $("#phoneParentAUS").removeClass("phoneClosed");
                $("#phoneChildAUS").removeClass("phoneClosed");
            } else {
                $("#phoneParentAUS").addClass("phoneClosed");
                $("#phoneChildAUS").addClass("phoneClosed");
                $("#phoneParentAUS").removeClass("phoneOpen");
                $("#phoneChildAUS").removeClass("phoneOpen");
            }

            let unitedstateTimeSplit = unitedstateTime.split(':')[0];
            unitedstateTime = parseInt(unitedstateTimeSplit) +':'+unitedstateTime.split(':')[1];
            if (unitedstateTime >= "8:00" || unitedstateTime <= "16:00") {
                $("#phoneParentUSA").addClass("phoneOpen");
                $("#phoneChildUSA").addClass("phoneOpen");
                $("#phoneParentUSA").removeClass("phoneClosed");
                $("#phoneChildUSA").removeClass("phoneClosed");
            } else {
                $("#phoneParentUSA").addClass("phoneClosed");
                $("#phoneChildUSA").addClass("phoneClosed");
                $("#phoneParentUSA").removeClass("phoneOpen");
                $("#phoneChildUSA").removeClass("phoneOpen");
            }

        }
        setInterval(updateTime, 1000);

  var url = FlowRouter.current().path;
  if (url.includes("/accountsoverview")) {
    $('.btnDownloadHelpFile').attr("href","https://vs1forum.com/viewtopic.php?f=6&t=30");
  }else if(url.includes("/journalentrylist")) {
    $('.btnDownloadHelpFile').attr("href","https://vs1forum.com/");
  }else if(url.includes("/journalentrycard")) {
    $('.btnDownloadHelpFile').attr("href","https://vs1forum.com/");
  }else if(url.includes("/appointments")) {
    $('.btnDownloadHelpFile').attr("href","https://vs1forum.com/viewtopic.php?f=6&t=56");
  }else if(url.includes("/appointmentlist")) {
    $('.btnDownloadHelpFile').attr("href","https://vs1forum.com/");
  }else if(url.includes("/appointmenttimelist")) {
    $('.btnDownloadHelpFile').attr("href","https://vs1forum.com/");
  }else if(url.includes("/bankingoverview")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewforum.php?f=6");
  }else if(url.includes("/depositlist")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewtopic.php?f=6&t=76");
  }else if(url.includes("/depositcard")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/");
  }else if(url.includes("/chequelist")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewtopic.php?f=6&t=36");
  }else if(url.includes("/chequecard")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/");
  }else if(url.includes("/reconciliationlist")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/");
  }else if(url.includes("/bankrecon")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/");
  }else if(url.includes("/eft")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewforum.php?f=6");
  }else if(url.includes("/newbankrecon")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/");
  }else if(url.includes("/eft")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewforum.php?f=6");
  }else if(url.includes("/contactoverview")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewtopic.php?f=6&t=35");
  }else if(url.includes("/customerlist")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewforum.php?f=6");
  }else if(url.includes("/customerscard")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewtopic.php?f=6&t=59");
  }else if(url.includes("/employeelist")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewtopic.php?f=6&t=16&p=20#p20");
  }else if(url.includes("/employeescard")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewtopic.php?f=6&t=38");
  }else if(url.includes("/leadlist")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewtopic.php?f=6&t=16&p=20#p20");
  }else if(url.includes("/leadscard")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewtopic.php?f=6&t=59");
  }else if(url.includes("/supplierlist")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/");
  }else if(url.includes("/supplierscard")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewtopic.php?f=6&t=53");
  }else if(url.includes("/joblist")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/");
  }else if(url.includes("/crmoverview")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewforum.php?f=6");
  }else if(url.includes("/dashboard")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewforum.php?f=6");
  }else if(url.includes("/dashboardexe")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewforum.php?f=6");
  }else if(url.includes("/dashboardsalesmanager")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewforum.php?f=6");
  }else if(url.includes("/dashboardsales")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewforum.php?f=6");
  }else if(url.includes("/dashboardsalesmy")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewforum.php?f=6");
  }else if(url.includes("/processlist")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewforum.php?f=6");
  }else if(url.includes("/processlist")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewforum.php?f=6");
  }else if(url.includes("/processcard")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewforum.php?f=6");
  }else if(url.includes("/inventorylist")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewforum.php?f=6");
  }else if(url.includes("/productview")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/");
  }else if(url.includes("/productlist")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewforum.php?f=6");
  }else if(url.includes("/stockadjustmentoverview")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/");
  }else if(url.includes("/stockadjustmentcard")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/");
  }else if(url.includes("/stocktransferlist")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/");
  }else if(url.includes("/stocktransfercard")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/");
  }else if(url.includes("/lotnumberlist")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/");
  }else if(url.includes("/serialnumberlist")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/");
  }else if(url.includes("/paymentoverview")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewforum.php?f=6/");
  }else if(url.includes("/customerpayment")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/");
  }else if(url.includes("/customerpayment")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/");
  }else if(url.includes("/paymentcard")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/");
  }else if(url.includes("/supplierpaymentcard")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/");
  }else if(url.includes("/customerawaitingpayments")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewtopic.php?f=6&t=77");
  }else if(url.includes("/supplierawaitingpurchaseorder")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewtopic.php?f=6&t=78");
  }else if(url.includes("/supplierpayment")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/");
  }else if(url.includes("/statementlist")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewtopic.php?f=6&t=45");
  }else if(url.includes("/payrolloverview")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewtopic.php?f=6&t=16&p=20#p20");
  }else if(url.includes("/timesheet")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewforum.php?f=6");
  }else if(url.includes("/timesheettimelog")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewforum.php?f=6");
  }else if(url.includes("/singletouch")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewforum.php?f=6");
  }else if(url.includes("/payrun")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewforum.php?f=6");
  }else if(url.includes("/payrundetails")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewforum.php?f=6");
  }else if(url.includes("/receiptsoverview")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewforum.php?f=6");
  }else if(url.includes("/receiptcategory")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewforum.php?f=6");
  }else if(url.includes("/tripgroup")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewforum.php?f=6");
  }else if(url.includes("/purchasesoverview")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewforum.php?f=6");
  }else if(url.includes("/purchaseorderlist")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewtopic.php?f=6&t=48");
  }else if(url.includes("/purchaseordercard")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewtopic.php?f=6&t=48");
  }else if(url.includes("/billlist")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/");
  }else if(url.includes("/billcard")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/");
  }else if(url.includes("/creditlist")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/");
  }else if(url.includes("/creditcard")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/");
  }else if(url.includes("/salesoverview")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewtopic.php?f=6&t=54");
  }else if(url.includes("/quoteslist")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/");
  }else if(url.includes("/quotecard")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewtopic.php?f=6&t=63");
  }else if(url.includes("/salesorderslist")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewtopic.php?f=6&t=55");
  }else if(url.includes("/salesordercard")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewtopic.php?f=6&t=65");
  }else if(url.includes("/salesordercard")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewtopic.php?f=6&t=65");
  }else if(url.includes("/invoicelist")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewtopic.php?f=6&t=40");
  }else if(url.includes("/invoicecard")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewtopic.php?f=6&t=60");
  }else if(url.includes("/invoicelistBO")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewtopic.php?f=6&t=60");
  }else if(url.includes("/refundlist")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewtopic.php?f=6&t=40");
  }else if(url.includes("/refundcard")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewtopic.php?f=6&t=64");
  }else if(url.includes("/organisationsettings")) {
    //$('.btnDownloadHelpFile').attr("https://vs1forum.com/viewtopic.php?f=6&t=64");
  }else if(url.includes("/companyappsettings")) {
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/");
  }else{
    $('.btnDownloadHelpFile').attr("https://vs1forum.com/viewforum.php?f=6");
  }
});


Template.supportmodalpop.events({
    'click .btnAddNewTerm': function(event) {
        setTimeout(function() {
            $('#edtName').focus();
        }, 1000);
    }
});

Template.supportmodalpop.helpers({});

Template.supportmodalpop.events({
    // 'click .btnViewHelpVideo': async function (event) {
    //     $('#supportModal').modal('toggle');
    //     $('.modal-backdrop').css('display', 'none');
    //     // setTimeout(function() {
    //     //
    //     // }, 1000);
    // }

});
