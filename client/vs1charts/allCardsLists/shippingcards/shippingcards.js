import {
    ReactiveVar
} from 'meteor/reactive-var';
import {CoreService} from '../../../js/core-service';
import {
    EmployeeProfileService
} from "../../../js/profile-service";
import {
    AccountService
} from "../../../accounts/account-service";
import {
    UtilityService
} from "../../../utility-service";
import {
    SideBarService
} from '../../../js/sidebar-service';
import '../../../lib/global/indexdbstorage.js';
let sideBarService = new SideBarService();
let utilityService = new UtilityService();
const _tabGroup = 11;
Template.shippingcards.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
});

Template.shippingcards.onRendered(function() {
    let templateObject = Template.instance();
    let accountService = new AccountService();
    const customerList = [];
    let salesOrderTable;
    var splashArray = new Array();
    setTimeout(function() {
        $("#barcodeScanInput").focus();
    }, 200);

    if (FlowRouter.current().queryParams.success) {
        $('.btnRefresh').addClass('btnRefreshAlert');
    }

    function onScanSuccess(decodedText, decodedResult) {
        //document.getElementById("barcodeScanInput").value = decodedText;

        var barcode = decodedText.toUpperCase();
        $('#scanBarcodeModalShippingOverview').modal('toggle');
        if (barcode != '') {
            if (barcode.length <= 2) {
                $('.fullScreenSpin').css('display', 'none');
                swal('<strong>WARNING:</strong> Invalid Barcode "' + barcode + '"', '', 'warning');
                DangerSound();
                e.preventDefault();
            } else {
                var segs = barcode.split('-');
                if (segs[0] == Barcode_Prefix_Sale) {
                    var sales_ID = segs[1];
                    var erpGet = erpDb();
                    var oReqSID = new XMLHttpRequest();
                    oReqSID.open("GET", 'https://' + erpGet.ERPIPAddress + ':' + erpGet.ERPPort + '/' + erpGet.ERPApi + '/SaleGroup?SaleID=' + sales_ID, true);
                    oReqSID.setRequestHeader("database", erpGet.ERPDatabase);
                    oReqSID.setRequestHeader("username", erpGet.ERPUsername);
                    oReqSID.setRequestHeader("password", erpGet.ERPPassword);
                    oReqSID.send();

                    oReqSID.timeout = 30000;
                    oReqSID.onreadystatechange = function() {
                        if (oReqSID.readyState == 4 && oReqSID.status == 200) {
                            var dataListRet = JSON.parse(oReqSID.responseText)
                            for (var event in dataListRet) {
                                var dataCopy = dataListRet[event];
                                for (var data in dataCopy) {
                                    var mainData = dataCopy[data];
                                    var salesType = mainData.TransactionType;
                                    var salesID = mainData.SaleID;
                                }
                            }
                            if (salesType == "Invoice") {
                                window.open('/shippingdocket?id=' + salesID, '_self');
                            } else {
                                $('.fullScreenSpin').css('display', 'none');

                                swal('<strong>WARNING:</strong> No Invoice with that number "' + barcode + '"', '', 'warning');
                                DangerSound();
                                e.preventDefault();
                            }


                        }


                    }


                } else if (segs[0] == Barcode_Prefix_SalesLine) {
                    var salesLine_ID = segs[1];
                    var erpGet = erpDb();
                    var oReqSLineID = new XMLHttpRequest();
                    oReqSLineID.open("GET", 'https://' + erpGet.ERPIPAddress + ':' + erpGet.ERPPort + '/' + erpGet.ERPApi + '/SaleGroup?SaleLineID=' + salesLine_ID, true);
                    oReqSLineID.setRequestHeader("database", erpGet.ERPDatabase);
                    oReqSLineID.setRequestHeader("username", erpGet.ERPUsername);
                    oReqSLineID.setRequestHeader("password", erpGet.ERPPassword);
                    oReqSLineID.send();

                    oReqSLineID.timeout = 30000;
                    oReqSLineID.onreadystatechange = function() {
                        if (oReqSLineID.readyState == 4 && oReqSLineID.status == 200) {
                            var dataListRet = JSON.parse(oReqSLineID.responseText)
                            for (var event in dataListRet) {
                                var dataCopy = dataListRet[event];
                                for (var data in dataCopy) {
                                    var mainData = dataCopy[data];
                                    var salesType = mainData.TransactionType;
                                    var salesID = mainData.SaleID;
                                }
                            }
                            if (salesType == "Invoice") {
                                window.open('/shippingdocket?id=' + salesID, '_self');

                            } else {
                                $('.fullScreenSpin').css('display', 'none');
                                swal('WARNING: Could not find any Sales associated with this barcode "' + barcode + '"', 'warning', 'fixed-top', 'fa-frown-o');
                                e.preventDefault();
                            }


                        }


                    }



                } else {
                    $('.fullScreenSpin').css('display', 'none');
                    swal('WARNING: Could not find any Sales associated with this barcode "' + barcode + '"', 'warning', 'fixed-top', 'fa-frown-o');
                    e.preventDefault();
                }
            }
        }
    }

    var html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-readershippingoverview", {
            fps: 10,
            qrbox: 250,
            rememberLastUsedCamera: true
        });
    html5QrcodeScanner.render(onScanSuccess);

    var isMobile = false;
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
        isMobile = true;
    }
    if (isMobile == true) {
        setTimeout(function() {
        document.getElementById("scanBarcode").style.display = "none";
        document.getElementById("btnMobileBarcodeScan").style.display = "block";
        }, 500);
    }

    $("#barcodeScanInput").keyup(function(e) {

        if (e.keyCode == 13) {
            $('.fullScreenSpin').css('display', 'inline-block');
            var barcode = $(this).val().toUpperCase();
            if (barcode != '') {
                if (barcode.length <= 2) {
                    $('.fullScreenSpin').css('display', 'none');
                    swal('<strong>WARNING:</strong> Invalid Barcode "' + barcode + '"', '', 'warning');
                    DangerSound();
                    e.preventDefault();
                } else {
                    var segs = barcode.split('-');
                    if (segs[0] == Barcode_Prefix_Sale) {
                        var sales_ID = segs[1];
                        var erpGet = erpDb();
                        var oReqSID = new XMLHttpRequest();
                        oReqSID.open("GET", 'https://' + erpGet.ERPIPAddress + ':' + erpGet.ERPPort + '/' + erpGet.ERPApi + '/SaleGroup?SaleID=' + sales_ID, true);
                        oReqSID.setRequestHeader("database", erpGet.ERPDatabase);
                        oReqSID.setRequestHeader("username", erpGet.ERPUsername);
                        oReqSID.setRequestHeader("password", erpGet.ERPPassword);
                        oReqSID.send();

                        oReqSID.timeout = 30000;
                        oReqSID.onreadystatechange = function() {
                            if (oReqSID.readyState == 4 && oReqSID.status == 200) {
                                var dataListRet = JSON.parse(oReqSID.responseText)
                                for (var event in dataListRet) {
                                    var dataCopy = dataListRet[event];
                                    for (var data in dataCopy) {
                                        var mainData = dataCopy[data];
                                        var salesType = mainData.TransactionType;
                                        var salesID = mainData.SaleID;
                                    }
                                }
                                if (salesType == "Invoice") {
                                    window.open('/shippingdocket?id=' + salesID, '_self');
                                } else {
                                    $('.fullScreenSpin').css('display', 'none');
                                    // Bert.alert('<strong>WARNING:</strong> No Invoice with that number "'+barcode+'"', 'now-dangerorange');
                                    swal('<strong>WARNING:</strong> No Invoice with that number "' + barcode + '"', '', 'warning');
                                    DangerSound();
                                    e.preventDefault();
                                }


                            }

                            AddUERP(oReqSID.responseText);
                        }


                    } else if (segs[0] == Barcode_Prefix_SalesLine) {
                        var salesLine_ID = segs[1];
                        var erpGet = erpDb();
                        var oReqSLineID = new XMLHttpRequest();
                        oReqSLineID.open("GET", 'https://' + erpGet.ERPIPAddress + ':' + erpGet.ERPPort + '/' + erpGet.ERPApi + '/SaleGroup?SaleLineID=' + salesLine_ID, true);
                        oReqSLineID.setRequestHeader("database", erpGet.ERPDatabase);
                        oReqSLineID.setRequestHeader("username", erpGet.ERPUsername);
                        oReqSLineID.setRequestHeader("password", erpGet.ERPPassword);
                        oReqSLineID.send();

                        oReqSLineID.timeout = 30000;
                        oReqSLineID.onreadystatechange = function() {
                            if (oReqSLineID.readyState == 4 && oReqSLineID.status == 200) {
                                var dataListRet = JSON.parse(oReqSLineID.responseText)
                                for (var event in dataListRet) {
                                    var dataCopy = dataListRet[event];
                                    for (var data in dataCopy) {
                                        var mainData = dataCopy[data];
                                        var salesType = mainData.TransactionType;
                                        var salesID = mainData.SaleID;
                                    }
                                }
                                if (salesType == "Invoice") {
                                    window.open('/shippingdocket?id=' + salesID, '_self');

                                } else {
                                    $('.fullScreenSpin').css('display', 'none');
                                    swal('WARNING: Could not find any Sales associated with this barcode "' + barcode + '"', 'warning', 'fixed-top', 'fa-frown-o');
                                    e.preventDefault();
                                }


                            }

                            AddUERP(oReqSID.responseText);
                        }



                    } else {
                        $('.fullScreenSpin').css('display', 'none');
                        swal('WARNING: Could not find any Sales associated with this barcode "' + barcode + '"', 'warning', 'fixed-top', 'fa-frown-o');
                        e.preventDefault();
                    }
                }
            }
        }
    });

    $("#scanBarcode").click(function() {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {

        } else {
            Bert.alert('<strong>Please Note:</strong> This function is only available on mobile devices!', 'now-dangerorange');
        }
    });

});
Template.shippingcards.events({
    'click .btnDesktopSearch': function(e) {
        let barcodeData = $('#barcodeScanInput').val();
        $('.fullScreenSpin').css('display', 'inline-block');
        if (barcodeData === '') {
            swal('Please enter the barcode', '', 'warning');
            $('.fullScreenSpin').css('display', 'none');
            e.preventDefault();
            return false;
        }

        var barcode = $('#barcodeScanInput').val().toUpperCase();
        if (barcode != '') {
            if (barcode.length <= 2) {
                $('.fullScreenSpin').css('display', 'none');
                Bert.alert('<strong>WARNING:</strong> Invalid Barcode "' + barcode + '"', 'now-dangerorange');
                DangerSound();
                e.preventDefault();
            } else {
                var segs = barcode.split('-');
                if (segs[0] == Barcode_Prefix_Sale) {
                    var sales_ID = segs[1];
                    var erpGet = erpDb();
                    var oReqSID = new XMLHttpRequest();
                    oReqSID.open("GET", 'https://' + erpGet.ERPIPAddress + ':' + erpGet.ERPPort + '/' + erpGet.ERPApi + '/SaleGroup?SaleID=' + sales_ID, true);
                    oReqSID.setRequestHeader("database", erpGet.ERPDatabase);
                    oReqSID.setRequestHeader("username", erpGet.ERPUsername);
                    oReqSID.setRequestHeader("password", erpGet.ERPPassword);
                    oReqSID.send();

                    oReqSID.timeout = 30000;
                    oReqSID.onreadystatechange = function() {
                        if (oReqSID.readyState == 4 && oReqSID.status == 200) {
                            var dataListRet = JSON.parse(oReqSID.responseText)
                            for (var event in dataListRet) {
                                var dataCopy = dataListRet[event];
                                for (var data in dataCopy) {
                                    var mainData = dataCopy[data];
                                    var salesType = mainData.TransactionType;
                                    var salesID = mainData.SaleID;
                                }
                            }
                            if (salesType == "Invoice") {
                                window.open('/shippingdocket?id=' + salesID, '_self');
                            } else {
                                $('.fullScreenSpin').css('display', 'none');
                                swal('<strong>WARNING:</strong> No Invoice with that number "' + barcode + '"', '', 'warning');
                                DangerSound();
                                e.preventDefault();
                            }


                        }

                        AddUERP(oReqSID.responseText);
                    }


                } else if (segs[0] == Barcode_Prefix_SalesLine) {
                    var salesLine_ID = segs[1];
                    var erpGet = erpDb();
                    var oReqSLineID = new XMLHttpRequest();
                    oReqSLineID.open("GET", 'https://' + erpGet.ERPIPAddress + ':' + erpGet.ERPPort + '/' + erpGet.ERPApi + '/SaleGroup?SaleLineID=' + salesLine_ID, true);
                    oReqSLineID.setRequestHeader("database", erpGet.ERPDatabase);
                    oReqSLineID.setRequestHeader("username", erpGet.ERPUsername);
                    oReqSLineID.setRequestHeader("password", erpGet.ERPPassword);
                    oReqSLineID.send();

                    oReqSLineID.timeout = 30000;
                    oReqSLineID.onreadystatechange = function() {
                        if (oReqSLineID.readyState == 4 && oReqSLineID.status == 200) {
                            var dataListRet = JSON.parse(oReqSLineID.responseText)
                            for (var event in dataListRet) {
                                var dataCopy = dataListRet[event];
                                for (var data in dataCopy) {
                                    var mainData = dataCopy[data];
                                    var salesType = mainData.TransactionType;
                                    var salesID = mainData.SaleID;
                                }
                            }
                            if (salesType == "Invoice") {
                                window.open('/shippingdocket?id=' + salesID, '_self');

                            } else {
                                $('.fullScreenSpin').css('display', 'none');
                                swal('WARNING: Could not find any Sales associated with this barcode "' + barcode + '"', 'warning', 'fixed-top', 'fa-frown-o');
                                e.preventDefault();
                            }


                        }

                        AddUERP(oReqSID.responseText);
                    }



                } else {
                    $('.fullScreenSpin').css('display', 'none');
                    swal('WARNING: Could not find any Sales associated with this barcode "' + barcode + '"', 'warning', 'fixed-top', 'fa-frown-o');
                    e.preventDefault();
                }
            }
        }

    }
});
