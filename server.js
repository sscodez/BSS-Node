const coap = require('coap');
const firebase = require('firebase/app');
const {
    getFirestore,
    collection,
    getDocs,
  } = require("firebase/firestore/lite");
const server = coap.createServer();

// Your Firebase Web SDK configuration
const firebaseConfig = {
 apiKey: "AIzaSyDQks44S0MQGDOHJzZhqh4FMLVfN16ibw4",
  authDomain: "bss2023-3c417.firebaseapp.com",
  projectId: "bss2023-3c417",
  storageBucket: "bss2023-3c417.appspot.com",
  messagingSenderId: "698296431178",
  appId: "1:698296431178:web:9f04ee1cffdcfccffa2cb3",
  measurementId: "G-7RG7HQ6PTE"
};

// Initialize Firebase
const app =firebase.initializeApp(firebaseConfig);

// Reference to the Firestore database
const db = getFirestore(app);


// db.settings({ timestampsInSnapshots: true });
// db.settings().then(() => {
//   console.log('Firestore database connected');
//   // Start the CoAP server once the database is connected
//   startCoapServer();
// })
// .catch(error => {
//   console.error('Error connecting to Firestore database:', error);
// });
// Define the CoAP routes
const routes = {
  GET: {
    '/availableBikes': handleAvailableBikes,
    '/nonAvailableBikes': handleNonAvailableBikes,
  },
  POST: {
    '/addBikes': handleAddBikes,
    '/rentBike': handleRentBike,
    '/endBikeRide': handleEndBikeRide,
    '/frontBrake': handleFrontBrake,
    '/rearBrake': handleRearBrake,
  },
};

// Available bikes resource
function handleAvailableBikes(req, res) {
  db.collection('Bikes').where('isRented', '==', false).get()
    .then(querySnapshot => {
      const bikes = [];
      querySnapshot.forEach(doc => {
        bikes.push(doc.data());
      });
      res.end(JSON.stringify(bikes));
    })
    .catch(error => {
      res.code = '5.00'; // Internal Server Error
      res.end();
    });
}

// Non-available bikes resource
function handleNonAvailableBikes(req, res) {
  db.collection('Bikes').where('isRented', '==', true).get()
    .then(querySnapshot => {
      const bikes = [];
      querySnapshot.forEach(doc => {
        bikes.push(doc.data());
      });
      res.end(JSON.stringify(bikes));
    })
    .catch(error => {
      res.code = '5.00'; // Internal Server Error
      res.end();
    });
}

// Add a bike resource
function handleAddBikes(req, res) {
  const bikeData = JSON.parse(req.payload.toString());
  const bikeRef = db.collection('Bikes').doc(bikeData.bikeId);
  bikeRef.set(bikeData)
    .then(() => {
      res.end('Data inserted successfully');
    })
    .catch(error => {
      res.code = '5.00'; // Internal Server Error
      res.end();
    });
}

// Rent a bike resource
function handleRentBike(req, res) {
  const bikeData = JSON.parse(req.payload.toString());
  const bikeRef = db.collection('Bikes').doc(bikeData.bikeId);
  bikeRef.get()
    .then(doc => {
      if (doc.exists && !doc.data().isRented) {
        bikeRef.update({ cyclistId: bikeData.cyclistId, isRented: true })
          .then(() => {
            res.end('Bike rented successfully');
          })
          .catch(error => {
            res.code = '5.00'; // Internal Server Error
            res.end();
          });
      } else {
        res.code = '4.00'; // Bad Request
        res.end('Invalid bike ID or bike is already rented');
      }
    })
    .catch(error => {
      res.code = '5.00'; // Internal Server Error
      res.end();
    });
}

// End a bike ride resource
function handleEndBikeRide(req, res) {
  const bikeData = JSON.parse(req.payload.toString());
  const bikeRef = db.collection('Bikes').doc(bikeData.bikeId);
  bikeRef.get()
    .then(doc => {
      if (doc.exists && doc.data().cyclistId === bikeData.cyclistId) {
        bikeRef.update({ cyclistId: null, isRented: false })
          .then(() => {
            res.end('Bike ride has been ended successfully');
          })
          .catch(error => {
            res.code = '5.00'; // Internal Server Error
            res.end();
          });
      } else {
        res.code = '4.00'; // Bad Request
        res.end('Invalid bike ID or cyclist ID');
      }
    })
    .catch(error => {
      res.code = '5.00'; // Internal Server Error
      res.end();
    });
}

// Toggle front brake resource
function handleFrontBrake(req, res) {
  // ... similar implementation as in the previous code ...
}

// Toggle rear brake resource
function handleRearBrake(req, res) {
  // ... similar implementation as in the previous code ...
}

// Router for handling CoAP requests
server.on('request', (req, res) => {
  const handler = routes[req.method][req.url];
  if (handler) {
    handler(req, res);
  } else {
    res.code = '4.04'; // Not Found
    res.end();
  }
});

// Start the CoAP server
const port = 5688;
server.listen(port, () => {
  console.log(`CoAP server listening on port ${port}`);
});
