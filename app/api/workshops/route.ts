import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/app/lib/supabaseServerClient'
import { createWorkshopSchema } from '@/app/validationSchemas/workshopSchemas'
import logger from '@/app/lib/logger'
import { setCorsHeaders } from '@/app/lib/setCorsHeaders'
import { Workshop } from '@/app/types'

export async function GET(request: NextRequest) {
  let response: NextResponse<any> = setCorsHeaders(request, NextResponse.json({}) as NextResponse<any>);
  const { searchParams } = new URL(request.url)
  const searchQuery = searchParams.get('search')
  const showArchived = searchParams.get('showArchived') === 'true'
  const typeFilter = searchParams.get('type') // 'AUDIO' or 'VIDEO'
  const statusFilter = searchParams.get('status') // 'LIVE', 'ENDED', or 'SCHEDULED'

  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    const isAdmin = user && (await supabase.from('profiles').select('role').eq('id', user.id).single()).data?.role === 'admin'

    let query = supabase
      .from('workshops')
      .select('*')
      .order('start_time', { ascending: true })

    if (!showArchived || !isAdmin) {
      query = query.eq('is_archived', false)
    }

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
    }

    if (typeFilter && ['AUDIO', 'VIDEO'].includes(typeFilter)) {
      query = query.eq('type', typeFilter)
    }

    if (statusFilter && ['LIVE', 'ENDED', 'SCHEDULED'].includes(statusFilter)) {
      query = query.eq('status', statusFilter)
    }

    const { data: workshops, error: fetchError } = await query

    if (fetchError) {
      logger.error('Error fetching workshops', fetchError)
      let errorResponse: NextResponse<any> = setCorsHeaders(request, NextResponse.json(
        { error: 'Failed to fetch workshops' },
        { status: 500 }
      ) as NextResponse<any>);
      return errorResponse as NextResponse<any>;
    }

    // Get total count of workshops
    const { count: totalWorkshopsCount, error: countError } = await supabase
      .from('workshops')
      .select('id', { count: 'exact', head: true })

    if (countError) {
      logger.error('Error fetching total workshops count', countError)
    }

    let successResponse: NextResponse<any> = setCorsHeaders(request, NextResponse.json({ workshops, totalWorkshopsCount }) as NextResponse<any>);
    return successResponse as NextResponse<any>;
  } catch (error) {
    logger.error('Error fetching workshops', error)
    let errorResponse: NextResponse<any> = setCorsHeaders(request, NextResponse.json(
      { error: 'Failed to fetch workshops' },
      { status: 500 }
    ) as NextResponse<any>);
    return errorResponse as NextResponse<any>;
  }
}

export async function POST(request: NextRequest) {
  let response: NextResponse<any> = setCorsHeaders(request, NextResponse.json({}) as NextResponse<any>);
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      let errorResponse: NextResponse<any> = setCorsHeaders(request, NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ) as NextResponse<any>);
      return errorResponse as NextResponse<any>;
    }

    // Fetch user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      let errorResponse: NextResponse<any> = setCorsHeaders(request, NextResponse.json(
        { error: 'Forbidden - Only admins can create workshops' },
        { status: 403 }
      ));
      return errorResponse;
    }

    const body = await request.json()
    
    // Validate incoming data with Zod
    const validationResult = createWorkshopSchema.safeParse(body);
    if (!validationResult.success) {
      let errorResponse: NextResponse<any> = setCorsHeaders(request, NextResponse.json(
        { error: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      ));
      return errorResponse;
    }
    const { title, description, start_time, status, type } = validationResult.data;

    if (!title || !start_time) {
      let errorResponse: NextResponse<any> = setCorsHeaders(request, NextResponse.json(
        { error: 'Title and start time are required' },
        { status: 400 }
      ));
      return errorResponse;
    }

    const { data, error } = await supabase
      .from('workshops')
      .insert([{
        host_id: user.id,
        title,
        description,
        start_time,
        status: status || 'SCHEDULED',
        type: type || 'VIDEO'
      }])
      .select()
      .single()

    if (error) {
      logger.error('Error creating workshop', error)
      let errorResponse: NextResponse<any> = setCorsHeaders(request, NextResponse.json(
        { error: 'Failed to create workshop' },
        { status: 500 }
      ));
      return errorResponse;
    }

    let successResponse: NextResponse<any> = setCorsHeaders(request, NextResponse.json(data, { status: 201 }));
    return successResponse;
  } catch (error) {
    logger.error('Error creating workshop', error)
    let errorResponse: NextResponse<any> = setCorsHeaders(request, NextResponse.json(
      { error: 'Failed to create workshop' },
      { status: 500 }
    ));
    return errorResponse;
  }
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(request, response);
}
