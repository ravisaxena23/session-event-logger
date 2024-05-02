import {
    configureInternal,
    startSessionInternal,
    endSessionInternal,
    trackEventInternal,
} from "./analyticsMain";

import { AnalyticsOptions } from './analyticsInterface'
import { Analytics } from './analyticsInterface'



const Analytics: Analytics = (function () {
    const exposed: Analytics = {
        configure: function (options: AnalyticsOptions): Promise<void> {
            return new Promise<void>((resolve, reject) => {
                try {
                    configureInternal(options);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        },
        startSession: function (sessionData: any, token: any = '', pubKey: any = ''): Promise<any> {
            return new Promise<boolean>((resolve, reject) => {
                try {
                    resolve(startSessionInternal(sessionData, token, pubKey));
                } catch (error) {
                    reject(error);
                }
            });
        },
        endSession: function (): Promise<void> {
            return new Promise<void>((resolve, reject) => {
                try {
                    endSessionInternal();
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        },
        trackEvent: function (eventName: string, eventData: any): Promise<void> {
            return new Promise<void>((resolve, reject) => {
                try {
                    trackEventInternal(eventName, eventData);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        },
    };

    return exposed;
})();

export default Analytics;
