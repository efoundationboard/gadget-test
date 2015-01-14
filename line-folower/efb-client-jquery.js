var efb = {
	host: "http://127.0.0.1:8080", 

	writeValue: function(tag, channel, value) {
		$.ajax({
			url: efb.host + "/write_value",
			data: {
				"tag": tag, 
				"channel": channel, 
				"value": value, 
			},
			dataType: "json",
			success: function(data){
				//console.log("success write binary");
				//console.log(data);
			},
			error: function(a, b, c) {
				console.log(a);
				console.log(b);
				console.log(c);
			}, 
		});
	},

	readValue: function(tag, channel, callback) {
		$.ajax({
			url: efb.host + "/read_value",
			data: {
				"tag": tag, 
				"channel": channel, 
			},
			dataType: "json",
			success: function(data){
				callback(data.value);
			},
			error: function(a, b, c) {
				console.log(a);
				console.log(b);
				console.log(c);
			}, 
		});
	}, 
};