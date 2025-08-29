// =============================
// iOS Calculator - Extended Logic with Operator Highlight
// =============================

// Select DOM elements
const output = document.getElementById("calc-output");
const history = document.getElementById("calc-history");
const keys = document.getElementById("keys");

// Calculator state
let currentValue = "0";
let previousValue = null;
let operator = null;
let resetNext = false;

// Helper: format a numeric string for the screen (switch to scientific when needed)
function formatNumberForDisplay(value) {
  if (value === "Error") return "Error";
  const num = Number(value);
  if (!isFinite(num)) return "Error";

  const abs = Math.abs(num);

  // Use exponential for very large or very small numbers
  if ((abs !== 0 && (abs >= 1e10 || abs < 1e-9))) {
    // Use a compact exponential (adjust precision if you like)
    return num.toExponential(6);
  }

  // Normal display: try to fit within 10 characters
  let s = num.toString();

  if (s.length <= 10) return s;

  // If there's a decimal, trim fractional digits to fit
  if (s.includes(".")) {
    const signLen = num < 0 ? 1 : 0;
    const intLen = Math.trunc(abs).toString().length;
    const allowedDecimals = Math.max(0, 10 - intLen - signLen - 1); // -1 for the dot
    const fixed = num.toFixed(allowedDecimals);
    return fixed.replace(/\.?0+$/, ""); // remove trailing zeros and optional dot
  }

  // Fallback to exponential if integer is too long
  return num.toExponential(6);
}

// Replacement updateDisplay() — uses your existing `output`, `currentValue`, `resetNext`
function updateDisplay() {
  // Handle explicit Error state
  if (currentValue === "Error") {
    output.textContent = "Error";
    return;
  }

  // If user is actively typing a number (not a computed result),
  // preserve exact input (including trailing dot) but cap length to 10 chars.
  if (!resetNext) {
    output.textContent = currentValue.length <= 10 ? currentValue : currentValue.slice(0, 10);
    return;
  }

  // For computed results, format numerically (handles long numbers -> scientific)
  output.textContent = formatNumberForDisplay(currentValue);
}


// Update history line
function updateHistory() {
  if (previousValue !== null && operator) {
    const symbolMap = {
      add: "+",
      subtract: "−",
      multiply: "×",
      divide: "÷",
    };
    history.textContent = `${previousValue} ${symbolMap[operator]}`;
  } else {
    history.textContent = "";
  }
}

// Clear all (AC)
function clearAll() {
  currentValue = "0";
  previousValue = null;
  operator = null;
  resetNext = false;
  clearOperatorHighlight();
  updateDisplay();
  updateHistory();
}

// Perform calculation
function calculate(a, b, op) {
  const x = parseFloat(a);
  const y = parseFloat(b);

  switch (op) {
    case "add":
      return (x + y).toString();
    case "subtract":
      return (x - y).toString();
    case "multiply":
      return (x * y).toString();
    case "divide":
      return y === 0 ? "Error" : (x / y).toString();
    default:
      return b;
  }
}

// Highlight the active operator button
function highlightOperator(opKey) {
  clearOperatorHighlight();
  const button = keys.querySelector(`[data-operator="${opKey}"]`);
  if (button) button.classList.add("active-operator");
}

// Clear operator highlights
function clearOperatorHighlight() {
  keys.querySelectorAll(".key--op").forEach(btn => btn.classList.remove("active-operator"));
}

// Handle button clicks
keys.addEventListener("click", (event) => {
  if (!event.target.matches("button")) return; // Only buttons

  const key = event.target;
  const action = key.dataset.action;
  const keyValue = key.dataset.key;

  if (action === "digit") {
    if (currentValue === "0" || resetNext) {
      currentValue = keyValue;
      resetNext = false;
    } else {
      currentValue += keyValue;
    }
    updateDisplay();
    clearOperatorHighlight(); // remove highlight after digit input
  }

  if (action === "decimal") {
    if (resetNext) {
      currentValue = "0.";
      resetNext = false;
    } else if (!currentValue.includes(".")) {
      currentValue += ".";
    }
    updateDisplay();
  }

  if (action === "operator") {
    if (previousValue !== null && operator && !resetNext) {
      currentValue = calculate(previousValue, currentValue, operator);
      updateDisplay();
    }
    previousValue = currentValue;
    operator = key.dataset.operator;
    resetNext = true;
    updateHistory();
    highlightOperator(operator);
  }

  if (action === "equals") {
    if (previousValue !== null && operator) {
      currentValue = calculate(previousValue, currentValue, operator);
      updateDisplay();
      previousValue = null;
      operator = null;
      resetNext = true;
      updateHistory();
      clearOperatorHighlight();
    }
  }

  if (action === "clear") {
    clearAll();
  }

  if (action === "invert") {
    if (currentValue !== "0" && currentValue !== "Error") {
      if (currentValue.startsWith("-")) {
        currentValue = currentValue.slice(1);
      } else {
        currentValue = "-" + currentValue;
      }
      updateDisplay();
    }
  }

  if (action === "percent") {
    if (currentValue !== "Error") {
      currentValue = (parseFloat(currentValue) / 100).toString();
      updateDisplay();
    }
  }
});

// Initialize
updateDisplay();
updateHistory();
