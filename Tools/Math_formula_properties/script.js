/**
 * Calculator and formula tool for JavanOffice.
 *
 * The calculator uses a small safe parser instead of eval(), and the formula
 * section keeps common shape calculations in a single configuration object so it
 * is easy to extend with more geometry later.
 */
const display = document.querySelector("#calcDisplay");
const calcButtons = document.querySelectorAll("[data-action]");
const shapeSelect = document.querySelector("#shapeSelect");
const formulaInputs = document.querySelector("#formulaInputs");
const formulaFormula = document.querySelector("#formulaFormula");
const formulaAnswer = document.querySelector("#formulaAnswer");

let calculatorValue = "";

const shapeDefinitions = {
  square: {
    label: "Square",
    inputs: [{ name: "side", label: "Side length", placeholder: "e.g. 4" }],
    calculate: ({ side }) => {
      const s = Number(side);
      return {
        formula: "A = s² and P = 4s",
        result: `Area = ${formatNumber(s * s)} units²; Perimeter = ${formatNumber(4 * s)} units.`,
      };
    },
  },
  rectangle: {
    label: "Rectangle",
    inputs: [
      { name: "length", label: "Length", placeholder: "e.g. 6" },
      { name: "width", label: "Width", placeholder: "e.g. 3" },
    ],
    calculate: ({ length, width }) => {
      const l = Number(length);
      const w = Number(width);
      return {
        formula: "A = l × w and P = 2(l + w)",
        result: `Area = ${formatNumber(l * w)} units²; Perimeter = ${formatNumber(2 * (l + w))} units.`,
      };
    },
  },
  triangle: {
    label: "Triangle",
    inputs: [
      { name: "side1", label: "Side 1", placeholder: "e.g. 3" },
      { name: "side2", label: "Side 2", placeholder: "e.g. 4" },
      { name: "side3", label: "Side 3", placeholder: "e.g. 5" },
    ],
    calculate: ({ side1, side2, side3 }) => {
      const a = Number(side1);
      const b = Number(side2);
      const c = Number(side3);
      const s = (a + b + c) / 2;
      const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
      return {
        formula: "A = √(s(s-a)(s-b)(s-c)) and P = a + b + c",
        result: `Area = ${formatNumber(area)} units²; Perimeter = ${formatNumber(a + b + c)} units.`,
      };
    },
  },
  circle: {
    label: "Circle",
    inputs: [{ name: "radius", label: "Radius", placeholder: "e.g. 5" }],
    calculate: ({ radius }) => {
      const r = Number(radius);
      return {
        formula: "A = πr² and C = 2πr",
        result: `Area = ${formatNumber(Math.PI * r * r)} units²; Circumference = ${formatNumber(2 * Math.PI * r)} units.`,
      };
    },
  },
  cube: {
    label: "Cube",
    inputs: [{ name: "side", label: "Side length", placeholder: "e.g. 3" }],
    calculate: ({ side }) => {
      const s = Number(side);
      return {
        formula: "V = s³ and A = 6s²",
        result: `Volume = ${formatNumber(Math.pow(s, 3))} units³; Surface area = ${formatNumber(6 * Math.pow(s, 2))} units².`,
      };
    },
  },
  cuboid: {
    label: "Cuboid",
    inputs: [
      { name: "length", label: "Length", placeholder: "e.g. 4" },
      { name: "width", label: "Width", placeholder: "e.g. 3" },
      { name: "height", label: "Height", placeholder: "e.g. 2" },
    ],
    calculate: ({ length, width, height }) => {
      const l = Number(length);
      const w = Number(width);
      const h = Number(height);
      return {
        formula: "V = l × w × h and A = 2(lw + lh + wh)",
        result: `Volume = ${formatNumber(l * w * h)} units³; Surface area = ${formatNumber(2 * (l * w + l * h + w * h))} units².`,
      };
    },
  },
  sphere: {
    label: "Sphere",
    inputs: [{ name: "radius", label: "Radius", placeholder: "e.g. 5" }],
    calculate: ({ radius }) => {
      const r = Number(radius);
      return {
        formula: "V = 4/3 πr³ and A = 4πr²",
        result: `Volume = ${formatNumber((4 / 3) * Math.PI * Math.pow(r, 3))} units³; Surface area = ${formatNumber(4 * Math.PI * Math.pow(r, 2))} units².`,
      };
    },
  },
  cylinder: {
    label: "Cylinder",
    inputs: [
      { name: "radius", label: "Radius", placeholder: "e.g. 3" },
      { name: "height", label: "Height", placeholder: "e.g. 5" },
    ],
    calculate: ({ radius, height }) => {
      const r = Number(radius);
      const h = Number(height);
      return {
        formula: "V = πr²h and A = 2πr(h + r)",
        result: `Volume = ${formatNumber(Math.PI * Math.pow(r, 2) * h)} units³; Surface area = ${formatNumber(2 * Math.PI * r * (h + r))} units².`,
      };
    },
  },
  cone: {
    label: "Cone",
    inputs: [
      { name: "radius", label: "Radius", placeholder: "e.g. 3" },
      { name: "height", label: "Height", placeholder: "e.g. 4" },
    ],
    calculate: ({ radius, height }) => {
      const r = Number(radius);
      const h = Number(height);
      const slant = Math.sqrt(Math.pow(r, 2) + Math.pow(h, 2));
      return {
        formula: "V = 1/3 πr²h, A = πr(r + l), and l = √(r² + h²)",
        result: `Volume = ${formatNumber((1 / 3) * Math.PI * Math.pow(r, 2) * h)} units³; Slant height = ${formatNumber(slant)} units; Surface area = ${formatNumber(Math.PI * r * (r + slant))} units².`,
      };
    },
  },
};

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "Invalid";
  }

  const fixed = Number(Math.abs(value) < 1e-10 ? 0 : value).toFixed(8);
  const string = Number(fixed).toString();
  return string === "-0" ? "0" : string;
}

