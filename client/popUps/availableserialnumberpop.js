import {
    ReactiveVar
} from 'meteor/reactive-var';
import '../lib/global/erp-objects';
import 'jquery-ui-dist/external/jquery/jquery';
import 'jquery-ui-dist/jquery-ui';
import '../lib/global/indexdbstorage.js';
Template.availableserialnumberpop.onCreated(() => {
    const templateObject = Template.instance();
    templateObject.serialnumberlist = new ReactiveVar();
});
Template.availableserialnumberpop.onRendered(async () => {
    $(document).on('click', '.serial-no-row', function() {
        const activeNumber = $('.serial-no-row.active').length;
        const productItems = localStorage.getItem('productItem');
        if (parseInt(activeNumber) < parseInt(productItems)) {
            $(this).toggleClass('active');
        } else {
            if ($(this).hasClass('active')) {
                $(this).toggleClass('active');
            } else {
                swal('', 'You should select within the number of shipped products.', 'warning');
            }
        }
    });
});
Template.availableserialnumberpop.helpers({});
Template.availableserialnumberpop.events({
    'click .btnSNSave': async function(event) {
        const activeNumber = $('.serial-no-row.active');
        let selectedunit = localStorage.getItem('productItem');
        let newNumberList = [];
        activeNumber.each((key, serialNumber) => {
            newNumberList.push($(serialNumber).find('td:last-child').text());
        });
        if (newNumberList.length === 0) {
            swal('', 'You didn\'t select any serial numbers', 'warning');
        } else {
            let shtml = '';
            shtml += `<tr><td rowspan="2"></td><td colspan="2" class="text-center">Allocate Serial Numbers</td></tr>
            <tr><td class="text-start">#</td><td class="text-start">Serial number</td></tr>
            `;
            for (let i = 0; i < newNumberList.length; i++) {
                shtml += `
                <tr><td></td><td>${Number(i)+1}</td><td contenteditable="true" class="lineSerialnumbers">${newNumberList[i]}</td></tr>
                `;
            }
            $('#tblSeriallist').html(shtml);
        }

        $('#availableSerialNumberModal').modal('hide');
    }
});
