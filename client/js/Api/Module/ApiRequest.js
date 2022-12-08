import ApiService from "./ApiService";


export default class ApiRequest {
    constructor() {
    }

    static async getDashboardCharts() {
        const url = ApiService.getBaseUrl() + "Tvs1charts";
        await ApiService.fetch(url, {
            headers: ApiService.getHeaders(),
            method: "GET"
        }, (response) => {

        });

    }

    static async getDashboardTabGroups() {
        const url = ApiService.getBaseUrl() + "TVs1TabGroups";


    }
    static async getDashboardPreferences() {
        const url = ApiService.getBaseUrl() + "Tvs1dashboardpreferences";


    }
}
