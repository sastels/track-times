import * as firebase from "firebase";
import moment from "moment";

const config = {
  apiKey: "AIzaSyBq8jurDrQEQ2MwE3KqV_U7VWVUjaEoVfM",
  authDomain: "elevator-wait.firebaseapp.com",
  databaseURL: "https://elevator-wait.firebaseio.com",
  projectId: "elevator-wait",
  storageBucket: "elevator-wait.appspot.com",
  messagingSenderId: "501083985199"
};

export default (!firebase.apps.length
  ? firebase.initializeApp(config)
  : firebase.app());

export const signIn = onSignIn => {
  firebase
    .auth()
    .signInAnonymously()
    .catch(function(error) {
      // Handle Errors here.
      console.log(`ERROR ${error.code}: ${error.message}`);
    });

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      // var isAnonymous = user.isAnonymous;
      console.log(`signed in: ${user.uid}`);
      if (onSignIn) {
        onSignIn();
      }
    } else {
      console.log("Signed out");
    }
  });
};

// export const submitData = data => {
//   fetch("/uploadData", {
//     body: JSON.stringify(data),
//     cache: "no-cache",
//     headers: {
//       "content-type": "application/json"
//     },
//     method: "POST"
//   }).catch(err => console.log(err));
// };

export const uploadData = function(db, collectionID, { wait, when }) {
  const collection = wait < 10 ? "test" : collectionID;
  db.collection(collection)
    .doc(when)
    .set({ wait, when });
};

export const loadData = (db, collection, setState) => {
  let data = [];
  var cdsData = db.collection(collection);
  cdsData
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        console.log("No matching documents.");
        return;
      }
      snapshot.forEach(doc => {
        const when = moment(doc.data().when, "YYYY-MM-DD HH:mm:ss");
        const wait = doc.data().wait;
        const tod =
          when.hour() + when.minutes() / 60.0 + when.seconds() / 3600.0;
        data.push({ when, wait, tod });
      });
      setState({ data });
    })
    .catch(err => {
      console.log("Error getting documents", err);
    });
};
