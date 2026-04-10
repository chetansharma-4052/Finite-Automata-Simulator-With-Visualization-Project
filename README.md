# Finite-Automata-Simulator-With-Visualization-Project
Finite Automata Simulator
A fully functional, interactive frontend web application for simulating Finite Automata (DFA & NFA). This project is built completely with vanilla front-end technologies and helps users visually understand how deterministic and non-deterministic finite automata process input strings step-by-step.

Features
Automata Design Engine: Easily define your automaton using a simple form-based UI to declare your states, start state, and accept states.
Dynamic Transition Rules: Add multiple transitions and preview them in a structured table.
Visual Graph Rendering: Uses Cytoscape.js to automatically draw and layout your automata directly in the browser.
Step-By-Step Simulation: Animate the processing of input strings with a timed visual trace. The active states are highlighted in bright pink in real-time, on both the text trace and the graph visualization!
NFA Epsilon Support: Epsilon-closures (denoted by 'e', 'ε', or an empty string) are fully supported during non-deterministic simulations.
Preloaded Examples: Quick-load buttons drop in ready-to-test examples for both DFA and NFA scenarios.
Technologies Used
HTML5 & CSS3: For a modern, responsive user interface with soft accents and hover animations.
Vanilla JavaScript: Powers the simulation engine, UI interactions, and graph synchronization—all without a backend.
Cytoscape.js: A powerful, open-source graph theory library utilized via CDN to visually map the states (nodes) and transitions (edges).
How to Run
Because this project uses strictly frontend static files, there's no need to install NodeJS, Python servers, or any complex backend infrastructure.

Download or clone this repository to your local machine.
Open the finite-automata-simulator folder.
Simply double-click on index.html to open it in Google Chrome, Firefox, or any modern web browser.
Note for VS Code Users: You do not need to use the "Live Server" extension or launch a localhost server port in your launch.json. Opening the local file path directly will work perfectly!

Usage Guide
Design Panel:

Enter your state names separated by commas (e.g., q0, q1, q2).
Define which state is the Start State.
Define which states are Accept States (comma-separated).
Click "Set Design".
Transitions:

Provide the "From State", "Input Symbol", and "To State".
Click "Add" to save the transition rule.
You can repeat this step to map out your entire automaton.
Simulation:

Select your mode: DFA or NFA.
Enter an input string to test (e.g., ababa).
Click Simulate. Watch the visual graph layout and the output trace walk through each character of your input string step-by-step until it determines if the string is Accepted or Rejected.
Built-In Examples
For quick testing, the app includes two built-in examples that can be selected from the dropdown:

DFA: Language containing 'ab' - A deterministic automaton that loops until it encounters the substring ab and stays in an accepting state.
NFA: Language ending with '01' - A non-deterministic automaton that branches on 0 and 1.
