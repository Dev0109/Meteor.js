import 'jquery-ui-dist/external/jquery/jquery';
import 'jquery-ui-dist/jquery-ui';

Template.transaction_buttons_bottom.onCreated( function () {});
Template.transaction_buttons_bottom.onRendered( function () {});
Template.transaction_buttons_bottom.events({
  "click #open_print_confirm": function (event) {
    playPrintAudio();
    setTimeout(async function() {
      $('#printModal').modal('show');
    }, delayTimeAfterSound);
  },
});