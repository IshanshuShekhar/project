console.log("JS WORKING 🚀");

let barChart, lineChart, doughnutChart, efficiencyChart;

async function analyze(){

    const data = {
        water_usage: parseFloat(document.getElementById("water").value) || 0,
        energy_usage: parseFloat(document.getElementById("energy").value) || 0,
        electricity_cost: parseFloat(document.getElementById("cost").value) || 0,
        waste_generated: parseFloat(document.getElementById("waste").value) || 0
    };

    const res = await fetch("/analyze", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    });

    const r = await res.json();

    document.getElementById("result").innerHTML = `
        <h2>Score: ${r.score}</h2>
        <h3>Predicted Energy: ${r.prediction}</h3>
        <p>${r.ai}</p>
    `;

    // BAR
    if(barChart) barChart.destroy();
    barChart = new Chart(document.getElementById("barChart"), {
        type: "bar",
        data: {
            labels: ["Water","Energy","Cost","Waste"],
            datasets: [{
                label: "Usage",
                data: [
                    data.water_usage,
                    data.energy_usage,
                    data.electricity_cost,
                    data.waste_generated
                ]
            }]
        }
    });

    // LINE
    if(lineChart) lineChart.destroy();
    lineChart = new Chart(document.getElementById("lineChart"), {
        type: "line",
        data: {
            labels: r.history.map((_,i)=>i+1),
            datasets: [{
                label: "Energy Trend",
                data: r.history
            }]
        }
    });

    // DOUGHNUT
    if(doughnutChart) doughnutChart.destroy();
    doughnutChart = new Chart(document.getElementById("doughnutChart"), {
        type: "doughnut",
        data: {
            labels: ["Water","Energy","Cost","Waste"],
            datasets: [{
                data: [
                    data.water_usage,
                    data.energy_usage,
                    data.electricity_cost,
                    data.waste_generated
                ]
            }]
        }
    });

    // EFFICIENCY
    if(efficiencyChart) efficiencyChart.destroy();
    efficiencyChart = new Chart(document.getElementById("efficiencyChart"), {
        type: "bar",
        data: {
            labels: ["Water Efficiency","Energy Efficiency"],
            datasets: [{
                label: "%",
                data: [
                    (100 / Math.max(data.water_usage,1)) * 100,
                    (80 / Math.max(data.energy_usage,1)) * 100
                ]
            }]
        }
    });
}