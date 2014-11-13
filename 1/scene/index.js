var TILE_WIDTH = 53;
var TILE_HEIGHT = 53;
var MAX_LEVEL = 3;

var g_cameraX = 0;
var g_cameraY = 0;

var g_effectManager = new EffectManager();
var g_gameUI = new BtnManager();

var g_imgs = [];

var g_turnStart = false;

var g_holdObject = null;

var FLOOR_HEIGHT = 140;

var g_floorList = [];
var g_allHero = [];
var g_noJobHero = [];


var CHAR_WIDTH = 32;
var CHAR_HEIGHT = 32;
var BUILDING_WIDTH = 96;
var BUILDING_HEIGHT = 96;
var FACE_START = 20 * 5;
var BODY_START = FACE_START + 20;

var HEAD_MAX = 11;
var FACE_MAX = 13;
var BODY_MAX = 4;

var PORTAL_START = 4;
var PORTAL_BLOOD = 0;
var PORTAL_TREE = 1;
var PORTAL_GOLD = 2;
var PORTAL_RAINBOW = 3;

var FLOOR_GRAY = 0;
var FLOOR_GOLD = 1;
var FLOOR_TREE = 2;
var FLOOR_BLOOD = 3;

var ICON_GOLD = 9;
var ICON_TREE = 10;
var ICON_BLOOD = 11;
var ICON_ROCK = 12;

var g_gold = 0;
var g_tree = 0;
var g_blood = 0;
var g_rock = 2; 
var g_maxgold =		100;
var g_maxtree =		100;
var g_maxblood =	100; 
var g_maxrock = 6; 
var g_floorLevel = 0;
var g_heroCursor = 0;
var g_heroSelectedIDX = -1;

var BUILDING_GOLD = 0;
var BUILDING_TREE = 1;
var BUILDING_BLOOD = 2;

var NewObj = function(left)
{
	var obj = new Obj();
	head = randomRange(0, HEAD_MAX - 1);
	face = randomRange(0, FACE_MAX - 1);
	body = randomRange(0, BODY_MAX - 1);
	obj.head = head;
	obj.face = face;
	obj.body = body;
	obj.flip = !left;
	obj.left = left;
	obj.where ='n';

	return obj;
}

