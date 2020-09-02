import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const getVehicles = functions.https.onRequest((request, response) => {
  admin.firestore()
    .collection('vehicles')
    .get()
    .then(snapshot => {
      const data = snapshot.docs.map(element => element.data());
      response.send(data)
    })
    .catch(error => {
      console.log(error)
      response.status(500).send(error)
    })
});

export const getCustomers = functions.https.onRequest((request, response) => {
  admin.firestore()
    .collection('customers')
    .get()
    .then(snapshot => {
      const data = snapshot.docs.map(element => element.data());
      response.send(data)
    })
    .catch(error => {
      console.log(error)
      response.status(500).send(error)
    })
});

// get array of random status 
export const simulator = functions.https.onRequest(async (request, response) => {
  const status: string[] = ['online', 'offline'];
  const arrayOfStatus = [];
  const lengthOfArray = 7;
  for (let i = 0; i < lengthOfArray; i++) {
    // get 0 ~ 1 random number
    const randomNum: number = Math.floor(Math.random() * Math.floor(2));
    arrayOfStatus.push(status[randomNum]);
  }
  response.send(arrayOfStatus);
});

// get vehiclesInfo
export const getVehiclesInfo = functions.https.onRequest(async (request, response) => {
  const url = "https://alten-tool.web.app";
  response.set('Access-Control-Allow-Origin', url);
  response.set('Access-Control-Allow-Credentials', 'true');
  try {
    // get vehicles
    const statusSnapshot = await admin.firestore().doc("vehicles_status/group_1").get();
    const vehicles = statusSnapshot.data() || [];
    const promises: any[] = [];
    for (const vehicle in vehicles) {
      const p = admin.firestore().doc(`vehicles/${vehicle}`).get();
      promises.push(p);
    }
    const snapshots = await Promise.all(promises);

    const results: any[] = [];
    snapshots.forEach(snap => {
      const data = snap.data();
      results.push(data);
    });

    // get customers
    const customersSnapshot = await admin.firestore().doc("customers_status/group_1").get();
    const customers = customersSnapshot.data() || [];
    const customersPromises: any[] = [];
    for (const customer in customers) {
      const p = admin.firestore().doc(`customers/${customer}`).get();
      customersPromises.push(p);
    }
    const customerSnapshots = await Promise.all(customersPromises);

    const customerResults: any[] = [];
    customerSnapshots.forEach(snap => {
      const data = snap.data();
      customerResults.push(data);
    });

    const list: any[] = [];
    const status: string[] = ['online', 'offline'];

    results.forEach(result => {
      const owner = customerResults.find(customer => customer.id == result.owner_id);
      const randomNum: number = Math.floor(Math.random() * Math.floor(2));
      list.push({
        id: result.id,
        status: status[randomNum],
        vehicle_id: result.vehicle_id,
        registration_number: result.registration_number,
        owner_name: owner.name,
        owner_address: owner.address,
      });
    })
    response.send(list);
  } catch (error) {
    console.log(error);
    response.status(500).send(error);
  }
});