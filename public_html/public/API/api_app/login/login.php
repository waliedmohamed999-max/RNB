<?php
include("../../include/config.php");
mysqli_query($mysqli,"SET NAMES 'utf8'");

$phone = $_POST['phone'];
$password = $_POST['password'];

// $x = password_hash($password, PASSWORD_BCRYPT);
// echo $x;




$queryResult=$mysqli->query("SELECT * FROM smartend_user Where phone='".$phone."'");

$result=array();

while($fetchData=$queryResult->fetch_assoc()){
	$result[]=$fetchData;
	
}

if($result[0]>1) 
{
    foreach ($result as $res)  {
        if(password_verify($password, $res['password']) == false )
        //if($res['password'] != $password) 
        {
           echo json_encode("false");
        } 
        else 
        {
            if($res['verified'] == 1) 
            {
                echo json_encode("successful");
            }
            else 
            {
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
    
    
    if(!$response){
        echo json_encode("error messages");
        
    }else{
        
        $mysqli->query("UPDATE smartend_user SET verCode='".$verCode."', verified='0' WHERE phone=". $phone);
    
    
        echo json_encode("not verified");
        
        
        curl_close($ch);
        
}
}
}
}
}
else
{
    echo json_encode("error");
}


?>