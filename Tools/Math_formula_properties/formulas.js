import { MathUtils } from "./Math.js";

const formulaSelect = document.querySelector("#formulaSelect");
const formulaCategory = document.querySelector("#formulaCategory");
const formulaSearch = document.querySelector("#formulaSearch");
const formulaList = document.querySelector("#formulaList");
const formulaInputs = document.querySelector("#formulaInputs");
const formulaFormula = document.querySelector("#formulaFormula");
const formulaAnswer = document.querySelector("#formulaAnswer");
const formulaOverview = document.querySelector("#formulaOverview");

const definitions = {
  square: {
    category: "Geometry",
    label: "Square",
    description: "Find the area and perimeter of a square from one side length.",
    inputs: [{ name: "side", label: "Side length", placeholder: "e.g. 6" }],
    formula: "A = s², P = 4s",
    calculate: ({ side }) => {
      const s = Number(side);
      return {
        formula: "A = s² and P = 4s",
        result: `Area = ${formatNumber(MathUtils.areaOfSquare(s))} units² • Perimeter = ${formatNumber(MathUtils.perimeterOfSquare(s))} units`,
      };
    },
  },
  rectangle: {
    category: "Geometry",
    label: "Rectangle",
    description: "Calculate the area and perimeter of a rectangle.",
    inputs: [
      { name: "length", label: "Length", placeholder: "e.g. 8" },
      { name: "width", label: "Width", placeholder: "e.g. 5" },
    ],
    formula: "A = l × w, P = 2(l + w)",
    calculate: ({ length, width }) => {
      const l = Number(length);
      const w = Number(width);
      return {
        formula: "A = l × w and P = 2(l + w)",
        result: `Area = ${formatNumber(MathUtils.areaOfRectangle(l, w))} units² • Perimeter = ${formatNumber(MathUtils.perimeterOfRectangle(l, w))} units`,
      };
    },
  },
  triangleArea: {
    category: "Geometry",
    label: "Area of Triangle",
    description: "Use base-height to calculate the area of a triangle.",
    inputs: [
      { name: "base", label: "Base", placeholder: "e.g. 10" },
      { name: "height", label: "Height", placeholder: "e.g. 7" },
    ],
    formula: "A = ½bh",
    calculate: ({ base, height }) => {
      const b = Number(base);
      const h = Number(height);
      return {
        formula: "A = ½ × b × h",
        result: `Area = ${formatNumber(MathUtils.areaOfTriangle(b, h))} units²`,
      };
    },
  },
  trianglePerimeter: {
    category: "Geometry",
    label: "Perimeter of Triangle",
    description: "Add all three side lengths of a triangle.",
    inputs: [
      { name: "sideA", label: "Side a", placeholder: "e.g. 3" },
      { name: "sideB", label: "Side b", placeholder: "e.g. 4" },
      { name: "sideC", label: "Side c", placeholder: "e.g. 5" },
    ],
    formula: "P = a + b + c",
    calculate: ({ sideA, sideB, sideC }) => {
      return {
        formula: "P = a + b + c",
        result: `Perimeter = ${formatNumber(MathUtils.perimeterOfTriangle(Number(sideA), Number(sideB), Number(sideC)))} units`,
      };
    },
  },
  circle: {
    category: "Geometry",
    label: "Circle",
    description: "Calculate the area and circumference from the radius.",
    inputs: [{ name: "radius", label: "Radius", placeholder: "e.g. 5" }],
    formula: "A = πr², C = 2πr",
    calculate: ({ radius }) => {
      const r = Number(radius);
      return {
        formula: "A = πr² and C = 2πr",
        result: `Area = ${formatNumber(MathUtils.areaOfCircle(r))} units² • Circumference = ${formatNumber(MathUtils.circumferenceOfCircle(r))} units`,
      };
    },
  },
  cube: {
    category: "Geometry",
    label: "Cube",
    description: "Find the volume and surface area of a cube.",
    inputs: [{ name: "side", label: "Side length", placeholder: "e.g. 4" }],
    formula: "V = s³, SA = 6s²",
    calculate: ({ side }) => {
      const s = Number(side);
      return {
        formula: "V = s³ and SA = 6s²",
        result: `Volume = ${formatNumber(MathUtils.volumeOfCube(s))} units³ • Surface area = ${formatNumber(MathUtils.surfaceAreaOfCube(s))} units²`,
      };
    },
  },
  cuboid: {
    category: "Geometry",
    label: "Cuboid",
    description: "Compute the volume and total surface area of a cuboid.",
    inputs: [
      { name: "length", label: "Length", placeholder: "e.g. 6" },
      { name: "width", label: "Width", placeholder: "e.g. 4" },
      { name: "height", label: "Height", placeholder: "e.g. 3" },
    ],
    formula: "V = lwh, SA = 2(lw + lh + wh)",
    calculate: ({ length, width, height }) => {
      const l = Number(length);
      const w = Number(width);
      const h = Number(height);
      return {
        formula: "V = lwh and SA = 2(lw + lh + wh)",
        result: `Volume = ${formatNumber(MathUtils.volumeOfCuboid(l, w, h))} units³ • Surface area = ${formatNumber(MathUtils.surfaceAreaOfCuboid(l, w, h))} units²`,
      };
    },
  },
  sphere: {
    category: "Geometry",
    label: "Sphere",
    description: "Calculate the surface area and volume of a sphere.",
    inputs: [{ name: "radius", label: "Radius", placeholder: "e.g. 5" }],
    formula: "V = 4/3 πr³, SA = 4πr²",
    calculate: ({ radius }) => {
      const r = Number(radius);
      return {
        formula: "V = 4/3 πr³ and SA = 4πr²",
        result: `Volume = ${formatNumber(MathUtils.volumeOfSphere(r))} units³ • Surface area = ${formatNumber(MathUtils.surfaceAreaOfSphere(r))} units²`,
      };
    },
  },
  cylinder: {
    category: "Geometry",
    label: "Cylinder",
    description: "Use radius and height to find a cylinder's volume and area.",
    inputs: [
      { name: "radius", label: "Radius", placeholder: "e.g. 3" },
      { name: "height", label: "Height", placeholder: "e.g. 10" },
    ],
    formula: "V = πr²h, SA = 2πr(r + h)",
    calculate: ({ radius, height }) => {
      const r = Number(radius);
      const h = Number(height);
      return {
        formula: "V = πr²h and SA = 2πr(r + h)",
        result: `Volume = ${formatNumber(MathUtils.volumeOfCylinder(r, h))} units³ • Surface area = ${formatNumber(MathUtils.surfaceAreaOfCylinder(r, h))} units²`,
      };
    },
  },
  cone: {
    category: "Geometry",
    label: "Cone",
    description: "Find the volume and surface area of a cone from its radius and height.",
    inputs: [
      { name: "radius", label: "Radius", placeholder: "e.g. 3" },
      { name: "height", label: "Height", placeholder: "e.g. 4" },
    ],
    formula: "V = 1/3 πr²h, SA = πr(r + l)",
    calculate: ({ radius, height }) => {
      const r = Number(radius);
      const h = Number(height);
      return {
        formula: "V = 1/3 πr²h and SA = πr(r + l)",
        result: `Volume = ${formatNumber(MathUtils.volumeOfCone(r, h))} units³ • Slant height = ${formatNumber(MathUtils.slantHeightOfCone(r, h))} units • Surface area = ${formatNumber(MathUtils.surfaceAreaOfCone(r, h))} units²`,
      };
    },
  },
  quadratic: {
    category: "Algebra",
    label: "Quadratic Formula",
    description: "Solve ax² + bx + c = 0 using the quadratic formula.",
    inputs: [
      { name: "a", label: "a", placeholder: "e.g. 1" },
      { name: "b", label: "b", placeholder: "e.g. -3" },
      { name: "c", label: "c", placeholder: "e.g. 2" },
    ],
    formula: "x = (-b ± √(b² - 4ac)) / 2a",
    calculate: ({ a, b, c }) => {
      const rootValues = MathUtils.quadraticRoots(Number(a), Number(b), Number(c));
      if (!rootValues) {
        return {
          formula: "x = (-b ± √(b² - 4ac)) / 2a",
          result: "No real roots: discriminant is negative.",
        };
      }

      return {
        formula: "x = (-b ± √(b² - 4ac)) / 2a",
        result: `x₁ = ${formatNumber(rootValues[0])}; x₂ = ${formatNumber(rootValues[1])}`,
      };
    },
  },
  pythagoras: {
    category: "Algebra",
    label: "Pythagoras Theorem",
    description: "Find the hypotenuse of a right-angled triangle.",
    inputs: [
      { name: "a", label: "Side a", placeholder: "e.g. 3" },
      { name: "b", label: "Side b", placeholder: "e.g. 4" },
    ],
    formula: "c = √(a² + b²)",
    calculate: ({ a, b }) => {
      return {
        formula: "c = √(a² + b²)",
        result: `Hypotenuse = ${formatNumber(MathUtils.pythagoreanTheorem(Number(a), Number(b)))} units`,
      };
    },
  },
  simpleInterest: {
    category: "Finance",
    label: "Simple Interest",
    description: "Calculate the interest earned on a principal amount.",
    inputs: [
      { name: "principal", label: "Principal", placeholder: "e.g. 1000" },
      { name: "rate", label: "Rate (%)", placeholder: "e.g. 5" },
      { name: "time", label: "Time (years)", placeholder: "e.g. 2" },
    ],
    formula: "I = Prt / 100",
    calculate: ({ principal, rate, time }) => {
      return {
        formula: "I = Prt / 100",
        result: `Interest = ${formatNumber(MathUtils.simpleInterest(Number(principal), Number(rate), Number(time)))} units`,
      };
    },
  },
  compoundInterest: {
    category: "Finance",
    label: "Compound Interest",
    description: "Estimate the final amount when interest compounds over time.",
    inputs: [
      { name: "principal", label: "Principal", placeholder: "e.g. 1000" },
      { name: "rate", label: "Rate (%)", placeholder: "e.g. 4" },
      { name: "periods", label: "Compounds per year", placeholder: "e.g. 12" },
      { name: "years", label: "Years", placeholder: "e.g. 3" },
    ],
    formula: "A = P(1 + r/n)^(nt)",
    calculate: ({ principal, rate, periods, years }) => {
      return {
        formula: "A = P(1 + r/n)^(nt)",
        result: `Amount = ${formatNumber(MathUtils.compoundInterest(Number(principal), Number(rate), Number(periods), Number(years)))} units`,
      };
    },
  },
  arithmeticProgression: {
    category: "Algebra",
    label: "Arithmetic Progression",
    description: "Find the nth term in an arithmetic sequence.",
    inputs: [
      { name: "firstTerm", label: "First term", placeholder: "e.g. 2" },
      { name: "difference", label: "Common difference", placeholder: "e.g. 3" },
      { name: "n", label: "n-th term", placeholder: "e.g. 5" },
    ],
    formula: "Tₙ = a + (n - 1)d",
    calculate: ({ firstTerm, difference, n }) => {
      return {
        formula: "Tₙ = a + (n - 1)d",
        result: `Tₙ = ${formatNumber(MathUtils.arithmeticSequenceTerm(Number(firstTerm), Number(difference), Number(n)))}`,
      };
    },
  },
  geometricProgression: {
    category: "Algebra",
    label: "Geometric Progression",
    description: "Find the nth term in a geometric progression.",
    inputs: [
      { name: "firstTerm", label: "First term", placeholder: "e.g. 2" },
      { name: "ratio", label: "Common ratio", placeholder: "e.g. 3" },
      { name: "n", label: "n-th term", placeholder: "e.g. 4" },
    ],
    formula: "Tₙ = ar^(n - 1)",
    calculate: ({ firstTerm, ratio, n }) => {
      return {
        formula: "Tₙ = ar^(n - 1)",
        result: `Tₙ = ${formatNumber(MathUtils.geometricSequenceTerm(Number(firstTerm), Number(ratio), Number(n)))}`,
      };
    },
  },
  mean: {
    category: "Statistics",
    label: "Mean",
    description: "Find the arithmetic mean of a set of numbers.",
    inputs: [{ name: "numbers", label: "Numbers (comma separated)", placeholder: "e.g. 1, 2, 3, 4" }],
    formula: "Mean = sum / count",
    calculate: ({ numbers }) => {
      const values = numbers
        .split(",")
        .map((item) => Number(item.trim()))
        .filter((value) => Number.isFinite(value));

      if (values.length === 0) {
        throw new Error("No valid numbers provided");
      }

      return {
        formula: "Mean = sum / count",
        result: `Mean = ${formatNumber(MathUtils.mean(values))}`,
      };
    },
  },
  median: {
    category: "Statistics",
    label: "Median",
    description: "Calculate the median of a set of values.",
    inputs: [{ name: "numbers", label: "Numbers (comma separated)", placeholder: "e.g. 3, 6, 7, 10" }],
    formula: "Median = middle value(s)",
    calculate: ({ numbers }) => {
      const values = numbers
        .split(",")
        .map((item) => Number(item.trim()))
        .filter((value) => Number.isFinite(value));

      if (values.length === 0) {
        throw new Error("No valid numbers provided");
      }

      return {
        formula: "Median = middle value(s)",
        result: `Median = ${formatNumber(MathUtils.median(values))}`,
      };
    },
  },
};

