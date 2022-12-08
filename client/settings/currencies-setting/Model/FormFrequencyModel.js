export default class FormFrequencyModel {
  constructor({
    MonthlyEveryDay = '',
    MonthlyOfMonths = '',
    MonthlyStartDate = '',
    MonthlyStartTime = '',

    WeeklySelectDays = '',
    WeeklyEvery = '',
    WeeklyStartDate = '',
    WeeklyStartTime = '',

    DailyEveryDay = '',
    DailyWeekDays = '',
    DailyEvery = '',
    DailyStartTime = '',
    DailyStartDate = '',

    OneTimeStartTime = '',
    OneTimeStartDate = '',

    OnEventLogIn = '',
    OnEventLogOut = '',

    EmployeeId = ''
  }) {
    this.MonthlyEveryDay = MonthlyEveryDay;
    this.MonthlyOfMonths = MonthlyOfMonths;
    this.MonthlyStartDate = MonthlyStartDate;
    this.MonthlyStartTime = MonthlyStartTime;

    this.WeeklyEvery = WeeklyEvery;
    this.WeeklySelectDays = WeeklySelectDays;
    this.WeeklyStartDate = WeeklyStartDate;
    this.WeeklyStartTime = WeeklyStartTime;

    this.DailyEvery = DailyEvery;
    this.DailyEveryDay = DailyEveryDay;
    this.DailyStartDate = DailyStartDate;
    this.DailyStartTime = DailyStartTime;
    this.DailyWeekDays = DailyWeekDays;

    this.OneTimeStartDate = OneTimeStartDate;
    this.OneTimeStartTime = OneTimeStartTime;

    this.OnEventLogOut = OnEventLogOut;
    this.OnEventLogIn = OnEventLogIn;

    this.EmployeeId = EmployeeId;
  }

  async save() {
    try {
      await addVS1Data("TFrequencyForm", JSON.stringify(this));
    } catch (e) {
      // Handle error
    }
  }
}