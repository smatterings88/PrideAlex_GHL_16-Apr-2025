import { NextResponse, NextRequest } from 'next/server';

interface GHLContact {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  tags?: string[];
}

async function createGHLContact(contact: GHLContact) {
  const GHL_API_KEY = process.env.GHL_API_KEY;
  const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
  
  if (!GHL_API_KEY || !GHL_LOCATION_ID) {
    throw new Error('GHL configuration missing');
  }

  const response = await fetch(`https://rest.gohighlevel.com/v1/contacts/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GHL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      locationId: GHL_LOCATION_ID,
      email: contact.email,
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      phone: contact.phone || '',
      tags: contact.tags || [],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`GHL API Error: ${error.message || 'Unknown error'}`);
  }

  return response.json();
}

export async function POST(request: NextRequest) {
  try {
    const contact: GHLContact = await request.json();
    
    if (!contact.email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const result = await createGHLContact({
      ...contact,
      tags: ['Started PrideAlex Trial'],
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating GHL contact:', error);
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    );
  }
}