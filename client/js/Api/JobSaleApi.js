import ApiService from "./Module/ApiService";
import ApiCollection from "./Module/ApiCollection";
import ApiCollectionHelper from "./Module/ApiCollectionHelper";
import ApiEndpoint from "./Module/ApiEndPoint";
import erpObject from "../../lib/global/erp-objects";

/**
 * @param {ApiCollection} collection
 */
 export default class JobSalesApi {
  constructor() {
    this.name = "jobsales";

    this.collectionNames = {
        TJobSalesSummary: erpObject.TJobSalesSummary
    };

    this.collection = new ApiCollection([
        new ApiEndpoint({
            name: this.collectionNames.TJobSalesSummary,
            url: ApiService.getBaseUrl({ endpoint: this.collectionNames.TJobSalesSummary }),
            headers: ApiService.getHeaders()
        })
    ]);
  }
}
