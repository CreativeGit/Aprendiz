const frequency = 1.5; // ranges from 0-1

chrome.runtime.onInstalled.addListener(() => {
	chrome.storage.sync.set({ frequency });
	console.log(`Default frequency set to: ${frequency}`);
	chrome.storage.sync.set({ lang: 'spanish' });
	console.log(`Default language set to: Spanish`);
});