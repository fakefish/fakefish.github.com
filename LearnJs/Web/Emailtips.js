/*
* emailtips.js 
* is used for email message like sina weibo 
* by fakefish
*/

(function($){
	$.Emailtips = {
		emailList : [							// email List
					"gmail.com", 
					"qq.com", 
					"163.com", 
					"126.com"],
		msg 	: null, 						// message
		input   : null, 						// the input object
		li 		: null,							// the element puts email address
		liArr	: [],
		currentDisplayLi : [],		// the current tag li
		currentLiIndex : 0,			// the current index in tag li
		init : function(id) {
			// the initialization function
			var obj = this.input = document.getElementById(id);
			var that = this;
			if(obj.addEventListener){
				obj.addEventListener("input",that.eventHandler,false);
			}else if(obj.attachEvent){
				obj.attachEvent("onpropertychange",that.eventHandler);
			}
			this.addHandler(obj,"blur",that.focusout);
			this.createMsg();
		},
		eventHandler : function(){
			var str = Emailtips.input.value;
			var bool = true;
			Emailtips.currentDisplayLi = [];	// make the array empty
			for(var i in Emailtips.liArr) {
				li = document.createElement("li");
				var list = Emailtips.liArr[i];
				// if there is none "@" in str 
				if (list.indexOf(str) == -1){
					li.innerHTML = str + "@" + list;
				} else {
					bool = li.innerHTML.indexOf(str) != -1 ? true : false;
				}
				if(bool) {
					li.style.display == "block";
					Emailtips.currentDisplayLi.push(li);
				}
			}
			console.log(Emailtips.liArr);

		},
		focusout : function(){
			console.log("blur");
			Mailtips.msg.style.display = "none";
		},
		createMsg : function(){
			msg = Emailtips.msg = document.createElement("div");
			var obj = Emailtips.input;
			msg.style.position = "absolute";
			msg.style.top = obj.offsetTop + obj.offsetHeight + "px";
			msg.style.left = obj.offsetLeft + "px";
			msg.style.border = "1px solid #ccc";
			var ul = document.createElement("ul");
			msg.appendChild(ul);
			console.log(this.emailList);
			for(var i=0,len = this.emailList;i<len;i++) {
				var li = this.createList();
				li.innerHTML = this.emailList[i];
				this.liArr.push(li);
				ul.appendChild(li);
			}
			document.body.appendChild(msg);
		},
		createList : function(){
			var li = document.createElement("li");
			li.addHandler(li, "mouseover",function(){
				li.style.background="#ccc"
			});
			li.addHandler(li, "mouseout", function(){
				li.style.background="none";
			});
			li.addHandler(li, "click", 	  function(){
				Emailtips.input.value=li.innerHTML;
			});
			return li;
		},
		addHandler : function(element, type, hander){
			// a event handler from 
			// <Professional Javascript for Web Developers> page354
			if (element.addEventHandler) {
				// in morden browser
				element.addEventHandler(type, handler, false);
			} else if (element.attachEvent) {
				// in IE
				element.attachEvent("on" + type , handler);
			} else {
				// other
				element["on" + type] = null;
			}
		}
	}
})(window)