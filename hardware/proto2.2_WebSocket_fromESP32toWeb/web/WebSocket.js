let prev_scent;

function connect(){
  const ESP_IP = "192.168.5.95";  // in case of 3L
  //const ESP_IP = "192.168.128.134";

  //var connection = new WebSocket('ws://'+location.hostname+':81/', ['arduino']);
  var connection = new WebSocket('ws://'+ESP_IP+':81/', ['arduino']);

  connection.onopen = function () {
      connection.send('Connect ' + new Date());
  };
  connection.onerror = function (error) {
      console.log('WebSocket Error ', error);
  };
  connection.onmessage = function (e) {  
      console.log('Server: ', e.data);

      // e.dataでcssとかhidden input処理
      if(e.data != prev_scent){
          document.getElementById("scentType").value = e.data;
          document.getElementById("scentType").classList.remove(prev_scent);
          document.getElementById("scentType").classList.add(e.data);
      }
      prev_scent = e.data;
  }
  connection.onclose = function(){
      console.log('WebSocket connection closed');
      setTimeout(connect, 1000);
  };
}

connect();

function sendType() {
    var scentType = document.getElementById('scentType').value;
    typestr = '#' + scentType.toString(10); 
    console.log('Type: ' + typestr); 
    connection.send(typestr);

    window.print();
}
