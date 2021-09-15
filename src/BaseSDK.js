const 	axios			= require('axios'),
		{ AuthSDK } 	= require('auth-sdk-js');


module.exports = class BaseClient {

	auth;
	#config:


	constructor ( config ) {

		this.#config = config;
		this.auth 	 = new AuthSDK( config );
	}


	set auth ( value ) {

		throw new Error ('Read-Only property: auth');
	}


	init ( ) {

		return this.auth.init();
	}
}