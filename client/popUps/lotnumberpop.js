import {
    SalesBoardService
} from '../js/sales-service';
import {
    ReactiveVar
} from 'meteor/reactive-var';
import {
    CoreService
} from '../js/core-service';
import {
    UtilityService
} from "../utility-service";
import '../lib/global/erp-objects';
import 'jquery-ui-dist/external/jquery/jquery';
import 'jquery-ui-dist/jquery-ui';
import {
    SideBarService
} from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
import { ProductService } from "../product/product-service";
let sideBarService = new SideBarService();
let utilityService = new UtilityService();
var autofilled = false;
Template.lotnumberpop.onCreated(() => {
    const templateObject = Template.instance();
    templateObject.serialnumberlist = new ReactiveVar();
});
Template.lotnumberpop.onRendered(() => {
    $(".lotExpiryDate input").datepicker({
        showOn: 'focus',
        buttonImageOnly: false,
        dateFormat: 'dd/mm/yy',
        showOtherMonths: true,
        selectOtherMonths: true,
        changeMonth: true,
        changeYear: true,
        yearRange: "-90:+10",
    });
});
Template.lotnumberpop.helpers({});
Template.lotnumberpop.events({
    'keyup #first-lot-number': function(event) {
        $('.serialNo').text('1');
    },
    'click .btnSNSave': async function(event) {
        const numbers = $('#tblLotlist tbody tr td:nth-child(3)');
        const expiryDates = $('#tblLotlist tbody tr td:nth-child(4) input');
        let newNumberList = [];
        let newExpiryDateList = [];
        numbers.each((key, lotEl) => {
            if (key === 0) return;
            const lotNumber = $(lotEl).text();
            newNumberList.push(lotNumber);
        });
        expiryDates.each((key, lotExpiryEl) => {
            const lotExpiryDate = $(lotExpiryEl).val();
            newExpiryDateList.push(lotExpiryDate);
        });

        let lotNumberCreationType = $('#tblInvoiceLine').length;
        const productName = localStorage.getItem('selectedProductName');
        if (newNumberList.length) {
            $('.btnSNSave').prop('disabled', true);
            $('.btnSNSave .fa-save').addClass('d-none');
            $('.btnSNSave .spinner-border').removeClass('d-none');
            const lotList = await sideBarService.getAllSerialNumber();
            const availableList = lotList.tserialnumberlistcurrentreport.filter(serial => serial.ProductName === productName && serial.AllocType === 'In-Stock');
            const lotNumberList = availableList.map(lot => lot.BatchNumber);
            // if (!lotNumberCreationType) {
                let existSameNumber = false;
                for (let i = 0; i < newNumberList.length; i++) {
                    if (lotNumberList.includes((newNumberList[i]).toString())) {
                        existSameNumber = true;
                        break;
                    }
                }
                if (existSameNumber) {
                    swal('', 'One or more than lot numbers already existed! Please try to change lot numbers.', 'error');
                } else {
                    const rowNumber = $('#lotNumberModal').attr('data-row');
                    const modalType = $('#lotNumberModal').attr('data-type');
                    if (modalType === 'from') {
                        $(`table tbody tr:nth-child(${rowNumber}) td.colSerialFrom`).attr('data-lotnumbers', newNumberList.join(','));
                        $(`table tbody tr:nth-child(${rowNumber}) td.colSerialFrom`).attr('data-expirydates', newExpiryDateList.join(','));
                    } else if (modalType === 'to') {
                        $(`table tbody tr:nth-child(${rowNumber}) td.colSerialTo`).attr('data-lotnumbers', newNumberList.join(','));
                        $(`table tbody tr:nth-child(${rowNumber}) td.colSerialTo`).attr('data-expirydates', newExpiryDateList.join(','));
                    } else {
                        $(`table tbody tr:nth-child(${rowNumber}) td.colSerialNo`).attr('data-lotnumbers', newNumberList.join(','));
                        $(`table tbody tr:nth-child(${rowNumber}) td.colSerialNo`).attr('data-expirydates', newExpiryDateList.join(','));
                    }
                    $('#lotNumberModal').modal('hide');
                }
            // } else {
            //     let existDifferentNumber = false;
            //     for (let i = 0; i < newNumberList.length; i++) {
            //         if (!lotNumberList.includes((newNumberList[i]).toString())) {
            //             existDifferentNumber = true;
            //             break;
            //         }
            //     }
            //     if (existDifferentNumber) {
            //         swal('', 'One or more than lot numbers not existed or nonavailable! Please try to change lot numbers.', 'error');
            //     } else {
            //         const rowNumber = $('#lotNumberModal').attr('data-row');
            //         $(`table tbody tr:nth-child(${rowNumber}) td.colSerialNo`).attr('data-lotnumbers', newNumberList.join(','));
            //         $(`table tbody tr:nth-child(${rowNumber}) td.colSerialNo`).attr('data-expirydates', newExpiryDateList.join(','));
            //         $('#lotNumberModal').modal('hide');
            //     }
            // }
            $('.btnSNSave').prop('disabled', false);
            $('.btnSNSave .fa-save').removeClass('d-none');
            $('.btnSNSave .spinner-border').addClass('d-none');
        } else {
            swal('', 'You should input more than one lot numbers.', 'info');
        }
    },
    'click .btnPrint': async function(event) {
        playPrintAudio();
        setTimeout(function(){
        const rowNumber = $('#lotNumberModal').attr('data-row');
        const productName = $(`table tbody tr:nth-child(${rowNumber}) td.colProductName input`).val();
        $('.tblLNlist').print({
            title: productName + " - Lot Numbers"
        });
    }, delayTimeAfterSound);
    },
    'click .btnSelect': async function() {
        const lotList = await sideBarService.getAllSerialNumber();
        const productName = localStorage.getItem('selectedProductName');
        const filteredList = lotList.tserialnumberlistcurrentreport.filter(serial => serial.ProductName === productName && serial.AllocType === 'In-Stock');
        const lotNumberList = filteredList.map(lot => lot.BatchNumber);
        const lotExpiryDateList = filteredList.map(lot => log.BatchExpiryDate);
        let htmlList = `<tr>
            <td rowspan="2"></td>
            <td colspan="3" class="text-center">Available Lot Numbers</td>
        </tr>
        <tr>
            <td class="text-start">#</td>
            <td class="text-start">Lot number</td>
            <td class="text-start">Expiry Date</td>
        </tr>`;
        let i = 1;
        for (let i = 0; i < lotNumberList.length; i++) {
            htmlList += `<tr class="lot-no-row">
                <td></td>
                <td class="lotNo">${i + 1}</td>
                <td>${lotNumberList[i]}</td>
                <td>${lotExpiryDateList[i]}</td>
            </tr>`;
            i++;
        }
        $('#tblAvailableLotlist tbody').html(htmlList);
        $('#availableLotNumberModal').modal('show');
    },
    'click .btnDelete': function() {
        playDeleteAudio();
        setTimeout(function(){
        autofilled = false;
        const rowNumber = $('#lotNumberModal').attr('data-row');
        $(`table tbody tr:nth-child(${rowNumber}) td.colSerialNo`).attr('data-lotnumbers', '');
        const defaultRow = `<tr>
            <td rowspan="2"></td>
            <td colspan="3" class="text-center">Allocate Lot Numbers</td>
        </tr>
        <tr>
            <td class="text-start">#</td>
            <td class="text-start">Lot number</td>
            <td class="text-start">Expiry Date</td>
        </tr>
        <tr>
            <td></td>
            <td class="lotNo">*</td>
            <td contenteditable="true" class="linelotnumbers" id="first-lot-number"></td>
            <td class="lotExpiryDate" id="first-lot-expiry-date">
                <div class="form-group m-0">
                    <div class="input-group date" style="cursor: pointer;">
                        <input type="text" class="form-control" style="height: 25px;">
                        <div class="input-group-addon">
                            <span class="glyphicon glyphicon-th" style="cursor: pointer;"></span>
                        </div>
                    </div>
                </div>
            </td>
        </tr>`;
        $('#tblLotlist tbody').html(defaultRow);
        $('.lotExpiryDate input').datepicker({
            showOn: 'focus',
            buttonImageOnly: false,
            dateFormat: 'dd/mm/yy',
            showOtherMonths: true,
            selectOtherMonths: true,
            changeMonth: true,
            changeYear: true,
            yearRange: "-90:+10",
        });
    }, delayTimeAfterSound);
    },
    'click .btnAutoFill': async function(event) {
        let startLotnum = Number($('#first-lot-number').text());
        let startLotExpiryDate = $('#first-lot-expiry-date input').val();
        let selectedunit = localStorage.getItem('productItem');
        if (startLotnum == 0 || typeof startLotnum == "NaN" || startLotnum == "" || !startLotExpiryDate) {
            swal('', 'You have to enter lot number correctly!', 'info');
            event.preventDefault();
            return false;
        } else {
            if (selectedunit == 1) {
                event.preventDefault();
                return false;
            } else if (selectedunit <= 0) {
                swal('', 'The number of product should be more than 1!', 'info');
                event.preventDefault();
                return false;
            } else {
                $('.btnAutoFill').prop('disabled', true);
                $('.btnAutoFill .spinner-border').removeClass('d-none');
                const lotList = await sideBarService.getAllSerialNumber();
                const lotNumberList = lotList.tserialnumberlistcurrentreport.map(batch => batch.BatchNumber);
                let existSameNumber = false;
                for (let i = 0; i < selectedunit; i++) {
                    if (lotNumberList.includes((Number(startLotnum)+i).toString())) {
                        existSameNumber = true;
                        break;
                    }
                }
                if (existSameNumber) {
                    swal('', 'One or more than lot numbers already existed! Please try to change lot numbers.', 'error');
                } else {
                    let shtml = '';
                    shtml += `<tr><td rowspan="2"></td><td colspan="3" class="text-center">Allocate Lot Numbers</td></tr>
                    <tr><td class="text-start">#</td><td class="text-start">Lot number</td><td class="text-start">Expiry Date</td></tr>
                    `;
                    for (let i = 0; i < selectedunit; i++) {
                        if (i === 0) {
                            shtml += `
                            <tr>
                                <td></td>
                                <td>${Number(i)+1}</td><td contenteditable="true" class="lineLotnumbers" id="first-serial-number">${Number(startLotnum)+i}</td>
                                <td class="lotExpiryDate" id="first-lot-expiry-date">
                                    <div class="form-group m-0">
                                        <div class="input-group date" style="cursor: pointer;">
                                            <input type="text" class="form-control" style="height: 25px;" value="${startLotExpiryDate}">
                                            <div class="input-group-addon">
                                                <span class="glyphicon glyphicon-th" style="cursor: pointer;"></span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            `;
                        } else {
                            shtml += `
                            <tr>
                                <td></td>
                                <td>${Number(i)+1}</td><td contenteditable="true" class="lineLotnumbers">${Number(startLotnum)+i}</td>
                                <td class="lotExpiryDate">
                                    <div class="form-group m-0">
                                        <div class="input-group date" style="cursor: pointer;">
                                            <input type="text" class="form-control" style="height: 25px;" value="${startLotExpiryDate}">
                                            <div class="input-group-addon">
                                                <span class="glyphicon glyphicon-th" style="cursor: pointer;"></span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            `;
                        }
                    }
                    $('#tblLotlist').html(shtml);
                }

                $(".lotExpiryDate input").datepicker({
                    showOn: 'focus',
                    buttonImageOnly: false,
                    dateFormat: 'dd/mm/yy',
                    showOtherMonths: true,
                    selectOtherMonths: true,
                    changeMonth: true,
                    changeYear: true,
                    yearRange: "-90:+10",
                });
                $('.btnAutoFill').prop('disabled', false);
                $('.btnAutoFill .spinner-border').addClass('d-none');
            }
        }
    }
});
