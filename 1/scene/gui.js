var Btn = function()
{
	this.x = 0;
	this.y = 0;
	this.width = 50;
	this.height = 50; 
	this.clickFunc;
	this.clicked = false;
	this.caption = 'button';
	this.captionColor = '#fff';
	this.eventReceiver;

	this.Render = function()
	{
		Renderer.SetColor("#000000"); 
		Renderer.SetAlpha(0.2);
		Renderer.Rect(this.x, this.y, this.width, this.height);
		Renderer.SetAlpha(1);
		Renderer.SetColor('#fff'); 
		Renderer.RectStroke(this.x, this.y, this.width, this.height);
		Renderer.SetColor(this.captionColor); 
		Renderer.Text(this.x, this.y, this.caption);
	}
	
	this.Update = function()
	{
		if( (MouseManager.x < this.x) ||
			(MouseManager.x >= this.x + this.width) ||
			(MouseManager.y < this.y) ||
			(MouseManager.y >= this.y + this.height) )
		{
			return;
		} 

		if(MouseManager.Clicked == true)
		{
			this.eventReceiver[this.clickFunc].call(this.eventReceiver, this);
			MouseManager.Clicked = false;
		}
	}
}

var BtnManager = function()
{
	this.list = [];
	this.visible = true;

	this.Add = function(x, y, width, height, caption, obj, clickFunc)
	{
		var btn = new Btn();
		btn.x = x;
		btn.y = y;
		btn.width = width;
		btn.height = height;
		btn.caption = caption;
		btn.eventReceiver = obj;
		btn.clickFunc = clickFunc; 

		this.list.push(btn);

		return btn;
	}

	this.Update = function()
	{
		if(this.visible == false)
			return;

		for(var i in this.list)
		{
			var item = this.list[i];
			item.Update();
		}
	}

	this.Render = function()
	{
		if(this.visible == false)
			return;

		for(var i in this.list)
		{
			var item = this.list[i];
			item.Render();
		}
	}

	this.Clear = function()
	{
		this.list = [];
	}
} 

