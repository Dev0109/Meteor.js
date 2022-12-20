import { BaseService } from "../js/base-service.js";
export class CRMService extends BaseService {
    getAllTaskList(EnteredByID = '') {
        let options = {
            ListType: "Detail",
            select: "pt.Active=true"
        };
        if (EnteredByID) {
            options = {
                ListType: "Detail",
                // select: "[Active]=true and [EnteredByID]=" + EnteredByID
                select: "pt.Active=true and [EnteredBy]='" + EnteredByID + "'"
            };
        }
        return this.getList(this.ERPObjects.Tprojecttasks, options);
        // hi Adona, crm is using this function. if you change this, crm section will be broken
        // return this.getList(this.ERPObjects.TAppointment, options)
    }

    getAllTasksByTaskName(TaskName = '') {
        let options = {
            ListType: "Detail",
            select: "pt.Active=true"
        };
        if (TaskName) {
            options = {
                ListType: "Detail",
                select: "pt.Active=true and [TaskName]='" + TaskName + "'"
            };
        }
        return this.getList(this.ERPObjects.Tprojecttasks, options);
    }

    getAllTasksByContactName(ContactName = '') {
        let options = {
            ListType: "Detail",
            select: "pt.Active=true"
        };
        if (ContactName) {
            options = {
                ListType: "Detail",
                select: "pt.Active=true and [ContactName]='" + ContactName + "'"
            };
        }
        return this.getList(this.ERPObjects.Tprojecttasks, options);
    }

    getAllAppointments(ClientName = '') {
        let options = {
            ListType: 'Detail',
            select: "[Active]=true"
        };
        if (ClientName) {
            options = {
                ListType: 'Detail',
                select: "[Active]=true and [ClientName]='" + ClientName + "'"
            }
        }
        return this.getList(this.ERPObjects.TAppointment, options);
    }

    getTasksByNameOrID(dataSearchName) {
        let options = {
            ListType: "Detail",
            select: 'pt.Active=true and [TaskName] f7like "' + dataSearchName + '" OR [ID] f7like "' + dataSearchName + '"',
        };
        return this.getList(this.ERPObjects.Tprojecttasks, options);
    }

    getTaskDetail(id) {
        return this.getOneById(this.ERPObjects.Tprojecttasks, id);
    }

    saveNewTask(data) {
        return this.POST(this.ERPObjects.Tprojecttasks, data);
    }

    getTProjectList(EnteredByID = '') {
        let options = {
            ListType: "Detail",
            select: "[Active]=true"
        };
        if (EnteredByID) {
            options = {
                ListType: "Detail",
                // select: "[Active]=true and [EnteredByID]=" + EnteredByID
                select: "[Active]=true and [EnteredBy]='" + EnteredByID + "'"
            };
        }
        return this.getList(this.ERPObjects.Tprojectlist, options);
    }

    getProjectsByNameOrID(dataSearchName) {
        let options = {
            ListType: "Detail",
            select: '[ProjectName] f7like "' + dataSearchName + '" OR [ID] f7like "' + dataSearchName + '"',
        };
        return this.getList(this.ERPObjects.Tprojectlist, options);
    }

    getTProjectDetail(id) {
        return this.getOneById(this.ERPObjects.Tprojectlist, id);
    }

    updateProject(data) {
        return this.POST(this.ERPObjects.Tprojectlist, data);
    }

    getAllLabels(EnteredByID = '') {
        let options = {
            ListType: "Detail",
            select: "[Active]=true"
        };
        if (EnteredByID) {
            options = {
                ListType: "Detail",
                // select: "[Active]=true and [EnteredByID]=" + EnteredByID
                select: "[Active]=true and [EnteredBy]='" + EnteredByID + "'"
            };
        }
        return this.getList(this.ERPObjects.Tprojecttask_TaskLabel, options);
    }

    getLabelsByNameOrID(dataSearchName) {
        let options = {
            ListType: "Detail",
            select: '[Active]=true and [TaskLabelName] f7like "' + dataSearchName + '" OR [ID] f7like "' + dataSearchName + '"',
        };
        return this.getList(this.ERPObjects.Tprojecttask_TaskLabel, options);
    }

    getOneLabel(id) {
        return this.getOneById(this.ERPObjects.Tprojecttask_TaskLabel, id);
    }

    updateLabel(data) {
        return this.POST(this.ERPObjects.Tprojecttask_TaskLabel, data);
    }

    getTTodoTaskList() {
        let options = {
            orderby: '"ToDoByDate asc"',
            ListType: "Detail",
            select: "[Active]=true and [Completed]=false and [Done]=false",
            // select: "[Active]=true and [Completed]=false and [EmployeeID]=" + employeeID
        };
        return this.getList(this.ERPObjects.TToDo, options);
    }

    getOneTTodoTask(id) {
        return this.getOneById(this.ERPObjects.TToDo, id);
    }

    saveComment(data) {
        return this.POST(this.ERPObjects.Tprojecttask_comments, data);
    }

    getAllFilters() {
        return;
    }

    getAllLeads(fromDate) {
        options = {
            ListType: "Detail",
            select: "[Active]=true and [IsCustomer]!=true and [IsSupplier]!=true and [CreationDate]>'" + fromDate + "'",
        };
        return this.getList(this.ERPObjects.TProspect, options);
    }
}
