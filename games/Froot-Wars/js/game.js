$(window).load(function(){
  game.init();
});
var game = {
  init : function(){
    levels.init();
    loader.init();
    mouse.init();

    game.backgroundMusic = loader.loadSound('audio/gurdonark-kindergarten');

    game.slingshotReleasedSound = loader.loadSound("audio/released");
    game.bounceSound = loader.loadSound("audio/bounce");
    game.breakSound = {
      "glass" : loader.loadSound("audio/glassbreak"),
      "wood" : loader.loadSound("audio/woodbreak")
    };

    $('.gamelayer').hide();
    $('#gamestartscreen').show();

    game.canvas = $('#gamecanvas')[0];
    game.context = game.canvas.getContext('2d');

  },
  showLevelScreen : function(){
    $('.gamelayer').hide();
    $('#levelselectscreen').show('slow');
  },
  mode : 'intro',
  slingshotX : 140,
  slingshotY : 280,
  start : function(){
    $('.gameLayer').hide();
    $('#gamecanvas').show();
    $('#scorescreen').show();
    $('#endingscreen').hide();

    game.startBackgroundMusic();

    game.mode = "intro";
    game.offsetLeft = 0;
    game.ended = false;
    game.animationFrame = window.requestAnimationFrame(game.animate,game.canvas);
  },
  // 画面最大平移速度，单位为像素没帧
  maxSpeed : 3,
  // 画面最大和最小平移范围
  minOffset : 0,
  maxOffset : 300,
  // 画面当前平移位置
  offsetLeft : 0,
  // 得分
  score : 0,

  // 画面中心移到呢我Center
  panTo : function(newCenter){
    if (Math.abs(newCenter - game.offsetLeft - game.canvas.width/4)>0
      && game.offsetLeft <= game.maxOffset && game.offsetLeft >= game.minOffset){
      var deltaX = Math.round((newCenter - game.offsetLeft - game.canvas.width/4)/2);
      if(deltaX && Math.abs(deltaX) > game.maxSpeed){
        deltaX = game.maxSpeed*Math.abs(deltaX)/(deltaX);
      }
      game.offsetLeft += deltaX;
    } else {
      return true;
    }
    if(game.offsetLeft < game.minOffset){
      game.offsetLeft = game.minOffset;
      return true;
    }else if(game.offsetLeft > game.maxOffset){
      game.offsetLeft = game.maxOffset;
      return true;
    }
    return false;
  },
  countHerosAndVillains : function(){
    game.heroes = [];
    game.villains = [];
    for (var body = box2d.world.GetBodyList(); body; body = body.GetNext()) {
      var entity = body.GetUserData();
      if(entity){
        if(entity.type == "hero"){
          game.heroes.push(body);
        } else if (entity.type == "villain") {
          game.villains.push(body);
        }
      }
    }
  },
  handlePanning : function(){
    if(game.mode == "intro"){
      if(game.panTo(700)){
        game.mode = "load-next-hero";
      }
    }
    if(game.mode == "wait-for-firing"){
      if (mouse.dragging){
        if (game.mouseOnCurrentHero()){
          game.mode="firing";
        }else {
          game.panTo(mouse.x + game.offsetLeft);
        }
      } else {
        game.panTo(game.slingshotX);
      }
    }
    if(game.mode == "firing"){
      if(mouse.down) {
        game.panTo(game.slingshotX);
        game.currentHero.SetPosition({x:(mouse.x+game.offsetLeft)/box2d.scale,y:mouse.y/box2d.scale});
      } else {
        game.mode = "fired";
        game.slingshotReleasedSound.play();
        var impulseScaleFactor = 0.75;
        var impulse = new b2Vec2((game.slingshotX+35-mouse.x-game.offsetLeft)*impulseScaleFactor,
          (game.slingshotY+25-mouse.y)*impulseScaleFactor);
        game.currentHero.ApplyImpulse(impulse, game.currentHero.GetWorldCenter());
      }
    }
    if(game.mode == "fired"){
      var heroX = game.currentHero.GetPosition().x*box2d.scale;
      game.panTo(heroX);
      // 直到该英雄停止移动或移除边界
      if(!game.currentHero.IsAwake() || heroX<0 || heroX > game.currentLevel.foregroundImage.width) {
        box2d.world.DestroyBody(game.currentHero);
        game.currentHero = undefined;

        game.mode = "load-next-hero";
      }
    }

    if (game.mode == "load-next-hero") {
      game.countHerosAndVillains();

      if (game.villains.length == 0) {
        game.mode = "level-success";
        return;
      }
      if (game.heroes.length == 0) {
        game.mode = "level-failure";
        return;
      }

      // 加载英雄并设置模式为wait-for-firing
      if(!game.currentHero){
        game.currentHero = game.heroes[game.heroes.length-1];
        game.currentHero.SetPosition({x:180/box2d.scale,y:200/box2d.scale});
        game.currentHero.SetLinearVelocity({x:0,y:0});
        game.currentHero.SetAngularVelocity(0);
        game.currentHero.SetAwake(true);
      } else {
        // 等待英雄结束弹跳并进入休眠，接着切换到wait-for-firing阶段
        game.panTo(game.slingshotX);
        if(!game.currentHero.IsAwake()){
          game.mode = "wait-for-firing";
        }
      }
    }

    if(game.mode=="level-success" || game.mode=="level-failure"){
      if(game.panTo(0)){
        game.ended = true;

        game.showEndingScreen();
      }
    }
  },
  animate : function(){
    game.handlePanning();

    var currentTime = new Date().getTime();
    var timeStep;
    if (game.lastUpdateTime){
      timeStep = (currentTime - game.lastUpdateTime)/1000;
      if(timeStep >2/60){
        timeStep = 2/60
      }
      box2d.step(timeStep);
    } 
    game.lastUpdateTime = currentTime;

    game.context.drawImage(game.currentLevel.backgroundImage, game.offsetLeft/4, 0, 640, 480, 0, 0, 640, 480);
    game.context.drawImage(game.currentLevel.foregroundImage, game.offsetLeft, 0, 640, 480, 0, 0, 640, 480);

    game.context.drawImage(game.slingshotImage,game.slingshotX-game.offsetLeft,game.slingshotY);
    
    game.drawAllBodies();

    if(game.mode == "firing"){
      game.drawSlingshotBand();
    }

    game.context.drawImage(game.slingshotFrontImage,game.slingshotX-game.offsetLeft,game.slingshotY);

    if(!game.ended){
      game.animationFrame = window.requestAnimationFrame(game.animate, game.canvas);
    }

  },
  drawAllBodies : function(){
    box2d.world.DrawDebugData();

    for (var body = box2d.world.GetBodyList(); body; body = body.GetNext()) {
      var entity = body.GetUserData();

      if(entity) {
        var entityX = body.GetPosition().x*box2d.scale;
        if(entityX<0 || entityX > game.currentLevel.foregroundImage.width |
          (entity.health && entity.health < 0)){
          box2d.world.DestroyBody(body);
          if(entity.type=="villain"){
            game.score += entity.calories;
            $("#score").html("Score: "+game.score);
          }
          if(entity.breakSound){
            entity.breakSound.play();
          }
        } else {
          entities.draw(entity,body.GetPosition(),body.GetAngle());
        }
      }
    }
  },
  mouseOnCurrentHero : function(){
    if (!game.currentHero) {
      return false;
    }
    var position = game.currentHero.GetPosition();
    var distanceSquared = Math.pow(position.x*box2d.scale - mouse.x - game.offsetLeft,2)
      + Math.pow(position.y*box2d.scale-mouse.y,2);
    var radiusSquared = Math.pow(game.currentHero.GetUserData().radius,2);
    return (distanceSquared <= radiusSquared);
  },
  showEndingScreen : function(){
    game.stopBackgroundMusic();
    if(game.mode=="level-success"){
      if(game.currentLevel.number<levels.data.length-1){
        $('#endingmessage').html('Level Complete. Well Done!!');
        $('#playnextlevel').show();
      } else {
        $('endingmessage').html('All Levels Complete. Well Done!!');
        $('playnextlevel').show();
      }
    } else if (game.mode=="level-failure"){
      $('#endingmessage').html('Failed. Play Again?');
      $('#playnextlevel').hide();
    }

    $('#endingscreen').show();
  },
  drawSlingshotBand : function(){
    game.context.strokeStyle = "rgb(68,31,11)";
    game.context.lineWidth = 6;

    var radius = game.currentHero.GetUserData().radius;
    var heroX = game.currentHero.GetPosition().x*box2d.scale;
    var heroY = game.currentHero.GetPosition().y*box2d.scale;
    var angle = Math.atan2(game.slingshotY+25-heroY, game.slingshotX+50-heroX);

    var heroFarEdgeX = heroX - radius * Math.cos(angle);
    var heroFarEdgeY = heroY - radius * Math.sin(angle);

    game.context.beginPath();
    game.context.moveTo(game.slingshotX+50-game.offsetLeft, game.slingshotY+25);

    game.context.lineTo(heroX - game.offsetLeft, heroY);
    game.context.stroke();

    entities.draw(game.currentHero.GetUserData(), game.currentHero.GetPosition(), game.currentHero.GetAngle());

    game.context.beginPath();
    game.context.moveTo(heroFarEdgeX-game.offsetLeft, heroFarEdgeY);

    game.context.lineTo(game.slingshotX-game.offsetLeft+10, game.slingshotY+30);
    game.context.stroke();
  },
  restartLevel:function(){
    window.cancelAnimationFrame(game.animationFrame);   
    game.lastUpdateTime = undefined;
    levels.load(game.currentLevel.number);
  },
  startNextLevel:function(){
    window.cancelAnimationFrame(game.animationFrame);   
    game.lastUpdateTime = undefined;
    levels.load(game.currentLevel.number+1);
  },
  startBackgroundMusic : function(){
    var toggleImage = $("#togglemusic")[0];
    game.backgroundMusic.play();
    toggleImage.src = "images/icons/sound.png";
  },
  stopBackgroundMusic : function(){
    var toggleImage = $("#togglemusic")[0];
    toggleImage.src = "images/icons/nosound.png";
    game.backgroundMusic.pause();
    game.backgroundMusic.currentTime = 0;
  },
  toggleBackgroundMusic : function(){
    var toggleImage = $("#togglemusic")[0];
    if(game.backgroundMusic.paused){
      game.backgroundMusic.play();
      toggleImage.src = "images/icons/sound.png";
    } else {
      game.backgroundMusic.pause();
      $("#togglemusic")[0].src = "images/icons/nosound.png";
    }
  }
};
var levels = {
  data : [
    {
      foreground : 'desert-foreground',
      background : 'clouds-background',
      entities : [
        {type:"ground", name:"dirt", x:500,y:440,width:1000,height:20,isStatic:true},
        {type:"ground", name:"wood", x:185,y:390,width:30,height:80,isStatic:true},

        {type:"block", name:"wood", x:520,y:380,angle:90,width:100,height:25},
        {type:"block", name:"glass", x:520,y:280,angle:90,width:100,height:25},
        {type:"villain", name:"burger",x:520,y:205,calories:590},

        {type:"block", name:"wood", x:620,y:380,angle:90,width:100,height:25},
        {type:"block", name:"glass", x:620,y:280,angle:90,width:100,height:25},
        {type:"villain", name:"fries", x:620,y:205,calories:420},

        {type:"hero", name:"orange",x:80,y:405},
        {type:"hero", name:"apple",x:140,y:405},
      ],
    },
    {
      foreground : 'desert-foreground',
      background : 'clouds-background',
      entities : [
        {type:"ground", name:"dirt", x:500,y:440,width:1000,height:20,isStatic:true},
        {type:"ground", name:"wood", x:185,y:390,width:30,height:80,isStatic:true},
  
        {type:"block", name:"wood", x:820,y:380,angle:90,width:100,height:25},
        {type:"block", name:"wood", x:720,y:380,angle:90,width:100,height:25},
        {type:"block", name:"wood", x:620,y:380,angle:90,width:100,height:25},
        {type:"block", name:"glass", x:670,y:317.5,width:100,height:25},
        {type:"block", name:"glass", x:770,y:317.5,width:100,height:25},        

        {type:"block", name:"glass", x:670,y:255,angle:90,width:100,height:25},
        {type:"block", name:"glass", x:770,y:255,angle:90,width:100,height:25},
        {type:"block", name:"wood", x:720,y:192.5,width:100,height:25}, 

        {type:"villain", name:"burger",x:715,y:155,calories:590},
        {type:"villain", name:"fries",x:670,y:405,calories:420},
        {type:"villain", name:"sodacan",x:765,y:400,calories:150},

        {type:"hero", name:"strawberry",x:30,y:415},
        {type:"hero", name:"orange",x:80,y:405},
        {type:"hero", name:"apple",x:140,y:405},
      ],
    }
  ],
  init : function(){
    var html = "";
    for (var i = 0; i < levels.data.length; i++){
      var level = levels.data[i];
      html += '<input type="button" value="' + (i+1)+'">';
    }
    $('#levelselectscreen').html(html);

    $('#levelselectscreen input').click(function(){
      levels.load(this.value-1);
      $('#levelselectscreen').hide();
    });
  },

  load : function(number){
    box2d.init();

    game.currentLevel = {number:number, hero:[]};
    game.score = 0;
    $('#score').html('Score: '+game.score);
    var level = levels.data[number];

    game.currentLevel.backgroundImage = loader.loadImage("images/backgrounds/"+level.background+".png");
    game.currentLevel.foregroundImage = loader.loadImage("images/backgrounds/"+level.foreground+".png");
    game.slingshotImage = loader.loadImage("images/slingshot.png");
    game.slingshotFrontImage = loader.loadImage("images/slingshot-front.png");

    for (var i = level.entities.length - 1; i >= 0; i--){
      var entity = level.entities[i];
      entities.create(entity);
    };

    if(loader.loaded){
      game.start();
    }else{
      loader.onload = game.start;
    }
  }
};

