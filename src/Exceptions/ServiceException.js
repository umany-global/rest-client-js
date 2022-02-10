const { HttpException } = require('@umany/base-exceptions-js');


module.exports = class ServiceException extends HttpException {

	constructor ( code, message, httpCode ) {

		super ( code, message, httpCode );
	}

}