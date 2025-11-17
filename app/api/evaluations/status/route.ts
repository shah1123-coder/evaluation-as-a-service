import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing evaluation id parameter' },
        { status: 400 }
      );
    }

    const { data: evaluation, error } = await supabaseAdmin
      .from('evaluations')
      .select('id, status, average_score, threshold, total_items, completed_items')
      .eq('id', id)
      .single();

    if (error || !evaluation) {
      return NextResponse.json(
        { error: 'Evaluation not found' },
        { status: 404 }
      );
    }

    const passed = evaluation.threshold !== null && evaluation.average_score !== null
      ? evaluation.average_score >= evaluation.threshold
      : null;

    return NextResponse.json({
      id: evaluation.id,
      status: evaluation.status,
      average_score: evaluation.average_score,
      threshold: evaluation.threshold,
      total_items: evaluation.total_items,
      completed_items: evaluation.completed_items,
      passed,
    });
  } catch (error: any) {
    console.error('Error in evaluation status API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

