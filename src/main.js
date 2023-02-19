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
			throw new Error('getAccessToken param must be a valid callback and return Promise<token>');
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


	remove ( params ) {

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
						baseURL: this.#config.baseUrl,
						method: params.method,
						url: params.path,
						params: params.query,
						responseType: 'json',
						responseEncoding: 'utf8',
						headers: Object.assign(
							params.headers ?? {},
							{
								'Content-Type': 'application/json',
							},
						),
						maxContentLength: params.maxResponseSize ?? 2000, // bytes
						data: params.data,
						onUploadProgress: params.onUploadProgress, // callback -> ( nativeProgressEvent ) => {}
						onDownloadProgress: params.onDownloadProgress, // callback -> ( nativeProgressEvent ) => {}
						timeout: params.timeout ?? 0, // miliseconds
					};


				if ( params.noAuth ) {

					resolve( axiosParams );
				}
				else if ( params.getAccessToken ) {

					params.getAccessToken().then( token => {

						axiosParams.headers['Authorization'] = token ? 'Bearer ' + token : undefined;

						resolve( axiosParams );

					}).catch( err => {

						reject( err );
					});
				}
				else if ( this.#config.getAccessToken ) {

					this.#config.getAccessToken().then( token => {

						axiosParams.headers['Authorization'] = token ? 'Bearer ' + token : undefined;

						resolve( axiosParams );

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
					err.response?.data?.error?.code
					&& err.response?.data?.error?.message
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