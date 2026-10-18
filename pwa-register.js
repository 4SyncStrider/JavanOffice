if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const appRoot = new URL("./", import.meta.url);
    const serviceWorkerUrl = new URL("service-worker.js", appRoot);

    navigator.serviceWorker
      .register(serviceWorkerUrl, { scope: appRoot.pathname })
      .catch((error) => {
        console.error("JavanOffice could not register its service worker:", error);
      });
  });
}
