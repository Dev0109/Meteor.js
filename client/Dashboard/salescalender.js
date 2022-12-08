import { Template } from 'meteor/templating';
//Calendar
import { Calendar, formatDate } from '@fullcalendar/core';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import bootstrapPlugin from '@fullcalendar/bootstrap';

Template.calendar.onRendered(() => {
  var date = new Date();
  var d = date.getDate();
  var m = date.getMonth();
  var y = date.getFullYear();
  $('#calendarDiv').fullCalendar({
      header: {
          left: 'basicDay, basicWeek, month',
          center: 'title',
          right: 'today prev,next'
      },
      editable: true,
      weekends: false,
      events: [{
          id: 1,
          title: 'Birthday',
          start: new Date(y, m, 1),
          allDay: true,
          description: 'Happy Birthday',
      }, {
          id: 2,
          title: 'Concert',
          start: '2016-12-07T21:00:00',
          end :'2016-12-07T23:00:00',
          allDay: false,
          color: '#e74c3c'
      }, {
          id: 3,
          title: 'Lunch',
          start: new Date(y, m, 16, 14),
          end: new Date(y, m, 16, 16),
          allDay: false,
          color: '#3498db'
      }, {
          id: 4,
          title: 'Class',
          start: new Date(y, m, 20, 10),
          allDay: false,
          color: '#9b59b6'
      }, {
          id: 5,
          title: 'Party',
          start: new Date(y, m, 5, 18),
          allDay: false,
          color: '#e67e22'
      }],
      dayClick: function(date) {

      },
      eventClick: function(event) {
      },
      eventMouseover: function(calEvent) {
          $(this).css('background-color', 'black');
      }
  });
});