const orderedCategories = ["Geometry", "Algebra", "Finance", "Statistics"];

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "Invalid";
  }

  const rounded = Number(Math.abs(value) < 1e-10 ? 0 : value).toFixed(8); 
  const string = Number(rounded).toString();
  return string === "-0" ? "0" : string;
}

function getVisibleDefinitions() {
  const searchText = formulaSearch.value.trim().toLowerCase();
  const category = formulaCategory.value;

  return Object.entries(definitions).filter(([key, definition]) => {
    const matchesCategory = category === "All" || definition.category === category;
    const matchesText =
      !searchText ||
      definition.label.toLowerCase().includes(searchText) ||
      definition.description.toLowerCase().includes(searchText) ||
      key.toLowerCase().includes(searchText);
    return matchesCategory && matchesText;
  });
}

function populateCategoryFilter() {
  const categories = ["All", ...orderedCategories];
  formulaCategory.innerHTML = categories
    .map((category) => `<option value="${category}">${category}</option>`)
    .join("");
}

function renderFormulaList() {
  const visibleDefinitions = getVisibleDefinitions();
  formulaList.innerHTML = "";

  if (visibleDefinitions.length === 0) {
    formulaList.innerHTML = '<div class="empty-state">No formulas match your search.</div>';
    return;
  }

  visibleDefinitions.forEach(([key, definition]) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "formula-card";
    card.innerHTML = `
      <span class="formula-category">${definition.category}</span>
      <strong>${definition.label}</strong>
      <small>${definition.description}</small>
    `;
    card.addEventListener("click", () => {
      formulaSelect.value = key;
      renderFormulaInputs();
    });
    formulaList.appendChild(card);
  });
}

