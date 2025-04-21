# Schema Design: Firestore to Supabase Migration

## Overview

This document explains the schema changes made during the migration from Firebase Firestore to Supabase, focusing on the flattened table design and its benefits.

## Previous Schema (Firestore)

In the previous Firestore implementation, we used a document-oriented structure with:

1. **Intents Collection**
   - Documents identified by `intentId`
   - Contained nested objects for `buyer` and `solver`
   - Referenced a separate `strings` collection for message data

2. **Strings Collection**
   - Stored message data related to intents
   - Required querying by index to match with the correct intent

This approach had several limitations:
- Required multiple queries to get complete intent data
- Used array indexing which was error-prone
- Created redundant data storage
- Made queries more complex

## New Schema (Supabase)

The migration to Supabase introduces a flattened relational schema with a single `intents` table:

```sql
CREATE TABLE intents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  intent_id TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  shipping_address TEXT,
  product_link TEXT,
  quantity INTEGER,
  solver_wallet_address TEXT,
  solver_delivery_date TIMESTAMP,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

Key differences:
- No nested JSON objects (though Supabase supports them)
- Direct column access for all fields
- Single query can retrieve all relevant data
- Uses SQL's efficient indexing for filtering

## Benefits of the Flattened Schema

1. **Performance**
   - Faster queries with direct column access
   - Efficient indexing on columns used for filtering
   - Reduced data transfer sizes

2. **Simplicity**
   - Straightforward queries without nested field access
   - Easier to maintain and understand
   - Consistent data structure

3. **Better Server-Side Filtering**
   - Native SQL filtering is more efficient than filtering in application code
   - Enables proper pagination with LIMIT and OFFSET

4. **Reduced Data Redundancy**
   - Eliminated the separate strings collection
   - Uses direct fields instead of duplicating data

5. **Type Safety**
   - Column types are enforced by the database schema
   - Reduces errors from incorrect data types

## Implementation Details

### Database Schema

```sql
CREATE TABLE intents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  intent_id TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  shipping_address TEXT,
  product_link TEXT,
  quantity INTEGER,
  solver_wallet_address TEXT,
  solver_delivery_date TIMESTAMP,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX idx_intents_wallet_address ON intents(wallet_address);
CREATE INDEX idx_intents_intent_id ON intents(intent_id);
```

### API Changes

The API now directly reflects the flattened schema:

1. **Creating/Updating Intents**
   ```javascript
   // POST /api/intents
   const { data, error } = await supabase
     .from('intents')
     .upsert({
       intent_id: intentId,
       wallet_address: buyer.address,
       shipping_address: buyer.shippingAddress,
       product_link: buyer.productLink,
       quantity: buyer.quantity
     });
   ```

2. **Querying Intents**
   ```javascript
   // GET /api/intents?wallet_address=0x123&page=1&limit=10
   let query = supabase
     .from('intents')
     .select('*');
     
   if (wallet_address) {
     query = query.eq('wallet_address', wallet_address);
   }
   
   if (intent_id) {
     query = query.eq('intent_id', intent_id);
   }
   
   const { data, error } = await query
     .order('timestamp', { ascending: false })
     .range(offset, offset + limit - 1);
   ```

## Frontend Changes

Components now directly access fields without navigating through nested objects:

```javascript
// Before
const shippingAddress = intentData.buyer.shippingAddress;
const productLink = intentData.buyer.productLink;

// After
const shippingAddress = intentData.shipping_address;
const productLink = intentData.product_link;
```

## Pagination Implementation

The flattened schema enables efficient pagination:

```javascript
// Query count for pagination metadata
const { count } = await supabase
  .from('intents')
  .select('*', { count: 'exact' })
  .eq('wallet_address', wallet_address);

// Return data with pagination info
return NextResponse.json({
  data: data || [],
  pagination: {
    page: page,
    limit: limit,
    total: count || 0,
    totalPages: Math.ceil((count || 0) / limit)
  }
});
```

## Conclusion

The migration to a flattened schema in Supabase brings significant improvements in performance, maintainability, and user experience. The relational approach with direct column access simplifies development while providing better database efficiency and query capabilities. 