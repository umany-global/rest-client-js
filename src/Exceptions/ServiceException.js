import { HttpException } from '@umany/base-exceptions-js';


export default class ServiceException extends HttpException {

	constructor ( code, message, httpCode ) {

		super ( code, message, httpCode );
	}

}