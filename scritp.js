// State Definitions
let states = [];
let startState = "";
let acceptStates = [];
let transitions = []; // Array of { from: 'q0', symbol: 'a', to: 'q1' }
let cy = null; // Cytoscape instance

// DOM Elements
const statesInput = document.getElementById('states-input');
const startStateInput = document.getElementById('start-state-input');
const acceptStatesInput = document.getElementById('accept-states-input');
const saveDesignBtn = document.getElementById('save-design-btn');
const designStatus = document.getElementById('design-status');

const transFrom = document.getElementById('trans-from');
const transSymbol = document.getElementById('trans-symbol');
const transTo = document.getElementById('trans-to');
const addTransBtn = document.getElementById('add-trans-btn');
const transitionBody = document.getElementById('transition-body');

const modeSelect = document.getElementById('automata-mode');
const inputStringEl = document.getElementById('input-string');
const simulateBtn = document.getElementById('simulate-btn');
const resetSimBtn = document.getElementById('reset-sim-btn');
const loadExampleBtn = document.getElementById('load-example-btn');
const exampleSelect = document.getElementById('example-select');
const epsilonBtn = document.getElementById('epsilon-btn');

const traceContainer = document.getElementById('trace-container');
const finalResult = document.getElementById('final-result');

// Initialize
function init() {
    saveDesignBtn.addEventListener('click', saveDesign);
    addTransBtn.addEventListener('click', addTransition);
    simulateBtn.addEventListener('click', runSimulation);
    resetSimBtn.addEventListener('click', resetSimulation);
    loadExampleBtn.addEventListener('click', loadExample);

    // Epsilon button: insert ε into the symbol field
    epsilonBtn.addEventListener('click', () => {
        transSymbol.value = 'ε';
        transSymbol.focus();
    });

    // Show/hide epsilon button based on mode
    modeSelect.addEventListener('change', toggleEpsilonButton);
    toggleEpsilonButton(); // set initial state

    updateGraph();
}

function toggleEpsilonButton() {
    epsilonBtn.style.display = modeSelect.value === 'NFA' ? 'inline-block' : 'none';
}

function updateGraph() {
    const elements = [];

    // Nodes
    states.forEach(s => {
        let classes = [];
        if (s === startState) classes.push('start');
        if (acceptStates.includes(s)) classes.push('accept');

        elements.push({
            data: { id: s },
            classes: classes.join(' ')
        });
    });

    // Edges
    transitions.forEach((t, i) => {
        elements.push({
            data: { id: 'e' + i, source: t.from, target: t.to, label: t.symbol }
        });
    });

    if (cy) {
        cy.destroy();
    }

    cy = cytoscape({
        container: document.getElementById('cy'),
        elements: elements,
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': '#2196F3',
                    'label': 'data(id)',
                    'color': '#fff',
                    'text-valign': 'center',
                    'text-halign': 'center',
                    'font-size': '14px',
                    'width': '40px',
                    'height': '40px'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 2,
                    'line-color': '#ccc',
                    'target-arrow-color': '#ccc',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier',
                    'label': 'data(label)',
                    'font-size': '12px',
                    'text-background-opacity': 1,
                    'text-background-color': '#ffffff',
                    'text-background-padding': '2px',
                    'control-point-step-size': 40
                }
            },
            {
                selector: 'node.accept',
                style: {
                    'border-width': '4px',
                    'border-color': '#4CAF50',
                    'border-style': 'double'
                }
            },
            {
                selector: 'node.start',
                style: {
                    'border-width': '2px',
                    'border-color': '#ff9800'
                }
            },
            {
                selector: 'node.active',
                style: {
                    'background-color': '#d81b60',
                    'color': '#fff',
                    'transition-property': 'background-color, color',
                    'transition-duration': '0.3s'
                }
            },
            {
                selector: 'edge.active-edge',
                style: {
                    'line-color': '#d81b60',
                    'target-arrow-color': '#d81b60',
                    'width': 4,
                    'transition-property': 'line-color, target-arrow-color, width',
                    'transition-duration': '0.3s'
                }
            }
        ],
        layout: {
            name: 'cose',
            padding: 30,
            animate: true
        }
    });
}

