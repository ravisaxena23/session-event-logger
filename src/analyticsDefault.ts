import { AnalyticsOptions } from './analyticsInterface'

const defaultOptions = {
    baseUrl: '',
    retryLimit: 5,
    eventQueueTime: 0,
    heartBeatTime: 10000,
    heartBeatPayload: {},
    id: '',
    sendEventsInQueue: false,
    heartBeatUrl: '',
    sessionUrl: ''
} as AnalyticsOptions

let userToken: any
let userPubKey: any

function getReqParams(parameters?: any) {
    var authParams = getApiRequest();
    parameters = parameters || {};
    for (var key in authParams) {
        parameters[key] = authParams[key];
    }
    return convertApiParam(parameters);
}

function getApiRequest() {
    var data: any = {};
    data.token = userToken ?? undefined;
    data.pubKey = userPubKey ?? undefined;
    return data;
}

function convertApiParam(data: any): string {
    var result: string = "",
        shouldAddSeperate: boolean = false;
    for (var key in data) {
        if (shouldAddSeperate) {
            result += "&";
        }
        result += key;
        data[key] = typeof data[key] !== "object" ? data[key] : JSON.stringify(data[key]);
        result += ("=" + encodeURIComponent(data[key]));
        shouldAddSeperate = true;
    }
    return result;
}

function post(url: string, data: any): Promise<any> {
    const header = { 'Content-Type': 'application/x-www-form-urlencoded' };
    data = getReqParams(data)
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: 'POST',
            headers: header,
            body: new URLSearchParams(data),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                } else {
                    resolve(true)
                }
            })
            .catch(error => {
                reject(error);
            });
    });
}

function setUserToken(token: any) {
    userToken = token;
}

function setUserPubKey(pubKey: any) {
    userPubKey = pubKey;
}



export {
    post,
    setUserToken,
    setUserPubKey,
    defaultOptions
};

