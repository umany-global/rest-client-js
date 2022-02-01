const 	axios 	= require('axios'),
	{
		UnauthorizedException,
		NotFoundException,
		ForbiddenException,
		ValidationError,
		ServiceUnavailable,
		UnderMaintenanceException,
	} = require('@umany/error-handler-node');


module.exports = class BaseSDK {

	#config;


	constructor ( config ) {

		if ( !config.baseURL ) {

			throw new Error('Param required: baseURL');
		}
		else if ( typeof config.baseURL !== 'string' ) {

			throw new Error('baseURL param must be a string');
		}
		else if ( typeof config.bundlePath !== 'string' ) {

			throw new Error('bundlePath param must be a string');
		}
		else if ( 
			config.trackEvent
			&& typeof config.trackEvent !== 'function' 
		) 
		{
			throw new Error('trackEvent param must be a function');
		}

		this.#config = config;
	}


	init ( ) {

		if ( this.#config.auth ) {

			return this.#config.auth.init();
		}
		else {

			return new Promise ( resolve => {
				resolve();
			})
		}
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



	#handleError ( error ) {

		switch ( error.response.status ) {

			case 400:

				if ( error.response.data.error.code == 'validationError' ) {

					return new ValidationError(
						error.response.data.error.messages
					)
				}
				else {

					return error;
				}

			case 401:
				return new UnauthorizedException;

			case 403:
				return new ForbiddenException;

			case 404:
				return new NotFoundException;

			case 500:
				return new ServiceUnavailableException;

			default:
				return error;
		}
	}


	getBundlePath( ) {

		return this.#config.bundlePath;
	}


	#prepare ( params ) {

		return new Promise ( ( resolve, reject ) => {

			if ( !params.headers ) {

				params.headers = {};
			}

			let env = this.#config.currentEnv;

			if ( env ) {

				params.baseURL = this.#config.envs[env].url;
			}
			else {

				params.baseURL = this.#config.baseURL;
			}

			params.responseType 		= 'json';
			params.responseEncoding 	= 'utf8';		
			params.headers['Content-Type'] 	= 'application/json';

			if ( params.public ) {

				delete params.public;

				return params;
			}
			else {

				delete params.public;

				if ( this.#config.auth ) {

					return this.#config.auth.getAccessToken().then( token => {

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

				this.#trackEvent(
					eventId,
					response.data,
				);

				return response.data;
			});			
		});
	}


	#trackEvent ( id, eventData = null ) {

		if ( id && this.#config.trackEvent ) {

			this.#config.trackEvent( id, eventData ?? {} );
		}
	}

}