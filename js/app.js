// ==============================
// ESTADO DAS CARGAS
// ==============================

let loads = {
    relay1: false,
    relay2: false,
    motor: false,
    fan: false
};


// ==============================
// PARÂMETROS DO SISTEMA TRIFÁSICO
// ==============================

const V_RMS   = 127;                          // tensão RMS fase-neutro
const V_PICO  = V_RMS * Math.sqrt(2);         // ~179,6 V

// Frequência "visual" (NÃO é 60 Hz real, é só pra ficar lento e visível)
const FREQ    = 2;                            // Hz
const OMEGA   = 2 * Math.PI * FREQ;           // rad/s

// Janela de tempo mostrada no gráfico
const JANELA = 2.0;    // 2 s → 4 ciclos visíveis
const PASSO  = 0.002;  // 2 ms por amostra → 1000 pontos (senoide suave)


// ==============================
// GRÁFICO TRIFÁSICO
// ==============================

const ctx = document
    .getElementById('voltageChart')
    .getContext('2d');


const voltageChart = new Chart(ctx, {

    type: 'line',

    data: {

        labels: [],

        datasets: [

            {
                label: 'Fase A',
                data: [],
                borderWidth: 2,
                tension: 0,
                fill: false,
                pointRadius: 0,
                borderColor: '#ef4444'
            },

            {
                label: 'Fase B',
                data: [],
                borderWidth: 2,
                tension: 0,
                fill: false,
                pointRadius: 0,
                borderColor: '#22c55e'
            },

            {
                label: 'Fase C',
                data: [],
                borderWidth: 2,
                tension: 0,
                fill: false,
                pointRadius: 0,
                borderColor: '#2563eb'
            }

        ]

    },

    options: {

        responsive: true,

        maintainAspectRatio: false,

        animation: false,

        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    color: '#94a3b8',              // cor do texto "Fase A", "Fase B", "Fase C"
                    font: {
                        size: 13,
                        weight: 'bold'
                    },
                    boxWidth: 20,
                    boxHeight: 3,
                    padding: 15
                }
            }
        },

        scales: {

            x: {
                display: false   // esconde o eixo X
            },

            y: {
                min: -200,
                max: 200,
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.2)'
                 },
                  ticks: {
                    color: '#38bdf8',
                    font: {
                        size: 13,
                        weight: 'bold'
                    }
                },
                title: {
                    display: true,
                    color: '#94a3b8',
                    weight: 'bold',
                    size: 25,
                    text: 'Tensão (V)'
                }
                
            }

        }

    }

});


// ==============================
// GERAÇÃO DA JANELA DE AMOSTRAS
// ==============================

let t0 = performance.now() / 1000;
let pausado = false;
let tPausado = 0;


function gerarJanela() {

    let tAtual;

    if (pausado) {
        tAtual = tPausado;
    } else {
        const agora = performance.now() / 1000;
        tAtual = agora - t0;
    }

    const labels = [];
    const faseA = [];
    const faseB = [];
    const faseC = [];

    const nPontos = Math.floor(JANELA / PASSO);

    for (let i = 0; i < nPontos; i++) {

        const t = tAtual - JANELA + i * PASSO;

        labels.push(t.toFixed(3));

        faseA.push(V_PICO * Math.sin(OMEGA * t));
        faseB.push(V_PICO * Math.sin(OMEGA * t - (2 * Math.PI / 3)));
        faseC.push(V_PICO * Math.sin(OMEGA * t - (4 * Math.PI / 3)));

    }

    voltageChart.data.labels = labels;
    voltageChart.data.datasets[0].data = faseA;
    voltageChart.data.datasets[1].data = faseB;
    voltageChart.data.datasets[2].data = faseC;

    voltageChart.update('none');

}


// Atualiza a 20 Hz (50 ms) → movimento suave
setInterval(gerarJanela, 50);
gerarJanela();


// ==============================
// BOTÃO PAUSAR / RETOMAR
// ==============================

const btnPausar = document.getElementById('btn-pausar');
const chartStatus = document.getElementById('chart-status');

btnPausar.addEventListener('click', () => {

    if (!pausado) {

        // Pausar: guarda o instante atual
        tPausado = performance.now() / 1000 - t0;
        pausado = true;

        btnPausar.textContent = 'RETOMAR';
        btnPausar.classList.add('pausado');
        chartStatus.textContent = 'Pausado';

    } else {

        // Retomar: reposiciona t0 pra continuar de onde parou
        t0 = performance.now() / 1000 - tPausado;
        pausado = false;

        btnPausar.textContent = 'PAUSAR';
        btnPausar.classList.remove('pausado');
        chartStatus.textContent = 'Monitoramento';

    }

});


// ==============================
// CARDS — VALORES RMS
// ==============================

function updateMeasurements() {

    // Tensões RMS por fase (127 V nominal ±3 V)
    let va = 127 + (Math.random() - 0.5) * 6;
    let vb = 127 + (Math.random() - 0.5) * 6;
    let vc = 127 + (Math.random() - 0.5) * 6;

    // Correntes por fase
    let ia = 0.5 + Math.random() * 2.5;
    let ib = 0.5 + Math.random() * 2.5;
    let ic = 0.5 + Math.random() * 2.5;

    // Fator de potência (0.85 a 0.99)
    let fp = 0.85 + Math.random() * 0.14;

    // Potências trifásicas (sistema 127/220)
    let vLinha = 220;
    let iMedia = (ia + ib + ic) / 3;
    let pAtiva = Math.sqrt(3) * vLinha * iMedia * fp;

    let senPhi = Math.sqrt(1 - fp * fp);
    let pReativa = Math.sqrt(3) * vLinha * iMedia * senPhi;


    document.getElementById('va').textContent = va.toFixed(1);
    document.getElementById('vb').textContent = vb.toFixed(1);
    document.getElementById('vc').textContent = vc.toFixed(1);

    document.getElementById('ia').textContent = ia.toFixed(2);
    document.getElementById('ib').textContent = ib.toFixed(2);
    document.getElementById('ic').textContent = ic.toFixed(2);

    document.getElementById('p-ativa').textContent = pAtiva.toFixed(1);
    document.getElementById('p-reativa').textContent = pReativa.toFixed(1);
    document.getElementById('fp').textContent = fp.toFixed(3);

}

setInterval(updateMeasurements, 1000);
updateMeasurements();


// ==============================
// CONTROLE DAS CARGAS
// ==============================

function toggleLoad(load) {

    loads[load] = !loads[load];

    const status = document.getElementById(`${load}-status`);

    const button = status.parentElement
        .parentElement
        .querySelector('button');


    if (loads[load]) {

        // LIGADO
        status.textContent = 'LIGADO';
        status.style.color = '#22c55e';       // verde

        button.textContent = 'DESLIGAR';
        button.classList.remove('off');
        button.classList.add('on');

    } else {

        // DESLIGADO
        status.textContent = 'DESLIGADO';
        status.style.color = '#94a3b8';       // cinza (padrão)

        button.textContent = 'LIGAR';
        button.classList.remove('on');
        button.classList.add('off');

    }

}