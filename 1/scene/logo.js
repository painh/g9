var SceneLogo = function()
{
	var imgLogo;
	var fadeStartTime;
	var fadeMaxSec = 1 * 1000;
	var state = 3;
	
	this.Start = function()
	{
		imgLogo = ImageManager.Register( "./img/gosuni.png", "logo" );
		Renderer.clearColor = "rgba(255, 255, 255, 1)";
		Renderer.defaultColor = "rgba(0, 0, 0, 0.5)";
		fadeStartTime = g_cachedTime.getTime();		
	}

	this.End = function()
	{
	}

	this.Update = function()
	{
		if( g_cachedTime.getTime() - fadeStartTime > fadeMaxSec)				
		{
			fadeStartTime = g_cachedTime.getTime();
			
			
			state++;
		}
		
		var alpha =  (g_cachedTime.getTime() - fadeStartTime) / fadeMaxSec;
		
		if(alpha > 1.0)
			alpha = 1.0;
			
		if(alpha < 0)
			alpha = 0;
		
	
		switch(state)
		{
			case 0:
				alpha = 1.0 - alpha;
				Renderer.defaultColor = "rgba(255, 255, 255, " + alpha + ")";
				break;
				
			case 1:
				Renderer.defaultColor = "rgba(255, 255, 255, 0)";
				break;
				
			case 2:
				Renderer.defaultColor = "rgba(255, 255, 255, " + alpha + ")";
				break;
				
			case 3:
			default:
				SceneManager.SetNext( g_ingame );
				return;
		}
	}

	this.Render = function()
	{
		Renderer.Img( (Renderer.width - imgLogo.width) / 2 , (Renderer.height - imgLogo.height) / 2, imgLogo);
		Renderer.Rect( 0, 0, Renderer.width, Renderer.height);
	}
};
