"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const app_types_1 = require("./types/app.types");
const axios_1 = __importDefault(require("axios"));
class App {
    constructor(props) {
        this.sleepTime = 3000;
        this.messages = {
            incorrectConfig: 'Configuration is incorrect',
            canceledMsg: 'Canceled',
        };
        this.errCodeMessages = {
            401: 'The user credentials are incorrect.',
            403: 'Forbidden. The user is not an admin or does not have the CICD role.',
            404: 'Not found. The requested item was not found.',
            405: 'Invalid method. The functionality is disabled.',
            409: 'Conflict. The requested item is not unique.',
            500: 'Internal server error. An unexpected error occurred while processing the request.',
        };
        this.props = props;
        this.snowSourceInstance = props.snowSourceInstance;
        this.user = {
            username: props.username,
            password: props.password,
        };
        this.config = {
            headers: {
                'User-Agent': 'sncicd_extint_github',
                Accept: 'application/json',
            },
            auth: this.user,
        };
    }
    buildParams(options) {
        return (Object.keys(options)
            // eslint-disable-next-line no-prototype-builtins,@typescript-eslint/ban-ts-comment
            // @ts-ignore
            // eslint-disable-next-line no-prototype-builtins
            .filter(key => options.hasOwnProperty(key) && options[key])
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            .map(key => `${key}=${encodeURIComponent(options[key])}`)
            .join('&'));
    }
    /**
     * Takes options object, convert it to encoded URI string
     * and append to the request url
     *
     * @param options   Set of options to be appended as params
     *
     * @returns string  Url to API
     */
    buildRequestUrl(options) {
        if (!this.props.snowSourceInstance || (!options.app_sys_id && !options.app_scope))
            throw new Error(app_types_1.Errors.INCORRECT_CONFIG);
        const params = this.buildParams(options);
        return `https://${this.props.snowSourceInstance}.service-now.com/api/sn_cicd/sc/apply_changes?${params}`;
    }
    /**
     * Makes the request to SNow api apply_changes
     *
     * @param branch    The name of the branch to be applied
     *                  on the SNow side
     *
     * @returns         Promise void
     */
    async applyChanges(branch) {
        // build the request api url
        const options = {};
        if (!this.props.appSysID) {
            options.app_scope = this.props.scope;
        }
        else {
            options.app_sys_id = this.props.appSysID;
        }
        // set the branch to update on SNow side
        if (!branch) {
            options.branch_name = branch;
        }
        const body = "";
        const url = this.buildRequestUrl(options);
        core.info("Ready to call URL " + url);
        try {
            const response = await axios_1.default.post(url, body, this.config);
            await this.printStatus(response.data.result);
            core.info(response.data.result + "");
        }
        catch (error) {
            let message;
            if (error.response && error.response.status) {
                if (this.errCodeMessages[error.response.status]) {
                    message = this.errCodeMessages[error.response.status];
                }
                else {
                    //const result: ErrorResult = error.response.data.result
                    //message = result.error || result.status_message
                    message = "Something faieled";
                }
            }
            else {
                message = error.message;
            }
            throw new Error(message);
        }
    }
    /**
     * Some kind of throttling, it used to limit the number of requests
     * in the recursion
     *
     * @param ms    Number of milliseconds to wait
     *
     * @returns      Promise void
     */
    sleep(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }
    /**
     * Print the result of the task.
     * Execution will continue.
     * Task will be working until it get the response with successful or failed or canceled status.
     *
     * @param result    TaskResult enum of Succeeded, SucceededWithIssues, Failed, Cancelled or Skipped.
     *
     * @returns         void
     */
    async printStatus(result) {
        if (+result.status === app_types_1.ResponseStatus.Pending)
            core.info(result.status_label);
        if (+result.status === app_types_1.ResponseStatus.Running)
            core.info(`${result.status_label}: ${result.percent_complete}%`);
        // Recursion to check the status of the request
        if (+result.status < app_types_1.ResponseStatus.Successful) {
            const response = await axios_1.default.get(result.links.progress.url, this.config);
            // Throttling
            await this.sleep(this.sleepTime);
            // Call itself if the request in the running or pending state
            await this.printStatus(response.data.result);
        }
        else {
            core.info(result.status_message);
            core.info(result.status_detail);
            // Log the success result, the step of the pipeline is success as well
            if (+result.status === app_types_1.ResponseStatus.Successful) {
                core.info(result.status_label);
            }
            // Log the failed result, the step throw an error to fail the step
            if (+result.status === app_types_1.ResponseStatus.Failed) {
                throw new Error("Something failed 2");
                //                throw new Error(result.error)
            }
            // Log the canceled result, the step throw an error to fail the step
            if (+result.status === app_types_1.ResponseStatus.Canceled) {
                throw new Error(this.messages.canceledMsg);
            }
        }
    }
}
exports.default = App;
