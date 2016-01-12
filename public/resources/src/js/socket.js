/**
 * forcept socket.js
 * @author Cameron Kelley
 */

function _log(m) {
 	console.log("[socket.js] " + m);
}

/**
 * Socket object.
 */
var Socket = {

	/// Socket instance variable
 	sock: null,

 	identifiers: {},
 	handlers: {},
 	timeouts: {},
 	vitalOperationsInProgress: [],

 	onOpen: function() {},
 	onClose: function() {},


 	/**
 	 * Initialize a new socket.
 	 */
 	init: function(url)
 	{
 		_log('Instantiating a new socket @ ' + url);
 		
 		this.sock = new WebSocket(url);

 		var parent = this;

 		this.sock.onopen = function (event) {
 			_log('Socket opened.');
 			parent.onOpen();
 		}

 		this.sock.onmessage = function (event) {
 			var packet = JSON.parse(event.data);

 			if(packet.name) {
 				_log('Received ' + packet.name + ' packet.');
 				_log(' --> ' + event.data);

 				/// Dispatch handler
 				if(packet.name in parent.handlers) {
 					if(typeof parent.handlers[packet.name] == "object") {
 						parent.handlers[packet.name][packet.args[parent.identifiers[packet.name]]](packet.args);
 					} else {
 						parent.handlers[packet.name](packet.args);
 					}
 				} else _log('Caught packet ' + packet.name + ' without a handler');

 				/// Clear timeout
 				if(packet.name in parent.timeouts) {
 					clearTimeout(parent.timeouts[packet.name]);
 				}
 				
 				/// Remove vitality
 				var vitalOpsIndex = parent.vitalOperationsInProgress.indexOf(packet.name);
 				if(vitalOpsIndex !== -1) {
 					parent.vitalOperationsInProgress.splice(vitalOpsIndex, 1);
 				}
 			}
 		}

 		this.sock.onerror = function (event) {
 			_log('ERROR: ' + JSON.stringify(event));
 		}

 		this.sock.onclose = function (event) {
 			_log('Socket closed.');
 			parent.onClose();
 		}
 	},
 	
 	setIdentifier: function(packetName, identifier) 
 	{
 		_log("Setting identifier for " + packetName + " to " + identifier);
 		this.identifiers[packetName] = identifier;
 	},

 	handle: function(packetName, callback, options) 
 	{
 		options = typeof options !== "undefined" ? options : {};

 		/// Set up callback
 		if(options.hasOwnProperty("identifier")) {
 			if(typeof this.handlers[packetName] != 'object') {
 				this.handlers[packetName] = {};
 			}
 			if(options.identifier in this.handlers[packetName]) {
				_log('Overriding handler (' + typeof this.handlers + ') for ' + packetName + "." + options.identifier);
			}
 			this.handlers[packetName][options.identifier] = callback;
 		} else {
			if(packetName in this.handlers) {
				_log('Overriding handler (' + typeof this.handlers + ') for ' + packetName);
			}
	 		this.handlers[packetName] = callback;
 		}

 		/// Check if an independent timeout is needed
 		if(options.hasOwnProperty("timeout")) {
 			this.timeouts[packetName] = setTimeout(function() {
 				Exegeses.handleError("packetResponseTimeout", (options.hasOwnProperty('timeoutMessage') ? options.timeoutMessage : false), packetName);
 			}, options.timeout);
 		}
 		
 		/// Check if this operation is vital
 		if(options.hasOwnProperty("vital")) {
 			this.vitalOperationsInProgress.push(packetName);
 		}
 	},

 	send: function(packetName, args) 
 	{
 		args = args || {};
 		
 		var parent = this;
 		if([0, 2, 3].indexOf(this.sock.readyState) > -1) {
 			setTimeout(function() { 
 				parent.send(packetName, args); 
 			}, 100);
 		} else {
 			_log('Sending packet ' + packetName);
 			this.sock.send(JSON.stringify({ name: packetName, args: args }));
 		}

 	},

 	close: function() 
 	{
 		_log('Closing socket.');
 		if(this.sock.bufferedAmount > 0) {
 			setTimeout(this.close, 10);
 		} else this.sock.close();
 	}

 };