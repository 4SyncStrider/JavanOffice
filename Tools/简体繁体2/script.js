/**
 * Simplified and Traditional Chinese conversion tool.
 *
 * This page uses the OpenCC conversion library to perform a practical, browser-
 * friendly conversion while clearly stating the output is suitable for everyday
 * use rather than a full linguistic guarantee for every edge-case phrase.
 */

import * as OpenCC from "../../node_modules/opencc-js/dist/esm/full.js";

const inputText = document.querySelector("#inputText");
const outputText = document.querySelector("#outputText");
const statusMessage = document.querySelector("#statusMessage");
const convertButtons = document.querySelectorAll(".convert-btn");
const clearButton = document.querySelector("#clearButton");
const copyButton = document.getElementById("copyButton");

console.log(copyButton);

function makeConverter(from, to) {
  return OpenCC.Converter({ from: from, to: to });
}

function convertText(direction) {
  const text = inputText.value;

  if (!text.trim()) {
    outputText.value = "";
    statusMessage.textContent = "Input is empty. Please type or paste some Chinese text first.";
    return;
  }

  try {
    const converter = direction === "s2t" ? makeConverter("cn", "tw") : makeConverter("tw", "cn");

    outputText.value = converter(text);
    statusMessage.textContent =
      direction === "s2t"
        ? "Converted Simplified Chinese to Traditional Chinese."
        : "Converted Traditional Chinese to Simplified Chinese.";
  } catch (error) {
    outputText.value = "";
    statusMessage.textContent = "Conversion failed. Please try a different text sample.";
    console.error(error);
  }
}

convertButtons.forEach((button) => {
  button.addEventListener("click", () => convertText(button.dataset.direction));
});

clearButton.addEventListener("click", () => {
  inputText.value = "";
  outputText.value = "";
  statusMessage.textContent = "Ready to convert text.";
  inputText.focus();
});

copyButton.addEventListener("click", async () => {
  const content = outputText.value.trim();

  try {
    await navigator.clipboard.writeText(content);
    statusMessage.textContent = "Converted text copied to clipboard.";
  } catch {
    statusMessage.textContent =
      "Clipboard access was unavailable. Please copy the output manually.";
  }
});
