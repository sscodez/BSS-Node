const firebase = require('firebase/app');
const {
  getFirestore,
  collection,
  getDocs,
} = require('firebase/firestore/lite');

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
module.exports = db = getFirestore(app);

