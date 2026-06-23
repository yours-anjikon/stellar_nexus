import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";
if (typeof window !== "undefined") {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
}
export const networks = {
    testnet: {
        networkPassphrase: "Test SDF Network ; September 2015",
        contractId: "CCXCZKXBRSWRTKMB3I2LBWM2BLRVWQ325PCYKKSEQQNY572C55CN3KVQ",
    }
};
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAQAAAAAAAAAAAAAABlJldmlldwAAAAAAAwAAAAAAAAAHY29tbWVudAAAAAAQAAAAAAAAAAZyYXRpbmcAAAAAAAQAAAAAAAAABHVzZXIAAAAT",
            "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABgAAAAAAAAAAAAAABUFkbWluAAAAAAAAAAAAAAAAAAAOUGxhdGZvcm1GZWVCcHMAAAAAAAEAAAAAAAAAB0xpc3RpbmcAAAAAAQAAAAYAAAAAAAAAAAAAAAZOZXh0SWQAAAAAAAEAAAAAAAAACFB1cmNoYXNlAAAAAgAAABMAAAAGAAAAAQAAAAAAAAAGUmV2aWV3AAAAAAACAAAABgAAABM=",
            "AAAAAQAAAAAAAAAAAAAADUFwcGxldExpc3RpbmcAAAAAAAAJAAAAAAAAAAhjYXRlZ29yeQAAABEAAAAAAAAACGNvZGVfdXJpAAAAEAAAAAAAAAACaWQAAAAAAAYAAAAAAAAABG5hbWUAAAAQAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAABXByaWNlAAAAAAAACwAAAAAAAAAMcmF0aW5nX2NvdW50AAAABgAAAAAAAAAKcmF0aW5nX3N1bQAAAAAABgAAAAAAAAAHdmVyc2lvbgAAAAAE",
            "AAAAAAAAACRVcGRhdGUgdGhlIHByb3RvY29sIGZlZSAoQWRtaW4gT25seSkAAAAHc2V0X2ZlZQAAAAABAAAAAAAAAAdmZWVfYnBzAAAAAAsAAAAA",
            "AAAAAAAAAAAAAAAJZ2V0X2FkbWluAAAAAAAAAAAAAAEAAAAT",
            "AAAAAAAAAAAAAAAJZ2V0X3N0YXRzAAAAAAAAAQAAAAAAAAAEdGV4dAAAABAAAAABAAAABA==",
            "AAAAAAAAADNBZHZhbmNlZCBwdXJjaGFzZSBsb2dpYyB3aXRoIHBsYXRmb3JtIGZlZSBkZWR1Y3Rpb24AAAAACmJ1eV9hcHBsZXQAAAAAAAMAAAAAAAAABWJ1eWVyAAAAAAAAEwAAAAAAAAAKbGlzdGluZ19pZAAAAAAABgAAAAAAAAANdG9rZW5fYWRkcmVzcwAAAAAAABMAAAAA",
            "AAAAAAAAAB1Jbml0aWFsaXplIHRoZSBOZXh1cyBQcm90b2NvbAAAAAAAAAppbml0aWFsaXplAAAAAAACAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAAB2ZlZV9icHMAAAAACwAAAAA=",
            "AAAAAAAAAAAAAAALZ2V0X2xpc3RpbmcAAAAAAQAAAAAAAAAKbGlzdGluZ19pZAAAAAAABgAAAAEAAAfQAAAADUFwcGxldExpc3RpbmcAAAA=",
            "AAAAAAAAAC5MaXN0IGEgbmV3IGFwcGxldCB3aXRoIG1ldGFkYXRhIGFuZCBjYXRlZ29yaWVzAAAAAAALbGlzdF9hcHBsZXQAAAAABQAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAARuYW1lAAAAEAAAAAAAAAAFcHJpY2UAAAAAAAALAAAAAAAAAARjb2RlAAAAEAAAAAAAAAAIY2F0ZWdvcnkAAAARAAAAAQAAAAY=",
            "AAAAAAAAAAAAAAAMZ2VuZXJhdGVfYXJ0AAAAAQAAAAAAAAAEdGV4dAAAABAAAAABAAAD6gAAABA=",
            "AAAAAAAAAAAAAAAMbGVhdmVfcmV2aWV3AAAABAAAAAAAAAAEdXNlcgAAABMAAAAAAAAACmxpc3RpbmdfaWQAAAAAAAYAAAAAAAAABnJhdGluZwAAAAAABAAAAAAAAAAHY29tbWVudAAAAAAQAAAAAA==",
            "AAAAAAAAAAAAAAANZ2VuZXJhdGVfaGFzaAAAAAAAAAEAAAAAAAAABHRleHQAAAAQAAAAAQAAA+4AAAAg",
            "AAAAAAAAAAAAAAANaGFzX3B1cmNoYXNlZAAAAAAAAAIAAAAAAAAABHVzZXIAAAATAAAAAAAAAApsaXN0aW5nX2lkAAAAAAAGAAAAAQAAAAE=",
            "AAAAAAAAACZVcGRhdGUgYW4gZXhpc3RpbmcgYXBwbGV0IChPd25lciBPbmx5KQAAAAAADXVwZGF0ZV9hcHBsZXQAAAAAAAADAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAAAmlkAAAAAAAGAAAAAAAAAARjb2RlAAAAEAAAAAA=",
            "AAAAAAAAAAAAAAANd2l0aGRyYXdfZmVlcwAAAAAAAAIAAAAAAAAADXRva2VuX2FkZHJlc3MAAAAAAAATAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAA",
            "AAAAAAAAAAAAAAARZ2V0X2xpc3RpbmdfY291bnQAAAAAAAAAAAAAAQAAAAY="]), options);
        this.options = options;
    }
    fromJSON = {
        set_fee: (this.txFromJSON),
        get_admin: (this.txFromJSON),
        get_stats: (this.txFromJSON),
        buy_applet: (this.txFromJSON),
        initialize: (this.txFromJSON),
        get_listing: (this.txFromJSON),
        list_applet: (this.txFromJSON),
        generate_art: (this.txFromJSON),
        leave_review: (this.txFromJSON),
        generate_hash: (this.txFromJSON),
        has_purchased: (this.txFromJSON),
        update_applet: (this.txFromJSON),
        withdraw_fees: (this.txFromJSON),
        get_listing_count: (this.txFromJSON)
    };
}
