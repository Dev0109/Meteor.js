import 'jquery-ui-dist/external/jquery/jquery';
import 'jquery-ui-dist/jquery-ui';

Template.transaction_footer.onCreated( function () {});
Template.transaction_footer.onRendered( function () {});
// Template.transaction_footer.helpers({

// })
Template.transaction_footer.events({
  "click #open_print_confirm": function (event) {
    playPrintAudio();
    setTimeout(async function() {
      $('#printModal').modal('show');
    }, delayTimeAfterSound);
  },
});