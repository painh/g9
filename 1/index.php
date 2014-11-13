<?php

$config = [];

$config["width"] = 320;
$config["height"] = 500;
$config['screenScale'] = 1;
$config["fps"] = 60;
$config["resLoadWaitTerm"] = 30;
$config["jenginePath"] = "../../jengine/";
$config["gameDivAlign"] = "center";
$config["srcPath"] = "./";
$config['showLogOnDebugger'] = true;
$config['showLogOnConsole'] = true;
$config['needInstall'] = false;
$config['title'] = 'tower rts';


$js_list = [
	$config["srcPath"].'scene/effect.js',
	$config["srcPath"].'scene/gui.js',
	$config["srcPath"].'scene/index.js',
	$config["srcPath"].'scene/logo.js'
];

$time = time();
echo <<< EOF
<!DOCTYPE html>
<html>
	<head profile="http://www.w3.org/2005/10/profile">
	<link rel="icon" type="image/png" href="img/57x57.png">
	<title>{$config['title']}</title>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, user-scalable=no">
	<meta name="apple-mobile-web-app-capable" content="yes">
	<link rel="apple-touch-icon-precomposed" href="img/57x57.png"/>
	<link href="style.css" rel="stylesheet" type="text/css"/>
	<script>
	var config = new Object;
EOF;
foreach($config as $key => $val)
	echo("config['{$key}'] = '{$val}';");
echo <<< EOF
		</script>
	</head>

	<body bgcolor="#000000">
		<div id="divInstallGuide" style='display:none;text-align:center'>
			사파리에서는 사운드 재생을 할 수 없습니다.</br></br> 
			<img src='img/webapp.png'/>을 눌러 설치하여 주세요.</br></br> 
			아이패드는 상단에, 아이폰은 하단에서 찾을 수 있습니다.  
		</div>
		<div id="game">
		</div>
        <script src="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>
		<script src="entry.js?time={$time}"></script>
EOF;

foreach($js_list as $val)
	echo "<script src='{$config['srcPath']}{$val}?time={$time}}'></script>";

echo <<< EOF
	</body>
</html>
EOF;
