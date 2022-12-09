import { BaseService } from "../js/base-service";

export class ManufacturingService extends BaseService {
    getAllProcessData(limitCount, limitfrom) {
      let options = "";
        if(limitCount == "All") {
          options = {
            ListType: 'Detail',
            Search: "Active = true",
          }
        }else{
          options = {
            ListType: 'Detail',
            Search: "Active = true",
            LimitCount: parseInt(limitCount),
            LimitFrom: parseInt(limitfrom)
          }
        }
        return this.getList(this.ERPObjects.TProcessStep, options);
    }  
    
      
    getOneProcessDataByID(id) {
      return this.getOneById(this.ERPObjects.TProcessStep, id);
    }

    saveProcessData(data) {
        return this.POST(this.ERPObjects.TProcessStep, data)
      }
  
}