import 	axios				from 'axios';
import 	RESTException 		from './Exceptions/RESTException.js';


export default class RESTClient {

	config;


	// config.baseUrl
	// config.auth - authorization header value or callback returning Promise<value>
	constructor ( config ) {

		if ( !config.baseUrl ) {

			throw new Error('Param required: baseUrl');
		}
		else if ( typeof config.baseUrl !== 'string' ) {

			throw new Error('baseUrl param must be a string');
		}
		else if ( 
			config.auth
			&& typeof config.auth !== 'string' 
			&& typeof config.auth !== 'function' 
		) 
		{
			throw new Error('auth param must be a string or valid callback which returns Promise<string>');
		}
		else {

			try {

				new URL( config.baseUrl )	
			}
			catch ( err ) {

				throw new Error('baseUrl must be a valid url');
			}
		}

		this.config = config;
	}


	post ( params ) {

		return this.#request({
			...( params ),
			...({
				method: 'post',
				query: undefined,
			}),
		});
	}


	get ( params ) { 

		return this.#request({
			...( params ),
			...({
				method: 'get',
				data: undefined,
			}),
		});
	}


	patch ( params ) {

		return this.#request({
			...( params ),
			...({
				method: 'patch',
				query: undefined,
			}),
		});
	}


	delete ( params ) {

		return this.#request({
			...( params ),
			...({
				method: 'delete',
				query: undefined,
				data: undefined,
			}),
		});
	}


	put ( params ) {

		return this.#request({
			...( params ),
			...({
				method: 'put',
				query: undefined,
			}),
		});
	}


	#prepare ( params ) {

		return new Promise ( ( resolve, reject ) => {

			try {

				let axiosParams = {
					baseURL: this.config.baseUrl,
					method: params.method,
					url: params.path,
					params: params.query,
					responseType: 'json',
					responseEncoding: 'utf8',
					headers: Object.assign(
						params.headers ?? {},
						{
							'Content-Type': 'application/json; charset=utf-8',
							...( this.config.baseHeaders ?? {} ),
						},
					),
					maxContentLength: params.maxResponseSize ?? 2000000, // bytes
					maxBodyLength: params.maxRequestSize ?? 2000000, // bytes
					data: params.data,
					onUploadProgress: params.onUploadProgress, // callback -> ( axiosProgressEvent ) => {}
					onDownloadProgress: params.onDownloadProgress, // callback -> ( axiosProgressEvent ) => {}
					timeout: params.timeout ?? 0, // miliseconds
				};

				// obtain access token from fixed param or user-defined callback
				let auth = params.auth ?? this.config.auth;

				if ( typeof auth === 'string' ) {

					axiosParams.headers['Authorization'] = auth;

					resolve( axiosParams );
				}
				else if ( typeof auth === 'function' ) {

					auth().then( token => {

						axiosParams.headers['Authorization'] = token;

						resolve( axiosParams );

					}).catch( err => {

						reject( err );
					});
				}
				else {

					resolve( axiosParams );
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
					err.response?.data?.error?.code
					|| err.response?.data?.error?.message
				) 
				{

					reject( 
						new RESTException( 
							err.response.data.error.code,
							err.response.data.error.message, 
							err.response.status,
							{
								cause: err,
							}
						)
					);
				}
				else {

					reject( err );
				}

			});

		});
	}


	set config ( value ) {

		throw new Error('config must be set as constructor first parameter');
	}

}

export {
	RESTException,
}