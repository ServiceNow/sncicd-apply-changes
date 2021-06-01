"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseStatus = exports.Errors = void 0;
var Errors;
(function (Errors) {
    Errors["USERNAME"] = "nowUsername is not set";
    Errors["PASSWORD"] = "nowPassword is not set";
    Errors["INSTANCE"] = "nowSourceInstance is not set";
    Errors["SYSID_OR_SCOPE"] = "Please specify scope or sys_id";
    Errors["INCORRECT_CONFIG"] = "Configuration is incorrect";
})(Errors = exports.Errors || (exports.Errors = {}));
var ResponseStatus;
(function (ResponseStatus) {
    ResponseStatus[ResponseStatus["Pending"] = 0] = "Pending";
    ResponseStatus[ResponseStatus["Running"] = 1] = "Running";
    ResponseStatus[ResponseStatus["Successful"] = 2] = "Successful";
    ResponseStatus[ResponseStatus["Failed"] = 3] = "Failed";
    ResponseStatus[ResponseStatus["Canceled"] = 4] = "Canceled";
})(ResponseStatus = exports.ResponseStatus || (exports.ResponseStatus = {}));
