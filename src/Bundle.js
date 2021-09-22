const 	BaseSDK = require('./BaseSDK'),
		AuthSDK = require('auth-sdk-js');

module.exports = class Bundle {

	#config:


	constructor ( config ) {

		if ( 
			config.auth 
			&& !( config.auth instanceof AuthSDK )
		)
		{
			throw new Error('auth param must be an instance of AuthSDK from the following package: auth-sdk-js');
		}
		else if ( !config.services ) {

			throw new Error( 'Param required: services' );
		}
		else if ( typeof config.services !== 'array' ) {

			throw new Error( 'services param must be an array' );
		}

		config.services.forEach( service => {

			this.#attach( service );
		});

		this.#config = config;
	}


	#attach ( service ) {

		if ( service instanceof BaseSDK ) {

			switch ( service.getBundlePath() ) {

				case 'auth':
				case 'init':
				case '#config':
				case '#attach':

					throw new Error(
						'SDK path "'+service.getBundlePath()+'" is already taken, try another.'
					);

				default:

					Object.defineProperty( 
						this, 
						service.getBundlePath(), 
						{
							value: service,
							writable: false
						}
					);

					break;
			}
		}
		else {

			throw new Error('param must be an instance of ServiceClient');
		}

	}


	get auth ( ) {

		return this.#config.auth;
	}


	set auth ( value ) {

		throw new Error ('Read-Only property: auth');
	}


	init ( ) {

		if ( this.auth ) {

			return this.auth.init();
		}
		else {

			return new Promise( ( resolve, reject ) => {

				resolve();
			});
		}
		
	}

}