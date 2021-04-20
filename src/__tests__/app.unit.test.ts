import * as core from '@actions/core'
import axios from 'axios'
import App from '../App'
import { ApplyResponse, AppProps, Errors, Params } from '../types/app.types'

describe(`App lib`, () => {
    let props: AppProps

    beforeAll(() => {
        // Mock error/warning/info/debug
        jest.spyOn(core, 'error').mockImplementation(jest.fn())
        jest.spyOn(core, 'warning').mockImplementation(jest.fn())
        jest.spyOn(core, 'info').mockImplementation(jest.fn())
        jest.spyOn(core, 'debug').mockImplementation(jest.fn())
    })

    beforeEach(() => {
        props = { appSysID: '', password: '', scope: '', nowSourceInstance: 'test', username: '' }
    })
    describe(`builds request url`, () => {
        it(`with correct params`, () => {
            props.appSysID = '123'

            const options: Params = { app_sys_id: props.appSysID }
            const app = new App(props)

            expect(app.buildRequestUrl(options)).toEqual(
                `https://${props.nowSourceInstance}.service-now.com/api/sn_cicd/sc/apply_changes?app_sys_id=${options.app_sys_id}`,
            )
        })
        it(`without instance parameter`, () => {
            props.nowSourceInstance = ''
            props.appSysID = '123'
            const options: Params = { app_scope: props.scope, app_sys_id: props.appSysID }
            const app = new App(props)

            expect(() => app.buildRequestUrl(options)).toThrow(Errors.INCORRECT_CONFIG)
        })
        it(`with just sys_id parameter`, () => {
            props.appSysID = '123'
            const options: Params = { app_sys_id: props.appSysID }
            const app = new App(props)

            expect(app.buildRequestUrl(options)).toEqual(
                `https://${props.nowSourceInstance}.service-now.com/api/sn_cicd/sc/apply_changes?app_sys_id=${options.app_sys_id}`,
            )
        })
        it(`with just scope parameter`, () => {
            props.scope = '123'
            const options: Params = { app_scope: props.scope }
            const app = new App(props)

            expect(app.buildRequestUrl(options)).toEqual(
                `https://${props.nowSourceInstance}.service-now.com/api/sn_cicd/sc/apply_changes?app_scope=${options.app_scope}`,
            )
        })
    })

    it(`Apply Changes`, () => {
        const post = jest.spyOn(axios, 'post')
        const response: ApplyResponse = {
            data: {
                result: {
                    links: {
                        progress: {
                            id: 'id',
                            url: 'http://test.xyz',
                        },
                    },
                    status: '2',
                    status_label: 'success',
                    status_message: 'label',
                    status_detail: 'detail',
                    error: '',
                    percent_complete: 100,
                },
            },
        }
        post.mockResolvedValue(response)
        props.appSysID = '123'
        const app = new App(props)
        app.applyChanges()
        expect(post).toHaveBeenCalled()
    })
})
