const frequency = 1;
const lang = 'spanish';

chrome.runtime.onInstalled.addListener(() => {
	chrome.storage.sync.set({ frequency });
	console.log(`Default frequency set to: ${frequency}`);
	chrome.storage.sync.set({ lang });
	console.log(`Default language set to: ${lang}`);
});