function saveDesign() {
    const sVal = statesInput.value.trim();
    if (sVal) {
        states = sVal.split(',').map(s => s.trim()).filter(s => s);
    } else {
        states = [];
    }

    startState = startStateInput.value.trim();

    const aVal = acceptStatesInput.value.trim();
    if (aVal) {
        acceptStates = aVal.split(',').map(s => s.trim()).filter(s => s);
    } else {
        acceptStates = [];
    }

    if (states.length === 0 || !startState) {
        designStatus.textContent = "Error: Please provide states and a start state.";
        designStatus.style.color = "var(--danger-color)";
        updateGraph();
        return;
    }

    designStatus.textContent = `Design saved! States: ${states.length}, Start: ${startState}, Accept: ${acceptStates.length}`;
    designStatus.style.color = "var(--primary-color)";
    updateGraph();
}

function addTransition() {
    const from = transFrom.value.trim();
    const symbol = transSymbol.value.trim();
    const to = transTo.value.trim();

    if (!from || !symbol || !to) {
        alert("Please fill all transition fields.");
        return;
    }

    if (!states.includes(from)) {
        alert(`State '${from}' is not defined in the States list. Please define it first or ignore this warning.`);
    }

    const trans = { from, symbol, to };
    transitions.push(trans);

    renderTransitions();

    transFrom.value = '';
    transSymbol.value = '';
    transTo.value = '';
    transFrom.focus();
}

