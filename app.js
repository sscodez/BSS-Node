
const coap = require('coap');
const db = require("./firebase");
// Create the CoAP server
const {
    getFirestore,
    collection,
    getDocs,
    getDoc,
    updateDoc,
    addDoc,where,query,doc
  } = require('firebase/firestore/lite');
const server = coap.createServer();

function handleAddBikes(req, res) {
    if (req.method === 'POST' && req.url === '/addBikes') {
 
    
    res.setOption('Content-Format','application/json');

    const bikeData = JSON.parse(req.payload.toString());
    console.log(bikeData);
  
    // Validate the incoming data against the schema
    const  value = bikeData;
    const body ={
        bikeId: value.bikeId, 
        bikeModel: value.bikeModel, 
        bikeName: value.bikeName, 
        frontBrake: false, 
        rearBrake: false, 
        gear: 0, 
        latitude: 0.0, 
        longitude: 0.0, 
        cyclistId: 0, 
        isRented: false, 
    }
    
    res.setOption('Content-Format','application/json');
    res.code='2.05';
    const collectionName='Bikes'
    const docRef = addDoc(collection(db,collectionName),body)
    .then(() => {
        res.end( JSON.stringify('Data inserted successfully',docRef.id));
      })
      .catch((error) => {
        res.setOption('Content-Format','application/json');
        res.code = '5.00'; // Internal Server Error
        console.log(error);
        res.end(JSON.stringify(error));
      });
    }
    else{
        res.code = '4.04'; // Not Found
        res.end(JSON.stringify('Invalid issue'));
    }
  }  
async function data(req,res){
    const collectionName = 'Bikes';
   
        console.log('getfunction')
            // Use the "where" function to create a query that filters documents where "rented" is false
            const q=  query(collection(db, collectionName), where('isRented', '==', false));
            const querySnapshot = await getDocs(q);
            let BikesArr=[];
         
    
            // Loop through the querySnapshot and display the available bikes
            await Promise.all(
                querySnapshot.docs.map(async (doc) => {
                  const bikeData = doc.data();
                  BikesArr.push(bikeData.bikeId,bikeData.bikeName);
                })
              );
              
            
        return BikesArr

    }
    
    async function data1(req,res){
      const collectionName = 'Bikes';
          console.log('getfunction')
              // Use the "where" function to create a query that filters documents where "rented" is false
              const q=  query(collection(db, collectionName), where('isRented', '==', true));
              const querySnapshot = await getDocs(q);
              let BikesArr=[];
      
              // Loop through the querySnapshot and display the available bikes
              await Promise.all(
                  querySnapshot.docs.map(async (doc) => {
                    const bikeData = doc.data();
                    BikesArr.push(bikeData.bikeId,bikeData.bikeName);
                  })
                );
  
          return BikesArr
  
      }
      


    async function handleAvailableBikes(req, res) {
      if (req.method === 'GET' && req.url === '/availableBikes') {
          try {
              const b = await data();
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(b));
          } catch (error) {
              res.statusCode = 500; // Internal Server Error
              res.end(JSON.stringify('Something went wrong'));
          }
      } else {
          res.code = '4.04'; // Not Found
          res.end(JSON.stringify('Invalid issue'));
      }
  }

  
  
  async function handleRentBikes(req, res) {
    if (req.method === 'POST' && req.url === '/rentBikes') {
        try {
            const collectionName = 'Bikes';
            res.setOption('Content-Format','application/json');

            const bikeData = JSON.parse(req.payload.toString());
            console.log(bikeData)
            const bikeDb = collection(db, collectionName);

            // Use a query to find the bike document with the given bikeId and isRented status
            const q = query(bikeDb, where('bikeId', '==', bikeData.bikeId), where('isRented', '==', false));
            const querySnapshot = await getDocs(q);
      
            // Check if the document exists
            if (!querySnapshot.empty) {
              const bikeDoc = querySnapshot.docs[0];
              const bikeRef = doc(bikeDb, bikeDoc.id);
      
              // Update the bike document with the cyclistId and isRented status
              await updateDoc(bikeRef, {
                cyclistId: bikeData.cyclistId,
                isRented: true,
              });
                res.setOption('Content-Format', 'application/json');
                res.code = '2.05';
                res.end(JSON.stringify(`Bike with ID ${bikeData.bikeId} updated successfully.`));
                console.log(`Bike with ID ${bikeData.bikeId} updated successfully.`);
          } 
          else {
            console.log('The bike is not available for renting.');
            res.code = '4.04'; // Not Found
            res.end(JSON.stringify('The bike is not available for renting.'));
          }
        }
         catch (error) {
            console.error('Error updating bike data: ', error);
            res.code = '5.00'; // Internal Server Error
            res.setOption('Content-Format', 'application/json');
            res.end(JSON.stringify('Something went wrong'));
        }
    } else {
        res.code = '4.04'; // Not Found
        res.end(JSON.stringify('Invalid issue'));
    }
}
async function handleEndRentBikes(req, res) {
  if (req.method === 'POST' && req.url === '/endrentBikes') {
      try {
          const collectionName = 'Bikes';
          res.setOption('Content-Format','application/json');

          const bikeData = JSON.parse(req.payload.toString());
          console.log(bikeData)
          const bikeDb = collection(db, collectionName);

          // Use a query to find the bike document with the given bikeId and isRented status
          const q = query(bikeDb, where('bikeId', '==', bikeData.bikeId), where('isRented', '==', true));
          const querySnapshot = await getDocs(q);
    
          // Check if the document exists
          if (!querySnapshot.empty) {
            const bikeDoc = querySnapshot.docs[0];
            const bikeRef = doc(bikeDb, bikeDoc.id);
    
            // Update the bike document with the cyclistId and isRented status
            await updateDoc(bikeRef, {
              cyclistId: 0,
              isRented: false,
            });
              res.setOption('Content-Format', 'application/json');
              res.code = '2.05';
              res.end(JSON.stringify(`End Rente Bike with ID ${bikeData.bikeId} updated successfully.`));
              console.log(`Bike with ID ${bikeData.bikeId} updated successfully.`);
        } 
        else {
          console.log('The bike ride is already ended.');
          res.code = '4.04'; // Not Found
          res.end(JSON.stringify('The bike  is not on renting'));
        }
      }
       catch (error) {
          console.error('Error updating bike data: ', error);
          res.code = '5.00'; // Internal Server Error
          res.setOption('Content-Format', 'application/json');
          res.end(JSON.stringify('Something went wrong'));
      }
  } else {
      res.code = '4.04'; // Not Found
      res.end(JSON.stringify('Invalid issue'));
  }
}
  async  function handleNonAvailableBikes(req, res) {
    if (req.method === 'GET' && req.url === '/nonavailableBikes') {
 
      try {
        const b = await data1();
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(b));
    } catch (error) {
        res.statusCode = 500; // Internal Server Error
        res.end(JSON.stringify('Something went wrong'));
    }
  }
    else{
        res.code = '4.04'; // Not Found
        res.end(JSON.stringify('Invalid issue'));
    }
  }  