var loader = {
  loaded : true,
  loadedCount : 0,
  totalCount : 0,

  init : function(){
    var mp3Support, oggSupport;
    var audio = document.createElement('audio');
    if (audio.canPlayType){
      mp3Support = "" != audio.canPlayType('audio/mpeg');
      oggSupport = "" != audio.canPlayType('audio/ogg; codecs = "vorbis"');
    }else{
      mp3Support = false;
      oggSupport = false;
    }

    loader.soundFileExtn = oggSupport?".ogg":mp3Support?".mp3":undefined;
  },

  loadImage : function(url){
    this.totalCount++;
    this.loaded = false;
    $('#loadingscreen').show();
    var image = new Image();
    image.src = url;
    image.onload = loader.itemLoaded;
    return image;
  },
  soundFileExtn:'.ogg',
  loadSound : function(url){
    this.totalCount++;
    this.loaded = false;
    $('#loadingscreen').show();
    var audio = new Audio();
    audio.src = url + loader.soundFileExtn;
    audio.addEventListener('canplaythrough', loader.itemLoaded, false);
    return audio;
  },
  itemLoaded : function(){
    loader.loadedCount++;
    $('loadingmessage').html('Loaded '+ loader.loadedCount + ' of '+ loader.totalCount);
    if(loader.loadedCount === loader.totalCount){
      loader.loaded = true;
      $('#loadingscreen').hide();
      if(loader.onload){
        loader.onload();
        loader.onload = undefined;
      }
    }
  }
};
(function(){
  var lastTime = 0;
  var vendors = ['ms','moz','webkit','o'];
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x){
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
  }
  if (!window.requestAnimationFrame){
    window.requestAnimationFrame = function(callback, element){
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function(){callback(currTime+timeToCall); }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }
  if(!window.cancelAnimationFrame){
    window.cancelAnimationFrame = function(id){
      clearTimeout(id);
    }
  }
})();
// 处理鼠标
var mouse = {
  x : 0,
  y : 0,
  down : false,
  init : function(){
    $('#gamecanvas').mousemove(mouse.mousemovehandler);
    $('#gamecanvas').mousedown(mouse.mousedownhandler);
    $('#gamecanvas').mouseup(mouse.mouseuphandler);
    $('#gamecanvas').mouseout(mouse.mouseuphandler);
  },
  mousemovehandler : function(ev){
    var offset = $('#gamecanvas').offset();
    mouse.x = ev.pageX - offset.left;
    mouse.y = ev.pageY - offset.top;
    if (mouse.down){
      mouse.dragging = true;
    }
  },
  mousedownhandler : function(ev){
    mouse.down = true;
    mouse.downX = mouse.x;
    mouse.downY = mouse.y;
    ev.originalEvent.preventDefault();
  },
  mouseuphandler : function(ev){
    mouse.down = false;
    mouse.dragging = false;
  }
};

