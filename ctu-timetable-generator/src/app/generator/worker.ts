import type { Data } from '@src/app/generator/lib';

export type MessageData = {
  classes: Array<string>
  semesters: Data
};

export type MessageResult = {
  result: Array<string>
} | {
  rand: number
};

const sendMessage = (message: MessageResult) => postMessage(message);

// eslint-disable-next-line no-restricted-globals
addEventListener('message', async (event: MessageEvent<MessageData>) => {
  let i = 10;
  sendMessage({
    rand: i,
  });

  const interval = setInterval(() => {
    if (i > 0) {
      i--;
      sendMessage({
        rand: i,
      });
    } else {
      sendMessage({
        result: Object.keys(event.data.semesters),
      });
      clearInterval(interval);
    }
  }, 250);
});
