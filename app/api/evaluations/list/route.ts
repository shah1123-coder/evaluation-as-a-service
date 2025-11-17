import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data: evaluations, error } = await supabaseAdmin
      .from('evaluations')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching evaluations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch evaluations' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      evaluations: evaluations || [],
      count: evaluations?.length || 0,
    });
  } catch (error: any) {
    console.error('Error in list evaluations API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

