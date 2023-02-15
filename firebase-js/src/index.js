import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyApOm0mFUth5y6f5tp9hNKJ14qQYCNbCO0",
  authDomain: "bethel-expense-calculator.firebaseapp.com",
  projectId: "bethel-expense-calculator",
  storageBucket: "bethel-expense-calculator.appspot.com",
  messagingSenderId: "798255049382",
  appId: "1:798255049382:web:a0323e8d7eb66fb67fe267",
};

// init firebase app
initializeApp(firebaseConfig);

// init services
const db = getFirestore();
const auth = getAuth();

// collection ref
const colRef = collection(db, "expenses");

// -------------------------
// Queries
// -------------------------

// Query with where clause

// const queryMatt = query(
//   colRef,
//   where("name", "==", "matt"),
//   orderBy("createdAt")
// );

// Query with order by
const queryOrderByCreated = query(colRef, orderBy("createdAt"));

// -------------------------
// real time collection data - creates a subscription to a collection
// pass in collection reference or query
// runs once at load and then listens for changes to db each time running code in function
// -------------------------
const unsubCollection = onSnapshot(queryOrderByCreated, (snapshot) => {
  let expenses = [];
  // Loop through the docs array
  snapshot.docs.forEach((expense) => {
    // Each item in array can be accessed using the data() function which returns an object
    // Spread returned object values, along with id or doc into new array
    expenses.push({ ...expense.data(), id: expense.id });
  });
  console.log(expenses);
  renderExpenses(expenses);
});

// ------------------------
// Render items on page
// ------------------------
function renderExpenses(expenses) {
  const itemContainer = document.querySelector(".items");

  expenses.forEach((expense) => {
    itemContainer.innerHTML += `<p>
    <span class='expense'>${expense.amount}</span>
     - 
    <span class='name'>${expense.name}</span>
    </p>`;
  });
}

// -------------------------
// adding expense
// -------------------------
const addExpenseForm = document.querySelector(".add");
addExpenseForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // use the addDoc module and pass along the collection reference and an object with the data from the form
  addDoc(colRef, {
    amount: Number(addExpenseForm.amount.value),
    createdAt: serverTimestamp(),
    name: addExpenseForm.name.value,
  }).then(() => {
    addExpenseForm.reset(); // Once item added to db reset the form
  });
});

// -------------------------
// deleting expenses
// -------------------------
const deleteExpenseForm = document.querySelector(".delete");
deleteExpenseForm.addEventListener("submit", (e) => {
  e.preventDefault();
  console.log;

  // must get a reference to the document we want to delete using the doc module passing in db, collection name, and the id
  const expenseRef = doc(db, "expenses", deleteExpenseForm.id.value);
  // use the deleteDoc module to delete the reference to the doc found above
  deleteDoc(expenseRef).then(() => {
    deleteExpenseForm.reset();
  });
});

// -------------------------
// Get a single document
// -------------------------

// create a reference to the document we want to get
const expenseRef = doc(db, "expenses", "SkSksd17B5AgTmfddKsG");

// a one time get request of document
// getDoc(expenseRef).then((expense) => {
//   console.log(expense.data(), expense.id);
// });

// subscribe to a document which runs when document changes
const unsubDoc = onSnapshot(expenseRef, (expense) => {
  console.log(expense.data(), expense.id);
});

// -------------------------
// Update an expense
// -------------------------
const updateExpenseForm = document.querySelector(".update");
updateExpenseForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // must get a reference to the document we want to delete using the doc module passing in db, collection name, and the id
  const expenseRef = doc(db, "expenses", updateExpenseForm.id.value);

  // pass in only the values you want to update
  updateDoc(expenseRef, {
    name: "matt",
  }).then(() => {
    updateExpenseForm.reset();
  });
});

// -------------------------
// Signing up users
// -------------------------
const signupForm = document.querySelector(".signup");

signupForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // grab email and password from form
  const email = signupForm.email.value;
  const password = signupForm.password.value;

  // Pass in auth service, email, and password
  createUserWithEmailAndPassword(auth, email, password)
    .then((credential) => {
      //console.log("user created:", credential.user);
      signupForm.reset();
    })
    .catch((err) => {
      console.log(err.message);
    });
});

// -------------------------
// Logging in and out
// -------------------------
const loginForm = document.querySelector(".login");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  // grab email and password from form
  const email = loginForm.email.value;
  const password = loginForm.password.value;

  // send credentials to auth service
  signInWithEmailAndPassword(auth, email, password)
    .then((credential) => {
      //console.log("user has been signed in:", credential.user);
      loginForm.reset();
    })
    .catch((err) => {
      console.log(err.message);
    });
});

const logoutButton = document.querySelector(".logout");

logoutButton.addEventListener("click", (e) => {
  e.preventDefault();

  signOut(auth)
    .then(() => {
      //console.log("The user was signed out");
    })
    .catch((err) => {
      console.log(err.message);
    });
});

// subscribing to auth changes
const unsubAuth = onAuthStateChanged(auth, (user) => {
  console.log("User status changed:", user);
});

// unsubscribe from all subscriptions
const unsubButton = document.querySelector(".unsub");

unsubButton.addEventListener("click", (e) => {
  e.preventDefault();

  console.log("Unsubscribing from all subscriptions");
  unsubCollection();
  unsubDoc();
  unsubAuth();
});
