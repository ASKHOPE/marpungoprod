
import { MongoClient, ObjectId } from 'mongodb';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'ngonpo1'; 

interface Event {
    _id?: ObjectId;
    id: string; 
    title: string;
    date: string; 
    time: string;
    location: string;
    organizer: string;
    description: string;
    fullDescription?: string;
    image?: string;
    imageHint?: string;
    altText?: string;
    maxAttendees?: number;
    isArchived?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

interface VolunteerOpportunity {
    _id?: ObjectId;
    id: string; 
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
    isRead?: boolean;
    status?: 'active' | 'archived' | 'spam';
    updatedAt?: Date;
}

interface EventRegistration {
    _id?: ObjectId;
    eventId: string; 
    eventTitle: string; 
    fullName: string;
    email: string;
    attendees: number;
    registeredAt: Date;
}

interface VolunteerApplication {
    _id?: ObjectId;
    opportunityId: string; 
    opportunityTitle: string; 
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    interestReason: string;
    skills?: string;
    availability?: string;
    submittedAt: Date;
    status?: 'pending' | 'reviewed' | 'accepted' | 'rejected';
    notes?: string;
    updatedAt?: Date;
}

interface Project {
  _id?: ObjectId;
  slug: string;
  title: string;
  description: string;
  longDescription?: string;
  image: string;
  imageHint: string;
  altText: string;
  goalAmount: number;
  currentAmount: number;
  status: 'active' | 'funded' | 'archived';
  startDate?: Date;
  endDate?: Date;
  stripeProductId?: string;
  stripePriceId?: string;
  stripePaymentLinkUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}


const eventsRaw: Omit<Event, '_id' | 'createdAt' | 'updatedAt'>[] = [
    {
        id: 'community-clean-up-day-past',
        title: 'Past Community Park Clean-Up',
        date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(), 
        time: '9:00 AM - 12:00 PM',
        location: 'Central City Park (Past Event)',
        organizer: 'Local Environmental Group',
        description: 'This was a successful past clean-up event!',
        fullDescription: 'Volunteers removed a significant amount of litter. Thanks to everyone who participated!',
        image: 'https://placehold.co/600x400.png',
        imageHint: 'volunteers cleaning park',
        altText: 'Volunteers picking up trash in a park',
        maxAttendees: 100,
        isArchived: false,
    },
    {
        id: 'skill-building-workshop-upcoming',
        title: 'Upcoming Digital Literacy Workshop',
        date: new Date(new Date().setDate(new Date().getDate() + 60)).toISOString(),
        time: '2:00 PM - 4:00 PM',
        location: 'Community Learning Center - Room 3 (Upcoming)',
        organizer: 'Tech for All Initiative',
        description: 'Learn basic computer and internet skills in a friendly environment. Join us next year!',
        fullDescription: 'This workshop is designed for seniors who want to get more comfortable using computers, email, and the internet. Registration will open closer to the date.',
        image: 'https://placehold.co/600x400.png',
        imageHint: 'senior using computer',
        altText: 'Senior person using a laptop',
        maxAttendees: 30,
        isArchived: false,
    },
    {
        id: 'todays-eco-fair',
        title: 'Today\'s Eco Fair Extravaganza',
        date: new Date().toISOString(), 
        time: '10:00 AM - 5:00 PM',
        location: 'Town Square Green',
        organizer: 'EcoConnect Central',
        description: 'Join us for a fun-filled day of eco-activities, stalls, and music!',
        fullDescription: 'Our annual Eco Fair is happening today! Explore local green businesses, learn about sustainability, enjoy live music, and participate in workshops. Fun for the whole family.',
        image: 'https://placehold.co/600x400.png',
        imageHint: 'outdoor fair people',
        altText: 'Crowd at an outdoor eco fair',
        maxAttendees: 500,
        isArchived: false,
    },
     {
        id: 'archived-tree-planting-2022',
        title: 'Archived: Grand Tree Planting 2022',
        date: new Date('2022-04-22T09:00:00Z').toISOString(), 
        time: '9:00 AM - 3:00 PM',
        location: 'Willow Creek (Archived)',
        organizer: 'Old Growth Society',
        description: 'A major tree planting initiative from 2022, now archived.',
        fullDescription: 'This event saw over 5000 trees planted. Records kept for historical purposes.',
        image: 'https://placehold.co/600x400.png',
        imageHint: 'tree planting history',
        altText: 'Historical photo of tree planting',
        maxAttendees: 1000,
        isArchived: true,
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
        image: 'https://placehold.co/600x400.png',
        imageHint: 'volunteers food bank',
        altText: 'People working at a food bank',
    },
    {
        id: 'mentor-program',
        title: 'Youth Mentorship Program',
        commitment: '2 hours per week (flexible scheduling)',
        location: 'Various community centers',
        skills: 'Good listener, patient, positive role model',
        description: 'Be a mentor to a young person in need of guidance and support.',
        image: 'https://placehold.co/600x400.png',
        imageHint: 'adult child talking',
        altText: 'An adult and child talking',
    },
];

const contactMessagesRaw: Omit<ContactMessage, '_id' | 'updatedAt'>[] = [
    {
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice.smith@example.com',
        subject: 'Question about the clean-up event',
        message: 'Hi, I saw the upcoming park clean-up event and was wondering if children can attend.',
        submittedAt: new Date('2024-08-20T10:00:00Z'),
        isRead: false,
        status: 'active',
    },
    {
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob.j@example.com',
        subject: 'Interested in volunteering',
        message: 'Hello, I\'d like to learn more about the food bank volunteer position.',
        submittedAt: new Date('2024-08-21T14:30:00Z'),
        isRead: true,
        status: 'active',
    },
     {
        firstName: 'Carol',
        lastName: 'Davis',
        email: 'carol.d@example.com',
        subject: 'Partnership Proposal',
        message: 'We are a local business interested in partnering with EcoConnect for sustainability initiatives.',
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), 
        isRead: false,
        status: 'active',
    },
    {
        firstName: 'David',
        lastName: 'Wilson',
        email: 'david.w@example.com',
        subject: 'Feedback on website',
        message: 'Great website! Very informative and easy to navigate.',
        submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), 
        isRead: true,
        status: 'archived',
    },
    {
        firstName: 'Spam',
        lastName: 'McSpammerson',
        email: 'spam@example.com',
        subject: 'URGENT: WIN BIG MONEY!!!',
        message: 'Click here to claim your prize! Limited time offer!',
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        isRead: false,
        status: 'spam',
    }
];

