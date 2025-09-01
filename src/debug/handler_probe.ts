export type SendHandler = (args: any) => Promise<any> | any;
export type ReceiveHandler = (msg: { source: string; userId: string; roomId?: string; text: string; meta?: any }) => Promise<any> | any;

export type MessagingLike = {
  registerSendHandler: (source: string, fn: SendHandler) => void;
  registerReceiveHandler: (source: string, fn: ReceiveHandler) => void;
  receive: (msg: { source: string; userId: string; roomId?: string; text: string; meta?: any }) => Promise<void>;
};

export function installMessagingProbes(messaging: MessagingLike) {
  const state = {
    send: new Set<string>(),
    recv: new Set<string>(),
    recvCount: 0,
    last: null as null | { source: string; userId: string; roomId?: string; text: string },
  };

  const origSend = messaging.registerSendHandler.bind(messaging);
  const origRecv = messaging.registerReceiveHandler.bind(messaging);
  const origReceive = messaging.receive.bind(messaging);

  messaging.registerSendHandler = (src, fn) => {
    state.send.add(src);
    console.log('[Probe] send registered:', src);
    origSend(src, async (args) => fn(args));
  };

  messaging.registerReceiveHandler = (src, fn) => {
    state.recv.add(src);
    console.log('[Probe] receive registered:', src);
    origRecv(src, async (msg) => {
      state.recvCount++;
      state.last = { source: msg.source, userId: msg.userId, roomId: msg.roomId, text: msg.text };
      return fn(msg);
    });
  };

  messaging.receive = async (msg) => {
    // Only count via the receive-handler wrapper to avoid double counting
    return origReceive(msg);
  };

  function assertReady(src: string) {
    if (!state.recv.has(src)) throw new Error(`No receive handler for ${src}`);
    if (!state.send.has(src)) console.warn(`[Probe] no send handler for ${src}`);
  }

  return { getState: () => state, assertReady };
}