function flushDisplay() {
  display.textContent = calculatorValue || "0";
}

calcButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;
    const value = button.dataset.value || "";

    if (action === "clear") {
      calculatorValue = "";
      flushDisplay();
      return;
    }

    if (action === "delete") {
      calculatorValue = calculatorValue.slice(0, -1);
      flushDisplay();
      return;
    }

    if (action === "equals") {
      try {
        const result = evaluateExpression(calculatorValue);
        calculatorValue = String(result);
      } catch {
        calculatorValue = "Error";
      }
      flushDisplay();
      return;
    }

    if (action === "digit") {
      if (calculatorValue === "Error") {
        calculatorValue = "";
      }
      calculatorValue += value;
      flushDisplay();
      return;
    }

    if (action === "operator") {
      if (calculatorValue === "Error") {
        calculatorValue = "";
      }
      if (!calculatorValue) {
        if (value === "-") calculatorValue = "-";
        flushDisplay();
        return;
      }
      const last = calculatorValue.slice(-1);
      if (/[+\-*\/]/.test(last)) {
        calculatorValue = calculatorValue.slice(0, -1) + value;
      } else {
        calculatorValue += value;
      }
      flushDisplay();
      return;
    }

    if (action === "parentheses") {
      if (calculatorValue === "Error") calculatorValue = "";
      calculatorValue += value;
      flushDisplay();
      return;
    }

    if (action === "percent") {
      if (calculatorValue === "Error") calculatorValue = "";
      if (!calculatorValue || /[+\-*/(]$/.test(calculatorValue)) {
        calculatorValue += "0%";
      } else {
        calculatorValue += "%";
      }
      flushDisplay();
    }
  });
});

function isDigit(char) {
  return /[0-9.]/.test(char);
}

function tokenizeExpression(expression) {
  const tokens = [];
  let index = 0;

  while (index < expression.length) {
    const char = expression[index];
    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    if (isDigit(char)) {
      let numberText = "";
      while (index < expression.length && /[0-9.]/.test(expression[index])) {
        numberText += expression[index];
        index += 1;
      }
      if (numberText.split(".").length > 2) {
        throw new Error("Malformed number");
      }
      tokens.push({ type: "number", value: Number(numberText) });
      continue;
    }

    if (/[+\-*/()%]/.test(char)) {
      tokens.push({ type: char, value: char });
      index += 1;
      continue;
    }

    throw new Error("Invalid character");
  }

  return tokens;
}

