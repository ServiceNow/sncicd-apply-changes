export interface User {
    username: string;
    password: string;
}

export interface AppProps extends User {
    nowSourceInstance: string;
    appSysID?: string;
    branch?: string;
    scope?: string;
}

export interface RequestBody {
}

export interface Params {
    app_scope?: string;
    app_sys_id?: string;
    branch_name?: string;
}

export type branch_name = string | undefined

export enum Errors {
    USERNAME = 'nowUsername is not set',
    PASSWORD = 'nowPassword is not set',
    INSTANCE = 'nowSourceInstance is not set',
    SYSID_OR_SCOPE = 'Please specify scope or sys_id',
    INCORRECT_CONFIG = 'Configuration is incorrect',
}

export interface ApplyResponse {
    data: {
        result: ApplyResult,
    };
}

export interface ApplyResult {
    links: {
        progress: {
            id: string,
            url: string,
        },
    };
    status: string;
    status_label: string;
    status_message: string;
    status_detail: string;
    error: string;
    percent_complete: number;
}

export interface ErrorResult {
    status: string;
    status_label: string;
    status_message: string;
    status_detail: string;
    error: string;
}

export enum ResponseStatus {
    Pending = 0,
    Running = 1,
    Successful = 2,
    Failed = 3,
    Canceled = 4,
}

export interface axiosConfig {
    headers: {
        'User-Agent': string,
        Accept: string,
    };
    auth: User;
}