var Obj = function()
{
	this.renderx = 0;
	this.rendery = 0;
	this.head = 0;
	this.face = 0;
	this.body = 0;
	this.floor;
	this.left = true;
	this.hp = 3;
	this.level = 1;
	this.dead = false;
	this.lastUpdateSec = g_now; 
	this.where = 'u';

	this.Render = function()
	{
		var img = g_imgs['char'];
		var rx = this.renderx - g_cameraX;
		var ry = this.rendery - g_cameraY;

		var headpos = parseInt(g_now.getTime() / 1000) % 2;
		if(this.flip)
		{
			Renderer.ImgFlipH(rx, ry, img.img, CHAR_WIDTH, CHAR_HEIGHT, BODY_START + this.body);
			Renderer.ImgFlipH(rx, ry + headpos, img.img, CHAR_WIDTH, CHAR_HEIGHT, FACE_START + this.face);
			Renderer.ImgFlipH(rx, ry + headpos, img.img, CHAR_WIDTH, CHAR_HEIGHT, this.head);
		}
		else
		{
			Renderer.Img(rx, ry, img.img, CHAR_WIDTH, CHAR_HEIGHT, BODY_START + this.body);
			Renderer.Img(rx, ry + headpos, img.img, CHAR_WIDTH, CHAR_HEIGHT, FACE_START + this.face);
			Renderer.Img(rx, ry + headpos, img.img, CHAR_WIDTH, CHAR_HEIGHT, this.head);
		}

		Renderer.SetFont('8pt Arial'); 
		Renderer.SetColor('#fff'); 
		if(this.hp <= 0)
			Renderer.Text(rx, ry - 5, '기절함'); 
		else
			Renderer.Text(rx, ry - 5, this.hp); 

	} 

	this.Update = function()
	{
		if(this.hp <= 0 && this.left == false)
		{
			this.dead = true;
			return;
		}

		if(this.hp <= 0)
			return;

		if(g_now - this.lastUpdateSec < 1000)
			return;

		this.lastUpdateSec = g_now; 

		var list = this.floor.GetOtherObjList(this);

		if(list.length > 0)
		{
			for(var i in list)
			{
				var obj = list[i];
				if(obj.hp <= 0)
					continue;

				obj.hp -= this.level;	
				g_effectManager.Add(obj.renderx, obj.rendery, "#ff0000", "-"+this.level);
			}
			return;
		}


		if(this.floor.resMax > 0 && this.left == true)
		{
			switch(this.floor.type)
			{
				case FLOOR_GRAY:
					break;
				case FLOOR_GOLD:
					if(g_gold < g_maxgold)
					{
						g_gold += this.level;
						g_effectManager.Add(this.renderx, this.rendery, "#ff0", "+"+this.level+" 골드"); 
						this.floor.resMax-=this.level;
					}
					break;
				case FLOOR_TREE:
					if(g_tree < g_maxtree)
					{
						g_tree+=this.level;
						g_effectManager.Add(this.renderx, this.rendery, "#0f0", "+"+this.level+" 나무"); 
						this.floor.resMax-=this.level;
					}
					break;
				case FLOOR_BLOOD:
					if(g_blood < g_maxblood)
					{
						g_blood+=this.level;
						g_effectManager.Add(this.renderx, this.rendery, "#f00", "+"+this.level+" 혈액"); 
						this.floor.resMax-=this.level;
					}
					break;
			} 
		}
	}
}