// var entities
var entities = {
  definitions : {
    "glass" : {
      fullHealth : 100,
      density : 2.4,
      friction : 0.4,
      restitution : 0.15,
    },
    "wood" : {
      fullHealth : 500,
      density :0.7,
      friction : 0.4,
      restitution : 0.4,
    },
    "dirt" : {
      density : 3.0,
      friction : 1.5,
      restitution : 0.2,
    },
    "burger" : {
      shape : "circle",
      fullHealth : 40,
      radius : 25,
      density : 1,
      friction : 0.5,
      restitution : 0.4,
    },
    "sodacan" : {
      shape : "rectangle",
      fullHealth : 80,
      width : 40,
      height : 60,
      density : 1,
      friction : 0.5,
      restitution : 0.7,
    },
    "fries" : {
      shape : "rectangle",
      fullHealth : 50,
      width : 40,
      height : 50,
      density : 1,
      friction : 0.5,
      restitutuin : 0.6,
    },
    "apple" : {
      shape : "circle",
      radius : 25,
      density : 1.5,
      friction : 0.5,
      restitution : 0.4,
    },
    "orange" : {
      shape : "circle",
      radius : 25,
      density : 1.5,
      friction : 0.5,
      restitution : 0.4,
    },
    "strawberry" : {
      shape : "circle",
      radius : 15,
      density : 2.0,
      friction : 0.5,
      restitution : 0.4,
    }
  },

  // 以物体为参数，创建一个box2d物体，并加入世界
  create : function(entity){
    var definition = entities.definitions[entity.name];
    if(!definition){
      console.log("Undefined entity name",entity.name);
      return;
    }
    switch(entity.type){
      case "block": // 障碍物
        entity.health = definition.fullHealth;
        entity.fullHealth = definition.fullHealth;
        entity.shape = "rectangle"; 
        entity.sprite = loader.loadImage("images/entities/"+entity.name+".png");
        entity.breakSound = game.breakSound[entity.name];
        box2d.createRectangle(entity, definition);
        break;
      case "ground":
        // 不可摧毁物体，不必具有生命值
        entity.shape = "rectangle";
        // 不会被画出，所以不必具有图像
        box2d.createRectangle(entity, definition);
        break;
      case "hero": // 简单的圆
      case "villain": // 可以是圆形或是矩形
        entity.health = definition.fullHealth;
        entity.fullHealth = definition.fullHealth;
        entity.sprite = loader.loadImage("images/entities/"+entity.name+".png");
        entity.shape = definition.shape;
        entity.bounceSound = game.bounceSound;
        if(definition.shape == "circle"){
          entity.radius = definition.radius;
          box2d.createCircle(entity, definition);
        } else if(definition.shape == "rectangle"){
          entity.width = definition.width;
          entity.height = definition.height;
          box2d.createRectangle(entity, definition);
        }
        break;
      default:
        console.log("Undefined entity type", entity.type);
        break;
    }
  },
  //以物体，物体的位置和角度为参数，在游戏中绘制物体
  draw : function(entity, position, angle){
    game.context.translate(position.x*box2d.scale-game.offsetLeft, position.y*box2d.scale);
    game.context.rotate(angle);
    switch (entity.type){
      case "block":
        game.context.drawImage(entity.sprite,0,0,entity.sprite.width,entity.sprite.height,
            -entity.width/2-1,-entity.height/2-1,entity.width+2,entity.height+2); 
      break;
      case "villain":
      case "hero":
        if (entity.shape == "circle") {
          game.context.drawImage(entity.sprite,0,0,entity.sprite.width,entity.sprite.height,
              -entity.radius-1,-entity.radius-1,entity.radius*2+2,entity.radius*2+2); 
        } else if (entity.shape=="rectangle") {
          game.context.drawImage(entity.sprite,0,0,entity.sprite.width,entity.sprite.height,
              -entity.width/2-1,-entity.height/2-1,entity.width+2,entity.height+2);
        }
      break;
      case "ground":
      break;
    }

    game.context.rotate(-angle);
    game.context.translate(-position.x*box2d.scale+game.offsetLeft,-position.y*box2d.scale);
  }
};

