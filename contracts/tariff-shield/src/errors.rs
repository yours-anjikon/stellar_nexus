use soroban_sdk::contracterror;

#[contracterror]
#[derive(Clone, Copy, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    ImporterNotRegistered = 3,
    ImporterAlreadyRegistered = 4,
    InvalidAmount = 5,
    CollateralBelowRequired = 6,
    AccountFrozen = 7,
}