var Floor = function(floor, type,inColor, outColor, regenTime, resMax)
{
	this.floor = floor;
	this.type = type;
	this.objList = [];
	this.inColor = inColor;
	this.outColor = outColor;
	this.regenTime = regenTime;
	this.lastRegenTime = g_now;
	this.locked = false;
	this.resMax = resMax;
	this.level = 1;
	this.building = [];

	this.GetLeftList = function()
	{
		var list = [];
		for(var i in this.objList)
		{ 
			if(this.objList[i].left)
				list.push(this.objList[i]);
		}

		return list;
	}

	this.GetOtherObjList = function(obj)
	{
		var cnt = 0;
		var list = [];
		for(var i in this.objList)
		{ 
			if(this.objList[i].left != obj.left)
				list.push(this.objList[i]);
		}

		return list;
	}

	this.GetObjCnt = function(left)
	{
		var cnt = 0;
		for(var i in this.objList)
		{ 
			if(this.objList[i].left == left)
				cnt++;
		}

		return cnt;
	}

	this.AddObj = function(obj)
	{
		obj.rendery = this.floor * FLOOR_HEIGHT + FLOOR_HEIGHT - CHAR_HEIGHT - 3;
		obj.floor = this;
		obj.where = this.floor;
		this.objList.push(obj);

		if(obj.left)
			obj.renderx = 160 - CHAR_WIDTH * this.GetObjCnt(obj.left);
		else
			obj.renderx = 160 + CHAR_WIDTH * (this.GetObjCnt(!obj.left)- 1);

		return obj;
	}

	this.NewObj = function(left)
	{
		var obj = NewObj(left);

		this.AddObj(obj);
		return obj;
	}

	this.Render = function()
	{
		var y = this.floor * FLOOR_HEIGHT;
		var renderY = y - g_cameraY;
		if(renderY < -FLOOR_HEIGHT)
			return;

		if(renderY > Renderer.height)
			return;

		Renderer.Img(0,renderY, g_imgs['bg' + parseInt(this.type + 1)].img);
		for(var i in this.building) 
			Renderer.Img(10 + i * (BUILDING_WIDTH + 10), renderY + FLOOR_HEIGHT - BUILDING_HEIGHT - 5, g_imgs['building'].img, BUILDING_WIDTH, BUILDING_HEIGHT, 2 + this.building[i]);

		for(var i in this.objList)
		{
			var obj = this.objList[i];
			obj.Render();
		}

		if(this.locked)
		{
			Renderer.SetColor("#000");
			Renderer.SetAlpha(0.8);
			Renderer.Rect(0, renderY, Renderer.width, FLOOR_HEIGHT); 
			Renderer.SetColor("#fff");
			Renderer.SetAlpha(1);
			Renderer.Text(0,renderY, "미개척지");
		}
		else
		{
			Renderer.SetColor("#fff");
			Renderer.Text(0,renderY, this.floor);
			if(this.type != FLOOR_GRAY)
			{
				Renderer.SetFont('15pt Arial'); 
				Renderer.Text(Renderer.width - 130 ,renderY + FLOOR_HEIGHT / 2, '남은 자원 ' + this.resMax);
			}

			Renderer.SetFont('8pt Arial'); 

			var img = g_imgs['icons'];
			Renderer.Img(0, renderY + FLOOR_HEIGHT - CHAR_HEIGHT, img.img, CHAR_WIDTH, CHAR_HEIGHT, PORTAL_START + this.inColor);
			Renderer.Img(Renderer.width - CHAR_WIDTH, renderY + FLOOR_HEIGHT - CHAR_HEIGHT, img.img, CHAR_WIDTH, CHAR_HEIGHT, PORTAL_START + this.outColor);

			var widthmax = 100;
			var width = Math.min( ((g_now - this.lastRegenTime) / this.regenTime * widthmax), widthmax);
			Renderer.SetColor("#f00");
			Renderer.Rect(Renderer.width - widthmax, renderY + 10, width, 10);

		} 
	} 

	this.Update = function()
	{
		if(this.locked)
			return;

		var deadList = [];
		var rightCnt = this.GetObjCnt(false);
		for(var i in this.objList)
		{
			var obj = this.objList[i];
			obj.Update();
			if(obj.dead)
				deadList.push(obj);
		} 
		
		for(var i in deadList)
			removeFromList(this.objList, deadList[i]);

		if(this.GetObjCnt(false) == 0 && g_now - this.lastRegenTime > this.regenTime )
		{
			this.lastRegenTime = g_now;
			this.NewObj(false);
		}

		if(this.resMax == 0)
			this.type = FLOOR_GRAY;
	}
}

