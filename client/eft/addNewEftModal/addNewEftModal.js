import { ReactiveVar } from "meteor/reactive-var";

Template.addNewEftModal.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.eftOptionsList = new ReactiveVar([]);
});

Template.addNewEftModal.onRendered(function () {
  let templateObject = Template.instance();

  templateObject.setInitEftOptions = () => {
    // tempcode
    let eftOptions = [
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

    templateObject.eftOptionsList.set(eftOptions)
    addVS1Data('TEftOptions', JSON.stringify(eftOptions)).then(function (datareturn) {
    }).catch(function (err) {
    });
  }

  templateObject.loadEftOptions = () => {
    getVS1Data("TEftOptions")
      .then(function (dataObject) {
        if (dataObject.length === 0) {
          templateObject.setInitEftOptions();
        } else {
          let data = JSON.parse(dataObject[0].data);
          templateObject.eftOptionsList.set(data)
        }
      }).catch(function (err) {
        templateObject.setInitEftOptions();
      });
  };
  templateObject.loadEftOptions();
});

Template.addNewEftModal.events({

  "click .btnSaveEftOptions": (e) => {
    playSaveAudio();
    let templateObject = Template.instance();
    setTimeout(function(){
    
    let eftOptions = templateObject.eftOptionsList.get();

    $('.chkEftOptionsList').each(function (index) {
      var $tblrow = $(this);
      var fieldID = $tblrow.attr("optionsid") || 0;
      var colHidden = false;
      if ($tblrow.find(".chkEftOption").is(':checked')) {
        colHidden = true;
      } else {
        colHidden = false;
      }

      eftOptions = eftOptions.map(item => {
        if (item.id === fieldID) {
          return { ...item, active: colHidden };
        }
        return item;
      })

    });

    addVS1Data('TEftOptions', JSON.stringify(eftOptions)).then(function (datareturn) {
      $('#addNewEftModal').modal('hide');
    }).catch(function (err) {
      $('#addNewEftModal').modal('hide');
    });
    }, delayTimeAfterSound);
  },

  "click .btnCancelEftOptions": (e) => {
    playCancelAudio();
    setTimeout(function(){
      $('#addNewEftModal').modal('hide');
    }, delayTimeAfterSound);
  },

});

Template.addNewEftModal.helpers({
  eftOptionsList: () => {
    return Template.instance().eftOptionsList.get();
  },
});
