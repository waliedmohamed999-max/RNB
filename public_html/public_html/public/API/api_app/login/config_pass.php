<?php

    include("../../include/config.php");
    mysqli_query($mysqli,"SET NAMES 'utf8'");
	
	$auth_key = $_POST['auth_key'];
//$pattern = "/aSdFgHjKl12345678dfe34asAFS$%^sfsdfcxjhASFCX90QwErT@/i";

if($auth_key == "aSdFgHjKl12345678dfe34asAFS%^sfsdfcxjhASFCX90QwErT@") {
    
	$phone = $_POST['phone'];
	$password = $_POST['password'];
	$rePassword = $_POST['rePassword'];
	//$verCode = $_POST['verCode'];

    $queryResult=$mysqli->query("SELECT * FROM smartend_user Where phone='".$phone."'");
    
    $result=array();
    
    while($fetchData=$queryResult->fetch_assoc()){
    	$result[]=$fetchData;
    	
    }
    
    if($result[0]>1) {
        
        
        if($password != $rePassword) {
        echo json_encode("nomatch");
        
    } else {
        
        
        foreach ($result as $res)  {
            // hash pass (9-8-2021)
            $hashedPass = password_hash($password, PASSWORD_BCRYPT);
            $mysqli->query("UPDATE smartend_user SET password='".$hashedPass."',rePassword='".$hashedPass."' WHERE phone=". $phone);
            
            
            
            
            
$msg = "نتشرف بك كشريك معنا بنجاحك  \r\n  تطبيق تداول العقاري";
    
    
$ch = curl_init();
        
curl_setopt($ch, CURLOPT_URL, "https://www.msegat.com/gw/sendsms.php");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
curl_setopt($ch, CURLOPT_HEADER, TRUE);
            
curl_setopt($ch, CURLOPT_POST, TRUE);
    
$fields = <<<EOT
{
    "userName": "dosare1981",
    "numbers": "$phone",
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
        
            echo json_encode("successful");
      
        }  
        
    }
        
    }
    else {
        echo json_encode("error");
    }
	
	

} else {
    
}	
	

?>