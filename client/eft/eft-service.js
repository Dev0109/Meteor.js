import { BaseService } from "../js/base-service.js";
export class EftService extends BaseService {
  getTABADescriptiveRecord() {
    let options = {
      ListType: "Detail"
    };
    return this.getList(this.ERPObjects.TABADescriptiveRecord, options);
  }
  
  getTABADetailRecord() {
    let options = {
      ListType: "Detail"
    };
    return this.getList(this.ERPObjects.TABADetailRecord, options);
  }

  getTABADescriptiveRecordById(accountId) {
    let options = {
      ListType: "Detail",
      select: '[AccountID] = "' + accountId + '"',
    };
    return this.getList(this.ERPObjects.TABADescriptiveRecord, options);
  }
  
  getTABADetailRecordById(accountId) {
    let options = {
      ListType: "Detail",
      select: '[AccountID] = "' + accountId + '"',
    };
    return this.getList(this.ERPObjects.TABADetailRecord, options);
  }

  getTFixedAssetByNameOrID(dataSearchName) {
    let options = {
      ListType: "Detail",
      select: '[AssetName] f7like "' + dataSearchName + '" OR [ID] f7like "' + dataSearchName + '"',
    };
    return this.getList(this.ERPObjects.TFixedAssets, options);
  }

  getTFixedAssetDetail(id) {
    return this.getOneById(this.ERPObjects.TFixedAssets, id);
  }

  updateTFixedAsset(data) {
    return this.POST(this.ERPObjects.TFixedAssets, data);
  } 
}
