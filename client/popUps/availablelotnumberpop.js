import {
    ReactiveVar
} from 'meteor/reactive-var';
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
Template.availablelotnumberpop.onCreated(() => {
    const templateObject = Template.instance();
    templateObject.lotnumberlist = new ReactiveVar();
});
Template.availablelotnumberpop.onRendered(async () => {
    $(document).on('click', '.lot-no-row', function() {
        const activeNumber = $('.lot-no-row.active').length;
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
Template.availablelotnumberpop.helpers({});
Template.availablelotnumberpop.events({
    'click .btnSNSave': async function(event) {
        const activeNumber = $('.lot-no-row.active');
        let newNumberList = [];
        activeNumber.each((key, lotNumber) => {
            newNumberList.push($(lotNumber).find('td:last-child').text());
        });
        if (newNumberList.length === 0) {
            swal('', 'You didn\'t select any lot numbers', 'warning');
        } else {
            let shtml = '';
            shtml += `<tr><td rowspan="2"></td><td colspan="2" class="text-center">Available Lot Numbers</td></tr>
            <tr><td class="text-start">#</td><td class="text-start">Lot number</td></tr>
            `;
            for (let i = 0; i < newNumberList.length; i++) {
                shtml += `
                <tr><td></td><td>${Number(i)+1}</td><td contenteditable="true" class="lineLotnumbers">${newNumberList[i]}</td></tr>
                `;
            }
            $('#tblLotlist').html(shtml);
        }

        $('#availableLotNumberModal').modal('hide');
    }
});