function renderTransitions() {
    transitionBody.innerHTML = '';
    transitions.forEach((t, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${t.from}</td>
            <td>${t.symbol}</td>
            <td>${t.to}</td>
            <td><button class="btn danger" style="padding: 5px 10px; font-size: 0.8rem;" onclick="removeTransition(${index})">Delete</button></td>
        `;
        transitionBody.appendChild(tr);
    });
    updateGraph();
}

window.removeTransition = function (index) {
    transitions.splice(index, 1);
    renderTransitions();
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

const graphPanel = document.getElementById('graph-panel');
const outputPanel = document.getElementById('output-panel');
let simulationAborted = false;

function enterFullscreen(panel) {
    // Add close button if not already present
    if (!panel.querySelector('.close-fullscreen-btn')) {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-fullscreen-btn';
        closeBtn.innerHTML = '✕';
        closeBtn.title = 'Exit fullscreen';
        closeBtn.addEventListener('click', () => {
            simulationAborted = true;
            exitFullscreen(panel);
        });
        panel.style.position = 'relative';
        panel.appendChild(closeBtn);
    }
    panel.classList.add('panel-fullscreen');
    // For cy graph, resize after going fullscreen
    if (cy && panel === graphPanel) {
        setTimeout(() => { cy.resize(); cy.fit(null, 30); }, 50);
    }
}

function exitFullscreen(panel) {
    panel.classList.remove('panel-fullscreen');
    const closeBtn = panel.querySelector('.close-fullscreen-btn');
    if (closeBtn) closeBtn.remove();
    // Restore cy size
    if (cy && panel === graphPanel) {
        setTimeout(() => { cy.resize(); cy.fit(null, 30); }, 50);
    }
}

async function runSimulation() {
    if (states.length === 0 || !startState) {
        alert("Please set the automata design first.");
        return;
    }

    const mode = modeSelect.value;
    const inputStr = inputStringEl.value.trim();
    simulationAborted = false;

    // Reset Trace UI
    traceContainer.innerHTML = '';
    finalResult.className = 'final-result hidden';

    // Disable buttons during simulation
    simulateBtn.disabled = true;
    simulateBtn.textContent = 'Simulating...';

    // ── Phase 1: Scroll to graph → fullscreen graph with animation ──
    graphPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    await sleep(400);
    enterFullscreen(graphPanel);
    await sleep(300);

    if (mode === 'DFA') {
        await simulateDFA(inputStr);
    } else {
        await simulateNFA(inputStr);
    }

    // ── Phase 2: Close graph fullscreen ──
    if (!simulationAborted) {
        await sleep(600);
        exitFullscreen(graphPanel);
        await sleep(300);

        // ── Phase 3: Output panel fullscreen → reveal trace steps ──
        enterFullscreen(outputPanel);
        await sleep(300);
        await revealTraceSteps();
    }

    simulateBtn.disabled = false;
    simulateBtn.textContent = 'Simulate';
}

async function revealTraceSteps() {
    const steps = traceContainer.querySelectorAll('.trace-step');
    for (let i = 0; i < steps.length; i++) {
        if (simulationAborted) return;
        steps[i].classList.remove('step-hidden');
        steps[i].classList.add('step-reveal');
        traceContainer.scrollTop = traceContainer.scrollHeight;
        await sleep(350);
    }
    // Show the final result after all steps are revealed
    finalResult.classList.remove('hidden');
    finalResult.style.animation = 'fadeIn 0.5s ease-in';
}

function addTraceStep(stepText) {
    const div = document.createElement('div');
    div.className = 'trace-step step-hidden';
    div.innerHTML = stepText;
    traceContainer.appendChild(div);
}

function showResult(isAccepted) {
    // Prepare result but keep it hidden until trace reveal
    finalResult.classList.remove('accepted', 'rejected');
    finalResult.classList.add('hidden');
    if (isAccepted) {
        finalResult.innerHTML = "Simulation Finished: <br/> <span>String ACCEPTED</span>";
        finalResult.classList.add('accepted');
    } else {
        finalResult.innerHTML = "Simulation Finished: <br/> <span>String REJECTED</span>";
        finalResult.classList.add('rejected');
    }
}

async function simulateDFA(inputStr) {
    if (cy) cy.elements().removeClass('active').removeClass('active-edge');

    let currentState = startState;
    addTraceStep(`[INITIAL] Start at State: <span class="current-states">${currentState}</span>`);
    if (cy) cy.$('#' + currentState).addClass('active');

    await sleep(800);

    let rejectedEarly = false;

    for (let i = 0; i < inputStr.length; i++) {
        const symbol = inputStr[i];

        if (cy) cy.elements().removeClass('active-edge');

        // Find transition
        const transIndex = transitions.findIndex(trans => trans.from === currentState && trans.symbol === symbol);
        const t = transitions[transIndex];

        if (!t) {
            addTraceStep(`Read <span class="symbol">'${symbol}'</span>: No valid transition from <span class="current-states">${currentState}</span>. Moving to Dead State.`);
            if (cy) cy.elements().removeClass('active');
            currentState = "DEAD";
            rejectedEarly = true;
            break;
        }

        currentState = t.to;
        addTraceStep(`Read <span class="symbol">'${symbol}'</span>: Transitioned to <span class="current-states">${currentState}</span>`);

        if (cy) {
            cy.elements().removeClass('active');
            cy.$('#e' + transIndex).addClass('active-edge');
            cy.$('#' + currentState).addClass('active');
        }
        await sleep(800);
    }

    if (cy) cy.elements().removeClass('active-edge');

    if (rejectedEarly) {
        showResult(false);
    } else {
        const isAccepted = acceptStates.includes(currentState);
        showResult(isAccepted);
    }
}

function getEpsilonClosure(stateSet) {
    const stack = [...stateSet];
    const closure = new Set(stateSet);

    while (stack.length > 0) {
        const current = stack.pop();
        // find epsilon transitions (symbol is empty string, 'e', or 'ε')
        const epsTransitions = transitions.filter(t => t.from === current && (t.symbol === '' || t.symbol.toLowerCase() === 'e' || t.symbol === 'ε'));

        for (const t of epsTransitions) {
            if (!closure.has(t.to)) {
                closure.add(t.to);
                stack.push(t.to);
            }
        }
    }
    return closure;
}

function highlightNFAStates(stateSet) {
    if (!cy) return;
    cy.elements().removeClass('active');
    stateSet.forEach(s => cy.$('#' + s).addClass('active'));
}

async function simulateNFA(inputStr) {
    if (cy) cy.elements().removeClass('active').removeClass('active-edge');

    let currentStates = new Set([startState]);

    // Initial epsilon closure
    let initialClosure = getEpsilonClosure(currentStates);
    if (initialClosure.size > currentStates.size) {
        addTraceStep(`[INITIAL] Start at State: <span class="current-states">${startState}</span>`);
        highlightNFAStates(currentStates);
        await sleep(800);

        currentStates = initialClosure;
        addTraceStep(`[ε-CLOSURE] Current States expanded to: <span class="current-states">{ ${Array.from(currentStates).join(', ')} }</span>`);
        highlightNFAStates(currentStates);
    } else {
        addTraceStep(`[INITIAL] Start at States: <span class="current-states">{ ${Array.from(currentStates).join(', ')} }</span>`);
        highlightNFAStates(currentStates);
    }

    await sleep(800);

    for (let i = 0; i < inputStr.length; i++) {
        const symbol = inputStr[i];
        let nextStates = new Set();
        let activeEdgeIndexes = [];

        for (const state of currentStates) {
            // Find all indices of matching transitions
            transitions.forEach((t, index) => {
                if (t.from === state && t.symbol === symbol) {
                    nextStates.add(t.to);
                    activeEdgeIndexes.push(index);
                }
            });
        }

        let closureNextStates = getEpsilonClosure(nextStates);

        if (closureNextStates.size === 0) {
            addTraceStep(`Read <span class="symbol">'${symbol}'</span>: No valid transitions. State set is Empty.`);
            if (cy) cy.elements().removeClass('active').removeClass('active-edge');
            currentStates = new Set();
            break;
        }

        currentStates = closureNextStates;
        addTraceStep(`Read <span class="symbol">'${symbol}'</span>: Current States are <span class="current-states">{ ${Array.from(currentStates).join(', ')} }</span>`);

        if (cy) {
            cy.elements().removeClass('active').removeClass('active-edge');
            activeEdgeIndexes.forEach(idx => cy.$('#e' + idx).addClass('active-edge'));
            highlightNFAStates(currentStates);
        }

        await sleep(800);
    }

    if (cy) cy.elements().removeClass('active-edge');

    // Check if any current state is an accept state
    const isAccepted = Array.from(currentStates).some(state => acceptStates.includes(state));
    showResult(isAccepted);
}

function resetSimulation() {
    traceContainer.innerHTML = '<p class="placeholder-text">Run simulation to see step-by-step trace here.</p>';
    finalResult.className = 'final-result hidden';
    simulationAborted = true;
    exitFullscreen(graphPanel);
    exitFullscreen(outputPanel);
    if (cy) {
        cy.elements().removeClass('active');
        cy.elements().removeClass('active-edge');
    }
}

function loadExample() {
    const ex = exampleSelect.value;

    if (ex === 'dfa1') {
        statesInput.value = "q0, q1, q2";
        startStateInput.value = "q0";
        acceptStatesInput.value = "q2";
        saveDesign();

        transitions = [
            { from: 'q0', symbol: 'a', to: 'q1' },
            { from: 'q0', symbol: 'b', to: 'q0' },
            { from: 'q1', symbol: 'a', to: 'q1' },
            { from: 'q1', symbol: 'b', to: 'q2' },
            { from: 'q2', symbol: 'a', to: 'q2' },
            { from: 'q2', symbol: 'b', to: 'q2' }
        ];
        renderTransitions();

        modeSelect.value = "DFA";
        inputStringEl.value = "ababa";
    } else if (ex === 'nfa1') {
        statesInput.value = "q0, q1, q2";
        startStateInput.value = "q0";
        acceptStatesInput.value = "q2";
        saveDesign();

        transitions = [
            { from: 'q0', symbol: '0', to: 'q0' },
            { from: 'q0', symbol: '1', to: 'q0' },
            { from: 'q0', symbol: '0', to: 'q1' },
            { from: 'q1', symbol: '1', to: 'q2' }
        ];
        renderTransitions();

        modeSelect.value = "NFA";
        inputStringEl.value = "1001";
    }

    resetSimulation();
}

// Start
init();
