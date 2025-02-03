let multer=require("multer");
let uuid=require("uuid");
let cors=require("cors")
let express= require("express");
let path=require("path");
let crypto=require("crypto");
let fs=require("fs");

let app=express();
app.use(express.json());
app.use(cors());
let uploadPath= path.join(__dirname,"uploads");
//Setting Multer stortage =>>> Destination and filename
let storage=multer.diskStorage({
    destination: (req,file,cb)=>{
            cb(null,"./uploads");
    },
    filename:
          (req,file,cb)=>{
              cb(null,`${uuid.v4()}__${Date.now()}_ ${file.originalname}`)
          }
});
//Building the encryption FUnctions....
let iv=crypto.randomBytes(16);
let key =crypto.randomBytes(32);
let algorithm="aes-256-cbc";
let encrypt=(file,key,iv,algorithm)=>{
  let readStream=fs.createReadStream(file);
  let writeStream=fs.createWriteStream(file);
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
encrypt("./uploads/file.txt",key,iv,algorithm)
//End of Encryption Function.....

//Setting multer middleware
let upload = multer({storage:storage});
app.post("/securefile/upload/Encrypt",upload.single("file"),(req,res)=>{ 
   res.json({
    message:"Successful Encrypted",
    file:req.file,
})
   console.log("The route was hit, success")
})






const Port = 3000 || process.env.PORT;

app.listen(Port,()=>{
    console.log("Secure File Backend is Live");
})