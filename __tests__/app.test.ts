import App from '../App'

let props: any = {
    snowSourceInstance: '',
    username: '',
    password: '',
}

describe('Lib', () => {
    describe('builds url with', () => {
        props.snowSourceInstance = 'test-test'
        let app_sys_id: any = '123'
        const app = new App(props)
        it('correct params', () => {
            expect(app.buildRequestUrl(props.snowSourceInstance, app_sys_id)).toEqual(
                `https://${props.snowSourceInstance}.service-now.com/api/sn_cicd/sc/apply_changes?app_sys_id=${app_sys_id}`,
            )
        })

        it('throw an error without params', () => {
            props.snowSourceInstance = undefined
            app_sys_id = undefined
            expect(() => app.buildRequestUrl(props.snowSourceInstance, app_sys_id)).toThrow(
                app.messages.incorrectConfig,
            )
        })
    })

    it('sleep resolves in a given amount of time', done => {
        const app = new App(props)
        const time = 1001
        setTimeout(() => done(new Error("it didn't resolve or took longer than expected")), time)
        app.sleep(time - 100).then(done)
    })

    // describe('log the status of the request', () => {
    //
    //     const result = {
    //         links: {
    //             progress: {
    //                 id: "1",
    //                 url: "http://xyz.com",
    //             },
    //         },
    //         status: '0',
    //         status_label: 'pending',
    //         status_message: '',
    //         status_detail: '',
    //         error: '',
    //         percent_complete: 0,
    //     }
    //
    //     const response: any = {
    //         data: {
    //             result: {
    //                 ...result,
    //                 status: 2
    //             }
    //         }
    //     }
    //     const mock = jest.spyOn(axios, 'get');
    //     mock.mockResolvedValue(response);
    //
    //     jest.spyOn(global.console, 'log')
    //     const app = new App(props)
    //
    //     it("log the pending status", async () => {
    //
    //         await app.printStatus(result)
    //         expect(console.log).toHaveBeenCalledWith("qwe")
    //         expect(console.log).toHaveBeenCalledWith("qweasd")
    //         expect(console.log).toHaveBeenCalledWith("qweasdzxc")
    //         expect(console.log).toHaveBeenCalledTimes(1)
    //     })
    // })

    afterEach(() => {
        jest.resetAllMocks()
        jest.clearAllMocks()
        jest.clearAllTimers()
        props = {
            password: '',
            username: '',
            snowSourceInstance: '',
        }
    })
})
