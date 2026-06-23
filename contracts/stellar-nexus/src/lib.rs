#![no_std]
use soroban_sdk::xdr::ToXdr;
use soroban_sdk::{
    contract, contractimpl, contracttype, token, vec, Address, BytesN, Env,
    String, Symbol, Vec,
};

#[contract]
pub struct NexusContract;

// --- STORAGE KEYS ---
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,                  // Address (Admin of the protocol)
    PlatformFeeBps,         // i128 (Fee in Basis Points, e.g., 250 = 2.5%)
    Listing(u64),           // Map Listing ID -> AppletListing
    NextId,                 // Counter for Listing IDs
    Purchase(Address, u64), // (User, ListingId) -> bool (Has purchased mapping)
    Review(u64, Address),   // (ListingId, User) -> Review
}

// --- DATA TYPES ---
#[contracttype]
#[derive(Clone)]
pub struct AppletListing {
    pub id: u64,
    pub owner: Address,
    pub name: String,
    pub price: i128,      // Price in stroops
    pub code_uri: String, // IPFS hash or code identifier
    pub category: Symbol, // e.g., "Utility", "Art", "DeFi"
    pub version: u32,
    pub rating_sum: u64,
    pub rating_count: u64,
}

#[contracttype]
#[derive(Clone)]
pub struct Review {
    pub rating: u32, // 1-5 scale
    pub user: Address,
    pub comment: String,
}

// --- ERRORS ---
pub mod error {
    pub const NOT_AUTHORIZED: &str = "Nexus: Not authorized";
    pub const ALREADY_INITIALIZED: &str = "Nexus: Already initialized";
    pub const LISTING_NOT_FOUND: &str = "Nexus: Listing not found";
    pub const INSUFFICIENT_FUNDS: &str = "Nexus: Insufficient funds";
    pub const OWNER_CANNOT_BUY: &str = "Nexus: Owner cannot buy their own applet";
    pub const ALREADY_REVIEWED: &str = "Nexus: User already reviewed this applet";
    pub const NOT_A_BUYER: &str = "Nexus: Only buyers can review";
    pub const INVALID_RATING: &str = "Nexus: Rating must be between 1 and 5";
}

#[contractimpl]
impl NexusContract {
    // ============================================================
    // 🏛️ GOVERNANCE & INITIALIZATION
    // ============================================================

