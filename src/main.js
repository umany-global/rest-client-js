const 	BaseSDK = require('./BaseSDK'),
		AuthSDK = require('@umany/auth-sdk-js'),
		{
			UnauthorizedException,
			NotFoundException,
			ForbiddenException,
			ValidationError,
			ServiceUnavailable,
			UnderMaintenanceException,
		} = require('@umany/error-handler-node');


module.exports = {
	AuthSDK,
	BaseSDK,
	UnauthorizedException,
	NotFoundException,
	ForbiddenException,
	ValidationError,
	ServiceUnavailable,
	UnderMaintenanceException,
}