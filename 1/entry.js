function PlaySound(id)
{
	if(createjs)
	    createjs.Sound.play(id);
}

$(document).ready(function()
{
	if(window.navigator.standalone == false && config['needInstall'])
	{
		$("#divInstallGuide").show();
		return;
	}

	var script = $("<script type='text/javascript' src = '"+config['jenginePath']+"/main.js' ></script>").appendTo('head');	
	script.attr( 'onLoad', function() { jengineStart() } );
	var script2 = $("<script type='text/javascript' src = 'http://code.createjs.com/soundjs-0.4.0.min.js' ></script>").appendTo('head');
	var handle = setInterval(function()
	{
		if(createjs == null)
			return;

//		clearInterval(handle);
//		if (!createjs.Sound.initializeDefaultPlugins()) { return; }

		var audioPath = "snd/";
		function getSrc(src)
		{
			return audioPath+src+".mp3|"+audioPath+src+".org";
		}

		var manifest = [
//			{id:"die", src:getSrc("male_scream_short")},
//			{id:"warrior_attack", src:getSrc("knife_impact_stab_head")},
//			{id:"fire_ball", src:getSrc("dragon_breathe_fire_001")},
//			{id:"normal_attack", src:getSrc("knife_slash_002")},
//			{id:"footstep", src:getSrc("work_boots_single_step_on_rock_salt")},
//			{id:"coinGet", src:getSrc("chocolate_coin_in_foil_wrapper_drop_on_table")},
//			{id:"coinOut", src:getSrc("50_and_20_pence_peice_coins_put_down_on_surface")}
// 
		]; 

		if(manifest.length > 0)
		{
//			createjs.Sound.addEventListener("loadComplete", function() {});
//			createjs.Sound.registerManifest(manifest);
		}
	}, 1000); 
} );

var g_logo;
var g_ingame;

function startGame()
{
//	include_css( config["srcPath"] + 'css/ui.css');
//
//	include_js(  config["srcPath"] + 'scene/effect.js' );
//	include_js(  config["srcPath"] + 'scene/object.js' );
//	include_js(  config["srcPath"] + 'scene/gui.js' );
//	include_js(  config["srcPath"] + 'scene/logo.js' );
//	include_js(  config["srcPath"] + 'scene/ingame2.js' );
//	
	var includeComplete = false;
	waitIncludeComplete( function()
	{
		g_logo		= new SceneLogo();
		g_ingame	= new SceneIngame();
		SceneManager.Add( g_logo );
		SceneManager.Add( g_ingame );
	} );
}
