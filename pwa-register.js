if ("serviceWorker" in navigator && !import.meta.env.DEV) {
  window.addEventListener("load", () => {
    const manifestLink = document.querySelector('link[rel="manifest"]');
    const appRoot = new URL("./", manifestLink.href);
    const serviceWorkerUrl = new URL("service-worker.js", appRoot);

    navigator.serviceWorker
      .register(serviceWorkerUrl, { scope: appRoot.pathname })
      .catch((error) => {
        console.error("JavanOffice could not register its service worker:", error);
      });
  });
}
