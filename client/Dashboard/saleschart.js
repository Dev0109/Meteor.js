import { Template } from 'meteor/templating';
import Chart from 'chart.js';

function random() {
  return Math.floor((Math.random() * 100) + 1);
}

Template.charts.onRendered(function () {
  // Set the data
  const data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        label: 'My First dataset',
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          'rgba(255,99,132,1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
        data: [random(), random(), random(), random(), random(), random(), random()],
      },
    ],
  };

  const myBarChart = new Chart('myChart', {
    type: 'bar',
    data,
    options: {
      maintainAspectRatio: false,
    },
  });
});