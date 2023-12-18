import nodemailer, { Transporter, createTransport } from 'nodemailer';
import logger from '../log';

export type Context = {
  transporter: Transporter;
};

export const globalContext: Context = {
  transporter: null,
};

function init(context: Context = globalContext): Context {
  console.log('email service initialised');

  context.transporter = createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  return context;
}

export type SendOptions = {
  from?: string;
  to: string | string[];
  sender?: string;
  subject: string;
  html: string;
  attachments?: {
    filename: string;
    content: Buffer | string;
    cid?: string;
  }[];
};

export type SendReturn = {
  messageId?: string;
  envelope?: any;
  accepted?: Array<any>;
  rejected?: Array<any>;
  pending?: Array<any>;
  response?: string;
};

async function send(
  options: SendOptions,
  context: Context = globalContext,
): Promise<SendReturn> {
  const sendMailOptions = {
    from: options.from || 'noreply@q-int.com',
    to: options.to,
    sender: options.sender,
    subject: options.subject,
    html: options.html,
    attachments: options.attachments,
  };

  if (process.env.NODE_ENV !== 'production') {
    logger.log('email', 'If it were production, would have sent E-mail', [
      sendMailOptions,
    ]);
    return Promise.resolve({});
  }

  const info = await context.transporter.sendMail(sendMailOptions);
  return {
    messageId: info.messageId,
    envelope: info.envelope,
    accepted: info.accepted,
    rejected: info.rejected,
    pending: info.pending,
    response: info.response,
  };
}

function sendStyled(
  options: SendOptions & { rtl?: boolean },
  context: Context = globalContext,
): Promise<SendReturn> {
  return send(
    {
      ...options,
      html: `<html dir="${options.rtl ? 'rtl' : 'ltr'}" >
    <head>
        <style>
            body {
                font-family: 'Poppins', sans-serif;
                font-size: 19px;
                color: #000;
            }

            a {
                color: #5bc6f9;
            }

            h1, h2, h3, h4, h5 {
                margin: 0;
                margin-bottom: 0.25em;
                color: #5bc6f9;
                font-size: 1.5em;
                text-align: center;
            }
        </style>
    </head>
    <body>${options.html}</body>
</html>`,
    },
    context,
  );
}

export default {
  init,
  send,
  sendStyled,
};
