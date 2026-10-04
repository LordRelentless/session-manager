"use strict";

const version = chrome.runtime.getManifest().version;
const defaultOpen = JSON.stringify({
	add: "click",
	replace: "shift+click",
	new: "ctrl/cmd+click",
	incognito: "alt+click",
});

async function initialize() {
	const stored = await chrome.storage.local.get(null);
	const defaults = { sessions: "{}", pinned: "skip", open: defaultOpen };
	const values = {};

	Object.keys(defaults).forEach(function (key) {
		if (stored[key] === undefined) {
			values[key] = defaults[key];
		}
	});

	if (stored.version !== version) {
		values.version = version;
		values.readchanges = false;
	}

	if (Object.keys(values).length) {
		await chrome.storage.local.set(values);
	}
}

const initialized = initialize();

async function openSession(windowId, urls, event) {
	await initialized;
	const stored = await chrome.storage.local.get(["open", "noreplacingpinned"]);
	const open = JSON.parse(stored.open || defaultOpen);
	let action = event
		? (((event.ctrlKey || event.metaKey) && "ctrl/cmd+click") || (event.shiftKey && "shift+click") || (event.altKey && "alt+click") || "click")
		: open.add;

	for (const key in open) {
		if (action === open[key]) {
			action = key;
			break;
		}
	}

	if (action === "add") {
		await Promise.all(urls.map(function (url) {
			return chrome.tabs.create({ windowId: windowId, url: url });
		}));
	} else if (action === "replace") {
		if (windowId === undefined) {
			windowId = (await chrome.windows.getLastFocused()).id;
		}

		const tabs = await chrome.tabs.query({ windowId: windowId });
		await Promise.all(urls.map(function (url) {
			return chrome.tabs.create({ windowId: windowId, url: url });
		}));

		const toRemove = stored.noreplacingpinned
			? tabs.filter(function (tab) { return !tab.pinned; })
			: tabs;
		await Promise.all(toRemove.map(function (tab) {
			return chrome.tabs.remove(tab.id);
		}));
	} else if (action === "new" || action === "incognito") {
		await chrome.windows.create({ url: urls, incognito: action === "incognito" });
	} else {
		return false;
	}

	return true;
}

chrome.omnibox.onInputChanged.addListener(async function (text, suggest) {
	await initialized;
	const stored = await chrome.storage.local.get("sessions");
	const sessions = JSON.parse(stored.sessions || "{}");
	text = text.trim();
	const lowerText = text.toLowerCase();
	const suggestions = [];
	const indexes = {};

	if (text.length) {
		chrome.omnibox.setDefaultSuggestion({
			description: "Open <match>" + text + "</match>" + (sessions[text] ? "" : " ...") + " in this window",
		});

		Object.keys(sessions).forEach(function (name) {
			const index = name.toLowerCase().indexOf(lowerText);
			if (index !== -1) {
				const match = "<match>" + name.slice(index, index + text.length) + "</match>";
				suggestions.push({
					content: name,
					description: name.slice(0, index) + match + name.slice(index + text.length),
				});
				indexes[name] = index;
			}
		});

		suggestions.sort(function (a, b) {
			return indexes[a.content] === indexes[b.content]
				? (a.content.length === b.content.length ? 0 : a.content.length - b.content.length)
				: indexes[a.content] - indexes[b.content];
		});
		suggest(suggestions);
	} else {
		chrome.omnibox.setDefaultSuggestion({ description: "Open a session in this window" });
	}
});

chrome.omnibox.onInputEntered.addListener(async function (name) {
	await initialized;
	const stored = await chrome.storage.local.get("sessions");
	const sessions = JSON.parse(stored.sessions || "{}");
	if (sessions[name]) {
		await openSession(undefined, sessions[name]);
	}
});

chrome.omnibox.setDefaultSuggestion({ description: "Open a session in this window" });

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	if (message.type === "initialize-state") {
		initialized.then(function () { sendResponse({ ready: true }); });
		return true;
	}

	if (message.type === "open-session") {
		openSession(message.windowId, message.urls, message.event)
			.then(function (opened) { sendResponse({ opened: opened }); })
			.catch(function () { sendResponse({ opened: false }); });
		return true;
	}

	if (message.type === "analytics") {
		sendResponse({});
	}
});

chrome.runtime.onStartup.addListener(async function () {
	await initialized;
	const stored = await chrome.storage.local.get("temp");
	if (stored.temp) {
		await Promise.all(stored.temp.map(function (url) {
			return chrome.tabs.create({ url: url });
		}));
		await chrome.storage.local.remove("temp");
	}
});