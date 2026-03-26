let barChart, lineChart, doughnutChart, efficiencyChart;

function animateValue(element, start, end, duration) {
    let startTime = null;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        element.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}

// 🤖 AI typing effect
function typeEffect(text, element, speed = 20) {
    element.innerHTML = "";
    let i = 0;

    function typing() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(typing, speed);
        }
    }
    typing();
}

async function analyze(){

    document.getElementById("loader").style.display = "block";

    const data = {
        water_usage: parseFloat(water.value) || 0,
        energy_usage: parseFloat(energy.value) || 0,
        electricity_cost: parseFloat(cost.value) || 0,
        waste_generated: parseFloat(waste.value) || 0
    };

    const res = await fetch("/analyze", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(data)
    });

    const r = await res.json();

    document.getElementById("loader").style.display = "none";

    // Animated score
    document.getElementById("result").innerHTML = `
        <h2 id="score">0</h2>
        <h3>⚡ Energy: ${r.prediction}</h3>
        <p id="aiText"></p>
    `;

    animateValue(document.getElementById("score"), 0, r.score, 1000);
    typeEffect(r.ai, document.getElementById("aiText"));

    // Charts
    if(barChart) barChart.destroy();
    barChart = new Chart(document.getElementById("barChart"), {
        type: "bar",
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

    if(lineChart) lineChart.destroy();
    lineChart = new Chart(document.getElementById("lineChart"), {
        type: "line",
        data: {
            labels: r.history.map((_,i)=>i+1),
            datasets: [{ data: r.history }]
        }
    });

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

    if(efficiencyChart) efficiencyChart.destroy();
    efficiencyChart = new Chart(document.getElementById("efficiencyChart"), {
        type: "bar",
        data: {
            labels: ["Water","Energy"],
            datasets: [{
                data: [
                    (100 / Math.max(data.water_usage,1)) * 100,
                    (80 / Math.max(data.energy_usage,1)) * 100
                ]
            }]
        }
    });
}