// 之前去阿里校招参加笔试，里面有道题目是考js的object复制
// 然后在segmentfault上看到了类似的题目
// http://segmentfault.com/q/1010000000148290
// 然后开始写
var a = {
  aNumber : 1,
  aString : "string",
  aObject : {
    obNumber : 2,
    obString : "string 2"
  },
  aArray : [
    "a array",
    {
      arrString : "string"
    }
  ],
  // 浅拷贝
  // 当初阿里笔试题中我是这么写的，汗颜
  clone1 : function(){
    var result = {};
    var source = this;
    for (var key in source){
      result[key] = source[key];
    }
    return result;
  }
}
// 浅拷贝实例
var b1 = a.clone1();
b1.aObject.obString = "b1 String";
console.log(a.aObject.obString);// "b1 String"
a.aObject.obString = "string 2";
// 然后滚去google，发现以下几个

// http://www.css88.com/archives/4818 
// 作者：愚人码头
function cloneObject(obj){
  var o = obj.constructor === Array ? [] : {};
  for(var i in obj){
      if(obj.hasOwnProperty(i)){
          o[i] = typeof obj[i] === "object" ? cloneObject(obj[i]) : obj[i];
      }
  }
  return o;
}
// 来测试下
var b2 = cloneObject(a);
b2.aObject.obString = "b2 String";
console.log(a.aObject.obString);// "b1 String"
b2.aArray[0] = "1";
console.log(a.aArray);
// ["a array", Object]，此时不能复制，此方法不支持数组中含object
a.aObject.obString = "string 2";


/**
 * type identification - By 司徒正美::cheng (MIT Licensed)
 * http://www.cnblogs.com/rubylouvre/archive/2010/01/20/1652646.html
 */
 // 美美他先是做个了处理，然后
/*
下面正式进入主题，我们的深拷贝函数会特殊处理值为对象与数组的键值对，对于它们，程序会为目标对象先创建一个新对象与数组，然后再一层层拷下去。我们可以看到它并没有用hasOwnProperty，换言之，连原型中可遍历的属性都给它翻个底朝天。对于数组，我们不用for(,,,)循环，它只能循环括号中的元素，无法循环附在数组上的其他属性，因此这里还是需要for...in这个特慢的方法。由于深拷贝把所有属性都进行检测，中间还可能创建新对象，因此是个巨重型的方法。无事就别用。
 */
var dom = {};
dom.is = function (obj,type) {
  var toString = Object.prototype.toString,undefined;
  return (type === "Null" && obj === null) ||
    (type === "Undefined" && obj === undefined ) ||
    toString.call(obj).slice(8,-1) === type;
};
dom.deepCopy = function(result, source){
  for(var key in source) {
    var copy = source[key];
    if(source === copy) continue;//如window.window === window，会陷入死循环，需要处理一下
    if(dom.is(copy,"Object")){
      result[key] = arguments.callee(result[key] || {}, copy);
    }else if(dom.is(copy,"Array")){
      result[key] = arguments.callee(result[key] || [], copy);
    }else{
      result[key] = copy;
    }
  }
  return result;
};
// 测试下
var b3 = dom.deepCopy(a);
b3.aObject.obString = "b2 String";
console.log(a.aObject.obString);// "b1 String"
b3.aArray[0] = "1";
console.log(a.aArray);//["1", Object]，成了
a.aObject.obString = "string 2";
a.aArray[0] = "a string";

/* 然后在stackoverflow上看到
* http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-a-javascript-object
* John Resig回答的用jq的一个方法
*/
// 浅拷贝
var newObject = jQuery.extend({}, a);

// 深拷贝
var newObject = jQuery.extend(true, {}, a);

// 然后又有个json的版本，
function copy( obj ){
    return JSON.parse( JSON.stringify( obj ) );
}

/* 其实还有个版本
 * http://segmentfault.com/q/1010000000148290#a-1020000000148407
 */
