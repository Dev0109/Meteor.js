import { ReactiveVar } from "meteor/reactive-var";
import { AccountService } from "../../accounts/account-service"

Template.eftOptionsModal.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.eftOptionsList = new ReactiveVar([]);
});

Template.eftOptionsModal.onRendered(function () {
  let templateObject = Template.instance();
  let accountService = new AccountService();

  templateObject.setInitEftOptions = () => {
    // tempcode
    let eftOptions = [
      {
        id: 'balance',
        label: 'Include Balance Record',
        active: false
      },
      {
        id: 'net',
        label: 'Include Net Total',
        active: false
      },
      {
        id: 'credit',
        label: 'Include Credit Total',
        active: false
      },
      {
        id: 'debit',
        label: 'Include Debit Total',
        active: false
      },
    ];

    templateObject.eftOptionsList.set(eftOptions);
    $('#eftoption_accountid').val('');
  }

  templateObject.setInitEftOptions();
});

Template.eftOptionsModal.events({

  "click .btnSaveEftOptions": (e) => {
    playSaveAudio();
    let templateObject = Template.instance();
    setTimeout(function () {

      let accountID = $('#eftoption_accountid').val();

      if (accountID) {
        $(".fullScreenSpin").css("display", "inline-block");

        let IncludeBalanceRecord = $('#chkEftOption_balance').prop('checked');
        let IncludeNetTotal = $('#chkEftOption_net').prop('checked');
        let IncludeCreditTotal = $('#chkEftOption_credit').prop('checked');
        let IncludeDebitTotal = $('#chkEftOption_debit').prop('checked');

        let data = {
          type: "TAccount",
          fields: {
            ID: accountID,
            IncludeBalanceRecord: IncludeBalanceRecord,
            IncludeNetTotal: IncludeNetTotal,
            IncludeCreditTotal: IncludeCreditTotal,
            IncludeDebitTotal: IncludeDebitTotal,
          },
        };

        let accountService = new AccountService();
        accountService.saveAccount(data).then(function (data) {
          $(".fullScreenSpin").css("display", "none");
          $('#eftOptionsModal').modal('hide');
        }).catch(function (err) {
          swal({
            title: "Oooops...",
            text: err,
            type: "error",
            showCancelButton: false,
            confirmButtonText: "Try Again",
          }).then((result) => {
            if (result.value) {
              // Meteor._reload.reload();
            } else if (result.dismiss === "cancel") { }
          });
          $(".fullScreenSpin").css("display", "none");
        });
      } else {
        swal('You Cannot Save this option', 'Please select an account first', 'info');
      }

    }, delayTimeAfterSound);
  },

  "click .btnCancelEftOptions": (e) => {
    playCancelAudio();
    setTimeout(function () {
      $('#eftOptionsModal').modal('hide');
    }, delayTimeAfterSound);
  },

  "click .chkEftOption": (e) => {

  }
});

Template.eftOptionsModal.helpers({
  eftOptionsList: () => {
    return Template.instance().eftOptionsList.get();
  },
});
