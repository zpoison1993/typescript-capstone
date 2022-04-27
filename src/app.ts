type RequestStatus = {
  status: HTTP_STATUS
}

interface IObserver {
  next(request: IRequestValue):void
  error(error: unknown):void
  complete():void
}

interface IUnsubscriber {
  unsubscribe(): void
}

interface IObserverExtended extends IObserver, IUnsubscriber{
  _unsubscribe?: () => void
}

enum USER_ROLE {
  USER = 'user',
  ADMIN = 'admin'
}

interface IUser {
  name: string
  age: number
  roles: `${USER_ROLE}`[]
  createdAt: Date
  isDeleted: boolean
}

enum HTTP_METHOD {
  POST = 'POST',
  GET = 'GET'
}

enum HTTP_STATUS {
  OK = 200,
  SERVER_ERROR = 500
}

interface IRequestValue {
  method: `${HTTP_METHOD}`
  host: string
  path: string
  params: object
  body?: IUser
}

class Observer implements IObserverExtended{
  private isUnsubscribed = false;
  private handlers: IObserver;
  public _unsubscribe?: () => void

  constructor(handlers: IObserver) {
    this.handlers = handlers;
  }

  next(value: IRequestValue) {
    if (this.handlers.next && !this.isUnsubscribed) {
      this.handlers.next(value);
    }
  }

  error(error: unknown) {
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
  private readonly _subscribe: (observer: IObserver) => () => void;
  constructor(subscribe: (observer: IObserver) => () => void) {
    this._subscribe = subscribe;
  }

  static from(values: IRequestValue[]): Observable {
    return new Observable((observer: IObserver) => {
      values.forEach((value) => observer.next(value));

      observer.complete();

      return () => {
        console.log('unsubscribed');
      };
    });
  }

  subscribe(obs: IObserver): IUnsubscriber {
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


const userMock: IUser = {
  name: 'User Name',
  age: 26,
  roles: [
    'user',
    'admin'
  ],
  createdAt: new Date(),
  isDeleted: false,
};

const requestsMock: IRequestValue[] = [
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

const handleRequest = (_request: IRequestValue): RequestStatus => {
  // handling of request
  console.log('next', _request)
  return {status: HTTP_STATUS_OK};
};
const handleError = (_error: unknown): RequestStatus => {
  // handling of error
  console.log('error', _error)
  return {status: HTTP_STATUS_INTERNAL_SERVER_ERROR};
};

const handleComplete = () => console.log('complete');

const requests$ = Observable.from(requestsMock);

const subscription = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete
});

subscription.unsubscribe();
