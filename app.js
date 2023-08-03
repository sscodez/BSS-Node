
const coap = require('coap');
const db = require("./firebase");
// Create the CoAP server
const {
    getFirestore,
    collection,
    getDocs,
    addDoc,where,query,doc
  } = require('firebase/firestore/lite');
const server = coap.createServer();

const bikeSchema = {
    bikeId: '', // The unique ID for the bike
    bikeModel: "", // The bike model
    bikeName: "", // The bike name
    frontBrake: false, // Whether the bike has a front brake or not
    rearBrake: false, // Whether the bike has a rear brake or not
    gear: 0, // The bike gear
    latitude: 0.0, // The bike's latitude
    longitude: 0.0, // The bike's longitude
    cyclistId: null, // The ID of the cyclist who rented the bike (null if not rented)
    isRented: false, // Whether the bike is currently rented or not
  };

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
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
        cyclistId: null, 
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
            // Validate the incoming data against )the schema
            // ... (your validation code here)

            const bikeRef = doc(db, collectionName, bikeData.bikeId);
            const bikeDoc = await getDoc(bikeRef);
            console.log('bikeDoc',bikeDoc)

            if (bikeDoc.exists() && bikeDoc.data().rented === false && bikeDoc.data().cyclistId === null) {
                await updateDoc(bikeRef, {
                    cyclistId: bikeData.cyclistId,
                    rented: true,
                });

                res.setOption('Content-Format', 'application/json');
                res.code = '2.05';
                res.end(JSON.stringify(`Bike with ID ${bikeData.bikeId} updated successfully.`));
                console.log(`Bike with ID ${bikeData.bikeId} updated successfully.`);
            } else {
                console.log('The bike is not available for renting.');
                res.code = '4.04'; // Not Found
                res.setOption('Content-Format','application/json');
                res.end(JSON.stringify('The bike is not available for renting.'));
            }
        } catch (error) {
            console.error('Error updating bike data: ', error);
            res.code = '5.00'; // Internal Server Error
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
            const collectionName = 'Bikes';
        
            const q=  query(collection(db, collectionName), where('isRented', '==', true));
            const querySnapshot = await getDocs(q);
         
            if(querySnapshot.empty){
                console.log('No data found');
                res.setOption('Content-Format','application/json');
                res.code='2.05';
                res.end (JSON.stringify('No data found'));
                return ;
            }

            // Loop through the querySnapshot and display the non-available bikes
            querySnapshot.docs.forEach((doc) => {
              const bikeData = doc.data();
              console.log(`Bike ID: ${doc.id}`);
              console.log('Bike Details:', bikeData);
              res.setOption('Content-Format','application/json');
              res.code='2.05';
              res.end (JSON.stringify(bikeData));
            });
          } catch (error) {
            console.error('Error retrieving available bikes: ', error);
          }
    }
    else{
        res.code = '4.04'; // Not Found
        res.end(JSON.stringify('Invalid issue'));
    }
  }  

// Handler for GET request on root route "/"
function handleRootRequest(req, res) {
  if (req.method === 'GET') {
    console.log('GET request received on root route');
    res.setOption('Content-Format','application/json');
    res.code='2.05';
    res.end (JSON.stringify('Hey'));
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
  } else if (req.url === '/hello') {
    handleHelloRequest(req, res);
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
  
  else {
    res.code = '4.04'; // Not Found
    res.end();
  }
});
const port = 5688;
server.listen(port, () => {
  console.log(`CoAP server listening on port ${port}`);
});