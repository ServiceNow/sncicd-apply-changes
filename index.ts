import * as core from '@actions/core'
import App from './src/App'
import { AppProps, Errors } from './src/types/app.types'

export const configMsg = '. Configure Github secrets please'

export const run = (): void => {
    try {
        const errors: string[] = []
        const {
            nowUsername = '',
            nowPassword = '',
            nowSourceInstance = '',
            appSysID = '',
            appScope = '',
            branch = '',
        } = process.env

        if (!nowUsername) {
            errors.push(Errors.USERNAME)
        }
        if (!nowPassword) {
            errors.push(Errors.PASSWORD)
        }
        if (!nowSourceInstance) {
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
                username: nowUsername,
                password: nowPassword,
                nowSourceInstance: nowSourceInstance,
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
