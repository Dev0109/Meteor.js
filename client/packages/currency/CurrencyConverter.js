class CurrencyConverter {
  constructor() {
  }

  /**
   * This will convert any amount with the correct rate
   * @param {number} amount
   * @param {number} rate
   * @return {number}
   */
  convertAmount(amount = 1, rate = 1) {
    const converted = amount * rate;
    return converted;
  }
}

export default CurrencyConverter = new CurrencyConverter();
