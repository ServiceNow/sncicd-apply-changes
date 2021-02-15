import * as core from '@actions/core'
import App from './src/App'
import { AppProps, Errors } from './src/types/app.types'

export const configMsg = '. Configure Github secrets please'

export const run = (): void => {
    try {
        const errors: string[] = []
        const {
            snowUsername = '',
            snowPassword = '',
            snowSourceInstance = '',
            appSysID = '',
            appScope = '',
            branch = '',
        } = process.env

        core.info('index has branch set to: ' + branch)
        core.info('env branch: ' + process.env.branch)
        if (!snowUsername) {
            errors.push(Errors.USERNAME)
        }
        if (!snowPassword) {
            errors.push(Errors.PASSWORD)
        }
        if (!snowSourceInstance) {
            errors.push(Errors.INSTANCE)
        }
        if (!appSysID && !appScope) {
            errors.push(Errors.SYSID_OR_SCOPE)
        }

        if (errors.length) {
            core.setFailed(`${errors.join('. ')}${configMsg}`)
        } else {
            const props: AppProps = {
                appSysID,
                scope: appScope,
                username: snowUsername,
                password: snowPassword,
                snowSourceInstance: snowSourceInstance,
                branch: branch,
            }
            const app = new App(props)

            app.applyChanges().catch(error => {
                core.setFailed(error.message)
            })
        }
    } catch (error) {
        core.setFailed(error.message)
    }
}

run()
