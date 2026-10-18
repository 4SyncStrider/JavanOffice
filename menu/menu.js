/**
 * Shared menu behaviour for JavanOffice.
 *
 * The landing page uses anchor links for each game and tool shortcut. The
 * logic below keeps navigation predictable and prevents duplicate handling from
 * any extra click listeners that might be attached to the same element.
 */
const gameLinks = document.querySelectorAll(".game-link");

gameLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const isPlainPrimaryClick =
      event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

    if (isPlainPrimaryClick) {
      event.preventDefault();
      window.location.href = link.href;
    }
  });
});
