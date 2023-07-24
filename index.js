const express = require('express');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 3000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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

        const usersCollection = client.db("collegeHubDb").collection("users");

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

        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray()
            res.send(result)
        })

        app.post('/admission', async (req, res) => {
            const email = req.query.email
            const college = req.query.college

            const updateDoc = {
                $set: {
                    institution: college
                }
            }
            const userResult = await usersCollection.updateOne({ email: email }, updateDoc)
            const result = await admissionCollection.insertOne(req.body)
            res.send(result)
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user already exists' })
            }
            const result = await usersCollection.insertOne(req.body)
            res.send(result)
        })

        app.patch('/college/:id', async (req, res) => {
            const rating = parseInt(req.query.rating);
            const result1 = await collegesCollections.find().toArray();
            const id = req.params.id;
            const getCollege = result1.find(college => college?._id == id);
            const ratings = getCollege.ratings + rating;
            const reviewCount = getCollege.reviewCount + 1;
            const review = (ratings / reviewCount).toFixed(2);
            const filter = { _id: new ObjectId(id) };

            // ---------- for email............
            const email = req.query.email;
            const filterEmail = { email: email };
            const updateUser = {
                $set: {
                    review: true
                }
            };

            const updateDoc = {
                $set: {
                    ratings: ratings,
                    reviewCount: reviewCount,
                    review: parseFloat(review)
                }
            };

            const options = { upsert: true };
            const result = await collegesCollections.updateOne(filter, updateDoc, options);

            const userResult = await usersCollection.updateOne(filterEmail, updateUser, options);

            // Combine the results into a single response object and send it
            const response = {
                collegeResult: result,
                userResult: userResult
            };

            res.send(response);
        });

        app.patch('/users', async (req, res) => {
            const userData = req.body
            const filter = { email: userData?.email }
            const updateDoc = {
                $set: {
                    name: userData?.name,
                    institution: userData?.institution,
                    address: userData?.address
                }
            }
            const options = { upsert: true };
            const result = await usersCollection.updateOne(filter, updateDoc, options)
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