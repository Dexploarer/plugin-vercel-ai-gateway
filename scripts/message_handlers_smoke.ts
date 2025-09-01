import 'dotenv/config';
import { installMessagingProbes, MessagingLike } from '../src/debug/handler_probe';

let savedReceive: any = null;
const messaging: MessagingLike = {
  registerSendHandler: (_s, _fn) => {},
  registerReceiveHandler: (_s, fn) => { savedReceive = fn; },
  receive: async (msg) => { if (savedReceive) await savedReceive(msg); },
};

function bootstrapTelegram() {
  messaging.registerSendHandler('telegram', async (_args) => {});
  messaging.registerReceiveHandler('telegram', async (msg) => {
    console.log('[RX] telegram:', msg.text);
  });
}

async function main() {
  const probe = installMessagingProbes(messaging);
  bootstrapTelegram();
  probe.assertReady('telegram');

  await messaging.receive({
    source: 'telegram',
    userId: 'u1',
    roomId: 'r1',
    text: 'hello',
    meta: { update_id: 1 },
  });

  const st = probe.getState();
  if (st.recvCount < 1) throw new Error('receive not invoked');
  console.log('OK: receive invoked. count=', st.recvCount);
}

main().catch((e) => {
  console.error('FAIL message_handlers_smoke:', e?.message || e);
  process.exit(2);
});

