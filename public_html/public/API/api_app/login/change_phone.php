<?php

    include("../../include/config.php");
    mysqli_query($mysqli,"SET NAMES 'utf8'");
	
	$oldPhone = $_POST['oldPhone'];
	$newPhone = $_POST['newPhone'];
	

    $verCode = mt_rand(100000, 999999);
    
    $msg = "تطبيق تداول العقاري: \r\n كود التفعيل: ".$verCode;
    
    
    $ch = curl_init();
        
    curl_setopt($ch, CURLOPT_URL, "https://www.msegat.com/gw/sendsms.php");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
    curl_setopt($ch, CURLOPT_HEADER, TRUE);
                
    curl_setopt($ch, CURLOPT_POST, TRUE);

$fields = <<<EOT
{
    "userName": "dosare1981",
    "numbers": "$newPhone",
    "userSender": "TADAWL.SA",
    "apiKey": "$tadawl_sms_api_key",
    "msg": "$msg"
}
EOT;
    
curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);
    
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
"Content-Type: application/json",));
    
$response = curl_exec($ch);
$info = curl_getinfo($ch);

if($response){
    $mysqli->query("UPDATE smartend_user SET verCode = '". $verCode."' where phone = '".$oldPhone."'");
    echo json_encode("successful");
} else {
    echo json_encode("error");
}

