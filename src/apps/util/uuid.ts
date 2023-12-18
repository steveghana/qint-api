import { v4 as uuidv4 } from 'uuid';

// v4 from uuid can't be stubbed, so we use a delegating function that can be
function makeUuid(): string {
    return uuidv4();
}

export default { makeUuid };
