#![no_std]
use soroban_sdk::{contract, contractimpl, Env, String, Bytes, BytesN};

#[contract]
pub struct HashGeneratorContract;

#[contractimpl]
impl HashGeneratorContract {
    pub fn generate_hash(env: Env, text: String) -> BytesN<32> {
        let len = text.len() as usize;
        let mut buf = [0u8; 256];
        let bytes_len = if len > 256 { 256 } else { len };
        text.copy_into_slice(&mut buf[..bytes_len]);
        
        let bytes = Bytes::from_slice(&env, &buf[..bytes_len]);
        env.crypto().sha256(&bytes).into()
    }
}
