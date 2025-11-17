import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch evaluation
    const { data: evaluation, error: evalError } = await supabaseAdmin
      .from('evaluations')
      .select('*')
      .eq('id', id)
      .single();

    if (evalError || !evaluation) {
      return NextResponse.json(
        { error: 'Evaluation not found' },
        { status: 404 }
      );
    }

    // Fetch evaluation items
    const { data: items, error: itemsError } = await supabaseAdmin
      .from('evaluation_items')
      .select('*')
      .eq('evaluation_id', id)
      .order('created_at', { ascending: true });

    if (itemsError) {
      console.error('Error fetching evaluation items:', itemsError);
      return NextResponse.json(
        { error: 'Failed to fetch evaluation items' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      evaluation,
      items: items || [],
    });
  } catch (error: any) {
    console.error('Error in get evaluation API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

