const express = require("express");
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();
const saltRounds = 10;

app.use(cors());
app.use(express.json());

const server = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "bot",
  port: 3306
});

// Connect to the database and handle connection errors
server.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1); // Exit the process with a failure code
  } else {
    console.log('Connected to the database');
  }
});

// Registration endpoint
app.post('/register', async (request, response) => {
  const { username, email, password } = request.body;

  try {
    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const sql = "INSERT INTO register (username, email, password) VALUES (?, ?, ?)";
    const values = [username, email, hashedPassword];

    server.query(sql, values, (err, result) => {
      if (err) {
        console.error("Error:", err);
        return response.status(500).json({ message: "Error raised" });
      } else {
        console.log("Registration successful");
        return response.json({ message: "Registration successful", success: true });
      }
    });
  } catch (error) {
    console.error("Error during registration:", error);
    return response.status(500).json({ message: "Internal Server Error" });
  }
});

// Login endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM register WHERE email = (?)";
  server.query(sql, [email], (err, results) => {
    if (err) {
      console.error('Error querying user:', err);
      return res.status(500).json({ message: "Error processing login" });
    }

    const user = results[0];
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Compare hashed password
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).json({ message: "Error processing login" });
      }

      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      return res.json({ success: true, user: { email: user.email, username: user.username } });
    });
  });
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
















































// const express = require("express");
// const mysql = require('mysql');
// const cors = require('cors');
// const bcrypt = require('bcrypt');
// const app = express();
// app.use(cors());
// app.use(express.json());
// const server = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "chatbot",
//   port:3307
// });

// app.post('/register', (request, response) => {
//   const { username, email, password } = request.body;
//   const sql = "INSERT INTO register (username, email, password) VALUES (?, ?, ?)";
//   const values = [username, email, password];
//   server.query(sql, values, (err, result) => {
//     if (err) {
//       console.error("Error:", err);
//       response.status(500).json({ message: "Error raised" });
//     } else {
//       console.log("Registration successful");
//       response.json({ message: "Registration successful", success: true});
//     }

//   });
// });


// app.post('/login', (req, res) => {
//   const { email, password } = req.body;
//   const sql = "SELECT * FROM register WHERE email = (?)";
//   server.query(sql, [email], (err, results) => {
//     if (err) {
//       console.error('Error querying user:', err);
//     }
//     const user  = results[0];
//     if (!user) {
//       return res.status(401).json({ success: false, message: 'Invalid email or password' });
//     }

//     if (password !== user.password) {
//       return res.status(401).json({ success: false, message: 'Invalid email or password' });
//     }

//     return res.json({ success: true, user: { email: user.email, username: user.username } });
//   });
// });


// const PORT = process.env.PORT || 8081;
// app.listen(PORT, () => {
//   console.log('Server is running on port');
// });