window.onload = initPage;
function initPage(){
	var tabs = document.getElementById('tabs').getElementsByTagName('a');
	for(var i=0;i<tabs.length;i++) {
		var currentTab = tabs[i];
		currentTab.onmouseover = showHint;
		currentTab.onmouseout = hideHint;
		currentTab.onclick = showTab;
	} 
	var buttons = document.getElementById('navigation').getElementsByTagName('a');
	for(var i=0;i<buttons.length;i++) {
		var currentBtn = buttons[i];
		addEventHandler(currentBtn, "mouseover", showHint);
		addEventHandler(currentBtn, "mouseout", hideHint);
		currentBtn.onclick = showTab;
		addEventHandler(currentBtn, "mouseover", buttonOver);
		addEventHandler(currentBtn, "mouseover", buttonOut);
	}
}

var welcomePaneShowing = true;
function showHint(e) {
	if(!welcomePaneShowing) {
		return;
	}

	switch (getActivedObject(e).title) {
		case "beginners":
			var hintText = "just getting started? come join us!";
			break;
		case "intermediate":
			var hintText = "in intermediate";
			break;
		case "advanced":
			var hintText = "in advanced";
			break;
		default:
			var hintText = "click the tabs";
	}
	var contentPane = document.getElementById('content');
	contentPane.innerHTML = "<h3>" + hintText + "</h3>";
}
function showTab(e) {
	var selectedTab = getActivedObject(e).title;
	console.log(selectedTab);
	if(selectedTab == "welcome") {
		welcomePaneShowing = true;
		document.getElementById('content').innerHTML = "click a tab";
	} else {
		welcomePaneShowing=false;
	}
	var tabs = document.getElementById('tabs').getElementsByTagName('a');
	for(var i=0; i<tabs.length;i++) {
		var currentTab = tabs[i];
		if(currentTab.title == selectedTab) {
			currentTab.className = "active";
			console.log(currentTab.className);
		} else {
			currentTab.className = 'inactive';
		}
	}
	var request = createRequest();
	if(request == null) {
		return;
	}
	request.onreadystatechange = showSchedule;
	request.open("GET", selectedTab+".html", true);
	request.send(null);
}
function showSchedule() {
	if (request.readyState == 4) {
		if (request.status == 200) {
			document.getElementById("content").innerHTML = request.responseText;
		}
	}
}
function hideHint() {
	if (welcomePaneShowing) {
		var contentPane = document.getElementById('content');
		//contentPane.innerHTML = "<h3>hideHint</h3>";
	}
}
function buttonOver(e){
	getActivedObject(e).className = "active";
}
function buttonOut(e){
	getActivedObject(e).className = "";
}