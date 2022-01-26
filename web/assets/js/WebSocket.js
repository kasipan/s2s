
function connect(){
  const input_id = "input-scentType";
  const ESP_IP = "192.168.5.95";  // in case of 3L
  //const ESP_IP = "192.168.128.134";
  //var connection = new WebSocket('ws://'+location.hostname+':81/', ['arduino']);
  var connection = new WebSocket('ws://'+ESP_IP+':81/', ['arduino']);
  let prev_scent;

  connection.onopen = function () {
    connection.send('Connect ' + new Date());
  };
  connection.onerror = function (error) {
    console.log('WebSocket Error ', error);
  };

  connection.onmessage = function (e) {  
    console.log(e.data);
    var scentData = e.data;
    
    if(is_json(scentData)) {
      var jsonObj = JSON.parse(scentData);
      var current_scent = Object.keys(jsonObj)[0];  // scent name (key)
      var lights_cie = jsonObj[current_scent];    // CIE color data

      if(current_scent != prev_scent && current_scent != "default") {
        document.getElementById(input_id).value = current_scent;
        // document.getElementById("scentType").classList.remove(prev_scent);
        // document.getElementById("scentType").classList.add(e.data);
        prev_scent = current_scent;
      }
    }
  };

  connection.onclose = function(){
      console.log('WebSocket connection closed');
      setTimeout(connect, 500);
  };
}

connect();


let is_json = data => {
  try {
    JSON.parse(data);
  } catch (error) {
    return false;
  }
  return true;
}


/*
function sendType() {
    var scentType = document.getElementById('scentType').value;
    typestr = '#' + scentType.toString(10); 
    console.log('Type: ' + typestr); 
    connection.send(typestr);

    window.print();
}
*/