import { BaseService } from "../js/base-service";

export class ManufacturingService extends BaseService {
    getAllProcessData() {
        let options = {
          ListType: "Detail"
        };
        return this.getList(this.ERPObjects.TProcessStep, options);
      }
      
    getOneProcessDataByID(id) {
      return this.getOneById(this.ERPObjects.TProcessStep, id);
    }

    saveProcessData(data) {
        return this.POST(this.ERPObjects.TProcessStep, data)
      }
  
}