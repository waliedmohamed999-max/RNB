<?php
 

$db_server="localhost"; # اسم السيرفر المستضيف لقاعدة البيانات في الغالب يتم تركها كما هيا
$db_name="blagatn_2030_app"; # اسم قاعدة البيانات
$db_username="blagatn_2030_app"; # اسم المستخدم لقاعدة البيانات
$db_password="B147852b@"; # كلمة المرور لقاعدة البيانات

$cookie_name_username = "username";
$cookie_name_password = "password";

$url_hraj = "https://blagat.sa/";
$number_tags_update = 1;

# Load secrets (e.g. TADAWL_SMS_API_KEY) from the .env file outside this web-servable directory.
require_once __DIR__ . '/../../../vendor/autoload.php';
try {
    if (file_exists(__DIR__ . '/../../../.env')) {
        $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../../');
        $dotenv->safeLoad();
    }
} catch (Throwable $e) {
    // Ignore malformed .env parsing errors here; fall back to an empty key below
    // rather than taking down this legacy endpoint.
}
$tadawl_sms_api_key = $_ENV['TADAWL_SMS_API_KEY'] ?? (getenv('TADAWL_SMS_API_KEY') ?: '');

############## لا تقم بتعديل شئ هنا ##########################
$mysqli = new mysqli("$db_server","$db_username","$db_password","$db_name");
############## لا تقم بتعديل شئ هنا ##########################

$color1_group = "C03";
$color2_group = "000";
$color3_group = "999";
$color4_group = "999";


 
?>
                            
                            
          