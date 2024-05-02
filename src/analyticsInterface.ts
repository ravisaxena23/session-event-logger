export interface AnalyticsOptions {
    baseUrl?: string;
    retryLimit?: number;
    eventQueueTime?: number;
    heartBeatTime?: number;
    heartBeatPayload?: any;
    id?: string | number;
    sendEventsInQueue?: boolean;
    heartBeatUrl?: string;
    sessionUrl?: string
    token?: string
}

export interface Analytics {
    configure(options: AnalyticsOptions): Promise<void>;
    startSession(sessionData: any, token: any, pubKey: any): Promise<any>;
    endSession(): Promise<void>;
    trackEvent(eventName: string, eventData: any): Promise<void>;
}
