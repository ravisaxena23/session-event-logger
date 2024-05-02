import {
    post,
    setUserToken,
    setUserPubKey,
    defaultOptions
} from "./analyticsDefault";

import { AnalyticsOptions } from './analyticsInterface'

let sessionActive: boolean = false;
let eventQueue: any[] = [];
let sendQueuedEventsInTime: NodeJS.Timeout;
let heartbeatInterval: NodeJS.Timeout;
let sessionId: string;
let configureOptions: AnalyticsOptions

// function to generate unique session id
function generateUniqueSessionId() {
    sessionId =
        Date.now().toString(16).slice(3) +
        "-" +
        Math.random().toString(16).slice(2, 10) +
        "-" +
        configureOptions.id?.toString();
}

// function to send Data to server
function sendData(eventData: any = []) {
    let eventPayload = {
        data: {
            sessionId: sessionId,
            events: eventData,
            clientTimestamp: new Date().getTime(),
            uniqueId: configureOptions.id
        }
    }
    post(configureOptions.baseUrl, eventPayload).catch((error: any) => {
        handleFailedEvent(eventData);
    })
}

// handles failed event
function handleFailedEvent(payload: any[]) {
    payload.forEach((event) => {
        if (event.retryCount === undefined) {
            event.retryCount = 0;
        }
        if (event.retryCount < configureOptions.retryLimit) {
            event.retryCount++;
            eventQueue.push(event);
            console.log(
                "Event failed to send. Retrying (" +
                event.retryCount +
                "/" +
                configureOptions.retryLimit +
                ")..."
            );


        } else {
            console.log(
                "Event failed to send after " + configureOptions.retryLimit + " retries:",
                event
            );
           
        }
    })
}

// if data is present in queue send data else hearBeat
function sendQueuedEvents() {
    if (eventQueue.length > 0) {
        console.log("Sending queued events...")
        sendData(eventQueue);
        eventQueue = [];
    } else if (configureOptions.eventQueueTime > 0 && configureOptions.sendEventsInQueue) {
        sendHeartbeat();
    }
}

// start heartBeat in case of sendEventsInQueue is false
function startHeartbeat(heartBeatTime: number) {
    if (!configureOptions.sendEventsInQueue) {
        heartbeatInterval = setInterval(sendHeartbeat, heartBeatTime);
    }
}

// function to send heartBeat
function sendHeartbeat() {
    let payload: any = {};
    let data: any = {}
    if (configureOptions.heartBeatPayload.length) {
        data = configureOptions.heartBeatPayload
    }
    data.sessionId = sessionId
    data.clientTimestamp = new Date().getTime()
    data.uniqueId = configureOptions.id
    payload.data = data
    try {
        post(configureOptions.heartBeatUrl, payload)
    } catch (error) {
        throw error;
    }
}

// handle session close unexpectedly
function handleBeforeUnload() {
    window.addEventListener("beforeunload", function (event) {
        event.preventDefault();
        event.returnValue = "Session is being closed";
        sendData(eventQueue)
        sendHeartbeat()
        endSessionInternal();
    });
    console.log("Event added...");
}

// configure the internal variables
function configureInternal(options: AnalyticsOptions) {
    configureOptions = {
        baseUrl: options.baseUrl || defaultOptions.baseUrl,
        retryLimit: options.retryLimit || defaultOptions.retryLimit,
        eventQueueTime: options.eventQueueTime || defaultOptions.eventQueueTime,
        heartBeatTime: options.heartBeatTime || defaultOptions.heartBeatTime,
        heartBeatPayload: options.heartBeatPayload || defaultOptions.heartBeatPayload,
        id: options.id || defaultOptions.id,
        sendEventsInQueue: options.sendEventsInQueue || defaultOptions.sendEventsInQueue,
        heartBeatUrl: options.heartBeatUrl || defaultOptions.heartBeatUrl,
        sessionUrl: options.sessionUrl || defaultOptions.sessionUrl
    }
}

// if sendEventsInQueue is present send the data at that interval
function sendQueuedEventsAtInterval() {
    if (configureOptions.sendEventsInQueue) {
        sendQueuedEventsInTime = setInterval(sendQueuedEvents, configureOptions.eventQueueTime);
    }
}

// function to start the session
function startSessionInternal(sessionData: any, token: any = '', pubKey: any = ''): Promise<any> {
    try {
        return new Promise<boolean>((resolve, reject) => {
            generateUniqueSessionId()
            if (sessionId) {
                setUserToken(token)
                setUserPubKey(pubKey)
                sessionData.sessionId = sessionId
                sessionData.clientTimestamp = new Date().getTime()
                let payload = {
                    data: sessionData,
                };
                resolve(startSessionApiCall(payload))
            } else {
                reject(false)
                throw "Please create session";
            }
        })
    } catch (error) {
        throw error
    }
}

function startSessionApiCall(sessionData: any): Promise<any> {
    try {
        return new Promise<boolean>((resolve, reject) => {
            post(configureOptions.sessionUrl, sessionData).then(
                (response: any) => {
                    handleBeforeUnload();
                    if (configureOptions.eventQueueTime > 0 && configureOptions.sendEventsInQueue) {
                        sendQueuedEventsAtInterval();
                    } else if (configureOptions.heartBeatTime) {
                        startHeartbeat(configureOptions.heartBeatTime);
                    }
                    sendHeartbeat()
                    sessionActive = true;
                    console.log("Session started");
                    resolve(true)
                }
            ).catch((error: any) => {
                console.log("Analytics server returned an error:", error);
                reject(false)
            })
        })
    } catch (error) {
        throw error;
    }
}

// function to end the session
function endSessionInternal() {
    clearInterval(heartbeatInterval);
    clearInterval(sendQueuedEventsInTime);
    sessionActive = false;
    console.log("Ending session...");
}

// function to track event.
function trackEventInternal(eventName: string, eventData: any) {
    try {
        if (sessionId && sessionActive) {
            var payload = {
                eventType: eventName,
                data: eventData,
            };
            eventQueue.push(payload);
            if (!configureOptions.sendEventsInQueue) {
                sendQueuedEvents();
            }
        } else if (!sessionId) {
            throw "track event please create session";
        } else if (!sessionActive) {
            console.error("Session is over. Cannot track event:", eventName);
        } else {
            throw "Some Error Occured";
        }
    } catch (error) {
        console.log(error);
        return;
    }
}

export {
    configureInternal,
    startSessionInternal,
    endSessionInternal,
    trackEventInternal,
};
