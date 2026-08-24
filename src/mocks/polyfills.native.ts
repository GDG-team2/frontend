import "fast-text-encoding";
import "react-native-url-polyfill/auto";
import "web-streams-polyfill/polyfill";

type NativeMessageEventInit<T> = {
  data?: T;
  origin?: string;
  lastEventId?: string;
  source?: unknown;
  ports?: readonly unknown[];
};

class NativeMessageEvent<T = unknown> {
  readonly type: string;
  readonly data: T | null;
  readonly origin: string;
  readonly lastEventId: string;
  readonly source: unknown;
  readonly ports: readonly unknown[];
  defaultPrevented = false;

  constructor(type: string, init?: NativeMessageEventInit<T>) {
    this.type = type;
    this.data = init?.data ?? null;
    this.origin = init?.origin ?? "";
    this.lastEventId = init?.lastEventId ?? "";
    this.source = init?.source ?? null;
    this.ports = init?.ports ?? [];
  }

  preventDefault() {
    this.defaultPrevented = true;
  }

  stopPropagation() {}

  stopImmediatePropagation() {}
}

class NativeBroadcastChannel {
  readonly name: string;
  onmessage: null = null;
  onmessageerror: null = null;

  constructor(name: string) {
    this.name = name;
  }

  postMessage() {}

  close() {}

  addEventListener() {}

  removeEventListener() {}

  dispatchEvent() {
    return true;
  }
}

const nativeGlobal = globalThis as typeof globalThis & {
  MessageEvent?: typeof MessageEvent;
  BroadcastChannel?: typeof BroadcastChannel;
};

nativeGlobal.MessageEvent ??= NativeMessageEvent as unknown as typeof MessageEvent;
nativeGlobal.BroadcastChannel ??= NativeBroadcastChannel as unknown as typeof BroadcastChannel;

type ReactNativeResponse = Response & {
  _bodyText?: string;
};

// React Native's whatwg-fetch keeps text bodies in a private field and does
// not expose the standard Response.body getter. MSW's fetch interceptor reads
// that getter when it forwards a mocked response.
if (typeof Response !== "undefined" && !Object.getOwnPropertyDescriptor(Response.prototype, "body")) {
  Object.defineProperty(Response.prototype, "body", {
    configurable: true,
    get(this: ReactNativeResponse) {
      return this._bodyText ?? null;
    },
  });
}
