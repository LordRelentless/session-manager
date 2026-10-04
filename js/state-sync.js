(function (global) {
	var keys = ["sessions", "temp", "pinned", "open", "noreplacingpinned", "readchanges"];
	var manifest = chrome.runtime.getManifest();
	var useChromeStorage = manifest.manifest_version === 3 && !manifest.browser_specific_settings;
	var defaults = {
		sessions: "{}",
		pinned: "skip",
		open: JSON.stringify({
			add: "click",
			replace: "shift+click",
			new: "ctrl/cmd+click",
			incognito: "alt+click",
		}),
	};

	function applyDefaults() {
		Object.keys(defaults).forEach(function (key) {
			localStorage[key] = localStorage[key] || defaults[key];
		});
	}

	function initialize(callback) {
		if (!useChromeStorage) {
			applyDefaults();
			callback();
			return;
		}

		chrome.runtime.sendMessage({ type: "initialize-state" }, function () {
			chrome.storage.local.get(null, function (stored) {
			if (stored.migrated) {
				keys.forEach(function (key) {
					if (stored[key] === undefined || stored[key] === null) {
						delete localStorage[key];
					} else {
						localStorage[key] = stored[key];
					}
				});
				applyDefaults();
				callback();
				return;
			}

			applyDefaults();
			var state = { migrated: true };
			keys.forEach(function (key) {
				if (localStorage[key] !== undefined) {
					state[key] = localStorage[key];
				}
			});
			chrome.storage.local.set(state, callback);
			});
		});
	}

	function save(state) {
		if (useChromeStorage) {
			chrome.storage.local.set(state);
		}
	}

	global.ExtensionState = { initialize: initialize, save: save };
})(this);