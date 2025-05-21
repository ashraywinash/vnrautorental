const express = require("express")
const mongoose = require("mongoose")
const ejs = require("ejs")
const Razorpay = require("razorpay");
const adminRouter = require("./routes/adminRouter");
require("dotenv").config();
const app = express()
app.set("view engine", "ejs")

//Database 
const mongoURL = "mongodb://localhost:27017/vnrautorental"
mongoose.connect(mongoURL).then(console.log("mongDB connected"))

app.use(express.urlencoded({extended : true}))
app.use(express.json()) // Middleware to parse JSON request bodies

//Database ends


// Home page
app.get("/",(req,res)=>{
    res.render("signin.ejs", { message: "Welcome to VNR Auto Rental!" })
})


// This route handles the sign-in form submission
app.post("/homepage",(req,res)=>{
    userId = req.body.userId

    //check if userId is valid from database
    if(userId == null || userId == undefined || userId == ""){
        return res.status(400).send({ error: "Invalid User ID" });
    }


    // get number of months rent pending from database
    pendingMonths = 3 // get from database 
    rentPerMonth = 7000 // get from database

    render_data = {
        userId: userId,
        pendingMonths: pendingMonths,
        rentPerMonth: rentPerMonth,
        message: "Welcome to VNR Auto Rental!"
    }

    return res.render("homepage.ejs", render_data)
})


// This route handles the payment initiation
app.post("/create-order",(req,res)=>{  

    var instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_API_SECRET
    });

    const { amount, currency, receipt, notes } = req.body;
    const options = {
        amount: amount * 100, // amount in the smallest currency unit
        currency: currency || "INR",
        receipt: receipt || "receipt#1",
        notes: notes || {},
        payment_capture: 1 // auto capture
    };


    instance.orders.create(options, function(err, order) {
        if (err) {
            console.error("Error creating order:", err);
            return res.status(500).send({ error: "Failed to create order" });
        }
        return res.send(order);
    });
    return res.status(500)
})


// This route handles the payment success callback from Razorpay
app.post("/payment-success",(req,res)=>{


    const paymentId = req.body.razorpay_payment_id;
    const orderId = req.body.razorpay_order_id;
    const signature = req.body.razorpay_signature;



    if (!paymentId || !orderId || !signature) {
        console.error("Missing required fields in request body");
        return res.status(400).send({ error: "Missing required fields" });
    }

    // verify the signature
    var crypto = require("crypto");
    const PDFDocument = require("pdfkit");
    const fs = require("fs");
    const path = require("path");
    var hmac = crypto.createHmac("sha256", process.env.RAZORPAY_API_SECRET);
    hmac.update(orderId + "|" + paymentId);
    var generatedSignature = hmac.digest("hex");

    if (generatedSignature === signature) {
        // Create a new PDF document
        const doc = new PDFDocument();

        // Define the file path for the PDF
        const filePath = path.join(__dirname, "receipt.pdf");

        // Pipe the PDF to a file
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        // Add content to the PDF
        doc.fontSize(20).text("Payment Receipt", { align: "center" });
        doc.moveDown();
        doc.fontSize(14).text(`Order ID: ${orderId}`);
        doc.text(`Payment ID: ${paymentId}`);
        doc.text(`Signature: ${signature}`);
        doc.text(`Message: Payment Successful`);
        doc.end();

        // Wait for the PDF to be written to the file
        writeStream.on("finish", () => {
            // Send the PDF file as a downloadable response
            res.download(filePath, "receipt.pdf", (err) => {
            if (err) {
                console.error("Error sending PDF:", err);
                return res.status(500).send({ error: "Failed to send receipt" });
            }

            // Optionally, delete the file after sending
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) {
                console.error("Error deleting PDF:", unlinkErr);
                }
            });
            });
        });
    } else {
        console.error("Signature verification failed");
        return res.status(400).send({ error: "Payment verification failed" });
    }
}
)


app.use("/admin", adminRouter);

const PORT = 6969
app.listen(PORT, () => {})