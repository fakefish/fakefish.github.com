/*
* Keymap.js
*/
// 构造函数
function Keymap(bindings) {
	this.map() = {};
	if (bindings) {
		for(name in bindings) this.bind(name, bindings[name]);
	}
}
// 绑定指定的按键标识符和制定 处理程序函数
Keymap.prototype.bind = function(key, func) {
	this.map[Keymap.normalize(key)] = func;
};

// 删除指定按键标识符的绑定
Keymap.prototype.unbind = function(key) {
	delete this.map[Keymap.normalize(key)];
};

// 在指定的HTML元素上配置Keymap
Keymap.prototype.install = function(element) {
	// 事件处理函数
	var keymap = this;
	function handler(event) {
		return keymap.dispatch(event, element);
	}

	// install
	if (element.addEventListener) {
		element.addEventListener("keydown", handler, false);
	} else if (element.attachEvent) {
		element.attachEvent("onkeydown", handler);
	}
};

// 这个方法基于keymap绑定分派按键事件
Keymap.prototype.dispatch = function(event, element) {
	// 开始没有辅助键和键名
	var modifiers = "";
	var keyname = null;

	// 按照标准的小写字母顺序构建辅助键字符串
	if (event.altKey) modifiers += "alt_";
	if (event.ctrlKey) modifiers += "ctrl_";
	if (event.metaKey) modifiers += "meta_";
	if (event.shiftKey) modifiers += "shift_";

	// 如果实现3级DOM规范的key属性,获取keyname很容易
	if (event.key) keyname = event.key;
	else if (event.keyIdentifier && event.keyIdentifier.substring(0,2) !== "U+"){
		keyname = event.keyIdentifier;
	} else {
		keyname = Keymap.keyCodeToKeyName[event.keyCode];
	}

	// 如果不能找出键名，只能返回并忽略这个事件
	if (!keyname) return;

	// 标准的按键ID是辅助键加上小写的键名
	var keyid = modifiers + keyname.toLowerCase();

	// 现在查看按键标示符是否绑定了任何东西
	var handler = this.map[keyid];

	if (handler) {
		//如果这个键有处理程序，调用
		var retval = handler.call(element, event, keyid);

		// 如果处理程序返回false，取消默认操作并阻止冒泡
		if (retval === false) {
			if (event.stopPropagation) event.stopPropagation(); // DOM模型
			else event.cancelBubble = true;						// IE模型
			if (event.preventDefault) event.preventDefault();   // DOM
			else event.returnValue = false;						// IE
		}

		// 返回处理程序的返回值
		return retval;
	}
};

// 用于把按键标示符转换成标准形式的工具函数
// 在非Mac中，把“meta”映射到“ctrl”
// 这样在mac中“meta+c”将变成“command+c”
Keymap.normalize = function(keyid) {
	keyid = keyid.toLowerCase(); // 一切都小写
	var words = keyid.split(/\s+|[\-+_]/); // 分割辅助键和键名
	var keyname = words.pop();	// 键名是最后一个
	words.sort();
	words.push(keyname);
	return words.join("_");
};

Keymap.aliases = {
	"escape" : "esc",
	"delete" : "del",
	"return" : "enter",
	"ctrl"   : "control",
	"space"  : "spacebar",
	"ins"    : "insert"
};

// 传统的keydown事件对象的keycode属性是不标准
// 但下面的值似乎可以在大多数游览器和OS中可信
Keymap.keyCodeToKeyName = {
	// 使用词或方向键的按键
	8:"Backspace",9:"Tab",13:"Enter",16:"Shift",17:"Control",18:"Alt",
	19:"Pause",20:"CapsLock",27:"Esc",32:"Spacebar",33:"PageUp",
	34:"PageDown",35:"End",36:"Home",37:"Left",38:"Up",39:"Right",
	40:"Down",45:"Insert",46:"Del",

	// 主键盘上的数字
	48:"0",49:"1",50:"2",51:"3",52:"4",53:"5",54:"6",55:"7",56:"8",57:"9",

	// 字母按键
	65:"A",66:"B",67:"C",68:"D",69:"E",70:"F",71:"G",72:"H",73:"I",
	74:"J",75:"K",76:"L",77:"M",78:"N",79:"O",80:"P",81:"Q",82:"R",
	83:"S",84:"T",85:"U",86:"V",87:"W",88:"X",89:"Y",90:"Z"

	// 数字小键盘的数字和标点符号按键(no opera)
	96:"0",97:"1",98:"2",99:"3",100:"4",101:"5",102:"6",103:"7",104:"8",105:"9",
	106:"Multiply",107:"Add",109:"Subtract",110:"Decimal",111:"Divide",

	// 功能键
	112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",
	118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",
	124:"F13",125:"F14",126:"F15",127:"F16",128:"F17",129:"F18",
	130:"F19",131:"F20",132:"F21",133:"F22",134:"F23",135:"F24",

	// 不需要按下Shift键的标点符号键
	// 连字符不兼容，FF返回的编码和减号一样
	59:";",61:"=",186:";",187:"=",// FF and Opera return 59,61
	188:",",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'"
};