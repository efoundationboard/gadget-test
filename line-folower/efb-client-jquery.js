var efb = {
	host: "http://127.0.0.1:8080", 

	writeBinary: function(tag, channel, value) {
		$.ajax({
			url: efb.host + "/write_binary",
			data: {
				"tag": tag, 
				"channel": channel, 
				"value": value, 
			},
			success: function(){
				console.log("success write binary");
			},
			dataType: "json",
		});
	},
};