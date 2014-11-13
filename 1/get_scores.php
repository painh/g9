<?php 
mysql_connect('localhost:/data/mysql/mysql.sock', 'painh');
mysql_select_db('painh_g_score');

$query = "SELECT * FROM record_g6_2 order by score desc limit 10";
$ret = mysql_query($query);
$list = [];
while($row = mysql_fetch_assoc($ret))
	$list[] = $row;

echo json_encode($list);
