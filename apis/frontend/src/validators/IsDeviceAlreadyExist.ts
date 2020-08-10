import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator'
import * as error from '../errors'
import { DeviceModel } from '../entities/Device'
  
  @ValidatorConstraint({ async: true })
  export class IsDeviceAlreadyExistConstraint implements ValidatorConstraintInterface {
    validate(secret: string) {
        return DeviceModel.findOne({ secret }).then(device => {
        if (device) return true
        return false
      });
    }
  }
  
  export function IsDeviceAlreadyExist(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
      registerDecorator({
        target: object.constructor,
        propertyName: propertyName,
        options: {
            ...validationOptions,
            message: error.DEVICE_DOES_NOT_EXIST,
        },
        constraints: [],
        validator: IsDeviceAlreadyExistConstraint,
      });
    };
  }