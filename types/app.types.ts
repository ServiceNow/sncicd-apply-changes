export interface User {
    username: string;
    password: string;
}

export interface AppProps extends User {
    snowSourceInstance: string;
}

export interface RequestBody {
    branch_name: branch_name;
}

export type branch_name = string | undefined

export enum Errors {
    USERNAME = 'Username is not set',
    PASSWORD = 'Password is not set',
    INSTANCE = 'Instance is not set',
    APPSYSID = 'AppSysID is not set',
    GITHUB_TOKEN = 'GITHUB_TOKEN is missing',
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

export enum ResponseStatus {
    Pending = 0,
    Running = 1,
    Successful = 2,
    Failed = 3,
    Canceled = 4,
}

export interface axiosConfig {
    headers: {
        Accept: string,
    };
    auth: User;
}
