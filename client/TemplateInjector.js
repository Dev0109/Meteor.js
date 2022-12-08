import { ReportService } from "./reports/report-service";


export default class TemplateInjector {


    /**
     * This will inject the departments in the vars
     * @param {BlazeTemplate} templateObject 
     */
    static async addDepartments(templateObject) {
        // templateObject.departments = new ReactiveVar();
        const reportService = new ReportService();

        let data = await reportService.getDepartment();
        let departments = data.tdeptclass;

        departments.map((department) => {
            return {
                ...department,
                id: department.id,
                department: department.DeptClassName || ' ',
            }
        });

        templateObject.departments.set(departments);
    }
}