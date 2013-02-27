/*
* mailtips.js 用于邮箱输入提示
* 代码参考自 http://www.oozk.net/learn/js/007/
*/
var MailTips = {
	mailArr:["163.com", 
			"126.com", 
			"qq.com",
			"sina.com",
			"hotmail.com",
			"gmail.com",
			"sina.cn",
			"yahoo.cn",],
	liArr:[],
	box:null,
	input:null,
	kboo:false,
	currentDisplayLiArr:[],
	currentIndex:0,
	init:function(id){
		var obj = this.input = document.getElementById(id);
		var that = this;
		if(obj.addEventListener){
			obj.addEventListener("input",that.changeEvent,false);
		}else if(obj.attachEvent){
			obj.attachEvent("onpropertychange",that.changeEvent);
		}
		this.addEvent(obj,"blur",that.focusout);
		this.createContent();
		this.box.style.top = obj.offsetTop + obj.offsetHeight + "px";
		this.box.style.left = obj.offsetLeft + "px";
	},
	changeEvent:function(){
		var str = MailTips.input.value;
		MailTips.box.style.display = "block";
		MailTips.kboo = true;
		MailTips.currentDisplayLiArr = [];
		for(var i in MailTips.liArr){
			var li = MailTips.liArr[i];
			if(str.indexOf("@") == -1){
				li.style.display = "block";
				li.innerHTML = str + "@" + MailTips.mailArr[i];
			}else{
				li.style.display = li.innerHTML.indexOf(str) != -1 
					? "block":"none";	
			}
			if(li.style.display == "block"){
				MailTips.currentDisplayLiArr.push(li);	
			}
		}
		MailTips.currentIndex = 0;
	},
	focusout:function(){
		setTimeout(function(){
			MailTips.box.style.display = "none";
			MailTips.kboo = false;
		},100)
	},
	createContent:function(){
		this.box = document.createElement("div");
		this.box.className = "mailtops_css";
		document.body.appendChild(this.box);
		var ul = document.createElement("ul");
		this.box.appendChild(ul);
		for(var i=0;i<this.mailArr.length;i++){
			var li = this.getLi();
			li.innerHTML = this.mailArr[i];
			this.liArr.push(li);
			ul.appendChild(li);	
		}
		this.addKeyBoardEvent();
	},
	addKeyBoardEvent:function(){
		this.addEvent(document,"keydown",function(e){
			if(MailTips.kboo){
				var e = e || window.event;
				switch(e.keyCode){
					case 40:MailTips.currentIndex++;break;
					case 38:MailTips.currentIndex--;break;
					case 13:
						MailTips.input.value = MailTips.currentDisplayLiArr[MailTips.currentIndex].innerHTML;
						MailTips.focusout();
						break
					default:break;
				}
				MailTips.selectCurrent();
			}
		})
	},
	selectCurrent:function(){
		if(MailTips.currentIndex < 0) MailTips.currentIndex = MailTips.currentDisplayLiArr.length - 1;
		if(MailTips.currentIndex > MailTips.currentDisplayLiArr.length) MailTips.currentIndex = 0;
		for(var i=0;i<MailTips.currentDisplayLiArr.length;i++){
			if(MailTips.currentIndex == i){
				MailTips.currentDisplayLiArr[i].className = "overli";	
			}else{
				MailTips.currentDisplayLiArr[i].className = "outli";		
			}
		}
	},
	getLi:function(){
		var li = document.createElement("li");
		this.addEvent(li,"mouseover",function(){li.className = "overli";});
		this.addEvent(li,"mouseout",function(){li.className = "outli";});
		this.addEvent(li,"click",function(){MailTips.input.value = li.innerHTML;});
		return li;
	},
	addEvent:function(obj,type,fn){
		if(obj.addEventListener){
			obj.addEventListener(type,fn,false);	
		}else if(obj.attachEvent){
			obj.attachEvent("on"+type,fn);
		}
	},
}