const eventRegistrationsRaw: Omit<EventRegistration, '_id'>[] = [
    {
        eventId: 'skill-building-workshop-upcoming',
        eventTitle: 'Upcoming Digital Literacy Workshop',
        fullName: 'Charlie Brown',
        email: 'charlie.b@example.com',
        attendees: 2,
        registeredAt: new Date('2024-08-22T09:15:00Z'),
    },
    {
        eventId: 'community-clean-up-day-past',
        eventTitle: 'Past Community Park Clean-Up',
        fullName: 'Diana Prince',
        email: 'diana.p@example.com',
        attendees: 1,
        registeredAt: new Date('2023-08-22T11:00:00Z'),
    },
];

const volunteerApplicationsRaw: Omit<VolunteerApplication, '_id' | 'updatedAt'>[] = [
    {
        opportunityId: 'food-bank-volunteer',
        opportunityTitle: 'Food Bank Distribution Assistant',
        firstName: 'Ethan',
        lastName: 'Hunt',
        email: 'ethan.h@example.com',
        phone: '555-123-4567',
        interestReason: 'I have free time on Wednesdays and want to help my community.',
        skills: 'Good physical condition, experience with sorting.',
        availability: 'Wednesdays AM',
        submittedAt: new Date('2024-08-23T08:00:00Z'),
        status: 'pending',
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
        availability: 'Weekends',
        submittedAt: new Date('2024-08-23T10:45:00Z'),
        status: 'accepted',
    },
    {
        opportunityId: 'food-bank-volunteer',
        opportunityTitle: 'Food Bank Distribution Assistant',
        firstName: 'George',
        lastName: 'Lucas',
        email: 'george.l@example.com',
        phone: '555-222-3333',
        interestReason: 'Looking for ways to contribute locally.',
        skills: 'Team player.',
        availability: 'Flexible',
        submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), 
        status: 'reviewed',
    },
    {
        opportunityId: 'mentor-program',
        opportunityTitle: 'Youth Mentorship Program',
        firstName: 'Helen',
        lastName: 'Troy',
        email: 'helen.t@example.com',
        phone: '555-444-5555',
        interestReason: 'Passionate about youth development.',
        skills: 'Teaching experience.',
        availability: 'Weekday evenings',
        submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        status: 'rejected',
    }
];

