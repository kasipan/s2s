/*
 * based on WebSocketServer.ino
 *
 *  from esp32 to web test
 *
 */
#include <Arduino.h>

#include <WiFi.h>
#include <WiFiMulti.h>    // 2.4GHz帯のESP32と5GHz帯のPC&Hueつなぐために必要くさい

#include <HTTPClient.h>
#include <WebSocketsServer.h>
#include <Arduino_JSON.h>


WiFiMulti wifiMulti;

WebSocketsServer webSocket = WebSocketsServer(81);

#define STASSID "---3L---"
#define STAPSK  "12345678"


const int DIN_PIN_1 = 19;   // 香り１の蓋
const int DIN_PIN_2 = 21;   // 香り２の蓋
const int DIN_PIN_3 = 32;   // 香り３の蓋（予備）
int last_touched_scent = 0;  // should be 1-2(3)


// Hue API連携周り設定
// 参照：https://developers.meethue.com/develop/get-started-2/
const String HUE_BRIDGE_IP = "192.168.3.221";   // hue bridgeのIP、スマホアプリで確認
const String HUE_USERNAME = "QOoJi2gLOs9dP0YyAiX1OBund7vPnWSeSmoxbMV0";   // api/newdeveloperで作成したuserID
const String HUE_APIURL_ACTION = "http://" + HUE_BRIDGE_IP + "/api/" + HUE_USERNAME + "/groups/4/action";  // api/groups/action、2Fsoloグループのlightsをscene指定で更新する、参照するsceneIDは下記scenesAPIで取得
const String HUE_APIURL_SCENES = "http://" + HUE_BRIDGE_IP + "/api/" + HUE_USERNAME + "/scenes";  // /api/USER_ID/scenes. get all scenes

// 各シーン（色のプリセット）
String hue_scene_ids[3];
String hue_scent_names[3];
String hue_colors[3];
//hue_scene_id[0]= "yTrlTC8lE4TDA-Q";    // デフォルトの暖色カラー設定
//hue_scene_id[1] = "DFB1kcXglRuw2RU";    // 1つめの香り用
//hue_scene_id[2] = "cw0NWvzK-pQXLN4";    // 2つめの香り用
const String HUE_SCENE_ID_DEFAULT = "yTrlTC8lE4TDA-Q";    // デフォルトの暖色カラー設定
const String HUE_SCENE_ID_1 = "DFB1kcXglRuw2RU";    // 1つめの香り用
const String HUE_SCENE_ID_2 = "cw0NWvzK-pQXLN4";    // 2つめの香り用
const String HUE_SCENE_ID_3 = "7uQWs8dx0e8CWuU";    // 予備の3つ目の設定


String hue_scene_new, hue_scene_current;

template< typename T, size_t N > size_t ArraySize (T (&) [N]){ return N; }

//HTTPClient http;

void initialize_hue_settings() {
  // Web側に香り情報と照明色を渡すためにHue Bridgeから設定取得
  //if( wifiMulti.run() == WL_CONNECTED ) {

    HTTPClient http;

    Serial.print("[HTTP] initialization begins...\n");
    http.begin(HUE_APIURL_SCENES);  // HTTP
    
    // HTTP GET
    Serial.print("[HTTP] GET...\n");
    // start connection and send HTTP header
    int httpCode = http.GET();

    // httpCode will be negative on error
    if(httpCode > 0) {
      // HTTP header has been send and Server response header has been handled
      Serial.printf("[HTTP] GET... code: %d\n", httpCode);

      // file found at server
      if(httpCode == HTTP_CODE_OK) {
        String payload = http.getString();
        //Serial.println(payload);
        
        JSONVar jsonObj = JSON.parse(payload);
        if (JSON.typeof(jsonObj) == "undefined") {
          Serial.println("Parsing input failed!");
          return;
        }

        
        // scenes[1]と[2]のdetail取得 =====================
        JSONVar keys = jsonObj.keys();
        
        for (int i = 0; i < ArraySize(hue_scene_ids); i++) {
          hue_scene_ids[i] = keys[i];
          hue_scent_names[i] = jsonObj[ hue_scene_ids[i] ]["name"];
        }
      }
    } else {
      Serial.printf("[HTTP] GET... failed, error: %s\n", http.errorToString(httpCode).c_str());
    }
    
    http.end();
    
    delay(100);

    // Hue Bridgeのscenes/{key} APIでライト色取得
    for (int i = 0; i < ArraySize(hue_scene_ids); i++) {
      hue_colors[i] = get_light_colors(hue_scene_ids[i]);
      //Serial.println( hue_colors[i] );
      hue_colors[i].replace("\\\"","");   // \"を削除
      hue_colors[i].replace(" ","");    // スペースも削除
      hue_colors[i].replace("\"[","[");    // "[
      hue_colors[i].replace("]\"","]");    // ]"

      //delay(100);
    }

  //}
}