    /// Initialize the Nexus Protocol
    pub fn initialize(env: Env, admin: Address, fee_bps: i128) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("{}", error::ALREADY_INITIALIZED);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::PlatformFeeBps, &fee_bps);
        env.storage().instance().set(&DataKey::NextId, &1u64);
    }

    /// Update the protocol fee (Admin Only)
    pub fn set_fee(env: Env, fee_bps: i128) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        env.storage()
            .instance()
            .set(&DataKey::PlatformFeeBps, &fee_bps);
    }

    // ============================================================
    // 🛍️ SCALABLE MARKETPLACE LOGIC
    // ============================================================

    /// List a new applet with metadata and categories
    pub fn list_applet(
        env: Env,
        owner: Address,
        name: String,
        price: i128,
        code: String,
        category: Symbol,
    ) -> u64 {
        owner.require_auth();

        let id = Self::get_next_id(&env);

        let listing = AppletListing {
            id,
            owner: owner.clone(),
            name,
            price,
            code_uri: code,
            category,
            version: 1,
            rating_sum: 0,
            rating_count: 0,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Listing(id), &listing);
        env.storage().instance().set(&DataKey::NextId, &(id + 1));

        id
    }

    /// Update an existing applet (Owner Only)
    pub fn update_applet(env: Env, owner: Address, id: u64, code: String) {
        owner.require_auth();

        let mut listing: AppletListing = env
            .storage()
            .persistent()
            .get(&DataKey::Listing(id))
            .expect(error::LISTING_NOT_FOUND);

        if listing.owner != owner {
            panic!("{}", error::NOT_AUTHORIZED);
        }

        listing.code_uri = code;
        listing.version += 1;

        env.storage()
            .persistent()
            .set(&DataKey::Listing(id), &listing);
    }

    /// Advanced purchase logic with platform fee deduction
    pub fn buy_applet(env: Env, buyer: Address, listing_id: u64, token_address: Address) {
        buyer.require_auth();

        let listing: AppletListing = env
            .storage()
            .persistent()
            .get(&DataKey::Listing(listing_id))
            .expect(error::LISTING_NOT_FOUND);

        if buyer == listing.owner {
            panic!("{}", error::OWNER_CANNOT_BUY);
        }

        let fee_bps: i128 = env.storage().instance().get(&DataKey::PlatformFeeBps).unwrap();
        let fee_amount = (listing.price * fee_bps) / 10000;
        let seller_amount = listing.price - fee_amount;

        let token_client = token::Client::new(&env, &token_address);

        // 1. Pay Seller
        token_client.transfer(&buyer, &listing.owner, &seller_amount);

        // 2. Pay Platform (this contract keeps the fee)
        if fee_amount > 0 {
            token_client.transfer(&buyer, &env.current_contract_address(), &fee_amount);
        }

        // 3. Mark as purchased for review logic
        env.storage()
            .persistent()
            .set(&DataKey::Purchase(buyer.clone(), listing_id), &true);
    }

    // ============================================================
    // ⭐ REPUTATION & REVIEWS
    // ============================================================

    pub fn leave_review(env: Env, user: Address, listing_id: u64, rating: u32, comment: String) {
        user.require_auth();

        if rating < 1 || rating > 5 {
            panic!("{}", error::INVALID_RATING);
        }

        // Check if user actually bought it
        let bought: bool = env
            .storage()
            .persistent()
            .get(&DataKey::Purchase(user.clone(), listing_id))
            .unwrap_or(false);
        if !bought {
            panic!("{}", error::NOT_A_BUYER);
        }

        // Check for double reviews
        if env
            .storage()
            .persistent()
            .has(&DataKey::Review(listing_id, user.clone()))
        {
            panic!("{}", error::ALREADY_REVIEWED);
        }

        // Update listing ratings
        let mut listing: AppletListing = env
            .storage()
            .persistent()
            .get(&DataKey::Listing(listing_id))
            .unwrap();
        listing.rating_sum += rating as u64;
        listing.rating_count += 1;

        // Save review and updated listing
        let review = Review {
            rating,
            user: user.clone(),
            comment,
        };
        env.storage()
            .persistent()
            .set(&DataKey::Review(listing_id, user), &review);
        env.storage()
            .persistent()
            .set(&DataKey::Listing(listing_id), &listing);
    }

    // ============================================================
    // 💳 TREASURY MANAGEMENT
    // ============================================================

    pub fn withdraw_fees(env: Env, token_address: Address, amount: i128) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&env.current_contract_address(), &admin, &amount);
    }

    // ============================================================
    // 📊 HELPERS
    // ============================================================

    fn get_next_id(env: &Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::NextId)
            .unwrap_or(1)
    }

    pub fn get_listing(env: Env, listing_id: u64) -> AppletListing {
        env.storage()
            .persistent()
            .get(&DataKey::Listing(listing_id))
            .expect(error::LISTING_NOT_FOUND)
    }

    pub fn get_listing_count(env: Env) -> u64 {
        Self::get_next_id(&env) - 1
    }

    pub fn get_admin(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Admin).unwrap()
    }

    pub fn has_purchased(env: Env, user: Address, listing_id: u64) -> bool {
        env.storage()
            .persistent()
            .get(&DataKey::Purchase(user, listing_id))
            .unwrap_or(false)
    }


    // --- LEGACY APPLET EXAMPLES (Enhanced) ---

    pub fn get_stats(_env: Env, text: String) -> u32 {
        text.len()
    }

    pub fn generate_hash(env: Env, text: String) -> BytesN<32> {
        let data_bytes = text.to_xdr(&env);
        env.crypto().sha256(&data_bytes).into()
    }

    pub fn generate_art(env: Env, text: String) -> Vec<String> {
        let mut art = vec![&env];
        let top_border = String::from_str(&env, "╔══════════════════════╗");
        let bot_border = String::from_str(&env, "╚══════════════════════╝");
        let spacer = String::from_str(&env, "║                      ║");

        art.push_back(top_border);
        art.push_back(spacer.clone());
        art.push_back(text);
        art.push_back(spacer);
        art.push_back(bot_border);
        art
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env, String};

    #[test]
    fn test_initialization() {
        let env = Env::default();
        let contract_id = env.register_contract(None, NexusContract);
        let client = NexusContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        client.initialize(&admin, &250);

        assert_eq!(client.get_admin(), admin);
    }
}
