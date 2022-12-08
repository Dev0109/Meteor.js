import { MailchimpService } from '../../js/mailchimp-service';
import { SideBarService } from '../../js/sidebar-service';
import '../../lib/global/indexdbstorage.js';
let sideBarService = new SideBarService();
let mailchimpService = new MailchimpService();

Template.mailchimpSettings.onCreated(() => {
  const templateObject = Template.instance();
  templateObject.mailchimpSettingDetails = new ReactiveVar([]);

  templateObject.saveMailchimpSettings = async function (data) {
    return new Promise((resolve) => {
      const oldSetting = templateObject.mailchimpSettingDetails.get().filter((field) => field.PrefName === data.eKey);
      let settingObject = {};
      if (oldSetting.length > 0) {
        settingObject = {
          type: "TERPPreference",
          fields: {
            Id: oldSetting[0].Id,
            Fieldvalue: data.Fieldvalue
          }
        }
      } else {
        settingObject = {
          type: "TERPPreference",
          fields: {
            DefaultValue: "",
            FieldType: "ftString",
            FieldValue: data.Fieldvalue,
            PrefName: data.eKey,
            PrefType: "ptCompany",
            RefType: "None"
          }
        };
      }
      mailchimpService.saveMailchimpSettings(settingObject).then((res) => {
        sideBarService.getGlobalSettings().then(function (data) {
          addVS1Data('TERPPreference', JSON.stringify(data)).then(() => {
            resolve({ success: true, ...res });
          }).catch(function (err) { resolve({ success: false, ...err }) });
        });
      }).catch(err => resolve({ success: false, ...err }));
    });
  }
});

Template.mailchimpSettings.onRendered(function () {
  $('.fullScreenSpin').css('display', 'inline-block');

  const templateObject = Template.instance();
  const mailchimpSettings = {
    mailchimpApiKey: "",
    mailchimpCampaignID: "",
    mailchimpAudienceID: ""
  }
  mailchimpService.getMailchimpSettings().then((result) => {
    $('.fullScreenSpin').css('display', 'none');
    if (result.terppreference.length > 0) {
      templateObject.mailchimpSettingDetails.set(result.terppreference);
      for (let i = 0; i < result.terppreference.length; i++) {
        switch (result.terppreference[i].PrefName) {
          case "VS1MailchimpApiKey": mailchimpSettings.mailchimpApiKey = result.terppreference[i].Fieldvalue || mailchimpSettings.mailchimpApiKey; break;
          case "VS1MailchimpCampaignID": mailchimpSettings.mailchimpCampaignID = result.terppreference[i].Fieldvalue || mailchimpSettings.mailchimpCampaignID; break;
          case "VS1MailchimpAudienceID": mailchimpSettings.mailchimpAudienceID = result.terppreference[i].Fieldvalue || mailchimpSettings.mailchimpAudienceID; break;
        }
      }
    }

    $('#mailchimpApiKey').val(mailchimpSettings.mailchimpApiKey);
    $('#mailchimpCampaignID').val(mailchimpSettings.mailchimpCampaignID);
    $('#mailchimpAudienceID').val(mailchimpSettings.mailchimpAudienceID);

  }).catch((error) => {
    window.open('/settings', '_self');
  });
});

Template.mailchimpSettings.events({
  'click #mailchimpSignUp': function () {
    window.open("https://login.mailchimp.com/signup");
  },

  'click #saveMailchimpSettings': async function () {
    playSaveAudio();
    let templateObject = Template.instance();
    setTimeout(async function(){
    $('.fullScreenSpin').css('display', 'inline-block');

    const allKeys = ["VS1MailchimpApiKey", "VS1MailchimpAudienceID", "VS1MailchimpCampaignID"]; 
    for (const eKey of allKeys) {
      let value = ''; 
      switch (eKey) {
        case "VS1MailchimpApiKey": value = $('#mailchimpApiKey').val(); break;
        case "VS1MailchimpCampaignID": value = $('#mailchimpCampaignID').val(); break;
        case "VS1MailchimpAudienceID": value = $('#mailchimpAudienceID').val(); break;
      }
      const data = {
        eKey,
        Fieldvalue: value
      }
      await templateObject.saveMailchimpSettings(data);
    }
    $('.fullScreenSpin').css('display', 'none');
    swal({
      title: 'Mailchimp settings successfully updated!',
      text: '',
      type: 'success',
      showCancelButton: false,
      confirmButtonText: 'OK'
    }).then((result) => {
      if (result.value) {
        window.open('/settings', '_self');
      } else if (result.dismiss === 'cancel') { }
    });
  }, delayTimeAfterSound);
  }
});
