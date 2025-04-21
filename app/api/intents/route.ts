// app/api/intents/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '../../../utils/supabase';

export async function POST(request: NextRequest) {
  /**
   * Buyer publishes:
   * {
   *   intentId: number,
   *   buyer: {
   *     walletAddress: string,  // e.g. "0xABC123"
   *     productLink: string,
   *     shippingAddress: string,
   *     quantity: number
   *   }
   * }
   */
  try {
    const { intentId, buyer } = await request.json();

    if (!intentId || !buyer?.walletAddress) {
      return NextResponse.json(
        { error: 'Must provide intentId and buyer.walletAddress.' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    
    // Insert/update the flattened intent record
    const { error } = await supabase
      .from('intents')
      .upsert({
        id: `intent_${intentId}`, // Generate a unique ID
        intent_id: intentId,
        wallet_address: buyer.walletAddress,
        shipping_address: buyer.shippingAddress,
        product_link: buyer.productLink,
        quantity: buyer.quantity,
        timestamp: new Date().toISOString()
      }, { onConflict: 'intent_id' });

    if (error) throw error;

    return NextResponse.json({
      status: 'success',
      message: 'Buyer data published.',
      intentId,
    });
  } catch (err: any) {
    console.error('Error in POST /api/intents:', err);
    return NextResponse.json(
      { error: 'Could not publish buyer data.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  /**
   * Solver publishes:
   * {
   *   intentId: number,
   *   solver: {
   *     walletAddress: string,  // e.g. "0xSOLVER789"
   *     deliveryDate: string
   *   }
   * }
   */
  try {
    const { intentId, solver } = await request.json();

    if (!intentId || !solver?.walletAddress) {
      return NextResponse.json(
        { error: 'Must provide intentId and solver.walletAddress.' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    
    // Update the existing record with solver data
    const { error } = await supabase
      .from('intents')
      .update({
        solver_wallet_address: solver.walletAddress,
        solver_delivery_date: solver.deliveryDate,
        timestamp: new Date().toISOString()
      })
      .eq('intent_id', intentId);
    
    if (error) throw error;

    return NextResponse.json({
      status: 'success',
      message: 'Solver data published.',
      intentId,
    });
  } catch (err: any) {
    console.error('Error in PATCH /api/intents:', err);
    return NextResponse.json(
      { error: 'Could not publish solver data.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  /**
   * GET /api/intents
   * Query Params:
   *   - wallet_address: Filter by buyer's wallet address
   *   - intent_id: Get a specific intent by ID
   *   - page: Page number (default: 1)
   *   - limit: Items per page (default: 10, max: 50)
   */
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet_address');
    const intentId = searchParams.get('intent_id');
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '10', 10),
      50 // Maximum allowed limit
    );
    const offset = (page - 1) * limit;

    const supabase = getSupabase();
    
    // Build the query
    let query = supabase.from('intents').select('*');

    // Apply filters if provided
    if (walletAddress) {
      query = query.eq('wallet_address', walletAddress);
    }
    
    if (intentId) {
      query = query.eq('intent_id', parseInt(intentId, 10));
    }
    
    // Order by timestamp in descending order (newest first)
    query = query.order('timestamp', { ascending: false });
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    // Get total count for pagination
    let countQuery = supabase
      .from('intents')
      .select('*', { count: 'exact', head: true });
      
    // Apply the same filters to the count query
    if (walletAddress) {
      countQuery = countQuery.eq('wallet_address', walletAddress);
    }
    
    if (intentId) {
      countQuery = countQuery.eq('intent_id', parseInt(intentId, 10));
    }
    
    const { count: totalCount, error: countError } = await countQuery;
    
    if (countError) throw countError;

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (err: any) {
    console.error('Error in GET /api/intents:', err);
    return NextResponse.json(
      { error: 'Could not retrieve intents.' },
      { status: 500 }
    );
  }
}
