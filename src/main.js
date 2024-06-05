import 	HTTPClient from '@umany-global/http-client-axios';


export default class RESTClient extends HTTPClient {

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