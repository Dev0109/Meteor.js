import ApiService from "./Module/ApiService";
import ApiCollection from "./Module/ApiCollection";
import ApiCollectionHelper from "./Module/ApiCollectionHelper";
import ApiEndpoint from "./Module/ApiEndPoint";

/**
 * @param {ApiCollection} collection
 */
export default class ProfitLossLayoutApi {
  constructor() {
    this.name = "profitLossLayout";

    this.collectionNames = {
        TProfitLossLayout: "TProfitLossLayout"
    };

    this.collection = new ApiCollection([
        new ApiEndpoint({
            name: this.collectionNames.TProfitLossLayout,
            url: ApiService.getBaseUrl({ endpoint: "TProfitAndLossReport?standardLayout" }),
            headers: ApiService.getHeaders()
        })
    ]);
  }
}
