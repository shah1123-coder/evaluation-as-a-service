import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// CI/CD Integration endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      dataset_name, 
      model_version, 
      rubric_name,
      threshold,
      items 
    } = body;

    if (!dataset_name || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Missing required fields: dataset_name and items are required' },
        { status: 400 }
      );
    }

    // Find or use default rubric
    let rubricConfig = {
      type: 'llm',
      scale: '0-1',
      prompt_template: 'Rate the correctness of the model output on a scale of 0 to 1.'
    };

    if (rubric_name) {
      const { data: rubric } = await supabaseAdmin
        .from('rubrics')
        .select('*')
        .eq('name', rubric_name)
        .single();

      if (rubric) {
        rubricConfig = {
          type: rubric.scoring_type,
          ...rubric.config as any,
          prompt_template: rubric.prompt_template || rubricConfig.prompt_template
        };
      }
    }

    // Create evaluation
    const { data: evaluation, error: evalError } = await supabaseAdmin
      .from('evaluations')
      .insert({
        name: `${dataset_name} - ${model_version || 'latest'}`,
        rubric: rubricConfig,
        threshold: threshold || null,
        model_version: model_version || null,
        total_items: items.length,
        status: 'pending',
      })
      .select()
      .single();

    if (evalError) {
      return NextResponse.json(
        { error: 'Failed to create evaluation', details: evalError.message },
        { status: 500 }
      );
    }

    // Insert items
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
      await supabaseAdmin.from('evaluations').delete().eq('id', evaluation.id);
      return NextResponse.json(
        { error: 'Failed to create evaluation items', details: itemsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      evaluation_id: evaluation.id,
      status_url: `/api/evaluations/status?id=${evaluation.id}`,
      message: 'Evaluation job created successfully',
    });
  } catch (error: any) {
    console.error('Error in run evaluation API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

