Template.leadstatusmodal.onCreated(function () {

});

Template.leadstatusmodal.onRendered(function () {

});

Template.leadstatusmodal.events({
    'keydown #statusQuantity': function (event) {
        if ($.inArray(event.keyCode, [46, 8, 9, 27, 13, 110]) != -1 ||
            (event.keyCode == 65 && (event.ctrlKey == true || event.metaKey == true)) ||
            (event.keyCode >= 35 && event.keyCode <= 40)) {
            return;
        }
        if (event.shiftKey == true) {
            event.preventDefault();
        }
        if ((event.keyCode >= 48 && event.keyCode <= 57) ||
            (event.keyCode >= 96 && event.keyCode <= 105) ||
            event.keyCode == 8 || event.keyCode == 9 ||
            event.keyCode == 37 || event.keyCode == 39 ||
            event.keyCode == 46 || event.keyCode == 190 || event.keyCode == 189 || event.keyCode == 109) {

        }
        else {
            event.preventDefault();
        }
    },
});

Template.leadstatusmodal.helpers({

});
