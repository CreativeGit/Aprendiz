async function formSubmit () {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	const lang = document.getElementById('lang').value;
	console.log(lang);
	chrome.storage.sync.set({ lang });
	const port = chrome.tabs.sendMessage(tab.id, {
		lang,
		freq: 1
	});
}

{
	const lang = chrome.storage.sync.get(['lang'], res => {
		const { lang } = res;
		const select = document.getElementById('lang');
		for (let i = 0; i < select.options.length; i++) {
			if (select.options[i].value === lang) {
				select.selectedIndex = i;
				break;
			}
		}
		const form = document.getElementById('aprendiz-form');
		form.onsubmit = () => formSubmit();
	});
}