import { Buffer } from "buffer";
import { AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions, MethodOptions } from "@stellar/stellar-sdk/contract";
import type { u32, u64, i128 } from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";
export declare const networks: {
    readonly testnet: {
        readonly networkPassphrase: "Test SDF Network ; September 2015";
        readonly contractId: "CCXCZKXBRSWRTKMB3I2LBWM2BLRVWQ325PCYKKSEQQNY572C55CN3KVQ";
    };
};
export interface Review {
    comment: string;
    rating: u32;
    user: string;
}
export type DataKey = {
    tag: "Admin";
    values: void;
} | {
    tag: "PlatformFeeBps";
    values: void;
} | {
    tag: "Listing";
    values: readonly [u64];
} | {
    tag: "NextId";
    values: void;
} | {
    tag: "Purchase";
    values: readonly [string, u64];
} | {
    tag: "Review";
    values: readonly [u64, string];
};
export interface AppletListing {
    category: string;
    code_uri: string;
    id: u64;
    name: string;
    owner: string;
    price: i128;
    rating_count: u64;
    rating_sum: u64;
    version: u32;
}
export interface Client {
    /**
     * Construct and simulate a set_fee transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Update the protocol fee (Admin Only)
     */
    set_fee: ({ fee_bps }: {
        fee_bps: i128;
    }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a get_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_admin: (options?: MethodOptions) => Promise<AssembledTransaction<string>>;
    /**
     * Construct and simulate a get_stats transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_stats: ({ text }: {
        text: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<u32>>;
    /**
     * Construct and simulate a buy_applet transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Advanced purchase logic with platform fee deduction
     */
    buy_applet: ({ buyer, listing_id, token_address }: {
        buyer: string;
        listing_id: u64;
        token_address: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Initialize the Nexus Protocol
     */
    initialize: ({ admin, fee_bps }: {
        admin: string;
        fee_bps: i128;
    }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a get_listing transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_listing: ({ listing_id }: {
        listing_id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<AppletListing>>;
    /**
     * Construct and simulate a list_applet transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * List a new applet with metadata and categories
     */
    list_applet: ({ owner, name, price, code, category }: {
        owner: string;
        name: string;
        price: i128;
        code: string;
        category: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<u64>>;
    /**
     * Construct and simulate a generate_art transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    generate_art: ({ text }: {
        text: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Array<string>>>;
    /**
     * Construct and simulate a leave_review transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    leave_review: ({ user, listing_id, rating, comment }: {
        user: string;
        listing_id: u64;
        rating: u32;
        comment: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a generate_hash transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    generate_hash: ({ text }: {
        text: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Buffer>>;
    /**
     * Construct and simulate a has_purchased transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    has_purchased: ({ user, listing_id }: {
        user: string;
        listing_id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<boolean>>;
    /**
     * Construct and simulate a update_applet transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Update an existing applet (Owner Only)
     */
    update_applet: ({ owner, id, code }: {
        owner: string;
        id: u64;
        code: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a withdraw_fees transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    withdraw_fees: ({ token_address, amount }: {
        token_address: string;
        amount: i128;
    }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a get_listing_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_listing_count: (options?: MethodOptions) => Promise<AssembledTransaction<u64>>;
}
export declare class Client extends ContractClient {
    readonly options: ContractClientOptions;
    static deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions & Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
    }): Promise<AssembledTransaction<T>>;
    constructor(options: ContractClientOptions);
    readonly fromJSON: {
        set_fee: (json: string) => AssembledTransaction<null>;
        get_admin: (json: string) => AssembledTransaction<string>;
        get_stats: (json: string) => AssembledTransaction<number>;
        buy_applet: (json: string) => AssembledTransaction<null>;
        initialize: (json: string) => AssembledTransaction<null>;
        get_listing: (json: string) => AssembledTransaction<AppletListing>;
        list_applet: (json: string) => AssembledTransaction<bigint>;
        generate_art: (json: string) => AssembledTransaction<string[]>;
        leave_review: (json: string) => AssembledTransaction<null>;
        generate_hash: (json: string) => AssembledTransaction<Buffer<ArrayBufferLike>>;
        has_purchased: (json: string) => AssembledTransaction<boolean>;
        update_applet: (json: string) => AssembledTransaction<null>;
        withdraw_fees: (json: string) => AssembledTransaction<null>;
        get_listing_count: (json: string) => AssembledTransaction<bigint>;
    };
}
