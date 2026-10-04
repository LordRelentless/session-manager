ExtensionState.initialize(function () {
	function track() {
		chrome.runtime.sendMessage({ type: "analytics", args: Array.prototype.slice.call(arguments) });
	}

	$("select").each(function () {
		$(this)
			.append('<option value="none">&lt;none&gt;</option>')
			.append('<option value="click">click</option>')
			.append('<option value="shift+click">shift+click</option>')
			.append('<option value="ctrl/cmd+click">ctrl/cmd+click</option>')
			.append('<option value="alt+click">alt/opt+click</option>')
			.find("option[value='" + JSON.parse(localStorage.open)[this.id.split("-")[1]] + "']").prop("selected", true);
	}).change(function () {
		var open = JSON.parse(localStorage.open);
		open[this.id.split("-")[1]] = this.value;
		localStorage.open = JSON.stringify(open);
		ExtensionState.save({ open: localStorage.open });
	});

	$("[name='pinned-save']").change(function () {
		localStorage.pinned = this.value;
		ExtensionState.save({ pinned: localStorage.pinned });
	}).filter("[value='" + localStorage.pinned + "']").prop("checked", true);

	$("#pinned-noreplace").change(function () {
		if (this.checked) {
			localStorage.noreplacingpinned = true;
		} else {
			delete localStorage.noreplacingpinned;
		}
		ExtensionState.save({ noreplacingpinned: localStorage.noreplacingpinned || null });
	}).prop("checked", localStorage.noreplacingpinned === "true");

	track("send", "pageview", "/options");
});