var clone = (function(){
  // classify object
  var classof = function(o){
    if (o === null) { return "null"; }
    if (o === undefined) { return "undefined"; }
    // I suppose Object.prototype.toString use obj.constructor.name
    // to generate string
    var className = Object.prototype.toString.call(o).slice(8,-1);
    return className;
  };
  
  var references = null;

  var handlers = {
    // Handle regexp and date even in shallow.
    'RegExp': function(reg) {
      var flags = '';
      flags += reg.global ? 'g' : '';
      flags += reg.multiline ? 'm' : '';
      flags += reg.ignoreCase ? 'i' : '';
      return new RegExp(reg.source, flags);
    },
    'Date': function(date) {
      return new Date(+date);
    },
    'Array': function(arr, shallow) {
      var newArr = [], i;
      for (i=0; i<arr.length; i++) {
        if (shallow) {
          newArr[i] = arr[i];
        } else {
          // handle circular reference
          if (references.indexOf(arr[i]) !== -1) {
            continue;
          }
          var handler = handlers[classof(arr[i])];
          if (handler) {
            references.push(arr[i]);
            newArr[i] = handler(arr[i], false);
          } else {
            newArr[i] = arr[i];
          }
        }
      }
      return newArr;
    },
    'Object': function(obj, shallow) {
      var newObj = {}, prop, handler;
      for (prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          // escape prototype properties
          if (shallow) {
            newObj[prop] = obj[prop];
          } else {
            // handle circular reference
            if (references.indexOf(obj[prop]) !== -1) {
              continue;
            }
            // recursive
            handler = handlers[classof(obj[prop])];
            if (handler) {
              references.push(obj[prop]);
              newObj[prop] = handler(obj[prop], false);
            } else {
              newObj[prop] = obj[prop];
            }
          }
        }
      }
      return newObj;
    }
  };

  return function(obj, shallow) {
    // reset references
    references = [];
    // default to shallow clone
    shallow = shallow === undefined ? true : false;
    var handler = handlers[classof(obj)];
    return handler ? handler(obj, shallow) : obj;
  };
}());

(function(){
  // Following is some tests
  var date = new Date();
  var reg = /hello word/gi;
  var obj = {
    prop: 'this ia a string',
    arr: [1,2,3],
    o: {
      wow: 'aha'
    }
  };
  var refer1 = {
    arr: [1,2,3]
  };
  var refer2 = {
    refer: refer1
  };
  refer1.refer = refer2;

  var cloneDate = clone(date, false);
  var cloneReg = clone(reg, false);
  var cloneObj = clone(obj, false);
  alert( (date !== cloneDate) && (date.valueOf() === cloneDate.valueOf()) );
  alert( (cloneReg !== reg) && (reg.toString() === cloneReg.toString()) );
  alert( (obj !== cloneObj) && (obj.arr !== cloneObj.arr) && (obj.o !== cloneObj.o) && (JSON.stringify(obj) === JSON.stringify(cloneObj)) );

  clone(refer2, false);
  alert("I'm not dead yet!");
  // Output:
  // true
  // true
  // true
  // I'm not dead yet!
}());

/*
--------------分割线----------------------
12.19.2012
今天在学习map和forEach的方法区别的时候，意外的在mdn上看到了用forEach实现的
复制,还用到了Object.*函数，看来是时候学习ES5了
https://developer.mozilla.org/zh-CN/docs/JavaScript/Reference/Global_Objects/Array/forEach
*/
function copy(o){
  var copy = Object.create( Object.getPrototypeOf(o) );
  var propNames = Object.getOwnPropertyNames(o);
  propNames.forEach(function(name){
                      var desc = Object.getOwnPropertyDescriptor(o, name);
                      Object.defineProperty(copy, name, desc);
                    });
  return copy;
}
 
 
var o1 = {a:1, b:2};
var o2 = copy(o1); // o2 looks like o1 now