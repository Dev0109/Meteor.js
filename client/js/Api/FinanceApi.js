


export default class FinanceApi {
    constructor() {

    }

    /**
     * This function will return the exchange rate
     *
     * @param {String} from
     * @param {String} to
     * @param {Integer} amount
     * @returns {String}
     */
    async get(from = "AUD", to = "USD", amount = 1) {
      try {
        var from = "GBP",
        to = "EUR",
        value = "19999.95";

        let url = "https://api.apilayer.com/exchangerates_data/convert?to=:TO&from=:FROM&amount=:AMOUNT";
        url.replace(':TO', to);
        url.replace(':FROM', from);
        url.replace(':AMOUNT', amount);



        const response = await fetch('https://openexchangerates.org/api/convert/' + value + '/' + from + '/' + to, {
            method: 'GET',
            headers: {
                "apikey": "iht40kF3G5NEe5qgypCwRpmDRngb4EnY"
            },
            redirect: 'follow',
        });

        if(response.ok) {
            const data = await response.json();

        }
      } catch(err) {

      }


    }
}
