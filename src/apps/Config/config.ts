const secondsToMs = (s) => s * 1000;
const minutesToMs = (m) => secondsToMs(m * 60);
const hoursToMs = (h) => minutesToMs(h * 60);
const daysToMs = (d) => hoursToMs(d * 24);

// eslint-disable-next-line import/no-commonjs
const config = {
  webPort: 8080,
  restApiPort: 3000,
  databasePort: 5432,
  customerURL: 'https://customer.q-int.com',
  BusinessURL: 'https://business.q-int.com',
  smsPhoneNumber: '0529993545',
  logSql: true,
  requireManualReviewToRegister: false,
  shortUrlComponentLength: 22, // To not compromise security of URLs that contain sessionId-like customerId, shortening function must be injective to it. OWASP recommends sessionId length of 16 bytes (https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#session-id-length). Because the codomain of our shortening function is alphanumeric, to remain injective we need length at least 172 bits.
  authentication: {
    passwordHashIterations: Math.pow(2, 17), // We hash using PBKDF2 with SHA512. In this case OWASP recommends at least 120,000 iterations https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#pbkdf2
    authTokenIdleTTL: hoursToMs(1), // OWASP recommends 15-30 minutes for low risk apps https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#session-expiration
    authTokenAbsoluteTTL: hoursToMs(12), // OWASP recommends 4-8 hours https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#session-expiration
    credentialTokenTTL: daysToMs(30),
  },
  development: {
    useHttps: false,
    accessibleExternally: false,
  },
};
export default config;
