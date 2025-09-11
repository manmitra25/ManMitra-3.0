 require("dotenv").config()
 const express = require('express');
const app = express();
 const connectDB = require("./src/utils/db")
 const authRouter = require('./src/router/auth-router');
 const cors = require('cors')
 const serviceRouter = require("./src/router/service-router");
 const aiRouter = require("./src/router/ai-router"); 


//data milne se pehle cors apply
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials:true,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

//  http://localhost:5173
app.use(cors(corsOptions))



app.use(express.json());
app.use("/api/auth", authRouter);
+
app.use("/api/service", serviceRouter);
app.use("/api/ai", aiRouter);

connectDB().then(() =>{
  app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
  })
})
 
