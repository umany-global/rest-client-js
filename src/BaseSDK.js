const { AuthSDK } = require('auth-sdk-js');


module.exports = class BaseSDK {

	auth;
	#config:


	constructor ( config ) {

		this.#config = config;
		this.auth	 = new AuthSDK( config );
	}


	attach ( ServiceClient ) {

		switch ( ServiceClient.getSDKPath() ) {

			case 'auth':
			case '#config':
			case 'attach':
			case 'init':

				throw new Error(
					'SDK path "'+ServiceClient.getSDKPath()+'" is already taken, try another.'
				);

			default:

				Object.defineProperty( 
					this, 
					ServiceClient.getSDKPath(), 
					{
						value: ServiceClient,
						writable: false
					}
				);

				break;
		}

	}


	set auth ( value ) {

		throw new Error ('Read-Only property: auth');
	}


	init ( ) {

		return this.auth.init();
	}

}