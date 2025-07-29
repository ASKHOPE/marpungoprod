import { MongoClient, ObjectId } from 'mongodb';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'ngonpo1'; // Replace with your actual DB name

interface Event {
    _id?: ObjectId;
    id: string; // Using string ID for simplicity in raw data linking
    title: string;
    date: string; // ISO date string
    time: string;
    location: string;
    organizer: string;
    description: string;
    fullDescription?: string;
    image?: string;
    imageHint?: string;
    altText?: string;
    maxAttendees?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

interface VolunteerOpportunity {
    _id?: ObjectId;
    id: string; // Using string ID for simplicity in raw data linking
    title: string;
    commitment: string;
    location: string;
    skills: string;
    description: string;
    image?: string;
    imageHint?: string;
    altText?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface ContactMessage {
    _id?: ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    subject: string;
    message: string;
    submittedAt: Date;
}

interface EventRegistration {
    _id?: ObjectId;
    eventId: string; // Link to Event using string ID
    eventTitle: string; // Denormalized title for easier display
    fullName: string;
    email: string;
    attendees: number;
    registeredAt: Date;
}

interface VolunteerApplication {
    _id?: ObjectId;
    opportunityId: string; // Link to VolunteerOpportunity using string ID
    opportunityTitle: string; // Denormalized title
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    interestReason: string;
    skills?: string;
    submittedAt: Date;
}

const eventsRaw: Omit<Event, '_id' | 'createdAt' | 'updatedAt'>[] = [
    {
        id: 'community-clean-up-day',
        title: 'Annual Community Park Clean-Up',
        date: new Date('2024-09-15T09:00:00Z').toISOString(),
        time: '9:00 AM - 12:00 PM',
        location: 'Central City Park',
        organizer: 'Local Environmental Group',
        description: 'Help us keep our park clean and beautiful!',
        fullDescription: 'Join volunteers from across the city to remove litter and debris from Central City Park. Gloves, bags, and tools will be provided. Please wear sturdy shoes and sun protection.',
        image: '/images/park-cleanup.jpg',
        imageHint: 'volunteers cleaning park',
        altText: 'Volunteers picking up trash in a park',
        maxAttendees: 100,
    },
    {
        id: 'skill-building-workshop',
        title: 'Digital Literacy Workshop for Seniors',
        date: new Date('2024-10-01T14:00:00Z').toISOString(),
        time: '2:00 PM - 4:00 PM',
        location: 'Community Learning Center - Room 3',
        organizer: 'Tech for All Initiative',
        description: 'Learn basic computer and internet skills in a friendly environment.',
        fullDescription: 'This workshop is designed for seniors who want to get more comfortable using computers, email, and the internet. Bring your own laptop or tablet, or use one of ours. Registration required.',
        image: '/images/digital-literacy.jpg',
        imageHint: 'senior using computer',
        altText: 'Senior person using a laptop',
        maxAttendees: 30,
    },
];

const volunteerOpportunitiesRaw: Omit<VolunteerOpportunity, '_id' | 'createdAt' | 'updatedAt'>[] = [
    {
        id: 'food-bank-volunteer',
        title: 'Food Bank Distribution Assistant',
        commitment: 'Wednesdays, 10:00 AM - 1:00 PM',
        location: 'City Food Bank',
        skills: 'Friendly, ability to lift moderate weight, organized',
        description: 'Assist with sorting donations and distributing food to clients.',
        image: '/images/food-bank.jpg',
        imageHint: 'volunteers at food bank',
        altText: 'People working at a food bank',
    },
    {
        id: 'mentor-program',
        title: 'Youth Mentorship Program',
        commitment: '2 hours per week (flexible scheduling)',
        location: 'Various community centers',
        skills: 'Good listener, patient, positive role model',
        description: 'Be a mentor to a young person in need of guidance and support.',
        image: '/images/mentoring.jpg',
        imageHint: 'adult talking to child',
        altText: 'An adult and child talking',
    },
];

const contactMessagesRaw: Omit<ContactMessage, '_id'>[] = [
    {
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice.smith@example.com',
        subject: 'Question about the clean-up event',
        message: 'Hi, I saw the upcoming park clean-up event and was wondering if children can attend.',
        submittedAt: new Date('2024-08-20T10:00:00Z'),
    },
    {
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.j@example.com',
        subject: 'Interested in volunteering',
        message: 'Hello, I\'d like to learn more about the food bank volunteer position.',
        submittedAt: new Date('2024-08-21T14:30:00Z'),
    },
];

const eventRegistrationsRaw: Omit<EventRegistration, '_id'>[] = [
    {
        eventId: 'community-clean-up-day',
        eventTitle: 'Annual Community Park Clean-Up',
        fullName: 'Charlie Brown',
        email: 'charlie.b@example.com',
        attendees: 2,
        registeredAt: new Date('2024-08-22T09:15:00Z'),
    },
    {
        eventId: 'skill-building-workshop',
        eventTitle: 'Digital Literacy Workshop for Seniors',
        fullName: 'Diana Prince',
        email: 'diana.p@example.com',
        attendees: 1,
        registeredAt: new Date('2024-08-22T11:00:00Z'),
    },
];

const volunteerApplicationsRaw: Omit<VolunteerApplication, '_id'>[] = [
    {
        opportunityId: 'food-bank-volunteer',
        opportunityTitle: 'Food Bank Distribution Assistant',
        firstName: 'Ethan',
        lastName: 'Hunt',
        email: 'ethan.h@example.com',
        phone: '555-123-4567',
        interestReason: 'I have free time on Wednesdays and want to help my community.',
        skills: 'Good physical condition, experience with sorting.',
        submittedAt: new Date('2024-08-23T08:00:00Z'),
    },
    {
        opportunityId: 'mentor-program',
        opportunityTitle: 'Youth Mentorship Program',
        firstName: 'Fiona',
        lastName: 'Glenanne',
        email: 'fiona.g@example.com',
        phone: '555-987-6543',
        interestReason: 'I enjoy working with kids and believe in the power of mentorship.',
        skills: 'Patient, good listener, creative.',
        submittedAt: new Date('2024-08-23T10:45:00Z'),
    },
];


async function seedDatabaseRaw() {
    if (!MONGODB_URI) {
        console.error('Error: MONGODB_URI not found in .env.local');
        process.exit(1);
    }

    const client = new MongoClient(MONGODB_URI);

    try {
        console.log('Connecting to MongoDB...');
        await client.connect();
        console.log('Connected to MongoDB successfully!');

        const db = client.db(DB_NAME);

        const collectionsToClear = [
            'events',
            'volunteer_opportunities',
            'contact_messages',
            'event_registrations',
            'volunteer_applications',
        ];

        console.log('Clearing existing data...');
        for (const collName of collectionsToClear) {
            const collection = db.collection(collName);
            const deleteResult = await collection.deleteMany({});
            console.log(`Cleared ${deleteResult.deletedCount} documents from ${collName}.`);
        }
        console.log('Finished clearing data.');

        console.log('Seeding raw data...');

        // Seed Events
        if (eventsRaw.length > 0) {
            const eventsWithTimestamps = eventsRaw.map(event => ({
                ...event,
                createdAt: new Date(),
                updatedAt: new Date(),
            }));
            const result = await db.collection('events').insertMany(eventsWithTimestamps as Event[]);
            console.log(`Seeded ${result.insertedCount} events.`);
        } else {
            console.log('No raw data for events.');
        }

        // Seed Volunteer Opportunities
        if (volunteerOpportunitiesRaw.length > 0) {
             const opportunitiesWithTimestamps = volunteerOpportunitiesRaw.map(opp => ({
                ...opp,
                createdAt: new Date(),
                updatedAt: new Date(),
            }));
            const result = await db.collection('volunteer_opportunities').insertMany(opportunitiesWithTimestamps as VolunteerOpportunity[]);
            console.log(`Seeded ${result.insertedCount} volunteer opportunities.`);
        } else {
             console.log('No raw data for volunteer opportunities.');
        }


        // Seed Contact Messages
         if (contactMessagesRaw.length > 0) {
            const result = await db.collection('contact_messages').insertMany(contactMessagesRaw as ContactMessage[]);
            console.log(`Seeded ${result.insertedCount} contact messages.`);
        } else {
            console.log('No raw data for contact messages.');
        }

        // Seed Event Registrations
        if (eventRegistrationsRaw.length > 0) {
            const result = await db.collection('event_registrations').insertMany(eventRegistrationsRaw as EventRegistration[]);
            console.log(`Seeded ${result.insertedCount} event registrations.`);
        } else {
            console.log('No raw data for event registrations.');
        }


        // Seed Volunteer Applications
        if (volunteerApplicationsRaw.length > 0) {
            const result = await db.collection('volunteer_applications').insertMany(volunteerApplicationsRaw as VolunteerApplication[]);
            console.log(`Seeded ${result.insertedCount} volunteer applications.`);
        } else {
            console.log('No raw data for volunteer applications.');
        }


        console.log('Raw database seeding completed successfully!');

    } catch (error) {
        console.error('Error during raw database seeding:', error);
        process.exit(1);
    } finally {
        await client.close();
        console.log('MongoDB connection closed.');
    }
}

// Execute the seeding function
seedDatabaseRaw();