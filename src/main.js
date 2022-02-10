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

			if ( !params.headers ) {

				params.headers = {};
			}

			params.baseURL 					= this.#config.baseURL;
			params.responseType 			= 'json';
			params.responseEncoding 		= 'utf8';		
			params.headers['Content-Type'] 	= 'application/json';

			if ( params.public ) {

				delete params.public;

				return params;
			}
			else {

				delete params.public;


				if ( this.#config.getAccessToken ) {

					return this.#config.getAccessToken().then( token => {

						params.headers['Authorization'] = 'Bearer ' + token;

						return params;
					});
				}
				else {

					reject( new Error('Config param required: auth') );
				}
			}
		});
	}


	#request ( params ) {

		return this.#prepare( params => {

			let eventId = params.eventId;
			delete params.eventId;

			return axios( params ).then( response => {

				this.#logEvent(
					eventId,
					response.data,
				);

				return response.data;
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
	}


	#logEvent ( id, eventData = null ) {

		if ( id && this.#config.onEvent ) {

			this.#config.logEvent( id, eventData ?? {} );
		}
	}

}