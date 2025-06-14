// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';

var pieChart;
function renderPieChart(dataSet){
  var ctx = document.getElementById("myPieChart");
  if(pieChart) pieChart.destroy();
  var categoryLabels = categories.map(function(c){return c.name;});
  var categoryTotals = categories.map(function(c){
    return dataSet.filter(function(t){return t.category === c.id;})
      .reduce(function(sum, t){return sum + t.amount;}, 0);
  });
  pieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: categoryLabels,
      datasets: [{
        data: categoryTotals,
        backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e'],
        hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf', '#f4b619'],
        hoverBorderColor: "rgba(234, 236, 244, 1)",
      }],
    },
    options: {
      maintainAspectRatio: false,
      tooltips: {
        backgroundColor: "rgb(255,255,255)",
        bodyFontColor: "#858796",
        borderColor: '#dddfeb',
        borderWidth: 1,
        xPadding: 15,
        yPadding: 15,
        displayColors: false,
        caretPadding: 10,
      },
      legend: {
        display: false
      },
      cutoutPercentage: 80,
    },
  });
}

document.addEventListener('DOMContentLoaded', function(){
  if (typeof transactions !== 'undefined') {
    renderPieChart(transactions);
  }
});