function populateFormulaSelect() {
  const visibleDefinitions = getVisibleDefinitions();
  formulaSelect.innerHTML = visibleDefinitions
    .map(([key, definition]) => `<option value="${key}">${definition.label}</option>`)
    .join("");

  if (!visibleDefinitions.some(([key]) => key === formulaSelect.value)) {
    formulaSelect.value = visibleDefinitions[0]?.[0] ?? "square";
  }
}

function renderFormulaInputs() {
  const key = formulaSelect.value;
  const definition = definitions[key];

  if (!definition) {
    return;
  }

  formulaOverview.innerHTML = `
    <p class="eyebrow">${definition.category}</p>
    <h2>${definition.label}</h2>
    <p>${definition.description}</p>
  `;

  formulaInputs.innerHTML = "";

  definition.inputs.forEach((field) => {
    const label = document.createElement("label");
    label.className = "field-group";

    const text = document.createElement("span");
    text.textContent = field.label;

    const input = document.createElement("input");
    input.type = "text";
    input.name = field.name;
    input.placeholder = field.placeholder || "";
    input.setAttribute("aria-label", field.label);
    input.addEventListener("input", () => updateFormulaResult());

    label.append(text, input);
    formulaInputs.appendChild(label);
  });

  const actions = document.createElement("div");
  actions.className = "action-row";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "calculate-formula-button";
  button.textContent = "Calculate";
  button.addEventListener("click", updateFormulaResult);

  const reset = document.createElement("button");
  reset.type = "button";
  reset.className = "secondary-button";
  reset.textContent = "Reset";
  reset.addEventListener("click", () => {
    [...formulaInputs.querySelectorAll("input")].forEach((input) => {
      input.value = "";
    });
    updateFormulaResult();
  });

  actions.append(button, reset);
  formulaInputs.appendChild(actions);

  formulaFormula.textContent = definition.formula;
  formulaAnswer.textContent = "Enter values to calculate.";
}

