const w = 2 * Math.PI * 50; // 50 Hz
const V = 1.0;
const Xd = 1.0;
const Xdp = 0.3; // X'd
const Xdpp = 0.15; // X''d
const Tdp = 0.2; // T'd
const Tdpp = 0.05; // T''d
const Ta = 0.1;

let isShortCircuited = false;
let chartIa, chartIb, chartIc;
let slider = document.getElementById('time-slider');
let switchBox = document.getElementById('switch-box');
let switchText = document.getElementById('switch-text');

function generateData(phaseOffset) {
    const data = [];
    const labels = [];
    const alpha = parseFloat(slider.value) * Math.PI; // 0 to 2 mapped to 0 to 2pi

    for (let t = 0; t <= 2; t += 0.005) {
        labels.push(t.toFixed(3));
        if (!isShortCircuited) {
            data.push(0);
        } else {
            const angle = alpha + phaseOffset;
            const i_ac = Math.sqrt(2) * V * (
                1 / Xd +
                (1 / Xdp - 1 / Xd) * Math.exp(-t / Tdp) +
                (1 / Xdpp - 1 / Xdp) * Math.exp(-t / Tdpp)
            );
            const i_ac_inst = i_ac * Math.sin(w * t + angle - Math.PI / 2);
            
            const i_dc = Math.sqrt(2) * V * (1 / Xdpp) * Math.sin(angle - Math.PI / 2) * Math.exp(-t / Ta);
            
            data.push(i_ac_inst - i_dc);
        }
    }
    return { data, labels };
}

function initChart(ctxId, color) {
    const ctx = document.getElementById(ctxId).getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                data: [],
                borderColor: color,
                borderWidth: 1.5,
                pointRadius: 0,
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 0 // disable animation for performance when sliding
            },
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            },
            scales: {
                x: {
                    display: false // We use custom css labels
                },
                y: {
                    display: false,
                    min: -20,
                    max: 20
                }
            },
            layout: {
                padding: 0
            }
        }
    });
}

function updateCharts() {
    const dataIa = generateData(0);
    const dataIb = generateData(-2 * Math.PI / 3);
    const dataIc = generateData(2 * Math.PI / 3);

    chartIa.data.labels = dataIa.labels;
    chartIa.data.datasets[0].data = dataIa.data;
    chartIa.update();

    chartIb.data.labels = dataIb.labels;
    chartIb.data.datasets[0].data = dataIb.data;
    chartIb.update();

    chartIc.data.labels = dataIc.labels;
    chartIc.data.datasets[0].data = dataIc.data;
    chartIc.update();
}

window.onload = () => {
    chartIa = initChart('chartIa', 'blue');
    chartIb = initChart('chartIb', 'red');
    chartIc = initChart('chartIc', 'green');
    
    updateCharts();
};

slider.addEventListener('input', () => {
    if (isShortCircuited) {
        updateCharts();
    }
});

switchBox.addEventListener('click', () => {
    isShortCircuited = !isShortCircuited;
    if (isShortCircuited) {
        switchBox.classList.add('closed');
        switchText.innerHTML = 'Three<br>Phase<br>Short<br>Circuited';
    } else {
        switchBox.classList.remove('closed');
        switchText.innerHTML = 'Three<br>Phase<br>Open<br>Circuited';
    }
    updateCharts();
});
