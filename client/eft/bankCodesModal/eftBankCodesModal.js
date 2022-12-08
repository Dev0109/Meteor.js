import { ReactiveVar } from "meteor/reactive-var";


Template.eftBankCodesModal.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.eftBankCodeList = new ReactiveVar([]);
});

Template.eftBankCodesModal.onRendered(function () {
  let templateObject = Template.instance();

  templateObject.setInitEftBankCodes = () => {
    // tempcode
    let eftBankCodes = [
      {
        id: 'cba',
        label: 'CBA (Commonwealth Bank)',
        active: false
      },
      {
        id: 'nab',
        label: 'NAB (National Australian Bank)',
        active: false
      },
      {
        id: 'wbc',
        label: 'WBC (Westpac Bank)',
        active: false
      },
      {
        id: 'mqg',
        label: 'MQG (Macquarie Bank)',
        active: false
      },
      {
        id: 'anz',
        label: 'ANZ (Australia and New Zealand Banking Group)',
        active: false
      },
      {
        id: 'ben',
        label: 'BEN (Bendigo Bank)',
        active: false
      },
      {
        id: 'boq',
        label: 'BOQ (Bank of Queensland)',
        active: false
      },
      {
        id: 'vuk',
        label: 'VUK (Virgin Money)',
        active: false
      },
      {
        id: 'bfl',
        label: 'BFL (BSP Financial Group)',
        active: false
      },
      {
        id: 'jdo',
        label: 'JDO (Judo Bank)',
        active: false
      }
    ];

    templateObject.eftBankCodeList.set(eftBankCodes)
    addVS1Data('TBankCode', JSON.stringify(eftBankCodes)).then(function (datareturn) {
    }).catch(function (err) {
    });
  }

  templateObject.loadEftBankCodes = () => {
    getVS1Data("TBankCode")
      .then(function (dataObject) {
        if (dataObject.length === 0) {
          templateObject.setInitEftBankCodes();
        } else {
          let data = JSON.parse(dataObject[0].data);
          templateObject.eftBankCodeList.set(data)
        }
      }).catch(function (err) {
        templateObject.setInitEftBankCodes();
      });
  };
  templateObject.loadEftBankCodes();
});

Template.eftBankCodesModal.events({

  "click .btnSaveEftBankCodes": (e) => {
    playSaveAudio();
    let templateObject = Template.instance();
    setTimeout(function(){
    
    let eftBankCodes = templateObject.eftBankCodeList.get();

    $('.chkEftBankCodesList').each(function (index) {
      var $tblrow = $(this);
      var fieldID = $tblrow.attr("optionsid") || 0;
      var colHidden = false;
      if ($tblrow.find(".chkEftBankCode").is(':checked')) {
        colHidden = true;
      } else {
        colHidden = false;
      }

      eftBankCodes = eftBankCodes.map(item => {
        if (item.id === fieldID) {
          return { ...item, active: colHidden };
        }
        return item;
      })

    });

    addVS1Data('TBankCode', JSON.stringify(eftBankCodes)).then(function (datareturn) {
      $('#eftBankCodesModal').modal('hide');
    }).catch(function (err) {
      $('#eftBankCodesModal').modal('hide');
    });
  }, delayTimeAfterSound);
  },

  "click .btnCancelEftBankCodes": (e) => {
    playCancelAudio();
    setTimeout(function(){
      $('#eftBankCodesModal').modal('hide');
    }, delayTimeAfterSound);
  },

});

Template.eftBankCodesModal.helpers({
  eftBankCodeList: () => {
    return Template.instance().eftBankCodeList.get();
  },
});