String get_light_colors(String key) {     /* key: sceneID */
  JSONVar resJson;
  String res;
  String url = HUE_APIURL_SCENES + "/" + key;


//  if( wifiMulti.run() == WL_CONNECTED ) {

    HTTPClient http;

    //Serial.print("[HTTP] begin...\n");
    http.begin(url);  // HTTP to scene detail api

    // HTTP GET
    //Serial.print("[HTTP] GET...\n");
    // start connection and send HTTP header
    int httpCode = http.GET();
  
    // httpCode will be negative on error
    if(httpCode > 0) {
      // HTTP header has been send and Server response header has been handled
      //Serial.printf("[HTTP] GET... code: %d\n", httpCode);
  
      // file found at server
      if(httpCode == HTTP_CODE_OK) {
        String payload = http.getString();

        JSONVar jsonObj = JSON.parse(payload);
        if (JSON.typeof(jsonObj) == "undefined") {
          Serial.println("Parsing input failed!");
          return res;
        }
  
        // lightstates json配列を渡す
        if(jsonObj.hasOwnProperty("name") && jsonObj.hasOwnProperty("lightstates")){
          JSONVar jsonLights = jsonObj["lightstates"];
          JSONVar jsonLightKeys = jsonLights.keys();

          /*
           * JSON.stringify(jsonLights);
          {"4":{"on":true,"bri":77,"xy":[0.1682,0.629]},"7":{"on":true,"bri":93,"xy":[0.202,0.5397]},"8":{"on":false},"9":{"on":true,"bri":185,"xy":[0.1682,0.629]}}
          {"4":{"on":true,"bri":45,"xy":[0.622,0.3605]},"7":{"on":true,"bri":174,"xy":[0.6323,0.3527]},"8":{"on":false},"9":{"on":true,"bri":126,"xy":[0.6323,0.3527]}}
          */
          for (uint8_t i = 0; i < jsonLightKeys.length(); i++) {
            Serial.println(atoi((const char *)jsonLightKeys[i])+" : ");
            if ((boolean)jsonLights[jsonLightKeys[i]]["on"]) {
              //Serial.println( "on: "+ (boolean)jsonLights[jsonLightKeys[i]]["on"] );
              //Serial.println( JSON.stringify(jsonLights[jsonLightKeys[i]]["xy"]) );
              String xy = JSON.stringify(jsonLights[jsonLightKeys[i]]["xy"]);

              //resJson[JSON.stringify(jsonObj["name"])][JSON.stringify(jsonLightKeys[i])] = jsonLights[jsonLightKeys[i]]["xy"];
              String name = JSON.stringify(jsonObj["name"]);
              String lightID = JSON.stringify(jsonLightKeys[i]);
              
              resJson[name][lightID] = xy;
              
            }
          }
          
          res = JSON.stringify(resJson);
        }
      }
    } else {
      Serial.printf("[HTTP] GET... failed, error: %s\n", http.errorToString(httpCode).c_str());
    }
  
    http.end();

//  }

  delay(100);

  return res;
}

