let multer=require("multer");
let uuid=require("uuid");
let cors=require("cors")
let express= require("express");
let path=require("path");
let crypto=require("crypto");
let fs=require("fs");
const { console } = require("inspector");

let app=express();
app.use(express.json());
app.use(cors());
//Setting Multer stortage =>>> Destination and filename
let storage=multer.diskStorage({
    destination: (req,file,cb)=>{
            cb(null,"./uploads");
    },
    filename:
          (req,file,cb)=>{
              cb(null,`${uuid.v4()}__${Date.now()}_ ${file.originalname}`);
          }
});
//Building the encryption FUnctions....


//Setting multer middleware
let upload = multer({storage:storage});
app.post ("/securefile/upload/Encrypt",upload.single("file"),(req,res)=>{ 
  let iv=crypto.randomBytes(16);
  let key =crypto.randomBytes(32);
  let algorithm="aes-256-cbc";
  let filePath=req.file.filepath;
  let encrypt=(filePath,key,iv,algorithm)=>{
  let readStream=fs.createReadStream(filePath);
  let writeStream=fs.createWriteStream(filePath);
  let cipher = crypto.createCipheriv(algorithm,key,iv);
    readStream.on("data",(chunk)=>{
     try{
      let enc=cipher.update(chunk);
      writeStream.write(enc);
     }catch(err) {if(err) throw err}
      
    }) 
    readStream.on("end",()=>{
      try{
          let enc = cipher.final();
          writeStream.write(enc);
          writeStream.end()
      }catch(err){
       if(err){throw err}
      }
     })
     writeStream.on("finish",()=>{
      console.log("Finishe Encryption...")
    })
  };
  console.log(filePath)
  encrypt(filePath,key,iv,algorithm)
  //End of Encryption Function.....

  //Sending Response
   res.json({
    message:"Successful Encrypted",
    file:req.file,
})
   console.log(req.file)
})
 //Bugs fixes soon coming .... Wait until i can understand my own code.....





const Port = 3000 || process.env.PORT;

app.listen(Port,()=>{
    console.log("Secure File Backend is Live");
})