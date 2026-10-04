(function(i,s,o,g,r,a,m){i["GoogleAnalyticsObject"]=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];m.async=1;m.src=g;a.parentNode.insertBefore(m,a)
})(window,document,"script","https://www.google-analytics.com/analytics.js","ga");

ga("create", "##GAID##", "auto");
ga("set", "checkProtocolTask", null);
ga("set", "transport", "beacon");
ga("set", "dimension1", chrome.runtime.getManifest().version);
ga("send", "pageview", "/");