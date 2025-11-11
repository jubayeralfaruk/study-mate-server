const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
// middleware
app.use(cors());
app.use(express.json())
// console.log(process.env);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dzgjhab.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/', (req, res) => {
    res.send("Server is runing now")
})

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const db =  client.db("studyMateDB");
    const partnersCollection = db.collection("partners");
    const partnersRequestCollection = db.collection("partners-request")
    const usersCollection = db.collection("users")


    app.get("/partners", async(req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }
      const cursor = partnersCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get("/topPartners", async(req, res) => {
      const cursor = partnersCollection.find().sort({rating: -1}).limit(6);
      const result = await cursor.toArray();
      res.send(result)
    }) 

    app.get('/partners/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id)}
      const result = await partnersCollection.findOne(query)
      res.send(result)
    })

    app.post('/partners', async(req, res) => {
      const partner = req.body;
      const result = await partnersCollection.insertOne(partner)
      res.send(result)
    })

    app.patch("/partners/:id", async(req, res) => {
      const id = req.params.id;
      const partner = req.body;
      const query = { _id: new ObjectId(id)};
      const update = {
        $set: partner
      }
      const result = await partnersCollection.updateOne(query, update)
      res.send(result)
    })

    app.patch("/partners/:id/increase", async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await partnersCollection.updateOne(query, {
        $inc: {patnerCount: 1}
      })
    })

    app.delete('/partners/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await partnersCollection.deleteOne(query);
      res.send(result);
    })

    app.get('/partners-request', async(req, res) => {
      const email = req.params.email;
      // const query = {  }
      const cursor = partnersRequestCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post("/partners-request", async(req, res) => {
      const request = req.body;

      const email = req.body.senderEmail;
      const id = req.body.partnerId;

      const queryID = { partnerId: id };
      const queryEmail = { senderEmail: email };

      const existingId = await partnersRequestCollection.findOne(queryID);
      const existingEmail = await partnersRequestCollection.findOne(queryEmail);

      if (existingEmail && existingId) {
        res.send('Sender already send')
      } else {
        const result = await partnersRequestCollection.insertOne(request);
        res.send(result)
      }

    })

    app.patch("/partners-request/:id", async(req, res) => {
      const id = req.params.id;
      const request = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: request
      }
      const result = await partnersRequestCollection.updateOne(query, update);
      res.send(result)
    })

    app.delete("/partners-request/:id", async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await partnersRequestCollection.deleteOne(query);
      res.send(result)
    })

    //---------------------------------------------------------------------------
    
    app.get('/users', async() => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }
      const cursor = usersCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post('/users', async(req, res) => {
      const user = req.body;
      const email = req.body.email
      const existingEmail = usersCollection.findOne({email:email});

      if (existingEmail) {
        res.send('User already existing.')
      } else {
        const result = await usersCollection.insertOne(user)
        res.send(result)
      }

    })


    

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
    
})