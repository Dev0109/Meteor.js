import { BaseService } from "../js/base-service.js";
export class FixedAssetService extends BaseService {
  getTFixedAssetsList() {
    let options = {
      ListType: "Detail"
    };
    return this.getList(this.ERPObjects.TFixedAssets, options);
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

  getFixedAssetTypes() {
    let options = {
      PropertyList: "AssetTypeName, AssetTypeCode, Notes",
      select: "[Active]=true",
    };
    return this.getList(this.ERPObjects.TFixedAssetType, options);
  } 

  getFixedAssetType(id) {
    return this.getOneById(this.ERPObjects.TFixedAssetType, id);
  }
}
