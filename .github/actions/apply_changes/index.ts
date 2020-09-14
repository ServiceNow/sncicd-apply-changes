import * as github from '@actions/github'
import * as core from '@actions/core'
import App from '../../../App'
import { AppProps, branch_name, Errors } from '../../../types/app.types'

export const configMsg = '. Configure Github secrets please'

export const run = (): void => {
    try {
        const errors: string[] = []
        const { snowUsername = '', snowPassword = '', snowSourceInstance = '', appSysID = '' } = process.env

        if (!snowUsername) {
            errors.push(Errors.USERNAME)
        }
        if (!snowPassword) {
            errors.push(Errors.PASSWORD)
        }
        if (!snowSourceInstance) {
            errors.push(Errors.INSTANCE)
        }
        if (!appSysID) {
            errors.push(Errors.APPSYSID)
        }

        if (errors.length) {
            core.setFailed(`${errors.join('. ')}${configMsg}`)
        } else {
            let branch: branch_name = github.context.ref
            if (branch) {
                const splitted: string[] = branch.split('/')
                branch = splitted[splitted.length - 1]
            }
            const props: AppProps = {
                username: snowUsername,
                password: snowPassword,
                snowSourceInstance: snowSourceInstance,
            }
            const app = new App(props)

            app.applyChanges(branch, appSysID).catch(error => {
                core.setFailed(error.message)
            })
        }
    } catch (error) {
        core.setFailed(error.message)
    }
}

run()
