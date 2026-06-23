#![no_std]
use soroban_sdk::{contract, contractimpl, Env, String};

#[contract]
pub struct TextProcessorContract;

#[contractimpl]
impl TextProcessorContract {
    pub fn get_stats(_env: Env, text: String) -> u32 {
        text.len()
    }

    pub fn execute(env: Env, text: String) -> String {
        let len = text.len() as usize;
        if len > 256 {
            return String::from_str(&env, "Text too long to process");
        }
        
        let mut buf = [0u8; 256];
        text.copy_into_slice(&mut buf[..len]);
        
        // Reverse the string
        buf[..len].reverse();
        
        // Return reversed string
        String::from_str(&env, core::str::from_utf8(&buf[..len]).unwrap_or("Invalid UTF-8"))
    }
}
