import {
	registerDecorator,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator'
import * as error from '../errors'
import { UserModel } from '../entities/User'
  
  @ValidatorConstraint({ async: true })
  export class IsUserAlreadyExistConstraint implements ValidatorConstraintInterface {
	validate(email: string) {
		return UserModel.findOne({ email }).then(user => {
		if (user) return true
		return false;
	  });
	}
  }
  
  export function IsUserAlreadyExist(validationOptions?: ValidationOptions) {
	return function (object: Object, propertyName: string) {
	  registerDecorator({
		target: object.constructor,
		propertyName: propertyName,
		options: {
			message: error.USER_DOES_NOT_EXIST,
			...validationOptions,
		},
		constraints: [],
		validator: IsUserAlreadyExistConstraint,
	  });
	};
  }