function updateFormulaResult() {
  const key = formulaSelect.value;
  const definition = definitions[key];
  if (!definition) {
    return;
  }

  const values = {};
  [...formulaInputs.querySelectorAll("input")].forEach((input) => {
    values[input.name] = input.value.trim();
  });

  const allEmpty = Object.values(values).every((value) => value === "");
  if (allEmpty) {
    formulaFormula.textContent = definition.formula;
    formulaAnswer.textContent = "Enter values to calculate.";
    return;
  }

  const invalid = Object.entries(values).some(([, value]) => {
    if (value === "") {
      return true;
    }

    const numeric = Number(value);
    return !Number.isFinite(numeric) || numeric < 0;
  });

  if (invalid) {
    formulaFormula.textContent = definition.formula;
    formulaAnswer.textContent = "Please enter valid non-negative numbers.";
    return;
  }

  try {
    const result = definition.calculate(values);
    formulaFormula.textContent = result.formula;
    formulaAnswer.textContent = result.result;
  } catch {
    formulaFormula.textContent = definition.formula;
    formulaAnswer.textContent = "The values provided do not support this calculation.";
  }
}

formulaSelect.addEventListener("change", () => {
  renderFormulaInputs();
  renderFormulaList();
});

formulaCategory.addEventListener("change", () => {
  populateFormulaSelect();
  renderFormulaList();
  const firstVisible = formulaSelect.value;
  if (firstVisible) {
    renderFormulaInputs();
  }
});

formulaSearch.addEventListener("input", () => {
  populateFormulaSelect();
  renderFormulaList();
  const firstVisible = formulaSelect.value;
  if (firstVisible) {
    renderFormulaInputs();
  }
});

populateCategoryFilter();
populateFormulaSelect();
renderFormulaList();
renderFormulaInputs();
