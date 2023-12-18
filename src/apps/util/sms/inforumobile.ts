// https://www.inforu.co.il/wp-content/uploads/2020/12/SMS_API-6.1.pdf
import axios from 'axios';
import { parseStringPromise } from 'xml2js';

class GenericInforuError extends Error {
  constructor(description: string) {
    super(description);
  }
}
class AuthInforuError extends Error {
  constructor(description: string) {
    super(description);
  }
}
class RecipientInforuError extends Error {
  constructor(description: string) {
    super(description);
  }
}
class MessageTextInforuError extends Error {
  constructor(description: string) {
    super(description);
  }
}
class XmlInforuError extends Error {
  constructor(description: string) {
    super(description);
  }
}
class UserQuotaInforuError extends Error {
  constructor(description: string) {
    super(description);
  }
}
class ProjectQuotaInforuError extends Error {
  constructor(description: string) {
    super(description);
  }
}
class CustomerQuotaInforuError extends Error {
  constructor(description: string) {
    super(description);
  }
}
class DateTimeInforuError extends Error {
  constructor(description: string) {
    super(description);
  }
}
class NumberInforuError extends Error {
  constructor(description: string) {
    super(description);
  }
}
class InvalidRecipientInforuError extends Error {
  constructor(description: string) {
    super(description);
  }
}
class SenderNumberInforuError extends Error {
  constructor(description: string) {
    super(description);
  }
}
class SenderNameInforuError extends Error {
  constructor(description: string) {
    super(description);
  }
}
class UserBlockedInforuError extends Error {
  constructor(description: string) {
    super(description);
  }
}
class AuthenticationInforuError extends Error {
  constructor(description: string) {
    super(description);
  }
}
class NetworkTypeInforuError extends Error {
  constructor(description: string) {
    super(description);
  }
}
class NetworkTypesInforuError extends Error {
  constructor(description: string) {
    super(description);
  }
}
class SenderIdentificationInforuError extends Error {
  constructor(description: string) {
    super(description);
  }
}
class SenderIdWhitelistInforuError extends Error {
  constructor(description: string) {
    super(description);
  }
}

function inforuError(status: number, description: string): Error {
  switch (status) {
    case -1:
      return new GenericInforuError(description);
    case -2:
      return new AuthInforuError(description);
    case -6:
      return new RecipientInforuError(description);
    case -9:
      return new MessageTextInforuError(description);
    case -11:
      return new XmlInforuError(description);
    case -13:
      return new UserQuotaInforuError(description);
    case -14:
      return new ProjectQuotaInforuError(description);
    case -15:
      return new CustomerQuotaInforuError(description);
    case -16:
      return new DateTimeInforuError(description);
    case -17:
      return new NumberInforuError(description);
    case -18:
      return new InvalidRecipientInforuError(description);
    case -20:
      return new SenderNumberInforuError(description);
    case -21:
      return new SenderNameInforuError(description);
    case -22:
      return new UserBlockedInforuError(description);
    case -26:
      return new AuthenticationInforuError(description);
    case -28:
      return new NetworkTypeInforuError(description);
    case -29:
      return new NetworkTypesInforuError(description);
    case -90:
      return new SenderIdentificationInforuError(description);
    case -94:
      return new SenderIdWhitelistInforuError(description);
  }
  return null;
}

function escapeXml(unsafe: string) {
  return unsafe.replace(/[<>&'"]/gu, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
    }
    return c;
  });
}

/**
 *
 * @param inforuUsername Username of the account that was supplied by InforUMobile
 * @param inforuApiToken ApiToken under “Account Details”> “API Token” in InforUMobile
 * @param sender The ID that will be displayed in the recipient's phone as the sender.
 * @param recipient The recipients' phone number
 * @param messageContent SMS message that needsto be sent
 */
async function sendSms(
  inforuUsername: string,
  inforuApiToken: string,
  sender: string,
  recipient: string,
  messageContent: string,
): Promise<void> {
  console.log('sending the sms ..............');
  const requestXml = `
<Inforu>
  <User>
    <Username>${inforuUsername}</Username>
    <ApiToken>${inforuApiToken}</ApiToken>
  </User>
  <Content Type="sms">
    <Message>${escapeXml(messageContent)}</Message>
  </Content>
  <Recipients>
    <PhoneNumber>${recipient}</PhoneNumber>
  </Recipients>
  <Settings>
    <Sender>${sender}</Sender>
  </Settings>
</Inforu>
`;
  console.log(messageContent, 'this is the sms message');
  const body = new URLSearchParams();
  body.append('InforuXML', requestXml);
  const response = await axios.post(
    'https://api.inforu.co.il/SendMessageXml.ashx',
    body,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );
  console.log(response.data, 'sms data');
  const asJson = await parseStringPromise(response.data);
  const status = Number(asJson.Result.Status[0]);
  const description = asJson.Result.Description[0];

  if (status !== 1) {
    throw inforuError(status, description);
  }
}

export default {
  sendSms,
};
