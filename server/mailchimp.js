const mailchimp = require('@mailchimp/mailchimp_marketing');

Meteor.startup(function () {
});

Meteor.methods({

  createListMembers: async function (erpGet, supplier = 0, customer = 0, employee = 0) {

    const responseHandler = (response) => {
      if (response === undefined || !response) {
        let getResponse = "You have lost internet connection, please log out and log back in.";
        return getResponse;
      } else {
        if (response.statusCode === 200) {
          try {
            var content = JSON.parse(response.content);
            return content;
          } catch (e) { }
        } else if (response.statusCode === 401) {

        } else {
          return response.headers.errormessage;
        }
      }
    }

    const addMultipleMembers = async (membersList, apikey, listId) => {
      try {
        const apiregion = apikey.split('-')[1];
        mailchimp.setConfig({
          apiKey: apikey,
          server: apiregion,
        });

        const response = await mailchimp.lists.batchListMembers(listId, {
          // skip_duplicate_check: false,
          members: membersList,
          // members: memberDetails,
          update_existing: true
        });
        return response;

      }
      catch (err) {
        return err;
      }
    }

    const getContactsFromVS1 = (erpGet, _headers, type) => {
      var apiUrl = `https://${erpGet.ERPIPAddress}:${erpGet.ERPPort}/${erpGet.ERPApi}/TCustomerVS1?ListType=Detail`;
      switch (type) {
        case 'tcustomervs1':
          apiUrl = `https://${erpGet.ERPIPAddress}:${erpGet.ERPPort}/${erpGet.ERPApi}/TCustomerVS1?ListType=Detail`;
          break;
        case 'temployee':
          apiUrl = `https://${erpGet.ERPIPAddress}:${erpGet.ERPPort}/${erpGet.ERPApi}/TEmployee?ListType=Detail`;
          break;
        case 'tsuppliervs1':
          apiUrl = `https://${erpGet.ERPIPAddress}:${erpGet.ERPPort}/${erpGet.ERPApi}/TSupplierVS1?ListType=Detail`;
          break;
        default:
          break;
      }
      const promise = new Promise(function (resolve, reject) {
        HTTP.get(apiUrl, { headers: _headers }, function (err, response) {
          const data = responseHandler(response);
          if (err || !data) {
            reject([]);
          }
          if (data) {
            const membersList = [];
            data[type].forEach(member => {
              if (member.fields.Email) {
                // let duplicated = membersList.filter(item => item.email_address.toLowerCase() === member.fields.Email.toLowerCase() && item.email_address.toLowerCase().includes("email.com"));
                // if (duplicated.length < 1) {
                let memberDetails = {
                  email_address: member.fields.Email,
                  email_type: 'html',
                  status: 'subscribed',
                  merge_fields: {
                    FNAME: member.fields.FirstName,
                    LNAME: member.fields.LastName,
                  }
                }
                membersList.push(memberDetails);
                // }
              }
            });
            resolve(membersList);
          }
        });
      });
      return promise;
    }

    const _headers = {
      database: erpGet.ERPDatabase,
      username: erpGet.ERPUsername,
      password: erpGet.ERPPassword,
    };

    let membersLists = [];
    let temp = [];
    if (customer === 'on') {
      temp = await getContactsFromVS1(erpGet, _headers, 'tcustomervs1');
      if (temp.length > 0) {
        membersLists = [...membersLists, ...temp];
      }
    }

    if (employee === 'on') {
      temp = await getContactsFromVS1(erpGet, _headers, 'temployee');
      if (temp.length > 0) {
        membersLists = [...membersLists, ...temp];
      }
    }

    if (supplier === 'on') {
      temp = await getContactsFromVS1(erpGet, _headers, 'tsuppliervs1');
      if (temp.length > 0) {
        membersLists = [...membersLists, ...temp];
      }
    }

    if (membersLists.length > 0) {
      const apiKyes = await getApikeyFromVS1(erpGet, _headers);

      const apikey = apiKyes.mailchimpApiKey;
      const listId = apiKyes.mailchimpAudienceID;

      const uniqueIds = [];

      const unique = membersLists.filter(element => {
        const isDuplicate = uniqueIds.includes(element.email_address) || element.email_address.toLowerCase().includes("email.com");

        if (!isDuplicate) {
          uniqueIds.push(element.email_address);
          return true;
        }

        return false;
      });

      addMultipleMembers(unique, apikey, listId);
    }

    return 'ok';

  },

  getCampaignOpenReports: async function (erpGet, email = '') {

    try {
      const _headers = {
        database: erpGet.ERPDatabase,
        username: erpGet.ERPUsername,
        password: erpGet.ERPPassword,
      };

      const apiKyes = await getApikeyFromVS1(erpGet, _headers);
      const apikey = apiKyes.mailchimpApiKey;

      const apiregion = apikey.split('-')[1];
      mailchimp.setConfig({
        apiKey: apikey,
        server: apiregion,
      });

      const campaigns = await mailchimp.campaigns.list();

      let response = [];
      for (const campaign of campaigns.campaigns) {
        let opens = await mailchimp.reports.getCampaignOpenDetails(campaign.id);
        response.push({ campaign_name: campaign.recipients.list_name, subject: campaign.settings.subject_line, opens: opens.members });
      };

      return response;

    }
    catch (err) {
      return [];
    }

  },

  getAllCampaignReports: async function (erpGet, email = '') {

    try {
      const _headers = {
        database: erpGet.ERPDatabase,
        username: erpGet.ERPUsername,
        password: erpGet.ERPPassword,
      };

      const apiKyes = await getApikeyFromVS1(erpGet, _headers);
      const apikey = apiKyes.mailchimpApiKey;
      const apiregion = apikey.split('-')[1];

      mailchimp.setConfig({
        apiKey: apikey,
        server: apiregion,
      });

      let response = await mailchimp.reports.getAllCampaignReports();
      response = response.reports;

      return response;

    }
    catch (err) {
      return [];
    }

  },

  createCampaign: async function (erpGet, settings) {
    try {
      const _headers = {
        database: erpGet.ERPDatabase,
        username: erpGet.ERPUsername,
        password: erpGet.ERPPassword,
      };
      const apiKyes = await getApikeyFromVS1(erpGet, _headers);

      const apikey = apiKyes.mailchimpApiKey;
      // const listId = apiKyes.mailchimpAudienceID;
      const apiregion = apikey.split('-')[1];

      mailchimp.setConfig({
        apiKey: apikey,
        server: apiregion,
      });

      const response = await mailchimp.campaigns.create({ type: "plaintext", settings: settings });
    }
    catch (err) {
      return err;
    }
    return 'ok';

  },

});

