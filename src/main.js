import 	axios				from 'axios';
import 	ServiceException 	from './Exceptions/ServiceException.js';


export default class ServiceSDKBase {

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
			auth: params.auth,
			getAccessToken: params.getAccessToken,
		});
	}


	get ( params ) { 

		return this.#request({
			url: params.path,
			method: 'get',
			headers: params.headers,
			params: params.query,
			maxContentLength: params.maxResponseSize ?? 2000,
			auth: params.auth,
			getAccessToken: params.getAccessToken,
		});
	}


	patch ( params ) {

		return this.#request({
			url: params.path,
			method: 'patch',
			headers: params.headers,
			params: params.query,
			data: params.data,
			auth: params.auth,
			getAccessToken: params.getAccessToken,
		});
	}


	remove ( params ) {

		return this.#request({
			url: params.path,
			method: 'delete',
			headers: params.headers,
			auth: params.auth,
			getAccessToken: params.getAccessToken,
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
			auth: params.auth,
			getAccessToken: params.getAccessToken,
		});
	}


	#prepare ( params ) {

		return new Promise ( ( resolve, reject ) => {

			let auth = params.auth;

			if ( !params.headers ) {

				params.headers = {};
			}

			params.baseURL 					= this.#config.baseURL;
			params.responseType 			= 'json';
			params.responseEncoding 		= 'utf8';		
			params.headers['Content-Type'] 	= 'application/json';

			delete params.auth;

			if ( auth ) {

				resolve( params );
			}
			else {

				if ( params.getAccessToken ) {

					params.getAccessToken().then( token => {

						params.headers['Authorization'] = 'Bearer ' + token;

						resolve( params );

					}).catch( err => {

						reject( err );
					});
				}
				else if ( this.#config.getAccessToken ) {

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

		return new Promise ( ( resolve, reject ) => {

			this.#prepare( params => {

				return axios( params ).then( response => {

					resolve( response.data );
				});

			}).catch( err => {

				if ( 
					err.response 
					&& err.response.data
					&& err.response.data.error
				) 
				{
					reject( 
						new ServiceException( 
							response.data.error.code, 
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

}