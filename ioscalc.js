// ioscalc.js
document.addEventListener("DOMContentLoaded", () => {
  const output = document.getElementById("calc-output");
  const history = document.getElementById("calc-history");
  const keys = document.getElementById("keys");

  let expression = ""; 
  let lastResult = null;

  // Update the display safely
  function updateDisplay() {
    if (!expression) {
      output.textContent = "0";
      output.style.fontSize = "2.5rem";
      return;
    }

    if (!isNaN(Number(expression))) {
      if (expression.length > 14) {
        output.textContent = Number(expression).toExponential(6);
        output.style.fontSize = "2rem";
        return;
      }
    }

    if (expression.length <= 10) {
      output.style.fontSize = "2.5rem";
    } else if (expression.length <= 14) {
      output.style.fontSize = "2rem";
    } else {
      output.style.fontSize = "1.5rem";
    }

    output.textContent = expression;
  }

  function clearAll() {
    expression = "";
    history.textContent = "";
    updateDisplay();
  }

  function evaluateExpression() {
    try {
      const safeExpr = expression
        .replace(/÷/g, "/")
        .replace(/×/g, "*")
        .replace(/−/g, "-");

      if (!/^[0-9+\-*/().%\s]+$/.test(safeExpr)) throw new Error("Invalid");

      const result = Function(`"use strict"; return (${safeExpr})`)();

      if (result === undefined || isNaN(result)) throw new Error("Invalid");

      history.textContent = expression + " =";
      expression = result.toString();

      if (expression.length > 14) {
        expression = Number(result).toExponential(6).toString();
      }

      updateDisplay();
    } catch (err) {
      output.textContent = "Syntax Error";
    }
  }

  // Button click handler
  keys.addEventListener("click", (e) => {
    const key = e.target;
    const action = key.dataset.action;

    if (!action) return;

    switch (action) {
      case "digit":
        expression += key.dataset.key;
        updateDisplay();
        break;

      case "decimal":
        expression += ".";
        updateDisplay();
        break;

      case "operator":
        expression += key.textContent;
        updateDisplay();
        break;

      case "clear":
        clearAll();
        break;

      case "invert":
        if (expression) {
          try {
            const safeExpr = expression
              .replace(/÷/g, "/")
              .replace(/×/g, "*")
              .replace(/−/g, "-");
            const currentVal = Function(`"use strict"; return (${safeExpr})`)();
            expression = (-currentVal).toString();
            updateDisplay();
          } catch {
            output.textContent = "Syntax Error";
          }
        }
        break;

      case "percent":
        if (expression) {
          try {
            const safeExpr = expression
              .replace(/÷/g, "/")
              .replace(/×/g, "*")
              .replace(/−/g, "-");
            const currentVal = Function(`"use strict"; return (${safeExpr})`)();
            expression = (currentVal / 100).toString();
            updateDisplay();
          } catch {
            output.textContent = "Syntax Error";
          }
        }
        break;

      case "equals":
        evaluateExpression();
        break;

      case "delete":
        expression = expression.slice(0, -1);
        updateDisplay();
        break;
    }
  });

  // ======= KEYBOARD SUPPORT =======
  document.addEventListener("keydown", (e) => {
    const key = e.key;

    // Numbers
    if (/\d/.test(key)) {
      expression += key;
      updateDisplay();
      return;
    }

    // Operators
    const symbolMap = { "+": "+", "-": "−", "*": "×", "/": "÷" };
    if (symbolMap[key]) {
      expression += symbolMap[key];
      updateDisplay();
      return;
    }

    // Enter or "=" evaluates
    if (key === "Enter" || key === "=") {
      evaluateExpression();
      return;
    }

    // Backspace deletes last character
    if (key === "Backspace") {
      expression = expression.slice(0, -1);
      updateDisplay();
      return;
    }

    // Escape clears everything
    if (key === "Escape") {
      clearAll();
      return;
    }

    // Percent
    if (key === "%") {
      if (expression) {
        try {
          const safeExpr = expression
            .replace(/÷/g, "/")
            .replace(/×/g, "*")
            .replace(/−/g, "-");
          const currentVal = Function(`"use strict"; return (${safeExpr})`)();
          expression = (currentVal / 100).toString();
          updateDisplay();
        } catch {
          output.textContent = "Syntax Error";
        }
      }
      return;
    }

    // Decimal point
    if (key === ".") {
      expression += ".";
      updateDisplay();
      return;
    }

    // Invert (±) using 'i' key
    if (key.toLowerCase() === "i") {
      if (expression) {
        try {
          const safeExpr = expression
            .replace(/÷/g, "/")
            .replace(/×/g, "*")
            .replace(/−/g, "-");
          const currentVal = Function(`"use strict"; return (${safeExpr})`)();
          expression = (-currentVal).toString();
          updateDisplay();
        } catch {
          output.textContent = "Syntax Error";
        }
      }
      return;
    }
  });
  // ===============================

  clearAll();
});
