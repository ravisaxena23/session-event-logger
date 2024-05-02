# Analytics Module README

## Overview

This analytics module provides functionality to track user sessions and events and send data to a server for analysis. It offers flexibility in configuration, allowing customization of parameters such as server URLs, retry limits, heartbeat intervals, and more.

## File Structure

- `analyticsMain.ts`: Contains the main logic for managing sessions, tracking events, and sending data to the server.
- `analyticsInterface.ts`: Defines interfaces for analytics options and the main analytics module.
- `analytics.ts`: Implements the main analytics module based on the defined interfaces.
- `analyticsDefault.ts`: Provides default options and helper functions for sending HTTP requests.

## Usage

### Configuration

Before using the analytics module, you need to configure it with the desired options. You can configure the following options:

- `baseUrl` (string): The base URL of the analytics server. Default is an empty string.
- `retryLimit` (number): The maximum number of retries for failed event submissions. Default is 5.
- `eventQueueTime` (number): The interval (in milliseconds) at which queued events are sent to the server. Default is 0 (disabled).
- `heartBeatTime` (number): The interval (in milliseconds) at which heartbeat events are sent to the server. Default is 10000 (10 seconds).
- `heartBeatPayload` (any): Additional data to include in heartbeat events. Default is an empty object.
- `id` (string or number): Identifier for the participant. Default is an empty string.
- `sendEventsInQueue` (boolean): Whether to send events immediately or queue them. Default is `false`.
- `heartBeatUrl` (string): The URL for sending heartbeat events. Default is an empty string.
- `sessionUrl` (string): The URL for starting sessions. Default is an empty string.

To configure the analytics module, use the `configure` method:

```typescript
import Analytics from './analytics';

const options = {
    baseUrl: 'https://example.com/analytics',
    retryLimit: 3,
    eventQueueTime: 5000,
    // Other options...
};

Analytics.configure(options)
    .then(() => {
        console.log('Analytics module configured successfully');
    })
    .catch((error) => {
        console.error('Error configuring analytics module:', error);
    });
```
#### Session Management

To start a session, use the startSession method:
token and pubkey are for authorization 

```typescript 
import Analytics from './analytics';

const sessionData = {
    // Session data object...
};

Analytics.startSession(sessionData,token,pubkey)
    .then(() => {
        console.log('Session started successfully');
    })
    .catch((error) => {
        console.error('Error starting session:', error);
    });
```

```json
{
    "sessionId": "<generated session ID>",
    "clientTimestamp": "<current timestamp>",
    "uniqueId": "<ID>",
    "data":"sessionData"
}
```

To end a session, use the endSession method:

```typescript 
import Analytics from './analytics';

Analytics.endSession()
    .then(() => {
        console.log('Session ended successfully');
    })
    .catch((error) => {
        console.error('Error ending session:', error);
    });

```

#### Event Tracking

To track an event, use the trackEvent method:

```typescript 
import Analytics from './analytics';

const eventName = 'button_click';
const eventData = {
    // Event data object...
};

Analytics.trackEvent(eventName, eventData)
    .then(() => {
        console.log('Event tracked successfully');
    })
    .catch((error) => {
        console.error('Error tracking event:', error);
    });
```

```json
{
    "eventType": "<event type>",
    "data": {
        // Event-specific data...
    },
    "sessionId": "<current session ID>",
    "clientTimestamp": "<current timestamp>",
    "uniqueId": "<ID>",
    // Other event-related data...
}
```

#### hearBeat
To check if session is active or not

```json
{
    "sessionId": "<current session ID>",
    "clientTimestamp": "<current timestamp>",
    "uniqueId": "<ID>",
    "heartBeatPayload":"heartBeatPayload"
    // Other heartbeat data...
}

```
#### Default Values
The analytics module provides default values for configuration options. Here are the default values:
```
baseUrl: ""
retryLimit: 5
eventQueueTime: 0
heartBeatTime: 10000
heartBeatPayload: {}
id: ""
sendEventsInQueue: false
heartBeatUrl: ""
sessionUrl: ""
```