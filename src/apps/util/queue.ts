import { IQueueArea } from '../types/queueArea';
import { IQueueCustomer } from '../types/queueCustomer';

type AreaQueue = { areaId: number; queueCustomers: IQueueCustomer[] };

function getShortestAreaQueue(
  list: AreaQueue[],
  isSmoker = false,
  smokingAreaIds: number[] = [],
): AreaQueue {
  if (list.length === 0) {
    return { areaId: 0, queueCustomers: [] };
  }
  // making sure to get only smoking area queues for smokers
  if (isSmoker && smokingAreaIds.length > 0) {
    list = list.filter((areaQueue) =>
      smokingAreaIds.includes(areaQueue.areaId),
    );
  }

  //sorting by areaID
  list.sort((area1, area2) => area1.areaId - area2.areaId);

  // check size of queue
  const result = list.reduce((shortest, areaQueue) => {
    return areaQueue.queueCustomers.length < shortest.queueCustomers.length
      ? areaQueue
      : shortest;
  }, list[0]);

  return result;
  // remember to check priority of creatio of areas case of tie
  //return { areaId: 0, queueCustomers: [] };
}

function splitQueueCustomersByArea(
  customersInQueue: IQueueCustomer[],
  areas: IQueueArea[],
): AreaQueue[] {
  const listOfAreaQueueCustomers: AreaQueue[] = [];
  const smokingAreaIds: number[] = [];

  // initialize the area queue and smokingAreaIds
  areas.forEach((area) => {
    listOfAreaQueueCustomers.push({ areaId: area.id, queueCustomers: [] });
    if (area.traits && area.traits.some((trait) => trait.type === 'smoker')) {
      smokingAreaIds.push(area.id);
    }
  });

  customersInQueue.forEach((qc) => {
    // check if qc has selected an area and add him to the queue in that area
    if (qc.areas && qc.areas.length > 0) {
      qc.areas.forEach((area) => {
        const areaQueueCustomers = listOfAreaQueueCustomers.find(
          (aqc) => aqc.areaId === area.queueAreaId,
        );
        if (areaQueueCustomers) {
          // check if indeed the customer is inserted otherwise: filter and add updated one
          areaQueueCustomers.queueCustomers.push(qc);
        }
      });
    }
    // case where the qc has no area selected: what is avaialable
    else {
      // verify if there is  restriction on area : smoking
      if (qc.traits?.some((trait) => trait.type === 'smoker')) {
        const areaQueue = getShortestAreaQueue(
          listOfAreaQueueCustomers,
          true,
          smokingAreaIds,
        );
        areaQueue.queueCustomers.push(qc);
      } else {
        const areaQueue = getShortestAreaQueue(listOfAreaQueueCustomers);
        areaQueue.queueCustomers.push(qc);
      }
    }
  });

  return listOfAreaQueueCustomers;
}

/**
 *
 * @param customersInQueue
 * @param me my queueCustomer Id
 * @param isCustomQueue the flag indicating the type of queue we want to display
 * @returns
 */
export function getCustomersCountBeforeMe(
  customersInQueue: IQueueCustomer[],
  me: string,
  isCustomQueue = false,
): number {
  if (!customersInQueue || customersInQueue.length === 0 || !me) {
    return NaN;
  }

  const myIndex = customersInQueue.findIndex(
    (qc) => String(qc.id) === String(me),
  );
  if (myIndex === -1) {
    return 0;
  }

  // update of logic
  const myQueueCustomer: IQueueCustomer = customersInQueue[myIndex];
  const myAreas = myQueueCustomer?.areas || [];
  const myAreaId =
    myAreas.length === 0 || myAreas[0].queueAreaId === null
      ? 0
      : myAreas[0].queueAreaId;

  // console.log('customersInQueue', customersInQueue);
  // console.log('my QC', myQueueCustomer);
  // console.log('myAreas', myAreas);

  const areaQueueCustomers = customersInQueue.filter((qc) => {
    const areasIds = qc.areas?.map((a) => a.queueAreaId) || [];

    if (myAreaId === 0) {
      return areasIds.length === 0 || areasIds[0] === null;
    } else {
      return areasIds.includes(myAreaId);
    }
  });

  // console.log('areaQueueCustomers', areaQueueCustomers);

  // find if i'm above break point
  // const breakpoint = 4;
  // if (myQueueCustomer.peopleCount > breakpoint) {
  //     areaQueueCustomers = areaQueueCustomers.filter(qc => qc.peopleCount > breakpoint);
  // } else {
  //     areaQueueCustomers = areaQueueCustomers.filter(qc => qc.peopleCount <= breakpoint);
  // }

  // final count before me:
  let countBeforeMe = 0;
  for (let i = 0; i < areaQueueCustomers.length; i++) {
    if (areaQueueCustomers[i].id !== myQueueCustomer.id) {
      countBeforeMe = countBeforeMe + 1;
    } else {
      break;
    }
  }

  return countBeforeMe;
}

