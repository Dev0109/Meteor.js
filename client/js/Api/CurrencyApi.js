import erpObject from "../../lib/global/erp-objects";
import ApiCollection from "./Module/ApiCollection";
import ApiEndPoint from "./Module/ApiEndPoint";
import ApiService from "./Module/ApiService";

export default class CurrencyApi {
  constructor() {
    this.name = "CurrencyApi";

    this.collectionNames = {
      TCurrencyFrequencySettings: erpObject.TCurrencyFrequencySettings
    };

    this.collection = new ApiCollection([new ApiEndPoint({
        name: this.collectionNames.TCurrencyFrequencySettings,
        url: ApiService.getBaseUrl({endpoint: erpObject.TCurrencyFrequencySettings}),
        headers: ApiService.getHeaders()
      })]);
  }
}
