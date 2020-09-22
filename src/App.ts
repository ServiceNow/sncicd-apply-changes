import * as core from '@actions/core'
import {
    ApplyResponse,
    ApplyResult,
    AppProps,
    branch_name,
    RequestBody,
    ResponseStatus,
    User,
    axiosConfig,
    Errors,
    Params,
    ErrorResult,
} from './types/app.types'
import axios from 'axios'

export default class App {
    sleepTime = 3000

    props: AppProps
    user: User
    snowSourceInstance: string
    config: axiosConfig
    messages = {
        incorrectConfig: 'Configuration is incorrect',
        canceledMsg: 'Canceled',
    }
    errCodeMessages: any = {
        401: 'The user credentials are incorrect.',
        403: 'Forbidden. The user is not an admin or does not have the CICD role.',
        404: 'Not found. The requested item was not found.',
        405: 'Invalid method. The functionality is disabled.',
        409: 'Conflict. The requested item is not unique.',
        500: 'Internal server error. An unexpected error occurred while processing the request.',
    }

    constructor(props: AppProps) {
        this.props = props
        this.snowSourceInstance = props.snowSourceInstance
        this.user = {
            username: props.username,
            password: props.password,
        }
        this.config = {
            headers: {
                'User-Agent': 'sncicd_extint_github',
                Accept: 'application/json',
            },
            auth: this.user,
        }
    }

    buildParams(options: Params): string {
        return (
            Object.keys(options)

                // eslint-disable-next-line no-prototype-builtins,@typescript-eslint/ban-ts-comment
                // @ts-ignore
                // eslint-disable-next-line no-prototype-builtins
                .filter(key => options.hasOwnProperty(key) && options[key])
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                .map(key => `${key}=${encodeURIComponent(options[key])}`)
                .join('&')
        )
    }

    /**
     * Takes options object, convert it to encoded URI string
     * and append to the request url
     *
     * @param options   Set of options to be appended as params
     *
     * @returns string  Url to API
     */
    buildRequestUrl(options: Params): string {
        if (!this.props.snowSourceInstance || (!options.app_sys_id && !options.app_scope))
            throw new Error(Errors.INCORRECT_CONFIG)

        const params: string = this.buildParams(options)
        return `https://${this.props.snowSourceInstance}.service-now.com/api/sn_cicd/sc/apply_changes?${params}`
    }

    /**
     * Makes the request to SNow api apply_changes
     *
     * @param branch    The name of the branch to be applied
     *                  on the SNow side
     *
     * @returns         Promise void
     */
    async applyChanges(branch: branch_name): Promise<void> {
        // build the request api url
        const options: Params = {}
        if (!this.props.appSysID) {
            options.app_scope = this.props.scope
        } else {
            options.app_sys_id = this.props.appSysID
        }

        const url: string = this.buildRequestUrl(options)
        // set the branch to update on SNow side
        const body: RequestBody = {
            branch_name: branch,
        }
        try {
            const response: ApplyResponse = await axios.post(url, body, this.config)
            await this.printStatus(response.data.result)
        } catch (error) {
            let message: string
            if (error.response && error.response.status) {
                if (this.errCodeMessages[error.response.status]) {
                    message = this.errCodeMessages[error.response.status]
                } else {
                    const result: ErrorResult = error.response.data.result
                    message = result.error || result.status_message
                }
            } else {
                message = error.message
            }
            throw new Error(message)
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
    sleep(ms: number): Promise<void> {
        return new Promise(resolve => {
            setTimeout(resolve, ms)
        })
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
    async printStatus(result: ApplyResult): Promise<void> {
        if (+result.status === ResponseStatus.Pending) core.info(result.status_label)

        if (+result.status === ResponseStatus.Running) core.info(`${result.status_label}: ${result.percent_complete}%`)

        // Recursion to check the status of the request
        if (+result.status < ResponseStatus.Successful) {
            const response: ApplyResponse = await axios.get(result.links.progress.url, this.config)
            // Throttling
            await this.sleep(this.sleepTime)
            // Call itself if the request in the running or pending state
            await this.printStatus(response.data.result)
        } else {
            core.info(result.status_message)
            core.info(result.status_detail)

            // Log the success result, the step of the pipeline is success as well
            if (+result.status === ResponseStatus.Successful) {
                core.info(result.status_label)
            }

            // Log the failed result, the step throw an error to fail the step
            if (+result.status === ResponseStatus.Failed) {
                throw new Error(result.error)
            }

            // Log the canceled result, the step throw an error to fail the step
            if (+result.status === ResponseStatus.Canceled) {
                throw new Error(this.messages.canceledMsg)
            }
        }
    }
}
