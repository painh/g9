var Effect = function()
{
	var LIFE_TIME = 2000;

	this.Init = function(x, y, color, str, img, renderWidth, renderHeight)
	{
		this.x = x
		this.y = y;
		this.str = str;
		this.color = color;
		this.alpha = 1.0;
		this.bornTime = Renderer.currentTime;
		this.font = '8pt Arial';
		this.world = true;
		this.toTop = true;


		if(img) {
			this.img = img;
			if(renderWidth) {
				this.renderWidth = renderWidth;
				this.x -= this.renderWidth / 2;
			}
			else
				this.renderWidth = img.width;

			if(renderHeight) {
				this.renderHeight = renderHeight;
				this.y -= this.renderHeight / 2;
			}
			else
				this.renderHeight = img.height; 
		}
		else
			this.img = undefined;

	}

	this.Update = function()
	{
		if(Renderer.currentTime - this.bornTime > LIFE_TIME)
			return;

		this.alpha = 1.0 - ((Renderer.currentTime - this.bornTime) / LIFE_TIME);
		if(this.toTop)
			this.y -= 0.5;
	}

	this.Render = function()
	{
		if(Renderer.currentTime - this.bornTime > LIFE_TIME)
			return;

		Renderer.SetAlpha(this.alpha);

		var x = this.x;
		var y = this.y;
		if(this.world)
		{
			x -= g_cameraX;
			y -= g_cameraY;
		}

		if(this.img != undefined)
			Renderer.ImgBlt(x , y, this.img.img, 0, 0, this.img.width, this.img.height, this.renderWidth, this.renderHeight);

		if(this.str && this.str != "")
		{
			Renderer.SetFont(this.font);

			Renderer.SetColor("#000");
			var textWidth = Renderer.GetTextWidth(this.str); 
			Renderer.Rect(x, y, textWidth, Renderer.GetFontSize());
			Renderer.SetColor(this.color);
			Renderer.Text(x , y, this.str);
		}
	}
}


var EffectManager = function()
{
	this.list = [];
	this.effectIndex = 0;
	this.list.length = 50;

	for(var i = 0; i < this.list.length; ++i)
		this.list[i] = new Effect();

	this.Add = function(x, y, color, str, img, renderWidth, renderHeight)
	{
		this.effectIndex++;
		if(this.effectIndex >= this.list.length)
			this.effectIndex = 0; 

		this.list[this.effectIndex].Init(x, y, color, str, img, renderWidth, renderHeight);
		return this.list[this.effectIndex];
	} 

	this.Update = function()
	{
		for(var i = 0; i < this.list.length; ++i)
			this.list[i].Update();
	}

	this.Render = function()
	{
		for(var i = 0; i < this.list.length; ++i)
			this.list[i].Render();
	}

}


