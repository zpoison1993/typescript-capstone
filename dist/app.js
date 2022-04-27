"use strict";
var USER_ROLE;
(function (USER_ROLE) {
    USER_ROLE["USER"] = "user";
    USER_ROLE["ADMIN"] = "admin";
})(USER_ROLE || (USER_ROLE = {}));
var HTTP_METHOD;
(function (HTTP_METHOD) {
    HTTP_METHOD["POST"] = "POST";
    HTTP_METHOD["GET"] = "GET";
})(HTTP_METHOD || (HTTP_METHOD = {}));
var HTTP_STATUS;
(function (HTTP_STATUS) {
    HTTP_STATUS[HTTP_STATUS["OK"] = 200] = "OK";
    HTTP_STATUS[HTTP_STATUS["SERVER_ERROR"] = 500] = "SERVER_ERROR";
})(HTTP_STATUS || (HTTP_STATUS = {}));
class Observer {
    isUnsubscribed = false;
    handlers;
    _unsubscribe;
    constructor(handlers) {
        this.handlers = handlers;
    }
    next(value) {
        if (this.handlers.next && !this.isUnsubscribed) {
            this.handlers.next(value);
        }
    }
    error(error) {
        if (!this.isUnsubscribed) {
            if (this.handlers.error) {
                this.handlers.error(error);
            }
            this.unsubscribe();
        }
    }
    complete() {
        if (!this.isUnsubscribed) {
            if (this.handlers.complete) {
                this.handlers.complete();
            }
            this.unsubscribe();
        }
    }
    unsubscribe() {
        this.isUnsubscribed = true;
        if (this._unsubscribe) {
            this._unsubscribe();
        }
    }
}
class Observable {
    _subscribe;
    constructor(subscribe) {
        this._subscribe = subscribe;
    }
    static from(values) {
        return new Observable((observer) => {
            values.forEach((value) => observer.next(value));
            observer.complete();
            return () => {
                console.log('unsubscribed');
            };
        });
    }
    subscribe(obs) {
        const observer = new Observer(obs);
        observer._unsubscribe = this._subscribe(observer);
        return ({
            unsubscribe() {
                observer.unsubscribe();
            }
        });
    }
}
const HTTP_POST_METHOD = HTTP_METHOD.POST;
const HTTP_GET_METHOD = HTTP_METHOD.GET;
const HTTP_STATUS_OK = HTTP_STATUS.OK;
const HTTP_STATUS_INTERNAL_SERVER_ERROR = HTTP_STATUS.SERVER_ERROR;
const userMock = {
    name: 'User Name',
    age: 26,
    roles: [
        'user',
        'admin'
    ],
    createdAt: new Date(),
    isDeleted: false,
};
const requestsMock = [
    {
        method: HTTP_POST_METHOD,
        host: 'service.example',
        path: 'user',
        body: userMock,
        params: {},
    },
    {
        method: HTTP_GET_METHOD,
        host: 'service.example',
        path: 'user',
        params: {
            id: '3f5h67s4s'
        },
    }
];
const handleRequest = (_request) => {
    console.log('next', _request);
    return { status: HTTP_STATUS_OK };
};
const handleError = (_error) => {
    console.log('error', _error);
    return { status: HTTP_STATUS_INTERNAL_SERVER_ERROR };
};
const handleComplete = () => console.log('complete');
const requests$ = Observable.from(requestsMock);
const subscription = requests$.subscribe({
    next: handleRequest,
    error: handleError,
    complete: handleComplete
});
subscription.unsubscribe();
//# sourceMappingURL=app.js.map