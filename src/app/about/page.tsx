
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Zap, Heart, Briefcase } from 'lucide-react'; // Updated icons

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <section className="text-center mb-16">
        <h1 className="text-5xl font-headline font-bold text-primary mb-4">About Marpu NGO</h1>
        <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
          Marpu NGO is passionately dedicated to fostering a vibrant global community committed to positive social impact, education, and collective, meaningful action.
        </p>
      </section>

      <section className="mb-16">
        <Image
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Diverse group of people collaborating on a community project"
          width={1200}
          height={500}
          className="rounded-lg shadow-xl object-cover w-full"
          data-ai-hint="team community"
        />
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-headline font-semibold text-primary mb-8 text-center">Our Core Values</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <Zap className="w-12 h-12 text-accent mx-auto mb-4" />
              <CardTitle className="text-primary font-headline">Lasting Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/70">
                We champion innovative and enduring solutions that empower individuals and communities, creating sustainable improvements for generations to come.
              </p>
            </CardContent>
          </Card>
          <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="w-12 h-12 text-accent mx-auto mb-4" />
              <CardTitle className="text-primary font-headline">Community Empowerment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/70">
                We believe fervently in the power of collective effort, bringing together diverse individuals, local groups, and organizations to create meaningful and widespread positive change.
              </p>
            </CardContent>
          </Card>
          <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <Heart className="w-12 h-12 text-accent mx-auto mb-4" />
              <CardTitle className="text-primary font-headline">Compassionate Action</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/70">
                We empower and inspire tangible, on-the-ground actions driven by empathy, providing accessible resources and unwavering support for everyone to contribute effectively.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bg-secondary py-12 rounded-lg shadow-md">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-headline font-semibold text-primary mb-6 text-center">Our Story</h2>
          <div className="max-w-2xl mx-auto text-foreground/80 space-y-4 text-justify">
            <p>
              Marpu NGO was founded with a simple yet profound vision: to make impactful social action accessible, engaging, and effective for everyone. We observed a world brimming with passionate individuals eager to make a difference, yet often lacking the necessary connections, resources, or clear pathways to do so effectively.
            </p>
            <p>
              Our platform was born out of a deep-seated desire to bridge this gap. We strive to be the central, dynamic hub where conscious citizens, grassroots local groups, and larger organizations can find each other, share innovative ideas, and collaborate on projects that actively uplift, support, and restore our communities.
            </p>
            <p>
              From local support drives and ambitious development initiatives to comprehensive educational workshops and vital advocacy campaigns, Marpu NGO provides the essential tools, robust support, and collaborative network needed to turn individual passion into palpable, collective impact. Join us on this vital journey to build a more equitable, compassionate, and resilient world—one connection, one action, one community at a time.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
