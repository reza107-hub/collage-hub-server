const express = require('express');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 3000
const { MongoClient, ServerApiVersion } = require('mongodb');

app.use(express.json())
app.use(cors())
require('dotenv').config()


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tfxumrl.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const collegesCollections = client.db('collegeHubDb').collection('colleges')

        const researchPaperCollections = client.db('collegeHubDb').collection('researchPaper')

        const feedbackCollections = client.db('collegeHubDb').collection('feedback')

        const admissionCollection = client.db('collegeHubDb').collection('admission')

        app.get('/colleges', async (req, res) => {
            const result = await collegesCollections.find().toArray()
            res.send(result)
        })

        app.get('/research-paper', async (req, res) => {
            const result = await researchPaperCollections.find().toArray()
            res.send(result)
        })

        app.get('/feedback', async (req, res) => {
            const result = await feedbackCollections.find().toArray()
            res.send(result)
        })

        app.get('/admission', async (req, res) => {
            const result = await admissionCollection.find().toArray()
            res.send(result)
        })

        app.post('/admission', async (req, res) => {
            const result = await admissionCollection.insertOne(req.body)
            res.send(result)
        })

        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('hello world')
})


app.listen(port)