import {
    ApplyResponse,
    ApplyResult,
    AppProps,
    branch_name,
    RequestBody,
    ResponseStatus,
    User,
    axiosConfig,
} from './types/app.types'
import axios from 'axios'

export default class App {
    sleepTime = 3000

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
        this.snowSourceInstance = props.snowSourceInstance
        this.user = {
            username: props.username,
            password: props.password,
        }
        this.config = {
            headers: { Accept: 'application/json' },
            auth: this.user,
        }
    }

    buildRequestUrl(instance: string, appSysId: string): string {
        if (!instance || !appSysId) throw new Error(this.messages.incorrectConfig)
        return `https://${instance}.service-now.com/api/sn_cicd/sc/apply_changes?app_sys_id=${appSysId}`
    }

    /**
     * Makes the request to SNow api apply_changes
     *
     * @param branch    The name of the branch to be applied
     *                  on the SNow side
     * @param appSysId  sys_id of the servicenow app
     *
     * @returns         Promise void
     */
    async applyChanges(branch: branch_name, appSysId: string): Promise<void> {
        // build the request api url
        const url: string = this.buildRequestUrl(this.snowSourceInstance, appSysId)
        // set the branch to update on SNow side
        const body: RequestBody = {
            branch_name: branch,
        }
        try {
            const response: ApplyResponse = await axios.post(url, body, this.config)
            await this.printStatus(response.data.result)
        } catch (error) {
            let message: string
            if (error.code) {
                message = this.errCodeMessages[error.code || error.response.status]
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
        if (+result.status === ResponseStatus.Pending) console.log(result.status_label)

        if (+result.status === ResponseStatus.Running)
            console.log(`${result.status_label}: ${result.percent_complete}%`)

        // Recursion to check the status of the request
        if (+result.status < ResponseStatus.Successful) {
            const response: ApplyResponse = await axios.get(result.links.progress.url, this.config)
            // Throttling
            await this.sleep(this.sleepTime)
            // Call itself if the request in the running or pending state
            await this.printStatus(response.data.result)
        } else {
            console.log(result.status_message)
            console.log(result.status_detail)

            // Log the success result, the step of the pipeline is success as well
            if (+result.status === ResponseStatus.Successful) {
                console.log(result.status_label)
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
