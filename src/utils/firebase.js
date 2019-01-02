import firebase from "firebase/app";
import "firebase/firestore"
import "firebase/auth"
import moment from "moment";

const config = {
  apiKey: "AIzaSyBq8jurDrQEQ2MwE3KqV_U7VWVUjaEoVfM",
  authDomain: "elevator-wait.firebaseapp.com",
  databaseURL: "https://elevator-wait.firebaseio.com",
  projectId: "elevator-wait",
  storageBucket: "elevator-wait.appspot.com",
  messagingSenderId: "501083985199"
};

!firebase.apps.length ? firebase.initializeApp(config) : firebase.app();

export const signIn = onSignIn => {
  firebase
    .auth()
    .signInAnonymously()
    .catch(function(error) {
      console.log(`ERROR ${error.code}: ${error.message}`);
    });

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      var isAnonymous = user.isAnonymous;
      console.log(`signed in: ${user.uid}  isAnonymous: ${isAnonymous}`);
      if (onSignIn) {
        onSignIn();
      }
    } else {
      console.log("Signed out");
    }
  });
};

export const uploadData = function(db, collectionID, { wait, when }) {
  db.collection(collectionID)
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
