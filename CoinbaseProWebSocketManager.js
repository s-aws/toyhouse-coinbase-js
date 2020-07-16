class CoinbaseProWebSocketManager { 
	constructor ( protocol = "wss://", endpoint = "ws-feed.pro.coinbase.com") {
		this.fully_qualified_endpoint = protocol + endpoint;
		this.on_types = [ "onopen", "onclose", "onerror", "onmessage"];
	}

	#new_WebSocket ( endpoint) { return new WebSocket( endpoint)}	// Subscription

	#subscription;
	channels 	= 	[];
	product_ids = 	[];
	type;

	clear_channels () { this.channels = []}
	add_channel ( channel) { this.channels.push( channel)}
	get channels () { return this.channels}
	
	// currently type can only be subscribe but we're not hard coding it
	set type ( type) { this.type = type}
	get type () { return this.type}

	clear_product_ids () { this.product_ids = []}
	add_product_id ( product_id) {	this.product_ids.push( product_id)}
	get product_ids () { return this.product_ids}

	connect () {
		// Subscription Generation
		const event_names_array = this.on_types;
		const endpoint = this.fully_qualified_endpoint;
		const create_new_websocket = this.#new_WebSocket;
		const subscription_connection_config = {
			attempt_count: 3,
			retry_delay_ms: 40,
			subscription_message: 		
				JSON.stringify({ // will improve this later
					"type" : 		this.type,
					"product_ids": 	this.product_ids,
					"channels": 	this.channels
				})
		};

		function _preconnect ( event_name_array, web_socket) {
			event_name_array.forEach( 
				function ( event_name) {
					var log_message = "using default function for: "; 

					function simple_default_function( event) {
						if ( this._simple_default_functionRootCounter === undefined) { this._simple_default_functionRootCounter = 0}
						const successfulConnectMessage = "Subscribed successsfully";
						this._simple_default_functionRootCounter++;

						// onmessage
						if ( event[ "type"] == "message") {
							if ( this._simple_default_functionMessageCounter === undefined) { this._simple_default_functionMessageCounter = 0}
							this._simple_default_functionMessageCounter++;

							// the first message event
							if ( this._simple_default_functionMessageCounter === 1) { console.log( Date.now(), successfulConnectMessage)}

							// events based on counter
							if ( !( this._simple_default_functionMessageCounter % 10)) {}
						}

						// onerror
						else if ( event[ "type"] === "error") {
							if ( this._simple_default_functionErrorCounter === undefined) { this._simple_default_functionErrorCounter = 0}
							this._simple_default_functionErrorCounter++;
							console.log( Date.now(), "Error: ", this._simple_default_functionErrorCounter, " ", event)
						}

						// onopen
						else if ( event[ "type"] === "open") {
							if ( this._simple_default_functionOpenCounter === undefined) { this._simple_default_functionOpenCounter = 0}
							this._simple_default_functionOpenCounter++;
						}
					} 

					if ( event_name === "onmessage") { this.onmessage = simple_default_function} 
					else if ( event_name === "onerror") { this.onerror = simple_default_function}
					else if ( event_name === "onopen") { this.onopen = simple_default_function}
					console.log( Date.now(), log_message += event_name);
				}, web_socket);
		}

		function _subscribe_to_websocket ( config, web_socket) {
			const subscribing_message = "subscribing...";
			const web_socket_state_issue = "WebSocket state has an issue: ";
			var i; // retry counter
			var connection_state = false; 
			var __send_signature_counter = 0;

			function __check_state ( state) { // #returns true or false
				const state_message_prefix = "WebSocket state: ";
				const bad_state_message = "cannot subscribe... :(";
				const good_state_message = "connecting...";
				const good_state = 1;
				const web_socket_ready_state_values = [ "CONNECTING", "OPEN", "CLOSING", "CLOSED"];					
				var state_flag;

				console.log( Date.now(), state_message_prefix.concat( web_socket_ready_state_values[state]));
				if ( state === good_state) { console.log( Date.now(), good_state_message); state_flag = true} else { state_flag = false; console.log( Date.now(), bad_state_message)}
				return state_flag;
			}
			
			function __send_subscription ( counter, max_counter, retry_delay, web_socket, subscription_message) {
				const message_category = "ERROR: ";				
				var web_socket_state = web_socket.readyState;
				console.log( Date.now(), "Retry delay: ".concat( retry_delay));
				if ( counter < max_counter) {
					counter++;
					if ( web_socket_state !== undefined) {
						if ( __check_state( web_socket_state) === true) {
							counter = max_counter;
							console.log( Date.now(), "Sending subscription string: ".concat(subscription_message));
							try { web_socket.send( subscription_message)} catch ( error) { console.log( message_category, error)}
						} else { 
							console.log( Date.now(), "Retry count: ".concat(counter, "/", max_counter)); 
							setTimeout( __send_subscription, retry_delay, counter, max_counter, retry_delay, web_socket, subscription_message);
						}
					}
				}
			}
			setTimeout( __send_subscription, config["retry_delay_ms"],
								__send_signature_counter,
								config["attempt_count"], 
								config["retry_delay_ms"], 
								web_socket, 
								config["subscription_message"]);
		}

		function _connect ( endpoint, new_ws) {
			var web_socket = new_ws( endpoint);

			web_socket.onclose = function ( event) {
				console.log( Date.now(), "connection closed");
				_connect( endpoint, new_ws);
			}

			_preconnect( event_names_array, web_socket);
			_subscribe_to_websocket( subscription_connection_config, web_socket);
		}

		_connect( endpoint, create_new_websocket);

	}
}