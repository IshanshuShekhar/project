let barChart, waterChart, energyChart, costChart;

async function analyze() {
    const data = {
        water_usage: +water.value || 0,
        water_demand: +water_demand.value || 100,
        energy_usage: +energy.value || 0,
        energy_demand: +energy_demand.value || 80,
        electricity_cost: +cost.value || 0,
        waste_generated: +waste.value || 0
    };

    const res = await fetch("/analyze", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(data)
    });
    const r = await res.json();

    result.innerHTML = `<h2>Score: ${r.score}</h2>
                        <h3>Energy Prediction: ${r.prediction}</h3>`;
    aiBox.innerHTML = `<h3>AI Suggestions</h3><p>${r.ai}</p>`;
    savingsBox.innerHTML = `<h3>💰 Savings</h3><h2>₹ ${r.savings}</h2>`;

    createCharts(r, data);
}

async function whatIf() {
    const data = {
        water_usage: +water.value || 0,
        energy_usage: +energy.value || 0,
        electricity_cost: +cost.value || 0,
        waste_generated: +waste.value || 0
    };

    const res = await fetch("/whatif-ai", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(data)
    });
    const r = await res.json();

    whatBox.innerHTML = `<h3>🔮 What-If</h3><p>${r.whatif}</p>`;
}

function createCharts(r, data) {
    const chartOptions = {
        responsive:true,
        plugins:{legend:{display:false}},
        scales:{y:{beginAtZero:true,ticks:{color:'#fff'}}, x:{ticks:{color:'#fff'}}},
        maintainAspectRatio:false
    };

    function destroyIfExists(chart) {
        if(chart) chart.destroy();
    }

    destroyIfExists(barChart);
    destroyIfExists(waterChart);
    destroyIfExists(energyChart);
    destroyIfExists(costChart);

    // Main usage chart
    barChart = new Chart(document.getElementById("barChart"), {
        type:"bar",
        data:{
            labels:["Water","Energy","Cost","Waste"],
            datasets:[{
                data:[data.water_usage,data.energy_usage,data.electricity_cost,data.waste_generated],
                backgroundColor:["#00ffcc","#ff4d6d","#ffd60a","#4cc9f0"]
            }]
        },
        options: chartOptions
    });

    // Water Usage vs Demand
    waterChart = new Chart(document.getElementById("waterChart"), {
        type:"bar",
        data:{
            labels:["Water Usage","Water Demand"],
            datasets:[{data:[data.water_usage,data.water_demand],backgroundColor:["#4cc9f0","#3a0ca3"]}]
        },
        options: chartOptions
    });

    // Energy Usage vs Demand
    energyChart = new Chart(document.getElementById("energyChart"), {
        type:"bar",
        data:{
            labels:["Energy Usage","Energy Demand"],
            datasets:[{data:[data.energy_usage,data.energy_demand],backgroundColor:["#ff4d6d","#720026"]}]
        },
        options: chartOptions
    });

    // Cost vs Savings
    costChart = new Chart(document.getElementById("costChart"), {
        type:"bar",
        data:{
            labels:["Cost","Estimated Savings"],
            datasets:[{data:[data.electricity_cost,r.savings],backgroundColor:["#ffd60a","#00ff88"]}]
        },
        options: chartOptions
    });
}