// start box2d
var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2Fixture = Box2D.Dynamics.b2Fixture;
var b2World = Box2D.Dynamics.b2World;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

var box2d = {
  scale : 30,
  init : function(){
    var gravity = new b2Vec2(0,9.8);
    var allowSleep = true;
    box2d.world = new b2World(gravity, allowSleep);

    var debugContext = document.getElementById('debugcanvas').getContext('2d');
    var debugDraw = new b2DebugDraw();
    debugDraw.SetSprite(debugContext);
    debugDraw.SetDrawScale(box2d.scale);
    debugDraw.SetFillAlpha(0.3);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
    box2d.world.SetDebugDraw(debugDraw);

    var listener = new Box2D.Dynamics.b2ContactListener;
    listener.PostSolve = function(contact, impulse){
      var body1 = contact.GetFixtureA().GetBody();
      var body2 = contact.GetFixtureB().GetBody();
      var entity1 = body1.GetUserData();
      var entity2 = body2.GetUserData();

      var impulseAlongNormal = Math.abs(impulse.normalImpulses[0]);

      if(impulseAlongNormal>5){
        if(entity1.health){
          entity1.health -= impulseAlongNormal;
        }

        if(entity2.health){
          entity2.health -= impulseAlongNormal;
        }

        // 如果物体具有弹跳音，则播放他
        if(entity1.bounceSound){
          entity1.bounceSound.play();
        }
        if(entity2.bounceSound){
          entity2.bounceSound.play();
        }
      }
    };
    box2d.world.SetContactListener(listener);
  },

  createRectangle : function(entity, definition){
    var bodyDef = new b2BodyDef;
    if(entity.isStatic){
      bodyDef.type = b2Body.b2_staticBody;
    } else {
      bodyDef.type = b2Body.b2_dynamicBody;
    }

    bodyDef.position.x = entity.x / box2d.scale;
    bodyDef.position.y = entity.y / box2d.scale;
    if (entity.angle) {
      bodyDef.angle = Math.PI*entity.angle / 180;
    }

    var fixtureDef = new b2FixtureDef;
    fixtureDef.density = definition.density;
    fixtureDef.friction = definition.friction;
    fixtureDef.restitution = definition.restitution;

    fixtureDef.shape = new b2PolygonShape;
    fixtureDef.shape.SetAsBox(entity.width/2/box2d.scale, entity.height/2/box2d.scale);

    var body = box2d.world.CreateBody(bodyDef);
    body.SetUserData(entity);

    var fixture = body.CreateFixture(fixtureDef);
    return body;
  },

  createCircle : function(entity, definition){
    var bodyDef = new b2BodyDef;
    if (entity.isStatic){
      bodyDef.type = b2Body.b2_staticBody;
    } else {
      bodyDef.type = b2Body.b2_dynamicBody;
    }
    bodyDef.position.x = entity.x / box2d.scale;
    bodyDef.position.y = entity.y / box2d.scale;

    if(entity.angle){
      bodyDef.angle = Math.PI * entity.angle/180;
    }
    var fixtureDef = new b2FixtureDef;
    fixtureDef.density = definition.density;
    fixtureDef.friction = definition.friction;
    fixtureDef.restitution = definition.restitution;

    fixtureDef.shape = new b2CircleShape(entity.radius/box2d.scale);

    var body = box2d.world.CreateBody(bodyDef);
    body.SetUserData(entity);

    var fixture = body.CreateFixture(fixtureDef);
    return body;
  },

  step : function(timeStep) {
    box2d.world.Step(timeStep,8,3);
  },
}