export function getCustomersCountBeforeMe2(
  customersInQueue: IQueueCustomer[],
  me: string,
  queueAreas: IQueueArea[],
): number {
  if (!customersInQueue || customersInQueue.length === 0 || !me) {
    return NaN;
  }

  const myIndex = customersInQueue.findIndex(
    (qc) => String(qc.id) === String(me),
  );
  if (myIndex === -1) {
    return 0;
  }

  // update of logic
  const myQueueCustomer: IQueueCustomer = customersInQueue[myIndex];
  // const myAreas = myQueueCustomer?.areas || [];
  const queueCustomerBeforeMe: IQueueCustomer[] = customersInQueue.slice(
    0,
    myIndex,
  );

  /** Begining queue creation based on the areas
   *  myAreaId = 0, means that customer selected what is available or
   *  no area is created by business yet
   */

  // here, we are getting only the first area of the customer case he selected multiple areas
  //const myAreaId = myAreas.length === 0 || myAreas[0].queueAreaId === null ? 0 : myAreas[0].queueAreaId;
  let myFinalAreaQueueCustomers: IQueueCustomer[] = [];

  // case : business has no area created
  if (!queueAreas || queueAreas.length === 0) {
    myFinalAreaQueueCustomers = queueCustomerBeforeMe;
  }

  // case: Business has created areas and myQueueCustomer also selected an area
  else {
    queueAreas.sort((a1, a2) => a1.id - a2.id);
    let queueCustomersByArea = splitQueueCustomersByArea(
      queueCustomerBeforeMe,
      queueAreas,
    );

    // console.log('after split queueCustomersByArea=', queueCustomersByArea);

    // case myQueueCustomer: has selected some areas
    if (myQueueCustomer.areas && myQueueCustomer.areas.length > 0) {
      // we are selecting only queues in the selected areas
      queueCustomersByArea = queueCustomersByArea.filter((qca) =>
        myQueueCustomer.areas
          ?.map((area) => area.queueAreaId)
          .includes(qca.areaId),
      );

      myFinalAreaQueueCustomers =
        getShortestAreaQueue(queueCustomersByArea).queueCustomers;
    }
    // case myQueueCustomer: has selected no areas
    else {
      if (myQueueCustomer.traits?.some((trait) => trait.type === 'smoker')) {
        const smokingAreaIds: number[] = [];
        // initialize the area queue and smokingAreaIds
        queueAreas.forEach((area) => {
          if (
            area.traits &&
            area.traits.some((trait) => trait.type === 'smoker')
          ) {
            smokingAreaIds.push(area.id);
          }
        });

        myFinalAreaQueueCustomers = getShortestAreaQueue(
          queueCustomersByArea,
          true,
          smokingAreaIds,
        ).queueCustomers;
      } else {
        myFinalAreaQueueCustomers =
          getShortestAreaQueue(queueCustomersByArea).queueCustomers;
      }
    }
  }

  // console.log('customersInQueue', myFinalAreaQueueCustomers);
  // console.log('my QC', myQueueCustomer);
  // console.log('myAreas', myAreas);
  // console.log('myFinalAreaQueueCustomers', myFinalAreaQueueCustomers);

  /** BREAKING THE QUEUE INTO SUBSET USING A BREAK POINT VALUE: 4 */
  // find if i'm above break point
  // const breakpoint = 4;
  // if (myQueueCustomer.peopleCount > breakpoint) {
  //     myFinalAreaQueueCustomers = myFinalAreaQueueCustomers.filter(qc => qc.peopleCount > breakpoint);
  // } else {
  //     myFinalAreaQueueCustomers = myFinalAreaQueueCustomers.filter(qc => qc.peopleCount <= breakpoint);
  // }

  // final count before me:
  let countBeforeMe = 0;
  for (let i = 0; i < myFinalAreaQueueCustomers.length; i++) {
    if (myFinalAreaQueueCustomers[i].id !== myQueueCustomer.id) {
      countBeforeMe = countBeforeMe + 1;
    } else {
      break;
    }
  }

  return countBeforeMe;
}

export default {
  getCustomersCountBeforeMe,
  getCustomersCountBeforeMe2,
};
