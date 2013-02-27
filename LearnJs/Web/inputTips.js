(function($){
	$.inputTips = {};
	// 初始化
	var obj,			// 对象
			msg;			// 提示信息
	// inputTips.phone(id) 手机号码输入提示
	inputTips.phone = function(id){
		obj = document.getElementById(id);
		this.init = (function(){
			// 限制长度
			obj.setAttribute('maxlength','11');
			// 创建提示信息
			msg = document.createElement("div");
			msg.style.position = "absolute";
			msg.style.top = obj.offsetTop + obj.offsetHeight + "px";
			msg.style.left = obj.offsetLeft + "px";
		})();
		this.show = function(){
			msg.innerHTML = obj.value.replace(/^\d{3}|\d{4}/g,'$& ');
			document.body.appendChild(msg);
		}
		obj.onfocus = obj.onkeyup = this.show;
		this.hidden = function(){
			msg.remove();
		}
		obj.onblur = this.hidden;
		return this;
	}
	// inputTips.email(id) 邮箱输入提示
	inputTips.email = function(id){
		var mailList = ["qq.com","gmail.com","hotmail.com"];
		var obj = document.getElementById(id);
		this.init = function(){

		}
		return this;
	}
	// inputTips.shoppingCart(id) 左加右减的输入
})(window)
