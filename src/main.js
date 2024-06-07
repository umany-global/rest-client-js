import 	HTTPClient from '@umany-global/http-client-axios';


export default class RESTClient extends HTTPClient {


	constructor ( config ) {

		if ( !config.baseUrl ) {

			throw new Error( 'Param required: baseUrl' );
		}
		else if ( typeof config.baseUrl !== 'string' ) {

			throw new Error( 'baseUrl param must be a string' );
		}

		super( config );

	}

	
	post ( params ) {

		return super.post({
			...( params ),
			...({
				responseType: 'json',
				responseEncoding: 'utf8',
			}),
		});
	}


	get ( params ) { 

		return super.get({
			...( params ),
			...({
				responseType: 'json',
				responseEncoding: 'utf8',
			}),
		});
	}


	patch ( params ) {

		return super.patch({
			...( params ),
			...({
				responseType: 'json',
				responseEncoding: 'utf8',
			}),
		});
	}


	delete ( params ) {

		return super.delete({
			...( params ),
			...({
				responseType: 'json',
				responseEncoding: 'utf8'
			}),
		});
	}


	put ( params ) {

		return super.put({
			...( params ),
			...({
				responseType: 'json',
				responseEncoding: 'utf8',
			}),
		});
	}

}