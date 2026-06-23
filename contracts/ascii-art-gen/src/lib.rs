#![no_std]
use soroban_sdk::{contract, contractimpl, Env, String};

#[contract]
pub struct AsciiArtGenContract;

#[contractimpl]
impl AsciiArtGenContract {
    pub fn generate_art(env: Env, text: String) -> String {
        let len = text.len() as usize;
        if len > 50 {
            return String::from_str(&env, "Text too long (max 50 chars)");
        }
        
        let mut text_buf = [0u8; 50];
        text.copy_into_slice(&mut text_buf[..len]);
        
        // Output format:
        // +--...+
        // | TEXT |
        // +--...+
        
        let mut out = [0u8; 200];
        let mut idx = 0;
        
        // Top line
        out[idx] = b'+'; idx += 1;
        for _ in 0..(len + 2) { out[idx] = b'-'; idx += 1; }
        out[idx] = b'+'; idx += 1;
        out[idx] = b'\n'; idx += 1;
        
        // Middle line
        out[idx] = b'|'; idx += 1;
        out[idx] = b' '; idx += 1;
        for i in 0..len { out[idx] = text_buf[i]; idx += 1; }
        out[idx] = b' '; idx += 1;
        out[idx] = b'|'; idx += 1;
        out[idx] = b'\n'; idx += 1;
        
        // Bottom line
        out[idx] = b'+'; idx += 1;
        for _ in 0..(len + 2) { out[idx] = b'-'; idx += 1; }
        out[idx] = b'+'; idx += 1;
        
        String::from_str(&env, core::str::from_utf8(&out[..idx]).unwrap_or("?"))
    }
}
