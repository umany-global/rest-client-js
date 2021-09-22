const 	axios 	= require('axios'),
        AuthSDK = require('auth-sdk-js'),
		{
			UnauthorizedException,
			NotFoundException,
			ForbiddenException,
			ValidationError,
			ServiceUnavailable,
			UnderMaintenanceException,
		} = require('error-handler-node');


module.exports = class BaseSDK {

	#config:


	constructor ( config ) {

		if ( !config.baseURL ) {

			throw new Error('Param required: baseURL');
		}
		else if ( typeof config.baseURL !== 'string' ) {

			throw new Error('baseURL param must be a string');
		}
		if ( !config.bundlePath ) {

			throw new Error('Param required: bundlePath');
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
		else if ( 
			config.auth 
			&& !( config.auth instanceof AuthSDK )
		)
		{
			throw new Error('auth param must be an instance of AuthSDK from the following package: auth-sdk-js');
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
			eventID: params.eventID,
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
			eventID: params.eventID,
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
			eventID: params.eventID,
			public: params.public,
		});
	}


	delete ( params ) {

		return this.#request({
			url: params.path,
			method: 'delete',
			headers: params.headers,
			eventID: params.eventID,
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
			eventID: params.eventID,
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

			params.baseURL: this.#config.baseURL;
			params.responseType: 'json';
			params.responseEncoding: 'utf8';		
			params.headers['Content-Type'] = 'application/json';

			if ( params.public ) {

				delete params.public;

				return params;
			}
			else {

				delete params.public;

				if ( this.#config.auth ) {

					return this.#config.auth.getToken().then( token => {

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

			let eventId = params.eventID;
			delete params.eventID;

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