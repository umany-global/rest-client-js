const 	axios 				= require('axios'),
		ServiceException 	= require('./Exceptions/ServiceException');


module.exports = class BaseSDK {

	#config;


	constructor ( config ) {

		if ( !config.baseURL ) {

			throw new Error('Param required: baseURL');
		}
		else if ( typeof config.baseURL !== 'string' ) {

			throw new Error('baseURL param must be a string');
		}
		else if ( 
			config.getAccessToken
			&& typeof config.getAccessToken !== 'function' 
		) 
		{
			throw new Error('getAccessToken param must be a function');
		}
		else if ( 
			config.onEvent
			&& typeof config.onEvent !== 'function' 
		) 
		{
			throw new Error('onEvent param must be a function');
		}
		else {

			try {

				new URL( config.baseURL )	
			}
			catch ( err ) {

				throw new Error('baseURL must be a valid url');
			}
		}

		this.#config = config;
	}


	post ( params ) {

		return this.#request({
			url: params.path,
			method: 'post',
			headers: params.headers,
			params: params.query,
			data: params.data,
			eventId: params.eventId,
			public: params.public,
		});
	}


	get ( params ) { 

		return this.#request({
			url: params.path,
			method: 'get',
			headers: params.headers,
			params: params.query,
			maxContentLength: params.maxResponseSize ?? 2000,
			eventId: params.eventId,
			public: params.public,
		});
	}


	patch ( params ) {

		return this.#request({
			url: params.path,
			method: 'patch',
			headers: params.headers,
			params: params.query,
			data: params.data,
			eventId: params.eventId,
			public: params.public,
		});
	}


	remove ( params ) {

		return this.#request({
			url: params.path,
			method: 'delete',
			headers: params.headers,
			eventId: params.eventId,
			public: params.public,
		});
	}


	put ( params ) {

		return this.#request({
			url: params.path,
			method: 'put',
			headers: params.headers,
			params: params.query,
			data: params.data,
			maxContentLength: params.maxResponseSize ?? 2000,
			eventId: params.eventId,
			public: params.public,
		});
	}


	#prepare ( params ) {

		return new Promise ( ( resolve, reject ) => {

			let public = params.public;

			if ( !params.headers ) {

				params.headers = {};
			}

			params.baseURL 					= this.#config.baseURL;
			params.responseType 			= 'json';
			params.responseEncoding 		= 'utf8';		
			params.headers['Content-Type'] 	= 'application/json';

			delete params.public;

			if ( public ) {

				resolve( params );
			}
			else {

				if ( this.#config.getAccessToken ) {

					this.#config.getAccessToken().then( token => {

						params.headers['Authorization'] = 'Bearer ' + token;

						resolve( params );

					}).catch( err => {

						reject( err );
					});
				}
				else {

					reject( new Error('Config param required: auth') );
				}
			}
		});
	}


	#request ( params ) {

		new Promise ( ( resolve, reject ) => {

			this.#prepare( params => {

				let eventId = params.eventId;
				delete params.eventId;

				return axios( params ).then( response => {

					if ( response.status > 199 && response.status < 300 ) {

						this.#onEvent(
							eventId,
							response.data,
						);
					}

					resolve( response.data );
				});

			}).catch( err => {

				if ( 
					error.response 
					&& error.response.data
					&& error response.data.error
				) 
				{
					reject( 
						new ServiceException( 
							response.data.code, 
							response.data.error.message, 
							response.status 
						)
					);
				}
				else {

					reject( err );
				}

			});

		});
	}


	#onEvent ( id, eventData = null ) {

		if ( id && this.#config.onEvent ) {

			this.#config.onEvent( id, eventData ?? {} );
		}
	}

}