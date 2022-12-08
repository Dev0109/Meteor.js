import {BaseService} from '../js/base-service.js';
export class CountryService extends BaseService {
    getCountry() {
        return this.GET(this.erpGet.ERPCountries);
    }

    getCountryJeyhun() {
        let codes = require('../contacts/Model/phoneCodes.json');
        // return this.GET(this.erpGet.ERPCountries);
        let countries = [];
        codes.map(item=>{
            countries.push(item.name)
        })
        return codes
    }

}