var SceneIngame = function() { 
	this.scrollVal = 0;
	this.temp = 0;
	this.pickFloor = 0;
	this.clickFloor = -1;
	this.clickY = 0;

	this.LoadImg = function(name, img, width, height) {
		g_imgs[name] = {};
		g_imgs[name].img = ImageManager.Register( "assets/"+img, name, true);
		g_imgs[name].width = width;
		g_imgs[name].height = height;

		return g_imgs[name];
	}

	this.AddFloor = function()
	{
		g_floorLevel++;
		var idx = g_floorList.length;
		g_floorList.push(new Floor(idx, randomRange(FLOOR_GOLD, FLOOR_BLOOD), randomRange(PORTAL_BLOOD, PORTAL_GOLD), randomRange(PORTAL_BLOOD, PORTAL_GOLD), randomRange(1000 * 3, 1000 * 10), randomRange(10, 30)));
//		g_floorList[idx].AddObj(randomRange(0, HEAD_MAX - 1), randomRange(0, FACE_MAX - 1), randomRange(0, BODY_MAX - 1), true); 
		g_floorList[idx].locked = true;
		g_floorList[idx].level = g_floorLevel;
		return g_floorList[idx];
	}

	this.Start = function() { 
		this.LoadImg('bg1', 'bg1.png',  320, 140); 
		this.LoadImg('bg2', 'bg2.png',  320, 140); 
		this.LoadImg('bg3', 'bg3.png',  320, 140); 
		this.LoadImg('bg4', 'bg4.png',  320, 140); 

		this.LoadImg('char', 'char.png',  640, 480); 
		this.LoadImg('icons', 'icons.png',  640, 480); 
		this.LoadImg('building', 'buildings.png',  640, 480); 

		console.log('start!');
		Renderer.defaultColor = "#000"; 

		var idx = g_floorList.length;
		g_floorList.push(new Floor(idx, FLOOR_GOLD, PORTAL_BLOOD, PORTAL_TREE, 5 * 1000, 100));
		obj = g_floorList[idx].NewObj(true); 
		obj.hp = 50;

		idx = g_floorList.length;
		g_floorList.push(new Floor(idx, FLOOR_TREE, PORTAL_GOLD, PORTAL_BLOOD, 5 * 1000, 30));
		obj = g_floorList[idx].NewObj(true); 
		obj.hp = 50;

		idx = g_floorList.length;
		g_floorList.push(new Floor(idx, FLOOR_BLOOD, PORTAL_GOLD, PORTAL_TREE, 5 * 1000, 3));
		obj = g_floorList[idx].NewObj(true); 
		obj.hp = 50;

		g_floorLevel = 0;
//		g_gold = 10;
//		g_tree = 10;
//		g_blood = 10;

		this.AddFloor();

		g_gameUI.Add(Renderer.width - 40, 0, 40, 20, "닫기", this, "onClickClose");
		g_gameUI.Add(0, 40, 40, 40,  "해금", this, "onClickFloorRelease");
//		g_gameUI.Add(60, 40, 40, 40,  "파괴", this, "onClickFloorDestroy"); 
		g_gameUI.Add(120, 40, 40, 40,  "고용", this, "onClickHeroGacha"); 

		g_gameUI.Add(60, 200, 40, 40,  "소환", this, "onClickFloorSummon");
		g_gameUI.Add(100, 200, 40, 40,  "갈기", this, "onClickHeroToBlood");
		g_gameUI.Add(140, 200, 40, 40,  "물약", this, "onClickHeroPotion");
		g_gameUI.Add(180, 200, 40, 40,  "회복", this, "onClickHeroRebirth");

		g_gameUI.Add(10,  300, 100, 40,  "골드 최대+", this, "onClickBuildGold");
		g_gameUI.Add(110, 300, 100, 40,  "나무 최대+", this, "onClickBuildTree");
		g_gameUI.Add(210, 300, 100, 40,  "혈액 최대 +", this, "onClickBuildBlood");
	}

	this.End = function() {
	} 

	this.UpdateGames = function() {
		if(this.state == 'gameOver')
			return; 
	} 

	this.onClickBuildGold = function()
	{
		var floor = g_floorList[this.clickFloor];
		if(floor.locked)
		{
			alert('잠긴 층엔 건물을 만들 수 없습니다.');
			return;
		}

		if(floor.resMax != 0)
		{
			alert('자원이 고갈되지 않은 층엔 건물을 세울 수 없습니다.');
			return;
		}

		if(floor.building.length >= 3)
		{
			alert('건물은 한 층에 3개만 세울 수 있습니다.');
			return; 
		}

//		if(g_rock < 1 )
//		{
//			alert('건물을 짓기 위해서는 ' + 1 + '만큼의 바위가 필요합니다.');
//			return; 
//		}
//
		if(g_gold < g_maxgold)
		{
			alert('건물을 짓기 위해서는 ' + g_maxgold + '만큼의 골드가 필요합니다.');
			return; 
		}

		if(!confirm('골드를 ' + g_maxgold + " 만큼 사용하여, 최대치를 10 늘립니다."))
			return;

		g_maxgold += 10;
//		g_rock--;
		g_gold = 0; 
		alert('골드 최대치가 10 늘어났습니다.');
		this.clickFloor = -1;

		floor.building.push(BUILDING_GOLD);
	}

	this.onClickBuildTree = function()
	{
		var floor = g_floorList[this.clickFloor];
		if(floor.locked)
		{
			alert('잠긴 층엔 건물을 만들 수 없습니다.');
			return;
		}

		if(floor.resMax != 0)
		{
			alert('자원이 고갈되지 않은 층엔 건물을 세울 수 없습니다.');
			return;
		}

		if(floor.building.length >= 3)
		{
			alert('건물은 한 층에 3개만 세울 수 있습니다.');
			return; 
		}

		if(g_rock < 1 )
		{
			alert('건물을 짓기 위해서는 ' + 1 + '만큼의 바위가 필요합니다.');
			return; 
		}

		if(g_tree < g_maxtree)
		{
			alert('건물을 짓기 위해서는 ' + g_maxtree + '만큼의 나무가 필요합니다.');
			return; 
		}

		if(!confirm('나무를 ' + g_maxtree + " 만큼 사용하여, 최대치를 10 늘립니다."))
			return;

		g_maxtree += 10;
		g_rock--;
		g_tree = 0; 
		alert('나무 최대치가 10 늘어났습니다.');
		this.clickFloor = -1;

		floor.building.push(BUILDING_TREE);
	}

	this.onClickBuildBlood = function()
	{
		var floor = g_floorList[this.clickFloor];
		if(floor.locked)
		{
			alert('잠긴 층엔 건물을 만들 수 없습니다.');
			return;
		}

		if(floor.resMax != 0)
		{
			alert('자원이 고갈되지 않은 층엔 건물을 세울 수 없습니다.');
			return;
		}

		if(floor.building.length >= 3)
		{
			alert('건물은 한 층에 3개만 세울 수 있습니다.');
			return; 
		}

		if(g_rock < 1 )
		{
			alert('건물을 짓기 위해서는 ' + 1 + '만큼의 바위가 필요합니다.');
			return; 
		}

		if(g_blood < g_maxblood)
		{
			alert('건물을 짓기 위해서는 ' + g_maxblood + '만큼의 혈액이 필요합니다.');
			return; 
		}

		if(!confirm('혈액을' + g_maxblood + " 만큼 사용하여, 최대치를 10 늘립니다."))
			return;

		g_maxblood += 10;
		g_blood = 0; 
		g_rock--;
		alert('혈액 최대치가 10 늘어났습니다.');
		this.clickFloor = -1;

		floor.building.push(BUILDING_BLOOD);
	}


	this.onClickClose = function()
	{
		this.clickFloor = -1;
	}

	this.onClickFloorRelease = function()
	{
		var needTree = 10 + g_floorLevel;

		if(g_tree >= needTree)
		{
			if(confirm('나무 자원이 ' + needTree + '개 필요합니다. 사용 할까요?'))
			{
				g_floorList[this.clickFloor].locked = false;
				g_tree -= needTree;
				this.AddFloor();
			} 
		}
		else
		{
			alert('나무 자원이 ' +needTree + '개 필요합니다.');
		}
		this.clickFloor = -1;
	}

	this.onClickHeroGacha = function()
	{
		var level = prompt("고용할 영웅의 레벨을 입력 해 주세요(1~3)\n영웅 가격 = 레벨 x 2혈액", "1");

		if (level == null) 
			return;

		level = parseInt(level);

		if(level < 0 || level > 3)
			return;

		var obj = NewObj(true);
		obj.level = parseInt(level);
		obj.hp = 50;

		g_allHero.push(obj);
		alert('레벨 '+level + '의 영웅을 고용하였습니다.'); 
	}

	this.onClickFloorSummon = function()
	{
		var obj = g_allHero[g_heroSelectedIDX];
		var floor = g_floorList[this.clickFloor];
		if(!obj)
		{
			alert('영웅을 선택 해 주세요');
			return; 
		}
		if(floor.locked)
		{
			alert('잠긴 층엔 소환 할 수 없습니다.');
			return;
		}

		if(floor.GetLeftList().length != 0)
		{
			alert('영웅은 한 층에 한명만 입장 할 수 있습니다.');
			return; 
		}

		g_allHero.splice(g_heroSelectedIDX,1); 
		if(obj.floor)
			removeFromList(obj.floor.objList, obj);
		floor.AddObj(obj); 
		g_heroSelectedIDX = -1;
		alert('영웅을 이동하였습니다.');
		this.clickFloor = -1;
	}

	this.onClickHeroPotion = function()
	{
		var obj = g_allHero[g_heroSelectedIDX];
		var floor = g_floorList[this.clickFloor];
		if(!obj)
		{
			alert('영웅을 선택 해 주세요');
			return; 
		}

		if(obj.hp <= 0 )
		{
			alert('기절한 영웅에겐 사용 할 수 없습니다.');
			return;
		}

		if(g_gold <= 10 )
		{
			alert('10의 골드가 필요합니다');
			return;
		}

		if(!confirm('영웅의 hp를 10 올리며, 골드를 10 차감합니다.' ))
			return;
		
		obj.hp += 10;
		g_gold -= 10;
		alert('영웅의 hp가 10 증가하였습니다.'); 
		this.clickFloor = -1;
	}

	this.onClickHeroRebirth = function()
	{
		var obj = g_allHero[g_heroSelectedIDX];
		var floor = g_floorList[this.clickFloor];
		if(!obj)
		{
			alert('영웅을 선택 해 주세요');
			return; 
		}

		if(obj.hp > 0 )
		{
			alert('기절하지 않은 영웅에겐 사용 할 수 없습니다.');
			return;
		}

		if(g_gold <= 30 )
		{
			alert('30의 골드가 필요합니다');
			return;
		}

		if(!confirm('영웅을 기절 상태에서 회복시키며, 10의 hp를 부여합니다. 30의 골드를 소모합니다.' ))
			return;
		
		obj.hp = 10;
		g_gold -= 30;
		alert('영웅이 회복되었습니다.'); 
		this.clickFloor = -1;
	}


	this.onClickHeroToBlood = function()
	{
		var obj = g_allHero[g_heroSelectedIDX];
		var floor = g_floorList[this.clickFloor];
		if(!obj)
		{
			alert('영웅을 선택 해 주세요');
			return; 
		}

		var getBlood = Math.round(obj.level);
		if(!confirm('레벨 ' + obj.level + '의 영웅을 분해하여 혈액 ' + getBlood +'를 얻습니다.' ))
			return;

		g_allHero.splice(g_heroSelectedIDX,1); 
		removeFromList(obj.floor.objList, obj);
		g_heroSelectedIDX = -1;

		g_blood += getBlood;
		alert('혈액 ' + getBlood +'를 얻었습니다.');
		this.clickFloor = -1;
	}

	this.onClickFloorDestroy = function()
	{
		var floor = g_floorList[this.clickFloor];
		if(floor.locked)
		{
			alert('잠긴 층은 부술 수 없습니다.');
			return;
		}

		if(floor.resMax != 0)
		{
			alert('자원이 고갈되지 않은 층은 부술 수 없습니다.');
			return;
		}
		if(!confirm('해당 층을 파괴하고, 층에 위치한 영웅을 회수합니다. 또한 바위 ' + floor.level + '를 얻습니다.' ))
			return;

		g_floorList.splice(this.clickFloor,1);
		for(var i in g_floorList)
			g_floorList[i].floor = i;

		this.clickFloor = -1; 
		g_rock += floor.level;
		var heroList = floor.GetLeftList();

		for(var i in heroList)
		{
			var obj = heroList[i];
			obj.where = 'n';
			g_noJobHero.push(obj); 
		}
		alert('층을 파괴하였습니다. 바위를 '+floor.level+' 얻었습니다.'); 
		this.clickFloor = -1;
	}


	this.UpdateFloorUI = function()
	{
		g_gameUI.Update();

		var ry = 100;
		var selectedIDX = -1;
		for(var i = g_heroCursor; i < g_heroCursor + 5; ++i)
		{
			if(i >= g_allHero.length)
				break;

			var obj = g_allHero[i];
			var rx = 60 + i * CHAR_WIDTH;
			var headpos = parseInt(g_now.getTime() / 1000) % 2;

			if(MouseManager.Clicked && MouseManager.x >= rx && MouseManager.x < rx + CHAR_WIDTH &&
			  MouseManager.y >= ry && MouseManager.y < ry + CHAR_HEIGHT)
			{
				selectedIDX = i;
			}
		}

		if(selectedIDX == -1)
			return; 

		g_heroSelectedIDX = selectedIDX;

	}

	this.RenderFloorUI = function()
	{
		Renderer.SetAlpha(0.9); 
		Renderer.SetColor("#000");
		Renderer.Rect(0,20,Renderer.width, Renderer.height);
		Renderer.Rect(Renderer.width - 40, 0, 40, 20);
		g_gameUI.Render();
		var ry = 100;
		var img = g_imgs['char'].img;

		for(var i = g_heroCursor; i < g_heroCursor + 5; ++i)
		{
			if(i >= g_allHero.length)
				break;

			var obj = g_allHero[i];
			var rx = 60 + i * CHAR_WIDTH;
			var headpos = parseInt(g_now.getTime() / 1000) % 2;

			Renderer.Img(rx, ry, img, CHAR_WIDTH, CHAR_HEIGHT, BODY_START + obj.body);
			Renderer.Img(rx, ry + headpos, img, CHAR_WIDTH, CHAR_HEIGHT, FACE_START + obj.face);
			Renderer.Img(rx, ry + headpos, img, CHAR_WIDTH, CHAR_HEIGHT, obj.head);
			Renderer.Text(rx, ry + CHAR_HEIGHT, obj.where);
		}

		if(g_heroSelectedIDX == -1)
			return; 

		var obj = g_allHero[g_heroSelectedIDX];
		Renderer.Text(60, 160, '위치 :' +obj.where);	 Renderer.Text(140, 160, 'hp :' +obj.hp);
		Renderer.Text(60, 180, '레벨 :' +obj.level);
	}
	
	this.Update = function()
	{ 
		this.UpdateGames(); 
		if(this.clickFloor != -1)
		{ 
			this.UpdateFloorUI(); 
			return;
		}
		g_effectManager.Update(); 

		var intercept = false;
		for(var i in g_floorList)
		{
			var floor = g_floorList[i];
			if(floor.Update())
				intercept = true;
		}

		g_gold = Math.min(g_gold, g_maxgold);
		g_blood = Math.min(g_blood, g_maxblood);
		g_tree = Math.min(g_tree, g_maxtree);

		if(!intercept)
		{
			var d = MouseManager.y - MouseManager.prey;	

			var preCamearY = g_cameraY;

			if(MouseManager.LDown)
			{
				var realY = g_cameraY + MouseManager.y;
				this.pickFloor = parseInt(realY / FLOOR_HEIGHT);
				this.temp = Math.abs(d);
				this.temp1 = MouseManager.y;
				this.temp2 = MouseManager.prey;
				if(Math.abs(d) > 20)
				{
					if(d > 0)
						this.scrollVal = -60;
					else
						this.scrollVal = 60;
				}
				else
					this.scrollVal = -d; 

			}

			if(this.scrollVal > 0)
				this.scrollVal--;

			if(this.scrollVal < 0)
				this.scrollVal++;

			if(MouseManager.Clicked)
			{
				this.clickY = MouseManager.y;
				this.clickFloor = -1;
			}

			if(MouseManager.Upped && Math.abs(MouseManager.y - this.clickY) < 5 )
			{
				var realY = g_cameraY + MouseManager.y;
				this.clickFloor = parseInt(realY / FLOOR_HEIGHT);
				if(this.clickFloor < 0 ||
					this.clickFloor >= g_floorList.length)
						this.clickFloor = -1;

				if(this.clickFloor != -1)
					this.FloorSelected();
			}
			g_cameraY += this.scrollVal; 
			g_cameraY = Math.max(0, g_cameraY);
			g_cameraY = Math.min(g_floorList.length * FLOOR_HEIGHT - Renderer.height, g_cameraY);
	//		if(g_cameraY > 
		}

	}

	this.FloorSelected = function()
	{
		var floor = g_floorList[this.clickFloor];
		g_allHero = [];
		g_heroCursor = 0;
		var list = floor.GetLeftList();
		for(var j in list)
		{
			var obj = list[j];
			g_allHero.push(obj);
		}

		for(var i in g_noJobHero)
		{
			for(var j in g_noJobHero)
			{
				var obj = g_noJobHero[j];
				g_allHero.push(obj);
			}
		}

		g_heroSelectedIDX = -1;
	}

	this.Render = function()
	{
		Renderer.SetAlpha(1.0); 
		Renderer.SetColor("#000");
		Renderer.Rect(0,0,Renderer.width, Renderer.height);

		for(var i in g_floorList)
		{
			var floor = g_floorList[i];
			floor.Render();
		}

		g_effectManager.Render(); 

		Renderer.SetAlpha(1.0); 
		Renderer.SetFont('15pt Arial'); 
		Renderer.SetColor("#fff");

		Renderer.Img(0, 0, g_imgs['icons'].img, CHAR_WIDTH, CHAR_HEIGHT, ICON_GOLD);
		Renderer.Text(CHAR_WIDTH,0,g_gold+"/"+g_maxgold);

		Renderer.Img(80, 0, g_imgs['icons'].img, CHAR_WIDTH, CHAR_HEIGHT, ICON_TREE);
		Renderer.Text(80 + CHAR_WIDTH,0,g_tree+"/"+g_maxtree);

		Renderer.Img(160, 0, g_imgs['icons'].img, CHAR_WIDTH, CHAR_HEIGHT, ICON_BLOOD);
		Renderer.Text(160 + CHAR_WIDTH,0,g_blood+"/"+g_maxblood);

///		Renderer.Img(240, 0, g_imgs['icons'].img, CHAR_WIDTH, CHAR_HEIGHT, ICON_ROCK);
///		Renderer.Text(240 + CHAR_WIDTH,0,g_rock+"/"+g_maxrock);
//		Renderer.SetAlpha(1); 
//		Renderer.SetColor("#fff");
//		Renderer.SetFont('15pt Arial'); 
//		Renderer.Text(0,0,g_cameraY + "," + this.scrollVal + "," + this.temp);
//		Renderer.Text(0,20, this.temp1 + "," + this.temp2 + "," + MouseManager.LDown);
//		Renderer.Text(0,40, this.pickFloor + "," + this.clickFloor );

		if(this.clickFloor != -1)
		{ 
			this.RenderFloorUI(); 
			return;
		}
//
		if(this.state == "gameOver") {
			Renderer.SetAlpha(0.5); 
			Renderer.SetColor("#000");
			Renderer.Rect(0,0,Renderer.width, Renderer.height);
			Renderer.SetFont('15pt Arial'); 
			Renderer.SetColor("#fff");
			Renderer.Text(130,20,"게임 오버!");
			Renderer.Text(40,50,"플레이 해주셔서 감사합니다!");
			Renderer.Text(20,100  , "순위");
			Renderer.Text(80,100  , "점수");
			Renderer.Text(140,100 , "높이");
			Renderer.Text(200,100 , "이름");
			for(var i in g_score_list) {
				var item = g_score_list[i];
				var curLine = 100 + (parseInt(i)+1) * 30;
				Renderer.Text(20, curLine, parseInt(i)+1);
				Renderer.Text(80, curLine, item.score);
				Renderer.Text(140, curLine, item.height);
				Renderer.Text(200, curLine, item.player);
			}
		} else {
		} 
	} 
};
