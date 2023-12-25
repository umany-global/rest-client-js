import { HttpException } from '@umany-global/base-exceptions-js';


export default class RESTException extends HttpException {

	constructor ( code, message, httpCode, options = {} ) {

		super ( code, message, httpCode, options );
	}

}