const getApikeyFromVS1 = (erpGet, _headers) => {
  const responseHandler = (response) => {
    if (response === undefined || !response) {
      let getResponse = "You have lost internet connection, please log out and log back in.";
      return getResponse;
    } else {
      if (response.statusCode === 200) {
        try {
          var content = JSON.parse(response.content);
          return content;
        } catch (e) { }
      } else if (response.statusCode === 401) {

      } else {
        return response.headers.errormessage;
      }
    }
  }
  var apiUrl = `https://${erpGet.ERPIPAddress}:${erpGet.ERPPort}/${erpGet.ERPApi}/TERPPreference?select=[PrefName]="VS1MailchimpApiKey" or [PrefName]="VS1MailchimpAudienceID"&PropertyList=PrefName,Fieldvalue`;
  const promise = new Promise(function (resolve, reject) {
    HTTP.get(apiUrl, { headers: _headers }, function (err, response) {
      const data = responseHandler(response);

      let mailchimpSettings = {
        mailchimpApiKey: '',
        mailchimpAudienceID: ''
      };

      if (err || !data) {
        reject(mailchimpSettings);
      }
      if (data) {
        for (let i = 0; i < data.terppreference.length; i++) {
          switch (data.terppreference[i].PrefName) {
            case "VS1MailchimpApiKey": mailchimpSettings.mailchimpApiKey = data.terppreference[i].Fieldvalue || mailchimpSettings.mailchimpApiKey; break;
            case "VS1MailchimpAudienceID": mailchimpSettings.mailchimpAudienceID = data.terppreference[i].Fieldvalue || mailchimpSettings.mailchimpAudienceID; break;
          }
        }
        resolve(mailchimpSettings);
      }
    });
  });
  return promise;
}