Template.newTaskModal.inheritsHelpersFrom('alltaskdatatable');
Template.newTaskModal.inheritsEventsFrom('alltaskdatatable');
Template.newTaskModal.inheritsHooksFrom('alltaskdatatable');


Template.newTaskModal.helpers({

  getTodoDate: (date, format) => {
    if (date == "" || date == null) return '';
    return moment(date).format(format);

    if (moment().format('YYYY-MM-DD') == moment(date).format('YYYY-MM-DD')) {
      return 'Today';
    } else if (moment().add(1, 'day').format('YYYY-MM-DD') == moment(date).format('YYYY-MM-DD')) {
      return 'Tomorrow';
    } else {
      return moment(date).format(format);
    }
  },

  getTaskStyleClass: (date) => {
    if (date == "" || date == null) return 'taskNodate';
    if (moment().format('YYYY-MM-DD') == moment(date).format('YYYY-MM-DD')) {
      return 'taskToday';
    } else if (moment().add(1, 'day').format('YYYY-MM-DD') == moment(date).format('YYYY-MM-DD')) {
      return 'taskTomorrow';
    } else if (moment().format('YYYY-MM-DD') > moment(date).format('YYYY-MM-DD')) {
      return 'taskOverdue';
    } else {
      return 'taskUpcoming';
    }
  },

  getTodayDate: (format) => {
    return moment().format(format);
  },

  getTomorrowDay: () => {
    return moment().add(1, 'day').format('ddd');
  },

  getNextMonday: () => {
    var startDate = moment();
    return moment(startDate).day(1 + 7).format('ddd MMM D');
  },

  getDescription: (description) => {
    return description.length < 80 ? description : description.substring(0, 79) + '...'
  },

  getTaskLabel: (labels) => {
    if (labels == '' || labels == null) {
      return '';
    } else if (labels.type == undefined) {
      let label_string = '';
      labels.forEach(label => {
        label_string += label.fields.TaskLabelName + ', '
      });
      return label_string.slice(0, -2);
    } else {
      return labels.fields.TaskLabelName;
    }
  },
});