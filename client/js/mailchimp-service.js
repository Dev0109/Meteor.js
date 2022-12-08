import { BaseService } from '../js/base-service.js';

export class MailchimpService extends BaseService {
  getMailchimpSettings() {
    let options = {
      PropertyList: "PrefName,Fieldvalue",
      select: '[PrefName]="VS1MailchimpApiKey" or [PrefName]="VS1MailchimpAudienceID" or [PrefName]="VS1MailchimpCampaignID"'
    }
    return this.getList(this.ERPObjects.TERPPreference, options);
  }

  saveMailchimpSettings(data) {
    return this.POST(this.ERPObjects.TERPPreference, data);
  }
}
