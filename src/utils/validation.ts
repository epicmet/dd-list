import { ValidationObj } from "../types/index";

export function validate(confObj: ValidationObj) {
  let isValid = true;

  if (confObj.required) {
    isValid = isValid && confObj.value.toString().trim().length !== 0;
  }

  if (confObj.minLength != null && typeof confObj.value === "string") {
    isValid = isValid && confObj.value.length >= confObj.minLength;
  }
  if (confObj.maxLength != null && typeof confObj.value === "string") {
    isValid = isValid && confObj.value.length <= confObj.maxLength;
  }

  if (confObj.min != null && typeof confObj.value === "number") {
    isValid = isValid && confObj.value >= confObj.min;
  }
  if (confObj.max != null && typeof confObj.value === "number") {
    isValid = isValid && confObj.value <= confObj.max;
  }

  return isValid;
}
