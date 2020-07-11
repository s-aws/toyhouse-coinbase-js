class CoinbaseProWebSocketManager { 
	'use strict';
	// Connection
	#endpoint;
	#wss_protocol_prefix;
	#fully_qualified_endpoint;

		// Websocket
		#on_types;

			// Subscription
			#subscription;
			#type;
			#channels 	= 	[];
			#product_ids= 	[];

	// open websocket
	#new_WebSocket = function( endpoint) { return new WebSocket( endpoint)}

	// Subscription Generation
	#generate_subscription_string = function() {
		console.log("generating subscription string");
		return JSON.stringify({ // will improve this later
			"type" : 		this.#type,
			"product_ids": 	this.#product_ids,
			"channels": 	this.#channels
		});
	}

	constructor () {
		this.#wss_protocol_prefix = "wss://";
		this.#endpoint = "ws-feed.pro.coinbase.com"; // may change in the future? (used to be gdax)
		this.#on_types = [ "onopen", "onclose", "onerror", "onmessage"];
		this.#fully_qualified_endpoint = this.#wss_protocol_prefix + this.#endpoint; // For connection
		// Open the WebSocket connection
		this.ws	= this.#new_WebSocket( this.#fully_qualified_endpoint);
		return this;
	}

	clear_channels () { this.#channels = []}
	set channels ( channel) { this.#channels.push( channel)}
	get channels () {return this.#channels}
	
	// currently type can only be subscribe but we're not hard coding it
	set type ( type) { this.#type = type}
	get type () { return this.#type}

	clear_product_ids () { this.#product_ids = []}
	set product_ids ( product_id) {	this.#product_ids.push(product_id)}
	get product_ids () { return this.#product_ids}

	connect () {
		const event_names_array = this.#on_types;
		const subscription_connection_config = {
			attempt_count: 3,
			retry_delay_ms: 125,
			subscription_message: this.#generate_subscription_string()
		}
		var web_socket = this.ws;

		function _preconnect ( event_name_array, web_socket) {
			event_name_array.forEach( 
				function ( event_name) {
					function simple_default_function( event) { console.log( event)} 
					var log_message = "using default function for "; 
					if ( event_name == "onmessage") {} 
					else if ( event_name == "onerror") {}
					else if ( event_name == "onerror") {}
					else if ( event_name == "onclose") { this.onclose = simple_default_function} 
					else if ( event_name == "onopen") {}
					console.log( log_message += event_name);
				}, web_socket);
		}

		function _subscribe_to_websocket ( config, web_socket) {
			const subscribing_message = "subscribing...";
			const web_socket_state_issue = "WebSocket state has an issue: ";
			var i; // retry counter
			var connection_state = false; 
			var __send_signature_counter = 0;

			function __check_state ( state) { // #returns true or false
				const state_message_prefix = "WebSocket connecting state: "
				const bad_state_message = "cannot subscribe... :(";
				const good_state_message = "connecting...";
				const good_state = 1;
				const web_socket_ready_state_values = [ "CONNECTING", "OPEN", "CLOSING", "CLOSED"];					
				var state_flag;

				console.log(state_message_prefix, web_socket_ready_state_values[state]);
				if ( state === good_state) { console.log( good_state_message); state_flag = true} else { state_flag = false; console.log( bad_state_message)}
				return state_flag;
			}
			
			function __send_subscription ( counter, max_counter, retry_delay, web_socket, subscription_message) {
				var web_socket_state = web_socket.readyState;
				console.log(retry_delay);
				if ( counter < max_counter) {
					counter++;
					if ( web_socket_state !== undefined) {
						if ( __check_state( web_socket_state) === true) {
							counter = max_counter;
							console.log( subscription_message);
							try { web_socket.send( subscription_message)} catch ( error) { console.log("ERROR: ", error)}
						} else { 
							console.log( counter); 
							setTimeout( __send_subscription, retry_delay, counter, max_counter, retry_delay, web_socket, subscription_message);
						}
					}
				}
			}

			__send_subscription( __send_signature_counter, 
								config["attempt_count"], 
								config["retry_delay_ms"], 
								web_socket, 
								config["subscription_message"]);
		}

		_preconnect( event_names_array, web_socket);
		_subscribe_to_websocket( subscription_connection_config, web_socket);

	}
}