const projectsRaw: Omit<Project, '_id' | 'createdAt' | 'updatedAt' | 'stripeProductId' | 'stripePriceId' | 'stripePaymentLinkUrl'>[] = [
    {
        slug: 'save-the-mangroves',
        title: 'Save the Mangroves Initiative',
        description: 'Help us protect and restore vital mangrove ecosystems which are crucial for coastal protection and biodiversity.',
        longDescription: 'Mangrove forests are disappearing at an alarming rate. This project focuses on planting new mangrove saplings, cleaning up existing mangrove habitats, and educating local communities about the importance of these unique ecosystems. Your donation will fund sapling nurseries, cleanup tools, and educational materials.',
        image: 'https://placehold.co/600x300.png',
        imageHint: 'mangrove forest water',
        altText: 'A lush mangrove forest with roots in the water',
        goalAmount: 15000,
        currentAmount: 7250,
        status: 'active',
        startDate: new Date('2024-07-01T00:00:00Z'),
        endDate: new Date('2025-06-30T00:00:00Z'),
        // Stripe fields will be auto-generated if created via admin, or left blank for seed
    },
    {
        slug: 'urban-community-garden',
        title: 'Urban Community Garden Build',
        description: 'Support the creation of a new community garden in an underserved urban neighborhood to promote local food security.',
        longDescription: 'We are transforming a vacant lot into a thriving community garden. This space will provide fresh produce for local residents, offer gardening education, and create a green oasis in the city. Funds will go towards soil, seeds, tools, irrigation systems, and workshop facilitation.',
        image: 'https://placehold.co/600x300.png',
        imageHint: 'community garden people',
        altText: 'People working together in a community garden',
        goalAmount: 8000,
        currentAmount: 3500,
        status: 'active',
        startDate: new Date('2024-09-01T00:00:00Z'),
    },
    {
        slug: 'river-cleanup-2023',
        title: 'River Cleanup 2023 (Funded)',
        description: 'Our annual river cleanup event was successfully funded and completed last year!',
        longDescription: 'Thanks to generous donors, we removed over 2 tons of trash from the Willow Creek river last year. This project is now complete and marked as funded.',
        image: 'https://placehold.co/600x300.png',
        imageHint: 'river clean people',
        altText: 'Volunteers cleaning a river bank',
        goalAmount: 5000,
        currentAmount: 5500,
        status: 'funded',
        endDate: new Date('2023-10-31T00:00:00Z'),
    },
    {
        slug: 'old-archive-project',
        title: 'Old Archived Project',
        description: 'This project from a while ago is now archived.',
        longDescription: 'Details about an old project that is no longer active and has been archived for historical record.',
        image: 'https://placehold.co/600x300.png',
        imageHint: 'archive document paper',
        altText: 'An old document representing an archived project',
        goalAmount: 10000,
        currentAmount: 10000,
        status: 'archived',
    }
];


async function seedDatabaseRaw() {
    if (!MONGODB_URI) {
        console.error('Error: MONGODB_URI not found in .env.local');
        process.exit(1);
    }
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn('Warning: STRIPE_SECRET_KEY not found. Seeded projects will not have Stripe resources automatically created by this script.');
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
            'projects',
        ];

        console.log('Clearing existing data...');
        for (const collName of collectionsToClear) {
            const collection = db.collection(collName);
            const deleteResult = await collection.deleteMany({});
            console.log(`Cleared ${deleteResult.deletedCount} documents from ${collName}.`);
        }
        console.log('Finished clearing data.');

        console.log('Seeding raw data...');

        if (eventsRaw.length > 0) {
            const eventsWithTimestamps = eventsRaw.map(event => ({
                ...event,
                isArchived: event.isArchived === undefined ? false : event.isArchived,
                createdAt: new Date(),
                updatedAt: new Date(),
            }));
            const result = await db.collection('events').insertMany(eventsWithTimestamps as any[]);
            console.log(`Seeded ${result.insertedCount} events.`);
        }

        if (volunteerOpportunitiesRaw.length > 0) {
             const opportunitiesWithTimestamps = volunteerOpportunitiesRaw.map(opp => ({
                ...opp,
                createdAt: new Date(),
                updatedAt: new Date(),
            }));
            const result = await db.collection('volunteer_opportunities').insertMany(opportunitiesWithTimestamps as any[]);
            console.log(`Seeded ${result.insertedCount} volunteer opportunities.`);
        }


         if (contactMessagesRaw.length > 0) {
            const messagesToInsert = contactMessagesRaw.map(msg => ({
                ...msg,
                isRead: msg.isRead === undefined ? false : msg.isRead, 
                status: msg.status || 'active',
                updatedAt: new Date(),
            }));
            const result = await db.collection('contact_messages').insertMany(messagesToInsert as any[]);
            console.log(`Seeded ${result.insertedCount} contact messages.`);
        }

        if (eventRegistrationsRaw.length > 0) {
            const result = await db.collection('event_registrations').insertMany(eventRegistrationsRaw as any[]);
            console.log(`Seeded ${result.insertedCount} event registrations.`);
        }

        if (volunteerApplicationsRaw.length > 0) {
             const applicationsToInsert = volunteerApplicationsRaw.map(app => ({
                ...app,
                status: app.status || 'pending', 
                updatedAt: new Date(),
            }));
            const result = await db.collection('volunteer_applications').insertMany(applicationsToInsert as any[]);
            console.log(`Seeded ${result.insertedCount} volunteer applications.`);
        }

        if (projectsRaw.length > 0) {
            // For seed, we won't auto-create Stripe entities.
            // They will be created if a project is added via the admin UI.
            // Seeded projects will initially not have stripe IDs/links.
            const projectsWithTimestamps = projectsRaw.map(project => ({
                ...project,
                stripeProductId: undefined,
                stripePriceId: undefined,
                stripePaymentLinkUrl: undefined,
                createdAt: new Date(),
                updatedAt: new Date(),
            }));
            const result = await db.collection('projects').insertMany(projectsWithTimestamps as any[]);
            console.log(`Seeded ${result.insertedCount} projects.`);
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

seedDatabaseRaw();
