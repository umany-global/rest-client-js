const 	axios = require('axios'),
		{
			UnauthorizedException,
			NotFoundException,
			ForbiddenException,
			ValidationError,
			ServiceUnavailable,
			UnderMaintenanceException,
		} = require('error-handler-node');


module.exports = class ServiceClient {

	#config:


	constructor ( config ) {

		if ( !this.#config.baseURL ) {

			throw new Error('Param required: baseURL');
		}
		else if ( typeof this.#config.baseURL === 'string' ) {

			throw new Error('baseURL param must be a string');
		}
		if ( !this.#config.SDKPath ) {

			throw new Error('Param required: SDKPath');
		}
		else if ( typeof this.#config.SDKPath === 'string' ) {

			throw new Error('SDKPath param must be a string');
		}

		this.#config = config;
	}


	#request ( params ) {

		return new Promise ( ( resolve, reject ) => {

			if ( !params.headers ) {

				params.headers = {};
			}

			params.baseURL: this.#config.baseURL;
			params.responseType: 'json';
			params.responseEncoding: 'utf8';		
			params.headers['Content-Type'] = 'application/json';

			if ( params.authToken ) {

				params.headers['Authorization'] = 'Bearer '+params.authToken;
			}

			axios( params ).then( response => {

				resolve( response.data );

				this.#trackEvent(
					params.eventID,
					response.data,
				);

			}).catch( error => {

				reject ( this.#handleError );
			});			
		});
	}


	post ( params ) {

		return this.#request({
			url: params.path,
			method: 'post',
			headers: params.headers,
			params: params.query,
			data: params.data,
			eventID: params.eventID,
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
		});
	}


	delete ( params ) {

		return this.#request({
			url: params.path,
			method: 'delete',
			headers: params.headers,
			eventID: params.eventID,
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


	getSDKPath( ) {

		return this.#config.SDKPath;
	}


	#trackEvent ( id, eventData ) {

		if ( id && this.#config.trackEvent ) {

			this.#config.trackEvent( id, eventData );
		}
	}

}