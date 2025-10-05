module medichain::fundraiser {
    use std::signer;
    use std::string::String;
    use aptos_framework::coin::Self;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::event;
    use aptos_framework::table::{Self, Table};
    use aptos_framework::timestamp;

    // Error codes
    const E_NOT_INITIALIZED: u64 = 1;
    const E_ALREADY_INITIALIZED: u64 = 2;
    const E_NOT_AUTHORIZED: u64 = 3;
    const E_CAMPAIGN_NOT_FOUND: u64 = 4;
    const E_CAMPAIGN_NOT_ACTIVE: u64 = 5;
    const E_INVALID_AMOUNT: u64 = 6;
    const E_NOT_VERIFIED_DOCTOR: u64 = 7;

    // Structs
    struct Fundraiser has key {
        admin: address,
        campaigns: Table<u64, Campaign>,
        campaign_counter: u64,
        medichain_address: address,
    }

    struct Campaign has store, copy, drop {
        id: u64,
        beneficiary: address,
        creator: address,
        goal_amount: u64,
        total_donations: u64,
        title: String,
        description: String,
        is_active: bool,
        created_at: u64,
    }

    struct Donation has store, copy, drop {
        donor: address,
        amount: u64,
        timestamp: u64,
    }

    // Events
    #[event]
    struct CampaignCreated has drop, store {
        campaign_id: u64,
        beneficiary: address,
        creator: address,
        goal_amount: u64,
        title: String,
    }

    #[event]
    struct DonationReceived has drop, store {
        campaign_id: u64,
        donor: address,
        amount: u64,
    }

    #[event]
    struct CampaignClosed has drop, store {
        campaign_id: u64,
        total_raised: u64,
    }

    // Initialize the Fundraiser contract
    public entry fun initialize(admin: &signer, medichain_address: address) {
        let admin_addr = signer::address_of(admin);
        
        move_to(admin, Fundraiser {
            admin: admin_addr,
            campaigns: table::new(),
            campaign_counter: 0,
            medichain_address,
        });
    }

    // Create a new fundraising campaign (all donations go to admin wallet)
    public entry fun create_campaign(
        creator: &signer,
        goal_amount: u64,
        title: String,
        description: String,
    ) {
        let creator_addr = signer::address_of(creator);
        
        // Simplified version that works without initialization
        // All donations go to the admin wallet (contract deployer)
        let admin_addr = @medichain;
        
        // Simply emit an event for now - this will work without initialization
        event::emit(CampaignCreated {
            campaign_id: 1, // Simple ID for now
            beneficiary: admin_addr, // All donations go to admin wallet
            creator: creator_addr,
            goal_amount,
            title,
        });
    }

    // Donate to a campaign
    public entry fun donate(
        donor: &signer,
        campaign_id: u64,
        amount: u64,
    ) {
        let donor_addr = signer::address_of(donor);
        
        // Simplified version that works without initialization
        // Transfer APT from donor to admin wallet
        let admin_addr = @medichain;
        let donor_coin = coin::withdraw<AptosCoin>(donor, amount);
        coin::deposit(admin_addr, donor_coin);

        // Simply emit an event for now - this will work without initialization
        event::emit(DonationReceived {
            campaign_id,
            donor: donor_addr,
            amount,
        });
    }

    // Close a campaign manually
    public entry fun close_campaign(admin: &signer, campaign_id: u64) {
        let admin_addr = signer::address_of(admin);
        let fundraiser = borrow_global_mut<Fundraiser>(@medichain);
        assert!(admin_addr == fundraiser.admin, E_NOT_AUTHORIZED);
        
        assert!(table::contains(&fundraiser.campaigns, campaign_id), E_CAMPAIGN_NOT_FOUND);
        let campaign = table::borrow_mut(&mut fundraiser.campaigns, campaign_id);
        
        if (campaign.is_active) {
            campaign.is_active = false;
            event::emit(CampaignClosed {
                campaign_id,
                total_raised: campaign.total_donations,
            });
        }
    }

    // View functions
    public fun get_campaign(campaign_id: u64): Campaign acquires Fundraiser {
        let fundraiser = borrow_global<Fundraiser>(@medichain);
        *table::borrow(&fundraiser.campaigns, campaign_id)
    }

    public fun get_campaign_count(): u64 acquires Fundraiser {
        let fundraiser = borrow_global<Fundraiser>(@medichain);
        fundraiser.campaign_counter
    }

    public fun is_campaign_active(campaign_id: u64): bool acquires Fundraiser {
        let fundraiser = borrow_global<Fundraiser>(@medichain);
        if (table::contains(&fundraiser.campaigns, campaign_id)) {
            table::borrow(&fundraiser.campaigns, campaign_id).is_active
        } else {
            false
        }
    }
}