function evaluateExpression(expression) {
  const sanitized = expression.trim();
  if (!sanitized) return 0;
  if (!/^[0-9+\-*/().%\s]+$/.test(sanitized)) {
    throw new Error("Invalid input");
  }

  const tokens = tokenizeExpression(sanitized);
  let position = 0;

  function peek() {
    return tokens[position];
  }

  function consume(type) {
    const token = peek();
    if (!token || token.type !== type) {
      throw new Error("Unexpected token");
    }
    position += 1;
    return token.value;
  }

  function parsePrimary() {
    const token = peek();
    if (!token) {
      throw new Error("Missing value");
    }

    if (token.type === "number") {
      position += 1;
      return token.value;
    }

    if (token.type === "(") {
      consume("(");
      const value = parseAddSubtract();
      consume(")");
      return value;
    }

    if (token.type === "-") {
      consume("-");
      return -parsePrimary();
    }

    if (token.type === "+") {
      consume("+");
      return parsePrimary();
    }

    throw new Error("Expected a number or parenthesis");
  }

  function parseMultiplyDivide() {
    let value = parsePrimary();

    while (peek() && (peek().type === "*" || peek().type === "/" || peek().type === "%")) {
      const operator = peek().type;
      position += 1;

      const next = parsePrimary();
      if (operator === "*") value *= next;
      if (operator === "/") {
        if (next === 0) throw new Error("Division by zero");
        value /= next;
      }
      if (operator === "%") {
        value = (value / 100) * next;
      }
    }

    return value;
  }

  function parseAddSubtract() {
    let value = parseMultiplyDivide();

    while (peek() && (peek().type === "+" || peek().type === "-")) {
      const operator = peek().type;
      position += 1;
      const nextValue = parseMultiplyDivide();
      value = operator === "+" ? value + nextValue : value - nextValue;
    }

    return value;
  }

  const result = parseAddSubtract();
  if (position !== tokens.length) {
    throw new Error("Extra tokens remain");
  }

  return result;
}

function renderFormulaInputs() {
  const key = shapeSelect.value;
  const definition = shapeDefinitions[key];

  formulaInputs.innerHTML = "";

  definition.inputs.forEach((field) => {
    const label = document.createElement("label");
    label.textContent = field.label;

    const input = document.createElement("input");
    input.type = "number";
    input.step = "any";
    input.name = field.name;
    input.placeholder = field.placeholder;
    input.addEventListener("input", () => {
      const numbers = [...formulaInputs.querySelectorAll("input")].map((element) =>
        Number(element.value)
      );
      if (numbers.some((value) => value !== 0 && !Number.isFinite(value))) {
        return;
      }
      updateFormulaResult();
    });

    label.appendChild(input);
    formulaInputs.appendChild(label);
  });

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Calculate";
  button.className = "calculate-formula-button";
  button.addEventListener("click", updateFormulaResult);
  formulaInputs.appendChild(button);

  updateFormulaResult();
}

function updateFormulaResult() {
  const key = shapeSelect.value;
  const definition = shapeDefinitions[key];
  const values = {};

  [...formulaInputs.querySelectorAll("input")].forEach((input) => {
    values[input.name] = input.value;
  });

  const allEmpty = Object.values(values).every((value) => value === "" || value === null);
  if (allEmpty) {
    formulaFormula.textContent = definition.label;
    formulaAnswer.textContent = "Choose a shape to begin.";
    return;
  }

  const invalid = Object.entries(values).some(([name, value]) => {
    if (value === "" || value === null) return true;
    const numeric = Number(value);
    return !Number.isFinite(numeric) || numeric < 0;
  });

  if (invalid) {
    formulaFormula.textContent = definition.label;
    formulaAnswer.textContent = "Please enter valid, non-negative numbers.";
    return;
  }

  try {
    const result = definition.calculate(values);
    formulaFormula.textContent = result.formula;
    formulaAnswer.textContent = result.result;
  } catch {
    formulaFormula.textContent = definition.label;
    formulaAnswer.textContent = "The values provided do not support this calculation.";
  }
}

shapeSelect.addEventListener("change", renderFormulaInputs);
renderFormulaInputs();
