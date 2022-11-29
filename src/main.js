import 	axios				from 'axios';
import 	ServiceException 	from './Exceptions/ServiceException.js';


export default class ServiceSDKBase {

	#config;


	constructor ( config ) {

		if ( !config.baseUrl ) {

			throw new Error('Param required: baseUrl');
		}
		else if ( typeof config.baseUrl !== 'string' ) {

			throw new Error('baseUrl param must be a string');
		}
		else if ( 
			config.getAccessToken
			&& typeof config.getAccessToken !== 'function' 
		) 
		{
			throw new Error('getAccessToken param must be a function and return Promise');
		}
		else {

			try {

				new URL( config.baseUrl )	
			}
			catch ( err ) {

				throw new Error('baseUrl must be a valid url');
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
			noAuth: params.noAuth,
			getAccessToken: params.getAccessToken,
		});
	}


	#prepare ( params ) {

		return new Promise ( ( resolve, reject ) => {

			try {

				let noAuth 			= params.noAuth,
					getAccessToken  = params.getAccessToken ?? this.#config.getAccessToken;

				delete 	params.noAuth,
						params.getAccessToken;

				if ( !params.headers ) {

					params.headers = {};
				}

				params.baseURL 					= this.#config.baseUrl;
				params.responseType 			= 'json';
				params.responseEncoding 		= 'utf8';		
				params.headers['Content-Type'] 	= 'application/json';


				if ( noAuth ) {

					resolve( params );
				}
				else if ( getAccessToken ) {

					getAccessToken().then( token => {

						params.headers['Authorization'] = token ? 'Bearer ' + token : undefined;

						resolve( params );

					}).catch( err => {

						reject( err );
					});
				}
				else {

					reject( new Error('Config or method param required: getAccessToken') );
				}

			}
			catch( err ) {

				reject( err );
			}

		});

	}


	#request ( params ) {

		return new Promise ( ( resolve, reject ) => {

			this.#prepare( params ).then( params => {

				return axios( params ).then( response => {

					resolve( response.data );
				});

			}).catch( err => {

				if ( 
					err.response 
					&& err.response?.data
					&& err.response?.data?.error
				) 
				{

					reject( 
						new ServiceException( 
							err.response.data.error.code, 
							err.response.data.error.message, 
							err.response.status 
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