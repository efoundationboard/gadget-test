var serialport = require("serialport");
var SerialPort = serialport.SerialPort;
var async = require("async");

async.waterfall([
  serialport.list,
  function(ports, cb){
    console.log(ports);
    async.map(ports, function(port, cb){
      var sp = new SerialPort(port.comName, {
        baudrate: 9600
      });

      sp.on("open", function () {
        console.log('open : ' + sp.path);
        sp.on('data', function(data) {
          console.log(sp.path + ' - data received: ' + data);
        });
        sp.write("?", function(err, res) {
          console.log('written', err, res);
        });

        setInterval(function(){sp.write('?');}, 1000);
      });
      cb(sp);
    }, cb);
  },
  function(data){
    console.log("Done", data);
  }
]);
