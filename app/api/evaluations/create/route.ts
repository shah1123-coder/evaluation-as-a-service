import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, rubric, threshold, model_version, items, created_by } = body;

    // Validate required fields
    if (!name || !rubric || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: name, rubric, and items are required' },
        { status: 400 }
      );
    }

    // Create evaluation record
    const { data: evaluation, error: evalError } = await supabaseAdmin
      .from('evaluations')
      .insert({
        name,
        rubric,
        threshold: threshold || null,
        model_version: model_version || null,
        total_items: items.length,
        status: 'pending',
        created_by: created_by || null,
      })
      .select()
      .single();

    if (evalError) {
      console.error('Error creating evaluation:', evalError);
      return NextResponse.json(
        { error: 'Failed to create evaluation', details: evalError.message },
        { status: 500 }
      );
    }

    // Insert evaluation items
    const evaluationItems = items.map((item: any) => ({
      evaluation_id: evaluation.id,
      prompt: item.prompt,
      expected_output: item.expected_output || null,
      model_output: item.model_output,
      status: 'pending' as const,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('evaluation_items')
      .insert(evaluationItems);

    if (itemsError) {
      console.error('Error creating evaluation items:', itemsError);
      // Rollback: delete the evaluation
      await supabaseAdmin.from('evaluations').delete().eq('id', evaluation.id);
      return NextResponse.json(
        { error: 'Failed to create evaluation items', details: itemsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      evaluation_id: evaluation.id,
      message: `Evaluation created with ${items.length} items`,
    });
  } catch (error: any) {
    console.error('Error in create evaluation API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

