(function(){
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x){
    window.requestAnimation = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimtionFrame = 
      window[vendors[x] + 'CancelAnimationFrame'] || 
      window[vendors[x] + 'CancelRequestAnimtionFrame'];
  }

  if(!window.requestAnimationFrame)
    window.requestAnimationFrame = function(callback, element){
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function(){ callback(currTime + timeToCall) ;},timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  if(!window.cancelAnimationFrame)
    window.cancelAnimationFrame = function(id){
      clearTimeout(id);
    }
})();