"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVehiclesInfo = exports.simulator = exports.getCustomers = exports.getVehicles = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
exports.getVehicles = functions.https.onRequest((request, response) => {
    admin.firestore()
        .collection('vehicles')
        .get()
        .then(snapshot => {
        const data = snapshot.docs.map(element => element.data());
        response.send(data);
    })
        .catch(error => {
        console.log(error);
        response.status(500).send(error);
    });
});
exports.getCustomers = functions.https.onRequest((request, response) => {
    admin.firestore()
        .collection('customers')
        .get()
        .then(snapshot => {
        const data = snapshot.docs.map(element => element.data());
        response.send(data);
    })
        .catch(error => {
        console.log(error);
        response.status(500).send(error);
    });
});
// get array of random status 
exports.simulator = functions.https.onRequest(async (request, response) => {
    const status = ['online', 'offline'];
    const arrayOfStatus = [];
    const lengthOfArray = 7;
    for (let i = 0; i < lengthOfArray; i++) {
        // get 0 ~ 1 random number
        const randomNum = Math.floor(Math.random() * Math.floor(2));
        arrayOfStatus.push(status[randomNum]);
    }
    response.send(arrayOfStatus);
});
// get vehiclesInfo
exports.getVehiclesInfo = functions.https.onRequest(async (request, response) => {
    const url = "https://alten-tool.web.app";
    response.set('Access-Control-Allow-Origin', url);
    response.set('Access-Control-Allow-Credentials', 'true');
    try {
        // get vehicles
        const statusSnapshot = await admin.firestore().doc("vehicles_status/group_1").get();
        const vehicles = statusSnapshot.data() || [];
        const promises = [];
        for (const vehicle in vehicles) {
            const p = admin.firestore().doc(`vehicles/${vehicle}`).get();
            promises.push(p);
        }
        const snapshots = await Promise.all(promises);
        const results = [];
        snapshots.forEach(snap => {
            const data = snap.data();
            results.push(data);
        });
        // get customers
        const customersSnapshot = await admin.firestore().doc("customers_status/group_1").get();
        const customers = customersSnapshot.data() || [];
        const customersPromises = [];
        for (const customer in customers) {
            const p = admin.firestore().doc(`customers/${customer}`).get();
            customersPromises.push(p);
        }
        const customerSnapshots = await Promise.all(customersPromises);
        const customerResults = [];
        customerSnapshots.forEach(snap => {
            const data = snap.data();
            customerResults.push(data);
        });
        const list = [];
        const status = ['online', 'offline'];
        results.forEach(result => {
            const owner = customerResults.find(customer => customer.id == result.owner_id);
            const randomNum = Math.floor(Math.random() * Math.floor(2));
            list.push({
                id: result.id,
                status: status[randomNum],
                vehicle_id: result.vehicle_id,
                registration_number: result.registration_number,
                owner_name: owner.name,
                owner_address: owner.address,
            });
        });
        response.send(list);
    }
    catch (error) {
        console.log(error);
        response.status(500).send(error);
    }
});
//# sourceMappingURL=index.js.map