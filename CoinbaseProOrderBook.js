class CoinbaseProOrderBook {
	'use strict';
	// Settings
	constructor () {}

	simple_default_function( event) {
		if ( this._simple_default_functionRootCounter === undefined) { this._simple_default_functionRootCounter = 0}
		const successfulConnectMessage = "Subscribed successsfully";
		this._simple_default_functionRootCounter++;

		// We verify we only get message events
		if ( event[ "type"] == "message") {
			if ( this._simple_default_functionMessageCounter === undefined) { this._simple_default_functionMessageCounter = 0}
			this._simple_default_functionMessageCounter++;

			// the first message event
			if ( this._simple_default_functionMessageCounter === 1) { console.log( Date.now(), successfulConnectMessage)}

			// events based on counter
			if ( !( this._simple_default_functionMessageCounter % 10)) {}

		}
	} 
}