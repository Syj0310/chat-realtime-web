export async function generateKeyPair(){
    return await window.crypto.subtle.generateKey(
        {name:"RSA-OAEP", modulusLength:2048, publicExponent:new Uint8Array([1,0,1]), hash:"SHA-256"},
        true,
        ["encrypt","decrypt"]
    );
}

export async function encryptRSA(msg, publicKey){
    const enc = new TextEncoder().encode(msg);
    const buffer = await crypto.subtle.encrypt({name:"RSA-OAEP"}, publicKey, enc);
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

export async function decryptRSA(b64, privateKey){
    const bytes = Uint8Array.from(atob(b64), c=>c.charCodeAt(0));
    const buffer = await crypto.subtle.decrypt({name:"RSA-OAEP"}, privateKey, bytes);
    return new TextDecoder().decode(buffer);
}