async function handleFrontBrake(req, res) {
  try {
    const bikeData = JSON.parse(req.payload.toString());
    const bikeRef = doc(db, 'Bikes', bikeData.bikeId);
    const bikeDoc = await getDoc(bikeRef);

    if (bikeDoc.exists() && bikeDoc.data().cyclistId === bikeData.cyclistId) {
      const currentFrontBrake = bikeDoc.data().frontBrake;
      await updateDoc(bikeRef, { frontBrake: !currentFrontBrake });
      res.end('Front brake toggled successfully');
    } else {
      res.code = '4.00'; // Bad Request
      res.end('Invalid bike ID or cyclist ID');
    }
  } catch (error) {
    res.code = '5.00'; // Internal Server Error
    res.end();
  }
}

// Toggle rear brake resource
async function handleRearBrake(req, res) {
  try {
    const bikeData = JSON.parse(req.payload.toString());
    const bikeRef = doc(db, 'Bikes', bikeData.bikeId);
    const bikeDoc = await getDoc(bikeRef);

    if (bikeDoc.exists() && bikeDoc.data().cyclistId === bikeData.cyclistId) {
      const currentRearBrake = bikeDoc.data().rearBrake;
      await updateDoc(bikeRef, { rearBrake: !currentRearBrake });
      res.end('Rear brake toggled successfully');
    } else {
      res.code = '4.00'; // Bad Request
      res.end('Invalid bike ID or cyclist ID');
    }
  } catch (error) {
    res.code = '5.00'; // Internal Server Error
    res.end();
  }
}

// Handler for GET request on root route "/"
function handleRootRequest(req, res) {
  if (req.method === 'GET') {
    console.log('GET request received on root route');
    res.setOption('Content-Format','application/json');
    res.code='2.05';
    res.end (JSON.stringify('Hey , Welcome to Bike Sharing System '));
  } else if (req.method === 'POST') {
    console.log('POST request received on root route');
    res.end('Received a POST request!');

  } else {
    res.code = '4.00'; // Method Not Allowed
    res.end();
  }
}



// Add route handlers to the server
server.on('request', (req, res) => {
  if (req.url === '/') {
    handleRootRequest(req, res);
  } 
  else if (req.url === '/addBikes') {
    handleAddBikes(req, res);
    console.log(`Handle Bikes Routes`);
  }
  else if (req.url === '/availableBikes') {
    handleAvailableBikes(req, res);
    console.log(`Available Bikes Route`);
  } 
  else if (req.url === '/nonavailableBikes') {
    handleNonAvailableBikes(req, res);
    console.log(`Non-Available Bikes Route`);
  }
  else if (req.url === '/rentBikes') {
    handleRentBikes(req, res);
    console.log(`Rent Bikes Route`);
  }
  else if (req.url === '/endrentBikes') {
    handleEndRentBikes(req, res);
    console.log(`End Rent Bikes Route`);
  }
  else if (req.url === '/frontBreak') {
    handleFrontBrake(req, res);
    console.log(`Front Brake Bikes Route`);
  }    
  else if (req.url === '/rearBreak') {
    handleRearBrake(req, res);
    console.log(`Rear Brake Route`);
  }    
  else {
    res.code = '4.04'; // Not Found
    res.end();
  }
});
const port = 5688;
server.listen(port, () => {
  console.log(`CoAP server listening on port ${port}`);
});
