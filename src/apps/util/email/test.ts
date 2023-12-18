import emailUtil, { Context, SendOptions, SendReturn } from '.';

type SentEmail = {
    from?: string;
    to: string | string[];
    sender?: string;
    subject: string;
    html: string;
    text: string;
};

type TestContext = Context & {
    sentEmails: SentEmail[];
    sentStyledEmails: SentEmail[];
};

function getTextFromHtml(html: string): string {
    return html
        .replace(/<.+=".+">/gu, '< >')
        .replace(/<[-/a-zA-Z0-9"' ]+>/gu, '')
        .replace(/\s+/gu, ' ')
        .trim();
}

export function init(): TestContext {
    const context: TestContext = {
        transporter: null,
        sentEmails: [],
        sentStyledEmails: [],
    };
    return context;
}

export function makeDependency(context: TestContext = null): typeof emailUtil {
    if (!context) {
        context = init();
    }
    return {
        init: () => null,
        send: (options: SendOptions): Promise<SendReturn> => {
            context.sentEmails.push({
                ...options,
                text: getTextFromHtml(options.html),
            });
            return Promise.resolve({});
        },
        sendStyled: (options: SendOptions): Promise<SendReturn> => {
            context.sentStyledEmails.push({
                ...options,
                text: getTextFromHtml(options.html),
            });
            return Promise.resolve({});
        },
    };
}

export default {
    init,
    makeDependency,
};
