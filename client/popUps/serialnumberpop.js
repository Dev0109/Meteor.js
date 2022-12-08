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
Template.serialnumberpop.onCreated(() => {
    const templateObject = Template.instance();
    templateObject.serialnumberlist = new ReactiveVar();
});
Template.serialnumberpop.onRendered(() => {});
Template.serialnumberpop.helpers({});
Template.serialnumberpop.events({
    'keyup #first-serial-number': function(event) {
        $('.serialNo').text('1');
    },
    'click .btnSNSave': async function(event) {
        const numbers = $('#tblSeriallist tbody tr td:last-child');
        let newNumberList = [];
        numbers.each((key, serialEl) => {
            if (key === 0 || key === 1) return;
            const serialNumber = $(serialEl).text();
            newNumberList.push(serialNumber);
        });

        let serialNumberCreationType = $('#tblInvoiceLine').length;
        if ($('.tblRefundLine').length) serialNumberCreationType = 0;
        const productName = localStorage.getItem('selectedProductName');
        if (newNumberList.length) {
            $('.btnSNSave').prop('disabled', true);
            $('.btnSNSave .fa-save').addClass('d-none');
            $('.btnSNSave .spinner-border').removeClass('d-none');
            const serialList = await sideBarService.getAllSerialNumber();
            const availableList = serialList.tserialnumberlistcurrentreport.filter(serial => serial.ProductName === productName && serial.AllocType === 'In-Stock');
            const serialNumberList = availableList.map(serial => serial.SerialNumber);
            if (!serialNumberCreationType) {
                let existSameNumber = false;
                for (let i = 0; i < newNumberList.length; i++) {
                    if (serialNumberList.includes((newNumberList[i]).toString())) {
                        existSameNumber = true;
                        break;
                    }
                }
                if (false) {
                    swal('', 'One or more than serial numbers already existed! Please try to change serial numbers.', 'error');
                } else {
                    const rowNumber = $('#serialNumberModal').attr('data-row');
                    const modalType = $('#serialNumberModal').attr('data-type');
                    if (modalType === 'from') {
                        $(`table tbody tr:nth-child(${rowNumber}) td.colSerialFrom`).attr('data-serialnumbers', newNumberList.join(','));
                    } else if (modalType === 'to') {
                        $(`table tbody tr:nth-child(${rowNumber}) td.colSerialTo`).attr('data-serialnumbers', newNumberList.join(','));
                    } else {
                        $(`table tbody tr:nth-child(${rowNumber}) td.colSerialNo`).attr('data-serialnumbers', newNumberList.join(','));
                    }
                    $('#serialNumberModal').modal('hide');
                }
            } else {
                let existDifferentNumber = false;
                for (let i = 0; i < newNumberList.length; i++) {
                    if (!serialNumberList.includes((newNumberList[i]).toString())) {
                        existDifferentNumber = true;
                        break;
                    }
                }
                if (existDifferentNumber) {
                    swal('', 'One or more than serial numbers not existed or nonavailable! Please try to change serial numbers.', 'error');
                } else {
                    const rowNumber = $('#serialNumberModal').attr('data-row');
                    $(`table tbody tr:nth-child(${rowNumber}) td.colSerialNo`).attr('data-serialnumbers', newNumberList.join(','));
                    $('#serialNumberModal').modal('hide');
                }
            }
            $('.btnSNSave').prop('disabled', false);
            $('.btnSNSave .fa-save').removeClass('d-none');
            $('.btnSNSave .spinner-border').addClass('d-none');
        } else {
            swal('', 'You should input more than one serial numbers.', 'info');
        }
    },
    'click .btnSelect': async function() {
        const serialList = await sideBarService.getAllSerialNumber();
        const productName = localStorage.getItem('selectedProductName');
        const filteredList = serialList.tserialnumberlistcurrentreport.filter(serial => serial.ProductName === productName && serial.AllocType === 'In-Stock');
        const serialNumberList = filteredList.map(serial => serial.SerialNumber);
        let htmlList = `<tr>
            <td rowspan="2"></td>
            <td colspan="2" class="text-center">Available Serial Numbers</td>
        </tr>
        <tr>
            <td class="text-start">#</td>
            <td class="text-start">Serial number</td>
        </tr>`;
        let i = 1;
        serialNumberList.forEach(serialNumber => {
            htmlList += `<tr class="serial-no-row">
                <td></td>
                <td class="serialNo">${i}</td>
                <td>${serialNumber}</td>
            </tr>`;
            i++;
        });
        $('#tblAvailableSeriallist tbody').html(htmlList);
        $('#availableSerialNumberModal').modal('show');
    },
    'click .btnDelete': function() {
        playDeleteAudio();
        setTimeout(function(){
        autofilled = false;
        const rowNumber = $('#serialNumberModal').attr('data-row');
        $(`table tbody tr:nth-child(${rowNumber}) td.colSerialNo`).attr('data-serialnumbers', '');
        const defaultRow = '<tr>' +
        '    <td rowspan="2"></td>' +
        '    <td colspan="2" class="text-center">Allocate Serial Numbers</td>' +
        '</tr>' +
        '<tr>' +
        '    <td class="text-start">#</td>' +
        '    <td class="text-start">Serial number</td>' +
        '</tr>' +
        '<tr>' +
        '    <td></td>' +
        '    <td class="serialNo">*</td>' +
        '    <td contenteditable="true" class="lineSerialnumbers" id="first-serial-number"></td>' +
        '</tr>';
        $('#tblSeriallist tbody').html(defaultRow);
    }, delayTimeAfterSound);
    },
    'click .btnPrint': async function(event) {
        playPrintAudio();
        setTimeout(function(){
        const rowNumber = $('#serialNumberModal').attr('data-row');
        const productName = $(`table tbody tr:nth-child(${rowNumber}) td.colProductName input`).val();
        $('.tblSNlist').print({
            title: productName + " - Serial Numbers"
        });
    }, delayTimeAfterSound);
    },
    'click .btnAutoFill': async function(event) {
        let startSerialnum = Number($('#first-serial-number').text());
        let selectedunit = localStorage.getItem('productItem');
        if (startSerialnum == 0 || typeof startSerialnum == "NaN" || startSerialnum == "") {
            swal('', 'You have to enter serial number correctly!', 'info');
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
                const serialList = await sideBarService.getAllSerialNumber();
                const serialNumberList = serialList.tserialnumberlistcurrentreport.map(serial => serial.SerialNumber);
                let existSameNumber = false;
                for (let i = 0; i < selectedunit; i++) {
                    if (serialNumberList.includes((Number(startSerialnum)+i).toString())) {
                        existSameNumber = true;
                        break;
                    }
                }
                if (false) {
                    swal('', 'One or more than serial numbers already existed! Please try to change serial numbers.', 'error');
                } else {
                    let shtml = '';
                    shtml += `<tr><td rowspan="2"></td><td colspan="2" class="text-center">Allocate Serial Numbers</td></tr>
                    <tr><td class="text-start">#</td><td class="text-start">Serial number</td></tr>
                    `;
                    for (let i = 0; i < selectedunit; i++) {
                        if (i === 0) {
                            shtml += `
                            <tr><td></td><td>${Number(i)+1}</td><td contenteditable="true" class="lineSerialnumbers" id="first-serial-number">${Number(startSerialnum)+i}</td></tr>
                            `;
                        } else {
                            shtml += `
                            <tr><td></td><td>${Number(i)+1}</td><td contenteditable="true" class="lineSerialnumbers">${Number(startSerialnum)+i}</td></tr>
                            `;
                        }
                    }
                    $('#tblSeriallist').html(shtml);
                }
                $('.btnAutoFill').prop('disabled', false);
                $('.btnAutoFill .spinner-border').addClass('d-none');
            }
        }
    }
});
