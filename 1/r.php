<?php 
$keys = '';
$values = '';
foreach($_REQUEST as $key => $value)
{
	$keys .= "`".$key."`,";
	$values .= "'".$value."',";
}
mysql_connect('localhost:/data/mysql/mysql.sock', 'painh');
error_log(mysql_error());
mysql_select_db('painh_g_score');
error_log(mysql_error());
$query = "INSERT INTO record_g6_2($keys reg_date) VALUES ($values now())";
mysql_query($query);
error_log(mysql_error());
echo json_encode($query);