void sensor_loop() {
  int din1_value, din2_value;
  
  din1_value = digitalRead( DIN_PIN_1 );
  din2_value = digitalRead( DIN_PIN_2 );
  Serial.println( "pin1: "+String(din1_value)+", pin2 : "+String(din2_value));
  
  if (din1_value == 1) {    // glass removed
    //Serial.println( "1つ目外された" );
    hue_scene_new = HUE_SCENE_ID_1;
    last_touched_scent = 1;
  }

  if (din2_value == 1) {
    //Serial.println( "2つ目外された" );
    hue_scene_new = HUE_SCENE_ID_2;
    last_touched_scent = 2;
  }


  // lasttouchまわり今後なおす
  if ((din1_value == 0 && din2_value == 0) || last_touched_scent == 0) {
    //Serial.println( "1&2つ目カバー中" );
    hue_scene_new = HUE_SCENE_ID_DEFAULT;
    last_touched_scent = 0;
  }

  
  // Hueの光変更制御
  if( (wifiMulti.run() == WL_CONNECTED) && hue_scene_new != hue_scene_current ) {

    HTTPClient http;

    Serial.print("[HTTP] begin...\n");
    // configure traged server and url
    //http.begin("https://www.howsmyssl.com/a/check", ca); //HTTPS
    http.begin(HUE_APIURL_ACTION); //HTTP
    
    
    Serial.print("[HTTP] PUT...\n");
    String httpRequestData = "{\"scene\": \"" + hue_scene_new + "\"}";    // PUTで投げるbody {"scene": "scene_name"}
    int httpResponseCode = http.PUT(httpRequestData);
    String res = http.getString();
    
    http.end();
    
    Serial.print("status code: ");
    Serial.println(httpResponseCode);
    Serial.println("response: " + res);

    hue_scene_current = hue_scene_new;
    delay(100);   // hue api callしすぎると処理が溜まって挙動がおかしくなる？
  }
  
  // WebsocketでHue情報送信
  // example -> {"scent1":{"4":[0.1682,0.629],"7":[0.202,0.5397],"9":[0.1682,0.629]}}    
  String message = hue_colors[last_touched_scent];
  webSocket.broadcastTXT(message);    // WS connectionしてるやつすべてにmessage送信
  delay(400);
}



void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {

    switch(type) {
        case WStype_DISCONNECTED:
            Serial.printf("[%u] Disconnected!\n", num);
            break;
        case WStype_CONNECTED:
            {
                IPAddress ip = webSocket.remoteIP(num);
                Serial.printf("[%u] Connected from %d.%d.%d.%d url: %s\n", num, ip[0], ip[1], ip[2], ip[3], payload);
				
        				// send message to client
        				webSocket.sendTXT(num, "Connected");
            }
            break;
        case WStype_TEXT:
            Serial.printf("[%u] get Text: %s\n", num, payload);

            // send message to client
            // webSocket.sendTXT(num, "message here");

            // send data to all connected clients
            // webSocket.broadcastTXT("message here");
            break;
        case WStype_BIN:
            Serial.printf("[%u] get binary length: %u\n", num, length);
            //hexdump(payload, length);   // 省略

            // send message to client
            // webSocket.sendBIN(num, payload, length);
            break;
    }

}

void setup() {
    pinMode( DIN_PIN_1, INPUT_PULLUP );
    pinMode( DIN_PIN_2, INPUT_PULLUP );

    Serial.begin( 115200 );
  
    Serial.println();
    Serial.println();
    Serial.println();
  
    wifiMulti.addAP(STASSID, STAPSK);
    while (wifiMulti.run() != WL_CONNECTED) {
        Serial.print('.');
        delay(500);
    }
    Serial.print("Connected! IP address: ");
    Serial.println(WiFi.localIP());

    hue_scene_current = "none";   // 必ず最初hueを更新させる
    delay(500);
    initialize_hue_settings();  // Hueのscenes設定から香り名と色(CIE)取得
    delay(500);

    webSocket.begin();
    webSocket.onEvent(webSocketEvent);
}

void loop() {
    webSocket.loop();

    sensor_loop();
}
