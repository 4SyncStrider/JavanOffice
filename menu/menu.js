const gameLinks = document.querySelectorAll(".game-link");

gameLinks.forEach(link => {
	link.addEventListener("click", event => {
		if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
			event.preventDefault();
			window.location.href = link.href;
		}
	});
});