import { MathUtils } from "./Math.js";

const shapeSelect = document.querySelector("#shapeSelect");
const formulaInputs = document.querySelector("#formulaInputs");
const formulaFormula = document.querySelector("#formulaFormula");
const formulaAnswer = document.querySelector("#formulaAnswer");

const definitions = {
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

function renderFormulaInputs() {
  const key = shapeSelect.value;
  const definition = definitions[key];

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
  const definition = definitions[key];
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
