import db from '../Config/index';
import ws from '../ws';
import emailUtil from './email';
import smsUtil from './sms';
import pushUtil from './push';
import config from '../Config/config';
// let ws: SocketGateway;

export type Dependencies = Partial<{
  db: typeof db;
  ws: typeof ws;
  email: typeof emailUtil;
  sms: typeof smsUtil;
  push: typeof pushUtil;
  config: Partial<typeof config>;
}>;

const globalDefaultDependencies: Dependencies = {
  db: db,
  ws: ws,
  email: emailUtil,
  sms: smsUtil,
  push: pushUtil,
  config,
};

export function injectDependencies(
  dependencies: Dependencies,
  requestedDependencies: Array<keyof Dependencies>,
  defaultDependencies = globalDefaultDependencies,
): Dependencies {
  if (!dependencies) {
    dependencies = {};
  }

  requestedDependencies.forEach((requestedDependency) => {
    if (!dependencies[requestedDependency]) {
      (dependencies[requestedDependency] as any) =
        defaultDependencies[requestedDependency];
    }
  });

  return dependencies;
}

export default {
  injectDependencies,
};
