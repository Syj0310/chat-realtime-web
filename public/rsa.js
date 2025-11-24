let myPrivateKey = "";
let myPublicKey = "";


const generateKeysBtn = document.getElementById("generateKeys");
const publicKeyBox = document.getElementById("publicKey");
const friendKeyBox = document.getElementById("friendKey");


// Generar llaves RSA


generateKeysBtn.onclick = () => {
const crypt = new JSEncrypt({ default_key_size: "1024" });
myPrivateKey = crypt.getPrivateKey();
myPublicKey = crypt.getPublicKey();
publicKeyBox.value = myPublicKey;
alert("Llaves generadas. Copia tu llave pública y pásala a tu amigo.");
};


// Cifrar
function encryptMessage(msg) {
const crypt = new JSEncrypt();
crypt.setPublicKey(friendKeyBox.value.trim());
return crypt.encrypt(msg);
}


// Descifrar
function decryptMessage(msg) {
const crypt = new JSEncrypt();
crypt.setPrivateKey(myPrivateKey);
return crypt.decrypt(msg);
}