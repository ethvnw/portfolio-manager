const assetChartCtx = document.getElementById("assetChart").getContext("2d");
const performanceChartCtx = document
  .getElementById("performanceChart")
  .getContext("2d");

fetch("/asset-allocation")
  .then((response) => response.json())
  .then((data) => {
    // Group by type and sum percentages
    const groupedData = {};
    data.forEach((item) => {
      if (!groupedData[item.type]) {
        groupedData[item.type] = 0;
      }
      groupedData[item.type] += parseFloat(item.percentage);
    });

    // Convert to arrays for chart
    const labels = Object.keys(groupedData);
    const values = Object.values(groupedData);

    const assetChart = new Chart(assetChartCtx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Asset Allocation",
            data: values,
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
          },
        ],
      },
    });
  });

fetch("/portfolio-value-over-time")
  .then((response) => response.json())
  .then((data) => {
    const performanceChart = new Chart(performanceChartCtx, {
      type: "line",
      data: {
        labels: data.map((item) => item.date),
        datasets: [
          {
            label: "Portfolio Value",
            data: data.map((item) => item.value),
            borderColor: "#36A2EB",
            fill: false,
          },
        ],
      },
    });
  });
